/**
 * @contract FR-001
 *
 * Use Case: Get Organizational Unit Detail
 * Returns node + ancestors (breadcrumb) + linked tenants.
 */

import type { OrgUnitNivel } from '../../domain/entities/org-unit.entity.js';
import { EntityNotFoundError } from '../../../foundation/domain/errors/domain-errors.js';
import type {
  OrgUnitRepository,
  OrgUnitTenantLinkRepository,
  AncestorNode,
} from '../ports/repositories.js';
import type { TenantRepository } from '../../../foundation/application/ports/repositories.js';

export interface GetOrgUnitInput {
  readonly id: string;
}

export interface GetOrgUnitOutput {
  readonly id: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao: string | null;
  readonly nivel: OrgUnitNivel;
  readonly parentId: string | null;
  readonly status: string;
  readonly createdBy: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly deletedAt: string | null;
  readonly ancestors: readonly AncestorNode[];
  readonly tenants: readonly { tenantId: string; codigo: string; name: string }[];
}

export class GetOrgUnitUseCase {
  constructor(
    private readonly orgUnitRepo: OrgUnitRepository,
    private readonly linkRepo: OrgUnitTenantLinkRepository,
    private readonly tenantRepo: TenantRepository,
  ) {}

  async execute(input: GetOrgUnitInput): Promise<GetOrgUnitOutput> {
    const orgUnit = await this.orgUnitRepo.findById(input.id);
    if (!orgUnit) {
      throw new EntityNotFoundError('OrgUnit', input.id);
    }

    // Fetch ancestors for breadcrumb
    const ancestors = await this.orgUnitRepo.getAncestors(input.id);

    // Fetch linked tenants (N4→N5)
    const links = await this.linkRepo.listByOrgUnit(input.id);
    const tenants: { tenantId: string; codigo: string; name: string }[] = [];

    for (const link of links) {
      const tenant = await this.tenantRepo.findById(link.tenantId);
      if (tenant) {
        tenants.push({
          tenantId: tenant.id,
          codigo: tenant.codigo,
          name: tenant.name,
        });
      }
    }

    return {
      id: orgUnit.id,
      codigo: orgUnit.codigo,
      nome: orgUnit.nome,
      descricao: orgUnit.descricao,
      nivel: orgUnit.nivel,
      parentId: orgUnit.parentId,
      status: orgUnit.status,
      createdBy: orgUnit.createdBy,
      createdAt: orgUnit.createdAt.toISOString(),
      updatedAt: orgUnit.updatedAt.toISOString(),
      deletedAt: orgUnit.deletedAt?.toISOString() ?? null,
      ancestors,
      tenants,
    };
  }
}
