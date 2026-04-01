/**
 * @contract FR-001-M01 D4, FR-001.1b
 *
 * Use Case: List Organizational Scopes grouped by user.
 * Used by admin endpoint (GET /admin/org-scopes).
 * Returns users with their primary and secondary scopes,
 * with user name+email resolved via UserLookupPort.
 */

import type {
  OrgScopeRepository,
  OrgScopesGroupedFilters,
  UserOrgScopesGrouped,
} from '../ports/repositories.js';
import type { PaginationParams } from '../../../foundation/application/ports/repositories.js';
import type { UserLookupPort, UserSummary } from '../ports/services.js';

// ---------------------------------------------------------------------------
// Input / Output
// ---------------------------------------------------------------------------

export interface ListOrgScopesGroupedInput {
  readonly tenantId: string;
  readonly q?: string;
  readonly scopeType?: 'PRIMARY' | 'SECONDARY';
  readonly status?: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  readonly cursor?: string;
  readonly limit?: number;
}

export interface OrgScopeGroupedItem {
  readonly user: { readonly id: string; readonly name: string; readonly email: string };
  readonly primaryScope: ScopeDetail | null;
  readonly secondaryScopes: readonly ScopeDetail[];
  readonly totalScopes: number;
}

export interface ScopeDetail {
  readonly id: string;
  readonly orgUnit: {
    readonly id: string;
    readonly codigo: string;
    readonly nome: string;
    readonly nivel: number;
    readonly breadcrumb: string;
  };
  readonly status: string;
  readonly validUntil: string | null;
}

export interface ListOrgScopesGroupedOutput {
  readonly data: readonly OrgScopeGroupedItem[];
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
}

// ---------------------------------------------------------------------------
// Use Case
// ---------------------------------------------------------------------------

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export class ListOrgScopesGroupedUseCase {
  constructor(
    private readonly orgScopeRepo: OrgScopeRepository,
    private readonly userLookup: UserLookupPort,
  ) {}

  async execute(input: ListOrgScopesGroupedInput): Promise<ListOrgScopesGroupedOutput> {
    const limit = Math.min(input.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

    const filters: OrgScopesGroupedFilters = {
      q: input.q,
      scopeType: input.scopeType,
      status: input.status,
    };

    const params: PaginationParams = {
      cursor: input.cursor,
      limit,
    };

    const result = await this.orgScopeRepo.listGrouped(input.tenantId, filters, params);

    // Batch resolve user names
    const userIds = result.data.map((row) => row.userId);
    const userMap = await this.userLookup.getUserSummaries(userIds);

    const data = result.data.map((row) => toGroupedItem(row, userMap));

    return {
      data,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }
}

// ---------------------------------------------------------------------------
// Mappers
// ---------------------------------------------------------------------------

function toGroupedItem(
  row: UserOrgScopesGrouped,
  userMap: ReadonlyMap<string, UserSummary>,
): OrgScopeGroupedItem {
  const user = userMap.get(row.userId);

  return {
    user: {
      id: row.userId,
      name: user?.name ?? row.userId,
      email: user?.email ?? '',
    },
    primaryScope: row.primaryScope ? toScopeDetail(row.primaryScope) : null,
    secondaryScopes: row.secondaryScopes.map(toScopeDetail),
    totalScopes: row.totalScopes,
  };
}

function toScopeDetail(entry: UserOrgScopesGrouped['secondaryScopes'][number]): ScopeDetail {
  return {
    id: entry.id,
    orgUnit: {
      id: entry.orgUnit.id,
      codigo: entry.orgUnit.codigo,
      nome: entry.orgUnit.nome,
      nivel: entry.orgUnit.nivel,
      breadcrumb: entry.orgUnit.breadcrumb,
    },
    status: entry.status,
    validUntil: entry.validUntil?.toISOString() ?? null,
  };
}
