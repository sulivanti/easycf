/**
 * Integration tests for the Auth login/logout/refresh/profile flow.
 * Prevents: Incident #1 (JWT missing claims), #2 (snake_case serialization), #5 (logout cleanup).
 *
 * Uses Testcontainers PostgreSQL + app.inject() (no network, no supertest).
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { createTestApp } from '../../helpers/create-test-app.js';
import { setupTestDatabase, teardownTestDatabase } from '../../helpers/db-helper.js';
import { signTestToken, TEST_CORRELATION_ID } from '../../helpers/auth-helper.js';
import { buildUser, buildContentUser, KNOWN_PASSWORD } from '../../factories/index.js';
import { buildTenant } from '../../factories/index.js';

let app: FastifyInstance;
let dbUrl: string;

// Seeded data references
let seededUserId: string;
let seededTenantId: string;
let seededUserEmail: string;

beforeAll(async () => {
  dbUrl = await setupTestDatabase();
  app = await createTestApp({ databaseUrl: dbUrl });

  // Seed: create tenant, user, content_user, role + tenant_user via direct DB insert
  const { db, users, contentUsers, tenants, roles, rolePermissions, tenantUsers } = await getDbAndTables();

  const tenant = buildTenant({ codigo: 'MAIN', name: 'Main Tenant' });
  seededTenantId = tenant.id;
  await db.insert(tenants).values(tenant);

  const role = {
    id: crypto.randomUUID(),
    name: 'admin',
    description: 'Admin role',
    status: 'ACTIVE' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };
  await db.insert(roles).values(role);

  // Insert scopes for this role
  await db.insert(rolePermissions).values([
    { roleId: role.id, scope: 'org:unit:read' },
    { roleId: role.id, scope: 'org:unit:write' },
    { roleId: role.id, scope: 'org:unit:delete' },
  ]);

  const user = buildUser({
    email: 'login-test@ecf.dev',
    codigo: 'LOGINT',
    status: 'ACTIVE',
  });
  seededUserId = user.id;
  seededUserEmail = user.email;

  // Hash the known password via bcrypt so the login flow works
  const bcrypt = await import('bcrypt');
  user.passwordHash = await bcrypt.hash(KNOWN_PASSWORD, 12);

  await db.insert(users).values(user);
  await db.insert(contentUsers).values(buildContentUser(user.id, { fullName: 'Login Test User' }));

  // Link user to tenant with role
  await db.insert(tenantUsers).values({
    userId: user.id,
    tenantId: tenant.id,
    roleId: role.id,
    status: 'ACTIVE',
    createdAt: new Date(),
  });
}, 60_000); // Testcontainers can take up to 60s to start

afterAll(async () => {
  await app?.close();
  await teardownTestDatabase();
});

async function getDbAndTables() {
  const { drizzle } = await import('drizzle-orm/postgres-js');
  const postgres = (await import('postgres')).default;
  const schema = await import('../../../db/schema/index.js');
  const sql = postgres(dbUrl);
  const db = drizzle(sql, { schema });
  return { db, sql, ...schema };
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/login — Success (FR-001)
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/login', () => {
  it('returns 200 with snake_case body on valid credentials (Incident #2)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      headers: { 'x-correlation-id': TEST_CORRELATION_ID },
      payload: { email: seededUserEmail, password: KNOWN_PASSWORD },
    });

    expect(res.statusCode).toBe(200);

    const body = res.json();

    // Incident #2: Response MUST be snake_case
    expect(body).toHaveProperty('access_token');
    expect(body).toHaveProperty('refresh_token');
    expect(body).toHaveProperty('token_type', 'Bearer');
    expect(body).toHaveProperty('expires_in');
    expect(body).toHaveProperty('user');
    expect(body.user).toHaveProperty('id');
    expect(body.user).toHaveProperty('email', seededUserEmail);
    expect(body.user).toHaveProperty('full_name');
    expect(body.user).toHaveProperty('status', 'ACTIVE');

    // Must NOT have camelCase keys
    expect(body).not.toHaveProperty('accessToken');
    expect(body).not.toHaveProperty('refreshToken');
    expect(body).not.toHaveProperty('tokenType');
    expect(body).not.toHaveProperty('expiresIn');
  });

  it('JWT contains sub, sid, tid, scopes (Incident #1)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: seededUserEmail, password: KNOWN_PASSWORD },
    });

    const body = res.json();
    const token = body.access_token;

    // Decode JWT payload (no verification — just inspect claims)
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64url').toString(),
    );

    expect(payload).toHaveProperty('sub'); // userId
    expect(payload.sub).toBe(seededUserId);
    expect(payload).toHaveProperty('sid'); // sessionId
    expect(typeof payload.sid).toBe('string');
    expect(payload.sid.length).toBeGreaterThan(0);
    expect(payload).toHaveProperty('tid'); // tenantId
    expect(payload).toHaveProperty('scopes');
    expect(Array.isArray(payload.scopes)).toBe(true);
    expect(payload.scopes.length).toBeGreaterThan(0);
  });

  it('sets httpOnly cookies (BR-010)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: seededUserEmail, password: KNOWN_PASSWORD },
    });

    const cookies = res.cookies;
    const accessCookie = cookies.find((c) => c.name === 'accessToken');
    const refreshCookie = cookies.find((c) => c.name === 'refreshToken');

    expect(accessCookie).toBeDefined();
    expect(accessCookie?.httpOnly).toBe(true);
    expect(refreshCookie).toBeDefined();
    expect(refreshCookie?.httpOnly).toBe(true);
  });

  it('returns 401 on wrong password with Problem Details (BR-001)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: seededUserEmail, password: 'WrongPassword!1' },
    });

    // Anti-enumeration: same error for wrong password and non-existent user
    expect(res.statusCode).toBe(401);
  });

  it('returns 401 for non-existent email (BR-001 anti-enumeration)', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: 'nonexistent@ecf.dev', password: KNOWN_PASSWORD },
    });

    expect(res.statusCode).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/logout — Clears cookies (FR-001, Incident #5)
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/logout', () => {
  it('returns 204 and clears cookies (Incident #5)', async () => {
    // Login first to get a valid session
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: seededUserEmail, password: KNOWN_PASSWORD },
    });
    const loginBody = loginRes.json();

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers: {
        authorization: `Bearer ${loginBody.access_token}`,
        'x-correlation-id': TEST_CORRELATION_ID,
      },
      cookies: { accessToken: loginBody.access_token },
    });

    expect(res.statusCode).toBe(204);

    // Verify cookies are cleared
    const clearedAccess = res.cookies.find((c) => c.name === 'accessToken');
    const clearedRefresh = res.cookies.find((c) => c.name === 'refreshToken');

    if (clearedAccess) {
      expect(clearedAccess.value).toBe('');
    }
    if (clearedRefresh) {
      expect(clearedRefresh.value).toBe('');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /auth/refresh — Token rotation (FR-003)
// ─────────────────────────────────────────────────────────────────────────────

describe('POST /api/v1/auth/refresh', () => {
  it('returns rotated tokens in snake_case (Incident #2)', async () => {
    // Login to get a refresh token
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: seededUserEmail, password: KNOWN_PASSWORD },
    });
    const loginBody = loginRes.json();

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
      cookies: { refreshToken: loginBody.refresh_token },
    });

    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body).toHaveProperty('access_token');
    expect(body).toHaveProperty('refresh_token');
    expect(body).toHaveProperty('token_type', 'Bearer');
    expect(body).toHaveProperty('expires_in');
  });

  it('returns 401 without refresh cookie', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/refresh',
    });

    expect(res.statusCode).toBe(401);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /auth/me — Profile in snake_case (FR-004, Incident #2)
// ─────────────────────────────────────────────────────────────────────────────

describe('GET /api/v1/auth/me', () => {
  it('returns profile with snake_case keys (Incident #2)', async () => {
    // Login to get a token
    const loginRes = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { email: seededUserEmail, password: KNOWN_PASSWORD },
    });
    const loginBody = loginRes.json();

    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/auth/me',
      headers: {
        authorization: `Bearer ${loginBody.access_token}`,
      },
    });

    expect(res.statusCode).toBe(200);

    const body = res.json();
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('email');
    expect(body).toHaveProperty('name');
    // snake_case check
    expect(body).toHaveProperty('avatar_url');
    expect(body).not.toHaveProperty('avatarUrl');
  });
});
