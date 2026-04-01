/**
 * @contract DATA-006 §2.1, FR-001, FR-002, FR-009, FR-010
 *
 * Repository port for case_instances (Aggregate Root).
 * Implementation injected by infrastructure layer (Drizzle).
 */

import type { CaseStatus } from '../../domain/value-objects/case-status.js';
import type { CasePriority } from '../../domain/value-objects/case-priority.js';

export interface CaseInstanceRow {
  id: string;
  codigo: string;
  cycleId: string;
  cycleVersionId: string;
  currentStageId: string;
  status: CaseStatus;
  objectType: string | null;
  objectId: string | null;
  orgUnitId: string | null;
  description: string | null;
  priority: CasePriority;
  tenantId: string;
  openedBy: string;
  openedAt: Date;
  completedAt: Date | null;
  cancelledAt: Date | null;
  cancellationReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CaseListItem extends CaseInstanceRow {
  cycleName: string;
  currentStageName: string;
  pendingGatesCount: number;
  primaryAssigneeName: string | null;
}

export interface CaseListFilter {
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
  limit: number;
}

export interface CaseListResult {
  items: CaseListItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

export interface CaseInstanceRepository {
  findById(id: string, tenantId: string): Promise<CaseInstanceRow | null>;
  findByCodigo(codigo: string, tenantId: string): Promise<CaseInstanceRow | null>;
  create(data: Omit<CaseInstanceRow, 'createdAt' | 'updatedAt'>): Promise<CaseInstanceRow>;
  updateStatus(
    id: string,
    tenantId: string,
    status: CaseStatus,
    expectedUpdatedAt: Date,
    extra?: Partial<
      Pick<CaseInstanceRow, 'completedAt' | 'cancelledAt' | 'cancellationReason' | 'currentStageId'>
    >,
  ): Promise<CaseInstanceRow>;
  list(filter: CaseListFilter): Promise<CaseListResult>;
  nextCodigo(tenantId: string, cycleId: string): Promise<string>;
}
