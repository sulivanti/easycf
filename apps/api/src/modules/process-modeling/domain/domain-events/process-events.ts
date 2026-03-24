/**
 * @contract DATA-003, DOC-ARC-003
 *
 * Domain event type definitions for MOD-005.
 * 19 events covering full CRUD lifecycle of all blueprint entities.
 * All events are sensitivity_level: 0 (no PII).
 */

import type { DomainEventBase } from '../../../foundation/domain/events/foundation-events.js';

export const PROCESS_EVENT_TYPES = {
  // Cycle lifecycle
  CYCLE_CREATED: 'process_modeling.cycle.created',
  CYCLE_UPDATED: 'process_modeling.cycle.updated',
  CYCLE_PUBLISHED: 'process_modeling.cycle.published',
  CYCLE_FORKED: 'process_modeling.cycle.forked',
  CYCLE_DEPRECATED: 'process_modeling.cycle.deprecated',
  CYCLE_DELETED: 'process_modeling.cycle.deleted',

  // Macro-stage
  MACRO_STAGE_CREATED: 'process_modeling.macro_stage.created',
  MACRO_STAGE_UPDATED: 'process_modeling.macro_stage.updated',
  MACRO_STAGE_DELETED: 'process_modeling.macro_stage.deleted',

  // Stage
  STAGE_CREATED: 'process_modeling.stage.created',
  STAGE_UPDATED: 'process_modeling.stage.updated',
  STAGE_DELETED: 'process_modeling.stage.deleted',

  // Gate
  GATE_CREATED: 'process_modeling.gate.created',
  GATE_UPDATED: 'process_modeling.gate.updated',
  GATE_DELETED: 'process_modeling.gate.deleted',

  // Stage-Role link
  STAGE_ROLE_LINKED: 'process_modeling.stage_role.linked',
  STAGE_ROLE_UNLINKED: 'process_modeling.stage_role.unlinked',

  // Transition
  TRANSITION_CREATED: 'process_modeling.transition.created',
  TRANSITION_DELETED: 'process_modeling.transition.deleted',
} as const;

export type ProcessEventType = (typeof PROCESS_EVENT_TYPES)[keyof typeof PROCESS_EVENT_TYPES];

export function createProcessEvent(params: {
  eventType: ProcessEventType;
  entityType?: string;
  entityId: string;
  tenantId: string;
  createdBy: string | null;
  correlationId: string;
  causationId?: string;
  payload: Record<string, unknown>;
}): DomainEventBase {
  const entityType = params.entityType ?? params.eventType.split('.').slice(0, 2).join('.');
  return {
    tenantId: params.tenantId,
    entityType,
    entityId: params.entityId,
    eventType: params.eventType,
    payload: params.payload,
    correlationId: params.correlationId,
    createdBy: params.createdBy,
    sensitivityLevel: 0,
    causationId: params.causationId,
  };
}
