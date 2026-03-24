/**
 * @contract FR-008, FR-009, BR-007
 *
 * Fastify routes for tenant CRUD + tenant-user management.
 * Prefix: /api/v1/tenants
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import {
  createTenantBody,
  createTenantResponse,
  updateTenantBody,
  tenantListItem,
  addTenantUserBody,
  tenantUserListItem,
} from '../dtos/tenants.dto.js';
import {
  uuidParam,
  tenantIdParam,
  tenantUserParams,
  paginationQuery,
  paginatedResponse,
} from '../dtos/common.dto.js';

export async function tenantsRoutes(app: FastifyInstance): Promise<void> {
  // ---- Tenant CRUD --------------------------------------------------------

  // POST /tenants
  app.post<{ Body: z.infer<typeof createTenantBody> }>('/', {
    onRequest: [app.verifySession, app.requireScope('tenants:branch:write')],
    schema: {
      body: createTenantBody,
      tags: ['tenants'],
      operationId: 'tenants_create',
      response: { 201: createTenantResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      const result = await request.dipiContainer.createTenantUseCase.execute({
        codigo: request.body.codigo,
        name: request.body.name,
        createdBy: request.session.userId,
        correlationId,
      });

      return reply.status(201).send(result);
    },
  });

  // GET /tenants
  app.get<{ Querystring: z.infer<typeof paginationQuery> }>('/', {
    onRequest: [app.verifySession, app.requireScope('tenants:branch:read')],
    schema: {
      querystring: paginationQuery,
      tags: ['tenants'],
      operationId: 'tenants_list',
      response: { 200: paginatedResponse(tenantListItem) },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.tenantRepo.list({
        cursor: request.query.cursor,
        limit: request.query.limit,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = result.data.map((t: Record<string, any>) => ({
        id: t.id,
        codigo: t.codigo,
        name: t.name,
        status: t.status,
        created_at: t.createdAt.toISOString(),
      }));

      return reply
        .status(200)
        .send({ data, next_cursor: result.nextCursor, has_more: result.hasMore });
    },
  });

  // PATCH /tenants/:id
  app.patch<{ Params: z.infer<typeof uuidParam>; Body: z.infer<typeof updateTenantBody> }>('/:id', {
    onRequest: [app.verifySession, app.requireScope('tenants:branch:write')],
    schema: {
      params: uuidParam,
      body: updateTenantBody,
      tags: ['tenants'],
      operationId: 'tenants_update',
      response: { 200: createTenantResponse },
    },
    handler: async (request, reply) => {
      const tenant = await request.dipiContainer.tenantRepo.findById(request.params.id);
      if (!tenant) return reply.status(404).send();

      const updated = {
        ...tenant,
        name: request.body.name ?? tenant.name,
        status: request.body.status ?? tenant.status,
        updatedAt: new Date(),
      };

      await request.dipiContainer.tenantRepo.update(updated);

      return reply.status(200).send({
        id: updated.id,
        codigo: updated.codigo,
        name: updated.name,
        status: updated.status,
      });
    },
  });

  // DELETE /tenants/:id
  app.delete<{ Params: z.infer<typeof uuidParam> }>('/:id', {
    onRequest: [app.verifySession, app.requireScope('tenants:branch:write')],
    schema: {
      params: uuidParam,
      tags: ['tenants'],
      operationId: 'tenants_delete',
      response: { 204: { type: 'null' } },
    },
    handler: async (request, reply) => {
      const _correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.tenantRepo.softDelete(request.params.id);
      return reply.status(204).send();
    },
  });

  // ---- Tenant-Users (FR-009) ----------------------------------------------

  // POST /tenants/:tenantId/users
  app.post<{ Params: z.infer<typeof tenantIdParam>; Body: z.infer<typeof addTenantUserBody> }>(
    '/:tenantId/users',
    {
      onRequest: [app.verifySession, app.requireScope('tenants:branch:write')],
      schema: {
        params: tenantIdParam,
        body: addTenantUserBody,
        tags: ['tenant-users'],
        operationId: 'tenant_users_add',
        response: { 201: { type: 'object', properties: { message: { type: 'string' } } } },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

        await request.dipiContainer.addTenantUserUseCase.execute({
          userId: request.body.user_id,
          tenantId: request.params.tenantId,
          roleId: request.body.role_id,
          addedBy: request.session.userId,
          correlationId,
        });

        return reply.status(201).send({ message: 'Usuário vinculado.' });
      },
    },
  );

  // GET /tenants/:tenantId/users
  app.get<{ Params: z.infer<typeof tenantIdParam>; Querystring: z.infer<typeof paginationQuery> }>(
    '/:tenantId/users',
    {
      onRequest: [app.verifySession, app.requireScope('tenants:branch:read')],
      schema: {
        params: tenantIdParam,
        querystring: paginationQuery,
        tags: ['tenant-users'],
        operationId: 'tenant_users_list',
        response: { 200: paginatedResponse(tenantUserListItem) },
      },
      handler: async (request, reply) => {
        const result = await request.dipiContainer.tenantUserRepo.listByTenant(
          request.params.tenantId,
          { cursor: request.query.cursor, limit: request.query.limit },
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = result.data.map((tu: Record<string, any>) => ({
          user_id: tu.userId,
          tenant_id: tu.tenantId,
          role_id: tu.roleId,
          status: tu.status,
          created_at: tu.createdAt.toISOString(),
        }));

        return reply
          .status(200)
          .send({ data, next_cursor: result.nextCursor, has_more: result.hasMore });
      },
    },
  );

  // DELETE /tenants/:tenantId/users/:userId
  app.delete<{ Params: z.infer<typeof tenantUserParams> }>('/:tenantId/users/:userId', {
    onRequest: [app.verifySession, app.requireScope('tenants:branch:write')],
    schema: {
      params: tenantUserParams,
      tags: ['tenant-users'],
      operationId: 'tenant_users_remove',
      response: { 204: { type: 'null' } },
    },
    handler: async (request, reply) => {
      const _correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.tenantUserRepo.softDelete(
        request.params.userId,
        request.params.tenantId,
      );
      return reply.status(204).send();
    },
  });
}
