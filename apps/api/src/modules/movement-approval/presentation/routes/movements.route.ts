/**
 * @contract DATA-009, EX-OAS-001, SEC-006
 *
 * Fastify routes for controlled movements management.
 * 5 endpoints: list, get detail, cancel, override, retry.
 *
 * Scopes: approval:movement:read, approval:movement:write, approval:override
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import {
  listMovementsQuery,
  listMovementsResponse,
  movementIdParam,
  movementDetailResponse,
  cancelMovementResponse,
  overrideMovementBody,
  overrideMovementResponse,
  retryMovementResponse,
} from '../dtos/movements.dto.js';

export async function movementsRoutes(app: FastifyInstance): Promise<void> {
  const prefix = '/api/v1/movements';

  // ── GET /movements — List Movements ────────────────────────────────────────
  app.get<{ Querystring: z.infer<typeof listMovementsQuery> }>(
    prefix,
    {
      operationId: 'approval_movements_list',
      schema: {
        tags: ['approval'],
        querystring: listMovementsQuery,
        response: { 200: listMovementsResponse },
      },
      onRequest: [app.verifySession, app.requireScope('approval:movement:read')],
    },
    async (request, reply) => {
      const query = request.query;
      const user = request.user;

      const { listMovementsUseCase } = app.movementApproval;
      const result = await listMovementsUseCase.execute({
        tenantId: user.tenantId,
        page: query.page,
        pageSize: query.page_size,
        status: query.status,
        requesterId: query.requester_id,
      });

      const r = result.result;
      return reply.send({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: r.data.map((m: Record<string, any>) => ({
          id: m.id,
          tenant_id: m.tenantId,
          control_rule_id: m.controlRuleId,
          codigo: m.codigo,
          requester_id: m.requesterId,
          requester_origin: m.requesterOrigin,
          object_type: m.objectType,
          object_id: m.objectId ?? null,
          operation_type: m.operationType,
          case_id: m.caseId ?? null,
          current_level: m.currentLevel,
          total_levels: m.totalLevels,
          status: m.status,
          created_at: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
          updated_at: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
        })),
        page: r.page,
        page_size: r.pageSize,
        total: r.total,
        total_pages: Math.ceil(r.total / r.pageSize),
      });
    },
  );

  // ── GET /movements/:id — Movement Detail ───────────────────────────────────
  app.get<{ Params: z.infer<typeof movementIdParam> }>(
    `${prefix}/:id`,
    {
      operationId: 'approval_movements_get',
      schema: {
        tags: ['approval'],
        params: movementIdParam,
        response: { 200: movementDetailResponse },
      },
      onRequest: [app.verifySession, app.requireScope('approval:movement:read')],
    },
    async (request, reply) => {
      const { id } = request.params;
      const user = request.user;

      const { getMovementDetailsUseCase } = app.movementApproval;
      const result = await getMovementDetailsUseCase.execute({
        id,
        tenantId: user.tenantId,
      });

      const m = result.movement;
      return reply.send({
        id: m.id,
        tenant_id: m.tenantId,
        control_rule_id: m.controlRuleId,
        codigo: m.codigo,
        requester_id: m.requesterId,
        requester_origin: m.requesterOrigin,
        object_type: m.objectType,
        object_id: m.objectId ?? null,
        operation_type: m.operationType,
        operation_payload: m.operationPayload ?? null,
        case_id: m.caseId ?? null,
        current_level: m.currentLevel,
        total_levels: m.totalLevels,
        status: m.status,
        idempotency_key: m.idempotencyKey ?? null,
        created_at: m.createdAt instanceof Date ? m.createdAt.toISOString() : m.createdAt,
        updated_at: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        approval_instances: result.approvalInstances.map((a: Record<string, any>) => ({
          id: a.id,
          level: a.level,
          approver_id: a.approverId ?? null,
          status: a.status,
          opinion: a.opinion ?? null,
          decided_at:
            a.decidedAt instanceof Date ? a.decidedAt.toISOString() : (a.decidedAt ?? null),
          timeout_at:
            a.timeoutAt instanceof Date ? a.timeoutAt.toISOString() : (a.timeoutAt ?? null),
          created_at: a.createdAt instanceof Date ? a.createdAt.toISOString() : a.createdAt,
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        history: result.history.map((h: Record<string, any>) => ({
          id: h.id,
          event_type: h.action,
          actor_id: h.actorId ?? null,
          payload: h.detail ?? null,
          correlation_id: h.correlationId ?? null,
          created_at: h.createdAt instanceof Date ? h.createdAt.toISOString() : h.createdAt,
        })),
      });
    },
  );

  // ── POST /movements/:id/cancel — Cancel Movement ──────────────────────────
  app.post<{ Params: z.infer<typeof movementIdParam> }>(
    `${prefix}/:id/cancel`,
    {
      operationId: 'approval_movements_cancel',
      schema: {
        tags: ['approval'],
        params: movementIdParam,
        response: { 200: cancelMovementResponse },
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('approval:movement:write')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const { id } = request.params;
      const user = request.user;

      const { cancelMovementUseCase } = app.movementApproval;
      const result = await cancelMovementUseCase.execute({
        movementId: id,
        tenantId: user.tenantId,
        userId: user.id,
        correlationId,
      });

      const m = result.movement;
      reply.header('x-correlation-id', correlationId);
      return reply.send({
        id: m.id,
        status: m.status,
        updated_at: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
      });
    },
  );

  // ── POST /movements/:id/override — Override Movement ───────────────────────
  app.post<{ Params: z.infer<typeof movementIdParam>; Body: z.infer<typeof overrideMovementBody> }>(
    `${prefix}/:id/override`,
    {
      operationId: 'approval_movements_override',
      schema: {
        tags: ['approval'],
        params: movementIdParam,
        body: overrideMovementBody,
        response: { 200: overrideMovementResponse },
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('approval:override')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const { id } = request.params;
      const body = request.body;
      const user = request.user;

      const { overrideMovementUseCase } = app.movementApproval;
      const result = await overrideMovementUseCase.execute({
        movementId: id,
        justification: body.justification,
        tenantId: user.tenantId,
        userId: user.id,
        correlationId,
      });

      const m = result.movement;
      reply.header('x-correlation-id', correlationId);
      return reply.send({
        id: m.id,
        status: m.status,
        updated_at: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
      });
    },
  );

  // ── POST /movements/:id/retry — Retry Movement ────────────────────────────
  app.post<{ Params: z.infer<typeof movementIdParam> }>(
    `${prefix}/:id/retry`,
    {
      operationId: 'approval_movements_retry',
      schema: {
        tags: ['approval'],
        params: movementIdParam,
        response: { 200: retryMovementResponse },
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('approval:override')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const { id } = request.params;
      const user = request.user;

      const { retryMovementUseCase } = app.movementApproval;
      const result = await retryMovementUseCase.execute({
        movementId: id,
        tenantId: user.tenantId,
        userId: user.id,
        correlationId,
      });

      const m = result.movement;
      reply.header('x-correlation-id', correlationId);
      return reply.send({
        id: m.id,
        status: m.status,
        updated_at: m.updatedAt instanceof Date ? m.updatedAt.toISOString() : m.updatedAt,
      });
    },
  );
}
