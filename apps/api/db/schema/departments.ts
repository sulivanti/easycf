/**
 * @contract DATA-002, DOC-GNP-00, EX-DB-001, EX-NAME-001
 *
 * Drizzle ORM schema definition for the Departments entity (MOD-003 F05).
 * 1 table: departments (flat entity, per-tenant isolation via tenant_id).
 *
 * Key differences from org_units:
 * - Per-tenant (tenant_id FK) — NOT cross-tenant (ADR-003 does not apply)
 * - Flat entity (no parent_id, no hierarchy, no CTE)
 * - Unique(tenant_id, codigo) — not globally unique
 * - cor field (hex #RRGGBB) for colored tag display
 *
 * All FKs use ON DELETE RESTRICT (DATA-002).
 * Soft-delete via status INACTIVE + deleted_at.
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { tenants, users } from './foundation.js';

// ---------------------------------------------------------------------------
// departments — Departamentos por Tenant (DATA-002)
// ---------------------------------------------------------------------------
export const departments = pgTable(
  'departments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    codigo: varchar('codigo', { length: 50 }).notNull(),
    nome: varchar('nome', { length: 200 }).notNull(),
    descricao: text('descricao'),
    status: varchar('status', { length: 20 }).notNull().$type<'ACTIVE' | 'INACTIVE'>(),
    cor: varchar('cor', { length: 7 }),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // CHECK: status enum (DATA-002)
    check('departments_status_check', sql`${table.status} IN ('ACTIVE', 'INACTIVE')`),

    // CHECK: cor hex format #RRGGBB (BR-017, DATA-002)
    check('departments_cor_check', sql`${table.cor} IS NULL OR ${table.cor} ~ '^#[0-9A-Fa-f]{6}$'`),

    // UNIQUE(tenant_id, codigo) partial — active only (DATA-002, BR-013)
    uniqueIndex('idx_departments_tenant_codigo')
      .on(table.tenantId, table.codigo)
      .where(sql`${table.deletedAt} IS NULL`),

    // Lookup by tenant + status (DATA-002)
    index('idx_departments_tenant_status')
      .on(table.tenantId, table.status)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);
