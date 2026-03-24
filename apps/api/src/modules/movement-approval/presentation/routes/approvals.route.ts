/**
 * @contract DATA-009, EX-OAS-001, SEC-006
 *
 * Fastify routes for approval decisions.
 * 3 endpoints: list my approvals, approve, reject.
 *
 * Scopes: approval:decide (approve/reject), none for listing own approvals
 */

import type { FastifyInstance } from 'fastify';
import {
  listMyApprovalsQuery,
  listMyApprovalsResponse,
  approveBody,
  approveResponse,
  rejectBody,
  rejectResponse,
} from '../dtos/approvals.dto.js';
import { movementIdParam } from '../dtos/movements.dto.js';

export async function approvalsRoutes(app: FastifyInstance): Promise<void> {
  // ── GET /my/approvals — List My Pending Approvals ──────────────────────────
  app.get(
    '/api/v1/my/approvals',
    {
      operationId: 'approval_my_approvals_list',
      schema: {
        tags: ['approval'],
        querystring: listMyApprovalsQuery,
        response: { 200: listMyApprovalsResponse },
      },
      onRequest: [app.verifySession],
    },
    async (request, reply) => {
      const query = request.query as typeof listMyApprovalsQuery._type;
      const user = request.user;

      const { listMyApprovalsUseCase } = app.movementApproval;
      const result = await listMyApprovalsUseCase.execute({
        tenantId: user.tenantId,
        userId: user.id,
        status: query.status,
      });

      return reply.send(result);
    },
  );

  // ── POST /movements/:id/approve — Approve Movement ─────────────────────────
  app.post(
    '/api/v1/movements/:id/approve',
    {
      operationId: 'approval_movements_approve',
      schema: {
        tags: ['approval'],
        params: movementIdParam,
        body: approveBody,
        response: { 200: approveResponse },
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('approval:decide')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const { id } = request.params as typeof movementIdParam._type;
      const body = request.body as typeof approveBody._type;
      const user = request.user;

      const { approveMovementUseCase } = app.movementApproval;
      const result = await approveMovementUseCase.execute({
        movementId: id,
        opinion: body.opinion,
        tenantId: user.tenantId,
        userId: user.id,
        correlationId,
      });

      reply.header('x-correlation-id', correlationId);
      return reply.send(result);
    },
  );

  // ── POST /movements/:id/reject — Reject Movement ──────────────────────────
  app.post(
    '/api/v1/movements/:id/reject',
    {
      operationId: 'approval_movements_reject',
      schema: {
        tags: ['approval'],
        params: movementIdParam,
        body: rejectBody,
        response: { 200: rejectResponse },
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('approval:decide')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const { id } = request.params as typeof movementIdParam._type;
      const body = request.body as typeof rejectBody._type;
      const user = request.user;

      const { rejectMovementUseCase } = app.movementApproval;
      const result = await rejectMovementUseCase.execute({
        movementId: id,
        opinion: body.opinion,
        tenantId: user.tenantId,
        userId: user.id,
        correlationId,
      });

      reply.header('x-correlation-id', correlationId);
      return reply.send(result);
    },
  );
}
