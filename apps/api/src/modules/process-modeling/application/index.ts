/**
 * @contract FR-001..FR-011, SEC-005, DATA-003
 *
 * Process Modeling application layer — central re-export.
 */

// Ports
export type {
  ProcessCycleRepository,
  ProcessMacroStageRepository,
  ProcessStageRepository,
  ProcessGateRepository,
  ProcessRoleRepository,
  ProcessRoleProps,
  StageRoleLinkRepository,
  StageTransitionRepository,
  FlowQueryRepository,
  InstanceCheckerPort,
  CycleListFilters,
  ProcessRoleListFilters,
} from './ports/repositories.js';

// Use Cases — Cycle lifecycle
export { CreateCycleUseCase } from './use-cases/create-cycle.use-case.js';
export type { CreateCycleInput, CreateCycleOutput } from './use-cases/create-cycle.use-case.js';

export { UpdateCycleUseCase } from './use-cases/update-cycle.use-case.js';
export type { UpdateCycleInput, UpdateCycleOutput } from './use-cases/update-cycle.use-case.js';

export { DeleteCycleUseCase } from './use-cases/delete-cycle.use-case.js';
export type { DeleteCycleInput } from './use-cases/delete-cycle.use-case.js';

export { PublishCycleUseCase } from './use-cases/publish-cycle.use-case.js';
export type { PublishCycleInput, PublishCycleOutput } from './use-cases/publish-cycle.use-case.js';

export { ForkCycleUseCase } from './use-cases/fork-cycle.use-case.js';
export type { ForkCycleInput, ForkCycleOutput } from './use-cases/fork-cycle.use-case.js';

export { DeprecateCycleUseCase } from './use-cases/deprecate-cycle.use-case.js';
export type {
  DeprecateCycleInput,
  DeprecateCycleOutput,
} from './use-cases/deprecate-cycle.use-case.js';

// Use Cases — Macro-stages
export {
  CreateMacroStageUseCase,
  UpdateMacroStageUseCase,
  DeleteMacroStageUseCase,
} from './use-cases/manage-macro-stages.use-case.js';
export type {
  CreateMacroStageInput,
  UpdateMacroStageInput,
  DeleteMacroStageInput,
  MacroStageOutput,
} from './use-cases/manage-macro-stages.use-case.js';

// Use Cases — Stages
export {
  CreateStageUseCase,
  UpdateStageUseCase,
  DeleteStageUseCase,
} from './use-cases/manage-stages.use-case.js';
export type {
  CreateStageInput,
  UpdateStageInput,
  DeleteStageInput,
  StageOutput,
} from './use-cases/manage-stages.use-case.js';

// Use Cases — Gates
export {
  CreateGateUseCase,
  UpdateGateUseCase,
  DeleteGateUseCase,
} from './use-cases/manage-gates.use-case.js';
export type {
  CreateGateInput,
  UpdateGateInput,
  DeleteGateInput,
  GateOutput,
} from './use-cases/manage-gates.use-case.js';

// Use Cases — Process Roles (global catalog)
export {
  CreateProcessRoleUseCase,
  UpdateProcessRoleUseCase,
  DeleteProcessRoleUseCase,
} from './use-cases/manage-process-roles.use-case.js';
export type {
  CreateProcessRoleInput,
  UpdateProcessRoleInput,
  DeleteProcessRoleInput,
  ProcessRoleOutput,
} from './use-cases/manage-process-roles.use-case.js';

// Use Cases — Stage-Role links
export {
  LinkStageRoleUseCase,
  UnlinkStageRoleUseCase,
} from './use-cases/manage-stage-roles.use-case.js';
export type {
  LinkStageRoleInput,
  UnlinkStageRoleInput,
  StageRoleLinkOutput,
} from './use-cases/manage-stage-roles.use-case.js';

// Use Cases — Transitions
export {
  CreateTransitionUseCase,
  DeleteTransitionUseCase,
} from './use-cases/manage-transitions.use-case.js';
export type {
  CreateTransitionInput,
  DeleteTransitionInput,
  TransitionOutput,
} from './use-cases/manage-transitions.use-case.js';

// Use Cases — Flow graph
export { GetCycleFlowUseCase } from './use-cases/get-cycle-flow.use-case.js';
export type { GetCycleFlowInput } from './use-cases/get-cycle-flow.use-case.js';
