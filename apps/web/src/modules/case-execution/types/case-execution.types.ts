/**
 * @contract DATA-006, INT-006, UX-006
 *
 * TypeScript types for the Case Execution module frontend.
 */

// ── Enums / Unions ──────────────────────────────────────────────────────────

export type CaseStatus = 'OPEN' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';
export type CasePriority = 'NORMAL' | 'HIGH' | 'URGENT';
export type GateResolutionStatus = 'PENDING' | 'RESOLVED' | 'WAIVED' | 'REJECTED';
export type GateDecision = 'APPROVED' | 'REJECTED' | 'WAIVED';
export type GateType = 'APPROVAL' | 'DOCUMENT' | 'CHECKLIST';
export type CaseEventType =
  | 'COMMENT'
  | 'EXCEPTION'
  | 'REOPENED'
  | 'EVIDENCE'
  | 'REASSIGNED'
  | 'ON_HOLD'
  | 'RESUMED'
  | 'STAGE_TRANSITIONED';

// ── API DTOs ────────────────────────────────────────────────────────────────

export interface CaseListItem {
  id: string;
  codigo: string;
  cycle_id: string;
  cycle_name?: string;
  current_stage_id: string;
  current_stage_name?: string;
  status: CaseStatus;
  priority: CasePriority;
  object_type: string | null;
  object_id: string | null;
  org_unit_id: string | null;
  opened_by: string;
  opened_at: string;
  pending_gates_count: number;
  primary_assignee_name: string | null;
}

export interface CaseDetail {
  id: string;
  codigo: string;
  cycle_id: string;
  cycle_version_id: string;
  current_stage_id: string;
  status: CaseStatus;
  description: string | null;
  priority: CasePriority;
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
  available_transitions: AvailableTransition[];
}

export interface AvailableTransition {
  transition_id: string;
  target_stage_id: string;
  target_stage_name: string;
  evidence_required: boolean;
  allowed_roles: string[];
}

export interface GateInstance {
  id: string;
  case_id: string;
  gate_id: string;
  gate_name?: string;
  gate_type: GateType;
  stage_id: string;
  status: GateResolutionStatus;
  required: boolean;
  resolved_by: string | null;
  resolved_at: string | null;
  decision: GateDecision | null;
  parecer: string | null;
  evidence: GateEvidence | null;
  checklist_items: ChecklistItem[] | null;
}

export interface GateEvidence {
  type: string;
  url: string;
  filename: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

export interface Assignment {
  id: string;
  case_id: string;
  stage_id: string;
  process_role_id: string;
  process_role_name?: string;
  user_id: string;
  user_name?: string;
  assigned_by: string;
  assigned_at: string;
  valid_until: string | null;
  is_active: boolean;
  delegation_id: string | null;
  substitution_reason: string | null;
}

export interface CaseEvent {
  id: string;
  case_id: string;
  event_type: CaseEventType;
  descricao: string;
  created_by: string;
  created_by_name?: string;
  created_at: string;
  stage_id: string;
  metadata: Record<string, unknown> | null;
}

export interface TimelineEntry {
  id: string;
  source: 'stage_history' | 'gate_instance' | 'case_event' | 'case_assignment';
  timestamp: string;
  actor?: { id: string; name: string };
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

// ── Request Bodies ──────────────────────────────────────────────────────────

export interface CreateCaseRequest {
  cycle_id: string;
  object_type?: string;
  object_id?: string;
  org_unit_id?: string;
  description?: string;
  priority?: CasePriority;
  notes?: string;
}

// ── Filters ─────────────────────────────────────────────────────────────────

export interface CaseListFilters {
  cycle_id?: string;
  status?: CaseStatus;
  stage_id?: string;
  object_id?: string;
  assigned_to_me?: boolean;
  opened_after?: string;
  opened_before?: string;
  search?: string;
  cursor?: string;
  limit?: number;
}

// ── UI Metadata ─────────────────────────────────────────────────────────────

export type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

/** Display status includes IN_PROGRESS (derived on frontend when case OPEN + past initial stage) */
export type CaseDisplayStatus = CaseStatus | 'IN_PROGRESS';

export interface StatusStyle {
  label: string;
  color: string;
  bg: string;
  border: string;
}

export const STATUS_STYLE: Record<CaseDisplayStatus, StatusStyle> = {
  OPEN:        { label: 'Aberto',        color: '#2E86C1', bg: '#E3F2FD', border: '1px solid #B5D4F0' },
  IN_PROGRESS: { label: 'Em Andamento',  color: '#B8860B', bg: '#FFF3E0', border: '1px solid #FFE0B2' },
  COMPLETED:   { label: 'Concluído',     color: '#1E7A42', bg: '#E8F8EF', border: '1px solid #B5E8C9' },
  CANCELLED:   { label: 'Cancelado',     color: '#888888', bg: '#F5F5F3', border: '1px solid #E8E8E6' },
  ON_HOLD:     { label: 'Em Espera',     color: '#E67E22', bg: '#FFF3E0', border: '1px solid #FFE0B2' },
};

export const STATUS_META: Record<CaseStatus, { label: string; variant: BadgeVariant }> = {
  OPEN: { label: 'Aberto', variant: 'default' },
  COMPLETED: { label: 'Concluído', variant: 'secondary' },
  CANCELLED: { label: 'Cancelado', variant: 'destructive' },
  ON_HOLD: { label: 'Suspenso', variant: 'outline' },
};

export const GATE_STATUS_META: Record<
  GateResolutionStatus,
  { label: string; variant: BadgeVariant }
> = {
  PENDING: { label: 'Pendente', variant: 'outline' },
  RESOLVED: { label: 'Resolvido', variant: 'default' },
  WAIVED: { label: 'Dispensado', variant: 'secondary' },
  REJECTED: { label: 'Rejeitado', variant: 'destructive' },
};

export const GATE_TYPE_LABELS: Record<GateType, string> = {
  APPROVAL: 'Aprovação',
  DOCUMENT: 'Documento',
  CHECKLIST: 'Checklist',
};

export const TIMELINE_SOURCE_LABELS: Record<TimelineEntry['source'], string> = {
  stage_history: 'Transição',
  gate_instance: 'Gate',
  case_event: 'Evento',
  case_assignment: 'Atribuição',
};

// ── Copy (UX-006 §2.7, §3.7) ───────────────────────────────────────────────

export const COPY = {
  // Success
  transition_success: (stageName: string) => `Caso avançou para '${stageName}'.`,
  gate_approved: (gateName: string) => `Gate '${gateName}' aprovado com sucesso.`,
  gate_rejected: (gateName: string) =>
    `Gate '${gateName}' reprovado. O caso não avança automaticamente.`,
  gate_waived: (gateName: string) =>
    `Gate '${gateName}' dispensado. A ação foi registrada para auditoria.`,
  assignment_created: (userName: string, roleName: string) =>
    `${userName} atribuído como ${roleName}.`,
  assignment_replaced: (prev: string, next: string, role: string) =>
    `${prev} substituído por ${next} como ${role}.`,
  case_cancelled: 'Caso cancelado com sucesso.',
  case_hold: 'Caso colocado em espera.',
  case_resumed: 'Caso retomado com sucesso.',
  case_opened: 'Caso aberto com sucesso.',

  // Empty
  empty_cases: 'Nenhum caso encontrado.',
  empty_cases_filtered: 'Nenhum caso corresponde aos filtros aplicados.',
  empty_search: (term: string) => `Nenhum caso corresponde à busca '${term}'.`,
  empty_gates: 'Este estágio não possui gates.',
  empty_assignments: 'Nenhum responsável atribuído.',
  empty_timeline: 'Nenhum evento registrado ainda.',

  // Errors
  error_load_case: 'Não foi possível carregar o caso.',
  error_load_cases: 'Não foi possível carregar os casos.',

  // Confirmations
  confirm_cancel: 'Tem certeza que deseja cancelar este caso? Esta ação não pode ser desfeita.',
  confirm_waive: 'Esta ação será auditada. Informe o motivo.',
  confirm_reassign: (current: string, next: string, role: string) =>
    `Substituir ${current} por ${next} no papel ${role}?`,

  // Tooltips
  tooltip_gate_pending: (gateName: string) => `Gate '${gateName}' ainda pendente`,
  tooltip_role_not_authorized: 'Seu papel não autoriza esta transição',
} as const;

// ── Helpers ─────────────────────────────────────────────────────────────────

export function isReadonly(status: CaseStatus): boolean {
  return status === 'COMPLETED' || status === 'CANCELLED';
}
