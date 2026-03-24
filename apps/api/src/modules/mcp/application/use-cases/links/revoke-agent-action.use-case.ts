/**
 * @contract FR-006, DATA-003
 *
 * Use Case: RevokeAgentAction
 * DELETE /api/v1/admin/mcp-agents/:id/actions/:actionId
 * Scope: mcp:agent:write
 *
 * Removes agent-action link (hard delete — link is disposable).
 * Idempotent — deleting non-existent link returns success.
 */

import { createMcpEvent } from '../../../domain/domain-events/mcp-events.js';
import type {
  McpAgentActionLinkRepository,
  McpActionRepository,
  UnitOfWork,
  TransactionContext,
} from '../../ports/repositories.js';
import type { DomainEventRepository } from '../../ports/services.js';

export interface RevokeAgentActionInput {
  readonly agentId: string;
  readonly actionId: string;
  readonly tenantId: string;
  readonly correlationId: string;
  readonly actorId: string;
}

export class RevokeAgentActionUseCase {
  constructor(
    private readonly linkRepo: McpAgentActionLinkRepository,
    private readonly actionRepo: McpActionRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: RevokeAgentActionInput): Promise<void> {
    return this.uow.transaction(async (tx: TransactionContext) => {
      const deleted = await this.linkRepo.delete(input.agentId, input.actionId, tx);

      if (deleted) {
        const action = await this.actionRepo.findById(input.actionId, input.tenantId, tx);

        await this.eventRepo.create(
          createMcpEvent({
            tenantId: input.tenantId,
            entityType: 'mcp.agent_action_link',
            entityId: `${input.agentId}:${input.actionId}`,
            eventType: 'mcp.agent.action_revoked',
            payload: {
              agent_id: input.agentId,
              action_id: input.actionId,
              action_codigo: action?.codigo ?? 'unknown',
              revoked_by: input.actorId,
              tenant_id: input.tenantId,
            },
            correlationId: input.correlationId,
            createdBy: input.actorId,
            dedupeKey: `mcp.agent.action_revoked:${input.agentId}:${input.actionId}`,
          }),
          tx,
        );
      }
    });
  }
}
