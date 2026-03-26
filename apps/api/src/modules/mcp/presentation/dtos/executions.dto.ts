/**
 * @contract FR-009, DATA-010, SEC-010, EX-OAS-001
 *
 * Zod schemas for MCP Execution log admin endpoints.
 * Payload sanitization (mask sensitive fields) is handled at the route level.
 */

import { z } from 'zod';
import { paginatedResponse, paginationQuery } from './common.dto.js';

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------
export const executionStatusSchema = z.enum([
  'RECEIVED',
  'DISPATCHED',
  'DIRECT_SUCCESS',
  'DIRECT_FAILED',
  'CONTROLLED_PENDING',
  'CONTROLLED_APPROVED',
  'CONTROLLED_REJECTED',
  'EVENT_EMITTED',
  'BLOCKED',
]);

export const executionPolicySchema = z.enum(['DIRECT', 'CONTROLLED', 'EVENT_ONLY']);

// ---------------------------------------------------------------------------
// GET /admin/mcp-executions — List Executions
// ---------------------------------------------------------------------------
export const listExecutionsQuery = paginationQuery.extend({
  agent_id: z.string().uuid().optional(),
  action_id: z.string().uuid().optional(),
  status: executionStatusSchema.optional(),
  policy_applied: executionPolicySchema.optional(),
  received_at_from: z.string().optional(),
  received_at_to: z.string().optional(),
});

export const executionListItem = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  agent_id: z.string().uuid(),
  action_id: z.string().uuid(),
  policy_applied: executionPolicySchema,
  correlation_id: z.string(),
  status: executionStatusSchema,
  blocked_reason: z.string().nullable(),
  linked_movement_id: z.string().uuid().nullable(),
  duration_ms: z.number().int().nullable(),
  received_at: z.string(),
  completed_at: z.string().nullable(),
});

export const listExecutionsResponse = paginatedResponse(executionListItem);

// ---------------------------------------------------------------------------
// GET /admin/mcp-executions/:id — Execution Detail
// ---------------------------------------------------------------------------
export const executionDetailResponse = z.object({
  id: z.string().uuid(),
  tenant_id: z.string().uuid(),
  agent_id: z.string().uuid(),
  action_id: z.string().uuid(),
  policy_applied: executionPolicySchema,
  origin_ip: z.string().nullable(),
  request_payload: z.record(z.unknown()),
  correlation_id: z.string(),
  status: executionStatusSchema,
  blocked_reason: z.string().nullable(),
  linked_movement_id: z.string().uuid().nullable(),
  linked_integration_log_id: z.string().uuid().nullable(),
  result_payload: z.record(z.unknown()).nullable(),
  error_message: z.string().nullable(),
  duration_ms: z.number().int().nullable(),
  received_at: z.string(),
  completed_at: z.string().nullable(),
});
