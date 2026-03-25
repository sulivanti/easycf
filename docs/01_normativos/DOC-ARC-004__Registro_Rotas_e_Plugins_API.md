# DOC-ARC-004 — Registro de Rotas e Plugins API

- **id:** DOC-ARC-004
- **version:** 1.0.0
- **status:** ACTIVE
- **data_ultima_revisao:** 2026-03-25
- **owner:** arquitetura
- **scope:** global (API entry point e módulos route)

> **Regra de uso:** Este documento é a norma canônica para registro de rotas, error handlers e plugins no entry point da API (`apps/api/src/index.ts`). Todo novo módulo que exporte route plugins DEVE ser registrado conforme as regras aqui definidas. Alterações DEVEM ser registradas no CHANGELOG abaixo.

---

## CHANGELOG

| Versão | Data       | Responsável | Descrição |
|--------|------------|-------------|-----------|
| 1.0.0  | 2026-03-25 | arquitetura | Versão inicial. Define contrato de route plugin, ordem de registro, composição de error handlers, pré-requisitos de decorator/DI, padrão de path e tabela-manifesto. |

---

## 1. Contrato de Route Plugin

Todo módulo API DEVE exportar rotas como funções Fastify plugin:

```typescript
export async function xxxRoutes(app: FastifyInstance): Promise<void> {
  // rotas com paths RELATIVOS ao prefix de registro
  app.get('/', { ... });
  app.get('/:id', { ... });
}
```

**Regras:**
- Signature: `async function(app: FastifyInstance): Promise<void>`
- Exportado via barrel (`modules/xxx/index.ts`)
- Nome segue padrão `camelCase` terminando em `Routes`, `Route` ou `Plugin`
- Paths dentro do handler DEVEM ser **relativos** (ex: `/`, `/:id`, `/tree`) — ver §6

---

## 2. Registro no Entry Point

O arquivo `apps/api/src/index.ts` DEVE importar e registrar todo plugin via `app.register()`:

```typescript
import { xxxRoutes } from './modules/xxx/index.js';
await app.register(xxxRoutes, { prefix: '/api/v1/xxx' });
```

**Regras:**
- Todo route export presente em `modules/*/index.ts` DEVE ter correspondência em `app.register()` no entry point
- O prefix DEVE ser passado explicitamente no `register()` — nunca hardcoded dentro do route file
- Plugins compostos (como `contextualParamsPlugin`) que internamente registram sub-plugins são aceitos, mas DEVEM receber prefix raiz

---

## 3. Ordem de Registro

O entry point DEVE respeitar a seguinte ordem:

1. **Core plugins** — helmet, cors, cookie, jwt
2. **Auth/DI plugins** — `verifySession`, `requireScope`, `dipiContainer` (ANTES de qualquer rota)
3. **Module registries** — `caseExecution`, `movementApproval`, `mcpAutomation` (decorators de instância)
4. **Route plugins** — todos os módulos via `app.register()`
5. **Global error handler** — `foundationErrorHandler` via `app.setErrorHandler()`
6. **app.listen()**

Registrar rotas ANTES de auth/DI resultará em runtime errors (`app.verifySession is not a function`).

---

## 4. Composição de Error Handlers

- `foundationErrorHandler` DEVE ser registrado como **global** error handler via `app.setErrorHandler()`
- Error handlers module-specific (`mcpErrorHandler`, `contextualParamsErrorHandler`) podem ser registrados dentro do escopo encapsulado do módulo (via plugin wrapper) ou delegados pelo global handler
- O global handler é o fallback — trata DomainError, validation errors e errors desconhecidos com RFC 9457 Problem Details

---

## 5. Pré-requisitos de Decorator/DI

Os seguintes decorators DEVEM existir no runtime ANTES do registro de rotas:

| Decorator | Tipo | Registrado por | Usado por |
|-----------|------|----------------|-----------|
| `app.verifySession` | `FastifyInstance` | auth plugin | Todos os módulos |
| `app.requireScope(scope)` | `FastifyInstance` | auth plugin | Todos os módulos |
| `request.dipiContainer` | `FastifyRequest` | DI plugin | Módulos com use cases |
| `request.session` | `FastifyRequest` | auth plugin (via verifySession) | Todos os módulos |
| `request.user` | `FastifyRequest` | auth plugin (via verifySession) | MOD-006, MOD-009, MOD-010 |
| `app.caseExecution` | `FastifyInstance` | MOD-006 registry plugin | MOD-006 |
| `app.movementApproval` | `FastifyInstance` | MOD-009 registry plugin | MOD-009 |
| `app.mcpAutomation` | `FastifyInstance` | MOD-010 registry plugin | MOD-010 |

---

## 6. Padrão de Path

**OBRIGATÓRIO:** Paths em route files DEVEM ser **relativos** ao prefix de registro.

| Padrão | Exemplo | Status |
|--------|---------|--------|
| Relativo | `app.get('/:id', ...)` | ✅ OBRIGATÓRIO |
| Absoluto via const | `const prefix = '/api/v1/cases'` | ❌ PROIBIDO (debt técnico, migrar) |
| Absoluto inline | `app.get('/api/v1/mcp/execute', ...)` | ❌ PROIBIDO (debt técnico, migrar) |

Módulos com paths absolutos DEVEM ser migrados para relativo. Durante a transição, módulos com paths absolutos são registrados SEM prefix.

---

## 7. Tabela-Manifesto de Plugins Registrados

Esta tabela DEVE ser atualizada a cada novo módulo.

| Módulo | Plugin Export | Prefix | Path Style | Error Handler |
|--------|-------------|--------|------------|---------------|
| MOD-000 Foundation | `authRoutes` | `/api/v1/auth` | Relativo | `foundationErrorHandler` (global) |
| MOD-000 Foundation | `usersRoutes` | `/api/v1/users` | Relativo | — |
| MOD-000 Foundation | `rolesRoutes` | `/api/v1/roles` | Relativo | — |
| MOD-000 Foundation | `tenantsRoutes` | `/api/v1/tenants` | Relativo | — |
| MOD-000 Foundation | `infoRoute` | `/api/v1` | Relativo | — |
| MOD-003 Org Units | `orgUnitsRoutes` | `/api/v1/org-units` | Relativo | — |
| MOD-004 Identity Adv | `adminOrgScopesRoutes` | `/api/v1/admin/users` | Relativo | — |
| MOD-004 Identity Adv | `myOrgScopesRoutes` | `/api/v1/my` | Relativo | — |
| MOD-004 Identity Adv | `adminAccessSharesRoutes` | `/api/v1/admin/access-shares` | Relativo | — |
| MOD-004 Identity Adv | `mySharedAccessesRoutes` | `/api/v1/my` | Relativo | — |
| MOD-004 Identity Adv | `accessDelegationsRoutes` | `/api/v1/access-delegations` | Relativo | — |
| MOD-005 Process Model | `cyclesRoutes` | `/api/v1/admin` | Relativo | — |
| MOD-005 Process Model | `stagesRoutes` | `/api/v1/admin` | Relativo | — |
| MOD-005 Process Model | `processRolesRoutes` | `/api/v1/admin` | Relativo | — |
| MOD-006 Case Exec | `caseExecutionRoutes` | *(absoluto — sem prefix)* | Absoluto | — |
| MOD-007 Ctx Params | `contextualParamsPlugin` | `/api/v1` | Relativo (plugin composto) | `contextualParamsErrorHandler` |
| MOD-008 Integration | `servicesRoutes` | `/api/v1` | Relativo | — |
| MOD-008 Integration | `routinesRoutes` | `/api/v1` | Relativo | — |
| MOD-008 Integration | `engineRoutes` | `/api/v1` | Relativo | — |
| MOD-009 Movement Appr | `rulesRoutes` | *(absoluto — sem prefix)* | Absoluto | — |
| MOD-009 Movement Appr | `engineRoutes` | *(absoluto — sem prefix)* | Absoluto | — |
| MOD-009 Movement Appr | `movementsRoutes` | *(absoluto — sem prefix)* | Absoluto | — |
| MOD-009 Movement Appr | `approvalsRoutes` | *(absoluto — sem prefix)* | Absoluto | — |
| MOD-010 MCP | `agentsRoutes` | *(absoluto — sem prefix)* | Absoluto | `mcpErrorHandler` |
| MOD-010 MCP | `actionsRoutes` | *(absoluto — sem prefix)* | Absoluto | — |
| MOD-010 MCP | `executionsRoutes` | *(absoluto — sem prefix)* | Absoluto | — |
| MOD-010 MCP | `gatewayRoutes` | *(absoluto — sem prefix)* | Absoluto | — |

---

## 8. Validação Automatizada

O script `scripts/validate-route-registration.ts` DEVE ser executado antes de merge para validar que todos os route exports têm correspondência no entry point. Exit code 1 se gaps encontrados.

```bash
npx tsx scripts/validate-route-registration.ts
```
