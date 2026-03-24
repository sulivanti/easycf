/**
 * @contract FR-004, BR-008, BR-013, SEC-006
 *
 * Resolves a gate instance based on gate type (APPROVAL, DOCUMENT, CHECKLIST, INFORMATIVE).
 * Uses gate-resolver domain service for type-specific validation.
 * APPROVAL gates require can_approve=true on user role (BR-008).
 */

import type { GateInstanceRepository } from "../ports/gate-instance.repository.js";
import { validateGateResolution, type GateResolveRequest } from "../../domain/domain-services/gate-resolver.service.js";
import type { GateDecision } from "../../domain/value-objects/gate-decision.js";
import { assertGateTransition } from "../../domain/value-objects/gate-resolution-status.js";
import { createCaseExecutionEvent, CASE_EXECUTION_EVENT_TYPES } from "../../domain/domain-events/case-events.js";

export interface ResolveGateInput {
  gateInstanceId: string;
  caseId: string;
  tenantId: string;
  userId: string;
  userCanApprove: boolean;
  correlationId: string;
  decision?: GateDecision;
  parecer?: string;
  evidence?: { type: "file"; url: string; filename: string };
  checklistItems?: Array<{ id: string; label: string; checked: boolean }>;
}

export interface ResolveGateOutput {
  gateInstanceId: string;
  status: "RESOLVED" | "REJECTED";
  decision: GateDecision | null;
}

export class ResolveGateUseCase {
  constructor(
    private readonly gateInstanceRepo: GateInstanceRepository,
    private readonly getGateType: (gateId: string) => Promise<string>,
    private readonly emitEvent: (event: ReturnType<typeof createCaseExecutionEvent>) => Promise<void>,
  ) {}

  async execute(input: ResolveGateInput): Promise<ResolveGateOutput> {
    const gate = await this.gateInstanceRepo.findById(input.gateInstanceId);
    if (!gate || gate.caseId !== input.caseId) {
      throw new Error(`Gate instance ${input.gateInstanceId} not found for case ${input.caseId}.`);
    }

    // Validate state transition (PENDING → RESOLVED/REJECTED)
    const gateType = await this.getGateType(gate.gateId) as GateResolveRequest["gateType"];

    const request: GateResolveRequest = {
      gateType,
      decision: input.decision,
      parecer: input.parecer,
      evidence: input.evidence,
      checklistItems: input.checklistItems,
      userId: input.userId,
      userCanApprove: input.userCanApprove,
    };

    const result = validateGateResolution(request);
    assertGateTransition(gate.status, result.status);

    const now = new Date();
    await this.gateInstanceRepo.resolve(input.gateInstanceId, {
      status: result.status,
      resolvedBy: input.userId,
      resolvedAt: now,
      decision: result.decision,
      parecer: input.parecer ?? null,
      evidence: input.evidence ?? null,
      checklistItems: input.checklistItems ?? null,
    });

    await this.emitEvent(
      createCaseExecutionEvent({
        eventType: CASE_EXECUTION_EVENT_TYPES.GATE_RESOLVED,
        entityId: input.gateInstanceId,
        tenantId: input.tenantId,
        createdBy: input.userId,
        correlationId: input.correlationId,
        data: {
          caseId: input.caseId,
          gateId: gate.gateId,
          gateType,
          status: result.status,
          decision: result.decision,
        },
      }),
    );

    return {
      gateInstanceId: input.gateInstanceId,
      status: result.status,
      decision: result.decision,
    };
  }
}
