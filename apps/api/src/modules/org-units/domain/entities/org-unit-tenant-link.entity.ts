/**
 * @contract BR-006, BR-007, DATA-001
 *
 * Entity: OrgUnitTenantLink
 * Represents the N4→N5 binding between a sub-unit (org_unit nivel=4)
 * and a tenant/establishment (MOD-000-F07).
 *
 * N5 is NOT a new org_unit — it is the existing tenant (BR-007).
 * Links are only allowed on N4 nodes (BR-006).
 */

import { DomainValidationError } from '../../../foundation/domain/errors/domain-errors.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface OrgUnitTenantLinkProps {
  readonly id: string;
  readonly orgUnitId: string;
  readonly tenantId: string;
  readonly createdBy: string | null;
  readonly createdAt: Date;
  readonly deletedAt: Date | null;
}

export interface CreateOrgUnitTenantLinkInput {
  readonly id: string;
  readonly orgUnitId: string;
  readonly tenantId: string;
  readonly createdBy: string | null;
}

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------
export class OrgUnitTenantLink {
  private _props: OrgUnitTenantLinkProps;

  private constructor(props: OrgUnitTenantLinkProps) {
    this._props = props;
  }

  // -- Factory ---------------------------------------------------------------

  /** @contract BR-006, BR-007 — caller MUST verify org unit is N4 before invoking */
  static create(input: CreateOrgUnitTenantLinkInput): OrgUnitTenantLink {
    if (!input.orgUnitId) {
      throw new DomainValidationError("Campo 'orgUnitId' é obrigatório.");
    }
    if (!input.tenantId) {
      throw new DomainValidationError("Campo 'tenantId' é obrigatório.");
    }

    return new OrgUnitTenantLink({
      id: input.id,
      orgUnitId: input.orgUnitId,
      tenantId: input.tenantId,
      createdBy: input.createdBy,
      createdAt: new Date(),
      deletedAt: null,
    });
  }

  static fromPersistence(props: OrgUnitTenantLinkProps): OrgUnitTenantLink {
    return new OrgUnitTenantLink(props);
  }

  // -- Getters ---------------------------------------------------------------

  get id(): string {
    return this._props.id;
  }
  get orgUnitId(): string {
    return this._props.orgUnitId;
  }
  get tenantId(): string {
    return this._props.tenantId;
  }
  get createdBy(): string | null {
    return this._props.createdBy;
  }
  get createdAt(): Date {
    return this._props.createdAt;
  }
  get deletedAt(): Date | null {
    return this._props.deletedAt;
  }

  // -- Invariants ------------------------------------------------------------

  get isActive(): boolean {
    return this._props.deletedAt === null;
  }

  get isDeleted(): boolean {
    return this._props.deletedAt !== null;
  }

  // -- Mutations -------------------------------------------------------------

  /** Soft unlink — marks the binding as deleted */
  softDelete(): OrgUnitTenantLink {
    if (this.isDeleted) {
      return this; // idempotent
    }

    return new OrgUnitTenantLink({
      ...this._props,
      deletedAt: new Date(),
    });
  }

  toProps(): OrgUnitTenantLinkProps {
    return { ...this._props };
  }
}
