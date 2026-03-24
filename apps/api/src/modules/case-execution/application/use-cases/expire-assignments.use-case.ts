/**
 * @contract FR-014, ADR-005, BR-017, PENDENTE-002
 *
 * Background job (cron every 5 minutes) that deactivates expired assignments.
 * Two sources of expiration:
 * 1. valid_until has passed (BR-017)
 * 2. Delegation expired via DelegationCheckerPort (ADR-005, PENDENTE-002)
 *
 * Records case_events + domain_events for audit trail.
 */

import type { CaseAssignmentRepository } from "../ports/case-assignment.repository.js";
import type { CaseEventRepository } from "../ports/case-event.repository.js";
import type { DelegationCheckerPort } from "../ports/delegation-checker.port.js";
import { createCaseExecutionEvent, CASE_EXECUTION_EVENT_TYPES } from "../../domain/domain-events/case-events.js";

export interface ExpireAssignmentsOutput {
  expiredByValidUntil: number;
  expiredByDelegation: number;
  total: number;
}

export class ExpireAssignmentsUseCase {
  constructor(
    private readonly assignmentRepo: CaseAssignmentRepository,
    private readonly caseEventRepo: CaseEventRepository,
    private readonly delegationChecker: DelegationCheckerPort,
    private readonly emitEvent: (event: ReturnType<typeof createCaseExecutionEvent>) => Promise<void>,
  ) {}

  async execute(): Promise<ExpireAssignmentsOutput> {
    const now = new Date();
    let expiredByValidUntil = 0;
    let expiredByDelegation = 0;

    // 1. Expire by valid_until (BR-017)
    const expiredByDate = await this.assignmentRepo.findExpired(now);
    for (const assignment of expiredByDate) {
      await this.assignmentRepo.deactivate(assignment.id, "Expired (valid_until reached)");
      await this.caseEventRepo.create({
        caseId: assignment.caseId,
        eventType: "REASSIGNED",
        descricao: `Assignment expired: valid_until ${assignment.validUntil?.toISOString()}`,
        createdBy: "SYSTEM",
        createdAt: now,
        metadata: { assignmentId: assignment.id, reason: "valid_until_expired" },
        stageId: assignment.stageId,
      });
      expiredByValidUntil++;
    }

    // 2. Expire by delegation (ADR-005, PENDENTE-002)
    const expiredDelegations = await this.delegationChecker.getExpiredDelegations();
    if (expiredDelegations.length > 0) {
      const delegationIds = expiredDelegations.map((d) => d.delegationId);
      const affectedAssignments = await this.assignmentRepo.findByDelegationIds(delegationIds);

      for (const assignment of affectedAssignments) {
        if (!assignment.isActive) continue;
        await this.assignmentRepo.deactivate(assignment.id, "Delegation expired");
        await this.caseEventRepo.create({
          caseId: assignment.caseId,
          eventType: "REASSIGNED",
          descricao: `Assignment expired: delegation ${assignment.delegationId} no longer valid`,
          createdBy: "SYSTEM",
          createdAt: now,
          metadata: { assignmentId: assignment.id, delegationId: assignment.delegationId, reason: "delegation_expired" },
          stageId: assignment.stageId,
        });
        expiredByDelegation++;
      }
    }

    const total = expiredByValidUntil + expiredByDelegation;
    if (total > 0) {
      await this.emitEvent(
        createCaseExecutionEvent({
          eventType: CASE_EXECUTION_EVENT_TYPES.ASSIGNMENT_REPLACED,
          entityId: "SYSTEM",
          tenantId: "SYSTEM",
          createdBy: "SYSTEM",
          correlationId: `expire-job-${now.toISOString()}`,
          data: { expiredByValidUntil, expiredByDelegation, total },
        }),
      );
    }

    return { expiredByValidUntil, expiredByDelegation, total };
  }
}
