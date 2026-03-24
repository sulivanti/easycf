/**
 * @contract FR-009, DATA-010, SEC-010
 *
 * Use Case: ListExecutions
 * GET /api/v1/admin/mcp-executions
 * GET /api/v1/admin/mcp-executions/:id
 * Scope: mcp:log:read
 *
 * Lists/retrieves MCP executions with cursor-based pagination and filters.
 * api_key NEVER exposed in any field.
 */

import type { ExecutionPolicy, ExecutionStatus } from '../../../domain/index.js';
import type {
  McpExecutionRepository,
  McpExecutionProps,
  CursorPaginatedResult,
} from '../../ports/repositories.js';

// ---------------------------------------------------------------------------
// List
// ---------------------------------------------------------------------------

export interface ListExecutionsInput {
  readonly tenantId: string;
  readonly cursor?: string;
  readonly pageSize: number;
  readonly agentId?: string;
  readonly actionId?: string;
  readonly status?: ExecutionStatus;
  readonly policyApplied?: ExecutionPolicy;
  readonly receivedAtFrom?: string; // ISO date
  readonly receivedAtTo?: string; // ISO date
}

export type ListExecutionsOutput = CursorPaginatedResult<McpExecutionProps>;

export class ListExecutionsUseCase {
  constructor(private readonly executionRepo: McpExecutionRepository) {}

  async execute(input: ListExecutionsInput): Promise<ListExecutionsOutput> {
    return this.executionRepo.list({
      tenantId: input.tenantId,
      cursor: input.cursor,
      pageSize: input.pageSize,
      agentId: input.agentId,
      actionId: input.actionId,
      status: input.status,
      policyApplied: input.policyApplied,
      receivedAtFrom: input.receivedAtFrom ? new Date(input.receivedAtFrom) : undefined,
      receivedAtTo: input.receivedAtTo ? new Date(input.receivedAtTo) : undefined,
    });
  }
}

// ---------------------------------------------------------------------------
// Get by ID
// ---------------------------------------------------------------------------

export interface GetExecutionInput {
  readonly id: string;
  readonly tenantId: string;
}

export interface GetExecutionOutput {
  readonly execution: McpExecutionProps;
}

export class GetExecutionUseCase {
  constructor(private readonly executionRepo: McpExecutionRepository) {}

  async execute(input: GetExecutionInput): Promise<GetExecutionOutput> {
    const execution = await this.executionRepo.findById(input.id, input.tenantId);
    if (!execution) {
      throw new Error(`Execução MCP não encontrada: ${input.id}`);
    }
    return { execution };
  }
}
