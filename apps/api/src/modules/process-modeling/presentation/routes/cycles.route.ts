/**
 * @contract FR-001, FR-002, FR-003, FR-004, FR-005, FR-011, SEC-005, INT-005
 *
 * Fastify routes for Process Cycles + Macro-stages (MOD-005).
 * Prefix: /api/v1/admin
 *
 * 12 endpoints:
 *  - GET    /cycles              → List cycles (FR-001)
 *  - POST   /cycles              → Create cycle (FR-001)
 *  - GET    /cycles/:id          → Get cycle detail (FR-001)
 *  - PATCH  /cycles/:id          → Update cycle (FR-001)
 *  - DELETE /cycles/:id          → Soft delete cycle (FR-001)
 *  - POST   /cycles/:id/publish  → Publish cycle (FR-002)
 *  - POST   /cycles/:id/fork     → Fork cycle (FR-003)
 *  - POST   /cycles/:id/deprecate → Deprecate cycle (FR-004)
 *  - GET    /cycles/:id/flow     → Full graph (FR-011)
 *  - POST   /cycles/:cid/macro-stages → Create macro-stage (FR-005)
 *  - PATCH  /macro-stages/:id    → Update macro-stage (FR-005)
 *  - DELETE /macro-stages/:id    → Delete macro-stage (FR-005)
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import type {
  FlowMacroStageNode,
  FlowStageNode,
  FlowGateRow,
  FlowRoleLinkRow,
  FlowTransitionRow,
} from '../../domain/domain-services/flow-graph.service.js';
import {
  cyclesListQuery,
  cycleListItem,
  createCycleBody,
  cycleResponse,
  updateCycleBody,
  cycleIdParam,
  createMacroStageBody,
  macroStageResponse,
  updateMacroStageBody,
  flowResponse,
} from '../dtos/process-modeling.dto.js';
import {
  paginatedResponse,
  idempotencyKeyHeader,
} from '../../../foundation/presentation/dtos/common.dto.js';

export async function cyclesRoutes(app: FastifyInstance): Promise<void> {
  // ---- Cycles CRUD --------------------------------------------------------

  // GET /admin/cycles — List (FR-001, INT-005 §1.1)
  app.get<{ Querystring: z.infer<typeof cyclesListQuery> }>('/cycles', {
    onRequest: [app.verifySession, app.requireScope('process:cycle:read')],
    schema: {
      querystring: cyclesListQuery,
      tags: ['process-modeling'],
      operationId: 'admin_cycles_list',
      response: { 200: paginatedResponse(cycleListItem) },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.listCyclesUseCase.execute({
        tenantId: request.session.tenantId,
        status: request.query.status,
        cursor: request.query.cursor,
        limit: request.query.limit,
      });

      return reply.send({
        data: result.data.map((c: Record<string, unknown>) => ({
          id: c.id,
          codigo: c.codigo,
          nome: c.nome,
          version: c.version,
          status: c.status,
          published_at: c.publishedAt ? (c.publishedAt as Date).toISOString() : null,
          created_at: (c.createdAt as Date).toISOString(),
        })),
        next_cursor: result.nextCursor,
        has_more: result.hasMore,
      });
    },
  });

  // POST /admin/cycles — Create (FR-001)
  app.post<{ Body: z.infer<typeof createCycleBody> }>('/cycles', {
    onRequest: [app.verifySession, app.requireScope('process:cycle:write')],
    schema: {
      body: createCycleBody,
      tags: ['process-modeling'],
      operationId: 'admin_cycles_create',
      response: { 201: cycleResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      const result = await request.dipiContainer.createCycleUseCase.execute({
        tenantId: request.session.tenantId,
        codigo: request.body.codigo,
        nome: request.body.nome,
        descricao: request.body.descricao ?? null,
        createdBy: request.session.userId,
        correlationId,
      });

      // FR-001-C01: Reload full cycle to get real timestamps
      const cycle = await request.dipiContainer.getCycleUseCase.execute({
        id: result.id,
        tenantId: request.session.tenantId,
      });

      return reply.status(201).send({
        id: cycle.id,
        tenant_id: cycle.tenantId,
        codigo: cycle.codigo,
        nome: cycle.nome,
        descricao: cycle.descricao,
        version: cycle.version,
        status: cycle.status,
        parent_cycle_id: cycle.parentCycleId,
        published_at: cycle.publishedAt?.toISOString() ?? null,
        created_by: cycle.createdBy,
        created_at: cycle.createdAt.toISOString(),
        updated_at: cycle.updatedAt.toISOString(),
      });
    },
  });

  // GET /admin/cycles/:id — Detail (FR-001)
  app.get<{ Params: z.infer<typeof cycleIdParam> }>('/cycles/:id', {
    onRequest: [app.verifySession, app.requireScope('process:cycle:read')],
    schema: {
      params: cycleIdParam,
      tags: ['process-modeling'],
      operationId: 'admin_cycles_get',
      response: { 200: cycleResponse },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.getCycleUseCase.execute({
        id: request.params.id,
        tenantId: request.session.tenantId,
      });

      return reply.send({
        id: result.id,
        tenant_id: result.tenantId,
        codigo: result.codigo,
        nome: result.nome,
        descricao: result.descricao,
        version: result.version,
        status: result.status,
        parent_cycle_id: result.parentCycleId,
        published_at: result.publishedAt?.toISOString() ?? null,
        created_by: result.createdBy,
        created_at: result.createdAt.toISOString(),
        updated_at: result.updatedAt.toISOString(),
      });
    },
  });

  // PATCH /admin/cycles/:id — Update (FR-001, BR-001)
  app.patch<{ Params: z.infer<typeof cycleIdParam>; Body: z.infer<typeof updateCycleBody> }>(
    '/cycles/:id',
    {
      onRequest: [app.verifySession, app.requireScope('process:cycle:write')],
      schema: {
        params: cycleIdParam,
        body: updateCycleBody,
        tags: ['process-modeling'],
        operationId: 'admin_cycles_update',
        response: { 200: cycleResponse },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

        await request.dipiContainer.updateCycleUseCase.execute({
          id: request.params.id,
          tenantId: request.session.tenantId,
          nome: request.body.nome,
          descricao: request.body.descricao,
          createdBy: request.session.userId,
          correlationId,
        });

        // FR-001-C01: Reload full cycle to get real data for response
        const cycle = await request.dipiContainer.getCycleUseCase.execute({
          id: request.params.id,
          tenantId: request.session.tenantId,
        });

        return reply.send({
          id: cycle.id,
          tenant_id: cycle.tenantId,
          codigo: cycle.codigo,
          nome: cycle.nome,
          descricao: cycle.descricao,
          version: cycle.version,
          status: cycle.status,
          parent_cycle_id: cycle.parentCycleId,
          published_at: cycle.publishedAt?.toISOString() ?? null,
          created_by: cycle.createdBy,
          created_at: cycle.createdAt.toISOString(),
          updated_at: cycle.updatedAt.toISOString(),
        });
      },
    },
  );

  // DELETE /admin/cycles/:id — Soft delete (FR-001, BR-005)
  app.delete<{ Params: z.infer<typeof cycleIdParam> }>('/cycles/:id', {
    onRequest: [app.verifySession, app.requireScope('process:cycle:delete')],
    schema: {
      params: cycleIdParam,
      tags: ['process-modeling'],
      operationId: 'admin_cycles_delete',
      response: { 204: { type: 'null' as const } },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.deleteCycleUseCase.execute({
        id: request.params.id,
        tenantId: request.session.tenantId,
        deletedBy: request.session.userId,
        correlationId,
      });

      return reply.status(204).send();
    },
  });

  // POST /admin/cycles/:id/publish — Publish (FR-002, BR-003)
  app.post<{ Params: z.infer<typeof cycleIdParam> }>('/cycles/:id/publish', {
    onRequest: [app.verifySession, app.requireScope('process:cycle:publish')],
    schema: {
      params: cycleIdParam,
      tags: ['process-modeling'],
      operationId: 'admin_cycles_publish',
      response: { 200: cycleResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.publishCycleUseCase.execute({
        id: request.params.id,
        tenantId: request.session.tenantId,
        publishedBy: request.session.userId,
        correlationId,
      });

      // FR-001-C01: Reload full cycle to get real data for response
      const cycle = await request.dipiContainer.getCycleUseCase.execute({
        id: request.params.id,
        tenantId: request.session.tenantId,
      });

      return reply.send({
        id: cycle.id,
        tenant_id: cycle.tenantId,
        codigo: cycle.codigo,
        nome: cycle.nome,
        descricao: cycle.descricao,
        version: cycle.version,
        status: cycle.status,
        parent_cycle_id: cycle.parentCycleId,
        published_at: cycle.publishedAt?.toISOString() ?? null,
        created_by: cycle.createdBy,
        created_at: cycle.createdAt.toISOString(),
        updated_at: cycle.updatedAt.toISOString(),
      });
    },
  });

  // POST /admin/cycles/:id/fork — Fork (FR-003, BR-004)
  app.post<{ Params: z.infer<typeof cycleIdParam> }>('/cycles/:id/fork', {
    onRequest: [app.verifySession, app.requireScope('process:cycle:write')],
    schema: {
      params: cycleIdParam,
      headers: idempotencyKeyHeader,
      tags: ['process-modeling'],
      operationId: 'admin_cycles_fork',
      response: { 201: cycleResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;
      const idempotencyKey = request.headers['idempotency-key'] as string | undefined;

      const result = await request.dipiContainer.forkCycleUseCase.execute({
        id: request.params.id,
        tenantId: request.session.tenantId,
        forkedBy: request.session.userId,
        correlationId,
        idempotencyKey,
      });

      // FR-001-C01: Reload full cycle to get real data for response
      const cycle = await request.dipiContainer.getCycleUseCase.execute({
        id: result.id,
        tenantId: request.session.tenantId,
      });

      return reply.status(201).send({
        id: cycle.id,
        tenant_id: cycle.tenantId,
        codigo: cycle.codigo,
        nome: cycle.nome,
        descricao: cycle.descricao,
        version: cycle.version,
        status: cycle.status,
        parent_cycle_id: cycle.parentCycleId,
        published_at: cycle.publishedAt?.toISOString() ?? null,
        created_by: cycle.createdBy,
        created_at: cycle.createdAt.toISOString(),
        updated_at: cycle.updatedAt.toISOString(),
      });
    },
  });

  // POST /admin/cycles/:id/deprecate — Deprecate (FR-004, BR-010)
  app.post<{ Params: z.infer<typeof cycleIdParam> }>('/cycles/:id/deprecate', {
    onRequest: [app.verifySession, app.requireScope('process:cycle:write')],
    schema: {
      params: cycleIdParam,
      tags: ['process-modeling'],
      operationId: 'admin_cycles_deprecate',
      response: { 200: cycleResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.deprecateCycleUseCase.execute({
        id: request.params.id,
        tenantId: request.session.tenantId,
        deprecatedBy: request.session.userId,
        correlationId,
      });

      // FR-001-C01: Reload full cycle to get real data for response
      const cycle = await request.dipiContainer.getCycleUseCase.execute({
        id: request.params.id,
        tenantId: request.session.tenantId,
      });

      return reply.send({
        id: cycle.id,
        tenant_id: cycle.tenantId,
        codigo: cycle.codigo,
        nome: cycle.nome,
        descricao: cycle.descricao,
        version: cycle.version,
        status: cycle.status,
        parent_cycle_id: cycle.parentCycleId,
        published_at: cycle.publishedAt?.toISOString() ?? null,
        created_by: cycle.createdBy,
        created_at: cycle.createdAt.toISOString(),
        updated_at: cycle.updatedAt.toISOString(),
      });
    },
  });

  // GET /admin/cycles/:id/flow — Full graph (FR-011, INT-005 §3)
  // FR-011-C01: Map FlowGraph (camelCase domain) → flowResponse (snake_case DTO)
  app.get<{ Params: z.infer<typeof cycleIdParam> }>('/cycles/:id/flow', {
    onRequest: [app.verifySession, app.requireScope('process:cycle:read')],
    schema: {
      params: cycleIdParam,
      tags: ['process-modeling'],
      operationId: 'admin_cycles_flow',
      response: { 200: flowResponse },
    },
    handler: async (request, reply) => {
      const cycle = await request.dipiContainer.getCycleUseCase.execute({
        id: request.params.id,
        tenantId: request.session.tenantId,
      });

      const result = await request.dipiContainer.getCycleFlowUseCase.execute({
        cycleId: request.params.id,
      });

      // Build stage codigo lookup for to_stage_codigo in transitions
      const stageCodigoMap = new Map<string, string>();
      for (const ms of result.macroStages) {
        for (const s of ms.stages) {
          stageCodigoMap.set(s.id, s.codigo);
        }
      }

      return reply.send({
        cycle: {
          id: cycle.id,
          codigo: cycle.codigo,
          nome: cycle.nome,
          version: cycle.version,
          status: cycle.status,
        },
        macro_stages: result.macroStages.map((ms: FlowMacroStageNode) => ({
          id: ms.id,
          codigo: ms.codigo,
          nome: ms.nome,
          ordem: ms.ordem,
          stages: ms.stages.map((s: FlowStageNode) => ({
            id: s.id,
            codigo: s.codigo,
            nome: s.nome,
            ordem: s.ordem,
            is_initial: s.isInitial,
            is_terminal: s.isTerminal,
            canvas_x: s.canvasX,
            canvas_y: s.canvasY,
            gates: s.gates.map((g: FlowGateRow) => ({
              id: g.id,
              stage_id: g.stageId,
              nome: g.nome,
              descricao: g.descricao,
              gate_type: g.gateType,
              required: g.required,
              ordem: g.ordem,
            })),
            roles: s.roles.map((r: FlowRoleLinkRow) => ({
              id: r.id,
              stage_id: r.stageId,
              role_id: r.roleId,
              required: r.required,
              max_assignees: r.maxAssignees,
            })),
            transitions_out: s.transitionsOut.map((t: FlowTransitionRow) => ({
              id: t.id,
              to_stage_id: t.toStageId,
              to_stage_codigo: stageCodigoMap.get(t.toStageId) ?? '',
              nome: t.nome,
              gate_required: t.gateRequired,
              evidence_required: t.evidenceRequired,
              allowed_roles: t.allowedRoles,
            })),
          })),
        })),
      });
    },
  });

  // ---- Macro-stages -------------------------------------------------------

  // POST /admin/cycles/:cid/macro-stages — Create (FR-005)
  app.post<{ Params: { cid: string }; Body: z.infer<typeof createMacroStageBody> }>(
    '/cycles/:cid/macro-stages',
    {
      onRequest: [app.verifySession, app.requireScope('process:cycle:write')],
      schema: {
        params: {
          type: 'object' as const,
          properties: { cid: { type: 'string' as const, format: 'uuid' } },
          required: ['cid'],
        },
        body: createMacroStageBody,
        tags: ['process-modeling'],
        operationId: 'admin_macro_stages_create',
        response: { 201: macroStageResponse },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

        const result = await request.dipiContainer.createMacroStageUseCase.execute({
          cycleId: request.params.cid,
          tenantId: request.session.tenantId,
          codigo: request.body.codigo,
          nome: request.body.nome,
          ordem: request.body.ordem,
          createdBy: request.session.userId,
          correlationId,
        });

        return reply.status(201).send({
          id: result.id,
          cycle_id: result.cycleId,
          codigo: result.codigo,
          nome: result.nome,
          ordem: result.ordem,
        });
      },
    },
  );

  // PATCH /admin/macro-stages/:id — Update (FR-005, BR-012)
  app.patch<{ Params: z.infer<typeof cycleIdParam>; Body: z.infer<typeof updateMacroStageBody> }>(
    '/macro-stages/:id',
    {
      onRequest: [app.verifySession, app.requireScope('process:cycle:write')],
      schema: {
        params: cycleIdParam,
        body: updateMacroStageBody,
        tags: ['process-modeling'],
        operationId: 'admin_macro_stages_update',
        response: { 200: macroStageResponse },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

        const result = await request.dipiContainer.updateMacroStageUseCase.execute({
          id: request.params.id,
          tenantId: request.session.tenantId,
          nome: request.body.nome,
          ordem: request.body.ordem,
          updatedBy: request.session.userId,
          correlationId,
        });

        return reply.send({
          id: result.id,
          cycle_id: result.cycleId,
          codigo: result.codigo,
          nome: result.nome,
          ordem: result.ordem,
        });
      },
    },
  );

  // DELETE /admin/macro-stages/:id — Soft delete (FR-005, BR-005)
  app.delete<{ Params: z.infer<typeof cycleIdParam> }>('/macro-stages/:id', {
    onRequest: [app.verifySession, app.requireScope('process:cycle:delete')],
    schema: {
      params: cycleIdParam,
      tags: ['process-modeling'],
      operationId: 'admin_macro_stages_delete',
      response: { 204: { type: 'null' as const } },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.deleteMacroStageUseCase.execute({
        id: request.params.id,
        tenantId: request.session.tenantId,
        deletedBy: request.session.userId,
        correlationId,
      });

      return reply.status(204).send();
    },
  });
}
