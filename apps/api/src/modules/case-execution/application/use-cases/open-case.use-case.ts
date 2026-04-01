/**
 * @contract FR-001, BR-009, BR-010, ADR-002, SEC-006, DATA-006 §2.1
 *
 * Opens a new case on a PUBLISHED cycle.
 * Captures cycle_version_id (frozen — ADR-002).
 * Auto-creates gate_instances for initial stage gates.
 * Records stage_history entry (initial) + case.opened domain event.
 */

import type { CaseInstanceRepository, CaseInstanceRow } from '../ports/case-instance.repository.js';
import type { StageHistoryRepository } from '../ports/stage-history.repository.js';
import type { GateInstanceRepository } from '../ports/gate-instance.repository.js';
import { CycleNotPublishedError } from '../../domain/errors/cycle-not-published.error.js';
import {
  createCaseExecutionEvent,
  CASE_EXECUTION_EVENT_TYPES,
} from '../../domain/domain-events/case-events.js';
import type { CasePriority } from '../../domain/value-objects/case-priority.js';
import type { CaseEventRepository } from '../ports/case-event.repository.js';

export interface OpenCaseInput {
  cycleId: string;
  objectType?: string;
  objectId?: string;
  orgUnitId?: string;
  description?: string;
  priority?: CasePriority;
  notes?: string;
  tenantId: string;
  userId: string;
  correlationId: string;
  idempotencyKey?: string;
}

export interface CycleInfo {
  id: string;
  status: string;
  currentVersionId: string;
  initialStageId: string;
  initialStageGates: Array<{ gateId: string; stageId: string; required: boolean }>;
}

export interface OpenCaseOutput {
  caseInstance: CaseInstanceRow;
}

export class OpenCaseUseCase {
  constructor(
    private readonly caseRepo: CaseInstanceRepository,
    private readonly stageHistoryRepo: StageHistoryRepository,
    private readonly gateInstanceRepo: GateInstanceRepository,
    private readonly caseEventRepo: CaseEventRepository,
    private readonly getCycleInfo: (cycleId: string) => Promise<CycleInfo | null>,
    private readonly emitEvent: (
      event: ReturnType<typeof createCaseExecutionEvent>,
    ) => Promise<void>,
  ) {}

  async execute(input: OpenCaseInput): Promise<OpenCaseOutput> {
    // 1. Validate cycle is PUBLISHED (BR-009)
    const cycle = await this.getCycleInfo(input.cycleId);
    if (!cycle || cycle.status !== 'PUBLISHED') {
      throw new CycleNotPublishedError(input.cycleId, cycle?.status ?? 'NOT_FOUND');
    }

    // 2. Generate codigo (BR-010)
    const codigo = await this.caseRepo.nextCodigo(input.tenantId, input.cycleId);

    // 3. Create case instance with frozen cycle_version_id (ADR-002)
    const caseInstance = await this.caseRepo.create({
      id: crypto.randomUUID(),
      codigo,
      cycleId: input.cycleId,
      cycleVersionId: cycle.currentVersionId,
      currentStageId: cycle.initialStageId,
      status: 'OPEN',
      objectType: input.objectType ?? null,
      objectId: input.objectId ?? null,
      orgUnitId: input.orgUnitId ?? null,
      description: input.description ?? null,
      priority: input.priority ?? 'NORMAL',
      tenantId: input.tenantId,
      openedBy: input.userId,
      openedAt: new Date(),
      completedAt: null,
      cancelledAt: null,
      cancellationReason: null,
    });

    // 4. Record initial stage_history entry
    await this.stageHistoryRepo.create({
      caseId: caseInstance.id,
      fromStageId: null,
      toStageId: cycle.initialStageId,
      transitionId: null,
      transitionedBy: input.userId,
      transitionedAt: caseInstance.openedAt,
      motivo: 'Case opened',
      evidence: null,
    });

    // 5. Record initial notes as COMMENT event (FR-006-M01 §A2)
    if (input.notes) {
      await this.caseEventRepo.create({
        caseId: caseInstance.id,
        eventType: 'COMMENT',
        descricao: input.notes,
        createdBy: input.userId,
        stageId: cycle.initialStageId,
        metadata: { source: 'open_case_notes' },
      });
    }

    // 6. Auto-create gate_instances for initial stage (FR-001)
    // (note: step numbers shifted after adding notes recording above)
    if (cycle.initialStageGates.length > 0) {
      await this.gateInstanceRepo.createMany(
        cycle.initialStageGates.map((g) => ({
          caseId: caseInstance.id,
          gateId: g.gateId,
          stageId: g.stageId,
          status: 'PENDING' as const,
        })),
      );
    }

    // 6. Emit domain event
    await this.emitEvent(
      createCaseExecutionEvent({
        eventType: CASE_EXECUTION_EVENT_TYPES.CASE_OPENED,
        entityId: caseInstance.id,
        tenantId: input.tenantId,
        createdBy: input.userId,
        correlationId: input.correlationId,
        data: {
          codigo: caseInstance.codigo,
          cycleId: input.cycleId,
          cycleVersionId: cycle.currentVersionId,
          initialStageId: cycle.initialStageId,
          objectType: input.objectType,
          objectId: input.objectId,
        },
      }),
    );

    return { caseInstance };
  }
}
