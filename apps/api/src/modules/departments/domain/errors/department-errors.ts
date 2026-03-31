/**
 * @contract BR-013, BR-014, BR-015, BR-016, BR-017
 *
 * Domain error hierarchy for the Departments entity (MOD-003 F05).
 * All errors extend Foundation's DomainError for RFC 9457 compatibility.
 */

import { DomainError } from '../../../foundation/domain/errors/domain-errors.js';

// ---------------------------------------------------------------------------
// Uniqueness errors
// ---------------------------------------------------------------------------

/** @contract BR-013 — Codigo uniqueness per tenant (catch 23505 → 409) */
export class DuplicateDepartmentCodigoError extends DomainError {
  readonly type = '/problems/duplicate-department-codigo';
  readonly statusHint = 409;
  readonly codigo: string;

  constructor(codigo: string) {
    super(`Já existe um departamento com o código '${codigo}' neste tenant.`);
    this.codigo = codigo;
  }
}

// ---------------------------------------------------------------------------
// Immutability errors
// ---------------------------------------------------------------------------

/** @contract BR-014 — Codigo immutable after creation */
export class DepartmentImmutableFieldError extends DomainError {
  readonly type = '/problems/immutable-field';
  readonly statusHint = 422;
  readonly fieldName: string;

  constructor(fieldName: string) {
    super(`O campo '${fieldName}' é imutável após criação.`);
    this.fieldName = fieldName;
  }
}

// ---------------------------------------------------------------------------
// Status errors
// ---------------------------------------------------------------------------

/** @contract BR-015 — Already inactive (soft delete of already deleted) */
export class DepartmentAlreadyInactiveError extends DomainError {
  readonly type = '/problems/department-already-inactive';
  readonly statusHint = 422;

  constructor() {
    super('Departamento já está desativado.');
  }
}

/** @contract BR-016 — Already active (restore of already active) */
export class DepartmentAlreadyActiveError extends DomainError {
  readonly type = '/problems/department-already-active';
  readonly statusHint = 422;

  constructor() {
    super('Departamento já está ativo.');
  }
}

// ---------------------------------------------------------------------------
// Validation errors
// ---------------------------------------------------------------------------

/** @contract BR-017 — Invalid hex color format */
export class InvalidCorFormatError extends DomainError {
  readonly type = '/problems/invalid-cor-format';
  readonly statusHint = 422;

  constructor() {
    super("Formato de cor inválido. Use o formato #RRGGBB.");
  }
}
