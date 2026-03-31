/**
 * @contract FR-007
 *
 * Use Case: List Departments (flat, with cursor pagination and filters)
 * Filters: status, search (nome/codigo). Always scoped to tenant.
 */

import type { DepartmentRepository, DepartmentListFilters } from '../ports/repositories.js';
import type { PaginationParams } from '../../../foundation/application/ports/repositories.js';

export interface ListDepartmentsInput {
  readonly tenantId: string;
  readonly status?: 'ACTIVE' | 'INACTIVE' | 'ALL';
  readonly search?: string;
  readonly cursor?: string;
  readonly limit?: number;
}

export interface DepartmentListItem {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly status: string;
  readonly cor: string | null;
  readonly createdAt: string;
}

export interface ListDepartmentsOutput {
  readonly data: readonly DepartmentListItem[];
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export class ListDepartmentsUseCase {
  constructor(private readonly deptRepo: DepartmentRepository) {}

  async execute(input: ListDepartmentsInput): Promise<ListDepartmentsOutput> {
    const limit = Math.min(input.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

    const filters: DepartmentListFilters = {
      tenantId: input.tenantId,
      status: input.status,
      search: input.search,
    };

    const params: PaginationParams = {
      cursor: input.cursor,
      limit,
    };

    const result = await this.deptRepo.list(filters, params);

    return {
      data: result.data.map((item) => ({
        id: item.id,
        codigo: item.codigo,
        nome: item.nome,
        status: item.status,
        cor: item.cor,
        createdAt: item.createdAt.toISOString(),
      })),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }
}
