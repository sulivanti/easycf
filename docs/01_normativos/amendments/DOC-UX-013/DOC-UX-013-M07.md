> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento normativo/requisito em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-UX-013-M07

- **Documento base:** [DOC-UX-013](../../DOC-UX-013__Design_System_e_Tokens_Visuais.md)
- **estado_item:** MERGED
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-29
- **owner:** arquitetura + UX
- **Motivação:** Componentes shadcn/ui usam classes Tailwind (`bg-primary`, `text-muted-foreground`, `bg-popover`) que dependem de 17 variáveis CSS semânticas não existentes no Tailwind v4 vanilla. Sem esses tokens no `@theme`, todos os componentes de `shared/ui/` renderizam com cores transparentes/invisíveis. Corrigido em produção (commit c433339), mas faltava documentar no DOC-UX-013 e no `/app-scaffold`.
- **rastreia_para:** DOC-UX-013, app-scaffold skill, commit c433339

---

## Detalhamento

### 1. Nova §3.4 "Tokens Semânticos shadcn/ui" no DOC-UX-013

Inserir nova seção §3.4 (renumerando §3.4 existente para §3.5) documentando os 17 tokens semânticos obrigatórios:

| Token shadcn | Variável CSS | Valor A1 | Uso |
|---|---|---|---|
| `background` | `--color-background` | `#FFFFFF` | Fundo da página |
| `foreground` | `--color-foreground` | `#111111` | Texto principal |
| `primary` | `--color-primary` | `#2E86C1` | Botões primários, links, focus ring |
| `primary-foreground` | `--color-primary-foreground` | `#FFFFFF` | Texto sobre primary |
| `secondary` | `--color-secondary` | `#F5F5F3` | Botões secundários, backgrounds alternativos |
| `secondary-foreground` | `--color-secondary-foreground` | `#111111` | Texto sobre secondary |
| `destructive` | `--color-destructive` | `#E74C3C` | Ações destrutivas (delete, revoke) |
| `destructive-foreground` | `--color-destructive-foreground` | `#FFFFFF` | Texto sobre destructive |
| `muted` | `--color-muted` | `#F0F0EE` | Backgrounds suaves, disabled states |
| `muted-foreground` | `--color-muted-foreground` | `#888888` | Texto secundário, placeholders |
| `accent` | `--color-accent` | `#F5F5F3` | Hover states, seleção |
| `accent-foreground` | `--color-accent-foreground` | `#111111` | Texto sobre accent |
| `popover` | `--color-popover` | `#FFFFFF` | Fundo de popovers, dropdowns |
| `popover-foreground` | `--color-popover-foreground` | `#111111` | Texto em popovers |
| `border` | `--color-border` | `#E8E8E6` | Bordas de inputs, cards, separadores |
| `input` | `--color-input` | `#E8E8E6` | Borda de inputs (focus state usa ring) |
| `ring` | `--color-ring` | `#2E86C1` | Focus ring (acessibilidade) |

**Regras adicionadas:**
- Tokens obrigatórios no `@theme` do `index.css`
- Anti-pattern: omitir tokens shadcn ao customizar o `@theme`
- Referência cruzada com SPEC-THEME-001 para valores concretos

### 2. Novo PASSO 4A no `/app-scaffold`

Inserir PASSO 4A entre PASSO 4 e PASSO 4B na skill `app-scaffold.md` com:
- Bloco CSS dos 17 tokens semânticos mapeados para A1
- Explicação técnica (Tailwind v4 não define essas variáveis)
- Anti-pattern documentado
- PASSO 4B atualizado para referenciar PASSO 4A

---

## Impacto nos Pilares

- **Pilares afetados:** UX (DOC-UX-013), Scaffold (app-scaffold skill)
- **Ação requerida:** Ambos os arquivos já foram atualizados diretamente nesta sessão. Este amendment formaliza as alterações. Nenhuma cascata adicional necessária — as mudanças são self-contained (tokens CSS + documentação).

---

## Resolução do Merge

> **Merged por:** merge-amendment em 2026-03-29
> **Versão base após merge:** DOC-UX-013 v1.9.0
> **Alterações aplicadas:** Nova §3.4 "Tokens Semânticos shadcn/ui" com tabela de 17 tokens mapeados para A1. §3.4 anterior renumerada para §3.5. Novo PASSO 4A no app-scaffold com bloco CSS obrigatório.
