---
title: "Correção: mapeamento camelCase→snake_case nas rotas de auth (Response doesn't match the schema)"
version: 1.0
date_created: 2026-03-25
owner: ECF Core Team
tags: [bugfix, foundation, auth, presentation-layer, MOD-000]
---

# Introduction

As rotas de autenticação (`POST /login`, `POST /refresh`, `GET /me`, `PATCH /me`) retornam os objetos dos use-cases diretamente via `reply.send(result)`, sem mapear camelCase para snake_case. Como os schemas Zod dos DTOs usam snake_case (ex: `access_token`, `full_name`), o `serializerCompiler` do Fastify rejeita a resposta com `"Response doesn't match the schema"`. Adicionalmente, a rota `/refresh` referencia `result.user` que não existe no retorno do use-case.

## 1. Purpose & Scope

**Propósito:** Eliminar o erro de serialização nas rotas de auth mapeando explicitamente os campos camelCase dos use-cases para snake_case dos DTOs na camada de apresentação.

**Escopo:** 5 handlers em `apps/api/src/modules/foundation/presentation/routes/auth.route.ts`:
- `POST /auth/login` (branch success + branch MFA)
- `POST /auth/refresh`
- `GET /auth/me`
- `PATCH /auth/me`

**Audiência:** Desenvolvedores trabalhando na API (apps/api), módulo Foundation.

**Erro observado:**
```
Response doesn't match the schema
```
O Fastify com Zod `serializerCompiler` valida a resposta contra o schema declarado em `response: { 200: ... }`. Quando as chaves não batem (camelCase vs snake_case), a validação falha.

## 2. Definitions

| Termo | Definição |
|-------|-----------|
| `serializerCompiler` | Plugin do Fastify que valida/serializa respostas HTTP contra schemas Zod antes de enviar ao cliente |
| `loginResponse` | Schema Zod em `auth.dto.ts` que define o contrato snake_case da resposta de login |
| `loginMfaResponse` | Schema Zod para resposta quando MFA é requerido |
| `profileResponse` | Schema Zod para resposta do perfil do usuário |
| `TokenPair` | Interface da camada de aplicação: `{ accessToken, refreshToken, expiresIn }` (camelCase) |
| `RefreshTokenOutput` | Interface do use-case de refresh: `{ tokenPair: TokenPair, sessionId: string }` — **sem campo `user`** |
| `LoginOutput` | Interface do use-case de login: `{ tokenPair, user: {...}, sessionId }` |
| Anti-Corruption Layer | Padrão DDD onde a camada de apresentação traduz formatos internos para o contrato externo |

## 3. Requirements, Constraints & Guidelines

### Defeitos identificados

**DEF-001: Todas as rotas faziam `reply.send(result)` sem mapeamento**
- **Localização:** `auth.route.ts`, handlers de login, refresh, me (GET/PATCH)
- **Causa:** Use-cases retornam objetos camelCase; DTOs Zod exigem snake_case
- **Impacto:** Toda chamada a essas rotas retorna erro 500

**DEF-002: Rota `/refresh` referencia `result.user` inexistente**
- **Localização:** `auth.route.ts`, handler de `POST /refresh` (linhas 150-161 pós-correção)
- **Causa:** `RefreshTokenOutput` retorna `{ tokenPair, sessionId }` sem campo `user`
- **Impacto:** `TypeError: Cannot read properties of undefined (reading 'id')` em runtime
- **Nota:** Este defeito foi **introduzido pela correção** ao copiar o mapeamento do login para o refresh sem verificar que o retorno é diferente

### Requisitos da correção

- **REQ-001:** Os handlers de `POST /login` (success), `POST /refresh`, `GET /me` e `PATCH /me` DEVEM mapear explicitamente os campos camelCase dos use-cases para os campos snake_case definidos nos schemas Zod correspondentes (`loginResponse`, `profileResponse`).

- **REQ-002:** O handler de `POST /login` (MFA branch) DEVE mapear `mfaRequired → mfa_required`, `tempToken → temp_token`, `expiresIn → expires_in`.

- **REQ-003:** O handler de `POST /login` (success branch) DEVE incluir `token_type: 'Bearer'` que não existe no retorno do use-case mas é exigido pelo schema `loginResponse`.

- **REQ-004:** O handler de `POST /refresh` DEVE usar um schema `refreshResponse` separado (sem campo `user`), pois `RefreshTokenUseCase` não retorna dados do usuário. O schema `loginResponse` NÃO deve ser reutilizado para o refresh.
  - **Justificativa:** (1) O refresh troca tokens — não busca perfil; o contrato deve refletir a operação real. (2) Evita query extra ao banco em cada refresh (operação frequente). (3) Menor blast radius — só altera `auth.dto.ts` + schema na rota, sem tocar no use-case. (4) O frontend já possui os dados do user (do login ou GET /me).
  - **Evolução futura:** Se o frontend necessitar dados frescos do user no refresh, evoluir para alteração do `RefreshTokenUseCase` retornando `user` — como decisão deliberada, não band-aid.

- **REQ-005:** Cada mapeamento deve ser testável — o campo de saída da rota DEVE corresponder 1:1 ao campo do schema Zod declarado em `response`.

- **CON-001:** Não alterar os schemas Zod dos DTOs (`auth.dto.ts`) — o contrato público da API é snake_case e está correto conforme padrões REST.

- **CON-002:** Não alterar os use-cases para retornar snake_case — a camada de aplicação deve permanecer em camelCase (convenção TypeScript interna).

- **GUD-001:** O mapeamento deve ser feito na camada de apresentação (rota), que funciona como Anti-Corruption Layer entre domínio (camelCase) e contrato HTTP (snake_case).

## 4. Interfaces & Data Contracts

### Tabela de mapeamento: Login (success)

| Use-case (camelCase) | DTO schema (snake_case) | Nota |
|----------------------|------------------------|------|
| `result.tokenPair.accessToken` | `access_token` | |
| `result.tokenPair.refreshToken` | `refresh_token` | |
| *(constante)* | `token_type: 'Bearer'` | Não vem do use-case |
| `result.tokenPair.expiresIn` | `expires_in` | |
| `result.user.id` | `user.id` | |
| `result.user.email` | `user.email` | |
| `result.user.fullName` | `user.full_name` | |
| `result.user.status` | `user.status` | |
| `result.sessionId` | *(descartado)* | Não está no schema público |

### Tabela de mapeamento: Login (MFA)

| Use-case (camelCase) | DTO schema (snake_case) |
|----------------------|------------------------|
| `result.mfaRequired` | `mfa_required` |
| `result.tempToken` | `temp_token` |
| `result.expiresIn` | `expires_in` |

### Tabela de mapeamento: Refresh (com `refreshResponse` separado — REQ-004)

| Use-case (camelCase) | DTO schema `refreshResponse` (snake_case) |
|----------------------|------------------------------------------|
| `result.tokenPair.accessToken` | `access_token` |
| `result.tokenPair.refreshToken` | `refresh_token` |
| *(constante)* | `token_type: 'Bearer'` |
| `result.tokenPair.expiresIn` | `expires_in` |

> **Nota:** Sem campo `user` — o schema `refreshResponse` não inclui `user` pois `RefreshTokenOutput` não o retorna.

### Tabela de mapeamento: Profile (GET/PATCH /me)

| Use-case (camelCase) | DTO schema (snake_case) |
|----------------------|------------------------|
| `result.id` | `id` |
| `result.email` | `email` |
| `result.codigo` | `codigo` |
| `result.fullName` | `full_name` |
| `result.avatarUrl` | `avatar_url` |
| `result.status` | `status` |
| `result.activeTenantId` | `active_tenant_id` |
| `result.scopes` | `scopes` |

## 5. Acceptance Criteria

- **AC-001:** Given um login válido (email+senha corretos, sem MFA), When `POST /auth/login`, Then a resposta HTTP 200 contém `access_token`, `refresh_token`, `token_type: 'Bearer'`, `expires_in` (number), e `user` com `full_name` (não `fullName`).

- **AC-002:** Given um login com MFA habilitado, When `POST /auth/login`, Then a resposta HTTP 200 contém `mfa_required: true`, `temp_token`, `expires_in: 300`.

- **AC-003:** Given um refresh token válido, When `POST /auth/refresh`, Then a resposta HTTP 200 é aceita pelo schema Zod `loginResponse` (ou schema alternativo conforme REQ-004) sem erro de serialização.

- **AC-004:** Given um usuário autenticado, When `GET /auth/me`, Then a resposta contém `full_name` (não `fullName`), `avatar_url` (não `avatarUrl`), `active_tenant_id` (não `activeTenantId`).

- **AC-005:** Given qualquer rota de auth, When o handler retorna, Then o `serializerCompiler` do Fastify NÃO lança "Response doesn't match the schema".

## 6. Test Automation Strategy

- **Test Levels:** Integration (HTTP request → response validation)
- **Frameworks:** Vitest + `fastify.inject()` para testes de integração HTTP
- **Cenários mínimos:**
  - Login success → validar campos snake_case no JSON de resposta
  - Login MFA → validar campos snake_case
  - Refresh → validar que não ocorre TypeError por `result.user` indefinido
  - GET /me → validar campos snake_case
  - PATCH /me → validar campos snake_case na resposta
- **Coverage:** Todos os 5 handlers afetados devem ter pelo menos 1 teste de resposta

## 7. Rationale & Context

O Fastify com `zod-fastify` compila os schemas Zod em serializers que **validam** a resposta antes de enviá-la. Isso é diferente de frameworks que simplesmente serializam — aqui, se a resposta não bate com o schema, o request falha com 500.

A convenção do projeto é:
- **Camada de aplicação (use-cases):** camelCase (padrão TypeScript)
- **Camada de apresentação (DTOs HTTP):** snake_case (padrão REST API)

A tradução entre os dois DEVE acontecer na rota (Anti-Corruption Layer). Enviar `result` diretamente viola essa separação.

O DEF-002 (refresh sem `user`) é especialmente crítico porque:
1. O `LoginUseCase` retorna `{ tokenPair, user, sessionId }`
2. O `RefreshTokenUseCase` retorna apenas `{ tokenPair, sessionId }` — sem `user`
3. A rota de refresh usa o schema `loginResponse` que exige `user`
4. A correção copiou o mapeamento do login incluindo `result.user.*` sem validar que o refresh não retorna `user`

## 8. Dependencies & External Integrations

### Technology Platform Dependencies
- **PLT-001:** Fastify + `fastify-type-provider-zod` — O `serializerCompiler` valida respostas automaticamente
- **PLT-002:** Zod — Schemas de DTO em `auth.dto.ts` são a fonte de verdade do contrato HTTP

### Data Dependencies
- **DAT-001:** `RefreshTokenUseCase.execute()` — Retorna `RefreshTokenOutput { tokenPair, sessionId }`. Caso REQ-004(a) seja escolhido, este use-case precisará ser alterado para incluir `user`.

## 9. Examples & Edge Cases

### Exemplo: Login success (antes vs depois)

```typescript
// ❌ ANTES — reply.send(result) envia camelCase
{
  "tokenPair": { "accessToken": "...", "refreshToken": "...", "expiresIn": 3600 },
  "user": { "id": "...", "email": "...", "fullName": "João", "status": "active" },
  "sessionId": "..."
}
// → serializerCompiler rejeita: "Response doesn't match the schema"

// ✅ DEPOIS — mapeamento explícito
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "user": { "id": "...", "email": "...", "full_name": "João", "status": "active" }
}
```

### Edge case: Refresh sem user

```typescript
// ❌ Correção atual — result.user é undefined
return reply.status(200).send({
  access_token: result.tokenPair.accessToken,
  // ...
  user: {
    id: result.user.id,  // TypeError: Cannot read properties of undefined
  },
});
```

## 10. Validation Criteria

- [ ] Todas as 5 rotas afetadas mapeiam explicitamente camelCase → snake_case
- [ ] Nenhuma rota faz `reply.send(result)` diretamente (para schemas com campos mapeados)
- [ ] O campo `token_type: 'Bearer'` é incluído nas respostas de login e refresh
- [ ] A rota `/refresh` NÃO referencia `result.user` (campo inexistente)
- [ ] O `serializerCompiler` do Fastify aceita todas as respostas sem erro
- [ ] Campos extras do use-case (ex: `sessionId`) NÃO vazam para a resposta HTTP

## 11. Related Specifications / Further Reading

- [spec-fix-domain-events-tenant-id.md](spec-fix-domain-events-tenant-id.md) — Outra correção no fluxo de login (domain events)
- `apps/api/src/modules/foundation/presentation/dtos/auth.dto.ts` — Schemas Zod (fonte de verdade)
- `apps/api/src/modules/foundation/application/use-cases/auth/login.use-case.ts` — LoginOutput
- `apps/api/src/modules/foundation/application/use-cases/auth/refresh-token.use-case.ts` — RefreshTokenOutput (sem `user`)
- `apps/api/src/modules/foundation/application/ports/services.ts` — Interface TokenPair
