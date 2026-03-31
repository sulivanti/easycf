/**
 * @contract FR-007, SEC-001-M01, BR-013, BR-014, BR-015, BR-016, BR-017, BR-018
 *
 * Fastify routes for Departments (MOD-003 F05).
 * Prefix: /api/v1/departments
 *
 * 6 endpoints:
 *  - POST   /                → Create department (FR-007)
 *  - GET    /                → List flat (FR-007)
 *  - GET    /:id             → Get detail (FR-007)
 *  - PATCH  /:id             → Update (FR-007)
 *  - DELETE /:id             → Soft delete (FR-007)
 *  - PATCH  /:id/restore     → Restore (FR-007)
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import {
  createDepartmentBody,
  createDepartmentResponse,
  updateDepartmentBody,
  updateDepartmentResponse,
  departmentDetailResponse,
  departmentsListQuery,
  departmentListItem,
} from '../dtos/departments.dto.js';
import {
  uuidParam,
  paginatedResponse,
  idempotencyKeyHeader,
} from '../../../foundation/presentation/dtos/common.dto.js';

export async function departmentsRoutes(app: FastifyInstance): Promise<void> {
  // ---- CREATE ---------------------------------------------------------------

  // POST /departments — Create (FR-007, BR-013, BR-017, BR-018)
  app.post<{ Body: z.infer<typeof createDepartmentBody> }>('/', {
    onRequest: [app.verifySession, app.requireScope('org:dept:write')],
    schema: {
      body: createDepartmentBody,
      headers: idempotencyKeyHeader,
      tags: ['departments'],
      operationId: 'departments_create',
      response: { 201: createDepartmentResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;
      const idempotencyKey = request.headers['idempotency-key'] as string | undefined;
      const user = request.session as { userId: string; tenantId: string };

      const result = await request.dipiContainer.createDepartmentUseCase.execute({
        tenantId: user.tenantId,
        codigo: request.body.codigo,
        nome: request.body.nome,
        descricao: request.body.descricao ?? null,
        cor: request.body.cor ?? null,
        createdBy: user.userId,
        correlationId,
        idempotencyKey,
      });

      if (result.limitWarning) {
        void reply.header('X-Limit-Warning', result.limitWarning);
      }

      return reply.status(201).send({
        id: result.id,
        tenant_id: result.tenantId,
        codigo: result.codigo,
        nome: result.nome,
        descricao: result.descricao,
        status: result.status,
        cor: result.cor,
        created_by: result.createdBy,
        created_at: result.createdAt,
        updated_at: result.updatedAt,
      });
    },
  });

  // ---- LIST -----------------------------------------------------------------

  // GET /departments — List (FR-007)
  app.get<{ Querystring: z.infer<typeof departmentsListQuery> }>('/', {
    onRequest: [app.verifySession, app.requireScope('org:dept:read')],
    schema: {
      querystring: departmentsListQuery,
      tags: ['departments'],
      operationId: 'departments_list',
      response: { 200: paginatedResponse(departmentListItem) },
    },
    handler: async (request, reply) => {
      const user = request.session as { tenantId: string };
      const query = request.query;

      const result = await request.dipiContainer.listDepartmentsUseCase.execute({
        tenantId: user.tenantId,
        status: query.status,
        search: query.search,
        cursor: query.cursor,
        limit: query.limit,
      });

      return reply.send({
        data: result.data,
        pagination: {
          next_cursor: result.nextCursor,
          has_more: result.hasMore,
        },
      });
    },
  });

  // ---- DETAIL ---------------------------------------------------------------

  // GET /departments/:id — Detail (FR-007)
  app.get<{ Params: z.infer<typeof uuidParam> }>('/:id', {
    onRequest: [app.verifySession, app.requireScope('org:dept:read')],
    schema: {
      params: uuidParam,
      tags: ['departments'],
      operationId: 'departments_get',
      response: { 200: departmentDetailResponse },
    },
    handler: async (request, reply) => {
      const user = request.session as { tenantId: string };

      const result = await request.dipiContainer.getDepartmentUseCase.execute({
        id: request.params.id,
        tenantId: user.tenantId,
      });

      return reply.send({
        id: result.id,
        tenant_id: result.tenantId,
        codigo: result.codigo,
        nome: result.nome,
        descricao: result.descricao,
        status: result.status,
        cor: result.cor,
        created_by: result.createdBy,
        created_at: result.createdAt,
        updated_at: result.updatedAt,
      });
    },
  });

  // ---- UPDATE ---------------------------------------------------------------

  // PATCH /departments/:id — Update (FR-007, BR-014)
  app.patch<{ Params: z.infer<typeof uuidParam>; Body: z.infer<typeof updateDepartmentBody> }>(
    '/:id',
    {
      onRequest: [app.verifySession, app.requireScope('org:dept:write')],
      schema: {
        params: uuidParam,
        body: updateDepartmentBody,
        tags: ['departments'],
        operationId: 'departments_update',
        response: { 200: updateDepartmentResponse },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;
        const user = request.session as { userId: string; tenantId: string };

        const result = await request.dipiContainer.updateDepartmentUseCase.execute({
          id: request.params.id,
          tenantId: user.tenantId,
          nome: request.body.nome,
          descricao: request.body.descricao,
          cor: request.body.cor,
          codigo: request.body.codigo,
          createdBy: user.userId,
          correlationId,
        });

        return reply.send({
          id: result.id,
          tenant_id: result.tenantId,
          codigo: result.codigo,
          nome: result.nome,
          descricao: result.descricao,
          status: result.status,
          cor: result.cor,
          created_by: result.createdBy,
          created_at: result.createdAt,
          updated_at: result.updatedAt,
        });
      },
    },
  );

  // ---- SOFT DELETE ----------------------------------------------------------

  // DELETE /departments/:id — Soft delete (FR-007, BR-015)
  app.delete<{ Params: z.infer<typeof uuidParam> }>('/:id', {
    onRequest: [app.verifySession, app.requireScope('org:dept:delete')],
    schema: {
      params: uuidParam,
      tags: ['departments'],
      operationId: 'departments_delete',
      response: { 204: { type: 'null' as const } },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;
      const user = request.session as { userId: string; tenantId: string };

      await request.dipiContainer.deleteDepartmentUseCase.execute({
        id: request.params.id,
        tenantId: user.tenantId,
        deletedBy: user.userId,
        correlationId,
      });

      return reply.status(204).send();
    },
  });

  // ---- RESTORE --------------------------------------------------------------

  // PATCH /departments/:id/restore — Restore (FR-007, BR-016)
  app.patch<{ Params: z.infer<typeof uuidParam> }>('/:id/restore', {
    onRequest: [app.verifySession, app.requireScope('org:dept:write')],
    schema: {
      params: uuidParam,
      tags: ['departments'],
      operationId: 'departments_restore',
      response: { 200: departmentDetailResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;
      const user = request.session as { userId: string; tenantId: string };

      const result = await request.dipiContainer.restoreDepartmentUseCase.execute({
        id: request.params.id,
        tenantId: user.tenantId,
        restoredBy: user.userId,
        correlationId,
      });

      return reply.send({
        id: result.id,
        tenant_id: result.tenantId,
        codigo: result.codigo,
        nome: result.nome,
        descricao: result.descricao,
        status: result.status,
        cor: result.cor,
        created_by: result.createdBy,
        created_at: result.createdAt,
        updated_at: result.updatedAt,
      });
    },
  });
}
