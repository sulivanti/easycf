/**
 * Use Case: CreateApprovalRule
 * POST /api/v1/control-rules/:controlRuleId/approval-rules
 * Scope: approval:rule:write
 */

import { ApprovalRule, ControlRuleNotFoundError } from '../../../domain/index.js';
import type { ApprovalRuleProps, ApproverType } from '../../../domain/index.js';
import { createMovementApprovalEvent } from '../../../domain/events/movement-approval-events.js';
import type {
  ControlRuleRepository,
  ApprovalRuleRepository,
  UnitOfWork,
  TransactionContext,
} from '../../ports/repositories.js';
import type { DomainEventRepository, IdGeneratorService } from '../../ports/services.js';

// ---------------------------------------------------------------------------
// Input / Output
// ---------------------------------------------------------------------------

export interface CreateApprovalRuleInput {
  readonly controlRuleId: string;
  readonly tenantId: string;
  readonly level: number;
  readonly approverType: ApproverType;
  readonly approverValue: string;
  readonly requiredScope?: string;
  readonly allowSelfApprove?: boolean;
  readonly timeoutMinutes?: number;
  readonly escalationRuleId?: string;
  readonly correlationId: string;
  readonly actorId: string;
}

export interface CreateApprovalRuleOutput {
  readonly approvalRule: ApprovalRuleProps;
}

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export class CreateApprovalRuleUseCase {
  constructor(
    private readonly controlRuleRepo: ControlRuleRepository,
    private readonly approvalRuleRepo: ApprovalRuleRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: CreateApprovalRuleInput): Promise<CreateApprovalRuleOutput> {
    // 1. Verify control rule exists
    const controlRule = await this.controlRuleRepo.findById(input.controlRuleId, input.tenantId);
    if (!controlRule) {
      throw new ControlRuleNotFoundError(input.controlRuleId);
    }

    // 2. Create entity
    const now = new Date();
    const props: ApprovalRuleProps = {
      id: this.idGen.generate(),
      tenantId: input.tenantId,
      controlRuleId: input.controlRuleId,
      level: input.level,
      approverType: input.approverType,
      approverValue: input.approverValue,
      requiredScope: input.requiredScope ?? null,
      allowSelfApprove: input.allowSelfApprove ?? false,
      timeoutMinutes: input.timeoutMinutes ?? null,
      escalationRuleId: input.escalationRuleId ?? null,
      createdAt: now,
      updatedAt: now,
    };

    const entity = ApprovalRule.create(props);

    // 3. Persist in transaction
    return this.uow.transaction(async (tx: TransactionContext) => {
      const created = await this.approvalRuleRepo.create(entity.toProps(), tx);

      // 4. Emit domain event
      await this.eventRepo.create(
        createMovementApprovalEvent({
          tenantId: input.tenantId,
          entityType: 'approval_rule',
          entityId: created.id,
          eventType: 'approval.approval_rule_created',
          payload: {
            controlRuleId: input.controlRuleId,
            level: created.level,
            approverType: created.approverType,
            approverValue: created.approverValue,
          },
          correlationId: input.correlationId,
          createdBy: input.actorId,
        }),
        tx,
      );

      return { approvalRule: created };
    });
  }
}
