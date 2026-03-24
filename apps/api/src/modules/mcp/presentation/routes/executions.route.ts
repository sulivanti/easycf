/**
 * @contract FR-009, DATA-010, SEC-010, EX-OAS-001
 *
 * Fastify routes for MCP Execution log admin endpoints.
 * 2 endpoints: list executions, get execution detail.
 *
 * Scope: mcp:log:read
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import {
  listExecutionsQuery,
  listExecutionsResponse,
  executionDetailResponse,
} from '../dtos/executions.dto.js';
import { uuidParam } from '../dtos/common.dto.js';

/** Sensitive payload field patterns to mask in responses */
const SENSITIVE_KEYS = new Set(['password', 'secret', 'token', 'api_key', 'apiKey', 'credential']);

/** Recursively mask sensitive fields in payloads */
function sanitizePayload(obj: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!obj) return null;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      result[key] = '***MASKED***';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = sanitizePayload(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

/** Map McpExecutionProps (camelCase) to API response (snake_case) */
function mapExecution(e: Record<string, unknown>) {
  return {
    id: e.id,
    tenant_id: e.tenantId,
    agent_id: e.agentId,
    action_id: e.actionId,
    policy_applied: e.policyApplied,
    correlation_id: e.correlationId,
    status: e.status,
    blocked_reason: e.blockedReason ?? null,
    linked_movement_id: e.linkedMovementId ?? null,
    duration_ms: e.durationMs ?? null,
    received_at: (e.receivedAt as Date).toISOString(),
    completed_at: e.completedAt ? (e.completedAt as Date).toISOString() : null,
  };
}

/** Map execution detail including payloads (sanitized) */
function mapExecutionDetail(e: Record<string, unknown>) {
  return {
    ...mapExecution(e),
    origin_ip: e.originIp ?? null,
    request_payload: sanitizePayload(e.requestPayload as Record<string, unknown> | null) ?? {},
    linked_integration_log_id: e.linkedIntegrationLogId ?? null,
    result_payload: sanitizePayload(e.resultPayload as Record<string, unknown> | null),
    error_message: e.errorMessage ?? null,
  };
}

export async function executionsRoutes(app: FastifyInstance): Promise<void> {
  const prefix = '/api/v1/admin/mcp-executions';

  // ── GET /admin/mcp-executions — List Executions ─────────────────────────
  app.get<{ Querystring: z.infer<typeof listExecutionsQuery> }>(
    prefix,
    {
      operationId: 'mcp_executions_list',
      schema: {
        tags: ['mcp-admin'],
        querystring: listExecutionsQuery,
        response: { 200: listExecutionsResponse },
      },
      onRequest: [app.verifySession, app.requireScope('mcp:log:read')],
    },
    async (request, reply) => {
      const query = request.query as typeof listExecutionsQuery._type;
      const user = request.user;

      const { listExecutionsUseCase } = app.mcpAutomation;
      const result = await listExecutionsUseCase.execute({
        tenantId: user.tenantId,
        cursor: query.cursor,
        pageSize: query.limit,
        agentId: query.agent_id,
        actionId: query.action_id,
        status: query.status,
        policyApplied: query.policy_applied,
        receivedAtFrom: query.received_at_from,
        receivedAtTo: query.received_at_to,
      });

      return reply.send({
        data: result.data.map((e: Record<string, unknown>) => mapExecution(e)),
        next_cursor: result.nextCursor,
        has_more: result.hasMore,
      });
    },
  );

  // ── GET /admin/mcp-executions/:id — Execution Detail ────────────────────
  app.get<{ Params: z.infer<typeof uuidParam> }>(
    `${prefix}/:id`,
    {
      operationId: 'mcp_executions_get',
      schema: {
        tags: ['mcp-admin'],
        params: uuidParam,
        response: { 200: executionDetailResponse },
      },
      onRequest: [app.verifySession, app.requireScope('mcp:log:read')],
    },
    async (request, reply) => {
      const { id } = request.params as typeof uuidParam._type;
      const user = request.user;

      const { getExecutionUseCase } = app.mcpAutomation;
      const result = await getExecutionUseCase.execute({
        id,
        tenantId: user.tenantId,
      });

      return reply.send(mapExecutionDetail(result.execution as unknown as Record<string, unknown>));
    },
  );
}
