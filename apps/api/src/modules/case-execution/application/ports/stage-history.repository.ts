/**
 * @contract DATA-006 §2.2, ADR-003, FR-002, FR-008
 *
 * Repository port for stage_history (append-only).
 */

export interface StageHistoryRow {
  id: string;
  caseId: string;
  fromStageId: string | null;
  toStageId: string;
  transitionId: string | null;
  transitionedBy: string;
  transitionedAt: Date;
  motivo: string | null;
  evidence: { type: "note" | "file"; content?: string; url?: string } | null;
}

export interface StageHistoryRepository {
  create(data: Omit<StageHistoryRow, "id">): Promise<StageHistoryRow>;
  findByCaseId(caseId: string): Promise<StageHistoryRow[]>;
}
