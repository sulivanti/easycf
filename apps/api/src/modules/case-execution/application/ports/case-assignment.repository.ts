/**
 * @contract DATA-006 §2.4, FR-006, FR-012, ADR-005, BR-015, BR-017
 *
 * Repository port for case_assignments (soft-toggle via is_active).
 */

export interface CaseAssignmentRow {
  id: string;
  caseId: string;
  stageId: string;
  processRoleId: string;
  userId: string;
  assignedBy: string;
  assignedAt: Date;
  validUntil: Date | null;
  isActive: boolean;
  substitutionReason: string | null;
  delegationId: string | null;
}

export interface CaseAssignmentRepository {
  findById(id: string): Promise<CaseAssignmentRow | null>;
  findActiveByCaseId(caseId: string): Promise<CaseAssignmentRow[]>;
  findActiveByCaseAndRole(caseId: string, processRoleId: string): Promise<CaseAssignmentRow | null>;
  create(data: Omit<CaseAssignmentRow, 'id'>): Promise<CaseAssignmentRow>;
  deactivate(id: string, reason: string): Promise<void>;
  deactivateByRole(caseId: string, processRoleId: string, reason: string): Promise<void>;
  findExpired(now: Date): Promise<CaseAssignmentRow[]>;
  findByDelegationIds(delegationIds: string[]): Promise<CaseAssignmentRow[]>;
}
