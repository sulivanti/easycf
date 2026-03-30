/**
 * @contract DATA-009, EX-OAS-001, SEC-006
 *
 * Fastify routes for movement-approval control rules and approval rules.
 * 5 endpoints: list, create, update control rules; create, update approval rules.
 *
 * Scopes: approval:rule:read, approval:rule:write
 */

import type { FastifyInstance } from 'fastify';
import {
  listControlRulesQuery,
  listControlRulesResponse,
  createControlRuleBody,
  createControlRuleResponse,
  controlRuleIdParam,
  updateControlRuleBody,
  updateControlRuleResponse,
  controlRuleApprovalRuleParams,
  createApprovalRuleBody,
  createApprovalRuleResponse,
  approvalRuleIdParam,
  updateApprovalRuleBody,
  updateApprovalRuleResponse,
} from '../dtos/rules.dto.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapControlRule(r: Record<string, any>): Record<string, any> {
  return {
    id: r.id,
    tenant_id: r.tenantId,
    codigo: r.codigo,
    nome: r.nome,
    descricao: r.descricao ?? null,
    object_type: r.objectType,
    operation_type: r.operationType,
    origin_types: r.originTypes,
    criteria_type: r.criteriaType,
    value_threshold: r.valueThreshold != null ? String(r.valueThreshold) : null,
    priority: r.priority,
    status: r.status,
    valid_from: r.validFrom instanceof Date ? r.validFrom.toISOString() : (r.validFrom ?? null),
    valid_until: r.validUntil instanceof Date ? r.validUntil.toISOString() : (r.validUntil ?? null),
    created_at: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    updated_at: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapApprovalRule(r: Record<string, any>): Record<string, any> {
  return {
    id: r.id,
    tenant_id: r.tenantId,
    control_rule_id: r.controlRuleId,
    level: r.level,
    approver_type: r.approverType,
    approver_value: r.approverValue,
    required_scope: r.requiredScope ?? null,
    allow_self_approve: r.allowSelfApprove,
    timeout_minutes: r.timeoutMinutes,
    escalation_rule_id: r.escalationRuleId ?? null,
    created_at: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
    updated_at: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
  };
}

export async function rulesRoutes(app: FastifyInstance): Promise<void> {
  const prefix = '/api/v1/control-rules';

  // ── GET /control-rules — List Control Rules ────────────────────────────────
  app.get(
    prefix,
    {
      operationId: 'approval_control_rules_list',
      schema: {
        tags: ['approval'],
        querystring: listControlRulesQuery,
        response: { 200: listControlRulesResponse },
      },
      onRequest: [app.verifySession, app.requireScope('approval:rule:read')],
    },
    async (request, reply) => {
      const query = request.query as typeof listControlRulesQuery._type;
      const user = request.user;

      const { listControlRulesUseCase } = app.movementApproval;
      const result = await listControlRulesUseCase.execute({
        tenantId: user.tenantId,
        page: query.page,
        pageSize: query.page_size,
        status: query.status,
        objectType: query.object_type,
      });

      const r = result.result;
      return reply.send({
        data: r.data.map(mapControlRule),
        page: r.page,
        page_size: r.pageSize,
        total: r.total,
        total_pages: Math.ceil(r.total / r.pageSize),
      });
    },
  );

  // ── POST /control-rules — Create Control Rule ─────────────────────────────
  app.post(
    prefix,
    {
      operationId: 'approval_control_rules_create',
      schema: {
        tags: ['approval'],
        body: createControlRuleBody,
        response: { 201: createControlRuleResponse },
        headers: {
          type: 'object',
          properties: {
            'x-correlation-id': { type: 'string' },
            'idempotency-key': { type: 'string' },
          },
        },
      },
      onRequest: [app.verifySession, app.requireScope('approval:rule:write')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const body = request.body as typeof createControlRuleBody._type;
      const user = request.user;

      const { createControlRuleUseCase } = app.movementApproval;
      const result = await createControlRuleUseCase.execute({
        ...body,
        tenantId: user.tenantId,
        userId: user.id,
        correlationId,
      });

      reply.header('x-correlation-id', correlationId);
      return reply.status(201).send(mapControlRule(result.controlRule));
    },
  );

  // ── PATCH /control-rules/:id — Update Control Rule ────────────────────────
  app.patch(
    `${prefix}/:id`,
    {
      operationId: 'approval_control_rules_update',
      schema: {
        tags: ['approval'],
        params: controlRuleIdParam,
        body: updateControlRuleBody,
        response: { 200: updateControlRuleResponse },
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('approval:rule:write')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const { id } = request.params as typeof controlRuleIdParam._type;
      const body = request.body as typeof updateControlRuleBody._type;
      const user = request.user;

      const { updateControlRuleUseCase } = app.movementApproval;
      const result = await updateControlRuleUseCase.execute({
        id,
        ...body,
        tenantId: user.tenantId,
        userId: user.id,
        correlationId,
      });

      reply.header('x-correlation-id', correlationId);
      return reply.send(mapControlRule(result.controlRule));
    },
  );

  // ── POST /control-rules/:controlRuleId/approval-rules — Create Approval Rule
  app.post(
    `${prefix}/:controlRuleId/approval-rules`,
    {
      operationId: 'approval_approval_rules_create',
      schema: {
        tags: ['approval'],
        params: controlRuleApprovalRuleParams,
        body: createApprovalRuleBody,
        response: { 201: createApprovalRuleResponse },
        headers: {
          type: 'object',
          properties: {
            'x-correlation-id': { type: 'string' },
            'idempotency-key': { type: 'string' },
          },
        },
      },
      onRequest: [app.verifySession, app.requireScope('approval:rule:write')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const { controlRuleId } = request.params as typeof controlRuleApprovalRuleParams._type;
      const body = request.body as typeof createApprovalRuleBody._type;
      const user = request.user;

      const { createApprovalRuleUseCase } = app.movementApproval;
      const result = await createApprovalRuleUseCase.execute({
        controlRuleId,
        ...body,
        tenantId: user.tenantId,
        userId: user.id,
        correlationId,
      });

      reply.header('x-correlation-id', correlationId);
      return reply.status(201).send(mapApprovalRule(result.approvalRule));
    },
  );

  // ── PATCH /approval-rules/:id — Update Approval Rule ──────────────────────
  app.patch(
    '/api/v1/approval-rules/:id',
    {
      operationId: 'approval_approval_rules_update',
      schema: {
        tags: ['approval'],
        params: approvalRuleIdParam,
        body: updateApprovalRuleBody,
        response: { 200: updateApprovalRuleResponse },
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('approval:rule:write')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const { id } = request.params as typeof approvalRuleIdParam._type;
      const body = request.body as typeof updateApprovalRuleBody._type;
      const user = request.user;

      const { updateApprovalRuleUseCase } = app.movementApproval;
      const result = await updateApprovalRuleUseCase.execute({
        id,
        ...body,
        tenantId: user.tenantId,
        userId: user.id,
        correlationId,
      });

      reply.header('x-correlation-id', correlationId);
      return reply.send(mapApprovalRule(result.approvalRule));
    },
  );
}
