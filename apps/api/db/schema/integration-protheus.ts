/**
 * @contract DATA-008, DATA-003, DOC-FND-000, DOC-GNP-00, ADR-001, ADR-002, ADR-003, ADR-004
 *
 * Drizzle ORM schema definitions for the Integration Protheus module (MOD-008).
 * 6 tables: integration_services, integration_routines, integration_field_mappings,
 * integration_params, integration_call_logs, integration_reprocess_requests.
 *
 * Aggregate Root: integration_routines (extends behavior_routines 1:1).
 * integration_call_logs and integration_reprocess_requests are audit records (no soft-delete).
 * Outbox Pattern: call_logs INSERT with status=QUEUED inside business transaction (ADR-001).
 * Retry managed by Outbox, not BullMQ (ADR-002).
 * Credentials in auth_config encrypted at rest with AES-256 (ADR-004).
 * All FKs use ON DELETE RESTRICT (DATA-008).
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
import { behaviorRoutines } from './contextual-params.js';
import { caseInstances, caseEvents } from './case-execution.js';

// ---------------------------------------------------------------------------
// 1. integration_services — Catálogo de Serviços de Destino (DATA-008 §2.1)
// ---------------------------------------------------------------------------
export const integrationServices = pgTable(
  'integration_services',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    codigo: varchar('codigo', { length: 50 }).notNull(),
    nome: varchar('nome', { length: 200 }).notNull(),
    baseUrl: varchar('base_url', { length: 500 }).notNull(),
    authType: text('auth_type').notNull().$type<'NONE' | 'BASIC' | 'BEARER' | 'OAUTH2'>(),
    authConfig: jsonb('auth_config'),
    timeoutMs: integer('timeout_ms').notNull().default(30000),
    status: text('status').notNull().default('ACTIVE').$type<'ACTIVE' | 'INACTIVE'>(),
    environment: text('environment').notNull().$type<'PROD' | 'HML' | 'DEV'>(),
    createdBy: uuid('created_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // Auth type enum (BR-002)
    check(
      'integration_services_auth_type_check',
      sql`${table.authType} IN ('NONE', 'BASIC', 'BEARER', 'OAUTH2')`,
    ),

    // Status enum
    check('integration_services_status_check', sql`${table.status} IN ('ACTIVE', 'INACTIVE')`),

    // Environment enum
    check(
      'integration_services_environment_check',
      sql`${table.environment} IN ('PROD', 'HML', 'DEV')`,
    ),

    // Timeout range
    check(
      'integration_services_timeout_check',
      sql`${table.timeoutMs} > 0 AND ${table.timeoutMs} <= 120000`,
    ),

    // UNIQUE(tenant_id, codigo) WHERE deleted_at IS NULL
    uniqueIndex('idx_integration_services_tenant_codigo')
      .on(table.tenantId, table.codigo)
      .where(sql`${table.deletedAt} IS NULL`),

    // Listagem filtrada por status
    index('idx_integration_services_tenant_status')
      .on(table.tenantId, table.status)
      .where(sql`${table.deletedAt} IS NULL`),

    // Tenant isolation scan
    index('idx_integration_services_tenant_id').on(table.tenantId),
  ],
);

// ---------------------------------------------------------------------------
// 2. integration_routines — Extensão HTTP 1:1 de behavior_routines (DATA-008 §2.2)
// Herança MOD-007: versionamento DRAFT→PUBLISHED→DEPRECATED controlado em behavior_routines
// ---------------------------------------------------------------------------
export const integrationRoutines = pgTable(
  'integration_routines',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    routineId: uuid('routine_id')
      .notNull()
      .references(() => behaviorRoutines.id, { onDelete: 'restrict' }),
    serviceId: uuid('service_id')
      .notNull()
      .references(() => integrationServices.id, { onDelete: 'restrict' }),
    httpMethod: text('http_method').notNull().$type<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'>(),
    endpointTpl: varchar('endpoint_tpl', { length: 500 }).notNull(),
    contentType: varchar('content_type', { length: 100 }).default('application/json'),
    timeoutMs: integer('timeout_ms'),
    retryMax: integer('retry_max').notNull().default(3),
    retryBackoffMs: integer('retry_backoff_ms').notNull().default(1000),
    triggerEvents: jsonb('trigger_events').$type<string[]>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // HTTP method enum
    check(
      'integration_routines_http_method_check',
      sql`${table.httpMethod} IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE')`,
    ),

    // Retry max range
    check(
      'integration_routines_retry_max_check',
      sql`${table.retryMax} >= 0 AND ${table.retryMax} <= 10`,
    ),

    // Retry backoff range
    check(
      'integration_routines_retry_backoff_check',
      sql`${table.retryBackoffMs} >= 100 AND ${table.retryBackoffMs} <= 60000`,
    ),

    // Timeout override range (nullable)
    check(
      'integration_routines_timeout_check',
      sql`${table.timeoutMs} IS NULL OR (${table.timeoutMs} > 0 AND ${table.timeoutMs} <= 120000)`,
    ),

    // UNIQUE(routine_id) WHERE deleted_at IS NULL — extensão 1:1
    uniqueIndex('idx_integration_routines_routine_id')
      .on(table.routineId)
      .where(sql`${table.deletedAt} IS NULL`),

    // Busca por serviço
    index('idx_integration_routines_service_id')
      .on(table.serviceId)
      .where(sql`${table.deletedAt} IS NULL`),

    // Tenant isolation scan
    index('idx_integration_routines_tenant_id').on(table.tenantId),
  ],
);

// ---------------------------------------------------------------------------
// 3. integration_field_mappings — Mapeamento de Campos (DATA-008 §2.3)
// ---------------------------------------------------------------------------
export const integrationFieldMappings = pgTable(
  'integration_field_mappings',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    routineId: uuid('routine_id')
      .notNull()
      .references(() => behaviorRoutines.id, { onDelete: 'restrict' }),
    sourceField: varchar('source_field', { length: 200 }).notNull(),
    targetField: varchar('target_field', { length: 200 }).notNull(),
    mappingType: text('mapping_type')
      .notNull()
      .$type<'FIELD' | 'PARAM' | 'HEADER' | 'FIXED_VALUE' | 'DERIVED'>(),
    required: boolean('required').notNull().default(false),
    transformExpr: text('transform_expr'),
    conditionExpr: text('condition_expr'),
    defaultValue: varchar('default_value', { length: 500 }),
    ordem: integer('ordem').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // Mapping type enum
    check(
      'integration_field_mappings_type_check',
      sql`${table.mappingType} IN ('FIELD', 'PARAM', 'HEADER', 'FIXED_VALUE', 'DERIVED')`,
    ),

    // Ordem must be positive
    check('integration_field_mappings_ordem_check', sql`${table.ordem} >= 1`),

    // UNIQUE(routine_id, source_field, target_field) WHERE deleted_at IS NULL
    uniqueIndex('idx_field_mappings_routine_unique')
      .on(table.routineId, table.sourceField, table.targetField)
      .where(sql`${table.deletedAt} IS NULL`),

    // Ordenação natural por rotina
    index('idx_field_mappings_routine_ordem')
      .on(table.routineId, table.ordem)
      .where(sql`${table.deletedAt} IS NULL`),

    // Tenant isolation scan
    index('idx_field_mappings_tenant_id').on(table.tenantId),
  ],
);

// ---------------------------------------------------------------------------
// 4. integration_params — Parâmetros Técnicos (DATA-008 §2.4)
// ---------------------------------------------------------------------------
export const integrationParams = pgTable(
  'integration_params',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    routineId: uuid('routine_id')
      .notNull()
      .references(() => behaviorRoutines.id, { onDelete: 'restrict' }),
    paramKey: varchar('param_key', { length: 100 }).notNull(),
    paramType: text('param_type')
      .notNull()
      .$type<'FIXED' | 'DERIVED_FROM_TENANT' | 'DERIVED_FROM_CONTEXT' | 'HEADER'>(),
    value: varchar('value', { length: 500 }),
    derivationExpr: text('derivation_expr'),
    isSensitive: boolean('is_sensitive').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // Param type enum
    check(
      'integration_params_type_check',
      sql`${table.paramType} IN ('FIXED', 'DERIVED_FROM_TENANT', 'DERIVED_FROM_CONTEXT', 'HEADER')`,
    ),

    // UNIQUE(routine_id, param_key) WHERE deleted_at IS NULL
    uniqueIndex('idx_integration_params_routine_key')
      .on(table.routineId, table.paramKey)
      .where(sql`${table.deletedAt} IS NULL`),

    // Tenant isolation scan
    index('idx_integration_params_tenant_id').on(table.tenantId),
  ],
);

// ---------------------------------------------------------------------------
// 5. integration_call_logs — Log de Chamadas / Outbox (DATA-008 §2.5, ADR-001)
// No soft-delete — audit trail imutável (BR-009)
// id also used as BullMQ jobId for deduplication
// ---------------------------------------------------------------------------
export const integrationCallLogs = pgTable(
  'integration_call_logs',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    routineId: uuid('routine_id')
      .notNull()
      .references(() => behaviorRoutines.id, { onDelete: 'restrict' }),
    caseId: uuid('case_id').references(() => caseInstances.id, {
      onDelete: 'restrict',
    }),
    caseEventId: uuid('case_event_id').references(() => caseEvents.id, {
      onDelete: 'restrict',
    }),
    correlationId: varchar('correlation_id', { length: 100 }).notNull(),
    status: text('status')
      .notNull()
      .default('QUEUED')
      .$type<'QUEUED' | 'RUNNING' | 'SUCCESS' | 'FAILED' | 'DLQ' | 'REPROCESSED'>(),
    attemptNumber: integer('attempt_number').notNull().default(1),
    parentLogId: uuid('parent_log_id'),
    requestPayload: jsonb('request_payload'),
    requestHeaders: jsonb('request_headers'),
    responseStatus: integer('response_status'),
    responseBody: jsonb('response_body'),
    responseProtocol: varchar('response_protocol', { length: 50 }),
    errorMessage: text('error_message'),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    durationMs: integer('duration_ms'),
    queuedAt: timestamp('queued_at', { withTimezone: true }).notNull().defaultNow(),
    reprocessReason: text('reprocess_reason'),
    reprocessedBy: uuid('reprocessed_by').references(() => users.id, {
      onDelete: 'restrict',
    }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Status enum
    check(
      'integration_call_logs_status_check',
      sql`${table.status} IN ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'DLQ', 'REPROCESSED')`,
    ),

    // Attempt must be positive
    check('integration_call_logs_attempt_check', sql`${table.attemptNumber} >= 1`),

    // Duration non-negative when present
    check(
      'integration_call_logs_duration_check',
      sql`${table.durationMs} IS NULL OR ${table.durationMs} >= 0`,
    ),

    // DLQ monitoring scan (hot path — DATA-008 §3.1)
    index('idx_call_logs_dlq')
      .on(table.tenantId, table.status, table.queuedAt)
      .where(sql`${table.status} = 'DLQ'`),

    // Listagem por rotina (cursor-based pagination — DATA-008 §3.3)
    index('idx_call_logs_tenant_routine_queued').on(
      table.tenantId,
      table.routineId,
      table.queuedAt,
    ),

    // Filtro por status (monitoring dashboard)
    index('idx_call_logs_tenant_status').on(table.tenantId, table.status),

    // Rastreabilidade cross-service
    index('idx_call_logs_correlation_id').on(table.correlationId),

    // Busca por caso (MOD-006)
    index('idx_call_logs_case_id')
      .on(table.caseId)
      .where(sql`${table.caseId} IS NOT NULL`),

    // Chain de reprocessamento (DATA-008 §3.2)
    index('idx_call_logs_parent_log_id')
      .on(table.parentLogId)
      .where(sql`${table.parentLogId} IS NOT NULL`),

    // Tenant isolation scan
    index('idx_call_logs_tenant_id').on(table.tenantId),
  ],
);

// ---------------------------------------------------------------------------
// 6. integration_reprocess_requests — Solicitações de Reprocessamento (DATA-008 §2.6)
// No soft-delete — audit trail (BR-010)
// ---------------------------------------------------------------------------
export const integrationReprocessRequests = pgTable(
  'integration_reprocess_requests',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    originalLogId: uuid('original_log_id')
      .notNull()
      .references(() => integrationCallLogs.id, { onDelete: 'restrict' }),
    requestedBy: uuid('requested_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    requestedAt: timestamp('requested_at', { withTimezone: true }).notNull().defaultNow(),
    reason: text('reason').notNull(),
    newLogId: uuid('new_log_id').references(() => integrationCallLogs.id, {
      onDelete: 'restrict',
    }),
    status: text('status')
      .notNull()
      .default('PENDING')
      .$type<'PENDING' | 'EXECUTED' | 'CANCELLED'>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    // Status enum
    check(
      'integration_reprocess_status_check',
      sql`${table.status} IN ('PENDING', 'EXECUTED', 'CANCELLED')`,
    ),

    // Justificativa mínima 10 chars (BR-010)
    check('integration_reprocess_reason_min_check', sql`length(${table.reason}) >= 10`),

    // Busca por log original
    index('idx_reprocess_requests_original_log').on(table.originalLogId),

    // Filtro por status
    index('idx_reprocess_requests_tenant_status').on(table.tenantId, table.status),

    // Tenant isolation scan
    index('idx_reprocess_requests_tenant_id').on(table.tenantId),
  ],
);
