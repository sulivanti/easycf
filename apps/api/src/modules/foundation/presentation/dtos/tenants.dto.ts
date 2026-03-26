/**
 * @contract FR-008, FR-009
 *
 * Zod schemas for tenant and tenant-user endpoints.
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// POST /api/v1/tenants
// ---------------------------------------------------------------------------
export const createTenantBody = z.object({
  codigo: z.string().min(1).max(100),
  name: z.string().min(1).max(255),
});

export const createTenantResponse = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  name: z.string(),
  status: z.string(),
});

// ---------------------------------------------------------------------------
// PATCH /api/v1/tenants/:id
// ---------------------------------------------------------------------------
export const updateTenantBody = z.object({
  name: z.string().min(1).max(255).optional(),
  status: z.enum(['ACTIVE', 'BLOCKED', 'INACTIVE']).optional(),
});

// ---------------------------------------------------------------------------
// GET /api/v1/tenants (list)
// ---------------------------------------------------------------------------
export const tenantListItem = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  name: z.string(),
  status: z.string(),
  created_at: z.string(),
});

// ---------------------------------------------------------------------------
// POST /api/v1/tenants/:tenantId/users
// ---------------------------------------------------------------------------
export const addTenantUserBody = z.object({
  user_id: z.string().uuid(),
  role_id: z.string().uuid(),
});

// ---------------------------------------------------------------------------
// PATCH /api/v1/tenants/:tenantId/users/:userId
// ---------------------------------------------------------------------------
export const updateTenantUserBody = z.object({
  role_id: z.string().uuid().optional(),
  status: z.enum(['ACTIVE', 'BLOCKED', 'INACTIVE']).optional(),
});

// ---------------------------------------------------------------------------
// GET /api/v1/tenants/:tenantId/users (list)
// ---------------------------------------------------------------------------
export const tenantUserListItem = z.object({
  user_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  role_id: z.string().uuid(),
  role_name: z.string().optional(),
  user_email: z.string().optional(),
  user_full_name: z.string().optional(),
  status: z.string(),
  created_at: z.string(),
});
