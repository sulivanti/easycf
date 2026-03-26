/**
 * @contract FR-001, FR-002, FR-003, FR-004, FR-005, FR-017, BR-001, BR-002, BR-010
 *
 * Fastify routes for authentication endpoints.
 * All auth routes are under /api/v1/auth (prefix set at plugin registration).
 *
 * Guards: verifySession (injected via decorator) checks BR-002 kill-switch.
 * Cookies: httpOnly, sameSite=lax (BR-010).
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import {
  loginBody,
  loginResponse,
  loginMfaResponse,
  refreshResponse,
  changePasswordBody,
  forgotPasswordBody,
  forgotPasswordResponse,
  resetPasswordBody,
  updateProfileBody,
  profileResponse,
  sessionItem,
} from '../dtos/auth.dto.js';
import { uuidParam } from '../dtos/common.dto.js';

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // -------------------------------------------------------------------------
  // POST /auth/login (FR-001)
  // -------------------------------------------------------------------------
  app.post<{ Body: z.infer<typeof loginBody> }>('/login', {
    schema: {
      body: loginBody,
      response: { 200: loginResponse.or(loginMfaResponse) },
      tags: ['auth'],
      operationId: 'auth_login',
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      const result = await request.dipiContainer.loginUseCase.execute({
        ...request.body,
        correlationId,
      });

      // BR-010: Set httpOnly cookies + map camelCase → snake_case for DTO
      if ('tokenPair' in result) {
        void reply
          .setCookie('accessToken', result.tokenPair.accessToken, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/',
            secure: process.env.NODE_ENV === 'production',
          })
          .setCookie('refreshToken', result.tokenPair.refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            path: '/api/v1/auth/refresh',
            secure: process.env.NODE_ENV === 'production',
          });

        return reply.status(200).send({
          access_token: result.tokenPair.accessToken,
          refresh_token: result.tokenPair.refreshToken,
          token_type: 'Bearer' as const,
          expires_in: result.tokenPair.expiresIn,
          user: {
            id: result.user.id,
            email: result.user.email,
            full_name: result.user.fullName,
            status: result.user.status,
          },
        });
      }

      // MFA response
      return reply.status(200).send({
        mfa_required: result.mfaRequired,
        temp_token: result.tempToken,
        expires_in: result.expiresIn,
      });
    },
  });

  // -------------------------------------------------------------------------
  // POST /auth/logout (FR-001)
  // -------------------------------------------------------------------------
  app.post('/logout', {
    onRequest: [app.verifySession],
    schema: {
      tags: ['auth'],
      operationId: 'auth_logout',
      response: { 204: { type: 'null' } },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.logoutUseCase.execute({
        sessionId: request.session.id,
        userId: request.session.userId,
        tenantId: request.session.tenantId,
        correlationId,
      });

      // Clear cookies
      void reply
        .clearCookie('accessToken', { path: '/' })
        .clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });

      return reply.status(204).send();
    },
  });

  // -------------------------------------------------------------------------
  // POST /auth/refresh (FR-003)
  // -------------------------------------------------------------------------
  app.post('/refresh', {
    schema: {
      tags: ['auth'],
      operationId: 'auth_refresh',
      response: { 200: refreshResponse },
    },
    handler: async (request, reply) => {
      const refreshToken = request.cookies.refreshToken;
      if (!refreshToken) {
        return reply.status(401).send();
      }

      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      const result = await request.dipiContainer.refreshTokenUseCase.execute({
        refreshToken,
        correlationId,
      });

      // Rotation: set new cookies (BR-010)
      void reply
        .setCookie('accessToken', result.tokenPair.accessToken, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          secure: process.env.NODE_ENV === 'production',
        })
        .setCookie('refreshToken', result.tokenPair.refreshToken, {
          httpOnly: true,
          sameSite: 'lax',
          path: '/api/v1/auth/refresh',
          secure: process.env.NODE_ENV === 'production',
        });

      return reply.status(200).send({
        access_token: result.tokenPair.accessToken,
        refresh_token: result.tokenPair.refreshToken,
        token_type: 'Bearer' as const,
        expires_in: result.tokenPair.expiresIn,
      });
    },
  });

  // -------------------------------------------------------------------------
  // GET /auth/me (FR-004)
  // -------------------------------------------------------------------------
  app.get('/me', {
    onRequest: [app.verifySession],
    schema: {
      tags: ['auth'],
      operationId: 'auth_get_profile',
      response: { 200: profileResponse },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.getProfileUseCase.execute({
        userId: request.session.userId,
        activeTenantId: request.session.tenantId,
      });

      return reply.status(200).send({
        id: result.id,
        email: result.email,
        name: result.name,
        avatar_url: result.avatarUrl,
        tenant: result.tenant,
        scopes: result.scopes,
      });
    },
  });

  // -------------------------------------------------------------------------
  // PATCH /auth/me (FR-004)
  // -------------------------------------------------------------------------
  app.patch<{ Body: z.infer<typeof updateProfileBody> }>('/me', {
    onRequest: [app.verifySession],
    schema: {
      body: updateProfileBody,
      tags: ['auth'],
      operationId: 'auth_update_profile',
      response: { 200: profileResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.updateProfileUseCase.execute({
        userId: request.session.userId,
        fullName: request.body.full_name,
        avatarUrl: request.body.avatar_url,
        tenantId: request.session.tenantId,
        correlationId,
      });

      const profile = await request.dipiContainer.getProfileUseCase.execute({
        userId: request.session.userId,
        activeTenantId: request.session.tenantId,
      });

      return reply.status(200).send({
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatar_url: profile.avatarUrl,
        tenant: profile.tenant,
        scopes: profile.scopes,
      });
    },
  });

  // -------------------------------------------------------------------------
  // POST /auth/change-password (FR-005)
  // -------------------------------------------------------------------------
  app.post<{ Body: z.infer<typeof changePasswordBody> }>('/change-password', {
    onRequest: [app.verifySession],
    schema: {
      body: changePasswordBody,
      tags: ['auth'],
      operationId: 'auth_change_password',
      response: { 200: { type: 'object', properties: { message: { type: 'string' } } } },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.changePasswordUseCase.execute({
        userId: request.session.userId,
        currentPassword: request.body.current_password,
        newPassword: request.body.new_password,
        tenantId: request.session.tenantId,
        correlationId,
      });

      return reply.status(200).send({ message: 'Senha alterada com sucesso.' });
    },
  });

  // -------------------------------------------------------------------------
  // POST /auth/forgot-password (FR-017)
  // -------------------------------------------------------------------------
  app.post<{ Body: z.infer<typeof forgotPasswordBody> }>('/forgot-password', {
    schema: {
      body: forgotPasswordBody,
      tags: ['auth'],
      operationId: 'auth_forgot_password',
      response: { 200: forgotPasswordResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.forgotPasswordUseCase.execute({
        email: request.body.email,
        correlationId,
      });

      // BR-001: Always return same response
      return reply.status(200).send({
        message: 'Se o e-mail estiver cadastrado, você receberá um link de recuperação.',
      });
    },
  });

  // -------------------------------------------------------------------------
  // POST /auth/reset-password (FR-017)
  // -------------------------------------------------------------------------
  app.post<{ Body: z.infer<typeof resetPasswordBody> }>('/reset-password', {
    schema: {
      body: resetPasswordBody,
      tags: ['auth'],
      operationId: 'auth_reset_password',
      response: { 200: { type: 'object', properties: { message: { type: 'string' } } } },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.resetPasswordUseCase.execute({
        token: request.body.token,
        newPassword: request.body.new_password,
        correlationId,
      });

      return reply.status(200).send({ message: 'Senha redefinida com sucesso.' });
    },
  });

  // -------------------------------------------------------------------------
  // GET /auth/sessions (FR-002)
  // -------------------------------------------------------------------------
  app.get('/sessions', {
    onRequest: [app.verifySession],
    schema: {
      tags: ['auth'],
      operationId: 'auth_list_sessions',
      response: {
        200: {
          type: 'object',
          properties: { data: { type: 'array', items: sessionItem } },
        },
      },
    },
    handler: async (request, reply) => {
      const sessions = await request.dipiContainer.sessionRepo.findActiveByUserId(
        request.session.userId,
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = sessions.map((s: Record<string, any>) => ({
        id: s.id,
        device_fp: s.deviceFp,
        remember_me: s.rememberMe,
        expires_at: s.expiresAt.toISOString(),
        created_at: s.createdAt.toISOString(),
        is_current: s.id === request.session.id,
      }));

      return reply.status(200).send({ data });
    },
  });

  // -------------------------------------------------------------------------
  // DELETE /auth/sessions/:id (FR-002)
  // -------------------------------------------------------------------------
  app.delete<{ Params: z.infer<typeof uuidParam> }>('/sessions/:id', {
    onRequest: [app.verifySession],
    schema: {
      params: uuidParam,
      tags: ['auth'],
      operationId: 'auth_revoke_session',
      response: { 204: { type: 'null' } },
    },
    handler: async (request, reply) => {
      await request.dipiContainer.sessionRepo.revoke(request.params.id);
      return reply.status(204).send();
    },
  });

  // -------------------------------------------------------------------------
  // DELETE /auth/sessions (FR-002 — kill-switch global)
  // -------------------------------------------------------------------------
  app.delete('/sessions', {
    onRequest: [app.verifySession],
    schema: {
      tags: ['auth'],
      operationId: 'auth_revoke_all_sessions',
      response: { 204: { type: 'null' } },
    },
    handler: async (request, reply) => {
      await request.dipiContainer.sessionRepo.revokeAllByUserId(request.session.userId);
      return reply.status(204).send();
    },
  });
}
