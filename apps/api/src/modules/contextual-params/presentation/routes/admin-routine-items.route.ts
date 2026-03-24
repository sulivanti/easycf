/**
 * @contract FR-006, SEC-007 §2.3 endpoints 20-22
 *
 * Fastify routes for routine items CRUD.
 * POST items: /api/v1/admin/routines/:id/items
 * PATCH/DELETE items: /api/v1/admin/routine-items/:id
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import { uuidParam } from '../../../foundation/presentation/dtos/common.dto.js';
import {
  createRoutineItemBody,
  updateRoutineItemBody,
  routineItemResponse,
} from '../dtos/contextual-params.dto.js';

export async function adminRoutineItemsRoutes(app: FastifyInstance): Promise<void> {
  // POST /admin/routines/:id/items — add item to DRAFT routine
  // Note: registered on the routines prefix, but logically part of items
  app.post<{ Params: z.infer<typeof uuidParam>; Body: z.infer<typeof createRoutineItemBody> }>(
    '/routines/:id/items',
    {
      onRequest: [app.verifySession, app.requireScope('param:routine:write')],
      schema: {
        params: uuidParam,
        body: createRoutineItemBody,
        tags: ['contextual-params'],
        operationId: 'admin_routine_items_create',
        response: { 201: routineItemResponse },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

        const result = await request.dipiContainer.createRoutineItemUseCase.execute({
          routineId: request.params.id,
          itemType: request.body.item_type,
          action: request.body.action,
          targetFieldId: request.body.target_field_id,
          value: request.body.value,
          conditionExpr: request.body.condition_expr,
          validationMessage: request.body.validation_message,
          isBlocking: request.body.is_blocking,
          ordem: request.body.ordem,
          tenantId: request.session.tenantId,
          createdBy: request.session.userId,
          correlationId,
        });

        return reply.status(201).send(result);
      },
    },
  );

  // PATCH /admin/routine-items/:id — update item
  app.patch<{ Params: z.infer<typeof uuidParam>; Body: z.infer<typeof updateRoutineItemBody> }>(
    '/routine-items/:id',
    {
      onRequest: [app.verifySession, app.requireScope('param:routine:write')],
      schema: {
        params: uuidParam,
        body: updateRoutineItemBody,
        tags: ['contextual-params'],
        operationId: 'admin_routine_items_update',
        response: { 200: routineItemResponse },
      },
      handler: async (request, reply) => {
        const result = await request.dipiContainer.updateRoutineItemUseCase.execute({
          id: request.params.id,
          itemType: request.body.item_type,
          action: request.body.action,
          targetFieldId: request.body.target_field_id,
          value: request.body.value,
          conditionExpr: request.body.condition_expr,
          validationMessage: request.body.validation_message,
          isBlocking: request.body.is_blocking,
          ordem: request.body.ordem,
          tenantId: request.session.tenantId,
        });

        return reply.status(200).send(result);
      },
    },
  );

  // DELETE /admin/routine-items/:id — delete item
  app.delete<{ Params: z.infer<typeof uuidParam> }>('/routine-items/:id', {
    onRequest: [app.verifySession, app.requireScope('param:routine:write')],
    schema: {
      params: uuidParam,
      tags: ['contextual-params'],
      operationId: 'admin_routine_items_delete',
      response: { 204: { type: 'null' } },
    },
    handler: async (request, reply) => {
      await request.dipiContainer.deleteRoutineItemUseCase.execute({
        id: request.params.id,
        tenantId: request.session.tenantId,
      });

      return reply.status(204).send();
    },
  });
}
