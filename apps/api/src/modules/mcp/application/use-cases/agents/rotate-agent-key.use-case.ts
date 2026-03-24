/**
 * @contract FR-003, BR-004, BR-006, DATA-003
 *
 * Use Case: RotateAgentKey
 * POST /api/v1/admin/mcp-agents/:id/rotate-key
 * Scope: mcp:agent:write
 *
 * Generates new API key, invalidates previous immediately.
 * New key returned ONCE in response (BR-004).
 * REVOKED agents cannot rotate key (BR-006).
 */

import { McpAgent } from '../../../domain/index.js';
import type { McpAgentProps } from '../../../domain/index.js';
import { McpAgentNotFoundError } from '../../../domain/index.js';
import { createMcpEvent } from '../../../domain/domain-events/mcp-events.js';
import type {
  McpAgentRepository,
  UnitOfWork,
  TransactionContext,
} from '../../ports/repositories.js';
import type { DomainEventRepository, ApiKeyService } from '../../ports/services.js';

export interface RotateAgentKeyInput {
  readonly id: string;
  readonly tenantId: string;
  readonly correlationId: string;
  readonly actorId: string;
}

export interface RotateAgentKeyOutput {
  readonly agent: McpAgentProps;
  readonly apiKey: string;
}

export class RotateAgentKeyUseCase {
  constructor(
    private readonly agentRepo: McpAgentRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  async execute(input: RotateAgentKeyInput): Promise<RotateAgentKeyOutput> {
    const keyResult = await this.apiKeyService.generate();

    return this.uow.transaction(async (tx: TransactionContext) => {
      const existing = await this.agentRepo.findById(input.id, input.tenantId, tx);
      if (!existing) {
        throw new McpAgentNotFoundError(input.id);
      }

      const agent = new McpAgent(existing);
      const rotated = agent.rotateKey(keyResult.hash);
      const updated = await this.agentRepo.update(rotated['props'], tx);

      await this.eventRepo.create(
        createMcpEvent({
          tenantId: input.tenantId,
          entityType: 'mcp.agent',
          entityId: updated.id,
          eventType: 'mcp.agent.key_rotated',
          payload: {
            agent_id: updated.id,
            codigo: updated.codigo,
            rotated_by: input.actorId,
            rotated_at: new Date().toISOString(),
            tenant_id: updated.tenantId,
          },
          correlationId: input.correlationId,
          createdBy: input.actorId,
        }),
        tx,
      );

      return { agent: updated, apiKey: keyResult.plaintext };
    });
  }
}
