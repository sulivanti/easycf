// @contract DATA-002, DOC-ARC-004
//
// Drizzle-based repository implementation for Departments module (MOD-003 F05).

import { eq, and, isNull, desc, or, ilike, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { departments } from '../../../../db/schema/departments.js';
import type {
  DepartmentRepository,
  DepartmentListFilters,
} from '../application/ports/repositories.js';
import type {
  TransactionContext,
  PaginationParams,
  PaginatedResult,
} from '../../foundation/application/ports/repositories.js';
import type { DepartmentProps, DepartmentStatus } from '../domain/index.js';

type Conn = PostgresJsDatabase;
function conn(db: Conn, tx?: TransactionContext): Conn {
  return (tx ?? db) as Conn;
}

// ─────────────────────────────────────────────────────────────────────────────
// DepartmentRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleDepartmentRepository implements DepartmentRepository {
  constructor(private db: Conn) {}

  async findById(
    id: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<DepartmentProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(departments)
      .where(
        and(
          eq(departments.id, id),
          eq(departments.tenantId, tenantId),
          isNull(departments.deletedAt),
        ),
      )
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async findByCodigo(
    tenantId: string,
    codigo: string,
    tx?: TransactionContext,
  ): Promise<DepartmentProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(departments)
      .where(
        and(
          eq(departments.tenantId, tenantId),
          eq(departments.codigo, codigo),
          isNull(departments.deletedAt),
        ),
      )
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async list(
    filters: DepartmentListFilters,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<DepartmentProps>> {
    const c = conn(this.db, tx);
    const limit = params.limit + 1;
    const conditions = [eq(departments.tenantId, filters.tenantId), isNull(departments.deletedAt)];

    if (filters.status && filters.status !== 'ALL') {
      conditions.push(eq(departments.status, filters.status));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(departments.nome, `%${filters.search}%`),
          ilike(departments.codigo, `%${filters.search}%`),
        )!,
      );
    }

    const rows = await c
      .select()
      .from(departments)
      .where(and(...conditions))
      .orderBy(desc(departments.createdAt))
      .limit(limit);

    const hasMore = rows.length > params.limit;
    const data = rows.slice(0, params.limit);

    return {
      data: data.map((r) => this.toDomain(r)),
      nextCursor: hasMore && data.length > 0 ? data[data.length - 1]!.id : null,
      hasMore,
    };
  }

  async countActiveByTenant(tenantId: string, tx?: TransactionContext): Promise<number> {
    const c = conn(this.db, tx);
    const [result] = await c
      .select({ count: sql<number>`count(*)::int` })
      .from(departments)
      .where(
        and(
          eq(departments.tenantId, tenantId),
          eq(departments.status, 'ACTIVE'),
          isNull(departments.deletedAt),
        ),
      );
    return result?.count ?? 0;
  }

  async create(department: DepartmentProps, tx?: TransactionContext): Promise<DepartmentProps> {
    const c = conn(this.db, tx);
    const [created] = await c
      .insert(departments)
      .values({
        id: department.id || undefined,
        tenantId: department.tenantId,
        codigo: department.codigo,
        nome: department.nome,
        descricao: department.descricao,
        status: department.status,
        cor: department.cor,
        createdBy: department.createdBy!,
      })
      .returning();
    return this.toDomain(created!);
  }

  async update(department: DepartmentProps, tx?: TransactionContext): Promise<DepartmentProps> {
    const c = conn(this.db, tx);
    const [updated] = await c
      .update(departments)
      .set({
        nome: department.nome,
        descricao: department.descricao,
        status: department.status,
        cor: department.cor,
        updatedAt: new Date(),
        deletedAt: department.deletedAt,
      })
      .where(eq(departments.id, department.id))
      .returning();
    return this.toDomain(updated!);
  }

  private toDomain(row: typeof departments.$inferSelect): DepartmentProps {
    return {
      id: row.id,
      tenantId: row.tenantId,
      codigo: row.codigo,
      nome: row.nome,
      descricao: row.descricao,
      status: row.status as DepartmentStatus,
      cor: row.cor,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }
}
