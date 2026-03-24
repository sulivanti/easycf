/**
 * Use Case: OverrideMovement
 * POST /api/v1/movements/:id/override
 * Scope: approval:override
 * Requires justification >= 20 chars.
 * Creates immutable override log entry.
 */

import {
  ControlledMovement,
  MovementNotFoundError,
  OverrideAuditor,
  createMovementApprovalEvent,
} from '../../../domain/index.js';
import type { ControlledMovementProps } from '../../../domain/index.js';
import type {
  MovementRepository,
  MovementHistoryRepository,
  OverrideLogRepository,
  UnitOfWork,
  TransactionContext,
} from '../../ports/repositories.js';
import type { DomainEventRepository, IdGeneratorService } from '../../ports/services.js';

// ---------------------------------------------------------------------------
// Input / Output
// ---------------------------------------------------------------------------

export interface OverrideMovementInput {
  readonly id: string;
  readonly tenantId: string;
  readonly actorId: string;
  readonly actorScopes: readonly string[];
  readonly justification: string;
  readonly correlationId: string;
}

export interface OverrideMovementOutput {
  readonly movement: ControlledMovementProps;
}

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export class OverrideMovementUseCase {
  private readonly overrideAuditor = new OverrideAuditor();

  constructor(
    private readonly movementRepo: MovementRepository,
    private readonly historyRepo: MovementHistoryRepository,
    private readonly overrideLogRepo: OverrideLogRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: OverrideMovementInput): Promise<OverrideMovementOutput> {
    // 1. Fetch movement
    const existing = await this.movementRepo.findById(input.id, input.tenantId);
    if (!existing) {
      throw new MovementNotFoundError(input.id);
    }

    // 2. Validate override preconditions (scope + justification)
    this.overrideAuditor.validateOverride(input.actorId, input.actorScopes, input.justification);

    // 3. Domain logic — override
    const movement = ControlledMovement.fromPersistence(existing);
    const overridden = movement.override(input.actorId, input.justification);

    // 4. Persist in transaction
    return this.uow.transaction(async (tx: TransactionContext) => {
      const now = new Date();
      const updated = await this.movementRepo.update(overridden.toProps(), tx);

      // 5. Create immutable override log entry
      await this.overrideLogRepo.create(
        {
          id: this.idGen.generate(),
          tenantId: input.tenantId,
          movementId: input.id,
          actorId: input.actorId,
          justification: input.justification,
          actorScopes: input.actorScopes,
          previousStatus: existing.status,
          createdAt: now,
        },
        tx,
      );

      // 6. Record history
      await this.historyRepo.create(
        {
          id: this.idGen.generate(),
          tenantId: input.tenantId,
          movementId: input.id,
          action: 'OVERRIDDEN',
          actorId: input.actorId,
          detail: {
            justification: input.justification,
            previousStatus: existing.status,
          },
          createdAt: now,
        },
        tx,
      );

      // 7. Emit domain event
      await this.eventRepo.create(
        createMovementApprovalEvent({
          tenantId: input.tenantId,
          entityType: 'controlled_movement',
          entityId: input.id,
          eventType: 'movement.overridden',
          payload: {
            codigo: updated.codigo,
            actorId: input.actorId,
            justification: input.justification,
            previousStatus: existing.status,
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
