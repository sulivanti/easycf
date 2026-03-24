/**
 * @contract FR-005, BR-001, BR-005, BR-006, BR-012, DATA-003
 *
 * Use Cases: Create, Update, Delete Macro-stages.
 * - Only DRAFT cycles allow mutations (BR-001)
 * - codigo immutable after creation (BR-006)
 * - Automatic contiguous reordering on insert/delete (BR-012)
 * - Delete blocked if macro-stage has active stages (BR-005)
 */

import { ProcessCycle } from '../../domain/aggregates/process-cycle.js';
import {
  createProcessEvent,
  PROCESS_EVENT_TYPES,
} from '../../domain/domain-events/process-events.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type { MacroStageProps } from '../../domain/entities/macro-stage.js';
import type { ProcessCycleRepository, ProcessMacroStageRepository } from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';
import type { HashUtilService } from '../../../foundation/application/ports/services.js';

// ── Create ────────────────────────────────────────────────────────────

export interface CreateMacroStageInput {
  readonly cycleId: string;
  readonly tenantId: string;
  readonly codigo: string;
  readonly nome: string;
  readonly ordem: number;
  readonly createdBy: string;
  readonly correlationId: string;
}

export interface MacroStageOutput {
  readonly id: string;
  readonly cycleId: string;
  readonly codigo: string;
  readonly nome: string;
  readonly ordem: number;
}

export class CreateMacroStageUseCase {
  constructor(
    private readonly cycleRepo: ProcessCycleRepository,
    private readonly macroStageRepo: ProcessMacroStageRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
  ) {}

  async execute(input: CreateMacroStageInput): Promise<MacroStageOutput> {
    const cycleProps = await this.cycleRepo.findById(input.cycleId);
    if (!cycleProps) {
      throw new EntityNotFoundError('ProcessCycle', input.cycleId);
    }

    // BR-001: Only DRAFT cycles
    const cycle = new ProcessCycle(cycleProps);
    cycle.assertMutable();

    const id = this.hashUtil.generateUuid();
    const now = new Date();

    const props: MacroStageProps = {
      id,
      cycleId: input.cycleId,
      codigo: input.codigo.trim(),
      nome: input.nome.trim(),
      ordem: input.ordem,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    await this.uow.transaction(async (tx) => {
      await this.macroStageRepo.create(props, tx);
      // BR-012: Reorder to fill gaps
      await this.macroStageRepo.reorder(input.cycleId, tx);

      await this.eventRepo.create(
        createProcessEvent({
          eventType: PROCESS_EVENT_TYPES.MACRO_STAGE_CREATED,
          entityType: 'process_macro_stage',
          entityId: id,
          tenantId: input.tenantId,
          createdBy: input.createdBy,
          correlationId: input.correlationId,
          payload: {
            id,
            cycle_id: input.cycleId,
            codigo: props.codigo,
            nome: props.nome,
            ordem: props.ordem,
          },
        }),
        tx,
      );
    });

    return {
      id,
      cycleId: input.cycleId,
      codigo: props.codigo,
      nome: props.nome,
      ordem: props.ordem,
    };
  }
}

// ── Update ────────────────────────────────────────────────────────────

export interface UpdateMacroStageInput {
  readonly id: string;
  readonly tenantId: string;
  readonly nome?: string;
  readonly ordem?: number;
  readonly updatedBy: string;
  readonly correlationId: string;
}

export class UpdateMacroStageUseCase {
  constructor(
    private readonly cycleRepo: ProcessCycleRepository,
    private readonly macroStageRepo: ProcessMacroStageRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: UpdateMacroStageInput): Promise<MacroStageOutput> {
    const existing = await this.macroStageRepo.findById(input.id);
    if (!existing) {
      throw new EntityNotFoundError('ProcessMacroStage', input.id);
    }

    const cycleProps = await this.cycleRepo.findById(existing.cycleId);
    if (!cycleProps) {
      throw new EntityNotFoundError('ProcessCycle', existing.cycleId);
    }
    new ProcessCycle(cycleProps).assertMutable();

    const changedFields: Record<string, { before: unknown; after: unknown }> = {};
    const updated = { ...existing, updatedAt: new Date() };

    if (input.nome !== undefined && input.nome !== existing.nome) {
      changedFields.nome = { before: existing.nome, after: input.nome };
      updated.nome = input.nome;
    }
    if (input.ordem !== undefined && input.ordem !== existing.ordem) {
      changedFields.ordem = { before: existing.ordem, after: input.ordem };
      updated.ordem = input.ordem;
    }

    if (Object.keys(changedFields).length === 0) {
      return {
        id: existing.id,
        cycleId: existing.cycleId,
        codigo: existing.codigo,
        nome: existing.nome,
        ordem: existing.ordem,
      };
    }

    await this.uow.transaction(async (tx) => {
      await this.macroStageRepo.update(updated, tx);
      if (changedFields.ordem) {
        await this.macroStageRepo.reorder(existing.cycleId, tx);
      }

      await this.eventRepo.create(
        createProcessEvent({
          eventType: PROCESS_EVENT_TYPES.MACRO_STAGE_UPDATED,
          entityType: 'process_macro_stage',
          entityId: input.id,
          tenantId: input.tenantId,
          createdBy: input.updatedBy,
          correlationId: input.correlationId,
          payload: { id: input.id, cycle_id: existing.cycleId, changed_fields: changedFields },
        }),
        tx,
      );
    });

    return {
      id: updated.id,
      cycleId: updated.cycleId,
      codigo: updated.codigo,
      nome: updated.nome,
      ordem: updated.ordem,
    };
  }
}

// ── Delete ────────────────────────────────────────────────────────────

export interface DeleteMacroStageInput {
  readonly id: string;
  readonly tenantId: string;
  readonly deletedBy: string;
  readonly correlationId: string;
}

export class DeleteMacroStageUseCase {
  constructor(
    private readonly cycleRepo: ProcessCycleRepository,
    private readonly macroStageRepo: ProcessMacroStageRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: DeleteMacroStageInput): Promise<void> {
    const existing = await this.macroStageRepo.findById(input.id);
    if (!existing) {
      throw new EntityNotFoundError('ProcessMacroStage', input.id);
    }

    const cycleProps = await this.cycleRepo.findById(existing.cycleId);
    if (!cycleProps) {
      throw new EntityNotFoundError('ProcessCycle', existing.cycleId);
    }
    new ProcessCycle(cycleProps).assertMutable();

    // BR-005: Block if has active stages
    const hasStages = await this.macroStageRepo.hasActiveStages(input.id);
    if (hasStages) {
      throw new Error('Desative os estágios antes de remover a macroetapa.');
    }

    await this.uow.transaction(async (tx) => {
      await this.macroStageRepo.softDelete(input.id, tx);
      // BR-012: Reorder remaining
      await this.macroStageRepo.reorder(existing.cycleId, tx);

      await this.eventRepo.create(
        createProcessEvent({
          eventType: PROCESS_EVENT_TYPES.MACRO_STAGE_DELETED,
          entityType: 'process_macro_stage',
          entityId: input.id,
          tenantId: input.tenantId,
          createdBy: input.deletedBy,
          correlationId: input.correlationId,
          payload: {
            id: input.id,
            cycle_id: existing.cycleId,
            codigo: existing.codigo,
            nome: existing.nome,
          },
        }),
        tx,
      );
    });
  }
}
