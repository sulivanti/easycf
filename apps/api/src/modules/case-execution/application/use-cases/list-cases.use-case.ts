/**
 * @contract FR-009, NFR-006, SEC-006
 *
 * Lists cases with filters and cursor-based pagination.
 * Supports: cycle, status, stage, object_id, "my responsibility", search.
 * P95 < 300ms (NFR-006).
 */

import type {
  CaseInstanceRepository,
  CaseListFilter,
  CaseListResult,
} from '../ports/case-instance.repository.js';
import type { GateInstanceRepository } from '../ports/gate-instance.repository.js';
import type { CaseStatus } from '../../domain/value-objects/case-status.js';

export interface ListCasesInput {
  tenantId: string;
  cycleId?: string;
  status?: CaseStatus;
  stageId?: string;
  objectId?: string;
  myResponsibility?: { userId: string };
  search?: string;
  cursor?: string;
  limit?: number;
}

export interface CaseListItem {
  id: string;
  codigo: string;
  cycleId: string;
  currentStageId: string;
  status: CaseStatus;
  objectType: string | null;
  objectId: string | null;
  orgUnitId: string | null;
  openedBy: string;
  openedAt: Date;
  pendingGatesCount: number;
}

export interface ListCasesOutput {
  items: CaseListItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export class ListCasesUseCase {
  constructor(
    private readonly caseRepo: CaseInstanceRepository,
    private readonly gateInstanceRepo: GateInstanceRepository,
  ) {}

  async execute(input: ListCasesInput): Promise<ListCasesOutput> {
    const filter: CaseListFilter = {
      tenantId: input.tenantId,
      cycleId: input.cycleId,
      status: input.status,
      stageId: input.stageId,
      objectId: input.objectId,
      myResponsibility: input.myResponsibility,
      search: input.search,
      cursor: input.cursor,
      limit: Math.min(input.limit ?? 20, 100),
    };

    const result: CaseListResult = await this.caseRepo.list(filter);

    // Enrich with pending gates count
    const items: CaseListItem[] = await Promise.all(
      result.items.map(async (c) => {
        const pendingGatesCount = await this.gateInstanceRepo.countPendingByCase(c.id);
        return {
          id: c.id,
          codigo: c.codigo,
          cycleId: c.cycleId,
          currentStageId: c.currentStageId,
          status: c.status,
          objectType: c.objectType,
          objectId: c.objectId,
          orgUnitId: c.orgUnitId,
          openedBy: c.openedBy,
          openedAt: c.openedAt,
          pendingGatesCount,
        };
      }),
    );

    return {
      items,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }
}
