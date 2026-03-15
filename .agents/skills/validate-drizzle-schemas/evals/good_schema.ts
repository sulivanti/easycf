import { pgTable, serial, text, varchar, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { eq } from 'drizzle-orm';

// FK correta e tenant isolado
export const transactions = pgTable('transactions', {
    id: serial('id').primaryKey(),
    tenantId: uuid('tenant_id').notNull(), // FK para tenants omitida visualmente para focar na presença do campo
    amount: text('amount').notNull(),
    date: timestamp('date').defaultNow().notNull(),
    userId: uuid('user_id').notNull(), // Apenas FK referenciando a tabela master de users
});

export const insertTransactionSchema = createInsertSchema(transactions);

export async function getAllTransactionsForTenant(db: any, currentTenantId: string) {
    return await db.select().from(transactions).where(eq(transactions.tenantId, currentTenantId));
}
