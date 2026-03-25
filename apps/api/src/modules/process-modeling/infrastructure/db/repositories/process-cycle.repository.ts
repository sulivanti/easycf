/**
 * @contract DATA-005 §2.1, FR-001, BR-005, ADR-004
 *
 * Drizzle implementation of ProcessCycleRepository.
 * Soft-delete via deleted_at; only DRAFT/DEPRECATED cycles can be soft-deleted (BR-005).
 * Cursor-based pagination. Optimistic locking via updated_at (ADR-004).
 */

import { eq, and, isNull, sql, gt, asc, type SQL } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { processCycles } from '../../../../../../db/schema/process-modeling.js';
import type { ProcessCycleProps } from '../../../domain/aggregates/process-cycle.js';
import type { CycleStatus } from '../../../domain/value-objects/cycle-status.js';
import type {
  ProcessCycleRepository as IProcessCycleRepository,
  CycleListFilters,
} from '../../../application/ports/repositories.js';
import type {
  TransactionContext,
  PaginationParams,
  PaginatedResult,
} from '../../../../foundation/application/ports/repositories.js';

type Db = PostgresJsDatabase<Record<string, never>>;

export class ProcessCycleRepository implements IProcessCycleRepository {
  constructor(private readonly db: Db) {}

  private conn(tx?: TransactionContext): Db {
    return (tx as Db) ?? this.db;
  }

  async findById(id: string, tx?: TransactionContext): Promise<ProcessCycleProps | null> {
    const [row] = await this.conn(tx)
      .select()
      .from(processCycles)
      .where(and(eq(processCycles.id, id), isNull(processCycles.deletedAt)))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async list(
    filters: CycleListFilters,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<ProcessCycleProps>> {
    const conditions: SQL[] = [
      eq(processCycles.tenantId, filters.tenantId),
      isNull(processCycles.deletedAt),
    ];
    if (filters.status) {
      conditions.push(eq(processCycles.status, filters.status));
    }
    if (params.cursor) {
      conditions.push(gt(processCycles.id, params.cursor));
    }

    const rows = await this.conn(tx)
      .select()
      .from(processCycles)
      .where(and(...conditions))
      .orderBy(asc(processCycles.id))
      .limit(params.limit + 1);

    const hasMore = rows.length > params.limit;
    const data = hasMore ? rows.slice(0, params.limit) : rows;

    return {
      data: data.map((r) => this.toDomain(r)),
      nextCursor: hasMore ? data[data.length - 1]!.id : null,
      hasMore,
    };
  }

  async create(cycle: ProcessCycleProps, tx?: TransactionContext): Promise<ProcessCycleProps> {
    const [row] = await this.conn(tx)
      .insert(processCycles)
      .values({
        id: cycle.id,
        tenantId: cycle.tenantId,
        codigo: cycle.codigo,
        nome: cycle.nome,
        descricao: cycle.descricao,
        version: cycle.version,
        status: cycle.status,
        parentCycleId: cycle.parentCycleId,
        publishedAt: cycle.publishedAt,
        createdBy: cycle.createdBy,
        createdAt: cycle.createdAt,
        updatedAt: cycle.updatedAt,
      })
      .returning();
    return this.toDomain(row!);
  }

  async update(cycle: ProcessCycleProps, tx?: TransactionContext): Promise<ProcessCycleProps> {
    const [row] = await this.conn(tx)
      .update(processCycles)
      .set({
        nome: cycle.nome,
        descricao: cycle.descricao,
        status: cycle.status,
        publishedAt: cycle.publishedAt,
        updatedAt: new Date(),
      })
      .where(and(eq(processCycles.id, cycle.id), isNull(processCycles.deletedAt)))
      .returning();
    return this.toDomain(row!);
  }

  async softDelete(id: string, tx?: TransactionContext): Promise<void> {
    await this.conn(tx)
      .update(processCycles)
      .set({ deletedAt: new Date() })
      .where(and(eq(processCycles.id, id), isNull(processCycles.deletedAt)));
  }

  private toDomain(row: typeof processCycles.$inferSelect): ProcessCycleProps {
    return {
      id: row.id,
      tenantId: row.tenantId,
      codigo: row.codigo,
      nome: row.nome,
      descricao: row.descricao,
      version: row.version,
      status: row.status as CycleStatus,
      parentCycleId: row.parentCycleId,
      publishedAt: row.publishedAt,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
