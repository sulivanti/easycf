/**
 * @contract BR-001.4, BR-001.5, BR-001.6, BR-001.8, BR-001.9,
 *           BR-001.10, BR-001.12, DATA-001 §access_delegations, ADR-004
 *
 * Aggregate: AccessDelegation.
 * Represents a temporary delegation of a subset of the delegator's scopes.
 * Invariants:
 *   - delegated_scopes MUST NOT contain :approve, :execute, :sign (BR-001.4)
 *   - delegator MUST own all delegated scopes (BR-001.5)
 *   - scopes from delegation cannot be re-delegated (BR-001.6)
 *   - valid_until is required and must be in the future (BR-001.8, BR-001.10)
 *   - reason is required and non-empty (BR-001.9)
 *   - delegatee must exist in same tenant (BR-001.12) — validated by use case
 */

import {
  ValidUntilMustBeFutureError,
  ReasonRequiredError,
  AlreadyRevokedOrExpiredError,
} from '../errors/identity-errors.js';
import {
  validateNoProhibitedScopes,
  validateScopesOwned,
  validateNoReDelegation,
} from '../value-objects/delegated-scope.vo.js';

export type DelegationStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';

export interface AccessDelegationProps {
  id: string;
  tenantId: string;
  delegatorId: string;
  delegateeId: string;
  roleId: string | null;
  orgUnitId: string | null;
  delegatedScopes: string[];
  reason: string;
  validUntil: Date;
  status: DelegationStatus;
  createdAt: Date;
  updatedAt: Date;
  revokedAt: Date | null;
}

export interface CreateDelegationInput {
  tenantId: string;
  delegatorId: string;
  delegateeId: string;
  roleId?: string | null;
  orgUnitId?: string | null;
  delegatedScopes: string[];
  reason: string;
  validUntil: Date;
}

export interface DelegationContext {
  /** Scopes the delegator owns natively (from JWT, excluding delegated). */
  ownedScopes: string[];
  /** Scopes the delegator received via active delegations. */
  delegatedToUser: readonly string[];
}

export class AccessDelegation {
  constructor(private readonly props: AccessDelegationProps) {}

  get id(): string {
    return this.props.id;
  }
  get tenantId(): string {
    return this.props.tenantId;
  }
  get delegatorId(): string {
    return this.props.delegatorId;
  }
  get delegateeId(): string {
    return this.props.delegateeId;
  }
  get status(): DelegationStatus {
    return this.props.status;
  }
  get validUntil(): Date {
    return this.props.validUntil;
  }
  get delegatedScopes(): readonly string[] {
    return this.props.delegatedScopes;
  }

  isActive(): boolean {
    return this.props.status === 'ACTIVE';
  }

  /**
   * Validates all creation-time invariants (BR-001.4, BR-001.5, BR-001.6,
   * BR-001.8, BR-001.9, BR-001.10).
   * @param input - The delegation creation input.
   * @param context - Delegator's scope context (owned vs delegated).
   * @param now - Current timestamp for comparison.
   */
  static validateCreation(
    input: CreateDelegationInput,
    context: DelegationContext,
    now: Date = new Date(),
  ): void {
    // BR-001.9 — reason required
    if (!input.reason || input.reason.trim().length === 0) {
      throw new ReasonRequiredError('delegation');
    }

    // BR-001.10 — valid_until must be in the future
    if (input.validUntil <= now) {
      throw new ValidUntilMustBeFutureError();
    }

    // BR-001.4 — no prohibited scopes
    validateNoProhibitedScopes(input.delegatedScopes);

    // BR-001.5 — delegator must own all scopes
    validateScopesOwned(input.delegatedScopes, context.ownedScopes);

    // BR-001.6 — no re-delegation
    validateNoReDelegation(input.delegatedScopes, context.delegatedToUser);
  }

  /**
   * Revokes the delegation.
   * @param now - Current timestamp.
   * @returns Updated props with status REVOKED.
   */
  revoke(now: Date = new Date()): AccessDelegationProps {
    if (!this.isActive()) {
      throw new AlreadyRevokedOrExpiredError('access_delegation');
    }
    return {
      ...this.props,
      status: 'REVOKED',
      revokedAt: now,
      updatedAt: now,
    };
  }

  /**
   * Marks the delegation as expired (called by background job).
   * @returns Updated props with status EXPIRED.
   */
  expire(now: Date = new Date()): AccessDelegationProps {
    if (!this.isActive()) {
      throw new AlreadyRevokedOrExpiredError('access_delegation');
    }
    return {
      ...this.props,
      status: 'EXPIRED',
      updatedAt: now,
    };
  }

  toProps(): Readonly<AccessDelegationProps> {
    return { ...this.props };
  }
}
