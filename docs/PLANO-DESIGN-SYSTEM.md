# Plano: Design System — Fechamento de Normativas (v2)

> **Status:** EM PLANEJAMENTO | **Data:** 2026-03-26 | **Arquivo temporario** (remover apos conclusao)
> **Fonte:** Cruzamento de `docs/design-system-ecf.md` (inventario ~65 componentes) com DOC-UX-011/012/013

---

## Analise: design-system-ecf.md vs Normativos atuais

### Gaps criticos

| Aspecto | Faltando nos normativos |
|---------|------------------------|
| Tokens de cor | accent-hover, accent-border, bg-sidebar, bg-card, 6 status-bg, topbar-badge-* (**12+ tokens**) |
| Tipografia | Tokens CSS semanticos (--type-display etc.), niveis subtitle e sidebar-label |
| Primitivos form | Select, Checkbox, Radio, Switch, Textarea, DatePicker, FormField (**7 componentes**) |
| Componentes dados | DataTable (TanStack Table), Pagination, EmptyState, FilterBar, SearchBar (**5 componentes**) |
| Componentes complementares | StatusBadge, IconButton, Pill, Tag, ConfirmationModal, ReadOnlyField (**6 componentes**) |
| UI Patterns | Status→Cor, Imutabilidade, Soft-Delete, Fork, Gate Resolution, Motor Eval (**6 patterns**) |
| Form stack | react-hook-form + zod nao normatizados |
| Deps tecnicas | reactflow, date-fns, @fontsource nao normatizados |

### Conflitos resolvidos

| Conflito | Resolucao |
|----------|-----------|
| Folder `design-system/` vs `shared/ui/` | **Manter `shared/ui/`** flat (shadcn) + criar `shared/hooks/` e `shared/layouts/` |
| `tailwind.config.ts` vs `@theme` | **Manter `@theme`** no CSS (Tailwind v4, proibido config.ts) |
| Font unica (PJS) vs dual (Inter+PJS) | **Manter dual** — levantamento simplificou demais |
| Cores status divergentes | **Manter palette Tailwind** (normativos), adicionar apenas backgrounds |
| CooldownButton/PasswordStrength/FlowCanvas em shared | **Mover para modules/** (domain-specific, nao shared) |

---

## ETAPA 1 — 10 Amendments Normativos

| # | Amendment | Doc | Tema | Batch |
|---|-----------|-----|------|-------|
| 1 | DOC-UX-013-M02 | 013 | Tokens expandidos (cores + tipografia semantica) | P0 |
| 2 | DOC-UX-013-M03 | 013 | Componentes form + form stack (rhf+zod) | P0 |
| 3 | DOC-UX-013-M04 | 013 | Componentes de dados (DataTable, Pagination, EmptyState, Filter, Search) | P0 |
| 4 | DOC-UX-013-M05 | 013 | Complementares (StatusBadge, Pill, Tag, ConfirmModal, ReadOnlyField) | P0 |
| 5 | DOC-UX-013-M06 | 013 | Iconografia (action→icone, tamanho/stroke/cor) | P1 |
| 6 | DOC-UX-011-M05 | 011 | Page Layouts (List/Detail/Form/Tree/Canvas + component trees) | P1 |
| 7 | DOC-UX-011-M06 | 011 | Responsividade (breakpoints, sidebar collapse, touch) | P2 |
| 8 | DOC-UX-012-M03 | 012 | UI Patterns globais + Motion guidelines | P2 |
| 9 | DOC-UX-012-M04 | 012 | Acessibilidade (WCAG 2.1 AA) | P2 |
| 10 | DOC-UX-013-M07 | 013 | Deps tecnicas + folder structure (shared/) | P2 |

### Decisoes pendentes

- [ ] Cores de status: manter Tailwind palette ou adotar custom do levantamento?
- [ ] TreeView e Timeline: shared ou module-specific?

---

## ETAPA 2 — Ajuste de Codigo (pos-merge)

| Amendment | Codigo afetado | Tipo |
|-----------|---------------|------|
| M02 | `index.css` | ~15 tokens no @theme |
| M03 | `shared/ui/` + package.json | 6 novos shadcn + react-hook-form + zod |
| M04 | `shared/ui/` + package.json | 5 novos + @tanstack/react-table |
| M05 | `shared/ui/` | 6 novos componentes |
| M06 | `shared/ui/icon-map.ts` | Mapeamento action→icone |
| M05-layouts | `shared/layouts/` | 4-5 layouts novos |
| M06-resp | AppShell.tsx | Breakpoints |
| M03-patterns | `shared/ui/*` existentes | Ajustes |
| M04-a11y | `shared/ui/*`, layouts | Focus, aria |
| M07 | package.json, folders | Deps + hooks/ + layouts/ |

---

## Checklist

- [ ] Batch P0 criado (M02, M03, M04, M05) → review → merge
- [ ] Batch P1 criado (M06 icones, M05 layouts) → review → merge
- [ ] Batch P2 criado (M06 resp, M03 patterns, M04 a11y, M07 deps) → review → merge
- [ ] (Etapa 2) Codigo ajustado + /validate-all PASS
