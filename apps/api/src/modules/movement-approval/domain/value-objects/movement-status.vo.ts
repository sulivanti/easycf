/**
 * Value Object: MovementStatus
 * Enum with transition validation for controlled movements.
 */

export type MovementStatus =
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'AUTO_APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'OVERRIDDEN'
  | 'EXECUTED'
  | 'FAILED';

/**
 * Valid transitions: from → to[]
 */
export const MOVEMENT_STATUS_TRANSITIONS: Record<MovementStatus, readonly MovementStatus[]> = {
  PENDING_APPROVAL: ['APPROVED', 'AUTO_APPROVED', 'REJECTED', 'CANCELLED', 'OVERRIDDEN'],
  APPROVED: ['EXECUTED', 'FAILED'],
  AUTO_APPROVED: [], // terminal
  REJECTED: [], // terminal
  CANCELLED: [], // terminal
  OVERRIDDEN: ['EXECUTED', 'FAILED'],
  EXECUTED: [], // terminal
  FAILED: [], // terminal
};

export function isValidMovementTransition(from: MovementStatus, to: MovementStatus): boolean {
  return MOVEMENT_STATUS_TRANSITIONS[from].includes(to);
}
