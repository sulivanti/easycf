/**
 * @contract FR-007, FR-010
 * Role/RBAC types aligned with OpenAPI v1.yaml schemas.
 */

export interface CreateRoleRequest {
  name: string;
  description?: string;
  scopes: string[];
}

export type RoleStatus = 'ACTIVE' | 'INACTIVE';

export interface UpdateRoleRequest {
  name?: string;
  description?: string | null;
  scopes: string[];
  status?: RoleStatus;
}

export interface RoleListItem {
  id: string;
  name: string;
  description: string | null;
  status: RoleStatus;
  scopes_count: number;
  created_at: string;
}

export interface RoleDetail {
  id: string;
  name: string;
  description: string | null;
  status: RoleStatus;
  scopes: string[];
  created_at: string;
  updated_at: string;
}
