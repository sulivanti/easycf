// @contract DATA-001, DOC-ARC-004
//
// Drizzle-based repository implementations for Identity Advanced module (MOD-004).

import { eq, and, lt, desc, isNull } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  userOrgScopes,
  accessShares,
  accessDelegations,
} from '../../../../db/schema/identity-advanced.js';
import { orgUnits } from '../../../../db/schema/org-units.js';
import { tenantUsers } from '../../../../db/schema/foundation.js';
import type {
  OrgScopeRepository,
  OrgScopeWithBreadcrumb,
  AccessShareRepository,
  AccessShareListFilters,
  AccessDelegationRepository,
} from '../application/ports/repositories.js';
import type {
  TransactionContext,
  PaginationParams,
  PaginatedResult,
} from '../../foundation/application/ports/repositories.js';
import type { UserOrgScopeProps } from '../domain/aggregates/user-org-scope.js';
import type { AccessShareProps } from '../domain/aggregates/access-share.js';
import type { AccessDelegationProps } from '../domain/aggregates/access-delegation.js';
import type { UserLookupPort, OrgUnitInfo } from '../application/ports/services.js';
import type { RedisCachePort } from '../application/ports/services.js';

type Conn = PostgresJsDatabase;
function conn(db: Conn, tx?: TransactionContext): Conn {
  return (tx ?? db) as Conn;
}

// ─────────────────────────────────────────────────────────────────────────────
// OrgScopeRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleOrgScopeRepository implements OrgScopeRepository {
  constructor(private db: Conn) {}

  async findById(id: string, tx?: TransactionContext): Promise<UserOrgScopeProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(userOrgScopes)
      .where(eq(userOrgScopes.id, id))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async listByUser(
    tenantId: string,
    userId: string,
    tx?: TransactionContext,
  ): Promise<readonly OrgScopeWithBreadcrumb[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select({
        scope: userOrgScopes,
        orgId: orgUnits.id,
        orgCodigo: orgUnits.codigo,
        orgNome: orgUnits.nome,
        orgNivel: orgUnits.nivel,
      })
      .from(userOrgScopes)
      .innerJoin(orgUnits, eq(userOrgScopes.orgUnitId, orgUnits.id))
      .where(
        and(
          eq(userOrgScopes.tenantId, tenantId),
          eq(userOrgScopes.userId, userId),
          isNull(userOrgScopes.deletedAt),
        ),
      )
      .orderBy(desc(userOrgScopes.createdAt));

    return rows.map((r) => ({
      ...this.toDomain(r.scope),
      orgUnit: {
        id: r.orgId,
        codigo: r.orgCodigo,
        nome: r.orgNome,
        nivel: r.orgNivel as number,
      },
    }));
  }

  async countActivePrimary(userId: string, tx?: TransactionContext): Promise<number> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(userOrgScopes)
      .where(
        and(
          eq(userOrgScopes.userId, userId),
          eq(userOrgScopes.scopeType, 'PRIMARY'),
          eq(userOrgScopes.status, 'ACTIVE'),
          isNull(userOrgScopes.deletedAt),
        ),
      );
    return rows.length;
  }

  async findByUserAndOrgUnit(
    userId: string,
    orgUnitId: string,
    tx?: TransactionContext,
  ): Promise<UserOrgScopeProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(userOrgScopes)
      .where(
        and(
          eq(userOrgScopes.userId, userId),
          eq(userOrgScopes.orgUnitId, orgUnitId),
          isNull(userOrgScopes.deletedAt),
        ),
      )
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async create(scope: UserOrgScopeProps, tx?: TransactionContext): Promise<UserOrgScopeProps> {
    const c = conn(this.db, tx);
    const [row] = await c.insert(userOrgScopes).values(this.toRow(scope)).returning();
    return this.toDomain(row);
  }

  async update(scope: UserOrgScopeProps, tx?: TransactionContext): Promise<UserOrgScopeProps> {
    const c = conn(this.db, tx);
    const [row] = await c
      .update(userOrgScopes)
      .set({
        scopeType: scope.scopeType,
        status: scope.status,
        validUntil: scope.validUntil,
        updatedAt: scope.updatedAt,
        deletedAt: scope.deletedAt,
      })
      .where(eq(userOrgScopes.id, scope.id))
      .returning();
    return this.toDomain(row);
  }

  async findExpired(
    now: Date,
    limit: number,
    tx?: TransactionContext,
  ): Promise<readonly UserOrgScopeProps[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(userOrgScopes)
      .where(
        and(
          eq(userOrgScopes.status, 'ACTIVE'),
          lt(userOrgScopes.validUntil, now),
        ),
      )
      .limit(limit);
    return rows.map((r) => this.toDomain(r));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(row: any): UserOrgScopeProps {
    return {
      id: row.id,
      tenantId: row.tenantId,
      userId: row.userId,
      orgUnitId: row.orgUnitId,
      scopeType: row.scopeType,
      grantedBy: row.grantedBy,
      validFrom: row.validFrom,
      validUntil: row.validUntil,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }

  private toRow(props: UserOrgScopeProps) {
    return {
      id: props.id,
      tenantId: props.tenantId,
      userId: props.userId,
      orgUnitId: props.orgUnitId,
      scopeType: props.scopeType,
      grantedBy: props.grantedBy,
      validFrom: props.validFrom,
      validUntil: props.validUntil,
      status: props.status,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      deletedAt: props.deletedAt,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AccessShareRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleAccessShareRepository implements AccessShareRepository {
  constructor(private db: Conn) {}

  async findById(id: string, tx?: TransactionContext): Promise<AccessShareProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(accessShares)
      .where(eq(accessShares.id, id))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async list(
    tenantId: string,
    filters: AccessShareListFilters,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<AccessShareProps>> {
    const c = conn(this.db, tx);
    const limit = params.limit + 1;
    const conditions = [eq(accessShares.tenantId, tenantId)];

    if (filters.status) conditions.push(eq(accessShares.status, filters.status));
    if (filters.granteeId) conditions.push(eq(accessShares.granteeId, filters.granteeId));
    if (filters.grantorId) conditions.push(eq(accessShares.grantorId, filters.grantorId));

    const rows = await c
      .select()
      .from(accessShares)
      .where(and(...conditions))
      .orderBy(desc(accessShares.createdAt))
      .limit(limit);

    const hasMore = rows.length > params.limit;
    const data = rows.slice(0, params.limit);
    return {
      data: data.map((r) => this.toDomain(r)),
      nextCursor: hasMore ? data[data.length - 1].id : null,
      hasMore,
    };
  }

  async listByGrantee(
    tenantId: string,
    granteeId: string,
    tx?: TransactionContext,
  ): Promise<readonly AccessShareProps[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(accessShares)
      .where(
        and(
          eq(accessShares.tenantId, tenantId),
          eq(accessShares.granteeId, granteeId),
          eq(accessShares.status, 'ACTIVE'),
        ),
      )
      .orderBy(desc(accessShares.createdAt));
    return rows.map((r) => this.toDomain(r));
  }

  async create(share: AccessShareProps, tx?: TransactionContext): Promise<AccessShareProps> {
    const c = conn(this.db, tx);
    const [row] = await c.insert(accessShares).values(this.toRow(share)).returning();
    return this.toDomain(row);
  }

  async update(share: AccessShareProps, tx?: TransactionContext): Promise<AccessShareProps> {
    const c = conn(this.db, tx);
    const [row] = await c
      .update(accessShares)
      .set({
        status: share.status,
        updatedAt: share.updatedAt,
        revokedAt: share.revokedAt,
        revokedBy: share.revokedBy,
      })
      .where(eq(accessShares.id, share.id))
      .returning();
    return this.toDomain(row);
  }

  async findExpired(
    now: Date,
    limit: number,
    tx?: TransactionContext,
  ): Promise<readonly AccessShareProps[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(accessShares)
      .where(
        and(
          eq(accessShares.status, 'ACTIVE'),
          lt(accessShares.validUntil, now),
        ),
      )
      .limit(limit);
    return rows.map((r) => this.toDomain(r));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(row: any): AccessShareProps {
    return {
      id: row.id,
      tenantId: row.tenantId,
      grantorId: row.grantorId,
      granteeId: row.granteeId,
      resourceType: row.resourceType,
      resourceId: row.resourceId,
      allowedActions: row.allowedActions as string[],
      reason: row.reason,
      authorizedBy: row.authorizedBy,
      validFrom: row.validFrom,
      validUntil: row.validUntil,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      revokedAt: row.revokedAt,
      revokedBy: row.revokedBy,
    };
  }

  private toRow(props: AccessShareProps) {
    return {
      id: props.id,
      tenantId: props.tenantId,
      grantorId: props.grantorId,
      granteeId: props.granteeId,
      resourceType: props.resourceType,
      resourceId: props.resourceId,
      allowedActions: props.allowedActions,
      reason: props.reason,
      authorizedBy: props.authorizedBy,
      validFrom: props.validFrom,
      validUntil: props.validUntil,
      status: props.status,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      revokedAt: props.revokedAt,
      revokedBy: props.revokedBy,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AccessDelegationRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleAccessDelegationRepository implements AccessDelegationRepository {
  constructor(private db: Conn) {}

  async findById(id: string, tx?: TransactionContext): Promise<AccessDelegationProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(accessDelegations)
      .where(eq(accessDelegations.id, id))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async listGivenByUser(
    tenantId: string,
    delegatorId: string,
    tx?: TransactionContext,
  ): Promise<readonly AccessDelegationProps[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(accessDelegations)
      .where(
        and(
          eq(accessDelegations.tenantId, tenantId),
          eq(accessDelegations.delegatorId, delegatorId),
          eq(accessDelegations.status, 'ACTIVE'),
        ),
      )
      .orderBy(desc(accessDelegations.createdAt));
    return rows.map((r) => this.toDomain(r));
  }

  async listReceivedByUser(
    tenantId: string,
    delegateeId: string,
    tx?: TransactionContext,
  ): Promise<readonly AccessDelegationProps[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(accessDelegations)
      .where(
        and(
          eq(accessDelegations.tenantId, tenantId),
          eq(accessDelegations.delegateeId, delegateeId),
          eq(accessDelegations.status, 'ACTIVE'),
        ),
      )
      .orderBy(desc(accessDelegations.createdAt));
    return rows.map((r) => this.toDomain(r));
  }

  async getActiveDelegatedScopes(
    tenantId: string,
    userId: string,
    tx?: TransactionContext,
  ): Promise<readonly string[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select({ delegatedScopes: accessDelegations.delegatedScopes })
      .from(accessDelegations)
      .where(
        and(
          eq(accessDelegations.tenantId, tenantId),
          eq(accessDelegations.delegateeId, userId),
          eq(accessDelegations.status, 'ACTIVE'),
        ),
      );
    // Flatten all delegated scopes into a unique list
    const all = rows.flatMap((r) => r.delegatedScopes as string[]);
    return [...new Set(all)];
  }

  async create(
    delegation: AccessDelegationProps,
    tx?: TransactionContext,
  ): Promise<AccessDelegationProps> {
    const c = conn(this.db, tx);
    const [row] = await c.insert(accessDelegations).values(this.toRow(delegation)).returning();
    return this.toDomain(row);
  }

  async update(
    delegation: AccessDelegationProps,
    tx?: TransactionContext,
  ): Promise<AccessDelegationProps> {
    const c = conn(this.db, tx);
    const [row] = await c
      .update(accessDelegations)
      .set({
        status: delegation.status,
        updatedAt: delegation.updatedAt,
        revokedAt: delegation.revokedAt,
      })
      .where(eq(accessDelegations.id, delegation.id))
      .returning();
    return this.toDomain(row);
  }

  async findExpired(
    now: Date,
    limit: number,
    tx?: TransactionContext,
  ): Promise<readonly AccessDelegationProps[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(accessDelegations)
      .where(
        and(
          eq(accessDelegations.status, 'ACTIVE'),
          lt(accessDelegations.validUntil, now),
        ),
      )
      .limit(limit);
    return rows.map((r) => this.toDomain(r));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(row: any): AccessDelegationProps {
    return {
      id: row.id,
      tenantId: row.tenantId,
      delegatorId: row.delegatorId,
      delegateeId: row.delegateeId,
      roleId: row.roleId,
      orgUnitId: row.orgUnitId,
      delegatedScopes: row.delegatedScopes as string[],
      reason: row.reason,
      validUntil: row.validUntil,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      revokedAt: row.revokedAt,
    };
  }

  private toRow(props: AccessDelegationProps) {
    return {
      id: props.id,
      tenantId: props.tenantId,
      delegatorId: props.delegatorId,
      delegateeId: props.delegateeId,
      roleId: props.roleId,
      orgUnitId: props.orgUnitId,
      delegatedScopes: props.delegatedScopes,
      reason: props.reason,
      validUntil: props.validUntil,
      status: props.status,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt,
      revokedAt: props.revokedAt,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UserLookupPort — Cross-module lookups (MOD-000 users, MOD-003 org_units)
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleUserLookupAdapter implements UserLookupPort {
  constructor(private db: Conn) {}

  async userExistsInTenant(
    userId: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<boolean> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select({ userId: tenantUsers.userId })
      .from(tenantUsers)
      .where(
        and(
          eq(tenantUsers.userId, userId),
          eq(tenantUsers.tenantId, tenantId),
          isNull(tenantUsers.deletedAt),
        ),
      )
      .limit(1);
    return !!row;
  }

  async getOrgUnitInfo(
    orgUnitId: string,
    tx?: TransactionContext,
  ): Promise<OrgUnitInfo | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select({
        id: orgUnits.id,
        nivel: orgUnits.nivel,
        status: orgUnits.status,
      })
      .from(orgUnits)
      .where(and(eq(orgUnits.id, orgUnitId), isNull(orgUnits.deletedAt)))
      .limit(1);
    if (!row) return null;
    return { id: row.id, nivel: row.nivel as number, status: row.status as 'ACTIVE' | 'INACTIVE' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RedisCachePort — Stub (in-memory noop until Redis is wired)
// ─────────────────────────────────────────────────────────────────────────────

export class StubRedisCacheAdapter implements RedisCachePort {
  async invalidateOrgScopeCache(_userId: string): Promise<void> {
    // noop — will be replaced by real Redis adapter when INT-001.1 is wired
  }
}
