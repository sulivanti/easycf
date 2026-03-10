// > ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.
// Vínculo Usuário-Filial-Role — DOC-DEV-001 § DATA-000, FR-000-F09.

import { pgTable, timestamp, unique, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { branches } from './branches.schema.js';
import { roles } from './roles.schema.js';
import { users } from './users.schema.js';

/**
 * Tabela `tenant_users` — Vínculo Usuário–Filial–Role (MOD-000 — F09 / DATA-000)
 *
 * - UNIQUE: (user_id, branch_id, role_id) — impede duplicidade de vínculo
 * - Múltiplos vínculos por usuário = escopos combinados (FR-000-F09)
 * - Remoção de vínculo = 204 sem soft-delete (vínculo efêmero)
 * - Todos os FK com ON DELETE RESTRICT (DOC-DEV-001)
 */
export const tenantUsers = pgTable(
    'tenant_users',
    {
        id: uuid('id').primaryKey().defaultRandom(),
        userId: uuid('user_id')
            .notNull()
            .references(() => users.id, { onDelete: 'restrict' }),
        branchId: uuid('branch_id')
            .notNull()
            .references(() => branches.id, { onDelete: 'restrict' }),
        roleId: uuid('role_id')
            .notNull()
            .references(() => roles.id, { onDelete: 'restrict' }),

        // --- Timestamps ---
        createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
        updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    },
    (t) => ({
        // UNIQUE INDEX: (user_id, branch_id, role_id)
        uniqueVinculo: unique('uq_tenant_users_vinculo').on(t.userId, t.branchId, t.roleId),
    }),
);

export const insertTenantUserSchema = createInsertSchema(tenantUsers);
export const selectTenantUserSchema = createSelectSchema(tenantUsers);

export type TenantUser = typeof tenantUsers.$inferSelect;
export type NewTenantUser = typeof tenantUsers.$inferInsert;
