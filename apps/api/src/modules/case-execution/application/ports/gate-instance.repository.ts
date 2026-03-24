/**
 * @contract DATA-006 §2.3, FR-004, FR-005, FR-011
 *
 * Repository port for gate_instances.
 */

import type { GateResolutionStatus } from "../../domain/value-objects/gate-resolution-status.js";
import type { GateDecision } from "../../domain/value-objects/gate-decision.js";

export interface GateInstanceRow {
  id: string;
  caseId: string;
  gateId: string;
  stageId: string;
  status: GateResolutionStatus;
  resolvedBy: string | null;
  resolvedAt: Date | null;
  decision: GateDecision | null;
  parecer: string | null;
  evidence: { type: "file"; url: string; filename: string } | null;
  checklistItems: Array<{ id: string; label: string; checked: boolean }> | null;
}

export interface GateInstanceRepository {
  findById(id: string): Promise<GateInstanceRow | null>;
  findByCaseId(caseId: string): Promise<GateInstanceRow[]>;
  findByCaseAndStage(caseId: string, stageId: string): Promise<GateInstanceRow[]>;
  findPendingByCaseAndStage(caseId: string, stageId: string): Promise<GateInstanceRow[]>;
  createMany(data: Array<Omit<GateInstanceRow, "id" | "resolvedBy" | "resolvedAt" | "decision" | "parecer" | "evidence" | "checklistItems">>): Promise<GateInstanceRow[]>;
  resolve(
    id: string,
    data: {
      status: GateResolutionStatus;
      resolvedBy: string;
      resolvedAt: Date;
      decision: GateDecision | null;
      parecer: string | null;
      evidence: GateInstanceRow["evidence"];
      checklistItems: GateInstanceRow["checklistItems"];
    },
  ): Promise<GateInstanceRow>;
  countPendingByCase(caseId: string): Promise<number>;
}
