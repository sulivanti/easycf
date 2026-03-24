/**
 * @contract FR-006, BR-015, BR-017, SEC-006
 *
 * Assigns (or reassigns) a user to a process role in a case/stage.
 * Reassignment deactivates previous assignment for the same role (BR-015).
 * Supports delegation-based assignments via delegationId.
 */

import type { CaseInstanceRepository } from "../ports/case-instance.repository.js";
import type { CaseAssignmentRepository, CaseAssignmentRow } from "../ports/case-assignment.repository.js";
import { createCaseExecutionEvent, CASE_EXECUTION_EVENT_TYPES } from "../../domain/domain-events/case-events.js";
import { CaseNotOpenError } from "../../domain/errors/case-not-open.error.js";

export interface AssignResponsibleInput {
  caseId: string;
  stageId: string;
  processRoleId: string;
  userId: string;
  assignedBy: string;
  tenantId: string;
  correlationId: string;
  validUntil?: Date;
  delegationId?: string;
  substitutionReason?: string;
}

export interface AssignResponsibleOutput {
  assignment: CaseAssignmentRow;
  replaced: boolean;
}

export class AssignResponsibleUseCase {
  constructor(
    private readonly caseRepo: CaseInstanceRepository,
    private readonly assignmentRepo: CaseAssignmentRepository,
    private readonly emitEvent: (event: ReturnType<typeof createCaseExecutionEvent>) => Promise<void>,
  ) {}

  async execute(input: AssignResponsibleInput): Promise<AssignResponsibleOutput> {
    // Validate case is OPEN or ON_HOLD
    const caseRow = await this.caseRepo.findById(input.caseId, input.tenantId);
    if (!caseRow) {
      throw new Error(`Case ${input.caseId} not found.`);
    }
    if (caseRow.status !== "OPEN" && caseRow.status !== "ON_HOLD") {
      throw new CaseNotOpenError(input.caseId, caseRow.status);
    }

    // Deactivate existing assignment for same role (BR-015)
    const existing = await this.assignmentRepo.findActiveByCaseAndRole(
      input.caseId,
      input.processRoleId,
    );
    const replaced = existing !== null;

    if (existing) {
      await this.assignmentRepo.deactivateByRole(
        input.caseId,
        input.processRoleId,
        input.substitutionReason ?? "Reassigned",
      );
    }

    // Create new assignment
    const assignment = await this.assignmentRepo.create({
      caseId: input.caseId,
      stageId: input.stageId,
      processRoleId: input.processRoleId,
      userId: input.userId,
      assignedBy: input.assignedBy,
      assignedAt: new Date(),
      validUntil: input.validUntil ?? null,
      isActive: true,
      substitutionReason: input.substitutionReason ?? null,
      delegationId: input.delegationId ?? null,
    });

    // Emit domain event
    const eventType = replaced
      ? CASE_EXECUTION_EVENT_TYPES.ASSIGNMENT_REPLACED
      : CASE_EXECUTION_EVENT_TYPES.ASSIGNMENT_CREATED;

    await this.emitEvent(
      createCaseExecutionEvent({
        eventType,
        entityId: assignment.id,
        tenantId: input.tenantId,
        createdBy: input.assignedBy,
        correlationId: input.correlationId,
        data: {
          caseId: input.caseId,
          processRoleId: input.processRoleId,
          userId: input.userId,
          replacedUserId: existing?.userId,
        },
      }),
    );

    return { assignment, replaced };
  }
}
