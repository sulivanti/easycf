/**
 * @contract FR-007, INT-001, SEC-001-M01
 * MOD-003 F05 API client — typed fetch wrappers over Foundation HTTP client.
 * All functions are plain async — hooks in hooks/ wrap them with React Query.
 */

import { httpClient } from '../../foundation/api/http-client.js';
import type { PaginatedResponse, GenericMessage } from '../../foundation/types/common.types.js';
import type {
  DepartmentListItemDTO,
  DepartmentDetailDTO,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  DepartmentFilters,
} from '../types/departments.types.js';

// ── Helpers ─────────────────────────────────────────────────

function buildFilterQuery(filters: DepartmentFilters): string {
  const params: string[] = [];
  if (filters.status) params.push(`status=${encodeURIComponent(filters.status)}`);
  if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
  if (filters.cursor) params.push(`cursor=${encodeURIComponent(filters.cursor)}`);
  params.push(`limit=${filters.limit ?? 20}`);
  return params.length > 0 ? `?${params.join('&')}` : '';
}

// ── List ────────────────────────────────────────────────────

/** @contract FR-007 — GET /departments with cursor pagination */
export async function fetchDepartments(
  filters: DepartmentFilters,
  signal?: AbortSignal,
): Promise<PaginatedResponse<DepartmentListItemDTO>> {
  const query = buildFilterQuery(filters);
  return httpClient.get<PaginatedResponse<DepartmentListItemDTO>>(`/departments${query}`, { signal });
}

// ── Detail ──────────────────────────────────────────────────

/** @contract FR-007 — GET /departments/:id */
export async function fetchDepartmentDetail(
  id: string,
  signal?: AbortSignal,
): Promise<DepartmentDetailDTO> {
  return httpClient.get<DepartmentDetailDTO>(`/departments/${id}`, { signal });
}

// ── Create ──────────────────────────────────────────────────

/** @contract FR-007 — POST /departments with Idempotency-Key */
export async function createDepartment(
  data: CreateDepartmentRequest,
  idempotencyKey: string,
): Promise<DepartmentDetailDTO> {
  return httpClient.post<DepartmentDetailDTO>('/departments', data, { idempotencyKey });
}

// ── Update ──────────────────────────────────────────────────

/** @contract FR-007 — PATCH /departments/:id */
export async function updateDepartment(
  id: string,
  data: UpdateDepartmentRequest,
): Promise<DepartmentDetailDTO> {
  return httpClient.patch<DepartmentDetailDTO>(`/departments/${id}`, data);
}

// ── Soft delete ─────────────────────────────────────────────

/** @contract FR-007 — DELETE /departments/:id */
export async function deleteDepartment(id: string): Promise<GenericMessage> {
  return httpClient.delete<GenericMessage>(`/departments/${id}`);
}

// ── Restore ─────────────────────────────────────────────────

/** @contract FR-007 — PATCH /departments/:id/restore */
export async function restoreDepartment(id: string): Promise<DepartmentDetailDTO> {
  return httpClient.patch<DepartmentDetailDTO>(`/departments/${id}/restore`, {});
}
