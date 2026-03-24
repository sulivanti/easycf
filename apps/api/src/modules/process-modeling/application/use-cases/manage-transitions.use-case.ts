/**
 * @contract FR-010, BR-001, BR-008, DATA-003
 *
 * Use Cases: Create, Delete Stage Transitions.
 * - Only DRAFT cycles allow mutations (BR-001)
 * - Cross-cycle transitions prohibited (BR-008)
 * - Self-transitions prohibited (BR-008)
 * - Hard delete (no soft delete — DATA-005 §2.8)
 */

import { ProcessCycle } from '../../domain/aggregates/process-cycle.js';
import { StageTransition } from '../../domain/entities/stage-transition.js';
import {
  createProcessEvent,
  PROCESS_EVENT_TYPES,
} from '../../domain/domain-events/process-events.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type { StageTransitionProps } from '../../domain/entities/stage-transition.js';
import type {
  ProcessCycleRepository,
  ProcessStageRepository,
  StageTransitionRepository,
} from '../ports/repositories.js';
import type {
  DomainEventRepository,
  UnitOfWork,
} from '../../../foundation/application/ports/repositories.js';
import type { HashUtilService } from '../../../foundation/application/ports/services.js';

// ── Create ────────────────────────────────────────────────────────────

export interface CreateTransitionInput {
  readonly fromStageId: string;
  readonly toStageId: string;
  readonly tenantId: string;
  readonly nome: string;
  readonly condicao?: string | null;
  readonly gateRequired?: boolean;
  readonly evidenceRequired?: boolean;
  readonly allowedRoles?: string[] | null;
  readonly createdBy: string;
  readonly correlationId: string;
}

export interface TransitionOutput {
  readonly id: string;
  readonly fromStageId: string;
  readonly toStageId: string;
  readonly nome: string;
  readonly condicao: string | null;
  readonly gateRequired: boolean;
  readonly evidenceRequired: boolean;
  readonly allowedRoles: string[] | null;
}

export class CreateTransitionUseCase {
  constructor(
    private readonly cycleRepo: ProcessCycleRepository,
    private readonly stageRepo: ProcessStageRepository,
    private readonly transitionRepo: StageTransitionRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly hashUtil: HashUtilService,
  ) {}

  async execute(input: CreateTransitionInput): Promise<TransitionOutput> {
    const fromStage = await this.stageRepo.findById(input.fromStageId);
    if (!fromStage) {
      throw new EntityNotFoundError('ProcessStage (from)', input.fromStageId);
    }

    const toStage = await this.stageRepo.findById(input.toStageId);
    if (!toStage) {
      throw new EntityNotFoundError('ProcessStage (to)', input.toStageId);
    }

    // BR-008: Validate same-cycle and no self-transition
    StageTransition.assertValid(
      input.fromStageId,
      fromStage.cycleId,
      input.toStageId,
      toStage.cycleId,
    );

    const cycleProps = await this.cycleRepo.findById(fromStage.cycleId);
    if (!cycleProps) {
      throw new EntityNotFoundError('ProcessCycle', fromStage.cycleId);
    }
    new ProcessCycle(cycleProps).assertMutable();

    const id = this.hashUtil.generateUuid();
    const now = new Date();

    const props: StageTransitionProps = {
      id,
      fromStageId: input.fromStageId,
      toStageId: input.toStageId,
      nome: input.nome.trim(),
      condicao: input.condicao ?? null,
      gateRequired: input.gateRequired ?? false,
      evidenceRequired: input.evidenceRequired ?? false,
      allowedRoles: input.allowedRoles ?? null,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    await this.uow.transaction(async (tx) => {
      await this.transitionRepo.create(props, tx);

      await this.eventRepo.create(
        createProcessEvent({
          eventType: PROCESS_EVENT_TYPES.TRANSITION_CREATED,
          entityType: 'stage_transition',
          entityId: id,
          tenantId: input.tenantId,
          createdBy: input.createdBy,
          correlationId: input.correlationId,
          payload: {
            id,
            from_stage_id: input.fromStageId,
            to_stage_id: input.toStageId,
            nome: props.nome,
            gate_required: props.gateRequired,
            evidence_required: props.evidenceRequired,
          },
        }),
        tx,
      );
    });

    return {
      id,
      fromStageId: props.fromStageId,
      toStageId: props.toStageId,
      nome: props.nome,
      condicao: props.condicao,
      gateRequired: props.gateRequired,
      evidenceRequired: props.evidenceRequired,
      allowedRoles: props.allowedRoles,
    };
  }
}

// ── Delete ────────────────────────────────────────────────────────────

export interface DeleteTransitionInput {
  readonly id: string;
  readonly tenantId: string;
  readonly deletedBy: string;
  readonly correlationId: string;
}

export class DeleteTransitionUseCase {
  constructor(
    private readonly cycleRepo: ProcessCycleRepository,
    private readonly stageRepo: ProcessStageRepository,
    private readonly transitionRepo: StageTransitionRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: DeleteTransitionInput): Promise<void> {
    const existing = await this.transitionRepo.findById(input.id);
    if (!existing) {
      throw new EntityNotFoundError('StageTransition', input.id);
    }

    const fromStage = await this.stageRepo.findById(existing.fromStageId);
    if (!fromStage) {
      throw new EntityNotFoundError('ProcessStage', existing.fromStageId);
    }

    const cycleProps = await this.cycleRepo.findById(fromStage.cycleId);
    if (!cycleProps) {
      throw new EntityNotFoundError('ProcessCycle', fromStage.cycleId);
    }
    new ProcessCycle(cycleProps).assertMutable();

    await this.uow.transaction(async (tx) => {
      await this.transitionRepo.delete(input.id, tx);

      await this.eventRepo.create(
        createProcessEvent({
          eventType: PROCESS_EVENT_TYPES.TRANSITION_DELETED,
          entityType: 'stage_transition',
          entityId: input.id,
          tenantId: input.tenantId,
          createdBy: input.deletedBy,
          correlationId: input.correlationId,
          payload: {
            id: input.id,
            from_stage_id: existing.fromStageId,
            to_stage_id: existing.toStageId,
            nome: existing.nome,
          },
        }),
        tx,
      );
    });
  }
}
