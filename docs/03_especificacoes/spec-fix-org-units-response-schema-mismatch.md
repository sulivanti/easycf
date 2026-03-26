---
title: "Fix: Response doesn't match schema em endpoints org-units"
version: 1.0
date_created: 2026-03-25
owner: ECF Core Team
tags: [bugfix, org-units, MOD-003, fastify, schema-validation]
---

# Introduction

Após criar uma unidade organizacional (POST /org-units → 201 OK), endpoints subsequentes retornam `500 Internal Server Error` com `"Response doesn't match the schema"`. O cadastro é persistido com sucesso, mas o Fastify rejeita a resposta porque os dados retornados pelo handler não correspondem ao schema Zod declarado na rota.

## 1. Purpose & Scope

**Propósito:** Corrigir o mapeamento camelCase→snake_case e a serialização de datas nos handlers de 3 endpoints org-units que enviam dados brutos do repository.

**Escopo:**
- `GET /api/v1/org-units` (list) — `result.data` enviado raw
- `GET /api/v1/org-units/:id` (detail) — spread `...result` inclui campos extras
- `PATCH /api/v1/org-units/:id` (update) — `result` enviado raw

**Fora de escopo:**
- POST /org-units (create) — já mapeia corretamente (linhas 72-80)
- DELETE, PATCH /restore, POST /tenants, DELETE /tenants — retornam mensagens simples ou já mapeiam

**Audiência:** Desenvolvedores API.

## 2. Definitions

| Termo | Definição |
|-------|-----------|
| Schema mismatch | Fastify valida a resposta contra o schema Zod declarado; se falha, retorna 500 |
| camelCase | Formato do ORM/repository (ex: `parentId`, `createdAt`) |
| snake_case | Formato do contrato API (ex: `parent_id`, `created_at`) |

## 3. Requirements, Constraints & Guidelines

### Defeitos identificados

- **DEF-001: GET /org-units (list) envia `result.data` raw**
  - **Localização:** `org-units.route.ts` linha 103
  - **Código:** `data: result.data` — campos camelCase do repository
  - **Schema espera:** `parent_id` (snake_case), `created_at` (ISO string)
  - **Repository retorna:** `parentId` (camelCase), `createdAt` (Date object)

- **DEF-002: GET /org-units/:id (detail) faz spread de `result`**
  - **Localização:** `org-units.route.ts` linha 140
  - **Código:** `{ ...result, parent_id: result.parentId, ... }`
  - **Problema:** O spread inclui `parentId`, `createdBy`, `createdAt`, `updatedAt`, `deletedAt` em camelCase ALÉM das versões snake_case explícitas. Campos extras podem causar rejeição dependendo da config do serializador.

- **DEF-003: PATCH /org-units/:id (update) envia `result` raw**
  - **Localização:** `org-units.route.ts` linha 182
  - **Código:** `return reply.status(200).send(result)`
  - **Schema espera:** `id`, `codigo`, `nome`, `descricao`, `nivel`, `status` (6 campos)
  - **Result contém:** campos extras do use case output em camelCase

### Requisitos

- **REQ-001:** Todos os handlers DEVEM mapear explicitamente cada campo para o formato esperado pelo schema — nunca enviar objetos raw do repository/use-case.
- **REQ-002:** Campos `Date` DEVEM ser serializados para ISO string via `.toISOString()`.
- **REQ-003:** Campos camelCase DEVEM ser renomeados para snake_case no response body.
- **REQ-004:** O handler NÃO DEVE usar spread (`...result`) para construir o response — sempre mapear campo a campo.

## 4. Interfaces & Data Contracts

### Fix DEF-001: GET /org-units (list)

```typescript
// ANTES (linha 103):
return reply.status(200).send({
  data: result.data,
  next_cursor: result.nextCursor,
  has_more: result.hasMore,
});

// DEPOIS:
return reply.status(200).send({
  data: result.data.map((item: Record<string, any>) => ({
    id: item.id,
    codigo: item.codigo,
    nome: item.nome,
    nivel: item.nivel,
    status: item.status,
    parent_id: item.parentId ?? null,
    created_at: item.createdAt instanceof Date
      ? item.createdAt.toISOString()
      : item.createdAt,
  })),
  next_cursor: result.nextCursor,
  has_more: result.hasMore,
});
```

### Fix DEF-002: GET /org-units/:id (detail)

```typescript
// ANTES (linha 140):
return reply.status(200).send({
  ...result,
  parent_id: result.parentId,
  created_by: result.createdBy,
  created_at: result.createdAt,
  updated_at: result.updatedAt,
  deleted_at: result.deletedAt,
  tenants: result.tenants.map(...)
});

// DEPOIS:
return reply.status(200).send({
  id: result.id,
  codigo: result.codigo,
  nome: result.nome,
  descricao: result.descricao ?? null,
  nivel: result.nivel,
  parent_id: result.parentId ?? null,
  status: result.status,
  created_by: result.createdBy ?? null,
  created_at: result.createdAt instanceof Date
    ? result.createdAt.toISOString()
    : result.createdAt,
  updated_at: result.updatedAt instanceof Date
    ? result.updatedAt.toISOString()
    : result.updatedAt,
  deleted_at: result.deletedAt instanceof Date
    ? result.deletedAt.toISOString()
    : result.deletedAt ?? null,
  ancestors: result.ancestors,
  tenants: result.tenants.map((t: Record<string, any>) => ({
    tenant_id: t.tenantId,
    codigo: t.codigo,
    name: t.name,
  })),
});
```

### Fix DEF-003: PATCH /org-units/:id (update)

```typescript
// ANTES (linha 182):
return reply.status(200).send(result);

// DEPOIS:
return reply.status(200).send({
  id: result.id,
  codigo: result.codigo,
  nome: result.nome,
  descricao: result.descricao ?? null,
  nivel: result.nivel,
  status: result.status,
});
```

## 5. Acceptance Criteria

- **AC-001:** GET /api/v1/org-units retorna 200 com lista onde cada item contém `parent_id` (snake_case) e `created_at` (ISO string).
- **AC-002:** GET /api/v1/org-units/:id retorna 200 com `parent_id`, `created_by`, `created_at`, `updated_at`, `deleted_at` — todos snake_case e datas como ISO strings.
- **AC-003:** PATCH /api/v1/org-units/:id retorna 200 com os 6 campos do schema (sem campos extras).
- **AC-004:** Nenhum endpoint org-units retorna 500 "Response doesn't match the schema".
- **AC-005:** `pnpm -F @easycode/api build` compila sem erros.

## 6. Test Automation Strategy

- **Build validation:** `pnpm -F @easycode/api build`
- **Smoke test manual:**
  1. Criar org unit → 201 (sem 500 subsequente)
  2. Listar org units → 200 com dados snake_case
  3. Detalhe org unit → 200 com ancestors e tenants
  4. Editar org unit → 200 com campos corretos

## 7. Rationale & Context

O codegen gerou os handlers POST/create e link-tenant com mapeamento explícito, mas os handlers list, detail e update enviam dados raw. O padrão correto (já aplicado no Foundation após FR-000-C04) é mapear campo a campo no handler.

## 8. Dependencies & External Integrations

Nenhuma — alterações restritas ao arquivo de rotas.

## 9. Examples & Edge Cases

### Edge case: `descricao` undefined vs null
O schema espera `z.string().nullable()` — `undefined` não é aceito. Usar `?? null` para garantir.

### Edge case: `createdAt` como string (já serializado)
Se o repository já retorna ISO string (ex: via JSON parse), o ternário `instanceof Date` garante compatibilidade.

## 10. Validation Criteria

1. `pnpm -F @easycode/api build` — sem erros
2. Nenhum endpoint org-units retorna 500 schema mismatch
3. Todas as datas são ISO strings no response
4. Todos os campos são snake_case no response

## 11. Related Specifications / Further Reading

- [spec-fix-domain-events-tenant-id.md](./spec-fix-domain-events-tenant-id.md) — Fix tenant_id (mesmo módulo)
- [spec-fix-auth-route-response-mapping.md](./spec-fix-auth-route-response-mapping.md) — Mesmo padrão de fix aplicado no Foundation
- `apps/api/src/modules/org-units/presentation/routes/org-units.route.ts` — Arquivo único afetado
- `apps/api/src/modules/org-units/presentation/dtos/org-units.dto.ts` — Schemas Zod de referência

---

## Appendix A: Plano de Execução

### Arquivos modificados

| Arquivo | Ação | Defeito |
|---------|------|---------|
| `org-units/presentation/routes/org-units.route.ts` | EDIT | DEF-001, DEF-002, DEF-003 |

### Paralelização

Arquivo único — execução sequencial das 3 correções no mesmo arquivo.

### Verificação

1. `pnpm -F @easycode/api build`
2. Teste manual: criar → listar → detalhe → editar
