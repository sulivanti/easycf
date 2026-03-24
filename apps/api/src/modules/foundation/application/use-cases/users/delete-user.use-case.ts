/**
 * @contract FR-006, BR-004, DATA-003
 *
 * Use Case: Delete User (soft delete — LGPD)
 * Sets deletedAt on users + content_users, transitions status to INACTIVE.
 */

import { User } from '../../../domain/index.js';
import { EntityNotFoundError } from '../../../domain/errors/domain-errors.js';
import { createFoundationEvent } from '../../../domain/events/foundation-events.js';
import type {
  UserRepository,
  DomainEventRepository,
  UnitOfWork,
} from '../../ports/repositories.js';

export interface DeleteUserInput {
  readonly userId: string;
  readonly deletedBy: string;
  readonly correlationId: string;
}

export class DeleteUserUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: DeleteUserInput): Promise<void> {
    const userProps = await this.userRepo.findById(input.userId);
    if (!userProps) {
      throw new EntityNotFoundError('User', input.userId);
    }

    const user = User.fromPersistence(userProps);
    const _deleted = user.softDelete();

    await this.uow.transaction(async (tx) => {
      await this.userRepo.softDelete(input.userId, tx);

      await this.eventRepo.create(
        createFoundationEvent({
          tenantId: '',
          entityType: 'user',
          entityId: input.userId,
          eventType: 'user.deleted',
          payload: { user_id: input.userId, codigo: user.codigo },
          correlationId: input.correlationId,
          createdBy: input.deletedBy,
        }),
        tx,
      );
    });
  }
}
