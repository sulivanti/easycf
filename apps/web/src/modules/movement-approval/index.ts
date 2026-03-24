/**
 * @contract MOD-009
 * Movement Approval module barrel export — types, API client, hooks, components, pages.
 */

// Types
export * from './types/index.js';

// API client
export { movementApprovalApi } from './api/movement-approval.api.js';

// Hooks
export {
  useControlRules,
  useControlRule,
  useCreateControlRule,
  useUpdateControlRule,
  useDeleteControlRule,
  useCreateApprovalRule,
  useUpdateApprovalRule,
  useDeleteApprovalRule,
  CONTROL_RULES_KEY,
  CONTROL_RULE_DETAIL_KEY,
} from './hooks/use-control-rules.js';
export {
  useMovements,
  useMovementDetail,
  useCancelMovement,
  useOverrideMovement,
  useRetryMovement,
  MOVEMENTS_KEY,
  MOVEMENT_DETAIL_KEY,
} from './hooks/use-movements.js';
export {
  useMyApprovals,
  useApproveMovement,
  useRejectMovement,
  usePendingCount,
  APPROVALS_KEY,
  PENDING_COUNT_KEY,
} from './hooks/use-approvals.js';
export { useEvaluate } from './hooks/use-engine.js';

// Components
export {
  MovementCard,
  MovementDetailPanel,
  ApproveRejectForm,
  OverrideModal,
  ControlRuleDrawer,
  ApprovalChainEditor,
  OriginBadge,
  CountdownTimer,
  PendingBadge,
} from './components/index.js';

// Pages
export { ApprovalInboxPage } from './pages/inbox/ApprovalInboxPage.js';
export { RulesConfigPage } from './pages/config/RulesConfigPage.js';
