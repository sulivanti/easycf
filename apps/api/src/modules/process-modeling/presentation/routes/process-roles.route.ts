/**
 * @contract FR-008, SEC-005, INT-005 §1.7
 *
 * Fastify routes for Process Roles global catalog (MOD-005).
 * Prefix: /api/v1/admin
 *
 * 4 endpoints:
 *  - GET    /process-roles      → List roles (FR-008)
 *  - POST   /process-roles      → Create role (FR-008)
 *  - PATCH  /process-roles/:id  → Update role (FR-008)
 *  - DELETE /process-roles/:id  → Soft delete role (FR-008, DATA-005 §2.8)
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import {
  processRolesListQuery,
  processRoleListItem,
  createProcessRoleBody,
  processRoleResponse,
  updateProcessRoleBody,
  roleIdParam,
} from '../dtos/process-modeling.dto.js';
import { paginatedResponse } from '../../../foundation/presentation/dtos/common.dto.js';

export async function processRolesRoutes(app: FastifyInstance): Promise<void> {
  // GET /admin/process-roles — List (FR-008, INT-005 §1.9)
  app.get<{ Querystring: z.infer<typeof processRolesListQuery> }>('/process-roles', {
    onRequest: [app.verifySession, app.requireScope('process:cycle:read')],
    schema: {
      querystring: processRolesListQuery,
      tags: ['process-modeling'],
      operationId: 'admin_process_roles_list',
      response: { 200: paginatedResponse(processRoleListItem) },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.listProcessRolesUseCase.execute({
        tenantId: request.session.tenantId,
        cursor: request.query.cursor,
        limit: request.query.limit,
      });

      return reply.send({
        data: result.data.map((r: Record<string, unknown>) => ({
          id: r.id,
          codigo: r.codigo,
          nome: r.nome,
          can_approve: r.canApprove,
        })),
        next_cursor: result.nextCursor,
        has_more: result.hasMore,
      });
    },
  });

  // POST /admin/process-roles — Create (FR-008, BR-006)
  app.post<{ Body: z.infer<typeof createProcessRoleBody> }>('/process-roles', {
    onRequest: [app.verifySession, app.requireScope('process:cycle:write')],
    schema: {
      body: createProcessRoleBody,
      tags: ['process-modeling'],
      operationId: 'admin_process_roles_create',
      response: { 201: processRoleResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      const result = await request.dipiContainer.createProcessRoleUseCase.execute({
        tenantId: request.session.tenantId,
        codigo: request.body.codigo,
        nome: request.body.nome,
        descricao: request.body.descricao ?? null,
        canApprove: request.body.can_approve,
        createdBy: request.session.userId,
        correlationId,
      });

      return reply.status(201).send({
        id: result.id,
        codigo: result.codigo,
        nome: result.nome,
        descricao: result.descricao,
        can_approve: result.canApprove,
      });
    },
  });

  // PATCH /admin/process-roles/:id — Update (FR-008)
  app.patch<{ Params: z.infer<typeof roleIdParam>; Body: z.infer<typeof updateProcessRoleBody> }>(
    '/process-roles/:id',
    {
      onRequest: [app.verifySession, app.requireScope('process:cycle:write')],
      schema: {
        params: roleIdParam,
        body: updateProcessRoleBody,
        tags: ['process-modeling'],
        operationId: 'admin_process_roles_update',
        response: { 200: processRoleResponse },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

        const result = await request.dipiContainer.updateProcessRoleUseCase.execute({
          id: request.params.id,
          tenantId: request.session.tenantId,
          nome: request.body.nome,
          descricao: request.body.descricao,
          canApprove: request.body.can_approve,
          updatedBy: request.session.userId,
          correlationId,
        });

        return reply.send({
          id: result.id,
          codigo: result.codigo,
          nome: result.nome,
          descricao: result.descricao,
          can_approve: result.canApprove,
        });
      },
    },
  );

  // DELETE /admin/process-roles/:id — Soft delete (FR-008, RESTRICT)
  app.delete<{ Params: z.infer<typeof roleIdParam> }>('/process-roles/:id', {
    onRequest: [app.verifySession, app.requireScope('process:cycle:delete')],
    schema: {
      params: roleIdParam,
      tags: ['process-modeling'],
      operationId: 'admin_process_roles_delete',
      response: { 204: { type: 'null' as const } },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.deleteProcessRoleUseCase.execute({
        id: request.params.id,
        tenantId: request.session.tenantId,
        deletedBy: request.session.userId,
        correlationId,
      });

      return reply.status(204).send();
    },
  });
}
