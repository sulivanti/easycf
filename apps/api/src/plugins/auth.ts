/**
 * @contract DOC-ARC-004 §3, §5
 *
 * Auth plugin — registers `verifySession` and `requireScope` decorators
 * on the Fastify instance. MUST be registered BEFORE any route plugin.
 *
 * Decorates:
 *  - app.verifySession   → onRequest hook that verifies JWT and populates request.session / request.user
 *  - app.requireScope(s) → factory returning onRequest hook that checks scope presence
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

export async function authPlugin(app: FastifyInstance): Promise<void> {
  // Decorate request with empty defaults (required by Fastify for type safety)
  app.decorateRequest('session', { tenantId: '', userId: '' });
  app.decorateRequest('user', { id: '', tenantId: '' });

  // verifySession — verifies JWT from cookie or Authorization header
  app.decorate('verifySession', async function verifySession(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const token =
      request.cookies.accessToken ??
      (request.headers.authorization?.startsWith('Bearer ')
        ? request.headers.authorization.slice(7)
        : undefined);

    if (!token) {
      void reply.status(401).send({ message: 'Não autenticado.' });
      return;
    }

    try {
      const payload = app.jwt.verify<{
        sub: string;
        sid: string;
        tid: string | null;
        scopes?: string[];
      }>(token);

      request.session = {
        tenantId: payload.tid ?? '',
        userId: payload.sub,
        sessionId: payload.sid,
        scopes: payload.scopes ?? [],
      };

      request.user = {
        id: payload.sub,
        tenantId: payload.tid ?? '',
      };
    } catch {
      void reply.status(401).send({ message: 'Token inválido ou expirado.' });
    }
  });

  // requireScope — factory that returns an onRequest hook checking a specific scope
  app.decorate('requireScope', function requireScope(
    scope: string,
  ): (request: FastifyRequest, reply: FastifyReply) => Promise<void> {
    return async function checkScope(
      request: FastifyRequest,
      reply: FastifyReply,
    ): Promise<void> {
      const scopes = (request.session as Record<string, unknown>).scopes as string[] | undefined;
      if (!scopes?.includes(scope)) {
        void reply.status(403).send({
          message: `Permissão insuficiente. Scope requerido: ${scope}`,
        });
      }
    };
  });
}
