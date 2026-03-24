/**
 * @contract BR-004, BR-007, DATA-000 §7
 *
 * Entity: TenantUser
 * Pivot entity linking a User to a Tenant with a specific Role.
 * PK composta (userId, tenantId) — one role per user/tenant.
 * Status BLOCKED = local suspension within the tenant.
 */

import {
  DomainValidationError,
  EntityBlockedError,
  InvalidStatusTransitionError,
} from '../errors/domain-errors.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type TenantUserStatus = 'ACTIVE' | 'BLOCKED' | 'INACTIVE';

export interface TenantUserProps {
  readonly userId: string;
  readonly tenantId: string;
  readonly roleId: string;
  readonly status: TenantUserStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}

const STATUS_TRANSITIONS: Record<TenantUserStatus, readonly TenantUserStatus[]> = {
  ACTIVE: ['BLOCKED', 'INACTIVE'],
  BLOCKED: ['ACTIVE', 'INACTIVE'],
  INACTIVE: [], // terminal
};

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------
export class TenantUser {
  private _props: TenantUserProps;

  private constructor(props: TenantUserProps) {
    this._props = props;
  }

  // -- Factory ---------------------------------------------------------------

  static create(userId: string, tenantId: string, roleId: string): TenantUser {
    if (!userId) throw new DomainValidationError('userId é obrigatório.');
    if (!tenantId) throw new DomainValidationError('tenantId é obrigatório.');
    if (!roleId) throw new DomainValidationError('roleId é obrigatório.');

    const now = new Date();
    return new TenantUser({
      userId,
      tenantId,
      roleId,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  static fromPersistence(props: TenantUserProps): TenantUser {
    return new TenantUser(props);
  }

  // -- Getters ---------------------------------------------------------------

  get userId(): string {
    return this._props.userId;
  }
  get tenantId(): string {
    return this._props.tenantId;
  }
  get roleId(): string {
    return this._props.roleId;
  }
  get status(): TenantUserStatus {
    return this._props.status;
  }
  get createdAt(): Date {
    return this._props.createdAt;
  }
  get updatedAt(): Date {
    return this._props.updatedAt;
  }
  get deletedAt(): Date | null {
    return this._props.deletedAt;
  }

  // -- Invariants ------------------------------------------------------------

  get isActive(): boolean {
    return this._props.status === 'ACTIVE';
  }

  assertOperational(): void {
    if (this._props.status === 'BLOCKED') {
      throw new EntityBlockedError('Vínculo Usuário-Filial');
    }
    if (this._props.status === 'INACTIVE') {
      throw new DomainValidationError('Vínculo Usuário-Filial desativado.');
    }
  }

  // -- Mutations -------------------------------------------------------------

  /** Change the assigned role within this tenant */
  changeRole(newRoleId: string): TenantUser {
    if (!newRoleId) {
      throw new DomainValidationError('roleId é obrigatório.');
    }

    return new TenantUser({
      ...this._props,
      roleId: newRoleId,
      updatedAt: new Date(),
    });
  }

  transitionStatus(to: TenantUserStatus): TenantUser {
    const from = this._props.status;
    const allowed = STATUS_TRANSITIONS[from];

    if (!allowed.includes(to)) {
      throw new InvalidStatusTransitionError('TenantUser', from, to);
    }

    return new TenantUser({
      ...this._props,
      status: to,
      updatedAt: new Date(),
    });
  }

  /** @contract BR-004 — Soft delete */
  softDelete(): TenantUser {
    const transitioned = this.transitionStatus('INACTIVE');
    return new TenantUser({
      ...transitioned._props,
      deletedAt: new Date(),
    });
  }

  toProps(): TenantUserProps {
    return { ...this._props };
  }
}
