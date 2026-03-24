/**
 * @contract FR-001, FR-002, FR-003, FR-004, FR-005, SEC-001
 *
 * Organizational Structure application layer — central re-export.
 */

// Ports
export type {
  OrgUnitRepository,
  OrgUnitTenantLinkRepository,
  OrgUnitTreeNode,
  TenantSummary,
  AncestorNode,
  OrgUnitListFilters,
} from './ports/repositories.js';

// Use Cases — CRUD
export { CreateOrgUnitUseCase } from './use-cases/create-org-unit.use-case.js';
export type {
  CreateOrgUnitInput,
  CreateOrgUnitOutput,
} from './use-cases/create-org-unit.use-case.js';

export { UpdateOrgUnitUseCase } from './use-cases/update-org-unit.use-case.js';
export type {
  UpdateOrgUnitInput,
  UpdateOrgUnitOutput,
} from './use-cases/update-org-unit.use-case.js';

export { DeleteOrgUnitUseCase } from './use-cases/delete-org-unit.use-case.js';
export type { DeleteOrgUnitInput } from './use-cases/delete-org-unit.use-case.js';

export { RestoreOrgUnitUseCase } from './use-cases/restore-org-unit.use-case.js';
export type { RestoreOrgUnitInput } from './use-cases/restore-org-unit.use-case.js';

// Use Cases — Query
export { GetOrgUnitUseCase } from './use-cases/get-org-unit.use-case.js';
export type { GetOrgUnitInput, GetOrgUnitOutput } from './use-cases/get-org-unit.use-case.js';

export { ListOrgUnitsUseCase } from './use-cases/list-org-units.use-case.js';
export type {
  ListOrgUnitsInput,
  OrgUnitListItem,
  ListOrgUnitsOutput,
} from './use-cases/list-org-units.use-case.js';

export { GetOrgUnitTreeUseCase } from './use-cases/get-org-unit-tree.use-case.js';
export type { GetOrgUnitTreeOutput } from './use-cases/get-org-unit-tree.use-case.js';

// Use Cases — Tenant Links
export { LinkTenantUseCase } from './use-cases/link-tenant.use-case.js';
export type { LinkTenantInput, LinkTenantOutput } from './use-cases/link-tenant.use-case.js';

export { UnlinkTenantUseCase } from './use-cases/unlink-tenant.use-case.js';
export type { UnlinkTenantInput } from './use-cases/unlink-tenant.use-case.js';
