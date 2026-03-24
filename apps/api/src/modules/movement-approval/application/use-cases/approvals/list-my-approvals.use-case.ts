/**
 * Use Case: ListMyApprovals
 * GET /api/v1/my/approvals?status
 * No special scope required — filtered by actor.
 */

import type { ApprovalInstanceProps, ApprovalInstanceStatus } from '../../../domain/index.js';
import type { ApprovalInstanceRepository } from '../../ports/repositories.js';

// ---------------------------------------------------------------------------
// Input / Output
// ---------------------------------------------------------------------------

export interface ListMyApprovalsInput {
  readonly actorId: string;
  readonly tenantId: string;
  readonly status?: ApprovalInstanceStatus;
}

export interface ListMyApprovalsOutput {
  readonly approvals: ApprovalInstanceProps[];
}

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export class ListMyApprovalsUseCase {
  constructor(private readonly approvalInstanceRepo: ApprovalInstanceRepository) {}

  async execute(input: ListMyApprovalsInput): Promise<ListMyApprovalsOutput> {
    const approvals = await this.approvalInstanceRepo.findPendingByApprover(
      input.actorId,
      input.tenantId,
      input.status,
    );

    return { approvals };
  }
}
