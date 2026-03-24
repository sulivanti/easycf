/**
 * Use Case: GetMovement
 * GET /api/v1/movements/:id
 * Scope: approval:movement:read
 */

import { MovementNotFoundError } from '../../../domain/index.js';
import type { ControlledMovementProps, ApprovalInstanceProps } from '../../../domain/index.js';
import type {
  MovementRepository,
  ApprovalInstanceRepository,
  MovementHistoryEntry,
  MovementHistoryRepository,
} from '../../ports/repositories.js';

// ---------------------------------------------------------------------------
// Input / Output
// ---------------------------------------------------------------------------

export interface GetMovementInput {
  readonly id: string;
  readonly tenantId: string;
}

export interface GetMovementOutput {
  readonly movement: ControlledMovementProps;
  readonly approvalInstances: ApprovalInstanceProps[];
  readonly history: MovementHistoryEntry[];
}

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export class GetMovementUseCase {
  constructor(
    private readonly movementRepo: MovementRepository,
    private readonly approvalInstanceRepo: ApprovalInstanceRepository,
    private readonly historyRepo: MovementHistoryRepository,
  ) {}

  async execute(input: GetMovementInput): Promise<GetMovementOutput> {
    // 1. Fetch movement
    const movement = await this.movementRepo.findById(input.id, input.tenantId);
    if (!movement) {
      throw new MovementNotFoundError(input.id);
    }

    // 2. Fetch related data in parallel
    const [approvalInstances, history] = await Promise.all([
      this.approvalInstanceRepo.findByMovement(input.id, input.tenantId),
      this.historyRepo.findByMovement(input.id, input.tenantId),
    ]);

    return { movement, approvalInstances, history };
  }
}
