/**
 * @contract FR-003, SEC-007 §2.3 endpoints 7-9
 *
 * Fastify routes for target objects and target fields.
 * Prefix: /api/v1/admin/target-objects
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import {
  uuidParam,
  paginationQuery,
  paginatedResponse,
} from '../../../foundation/presentation/dtos/common.dto.js';
import {
  createTargetObjectBody,
  targetObjectResponse,
  targetObjectListItem,
  createTargetFieldBody,
  targetFieldResponse,
} from '../dtos/contextual-params.dto.js';

export async function adminTargetObjectsRoutes(app: FastifyInstance): Promise<void> {
  // GET /admin/target-objects — list
  app.get<{ Querystring: z.infer<typeof paginationQuery> }>('/', {
    onRequest: [app.verifySession, app.requireScope('param:framer:read')],
    schema: {
      querystring: paginationQuery,
      tags: ['contextual-params'],
      operationId: 'admin_target_objects_list',
      response: { 200: paginatedResponse(targetObjectListItem) },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.targetObjectRepo.list(request.session.tenantId, {
        cursor: request.query.cursor,
        limit: request.query.limit,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = result.data.map((o: Record<string, any>) => ({
        id: o.id,
        codigo: o.codigo,
        nome: o.nome,
        modulo_ecf: o.moduloEcf,
        created_at: o.createdAt.toISOString(),
      }));

      return reply
        .status(200)
        .send({ data, next_cursor: result.nextCursor, has_more: result.hasMore });
    },
  });

  // POST /admin/target-objects — create
  app.post<{ Body: z.infer<typeof createTargetObjectBody> }>('/', {
    onRequest: [app.verifySession, app.requireScope('param:framer:write')],
    schema: {
      body: createTargetObjectBody,
      tags: ['contextual-params'],
      operationId: 'admin_target_objects_create',
      response: { 201: targetObjectResponse },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.createTargetObjectUseCase.execute({
        codigo: request.body.codigo,
        nome: request.body.nome,
        moduloEcf: request.body.modulo_ecf,
        descricao: request.body.descricao,
        tenantId: request.session.tenantId,
      });

      return reply.status(201).send(result);
    },
  });

  // POST /admin/target-objects/:id/fields — add field
  app.post<{ Params: z.infer<typeof uuidParam>; Body: z.infer<typeof createTargetFieldBody> }>(
    '/:id/fields',
    {
      onRequest: [app.verifySession, app.requireScope('param:framer:write')],
      schema: {
        params: uuidParam,
        body: createTargetFieldBody,
        tags: ['contextual-params'],
        operationId: 'admin_target_fields_create',
        response: { 201: targetFieldResponse },
      },
      handler: async (request, reply) => {
        const result = await request.dipiContainer.createTargetFieldUseCase.execute({
          targetObjectId: request.params.id,
          fieldKey: request.body.field_key,
          fieldLabel: request.body.field_label,
          fieldType: request.body.field_type,
          isSystem: request.body.is_system,
          tenantId: request.session.tenantId,
        });

        return reply.status(201).send(result);
      },
    },
  );
}
