/**
 * Creates a fully-wired Fastify instance for integration tests.
 * Uses the same plugin registration order as the real app (DOC-ARC-004 §3).
 *
 * Usage:
 *   const app = await createTestApp(databaseUrl);
 *   const res = await app.inject({ method: 'POST', url: '/api/v1/auth/login', ... });
 */

import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

import { authPlugin } from '../../src/plugins/auth.js';
import { diPlugin } from '../../src/plugins/di.js';
import { authRoutes } from '../../src/modules/foundation/index.js';
import { orgUnitsRoutes } from '../../src/modules/org-units/index.js';

// Re-export error handler for tests that need it
export { foundationErrorHandler } from '../../src/modules/foundation/index.js';

const TEST_JWT_SECRET = 'test-jwt-secret-that-is-at-least-32-chars!!';

export interface CreateTestAppOptions {
  databaseUrl: string;
  /** Register additional route plugins. Defaults to auth + org-units. */
  registerRoutes?: (app: FastifyInstance) => Promise<void>;
}

export async function createTestApp(options: CreateTestAppOptions): Promise<FastifyInstance> {
  // Set env before DI plugin reads it
  process.env.DATABASE_URL = options.databaseUrl;

  const app = Fastify({ logger: false });

  // Zod type provider
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Core plugins (same order as production)
  await app.register(helmet);
  await app.register(cors, { origin: '*', credentials: true });
  await app.register(cookie);
  await app.register(jwt, {
    secret: TEST_JWT_SECRET,
    sign: { expiresIn: '15m' },
  });

  // Auth & DI (BEFORE routes)
  await app.register(authPlugin);
  await app.register(diPlugin);

  // Routes
  if (options.registerRoutes) {
    await options.registerRoutes(app);
  } else {
    await app.register(authRoutes, { prefix: '/api/v1/auth' });
    await app.register(orgUnitsRoutes, { prefix: '/api/v1/org-units' });
  }

  // Error handler
  const { foundationErrorHandler } = await import('../../src/modules/foundation/index.js');
  app.setErrorHandler(foundationErrorHandler);

  await app.ready();
  return app;
}
