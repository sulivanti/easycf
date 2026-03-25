> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento normativo em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-UX-012-M02

- **Documento base:** [DOC-UX-012](../../DOC-UX-012__Componentes_Globais_e_Feedback.md)
- **estado_item:** MERGED
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-25
- **owner:** arquitetura
- **Motivação:** Após o primeiro deploy, o guard `_auth.tsx` redirecionava para `/login` infinitamente mesmo após login bem-sucedido. Causa: o `RouterProvider` recebia `auth.user = null` hardcoded no `main.tsx`, ignorando tokens válidos no localStorage. Necessário definir padrão obrigatório de inicialização do auth context.
- **rastreia_para:** DOC-UX-012, DOC-UX-011 CA-05, MOD-001, MOD-000

---

## Detalhamento

### Nova seção: §5.3 — Inicialização do Auth Context (RouterProvider)

O `RouterProvider` do `@tanstack/react-router` recebe um `context` que inclui o estado de autenticação. Este contexto DEVE ser populado **antes** da renderização inicial, lendo tokens persistidos no `localStorage`.

**Regra:** O `main.tsx` DEVE:

1. Verificar se existem tokens válidos em `localStorage` (chave `auth_tokens`)
2. Decodificar o JWT (payload base64) para extrair `sub` (userId) e demais claims
3. Passar o objeto `auth: { user: { id, email } }` ao `RouterProvider` via prop `context`
4. Se não houver tokens, passar `auth: { user: null }`

**Código exemplo:**

```typescript
function getAuthFromStorage(): AuthContext {
  try {
    const raw = localStorage.getItem('auth_tokens');
    if (!raw) return { user: null };
    const { access_token } = JSON.parse(raw);
    if (!access_token) return { user: null };
    const payload = JSON.parse(atob(access_token.split('.')[1]));
    return { user: { id: payload.sub, email: payload.email ?? '' } };
  } catch {
    return { user: null };
  }
}
```

**Pós-login:** Como o `context` é lido apenas na montagem do `App`, após salvar tokens no `localStorage` o login DEVE usar `window.location.href = '/'` para forçar full reload e reler o context. Esta é a única exceção à regra DOC-UX-011 CA-05.

### Novo Critério de Aceitação

- **CA-06:** O `main.tsx` DEVE inicializar o auth context do `RouterProvider` lendo tokens do `localStorage`. O context `auth.user` NUNCA deve ser hardcoded como `null`.

---

## Impacto nos Pilares

- **Pilares afetados:** UX (auth context), SEC (leitura de tokens), FR (main.tsx obrigatório)
- **Módulos impactados:** MOD-001 (main.tsx vive no shell), MOD-000 (LoginPage deve fazer full reload pós-login)
- **Ação requerida:**
  1. Verificar que `apps/web/src/main.tsx` contém `getAuthFromStorage()` e passa ao RouterProvider
  2. Verificar que LoginPage usa `window.location.href = '/'` após login bem-sucedido
  3. Confirmar que `auth.user` não está hardcoded como `null`

---

## Resolução do Merge

> **Merged por:** merge-amendment (selo retroativo) em 2026-03-25
> **Versão base após merge:** DOC-UX-012 v1.2.0
> **Alterações aplicadas:** Nova §5.3 Inicialização Auth Context (RouterProvider) + CA-06 — conteúdo incorporado no base doc durante o primeiro deploy
