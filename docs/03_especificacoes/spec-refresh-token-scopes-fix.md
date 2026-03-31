---
title: "Fix: Refresh Token Não Propaga Scopes e TenantId"
version: 1.0
date_created: 2026-03-30
owner: ECF Core
tags: [bugfix, auth, security, token, refresh, scopes]
---

# Introduction

Após ~15 minutos de uso (expiração do access token JWT), o sistema retorna `403 — Permissão insuficiente. Scope requerido: users:role:read` (e similares) para todas as rotas protegidas. A causa raiz é que o **refresh token JWT não contém `scopes` nem `tid`**, e o fluxo de refresh copia esses valores do payload do refresh token — que são `[]` e `undefined`, respectivamente — gerando um novo access token sem permissões.

## 1. Purpose & Scope

**Propósito:** Corrigir o fluxo de refresh de tokens para que o novo access token JWT contenha os scopes e tenantId corretos.

**Escopo:**
- Backend: `RefreshTokenUseCase`, `FastifyJwtTokenService`
- Não altera frontend (o fluxo de keepalive e interceptor 401 já funcionam corretamente)
- Afeta: MOD-000 (Foundation)

**Audiência:** Desenvolvedores do módulo Foundation

## 2. Definitions

| Termo | Definição |
|---|---|
| **Access Token** | JWT de curta duração (15min) que carrega `sub`, `sid`, `tid`, `scopes[]` |
| **Refresh Token** | JWT de longa duração (7d) usado para obter novo par de tokens |
| **Token Rotation** | Padrão onde cada refresh invalida o token anterior e emite novo par |
| **Scope** | String no formato `dominio:entidade:acao` que autoriza acesso a endpoints |
| **TTL** | Time-To-Live — tempo de expiração do token ou cache |

## 3. Requirements, Constraints & Guidelines

### Bug Identificado

**Fluxo atual (defeituoso):**

1. Login → `loginUseCase` busca role do usuário → extrai scopes → gera JWT com `scopes[]` e `tid` ✅
2. JWT expira em 15min
3. Keepalive ou interceptor 401 chama `POST /auth/refresh`
4. `refreshTokenUseCase` decodifica o refresh token via `verifyAccessToken()`
5. Refresh token **não contém `scopes` nem `tid`** (linha 54-57 de `services-impl.ts`)
6. `payload.scopes` retorna `[]`, `payload.tenantId` retorna `undefined`
7. Novo access token é gerado **sem permissões** ❌
8. Todas as rotas protegidas por `requireScope()` passam a retornar 403

**Código defeituoso** (`services-impl.ts:54-57`):
```typescript
const refreshToken = this.app.jwt.sign(
  { sub: payload.userId, sid: payload.sessionId, type: 'refresh' },
  // ⚠️ Falta: tid, scopes
  { expiresIn: this.refreshExpiresIn },
);
```

**Código defeituoso** (`refresh-token.use-case.ts:69-73`):
```typescript
const tokenPair = await this.tokenService.generatePair({
  userId: payload.userId,
  sessionId: session.id,
  tenantId: payload.tenantId,  // undefined (vindo do refresh token)
  scopes: payload.scopes,       // [] (vindo do refresh token)
});
```

### Requisitos da Correção

- **REQ-001**: O fluxo de refresh DEVE re-buscar os scopes atuais da role do usuário no banco de dados, em vez de copiar do token anterior.
  - **Justificativa:** Além de corrigir o bug, isso garante que alterações de role (ex: admin removendo permissão) sejam aplicadas no próximo refresh, sem necessidade de logout.

- **REQ-002**: O fluxo de refresh DEVE re-resolver o tenantId ativo do usuário a partir do banco de dados.
  - **Justificativa:** Mesmo raciocínio — se o binding tenant-user mudou, o refresh deve refletir.

- **REQ-003**: O `RefreshTokenUseCase` DEVE receber `TenantUserRepository` e `RoleRepository` como dependências para realizar as consultas REQ-001 e REQ-002.

- **REQ-004**: Se o usuário não tiver mais um `tenantUser` ativo, o refresh DEVE falhar com `SessionRevokedError` (equivalente a perda de acesso).

- **SEC-001**: O refresh token NÃO precisa carregar `scopes` em seu payload — scopes devem ser resolvidos do banco no momento do refresh (defense in depth).

- **CON-001**: Manter compatibilidade com o refresh token existente (tokens já emitidos antes do fix devem continuar funcionando — o payload mínimo `sub`+`sid` é suficiente).

- **GUD-001**: Utilizar o cache existente (`CacheService.getOrSet`) para scopes da role, com TTL de 300s, evitando queries desnecessárias (mesmo padrão já usado em `getProfileUseCase`).

## 4. Interfaces & Data Contracts

### RefreshTokenUseCase — Nova Assinatura do Construtor

```typescript
export class RefreshTokenUseCase {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly eventRepo: DomainEventRepository,
    private readonly uow: UnitOfWork,
    private readonly tokenService: TokenService,
    // ── novas dependências ──
    private readonly tenantUserRepo: TenantUserRepository,
    private readonly roleRepo: RoleRepository,
    private readonly cache: CacheService,
  ) {}
}
```

### Fluxo Corrigido (pseudocódigo)

```typescript
async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
  // 1. Verificar refresh token (extrai userId, sessionId)
  const payload = await this.tokenService.verifyAccessToken(input.refreshToken);

  // 2. Carregar sessão do DB — BR-002 kill-switch
  const session = Session.fromPersistence(await this.sessionRepo.findById(payload.sessionId));
  session.assertActive();

  // 3. Re-resolver tenant ativo (REQ-002)
  const tenantUsers = await this.tenantUserRepo.findByUserId(payload.userId);
  const activeTenantUser = tenantUsers.find(tu => tu.status === 'ACTIVE');
  if (!activeTenantUser) throw new SessionRevokedError(); // REQ-004

  // 4. Re-buscar scopes da role (REQ-001 + GUD-001)
  const scopes = await this.cache.getOrSet(
    `auth:scopes:role:${activeTenantUser.roleId}`,
    async () => {
      const role = await this.roleRepo.findById(activeTenantUser.roleId);
      return role?.scopes?.map(s => s.value) ?? [];
    },
    300,
  );

  // 5. Gerar novo par de tokens COM scopes e tenantId
  const tokenPair = await this.tokenService.generatePair({
    userId: payload.userId,
    sessionId: session.id,
    tenantId: activeTenantUser.tenantId,
    scopes,
  });

  return { tokenPair, sessionId: session.id };
}
```

### DI Container — Atualização

O container de injeção de dependência que instancia `RefreshTokenUseCase` precisa passar as novas dependências (`tenantUserRepo`, `roleRepo`, `cache`).

## 5. Acceptance Criteria

- **AC-001**: Given um usuário autenticado com scopes `[users:role:read, process:cycle:read]`, When o access token expira e o refresh é executado, Then o novo access token DEVE conter os mesmos scopes.

- **AC-002**: Given um usuário autenticado com tenantId `tid-123`, When o refresh é executado, Then o novo access token DEVE conter `tid: 'tid-123'`.

- **AC-003**: Given um admin alterou a role do usuário (removendo `process:cycle:read`), When o usuário faz refresh, Then o novo token NÃO deve conter `process:cycle:read`.

- **AC-004**: Given um usuário cujo tenantUser foi desativado (status ≠ ACTIVE), When o refresh é executado, Then o sistema DEVE retornar 401 (SessionRevokedError).

- **AC-005**: Given um refresh token emitido antes do fix (sem `tid`/`scopes`), When usado para refresh, Then o sistema DEVE funcionar normalmente (re-buscando do banco).

## 6. Test Automation Strategy

- **Nível**: Unit test (Vitest)
- **Arquivo**: `apps/api/src/modules/foundation/application/use-cases/auth/refresh-token.use-case.test.ts`
- **Cenários**:
  1. Refresh com tenant ativo → novo token com scopes corretos
  2. Refresh sem tenant ativo → `SessionRevokedError`
  3. Refresh com role alterada → scopes atualizados refletem nova role
  4. Cache hit de scopes → `roleRepo.findById` não é chamado
- **Mocks permitidos**: Repositórios e TokenService (unit test, não integration)

## 7. Rationale & Context

O bug foi introduzido porque o `refreshToken` JWT foi desenhado apenas com `sub`, `sid` e `type: 'refresh'` — sem `scopes` e `tid`. O `RefreshTokenUseCase` assume que o payload decodificado contém esses campos, mas eles vêm como `[]` e `undefined`.

**Decisão de design (re-fetch vs embed):** Optamos por re-buscar scopes do banco (em vez de embuti-los no refresh token) porque:
1. Corrige o bug imediato
2. Permite que mudanças de role/permissões tomem efeito no próximo refresh
3. O cache de 5min mitiga impacto em performance
4. Defense in depth: refresh token não carrega dados sensíveis de autorização

## 8. Dependencies & External Integrations

### Repositórios Necessários
- **TenantUserRepository** — já existente, usado no `loginUseCase`
- **RoleRepository** — já existente, usado no `loginUseCase`
- **CacheService** — já existente (`InMemoryCacheService`)

### Nenhuma dependência nova é introduzida.

## 9. Examples & Edge Cases

### Edge Case 1: Usuário com múltiplos tenants
O sistema atualmente seleciona o primeiro `tenantUser` com `status === 'ACTIVE'`. O refresh deve manter esse comportamento. Futuramente, quando multi-tenant switching for implementado, o refresh deverá receber o tenantId desejado.

### Edge Case 2: Race condition no refresh
O mutex `refreshPromise` no frontend (`http-client.ts:74`) já previne múltiplos refreshes simultâneos. No backend, não há race condition pois cada refresh é atômico.

### Edge Case 3: Cache de scopes stale
Se um admin alterar uma role, o cache `auth:scopes:role:{roleId}` pode estar stale por até 5 minutos. Isso é aceitável e já é o comportamento documentado (BR-011). A invalidação explícita no `updateRoleUseCase` já existe.

## 10. Validation Criteria

1. Login → usar o sistema por > 15 minutos → nenhum erro 403
2. Alterar role de um usuário → após próximo refresh, scopes refletem a mudança
3. Desativar tenantUser → refresh falha com 401
4. Todos os testes unitários existentes continuam passando
5. Novo teste unitário para `RefreshTokenUseCase` cobre AC-001 a AC-005

## 11. Related Specifications / Further Reading

- `docs/04_modules/mod-000-foundation/requirements/fr/FR-000.md` — FR-003 (Refresh Token)
- `docs/04_modules/mod-000-foundation/requirements/br/BR-000.md` — BR-002 (Kill-switch), BR-010 (Cookies), BR-011 (Cache)
- `docs/04_modules/mod-000-foundation/requirements/sec/SEC-000.md` — SEC-000 (Autenticação)

---

## Appendix A: Plano de Execução

### Arquivos Afetados

| # | Arquivo | Ação | Descrição |
|---|---|---|---|
| 1 | `apps/api/src/modules/foundation/application/use-cases/auth/refresh-token.use-case.ts` | **MODIFICAR** | Adicionar deps `tenantUserRepo`, `roleRepo`, `cache`; re-buscar scopes e tenantId do banco |
| 2 | `apps/api/src/plugins/di.ts` | **MODIFICAR** | Passar novas deps ao instanciar `RefreshTokenUseCase` |
| 3 | `apps/api/src/modules/foundation/application/use-cases/auth/refresh-token.use-case.test.ts` | **CRIAR** | Testes unitários para os cenários AC-001 a AC-005 |

### Steps

| Step | Descrição | Paralelizável |
|---|---|---|
| 1 | Modificar `RefreshTokenUseCase` — adicionar deps e re-fetch de scopes/tenantId | Não |
| 2 | Atualizar DI container (`di.ts`) para passar novas deps | Depende de Step 1 |
| 3 | Criar testes unitários | Pode ser paralelo com Step 2 |

### Estimativa de Impacto
- **Risco:** Baixo — alteração cirúrgica em um único use case + wiring de DI
- **Rollback:** Simples — revert do commit
- **Downtime:** Zero — deploy sem breaking changes (CON-001)
