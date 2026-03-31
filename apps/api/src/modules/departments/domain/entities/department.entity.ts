/**
 * @contract BR-013, BR-014, BR-015, BR-016, BR-017, DATA-002
 *
 * Entity: Department
 * Represents a flat department within a tenant (no hierarchy).
 * Used as categorization tags for organizational units (future phase).
 *
 * Invariants:
 * - codigo immutable after creation (BR-014)
 * - cor must be valid hex #RRGGBB or null (BR-017)
 * - soft delete sets status=INACTIVE + deleted_at (BR-015)
 * - restore only if currently inactive (BR-016)
 * - tenant_id immutable (derived from JWT, not editable)
 */

import { DomainValidationError } from '../../../foundation/domain/errors/domain-errors.js';
import {
  DepartmentImmutableFieldError,
  DepartmentAlreadyInactiveError,
  DepartmentAlreadyActiveError,
  InvalidCorFormatError,
} from '../errors/department-errors.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type DepartmentStatus = 'ACTIVE' | 'INACTIVE';

export interface DepartmentProps {
  readonly id: string;
  readonly tenantId: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao: string | null;
  readonly status: DepartmentStatus;
  readonly cor: string | null;
  readonly createdBy: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}

export interface CreateDepartmentInput {
  readonly id: string;
  readonly tenantId: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao?: string | null;
  readonly cor?: string | null;
  readonly createdBy: string | null;
}

export interface UpdateDepartmentInput {
  readonly nome?: string;
  readonly descricao?: string | null;
  readonly cor?: string | null;
  readonly codigo?: string; // Must be rejected (BR-014)
}

const HEX_COLOR_REGEX = /^#[0-9A-Fa-f]{6}$/;

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------
export class Department {
  private _props: DepartmentProps;

  private constructor(props: DepartmentProps) {
    this._props = props;
  }

  // -- Factory ---------------------------------------------------------------

  /** @contract BR-017, DATA-002 */
  static create(input: CreateDepartmentInput): Department {
    if (!input.codigo || input.codigo.trim().length === 0) {
      throw new DomainValidationError("O campo 'codigo' é obrigatório.");
    }
    if (!input.nome || input.nome.trim().length === 0) {
      throw new DomainValidationError("O campo 'nome' é obrigatório.");
    }
    if (input.cor !== undefined && input.cor !== null) {
      if (!HEX_COLOR_REGEX.test(input.cor)) {
        throw new InvalidCorFormatError();
      }
    }

    const now = new Date();
    return new Department({
      id: input.id,
      tenantId: input.tenantId,
      codigo: input.codigo.trim(),
      nome: input.nome.trim(),
      descricao: input.descricao ?? null,
      status: 'ACTIVE',
      cor: input.cor ?? null,
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  /** Reconstitute from DB row (no validation — data is already persisted) */
  static fromProps(props: DepartmentProps): Department {
    return new Department(props);
  }

  // -- Getters ---------------------------------------------------------------

  get id(): string {
    return this._props.id;
  }
  get tenantId(): string {
    return this._props.tenantId;
  }
  get codigo(): string {
    return this._props.codigo;
  }
  get nome(): string {
    return this._props.nome;
  }
  get descricao(): string | null {
    return this._props.descricao;
  }
  get status(): DepartmentStatus {
    return this._props.status;
  }
  get cor(): string | null {
    return this._props.cor;
  }
  get createdBy(): string | null {
    return this._props.createdBy;
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
  get isActive(): boolean {
    return this._props.status === 'ACTIVE';
  }

  // -- Mutations (return new instance — immutability) ------------------------

  /** @contract BR-014, BR-017 */
  update(data: UpdateDepartmentInput): Department {
    // BR-014: codigo is immutable
    if (data.codigo !== undefined) {
      throw new DepartmentImmutableFieldError('codigo');
    }

    // BR-017: validate cor if provided
    if (data.cor !== undefined && data.cor !== null) {
      if (!HEX_COLOR_REGEX.test(data.cor)) {
        throw new InvalidCorFormatError();
      }
    }

    return new Department({
      ...this._props,
      nome: data.nome !== undefined ? data.nome.trim() : this._props.nome,
      descricao: data.descricao !== undefined ? data.descricao : this._props.descricao,
      cor: data.cor !== undefined ? data.cor : this._props.cor,
      updatedAt: new Date(),
    });
  }

  /** @contract BR-015 */
  softDelete(): Department {
    if (!this.isActive) {
      throw new DepartmentAlreadyInactiveError();
    }
    const now = new Date();
    return new Department({
      ...this._props,
      status: 'INACTIVE',
      deletedAt: now,
      updatedAt: now,
    });
  }

  /** @contract BR-016 */
  restore(): Department {
    if (this.isActive) {
      throw new DepartmentAlreadyActiveError();
    }
    return new Department({
      ...this._props,
      status: 'ACTIVE',
      deletedAt: null,
      updatedAt: new Date(),
    });
  }

  // -- Serialization ---------------------------------------------------------

  toProps(): DepartmentProps {
    return { ...this._props };
  }
}
