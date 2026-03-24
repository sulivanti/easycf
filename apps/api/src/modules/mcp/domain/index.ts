/**
 * MCP Automation domain layer — central re-export.
 */

// Aggregate Root
export { McpAgent } from './aggregates/mcp-agent.js';
export type { McpAgentProps } from './aggregates/mcp-agent.js';

// Entities
export { McpAction } from './entities/mcp-action.js';
export type { McpActionProps } from './entities/mcp-action.js';

// Value Objects
export type { AgentStatus } from './value-objects/agent-status.js';
export { isValidAgentTransition, isTerminalAgentStatus } from './value-objects/agent-status.js';

export type { ExecutionPolicy } from './value-objects/execution-policy.js';

export type { ActionTypeCode, ActionTypeProps } from './value-objects/action-type.js';
export { ACTION_TYPE_SEEDS } from './value-objects/action-type.js';

export type { ExecutionStatus } from './value-objects/execution-status.js';
export {
  isValidExecutionTransition,
  isTerminalExecutionStatus,
} from './value-objects/execution-status.js';

// Domain Events
export { createMcpEvent, MCP_EVENT_SENSITIVITY } from './domain-events/mcp-events.js';
export type { McpEventType, McpEntityType } from './domain-events/mcp-events.js';

// Domain Services
export { ScopeBlocklistValidator } from './domain-services/scope-blocklist-validator.js';
export type { ScopeValidationResult } from './domain-services/scope-blocklist-validator.js';

// Errors
export {
  McpApiKeyInvalidError,
  AgentRevokedError,
  AgentInactiveError,
  AgentActionLinkExpiredError,
  AgentActionLinkNotFoundError,
  AgentMissingScopesError,
  PrivilegeEscalationError,
  McpActionNotFoundError,
  McpAgentNotFoundError,
  AgentActionLinkDuplicateError,
  ScopeBlockedError,
  Phase2CreateNotEnabledError,
  DirectPolicyNotAllowedError,
  AgentRevokedCannotReactivateError,
  InvalidAgentTransitionError,
  RevocationReasonRequiredError,
  CanApproveInvariantError,
} from './errors/mcp-errors.js';
