---
title: "Fix Session Timeout — Redirect Loop e Bloqueio na Tela de Login"
version: 1.0
date_created: 2026-03-25
owner: ECF Core Team
tags: [bugfix, foundation, auth, session, frontend, UX]
---

# Introduction

Quando a sessão do usuário expira por timeout (JWT expirado no servidor), o AppShell exibe toasts de erro repetidamente mas **impossibilita o retorno à tela de login**, criando um loop de redirecionamento. A causa raiz é que o handler de sessão expirada no AppShell não limpa o `localStorage` antes de navegar para `/login`, e a rota `/login` redireciona usuários "autenticados" (token no localStorage, mesmo que expirado) de volta para `/dashboard`.

## 1. Purpose & Scope

**Propósito:** Corrigir o fluxo de sessão expirada no frontend para que o usuário seja limpa e imediatamente direcionado à tela de login, sem loop de redirect nem toasts acumulados.

**Escopo:**

- Handler de sessão expirada no `AppShell.tsx`
- Limpeza de tokens no localStorage antes da navegação
- Invalidação do cache React Query no cenário de 401
- Forçar reload completo para resetar o router context (que é computado uma única vez no `main.tsx`)

**Audiência:** Desenvolvedores trabalhando no frontend (`apps/web`), módulo Foundation/Backoffice-Admin.

**Fora de escopo:** Alterações no backend, refresh token automático (spec futura), session polling proativo.

## 2. Definitions

| Termo | Definição |
|-------|-----------|
| Session Timeout | Expiração do JWT no servidor (12h normal, 30d remember-me). O backend retorna HTTP 401. |
| `auth_tokens` | Chave no `localStorage` que armazena `{ access_token, refresh_token, expires_in }` |
| Router Context | Objeto `{ auth: { user } }` computado UMA vez no `main.tsx` via `getAuthFromStorage()` e passado ao TanStack Router |
| AppShell | Layout wrapper que envolve todas as rotas protegidas (`_auth`). Chama `useAuthMe()` para validar sessão. |
| Redirect Loop | Ciclo: AppShell 401 → navigate `/login` → login `beforeLoad` vê token no localStorage → redirect `/dashboard` → AppShell 401 → ... |

## 3. Requirements, Constraints & Guidelines

### Problemas Identificados

**DEF-001: AppShell não limpa localStorage ao detectar 401**
- **Localização:** `apps/web/src/modules/backoffice-admin/components/AppShell.tsx:218-229`
- **Causa:** O `useEffect` que trata o erro 401 chama `navigate({ to: '/login' })` sem antes remover `auth_tokens` do localStorage
- **Impacto:** O token expirado permanece no localStorage, fazendo o route guard do `/login` redirecionar de volta

**DEF-002: Router context é estático — não reflete logout**
- **Localização:** `apps/web/src/main.tsx:17-29`
- **Causa:** `getAuthFromStorage()` é executado UMA vez na montagem do `<App>`. Remover tokens do localStorage não atualiza `context.auth.user` automaticamente
- **Impacto:** Mesmo removendo tokens, `_auth.tsx:beforeLoad` e `login.tsx:beforeLoad` usam o context stale até um full page reload

**DEF-003: Toasts acumulam durante o loop**
- **Localização:** `AppShell.tsx:220-222` + React Query retry
- **Causa:** `useAuthMe` tem `retry: 1` (herdado do QueryClient default). Cada retry gera outro 401, cada 401 dispara o `useEffect` novamente
- **Impacto:** Múltiplos toasts "Sua sessão expirou" empilham na tela

### Requisitos da Correção

- **REQ-001**: Quando o AppShell detectar um erro 401 no `useAuthMe`, DEVE limpar `localStorage['auth_tokens']` ANTES de redirecionar para `/login`.
- **REQ-002**: Após limpar os tokens, o redirecionamento DEVE usar `window.location.href = '/login'` (full reload) em vez de `navigate()`, para resetar o router context.
- **REQ-003**: O React Query cache DEVE ser limpo (`queryClient.clear()`) antes do redirect para evitar dados stale no próximo login.
- **REQ-004**: O toast de sessão expirada DEVE ser exibido apenas UMA vez por ciclo de expiração (usar `toast.dismiss()` antes ou `id` fixo no toast).
- **REQ-005**: O `useAuthMe` DEVE ter `retry: false` para chamadas que retornam 401 (não faz sentido retry em token expirado).

### Restrições

- **CON-001**: A solução deve ser exclusivamente no frontend (`apps/web`).
- **CON-002**: O fluxo de `useLogout()` (logout manual) já funciona corretamente — não alterar.
- **CON-003**: Manter compatibilidade com o `useLogout` do módulo backoffice-admin (`use-logout.ts`) que também limpa tokens.

### Guidelines

- **GUD-001**: Extrair a lógica de "force logout" (limpar tokens + cache + redirect) em uma função reutilizável, pois é compartilhada entre o handler de 401 e potenciais futuros cenários (ex: revoke de sessão via WebSocket).
- **GUD-002**: A função `forceLogout` deve ser importável tanto pelo AppShell quanto por interceptors HTTP futuros.

## 4. Interfaces & Data Contracts

### Função `forceLogout` (nova)

```typescript
// apps/web/src/modules/foundation/utils/force-logout.ts

/**
 * Limpa estado de autenticação e redireciona para /login.
 * Usa window.location.href para forçar reset do router context.
 */
export function forceLogout(queryClient: QueryClient): void {
  localStorage.removeItem('auth_tokens');
  queryClient.clear();
  window.location.href = '/login';
}
```

### AppShell — useEffect corrigido

```typescript
// Antes (quebrado)
useEffect(() => {
  if (error instanceof ApiError && error.status === 401) {
    toast.error('Sua sessão expirou. Faça login novamente.', { ... });
    navigate({ to: '/login' }); // ← NÃO FUNCIONA: token no localStorage
  }
}, [error, navigate]);

// Depois (corrigido)
useEffect(() => {
  if (error instanceof ApiError && error.status === 401) {
    toast.error('Sua sessão expirou. Faça login novamente.', {
      id: 'session-expired', // ← ID fixo evita duplicatas
    });
    forceLogout(queryClient);
    return; // early return — nada mais após redirect
  }
  if (error instanceof ApiError) {
    toast.error('Não foi possível carregar seu perfil. Tente novamente.', { ... });
  }
}, [error, queryClient]);
```

### useAuthMe — retry ajustado

```typescript
// Adicionar retry function que desabilita retry em 401
return useQuery<AuthMeResponse, ApiError>({
  queryKey: AUTH_ME_QUERY_KEY,
  queryFn: () => fetchAuthMe({ screenId, actionId }),
  staleTime: 30_000,
  enabled,
  retry: (failureCount, error) => {
    if (error.status === 401) return false; // Não retry em sessão expirada
    return failureCount < 1;
  },
});
```

## 5. Acceptance Criteria

- **AC-001**: Dado um usuário autenticado cuja sessão expirou no servidor, Quando o `GET /auth/me` retorna 401, Então o localStorage `auth_tokens` é removido, o cache React Query é limpo, e o browser navega para `/login` via full reload.
- **AC-002**: Dado o cenário de AC-001, Quando o usuário chega à tela de login, Então NÃO ocorre redirect automático de volta para `/dashboard` (loop eliminado).
- **AC-003**: Dado o cenário de AC-001, Quando a sessão expira, Então apenas UM toast "Sua sessão expirou" é exibido (sem duplicatas).
- **AC-004**: Dado um usuário na tela de login após sessão expirada, Quando faz login novamente com credenciais válidas, Então o fluxo completo funciona normalmente (tokens persistidos, router context atualizado, sidebar com módulos).
- **AC-005**: Dado um usuário que clica "Sair" no ProfileWidget, Quando o logout é processado, Então o comportamento permanece idêntico ao atual (sem regressão).
- **AC-006**: Dado um erro não-401 no `GET /auth/me` (ex: 500), Quando o AppShell processa o erro, Então o toast de erro genérico é exibido e NÃO há redirect para `/login`.

## 6. Test Automation Strategy

- **Test Levels**: Unit (função `forceLogout`), Integration (fluxo AppShell com mock de 401)
- **Frameworks**: Vitest + Testing Library (padrão do projeto)
- **Cenários de teste:**
  - `forceLogout()` remove `auth_tokens` do localStorage
  - `forceLogout()` chama `queryClient.clear()`
  - `forceLogout()` seta `window.location.href` para `/login`
  - AppShell com `useAuthMe` retornando 401 → chama `forceLogout`
  - AppShell com `useAuthMe` retornando 500 → NÃO chama `forceLogout`
  - Toast com `id: 'session-expired'` não duplica em renders consecutivos
  - `useAuthMe` com `retry` function não retenta em 401
- **Coverage Requirements**: 100% da função `forceLogout` e do `useEffect` de erro no AppShell

## 7. Rationale & Context

O bug surge da interação entre três decisões de design:

1. **Router context estático** — `getAuthFromStorage()` roda uma vez na montagem do `<App>`. Isso é eficiente, mas significa que qualquer mudança no localStorage não reflete no context até um reload.

2. **Route guards baseados no context** — `_auth.tsx` e `login.tsx` usam `context.auth.user` no `beforeLoad`. Se o context não é atualizado, os guards tomam decisões erradas.

3. **Logout manual vs. logout por timeout** — O `useLogout()` já faz `clearTokens()` + `queryClient.clear()` + `navigate('/login')`. Mas o handler de timeout no AppShell não replica essa lógica. A diferença crítica é que logout manual pode usar `navigate()` porque o `onSettled` é sincronamente seguido de um clear. Porém, no caso de timeout, o `navigate()` passa pelo `beforeLoad` que ainda vê o context antigo → redirect loop.

A decisão de usar `window.location.href` (full reload) em vez de `navigate()` é intencional: é a única forma garantida de resetar o router context que é computado no `main.tsx`. Uma alternativa seria tornar o auth context reativo (via state/context), mas isso seria um refactor maior e fora do escopo desta correção.

## 8. Dependencies & External Integrations

### Technology Platform Dependencies
- **PLT-001**: TanStack Router — route guards (`beforeLoad`) usam context estático. Limitação conhecida.
- **PLT-002**: TanStack React Query — `QueryClient.clear()` invalida todos os caches.
- **PLT-003**: Sonner — suporta `id` em toasts para deduplicação nativa.

### Internal Dependencies
- **INT-001**: `useLogout` (foundation) — já implementa limpeza de tokens. A nova `forceLogout` é uma versão "hard" sem chamada ao backend (pois a sessão já expirou).
- **INT-002**: `useLogout` (backoffice-admin) — usa `apiRequest` para logout. Não é afetado.

## 9. Examples & Edge Cases

### Edge Case 1: Usuário com múltiplas abas abertas

```
Tab A: sessão expira → forceLogout → reload → /login
Tab B: ainda renderizando AppShell → useAuthMe retorna 401 → forceLogout → /login
```

**Comportamento esperado:** Ambas as abas convergem para `/login` independentemente. Cada tab faz seu próprio `forceLogout`. Não há conflito porque `localStorage.removeItem` é idempotente.

### Edge Case 2: 401 durante navegação entre páginas

```
Usuário clica em link → nova página carrega → AppShell re-executa useAuthMe → 401
```

**Comportamento esperado:** O `useAuthMe` retorna erro, o `useEffect` no AppShell detecta 401, `forceLogout` é chamado. O loading skeleton pode piscar brevemente antes do redirect — aceitável.

### Edge Case 3: Network error (não 401)

```
Servidor offline → useAuthMe falha com TypeError (network error), não ApiError
```

**Comportamento esperado:** O `useEffect` NÃO entra no branch `instanceof ApiError`, portanto NÃO chama `forceLogout`. O toast genérico de erro pode ou não aparecer dependendo se o erro é ApiError. O retry padrão tenta 1 vez.

### Edge Case 4: Token expirado no localStorage ao abrir o app

```
Usuário abre o app após horas → getAuthFromStorage() decodifica JWT expirado → context.auth.user = truthy
→ _auth.tsx permite acesso → AppShell monta → useAuthMe 401 → forceLogout
```

**Comportamento esperado:** Funciona corretamente com a correção. O usuário verá brevemente o skeleton do AppShell antes de ser redirecionado para `/login`. Melhoria futura: verificar `exp` do JWT no `getAuthFromStorage()`.

## 10. Validation Criteria

- [ ] Sessão expirada redireciona para `/login` sem loop
- [ ] Apenas um toast "Sua sessão expirou" é exibido
- [ ] Após redirect, a tela de login carrega normalmente e aceita credenciais
- [ ] `localStorage['auth_tokens']` está vazio após o redirect
- [ ] Logout manual via ProfileWidget ("Sair") continua funcionando normalmente
- [ ] Erros não-401 (500, network) NÃO redirecionam para `/login`
- [ ] Múltiplas abas convergem para `/login` sem erro

## 11. Related Specifications / Further Reading

- [spec-fix-auth-flow-session-expired.md](spec-fix-auth-flow-session-expired.md) — Correção backend do JWT sem tenant/scopes (spec complementar, lado servidor)
- [spec-fix-auth-route-response-mapping.md](spec-fix-auth-route-response-mapping.md) — Mapeamento camelCase→snake_case nas rotas de auth
- `apps/web/src/modules/backoffice-admin/components/AppShell.tsx` — Componente que detecta 401
- `apps/web/src/main.tsx` — Entry point onde `getAuthFromStorage()` computa o router context
- `apps/web/src/routes/login.tsx` — Route guard que redireciona authenticated users
- `apps/web/src/routes/_auth.tsx` — Route guard que protege rotas autenticadas

### Arquivos Críticos (Mapa de Alterações)

| Arquivo | Alteração |
|---------|-----------|
| `modules/foundation/utils/force-logout.ts` | **NOVO** — função `forceLogout(queryClient)` |
| `modules/backoffice-admin/components/AppShell.tsx` | Substituir `navigate('/login')` por `forceLogout()`, adicionar `queryClient` |
| `modules/backoffice-admin/hooks/use-auth-me.ts` | Adicionar `retry` function que desabilita retry em 401 |
