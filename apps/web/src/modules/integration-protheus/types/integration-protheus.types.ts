/**
 * @contract INT-008, DATA-008, EX-OAS-001
 * MOD-008 DTO types for Integration Protheus.
 * Aligned with OpenAPI schemas in apps/api/openapi/mod-008-integration-protheus.yaml.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------
export type AuthType = 'NONE' | 'BASIC' | 'BEARER' | 'OAUTH2';
export type ServiceStatus = 'ACTIVE' | 'INACTIVE';
export type Environment = 'PROD' | 'HML' | 'DEV';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export type MappingType = 'FIELD' | 'PARAM' | 'HEADER' | 'FIXED_VALUE' | 'DERIVED';
export type ParamType = 'FIXED' | 'DERIVED_FROM_TENANT' | 'DERIVED_FROM_CONTEXT' | 'HEADER';
export type CallLogStatus = 'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'DLQ' | 'REPROCESSED';
export type RoutineStatus = 'DRAFT' | 'PUBLISHED' | 'DEPRECATED';

// ---------------------------------------------------------------------------
// Integration Service
// ---------------------------------------------------------------------------
export interface ServiceListItemDTO {
  id: string;
  codigo: string;
  nome: string;
  base_url: string;
  auth_type: AuthType;
  timeout_ms: number;
  status: ServiceStatus;
  environment: Environment;
  created_at: string;
}

export interface ServiceDetailDTO {
  id: string;
  tenant_id: string;
  codigo: string;
  nome: string;
  base_url: string;
  auth_type: AuthType;
  auth_config: string; // Always "***" (BR-002)
  timeout_ms: number;
  status: ServiceStatus;
  environment: Environment;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateServiceRequest {
  codigo: string;
  nome: string;
  base_url: string;
  auth_type: AuthType;
  auth_config?: Record<string, unknown> | null;
  timeout_ms?: number;
  environment: Environment;
}

export interface UpdateServiceRequest {
  nome?: string;
  base_url?: string;
  auth_type?: AuthType;
  auth_config?: Record<string, unknown> | null;
  timeout_ms?: number;
  status?: ServiceStatus;
  environment?: Environment;
}

// ---------------------------------------------------------------------------
// Integration Routine Configuration
// ---------------------------------------------------------------------------
export interface IntegrationRoutineListItemDTO {
  id: string;
  routine_id: string;
  codigo: string;
  nome: string;
  service_name: string | null;
  service_environment: Environment | null;
  version: number;
  status: RoutineStatus;
  mappings_count: number;
  created_at: string;
}

export interface IntegrationRoutineConfigDTO {
  id: string;
  routine_id: string;
  service_id: string;
  http_method: HttpMethod;
  endpoint_tpl: string;
  timeout_ms: number | null;
  retry_max: number;
  retry_backoff_ms: number;
  trigger_events: string[];
}

export interface ConfigureRoutineRequest {
  service_id: string;
  http_method: HttpMethod;
  endpoint_tpl: string;
  content_type?: string;
  timeout_ms?: number;
  retry_max?: number;
  retry_backoff_ms?: number;
  trigger_events?: string[];
}

// ---------------------------------------------------------------------------
// Field Mappings
// ---------------------------------------------------------------------------
export interface FieldMappingDTO {
  id: string;
  routine_id: string;
  source_field: string;
  target_field: string;
  mapping_type: MappingType;
  required: boolean;
  transform_expr: string | null;
  condition_expr: string | null;
  default_value: string | null;
  ordem: number;
}

export interface CreateFieldMappingRequest {
  source_field: string;
  target_field: string;
  mapping_type: MappingType;
  required?: boolean;
  transform_expr?: string | null;
  condition_expr?: string | null;
  default_value?: string | null;
  ordem: number;
}

export interface UpdateFieldMappingRequest {
  source_field?: string;
  target_field?: string;
  mapping_type?: MappingType;
  required?: boolean;
  transform_expr?: string | null;
  condition_expr?: string | null;
  default_value?: string | null;
  ordem?: number;
}

// ---------------------------------------------------------------------------
// Integration Params
// ---------------------------------------------------------------------------
export interface IntegrationParamDTO {
  id: string;
  routine_id: string;
  param_key: string;
  param_type: ParamType;
  value: string | null; // "***" if is_sensitive
  derivation_expr: string | null;
  is_sensitive: boolean;
}

export interface CreateParamRequest {
  param_key: string;
  param_type: ParamType;
  value?: string | null;
  derivation_expr?: string | null;
  is_sensitive?: boolean;
}

export interface UpdateParamRequest {
  param_key?: string;
  param_type?: ParamType;
  value?: string | null;
  derivation_expr?: string | null;
  is_sensitive?: boolean;
}

// ---------------------------------------------------------------------------
// Execution
// ---------------------------------------------------------------------------
export interface ExecuteIntegrationRequest {
  routine_id: string;
  case_id?: string;
  context?: Record<string, unknown>;
}

export interface ExecuteIntegrationResponseDTO {
  call_log_id: string;
  status: 'QUEUED';
  correlation_id: string;
}

// ---------------------------------------------------------------------------
// Call Logs
// ---------------------------------------------------------------------------
export interface CallLogListItemDTO {
  id: string;
  routine_id: string;
  routine_name: string | null;
  routine_version: number | null;
  case_id: string | null;
  correlation_id: string;
  status: CallLogStatus;
  attempt_number: number;
  retry_max: number;
  parent_log_id: string | null;
  response_status: number | null;
  error_message: string | null;
  duration_ms: number | null;
  queued_at: string;
  created_at: string;
}

export interface CallLogDetailDTO {
  id: string;
  routine_id: string;
  routine_name: string | null;
  case_id: string | null;
  correlation_id: string;
  status: CallLogStatus;
  attempt_number: number;
  retry_max: number;
  parent_log_id: string | null;
  request_payload: Record<string, unknown> | null;
  request_headers: Record<string, unknown> | null;
  response_status: number | null;
  response_body: Record<string, unknown> | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  duration_ms: number | null;
  queued_at: string;
  reprocess_reason: string | null;
  reprocessed_by: string | null;
  created_at: string;
}

export interface ReprocessRequest {
  reason: string;
}

export interface ReprocessResponseDTO {
  new_call_log_id: string;
  reprocess_request_id: string;
  status: 'QUEUED';
}

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------
export interface MetricsDTO {
  total: number;
  success: number;
  failed: number;
  dlq: number;
  running: number;
  queued: number;
  success_rate: number;
}

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------
export interface ServiceListFilters {
  status?: ServiceStatus;
  environment?: Environment;
  cursor?: string;
  limit?: number;
}

export interface CallLogListFilters {
  routine_id?: string;
  status?: CallLogStatus;
  service_id?: string;
  correlation_id?: string;
  period_start?: string;
  period_end?: string;
  cursor?: string;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Paginated response (reused from foundation)
// ---------------------------------------------------------------------------
export interface PaginatedResponse<T> {
  data: T[];
  has_more: boolean;
  next_cursor: string | null;
}
