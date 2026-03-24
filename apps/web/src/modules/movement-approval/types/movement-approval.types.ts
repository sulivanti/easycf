/**
 * @contract DATA-009, INT-009, UX-APROV-001, UX-APROV-002
 *
 * TypeScript types for the Movement Approval module frontend.
 */

// ── Enums / Literals ────────────────────────────────────────────────────────

export type MovementStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'AUTO_APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'OVERRIDDEN'
  | 'EXECUTED'
  | 'FAILED';

export type ApprovalDecision = 'APPROVED' | 'REJECTED';

export type MovementOrigin = 'HUMAN' | 'API' | 'MCP' | 'AGENT';

export type ControlRuleOperator = 'EQ' | 'GT' | 'GTE' | 'LT' | 'LTE' | 'BETWEEN' | 'IN';

// ── Control Rules ───────────────────────────────────────────────────────────

export interface ControlRule {
  id: string;
  codigo: string;
  tenant_id: string;
  operation: string;
  entity_type: string;
  description: string | null;
  by_value: boolean;
  value_field: string | null;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  allow_self_approve: boolean;
  created_at: string;
  updated_at: string;
  approval_rules: ApprovalRule[];
}

export interface ControlRuleListItem {
  id: string;
  codigo: string;
  operation: string;
  entity_type: string;
  description: string | null;
  by_value: boolean;
  is_active: boolean;
  valid_from: string;
  valid_until: string | null;
  allow_self_approve: boolean;
  approval_rules_count: number;
}

export interface CreateControlRuleRequest {
  operation: string;
  entity_type: string;
  description?: string;
  by_value?: boolean;
  value_field?: string;
  valid_from: string;
  valid_until?: string;
  allow_self_approve?: boolean;
}

export interface UpdateControlRuleRequest {
  operation?: string;
  entity_type?: string;
  description?: string;
  by_value?: boolean;
  value_field?: string;
  is_active?: boolean;
  valid_from?: string;
  valid_until?: string;
  allow_self_approve?: boolean;
}

// ── Approval Rules (levels within a control rule) ───────────────────────────

export interface ApprovalRule {
  id: string;
  control_rule_id: string;
  level: number;
  role_id: string | null;
  user_id: string | null;
  org_unit_id: string | null;
  min_value: number | null;
  max_value: number | null;
  operator: ControlRuleOperator | null;
  sla_hours: number;
  created_at: string;
  updated_at: string;
}

export interface CreateApprovalRuleRequest {
  level: number;
  role_id?: string;
  user_id?: string;
  org_unit_id?: string;
  min_value?: number;
  max_value?: number;
  operator?: ControlRuleOperator;
  sla_hours: number;
}

export interface UpdateApprovalRuleRequest {
  level?: number;
  role_id?: string | null;
  user_id?: string | null;
  org_unit_id?: string | null;
  min_value?: number | null;
  max_value?: number | null;
  operator?: ControlRuleOperator | null;
  sla_hours?: number;
}

// ── Movements ───────────────────────────────────────────────────────────────

export interface Movement {
  id: string;
  codigo: string;
  tenant_id: string;
  control_rule_id: string;
  operation: string;
  entity_type: string;
  entity_id: string;
  origin: MovementOrigin;
  requester_id: string;
  requester_name: string;
  value: number | null;
  status: MovementStatus;
  current_level: number;
  total_levels: number;
  sla_deadline: string | null;
  created_at: string;
  updated_at: string;
}

export interface MovementDetail extends Movement {
  metadata: Record<string, unknown> | null;
  approval_instances: ApprovalInstance[];
  override_reason: string | null;
  overridden_by: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
}

export interface MovementListParams {
  tab?: 'inbox' | 'all' | 'sent';
  status?: MovementStatus;
  operation?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}

// ── Approval Instances ──────────────────────────────────────────────────────

export interface ApprovalInstance {
  id: string;
  movement_id: string;
  level: number;
  approval_rule_id: string;
  approver_id: string | null;
  approver_name: string | null;
  decision: ApprovalDecision | null;
  opinion: string | null;
  decided_at: string | null;
  sla_deadline: string | null;
  created_at: string;
}

// ── Actions ─────────────────────────────────────────────────────────────────

export interface ApproveRequest {
  opinion: string; // min 10 chars
}

export interface RejectRequest {
  opinion: string; // min 10 chars
}

export interface OverrideRequest {
  justification: string; // min 20 chars
  confirmation: boolean;
}

// ── Engine ───────────────────────────────────────────────────────────────────

export interface EvaluateRequest {
  operation: string;
  entity_type: string;
  entity_id: string;
  value?: number;
}

export interface EvaluateResponse {
  requires_approval: boolean;
  control_rule_id: string | null;
  matched_levels: ApprovalRule[];
  dry_run: boolean;
}

// ── Pagination ──────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  next_cursor: string | null;
  has_more: boolean;
}

// ── Pending Count ───────────────────────────────────────────────────────────

export interface PendingCountResponse {
  count: number;
}
