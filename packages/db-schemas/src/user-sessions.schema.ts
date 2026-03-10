// > ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.
// Sessões de Usuário — DOC-DEV-001 § DATA-000, FR-000-F01, ADR-000-01.

import { boolean, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from './users.schema.js';

/**
 * Tabela `user_sessions` — Sessões Ancoradas em Banco (MOD-000 — F01 / DATA-000)
 *
 * ADR-000-01: JWT carrega `sessionId` validado em banco em cada requisição.
 * JWT válido + is_revoked=true → 401 (Kill-Switch).
 * - `is_revoked`: booleano (BR-000-08 — entidades efêmeras não usam enum de status)
 * - `remember_me`: TTL 30d (true) ou 12h (false)
 * - `device_fp`: fingerprint de dispositivo (opcional)
 */
export const userSessions = pgTable('user_sessions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'restrict' }),

    // --- Campos de Negócio (DATA-000) ---
    deviceFp: text('device_fp'),                                          // device fingerprint (nullable)
    isRevoked: boolean('is_revoked').notNull().default(false),            // Kill-Switch
    rememberMe: boolean('remember_me').notNull().default(false),          // TTL 30d vs 12h
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),

    // --- Timestamps ---
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const insertUserSessionSchema = createInsertSchema(userSessions, {
    expiresAt: z.coerce.date(),
    rememberMe: z.boolean().default(false),
});
export const selectUserSessionSchema = createSelectSchema(userSessions);

export type UserSession = typeof userSessions.$inferSelect;
export type NewUserSession = typeof userSessions.$inferInsert;
