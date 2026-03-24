/**
 * Use Case: UpdateControlRule
 * PATCH /api/v1/control-rules/:id
 * Scope: approval:rule:write
 */

import { MovementControlRule } from '../../../domain/index.js';
import { ControlRuleNotFoundError } from '../../../domain/index.js';
import type { MovementControlRuleProps, ControlRuleStatus } from '../../../domain/index.js';
import { createMovementApprovalEvent } from '../../../domain/events/movement-approval-events.js';
import type {
  ControlRuleRepository,
  UnitOfWork,
  TransactionContext,
} from '../../ports/repositories.js';
import type { DomainEventRepository } from '../../ports/services.js';
import type { OriginType } from '../../../domain/value-objects/origin-type.vo.js';
import type { ApprovalCriteria } from '../../../domain/value-objects/approval-criteria.vo.js';

// ---------------------------------------------------------------------------
// Input / Output
// ---------------------------------------------------------------------------

export interface UpdateControlRuleInput {
  readonly id: string;
  readonly tenantId: string;
  readonly nome?: string;
  readonly descricao?: string;
  readonly originTypes?: readonly OriginType[];
  readonly criteriaType?: ApprovalCriteria;
  readonly valueThreshold?: number | null;
  readonly priority?: number;
  readonly status?: ControlRuleStatus;
  readonly validFrom?: string;
  readonly validUntil?: string | null;
  readonly correlationId: string;
  readonly actorId: string;
}

export interface UpdateControlRuleOutput {
  readonly controlRule: MovementControlRuleProps;
}

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export class UpdateControlRuleUseCase {
  constructor(
    private readonly controlRuleRepo: ControlRuleRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: UpdateControlRuleInput): Promise<UpdateControlRuleOutput> {
    // 1. Fetch existing rule
    const existing = await this.controlRuleRepo.findById(input.id, input.tenantId);
    if (!existing) {
      throw new ControlRuleNotFoundError(input.id);
    }

    // 2. Merge changes
    const now = new Date();
    const updatedProps: MovementControlRuleProps = {
      ...existing,
      nome: input.nome ?? existing.nome,
      descricao: input.descricao !== undefined ? input.descricao : existing.descricao,
      originTypes: input.originTypes ?? existing.originTypes,
      criteriaType: input.criteriaType ?? existing.criteriaType,
      valueThreshold:
        input.valueThreshold !== undefined ? input.valueThreshold : existing.valueThreshold,
      priority: input.priority ?? existing.priority,
      status: input.status ?? existing.status,
      validFrom: input.validFrom ? new Date(input.validFrom) : existing.validFrom,
      validUntil:
        input.validUntil !== undefined
          ? input.validUntil
            ? new Date(input.validUntil)
            : null
          : existing.validUntil,
      updatedAt: now,
    };

    const entity = MovementControlRule.fromPersistence(updatedProps);

    // 3. Persist in transaction
    return this.uow.transaction(async (tx: TransactionContext) => {
      const updated = await this.controlRuleRepo.update(entity.toProps(), tx);

      // 4. Emit domain event
      await this.eventRepo.create(
        createMovementApprovalEvent({
          tenantId: input.tenantId,
          entityType: 'control_rule',
          entityId: updated.id,
          eventType: 'approval.control_rule_updated',
          payload: {
            codigo: updated.codigo,
            changes: Object.keys(input).filter(
              (k) => !['id', 'tenantId', 'correlationId', 'actorId'].includes(k),
            ),
          },
          correlationId: input.correlationId,
          createdBy: input.actorId,
        }),
        tx,
      );

      return { controlRule: updated };
    });
  }
}
