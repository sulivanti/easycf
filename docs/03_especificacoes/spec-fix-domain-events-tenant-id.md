---
title: "Fix: tenant_id nulo/vazio em domain_events (INSERT falha em todos os cadastros)"
version: 2.0
date_created: 2026-03-25
last_updated: 2026-03-25
owner: ECF Core Team
tags: [bugfix, foundation, org-units, domain-events, MOD-000, MOD-003, cross-tenant]
---

# Introduction

O INSERT na tabela `domain_events` falha porque `tenant_id` (coluna `uuid NOT NULL`) recebe string vazia `''` — que não é UUID válido. O bug afeta **org-units** (create, update, delete, restore) e **foundation** (use cases autenticados passam `''`). O Foundation não quebra nos use cases pré-auth porque `createFoundationEvent()` tem fallback para `SYSTEM_TENANT_ID`, mas o módulo org-units usa `(payload['tenant_id'] as string) ?? ''` que resulta em string vazia.

**Erro reportado:**
```
Failed query: insert into "domain_events" ...
params: ,org_unit,...  ← $1 (tenant_id) vazio
```

**Causa raiz:** `createOrgUnitEvent()` não aceita `tenantId` como parâmetro — extrai de `payload['tenant_id']` que não existe nos payloads de CRUD. Resultado: `undefined ?? '' = ''`.

## 1. Purpose & Scope

**Propósito:** Corrigir a persistência de domain events em dois módulos — org-units (MOD-003) e foundation (MOD-000) — garantindo que `tenant_id` seja sempre um UUID válido.

**Escopo:**
- `createOrgUnitEvent()` factory — fix para usar `SYSTEM_TENANT_ID` como sentinel cross-tenant
- 2 use cases org-units (link/unlink tenant) — propagar `tenantId` explícito
- 5 use cases foundation autenticados — propagar `tenantId` do session
- 2 rotas foundation — injetar `request.session.tenantId`

**Fora de escopo:**
- 5 use cases foundation com fallback funcional (create-user, delete-user, forgot-password, reset-password, refresh-token) — já funcionam via `|| SYSTEM_TENANT_ID`
- Alterações no schema da tabela `domain_events`
- Frontend

**Audiência:** Desenvolvedores trabalhando na API (apps/api).

## 2. Definitions

| Termo | Definição |
|-------|-----------|
| `domain_events` | Tabela unificada de auditoria/eventos de domínio (DATA-000 §8) |
| `tenant_id` | UUID do tenant ao qual o evento pertence; coluna `uuid NOT NULL` |
| `SYSTEM_TENANT_ID` | UUID sentinel `00000000-0000-0000-0000-000000000000` para eventos cross-tenant ou pré-auth |
| `createOrgUnitEvent()` | Factory em `org-unit-events.ts` que cria `DomainEventBase` para MOD-003 |
| `createFoundationEvent()` | Factory em `foundation-events.ts` que cria `DomainEventBase` para MOD-000 |
| Cross-tenant | Entidade que não pertence a um tenant específico (ex: org-unit — ADR-003) |

## 3. Requirements, Constraints & Guidelines

### Decisão arquitetural: org-units é cross-tenant

Org-units é cross-tenant por design (ADR-003) — uma unidade organizacional não pertence a um tenant específico. Mas `domain_events.tenant_id` é `NOT NULL`. Duas opções foram avaliadas:

| Opção | Descrição | Prós | Contras |
|-------|-----------|------|---------|
| **A (escolhida)** | Usar `SYSTEM_TENANT_ID` como sentinel | Consistente com Foundation pré-auth; semanticamente correto | Eventos cross-tenant misturados com pré-auth |
| B | Passar `request.session.tenantId` do usuário | Registra quem executou | Mistura conceitos; org-unit não é de nenhum tenant |

**Decisão: Opção A** — consistente com Foundation, semanticamente correto.

### Defeitos identificados

- **DEF-001: `createOrgUnitEvent()` extrai `tenantId` do payload**
  - **Localização:** `apps/api/src/modules/org-units/domain/events/org-unit-events.ts` ~linha 78
  - **Código:** `tenantId: (params.payload['tenant_id'] as string) ?? ''`
  - **Problema:** Payloads de CRUD (create, update, delete, restore) não contêm `tenant_id` → `undefined ?? '' = ''`
  - **Impacto:** Todos os domain events de org-units falham ao persistir

- **DEF-002: Use cases Foundation autenticados passam `tenantId: ''`**
  - **Localização:** 5 arquivos em `apps/api/src/modules/foundation/application/use-cases/`
  - **Problema:** `tenantId: ''` hardcoded, mas `request.session.tenantId` está disponível
  - **Impacto:** Funciona graças ao fallback `|| SYSTEM_TENANT_ID` na factory, mas perde rastreabilidade do tenant real

- **DEF-003: Use cases link/unlink passam `tenant_id` no payload mas factory não lê mais**
  - **Localização:** 2 arquivos em `apps/api/src/modules/org-units/application/use-cases/`
  - **Impacto:** Após fix do DEF-001, estes perdem o `tenantId` correto se não adaptados

### Requisitos

- **REQ-001:** `createOrgUnitEvent()` DEVE aceitar `tenantId` como parâmetro opcional e usar `SYSTEM_TENANT_ID` como fallback — mesmo padrão de `createFoundationEvent()`.

- **REQ-002:** Use cases org-units de CRUD (create, update, delete, restore) DEVEM emitir eventos com `tenant_id = SYSTEM_TENANT_ID` (cross-tenant).

- **REQ-003:** Use cases org-units de link/unlink tenant DEVEM passar `tenantId: input.tenantId` explicitamente no `createOrgUnitEvent()`.

- **REQ-004:** Use cases Foundation pós-autenticação (change-password, logout, update-profile, create-role, update-role) DEVEM receber `tenantId` via input e propagá-lo ao `createFoundationEvent()`.

- **REQ-005:** Rotas Foundation pós-autenticação DEVEM injetar `request.session.tenantId` no input do use case.

- **REQ-006:** O `SYSTEM_TENANT_ID` DEVE ser importado de `foundation/domain/events/foundation-events.js` — não redefinido.

### Constraints

- **CON-001:** Não alterar o schema da tabela `domain_events`.
- **CON-002:** Não alterar a interface pública das rotas (request/response).
- **CON-003:** Use cases pré-auth (login, forgot-password, reset-password) e token flows (refresh-token) DEVEM continuar usando fallback `SYSTEM_TENANT_ID`.

### Guidelines

- **GUD-001:** Preferir importação cross-module de constantes (SYSTEM_TENANT_ID) a redefinições locais.
- **GUD-002:** Manter parâmetro `tenantId` opcional nas factories para backward compatibility.

## 4. Interfaces & Data Contracts

### 4.1 — Fix `createOrgUnitEvent()` (Step 1)

```typescript
// apps/api/src/modules/org-units/domain/events/org-unit-events.ts

// ADICIONAR import:
import { SYSTEM_TENANT_ID } from '@/modules/foundation/domain/events/foundation-events.js';

// ANTES (~linha 78):
tenantId: (params.payload['tenant_id'] as string) ?? '',

// DEPOIS:
tenantId: params.tenantId || SYSTEM_TENANT_ID,
```

Adicionar na interface de params:
```typescript
tenantId?: string;  // opcional — SYSTEM_TENANT_ID como fallback
```

### 4.2 — Fix link/unlink use cases (Step 2)

```typescript
// apps/api/src/modules/org-units/application/use-cases/link-tenant.use-case.ts
// No createOrgUnitEvent(), adicionar:
createOrgUnitEvent({
  tenantId: input.tenantId,  // ← ADICIONAR (tenant being linked)
  // ... demais params mantidos
})

// apps/api/src/modules/org-units/application/use-cases/unlink-tenant.use-case.ts
// Mesmo padrão:
createOrgUnitEvent({
  tenantId: input.tenantId,  // ← ADICIONAR
  // ...
})
```

### 4.3 — Fix use cases Foundation autenticados (Step 3)

**Padrão para cada um dos 5 use cases:**

1. Adicionar `tenantId: string` na interface `Input`:
```typescript
interface Input {
  // ... campos existentes
  tenantId: string;  // ← ADICIONAR
}
```

2. Passar no `createFoundationEvent()`:
```typescript
createFoundationEvent({
  tenantId: input.tenantId,  // ← ADICIONAR
  // ... demais params mantidos
})
```

3. Injetar na rota correspondente:
```typescript
tenantId: request.session.tenantId,  // ← ADICIONAR no input do use case
```

**Use cases e rotas afetados:**

| Use Case | Arquivo Use Case | Rota |
|----------|-----------------|------|
| ChangePassword | `foundation/.../auth/change-password.use-case.ts` | `auth.route.ts` |
| Logout | `foundation/.../auth/logout.use-case.ts` | `auth.route.ts` |
| UpdateProfile | `foundation/.../auth/update-profile.use-case.ts` | `auth.route.ts` |
| CreateRole | `foundation/.../roles/create-role.use-case.ts` | `roles.route.ts` |
| UpdateRole | `foundation/.../roles/update-role.use-case.ts` | `roles.route.ts` |

### 4.4 — Use cases que NÃO precisam de alteração

| Use Case | Razão |
|----------|-------|
| CreateUser | `tenantId: ''` → fallback `SYSTEM_TENANT_ID` (já funciona) |
| DeleteUser | `tenantId: ''` → fallback `SYSTEM_TENANT_ID` (já funciona) |
| ForgotPassword | Pré-auth → `SYSTEM_TENANT_ID` correto |
| ResetPassword | Pré-auth → `SYSTEM_TENANT_ID` correto |
| RefreshToken | Token flow → `SYSTEM_TENANT_ID` correto |

## 5. Acceptance Criteria

- **AC-001:** Given um org-unit novo, When o use case `CreateOrgUnit` executa, Then o domain event `org.unit_created` é persistido com `tenant_id = '00000000-0000-0000-0000-000000000000'`.

- **AC-002:** Given um org-unit existente, When `UpdateOrgUnit`, `DeleteOrgUnit` ou `RestoreOrgUnit` executa, Then o domain event correspondente é persistido com `tenant_id = SYSTEM_TENANT_ID`.

- **AC-003:** Given um link tenant, When `LinkTenant` executa com `tenantId = 'abc...'`, Then o domain event `org.tenant_linked` é persistido com `tenant_id = 'abc...'`.

- **AC-004:** Given um unlink tenant, When `UnlinkTenant` executa, Then o domain event `org.tenant_unlinked` é persistido com `tenant_id` do tenant sendo desvinculado.

- **AC-005:** Given um usuário autenticado com `session.tenantId = 'xyz...'`, When executa change-password, Then o domain event `auth.password_changed` é persistido com `tenant_id = 'xyz...'`.

- **AC-006:** Given operações Foundation pós-autenticação (logout, update-profile, create-role, update-role), When executadas, Then os domain events são persistidos com `tenant_id` da sessão do usuário.

- **AC-007:** Given a API em execução, When qualquer use-case emite domain event, Then o INSERT no `domain_events` DEVE completar sem erro de validação UUID.

- **AC-008:** Given operações Foundation pré-auth (login, forgot-password, reset-password, refresh-token), When executadas, Then os domain events são persistidos com `tenant_id = SYSTEM_TENANT_ID`.

## 6. Test Automation Strategy

- **Test Levels**: Verificação manual + build
- **Build validation**: `pnpm -F @ecf/api build` — compilação sem erros de tipo
- **Smoke test manual**:
  1. Criar Unidade Organizacional → toast de sucesso + navega para /org-units
  2. Verificar `domain_events` no DB: registro criado com `tenant_id = '00000000-...'`
  3. Editar, deletar, restaurar unidade → sem erros de INSERT
  4. Link tenant → `tenant_id` correto no evento (UUID do tenant linkado)
  5. Testar change-password, logout, create/update role → `tenant_id` da sessão no evento
- **Query de validação**:
  ```sql
  SELECT event_type, tenant_id FROM domain_events
  WHERE tenant_id = '' OR tenant_id IS NULL;
  -- Deve retornar 0 rows
  ```
- **Unit test (futuro)**: Mock do `eventRepo.create` validando que `tenantId` nunca é `''`

## 7. Rationale & Context

O código de `createOrgUnitEvent()` foi gerado via codegen com a lógica `(params.payload['tenant_id'] as string) ?? ''` — que funciona para `tenant_linked`/`tenant_unlinked` (cujo payload contém `tenant_id`), mas falha para CRUD operations onde o payload não inclui `tenant_id`.

A decisão de usar `SYSTEM_TENANT_ID` (Opção A) é baseada em:
1. **Consistência:** Foundation já usa esse padrão para eventos pré-auth
2. **Semântica:** Org-units são cross-tenant (ADR-003) — não pertencem a nenhum tenant
3. **Simplicidade:** Não requer propagação de `session.tenantId` para use cases que não precisam

Para Foundation, os 5 use cases autenticados devem propagar `tenantId` real para manter rastreabilidade — saber qual tenant originou a ação.

## 8. Dependencies & External Integrations

### Data Dependencies
- **DAT-001:** Tabela `domain_events` — `tenant_id` é `uuid NOT NULL`, sem FK para `tenants`. Aceita qualquer UUID válido.

### Infrastructure Dependencies
- **INF-001:** PostgreSQL — rejeita string vazia em colunas `uuid`.

### Cross-Module Dependencies
- **MOD-001:** `SYSTEM_TENANT_ID` exportado de `foundation/domain/events/foundation-events.ts` — importado por org-units.

## 9. Examples & Edge Cases

### Caso 1: Create Org Unit (cross-tenant, sem tenantId)
```typescript
// ANTES (falha):
createOrgUnitEvent({
  // tenantId não existe como param
  payload: { org_unit_id: '...', codigo: '...', nome: '...' },
  // → tenantId: (payload['tenant_id'] as string) ?? '' = ''
  // → INSERT falha: invalid input syntax for type uuid
})

// DEPOIS (funciona):
createOrgUnitEvent({
  // tenantId omitido → default SYSTEM_TENANT_ID
  payload: { org_unit_id: '...', codigo: '...', nome: '...' },
  // → tenantId: SYSTEM_TENANT_ID = '00000000-0000-0000-0000-000000000000'
  // → INSERT OK
})
```

### Caso 2: Link Tenant (com tenantId explícito)
```typescript
// ANTES (funciona por acidente — payload contém tenant_id):
createOrgUnitEvent({
  payload: { tenant_id: 'abc-123', org_unit_id: '...' },
  // → tenantId: (payload['tenant_id'] as string) = 'abc-123'
})

// DEPOIS (explícito e seguro):
createOrgUnitEvent({
  tenantId: input.tenantId,  // 'abc-123' ← explícito
  payload: { tenant_id: 'abc-123', org_unit_id: '...' },
})
```

### Caso 3: Change Password (Foundation autenticado)
```typescript
// ANTES:
createFoundationEvent({ tenantId: '', ... })
// → tenantId: '' || SYSTEM_TENANT_ID = '00000000-...'
// Funciona, mas perde rastreabilidade do tenant real

// DEPOIS:
createFoundationEvent({ tenantId: input.tenantId, ... })
// → tenantId: 'tenant-real-uuid' ← do session
```

### Edge case: tenantId undefined no createOrgUnitEvent
```typescript
createOrgUnitEvent({ /* tenantId omitido */ })
// → params.tenantId = undefined
// → undefined || SYSTEM_TENANT_ID = '00000000-...'
// Comportamento correto via fallback
```

## 10. Validation Criteria

1. `pnpm -F @ecf/api build` — compilação sem erros
2. Criar Unidade Organizacional via UI → toast de sucesso + navegação para `/org-units`
3. `SELECT * FROM domain_events WHERE entity_type = 'org_unit'` → `tenant_id = '00000000-...'`
4. Link tenant via UI → `tenant_id` correto no evento
5. Change-password, logout, create-role, update-role → `tenant_id` da sessão no evento
6. `SELECT count(*) FROM domain_events WHERE tenant_id = ''` → 0 registros

## 11. Related Specifications / Further Reading

- [spec-fix-org-unit-create-silent-failure.md](./spec-fix-org-unit-create-silent-failure.md) — Fix frontend silent failure (complementar)
- `docs/01_normativos/DATA-000` — Schema de banco de dados (§8: domain_events)
- `docs/01_normativos/DATA-003` — Catálogo de eventos de domínio
- `docs/01_normativos/DOC-ARC-003` — Arquitetura de eventos
- `apps/api/src/modules/org-units/domain/events/org-unit-events.ts` — Factory org-units
- `apps/api/src/modules/foundation/domain/events/foundation-events.ts` — Factory foundation + SYSTEM_TENANT_ID

---

## Appendix A: Plano de Execução

### Arquivos modificados

| Arquivo | Ação | Step |
|---------|------|------|
| `org-units/domain/events/org-unit-events.ts` | EDIT | 1 |
| `org-units/.../link-tenant.use-case.ts` | EDIT | 2 |
| `org-units/.../unlink-tenant.use-case.ts` | EDIT | 2 |
| `foundation/.../auth/change-password.use-case.ts` | EDIT | 3 |
| `foundation/.../auth/logout.use-case.ts` | EDIT | 3 |
| `foundation/.../auth/update-profile.use-case.ts` | EDIT | 3 |
| `foundation/.../roles/create-role.use-case.ts` | EDIT | 3 |
| `foundation/.../roles/update-role.use-case.ts` | EDIT | 3 |
| `foundation/presentation/routes/auth.route.ts` | EDIT | 3 |
| `foundation/presentation/routes/roles.route.ts` | EDIT | 3 |

### Paralelização

- Steps 1 e 2 são dependentes (Step 2 usa a nova interface do Step 1)
- Step 3 é independente dos anteriores (módulo Foundation)

```
Batch 1: [Step 1] → [Step 2]  (sequencial, org-units)
          [Step 3]             (paralelo, foundation)
```
