/**
 * @contract FR-001, FR-003, FR-004, FR-005, FR-017
 *
 * Zod schemas for auth endpoints.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// POST /auth/login
// ---------------------------------------------------------------------------
export const loginBody = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1),
  remember_me: z.boolean().optional().default(false),
  device_fp: z.string().max(500).optional(),
});

export const loginResponse = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.number().int(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    full_name: z.string(),
    status: z.string(),
  }),
});

export const loginMfaResponse = z.object({
  mfa_required: z.literal(true),
  temp_token: z.string(),
  expires_in: z.literal(300),
});

// ---------------------------------------------------------------------------
// POST /auth/refresh (FR-000-C04: schema separado — sem campo user)
// ---------------------------------------------------------------------------
export const refreshResponse = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.number().int(),
});

// ---------------------------------------------------------------------------
// GET /auth/me
// ---------------------------------------------------------------------------
export const profileResponse = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  codigo: z.string(),
  full_name: z.string(),
  avatar_url: z.string().nullable(),
  status: z.string(),
  active_tenant_id: z.string().uuid().nullable(),
  scopes: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// PATCH /auth/me
// ---------------------------------------------------------------------------
export const updateProfileBody = z.object({
  full_name: z.string().min(1).max(255).optional(),
  avatar_url: z.string().url().nullable().optional(),
});

// ---------------------------------------------------------------------------
// POST /auth/change-password
// ---------------------------------------------------------------------------
export const changePasswordBody = z.object({
  current_password: z.string().min(1),
  new_password: z.string().min(8).max(128),
});

// ---------------------------------------------------------------------------
// POST /auth/forgot-password
// ---------------------------------------------------------------------------
export const forgotPasswordBody = z.object({
  email: z.string().email().max(255),
});

export const forgotPasswordResponse = z.object({
  message: z.literal('Se o e-mail estiver cadastrado, você receberá um link de recuperação.'),
});

// ---------------------------------------------------------------------------
// POST /auth/reset-password
// ---------------------------------------------------------------------------
export const resetPasswordBody = z.object({
  token: z.string().uuid(),
  new_password: z.string().min(8).max(128),
});

// ---------------------------------------------------------------------------
// GET /auth/sessions
// ---------------------------------------------------------------------------
export const sessionItem = z.object({
  id: z.string().uuid(),
  device_fp: z.string().nullable(),
  remember_me: z.boolean(),
  expires_at: z.string().datetime(),
  created_at: z.string().datetime(),
  is_current: z.boolean(),
});

export const sessionsListResponse = z.object({
  data: z.array(sessionItem),
});
