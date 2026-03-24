/**
 * @contract FR-001, FR-002, FR-003, FR-004, FR-005, FR-015
 * Auth API client — login, logout, refresh, profile, MFA, sessions, password flows.
 */

import { httpClient } from './http-client.js';
import type {
  LoginRequest,
  LoginResult,
  LoginResponse,
  MfaSetupResponse,
  MfaVerifyRequest,
  ProfileResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  SessionItem,
} from '../types/auth.types.js';
import type { GenericMessage } from '../types/common.types.js';

const AUTH = '/auth';

export const authApi = {
  /** @contract FR-001 — POST /auth/login */
  login(data: LoginRequest): Promise<LoginResult> {
    return httpClient.post<LoginResult>(`${AUTH}/login`, data, {
      skipAuth: true,
      idempotencyKey: crypto.randomUUID(),
    });
  },

  /** @contract FR-001 — POST /auth/logout */
  logout(): Promise<void> {
    return httpClient.post<void>(`${AUTH}/logout`);
  },

  /** @contract FR-003 — POST /auth/refresh */
  refresh(): Promise<LoginResponse> {
    return httpClient.post<LoginResponse>(`${AUTH}/refresh`, undefined, {
      skipAuth: true,
    });
  },

  /** @contract FR-004 — GET /auth/me */
  getProfile(): Promise<ProfileResponse> {
    return httpClient.get<ProfileResponse>(`${AUTH}/me`);
  },

  /** @contract FR-004 — PATCH /auth/me */
  updateProfile(data: UpdateProfileRequest): Promise<ProfileResponse> {
    return httpClient.patch<ProfileResponse>(`${AUTH}/me`, data);
  },

  /** @contract FR-005 — POST /auth/change-password */
  changePassword(data: ChangePasswordRequest): Promise<void> {
    return httpClient.post<void>(`${AUTH}/change-password`, data);
  },

  /** @contract FR-004 — POST /auth/forgot-password */
  forgotPassword(data: ForgotPasswordRequest): Promise<GenericMessage> {
    return httpClient.post<GenericMessage>(`${AUTH}/forgot-password`, data, {
      skipAuth: true,
    });
  },

  /** @contract FR-004 — POST /auth/reset-password */
  resetPassword(data: ResetPasswordRequest): Promise<void> {
    return httpClient.post<void>(`${AUTH}/reset-password`, data, {
      skipAuth: true,
    });
  },

  // -- MFA --

  /** @contract FR-015 — POST /auth/mfa/setup */
  mfaSetup(): Promise<MfaSetupResponse> {
    return httpClient.post<MfaSetupResponse>(`${AUTH}/mfa/setup`);
  },

  /** @contract FR-015 — POST /auth/mfa/verify */
  mfaVerify(data: MfaVerifyRequest): Promise<LoginResponse> {
    return httpClient.post<LoginResponse>(`${AUTH}/mfa/verify`, data, {
      skipAuth: data.temp_token ? true : false,
    });
  },

  /** @contract FR-015 — DELETE /auth/mfa */
  mfaDisable(): Promise<void> {
    return httpClient.delete<void>(`${AUTH}/mfa`);
  },

  // -- Sessions --

  /** @contract FR-002 — GET /auth/sessions */
  listSessions(): Promise<{ data: SessionItem[] }> {
    return httpClient.get<{ data: SessionItem[] }>(`${AUTH}/sessions`);
  },

  /** @contract FR-002 — DELETE /auth/sessions/:id */
  revokeSession(sessionId: string): Promise<void> {
    return httpClient.delete<void>(`${AUTH}/sessions/${sessionId}`);
  },

  /** @contract FR-002 — DELETE /auth/sessions (kill-switch) */
  revokeAllSessions(): Promise<void> {
    return httpClient.delete<void>(`${AUTH}/sessions`);
  },
};
