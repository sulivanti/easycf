// > ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.
// Campos obrigatórios definidos em DOC-DEV-001 § DATA-XXX (Campos Obrigatórios Padrão).

import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { tenants } from './tenants.schema.js';

/**
 * Tabela base de Usuários (MOD-000 — Fundação)
 * Campos obrigatórios: id (uuid), codigo, status, tenant_id, created_at, updated_at, deleted_at
 * FK com ON DELETE RESTRICT (NUNCA CASCADE) — Ref: DOC-DEV-001 § DATA-XXX › Relacionamentos
 */
export const users = pgTable('users', {
    // --- Campos Constitucionais (DOC-DEV-001 obrigatórios) ---
    id: uuid('id').primaryKey().defaultRandom(),
    codigo: varchar('codigo', { length: 100 }).notNull().unique(), // identificador amigável (ex: slug do usuário)
    status: text('status', { enum: ['active', 'inactive', 'pending', 'blocked'] }).notNull().default('pending'),
    tenantId: uuid('tenant_id')
        .notNull()
        .references(() => tenants.id, { onDelete: 'restrict' }), // MUST: RESTRICT, NUNCA CASCADE (DOC-DEV-001)

    // --- Campos de Negócio ---
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),

    // --- MFA / Segurança (campos adicionais de negócio) ---
    mfaSecret: varchar('mfa_secret', { length: 255 }),  // NULL = MFA não configurado

    // --- Timestamps e Soft-Delete (DOC-DEV-001 obrigatórios) ---
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }), // Soft-Delete: NULL = ativo
});

export const insertUserSchema = createInsertSchema(users, {
    email: z.string().email(),
    codigo: z.string().min(2).max(100),
    status: z.enum(['active', 'inactive', 'pending', 'blocked']).default('pending'),
});
export const selectUserSchema = createSelectSchema(users);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
