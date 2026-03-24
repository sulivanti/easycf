/**
 * @contract FR-001, BR-002, SEC-008
 *
 * Fastify routes for Integration Services (MOD-008).
 * Prefix: /api/v1/admin
 *
 * 3 endpoints:
 *  - GET    /integration-services       → List services
 *  - POST   /integration-services       → Create service
 *  - PATCH  /integration-services/:id   → Update service
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import {
  servicesListQuery,
  serviceListItem,
  createServiceBody,
  serviceResponse,
  updateServiceBody,
  idParam,
} from '../dtos/integration-protheus.dto.js';
import { paginatedResponse } from '../../../foundation/presentation/dtos/common.dto.js';

export async function servicesRoutes(app: FastifyInstance): Promise<void> {
  // GET /admin/integration-services — List (FR-001)
  app.get<{ Querystring: z.infer<typeof servicesListQuery> }>('/integration-services', {
    onRequest: [app.verifySession, app.requireScope('integration:service:read')],
    schema: {
      querystring: servicesListQuery,
      tags: ['integration-protheus'],
      operationId: 'admin_integration_services_list',
      response: { 200: paginatedResponse(serviceListItem) },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.listServicesUseCase.execute({
        tenantId: request.session.tenantId,
        status: request.query.status,
        environment: request.query.environment,
        cursor: request.query.cursor,
        limit: request.query.limit,
      });

      return reply.send({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: result.data.map((s: Record<string, any>) => ({
          id: s.id,
          codigo: s.codigo,
          nome: s.nome,
          base_url: s.baseUrl,
          auth_type: s.authType,
          timeout_ms: s.timeoutMs,
          status: s.status,
          environment: s.environment,
          created_at: s.createdAt.toISOString(),
        })),
        next_cursor: result.nextCursor,
        has_more: result.hasMore,
      });
    },
  });

  // POST /admin/integration-services — Create (FR-001)
  app.post<{ Body: z.infer<typeof createServiceBody> }>('/integration-services', {
    onRequest: [app.verifySession, app.requireScope('integration:service:write')],
    schema: {
      body: createServiceBody,
      tags: ['integration-protheus'],
      operationId: 'admin_integration_services_create',
      response: { 201: serviceResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      const result = await request.dipiContainer.createServiceUseCase.execute({
        tenantId: request.session.tenantId,
        codigo: request.body.codigo,
        nome: request.body.nome,
        baseUrl: request.body.base_url,
        authType: request.body.auth_type,
        authConfig: request.body.auth_config ?? null,
        timeoutMs: request.body.timeout_ms,
        environment: request.body.environment,
        createdBy: request.session.userId,
        correlationId,
      });

      return reply.status(201).send({
        id: result.id,
        tenant_id: request.session.tenantId,
        codigo: result.codigo,
        nome: result.nome,
        base_url: result.baseUrl,
        auth_type: result.authType,
        auth_config: '***', // BR-002
        timeout_ms: result.timeoutMs,
        status: result.status,
        environment: result.environment,
        created_by: request.session.userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    },
  });

  // PATCH /admin/integration-services/:id — Update (FR-001)
  app.patch<{ Params: z.infer<typeof idParam>; Body: z.infer<typeof updateServiceBody> }>(
    '/integration-services/:id',
    {
      onRequest: [app.verifySession, app.requireScope('integration:service:write')],
      schema: {
        params: idParam,
        body: updateServiceBody,
        tags: ['integration-protheus'],
        operationId: 'admin_integration_services_update',
        response: { 200: serviceResponse },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

        const result = await request.dipiContainer.updateServiceUseCase.execute({
          id: request.params.id,
          tenantId: request.session.tenantId,
          nome: request.body.nome,
          baseUrl: request.body.base_url,
          authType: request.body.auth_type,
          authConfig: request.body.auth_config,
          timeoutMs: request.body.timeout_ms,
          status: request.body.status,
          environment: request.body.environment,
          updatedBy: request.session.userId,
          correlationId,
        });

        return reply.send({
          id: result.id,
          tenant_id: request.session.tenantId,
          codigo: result.codigo,
          nome: result.nome,
          base_url: result.baseUrl,
          auth_type: result.authType,
          auth_config: '***', // BR-002
          timeout_ms: result.timeoutMs,
          status: result.status,
          environment: result.environment,
          created_by: request.session.userId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      },
    },
  );
}
