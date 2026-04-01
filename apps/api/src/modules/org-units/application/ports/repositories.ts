/**
 * @contract DATA-001, FR-001, FR-002, FR-005
 *
 * Repository port interfaces for the Organizational Structure module (MOD-003).
 * Reuses Foundation's UnitOfWork, TransactionContext, PaginationParams, PaginatedResult.
 */

import type {
  TransactionContext,
  PaginationParams,
  PaginatedResult,
} from '../../../foundation/application/ports/repositories.js';
import type { OrgUnitProps, OrgUnitNivel } from '../../domain/index.js';
import type { OrgUnitTenantLinkProps } from '../../domain/entities/org-unit-tenant-link.entity.js';

// ---------------------------------------------------------------------------
// Tree types (FR-002)
// ---------------------------------------------------------------------------

export interface OrgUnitTreeNode {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao: string | null;
  readonly nivel: OrgUnitNivel;
  readonly status: 'ACTIVE' | 'INACTIVE';
  readonly children: readonly OrgUnitTreeNode[];
  /** Only present on N4 nodes — linked tenants (N5) */
  readonly tenants: readonly TenantSummary[];
}

export interface TenantSummary {
  readonly tenantId: string;
  readonly codigo: string;
  readonly name: string;
}

/** Ancestor node for breadcrumb (FR-001 detail) */
export interface AncestorNode {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly nivel: OrgUnitNivel;
}

// ---------------------------------------------------------------------------
// Filter types (FR-005)
// ---------------------------------------------------------------------------

export interface OrgUnitListFilters {
  readonly nivel?: OrgUnitNivel;
  readonly status?: 'ACTIVE' | 'INACTIVE';
  readonly parentId?: string;
  readonly search?: string;
}

// ---------------------------------------------------------------------------
// OrgUnitRepository
// ---------------------------------------------------------------------------
export interface OrgUnitRepository {
  findById(id: string, tx?: TransactionContext): Promise<OrgUnitProps | null>;
  findByCodigo(codigo: string, tx?: TransactionContext): Promise<OrgUnitProps | null>;

  /** @contract FR-005 — Flat listing with cursor pagination and filters */
  list(
    filters: OrgUnitListFilters,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<OrgUnitProps>>;

  /** @contract FR-001 — Count active nodes (for soft limit warning) */
  countActive(tx?: TransactionContext): Promise<number>;

  /** @contract FR-002, FR-001-C05 — Full tree query via CTE recursivo */
  getTree(includeInactive?: boolean, tx?: TransactionContext): Promise<readonly OrgUnitTreeNode[]>;

  /** @contract FR-001 — Ancestors for breadcrumb (ordered root → parent) */
  getAncestors(id: string, tx?: TransactionContext): Promise<readonly AncestorNode[]>;

  /** @contract BR-005 — Active children IDs (for soft delete guard) */
  findActiveChildrenIds(id: string, tx?: TransactionContext): Promise<readonly string[]>;

  /** @contract BR-004 — Loop detection via CTE */
  isDescendantOf(
    nodeId: string,
    potentialAncestorId: string,
    tx?: TransactionContext,
  ): Promise<boolean>;

  create(orgUnit: OrgUnitProps, tx?: TransactionContext): Promise<OrgUnitProps>;
  update(orgUnit: OrgUnitProps, tx?: TransactionContext): Promise<OrgUnitProps>;
}

// ---------------------------------------------------------------------------
// OrgUnitTenantLinkRepository
// ---------------------------------------------------------------------------
export interface OrgUnitTenantLinkRepository {
  findById(id: string, tx?: TransactionContext): Promise<OrgUnitTenantLinkProps | null>;

  /** Find active link by (orgUnitId, tenantId) pair */
  findByPair(
    orgUnitId: string,
    tenantId: string,
    tx?: TransactionContext,
  ): Promise<OrgUnitTenantLinkProps | null>;

  /** List active links for an org unit */
  listByOrgUnit(
    orgUnitId: string,
    tx?: TransactionContext,
  ): Promise<readonly OrgUnitTenantLinkProps[]>;

  create(link: OrgUnitTenantLinkProps, tx?: TransactionContext): Promise<OrgUnitTenantLinkProps>;

  /** Soft unlink — sets deleted_at */
  softDelete(id: string, tx?: TransactionContext): Promise<void>;
}
