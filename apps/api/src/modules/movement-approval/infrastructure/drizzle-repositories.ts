// @contract DATA-009, DOC-ARC-004
//
// Drizzle-based repository implementations for Movement Approval module (MOD-009).
// Maps between DB rows and domain Props, handling enum casts.

import { randomUUID } from 'node:crypto';
import { eq, and, isNull, desc, sql as dsql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  movementControlRules,
  approvalRules,
  controlledMovements,
  approvalInstances,
  movementExecutions,
  movementHistory,
  movementOverrideLog,
} from '../../../../db/schema/movement-approval.js';
import { domainEvents } from '../../../../db/schema/foundation.js';
import type {
  ControlRuleRepository,
  ApprovalRuleRepository,
  MovementRepository,
  ApprovalInstanceRepository,
  MovementExecutionRepository,
  MovementHistoryRepository,
  OverrideLogRepository,
  MovementHistoryEntry,
  MovementExecutionEntry,
  OverrideLogEntry,
  PaginatedResult,
  TransactionContext,
  UnitOfWork,
} from '../application/ports/repositories.js';
import type {
  DomainEventRepository,
  IdGeneratorService,
  CodigoGeneratorService,
} from '../application/ports/services.js';
import type { DomainEventBase } from '../../foundation/domain/events/foundation-events.js';
import type {
  MovementControlRuleProps,
  ApprovalRuleProps,
  ControlledMovementProps,
  ApprovalInstanceProps,
} from '../domain/index.js';

// Utility: resolve connection (tx or db)
type Conn = PostgresJsDatabase;
function conn(db: Conn, tx?: TransactionContext): Conn {
  return (tx ?? db) as Conn;
}

// ---------------------------------------------------------------------------
// ControlRuleRepository
// ---------------------------------------------------------------------------

export class DrizzleControlRuleRepository implements ControlRuleRepository {
  constructor(private db: Conn) {}

  async findById(
    id: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<MovementControlRuleProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(movementControlRules)
      .where(
        and(
          eq(movementControlRules.id, id),
          eq(movementControlRules.tenantId, tenantId),
          isNull(movementControlRules.deletedAt),
        ),
      )
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async findByCodigo(
    codigo: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<MovementControlRuleProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(movementControlRules)
      .where(
        and(
          eq(movementControlRules.codigo, codigo),
          eq(movementControlRules.tenantId, tenantId),
          isNull(movementControlRules.deletedAt),
        ),
      )
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async list(
    params: {
      tenantId: string;
      page: number;
      pageSize: number;
      status?: 'ACTIVE' | 'INACTIVE';
      objectType?: string;
    },
    tx?: TransactionContext,
  ): Promise<PaginatedResult<MovementControlRuleProps>> {
    const c = conn(this.db, tx);
    const conditions = [
      eq(movementControlRules.tenantId, params.tenantId),
      isNull(movementControlRules.deletedAt),
    ];
    if (params.status) conditions.push(eq(movementControlRules.status, params.status as any));
    if (params.objectType) conditions.push(eq(movementControlRules.objectType, params.objectType));

    const offset = (params.page - 1) * params.pageSize;

    const [rows, countResult] = await Promise.all([
      c
        .select()
        .from(movementControlRules)
        .where(and(...conditions))
        .orderBy(desc(movementControlRules.createdAt))
        .limit(params.pageSize)
        .offset(offset),
      c
        .select({ count: dsql<number>`count(*)::int` })
        .from(movementControlRules)
        .where(and(...conditions)),
    ]);

    return {
      data: rows.map((r) => this.toDomain(r)),
      total: countResult[0]?.count ?? 0,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  async findActiveRules(
    tenantId: string,
    objectType: string,
    operationType: string,
    tx?: TransactionContext,
  ): Promise<MovementControlRuleProps[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(movementControlRules)
      .where(
        and(
          eq(movementControlRules.tenantId, tenantId),
          eq(movementControlRules.status, 'ACTIVE' as any),
          eq(movementControlRules.objectType, objectType),
          eq(movementControlRules.operationType, operationType),
          isNull(movementControlRules.deletedAt),
        ),
      )
      .orderBy(movementControlRules.priority);

    return rows.map((r) => this.toDomain(r));
  }

  async create(
    entity: MovementControlRuleProps,
    tx?: TransactionContext,
  ): Promise<MovementControlRuleProps> {
    const c = conn(this.db, tx);
    const [created] = await c
      .insert(movementControlRules)
      .values({
        id: entity.id || undefined,
        tenantId: entity.tenantId,
        codigo: entity.codigo,
        nome: entity.nome,
        descricao: entity.descricao,
        objectType: entity.objectType,
        operationType: entity.operationType,
        originTypes: entity.originTypes as any,
        criteriaType: entity.criteriaType as any,
        valueThreshold: entity.valueThreshold?.toString() ?? null,
        priority: entity.priority,
        status: entity.status as any,
        validFrom: entity.validFrom,
        validUntil: entity.validUntil,
      })
      .returning();
    return this.toDomain(created!);
  }

  async update(
    entity: MovementControlRuleProps,
    tx?: TransactionContext,
  ): Promise<MovementControlRuleProps> {
    const c = conn(this.db, tx);
    const [updated] = await c
      .update(movementControlRules)
      .set({
        nome: entity.nome,
        descricao: entity.descricao,
        objectType: entity.objectType,
        operationType: entity.operationType,
        originTypes: entity.originTypes as any,
        criteriaType: entity.criteriaType as any,
        valueThreshold: entity.valueThreshold?.toString() ?? null,
        priority: entity.priority,
        status: entity.status as any,
        validFrom: entity.validFrom,
        validUntil: entity.validUntil,
        updatedAt: new Date(),
      })
      .where(eq(movementControlRules.id, entity.id))
      .returning();
    return this.toDomain(updated!);
  }

  private toDomain(row: typeof movementControlRules.$inferSelect): MovementControlRuleProps {
    return {
      id: row.id,
      tenantId: row.tenantId,
      codigo: row.codigo,
      nome: row.nome,
      descricao: row.descricao,
      objectType: row.objectType,
      operationType: row.operationType,
      originTypes: row.originTypes as MovementControlRuleProps['originTypes'],
      criteriaType: row.criteriaType as MovementControlRuleProps['criteriaType'],
      valueThreshold: row.valueThreshold ? Number(row.valueThreshold) : null,
      priority: row.priority,
      status: row.status as MovementControlRuleProps['status'],
      validFrom: row.validFrom!,
      validUntil: row.validUntil,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

// ---------------------------------------------------------------------------
// ApprovalRuleRepository
// ---------------------------------------------------------------------------

export class DrizzleApprovalRuleRepository implements ApprovalRuleRepository {
  constructor(private db: Conn) {}

  async findById(
    id: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<ApprovalRuleProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(approvalRules)
      .where(
        and(
          eq(approvalRules.id, id),
          eq(approvalRules.tenantId, tenantId),
          isNull(approvalRules.deletedAt),
        ),
      )
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async findByControlRule(
    controlRuleId: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<ApprovalRuleProps[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(approvalRules)
      .where(
        and(
          eq(approvalRules.controlRuleId, controlRuleId),
          eq(approvalRules.tenantId, tenantId),
          isNull(approvalRules.deletedAt),
        ),
      )
      .orderBy(approvalRules.level);

    return rows.map((r) => this.toDomain(r));
  }

  async create(entity: ApprovalRuleProps, tx?: TransactionContext): Promise<ApprovalRuleProps> {
    const c = conn(this.db, tx);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [created] = await c
      .insert(approvalRules)
      .values({
        id: entity.id || undefined,
        tenantId: entity.tenantId,
        controlRuleId: entity.controlRuleId,
        level: entity.level,
        approverType: entity.approverType as any,
        approverValue: entity.approverValue,
        requiredScope: entity.requiredScope,
        allowSelfApprove: entity.allowSelfApprove,
        timeoutMinutes: entity.timeoutMinutes ?? 1440,
        escalationRuleId: entity.escalationRuleId,
      } as any)
      .returning();
    return this.toDomain(created!);
  }

  async update(entity: ApprovalRuleProps, tx?: TransactionContext): Promise<ApprovalRuleProps> {
    const c = conn(this.db, tx);
    const [updated] = await c
      .update(approvalRules)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .set({
        level: entity.level,
        approverType: entity.approverType as any,
        approverValue: entity.approverValue,
        requiredScope: entity.requiredScope,
        allowSelfApprove: entity.allowSelfApprove,
        timeoutMinutes: entity.timeoutMinutes as any,
        escalationRuleId: entity.escalationRuleId,
        updatedAt: new Date(),
      })
      .where(eq(approvalRules.id, entity.id))
      .returning();
    return this.toDomain(updated!);
  }

  private toDomain(row: typeof approvalRules.$inferSelect): ApprovalRuleProps {
    return {
      id: row.id,
      tenantId: row.tenantId,
      controlRuleId: row.controlRuleId,
      level: row.level,
      approverType: row.approverType as ApprovalRuleProps['approverType'],
      approverValue: row.approverValue,
      requiredScope: row.requiredScope,
      allowSelfApprove: row.allowSelfApprove,
      timeoutMinutes: row.timeoutMinutes,
      escalationRuleId: row.escalationRuleId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

// ---------------------------------------------------------------------------
// MovementRepository
// ---------------------------------------------------------------------------

export class DrizzleMovementRepository implements MovementRepository {
  constructor(private db: Conn) {}

  async findById(
    id: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<ControlledMovementProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(controlledMovements)
      .where(
        and(
          eq(controlledMovements.id, id),
          eq(controlledMovements.tenantId, tenantId),
          isNull(controlledMovements.deletedAt),
        ),
      )
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async list(
    params: {
      tenantId: string;
      page: number;
      pageSize: number;
      status?: string;
      requesterId?: string;
    },
    tx?: TransactionContext,
  ): Promise<PaginatedResult<ControlledMovementProps>> {
    const c = conn(this.db, tx);
    const conditions = [
      eq(controlledMovements.tenantId, params.tenantId),
      isNull(controlledMovements.deletedAt),
    ];
    if (params.status) conditions.push(eq(controlledMovements.status, params.status as any));
    if (params.requesterId)
      conditions.push(eq(controlledMovements.requesterId, params.requesterId));

    const offset = (params.page - 1) * params.pageSize;

    const [rows, countResult] = await Promise.all([
      c
        .select()
        .from(controlledMovements)
        .where(and(...conditions))
        .orderBy(desc(controlledMovements.createdAt))
        .limit(params.pageSize)
        .offset(offset),
      c
        .select({ count: dsql<number>`count(*)::int` })
        .from(controlledMovements)
        .where(and(...conditions)),
    ]);

    return {
      data: rows.map((r) => this.toDomain(r)),
      total: countResult[0]?.count ?? 0,
      page: params.page,
      pageSize: params.pageSize,
    };
  }

  async findByIdempotencyKey(
    key: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<ControlledMovementProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(controlledMovements)
      .where(
        and(
          eq(controlledMovements.idempotencyKey, key),
          eq(controlledMovements.tenantId, tenantId),
          isNull(controlledMovements.deletedAt),
        ),
      )
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async create(
    entity: ControlledMovementProps,
    tx?: TransactionContext,
  ): Promise<ControlledMovementProps> {
    const c = conn(this.db, tx);
    const [created] = await c
      .insert(controlledMovements)
      .values({
        id: entity.id || undefined,
        tenantId: entity.tenantId,
        controlRuleId: entity.controlRuleId,
        codigo: entity.codigo,
        requesterId: entity.requesterId,
        requesterOrigin: entity.requesterOrigin as any,
        objectType: entity.objectType,
        objectId: entity.objectId,
        operationType: entity.operationType,
        operationPayload: entity.operationPayload as any,
        caseId: entity.caseId,
        currentLevel: entity.currentLevel,
        totalLevels: entity.totalLevels,
        status: entity.status as any,
        idempotencyKey: entity.idempotencyKey,
      })
      .returning();
    return this.toDomain(created!);
  }

  async update(
    entity: ControlledMovementProps,
    tx?: TransactionContext,
  ): Promise<ControlledMovementProps> {
    const c = conn(this.db, tx);
    const [updated] = await c
      .update(controlledMovements)
      .set({
        currentLevel: entity.currentLevel,
        status: entity.status as any,
        updatedAt: new Date(),
      })
      .where(eq(controlledMovements.id, entity.id))
      .returning();
    return this.toDomain(updated!);
  }

  private toDomain(row: typeof controlledMovements.$inferSelect): ControlledMovementProps {
    return {
      id: row.id,
      tenantId: row.tenantId,
      controlRuleId: row.controlRuleId,
      codigo: row.codigo,
      requesterId: row.requesterId,
      requesterOrigin: row.requesterOrigin as ControlledMovementProps['requesterOrigin'],
      objectType: row.objectType,
      objectId: row.objectId ?? '',
      operationType: row.operationType,
      operationPayload: (row.operationPayload as Record<string, unknown>) ?? {},
      caseId: row.caseId,
      currentLevel: row.currentLevel,
      totalLevels: row.totalLevels,
      status: row.status as ControlledMovementProps['status'],
      idempotencyKey: row.idempotencyKey ?? '',
      errorMessage: null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

// ---------------------------------------------------------------------------
// ApprovalInstanceRepository
// ---------------------------------------------------------------------------

export class DrizzleApprovalInstanceRepository implements ApprovalInstanceRepository {
  constructor(private db: Conn) {}

  async findById(
    id: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<ApprovalInstanceProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(approvalInstances)
      .where(
        and(
          eq(approvalInstances.id, id),
          eq(approvalInstances.tenantId, tenantId),
          isNull(approvalInstances.deletedAt),
        ),
      )
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async findByMovement(
    movementId: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<ApprovalInstanceProps[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(approvalInstances)
      .where(
        and(
          eq(approvalInstances.movementId, movementId),
          eq(approvalInstances.tenantId, tenantId),
          isNull(approvalInstances.deletedAt),
        ),
      )
      .orderBy(approvalInstances.level);

    return rows.map((r) => this.toDomain(r));
  }

  async findPendingByApprover(
    approverId: string,
    tenantId: string,
    status?: ApprovalInstanceProps['status'],
    tx?: TransactionContext,
  ): Promise<ApprovalInstanceProps[]> {
    const c = conn(this.db, tx);
    const conditions = [
      eq(approvalInstances.approverId, approverId),
      eq(approvalInstances.tenantId, tenantId),
      isNull(approvalInstances.deletedAt),
    ];
    if (status) {
      conditions.push(eq(approvalInstances.status, status as any));
    } else {
      conditions.push(eq(approvalInstances.status, 'PENDING' as any));
    }

    const rows = await c
      .select()
      .from(approvalInstances)
      .where(and(...conditions))
      .orderBy(desc(approvalInstances.createdAt));

    return rows.map((r) => this.toDomain(r));
  }

  async create(
    entity: ApprovalInstanceProps,
    tx?: TransactionContext,
  ): Promise<ApprovalInstanceProps> {
    const c = conn(this.db, tx);
    const [created] = await c
      .insert(approvalInstances)
      .values({
        id: entity.id || undefined,
        tenantId: entity.tenantId,
        movementId: entity.movementId,
        level: entity.level,
        approverId: entity.approverId,
        status: entity.status as any,
        opinion: entity.opinion,
        decidedAt: entity.decidedAt,
        timeoutAt: entity.timeoutAt,
      })
      .returning();
    return this.toDomain(created!);
  }

  async createMany(
    entities: readonly ApprovalInstanceProps[],
    tx?: TransactionContext,
  ): Promise<ApprovalInstanceProps[]> {
    if (entities.length === 0) return [];
    const c = conn(this.db, tx);
    const created = await c
      .insert(approvalInstances)
      .values(
        entities.map((e) => ({
          id: e.id || undefined,
          tenantId: e.tenantId,
          movementId: e.movementId,
          level: e.level,
          approverId: e.approverId,
          status: e.status as any,
          opinion: e.opinion,
          decidedAt: e.decidedAt,
          timeoutAt: e.timeoutAt,
        })),
      )
      .returning();
    return created.map((r) => this.toDomain(r));
  }

  async update(
    entity: ApprovalInstanceProps,
    tx?: TransactionContext,
  ): Promise<ApprovalInstanceProps> {
    const c = conn(this.db, tx);
    const [updated] = await c
      .update(approvalInstances)
      .set({
        approverId: entity.approverId,
        status: entity.status as any,
        opinion: entity.opinion,
        decidedAt: entity.decidedAt,
        updatedAt: new Date(),
      })
      .where(eq(approvalInstances.id, entity.id))
      .returning();
    return this.toDomain(updated!);
  }

  private toDomain(row: typeof approvalInstances.$inferSelect): ApprovalInstanceProps {
    return {
      id: row.id,
      tenantId: row.tenantId,
      movementId: row.movementId,
      level: row.level,
      approverId: row.approverId,
      status: row.status as ApprovalInstanceProps['status'],
      opinion: row.opinion,
      decidedAt: row.decidedAt,
      timeoutAt: row.timeoutAt,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

// ---------------------------------------------------------------------------
// MovementExecutionRepository
// ---------------------------------------------------------------------------

export class DrizzleMovementExecutionRepository implements MovementExecutionRepository {
  constructor(private db: Conn) {}

  async create(
    entity: MovementExecutionEntry,
    tx?: TransactionContext,
  ): Promise<MovementExecutionEntry> {
    const c = conn(this.db, tx);
    const [created] = await c
      .insert(movementExecutions)
      .values({
        id: entity.id || undefined,
        tenantId: entity.tenantId,
        movementId: entity.movementId,
        status: entity.status as any,
        errorMessage: entity.errorMessage,
        executedAt: entity.executedAt,
      })
      .returning();
    return this.toDomain(created!);
  }

  async findByMovement(
    movementId: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<MovementExecutionEntry[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(movementExecutions)
      .where(
        and(
          eq(movementExecutions.movementId, movementId),
          eq(movementExecutions.tenantId, tenantId),
        ),
      )
      .orderBy(desc(movementExecutions.createdAt));

    return rows.map((r) => this.toDomain(r));
  }

  private toDomain(row: typeof movementExecutions.$inferSelect): MovementExecutionEntry {
    return {
      id: row.id,
      tenantId: row.tenantId,
      movementId: row.movementId,
      status: row.status as MovementExecutionEntry['status'],
      errorMessage: row.errorMessage,
      executedAt: row.executedAt,
      createdAt: row.createdAt,
    };
  }
}

// ---------------------------------------------------------------------------
// MovementHistoryRepository
// ---------------------------------------------------------------------------

export class DrizzleMovementHistoryRepository implements MovementHistoryRepository {
  constructor(private db: Conn) {}

  async create(entry: MovementHistoryEntry, tx?: TransactionContext): Promise<void> {
    const c = conn(this.db, tx);
    await c.insert(movementHistory).values({
      id: entry.id || undefined,
      tenantId: entry.tenantId,
      movementId: entry.movementId,
      eventType: entry.action,
      actorId: entry.actorId,
      payload: entry.detail as any,
    });
  }

  async findByMovement(
    movementId: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<MovementHistoryEntry[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(movementHistory)
      .where(
        and(eq(movementHistory.movementId, movementId), eq(movementHistory.tenantId, tenantId)),
      )
      .orderBy(movementHistory.createdAt);

    return rows.map((r) => this.toDomain(r));
  }

  private toDomain(row: typeof movementHistory.$inferSelect): MovementHistoryEntry {
    return {
      id: row.id,
      tenantId: row.tenantId,
      movementId: row.movementId,
      action: row.eventType,
      actorId: row.actorId ?? '',
      detail: (row.payload as Record<string, unknown>) ?? {},
      createdAt: row.createdAt,
    };
  }
}

// ---------------------------------------------------------------------------
// OverrideLogRepository
// ---------------------------------------------------------------------------

export class DrizzleOverrideLogRepository implements OverrideLogRepository {
  constructor(private db: Conn) {}

  async create(entry: OverrideLogEntry, tx?: TransactionContext): Promise<void> {
    const c = conn(this.db, tx);
    await c.insert(movementOverrideLog).values({
      id: entry.id || undefined,
      tenantId: entry.tenantId,
      movementId: entry.movementId,
      overriddenBy: entry.actorId,
      justification: entry.justification,
      previousStatus: entry.previousStatus,
    });
  }

  async findByMovement(
    movementId: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<OverrideLogEntry[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(movementOverrideLog)
      .where(
        and(
          eq(movementOverrideLog.movementId, movementId),
          eq(movementOverrideLog.tenantId, tenantId),
        ),
      )
      .orderBy(movementOverrideLog.createdAt);

    return rows.map((r) => this.toDomain(r));
  }

  private toDomain(row: typeof movementOverrideLog.$inferSelect): OverrideLogEntry {
    return {
      id: row.id,
      tenantId: row.tenantId,
      movementId: row.movementId,
      actorId: row.overriddenBy,
      justification: row.justification,
      actorScopes: [],
      previousStatus: row.previousStatus ?? '',
      createdAt: row.createdAt,
    };
  }
}

// ---------------------------------------------------------------------------
// UnitOfWork
// ---------------------------------------------------------------------------

export class DrizzleMovApprovalUnitOfWork implements UnitOfWork {
  constructor(private db: Conn) {}

  async transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T> {
    return this.db.transaction(async (tx) => fn(tx));
  }
}

// ---------------------------------------------------------------------------
// DomainEventRepository (writes to foundation domain_events table)
// ---------------------------------------------------------------------------

export class DrizzleMovApprovalEventRepository implements DomainEventRepository {
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
// IdGeneratorService
// ---------------------------------------------------------------------------

export class CryptoIdGenerator implements IdGeneratorService {
  generate(): string {
    return randomUUID();
  }
}

// ---------------------------------------------------------------------------
// CodigoGeneratorService
// ---------------------------------------------------------------------------

export class DrizzleCodigoGenerator implements CodigoGeneratorService {
  constructor(private db: Conn) {}

  async nextMovementCodigo(tenantId: string, tx?: unknown): Promise<string> {
    const c = conn(this.db, tx as TransactionContext);
    const [result] = await c
      .select({ count: dsql<number>`count(*)::int` })
      .from(controlledMovements)
      .where(eq(controlledMovements.tenantId, tenantId));

    const seq = (result?.count ?? 0) + 1;
    return `MOV-${seq.toString().padStart(6, '0')}`;
  }
}
