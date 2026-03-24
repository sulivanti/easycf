/**
 * @contract DATA-003, DOC-ARC-003 §1-§3, SEC-002
 *
 * Typed catalog of 9 domain events for the Identity Advanced module (MOD-004).
 * All events have sensitivity_level=1 (internal identity data).
 * Persistence target: `domain_events` table (MOD-000).
 */

import type { DomainEventBase } from '../../../foundation/domain/events/foundation-events.js';

// ---------------------------------------------------------------------------
// Event type literal union (9 events — DATA-003)
// ---------------------------------------------------------------------------
export type IdentityEventType =
  // user_org_scopes (F01)
  | 'identity.org_scope_granted'
  | 'identity.org_scope_revoked'
  | 'identity.org_scope_expired'
  // access_shares (F02)
  | 'identity.share_created'
  | 'identity.share_revoked'
  | 'identity.share_expired'
  // access_delegations (F02)
  | 'identity.delegation_created'
  | 'identity.delegation_revoked'
  | 'identity.delegation_expired';

// ---------------------------------------------------------------------------
// Entity type for domain_events.entity_type
// ---------------------------------------------------------------------------
export type IdentityEntityType = 'user_org_scopes' | 'access_shares' | 'access_delegations';

// ---------------------------------------------------------------------------
// Operation ID mapping (DOC-ARC-003 §1, DATA-003)
// ---------------------------------------------------------------------------
export const IDENTITY_OPERATION_IDS: Record<IdentityEventType, string> = {
  'identity.org_scope_granted': 'admin_user_org_scopes_create',
  'identity.org_scope_revoked': 'admin_user_org_scopes_delete',
  'identity.org_scope_expired': 'expire_identity_grants',
  'identity.share_created': 'admin_access_shares_create',
  'identity.share_revoked': 'admin_access_shares_revoke',
  'identity.share_expired': 'expire_identity_grants',
  'identity.delegation_created': 'access_delegations_create',
  'identity.delegation_revoked': 'access_delegations_revoke',
  'identity.delegation_expired': 'expire_identity_grants',
};

// ---------------------------------------------------------------------------
// UI Action mapping (DOC-ARC-003 §2, DATA-003)
// ---------------------------------------------------------------------------
export const IDENTITY_UI_ACTIONS: Record<IdentityEventType, string[]> = {
  'identity.org_scope_granted': ['create'],
  'identity.org_scope_revoked': ['delete'],
  'identity.org_scope_expired': [],
  'identity.share_created': ['create'],
  'identity.share_revoked': ['delete'],
  'identity.share_expired': [],
  'identity.delegation_created': ['create'],
  'identity.delegation_revoked': ['delete'],
  'identity.delegation_expired': [],
};

// ---------------------------------------------------------------------------
// Sensitivity — all 1 for MOD-004 (DATA-003)
// ---------------------------------------------------------------------------
export const IDENTITY_EVENT_SENSITIVITY: Record<IdentityEventType, 1> = {
  'identity.org_scope_granted': 1,
  'identity.org_scope_revoked': 1,
  'identity.org_scope_expired': 1,
  'identity.share_created': 1,
  'identity.share_revoked': 1,
  'identity.share_expired': 1,
  'identity.delegation_created': 1,
  'identity.delegation_revoked': 1,
  'identity.delegation_expired': 1,
};

// ---------------------------------------------------------------------------
// Factory — creates a domain event for identity-advanced
// ---------------------------------------------------------------------------
export function createIdentityEvent(params: {
  tenantId: string;
  entityType: IdentityEntityType;
  entityId: string;
  eventType: IdentityEventType;
  payload: Record<string, unknown>;
  correlationId: string;
  createdBy: string | null;
  causationId?: string;
}): DomainEventBase {
  const eventType = params.eventType;
  return {
    tenantId: params.tenantId,
    entityType: params.entityType,
    entityId: params.entityId,
    eventType,
    payload: {
      ...params.payload,
      operation_id: IDENTITY_OPERATION_IDS[eventType],
      ui_actions: IDENTITY_UI_ACTIONS[eventType],
    },
    correlationId: params.correlationId,
    createdBy: params.createdBy,
    sensitivityLevel: IDENTITY_EVENT_SENSITIVITY[eventType],
    causationId: params.causationId,
    dedupeKey: `${eventType.replace('identity.', '')}:${params.entityId}`,
  };
}
