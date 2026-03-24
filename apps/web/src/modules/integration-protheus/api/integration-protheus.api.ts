/**
 * @contract FR-001..FR-009, FR-011, INT-008
 *
 * HTTP client functions for the Integration Protheus API.
 * All fetchers accept AbortSignal for React Query cancellation.
 */

import type {
  PaginatedResponse,
  ServiceListItemDTO,
  ServiceDetailDTO,
  CreateServiceRequest,
  UpdateServiceRequest,
  ServiceListFilters,
  IntegrationRoutineListItemDTO,
  IntegrationRoutineConfigDTO,
  ConfigureRoutineRequest,
  FieldMappingDTO,
  CreateFieldMappingRequest,
  UpdateFieldMappingRequest,
  IntegrationParamDTO,
  CreateParamRequest,
  UpdateParamRequest,
  ExecuteIntegrationRequest,
  ExecuteIntegrationResponseDTO,
  CallLogListItemDTO,
  CallLogDetailDTO,
  CallLogListFilters,
  ReprocessRequest,
  ReprocessResponseDTO,
  MetricsDTO,
} from '../types/integration-protheus.types.js';

const BASE = '/api/v1';

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-correlation-id': crypto.randomUUID(),
      ...options?.headers,
    },
    credentials: 'include',
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: res.statusText }));
    throw Object.assign(new Error(error.detail ?? res.statusText), {
      status: res.status,
      correlationId: res.headers.get('x-correlation-id'),
      ...error,
    });
  }
  return res.json();
}

function toQs(params: Record<string, string | number | boolean | undefined>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') qs.set(k, String(v));
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}

// ── Integration Services (FR-001) ──────────────────────────────────────────

/** @contract FR-001 — GET /admin/integration-services */
export function listServices(
  filters: ServiceListFilters = {},
  signal?: AbortSignal,
): Promise<PaginatedResponse<ServiceListItemDTO>> {
  return apiFetch(`${BASE}/admin/integration-services${toQs(filters as Record<string, string>)}`, {
    signal,
  });
}

/** @contract FR-001 — POST /admin/integration-services */
export function createService(data: CreateServiceRequest): Promise<ServiceDetailDTO> {
  return apiFetch(`${BASE}/admin/integration-services`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** @contract FR-001 — PATCH /admin/integration-services/:id */
export function updateService(id: string, data: UpdateServiceRequest): Promise<ServiceDetailDTO> {
  return apiFetch(`${BASE}/admin/integration-services/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// ── Integration Routines (FR-002, FR-008, FR-010) ──────────────────────────

/** @contract FR-002 — GET /admin/routines?type=INTEGRATION */
export function listIntegrationRoutines(
  signal?: AbortSignal,
): Promise<PaginatedResponse<IntegrationRoutineListItemDTO>> {
  return apiFetch(`${BASE}/admin/routines?type=INTEGRATION`, { signal });
}

/** @contract FR-002 — POST /admin/routines/:id/integration-config */
export function configureRoutine(
  routineId: string,
  data: ConfigureRoutineRequest,
): Promise<IntegrationRoutineConfigDTO> {
  return apiFetch(`${BASE}/admin/routines/${routineId}/integration-config`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** @contract FR-008 — POST /admin/routines/:id/fork */
export function forkRoutine(
  routineId: string,
  data: { change_reason: string },
): Promise<{ id: string; version: number }> {
  return apiFetch(`${BASE}/admin/routines/${routineId}/fork`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** @contract FR-010 — POST /admin/routines/:id/publish */
export function publishRoutine(routineId: string): Promise<{ id: string; status: 'PUBLISHED' }> {
  return apiFetch(`${BASE}/admin/routines/${routineId}/publish`, {
    method: 'POST',
  });
}

// ── Field Mappings (FR-003) ────────────────────────────────────────────────

/** @contract FR-003 — POST /admin/routines/:id/field-mappings */
export function createFieldMapping(
  routineId: string,
  data: CreateFieldMappingRequest,
): Promise<FieldMappingDTO> {
  return apiFetch(`${BASE}/admin/routines/${routineId}/field-mappings`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** @contract FR-003 — PATCH /admin/field-mappings/:id */
export function updateFieldMapping(
  id: string,
  data: UpdateFieldMappingRequest,
): Promise<FieldMappingDTO> {
  return apiFetch(`${BASE}/admin/field-mappings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/** @contract FR-003 — DELETE /admin/field-mappings/:id */
export function deleteFieldMapping(id: string): Promise<void> {
  return apiFetch(`${BASE}/admin/field-mappings/${id}`, { method: 'DELETE' });
}

/** @contract FR-003 — GET routine field-mappings (derived from routine detail) */
export function listFieldMappings(
  routineId: string,
  signal?: AbortSignal,
): Promise<FieldMappingDTO[]> {
  return apiFetch(`${BASE}/admin/routines/${routineId}/field-mappings`, { signal });
}

// ── Integration Params (FR-004) ────────────────────────────────────────────

/** @contract FR-004 — POST /admin/routines/:id/params */
export function createParam(
  routineId: string,
  data: CreateParamRequest,
): Promise<IntegrationParamDTO> {
  return apiFetch(`${BASE}/admin/routines/${routineId}/params`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/** @contract FR-004 — PATCH /admin/integration-params/:id */
export function updateParam(id: string, data: UpdateParamRequest): Promise<IntegrationParamDTO> {
  return apiFetch(`${BASE}/admin/integration-params/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/** @contract FR-004 — GET routine params */
export function listParams(
  routineId: string,
  signal?: AbortSignal,
): Promise<IntegrationParamDTO[]> {
  return apiFetch(`${BASE}/admin/routines/${routineId}/params`, { signal });
}

// ── Execution (FR-005, FR-006) ─────────────────────────────────────────────

/** @contract FR-006 — POST /integration-engine/execute */
export function executeIntegration(
  data: ExecuteIntegrationRequest,
): Promise<ExecuteIntegrationResponseDTO> {
  return apiFetch(`${BASE}/integration-engine/execute`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Call Logs (FR-009) ─────────────────────────────────────────────────────

/** @contract FR-009 — GET /admin/integration-logs */
export function listCallLogs(
  filters: CallLogListFilters = {},
  signal?: AbortSignal,
): Promise<PaginatedResponse<CallLogListItemDTO>> {
  return apiFetch(`${BASE}/admin/integration-logs${toQs(filters as Record<string, string>)}`, {
    signal,
  });
}

/** @contract FR-009 — GET /admin/integration-logs/:id */
export function getCallLogDetail(id: string, signal?: AbortSignal): Promise<CallLogDetailDTO> {
  return apiFetch(`${BASE}/admin/integration-logs/${id}`, { signal });
}

// ── Reprocess (FR-007) ─────────────────────────────────────────────────────

/** @contract FR-007 — POST /admin/integration-logs/:id/reprocess */
export function reprocessCallLog(
  logId: string,
  data: ReprocessRequest,
): Promise<ReprocessResponseDTO> {
  return apiFetch(`${BASE}/admin/integration-logs/${logId}/reprocess`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// ── Metrics (FR-011) ───────────────────────────────────────────────────────

/** @contract FR-011 — GET /admin/integration-logs/metrics */
export function getMetrics(signal?: AbortSignal): Promise<MetricsDTO> {
  const now = new Date();
  const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return apiFetch(
    `${BASE}/admin/integration-logs/metrics?period_start=${dayStart.toISOString()}&period_end=${now.toISOString()}`,
    { signal },
  );
}
