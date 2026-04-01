// @contract DATA-008, DOC-ARC-004
//
// Drizzle-based repository implementations for Integration Protheus module (MOD-008).

import { eq, and, desc, isNull, gte, lte, sql as dsql } from 'drizzle-orm';
import type { InferInsertModel } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  integrationServices,
  integrationRoutines,
  integrationFieldMappings,
  integrationParams,
  integrationCallLogs,
  integrationReprocessRequests,
} from '../../../../db/schema/integration-protheus.js';
import type {
  IntegrationServiceRepository,
  ServiceListFilters,
  IntegrationRoutineRepository,
  IntegrationRoutineRow,
  FieldMappingRepository,
  FieldMappingRow,
  IntegrationParamRepository,
  IntegrationParamRow,
  CallLogRepository,
  CallLogRow,
  CallLogListFilters,
  ReprocessRequestRepository,
  ReprocessRequestRow,
  EncryptionService,
  HttpClientPort,
  HttpCallOptions,
  HttpCallResult,
  QueuePort,
} from '../application/ports/repositories.js';
import type {
  TransactionContext,
  PaginationParams,
  PaginatedResult,
} from '../../foundation/application/ports/repositories.js';
import type { IntegrationServiceProps } from '../domain/entities/integration-service.entity.js';

type Conn = PostgresJsDatabase;
function conn(db: Conn, tx?: TransactionContext): Conn {
  return (tx ?? db) as Conn;
}

// ─────────────────────────────────────────────────────────────────────────────
// IntegrationServiceRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleIntegrationServiceRepository implements IntegrationServiceRepository {
  constructor(private db: Conn) {}

  async findById(id: string, tx?: TransactionContext): Promise<IntegrationServiceProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(integrationServices)
      .where(and(eq(integrationServices.id, id), isNull(integrationServices.deletedAt)))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async list(
    filters: ServiceListFilters,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<IntegrationServiceProps>> {
    const c = conn(this.db, tx);
    const limit = params.limit + 1;
    const conditions = [
      eq(integrationServices.tenantId, filters.tenantId),
      isNull(integrationServices.deletedAt),
    ];
    if (filters.status) conditions.push(eq(integrationServices.status, filters.status));
    if (filters.environment)
      conditions.push(eq(integrationServices.environment, filters.environment));

    const rows = await c
      .select()
      .from(integrationServices)
      .where(and(...conditions))
      .orderBy(desc(integrationServices.createdAt))
      .limit(limit);
    const hasMore = rows.length > params.limit;
    const data = rows.slice(0, params.limit).map((r) => this.toDomain(r));
    return { data, nextCursor: hasMore ? data[data.length - 1].id : null, hasMore };
  }

  async create(
    service: IntegrationServiceProps,
    tx?: TransactionContext,
  ): Promise<IntegrationServiceProps> {
    const c = conn(this.db, tx);
    const [row] = await c
      .insert(integrationServices)
      .values(service as InferInsertModel<typeof integrationServices>)
      .returning();
    return this.toDomain(row);
  }

  async update(
    service: IntegrationServiceProps,
    tx?: TransactionContext,
  ): Promise<IntegrationServiceProps> {
    const c = conn(this.db, tx);
    const [row] = await c
      .update(integrationServices)
      .set({
        nome: service.nome,
        baseUrl: service.baseUrl,
        authType: service.authType as string,
        authConfig: service.authConfig,
        timeoutMs: service.timeoutMs,
        status: service.status as string,
        environment: service.environment as string,
        updatedAt: service.updatedAt,
      })
      .where(eq(integrationServices.id, service.id))
      .returning();
    return this.toDomain(row);
  }

  async softDelete(id: string, tx?: TransactionContext): Promise<void> {
    const c = conn(this.db, tx);
    await c
      .update(integrationServices)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(integrationServices.id, id));
  }

  async countActiveRoutines(serviceId: string, tx?: TransactionContext): Promise<number> {
    const c = conn(this.db, tx);
    const [result] = await c
      .select({ count: dsql<number>`count(*)::int` })
      .from(integrationRoutines)
      .where(
        and(eq(integrationRoutines.serviceId, serviceId), isNull(integrationRoutines.deletedAt)),
      );
    return result?.count ?? 0;
  }

  private toDomain(row: Record<string, unknown>): IntegrationServiceProps {
    return {
      id: row.id,
      tenantId: row.tenantId,
      codigo: row.codigo,
      nome: row.nome,
      baseUrl: row.baseUrl,
      authType: row.authType,
      authConfig: row.authConfig,
      timeoutMs: row.timeoutMs,
      status: row.status,
      environment: row.environment,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// IntegrationRoutineRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleIntegrationRoutineRepository implements IntegrationRoutineRepository {
  constructor(private db: Conn) {}

  async findById(id: string, tx?: TransactionContext): Promise<IntegrationRoutineRow | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(integrationRoutines)
      .where(and(eq(integrationRoutines.id, id), isNull(integrationRoutines.deletedAt)))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async findByRoutineId(
    routineId: string,
    tx?: TransactionContext,
  ): Promise<IntegrationRoutineRow | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(integrationRoutines)
      .where(
        and(eq(integrationRoutines.routineId, routineId), isNull(integrationRoutines.deletedAt)),
      )
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async create(
    routine: IntegrationRoutineRow,
    tx?: TransactionContext,
  ): Promise<IntegrationRoutineRow> {
    const c = conn(this.db, tx);
    const [row] = await c
      .insert(integrationRoutines)
      .values(routine as InferInsertModel<typeof integrationRoutines>)
      .returning();
    return this.toDomain(row);
  }

  async update(
    routine: IntegrationRoutineRow,
    tx?: TransactionContext,
  ): Promise<IntegrationRoutineRow> {
    const c = conn(this.db, tx);
    const [row] = await c
      .update(integrationRoutines)
      .set({
        serviceId: routine.serviceId,
        httpMethod: routine.httpMethod as string,
        endpointTpl: routine.endpointTpl,
        contentType: routine.contentType,
        timeoutMs: routine.timeoutMs,
        retryMax: routine.retryMax,
        retryBackoffMs: routine.retryBackoffMs,
        triggerEvents: routine.triggerEvents,
        updatedAt: routine.updatedAt,
      })
      .where(eq(integrationRoutines.id, routine.id))
      .returning();
    return this.toDomain(row);
  }

  async softDelete(id: string, tx?: TransactionContext): Promise<void> {
    const c = conn(this.db, tx);
    await c
      .update(integrationRoutines)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(integrationRoutines.id, id));
  }

  private toDomain(row: Record<string, unknown>): IntegrationRoutineRow {
    return {
      id: row.id,
      tenantId: row.tenantId,
      routineId: row.routineId,
      serviceId: row.serviceId,
      httpMethod: row.httpMethod,
      endpointTpl: row.endpointTpl,
      contentType: row.contentType,
      timeoutMs: row.timeoutMs,
      retryMax: row.retryMax,
      retryBackoffMs: row.retryBackoffMs,
      triggerEvents: row.triggerEvents as string[] | null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// FieldMappingRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleFieldMappingRepository implements FieldMappingRepository {
  constructor(private db: Conn) {}

  async findById(id: string, tx?: TransactionContext): Promise<FieldMappingRow | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(integrationFieldMappings)
      .where(and(eq(integrationFieldMappings.id, id), isNull(integrationFieldMappings.deletedAt)))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async listByRoutine(
    routineId: string,
    tx?: TransactionContext,
  ): Promise<readonly FieldMappingRow[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(integrationFieldMappings)
      .where(
        and(
          eq(integrationFieldMappings.routineId, routineId),
          isNull(integrationFieldMappings.deletedAt),
        ),
      )
      .orderBy(integrationFieldMappings.ordem);
    return rows.map((r) => this.toDomain(r));
  }

  async create(mapping: FieldMappingRow, tx?: TransactionContext): Promise<FieldMappingRow> {
    const c = conn(this.db, tx);
    const [row] = await c
      .insert(integrationFieldMappings)
      .values(mapping as InferInsertModel<typeof integrationFieldMappings>)
      .returning();
    return this.toDomain(row);
  }

  async update(mapping: FieldMappingRow, tx?: TransactionContext): Promise<FieldMappingRow> {
    const c = conn(this.db, tx);
    const [row] = await c
      .update(integrationFieldMappings)
      .set({
        sourceField: mapping.sourceField,
        targetField: mapping.targetField,
        mappingType: mapping.mappingType as string,
        required: mapping.required,
        transformExpr: mapping.transformExpr,
        conditionExpr: mapping.conditionExpr,
        defaultValue: mapping.defaultValue,
        ordem: mapping.ordem,
        updatedAt: mapping.updatedAt,
      })
      .where(eq(integrationFieldMappings.id, mapping.id))
      .returning();
    return this.toDomain(row);
  }

  async softDelete(id: string, tx?: TransactionContext): Promise<void> {
    const c = conn(this.db, tx);
    await c
      .update(integrationFieldMappings)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(integrationFieldMappings.id, id));
  }

  async createMany(mappings: readonly FieldMappingRow[], tx?: TransactionContext): Promise<void> {
    if (mappings.length === 0) return;
    const c = conn(this.db, tx);
    await c
      .insert(integrationFieldMappings)
      .values(mappings as unknown as InferInsertModel<typeof integrationFieldMappings>[]);
  }

  private toDomain(row: Record<string, unknown>): FieldMappingRow {
    return {
      id: row.id,
      tenantId: row.tenantId,
      routineId: row.routineId,
      sourceField: row.sourceField,
      targetField: row.targetField,
      mappingType: row.mappingType,
      required: row.required,
      transformExpr: row.transformExpr,
      conditionExpr: row.conditionExpr,
      defaultValue: row.defaultValue,
      ordem: row.ordem,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// IntegrationParamRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleIntegrationParamRepository implements IntegrationParamRepository {
  constructor(private db: Conn) {}

  async findById(id: string, tx?: TransactionContext): Promise<IntegrationParamRow | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(integrationParams)
      .where(and(eq(integrationParams.id, id), isNull(integrationParams.deletedAt)))
      .limit(1);
    return row ?? null;
  }

  async listByRoutine(
    routineId: string,
    tx?: TransactionContext,
  ): Promise<readonly IntegrationParamRow[]> {
    const c = conn(this.db, tx);
    return c
      .select()
      .from(integrationParams)
      .where(and(eq(integrationParams.routineId, routineId), isNull(integrationParams.deletedAt)));
  }

  async create(param: IntegrationParamRow, tx?: TransactionContext): Promise<IntegrationParamRow> {
    const c = conn(this.db, tx);
    const [row] = await c
      .insert(integrationParams)
      .values(param as InferInsertModel<typeof integrationParams>)
      .returning();
    return row;
  }

  async update(param: IntegrationParamRow, tx?: TransactionContext): Promise<IntegrationParamRow> {
    const c = conn(this.db, tx);
    const [row] = await c
      .update(integrationParams)
      .set({
        paramKey: param.paramKey,
        paramType: param.paramType as string,
        value: param.value,
        derivationExpr: param.derivationExpr,
        isSensitive: param.isSensitive,
        updatedAt: param.updatedAt,
      })
      .where(eq(integrationParams.id, param.id))
      .returning();
    return row;
  }

  async softDelete(id: string, tx?: TransactionContext): Promise<void> {
    const c = conn(this.db, tx);
    await c
      .update(integrationParams)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(integrationParams.id, id));
  }

  async createMany(params: readonly IntegrationParamRow[], tx?: TransactionContext): Promise<void> {
    if (params.length === 0) return;
    const c = conn(this.db, tx);
    await c
      .insert(integrationParams)
      .values(params as unknown as InferInsertModel<typeof integrationParams>[]);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CallLogRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleCallLogRepository implements CallLogRepository {
  constructor(private db: Conn) {}

  async findById(id: string, tx?: TransactionContext): Promise<CallLogRow | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(integrationCallLogs)
      .where(eq(integrationCallLogs.id, id))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async list(
    filters: CallLogListFilters,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<CallLogRow>> {
    const c = conn(this.db, tx);
    const limit = params.limit + 1;
    const conditions = [eq(integrationCallLogs.tenantId, filters.tenantId)];
    if (filters.routineId) conditions.push(eq(integrationCallLogs.routineId, filters.routineId));
    if (filters.status) conditions.push(eq(integrationCallLogs.status, filters.status as 'QUEUED'));
    if (filters.correlationId)
      conditions.push(eq(integrationCallLogs.correlationId, filters.correlationId));
    if (filters.periodStart)
      conditions.push(gte(integrationCallLogs.queuedAt, filters.periodStart));
    if (filters.periodEnd) conditions.push(lte(integrationCallLogs.queuedAt, filters.periodEnd));

    const rows = await c
      .select()
      .from(integrationCallLogs)
      .where(and(...conditions))
      .orderBy(desc(integrationCallLogs.queuedAt))
      .limit(limit);
    const hasMore = rows.length > params.limit;
    const data = rows.slice(0, params.limit).map((r) => this.toDomain(r));
    return { data, nextCursor: hasMore ? data[data.length - 1].id : null, hasMore };
  }

  async listDlq(
    tenantId: string,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<CallLogRow>> {
    return this.list({ tenantId, status: 'DLQ' }, params, tx);
  }

  async create(log: CallLogRow, tx?: TransactionContext): Promise<CallLogRow> {
    const c = conn(this.db, tx);
    const [row] = await c
      .insert(integrationCallLogs)
      .values(log as InferInsertModel<typeof integrationCallLogs>)
      .returning();
    return this.toDomain(row);
  }

  async update(log: CallLogRow, tx?: TransactionContext): Promise<CallLogRow> {
    const c = conn(this.db, tx);
    const [row] = await c
      .update(integrationCallLogs)
      .set({
        status: log.status as string,
        attemptNumber: log.attemptNumber,
        requestPayload: log.requestPayload,
        requestHeaders: log.requestHeaders,
        responseStatus: log.responseStatus,
        responseBody: log.responseBody,
        responseProtocol: log.responseProtocol,
        errorMessage: log.errorMessage,
        startedAt: log.startedAt,
        completedAt: log.completedAt,
        durationMs: log.durationMs,
        reprocessReason: log.reprocessReason,
        reprocessedBy: log.reprocessedBy,
        updatedAt: log.updatedAt,
      })
      .where(eq(integrationCallLogs.id, log.id))
      .returning();
    return this.toDomain(row);
  }

  async findQueued(limit: number, tx?: TransactionContext): Promise<readonly CallLogRow[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(integrationCallLogs)
      .where(eq(integrationCallLogs.status, 'QUEUED'))
      .orderBy(integrationCallLogs.queuedAt)
      .limit(limit);
    return rows.map((r) => this.toDomain(r));
  }

  async countByStatus(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
    tx?: TransactionContext,
  ): Promise<Record<string, number>> {
    const c = conn(this.db, tx);
    const rows = await c
      .select({
        status: integrationCallLogs.status,
        count: dsql<number>`count(*)::int`,
      })
      .from(integrationCallLogs)
      .where(
        and(
          eq(integrationCallLogs.tenantId, tenantId),
          gte(integrationCallLogs.queuedAt, periodStart),
          lte(integrationCallLogs.queuedAt, periodEnd),
        ),
      )
      .groupBy(integrationCallLogs.status);
    const result: Record<string, number> = {};
    for (const row of rows) result[row.status] = row.count;
    return result;
  }

  /** @contract FR-008-M01 — Average duration_ms for completed calls in the period */
  async avgDurationMs(
    tenantId: string,
    periodStart: Date,
    periodEnd: Date,
    tx?: TransactionContext,
  ): Promise<number | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select({
        avg: dsql<string | null>`avg(${integrationCallLogs.durationMs})`,
      })
      .from(integrationCallLogs)
      .where(
        and(
          eq(integrationCallLogs.tenantId, tenantId),
          gte(integrationCallLogs.queuedAt, periodStart),
          lte(integrationCallLogs.queuedAt, periodEnd),
          dsql`${integrationCallLogs.durationMs} IS NOT NULL`,
        ),
      );
    return row?.avg !== null && row?.avg !== undefined ? Number(row.avg) : null;
  }

  private toDomain(row: Record<string, unknown>): CallLogRow {
    return {
      id: row.id,
      tenantId: row.tenantId,
      routineId: row.routineId,
      caseId: row.caseId,
      caseEventId: row.caseEventId,
      correlationId: row.correlationId,
      status: row.status,
      attemptNumber: row.attemptNumber,
      parentLogId: row.parentLogId,
      requestPayload: row.requestPayload,
      requestHeaders: row.requestHeaders,
      responseStatus: row.responseStatus,
      responseBody: row.responseBody,
      responseProtocol: row.responseProtocol,
      errorMessage: row.errorMessage,
      startedAt: row.startedAt,
      completedAt: row.completedAt,
      durationMs: row.durationMs,
      queuedAt: row.queuedAt,
      reprocessReason: row.reprocessReason,
      reprocessedBy: row.reprocessedBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ReprocessRequestRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleReprocessRequestRepository implements ReprocessRequestRepository {
  constructor(private db: Conn) {}

  async findById(id: string, tx?: TransactionContext): Promise<ReprocessRequestRow | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(integrationReprocessRequests)
      .where(eq(integrationReprocessRequests.id, id))
      .limit(1);
    return row ?? null;
  }

  async create(
    request: ReprocessRequestRow,
    tx?: TransactionContext,
  ): Promise<ReprocessRequestRow> {
    const c = conn(this.db, tx);
    const [row] = await c
      .insert(integrationReprocessRequests)
      .values(request as InferInsertModel<typeof integrationReprocessRequests>)
      .returning();
    return row;
  }

  async update(
    request: ReprocessRequestRow,
    tx?: TransactionContext,
  ): Promise<ReprocessRequestRow> {
    const c = conn(this.db, tx);
    const [row] = await c
      .update(integrationReprocessRequests)
      .set({
        newLogId: request.newLogId,
        status: request.status as string,
        updatedAt: request.updatedAt,
      })
      .where(eq(integrationReprocessRequests.id, request.id))
      .returning();
    return row;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EncryptionService — Stub (noop passthrough until AES-256 is configured)
// ─────────────────────────────────────────────────────────────────────────────

export class StubEncryptionService implements EncryptionService {
  encrypt(plaintext: string): string {
    return plaintext;
  }
  decrypt(ciphertext: string): string {
    return ciphertext;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HttpClientPort — Stub (noop until real HTTP client is wired)
// ─────────────────────────────────────────────────────────────────────────────

export class StubHttpClient implements HttpClientPort {
  async execute(_options: HttpCallOptions): Promise<HttpCallResult> {
    return {
      status: 501,
      body: { error: 'HttpClient not configured' },
      protocol: 'HTTP/1.1',
      durationMs: 0,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// QueuePort — Stub (noop until BullMQ is wired)
// ─────────────────────────────────────────────────────────────────────────────

export class StubQueuePort implements QueuePort {
  async enqueueIntegrationCall(
    _jobId: string,
    _data: { callLogId: string; correlationId: string },
    _delayMs?: number,
  ): Promise<void> {
    // noop — will be replaced by BullMQ adapter
  }
}
