/**
 * @contract DATA-001, DOC-FND-000 §2, DOC-GNP-00, EX-DB-001, EX-NAME-001
 *
 * Drizzle ORM schema definitions for the Identity Advanced module (MOD-004).
 * 3 tables: user_org_scopes, access_shares, access_delegations.
 *
 * All FKs use ON DELETE RESTRICT (DATA-001).
 * Soft-delete via deleted_at on user_org_scopes (LGPD compliance).
 * access_shares/access_delegations use status lifecycle (ACTIVE→REVOKED→EXPIRED).
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  jsonb,
  index,
  uniqueIndex,
  check,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users, tenants, roles } from './foundation.js';
import { orgUnits } from './org-units.js';

// ---------------------------------------------------------------------------
// 1. user_org_scopes — Vínculo Usuário ↔ Nó Organizacional (DATA-001 §user_org_scopes)
// ---------------------------------------------------------------------------
export const userOrgScopes = pgTable(
  'user_org_scopes',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    orgUnitId: uuid('org_unit_id')
      .notNull()
      .references(() => orgUnits.id, { onDelete: 'restrict' }),
    scopeType: varchar('scope_type', { length: 16 }).notNull().$type<'PRIMARY' | 'SECONDARY'>(),
    grantedBy: uuid('granted_by').references(() => users.id, {
      onDelete: 'restrict',
    }),
    validFrom: timestamp('valid_from', { withTimezone: true }).notNull().defaultNow(),
    validUntil: timestamp('valid_until', { withTimezone: true }),
    status: varchar('status', { length: 16 })
      .notNull()
      .default('ACTIVE')
      .$type<'ACTIVE' | 'INACTIVE'>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => [
    // CHECK: scope_type enum (DATA-001)
    check('user_org_scopes_scope_type_check', sql`${table.scopeType} IN ('PRIMARY', 'SECONDARY')`),

    // CHECK: status enum (DATA-001)
    check('user_org_scopes_status_check', sql`${table.status} IN ('ACTIVE', 'INACTIVE')`),

    // UNIQUE: um usuário só pode ter um vínculo por nó organizacional (DATA-001)
    uniqueIndex('uq_user_org_scopes_user_org').on(table.userId, table.orgUnitId),

    // Hot path: listagem por usuário (DATA-001)
    index('idx_user_org_scopes_tenant_user').on(table.tenantId, table.userId, table.status),

    // Busca: quem atua nesta área? (DATA-001)
    index('idx_user_org_scopes_org_unit').on(table.tenantId, table.orgUnitId, table.status),

    // Parcial: background job de expiração (DATA-001)
    index('idx_user_org_scopes_expiration')
      .on(table.validUntil, table.status)
      .where(sql`${table.validUntil} IS NOT NULL AND ${table.status} = 'ACTIVE'`),
  ],
);

// ---------------------------------------------------------------------------
// 2. access_shares — Compartilhamento Controlado (DATA-001 §access_shares)
// ---------------------------------------------------------------------------
export const accessShares = pgTable(
  'access_shares',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    grantorId: uuid('grantor_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    granteeId: uuid('grantee_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    resourceType: varchar('resource_type', { length: 32 })
      .notNull()
      .$type<'org_unit' | 'tenant' | 'process'>(),
    resourceId: uuid('resource_id').notNull(),
    allowedActions: jsonb('allowed_actions').notNull().$type<string[]>(),
    reason: text('reason').notNull(),
    authorizedBy: uuid('authorized_by')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    validFrom: timestamp('valid_from', { withTimezone: true }).notNull().defaultNow(),
    validUntil: timestamp('valid_until', { withTimezone: true }).notNull(),
    status: varchar('status', { length: 16 })
      .notNull()
      .default('ACTIVE')
      .$type<'ACTIVE' | 'REVOKED' | 'EXPIRED'>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    revokedBy: uuid('revoked_by').references(() => users.id, {
      onDelete: 'restrict',
    }),
  },
  (table) => [
    // CHECK: resource_type enum (DATA-001)
    check(
      'access_shares_resource_type_check',
      sql`${table.resourceType} IN ('org_unit', 'tenant', 'process')`,
    ),

    // CHECK: status enum (DATA-001)
    check('access_shares_status_check', sql`${table.status} IN ('ACTIVE', 'REVOKED', 'EXPIRED')`),

    // CHECK: valid_until > valid_from (BR-001.10, DATA-001)
    check('access_shares_validity_check', sql`${table.validUntil} > ${table.validFrom}`),

    // Hot path: listagem admin (DATA-001)
    index('idx_access_shares_tenant_status').on(table.tenantId, table.status, table.createdAt),

    // Hot path: /my/shared-accesses (DATA-001)
    index('idx_access_shares_grantee').on(table.tenantId, table.granteeId, table.status),

    // Filtro por solicitante (DATA-001)
    index('idx_access_shares_grantor').on(table.tenantId, table.grantorId, table.status),

    // Busca: quem tem acesso a este recurso? (DATA-001)
    index('idx_access_shares_resource').on(
      table.tenantId,
      table.resourceType,
      table.resourceId,
      table.status,
    ),

    // Parcial: background job de expiração (DATA-001)
    index('idx_access_shares_expiration')
      .on(table.validUntil, table.status)
      .where(sql`${table.status} = 'ACTIVE'`),
  ],
);

// ---------------------------------------------------------------------------
// 3. access_delegations — Delegação Temporária (DATA-001 §access_delegations)
// ---------------------------------------------------------------------------
export const accessDelegations = pgTable(
  'access_delegations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    tenantId: uuid('tenant_id')
      .notNull()
      .references(() => tenants.id, { onDelete: 'restrict' }),
    delegatorId: uuid('delegator_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    delegateeId: uuid('delegatee_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    roleId: uuid('role_id').references(() => roles.id, {
      onDelete: 'restrict',
    }),
    orgUnitId: uuid('org_unit_id').references(() => orgUnits.id, {
      onDelete: 'restrict',
    }),
    delegatedScopes: jsonb('delegated_scopes').notNull().$type<string[]>(),
    reason: text('reason').notNull(),
    validUntil: timestamp('valid_until', { withTimezone: true }).notNull(),
    status: varchar('status', { length: 16 })
      .notNull()
      .default('ACTIVE')
      .$type<'ACTIVE' | 'REVOKED' | 'EXPIRED'>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (table) => [
    // CHECK: status enum (DATA-001)
    check(
      'access_delegations_status_check',
      sql`${table.status} IN ('ACTIVE', 'REVOKED', 'EXPIRED')`,
    ),

    // CHECK: valid_until > created_at (BR-001.10, DATA-001)
    check('access_delegations_validity_check', sql`${table.validUntil} > ${table.createdAt}`),

    // Hot path: listagem (DATA-001)
    index('idx_access_delegations_tenant_status').on(table.tenantId, table.status, table.createdAt),

    // Filtro: "delegações que dei" (DATA-001)
    index('idx_access_delegations_delegator').on(table.tenantId, table.delegatorId, table.status),

    // Hot path: "delegações que recebi" (DATA-001)
    index('idx_access_delegations_delegatee').on(table.tenantId, table.delegateeId, table.status),

    // Parcial: background job de expiração (DATA-001)
    index('idx_access_delegations_expiration')
      .on(table.validUntil, table.status)
      .where(sql`${table.status} = 'ACTIVE'`),
  ],
);
