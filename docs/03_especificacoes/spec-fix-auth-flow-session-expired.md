---
title: "Fix Auth Flow — Sessão Expirada + Módulos Vazios (JWT sem tenant/scopes + /auth/me desalinhado)"
version: 1.0
date_created: 2026-03-25
owner: ECF Core Team
tags: [bugfix, foundation, auth, jwt, session, deploy, MOD-000]
---

# Introduction

Após o primeiro deploy em produção, o usuário `admin@ecf.local` (inserido diretamente no banco) apresenta dois sintomas críticos: (1) toast "Sua sessão expirou" com HTTP 401 no `GET /auth/me`, e (2) sidebar sem módulos porque `scopes = []`. A causa raiz envolve três defeitos encadeados: dados ausentes no banco (tenant, role, permissões), JWT gerado sem `tenantId`/`scopes`, e resposta do `GET /auth/me` com shape incompatível com o frontend.

## 1. Purpose & Scope

**Propósito:** Especificar as correções necessárias para restaurar o fluxo de autenticação completo — do seed de dados até a resposta do perfil — garantindo que o JWT contenha tenant e scopes e que o contrato `GET /auth/me` alinhe com o frontend.

**Escopo:**

- Seed de dados: limpeza do admin órfão e re-execução do seed completo
- Use-case de login: resolução de `tenantId` e `scopes` antes da geração do JWT
- Use-case de profile: retorno de tenant como objeto `{ id, name }` e campo `name`
- DTOs e rotas: alinhamento do schema `profileResponse` com o contrato do frontend
- OpenAPI: atualização do `ProfileResponse` em `v1.yaml`
- DI: injeção de `TenantUserRepository` e `RoleRepository` no `LoginUseCase`

**Audiência:** Desenvolvedores trabalhando na API (apps/api), módulo Foundation.

**Fora de escopo:** Mudanças no frontend (`apps/web`), refatoração do sistema de permissões, e alterações no fluxo de refresh token (que já funciona desde que o JWT contenha os dados corretos).

## 2. Definitions

| Termo | Definição |
|-------|-----------|
| JWT | JSON Web Token — token assinado que carrega payload com `userId`, `sessionId`, `tid` (tenantId) e `scopes` |
| `tid` | Claim customizada no JWT que identifica o tenant ativo do usuário |
| `scopes` | Lista de permissões RBAC (71 scopes canônicos no ECF) embarcadas no JWT |
| `tenant_users` | Tabela pivot que vincula `user` ↔ `tenant` ↔ `role` |
| `role_permissions` | Tabela que mapeia cada role aos scopes autorizados |
| `TokenPair` | Interface `{ accessToken, refreshToken, expiresIn }` — par de tokens gerado pelo `TokenService` |
| Seed | Script `db/seed-admin.ts` que cria tenant padrão + role super-admin (71 scopes) + user + vínculos |
| `profileResponse` | Schema Zod em `auth.dto.ts` que define o contrato HTTP da resposta `GET /auth/me` |

## 3. Requirements, Constraints & Guidelines

### Problemas Identificados

**DEF-001: Dados ausentes no banco (causa raiz imediata)**
- **Localização:** Tabelas `tenants`, `roles`, `role_permissions`, `tenant_users`
- **Causa:** `admin@ecf.local` foi inserido diretamente na tabela `users` sem criar os registros dependentes. O seed (`db/seed-admin.ts`) pula se o email já existe (linha 124).
- **Impacto:** JWT gerado com `tid: null`, `scopes: []` → todas as rotas protegidas retornam 401/403

**DEF-002: Login NÃO embute tenant/scopes no JWT**
- **Localização:** `apps/api/src/modules/foundation/application/use-cases/auth/login.use-case.ts:107-110`
- **Causa:** `tokenService.generatePair()` é chamado apenas com `{ userId, sessionId }`, sem `tenantId` nem `scopes`
- **Impacto:** `request.session.tenantId = ''`, `request.session.scopes = []` em todas as rotas autenticadas

**DEF-003: Resposta GET /auth/me não bate com frontend**
- **Localização:** `auth.route.ts:176-185`, `auth.dto.ts:51-60`
- **Causa:** API retorna `{ full_name, active_tenant_id, scopes }` mas frontend espera `{ name, tenant: { id, name }, scopes }`
- **Impacto:** `user.name` e `user.tenant` ficam `undefined` → UI quebrada, telemetry crash

### Requisitos da Correção

- **REQ-001**: O seed DEVE criar todos os registros dependentes (tenant, role, role_permissions, tenant_users, content_users) quando executado para um novo usuário admin.
- **REQ-002**: O `LoginUseCase` DEVE resolver o primeiro `tenant_users` ativo do usuário e buscar os `scopes` da role vinculada antes de gerar o JWT.
- **REQ-003**: O JWT gerado DEVE conter as claims `tid` (tenantId) e `scopes` (array de strings) no payload.
- **REQ-004**: O `GetProfileUseCase` DEVE retornar o tenant como objeto `{ id: string, name: string }` e o campo `name` (não `fullName`).
- **REQ-005**: O schema `profileResponse` em `auth.dto.ts` DEVE ser alterado: `full_name` → `name`, `active_tenant_id` → `tenant: { id, name }`.
- **REQ-006**: O handler `GET /auth/me` e `PATCH /auth/me` em `auth.route.ts` DEVEM mapear a saída do use-case para o novo schema.
- **REQ-007**: O `ProfileResponse` no OpenAPI `v1.yaml` DEVE ser atualizado para refletir o novo contrato.

### Restrições

- **CON-001**: Ajustes são exclusivamente no backend (`apps/api`). O frontend NÃO será alterado nesta spec.
- **CON-002**: O contrato alvo do `GET /auth/me` é definido pelo frontend (`backoffice-admin.types.ts:16-23`) e é imutável.
- **CON-003**: A injeção de dependência segue o padrão existente em `plugins/di.ts` — usar construtor injection.

### Guidelines

- **GUD-001**: Manter anti-corruption layer na camada de apresentação (route handlers mapeiam camelCase → snake_case).
- **GUD-002**: Não alterar a interface `TokenService.generatePair()` — apenas passar claims adicionais no payload existente.

## 4. Interfaces & Data Contracts

### JWT Payload (após correção)

```typescript
interface JwtPayload {
  userId: string;
  sessionId: string;
  tid: string;      // ← NOVO: tenantId
  scopes: string[]; // ← NOVO: array de permission scopes
  iat: number;
  exp: number;
}
```

### GET /auth/me — Response (após correção)

**Antes (quebrado):**
```json
{
  "full_name": "Admin ECF",
  "active_tenant_id": "uuid-string",
  "scopes": []
}
```

**Depois (alinhado com frontend):**
```json
{
  "name": "Admin ECF",
  "tenant": {
    "id": "uuid-string",
    "name": "ECF Default Tenant"
  },
  "scopes": ["users:read", "users:write", "...71 scopes"]
}
```

### Frontend Contract (imutável — fonte de verdade)

```typescript
// apps/web/.../backoffice-admin.types.ts:16-23
interface UserProfile {
  name: string;
  tenant: { id: string; name: string };
  scopes: string[];
}
```

### LoginUseCase — Novas Dependências

```typescript
// Antes
constructor(
  private userRepo: UserRepository,
  private tokenService: TokenService,
  private sessionRepo: SessionRepository,
)

// Depois
constructor(
  private userRepo: UserRepository,
  private tokenService: TokenService,
  private sessionRepo: SessionRepository,
  private tenantUserRepo: TenantUserRepository,  // ← NOVO
  private roleRepo: RoleRepository,              // ← NOVO
)
```

## 5. Acceptance Criteria

- **AC-001**: Dado que `admin@ecf.local` foi deletado e o seed re-executado, Quando o seed conclui, Então as tabelas `tenants`, `roles`, `role_permissions`, `tenant_users` e `content_users` contêm registros vinculados ao admin com 71 scopes.
- **AC-002**: Dado um login válido com `admin@ecf.local`, Quando o JWT é decodificado, Então o payload contém `tid` com UUID do tenant e `scopes` com array de 71 strings.
- **AC-003**: Dado um usuário autenticado, Quando `GET /auth/me` é chamado, Então a resposta contém `{ name: string, tenant: { id: string, name: string }, scopes: string[] }` com HTTP 200.
- **AC-004**: Dado um usuário autenticado, Quando `PATCH /auth/me` é chamado com dados válidos, Então a resposta segue o mesmo schema de AC-003.
- **AC-005**: Dado um usuário autenticado com JWT contendo scopes, Quando navega entre módulos no frontend, Então a sidebar exibe todos os módulos autorizados e nenhum 401 ocorre.
- **AC-006**: Dado o OpenAPI `v1.yaml`, Quando o Spectral lint é executado, Então o `ProfileResponse` passa sem warnings.

## 6. Test Automation Strategy

- **Test Levels**: Integration (prioritário — fluxo login→JWT→/me end-to-end)
- **Frameworks**: Vitest + Supertest (padrão do projeto)
- **Cenários de teste:**
  - Login com admin gera JWT com `tid` e `scopes` populados
  - Login com usuário sem tenant retorna erro adequado (não JWT vazio)
  - `GET /auth/me` retorna shape correto (validar contra schema Zod)
  - `GET /auth/me` com JWT sem `tid` retorna 401
- **Test Data Management**: Seed script idempotente para ambiente de teste
- **CI/CD Integration**: Pipeline existente (lint + vitest + spectral)
- **Coverage Requirements**: 100% dos handlers alterados cobertos

## 7. Rationale & Context

O problema surgiu porque o deploy inicial usou INSERT direto no banco para criar o admin, contornando o seed que cria toda a árvore de dependências (tenant → role → permissions → user → tenant_users). Combinado com o fato de que o `LoginUseCase` nunca resolvia tenant/scopes (provavelmente adiado durante o desenvolvimento), e o `profileResponse` usava um shape diferente do esperado pelo frontend.

A correção em 4 fases garante que cada camada seja consertada bottom-up: dados → JWT → API response → verificação E2E.

A decisão de ajustar o backend (não o frontend) é intencional: o frontend já implementa o contrato correto conforme `backoffice-admin.types.ts`, e alterar o frontend exigiria rebuild e redeploy do SPA.

## 8. Dependencies & External Integrations

### Infrastructure Dependencies
- **INF-001**: PostgreSQL — contém as tabelas de auth/RBAC. Seed deve ser executado no container de produção.

### Data Dependencies
- **DAT-001**: `db/seed-admin.ts` — script de seed que cria a árvore completa de dados admin. Deve ser idempotente (pula se email já existe).

### Technology Platform Dependencies
- **PLT-001**: Fastify + `@fastify/cookie` — cookies `accessToken`/`refreshToken` são setados pelo login e lidos pelo middleware de auth.
- **PLT-002**: Zod + `fastify-type-provider-zod` — validação de response schemas (serializerCompiler).

## 9. Examples & Edge Cases

### Edge Case 1: Usuário com múltiplos tenants

```typescript
// LoginUseCase resolve o PRIMEIRO tenant_users ativo
const tenantUser = await this.tenantUserRepo.findFirstActive(user.id);
if (!tenantUser) {
  throw new UnauthorizedError('User has no active tenant association');
}
```

Decisão: usar o primeiro tenant ativo. Futuramente, o usuário poderá trocar de tenant via endpoint dedicado (fora do escopo desta spec).

### Edge Case 2: Role sem permissões

```typescript
const permissions = await this.roleRepo.findPermissions(tenantUser.roleId);
// Se a role existe mas tem 0 permissões, o JWT terá scopes: []
// Isso é válido — o usuário simplesmente não terá acesso a nenhum módulo
```

### Edge Case 3: Seed executado com admin já existente

O seed verifica `WHERE email = 'admin@ecf.local'` e pula a criação. Para re-criar, é necessário primeiro deletar o registro existente com o SQL de limpeza documentado na Fase 1 do plano.

## 10. Validation Criteria

- [ ] Após execução da Fase 1 (seed), `SELECT count(*) FROM tenant_users WHERE user_id = (SELECT id FROM users WHERE email = 'admin@ecf.local')` retorna >= 1
- [ ] JWT decodificado contém `tid` (UUID válido) e `scopes` (array com 71 items)
- [ ] `curl -b cookies.txt GET /auth/me` retorna `{ name, tenant: { id, name }, scopes }` com HTTP 200
- [ ] Frontend carrega sidebar com módulos sem toast de "Sessão expirou"
- [ ] `npx spectral lint apps/api/openapi/v1.yaml` passa sem erros

## 11. Related Specifications / Further Reading

- [spec-fix-auth-route-response-mapping.md](spec-fix-auth-route-response-mapping.md) — Correção do mapeamento camelCase→snake_case nas rotas de auth (pré-requisito parcial)
- [spec-fix-domain-events-tenant-id.md](spec-fix-domain-events-tenant-id.md) — Fix do SYSTEM_TENANT_ID em domain events
- `docs/04_modules/mod-000-foundation/` — Especificação do módulo Foundation (auth, RBAC, sessions)
- `apps/web/src/.../backoffice-admin.types.ts` — Contrato TypeScript do frontend (fonte de verdade do shape esperado)

### Arquivos Críticos (Mapa de Alterações)

| Arquivo | Fase | Alteração |
|---------|------|-----------|
| `db/seed-admin.ts` | 1 | Nenhuma (apenas re-executar após limpeza) |
| `login.use-case.ts` | 2 | Resolver tenant/scopes antes de gerar JWT |
| `plugins/di.ts` | 2 | Injetar TenantUserRepo + RoleRepo no LoginUseCase |
| `get-profile.use-case.ts` | 3 | Retornar `{ name, tenant: { id, name } }` |
| `auth.dto.ts` | 3 | Ajustar `profileResponse` schema |
| `auth.route.ts` | 3 | Ajustar mapping nos handlers GET/PATCH /auth/me |
| `openapi/v1.yaml` | 3 | Atualizar `ProfileResponse` |
