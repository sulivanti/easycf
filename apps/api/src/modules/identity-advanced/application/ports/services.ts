/**
 * @contract FR-001, INT-001.1, INT-001.2, SEC-001
 *
 * Service port interfaces for the Identity Advanced module (MOD-004).
 * Reuses Foundation's CacheService, IdempotencyService, HashUtilService.
 *
 * Adds:
 *  - RedisCachePort — specialized keys for org scope cache invalidation
 *  - UserLookupPort — cross-module user/org existence checks (BR-001.11, BR-001.12)
 */

import type { TransactionContext } from '../../../foundation/application/ports/repositories.js';

// ---------------------------------------------------------------------------
// RedisCachePort — org scope cache invalidation (INT-001.1)
// ---------------------------------------------------------------------------

/**
 * Specialized cache port for identity-advanced.
 * Primary key pattern: `auth:org_scope:user:{userId}`
 * Invalidation occurs on every mutation of user_org_scopes.
 */
export interface RedisCachePort {
  /** DEL auth:org_scope:user:{userId} — invalidate org scope cache */
  invalidateOrgScopeCache(userId: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// UserLookupPort — cross-module checks (BR-001.11, BR-001.12)
// ---------------------------------------------------------------------------

export interface OrgUnitInfo {
  readonly id: string;
  readonly nivel: number;
  readonly status: 'ACTIVE' | 'INACTIVE';
}

/**
 * Port for cross-module lookups against MOD-000 (users) and MOD-003 (org_units).
 * Prevents direct dependency on Foundation/OrgUnit repositories in use cases.
 */
/** @contract FR-001-M01 — Resumo de usuário para respostas expandidas */
export interface UserSummary {
  readonly id: string;
  readonly name: string;
  readonly email: string;
}

export interface UserLookupPort {
  /** @contract BR-001.12 — Check that a user exists in the same tenant */
  userExistsInTenant(userId: string, tenantId: string, tx?: TransactionContext): Promise<boolean>;

  /** @contract BR-001.11 — Get org unit info (nivel, status) for validation */
  getOrgUnitInfo(orgUnitId: string, tx?: TransactionContext): Promise<OrgUnitInfo | null>;

  /** @contract FR-001-M01 D1-D2 — Batch resolve user summaries (name+email) by IDs */
  getUserSummaries(
    userIds: readonly string[],
    tx?: TransactionContext,
  ): Promise<ReadonlyMap<string, UserSummary>>;
}
