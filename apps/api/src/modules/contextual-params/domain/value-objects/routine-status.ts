/**
 * @contract BR-005, BR-008, BR-012, DATA-007 E-006
 *
 * Value Object representing the routine state machine: DRAFT → PUBLISHED → DEPRECATED.
 * PUBLISHED is immutable (BR-005). Fork only from PUBLISHED (BR-008).
 * DEPRECATED blocks new incidence links (BR-012).
 */

export const ROUTINE_STATUSES = ['DRAFT', 'PUBLISHED', 'DEPRECATED'] as const;
export type RoutineStatus = (typeof ROUTINE_STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<RoutineStatus, RoutineStatus[]> = {
  DRAFT: ['PUBLISHED'],
  PUBLISHED: ['DEPRECATED'],
  DEPRECATED: [],
};

export function canTransition(from: RoutineStatus, to: RoutineStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertTransition(from: RoutineStatus, to: RoutineStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(
      `Invalid routine status transition: ${from} → ${to}. Allowed: ${ALLOWED_TRANSITIONS[from].join(', ') || 'none'}`,
    );
  }
}
