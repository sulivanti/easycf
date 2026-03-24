/**
 * @contract FR-008, ADR-003, NFR-006
 *
 * Assembles interleaved timeline from 3 independent histories + assignments.
 * Merge-sorts by timestamp (descending — newest first).
 * P95 < 500ms for up to 100 events (NFR-006).
 */

import type { StageHistoryRepository } from "../ports/stage-history.repository.js";
import type { GateInstanceRepository } from "../ports/gate-instance.repository.js";
import type { CaseEventRepository } from "../ports/case-event.repository.js";
import type { CaseAssignmentRepository } from "../ports/case-assignment.repository.js";
import { assembleTimeline, type TimelineEntry } from "../../domain/domain-services/timeline.service.js";

export interface GetTimelineInput {
  caseId: string;
  tenantId: string;
}

export interface GetTimelineOutput {
  entries: TimelineEntry[];
  total: number;
}

export class GetTimelineUseCase {
  constructor(
    private readonly stageHistoryRepo: StageHistoryRepository,
    private readonly gateInstanceRepo: GateInstanceRepository,
    private readonly caseEventRepo: CaseEventRepository,
    private readonly assignmentRepo: CaseAssignmentRepository,
  ) {}

  async execute(input: GetTimelineInput): Promise<GetTimelineOutput> {
    // Parallel queries (ADR-003 — 3 independent histories + assignments)
    const [stageEntries, gateEntries, eventEntries, assignmentEntries] = await Promise.all([
      this.stageHistoryRepo.findByCaseId(input.caseId),
      this.gateInstanceRepo.findByCaseId(input.caseId),
      this.caseEventRepo.findByCaseId(input.caseId),
      this.assignmentRepo.findActiveByCaseId(input.caseId),
    ]);

    const stageTimeline: TimelineEntry[] = stageEntries.map((e) => ({
      id: e.id,
      source: "stage_history",
      timestamp: e.transitionedAt,
      data: {
        fromStageId: e.fromStageId,
        toStageId: e.toStageId,
        transitionId: e.transitionId,
        transitionedBy: e.transitionedBy,
        motivo: e.motivo,
      },
    }));

    const gateTimeline: TimelineEntry[] = gateEntries
      .filter((g) => g.resolvedAt !== null)
      .map((g) => ({
        id: g.id,
        source: "gate_instance",
        timestamp: g.resolvedAt!,
        data: {
          gateId: g.gateId,
          stageId: g.stageId,
          status: g.status,
          decision: g.decision,
          resolvedBy: g.resolvedBy,
        },
      }));

    const eventTimeline: TimelineEntry[] = eventEntries.map((e) => ({
      id: e.id,
      source: "case_event",
      timestamp: e.createdAt,
      data: {
        eventType: e.eventType,
        descricao: e.descricao,
        createdBy: e.createdBy,
        stageId: e.stageId,
      },
    }));

    const assignmentTimeline: TimelineEntry[] = assignmentEntries.map((a) => ({
      id: a.id,
      source: "case_assignment",
      timestamp: a.assignedAt,
      data: {
        processRoleId: a.processRoleId,
        userId: a.userId,
        assignedBy: a.assignedBy,
        isActive: a.isActive,
      },
    }));

    const entries = assembleTimeline(
      stageTimeline,
      gateTimeline,
      eventTimeline,
      assignmentTimeline,
    );

    return { entries, total: entries.length };
  }
}
