/**
 * @contract DATA-007, DATA-003, DOC-FND-000, DOC-GNP-00, ADR-001, ADR-002, ADR-003, ADR-004, ADR-005
 *
 * Drizzle ORM schema definitions for the Contextual Params module (MOD-007).
 * 9 tables: context_framer_types, context_framers, target_objects, target_fields,
 * incidence_rules, behavior_routines, routine_items, routine_incidence_links,
 * routine_version_history.
 *
 * Aggregate Root: behavior_routines — controls invariants for routine lifecycle.
 * All FKs use ON DELETE RESTRICT except child tables which use CASCADE (DATA-007).
 * Soft-delete via deleted_at on context_framers and behavior_routines.
 * Campo `priority` removed from incidence_rules (ADR-002) — conflict resolution by restrictiveness.
 * No cache anywhere (ADR-001, ADR-005).
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users, tenants } from './foundation.js';

// ---------------------------------------------------------------------------
// 1. context_framer_types — Catálogo de Tipos de Enquadrador (DATA-007 E-001)
// ---------------------------------------------------------------------------
export const contextFramerTypes = pgTable(
  'context_framer_types',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    codigo: varchar('codigo', { length: 50 }).notNull(),
    nome: varchar('nome', { length: 200 }).notNull(),
    descricao: text('descricao'),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('idx_framer_types_tenant_codigo').on(table.tenantId, table.codigo)],
);

// ---------------------------------------------------------------------------
// 2. context_framers — Enquadradores de Contexto (DATA-007 E-002)
// ---------------------------------------------------------------------------
export const contextFramers = pgTable(
  'context_framers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    codigo: varchar('codigo', { length: 50 }).notNull(),
    nome: varchar('nome', { length: 200 }).notNull(),
    framerTypeId: uuid('framer_type_id')
      .notNull()
      .references(() => contextFramerTypes.id, { onDelete: 'restrict' }),
    status: text('status').notNull().default('ACTIVE').$type<'ACTIVE' | 'INACTIVE'>(),
    version: integer('version').notNull().default(1),
    validFrom: timestamp('valid_from', { withTimezone: true }).notNull(),
    validUntil: timestamp('valid_until', { withTimezone: true }),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('idx_framers_tenant_codigo').on(table.tenantId, table.codigo),
    index('idx_framers_type_status')
      .on(table.framerTypeId, table.status)
      .where(sql`${table.deletedAt} IS NULL`),
    index('idx_framers_vigencia')
      .on(table.validFrom, table.validUntil)
      .where(sql`${table.status} = 'ACTIVE' AND ${table.deletedAt} IS NULL`),
    index('idx_framers_tenant_status')
      .on(table.tenantId, table.status)
      .where(sql`${table.deletedAt} IS NULL`),
    check('context_framers_status_check', sql`${table.status} IN ('ACTIVE', 'INACTIVE')`),
    check(
      'context_framers_vigencia_check',
      sql`${table.validUntil} IS NULL OR ${table.validUntil} > ${table.validFrom}`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// 3. target_objects — Objetos de Negócio Parametrizáveis (DATA-007 E-003)
// ---------------------------------------------------------------------------
export const targetObjects = pgTable(
  'target_objects',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    codigo: varchar('codigo', { length: 50 }).notNull(),
    nome: varchar('nome', { length: 200 }).notNull(),
    moduloEcf: varchar('modulo_ecf', { length: 20 }),
    descricao: text('descricao'),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex('idx_target_objects_tenant_codigo').on(table.tenantId, table.codigo)],
);

// ---------------------------------------------------------------------------
// 4. target_fields — Campos de Objetos-Alvo (DATA-007 E-004)
// ---------------------------------------------------------------------------
export const targetFields = pgTable(
  'target_fields',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    targetObjectId: uuid('target_object_id')
      .notNull()
      .references(() => targetObjects.id, { onDelete: 'cascade' }),
    fieldKey: varchar('field_key', { length: 100 }).notNull(),
    fieldLabel: varchar('field_label', { length: 200 }),
    fieldType: text('field_type')
      .notNull()
      .$type<'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'BOOLEAN' | 'FILE'>(),
    isSystem: boolean('is_system').notNull().default(false),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_fields_object_key').on(table.targetObjectId, table.fieldKey),
    index('idx_fields_tenant').on(table.tenantId),
    check(
      'target_fields_type_check',
      sql`${table.fieldType} IN ('TEXT', 'NUMBER', 'DATE', 'SELECT', 'BOOLEAN', 'FILE')`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// 5. incidence_rules — Regras de Incidência (DATA-007 E-005)
// ---------------------------------------------------------------------------
export const incidenceRules = pgTable(
  'incidence_rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    framerId: uuid('framer_id')
      .notNull()
      .references(() => contextFramers.id, { onDelete: 'restrict' }),
    targetObjectId: uuid('target_object_id')
      .notNull()
      .references(() => targetObjects.id, { onDelete: 'restrict' }),
    conditionExpr: text('condition_expr'),
    incidenceType: text('incidence_type').notNull().default('OBR').$type<'OBR' | 'OPC' | 'AUTO'>(),
    validFrom: timestamp('valid_from', { withTimezone: true }).notNull(),
    validUntil: timestamp('valid_until', { withTimezone: true }),
    status: text('status').notNull().default('ACTIVE').$type<'ACTIVE' | 'INACTIVE'>(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_incidence_tenant_framer_object').on(
      table.tenantId,
      table.framerId,
      table.targetObjectId,
    ),
    index('idx_incidence_status_vigencia')
      .on(table.status, table.validFrom, table.validUntil)
      .where(sql`${table.status} = 'ACTIVE'`),
    index('idx_incidence_framer').on(table.framerId),
    index('idx_incidence_type').on(table.incidenceType),
    index('idx_incidence_tenant').on(table.tenantId),
    check('incidence_rules_status_check', sql`${table.status} IN ('ACTIVE', 'INACTIVE')`),
    check('incidence_rules_type_check', sql`${table.incidenceType} IN ('OBR', 'OPC', 'AUTO')`),
    check(
      'incidence_rules_vigencia_check',
      sql`${table.validUntil} IS NULL OR ${table.validUntil} > ${table.validFrom}`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// 6. behavior_routines — Rotinas de Comportamento / Aggregate Root (DATA-007 E-006)
// ---------------------------------------------------------------------------
export const behaviorRoutines = pgTable(
  'behavior_routines',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    codigo: varchar('codigo', { length: 50 }).notNull(),
    nome: varchar('nome', { length: 200 }).notNull(),
    routineType: text('routine_type').notNull().$type<'BEHAVIOR' | 'INTEGRATION'>(),
    version: integer('version').notNull().default(1),
    status: text('status').notNull().default('DRAFT').$type<'DRAFT' | 'PUBLISHED' | 'DEPRECATED'>(),
    parentRoutineId: uuid('parent_routine_id'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    approvedBy: uuid('approved_by').references(() => users.id, {
      onDelete: 'restrict',
    }),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    uniqueIndex('idx_routines_tenant_codigo').on(table.tenantId, table.codigo),
    index('idx_routines_status')
      .on(table.status)
      .where(sql`${table.deletedAt} IS NULL`),
    index('idx_routines_type_status')
      .on(table.routineType, table.status)
      .where(sql`${table.deletedAt} IS NULL`),
    index('idx_routines_tenant_status')
      .on(table.tenantId, table.status)
      .where(sql`${table.deletedAt} IS NULL`),
    index('idx_routines_parent')
      .on(table.parentRoutineId)
      .where(sql`${table.parentRoutineId} IS NOT NULL`),
    check(
      'behavior_routines_status_check',
      sql`${table.status} IN ('DRAFT', 'PUBLISHED', 'DEPRECATED')`,
    ),
    check('behavior_routines_type_check', sql`${table.routineType} IN ('BEHAVIOR', 'INTEGRATION')`),
  ],
);

// ---------------------------------------------------------------------------
// 7. routine_items — Itens Parametrizáveis (DATA-007 E-007)
// ---------------------------------------------------------------------------
export const routineItems = pgTable(
  'routine_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    routineId: uuid('routine_id')
      .notNull()
      .references(() => behaviorRoutines.id, { onDelete: 'cascade' }),
    itemType: text('item_type')
      .notNull()
      .$type<
        | 'FIELD_VISIBILITY'
        | 'REQUIRED'
        | 'DEFAULT'
        | 'DOMAIN'
        | 'DERIVATION'
        | 'VALIDATION'
        | 'EVIDENCE'
      >(),
    targetFieldId: uuid('target_field_id').references(() => targetFields.id, {
      onDelete: 'restrict',
    }),
    action: text('action')
      .notNull()
      .$type<
        | 'SHOW'
        | 'HIDE'
        | 'SET_REQUIRED'
        | 'SET_OPTIONAL'
        | 'SET_DEFAULT'
        | 'RESTRICT_DOMAIN'
        | 'VALIDATE'
        | 'REQUIRE_EVIDENCE'
      >(),
    value: jsonb('value'),
    conditionExpr: text('condition_expr'),
    validationMessage: varchar('validation_message', { length: 500 }),
    isBlocking: boolean('is_blocking').notNull().default(false),
    ordem: integer('ordem').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_items_routine_ordem').on(table.routineId, table.ordem),
    index('idx_items_target_field')
      .on(table.targetFieldId)
      .where(sql`${table.targetFieldId} IS NOT NULL`),
    check(
      'routine_items_type_check',
      sql`${table.itemType} IN ('FIELD_VISIBILITY', 'REQUIRED', 'DEFAULT', 'DOMAIN', 'DERIVATION', 'VALIDATION', 'EVIDENCE')`,
    ),
    check(
      'routine_items_action_check',
      sql`${table.action} IN ('SHOW', 'HIDE', 'SET_REQUIRED', 'SET_OPTIONAL', 'SET_DEFAULT', 'RESTRICT_DOMAIN', 'VALIDATE', 'REQUIRE_EVIDENCE')`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// 8. routine_incidence_links — Associação N:N Rotinas ↔ Incidências (DATA-007 E-008)
// ---------------------------------------------------------------------------
export const routineIncidenceLinks = pgTable(
  'routine_incidence_links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    routineId: uuid('routine_id')
      .notNull()
      .references(() => behaviorRoutines.id, { onDelete: 'cascade' }),
    incidenceRuleId: uuid('incidence_rule_id')
      .notNull()
      .references(() => incidenceRules.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('idx_links_routine_incidence').on(table.routineId, table.incidenceRuleId),
    index('idx_links_incidence').on(table.incidenceRuleId),
  ],
);

// ---------------------------------------------------------------------------
// 9. routine_version_history — Histórico de Versões (DATA-007 E-009)
// ---------------------------------------------------------------------------
export const routineVersionHistory = pgTable(
  'routine_version_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    routineId: uuid('routine_id')
      .notNull()
      .references(() => behaviorRoutines.id, { onDelete: 'restrict' }),
    previousVersionId: uuid('previous_version_id')
      .notNull()
      .references(() => behaviorRoutines.id, { onDelete: 'restrict' }),
    changedBy: uuid('changed_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    changeReason: text('change_reason').notNull(),
    changedAt: timestamp('changed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_version_history_routine').on(table.routineId),
    index('idx_version_history_previous').on(table.previousVersionId),
    check('version_history_reason_check', sql`length(${table.changeReason}) >= 10`),
  ],
);
