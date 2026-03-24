/**
 * @contract BR-012, BR-016, DATA-006 §5.1
 *
 * Value Object representing the case lifecycle state machine:
 * OPEN → COMPLETED (terminal stage), ON_HOLD (hold), CANCELLED (cancel).
 * ON_HOLD → OPEN (resume), CANCELLED (cancel).
 * COMPLETED → OPEN (REOPENED — requires scope process:case:reopen + target_stage_id).
 */

export const CASE_STATUSES = [
  "OPEN",
  "COMPLETED",
  "CANCELLED",
  "ON_HOLD",
] as const;
export type CaseStatus = (typeof CASE_STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<CaseStatus, CaseStatus[]> = {
  OPEN: ["COMPLETED", "ON_HOLD", "CANCELLED"],
  ON_HOLD: ["OPEN", "CANCELLED"],
  COMPLETED: ["OPEN"], // REOPENED — BR-016
  CANCELLED: [],
};

export function canTransitionStatus(
  from: CaseStatus,
  to: CaseStatus,
): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertStatusTransition(
  from: CaseStatus,
  to: CaseStatus,
): void {
  if (!canTransitionStatus(from, to)) {
    throw new Error(
      `Invalid case status transition: ${from} → ${to}. Allowed: ${ALLOWED_TRANSITIONS[from].join(", ") || "none"}`,
    );
  }
}
