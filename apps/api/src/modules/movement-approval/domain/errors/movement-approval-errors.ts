/**
 * Domain error hierarchy for the Movement Approval module.
 * All errors carry RFC 9457 Problem Details-compatible fields
 * so the presentation layer can map them directly to HTTP responses.
 */

import { DomainError } from '../../../foundation/domain/errors/domain-errors.js';

// ---------------------------------------------------------------------------
// Not Found errors (404)
// ---------------------------------------------------------------------------

export class MovementNotFoundError extends DomainError {
  readonly type = '/problems/movement-not-found';
  readonly statusHint = 404;

  constructor(id: string) {
    super(`Movimento controlado não encontrado: ${id}`);
  }
}

export class ControlRuleNotFoundError extends DomainError {
  readonly type = '/problems/control-rule-not-found';
  readonly statusHint = 404;

  constructor(id: string) {
    super(`Regra de controle não encontrada: ${id}`);
  }
}

// ---------------------------------------------------------------------------
// Transition / state errors (422)
// ---------------------------------------------------------------------------

export class InvalidMovementTransitionError extends DomainError {
  readonly type = '/problems/invalid-movement-transition';
  readonly statusHint = 422;

  constructor(from: string, to: string) {
    super(`Transição de status inválida para Movimento: ${from} → ${to}`);
  }
}

export class MovementNotPendingError extends DomainError {
  readonly type = '/problems/movement-not-pending';
  readonly statusHint = 422;

  constructor(movementId: string) {
    super(`Movimento ${movementId} não está pendente de aprovação.`);
  }
}

export class InsufficientJustificationError extends DomainError {
  readonly type = '/problems/insufficient-justification';
  readonly statusHint = 422;

  constructor() {
    super('Justificativa de override deve ter no mínimo 20 caracteres.');
  }
}

export class InsufficientOpinionError extends DomainError {
  readonly type = '/problems/insufficient-opinion';
  readonly statusHint = 422;

  constructor() {
    super('Parecer de aprovação/rejeição deve ter no mínimo 10 caracteres.');
  }
}

export class ControlRuleInactiveError extends DomainError {
  readonly type = '/problems/control-rule-inactive';
  readonly statusHint = 422;

  constructor(ruleId: string) {
    super(`Regra de controle ${ruleId} está inativa ou expirada.`);
  }
}

// ---------------------------------------------------------------------------
// Authorization errors (403)
// ---------------------------------------------------------------------------

export class SegregationViolationError extends DomainError {
  readonly type = '/problems/segregation-violation';
  readonly statusHint = 403;

  constructor() {
    super('Violação de segregação: solicitante não pode aprovar o próprio movimento.');
  }
}
