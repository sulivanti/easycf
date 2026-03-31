---
title: "Fix: Página Não Reage a Perda de Conexão / Sessão Invalidada"
version: 1.0
date_created: 2026-03-30
owner: ECF Core
tags: [bugfix, auth, session, network, frontend, ux]
---

# Introduction

Quando a conexão com o servidor é perdida (rede offline, servidor reiniciado, sessão revogada externamente), a página permanece inalterada — o usuário só percebe ao tentar interagir, e frequentemente precisa fechar todas as abas do navegador para restaurar o estado. A aplicação não detecta proativamente a perda de conectividade nem sincroniza logout entre abas.

## 1. Purpose & Scope

**Propósito:** Implementar detecção de desconexão, revalidação automática ao retornar, e sincronização de logout entre abas, para que o usuário seja redirecionado ao login automaticamente quando a sessão é invalidada.

**Escopo:**
- Frontend: hooks de sessão, QueryClient config, AppShell
- Não altera backend (os endpoints já retornam 401 corretamente)
- Afeta: MOD-000 (Foundation)

## 2. Definitions

| Termo | Definição |
|---|---|
| **Reconnect** | Evento quando o navegador volta a ter conectividade após ficar offline |
| **Visibility Change** | Evento `visibilitychange` disparado quando a aba ganha/perde foco |
| **Cross-tab Sync** | Mecanismo para sincronizar estado de autenticação entre múltiplas abas |
| **Storage Event** | Evento `storage` disparado quando outra aba modifica `localStorage` |

## 3. Requirements, Constraints & Guidelines

### Gaps Identificados

| Gap | Status Atual | Impacto |
|---|---|---|
| Detecção offline/online | Não implementado | Página não reage a perda de rede |
| Revalidação ao retornar (visibility) | Não implementado | Aba em segundo plano não detecta sessão expirada |
| Sync cross-tab (storage event) | Não implementado | Logout em uma aba não afeta outras |
| React Query reconnect/focus | Não configurado | Queries não re-executam ao reconectar |

### Requisitos

- **REQ-001**: O `QueryClient` DEVE ser configurado com `refetchOnReconnect: true` para que queries sejam re-executadas automaticamente quando a conectividade é restaurada.

- **REQ-002**: O `QueryClient` DEVE ser configurado com `refetchOnWindowFocus: true` (ou seletivamente na query `auth/me`) para que o perfil do usuário seja revalidado quando a aba ganha foco.

- **REQ-003**: O `useSessionKeepAlive` DEVE escutar o evento `visibilitychange` e, ao retornar de `hidden` para `visible`, executar um refresh imediato se o token estiver expirado ou próximo de expirar (independente do intervalo de 30s).

- **REQ-004**: Um listener de `storage` event DEVE ser registrado para detectar quando outra aba remove `auth_tokens` do `localStorage` (logout cross-tab). Ao detectar remoção, a aba corrente DEVE executar `forceLogout`.

- **REQ-005**: Quando o `useSessionKeepAlive` falha no refresh (catch block), e o token já está expirado (não apenas próximo de expirar), o hook DEVE chamar `forceLogout` em vez de silenciar o erro.

- **CON-001**: O `refetchOnWindowFocus` para queries gerais pode ser `false` (evitar excesso de requests). Apenas a query `auth/me` DEVE ter `refetchOnWindowFocus: true`.

- **CON-002**: O listener de `storage` DEVE verificar especificamente a chave `auth_tokens` — não reagir a outras mudanças no `localStorage`.

- **GUD-001**: Usar `navigator.onLine` como check complementar (não primário) — browsers podem reportar `onLine=true` mesmo sem conectividade real. A revalidação via request é mais confiável.

## 4. Interfaces & Data Contracts

### useSessionKeepAlive — Alterações

```typescript
export function useSessionKeepAlive(options?: UseSessionKeepAliveOptions): void {
  // ... existing interval logic ...

  // REQ-003: Revalidar ao retornar de background
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState !== 'visible') return;
      if (isRefreshingRef.current) return;

      const expiresAt = getTokenExpiresAt();
      if (expiresAt === null) return;

      const remainingMs = expiresAt - Date.now();
      if (remainingMs <= 0) {
        // Token já expirou — forceLogout
        forceLogoutFromClient();
        return;
      }
      if (remainingMs <= refreshWindowSeconds * 1000) {
        // Token perto de expirar — refresh imediato
        doRefresh();
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refreshWindowSeconds]);
}
```

### useCrossTabSync — Novo Hook

```typescript
/**
 * Escuta storage events para detectar logout em outra aba.
 * Quando auth_tokens é removido externamente → forceLogout.
 */
export function useCrossTabSync(): void {
  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== 'auth_tokens') return;
      if (event.newValue === null) {
        // Tokens removidos por outra aba → forceLogout
        window.location.href = '/login';
      }
    }

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
}
```

### QueryClient — Configuração Atualizada

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
      refetchOnReconnect: true,   // REQ-001
      refetchOnWindowFocus: false, // CON-001: false por default
    },
  },
});
```

### useAuthMe — refetchOnWindowFocus Seletivo

```typescript
// No hook useAuthMe
const query = useQuery({
  queryKey: AUTH_ME_QUERY_KEY,
  queryFn: () => apiClient.get('/auth/me'),
  staleTime: 5 * 60 * 1000,
  refetchOnWindowFocus: true,  // REQ-002: revalidar perfil ao focar aba
});
```

## 5. Acceptance Criteria

- **AC-001**: Given a página está aberta e a rede cai, When a rede volta, Then as queries de dados são re-executadas automaticamente.

- **AC-002**: Given a página está em background por >15min (token expirado), When o usuário volta à aba, Then o sistema tenta refresh e, se falhar, redireciona para /login.

- **AC-003**: Given duas abas abertas, When o usuário faz logout em uma aba, Then a outra aba é redirecionada para /login automaticamente.

- **AC-004**: Given a página está aberta e o token já expirou, When o keep-alive detecta expiração, Then executa forceLogout (não silencia o erro).

- **AC-005**: Given a página está em background, When o usuário retorna e o token está perto de expirar (dentro da janela de 2min), Then o refresh é executado imediatamente (não espera o próximo ciclo de 30s).

## 6. Test Automation Strategy

- **Nível**: Unit test (Vitest) + Manual
- **Cenários unitários**:
  1. `useCrossTabSync`: simular `StorageEvent` com `key='auth_tokens'` e `newValue=null` → verifica redirect
  2. `useSessionKeepAlive` com `visibilitychange`: verificar refresh imediato quando token perto de expirar
- **Cenários manuais**:
  1. Desligar rede → religar → verificar refetch automático
  2. Abrir 2 abas → logout em uma → verificar redirect na outra
  3. Deixar aba em background >15min → voltar → verificar redirect para login

## 7. Rationale & Context

O problema ocorre porque:
1. O `useSessionKeepAlive` roda a cada 30s, mas **não reage a eventos de reconexão/visibilidade**
2. O React Query usa `refetchOnReconnect: true` por padrão, mas o `QueryClient` do ECF não sobrescreve — porém as queries de auth são configuradas com `staleTime` alto, o que pode impedir o refetch
3. Não há `storage` event listener, então logout cross-tab é ignorado
4. O catch block do keep-alive silencia erros de refresh, mesmo quando o token já expirou completamente

## 8. Dependencies & External Integrations

Nenhuma dependência nova. Todos os recursos usados são APIs nativas do browser:
- `document.visibilitychange`
- `window.storage` event
- `navigator.onLine` (complementar)
- React Query `refetchOnReconnect` / `refetchOnWindowFocus` (já disponível)

## 9. Examples & Edge Cases

### Edge Case 1: Aba em background por horas
Token expira, refresh token também expira (7d). Ao retornar: `visibilitychange` → detecta token expirado → `forceLogout`. Sem requests desnecessárias.

### Edge Case 2: Servidor reinicia mas rede OK
Requests falham com `ERR_CONNECTION_REFUSED` (não 401). React Query retry (1x) pode capturar o retorno. Se servidor demora >15min: token expira → próximo request dispara 401 → `forceLogout`.

### Edge Case 3: Storage event de outra origin
O `storage` event só dispara para mudanças na **mesma origin** por **outra aba**. Não há risco de interferência cross-origin.

### Edge Case 4: Múltiplas abas fazendo refresh simultâneo
O mutex `refreshPromise` no `http-client.ts` já resolve isso — apenas uma aba faz o refresh por vez. O `storage` event de tokens atualizados **não** dispara `forceLogout` (apenas `newValue === null` dispara).

## 10. Validation Criteria

1. Abrir app → desligar WiFi → religar → dados atualizam automaticamente
2. Abrir 2 abas → logout em aba A → aba B redireciona para /login
3. Deixar aba em background >15min → retornar → redirecionamento para /login
4. Keep-alive com token expirado → `forceLogout` (não silêncio)
5. Testes unitários passando

## 11. Related Specifications / Further Reading

- `docs/03_especificacoes/spec-refresh-token-scopes-fix.md` — Fix complementar no backend
- `docs/04_modules/mod-000-foundation/requirements/fr/FR-000.md` — FR-023 (Smart Session Keep-Alive)
- `docs/04_modules/mod-000-foundation/amendments/ux/UX-000-C01.md` — Jornada "Sessão Expirada"
- `docs/04_modules/mod-000-foundation/amendments/fr/FR-000-C06.md` — forceLogout (redirect loop fix)

---

## Appendix A: Plano de Execução

### Arquivos Afetados

| # | Arquivo | Ação | Descrição |
|---|---|---|---|
| 1 | `apps/web/src/main.tsx` | **MODIFICAR** | Adicionar `refetchOnReconnect: true` no QueryClient |
| 2 | `apps/web/src/modules/foundation/hooks/useSessionKeepAlive.ts` | **MODIFICAR** | Adicionar listener `visibilitychange` + forceLogout quando token expirado |
| 3 | `apps/web/src/modules/foundation/hooks/useCrossTabSync.ts` | **CRIAR** | Hook para storage event listener (logout cross-tab) |
| 4 | `apps/web/src/modules/backoffice-admin/components/AppShell.tsx` | **MODIFICAR** | Montar `useCrossTabSync()` |
| 5 | `apps/web/src/modules/backoffice-admin/hooks/use-auth-me.ts` | **MODIFICAR** | Adicionar `refetchOnWindowFocus: true` na query auth/me |

### Steps

| Step | Descrição | Paralelizável |
|---|---|---|
| 1 | QueryClient config (`main.tsx`) — `refetchOnReconnect: true` | Sim |
| 2 | `useSessionKeepAlive` — `visibilitychange` + forceLogout | Sim |
| 3 | Criar `useCrossTabSync` hook | Sim |
| 4 | Montar `useCrossTabSync` no AppShell | Depende de Step 3 |
| 5 | `useAuthMe` — `refetchOnWindowFocus: true` | Sim |

### Estimativa de Impacto
- **Risco:** Baixo — hooks novos + config React Query, sem alterações em lógica existente
- **Rollback:** Simples — revert do commit
- **Downtime:** Zero — mudanças apenas no frontend
