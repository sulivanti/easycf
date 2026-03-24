/**
 * @contract FR-005, BR-002, BR-007, BR-013, DATA-010
 *
 * Use Case: CreateAction
 * POST /api/v1/admin/mcp-actions
 * Scope: mcp:action:write
 *
 * Creates an MCP action in the catalog.
 * Validates execution_policy vs action_type.can_be_direct (BR-007).
 * Validates required_scopes against blocklist (BR-002).
 */

import { McpAction } from '../../../domain/index.js';
import type { McpActionProps, ExecutionPolicy } from '../../../domain/index.js';
import { ScopeBlocklistValidator, ScopeBlockedError } from '../../../domain/index.js';
import { createMcpEvent } from '../../../domain/domain-events/mcp-events.js';
import type {
  McpActionRepository,
  McpActionTypeRepository,
  UnitOfWork,
  TransactionContext,
} from '../../ports/repositories.js';
import type { DomainEventRepository, IdGeneratorService } from '../../ports/services.js';
import { DomainError } from '../../../../foundation/domain/errors/domain-errors.js';

class ActionTypeNotFoundError extends DomainError {
  readonly type = '/problems/mcp-action-type-not-found';
  readonly statusHint = 404;
  constructor(id: string) {
    super(`Tipo de ação não encontrado: ${id}`);
  }
}

export interface CreateActionInput {
  readonly tenantId: string;
  readonly codigo: string;
  readonly nome: string;
  readonly actionTypeId: string;
  readonly executionPolicy: ExecutionPolicy;
  readonly targetObjectType: string;
  readonly requiredScopes: readonly string[];
  readonly linkedRoutineId?: string;
  readonly linkedIntegrationId?: string;
  readonly description?: string;
  readonly correlationId: string;
  readonly actorId: string;
}

export interface CreateActionOutput {
  readonly action: McpActionProps;
}

export class CreateActionUseCase {
  constructor(
    private readonly actionRepo: McpActionRepository,
    private readonly actionTypeRepo: McpActionTypeRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly idGen: IdGeneratorService,
  ) {}

  async execute(input: CreateActionInput): Promise<CreateActionOutput> {
    // 1. Validate required_scopes against blocklist (BR-002)
    const scopeResult = ScopeBlocklistValidator.validate(input.requiredScopes, true);
    if (!scopeResult.valid) {
      throw new ScopeBlockedError(
        `required_scopes contém escopos bloqueados para agentes MCP: ${scopeResult.blockedScopes.join(', ')}`,
      );
    }

    // 2. Validate action type exists and policy compatibility (BR-007)
    const actionType = await this.actionTypeRepo.findById(input.actionTypeId);
    if (!actionType) {
      throw new ActionTypeNotFoundError(input.actionTypeId);
    }
    McpAction.validatePolicyForType(
      input.executionPolicy,
      actionType.canBeDirect,
      actionType.codigo,
    );

    // 3. Build entity
    const now = new Date();
    const props: McpActionProps = {
      id: this.idGen.generate(),
      tenantId: input.tenantId,
      codigo: input.codigo,
      nome: input.nome,
      actionTypeId: input.actionTypeId,
      executionPolicy: input.executionPolicy,
      targetObjectType: input.targetObjectType,
      requiredScopes: [...input.requiredScopes],
      linkedRoutineId: input.linkedRoutineId ?? null,
      linkedIntegrationId: input.linkedIntegrationId ?? null,
      description: input.description ?? null,
      status: 'ACTIVE',
      createdBy: input.actorId,
      createdAt: now,
      updatedAt: now,
    };

    // 4. Persist
    return this.uow.transaction(async (tx: TransactionContext) => {
      const created = await this.actionRepo.create(props, tx);

      await this.eventRepo.create(
        createMcpEvent({
          tenantId: input.tenantId,
          entityType: 'mcp.action',
          entityId: created.id,
          eventType: 'mcp.agent.created',
          payload: {
            action_id: created.id,
            codigo: created.codigo,
            nome: created.nome,
            execution_policy: created.executionPolicy,
            target_object_type: created.targetObjectType,
            tenant_id: created.tenantId,
          },
          correlationId: input.correlationId,
          createdBy: input.actorId,
        }),
        tx,
      );

      return { action: created };
    });
  }
}
