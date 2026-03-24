/**
 * @contract FR-006, BR-011, DATA-003
 *
 * Use Case: GrantAgentAction
 * POST /api/v1/admin/mcp-agents/:id/actions
 * Scope: mcp:agent:write
 *
 * Links an agent to an action with optional validity period.
 * UNIQUE(agent_id, action_id) — duplicate returns 409 (BR-011).
 * REVOKED agents cannot receive new links.
 */

import {
  McpAgentNotFoundError,
  McpActionNotFoundError,
  AgentRevokedError,
  AgentActionLinkDuplicateError,
} from '../../../domain/index.js';
import { DomainError } from '../../../../foundation/domain/errors/domain-errors.js';
import { createMcpEvent } from '../../../domain/domain-events/mcp-events.js';
import type {
  McpAgentRepository,
  McpActionRepository,
  McpAgentActionLinkRepository,
  McpAgentActionLinkProps,
  UnitOfWork,
  TransactionContext,
} from '../../ports/repositories.js';
import type { DomainEventRepository, IdGeneratorService } from '../../ports/services.js';

class ActionInactiveError extends DomainError {
  readonly type = '/problems/mcp-action-inactive';
  readonly statusHint = 422;
  constructor(actionId: string) {
    super(`Ação inativa não pode ser vinculada: ${actionId}`);
  }
}

export interface GrantAgentActionInput {
  readonly agentId: string;
  readonly actionId: string;
  readonly tenantId: string;
  readonly validUntil?: string; // ISO date
  readonly correlationId: string;
  readonly actorId: string;
}

export interface GrantAgentActionOutput {
  readonly link: McpAgentActionLinkProps;
}

export class GrantAgentActionUseCase {
  constructor(
    private readonly agentRepo: McpAgentRepository,
    private readonly actionRepo: McpActionRepository,
    private readonly linkRepo: McpAgentActionLinkRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: GrantAgentActionInput): Promise<GrantAgentActionOutput> {
    return this.uow.transaction(async (tx: TransactionContext) => {
      // 1. Validate agent exists and is not revoked
      const agent = await this.agentRepo.findById(input.agentId, input.tenantId, tx);
      if (!agent) throw new McpAgentNotFoundError(input.agentId);
      if (agent.status === 'REVOKED') throw new AgentRevokedError(input.agentId);

      // 2. Validate action exists and is active
      const action = await this.actionRepo.findById(input.actionId, input.tenantId, tx);
      if (!action) throw new McpActionNotFoundError(input.actionId);
      if (action.status !== 'ACTIVE') throw new ActionInactiveError(input.actionId);

      // 3. Check for duplicate (BR-011)
      const existing = await this.linkRepo.findByAgentAndAction(input.agentId, input.actionId, tx);
      if (existing) {
        throw new AgentActionLinkDuplicateError(input.agentId, input.actionId);
      }

      // 4. Create link
      const now = new Date();
      const link: McpAgentActionLinkProps = {
        id: this.idGen.generate(),
        tenantId: input.tenantId,
        agentId: input.agentId,
        actionId: input.actionId,
        grantedBy: input.actorId,
        grantedAt: now,
        validUntil: input.validUntil ? new Date(input.validUntil) : null,
      };

      const created = await this.linkRepo.create(link, tx);

      await this.eventRepo.create(
        createMcpEvent({
          tenantId: input.tenantId,
          entityType: 'mcp.agent_action_link',
          entityId: created.id,
          eventType: 'mcp.agent.action_granted',
          payload: {
            agent_id: input.agentId,
            action_id: input.actionId,
            action_codigo: action.codigo,
            granted_by: input.actorId,
            valid_until: created.validUntil?.toISOString() ?? null,
            tenant_id: input.tenantId,
          },
          correlationId: input.correlationId,
          createdBy: input.actorId,
          dedupeKey: `mcp.agent.action_granted:${input.agentId}:${input.actionId}`,
        }),
        tx,
      );

      return { link: created };
    });
  }
}
