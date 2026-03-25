/**
 * @contract FR-001, BR-001, BR-002, BR-008, BR-010, BR-012, DATA-003
 *
 * Use Case: Login (Native Authentication)
 *
 * Flow:
 * 1. Find user by email (BR-001: generic error if not found)
 * 2. Assert user can authenticate (not BLOCKED/INACTIVE/PENDING)
 * 3. bcrypt compare password
 * 4. If MFA enabled → return temp_token (BR-008)
 * 5. Otherwise → create session, generate tokens, emit event
 */

import { User } from '../../../domain/index.js';
import { Email } from '../../../domain/value-objects/email.vo.js';
import { Session } from '../../../domain/entities/session.entity.js';
import { AuthenticationFailedError } from '../../../domain/errors/domain-errors.js';
import { createFoundationEvent } from '../../../domain/events/foundation-events.js';
import type {
  UserRepository,
  SessionRepository,
  DomainEventRepository,
  UnitOfWork,
  TenantUserRepository,
  RoleRepository,
} from '../../ports/repositories.js';
import type { PasswordHashService, TokenService, TokenPair } from '../../ports/services.js';

// ---------------------------------------------------------------------------
// Input / Output
// ---------------------------------------------------------------------------
export interface LoginInput {
  readonly email: string;
  readonly password: string;
  readonly rememberMe?: boolean;
  readonly deviceFp?: string;
  readonly correlationId: string;
  readonly idempotencyKey?: string;
}

export interface LoginOutput {
  readonly tokenPair: TokenPair;
  readonly user: {
    readonly id: string;
    readonly email: string;
    readonly fullName: string;
    readonly status: string;
  };
  readonly sessionId: string;
}

export interface LoginMfaOutput {
  readonly mfaRequired: true;
  readonly tempToken: string;
  readonly expiresIn: 300;
}

export type LoginResult = LoginOutput | LoginMfaOutput;

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------
export class LoginUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly sessionRepo: SessionRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashService: PasswordHashService,
    private readonly tokenService: TokenService,
    private readonly tenantUserRepo: TenantUserRepository,
    private readonly roleRepo: RoleRepository,
  ) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const emailVo = Email.create(input.email);

    // 1. Find user — BR-001: generic error prevents enumeration
    const userProps = await this.userRepo.findByEmail(emailVo.value);
    if (!userProps) {
      throw new AuthenticationFailedError();
    }

    const user = User.fromPersistence(userProps);

    // 2. Assert user can authenticate
    user.assertCanAuthenticate();

    // 3. Verify password — BR-001: same error for wrong password
    const passwordMatch = await this.hashService.compare(input.password, user.passwordHash);
    if (!passwordMatch) {
      // Emit login_failed event (best-effort, don't block on failure)
      await this.emitLoginFailed(input.correlationId, emailVo.value).catch(() => {});
      throw new AuthenticationFailedError();
    }

    // 4. MFA check — BR-008
    if (user.isMfaEnabled) {
      const tempToken = await this.tokenService.generateTempToken(
        { userId: user.id, scope: 'mfa-only' },
        300,
      );
      return { mfaRequired: true, tempToken, expiresIn: 300 };
    }

    // 5. Resolve active tenant + scopes for JWT (FR-000-C05)
    const tenantUsers = await this.tenantUserRepo.findByUserId(user.id);
    const activeTenantUser = tenantUsers.find((tu) => tu.status === 'ACTIVE');
    if (!activeTenantUser) {
      throw new AuthenticationFailedError();
    }

    const role = await this.roleRepo.findById(activeTenantUser.roleId);
    const scopes = role?.scopes?.map((s: { value: string }) => s.value) ?? [];
    const tenantId = activeTenantUser.tenantId;

    // 6. Create session + tokens in transaction
    return this.uow.transaction(async (tx) => {
      const session = Session.create(user.id, input.rememberMe ?? false, input.deviceFp);
      const created = await this.sessionRepo.create(session.toProps(), tx);

      const tokenPair = await this.tokenService.generatePair({
        userId: user.id,
        sessionId: created.id,
        tenantId,
        scopes,
      });

      // Emit domain events
      await this.eventRepo.create(
        createFoundationEvent({
          tenantId,
          entityType: 'session',
          entityId: created.id,
          eventType: 'auth.login_success',
          payload: {
            user_id: user.id,
            session_id: created.id,
            remember_me: input.rememberMe ?? false,
          },
          correlationId: input.correlationId,
          createdBy: user.id,
        }),
        tx,
      );

      await this.eventRepo.create(
        createFoundationEvent({
          tenantId,
          entityType: 'session',
          entityId: created.id,
          eventType: 'session.created',
          payload: {
            user_id: user.id,
            device_fp: input.deviceFp ?? null,
          },
          correlationId: input.correlationId,
          createdBy: user.id,
        }),
        tx,
      );

      return {
        tokenPair,
        user: {
          id: user.id,
          email: user.email.value,
          fullName: user.profile?.fullName ?? '',
          status: user.status,
        },
        sessionId: created.id,
      };
    });
  }

  private async emitLoginFailed(correlationId: string, identifier: string): Promise<void> {
    await this.eventRepo.create(
      createFoundationEvent({
        tenantId: '',
        entityType: 'session',
        entityId: '00000000-0000-0000-0000-000000000000',
        eventType: 'auth.login_failed',
        payload: { identifier: identifier.substring(0, 3) + '***' },
        correlationId,
        createdBy: null,
      }),
    );
  }
}
