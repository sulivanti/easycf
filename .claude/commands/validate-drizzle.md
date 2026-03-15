# Skill: validate-drizzle-schemas

Valida schemas Drizzle ORM contra as regras fundamentais do projeto: isolamento multi-tenant, anti-patterns, integração Zod, audit trail, soft-delete e domain events.

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `validate-drizzle`

## Argumento

$ARGUMENTS deve conter o caminho do arquivo de schema (ex: `src/modules/orders/schema.ts`). Se não fornecido, pergunte ao usuário.

## Regras de Validação

### 1. Anti-Padrão de Entidades Base

- Nunca criar schemas para `users`, `tenants` ou `sessions` fora do Foundation (DOC-FND-000)
- Novas entidades DEVEM usar FK (UUID) apontando para tabelas centrais
- Se encontrar `export const users = pgTable(...)` fora do Foundation (DOC-FND-000): **VIOLAÇÃO**

### 2. Isolamento Multi-Tenant

- Todas as operações de leitura DEVEM filtrar por `tenant_id` no SQL
- Use Joins ou RLS no nível do banco
- **NUNCA** carregue dados e filtre em memória com `Array.filter(x => x.tenantId === ...)`

### 3. Tipagem e Zod

- Toda definição deve exportar schema Zod: `export const insertXSchema = createInsertSchema(xTable);`
- Usar utilitários de `drizzle-zod`

### 4. Audit Trail e Soft-Delete (LGPD)

- Entidades críticas DEVEM ter hooks para `audit_logs`
- Tabelas de negócio DEVEM ter `deleted_at: timestamp("deleted_at", { withTimezone: true })`
- **NUNCA** usar hard delete para dados de negócio

### 5. Domain Events (DATA-003)

- Entidades com ciclo de vida (pedido, aprovação, documento) DEVEM emitir eventos para `domain_events`
- Schema segue padrão genérico: `tenant_id`, `entity_type`, `entity_id`, `event_type`, `payload`, `correlation_id`, `created_at`, `created_by`
- Índice composto obrigatório: `(tenant_id, entity_type, entity_id, created_at DESC)`
- NUNCA criar tabelas satélites de logs por funcionalidade

### 6. Storage Objects (DOC-PADRAO-005)

Se o módulo define `storage_objects`, validar:
- Todas as 22 colunas obrigatórias (id, tenant_id, entity_type, entity_id, bucket, object_key, filename, mime_type, size_bytes, purpose, upload_status, scan_status, uploaded_by, correlation_id, expires_at, deleted_at, created_at, updated_at)
- 3 índices obrigatórios
- `purpose`, `upload_status`, `scan_status` usam `pgEnum`
- MIME types bloqueados: `text/html`, `application/x-php`, `application/javascript`, `application/x-sh`, `image/svg+xml`, `application/octet-stream`

## Formato de Saída

- **Aprovado:** Mensagem curta de sucesso
- **Reprovado:** Lista de violações com regra específica e trecho de código mostrando correção
