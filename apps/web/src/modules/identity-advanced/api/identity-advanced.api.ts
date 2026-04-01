/**
 * @contract FR-001, FR-001.1, FR-001.2, FR-001.3, FR-001-M01, INT-001
 * MOD-004 API client — typed fetch wrappers over Foundation HTTP client.
 * All functions are plain async — hooks in hooks/ wrap them with React Query.
 */

import { httpClient } from '../../foundation/api/http-client.js';
import type {
  OrgScopeDTO,
  CreateOrgScopeRequest,
  AccessShareDTO,
  CreateAccessShareRequest,
  AccessShareFilters,
  PaginatedSharesResponse,
  AccessDelegationDTO,
  CreateAccessDelegationRequest,
  DelegationsResponseDTO,
  OrgScopesGroupedFilters,
  PaginatedOrgScopesGroupedResponse,
} from '../types/identity-advanced.types.js';
import type { GenericMessage } from '../../foundation/types/common.types.js';

// ── Helpers ─────────────────────────────────────────────────

function buildShareFilterQuery(filters: AccessShareFilters): string {
  const params: string[] = [];
  if (filters.status) params.push(`status=${encodeURIComponent(filters.status)}`);
  if (filters.grantee_id) params.push(`grantee_id=${encodeURIComponent(filters.grantee_id)}`);
  if (filters.q) params.push(`q=${encodeURIComponent(filters.q)}`);
  if (filters.sort) params.push(`sort=${encodeURIComponent(filters.sort)}`);
  if (filters.cursor) params.push(`cursor=${encodeURIComponent(filters.cursor)}`);
  params.push('limit=20');
  return params.length > 0 ? `?${params.join('&')}` : '';
}

// ── Org Scopes (FR-001.1) ───────────────────────────────────

/** @contract FR-001.1 — GET /admin/users/:id/org-scopes */
export async function fetchOrgScopes(userId: string, signal?: AbortSignal): Promise<OrgScopeDTO[]> {
  return httpClient.get<OrgScopeDTO[]>(`/admin/users/${userId}/org-scopes`, { signal });
}

/** @contract FR-001.1 — POST /admin/users/:id/org-scopes with Idempotency-Key */
export async function createOrgScope(
  userId: string,
  data: CreateOrgScopeRequest,
  idempotencyKey: string,
): Promise<OrgScopeDTO> {
  return httpClient.post<OrgScopeDTO>(`/admin/users/${userId}/org-scopes`, data, {
    idempotencyKey,
  });
}

/** @contract FR-001.1 — DELETE /admin/users/:id/org-scopes/:scopeId */
export async function deleteOrgScope(userId: string, scopeId: string): Promise<GenericMessage> {
  return httpClient.delete<GenericMessage>(`/admin/users/${userId}/org-scopes/${scopeId}`);
}

/** @contract FR-001.1 — GET /my/org-scopes */
export async function fetchMyOrgScopes(signal?: AbortSignal): Promise<OrgScopeDTO[]> {
  return httpClient.get<OrgScopeDTO[]>('/my/org-scopes', { signal });
}

// ── Access Shares (FR-001.2) ────────────────────────────────

/** @contract FR-001.2 — GET /admin/access-shares with cursor pagination */
export async function fetchAccessShares(
  filters: AccessShareFilters,
  signal?: AbortSignal,
): Promise<PaginatedSharesResponse> {
  const query = buildShareFilterQuery(filters);
  return httpClient.get<PaginatedSharesResponse>(`/admin/access-shares${query}`, { signal });
}

/** @contract FR-001.2 — POST /admin/access-shares with Idempotency-Key */
export async function createAccessShare(
  data: CreateAccessShareRequest,
  idempotencyKey: string,
): Promise<AccessShareDTO> {
  return httpClient.post<AccessShareDTO>('/admin/access-shares', data, { idempotencyKey });
}

/** @contract FR-001.2 — DELETE /admin/access-shares/:id */
export async function revokeAccessShare(id: string): Promise<GenericMessage> {
  return httpClient.delete<GenericMessage>(`/admin/access-shares/${id}`);
}

/** @contract FR-001.2 — GET /my/shared-accesses */
export async function fetchMySharedAccesses(signal?: AbortSignal): Promise<AccessShareDTO[]> {
  return httpClient.get<AccessShareDTO[]>('/my/shared-accesses', { signal });
}

// ── Access Delegations (FR-001.3) ───────────────────────────

/** @contract FR-001.3 — GET /access-delegations (returns given + received) */
export async function fetchDelegations(signal?: AbortSignal): Promise<DelegationsResponseDTO> {
  return httpClient.get<DelegationsResponseDTO>('/access-delegations', { signal });
}

/** @contract FR-001.3 — POST /access-delegations with Idempotency-Key */
export async function createDelegation(
  data: CreateAccessDelegationRequest,
  idempotencyKey: string,
): Promise<AccessDelegationDTO> {
  return httpClient.post<AccessDelegationDTO>('/access-delegations', data, { idempotencyKey });
}

/** @contract FR-001.3 — DELETE /access-delegations/:id */
export async function revokeDelegation(id: string): Promise<GenericMessage> {
  return httpClient.delete<GenericMessage>(`/access-delegations/${id}`);
}

// ── Org Scopes Grouped (FR-001-M01) ─────────────────────────

/** @contract FR-001-M01 D4 — Listagem agrupada de usuários com escopos */
export async function fetchOrgScopesGrouped(
  filters: OrgScopesGroupedFilters,
): Promise<PaginatedOrgScopesGroupedResponse> {
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (filters.scope_type) params.set('scope_type', filters.scope_type);
  if (filters.status) params.set('status', filters.status);
  if (filters.cursor) params.set('cursor', filters.cursor);
  if (filters.limit) params.set('limit', String(filters.limit));

  const qs = params.toString();
  return httpClient.get<PaginatedOrgScopesGroupedResponse>(
    `/api/v1/admin/org-scopes${qs ? `?${qs}` : ''}`,
  );
}
