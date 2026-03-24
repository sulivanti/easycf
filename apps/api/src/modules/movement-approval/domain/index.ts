/**
 * Movement Approval domain layer — central re-export.
 */

// Entities
export { ControlledMovement } from './entities/controlled-movement.entity.js';
export type { ControlledMovementProps } from './entities/controlled-movement.entity.js';

export { MovementControlRule } from './entities/movement-control-rule.entity.js';
export type {
  MovementControlRuleProps,
  ControlRuleStatus,
} from './entities/movement-control-rule.entity.js';

export { ApprovalRule } from './entities/approval-rule.entity.js';
export type { ApprovalRuleProps, ApproverType } from './entities/approval-rule.entity.js';

export { ApprovalInstance } from './entities/approval-instance.entity.js';
export type {
  ApprovalInstanceProps,
  ApprovalInstanceStatus,
} from './entities/approval-instance.entity.js';

// Value Objects
export type { MovementStatus } from './value-objects/movement-status.vo.js';
export {
  MOVEMENT_STATUS_TRANSITIONS,
  isValidMovementTransition,
} from './value-objects/movement-status.vo.js';
export type { ApprovalDecision } from './value-objects/approval-decision.vo.js';
export type { OriginType } from './value-objects/origin-type.vo.js';
export type { ApprovalCriteria } from './value-objects/approval-criteria.vo.js';

// Events
export {
  createMovementApprovalEvent,
  EVENT_SENSITIVITY,
} from './events/movement-approval-events.js';
export type {
  MovementApprovalEventType,
  MovementApprovalEntityType,
} from './events/movement-approval-events.js';

// Errors
export {
  MovementNotFoundError,
  ControlRuleNotFoundError,
  InvalidMovementTransitionError,
  SegregationViolationError,
  InsufficientJustificationError,
  InsufficientOpinionError,
  MovementNotPendingError,
  ControlRuleInactiveError,
} from './errors/movement-approval-errors.js';

// Domain Services
export { ControlEngine } from './services/control-engine.service.js';
export type { ControlEvaluation } from './services/control-engine.service.js';
export { ApprovalChainResolver } from './services/approval-chain-resolver.service.js';
export { OverrideAuditor } from './services/override-auditor.service.js';
export { AutoApprovalService } from './services/auto-approval.service.js';
