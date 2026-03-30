/**
 * @contract FR-006, BR-004, BR-009, BR-012
 *
 * Fastify routes for user CRUD.
 * Prefix: /api/v1/users
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import {
  createUserBody,
  createUserResponse,
  userListItem,
  userDetailResponse,
  updateUserBody,
} from '../dtos/users.dto.js';
import { uuidParam, paginationQuery, paginatedResponse } from '../dtos/common.dto.js';
import { EntityNotFoundError } from '../../domain/errors/domain-errors.js';

export async function usersRoutes(app: FastifyInstance): Promise<void> {
  // POST /users — auto-register (public) or admin-created
  app.post<{ Body: z.infer<typeof createUserBody> }>('/', {
    schema: {
      body: createUserBody,
      tags: ['users'],
      operationId: 'users_create',
      response: { 201: createUserResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;
      const createdBy = request.session?.userId ?? null;

      const result = await request.dipiContainer.createUserUseCase.execute({
        email: request.body.email,
        password: request.body.password,
        fullName: request.body.full_name,
        cpfCnpj: request.body.cpf_cnpj,
        correlationId,
        createdBy,
      });

      return reply.status(201).send({
        id: result.id,
        email: result.email,
        codigo: result.codigo,
        full_name: result.fullName ?? request.body.full_name,
        status: result.status,
      });
    },
  });

  // GET /users — list (requires auth + users:user:read)
  app.get<{ Querystring: z.infer<typeof paginationQuery> }>('/', {
    onRequest: [app.verifySession, app.requireScope('users:user:read')],
    schema: {
      querystring: paginationQuery,
      tags: ['users'],
      operationId: 'users_list',
      response: { 200: paginatedResponse(userListItem) },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.userRepo.list(request.session.tenantId, {
        cursor: request.query.cursor,
        limit: request.query.limit,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = result.data.map((u: Record<string, any>) => ({
        id: u.id,
        codigo: u.codigo,
        email: u.email.value,
        full_name: u.profile?.fullName ?? '',
        status: u.status,
        created_at: u.createdAt.toISOString(),
      }));

      return reply
        .status(200)
        .send({ data, next_cursor: result.nextCursor, has_more: result.hasMore });
    },
  });

  // GET /users/:id — detail
  app.get<{ Params: z.infer<typeof uuidParam> }>('/:id', {
    onRequest: [app.verifySession, app.requireScope('users:user:read')],
    schema: {
      params: uuidParam,
      tags: ['users'],
      operationId: 'users_get',
      response: { 200: userDetailResponse },
    },
    handler: async (request, reply) => {
      const user = await request.dipiContainer.userRepo.findById(request.params.id);
      if (!user) {
        throw new EntityNotFoundError('User', request.params.id);
      }

      return reply.status(200).send({
        id: user.id,
        codigo: user.codigo,
        email: user.email.value,
        full_name: user.profile?.fullName ?? '',
        cpf_cnpj: user.profile?.cpfCnpj ?? null,
        avatar_url: user.profile?.avatarUrl ?? null,
        status: user.status,
        created_at: user.createdAt.toISOString(),
        updated_at: user.updatedAt.toISOString(),
      });
    },
  });

  // PATCH /users/:id — update (requires users:user:write)
  app.patch<{ Params: z.infer<typeof uuidParam>; Body: z.infer<typeof updateUserBody> }>('/:id', {
    onRequest: [app.verifySession, app.requireScope('users:user:write')],
    schema: {
      params: uuidParam,
      body: updateUserBody,
      tags: ['users'],
      operationId: 'users_update',
      response: { 200: userDetailResponse },
    },
    handler: async (request, reply) => {
      // Delegate to repo (simplified — full use case can be added)
      const user = await request.dipiContainer.userRepo.findById(request.params.id);
      if (!user) {
        throw new EntityNotFoundError('User', request.params.id);
      }

      await request.dipiContainer.userRepo.updateProfile(request.params.id, {
        fullName: request.body.full_name,
        cpfCnpj: request.body.cpf_cnpj,
      });

      // Re-fetch after update to get fresh data
      const updated = await request.dipiContainer.userRepo.findById(request.params.id);
      const u = updated ?? user;

      return reply.status(200).send({
        id: u.id,
        codigo: u.codigo,
        email: u.email?.value ?? u.email,
        full_name: u.profile?.fullName ?? '',
        cpf_cnpj: u.profile?.cpfCnpj ?? null,
        avatar_url: u.profile?.avatarUrl ?? null,
        status: u.status,
        created_at: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
        updated_at: u.updatedAt instanceof Date ? u.updatedAt.toISOString() : u.updatedAt,
      });
    },
  });

  // POST /users/:id/reset-password — admin-initiated password reset (requires users:user:write)
  /**
   * @contract FR-017, BR-013
   *
   * Triggers a password reset flow for the specified user.
   * Delegates to forgotPasswordUseCase which generates a token and sends email.
   */
  app.post<{ Params: z.infer<typeof uuidParam> }>('/:id/reset-password', {
    onRequest: [app.verifySession, app.requireScope('users:user:write')],
    schema: {
      params: uuidParam,
      tags: ['users'],
      operationId: 'users_reset_password',
      response: {
        200: { type: 'object', properties: { message: { type: 'string' } } },
      },
    },
    handler: async (request, reply) => {
      const user = await request.dipiContainer.userRepo.findById(request.params.id);
      if (!user) {
        throw new EntityNotFoundError('User', request.params.id);
      }

      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.forgotPasswordUseCase.execute({
        email: user.email.value,
        correlationId,
      });

      return reply.status(200).send({ message: 'Link de redefinição de senha enviado.' });
    },
  });

  // DELETE /users/:id/invite — cancel pending invite (requires users:user:delete)
  /**
   * @contract FR-006, BR-004
   *
   * Cancels a pending user invite by transitioning status to INACTIVE.
   * Only allowed when user status is PENDING (returns 409 otherwise).
   */
  app.delete<{ Params: z.infer<typeof uuidParam> }>('/:id/invite', {
    onRequest: [app.verifySession, app.requireScope('users:user:delete')],
    schema: {
      params: uuidParam,
      tags: ['users'],
      operationId: 'users_cancel_invite',
      response: { 200: userDetailResponse },
    },
    handler: async (request, reply) => {
      const user = await request.dipiContainer.userRepo.findById(request.params.id);
      if (!user) {
        throw new EntityNotFoundError('User', request.params.id);
      }

      if (user.status !== 'PENDING') {
        return reply.status(409).send({
          type: '/problems/invalid-status-transition',
          title: 'Conflict',
          status: 409,
          detail: `Convite só pode ser cancelado quando status é PENDING. Status atual: ${user.status}`,
        });
      }

      // Transition status to INACTIVE
      const updated = {
        ...user,
        status: 'INACTIVE' as const,
        updatedAt: new Date(),
      };

      await request.dipiContainer.userRepo.update(updated);

      return reply.status(200).send({
        id: updated.id,
        codigo: updated.codigo,
        email: user.email.value,
        full_name: user.profile?.fullName ?? '',
        cpf_cnpj: user.profile?.cpfCnpj ?? null,
        avatar_url: user.profile?.avatarUrl ?? null,
        status: updated.status,
        created_at: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
        updated_at:
          updated.updatedAt instanceof Date
            ? updated.updatedAt.toISOString()
            : (updated.updatedAt as string),
      });
    },
  });

  // DELETE /users/:id — soft delete (requires users:user:delete)
  app.delete<{ Params: z.infer<typeof uuidParam> }>('/:id', {
    onRequest: [app.verifySession, app.requireScope('users:user:delete')],
    schema: {
      params: uuidParam,
      tags: ['users'],
      operationId: 'users_delete',
      response: { 204: { type: 'null' } },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.deleteUserUseCase.execute({
        userId: request.params.id,
        deletedBy: request.session.userId,
        correlationId,
      });

      return reply.status(204).send();
    },
  });
}
