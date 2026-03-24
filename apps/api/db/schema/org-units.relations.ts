/**
 * @contract DATA-001 (ERD), DOC-FND-000
 *
 * Drizzle ORM relations for the Organizational Structure module (MOD-003).
 * Enables the relational query builder (db.query.orgUnits.findMany({ with: ... })).
 */

import { relations } from 'drizzle-orm';
import { orgUnits, orgUnitTenantLinks } from './org-units.js';
import { tenants } from './foundation.js';

// ---------------------------------------------------------------------------
// org_units relations
// ---------------------------------------------------------------------------
export const orgUnitsRelations = relations(orgUnits, ({ one, many }) => ({
  /** N:1 — parent node (self-referencing hierarchy) */
  parent: one(orgUnits, {
    fields: [orgUnits.parentId],
    references: [orgUnits.id],
    relationName: 'orgUnitParentChild',
  }),
  /** 1:N — child nodes */
  children: many(orgUnits, {
    relationName: 'orgUnitParentChild',
  }),
  /** 1:N — tenant links (N4→N5) */
  tenantLinks: many(orgUnitTenantLinks),
}));

// ---------------------------------------------------------------------------
// org_unit_tenant_links relations
// ---------------------------------------------------------------------------
export const orgUnitTenantLinksRelations = relations(orgUnitTenantLinks, ({ one }) => ({
  /** N:1 — organizational unit (must be N4) */
  orgUnit: one(orgUnits, {
    fields: [orgUnitTenantLinks.orgUnitId],
    references: [orgUnits.id],
  }),
  /** N:1 — tenant/filial (Foundation MOD-000) */
  tenant: one(tenants, {
    fields: [orgUnitTenantLinks.tenantId],
    references: [tenants.id],
  }),
}));
