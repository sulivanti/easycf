/**
 * Use Case: RejectMovement
 * POST /api/v1/movements/:id/reject
 * Scope: approval:decide
 * Opinion must be >= 10 chars.
 *
 * Flow:
 * 1. Fetch movement, verify PENDING_APPROVAL
 * 2. Segregation check: actorId !== requesterId
 * 3. Find current level's approval instance
 * 4. Mark instance REJECTED with opinion
 * 5. Transition movement to REJECTED
 */

import {
  ControlledMovement,
  ApprovalInstance,
  MovementNotFoundError,
  MovementNotPendingError,
  createMovementApprovalEvent,
} from '../../../domain/index.js';
import type { ControlledMovementProps } from '../../../domain/index.js';
import type {
  MovementRepository,
  ApprovalInstanceRepository,
  MovementHistoryRepository,
  UnitOfWork,
  TransactionContext,
} from '../../ports/repositories.js';
import type { DomainEventRepository, IdGeneratorService } from '../../ports/services.js';

// ---------------------------------------------------------------------------
// Input / Output
// ---------------------------------------------------------------------------

export interface RejectMovementInput {
  readonly movementId: string;
  readonly tenantId: string;
  readonly actorId: string;
  readonly opinion: string;
  readonly correlationId: string;
}

export interface RejectMovementOutput {
  readonly movement: ControlledMovementProps;
}

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export class RejectMovementUseCase {
  constructor(
    private readonly movementRepo: MovementRepository,
    private readonly approvalInstanceRepo: ApprovalInstanceRepository,
    private readonly historyRepo: MovementHistoryRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: RejectMovementInput): Promise<RejectMovementOutput> {
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

    // 4. Find current level approval instance
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

    const targetInstance = currentLevelInstances[0]!;
    const instance = ApprovalInstance.fromPersistence(targetInstance);
    const rejected = instance.reject(input.actorId, input.opinion);

    // 5. Reject the movement
    const rejectedMovement = movement.reject();

    return this.uow.transaction(async (tx: TransactionContext) => {
      const now = new Date();

      // Update approval instance
      await this.approvalInstanceRepo.update(rejected.toProps(), tx);

      // Update movement status
      const updated = await this.movementRepo.update(rejectedMovement.toProps(), tx);

      // Record history
      await this.historyRepo.create(
        {
          id: this.idGen.generate(),
          tenantId: input.tenantId,
          movementId: input.movementId,
          action: 'REJECTED',
          actorId: input.actorId,
          detail: {
            level: movement.currentLevel,
            opinion: input.opinion,
          },
          createdAt: now,
        },
        tx,
      );

      // Emit domain event
      await this.eventRepo.create(
        createMovementApprovalEvent({
          tenantId: input.tenantId,
          entityType: 'controlled_movement',
          entityId: input.movementId,
          eventType: 'movement.rejected',
          payload: {
            codigo: movement.codigo,
            rejectedBy: input.actorId,
            level: movement.currentLevel,
            opinion: input.opinion,
          },
          correlationId: input.correlationId,
          createdBy: input.actorId,
        }),
        tx,
      );

      return { movement: updated };
    });
  }
}
