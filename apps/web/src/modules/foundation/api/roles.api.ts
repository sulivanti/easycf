/**
 * @contract FR-007, FR-010
 * Roles API client — CRUD with scope management.
 */

import { httpClient } from './http-client.js';
import type { PaginationParams, PaginatedResponse } from '../types/common.types.js';
import type {
  CreateRoleRequest,
  UpdateRoleRequest,
  RoleListItem,
  RoleDetail,
} from '../types/role.types.js';

function buildQuery(params?: PaginationParams): string {
  if (!params) return '';
  const entries: string[] = [];
  if (params.cursor) entries.push(`cursor=${encodeURIComponent(params.cursor)}`);
  if (params.limit) entries.push(`limit=${params.limit}`);
  return entries.length > 0 ? `?${entries.join('&')}` : '';
}

export const rolesApi = {
  /** @contract FR-007 — GET /roles */
  list(params?: PaginationParams): Promise<PaginatedResponse<RoleListItem>> {
    return httpClient.get<PaginatedResponse<RoleListItem>>(`/roles${buildQuery(params)}`);
  },

  /** @contract FR-007 — GET /roles/:id */
  get(id: string): Promise<RoleDetail> {
    return httpClient.get<RoleDetail>(`/roles/${id}`);
  },

  /** @contract FR-007 — POST /roles */
  create(data: CreateRoleRequest): Promise<void> {
    return httpClient.post<void>('/roles', data);
  },

  /** @contract FR-007 — PUT /roles/:id (full scope replacement — BR-006) */
  update(id: string, data: UpdateRoleRequest): Promise<void> {
    return httpClient.put<void>(`/roles/${id}`, data);
  },

  /** @contract FR-007 — DELETE /roles/:id (soft delete) */
  delete(id: string): Promise<void> {
    return httpClient.delete<void>(`/roles/${id}`);
  },
};
