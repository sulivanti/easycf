/**
 * @contract DATA-003, DOC-ARC-003 §1-§3, SEC-002
 *
 * Typed catalog of 6 domain events for the Organizational Structure module (MOD-003).
 * All events have sensitivity_level=0 (non-sensitive organizational data).
 * Persistence target: `domain_events` table (MOD-000).
 */

import type { DomainEventBase } from '../../../foundation/domain/events/foundation-events.js';
import { SYSTEM_TENANT_ID } from '../../../foundation/domain/events/foundation-events.js';

// ---------------------------------------------------------------------------
// Event type literal union
// ---------------------------------------------------------------------------
export type OrgUnitEventType =
  | 'org.unit_created'
  | 'org.unit_updated'
  | 'org.unit_deleted'
  | 'org.unit_restored'
  | 'org.tenant_linked'
  | 'org.tenant_unlinked';

// ---------------------------------------------------------------------------
// Entity type for domain_events.entity_type
// ---------------------------------------------------------------------------
export type OrgUnitEntityType = 'org_unit' | 'org_unit_tenant_link';

// ---------------------------------------------------------------------------
// Operation ID mapping (DOC-ARC-003)
// ---------------------------------------------------------------------------
export const ORG_UNIT_OPERATION_IDS: Record<OrgUnitEventType, string> = {
  'org.unit_created': 'org_units_create',
  'org.unit_updated': 'org_units_update',
  'org.unit_deleted': 'org_units_delete',
  'org.unit_restored': 'org_units_restore',
  'org.tenant_linked': 'org_units_link_tenant',
  'org.tenant_unlinked': 'org_units_unlink_tenant',
};

// ---------------------------------------------------------------------------
// UI Action mapping (DOC-ARC-003)
// ---------------------------------------------------------------------------
export const ORG_UNIT_UI_ACTIONS: Record<OrgUnitEventType, string[]> = {
  'org.unit_created': ['create'],
  'org.unit_updated': ['update'],
  'org.unit_deleted': ['delete'],
  'org.unit_restored': ['restore'],
  'org.tenant_linked': ['create'],
  'org.tenant_unlinked': ['delete'],
};

// ---------------------------------------------------------------------------
// Sensitivity — all 0 for MOD-003 (DATA-003)
// ---------------------------------------------------------------------------
export const ORG_UNIT_EVENT_SENSITIVITY: Record<OrgUnitEventType, 0> = {
  'org.unit_created': 0,
  'org.unit_updated': 0,
  'org.unit_deleted': 0,
  'org.unit_restored': 0,
  'org.tenant_linked': 0,
  'org.tenant_unlinked': 0,
};

// ---------------------------------------------------------------------------
// Factory — creates a domain event for org-units
// ---------------------------------------------------------------------------
export function createOrgUnitEvent(params: {
  tenantId?: string;
  entityType: OrgUnitEntityType;
  entityId: string;
  eventType: OrgUnitEventType;
  payload: Record<string, unknown>;
  correlationId: string;
  createdBy: string | null;
  causationId?: string;
  dedupeKey?: string;
}): DomainEventBase {
  return {
    // org_units is cross-tenant (ADR-003) — SYSTEM_TENANT_ID as sentinel (FR-001-C02)
    tenantId: params.tenantId || SYSTEM_TENANT_ID,
    entityType: params.entityType,
    entityId: params.entityId,
    eventType: params.eventType,
    payload: {
      ...params.payload,
      operation_id: ORG_UNIT_OPERATION_IDS[params.eventType],
      ui_actions: ORG_UNIT_UI_ACTIONS[params.eventType],
    },
    correlationId: params.correlationId,
    createdBy: params.createdBy,
    sensitivityLevel: ORG_UNIT_EVENT_SENSITIVITY[params.eventType],
    causationId: params.causationId,
    dedupeKey: params.dedupeKey,
  };
}
