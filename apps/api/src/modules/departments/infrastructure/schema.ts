/**
 * @contract DATA-002, DOC-FND-000, DOC-GNP-00
 *
 * Module-level re-export of Departments Drizzle table with inferred
 * TypeScript types and Zod validation schemas for use in domain/application layers.
 *
 * Usage:
 *   import { type SelectDepartment, insertDepartmentSchema, departments } from "@modules/departments/infrastructure/schema.js";
 */

import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

// Re-export table for direct usage
export { departments } from '../../../../db/schema/departments.js';

// Re-export relations
export { departmentsRelations } from '../../../../db/schema/departments.relations.js';

// ---------------------------------------------------------------------------
// Inferred Types — Select (read from DB)
// ---------------------------------------------------------------------------
import { departments } from '../../../../db/schema/departments.js';

export type SelectDepartment = InferSelectModel<typeof departments>;

// ---------------------------------------------------------------------------
// Inferred Types — Insert (write to DB)
// ---------------------------------------------------------------------------
export type InsertDepartment = InferInsertModel<typeof departments>;

// ---------------------------------------------------------------------------
// Zod Validation Schemas — Insert (validate-drizzle Rule 3)
// ---------------------------------------------------------------------------
export const insertDepartmentSchema = createInsertSchema(departments);

// ---------------------------------------------------------------------------
// Zod Validation Schemas — Select (for API response typing)
// ---------------------------------------------------------------------------
export const selectDepartmentSchema = createSelectSchema(departments);

// ---------------------------------------------------------------------------
// Status literal types (derived from DATA-002 CHECK constraints)
// ---------------------------------------------------------------------------
export type DepartmentStatus = 'ACTIVE' | 'INACTIVE';
