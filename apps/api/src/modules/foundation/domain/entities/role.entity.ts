/**
 * @contract BR-004, BR-005, BR-006, BR-009, DATA-000 §5-§6
 *
 * Entity: Role
 * Manages RBAC permissions via Scope value objects.
 * BR-006: scope update is full replacement (DELETE + INSERT), never append.
 */

import type { Scope } from '../value-objects/scope.vo.js';
import { DomainValidationError, InvalidStatusTransitionError } from '../errors/domain-errors.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type RoleStatus = 'ACTIVE' | 'INACTIVE';

export interface RoleProps {
  readonly id: string;
  readonly codigo: string;
  readonly name: string;
  readonly description: string | null;
  readonly status: RoleStatus;
  readonly scopes: readonly Scope[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}

const STATUS_TRANSITIONS: Record<RoleStatus, readonly RoleStatus[]> = {
  ACTIVE: ['INACTIVE'],
  INACTIVE: [], // terminal
};

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------
export class Role {
  private _props: RoleProps;

  private constructor(props: RoleProps) {
    this._props = props;
  }

  // -- Factory ---------------------------------------------------------------

  static create(props: Omit<RoleProps, 'createdAt' | 'updatedAt' | 'deletedAt'>): Role {
    if (!props.codigo || props.codigo.length === 0) {
      throw new DomainValidationError("Campo 'codigo' é obrigatório (BR-009).");
    }
    if (!props.name || props.name.length === 0) {
      throw new DomainValidationError('Nome da role é obrigatório.');
    }

    // Validate all scopes via VO (BR-005)
    Role.assertNoDuplicateScopes(props.scopes);

    const now = new Date();
    return new Role({
      ...props,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  static fromPersistence(props: RoleProps): Role {
    return new Role(props);
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
  get description(): string | null {
    return this._props.description;
  }
  get status(): RoleStatus {
    return this._props.status;
  }
  get scopes(): readonly Scope[] {
    return this._props.scopes;
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

  /** Check if role has a specific scope */
  hasScope(scope: Scope): boolean {
    return this._props.scopes.some((s) => s.equals(scope));
  }

  /** Extract scope string values for persistence/serialization */
  get scopeValues(): readonly string[] {
    return this._props.scopes.map((s) => s.value);
  }

  private static assertNoDuplicateScopes(scopes: readonly Scope[]): void {
    const seen = new Set<string>();
    for (const scope of scopes) {
      if (seen.has(scope.value)) {
        throw new DomainValidationError(`Escopo duplicado: ${scope.value}`);
      }
      seen.add(scope.value);
    }
  }

  // -- Mutations -------------------------------------------------------------

  /**
   * @contract BR-006 — Full replacement of scopes.
   * Replaces ALL existing scopes with the new set. Not append.
   */
  replaceScopes(newScopes: readonly Scope[]): Role {
    Role.assertNoDuplicateScopes(newScopes);

    return new Role({
      ...this._props,
      scopes: newScopes,
      updatedAt: new Date(),
    });
  }

  update(data: { name?: string; description?: string | null }): Role {
    return new Role({
      ...this._props,
      name: data.name ?? this._props.name,
      description: data.description !== undefined ? data.description : this._props.description,
      updatedAt: new Date(),
    });
  }

  transitionStatus(to: RoleStatus): Role {
    const from = this._props.status;
    const allowed = STATUS_TRANSITIONS[from];

    if (!allowed.includes(to)) {
      throw new InvalidStatusTransitionError('Role', from, to);
    }

    return new Role({
      ...this._props,
      status: to,
      updatedAt: new Date(),
    });
  }

  /** @contract BR-004 — Soft delete */
  softDelete(): Role {
    const transitioned = this.transitionStatus('INACTIVE');
    return new Role({
      ...transitioned._props,
      deletedAt: new Date(),
    });
  }

  toProps(): RoleProps {
    return { ...this._props };
  }
}
