/**
 * @contract FR-001, FR-002, FR-003, FR-006, FR-010, BR-002, BR-004, BR-005, BR-006, BR-011, BR-015, DATA-010, SEC-010, EX-OAS-001
 *
 * Fastify routes for MCP Agent admin endpoints.
 * 8 endpoints: list, create, update, revoke, rotate-key, enable-phase2,
 *              grant agent-action link, revoke agent-action link.
 *
 * Scopes: mcp:agent:read, mcp:agent:write, mcp:agent:revoke
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import {
  listAgentsQuery,
  listAgentsResponse,
  createAgentBody,
  createAgentResponse,
  updateAgentBody,
  updateAgentResponse,
  revokeAgentBody,
  revokeAgentResponse,
  rotateAgentKeyResponse,
  enablePhase2Body,
  enablePhase2Response,
  grantAgentActionBody,
  grantAgentActionResponse,
} from '../dtos/agents.dto.js';
import { uuidParam, agentActionParams } from '../dtos/common.dto.js';

/** Map McpAgentProps (camelCase) to API response (snake_case) */
function mapAgent(a: Record<string, unknown>) {
  return {
    id: a.id,
    tenant_id: a.tenantId,
    codigo: a.codigo,
    nome: a.nome,
    owner_user_id: a.ownerUserId,
    allowed_scopes: a.allowedScopes,
    status: a.status,
    phase2_create_enabled: a.phase2CreateEnabled,
    last_used_at: a.lastUsedAt ? (a.lastUsedAt as Date).toISOString() : null,
    created_at: (a.createdAt as Date).toISOString(),
    updated_at: (a.updatedAt as Date).toISOString(),
    revoked_at: a.revokedAt ? (a.revokedAt as Date).toISOString() : null,
  };
}

/** Map McpAgentActionLinkProps to API response */
function mapLink(l: Record<string, unknown>) {
  return {
    id: l.id,
    tenant_id: l.tenantId,
    agent_id: l.agentId,
    action_id: l.actionId,
    granted_by: l.grantedBy,
    granted_at: (l.grantedAt as Date).toISOString(),
    valid_until: l.validUntil ? (l.validUntil as Date).toISOString() : null,
  };
}

export async function agentsRoutes(app: FastifyInstance): Promise<void> {
  const prefix = '/api/v1/admin/mcp-agents';

  // ── GET /admin/mcp-agents — List Agents ─────────────────────────────────
  app.get<{ Querystring: z.infer<typeof listAgentsQuery> }>(
    prefix,
    {
      operationId: 'mcp_agents_list',
      schema: {
        tags: ['mcp-admin'],
        querystring: listAgentsQuery,
        response: { 200: listAgentsResponse },
      },
      onRequest: [app.verifySession, app.requireScope('mcp:agent:read')],
    },
    async (request, reply) => {
      const query = request.query;
      const user = request.user;

      const { listAgentsUseCase } = app.mcpAutomation;
      const result = await listAgentsUseCase.execute({
        tenantId: user.tenantId,
        cursor: query.cursor,
        pageSize: query.limit,
        status: query.status,
        ownerUserId: query.owner_user_id,
      });

      return reply.send({
        data: result.data.map((a: unknown) => mapAgent(a as Record<string, unknown>)),
        next_cursor: result.nextCursor,
        has_more: result.hasMore,
      });
    },
  );

  // ── POST /admin/mcp-agents — Create Agent ──────────────────────────────
  app.post<{ Body: z.infer<typeof createAgentBody> }>(
    prefix,
    {
      operationId: 'mcp_agents_create',
      schema: {
        tags: ['mcp-admin'],
        body: createAgentBody,
        response: { 201: createAgentResponse },
        headers: {
          type: 'object',
          properties: {
            'x-correlation-id': { type: 'string' },
            'idempotency-key': { type: 'string' },
          },
        },
      },
      onRequest: [app.verifySession, app.requireScope('mcp:agent:write')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const body = request.body;
      const user = request.user;

      const { createAgentUseCase } = app.mcpAutomation;
      const result = await createAgentUseCase.execute({
        tenantId: user.tenantId,
        codigo: body.codigo,
        nome: body.nome,
        ownerUserId: body.owner_user_id,
        allowedScopes: body.allowed_scopes,
        correlationId,
        actorId: user.id,
      });

      reply.header('x-correlation-id', correlationId);
      return reply.status(201).send({
        agent: mapAgent(result.agent as unknown as Record<string, unknown>),
        api_key: result.apiKey,
      });
    },
  );

  // ── PATCH /admin/mcp-agents/:id — Update Agent ─────────────────────────
  app.patch<{ Params: z.infer<typeof uuidParam>; Body: z.infer<typeof updateAgentBody> }>(
    `${prefix}/:id`,
    {
      operationId: 'mcp_agents_update',
      schema: {
        tags: ['mcp-admin'],
        params: uuidParam,
        body: updateAgentBody,
        response: { 200: updateAgentResponse },
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('mcp:agent:write')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const { id } = request.params;
      const body = request.body;
      const user = request.user;

      const { updateAgentUseCase } = app.mcpAutomation;
      const result = await updateAgentUseCase.execute({
        id,
        tenantId: user.tenantId,
        nome: body.nome,
        allowedScopes: body.allowed_scopes,
        status: body.status,
        correlationId,
        actorId: user.id,
      });

      reply.header('x-correlation-id', correlationId);
      return reply.send(mapAgent(result.agent as unknown as Record<string, unknown>));
    },
  );

  // ── POST /admin/mcp-agents/:id/revoke — Revoke Agent ───────────────────
  app.post<{ Params: z.infer<typeof uuidParam>; Body: z.infer<typeof revokeAgentBody> }>(
    `${prefix}/:id/revoke`,
    {
      operationId: 'mcp_agents_revoke',
      schema: {
        tags: ['mcp-admin'],
        params: uuidParam,
        body: revokeAgentBody,
        response: { 200: revokeAgentResponse },
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('mcp:agent:revoke')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const { id } = request.params;
      const body = request.body;
      const user = request.user;

      const { revokeAgentUseCase } = app.mcpAutomation;
      const result = await revokeAgentUseCase.execute({
        id,
        tenantId: user.tenantId,
        reason: body.reason,
        correlationId,
        actorId: user.id,
      });

      reply.header('x-correlation-id', correlationId);
      return reply.send(mapAgent(result.agent as unknown as Record<string, unknown>));
    },
  );

  // ── POST /admin/mcp-agents/:id/rotate-key — Rotate API Key ─────────────
  app.post<{ Params: z.infer<typeof uuidParam> }>(
    `${prefix}/:id/rotate-key`,
    {
      operationId: 'mcp_agents_rotate_key',
      schema: {
        tags: ['mcp-admin'],
        params: uuidParam,
        response: { 200: rotateAgentKeyResponse },
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('mcp:agent:write')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const { id } = request.params;
      const user = request.user;

      const { rotateAgentKeyUseCase } = app.mcpAutomation;
      const result = await rotateAgentKeyUseCase.execute({
        id,
        tenantId: user.tenantId,
        correlationId,
        actorId: user.id,
      });

      reply.header('x-correlation-id', correlationId);
      return reply.send({
        agent: mapAgent(result.agent as unknown as Record<string, unknown>),
        api_key: result.apiKey,
      });
    },
  );

  // ── POST /admin/mcp-agents/:id/enable-phase2 — Enable Phase 2 ──────────
  app.post<{ Params: z.infer<typeof uuidParam>; Body: z.infer<typeof enablePhase2Body> }>(
    `${prefix}/:id/enable-phase2`,
    {
      operationId: 'mcp_agents_enable_phase2',
      schema: {
        tags: ['mcp-admin'],
        params: uuidParam,
        body: enablePhase2Body,
        response: { 200: enablePhase2Response },
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('mcp:agent:write')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const { id } = request.params;
      const body = request.body;
      const user = request.user;

      const { enablePhase2UseCase } = app.mcpAutomation;
      const result = await enablePhase2UseCase.execute({
        id,
        tenantId: user.tenantId,
        reason: body.reason,
        correlationId,
        actorId: user.id,
      });

      reply.header('x-correlation-id', correlationId);
      return reply.send({
        agent_id: result.agentId,
        phase2_create_enabled: result.phase2CreateEnabled,
        enabled_by: result.enabledBy,
        enabled_at: result.enabledAt,
        reason: result.reason,
      });
    },
  );

  // ── POST /admin/mcp-agents/:id/actions — Grant Agent-Action Link ───────
  app.post<{ Params: z.infer<typeof uuidParam>; Body: z.infer<typeof grantAgentActionBody> }>(
    `${prefix}/:id/actions`,
    {
      operationId: 'mcp_agents_grant_action',
      schema: {
        tags: ['mcp-admin'],
        params: uuidParam,
        body: grantAgentActionBody,
        response: { 201: grantAgentActionResponse },
        headers: {
          type: 'object',
          properties: {
            'x-correlation-id': { type: 'string' },
            'idempotency-key': { type: 'string' },
          },
        },
      },
      onRequest: [app.verifySession, app.requireScope('mcp:agent:write')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const { id } = request.params;
      const body = request.body;
      const user = request.user;

      const { grantAgentActionUseCase } = app.mcpAutomation;
      const result = await grantAgentActionUseCase.execute({
        agentId: id,
        actionId: body.action_id,
        tenantId: user.tenantId,
        validUntil: body.valid_until,
        correlationId,
        actorId: user.id,
      });

      reply.header('x-correlation-id', correlationId);
      return reply.status(201).send(mapLink(result.link as unknown as Record<string, unknown>));
    },
  );

  // ── DELETE /admin/mcp-agents/:id/actions/:actionId — Revoke Link ───────
  app.delete<{ Params: z.infer<typeof agentActionParams> }>(
    `${prefix}/:id/actions/:actionId`,
    {
      operationId: 'mcp_agents_revoke_action',
      schema: {
        tags: ['mcp-admin'],
        params: agentActionParams,
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('mcp:agent:write')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const { id, actionId } = request.params;
      const user = request.user;

      const { revokeAgentActionUseCase } = app.mcpAutomation;
      await revokeAgentActionUseCase.execute({
        agentId: id,
        actionId,
        tenantId: user.tenantId,
        correlationId,
        actorId: user.id,
      });

      reply.header('x-correlation-id', correlationId);
      return reply.status(204).send();
    },
  );
}
