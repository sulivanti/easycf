/**
 * @contract BR-001, BR-003, BR-005, BR-006, BR-007, BR-012
 *
 * Domain errors for the Contextual Params module.
 * All errors extend DomainError (DOC-GNP-00) with RFC 9457 Problem Details fields.
 */

import { DomainError } from '../../../foundation/domain/errors/domain-errors.js';

/** BR-001: codigo field is immutable after creation */
export class CodigoImmutableError extends DomainError {
  readonly type = '/problems/codigo-immutable';
  readonly statusHint = 422;

  constructor(entityType: string, entityId: string) {
    super(`O campo 'codigo' é imutável após criação (${entityType} ${entityId}).`);
  }
}

/** BR-003: Incidence conflict detected (duplicate framer + object) */
export class IncidenceConflictError extends DomainError {
  readonly type = '/problems/incidence-conflict';
  readonly statusHint = 422;

  constructor(framerId: string, targetObjectId: string) {
    super(
      `Conflito de incidência detectado: enquadrador ${framerId} + objeto ${targetObjectId} já possui regra ativa. Resolva o conflito antes de salvar.`,
    );
  }
}

/** BR-005: PUBLISHED routine is immutable */
export class RoutineImmutableError extends DomainError {
  readonly type = '/problems/routine-immutable';
  readonly statusHint = 422;

  constructor(routineId: string) {
    super(`Rotinas publicadas são imutáveis (${routineId}). Use o fork para criar nova versão.`);
  }
}

/** BR-006: Cannot publish routine without items */
export class RoutineNoItemsError extends DomainError {
  readonly type = '/problems/routine-no-items';
  readonly statusHint = 422;

  constructor(routineId: string) {
    super(`Rotinas sem itens não podem ser publicadas (${routineId}).`);
  }
}

/** BR-007: Only PUBLISHED routines can be linked */
export class RoutineDraftLinkError extends DomainError {
  readonly type = '/problems/routine-draft-link';
  readonly statusHint = 422;

  constructor(routineId: string) {
    super(`Apenas rotinas publicadas podem ser vinculadas a regras de incidência (${routineId}).`);
  }
}

/** BR-012: DEPRECATED routines cannot receive new links */
export class RoutineDeprecatedLinkError extends DomainError {
  readonly type = '/problems/routine-deprecated-link';
  readonly statusHint = 422;

  constructor(routineId: string) {
    super(`Rotinas depreciadas não aceitam novos vínculos (${routineId}).`);
  }
}
