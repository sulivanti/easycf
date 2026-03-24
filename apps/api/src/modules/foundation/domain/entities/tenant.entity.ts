/**
 * @contract BR-004, BR-007, BR-009, DATA-000 §4
 *
 * Entity: Tenant
 * Represents a branch/filial in the multi-tenant model.
 * Status BLOCKED = organizational kill-switch.
 */

import {
  DomainValidationError,
  EntityBlockedError,
  InvalidStatusTransitionError,
} from '../errors/domain-errors.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type TenantStatus = 'ACTIVE' | 'BLOCKED' | 'INACTIVE';

export interface TenantProps {
  readonly id: string;
  readonly codigo: string;
  readonly name: string;
  readonly status: TenantStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}

const STATUS_TRANSITIONS: Record<TenantStatus, readonly TenantStatus[]> = {
  ACTIVE: ['BLOCKED', 'INACTIVE'],
  BLOCKED: ['ACTIVE', 'INACTIVE'],
  INACTIVE: [], // terminal (soft-deleted)
};

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------
export class Tenant {
  private _props: TenantProps;

  private constructor(props: TenantProps) {
    this._props = props;
  }

  // -- Factory ---------------------------------------------------------------

  static create(props: Omit<TenantProps, 'createdAt' | 'updatedAt' | 'deletedAt'>): Tenant {
    if (!props.codigo || props.codigo.length === 0) {
      throw new DomainValidationError("Campo 'codigo' é obrigatório (BR-009).");
    }
    if (!props.name || props.name.length === 0) {
      throw new DomainValidationError('Nome do tenant é obrigatório.');
    }

    const now = new Date();
    return new Tenant({
      ...props,
      codigo: props.codigo.toUpperCase(),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  static fromPersistence(props: TenantProps): Tenant {
    return new Tenant(props);
  }

  // -- Getters ---------------------------------------------------------------

  get id(): string {
    return this._props.id;
  }
  get codigo(): string {
    return this._props.codigo;
  }
  get name(): string {
    return this._props.name;
  }
  get status(): TenantStatus {
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

  get isBlocked(): boolean {
    return this._props.status === 'BLOCKED';
  }

  get isDeleted(): boolean {
    return this._props.deletedAt !== null;
  }

  /** Guard: ensures tenant is operational */
  assertOperational(): void {
    if (this.isBlocked) {
      throw new EntityBlockedError('Tenant/Filial');
    }
    if (this._props.status === 'INACTIVE') {
      throw new DomainValidationError('Tenant/Filial desativado.');
    }
  }

  // -- Mutations -------------------------------------------------------------

  transitionStatus(to: TenantStatus): Tenant {
    const from = this._props.status;
    const allowed = STATUS_TRANSITIONS[from];

    if (!allowed.includes(to)) {
      throw new InvalidStatusTransitionError('Tenant', from, to);
    }

    return new Tenant({
      ...this._props,
      status: to,
      updatedAt: new Date(),
    });
  }

  update(data: { name?: string }): Tenant {
    return new Tenant({
      ...this._props,
      name: data.name ?? this._props.name,
      updatedAt: new Date(),
    });
  }

  /** @contract BR-004 — Soft delete */
  softDelete(): Tenant {
    const transitioned = this.transitionStatus('INACTIVE');
    return new Tenant({
      ...transitioned._props,
      deletedAt: new Date(),
    });
  }

  toProps(): TenantProps {
    return { ...this._props };
  }
}
