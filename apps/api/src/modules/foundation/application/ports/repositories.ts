/**
 * @contract DATA-000, DOC-GNP-00, DOC-FND-000
 *
 * Repository port interfaces for the Foundation module.
 * These define the boundary between application and infrastructure layers.
 * Implementations live in the infrastructure layer (Drizzle-based).
 */

import type {
  UserProps,
  UserProfile,
  SessionProps,
  TenantProps,
  RoleProps,
  TenantUserProps,
  DomainEventBase,
} from '../../domain/index.js';
import type { PasswordResetTokenProps } from '../../domain/value-objects/password-reset-token.vo.js';

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface PaginationParams {
  readonly cursor?: string;
  readonly limit: number;
}

export interface PaginatedResult<T> {
  readonly data: readonly T[];
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
}

/**
 * Transaction context — passed to use cases that need atomic operations.
 * The concrete type is defined by the infrastructure layer (e.g. Drizzle transaction).
 */
export type TransactionContext = unknown;

export interface UnitOfWork {
  transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T>;
}

// ---------------------------------------------------------------------------
// UserRepository
// ---------------------------------------------------------------------------
export interface UserRepository {
  findById(id: string, tx?: TransactionContext): Promise<UserProps | null>;
  findByEmail(email: string, tx?: TransactionContext): Promise<UserProps | null>;
  findByCodigo(codigo: string, tx?: TransactionContext): Promise<UserProps | null>;
  list(
    tenantId: string,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<UserProps & { profile: UserProfile | null }>>;
  create(user: UserProps, profile: UserProfile, tx?: TransactionContext): Promise<UserProps>;
  update(user: UserProps, tx?: TransactionContext): Promise<UserProps>;
  updateProfile(
    userId: string,
    profile: Partial<UserProfile>,
    tx?: TransactionContext,
  ): Promise<void>;
  softDelete(id: string, tx?: TransactionContext): Promise<void>;
}

// ---------------------------------------------------------------------------
// SessionRepository
// ---------------------------------------------------------------------------
export interface SessionRepository {
  findById(id: string, tx?: TransactionContext): Promise<SessionProps | null>;
  findActiveByUserId(userId: string, tx?: TransactionContext): Promise<readonly SessionProps[]>;
  create(session: SessionProps, tx?: TransactionContext): Promise<SessionProps>;
  revoke(id: string, tx?: TransactionContext): Promise<void>;
  revokeAllByUserId(userId: string, tx?: TransactionContext): Promise<number>;
}

// ---------------------------------------------------------------------------
// TenantRepository
// ---------------------------------------------------------------------------
export interface TenantRepository {
  findById(id: string, tx?: TransactionContext): Promise<TenantProps | null>;
  findByCodigo(codigo: string, tx?: TransactionContext): Promise<TenantProps | null>;
  list(params: PaginationParams, tx?: TransactionContext): Promise<PaginatedResult<TenantProps>>;
  create(tenant: TenantProps, tx?: TransactionContext): Promise<TenantProps>;
  update(tenant: TenantProps, tx?: TransactionContext): Promise<TenantProps>;
  softDelete(id: string, tx?: TransactionContext): Promise<void>;
}

// ---------------------------------------------------------------------------
// RoleRepository
// ---------------------------------------------------------------------------
export interface RoleRepository {
  findById(id: string, tx?: TransactionContext): Promise<RoleProps | null>;
  findByCodigo(codigo: string, tx?: TransactionContext): Promise<RoleProps | null>;
  list(params: PaginationParams, tx?: TransactionContext): Promise<PaginatedResult<RoleProps>>;
  create(role: RoleProps, tx?: TransactionContext): Promise<RoleProps>;
  update(role: RoleProps, tx?: TransactionContext): Promise<RoleProps>;
  /** @contract BR-006 — Replaces ALL scopes atomically (DELETE + INSERT) */
  replaceScopes(roleId: string, scopes: readonly string[], tx?: TransactionContext): Promise<void>;
  softDelete(id: string, tx?: TransactionContext): Promise<void>;
}

// ---------------------------------------------------------------------------
// TenantUserRepository
// ---------------------------------------------------------------------------
export interface TenantUserRepository {
  findByKey(
    userId: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<TenantUserProps | null>;
  listByTenant(
    tenantId: string,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<TenantUserProps>>;
  /** Returns all tenant bindings for a user (for /auth/me scopes resolution) */
  findByUserId(userId: string, tx?: TransactionContext): Promise<readonly TenantUserProps[]>;
  create(tenantUser: TenantUserProps, tx?: TransactionContext): Promise<TenantUserProps>;
  update(tenantUser: TenantUserProps, tx?: TransactionContext): Promise<TenantUserProps>;
  softDelete(userId: string, tenantId: string, tx?: TransactionContext): Promise<void>;
}

// ---------------------------------------------------------------------------
// DomainEventRepository
// ---------------------------------------------------------------------------
export interface DomainEventRepository {
  create(event: DomainEventBase, tx?: TransactionContext): Promise<void>;
  createMany(events: readonly DomainEventBase[], tx?: TransactionContext): Promise<void>;
  listByEntity(
    tenantId: string,
    entityType: string,
    entityId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<DomainEventBase>>;
}

// ---------------------------------------------------------------------------
// PasswordResetTokenRepository
// ---------------------------------------------------------------------------
export interface PasswordResetTokenRepository {
  findByHash(tokenHash: string, tx?: TransactionContext): Promise<PasswordResetTokenProps | null>;
  create(token: PasswordResetTokenProps, tx?: TransactionContext): Promise<void>;
  markUsed(tokenHash: string, tx?: TransactionContext): Promise<void>;
  invalidateAllByUserId(userId: string, tx?: TransactionContext): Promise<void>;
}
