/**
 * @contract FR-005, BR-002, BR-007, BR-013
 *
 * Use Case: UpdateAction
 * PATCH /api/v1/admin/mcp-actions/:id
 * Scope: mcp:action:write
 *
 * Updates action fields. codigo is immutable — silently ignored (BR-013).
 * Re-validates execution_policy vs action_type if changed (BR-007).
 */

import { McpAction } from '../../../domain/index.js';
import type { McpActionProps, ExecutionPolicy } from '../../../domain/index.js';
import {
  ScopeBlocklistValidator,
  ScopeBlockedError,
  McpActionNotFoundError,
} from '../../../domain/index.js';
import { createMcpEvent } from '../../../domain/domain-events/mcp-events.js';
import type {
  McpActionRepository,
  McpActionTypeRepository,
  UnitOfWork,
  TransactionContext,
} from '../../ports/repositories.js';
import type { DomainEventRepository } from '../../ports/services.js';

export interface UpdateActionInput {
  readonly id: string;
  readonly tenantId: string;
  readonly nome?: string;
  readonly executionPolicy?: ExecutionPolicy;
  readonly requiredScopes?: readonly string[];
  readonly linkedRoutineId?: string | null;
  readonly linkedIntegrationId?: string | null;
  readonly description?: string | null;
  readonly status?: 'ACTIVE' | 'INACTIVE';
  readonly correlationId: string;
  readonly actorId: string;
}

export interface UpdateActionOutput {
  readonly action: McpActionProps;
}

export class UpdateActionUseCase {
  constructor(
    private readonly actionRepo: McpActionRepository,
    private readonly actionTypeRepo: McpActionTypeRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
  ) {}

  async execute(input: UpdateActionInput): Promise<UpdateActionOutput> {
    return this.uow.transaction(async (tx: TransactionContext) => {
      const existing = await this.actionRepo.findById(input.id, input.tenantId, tx);
      if (!existing) throw new McpActionNotFoundError(input.id);

      // Validate scopes if changed (BR-002)
      if (input.requiredScopes !== undefined) {
        const scopeResult = ScopeBlocklistValidator.validate(input.requiredScopes, true);
        if (!scopeResult.valid) {
          throw new ScopeBlockedError(
            `required_scopes contém escopos bloqueados: ${scopeResult.blockedScopes.join(', ')}`,
          );
        }
      }

      // Validate policy if changed (BR-007)
      const newPolicy = input.executionPolicy ?? existing.executionPolicy;
      if (input.executionPolicy !== undefined) {
        const actionType = await this.actionTypeRepo.findById(existing.actionTypeId, tx);
        if (actionType) {
          McpAction.validatePolicyForType(newPolicy, actionType.canBeDirect, actionType.codigo);
        }
      }

      const now = new Date();
      const updated: McpActionProps = {
        ...existing,
        nome: input.nome ?? existing.nome,
        executionPolicy: newPolicy,
        requiredScopes: input.requiredScopes ? [...input.requiredScopes] : existing.requiredScopes,
        linkedRoutineId:
          input.linkedRoutineId !== undefined ? input.linkedRoutineId : existing.linkedRoutineId,
        linkedIntegrationId:
          input.linkedIntegrationId !== undefined
            ? input.linkedIntegrationId
            : existing.linkedIntegrationId,
        description: input.description !== undefined ? input.description : existing.description,
        status: input.status ?? existing.status,
        updatedAt: now,
      };

      const saved = await this.actionRepo.update(updated, tx);

      await this.eventRepo.create(
        createMcpEvent({
          tenantId: input.tenantId,
          entityType: 'mcp.action',
          entityId: saved.id,
          eventType: 'mcp.agent.updated',
          payload: {
            action_id: saved.id,
            codigo: saved.codigo,
            tenant_id: saved.tenantId,
          },
          correlationId: input.correlationId,
          createdBy: input.actorId,
        }),
        tx,
      );

      return { action: saved };
    });
  }
}
