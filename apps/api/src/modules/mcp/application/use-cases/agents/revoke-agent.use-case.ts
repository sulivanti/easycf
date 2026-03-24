/**
 * @contract FR-002, BR-006, BR-015, DATA-003
 *
 * Use Case: RevokeAgent
 * POST /api/v1/admin/mcp-agents/:id/revoke
 * Scope: mcp:agent:revoke
 *
 * Revokes agent immediately and irreversibly (BR-006).
 * reason is mandatory (BR-015).
 */

import { McpAgent } from '../../../domain/index.js';
import type { McpAgentProps } from '../../../domain/index.js';
import { McpAgentNotFoundError, AgentRevokedCannotReactivateError } from '../../../domain/index.js';
import { createMcpEvent } from '../../../domain/domain-events/mcp-events.js';
import type {
  McpAgentRepository,
  UnitOfWork,
  TransactionContext,
} from '../../ports/repositories.js';
import type { DomainEventRepository } from '../../ports/services.js';

export interface RevokeAgentInput {
  readonly id: string;
  readonly tenantId: string;
  readonly reason: string;
  readonly correlationId: string;
  readonly actorId: string;
}

export interface RevokeAgentOutput {
  readonly agent: McpAgentProps;
}

export class RevokeAgentUseCase {
  constructor(
    private readonly agentRepo: McpAgentRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: RevokeAgentInput): Promise<RevokeAgentOutput> {
    return this.uow.transaction(async (tx: TransactionContext) => {
      const existing = await this.agentRepo.findById(input.id, input.tenantId, tx);
      if (!existing) {
        throw new McpAgentNotFoundError(input.id);
      }

      if (existing.status === 'REVOKED') {
        throw new AgentRevokedCannotReactivateError(input.id);
      }

      const agent = new McpAgent(existing);
      const revoked = agent.revoke(input.reason);

      const updated = await this.agentRepo.update(revoked['props'], tx);

      await this.eventRepo.create(
        createMcpEvent({
          tenantId: input.tenantId,
          entityType: 'mcp.agent',
          entityId: updated.id,
          eventType: 'mcp.agent.revoked',
          payload: {
            agent_id: updated.id,
            codigo: updated.codigo,
            revoked_by: input.actorId,
            revocation_reason: input.reason,
            revoked_at: updated.revokedAt?.toISOString(),
            tenant_id: updated.tenantId,
          },
          correlationId: input.correlationId,
          createdBy: input.actorId,
          dedupeKey: `mcp.agent.revoked:${updated.id}`,
        }),
        tx,
      );

      return { agent: updated };
    });
  }
}
