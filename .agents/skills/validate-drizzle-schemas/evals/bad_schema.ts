import { pgTable, serial, text, varchar, timestamp } from 'drizzle-orm/pg-core';

// Tabela users indevidamente recriada
export const users = pgTable('users', {
    id: serial('id').primaryKey(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    name: text('name').notNull(),
    passwordHash: text('password_hash').notNull(),
});

// Tabela de negócio omitindo tenant_id
export const transactions = pgTable('transactions', {
    id: serial('id').primaryKey(),
    amount: text('amount').notNull(),
    date: timestamp('date').defaultNow().notNull(),
    userId: serial('user_id').references(() => users.id),
});

// Falha de N+1 e RLS na leitura
export async function getAllTransactionsForTenant(db: any, currentTenantId: string) {
    const allTransactions = await db.select().from(transactions);
    return allTransactions.filter((t: any) => t.tenantId === currentTenantId);
}
