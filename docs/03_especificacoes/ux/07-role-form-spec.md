# 07-RoleForm — Spec Definitiva

> **Rota:** `/roles/:id` (edição) · `/roles/novo` (criação) | **Módulo:** MOD-000 | **Frame Penpot:** `07-RoleForm-Edit`, `07-RoleForm-Create`
> **Viewport:** 1440 × 900 px | **Font:** Plus Jakarta Sans

---

## 1. Decisões de Design (PO)

| # | Decisão | Valor |
|---|---------|-------|
| D1 | Pattern de layout | Sidebar + Form (Pattern A adaptado — card de formulário centralizado) |
| D2 | Sidebar variante | Admin (Perfis e Permissões ativo) |
| D3 | Topbar direita | Variante B — Sino + "Empresa: A1 Engenharia" |
| D4 | Breadcrumb | "Administração › Perfis e Permissões › Editar" (ou "› Novo") |
| D5 | Formulário | Card branco com radius 12px, padding 32px, max-width 720px |
| D6 | Scopes/Escopos | Tags removíveis (chip com ×) + input de adição |
| D7 | StatusBadge | Exibido no header (ATIVO / INATIVO), apenas em edição |
| D8 | Botões footer | "Salvar" (primary) + "Cancelar" (secondary), alinhados à esquerda |
| D9 | Dois modos | Editar (com dados preenchidos + status toggle) · Criar (campos vazios, sem toggle) |
| D10 | Descrição | Textarea curta (3 linhas), não input simples |

---

## 2. Cores (além do AppShell)

| Token | Hex | Uso |
|-------|-----|-----|
| `--blue` | `#2E86C1` | Botão salvar, sidebar ativo, links |
| `--border` | `#E8E8E6` | Bordas de inputs, card, separadores |
| `--bg` | `#F5F5F3` | Fundo da ContentArea |
| `--white` | `#FFFFFF` | Card, inputs, topbar, sidebar |
| `--t1` | `#111111` | Título "Editar Perfil" |
| `--t2` | `#333333` | Labels de campos |
| `--t3` | `#555555` | Texto dos chips de escopo |
| `--t4` | `#888888` | Placeholder, texto auxiliar |
| `--t6` | `#CCCCCC` | Placeholder do input |
| `--ba-*` | verde | Badge ATIVO |
| `--bi-*` | cinza | Badge INATIVO |
| `--scope-bg` | `#F4F4F2` | Fundo dos chips de escopo |
| `--scope-bd` | `#E0E0DE` | Borda dos chips de escopo |

---

## 3. Tipografia (conteúdo específico)

| Elemento | Size | Weight | Color | Extras |
|----------|------|--------|-------|--------|
| PageHeader title | 28px | 800 | `--t1` | letter-spacing: -1px |
| PageHeader desc | 14px | 400 | `--t4` | — |
| Form labels | 11px | 700 | `--t2` | uppercase, letter-spacing: 0.8px |
| Input text | 14px | 400 | `--t1` | — |
| Input placeholder | 14px | 400 | `--t6` | — |
| Textarea | 14px | 400 | `--t1` | line-height: 1.5 |
| Section label | 11px | 700 | `--t4` | uppercase, letter-spacing: 1px |
| Scope chip text | 12px | 500 | `--t3` | — |
| Scope chip × | 12px | 600 | `--t4` | cursor: pointer, hover → `--t1` |
| Scope count | 12px | 500 | `--t4` | "24 escopos atribuídos" |
| Button Salvar | 13px | 700 | `#FFF` | — |
| Button Cancelar | 13px | 600 | `--t3` | — |
| StatusBadge | 10px | 700 | semântico | uppercase |
| Toggle label | 13px | 500 | `--t2` | — |

---

## 4. Estrutura de Elementos (árvore visual)

```
AppShell
├── Topbar (h:64, bg:white, border-bottom:#E8E8E6)
│   ├── .tb-l
│   │   ├── Logo A1 (40×40, bg:#2E86C1, r:10)
│   │   ├── "Grupo A1" / "PORTAL INTERNO"
│   │   ├── Separator
│   │   └── Breadcrumb: "Administração › Perfis e Permissões › Editar"
│   └── .tb-r (Variante B)
│       ├── Bell icon + NotifDot
│       └── "Empresa: A1 Engenharia"
├── Sidebar (w:240, Variante Admin)
│   ├── ADMINISTRAÇÃO
│   │   ├── Dashboard (icon: Home)
│   │   ├── Usuários (icon: Users)
│   │   ├── Perfis e Permissões (icon: Shield) ← ATIVO
│   │   └── Empresas (icon: Building)
│   ├── PROCESSOS
│   │   ├── Solicitações (icon: File)
│   │   └── Aprovações (icon: CheckCircle)
│   └── Footer: UserBlock (avatar "AE" + "Administrador ECF" + "admin@a1.com.br")
└── ContentArea (bg:#F5F5F3, padding:32px, overflow-y:auto)
    ├── PageHeader
    │   ├── .ph-left
    │   │   ├── BackLink ("← Voltar para lista")
    │   │   ├── Title "Editar Perfil" + StatusBadge (ATIVO)
    │   │   └── Description "Altere as propriedades e permissões deste perfil."
    │   └── (sem botão à direita)
    └── FormCard (bg:white, r:12, border:1px #E8E8E6, p:32, max-w:720px)
        ├── Section: Informações Básicas
        │   ├── FormField "NOME" → input (value: "Super Administrador")
        │   ├── FormField "DESCRIÇÃO" → textarea (value: "Acesso total a todos os módulos")
        │   └── Toggle "Status" → ON (ATIVO) [apenas em edição]
        ├── Separator (1px #E8E8E6, mt:28, mb:28)
        ├── Section: Escopos e Permissões
        │   ├── SectionHeader
        │   │   ├── SectionLabel "ESCOPOS E PERMISSÕES"
        │   │   └── ScopeCount "24 escopos atribuídos"
        │   ├── ScopeTags (flex-wrap, gap:8px)
        │   │   ├── Chip "admin:backoffice:read" ×
        │   │   ├── Chip "admin:backoffice:write" ×
        │   │   ├── Chip "case:instance:read" ×
        │   │   ├── ... (todos os scopes visíveis)
        │   │   └── Chip "users:user:write" ×
        │   ├── AddScopeRow (mt:16)
        │   │   ├── Input (placeholder: "domínio:entidade:ação")
        │   │   └── Button[secondary] "Adicionar"
        │   └── InfoBox "Os escopos definem quais ações este perfil pode executar..."
        ├── Separator (1px #E8E8E6, mt:28, mb:28)
        └── FormFooter
            ├── Button[primary] "Salvar Alterações"
            └── Button[cancel] "Cancelar"
```

---

## 5. Medidas

| Elemento | Propriedade | Valor |
|----------|------------|-------|
| ContentArea | padding | 32px |
| FormCard | max-width | 720px |
| FormCard | padding | 32px |
| FormCard | border-radius | 12px |
| Input height | height | 48px |
| Input | border-radius | 10px |
| Textarea | min-height | 80px |
| Textarea | border-radius | 10px |
| Scope chip | padding | 6px 12px |
| Scope chip | border-radius | 6px |
| Scope chip gap | gap | 8px |
| Add scope input | width | flex:1 |
| Add scope row | gap | 12px |
| Section separator | margin | 28px 0 |
| InfoBox | margin-top | 16px |
| FormFooter | gap | 12px |
| FormFooter | margin-top | 0 (after separator) |
| BackLink | margin-bottom | 16px |
| Title+Badge gap | gap | 12px |
| Toggle track | width × height | 40×22 |

---

## 6. Componentes a Criar (tabela)

| Componente | Tipo | Variantes | Descrição |
|-----------|------|-----------|-----------|
| BackLink | Primitivo | — | "← Voltar para lista", font 13px, weight 600, color `--blue` |
| ScopeChip | Primitivo | default, hover | Chip com label + ×, bg `--scope-bg`, border `--scope-bd` |
| ScopeGrid | Composto | — | flex-wrap container de ScopeChips |
| AddScopeRow | Composto | — | Input + Button[secondary] em row |
| FormCard | Composto | — | Card branco com sections separadas por Separator |
| PageHeaderWithBadge | Composto | edit, create | Title + StatusBadge inline (edit) ou sem badge (create) |

---

## 7. Dois Modos (Frames)

### Frame 1: Editar Perfil
- Breadcrumb: "Administração › Perfis e Permissões › Editar"
- Title: "Editar Perfil" + StatusBadge ATIVO
- Descrição: "Altere as propriedades e permissões deste perfil."
- Campos preenchidos com dados do perfil "Super Administrador"
- Toggle de Status visível (ON)
- 24 scope chips preenchidos
- Botão: "Salvar Alterações"

### Frame 2: Novo Perfil
- Breadcrumb: "Administração › Perfis e Permissões › Novo"
- Title: "Novo Perfil" (sem badge)
- Descrição: "Defina o nome, descrição e permissões do novo perfil."
- Campos vazios
- Sem Toggle de Status
- Sem scope chips (área vazia com mensagem "Nenhum escopo adicionado ainda")
- Botão: "Criar Perfil"

---

## 8. Checklist (verificação para Penpot)

- [ ] Topbar BRANCA `#FFFFFF` com border-bottom `#E8E8E6`
- [ ] Logo AZUL `#2E86C1` (40×40, r:10)
- [ ] Sidebar fixa 240px, Perfis e Permissões ativo (bg `#E3F2FD`, text `#2E86C1`)
- [ ] ContentArea fundo `#F5F5F3`
- [ ] FormCard branco, radius 12px, border `#E8E8E6`, max-width 720px
- [ ] BackLink azul `#2E86C1` com seta ←
- [ ] StatusBadge ATIVO (verde) alinhado ao título
- [ ] Labels uppercase 11px bold
- [ ] Inputs 48px height, radius 10px, border `#E8E8E6`
- [ ] Textarea 80px min-height
- [ ] Toggle azul `#2E86C1` (40×22)
- [ ] Scope chips com bg `#F4F4F2`, border `#E0E0DE`, radius 6px
- [ ] Chip × hover muda cor
- [ ] Separadores 1px `#E8E8E6`
- [ ] InfoBox azul claro `#F0F8FF`
- [ ] Botão Salvar azul `#2E86C1`, height 44px, radius 8px
- [ ] Botão Cancelar outline, height 44px
- [ ] Font Plus Jakarta Sans em TODOS os textos
- [ ] Ícones SVG inline stroke-based
