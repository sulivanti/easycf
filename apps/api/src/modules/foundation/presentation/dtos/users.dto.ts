/**
 * @contract FR-006, BR-009
 *
 * Zod schemas for user CRUD endpoints.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// POST /api/v1/users (auto-register or admin-created)
// ---------------------------------------------------------------------------
export const createUserBody = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
  full_name: z.string().min(1).max(255),
  cpf_cnpj: z.string().max(20).optional(),
});

export const createUserResponse = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  codigo: z.string(),
  full_name: z.string(),
  status: z.string(),
});

// ---------------------------------------------------------------------------
// GET /api/v1/users (list)
// ---------------------------------------------------------------------------
export const userListItem = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  email: z.string().email(),
  full_name: z.string(),
  status: z.string(),
  created_at: z.string(),
});

// ---------------------------------------------------------------------------
// GET /api/v1/users/:id (detail)
// ---------------------------------------------------------------------------
export const userDetailResponse = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  email: z.string().email(),
  full_name: z.string(),
  cpf_cnpj: z.string().nullable(),
  avatar_url: z.string().nullable(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

// ---------------------------------------------------------------------------
// PATCH /api/v1/users/:id
// ---------------------------------------------------------------------------
export const updateUserBody = z.object({
  full_name: z.string().min(1).max(255).optional(),
  cpf_cnpj: z.string().max(20).nullable().optional(),
  status: z.enum(['ACTIVE', 'BLOCKED', 'PENDING', 'INACTIVE']).optional(),
});
