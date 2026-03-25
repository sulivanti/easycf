/**
 * @contract DATA-005 §2.5, BR-005
 *
 * Drizzle implementation of ProcessRoleRepository.
 * Global catalog per tenant. Soft-delete via deleted_at.
 * BR-005: cannot delete role with active stage_role_links.
 */

import { eq, and, isNull, gt, asc, type SQL } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { processRoles, stageRoleLinks } from '../../../../../../db/schema/process-modeling.js';
import type {
  ProcessRoleRepository as IProcessRoleRepository,
  ProcessRoleProps,
  ProcessRoleListFilters,
} from '../../../application/ports/repositories.js';
import type {
  TransactionContext,
  PaginationParams,
  PaginatedResult,
} from '../../../../foundation/application/ports/repositories.js';

type Db = PostgresJsDatabase<Record<string, never>>;

export class ProcessRoleRepository implements IProcessRoleRepository {
  constructor(private readonly db: Db) {}

  private conn(tx?: TransactionContext): Db {
    return (tx as Db) ?? this.db;
  }

  async findById(id: string, tx?: TransactionContext): Promise<ProcessRoleProps | null> {
    const [row] = await this.conn(tx)
      .select()
      .from(processRoles)
      .where(and(eq(processRoles.id, id), isNull(processRoles.deletedAt)))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async findByCodigo(
    tenantId: string,
    codigo: string,
    tx?: TransactionContext,
  ): Promise<ProcessRoleProps | null> {
    const [row] = await this.conn(tx)
      .select()
      .from(processRoles)
      .where(
        and(
          eq(processRoles.tenantId, tenantId),
          eq(processRoles.codigo, codigo),
          isNull(processRoles.deletedAt),
        ),
      )
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async list(
    filters: ProcessRoleListFilters,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<ProcessRoleProps>> {
    const conditions: SQL[] = [
      eq(processRoles.tenantId, filters.tenantId),
      isNull(processRoles.deletedAt),
    ];
    if (params.cursor) {
      conditions.push(gt(processRoles.id, params.cursor));
    }

    const rows = await this.conn(tx)
      .select()
      .from(processRoles)
      .where(and(...conditions))
      .orderBy(asc(processRoles.id))
      .limit(params.limit + 1);

    const hasMore = rows.length > params.limit;
    const data = hasMore ? rows.slice(0, params.limit) : rows;

    return {
      data: data.map((r) => this.toDomain(r)),
      nextCursor: hasMore ? data[data.length - 1]!.id : null,
      hasMore,
    };
  }

  async hasActiveLinks(roleId: string, tx?: TransactionContext): Promise<boolean> {
    const [row] = await this.conn(tx)
      .select({ id: stageRoleLinks.id })
      .from(stageRoleLinks)
      .where(eq(stageRoleLinks.roleId, roleId))
      .limit(1);
    return !!row;
  }

  async create(role: ProcessRoleProps, tx?: TransactionContext): Promise<ProcessRoleProps> {
    const [row] = await this.conn(tx)
      .insert(processRoles)
      .values({
        id: role.id,
        tenantId: role.tenantId,
        codigo: role.codigo,
        nome: role.nome,
        descricao: role.descricao,
        canApprove: role.canApprove,
        createdBy: role.createdBy,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      })
      .returning();
    return this.toDomain(row!);
  }

  async update(role: ProcessRoleProps, tx?: TransactionContext): Promise<ProcessRoleProps> {
    const [row] = await this.conn(tx)
      .update(processRoles)
      .set({
        nome: role.nome,
        descricao: role.descricao,
        canApprove: role.canApprove,
        updatedAt: new Date(),
      })
      .where(and(eq(processRoles.id, role.id), isNull(processRoles.deletedAt)))
      .returning();
    return this.toDomain(row!);
  }

  async softDelete(id: string, tx?: TransactionContext): Promise<void> {
    await this.conn(tx)
      .update(processRoles)
      .set({ deletedAt: new Date() })
      .where(and(eq(processRoles.id, id), isNull(processRoles.deletedAt)));
  }

  private toDomain(row: typeof processRoles.$inferSelect): ProcessRoleProps {
    return {
      id: row.id,
      tenantId: row.tenantId,
      codigo: row.codigo,
      nome: row.nome,
      descricao: row.descricao,
      canApprove: row.canApprove,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
