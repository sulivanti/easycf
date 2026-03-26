// @contract DATA-001, DOC-ARC-004
//
// Drizzle-based repository implementations for Org-Units module (MOD-003).

import { eq, and, isNull, desc, like, sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { orgUnits, orgUnitTenantLinks } from '../../../../db/schema/org-units.js';
import { tenants } from '../../../../db/schema/foundation.js';
import type {
  OrgUnitRepository,
  OrgUnitTenantLinkRepository,
  OrgUnitTreeNode,
  TenantSummary,
  AncestorNode,
  OrgUnitListFilters,
} from '../application/ports/repositories.js';
import type {
  TransactionContext,
  PaginationParams,
  PaginatedResult,
} from '../../foundation/application/ports/repositories.js';
import type { OrgUnitProps, OrgUnitNivel } from '../domain/index.js';
import type { OrgUnitTenantLinkProps } from '../domain/entities/org-unit-tenant-link.entity.js';

type Conn = PostgresJsDatabase;
function conn(db: Conn, tx?: TransactionContext): Conn {
  return (tx ?? db) as Conn;
}

// ─────────────────────────────────────────────────────────────────────────────
// OrgUnitRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleOrgUnitRepository implements OrgUnitRepository {
  constructor(private db: Conn) {}

  async findById(id: string, tx?: TransactionContext): Promise<OrgUnitProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c.select().from(orgUnits).where(eq(orgUnits.id, id)).limit(1);
    return row ? this.toDomain(row) : null;
  }

  async findByCodigo(codigo: string, tx?: TransactionContext): Promise<OrgUnitProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(orgUnits)
      .where(and(eq(orgUnits.codigo, codigo), isNull(orgUnits.deletedAt)))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async list(
    filters: OrgUnitListFilters,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<OrgUnitProps>> {
    const c = conn(this.db, tx);
    const limit = params.limit + 1;
    const conditions = [isNull(orgUnits.deletedAt)];

    if (filters.nivel) conditions.push(eq(orgUnits.nivel, filters.nivel));
    if (filters.status) conditions.push(eq(orgUnits.status, filters.status));
    if (filters.parentId) conditions.push(eq(orgUnits.parentId, filters.parentId));
    if (filters.search) conditions.push(like(orgUnits.nome, `%${filters.search}%`));

    const rows = await c
      .select()
      .from(orgUnits)
      .where(and(...conditions))
      .orderBy(desc(orgUnits.createdAt))
      .limit(limit);

    const hasMore = rows.length > params.limit;
    const data = rows.slice(0, params.limit);

    return {
      data: data.map((r) => this.toDomain(r)),
      nextCursor: hasMore && data.length > 0 ? data[data.length - 1]!.id : null,
      hasMore,
    };
  }

  async countActive(tx?: TransactionContext): Promise<number> {
    const c = conn(this.db, tx);
    const [result] = await c
      .select({ count: sql<number>`count(*)::int` })
      .from(orgUnits)
      .where(and(eq(orgUnits.status, 'ACTIVE'), isNull(orgUnits.deletedAt)));
    return result?.count ?? 0;
  }

  async getTree(tx?: TransactionContext): Promise<readonly OrgUnitTreeNode[]> {
    const c = conn(this.db, tx);

    // Fetch all active org units
    const allUnits = await c
      .select()
      .from(orgUnits)
      .where(and(eq(orgUnits.status, 'ACTIVE'), isNull(orgUnits.deletedAt)))
      .orderBy(orgUnits.nivel, orgUnits.nome);

    // Fetch all active tenant links
    const allLinks = await c
      .select({
        orgUnitId: orgUnitTenantLinks.orgUnitId,
        tenantId: orgUnitTenantLinks.tenantId,
        tenantCodigo: tenants.codigo,
        tenantName: tenants.name,
      })
      .from(orgUnitTenantLinks)
      .innerJoin(tenants, eq(tenants.id, orgUnitTenantLinks.tenantId))
      .where(isNull(orgUnitTenantLinks.deletedAt));

    // Build tenant links map
    const linksMap = new Map<string, TenantSummary[]>();
    for (const link of allLinks) {
      const list = linksMap.get(link.orgUnitId) ?? [];
      list.push({ tenantId: link.tenantId, codigo: link.tenantCodigo, name: link.tenantName });
      linksMap.set(link.orgUnitId, list);
    }

    // Build tree in memory
    const nodeMap = new Map<string, OrgUnitTreeNode & { children: OrgUnitTreeNode[] }>();
    const roots: (OrgUnitTreeNode & { children: OrgUnitTreeNode[] })[] = [];

    for (const u of allUnits) {
      const node = {
        id: u.id,
        codigo: u.codigo,
        nome: u.nome,
        descricao: u.descricao,
        nivel: u.nivel as OrgUnitNivel,
        status: u.status as 'ACTIVE' | 'INACTIVE',
        children: [] as OrgUnitTreeNode[],
        tenants: linksMap.get(u.id) ?? [],
      };
      nodeMap.set(u.id, node);

      if (!u.parentId) {
        roots.push(node);
      } else {
        const parent = nodeMap.get(u.parentId);
        if (parent) parent.children.push(node);
      }
    }

    return roots;
  }

  async getAncestors(id: string, tx?: TransactionContext): Promise<readonly AncestorNode[]> {
    const c = conn(this.db, tx);
    const result = await c.execute<{
      id: string;
      codigo: string;
      nome: string;
      nivel: number;
      parent_id: string | null;
    }>(
      sql`WITH RECURSIVE ancestors AS (
        SELECT id, codigo, nome, nivel, parent_id FROM org_units WHERE id = ${id}
        UNION ALL
        SELECT o.id, o.codigo, o.nome, o.nivel, o.parent_id
        FROM org_units o INNER JOIN ancestors a ON o.id = a.parent_id
      ) SELECT id, codigo, nome, nivel FROM ancestors WHERE id != ${id} ORDER BY nivel ASC`,
    );
    return (result as unknown as { id: string; codigo: string; nome: string; nivel: number }[]).map(
      (r) => ({
        id: r.id,
        codigo: r.codigo,
        nome: r.nome,
        nivel: r.nivel as OrgUnitNivel,
      }),
    );
  }

  async findActiveChildrenIds(id: string, tx?: TransactionContext): Promise<readonly string[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select({ id: orgUnits.id })
      .from(orgUnits)
      .where(
        and(eq(orgUnits.parentId, id), eq(orgUnits.status, 'ACTIVE'), isNull(orgUnits.deletedAt)),
      );
    return rows.map((r) => r.id);
  }

  async isDescendantOf(
    nodeId: string,
    potentialAncestorId: string,
    tx?: TransactionContext,
  ): Promise<boolean> {
    const c = conn(this.db, tx);
    const result = await c.execute<{ found: boolean }>(
      sql`WITH RECURSIVE chain AS (
        SELECT parent_id FROM org_units WHERE id = ${nodeId}
        UNION ALL
        SELECT o.parent_id FROM org_units o INNER JOIN chain c ON o.id = c.parent_id
      ) SELECT EXISTS(SELECT 1 FROM chain WHERE parent_id = ${potentialAncestorId}) as found`,
    );
    return (result as unknown as { found: boolean }[])[0]?.found ?? false;
  }

  async create(orgUnit: OrgUnitProps, tx?: TransactionContext): Promise<OrgUnitProps> {
    const c = conn(this.db, tx);
    const [created] = await c
      .insert(orgUnits)
      .values({
        id: orgUnit.id || undefined,
        codigo: orgUnit.codigo,
        nome: orgUnit.nome,
        descricao: orgUnit.descricao,
        nivel: orgUnit.nivel,
        parentId: orgUnit.parentId,
        status: orgUnit.status,
        createdBy: orgUnit.createdBy!,
      })
      .returning();
    return this.toDomain(created!);
  }

  async update(orgUnit: OrgUnitProps, tx?: TransactionContext): Promise<OrgUnitProps> {
    const c = conn(this.db, tx);
    const [updated] = await c
      .update(orgUnits)
      .set({
        nome: orgUnit.nome,
        descricao: orgUnit.descricao,
        status: orgUnit.status,
        updatedAt: new Date(),
        deletedAt: orgUnit.deletedAt,
      })
      .where(eq(orgUnits.id, orgUnit.id))
      .returning();
    return this.toDomain(updated!);
  }

  private toDomain(row: typeof orgUnits.$inferSelect): OrgUnitProps {
    return {
      id: row.id,
      codigo: row.codigo,
      nome: row.nome,
      descricao: row.descricao,
      nivel: row.nivel as OrgUnitNivel,
      parentId: row.parentId,
      status: row.status as 'ACTIVE' | 'INACTIVE',
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      deletedAt: row.deletedAt,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// OrgUnitTenantLinkRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleOrgUnitTenantLinkRepository implements OrgUnitTenantLinkRepository {
  constructor(private db: Conn) {}

  async findById(id: string, tx?: TransactionContext): Promise<OrgUnitTenantLinkProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(orgUnitTenantLinks)
      .where(and(eq(orgUnitTenantLinks.id, id), isNull(orgUnitTenantLinks.deletedAt)))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async findByPair(
    orgUnitId: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<OrgUnitTenantLinkProps | null> {
    const c = conn(this.db, tx);
    const [row] = await c
      .select()
      .from(orgUnitTenantLinks)
      .where(
        and(
          eq(orgUnitTenantLinks.orgUnitId, orgUnitId),
          eq(orgUnitTenantLinks.tenantId, tenantId),
          isNull(orgUnitTenantLinks.deletedAt),
        ),
      )
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async listByOrgUnit(
    orgUnitId: string,
    tx?: TransactionContext,
  ): Promise<readonly OrgUnitTenantLinkProps[]> {
    const c = conn(this.db, tx);
    const rows = await c
      .select()
      .from(orgUnitTenantLinks)
      .where(
        and(eq(orgUnitTenantLinks.orgUnitId, orgUnitId), isNull(orgUnitTenantLinks.deletedAt)),
      );
    return rows.map((r) => this.toDomain(r));
  }

  async create(
    link: OrgUnitTenantLinkProps,
    tx?: TransactionContext,
  ): Promise<OrgUnitTenantLinkProps> {
    const c = conn(this.db, tx);
    const [created] = await c
      .insert(orgUnitTenantLinks)
      .values({
        id: link.id || undefined,
        orgUnitId: link.orgUnitId,
        tenantId: link.tenantId,
        createdBy: link.createdBy!,
      })
      .returning();
    return this.toDomain(created!);
  }

  async softDelete(id: string, tx?: TransactionContext): Promise<void> {
    const c = conn(this.db, tx);
    await c
      .update(orgUnitTenantLinks)
      .set({ deletedAt: new Date() })
      .where(eq(orgUnitTenantLinks.id, id));
  }

  private toDomain(row: typeof orgUnitTenantLinks.$inferSelect): OrgUnitTenantLinkProps {
    return {
      id: row.id,
      orgUnitId: row.orgUnitId,
      tenantId: row.tenantId,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      deletedAt: row.deletedAt,
    };
  }
}
