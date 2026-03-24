/**
 * Typed catalog of all 13 Movement Approval domain events.
 * Used for type-safe event creation in use cases.
 * The actual persistence goes to `domain_events` table (DATA-000 §8).
 */

import type { DomainEventBase } from '../../../foundation/domain/events/foundation-events.js';

// ---------------------------------------------------------------------------
// Event type literal union (all 13 events)
// ---------------------------------------------------------------------------
export type MovementApprovalEventType =
  // Control Rules
  | 'approval.control_rule_created'
  | 'approval.control_rule_updated'
  | 'approval.approval_rule_created'
  // Movements
  | 'movement.created'
  | 'movement.approved'
  | 'movement.rejected'
  | 'movement.executed'
  | 'movement.failed'
  | 'movement.cancelled'
  | 'movement.overridden'
  | 'movement.escalated'
  | 'movement.timeout'
  | 'movement.auto_approved';

// ---------------------------------------------------------------------------
// Entity type mapping (for entity_type field)
// ---------------------------------------------------------------------------
export type MovementApprovalEntityType =
  | 'control_rule'
  | 'approval_rule'
  | 'controlled_movement'
  | 'approval_instance';

// ---------------------------------------------------------------------------
// Sensitivity level per event type
// ---------------------------------------------------------------------------
export const EVENT_SENSITIVITY: Record<MovementApprovalEventType, 0 | 1 | 2 | 3> = {
  'approval.control_rule_created': 0,
  'approval.control_rule_updated': 0,
  'approval.approval_rule_created': 0,
  'movement.created': 0,
  'movement.approved': 1,
  'movement.rejected': 1,
  'movement.executed': 0,
  'movement.failed': 1,
  'movement.cancelled': 0,
  'movement.overridden': 2,
  'movement.escalated': 1,
  'movement.timeout': 1,
  'movement.auto_approved': 1,
};

// ---------------------------------------------------------------------------
// Factory helper — creates a domain event with defaults
// ---------------------------------------------------------------------------
export function createMovementApprovalEvent(params: {
  tenantId: string;
  entityType: MovementApprovalEntityType;
  entityId: string;
  eventType: MovementApprovalEventType;
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
    sensitivityLevel: EVENT_SENSITIVITY[params.eventType],
    causationId: params.causationId,
    dedupeKey: params.dedupeKey,
  };
}
