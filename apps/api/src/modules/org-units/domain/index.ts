/**
 * @contract DATA-001, BR-001
 *
 * Organizational Structure domain layer — central re-export.
 */

// Entities
export { OrgUnit } from './entities/org-unit.entity.js';
export type {
  OrgUnitProps,
  OrgUnitNivel,
  OrgUnitStatus,
  CreateOrgUnitInput,
} from './entities/org-unit.entity.js';

export { OrgUnitTenantLink } from './entities/org-unit-tenant-link.entity.js';
export type {
  OrgUnitTenantLinkProps,
  CreateOrgUnitTenantLinkInput,
} from './entities/org-unit-tenant-link.entity.js';

// Events
export {
  createOrgUnitEvent,
  ORG_UNIT_OPERATION_IDS,
  ORG_UNIT_UI_ACTIONS,
  ORG_UNIT_EVENT_SENSITIVITY,
} from './events/org-unit-events.js';
export type { OrgUnitEventType, OrgUnitEntityType } from './events/org-unit-events.js';

// Errors
export {
  HierarchyLoopError,
  ActiveChildrenError,
  MaxLevelExceededError,
  InactiveParentError,
  ImmutableFieldError,
  TenantLinkLevelError,
  DuplicateCodigoError,
} from './errors/org-unit-errors.js';
