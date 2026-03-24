/**
 * @contract FR-003, BR-012, BR-016, ADR-004, SEC-006
 *
 * Case controls: ON_HOLD, RESUME, CANCEL, REOPEN.
 * Uses status state machine (case-status.ts) for validation.
 * ON_HOLD/RESUME/CANCEL require scope process:case:write.
 * REOPEN requires scope process:case:reopen + target_stage_id (PENDENTE-001, PENDENTE-005).
 */

import type { CaseInstanceRepository } from "../ports/case-instance.repository.js";
import type { CaseEventRepository } from "../ports/case-event.repository.js";
import type { GateInstanceRepository } from "../ports/gate-instance.repository.js";
import type { CaseStatus } from "../../domain/value-objects/case-status.js";
import { assertStatusTransition } from "../../domain/value-objects/case-status.js";
import { createCaseExecutionEvent, CASE_EXECUTION_EVENT_TYPES } from "../../domain/domain-events/case-events.js";

export type CaseControlAction = "ON_HOLD" | "RESUME" | "CANCEL" | "REOPEN";

export interface ControlCaseInput {
  caseId: string;
  action: CaseControlAction;
  tenantId: string;
  userId: string;
  correlationId: string;
  reason?: string;
  targetStageId?: string; // Required for REOPEN (PENDENTE-005)
}

export interface ControlCaseOutput {
  previousStatus: CaseStatus;
  newStatus: CaseStatus;
}

const ACTION_TO_STATUS: Record<CaseControlAction, CaseStatus> = {
  ON_HOLD: "ON_HOLD",
  RESUME: "OPEN",
  CANCEL: "CANCELLED",
  REOPEN: "OPEN",
};

const ACTION_TO_EVENT = {
  ON_HOLD: CASE_EXECUTION_EVENT_TYPES.CASE_ON_HOLD,
  RESUME: CASE_EXECUTION_EVENT_TYPES.CASE_RESUMED,
  CANCEL: CASE_EXECUTION_EVENT_TYPES.CASE_CANCELLED,
  REOPEN: CASE_EXECUTION_EVENT_TYPES.CASE_OPENED,
} as const;

export class ControlCaseUseCase {
  constructor(
    private readonly caseRepo: CaseInstanceRepository,
    private readonly caseEventRepo: CaseEventRepository,
    private readonly gateInstanceRepo: GateInstanceRepository,
    private readonly getStageGates: (stageId: string) => Promise<Array<{ gateId: string; stageId: string; required: boolean }>>,
    private readonly emitEvent: (event: ReturnType<typeof createCaseExecutionEvent>) => Promise<void>,
  ) {}

  async execute(input: ControlCaseInput): Promise<ControlCaseOutput> {
    const caseRow = await this.caseRepo.findById(input.caseId, input.tenantId);
    if (!caseRow) {
      throw new Error(`Case ${input.caseId} not found.`);
    }

    const targetStatus = ACTION_TO_STATUS[input.action];
    assertStatusTransition(caseRow.status, targetStatus);

    // REOPEN requires target_stage_id (PENDENTE-005)
    if (input.action === "REOPEN" && !input.targetStageId) {
      throw new Error("REOPEN requires target_stage_id (PENDENTE-005).");
    }

    const now = new Date();
    const extra: Record<string, unknown> = {};

    if (input.action === "CANCEL") {
      extra.cancelledAt = now;
      extra.cancellationReason = input.reason ?? null;
    }

    if (input.action === "REOPEN" && input.targetStageId) {
      extra.currentStageId = input.targetStageId;

      // Reset gates to PENDING for target stage (PENDENTE-005)
      const gates = await this.getStageGates(input.targetStageId);
      if (gates.length > 0) {
        await this.gateInstanceRepo.createMany(
          gates.map((g) => ({
            caseId: input.caseId,
            gateId: g.gateId,
            stageId: g.stageId,
            status: "PENDING" as const,
          })),
        );
      }
    }

    await this.caseRepo.updateStatus(
      input.caseId,
      input.tenantId,
      targetStatus,
      caseRow.updatedAt,
      extra as Parameters<typeof this.caseRepo.updateStatus>[4],
    );

    // Record case_event
    const eventTypeMap: Record<CaseControlAction, string> = {
      ON_HOLD: "ON_HOLD",
      RESUME: "RESUMED",
      CANCEL: "COMMENT",
      REOPEN: "REOPENED",
    };

    await this.caseEventRepo.create({
      caseId: input.caseId,
      eventType: eventTypeMap[input.action] as import("../../domain/value-objects/case-event-type.js").CaseEventType,
      descricao: `Case ${input.action.toLowerCase()}${input.reason ? `: ${input.reason}` : ""}`,
      createdBy: input.userId,
      createdAt: now,
      metadata: { action: input.action, reason: input.reason, targetStageId: input.targetStageId },
      stageId: input.action === "REOPEN" && input.targetStageId ? input.targetStageId : caseRow.currentStageId,
    });

    // Emit domain event
    await this.emitEvent(
      createCaseExecutionEvent({
        eventType: ACTION_TO_EVENT[input.action],
        entityId: input.caseId,
        tenantId: input.tenantId,
        createdBy: input.userId,
        correlationId: input.correlationId,
        data: {
          previousStatus: caseRow.status,
          newStatus: targetStatus,
          reason: input.reason,
          targetStageId: input.targetStageId,
        },
      }),
    );

    return { previousStatus: caseRow.status, newStatus: targetStatus };
  }
}
