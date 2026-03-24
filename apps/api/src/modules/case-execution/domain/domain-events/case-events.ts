/**
 * @contract DATA-003, DOC-ARC-003
 *
 * Domain event type definitions for MOD-006.
 * 11 events covering the full case lifecycle, gates, assignments and events.
 * All events are sensitivity_level: 1 (operational data with business info).
 */

export const CASE_EXECUTION_EVENT_TYPES = {
  // Case lifecycle
  CASE_OPENED: 'case_execution.case.opened',
  CASE_STAGE_TRANSITIONED: 'case_execution.case.stage_transitioned',
  CASE_COMPLETED: 'case_execution.case.completed',
  CASE_CANCELLED: 'case_execution.case.cancelled',
  CASE_ON_HOLD: 'case_execution.case.on_hold',
  CASE_RESUMED: 'case_execution.case.resumed',

  // Gates
  GATE_RESOLVED: 'case_execution.gate.resolved',
  GATE_WAIVED: 'case_execution.gate.waived',

  // Assignments
  ASSIGNMENT_CREATED: 'case_execution.assignment.created',
  ASSIGNMENT_REPLACED: 'case_execution.assignment.replaced',

  // Events
  EVENT_RECORDED: 'case_execution.event.recorded',
} as const;

export type CaseExecutionEventType =
  (typeof CASE_EXECUTION_EVENT_TYPES)[keyof typeof CASE_EXECUTION_EVENT_TYPES];

export interface CaseExecutionEventPayload {
  eventType: CaseExecutionEventType;
  entityType: string;
  entityId: string;
  tenantId: string;
  createdBy: string;
  correlationId: string;
  causationId?: string;
  sensitivityLevel: 1;
  data: Record<string, unknown>;
}

export function createCaseExecutionEvent(
  params: Omit<CaseExecutionEventPayload, 'entityType' | 'sensitivityLevel'> & {
    entityType?: string;
  },
): CaseExecutionEventPayload {
  const entityType = params.entityType ?? params.eventType.split('.').slice(0, 2).join('.');
  return { ...params, entityType, sensitivityLevel: 1 };
}
