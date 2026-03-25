> **EMENDA** — Este arquivo altera o artefato-base sem modificá-lo diretamente.
>
> | Campo | Valor |
> |---|---|
> | Artefato-base | SEC-001 |
> | Módulo | MOD-001 |
> | Versão da emenda | 0.1.0 |
> | Data | 2026-03-24 |
> | Origem | PENDENTE-007 (PEN-001) |
> | Autor | Marcos Sulivan |

# AMD-SEC-001-001 — Interceptor HTTP 401 global no api-client.ts

## Motivação

SEC-001 §6 especifica que o interceptor HTTP 401 deve ser **global** — redirecionando para `/login` com Toast "Sua sessão expirou. Faça login novamente." em qualquer requisição com sessão expirada. No entanto, o `api-client.ts` apenas lançava `ApiError(401)` sem executar o redirect, deixando o tratamento de 401 disperso em componentes individuais (AppShell.tsx, DashboardPage.tsx). Isso violava SEC-001 §6: se uma nova tela fosse adicionada sem tratar 401 explicitamente, a sessão expirada ficaria sem feedback ao usuário.

## Alteração

### api-client.ts — bloco 401 em `apiRequest()`

**Antes:**
```typescript
if (response.status === 401) {
  // Session expired — redirect handled by caller or global interceptor
  const problem: ProblemDetail = {
    type: '/problems/unauthorized',
    title: 'Unauthorized',
    status: 401,
  };
  throw new ApiError(401, problem, correlationId);
}
```

**Depois:**
```typescript
if (response.status === 401) {
  // SEC-001 §6: interceptor global — redirect /login em qualquer 401
  window.location.href = '/login';
  const problem: ProblemDetail = {
    type: '/problems/unauthorized',
    title: 'Unauthorized',
    status: 401,
  };
  throw new ApiError(401, problem, correlationId);
}
```

O `window.location.href = '/login'` executa antes do throw, garantindo que o redirect ocorra independente de como o caller trata o erro. O throw é mantido para que callers com try/catch possam realizar cleanup (ex: limpar state local).

## Impacto

- **Compatibilidade:** Retrocompatível — callers que já tratavam 401 com redirect podem remover o tratamento redundante
- **Artefatos modificados:** `api-client.ts`
- **Testes:** Testes existentes de api-client devem ser atualizados para mockar `window.location`
- **estado_item:** MERGED

---

## Resolução do Merge

> **Merged por:** merge-amendment em 2026-03-25
> **Versão base após merge:** SEC-001 v0.6.0
> **Alterações aplicadas:** Interceptor HTTP 401 global documentado em SEC-001 §2
