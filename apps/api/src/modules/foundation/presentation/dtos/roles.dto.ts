/**
 * @contract FR-007, BR-005, BR-006
 *
 * Zod schemas for role CRUD endpoints.
 */

import { z } from 'zod';

const SCOPE_REGEX = /^[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*){1,2}$/;

const scopeString = z.string().max(100).regex(SCOPE_REGEX, {
  message: 'Scope deve seguir formato dominio:entidade:acao (BR-005)',
});

// ---------------------------------------------------------------------------
// POST /api/v1/roles
// ---------------------------------------------------------------------------
export const createRoleBody = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  scopes: z.array(scopeString).min(1),
});

export const createRoleResponse = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  name: z.string(),
  scopes: z.array(z.string()),
});

// ---------------------------------------------------------------------------
// PUT /api/v1/roles/:id (BR-006: full replacement)
// ---------------------------------------------------------------------------
export const updateRoleBody = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).nullable().optional(),
  scopes: z.array(scopeString).min(1),
});

// ---------------------------------------------------------------------------
// GET /api/v1/roles (list)
// ---------------------------------------------------------------------------
export const roleListItem = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  name: z.string(),
  status: z.string(),
  scopes_count: z.number().int(),
  created_at: z.string().datetime(),
});

// ---------------------------------------------------------------------------
// GET /api/v1/roles/:id (detail)
// ---------------------------------------------------------------------------
export const roleDetailResponse = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  scopes: z.array(z.string()),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});
