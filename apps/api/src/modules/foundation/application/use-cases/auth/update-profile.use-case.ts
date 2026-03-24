/**
 * @contract FR-004, DATA-003
 *
 * Use Case: Update Profile (PATCH /auth/me)
 * Allows the authenticated user to update their own profile fields.
 */

import { User } from '../../../domain/index.js';
import { EntityNotFoundError } from '../../../domain/errors/domain-errors.js';
import { createFoundationEvent } from '../../../domain/events/foundation-events.js';
import type {
  UserRepository,
  DomainEventRepository,
  UnitOfWork,
} from '../../ports/repositories.js';

export interface UpdateProfileInput {
  readonly userId: string;
  readonly fullName?: string;
  readonly avatarUrl?: string | null;
  readonly correlationId: string;
}

export class UpdateProfileUseCase {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: UpdateProfileInput): Promise<void> {
    const userProps = await this.userRepo.findById(input.userId);
    if (!userProps) {
      throw new EntityNotFoundError('User', input.userId);
    }

    const user = User.fromPersistence(userProps);
    const _updated = user.updateProfile({
      fullName: input.fullName,
      avatarUrl: input.avatarUrl,
    });

    await this.uow.transaction(async (tx) => {
      await this.userRepo.updateProfile(
        input.userId,
        {
          fullName: input.fullName,
          avatarUrl: input.avatarUrl,
        },
        tx,
      );

      await this.eventRepo.create(
        createFoundationEvent({
          tenantId: '',
          entityType: 'user',
          entityId: user.id,
          eventType: 'user.profile_updated',
          payload: {
            fields_changed: Object.keys(input).filter(
              (k) => k !== 'userId' && k !== 'correlationId',
            ),
          },
          correlationId: input.correlationId,
          createdBy: user.id,
        }),
        tx,
      );
    });
  }
}
