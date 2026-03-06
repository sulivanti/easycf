// > ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.
// Campos obrigatórios definidos em DOC-DEV-001 § DATA-XXX (Campos Obrigatórios Padrão).

import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Tabela base de Tenants (MOD-000 — Fundação)
 * Campos obrigatórios: id (uuid), codigo, status, created_at, updated_at, deleted_at
 * Ref: DOC-DEV-001 § DATA-XXX › Campos Obrigatórios Padrão
 */
export const tenants = pgTable('tenants', {
    // --- Campos Constitucionais (DOC-DEV-001 obrigatórios) ---
    id: uuid('id').primaryKey().defaultRandom(),
    codigo: varchar('codigo', { length: 100 }).notNull().unique(), // identificador amigável (ex: "minha-empresa")
    status: text('status', { enum: ['active', 'inactive', 'suspended'] }).notNull().default('active'),

    // --- Campos de Negócio ---
    name: varchar('name', { length: 255 }).notNull(),

    // --- Timestamps e Soft-Delete (DOC-DEV-001 obrigatórios) ---
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }), // Soft-Delete: NULL = ativo
});

export const insertTenantSchema = createInsertSchema(tenants, {
    codigo: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/, 'Apenas letras minúsculas, números e hífens'),
    status: z.enum(['active', 'inactive', 'suspended']).default('active'),
});
export const selectTenantSchema = createSelectSchema(tenants);

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
