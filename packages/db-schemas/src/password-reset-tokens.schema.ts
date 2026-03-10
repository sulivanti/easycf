// > ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.
// Tokens de Recuperação de Senha — DOC-DEV-001 § DATA-000, FR-000-F04.

import { pgTable, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './users.schema.js';

/**
 * Tabela `password_reset_tokens` — Tokens de Recuperação (MOD-000 — F04 / DATA-000)
 *
 * - `token`: UUID único — single-use (used_at preenchido após uso)
 * - `expires_at`: TTL 1h a partir da criação
 * - Rate limit: 3 tokens por e-mail por 15min (controlado em serviço, FR-000-F04)
 * - Após uso: `used_at` é preenchido (nunca deletar — auditoria)
 */
export const passwordResetTokens = pgTable('password_reset_tokens', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'restrict' }),

    // --- Campos de Negócio (DATA-000) ---
    token: uuid('token').notNull().unique().defaultRandom(), // UUID gerado em tempo de criação
    usedAt: timestamp('used_at', { withTimezone: true }),    // NULL = não usado; single-use
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(), // TTL 1h

    // --- Timestamp ---
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const insertPasswordResetTokenSchema = createInsertSchema(passwordResetTokens, {
    expiresAt: z.coerce.date(),
});
export const selectPasswordResetTokenSchema = createSelectSchema(passwordResetTokens);

export type PasswordResetToken = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetTokens.$inferInsert;
