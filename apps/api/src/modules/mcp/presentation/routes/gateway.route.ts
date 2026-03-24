/**
 * @contract FR-007, FR-008, BR-001, BR-008, BR-009, BR-010, BR-012, SEC-010, EX-OAS-001
 *
 * Fastify route for MCP Gateway execute endpoint.
 * Auth: X-MCP-Agent-Key header (NOT JWT).
 * This is the single entry point for all MCP agent operations.
 *
 * The 8-step gateway algorithm is implemented in ExecuteMcpUseCase.
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import { executeMcpBody, executeMcpResponse } from '../dtos/gateway.dto.js';

export async function gatewayRoutes(app: FastifyInstance): Promise<void> {
  // ── POST /mcp/execute — Execute MCP Action ──────────────────────────────
  app.post<{ Body: z.infer<typeof executeMcpBody> }>(
    '/api/v1/mcp/execute',
    {
      operationId: 'mcp_execute',
      schema: {
        tags: ['mcp-gateway'],
        body: executeMcpBody,
        response: {
          200: executeMcpResponse,
          202: executeMcpResponse,
        },
        headers: {
          type: 'object',
          required: ['x-mcp-agent-key'],
          properties: {
            'x-mcp-agent-key': { type: 'string' },
            'x-correlation-id': { type: 'string' },
          },
        },
      },
      // NO verifySession — API key auth handled by use case
    },
    async (request, reply) => {
      const apiKey = request.headers['x-mcp-agent-key'] as string;
      if (!apiKey) {
        return reply.status(401).header('Content-Type', 'application/problem+json').send({
          type: '/problems/mcp-api-key-missing',
          title: 'API Key Missing',
          status: 401,
          detail: 'Header X-MCP-Agent-Key é obrigatório.',
          instance: request.url,
        });
      }

      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const body = request.body as typeof executeMcpBody._type;

      const { executeMcpUseCase } = app.mcpAutomation;
      const result = await executeMcpUseCase.execute({
        apiKey,
        actionCode: body.action_code,
        payload: body.payload,
        correlationId,
        originIp: request.ip,
      });

      const httpStatus = result.policyApplied === 'CONTROLLED' ? 202 : 200;

      reply.header('x-correlation-id', correlationId);
      return reply.status(httpStatus).send({
        execution_id: result.executionId,
        status: result.status,
        policy_applied: result.policyApplied,
        ...(result.movementId ? { movement_id: result.movementId } : {}),
        ...(result.resultPayload ? { result_payload: result.resultPayload } : {}),
      });
    },
  );
}
