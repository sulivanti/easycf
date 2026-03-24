/**
 * @contract BR-001.1, BR-001.2, BR-001.3, BR-001.10, BR-001.11, DATA-001 §user_org_scopes
 *
 * Aggregate: UserOrgScope.
 * Represents the binding between a user and an organizational node (N1–N4).
 * Invariants:
 *   - Maximum 1 PRIMARY per user (BR-001.2)
 *   - Only N1–N4 nodes allowed (BR-001.3)
 *   - valid_until must be in the future when provided (BR-001.10)
 *   - org_unit must exist and be ACTIVE (BR-001.11)
 */

import type { ScopeType } from '../value-objects/scope-type.vo.js';
import {
  DuplicatePrimaryScopeError,
  ValidUntilMustBeFutureError,
  AlreadyRevokedOrExpiredError,
} from '../errors/identity-errors.js';

export interface UserOrgScopeProps {
  id: string;
  tenantId: string;
  userId: string;
  orgUnitId: string;
  scopeType: ScopeType;
  grantedBy: string | null;
  validFrom: Date;
  validUntil: Date | null;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateOrgScopeInput {
  tenantId: string;
  userId: string;
  orgUnitId: string;
  scopeType: ScopeType;
  grantedBy: string | null;
  validUntil: Date | null;
}

export class UserOrgScope {
  constructor(private readonly props: UserOrgScopeProps) {}

  get id(): string {
    return this.props.id;
  }
  get tenantId(): string {
    return this.props.tenantId;
  }
  get userId(): string {
    return this.props.userId;
  }
  get orgUnitId(): string {
    return this.props.orgUnitId;
  }
  get scopeType(): ScopeType {
    return this.props.scopeType;
  }
  get status(): 'ACTIVE' | 'INACTIVE' {
    return this.props.status;
  }
  get validUntil(): Date | null {
    return this.props.validUntil;
  }

  /**
   * Checks whether the scope is currently active and not soft-deleted.
   */
  isActive(): boolean {
    return this.props.status === 'ACTIVE' && this.props.deletedAt === null;
  }

  /**
   * Validates the PRIMARY uniqueness invariant (BR-001.2).
   * Must be called before persisting a new scope.
   * @param existingPrimaryCount - Number of active PRIMARY scopes for this user.
   * @param newScopeType - The scope type being created.
   */
  static validatePrimaryUniqueness(
    existingPrimaryCount: number,
    newScopeType: ScopeType,
    userId: string,
  ): void {
    if (newScopeType === 'PRIMARY' && existingPrimaryCount > 0) {
      throw new DuplicatePrimaryScopeError(userId);
    }
  }

  /**
   * Validates that valid_until is in the future (BR-001.10).
   * @param validUntil - The expiration date (null = permanent, allowed for org scopes).
   * @param now - Current timestamp for comparison.
   */
  static validateValidUntil(validUntil: Date | null, now: Date = new Date()): void {
    if (validUntil !== null && validUntil <= now) {
      throw new ValidUntilMustBeFutureError();
    }
  }

  /**
   * Soft-deletes (revokes) the org scope.
   * @returns Updated props with status INACTIVE and deleted_at set.
   */
  revoke(now: Date = new Date()): UserOrgScopeProps {
    if (!this.isActive()) {
      throw new AlreadyRevokedOrExpiredError('user_org_scope');
    }
    return {
      ...this.props,
      status: 'INACTIVE',
      deletedAt: now,
      updatedAt: now,
    };
  }

  /**
   * Marks the scope as expired (called by background job).
   * @returns Updated props with status INACTIVE and deleted_at set.
   */
  expire(now: Date = new Date()): UserOrgScopeProps {
    if (!this.isActive()) {
      throw new AlreadyRevokedOrExpiredError('user_org_scope');
    }
    return {
      ...this.props,
      status: 'INACTIVE',
      deletedAt: now,
      updatedAt: now,
    };
  }

  toProps(): Readonly<UserOrgScopeProps> {
    return { ...this.props };
  }
}
