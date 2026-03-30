# 10-OrgDetail-InlineEdit — Spec de Proposta

> **Rota:** `/org-units` | **Módulo:** MOD-001 | **Status:** Proposta de mudança
> **Viewport:** 1440 × 900 px | **Font:** Plus Jakarta Sans
> **HTML Referência:** `10-org-detail-inline-edit-proposal.html`

---

## 1. Problema Identificado

A página atual de Estrutura Organizacional tem **dois blocos "Dados Cadastrais" visíveis simultaneamente** quando o usuário clica em "Editar Dados":

| Bloco | Localização | Formato | Conteúdo |
|-------|-------------|---------|----------|
| **A — FormPanel** | Esquerda (substitui árvore) | Inputs editáveis | CNPJ, Razão Social, Filial, Responsável, Telefone, E-mail |
| **B — DetailPanel** | Direita (card read-only) | ReadOnlyFields | CNPJ, Razão Social, Filial, Responsável, Telefone, E-mail |

**Consequências:**
- Confusão visual: mesmos dados em formatos diferentes lado a lado
- Perda de contexto: árvore desaparece quando FormPanel abre
- Redundância: usuário não sabe qual é o "oficial"

---

## 2. Decisão de Design Proposta (PO)

**Abordagem: Inline Edit** — ao clicar "Editar Dados", os campos do card "Dados Cadastrais" no DetailPanel se transformam **in-place** de ReadOnlyField para inputs editáveis. O FormPanel (480px, esquerda) é eliminado.

### Vantagens
- **Zero duplicação** — um único bloco de dados, dois estados (view / edit)
- **Árvore sempre visível** — contexto hierárquico preservado durante edição
- **Menos código** — remove o componente OrgNodeForm/FormPanel inteiro
- **Padrão familiar** — inline edit é amplamente usado em dashboards SaaS

### Trade-offs
- Campos imutáveis (Unidade Pai, Nível) precisam de card separado "Hierarquia" com cadeado
- Validação de formulário fica dentro do card em vez de num componente form dedicado

---

## 3. Estados da Interface

### Estado ① — Visualização (padrão)

```
AppShell
├── Topbar (breadcrumb: "Organização › Estrutura Organizacional")
├── Sidebar (Variante Org, ativo: "Estrutura Org.")
└── ContentArea (split-panel, sem padding)
    ├── Left: TreePanel (380px)
    │   ├── Title "Estrutura de Unidades"
    │   ├── Subtitle "Navegue pela hierarquia do grupo"
    │   ├── SearchBar
    │   └── TreeView (nós recursivos)
    └── Right: DetailPanel (flex, bg #F5F5F3, padding 24px)
        ├── DetailHeader
        │   ├── Icon (building, 48×48, bg #F8F8F6, r:10)
        │   ├── Nome (800, 22px, #111)
        │   ├── Meta (StatusBadge[Ativo] + Código)
        │   └── Actions: [Editar Dados] [+ Nova Subdivisão]
        ├── Card "DADOS CADASTRAIS"
        │   ├── Header: label uppercase, bg #F8F8F6
        │   └── Body: ReadOnlyFields em grid
        │       ├── Row: CNPJ (1fr) | Razão Social (2fr)
        │       ├── Row: Filial (1fr) | Responsável (1fr)
        │       └── Row: Telefone (1fr) | E-mail (1fr)
        ├── Card "DEPARTAMENTOS VINCULADOS"
        │   ├── Header: label + "Ver todos (N)" link
        │   └── Body: Tags wrap + "+ Novo Departamento"
        └── MetricRow
            ├── MetricCard[blue] "Colaboradores Totais" (valor + delta)
            └── MetricCard "Projetos em Execução" (valor + progress bar)
```

**Botões no header:**
- `Editar Dados` → Button secondary, ícone pencil
- `+ Nova Subdivisão` → Button primary, ícone plus

### Estado ② — Inline Edit (ao clicar "Editar Dados")

```
DetailPanel (mesmo layout, árvore continua visível)
├── DetailHeader
│   ├── (info inalterada)
│   └── Actions MUDAM: [Cancelar] [✓ Salvar Alterações]
├── Card "DADOS CADASTRAIS — EDITANDO"
│   ├── Header: bg #E3F2FD, label #2E86C1, ícone pencil
│   └── Body: Inputs editáveis em grid (mesma grid do view)
│       ├── Row: Nome da Subdivisão * (input, full width)
│       ├── Row: CNPJ (input) | Razão Social (input, 2fr)
│       ├── Row: Filial (input) | Responsável (input)
│       └── Row: Telefone (input) | E-mail (input)
├── Card "HIERARQUIA" (sempre read-only)
│   └── Body: ReadOnlyField[lock] Unidade Pai | ReadOnlyField[lock] Nível
├── Card "DEPARTAMENTOS VINCULADOS" (inalterado)
└── MetricRow (inalterado)
```

**Mudanças visuais no modo edit:**
- Header do card: fundo `#E3F2FD`, label `#2E86C1`, texto "DADOS CADASTRAIS — EDITANDO"
- Campos: borda `2px solid #2E86C1`, fundo `#FFFFFF`
- Botões do header: "Cancelar" (secondary) + "Salvar Alterações" (primary, ícone check)

---

## 4. Cores (além do AppShell)

| Token | Valor | Uso |
|-------|-------|-----|
| `--blue` | `#2E86C1` | Borda inputs editáveis, header card edit, botão salvar |
| `--blue-lt` | `#E3F2FD` | Background header card em modo edit |
| `--ro-bg` | `#F8F8F6` | Background ReadOnlyFields (view mode) |
| `--border-lt` | `#F0F0EE` | Borda ReadOnlyFields |
| `--border` | `#E8E8E6` | Bordas gerais, cards |
| `--t4` | `#888888` | Labels, texto auxiliar |
| `--t6` | `#CCCCCC` | Placeholder inputs |
| `--err` | `#E74C3C` | Asterisco campo obrigatório |
| `--success` | `#27AE60` | StatusBadge Ativo, dot servidor |

---

## 5. Tipografia (conteúdo específico)

| Elemento | Peso | Tamanho | Cor | Extras |
|----------|------|---------|-----|--------|
| Nome da unidade (header) | 800 | 22px | `--t1` | — |
| Card section label | 700 | 10px | `--t4` | uppercase, letter-spacing 1px |
| Card section label (edit) | 700 | 10px | `--blue` | uppercase, letter-spacing 1px |
| Field label | 700 | 10px | `--t4` | uppercase, letter-spacing 0.8px |
| ReadOnly value | 500 | 14px | `--t1` | — |
| Input value | 500 | 14px | `--t1` | font-family inherit |
| Input placeholder | 400 | 14px | `--t6` | — |
| Metric value | 800 | 36px | `--t1` / `#fff` | — |
| Metric label | 700 | 10px | `--t4` / `rgba(255,255,255,0.7)` | uppercase |

---

## 6. Medidas

| Elemento | Medida |
|----------|--------|
| TreePanel width | 380px |
| DetailPanel padding | 24px |
| Card border-radius | 12px |
| Card padding (body) | 20px 24px |
| Card header padding | 16px 24px |
| ReadOnlyField height | min 42px |
| ReadOnlyField border-radius | 8px |
| Input (edit mode) height | min 42px |
| Input (edit mode) border | 2px solid `--blue` |
| Input (edit mode) border-radius | 8px |
| Gap entre rows | 16px |
| Gap entre fields na row | 16px |
| DetailHeader icon | 48×48, r:10 |
| MetricCard border-radius | 12px |
| MetricCard padding | 20px 24px |

---

## 7. Componentes a Criar/Modificar

| Componente | Ação | Descrição |
|------------|------|-----------|
| `OrgDetailPanel` | **MODIFICAR** | Adicionar estado `isEditing` que transforma ReadOnlyFields em inputs |
| `InlineEditCard` | **NOVO** | Card com dois modos: view (ReadOnlyFields) e edit (inputs com borda azul, header azul claro) |
| `HierarchyCard` | **NOVO** | Card "Hierarquia" com ReadOnlyField + lock para Unidade Pai e Nível (sempre read-only) |
| `OrgNodeForm` / `FormPanel` | **REMOVER** | Não mais necessário para edição de dados cadastrais |

---

## 8. Transições de Estado

### Fluxo: View → Edit → Save/Cancel

```
[Estado View]
    │
    ▼ Clique "Editar Dados"
[Estado Edit]
    │
    ├── Clique "Salvar Alterações" → PATCH /org-units/:id → [Estado View] (dados atualizados)
    │
    └── Clique "Cancelar" → [Estado View] (dados revertidos)
```

### Mudanças entre estados:

| Elemento | View | Edit |
|----------|------|------|
| Botão header esquerdo | "Editar Dados" (sec) | "Cancelar" (sec) |
| Botão header direito | "+ Nova Subdivisão" (pri) | "✓ Salvar Alterações" (pri) |
| Card header bg | `#F8F8F6` | `#E3F2FD` |
| Card header label cor | `--t4` | `--blue` |
| Card header label texto | "DADOS CADASTRAIS" | "DADOS CADASTRAIS — EDITANDO" |
| Campos | ReadOnlyField (bg `#F8F8F6`, border `#F0F0EE`) | Input (bg `#FFF`, border 2px `#2E86C1`) |
| Card "Hierarquia" | não exibido (dados inline) | exibido (Pai + Nível com lock) |
| Árvore (TreePanel) | visível | **visível** (principal vantagem) |

---

## 9. Dados (API)

| Endpoint | Método | Uso |
|----------|--------|-----|
| `GET /org-units/:id` | GET | Carregar dados do nó (view + prefill edit) |
| `PATCH /org-units/:id` | PATCH | Salvar alterações (nome, CNPJ, razão social, filial, responsável, telefone, email) |

**Campos editáveis:** nome, cnpj, razao_social, filial, responsavel, telefone, email
**Campos imutáveis:** codigo, nivel, parent_id (readonly com cadeado)

---

## 10. Checklist de Validação

- [ ] Ao clicar "Editar Dados", campos ReadOnly viram inputs com borda `2px solid #2E86C1`
- [ ] Header do card muda para bg `#E3F2FD` com label `#2E86C1`
- [ ] Botões no header do detalhe mudam para "Cancelar" + "Salvar Alterações"
- [ ] Árvore (TreePanel 380px) permanece visível durante edição
- [ ] Card "Hierarquia" aparece somente no modo edit com campos Pai e Nível + cadeado
- [ ] Departamentos e métricas permanecem visíveis e inalterados durante edição
- [ ] Ao clicar "Cancelar", reverte ao estado view sem alterações
- [ ] Ao clicar "Salvar", PATCH é chamado e retorna ao estado view com dados atualizados
- [ ] FormPanel (480px) e Pattern H **não** são mais usados nesta tela
- [ ] Campo "Nome da Subdivisão" tem asterisco vermelho (obrigatório)
- [ ] Placeholders: CNPJ "00.000.000/0000-00", Telefone "(00) 00000-0000", E-mail "contato@empresa.com"
- [ ] Inputs editáveis: font-family inherit, font-size 14px, font-weight 500

---

## 11. Impacto no Design System

### Remoção
- **Pattern H (FormPanel)** deixa de ser usado na tela 10-OrgTree / 11-OrgForm para edição de dados cadastrais
- O Pattern H **continua válido** para criação de novos nós ("+ Nova Subdivisão"), onde faz sentido ter um formulário separado

### Novo componente reutilizável
- **InlineEditCard** pode ser reutilizado em qualquer DetailPanel que tenha botão "Editar" + campos read-only (ex: CaseDetail, UserProfile)

### PEN associada
- **PENDENTE-009** (card "Total Colaboradores" com layout pendente) — não afetada por esta mudança, continua como está

---

## 12. Arquivos de Referência

| Tipo | Arquivo |
|------|---------|
| HTML (proposta, 3 frames) | `10-org-detail-inline-edit-proposal.html` |
| Spec (este documento) | `10-org-detail-inline-edit-spec.md` |
