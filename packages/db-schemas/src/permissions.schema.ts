// > ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.
// Catálogo de Permissões (Escopos RBAC) — DOC-DEV-001 § DATA-000, FR-000-F12.

import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/**
 * Tabela `permissions` — Catálogo de Escopos RBAC (MOD-000 — F12 / DATA-000)
 *
 * - `scope` formato canônico: `modulo:recurso:acao` (ex: `users:profile:read`)
 * - UNIQUE em `scope` — Roles só podem atribuir escopos existentes aqui (FR-000-F06)
 * - Seed inicial obrigatório com escopos padrão do sistema
 * - Sem tenant_id: catálogo global compartilhado
 */
export const permissions = pgTable('permissions', {
    id: uuid('id').primaryKey().defaultRandom(),
    scope: varchar('scope', { length: 255 }).notNull().unique(), // formato: modulo:recurso:acao
    description: text('description'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const insertPermissionSchema = createInsertSchema(permissions, {
    scope: z
        .string()
        .min(5)
        .max(255)
        .regex(/^[a-z0-9_-]+:[a-z0-9_-]+:[a-z0-9_-]+$/, 'Formato inválido: modulo:recurso:acao'),
    description: z.string().max(500).optional(),
});
export const selectPermissionSchema = createSelectSchema(permissions);

export type Permission = typeof permissions.$inferSelect;
export type NewPermission = typeof permissions.$inferInsert;
