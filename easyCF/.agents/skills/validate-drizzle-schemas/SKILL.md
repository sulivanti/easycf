---
name: validate-drizzle-schemas
description: Validates Node.js Drizzle ORM schema files and database structures against the project's foundational guidelines (Multi-tenant isolation, anti-patterns, and Zod integration). Use this skill whenever generating, editing, or reviewing database schema files, specifically those using Drizzle ORM in this project.
---

# Validate Drizzle Schemas

When working with Drizzle ORM schemas in this project, you must enforce the following foundational architectural rules to ensure data isolation, security, and performance.

## 1. Anti-Pattern of Base Entities (Users and Tenants)

**Rule:** Never create or recreate schemas for fundamental entities like `users` or `tenants` or `sessions` in feature modules.
**Enforcement:**

- If a new entity needs to reference a user or a tenant, it MUST use a Foreign Key (UUID) pointing to the core `users` or `tenants` tables.
- Do not define `export const users = pgTable(...)` outside of the foundation module.

## 2. Multi-Tenant Isolation and N+1 Prevention

**Rule:** Data isolation between tenants is critical (B2B SaaS).
**Enforcement:**

- All read/list operations (`findMany`, `select()`) MUST inject and filter by `tenant_id`.
- Ensure querying is done via SQL `Joins` or RLS (Row-Level Security) at the database level.
- **NEVER** fetch large datasets into Node.js memory just to perform an `Array.filter(x => x.tenantId === currentTenant)` in application code.

## 3. Zod Typing and Integration

**Rule:** Drizzle schemas must be strongly typed and validated at runtime using Zod.
**Enforcement:**

- Every Drizzle schema definition should export its corresponding Zod schema for insertion and selection using `drizzle-zod` utilities.
- Example: `export const insertExampleSchema = createInsertSchema(exampleTable);`

## 4. Audit Trail and Soft-Delete (LGPD Compliance)

**Rule:** Maintain data integrity and auditability.
**Enforcement:**

- **Audit:** Critical business entities MUST have logic or hooks to record changes in the `audit_logs` table (Foundation module).
- **Soft-Delete:** Business tables MUST include a `deleted_at: timestamp("deleted_at", { withTimezone: true })` column.
- **NEVER** use physical hard deletes for business-relevant data.

## 5. Event Sourcing e Domain Events (DATA-003)

**Regra:** Entidades de negócio que representam agregados com mudança de estado DEVEM ter rastreabilidade via tabela `domain_events`.
**Enforcement:**

- Se o schema criado/editado representar uma entidade de negócio com ciclo de vida (ex: pedido, aprovação, documento, sessão), **verifique se o repositório correspondente emite eventos de domínio** na tabela `domain_events` da Foundation.
- O schema da `domain_events` deve seguir o padrão genérico definido em **`DATA-003`** (campos obrigatórios: `tenant_id`, `entity_type`, `entity_id`, `event_type`, `payload`, `correlation_id`, `created_at`, `created_by`).
- **NUNCA** criar tabelas satélites de "logs por funcionalidade" — a `domain_events` é a **fonte única de verdade para timelines e `view_history`** (conforme `DOC-ARC-003 §1 Dogma 6`).
- O índice composto `(tenant_id, entity_type, entity_id, created_at DESC)` é **obrigatório** na tabela `domain_events`.
- Se o módulo usa Outbox/Inbox (mensageria), verificar presença do campo `processed_at` na tabela de outbox e isolamento do Worker fora da API (conforme `DATA-012`).

> 📄 **Fonte canônica das regras completas:** [`DATA-000.md → DATA-003`](../../docs/04_modules/mod-000-foundation/requirements/data/DATA-000.md) e [`DOC-ARC-003`](../../docs/01_normativos/DOC-ARC-003__Ponte_de_Rastreabilidade.md). Não duplique o Catálogo de Eventos aqui — ele vive nos arquivos `DATA-{ID}.md` de cada módulo.

---

## 6. Validação de Campos Constitucionais (DOC-DEV-001)

**Regra:** Todo schema de entidade de negócio gerado ou editado neste projeto DEVE conter os campos arquiteturais obrigatórios definidos em `DOC-DEV-001 § DATA-XXX — Campos Obrigatórios Padrão`. A ausência de qualquer um destes campos é uma **Violação Crítica**.

**Enforcement — Checklist obrigatório:**

| Campo | Tipo esperado (Drizzle) | Regra |
|---|---|---|
| `id` | `uuid('id').primaryKey().defaultRandom()` | **NUNCA** usar `varchar`, `integer` ou outro tipo para a PK principal |
| `codigo` | `varchar('codigo', { length: 100 }).notNull().unique()` | Identificador amigável de negócio — NUNCA omitir |
| `status` | `text('status', { enum: [...] }).notNull()` | Deve ser enum tipado com os estados válidos do negócio |
| `tenant_id` | `uuid('tenant_id').notNull().references(...)` | Obrigatório em B2B — FK com `{ onDelete: 'restrict' }` |
| `created_at` | `timestamp(..., { withTimezone: true }).defaultNow().notNull()` | Obrigatório, com fuso UTC |
| `updated_at` | `timestamp(..., { withTimezone: true }).defaultNow().notNull()` | Obrigatório, com fuso UTC |
| `deleted_at` | `timestamp(..., { withTimezone: true })` (nullable) | Soft-Delete — ausência é considerada bug arquitetural |

**Violações específicas a reportar:**

- `onDelete: 'cascade'` em qualquer FK → **Violação Crítica** (MUST usar `'restrict'`)
- `id` como `varchar`, `serial` ou `integer` → **Violação Crítica** (MUST ser `uuid`)
- Ausência de `deleted_at` em tabela de negócio → **Violação Alta** (hard delete proibido)
- Ausência de `codigo` → **Violação Média** (identificador amigável obrigatório)
- `timestamp` sem `{ withTimezone: true }` → **Violação Média** (UTC obrigatório)

---

## Output Format

If the validation passes, output a short success message.
If the validation fails, provide a clear list of violations citing the specific rule broken (e.g., "Violation of Multi-Tenant Isolation: The query does not filter by tenant_id at the database level"). Include code snippets showing how to fix the issue.
