/**
 * @contract DATA-006, INT-006, UX-006
 *
 * TypeScript types for the Case Execution module frontend.
 */

export type CaseStatus = "OPEN" | "COMPLETED" | "CANCELLED" | "ON_HOLD";
export type GateResolutionStatus = "PENDING" | "RESOLVED" | "WAIVED" | "REJECTED";
export type GateDecision = "APPROVED" | "REJECTED" | "WAIVED";
export type CaseEventType =
  | "COMMENT" | "EXCEPTION" | "REOPENED" | "EVIDENCE"
  | "REASSIGNED" | "ON_HOLD" | "RESUMED" | "STAGE_TRANSITIONED";

export interface CaseListItem {
  id: string;
  codigo: string;
  cycle_id: string;
  current_stage_id: string;
  status: CaseStatus;
  object_type: string | null;
  object_id: string | null;
  org_unit_id: string | null;
  opened_by: string;
  opened_at: string;
  pending_gates_count: number;
}

export interface CaseDetail {
  id: string;
  codigo: string;
  cycle_id: string;
  cycle_version_id: string;
  current_stage_id: string;
  status: CaseStatus;
  object_type: string | null;
  object_id: string | null;
  org_unit_id: string | null;
  opened_by: string;
  opened_at: string;
  completed_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  current_stage_gates: GateInstance[];
  active_assignments: Assignment[];
}

export interface GateInstance {
  id: string;
  case_id: string;
  gate_id: string;
  stage_id: string;
  status: GateResolutionStatus;
  resolved_by: string | null;
  resolved_at: string | null;
  decision: GateDecision | null;
  parecer: string | null;
}

export interface Assignment {
  id: string;
  case_id: string;
  stage_id: string;
  process_role_id: string;
  user_id: string;
  assigned_by: string;
  assigned_at: string;
  valid_until: string | null;
  is_active: boolean;
  delegation_id?: string | null;
}

export interface CaseEvent {
  id: string;
  case_id: string;
  event_type: CaseEventType;
  descricao: string;
  created_by: string;
  created_at: string;
  stage_id: string;
  metadata: Record<string, unknown> | null;
}

export interface TimelineEntry {
  id: string;
  source: "stage_history" | "gate_instance" | "case_event" | "case_assignment";
  timestamp: string;
  data: Record<string, unknown>;
}

export interface TransitionResult {
  transition_id: string;
  from_stage_id: string;
  to_stage_id: string;
  is_terminal: boolean;
  case_completed: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { next_cursor: string | null; has_more: boolean };
}
