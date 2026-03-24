/**
 * @contract FR-004, BR-010, BR-011, DATA-003
 *
 * Use Case: Deprecate Process Cycle (PUBLISHED → DEPRECATED).
 * - Only PUBLISHED cycles can be deprecated (BR-010)
 * - Existing active instances continue normally (BR-011)
 * - New instances blocked in MOD-006 (BR-011)
 * - Emits process_modeling.cycle.deprecated domain event
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

export interface DeprecateCycleInput {
  readonly id: string;
  readonly tenantId: string;
  readonly deprecatedBy: string;
  readonly correlationId: string;
}

export interface DeprecateCycleOutput {
  readonly id: string;
  readonly codigo: string;
  readonly version: number;
  readonly status: 'DEPRECATED';
}

export class DeprecateCycleUseCase {
  constructor(
    private readonly cycleRepo: ProcessCycleRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: DeprecateCycleInput): Promise<DeprecateCycleOutput> {
    const existing = await this.cycleRepo.findById(input.id);
    if (!existing) {
      throw new EntityNotFoundError('ProcessCycle', input.id);
    }

    const cycle = new ProcessCycle(existing);

    if (!cycle.isPublished()) {
      throw new Error('Somente ciclos publicados podem ser depreciados.');
    }

    // BR-010: PUBLISHED → DEPRECATED
    cycle.transitionTo('DEPRECATED');

    const updatedProps = {
      ...existing,
      status: 'DEPRECATED' as const,
      updatedAt: new Date(),
    };

    await this.uow.transaction(async (tx) => {
      await this.cycleRepo.update(updatedProps, tx);

      await this.eventRepo.create(
        createProcessEvent({
          eventType: PROCESS_EVENT_TYPES.CYCLE_DEPRECATED,
          entityType: 'process_cycle',
          entityId: input.id,
          tenantId: input.tenantId,
          createdBy: input.deprecatedBy,
          correlationId: input.correlationId,
          payload: {
            id: input.id,
            codigo: existing.codigo,
            version: existing.version,
          },
        }),
        tx,
      );
    });

    return {
      id: input.id,
      codigo: existing.codigo,
      version: existing.version,
      status: 'DEPRECATED',
    };
  }
}
