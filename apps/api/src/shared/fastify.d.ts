/**
 * Fastify module augmentation for custom decorators.
 *
 * Declares properties added at runtime by auth and DI plugins:
 * - FastifyInstance: verifySession, requireScope, caseExecution
 * - FastifyRequest: dipiContainer, session, user
 * - FastifySchema: tags, operationId (@fastify/swagger extensions)
 */
import 'fastify';
import '@fastify/cookie';

declare module 'fastify' {
  interface FastifyInstance {
    verifySession: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireScope: (
      scope: string,
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    /** MOD-006 case-execution use-case registry */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    caseExecution: Record<string, any>;
    /** MOD-010 mcp-automation use-case registry */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mcpAutomation: Record<string, any>;
    /** MOD-009 movement-approval use-case registry */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    movementApproval: Record<string, any>;
  }

  interface FastifyRequest {
    /** DI container injected by the dipi plugin */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    dipiContainer: Record<string, any>;
    /** Authenticated session populated by verifySession */
    session: {
      tenantId: string;
      userId: string;
      [key: string]: unknown;
    };
    /** Authenticated user populated by verifySession (MOD-006 pattern) */
    user: {
      id: string;
      tenantId: string;
      roleCodigos?: string[];
      canApprove?: boolean;
      [key: string]: unknown;
    };
  }

  interface RouteShorthandOptions {
    /** @fastify/swagger — OpenAPI operationId at route level */
    operationId?: string;
  }

  interface FastifySchema {
    /** @fastify/swagger — OpenAPI tags */
    tags?: string[];
    /** @fastify/swagger — OpenAPI operationId */
    operationId?: string;
  }
}
