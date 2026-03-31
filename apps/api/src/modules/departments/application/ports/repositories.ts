/**
 * @contract DATA-002, FR-002
 *
 * Repository port interface for the Departments entity (MOD-003 F05).
 * Reuses Foundation's UnitOfWork, TransactionContext, PaginationParams, PaginatedResult.
 */

import type {
  TransactionContext,
  PaginationParams,
  PaginatedResult,
} from '../../../foundation/application/ports/repositories.js';
import type { DepartmentProps } from '../../domain/index.js';

// ---------------------------------------------------------------------------
// Filter types (FR-007)
// ---------------------------------------------------------------------------

export interface DepartmentListFilters {
  readonly tenantId: string;
  readonly status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
  readonly search?: string;
}

// ---------------------------------------------------------------------------
// DepartmentRepository
// ---------------------------------------------------------------------------
export interface DepartmentRepository {
  findById(id: string, tenantId: string, tx?: TransactionContext): Promise<DepartmentProps | null>;

  findByCodigo(
    tenantId: string,
    codigo: string,
    tx?: TransactionContext,
  ): Promise<DepartmentProps | null>;

  /** @contract FR-007 — Flat listing with cursor pagination and filters */
  list(
    filters: DepartmentListFilters,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<DepartmentProps>>;

  /** @contract BR-018 — Count active departments for tenant (soft limit warning) */
  countActiveByTenant(tenantId: string, tx?: TransactionContext): Promise<number>;

  create(department: DepartmentProps, tx?: TransactionContext): Promise<DepartmentProps>;
  update(department: DepartmentProps, tx?: TransactionContext): Promise<DepartmentProps>;
}
