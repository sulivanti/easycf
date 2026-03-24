/**
 * @contract BR-001, BR-002, BR-003, BR-004, BR-005, BR-008, BR-009, BR-010, BR-011, DATA-001
 *
 * Entity: OrgUnit
 * Represents a node (N1–N4) in the 5-level organizational hierarchy.
 * N5 (tenant/establishment) is linked via OrgUnitTenantLink, not as an OrgUnit.
 *
 * Invariants:
 * - nivel derived from parent (BR-002)
 * - codigo immutable after creation (BR-003)
 * - parent_id immutable after creation (BR-010)
 * - max nivel = 4 (BR-011)
 * - soft delete only if no active children (BR-005)
 * - restore only if parent is active or node is N1 (BR-009)
 */

import { DomainValidationError } from '../../../foundation/domain/errors/domain-errors.js';
import { ImmutableFieldError, MaxLevelExceededError } from '../errors/org-unit-errors.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type OrgUnitNivel = 1 | 2 | 3 | 4;
export type OrgUnitStatus = 'ACTIVE' | 'INACTIVE';

export interface OrgUnitProps {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao: string | null;
  readonly nivel: OrgUnitNivel;
  readonly parentId: string | null;
  readonly status: OrgUnitStatus;
  readonly createdBy: string | null;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly deletedAt: Date | null;
}

export interface CreateOrgUnitInput {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao?: string | null;
  readonly parentId: string | null;
  readonly parentNivel: OrgUnitNivel | null;
  readonly createdBy: string | null;
}

const MAX_NIVEL: OrgUnitNivel = 4;

// ---------------------------------------------------------------------------
// Entity
// ---------------------------------------------------------------------------
export class OrgUnit {
  private _props: OrgUnitProps;

  private constructor(props: OrgUnitProps) {
    this._props = props;
  }

  // -- Factory ---------------------------------------------------------------

  /** @contract BR-001, BR-002, BR-011 */
  static create(input: CreateOrgUnitInput): OrgUnit {
    if (!input.codigo || input.codigo.trim().length === 0) {
      throw new DomainValidationError("Campo 'codigo' é obrigatório.");
    }
    if (input.codigo.length > 50) {
      throw new DomainValidationError("Campo 'codigo' não pode exceder 50 caracteres.");
    }
    if (!input.nome || input.nome.trim().length === 0) {
      throw new DomainValidationError("Campo 'nome' é obrigatório.");
    }
    if (input.nome.length > 200) {
      throw new DomainValidationError("Campo 'nome' não pode exceder 200 caracteres.");
    }

    // BR-002: derive nivel from parent
    const nivel = OrgUnit.deriveNivel(input.parentId, input.parentNivel);

    // BR-011: max level N4
    if (nivel > MAX_NIVEL) {
      throw new MaxLevelExceededError();
    }

    const now = new Date();
    return new OrgUnit({
      id: input.id,
      codigo: input.codigo.trim().toUpperCase(),
      nome: input.nome.trim(),
      descricao: input.descricao?.trim() ?? null,
      nivel,
      parentId: input.parentId,
      status: 'ACTIVE',
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    });
  }

  static fromPersistence(props: OrgUnitProps): OrgUnit {
    return new OrgUnit(props);
  }

  // -- Getters ---------------------------------------------------------------

  get id(): string {
    return this._props.id;
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
  get nivel(): OrgUnitNivel {
    return this._props.nivel;
  }
  get parentId(): string | null {
    return this._props.parentId;
  }
  get status(): OrgUnitStatus {
    return this._props.status;
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

  // -- Invariants ------------------------------------------------------------

  get isActive(): boolean {
    return this._props.status === 'ACTIVE' && this._props.deletedAt === null;
  }

  get isDeleted(): boolean {
    return this._props.deletedAt !== null;
  }

  get isRoot(): boolean {
    return this._props.parentId === null;
  }

  /** @contract BR-006 — Only N4 nodes can link tenants */
  get canLinkTenant(): boolean {
    return this._props.nivel === 4;
  }

  // -- Mutations -------------------------------------------------------------

  /**
   * @contract BR-003, BR-010
   * Update mutable fields only (nome, descricao).
   * Rejects codigo and parent_id changes.
   */
  update(data: {
    nome?: string;
    descricao?: string | null;
    codigo?: string;
    parentId?: string;
  }): OrgUnit {
    // BR-003: codigo is immutable
    if (data.codigo !== undefined && data.codigo !== this._props.codigo) {
      throw new ImmutableFieldError('codigo');
    }

    // BR-010: parent_id is immutable
    if (data.parentId !== undefined && data.parentId !== this._props.parentId) {
      throw new ImmutableFieldError(
        'parent_id',
        "O campo 'parent_id' é imutável após criação. Movimentação de nós não é suportada nesta versão.",
      );
    }

    const nome = data.nome?.trim() ?? this._props.nome;
    if (nome.length === 0) {
      throw new DomainValidationError("Campo 'nome' é obrigatório.");
    }
    if (nome.length > 200) {
      throw new DomainValidationError("Campo 'nome' não pode exceder 200 caracteres.");
    }

    return new OrgUnit({
      ...this._props,
      nome,
      descricao:
        data.descricao !== undefined ? (data.descricao?.trim() ?? null) : this._props.descricao,
      updatedAt: new Date(),
    });
  }

  /**
   * @contract BR-005
   * Soft delete — caller MUST verify no active children before invoking.
   * The children check is a repository concern (requires DB query).
   */
  softDelete(): OrgUnit {
    if (this.isDeleted) {
      return this; // idempotent
    }

    const now = new Date();
    return new OrgUnit({
      ...this._props,
      status: 'INACTIVE',
      updatedAt: now,
      deletedAt: now,
    });
  }

  /**
   * @contract BR-009
   * Restore — caller MUST verify parent is active (or node is N1) before invoking.
   * The parent check is a repository concern (requires DB query).
   */
  restore(): OrgUnit {
    if (!this.isDeleted) {
      return this; // idempotent
    }

    return new OrgUnit({
      ...this._props,
      status: 'ACTIVE',
      updatedAt: new Date(),
      deletedAt: null,
    });
  }

  toProps(): OrgUnitProps {
    return { ...this._props };
  }

  // -- Static helpers --------------------------------------------------------

  /**
   * @contract BR-002 — Derive nivel from parent.
   * N1 (root): parentId=null → nivel=1.
   * N2–N4: nivel = parentNivel + 1.
   */
  static deriveNivel(parentId: string | null, parentNivel: OrgUnitNivel | null): OrgUnitNivel {
    if (parentId === null) {
      return 1;
    }
    if (parentNivel === null) {
      throw new DomainValidationError('Parent nivel é obrigatório para nós não-raiz.');
    }
    return (parentNivel + 1) as OrgUnitNivel;
  }
}
