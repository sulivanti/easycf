/**
 * @contract FR-011, DATA-005 §5.1, NFR-005
 *
 * Domain service for assembling the complete flow graph of a cycle.
 * Used by GET /flow endpoint (SLA < 200ms for up to 50 stages).
 * Receives flat query results and structures into nested graph.
 */

import { type GateType } from '../value-objects/gate-type.js';

// ── Input types (flat rows from DB query) ──────────────────────────

export interface FlowMacroStageRow {
  id: string;
  codigo: string;
  nome: string;
  ordem: number;
}

export interface FlowStageRow {
  id: string;
  macroStageId: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  ordem: number;
  isInitial: boolean;
  isTerminal: boolean;
  canvasX: number | null;
  canvasY: number | null;
}

export interface FlowGateRow {
  id: string;
  stageId: string;
  nome: string;
  descricao: string | null;
  gateType: GateType;
  required: boolean;
  ordem: number;
}

export interface FlowRoleLinkRow {
  id: string;
  stageId: string;
  roleId: string;
  required: boolean;
  maxAssignees: number | null;
}

export interface FlowTransitionRow {
  id: string;
  fromStageId: string;
  toStageId: string;
  nome: string;
  condicao: string | null;
  gateRequired: boolean;
  evidenceRequired: boolean;
  allowedRoles: string[] | null;
}

// ── Output types (nested graph) ────────────────────────────────────

export interface FlowStageNode {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  ordem: number;
  isInitial: boolean;
  isTerminal: boolean;
  canvasX: number | null;
  canvasY: number | null;
  gates: FlowGateRow[];
  roles: FlowRoleLinkRow[];
  transitionsOut: FlowTransitionRow[];
}

export interface FlowMacroStageNode {
  id: string;
  codigo: string;
  nome: string;
  ordem: number;
  stages: FlowStageNode[];
}

export interface FlowGraph {
  cycleId: string;
  macroStages: FlowMacroStageNode[];
}

// ── Assembly ───────────────────────────────────────────────────────

export function assembleFlowGraph(
  cycleId: string,
  macroStages: FlowMacroStageRow[],
  stages: FlowStageRow[],
  gates: FlowGateRow[],
  roleLinks: FlowRoleLinkRow[],
  transitions: FlowTransitionRow[],
): FlowGraph {
  // Index gates, roles, transitions by stageId for O(1) lookup
  const gatesByStage = groupBy(gates, (g) => g.stageId);
  const rolesByStage = groupBy(roleLinks, (r) => r.stageId);
  const transitionsByFrom = groupBy(transitions, (t) => t.fromStageId);

  // Index stages by macroStageId
  const stagesByMacro = groupBy(stages, (s) => s.macroStageId);

  const graphMacroStages: FlowMacroStageNode[] = macroStages
    .sort((a, b) => a.ordem - b.ordem)
    .map((ms) => ({
      id: ms.id,
      codigo: ms.codigo,
      nome: ms.nome,
      ordem: ms.ordem,
      stages: (stagesByMacro.get(ms.id) ?? [])
        .sort((a, b) => a.ordem - b.ordem)
        .map((s) => ({
          id: s.id,
          codigo: s.codigo,
          nome: s.nome,
          descricao: s.descricao,
          ordem: s.ordem,
          isInitial: s.isInitial,
          isTerminal: s.isTerminal,
          canvasX: s.canvasX,
          canvasY: s.canvasY,
          gates: (gatesByStage.get(s.id) ?? []).sort((a, b) => a.ordem - b.ordem),
          roles: rolesByStage.get(s.id) ?? [],
          transitionsOut: transitionsByFrom.get(s.id) ?? [],
        })),
    }));

  return { cycleId, macroStages: graphMacroStages };
}

function groupBy<T>(items: T[], keyFn: (item: T) => string): Map<string, T[]> {
  const map = new Map<string, T[]>();
  for (const item of items) {
    const key = keyFn(item);
    const group = map.get(key);
    if (group) {
      group.push(item);
    } else {
      map.set(key, [item]);
    }
  }
  return map;
}
