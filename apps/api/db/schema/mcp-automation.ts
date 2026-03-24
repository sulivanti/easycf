/**
 * @contract DATA-010, DOC-FND-000, DOC-GNP-00
 *
 * Drizzle ORM schema definitions for the MCP Automation module (MOD-010).
 * 5 tables: mcp_action_types, mcp_agents, mcp_actions, mcp_agent_action_links, mcp_executions.
 *
 * Aggregate Root: mcp_agents — identity + scopes + status + action links.
 * mcp_executions is append-only (immutable audit trail, NFR-006).
 * No soft-delete — lifecycle managed via status enum (ACTIVE/INACTIVE/REVOKED).
 * All FKs use ON DELETE RESTRICT (DATA-010).
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { users, tenants } from './foundation.js';
import { controlledMovements } from './movement-approval.js';
import { integrationCallLogs } from './integration-protheus.js';
import { behaviorRoutines } from './contextual-params.js';
import { integrationRoutines } from './integration-protheus.js';

// ---------------------------------------------------------------------------
// 1. mcp_action_types — Tipos de Ação MCP (DATA-010 §2)
// ---------------------------------------------------------------------------
export const mcpActionTypes = pgTable(
  'mcp_action_types',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    codigo: varchar('codigo', { length: 30 }).notNull(),
    nome: varchar('nome', { length: 100 }).notNull(),
    canBeDirect: boolean('can_be_direct').notNull(),
    canApprove: boolean('can_approve').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Invariante estrutural: can_approve é SEMPRE false (BR-014)
    check('mcat_no_approve', sql`${table.canApprove} = false`),

    // Código único global (tabela de seed, sem tenant)
    uniqueIndex('mcat_codigo_idx').on(table.codigo),
  ],
);

// ---------------------------------------------------------------------------
// 2. mcp_agents — Agentes MCP (DATA-010 §1)
// ---------------------------------------------------------------------------
export const mcpAgents = pgTable(
  'mcp_agents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    codigo: varchar('codigo', { length: 50 }).notNull(),
    nome: varchar('nome', { length: 200 }).notNull(),
    ownerUserId: uuid('owner_user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    apiKeyHash: varchar('api_key_hash', { length: 60 }).notNull(),
    allowedScopes: jsonb('allowed_scopes').notNull().$type<string[]>(),
    status: text('status').notNull().default('ACTIVE').$type<'ACTIVE' | 'INACTIVE' | 'REVOKED'>(),
    phase2CreateEnabled: boolean('phase2_create_enabled').notNull().default(false),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    revocationReason: text('revocation_reason'),
  },
  (table) => [
    // Status enum check (BR-006)
    check('mca_status_check', sql`${table.status} IN ('ACTIVE', 'INACTIVE', 'REVOKED')`),

    // Revogação requer motivo (BR-015)
    check(
      'mca_revoked_reason_check',
      sql`${table.status} != 'REVOKED' OR ${table.revocationReason} IS NOT NULL`,
    ),

    // Revogação requer timestamp
    check(
      'mca_revoked_at_check',
      sql`${table.status} != 'REVOKED' OR ${table.revokedAt} IS NOT NULL`,
    ),

    // UNIQUE(codigo, tenant_id)
    uniqueIndex('mca_codigo_tenant_idx').on(table.codigo, table.tenantId),

    // Hot query: listar agentes por tenant filtrados por status
    index('idx_mca_tenant_status').on(table.tenantId, table.status),

    // Hot query: listar agentes de um owner
    index('idx_mca_owner').on(table.ownerUserId),
  ],
);

// ---------------------------------------------------------------------------
// 3. mcp_actions — Catálogo de Ações MCP (DATA-010 §3)
// ---------------------------------------------------------------------------
export const mcpActions = pgTable(
  'mcp_actions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    codigo: varchar('codigo', { length: 50 }).notNull(),
    nome: varchar('nome', { length: 200 }).notNull(),
    actionTypeId: uuid('action_type_id')
      .notNull()
      .references(() => mcpActionTypes.id, { onDelete: 'restrict' }),
    executionPolicy: text('execution_policy')
      .notNull()
      .$type<'DIRECT' | 'CONTROLLED' | 'EVENT_ONLY'>(),
    targetObjectType: varchar('target_object_type', { length: 100 }).notNull(),
    requiredScopes: jsonb('required_scopes').notNull().$type<string[]>(),
    linkedRoutineId: uuid('linked_routine_id').references(() => behaviorRoutines.id, {
      onDelete: 'set null',
    }),
    linkedIntegrationId: uuid('linked_integration_id').references(() => integrationRoutines.id, {
      onDelete: 'set null',
    }),
    description: text('description'),
    status: text('status').notNull().default('ACTIVE').$type<'ACTIVE' | 'INACTIVE'>(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Execution policy enum check (BR-007, BR-008, BR-009)
    check(
      'mcac_policy_check',
      sql`${table.executionPolicy} IN ('DIRECT', 'CONTROLLED', 'EVENT_ONLY')`,
    ),

    // Status enum check
    check('mcac_status_check', sql`${table.status} IN ('ACTIVE', 'INACTIVE')`),

    // UNIQUE(codigo, tenant_id)
    uniqueIndex('mcac_codigo_tenant_idx').on(table.codigo, table.tenantId),

    // Hot query: listar ações ativas por tenant
    index('idx_mcac_tenant_status').on(table.tenantId, table.status),

    // Hot query: filtrar por política
    index('idx_mcac_tenant_policy').on(table.tenantId, table.executionPolicy),

    // Join com mcp_action_types
    index('idx_mcac_action_type').on(table.actionTypeId),
  ],
);

// ---------------------------------------------------------------------------
// 4. mcp_agent_action_links — Agente ↔ Ação (DATA-010 §5)
// ---------------------------------------------------------------------------
export const mcpAgentActionLinks = pgTable(
  'mcp_agent_action_links',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => mcpAgents.id, { onDelete: 'restrict' }),
    actionId: uuid('action_id')
      .notNull()
      .references(() => mcpActions.id, { onDelete: 'restrict' }),
    grantedBy: uuid('granted_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
    validUntil: timestamp('valid_until', { withTimezone: true }),
  },
  (table) => [
    // Cada par agente+ação é único (BR-011)
    uniqueIndex('mcaal_agent_action_idx').on(table.agentId, table.actionId),

    // Hot query: listar ações vinculadas a um agente
    index('idx_mcaal_agent').on(table.agentId),

    // Hot query: listar agentes vinculados a uma ação
    index('idx_mcaal_action').on(table.actionId),

    // Gateway passo 4: verificar vigência
    index('idx_mcaal_agent_valid')
      .on(table.agentId, table.validUntil)
      .where(sql`${table.validUntil} IS NOT NULL`),
  ],
);

// ---------------------------------------------------------------------------
// 5. mcp_executions — Log de Execuções / Append-only (DATA-010 §4)
// ---------------------------------------------------------------------------
export const mcpExecutions = pgTable(
  'mcp_executions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    agentId: uuid('agent_id')
      .notNull()
      .references(() => mcpAgents.id, { onDelete: 'restrict' }),
    actionId: uuid('action_id')
      .notNull()
      .references(() => mcpActions.id, { onDelete: 'restrict' }),
    policyApplied: text('policy_applied').notNull().$type<'DIRECT' | 'CONTROLLED' | 'EVENT_ONLY'>(),
    originIp: varchar('origin_ip', { length: 45 }),
    requestPayload: jsonb('request_payload').notNull(),
    correlationId: varchar('correlation_id', { length: 64 }).notNull(),
    status: text('status')
      .notNull()
      .$type<
        | 'RECEIVED'
        | 'DISPATCHED'
        | 'DIRECT_SUCCESS'
        | 'DIRECT_FAILED'
        | 'CONTROLLED_PENDING'
        | 'CONTROLLED_APPROVED'
        | 'CONTROLLED_REJECTED'
        | 'EVENT_EMITTED'
        | 'BLOCKED'
      >(),
    blockedReason: text('blocked_reason'),
    linkedMovementId: uuid('linked_movement_id').references(() => controlledMovements.id, {
      onDelete: 'restrict',
    }),
    linkedIntegrationLogId: uuid('linked_integration_log_id').references(
      () => integrationCallLogs.id,
      { onDelete: 'set null' },
    ),
    resultPayload: jsonb('result_payload'),
    errorMessage: text('error_message'),
    durationMs: integer('duration_ms'),
    receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
  },
  (table) => [
    // Status enum check
    check(
      'mce_status_check',
      sql`${table.status} IN ('RECEIVED', 'DISPATCHED', 'DIRECT_SUCCESS', 'DIRECT_FAILED', 'CONTROLLED_PENDING', 'CONTROLLED_APPROVED', 'CONTROLLED_REJECTED', 'EVENT_EMITTED', 'BLOCKED')`,
    ),

    // Bloqueio requer motivo
    check(
      'mce_blocked_reason_check',
      sql`${table.status} != 'BLOCKED' OR ${table.blockedReason} IS NOT NULL`,
    ),

    // Hot query: listar execuções recentes por tenant
    index('idx_mce_tenant_received').on(table.tenantId, table.receivedAt),

    // Hot query: histórico por agente
    index('idx_mce_agent_received').on(table.agentId, table.receivedAt),

    // Filtro por ação
    index('idx_mce_action').on(table.actionId),

    // Hot query: filtro por status (BLOCKED, CONTROLLED_PENDING)
    index('idx_mce_tenant_status').on(table.tenantId, table.status),

    // Lookup por correlation_id para rastreamento
    index('idx_mce_correlation').on(table.correlationId),

    // Join com MOD-009
    index('idx_mce_movement')
      .on(table.linkedMovementId)
      .where(sql`${table.linkedMovementId} IS NOT NULL`),
  ],
);
