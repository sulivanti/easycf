/**
 * @contract FR-005, FR-007, FR-008, SEC-007 §2.3 endpoints 14-19
 *
 * Fastify routes for routines CRUD + publish + fork.
 * Prefix: /api/v1/admin/routines
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import { uuidParam, paginatedResponse } from '../../../foundation/presentation/dtos/common.dto.js';
import {
  createRoutineBody,
  updateRoutineBody,
  publishRoutineBody,
  forkRoutineBody,
  routineResponse,
  routineListItem,
  routineListQuery,
  routineDetailResponse,
  publishRoutineResponse,
  forkRoutineResponse,
} from '../dtos/contextual-params.dto.js';

export async function adminRoutinesRoutes(app: FastifyInstance): Promise<void> {
  // GET /admin/routines — list with filters
  app.get<{ Querystring: z.infer<typeof routineListQuery> }>('/', {
    onRequest: [app.verifySession, app.requireScope('param:routine:read')],
    schema: {
      querystring: routineListQuery,
      tags: ['contextual-params'],
      operationId: 'admin_routines_list',
      response: { 200: paginatedResponse(routineListItem) },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.routineRepo.list(request.session.tenantId, {
        cursor: request.query.cursor,
        limit: request.query.limit,
        status: request.query.status,
        routineType: request.query.routine_type,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = result.data.map((r: Record<string, any>) => ({
        id: r.id,
        codigo: r.codigo,
        nome: r.nome,
        routine_type: r.routineType,
        version: r.version,
        status: r.status,
        published_at: r.publishedAt?.toISOString() ?? null,
        created_at: r.createdAt.toISOString(),
      }));

      return reply
        .status(200)
        .send({ data, next_cursor: result.nextCursor, has_more: result.hasMore });
    },
  });

  // POST /admin/routines — create DRAFT
  app.post<{ Body: z.infer<typeof createRoutineBody> }>('/', {
    onRequest: [app.verifySession, app.requireScope('param:routine:write')],
    schema: {
      body: createRoutineBody,
      tags: ['contextual-params'],
      operationId: 'admin_routines_create',
      response: { 201: routineResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      const result = await request.dipiContainer.createRoutineUseCase.execute({
        codigo: request.body.codigo,
        nome: request.body.nome,
        routineType: request.body.routine_type,
        tenantId: request.session.tenantId,
        createdBy: request.session.userId,
        correlationId,
      });

      return reply.status(201).send(result);
    },
  });

  // GET /admin/routines/:id — detail with items, links, history
  app.get<{ Params: z.infer<typeof uuidParam> }>('/:id', {
    onRequest: [app.verifySession, app.requireScope('param:routine:read')],
    schema: {
      params: uuidParam,
      tags: ['contextual-params'],
      operationId: 'admin_routines_get',
      response: { 200: routineDetailResponse },
    },
    handler: async (request, reply) => {
      const tenantId = request.session.tenantId;
      const routineId = request.params.id;

      const routine = await request.dipiContainer.routineRepo.findById(tenantId, routineId);
      if (!routine) {
        return reply.status(404).send({
          type: '/problems/not-found',
          title: 'Not Found',
          status: 404,
          detail: `Rotina ${routineId} não encontrada.`,
        });
      }

      const [items, links, history] = await Promise.all([
        request.dipiContainer.routineItemRepo.listByRoutine(routineId),
        request.dipiContainer.routineIncidenceLinkRepo.listByRoutine(routineId),
        request.dipiContainer.versionHistoryRepo.listByRoutine(routineId),
      ]);

      return reply.status(200).send({
        id: routine.id,
        codigo: routine.codigo,
        nome: routine.nome,
        routine_type: routine.routineType,
        version: routine.version,
        status: routine.status,
        parent_routine_id: routine.parentRoutineId,
        published_at: routine.publishedAt?.toISOString() ?? null,
        approved_by: routine.approvedBy,
        created_at: routine.createdAt.toISOString(),
        updated_at: routine.updatedAt.toISOString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        items: items.map((i: Record<string, any>) => ({
          id: i.id,
          item_type: i.itemType,
          target_field_id: i.targetFieldId,
          action: i.action,
          value: i.value,
          validation_message: i.validationMessage,
          is_blocking: i.isBlocking,
          ordem: i.ordem,
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        incidence_links: links.map((l: Record<string, any>) => ({
          id: l.id,
          incidence_rule_id: l.incidenceRuleId,
          created_at: l.createdAt.toISOString(),
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        version_history: history.map((h: Record<string, any>) => ({
          id: h.id,
          previous_version_id: h.previousVersionId,
          changed_by: h.changedBy,
          change_reason: h.changeReason,
          changed_at: h.changedAt.toISOString(),
        })),
      });
    },
  });

  // PATCH /admin/routines/:id — update (DRAFT only)
  app.patch<{ Params: z.infer<typeof uuidParam>; Body: z.infer<typeof updateRoutineBody> }>(
    '/:id',
    {
      onRequest: [app.verifySession, app.requireScope('param:routine:write')],
      schema: {
        params: uuidParam,
        body: updateRoutineBody,
        tags: ['contextual-params'],
        operationId: 'admin_routines_update',
        response: { 200: routineResponse },
      },
      handler: async (request, reply) => {
        const result = await request.dipiContainer.updateRoutineUseCase.execute({
          id: request.params.id,
          nome: request.body.nome,
          tenantId: request.session.tenantId,
        });

        return reply.status(200).send(result);
      },
    },
  );

  // POST /admin/routines/:id/publish — publish (DRAFT → PUBLISHED)
  app.post<{ Params: z.infer<typeof uuidParam>; Body: z.infer<typeof publishRoutineBody> }>(
    '/:id/publish',
    {
      onRequest: [app.verifySession, app.requireScope('param:routine:publish')],
      schema: {
        params: uuidParam,
        body: publishRoutineBody,
        tags: ['contextual-params'],
        operationId: 'admin_routines_publish',
        response: { 200: publishRoutineResponse },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

        const result = await request.dipiContainer.publishRoutineUseCase.execute({
          id: request.params.id,
          autoDeprecatePrevious: request.body.auto_deprecate_previous,
          tenantId: request.session.tenantId,
          approvedBy: request.session.userId,
          correlationId,
        });

        return reply.status(200).send({
          id: result.id,
          status: result.status,
          published_at: result.publishedAt.toISOString(),
          deprecated_parent_id: result.deprecatedParentId,
        });
      },
    },
  );

  // POST /admin/routines/:id/fork — fork PUBLISHED → new DRAFT
  app.post<{ Params: z.infer<typeof uuidParam>; Body: z.infer<typeof forkRoutineBody> }>(
    '/:id/fork',
    {
      onRequest: [app.verifySession, app.requireScope('param:routine:write')],
      schema: {
        params: uuidParam,
        body: forkRoutineBody,
        tags: ['contextual-params'],
        operationId: 'admin_routines_fork',
        response: { 201: forkRoutineResponse },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

        const result = await request.dipiContainer.forkRoutineUseCase.execute({
          id: request.params.id,
          changeReason: request.body.change_reason,
          tenantId: request.session.tenantId,
          createdBy: request.session.userId,
          correlationId,
        });

        return reply.status(201).send({
          id: result.id,
          codigo: result.codigo,
          version: result.version,
          status: result.status,
          parent_routine_id: result.parentRoutineId,
          items_copied: result.itemsCopied,
          links_copied: result.linksCopied,
        });
      },
    },
  );
}
