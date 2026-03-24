/**
 * @contract BR-010, DATA-010
 *
 * Value Object: ExecutionStatus
 * 9 estados para mcp_executions. Append-only — transições permitidas
 * apenas para frente (RECEIVED → terminal).
 */

export type ExecutionStatus =
  | 'RECEIVED'
  | 'DISPATCHED'
  | 'DIRECT_SUCCESS'
  | 'DIRECT_FAILED'
  | 'CONTROLLED_PENDING'
  | 'CONTROLLED_APPROVED'
  | 'CONTROLLED_REJECTED'
  | 'EVENT_EMITTED'
  | 'BLOCKED';

const EXECUTION_STATUS_TRANSITIONS: Record<ExecutionStatus, readonly ExecutionStatus[]> = {
  RECEIVED: ['DISPATCHED', 'BLOCKED'],
  DISPATCHED: ['DIRECT_SUCCESS', 'DIRECT_FAILED', 'CONTROLLED_PENDING', 'EVENT_EMITTED'],
  DIRECT_SUCCESS: [], // terminal
  DIRECT_FAILED: [], // terminal
  CONTROLLED_PENDING: ['CONTROLLED_APPROVED', 'CONTROLLED_REJECTED'],
  CONTROLLED_APPROVED: [], // terminal
  CONTROLLED_REJECTED: [], // terminal
  EVENT_EMITTED: [], // terminal
  BLOCKED: [], // terminal
};

export function isValidExecutionTransition(from: ExecutionStatus, to: ExecutionStatus): boolean {
  return EXECUTION_STATUS_TRANSITIONS[from].includes(to);
}

export function isTerminalExecutionStatus(status: ExecutionStatus): boolean {
  return EXECUTION_STATUS_TRANSITIONS[status].length === 0;
}
