---
name: validate-drizzle-schemas
description: Validates Node.js Drizzle ORM schema files and database structures against the project's foundational guidelines (Multi-tenant isolation, anti-patterns, and Zod integration). Use this skill whenever generating, editing, or reviewing database schema files, specifically those using Drizzle ORM in this project.
---

# Validate Drizzle Schemas

When working with Drizzle ORM schemas in this project, you must enforce the following foundational architectural rules to ensure data isolation, security, and performance.

## 1. Anti-Padrão de Entidades Base (Users e Tenants)

**Regra:** Nunca crie ou recrie schemas para entidades fundamentais como `users`, `tenants` ou `sessions` em módulos de funcionalidade.
**Enforcement:**

- Se uma nova entidade precisar referenciar um user ou tenant, ela DEVE usar uma Foreign Key (UUID) apontando para as tabelas centrais `users` ou `tenants`.
- Não defina `export const users = pgTable(...)` fora do módulo de fundação.

## 2. Isolamento Multi-Tenant e Prevenção de N+1

**Regra:** O isolamento de dados entre tenants é crítico (B2B SaaS).
**Enforcement:**

- Todas as operações de leitura/listagem (`findMany`, `select()`) DEVEM injetar e filtrar por `tenant_id`.
- Garanta que as consultas sejam feitas via SQL `Joins` ou RLS (Row-Level Security) no nível do banco de dados.
- **NUNCA** carregue grandes volumes de dados na memória do Node.js apenas para realizar um `Array.filter(x => x.tenantId === currentTenant)` na camada de aplicação.

## 3. Tipagem e Integração com Zod

**Regra:** Os schemas Drizzle devem ser fortemente tipados e validados em runtime usando Zod.
**Enforcement:**

- Toda definição de schema Drizzle deve exportar seu schema Zod correspondente para inserção e seleção usando os utilitários do `drizzle-zod`.
- Exemplo: `export const insertExampleSchema = createInsertSchema(exampleTable);`

## 4. Trilha de Auditoria e Soft-Delete (Conformidade LGPD)

**Regra:** Mantenha a integridade e auditabilidade dos dados.
**Enforcement:**

- **Auditoria:** Entidades de negócio críticas DEVEM ter lógica ou hooks para registrar alterações na tabela `audit_logs` (módulo Foundation).
- **Soft-Delete:** Tabelas de negócio DEVEM incluir uma coluna `deleted_at: timestamp("deleted_at", { withTimezone: true })`.
- **NUNCA** use exclusão física (hard delete) para dados relevantes ao negócio.

## 5. Event Sourcing e Domain Events (DATA-003)

**Regra:** Entidades de negócio que representam agregados com mudança de estado DEVEM ter rastreabilidade via tabela `domain_events`.
**Enforcement:**

- Se o schema criado/editado representar uma entidade de negócio com ciclo de vida (ex: pedido, aprovação, documento, sessão), **verifique se o repositório correspondente emite eventos de domínio** na tabela `domain_events` da Foundation.
- O schema da `domain_events` deve seguir o padrão genérico definido em **`DATA-003`** (campos obrigatórios: `tenant_id`, `entity_type`, `entity_id`, `event_type`, `payload`, `correlation_id`, `created_at`, `created_by`).
- **NUNCA** criar tabelas satélites de "logs por funcionalidade" — a `domain_events` é a **fonte única de verdade para timelines e `view_history`** (conforme `DOC-ARC-003 §1 Dogma 6`).
- O índice composto `(tenant_id, entity_type, entity_id, created_at DESC)` é **obrigatório** na tabela `domain_events`.
- Se o módulo usa Outbox/Inbox (mensageria), verificar presença do campo `processed_at` na tabela de outbox e isolamento do Worker fora da API (conforme `DATA-012`).

> 📄 **Fonte canônica das regras completas:** [`DATA-000.md → DATA-003`](../../../docs/04_modules/mod-xxx-foundation/requirements/data/DATA-000.md) e [`DOC-ARC-003`](../../../docs/01_normativos/DOC-ARC-003__Ponte_de_Rastreabilidade.md). Não duplique o Catálogo de Eventos aqui — ele vive nos arquivos `DATA-{ID}.md` de cada módulo.

## 6. Storage Objects e Upload (DOC-PADRAO-005)

**Regra:** Se o módulo define ou referencia a tabela `storage_objects`, as seguintes validações se aplicam.

### 6.1 Colunas Obrigatórias
A tabela `storage_objects` DEVE conter todas as colunas definidas em DOC-PADRAO-005 §5:
- `id` (UUID, PK), `tenant_id` (UUID, NOT NULL, FK tenants), `entity_type` (VARCHAR(64), NOT NULL)
- `entity_id` (UUID, nullable), `bucket` (VARCHAR(128), NOT NULL), `object_key` (TEXT, NOT NULL)
- `filename` (VARCHAR(255), NOT NULL), `mime_type` (VARCHAR(127), NOT NULL), `size_bytes` (BIGINT, NOT NULL)
- `purpose` (VARCHAR(32), NOT NULL — enum: avatar|attachment|import|export|temp)
- `upload_status` (VARCHAR(20), NOT NULL, DEFAULT 'pending' — enum: pending|confirmed|orphan|deleted)
- `scan_status` (VARCHAR(20), DEFAULT 'skipped' — enum: pending|passed|failed|skipped)
- `uploaded_by` (UUID, FK users, nullable), `correlation_id` (UUID, NOT NULL)
- `expires_at` (TIMESTAMPTZ, nullable), `deleted_at` (TIMESTAMPTZ, nullable)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW()), `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())

### 6.2 Índices Obrigatórios
- `idx_storage_objects_tenant_entity` em (tenant_id, entity_type, entity_id) WHERE deleted_at IS NULL
- `idx_storage_objects_orphan_purge` em (upload_status, created_at) WHERE upload_status = 'pending'
- `idx_storage_objects_expires` em (expires_at) WHERE expires_at IS NOT NULL AND deleted_at IS NULL

### 6.3 Enums Tipados
Os campos `purpose`, `upload_status` e `scan_status` DEVEM usar `pgEnum` do Drizzle (não strings livres).

### 6.4 MIME Allowlist
Módulos que estendem o catálogo de `entity_types` DEVEM declarar os MIME types permitidos por `purpose`. MIME types globalmente bloqueados (SEC-007): `text/html`, `application/x-php`, `application/javascript`, `application/x-sh`, `image/svg+xml`, `application/octet-stream` — SEMPRE rejeitados.

### 6.5 Soft-Delete e Correlation
- `deleted_at` DEVE seguir o padrão de soft-delete (Regra 4).
- `correlation_id` DEVE ser NOT NULL para rastreabilidade E2E (DOC-ARC-003).

> 📄 **Fonte canônica:** [`DOC-PADRAO-005`](../../../docs/01_normativos/DOC-PADRAO-005__Armazenamento_e_Storage.md). Para regras de presign flow, jobs de purge/re-encode e avatar processing, consulte as seções 6, 7 e 9 do normativo.

---

## Formato de Saída

Se a validação for aprovada, exiba uma mensagem curta de sucesso.
Se a validação falhar, forneça uma lista clara de violações citando a regra específica quebrada (ex: "Violação de Isolamento Multi-Tenant: A query não filtra por tenant_id no nível do banco de dados"). Inclua trechos de código mostrando como corrigir o problema.
