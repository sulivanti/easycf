/**
 * @contract FR-002
 *
 * Use Case: Get Organizational Unit Tree
 * Returns full N1→N2→N3→N4→(tenants N5) hierarchy via CTE recursivo.
 * Soft-deleted nodes are excluded.
 */

import type { OrgUnitRepository, OrgUnitTreeNode } from '../ports/repositories.js';

export interface GetOrgUnitTreeOutput {
  readonly tree: readonly OrgUnitTreeNode[];
}

export interface GetOrgUnitTreeInput {
  readonly includeInactive?: boolean;
}

export class GetOrgUnitTreeUseCase {
  constructor(private readonly orgUnitRepo: OrgUnitRepository) {}

  async execute(input?: GetOrgUnitTreeInput): Promise<GetOrgUnitTreeOutput> {
    const tree = await this.orgUnitRepo.getTree(input?.includeInactive);
    return { tree };
  }
}
