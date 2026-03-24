/**
 * @contract FR-005
 *
 * Use Case: List Organizational Units (flat, with cursor pagination and filters)
 * Filters: nivel, status, parent_id, search (nome/codigo).
 */

import type { OrgUnitNivel } from '../../domain/entities/org-unit.entity.js';
import type { OrgUnitRepository, OrgUnitListFilters } from '../ports/repositories.js';
import type { PaginationParams } from '../../../foundation/application/ports/repositories.js';

export interface ListOrgUnitsInput {
  readonly nivel?: OrgUnitNivel;
  readonly status?: 'ACTIVE' | 'INACTIVE';
  readonly parentId?: string;
  readonly search?: string;
  readonly cursor?: string;
  readonly limit?: number;
}

export interface OrgUnitListItem {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly nivel: OrgUnitNivel;
  readonly status: string;
  readonly parentId: string | null;
  readonly createdAt: string;
}

export interface ListOrgUnitsOutput {
  readonly data: readonly OrgUnitListItem[];
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export class ListOrgUnitsUseCase {
  constructor(private readonly orgUnitRepo: OrgUnitRepository) {}

  async execute(input: ListOrgUnitsInput): Promise<ListOrgUnitsOutput> {
    const limit = Math.min(input.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

    const filters: OrgUnitListFilters = {
      nivel: input.nivel,
      status: input.status,
      parentId: input.parentId,
      search: input.search,
    };

    const params: PaginationParams = {
      cursor: input.cursor,
      limit,
    };

    const result = await this.orgUnitRepo.list(filters, params);

    return {
      data: result.data.map((item) => ({
        id: item.id,
        codigo: item.codigo,
        nome: item.nome,
        nivel: item.nivel,
        status: item.status,
        parentId: item.parentId,
        createdAt: item.createdAt.toISOString(),
      })),
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }
}
