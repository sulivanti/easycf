/**
 * @contract FR-001, FR-002, FR-003, FR-004, FR-005, INT-001, BR-012
 * MOD-003 API client — typed fetch wrappers over Foundation HTTP client.
 * All functions are plain async — hooks in hooks/ wrap them with React Query.
 */

import { httpClient } from '../../foundation/api/http-client.js';
import type { PaginatedResponse, GenericMessage } from '../../foundation/types/common.types.js';
import type {
  OrgUnitTreeResponseDTO,
  OrgUnitListItemDTO,
  OrgUnitDetailDTO,
  OrgUnitResponseDTO,
  CreateOrgUnitRequest,
  UpdateOrgUnitRequest,
  LinkTenantRequest,
  LinkTenantResponseDTO,
  OrgUnitFilters,
} from '../types/org-units.types.js';

// ── Helpers ─────────────────────────────────────────────────

function buildFilterQuery(filters: OrgUnitFilters): string {
  const params: string[] = [];
  if (filters.nivel) params.push(`nivel=${filters.nivel}`);
  if (filters.status) params.push(`status=${encodeURIComponent(filters.status)}`);
  if (filters.parent_id) params.push(`parent_id=${encodeURIComponent(filters.parent_id)}`);
  if (filters.search) params.push(`search=${encodeURIComponent(filters.search)}`);
  if (filters.cursor) params.push(`cursor=${encodeURIComponent(filters.cursor)}`);
  params.push('limit=20');
  return params.length > 0 ? `?${params.join('&')}` : '';
}

// ── Tree ────────────────────────────────────────────────────

/** @contract FR-002, FR-001-C05 — GET /org-units/tree */
export async function fetchOrgTree(
  includeInactive = false,
  signal?: AbortSignal,
): Promise<OrgUnitTreeResponseDTO> {
  const query = includeInactive ? '?include_inactive=true' : '';
  return httpClient.get<OrgUnitTreeResponseDTO>(`/org-units/tree${query}`, { signal });
}

// ── Flat list ───────────────────────────────────────────────

/** @contract FR-005 — GET /org-units with cursor pagination */
export async function fetchOrgUnits(
  filters: OrgUnitFilters,
  signal?: AbortSignal,
): Promise<PaginatedResponse<OrgUnitListItemDTO>> {
  const query = buildFilterQuery(filters);
  return httpClient.get<PaginatedResponse<OrgUnitListItemDTO>>(`/org-units${query}`, { signal });
}

// ── Detail ──────────────────────────────────────────────────

/** @contract FR-001 — GET /org-units/:id */
export async function fetchOrgUnitDetail(
  id: string,
  signal?: AbortSignal,
): Promise<OrgUnitDetailDTO> {
  return httpClient.get<OrgUnitDetailDTO>(`/org-units/${id}`, { signal });
}

// ── Create ──────────────────────────────────────────────────

/** @contract FR-001, BR-012 — POST /org-units with Idempotency-Key */
export async function createOrgUnit(
  data: CreateOrgUnitRequest,
  idempotencyKey: string,
): Promise<OrgUnitResponseDTO> {
  return httpClient.post<OrgUnitResponseDTO>('/org-units', data, { idempotencyKey });
}

// ── Update ──────────────────────────────────────────────────

/** @contract FR-001 — PATCH /org-units/:id */
export async function updateOrgUnit(
  id: string,
  data: UpdateOrgUnitRequest,
): Promise<OrgUnitResponseDTO> {
  return httpClient.patch<OrgUnitResponseDTO>(`/org-units/${id}`, data);
}

// ── Soft delete ─────────────────────────────────────────────

/** @contract FR-001 — DELETE /org-units/:id */
export async function deleteOrgUnit(id: string): Promise<GenericMessage> {
  return httpClient.delete<GenericMessage>(`/org-units/${id}`);
}

// ── Restore ─────────────────────────────────────────────────

/** @contract FR-004 — PATCH /org-units/:id/restore */
export async function restoreOrgUnit(id: string): Promise<GenericMessage> {
  return httpClient.patch<GenericMessage>(`/org-units/${id}/restore`, {});
}

// ── Link tenant ─────────────────────────────────────────────

/** @contract FR-003 — POST /org-units/:id/tenants with Idempotency-Key */
export async function linkTenant(
  orgUnitId: string,
  data: LinkTenantRequest,
  idempotencyKey: string,
): Promise<LinkTenantResponseDTO> {
  return httpClient.post<LinkTenantResponseDTO>(`/org-units/${orgUnitId}/tenants`, data, {
    idempotencyKey,
  });
}

// ── Unlink tenant ───────────────────────────────────────────

/** @contract FR-003 — DELETE /org-units/:id/tenants/:tenantId */
export async function unlinkTenant(orgUnitId: string, tenantId: string): Promise<GenericMessage> {
  return httpClient.delete<GenericMessage>(`/org-units/${orgUnitId}/tenants/${tenantId}`);
}
