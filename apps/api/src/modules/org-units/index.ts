// Barrel export — public interface of module org-units (MOD-003)
// @contract DATA-001, FR-001, BR-001

// Domain — entities, errors, events
export {
  OrgUnit,
  OrgUnitTenantLink,
  createOrgUnitEvent,
  ORG_UNIT_OPERATION_IDS,
  ORG_UNIT_UI_ACTIONS,
  ORG_UNIT_EVENT_SENSITIVITY,
  HierarchyLoopError,
  ActiveChildrenError,
  MaxLevelExceededError,
  InactiveParentError,
  ImmutableFieldError,
  TenantLinkLevelError,
  DuplicateCodigoError,
} from './domain/index.js';
export type {
  OrgUnitProps,
  OrgUnitNivel,
  OrgUnitStatus,
  CreateOrgUnitInput as CreateOrgUnitEntityInput,
  OrgUnitTenantLinkProps,
  CreateOrgUnitTenantLinkInput,
  OrgUnitEventType,
  OrgUnitEntityType,
} from './domain/index.js';

// Application — use cases, ports
export {
  CreateOrgUnitUseCase,
  UpdateOrgUnitUseCase,
  DeleteOrgUnitUseCase,
  RestoreOrgUnitUseCase,
  GetOrgUnitUseCase,
  ListOrgUnitsUseCase,
  GetOrgUnitTreeUseCase,
  LinkTenantUseCase,
  UnlinkTenantUseCase,
} from './application/index.js';
export type {
  CreateOrgUnitInput,
  CreateOrgUnitOutput,
  UpdateOrgUnitInput,
  UpdateOrgUnitOutput,
  DeleteOrgUnitInput,
  RestoreOrgUnitInput,
  GetOrgUnitInput,
  GetOrgUnitOutput,
  ListOrgUnitsInput,
  OrgUnitListItem,
  ListOrgUnitsOutput,
  GetOrgUnitTreeOutput,
  LinkTenantInput,
  LinkTenantOutput,
  UnlinkTenantInput,
  OrgUnitRepository,
  OrgUnitTenantLinkRepository,
  OrgUnitTreeNode,
  TenantSummary,
  AncestorNode,
  OrgUnitListFilters,
} from './application/index.js';

// Presentation
export { orgUnitsRoutes } from './presentation/index.js';
