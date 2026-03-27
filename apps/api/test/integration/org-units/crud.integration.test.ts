/**
 * Integration tests for Org Units CRUD + Domain Events.
 * Prevents: Incident #2 (snake_case), Incident #3 (tenant_id vazio).
 *
 * Uses Testcontainers PostgreSQL + app.inject().
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp } from '../../helpers/create-test-app.js';
import {
  setupTestDatabase,
  teardownTestDatabase,
  getTestDatabaseUrl,
} from '../../helpers/db-helper.js';
import { signTestToken } from '../../helpers/auth-helper.js';
import { SYSTEM_TENANT_ID } from '../../../src/modules/foundation/domain/events/foundation-events.js';

let app: FastifyInstance;
let dbUrl: string;

// Auth token with full org-unit permissions
let writeToken: string;
let readToken: string;
let noScopeToken: string;

beforeAll(async () => {
  dbUrl = await setupTestDatabase();
  app = await createTestApp({ databaseUrl: dbUrl });

  writeToken = signTestToken(app, {
    sub: 'usr-orgtest',
    sid: 'sess-orgtest',
    tid: 'tenant-orgtest',
    scopes: ['org:unit:read', 'org:unit:write', 'org:unit:delete'],
  });

  readToken = signTestToken(app, {
    sub: 'usr-reader',
    sid: 'sess-reader',
    tid: 'tenant-orgtest',
    scopes: ['org:unit:read'],
  });

  noScopeToken = signTestToken(app, {
    sub: 'usr-noscope',
    sid: 'sess-noscope',
    tid: 'tenant-orgtest',
    scopes: [],
  });
}, 60_000);

afterAll(async () => {
  await app?.close();
  await teardownTestDatabase();
});

async function getDb() {
  const { drizzle } = await import('drizzle-orm/postgres-js');
  const postgres = (await import('postgres')).default;
  const schema = await import('../../../db/schema/index.js');
  const sql = postgres(dbUrl);
  const db = drizzle(sql, { schema });
  return { db, sql, ...schema };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /org-units — Create (FR-001, Incident #2, #3)
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/v1/org-units', () => {
  it('returns 201 with snake_case response (Incident #2)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/org-units',
      headers: { authorization: `Bearer ${writeToken}` },
      payload: {
        codigo: 'ROOT01',
        nome: 'Root Unit 01',
        descricao: 'Test root org unit',
      },
    });

    expect(res.statusCode).toBe(201);

    const body = res.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('codigo', 'ROOT01');
    expect(body).toHaveProperty('nome', 'Root Unit 01');
    expect(body).toHaveProperty('nivel', 1); // Root = N1
    expect(body).toHaveProperty('parent_id', null);
    expect(body).toHaveProperty('status', 'ACTIVE');

    // snake_case check — MUST NOT have camelCase
    expect(body).not.toHaveProperty('parentId');
  });

  it('persists domain event with valid tenant_id UUID (Incident #3)', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/v1/org-units',
      headers: {
        authorization: `Bearer ${writeToken}`,
        'x-correlation-id': 'corr-event-check',
      },
      payload: {
        codigo: 'EVT01',
        nome: 'Event Check Unit',
      },
    });

    expect(createRes.statusCode).toBe(201);
    const createdId = createRes.json().id;

    // Query domain_events directly
    const { db, domainEvents, sql } = await getDb();
    const { eq } = await import('drizzle-orm');

    const events = await db.select().from(domainEvents).where(eq(domainEvents.entityId, createdId));

    await sql.end();

    expect(events.length).toBeGreaterThanOrEqual(1);
    const createEvent = events.find((e) => e.eventType === 'org.unit_created');
    expect(createEvent).toBeDefined();

    // Incident #3: tenant_id must NOT be empty string
    expect(createEvent!.tenantId).toBeDefined();
    expect(createEvent!.tenantId).not.toBe('');
    // Should be either the session's tenantId or the SYSTEM_TENANT_ID sentinel
    expect(
      createEvent!.tenantId === 'tenant-orgtest' || createEvent!.tenantId === SYSTEM_TENANT_ID,
    ).toBe(true);
  });

  it('returns 403 without org:unit:write scope (SEC-001)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/org-units',
      headers: { authorization: `Bearer ${readToken}` },
      payload: { codigo: 'NOPE', nome: 'No Access' },
    });

    expect(res.statusCode).toBe(403);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /org-units — Paginated list (FR-005)
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/v1/org-units', () => {
  it('returns paginated list', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/org-units',
      headers: { authorization: `Bearer ${readToken}` },
    });

    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    expect(body).toHaveProperty('has_more');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH + DELETE — Domain events (Incident #3)
// ─────────────────────────────────────────────────────────────────────────────

describe('PATCH / DELETE org-units — domain events', () => {
  let createdId: string;

  it('creates a unit to update/delete', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/org-units',
      headers: { authorization: `Bearer ${writeToken}` },
      payload: { codigo: 'UPD01', nome: 'To Update' },
    });
    expect(res.statusCode).toBe(201);
    createdId = res.json().id;
  });

  it('PATCH persists org.unit_updated event with non-empty tenant_id (Incident #3)', async () => {
    const res = await app.inject({
      method: 'PATCH',
      url: `/api/v1/org-units/${createdId}`,
      headers: { authorization: `Bearer ${writeToken}` },
      payload: { nome: 'Updated Name' },
    });

    expect(res.statusCode).toBe(200);

    const { db, domainEvents, sql } = await getDb();
    const { eq, and } = await import('drizzle-orm');

    const events = await db
      .select()
      .from(domainEvents)
      .where(
        and(eq(domainEvents.entityId, createdId), eq(domainEvents.eventType, 'org.unit_updated')),
      );

    await sql.end();

    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0]!.tenantId).not.toBe('');
  });

  it('DELETE persists org.unit_deleted event with non-empty tenant_id (Incident #3)', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: `/api/v1/org-units/${createdId}`,
      headers: { authorization: `Bearer ${writeToken}` },
    });

    expect(res.statusCode).toBe(200);

    const { db, domainEvents, sql } = await getDb();
    const { eq, and } = await import('drizzle-orm');

    const events = await db
      .select()
      .from(domainEvents)
      .where(
        and(eq(domainEvents.entityId, createdId), eq(domainEvents.eventType, 'org.unit_deleted')),
      );

    await sql.end();

    expect(events.length).toBeGreaterThanOrEqual(1);
    expect(events[0]!.tenantId).not.toBe('');
  });
});
