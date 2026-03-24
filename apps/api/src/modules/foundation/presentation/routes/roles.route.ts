/**
 * @contract FR-007, BR-005, BR-006, BR-011
 *
 * Fastify routes for role CRUD.
 * Prefix: /api/v1/roles
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import {
  createRoleBody,
  createRoleResponse,
  updateRoleBody,
  roleListItem,
  roleDetailResponse,
} from '../dtos/roles.dto.js';
import { uuidParam, paginationQuery, paginatedResponse } from '../dtos/common.dto.js';
import { EntityNotFoundError } from '../../domain/errors/domain-errors.js';

export async function rolesRoutes(app: FastifyInstance): Promise<void> {
  // POST /roles
  app.post<{ Body: z.infer<typeof createRoleBody> }>('/', {
    onRequest: [app.verifySession, app.requireScope('users:role:write')],
    schema: {
      body: createRoleBody,
      tags: ['roles'],
      operationId: 'roles_create',
      response: { 201: createRoleResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      const result = await request.dipiContainer.createRoleUseCase.execute({
        name: request.body.name,
        description: request.body.description,
        scopes: request.body.scopes,
        createdBy: request.session.userId,
        correlationId,
      });

      return reply.status(201).send(result);
    },
  });

  // GET /roles
  app.get<{ Querystring: z.infer<typeof paginationQuery> }>('/', {
    onRequest: [app.verifySession, app.requireScope('users:role:read')],
    schema: {
      querystring: paginationQuery,
      tags: ['roles'],
      operationId: 'roles_list',
      response: { 200: paginatedResponse(roleListItem) },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.roleRepo.list({
        cursor: request.query.cursor,
        limit: request.query.limit,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = result.data.map((r: Record<string, any>) => ({
        id: r.id,
        codigo: r.codigo,
        name: r.name,
        status: r.status,
        scopes_count: r.scopes.length,
        created_at: r.createdAt.toISOString(),
      }));

      return reply
        .status(200)
        .send({ data, next_cursor: result.nextCursor, has_more: result.hasMore });
    },
  });

  // GET /roles/:id
  app.get<{ Params: z.infer<typeof uuidParam> }>('/:id', {
    onRequest: [app.verifySession, app.requireScope('users:role:read')],
    schema: {
      params: uuidParam,
      tags: ['roles'],
      operationId: 'roles_get',
      response: { 200: roleDetailResponse },
    },
    handler: async (request, reply) => {
      const role = await request.dipiContainer.roleRepo.findById(request.params.id);
      if (!role) throw new EntityNotFoundError('Role', request.params.id);

      return reply.status(200).send({
        id: role.id,
        codigo: role.codigo,
        name: role.name,
        description: role.description,
        status: role.status,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scopes: role.scopes.map((s: Record<string, any>) => s.value),
        created_at: role.createdAt.toISOString(),
        updated_at: role.updatedAt.toISOString(),
      });
    },
  });

  // PUT /roles/:id (BR-006: full scope replacement)
  app.put<{ Params: z.infer<typeof uuidParam>; Body: z.infer<typeof updateRoleBody> }>('/:id', {
    onRequest: [app.verifySession, app.requireScope('users:role:write')],
    schema: {
      params: uuidParam,
      body: updateRoleBody,
      tags: ['roles'],
      operationId: 'roles_update',
      response: { 200: roleDetailResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.updateRoleUseCase.execute({
        roleId: request.params.id,
        name: request.body.name,
        description: request.body.description,
        scopes: request.body.scopes,
        updatedBy: request.session.userId,
        correlationId,
      });

      const role = await request.dipiContainer.roleRepo.findById(request.params.id);

      return reply.status(200).send({
        id: role!.id,
        codigo: role!.codigo,
        name: role!.name,
        description: role!.description,
        status: role!.status,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scopes: role!.scopes.map((s: Record<string, any>) => s.value),
        created_at: role!.createdAt.toISOString(),
        updated_at: role!.updatedAt.toISOString(),
      });
    },
  });

  // DELETE /roles/:id
  app.delete<{ Params: z.infer<typeof uuidParam> }>('/:id', {
    onRequest: [app.verifySession, app.requireScope('users:role:write')],
    schema: {
      params: uuidParam,
      tags: ['roles'],
      operationId: 'roles_delete',
      response: { 204: { type: 'null' } },
    },
    handler: async (request, reply) => {
      const _correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.roleRepo.softDelete(request.params.id);
      return reply.status(204).send();
    },
  });
}
