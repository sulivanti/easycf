/**
 * Domain Service: AutoApprovalService
 * Checks auto-approval eligibility.
 * Pure function — no IO, receives data and returns result.
 */

import type { ApprovalRule } from '../entities/approval-rule.entity.js';

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------
export class AutoApprovalService {
  /**
   * Checks if requester can auto-approve across all levels with allowSelfApprove=true.
   * Returns true only if ALL levels that allow self-approval are satisfied by requester scopes.
   *
   * @param requesterScopes - Scopes held by the requester
   * @param approvalRules - The full approval chain
   */
  canAutoApprove(
    requesterScopes: readonly string[],
    approvalRules: readonly ApprovalRule[],
  ): boolean {
    if (approvalRules.length === 0) return false;

    return approvalRules.every((rule) => rule.canAutoApprove(requesterScopes));
  }
}
