/**
 * @contract BR-003, BR-004, BR-005, BR-006, BR-009, BR-010, BR-011, BR-008
 *
 * Domain error hierarchy for the Organizational Structure module (MOD-003).
 * All errors extend Foundation's DomainError for RFC 9457 compatibility.
 */

import { DomainError } from '../../../foundation/domain/errors/domain-errors.js';

// ---------------------------------------------------------------------------
// Hierarchy errors
// ---------------------------------------------------------------------------

/** @contract BR-004 — CTE loop detection */
export class HierarchyLoopError extends DomainError {
  readonly type = '/problems/hierarchy-loop';
  readonly statusHint = 422;

  constructor() {
    super('Operação criaria loop na hierarquia.');
  }
}

/** @contract BR-005 — Soft delete blocked by active children */
export class ActiveChildrenError extends DomainError {
  readonly type = '/problems/active-children';
  readonly statusHint = 422;
  readonly activeChildrenIds: readonly string[];

  constructor(activeChildrenIds: readonly string[]) {
    super('Não é possível desativar um nó com subunidades ativas.');
    this.activeChildrenIds = activeChildrenIds;
  }
}

/** @contract BR-011 — Max level N4, no org_unit children beyond N4 */
export class MaxLevelExceededError extends DomainError {
  readonly type = '/problems/max-level-exceeded';
  readonly statusHint = 422;

  constructor() {
    super('Nível máximo (N4) atingido. Use vinculação de tenant para N5.');
  }
}

/** @contract BR-009 — Restore blocked when parent is inactive */
export class InactiveParentError extends DomainError {
  readonly type = '/problems/inactive-parent';
  readonly statusHint = 422;

  constructor() {
    super('Não é possível restaurar: o nó pai está inativo.');
  }
}

// ---------------------------------------------------------------------------
// Immutability errors
// ---------------------------------------------------------------------------

/** @contract BR-003, BR-010 — Immutable field (codigo, parent_id) */
export class ImmutableFieldError extends DomainError {
  readonly type = '/problems/immutable-field';
  readonly statusHint = 422;
  readonly fieldName: string;

  constructor(fieldName: string, detail?: string) {
    super(detail ?? `O campo '${fieldName}' é imutável após criação.`);
    this.fieldName = fieldName;
  }
}

// ---------------------------------------------------------------------------
// Tenant link errors
// ---------------------------------------------------------------------------

/** @contract BR-006 — Tenant link only allowed on N4 nodes */
export class TenantLinkLevelError extends DomainError {
  readonly type = '/problems/tenant-link-level';
  readonly statusHint = 422;

  constructor() {
    super('Vinculação de tenant só é permitida em nós de nível N4.');
  }
}

// ---------------------------------------------------------------------------
// Uniqueness errors
// ---------------------------------------------------------------------------

/** @contract BR-008 — Global codigo uniqueness */
export class DuplicateCodigoError extends DomainError {
  readonly type = '/problems/duplicate-codigo';
  readonly statusHint = 409;
  readonly codigo: string;

  constructor(codigo: string) {
    super(`Código '${codigo}' já está em uso.`);
    this.codigo = codigo;
  }
}
