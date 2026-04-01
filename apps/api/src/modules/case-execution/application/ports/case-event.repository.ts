/**
 * @contract DATA-006 §2.5, ADR-003, FR-007, FR-013
 *
 * Repository port for case_events (append-only).
 */

import type { CaseEventType } from '../../domain/value-objects/case-event-type.js';

export interface CaseEventRow {
  id: string;
  caseId: string;
  eventType: CaseEventType;
  descricao: string;
  createdBy: string;
  createdAt: Date;
  metadata: Record<string, unknown> | null;
  stageId: string;
}

export type CreateCaseEventInput = Omit<CaseEventRow, 'id' | 'createdAt'> & {
  createdAt?: Date;
};

export interface CaseEventRepository {
  create(data: CreateCaseEventInput): Promise<CaseEventRow>;
  findByCaseId(caseId: string): Promise<CaseEventRow[]>;
}
