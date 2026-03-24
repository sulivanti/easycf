/**
 * @contract DOC-GNP-00
 *
 * Barrel export for the Contextual Params application layer (MOD-007).
 */

// Ports
export type {
  PaginationParams,
  PaginatedResult,
  TransactionContext,
  UnitOfWork,
  ContextFramerTypeRecord,
  TargetObjectRecord,
  TargetFieldRecord,
  RoutineItemRecord,
  RoutineIncidenceLinkRecord,
  RoutineVersionHistoryRecord,
  DomainEventRecord,
  FramerTypeRepository,
  FramerRepository,
  TargetObjectRepository,
  TargetFieldRepository,
  IncidenceRuleRepository,
  RoutineRepository,
  RoutineItemRepository,
  RoutineIncidenceLinkRepository,
  VersionHistoryRepository,
  DomainEventRepository,
} from './ports/repositories.js';

export type { IdGeneratorService } from './ports/services.js';

// Use Cases — Framers (FR-001, FR-002)
export { CreateFramerTypeUseCase } from './use-cases/create-framer-type.use-case.js';
export { CreateFramerUseCase } from './use-cases/create-framer.use-case.js';
export { UpdateFramerUseCase } from './use-cases/update-framer.use-case.js';
export { DeleteFramerUseCase } from './use-cases/delete-framer.use-case.js';

// Use Cases — Targets (FR-003)
export { CreateTargetObjectUseCase } from './use-cases/create-target-object.use-case.js';
export { CreateTargetFieldUseCase } from './use-cases/create-target-field.use-case.js';

// Use Cases — Incidence Rules (FR-004)
export { CreateIncidenceRuleUseCase } from './use-cases/create-incidence-rule.use-case.js';
export { UpdateIncidenceRuleUseCase } from './use-cases/update-incidence-rule.use-case.js';
export { DeleteIncidenceRuleUseCase } from './use-cases/delete-incidence-rule.use-case.js';

// Use Cases — Routine Links (FR-010)
export { LinkRoutineUseCase } from './use-cases/link-routine.use-case.js';
export { UnlinkRoutineUseCase } from './use-cases/unlink-routine.use-case.js';

// Use Cases — Routines (FR-005, FR-007, FR-008)
export { CreateRoutineUseCase } from './use-cases/create-routine.use-case.js';
export { UpdateRoutineUseCase } from './use-cases/update-routine.use-case.js';
export { PublishRoutineUseCase } from './use-cases/publish-routine.use-case.js';
export { ForkRoutineUseCase } from './use-cases/fork-routine.use-case.js';

// Use Cases — Routine Items (FR-006)
export { CreateRoutineItemUseCase } from './use-cases/create-routine-item.use-case.js';
export { UpdateRoutineItemUseCase } from './use-cases/update-routine-item.use-case.js';
export { DeleteRoutineItemUseCase } from './use-cases/delete-routine-item.use-case.js';

// Use Cases — Engine (FR-009)
export { EvaluateRulesUseCase } from './use-cases/evaluate-rules.use-case.js';
