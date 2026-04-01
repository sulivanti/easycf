/**
 * @contract INT-008, EX-OAS-001, DATA-008, FR-001..FR-009, SEC-008
 *
 * Zod schemas for Integration Protheus endpoints (MOD-008).
 * 15 endpoints across services, routines, mappings, params, engine, logs.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------
export const authTypeEnum = z.enum(['NONE', 'BASIC', 'BEARER', 'OAUTH2']);
export const serviceStatusEnum = z.enum(['ACTIVE', 'INACTIVE']);
export const environmentEnum = z.enum(['PROD', 'HML', 'DEV']);
export const httpMethodEnum = z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
export const mappingTypeEnum = z.enum(['FIELD', 'PARAM', 'HEADER', 'FIXED_VALUE', 'DERIVED']);
export const paramTypeEnum = z.enum([
  'FIXED',
  'DERIVED_FROM_TENANT',
  'DERIVED_FROM_CONTEXT',
  'HEADER',
]);
export const callLogStatusEnum = z.enum([
  'QUEUED',
  'RUNNING',
  'SUCCESS',
  'FAILED',
  'DLQ',
  'REPROCESSED',
]);

// ---------------------------------------------------------------------------
// Param schemas
// ---------------------------------------------------------------------------
export const idParam = z.object({ id: z.string().uuid() });
export const routineIdParam = z.object({ id: z.string().uuid() });

// ---------------------------------------------------------------------------
// POST /admin/integration-services — Create service (FR-001)
// ---------------------------------------------------------------------------
export const createServiceBody = z.object({
  codigo: z.string().min(1).max(50),
  nome: z.string().min(1).max(200),
  base_url: z.string().min(1).max(500).url(),
  auth_type: authTypeEnum,
  auth_config: z.record(z.unknown()).nullable().optional(),
  timeout_ms: z.number().int().min(1).max(120000).optional(),
  environment: environmentEnum,
});

export const serviceResponse = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  base_url: z.string(),
  auth_type: authTypeEnum,
  auth_config: z.string(), // Always "***" (BR-002)
  timeout_ms: z.number().int(),
  status: serviceStatusEnum,
  environment: environmentEnum,
  created_by: z.string().uuid(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ---------------------------------------------------------------------------
// PATCH /admin/integration-services/:id — Update service (FR-001)
// ---------------------------------------------------------------------------
export const updateServiceBody = z.object({
  nome: z.string().min(1).max(200).optional(),
  base_url: z.string().min(1).max(500).url().optional(),
  auth_type: authTypeEnum.optional(),
  auth_config: z.record(z.unknown()).nullable().optional(),
  timeout_ms: z.number().int().min(1).max(120000).optional(),
  status: serviceStatusEnum.optional(),
  environment: environmentEnum.optional(),
});

// ---------------------------------------------------------------------------
// GET /admin/integration-services — List services (FR-001)
// ---------------------------------------------------------------------------
export const servicesListQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  status: serviceStatusEnum.optional(),
  environment: environmentEnum.optional(),
});

export const serviceListItem = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  base_url: z.string(),
  auth_type: authTypeEnum,
  timeout_ms: z.number().int(),
  status: serviceStatusEnum,
  environment: environmentEnum,
  created_at: z.string(),
});

// ---------------------------------------------------------------------------
// POST /admin/routines/:id/integration-config — Configure routine (FR-002)
// ---------------------------------------------------------------------------
export const configureRoutineBody = z.object({
  service_id: z.string().uuid(),
  http_method: httpMethodEnum,
  endpoint_tpl: z.string().min(1).max(500),
  content_type: z.string().max(100).optional(),
  timeout_ms: z.number().int().min(1).max(120000).optional(),
  retry_max: z.number().int().min(0).max(10).optional(),
  retry_backoff_ms: z.number().int().min(100).max(60000).optional(),
  trigger_events: z.array(z.string()).optional(),
});

export const integrationRoutineResponse = z.object({
  id: z.string().uuid(),
  routine_id: z.string().uuid(),
  service_id: z.string().uuid(),
  http_method: httpMethodEnum,
  endpoint_tpl: z.string(),
  retry_max: z.number().int(),
  retry_backoff_ms: z.number().int(),
});

// ---------------------------------------------------------------------------
// POST /admin/routines/:id/field-mappings — Create mapping (FR-003)
// ---------------------------------------------------------------------------
export const createFieldMappingBody = z.object({
  source_field: z.string().min(1).max(200),
  target_field: z.string().min(1).max(200),
  mapping_type: mappingTypeEnum,
  required: z.boolean().optional(),
  transform_expr: z.string().max(500).nullable().optional(),
  condition_expr: z.string().max(500).nullable().optional(),
  default_value: z.string().max(500).nullable().optional(),
  ordem: z.number().int().min(1),
});

// ---------------------------------------------------------------------------
// PATCH /admin/field-mappings/:id — Update mapping (FR-003)
// ---------------------------------------------------------------------------
export const updateFieldMappingBody = z.object({
  source_field: z.string().min(1).max(200).optional(),
  target_field: z.string().min(1).max(200).optional(),
  mapping_type: mappingTypeEnum.optional(),
  required: z.boolean().optional(),
  transform_expr: z.string().max(500).nullable().optional(),
  condition_expr: z.string().max(500).nullable().optional(),
  default_value: z.string().max(500).nullable().optional(),
  ordem: z.number().int().min(1).optional(),
});

export const fieldMappingResponse = z.object({
  id: z.string().uuid(),
  routine_id: z.string().uuid(),
  source_field: z.string(),
  target_field: z.string(),
  mapping_type: mappingTypeEnum,
  required: z.boolean(),
  transform_expr: z.string().nullable(),
  condition_expr: z.string().nullable(),
  default_value: z.string().nullable(),
  ordem: z.number().int(),
});

// ---------------------------------------------------------------------------
// POST /admin/routines/:id/params — Create param (FR-004)
// ---------------------------------------------------------------------------
export const createParamBody = z.object({
  param_key: z.string().min(1).max(100),
  param_type: paramTypeEnum,
  value: z.string().max(500).nullable().optional(),
  derivation_expr: z.string().max(500).nullable().optional(),
  is_sensitive: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// PATCH /admin/integration-params/:id — Update param (FR-004)
// ---------------------------------------------------------------------------
export const updateParamBody = z.object({
  param_key: z.string().min(1).max(100).optional(),
  param_type: paramTypeEnum.optional(),
  value: z.string().max(500).nullable().optional(),
  derivation_expr: z.string().max(500).nullable().optional(),
  is_sensitive: z.boolean().optional(),
});

export const paramResponse = z.object({
  id: z.string().uuid(),
  routine_id: z.string().uuid(),
  param_key: z.string(),
  param_type: paramTypeEnum,
  value: z.string().nullable(), // "***" if is_sensitive (BR-005)
  derivation_expr: z.string().nullable(),
  is_sensitive: z.boolean(),
});

// ---------------------------------------------------------------------------
// POST /integration-engine/execute — Execute integration (FR-006)
// ---------------------------------------------------------------------------
export const executeIntegrationBody = z.object({
  routine_id: z.string().uuid(),
  case_id: z.string().uuid().optional(),
  context: z.record(z.unknown()).optional(),
});

export const executeIntegrationResponse = z.object({
  call_log_id: z.string().uuid(),
  status: z.literal('QUEUED'),
  correlation_id: z.string(),
});

// ---------------------------------------------------------------------------
// GET /admin/integration-logs — List logs (FR-009)
// ---------------------------------------------------------------------------
export const logsListQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  routine_id: z.string().uuid().optional(),
  status: callLogStatusEnum.optional(),
  service_id: z.string().uuid().optional(),
  correlation_id: z.string().optional(),
  period_start: z.string().optional(),
  period_end: z.string().optional(),
});

export const callLogListItem = z.object({
  id: z.string().uuid(),
  routine_id: z.string().uuid(),
  case_id: z.string().uuid().nullable(),
  correlation_id: z.string(),
  status: callLogStatusEnum,
  attempt_number: z.number().int(),
  parent_log_id: z.string().uuid().nullable(),
  response_status: z.number().int().nullable(),
  error_message: z.string().nullable(),
  duration_ms: z.number().int().nullable(),
  queued_at: z.string(),
  created_at: z.string(),
});

export const callLogDetailResponse = z.object({
  id: z.string().uuid(),
  routine_id: z.string().uuid(),
  case_id: z.string().uuid().nullable(),
  correlation_id: z.string(),
  status: callLogStatusEnum,
  attempt_number: z.number().int(),
  parent_log_id: z.string().uuid().nullable(),
  request_payload: z.record(z.unknown()).nullable(),
  request_headers: z.record(z.unknown()).nullable(),
  response_status: z.number().int().nullable(),
  response_body: z.record(z.unknown()).nullable(),
  error_message: z.string().nullable(),
  started_at: z.string().nullable(),
  completed_at: z.string().nullable(),
  duration_ms: z.number().int().nullable(),
  queued_at: z.string(),
  reprocess_reason: z.string().nullable(),
  reprocessed_by: z.string().uuid().nullable(),
  created_at: z.string(),
});

// ---------------------------------------------------------------------------
// POST /admin/integration-logs/:id/reprocess — Reprocess DLQ (FR-007)
// ---------------------------------------------------------------------------
export const reprocessBody = z.object({
  reason: z.string().min(10).max(2000),
});

export const reprocessResponse = z.object({
  new_call_log_id: z.string().uuid(),
  reprocess_request_id: z.string().uuid(),
  status: z.literal('QUEUED'),
});

// ---------------------------------------------------------------------------
// Metrics (FR-011, FR-008-M01)
// ---------------------------------------------------------------------------
export const metricsQuery = z.object({
  period_start: z.string().optional(),
  period_end: z.string().optional(),
});

export const metricsResponse = z.object({
  total: z.number().int(),
  success: z.number().int(),
  failed: z.number().int(),
  dlq: z.number().int(),
  running: z.number().int(),
  queued: z.number().int(),
  success_rate: z.number(),
  /** @contract FR-008-M01 — Average latency in ms, integer, nullable */
  avg_latency_ms: z.number().int().nullable(),
});
