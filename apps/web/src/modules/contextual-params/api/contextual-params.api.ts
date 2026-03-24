/**
 * @contract FR-001..FR-009, INT-007
 *
 * HTTP client functions for the Contextual Params API.
 * All fetchers accept AbortSignal for React Query cancellation.
 */

import type {
  PaginatedResponse,
  FramerTypeListItemDTO,
  CreateFramerTypeRequest,
  FramerTypeResponseDTO,
  FramerListItemDTO,
  FramerResponseDTO,
  CreateFramerRequest,
  UpdateFramerRequest,
  FramerListFilters,
  TargetObjectListItemDTO,
  TargetFieldResponseDTO,
  CreateTargetFieldRequest,
  IncidenceRuleListItemDTO,
  IncidenceRuleResponseDTO,
  CreateIncidenceRuleRequest,
  UpdateIncidenceRuleRequest,
  IncidenceRuleListFilters,
  LinkRoutineRequest,
  LinkRoutineResponseDTO,
  RoutineListItemDTO,
  RoutineDetailDTO,
  CreateRoutineRequest,
  UpdateRoutineRequest,
  PublishRoutineRequest,
  PublishRoutineResponseDTO,
  ForkRoutineRequest,
  ForkRoutineResponseDTO,
  RoutineListFilters,
  RoutineItemResponseDTO,
  CreateRoutineItemRequest,
  UpdateRoutineItemRequest,
  EvaluateRequest,
  EvaluateResponseDTO,
} from '../types/contextual-params.types.js';

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

// ── Framer Types (FR-001) ──────────────────────────────────────────────────

export function listFramerTypes(
  signal?: AbortSignal,
): Promise<PaginatedResponse<FramerTypeListItemDTO>> {
  return apiFetch(`${BASE}/admin/framer-types?limit=100`, { signal });
}

export function createFramerType(data: CreateFramerTypeRequest): Promise<FramerTypeResponseDTO> {
  return apiFetch(`${BASE}/admin/framer-types`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'x-idempotency-key': crypto.randomUUID() },
  });
}

// ── Framers (FR-002) ───────────────────────────────────────────────────────

export function listFramers(
  filters: FramerListFilters,
  signal?: AbortSignal,
): Promise<PaginatedResponse<FramerListItemDTO>> {
  return apiFetch(`${BASE}/admin/framers${toQs({ ...filters, limit: filters.limit ?? 20 })}`, {
    signal,
  });
}

export function createFramer(data: CreateFramerRequest): Promise<FramerResponseDTO> {
  return apiFetch(`${BASE}/admin/framers`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'x-idempotency-key': crypto.randomUUID() },
  });
}

export function updateFramer(id: string, data: UpdateFramerRequest): Promise<FramerResponseDTO> {
  return apiFetch(`${BASE}/admin/framers/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteFramer(id: string): Promise<void> {
  return apiFetch(`${BASE}/admin/framers/${id}`, { method: 'DELETE' });
}

// ── Target Objects & Fields (FR-003) ───────────────────────────────────────

export function listTargetObjects(
  signal?: AbortSignal,
): Promise<PaginatedResponse<TargetObjectListItemDTO>> {
  return apiFetch(`${BASE}/admin/target-objects?limit=100`, { signal });
}

export function listTargetFields(
  objectId: string,
  signal?: AbortSignal,
): Promise<PaginatedResponse<TargetFieldResponseDTO>> {
  return apiFetch(`${BASE}/admin/target-objects/${objectId}/fields?limit=100`, { signal });
}

export function createTargetField(
  objectId: string,
  data: CreateTargetFieldRequest,
): Promise<TargetFieldResponseDTO> {
  return apiFetch(`${BASE}/admin/target-objects/${objectId}/fields`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'x-idempotency-key': crypto.randomUUID() },
  });
}

// ── Incidence Rules (FR-004) ───────────────────────────────────────────────

export function listIncidenceRules(
  filters: IncidenceRuleListFilters,
  signal?: AbortSignal,
): Promise<PaginatedResponse<IncidenceRuleListItemDTO>> {
  return apiFetch(
    `${BASE}/admin/incidence-rules${toQs({ ...filters, limit: filters.limit ?? 100 })}`,
    { signal },
  );
}

export function createIncidenceRule(
  data: CreateIncidenceRuleRequest,
): Promise<IncidenceRuleResponseDTO> {
  return apiFetch(`${BASE}/admin/incidence-rules`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'x-idempotency-key': crypto.randomUUID() },
  });
}

export function updateIncidenceRule(
  id: string,
  data: UpdateIncidenceRuleRequest,
): Promise<IncidenceRuleResponseDTO> {
  return apiFetch(`${BASE}/admin/incidence-rules/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function linkRoutineToRule(
  ruleId: string,
  data: LinkRoutineRequest,
): Promise<LinkRoutineResponseDTO> {
  return apiFetch(`${BASE}/admin/incidence-rules/${ruleId}/link-routine`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'x-idempotency-key': crypto.randomUUID() },
  });
}

export function unlinkRoutineFromRule(ruleId: string, routineId: string): Promise<void> {
  return apiFetch(`${BASE}/admin/incidence-rules/${ruleId}/unlink-routine/${routineId}`, {
    method: 'DELETE',
  });
}

// ── Routines (FR-005, FR-007, FR-008) ──────────────────────────────────────

export function listRoutines(
  filters: RoutineListFilters,
  signal?: AbortSignal,
): Promise<PaginatedResponse<RoutineListItemDTO>> {
  return apiFetch(`${BASE}/admin/routines${toQs({ ...filters, limit: filters.limit ?? 20 })}`, {
    signal,
  });
}

export function getRoutineDetail(id: string, signal?: AbortSignal): Promise<RoutineDetailDTO> {
  return apiFetch(`${BASE}/admin/routines/${id}`, { signal });
}

export function createRoutine(data: CreateRoutineRequest): Promise<RoutineDetailDTO> {
  return apiFetch(`${BASE}/admin/routines`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'x-idempotency-key': crypto.randomUUID() },
  });
}

export function updateRoutine(id: string, data: UpdateRoutineRequest): Promise<RoutineDetailDTO> {
  return apiFetch(`${BASE}/admin/routines/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function publishRoutine(
  id: string,
  data?: PublishRoutineRequest,
): Promise<PublishRoutineResponseDTO> {
  return apiFetch(`${BASE}/admin/routines/${id}/publish`, {
    method: 'POST',
    body: JSON.stringify(data ?? {}),
  });
}

export function forkRoutine(id: string, data: ForkRoutineRequest): Promise<ForkRoutineResponseDTO> {
  return apiFetch(`${BASE}/admin/routines/${id}/fork`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'x-idempotency-key': crypto.randomUUID() },
  });
}

// ── Routine Items (FR-006) ─────────────────────────────────────────────────

export function createRoutineItem(
  routineId: string,
  data: CreateRoutineItemRequest,
): Promise<RoutineItemResponseDTO> {
  return apiFetch(`${BASE}/admin/routines/${routineId}/items`, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'x-idempotency-key': crypto.randomUUID() },
  });
}

export function updateRoutineItem(
  itemId: string,
  data: UpdateRoutineItemRequest,
): Promise<RoutineItemResponseDTO> {
  return apiFetch(`${BASE}/admin/routine-items/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export function deleteRoutineItem(itemId: string): Promise<void> {
  return apiFetch(`${BASE}/admin/routine-items/${itemId}`, { method: 'DELETE' });
}

// ── Evaluate Engine (FR-009) ───────────────────────────────────────────────

export function evaluateEngine(data: EvaluateRequest): Promise<EvaluateResponseDTO> {
  return apiFetch(`${BASE}/routine-engine/evaluate`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
