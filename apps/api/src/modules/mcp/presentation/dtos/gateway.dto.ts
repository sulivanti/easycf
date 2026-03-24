/**
 * @contract FR-007, FR-008, BR-010, SEC-010, EX-OAS-001
 *
 * Zod schemas for MCP Gateway execute endpoint.
 * Auth: X-MCP-Agent-Key header (not JWT).
 */

import { z } from 'zod';

// ---------------------------------------------------------------------------
// POST /mcp/execute — Execute MCP Action
// ---------------------------------------------------------------------------
export const executeMcpBody = z.object({
  action_code: z.string().min(1).max(100),
  payload: z.record(z.unknown()).default({}),
});

export const executeMcpResponse = z.object({
  execution_id: z.string().uuid(),
  status: z.string(),
  policy_applied: z.string(),
  movement_id: z.string().uuid().optional(),
  result_payload: z.record(z.unknown()).optional(),
});
