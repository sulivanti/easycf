import { pgTable, text, timestamp, varchar, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const tenants = pgTable('tenants', {
    id: varchar('id', { length: 36 }).primaryKey().$defaultFn(() => crypto.randomUUID()),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 100 }).unique().notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull()
});

export const insertTenantSchema = createInsertSchema(tenants);
export const selectTenantSchema = createSelectSchema(tenants);

export type Tenant = typeof tenants.$inferSelect;
export type NewTenant = typeof tenants.$inferInsert;
