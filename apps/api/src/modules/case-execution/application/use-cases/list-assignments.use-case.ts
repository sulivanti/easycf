/**
 * @contract FR-012, SEC-006
 *
 * Lists active assignments for a case.
 */

import type {
  CaseAssignmentRepository,
  CaseAssignmentRow,
} from '../ports/case-assignment.repository.js';

export interface ListAssignmentsInput {
  caseId: string;
}

export interface ListAssignmentsOutput {
  assignments: CaseAssignmentRow[];
}

export class ListAssignmentsUseCase {
  constructor(private readonly assignmentRepo: CaseAssignmentRepository) {}

  async execute(input: ListAssignmentsInput): Promise<ListAssignmentsOutput> {
    const assignments = await this.assignmentRepo.findActiveByCaseId(input.caseId);
    return { assignments };
  }
}
