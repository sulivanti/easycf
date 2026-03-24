/**
 * @contract BR-006, DATA-010
 *
 * Value Object: AgentStatus
 * Lifecycle: ACTIVE → INACTIVE ↔ ACTIVE, ACTIVE → REVOKED, INACTIVE → REVOKED.
 * REVOKED is terminal and irreversible (BR-006).
 */

export type AgentStatus = 'ACTIVE' | 'INACTIVE' | 'REVOKED';

const AGENT_STATUS_TRANSITIONS: Record<AgentStatus, readonly AgentStatus[]> = {
  ACTIVE: ['INACTIVE', 'REVOKED'],
  INACTIVE: ['ACTIVE', 'REVOKED'],
  REVOKED: [], // terminal — irreversível (BR-006)
};

export function isValidAgentTransition(from: AgentStatus, to: AgentStatus): boolean {
  return AGENT_STATUS_TRANSITIONS[from].includes(to);
}

export function isTerminalAgentStatus(status: AgentStatus): boolean {
  return status === 'REVOKED';
}
