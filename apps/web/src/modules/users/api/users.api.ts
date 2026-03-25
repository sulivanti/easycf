/**
 * @contract FR-001, FR-002, FR-003, INT-001, BR-005
 * MOD-002 API client — typed fetch wrappers over Foundation HTTP client.
 * Delegates to foundation usersApi / rolesApi where possible,
 * adds MOD-002-specific request shaping (filters, idempotency-key).
 */

import { httpClient } from '../../foundation/api/http-client.js';
import { usersApi } from '../../foundation/api/users.api.js';
import { rolesApi } from '../../foundation/api/roles.api.js';
import type { UserListItem, UserDetail } from '../../foundation/types/user.types.js';
import type { PaginatedResponse } from '../../foundation/types/common.types.js';
import type {
  UserFilters,
  UserListItemDTO,
  UserDetailDTO,
  RoleOptionDTO,
  CreateUserRequest,
} from '../types/users.types.js';
import { toRoleOption } from '../types/users.types.js';

// ── Helpers ──────────────────────────────────────────────────

function buildFilterQuery(filters: UserFilters): string {
  const params: string[] = [];
  if (filters.search) params.push(`q=${encodeURIComponent(filters.search)}`);
  if (filters.status) params.push(`status=${encodeURIComponent(filters.status)}`);
  if (filters.roleId) params.push(`role_id=${encodeURIComponent(filters.roleId)}`);
  if (filters.cursor) params.push(`cursor=${encodeURIComponent(filters.cursor)}`);
  params.push('limit=20');
  return params.length > 0 ? `?${params.join('&')}` : '';
}

function mapUserListItem(item: UserListItem): UserListItemDTO {
  return {
    id: item.id,
    fullName: item.full_name,
    email: item.email,
    status: (item.status as UserListItemDTO['status']) ?? 'ACTIVE',
    roleId: item.role_id ?? '',
    roleName: item.role_name ?? '',
    createdAt: item.created_at,
  };
}

function mapUserDetail(detail: UserDetail): UserDetailDTO {
  return {
    id: detail.id,
    fullName: detail.full_name,
    status: (detail.status as UserDetailDTO['status']) ?? 'ACTIVE',
    inviteTokenExpired: detail.invite_token_expired ?? false,
    createdAt: detail.created_at,
  };
}

// ── Exported API functions ───────────────────────────────────

/** @contract FR-001 — GET /users with filters */
export async function fetchUsers(
  filters: UserFilters,
  signal?: AbortSignal,
): Promise<{ data: UserListItemDTO[]; nextCursor: string | null; total: number }> {
  const query = buildFilterQuery(filters);
  const res = await httpClient.get<PaginatedResponse<UserListItem>>(`/users${query}`, { signal });
  return {
    data: res.data.map(mapUserListItem),
    nextCursor: res.next_cursor ?? null,
    total: res.data.length,
  };
}

/** @contract FR-003 — GET /users/:id */
export async function fetchUserDetail(id: string): Promise<UserDetailDTO> {
  const detail = await usersApi.get(id);
  return mapUserDetail(detail);
}

/** @contract FR-001, FR-002 — GET /roles */
export async function fetchRoles(): Promise<RoleOptionDTO[]> {
  const res = await rolesApi.list({ limit: 100 });
  return res.data.map(toRoleOption);
}

/** @contract FR-002, BR-005 — POST /users */
export async function createUser(
  data: CreateUserRequest,
  idempotencyKey: string,
): Promise<{ id: string }> {
  return httpClient.post<{ id: string }>('/users', data, { idempotencyKey });
}

/** @contract FR-001 — DELETE /users/:id */
export async function deactivateUser(id: string): Promise<void> {
  await usersApi.delete(id);
}

/** @contract FR-003, BR-005 — POST /users/:id/invite/resend */
export async function resendInvite(userId: string): Promise<void> {
  await usersApi.resendInvite(userId);
}
