/**
 * @contract FR-001, BR-001, BR-006, DATA-003
 *
 * Use Case: Update Process Cycle (DRAFT only).
 * - PUBLISHED cycles are immutable (BR-001)
 * - codigo field is ignored on updates (BR-006)
 * - Emits process_modeling.cycle.updated domain event
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

export interface UpdateCycleInput {
  readonly id: string;
  readonly tenantId: string;
  readonly nome?: string;
  readonly descricao?: string | null;
  readonly createdBy: string;
  readonly correlationId: string;
}

export interface UpdateCycleOutput {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao: string | null;
  readonly version: number;
  readonly status: string;
}

export class UpdateCycleUseCase {
  constructor(
    private readonly cycleRepo: ProcessCycleRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: UpdateCycleInput): Promise<UpdateCycleOutput> {
    const existing = await this.cycleRepo.findById(input.id);
    if (!existing) {
      throw new EntityNotFoundError('ProcessCycle', input.id);
    }

    const cycle = new ProcessCycle(existing);

    // BR-001: PUBLISHED cycles are immutable
    cycle.assertMutable();

    const changedFields: Record<string, { before: unknown; after: unknown }> = {};

    if (input.nome !== undefined && input.nome !== existing.nome) {
      changedFields.nome = { before: existing.nome, after: input.nome };
    }
    if (input.descricao !== undefined && input.descricao !== existing.descricao) {
      changedFields.descricao = { before: existing.descricao, after: input.descricao };
    }

    if (Object.keys(changedFields).length === 0) {
      return {
        id: existing.id,
        codigo: existing.codigo,
        nome: existing.nome,
        descricao: existing.descricao,
        version: existing.version,
        status: existing.status,
      };
    }

    const updatedProps = {
      ...existing,
      nome: input.nome ?? existing.nome,
      descricao: input.descricao !== undefined ? input.descricao : existing.descricao,
      updatedAt: new Date(),
    };

    await this.uow.transaction(async (tx) => {
      await this.cycleRepo.update(updatedProps, tx);

      await this.eventRepo.create(
        createProcessEvent({
          eventType: PROCESS_EVENT_TYPES.CYCLE_UPDATED,
          entityType: 'process_cycle',
          entityId: input.id,
          tenantId: input.tenantId,
          createdBy: input.createdBy,
          correlationId: input.correlationId,
          payload: { id: input.id, changed_fields: changedFields },
        }),
        tx,
      );
    });

    return {
      id: updatedProps.id,
      codigo: updatedProps.codigo,
      nome: updatedProps.nome,
      descricao: updatedProps.descricao,
      version: updatedProps.version,
      status: updatedProps.status,
    };
  }
}
