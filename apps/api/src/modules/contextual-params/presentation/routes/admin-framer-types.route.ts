/**
 * @contract FR-001, SEC-007 §2.3 endpoints 1-2
 *
 * Fastify routes for framer types CRUD.
 * Prefix: /api/v1/admin/framer-types
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import {
  paginationQuery,
  paginatedResponse,
} from '../../../foundation/presentation/dtos/common.dto.js';
import {
  createFramerTypeBody,
  framerTypeResponse,
  framerTypeListItem,
} from '../dtos/contextual-params.dto.js';

export async function adminFramerTypesRoutes(app: FastifyInstance): Promise<void> {
  // GET /admin/framer-types — list
  app.get<{ Querystring: z.infer<typeof paginationQuery> }>('/', {
    onRequest: [app.verifySession, app.requireScope('param:framer:read')],
    schema: {
      querystring: paginationQuery,
      tags: ['contextual-params'],
      operationId: 'admin_framer_types_list',
      response: { 200: paginatedResponse(framerTypeListItem) },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.framerTypeRepo.list(request.session.tenantId, {
        cursor: request.query.cursor,
        limit: request.query.limit,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = result.data.map((t: Record<string, any>) => ({
        id: t.id,
        codigo: t.codigo,
        nome: t.nome,
        created_at: t.createdAt.toISOString(),
      }));

      return reply
        .status(200)
        .send({ data, next_cursor: result.nextCursor, has_more: result.hasMore });
    },
  });

  // POST /admin/framer-types — create
  app.post<{ Body: z.infer<typeof createFramerTypeBody> }>('/', {
    onRequest: [app.verifySession, app.requireScope('param:framer:write')],
    schema: {
      body: createFramerTypeBody,
      tags: ['contextual-params'],
      operationId: 'admin_framer_types_create',
      response: { 201: framerTypeResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      const result = await request.dipiContainer.createFramerTypeUseCase.execute({
        codigo: request.body.codigo,
        nome: request.body.nome,
        descricao: request.body.descricao,
        tenantId: request.session.tenantId,
        createdBy: request.session.userId,
        correlationId,
      });

      return reply.status(201).send(result);
    },
  });
}
