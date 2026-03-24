/**
 * @contract DATA-001, DOC-GNP-00, EX-DB-001, EX-NAME-001
 *
 * Drizzle ORM schema definitions for the Organizational Structure module (MOD-003).
 * 2 tables: org_units (N1–N4 hierarchy), org_unit_tenant_links (N4→N5 tenant binding).
 *
 * All FKs use ON DELETE RESTRICT (BR-004 / DATA-001).
 * Soft-delete via status INACTIVE + deleted_at (LGPD compliance).
 * Tree integrity enforced at application layer (CTE loop prevention, nivel derivation).
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  timestamp,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { tenants } from './foundation.js';

// ---------------------------------------------------------------------------
// 1. org_units — Unidades Organizacionais N1–N4 (DATA-001 §org_units)
// ---------------------------------------------------------------------------
export const orgUnits = pgTable(
  'org_units',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    codigo: varchar('codigo', { length: 50 }).notNull().unique(),
    nome: varchar('nome', { length: 200 }).notNull(),
    descricao: text('descricao'),
    nivel: integer('nivel').notNull(),
    parentId: uuid('parent_id'),
    status: text('status').notNull().$type<'ACTIVE' | 'INACTIVE'>(),
    createdBy: uuid('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // Self-referencing FK — parent hierarchy (ON DELETE RESTRICT)
    // Note: Drizzle does not support self-referencing .references() inline;
    // the FK is declared via raw SQL in migration or via explicit reference below.

    // CHECK: nivel must be 1–4 (DATA-001: N1=Corporate Group, N2=Unit, N3=Macro-area, N4=Sub-unit)
    check('org_units_nivel_check', sql`${table.nivel} >= 1 AND ${table.nivel} <= 4`),

    // CHECK: status enum
    check('org_units_status_check', sql`${table.status} IN ('ACTIVE', 'INACTIVE')`),

    // CHECK: N1 must have null parent, N2–N4 must have non-null parent
    check(
      'org_units_parent_check',
      sql`(${table.nivel} = 1 AND ${table.parentId} IS NULL) OR (${table.nivel} > 1 AND ${table.parentId} IS NOT NULL)`,
    ),

    // Indexes (DATA-001)
    index('idx_org_units_codigo').on(table.codigo),
    index('idx_org_units_parent').on(table.parentId),
    index('idx_org_units_nivel').on(table.nivel),

    // Partial index: active units only (DATA-001)
    index('idx_org_units_status')
      .on(table.status)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);

// ---------------------------------------------------------------------------
// 2. org_unit_tenant_links — Vinculação N4→N5/Tenant (DATA-001 §org_unit_tenant_links)
// ---------------------------------------------------------------------------
export const orgUnitTenantLinks = pgTable(
  'org_unit_tenant_links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    orgUnitId: uuid('org_unit_id')
      .notNull()
      .references(() => orgUnits.id, { onDelete: 'restrict' }),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    createdBy: uuid('created_by'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // UNIQUE(org_unit_id, tenant_id) — partial, only active links (DATA-001)
    uniqueIndex('idx_outl_org_unit_tenant')
      .on(table.orgUnitId, table.tenantId)
      .where(sql`${table.deletedAt} IS NULL`),

    // Lookup by org_unit (partial: active links only)
    index('idx_outl_org_unit')
      .on(table.orgUnitId)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);
