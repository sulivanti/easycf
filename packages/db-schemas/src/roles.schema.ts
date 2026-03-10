// > ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.
// Roles com array de escopos RBAC — DOC-DEV-001 § DATA-000, FR-000-F06.

import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { branches } from './branches.schema.js';

/**
 * Tabela `roles` — Perfis RBAC (MOD-000 — F06 / DATA-000)
 *
 * - `scopes`: array de strings no formato `modulo:recurso:acao`
 * - Validação referencial: escopos devem estar em `permissions` (checada em serviço)
 * - Cache Redis TTL 5min por (userId, tenantId) — FR-000-F06
 * - Herança de escopos do pai; DENY explícito prevalece — BR-000-04
 * - Soft-Delete via `deleted_at` (BR-000-07)
 */
export const roles = pgTable('roles', {
    // --- Campos Constitucionais (DOC-DEV-001 — obrigatórios) ---
    id: uuid('id').primaryKey().defaultRandom(),
    codigo: varchar('codigo', { length: 50 }).notNull().unique(),
    tenantId: uuid('tenant_id')
        .notNull()
        .references(() => branches.id, { onDelete: 'restrict' }),

    // --- Campos de Negócio (DATA-000) ---
    name: varchar('name', { length: 255 }).notNull(),
    scopes: text('scopes').array().notNull().default([]), // text[] — lista de escopos modulo:recurso:acao

    // --- Timestamps e Soft-Delete (DOC-DEV-001 — obrigatórios) ---
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const insertRoleSchema = createInsertSchema(roles, {
    codigo: z.string().min(2).max(50).regex(/^[a-zA-Z0-9_-]+$/),
    name: z.string().min(1).max(255),
    scopes: z
        .array(z.string().regex(/^[a-z0-9_-]+:[a-z0-9_-]+:[a-z0-9_-]+$/, 'Formato inválido'))
        .default([]),
});
export const selectRoleSchema = createSelectSchema(roles);

export type Role = typeof roles.$inferSelect;
export type NewRole = typeof roles.$inferInsert;
