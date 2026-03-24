/**
 * @contract FR-002, SEC-007 §2.3 endpoints 3-6
 *
 * Fastify routes for framers CRUD.
 * Prefix: /api/v1/admin/framers
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import { uuidParam } from '../../../foundation/presentation/dtos/common.dto.js';
import {
  createFramerBody,
  updateFramerBody,
  framerResponse,
  framerListItem,
  framerListQuery,
} from '../dtos/contextual-params.dto.js';
import { paginatedResponse } from '../../../foundation/presentation/dtos/common.dto.js';

export async function adminFramersRoutes(app: FastifyInstance): Promise<void> {
  // GET /admin/framers — list with filters
  app.get<{ Querystring: z.infer<typeof framerListQuery> }>('/', {
    onRequest: [app.verifySession, app.requireScope('param:framer:read')],
    schema: {
      querystring: framerListQuery,
      tags: ['contextual-params'],
      operationId: 'admin_framers_list',
      response: { 200: paginatedResponse(framerListItem) },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.framerRepo.list(request.session.tenantId, {
        cursor: request.query.cursor,
        limit: request.query.limit,
        status: request.query.status,
        framerTypeId: request.query.framer_type_id,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = result.data.map((f: Record<string, any>) => ({
        id: f.id,
        codigo: f.codigo,
        nome: f.nome,
        framer_type_id: f.framerTypeId,
        status: f.status,
        valid_from: f.validFrom.toISOString(),
        valid_until: f.validUntil?.toISOString() ?? null,
        created_at: f.createdAt.toISOString(),
      }));

      return reply
        .status(200)
        .send({ data, next_cursor: result.nextCursor, has_more: result.hasMore });
    },
  });

  // POST /admin/framers — create
  app.post<{ Body: z.infer<typeof createFramerBody> }>('/', {
    onRequest: [app.verifySession, app.requireScope('param:framer:write')],
    schema: {
      body: createFramerBody,
      tags: ['contextual-params'],
      operationId: 'admin_framers_create',
      response: { 201: framerResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      const result = await request.dipiContainer.createFramerUseCase.execute({
        codigo: request.body.codigo,
        nome: request.body.nome,
        framerTypeId: request.body.framer_type_id,
        validFrom: new Date(request.body.valid_from),
        validUntil: request.body.valid_until ? new Date(request.body.valid_until) : undefined,
        tenantId: request.session.tenantId,
        createdBy: request.session.userId,
        correlationId,
      });

      return reply.status(201).send(result);
    },
  });

  // PATCH /admin/framers/:id — update
  app.patch<{ Params: z.infer<typeof uuidParam>; Body: z.infer<typeof updateFramerBody> }>('/:id', {
    onRequest: [app.verifySession, app.requireScope('param:framer:write')],
    schema: {
      params: uuidParam,
      body: updateFramerBody,
      tags: ['contextual-params'],
      operationId: 'admin_framers_update',
      response: { 200: framerResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      const result = await request.dipiContainer.updateFramerUseCase.execute({
        id: request.params.id,
        nome: request.body.nome,
        validFrom: request.body.valid_from ? new Date(request.body.valid_from) : undefined,
        validUntil:
          request.body.valid_until !== undefined
            ? request.body.valid_until
              ? new Date(request.body.valid_until)
              : null
            : undefined,
        tenantId: request.session.tenantId,
        createdBy: request.session.userId,
        correlationId,
      });

      return reply.status(200).send(result);
    },
  });

  // DELETE /admin/framers/:id — soft delete
  app.delete<{ Params: z.infer<typeof uuidParam> }>('/:id', {
    onRequest: [app.verifySession, app.requireScope('param:framer:delete')],
    schema: {
      params: uuidParam,
      tags: ['contextual-params'],
      operationId: 'admin_framers_delete',
      response: { 204: { type: 'null' } },
    },
    handler: async (request, reply) => {
      await request.dipiContainer.deleteFramerUseCase.execute({
        id: request.params.id,
        tenantId: request.session.tenantId,
      });

      return reply.status(204).send();
    },
  });
}
