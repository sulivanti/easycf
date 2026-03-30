/**
 * @contract FR-001, FR-002, FR-003, FR-004, FR-005, SEC-001, BR-012
 *
 * Fastify routes for Organizational Structure (MOD-003).
 * Prefix: /api/v1/org-units
 *
 * 9 endpoints:
 *  - POST   /                     → Create org unit (FR-001)
 *  - GET    /                     → List flat (FR-005)
 *  - GET    /tree                 → Tree query (FR-002)
 *  - GET    /:id                  → Get detail (FR-001)
 *  - PATCH  /:id                  → Update (FR-001)
 *  - DELETE /:id                  → Soft delete (FR-001)
 *  - PATCH  /:id/restore          → Restore (FR-004)
 *  - POST   /:id/tenants          → Link tenant (FR-003)
 *  - DELETE /:id/tenants/:tenantId → Unlink tenant (FR-003)
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import {
  createOrgUnitBody,
  createOrgUnitResponse,
  updateOrgUnitBody,
  updateOrgUnitResponse,
  orgUnitDetailResponse,
  orgUnitsListQuery,
  orgUnitListItem,
  orgUnitTreeResponse,
  linkTenantBody,
  linkTenantResponse,
  orgUnitTenantParams,
} from '../dtos/org-units.dto.js';
import {
  uuidParam,
  paginatedResponse,
  idempotencyKeyHeader,
} from '../../../foundation/presentation/dtos/common.dto.js';

export async function orgUnitsRoutes(app: FastifyInstance): Promise<void> {
  // ---- CRUD ---------------------------------------------------------------

  // POST /org-units — Create (FR-001, BR-012)
  app.post<{ Body: z.infer<typeof createOrgUnitBody> }>('/', {
    onRequest: [app.verifySession, app.requireScope('org:unit:write')],
    schema: {
      body: createOrgUnitBody,
      headers: idempotencyKeyHeader,
      tags: ['org-units'],
      operationId: 'org_units_create',
      response: { 201: createOrgUnitResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;
      const idempotencyKey = request.headers['idempotency-key'] as string | undefined;

      const result = await request.dipiContainer.createOrgUnitUseCase.execute({
        codigo: request.body.codigo,
        nome: request.body.nome,
        descricao: request.body.descricao ?? null,
        parentId: request.body.parent_id ?? null,
        createdBy: request.session.userId,
        correlationId,
        idempotencyKey,
        cnpj: request.body.cnpj,
        razaoSocial: request.body.razao_social,
        filial: request.body.filial,
        responsavel: request.body.responsavel,
        telefone: request.body.telefone,
        emailContato: request.body.email_contato,
      });

      // FR-001: Soft limit warning header
      if (result.limitWarning) {
        void reply.header('X-Limit-Warning', result.limitWarning);
      }

      return reply.status(201).send({
        id: result.id,
        codigo: result.codigo,
        nome: result.nome,
        descricao: result.descricao,
        nivel: result.nivel,
        parent_id: result.parentId,
        status: result.status,
        cnpj: result.cnpj,
        razao_social: result.razaoSocial,
        filial: result.filial,
        responsavel: result.responsavel,
        telefone: result.telefone,
        email_contato: result.emailContato,
      });
    },
  });

  // GET /org-units — List flat (FR-005)
  app.get<{ Querystring: z.infer<typeof orgUnitsListQuery> }>('/', {
    onRequest: [app.verifySession, app.requireScope('org:unit:read')],
    schema: {
      querystring: orgUnitsListQuery,
      tags: ['org-units'],
      operationId: 'org_units_list',
      response: { 200: paginatedResponse(orgUnitListItem) },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.listOrgUnitsUseCase.execute({
        nivel: request.query.nivel,
        status: request.query.status,
        parentId: request.query.parent_id,
        search: request.query.search,
        cursor: request.query.cursor,
        limit: request.query.limit,
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return reply.status(200).send({
        data: result.data.map((item: Record<string, any>) => ({
          id: item.id,
          codigo: item.codigo,
          nome: item.nome,
          nivel: item.nivel,
          status: item.status,
          parent_id: item.parentId ?? null,
          created_at:
            item.createdAt instanceof Date ? item.createdAt.toISOString() : item.createdAt,
        })),
        next_cursor: result.nextCursor,
        has_more: result.hasMore,
      });
    },
  });

  // GET /org-units/tree — Tree query (FR-002)
  app.get('/tree', {
    onRequest: [app.verifySession, app.requireScope('org:unit:read')],
    schema: {
      tags: ['org-units'],
      operationId: 'org_units_tree',
      response: { 200: orgUnitTreeResponse },
    },
    handler: async (request, reply) => {
      try {
        const result = await request.dipiContainer.getOrgUnitTreeUseCase.execute();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        function mapTreeNode(node: Record<string, any>): Record<string, any> {
          return {
            id: node.id,
            codigo: node.codigo,
            nome: node.nome,
            descricao: node.descricao,
            nivel: node.nivel,
            status: node.status,
            tenants: node.tenants.map((t: Record<string, any>) => ({
              tenant_id: t.tenantId,
              codigo: t.codigo,
              name: t.name,
            })),
            children: node.children.map(mapTreeNode),
          };
        }

        return reply.status(200).send({
          tree: result.tree.map(mapTreeNode),
        });
      } catch (err) {
        request.log.error({ err, stack: (err as Error).stack }, 'GET /org-units/tree failed');
        throw err;
      }
    },
  });

  // GET /org-units/:id — Detail with ancestors + tenants (FR-001)
  app.get<{ Params: z.infer<typeof uuidParam> }>('/:id', {
    onRequest: [app.verifySession, app.requireScope('org:unit:read')],
    schema: {
      params: uuidParam,
      tags: ['org-units'],
      operationId: 'org_units_get',
      response: { 200: orgUnitDetailResponse },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.getOrgUnitUseCase.execute({
        id: request.params.id,
      });

      return reply.status(200).send({
        id: result.id,
        codigo: result.codigo,
        nome: result.nome,
        descricao: result.descricao ?? null,
        nivel: result.nivel,
        parent_id: result.parentId ?? null,
        status: result.status,
        created_by: result.createdBy ?? null,
        created_at:
          result.createdAt instanceof Date ? result.createdAt.toISOString() : result.createdAt,
        updated_at:
          result.updatedAt instanceof Date ? result.updatedAt.toISOString() : result.updatedAt,
        deleted_at: result.deletedAt
          ? result.deletedAt instanceof Date
            ? result.deletedAt.toISOString()
            : result.deletedAt
          : null,
        cnpj: result.cnpj ?? null,
        razao_social: result.razaoSocial ?? null,
        filial: result.filial ?? null,
        responsavel: result.responsavel ?? null,
        telefone: result.telefone ?? null,
        email_contato: result.emailContato ?? null,
        ancestors: result.ancestors,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        tenants: result.tenants.map((t: Record<string, any>) => ({
          tenant_id: t.tenantId,
          codigo: t.codigo,
          name: t.name,
        })),
      });
    },
  });

  // PATCH /org-units/:id — Update (FR-001, BR-003, BR-010)
  app.patch<{ Params: z.infer<typeof uuidParam>; Body: z.infer<typeof updateOrgUnitBody> }>(
    '/:id',
    {
      onRequest: [app.verifySession, app.requireScope('org:unit:write')],
      schema: {
        params: uuidParam,
        body: updateOrgUnitBody,
        tags: ['org-units'],
        operationId: 'org_units_update',
        response: { 200: updateOrgUnitResponse },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

        const result = await request.dipiContainer.updateOrgUnitUseCase.execute({
          id: request.params.id,
          nome: request.body.nome,
          descricao: request.body.descricao,
          codigo: request.body.codigo,
          parentId: request.body.parent_id,
          cnpj: request.body.cnpj,
          razaoSocial: request.body.razao_social,
          filial: request.body.filial,
          responsavel: request.body.responsavel,
          telefone: request.body.telefone,
          emailContato: request.body.email_contato,
          correlationId,
          updatedBy: request.session.userId,
        });

        return reply.status(200).send({
          id: result.id,
          codigo: result.codigo,
          nome: result.nome,
          descricao: result.descricao ?? null,
          nivel: result.nivel,
          status: result.status,
          cnpj: result.cnpj ?? null,
          razao_social: result.razaoSocial ?? null,
          filial: result.filial ?? null,
          responsavel: result.responsavel ?? null,
          telefone: result.telefone ?? null,
          email_contato: result.emailContato ?? null,
        });
      },
    },
  );

  // DELETE /org-units/:id — Soft delete (FR-001, BR-005)
  app.delete<{ Params: z.infer<typeof uuidParam> }>('/:id', {
    onRequest: [app.verifySession, app.requireScope('org:unit:delete')],
    schema: {
      params: uuidParam,
      tags: ['org-units'],
      operationId: 'org_units_delete',
      response: {
        200: { type: 'object' as const, properties: { message: { type: 'string' as const } } },
      },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.deleteOrgUnitUseCase.execute({
        id: request.params.id,
        correlationId,
        deletedBy: request.session.userId,
      });

      return reply.status(200).send({ message: 'Unidade organizacional desativada.' });
    },
  });

  // ---- Restore (FR-004) ---------------------------------------------------

  // PATCH /org-units/:id/restore
  app.patch<{ Params: z.infer<typeof uuidParam> }>('/:id/restore', {
    onRequest: [app.verifySession, app.requireScope('org:unit:write')],
    schema: {
      params: uuidParam,
      tags: ['org-units'],
      operationId: 'org_units_restore',
      response: {
        200: { type: 'object' as const, properties: { message: { type: 'string' as const } } },
      },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.restoreOrgUnitUseCase.execute({
        id: request.params.id,
        correlationId,
        restoredBy: request.session.userId,
      });

      return reply.status(200).send({ message: 'Unidade organizacional restaurada.' });
    },
  });

  // ---- Tenant Links (FR-003) ----------------------------------------------

  // POST /org-units/:id/tenants — Link tenant (BR-006, BR-012)
  app.post<{ Params: z.infer<typeof uuidParam>; Body: z.infer<typeof linkTenantBody> }>(
    '/:id/tenants',
    {
      onRequest: [app.verifySession, app.requireScope('org:unit:write')],
      schema: {
        params: uuidParam,
        body: linkTenantBody,
        headers: idempotencyKeyHeader,
        tags: ['org-units'],
        operationId: 'org_units_link_tenant',
        response: { 201: linkTenantResponse },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;
        const idempotencyKey = request.headers['idempotency-key'] as string | undefined;

        const result = await request.dipiContainer.linkTenantUseCase.execute({
          orgUnitId: request.params.id,
          tenantId: request.body.tenant_id,
          createdBy: request.session.userId,
          correlationId,
          idempotencyKey,
        });

        return reply.status(201).send({
          id: result.id,
          org_unit_id: result.orgUnitId,
          tenant_id: result.tenantId,
          tenant_codigo: result.tenantCodigo,
        });
      },
    },
  );

  // DELETE /org-units/:id/tenants/:tenantId — Unlink tenant
  app.delete<{ Params: z.infer<typeof orgUnitTenantParams> }>('/:id/tenants/:tenantId', {
    onRequest: [app.verifySession, app.requireScope('org:unit:delete')],
    schema: {
      params: orgUnitTenantParams,
      tags: ['org-units'],
      operationId: 'org_units_unlink_tenant',
      response: {
        200: { type: 'object' as const, properties: { message: { type: 'string' as const } } },
      },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.unlinkTenantUseCase.execute({
        orgUnitId: request.params.id,
        tenantId: request.params.tenantId,
        correlationId,
        deletedBy: request.session.userId,
      });

      return reply.status(200).send({ message: 'Tenant desvinculado.' });
    },
  });
}
