/**
 * @contract FR-001, FR-002, FR-003, FR-004, FR-005, FR-015
 * Auth types aligned with OpenAPI v1.yaml schemas.
 */

// -- Login --

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
  device_fp?: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  user: {
    id: string;
    email: string;
    full_name: string;
    status: string;
  };
}

export interface LoginMfaResponse {
  mfa_required: true;
  temp_token: string;
  expires_in: 300;
}

export type LoginResult = LoginResponse | LoginMfaResponse;

export function isMfaRequired(result: LoginResult): result is LoginMfaResponse {
  return 'mfa_required' in result && result.mfa_required === true;
}

// -- MFA --

export interface MfaSetupResponse {
  secret: string;
  otpauth_uri: string;
  qr_code_url: string;
}

export interface MfaVerifyRequest {
  code: string;
  temp_token?: string;
}

// -- Profile --

export interface ProfileResponse {
  id: string;
  email: string;
  codigo: string;
  full_name: string;
  avatar_url: string | null;
  status: string;
  active_tenant_id: string | null;
  scopes: string[];
}

export interface UpdateProfileRequest {
  full_name?: string;
  avatar_url?: string | null;
}

// -- Change Password --

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// -- Forgot / Reset Password --

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

// -- Sessions --

export interface SessionItem {
  id: string;
  device_fp: string | null;
  remember_me: boolean;
  expires_at: string;
  created_at: string;
  is_current: boolean;
}
