/**
 * @contract DATA-002 (ERD), DOC-FND-000
 *
 * Drizzle ORM relations for the Departments entity (MOD-003 F05).
 * Enables the relational query builder (db.query.departments.findMany({ with: ... })).
 */

import { relations } from 'drizzle-orm';
import { departments } from './departments.js';
import { tenants } from './foundation.js';

// ---------------------------------------------------------------------------
// departments relations
// ---------------------------------------------------------------------------
export const departmentsRelations = relations(departments, ({ one }) => ({
  /** N:1 — tenant owner (isolation by tenant_id) */
  tenant: one(tenants, {
    fields: [departments.tenantId],
    references: [tenants.id],
  }),
}));
