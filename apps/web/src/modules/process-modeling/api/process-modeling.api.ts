/**
 * @contract FR-001..FR-011, INT-005
 * MOD-005 API client — typed fetch wrappers over Foundation HTTP client.
 * All functions are plain async — hooks in hooks/ wrap them with React Query.
 */

import { httpClient } from '../../foundation/api/http-client.js';
import type { PaginatedResponse } from '../../foundation/types/common.types.js';
import type {
  FlowResponseDTO,
  CycleListItemDTO,
  CycleDetailDTO,
  CreateCycleRequest,
  UpdateCycleRequest,
  MacroStageDTO,
  CreateMacroStageRequest,
  UpdateMacroStageRequest,
  StageDTO,
  CreateStageRequest,
  UpdateStageRequest,
  GateDTO,
  CreateGateRequest,
  UpdateGateRequest,
  ProcessRoleListItemDTO,
  ProcessRoleDTO,
  CreateProcessRoleRequest,
  UpdateProcessRoleRequest,
  StageRoleLinkDTO,
  LinkStageRoleRequest,
  TransitionDTO,
  CreateTransitionRequest,
  CycleListFilters,
} from '../types/process-modeling.types.js';

// ── Helpers ─────────────────────────────────────────────────

function buildCycleQuery(filters: CycleListFilters): string {
  const params: string[] = [];
  if (filters.status) params.push(`status=${encodeURIComponent(filters.status)}`);
  if (filters.cursor) params.push(`cursor=${encodeURIComponent(filters.cursor)}`);
  params.push(`limit=${filters.limit ?? 50}`);
  return params.length > 0 ? `?${params.join('&')}` : '';
}

// ── Cycles (FR-001) ─────────────────────────────────────────

/** @contract FR-001 — GET /admin/cycles with cursor pagination */
export async function fetchCycles(
  filters: CycleListFilters,
  signal?: AbortSignal,
): Promise<PaginatedResponse<CycleListItemDTO>> {
  const query = buildCycleQuery(filters);
  return httpClient.get<PaginatedResponse<CycleListItemDTO>>(`/admin/cycles${query}`, { signal });
}

/** @contract FR-001 — POST /admin/cycles */
export async function createCycle(data: CreateCycleRequest): Promise<CycleDetailDTO> {
  return httpClient.post<CycleDetailDTO>('/admin/cycles', data);
}

/** @contract FR-001 — PATCH /admin/cycles/:id */
export async function updateCycle(id: string, data: UpdateCycleRequest): Promise<CycleDetailDTO> {
  return httpClient.patch<CycleDetailDTO>(`/admin/cycles/${id}`, data);
}

/** @contract FR-001 — DELETE /admin/cycles/:id (soft-delete) */
export async function deleteCycle(id: string): Promise<void> {
  await httpClient.delete(`/admin/cycles/${id}`);
}

// ── Cycle actions (FR-002, FR-003, FR-004) ──────────────────

/** @contract FR-002 — POST /admin/cycles/:id/publish */
export async function publishCycle(id: string): Promise<CycleDetailDTO> {
  return httpClient.post<CycleDetailDTO>(`/admin/cycles/${id}/publish`, {});
}

/** @contract FR-003 — POST /admin/cycles/:id/fork with Idempotency-Key */
export async function forkCycle(id: string, idempotencyKey: string): Promise<CycleDetailDTO> {
  return httpClient.post<CycleDetailDTO>(`/admin/cycles/${id}/fork`, {}, { idempotencyKey });
}

/** @contract FR-004 — POST /admin/cycles/:id/deprecate */
export async function deprecateCycle(id: string): Promise<CycleDetailDTO> {
  return httpClient.post<CycleDetailDTO>(`/admin/cycles/${id}/deprecate`, {});
}

// ── Flow (FR-011) ───────────────────────────────────────────

/** @contract FR-011 — GET /admin/cycles/:id/flow */
export async function fetchFlow(cycleId: string, signal?: AbortSignal): Promise<FlowResponseDTO> {
  return httpClient.get<FlowResponseDTO>(`/admin/cycles/${cycleId}/flow`, { signal });
}

// ── Macro-stages (FR-005) ───────────────────────────────────

/** @contract FR-005 — POST /admin/cycles/:cid/macro-stages */
export async function createMacroStage(
  cycleId: string,
  data: CreateMacroStageRequest,
): Promise<MacroStageDTO> {
  return httpClient.post<MacroStageDTO>(`/admin/cycles/${cycleId}/macro-stages`, data);
}

/** @contract FR-005 — PATCH /admin/macro-stages/:id */
export async function updateMacroStage(
  id: string,
  data: UpdateMacroStageRequest,
): Promise<MacroStageDTO> {
  return httpClient.patch<MacroStageDTO>(`/admin/macro-stages/${id}`, data);
}

/** @contract FR-005 — DELETE /admin/macro-stages/:id */
export async function deleteMacroStage(id: string): Promise<void> {
  await httpClient.delete(`/admin/macro-stages/${id}`);
}

// ── Stages (FR-006) ─────────────────────────────────────────

/** @contract FR-006 — POST /admin/macro-stages/:mid/stages */
export async function createStage(
  macroStageId: string,
  data: CreateStageRequest,
): Promise<StageDTO> {
  return httpClient.post<StageDTO>(`/admin/macro-stages/${macroStageId}/stages`, data);
}

/** @contract FR-006 — PATCH /admin/stages/:id */
export async function updateStage(id: string, data: UpdateStageRequest): Promise<StageDTO> {
  return httpClient.patch<StageDTO>(`/admin/stages/${id}`, data);
}

/** @contract FR-006 — DELETE /admin/stages/:id */
export async function deleteStage(id: string): Promise<void> {
  await httpClient.delete(`/admin/stages/${id}`);
}

// ── Gates (FR-007) ──────────────────────────────────────────

/** @contract FR-007 — POST /admin/stages/:sid/gates */
export async function createGate(stageId: string, data: CreateGateRequest): Promise<GateDTO> {
  return httpClient.post<GateDTO>(`/admin/stages/${stageId}/gates`, data);
}

/** @contract FR-007 — PATCH /admin/gates/:id */
export async function updateGate(id: string, data: UpdateGateRequest): Promise<GateDTO> {
  return httpClient.patch<GateDTO>(`/admin/gates/${id}`, data);
}

/** @contract FR-007 — DELETE /admin/gates/:id */
export async function deleteGate(id: string): Promise<void> {
  await httpClient.delete(`/admin/gates/${id}`);
}

// ── Process Roles (FR-008) ──────────────────────────────────

/** @contract FR-008 — GET /admin/process-roles */
export async function fetchProcessRoles(
  signal?: AbortSignal,
): Promise<PaginatedResponse<ProcessRoleListItemDTO>> {
  return httpClient.get<PaginatedResponse<ProcessRoleListItemDTO>>(
    '/admin/process-roles?limit=100',
    { signal },
  );
}

/** @contract FR-008 — POST /admin/process-roles */
export async function createProcessRole(
  data: CreateProcessRoleRequest,
): Promise<ProcessRoleListItemDTO> {
  return httpClient.post<ProcessRoleListItemDTO>('/admin/process-roles', data);
}

/** @contract FR-008 — PATCH /admin/process-roles/:id */
export async function updateProcessRole(
  id: string,
  data: UpdateProcessRoleRequest,
): Promise<ProcessRoleDTO> {
  return httpClient.patch<ProcessRoleDTO>(`/admin/process-roles/${id}`, data);
}

// ── Stage-Role links (FR-009) ───────────────────────────────

/** @contract FR-009 — POST /admin/stages/:sid/roles */
export async function linkStageRole(
  stageId: string,
  data: LinkStageRoleRequest,
): Promise<StageRoleLinkDTO> {
  return httpClient.post<StageRoleLinkDTO>(`/admin/stages/${stageId}/roles`, data);
}

/** @contract FR-009 — DELETE /admin/stages/:sid/roles/:rid */
export async function unlinkStageRole(stageId: string, roleId: string): Promise<void> {
  await httpClient.delete(`/admin/stages/${stageId}/roles/${roleId}`);
}

// ── Transitions (FR-010) ────────────────────────────────────

/** @contract FR-010 — POST /admin/stage-transitions */
export async function createTransition(data: CreateTransitionRequest): Promise<TransitionDTO> {
  return httpClient.post<TransitionDTO>('/admin/stage-transitions', data);
}

/** @contract FR-010 — DELETE /admin/stage-transitions/:id */
export async function deleteTransition(id: string): Promise<void> {
  await httpClient.delete(`/admin/stage-transitions/${id}`);
}
