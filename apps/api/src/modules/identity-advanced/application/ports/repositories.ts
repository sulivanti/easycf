/**
 * @contract DATA-001, FR-001, DOC-FND-000 §2
 *
 * Repository port interfaces for the Identity Advanced module (MOD-004).
 * Reuses Foundation's UnitOfWork, TransactionContext, PaginationParams, PaginatedResult.
 */

import type {
  TransactionContext,
  PaginationParams,
  PaginatedResult,
} from '../../../foundation/application/ports/repositories.js';
import type { UserOrgScopeProps } from '../../domain/aggregates/user-org-scope.js';
import type { AccessShareProps } from '../../domain/aggregates/access-share.js';
import type { AccessDelegationProps } from '../../domain/aggregates/access-delegation.js';

// ---------------------------------------------------------------------------
// Org scope breadcrumb (FR-001.1)
// ---------------------------------------------------------------------------
export interface OrgUnitBreadcrumb {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly nivel: number;
}

export interface OrgScopeWithBreadcrumb extends UserOrgScopeProps {
  readonly orgUnit: OrgUnitBreadcrumb;
}

// ---------------------------------------------------------------------------
// OrgScopeRepository
// ---------------------------------------------------------------------------
export interface OrgScopeRepository {
  findById(id: string, tx?: TransactionContext): Promise<UserOrgScopeProps | null>;

  /** @contract FR-001.1 — List by user with org unit breadcrumb */
  listByUser(
    tenantId: string,
    userId: string,
    tx?: TransactionContext,
  ): Promise<readonly OrgScopeWithBreadcrumb[]>;

  /** @contract BR-001.2 — Count active PRIMARY scopes for a user */
  countActivePrimary(userId: string, tx?: TransactionContext): Promise<number>;

  /** @contract FR-001.1 — Check duplicate user+orgUnit pair */
  findByUserAndOrgUnit(
    userId: string,
    orgUnitId: string,
    tx?: TransactionContext,
  ): Promise<UserOrgScopeProps | null>;

  create(scope: UserOrgScopeProps, tx?: TransactionContext): Promise<UserOrgScopeProps>;

  update(scope: UserOrgScopeProps, tx?: TransactionContext): Promise<UserOrgScopeProps>;

  /** @contract FR-001.4 — Batch: find active scopes with valid_until < now */
  findExpired(
    now: Date,
    limit: number,
    tx?: TransactionContext,
  ): Promise<readonly UserOrgScopeProps[]>;
}

// ---------------------------------------------------------------------------
// AccessShareRepository
// ---------------------------------------------------------------------------

export interface AccessShareListFilters {
  readonly status?: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  readonly granteeId?: string;
  readonly grantorId?: string;
}

export interface AccessShareRepository {
  findById(id: string, tx?: TransactionContext): Promise<AccessShareProps | null>;

  /** @contract FR-001.2 — Admin listing with cursor pagination and filters */
  list(
    tenantId: string,
    filters: AccessShareListFilters,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<AccessShareProps>>;

  /** @contract FR-001.2 — Self-service: active shares where grantee = caller */
  listByGrantee(
    tenantId: string,
    granteeId: string,
    tx?: TransactionContext,
  ): Promise<readonly AccessShareProps[]>;

  create(share: AccessShareProps, tx?: TransactionContext): Promise<AccessShareProps>;

  update(share: AccessShareProps, tx?: TransactionContext): Promise<AccessShareProps>;

  /** @contract FR-001.4 — Batch: find active shares with valid_until < now */
  findExpired(
    now: Date,
    limit: number,
    tx?: TransactionContext,
  ): Promise<readonly AccessShareProps[]>;
}

// ---------------------------------------------------------------------------
// AccessDelegationRepository
// ---------------------------------------------------------------------------
export interface AccessDelegationRepository {
  findById(id: string, tx?: TransactionContext): Promise<AccessDelegationProps | null>;

  /** @contract FR-001.3 — Delegations given by user (status=ACTIVE) */
  listGivenByUser(
    tenantId: string,
    delegatorId: string,
    tx?: TransactionContext,
  ): Promise<readonly AccessDelegationProps[]>;

  /** @contract FR-001.3 — Delegations received by user (status=ACTIVE) */
  listReceivedByUser(
    tenantId: string,
    delegateeId: string,
    tx?: TransactionContext,
  ): Promise<readonly AccessDelegationProps[]>;

  /** @contract BR-001.6 — Active delegated scopes for a user (for re-delegation check) */
  getActiveDelegatedScopes(
    tenantId: string,
    userId: string,
    tx?: TransactionContext,
  ): Promise<readonly string[]>;

  create(
    delegation: AccessDelegationProps,
    tx?: TransactionContext,
  ): Promise<AccessDelegationProps>;

  update(
    delegation: AccessDelegationProps,
    tx?: TransactionContext,
  ): Promise<AccessDelegationProps>;

  /** @contract FR-001.4 — Batch: find active delegations with valid_until < now */
  findExpired(
    now: Date,
    limit: number,
    tx?: TransactionContext,
  ): Promise<readonly AccessDelegationProps[]>;
}
