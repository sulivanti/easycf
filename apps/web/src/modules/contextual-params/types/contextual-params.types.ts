/**
 * @contract DATA-007, FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-009
 * MOD-007 DTO types for Contextual Params module.
 * Aligned with Zod schemas in apps/api/src/modules/contextual-params/presentation/dtos/.
 */

// ---------------------------------------------------------------------------
// Status enums
// ---------------------------------------------------------------------------
export type FramerStatus = 'ACTIVE' | 'INACTIVE';
export type RoutineStatus = 'DRAFT' | 'PUBLISHED' | 'DEPRECATED';
export type RoutineType = 'BEHAVIOR' | 'INTEGRATION';
export type FieldType = 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'BOOLEAN' | 'FILE';

export type ItemType =
  | 'FIELD_VISIBILITY'
  | 'REQUIRED'
  | 'DEFAULT'
  | 'DOMAIN'
  | 'DERIVATION'
  | 'VALIDATION'
  | 'EVIDENCE';

export type ItemAction =
  | 'SHOW'
  | 'HIDE'
  | 'SET_REQUIRED'
  | 'SET_OPTIONAL'
  | 'SET_DEFAULT'
  | 'RESTRICT_DOMAIN'
  | 'VALIDATE'
  | 'REQUIRE_EVIDENCE';

// ---------------------------------------------------------------------------
// Paginated Response
// ---------------------------------------------------------------------------
export interface PaginatedResponse<T> {
  data: T[];
  has_more: boolean;
  next_cursor?: string | null;
}

// ---------------------------------------------------------------------------
// Framer Types (FR-001)
// ---------------------------------------------------------------------------
export interface FramerTypeListItemDTO {
  id: string;
  codigo: string;
  nome: string;
  created_at: string;
}

export interface CreateFramerTypeRequest {
  codigo: string;
  nome: string;
  descricao?: string;
}

export interface FramerTypeResponseDTO {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Framers (FR-002)
// ---------------------------------------------------------------------------
export interface FramerListItemDTO {
  id: string;
  codigo: string;
  nome: string;
  framer_type_id: string;
  status: FramerStatus;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
}

export interface FramerResponseDTO {
  id: string;
  codigo: string;
  nome: string;
  framer_type_id: string;
  status: FramerStatus;
  version: number;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFramerRequest {
  codigo: string;
  nome: string;
  framer_type_id: string;
  valid_from: string;
  valid_until?: string;
}

export interface UpdateFramerRequest {
  nome?: string;
  valid_from?: string;
  valid_until?: string | null;
}

export interface FramerListFilters {
  cursor?: string;
  limit?: number;
  status?: FramerStatus;
  framer_type_id?: string;
}

// ---------------------------------------------------------------------------
// Target Objects & Fields (FR-003)
// ---------------------------------------------------------------------------
export interface TargetObjectListItemDTO {
  id: string;
  codigo: string;
  nome: string;
  modulo_ecf: string | null;
  created_at: string;
}

export interface TargetObjectResponseDTO {
  id: string;
  codigo: string;
  nome: string;
  modulo_ecf: string | null;
  descricao: string | null;
  created_at: string;
  updated_at: string;
}

export interface TargetFieldResponseDTO {
  id: string;
  target_object_id: string;
  field_key: string;
  field_label: string | null;
  field_type: string;
  is_system: boolean;
  created_at: string;
}

export interface CreateTargetFieldRequest {
  field_key: string;
  field_label?: string;
  field_type: FieldType;
  is_system?: boolean;
}

// ---------------------------------------------------------------------------
// Incidence Rules (FR-004)
// ---------------------------------------------------------------------------
export interface IncidenceRuleListItemDTO {
  id: string;
  framer_id: string;
  target_object_id: string;
  status: FramerStatus;
  valid_from: string;
  valid_until: string | null;
  created_at: string;
}

export interface IncidenceRuleResponseDTO {
  id: string;
  framer_id: string;
  target_object_id: string;
  condition_expr: string | null;
  valid_from: string;
  valid_until: string | null;
  status: FramerStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateIncidenceRuleRequest {
  framer_id: string;
  target_object_id: string;
  condition_expr?: string;
  valid_from: string;
  valid_until?: string;
}

export interface UpdateIncidenceRuleRequest {
  valid_from?: string;
  valid_until?: string | null;
  status?: FramerStatus;
}

export interface IncidenceRuleListFilters {
  cursor?: string;
  limit?: number;
  framer_id?: string;
  target_object_id?: string;
  status?: FramerStatus;
}

export interface LinkRoutineRequest {
  routine_id: string;
}

export interface LinkRoutineResponseDTO {
  id: string;
  routine_id: string;
  incidence_rule_id: string;
  created_at: string;
}

// ---------------------------------------------------------------------------
// Routines (FR-005)
// ---------------------------------------------------------------------------
export interface RoutineListItemDTO {
  id: string;
  codigo: string;
  nome: string;
  routine_type: RoutineType;
  version: number;
  status: RoutineStatus;
  published_at: string | null;
  created_at: string;
}

export interface RoutineItemDTO {
  id: string;
  item_type: string;
  target_field_id: string | null;
  action: string;
  value: unknown;
  validation_message: string | null;
  is_blocking: boolean;
  ordem: number;
}

export interface IncidenceLinkDTO {
  id: string;
  incidence_rule_id: string;
  created_at: string;
}

export interface VersionHistoryEntryDTO {
  id: string;
  previous_version_id: string;
  changed_by: string;
  change_reason: string;
  changed_at: string;
}

export interface RoutineDetailDTO {
  id: string;
  codigo: string;
  nome: string;
  routine_type: RoutineType;
  version: number;
  status: RoutineStatus;
  parent_routine_id: string | null;
  published_at: string | null;
  approved_by: string | null;
  created_at: string;
  updated_at: string;
  items: RoutineItemDTO[];
  incidence_links: IncidenceLinkDTO[];
  version_history: VersionHistoryEntryDTO[];
}

export interface CreateRoutineRequest {
  codigo: string;
  nome: string;
  routine_type?: RoutineType;
}

export interface UpdateRoutineRequest {
  nome?: string;
}

export interface PublishRoutineRequest {
  auto_deprecate_previous?: boolean;
}

export interface ForkRoutineRequest {
  change_reason: string;
}

export interface ForkRoutineResponseDTO {
  id: string;
  codigo: string;
  version: number;
  status: 'DRAFT';
  parent_routine_id: string;
  items_copied: number;
  links_copied: number;
}

export interface PublishRoutineResponseDTO {
  id: string;
  status: 'PUBLISHED';
  published_at: string;
  deprecated_parent_id: string | null;
}

export interface RoutineListFilters {
  cursor?: string;
  limit?: number;
  status?: RoutineStatus;
  routine_type?: RoutineType;
}

// ---------------------------------------------------------------------------
// Routine Items (FR-006)
// ---------------------------------------------------------------------------
export interface RoutineItemResponseDTO {
  id: string;
  routine_id: string;
  item_type: string;
  action: string;
  target_field_id: string | null;
  value: unknown;
  validation_message: string | null;
  is_blocking: boolean;
  ordem: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRoutineItemRequest {
  item_type: ItemType;
  action: ItemAction;
  target_field_id?: string;
  value?: unknown;
  condition_expr?: string;
  validation_message?: string;
  is_blocking?: boolean;
  ordem: number;
}

export interface UpdateRoutineItemRequest {
  item_type?: ItemType;
  action?: ItemAction;
  target_field_id?: string | null;
  value?: unknown;
  condition_expr?: string | null;
  validation_message?: string | null;
  is_blocking?: boolean;
  ordem?: number;
}

// ---------------------------------------------------------------------------
// Evaluate Engine (FR-009)
// ---------------------------------------------------------------------------
export interface EvaluateRequest {
  object_type: string;
  object_id?: string;
  context: { framer_id: string }[];
  stage_id?: string;
  dry_run?: boolean;
}

export interface EvaluateResponseDTO {
  visible_fields: string[];
  hidden_fields: string[];
  required_fields: string[];
  optional_fields: string[];
  defaults: { field_id: string; value: unknown }[];
  domain_restrictions: { field_id: string; allowed_values: unknown }[];
  validations: { field_id: string; message: string | null }[];
  blocking_validations: string[];
  applied_routines: { routine_id: string; codigo: string; version: number }[];
  dry_run: boolean;
}
