/**
 * @contract FR-001, BR-002, BR-003, BR-005, BR-006
 *
 * Use Case: UpdateAgent
 * PATCH /api/v1/admin/mcp-agents/:id
 * Scope: mcp:agent:write
 *
 * Updates agent fields (nome, allowed_scopes, status ACTIVE↔INACTIVE).
 * codigo is immutable — silently ignored (BR-005).
 * REVOKED agents cannot be reactivated (BR-006).
 */

import { McpAgent } from '../../../domain/index.js';
import type { McpAgentProps, AgentStatus } from '../../../domain/index.js';
import {
  ScopeBlocklistValidator,
  McpAgentNotFoundError,
  ScopeBlockedError,
} from '../../../domain/index.js';
import { createMcpEvent } from '../../../domain/domain-events/mcp-events.js';
import type {
  McpAgentRepository,
  UnitOfWork,
  TransactionContext,
} from '../../ports/repositories.js';
import type { DomainEventRepository } from '../../ports/services.js';

// ---------------------------------------------------------------------------
// Input / Output
// ---------------------------------------------------------------------------

export interface UpdateAgentInput {
  readonly id: string;
  readonly tenantId: string;
  readonly nome?: string;
  readonly allowedScopes?: readonly string[];
  readonly status?: AgentStatus;
  readonly correlationId: string;
  readonly actorId: string;
}

export interface UpdateAgentOutput {
  readonly agent: McpAgentProps;
}

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export class UpdateAgentUseCase {
  constructor(
    private readonly agentRepo: McpAgentRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: UpdateAgentInput): Promise<UpdateAgentOutput> {
    return this.uow.transaction(async (tx: TransactionContext) => {
      // 1. Load existing agent
      const existing = await this.agentRepo.findById(input.id, input.tenantId, tx);
      if (!existing) {
        throw new McpAgentNotFoundError(input.id);
      }

      let agent = new McpAgent(existing);
      const _events = [];
      let scopesChanged = false;

      // 2. Apply nome update
      if (input.nome !== undefined) {
        agent = new McpAgent({ ...agent['props'], nome: input.nome, updatedAt: new Date() });
      }

      // 3. Apply scopes update (BR-002, BR-003)
      if (input.allowedScopes !== undefined) {
        const scopeResult = ScopeBlocklistValidator.validate(
          input.allowedScopes,
          existing.phase2CreateEnabled,
        );
        if (!scopeResult.valid) {
          throw new ScopeBlockedError(scopeResult.reason!);
        }
        agent = agent.updateScopes(input.allowedScopes);
        scopesChanged = true;
      }

      // 4. Apply status transition (BR-006)
      if (input.status !== undefined && input.status !== agent.status) {
        agent = agent.transitionTo(input.status);
      }

      // 5. Persist
      const updated = await this.agentRepo.update(agent['props'], tx);

      // 6. Emit events
      await this.eventRepo.create(
        createMcpEvent({
          tenantId: input.tenantId,
          entityType: 'mcp.agent',
          entityId: updated.id,
          eventType: 'mcp.agent.updated',
          payload: {
            agent_id: updated.id,
            changed_fields: [
              ...(input.nome !== undefined ? ['nome'] : []),
              ...(scopesChanged ? ['allowed_scopes'] : []),
              ...(input.status !== undefined ? ['status'] : []),
            ],
            previous_status: existing.status,
            new_status: updated.status,
            tenant_id: updated.tenantId,
          },
          correlationId: input.correlationId,
          createdBy: input.actorId,
        }),
        tx,
      );

      if (scopesChanged) {
        const addedScopes = (input.allowedScopes ?? []).filter(
          (s) => !existing.allowedScopes.includes(s),
        );
        const removedScopes = existing.allowedScopes.filter(
          (s) => !(input.allowedScopes ?? []).includes(s),
        );

        await this.eventRepo.create(
          createMcpEvent({
            tenantId: input.tenantId,
            entityType: 'mcp.agent',
            entityId: updated.id,
            eventType: 'mcp.agent.scopes_updated',
            payload: {
              agent_id: updated.id,
              scopes_added: addedScopes,
              scopes_removed: removedScopes,
              new_scopes_count: updated.allowedScopes.length,
              tenant_id: updated.tenantId,
            },
            correlationId: input.correlationId,
            createdBy: input.actorId,
          }),
          tx,
        );
      }

      return { agent: updated };
    });
  }
}
