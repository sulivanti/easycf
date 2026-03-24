/**
 * @contract DATA-003, DOC-ARC-003, SEC-002
 *
 * Domain event type definitions for MOD-007.
 * 14 events covering the full lifecycle of framers, routines, and evaluation.
 * All events are sensitivity_level: 1 (operational, no PII).
 */

import type { DomainEventBase } from '../../../foundation/domain/events/foundation-events.js';

export const PARAM_EVENT_TYPES = {
  // Framer types (F01)
  FRAMER_TYPE_CREATED: 'framer_type.created',

  // Framers (F01)
  FRAMER_CREATED: 'framer.created',
  FRAMER_UPDATED: 'framer.updated',
  FRAMER_EXPIRED: 'framer.expired',

  // Incidence rules (F01)
  INCIDENCE_RULE_CREATED: 'incidence_rule.created',
  INCIDENCE_RULE_UPDATED: 'incidence_rule.updated',

  // Routines (F02)
  ROUTINE_CREATED: 'routine.created',
  ROUTINE_PUBLISHED: 'routine.published',
  ROUTINE_FORKED: 'routine.forked',
  ROUTINE_DEPRECATED: 'routine.deprecated',
  ROUTINE_ITEM_ADDED: 'routine.item_added',

  // Incidence links (F02 — INT-007)
  ROUTINE_INCIDENCE_LINKED: 'routine.incidence_linked',
  ROUTINE_INCIDENCE_UNLINKED: 'routine.incidence_unlinked',

  // Evaluation engine (F03)
  ROUTINE_APPLIED: 'routine.applied',
} as const;

export type ParamEventType = (typeof PARAM_EVENT_TYPES)[keyof typeof PARAM_EVENT_TYPES];

export function createParamEvent(params: {
  eventType: ParamEventType;
  entityType?: string;
  entityId: string;
  tenantId: string;
  createdBy: string | null;
  correlationId: string;
  causationId?: string;
  payload: Record<string, unknown>;
}): DomainEventBase {
  const entityType = params.entityType ?? params.eventType.split('.')[0];
  return {
    tenantId: params.tenantId,
    entityType,
    entityId: params.entityId,
    eventType: params.eventType,
    payload: params.payload,
    correlationId: params.correlationId,
    createdBy: params.createdBy,
    sensitivityLevel: 1,
    causationId: params.causationId,
  };
}
