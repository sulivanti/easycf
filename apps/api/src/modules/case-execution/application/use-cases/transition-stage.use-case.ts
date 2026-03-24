/**
 * @contract FR-002, BR-002, BR-004, BR-005, BR-006, BR-012, ADR-001, ADR-004, SEC-006
 *
 * Executes the 5-step transition engine (ADR-001 — atomic transaction).
 * Uses optimistic locking via updated_at (ADR-004).
 * On success: updates current_stage_id, records stage_history, auto-creates
 * gate_instances for target stage, emits domain event.
 * If target stage is terminal: auto-completes case.
 */

import type { CaseInstanceRepository } from '../ports/case-instance.repository.js';
import type { StageHistoryRepository } from '../ports/stage-history.repository.js';
import type { GateInstanceRepository } from '../ports/gate-instance.repository.js';
import type { CaseEventRepository } from '../ports/case-event.repository.js';
import type { CaseAssignmentRepository } from '../ports/case-assignment.repository.js';
import {
  validateTransition,
  type TransitionRequest,
  type TransitionContext,
  type BlueprintTransition,
  type PendingGateInfo,
  type RequiredRoleInfo,
} from '../../domain/domain-services/transition-engine.service.js';
import {
  createCaseExecutionEvent,
  CASE_EXECUTION_EVENT_TYPES,
} from '../../domain/domain-events/case-events.js';

export interface TransitionStageInput {
  caseId: string;
  targetStageId: string;
  tenantId: string;
  userId: string;
  userRoleCodigos: string[];
  evidence?: { type: 'note' | 'file'; content?: string; url?: string };
  motivo?: string;
  correlationId: string;
}

export interface TargetStageInfo {
  isTerminal: boolean;
  gates: Array<{ gateId: string; stageId: string; required: boolean }>;
}

export interface TransitionStageOutput {
  transitionId: string;
  fromStageId: string;
  toStageId: string;
  isTerminal: boolean;
  caseCompleted: boolean;
}

export class TransitionStageUseCase {
  constructor(
    private readonly caseRepo: CaseInstanceRepository,
    private readonly stageHistoryRepo: StageHistoryRepository,
    private readonly gateInstanceRepo: GateInstanceRepository,
    private readonly caseEventRepo: CaseEventRepository,
    private readonly assignmentRepo: CaseAssignmentRepository,
    private readonly findTransition: (
      fromStageId: string,
      toStageId: string,
      cycleVersionId: string,
    ) => Promise<BlueprintTransition | null>,
    private readonly getGatesForStage: (
      caseId: string,
      stageId: string,
    ) => Promise<PendingGateInfo[]>,
    private readonly getRequiredRoles: (
      caseId: string,
      stageId: string,
    ) => Promise<RequiredRoleInfo[]>,
    private readonly getTargetStageInfo: (stageId: string) => Promise<TargetStageInfo>,
    private readonly emitEvent: (
      event: ReturnType<typeof createCaseExecutionEvent>,
    ) => Promise<void>,
  ) {}

  async execute(input: TransitionStageInput): Promise<TransitionStageOutput> {
    // 1. Load case (with optimistic locking — ADR-004)
    const caseRow = await this.caseRepo.findById(input.caseId, input.tenantId);
    if (!caseRow) {
      throw new Error(`Case ${input.caseId} not found.`);
    }

    // 2. Load blueprint transition
    const transition = await this.findTransition(
      caseRow.currentStageId,
      input.targetStageId,
      caseRow.cycleVersionId,
    );
    if (!transition) {
      throw new Error(
        `No transition from stage ${caseRow.currentStageId} to ${input.targetStageId} in cycle version ${caseRow.cycleVersionId}.`,
      );
    }

    // 3. Load gates and roles context
    const pendingGates = await this.getGatesForStage(input.caseId, caseRow.currentStageId);
    const requiredRoles = await this.getRequiredRoles(input.caseId, caseRow.currentStageId);

    // 4. Validate via domain service (5 steps — ADR-001)
    const request: TransitionRequest = {
      caseId: input.caseId,
      currentStatus: caseRow.status,
      currentStageId: caseRow.currentStageId,
      targetStageId: input.targetStageId,
      userId: input.userId,
      userRoleCodigos: input.userRoleCodigos,
      evidence: input.evidence,
    };
    const context: TransitionContext = { transition, pendingGates, requiredRoles };
    validateTransition(request, context);

    // 5. Check if target stage is terminal
    const targetInfo = await this.getTargetStageInfo(input.targetStageId);
    const now = new Date();
    const caseCompleted = targetInfo.isTerminal;

    // 6. Update case — move to target stage (+ complete if terminal)
    await this.caseRepo.updateStatus(
      input.caseId,
      input.tenantId,
      caseCompleted ? 'COMPLETED' : 'OPEN',
      caseRow.updatedAt,
      {
        currentStageId: input.targetStageId,
        ...(caseCompleted ? { completedAt: now } : {}),
      },
    );

    // 7. Record stage_history
    await this.stageHistoryRepo.create({
      caseId: input.caseId,
      fromStageId: caseRow.currentStageId,
      toStageId: input.targetStageId,
      transitionId: transition.id,
      transitionedBy: input.userId,
      transitionedAt: now,
      motivo: input.motivo ?? null,
      evidence: input.evidence ?? null,
    });

    // 8. Auto-create gate_instances for target stage
    if (targetInfo.gates.length > 0) {
      await this.gateInstanceRepo.createMany(
        targetInfo.gates.map((g) => ({
          caseId: input.caseId,
          gateId: g.gateId,
          stageId: g.stageId,
          status: 'PENDING' as const,
        })),
      );
    }

    // 9. Record case_event (STAGE_TRANSITIONED)
    await this.caseEventRepo.create({
      caseId: input.caseId,
      eventType: 'STAGE_TRANSITIONED',
      descricao: `Transitioned from ${caseRow.currentStageId} to ${input.targetStageId}`,
      createdBy: input.userId,
      createdAt: now,
      metadata: { transitionId: transition.id, motivo: input.motivo },
      stageId: input.targetStageId,
    });

    // 10. Emit domain events
    await this.emitEvent(
      createCaseExecutionEvent({
        eventType: CASE_EXECUTION_EVENT_TYPES.CASE_STAGE_TRANSITIONED,
        entityId: input.caseId,
        tenantId: input.tenantId,
        createdBy: input.userId,
        correlationId: input.correlationId,
        data: {
          fromStageId: caseRow.currentStageId,
          toStageId: input.targetStageId,
          transitionId: transition.id,
        },
      }),
    );

    if (caseCompleted) {
      await this.emitEvent(
        createCaseExecutionEvent({
          eventType: CASE_EXECUTION_EVENT_TYPES.CASE_COMPLETED,
          entityId: input.caseId,
          tenantId: input.tenantId,
          createdBy: input.userId,
          correlationId: input.correlationId,
          data: { finalStageId: input.targetStageId },
        }),
      );
    }

    return {
      transitionId: transition.id,
      fromStageId: caseRow.currentStageId,
      toStageId: input.targetStageId,
      isTerminal: targetInfo.isTerminal,
      caseCompleted,
    };
  }
}
