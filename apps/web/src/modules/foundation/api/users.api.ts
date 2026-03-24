/**
 * @contract FR-006
 * Users API client — CRUD with cursor-based pagination.
 */

import { httpClient } from './http-client.js';
import type { PaginationParams, PaginatedResponse } from '../types/common.types.js';
import type {
  CreateUserRequest,
  CreateUserResponse,
  UserListItem,
  UserDetail,
  UpdateUserRequest,
} from '../types/user.types.js';

function buildQuery(params?: PaginationParams & { q?: string }): string {
  if (!params) return '';
  const entries: string[] = [];
  if (params.cursor) entries.push(`cursor=${encodeURIComponent(params.cursor)}`);
  if (params.limit) entries.push(`limit=${params.limit}`);
  if (params.q) entries.push(`q=${encodeURIComponent(params.q)}`);
  return entries.length > 0 ? `?${entries.join('&')}` : '';
}

export const usersApi = {
  /** @contract FR-006 — GET /users */
  list(params?: PaginationParams & { q?: string }): Promise<PaginatedResponse<UserListItem>> {
    return httpClient.get<PaginatedResponse<UserListItem>>(`/users${buildQuery(params)}`);
  },

  /** @contract FR-006 — GET /users/:id */
  get(id: string): Promise<UserDetail> {
    return httpClient.get<UserDetail>(`/users/${id}`);
  },

  /** @contract FR-006 — POST /users */
  create(data: CreateUserRequest): Promise<CreateUserResponse> {
    return httpClient.post<CreateUserResponse>('/users', data, {
      idempotencyKey: crypto.randomUUID(),
    });
  },

  /** @contract FR-006 — PATCH /users/:id */
  update(id: string, data: UpdateUserRequest): Promise<void> {
    return httpClient.patch<void>(`/users/${id}`, data);
  },

  /** @contract FR-006 — DELETE /users/:id (soft delete) */
  delete(id: string): Promise<void> {
    return httpClient.delete<void>(`/users/${id}`);
  },

  /** @contract FR-006 — POST /users/:id/invite/resend */
  resendInvite(id: string): Promise<{ message: string }> {
    return httpClient.post<{ message: string }>(`/users/${id}/invite/resend`, undefined, {
      idempotencyKey: crypto.randomUUID(),
    });
  },
};
