/**
 * Use Case: ApproveMovement
 * POST /api/v1/movements/:id/approve
 * Scope: approval:decide
 * Opinion must be >= 10 chars.
 *
 * Flow:
 * 1. Fetch movement, verify PENDING_APPROVAL
 * 2. Segregation check: actorId !== requesterId
 * 3. Find current level's approval instance for this approver
 * 4. Mark instance APPROVED with opinion
 * 5. If currentLevel === totalLevels -> approve movement, emit movement.approved
 * 6. Else -> advance level, create next level instances
 */

import {
  ControlledMovement,
  ApprovalInstance,
  ApprovalRule,
  MovementNotFoundError,
  MovementNotPendingError,
  createMovementApprovalEvent,
} from '../../../domain/index.js';
import type { ControlledMovementProps } from '../../../domain/index.js';
import type {
  MovementRepository,
  ApprovalInstanceRepository,
  ApprovalRuleRepository,
  MovementHistoryRepository,
  UnitOfWork,
  TransactionContext,
} from '../../ports/repositories.js';
import type { DomainEventRepository, IdGeneratorService } from '../../ports/services.js';

// ---------------------------------------------------------------------------
// Input / Output
// ---------------------------------------------------------------------------

export interface ApproveMovementInput {
  readonly movementId: string;
  readonly tenantId: string;
  readonly actorId: string;
  readonly opinion: string;
  readonly correlationId: string;
}

export interface ApproveMovementOutput {
  readonly movement: ControlledMovementProps;
  readonly levelCompleted: boolean;
  readonly fullyApproved: boolean;
}

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export class ApproveMovementUseCase {
  constructor(
    private readonly movementRepo: MovementRepository,
    private readonly approvalInstanceRepo: ApprovalInstanceRepository,
    private readonly approvalRuleRepo: ApprovalRuleRepository,
    private readonly historyRepo: MovementHistoryRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: ApproveMovementInput): Promise<ApproveMovementOutput> {
    // 1. Fetch movement
    const existingProps = await this.movementRepo.findById(input.movementId, input.tenantId);
    if (!existingProps) {
      throw new MovementNotFoundError(input.movementId);
    }

    const movement = ControlledMovement.fromPersistence(existingProps);

    // 2. Verify PENDING_APPROVAL
    if (movement.status !== 'PENDING_APPROVAL') {
      throw new MovementNotPendingError(input.movementId);
    }

    // 3. Segregation check
    movement.assertCanDecide(input.actorId);

    // 4. Find current level approval instances
    const allInstances = await this.approvalInstanceRepo.findByMovement(
      input.movementId,
      input.tenantId,
    );
    const currentLevelInstances = allInstances.filter(
      (i) => i.level === movement.currentLevel && i.status === 'PENDING',
    );

    if (currentLevelInstances.length === 0) {
      throw new Error(`No pending approval instances at level ${movement.currentLevel}`);
    }

    // Pick the first pending instance for this approver
    const targetInstance = currentLevelInstances[0]!;
    const instance = ApprovalInstance.fromPersistence(targetInstance);
    const approved = instance.approve(input.actorId, input.opinion);

    // 5. Determine if this completes the level and/or entire approval
    const isFinalLevel = movement.currentLevel >= movement.totalLevels;

    return this.uow.transaction(async (tx: TransactionContext) => {
      const now = new Date();

      // Update approval instance
      await this.approvalInstanceRepo.update(approved.toProps(), tx);

      let updatedMovement: ControlledMovement;
      let fullyApproved = false;

      if (isFinalLevel) {
        // Final level — approve the movement
        updatedMovement = movement.approve();
        fullyApproved = true;

        await this.eventRepo.create(
          createMovementApprovalEvent({
            tenantId: input.tenantId,
            entityType: 'controlled_movement',
            entityId: input.movementId,
            eventType: 'movement.approved',
            payload: {
              codigo: movement.codigo,
              approvedBy: input.actorId,
              level: movement.currentLevel,
              totalLevels: movement.totalLevels,
            },
            correlationId: input.correlationId,
            createdBy: input.actorId,
          }),
          tx,
        );
      } else {
        // Advance to next level
        updatedMovement = movement.advanceLevel();

        // Create approval instances for next level
        const nextLevel = movement.currentLevel + 1;
        const approvalRulesProps = await this.approvalRuleRepo.findByControlRule(
          movement.controlRuleId,
          input.tenantId,
          tx,
        );
        const nextLevelRules = approvalRulesProps
          .map((r) => ApprovalRule.fromPersistence(r))
          .filter((r) => r.level === nextLevel);

        const nextInstances = nextLevelRules.map((rule) => ({
          id: this.idGen.generate(),
          tenantId: input.tenantId,
          movementId: input.movementId,
          level: nextLevel,
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

        if (nextInstances.length > 0) {
          await this.approvalInstanceRepo.createMany(nextInstances, tx);
        }
      }

      // Persist movement state
      const updated = await this.movementRepo.update(updatedMovement.toProps(), tx);

      // Record history
      await this.historyRepo.create(
        {
          id: this.idGen.generate(),
          tenantId: input.tenantId,
          movementId: input.movementId,
          action: fullyApproved ? 'APPROVED' : 'LEVEL_APPROVED',
          actorId: input.actorId,
          detail: {
            level: movement.currentLevel,
            opinion: input.opinion,
            fullyApproved,
          },
          createdAt: now,
        },
        tx,
      );

      return {
        movement: updated,
        levelCompleted: true,
        fullyApproved,
      };
    });
  }
}
