/**
 * @contract FR-007, BR-005, BR-006, BR-011, DATA-003
 *
 * Use Case: Update Role (with full scope replacement)
 * BR-006: PUT replaces ALL scopes (DELETE + INSERT), never append.
 * BR-011: Invalidates Redis cache after mutation.
 */

import { Role } from '../../../domain/entities/role.entity.js';
import { Scope } from '../../../domain/value-objects/scope.vo.js';
import { EntityNotFoundError } from '../../../domain/errors/domain-errors.js';
import { createFoundationEvent } from '../../../domain/events/foundation-events.js';
import type {
  RoleRepository,
  DomainEventRepository,
  UnitOfWork,
} from '../../ports/repositories.js';
import type { CacheService } from '../../ports/services.js';

export interface UpdateRoleInput {
  readonly roleId: string;
  readonly name?: string;
  readonly description?: string | null;
  readonly scopes: readonly string[];
  readonly updatedBy: string;
  readonly correlationId: string;
}

export class UpdateRoleUseCase {
  constructor(
    private readonly roleRepo: RoleRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly cache: CacheService,
  ) {}

  async execute(input: UpdateRoleInput): Promise<void> {
    const roleProps = await this.roleRepo.findById(input.roleId);
    if (!roleProps) {
      throw new EntityNotFoundError('Role', input.roleId);
    }

    const role = Role.fromPersistence(roleProps);

    // Validate new scopes (BR-005)
    const newScopes = input.scopes.map((s) => Scope.create(s));
    const updated = role
      .replaceScopes(newScopes)
      .update({ name: input.name, description: input.description });

    await this.uow.transaction(async (tx) => {
      await this.roleRepo.update(updated.toProps(), tx);

      // BR-006: Full replacement
      await this.roleRepo.replaceScopes(input.roleId, updated.scopeValues, tx);

      await this.eventRepo.create(
        createFoundationEvent({
          tenantId: '',
          entityType: 'role',
          entityId: input.roleId,
          eventType: 'role.updated',
          payload: { scopes_count: newScopes.length },
          correlationId: input.correlationId,
          createdBy: input.updatedBy,
        }),
        tx,
      );
    });

    // BR-011: Invalidate Redis cache (fail silently)
    await this.cache.del(`auth:scopes:role:${input.roleId}`).catch(() => {});
  }
}
