/**
 * @contract FR-008, FR-009
 * Tenants API client — CRUD + tenant-user bindings.
 */

import { httpClient } from './http-client.js';
import type { PaginationParams, PaginatedResponse } from '../types/common.types.js';
import type {
  CreateTenantRequest,
  UpdateTenantRequest,
  TenantListItem,
  AddTenantUserRequest,
  TenantUserListItem,
} from '../types/tenant.types.js';

function buildQuery(params?: PaginationParams): string {
  if (!params) return '';
  const entries: string[] = [];
  if (params.cursor) entries.push(`cursor=${encodeURIComponent(params.cursor)}`);
  if (params.limit) entries.push(`limit=${params.limit}`);
  return entries.length > 0 ? `?${entries.join('&')}` : '';
}

export const tenantsApi = {
  /** @contract FR-008 — GET /tenants */
  list(params?: PaginationParams): Promise<PaginatedResponse<TenantListItem>> {
    return httpClient.get<PaginatedResponse<TenantListItem>>(`/tenants${buildQuery(params)}`);
  },

  /** @contract FR-008 — POST /tenants */
  create(data: CreateTenantRequest): Promise<void> {
    return httpClient.post<void>('/tenants', data);
  },

  /** @contract FR-008 — PATCH /tenants/:id */
  update(id: string, data: UpdateTenantRequest): Promise<void> {
    return httpClient.patch<void>(`/tenants/${id}`, data);
  },

  /** @contract FR-008 — DELETE /tenants/:id (soft delete) */
  delete(id: string): Promise<void> {
    return httpClient.delete<void>(`/tenants/${id}`);
  },

  // -- Tenant-Users --

  /** @contract FR-009 — GET /tenants/:tenantId/users */
  listUsers(
    tenantId: string,
    params?: PaginationParams,
  ): Promise<PaginatedResponse<TenantUserListItem>> {
    return httpClient.get<PaginatedResponse<TenantUserListItem>>(
      `/tenants/${tenantId}/users${buildQuery(params)}`,
    );
  },

  /** @contract FR-009 — POST /tenants/:tenantId/users */
  addUser(tenantId: string, data: AddTenantUserRequest): Promise<void> {
    return httpClient.post<void>(`/tenants/${tenantId}/users`, data);
  },

  /** @contract FR-009 — DELETE /tenants/:tenantId/users/:userId */
  removeUser(tenantId: string, userId: string): Promise<void> {
    return httpClient.delete<void>(`/tenants/${tenantId}/users/${userId}`);
  },
};
