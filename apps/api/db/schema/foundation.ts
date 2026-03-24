/**
 * @contract DATA-000, DOC-FND-000 §1-§2, DOC-GNP-00
 *
 * Drizzle ORM schema definitions for the Foundation module (MOD-000).
 * 8 tables: users, content_users, user_sessions, tenants, roles,
 * role_permissions, tenant_users, domain_events.
 *
 * All FKs use ON DELETE RESTRICT (BR-004 / DATA-000).
 * Soft-delete via deleted_at (LGPD compliance).
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  timestamp,
  smallint,
  jsonb,
  index,
  uniqueIndex,
  check,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// 1. users — Identidade de Autenticação (DATA-000 §1)
// ---------------------------------------------------------------------------
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    codigo: varchar('codigo', { length: 100 }).notNull().unique(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    mfaSecret: text('mfa_secret'),
    status: text('status').notNull().$type<'ACTIVE' | 'BLOCKED' | 'PENDING' | 'INACTIVE'>(),
    forcePwdReset: boolean('force_pwd_reset').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    check(
      'users_status_check',
      sql`${table.status} IN ('ACTIVE', 'BLOCKED', 'PENDING', 'INACTIVE')`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// 2. content_users — Dados de Exibição do Usuário (DATA-000 §2)
// ---------------------------------------------------------------------------
export const contentUsers = pgTable(
  'content_users',
  {
    userId: uuid('user_id')
      .primaryKey()
      .references(() => users.id, { onDelete: 'restrict' }),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    cpfCnpj: varchar('cpf_cnpj', { length: 20 }),
    avatarUrl: text('avatar_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // UNIQUE parcial: cpf_cnpj único apenas quando preenchido (DATA-000 §2)
    uniqueIndex('content_users_cpf_cnpj_idx')
      .on(table.cpfCnpj)
      .where(sql`${table.cpfCnpj} IS NOT NULL`),
  ],
);

// ---------------------------------------------------------------------------
// 3. user_sessions — Sessões Ancoradas em Banco (DATA-000 §3)
// ---------------------------------------------------------------------------
export const userSessions = pgTable(
  'user_sessions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    isRevoked: boolean('is_revoked').notNull().default(false),
    deviceFp: text('device_fp'),
    rememberMe: boolean('remember_me').notNull().default(false),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (table) => [index('user_sessions_user_revoked_idx').on(table.userId, table.isRevoked)],
);

// ---------------------------------------------------------------------------
// 4. tenants — Filiais Multi-Tenant (DATA-000 §4)
// ---------------------------------------------------------------------------
export const tenants = pgTable(
  'tenants',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    codigo: varchar('codigo', { length: 100 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    status: text('status').notNull().$type<'ACTIVE' | 'BLOCKED' | 'INACTIVE'>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    check('tenants_status_check', sql`${table.status} IN ('ACTIVE', 'BLOCKED', 'INACTIVE')`),
  ],
);

// ---------------------------------------------------------------------------
// 5. roles — Papéis de Acesso (DATA-000 §5)
// ---------------------------------------------------------------------------
export const roles = pgTable(
  'roles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    codigo: varchar('codigo', { length: 100 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    status: text('status').notNull().$type<'ACTIVE' | 'INACTIVE'>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [check('roles_status_check', sql`${table.status} IN ('ACTIVE', 'INACTIVE')`)],
);

// ---------------------------------------------------------------------------
// 6. role_permissions — Escopos por Role (DATA-000 §6)
// ---------------------------------------------------------------------------
export const rolePermissions = pgTable(
  'role_permissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'restrict' }),
    scope: varchar('scope', { length: 100 }).notNull(),
  },
  (table) => [
    uniqueIndex('role_permissions_role_scope_idx').on(table.roleId, table.scope),
    check(
      'role_permissions_scope_check',
      sql`${table.scope} ~ '^[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*){1,2}$'`,
    ),
  ],
);

// ---------------------------------------------------------------------------
// 7. tenant_users — Vínculo Usuário-Filial com Role (DATA-000 §7)
// ---------------------------------------------------------------------------
export const tenantUsers = pgTable(
  'tenant_users',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'restrict' }),
    status: text('status').notNull().$type<'ACTIVE' | 'BLOCKED' | 'INACTIVE'>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.tenantId] }),
    check('tenant_users_status_check', sql`${table.status} IN ('ACTIVE', 'BLOCKED', 'INACTIVE')`),
  ],
);

// ---------------------------------------------------------------------------
// 8. domain_events — Tabela Unificada de Eventos (DATA-000 §8, DATA-003)
// ---------------------------------------------------------------------------
export const domainEvents = pgTable(
  'domain_events',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    eventType: text('event_type').notNull(),
    payload: jsonb('payload').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    createdBy: uuid('created_by'),
    correlationId: text('correlation_id').notNull(),
    causationId: text('causation_id'),
    sensitivityLevel: smallint('sensitivity_level').notNull().default(0),
    dedupeKey: text('dedupe_key'),
  },
  (table) => [
    // Timeline: entidade + ordem cronológica
    index('domain_events_timeline_idx').on(
      table.tenantId,
      table.entityType,
      table.entityId,
      table.createdAt,
    ),
    // Filtro por tipo de evento
    index('domain_events_event_type_idx').on(table.tenantId, table.eventType, table.createdAt),
    // Deduplicação idempotente (parcial: somente onde dedupe_key preenchido)
    uniqueIndex('domain_events_dedupe_idx')
      .on(table.tenantId, table.dedupeKey)
      .where(sql`${table.dedupeKey} IS NOT NULL`),
  ],
);
