/**
 * Use Case: CancelMovement
 * POST /api/v1/movements/:id/cancel
 * Scope: approval:movement:write
 * Only requester can cancel, only PENDING_APPROVAL status.
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
  UnitOfWork,
  TransactionContext,
} from '../../ports/repositories.js';
import type { DomainEventRepository, IdGeneratorService } from '../../ports/services.js';

// ---------------------------------------------------------------------------
// Input / Output
// ---------------------------------------------------------------------------

export interface CancelMovementInput {
  readonly id: string;
  readonly tenantId: string;
  readonly actorId: string;
  readonly correlationId: string;
}

export interface CancelMovementOutput {
  readonly movement: ControlledMovementProps;
}

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export class CancelMovementUseCase {
  constructor(
    private readonly movementRepo: MovementRepository,
    private readonly historyRepo: MovementHistoryRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: CancelMovementInput): Promise<CancelMovementOutput> {
    // 1. Fetch movement
    const existing = await this.movementRepo.findById(input.id, input.tenantId);
    if (!existing) {
      throw new MovementNotFoundError(input.id);
    }

    // 2. Domain logic — cancel (validates PENDING_APPROVAL + requester check)
    const movement = ControlledMovement.fromPersistence(existing);
    const cancelled = movement.cancel(input.actorId);

    // 3. Persist in transaction
    return this.uow.transaction(async (tx: TransactionContext) => {
      const updated = await this.movementRepo.update(cancelled.toProps(), tx);

      // 4. Record history
      await this.historyRepo.create(
        {
          id: this.idGen.generate(),
          tenantId: input.tenantId,
          movementId: input.id,
          action: 'CANCELLED',
          actorId: input.actorId,
          detail: {},
          createdAt: new Date(),
        },
        tx,
      );

      // 5. Emit domain event
      await this.eventRepo.create(
        createMovementApprovalEvent({
          tenantId: input.tenantId,
          entityType: 'controlled_movement',
          entityId: input.id,
          eventType: 'movement.cancelled',
          payload: {
            codigo: updated.codigo,
            requesterId: updated.requesterId,
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
