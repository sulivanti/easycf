/**
 * Domain Service: ApprovalChainResolver
 * Resolves the approval chain for a movement.
 * Pure function — no IO, receives data and returns result.
 */

import type { ApprovalRule } from '../entities/approval-rule.entity.js';

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------
export class ApprovalChainResolver {
  /**
   * Resolves the approval chain for a control rule.
   * Returns ordered list of approval levels (sorted by level ascending).
   *
   * @param approvalRules - Pre-fetched approval rules for the control rule
   */
  resolveChain(approvalRules: readonly ApprovalRule[]): ApprovalRule[] {
    return [...approvalRules].sort((a, b) => a.level - b.level);
  }
}
