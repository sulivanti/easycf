> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento normativo em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-UX-011-M02

- **Documento base:** [DOC-UX-011](../../DOC-UX-011__Application_Shell_e_Navegacao.md)
- **estado_item:** MERGED
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-25
- **owner:** arquitetura
- **Motivação:** Lições do primeiro deploy em produção — três problemas encontrados: (1) rota raiz `/` ausente causava "Not Found" ao acessar o domínio, (2) route files com formulários inline não funcionavam em produção, (3) redirect pós-login com `router.navigate()` não relia o auth context do localStorage.
- **rastreia_para:** DOC-UX-011, DOC-UX-012 §5.3, MOD-001, MOD-000

---

## Detalhamento

### Alteração 1: Rota `index.tsx` obrigatória (§2.2)

Adicionado `index.tsx` à árvore de rotas como rota raiz `/` que redireciona para `/login` (não autenticado) ou `/dashboard` (autenticado).

**Regra:** A rota `index.tsx` (path `/`) DEVE existir. Sem ela, o TanStack Router retorna "Not Found" ao acessar a raiz do domínio.

### Alteração 2: Proibição de formulários inline em route files (§3.3)

Adicionado import explícito de `LoginPage` no exemplo de `src/routes/login.tsx` e regra proibitiva:

> Route files NÃO DEVEM conter formulários HTML inline ou componentes de página embutidos. O `component` DEVE sempre importar o Page Component real do módulo correspondente.

**Razão:** Formulários inline em route files são placeholders que silenciosamente não funcionam em produção — o submit não dispara porque não há `onSubmit` handler conectado.

### Alteração 3: Exceção `window.location.href` pós-login (CA-05)

CA-05 atualizado para permitir `window.location.href` **exclusivamente** após login bem-sucedido, onde é necessário full reload para reler o auth context do localStorage (ver DOC-UX-012 §5.3).

### Novos Critérios de Aceitação

- **CA-07:** Route files DEVEM importar Page Components dos módulos. É PROIBIDO embutir formulários, lógica de negócio ou componentes de página inline em route files.
- **CA-08:** A rota raiz `/` (index.tsx) DEVE existir com redirect para `/login` ou `/dashboard`.

---

## Impacto nos Pilares

- **Pilares afetados:** UX (rotas), FR (codegen deve gerar route files corretos)
- **Módulos impactados:** MOD-001 (shell/rotas), MOD-000 (LoginPage), todos os módulos com rotas web
- **Ação requerida:**
  1. Verificar que `apps/web/src/routes/index.tsx` existe com redirect
  2. Verificar que `apps/web/src/routes/login.tsx` importa `LoginPage` real (não inline)
  3. Revisar route files de todos os módulos com código gerado para conformidade com CA-07

---

## Resolução do Merge

> **Merged por:** merge-amendment (selo retroativo) em 2026-03-25
> **Versão base após merge:** DOC-UX-011 v1.3.0
> **Alterações aplicadas:** Rota index obrigatória (§2.2), proibição formulários inline (§3.3), exceção window.location.href (CA-05), CA-07 e CA-08 — conteúdo incorporado no base doc durante o primeiro deploy
