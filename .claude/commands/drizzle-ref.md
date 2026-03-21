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

### Domain Events — Tabela de Outbox (Regra #5)

Módulos que emitem domain events DEVEM usar a tabela de outbox pattern para garantir atomicidade entre mutação e emissão do evento. O schema compliant é:

```typescript
import { pgTable, uuid, text, timestamp, jsonb, boolean } from 'drizzle-orm/pg-core';

export const domainEvents = pgTable('domain_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),
  eventType: text('event_type').notNull(),       // ex: 'UserCreated', 'CaseTransitioned'
  aggregateId: uuid('aggregate_id').notNull(),    // ID da entidade que originou o evento
  aggregateType: text('aggregate_type').notNull(), // ex: 'User', 'Case'
  actorId: uuid('actor_id').notNull(),
  correlationId: uuid('correlation_id').notNull(),
  payload: jsonb('payload').notNull(),            // dados do evento (sem PII — ver EX-PII-001)
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull().defaultNow(),
  published: boolean('published').notNull().default(false), // outbox: false = pendente
  publishedAt: timestamp('published_at', { withTimezone: true }),
});

// Índices obrigatórios:
// idx_domain_events_unpublished (published, occurred_at) WHERE published = false
// idx_domain_events_tenant_aggregate (tenant_id, aggregate_type, aggregate_id)
// idx_domain_events_correlation (correlation_id)
```

**Regra:** A inserção do domain event DEVE ocorrer na **mesma transação** da mutação da entidade. O worker de publicação lê eventos com `published = false` e os despacha para o message broker.

## Red Flags

Pare e reconsidere se:
- Usando `any`/`unknown` para colunas JSON sem anotação de tipo
- Construindo SQL raw sem usar template `sql` (risco de injection)
- Não usando transações para modificações multi-step
- Fetch de todas as rows sem paginação em produção
- Missing indexes em FKs ou colunas frequentemente consultadas
- Emitindo domain events fora da transação de mutação (risco de inconsistência)
