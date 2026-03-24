/**
 * @contract SEC-007, DOC-FND-000 §2.2
 * Scope constants and permission helpers for MOD-007 contextual-params.
 * Visibility rules: hide_if_no_permission strategy.
 */

import type { FramerStatus, RoutineStatus } from './contextual-params.types.js';

// -- Scope constants (SEC-007) --

export const SCOPES = {
  FRAMER_READ: 'param:framer:read',
  FRAMER_WRITE: 'param:framer:write',
  FRAMER_DELETE: 'param:framer:delete',
  ROUTINE_READ: 'param:routine:read',
  ROUTINE_WRITE: 'param:routine:write',
  ROUTINE_PUBLISH: 'param:routine:publish',
  ENGINE_EVALUATE: 'param:engine:evaluate',
} as const;

// -- Permission helpers --

export function hasScope(userScopes: readonly string[], scope: string): boolean {
  return userScopes.includes(scope);
}

export function canReadFramers(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.FRAMER_READ);
}

export function canWriteFramers(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.FRAMER_WRITE);
}

export function canDeleteFramers(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.FRAMER_DELETE);
}

/** @contract BR-002 — Deactivate visible only for ACTIVE framers with delete scope */
export function canDeactivateFramer(userScopes: readonly string[], status: FramerStatus): boolean {
  return hasScope(userScopes, SCOPES.FRAMER_DELETE) && status === 'ACTIVE';
}

export function canReadRoutines(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.ROUTINE_READ);
}

export function canWriteRoutines(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.ROUTINE_WRITE);
}

/** @contract BR-005 — Publish visible only for DRAFT routines with publish scope */
export function canPublishRoutine(userScopes: readonly string[], status: RoutineStatus): boolean {
  return hasScope(userScopes, SCOPES.ROUTINE_PUBLISH) && status === 'DRAFT';
}

/** @contract FR-008 — Fork visible only for PUBLISHED routines with write scope */
export function canForkRoutine(userScopes: readonly string[], status: RoutineStatus): boolean {
  return hasScope(userScopes, SCOPES.ROUTINE_WRITE) && status === 'PUBLISHED';
}

/** @contract BR-007 — Link only PUBLISHED routines */
export function canLinkRoutineToRule(
  userScopes: readonly string[],
  routineStatus: RoutineStatus,
): boolean {
  return hasScope(userScopes, SCOPES.FRAMER_WRITE) && routineStatus === 'PUBLISHED';
}

export function canEvaluateEngine(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.ENGINE_EVALUATE);
}
