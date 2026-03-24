/**
 * @contract DATA-010, DOC-GNP-00
 *
 * Repository port interfaces for the MCP Automation module (MOD-010).
 * These define the boundary between application and infrastructure layers.
 * Implementations live in the infrastructure layer (Drizzle-based).
 */

import type { McpAgentProps } from '../../domain/index.js';
import type { McpActionProps } from '../../domain/index.js';
import type { AgentStatus, ExecutionPolicy, ExecutionStatus } from '../../domain/index.js';

// ---------------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------------

export interface CursorPaginatedResult<T> {
  readonly data: readonly T[];
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
}

export type TransactionContext = unknown;

export interface UnitOfWork {
  transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T>;
}

// ---------------------------------------------------------------------------
// McpAgentRepository
// ---------------------------------------------------------------------------

export interface McpAgentRepository {
  findById(id: string, tenantId: string, tx?: TransactionContext): Promise<McpAgentProps | null>;

  /** Lookup by API key hash — used in gateway step 1 (bcrypt compare done in use case) */
  findAllActiveByTenant(tenantId: string, tx?: TransactionContext): Promise<McpAgentProps[]>;

  list(
    params: {
      tenantId: string;
      cursor?: string;
      pageSize: number;
      status?: AgentStatus;
      ownerUserId?: string;
    },
    tx?: TransactionContext,
  ): Promise<CursorPaginatedResult<McpAgentProps>>;

  create(entity: McpAgentProps, tx?: TransactionContext): Promise<McpAgentProps>;

  update(entity: McpAgentProps, tx?: TransactionContext): Promise<McpAgentProps>;
}

// ---------------------------------------------------------------------------
// McpActionTypeRepository
// ---------------------------------------------------------------------------

export interface McpActionTypeProps {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly canBeDirect: boolean;
  readonly canApprove: false;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface McpActionTypeRepository {
  findById(id: string, tx?: TransactionContext): Promise<McpActionTypeProps | null>;

  findByCodigo(codigo: string, tx?: TransactionContext): Promise<McpActionTypeProps | null>;

  findAll(tx?: TransactionContext): Promise<McpActionTypeProps[]>;
}

// ---------------------------------------------------------------------------
// McpActionRepository
// ---------------------------------------------------------------------------

export interface McpActionRepository {
  findById(id: string, tenantId: string, tx?: TransactionContext): Promise<McpActionProps | null>;

  findByCodigo(
    codigo: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<McpActionProps | null>;

  list(
    params: {
      tenantId: string;
      cursor?: string;
      pageSize: number;
      actionTypeId?: string;
      executionPolicy?: ExecutionPolicy;
      status?: 'ACTIVE' | 'INACTIVE';
    },
    tx?: TransactionContext,
  ): Promise<CursorPaginatedResult<McpActionProps>>;

  create(entity: McpActionProps, tx?: TransactionContext): Promise<McpActionProps>;

  update(entity: McpActionProps, tx?: TransactionContext): Promise<McpActionProps>;
}

// ---------------------------------------------------------------------------
// McpAgentActionLinkRepository
// ---------------------------------------------------------------------------

export interface McpAgentActionLinkProps {
  readonly id: string;
  readonly tenantId: string;
  readonly agentId: string;
  readonly actionId: string;
  readonly grantedBy: string;
  readonly grantedAt: Date;
  readonly validUntil: Date | null;
}

export interface McpAgentActionLinkRepository {
  findByAgentAndAction(
    agentId: string,
    actionId: string,
    tx?: TransactionContext,
  ): Promise<McpAgentActionLinkProps | null>;

  /** Find active (non-expired) link for gateway step 4 */
  findActiveLink(
    agentId: string,
    actionId: string,
    now: Date,
    tx?: TransactionContext,
  ): Promise<McpAgentActionLinkProps | null>;

  findByAgent(
    agentId: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<McpAgentActionLinkProps[]>;

  create(
    entity: McpAgentActionLinkProps,
    tx?: TransactionContext,
  ): Promise<McpAgentActionLinkProps>;

  delete(agentId: string, actionId: string, tx?: TransactionContext): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// McpExecutionRepository
// ---------------------------------------------------------------------------

export interface McpExecutionProps {
  readonly id: string;
  readonly tenantId: string;
  readonly agentId: string;
  readonly actionId: string;
  readonly policyApplied: ExecutionPolicy;
  readonly originIp: string | null;
  readonly requestPayload: Record<string, unknown>;
  readonly correlationId: string;
  readonly status: ExecutionStatus;
  readonly blockedReason: string | null;
  readonly linkedMovementId: string | null;
  readonly linkedIntegrationLogId: string | null;
  readonly resultPayload: Record<string, unknown> | null;
  readonly errorMessage: string | null;
  readonly durationMs: number | null;
  readonly receivedAt: Date;
  readonly completedAt: Date | null;
}

export interface McpExecutionRepository {
  findById(
    id: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<McpExecutionProps | null>;

  list(
    params: {
      tenantId: string;
      cursor?: string;
      pageSize: number;
      agentId?: string;
      actionId?: string;
      status?: ExecutionStatus;
      policyApplied?: ExecutionPolicy;
      receivedAtFrom?: Date;
      receivedAtTo?: Date;
    },
    tx?: TransactionContext,
  ): Promise<CursorPaginatedResult<McpExecutionProps>>;

  /** Append-only create */
  create(entity: McpExecutionProps, tx?: TransactionContext): Promise<McpExecutionProps>;

  /** Update status + completion fields only (append-only semantics) */
  updateStatus(
    id: string,
    update: {
      status: ExecutionStatus;
      completedAt?: Date;
      resultPayload?: Record<string, unknown>;
      errorMessage?: string;
      durationMs?: number;
      linkedMovementId?: string;
      linkedIntegrationLogId?: string;
      blockedReason?: string;
    },
    tx?: TransactionContext,
  ): Promise<void>;
}
