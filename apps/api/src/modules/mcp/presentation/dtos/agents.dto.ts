/**
 * @contract FR-001, FR-002, FR-003, FR-010, BR-002, BR-004, BR-005, BR-006, BR-015, EX-OAS-001
 *
 * Zod schemas for MCP Agent admin endpoints.
 * API key NEVER returned in GET/LIST (BR-004).
 */

import { z } from 'zod';
import { paginatedResponse, paginationQuery } from './common.dto.js';

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------
export const agentStatusSchema = z.enum(['ACTIVE', 'INACTIVE', 'REVOKED']);

const SCOPE_REGEX = /^[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*){1,2}$/;

const scopeString = z.string().max(100).regex(SCOPE_REGEX, {
  message: 'Scope deve seguir formato dominio:entidade:acao (BR-005)',
});

// ---------------------------------------------------------------------------
// GET /admin/mcp-agents — List Agents
// ---------------------------------------------------------------------------
export const listAgentsQuery = paginationQuery.extend({
  status: agentStatusSchema.optional(),
  owner_user_id: z.string().uuid().optional(),
});

export const agentListItem = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  codigo: z.string(),
  nome: z.string(),
  owner_user_id: z.string().uuid(),
  allowed_scopes: z.array(z.string()),
  status: agentStatusSchema,
  phase2_create_enabled: z.boolean(),
  last_used_at: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  revoked_at: z.string().nullable(),
});

export const listAgentsResponse = paginatedResponse(agentListItem);

// ---------------------------------------------------------------------------
// POST /admin/mcp-agents — Create Agent
// ---------------------------------------------------------------------------
export const createAgentBody = z.object({
  codigo: z.string().min(1).max(50),
  nome: z.string().min(1).max(200),
  owner_user_id: z.string().uuid(),
  allowed_scopes: z.array(scopeString).min(1),
});

export const createAgentResponse = z.object({
  agent: agentListItem,
  api_key: z.string(),
});

// ---------------------------------------------------------------------------
// PATCH /admin/mcp-agents/:id — Update Agent
// ---------------------------------------------------------------------------
export const updateAgentBody = z.object({
  nome: z.string().min(1).max(200).optional(),
  allowed_scopes: z.array(scopeString).min(1).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const updateAgentResponse = agentListItem;

// ---------------------------------------------------------------------------
// POST /admin/mcp-agents/:id/revoke — Revoke Agent
// ---------------------------------------------------------------------------
export const revokeAgentBody = z.object({
  reason: z.string().min(1).max(2000),
});

export const revokeAgentResponse = agentListItem;

// ---------------------------------------------------------------------------
// POST /admin/mcp-agents/:id/rotate-key — Rotate API Key
// ---------------------------------------------------------------------------
export const rotateAgentKeyResponse = z.object({
  agent: agentListItem,
  api_key: z.string(),
});

// ---------------------------------------------------------------------------
// POST /admin/mcp-agents/:id/enable-phase2 — Enable Phase 2
// ---------------------------------------------------------------------------
export const enablePhase2Body = z.object({
  reason: z.string().min(10).max(2000),
});

export const enablePhase2Response = z.object({
  agent_id: z.string().uuid(),
  phase2_create_enabled: z.literal(true),
  enabled_by: z.string().uuid(),
  enabled_at: z.string(),
  reason: z.string(),
});

// ---------------------------------------------------------------------------
// POST /admin/mcp-agents/:id/actions — Grant Agent-Action Link
// ---------------------------------------------------------------------------
export const grantAgentActionBody = z.object({
  action_id: z.string().uuid(),
  valid_until: z.string().optional(),
});

export const agentActionLinkItem = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  agent_id: z.string().uuid(),
  action_id: z.string().uuid(),
  granted_by: z.string().uuid(),
  granted_at: z.string(),
  valid_until: z.string().nullable(),
});

export const grantAgentActionResponse = agentActionLinkItem;
