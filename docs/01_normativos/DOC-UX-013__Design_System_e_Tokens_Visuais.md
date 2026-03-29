# DOC-UX-013 — Design System e Tokens Visuais

- **id:** DOC-UX-013
- **version:** 1.7.0
- **status:** ACTIVE
- **data_ultima_revisao:** 2026-03-27
- **owner:** produto + arquitetura + UX
- **scope:** global (design system, tokens visuais, styling)

---

## 1. Objetivo

Este documento estabelece o **Design System** obrigatório para todas as interfaces frontend geradas pelo EasyCodeFramework. Define tokens visuais (cores, tipografia, espaçamento), a estratégia de styling via Tailwind CSS v4, a biblioteca de componentes compartilhados (`src/shared/ui/`), e o suporte a temas dark/light.

### 1.1 Motivação

Ciclos anteriores de codegen produziram frontend com:
- Inline styles hardcoded (sem design tokens)
- Abordagens de styling misturadas (inline, CSS classes órfãs, Tailwind sem config)
- `src/shared/` vazio — cada módulo recriava Button, Input, Badge, Modal, Table
- Sem tipografia sistematizada, sem animações, sem dark mode funcional

### 1.2 Escopo

Aplica-se a **todo código frontend** gerado por `AGN-COD-WEB` e pelo `/app-scaffold`. Módulos de negócio (`apps/web/src/modules/`) DEVEM consumir os tokens e componentes aqui definidos — nunca recriar.

---

## 2. Design Tokens

Os design tokens são variáveis CSS definidas no bloco `@theme` do Tailwind CSS v4. Todos os valores visuais DEVEM ser referenciados via tokens — nunca hardcoded.

### 2.1 Cores Semânticas

Cores definidas como CSS custom properties com nomenclatura `--color-{semantic}-{shade}`.

> **Valores reais do projeto:** Os hex codes específicos (cores primárias, hierarquia de texto, status badges, bordas) estão definidos em [`SPEC-THEME-001`](../03_especificacoes/ux/SPEC-THEME-001__Tema_Visual_Projeto.md). Este documento define apenas a **estrutura de tokens** e as **regras de naming**.

**Estrutura obrigatória de tokens:**

```css
@theme {
  /* Primary scale: --color-primary-{50..950} */
  /* Neutral scale: --color-neutral-{50..950} */
  /* Semantic: --color-success-{500,600}, --color-warning-{500,600}, --color-danger-{500,600}, --color-info-{500,600} */
  /* Brand: --color-a1-accent (logo only), --color-a1-dark */
  /* Text Hierarchy: --color-a1-text-{primary,secondary,tertiary,auxiliary,hint,placeholder} */
  /* Context Aliases: --color-bg-page, --color-bg-sidebar, --color-bg-card */
  /* Sidebar: --color-sidebar-active-bg, --color-sidebar-active-text */
  /* Layout: --topbar-height, --sidebar-expanded */
  /* Status Backgrounds: --color-status-{success,warning,error,info,neutral,purple}-bg */
  /* Topbar: --color-topbar-bg, --color-topbar-separator, --color-topbar-text, --color-topbar-text-muted, --color-topbar-badge-bg */
}
```

**Regra:** Módulos NÃO DEVEM definir cores adicionais fora do `@theme`. Se novas cores forem necessárias, devem ser adicionadas via amendment ao design system.

**Regra:** Páginas que implementam o layout A1 DEVEM usar tokens de contexto (`bg-page`, `bg-sidebar`, etc.) ao invés de referenciar `a1-bg` diretamente. Isso permite futura troca de tema sem alterar páginas.

**Regra:** Os tokens `--color-a1-accent` e `--color-a1-dark` são **exclusivos** para o logo A1 e o painel de branding do login. Elementos interativos (botões, toggles, paginação, focus rings, sidebar active) DEVEM usar `--color-primary-600`. Valores concretos em SPEC-THEME-001.

### 2.2 Tipografia

| Token | Valor | Uso |
|-------|-------|-----|
| `--font-sans` | `'Inter', system-ui, sans-serif` | Corpo de texto, UI |
| `--font-mono` | `'JetBrains Mono', monospace` | Código, IDs, logs |
| `--text-xs` | `0.75rem / 1rem` | Badges, captions |
| `--text-sm` | `0.875rem / 1.25rem` | Labels, secondary text |
| `--text-base` | `1rem / 1.5rem` | Body text padrão |
| `--text-lg` | `1.125rem / 1.75rem` | Subtítulos |
| `--text-xl` | `1.25rem / 1.75rem` | Títulos de seção |
| `--text-2xl` | `1.5rem / 2rem` | Títulos de página |
| `--text-3xl` | `1.875rem / 2.25rem` | Títulos principais |
| `--text-4xl` | `2.25rem / 2.5rem` | Hero text |

**Font loading:** Google Fonts CDN no `index.html` (Inter + Plus Jakarta Sans + JetBrains Mono). Para produção, recomenda-se self-hosting via `@fontsource`.

> **Regra de uso:** `--font-display` (Plus Jakarta Sans) DEVE ser usado para títulos, labels e texto de UI no contexto A1. `--font-sans` (Inter) permanece como fallback para corpo de texto genérico.

#### Escala Tipográfica A1

| Nível | Weight | Size | Uso |
|-------|--------|------|-----|
| Display | 800 (extrabold) | 28px / 34px | Títulos hero, branding |
| Title | 700 (bold) | 20px / 24px | Títulos de página |
| Label | 600 (semibold) | 11px / 14px CAPS | Labels de formulário, section headers |
| Section | 700 (bold) | 9px / 12px CAPS tracking-[1.4px] | Headers de sidebar |
| Body | 400 (normal) | 13px / 16px | Texto padrão, tabelas |
| Caption | 400 (normal) | 11px / 14px | Datas, metadados, hints |
| Micro | 400 (normal) | 10px / 12px | Sub-labels, tenant info |

#### Type Scale Tokens

```css
@theme {
  /* Type Scale A1 (font-size) */
  --type-display: 1.75rem;    /* 28px — títulos hero, branding */
  --type-title: 1.25rem;      /* 20px — títulos de página */
  --type-subtitle: 1rem;      /* 16px — subtítulos */
  --type-body: 0.8125rem;     /* 13px — texto padrão, tabelas */
  --type-label: 0.6875rem;    /* 11px — labels de formulário CAPS */
  --type-caption: 0.6875rem;  /* 11px — datas, metadados */
  --type-section: 0.5625rem;  /* 9px — headers de sidebar CAPS */
  --type-micro: 0.625rem;     /* 10px — sub-labels, tenant info */
}
```

**Regra:** Os `--type-*` definem apenas font-size. Line-height e font-weight devem ser aplicados via classes Tailwind (`leading-*`, `font-bold`, etc.) conforme a tabela da Escala Tipográfica A1 acima.

### 2.3 Espaçamento

Grid de 4px. Escala:

| Token | Valor |
|-------|-------|
| `--spacing-0` | `0` |
| `--spacing-1` | `0.25rem` (4px) |
| `--spacing-2` | `0.5rem` (8px) |
| `--spacing-3` | `0.75rem` (12px) |
| `--spacing-4` | `1rem` (16px) |
| `--spacing-5` | `1.25rem` (20px) |
| `--spacing-6` | `1.5rem` (24px) |
| `--spacing-8` | `2rem` (32px) |
| `--spacing-10` | `2.5rem` (40px) |
| `--spacing-12` | `3rem` (48px) |
| `--spacing-16` | `4rem` (64px) |

#### Spacing Semântico

Aliases semânticos dos `--spacing-*` numéricos para uso em componentes shared/ui:

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

**Regra:** Componentes em `shared/ui/` DEVEM preferir os nomes semânticos (`--space-*`). Os tokens numéricos (`--spacing-N`) permanecem válidos para uso granular em layouts de página.

### 2.4 Radii, Shadows e Timing

```css
@theme {
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
  --radius-2xl: 1rem;
  --radius-full: 9999px;
  --radius-xs: 0.125rem;   /* 2px — inputs menores, tags */
  --radius-pill: 9999px;   /* alias de --radius-full para badges/pills */
  --radius-circle: 50%;    /* avatares, ícones circulares */

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

  /* Animation Timing */
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-in: cubic-bezier(0.4, 0, 1, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

---

## 3. Tailwind CSS v4

### 3.1 Framework de Styling Mandatório

Tailwind CSS v4 é o **único framework de styling autorizado** para o frontend. Todo styling de layout, cor, tipografia e espaçamento DEVE usar classes utilitárias do Tailwind.

### 3.2 Configuração Vite

Tailwind v4 usa o plugin Vite nativo — **sem** `postcss.config.js` nem `tailwind.config.js`:

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

### 3.3 CSS Entry Point

O arquivo `src/index.css` DEVE conter:

```css
@import "tailwindcss";

@theme {
  /* Todos os tokens da §2 são definidos aqui */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --color-primary-50: #eff6ff;
  /* ... demais tokens conforme §2.1, §2.4 ... */
}
```

### 3.4 Proibição de Inline Styles

**MUST NOT** usar `style={{}}` para:
- Layout (margin, padding, display, flex, grid)
- Cores (background, color, border-color)
- Tipografia (font-size, font-weight, line-height)
- Espaçamento e dimensões (width, height, gap)

**Exceções permitidas** (inline style aceitável):
- Valores dinâmicos calculados em runtime (ex: `style={{ width: `${progress}%` }}`)
- Posicionamento absoluto com coordenadas dinâmicas
- SVGs inline com `viewBox`, `fill`, `stroke` e propriedades de renderização gráfica quando necessário para compatibilidade cross-browser (ex: `flexShrink: '0'`)

---

## 4. Shared Component Library (shadcn/ui)

A biblioteca de componentes compartilhados é baseada em **shadcn/ui** — um gerador de componentes que copia código-fonte para dentro do projeto, garantindo ownership total e customização sem lock-in.

### 4.1 Stack de Componentes

| Camada | Pacote | Papel |
|--------|--------|-------|
| Primitivos headless | `@radix-ui/*` | Acessibilidade WAI-ARIA (focus trap, keyboard nav, aria-*) |
| Variants tipadas | `class-variance-authority` (cva) | Define variants (size, variant) com type-safety |
| Merge de classes | `tailwind-merge` + `clsx` | Resolve conflitos de classes Tailwind e composição condicional |
| Styling | Tailwind CSS v4 | Classes utilitárias (§3) |
| Animações | `motion` | Transições de Modal, Drawer, Toast (DOC-PADRAO-002 §3.5) |

### 4.2 Estrutura

Todos os componentes compartilhados residem em `apps/web/src/shared/ui/`, gerados via `npx shadcn@latest add`:

```
src/shared/
├── lib/
│   └── utils.ts          ← cn() helper (clsx + tailwind-merge)
└── ui/
    ├── index.ts           ← barrel export
    ├── button.tsx          ← shadcn Button (cva variants)
    ├── input.tsx           ← shadcn Input (label + error)
    ├── badge.tsx           ← shadcn Badge
    ├── dialog.tsx          ← shadcn Dialog (Radix Dialog → Modal)
    ├── drawer.tsx          ← shadcn Drawer (vaul)
    ├── table.tsx           ← shadcn Table
    ├── skeleton.tsx        ← shadcn Skeleton (animate-pulse)
    ├── sonner.tsx          ← shadcn Sonner (toast system)
    ├── spinner.tsx         ← Spinner customizado (animate-spin)
    ├── form-field.tsx      ← FormField (label + input + error + hint)
    ├── search-bar.tsx      ← SearchBar (input com ícone busca + clear)
    ├── filter-bar.tsx      ← FilterBar (container horizontal de filtros)
    ├── select.tsx          ← Select (dropdown nativo estilizado, cva)
    ├── toggle.tsx          ← Toggle (switch on/off, a11y)
    ├── status-badge.tsx    ← StatusBadge (badge com cor por status semântico, cva)
    ├── pagination.tsx      ← Pagination (navegação de páginas)
    ├── empty-state.tsx     ← EmptyState (placeholder lista vazia)
    ├── tag.tsx             ← Tag (label removível para filtros ativos)
    ├── icon-button.tsx     ← IconButton (botão apenas ícone com tooltip)
    ├── confirmation-modal.tsx ← ConfirmationModal (dialog confirmação pré-configurado)
    └── page-header.tsx     ← PageHeader (cabeçalho padrão de página)
```

> **Nota de naming:** shadcn usa `dialog.tsx` para modais e `sonner.tsx` para toasts. O barrel `index.ts` re-exporta com aliases se necessário (ex: `export { Dialog as Modal } from './dialog'`).

### 4.3 Utilitário `cn()`

Toda composição de classes DEVE usar o helper `cn()`:

```typescript
// src/shared/lib/utils.ts
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Uso em componentes:

```tsx
<button className={cn(buttonVariants({ variant, size }), className)}>
```

### 4.4 Componentes Obrigatórios

O scaffold DEVE instalar os seguintes componentes via shadcn CLI:

| Componente shadcn | Comando | Primitivo Radix | Uso no ECF |
|-------------------|---------|-----------------|------------|
| `button` | `npx shadcn@latest add button` | — | Ações primárias, secundárias, ghost, destructive |
| `input` | `npx shadcn@latest add input` | — | Formulários com label e validação |
| `badge` | `npx shadcn@latest add badge` | — | Status tags, contadores |
| `dialog` | `npx shadcn@latest add dialog` | `@radix-ui/react-dialog` | Modais com focus trap e Escape |
| `drawer` | `npx shadcn@latest add drawer` | `vaul` | Painéis laterais slide-in |
| `table` | `npx shadcn@latest add table` | — | Listagens de dados |
| `skeleton` | `npx shadcn@latest add skeleton` | — | Loading placeholders |
| `sonner` | `npx shadcn@latest add sonner` | `sonner` | Toast notifications |
| `dropdown-menu` | `npx shadcn@latest add dropdown-menu` | `@radix-ui/react-dropdown-menu` | Widget de Perfil (DOC-UX-011 §6) |
| `tooltip` | `npx shadcn@latest add tooltip` | `@radix-ui/react-tooltip` | Dicas contextuais |
| `label` | `npx shadcn@latest add label` | `@radix-ui/react-label` | Labels acessíveis para inputs |

#### Componentes customizados ECF (não shadcn)

| Componente | Arquivo | Uso no ECF |
|-----------|---------|------------|
| `FormField` | `form-field.tsx` | Wrapper label + input + error + hint para formulários |
| `SearchBar` | `search-bar.tsx` | Input de busca com ícone e clear |
| `FilterBar` | `filter-bar.tsx` | Container horizontal de filtros |
| `Select` | `select.tsx` | Dropdown nativo estilizado (cva: size) |
| `Toggle` | `toggle.tsx` | Switch on/off (`role="switch"`, keyboard a11y) |
| `StatusBadge` | `status-badge.tsx` | Badge semântico com cor por status (cva: success/warning/error/info/neutral/purple) |
| `Pagination` | `pagination.tsx` | Navegação de páginas para listagens |
| `EmptyState` | `empty-state.tsx` | Placeholder quando lista vazia |
| `Tag` | `tag.tsx` | Label removível para filtros ativos |
| `IconButton` | `icon-button.tsx` | Botão apenas ícone com tooltip integrado |
| `ConfirmationModal` | `confirmation-modal.tsx` | Dialog pré-configurado para ações destrutivas |
| `PageHeader` | `page-header.tsx` | Cabeçalho padrão (título + breadcrumb + ações) |

> **Regra:** Toda ação destrutiva (DELETE, revoke, cancel) DEVE usar `ConfirmationModal`. Toda página DEVE usar `PageHeader` como primeiro elemento do conteúdo principal.

#### Customizações obrigatórias pós-geração

Os componentes shadcn são gerados com defaults. O scaffold DEVE aplicar as seguintes customizações:

1. **Button** — Adicionar prop `isLoading?: boolean` que exibe `<Spinner />` e seta `aria-busy="true"` + `disabled`
2. **Dialog** — Integrar `motion` para animação scale-up + backdrop fade (substituindo a animação CSS padrão do Radix)
3. **Drawer** — Integrar `motion` para slide-in animado
4. **Sonner** — Configurar variantes visuais (`success`, `error`, `warning`, `info`) e exibição de `correlationId` (RFC 9457)
5. **Spinner** — Componente customizado (não vem do shadcn): `role="status"`, `aria-label="Carregando"`, `animate-spin`

### 4.5 Inicialização shadcn no Scaffold

O `/app-scaffold` DEVE executar a inicialização shadcn com a seguinte configuração:

```bash
npx shadcn@latest init --defaults --css src/index.css --components src/shared/ui --utils src/shared/lib/utils.ts
```

Parâmetros relevantes:
- `--css src/index.css` — aponta para o CSS entry point com `@theme` (§3.3)
- `--components src/shared/ui` — destino dos componentes (não o default `src/components/ui`)
- `--utils src/shared/lib/utils.ts` — localização do helper `cn()`

Após init, instalar os componentes:

```bash
npx shadcn@latest add button input badge dialog drawer table skeleton sonner dropdown-menu tooltip label
```

### 4.6 Regra de Ownership

- Componentes em `src/shared/ui/` são criados **apenas pelo scaffold** (`/app-scaffold`) via shadcn CLI
- `AGN-COD-WEB` DEVE importar de `@shared/ui/` — **nunca recriar** componentes equivalentes dentro de `src/modules/`
- O código gerado pelo shadcn é **editável** — customizações de design (cores, radii, padding) são feitas diretamente no arquivo
- Novos componentes compartilhados requerem amendment a este documento e `npx shadcn@latest add {component}` no scaffold

---

## 5. Dark/Light Theme

### 5.1 Estratégia

O tema utiliza a estratégia `class` no elemento `<html>`:

```html
<!-- Light (default) -->
<html lang="pt-BR">

<!-- Dark -->
<html lang="pt-BR" class="dark">
```

### 5.2 Tailwind Dark Variant

Componentes DEVEM usar a variant `dark:` do Tailwind para estilos alternativos:

```tsx
<div className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100">
```

### 5.3 Persistência

- A preferência de tema DEVE ser armazenada em `localStorage` sob a chave `theme`
- Valores aceitos: `'light'` | `'dark'` | `'system'`
- Na inicialização, aplicar `class="dark"` ao `<html>` se:
  - `theme === 'dark'`, ou
  - `theme === 'system'` e `prefers-color-scheme: dark`

### 5.4 Toggle Component

O ThemeToggle DEVE:
- Exibir ícone contextual (sol/lua)
- Atualizar `localStorage` e `<html>` class simultaneamente
- Estar posicionado no Header do Application Shell (DOC-UX-011)

---

## 6. Anti-Patterns (PROIBIDO)

| Anti-Pattern | Exemplo | Correção |
|-------------|---------|----------|
| Hex/RGB hardcoded | `color: '#3b82f6'` | `className="text-primary-500"` |
| Inline styles para layout/cor/tipo | `style={{ padding: '16px' }}` | `className="p-4"` |
| Componentes duplicados por módulo | `modules/users/Button.tsx` | `import { Button } from '@shared/ui'` |
| CSS class sem arquivo | `className="my-custom-btn"` sem CSS | Usar apenas classes Tailwind |
| Navegação via `window.location.href` | `window.location.href = '/users'` | `<Link to="/users">` ou `router.navigate({ to: '/users' })` |
| `tailwind.config.js` (v3 syntax) | Arquivo de config v3 | Usar `@theme` block no CSS (v4) |
| `postcss.config.js` para Tailwind | Config PostCSS | Usar `@tailwindcss/vite` plugin |
| Implementar acessibilidade manualmente | Focus trap, aria-* customizado | Usar primitivos Radix UI via shadcn |
| Concatenação manual de classes | `className={\`btn \${active && 'active'}\`}` | `className={cn(buttonVariants(), className)}` com `cn()` |

---

## 7. Critérios de Aceite para Codegen

- **[CA-01]** Todo styling de layout, cor e tipografia usa exclusivamente classes Tailwind. Zero `style={{}}` para esses propósitos.
- **[CA-02]** Componentes de UI (Button, Input, Badge, Dialog, Drawer, Table, Skeleton, Sonner, Spinner) são importados de `@shared/ui/` (gerados via shadcn/ui) — nenhum duplicado em `src/modules/`.
- **[CA-03]** O arquivo `src/index.css` contém `@import "tailwindcss"` e bloco `@theme` com todos os tokens da §2.
- **[CA-04]** Dark mode funcional: `class="dark"` no `<html>`, variant `dark:` nos componentes, persistência em `localStorage`.
- **[CA-05]** Navegação in-app usa exclusivamente `<Link>` ou `router.navigate()` do TanStack Router. Zero `window.location.href`.
- **[CA-06]** Composição de classes usa exclusivamente `cn()` (clsx + tailwind-merge). Zero concatenação manual de strings.

---

## CHANGELOG

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.8.0 | 2026-03-29 | Refatoração: valores hardcoded removidos da §2.1 — agora referencia SPEC-THEME-001 para valores concretos. DOC-UX-013 mantém apenas regras estruturais e naming conventions. |
| 1.7.0 | 2026-03-27 | Amendment M06: Unificação de tokens ao stitch modelagem — accent interativo de laranja (#F58C32) para azul (#2563eb), topbar de dark (#111) para white (#FFF), superfícies de warm beige para cool slate, texto de warm grays para cool grays. Laranja reservado para logo/branding. Novos tokens: sidebar-active-bg/text, topbar-height, sidebar-collapsed/expanded. |
| 1.6.0 | 2026-03-27 | Amendments M03+M04+M05: 12 novos componentes shared/ui — Form (FormField, SearchBar, FilterBar, Select, Toggle), Data (StatusBadge, Pagination, EmptyState, Tag, IconButton), Feedback (ConfirmationModal, PageHeader). |
| 1.3.0 | 2026-03-27 | Amendment M02: ~35 tokens semânticos — accent variants, context aliases (bg-page/sidebar/card), 6x status-bg, 6x topbar, 7x spacing semântico, 8x type scale, 3x radii extras. Ref: stitch HTMLs, DOC-UX-011-M04. |
| 1.2.0 | 2026-03-26 | Amendment M01: tokens A1 (§2.1 cores brand + text hierarchy, §2.2 escala tipográfica A1 + regra font-display, §3.4 exceção SVG inline). Ref: Ux-Paginas.md (Paper). |
| 1.1.0 | 2026-03-24 | §4 reescrita para shadcn/ui como base da component library (Radix UI, cva, tailwind-merge, cn()), anti-patterns e CA-06 adicionados |
| 1.0.0 | 2026-03-24 | Versão inicial — design tokens, Tailwind v4, shared components, dark/light theme |
