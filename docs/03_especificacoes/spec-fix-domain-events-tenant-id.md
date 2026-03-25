---
title: "Correção: domain_events falha no INSERT por tenant_id vazio"
version: 1.0
date_created: 2026-03-25
owner: ECF Core Team
tags: [bugfix, foundation, domain-events, MOD-000]
---

# Introduction

O login (e potencialmente todos os use-cases do MOD-000) falha ao inserir na tabela `domain_events` porque o campo `tenant_id` é passado como string vazia (`''`), violando a constraint `uuid NOT NULL` do PostgreSQL. Esta especificação descreve o problema, a causa-raiz, e a correção necessária.

## 1. Purpose & Scope

**Propósito:** Corrigir o erro `Failed query: insert into "domain_events"` que ocorre no fluxo de login e em todos os demais use-cases do MOD-000 Foundation que emitem domain events.

**Escopo:** Todos os 13 use-cases do MOD-000 que chamam `createFoundationEvent()` com `tenantId: ''`.

**Audiência:** Desenvolvedores trabalhando na API (apps/api).

**Erro observado:**
```
Failed query: insert into "domain_events" (...) values (default, $1, ...)
params: ,session,2143faaf-...,auth.login_success,...
```
O primeiro parâmetro (`$1 = tenant_id`) é string vazia — PostgreSQL rejeita porque a coluna é `uuid NOT NULL`.

## 2. Definitions

| Termo | Definição |
|-------|-----------|
| `domain_events` | Tabela unificada de auditoria/eventos de domínio (DATA-000 §8) |
| `tenant_id` | UUID do tenant (organização) ao qual o evento pertence |
| `SYSTEM_TENANT` | Tenant especial para eventos que ocorrem fora de contexto de tenant (ex: login) |
| `createFoundationEvent()` | Factory helper em `foundation-events.ts` que cria objetos `DomainEventBase` |

## 3. Requirements, Constraints & Guidelines

### Problema (Causa-raiz)

**3 defeitos identificados:**

1. **DEF-001: `tenantId: ''` hardcoded em todos os use-cases**
   - **Localização:** 13 arquivos em `apps/api/src/modules/foundation/application/use-cases/`
   - **Comentário no código:** `// resolved by caller/middleware` — mas nenhum caller/middleware resolve
   - **Impacto:** Todos os domain events falham ao persistir

2. **DEF-002: Schema da tabela exige UUID mas use-cases enviam string vazia**
   - **Localização:** `apps/api/db/schema/foundation.ts` linha 187: `tenantId: uuid('tenant_id').notNull()`
   - **Incompatibilidade:** `''` (string vazia) não é UUID válido

3. **DEF-003: `causationId` e `dedupeKey` são passados como `undefined` mas o Drizzle pode serializar como string vazia**
   - **Localização:** `apps/api/src/modules/foundation/infrastructure/drizzle-repositories.ts` linhas 722-733
   - **Impacto menor:** Esses campos são nullable, mas `undefined` pode ser serializado incorretamente

### Requisitos da correção

- **REQ-001:** Use-cases de login, logout, refresh-token e demais use-cases pré-autenticação DEVEM usar um `SYSTEM_TENANT_ID` constante (UUID fixo) como `tenantId` nos domain events, pois o usuário ainda não tem tenant ativo no momento do login.

- **REQ-002:** Use-cases pós-autenticação (create-user, create-role, etc.) DEVEM receber o `tenantId` via input (do `request.session.tenantId` injetado pela rota), não hardcoded.

- **REQ-003:** O `SYSTEM_TENANT_ID` deve ser um UUID constante documentado (ex: `00000000-0000-0000-0000-000000000000`) e deve existir como registro na tabela `tenants` para satisfazer eventual FK.

- **REQ-004:** Os campos opcionais (`causationId`, `dedupeKey`) devem ser explicitamente `null` quando ausentes, não `undefined` ou `''`.

## 4. Interfaces & Data Contracts

### Tabela `domain_events` (schema atual)

```typescript
// apps/api/db/schema/foundation.ts
export const domainEvents = pgTable('domain_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id').notNull(),          // ← DEVE ser UUID válido
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  eventType: text('event_type').notNull(),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  createdBy: uuid('created_by'),                   // nullable
  correlationId: text('correlation_id').notNull(),
  causationId: text('causation_id'),               // nullable
  sensitivityLevel: smallint('sensitivity_level').notNull().default(0),
  dedupeKey: text('dedupe_key'),                   // nullable
});
```

### Factory helper (alteração proposta)

```typescript
// apps/api/src/modules/foundation/domain/events/foundation-events.ts

/** UUID fixo para eventos que ocorrem fora de contexto de tenant */
export const SYSTEM_TENANT_ID = '00000000-0000-0000-0000-000000000000';

export function createFoundationEvent(params: {
  tenantId?: string;  // opcional — usa SYSTEM_TENANT_ID como fallback
  entityType: FoundationEntityType;
  entityId: string;
  eventType: FoundationEventType;
  payload: Record<string, unknown>;
  correlationId: string;
  createdBy: string | null;
  causationId?: string;
  dedupeKey?: string;
}): DomainEventBase {
  return {
    tenantId: params.tenantId || SYSTEM_TENANT_ID,
    entityType: params.entityType,
    entityId: params.entityId,
    eventType: params.eventType,
    payload: params.payload,
    correlationId: params.correlationId,
    createdBy: params.createdBy,
    sensitivityLevel: EVENT_SENSITIVITY[params.eventType],
    causationId: params.causationId ?? null,
    dedupeKey: params.dedupeKey ?? null,
  };
}
```

### Use-cases afetados (13 arquivos)

| Arquivo | Evento(s) | Classificação |
|---------|-----------|---------------|
| `auth/login.use-case.ts` | `auth.login_success`, `session.created` | Pré-auth → SYSTEM_TENANT |
| `auth/logout.use-case.ts` | `auth.logout`, `session.revoked` | Pós-auth → session.tenantId |
| `auth/refresh-token.use-case.ts` | `auth.token_reuse_detected` | Pós-auth → session.tenantId |
| `auth/change-password.use-case.ts` | `auth.password_changed` | Pós-auth → session.tenantId |
| `auth/forgot-password.use-case.ts` | `auth.forgot_password_requested` | Pré-auth → SYSTEM_TENANT |
| `auth/reset-password.use-case.ts` | `auth.password_reset` | Pré-auth → SYSTEM_TENANT |
| `auth/update-profile.use-case.ts` | `user.profile_updated` | Pós-auth → session.tenantId |
| `users/create-user.use-case.ts` | `user.created` | Pós-auth → input.tenantId |
| `users/delete-user.use-case.ts` | `user.deleted` | Pós-auth → input.tenantId |
| `roles/create-role.use-case.ts` | `role.created` | Pós-auth → input.tenantId |
| `roles/update-role.use-case.ts` | `role.updated` | Pós-auth → input.tenantId |
| `tenants/create-tenant.use-case.ts` | `tenant.created` | Pós-auth → created.id |
| `tenant-users/add-tenant-user.use-case.ts` | `tenant_user.added` | Pós-auth → input.tenantId |

### DrizzleDomainEventRepository (alteração proposta)

```typescript
// apps/api/src/modules/foundation/infrastructure/drizzle-repositories.ts
// No método create():
await c.insert(domainEvents).values({
  tenantId: event.tenantId,
  entityType: event.entityType,
  entityId: event.entityId,
  eventType: event.eventType,
  payload: event.payload,
  createdBy: event.createdBy ?? null,      // explícito null
  correlationId: event.correlationId,
  causationId: event.causationId ?? null,  // explícito null (REQ-004)
  sensitivityLevel: event.sensitivityLevel,
  dedupeKey: event.dedupeKey ?? null,      // explícito null (REQ-004)
});
```

## 5. Acceptance Criteria

- **AC-001:** Given um usuário válido, When faz login com credenciais corretas, Then o login retorna tokens e o domain event `auth.login_success` é persistido com `tenant_id = SYSTEM_TENANT_ID`.

- **AC-002:** Given a API em execução, When qualquer use-case emite domain event, Then o INSERT no `domain_events` deve completar sem erro de validação UUID.

- **AC-003:** Given campos opcionais `causationId` e `dedupeKey` não fornecidos, When o event é persistido, Then os campos devem ser `NULL` no banco, não string vazia.

- **AC-004:** Given um use-case pós-autenticação (ex: create-user), When emite event, Then o `tenant_id` deve ser o UUID do tenant da sessão ativa, não `SYSTEM_TENANT_ID`.

## 6. Test Automation Strategy

- **Smoke test manual:** Login via UI em `ecf.jetme.com.br/login` → deve retornar tokens sem erro 500.
- **Unit test (futuro):** Mock do `eventRepo.create` validando que `tenantId` nunca é `''`.
- **Integration test (futuro):** INSERT real no `domain_events` com `SYSTEM_TENANT_ID` deve completar sem erro.

## 7. Rationale & Context

O código foi gerado via codegen (commit `fed0682`) com placeholder `tenantId: ''` e comentário `// resolved by caller/middleware`. O middleware de resolução nunca foi implementado. A correção mais pragmática é:

1. Usar `SYSTEM_TENANT_ID` como fallback na factory (resolve imediatamente o crash)
2. Futuramente, propagar `tenantId` do `request.session` para use-cases pós-autenticação

A abordagem de fallback na factory é segura porque:
- Não altera a interface dos use-cases
- Eventos de auditoria pré-autenticação genuinamente não têm tenant
- O `SYSTEM_TENANT_ID` é padrão em sistemas multi-tenant para operações de sistema

## 8. Dependencies & External Integrations

### Data Dependencies
- **DAT-001:** Tabela `tenants` — o `SYSTEM_TENANT_ID` (`00000000-0000-0000-0000-000000000000`) deve existir como registro se houver FK constraint. Atualmente `domain_events.tenant_id` **não** tem FK para `tenants`, então basta ser UUID válido.

### Infrastructure Dependencies
- **INF-001:** PostgreSQL — a coluna `tenant_id` é `uuid NOT NULL`, aceita qualquer UUID válido.

## 9. Examples & Edge Cases

### Caso 1: Login (pré-auth, sem tenant)
```typescript
// ANTES (falha):
createFoundationEvent({ tenantId: '', ... })
// → INSERT com $1 = '' → PostgreSQL rejeita: invalid input syntax for type uuid

// DEPOIS (funciona):
createFoundationEvent({ tenantId: '', ... })
// → factory converte '' para SYSTEM_TENANT_ID
// → INSERT com $1 = '00000000-0000-0000-0000-000000000000' → OK
```

### Caso 2: Create User (pós-auth, com tenant)
```typescript
// ANTES:
createFoundationEvent({ tenantId: '', ... })

// DEPOIS:
createFoundationEvent({ tenantId: input.tenantId, ... })
// → INSERT com $1 = 'a1b2c3d4-...' → OK
```

### Edge case: `causationId` undefined
```typescript
// ANTES:
{ causationId: undefined }
// → Drizzle pode serializar como '' dependendo do driver

// DEPOIS:
{ causationId: params.causationId ?? null }
// → Drizzle envia NULL explícito → PostgreSQL aceita (coluna nullable)
```

## 10. Validation Criteria

1. `npx tsx apps/api/src/index.ts` sobe sem erros
2. `POST /api/v1/auth/login` com credenciais válidas retorna 200 com tokens
3. Tabela `domain_events` contém registro com `event_type = 'auth.login_success'`
4. Nenhum registro em `domain_events` tem `tenant_id = ''`

## 11. Related Specifications / Further Reading

- `docs/01_normativos/DATA-000` — Schema de banco de dados (§8: domain_events)
- `docs/01_normativos/DATA-003` — Catálogo de eventos de domínio
- `docs/01_normativos/DOC-ARC-003` — Arquitetura de eventos
- `apps/api/db/schema/foundation.ts` — Schema Drizzle da tabela
- `apps/api/src/modules/foundation/domain/events/foundation-events.ts` — Factory de eventos
