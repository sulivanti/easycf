// @contract DATA-000, DOC-ARC-004
//
// Drizzle-based repository implementations for Foundation module (MOD-000).
// Maps between DB rows and domain Props, handling Value Object hydration.

import { eq, and, isNull, desc } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  users,
  contentUsers,
  userSessions,
  tenants,
  roles,
  rolePermissions,
  tenantUsers,
  domainEvents,
} from '../../../../db/schema/foundation.js';
import { Email } from '../domain/value-objects/email.vo.js';
import { Scope } from '../domain/value-objects/scope.vo.js';
import type {
  UserRepository,
  SessionRepository,
  TenantRepository,
  RoleRepository,
  TenantUserRepository,
  DomainEventRepository,
  PasswordResetTokenRepository,
  UnitOfWork,
  TransactionContext,
  PaginationParams,
  PaginatedResult,
} from '../application/ports/repositories.js';
import type { UserProps, UserProfile } from '../domain/entities/user.entity.js';
import type { SessionProps } from '../domain/entities/session.entity.js';
import type { TenantProps } from '../domain/entities/tenant.entity.js';
import type { RoleProps } from '../domain/entities/role.entity.js';
import type { TenantUserProps } from '../domain/entities/tenant-user.entity.js';
import type { DomainEventBase } from '../domain/events/foundation-events.js';
import type { PasswordResetTokenProps } from '../domain/value-objects/password-reset-token.vo.js';

// Utility: resolve connection (tx or db)
type Conn = PostgresJsDatabase;
function conn(db: Conn, tx?: TransactionContext): Conn {
  return (tx ?? db) as Conn;
}

// ─────────────────────────────────────────────────────────────────────────────
// UserRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleUserRepository implements UserRepository {
  constructor(private db: Conn) {}

  async findById(id: string, tx?: TransactionContext): Promise<UserProps | null> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(users)
      .leftJoin(contentUsers, eq(contentUsers.userId, users.id))
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);

    const row = rows[0];
    if (!row) return null;
    return this.toDomain(row.users, row.content_users);
  }

  async findByEmail(email: string, tx?: TransactionContext): Promise<UserProps | null> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(users)
      .leftJoin(contentUsers, eq(contentUsers.userId, users.id))
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);

    const row = rows[0];
    if (!row) return null;
    return this.toDomain(row.users, row.content_users);
  }

  async findByCodigo(codigo: string, tx?: TransactionContext): Promise<UserProps | null> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(users)
      .leftJoin(contentUsers, eq(contentUsers.userId, users.id))
      .where(and(eq(users.codigo, codigo), isNull(users.deletedAt)))
      .limit(1);

    const row = rows[0];
    if (!row) return null;
    return this.toDomain(row.users, row.content_users);
  }

  async list(
    tenantId: string,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<UserProps & { profile: UserProfile | null }>> {
    const c = conn(this.db, tx);
    const limit = params.limit + 1;

    // Join users with tenant_users to filter by tenant, then join content_users
    let query = c
      .select()
      .from(users)
      .innerJoin(
        tenantUsers,
        and(eq(tenantUsers.userId, users.id), eq(tenantUsers.tenantId, tenantId)),
      )
      .leftJoin(contentUsers, eq(contentUsers.userId, users.id))
      .where(isNull(users.deletedAt))
      .orderBy(desc(users.createdAt))
      .limit(limit);

    if (params.cursor) {
      query = c
        .select()
        .from(users)
        .innerJoin(
          tenantUsers,
          and(eq(tenantUsers.userId, users.id), eq(tenantUsers.tenantId, tenantId)),
        )
        .leftJoin(contentUsers, eq(contentUsers.userId, users.id))
        .where(and(isNull(users.deletedAt), eq(users.id, params.cursor)))
        .orderBy(desc(users.createdAt))
        .limit(limit);
    }

    const rows = await query;
    const hasMore = rows.length > params.limit;
    const data = rows.slice(0, params.limit);

    return {
      data: data.map((r) => ({
        ...this.toDomain(r.users, r.content_users),
        profile: r.content_users
          ? {
              fullName: r.content_users.fullName,
              cpfCnpj: r.content_users.cpfCnpj,
              avatarUrl: r.content_users.avatarUrl,
            }
          : null,
      })),
      nextCursor: hasMore && data.length > 0 ? data[data.length - 1]!.users.id : null,
      hasMore,
    };
  }

  async create(user: UserProps, profile: UserProfile, tx?: TransactionContext): Promise<UserProps> {
    const c = conn(this.db, tx);

    const [created] = await c
      .insert(users)
      .values({
        id: user.id || undefined,
        codigo: user.codigo,
        email: user.email.value,
        passwordHash: user.passwordHash,
        mfaSecret: user.mfaSecret,
        status: user.status,
        forcePwdReset: user.forcePwdReset,
      })
      .returning();

    await c.insert(contentUsers).values({
      userId: created!.id,
      fullName: profile.fullName,
      cpfCnpj: profile.cpfCnpj,
      avatarUrl: profile.avatarUrl,
    });

    return this.toDomain(created!, {
      userId: created!.id,
      fullName: profile.fullName,
      cpfCnpj: profile.cpfCnpj,
      avatarUrl: profile.avatarUrl,
      createdAt: new Date(),
      deletedAt: null,
    });
  }

  async update(user: UserProps, tx?: TransactionContext): Promise<UserProps> {
    const c = conn(this.db, tx);
    const [updated] = await c
      .update(users)
      .set({
        email: user.email.value,
        passwordHash: user.passwordHash,
        mfaSecret: user.mfaSecret,
        status: user.status,
        forcePwdReset: user.forcePwdReset,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id))
      .returning();

    return { ...user, updatedAt: updated!.updatedAt };
  }

  async updateProfile(
    userId: string,
    profile: Partial<UserProfile>,
    tx?: TransactionContext,
  ): Promise<void> {
    const c = conn(this.db, tx);
    const values: Record<string, unknown> = {};
    if (profile.fullName !== undefined) values.fullName = profile.fullName;
    if (profile.cpfCnpj !== undefined) values.cpfCnpj = profile.cpfCnpj;
    if (profile.avatarUrl !== undefined) values.avatarUrl = profile.avatarUrl;

    if (Object.keys(values).length > 0) {
      await c.update(contentUsers).set(values).where(eq(contentUsers.userId, userId));
    }
  }

  async softDelete(id: string, tx?: TransactionContext): Promise<void> {
    const c = conn(this.db, tx);
    const now = new Date();
    await c
      .update(users)
      .set({ status: 'INACTIVE', deletedAt: now, updatedAt: now })
      .where(eq(users.id, id));
  }

  private toDomain(
    row: typeof users.$inferSelect,
    profile: typeof contentUsers.$inferSelect | null,
  ): UserProps {
    return {
      id: row.id,
      codigo: row.codigo,
      email: Email.create(row.email),
      passwordHash: row.passwordHash,
      mfaSecret: row.mfaSecret,
      status: row.status as UserProps['status'],
      forcePwdReset: row.forcePwdReset,
      profile: profile
        ? {
            fullName: profile.fullName,
            cpfCnpj: profile.cpfCnpj,
            avatarUrl: profile.avatarUrl,
          }
        : null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SessionRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleSessionRepository implements SessionRepository {
  constructor(private db: Conn) {}

  async findById(id: string, tx?: TransactionContext): Promise<SessionProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c.select().from(userSessions).where(eq(userSessions.id, id)).limit(1);
    return row ? this.toDomain(row) : null;
  }

  async findActiveByUserId(
    userId: string,
    tx?: TransactionContext,
  ): Promise<readonly SessionProps[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(userSessions)
      .where(and(eq(userSessions.userId, userId), eq(userSessions.isRevoked, false)))
      .orderBy(desc(userSessions.createdAt));

    return rows.map((r) => this.toDomain(r));
  }

  async create(session: SessionProps, tx?: TransactionContext): Promise<SessionProps> {
    const c = conn(this.db, tx);
    const [created] = await c
      .insert(userSessions)
      .values({
        userId: session.userId,
        isRevoked: session.isRevoked,
        deviceFp: session.deviceFp,
        rememberMe: session.rememberMe,
        expiresAt: session.expiresAt,
      })
      .returning();

    return this.toDomain(created!);
  }

  async revoke(id: string, tx?: TransactionContext): Promise<void> {
    const c = conn(this.db, tx);
    await c
      .update(userSessions)
      .set({ isRevoked: true, revokedAt: new Date() })
      .where(eq(userSessions.id, id));
  }

  async revokeAllByUserId(userId: string, tx?: TransactionContext): Promise<number> {
    const c = conn(this.db, tx);
    const result = await c
      .update(userSessions)
      .set({ isRevoked: true, revokedAt: new Date() })
      .where(and(eq(userSessions.userId, userId), eq(userSessions.isRevoked, false)))
      .returning();

    return result.length;
  }

  private toDomain(row: typeof userSessions.$inferSelect): SessionProps {
    return {
      id: row.id,
      userId: row.userId,
      isRevoked: row.isRevoked,
      deviceFp: row.deviceFp,
      rememberMe: row.rememberMe,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
      revokedAt: row.revokedAt,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TenantRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleTenantRepository implements TenantRepository {
  constructor(private db: Conn) {}

  async findById(id: string, tx?: TransactionContext): Promise<TenantProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(tenants)
      .where(and(eq(tenants.id, id), isNull(tenants.deletedAt)))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async findByCodigo(codigo: string, tx?: TransactionContext): Promise<TenantProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(tenants)
      .where(and(eq(tenants.codigo, codigo), isNull(tenants.deletedAt)))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async list(
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<TenantProps>> {
    const c = conn(this.db, tx);
    const limit = params.limit + 1;
    const rows = await c
      .select()
      .from(tenants)
      .where(isNull(tenants.deletedAt))
      .orderBy(desc(tenants.createdAt))
      .limit(limit);

    const hasMore = rows.length > params.limit;
    const data = rows.slice(0, params.limit);

    return {
      data: data.map((r) => this.toDomain(r)),
      nextCursor: hasMore && data.length > 0 ? data[data.length - 1]!.id : null,
      hasMore,
    };
  }

  async create(tenant: TenantProps, tx?: TransactionContext): Promise<TenantProps> {
    const c = conn(this.db, tx);
    const [created] = await c
      .insert(tenants)
      .values({
        id: tenant.id || undefined,
        codigo: tenant.codigo,
        name: tenant.name,
        status: tenant.status,
      })
      .returning();

    return this.toDomain(created!);
  }

  async update(tenant: TenantProps, tx?: TransactionContext): Promise<TenantProps> {
    const c = conn(this.db, tx);
    const [updated] = await c
      .update(tenants)
      .set({ name: tenant.name, status: tenant.status, updatedAt: new Date() })
      .where(eq(tenants.id, tenant.id))
      .returning();

    return this.toDomain(updated!);
  }

  async softDelete(id: string, tx?: TransactionContext): Promise<void> {
    const c = conn(this.db, tx);
    const now = new Date();
    await c
      .update(tenants)
      .set({ status: 'INACTIVE', deletedAt: now, updatedAt: now })
      .where(eq(tenants.id, id));
  }

  private toDomain(row: typeof tenants.$inferSelect): TenantProps {
    return {
      id: row.id,
      codigo: row.codigo,
      name: row.name,
      status: row.status as TenantProps['status'],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RoleRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleRoleRepository implements RoleRepository {
  constructor(private db: Conn) {}

  async findById(id: string, tx?: TransactionContext): Promise<RoleProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(roles)
      .where(and(eq(roles.id, id), isNull(roles.deletedAt)))
      .limit(1);

    if (!row) return null;

    const perms = await c.select().from(rolePermissions).where(eq(rolePermissions.roleId, id));
    return this.toDomain(row, perms);
  }

  async findByCodigo(codigo: string, tx?: TransactionContext): Promise<RoleProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(roles)
      .where(and(eq(roles.codigo, codigo), isNull(roles.deletedAt)))
      .limit(1);

    if (!row) return null;

    const perms = await c.select().from(rolePermissions).where(eq(rolePermissions.roleId, row.id));
    return this.toDomain(row, perms);
  }

  async list(
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<RoleProps>> {
    const c = conn(this.db, tx);
    const limit = params.limit + 1;
    const rows = await c
      .select()
      .from(roles)
      .where(isNull(roles.deletedAt))
      .orderBy(desc(roles.createdAt))
      .limit(limit);

    const hasMore = rows.length > params.limit;
    const data = rows.slice(0, params.limit);

    // Load permissions for all roles in batch
    const roleIds = data.map((r) => r.id);
    const allPerms = roleIds.length > 0 ? await c.select().from(rolePermissions) : [];

    const permsMap = new Map<string, typeof allPerms>();
    for (const p of allPerms) {
      const list = permsMap.get(p.roleId) ?? [];
      list.push(p);
      permsMap.set(p.roleId, list);
    }

    return {
      data: data.map((r) => this.toDomain(r, permsMap.get(r.id) ?? [])),
      nextCursor: hasMore && data.length > 0 ? data[data.length - 1]!.id : null,
      hasMore,
    };
  }

  async create(role: RoleProps, tx?: TransactionContext): Promise<RoleProps> {
    const c = conn(this.db, tx);
    const [created] = await c
      .insert(roles)
      .values({
        id: role.id || undefined,
        codigo: role.codigo,
        name: role.name,
        description: role.description,
        status: role.status,
      })
      .returning();

    if (role.scopes.length > 0) {
      await c.insert(rolePermissions).values(
        role.scopes.map((s) => ({
          roleId: created!.id,
          scope: s.value,
        })),
      );
    }

    const perms = await c
      .select()
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, created!.id));
    return this.toDomain(created!, perms);
  }

  async update(role: RoleProps, tx?: TransactionContext): Promise<RoleProps> {
    const c = conn(this.db, tx);
    const [updated] = await c
      .update(roles)
      .set({
        name: role.name,
        description: role.description,
        status: role.status,
        updatedAt: new Date(),
      })
      .where(eq(roles.id, role.id))
      .returning();

    const perms = await c.select().from(rolePermissions).where(eq(rolePermissions.roleId, role.id));
    return this.toDomain(updated!, perms);
  }

  async replaceScopes(
    roleId: string,
    scopes: readonly string[],
    tx?: TransactionContext,
  ): Promise<void> {
    const c = conn(this.db, tx);
    await c.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    if (scopes.length > 0) {
      await c.insert(rolePermissions).values(scopes.map((s) => ({ roleId, scope: s })));
    }
  }

  async softDelete(id: string, tx?: TransactionContext): Promise<void> {
    const c = conn(this.db, tx);
    const now = new Date();
    await c
      .update(roles)
      .set({ status: 'INACTIVE', deletedAt: now, updatedAt: now })
      .where(eq(roles.id, id));
  }

  private toDomain(
    row: typeof roles.$inferSelect,
    perms: (typeof rolePermissions.$inferSelect)[],
  ): RoleProps {
    return {
      id: row.id,
      codigo: row.codigo,
      name: row.name,
      description: row.description,
      status: row.status as RoleProps['status'],
      scopes: perms.map((p) => Scope.create(p.scope)),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TenantUserRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleTenantUserRepository implements TenantUserRepository {
  constructor(private db: Conn) {}

  async findByKey(
    userId: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<TenantUserProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(tenantUsers)
      .where(
        and(
          eq(tenantUsers.userId, userId),
          eq(tenantUsers.tenantId, tenantId),
          isNull(tenantUsers.deletedAt),
        ),
      )
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async listByTenant(
    tenantId: string,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<TenantUserProps>> {
    const c = conn(this.db, tx);
    const limit = params.limit + 1;
    const rows = await c
      .select()
      .from(tenantUsers)
      .where(and(eq(tenantUsers.tenantId, tenantId), isNull(tenantUsers.deletedAt)))
      .orderBy(desc(tenantUsers.createdAt))
      .limit(limit);

    const hasMore = rows.length > params.limit;
    const data = rows.slice(0, params.limit);

    return {
      data: data.map((r) => this.toDomain(r)),
      nextCursor:
        hasMore && data.length > 0
          ? `${data[data.length - 1]!.userId}:${data[data.length - 1]!.tenantId}`
          : null,
      hasMore,
    };
  }

  async findByUserId(userId: string, tx?: TransactionContext): Promise<readonly TenantUserProps[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(tenantUsers)
      .where(and(eq(tenantUsers.userId, userId), isNull(tenantUsers.deletedAt)));
    return rows.map((r) => this.toDomain(r));
  }

  async create(tenantUser: TenantUserProps, tx?: TransactionContext): Promise<TenantUserProps> {
    const c = conn(this.db, tx);
    const [created] = await c
      .insert(tenantUsers)
      .values({
        userId: tenantUser.userId,
        tenantId: tenantUser.tenantId,
        roleId: tenantUser.roleId,
        status: tenantUser.status,
      })
      .returning();

    return this.toDomain(created!);
  }

  async update(tenantUser: TenantUserProps, tx?: TransactionContext): Promise<TenantUserProps> {
    const c = conn(this.db, tx);
    const [updated] = await c
      .update(tenantUsers)
      .set({
        roleId: tenantUser.roleId,
        status: tenantUser.status,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(tenantUsers.userId, tenantUser.userId),
          eq(tenantUsers.tenantId, tenantUser.tenantId),
        ),
      )
      .returning();

    return this.toDomain(updated!);
  }

  async softDelete(userId: string, tenantId: string, tx?: TransactionContext): Promise<void> {
    const c = conn(this.db, tx);
    const now = new Date();
    await c
      .update(tenantUsers)
      .set({ status: 'INACTIVE', deletedAt: now, updatedAt: now })
      .where(and(eq(tenantUsers.userId, userId), eq(tenantUsers.tenantId, tenantId)));
  }

  private toDomain(row: typeof tenantUsers.$inferSelect): TenantUserProps {
    return {
      userId: row.userId,
      tenantId: row.tenantId,
      roleId: row.roleId,
      status: row.status as TenantUserProps['status'],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DomainEventRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleDomainEventRepository implements DomainEventRepository {
  constructor(private db: Conn) {}

  async create(event: DomainEventBase, tx?: TransactionContext): Promise<void> {
    const c = conn(this.db, tx);
    await c.insert(domainEvents).values({
      tenantId: event.tenantId,
      entityType: event.entityType,
      entityId: event.entityId,
      eventType: event.eventType,
      payload: event.payload,
      correlationId: event.correlationId,
      causationId: event.causationId ?? null,
      createdBy: event.createdBy ?? null,
      sensitivityLevel: event.sensitivityLevel,
      dedupeKey: event.dedupeKey ?? null,
    });
  }

  async createMany(events: readonly DomainEventBase[], tx?: TransactionContext): Promise<void> {
    if (events.length === 0) return;
    const c = conn(this.db, tx);
    await c.insert(domainEvents).values(
      events.map((e) => ({
        tenantId: e.tenantId,
        entityType: e.entityType,
        entityId: e.entityId,
        eventType: e.eventType,
        payload: e.payload,
        correlationId: e.correlationId,
        causationId: e.causationId ?? null,
        createdBy: e.createdBy ?? null,
        sensitivityLevel: e.sensitivityLevel,
        dedupeKey: e.dedupeKey ?? null,
      })),
    );
  }

  async listByEntity(
    tenantId: string,
    entityType: string,
    entityId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<DomainEventBase>> {
    const limit = params.limit + 1;
    const rows = await this.db
      .select()
      .from(domainEvents)
      .where(
        and(
          eq(domainEvents.tenantId, tenantId),
          eq(domainEvents.entityType, entityType),
          eq(domainEvents.entityId, entityId),
        ),
      )
      .orderBy(desc(domainEvents.createdAt))
      .limit(limit);

    const hasMore = rows.length > params.limit;
    const data = rows.slice(0, params.limit);

    return {
      data: data.map((r) => ({
        tenantId: r.tenantId,
        entityType: r.entityType,
        entityId: r.entityId,
        eventType: r.eventType,
        payload: r.payload as Record<string, unknown>,
        correlationId: r.correlationId,
        causationId: r.causationId ?? undefined,
        createdBy: r.createdBy,
        sensitivityLevel: r.sensitivityLevel as 0 | 1 | 2 | 3,
        dedupeKey: r.dedupeKey ?? undefined,
      })),
      nextCursor: hasMore && data.length > 0 ? data[data.length - 1]!.entityId : null,
      hasMore,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PasswordResetTokenRepository (stub — table not yet in schema)
// ─────────────────────────────────────────────────────────────────────────────

export class StubPasswordResetTokenRepository implements PasswordResetTokenRepository {
  async findByHash(_tokenHash: string): Promise<PasswordResetTokenProps | null> {
    throw new Error(
      'PasswordResetToken table not yet created. Forgot/Reset password not available.',
    );
  }

  async create(_token: PasswordResetTokenProps): Promise<void> {
    throw new Error('PasswordResetToken table not yet created.');
  }

  async markUsed(_tokenHash: string): Promise<void> {
    throw new Error('PasswordResetToken table not yet created.');
  }

  async invalidateAllByUserId(_userId: string): Promise<void> {
    throw new Error('PasswordResetToken table not yet created.');
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UnitOfWork
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleUnitOfWork implements UnitOfWork {
  constructor(private db: Conn) {}

  async transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T> {
    return this.db.transaction(async (tx) => fn(tx));
  }
}
