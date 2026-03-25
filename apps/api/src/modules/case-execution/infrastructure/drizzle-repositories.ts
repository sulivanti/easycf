// @contract DATA-006, DOC-ARC-004
//
// Drizzle-based repository implementations for Case Execution module (MOD-006).

import { eq, and, lt, desc, sql, inArray } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  caseInstances,
  stageHistory,
  gateInstances,
  caseAssignments,
  caseEvents,
} from '../../../../db/schema/case-execution.js';
import type {
  CaseInstanceRepository,
  CaseInstanceRow,
  CaseListFilter,
  CaseListResult,
} from '../application/ports/case-instance.repository.js';
import type {
  StageHistoryRepository,
  StageHistoryRow,
} from '../application/ports/stage-history.repository.js';
import type {
  GateInstanceRepository,
  GateInstanceRow,
} from '../application/ports/gate-instance.repository.js';
import type {
  CaseAssignmentRepository,
  CaseAssignmentRow,
} from '../application/ports/case-assignment.repository.js';
import type {
  CaseEventRepository,
  CaseEventRow,
} from '../application/ports/case-event.repository.js';
import type {
  DelegationCheckerPort,
  ExpiredDelegation,
} from '../application/ports/delegation-checker.port.js';
import type { CaseStatus } from '../domain/value-objects/case-status.js';

type Conn = PostgresJsDatabase;

// ─────────────────────────────────────────────────────────────────────────────
// CaseInstanceRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleCaseInstanceRepository implements CaseInstanceRepository {
  constructor(private db: Conn) {}

  async findById(id: string, tenantId: string): Promise<CaseInstanceRow | null> {
    const [row] = await this.db
      .select()
      .from(caseInstances)
      .where(and(eq(caseInstances.id, id), eq(caseInstances.tenantId, tenantId)))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async findByCodigo(codigo: string, tenantId: string): Promise<CaseInstanceRow | null> {
    const [row] = await this.db
      .select()
      .from(caseInstances)
      .where(and(eq(caseInstances.codigo, codigo), eq(caseInstances.tenantId, tenantId)))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async create(data: Omit<CaseInstanceRow, 'createdAt' | 'updatedAt'>): Promise<CaseInstanceRow> {
    const now = new Date();
    const [row] = await this.db
      .insert(caseInstances)
      .values({ ...data, createdAt: now, updatedAt: now })
      .returning();
    return this.toDomain(row);
  }

  async updateStatus(
    id: string,
    tenantId: string,
    status: CaseStatus,
    expectedUpdatedAt: Date,
    extra?: Partial<Pick<CaseInstanceRow, 'completedAt' | 'cancelledAt' | 'cancellationReason' | 'currentStageId'>>,
  ): Promise<CaseInstanceRow> {
    const now = new Date();
    const [row] = await this.db
      .update(caseInstances)
      .set({ status, updatedAt: now, ...extra })
      .where(
        and(
          eq(caseInstances.id, id),
          eq(caseInstances.tenantId, tenantId),
          eq(caseInstances.updatedAt, expectedUpdatedAt),
        ),
      )
      .returning();
    if (!row) {
      throw new Error(`Optimistic lock failed for case ${id} — concurrent update detected.`);
    }
    return this.toDomain(row);
  }

  async list(filter: CaseListFilter): Promise<CaseListResult> {
    const limit = filter.limit + 1;
    const conditions = [eq(caseInstances.tenantId, filter.tenantId)];

    if (filter.cycleId) conditions.push(eq(caseInstances.cycleId, filter.cycleId));
    if (filter.status) conditions.push(eq(caseInstances.status, filter.status));
    if (filter.stageId) conditions.push(eq(caseInstances.currentStageId, filter.stageId));
    if (filter.objectId) conditions.push(eq(caseInstances.objectId, filter.objectId));
    if (filter.search) conditions.push(sql`${caseInstances.codigo} ILIKE ${'%' + filter.search + '%'}`);

    // myResponsibility filter: subquery on active assignments
    if (filter.myResponsibility) {
      conditions.push(
        sql`${caseInstances.id} IN (
          SELECT ${caseAssignments.caseId} FROM ${caseAssignments}
          WHERE ${caseAssignments.userId} = ${filter.myResponsibility.userId}
            AND ${caseAssignments.isActive} = true
        )`,
      );
    }

    const rows = await this.db
      .select()
      .from(caseInstances)
      .where(and(...conditions))
      .orderBy(desc(caseInstances.openedAt))
      .limit(limit);

    const hasMore = rows.length > filter.limit;
    const data = rows.slice(0, filter.limit);
    return {
      items: data.map((r) => this.toDomain(r)),
      nextCursor: hasMore ? data[data.length - 1].id : null,
      hasMore,
    };
  }

  async nextCodigo(tenantId: string, cycleId: string): Promise<string> {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(caseInstances)
      .where(and(eq(caseInstances.tenantId, tenantId), eq(caseInstances.cycleId, cycleId)));
    const seq = (result?.count ?? 0) + 1;
    return `CASE-${seq.toString().padStart(6, '0')}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(row: any): CaseInstanceRow {
    return {
      id: row.id,
      codigo: row.codigo,
      cycleId: row.cycleId,
      cycleVersionId: row.cycleVersionId,
      currentStageId: row.currentStageId,
      status: row.status,
      objectType: row.objectType,
      objectId: row.objectId,
      orgUnitId: row.orgUnitId,
      tenantId: row.tenantId,
      openedBy: row.openedBy,
      openedAt: row.openedAt,
      completedAt: row.completedAt,
      cancelledAt: row.cancelledAt,
      cancellationReason: row.cancellationReason,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// StageHistoryRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleStageHistoryRepository implements StageHistoryRepository {
  constructor(private db: Conn) {}

  async create(data: Omit<StageHistoryRow, 'id'>): Promise<StageHistoryRow> {
    const [row] = await this.db
      .insert(stageHistory)
      .values({ ...data, id: crypto.randomUUID() })
      .returning();
    return this.toDomain(row);
  }

  async findByCaseId(caseId: string): Promise<StageHistoryRow[]> {
    const rows = await this.db
      .select()
      .from(stageHistory)
      .where(eq(stageHistory.caseId, caseId))
      .orderBy(desc(stageHistory.transitionedAt));
    return rows.map((r) => this.toDomain(r));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(row: any): StageHistoryRow {
    return {
      id: row.id,
      caseId: row.caseId,
      fromStageId: row.fromStageId,
      toStageId: row.toStageId,
      transitionId: row.transitionId,
      transitionedBy: row.transitionedBy,
      transitionedAt: row.transitionedAt,
      motivo: row.motivo,
      evidence: row.evidence as StageHistoryRow['evidence'],
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// GateInstanceRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleGateInstanceRepository implements GateInstanceRepository {
  constructor(private db: Conn) {}

  async findById(id: string): Promise<GateInstanceRow | null> {
    const [row] = await this.db
      .select()
      .from(gateInstances)
      .where(eq(gateInstances.id, id))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async findByCaseId(caseId: string): Promise<GateInstanceRow[]> {
    const rows = await this.db
      .select()
      .from(gateInstances)
      .where(eq(gateInstances.caseId, caseId));
    return rows.map((r) => this.toDomain(r));
  }

  async findByCaseAndStage(caseId: string, stageId: string): Promise<GateInstanceRow[]> {
    const rows = await this.db
      .select()
      .from(gateInstances)
      .where(and(eq(gateInstances.caseId, caseId), eq(gateInstances.stageId, stageId)));
    return rows.map((r) => this.toDomain(r));
  }

  async findPendingByCaseAndStage(caseId: string, stageId: string): Promise<GateInstanceRow[]> {
    const rows = await this.db
      .select()
      .from(gateInstances)
      .where(
        and(
          eq(gateInstances.caseId, caseId),
          eq(gateInstances.stageId, stageId),
          eq(gateInstances.status, 'PENDING'),
        ),
      );
    return rows.map((r) => this.toDomain(r));
  }

  async createMany(
    data: Array<Omit<GateInstanceRow, 'id' | 'resolvedBy' | 'resolvedAt' | 'decision' | 'parecer' | 'evidence' | 'checklistItems'>>,
  ): Promise<GateInstanceRow[]> {
    if (data.length === 0) return [];
    const rows = await this.db
      .insert(gateInstances)
      .values(
        data.map((d) => ({
          ...d,
          id: crypto.randomUUID(),
          resolvedBy: null,
          resolvedAt: null,
          decision: null,
          parecer: null,
          evidence: null,
          checklistItems: null,
        })),
      )
      .returning();
    return rows.map((r) => this.toDomain(r));
  }

  async resolve(
    id: string,
    data: {
      status: GateInstanceRow['status'];
      resolvedBy: string;
      resolvedAt: Date;
      decision: GateInstanceRow['decision'];
      parecer: string | null;
      evidence: GateInstanceRow['evidence'];
      checklistItems: GateInstanceRow['checklistItems'];
    },
  ): Promise<GateInstanceRow> {
    const [row] = await this.db
      .update(gateInstances)
      .set(data)
      .where(eq(gateInstances.id, id))
      .returning();
    return this.toDomain(row);
  }

  async countPendingByCase(caseId: string): Promise<number> {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(gateInstances)
      .where(and(eq(gateInstances.caseId, caseId), eq(gateInstances.status, 'PENDING')));
    return result?.count ?? 0;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(row: any): GateInstanceRow {
    return {
      id: row.id,
      caseId: row.caseId,
      gateId: row.gateId,
      stageId: row.stageId,
      status: row.status,
      resolvedBy: row.resolvedBy,
      resolvedAt: row.resolvedAt,
      decision: row.decision,
      parecer: row.parecer,
      evidence: row.evidence as GateInstanceRow['evidence'],
      checklistItems: row.checklistItems as GateInstanceRow['checklistItems'],
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CaseAssignmentRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleCaseAssignmentRepository implements CaseAssignmentRepository {
  constructor(private db: Conn) {}

  async findById(id: string): Promise<CaseAssignmentRow | null> {
    const [row] = await this.db
      .select()
      .from(caseAssignments)
      .where(eq(caseAssignments.id, id))
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async findActiveByCaseId(caseId: string): Promise<CaseAssignmentRow[]> {
    const rows = await this.db
      .select()
      .from(caseAssignments)
      .where(and(eq(caseAssignments.caseId, caseId), eq(caseAssignments.isActive, true)));
    return rows.map((r) => this.toDomain(r));
  }

  async findActiveByCaseAndRole(caseId: string, processRoleId: string): Promise<CaseAssignmentRow | null> {
    const [row] = await this.db
      .select()
      .from(caseAssignments)
      .where(
        and(
          eq(caseAssignments.caseId, caseId),
          eq(caseAssignments.processRoleId, processRoleId),
          eq(caseAssignments.isActive, true),
        ),
      )
      .limit(1);
    return row ? this.toDomain(row) : null;
  }

  async create(data: Omit<CaseAssignmentRow, 'id'>): Promise<CaseAssignmentRow> {
    const [row] = await this.db
      .insert(caseAssignments)
      .values({ ...data, id: crypto.randomUUID() })
      .returning();
    return this.toDomain(row);
  }

  async deactivate(id: string, reason: string): Promise<void> {
    await this.db
      .update(caseAssignments)
      .set({ isActive: false, substitutionReason: reason })
      .where(eq(caseAssignments.id, id));
  }

  async deactivateByRole(caseId: string, processRoleId: string, reason: string): Promise<void> {
    await this.db
      .update(caseAssignments)
      .set({ isActive: false, substitutionReason: reason })
      .where(
        and(
          eq(caseAssignments.caseId, caseId),
          eq(caseAssignments.processRoleId, processRoleId),
          eq(caseAssignments.isActive, true),
        ),
      );
  }

  async findExpired(now: Date): Promise<CaseAssignmentRow[]> {
    const rows = await this.db
      .select()
      .from(caseAssignments)
      .where(
        and(
          eq(caseAssignments.isActive, true),
          lt(caseAssignments.validUntil, now),
        ),
      );
    return rows.map((r) => this.toDomain(r));
  }

  async findByDelegationIds(delegationIds: string[]): Promise<CaseAssignmentRow[]> {
    if (delegationIds.length === 0) return [];
    const rows = await this.db
      .select()
      .from(caseAssignments)
      .where(inArray(caseAssignments.delegationId, delegationIds));
    return rows.map((r) => this.toDomain(r));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(row: any): CaseAssignmentRow {
    return {
      id: row.id,
      caseId: row.caseId,
      stageId: row.stageId,
      processRoleId: row.processRoleId,
      userId: row.userId,
      assignedBy: row.assignedBy,
      assignedAt: row.assignedAt,
      validUntil: row.validUntil,
      isActive: row.isActive,
      substitutionReason: row.substitutionReason,
      delegationId: row.delegationId,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CaseEventRepository
// ─────────────────────────────────────────────────────────────────────────────

export class DrizzleCaseEventRepository implements CaseEventRepository {
  constructor(private db: Conn) {}

  async create(data: Omit<CaseEventRow, 'id'>): Promise<CaseEventRow> {
    const [row] = await this.db
      .insert(caseEvents)
      .values({ ...data, id: crypto.randomUUID() })
      .returning();
    return this.toDomain(row);
  }

  async findByCaseId(caseId: string): Promise<CaseEventRow[]> {
    const rows = await this.db
      .select()
      .from(caseEvents)
      .where(eq(caseEvents.caseId, caseId))
      .orderBy(desc(caseEvents.createdAt));
    return rows.map((r) => this.toDomain(r));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private toDomain(row: any): CaseEventRow {
    return {
      id: row.id,
      caseId: row.caseId,
      eventType: row.eventType,
      descricao: row.descricao,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      metadata: row.metadata as Record<string, unknown> | null,
      stageId: row.stageId,
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DelegationCheckerPort — Stub (reads MOD-004 expired delegations)
// ─────────────────────────────────────────────────────────────────────────────

export class StubDelegationChecker implements DelegationCheckerPort {
  async getExpiredDelegations(): Promise<ExpiredDelegation[]> {
    // Stub — will be wired to MOD-004 AccessDelegationRepository when INT-006 is implemented
    return [];
  }
}
