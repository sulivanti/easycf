/**
 * @contract FR-010, BR-003, SEC-010
 *
 * Use Case: EnablePhase2
 * POST /api/v1/admin/mcp-agents/:id/enable-phase2
 * Scope: mcp:agent:write + mcp:agent:phase2-enable
 *
 * Enables Phase 2 create capability per-agent (BR-003).
 * Requires reason (min 10 chars), agent must be ACTIVE.
 */

import type { McpAgentProps } from '../../../domain/index.js';
import { McpAgentNotFoundError, AgentRevokedError } from '../../../domain/index.js';
import { DomainError } from '../../../../foundation/domain/errors/domain-errors.js';
import { createMcpEvent } from '../../../domain/domain-events/mcp-events.js';
import type {
  McpAgentRepository,
  UnitOfWork,
  TransactionContext,
} from '../../ports/repositories.js';
import type { DomainEventRepository } from '../../ports/services.js';

class Phase2AlreadyEnabledError extends DomainError {
  readonly type = '/problems/mcp-phase2-already-enabled';
  readonly statusHint = 409;
  constructor(agentId: string) {
    super(`Phase 2 já está habilitada para este agente: ${agentId}`);
  }
}

class Phase2ReasonTooShortError extends DomainError {
  readonly type = '/problems/mcp-phase2-reason-too-short';
  readonly statusHint = 422;
  constructor() {
    super("Campo 'reason' é obrigatório (mínimo 10 caracteres).");
  }
}

class AgentNotActiveError extends DomainError {
  readonly type = '/problems/mcp-agent-not-active';
  readonly statusHint = 422;
  constructor(agentId: string) {
    super(`Agente deve estar ACTIVE para habilitar Phase 2: ${agentId}`);
  }
}

export interface EnablePhase2Input {
  readonly id: string;
  readonly tenantId: string;
  readonly reason: string;
  readonly correlationId: string;
  readonly actorId: string;
}

export interface EnablePhase2Output {
  readonly agentId: string;
  readonly phase2CreateEnabled: true;
  readonly enabledBy: string;
  readonly enabledAt: string;
  readonly reason: string;
}

export class EnablePhase2UseCase {
  constructor(
    private readonly agentRepo: McpAgentRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: EnablePhase2Input): Promise<EnablePhase2Output> {
    if (!input.reason || input.reason.trim().length < 10) {
      throw new Phase2ReasonTooShortError();
    }

    return this.uow.transaction(async (tx: TransactionContext) => {
      const existing = await this.agentRepo.findById(input.id, input.tenantId, tx);
      if (!existing) throw new McpAgentNotFoundError(input.id);
      if (existing.status === 'REVOKED') throw new AgentRevokedError(input.id);
      if (existing.status !== 'ACTIVE') throw new AgentNotActiveError(input.id);
      if (existing.phase2CreateEnabled) throw new Phase2AlreadyEnabledError(input.id);

      const now = new Date();
      const updated: McpAgentProps = {
        ...existing,
        phase2CreateEnabled: true,
        updatedAt: now,
      };

      await this.agentRepo.update(updated, tx);

      await this.eventRepo.create(
        createMcpEvent({
          tenantId: input.tenantId,
          entityType: 'mcp.agent',
          entityId: input.id,
          eventType: 'mcp.agent.scopes_updated',
          payload: {
            agent_id: input.id,
            phase2_enabled: true,
            enabled_by: input.actorId,
            reason: input.reason.trim(),
            tenant_id: input.tenantId,
          },
          correlationId: input.correlationId,
          createdBy: input.actorId,
        }),
        tx,
      );

      return {
        agentId: input.id,
        phase2CreateEnabled: true,
        enabledBy: input.actorId,
        enabledAt: now.toISOString(),
        reason: input.reason.trim(),
      };
    });
  }
}
