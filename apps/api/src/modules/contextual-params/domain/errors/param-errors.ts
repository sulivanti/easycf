/**
 * @contract BR-001, BR-003, BR-005, BR-006, BR-007, BR-012
 *
 * Domain errors for the Contextual Params module.
 * All errors include a code for Problem Details (RFC 9457) mapping.
 */

/** BR-001: codigo field is immutable after creation */
export class CodigoImmutableError extends Error {
  public readonly code = 'CODIGO_IMMUTABLE';
  public readonly statusCode = 422;

  constructor(entityType: string, entityId: string) {
    super(`O campo 'codigo' é imutável após criação (${entityType} ${entityId}).`);
    this.name = 'CodigoImmutableError';
  }
}

/** BR-003: Incidence conflict detected (duplicate framer + object) */
export class IncidenceConflictError extends Error {
  public readonly code = 'INCIDENCE_CONFLICT';
  public readonly statusCode = 422;

  constructor(framerId: string, targetObjectId: string) {
    super(
      `Conflito de incidência detectado: enquadrador ${framerId} + objeto ${targetObjectId} já possui regra ativa. Resolva o conflito antes de salvar.`,
    );
    this.name = 'IncidenceConflictError';
  }
}

/** BR-005: PUBLISHED routine is immutable */
export class RoutineImmutableError extends Error {
  public readonly code = 'ROUTINE_IMMUTABLE';
  public readonly statusCode = 422;

  constructor(routineId: string) {
    super(`Rotinas publicadas são imutáveis (${routineId}). Use o fork para criar nova versão.`);
    this.name = 'RoutineImmutableError';
  }
}

/** BR-006: Cannot publish routine without items */
export class RoutineNoItemsError extends Error {
  public readonly code = 'ROUTINE_NO_ITEMS';
  public readonly statusCode = 422;

  constructor(routineId: string) {
    super(`Rotinas sem itens não podem ser publicadas (${routineId}).`);
    this.name = 'RoutineNoItemsError';
  }
}

/** BR-007: Only PUBLISHED routines can be linked */
export class RoutineDraftLinkError extends Error {
  public readonly code = 'ROUTINE_DRAFT_LINK';
  public readonly statusCode = 422;

  constructor(routineId: string) {
    super(`Apenas rotinas publicadas podem ser vinculadas a regras de incidência (${routineId}).`);
    this.name = 'RoutineDraftLinkError';
  }
}

/** BR-012: DEPRECATED routines cannot receive new links */
export class RoutineDeprecatedLinkError extends Error {
  public readonly code = 'ROUTINE_DEPRECATED_LINK';
  public readonly statusCode = 422;

  constructor(routineId: string) {
    super(`Rotinas depreciadas não aceitam novos vínculos (${routineId}).`);
    this.name = 'RoutineDeprecatedLinkError';
  }
}
