/**
 * @contract FR-001, FR-002, FR-003, FR-004, FR-005, EX-OAS-001
 *
 * Zod schemas for org-units endpoints (MOD-003).
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// POST /api/v1/org-units
// ---------------------------------------------------------------------------
export const createOrgUnitBody = z.object({
  codigo: z.string().min(1).max(50),
  nome: z.string().min(1).max(200),
  descricao: z.string().max(2000).nullable().optional(),
  parent_id: z.string().uuid().nullable().optional(),
});

export const createOrgUnitResponse = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  descricao: z.string().nullable(),
  nivel: z.number().int().min(1).max(4),
  parent_id: z.string().uuid().nullable(),
  status: z.string(),
});

// ---------------------------------------------------------------------------
// PATCH /api/v1/org-units/:id
// ---------------------------------------------------------------------------
export const updateOrgUnitBody = z.object({
  nome: z.string().min(1).max(200).optional(),
  descricao: z.string().max(2000).nullable().optional(),
  /** @contract BR-003 — Will be rejected by use case if different from current */
  codigo: z.string().optional(),
  /** @contract BR-010 — Will be rejected by use case if different from current */
  parent_id: z.string().uuid().optional(),
});

export const updateOrgUnitResponse = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  descricao: z.string().nullable(),
  nivel: z.number().int(),
  status: z.string(),
});

// ---------------------------------------------------------------------------
// GET /api/v1/org-units/:id (detail)
// ---------------------------------------------------------------------------
export const orgUnitAncestor = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  nivel: z.number().int(),
});

export const orgUnitTenantSummary = z.object({
  tenant_id: z.string().uuid(),
  codigo: z.string(),
  name: z.string(),
});

export const orgUnitDetailResponse = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  descricao: z.string().nullable(),
  nivel: z.number().int(),
  parent_id: z.string().uuid().nullable(),
  status: z.string(),
  created_by: z.string().uuid().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  deleted_at: z.string().nullable(),
  ancestors: z.array(orgUnitAncestor),
  tenants: z.array(orgUnitTenantSummary),
});

// ---------------------------------------------------------------------------
// GET /api/v1/org-units (flat list) — FR-005
// ---------------------------------------------------------------------------
export const orgUnitsListQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  nivel: z.coerce.number().int().min(1).max(4).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  parent_id: z.string().uuid().optional(),
  search: z.string().max(200).optional(),
});

export const orgUnitListItem = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  nivel: z.number().int(),
  status: z.string(),
  parent_id: z.string().uuid().nullable(),
  created_at: z.string(),
});

// ---------------------------------------------------------------------------
// GET /api/v1/org-units/tree — FR-002
// ---------------------------------------------------------------------------
const treeNodeBase = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  descricao: z.string().nullable(),
  nivel: z.number().int(),
  status: z.string(),
  tenants: z.array(orgUnitTenantSummary),
});

/** Recursive tree node — Zod lazy() for self-reference */
export type OrgUnitTreeNodeDto = z.infer<typeof treeNodeBase> & {
  children: OrgUnitTreeNodeDto[];
};

export const orgUnitTreeNode: z.ZodType<OrgUnitTreeNodeDto> = treeNodeBase.extend({
  children: z.lazy(() => z.array(orgUnitTreeNode)),
});

export const orgUnitTreeResponse = z.object({
  tree: z.array(orgUnitTreeNode),
});

// ---------------------------------------------------------------------------
// POST /api/v1/org-units/:id/tenants — FR-003
// ---------------------------------------------------------------------------
export const linkTenantBody = z.object({
  tenant_id: z.string().uuid(),
});

export const linkTenantResponse = z.object({
  id: z.string().uuid(),
  org_unit_id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  tenant_codigo: z.string(),
});

// ---------------------------------------------------------------------------
// Param helpers
// ---------------------------------------------------------------------------
export const orgUnitTenantParams = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
});
