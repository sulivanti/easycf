/**
 * @contract FR-005, BR-002, BR-007, BR-013, EX-OAS-001
 *
 * Zod schemas for MCP Action catalog admin endpoints.
 */

import { z } from 'zod';
import { paginatedResponse, paginationQuery } from './common.dto.js';

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------
export const executionPolicySchema = z.enum(['DIRECT', 'CONTROLLED', 'EVENT_ONLY']);

export const actionStatusSchema = z.enum(['ACTIVE', 'INACTIVE']);

const SCOPE_REGEX = /^[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*){1,2}$/;

const scopeString = z.string().max(100).regex(SCOPE_REGEX, {
  message: 'Scope deve seguir formato dominio:entidade:acao',
});

// ---------------------------------------------------------------------------
// GET /admin/mcp-actions — List Actions
// ---------------------------------------------------------------------------
export const listActionsQuery = paginationQuery.extend({
  action_type_id: z.string().uuid().optional(),
  execution_policy: executionPolicySchema.optional(),
  status: actionStatusSchema.optional(),
});

export const actionListItem = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  action_type_id: z.string().uuid(),
  execution_policy: executionPolicySchema,
  target_object_type: z.string(),
  required_scopes: z.array(z.string()),
  linked_routine_id: z.string().uuid().nullable(),
  linked_integration_id: z.string().uuid().nullable(),
  description: z.string().nullable(),
  status: actionStatusSchema,
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export const listActionsResponse = paginatedResponse(actionListItem);

// ---------------------------------------------------------------------------
// POST /admin/mcp-actions — Create Action
// ---------------------------------------------------------------------------
export const createActionBody = z.object({
  codigo: z.string().min(1).max(50),
  nome: z.string().min(1).max(200),
  action_type_id: z.string().uuid(),
  execution_policy: executionPolicySchema,
  target_object_type: z.string().min(1).max(100),
  required_scopes: z.array(scopeString).min(1),
  linked_routine_id: z.string().uuid().optional(),
  linked_integration_id: z.string().uuid().optional(),
  description: z.string().max(2000).optional(),
});

export const createActionResponse = actionListItem;

// ---------------------------------------------------------------------------
// PATCH /admin/mcp-actions/:id — Update Action
// ---------------------------------------------------------------------------
export const updateActionBody = z.object({
  nome: z.string().min(1).max(200).optional(),
  execution_policy: executionPolicySchema.optional(),
  required_scopes: z.array(scopeString).min(1).optional(),
  linked_routine_id: z.string().uuid().nullable().optional(),
  linked_integration_id: z.string().uuid().nullable().optional(),
  description: z.string().max(2000).nullable().optional(),
  status: actionStatusSchema.optional(),
});

export const updateActionResponse = actionListItem;
