> **ARQUIVO GERIDO POR AUTOMACAO.**
> - Emenda sobre documento normativo/requisito em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-UX-013-M04

- **Documento base:** [DOC-UX-013](../../DOC-UX-013__Design_System_e_Tokens_Visuais.md)
- **estado_item:** MERGED
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-27
- **owner:** produto + UX
- **Motivacao:** Adicionar 5 componentes de apresentacao de dados ao shared/ui. Os stitch HTMLs mostram StatusBadge, Pagination, EmptyState, Tag e IconButton usados em praticamente todas as paginas de listagem (20+ paginas). Sem esses componentes compartilhados, cada modulo implementa variantes inconsistentes de badges de status e paginacao.
- **rastreia_para:** DOC-UX-013-M02, screen specs 05, 07, 08, 14, 17, 24, 28, 32, 36

---

## Detalhamento

### 4.2 Estrutura — Adicionar componentes Data

Adicionar ao diagrama de `src/shared/ui/`:

```
ui/
├── status-badge.tsx    ← StatusBadge (badge com cor por status semantico)
├── pagination.tsx      ← Pagination (navegacao de paginas)
├── empty-state.tsx     ← EmptyState (placeholder quando lista vazia)
├── tag.tsx             ← Tag (label removivel para filtros ativos)
└── icon-button.tsx     ← IconButton (botao apenas icone com tooltip)
```

### 4.4 Componentes Obrigatorios — Novos componentes Data

#### StatusBadge

Badge semantico com cor por status. Extensao do Badge existente com mapeamento de cores automatico:

```tsx
type StatusType = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'purple';

interface StatusBadgeProps {
  status: StatusType;
  children: React.ReactNode;
  className?: string;
}
```

- **Variantes via cva:** `status` mapeia para pares bg/text dos tokens `--color-status-*-bg`:
  - `success` → `bg-status-success-bg text-success-600`
  - `warning` → `bg-status-warning-bg text-warning-600`
  - `error` → `bg-status-error-bg text-danger-600`
  - `info` → `bg-status-info-bg text-primary-600`
  - `neutral` → `bg-status-neutral-bg text-neutral-600`
  - `purple` → `bg-status-purple-bg text-purple-600`
- **Visual:** `rounded-full px-2.5 py-0.5 text-type-caption font-medium`

#### Pagination

Navegacao de paginas para listagens:

```tsx
interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}
```

- **Visual:** Botoes prev/next com numero de pagina central. Botoes usam `IconButton` para setas. Pagina ativa em `bg-a1-accent text-white rounded-md`.
- **Tokens:** `--color-a1-accent`, `--color-a1-border`, `--color-a1-text-auxiliary`

#### EmptyState

Placeholder exibido quando uma listagem nao tem dados:

```tsx
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode; // Ex: <Button>Criar primeiro</Button>
  className?: string;
}
```

- **Visual:** Container centralizado com `py-space-3xl text-center`. Icone em `text-a1-text-hint size-12 mx-auto mb-space-md`, titulo em `text-type-title font-bold text-a1-text-primary`, descricao em `text-type-body text-a1-text-auxiliary mt-space-xs`

#### Tag

Label removivel para filtros ativos:

```tsx
interface TagProps {
  children: React.ReactNode;
  onRemove?: () => void;
  variant?: 'default' | 'accent';
  className?: string;
}
```

- **Visual:** `inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-type-caption font-medium bg-status-neutral-bg text-a1-text-secondary`
- **Variante accent:** `bg-a1-active-bg text-a1-accent`
- **Remove:** Icone X (lucide) `size-3` com hover

#### IconButton

Botao contendo apenas um icone, com tooltip integrado:

```tsx
interface IconButtonProps extends React.ComponentProps<'button'> {
  icon: React.ReactNode;
  label: string; // aria-label + tooltip text
  size?: 'xs' | 'sm' | 'default';
  variant?: 'ghost' | 'outline' | 'default';
}
```

- **Visual:** Reutiliza `buttonVariants` do Button existente com sizes `icon-xs`, `icon-sm`, `icon`. Envolve em `<Tooltip>` automaticamente usando o `label`.
- **Acessibilidade:** `aria-label={label}` obrigatorio

---

## Impacto nos Pilares

- **Pilares afetados:** Nenhum (aditivo, componentes novos)
- **Acao requerida:** Nenhuma cascata. Apos merge e codegen, atualizar `shared/ui/index.ts` com novos exports.

---

## Resolucao do Merge

> **Merged por:** merge-amendment em 2026-03-27
> **Versao base apos merge:** 1.6.0 (batch com M03, M05)
> **Alteracoes aplicadas:** §4.2 estrutura + §4.4 tabela componentes customizados ECF (StatusBadge, Pagination, EmptyState, Tag, IconButton)
