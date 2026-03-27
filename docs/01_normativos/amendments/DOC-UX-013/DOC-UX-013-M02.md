> **ARQUIVO GERIDO POR AUTOMACAO.**
> - Emenda sobre documento normativo/requisito em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-UX-013-M02

- **Documento base:** [DOC-UX-013](../../DOC-UX-013__Design_System_e_Tokens_Visuais.md)
- **estado_item:** MERGED
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-27
- **owner:** produto + UX + arquitetura
- **Motivacao:** Expandir o @theme do index.css com ~30 tokens semanticos faltantes identificados durante o redesign A1 (Fase 0 do plano Penpot-first). Os tokens existentes (M01) cobrem cores brand e hierarquia de texto, mas faltam: aliases semanticos de contexto (bg-page, bg-sidebar, bg-card), variantes de accent (hover, border), backgrounds de status (6 cores), tokens de topbar (6 cores), spacing semantico (7 niveis), typography scale (8 niveis) e radius extras (3 tokens).
- **rastreia_para:** DOC-UX-013-M01, DOC-UX-011-M04, Ux-Paginas.md, stitch HTMLs

---

## Detalhamento

### 2.1 Cores Semanticas — Adicionar tokens de contexto e accent

Inserir no `@theme` do `index.css` apos o bloco A1 Text Hierarchy:

```css
@theme {
  /* Accent Variants */
  --color-accent-hover: #E07B28;
  --color-accent-border: #F5C89A;

  /* Semantic Context Aliases (referencia tokens a1-*) */
  --color-bg-page: #F5F5F3;       /* alias --color-a1-bg */
  --color-bg-sidebar: #FFFFFF;
  --color-bg-card: #FFFFFF;

  /* Status Backgrounds (light variants para badges/alerts) */
  --color-status-success-bg: #DCFCE7;
  --color-status-warning-bg: #FEF3C7;
  --color-status-error-bg: #FEE2E2;
  --color-status-info-bg: #DBEAFE;
  --color-status-neutral-bg: #F1F5F9;
  --color-status-purple-bg: #F3E8FF;

  /* Topbar (dark header A1 — ref DOC-UX-011-M04) */
  --color-topbar-bg: #111111;
  --color-topbar-separator: #2A2A2A;
  --color-topbar-text: #FFFFFF;
  --color-topbar-text-muted: #999999;
  --color-topbar-badge-bg: #F58C32;
  --color-topbar-badge-border: #E07B28;
}
```

**Regra:** Paginas que implementam o layout A1 DEVEM usar tokens de contexto (`bg-page`, `bg-sidebar`, etc.) ao inves de referenciar `a1-bg` diretamente. Isso permite futura troca de tema sem alterar paginas.

### 2.3 Espacamento — Adicionar spacing semantico

Inserir no `@theme` apos os tokens existentes de spacing (§2.3):

```css
@theme {
  /* Semantic Spacing */
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 2.5rem;   /* 40px */
  --space-3xl: 3rem;     /* 48px */
}
```

**Regra:** Os `--space-*` sao aliases semanticos dos `--spacing-*` numericos existentes. Componentes shared/ui DEVEM preferir os nomes semanticos. Os tokens numericos (`--spacing-1` a `--spacing-16`) permanecem validos para uso granular.

### 2.2 Tipografia — Adicionar type scale tokens

Inserir no `@theme` apos a tabela de escala tipografica A1 (§2.2):

```css
@theme {
  /* Type Scale A1 (font-size / line-height) */
  --type-display: 1.75rem;    /* 28px — titulos hero, branding */
  --type-title: 1.25rem;      /* 20px — titulos de pagina */
  --type-subtitle: 1rem;      /* 16px — subtitulos */
  --type-body: 0.8125rem;     /* 13px — texto padrao, tabelas */
  --type-label: 0.6875rem;    /* 11px — labels de formulario CAPS */
  --type-caption: 0.6875rem;  /* 11px — datas, metadados */
  --type-section: 0.5625rem;  /* 9px — headers de sidebar CAPS */
  --type-micro: 0.625rem;     /* 10px — sub-labels, tenant info */
}
```

**Regra:** Os `--type-*` definem apenas font-size. Line-height e font-weight devem ser aplicados via classes Tailwind (`leading-*`, `font-bold`, etc.) conforme a tabela da Escala Tipografica A1 ja documentada em DOC-UX-013 §2.2.

### 2.4 Radii — Adicionar tokens extras

Inserir no bloco de Border Radius existente (§2.4):

```css
@theme {
  /* Additional Radii */
  --radius-xs: 0.125rem;   /* 2px — inputs menores, tags */
  --radius-pill: 9999px;   /* alias de --radius-full para badges/pills */
  --radius-circle: 50%;    /* avatares, icones circulares */
}
```

---

## Impacto nos Pilares

- **Pilares afetados:** UX (DOC-UX-011 AppShell — tokens topbar ja formalizados em M04, sem nova acao)
- **Acao requerida:** Nenhuma cascata necessaria. Os tokens sao aditivos e nao alteram tokens existentes. Apos merge, executar `/penpot sync-tokens` para atualizar o Penpot.
- **Codigo:** `apps/web/src/index.css` deve receber todos os novos tokens no bloco `@theme`. Implementacao apos merge.

---

## Resolucao do Merge

> **Merged por:** merge-amendment em 2026-03-27
> **Versao base apos merge:** 1.3.0
> **Alteracoes aplicadas:** §2.1 accent variants + context aliases + status-bg + topbar tokens, §2.2 type scale tokens, §2.3 spacing semantico, §2.4 radii extras (xs, pill, circle)
