/**
 * @contract FR-004, FR-010, SEC-007 §2.3 endpoints 10-13, 23-24
 *
 * Fastify routes for incidence rules CRUD + link/unlink routine.
 * Prefix: /api/v1/admin/incidence-rules
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import { uuidParam, paginatedResponse } from '../../../foundation/presentation/dtos/common.dto.js';
import {
  createIncidenceRuleBody,
  updateIncidenceRuleBody,
  incidenceRuleResponse,
  incidenceRuleListItem,
  incidenceRuleListQuery,
  linkRoutineBody,
  linkRoutineResponse,
  unlinkRoutineParams,
} from '../dtos/contextual-params.dto.js';

export async function adminIncidenceRulesRoutes(app: FastifyInstance): Promise<void> {
  // GET /admin/incidence-rules — list with filters
  app.get<{ Querystring: z.infer<typeof incidenceRuleListQuery> }>('/', {
    onRequest: [app.verifySession, app.requireScope('param:framer:read')],
    schema: {
      querystring: incidenceRuleListQuery,
      tags: ['contextual-params'],
      operationId: 'admin_incidence_rules_list',
      response: { 200: paginatedResponse(incidenceRuleListItem) },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.incidenceRuleRepo.list(request.session.tenantId, {
        cursor: request.query.cursor,
        limit: request.query.limit,
        framerId: request.query.framer_id,
        targetObjectId: request.query.target_object_id,
        incidenceType: request.query.incidence_type,
        status: request.query.status,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = result.data.map((r: Record<string, any>) => ({
        id: r.id,
        framer_id: r.framerId,
        target_object_id: r.targetObjectId,
        incidence_type: r.incidenceType,
        status: r.status,
        valid_from: r.validFrom.toISOString(),
        valid_until: r.validUntil?.toISOString() ?? null,
        created_at: r.createdAt.toISOString(),
      }));

      return reply
        .status(200)
        .send({ data, next_cursor: result.nextCursor, has_more: result.hasMore });
    },
  });

  // POST /admin/incidence-rules — create
  app.post<{ Body: z.infer<typeof createIncidenceRuleBody> }>('/', {
    onRequest: [app.verifySession, app.requireScope('param:framer:write')],
    schema: {
      body: createIncidenceRuleBody,
      tags: ['contextual-params'],
      operationId: 'admin_incidence_rules_create',
      response: { 201: incidenceRuleResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      const result = await request.dipiContainer.createIncidenceRuleUseCase.execute({
        framerId: request.body.framer_id,
        targetObjectId: request.body.target_object_id,
        conditionExpr: request.body.condition_expr,
        incidenceType: request.body.incidence_type,
        validFrom: new Date(request.body.valid_from),
        validUntil: request.body.valid_until ? new Date(request.body.valid_until) : undefined,
        tenantId: request.session.tenantId,
        createdBy: request.session.userId,
        correlationId,
      });

      return reply.status(201).send(result);
    },
  });

  // PATCH /admin/incidence-rules/:id — update
  app.patch<{ Params: z.infer<typeof uuidParam>; Body: z.infer<typeof updateIncidenceRuleBody> }>(
    '/:id',
    {
      onRequest: [app.verifySession, app.requireScope('param:framer:write')],
      schema: {
        params: uuidParam,
        body: updateIncidenceRuleBody,
        tags: ['contextual-params'],
        operationId: 'admin_incidence_rules_update',
        response: { 200: incidenceRuleResponse },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

        const result = await request.dipiContainer.updateIncidenceRuleUseCase.execute({
          id: request.params.id,
          validFrom: request.body.valid_from ? new Date(request.body.valid_from) : undefined,
          validUntil:
            request.body.valid_until !== undefined
              ? request.body.valid_until
                ? new Date(request.body.valid_until)
                : null
              : undefined,
          incidenceType: request.body.incidence_type,
          status: request.body.status,
          tenantId: request.session.tenantId,
          createdBy: request.session.userId,
          correlationId,
        });

        return reply.status(200).send(result);
      },
    },
  );

  // DELETE /admin/incidence-rules/:id — inactivate
  app.delete<{ Params: z.infer<typeof uuidParam> }>('/:id', {
    onRequest: [app.verifySession, app.requireScope('param:framer:delete')],
    schema: {
      params: uuidParam,
      tags: ['contextual-params'],
      operationId: 'admin_incidence_rules_delete',
      response: { 204: { type: 'null' } },
    },
    handler: async (request, reply) => {
      await request.dipiContainer.deleteIncidenceRuleUseCase.execute({
        id: request.params.id,
        tenantId: request.session.tenantId,
      });

      return reply.status(204).send();
    },
  });

  // POST /admin/incidence-rules/:id/link-routine — link PUBLISHED routine
  app.post<{ Params: z.infer<typeof uuidParam>; Body: z.infer<typeof linkRoutineBody> }>(
    '/:id/link-routine',
    {
      onRequest: [app.verifySession, app.requireScope('param:framer:write')],
      schema: {
        params: uuidParam,
        body: linkRoutineBody,
        tags: ['contextual-params'],
        operationId: 'admin_incidence_rules_link_routine',
        response: { 201: linkRoutineResponse },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

        const result = await request.dipiContainer.linkRoutineUseCase.execute({
          incidenceRuleId: request.params.id,
          routineId: request.body.routine_id,
          tenantId: request.session.tenantId,
          createdBy: request.session.userId,
          correlationId,
        });

        return reply.status(201).send({
          id: result.id,
          routine_id: result.routineId,
          incidence_rule_id: result.incidenceRuleId,
          created_at: new Date().toISOString(),
        });
      },
    },
  );

  // DELETE /admin/incidence-rules/:id/unlink-routine/:routineId — unlink
  app.delete<{ Params: z.infer<typeof unlinkRoutineParams> }>('/:id/unlink-routine/:routineId', {
    onRequest: [app.verifySession, app.requireScope('param:framer:write')],
    schema: {
      params: unlinkRoutineParams,
      tags: ['contextual-params'],
      operationId: 'admin_incidence_rules_unlink_routine',
      response: { 204: { type: 'null' } },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.unlinkRoutineUseCase.execute({
        incidenceRuleId: request.params.id,
        routineId: request.params.routineId,
        tenantId: request.session.tenantId,
        createdBy: request.session.userId,
        correlationId,
      });

      return reply.status(204).send();
    },
  });
}
