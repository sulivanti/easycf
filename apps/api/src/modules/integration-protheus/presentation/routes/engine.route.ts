/**
 * @contract FR-005, FR-006, FR-007, FR-009, FR-011, FR-008-M01, SEC-008
 *
 * Fastify routes for Integration Engine (execute, logs, reprocess, metrics).
 * Prefix: /api/v1
 *
 * 6 endpoints:
 *  - POST /integration-engine/execute          → Execute integration (FR-006)
 *  - GET  /admin/integration-logs              → List logs (FR-009)
 *  - GET  /admin/integration-logs/:id          → Log detail (FR-009)
 *  - POST /admin/integration-logs/:id/reprocess → Reprocess DLQ (FR-007)
 *  - GET  /admin/integration-logs/metrics      → Call log metrics (FR-011, FR-008-M01)
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import {
  executeIntegrationBody,
  executeIntegrationResponse,
  logsListQuery,
  callLogListItem,
  callLogDetailResponse,
  reprocessBody,
  reprocessResponse,
  metricsQuery,
  metricsResponse,
  idParam,
} from '../dtos/integration-protheus.dto.js';
import { paginatedResponse } from '../../../foundation/presentation/dtos/common.dto.js';

export async function engineRoutes(app: FastifyInstance): Promise<void> {
  // POST /integration-engine/execute — Execute (FR-006)
  app.post<{ Body: z.infer<typeof executeIntegrationBody> }>('/integration-engine/execute', {
    onRequest: [app.verifySession, app.requireScope('integration:execute')],
    schema: {
      body: executeIntegrationBody,
      tags: ['integration-protheus'],
      operationId: 'integration_engine_execute',
      response: { 202: executeIntegrationResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      const result = await request.dipiContainer.executeIntegrationUseCase.execute({
        tenantId: request.session.tenantId,
        routineId: request.body.routine_id,
        caseId: request.body.case_id ?? null,
        context: request.body.context ?? {},
        createdBy: request.session.userId,
        correlationId,
      });

      return reply.status(202).send({
        call_log_id: result.callLogId,
        status: result.status,
        correlation_id: result.correlationId,
      });
    },
  });

  // GET /admin/integration-logs — List (FR-009)
  app.get<{ Querystring: z.infer<typeof logsListQuery> }>('/admin/integration-logs', {
    onRequest: [app.verifySession, app.requireScope('integration:log:read')],
    schema: {
      querystring: logsListQuery,
      tags: ['integration-protheus'],
      operationId: 'admin_integration_logs_list',
      response: { 200: paginatedResponse(callLogListItem) },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.listCallLogsUseCase.execute({
        tenantId: request.session.tenantId,
        routineId: request.query.routine_id,
        status: request.query.status,
        serviceId: request.query.service_id,
        correlationId: request.query.correlation_id,
        periodStart: request.query.period_start ? new Date(request.query.period_start) : undefined,
        periodEnd: request.query.period_end ? new Date(request.query.period_end) : undefined,
        cursor: request.query.cursor,
        limit: request.query.limit,
      });

      return reply.send({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: result.data.map((l: Record<string, any>) => ({
          id: l.id,
          routine_id: l.routineId,
          case_id: l.caseId,
          correlation_id: l.correlationId,
          status: l.status,
          attempt_number: l.attemptNumber,
          parent_log_id: l.parentLogId,
          response_status: l.responseStatus,
          error_message: l.errorMessage,
          duration_ms: l.durationMs,
          queued_at: l.queuedAt.toISOString(),
          created_at: l.createdAt.toISOString(),
        })),
        next_cursor: result.nextCursor,
        has_more: result.hasMore,
      });
    },
  });

  // GET /admin/integration-logs/metrics — Metrics (FR-011, FR-008-M01)
  app.get<{ Querystring: z.infer<typeof metricsQuery> }>('/admin/integration-logs/metrics', {
    onRequest: [app.verifySession, app.requireScope('integration:log:read')],
    schema: {
      querystring: metricsQuery,
      tags: ['integration-protheus'],
      operationId: 'admin_integration_logs_metrics',
      response: { 200: metricsResponse },
    },
    handler: async (request, reply) => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const periodStart = request.query.period_start
        ? new Date(request.query.period_start)
        : thirtyDaysAgo;
      const periodEnd = request.query.period_end ? new Date(request.query.period_end) : now;

      const result = await request.dipiContainer.getCallLogMetricsUseCase.execute({
        tenantId: request.session.tenantId,
        periodStart,
        periodEnd,
      });

      return reply.send({
        total: result.total,
        success: result.success,
        failed: result.failed,
        dlq: result.dlq,
        running: result.running,
        queued: result.queued,
        success_rate: result.successRate,
        avg_latency_ms: result.avgLatencyMs,
      });
    },
  });

  // GET /admin/integration-logs/:id — Detail (FR-009)
  app.get<{ Params: z.infer<typeof idParam> }>('/admin/integration-logs/:id', {
    onRequest: [app.verifySession, app.requireScope('integration:log:read')],
    schema: {
      params: idParam,
      tags: ['integration-protheus'],
      operationId: 'admin_integration_logs_get',
      response: { 200: callLogDetailResponse },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.getCallLogUseCase.execute(
        request.params.id,
        request.session.tenantId,
      );

      return reply.send({
        id: result.id,
        routine_id: result.routineId,
        case_id: result.caseId,
        correlation_id: result.correlationId,
        status: result.status,
        attempt_number: result.attemptNumber,
        parent_log_id: result.parentLogId,
        request_payload: result.requestPayload,
        request_headers: result.requestHeaders,
        response_status: result.responseStatus,
        response_body: result.responseBody,
        error_message: result.errorMessage,
        started_at: result.startedAt?.toISOString() ?? null,
        completed_at: result.completedAt?.toISOString() ?? null,
        duration_ms: result.durationMs,
        queued_at: result.queuedAt.toISOString(),
        reprocess_reason: result.reprocessReason,
        reprocessed_by: result.reprocessedBy,
        created_at: result.createdAt.toISOString(),
      });
    },
  });

  // POST /admin/integration-logs/:id/reprocess — Reprocess DLQ (FR-007)
  app.post<{ Params: z.infer<typeof idParam>; Body: z.infer<typeof reprocessBody> }>(
    '/admin/integration-logs/:id/reprocess',
    {
      onRequest: [app.verifySession, app.requireScope('integration:log:reprocess')],
      schema: {
        params: idParam,
        body: reprocessBody,
        tags: ['integration-protheus'],
        operationId: 'admin_integration_logs_reprocess',
        response: { 202: reprocessResponse },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

        const result = await request.dipiContainer.reprocessCallUseCase.execute({
          callLogId: request.params.id,
          tenantId: request.session.tenantId,
          reason: request.body.reason,
          requestedBy: request.session.userId,
          correlationId,
        });

        return reply.status(202).send({
          new_call_log_id: result.newCallLogId,
          reprocess_request_id: result.reprocessRequestId,
          status: result.status,
        });
      },
    },
  );
}
