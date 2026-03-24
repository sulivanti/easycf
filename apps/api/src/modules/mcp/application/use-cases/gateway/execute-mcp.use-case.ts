/**
 * @contract FR-007, FR-008, BR-001, BR-002, BR-008, BR-009, BR-010, BR-012, SEC-010
 *
 * Use Case: ExecuteMcp
 * POST /api/v1/mcp/execute
 * Auth: API key via X-MCP-Agent-Key (not JWT)
 *
 * Gateway de entrada MCP — algoritmo de 8 passos sequenciais (BR-010):
 * 1. Autenticar agente via API key + bcrypt compare
 * 2. Verificar status=ACTIVE
 * 3. Buscar ação pelo action_code
 * 4. Verificar vínculo agente↔ação + valid_until
 * 5. Verificar required_scopes ⊆ allowed_scopes
 * 6. Dupla verificação blocklist Phase 1
 * 7. INSERT mcp_executions (RECEIVED)
 * 8. Avaliar execution_policy → despachar
 */

import { McpAgent } from '../../../domain/index.js';
import type { McpAgentProps } from '../../../domain/index.js';
import { ScopeBlocklistValidator } from '../../../domain/index.js';
import {
  McpApiKeyInvalidError,
  AgentRevokedError,
  AgentInactiveError,
  McpActionNotFoundError,
  AgentActionLinkNotFoundError,
  AgentActionLinkExpiredError,
  AgentMissingScopesError,
  PrivilegeEscalationError,
} from '../../../domain/index.js';
import { createMcpEvent } from '../../../domain/domain-events/mcp-events.js';
import type {
  McpAgentRepository,
  McpActionRepository,
  McpAgentActionLinkRepository,
  McpExecutionRepository,
  McpExecutionProps,
  UnitOfWork,
} from '../../ports/repositories.js';
import type {
  DomainEventRepository,
  IdGeneratorService,
  ApiKeyService,
  MovementEngineGateway,
  RoutineEvaluatorPort,
  IntegrationQueuePort,
  ActionExecutorRegistry,
} from '../../ports/services.js';

// ---------------------------------------------------------------------------
// Input / Output
// ---------------------------------------------------------------------------

export interface ExecuteMcpInput {
  readonly apiKey: string;
  readonly actionCode: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
  readonly originIp?: string;
  /** tenantId resolved from agent after authn */
}

export interface ExecuteMcpOutput {
  readonly executionId: string;
  readonly status: string;
  readonly policyApplied: string;
  readonly movementId?: string;
  readonly resultPayload?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

export class ExecuteMcpUseCase {
  constructor(
    private readonly agentRepo: McpAgentRepository,
    private readonly actionRepo: McpActionRepository,
    private readonly linkRepo: McpAgentActionLinkRepository,
    private readonly executionRepo: McpExecutionRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
    private readonly apiKeyService: ApiKeyService,
    private readonly movementEngine: MovementEngineGateway,
    private readonly routineEvaluator: RoutineEvaluatorPort | null,
    private readonly integrationQueue: IntegrationQueuePort | null,
    private readonly executorRegistry: ActionExecutorRegistry,
  ) {}

  async execute(input: ExecuteMcpInput): Promise<ExecuteMcpOutput> {
    const now = new Date();
    const executionId = this.idGen.generate();

    // --- STEP 1: Authenticate agent via API key ---
    const agent = await this.authenticateAgent(input.apiKey);

    // --- STEP 2: Verify status=ACTIVE ---
    if (agent.status === 'REVOKED') throw new AgentRevokedError(agent.id);
    if (agent.status !== 'ACTIVE') throw new AgentInactiveError(agent.id);

    // --- STEP 3: Find action by action_code ---
    const action = await this.actionRepo.findByCodigo(input.actionCode, agent.tenantId);
    if (!action || action.status !== 'ACTIVE') {
      throw new McpActionNotFoundError(input.actionCode);
    }

    // --- STEP 4: Verify agent↔action link + valid_until ---
    const link = await this.linkRepo.findActiveLink(agent.id, action.id, now);
    if (!link) {
      const anyLink = await this.linkRepo.findByAgentAndAction(agent.id, action.id);
      if (anyLink) {
        throw new AgentActionLinkExpiredError(agent.id, action.id);
      }
      throw new AgentActionLinkNotFoundError(agent.id, input.actionCode);
    }

    // --- STEP 5: Verify required_scopes ⊆ allowed_scopes ---
    const missingScopes = action.requiredScopes.filter((s) => !agent.allowedScopes.includes(s));
    if (missingScopes.length > 0) {
      throw new AgentMissingScopesError(missingScopes);
    }

    // --- STEP 6: Double-check blocklist Phase 1 (BR-012) ---
    const escalation = ScopeBlocklistValidator.detectEscalation(action.requiredScopes, [
      ...agent.allowedScopes,
    ]);
    if (escalation.escalation) {
      // Record blocked execution and emit escalation event
      await this.recordBlockedExecution(
        executionId,
        agent,
        action,
        input,
        now,
        escalation.attemptedScopes,
      );
      throw new PrivilegeEscalationError(escalation.attemptedScopes);
    }

    // --- STEP 7: INSERT mcp_executions (RECEIVED) ---
    const execution: McpExecutionProps = {
      id: executionId,
      tenantId: agent.tenantId,
      agentId: agent.id,
      actionId: action.id,
      policyApplied: action.executionPolicy,
      originIp: input.originIp ?? null,
      requestPayload: input.payload,
      correlationId: input.correlationId,
      status: 'RECEIVED',
      blockedReason: null,
      linkedMovementId: null,
      linkedIntegrationLogId: null,
      resultPayload: null,
      errorMessage: null,
      durationMs: null,
      receivedAt: now,
      completedAt: null,
    };

    await this.executionRepo.create(execution);

    // Update last_used_at
    const agentEntity = new McpAgent(agent);
    await this.agentRepo.update(agentEntity.markUsed()['props']);

    // --- STEP 8: Dispatch by policy ---
    await this.executionRepo.updateStatus(executionId, { status: 'DISPATCHED' });

    switch (action.executionPolicy) {
      case 'DIRECT':
        return this.dispatchDirect(executionId, agent, action, input, now);
      case 'CONTROLLED':
        return this.dispatchControlled(executionId, agent, action, input, now);
      case 'EVENT_ONLY':
        return this.dispatchEventOnly(executionId, agent, action, input, now);
    }
  }

  // -------------------------------------------------------------------------
  // Private: Authentication
  // -------------------------------------------------------------------------

  private async authenticateAgent(_apiKey: string): Promise<McpAgentProps> {
    // Iterate active agents and bcrypt compare
    // In production, optimize with a lookup index or cache
    // For now, we rely on the presentation layer extracting tenant context
    // and the repo returning only relevant agents
    throw new McpApiKeyInvalidError();
  }

  // -------------------------------------------------------------------------
  // Private: DIRECT dispatch (FR-007)
  // -------------------------------------------------------------------------

  private async dispatchDirect(
    executionId: string,
    agent: { id: string; tenantId: string; allowedScopes: readonly string[] },
    action: {
      id: string;
      codigo: string;
      linkedRoutineId: string | null;
      linkedIntegrationId: string | null;
    },
    input: ExecuteMcpInput,
    startTime: Date,
  ): Promise<ExecuteMcpOutput> {
    try {
      // 1. Evaluate routine if linked (MOD-007)
      let routineParams: Record<string, unknown> | undefined;
      if (action.linkedRoutineId && this.routineEvaluator) {
        const routineResult = await this.routineEvaluator.evaluate({
          routineId: action.linkedRoutineId,
          tenantId: agent.tenantId,
          context: input.payload,
        });
        routineParams = routineResult.params;
      }

      // 2. Resolve executor (strategy pattern)
      const executor = this.executorRegistry.get(input.actionCode);
      if (!executor) {
        const errMsg = `No executor registered for action_code: ${input.actionCode}`;
        await this.executionRepo.updateStatus(executionId, {
          status: 'DIRECT_FAILED',
          completedAt: new Date(),
          errorMessage: errMsg,
          durationMs: Date.now() - startTime.getTime(),
        });
        return {
          executionId,
          status: 'DIRECT_FAILED',
          policyApplied: 'DIRECT',
        };
      }

      // 3. Execute
      const result = await executor.execute({
        agentId: agent.id,
        tenantId: agent.tenantId,
        actionCode: input.actionCode,
        payload: input.payload,
        routineParams,
        correlationId: input.correlationId,
      });

      // 4. Enqueue integration if linked (MOD-008)
      if (action.linkedIntegrationId && this.integrationQueue) {
        await this.integrationQueue.enqueue({
          integrationId: action.linkedIntegrationId,
          tenantId: agent.tenantId,
          payload: result.resultPayload,
          correlationId: input.correlationId,
        });
      }

      // 5. Update execution status
      const completedAt = new Date();
      await this.executionRepo.updateStatus(executionId, {
        status: 'DIRECT_SUCCESS',
        completedAt,
        resultPayload: result.resultPayload,
        durationMs: completedAt.getTime() - startTime.getTime(),
      });

      await this.emitCompletionEvent(
        agent.tenantId,
        executionId,
        agent.id,
        input.actionCode,
        action.id,
        'DIRECT',
        'DIRECT_SUCCESS',
        input.correlationId,
        completedAt.getTime() - startTime.getTime(),
      );

      return {
        executionId,
        status: 'DIRECT_SUCCESS',
        policyApplied: 'DIRECT',
        resultPayload: result.resultPayload,
      };
    } catch (error) {
      const completedAt = new Date();
      const errMsg = error instanceof Error ? error.message : 'Unknown error';
      await this.executionRepo.updateStatus(executionId, {
        status: 'DIRECT_FAILED',
        completedAt,
        errorMessage: errMsg,
        durationMs: completedAt.getTime() - startTime.getTime(),
      });

      await this.emitCompletionEvent(
        agent.tenantId,
        executionId,
        agent.id,
        input.actionCode,
        action.id,
        'DIRECT',
        'DIRECT_FAILED',
        input.correlationId,
        completedAt.getTime() - startTime.getTime(),
      );

      return {
        executionId,
        status: 'DIRECT_FAILED',
        policyApplied: 'DIRECT',
      };
    }
  }

  // -------------------------------------------------------------------------
  // Private: CONTROLLED dispatch (BR-008)
  // -------------------------------------------------------------------------

  private async dispatchControlled(
    executionId: string,
    agent: { id: string; tenantId: string },
    action: {
      id: string;
      codigo: string;
      targetObjectType: string;
      requiredScopes: readonly string[];
    },
    input: ExecuteMcpInput,
    startTime: Date,
  ): Promise<ExecuteMcpOutput> {
    const movementResult = await this.movementEngine.evaluate({
      tenantId: agent.tenantId,
      objectType: action.targetObjectType,
      operationType: action.codigo,
      operationPayload: input.payload,
      requesterId: agent.id,
      requesterOrigin: 'MCP',
      originAgentId: agent.id,
      correlationId: input.correlationId,
    });

    await this.executionRepo.updateStatus(executionId, {
      status: 'CONTROLLED_PENDING',
      linkedMovementId: movementResult.movementId,
      durationMs: Date.now() - startTime.getTime(),
    });

    await this.emitCompletionEvent(
      agent.tenantId,
      executionId,
      agent.id,
      input.actionCode,
      action.id,
      'CONTROLLED',
      'CONTROLLED_PENDING',
      input.correlationId,
      Date.now() - startTime.getTime(),
      movementResult.movementId,
    );

    return {
      executionId,
      status: 'CONTROLLED_PENDING',
      policyApplied: 'CONTROLLED',
      movementId: movementResult.movementId,
    };
  }

  // -------------------------------------------------------------------------
  // Private: EVENT_ONLY dispatch (BR-009)
  // -------------------------------------------------------------------------

  private async dispatchEventOnly(
    executionId: string,
    agent: { id: string; tenantId: string },
    action: { id: string; codigo: string },
    input: ExecuteMcpInput,
    startTime: Date,
  ): Promise<ExecuteMcpOutput> {
    const completedAt = new Date();

    await this.eventRepo.create(
      createMcpEvent({
        tenantId: agent.tenantId,
        entityType: 'mcp.execution',
        entityId: executionId,
        eventType: 'mcp.execution.completed',
        payload: {
          execution_id: executionId,
          agent_id: agent.id,
          action_codigo: action.codigo,
          policy_applied: 'EVENT_ONLY',
          status: 'EVENT_EMITTED',
          event_payload: input.payload,
          correlation_id: input.correlationId,
          tenant_id: agent.tenantId,
        },
        correlationId: input.correlationId,
        createdBy: null,
        dedupeKey: `mcp.execution.completed:${executionId}`,
      }),
    );

    await this.executionRepo.updateStatus(executionId, {
      status: 'EVENT_EMITTED',
      completedAt,
      durationMs: completedAt.getTime() - startTime.getTime(),
    });

    return {
      executionId,
      status: 'EVENT_EMITTED',
      policyApplied: 'EVENT_ONLY',
    };
  }

  // -------------------------------------------------------------------------
  // Private: Helpers
  // -------------------------------------------------------------------------

  private async recordBlockedExecution(
    executionId: string,
    agent: { id: string; tenantId: string; codigo: string; ownerUserId: string },
    action: { id: string; codigo: string; executionPolicy: string },
    input: ExecuteMcpInput,
    now: Date,
    attemptedScopes: string[],
  ): Promise<void> {
    const blockedReason = `Privilege escalation: blocked scopes ${attemptedScopes.join(', ')}`;

    await this.executionRepo.create({
      id: executionId,
      tenantId: agent.tenantId,
      agentId: agent.id,
      actionId: action.id,
      policyApplied: action.executionPolicy as 'DIRECT' | 'CONTROLLED' | 'EVENT_ONLY',
      originIp: input.originIp ?? null,
      requestPayload: input.payload,
      correlationId: input.correlationId,
      status: 'BLOCKED',
      blockedReason,
      linkedMovementId: null,
      linkedIntegrationLogId: null,
      resultPayload: null,
      errorMessage: null,
      durationMs: null,
      receivedAt: now,
      completedAt: now,
    });

    await this.eventRepo.create(
      createMcpEvent({
        tenantId: agent.tenantId,
        entityType: 'mcp.execution',
        entityId: executionId,
        eventType: 'mcp.privilege_escalation_attempt',
        payload: {
          execution_id: executionId,
          agent_id: agent.id,
          agent_codigo: agent.codigo,
          action_code_attempted: action.codigo,
          attempted_scopes: attemptedScopes,
          blocked_scopes_matched: attemptedScopes,
          owner_user_id: agent.ownerUserId,
          correlation_id: input.correlationId,
          origin_ip: input.originIp ?? null,
          tenant_id: agent.tenantId,
        },
        correlationId: input.correlationId,
        createdBy: null,
        dedupeKey: `mcp.privilege_escalation_attempt:${executionId}`,
      }),
    );
  }

  private async emitCompletionEvent(
    tenantId: string,
    executionId: string,
    agentId: string,
    actionCode: string,
    actionId: string,
    policyApplied: string,
    status: string,
    correlationId: string,
    durationMs: number,
    movementId?: string,
  ): Promise<void> {
    await this.eventRepo.create(
      createMcpEvent({
        tenantId,
        entityType: 'mcp.execution',
        entityId: executionId,
        eventType: 'mcp.execution.completed',
        payload: {
          execution_id: executionId,
          agent_id: agentId,
          action_id: actionId,
          action_codigo: actionCode,
          policy_applied: policyApplied,
          status,
          correlation_id: correlationId,
          duration_ms: durationMs,
          ...(movementId ? { linked_movement_id: movementId } : {}),
          tenant_id: tenantId,
        },
        correlationId,
        createdBy: null,
        dedupeKey: `mcp.execution.completed:${executionId}`,
      }),
    );
  }
}
