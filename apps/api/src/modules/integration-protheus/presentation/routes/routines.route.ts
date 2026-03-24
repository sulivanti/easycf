/**
 * @contract FR-002, FR-003, FR-004, BR-001, SEC-008
 *
 * Fastify routes for Integration Routine configuration, field mappings, and params (MOD-008).
 * Prefix: /api/v1/admin
 *
 * 7 endpoints:
 *  - POST   /routines/:id/integration-config  → Configure HTTP extension
 *  - POST   /routines/:id/field-mappings       → Create field mapping
 *  - PATCH  /field-mappings/:id                → Update field mapping
 *  - DELETE /field-mappings/:id                → Delete field mapping
 *  - POST   /routines/:id/params               → Create param
 *  - PATCH  /integration-params/:id            → Update param
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import {
  configureRoutineBody,
  integrationRoutineResponse,
  createFieldMappingBody,
  updateFieldMappingBody,
  fieldMappingResponse,
  createParamBody,
  updateParamBody,
  paramResponse,
  idParam,
  routineIdParam,
} from '../dtos/integration-protheus.dto.js';

export async function routinesRoutes(app: FastifyInstance): Promise<void> {
  // POST /admin/routines/:id/integration-config — Configure (FR-002)
  app.post<{ Params: z.infer<typeof routineIdParam>; Body: z.infer<typeof configureRoutineBody> }>(
    '/routines/:id/integration-config',
    {
      onRequest: [app.verifySession, app.requireScope('integration:routine:write')],
      schema: {
        params: routineIdParam,
        body: configureRoutineBody,
        tags: ['integration-protheus'],
        operationId: 'admin_integration_routines_configure',
        response: { 201: integrationRoutineResponse },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

        // NOTE: routineStatus must be resolved from the behavior_routines table
        // by the DI container or middleware. For now we accept it from context.
        const routineStatus =
          (request as unknown as { routineStatus?: string }).routineStatus ?? 'DRAFT';

        const result = await request.dipiContainer.configureRoutineUseCase.execute({
          tenantId: request.session.tenantId,
          routineId: request.params.id,
          routineStatus,
          serviceId: request.body.service_id,
          httpMethod: request.body.http_method,
          endpointTpl: request.body.endpoint_tpl,
          contentType: request.body.content_type,
          timeoutMs: request.body.timeout_ms,
          retryMax: request.body.retry_max,
          retryBackoffMs: request.body.retry_backoff_ms,
          triggerEvents: request.body.trigger_events,
          createdBy: request.session.userId,
          correlationId,
        });

        return reply.status(201).send({
          id: result.id,
          routine_id: result.routineId,
          service_id: result.serviceId,
          http_method: result.httpMethod,
          endpoint_tpl: result.endpointTpl,
          retry_max: result.retryMax,
          retry_backoff_ms: result.retryBackoffMs,
        });
      },
    },
  );

  // POST /admin/routines/:id/field-mappings — Create mapping (FR-003)
  app.post<{
    Params: z.infer<typeof routineIdParam>;
    Body: z.infer<typeof createFieldMappingBody>;
  }>('/routines/:id/field-mappings', {
    onRequest: [app.verifySession, app.requireScope('integration:routine:write')],
    schema: {
      params: routineIdParam,
      body: createFieldMappingBody,
      tags: ['integration-protheus'],
      operationId: 'admin_field_mappings_create',
      response: { 201: fieldMappingResponse },
    },
    handler: async (request, reply) => {
      const routineStatus =
        (request as unknown as { routineStatus?: string }).routineStatus ?? 'DRAFT';

      const result = await request.dipiContainer.createFieldMappingUseCase.execute({
        tenantId: request.session.tenantId,
        routineId: request.params.id,
        routineStatus,
        sourceField: request.body.source_field,
        targetField: request.body.target_field,
        mappingType: request.body.mapping_type,
        required: request.body.required,
        transformExpr: request.body.transform_expr,
        conditionExpr: request.body.condition_expr,
        defaultValue: request.body.default_value,
        ordem: request.body.ordem,
      });

      return reply.status(201).send({
        id: result.id,
        routine_id: result.routineId,
        source_field: result.sourceField,
        target_field: result.targetField,
        mapping_type: result.mappingType,
        required: result.required,
        transform_expr: result.transformExpr,
        condition_expr: result.conditionExpr,
        default_value: result.defaultValue,
        ordem: result.ordem,
      });
    },
  });

  // PATCH /admin/field-mappings/:id — Update mapping (FR-003)
  app.patch<{ Params: z.infer<typeof idParam>; Body: z.infer<typeof updateFieldMappingBody> }>(
    '/field-mappings/:id',
    {
      onRequest: [app.verifySession, app.requireScope('integration:routine:write')],
      schema: {
        params: idParam,
        body: updateFieldMappingBody,
        tags: ['integration-protheus'],
        operationId: 'admin_field_mappings_update',
        response: { 200: fieldMappingResponse },
      },
      handler: async (request, reply) => {
        const routineStatus =
          (request as unknown as { routineStatus?: string }).routineStatus ?? 'DRAFT';

        const result = await request.dipiContainer.updateFieldMappingUseCase.execute({
          id: request.params.id,
          tenantId: request.session.tenantId,
          routineStatus,
          sourceField: request.body.source_field,
          targetField: request.body.target_field,
          mappingType: request.body.mapping_type,
          required: request.body.required,
          transformExpr: request.body.transform_expr,
          conditionExpr: request.body.condition_expr,
          defaultValue: request.body.default_value,
          ordem: request.body.ordem,
        });

        return reply.send({
          id: result.id,
          routine_id: result.routineId,
          source_field: result.sourceField,
          target_field: result.targetField,
          mapping_type: result.mappingType,
          required: result.required,
          transform_expr: result.transformExpr,
          condition_expr: result.conditionExpr,
          default_value: result.defaultValue,
          ordem: result.ordem,
        });
      },
    },
  );

  // DELETE /admin/field-mappings/:id — Delete mapping (FR-003)
  app.delete<{ Params: z.infer<typeof idParam> }>('/field-mappings/:id', {
    onRequest: [app.verifySession, app.requireScope('integration:routine:write')],
    schema: {
      params: idParam,
      tags: ['integration-protheus'],
      operationId: 'admin_field_mappings_delete',
      response: { 204: { type: 'null' as const } },
    },
    handler: async (request, reply) => {
      const routineStatus =
        (request as unknown as { routineStatus?: string }).routineStatus ?? 'DRAFT';

      await request.dipiContainer.deleteFieldMappingUseCase.execute({
        id: request.params.id,
        tenantId: request.session.tenantId,
        routineStatus,
      });

      return reply.status(204).send();
    },
  });

  // POST /admin/routines/:id/params — Create param (FR-004)
  app.post<{ Params: z.infer<typeof routineIdParam>; Body: z.infer<typeof createParamBody> }>(
    '/routines/:id/params',
    {
      onRequest: [app.verifySession, app.requireScope('integration:routine:write')],
      schema: {
        params: routineIdParam,
        body: createParamBody,
        tags: ['integration-protheus'],
        operationId: 'admin_integration_params_create',
        response: { 201: paramResponse },
      },
      handler: async (request, reply) => {
        const routineStatus =
          (request as unknown as { routineStatus?: string }).routineStatus ?? 'DRAFT';

        const result = await request.dipiContainer.createParamUseCase.execute({
          tenantId: request.session.tenantId,
          routineId: request.params.id,
          routineStatus,
          paramKey: request.body.param_key,
          paramType: request.body.param_type,
          value: request.body.value,
          derivationExpr: request.body.derivation_expr,
          isSensitive: request.body.is_sensitive,
        });

        return reply.status(201).send({
          id: result.id,
          routine_id: result.routineId,
          param_key: result.paramKey,
          param_type: result.paramType,
          value: result.value,
          derivation_expr: result.derivationExpr,
          is_sensitive: result.isSensitive,
        });
      },
    },
  );

  // PATCH /admin/integration-params/:id — Update param (FR-004)
  app.patch<{ Params: z.infer<typeof idParam>; Body: z.infer<typeof updateParamBody> }>(
    '/integration-params/:id',
    {
      onRequest: [app.verifySession, app.requireScope('integration:routine:write')],
      schema: {
        params: idParam,
        body: updateParamBody,
        tags: ['integration-protheus'],
        operationId: 'admin_integration_params_update',
        response: { 200: paramResponse },
      },
      handler: async (request, reply) => {
        const routineStatus =
          (request as unknown as { routineStatus?: string }).routineStatus ?? 'DRAFT';

        const result = await request.dipiContainer.updateParamUseCase.execute({
          id: request.params.id,
          tenantId: request.session.tenantId,
          routineStatus,
          paramKey: request.body.param_key,
          paramType: request.body.param_type,
          value: request.body.value,
          derivationExpr: request.body.derivation_expr,
          isSensitive: request.body.is_sensitive,
        });

        return reply.send({
          id: result.id,
          routine_id: result.routineId,
          param_key: result.paramKey,
          param_type: result.paramType,
          value: result.value,
          derivation_expr: result.derivationExpr,
          is_sensitive: result.isSensitive,
        });
      },
    },
  );
}
