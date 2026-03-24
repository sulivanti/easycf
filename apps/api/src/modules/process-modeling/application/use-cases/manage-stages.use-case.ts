/**
 * @contract FR-006, BR-001, BR-002, BR-005, BR-006, BR-012, DATA-003, INT-005 §4.1, ADR-001
 *
 * Use Cases: Create, Update, Delete Stages.
 * - Only DRAFT cycles allow mutations (BR-001)
 * - is_initial unique per cycle (BR-002, ADR-001)
 * - Delete blocked if active instances in MOD-006 (BR-005, ADR-002)
 * - Automatic contiguous reordering on insert/delete (BR-012)
 * - cycle_id populated from macro_stage (ADR-001)
 */

import { ProcessCycle } from '../../domain/aggregates/process-cycle.js';
import {
  createProcessEvent,
  PROCESS_EVENT_TYPES,
} from '../../domain/domain-events/process-events.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type { StageProps } from '../../domain/entities/stage.js';
import type {
  ProcessCycleRepository,
  ProcessMacroStageRepository,
  ProcessStageRepository,
  InstanceCheckerPort,
} from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';
import type { HashUtilService } from '../../../foundation/application/ports/services.js';

// ── Create ────────────────────────────────────────────────────────────

export interface CreateStageInput {
  readonly macroStageId: string;
  readonly tenantId: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao?: string | null;
  readonly ordem: number;
  readonly isInitial?: boolean;
  readonly isTerminal?: boolean;
  readonly canvasX?: number | null;
  readonly canvasY?: number | null;
  readonly createdBy: string;
  readonly correlationId: string;
}

export interface StageOutput {
  readonly id: string;
  readonly macroStageId: string;
  readonly cycleId: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao: string | null;
  readonly ordem: number;
  readonly isInitial: boolean;
  readonly isTerminal: boolean;
  readonly canvasX: number | null;
  readonly canvasY: number | null;
}

export class CreateStageUseCase {
  constructor(
    private readonly cycleRepo: ProcessCycleRepository,
    private readonly macroStageRepo: ProcessMacroStageRepository,
    private readonly stageRepo: ProcessStageRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
  ) {}

  async execute(input: CreateStageInput): Promise<StageOutput> {
    const macroStage = await this.macroStageRepo.findById(input.macroStageId);
    if (!macroStage) {
      throw new EntityNotFoundError('ProcessMacroStage', input.macroStageId);
    }

    const cycleProps = await this.cycleRepo.findById(macroStage.cycleId);
    if (!cycleProps) {
      throw new EntityNotFoundError('ProcessCycle', macroStage.cycleId);
    }
    new ProcessCycle(cycleProps).assertMutable();

    const isInitial = input.isInitial ?? false;

    // BR-002: Only 1 initial stage per cycle
    if (isInitial) {
      const alreadyHasInitial = await this.stageRepo.hasInitialStage(macroStage.cycleId);
      if (alreadyHasInitial) {
        throw new Error(
          'Este ciclo já possui um estágio inicial. Desmarque o atual antes de definir outro.',
        );
      }
    }

    const id = this.hashUtil.generateUuid();
    const now = new Date();

    // ADR-001: cycle_id derived from macro_stage
    const props: StageProps = {
      id,
      macroStageId: input.macroStageId,
      cycleId: macroStage.cycleId,
      codigo: input.codigo.trim(),
      nome: input.nome.trim(),
      descricao: input.descricao ?? null,
      ordem: input.ordem,
      isInitial,
      isTerminal: input.isTerminal ?? false,
      canvasX: input.canvasX ?? null,
      canvasY: input.canvasY ?? null,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    await this.uow.transaction(async (tx) => {
      await this.stageRepo.create(props, tx);
      await this.stageRepo.reorder(input.macroStageId, tx);

      await this.eventRepo.create(
        createProcessEvent({
          eventType: PROCESS_EVENT_TYPES.STAGE_CREATED,
          entityType: 'process_stage',
          entityId: id,
          tenantId: input.tenantId,
          createdBy: input.createdBy,
          correlationId: input.correlationId,
          payload: {
            id,
            macro_stage_id: input.macroStageId,
            codigo: props.codigo,
            nome: props.nome,
            is_initial: props.isInitial,
            is_terminal: props.isTerminal,
          },
        }),
        tx,
      );
    });

    return {
      id,
      macroStageId: props.macroStageId,
      cycleId: props.cycleId,
      codigo: props.codigo,
      nome: props.nome,
      descricao: props.descricao,
      ordem: props.ordem,
      isInitial: props.isInitial,
      isTerminal: props.isTerminal,
      canvasX: props.canvasX,
      canvasY: props.canvasY,
    };
  }
}

// ── Update ────────────────────────────────────────────────────────────

export interface UpdateStageInput {
  readonly id: string;
  readonly tenantId: string;
  readonly nome?: string;
  readonly descricao?: string | null;
  readonly ordem?: number;
  readonly isInitial?: boolean;
  readonly isTerminal?: boolean;
  readonly canvasX?: number | null;
  readonly canvasY?: number | null;
  readonly updatedBy: string;
  readonly correlationId: string;
}

export class UpdateStageUseCase {
  constructor(
    private readonly cycleRepo: ProcessCycleRepository,
    private readonly stageRepo: ProcessStageRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: UpdateStageInput): Promise<StageOutput> {
    const existing = await this.stageRepo.findById(input.id);
    if (!existing) {
      throw new EntityNotFoundError('ProcessStage', input.id);
    }

    const cycleProps = await this.cycleRepo.findById(existing.cycleId);
    if (!cycleProps) {
      throw new EntityNotFoundError('ProcessCycle', existing.cycleId);
    }
    new ProcessCycle(cycleProps).assertMutable();

    // BR-002: If setting is_initial=true, check uniqueness
    if (input.isInitial === true && !existing.isInitial) {
      const alreadyHasInitial = await this.stageRepo.hasInitialStage(existing.cycleId, input.id);
      if (alreadyHasInitial) {
        throw new Error(
          'Este ciclo já possui um estágio inicial. Desmarque o atual antes de definir outro.',
        );
      }
    }

    const changedFields: Record<string, { before: unknown; after: unknown }> = {};
    const updated = { ...existing, updatedAt: new Date() };

    if (input.nome !== undefined && input.nome !== existing.nome) {
      changedFields.nome = { before: existing.nome, after: input.nome };
      updated.nome = input.nome;
    }
    if (input.descricao !== undefined && input.descricao !== existing.descricao) {
      changedFields.descricao = { before: existing.descricao, after: input.descricao };
      updated.descricao = input.descricao;
    }
    if (input.ordem !== undefined && input.ordem !== existing.ordem) {
      changedFields.ordem = { before: existing.ordem, after: input.ordem };
      updated.ordem = input.ordem;
    }
    if (input.isInitial !== undefined && input.isInitial !== existing.isInitial) {
      changedFields.is_initial = { before: existing.isInitial, after: input.isInitial };
      updated.isInitial = input.isInitial;
    }
    if (input.isTerminal !== undefined && input.isTerminal !== existing.isTerminal) {
      changedFields.is_terminal = { before: existing.isTerminal, after: input.isTerminal };
      updated.isTerminal = input.isTerminal;
    }
    if (input.canvasX !== undefined && input.canvasX !== existing.canvasX) {
      changedFields.canvas_x = { before: existing.canvasX, after: input.canvasX };
      updated.canvasX = input.canvasX;
    }
    if (input.canvasY !== undefined && input.canvasY !== existing.canvasY) {
      changedFields.canvas_y = { before: existing.canvasY, after: input.canvasY };
      updated.canvasY = input.canvasY;
    }

    if (Object.keys(changedFields).length === 0) {
      return {
        id: existing.id,
        macroStageId: existing.macroStageId,
        cycleId: existing.cycleId,
        codigo: existing.codigo,
        nome: existing.nome,
        descricao: existing.descricao,
        ordem: existing.ordem,
        isInitial: existing.isInitial,
        isTerminal: existing.isTerminal,
        canvasX: existing.canvasX,
        canvasY: existing.canvasY,
      };
    }

    await this.uow.transaction(async (tx) => {
      await this.stageRepo.update(updated, tx);
      if (changedFields.ordem) {
        await this.stageRepo.reorder(existing.macroStageId, tx);
      }

      await this.eventRepo.create(
        createProcessEvent({
          eventType: PROCESS_EVENT_TYPES.STAGE_UPDATED,
          entityType: 'process_stage',
          entityId: input.id,
          tenantId: input.tenantId,
          createdBy: input.updatedBy,
          correlationId: input.correlationId,
          payload: {
            id: input.id,
            macro_stage_id: existing.macroStageId,
            changed_fields: changedFields,
          },
        }),
        tx,
      );
    });

    return {
      id: updated.id,
      macroStageId: updated.macroStageId,
      cycleId: updated.cycleId,
      codigo: updated.codigo,
      nome: updated.nome,
      descricao: updated.descricao,
      ordem: updated.ordem,
      isInitial: updated.isInitial,
      isTerminal: updated.isTerminal,
      canvasX: updated.canvasX,
      canvasY: updated.canvasY,
    };
  }
}

// ── Delete ────────────────────────────────────────────────────────────

export interface DeleteStageInput {
  readonly id: string;
  readonly tenantId: string;
  readonly deletedBy: string;
  readonly correlationId: string;
}

export class DeleteStageUseCase {
  constructor(
    private readonly cycleRepo: ProcessCycleRepository,
    private readonly stageRepo: ProcessStageRepository,
    private readonly instanceChecker: InstanceCheckerPort,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: DeleteStageInput): Promise<void> {
    const existing = await this.stageRepo.findById(input.id);
    if (!existing) {
      throw new EntityNotFoundError('ProcessStage', input.id);
    }

    const cycleProps = await this.cycleRepo.findById(existing.cycleId);
    if (!cycleProps) {
      throw new EntityNotFoundError('ProcessCycle', existing.cycleId);
    }
    new ProcessCycle(cycleProps).assertMutable();

    // BR-005 + ADR-002: Check active instances in MOD-006 (fail-safe)
    const activeCount = await this.instanceChecker.countActiveByStageId(input.id);
    if (activeCount > 0) {
      throw new Error(`Este estágio possui ${activeCount} instância(s) ativa(s) em andamento.`);
    }

    await this.uow.transaction(async (tx) => {
      await this.stageRepo.softDelete(input.id, tx);
      await this.stageRepo.reorder(existing.macroStageId, tx);

      await this.eventRepo.create(
        createProcessEvent({
          eventType: PROCESS_EVENT_TYPES.STAGE_DELETED,
          entityType: 'process_stage',
          entityId: input.id,
          tenantId: input.tenantId,
          createdBy: input.deletedBy,
          correlationId: input.correlationId,
          payload: {
            id: input.id,
            macro_stage_id: existing.macroStageId,
            codigo: existing.codigo,
            nome: existing.nome,
          },
        }),
        tx,
      );
    });
  }
}
