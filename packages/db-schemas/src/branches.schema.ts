// > ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.
// Campos obrigatórios definidos em DOC-DEV-001 § DATA-000 (MOD-000 Foundation — Filiais Multi-Tenant).

import { pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

/** Enum canônico de status de filial — BR-000-08 */
export const BRANCH_STATUS = ['ACTIVE', 'BLOCKED', 'INACTIVE'] as const;
export type BranchStatus = typeof BRANCH_STATUS[number];

/**
 * Tabela `branches` — Filiais / Multi-Tenant (MOD-000 — F07 / DATA-000)
 *
 * - Hierarquia PAI → FILHA via `parent_id` auto-referente (ON DELETE RESTRICT)
 * - `tenant_id` referencia a própria tabela (raiz é filial com tenant_id = id)
 * - Bloqueio de filial propaga para usuários (BR-000-05)
 * - Soft-Delete via `deleted_at` (BR-000-07)
 */
export const branches = pgTable('branches', {
    // --- Campos Constitucionais (DOC-DEV-001 — obrigatórios) ---
    id: uuid('id').primaryKey().defaultRandom(),
    codigo: varchar('codigo', { length: 50 }).notNull().unique(),
    status: text('status', { enum: BRANCH_STATUS }).notNull().default('ACTIVE'),
    tenantId: uuid('tenant_id').notNull(), // FK → branches.id (definida em nível de migration)

    // --- Campos de Negócio (DATA-000) ---
    name: varchar('name', { length: 255 }).notNull(),
    parentId: uuid('parent_id'), // NULL = filial raiz; FK → branches.id ON DELETE RESTRICT

    // --- Timestamps e Soft-Delete (DOC-DEV-001 — obrigatórios) ---
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const insertBranchSchema = createInsertSchema(branches, {
    codigo: z.string().min(2).max(50).regex(/^[a-zA-Z0-9_-]+$/),
    status: z.enum(BRANCH_STATUS).default('ACTIVE'),
    name: z.string().min(1).max(255),
});
export const selectBranchSchema = createSelectSchema(branches);

export type Branch = typeof branches.$inferSelect;
export type NewBranch = typeof branches.$inferInsert;
