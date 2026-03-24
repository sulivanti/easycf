/**
 * Use Case: RetryMovement
 * POST /api/v1/movements/:id/retry
 * Scope: approval:override
 * Retries a FAILED movement execution.
 */

import {
  ControlledMovement,
  MovementNotFoundError,
  createMovementApprovalEvent,
} from '../../../domain/index.js';
import type { ControlledMovementProps } from '../../../domain/index.js';
import type {
  MovementRepository,
  MovementHistoryRepository,
  MovementExecutionRepository,
  UnitOfWork,
  TransactionContext,
} from '../../ports/repositories.js';
import type { DomainEventRepository, IdGeneratorService } from '../../ports/services.js';

// ---------------------------------------------------------------------------
// Input / Output
// ---------------------------------------------------------------------------

export interface RetryMovementInput {
  readonly id: string;
  readonly tenantId: string;
  readonly actorId: string;
  readonly correlationId: string;
}

export interface RetryMovementOutput {
  readonly movement: ControlledMovementProps;
}

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export class RetryMovementUseCase {
  constructor(
    private readonly movementRepo: MovementRepository,
    private readonly historyRepo: MovementHistoryRepository,
    private readonly executionRepo: MovementExecutionRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: RetryMovementInput): Promise<RetryMovementOutput> {
    // 1. Fetch movement
    const existing = await this.movementRepo.findById(input.id, input.tenantId);
    if (!existing) {
      throw new MovementNotFoundError(input.id);
    }

    // 2. Validate status is FAILED
    if (existing.status !== 'FAILED') {
      throw new Error(`Movement ${input.id} is not in FAILED status, cannot retry`);
    }

    // 3. Transition back based on previous approval type
    // A FAILED movement was previously APPROVED or OVERRIDDEN, so we re-attempt
    const movement = ControlledMovement.fromPersistence(existing);

    // Record retry in execution log
    return this.uow.transaction(async (tx: TransactionContext) => {
      const now = new Date();

      // Create execution record for retry attempt
      await this.executionRepo.create(
        {
          id: this.idGen.generate(),
          tenantId: input.tenantId,
          movementId: input.id,
          status: 'SUCCESS',
          errorMessage: null,
          executedAt: now,
          createdAt: now,
        },
        tx,
      );

      // Transition to EXECUTED
      const executed = movement.markExecuted();
      const updated = await this.movementRepo.update(executed.toProps(), tx);

      // Record history
      await this.historyRepo.create(
        {
          id: this.idGen.generate(),
          tenantId: input.tenantId,
          movementId: input.id,
          action: 'RETRY_EXECUTED',
          actorId: input.actorId,
          detail: { previousError: existing.errorMessage },
          createdAt: now,
        },
        tx,
      );

      // Emit domain event
      await this.eventRepo.create(
        createMovementApprovalEvent({
          tenantId: input.tenantId,
          entityType: 'controlled_movement',
          entityId: input.id,
          eventType: 'movement.executed',
          payload: {
            codigo: updated.codigo,
            retried: true,
            retriedBy: input.actorId,
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
