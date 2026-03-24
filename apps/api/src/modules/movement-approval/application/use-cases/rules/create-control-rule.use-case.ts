/**
 * Use Case: CreateControlRule
 * POST /api/v1/control-rules
 * Scope: approval:rule:write
 * Idempotent by codigo within tenant.
 */

import { MovementControlRule } from '../../../domain/index.js';
import type { MovementControlRuleProps, ControlRuleStatus } from '../../../domain/index.js';
import { createMovementApprovalEvent } from '../../../domain/events/movement-approval-events.js';
import type {
  ControlRuleRepository,
  UnitOfWork,
  TransactionContext,
} from '../../ports/repositories.js';
import type { DomainEventRepository, IdGeneratorService } from '../../ports/services.js';
import type { OriginType } from '../../../domain/value-objects/origin-type.vo.js';
import type { ApprovalCriteria } from '../../../domain/value-objects/approval-criteria.vo.js';

// ---------------------------------------------------------------------------
// Input / Output
// ---------------------------------------------------------------------------

export interface CreateControlRuleInput {
  readonly tenantId: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao?: string;
  readonly objectType: string;
  readonly operationType: string;
  readonly originTypes: readonly OriginType[];
  readonly criteriaType: ApprovalCriteria;
  readonly valueThreshold?: number;
  readonly priority: number;
  readonly status?: ControlRuleStatus;
  readonly validFrom: string; // ISO date
  readonly validUntil?: string; // ISO date
  readonly correlationId: string;
  readonly actorId: string;
}

export interface CreateControlRuleOutput {
  readonly controlRule: MovementControlRuleProps;
}

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export class CreateControlRuleUseCase {
  constructor(
    private readonly controlRuleRepo: ControlRuleRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: CreateControlRuleInput): Promise<CreateControlRuleOutput> {
    // 1. Idempotency check by codigo
    const existing = await this.controlRuleRepo.findByCodigo(input.codigo, input.tenantId);
    if (existing) {
      return { controlRule: existing };
    }

    // 2. Create entity
    const now = new Date();
    const props: MovementControlRuleProps = {
      id: this.idGen.generate(),
      tenantId: input.tenantId,
      codigo: input.codigo,
      nome: input.nome,
      descricao: input.descricao ?? null,
      objectType: input.objectType,
      operationType: input.operationType,
      originTypes: input.originTypes,
      criteriaType: input.criteriaType,
      valueThreshold: input.valueThreshold ?? null,
      priority: input.priority,
      status: input.status ?? 'ACTIVE',
      validFrom: new Date(input.validFrom),
      validUntil: input.validUntil ? new Date(input.validUntil) : null,
      createdAt: now,
      updatedAt: now,
    };

    const entity = MovementControlRule.create(props);

    // 3. Persist in transaction
    return this.uow.transaction(async (tx: TransactionContext) => {
      const created = await this.controlRuleRepo.create(entity.toProps(), tx);

      // 4. Emit domain event
      await this.eventRepo.create(
        createMovementApprovalEvent({
          tenantId: input.tenantId,
          entityType: 'control_rule',
          entityId: created.id,
          eventType: 'approval.control_rule_created',
          payload: {
            codigo: created.codigo,
            nome: created.nome,
            objectType: created.objectType,
            operationType: created.operationType,
            priority: created.priority,
          },
          correlationId: input.correlationId,
          createdBy: input.actorId,
        }),
        tx,
      );

      return { controlRule: created };
    });
  }
}
