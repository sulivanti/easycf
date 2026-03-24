/**
 * @contract BR-010, DATA-005 §2.1
 *
 * Value Object representing the state machine: DRAFT → PUBLISHED → DEPRECATED.
 * Transitions are irreversible (BR-010).
 */

export const CYCLE_STATUSES = ['DRAFT', 'PUBLISHED', 'DEPRECATED'] as const;
export type CycleStatus = (typeof CYCLE_STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<CycleStatus, CycleStatus[]> = {
  DRAFT: ['PUBLISHED'],
  PUBLISHED: ['DEPRECATED'],
  DEPRECATED: [],
};

export function canTransition(from: CycleStatus, to: CycleStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertTransition(from: CycleStatus, to: CycleStatus): void {
  if (!canTransition(from, to)) {
    throw new Error(
      `Invalid cycle status transition: ${from} → ${to}. Allowed: ${ALLOWED_TRANSITIONS[from].join(', ') || 'none'}`,
    );
  }
}
