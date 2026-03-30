/**
 * @contract FR-001, FR-002, FR-003, FR-004, FR-005, FR-007, DATA-001, UX-AUTH-001, UX-SHELL-001, UX-DASH-001
 *
 * Types centralizados do módulo Backoffice Admin.
 */

// ---------------------------------------------------------------------------
// Auth / Profile
// ---------------------------------------------------------------------------

export interface Tenant {
  id: string;
  name: string;
}

export interface AuthMeResponse {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  tenant: Tenant;
  scopes: string[];
}

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
  mfa_required?: boolean;
  temp_token?: string;
}

// ---------------------------------------------------------------------------
// Forgot / Reset Password
// ---------------------------------------------------------------------------

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
  confirm_password: string;
}

// ---------------------------------------------------------------------------
// Change Password
// ---------------------------------------------------------------------------

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------

export interface SidebarGroup {
  id: string;
  label: string;
  icon: string;
  items: SidebarItem[];
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  requiredScope?: string;
  activeMatch: string;
}

// ---------------------------------------------------------------------------
// Shortcut Cards
// ---------------------------------------------------------------------------

export interface ShortcutCard {
  id: string;
  label: string;
  description: string;
  icon: string;
  route: string;
  requiredScope: string;
}

// ---------------------------------------------------------------------------
// Telemetry
// ---------------------------------------------------------------------------

export type ScreenId = 'UX-AUTH-001' | 'UX-SHELL-001' | 'UX-DASH-001';

export type ActionStatus = 'requested' | 'succeeded' | 'failed';

export interface UIActionEnvelope {
  correlation_id: string;
  screen_id: ScreenId;
  action_id: string;
  operation_id?: string;
  tenant_id?: string;
  status: ActionStatus;
  http_status?: number;
  duration_ms?: number;
  problem_type?: string;
}

// ---------------------------------------------------------------------------
// RFC 9457 Problem Details
// ---------------------------------------------------------------------------

export interface ProblemDetail {
  type: string;
  title: string;
  status: number;
  detail?: string;
  extensions?: Record<string, unknown> & {
    correlationId?: string;
    field?: string;
    retry_after?: number;
  };
}
