/**
 * @contract FR-001..FR-014, INT-006, SEC-006, EX-OAS-001, DOC-ARC-001, DOC-ARC-003
 *
 * Fastify route definitions for the Case Execution module (MOD-006).
 * 16 endpoints covering case lifecycle, gates, assignments, events, and timeline.
 *
 * Scopes: process:case:read, process:case:write, process:case:cancel,
 *         process:case:gate_resolve, process:case:gate_waive,
 *         process:case:assign, process:case:reopen
 */

import type { FastifyInstance } from "fastify";
import {
  openCaseBody,
  openCaseResponse,
  caseIdParam,
  transitionBody,
  transitionResponse,
  controlBody,
  controlResponse,
  gateInstanceParam,
  resolveGateBody,
  resolveGateResponse,
  waiveGateBody,
  waiveGateResponse,
  assignBody,
  assignResponse,
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
} from "../dtos/cases.dto.js";

export async function caseExecutionRoutes(app: FastifyInstance): Promise<void> {
  const prefix = "/api/v1/cases";

  // ── POST /cases — Open Case (FR-001) ─────────────────────────────────────
  app.post(prefix, {
    operationId: "cases_open",
    schema: {
      tags: ["case-execution"],
      body: openCaseBody,
      response: { 201: openCaseResponse },
      headers: {
        type: "object",
        properties: {
          "x-correlation-id": { type: "string" },
          "idempotency-key": { type: "string" },
        },
      },
    },
    onRequest: [app.verifySession, app.requireScope("process:case:write")],
  }, async (request, reply) => {
    const correlationId = (request.headers["x-correlation-id"] as string) ?? crypto.randomUUID();
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

    reply.header("x-correlation-id", correlationId);
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
  });

  // ── GET /cases — List Cases (FR-009) ──────────────────────────────────────
  app.get(prefix, {
    operationId: "cases_list",
    schema: {
      tags: ["case-execution"],
      querystring: listCasesQuery,
      response: { 200: listCasesResponse },
    },
    onRequest: [app.verifySession, app.requireScope("process:case:read")],
  }, async (request, reply) => {
    const query = request.query as typeof listCasesQuery._type;
    const user = request.user;

    const { listCasesUseCase } = app.caseExecution;
    const result = await listCasesUseCase.execute({
      tenantId: user.tenantId,
      cycleId: query.cycle_id,
      status: query.status,
      stageId: query.stage_id,
      objectId: query.object_id,
      myResponsibility: query.my_responsibility === "true" ? { userId: user.id } : undefined,
      search: query.search,
      cursor: query.cursor,
      limit: query.limit,
    });

    return reply.send({
      data: result.items.map((i) => ({
        id: i.id,
        codigo: i.codigo,
        cycle_id: i.cycleId,
        current_stage_id: i.currentStageId,
        status: i.status,
        object_type: i.objectType,
        object_id: i.objectId,
        org_unit_id: i.orgUnitId,
        opened_by: i.openedBy,
        opened_at: i.openedAt.toISOString(),
        pending_gates_count: i.pendingGatesCount,
      })),
      meta: { next_cursor: result.nextCursor, has_more: result.hasMore },
    });
  });

  // ── GET /cases/:id — Case Details (FR-010) ────────────────────────────────
  app.get(`${prefix}/:id`, {
    operationId: "cases_get",
    schema: {
      tags: ["case-execution"],
      params: caseIdParam,
      response: { 200: caseDetailResponse },
    },
    onRequest: [app.verifySession, app.requireScope("process:case:read")],
  }, async (request, reply) => {
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
      current_stage_gates: result.currentStageGates.map((g) => ({
        gate_instance_id: g.id,
        gate_id: g.gateId,
        stage_id: g.stageId,
        status: g.status,
        decision: g.decision,
        parecer: g.parecer,
      })),
      active_assignments: result.activeAssignments.map((a) => ({
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
  });

  // ── POST /cases/:id/transitions — Transition Stage (FR-002) ──────────────
  app.post(`${prefix}/:id/transitions`, {
    operationId: "cases_transition",
    schema: {
      tags: ["case-execution"],
      params: caseIdParam,
      body: transitionBody,
      response: { 200: transitionResponse },
      headers: {
        type: "object",
        properties: { "x-correlation-id": { type: "string" } },
      },
    },
    onRequest: [app.verifySession, app.requireScope("process:case:write")],
  }, async (request, reply) => {
    const correlationId = (request.headers["x-correlation-id"] as string) ?? crypto.randomUUID();
    const { id } = request.params as typeof caseIdParam._type;
    const body = request.body as typeof transitionBody._type;
    const user = request.user;

    const { transitionStageUseCase } = app.caseExecution;
    const result = await transitionStageUseCase.execute({
      caseId: id,
      targetStageId: body.target_stage_id,
      tenantId: user.tenantId,
      userId: user.id,
      userRoleCodigos: user.roleCodigos ?? [],
      evidence: body.evidence,
      motivo: body.motivo,
      correlationId,
    });

    reply.header("x-correlation-id", correlationId);
    return reply.send({
      transition_id: result.transitionId,
      from_stage_id: result.fromStageId,
      to_stage_id: result.toStageId,
      is_terminal: result.isTerminal,
      case_completed: result.caseCompleted,
    });
  });

  // ── POST /cases/:id/controls — Case Controls (FR-003) ────────────────────
  app.post(`${prefix}/:id/controls`, {
    operationId: "cases_control",
    schema: {
      tags: ["case-execution"],
      params: caseIdParam,
      body: controlBody,
      response: { 200: controlResponse },
      headers: {
        type: "object",
        properties: { "x-correlation-id": { type: "string" } },
      },
    },
    onRequest: [app.verifySession, app.requireScope("process:case:write")],
  }, async (request, reply) => {
    const correlationId = (request.headers["x-correlation-id"] as string) ?? crypto.randomUUID();
    const { id } = request.params as typeof caseIdParam._type;
    const body = request.body as typeof controlBody._type;
    const user = request.user;

    // REOPEN requires special scope (PENDENTE-001)
    if (body.action === "REOPEN") {
      await app.requireScope("process:case:reopen")(request, reply);
    }
    // CANCEL requires cancel scope
    if (body.action === "CANCEL") {
      await app.requireScope("process:case:cancel")(request, reply);
    }

    const { controlCaseUseCase } = app.caseExecution;
    const result = await controlCaseUseCase.execute({
      caseId: id,
      action: body.action,
      tenantId: user.tenantId,
      userId: user.id,
      correlationId,
      reason: body.reason,
      targetStageId: body.target_stage_id,
    });

    reply.header("x-correlation-id", correlationId);
    return reply.send({
      previous_status: result.previousStatus,
      new_status: result.newStatus,
    });
  });

  // ── POST /cases/:id/gates/:gateInstanceId/resolve — Resolve Gate (FR-004) ─
  app.post(`${prefix}/:id/gates/:gateInstanceId/resolve`, {
    operationId: "cases_gate_resolve",
    schema: {
      tags: ["case-execution"],
      params: gateInstanceParam,
      body: resolveGateBody,
      response: { 200: resolveGateResponse },
      headers: {
        type: "object",
        properties: { "x-correlation-id": { type: "string" } },
      },
    },
    onRequest: [app.verifySession, app.requireScope("process:case:gate_resolve")],
  }, async (request, reply) => {
    const correlationId = (request.headers["x-correlation-id"] as string) ?? crypto.randomUUID();
    const params = request.params as typeof gateInstanceParam._type;
    const body = request.body as typeof resolveGateBody._type;
    const user = request.user;

    const { resolveGateUseCase } = app.caseExecution;
    const result = await resolveGateUseCase.execute({
      gateInstanceId: params.gateInstanceId,
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

    reply.header("x-correlation-id", correlationId);
    return reply.send({
      gate_instance_id: result.gateInstanceId,
      status: result.status,
      decision: result.decision,
    });
  });

  // ── POST /cases/:id/gates/:gateInstanceId/waive — Waive Gate (FR-005) ─────
  app.post(`${prefix}/:id/gates/:gateInstanceId/waive`, {
    operationId: "cases_gate_waive",
    schema: {
      tags: ["case-execution"],
      params: gateInstanceParam,
      body: waiveGateBody,
      response: { 200: waiveGateResponse },
      headers: {
        type: "object",
        properties: { "x-correlation-id": { type: "string" } },
      },
    },
    onRequest: [app.verifySession, app.requireScope("process:case:gate_waive")],
  }, async (request, reply) => {
    const correlationId = (request.headers["x-correlation-id"] as string) ?? crypto.randomUUID();
    const params = request.params as typeof gateInstanceParam._type;
    const body = request.body as typeof waiveGateBody._type;
    const user = request.user;

    const { waiveGateUseCase } = app.caseExecution;
    const result = await waiveGateUseCase.execute({
      gateInstanceId: params.gateInstanceId,
      caseId: params.id,
      tenantId: user.tenantId,
      userId: user.id,
      motivo: body.motivo,
      correlationId,
    });

    reply.header("x-correlation-id", correlationId);
    return reply.send({
      gate_instance_id: result.gateInstanceId,
      status: result.status,
    });
  });

  // ── POST /cases/:id/assignments — Assign Responsible (FR-006) ─────────────
  app.post(`${prefix}/:id/assignments`, {
    operationId: "cases_assign",
    schema: {
      tags: ["case-execution"],
      params: caseIdParam,
      body: assignBody,
      response: { 201: assignResponse },
      headers: {
        type: "object",
        properties: { "x-correlation-id": { type: "string" } },
      },
    },
    onRequest: [app.verifySession, app.requireScope("process:case:assign")],
  }, async (request, reply) => {
    const correlationId = (request.headers["x-correlation-id"] as string) ?? crypto.randomUUID();
    const { id } = request.params as typeof caseIdParam._type;
    const body = request.body as typeof assignBody._type;
    const user = request.user;

    const { assignResponsibleUseCase } = app.caseExecution;
    const result = await assignResponsibleUseCase.execute({
      caseId: id,
      stageId: (await app.caseExecution.getCaseDetailsUseCase.execute({ caseId: id, tenantId: user.tenantId })).caseInstance.currentStageId,
      processRoleId: body.process_role_id,
      userId: body.user_id,
      assignedBy: user.id,
      tenantId: user.tenantId,
      correlationId,
      validUntil: body.valid_until ? new Date(body.valid_until) : undefined,
      delegationId: body.delegation_id,
      substitutionReason: body.substitution_reason,
    });

    const a = result.assignment;
    reply.header("x-correlation-id", correlationId);
    return reply.status(201).send({
      id: a.id,
      case_id: a.caseId,
      stage_id: a.stageId,
      process_role_id: a.processRoleId,
      user_id: a.userId,
      assigned_by: a.assignedBy,
      assigned_at: a.assignedAt.toISOString(),
      valid_until: a.validUntil?.toISOString() ?? null,
      is_active: a.isActive,
      replaced: result.replaced,
    });
  });

  // ── POST /cases/:id/events — Record Event (FR-007) ────────────────────────
  app.post(`${prefix}/:id/events`, {
    operationId: "cases_record_event",
    schema: {
      tags: ["case-execution"],
      params: caseIdParam,
      body: recordEventBody,
      response: { 201: recordEventResponse },
      headers: {
        type: "object",
        properties: { "x-correlation-id": { type: "string" } },
      },
    },
    onRequest: [app.verifySession, app.requireScope("process:case:write")],
  }, async (request, reply) => {
    const correlationId = (request.headers["x-correlation-id"] as string) ?? crypto.randomUUID();
    const { id } = request.params as typeof caseIdParam._type;
    const body = request.body as typeof recordEventBody._type;
    const user = request.user;

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
    reply.header("x-correlation-id", correlationId);
    return reply.status(201).send({
      id: e.id,
      case_id: e.caseId,
      event_type: e.eventType,
      descricao: e.descricao,
      created_by: e.createdBy,
      created_at: e.createdAt.toISOString(),
      stage_id: e.stageId,
    });
  });

  // ── GET /cases/:id/timeline — Timeline (FR-008) ───────────────────────────
  app.get(`${prefix}/:id/timeline`, {
    operationId: "cases_timeline",
    schema: {
      tags: ["case-execution"],
      params: caseIdParam,
      response: { 200: timelineResponse },
    },
    onRequest: [app.verifySession, app.requireScope("process:case:read")],
  }, async (request, reply) => {
    const { id } = request.params as typeof caseIdParam._type;
    const user = request.user;

    const { getTimelineUseCase } = app.caseExecution;
    const result = await getTimelineUseCase.execute({
      caseId: id,
      tenantId: user.tenantId,
    });

    return reply.send({
      entries: result.entries.map((e) => ({
        id: e.id,
        source: e.source,
        timestamp: e.timestamp.toISOString(),
        data: e.data,
      })),
      total: result.total,
    });
  });

  // ── GET /cases/:id/gates — List Gates (FR-011) ────────────────────────────
  app.get(`${prefix}/:id/gates`, {
    operationId: "cases_gates_list",
    schema: {
      tags: ["case-execution"],
      params: caseIdParam,
      querystring: listGatesQuery,
      response: { 200: listGatesResponse },
    },
    onRequest: [app.verifySession, app.requireScope("process:case:read")],
  }, async (request, reply) => {
    const { id } = request.params as typeof caseIdParam._type;
    const query = request.query as typeof listGatesQuery._type;

    const { listGatesUseCase } = app.caseExecution;
    const result = await listGatesUseCase.execute({
      caseId: id,
      stageId: query.stage_id,
    });

    return reply.send({
      data: result.gates.map((g) => ({
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
  });

  // ── GET /cases/:id/assignments — List Assignments (FR-012) ────────────────
  app.get(`${prefix}/:id/assignments`, {
    operationId: "cases_assignments_list",
    schema: {
      tags: ["case-execution"],
      params: caseIdParam,
      response: { 200: listAssignmentsResponse },
    },
    onRequest: [app.verifySession, app.requireScope("process:case:read")],
  }, async (request, reply) => {
    const { id } = request.params as typeof caseIdParam._type;

    const { listAssignmentsUseCase } = app.caseExecution;
    const result = await listAssignmentsUseCase.execute({ caseId: id });

    return reply.send({
      data: result.assignments.map((a) => ({
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
  });

  // ── GET /cases/:id/events — List Events (FR-013) ──────────────────────────
  app.get(`${prefix}/:id/events`, {
    operationId: "cases_events_list",
    schema: {
      tags: ["case-execution"],
      params: caseIdParam,
      response: { 200: listEventsResponse },
    },
    onRequest: [app.verifySession, app.requireScope("process:case:read")],
  }, async (request, reply) => {
    const { id } = request.params as typeof caseIdParam._type;

    const { caseEventRepo } = app.caseExecution;
    const events = await caseEventRepo.findByCaseId(id);

    return reply.send({
      data: events.map((e) => ({
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
  });
}
