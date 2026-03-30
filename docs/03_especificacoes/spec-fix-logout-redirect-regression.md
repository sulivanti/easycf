---
title: "Fix: Regressão no redirect de logout — tokens não limpos no localStorage"
version: 1.0
date_created: 2026-03-30
last_updated: 2026-03-30
owner: arquitetura
tags: [bugfix, auth, logout, regression, app]
---

# Introduction

Ao clicar em "Sair" no sistema, o usuário não é redirecionado à página de login (`/login`). Em vez disso, permanece na `/dashboard` exibindo erros. Este bug já havia sido resolvido anteriormente na implementação original do módulo Foundation, porém regrediu quando o módulo Backoffice Admin criou sua própria implementação duplicada do hook `useLogout` sem replicar a limpeza de tokens do localStorage.

## 1. Purpose & Scope

**Propósito:** Corrigir a regressão no fluxo de logout para que o sistema limpe corretamente os tokens de autenticação e redirecione o usuário à tela de login.

**Escopo:**
- Hook `useLogout` do módulo `backoffice-admin` (arquivo em uso pela UI)
- Consolidação para eliminar a duplicação de hooks de logout entre `foundation` e `backoffice-admin`
- Garantir que o contexto do router (`context.auth`) seja invalidado após logout

**Audiência:** Desenvolvedores front-end e arquitetura do ECF.

## 2. Definitions

| Termo | Definição |
|-------|-----------|
| **auth_tokens** | Chave no `localStorage` que armazena `access_token` e `refresh_token` em formato JSON |
| **useLogout** | Hook React que encapsula a mutation de logout (POST `/auth/logout`) |
| **clearTokens()** | Função utilitária em `foundation/hooks/use-auth.ts` que executa `localStorage.removeItem('auth_tokens')` |
| **forceLogout()** | Função de emergência em `foundation/utils/force-logout.ts` — limpa tokens + hard redirect via `window.location.href` |
| **Router Context** | Objeto `{ queryClient, auth }` passado ao `RouterProvider` no `main.tsx`, avaliado apenas no bootstrap da aplicação |

## 3. Requirements, Constraints & Guidelines

### 3.1 Causa Raiz

O hook `useLogout` do módulo `backoffice-admin` (`apps/web/src/modules/backoffice-admin/hooks/use-logout.ts`) **não limpa o `localStorage`** no callback `onSettled`:

```typescript
// BUGGY — backoffice-admin/hooks/use-logout.ts (linhas 53-56)
onSettled: () => {
  queryClient.clear();
  navigate({ to: '/login' });  // ← navega, mas tokens permanecem no localStorage
},
```

Enquanto a implementação **correta** do Foundation faz:

```typescript
// CORRETO — foundation/hooks/use-auth.ts (linhas 76-80)
onSettled: () => {
  clearTokens();              // ← localStorage.removeItem('auth_tokens')
  queryClient.clear();
  navigate({ to: '/login' });
},
```

### 3.2 Por que o bug se manifesta

1. `main.tsx` chama `getAuthFromStorage()` **uma única vez** no render do `<App>` (linha 32)
2. O contexto `{ auth }` é passado ao router e **não é reatualizado** após mutações
3. O route guard `_auth.tsx` verifica `context.auth?.user` no `beforeLoad` — como o contexto não muda, o guard não redireciona
4. Com tokens ainda no `localStorage`, um refresh da página reconstrói `context.auth` com dados válidos, mantendo o usuário "autenticado" visualmente mas com sessão expirada no backend
5. Chamadas API subsequentes falham com 401, gerando os erros visíveis na `/dashboard`

### 3.3 Motivo da Regressão

O commit `fed0682` ("feat: codegen completo MOD-002 a MOD-011") criou um **novo** arquivo `use-logout.ts` no módulo `backoffice-admin` durante o code generation em batch. Este novo hook foi escrito sem o `clearTokens()` que existia na implementação original do Foundation. O `LogoutConfirmDialog.tsx` importa o hook do `backoffice-admin` (caminho relativo `../hooks/use-logout`), não o do `foundation`.

### 3.4 Requisitos

- **REQ-001**: O hook `useLogout` usado pela UI DEVE chamar `localStorage.removeItem('auth_tokens')` antes de navegar para `/login`
- **REQ-002**: Após logout, o router context DEVE refletir `auth.user = null` para que o route guard funcione corretamente
- **REQ-003**: Eliminar a duplicação — deve existir um único `useLogout` canônico, preferencialmente no módulo `foundation`, re-exportado pelo `backoffice-admin` se necessário
- **CON-001**: Não alterar a assinatura pública do hook (retorna `useMutation` result) para evitar quebra em consumidores
- **GUD-001**: Preferir `forceLogout()` ou equivalente (hard redirect via `window.location.href`) em vez de `navigate()` do router, pois o hard redirect força re-execução de `getAuthFromStorage()` no próximo carregamento

## 4. Interfaces & Data Contracts

### Hook `useLogout` — contrato esperado

```typescript
// Retorno: UseMutationResult padrão do @tanstack/react-query
function useLogout(): UseMutationResult<ResponseType, ApiError, void>;

// Comportamento obrigatório no onSettled:
// 1. localStorage.removeItem('auth_tokens')
// 2. queryClient.clear()
// 3. Redirect para /login (preferencialmente hard redirect)
```

### Fluxo de logout esperado

```
ProfileWidget → LogoutConfirmDialog → useLogout.mutate()
  → POST /auth/logout (API)
  → onSettled:
      1. localStorage.removeItem('auth_tokens')
      2. queryClient.clear()
      3. window.location.href = '/login'  (hard redirect)
```

## 5. Acceptance Criteria

- **AC-001**: Given um usuário autenticado na `/dashboard`, When ele clica em "Sair" e confirma, Then o `localStorage` NÃO deve conter a chave `auth_tokens`
- **AC-002**: Given um logout executado com sucesso, When a página `/login` carrega, Then `getAuthFromStorage()` deve retornar `{ user: null }`
- **AC-003**: Given um logout executado com sucesso, When o usuário tenta navegar manualmente para `/dashboard`, Then o route guard deve redirecionar para `/login`
- **AC-004**: Given uma falha de rede no POST `/auth/logout`, When o `onSettled` executa, Then os tokens ainda devem ser removidos do `localStorage` e o redirect deve ocorrer
- **AC-005**: Given o codebase após a correção, When buscamos por `useLogout` no diretório `apps/web/src`, Then deve existir apenas uma implementação canônica (não duas duplicadas)

## 6. Test Automation Strategy

- **Test Levels**: Unit (hook isolado com mock de queryClient e localStorage)
- **Frameworks**: Vitest + @testing-library/react-hooks
- **Casos de teste**:
  1. Após `logout.mutate()`, `localStorage.getItem('auth_tokens')` retorna `null`
  2. Após `logout.mutate()`, `queryClient.clear()` é chamado
  3. Mesmo com erro na API, `onSettled` limpa tokens e redireciona
  4. Verificar que não existem imports do hook duplicado antigo

## 7. Rationale & Context

### Por que hard redirect em vez de `navigate()`

O `navigate()` do TanStack Router opera dentro do contexto React existente. Como o `context.auth` é calculado uma única vez no `<App>` e passado ao `RouterProvider`, uma navegação via router **não** recalcula o contexto. Usar `window.location.href = '/login'` força um full page reload, que executa novamente `getAuthFromStorage()` com o localStorage já limpo, garantindo `context.auth.user = null`.

### Por que consolidar o hook

Duas implementações de `useLogout` com comportamentos diferentes é uma receita para regressões futuras. O módulo `foundation` já tem a implementação correta com `clearTokens()`. O `backoffice-admin` deve reutilizá-la, não duplicá-la.

## 8. Dependencies & External Integrations

### Technology Platform Dependencies
- **PLT-001**: TanStack Router — gerenciamento de rotas e contexto de autenticação
- **PLT-002**: TanStack React Query — cache de estado servidor e mutations
- **PLT-003**: localStorage API — persistência de tokens de autenticação

## 9. Examples & Edge Cases

### Edge Case 1: Logout com sessão já expirada no backend

```text
Cenário: Token expirou no backend, mas ainda existe no localStorage
1. Usuário clica "Sair"
2. POST /auth/logout retorna 401 (token inválido)
3. onSettled DEVE executar mesmo assim (é o comportamento do onSettled)
4. localStorage.removeItem('auth_tokens') → limpa tokens
5. Hard redirect para /login → tela de login limpa
```

### Edge Case 2: Múltiplos cliques em "Sair"

```text
Cenário: Usuário clica "Sair" rapidamente duas vezes
1. Primeira mutation inicia
2. Segunda mutation inicia (ou é ignorada se pending)
3. onSettled do primeiro já limpa tudo
4. Não deve haver race condition
```

### Edge Case 3: Interceptor 401 vs logout manual

```text
Cenário: Uma chamada API retorna 401 ENQUANTO o logout está em andamento
1. Interceptor 401 em api-client.ts chama forceLogoutFromClient()
2. useLogout.onSettled também tenta limpar
3. Ambos são idempotentes (removeItem + clear são seguros para chamar múltiplas vezes)
```

## 10. Validation Criteria

1. Após aplicar a correção, clicar em "Sair" deve redirecionar para `/login` sem erros
2. `localStorage.getItem('auth_tokens')` deve retornar `null` após logout
3. Navegar manualmente para `/dashboard` após logout deve redirecionar para `/login`
4. Grep por `useLogout` não deve encontrar implementações duplicadas
5. Testes unitários existentes em `use-auth.test.ts` devem continuar passando

## 11. Related Specifications / Further Reading

- `apps/web/src/modules/foundation/utils/force-logout.ts` — implementação de referência para logout de emergência
- `apps/web/src/modules/foundation/hooks/use-auth.ts` — implementação correta do `useLogout` com `clearTokens()`
- `apps/web/src/main.tsx` — ponto de inicialização do contexto de autenticação

---

## Appendix A: Plano de Execução

### Arquivos afetados

| # | Arquivo | Ação |
|---|---------|------|
| 1 | `apps/web/src/modules/backoffice-admin/hooks/use-logout.ts` | **Modificar** — adicionar `localStorage.removeItem('auth_tokens')` no `onSettled` e usar hard redirect |
| 2 | `apps/web/src/modules/backoffice-admin/components/LogoutConfirmDialog.tsx` | **Verificar** — confirmar que import aponta para hook corrigido |
| 3 | `apps/web/src/modules/foundation/hooks/use-auth.test.ts` | **Verificar** — garantir cobertura de testes |

### Steps

| Step | Descrição | Paralelizável |
|------|-----------|---------------|
| 1 | Corrigir `use-logout.ts` do backoffice-admin: adicionar `localStorage.removeItem('auth_tokens')` e trocar `navigate()` por `window.location.href = '/login'` | — |
| 2 | Verificar imports em `LogoutConfirmDialog.tsx` | Sim (com Step 1) |
| 3 | Rodar testes existentes (`pnpm test`) | Após Step 1 |
| 4 | Teste manual: login → dashboard → sair → verificar redirect e localStorage | Após Step 3 |

### Paralelização

Steps 1 e 2 podem ser executados em paralelo. Step 3 depende de Step 1. Step 4 depende de Step 3.

### Estimativa de impacto

- **Risco:** Baixo — alteração pontual em um callback `onSettled`
- **Blast radius:** Apenas o fluxo de logout
- **Rollback:** Reverter o commit da correção
