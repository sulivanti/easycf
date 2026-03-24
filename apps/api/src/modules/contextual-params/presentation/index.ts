/**
 * @contract DOC-GNP-00, SEC-007
 *
 * Registers all MOD-007 route plugins on Fastify.
 * Routes are grouped by resource with appropriate prefixes.
 */

import type { FastifyInstance } from 'fastify';
import { adminFramerTypesRoutes } from './routes/admin-framer-types.route.js';
import { adminFramersRoutes } from './routes/admin-framers.route.js';
import { adminTargetObjectsRoutes } from './routes/admin-target-objects.route.js';
import { adminIncidenceRulesRoutes } from './routes/admin-incidence-rules.route.js';
import { adminRoutinesRoutes } from './routes/admin-routines.route.js';
import { adminRoutineItemsRoutes } from './routes/admin-routine-items.route.js';
import { evaluateRoutes } from './routes/evaluate.route.js';

export async function contextualParamsPlugin(app: FastifyInstance): Promise<void> {
  // Admin endpoints under /api/v1/admin/
  await app.register(adminFramerTypesRoutes, { prefix: '/admin/framer-types' });
  await app.register(adminFramersRoutes, { prefix: '/admin/framers' });
  await app.register(adminTargetObjectsRoutes, { prefix: '/admin/target-objects' });
  await app.register(adminIncidenceRulesRoutes, { prefix: '/admin/incidence-rules' });
  await app.register(adminRoutinesRoutes, { prefix: '/admin/routines' });
  // routine-items routes use /admin/ prefix directly (mixed sub-paths)
  await app.register(adminRoutineItemsRoutes, { prefix: '/admin' });
  // Engine endpoint under /api/v1/routine-engine/
  await app.register(evaluateRoutes, { prefix: '/routine-engine' });
}
