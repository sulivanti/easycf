# 30 — Movimentos Controlados (MOD-009)
> Rota: `/approvals/movements` | Módulo: MOD-009 | Status: Faltante → **Em Design**
> Spec v1 — 2026-03-29

---

## 1. Visão Geral

Tela principal do módulo de Controle e Aprovação. Lista todos os movimentos controlados (pedidos de compra, notas fiscais, ordens de serviço, contratos) que passaram pelo motor de regras de aprovação. A tela contém 8 views navegáveis dentro do mesmo AppShell.

**Stitch:** `aprova_o_de_movimentos_corrigido`
**Pattern:** AppShell (Topbar + Sidebar) + Tabs + DataTable
**Referência HTML:** `30-movements-ref.html`

---

## 2. Layout & AppShell

### 2.1 Topbar
| Propriedade | Valor |
|---|---|
| Altura | `--topbar-height: 52px` |
| Background | `#FFFFFF` (decisão PO — branco, não dark) |
| Borda inferior | `1px solid --color-border (#E8E8E6)` |
| Logo A1 | `32×32px`, background `--color-info (#2E86C1)`, border-radius `--radius-md`, texto "A1" branco, italic, 800 |
| Breadcrumb | `--type-caption (11px/400)`, separador "/" em `--color-border`, último item `--type-caption` 600 `--color-text-primary` |
| Avatar | `36×36px`, `--radius-circle`, background `--color-info`, texto branco 700 |

### 2.2 Sidebar
| Propriedade | Valor |
|---|---|
| Largura | `240px` fixo (decisão PO — não 220px do token) |
| Background | `#FFFFFF` |
| Borda direita | `1px solid --color-border` |
| Categoria label | `--type-sidebar-label (9px/700 CAPS)`, `--color-text-placeholder (#CCCCCC)` |
| Item ativo | Background `--color-info-bg (#E3F2FD)`, texto `--color-info (#2E86C1)`, 700 |
| Item inativo | `--color-text-auxiliary (#888888)`, hover → `bg: --color-bg-page`, `text: --color-text-primary` |

**Itens Sidebar (seção APROVAÇÃO):**
1. ✓ Movimentos Controlados (ícone: check-circle)
2. Regras de Aprovação (ícone: sliders)
3. Histórico (ícone: clock)

**Itens Sidebar (seção INTEGRAÇÃO):**
4. Protheus Sync (ícone: refresh)
5. Logs (ícone: file-text)

---

## 3. Views (8 telas navegáveis)

### 3.1 View ① — Movimentos Lista

**Rota:** `/approvals/movements`
**Breadcrumb:** Aprovação / Movimentos Controlados

#### PageHeader
| Elemento | Spec |
|---|---|
| Título | "Movimentos Controlados" · `--type-display (28px/800)` · `--color-text-primary` |
| Subtítulo | "Gerencie e aprove as solicitações pendentes no sistema." · `--type-body (13px/400)` · `--color-text-auxiliary` |
| Botão primário | "Novo Movimento" · `--color-info` bg · branco · `--radius-md` · ícone `plus` 16px |

#### Tabs
| Tab | Badge | Estado |
|---|---|---|
| Pendentes | Badge circular `--color-info` bg, branco, contagem "8" | **Ativo** → border-bottom 2px `--color-info` |
| Aprovados | — | Inativo → `--color-text-auxiliary`, hover `--color-text-primary` |
| Rejeitados | — | Inativo |
| Todos | — | Inativo |

#### SearchBar
| Elemento | Spec |
|---|---|
| Input | placeholder "Buscar por número ou solicitante...", ícone `search` à esquerda, `width: 256px` |
| Link | "Busca Avançada" → `--color-info`, 600, hover underline |

#### Ações em Lote
Botão outline: "Ações em Lote ▾" · `--color-border` border · `--color-text-primary` · ícone chevron-down

#### DataTable
| Coluna | Alinhamento | Tipografia | Dados |
|---|---|---|---|
| STATUS | left | `--type-micro (10px/700)` StatusBadge | Pendente/Aprovado/Rejeitado/Override/Auto |
| TIPO | left | `--type-body` 500 | Pedido Compra, Nota Fiscal, Ordem Serviço, Contrato |
| NÚMERO | left | `--type-body` 700, `--color-info`, hover underline | PED-2026-00421 (clicável → View ②) |
| SOLICITANTE | left | `--type-body` 400, `--color-text-auxiliary` | Nome do solicitante |
| VALOR R$ | right | `--type-body` 700, `tabular-nums` | Formato: 45.000,00 |
| DATA | left | `--type-caption`, `--color-text-auxiliary` | dd/mm/yyyy |
| EMPRESA | left | `--type-body` 400 | A1 Engenharia, A1 Energia, etc. |
| AÇÕES | center | Botões outline | Aprovar (success) / Rejeitar (danger) OU texto italic (já processado) |

**Header da tabela:** `--type-label (11px/600 CAPS)`, background `--color-bg-page`, `--color-text-primary`

**StatusBadge por status:**
| Status | Background | Texto | Ring |
|---|---|---|---|
| Pendente | `#fef3c7` | `#b45309` | `#fde68a` |
| Aprovado | `#d1fae5` | `#047857` | `#a7f3d0` |
| Rejeitado | `#fee2e2` | `#b91c1c` | `#fecaca` |
| Override | `#f3e8ff` | `#7e22ce` | `#e9d5ff` |
| ⚡ Auto | `#dbeafe` | `#1d4ed8` | `#bfdbfe` |

**Rows processados:** `opacity: 0.7`

**Botões de ação na linha:**
- Aprovar: `--color-success` border + text, hover bg `--color-success-bg`
- Rejeitar: `--color-error` border + text, hover bg `--color-error-bg`

**Footer:** "Exibindo X de Y movimentos" · `--type-caption` · Paginação com setas e "página X / Y"

---

### 3.2 View ② — Movimento Detalhe

**Rota:** `/approvals/movements/:id`
**Breadcrumb:** Aprovação / Movimentos / PED-2026-00421
**Layout:** Two-column (2/3 left + 1/3 right)

#### Header Card
- Código + StatusBadge em linha
- Descrição do objeto
- Valor em `--type-display` alinhado à direita
- Grid 4 colunas: Solicitante (avatar 24px + nome), Empresa, Tipo, Regra Aplicada (link `--color-info`)

#### ApprovalChain (cadeia multinível)
Cada nível é um card com indicador visual:
| Estado | Background | Ícone | Border |
|---|---|---|---|
| Aprovado | `--color-success-bg` | check branco em circle `--color-success` | `--color-success-bg` border |
| Aguardando | `--color-warning-bg` | clock branco em circle `--color-warning` | amber-200 · avatar `animate-pulse` |
| Bloqueado | `--color-bg-page` | dots em circle `--color-neutral` | slate-200 |

Conector entre níveis: linha 2px `--color-border`, 20px height, centralizada.

#### Botões de Ação
- Aprovar: `--color-success` bg, branco, ícone check, `--radius-md`
- Rejeitar: `--color-error` bg, branco, ícone x, `--radius-md`

#### OverridePanel
- Warning icon `--color-warning` + título "Override Administrativo"
- Alert box: bg `--color-warning-bg`, border amber-200, texto "Esta ação será registrada no log de auditoria"
- TextArea: mín. 20 caracteres, placeholder, contador "X/20 caracteres mínimos"
- Botão: "Aplicar Override" · `--color-warning` bg · disabled se < 20 chars
- **Armadilha:** validação client-side, contador muda cor (warning < 20, success ≥ 20)

#### Timeline (coluna direita, sticky top-20)
Eventos verticais com dot connector (2px line `--color-border`):
| Evento | Dot Color | Texto |
|---|---|---|
| Movimento criado | `--color-info-bg` | data + solicitante |
| Motor avaliou | `--color-info-bg` | regra + níveis |
| Nível N aprovado | `--color-success-bg` | data + aprovador |
| Nível N pendente | `--color-warning-bg` + pulse | "Aguardando desde..." |
| Nível N bloqueado | `--color-bg-page` | "Bloqueado até..." |

---

### 3.3 View ③ — Cadastro de Movimento

**Rota:** `/approvals/movements/new`
**Breadcrumb:** Aprovação / Movimentos / Novo Movimento
**Layout:** Two-column (2/3 form + 1/3 preview)

#### Formulário (coluna esquerda)
| Campo | Tipo | Obrigatório | Observação |
|---|---|---|---|
| Tipo de Objeto | Select | ✓ | Pedido Compra, NF, OS, Contrato, Requisição |
| Operação | Select | ✓ | CREATE, UPDATE, DELETE |
| Número do Documento | Input text | ✓ | Placeholder "PED-2026-00422" |
| Valor R$ | Input text | ✓ | `tabular-nums`, máscara monetária |
| Empresa | Select | ✓ | A1 Engenharia/Energia/Industrial/Agro |
| Solicitante | Input search | ✓ | Ícone `user`, placeholder "Buscar usuário..." |
| Origem | Select | — | PORTAL (default), PROTHEUS, API |
| Data | DatePicker | — | Default: hoje |
| Descrição / Objeto | Input text | — | Texto livre |
| Observações | TextArea | — | 3 linhas |
| Anexos | Upload zone | — | Drag-drop, aceita PDF/XLSX/JPG/PNG, máx. 10MB |

**Botões:** Cancelar (outline) + "Registrar Movimento" (primary `--color-info`)

#### Preview Motor de Regras (coluna direita, sticky)
- Estado vazio: ícone clipboard + "Preencha Tipo e Valor para simular"
- Regra acionada: card `--color-info-bg`, mostra regra + cadeia + níveis
- Auto-aprovação: card `--color-success-bg`, badge ⚡
- Tempo estimado: card `--color-warning-bg`
- **Interação:** atualiza em tempo real conforme preenchimento de Tipo + Valor

---

### 3.4 View ④ — Regras Lista

**Rota:** `/approvals/rules`
**Breadcrumb:** Aprovação / Regras de Aprovação

#### PageHeader
- Título + Subtítulo
- Botão "Busca Avançada" (outline, ícone search) + Botão "Nova Regra" (primary)

#### DataTable
| Coluna | Dados |
|---|---|
| STATUS | Ativa (success) / Inativa (neutral) |
| OBJETO | Pedido Compra, Nota Fiscal, etc. |
| OPERAÇÃO | CREATE, UPDATE, DELETE |
| THRESHOLD R$ | Valor tabular-nums, right-aligned |
| ORIGENS | Pills: PROTHEUS, PORTAL, API, ⚡ AUTO |
| NÍVEIS | Badge circular `--color-info` com contagem |
| AÇÕES | Editar (primary outline) + Desativar/Ativar |

**Regras inativas:** `opacity: 0.6`, botão "Ativar" (success) ao invés de "Desativar"

---

### 3.5 View ⑤ — Busca Avançada Regras

**Rota:** `/approvals/rules/search`
**Breadcrumb:** Aprovação / Regras / Busca Avançada

#### Painel de Filtros (8 campos, grid 4 colunas)
| Filtro | Tipo |
|---|---|
| Tipo de Objeto | Select |
| Tipo de Operação | Select |
| Status | Select (Ativa/Inativa) |
| Origem | Select (PROTHEUS/PORTAL/API/AUTO) |
| Threshold Mínimo R$ | Input |
| Threshold Máximo R$ | Input |
| Nº Níveis (mín) | Input number |
| Tipo Aprovador | Select (ROLE/USER/ORG_LEVEL) |

Botão "Limpar Filtros" (link) + "Pesquisar" (primary)

#### Resultados
- Status bar: "Resultados: X regras" + filtros aplicados
- Tabela idêntica à View ④ mas com highlight (`<mark>`) nos termos encontrados
- Rows com `bg: rgba(254,252,232,.3)` para indicar match

---

### 3.6 View ⑥ — Nova Regra (Create)

**Rota:** `/approvals/rules/new`
**Layout:** Two-column (config + chain builder)

#### ControlRuleEditor (coluna esquerda)
Campos: objectType, operationType, threshold, origens (checkboxes), requireApproval (toggle)
Preview de impacto: card `--color-info-bg`

#### ApprovalRuleChain (coluna direita)
- Header: "Cadeia de Aprovação" + link "Adicionar Nível"
- Cada nível: card com border `--color-border`, bg `--color-bg-page/50`
  - Badge "Nível N" em `--color-info` + `--color-info-bg`
  - Grid 2×2: Tipo Aprovador (select), Entidade (select), Critério (ALL/ANY), Timeout (hours)
  - Ações: reorder up/down, delete
- Placeholder dashed: "Clique em Adicionar Nível"

---

### 3.7 View ⑦ — Editar Regra

Idêntica à View ⑥ com campos pré-preenchidos + adições:
- StatusBadge no header
- Botão "Desativar Regra" (danger outline)
- Card Estatísticas: Acionamentos, Aprovados (success), Rejeitados (danger) em grid 3 colunas
- Cadeia pré-preenchida (ex: 3 níveis)

---

### 3.8 View ⑧ — Histórico

**Rota:** `/approvals/history`
**Breadcrumb:** Aprovação / Histórico

#### Filtros (inline, 1 linha)
| Filtro | Tipo | Largura |
|---|---|---|
| Busca textual | Input search (full width) | flex-1 |
| Ação | Select | 160px |
| Usuário | Select | 160px |
| Período | DateRange (2 inputs + "até") | 2×144px |
| Botão Filtrar | Primary | auto |

#### DataTable (expansível)
| Coluna | Dados |
|---|---|
| Expand | Chevron → clique expande row |
| DATA/HORA | `--type-caption`, `tabular-nums` |
| USUÁRIO | Avatar 24px + nome |
| MOVIMENTO | Código linkável (→ View ②) |
| AÇÃO | StatusBadge: Aprovação/Rejeição/Override/⚡ Auto/Criação |
| NÍVEL | "Nível N" ou "—" |
| DETALHES | Texto truncado max-width 200px |

**Row expandido:** card com justificativa completa + grid 3 cols (Movimento, Empresa/Próximo nível, Regra/Tempo de resposta)

**Paginação:** "Exibindo X de Y registros" + "página X / Y"

---

## 4. Status Badge — Mapa Completo

| Status Backend | Label | Variante |
|---|---|---|
| `PENDING_APPROVAL` | Pendente | warning |
| `APPROVED` | Aprovado | success |
| `REJECTED` | Rejeitado | error |
| `OVERRIDDEN` | Override | purple |
| `AUTO_APPROVED` | ⚡ Auto | info |
| `CANCELLED` | Cancelado | error |

---

## 5. Dados (API)

| Endpoint | Método | Uso |
|---|---|---|
| `/approvals/movements` | GET | Lista paginada com filtros (tipo, status, período) |
| `/approvals/movements` | POST | Criar movimento (View ③) |
| `/approvals/movements/:id` | GET | Detalhe do movimento |
| `/approvals/movements/:id/approve` | POST | Aprovar no nível atual |
| `/approvals/movements/:id/reject` | POST | Rejeitar |
| `/approvals/movements/:id/override` | POST | Override com justificativa (≥20 chars) |
| `/approvals/movements/:id/timeline` | GET | Timeline de eventos |
| `/approval-rules` | GET | Lista de regras |
| `/approval-rules` | POST | Criar regra |
| `/approval-rules/:id` | PUT | Editar regra |
| `/approval-rules/:id` | PATCH | Ativar/Desativar |
| `/approval-rules/:id/chain` | GET | Cadeia de aprovação |
| `/approvals/history` | GET | Log de auditoria filtrado |

---

## 6. Observações & Armadilhas

1. **Override ≥ 20 chars** — validação client-side com contador visual, botão disabled até threshold
2. **AutoApprovalBadge** — ícone ⚡ + tooltip com nome da regra que disparou
3. **Cadeia multinível** — cada nível pode ser ROLE, USER ou ORG_LEVEL; drag-and-drop para reordenar
4. **Rows processados** — opacity 0.7, sem botões de ação (texto italic "Aprovado por XX")
5. **Preview motor de regras** — atualiza em tempo real no cadastro conforme Tipo + Valor
6. **Histórico expandível** — rows com chevron; justificativa completa só no expand
7. **Busca Avançada** — highlight com `<mark>` nos resultados
8. **Paginação** — server-side, 30/página padrão

---

## 7. Referência

| Tipo | Arquivo |
|---|---|
| Spec | `30-movements-spec.md` (este arquivo) |
| HTML Referência | `30-movements-ref.html` (8 views navegáveis, CSS inline, zero CDN) |
| Screenshot Stitch | `stitchaprovacao.png` |
| Design System | `design-system-ecf.md` + `design-system-v1.md` |
