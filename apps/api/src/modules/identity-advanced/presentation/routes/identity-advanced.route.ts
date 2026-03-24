/**
 * @contract FR-001.1, FR-001.2, FR-001.3, SEC-001, EX-OAS-001, DOC-FND-000
 *
 * Fastify routes for Identity Advanced (MOD-004).
 *
 * 11 endpoints:
 *  - GET    /admin/users/:id/org-scopes          → List org scopes (F01)
 *  - POST   /admin/users/:id/org-scopes          → Create org scope (F01)
 *  - DELETE /admin/users/:id/org-scopes/:scopeId  → Delete org scope (F01)
 *  - GET    /my/org-scopes                        → Self-service org scopes (F01)
 *  - POST   /admin/access-shares                  → Create share (F02)
 *  - GET    /admin/access-shares                  → List shares (F02)
 *  - DELETE /admin/access-shares/:id              → Revoke share (F02)
 *  - GET    /my/shared-accesses                   → Self-service shares (F02)
 *  - POST   /access-delegations                   → Create delegation (F03)
 *  - GET    /access-delegations                   → List delegations (F03)
 *  - DELETE /access-delegations/:id               → Revoke delegation (F03)
 */

import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import {
  userIdParam,
  userScopeParams,
  shareIdParam,
  delegationIdParam,
  createOrgScopeBody,
  createOrgScopeResponse,
  orgScopeListResponse,
  createAccessShareBody,
  createAccessShareResponse,
  accessSharesListQuery,
  accessShareListItem,
  createAccessDelegationBody,
  createAccessDelegationResponse,
  delegationListResponse,
} from '../dtos/identity-advanced.dto.js';
import {
  idempotencyKeyHeader,
  paginatedResponse,
} from '../../../foundation/presentation/dtos/common.dto.js';

// ============================================================================
// F01 — Org Scopes (admin + self-service)
// ============================================================================

export async function adminOrgScopesRoutes(app: FastifyInstance): Promise<void> {
  // GET /admin/users/:id/org-scopes — List org scopes for a user
  app.get<{ Params: z.infer<typeof userIdParam> }>('/:id/org-scopes', {
    onRequest: [app.verifySession, app.requireScope('identity:org_scope:read')],
    schema: {
      params: userIdParam,
      tags: ['identity-advanced'],
      operationId: 'admin_user_org_scopes_list',
      response: { 200: orgScopeListResponse },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.listOrgScopesUseCase.execute({
        tenantId: request.session.tenantId,
        userId: request.params.id,
      });

      return reply.status(200).send(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result.map((s: Record<string, any>) => ({
          id: s.id,
          scope_type: s.scopeType,
          org_unit: s.orgUnit,
          valid_from: s.validFrom,
          valid_until: s.validUntil,
          status: s.status,
        })),
      );
    },
  });

  // POST /admin/users/:id/org-scopes — Create org scope
  app.post<{ Params: z.infer<typeof userIdParam>; Body: z.infer<typeof createOrgScopeBody> }>(
    '/:id/org-scopes',
    {
      onRequest: [app.verifySession, app.requireScope('identity:org_scope:write')],
      schema: {
        params: userIdParam,
        body: createOrgScopeBody,
        headers: idempotencyKeyHeader,
        tags: ['identity-advanced'],
        operationId: 'admin_user_org_scopes_create',
        response: { 201: createOrgScopeResponse },
      },
      handler: async (request, reply) => {
        const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;
        const idempotencyKey = request.headers['idempotency-key'] as string | undefined;

        const result = await request.dipiContainer.createOrgScopeUseCase.execute({
          tenantId: request.session.tenantId,
          userId: request.params.id,
          orgUnitId: request.body.org_unit_id,
          scopeType: request.body.scope_type,
          grantedBy: request.body.granted_by ?? request.session.userId,
          validUntil: request.body.valid_until ? new Date(request.body.valid_until) : null,
          correlationId,
          idempotencyKey,
        });

        return reply.status(201).send({
          id: result.id,
          user_id: result.userId,
          org_unit_id: result.orgUnitId,
          scope_type: result.scopeType,
          status: result.status,
          valid_from: result.validFrom,
          valid_until: result.validUntil,
        });
      },
    },
  );

  // DELETE /admin/users/:id/org-scopes/:scopeId — Revoke org scope
  app.delete<{ Params: z.infer<typeof userScopeParams> }>('/:id/org-scopes/:scopeId', {
    onRequest: [app.verifySession, app.requireScope('identity:org_scope:write')],
    schema: {
      params: userScopeParams,
      tags: ['identity-advanced'],
      operationId: 'admin_user_org_scopes_delete',
      response: { 204: { type: 'null' as const } },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.deleteOrgScopeUseCase.execute({
        tenantId: request.session.tenantId,
        scopeId: request.params.scopeId,
        correlationId,
        deletedBy: request.session.userId,
      });

      return reply.status(204).send();
    },
  });
}

export async function myOrgScopesRoutes(app: FastifyInstance): Promise<void> {
  // GET /my/org-scopes — Self-service (own user, no scope required)
  app.get('/org-scopes', {
    onRequest: [app.verifySession],
    schema: {
      tags: ['identity-advanced'],
      operationId: 'my_org_scopes',
      response: { 200: orgScopeListResponse },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.listOrgScopesUseCase.execute({
        tenantId: request.session.tenantId,
        userId: request.session.userId,
      });

      return reply.status(200).send(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result.map((s: Record<string, any>) => ({
          id: s.id,
          scope_type: s.scopeType,
          org_unit: s.orgUnit,
          valid_from: s.validFrom,
          valid_until: s.validUntil,
          status: s.status,
        })),
      );
    },
  });
}

// ============================================================================
// F02 — Access Shares (admin + self-service)
// ============================================================================

export async function adminAccessSharesRoutes(app: FastifyInstance): Promise<void> {
  // POST /admin/access-shares — Create share
  app.post<{ Body: z.infer<typeof createAccessShareBody> }>('/', {
    onRequest: [app.verifySession, app.requireScope('identity:share:write')],
    schema: {
      body: createAccessShareBody,
      headers: idempotencyKeyHeader,
      tags: ['identity-advanced'],
      operationId: 'admin_access_shares_create',
      response: { 201: createAccessShareResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;
      const idempotencyKey = request.headers['idempotency-key'] as string | undefined;

      const result = await request.dipiContainer.createAccessShareUseCase.execute({
        tenantId: request.session.tenantId,
        grantorId: request.body.grantor_id,
        granteeId: request.body.grantee_id,
        resourceType: request.body.resource_type,
        resourceId: request.body.resource_id,
        allowedActions: request.body.allowed_actions,
        reason: request.body.reason,
        authorizedBy: request.body.authorized_by,
        validUntil: new Date(request.body.valid_until),
        callerScopes: request.session.scopes ?? [],
        correlationId,
        idempotencyKey,
      });

      return reply.status(201).send({
        id: result.id,
        grantor_id: result.grantorId,
        grantee_id: result.granteeId,
        resource_type: result.resourceType,
        resource_id: result.resourceId,
        status: result.status,
        valid_from: result.validFrom,
        valid_until: result.validUntil,
      });
    },
  });

  // GET /admin/access-shares — List shares (admin, paginated)
  app.get<{ Querystring: z.infer<typeof accessSharesListQuery> }>('/', {
    onRequest: [app.verifySession, app.requireScope('identity:share:read')],
    schema: {
      querystring: accessSharesListQuery,
      tags: ['identity-advanced'],
      operationId: 'admin_access_shares_list',
      response: { 200: paginatedResponse(accessShareListItem) },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.listAccessSharesUseCase.execute({
        tenantId: request.session.tenantId,
        status: request.query.status,
        granteeId: request.query.grantee_id,
        cursor: request.query.cursor,
        limit: request.query.limit,
      });

      return reply.status(200).send({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: result.data.map((s: Record<string, any>) => ({
          id: s.id,
          grantor_id: s.grantorId,
          grantee_id: s.granteeId,
          resource_type: s.resourceType,
          resource_id: s.resourceId,
          allowed_actions: s.allowedActions,
          reason: s.reason,
          authorized_by: s.authorizedBy,
          valid_from: s.validFrom,
          valid_until: s.validUntil,
          status: s.status,
          revoked_at: s.revokedAt,
          revoked_by: s.revokedBy,
          created_at: s.createdAt,
        })),
        next_cursor: result.nextCursor,
        has_more: result.hasMore,
      });
    },
  });

  // DELETE /admin/access-shares/:id — Revoke share
  app.delete<{ Params: z.infer<typeof shareIdParam> }>('/:id', {
    onRequest: [app.verifySession, app.requireScope('identity:share:revoke')],
    schema: {
      params: shareIdParam,
      tags: ['identity-advanced'],
      operationId: 'admin_access_shares_revoke',
      response: { 204: { type: 'null' as const } },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.revokeAccessShareUseCase.execute({
        tenantId: request.session.tenantId,
        shareId: request.params.id,
        revokedBy: request.session.userId,
        correlationId,
      });

      return reply.status(204).send();
    },
  });
}

export async function mySharedAccessesRoutes(app: FastifyInstance): Promise<void> {
  // GET /my/shared-accesses — Self-service (own received shares)
  app.get('/shared-accesses', {
    onRequest: [app.verifySession],
    schema: {
      tags: ['identity-advanced'],
      operationId: 'my_shared_accesses',
      response: {
        200: {
          type: 'array' as const,
          items: accessShareListItem,
        },
      },
    },
    handler: async (request, reply) => {
      const result = await request.dipiContainer.listMySharedAccessesUseCase.execute({
        tenantId: request.session.tenantId,
        granteeId: request.session.userId,
      });

      return reply.status(200).send(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        result.map((s: Record<string, any>) => ({
          id: s.id,
          grantor_id: s.grantorId,
          grantee_id: s.granteeId,
          resource_type: s.resourceType,
          resource_id: s.resourceId,
          allowed_actions: s.allowedActions,
          reason: s.reason,
          authorized_by: s.authorizedBy,
          valid_from: s.validFrom,
          valid_until: s.validUntil,
          status: s.status,
          revoked_at: s.revokedAt,
          revoked_by: s.revokedBy,
          created_at: s.createdAt,
        })),
      );
    },
  });
}

// ============================================================================
// F03 — Access Delegations (self-service)
// ============================================================================

export async function accessDelegationsRoutes(app: FastifyInstance): Promise<void> {
  // POST /access-delegations — Create delegation (own user)
  app.post<{ Body: z.infer<typeof createAccessDelegationBody> }>('/', {
    onRequest: [app.verifySession],
    schema: {
      body: createAccessDelegationBody,
      headers: idempotencyKeyHeader,
      tags: ['identity-advanced'],
      operationId: 'access_delegations_create',
      response: { 201: createAccessDelegationResponse },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;
      const idempotencyKey = request.headers['idempotency-key'] as string | undefined;

      const result = await request.dipiContainer.createAccessDelegationUseCase.execute({
        tenantId: request.session.tenantId,
        delegatorId: request.session.userId,
        delegateeId: request.body.delegatee_id,
        roleId: request.body.role_id,
        orgUnitId: request.body.org_unit_id,
        delegatedScopes: request.body.delegated_scopes,
        reason: request.body.reason,
        validUntil: new Date(request.body.valid_until),
        ownedScopes: request.session.scopes ?? [],
        correlationId,
        idempotencyKey,
      });

      return reply.status(201).send({
        id: result.id,
        delegator_id: result.delegatorId,
        delegatee_id: result.delegateeId,
        delegated_scopes: result.delegatedScopes,
        status: result.status,
        valid_until: result.validUntil,
      });
    },
  });

  // GET /access-delegations — List delegations (given + received)
  app.get('/', {
    onRequest: [app.verifySession],
    schema: {
      tags: ['identity-advanced'],
      operationId: 'access_delegations_list',
      response: { 200: delegationListResponse },
    },
    handler: async (request, reply) => {
      const tenantId = request.session.tenantId;
      const userId = request.session.userId;

      const [given, received] = await Promise.all([
        request.dipiContainer.delegationRepo.listGivenByUser(tenantId, userId),
        request.dipiContainer.delegationRepo.listReceivedByUser(tenantId, userId),
      ]);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapItem = (d: Record<string, any>) => ({
        id: d.id,
        delegator_id: d.delegatorId,
        delegatee_id: d.delegateeId,
        role_id: d.roleId,
        org_unit_id: d.orgUnitId,
        delegated_scopes: d.delegatedScopes,
        reason: d.reason,
        valid_until: d.validUntil.toISOString(),
        status: d.status,
        created_at: d.createdAt.toISOString(),
        revoked_at: d.revokedAt?.toISOString() ?? null,
      });

      return reply.status(200).send({
        given: given.map(mapItem),
        received: received.map(mapItem),
      });
    },
  });

  // DELETE /access-delegations/:id — Revoke delegation (only delegator)
  app.delete<{ Params: z.infer<typeof delegationIdParam> }>('/:id', {
    onRequest: [app.verifySession],
    schema: {
      params: delegationIdParam,
      tags: ['identity-advanced'],
      operationId: 'access_delegations_revoke',
      response: { 204: { type: 'null' as const } },
    },
    handler: async (request, reply) => {
      const correlationId = (request.headers['x-correlation-id'] as string) ?? request.id;

      await request.dipiContainer.revokeAccessDelegationUseCase.execute({
        tenantId: request.session.tenantId,
        delegationId: request.params.id,
        callerId: request.session.userId,
        correlationId,
      });

      return reply.status(204).send();
    },
  });
}
