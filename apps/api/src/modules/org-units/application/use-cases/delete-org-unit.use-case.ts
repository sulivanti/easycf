/**
 * @contract FR-001, BR-005, DATA-003
 *
 * Use Case: Soft Delete Organizational Unit
 * Blocked if node has active children (BR-005).
 */

import { OrgUnit } from '../../domain/entities/org-unit.entity.js';
import { ActiveChildrenError } from '../../domain/errors/org-unit-errors.js';
import { createOrgUnitEvent } from '../../domain/events/org-unit-events.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type { OrgUnitRepository } from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';

export interface DeleteOrgUnitInput {
  readonly id: string;
  readonly correlationId: string;
  readonly deletedBy: string | null;
}

export class DeleteOrgUnitUseCase {
  constructor(
    private readonly orgUnitRepo: OrgUnitRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: DeleteOrgUnitInput): Promise<void> {
    const existing = await this.orgUnitRepo.findById(input.id);
    if (!existing) {
      throw new EntityNotFoundError('OrgUnit', input.id);
    }

    const entity = OrgUnit.fromPersistence(existing);

    // Already deleted — idempotent
    if (entity.isDeleted) return;

    // BR-005: Check for active children
    const activeChildrenIds = await this.orgUnitRepo.findActiveChildrenIds(input.id);
    if (activeChildrenIds.length > 0) {
      throw new ActiveChildrenError(activeChildrenIds);
    }

    const deleted = entity.softDelete();

    await this.uow.transaction(async (tx) => {
      await this.orgUnitRepo.update(deleted.toProps(), tx);

      await this.eventRepo.create(
        createOrgUnitEvent({
          entityType: 'org_unit',
          entityId: input.id,
          eventType: 'org.unit_deleted',
          payload: {
            id: input.id,
            codigo: deleted.codigo,
            deleted_by: input.deletedBy,
            deleted_at: deleted.deletedAt?.toISOString() ?? null,
          },
          correlationId: input.correlationId,
          createdBy: input.deletedBy,
        }),
        tx,
      );
    });
  }
}
