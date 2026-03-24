/**
 * Use Case: ListControlRules
 * GET /api/v1/control-rules?page&page_size&status&object_type
 * Scope: approval:rule:read
 */

import type { MovementControlRuleProps, ControlRuleStatus } from '../../../domain/index.js';
import type { ControlRuleRepository, PaginatedResult } from '../../ports/repositories.js';

// ---------------------------------------------------------------------------
// Input / Output
// ---------------------------------------------------------------------------

export interface ListControlRulesInput {
  readonly tenantId: string;
  readonly page: number;
  readonly pageSize: number;
  readonly status?: ControlRuleStatus;
  readonly objectType?: string;
}

export interface ListControlRulesOutput {
  readonly result: PaginatedResult<MovementControlRuleProps>;
}

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export class ListControlRulesUseCase {
  constructor(private readonly controlRuleRepo: ControlRuleRepository) {}

  async execute(input: ListControlRulesInput): Promise<ListControlRulesOutput> {
    const result = await this.controlRuleRepo.list({
      tenantId: input.tenantId,
      page: input.page,
      pageSize: input.pageSize,
      status: input.status,
      objectType: input.objectType,
    });

    return { result };
  }
}
