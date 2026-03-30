/**
 * @contract DOC-ARC-004, FR-000-C03
 *
 * API Entry Point — Fastify server with all module route plugins registered.
 *
 * Registration order (DOC-ARC-004 §3):
 *  1. Core plugins (helmet, cors, cookie, jwt)
 *  2. Auth/DI plugins (verifySession, requireScope, dipiContainer)
 *  3. Route plugins (all modules)
 *  4. Global error handler (foundationErrorHandler)
 *  5. app.listen()
 */

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import jwt from '@fastify/jwt';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';

// — Auth & DI plugins (DOC-ARC-004 §5) —
import { authPlugin } from './plugins/auth.js';
import { diPlugin } from './plugins/di.js';

// — Route plugins: MOD-000 Foundation —
import {
  authRoutes,
  usersRoutes,
  rolesRoutes,
  tenantsRoutes,
  infoRoute,
  foundationErrorHandler,
} from './modules/foundation/index.js';

// — Route plugins: MOD-003 Org Units —
import { orgUnitsRoutes } from './modules/org-units/index.js';

// — Route plugins: MOD-004 Identity Advanced —
import {
  adminOrgScopesRoutes,
  myOrgScopesRoutes,
  adminAccessSharesRoutes,
  mySharedAccessesRoutes,
  accessDelegationsRoutes,
} from './modules/identity-advanced/index.js';

// — Route plugins: MOD-005 Process Modeling —
import {
  cyclesRoutes,
  stagesRoutes,
  processRolesRoutes,
} from './modules/process-modeling/index.js';

// — Route plugins: MOD-006 Case Execution (absolute paths) —
import { caseExecutionRoutes } from './modules/case-execution/index.js';

// — Route plugins: MOD-007 Contextual Params —
import { contextualParamsPlugin } from './modules/contextual-params/index.js';

// — Route plugins: MOD-008 Integration Protheus (alias engineRoutes → integrationEngineRoutes) —
import {
  servicesRoutes,
  routinesRoutes,
  engineRoutes as integrationEngineRoutes,
} from './modules/integration-protheus/index.js';

// — Route plugins: MOD-009 Movement Approval (alias engineRoutes → movementEngineRoutes) —
import {
  rulesRoutes,
  engineRoutes as movementEngineRoutes,
  movementsRoutes,
  approvalsRoutes,
} from './modules/movement-approval/index.js';

// — Route plugins: Dashboard (read-only aggregations) —
import { dashboardRoutes } from './modules/dashboard/index.js';

// — Route plugins: MOD-010 MCP —
import {
  agentsRoutes,
  actionsRoutes,
  executionsRoutes,
  gatewayRoutes,
} from './modules/mcp/index.js';

// ─────────────────────────────────────────────────────────────────────────────
// Configuration
// ─────────────────────────────────────────────────────────────────────────────

const PORT = Number(process.env.API_PORT) || 3000;
const HOST = '0.0.0.0';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-min-32-chars-long-replace-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';

// ─────────────────────────────────────────────────────────────────────────────
// Fastify instance + core plugins
// ─────────────────────────────────────────────────────────────────────────────

const app = Fastify({ logger: { level: process.env.LOG_LEVEL || 'info' } });

// Zod type provider — converts Zod schemas to JSON Schema for Fastify validation
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

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

// ─────────────────────────────────────────────────────────────────────────────
// Auth & DI plugins (BEFORE routes — DOC-ARC-004 §3)
// ─────────────────────────────────────────────────────────────────────────────

await app.register(authPlugin);
await app.register(diPlugin);

// ─────────────────────────────────────────────────────────────────────────────
// Route plugins — all modules (DOC-ARC-004 §7)
// ─────────────────────────────────────────────────────────────────────────────

// MOD-000 Foundation — relative paths
await app.register(authRoutes, { prefix: '/api/v1/auth' });
await app.register(usersRoutes, { prefix: '/api/v1/users' });
await app.register(rolesRoutes, { prefix: '/api/v1/roles' });
await app.register(tenantsRoutes, { prefix: '/api/v1/tenants' });
await app.register(infoRoute, { prefix: '/api/v1' });

// MOD-003 Org Units — relative paths
await app.register(orgUnitsRoutes, { prefix: '/api/v1/org-units' });

// MOD-004 Identity Advanced — relative paths
await app.register(adminOrgScopesRoutes, { prefix: '/api/v1/admin/users' });
await app.register(myOrgScopesRoutes, { prefix: '/api/v1/my' });
await app.register(adminAccessSharesRoutes, { prefix: '/api/v1/admin/access-shares' });
await app.register(mySharedAccessesRoutes, { prefix: '/api/v1/my' });
await app.register(accessDelegationsRoutes, { prefix: '/api/v1/access-delegations' });

// MOD-005 Process Modeling — relative paths
await app.register(cyclesRoutes, { prefix: '/api/v1/admin' });
await app.register(stagesRoutes, { prefix: '/api/v1/admin' });
await app.register(processRolesRoutes, { prefix: '/api/v1/admin' });

// MOD-006 Case Execution — absolute paths (no prefix, debt técnico)
await app.register(caseExecutionRoutes);

// MOD-007 Contextual Params — composite plugin, relative paths
await app.register(contextualParamsPlugin, { prefix: '/api/v1' });

// MOD-008 Integration Protheus — relative paths
await app.register(servicesRoutes, { prefix: '/api/v1' });
await app.register(routinesRoutes, { prefix: '/api/v1' });
await app.register(integrationEngineRoutes, { prefix: '/api/v1' });

// MOD-009 Movement Approval — absolute paths (no prefix, debt técnico)
await app.register(rulesRoutes);
await app.register(movementEngineRoutes);
await app.register(movementsRoutes);
await app.register(approvalsRoutes);

// Dashboard — relative paths
await app.register(dashboardRoutes, { prefix: '/api/v1/dashboard' });

// MOD-010 MCP — absolute paths (no prefix, debt técnico)
await app.register(agentsRoutes);
await app.register(actionsRoutes);
await app.register(executionsRoutes);
await app.register(gatewayRoutes);

// ─────────────────────────────────────────────────────────────────────────────
// Global error handler (DOC-ARC-004 §4)
// ─────────────────────────────────────────────────────────────────────────────

app.setErrorHandler(foundationErrorHandler);

// ─────────────────────────────────────────────────────────────────────────────
// Start
// ─────────────────────────────────────────────────────────────────────────────

try {
  await app.listen({ port: PORT, host: HOST });
  app.log.info(`API running on ${HOST}:${PORT}`);
  app.log.info('Registered routes:');
  app.log.info(app.printRoutes());
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
