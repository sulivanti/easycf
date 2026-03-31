/**
 * @contract UX-001-C04, FR-003
 * Hook wrapping the link tenant mutation with idempotency key regeneration.
 * Re-exports useLinkTenant from use-org-unit-actions for convenience.
 * This hook is used exclusively by LinkTenantModal.
 */

export { useLinkTenant } from './use-org-unit-actions.js';
