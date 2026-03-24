/**
 * @contract DATA-006 §5.2
 *
 * Value Object representing gate resolution lifecycle:
 * PENDING → RESOLVED (approve/document/checklist), REJECTED (reject), WAIVED (dispense).
 * Terminal states: RESOLVED, REJECTED, WAIVED.
 */

export const GATE_RESOLUTION_STATUSES = ['PENDING', 'RESOLVED', 'WAIVED', 'REJECTED'] as const;
export type GateResolutionStatus = (typeof GATE_RESOLUTION_STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<GateResolutionStatus, GateResolutionStatus[]> = {
  PENDING: ['RESOLVED', 'REJECTED', 'WAIVED'],
  RESOLVED: [],
  REJECTED: [],
  WAIVED: [],
};

export function canTransitionGate(from: GateResolutionStatus, to: GateResolutionStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertGateTransition(from: GateResolutionStatus, to: GateResolutionStatus): void {
  if (!canTransitionGate(from, to)) {
    throw new Error(
      `Invalid gate resolution transition: ${from} → ${to}. Allowed: ${ALLOWED_TRANSITIONS[from].join(', ') || 'none'}`,
    );
  }
}

/**
 * Whether a gate with this status blocks stage transition (BR-002).
 * Only RESOLVED and WAIVED are considered "cleared".
 */
export function isGateCleared(status: GateResolutionStatus): boolean {
  return status === 'RESOLVED' || status === 'WAIVED';
}
