/**
 * @contract DATA-008 §2.5, BR-007, BR-009
 *
 * Value Object representing the call log lifecycle state machine:
 * QUEUED → RUNNING → SUCCESS (terminal)
 *                  → FAILED → QUEUED (retry, if attempt < retry_max)
 *                  → DLQ (retry exhausted)
 * DLQ → REPROCESSED (operator action, original log stays DLQ)
 *
 * Retry managed by Outbox (ADR-002), not BullMQ.
 */

export const CALL_LOG_STATUSES = [
  'QUEUED',
  'RUNNING',
  'SUCCESS',
  'FAILED',
  'DLQ',
  'REPROCESSED',
] as const;
export type CallLogStatus = (typeof CALL_LOG_STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<CallLogStatus, CallLogStatus[]> = {
  QUEUED: ['RUNNING'],
  RUNNING: ['SUCCESS', 'FAILED', 'DLQ'],
  SUCCESS: [],
  FAILED: ['QUEUED', 'DLQ'], // QUEUED = retry, DLQ = exhausted
  DLQ: ['REPROCESSED'],
  REPROCESSED: [],
};

export function canTransitionCallLog(from: CallLogStatus, to: CallLogStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export function assertCallLogTransition(from: CallLogStatus, to: CallLogStatus): void {
  if (!canTransitionCallLog(from, to)) {
    throw new Error(
      `Invalid call log status transition: ${from} → ${to}. Allowed: ${ALLOWED_TRANSITIONS[from].join(', ') || 'none'}`,
    );
  }
}

/** BR-007: Determine next status after a failure */
export function resolveFailureStatus(attemptNumber: number, retryMax: number): 'QUEUED' | 'DLQ' {
  return attemptNumber >= retryMax ? 'DLQ' : 'QUEUED';
}

/** BR-009: Calculate backoff delay for the next retry */
export function calculateBackoffMs(retryBackoffMs: number, attemptNumber: number): number {
  return retryBackoffMs * Math.pow(2, attemptNumber - 1);
}
