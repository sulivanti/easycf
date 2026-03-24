/**
 * @contract DATA-003 (MOD-010), DOC-ARC-003 §1-§3
 *
 * Typed catalog of all 10 MCP Automation domain events.
 * Used for type-safe event creation in use cases.
 * The actual persistence goes to `domain_events` table (DATA-000 §8).
 */

import type { DomainEventBase } from '../../../foundation/domain/events/foundation-events.js';

// ---------------------------------------------------------------------------
// Event type literal union (all 10 events — DATA-003 EVT-001..EVT-010)
// ---------------------------------------------------------------------------
export type McpEventType =
  | 'mcp.agent.created' // EVT-001
  | 'mcp.agent.updated' // EVT-002
  | 'mcp.agent.scopes_updated' // EVT-003
  | 'mcp.agent.revoked' // EVT-004
  | 'mcp.agent.key_rotated' // EVT-005
  | 'mcp.agent.action_granted' // EVT-006
  | 'mcp.agent.action_revoked' // EVT-007
  | 'mcp.execution.completed' // EVT-008
  | 'mcp.execution.blocked' // EVT-009
  | 'mcp.privilege_escalation_attempt'; // EVT-010

// ---------------------------------------------------------------------------
// Entity type mapping (for entity_type field)
// ---------------------------------------------------------------------------
export type McpEntityType = 'mcp.agent' | 'mcp.action' | 'mcp.agent_action_link' | 'mcp.execution';

// ---------------------------------------------------------------------------
// Sensitivity level per event type (DATA-003)
// ---------------------------------------------------------------------------
export const MCP_EVENT_SENSITIVITY: Record<McpEventType, 0 | 1 | 2 | 3> = {
  'mcp.agent.created': 1,
  'mcp.agent.updated': 1,
  'mcp.agent.scopes_updated': 1,
  'mcp.agent.revoked': 1,
  'mcp.agent.key_rotated': 1,
  'mcp.agent.action_granted': 1,
  'mcp.agent.action_revoked': 1,
  'mcp.execution.completed': 1,
  'mcp.execution.blocked': 1,
  'mcp.privilege_escalation_attempt': 2, // EVT-010: escalada de privilégio
};

// ---------------------------------------------------------------------------
// Factory helper — creates a domain event with defaults
// ---------------------------------------------------------------------------
export function createMcpEvent(params: {
  tenantId: string;
  entityType: McpEntityType;
  entityId: string;
  eventType: McpEventType;
  payload: Record<string, unknown>;
  correlationId: string;
  createdBy: string | null;
  causationId?: string;
  dedupeKey?: string;
}): DomainEventBase {
  return {
    tenantId: params.tenantId,
    entityType: params.entityType,
    entityId: params.entityId,
    eventType: params.eventType,
    payload: params.payload,
    correlationId: params.correlationId,
    createdBy: params.createdBy,
    sensitivityLevel: MCP_EVENT_SENSITIVITY[params.eventType],
    causationId: params.causationId,
    dedupeKey: params.dedupeKey,
  };
}
