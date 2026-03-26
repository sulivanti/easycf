> **ARQUIVO GERIDO POR AUTOMACAO.**
> - Emenda sobre documento normativo/requisito em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-UX-013-M01

- **Documento base:** [DOC-UX-013](../../DOC-UX-013__Design_System_e_Tokens_Visuais.md)
- **estado_item:** MERGED
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-26
- **owner:** produto + UX
- **Motivacao:** Adicionar design tokens A1 (identidade visual Grupo A1) ao design system. Os tokens foram exportados do Paper (Ux-Paginas.md) e definem paleta reduzida, hierarquia de texto e fonte display que devem ser formalizados no @theme do index.css.
- **rastreia_para:** Ux-Paginas.md (Paper export)

---

## Detalhamento

### 2.1 Cores Semanticas — Adicionar bloco A1

Inserir no `@theme` do `index.css` (apos os tokens semanticos existentes) o seguinte bloco de cores A1:

```css
@theme {
  /* A1 Brand */
  --color-a1-accent: #F58C32;
  --color-a1-dark: #111111;
  --color-a1-bg: #F5F5F3;
  --color-a1-bg-alt: #FAFAF8;
  --color-a1-border: #E8E8E6;
  --color-a1-border-light: #F0F0EE;
  --color-a1-active-bg: #FFF5EC;

  /* A1 Text Hierarchy */
  --color-a1-text-primary: #111111;
  --color-a1-text-secondary: #333333;
  --color-a1-text-tertiary: #555555;
  --color-a1-text-auxiliary: #888888;
  --color-a1-text-hint: #AAAAAA;
  --color-a1-text-placeholder: #CCCCCC;
  --color-a1-text-muted-icon: #BBBBBB;
}
```

**Regra:** Modulos que implementam a identidade visual A1 DEVEM referenciar estes tokens via classes Tailwind (ex: `bg-a1-bg`, `text-a1-accent`, `border-a1-border`). Hardcoded hex values sao PROIBIDOS conforme anti-patterns existentes (DOC-UX-013 §6).

### 2.2 Tipografia — Confirmar --font-display

O token `--font-display` ja existe no index.css com valor `'Plus Jakarta Sans', system-ui, sans-serif`. **Nenhuma alteracao necessaria.**

Adicionar regra ao §2.2:

> **Regra de uso:** `--font-display` (Plus Jakarta Sans) DEVE ser usado para titulos, labels e texto de UI no contexto A1. `--font-sans` (Inter) permanece como fallback para corpo de texto generico.

### 2.3 Tipografia A1 — Escala de referencia

| Nivel | Weight | Size | Uso |
|-------|--------|------|-----|
| Display | 800 (extrabold) | 28px / 34px | Titulos hero, branding |
| Title | 700 (bold) | 20px / 24px | Titulos de pagina |
| Label | 600 (semibold) | 11px / 14px CAPS | Labels de formulario, section headers |
| Section | 700 (bold) | 9px / 12px CAPS tracking-[1.4px] | Headers de sidebar |
| Body | 400 (normal) | 13px / 16px | Texto padrao, tabelas |
| Caption | 400 (normal) | 11px / 14px | Datas, metadados, hints |
| Micro | 400 (normal) | 10px / 12px | Sub-labels, tenant info |

### 3.4 Proibicao de Inline Styles — Excecao SVG

Adicionar a §3.4 (Proibicao de Inline Styles):

> **Excecao adicional:** SVGs inline com `viewBox`, `fill`, `stroke` e propriedades de renderizacao grafica podem usar `style={{}}` quando necessario para compatibilidade cross-browser (ex: `flexShrink: '0'`).

---

## Impacto nos Pilares

- **Pilares afetados:** UX (DOC-UX-011 AppShell — precisa de amendment paralelo para definir visual A1 do shell)
- **Acao requerida:** DOC-UX-011 precisa de amendment M04 para definir topbar dark, sidebar branca, accent laranja. Criar em paralelo.
- **Codigo:** `apps/web/src/index.css` deve receber os novos tokens no bloco `@theme`. Implementacao apos merge.

---

## Resolucao do Merge

> **Merged por:** merge-amendment em 2026-03-26
> **Versao base apos merge:** 1.2.0
> **Alteracoes aplicadas:** §2.1 tokens A1 brand + text hierarchy, §2.2 escala tipografica + regra font-display, §3.4 excecao SVG inline
