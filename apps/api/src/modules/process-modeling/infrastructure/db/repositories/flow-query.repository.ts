/**
 * @contract FR-011, DATA-005 §5.1, NFR-005
 *
 * Drizzle implementation of FlowQueryRepository.
 * Optimized read-only queries for GET /flow endpoint (SLA < 200ms).
 * Uses parallel queries instead of a single monolithic JOIN for better
 * memory usage and simpler result mapping.
 */

import { eq, and, isNull, asc, inArray } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import {
  processMacroStages,
  processStages,
  processGates,
  stageRoleLinks,
  stageTransitions,
} from '../../../../../../db/schema/process-modeling.js';
import type {
  FlowMacroStageRow,
  FlowStageRow,
  FlowGateRow,
  FlowRoleLinkRow,
  FlowTransitionRow,
} from '../../../domain/domain-services/flow-graph.service.js';
import type { GateType } from '../../../domain/value-objects/gate-type.js';
import type { FlowQueryRepository as IFlowQueryRepository } from '../../../application/ports/repositories.js';
import type { TransactionContext } from '../../../../foundation/application/ports/repositories.js';

type Db = PostgresJsDatabase<Record<string, never>>;

export class FlowQueryRepository implements IFlowQueryRepository {
  constructor(private readonly db: Db) {}

  private conn(tx?: TransactionContext): Db {
    return (tx as Db) ?? this.db;
  }

  async queryFlowData(
    cycleId: string,
    tx?: TransactionContext,
  ): Promise<{
    macroStages: FlowMacroStageRow[];
    stages: FlowStageRow[];
    gates: FlowGateRow[];
    roleLinks: FlowRoleLinkRow[];
    transitions: FlowTransitionRow[];
  }> {
    const db = this.conn(tx);

    // Parallel queries for performance — each is simple and indexed
    const [macroRows, stageRows] = await Promise.all([
      db
        .select({
          id: processMacroStages.id,
          codigo: processMacroStages.codigo,
          nome: processMacroStages.nome,
          ordem: processMacroStages.ordem,
        })
        .from(processMacroStages)
        .where(and(eq(processMacroStages.cycleId, cycleId), isNull(processMacroStages.deletedAt)))
        .orderBy(asc(processMacroStages.ordem)),

      db
        .select({
          id: processStages.id,
          macroStageId: processStages.macroStageId,
          codigo: processStages.codigo,
          nome: processStages.nome,
          descricao: processStages.descricao,
          ordem: processStages.ordem,
          isInitial: processStages.isInitial,
          isTerminal: processStages.isTerminal,
          canvasX: processStages.canvasX,
          canvasY: processStages.canvasY,
        })
        .from(processStages)
        .where(and(eq(processStages.cycleId, cycleId), isNull(processStages.deletedAt)))
        .orderBy(asc(processStages.ordem)),
    ]);

    if (stageRows.length === 0) {
      return {
        macroStages: macroRows,
        stages: [],
        gates: [],
        roleLinks: [],
        transitions: [],
      };
    }

    const stageIds = stageRows.map((s) => s.id);

    // Second round of parallel queries using stageIds
    const [gateRows, roleLinkRows, transitionRows] = await Promise.all([
      db
        .select({
          id: processGates.id,
          stageId: processGates.stageId,
          nome: processGates.nome,
          descricao: processGates.descricao,
          gateType: processGates.gateType,
          required: processGates.required,
          ordem: processGates.ordem,
        })
        .from(processGates)
        .where(and(inArray(processGates.stageId, stageIds), isNull(processGates.deletedAt)))
        .orderBy(asc(processGates.ordem)),

      db
        .select({
          id: stageRoleLinks.id,
          stageId: stageRoleLinks.stageId,
          roleId: stageRoleLinks.roleId,
          required: stageRoleLinks.required,
          maxAssignees: stageRoleLinks.maxAssignees,
        })
        .from(stageRoleLinks)
        .where(inArray(stageRoleLinks.stageId, stageIds)),

      db
        .select({
          id: stageTransitions.id,
          fromStageId: stageTransitions.fromStageId,
          toStageId: stageTransitions.toStageId,
          nome: stageTransitions.nome,
          condicao: stageTransitions.condicao,
          gateRequired: stageTransitions.gateRequired,
          evidenceRequired: stageTransitions.evidenceRequired,
          allowedRoles: stageTransitions.allowedRoles,
        })
        .from(stageTransitions)
        .where(inArray(stageTransitions.fromStageId, stageIds)),
    ]);

    return {
      macroStages: macroRows,
      stages: stageRows,
      gates: gateRows.map((g) => ({
        ...g,
        gateType: g.gateType as GateType,
      })),
      roleLinks: roleLinkRows,
      transitions: transitionRows.map((t) => ({
        ...t,
        allowedRoles: t.allowedRoles as string[] | null,
      })),
    };
  }
}
