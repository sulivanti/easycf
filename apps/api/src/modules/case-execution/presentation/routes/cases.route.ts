/**
 * @contract FR-001..FR-014, INT-006, SEC-006, EX-OAS-001, DOC-ARC-001, DOC-ARC-003
 *
 * Fastify route definitions for the Case Execution module (MOD-006).
 * 16 endpoints covering case lifecycle, gates, assignments, events, and timeline.
 *
 * PENDENTE-006 corrections applied:
 * - Path /transitions → /transition (singular, INT-006 §1.1 #4)
 * - /controls split into /cancel, /hold, /resume (INT-006 §1.1 #5-7)
 * - PATCH /assignments/:aid added (INT-006 §1.3 #13)
 * - operationIds aligned with spec (cases_gates_resolve, cases_gates_waive,
 *   cases_assignments_create, cases_events_create)
 * - Param :gateInstanceId → :gateId (INT-006 §1.2 #9-10)
 * - REOPENED handled via POST /events (FR-007) with scope process:case:reopen
 *
 * Scopes: process:case:read, process:case:write, process:case:cancel,
 *         process:case:gate_resolve, process:case:gate_waive,
 *         process:case:assign, process:case:reopen
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import {
  openCaseBody,
  openCaseResponse,
  caseIdParam,
  transitionBody,
  transitionResponse,
  cancelBody,
  cancelResponse,
  holdBody,
  holdResponse,
  resumeResponse,
  gateParam,
  resolveGateBody,
  resolveGateResponse,
  waiveGateBody,
  waiveGateResponse,
  assignBody,
  assignResponse,
  assignmentIdParam,
  updateAssignmentBody,
  updateAssignmentResponse,
  recordEventBody,
  recordEventResponse,
  timelineResponse,
  listCasesQuery,
  listCasesResponse,
  caseDetailResponse,
  listGatesQuery,
  listGatesResponse,
  listAssignmentsResponse,
  listEventsResponse,
} from '../dtos/cases.dto.js';

export async function caseExecutionRoutes(app: FastifyInstance): Promise<void> {
  const prefix = '/api/v1/cases';

  // ── 1. POST /cases — Open Case (FR-001) ────────────────────────────────────
  app.post<{ Body: z.infer<typeof openCaseBody> }>(
    prefix,
    {
      operationId: 'cases_open',
      schema: {
        tags: ['case-execution'],
        body: openCaseBody,
        response: { 201: openCaseResponse },
        headers: {
          type: 'object',
          properties: {
            'x-correlation-id': { type: 'string' },
            'idempotency-key': { type: 'string' },
          },
        },
      },
      onRequest: [app.verifySession, app.requireScope('process:case:write')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const body = request.body as typeof openCaseBody._type;
      const user = request.user;

      const { openCaseUseCase } = app.caseExecution;
      const result = await openCaseUseCase.execute({
        cycleId: body.cycle_id,
        objectType: body.object_type,
        objectId: body.object_id,
        orgUnitId: body.org_unit_id,
        tenantId: user.tenantId,
        userId: user.id,
        correlationId,
      });

      reply.header('x-correlation-id', correlationId);
      return reply.status(201).send({
        id: result.caseInstance.id,
        codigo: result.caseInstance.codigo,
        cycle_id: result.caseInstance.cycleId,
        cycle_version_id: result.caseInstance.cycleVersionId,
        current_stage_id: result.caseInstance.currentStageId,
        status: result.caseInstance.status,
        object_type: result.caseInstance.objectType,
        object_id: result.caseInstance.objectId,
        org_unit_id: result.caseInstance.orgUnitId,
        opened_by: result.caseInstance.openedBy,
        opened_at: result.caseInstance.openedAt.toISOString(),
      });
    },
  );

  // ── 2. GET /cases — List Cases (FR-009) ────────────────────────────────────
  app.get<{ Querystring: z.infer<typeof listCasesQuery> }>(
    prefix,
    {
      operationId: 'cases_list',
      schema: {
        tags: ['case-execution'],
        querystring: listCasesQuery,
        response: { 200: listCasesResponse },
      },
      onRequest: [app.verifySession, app.requireScope('process:case:read')],
    },
    async (request, reply) => {
      const query = request.query as typeof listCasesQuery._type;
      const user = request.user;

      const { listCasesUseCase } = app.caseExecution;
      const result = await listCasesUseCase.execute({
        tenantId: user.tenantId,
        cycleId: query.cycle_id,
        status: query.status,
        stageId: query.stage_id,
        objectId: query.object_id,
        assignedToMe: query.assigned_to_me === 'true' ? user.id : undefined,
        openedAfter: query.opened_after,
        openedBefore: query.opened_before,
        search: query.search,
        cursor: query.cursor,
        limit: query.limit,
      });

      return reply.send({
        items: result.items,
        nextCursor: result.nextCursor,
        totalEstimate: result.totalEstimate,
      });
    },
  );

  // ── 3. GET /cases/:id — Case Details (FR-010) ──────────────────────────────
  app.get<{ Params: z.infer<typeof caseIdParam> }>(
    `${prefix}/:id`,
    {
      operationId: 'cases_get',
      schema: {
        tags: ['case-execution'],
        params: caseIdParam,
        response: { 200: caseDetailResponse },
      },
      onRequest: [app.verifySession, app.requireScope('process:case:read')],
    },
    async (request, reply) => {
      const { id } = request.params as typeof caseIdParam._type;
      const user = request.user;

      const { getCaseDetailsUseCase } = app.caseExecution;
      const result = await getCaseDetailsUseCase.execute({
        caseId: id,
        tenantId: user.tenantId,
      });

      const c = result.caseInstance;
      return reply.send({
        id: c.id,
        codigo: c.codigo,
        cycle_id: c.cycleId,
        cycle_version_id: c.cycleVersionId,
        current_stage_id: c.currentStageId,
        status: c.status,
        object_type: c.objectType,
        object_id: c.objectId,
        org_unit_id: c.orgUnitId,
        opened_by: c.openedBy,
        opened_at: c.openedAt.toISOString(),
        completed_at: c.completedAt?.toISOString() ?? null,
        cancelled_at: c.cancelledAt?.toISOString() ?? null,
        cancellation_reason: c.cancellationReason,
        created_at: c.createdAt.toISOString(),
        updated_at: c.updatedAt.toISOString(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        current_stage_gates: result.currentStageGates.map((g: Record<string, any>) => ({
          gate_instance_id: g.id,
          gate_id: g.gateId,
          stage_id: g.stageId,
          status: g.status,
          decision: g.decision,
          parecer: g.parecer,
        })),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        active_assignments: result.activeAssignments.map((a: Record<string, any>) => ({
          id: a.id,
          case_id: a.caseId,
          stage_id: a.stageId,
          process_role_id: a.processRoleId,
          user_id: a.userId,
          assigned_by: a.assignedBy,
          assigned_at: a.assignedAt.toISOString(),
          valid_until: a.validUntil?.toISOString() ?? null,
          is_active: a.isActive,
        })),
      });
    },
  );

  // ── 4. POST /cases/:id/transition — Transition Stage (FR-002) ──────────────
  app.post<{ Params: z.infer<typeof caseIdParam>; Body: z.infer<typeof transitionBody> }>(
    `${prefix}/:id/transition`,
    {
      operationId: 'cases_transition',
      schema: {
        tags: ['case-execution'],
        params: caseIdParam,
        body: transitionBody,
        response: { 200: transitionResponse },
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('process:case:write')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const { id } = request.params as typeof caseIdParam._type;
      const body = request.body as typeof transitionBody._type;
      const user = request.user;

      const { transitionStageUseCase, caseRepo } = app.caseExecution;
      const result = await transitionStageUseCase.execute({
        caseId: id,
        targetStageId: body.transition_id,
        tenantId: user.tenantId,
        userId: user.id,
        userRoleCodigos: user.roleCodigos ?? [],
        evidence: body.evidence,
        motivo: body.motivo,
        correlationId,
      });

      // Reload case to get updated fields for response
      const updatedCase = await caseRepo.findById(id, user.tenantId);

      reply.header('x-correlation-id', correlationId);
      return reply.send({
        id,
        codigo: updatedCase?.codigo ?? '',
        current_stage_id: result.toStageId,
        status: result.caseCompleted ? 'COMPLETED' : 'OPEN',
        stage_history_entry: {
          id: result.transitionId,
          from_stage_id: result.fromStageId,
          to_stage_id: result.toStageId,
        },
        new_gate_instances: [],
      });
    },
  );

  // ── 5. POST /cases/:id/cancel — Cancel Case (FR-003) ──────────────────────
  app.post<{ Params: z.infer<typeof caseIdParam>; Body: z.infer<typeof cancelBody> }>(
    `${prefix}/:id/cancel`,
    {
      operationId: 'cases_cancel',
      schema: {
        tags: ['case-execution'],
        params: caseIdParam,
        body: cancelBody,
        response: { 200: cancelResponse },
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('process:case:cancel')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const { id } = request.params as typeof caseIdParam._type;
      const body = request.body as typeof cancelBody._type;
      const user = request.user;

      const { controlCaseUseCase } = app.caseExecution;
      const result = await controlCaseUseCase.execute({
        caseId: id,
        action: 'CANCEL',
        tenantId: user.tenantId,
        userId: user.id,
        correlationId,
        reason: body.motivo,
      });

      reply.header('x-correlation-id', correlationId);
      return reply.send({
        previous_status: result.previousStatus,
        new_status: result.newStatus,
      });
    },
  );

  // ── 6. POST /cases/:id/hold — Hold Case (FR-003) ──────────────────────────
  app.post<{ Params: z.infer<typeof caseIdParam>; Body: z.infer<typeof holdBody> }>(
    `${prefix}/:id/hold`,
    {
      operationId: 'cases_hold',
      schema: {
        tags: ['case-execution'],
        params: caseIdParam,
        body: holdBody,
        response: { 200: holdResponse },
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('process:case:write')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const { id } = request.params as typeof caseIdParam._type;
      const body = request.body as typeof holdBody._type;
      const user = request.user;

      const { controlCaseUseCase } = app.caseExecution;
      const result = await controlCaseUseCase.execute({
        caseId: id,
        action: 'ON_HOLD',
        tenantId: user.tenantId,
        userId: user.id,
        correlationId,
        reason: body.motivo,
      });

      reply.header('x-correlation-id', correlationId);
      return reply.send({
        previous_status: result.previousStatus,
        new_status: result.newStatus,
      });
    },
  );

  // ── 7. POST /cases/:id/resume — Resume Case (FR-003) ──────────────────────
  app.post<{ Params: z.infer<typeof caseIdParam> }>(
    `${prefix}/:id/resume`,
    {
      operationId: 'cases_resume',
      schema: {
        tags: ['case-execution'],
        params: caseIdParam,
        response: { 200: resumeResponse },
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('process:case:write')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const { id } = request.params as typeof caseIdParam._type;
      const user = request.user;

      const { controlCaseUseCase } = app.caseExecution;
      const result = await controlCaseUseCase.execute({
        caseId: id,
        action: 'RESUME',
        tenantId: user.tenantId,
        userId: user.id,
        correlationId,
      });

      reply.header('x-correlation-id', correlationId);
      return reply.send({
        previous_status: result.previousStatus,
        new_status: result.newStatus,
      });
    },
  );

  // ── 8. GET /cases/:id/gates — List Gates (FR-011) ──────────────────────────
  app.get<{ Params: z.infer<typeof caseIdParam>; Querystring: z.infer<typeof listGatesQuery> }>(
    `${prefix}/:id/gates`,
    {
      operationId: 'cases_gates_list',
      schema: {
        tags: ['case-execution'],
        params: caseIdParam,
        querystring: listGatesQuery,
        response: { 200: listGatesResponse },
      },
      onRequest: [app.verifySession, app.requireScope('process:case:read')],
    },
    async (request, reply) => {
      const { id } = request.params as typeof caseIdParam._type;
      const query = request.query as typeof listGatesQuery._type;

      const { listGatesUseCase } = app.caseExecution;
      const result = await listGatesUseCase.execute({
        caseId: id,
        stageId: query.stage_id,
      });

      return reply.send({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: result.gates.map((g: Record<string, any>) => ({
          id: g.id,
          case_id: g.caseId,
          gate_id: g.gateId,
          stage_id: g.stageId,
          status: g.status,
          resolved_by: g.resolvedBy,
          resolved_at: g.resolvedAt?.toISOString() ?? null,
          decision: g.decision,
          parecer: g.parecer,
        })),
      });
    },
  );

  // ── 9. POST /cases/:id/gates/:gateId/resolve — Resolve Gate (FR-004) ──────
  app.post<{ Params: z.infer<typeof gateParam>; Body: z.infer<typeof resolveGateBody> }>(
    `${prefix}/:id/gates/:gateId/resolve`,
    {
      operationId: 'cases_gates_resolve',
      schema: {
        tags: ['case-execution'],
        params: gateParam,
        body: resolveGateBody,
        response: { 200: resolveGateResponse },
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('process:case:gate_resolve')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const params = request.params as typeof gateParam._type;
      const body = request.body as typeof resolveGateBody._type;
      const user = request.user;

      const { resolveGateUseCase, gateInstanceRepo } = app.caseExecution;

      // Load gate instance to get gate_id (blueprint ID)
      const gateInstance = await gateInstanceRepo.findById(params.gateId);

      const result = await resolveGateUseCase.execute({
        gateInstanceId: params.gateId,
        caseId: params.id,
        tenantId: user.tenantId,
        userId: user.id,
        userCanApprove: user.canApprove ?? false,
        correlationId,
        decision: body.decision,
        parecer: body.parecer,
        evidence: body.evidence,
        checklistItems: body.checklist_items,
      });

      reply.header('x-correlation-id', correlationId);
      return reply.send({
        id: result.gateInstanceId,
        gate_id: gateInstance?.gateId ?? params.gateId,
        status: result.status,
        decision: result.decision ?? null,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
      });
    },
  );

  // ── 10. POST /cases/:id/gates/:gateId/waive — Waive Gate (FR-005) ─────────
  app.post<{ Params: z.infer<typeof gateParam>; Body: z.infer<typeof waiveGateBody> }>(
    `${prefix}/:id/gates/:gateId/waive`,
    {
      operationId: 'cases_gates_waive',
      schema: {
        tags: ['case-execution'],
        params: gateParam,
        body: waiveGateBody,
        response: { 200: waiveGateResponse },
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('process:case:gate_waive')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const params = request.params as typeof gateParam._type;
      const body = request.body as typeof waiveGateBody._type;
      const user = request.user;

      const { waiveGateUseCase, gateInstanceRepo } = app.caseExecution;

      // Load gate instance to get gate_id (blueprint ID)
      const gateInstance = await gateInstanceRepo.findById(params.gateId);

      const result = await waiveGateUseCase.execute({
        gateInstanceId: params.gateId,
        caseId: params.id,
        tenantId: user.tenantId,
        userId: user.id,
        motivo: body.motivo,
        correlationId,
      });

      reply.header('x-correlation-id', correlationId);
      return reply.send({
        id: result.gateInstanceId,
        gate_id: gateInstance?.gateId ?? params.gateId,
        status: result.status,
        resolved_by: user.id,
        resolved_at: new Date().toISOString(),
      });
    },
  );

  // ── 11. GET /cases/:id/assignments — List Assignments (FR-012) ─────────────
  app.get<{ Params: z.infer<typeof caseIdParam> }>(
    `${prefix}/:id/assignments`,
    {
      operationId: 'cases_assignments_list',
      schema: {
        tags: ['case-execution'],
        params: caseIdParam,
        response: { 200: listAssignmentsResponse },
      },
      onRequest: [app.verifySession, app.requireScope('process:case:read')],
    },
    async (request, reply) => {
      const { id } = request.params as typeof caseIdParam._type;

      const { listAssignmentsUseCase } = app.caseExecution;
      const result = await listAssignmentsUseCase.execute({ caseId: id });

      return reply.send({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: result.assignments.map((a: Record<string, any>) => ({
          id: a.id,
          case_id: a.caseId,
          stage_id: a.stageId,
          process_role_id: a.processRoleId,
          user_id: a.userId,
          assigned_by: a.assignedBy,
          assigned_at: a.assignedAt.toISOString(),
          valid_until: a.validUntil?.toISOString() ?? null,
          is_active: a.isActive,
          delegation_id: a.delegationId,
        })),
      });
    },
  );

  // ── 12. POST /cases/:id/assignments — Assign Responsible (FR-006) ──────────
  app.post<{ Params: z.infer<typeof caseIdParam>; Body: z.infer<typeof assignBody> }>(
    `${prefix}/:id/assignments`,
    {
      operationId: 'cases_assignments_create',
      schema: {
        tags: ['case-execution'],
        params: caseIdParam,
        body: assignBody,
        response: { 201: assignResponse },
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('process:case:assign')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const { id } = request.params as typeof caseIdParam._type;
      const body = request.body as typeof assignBody._type;
      const user = request.user;

      const { assignResponsibleUseCase } = app.caseExecution;
      const result = await assignResponsibleUseCase.execute({
        caseId: id,
        stageId: body.stage_id,
        processRoleId: body.process_role_id,
        userId: body.user_id,
        assignedBy: user.id,
        tenantId: user.tenantId,
        correlationId,
        validUntil: body.valid_until ? new Date(body.valid_until) : undefined,
        delegationId: body.delegation_id,
      });

      const a = result.assignment;
      reply.header('x-correlation-id', correlationId);
      return reply.status(201).send({
        id: a.id,
        case_id: a.caseId,
        stage_id: a.stageId,
        process_role_id: a.processRoleId,
        user_id: a.userId,
        is_active: a.isActive,
        assigned_at: a.assignedAt.toISOString(),
        replaced_assignment_id: result.replacedAssignmentId ?? null,
      });
    },
  );

  // ── 13. PATCH /cases/:id/assignments/:aid — Update Assignment (FR-006) ─────
  app.patch<{
    Params: z.infer<typeof assignmentIdParam>;
    Body: z.infer<typeof updateAssignmentBody>;
  }>(
    `${prefix}/:id/assignments/:aid`,
    {
      operationId: 'cases_assignments_update',
      schema: {
        tags: ['case-execution'],
        params: assignmentIdParam,
        body: updateAssignmentBody,
        response: { 200: updateAssignmentResponse },
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('process:case:assign')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const params = request.params as typeof assignmentIdParam._type;
      const body = request.body as typeof updateAssignmentBody._type;
      const user = request.user;

      const { assignResponsibleUseCase } = app.caseExecution;
      const result = await assignResponsibleUseCase.update({
        assignmentId: params.aid,
        caseId: params.id,
        tenantId: user.tenantId,
        userId: user.id,
        correlationId,
        validUntil: body.valid_until ? new Date(body.valid_until) : undefined,
        isActive: body.is_active,
        substitutionReason: body.substitution_reason,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const a = result as Record<string, any>;
      reply.header('x-correlation-id', correlationId);
      return reply.send({
        id: a.id ?? params.aid,
        case_id: a.caseId ?? params.id,
        stage_id: a.stageId,
        process_role_id: a.processRoleId,
        user_id: a.userId,
        is_active: a.isActive,
        assigned_at: a.assignedAt instanceof Date ? a.assignedAt.toISOString() : a.assignedAt,
        valid_until:
          a.validUntil instanceof Date ? a.validUntil.toISOString() : (a.validUntil ?? null),
      });
    },
  );

  // ── 14. GET /cases/:id/events — List Events (FR-013) ───────────────────────
  app.get<{ Params: z.infer<typeof caseIdParam> }>(
    `${prefix}/:id/events`,
    {
      operationId: 'cases_events_list',
      schema: {
        tags: ['case-execution'],
        params: caseIdParam,
        response: { 200: listEventsResponse },
      },
      onRequest: [app.verifySession, app.requireScope('process:case:read')],
    },
    async (request, reply) => {
      const { id } = request.params as typeof caseIdParam._type;

      const { caseEventRepo } = app.caseExecution;
      const events = await caseEventRepo.findByCaseId(id);

      return reply.send({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: events.map((e: Record<string, any>) => ({
          id: e.id,
          case_id: e.caseId,
          event_type: e.eventType,
          descricao: e.descricao,
          created_by: e.createdBy,
          created_at: e.createdAt.toISOString(),
          stage_id: e.stageId,
          metadata: e.metadata,
        })),
      });
    },
  );

  // ── 15. POST /cases/:id/events — Record Event (FR-007) ────────────────────
  app.post<{ Params: z.infer<typeof caseIdParam>; Body: z.infer<typeof recordEventBody> }>(
    `${prefix}/:id/events`,
    {
      operationId: 'cases_events_create',
      schema: {
        tags: ['case-execution'],
        params: caseIdParam,
        body: recordEventBody,
        response: { 201: recordEventResponse },
        headers: {
          type: 'object',
          properties: { 'x-correlation-id': { type: 'string' } },
        },
      },
      onRequest: [app.verifySession, app.requireScope('process:case:write')],
    },
    async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? crypto.randomUUID();
      const { id } = request.params as typeof caseIdParam._type;
      const body = request.body as typeof recordEventBody._type;
      const user = request.user;

      // REOPENED requires special scope (FR-007, SEC-006)
      if (body.event_type === 'REOPENED') {
        await app.requireScope('process:case:reopen')(request, reply);

        // REOPENED handled via controlCaseUseCase (reuses REOPEN logic)
        const { controlCaseUseCase } = app.caseExecution;
        const _result = await controlCaseUseCase.execute({
          caseId: id,
          action: 'REOPEN',
          tenantId: user.tenantId,
          userId: user.id,
          correlationId,
          reason: body.descricao,
          targetStageId: body.target_stage_id,
        });

        reply.header('x-correlation-id', correlationId);
        return reply.status(201).send({
          id: crypto.randomUUID(),
          case_id: id,
          event_type: 'REOPENED',
          descricao: body.descricao,
          created_by: user.id,
          created_at: new Date().toISOString(),
          stage_id: body.target_stage_id ?? id,
        });
      }

      // Standard events: COMMENT, EXCEPTION, EVIDENCE
      const { recordEventUseCase } = app.caseExecution;
      const result = await recordEventUseCase.execute({
        caseId: id,
        eventType: body.event_type,
        descricao: body.descricao,
        tenantId: user.tenantId,
        userId: user.id,
        correlationId,
        metadata: body.metadata,
      });

      const e = result.event;
      reply.header('x-correlation-id', correlationId);
      return reply.status(201).send({
        id: e.id,
        case_id: e.caseId,
        event_type: e.eventType,
        descricao: e.descricao,
        created_by: e.createdBy,
        created_at: e.createdAt.toISOString(),
        stage_id: e.stageId,
      });
    },
  );

  // ── 16. GET /cases/:id/timeline — Timeline (FR-008) ────────────────────────
  app.get<{ Params: z.infer<typeof caseIdParam> }>(
    `${prefix}/:id/timeline`,
    {
      operationId: 'cases_timeline',
      schema: {
        tags: ['case-execution'],
        params: caseIdParam,
        response: { 200: timelineResponse },
      },
      onRequest: [app.verifySession, app.requireScope('process:case:read')],
    },
    async (request, reply) => {
      const { id } = request.params as typeof caseIdParam._type;
      const user = request.user;

      const { getTimelineUseCase } = app.caseExecution;
      const result = await getTimelineUseCase.execute({
        caseId: id,
        tenantId: user.tenantId,
      });

      return reply.send({
        case_id: id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        timeline: result.entries.map((e: Record<string, any>) => ({
          type: e.type,
          timestamp: e.timestamp.toISOString(),
          actor: e.actor,
          description: e.description,
          metadata: e.metadata,
        })),
      });
    },
  );
}
