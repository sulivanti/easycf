/**
 * @contract FR-009, FR-006-M01, NFR-006, SEC-006
 *
 * Lists cases with filters and cursor-based pagination.
 * Supports: cycle, status, stage, object_id, "my responsibility", search, date range.
 * Returns enriched items with cycleName, currentStageName, primaryAssigneeName.
 * P95 < 300ms (NFR-006).
 */

import type {
  CaseInstanceRepository,
  CaseListFilter,
  CaseListResult,
  CaseListItem,
} from '../ports/case-instance.repository.js';
import type { CaseStatus } from '../../domain/value-objects/case-status.js';
import type { CasePriority } from '../../domain/value-objects/case-priority.js';

export interface ListCasesInput {
  tenantId: string;
  cycleId?: string;
  status?: CaseStatus;
  stageId?: string;
  objectId?: string;
  myResponsibility?: { userId: string };
  search?: string;
  openedAfter?: string;
  openedBefore?: string;
  cursor?: string;
  limit?: number;
}

export interface ListCasesItemOutput {
  id: string;
  codigo: string;
  cycleId: string;
  cycleName: string;
  currentStageId: string;
  currentStageName: string;
  status: CaseStatus;
  priority: CasePriority;
  primaryAssigneeName: string | null;
  openedAt: Date;
  pendingGatesCount: number;
}

export interface ListCasesOutput {
  items: ListCasesItemOutput[];
  nextCursor: string | null;
  hasMore: boolean;
}

export class ListCasesUseCase {
  constructor(private readonly caseRepo: CaseInstanceRepository) {}

  async execute(input: ListCasesInput): Promise<ListCasesOutput> {
    const filter: CaseListFilter = {
      tenantId: input.tenantId,
      cycleId: input.cycleId,
      status: input.status,
      stageId: input.stageId,
      objectId: input.objectId,
      myResponsibility: input.myResponsibility,
      search: input.search,
      openedAfter: input.openedAfter,
      openedBefore: input.openedBefore,
      cursor: input.cursor,
      limit: Math.min(input.limit ?? 20, 100),
    };

    const result: CaseListResult = await this.caseRepo.list(filter);

    const items: ListCasesItemOutput[] = result.items.map((c) => ({
      id: c.id,
      codigo: c.codigo,
      cycleId: c.cycleId,
      cycleName: c.cycleName,
      currentStageId: c.currentStageId,
      currentStageName: c.currentStageName,
      status: c.status,
      priority: c.priority,
      primaryAssigneeName: c.primaryAssigneeName,
      openedAt: c.openedAt,
      pendingGatesCount: c.pendingGatesCount,
    }));

    return {
      items,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore,
    };
  }
}
