/**
 * @contract BR-004, ADR-003
 *
 * Domain service for atomic cycle fork.
 * Creates a complete copy of a PUBLISHED cycle as a new DRAFT version
 * using in-memory UUID remapping (ADR-003).
 *
 * Deterministic insertion order:
 *   cycle → macro_stages → stages → gates → role_links → transitions
 */

import { type ProcessCycleProps } from '../aggregates/process-cycle.js';
import { type MacroStageProps } from '../entities/macro-stage.js';
import { type StageProps } from '../entities/stage.js';
import { type GateProps } from '../entities/gate.js';
import { type StageTransitionProps } from '../entities/stage-transition.js';

export interface StageRoleLinkData {
  id: string;
  stageId: string;
  roleId: string;
  required: boolean;
  maxAssignees: number | null;
  createdBy: string;
}

export interface ForkInput {
  cycle: ProcessCycleProps;
  macroStages: MacroStageProps[];
  stages: StageProps[];
  gates: GateProps[];
  roleLinks: StageRoleLinkData[];
  transitions: StageTransitionProps[];
}

export interface ForkOutput {
  cycle: ProcessCycleProps;
  macroStages: MacroStageProps[];
  stages: StageProps[];
  gates: GateProps[];
  roleLinks: StageRoleLinkData[];
  transitions: StageTransitionProps[];
}

export function forkCycle(
  input: ForkInput,
  generateId: () => string,
  createdBy: string,
): ForkOutput {
  const idMap = new Map<string, string>();
  const now = new Date();

  // 1. Cycle
  const newCycleId = generateId();
  idMap.set(input.cycle.id, newCycleId);

  const forkedCycle: ProcessCycleProps = {
    id: newCycleId,
    tenantId: input.cycle.tenantId,
    codigo: input.cycle.codigo,
    nome: input.cycle.nome,
    descricao: input.cycle.descricao,
    version: input.cycle.version + 1,
    status: 'DRAFT',
    parentCycleId: input.cycle.id,
    publishedAt: null,
    createdBy,
    createdAt: now,
    updatedAt: now,
  };

  // 2. Macro-stages
  const forkedMacroStages = input.macroStages.map((ms) => {
    const newId = generateId();
    idMap.set(ms.id, newId);
    return {
      ...ms,
      id: newId,
      cycleId: newCycleId,
      createdBy,
      createdAt: now,
      updatedAt: now,
    };
  });

  // 3. Stages (cycle_id denormalized from ADR-001)
  const forkedStages = input.stages.map((s) => {
    const newId = generateId();
    idMap.set(s.id, newId);
    return {
      ...s,
      id: newId,
      macroStageId: idMap.get(s.macroStageId)!,
      cycleId: newCycleId,
      createdBy,
      createdAt: now,
      updatedAt: now,
    };
  });

  // 4. Gates
  const forkedGates = input.gates.map((g) => {
    const newId = generateId();
    idMap.set(g.id, newId);
    return {
      ...g,
      id: newId,
      stageId: idMap.get(g.stageId)!,
      createdBy,
      createdAt: now,
      updatedAt: now,
    };
  });

  // 5. Role links (role_id stays the same — global catalog)
  const forkedRoleLinks = input.roleLinks.map((rl) => ({
    ...rl,
    id: generateId(),
    stageId: idMap.get(rl.stageId)!,
    createdBy,
  }));

  // 6. Transitions (remap both from/to stage IDs)
  const forkedTransitions = input.transitions.map((t) => ({
    ...t,
    id: generateId(),
    fromStageId: idMap.get(t.fromStageId)!,
    toStageId: idMap.get(t.toStageId)!,
    createdBy,
    createdAt: now,
    updatedAt: now,
  }));

  return {
    cycle: forkedCycle,
    macroStages: forkedMacroStages,
    stages: forkedStages,
    gates: forkedGates,
    roleLinks: forkedRoleLinks,
    transitions: forkedTransitions,
  };
}
