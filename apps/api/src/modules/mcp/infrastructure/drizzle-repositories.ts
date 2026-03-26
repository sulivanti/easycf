// @contract DATA-010, DOC-ARC-004
//
// Drizzle-based repository and service implementations for MCP Automation module (MOD-010).
// Maps between DB rows and domain Props, handling Value Object hydration.

import { eq, and, desc, lte, or, isNull, gte } from 'drizzle-orm';
import { sql as dsql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { randomUUID, randomBytes } from 'node:crypto';

import {
  mcpAgents,
  mcpActionTypes,
  mcpActions,
  mcpAgentActionLinks,
  mcpExecutions,
} from '../../../../db/schema/mcp-automation.js';
import { domainEvents } from '../../../../db/schema/foundation.js';

import type { McpAgentProps } from '../../mcp/domain/aggregates/mcp-agent.js';
import type { McpActionProps } from '../../mcp/domain/entities/mcp-action.js';
import type { AgentStatus, ExecutionPolicy, ExecutionStatus } from '../../mcp/domain/index.js';

import type {
  McpAgentRepository,
  McpActionTypeRepository,
  McpActionTypeProps,
  McpActionRepository,
  McpAgentActionLinkRepository,
  McpAgentActionLinkProps,
  McpExecutionRepository,
  McpExecutionProps,
  CursorPaginatedResult,
  TransactionContext,
  UnitOfWork,
} from '../application/ports/repositories.js';

import type {
  DomainEventRepository,
  IdGeneratorService,
  ApiKeyService,
  ApiKeyGenerateResult,
  MovementEngineGateway,
  CreateMovementRequest,
  CreateMovementResult,
  RoutineEvaluatorPort,
  RoutineEvaluationRequest,
  RoutineEvaluationResult,
  IntegrationQueuePort,
  IntegrationJobRequest,
  ActionExecutorRegistry,
  ActionExecutor,
} from '../application/ports/services.js';

import type { DomainEventBase } from '../../foundation/domain/events/foundation-events.js';

// Utility: resolve connection (tx or db)
type Conn = PostgresJsDatabase;
function conn(db: Conn, tx?: TransactionContext): Conn {
  return (tx ?? db) as Conn;
}

// ---------------------------------------------------------------------------
// McpAgentRepository
// ---------------------------------------------------------------------------

export class DrizzleMcpAgentRepository implements McpAgentRepository {
  constructor(private db: Conn) {}

  async findById(
    id: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<McpAgentProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(mcpAgents)
      .where(and(eq(mcpAgents.id, id), eq(mcpAgents.tenantId, tenantId)))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async findAllActiveByTenant(tenantId: string, tx?: TransactionContext): Promise<McpAgentProps[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(mcpAgents)
      .where(and(eq(mcpAgents.tenantId, tenantId), eq(mcpAgents.status, 'ACTIVE' as any)));
    return rows.map((r) => this.toDomain(r));
  }

  async list(
    params: {
      tenantId: string;
      cursor?: string;
      pageSize: number;
      status?: AgentStatus;
      ownerUserId?: string;
    },
    tx?: TransactionContext,
  ): Promise<CursorPaginatedResult<McpAgentProps>> {
    const c = conn(this.db, tx);
    const limit = params.pageSize + 1;
    const conditions: ReturnType<typeof eq>[] = [eq(mcpAgents.tenantId, params.tenantId)];

    if (params.status) conditions.push(eq(mcpAgents.status, params.status as any));
    if (params.ownerUserId) conditions.push(eq(mcpAgents.ownerUserId, params.ownerUserId));
    if (params.cursor)
      conditions.push(
        dsql`${mcpAgents.createdAt} <= (SELECT ${mcpAgents.createdAt} FROM ${mcpAgents} WHERE ${mcpAgents.id} = ${params.cursor})`,
      );

    const rows = await c
      .select()
      .from(mcpAgents)
      .where(and(...conditions))
      .orderBy(desc(mcpAgents.createdAt))
      .limit(limit);

    const hasMore = rows.length > params.pageSize;
    const data = rows.slice(0, params.pageSize);

    return {
      data: data.map((r) => this.toDomain(r)),
      nextCursor: hasMore && data.length > 0 ? data[data.length - 1]!.id : null,
      hasMore,
    };
  }

  async create(entity: McpAgentProps, tx?: TransactionContext): Promise<McpAgentProps> {
    const c = conn(this.db, tx);
    const [created] = await c
      .insert(mcpAgents)
      .values({
        id: entity.id || undefined,
        tenantId: entity.tenantId,
        codigo: entity.codigo,
        nome: entity.nome,
        ownerUserId: entity.ownerUserId,
        apiKeyHash: entity.apiKeyHash,
        allowedScopes: entity.allowedScopes as string[],
        status: entity.status as any,
        phase2CreateEnabled: entity.phase2CreateEnabled,
        lastUsedAt: entity.lastUsedAt,
        createdBy: entity.createdBy,
        revokedAt: entity.revokedAt,
        revocationReason: entity.revocationReason,
      })
      .returning();

    return this.toDomain(created!);
  }

  async update(entity: McpAgentProps, tx?: TransactionContext): Promise<McpAgentProps> {
    const c = conn(this.db, tx);
    const [updated] = await c
      .update(mcpAgents)
      .set({
        nome: entity.nome,
        ownerUserId: entity.ownerUserId,
        apiKeyHash: entity.apiKeyHash,
        allowedScopes: entity.allowedScopes as string[],
        status: entity.status as any,
        phase2CreateEnabled: entity.phase2CreateEnabled,
        lastUsedAt: entity.lastUsedAt,
        revokedAt: entity.revokedAt,
        revocationReason: entity.revocationReason,
        updatedAt: new Date(),
      })
      .where(eq(mcpAgents.id, entity.id))
      .returning();

    return this.toDomain(updated!);
  }

  private toDomain(row: typeof mcpAgents.$inferSelect): McpAgentProps {
    return {
      id: row.id,
      tenantId: row.tenantId,
      codigo: row.codigo,
      nome: row.nome,
      ownerUserId: row.ownerUserId,
      apiKeyHash: row.apiKeyHash,
      allowedScopes: row.allowedScopes as string[],
      status: row.status as AgentStatus,
      phase2CreateEnabled: row.phase2CreateEnabled,
      lastUsedAt: row.lastUsedAt,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      revokedAt: row.revokedAt,
      revocationReason: row.revocationReason,
    };
  }
}

// ---------------------------------------------------------------------------
// McpActionTypeRepository
// ---------------------------------------------------------------------------

export class DrizzleMcpActionTypeRepository implements McpActionTypeRepository {
  constructor(private db: Conn) {}

  async findById(id: string, tx?: TransactionContext): Promise<McpActionTypeProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c.select().from(mcpActionTypes).where(eq(mcpActionTypes.id, id)).limit(1);
    return row ? this.toDomain(row) : null;
  }

  async findByCodigo(codigo: string, tx?: TransactionContext): Promise<McpActionTypeProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(mcpActionTypes)
      .where(eq(mcpActionTypes.codigo, codigo))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async findAll(tx?: TransactionContext): Promise<McpActionTypeProps[]> {
    const c = conn(this.db, tx);
    const rows = await c.select().from(mcpActionTypes).orderBy(mcpActionTypes.codigo);
    return rows.map((r) => this.toDomain(r));
  }

  private toDomain(row: typeof mcpActionTypes.$inferSelect): McpActionTypeProps {
    return {
      id: row.id,
      codigo: row.codigo,
      nome: row.nome,
      canBeDirect: row.canBeDirect,
      canApprove: row.canApprove as false,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

// ---------------------------------------------------------------------------
// McpActionRepository
// ---------------------------------------------------------------------------

export class DrizzleMcpActionRepository implements McpActionRepository {
  constructor(private db: Conn) {}

  async findById(
    id: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<McpActionProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(mcpActions)
      .where(and(eq(mcpActions.id, id), eq(mcpActions.tenantId, tenantId)))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async findByCodigo(
    codigo: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<McpActionProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(mcpActions)
      .where(and(eq(mcpActions.codigo, codigo), eq(mcpActions.tenantId, tenantId)))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async list(
    params: {
      tenantId: string;
      cursor?: string;
      pageSize: number;
      actionTypeId?: string;
      executionPolicy?: ExecutionPolicy;
      status?: 'ACTIVE' | 'INACTIVE';
    },
    tx?: TransactionContext,
  ): Promise<CursorPaginatedResult<McpActionProps>> {
    const c = conn(this.db, tx);
    const limit = params.pageSize + 1;
    const conditions: ReturnType<typeof eq>[] = [eq(mcpActions.tenantId, params.tenantId)];

    if (params.actionTypeId) conditions.push(eq(mcpActions.actionTypeId, params.actionTypeId));
    if (params.executionPolicy)
      conditions.push(eq(mcpActions.executionPolicy, params.executionPolicy as any));
    if (params.status) conditions.push(eq(mcpActions.status, params.status as any));
    if (params.cursor)
      conditions.push(
        dsql`${mcpActions.createdAt} <= (SELECT ${mcpActions.createdAt} FROM ${mcpActions} WHERE ${mcpActions.id} = ${params.cursor})`,
      );

    const rows = await c
      .select()
      .from(mcpActions)
      .where(and(...conditions))
      .orderBy(desc(mcpActions.createdAt))
      .limit(limit);

    const hasMore = rows.length > params.pageSize;
    const data = rows.slice(0, params.pageSize);

    return {
      data: data.map((r) => this.toDomain(r)),
      nextCursor: hasMore && data.length > 0 ? data[data.length - 1]!.id : null,
      hasMore,
    };
  }

  async create(entity: McpActionProps, tx?: TransactionContext): Promise<McpActionProps> {
    const c = conn(this.db, tx);
    const [created] = await c
      .insert(mcpActions)
      .values({
        id: entity.id || undefined,
        tenantId: entity.tenantId,
        codigo: entity.codigo,
        nome: entity.nome,
        actionTypeId: entity.actionTypeId,
        executionPolicy: entity.executionPolicy as any,
        targetObjectType: entity.targetObjectType,
        requiredScopes: entity.requiredScopes as string[],
        linkedRoutineId: entity.linkedRoutineId,
        linkedIntegrationId: entity.linkedIntegrationId,
        description: entity.description,
        status: entity.status as any,
        createdBy: entity.createdBy,
      })
      .returning();

    return this.toDomain(created!);
  }

  async update(entity: McpActionProps, tx?: TransactionContext): Promise<McpActionProps> {
    const c = conn(this.db, tx);
    const [updated] = await c
      .update(mcpActions)
      .set({
        nome: entity.nome,
        actionTypeId: entity.actionTypeId,
        executionPolicy: entity.executionPolicy as any,
        targetObjectType: entity.targetObjectType,
        requiredScopes: entity.requiredScopes as string[],
        linkedRoutineId: entity.linkedRoutineId,
        linkedIntegrationId: entity.linkedIntegrationId,
        description: entity.description,
        status: entity.status as any,
        updatedAt: new Date(),
      })
      .where(eq(mcpActions.id, entity.id))
      .returning();

    return this.toDomain(updated!);
  }

  private toDomain(row: typeof mcpActions.$inferSelect): McpActionProps {
    return {
      id: row.id,
      tenantId: row.tenantId,
      codigo: row.codigo,
      nome: row.nome,
      actionTypeId: row.actionTypeId,
      executionPolicy: row.executionPolicy as ExecutionPolicy,
      targetObjectType: row.targetObjectType,
      requiredScopes: row.requiredScopes as string[],
      linkedRoutineId: row.linkedRoutineId,
      linkedIntegrationId: row.linkedIntegrationId,
      description: row.description,
      status: row.status as 'ACTIVE' | 'INACTIVE',
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

// ---------------------------------------------------------------------------
// McpAgentActionLinkRepository
// ---------------------------------------------------------------------------

export class DrizzleMcpAgentActionLinkRepository implements McpAgentActionLinkRepository {
  constructor(private db: Conn) {}

  async findByAgentAndAction(
    agentId: string,
    actionId: string,
    tx?: TransactionContext,
  ): Promise<McpAgentActionLinkProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(mcpAgentActionLinks)
      .where(
        and(eq(mcpAgentActionLinks.agentId, agentId), eq(mcpAgentActionLinks.actionId, actionId)),
      )
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async findActiveLink(
    agentId: string,
    actionId: string,
    now: Date,
    tx?: TransactionContext,
  ): Promise<McpAgentActionLinkProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(mcpAgentActionLinks)
      .where(
        and(
          eq(mcpAgentActionLinks.agentId, agentId),
          eq(mcpAgentActionLinks.actionId, actionId),
          or(isNull(mcpAgentActionLinks.validUntil), gte(mcpAgentActionLinks.validUntil, now)),
        ),
      )
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async findByAgent(
    agentId: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<McpAgentActionLinkProps[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(mcpAgentActionLinks)
      .where(
        and(eq(mcpAgentActionLinks.agentId, agentId), eq(mcpAgentActionLinks.tenantId, tenantId)),
      );
    return rows.map((r) => this.toDomain(r));
  }

  async create(
    entity: McpAgentActionLinkProps,
    tx?: TransactionContext,
  ): Promise<McpAgentActionLinkProps> {
    const c = conn(this.db, tx);
    const [created] = await c
      .insert(mcpAgentActionLinks)
      .values({
        id: entity.id || undefined,
        tenantId: entity.tenantId,
        agentId: entity.agentId,
        actionId: entity.actionId,
        grantedBy: entity.grantedBy,
        grantedAt: entity.grantedAt,
        validUntil: entity.validUntil,
      })
      .returning();

    return this.toDomain(created!);
  }

  async delete(agentId: string, actionId: string, tx?: TransactionContext): Promise<boolean> {
    const c = conn(this.db, tx);
    const result = await c
      .delete(mcpAgentActionLinks)
      .where(
        and(eq(mcpAgentActionLinks.agentId, agentId), eq(mcpAgentActionLinks.actionId, actionId)),
      )
      .returning();
    return result.length > 0;
  }

  private toDomain(row: typeof mcpAgentActionLinks.$inferSelect): McpAgentActionLinkProps {
    return {
      id: row.id,
      tenantId: row.tenantId,
      agentId: row.agentId,
      actionId: row.actionId,
      grantedBy: row.grantedBy,
      grantedAt: row.grantedAt,
      validUntil: row.validUntil,
    };
  }
}

// ---------------------------------------------------------------------------
// McpExecutionRepository
// ---------------------------------------------------------------------------

export class DrizzleMcpExecutionRepository implements McpExecutionRepository {
  constructor(private db: Conn) {}

  async findById(
    id: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<McpExecutionProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(mcpExecutions)
      .where(and(eq(mcpExecutions.id, id), eq(mcpExecutions.tenantId, tenantId)))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async list(
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
  ): Promise<CursorPaginatedResult<McpExecutionProps>> {
    const c = conn(this.db, tx);
    const limit = params.pageSize + 1;
    const conditions: ReturnType<typeof eq>[] = [eq(mcpExecutions.tenantId, params.tenantId)];

    if (params.agentId) conditions.push(eq(mcpExecutions.agentId, params.agentId));
    if (params.actionId) conditions.push(eq(mcpExecutions.actionId, params.actionId));
    if (params.status) conditions.push(eq(mcpExecutions.status, params.status as any));
    if (params.policyApplied)
      conditions.push(eq(mcpExecutions.policyApplied, params.policyApplied as any));
    if (params.receivedAtFrom)
      conditions.push(gte(mcpExecutions.receivedAt, params.receivedAtFrom));
    if (params.receivedAtTo) conditions.push(lte(mcpExecutions.receivedAt, params.receivedAtTo));
    if (params.cursor)
      conditions.push(
        dsql`${mcpExecutions.receivedAt} <= (SELECT ${mcpExecutions.receivedAt} FROM ${mcpExecutions} WHERE ${mcpExecutions.id} = ${params.cursor})`,
      );

    const rows = await c
      .select()
      .from(mcpExecutions)
      .where(and(...conditions))
      .orderBy(desc(mcpExecutions.receivedAt))
      .limit(limit);

    const hasMore = rows.length > params.pageSize;
    const data = rows.slice(0, params.pageSize);

    return {
      data: data.map((r) => this.toDomain(r)),
      nextCursor: hasMore && data.length > 0 ? data[data.length - 1]!.id : null,
      hasMore,
    };
  }

  async create(entity: McpExecutionProps, tx?: TransactionContext): Promise<McpExecutionProps> {
    const c = conn(this.db, tx);
    const [created] = await c
      .insert(mcpExecutions)
      .values({
        id: entity.id || undefined,
        tenantId: entity.tenantId,
        agentId: entity.agentId,
        actionId: entity.actionId,
        policyApplied: entity.policyApplied as any,
        originIp: entity.originIp,
        requestPayload: entity.requestPayload,
        correlationId: entity.correlationId,
        status: entity.status as any,
        blockedReason: entity.blockedReason,
        linkedMovementId: entity.linkedMovementId,
        linkedIntegrationLogId: entity.linkedIntegrationLogId,
        resultPayload: entity.resultPayload,
        errorMessage: entity.errorMessage,
        durationMs: entity.durationMs,
        receivedAt: entity.receivedAt,
        completedAt: entity.completedAt,
      })
      .returning();

    return this.toDomain(created!);
  }

  async updateStatus(
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
  ): Promise<void> {
    const c = conn(this.db, tx);
    const values: Record<string, unknown> = {
      status: update.status as any,
    };

    if (update.completedAt !== undefined) values.completedAt = update.completedAt;
    if (update.resultPayload !== undefined) values.resultPayload = update.resultPayload;
    if (update.errorMessage !== undefined) values.errorMessage = update.errorMessage;
    if (update.durationMs !== undefined) values.durationMs = update.durationMs;
    if (update.linkedMovementId !== undefined) values.linkedMovementId = update.linkedMovementId;
    if (update.linkedIntegrationLogId !== undefined)
      values.linkedIntegrationLogId = update.linkedIntegrationLogId;
    if (update.blockedReason !== undefined) values.blockedReason = update.blockedReason;

    await c.update(mcpExecutions).set(values).where(eq(mcpExecutions.id, id));
  }

  private toDomain(row: typeof mcpExecutions.$inferSelect): McpExecutionProps {
    return {
      id: row.id,
      tenantId: row.tenantId,
      agentId: row.agentId,
      actionId: row.actionId,
      policyApplied: row.policyApplied as ExecutionPolicy,
      originIp: row.originIp,
      requestPayload: row.requestPayload as Record<string, unknown>,
      correlationId: row.correlationId,
      status: row.status as ExecutionStatus,
      blockedReason: row.blockedReason,
      linkedMovementId: row.linkedMovementId,
      linkedIntegrationLogId: row.linkedIntegrationLogId,
      resultPayload: row.resultPayload as Record<string, unknown> | null,
      errorMessage: row.errorMessage,
      durationMs: row.durationMs,
      receivedAt: row.receivedAt,
      completedAt: row.completedAt,
    };
  }
}

// ---------------------------------------------------------------------------
// UnitOfWork
// ---------------------------------------------------------------------------

export class DrizzleMcpUnitOfWork implements UnitOfWork {
  constructor(private db: Conn) {}

  async transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T> {
    return this.db.transaction(async (tx) => fn(tx));
  }
}

// ---------------------------------------------------------------------------
// DomainEventRepository
// ---------------------------------------------------------------------------

export class DrizzleMcpEventRepository implements DomainEventRepository {
  constructor(private db: Conn) {}

  async create(event: DomainEventBase, tx?: unknown): Promise<void> {
    const c = conn(this.db, tx as TransactionContext);
    await c.insert(domainEvents).values({
      tenantId: event.tenantId,
      entityType: event.entityType,
      entityId: event.entityId,
      eventType: event.eventType,
      payload: event.payload,
      correlationId: event.correlationId,
      causationId: event.causationId ?? null,
      createdBy: event.createdBy,
      sensitivityLevel: event.sensitivityLevel,
      dedupeKey: event.dedupeKey ?? null,
    });
  }

  async createMany(events: readonly DomainEventBase[], tx?: unknown): Promise<void> {
    if (events.length === 0) return;
    const c = conn(this.db, tx as TransactionContext);
    await c.insert(domainEvents).values(
      events.map((e) => ({
        tenantId: e.tenantId,
        entityType: e.entityType,
        entityId: e.entityId,
        eventType: e.eventType,
        payload: e.payload,
        correlationId: e.correlationId,
        causationId: e.causationId ?? null,
        createdBy: e.createdBy,
        sensitivityLevel: e.sensitivityLevel,
        dedupeKey: e.dedupeKey ?? null,
      })),
    );
  }
}

// ---------------------------------------------------------------------------
// CryptoMcpIdGenerator
// ---------------------------------------------------------------------------

export class CryptoMcpIdGenerator implements IdGeneratorService {
  generate(): string {
    return randomUUID();
  }
}

// ---------------------------------------------------------------------------
// StubApiKeyService — stub that generates random key + placeholder hash
// ---------------------------------------------------------------------------

export class StubApiKeyService implements ApiKeyService {
  async generate(): Promise<ApiKeyGenerateResult> {
    const plaintext = randomBytes(32).toString('base64url');
    // Placeholder bcrypt-style hash (not real bcrypt — stub only)
    const hash = `$2b$12$stub${randomBytes(20).toString('base64url')}`;
    return { plaintext, hash };
  }

  async compare(_plaintext: string, _hash: string): Promise<boolean> {
    // Stub: always returns false — replace with real bcrypt in production
    return false;
  }
}

// ---------------------------------------------------------------------------
// StubMovementEngineGateway — returns { controlled: false, movementId: '' }
// ---------------------------------------------------------------------------

export class StubMovementEngineGateway implements MovementEngineGateway {
  async evaluate(_request: CreateMovementRequest): Promise<CreateMovementResult> {
    return { controlled: false, movementId: '' };
  }
}

// ---------------------------------------------------------------------------
// StubRoutineEvaluator — returns { params: {} }
// ---------------------------------------------------------------------------

export class StubRoutineEvaluator implements RoutineEvaluatorPort {
  async evaluate(_request: RoutineEvaluationRequest): Promise<RoutineEvaluationResult> {
    return { params: {} };
  }
}

// ---------------------------------------------------------------------------
// StubIntegrationQueue — noop
// ---------------------------------------------------------------------------

export class StubIntegrationQueue implements IntegrationQueuePort {
  async enqueue(_request: IntegrationJobRequest): Promise<void> {
    // noop
  }
}

// ---------------------------------------------------------------------------
// StubActionExecutorRegistry — returns undefined for all
// ---------------------------------------------------------------------------

export class StubActionExecutorRegistry implements ActionExecutorRegistry {
  get(_actionCode: string): ActionExecutor | undefined {
    return undefined;
  }
}
