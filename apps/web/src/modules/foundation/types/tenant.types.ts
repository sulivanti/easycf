/**
 * @contract FR-008, FR-009
 * Tenant and tenant-user binding types aligned with OpenAPI v1.yaml schemas.
 */

export type TenantStatus = 'ACTIVE' | 'BLOCKED' | 'INACTIVE';

export interface CreateTenantRequest {
  codigo: string;
  name: string;
}

export interface UpdateTenantRequest {
  name?: string;
  status?: TenantStatus;
}

export interface TenantListItem {
  id: string;
  codigo: string;
  name: string;
  status: string;
  created_at: string;
}

export interface TenantDetail {
  id: string;
  codigo: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// -- Tenant-User bindings --

export interface AddTenantUserRequest {
  user_id: string;
  role_id: string;
}

export interface TenantUserListItem {
  user_id: string;
  email: string;
  full_name: string;
  role_id: string;
  role_name: string;
  status: string;
  created_at: string;
}
