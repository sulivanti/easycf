/**
 * Use Case: ListMovements
 * GET /api/v1/movements?page&page_size&status&requester_id
 * Scope: approval:movement:read
 */

import type { ControlledMovementProps } from '../../../domain/index.js';
import type { MovementRepository, PaginatedResult } from '../../ports/repositories.js';

// ---------------------------------------------------------------------------
// Input / Output
// ---------------------------------------------------------------------------

export interface ListMovementsInput {
  readonly tenantId: string;
  readonly page: number;
  readonly pageSize: number;
  readonly status?: string;
  readonly requesterId?: string;
}

export interface ListMovementsOutput {
  readonly result: PaginatedResult<ControlledMovementProps>;
}

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export class ListMovementsUseCase {
  constructor(private readonly movementRepo: MovementRepository) {}

  async execute(input: ListMovementsInput): Promise<ListMovementsOutput> {
    const result = await this.movementRepo.list({
      tenantId: input.tenantId,
      page: input.page,
      pageSize: input.pageSize,
      status: input.status,
      requesterId: input.requesterId,
    });

    return { result };
  }
}
