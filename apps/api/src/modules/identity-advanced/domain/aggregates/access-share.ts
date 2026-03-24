/**
 * @contract BR-001.7, BR-001.8, BR-001.9, BR-001.10, BR-001.12,
 *           DATA-001 §access_shares, ADR-001
 *
 * Aggregate: AccessShare.
 * Represents a controlled resource sharing with mandatory expiration.
 * Invariants:
 *   - valid_until is required and must be in the future (BR-001.8, BR-001.10)
 *   - reason is required and non-empty (BR-001.9)
 *   - auto-authorization requires identity:share:authorize scope (BR-001.7)
 *   - grantee must exist in same tenant (BR-001.12) — validated by use case
 */

import {
  ValidUntilMustBeFutureError,
  ReasonRequiredError,
  AlreadyRevokedOrExpiredError,
} from '../errors/identity-errors.js';

export type ShareStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';
export type ResourceType = 'org_unit' | 'tenant' | 'process';

export interface AccessShareProps {
  id: string;
  tenantId: string;
  grantorId: string;
  granteeId: string;
  resourceType: ResourceType;
  resourceId: string;
  allowedActions: string[];
  reason: string;
  authorizedBy: string;
  validFrom: Date;
  validUntil: Date;
  status: ShareStatus;
  createdAt: Date;
  updatedAt: Date;
  revokedAt: Date | null;
  revokedBy: string | null;
}

export interface CreateShareInput {
  tenantId: string;
  grantorId: string;
  granteeId: string;
  resourceType: ResourceType;
  resourceId: string;
  allowedActions: string[];
  reason: string;
  authorizedBy: string;
  validFrom?: Date;
  validUntil: Date;
}

export class AccessShare {
  constructor(private readonly props: AccessShareProps) {}

  get id(): string {
    return this.props.id;
  }
  get tenantId(): string {
    return this.props.tenantId;
  }
  get grantorId(): string {
    return this.props.grantorId;
  }
  get granteeId(): string {
    return this.props.granteeId;
  }
  get status(): ShareStatus {
    return this.props.status;
  }
  get validUntil(): Date {
    return this.props.validUntil;
  }

  isActive(): boolean {
    return this.props.status === 'ACTIVE';
  }

  /**
   * Validates creation-time invariants (BR-001.8, BR-001.9, BR-001.10).
   * Authorization validation (BR-001.7) is in share-authorization.vo.ts.
   */
  static validateCreation(input: CreateShareInput, now: Date = new Date()): void {
    // BR-001.9 — reason required
    if (!input.reason || input.reason.trim().length === 0) {
      throw new ReasonRequiredError('share');
    }

    // BR-001.10 — valid_until must be in the future
    if (input.validUntil <= now) {
      throw new ValidUntilMustBeFutureError();
    }
  }

  /**
   * Revokes the share manually.
   * @param revokedBy - User performing the revocation.
   * @param now - Current timestamp.
   * @returns Updated props with status REVOKED.
   */
  revoke(revokedBy: string, now: Date = new Date()): AccessShareProps {
    if (!this.isActive()) {
      throw new AlreadyRevokedOrExpiredError('access_share');
    }
    return {
      ...this.props,
      status: 'REVOKED',
      revokedAt: now,
      revokedBy,
      updatedAt: now,
    };
  }

  /**
   * Marks the share as expired (called by background job).
   * @returns Updated props with status EXPIRED.
   */
  expire(now: Date = new Date()): AccessShareProps {
    if (!this.isActive()) {
      throw new AlreadyRevokedOrExpiredError('access_share');
    }
    return {
      ...this.props,
      status: 'EXPIRED',
      updatedAt: now,
    };
  }

  toProps(): Readonly<AccessShareProps> {
    return { ...this.props };
  }
}
