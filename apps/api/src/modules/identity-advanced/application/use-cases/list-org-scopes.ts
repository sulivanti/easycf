/**
 * @contract FR-001.1
 *
 * Use Case: List Organizational Scopes for a user.
 * Used by both admin endpoint (GET /admin/users/:id/org-scopes)
 * and self-service endpoint (GET /my/org-scopes).
 * Returns scopes with org unit breadcrumb.
 */

import type { OrgScopeRepository, OrgScopeWithBreadcrumb } from '../ports/repositories.js';

export interface ListOrgScopesInput {
  readonly tenantId: string;
  readonly userId: string;
}

export interface OrgScopeListItem {
  readonly id: string;
  readonly scopeType: string;
  readonly orgUnit: {
    readonly id: string;
    readonly codigo: string;
    readonly nome: string;
    readonly nivel: number;
  };
  readonly validFrom: string;
  readonly validUntil: string | null;
  readonly status: string;
}

export class ListOrgScopesUseCase {
  constructor(private readonly orgScopeRepo: OrgScopeRepository) {}

  async execute(input: ListOrgScopesInput): Promise<readonly OrgScopeListItem[]> {
    const scopes = await this.orgScopeRepo.listByUser(input.tenantId, input.userId);

    return scopes.map(toListItem);
  }
}

function toListItem(scope: OrgScopeWithBreadcrumb): OrgScopeListItem {
  return {
    id: scope.id,
    scopeType: scope.scopeType,
    orgUnit: {
      id: scope.orgUnit.id,
      codigo: scope.orgUnit.codigo,
      nome: scope.orgUnit.nome,
      nivel: scope.orgUnit.nivel,
    },
    validFrom: scope.validFrom.toISOString(),
    validUntil: scope.validUntil?.toISOString() ?? null,
    status: scope.status,
  };
}
