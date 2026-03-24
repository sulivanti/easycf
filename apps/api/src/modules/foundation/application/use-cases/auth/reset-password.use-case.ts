/**
 * @contract FR-017, BR-013, DATA-003
 *
 * Use Case: Reset Password
 * Validates token (SHA-256 hash match, not expired, not used),
 * updates password, marks token as consumed.
 */

import { User } from '../../../domain/index.js';
import { PasswordResetToken } from '../../../domain/value-objects/password-reset-token.vo.js';
import {
  TokenExpiredError,
  TokenAlreadyUsedError,
  EntityNotFoundError,
} from '../../../domain/errors/domain-errors.js';
import { createFoundationEvent } from '../../../domain/events/foundation-events.js';
import type {
  UserRepository,
  PasswordResetTokenRepository,
  DomainEventRepository,
  UnitOfWork,
} from '../../ports/repositories.js';
import type { PasswordHashService, HashUtilService } from '../../ports/services.js';

export interface ResetPasswordInput {
  readonly token: string;
  readonly newPassword: string;
  readonly correlationId: string;
}

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenRepo: PasswordResetTokenRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashService: PasswordHashService,
    private readonly hashUtil: HashUtilService,
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    // Hash the incoming token to find it in DB
    const tokenHash = this.hashUtil.sha256(input.token);

    const tokenProps = await this.tokenRepo.findByHash(tokenHash);
    if (!tokenProps) {
      throw new TokenExpiredError(); // Generic: don't reveal if token exists
    }

    const resetToken = PasswordResetToken.fromPersistence(tokenProps);

    // BR-013: Validate token state
    if (resetToken.isExpired) {
      throw new TokenExpiredError();
    }
    if (resetToken.isUsed) {
      throw new TokenAlreadyUsedError();
    }

    // Load user
    const userProps = await this.userRepo.findById(resetToken.userId);
    if (!userProps) {
      throw new EntityNotFoundError('User', resetToken.userId);
    }

    const user = User.fromPersistence(userProps);
    const newHash = await this.hashService.hash(input.newPassword);
    const updated = user.changePassword(newHash);

    await this.uow.transaction(async (tx) => {
      // Update password
      await this.userRepo.update(updated.toProps(), tx);

      // Mark token as consumed (single-use)
      await this.tokenRepo.markUsed(tokenHash, tx);

      // Emit event
      await this.eventRepo.create(
        createFoundationEvent({
          tenantId: '',
          entityType: 'user',
          entityId: user.id,
          eventType: 'auth.password_reset',
          payload: { user_id: user.id },
          correlationId: input.correlationId,
          createdBy: null,
        }),
        tx,
      );
    });
  }
}
