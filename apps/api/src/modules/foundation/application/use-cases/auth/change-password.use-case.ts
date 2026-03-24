/**
 * @contract FR-005, BR-014, DATA-003
 *
 * Use Case: Change Password (authenticated)
 * Requires current password verification via bcrypt compare (BR-014).
 */

import { User } from '../../../domain/index.js';
import {
  CurrentPasswordMismatchError,
  EntityNotFoundError,
} from '../../../domain/errors/domain-errors.js';
import { createFoundationEvent } from '../../../domain/events/foundation-events.js';
import type {
  UserRepository,
  DomainEventRepository,
  UnitOfWork,
} from '../../ports/repositories.js';
import type { PasswordHashService } from '../../ports/services.js';

export interface ChangePasswordInput {
  readonly userId: string;
  readonly currentPassword: string;
  readonly newPassword: string;
  readonly correlationId: string;
}

export class ChangePasswordUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashService: PasswordHashService,
  ) {}

  async execute(input: ChangePasswordInput): Promise<void> {
    const userProps = await this.userRepo.findById(input.userId);
    if (!userProps) {
      throw new EntityNotFoundError('User', input.userId);
    }

    const user = User.fromPersistence(userProps);

    // BR-014: verify current password
    const match = await this.hashService.compare(input.currentPassword, user.passwordHash);
    if (!match) {
      throw new CurrentPasswordMismatchError();
    }

    const newHash = await this.hashService.hash(input.newPassword);
    const updated = user.changePassword(newHash);

    await this.uow.transaction(async (tx) => {
      await this.userRepo.update(updated.toProps(), tx);

      await this.eventRepo.create(
        createFoundationEvent({
          tenantId: '',
          entityType: 'user',
          entityId: user.id,
          eventType: 'auth.password_changed',
          payload: { user_id: user.id },
          correlationId: input.correlationId,
          createdBy: user.id,
        }),
        tx,
      );
    });
  }
}
