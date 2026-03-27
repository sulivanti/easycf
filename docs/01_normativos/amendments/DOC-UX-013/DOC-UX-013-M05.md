> **ARQUIVO GERIDO POR AUTOMACAO.**
> - Emenda sobre documento normativo/requisito em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-UX-013-M05

- **Documento base:** [DOC-UX-013](../../DOC-UX-013__Design_System_e_Tokens_Visuais.md)
- **estado_item:** MERGED
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-27
- **owner:** produto + UX
- **Motivacao:** Adicionar 2 componentes de feedback/layout ao shared/ui: ConfirmationModal e PageHeader. O ConfirmationModal e necessario em todas as acoes destrutivas (delete, revoke, cancel) — atualmente cada modulo implementa seu proprio dialog de confirmacao. O PageHeader padroniza o cabecalho de pagina (titulo + breadcrumb + acoes) presente em todas as 43 paginas.
- **rastreia_para:** DOC-UX-013-M02, DOC-UX-011-M03 (LogoutConfirmDialog), screen specs 01-42

---

## Detalhamento

### 4.2 Estrutura — Adicionar componentes Feedback/Layout

Adicionar ao diagrama de `src/shared/ui/`:

```
ui/
├── confirmation-modal.tsx  ← ConfirmationModal (dialog de confirmacao pre-configurado)
└── page-header.tsx         ← PageHeader (cabecalho padrao de pagina)
```

### 4.4 Componentes Obrigatorios — Novos componentes Feedback/Layout

#### ConfirmationModal

Dialog pre-configurado para acoes que requerem confirmacao (delete, revoke, etc.):

```tsx
interface ConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;   // default: "Confirmar"
  cancelLabel?: string;    // default: "Cancelar"
  onConfirm: () => void;
  variant?: 'default' | 'destructive';
  isLoading?: boolean;
}
```

- **Composicao:** Reutiliza `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter` do dialog.tsx existente + `Button` com variantes.
- **Visual variant=destructive:** Icone AlertTriangle (lucide) em `text-danger-500`, botao confirmar em `variant="destructive"`
- **Visual variant=default:** Icone HelpCircle (lucide) em `text-primary-500`, botao confirmar em `variant="default"`
- **Regra:** Toda acao destrutiva (DELETE, revoke, cancel) DEVE usar `ConfirmationModal` com `variant="destructive"`. Ref: DOC-UX-011-M03 LogoutConfirmDialog como caso especifico.

#### PageHeader

Cabecalho padrao de pagina com titulo, breadcrumb e area de acoes:

```tsx
interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  actions?: React.ReactNode; // Botoes de acao (ex: <Button>Novo</Button>)
  className?: string;
}
```

- **Visual:** Container `flex items-start justify-between mb-space-lg`
  - Lado esquerdo: breadcrumbs em `text-type-caption text-a1-text-hint` com separadores `/`, titulo em `font-display text-type-title font-bold text-a1-text-primary`, descricao em `text-type-body text-a1-text-auxiliary mt-space-xs`
  - Lado direito: `flex items-center gap-space-sm` para botoes de acao
- **Tokens:** `--type-title`, `--type-caption`, `--type-body`, `--space-lg`, `--space-sm`, `--space-xs`
- **Regra:** Toda pagina DEVE usar `PageHeader` como primeiro elemento do conteudo principal. Titulos hardcoded (`<h1>`, `<h2>`) sem PageHeader sao PROIBIDOS.

---

## Impacto nos Pilares

- **Pilares afetados:** UX (DOC-UX-011 AppShell — PageHeader integra com layout de conteudo)
- **Acao requerida:** Informativa apenas. O PageHeader vive dentro da area de conteudo do AppShell, nao altera o shell em si. Sem cascata necessaria.

---

## Resolucao do Merge

> **Merged por:** merge-amendment em 2026-03-27
> **Versao base apos merge:** 1.6.0 (batch com M03, M04)
> **Alteracoes aplicadas:** §4.2 estrutura + §4.4 tabela componentes customizados ECF (ConfirmationModal, PageHeader) + regra obrigatoriedade
