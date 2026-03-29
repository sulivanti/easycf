/**
 * @contract DATA-001, DATA-001-M01, DOC-FND-000, DOC-GNP-00
 *
 * Module-level re-export of Org-Units Drizzle tables with inferred
 * TypeScript types and Zod validation schemas for use in domain/application layers.
 *
 * Usage:
 *   import { type SelectOrgUnit, insertOrgUnitSchema, orgUnits } from "@modules/org-units/infrastructure/schema.js";
 */

import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Re-export tables for direct usage
export { orgUnits, orgUnitTenantLinks } from '../../../../db/schema/org-units.js';

// Re-export relations
export {
  orgUnitsRelations,
  orgUnitTenantLinksRelations,
} from '../../../../db/schema/org-units.relations.js';

// ---------------------------------------------------------------------------
// Inferred Types — Select (read from DB)
// ---------------------------------------------------------------------------
import { orgUnits, orgUnitTenantLinks } from '../../../../db/schema/org-units.js';

export type SelectOrgUnit = InferSelectModel<typeof orgUnits>;
export type SelectOrgUnitTenantLink = InferSelectModel<typeof orgUnitTenantLinks>;

// ---------------------------------------------------------------------------
// Inferred Types — Insert (write to DB)
// ---------------------------------------------------------------------------
export type InsertOrgUnit = InferInsertModel<typeof orgUnits>;
export type InsertOrgUnitTenantLink = InferInsertModel<typeof orgUnitTenantLinks>;

// ---------------------------------------------------------------------------
// Zod Validation Schemas — Insert (validate-drizzle Rule 3)
// ---------------------------------------------------------------------------
export const insertOrgUnitSchema = createInsertSchema(orgUnits);
export const insertOrgUnitTenantLinkSchema = createInsertSchema(orgUnitTenantLinks);

// ---------------------------------------------------------------------------
// Zod Validation Schemas — Select (for API response typing)
// ---------------------------------------------------------------------------
export const selectOrgUnitSchema = createSelectSchema(orgUnits);
export const selectOrgUnitTenantLinkSchema = createSelectSchema(orgUnitTenantLinks);

// ---------------------------------------------------------------------------
// Status literal types (derived from DATA-001 CHECK constraints)
// ---------------------------------------------------------------------------
export type OrgUnitStatus = 'ACTIVE' | 'INACTIVE';
export type OrgUnitNivel = 1 | 2 | 3 | 4;
