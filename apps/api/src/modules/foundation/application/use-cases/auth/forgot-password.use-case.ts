/**
 * @contract FR-017, BR-001, BR-013, DATA-003
 *
 * Use Case: Forgot Password
 * Generates UUID token, stores SHA-256 hash, sends email async.
 * Response is always generic (BR-001 — prevents user enumeration).
 */

import { PasswordResetToken } from '../../../domain/value-objects/password-reset-token.vo.js';
import { createFoundationEvent } from '../../../domain/events/foundation-events.js';
import type {
  UserRepository,
  PasswordResetTokenRepository,
  DomainEventRepository,
  UnitOfWork,
} from '../../ports/repositories.js';
import type { HashUtilService, EmailService } from '../../ports/services.js';

export interface ForgotPasswordInput {
  readonly email: string;
  readonly correlationId: string;
}

export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenRepo: PasswordResetTokenRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
    private readonly emailService: EmailService,
  ) {}

  async execute(input: ForgotPasswordInput): Promise<void> {
    // BR-001: Always return success, even if email not found
    const userProps = await this.userRepo.findByEmail(input.email.trim().toLowerCase());
    if (!userProps) {
      return; // Silent success — no user enumeration
    }

    // Generate UUID token and SHA-256 hash (BR-013)
    const plainToken = this.hashUtil.generateUuid();
    const tokenHash = this.hashUtil.sha256(plainToken);

    const resetToken = PasswordResetToken.create(tokenHash, userProps.id);

    await this.uow.transaction(async (tx) => {
      // Invalidate any existing tokens for this user
      await this.tokenRepo.invalidateAllByUserId(userProps.id, tx);

      // Store new token
      await this.tokenRepo.create(
        {
          tokenHash: resetToken.tokenHash,
          userId: resetToken.userId,
          createdAt: resetToken.createdAt,
          expiresAt: resetToken.expiresAt,
          usedAt: null,
        },
        tx,
      );

      // Emit event
      await this.eventRepo.create(
        createFoundationEvent({
          tenantId: '',
          entityType: 'user',
          entityId: userProps.id,
          eventType: 'auth.forgot_password_requested',
          payload: { email_masked: input.email.substring(0, 3) + '***' },
          correlationId: input.correlationId,
          createdBy: null,
        }),
        tx,
      );
    });

    // Send email async (fire-and-forget — BR-001 response is always generic)
    this.emailService
      .sendPasswordReset(userProps.email.value, plainToken, resetToken.expiresAt)
      .catch(() => {});
  }
}
