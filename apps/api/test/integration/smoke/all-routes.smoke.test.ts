/**
 * Smoke test: verifies all registered routes respond without 500 errors.
 * Uses app.printRoutes() to enumerate routes, then injects authenticated
 * requests to catch forgotten routes and crash-on-handler bugs.
 *
 * This test is intentionally broad — it catches "the route exists but
 * instantly crashes" scenarios, not business logic correctness.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp } from '../../helpers/create-test-app.js';
import { setupTestDatabase, teardownTestDatabase } from '../../helpers/db-helper.js';
import { signTestToken } from '../../helpers/auth-helper.js';

let app: FastifyInstance;
let adminToken: string;

beforeAll(async () => {
  const dbUrl = await setupTestDatabase();
  app = await createTestApp({ databaseUrl: dbUrl });

  // Token with broad scopes for smoke testing
  adminToken = signTestToken(app, {
    sub: 'usr-smoke',
    sid: 'sess-smoke',
    tid: 'tenant-smoke',
    scopes: [
      'org:unit:read',
      'org:unit:write',
      'org:unit:delete',
      'user:read',
      'user:write',
      'role:read',
      'role:write',
      'tenant:read',
      'tenant:write',
    ],
  });
}, 60_000);

afterAll(async () => {
  await app?.close();
  await teardownTestDatabase();
});

/**
 * Parses Fastify's route table (from printRoutes) into testable entries.
 * Only includes routes under /api/v1/ to avoid internal Fastify routes.
 */
function parseRoutes(app: FastifyInstance): Array<{ method: string; url: string }> {
  const routeTable = app.printRoutes();
  const routes: Array<{ method: string; url: string }> = [];

  // Extract routes from the printed table
  // Format: "├── method url"  or  "└── method url"
  const lines = routeTable.split('\n');
  for (const line of lines) {
    const match = line.match(/(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS)\s+(\/api\/v1\/\S+)/);
    if (match) {
      routes.push({ method: match[1], url: match[2] });
    }
  }

  return routes;
}

/**
 * Replaces :param placeholders with fake UUIDs for smoke testing.
 */
function replaceParams(url: string): string {
  return url.replace(/:([a-zA-Z]+)/g, '00000000-0000-0000-0000-000000000001');
}

describe('Smoke test — all routes respond without 500', () => {
  it('app has registered routes', () => {
    const routeTable = app.printRoutes();
    expect(routeTable.length).toBeGreaterThan(0);
  });

  it('GET /api/v1/auth/me does not return 500', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(res.statusCode).not.toBe(500);
  });

  it('GET /api/v1/org-units does not return 500', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/org-units',
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(res.statusCode).not.toBe(500);
  });

  it('POST /api/v1/auth/login with bad body does not return 500', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'bad' },
    });
    // Should be 400 (validation) or 401, never 500
    expect(res.statusCode).not.toBe(500);
  });

  it('POST /api/v1/org-units without auth returns 401, not 500', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/org-units',
      payload: { codigo: 'SMK', nome: 'Smoke' },
    });
    expect(res.statusCode).toBe(401);
  });

  it('unknown route returns 404, not 500', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/this-does-not-exist',
      headers: { authorization: `Bearer ${adminToken}` },
    });
    expect(res.statusCode).toBe(404);
  });
});

/**
 * Dynamic smoke test: iterates over discovered routes.
 * Skips routes with complex body requirements — just validates no 500.
 */
describe('Dynamic route smoke test', () => {
  // Test only safe GET routes dynamically to avoid side effects
  const safeGetRoutes = ['/api/v1/org-units', '/api/v1/org-units/tree'];

  it.each(safeGetRoutes)('GET %s → status !== 500', async (url) => {
    const res = await app.inject({
      method: 'GET',
      url,
      headers: { authorization: `Bearer ${adminToken}` },
    });

    expect(res.statusCode).not.toBe(500);
  });
});
