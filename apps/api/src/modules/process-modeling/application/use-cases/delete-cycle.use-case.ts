/**
 * @contract FR-001, BR-005, BR-010, DATA-003
 *
 * Use Case: Soft-delete Process Cycle.
 * - Only DRAFT cycles can be deleted (BR-010)
 * - PUBLISHED → 422 "use DEPRECATED" (BR-005)
 * - Emits process_modeling.cycle.deleted domain event
 */

import { ProcessCycle } from '../../domain/aggregates/process-cycle.js';
import {
  createProcessEvent,
  PROCESS_EVENT_TYPES,
} from '../../domain/domain-events/process-events.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type { ProcessCycleRepository } from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';

export interface DeleteCycleInput {
  readonly id: string;
  readonly tenantId: string;
  readonly deletedBy: string;
  readonly correlationId: string;
}

export class DeleteCycleUseCase {
  constructor(
    private readonly cycleRepo: ProcessCycleRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: DeleteCycleInput): Promise<void> {
    const existing = await this.cycleRepo.findById(input.id);
    if (!existing) {
      throw new EntityNotFoundError('ProcessCycle', input.id);
    }

    const cycle = new ProcessCycle(existing);

    // BR-010/BR-005: Only DRAFT can be soft-deleted
    if (cycle.isPublished()) {
      throw new Error(
        'Somente ciclos em DRAFT podem ser excluídos. Para descontinuar, use DEPRECATED.',
      );
    }
    if (cycle.isDeprecated()) {
      throw new Error('Ciclos depreciados não podem ser excluídos.');
    }

    await this.uow.transaction(async (tx) => {
      await this.cycleRepo.softDelete(input.id, tx);

      await this.eventRepo.create(
        createProcessEvent({
          eventType: PROCESS_EVENT_TYPES.CYCLE_DELETED,
          entityType: 'process_cycle',
          entityId: input.id,
          tenantId: input.tenantId,
          createdBy: input.deletedBy,
          correlationId: input.correlationId,
          payload: {
            id: input.id,
            codigo: existing.codigo,
            nome: existing.nome,
            version: existing.version,
          },
        }),
        tx,
      );
    });
  }
}
