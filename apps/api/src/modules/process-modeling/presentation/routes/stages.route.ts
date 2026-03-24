/**
 * @contract FR-006, FR-007, FR-009, FR-010, SEC-005, INT-005
 *
 * Fastify routes for Stages, Gates, Stage-Roles, Transitions (MOD-005).
 * Prefix: /api/v1/admin
 *
 * 11 endpoints:
 *  - POST   /macro-stages/:mid/stages      → Create stage (FR-006)
 *  - GET    /stages/:id                     → Get stage detail (FR-006)
 *  - PATCH  /stages/:id                     → Update stage (FR-006)
 *  - DELETE /stages/:id                     → Soft delete stage (FR-006)
 *  - POST   /stages/:sid/gates              → Create gate (FR-007)
 *  - PATCH  /gates/:id                      → Update gate (FR-007)
 *  - DELETE /gates/:id                      → Delete gate (FR-007)
 *  - POST   /stages/:sid/roles              → Link role (FR-009)
 *  - DELETE /stages/:sid/roles/:rid         → Unlink role (FR-009)
 *  - POST   /stage-transitions              → Create transition (FR-010)
 *  - DELETE /stage-transitions/:id          → Delete transition (FR-010)
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import {
  macroStageIdParam,
  stageIdParam,
  gateIdParam,
  stageRoleParams,
  transitionIdParam,
  createStageBody,
  stageResponse,
  stageDetailResponse,
  updateStageBody,
  createGateBody,
  gateResponse,
  updateGateBody,
  linkStageRoleBody,
  stageRoleLinkResponse,
  createTransitionBody,
  transitionResponse,
} from '../dtos/process-modeling.dto.js';

export async function stagesRoutes(app: FastifyInstance): Promise<void> {
  // ---- Stages CRUD --------------------------------------------------------

  // POST /admin/macro-stages/:mid/stages — Create (FR-006)
  app.post<{ Params: z.infer<typeof macroStageIdParam>; Body: z.infer<typeof createStageBody> }>(
    '/macro-stages/:mid/stages',
    {
      onRequest: [app.verifySession, app.requireScope('process:cycle:write')],
      schema: {
        params: macroStageIdParam,
        body: createStageBody,
        tags: ['process-modeling'],
        operationId: 'admin_stages_create',
        response: { 201: stageResponse },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

        const result = await request.dipiContainer.createStageUseCase.execute({
          macroStageId: request.params.mid,
          tenantId: request.session.tenantId,
          codigo: request.body.codigo,
          nome: request.body.nome,
          descricao: request.body.descricao ?? null,
          ordem: request.body.ordem,
          isInitial: request.body.is_initial,
          isTerminal: request.body.is_terminal,
          canvasX: request.body.canvas_x ?? null,
          canvasY: request.body.canvas_y ?? null,
          createdBy: request.session.userId,
          correlationId,
        });

        return reply.status(201).send({
          id: result.id,
          macro_stage_id: result.macroStageId,
          cycle_id: result.cycleId,
          codigo: result.codigo,
          nome: result.nome,
          descricao: result.descricao,
          ordem: result.ordem,
          is_initial: result.isInitial,
          is_terminal: result.isTerminal,
          canvas_x: result.canvasX,
          canvas_y: result.canvasY,
        });
      },
    },
  );

  // GET /admin/stages/:id — Detail with gates, roles, transitions (FR-006)
  app.get<{ Params: z.infer<typeof stageIdParam> }>('/stages/:sid', {
    onRequest: [app.verifySession, app.requireScope('process:cycle:read')],
    schema: {
      params: stageIdParam,
      tags: ['process-modeling'],
      operationId: 'admin_stages_get',
      response: { 200: stageDetailResponse },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.getStageDetailUseCase.execute({
        stageId: request.params.sid,
        tenantId: request.session.tenantId,
      });

      return reply.send(result);
    },
  });

  // PATCH /admin/stages/:sid — Update (FR-006, BR-002)
  app.patch<{ Params: z.infer<typeof stageIdParam>; Body: z.infer<typeof updateStageBody> }>(
    '/stages/:sid',
    {
      onRequest: [app.verifySession, app.requireScope('process:cycle:write')],
      schema: {
        params: stageIdParam,
        body: updateStageBody,
        tags: ['process-modeling'],
        operationId: 'admin_stages_update',
        response: { 200: stageResponse },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

        const result = await request.dipiContainer.updateStageUseCase.execute({
          id: request.params.sid,
          tenantId: request.session.tenantId,
          nome: request.body.nome,
          descricao: request.body.descricao,
          ordem: request.body.ordem,
          isInitial: request.body.is_initial,
          isTerminal: request.body.is_terminal,
          canvasX: request.body.canvas_x,
          canvasY: request.body.canvas_y,
          updatedBy: request.session.userId,
          correlationId,
        });

        return reply.send({
          id: result.id,
          macro_stage_id: result.macroStageId,
          cycle_id: result.cycleId,
          codigo: result.codigo,
          nome: result.nome,
          descricao: result.descricao,
          ordem: result.ordem,
          is_initial: result.isInitial,
          is_terminal: result.isTerminal,
          canvas_x: result.canvasX,
          canvas_y: result.canvasY,
        });
      },
    },
  );

  // DELETE /admin/stages/:sid — Soft delete (FR-006, BR-005, INT-005 §4.1)
  app.delete<{ Params: z.infer<typeof stageIdParam> }>('/stages/:sid', {
    onRequest: [app.verifySession, app.requireScope('process:cycle:delete')],
    schema: {
      params: stageIdParam,
      tags: ['process-modeling'],
      operationId: 'admin_stages_delete',
      response: { 204: { type: 'null' as const } },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.deleteStageUseCase.execute({
        id: request.params.sid,
        tenantId: request.session.tenantId,
        deletedBy: request.session.userId,
        correlationId,
      });

      return reply.status(204).send();
    },
  });

  // ---- Gates --------------------------------------------------------------

  // POST /admin/stages/:sid/gates — Create (FR-007)
  app.post<{ Params: z.infer<typeof stageIdParam>; Body: z.infer<typeof createGateBody> }>(
    '/stages/:sid/gates',
    {
      onRequest: [app.verifySession, app.requireScope('process:cycle:write')],
      schema: {
        params: stageIdParam,
        body: createGateBody,
        tags: ['process-modeling'],
        operationId: 'admin_gates_create',
        response: { 201: gateResponse },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

        const result = await request.dipiContainer.createGateUseCase.execute({
          stageId: request.params.sid,
          tenantId: request.session.tenantId,
          nome: request.body.nome,
          descricao: request.body.descricao ?? null,
          gateType: request.body.gate_type,
          required: request.body.required,
          ordem: request.body.ordem,
          createdBy: request.session.userId,
          correlationId,
        });

        return reply.status(201).send({
          id: result.id,
          stage_id: result.stageId,
          nome: result.nome,
          descricao: result.descricao,
          gate_type: result.gateType,
          required: result.required,
          ordem: result.ordem,
        });
      },
    },
  );

  // PATCH /admin/gates/:id — Update (FR-007, BR-012)
  app.patch<{ Params: z.infer<typeof gateIdParam>; Body: z.infer<typeof updateGateBody> }>(
    '/gates/:id',
    {
      onRequest: [app.verifySession, app.requireScope('process:cycle:write')],
      schema: {
        params: gateIdParam,
        body: updateGateBody,
        tags: ['process-modeling'],
        operationId: 'admin_gates_update',
        response: { 200: gateResponse },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

        const result = await request.dipiContainer.updateGateUseCase.execute({
          id: request.params.id,
          tenantId: request.session.tenantId,
          nome: request.body.nome,
          descricao: request.body.descricao,
          gateType: request.body.gate_type,
          required: request.body.required,
          ordem: request.body.ordem,
          updatedBy: request.session.userId,
          correlationId,
        });

        return reply.send({
          id: result.id,
          stage_id: result.stageId,
          nome: result.nome,
          descricao: result.descricao,
          gate_type: result.gateType,
          required: result.required,
          ordem: result.ordem,
        });
      },
    },
  );

  // DELETE /admin/gates/:id — Soft delete (FR-007)
  app.delete<{ Params: z.infer<typeof gateIdParam> }>('/gates/:id', {
    onRequest: [app.verifySession, app.requireScope('process:cycle:delete')],
    schema: {
      params: gateIdParam,
      tags: ['process-modeling'],
      operationId: 'admin_gates_delete',
      response: { 204: { type: 'null' as const } },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.deleteGateUseCase.execute({
        id: request.params.id,
        tenantId: request.session.tenantId,
        deletedBy: request.session.userId,
        correlationId,
      });

      return reply.status(204).send();
    },
  });

  // ---- Stage-Role links ---------------------------------------------------

  // POST /admin/stages/:sid/roles — Link role (FR-009)
  app.post<{ Params: z.infer<typeof stageIdParam>; Body: z.infer<typeof linkStageRoleBody> }>(
    '/stages/:sid/roles',
    {
      onRequest: [app.verifySession, app.requireScope('process:cycle:write')],
      schema: {
        params: stageIdParam,
        body: linkStageRoleBody,
        tags: ['process-modeling'],
        operationId: 'admin_stage_roles_create',
        response: { 201: stageRoleLinkResponse },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

        const result = await request.dipiContainer.linkStageRoleUseCase.execute({
          stageId: request.params.sid,
          roleId: request.body.role_id,
          tenantId: request.session.tenantId,
          required: request.body.required,
          maxAssignees: request.body.max_assignees ?? null,
          createdBy: request.session.userId,
          correlationId,
        });

        return reply.status(201).send({
          id: result.id,
          stage_id: result.stageId,
          role_id: result.roleId,
          required: result.required,
          max_assignees: result.maxAssignees,
        });
      },
    },
  );

  // DELETE /admin/stages/:sid/roles/:rid — Unlink role (FR-009)
  app.delete<{ Params: z.infer<typeof stageRoleParams> }>('/stages/:sid/roles/:rid', {
    onRequest: [app.verifySession, app.requireScope('process:cycle:delete')],
    schema: {
      params: stageRoleParams,
      tags: ['process-modeling'],
      operationId: 'admin_stage_roles_delete',
      response: { 204: { type: 'null' as const } },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.unlinkStageRoleUseCase.execute({
        stageId: request.params.sid,
        roleId: request.params.rid,
        tenantId: request.session.tenantId,
        deletedBy: request.session.userId,
        correlationId,
      });

      return reply.status(204).send();
    },
  });

  // ---- Transitions --------------------------------------------------------

  // POST /admin/stage-transitions — Create (FR-010, BR-008)
  app.post<{ Body: z.infer<typeof createTransitionBody> }>('/stage-transitions', {
    onRequest: [app.verifySession, app.requireScope('process:cycle:write')],
    schema: {
      body: createTransitionBody,
      tags: ['process-modeling'],
      operationId: 'admin_transitions_create',
      response: { 201: transitionResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      const result = await request.dipiContainer.createTransitionUseCase.execute({
        fromStageId: request.body.from_stage_id,
        toStageId: request.body.to_stage_id,
        tenantId: request.session.tenantId,
        nome: request.body.nome,
        condicao: request.body.condicao ?? null,
        gateRequired: request.body.gate_required,
        evidenceRequired: request.body.evidence_required,
        allowedRoles: request.body.allowed_roles ?? null,
        createdBy: request.session.userId,
        correlationId,
      });

      return reply.status(201).send({
        id: result.id,
        from_stage_id: result.fromStageId,
        to_stage_id: result.toStageId,
        nome: result.nome,
        condicao: result.condicao,
        gate_required: result.gateRequired,
        evidence_required: result.evidenceRequired,
        allowed_roles: result.allowedRoles,
      });
    },
  });

  // DELETE /admin/stage-transitions/:id — Delete (FR-010)
  app.delete<{ Params: z.infer<typeof transitionIdParam> }>('/stage-transitions/:id', {
    onRequest: [app.verifySession, app.requireScope('process:cycle:delete')],
    schema: {
      params: transitionIdParam,
      tags: ['process-modeling'],
      operationId: 'admin_transitions_delete',
      response: { 204: { type: 'null' as const } },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.deleteTransitionUseCase.execute({
        id: request.params.id,
        tenantId: request.session.tenantId,
        deletedBy: request.session.userId,
        correlationId,
      });

      return reply.status(204).send();
    },
  });
}
