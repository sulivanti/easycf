/**
 * @contract FR-001
 *
 * Use Case: ListAgents
 * GET /api/v1/admin/mcp-agents
 * Scope: mcp:agent:read
 *
 * Lists agents with cursor-based pagination and filters.
 * api_key field is NEVER included (BR-004).
 */

import type { McpAgentProps } from '../../../domain/index.js';
import type { AgentStatus } from '../../../domain/index.js';
import type { McpAgentRepository, CursorPaginatedResult } from '../../ports/repositories.js';

export interface ListAgentsInput {
  readonly tenantId: string;
  readonly cursor?: string;
  readonly pageSize: number;
  readonly status?: AgentStatus;
  readonly ownerUserId?: string;
}

export type ListAgentsOutput = CursorPaginatedResult<McpAgentProps>;

export class ListAgentsUseCase {
  constructor(private readonly agentRepo: McpAgentRepository) {}

  async execute(input: ListAgentsInput): Promise<ListAgentsOutput> {
    return this.agentRepo.list({
      tenantId: input.tenantId,
      cursor: input.cursor,
      pageSize: input.pageSize,
      status: input.status,
      ownerUserId: input.ownerUserId,
    });
  }
}
