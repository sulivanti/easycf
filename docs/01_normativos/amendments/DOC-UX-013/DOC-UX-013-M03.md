> **ARQUIVO GERIDO POR AUTOMACAO.**
> - Emenda sobre documento normativo/requisito em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-UX-013-M03

- **Documento base:** [DOC-UX-013](../../DOC-UX-013__Design_System_e_Tokens_Visuais.md)
- **estado_item:** MERGED
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-27
- **owner:** produto + UX
- **Motivacao:** Adicionar 5 componentes de formulario ao shared/ui para eliminar duplicacao nos modulos. Os stitch HTMLs e screen specs mostram FormField, SearchBar, FilterBar, Select e Toggle usados em 20+ paginas. Sem esses componentes compartilhados, cada modulo recria variantes inconsistentes.
- **rastreia_para:** DOC-UX-013-M02, screen specs 05-09, 19-23

---

## Detalhamento

### 4.2 Estrutura — Adicionar componentes Form

Adicionar ao diagrama de `src/shared/ui/`:

```
ui/
├── form-field.tsx      ← FormField (label + input + error + hint)
├── search-bar.tsx      ← SearchBar (input com icone busca + clear)
├── filter-bar.tsx      ← FilterBar (container horizontal de filtros)
├── select.tsx          ← Select (dropdown nativo estilizado)
└── toggle.tsx          ← Toggle (switch on/off)
```

### 4.4 Componentes Obrigatorios — Novos componentes Form

#### FormField

Wrapper que combina Label + Input + mensagem de erro + hint text:

```tsx
interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode; // Input, Select, etc.
}
```

- **Visual:** Label em `font-display text-type-label font-semibold uppercase tracking-wide text-a1-text-tertiary`, input abaixo, erro em `text-danger-500 text-type-caption`, hint em `text-a1-text-hint text-type-caption`
- **Pattern:** cva nao necessario (sem variantes visuais). Usa `cn()` para composicao.

#### SearchBar

Input de busca com icone e botao clear:

```tsx
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}
```

- **Visual:** `h-9 rounded-md border-a1-border bg-white pl-9 pr-8` com icone Search (lucide) a esquerda e X para clear
- **Tokens:** `--color-a1-border`, `--color-a1-text-placeholder`, `--color-a1-text-primary`

#### FilterBar

Container horizontal para agrupar filtros (SearchBar, Select, Buttons):

```tsx
interface FilterBarProps {
  children: React.ReactNode;
  className?: string;
}
```

- **Visual:** `flex items-center gap-space-sm flex-wrap` com `bg-white rounded-lg border-a1-border p-space-sm`
- **Responsivo:** Em mobile, wrap para coluna

#### Select

Dropdown nativo estilizado conforme design A1:

```tsx
interface SelectProps extends React.ComponentProps<'select'> {
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}
```

- **Visual:** Mesma altura e borda do Input (`h-9 rounded-md border-a1-border`), com chevron customizado via CSS
- **Variantes via cva:** `size: 'sm' | 'default'`

#### Toggle

Switch on/off baseado em `<button>`:

```tsx
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'default';
}
```

- **Visual:** Track `w-9 h-5 rounded-full` com thumb circular. Cores: off=`bg-neutral-300`, on=`bg-a1-accent`. Transicao `duration-fast`
- **Acessibilidade:** `role="switch"`, `aria-checked`, keyboard toggle via Space/Enter

---

## Impacto nos Pilares

- **Pilares afetados:** Nenhum (aditivo, componentes novos)
- **Acao requerida:** Nenhuma cascata. Apos merge e codegen, atualizar `shared/ui/index.ts` com novos exports.

---

## Resolucao do Merge

> **Merged por:** merge-amendment em 2026-03-27
> **Versao base apos merge:** 1.6.0 (batch com M04, M05)
> **Alteracoes aplicadas:** §4.2 estrutura + §4.4 tabela componentes customizados ECF (FormField, SearchBar, FilterBar, Select, Toggle)
