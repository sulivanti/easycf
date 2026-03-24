/**
 * @contract FR-005, BR-002, BR-007, BR-013, DATA-010, EX-OAS-001
 *
 * Fastify routes for MCP Action catalog admin endpoints.
 * 3 endpoints: list, create, update.
 *
 * Scopes: mcp:action:read, mcp:action:write
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import {
  listActionsQuery,
  listActionsResponse,
  createActionBody,
  createActionResponse,
  updateActionBody,
  updateActionResponse,
} from '../dtos/actions.dto.js';
import { uuidParam } from '../dtos/common.dto.js';

/** Map McpActionProps (camelCase) to API response (snake_case) */
function mapAction(a: Record<string, unknown>) {
  return {
    id: a.id,
    tenant_id: a.tenantId,
    codigo: a.codigo,
    nome: a.nome,
    action_type_id: a.actionTypeId,
    execution_policy: a.executionPolicy,
    target_object_type: a.targetObjectType,
    required_scopes: a.requiredScopes,
    linked_routine_id: a.linkedRoutineId ?? null,
    linked_integration_id: a.linkedIntegrationId ?? null,
    description: a.description ?? null,
    status: a.status,
    created_at: (a.createdAt as Date).toISOString(),
    updated_at: (a.updatedAt as Date).toISOString(),
  };
}

export async function actionsRoutes(app: FastifyInstance): Promise<void> {
  const prefix = '/api/v1/admin/mcp-actions';

  // ── GET /admin/mcp-actions — List Actions ───────────────────────────────
  app.get<{ Querystring: z.infer<typeof listActionsQuery> }>(
    prefix,
    {
      operationId: 'mcp_actions_list',
      schema: {
        tags: ['mcp-admin'],
        querystring: listActionsQuery,
        response: { 200: listActionsResponse },
      },
      onRequest: [app.verifySession, app.requireScope('mcp:action:read')],
    },
    async (request, reply) => {
      const query = request.query as typeof listActionsQuery._type;
      const user = request.user;

      const { actionRepo } = app.mcpAutomation;
      const result = await actionRepo.list({
        tenantId: user.tenantId,
        cursor: query.cursor,
        pageSize: query.limit,
        actionTypeId: query.action_type_id,
        executionPolicy: query.execution_policy,
        status: query.status,
      });

      return reply.send({
        data: result.data.map((a: Record<string, unknown>) => mapAction(a)),
        next_cursor: result.nextCursor,
        has_more: result.hasMore,
      });
    },
  );

  // ── POST /admin/mcp-actions — Create Action ────────────────────────────
  app.post<{ Body: z.infer<typeof createActionBody> }>(
    prefix,
    {
      operationId: 'mcp_actions_create',
      schema: {
        tags: ['mcp-admin'],
        body: createActionBody,
        response: { 201: createActionResponse },
        headers: {
          type: 'object',
          properties: {
            'x-correlation-id': { type: 'string' },
            'idempotency-key': { type: 'string' },
          },
        },
      },
      onRequest: [app.verifySession, app.requireScope('mcp:action:write')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const body = request.body as typeof createActionBody._type;
      const user = request.user;

      const { createActionUseCase } = app.mcpAutomation;
      const result = await createActionUseCase.execute({
        tenantId: user.tenantId,
        codigo: body.codigo,
        nome: body.nome,
        actionTypeId: body.action_type_id,
        executionPolicy: body.execution_policy,
        targetObjectType: body.target_object_type,
        requiredScopes: body.required_scopes,
        linkedRoutineId: body.linked_routine_id,
        linkedIntegrationId: body.linked_integration_id,
        description: body.description,
        correlationId,
        actorId: user.id,
      });

      reply.header('x-correlation-id', correlationId);
      return reply.status(201).send(mapAction(result.action as unknown as Record<string, unknown>));
    },
  );

  // ── PATCH /admin/mcp-actions/:id — Update Action ───────────────────────
  app.patch<{ Params: z.infer<typeof uuidParam>; Body: z.infer<typeof updateActionBody> }>(
    `${prefix}/:id`,
    {
      operationId: 'mcp_actions_update',
      schema: {
        tags: ['mcp-admin'],
        params: uuidParam,
        body: updateActionBody,
        response: { 200: updateActionResponse },
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('mcp:action:write')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const { id } = request.params as typeof uuidParam._type;
      const body = request.body as typeof updateActionBody._type;
      const user = request.user;

      const { updateActionUseCase } = app.mcpAutomation;
      const result = await updateActionUseCase.execute({
        id,
        tenantId: user.tenantId,
        nome: body.nome,
        executionPolicy: body.execution_policy,
        requiredScopes: body.required_scopes,
        linkedRoutineId: body.linked_routine_id,
        linkedIntegrationId: body.linked_integration_id,
        description: body.description,
        status: body.status,
        correlationId,
        actorId: user.id,
      });

      reply.header('x-correlation-id', correlationId);
      return reply.send(mapAction(result.action as unknown as Record<string, unknown>));
    },
  );
}
