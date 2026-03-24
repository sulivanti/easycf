/**
 * @contract FR-004, BR-009, DATA-003
 *
 * Use Case: Restore Soft-Deleted Organizational Unit
 * Parent must be active (or node is N1) — BR-009.
 */

import { OrgUnit } from '../../domain/entities/org-unit.entity.js';
import { InactiveParentError } from '../../domain/errors/org-unit-errors.js';
import { createOrgUnitEvent } from '../../domain/events/org-unit-events.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type { OrgUnitRepository } from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';

export interface RestoreOrgUnitInput {
  readonly id: string;
  readonly correlationId: string;
  readonly restoredBy: string | null;
}

export class RestoreOrgUnitUseCase {
  constructor(
    private readonly orgUnitRepo: OrgUnitRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: RestoreOrgUnitInput): Promise<void> {
    const existing = await this.orgUnitRepo.findById(input.id);
    if (!existing) {
      throw new EntityNotFoundError('OrgUnit', input.id);
    }

    const entity = OrgUnit.fromPersistence(existing);

    // Already active — idempotent
    if (!entity.isDeleted) return;

    // BR-009: Parent must be active (unless N1/root)
    if (!entity.isRoot && entity.parentId) {
      const parent = await this.orgUnitRepo.findById(entity.parentId);
      if (!parent) {
        throw new EntityNotFoundError('OrgUnit (parent)', entity.parentId);
      }
      if (parent.deletedAt !== null) {
        throw new InactiveParentError();
      }
    }

    const restored = entity.restore();

    await this.uow.transaction(async (tx) => {
      await this.orgUnitRepo.update(restored.toProps(), tx);

      await this.eventRepo.create(
        createOrgUnitEvent({
          entityType: 'org_unit',
          entityId: input.id,
          eventType: 'org.unit_restored',
          payload: {
            id: input.id,
            codigo: restored.codigo,
            restored_by: input.restoredBy,
            restored_at: restored.updatedAt.toISOString(),
          },
          correlationId: input.correlationId,
          createdBy: input.restoredBy,
        }),
        tx,
      );
    });
  }
}
