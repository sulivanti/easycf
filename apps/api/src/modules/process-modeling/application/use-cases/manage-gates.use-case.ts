/**
 * @contract FR-007, BR-001, BR-007, BR-012, DATA-003
 *
 * Use Cases: Create, Update, Delete Gates.
 * - Only DRAFT cycles allow mutations (BR-001)
 * - INFORMATIVE gates never block (BR-007) — enforced in domain entity
 * - Automatic contiguous reordering on insert/delete (BR-012)
 */

import { ProcessCycle } from '../../domain/aggregates/process-cycle.js';
import {
  createProcessEvent,
  PROCESS_EVENT_TYPES,
} from '../../domain/domain-events/process-events.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type { GateProps } from '../../domain/entities/gate.js';
import type { GateType } from '../../domain/value-objects/gate-type.js';
import type {
  ProcessCycleRepository,
  ProcessStageRepository,
  ProcessGateRepository,
} from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';
import type { HashUtilService } from '../../../foundation/application/ports/services.js';

// ── Create ────────────────────────────────────────────────────────────

export interface CreateGateInput {
  readonly stageId: string;
  readonly tenantId: string;
  readonly nome: string;
  readonly descricao?: string | null;
  readonly gateType: GateType;
  readonly required: boolean;
  readonly ordem: number;
  readonly createdBy: string;
  readonly correlationId: string;
}

export interface GateOutput {
  readonly id: string;
  readonly stageId: string;
  readonly nome: string;
  readonly descricao: string | null;
  readonly gateType: GateType;
  readonly required: boolean;
  readonly ordem: number;
}

export class CreateGateUseCase {
  constructor(
    private readonly cycleRepo: ProcessCycleRepository,
    private readonly stageRepo: ProcessStageRepository,
    private readonly gateRepo: ProcessGateRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
  ) {}

  async execute(input: CreateGateInput): Promise<GateOutput> {
    const stage = await this.stageRepo.findById(input.stageId);
    if (!stage) {
      throw new EntityNotFoundError('ProcessStage', input.stageId);
    }

    const cycleProps = await this.cycleRepo.findById(stage.cycleId);
    if (!cycleProps) {
      throw new EntityNotFoundError('ProcessCycle', stage.cycleId);
    }
    new ProcessCycle(cycleProps).assertMutable();

    const id = this.hashUtil.generateUuid();
    const now = new Date();

    const props: GateProps = {
      id,
      stageId: input.stageId,
      nome: input.nome.trim(),
      descricao: input.descricao ?? null,
      gateType: input.gateType,
      required: input.required,
      ordem: input.ordem,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    await this.uow.transaction(async (tx) => {
      await this.gateRepo.create(props, tx);
      await this.gateRepo.reorder(input.stageId, tx);

      await this.eventRepo.create(
        createProcessEvent({
          eventType: PROCESS_EVENT_TYPES.GATE_CREATED,
          entityType: 'process_gate',
          entityId: id,
          tenantId: input.tenantId,
          createdBy: input.createdBy,
          correlationId: input.correlationId,
          payload: {
            id,
            stage_id: input.stageId,
            nome: props.nome,
            gate_type: props.gateType,
            required: props.required,
            ordem: props.ordem,
          },
        }),
        tx,
      );
    });

    return {
      id,
      stageId: props.stageId,
      nome: props.nome,
      descricao: props.descricao,
      gateType: props.gateType,
      required: props.required,
      ordem: props.ordem,
    };
  }
}

// ── Update ────────────────────────────────────────────────────────────

export interface UpdateGateInput {
  readonly id: string;
  readonly tenantId: string;
  readonly nome?: string;
  readonly descricao?: string | null;
  readonly gateType?: GateType;
  readonly required?: boolean;
  readonly ordem?: number;
  readonly updatedBy: string;
  readonly correlationId: string;
}

export class UpdateGateUseCase {
  constructor(
    private readonly cycleRepo: ProcessCycleRepository,
    private readonly stageRepo: ProcessStageRepository,
    private readonly gateRepo: ProcessGateRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: UpdateGateInput): Promise<GateOutput> {
    const existing = await this.gateRepo.findById(input.id);
    if (!existing) {
      throw new EntityNotFoundError('ProcessGate', input.id);
    }

    const stage = await this.stageRepo.findById(existing.stageId);
    if (!stage) {
      throw new EntityNotFoundError('ProcessStage', existing.stageId);
    }

    const cycleProps = await this.cycleRepo.findById(stage.cycleId);
    if (!cycleProps) {
      throw new EntityNotFoundError('ProcessCycle', stage.cycleId);
    }
    new ProcessCycle(cycleProps).assertMutable();

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
    if (input.gateType !== undefined && input.gateType !== existing.gateType) {
      changedFields.gate_type = { before: existing.gateType, after: input.gateType };
      updated.gateType = input.gateType;
    }
    if (input.required !== undefined && input.required !== existing.required) {
      changedFields.required = { before: existing.required, after: input.required };
      updated.required = input.required;
    }
    if (input.ordem !== undefined && input.ordem !== existing.ordem) {
      changedFields.ordem = { before: existing.ordem, after: input.ordem };
      updated.ordem = input.ordem;
    }

    if (Object.keys(changedFields).length === 0) {
      return {
        id: existing.id,
        stageId: existing.stageId,
        nome: existing.nome,
        descricao: existing.descricao,
        gateType: existing.gateType,
        required: existing.required,
        ordem: existing.ordem,
      };
    }

    await this.uow.transaction(async (tx) => {
      await this.gateRepo.update(updated, tx);
      if (changedFields.ordem) {
        await this.gateRepo.reorder(existing.stageId, tx);
      }

      await this.eventRepo.create(
        createProcessEvent({
          eventType: PROCESS_EVENT_TYPES.GATE_UPDATED,
          entityType: 'process_gate',
          entityId: input.id,
          tenantId: input.tenantId,
          createdBy: input.updatedBy,
          correlationId: input.correlationId,
          payload: { id: input.id, stage_id: existing.stageId, changed_fields: changedFields },
        }),
        tx,
      );
    });

    return {
      id: updated.id,
      stageId: updated.stageId,
      nome: updated.nome,
      descricao: updated.descricao,
      gateType: updated.gateType,
      required: updated.required,
      ordem: updated.ordem,
    };
  }
}

// ── Delete ────────────────────────────────────────────────────────────

export interface DeleteGateInput {
  readonly id: string;
  readonly tenantId: string;
  readonly deletedBy: string;
  readonly correlationId: string;
}

export class DeleteGateUseCase {
  constructor(
    private readonly cycleRepo: ProcessCycleRepository,
    private readonly stageRepo: ProcessStageRepository,
    private readonly gateRepo: ProcessGateRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: DeleteGateInput): Promise<void> {
    const existing = await this.gateRepo.findById(input.id);
    if (!existing) {
      throw new EntityNotFoundError('ProcessGate', input.id);
    }

    const stage = await this.stageRepo.findById(existing.stageId);
    if (!stage) {
      throw new EntityNotFoundError('ProcessStage', existing.stageId);
    }

    const cycleProps = await this.cycleRepo.findById(stage.cycleId);
    if (!cycleProps) {
      throw new EntityNotFoundError('ProcessCycle', stage.cycleId);
    }
    new ProcessCycle(cycleProps).assertMutable();

    await this.uow.transaction(async (tx) => {
      await this.gateRepo.softDelete(input.id, tx);
      await this.gateRepo.reorder(existing.stageId, tx);

      await this.eventRepo.create(
        createProcessEvent({
          eventType: PROCESS_EVENT_TYPES.GATE_DELETED,
          entityType: 'process_gate',
          entityId: input.id,
          tenantId: input.tenantId,
          createdBy: input.deletedBy,
          correlationId: input.correlationId,
          payload: {
            id: input.id,
            stage_id: existing.stageId,
            nome: existing.nome,
            gate_type: existing.gateType,
          },
        }),
        tx,
      );
    });
  }
}
