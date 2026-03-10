// > ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.
// Campos obrigatórios definidos em DOC-DEV-001 § DATA-XXX e DATA-000 (MOD-000 Foundation).

import { boolean, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { branches } from './branches.schema.js';

/** Enum canônico de status de usuário — BR-000-08 (taxonomia canônica) */
export const USER_STATUS = ['ACTIVE', 'BLOCKED', 'INACTIVE', 'PENDING'] as const;
export type UserStatus = typeof USER_STATUS[number];

/**
 * Tabela base de Usuários (MOD-000 — Foundation / DATA-000)
 * - PK: uuid, identificador amigável: codigo (unique)
 * - tenant_id → branches (ON DELETE RESTRICT)
 * - Soft-Delete via deleted_at (BR-000-07)
 * - forcePwdReset: gate para F10 (POST /auth/change-password)
 */
export const users = pgTable('users', {
    // --- Campos Constitucionais (DOC-DEV-001 — obrigatórios) ---
    id: uuid('id').primaryKey().defaultRandom(),
    codigo: varchar('codigo', { length: 50 }).notNull().unique(),
    status: text('status', { enum: USER_STATUS }).notNull().default('PENDING'),
    tenantId: uuid('tenant_id')
        .notNull()
        .references(() => branches.id, { onDelete: 'restrict' }), // MUST: RESTRICT, NUNCA CASCADE

    // --- Campos de Negócio (DATA-000) ---
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    appleSub: text('apple_sub').unique(),
    avatarUrl: text('avatar_url'),

    // --- MFA / Segurança (SEC-000) ---
    mfaSecret: text('mfa_secret'),            // NULL = MFA não habilitado; criptografado em repouso
    forcePwdReset: boolean('force_pwd_reset').notNull().default(false), // gate F10

    // --- Timestamps e Soft-Delete (DOC-DEV-001 — obrigatórios) ---
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const insertUserSchema = createInsertSchema(users, {
    email: z.string().email(),
    codigo: z.string().min(2).max(50).regex(/^[a-zA-Z0-9_-]+$/),
    status: z.enum(USER_STATUS).default('PENDING'),
});
export const selectUserSchema = createSelectSchema(users);

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
