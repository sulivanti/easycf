/**
 * @contract DATA-003, DOC-ARC-003 §1-§3
 *
 * Typed catalog of all 36 Foundation domain events.
 * Used for type-safe event creation in use cases.
 * The actual persistence goes to `domain_events` table (DATA-000 §8).
 */

// ---------------------------------------------------------------------------
// Base event interface
// ---------------------------------------------------------------------------
export interface DomainEventBase {
  readonly tenantId: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly eventType: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly createdBy: string | null;
  readonly sensitivityLevel: 0 | 1 | 2 | 3;
  readonly dedupeKey?: string;
}

// ---------------------------------------------------------------------------
// Event type literal union (all 36 events)
// ---------------------------------------------------------------------------
export type FoundationEventType =
  // Auth (F01, F02, F03, F04, F10)
  | 'auth.login_success'
  | 'auth.login_failed'
  | 'auth.logout'
  | 'auth.password_changed'
  | 'auth.mfa_enabled'
  | 'auth.mfa_verified'
  | 'auth.mfa_failed'
  | 'auth.sso_login'
  | 'auth.sso_linked'
  | 'auth.token_reuse_detected'
  | 'auth.forgot_password_requested'
  | 'auth.password_reset'
  // Sessions (F01)
  | 'session.created'
  | 'session.revoked'
  | 'session.revoked_all'
  // Users (F05, F08)
  | 'user.created'
  | 'user.updated'
  | 'user.deleted'
  | 'user.profile_updated'
  | 'user.invite_resent'
  // Roles (F06, F12)
  | 'role.created'
  | 'role.updated'
  | 'role.deleted'
  // Tenants (F07)
  | 'tenant.created'
  | 'tenant.updated'
  | 'tenant.status_changed'
  | 'tenant.deleted'
  // Tenant-Users (F09)
  | 'tenant_user.added'
  | 'tenant_user.role_changed'
  | 'tenant_user.blocked'
  | 'tenant_user.removed'
  // Scopes (F10)
  | 'scope.created'
  | 'scope.updated'
  | 'scope.deleted'
  // Storage (F16)
  | 'storage.upload_completed'
  | 'storage.file_deleted';

// ---------------------------------------------------------------------------
// Entity type mapping (for entity_type field)
// ---------------------------------------------------------------------------
export type FoundationEntityType =
  | 'session'
  | 'user'
  | 'role'
  | 'tenant'
  | 'tenant_user'
  | 'scope'
  | 'storage_file';

// ---------------------------------------------------------------------------
// Sensitivity level per event type
// ---------------------------------------------------------------------------
export const EVENT_SENSITIVITY: Record<FoundationEventType, 0 | 1 | 2 | 3> = {
  'auth.login_success': 0,
  'auth.login_failed': 1,
  'auth.logout': 0,
  'auth.password_changed': 1,
  'auth.mfa_enabled': 1,
  'auth.mfa_verified': 0,
  'auth.mfa_failed': 1,
  'auth.sso_login': 0,
  'auth.sso_linked': 1,
  'auth.token_reuse_detected': 2,
  'auth.forgot_password_requested': 1,
  'auth.password_reset': 1,
  'session.created': 0,
  'session.revoked': 0,
  'session.revoked_all': 1,
  'user.created': 0,
  'user.updated': 0,
  'user.deleted': 1,
  'user.profile_updated': 0,
  'user.invite_resent': 1,
  'role.created': 0,
  'role.updated': 0,
  'role.deleted': 1,
  'tenant.created': 1,
  'tenant.updated': 0,
  'tenant.status_changed': 1,
  'tenant.deleted': 1,
  'tenant_user.added': 0,
  'tenant_user.role_changed': 1,
  'tenant_user.blocked': 1,
  'tenant_user.removed': 1,
  'scope.created': 0,
  'scope.updated': 0,
  'scope.deleted': 1,
  'storage.upload_completed': 0,
  'storage.file_deleted': 0,
};

// ---------------------------------------------------------------------------
// System tenant — used for pre-auth events (login, forgot-password, etc.)
// ---------------------------------------------------------------------------
export const SYSTEM_TENANT_ID = '00000000-0000-0000-0000-000000000000';

// ---------------------------------------------------------------------------
// Factory helper — creates a domain event with defaults
// ---------------------------------------------------------------------------
export function createFoundationEvent(params: {
  tenantId?: string;
  entityType: FoundationEntityType;
  entityId: string;
  eventType: FoundationEventType;
  payload: Record<string, unknown>;
  correlationId: string;
  createdBy: string | null;
  causationId?: string;
  dedupeKey?: string;
}): DomainEventBase {
  return {
    tenantId: params.tenantId || SYSTEM_TENANT_ID,
    entityType: params.entityType,
    entityId: params.entityId,
    eventType: params.eventType,
    payload: params.payload,
    correlationId: params.correlationId,
    createdBy: params.createdBy,
    sensitivityLevel: EVENT_SENSITIVITY[params.eventType],
    causationId: params.causationId ?? null,
    dedupeKey: params.dedupeKey ?? null,
  };
}
