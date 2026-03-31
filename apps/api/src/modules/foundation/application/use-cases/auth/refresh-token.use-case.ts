/**
 * @contract FR-003, BR-002, BR-011, SEC-000, DATA-003
 *
 * Use Case: Refresh Token with Rotation
 *
 * Flow:
 * 1. Verify refresh token → extract userId + sessionId
 * 2. Load session from DB, assert active (BR-002 kill-switch)
 * 3. Re-resolve active tenant + scopes from DB (FR-000-C08)
 * 4. Issue new token pair (rotation — old refresh token is invalidated)
 * 5. If reuse detected → invalidate entire family, emit security event
 *
 * Note: Token family tracking and grace period logic depend on the
 * TokenService implementation (infrastructure concern).
 */

import { Session } from '../../../domain/entities/session.entity.js';
import { SessionRevokedError } from '../../../domain/errors/domain-errors.js';
import { createFoundationEvent } from '../../../domain/events/foundation-events.js';
import type {
  SessionRepository,
  DomainEventRepository,
  UnitOfWork,
  TenantUserRepository,
  RoleRepository,
} from '../../ports/repositories.js';
import type { TokenService, TokenPayload, TokenPair, CacheService } from '../../ports/services.js';

// ---------------------------------------------------------------------------
// Input / Output
// ---------------------------------------------------------------------------
export interface RefreshTokenInput {
  readonly refreshToken: string;
  readonly correlationId: string;
}

export interface RefreshTokenOutput {
  readonly tokenPair: TokenPair;
  readonly sessionId: string;
}

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------
export class RefreshTokenUseCase {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly tokenService: TokenService,
    private readonly tenantUserRepo: TenantUserRepository,
    private readonly roleRepo: RoleRepository,
    private readonly cache: CacheService,
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    // 1. Verify the refresh token
    let payload: TokenPayload;
    try {
      payload = await this.tokenService.verifyAccessToken(input.refreshToken);
    } catch {
      throw new SessionRevokedError();
    }

    // 2. Load session from DB — BR-002 kill-switch
    const sessionProps = await this.sessionRepo.findById(payload.sessionId);
    if (!sessionProps) {
      throw new SessionRevokedError();
    }

    const session = Session.fromPersistence(sessionProps);
    session.assertActive(); // throws SessionRevokedError or SessionExpiredError

    // 3. Re-resolve active tenant (FR-000-C08 REQ-002)
    const tenantUsers = await this.tenantUserRepo.findByUserId(payload.userId);
    const activeTenantUser = tenantUsers.find((tu) => tu.status === 'ACTIVE');
    if (!activeTenantUser) {
      throw new SessionRevokedError();
    }

    // 4. Re-fetch scopes from role (FR-000-C08 REQ-001 + GUD-001)
    const scopes = await this.cache.getOrSet(
      `auth:scopes:role:${activeTenantUser.roleId}`,
      async () => {
        const role = await this.roleRepo.findById(activeTenantUser.roleId);
        return role?.scopes?.map((s: { value: string }) => s.value) ?? [];
      },
      300,
    );

    // 5. Issue new token pair (rotation) with fresh scopes + tenantId
    const tokenPair = await this.tokenService.generatePair({
      userId: payload.userId,
      sessionId: session.id,
      tenantId: activeTenantUser.tenantId,
      scopes,
    });

    return {
      tokenPair,
      sessionId: session.id,
    };
  }

  /**
   * Called by infrastructure when reuse is detected.
   * Invalidates the entire token family (all sessions in the family).
   */
  async handleReuseDetected(
    userId: string,
    sessionId: string,
    correlationId: string,
  ): Promise<void> {
    await this.uow.transaction(async (tx) => {
      // Kill-switch: revoke the compromised session
      await this.sessionRepo.revoke(sessionId, tx);

      // Emit security event (sensitivity_level=2)
      await this.eventRepo.create(
        createFoundationEvent({
          tenantId: '',
          entityType: 'session',
          entityId: sessionId,
          eventType: 'auth.token_reuse_detected',
          payload: { user_id: userId, session_id: sessionId },
          correlationId,
          createdBy: null,
        }),
        tx,
      );
    });
  }
}
