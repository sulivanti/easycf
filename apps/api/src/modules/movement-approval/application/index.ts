/**
 * @contract DOC-MOD-009
 *
 * Movement Approval application layer — central re-export.
 */

// Ports — Repositories
export type {
  ControlRuleRepository,
  ApprovalRuleRepository,
  MovementRepository,
  ApprovalInstanceRepository,
  MovementExecutionRepository,
  MovementHistoryRepository,
  OverrideLogRepository,
  UnitOfWork,
  TransactionContext,
  PaginatedResult,
  MovementHistoryEntry,
  OverrideLogEntry,
  MovementExecutionEntry,
} from './ports/repositories.js';

// Ports — Services
export type {
  DomainEventRepository,
  IdGeneratorService,
  CodigoGeneratorService,
} from './ports/services.js';

// Use Cases — Rules
export { ListControlRulesUseCase } from './use-cases/rules/list-control-rules.use-case.js';
export type {
  ListControlRulesInput,
  ListControlRulesOutput,
} from './use-cases/rules/list-control-rules.use-case.js';

export { CreateControlRuleUseCase } from './use-cases/rules/create-control-rule.use-case.js';
export type {
  CreateControlRuleInput,
  CreateControlRuleOutput,
} from './use-cases/rules/create-control-rule.use-case.js';

export { UpdateControlRuleUseCase } from './use-cases/rules/update-control-rule.use-case.js';
export type {
  UpdateControlRuleInput,
  UpdateControlRuleOutput,
} from './use-cases/rules/update-control-rule.use-case.js';

export { CreateApprovalRuleUseCase } from './use-cases/rules/create-approval-rule.use-case.js';
export type {
  CreateApprovalRuleInput,
  CreateApprovalRuleOutput,
} from './use-cases/rules/create-approval-rule.use-case.js';

export { UpdateApprovalRuleUseCase } from './use-cases/rules/update-approval-rule.use-case.js';
export type {
  UpdateApprovalRuleInput,
  UpdateApprovalRuleOutput,
} from './use-cases/rules/update-approval-rule.use-case.js';

// Use Cases — Engine
export { EvaluateMovementUseCase } from './use-cases/engine/evaluate-movement.use-case.js';
export type {
  EvaluateMovementInput,
  EvaluateMovementOutput,
} from './use-cases/engine/evaluate-movement.use-case.js';

// Use Cases — Movements
export { ListMovementsUseCase } from './use-cases/movements/list-movements.use-case.js';
export type {
  ListMovementsInput,
  ListMovementsOutput,
} from './use-cases/movements/list-movements.use-case.js';

export { GetMovementUseCase } from './use-cases/movements/get-movement.use-case.js';
export type {
  GetMovementInput,
  GetMovementOutput,
} from './use-cases/movements/get-movement.use-case.js';

export { CancelMovementUseCase } from './use-cases/movements/cancel-movement.use-case.js';
export type {
  CancelMovementInput,
  CancelMovementOutput,
} from './use-cases/movements/cancel-movement.use-case.js';

export { OverrideMovementUseCase } from './use-cases/movements/override-movement.use-case.js';
export type {
  OverrideMovementInput,
  OverrideMovementOutput,
} from './use-cases/movements/override-movement.use-case.js';

export { RetryMovementUseCase } from './use-cases/movements/retry-movement.use-case.js';
export type {
  RetryMovementInput,
  RetryMovementOutput,
} from './use-cases/movements/retry-movement.use-case.js';

// Use Cases — Approvals
export { ListMyApprovalsUseCase } from './use-cases/approvals/list-my-approvals.use-case.js';
export type {
  ListMyApprovalsInput,
  ListMyApprovalsOutput,
} from './use-cases/approvals/list-my-approvals.use-case.js';

export { ApproveMovementUseCase } from './use-cases/approvals/approve-movement.use-case.js';
export type {
  ApproveMovementInput,
  ApproveMovementOutput,
} from './use-cases/approvals/approve-movement.use-case.js';

export { RejectMovementUseCase } from './use-cases/approvals/reject-movement.use-case.js';
export type {
  RejectMovementInput,
  RejectMovementOutput,
} from './use-cases/approvals/reject-movement.use-case.js';
