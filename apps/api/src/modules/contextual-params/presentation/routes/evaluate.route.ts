/**
 * @contract FR-009, INT-001, SEC-007 §2.3 endpoint 25, ADR-006
 *
 * Fastify route for the evaluation engine.
 * Prefix: /api/v1/routine-engine
 *
 * This endpoint is NOT under /admin/ — consumed by both service accounts
 * (MOD-006) and UI (dry-run preview).
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import { evaluateRequestBody, evaluateResponse } from '../dtos/contextual-params.dto.js';

export async function evaluateRoutes(app: FastifyInstance): Promise<void> {
  // POST /routine-engine/evaluate — evaluation engine (6 steps)
  app.post<{ Body: z.infer<typeof evaluateRequestBody> }>('/evaluate', {
    onRequest: [app.verifySession, app.requireScope('param:engine:evaluate')],
    schema: {
      body: evaluateRequestBody,
      tags: ['contextual-params'],
      operationId: 'routine_engine_evaluate',
      response: { 200: evaluateResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      const result = await request.dipiContainer.evaluateRulesUseCase.execute({
        objectType: request.body.object_type,
        objectId: request.body.object_id,
        context: request.body.context.map((c) => ({
          framerId: c.framer_id,
        })),
        stageId: request.body.stage_id,
        dryRun: request.body.dry_run,
        tenantId: request.session.tenantId,
        createdBy: request.session.userId,
        correlationId,
      });

      return reply.status(200).send({
        visible_fields: result.visibleFields,
        hidden_fields: result.hiddenFields,
        required_fields: result.requiredFields,
        optional_fields: result.optionalFields,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        defaults: result.defaults.map((d: Record<string, any>) => ({
          field_id: d.fieldId,
          value: d.value,
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        domain_restrictions: result.domainRestrictions.map((d: Record<string, any>) => ({
          field_id: d.fieldId,
          allowed_values: d.allowedValues,
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        validations: result.validations.map((v: Record<string, any>) => ({
          field_id: v.fieldId,
          message: v.message,
        })),
        blocking_validations: result.blockingValidations,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        applied_routines: result.appliedRoutines.map((r: Record<string, any>) => ({
          routine_id: r.routineId,
          codigo: r.codigo,
          version: r.version,
          incidence_type: r.incidenceType,
        })),
        dry_run: result.dryRun,
      });
    },
  });
}
