/**
 * @contract DATA-002, SEC-002-M01, DOC-ARC-003 §1-§3
 *
 * Typed catalog of 4 domain events for the Departments entity (MOD-003 F05).
 * All events have sensitivity_level=0 (non-sensitive organizational data).
 * Persistence target: `domain_events` table (MOD-000).
 *
 * Key difference from org_units: departments are per-tenant, so tenantId
 * is always the real tenant (not SYSTEM_TENANT_ID).
 */

import type { DomainEventBase } from '../../../foundation/domain/events/foundation-events.js';

// ---------------------------------------------------------------------------
// Event type literal union
// ---------------------------------------------------------------------------
export type DepartmentEventType =
  | 'org.dept_created'
  | 'org.dept_updated'
  | 'org.dept_deleted'
  | 'org.dept_restored';

// ---------------------------------------------------------------------------
// Entity type for domain_events.entity_type
// ---------------------------------------------------------------------------
export type DepartmentEntityType = 'department';

// ---------------------------------------------------------------------------
// Operation ID mapping (SEC-002-M01)
// ---------------------------------------------------------------------------
export const DEPARTMENT_OPERATION_IDS: Record<DepartmentEventType, string> = {
  'org.dept_created': 'departments_create',
  'org.dept_updated': 'departments_update',
  'org.dept_deleted': 'departments_delete',
  'org.dept_restored': 'departments_restore',
};

// ---------------------------------------------------------------------------
// UI Action mapping (DOC-ARC-003)
// ---------------------------------------------------------------------------
export const DEPARTMENT_UI_ACTIONS: Record<DepartmentEventType, string[]> = {
  'org.dept_created': ['create'],
  'org.dept_updated': ['update'],
  'org.dept_deleted': ['delete'],
  'org.dept_restored': ['restore'],
};

// ---------------------------------------------------------------------------
// Sensitivity — all 0 for departments (SEC-002-M01)
// ---------------------------------------------------------------------------
export const DEPARTMENT_EVENT_SENSITIVITY: Record<DepartmentEventType, 0> = {
  'org.dept_created': 0,
  'org.dept_updated': 0,
  'org.dept_deleted': 0,
  'org.dept_restored': 0,
};

// ---------------------------------------------------------------------------
// Factory — creates a domain event for departments
// ---------------------------------------------------------------------------
export function createDepartmentEvent(params: {
  tenantId: string;
  entityId: string;
  eventType: DepartmentEventType;
  payload: Record<string, unknown>;
  correlationId: string;
  createdBy: string | null;
  causationId?: string;
  dedupeKey?: string;
}): DomainEventBase {
  return {
    // departments are per-tenant — always use the real tenantId (not SYSTEM_TENANT_ID)
    tenantId: params.tenantId,
    entityType: 'department' as DepartmentEntityType,
    entityId: params.entityId,
    eventType: params.eventType,
    payload: {
      ...params.payload,
      operation_id: DEPARTMENT_OPERATION_IDS[params.eventType],
      ui_actions: DEPARTMENT_UI_ACTIONS[params.eventType],
    },
    correlationId: params.correlationId,
    createdBy: params.createdBy,
    sensitivityLevel: DEPARTMENT_EVENT_SENSITIVITY[params.eventType],
    causationId: params.causationId,
    dedupeKey: params.dedupeKey,
  };
}
