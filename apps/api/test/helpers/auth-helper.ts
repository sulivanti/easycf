/**
 * JWT token factory for integration tests.
 * Uses the Fastify app's JWT plugin to sign tokens, ensuring realistic payloads.
 */

import type { FastifyInstance } from 'fastify';

export interface TestTokenPayload {
  sub: string;
  sid: string;
  tid: string;
  scopes: string[];
}

const defaults: TestTokenPayload = {
  sub: 'usr-test-001',
  sid: 'sess-test-001',
  tid: 'tenant-test-001',
  scopes: ['org:unit:read', 'org:unit:write', 'org:unit:delete'],
};

/**
 * Signs a JWT using the Fastify app's configured secret.
 * Returns the raw token string ready for `Authorization: Bearer <token>`.
 */
export function signTestToken(
  app: FastifyInstance,
  overrides: Partial<TestTokenPayload> = {},
): string {
  const payload = { ...defaults, ...overrides };
  return app.jwt.sign(payload);
}

/**
 * Returns an `Authorization` header value with a valid Bearer token.
 */
export function authHeader(
  app: FastifyInstance,
  overrides: Partial<TestTokenPayload> = {},
): string {
  return `Bearer ${signTestToken(app, overrides)}`;
}

/**
 * Returns the default correlation ID used in tests.
 */
export const TEST_CORRELATION_ID = 'corr-integration-test';
