/**
 * @contract FR-006
 * User types aligned with OpenAPI v1.yaml schemas.
 */

export type UserStatus = 'ACTIVE' | 'BLOCKED' | 'PENDING' | 'INACTIVE';

export interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  cpf_cnpj?: string;
}

export interface CreateUserResponse {
  id: string;
  email: string;
  codigo: string;
  full_name: string;
  status: string;
}

export interface UserListItem {
  id: string;
  codigo: string;
  email: string;
  full_name: string;
  status: string;
  created_at: string;
  role_id?: string;
  role_name?: string;
}

export interface UserDetail {
  id: string;
  codigo: string;
  email: string;
  full_name: string;
  cpf_cnpj: string | null;
  avatar_url: string | null;
  status: string;
  created_at: string;
  updated_at: string;
  invite_token_expired?: boolean;
}

export interface UpdateUserRequest {
  full_name?: string;
  cpf_cnpj?: string | null;
  status?: UserStatus;
}
