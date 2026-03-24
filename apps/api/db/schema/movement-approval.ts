/**
 * @contract DATA-009, DOC-FND-000, DOC-GNP-00
 *
 * Drizzle ORM schema definitions for the Movement Approval module (MOD-009).
 * 7 tables: movement_control_rules, approval_rules, controlled_movements,
 * approval_instances, movement_executions, movement_history, movement_override_log.
 *
 * Aggregate Root: controlled_movements — all approval flow goes through this entity.
 * movement_history and movement_override_log are append-only (immutable audit trail).
 * All FKs use ON DELETE RESTRICT except child tables which use CASCADE (DATA-009).
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  numeric,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// 1. movement_control_rules — Regras de Controle de Movimentação (DATA-009 §1)
// ---------------------------------------------------------------------------
export const movementControlRules = pgTable(
  'movement_control_rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    codigo: varchar('codigo', { length: 50 }).notNull(),
    nome: varchar('nome', { length: 200 }).notNull(),
    descricao: text('descricao'),
    objectType: varchar('object_type', { length: 100 }).notNull(),
    operationType: varchar('operation_type', { length: 100 }).notNull(),
    originTypes: jsonb('origin_types').notNull().$type<Array<'HUMAN' | 'API' | 'MCP' | 'AGENT'>>(),
    criteriaType: text('criteria_type')
      .notNull()
      .$type<'VALUE' | 'HIERARCHY' | 'ORIGIN' | 'OBJECT'>(),
    valueThreshold: numeric('value_threshold', { precision: 18, scale: 2 }),
    priority: integer('priority').notNull().default(0),
    status: text('status').notNull().default('ACTIVE').$type<'ACTIVE' | 'INACTIVE'>(),
    validFrom: timestamp('valid_from', { withTimezone: true }),
    validUntil: timestamp('valid_until', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // Criteria type enum check
    check(
      'mcr_criteria_type_check',
      sql`${table.criteriaType} IN ('VALUE', 'HIERARCHY', 'ORIGIN', 'OBJECT')`,
    ),

    // Status enum check
    check('mcr_status_check', sql`${table.status} IN ('ACTIVE', 'INACTIVE')`),

    // Hot-path: avaliação de regras por tenant + tipo de objeto + operação
    index('idx_mcr_tenant_eval')
      .on(table.tenantId, table.status, table.objectType, table.operationType)
      .where(sql`${table.deletedAt} IS NULL`),

    // UNIQUE parcial: codigo único por tenant (soft-delete safe)
    uniqueIndex('mcr_tenant_codigo_idx')
      .on(table.tenantId, table.codigo)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);

// ---------------------------------------------------------------------------
// 2. approval_rules — Regras de Aprovação por Nível (DATA-009 §2)
// ---------------------------------------------------------------------------
export const approvalRules = pgTable(
  'approval_rules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    controlRuleId: uuid('control_rule_id')
      .notNull()
      .references(() => movementControlRules.id, { onDelete: 'restrict' }),
    level: integer('level').notNull(),
    approverType: text('approver_type').notNull().$type<'ROLE' | 'USER' | 'SCOPE'>(),
    approverValue: varchar('approver_value', { length: 200 }).notNull(),
    requiredScope: varchar('required_scope', { length: 200 }),
    allowSelfApprove: boolean('allow_self_approve').notNull().default(false),
    timeoutMinutes: integer('timeout_minutes').notNull().default(1440),
    escalationRuleId: uuid('escalation_rule_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // Approver type enum check
    check('ar_approver_type_check', sql`${table.approverType} IN ('ROLE', 'USER', 'SCOPE')`),

    // Cadeia de aprovação: controle + nível
    index('idx_ar_tenant_control_level')
      .on(table.tenantId, table.controlRuleId, table.level)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);

// ---------------------------------------------------------------------------
// 3. controlled_movements — Movimentações Controladas (DATA-009 §3)
// ---------------------------------------------------------------------------
export const controlledMovements = pgTable(
  'controlled_movements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    controlRuleId: uuid('control_rule_id')
      .notNull()
      .references(() => movementControlRules.id, { onDelete: 'restrict' }),
    codigo: varchar('codigo', { length: 50 }).notNull(),
    requesterId: uuid('requester_id').notNull(),
    requesterOrigin: text('requester_origin').notNull().$type<'HUMAN' | 'API' | 'MCP' | 'AGENT'>(),
    objectType: varchar('object_type', { length: 100 }).notNull(),
    objectId: uuid('object_id'),
    operationType: varchar('operation_type', { length: 100 }).notNull(),
    operationPayload: jsonb('operation_payload'),
    caseId: uuid('case_id'),
    currentLevel: integer('current_level').notNull().default(1),
    totalLevels: integer('total_levels').notNull(),
    status: text('status')
      .notNull()
      .default('PENDING_APPROVAL')
      .$type<
        | 'PENDING_APPROVAL'
        | 'APPROVED'
        | 'AUTO_APPROVED'
        | 'REJECTED'
        | 'CANCELLED'
        | 'OVERRIDDEN'
        | 'EXECUTED'
        | 'FAILED'
      >(),
    idempotencyKey: varchar('idempotency_key', { length: 100 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // Requester origin enum check
    check(
      'cm_requester_origin_check',
      sql`${table.requesterOrigin} IN ('HUMAN', 'API', 'MCP', 'AGENT')`,
    ),

    // Status enum check
    check(
      'cm_status_check',
      sql`${table.status} IN ('PENDING_APPROVAL', 'APPROVED', 'AUTO_APPROVED', 'REJECTED', 'CANCELLED', 'OVERRIDDEN', 'EXECUTED', 'FAILED')`,
    ),

    // Listagem por tenant + status (hot path)
    index('idx_cm_tenant_status')
      .on(table.tenantId, table.status)
      .where(sql`${table.deletedAt} IS NULL`),

    // Filtro por solicitante
    index('idx_cm_tenant_requester')
      .on(table.tenantId, table.requesterId)
      .where(sql`${table.deletedAt} IS NULL`),

    // Idempotência: chave única parcial
    uniqueIndex('cm_idempotency_key_idx')
      .on(table.tenantId, table.idempotencyKey)
      .where(sql`${table.idempotencyKey} IS NOT NULL AND ${table.deletedAt} IS NULL`),
  ],
);

// ---------------------------------------------------------------------------
// 4. approval_instances — Instâncias de Aprovação (DATA-009 §4)
// ---------------------------------------------------------------------------
export const approvalInstances = pgTable(
  'approval_instances',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    movementId: uuid('movement_id')
      .notNull()
      .references(() => controlledMovements.id, { onDelete: 'cascade' }),
    level: integer('level').notNull(),
    approverId: uuid('approver_id'),
    status: text('status')
      .notNull()
      .default('PENDING')
      .$type<'PENDING' | 'APPROVED' | 'REJECTED' | 'TIMEOUT' | 'ESCALATED'>(),
    opinion: text('opinion'),
    decidedAt: timestamp('decided_at', { withTimezone: true }),
    timeoutAt: timestamp('timeout_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // Status enum check
    check(
      'ai_status_check',
      sql`${table.status} IN ('PENDING', 'APPROVED', 'REJECTED', 'TIMEOUT', 'ESCALATED')`,
    ),

    // Cadeia de aprovação por movimentação + nível
    index('idx_ai_tenant_movement_level').on(table.tenantId, table.movementId, table.level),

    // Bandeja do aprovador: pendências atribuídas
    index('idx_ai_tenant_approver_pending')
      .on(table.tenantId, table.approverId, table.status)
      .where(sql`${table.status} = 'PENDING'`),
  ],
);

// ---------------------------------------------------------------------------
// 5. movement_executions — Execução de Movimentações (DATA-009 §5)
// ---------------------------------------------------------------------------
export const movementExecutions = pgTable(
  'movement_executions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    movementId: uuid('movement_id')
      .notNull()
      .references(() => controlledMovements.id, { onDelete: 'restrict' }),
    executionPayload: jsonb('execution_payload'),
    status: text('status').notNull().$type<'SUCCESS' | 'FAILED'>(),
    errorMessage: text('error_message'),
    executedAt: timestamp('executed_at', { withTimezone: true }).notNull().defaultNow(),
    retryCount: integer('retry_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: uuid('created_by'),
    updatedBy: uuid('updated_by'),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // Status enum check
    check('me_status_check', sql`${table.status} IN ('SUCCESS', 'FAILED')`),

    // Lookup por movimentação
    index('idx_me_tenant_movement').on(table.tenantId, table.movementId),
  ],
);

// ---------------------------------------------------------------------------
// 6. movement_history — Histórico de Movimentação / Append-only (DATA-009 §6)
// ---------------------------------------------------------------------------
export const movementHistory = pgTable(
  'movement_history',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    movementId: uuid('movement_id')
      .notNull()
      .references(() => controlledMovements.id, { onDelete: 'cascade' }),
    eventType: varchar('event_type', { length: 100 }).notNull(),
    actorId: uuid('actor_id'),
    payload: jsonb('payload'),
    correlationId: uuid('correlation_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Timeline por movimentação (ordenação cronológica)
    index('idx_mh_tenant_movement_created').on(table.tenantId, table.movementId, table.createdAt),
  ],
);

// ---------------------------------------------------------------------------
// 7. movement_override_log — Log de Override / Append-only (DATA-009 §7)
// ---------------------------------------------------------------------------
export const movementOverrideLog = pgTable(
  'movement_override_log',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    movementId: uuid('movement_id')
      .notNull()
      .references(() => controlledMovements.id, { onDelete: 'restrict' }),
    overriddenBy: uuid('overridden_by').notNull(),
    justification: text('justification').notNull(),
    previousStatus: varchar('previous_status', { length: 50 }),
    correlationId: uuid('correlation_id'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Lookup por movimentação
    index('idx_mol_tenant_movement').on(table.tenantId, table.movementId),
  ],
);
