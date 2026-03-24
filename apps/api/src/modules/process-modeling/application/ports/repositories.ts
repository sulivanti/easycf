/**
 * @contract DATA-005, FR-001..FR-011, INT-005 §4.1, SEC-005
 *
 * Repository port interfaces for the Process Modeling module (MOD-005).
 * Reuses Foundation's UnitOfWork, TransactionContext, PaginationParams, PaginatedResult.
 */

import type {
  TransactionContext,
  PaginationParams,
  PaginatedResult,
} from '../../../foundation/application/ports/repositories.js';
import type { ProcessCycleProps } from '../../domain/aggregates/process-cycle.js';
import type { MacroStageProps } from '../../domain/entities/macro-stage.js';
import type { StageProps } from '../../domain/entities/stage.js';
import type { GateProps } from '../../domain/entities/gate.js';
import type { StageTransitionProps } from '../../domain/entities/stage-transition.js';
import type { StageRoleLinkData } from '../../domain/domain-services/cycle-fork.service.js';
import type { CycleStatus } from '../../domain/value-objects/cycle-status.js';
import type {
  FlowMacroStageRow,
  FlowStageRow,
  FlowGateRow,
  FlowRoleLinkRow,
  FlowTransitionRow,
} from '../../domain/domain-services/flow-graph.service.js';

// ---------------------------------------------------------------------------
// Filter types
// ---------------------------------------------------------------------------

export interface CycleListFilters {
  readonly tenantId: string;
  readonly status?: CycleStatus;
}

export interface ProcessRoleListFilters {
  readonly tenantId: string;
}

// ---------------------------------------------------------------------------
// ProcessCycleRepository
// ---------------------------------------------------------------------------
export interface ProcessCycleRepository {
  findById(id: string, tx?: TransactionContext): Promise<ProcessCycleProps | null>;

  list(
    filters: CycleListFilters,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<ProcessCycleProps>>;

  create(cycle: ProcessCycleProps, tx?: TransactionContext): Promise<ProcessCycleProps>;
  update(cycle: ProcessCycleProps, tx?: TransactionContext): Promise<ProcessCycleProps>;

  /** Soft delete — sets deleted_at (only DRAFT, BR-005) */
  softDelete(id: string, tx?: TransactionContext): Promise<void>;
}

// ---------------------------------------------------------------------------
// ProcessMacroStageRepository
// ---------------------------------------------------------------------------
export interface ProcessMacroStageRepository {
  findById(id: string, tx?: TransactionContext): Promise<MacroStageProps | null>;

  /** List active macro-stages for a cycle, ordered by ordem */
  listByCycle(cycleId: string, tx?: TransactionContext): Promise<readonly MacroStageProps[]>;

  /** @contract BR-005 — Check for active (non-deleted) stages */
  hasActiveStages(macroStageId: string, tx?: TransactionContext): Promise<boolean>;

  create(macroStage: MacroStageProps, tx?: TransactionContext): Promise<MacroStageProps>;
  update(macroStage: MacroStageProps, tx?: TransactionContext): Promise<MacroStageProps>;
  softDelete(id: string, tx?: TransactionContext): Promise<void>;

  /** @contract BR-012 — Reorder items after insert/delete */
  reorder(cycleId: string, tx?: TransactionContext): Promise<void>;
}

// ---------------------------------------------------------------------------
// ProcessStageRepository
// ---------------------------------------------------------------------------
export interface ProcessStageRepository {
  findById(id: string, tx?: TransactionContext): Promise<StageProps | null>;

  /** List active stages for a macro-stage, ordered by ordem */
  listByMacroStage(macroStageId: string, tx?: TransactionContext): Promise<readonly StageProps[]>;

  /** List active stages for a cycle (for /flow, fork, validation) */
  listByCycle(cycleId: string, tx?: TransactionContext): Promise<readonly StageProps[]>;

  /** @contract BR-002 — Check if cycle already has an initial stage */
  hasInitialStage(
    cycleId: string,
    excludeStageId?: string,
    tx?: TransactionContext,
  ): Promise<boolean>;

  create(stage: StageProps, tx?: TransactionContext): Promise<StageProps>;
  update(stage: StageProps, tx?: TransactionContext): Promise<StageProps>;
  softDelete(id: string, tx?: TransactionContext): Promise<void>;

  /** @contract BR-012 — Reorder items after insert/delete within macro-stage */
  reorder(macroStageId: string, tx?: TransactionContext): Promise<void>;
}

// ---------------------------------------------------------------------------
// ProcessGateRepository
// ---------------------------------------------------------------------------
export interface ProcessGateRepository {
  findById(id: string, tx?: TransactionContext): Promise<GateProps | null>;

  /** List active gates for a stage, ordered by ordem */
  listByStage(stageId: string, tx?: TransactionContext): Promise<readonly GateProps[]>;

  /** List active gates for a cycle (for fork) */
  listByCycle(cycleId: string, tx?: TransactionContext): Promise<readonly GateProps[]>;

  create(gate: GateProps, tx?: TransactionContext): Promise<GateProps>;
  update(gate: GateProps, tx?: TransactionContext): Promise<GateProps>;
  softDelete(id: string, tx?: TransactionContext): Promise<void>;

  /** @contract BR-012 — Reorder items after insert/delete within stage */
  reorder(stageId: string, tx?: TransactionContext): Promise<void>;
}

// ---------------------------------------------------------------------------
// ProcessRoleRepository
// ---------------------------------------------------------------------------
export interface ProcessRoleRepository {
  findById(id: string, tx?: TransactionContext): Promise<ProcessRoleProps | null>;
  findByCodigo(
    tenantId: string,
    codigo: string,
    tx?: TransactionContext,
  ): Promise<ProcessRoleProps | null>;

  list(
    filters: ProcessRoleListFilters,
    params: PaginationParams,
    tx?: TransactionContext,
  ): Promise<PaginatedResult<ProcessRoleProps>>;

  /** @contract BR-005 — Check for active stage_role_links referencing this role */
  hasActiveLinks(roleId: string, tx?: TransactionContext): Promise<boolean>;

  create(role: ProcessRoleProps, tx?: TransactionContext): Promise<ProcessRoleProps>;
  update(role: ProcessRoleProps, tx?: TransactionContext): Promise<ProcessRoleProps>;
  softDelete(id: string, tx?: TransactionContext): Promise<void>;
}

export interface ProcessRoleProps {
  readonly id: string;
  readonly tenantId: string;
  readonly codigo: string;
  readonly nome: string;
  readonly descricao: string | null;
  readonly canApprove: boolean;
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

// ---------------------------------------------------------------------------
// StageRoleLinkRepository
// ---------------------------------------------------------------------------
export interface StageRoleLinkRepository {
  findById(id: string, tx?: TransactionContext): Promise<StageRoleLinkData | null>;

  /** Find by (stageId, roleId) pair for duplicate check */
  findByPair(
    stageId: string,
    roleId: string,
    tx?: TransactionContext,
  ): Promise<StageRoleLinkData | null>;

  /** List links for a stage */
  listByStage(stageId: string, tx?: TransactionContext): Promise<readonly StageRoleLinkData[]>;

  /** List links for a cycle (for fork) */
  listByCycle(cycleId: string, tx?: TransactionContext): Promise<readonly StageRoleLinkData[]>;

  create(link: StageRoleLinkData, tx?: TransactionContext): Promise<StageRoleLinkData>;

  /** Hard delete (no soft delete — DATA-005 §2.8) */
  delete(id: string, tx?: TransactionContext): Promise<void>;
}

// ---------------------------------------------------------------------------
// StageTransitionRepository
// ---------------------------------------------------------------------------
export interface StageTransitionRepository {
  findById(id: string, tx?: TransactionContext): Promise<StageTransitionProps | null>;

  /** List transitions for a cycle (for fork, /flow) */
  listByCycle(cycleId: string, tx?: TransactionContext): Promise<readonly StageTransitionProps[]>;

  /** List outgoing transitions from a stage */
  listByFromStage(
    fromStageId: string,
    tx?: TransactionContext,
  ): Promise<readonly StageTransitionProps[]>;

  create(transition: StageTransitionProps, tx?: TransactionContext): Promise<StageTransitionProps>;

  /** Hard delete (no soft delete — DATA-005 §2.8) */
  delete(id: string, tx?: TransactionContext): Promise<void>;
}

// ---------------------------------------------------------------------------
// FlowQueryRepository — optimized read-only port for /flow endpoint
// ---------------------------------------------------------------------------
export interface FlowQueryRepository {
  /** @contract FR-011, DATA-005 §5.1 — flat rows for assembleFlowGraph */
  queryFlowData(
    cycleId: string,
    tx?: TransactionContext,
  ): Promise<{
    macroStages: FlowMacroStageRow[];
    stages: FlowStageRow[];
    gates: FlowGateRow[];
    roleLinks: FlowRoleLinkRow[];
    transitions: FlowTransitionRow[];
  }>;
}

// ---------------------------------------------------------------------------
// InstanceCheckerPort — integration with MOD-006 (INT-005 §4.1, ADR-002)
// ---------------------------------------------------------------------------
export interface InstanceCheckerPort {
  /**
   * Count active instances for a given stage.
   * @throws Mod006UnavailableError if MOD-006 is unreachable (fail-safe, ADR-002)
   */
  countActiveByStageId(stageId: string): Promise<number>;
}
