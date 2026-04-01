/**
 * @contract INT-006, FR-001..FR-014
 *
 * HTTP client functions for the Case Execution API.
 * All fetchers accept AbortSignal for React Query cancellation.
 */

import type {
  CaseListItem,
  CaseDetail,
  GateInstance,
  Assignment,
  CaseEvent,
  TimelineEntry,
  TransitionResult,
  PaginatedResponse,
  CaseListFilters,
  CreateCaseRequest,
} from '../types/case-execution.types.js';

const BASE = '/api/v1/cases';

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

// ── Cases ────────────────────────────────────────────────────────────────────

export function listCases(
  params: CaseListFilters,
  signal?: AbortSignal,
): Promise<PaginatedResponse<CaseListItem>> {
  const qs = new URLSearchParams();
  if (params.cycle_id) qs.set('cycle_id', params.cycle_id);
  if (params.status) qs.set('status', params.status);
  if (params.stage_id) qs.set('stage_id', params.stage_id);
  if (params.object_id) qs.set('object_id', params.object_id);
  if (params.assigned_to_me) qs.set('assigned_to_me', 'true');
  if (params.search) qs.set('search', params.search);
  if (params.opened_after) qs.set('opened_after', params.opened_after);
  if (params.opened_before) qs.set('opened_before', params.opened_before);
  if (params.cursor) qs.set('cursor', params.cursor);
  if (params.limit) qs.set('limit', String(params.limit));
  return apiFetch(`${BASE}?${qs}`, { signal });
}

export function getCaseDetails(caseId: string, signal?: AbortSignal): Promise<CaseDetail> {
  return apiFetch(`${BASE}/${caseId}`, { signal });
}

export function openCase(body: CreateCaseRequest): Promise<CaseDetail> {
  return apiFetch(BASE, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Idempotency-Key': crypto.randomUUID() },
  });
}

// ── Transitions ──────────────────────────────────────────────────────────────

export function transitionStage(
  caseId: string,
  body: {
    target_stage_id: string;
    evidence?: { type: string; content?: string; url?: string };
    motivo?: string;
  },
): Promise<TransitionResult> {
  return apiFetch(`${BASE}/${caseId}/transition`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function controlCase(
  caseId: string,
  action: 'hold' | 'resume' | 'cancel',
  body?: { reason?: string; target_stage_id?: string },
): Promise<{ previous_status: string; new_status: string }> {
  return apiFetch(`${BASE}/${caseId}/${action}`, {
    method: 'POST',
    body: JSON.stringify(body ?? {}),
  });
}

// ── Gates ────────────────────────────────────────────────────────────────────

export function listGates(
  caseId: string,
  stageId?: string,
  signal?: AbortSignal,
): Promise<{ data: GateInstance[] }> {
  const qs = stageId ? `?stage_id=${stageId}` : '';
  return apiFetch(`${BASE}/${caseId}/gates${qs}`, { signal });
}

export function resolveGate(
  caseId: string,
  gateInstanceId: string,
  body: {
    decision?: string;
    parecer?: string;
    evidence?: { type: string; url: string; filename: string };
    checklist_items?: Array<{ id: string; label: string; checked: boolean }>;
  },
): Promise<{ gate_instance_id: string; status: string; decision: string | null }> {
  return apiFetch(`${BASE}/${caseId}/gates/${gateInstanceId}/resolve`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function waiveGate(
  caseId: string,
  gateInstanceId: string,
  body: { motivo: string },
): Promise<{ gate_instance_id: string; status: 'WAIVED' }> {
  return apiFetch(`${BASE}/${caseId}/gates/${gateInstanceId}/waive`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ── Assignments ──────────────────────────────────────────────────────────────

export function listAssignments(
  caseId: string,
  signal?: AbortSignal,
): Promise<{ data: Assignment[] }> {
  return apiFetch(`${BASE}/${caseId}/assignments`, { signal });
}

export function assignResponsible(
  caseId: string,
  body: {
    process_role_id: string;
    user_id: string;
    valid_until?: string;
    delegation_id?: string;
    substitution_reason?: string;
  },
): Promise<Assignment & { replaced: boolean }> {
  return apiFetch(`${BASE}/${caseId}/assignments`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ── Events ───────────────────────────────────────────────────────────────────

export function listEvents(caseId: string, signal?: AbortSignal): Promise<{ data: CaseEvent[] }> {
  return apiFetch(`${BASE}/${caseId}/events`, { signal });
}

export function recordEvent(
  caseId: string,
  body: {
    event_type: string;
    descricao: string;
    metadata?: Record<string, unknown>;
    target_stage_id?: string;
  },
): Promise<CaseEvent> {
  return apiFetch(`${BASE}/${caseId}/events`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

// ── Timeline ─────────────────────────────────────────────────────────────────

export function getTimeline(
  caseId: string,
  signal?: AbortSignal,
): Promise<{ entries: TimelineEntry[]; total: number }> {
  return apiFetch(`${BASE}/${caseId}/timeline`, { signal });
}
