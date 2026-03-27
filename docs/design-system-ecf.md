# Design System — ECF × Grupo A1

> **Versão:** 1.0 — Planejamento & Inventário  
> **Stack:** React + Tailwind CSS + Plus Jakarta Sans  
> **Escopo:** 12 módulos · 10 páginas mapeadas · ~65 componentes identificados

---

## 1. Design Tokens

### 1.1 Paleta de Cores

#### Core Brand

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-accent` | `#F58C32` | CTAs, foco, destaque, item ativo sidebar |
| `--color-accent-hover` | `#E07A22` | Hover em botões primários |
| `--color-accent-light` | `#FFF5EC` | Background de item ativo (sidebar, seleção) |
| `--color-accent-border` | `#F5C89A` | Borda sutil em contextos de destaque |
| `--color-black` | `#111111` | Topbar, brand, texto primário |

#### Superfícies

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-bg-page` | `#F5F5F3` | Background de página |
| `--color-bg-sidebar` | `#FAFAF8` | Background de sidebar |
| `--color-bg-card` | `#FFFFFF` | Cards, modais, formulários |
| `--color-border` | `#E8E8E6` | Todas as bordas e divisores |
| `--color-border-light` | `#F0F0EE` | Divisores internos de tabela |

#### Hierarquia de Texto

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-text-primary` | `#111111` | Títulos, headings |
| `--color-text-secondary` | `#333333` | Subtítulos, labels fortes |
| `--color-text-tertiary` | `#555555` | Corpo de texto, breadcrumbs |
| `--color-text-auxiliary` | `#888888` | Itens de menu inativos |
| `--color-text-hint` | `#AAAAAA` | Captions, metadados, hints |
| `--color-text-placeholder` | `#CCCCCC` | Placeholders de input, sidebar labels |

#### Semânticas (Status)

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-success` | `#27AE60` | ACTIVE, APPROVED, RESOLVED, ✅ |
| `--color-success-bg` | `#E8F8EF` | Badge background success |
| `--color-warning` | `#E67E22` | DRAFT, PENDING, ON_HOLD, ⚠️ |
| `--color-warning-bg` | `#FFF3E0` | Badge background warning |
| `--color-error` | `#E74C3C` | BLOCKED, REJECTED, CANCELLED, ❌ |
| `--color-error-bg` | `#FFEBEE` | Badge background error |
| `--color-info` | `#2E86C1` | PUBLISHED, links, informativo |
| `--color-info-bg` | `#E3F2FD` | Badge background info |
| `--color-neutral` | `#6C757D` | INACTIVE, DEPRECATED, EXPIRED |
| `--color-neutral-bg` | `#F4F4F2` | Badge background neutral |
| `--color-purple` | `#8E44AD` | Delegação, integração, serviços |
| `--color-purple-bg` | `#EDE7F6` | Badge background purple |

#### Topbar (Dark Context)

| Token | Hex | Uso |
|-------|-----|-----|
| `--color-topbar-bg` | `#111111` | Fundo da topbar |
| `--color-topbar-separator` | `#1E1E1E` | Separador na topbar |
| `--color-topbar-text` | `#FFFFFF` | Texto principal topbar |
| `--color-topbar-text-muted` | `#444444` | Subtexto topbar |
| `--color-topbar-badge-bg` | `#1E1E1E` | Background de badges na topbar |
| `--color-topbar-badge-border` | `#333333` | Borda de badges na topbar |

---

### 1.2 Tipografia

**Font Family:** `Plus Jakarta Sans`, system-ui, sans-serif

| Token | Weight | Size | Line-Height | Letter-Spacing | Uso |
|-------|--------|------|-------------|----------------|-----|
| `--type-display` | 800 | 28px (44px canvas) | 34px | -1px | Títulos de página principal |
| `--type-title` | 700 | 20px | 24px | -0.4px | Headings de seção |
| `--type-subtitle` | 700 | 14px | 18px | -0.3px | Subtítulos, seções menores |
| `--type-label` | 600 | 11px CAPS | 14px | +0.8px | Labels de formulário, categorias sidebar |
| `--type-body` | 400 | 13px | 16px | 0 | Texto padrão, tabelas, formulários |
| `--type-caption` | 400 | 11px | 14px | 0 | Datas, metadados, hints |
| `--type-micro` | 700 | 10px | 12px | 0 | Badges, tags, status |
| `--type-sidebar-label` | 700 | 9px CAPS | 12px | +1.4px | Categorias da sidebar |

---

### 1.3 Espaçamento & Layout

| Token | Valor | Uso |
|-------|-------|-----|
| `--space-xs` | 4px | Gap mínimo, padding interno de badge |
| `--space-sm` | 8px | Gap entre itens pequenos |
| `--space-md` | 12px | Gap padrão, padding de card |
| `--space-lg` | 16px | Padding de seções |
| `--space-xl` | 24px | Margem entre blocos |
| `--space-2xl` | 36px | Margem entre seções maiores |
| `--space-3xl` | 48px | Padding de página |
| `--sidebar-width` | 220px | Largura fixa da sidebar |
| `--topbar-height` | 52px | Altura fixa da topbar |
| `--radius-xs` | 4px | Badges, tags, ícones de nível |
| `--radius-sm` | 5px | Botões pequenos, tooltips |
| `--radius-md` | 6px | Botões, inputs |
| `--radius-lg` | 8px | Cards menores, color swatches |
| `--radius-xl` | 10px | Cards principais, painéis |
| `--radius-pill` | 20px | Badges de status, pills |
| `--radius-circle` | 50% | Avatares, indicadores |

---

## 2. Inventário de Componentes

### 2.1 Shell (Layout Global)

Presente em todas as páginas pós-login. Extraído de P1-P5.

| Componente | Descrição | Usado em |
|-----------|-----------|----------|
| `AppShell` | Container principal: Topbar + Sidebar + Content Area | Todas as páginas autenticadas |
| `Topbar` | Barra preta (#111) com logo A1, breadcrumb, badge de status, avatar do usuário | Todas |
| `Sidebar` | Menu lateral branco com categorias (label uppercase), ícones SVG inline, item ativo com borda laranja à esquerda + bg `#FFF5EC` | Todas |
| `Breadcrumb` | Navegação hierárquica na topbar: `#555` → `/` → `#FFF` bold | Todas |
| `UserAvatar` | Círculo laranja com iniciais brancas (30×30), com nome e tenant ao lado | Topbar |

**Categorias da Sidebar (mapeadas dos módulos):**

1. **Administração** — Usuários (MOD-002), Perfis e Permissões (MOD-000)
2. **Organização** — Estrutura Org. (MOD-003), Identidade Avançada (MOD-004)
3. **Processos** — Ciclos (MOD-005), Casos (MOD-006), Rotinas (MOD-007)
4. **Aprovação** — Movimentos (MOD-009)
5. **Integração** — Protheus (MOD-008), MCP Agentes (MOD-010)
6. **Ferramentas** — SmartGrid (MOD-011)

---

### 2.2 Componentes Primitivos (Atoms)

| Componente | Variantes | Propriedades | Derivado de |
|-----------|-----------|-------------|-------------|
| `Button` | primary (laranja), secondary (branco + borda), ghost (texto only), danger (vermelho) | size: sm/md/lg, disabled, loading | P1-P5: "Novo Nó", "Fork", "Editar" |
| `Badge` | success, warning, error, info, neutral, purple | text, dot (boolean) | P1: "ACTIVE", P2: "PUBLISHED", P3: "OPEN" |
| `StatusBadge` | Mapeia entidade → cor automática | status string | Todos os módulos |
| `IconButton` | com/sem tooltip | icon, variant | P1: chevrons, P5: ações |
| `Input` | text, password, email, search | label, hint, error, placeholder | P0: login, A1 Usuários: form |
| `Select` | single, multi | options, placeholder | P1: nível, P3: stage |
| `TextArea` | padrão, com counter | maxLength, rows | P3: motivo de cancelamento |
| `Checkbox` | padrão, indeterminate | checked, label | P5: checklist de gates |
| `Toggle` | on/off | checked, label | P4: configurações |
| `Pill` | nível org (N1-N5), com cor dinâmica | level, label | P1: "N1 Grupo", "N5 Tenant" |
| `Tag` | removível, estática | label, onRemove | P4: scopes |
| `Tooltip` | posicional | content, position | Geral |
| `Spinner` | inline, overlay | size | P2: loading canvas |
| `Skeleton` | line, card, table | width, height | MOD-001: SkeletonLoader |

---

### 2.3 Componentes Compostos (Molecules)

| Componente | Descrição | Usado em |
|-----------|-----------|----------|
| `FormField` | Label (11px caps) + Input + Hint/Error + Help text | P0, A1 Usuários, P1 |
| `SearchBar` | Input com ícone de busca + atalho | P1, A1 Usuários |
| `FilterBar` | Row de filtros (dropdowns + busca + clear) | P3: filtros de caso |
| `Toast` | Notificação flutuante: success/error/warning/info | MOD-001: respostas API |
| `Modal` | Overlay com header, body, footer de ações | P1: "Desvincular", A1: "Desativar" |
| `ConfirmationModal` | Modal com ícone de alerta + ação destructiva | P1: soft-delete, P5: bulk delete |
| `EmptyState` | Ilustração + texto + CTA | P3: "Nenhum caso encontrado" |
| `CooldownButton` | Botão com countdown de 60s (anti-spam) | MOD-002: reenvio de convite |
| `PasswordStrength` | Indicador de força de senha | MOD-002: formulário de criação |
| `Pagination` | Controles de paginação (30/página) | A1 Usuários, P3 |

---

### 2.4 Componentes de Dados (Organisms)

| Componente | Descrição | Usado em |
|-----------|-----------|----------|
| `DataTable` | Tabela paginada com sort, filtro, ações por linha | A1 Usuários, P3, P4, P5 |
| `TreeView` | Árvore hierárquica colapsável (5 níveis org) com indentação progressiva, dot de cor por nível | P1: Estrutura Org |
| `TreeNode` | Nó individual com chevron, nome, badge de nível, ações contextuais | P1 |
| `Timeline` | Linha do tempo vertical com eventos, atores, timestamps | P3: CaseTimeline |
| `FlowCanvas` | Canvas visual para stages/gates/transitions (similar a node editor) | P2: Modelagem de Processos |
| `FlowNode` | Nó do canvas: stage (retângulo) ou gate (losango/ícone) com status visual | P2 |
| `FlowEdge` | Conexão entre nodes com label opcional e seta direcional | P2 |
| `ApprovalChain` | Cadeia multinível de aprovação: níveis com avatares, status, timeout | P4: Movimentos |
| `SmartDataGrid` | Grid editável inline com validação por linha (✅⚠️❌) | P5: SmartGrid |
| `OutboxMonitor` | Lista de integrações com status (QUEUED → SUCCESS/DLQ) | P4: Monitor Protheus |

---

### 2.5 Componentes por Módulo (Features)

#### MOD-000 Foundation / MOD-001 Backoffice

| Componente | Página | Funcionalidade |
|-----------|--------|----------------|
| `LoginPanel` | P0 | Email + senha, erro inline, rate limiting visual |
| `ForgotPanel` | P0 | Input de email + enviar link |
| `ResetPanel` | P0 | Nova senha + confirmação + PasswordStrength |
| `ProfileWidget` | Shell | Dropdown com editar perfil, trocar senha, logout |
| `DashboardCard` | A1 Dashboard | Card de métrica com título, valor, trend |
| `DashboardGrid` | A1 Dashboard | Grid de cards de métricas |

#### MOD-002 Gestão de Usuários

| Componente | Página | Funcionalidade |
|-----------|--------|----------------|
| `UsersTable` | A1 Usuários | DataTable com nome, email, role, status, ações |
| `UserStatusBadge` | A1 Usuários | PENDING → amarelo, ACTIVE → verde, BLOCKED → vermelho |
| `UserFormPage` | A1 Usuários | Formulário: Modo Convite vs Modo Senha |
| `DeactivateModal` | A1 Usuários | Confirmação de desativação com warning |
| `UserInvitePage` | A1 Usuários | CooldownButton (60s) para reenvio |

#### MOD-003 Estrutura Organizacional

| Componente | Página | Funcionalidade |
|-----------|--------|----------------|
| `OrgTreeView` | P1 | TreeView com 5 níveis (N1-N5) e cores distintas por nível |
| `OrgNodeActions` | P1 | "➕ Filho", "Editar", "Vincular Tenant" (só N4) |
| `TenantLinkBadge` | P1 | Indicador laranja de tenant vinculado no N5 |
| `OrgNodeForm` | P1 | Drawer/Modal: código (imutável), nome, nível (imutável), pai (imutável) |
| `OrgDetailPanel` | P1 | Painel lateral com detalhes do nó selecionado |

#### MOD-004 Identidade Avançada

| Componente | Página | Funcionalidade |
|-----------|--------|----------------|
| `OrgScopeManager` | (admin) | Lista de escopos PRIMARY/SECONDARY por usuário |
| `AccessShareForm` | (admin) | Compartilhamento: grantee, recurso, ações, prazo, motivo |
| `DelegationForm` | (admin) | Delegação: delegatee, papel, escopos (subset), prazo, motivo |
| `ExpirationBadge` | (admin) | Badge com countdown de expiração |

#### MOD-005 Modelagem de Processos

| Componente | Página | Funcionalidade |
|-----------|--------|----------------|
| `CycleList` | P2 | Lista de ciclos com status badge (DRAFT/PUBLISHED/DEPRECATED) |
| `CycleHeader` | P2 | Nome + versão + status + ações (Fork, Deprecate, Publish) |
| `FlowCanvas` | P2 | Canvas principal com stages (caixas) e gates (ícones) |
| `MacroStagePanel` | P2 | Painel lateral de macroetapas agrupando stages |
| `StageNode` | P2 | Nó: nome, isInitial (indicador verde), isTerminal (indicador vermelho) |
| `GateIcon` | P2 | Ícone por tipo: APPROVAL (🔒), DOCUMENT (📎), CHECKLIST (☑️), INFORMATIVE (ℹ️) |
| `TransitionEditor` | P2 | Configuração de transição: from → to, condição, roles permitidos |
| `PublishGuard` | P2 | Validação pré-publicação (requer initial stage, ≥1 gate, etc.) |

#### MOD-006 Execução de Casos

| Componente | Página | Funcionalidade |
|-----------|--------|----------------|
| `CaseList` | P3 | DataTable com código, ciclo, stage atual, status, atribuído, data |
| `CaseDetail` | P3 | Detalhe: header com status + stage atual + ações |
| `CaseStatusBar` | P3 | Barra visual de progresso: stages percorridos vs total |
| `GateResolverPanel` | P3 | Painel para resolver gates: aprovar/rejeitar/waive com parecer |
| `CaseTimeline` | P3 | Timeline vertical: transições, gates, comentários, eventos |
| `TransitionButton` | P3 | Botão de avançar stage (5-step validation antes) |
| `AssignmentPanel` | P3 | Atribuir/reatribuir responsáveis por stage |
| `CaseEventForm` | P3 | Adicionar comentário/exceção/evidência à timeline |

#### MOD-007 Parametrização Contextual

| Componente | Página | Funcionalidade |
|-----------|--------|----------------|
| `RoutineList` | P3 | Lista de rotinas com status e tipo (BEHAVIOR/INTEGRATION) |
| `RoutineItemBuilder` | P3 | Builder de itens: tipo (7) × ação (8) × campo-alvo |
| `IncidenceRuleEditor` | P3 | Configurar regra de incidência: trigger + condição |
| `ContextFramerSelector` | P3 | Seletor de contextos (framers) ativos |
| `EvaluationPreview` | P3 | Preview dry-run do motor de avaliação |
| `ConflictIndicator` | P3 | Indicador visual quando 2+ rotinas conflitam no mesmo campo |

#### MOD-008 Integração Protheus

| Componente | Página | Funcionalidade |
|-----------|--------|----------------|
| `IntegrationServiceForm` | P4 | Form: URL, authType, timeout, environment |
| `FieldMappingEditor` | P4 | Mapeamento source → target com tipo (FIELD/PARAM/HEADER/FIXED/DERIVED) |
| `OutboxMonitor` | P4 | Dashboard: QUEUED, RUNNING, SUCCESS, FAILED, DLQ com contadores |
| `CallLogTable` | P4 | Tabela de logs com payload, httpStatus, retryCount, ações |
| `ReprocessButton` | P4 | Botão de reprocessamento com campo de motivo |
| `RetryBadge` | P4 | "Tentativa 2 de 5" com barra de progresso |

#### MOD-009 Movimentos & Aprovação

| Componente | Página | Funcionalidade |
|-----------|--------|----------------|
| `ControlRuleEditor` | P4 | Editor de regras: objectType, operationType, valueThreshold, originTypes |
| `ApprovalRuleChain` | P4 | Cadeia visual multinível: ROLE/USER/ORG_LEVEL por nível |
| `ApprovalInbox` | P4 | "Minha Caixa de Aprovação" com cards pendentes |
| `ApprovalCard` | P4 | Card: operação, solicitante, valor, prazo, botões Aprovar/Rejeitar |
| `MovementTimeline` | P4 | Histórico do movimento: avaliação → aprovações → execução |
| `OverridePanel` | P4 | Override com justificativa obrigatória (≥20 chars) |
| `AutoApprovalBadge` | P4 | Indicador de auto-aprovação por escopo |

#### MOD-010 MCP Automação

| Componente | Página | Funcionalidade |
|-----------|--------|----------------|
| `AgentForm` | P5 | Criar/editar agente: nome, scopes (com blocklist visual), phase2 toggle |
| `AgentCard` | P5 | Card: nome, status, scopes, última execução |
| `ApiKeyDisplay` | P5 | Exibição one-time da API key com copy |
| `McpGatewayLog` | P5 | Tabela de execuções: 8 steps com status visual |
| `ExecutionPolicyBadge` | P5 | DIRECT (verde), CONTROLLED (amarelo), EVENT_ONLY (roxo) |
| `BlocklistWarning` | P5 | Alerta visual quando scope cai na blocklist |
| `ScopeSelector` | P5 | Multi-select de scopes com blocklist Phase 1/Phase 2 visual |

#### MOD-011 SmartGrid

| Componente | Página | Funcionalidade |
|-----------|--------|----------------|
| `SmartGridHeader` | P5 | Header com export/import JSON + contadores |
| `SmartDataGrid` | P5 | Grid editável inline com RowStatusIcon |
| `RowStatusIcon` | P5 | ✅ válida, ⚠️ alerta, ❌ bloqueante |
| `MassActionToolbar` | P5 | Toolbar: aplicar valor, limpar coluna, duplicar |
| `SmartEditForm` | P5 | Modal de edição individual com avaliação do motor |
| `DeleteConfirmationPanel` | P5 | Painel de exclusão com motivo obrigatório |
| `DeleteResultFeedback` | P5 | Resumo: "X excluídos, Y bloqueados" |
| `BlockedRecordMessage` | P5 | Mensagem inline com motivo da restrição |

---

## 3. Mapeamento Página → Componentes

### P0 — Login

```
LoginPage
├── LoginPanel
│   ├── Logo (A1 laranja)
│   ├── FormField (email)
│   ├── FormField (password)
│   ├── Button[primary] → "Entrar"
│   └── Link → "Esqueci minha senha"
├── ForgotPanel
│   ├── FormField (email)
│   └── Button[secondary] → "Enviar link"
└── ResetPanel
    ├── FormField (nova senha) + PasswordStrength
    ├── FormField (confirmar)
    └── Button[primary] → "Redefinir"
```

### P1 — Estrutura Organizacional

```
AppShell
├── Topbar (breadcrumb: "Organização / Estrutura Organizacional")
├── Sidebar (item ativo: "Estrutura Org." com borda laranja)
└── ContentArea
    ├── PageHeader
    │   ├── Title → "Estrutura Organizacional"
    │   ├── Pill[N1] + Pill[N2] + Pill[N3] + Pill[N4] + Pill[N5] (legenda)
    │   └── SearchBar
    └── OrgTreeView
        └── TreeNode (recursivo, 5 níveis)
            ├── Dot (cor por nível)
            ├── Chevron (expand/collapse)
            ├── Nome (peso tipográfico por nível)
            ├── Badge → "N2 · ACTIVE"
            └── OrgNodeActions → "+ Filho" | "Editar" | "Vincular Tenant"
```

### P2 — Modelagem de Processos

```
AppShell
├── Topbar (breadcrumb: "Processos / Ciclos / Ciclo de Compras v1" + Badge[PUBLISHED])
├── Sidebar (item ativo: "Ciclos")
└── ContentArea
    ├── CycleHeader
    │   ├── Badge[status]
    │   └── Actions → "Fork" | "Deprecate"
    ├── FlowCanvas
    │   ├── StageNode[] (posicionados por canvasX/canvasY)
    │   ├── GateIcon[] (por tipo)
    │   └── FlowEdge[] (transições)
    └── MacroStagePanel (lateral)
```

### P3 — Execução de Casos

```
AppShell
├── Topbar (breadcrumb: "Casos / Pedido #1234")
├── Sidebar (item ativo: "Casos")
└── ContentArea
    ├── CaseDetail
    │   ├── CaseStatusBar (progresso visual)
    │   ├── GateResolverPanel
    │   └── AssignmentPanel
    └── CaseTimeline (vertical, append-only)
```

### P4 — Aprovação & Integração Protheus

```
AppShell
├── Topbar
├── Sidebar
└── ContentArea
    ├── ApprovalInbox (cards pendentes)
    │   └── ApprovalCard[] → Aprovar/Rejeitar
    ├── MovementTimeline
    └── OutboxMonitor (status de integrações)
```

### P5 — MCP Automação & SmartGrid

```
AppShell
├── Topbar
├── Sidebar
└── ContentArea
    ├── AgentForm / AgentCard[]
    │   └── ScopeSelector + BlocklistWarning
    ├── McpGatewayLog
    └── SmartDataGrid
        ├── SmartGridHeader (export/import)
        ├── MassActionToolbar
        └── Rows com RowStatusIcon
```

---

## 4. Padrões de UI

### 4.1 Padrão: Status → Cor (Global)

Todos os módulos seguem o mesmo mapeamento de status para cores:

| Status | Cor | Badge Style |
|--------|-----|-------------|
| ACTIVE, APPROVED, RESOLVED, SUCCESS, EXECUTED | `success` | Texto verde + bg verde claro |
| DRAFT, PENDING, PENDING_APPROVAL, ON_HOLD, QUEUED, RUNNING | `warning` | Texto laranja + bg laranja claro |
| BLOCKED, REJECTED, CANCELLED, FAILED, DLQ | `error` | Texto vermelho + bg vermelho claro |
| PUBLISHED, DISPATCHED, REPROCESSED | `info` | Texto azul + bg azul claro |
| INACTIVE, DEPRECATED, EXPIRED, REVOKED | `neutral` | Texto cinza + bg cinza claro |
| CONTROLLED, EVENT_ONLY, DELEGATED | `purple` | Texto roxo + bg roxo claro |
| OVERRIDDEN | `warning` | Texto laranja + borda tracejada |
| AUTO_APPROVED | `success` | Texto verde + ícone ⚡ |
| WAIVED | `neutral` | Texto cinza + ícone 🔓 |

### 4.2 Padrão: Imutabilidade Visual

Campos imutáveis após criação (padrão recorrente nos módulos):

- **OrgUnit:** `codigo`, `nivel`, `parent_id` → Mostrar como texto estático (sem input) no modo edição
- **ProcessCycle PUBLISHED:** Stages/gates não editáveis → Desabilitar todos os controles, mostrar badge "Congelado"
- **MCP Agent:** `codigo` → Campo read-only com ícone de cadeado
- **BehaviorRoutine PUBLISHED:** Items não editáveis → Mesma abordagem do ciclo

**Componente recomendado:** `ReadOnlyField` com ícone 🔒 e tooltip "Imutável após criação"

### 4.3 Padrão: Soft-Delete + Restore

Presente em MOD-003 (OrgUnit), MOD-004 (OrgScope), e outros:

- Item inativo: opacidade 60%, badge INACTIVE
- Botão "Restaurar" disponível se pai estiver ACTIVE
- Confirmação via `ConfirmationModal` com warning sobre dependências

### 4.4 Padrão: Fork / Versionamento

Presente em MOD-005 (ProcessCycle) e MOD-007 (BehaviorRoutine):

- Ação "Fork" cria nova versão DRAFT baseada no PUBLISHED
- UI: badge "v2 (baseado em v1)" com link para versão anterior
- Versão anterior é auto-deprecada ao publicar nova

### 4.5 Padrão: Gate Resolution

Fluxo recorrente em MOD-005/006:

1. Gate PENDING → ícone ⏳ amarelo
2. Ação: Aprovar (✅), Rejeitar (❌), ou Dispensar (🔓 + motivo ≥20 chars)
3. Gate RESOLVED → ícone ✅ verde
4. Gate bloqueante impede transição de stage → indicador visual forte

### 4.6 Padrão: Avaliação do Motor (MOD-007 → MOD-011)

Resposta do motor mapeada para UI:

| Resposta | Ícone | Comportamento |
|----------|-------|---------------|
| `blocking_validations` | ❌ | Linha desabilitada, save bloqueado |
| `validations` (warning) | ⚠️ | Warning visual, save permitido |
| Sem violações | ✅ | Linha OK |
| Não avaliado | (vazio) | Save desabilitado até avaliar |

---

## 5. Priorização de Implementação (Ondas)

### Onda 0 — Foundation (Pré-requisito)

**Tokens + Primitivos:** Configurar Tailwind com tokens, Plus Jakarta Sans, variáveis CSS.

Componentes: `Button`, `Badge`, `StatusBadge`, `Input`, `Select`, `FormField`, `Toast`, `Modal`, `Spinner`, `Skeleton`, `Tooltip`, `Pagination`.

### Onda 1 — Shell + Auth

**Layout global + Login**

Componentes: `AppShell`, `Topbar`, `Sidebar`, `Breadcrumb`, `UserAvatar`, `ProfileWidget`, `LoginPanel`, `ForgotPanel`, `ResetPanel`, `PasswordStrength`.

Páginas: P0 (Login), A1 Dashboard.

### Onda 2 — Admin + Org

**Gestão de Usuários + Estrutura Organizacional**

Componentes: `DataTable`, `UsersTable`, `UserFormPage`, `DeactivateModal`, `CooldownButton`, `TreeView`, `TreeNode`, `OrgTreeView`, `OrgNodeActions`, `Pill`, `OrgNodeForm`, `SearchBar`, `FilterBar`.

Páginas: A1 Usuários, P1 (Estrutura Org).

### Onda 3 — Modelagem + Casos

**Modelagem de Processos + Execução de Casos**

Componentes: `FlowCanvas`, `FlowNode`, `FlowEdge`, `StageNode`, `GateIcon`, `CycleList`, `CycleHeader`, `MacroStagePanel`, `TransitionEditor`, `PublishGuard`, `CaseList`, `CaseDetail`, `CaseStatusBar`, `GateResolverPanel`, `CaseTimeline`, `TransitionButton`, `AssignmentPanel`, `Timeline`.

Páginas: P2, P3.

### Onda 4 — Aprovação + Integração

**Motor de Aprovação + Protheus**

Componentes: `ApprovalChain`, `ApprovalInbox`, `ApprovalCard`, `MovementTimeline`, `OverridePanel`, `ControlRuleEditor`, `ApprovalRuleChain`, `IntegrationServiceForm`, `FieldMappingEditor`, `OutboxMonitor`, `CallLogTable`, `ReprocessButton`, `RetryBadge`.

Páginas: P4.

### Onda 5 — MCP + SmartGrid

**Automação MCP + SmartGrid**

Componentes: `AgentForm`, `AgentCard`, `ApiKeyDisplay`, `McpGatewayLog`, `ExecutionPolicyBadge`, `BlocklistWarning`, `ScopeSelector`, `SmartDataGrid`, `SmartGridHeader`, `RowStatusIcon`, `MassActionToolbar`, `SmartEditForm`, `DeleteConfirmationPanel`, `DeleteResultFeedback`, `BlockedRecordMessage`.

Páginas: P5.

---

## 6. Dependências Técnicas Recomendadas

| Lib | Finalidade | Usado em |
|-----|-----------|----------|
| `tailwindcss` | Utility-first CSS | Tudo |
| `@fontsource/plus-jakarta-sans` | Fonte oficial | Tudo |
| `lucide-react` | Ícones consistentes | Sidebar, ações |
| `@tanstack/react-table` | DataTable headless | A1 Usuários, P3, P4, P5 |
| `reactflow` / `xyflow` | Flow canvas | P2: FlowCanvas |
| `framer-motion` | Animações | Toast, Modal, sidebar transitions |
| `react-hook-form` + `zod` | Formulários + validação | Todos os forms |
| `date-fns` | Formatação de datas PT-BR | Timelines, badges de expiração |
| `sonner` | Toast notifications | Respostas de API |

---

## 7. Armadilhas de Implementação

Extraídas diretamente dos diagramas e regras de negócio dos módulos:

1. **`nivel` e `parent_id` são imutáveis** (MOD-003) — O form de edição DEVE esconder esses campos. Se a hierarquia for errada, é preciso recriar.

2. **Ciclo PUBLISHED = imutável** (MOD-005) — Botão "Editar" desabilitado em ciclos publicados. Apenas Fork gera novo DRAFT.

3. **Gate bloqueante ≠ Gate informativo** (MOD-005/006) — APPROVAL/DOCUMENT/CHECKLIST com `required=true` bloqueiam transição. INFORMATIVE nunca bloqueia. UI precisa de ícone e cor distintos.

4. **MCP não pode aprovar** (MOD-010) — `canApprove=false` para TODOS os ActionTypes. Blocklist de `:approve`, `:delete`, `:sign`, `:execute` em Phase 1. A UI de criação de agentes deve esconder esses escopos.

5. **Delegação não re-delega** (MOD-004) — Quem recebeu delegação não pode re-delegar. Escopos delegados = subconjunto do delegador. UI valida antes do submit.

6. **Cycle snapshot congelado no Caso** (MOD-006, ADR-002) — Casos usam `cycleVersionId` (snapshot), não o ciclo atual. Se o ciclo for forkado, casos antigos continuam no fluxo original. A tela de caso deve mostrar a versão.

7. **Override requer justificativa ≥20 chars** (MOD-009) — Campo de texto com contador e validação client-side.

8. **CooldownButton 60s** (MOD-002) — Anti-spam no reenvio de convite. Timer client-side com disable visual.

---

## 8. Estrutura de Pastas Recomendada

```
src/
├── design-system/
│   ├── tokens/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── tailwind.config.ts
│   ├── primitives/
│   │   ├── Button/
│   │   ├── Badge/
│   │   ├── StatusBadge/
│   │   ├── Input/
│   │   ├── Select/
│   │   ├── FormField/
│   │   ├── Pill/
│   │   ├── Tag/
│   │   ├── Tooltip/
│   │   ├── Spinner/
│   │   └── Skeleton/
│   ├── composites/
│   │   ├── Toast/
│   │   ├── Modal/
│   │   ├── ConfirmationModal/
│   │   ├── SearchBar/
│   │   ├── FilterBar/
│   │   ├── Pagination/
│   │   ├── CooldownButton/
│   │   └── PasswordStrength/
│   ├── data/
│   │   ├── DataTable/
│   │   ├── TreeView/
│   │   ├── Timeline/
│   │   └── EmptyState/
│   └── layout/
│       ├── AppShell/
│       ├── Topbar/
│       ├── Sidebar/
│       ├── Breadcrumb/
│       └── UserAvatar/
├── modules/
│   ├── auth/           (MOD-000/001)
│   ├── users/          (MOD-002)
│   ├── org-structure/  (MOD-003)
│   ├── identity/       (MOD-004)
│   ├── process-modeling/ (MOD-005)
│   ├── case-execution/ (MOD-006)
│   ├── parametrization/ (MOD-007)
│   ├── protheus/       (MOD-008)
│   ├── approval/       (MOD-009)
│   ├── mcp/            (MOD-010)
│   └── smartgrid/      (MOD-011)
└── pages/
    ├── P0-Login/
    ├── P1-OrgStructure/
    ├── P2-ProcessModeling/
    ├── P3-CaseExecution/
    ├── P4-ApprovalIntegration/
    ├── P5-McpSmartGrid/
    ├── Dashboard/
    └── Users/
```
