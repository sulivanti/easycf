/**
 * @contract SEC-008, DOC-FND-000 §2.2
 * Scope constants and permission helpers for MOD-008 integration-protheus.
 * Visibility rules: hide_if_no_permission strategy.
 */

import type { RoutineStatus } from './integration-protheus.types.js';

// -- Scope constants (SEC-008 §2) --

export const SCOPES = {
  SERVICE_READ: 'integration:service:read',
  SERVICE_WRITE: 'integration:service:write',
  ROUTINE_WRITE: 'integration:routine:write',
  EXECUTE: 'integration:execute',
  LOG_READ: 'integration:log:read',
  LOG_REPROCESS: 'integration:log:reprocess',
} as const;

// -- Permission helpers --

export function hasScope(userScopes: readonly string[], scope: string): boolean {
  return userScopes.includes(scope);
}

export function canReadServices(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.SERVICE_READ);
}

export function canWriteService(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.SERVICE_WRITE);
}

export function canWriteRoutine(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.ROUTINE_WRITE);
}

export function canExecuteIntegration(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.EXECUTE);
}

export function canReadLogs(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.LOG_READ);
}

export function canReprocessDlq(userScopes: readonly string[]): boolean {
  return hasScope(userScopes, SCOPES.LOG_REPROCESS);
}

/** Routine is editable only when parent behavior_routine is DRAFT (BR-001) */
export function isRoutineEditable(routineStatus: RoutineStatus): boolean {
  return routineStatus === 'DRAFT';
}

/** Fork button visible only for PUBLISHED routines with write scope */
export function canShowFork(userScopes: readonly string[], routineStatus: RoutineStatus): boolean {
  return canWriteRoutine(userScopes) && routineStatus === 'PUBLISHED';
}

/** Test button requires execute scope and an HML service must exist */
export function canShowTestHml(userScopes: readonly string[], hasHmlService: boolean): boolean {
  return canExecuteIntegration(userScopes) && hasHmlService;
}
