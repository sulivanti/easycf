# DOC-UX-013-M06 — Unificação de Tokens (Stitch Modelagem como Referência)

- **amendment_id:** DOC-UX-013-M06
- **parent_doc:** DOC-UX-013
- **type:** ALTER
- **status:** APPROVED
- **data:** 2026-03-27
- **autor:** produto + UX
- **motivacao:** Os 8 stitch de referência apresentam 3 linguagens visuais distintas. O stitch `modelagem_de_processos_corrigido` foi definido como referência canônica. Este amendment unifica todos os tokens ao padrão azul/branco do stitch modelagem, reservando o laranja A1 exclusivamente para branding (logo e login).

---

## 1. Contexto

O padrão visual anterior (DOC-UX-013-M02, M04) utilizava laranja `#F58C32` como accent universal e topbar escura `#111111`. O stitch modelagem usa:

- **Primary/Accent UI:** `#2563eb` (blue-600) para elementos interativos
- **Topbar:** Branca (`#FFFFFF`) com `border-b`
- **Sidebar:** Branca, colapsável (64px icon-only → 224px hover), item ativo `bg-blue-50`
- **Backgrounds:** Cool gray slate (`#f8fafc`) ao invés de warm beige (`#F5F5F3`)

---

## 2. Tokens Alterados

### 2.1 A1 Brand → Brand (logo only)

O bloco `/* A1 Brand */` é renomeado para `/* Brand (logo only) */`. Os tokens `--color-a1-accent` e `--color-a1-dark` são **mantidos sem alteração** — usados exclusivamente para o logo A1 e o painel de branding do login.

### 2.2 Superfícies e Bordas

| Token | Valor Anterior | Novo Valor | Referência Tailwind |
|-------|---------------|------------|---------------------|
| `--color-a1-active-bg` | `#FFF5EC` (laranja) | `#eff6ff` | blue-50 |
| `--color-a1-bg` | `#F5F5F3` (beige) | `#f8fafc` | slate-50 |
| `--color-a1-bg-alt` | `#FAFAF8` | `#f8fafc` | slate-50 |
| `--color-a1-border` | `#E8E8E6` (warm) | `#e2e8f0` | slate-200 |
| `--color-a1-border-light` | `#F0F0EE` | `#f1f5f9` | slate-100 |
| `--color-bg-page` | `#F5F5F3` | `#f8fafc` | slate-50 |

### 2.3 Accent Variants

| Token | Valor Anterior | Novo Valor | Referência Tailwind |
|-------|---------------|------------|---------------------|
| `--color-accent-hover` | `#E07B28` | `#1d4ed8` | blue-700 |
| `--color-accent-border` | `#F5C89A` | `#bfdbfe` | blue-200 |

### 2.4 Topbar

| Token | Valor Anterior | Novo Valor | Referência |
|-------|---------------|------------|------------|
| `--color-topbar-bg` | `#111111` | `#FFFFFF` | white |
| `--color-topbar-separator` | `#2A2A2A` | `#e2e8f0` | slate-200 |
| `--color-topbar-text` | `#FFFFFF` | `#1e293b` | slate-800 |
| `--color-topbar-text-muted` | `#999999` | `#64748b` | slate-500 |
| `--color-topbar-badge-bg` | `#F58C32` | `#2563eb` | blue-600 |
| `--color-topbar-badge-border` | `#E07B28` | `#1d4ed8` | blue-700 |

### 2.5 Text Hierarchy (warm → cool)

| Token | Valor Anterior | Novo Valor | Referência Tailwind |
|-------|---------------|------------|---------------------|
| `--color-a1-text-primary` | `#111111` | `#1e293b` | slate-800 |
| `--color-a1-text-secondary` | `#333333` | `#334155` | slate-700 |
| `--color-a1-text-tertiary` | `#555555` | `#475569` | slate-600 |
| `--color-a1-text-auxiliary` | `#888888` | `#64748b` | slate-500 |
| `--color-a1-text-hint` | `#AAAAAA` | `#94a3b8` | slate-400 |
| `--color-a1-text-placeholder` | `#CCCCCC` | `#cbd5e1` | slate-300 |

---

## 3. Tokens Adicionados

| Token | Valor | Propósito |
|-------|-------|-----------|
| `--color-sidebar-active-bg` | `#eff6ff` | Background do item ativo na sidebar (blue-50) |
| `--color-sidebar-active-text` | `#2563eb` | Texto/ícone do item ativo na sidebar (blue-600) |
| `--topbar-height` | `4rem` (64px) | Altura padrão da topbar |
| `--sidebar-collapsed` | `4rem` (64px) | Largura da sidebar colapsada (icon-only) |
| `--sidebar-expanded` | `14rem` (224px) | Largura da sidebar expandida (hover) |

---

## 4. Regra de Uso

> Os tokens `--color-a1-accent` (#F58C32) e `--color-a1-dark` (#111111) são **exclusivos** para o logo A1 e o painel de branding do login. Elementos interativos (botões, toggles, paginação, focus rings, sidebar active) DEVEM usar `--color-primary-600` (#2563eb).

---

## 5. Impacto

- **index.css:** Aplicação mecânica dos valores acima no bloco `@theme`.
- **Páginas (~53 arquivos):** Herdam automaticamente os novos valores via classes Tailwind que referenciam tokens CSS (ex: `bg-a1-bg`, `text-a1-text-primary`). Nenhuma edição necessária.
- **shared/ui:** Componentes que usam `a1-accent` para interação (toggle, pagination, select, search-bar, tag) devem migrar para `primary-600`.
- **AppShell.tsx:** Topbar e sidebar requerem reestruturação (ver DOC-UX-011-M05).
- **LoginPage.tsx:** CTA buttons migram de `a1-accent` para `primary-600`; branding panel mantém `a1-accent`/`a1-dark`.
