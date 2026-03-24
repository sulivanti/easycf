/**
 * Use Case: UpdateApprovalRule
 * PATCH /api/v1/approval-rules/:id
 * Scope: approval:rule:write
 */

import { ApprovalRule } from '../../../domain/index.js';
import type { ApprovalRuleProps, ApproverType } from '../../../domain/index.js';
import type {
  ApprovalRuleRepository,
  UnitOfWork,
  TransactionContext,
} from '../../ports/repositories.js';
import type { DomainEventRepository } from '../../ports/services.js';

// ---------------------------------------------------------------------------
// Input / Output
// ---------------------------------------------------------------------------

export interface UpdateApprovalRuleInput {
  readonly id: string;
  readonly tenantId: string;
  readonly approverType?: ApproverType;
  readonly approverValue?: string;
  readonly requiredScope?: string | null;
  readonly allowSelfApprove?: boolean;
  readonly timeoutMinutes?: number | null;
  readonly escalationRuleId?: string | null;
  readonly correlationId: string;
  readonly actorId: string;
}

export interface UpdateApprovalRuleOutput {
  readonly approvalRule: ApprovalRuleProps;
}

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export class UpdateApprovalRuleUseCase {
  constructor(
    private readonly approvalRuleRepo: ApprovalRuleRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: UpdateApprovalRuleInput): Promise<UpdateApprovalRuleOutput> {
    // 1. Fetch existing
    const existing = await this.approvalRuleRepo.findById(input.id, input.tenantId);
    if (!existing) {
      throw new Error(`ApprovalRule ${input.id} not found`);
    }

    // 2. Merge changes
    const now = new Date();
    const updatedProps: ApprovalRuleProps = {
      ...existing,
      approverType: input.approverType ?? existing.approverType,
      approverValue: input.approverValue ?? existing.approverValue,
      requiredScope:
        input.requiredScope !== undefined ? input.requiredScope : existing.requiredScope,
      allowSelfApprove: input.allowSelfApprove ?? existing.allowSelfApprove,
      timeoutMinutes:
        input.timeoutMinutes !== undefined ? input.timeoutMinutes : existing.timeoutMinutes,
      escalationRuleId:
        input.escalationRuleId !== undefined ? input.escalationRuleId : existing.escalationRuleId,
      updatedAt: now,
    };

    const entity = ApprovalRule.fromPersistence(updatedProps);

    // 3. Persist in transaction
    return this.uow.transaction(async (tx: TransactionContext) => {
      const updated = await this.approvalRuleRepo.update(entity.toProps(), tx);

      return { approvalRule: updated };
    });
  }
}
