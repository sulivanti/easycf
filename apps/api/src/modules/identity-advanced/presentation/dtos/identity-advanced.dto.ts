/**
 * @contract FR-001.1, FR-001.2, FR-001.3, EX-OAS-001, SEC-001
 *
 * Zod schemas for identity-advanced endpoints (MOD-004).
 * 11 endpoints across 3 features: org-scopes, access-shares, access-delegations.
 */

import { z } from 'zod';

// ============================================================================
// Shared params
// ============================================================================

export const userIdParam = z.object({
  id: z.string().uuid(),
});

export const userScopeParams = z.object({
  id: z.string().uuid(),
  scopeId: z.string().uuid(),
});

export const shareIdParam = z.object({
  id: z.string().uuid(),
});

export const delegationIdParam = z.object({
  id: z.string().uuid(),
});

// ============================================================================
// F01 — Org Scopes (user_org_scopes)
// ============================================================================

// POST /api/v1/admin/users/:id/org-scopes
export const createOrgScopeBody = z.object({
  org_unit_id: z.string().uuid(),
  scope_type: z.enum(['PRIMARY', 'SECONDARY']),
  granted_by: z.string().uuid().nullable().optional(),
  valid_until: z.string().datetime().nullable().optional(),
});

export const createOrgScopeResponse = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  org_unit_id: z.string().uuid(),
  scope_type: z.enum(['PRIMARY', 'SECONDARY']),
  status: z.string(),
  valid_from: z.string().datetime(),
  valid_until: z.string().datetime().nullable(),
});

// GET /api/v1/admin/users/:id/org-scopes & GET /api/v1/my/org-scopes
export const orgScopeOrgUnit = z.object({
  id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  nivel: z.number().int(),
});

export const orgScopeListItem = z.object({
  id: z.string().uuid(),
  scope_type: z.string(),
  org_unit: orgScopeOrgUnit,
  valid_from: z.string().datetime(),
  valid_until: z.string().datetime().nullable(),
  status: z.string(),
});

export const orgScopeListResponse = z.array(orgScopeListItem);

// ============================================================================
// F02 — Access Shares (access_shares)
// ============================================================================

// POST /api/v1/admin/access-shares
export const createAccessShareBody = z.object({
  grantor_id: z.string().uuid(),
  grantee_id: z.string().uuid(),
  resource_type: z.enum(['org_unit', 'tenant', 'process']),
  resource_id: z.string().uuid(),
  allowed_actions: z.array(z.string().min(1)).min(1),
  reason: z.string().min(1).max(2000),
  authorized_by: z.string().uuid(),
  valid_until: z.string().datetime(),
});

export const createAccessShareResponse = z.object({
  id: z.string().uuid(),
  grantor_id: z.string().uuid(),
  grantee_id: z.string().uuid(),
  resource_type: z.string(),
  resource_id: z.string().uuid(),
  status: z.string(),
  valid_from: z.string().datetime(),
  valid_until: z.string().datetime(),
});

// GET /api/v1/admin/access-shares
export const accessSharesListQuery = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  status: z.enum(['ACTIVE', 'REVOKED', 'EXPIRED']).optional(),
  grantee_id: z.string().uuid().optional(),
});

export const accessShareListItem = z.object({
  id: z.string().uuid(),
  grantor_id: z.string().uuid(),
  grantee_id: z.string().uuid(),
  resource_type: z.string(),
  resource_id: z.string().uuid(),
  allowed_actions: z.array(z.string()),
  reason: z.string(),
  authorized_by: z.string().uuid(),
  valid_from: z.string().datetime(),
  valid_until: z.string().datetime(),
  status: z.string(),
  revoked_at: z.string().datetime().nullable(),
  revoked_by: z.string().uuid().nullable(),
  created_at: z.string().datetime(),
});

// ============================================================================
// F02 — Access Delegations (access_delegations)
// ============================================================================

// POST /api/v1/access-delegations
export const createAccessDelegationBody = z.object({
  delegatee_id: z.string().uuid(),
  role_id: z.string().uuid().nullable().optional(),
  org_unit_id: z.string().uuid().nullable().optional(),
  delegated_scopes: z.array(z.string().min(1)).min(1),
  reason: z.string().min(1).max(2000),
  valid_until: z.string().datetime(),
});

export const createAccessDelegationResponse = z.object({
  id: z.string().uuid(),
  delegator_id: z.string().uuid(),
  delegatee_id: z.string().uuid(),
  delegated_scopes: z.array(z.string()),
  status: z.string(),
  valid_until: z.string().datetime(),
});

// GET /api/v1/access-delegations
export const delegationListItem = z.object({
  id: z.string().uuid(),
  delegator_id: z.string().uuid(),
  delegatee_id: z.string().uuid(),
  role_id: z.string().uuid().nullable(),
  org_unit_id: z.string().uuid().nullable(),
  delegated_scopes: z.array(z.string()),
  reason: z.string(),
  valid_until: z.string().datetime(),
  status: z.string(),
  created_at: z.string().datetime(),
  revoked_at: z.string().datetime().nullable(),
});

export const delegationListResponse = z.object({
  given: z.array(delegationListItem),
  received: z.array(delegationListItem),
});
