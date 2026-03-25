import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { eq, and } from 'drizzle-orm';
import { compare } from 'bcrypt';
import {
  users,
  contentUsers,
  tenantUsers,
  roles,
  rolePermissions,
  userSessions,
} from '../db/schema/index.js';

const PORT = Number(process.env.API_PORT) || 3000;
const HOST = '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-min-32-chars-long-replace-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';
const IS_PROD = process.env.NODE_ENV === 'production';

// Database
const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

const app = Fastify({ logger: { level: process.env.LOG_LEVEL || 'info' } });

// Plugins
await app.register(helmet);
await app.register(cors, {
  origin: process.env.CORS_ORIGIN?.split(',') ?? ['http://localhost:5173'],
  credentials: true,
});
await app.register(cookie);
await app.register(jwt, {
  secret: JWT_SECRET,
  sign: { expiresIn: JWT_EXPIRES_IN },
});

// Health / Info
app.get('/api/v1/info', async () => ({
  name: '@easycode/api',
  version: '0.10.0',
  env: process.env.NODE_ENV ?? 'development',
  uptime: process.uptime(),
}));

// POST /api/v1/auth/login
app.post('/api/v1/auth/login', async (request, reply) => {
  const { email, password, remember_me } = request.body as {
    email: string;
    password: string;
    remember_me?: boolean;
  };

  // Find user
  const [user] = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email), eq(users.status, 'ACTIVE')))
    .limit(1);

  if (!user) {
    return reply.status(401).send({ message: 'Credenciais inválidas.' });
  }

  // Verify password
  const valid = await compare(password, user.passwordHash);
  if (!valid) {
    return reply.status(401).send({ message: 'Credenciais inválidas.' });
  }

  // Get profile
  const [profile] = await db
    .select()
    .from(contentUsers)
    .where(eq(contentUsers.userId, user.id))
    .limit(1);

  // Get tenant + role + scopes
  const [tenantLink] = await db
    .select()
    .from(tenantUsers)
    .where(and(eq(tenantUsers.userId, user.id), eq(tenantUsers.status, 'ACTIVE')))
    .limit(1);

  let scopes: string[] = [];
  if (tenantLink) {
    const perms = await db
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, tenantLink.roleId));
    scopes = perms.map((p) => p.scope);
  }

  // Create session
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + (remember_me ? 30 : 1));

  const [session] = await db
    .insert(userSessions)
    .values({
      userId: user.id,
      rememberMe: remember_me ?? false,
      expiresAt,
    })
    .returning();

  // Generate tokens
  const tokenPayload = {
    sub: user.id,
    sid: session.id,
    tid: tenantLink?.tenantId ?? null,
    scopes,
  };

  const accessToken = app.jwt.sign(tokenPayload);
  const refreshToken = app.jwt.sign(
    { sub: user.id, sid: session.id, type: 'refresh' },
    { expiresIn: JWT_REFRESH_EXPIRES_IN },
  );

  // Set cookies
  void reply
    .setCookie('accessToken', accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: IS_PROD,
    })
    .setCookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      path: '/api/v1/auth/refresh',
      secure: IS_PROD,
    });

  return reply.status(200).send({
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: 'Bearer',
    expires_in: 900,
    user: {
      id: user.id,
      email: user.email,
      full_name: profile?.fullName ?? '',
      status: user.status,
    },
  });
});

// Start
try {
  await app.listen({ port: PORT, host: HOST });
  app.log.info(`API running on ${HOST}:${PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
