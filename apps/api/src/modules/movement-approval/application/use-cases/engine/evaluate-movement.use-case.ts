/**
 * Use Case: EvaluateMovement
 * POST /api/v1/movement-engine/evaluate
 * Scope: approval:engine:evaluate
 * Idempotent by idempotencyKey.
 *
 * Most complex use case in the module:
 * 1. If idempotencyKey provided, check for existing movement -> return cached
 * 2. Use ControlEngine to find matching rule
 * 3. If no rule matches -> return { controlled: false }
 * 4. If dryRun -> return evaluation without creating
 * 5. Use ApprovalChainResolver to get chain
 * 6. Use AutoApprovalService to check auto-approve eligibility
 * 7. If auto-approve -> create movement with AUTO_APPROVED
 * 8. Else -> create movement PENDING_APPROVAL + approval instances for level 1
 */

import {
  ControlledMovement,
  MovementControlRule,
  ApprovalRule,
  ControlEngine,
  ApprovalChainResolver,
  AutoApprovalService,
  createMovementApprovalEvent,
} from '../../../domain/index.js';
import type { ControlledMovementProps, MovementStatus } from '../../../domain/index.js';
import type { OriginType } from '../../../domain/value-objects/origin-type.vo.js';
import type {
  ControlRuleRepository,
  ApprovalRuleRepository,
  MovementRepository,
  ApprovalInstanceRepository,
  MovementHistoryRepository,
  UnitOfWork,
  TransactionContext,
} from '../../ports/repositories.js';
import type {
  DomainEventRepository,
  IdGeneratorService,
  CodigoGeneratorService,
} from '../../ports/services.js';

// ---------------------------------------------------------------------------
// Input / Output
// ---------------------------------------------------------------------------

export interface EvaluateMovementInput {
  readonly tenantId: string;
  readonly objectType: string;
  readonly operationType: string;
  readonly origin: OriginType;
  readonly value?: number;
  readonly operationPayload?: Record<string, unknown>;
  readonly objectId: string;
  readonly caseId?: string;
  readonly dryRun?: boolean;
  readonly idempotencyKey?: string;
  readonly requesterId: string;
  readonly requesterScopes: readonly string[];
  readonly correlationId: string;
}

export interface EvaluateMovementOutput {
  readonly controlled: boolean;
  readonly movementId?: string;
  readonly status?: MovementStatus;
  readonly ruleId?: string;
  readonly levels?: number;
}

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export class EvaluateMovementUseCase {
  private readonly controlEngine = new ControlEngine();
  private readonly chainResolver = new ApprovalChainResolver();
  private readonly autoApprovalService = new AutoApprovalService();

  constructor(
    private readonly controlRuleRepo: ControlRuleRepository,
    private readonly approvalRuleRepo: ApprovalRuleRepository,
    private readonly movementRepo: MovementRepository,
    private readonly approvalInstanceRepo: ApprovalInstanceRepository,
    private readonly historyRepo: MovementHistoryRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
    private readonly codigoGen: CodigoGeneratorService,
  ) {}

  async execute(input: EvaluateMovementInput): Promise<EvaluateMovementOutput> {
    // 1. Idempotency check
    if (input.idempotencyKey) {
      const existing = await this.movementRepo.findByIdempotencyKey(
        input.idempotencyKey,
        input.tenantId,
      );
      if (existing) {
        return {
          controlled: true,
          movementId: existing.id,
          status: existing.status,
        };
      }
    }

    // 2. Fetch active rules and evaluate
    const ruleProps = await this.controlRuleRepo.findActiveRules(
      input.tenantId,
      input.objectType,
      input.operationType,
    );
    const rules = ruleProps.map((r) => MovementControlRule.fromPersistence(r));

    const evaluation = this.controlEngine.evaluate(
      rules,
      input.objectType,
      input.operationType,
      input.origin,
    );

    // 3. Not controlled
    if (!evaluation.controlled || !evaluation.ruleId) {
      return { controlled: false };
    }

    // 4. Fetch approval chain for this rule
    const approvalRuleProps = await this.approvalRuleRepo.findByControlRule(
      evaluation.ruleId,
      input.tenantId,
    );
    const approvalRules = approvalRuleProps.map((r) => ApprovalRule.fromPersistence(r));
    const chain = this.chainResolver.resolveChain(approvalRules);
    const totalLevels = chain.length;

    // 5. Dry run — return evaluation without creating
    if (input.dryRun) {
      return {
        controlled: true,
        ruleId: evaluation.ruleId,
        levels: totalLevels,
      };
    }

    // 6. Check auto-approve eligibility
    const canAutoApprove = this.autoApprovalService.canAutoApprove(input.requesterScopes, chain);

    // 7. Create movement in transaction
    return this.uow.transaction(async (tx: TransactionContext) => {
      const now = new Date();
      const movementId = this.idGen.generate();
      const codigo = await this.codigoGen.nextMovementCodigo(input.tenantId, tx);
      const idempotencyKey = input.idempotencyKey ?? this.idGen.generate();

      const initialStatus: MovementStatus = canAutoApprove ? 'AUTO_APPROVED' : 'PENDING_APPROVAL';

      const movementProps: ControlledMovementProps = {
        id: movementId,
        tenantId: input.tenantId,
        controlRuleId: evaluation.ruleId!,
        codigo,
        requesterId: input.requesterId,
        requesterOrigin: input.origin,
        objectType: input.objectType,
        objectId: input.objectId,
        operationType: input.operationType,
        operationPayload: input.operationPayload ?? {},
        caseId: input.caseId ?? null,
        currentLevel: canAutoApprove ? totalLevels : 1,
        totalLevels,
        status: initialStatus,
        idempotencyKey,
        errorMessage: null,
        createdAt: now,
        updatedAt: now,
      };

      const movement = ControlledMovement.create(movementProps);
      await this.movementRepo.create(movement.toProps(), tx);

      // 8a. Auto-approved — emit event
      if (canAutoApprove) {
        await this.eventRepo.create(
          createMovementApprovalEvent({
            tenantId: input.tenantId,
            entityType: 'controlled_movement',
            entityId: movementId,
            eventType: 'movement.auto_approved',
            payload: {
              codigo,
              ruleId: evaluation.ruleId,
              objectType: input.objectType,
              operationType: input.operationType,
              requesterId: input.requesterId,
            },
            correlationId: input.correlationId,
            createdBy: input.requesterId,
          }),
          tx,
        );

        // Record history
        await this.historyRepo.create(
          {
            id: this.idGen.generate(),
            tenantId: input.tenantId,
            movementId,
            action: 'AUTO_APPROVED',
            actorId: input.requesterId,
            detail: { ruleId: evaluation.ruleId },
            createdAt: now,
          },
          tx,
        );

        return {
          controlled: true,
          movementId,
          status: 'AUTO_APPROVED' as MovementStatus,
          ruleId: evaluation.ruleId,
          levels: totalLevels,
        };
      }

      // 8b. Pending approval — create approval instances for level 1
      const level1Rules = chain.filter((r) => r.level === 1);
      const instanceProps = level1Rules.map((rule) => ({
        id: this.idGen.generate(),
        tenantId: input.tenantId,
        movementId,
        level: 1,
        approverId: null,
        status: 'PENDING' as const,
        opinion: null,
        decidedAt: null,
        timeoutAt: rule.timeoutMinutes
          ? new Date(now.getTime() + rule.timeoutMinutes * 60_000)
          : null,
        createdAt: now,
        updatedAt: now,
      }));

      await this.approvalInstanceRepo.createMany(instanceProps, tx);

      // Emit movement.created event
      await this.eventRepo.create(
        createMovementApprovalEvent({
          tenantId: input.tenantId,
          entityType: 'controlled_movement',
          entityId: movementId,
          eventType: 'movement.created',
          payload: {
            codigo,
            ruleId: evaluation.ruleId,
            objectType: input.objectType,
            operationType: input.operationType,
            requesterId: input.requesterId,
            totalLevels,
          },
          correlationId: input.correlationId,
          createdBy: input.requesterId,
        }),
        tx,
      );

      // Record history
      await this.historyRepo.create(
        {
          id: this.idGen.generate(),
          tenantId: input.tenantId,
          movementId,
          action: 'CREATED',
          actorId: input.requesterId,
          detail: {
            ruleId: evaluation.ruleId,
            totalLevels,
            level1Instances: instanceProps.length,
          },
          createdAt: now,
        },
        tx,
      );

      return {
        controlled: true,
        movementId,
        status: 'PENDING_APPROVAL' as MovementStatus,
        ruleId: evaluation.ruleId,
        levels: totalLevels,
      };
    });
  }
}
