# Skill: drizzle-orm (Referência)

Referência completa de padrões Drizzle ORM para o EasyCodeFramework.

> **IMPORTANTE:** Ao criar ou editar schemas Drizzle, você DEVE também executar `/project:validate-drizzle` antes de finalizar. Esta referência NÃO cobre as regras mandatórias de arquitetura (multi-tenant, soft-delete, Zod, Event Sourcing).

## Argumento

$ARGUMENTS pode conter o tópico de consulta (ex: `joins`, `migrations`, `relations`, `transactions`). Se não fornecido, apresente o índice de tópicos.

## Referência Rápida

Para consultas detalhadas, leia os arquivos de referência em `.agents/references/drizzle-orm/`:

- **advanced-schemas.md** — Custom types, composite keys, indexes, constraints, multi-tenant
- **query-patterns.md** — Subqueries, CTEs, raw SQL, prepared statements, batch
- **performance.md** — Connection pooling, query optimization, N+1 prevention
- **vs-prisma.md** — Comparação de features, guia de migração

## Padrões Essenciais deste Projeto

### Schema com Multi-Tenant

```typescript
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const items = pgTable('items', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull().references(() => tenants.id),
  name: text('name').notNull(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const insertItemSchema = createInsertSchema(items);
export type Item = typeof items.$inferSelect;
```

### Query com Isolamento de Tenant

```typescript
import { eq, and, isNull } from 'drizzle-orm';

const result = await db
  .select()
  .from(items)
  .where(and(
    eq(items.tenantId, currentTenantId),
    isNull(items.deletedAt)
  ));
```

## Red Flags

Pare e reconsidere se:
- Usando `any`/`unknown` para colunas JSON sem anotação de tipo
- Construindo SQL raw sem usar template `sql` (risco de injection)
- Não usando transações para modificações multi-step
- Fetch de todas as rows sem paginação em produção
- Missing indexes em FKs ou colunas frequentemente consultadas
