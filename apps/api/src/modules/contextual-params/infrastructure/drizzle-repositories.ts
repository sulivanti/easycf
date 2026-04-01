// @contract DATA-007, DOC-ARC-004
//
// Drizzle-based repository implementations for Contextual Params module (MOD-007).

import { eq, and, lt, lte, desc, isNull, asc, inArray, sql as dsql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  contextFramerTypes,
  contextFramers,
  targetObjects,
  targetFields,
  incidenceRules,
  behaviorRoutines,
  routineItems,
  routineIncidenceLinks,
  routineVersionHistory,
} from '../../../../db/schema/contextual-params.js';
import { domainEvents } from '../../../../db/schema/foundation.js';
import type {
  FramerTypeRepository,
  ContextFramerTypeRecord,
  FramerRepository,
  TargetObjectRepository,
  TargetObjectRecord,
  TargetFieldRepository,
  TargetFieldRecord,
  IncidenceRuleRepository,
  RoutineRepository,
  RoutineItemRepository,
  RoutineItemRecord,
  RoutineIncidenceLinkRepository,
  RoutineIncidenceLinkRecord,
  VersionHistoryRepository,
  RoutineVersionHistoryRecord,
  DomainEventRepository,
  DomainEventRecord,
  UnitOfWork,
  TransactionContext,
  PaginationParams,
  PaginatedResult,
} from '../application/ports/repositories.js';
import type { ContextFramerProps } from '../domain/entities/context-framer.js';
import type { IncidenceRuleProps } from '../domain/entities/incidence-rule.js';
import type { BehaviorRoutineProps } from '../domain/aggregates/behavior-routine.js';
import type { IdGeneratorService } from '../application/ports/services.js';

type Conn = PostgresJsDatabase;
function conn(db: Conn, tx?: TransactionContext): Conn {
  return (tx ?? db) as Conn;
}

// ─────────────────────────────────────────────────────────────────────────────
// FramerTypeRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleFramerTypeRepository implements FramerTypeRepository {
  constructor(private db: Conn) {}

  async findById(
    tenantId: string,
    id: string,
    tx?: TransactionContext,
  ): Promise<ContextFramerTypeRecord | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(contextFramerTypes)
      .where(and(eq(contextFramerTypes.id, id), eq(contextFramerTypes.tenantId, tenantId)))
      .limit(1);
    return row ?? null;
  }

  async list(
    tenantId: string,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<ContextFramerTypeRecord>> {
    const c = conn(this.db, tx);
    const limit = params.limit + 1;
    const rows = await c
      .select()
      .from(contextFramerTypes)
      .where(eq(contextFramerTypes.tenantId, tenantId))
      .orderBy(desc(contextFramerTypes.createdAt))
      .limit(limit);
    const hasMore = rows.length > params.limit;
    const data = rows.slice(0, params.limit);
    return { data, nextCursor: hasMore ? data[data.length - 1].id : null, hasMore };
  }

  async create(
    record: ContextFramerTypeRecord,
    tx?: TransactionContext,
  ): Promise<ContextFramerTypeRecord> {
    const c = conn(this.db, tx);
    const [row] = await c.insert(contextFramerTypes).values(record).returning();
    return row;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FramerRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleFramerRepository implements FramerRepository {
  constructor(private db: Conn) {}

  async findById(
    tenantId: string,
    id: string,
    tx?: TransactionContext,
  ): Promise<ContextFramerProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(contextFramers)
      .where(
        and(
          eq(contextFramers.id, id),
          eq(contextFramers.tenantId, tenantId),
          isNull(contextFramers.deletedAt),
        ),
      )
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async list(
    tenantId: string,
    params: PaginationParams & { status?: 'ACTIVE' | 'INACTIVE'; framerTypeId?: string },
    tx?: TransactionContext,
  ): Promise<PaginatedResult<ContextFramerProps>> {
    const c = conn(this.db, tx);
    const limit = params.limit + 1;
    const conditions = [eq(contextFramers.tenantId, tenantId), isNull(contextFramers.deletedAt)];
    if (params.status) conditions.push(eq(contextFramers.status, params.status));
    if (params.framerTypeId) conditions.push(eq(contextFramers.framerTypeId, params.framerTypeId));

    const rows = await c
      .select()
      .from(contextFramers)
      .where(and(...conditions))
      .orderBy(desc(contextFramers.createdAt))
      .limit(limit);
    const hasMore = rows.length > params.limit;
    const data = rows.slice(0, params.limit).map((r) => this.toDomain(r));
    return { data, nextCursor: hasMore ? data[data.length - 1].id : null, hasMore };
  }

  async create(record: ContextFramerProps, tx?: TransactionContext): Promise<ContextFramerProps> {
    const c = conn(this.db, tx);
    const [row] = await c.insert(contextFramers).values(record).returning();
    return this.toDomain(row);
  }

  async update(record: ContextFramerProps, tx?: TransactionContext): Promise<ContextFramerProps> {
    const c = conn(this.db, tx);
    const [row] = await c
      .update(contextFramers)
      .set({
        nome: record.nome,
        status: record.status,
        validFrom: record.validFrom,
        validUntil: record.validUntil,
        version: record.version,
        updatedAt: record.updatedAt,
      })
      .where(eq(contextFramers.id, record.id))
      .returning();
    return this.toDomain(row);
  }

  async softDelete(tenantId: string, id: string, tx?: TransactionContext): Promise<void> {
    const c = conn(this.db, tx);
    await c
      .update(contextFramers)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(contextFramers.id, id), eq(contextFramers.tenantId, tenantId)));
  }

  async findExpired(
    tenantId: string,
    now: Date,
    tx?: TransactionContext,
  ): Promise<readonly ContextFramerProps[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(contextFramers)
      .where(
        and(
          eq(contextFramers.tenantId, tenantId),
          eq(contextFramers.status, 'ACTIVE'),
          isNull(contextFramers.deletedAt),
          lt(contextFramers.validUntil, now),
        ),
      );
    return rows.map((r) => this.toDomain(r));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(row: any): ContextFramerProps {
    return {
      id: row.id,
      tenantId: row.tenantId,
      codigo: row.codigo,
      nome: row.nome,
      framerTypeId: row.framerTypeId,
      status: row.status,
      version: row.version,
      validFrom: row.validFrom,
      validUntil: row.validUntil,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TargetObjectRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleTargetObjectRepository implements TargetObjectRepository {
  constructor(private db: Conn) {}

  async findById(
    tenantId: string,
    id: string,
    tx?: TransactionContext,
  ): Promise<TargetObjectRecord | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(targetObjects)
      .where(and(eq(targetObjects.id, id), eq(targetObjects.tenantId, tenantId)))
      .limit(1);
    return row ?? null;
  }

  async list(
    tenantId: string,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<TargetObjectRecord>> {
    const c = conn(this.db, tx);
    const limit = params.limit + 1;
    const rows = await c
      .select()
      .from(targetObjects)
      .where(eq(targetObjects.tenantId, tenantId))
      .orderBy(desc(targetObjects.createdAt))
      .limit(limit);
    const hasMore = rows.length > params.limit;
    const data = rows.slice(0, params.limit);
    return { data, nextCursor: hasMore ? data[data.length - 1].id : null, hasMore };
  }

  async create(record: TargetObjectRecord, tx?: TransactionContext): Promise<TargetObjectRecord> {
    const c = conn(this.db, tx);
    const [row] = await c.insert(targetObjects).values(record).returning();
    return row;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// TargetFieldRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleTargetFieldRepository implements TargetFieldRepository {
  constructor(private db: Conn) {}

  async findById(
    tenantId: string,
    id: string,
    tx?: TransactionContext,
  ): Promise<TargetFieldRecord | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(targetFields)
      .where(and(eq(targetFields.id, id), eq(targetFields.tenantId, tenantId)))
      .limit(1);
    return row ?? null;
  }

  async listByTargetObject(
    tenantId: string,
    targetObjectId: string,
    tx?: TransactionContext,
  ): Promise<readonly TargetFieldRecord[]> {
    const c = conn(this.db, tx);
    return c
      .select()
      .from(targetFields)
      .where(
        and(eq(targetFields.targetObjectId, targetObjectId), eq(targetFields.tenantId, tenantId)),
      );
  }

  async create(record: TargetFieldRecord, tx?: TransactionContext): Promise<TargetFieldRecord> {
    const c = conn(this.db, tx);
    const [row] = await c.insert(targetFields).values(record).returning();
    return row;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// IncidenceRuleRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleIncidenceRuleRepository implements IncidenceRuleRepository {
  constructor(private db: Conn) {}

  async findById(
    tenantId: string,
    id: string,
    tx?: TransactionContext,
  ): Promise<IncidenceRuleProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(incidenceRules)
      .where(and(eq(incidenceRules.id, id), eq(incidenceRules.tenantId, tenantId)))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async list(
    tenantId: string,
    params: PaginationParams & {
      framerId?: string;
      targetObjectId?: string;
      incidenceType?: 'OBR' | 'OPC' | 'AUTO';
      status?: 'ACTIVE' | 'INACTIVE';
    },
    tx?: TransactionContext,
  ): Promise<PaginatedResult<IncidenceRuleProps>> {
    const c = conn(this.db, tx);
    const limit = params.limit + 1;
    const conditions = [eq(incidenceRules.tenantId, tenantId)];
    if (params.framerId) conditions.push(eq(incidenceRules.framerId, params.framerId));
    if (params.targetObjectId)
      conditions.push(eq(incidenceRules.targetObjectId, params.targetObjectId));
    if (params.incidenceType)
      conditions.push(eq(incidenceRules.incidenceType, params.incidenceType));
    if (params.status) conditions.push(eq(incidenceRules.status, params.status));

    const rows = await c
      .select()
      .from(incidenceRules)
      .where(and(...conditions))
      .orderBy(desc(incidenceRules.createdAt))
      .limit(limit);
    const hasMore = rows.length > params.limit;
    const data = rows.slice(0, params.limit).map((r) => this.toDomain(r));
    return { data, nextCursor: hasMore ? data[data.length - 1].id : null, hasMore };
  }

  async findByFramerAndObject(
    tenantId: string,
    framerId: string,
    targetObjectId: string,
    tx?: TransactionContext,
  ): Promise<IncidenceRuleProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(incidenceRules)
      .where(
        and(
          eq(incidenceRules.tenantId, tenantId),
          eq(incidenceRules.framerId, framerId),
          eq(incidenceRules.targetObjectId, targetObjectId),
        ),
      )
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async countByFramer(
    tenantId: string,
    framerId: string,
    tx?: TransactionContext,
  ): Promise<number> {
    const c = conn(this.db, tx);
    const [result] = await c
      .select({ count: dsql<number>`count(*)::int` })
      .from(incidenceRules)
      .where(and(eq(incidenceRules.tenantId, tenantId), eq(incidenceRules.framerId, framerId)));
    return result?.count ?? 0;
  }

  async create(record: IncidenceRuleProps, tx?: TransactionContext): Promise<IncidenceRuleProps> {
    const c = conn(this.db, tx);
    const [row] = await c.insert(incidenceRules).values(record).returning();
    return this.toDomain(row);
  }

  async update(record: IncidenceRuleProps, tx?: TransactionContext): Promise<IncidenceRuleProps> {
    const c = conn(this.db, tx);
    const [row] = await c
      .update(incidenceRules)
      .set({
        conditionExpr: record.conditionExpr,
        incidenceType: record.incidenceType,
        validFrom: record.validFrom,
        validUntil: record.validUntil,
        status: record.status,
        updatedAt: record.updatedAt,
      })
      .where(eq(incidenceRules.id, record.id))
      .returning();
    return this.toDomain(row);
  }

  async findActiveByFramerIds(
    tenantId: string,
    framerIds: readonly string[],
    now: Date,
    tx?: TransactionContext,
  ): Promise<readonly IncidenceRuleProps[]> {
    if (framerIds.length === 0) return [];
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(incidenceRules)
      .where(
        and(
          eq(incidenceRules.tenantId, tenantId),
          eq(incidenceRules.status, 'ACTIVE'),
          inArray(incidenceRules.framerId, framerIds as string[]),
          lte(incidenceRules.validFrom, now),
          dsql`(${incidenceRules.validUntil} IS NULL OR ${incidenceRules.validUntil} > ${now})`,
        ),
      );
    return rows.map((r) => this.toDomain(r));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(row: any): IncidenceRuleProps {
    return {
      id: row.id,
      tenantId: row.tenantId,
      framerId: row.framerId,
      targetObjectId: row.targetObjectId,
      conditionExpr: row.conditionExpr,
      incidenceType: row.incidenceType ?? 'OBR',
      validFrom: row.validFrom,
      validUntil: row.validUntil,
      status: row.status,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RoutineRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleRoutineRepository implements RoutineRepository {
  constructor(private db: Conn) {}

  async findById(
    tenantId: string,
    id: string,
    tx?: TransactionContext,
  ): Promise<BehaviorRoutineProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(behaviorRoutines)
      .where(
        and(
          eq(behaviorRoutines.id, id),
          eq(behaviorRoutines.tenantId, tenantId),
          isNull(behaviorRoutines.deletedAt),
        ),
      )
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async list(
    tenantId: string,
    params: PaginationParams & {
      status?: 'DRAFT' | 'PUBLISHED' | 'DEPRECATED';
      routineType?: 'BEHAVIOR' | 'INTEGRATION';
    },
    tx?: TransactionContext,
  ): Promise<PaginatedResult<BehaviorRoutineProps>> {
    const c = conn(this.db, tx);
    const limit = params.limit + 1;
    const conditions = [
      eq(behaviorRoutines.tenantId, tenantId),
      isNull(behaviorRoutines.deletedAt),
    ];
    if (params.status) conditions.push(eq(behaviorRoutines.status, params.status));
    if (params.routineType) conditions.push(eq(behaviorRoutines.routineType, params.routineType));

    const rows = await c
      .select()
      .from(behaviorRoutines)
      .where(and(...conditions))
      .orderBy(desc(behaviorRoutines.createdAt))
      .limit(limit);
    const hasMore = rows.length > params.limit;
    const data = rows.slice(0, params.limit).map((r) => this.toDomain(r));
    return { data, nextCursor: hasMore ? data[data.length - 1].id : null, hasMore };
  }

  async create(
    record: BehaviorRoutineProps,
    tx?: TransactionContext,
  ): Promise<BehaviorRoutineProps> {
    const c = conn(this.db, tx);
    const [row] = await c.insert(behaviorRoutines).values(record).returning();
    return this.toDomain(row);
  }

  async update(
    record: BehaviorRoutineProps,
    tx?: TransactionContext,
  ): Promise<BehaviorRoutineProps> {
    const c = conn(this.db, tx);
    const [row] = await c
      .update(behaviorRoutines)
      .set({
        nome: record.nome,
        status: record.status,
        version: record.version,
        publishedAt: record.publishedAt,
        approvedBy: record.approvedBy,
        updatedAt: record.updatedAt,
      })
      .where(eq(behaviorRoutines.id, record.id))
      .returning();
    return this.toDomain(row);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(row: any): BehaviorRoutineProps {
    return {
      id: row.id,
      tenantId: row.tenantId,
      codigo: row.codigo,
      nome: row.nome,
      routineType: row.routineType,
      version: row.version,
      status: row.status,
      parentRoutineId: row.parentRoutineId,
      publishedAt: row.publishedAt,
      approvedBy: row.approvedBy,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RoutineItemRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleRoutineItemRepository implements RoutineItemRepository {
  constructor(private db: Conn) {}

  async findById(id: string, tx?: TransactionContext): Promise<RoutineItemRecord | null> {
    const c = conn(this.db, tx);
    const [row] = await c.select().from(routineItems).where(eq(routineItems.id, id)).limit(1);
    return row ? this.toDomain(row) : null;
  }

  async listByRoutine(
    routineId: string,
    tx?: TransactionContext,
  ): Promise<readonly RoutineItemRecord[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(routineItems)
      .where(eq(routineItems.routineId, routineId))
      .orderBy(asc(routineItems.ordem));
    return rows.map((r) => this.toDomain(r));
  }

  async countByRoutine(routineId: string, tx?: TransactionContext): Promise<number> {
    const c = conn(this.db, tx);
    const [result] = await c
      .select({ count: dsql<number>`count(*)::int` })
      .from(routineItems)
      .where(eq(routineItems.routineId, routineId));
    return result?.count ?? 0;
  }

  async create(record: RoutineItemRecord, tx?: TransactionContext): Promise<RoutineItemRecord> {
    const c = conn(this.db, tx);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [row] = await c
      .insert(routineItems)
      .values(record as any)
      .returning();
    return this.toDomain(row);
  }

  async update(record: RoutineItemRecord, tx?: TransactionContext): Promise<RoutineItemRecord> {
    const c = conn(this.db, tx);
    const [row] = await c
      .update(routineItems)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .set({
        itemType: record.itemType as any,
        targetFieldId: record.targetFieldId,
        action: record.action as any,
        value: record.value,
        conditionExpr: record.conditionExpr,
        validationMessage: record.validationMessage,
        isBlocking: record.isBlocking,
        ordem: record.ordem,
        updatedAt: record.updatedAt,
      })
      .where(eq(routineItems.id, record.id))
      .returning();
    return this.toDomain(row);
  }

  async delete(id: string, tx?: TransactionContext): Promise<void> {
    const c = conn(this.db, tx);
    await c.delete(routineItems).where(eq(routineItems.id, id));
  }

  async copyToRoutine(
    sourceRoutineId: string,
    targetRoutineId: string,
    tx?: TransactionContext,
  ): Promise<readonly RoutineItemRecord[]> {
    const c = conn(this.db, tx);
    const items = await this.listByRoutine(sourceRoutineId, tx);
    if (items.length === 0) return [];
    const newItems = items.map((item) => ({
      ...item,
      id: crypto.randomUUID(),
      routineId: targetRoutineId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rows = await c
      .insert(routineItems)
      .values(newItems as any)
      .returning();
    return rows.map((r) => this.toDomain(r));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(row: any): RoutineItemRecord {
    return {
      id: row.id,
      routineId: row.routineId,
      itemType: row.itemType,
      targetFieldId: row.targetFieldId,
      action: row.action,
      value: row.value,
      conditionExpr: row.conditionExpr,
      validationMessage: row.validationMessage,
      isBlocking: row.isBlocking,
      ordem: row.ordem,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// RoutineIncidenceLinkRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleRoutineIncidenceLinkRepository implements RoutineIncidenceLinkRepository {
  constructor(private db: Conn) {}

  async findByRoutineAndRule(
    routineId: string,
    incidenceRuleId: string,
    tx?: TransactionContext,
  ): Promise<RoutineIncidenceLinkRecord | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(routineIncidenceLinks)
      .where(
        and(
          eq(routineIncidenceLinks.routineId, routineId),
          eq(routineIncidenceLinks.incidenceRuleId, incidenceRuleId),
        ),
      )
      .limit(1);
    return row ?? null;
  }

  async listByRoutine(
    routineId: string,
    tx?: TransactionContext,
  ): Promise<readonly RoutineIncidenceLinkRecord[]> {
    const c = conn(this.db, tx);
    return c
      .select()
      .from(routineIncidenceLinks)
      .where(eq(routineIncidenceLinks.routineId, routineId));
  }

  async findPublishedRoutineIdsByRuleIds(
    ruleIds: readonly string[],
    tx?: TransactionContext,
  ): Promise<readonly { routineId: string; incidenceRuleId: string }[]> {
    if (ruleIds.length === 0) return [];
    const c = conn(this.db, tx);
    const rows = await c
      .select({
        routineId: routineIncidenceLinks.routineId,
        incidenceRuleId: routineIncidenceLinks.incidenceRuleId,
      })
      .from(routineIncidenceLinks)
      .innerJoin(behaviorRoutines, eq(routineIncidenceLinks.routineId, behaviorRoutines.id))
      .where(
        and(
          inArray(routineIncidenceLinks.incidenceRuleId, ruleIds as string[]),
          eq(behaviorRoutines.status, 'PUBLISHED'),
          isNull(behaviorRoutines.deletedAt),
        ),
      );
    return rows;
  }

  async create(
    record: RoutineIncidenceLinkRecord,
    tx?: TransactionContext,
  ): Promise<RoutineIncidenceLinkRecord> {
    const c = conn(this.db, tx);
    const [row] = await c.insert(routineIncidenceLinks).values(record).returning();
    return row;
  }

  async delete(id: string, tx?: TransactionContext): Promise<void> {
    const c = conn(this.db, tx);
    await c.delete(routineIncidenceLinks).where(eq(routineIncidenceLinks.id, id));
  }

  async deleteByRoutineAndRule(
    routineId: string,
    incidenceRuleId: string,
    tx?: TransactionContext,
  ): Promise<void> {
    const c = conn(this.db, tx);
    await c
      .delete(routineIncidenceLinks)
      .where(
        and(
          eq(routineIncidenceLinks.routineId, routineId),
          eq(routineIncidenceLinks.incidenceRuleId, incidenceRuleId),
        ),
      );
  }

  async copyToRoutine(
    sourceRoutineId: string,
    targetRoutineId: string,
    tx?: TransactionContext,
  ): Promise<readonly RoutineIncidenceLinkRecord[]> {
    const c = conn(this.db, tx);
    const links = await this.listByRoutine(sourceRoutineId, tx);
    if (links.length === 0) return [];
    const newLinks = links.map((link) => ({
      id: crypto.randomUUID(),
      routineId: targetRoutineId,
      incidenceRuleId: link.incidenceRuleId,
      createdAt: new Date(),
    }));
    const rows = await c.insert(routineIncidenceLinks).values(newLinks).returning();
    return rows;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// VersionHistoryRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleVersionHistoryRepository implements VersionHistoryRepository {
  constructor(private db: Conn) {}

  async listByRoutine(
    routineId: string,
    tx?: TransactionContext,
  ): Promise<readonly RoutineVersionHistoryRecord[]> {
    const c = conn(this.db, tx);
    return c
      .select()
      .from(routineVersionHistory)
      .where(eq(routineVersionHistory.routineId, routineId))
      .orderBy(desc(routineVersionHistory.changedAt));
  }

  async create(
    record: RoutineVersionHistoryRecord,
    tx?: TransactionContext,
  ): Promise<RoutineVersionHistoryRecord> {
    const c = conn(this.db, tx);
    const [row] = await c.insert(routineVersionHistory).values(record).returning();
    return row;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DomainEventRepository (MOD-007 local — writes to foundation domain_events)
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleParamDomainEventRepository implements DomainEventRepository {
  constructor(private db: Conn) {}

  async create(event: DomainEventRecord, tx?: TransactionContext): Promise<void> {
    const c = conn(this.db, tx);
    await c.insert(domainEvents).values({
      id: event.id,
      tenantId: event.tenantId,
      entityType: event.entityType,
      entityId: event.entityId,
      eventType: event.eventType,
      payload: event.payload,
      correlationId: event.correlationId,
      causationId: event.causationId,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      sensitivityLevel: 1,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// UnitOfWork
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleParamUnitOfWork implements UnitOfWork {
  constructor(private db: Conn) {}

  async transaction<T>(fn: (tx: TransactionContext) => Promise<T>): Promise<T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (this.db as any).transaction(fn);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// IdGeneratorService
// ─────────────────────────────────────────────────────────────────────────────

export class CryptoIdGenerator implements IdGeneratorService {
  generate(): string {
    return crypto.randomUUID();
  }
}
