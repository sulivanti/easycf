/**
 * @contract DATA-005, DATA-003, DOC-FND-000, DOC-GNP-00, ADR-001, ADR-004
 *
 * Drizzle ORM schema definitions for the Process Modeling module (MOD-005).
 * 7 tables: process_cycles, process_macro_stages, process_stages,
 * process_gates, process_roles, stage_role_links, stage_transitions.
 *
 * All FKs use ON DELETE RESTRICT (BR-005 / DATA-005).
 * Soft-delete via deleted_at where applicable (DATA-005 §2.8).
 * stage_role_links and stage_transitions use hard delete (no downstream FKs).
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
// 1. process_cycles — Ciclos de Processo / Aggregate Root (DATA-005 §2.1)
// ---------------------------------------------------------------------------
export const processCycles = pgTable(
  'process_cycles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    codigo: varchar('codigo', { length: 50 }).notNull(),
    nome: varchar('nome', { length: 200 }).notNull(),
    descricao: text('descricao'),
    version: integer('version').notNull().default(1),
    status: text('status').notNull().default('DRAFT').$type<'DRAFT' | 'PUBLISHED' | 'DEPRECATED'>(),
    parentCycleId: uuid('parent_cycle_id'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // Status enum check (BR-010)
    check(
      'process_cycles_status_check',
      sql`${table.status} IN ('DRAFT', 'PUBLISHED', 'DEPRECATED')`,
    ),

    // UNIQUE(tenant_id, codigo, version) — unicidade por tenant (DATA-005 §2.1)
    uniqueIndex('process_cycles_tenant_codigo_version_idx').on(
      table.tenantId,
      table.codigo,
      table.version,
    ),

    // Listagem filtrada por tenant + status
    index('idx_cycles_tenant_status').on(table.tenantId, table.status),

    // Histórico de versões (fork chain)
    index('idx_cycles_parent')
      .on(table.parentCycleId)
      .where(sql`${table.parentCycleId} IS NOT NULL`),
  ],
);

// ---------------------------------------------------------------------------
// 2. process_macro_stages — Macroetapas (DATA-005 §2.2)
// ---------------------------------------------------------------------------
export const processMacroStages = pgTable(
  'process_macro_stages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    cycleId: uuid('cycle_id')
      .notNull()
      .references(() => processCycles.id, { onDelete: 'restrict' }),
    codigo: varchar('codigo', { length: 50 }).notNull(),
    nome: varchar('nome', { length: 200 }).notNull(),
    ordem: integer('ordem').notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // UNIQUE(cycle_id, codigo) parcial — unicidade por ciclo (DATA-005 §2.2)
    uniqueIndex('process_macro_stages_cycle_codigo_idx')
      .on(table.cycleId, table.codigo)
      .where(sql`${table.deletedAt} IS NULL`),

    // UNIQUE(cycle_id, ordem) parcial — sem duplicata de ordem (DATA-005 §2.2)
    uniqueIndex('process_macro_stages_cycle_ordem_idx')
      .on(table.cycleId, table.ordem)
      .where(sql`${table.deletedAt} IS NULL`),

    // Ordenação natural
    index('idx_macro_stages_cycle_ordem').on(table.cycleId, table.ordem),
  ],
);

// ---------------------------------------------------------------------------
// 3. process_stages — Estágios (DATA-005 §2.3, ADR-001)
// ---------------------------------------------------------------------------
export const processStages = pgTable(
  'process_stages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    macroStageId: uuid('macro_stage_id')
      .notNull()
      .references(() => processMacroStages.id, { onDelete: 'restrict' }),
    cycleId: uuid('cycle_id')
      .notNull()
      .references(() => processCycles.id, { onDelete: 'restrict' }),
    codigo: varchar('codigo', { length: 50 }).notNull(),
    nome: varchar('nome', { length: 200 }).notNull(),
    descricao: text('descricao'),
    ordem: integer('ordem').notNull(),
    isInitial: boolean('is_initial').notNull().default(false),
    isTerminal: boolean('is_terminal').notNull().default(false),
    canvasX: integer('canvas_x'),
    canvasY: integer('canvas_y'),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // UNIQUE(macro_stage_id, codigo) parcial (DATA-005 §2.3)
    uniqueIndex('process_stages_macro_codigo_idx')
      .on(table.macroStageId, table.codigo)
      .where(sql`${table.deletedAt} IS NULL`),

    // Partial unique: apenas 1 is_initial por ciclo (ADR-001 Opção B, BR-002)
    uniqueIndex('idx_stages_initial_unique')
      .on(table.cycleId)
      .where(sql`${table.isInitial} = true AND ${table.deletedAt} IS NULL`),

    // Ordenação dentro da macroetapa
    index('idx_stages_macro_ordem').on(table.macroStageId, table.ordem),

    // Lookup por cycle_id — simplifica /flow e validação cross-ciclo (BR-008)
    index('idx_stages_cycle').on(table.cycleId),
  ],
);

// ---------------------------------------------------------------------------
// 4. process_gates — Gates de Validação (DATA-005 §2.4)
// ---------------------------------------------------------------------------
export const processGates = pgTable(
  'process_gates',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    stageId: uuid('stage_id')
      .notNull()
      .references(() => processStages.id, { onDelete: 'restrict' }),
    nome: varchar('nome', { length: 200 }).notNull(),
    descricao: text('descricao'),
    gateType: text('gate_type')
      .notNull()
      .$type<'APPROVAL' | 'DOCUMENT' | 'CHECKLIST' | 'INFORMATIVE'>(),
    required: boolean('required').notNull().default(true),
    ordem: integer('ordem').notNull(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // Gate type enum check (DATA-005 §2.4)
    check(
      'process_gates_type_check',
      sql`${table.gateType} IN ('APPROVAL', 'DOCUMENT', 'CHECKLIST', 'INFORMATIVE')`,
    ),

    // UNIQUE(stage_id, ordem) parcial — sem duplicata de ordem (DATA-005 §2.4)
    uniqueIndex('process_gates_stage_ordem_idx')
      .on(table.stageId, table.ordem)
      .where(sql`${table.deletedAt} IS NULL`),

    // Avaliação sequencial por estágio
    index('idx_gates_stage_ordem').on(table.stageId, table.ordem),
  ],
);

// ---------------------------------------------------------------------------
// 5. process_roles — Papéis de Processo / Catálogo Global (DATA-005 §2.5)
// ---------------------------------------------------------------------------
export const processRoles = pgTable(
  'process_roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    codigo: varchar('codigo', { length: 50 }).notNull(),
    nome: varchar('nome', { length: 100 }).notNull(),
    descricao: text('descricao'),
    canApprove: boolean('can_approve').notNull().default(false),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // UNIQUE(tenant_id, codigo) parcial (DATA-005 §2.5)
    uniqueIndex('process_roles_tenant_codigo_idx')
      .on(table.tenantId, table.codigo)
      .where(sql`${table.deletedAt} IS NULL`),

    // Listagem por tenant
    index('idx_process_roles_tenant').on(table.tenantId),
  ],
);

// ---------------------------------------------------------------------------
// 6. stage_role_links — Vínculo Estágio × Papel N:N (DATA-005 §2.6)
// ---------------------------------------------------------------------------
export const stageRoleLinks = pgTable(
  'stage_role_links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    stageId: uuid('stage_id')
      .notNull()
      .references(() => processStages.id, { onDelete: 'restrict' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => processRoles.id, { onDelete: 'restrict' }),
    required: boolean('required').notNull().default(false),
    maxAssignees: integer('max_assignees'),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // UNIQUE(stage_id, role_id) — sem duplicata de papel por estágio (DATA-005 §2.6)
    uniqueIndex('stage_role_links_stage_role_idx').on(table.stageId, table.roleId),

    // Listar papéis do estágio
    index('idx_stage_roles_stage').on(table.stageId),

    // Reverse lookup
    index('idx_stage_roles_role').on(table.roleId),
  ],
);

// ---------------------------------------------------------------------------
// 7. stage_transitions — Transições entre Estágios (DATA-005 §2.7)
// ---------------------------------------------------------------------------
export const stageTransitions = pgTable(
  'stage_transitions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fromStageId: uuid('from_stage_id')
      .notNull()
      .references(() => processStages.id, { onDelete: 'restrict' }),
    toStageId: uuid('to_stage_id')
      .notNull()
      .references(() => processStages.id, { onDelete: 'restrict' }),
    nome: varchar('nome', { length: 100 }).notNull(),
    condicao: text('condicao'),
    gateRequired: boolean('gate_required').notNull().default(false),
    evidenceRequired: boolean('evidence_required').notNull().default(false),
    allowedRoles: jsonb('allowed_roles').$type<string[]>(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // No self-transition (BR-008)
    check('stage_transitions_no_self_check', sql`${table.fromStageId} != ${table.toStageId}`),

    // UNIQUE(from_stage_id, to_stage_id, nome) — sem duplicata nomeada (DATA-005 §2.7)
    uniqueIndex('stage_transitions_from_to_nome_idx').on(
      table.fromStageId,
      table.toStageId,
      table.nome,
    ),

    // Transições de saída
    index('idx_transitions_from').on(table.fromStageId),

    // Transições de entrada
    index('idx_transitions_to').on(table.toStageId),
  ],
);
