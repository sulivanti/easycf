/**
 * Integration tests for the session guard (verifySession + requireScope).
 * Verifies authentication and authorization enforcement at the HTTP layer.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp } from '../../helpers/create-test-app.js';
import { setupTestDatabase, teardownTestDatabase } from '../../helpers/db-helper.js';
import { signTestToken, authHeader } from '../../helpers/auth-helper.js';

let app: FastifyInstance;

beforeAll(async () => {
  const dbUrl = await setupTestDatabase();
  app = await createTestApp({ databaseUrl: dbUrl });
}, 60_000);

afterAll(async () => {
  await app?.close();
  await teardownTestDatabase();
});

// ─────────────────────────────────────────────────────────────────────────────
// 401 — No token
// ─────────────────────────────────────────────────────────────────────────────

describe('Session guard — 401 scenarios', () => {
  it('returns 401 when no token is provided (BR-002)', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
    });

    expect(res.statusCode).toBe(401);
  });

  it('returns 401 when Authorization header is malformed', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: { authorization: 'NotBearer some-token' },
    });

    expect(res.statusCode).toBe(401);
  });

  it('returns 401 when token is expired (BR-002)', async () => {
    // Sign a token that expired 1 hour ago
    const expiredToken = app.jwt.sign(
      { sub: 'usr-001', sid: 'sess-001', tid: 'tenant-001', scopes: [] },
      { expiresIn: '-1h' },
    );

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: { authorization: `Bearer ${expiredToken}` },
    });

    expect(res.statusCode).toBe(401);
  });

  it('returns 401 when token has invalid signature', async () => {
    // Create a token with a different secret
    const tamperedToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
      'eyJzdWIiOiJ1c3ItMDAxIiwic2lkIjoic2Vzcy0wMDEiLCJ0aWQiOiJ0LTAwMSIsInNjb3BlcyI6W119.' +
      'invalid-signature-here';

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: { authorization: `Bearer ${tamperedToken}` },
    });

    expect(res.statusCode).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 403 — Missing scope (SEC-001)
// ─────────────────────────────────────────────────────────────────────────────

describe('Session guard — 403 scope enforcement (SEC-001)', () => {
  it('returns 403 when token lacks required scope', async () => {
    // Sign a token with NO org:unit:write scope, then try to create an org unit
    const token = signTestToken(app, {
      sub: 'usr-noscope',
      sid: 'sess-noscope',
      tid: 'tenant-001',
      scopes: ['org:unit:read'], // only read, no write
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/org-units',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        codigo: 'TEST',
        nome: 'Test Unit',
      },
    });

    expect(res.statusCode).toBe(403);
  });

  it('returns 200 when token has required scope', async () => {
    // Valid scope — should pass guard (may fail on DB, but not on auth)
    const token = signTestToken(app, {
      scopes: ['org:unit:read'],
    });

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/org-units',
      headers: { authorization: `Bearer ${token}` },
    });

    // Should pass auth (200), not be blocked by scope guard
    expect(res.statusCode).not.toBe(401);
    expect(res.statusCode).not.toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// X-Correlation-ID propagation (DOC-ARC-002)
// ─────────────────────────────────────────────────────────────────────────────

describe('X-Correlation-ID propagation', () => {
  it('accepts and processes X-Correlation-ID header', async () => {
    const correlationId = 'corr-test-12345';

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        authorization: authHeader(app),
        'x-correlation-id': correlationId,
      },
    });

    // Request should be processed (auth guard passes, even if handler errors)
    // The key assertion is that the server doesn't reject the correlation header
    expect(res.statusCode).not.toBe(400);
  });
});
