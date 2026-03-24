/**
 * @contract INT-006, ADR-005, PENDENTE-002
 *
 * Port for checking delegation expiration from MOD-004 (Identity Advanced).
 * Used by the background job (FR-014) to deactivate assignments
 * whose delegations have expired.
 */

export interface ExpiredDelegation {
  delegationId: string;
  delegatorId: string;
  delegateId: string;
  expiredAt: Date;
}

export interface DelegationCheckerPort {
  getExpiredDelegations(): Promise<ExpiredDelegation[]>;
}
