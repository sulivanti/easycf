/**
 * @contract DATA-009, EX-OAS-001, SEC-006
 *
 * Fastify route for the movement engine evaluate endpoint.
 * Evaluates whether an operation is controlled and, if so, creates a
 * controlled movement with the approval chain.
 *
 * Scope: approval:engine:evaluate
 */

import type { FastifyInstance } from 'fastify';
import {
  evaluateBody,
  evaluateNotControlledResponse,
  evaluateControlledResponse,
} from '../dtos/engine.dto.js';

export async function engineRoutes(app: FastifyInstance): Promise<void> {
  // ── POST /movement-engine/evaluate — Evaluate Movement ─────────────────────
  app.post(
    '/api/v1/movement-engine/evaluate',
    {
      operationId: 'approval_engine_evaluate',
      schema: {
        tags: ['approval'],
        body: evaluateBody,
        response: {
          200: evaluateNotControlledResponse,
          202: evaluateControlledResponse,
        },
        headers: {
          type: 'object',
          properties: {
            'x-correlation-id': { type: 'string' },
            'idempotency-key': { type: 'string' },
          },
        },
      },
      onRequest: [app.verifySession, app.requireScope('approval:engine:evaluate')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const idempotencyKey = request.headers['idempotency-key'] as string | undefined;
      const body = request.body as typeof evaluateBody._type;
      const user = request.user;

      const { evaluateMovementUseCase } = app.movementApproval;
      const result = await evaluateMovementUseCase.execute({
        objectType: body.object_type,
        operationType: body.operation_type,
        origin: body.origin,
        value: body.value,
        operationPayload: body.operation_payload,
        caseId: body.case_id,
        dryRun: body.dry_run,
        tenantId: user.tenantId,
        requesterId: user.id,
        idempotencyKey,
        correlationId,
      });

      reply.header('x-correlation-id', correlationId);

      if (!result.controlled) {
        return reply.status(200).send({ controlled: false as const });
      }

      return reply.status(202).send({
        controlled: true as const,
        movement_id: result.movementId,
        status: result.status,
        levels: result.levels,
      });
    },
  );
}
