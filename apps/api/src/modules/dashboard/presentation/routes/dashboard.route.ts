/**
 * @contract UX-DASH-001
 * Dashboard API routes — read-only aggregations.
 * All endpoints require auth but no specific scope.
 */

import type { FastifyInstance } from 'fastify';
import {
  metricsResponseSchema,
  statusDistributionResponseSchema,
  activitiesResponseSchema,
} from '../dtos/dashboard.dto.js';

export async function dashboardRoutes(app: FastifyInstance): Promise<void> {
  // ── GET /metrics ──
  app.get(
    '/metrics',
    {
      operationId: 'dashboard_metrics',
      schema: {
        tags: ['dashboard'],
        response: { 200: metricsResponseSchema },
      },
      onRequest: [app.verifySession],
    },
    async (request, reply) => {
      const { dashboardQueryRepo } = request.dipiContainer;
      const result = await dashboardQueryRepo.countMetrics(request.user.tenantId);
      return reply.send(result);
    },
  );

  // ── GET /status-distribution ──
  app.get(
    '/status-distribution',
    {
      operationId: 'dashboard_status_distribution',
      schema: {
        tags: ['dashboard'],
        response: { 200: statusDistributionResponseSchema },
      },
      onRequest: [app.verifySession],
    },
    async (request, reply) => {
      const { dashboardQueryRepo } = request.dipiContainer;
      const result = await dashboardQueryRepo.getStatusDistribution(request.user.tenantId);
      return reply.send(result);
    },
  );

  // ── GET /activities ──
  app.get(
    '/activities',
    {
      operationId: 'dashboard_activities',
      schema: {
        tags: ['dashboard'],
        response: { 200: activitiesResponseSchema },
      },
      onRequest: [app.verifySession],
    },
    async (request, reply) => {
      const { dashboardQueryRepo } = request.dipiContainer;
      const result = await dashboardQueryRepo.listRecentActivities(request.user.tenantId);
      return reply.send({ data: result });
    },
  );
}
