/**
 * @contract FR-001, BR-002, BR-004, DATA-010, SEC-010
 *
 * Use Case: CreateAgent
 * POST /api/v1/admin/mcp-agents
 * Scope: mcp:agent:write
 *
 * Creates an MCP agent with governed technical identity.
 * API key generated once and returned in response (BR-004).
 * Scopes validated against Phase 1 blocklist (BR-002).
 */

import { McpAgent } from '../../../domain/index.js';
import type { McpAgentProps } from '../../../domain/index.js';
import { ScopeBlocklistValidator } from '../../../domain/index.js';
import { ScopeBlockedError } from '../../../domain/index.js';
import { createMcpEvent } from '../../../domain/domain-events/mcp-events.js';
import type {
  McpAgentRepository,
  UnitOfWork,
  TransactionContext,
} from '../../ports/repositories.js';
import type {
  DomainEventRepository,
  IdGeneratorService,
  ApiKeyService,
} from '../../ports/services.js';

// ---------------------------------------------------------------------------
// Input / Output
// ---------------------------------------------------------------------------

export interface CreateAgentInput {
  readonly tenantId: string;
  readonly codigo: string;
  readonly nome: string;
  readonly ownerUserId: string;
  readonly allowedScopes: readonly string[];
  readonly correlationId: string;
  readonly actorId: string;
}

export interface CreateAgentOutput {
  readonly agent: McpAgentProps;
  /** Plaintext API key — returned ONCE (BR-004) */
  readonly apiKey: string;
}

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export class CreateAgentUseCase {
  constructor(
    private readonly agentRepo: McpAgentRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
    private readonly apiKeyService: ApiKeyService,
  ) {}

  async execute(input: CreateAgentInput): Promise<CreateAgentOutput> {
    // 1. Validate scopes against blocklist (BR-002, BR-003 — phase2 false at creation)
    const scopeResult = ScopeBlocklistValidator.validate(input.allowedScopes, false);
    if (!scopeResult.valid) {
      throw new ScopeBlockedError(scopeResult.reason!);
    }

    // 2. Generate API key (BR-004)
    const keyResult = await this.apiKeyService.generate();

    // 3. Build entity
    const now = new Date();
    const props: McpAgentProps = {
      id: this.idGen.generate(),
      tenantId: input.tenantId,
      codigo: input.codigo,
      nome: input.nome,
      ownerUserId: input.ownerUserId,
      apiKeyHash: keyResult.hash,
      allowedScopes: [...input.allowedScopes],
      status: 'ACTIVE',
      phase2CreateEnabled: false,
      lastUsedAt: null,
      createdBy: input.actorId,
      createdAt: now,
      updatedAt: now,
      revokedAt: null,
      revocationReason: null,
    };

    const agent = new McpAgent(props);

    // 4. Persist in transaction
    return this.uow.transaction(async (tx: TransactionContext) => {
      const created = await this.agentRepo.create(agent['props'], tx);

      await this.eventRepo.create(
        createMcpEvent({
          tenantId: input.tenantId,
          entityType: 'mcp.agent',
          entityId: created.id,
          eventType: 'mcp.agent.created',
          payload: {
            agent_id: created.id,
            codigo: created.codigo,
            nome: created.nome,
            owner_user_id: created.ownerUserId,
            status: created.status,
            allowed_scopes_count: created.allowedScopes.length,
            tenant_id: created.tenantId,
          },
          correlationId: input.correlationId,
          createdBy: input.actorId,
          dedupeKey: `mcp.agent.created:${created.id}`,
        }),
        tx,
      );

      return { agent: created, apiKey: keyResult.plaintext };
    });
  }
}
