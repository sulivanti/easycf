/**
 * @contract FR-005, BR-014, SEC-006
 *
 * Waives (dispenses) a gate instance.
 * Requires scope process:case:gate_waive.
 * Motivo must be at least 20 characters (BR-014).
 */

import type { GateInstanceRepository } from '../ports/gate-instance.repository.js';
import { validateGateWaive } from '../../domain/domain-services/gate-resolver.service.js';
import { assertGateTransition } from '../../domain/value-objects/gate-resolution-status.js';
import {
  createCaseExecutionEvent,
  CASE_EXECUTION_EVENT_TYPES,
} from '../../domain/domain-events/case-events.js';

export interface WaiveGateInput {
  gateInstanceId: string;
  caseId: string;
  tenantId: string;
  userId: string;
  motivo: string;
  correlationId: string;
}

export interface WaiveGateOutput {
  gateInstanceId: string;
  status: 'WAIVED';
}

export class WaiveGateUseCase {
  constructor(
    private readonly gateInstanceRepo: GateInstanceRepository,
    private readonly emitEvent: (
      event: ReturnType<typeof createCaseExecutionEvent>,
    ) => Promise<void>,
  ) {}

  async execute(input: WaiveGateInput): Promise<WaiveGateOutput> {
    const gate = await this.gateInstanceRepo.findById(input.gateInstanceId);
    if (!gate || gate.caseId !== input.caseId) {
      throw new Error(`Gate instance ${input.gateInstanceId} not found for case ${input.caseId}.`);
    }

    // Domain validation (motivo min 20 chars — BR-014)
    validateGateWaive({ motivo: input.motivo, userId: input.userId });
    assertGateTransition(gate.status, 'WAIVED');

    const now = new Date();
    await this.gateInstanceRepo.resolve(input.gateInstanceId, {
      status: 'WAIVED',
      resolvedBy: input.userId,
      resolvedAt: now,
      decision: 'WAIVED',
      parecer: input.motivo,
      evidence: null,
      checklistItems: null,
    });

    await this.emitEvent(
      createCaseExecutionEvent({
        eventType: CASE_EXECUTION_EVENT_TYPES.GATE_WAIVED,
        entityId: input.gateInstanceId,
        tenantId: input.tenantId,
        createdBy: input.userId,
        correlationId: input.correlationId,
        data: {
          caseId: input.caseId,
          gateId: gate.gateId,
          motivo: input.motivo,
        },
      }),
    );

    return { gateInstanceId: input.gateInstanceId, status: 'WAIVED' };
  }
}
