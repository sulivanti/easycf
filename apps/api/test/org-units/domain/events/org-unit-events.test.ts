/**
 * Unit tests for the createOrgUnitEvent factory.
 * Prevents: Incident #3 (domain events with empty tenant_id).
 */

import { describe, it, expect } from 'vitest';
import {
  createOrgUnitEvent,
  type OrgUnitEventType,
  type OrgUnitEntityType,
  ORG_UNIT_OPERATION_IDS,
  ORG_UNIT_UI_ACTIONS,
  ORG_UNIT_EVENT_SENSITIVITY,
} from '../../../../src/modules/org-units/domain/events/org-unit-events.js';
import { SYSTEM_TENANT_ID } from '../../../../src/modules/foundation/domain/events/foundation-events.js';

const baseParams = {
  entityType: 'org_unit' as OrgUnitEntityType,
  entityId: 'ou-001',
  eventType: 'org.unit_created' as OrgUnitEventType,
  payload: { codigo: 'ROOT', nome: 'Root' },
  correlationId: 'corr-test',
  createdBy: 'usr-001',
};

describe('createOrgUnitEvent', () => {
  // ───────────────────────────────────────────────────────────────────────────
  // Incident #3: tenant_id must NEVER be empty string
  // ───────────────────────────────────────────────────────────────────────────

  it('uses SYSTEM_TENANT_ID when tenantId is omitted', () => {
    const event = createOrgUnitEvent(baseParams);

    expect(event.tenantId).toBe(SYSTEM_TENANT_ID);
    expect(event.tenantId).not.toBe('');
  });

  it('uses SYSTEM_TENANT_ID when tenantId is empty string (Incident #3)', () => {
    const event = createOrgUnitEvent({ ...baseParams, tenantId: '' });

    // The || operator in the factory should catch empty strings
    expect(event.tenantId).toBe(SYSTEM_TENANT_ID);
    expect(event.tenantId).not.toBe('');
  });

  it('uses provided tenantId when it is a valid UUID', () => {
    const tid = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const event = createOrgUnitEvent({ ...baseParams, tenantId: tid });

    expect(event.tenantId).toBe(tid);
  });

  // ───────────────────────────────────────────────────────────────────────────
  // Payload enrichment (DOC-ARC-003)
  // ───────────────────────────────────────────────────────────────────────────

  it('enriches payload with operation_id and ui_actions', () => {
    const event = createOrgUnitEvent(baseParams);

    expect(event.payload).toHaveProperty('operation_id', ORG_UNIT_OPERATION_IDS['org.unit_created']);
    expect(event.payload).toHaveProperty('ui_actions', ORG_UNIT_UI_ACTIONS['org.unit_created']);
    // Original payload fields preserved
    expect(event.payload).toHaveProperty('codigo', 'ROOT');
    expect(event.payload).toHaveProperty('nome', 'Root');
  });

  it('sets sensitivity_level from catalog', () => {
    const event = createOrgUnitEvent(baseParams);

    expect(event.sensitivityLevel).toBe(ORG_UNIT_EVENT_SENSITIVITY['org.unit_created']);
    expect(event.sensitivityLevel).toBe(0);
  });

  it('passes through correlationId, createdBy, causationId, dedupeKey', () => {
    const event = createOrgUnitEvent({
      ...baseParams,
      causationId: 'cause-001',
      dedupeKey: 'dedup-001',
    });

    expect(event.correlationId).toBe('corr-test');
    expect(event.createdBy).toBe('usr-001');
    expect(event.causationId).toBe('cause-001');
    expect(event.dedupeKey).toBe('dedup-001');
  });

  // ───────────────────────────────────────────────────────────────────────────
  // All event types produce valid events
  // ───────────────────────────────────────────────────────────────────────────

  const allTypes: OrgUnitEventType[] = [
    'org.unit_created',
    'org.unit_updated',
    'org.unit_deleted',
    'org.unit_restored',
    'org.tenant_linked',
    'org.tenant_unlinked',
  ];

  it.each(allTypes)('produces valid event for type: %s', (eventType) => {
    const entityType = eventType.startsWith('org.tenant')
      ? ('org_unit_tenant_link' as const)
      : ('org_unit' as const);

    const event = createOrgUnitEvent({
      ...baseParams,
      eventType,
      entityType,
    });

    expect(event.eventType).toBe(eventType);
    expect(event.entityType).toBe(entityType);
    expect(event.tenantId).toBe(SYSTEM_TENANT_ID);
    expect(event.tenantId).not.toBe('');
    expect(event.payload).toHaveProperty('operation_id');
    expect(event.payload).toHaveProperty('ui_actions');
  });
});
