# 60-MCP-Agents — Spec Definitiva

> **Rota:** `/automacao/agentes` | **Módulo:** MOD-010 | **Screen IDs:** UX-MCP-001, UX-MCP-002
> **Viewport:** 1440 × 900 px | **Font:** Plus Jakarta Sans
> **Referência:** UX-010.md (jornadas e fluxos de MCP e Automação Governada)

---

## 1. Decisões de Design (PO)

AppShell reutilizado, com sidebar adaptada para contexto de Integração:

| Item | Decisão |
|------|---------|
| Sidebar ativo | "MCP Agentes" (categoria INTEGRAÇÃO) |
| Breadcrumb | "Integração › MCP Agentes" |
| Topbar direita | "Admin ECF" / "A1 Engenharia" + avatar "AE" |
| Sidebar footer | Dot verde + "Servidor Online" |
| Layout conteúdo (UX-MCP-001) | **3-panel layout** com abas: Agentes, Catálogo de Ações, Permissões |
| Layout conteúdo (UX-MCP-002) | **Header métricas** (4 cards) + **Tabela de execuções** + **Detail panel** split-view |
| Botão primário | Azul `#2E86C1` ("+ Criar Agente") |
| Drawer | 480px slide-in da direita com overlay |

---

## 2. Sidebar — Variante Integração

```
Sidebar (240×836, fill #FFF, border-right 1px #E8E8E6)
├── "APROVAÇÃO"
│   └── Movimentos Controlados (inativo)
├── "INTEGRAÇÃO"
│   ├── Protheus (inativo)
│   └── MCP Agentes (ATIVO: bg #E3F2FD, text #2E86C1)
└── Footer: dot verde 8×8 #27AE60 + "Servidor Online" (text 12px #888888)
```

---

## 3. Cores (além do AppShell)

```
ACTIVE BADGE         text:#1E7A42  bg:#E8F8EF  border:#B5E8C9
REVOKED BADGE        text:#C0392B  bg:#FFEBEE  border:#F5C6CB
INACTIVE BADGE       text:#888888  bg:#F5F5F3  border:#E8E8E6
PENDING BADGE        text:#B8860B  bg:#FFF3E0  border:#FFE0B2
BLOCKED BADGE        text:#C0392B  bg:#FFEBEE  border:#F5C6CB
SUCCESS BADGE        text:#1E7A42  bg:#E8F8EF  border:#B5E8C9
FAILED BADGE         text:#E74C3C  bg:#FFEBEE  border:#F5C6CB
EVENT BADGE          text:#6C757D  bg:#F4F4F2  border:#E0E0DE
ESCALATION BADGE     text:#FFF     bg:#E74C3C  border:#C0392B
DIRECT POLICY        text:#1E7A42  bg:#E8F8EF  border:#B5E8C9
CONTROLLED POLICY    text:#B8860B  bg:#FFF3E0  border:#FFE0B2
EVENT_ONLY POLICY    text:#6C757D  bg:#F4F4F2  border:#E0E0DE
TABLE HEADER BG      #FAFAFA     Fundo do header da tabela
TABLE ROW HOVER      #F8F8F6     Hover nas linhas da tabela
TABLE BORDER         #F0F0EE     Bordas horizontais entre linhas
DRAWER OVERLAY       rgba(0,0,0,0.3)   Backdrop do drawer
DRAWER SHADOW        -4px 0 24px rgba(0,0,0,0.08)
MODAL OVERLAY        rgba(0,0,0,0.3)   Backdrop do modal
MODAL SHADOW         0 8px 32px rgba(0,0,0,0.12)
TAB ACTIVE BG        #2E86C1     Fundo aba ativa
TAB ACTIVE TEXT      #FFFFFF     Texto aba ativa
TAB INACTIVE BG      transparent
TAB INACTIVE TEXT    #888888     Texto aba inativa
METRIC CARD BG       #FFFFFF     Fundo dos cards de métrica
METRIC GREEN         #27AE60     Valor bom (>95%)
METRIC AMBER         #F39C12     Valor alerta (80-95%)
METRIC RED           #E74C3C     Valor crítico (<=80%)
ESCALATION BORDER    #E74C3C     Borda esquerda de linhas com escalação
API KEY BG           #F8F8F6     Fundo do campo API key
CHECKBOX ACTIVE      #2E86C1     Checkbox marcado
CHECKBOX BORDER      #E8E8E6     Checkbox desmarcado
MATRIX HEADER BG     #F8F8F6     Fundo do header da matriz
```

---

## 4. Tipografia (conteúdo específico)

```
PAGE HEADER
  "MCP Agentes"                    800  24px  #111111
  "Gerencie agentes e ações..."    400  13px  #888888
  "+ Criar Agente"                 700  13px  #FFFFFF  (botão azul)

TAB BAR
  Aba ativa                        700  13px  #FFFFFF  (bg azul)
  Aba inativa                      500  13px  #888888

SEARCH BAR
  Placeholder "Buscar..."         400  13px  #CCCCCC
  Valor digitado                   500  13px  #111111

TABLE HEADER
  "CÓDIGO" etc.                    700  10px  uppercase  ls:+0.8px  #888888

TABLE BODY
  Código                           600  13px  #333333
  Nome                             500  13px  #111111
  Owner                            400  13px  #888888
  Status badge                     700  10px  uppercase  (colorido)
  API Key hint "sk-...****"        400  12px  #888888  font-family:monospace
  Data/hora                        400  12px  #888888

METRIC CARDS (UX-MCP-002)
  Label "Total (24h)"              600  11px  uppercase  ls:+0.5px  #888888
  Valor numérico                   800  28px  #111111
  Sublabel "%"                     700  13px  (colorido por threshold)

DRAWER
  Título "Criar Agente"            700  18px  #111111
  Label campo "CÓDIGO"             700  10px  uppercase  ls:+0.8px  #888888
  Input text                       500  14px  #111111
  Input placeholder                400  14px  #CCCCCC
  Erro inline                      500  11px  #E74C3C
  "Salvar"                         700  13px  #FFFFFF
  "Cancelar"                       600  13px  #555555

MODAL API KEY
  Aviso "Esta chave será..."       600  13px  #E74C3C
  API Key monospace                500  14px  #111111  font-family:monospace
  Checkbox label                   500  13px  #333333
  "Copiar"                         700  13px  #2E86C1
  "Fechar"                         700  13px  #FFFFFF ou #CCCCCC (desabilitado)

DETAIL PANEL (UX-MCP-002)
  Título seção                     700  12px  uppercase  ls:+0.5px  #888888
  Campo label                      500  11px  #888888
  Campo valor                      500  13px  #333333
  JSON viewer                      400  12px  #333333  font-family:monospace
  Masked "***"                     400  12px  #CCCCCC  font-family:monospace
  Badge escalação                  700  11px  #FFFFFF  bg:#E74C3C

EMPTY STATE
  "Nenhum agente cadastrado."      600  16px  #888888
  "Criar primeiro agente"          700  13px  #2E86C1  (link/botão)

PERMISSIONS MATRIX
  Header agente                    600  12px  #333333
  Header ação                      600  10px  #888888  rotate:-45deg
  Checkbox                         —    16×16
```

---

## 5. Estrutura de Elementos

### View 1 — Gestão de Agentes e Ações (UX-MCP-001)

```
60-MCP-Agents-View1 (frame 1440×900)
│
├── Topbar (branca 64px)
│   ├── Logo A1 azul + "GRUPO A1" / "PORTAL INTERNO"
│   ├── Separador + Breadcrumb: "Integração" #888 › "MCP Agentes" #111 bold
│   └── Direita: "Admin ECF" / "A1 Engenharia" + avatar "AE"
│
├── Sidebar (240px, ativo: "MCP Agentes")
│   └── (mesma estrutura seção 2)
│
└── ContentArea (1200×836, fill #F5F5F3, padding:24px)
    │
    ├── PageHeader (group, flex justify-between, align-center)
    │   ├── Esquerda
    │   │   ├── "MCP Agentes" (24px 800 #111)
    │   │   └── "Gerencie agentes MCP, ações e permissões" (13px 400 #888, mt:4px)
    │   └── Direita
    │       └── BtnCriar (primary: r:8, fill #2E86C1, h:40, p:0 20px)
    │           └── "+ Criar Agente" (13px 700 #FFF)
    │
    ├── TabBar (flex, gap:0, mt:20px, border-bottom 2px #E8E8E6)
    │   ├── Tab "Agentes" (ATIVO: bg #2E86C1, text #FFF, r:6 6 0 0, p:10px 20px)
    │   ├── Tab "Catálogo de Ações" (inativo: text #888, p:10px 20px)
    │   └── Tab "Permissões" (inativo: text #888, p:10px 20px)
    │
    └── PanelContainer (flex, gap:0, mt:0)
        │
        ├── [Painel Agentes — quando tab "Agentes" ativo]
        │   │
        │   ├── ToolBar (flex justify-between, align-center, mt:16px)
        │   │   ├── SearchBar (w:320, h:40, r:8, border #E8E8E6, fill #FFF)
        │   │   │   ├── ÍconeLupa (16×16, stroke #CCC, x:12)
        │   │   │   └── "Buscar por nome ou código..." (placeholder, x:38)
        │   │   └── FilterGroup (flex, gap:8px)
        │   │       ├── FilterStatus (select: "Todos os Status")
        │   │       └── FilterOwner (select: "Todos os Owners")
        │   │
        │   └── AgentsTable (fill #FFF, r:12, border #E8E8E6, mt:16px)
        │       │
        │       ├── TableHeader (h:44, bg #FAFAFA, border-bottom 1px #F0F0EE, p:0 20px)
        │       │   ├── "CÓDIGO" (w:120)
        │       │   ├── "NOME" (w:flex)
        │       │   ├── "TIPO" (w:100)
        │       │   ├── "STATUS" (w:100)
        │       │   ├── "API KEY" (w:140)
        │       │   └── "AÇÕES" (w:100, text-align center)
        │       │
        │       ├── TableRow (h:52, border-bottom 1px #F0F0EE, p:0 20px, hover bg #F8F8F6)
        │       │   ├── Código "AGENT-01" (13px 600 #333)
        │       │   ├── Nome "Agente Comercial" (13px 500 #111)
        │       │   ├── Tipo "AUTOMATION" (badge cinza)
        │       │   ├── Badge "ACTIVE" (verde: text #1E7A42, bg #E8F8EF, r:4, p:2px 8px)
        │       │   ├── API Key "sk-...a3f4" (12px 400 #888, monospace)
        │       │   └── Ações (flex, gap:8px, justify center)
        │       │       ├── BtnEdit (pencil 16×16, stroke #888)
        │       │       ├── BtnRotateKey (key 16×16, stroke #888)
        │       │       └── BtnRevoke (shield-off 16×16, stroke #888)
        │       │
        │       ├── TableRow (repete para cada agente...)
        │       │   [Agente REVOKED: opacity:0.5, badge vermelho "REVOGADO"]
        │       │
        │       └── TableFooter (h:52, p:0 20px, flex justify-center)
        │           └── "Carregar mais" (13px 600 #2E86C1) — se has_more=true
        │
        ├── [Painel Catálogo de Ações — quando tab "Catálogo de Ações" ativo]
        │   │
        │   ├── ToolBar (flex justify-between, align-center, mt:16px)
        │   │   ├── SearchBar (w:320, h:40)
        │   │   ├── FilterGroup (flex, gap:8px)
        │   │   │   ├── FilterTipo (select: "Todos os Tipos")
        │   │   │   └── FilterPolitica (select: "Todas as Políticas")
        │   │   └── BtnCriarAcao (secondary: r:8, border #2E86C1, h:36, p:0 16px)
        │   │       └── "+ Nova Ação" (13px 600 #2E86C1)
        │   │
        │   └── ActionsCatalog (grid 3 colunas, gap:16px, mt:16px)
        │       │
        │       └── ActionCard (fill #FFF, r:12, border #E8E8E6, p:20px)
        │           ├── HeaderRow (flex justify-between)
        │           │   ├── Código "process:case:create" (11px 600 #333, monospace)
        │           │   └── PolicyBadge "DIRECT" (badge verde)
        │           ├── Nome "Criar Processo" (16px 600 #111, mt:8px)
        │           ├── Descrição "Cria um novo processo..." (12px 400 #888, mt:4px)
        │           ├── ScopesRow (flex, gap:4px, mt:12px, flex-wrap)
        │           │   └── ScopeChip "process:case:write" (10px 500 #555, bg #F5F5F3, r:4, p:2px 8px)
        │           └── FooterRow (flex justify-end, mt:12px)
        │               └── BtnEdit (pencil 14×14, stroke #888, hover #2E86C1)
        │
        └── [Painel Permissões — quando tab "Permissões" ativo]
            │
            └── PermissionsMatrix (fill #FFF, r:12, border #E8E8E6, mt:16px, overflow auto)
                │
                ├── MatrixHeader (sticky top:0, bg #F8F8F6)
                │   ├── Cell vazia (w:200, h:80)
                │   ├── ActionHeader "process:case:create" (w:60, h:80, text rotated -45deg, 10px 600 #888)
                │   ├── ActionHeader "process:case:read" (mesma estrutura)
                │   └── ... (uma coluna por ação)
                │
                ├── MatrixRow (h:44, border-bottom 1px #F0F0EE)
                │   ├── AgentLabel "AGENT-01 — Agente Comercial" (w:200, 12px 600 #333, p:0 12px)
                │   ├── Checkbox (16×16, checked: fill #2E86C1, unchecked: border #E8E8E6)
                │   ├── Checkbox (mesma estrutura)
                │   └── ... (uma célula por ação)
                │   [Agente REVOKED: linha desabilitada, checkboxes disabled, opacity:0.4]
                │
                └── MatrixRow (repete para cada agente...)
```

### View 2 — Monitor de Execuções MCP (UX-MCP-002)

```
60-MCP-Monitor-View2 (frame 1440×900)
│
├── Topbar (branca 64px)
│   ├── Logo A1 azul + "GRUPO A1" / "PORTAL INTERNO"
│   ├── Separador + Breadcrumb: "Integração" #888 › "Monitor MCP" #111 bold
│   └── Direita: "Admin ECF" / "A1 Engenharia" + avatar "AE"
│
├── Sidebar (240px, ativo: "MCP Agentes")
│   └── (mesma estrutura seção 2)
│
└── ContentArea (1200×836, fill #F5F5F3, padding:24px)
    │
    ├── PageHeader (group, flex justify-between, align-center)
    │   ├── "Monitor de Execuções MCP" (24px 800 #111)
    │   └── "Acompanhe em tempo real as execuções dos agentes" (13px 400 #888, mt:4px)
    │
    ├── MetricCards (grid 4 colunas, gap:16px, mt:20px)
    │   │
    │   ├── Card "Total (24h)" (fill #FFF, r:12, border #E8E8E6, p:20px)
    │   │   ├── Label "TOTAL (24H)" (11px 600 uppercase ls:+0.5px #888)
    │   │   └── Valor "1.247" (28px 800 #111)
    │   │
    │   ├── Card "Taxa de Sucesso" (fill #FFF, r:12, border #E8E8E6, p:20px)
    │   │   ├── Label "TAXA DE SUCESSO" (11px 600 uppercase ls:+0.5px #888)
    │   │   ├── Valor "94.2%" (28px 800 #F39C12)  [verde se >95%, ambar 80-95%, vermelho <=80%]
    │   │   └── Indicador (barra 100%×4, r:2, bg #F0F0EE, fill 94.2% #F39C12)
    │   │
    │   ├── Card "Pendentes" (fill #FFF, r:12, border #E8E8E6, p:20px)
    │   │   ├── Label "PENDENTES" (11px 600 uppercase ls:+0.5px #888)
    │   │   └── Valor "12" (28px 800 #F39C12)  [ambar se >0]
    │   │
    │   └── Card "Bloqueados" (fill #FFF, r:12, border #E8E8E6, p:20px)
    │       ├── Label "BLOQUEADOS" (11px 600 uppercase ls:+0.5px #888)
    │       ├── Valor "3" (28px 800 #E74C3C)  [vermelho se >0]
    │       └── EscalationBadge "2 Escaladas" (10px 700 #FFF, bg #E74C3C, r:10, p:2px 8px, ml:8px)
    │
    ├── FilterBar (flex, gap:12px, mt:20px, align-center)
    │   ├── SearchBar (w:280, h:40, r:8, border #E8E8E6, fill #FFF)
    │   │   └── "Buscar por correlation ID..." (placeholder)
    │   ├── FilterAgente (select, w:180, h:40)
    │   ├── FilterAcao (select, w:180, h:40)
    │   ├── FilterStatus (multi-select, w:180, h:40)
    │   └── DateRange (flex, gap:4px)
    │       ├── DateFrom (input date, w:140, h:40)
    │       └── DateTo (input date, w:140, h:40)
    │
    └── SplitView (flex, gap:0, mt:16px)
        │
        ├── ExecutionsTable (flex:1, fill #FFF, r:12 0 0 12, border #E8E8E6)
        │   │
        │   ├── TableHeader (h:44, bg #FAFAFA, border-bottom 1px #F0F0EE, p:0 20px)
        │   │   ├── "AGENTE" (w:120)
        │   │   ├── "AÇÃO" (w:140)
        │   │   ├── "STATUS" (w:120)
        │   │   ├── "INÍCIO" (w:140)
        │   │   ├── "DURAÇÃO" (w:80)
        │   │   └── "RESULTADO" (w:flex)
        │   │
        │   ├── TableRow (h:52, border-bottom 1px #F0F0EE, p:0 20px, hover bg #F8F8F6, cursor pointer)
        │   │   ├── Agente "AGENT-01" (13px 600 #333)
        │   │   ├── Ação "process:case:create" (13px 500 #111, monospace)
        │   │   ├── Badge "SUCESSO" (verde)
        │   │   ├── Início "31/03/2026 14:32:01" (12px 400 #888)
        │   │   ├── Duração "245ms" (12px 400 #888)
        │   │   └── Resultado "Processo criado: PROC-0042" (12px 400 #888, truncate)
        │   │
        │   ├── TableRow [Privilege Escalation]
        │   │   ├── (border-left: 3px solid #E74C3C)
        │   │   ├── Agente "AGENT-03" (13px 600 #333)
        │   │   ├── Ação "org:unit:delete" (13px 500 #111, monospace)
        │   │   ├── Badge "BLOQUEADO" (vermelho)
        │   │   ├── EscalationBadge "Escalada" (10px 700 #FFF, bg #E74C3C, r:4, p:2px 6px, ml:4px)
        │   │   ├── Início "31/03/2026 14:28:55" (12px 400 #888)
        │   │   ├── Duração "12ms" (12px 400 #888)
        │   │   └── Resultado "Escopo bloqueado" (12px 500 #E74C3C)
        │   │
        │   ├── TableRow (repete...)
        │   │
        │   └── TableFooter (h:52, p:0 20px, flex justify-center)
        │       └── "Carregar mais" (13px 600 #2E86C1)
        │
        └── [DetailPanel — quando linha selecionada] (w:40%, fill #FFF, r:0 12 12 0, border #E8E8E6, border-left 1px #E8E8E6)
            │
            ├── DetailHeader (h:56, p:0 20px, flex justify-between, align-center, border-bottom 1px #E8E8E6)
            │   ├── "Detalhe da Execução" (16px 700 #111)
            │   └── BtnFechar (X 18×18, stroke #888)
            │
            ├── DetailBody (overflow-y auto, p:20px)
            │   │
            │   ├── [EscalationAlert — se privilege_escalation]
            │   │   └── AlertBox (fill #FFEBEE, border 1px #F5C6CB, r:8, p:16px)
            │   │       ├── "TENTATIVA DE ESCALADA DE PRIVILÉGIO" (11px 700 #C0392B, uppercase)
            │   │       └── "Escopo tentado: org:unit:delete" (12px 400 #C0392B, mt:4px)
            │   │
            │   ├── StatusBadge grande (14px 700, p:6px 16px, r:6, mt:16px)
            │   │
            │   ├── Seção "Agente" (mt:20px)
            │   │   ├── SectionTitle "AGENTE" (10px 700 uppercase ls:+0.8px #888, mb:8px)
            │   │   ├── Campo "Código" → "AGENT-01" (flex between, h:28)
            │   │   ├── Campo "Nome" → "Agente Comercial"
            │   │   └── Campo "Owner" → "marcos.silva@a1.com.br"
            │   │
            │   ├── Seção "Ação" (mt:16px)
            │   │   ├── SectionTitle "AÇÃO"
            │   │   ├── Campo "Código" → "process:case:create"
            │   │   ├── Campo "Política" → Badge "DIRECT" (verde)
            │   │   └── Campo "Tipo" → "write"
            │   │
            │   ├── Seção "Execução" (mt:16px)
            │   │   ├── SectionTitle "EXECUÇÃO"
            │   │   ├── Campo "Correlation ID" → "corr-abc123..." (monospace, com ícone copiar)
            │   │   ├── Campo "Início" → "31/03/2026 14:32:01"
            │   │   ├── Campo "Duração" → "245ms"
            │   │   └── Campo "Status" → Badge "SUCESSO"
            │   │
            │   └── Seção "Payload" (mt:16px, accordion)
            │       ├── SectionTitle "PAYLOAD" (clicável, com chevron)
            │       ├── SubSeção "Request" (accordion item)
            │       │   └── JSONViewer (bg #F8F8F6, r:8, p:12px, monospace 12px)
            │       │       ├── "case_type": "standard"
            │       │       ├── "api_key": "***"  ← mascarado
            │       │       └── "data": { ... }
            │       └── SubSeção "Response" (accordion item)
            │           └── JSONViewer (mesma estrutura)
            │               ├── "id": "proc-0042"
            │               ├── "status": "created"
            │               └── "sensitive_field": "***"  ← mascarado
            │
            └── [DetailFooter — se CONTROLLED_PENDING]
                └── BtnVerInbox (primary, w:100%, h:40, mt:16px)
                    └── "Ver no inbox de aprovações" (13px 700 #FFF)
```

---

## 6. Drawer (Create/Edit Agente)

```
DrawerOverlay (fixed, inset 0, bg rgba(0,0,0,0.3), z:50)
│
└── DrawerPanel (480px×100vh, fill #FFF, right:0, shadow -4px 0 24px rgba(0,0,0,0.08))
    │
    ├── DrawerHeader (h:64, border-bottom 1px #E8E8E6, p:0 24px, flex align-center justify-between)
    │   ├── Título "Criar Agente" ou "Editar Agente" (18px 700 #111)
    │   └── BtnFechar (X 20×20, stroke #888, hover #333, cursor pointer)
    │
    ├── DrawerBody (flex-1, overflow-y auto, p:24px)
    │   │
    │   ├── CampoCodigo
    │   │   ├── Label "CÓDIGO" (10px 700 uppercase ls:+0.8px #888, mb:6px)
    │   │   ├── Input (w:100%, h:42, r:8, border #E8E8E6, p:10px 14px, font 14px 500 #111)
    │   │   │   └── [Modo edição: ReadOnlyField — fill #F8F8F6, border #F0F0EE, cursor default]
    │   │   └── [Erro] "Já existe um agente com este código neste tenant." (11px 500 #E74C3C, mt:4px)
    │   │
    │   ├── CampoNome (mt:16px)
    │   │   ├── Label "NOME"
    │   │   ├── Input (mesma estrutura)
    │   │   └── [Erro] (mesma estrutura)
    │   │
    │   ├── CampoOwner (mt:16px)
    │   │   ├── Label "OWNER"
    │   │   └── Autocomplete (w:100%, h:42, r:8, border #E8E8E6)
    │   │       └── placeholder "Buscar usuário..." (14px 400 #CCC)
    │   │
    │   ├── CampoScopes (mt:16px)
    │   │   ├── Label "ESCOPOS PERMITIDOS"
    │   │   ├── MultiSelect (w:100%, min-h:42, r:8, border #E8E8E6)
    │   │   │   └── ScopeChips (flex wrap, gap:4px)
    │   │   │       └── Chip "process:case:read" (bg #E3F2FD, text #2E86C1, r:4, p:2px 8px, × close)
    │   │   └── [Erro escopo bloqueado] "Escopo bloqueado para agentes MCP: {scope}" (11px 500 #E74C3C)
    │   │
    │   └── [Banner REVOKED — modo edição de agente revogado]
    │       └── AlertBanner (fill #FFEBEE, border 1px #F5C6CB, r:8, p:12px)
    │           └── "Agente revogado — somente leitura." (13px 500 #C0392B)
    │
    └── DrawerFooter (h:72, border-top 1px #E8E8E6, p:16px 24px, flex justify-end gap:12px)
        ├── BtnCancelar (h:40, r:8, border #E8E8E6, p:0 20px, bg #FFF)
        │   └── "Cancelar" (13px 600 #555)
        └── BtnSalvar (h:40, r:8, fill #2E86C1, p:0 20px)
            └── "Salvar" (13px 700 #FFF)
```

---

## 7. Modal API Key

```
ModalOverlay (fixed, inset 0, bg rgba(0,0,0,0.3), z:60, flex center)
│
└── ModalCard (w:520, r:12, fill #FFF, shadow 0 8px 32px rgba(0,0,0,0.12), p:24px)
    │
    ├── ÍconeKey (48×48, r:50%, bg #FFF3E0, stroke #F39C12, centrado)
    │
    ├── Título "Chave de API Gerada" (18px 700 #111, mt:16px, text-align center)
    │
    ├── Aviso (mt:8px, text-align center)
    │   └── "Esta chave será exibida apenas uma vez. Copie-a agora."
    │       (13px 600 #E74C3C)
    │
    ├── ApiKeyField (mt:16px, fill #F8F8F6, r:8, p:14px, flex justify-between align-center, border 1px #E8E8E6)
    │   ├── Key "sk-mcp-a1b2c3d4e5f6...****" (14px 500 #111, monospace, user-select:all)
    │   └── BtnCopiar (p:6px 12px, r:6, border #2E86C1, bg transparent)
    │       └── "Copiar" (12px 700 #2E86C1) → após clicar: "Copiado!" (12px 700 #27AE60)
    │
    ├── CheckboxRow (mt:16px, flex align-center gap:8px)
    │   ├── Checkbox (16×16, r:4, border #E8E8E6, checked: fill #2E86C1)
    │   └── "Copiei e armazenei a chave com segurança" (13px 500 #333)
    │
    └── BtnFechar (mt:20px, w:100%, h:40, r:8, fill #2E86C1 ou #E8E8E6, text-align center)
        └── "Fechar" (13px 700 #FFF ou #CCC)
        [Desabilitado até checkbox marcado. Tooltip: "Confirme que copiou a chave antes de fechar."]
```

---

## 8. Modal Revogar Agente

```
ModalOverlay (fixed, inset 0, bg rgba(0,0,0,0.3), z:60, flex center)
│
└── ModalCard (w:480, r:12, fill #FFF, shadow 0 8px 32px rgba(0,0,0,0.12), p:24px)
    │
    ├── ÍconeWarning (48×48, r:50%, bg #FFEBEE, stroke #E74C3C, centrado)
    │
    ├── Título "Revogar agente?" (18px 700 #111, mt:16px, text-align center)
    │
    ├── Mensagem (mt:8px, text-align center)
    │   └── "Revogar o agente **{nome}**? Esta ação é irreversível."
    │       (13px 400 #555, **{nome}** em 600 #111)
    │
    ├── CampoMotivo (mt:16px)
    │   ├── Label "MOTIVO DA REVOGAÇÃO" (10px 700 uppercase ls:+0.8px #888, mb:6px)
    │   └── Textarea (w:100%, h:80, r:8, border #E8E8E6, p:10px 14px)
    │       └── placeholder "Informe o motivo (mínimo 10 caracteres)..." (14px 400 #CCC)
    │
    └── BotõesRow (mt:20px, flex justify-center, gap:12px)
        ├── BtnCancelar (h:40, r:8, border #E8E8E6, p:0 20px)
        │   └── "Cancelar" (13px 600 #555)
        └── BtnRevogar (h:40, r:8, fill #E74C3C, p:0 20px)
            └── "Revogar definitivamente" (13px 700 #FFF)
            [Desabilitado se motivo < 10 caracteres]
```

---

## 9. Estados da Tela

### Loading (Skeleton) — UX-MCP-001

```
AgentsTable
├── TableHeader (normal)
└── SkeletonRows (5×)
    ├── Rect 80×14 r:4 bg:#E8E8E6 animate pulse  (código)
    ├── Rect 160×14 r:4 bg:#E8E8E6 animate pulse  (nome)
    ├── Rect 80×20 r:4 bg:#E8E8E6 animate pulse   (tipo)
    ├── Rect 50×20 r:4 bg:#E8E8E6 animate pulse    (status)
    ├── Rect 100×14 r:4 bg:#E8E8E6 animate pulse   (api key)
    └── Rect 60×14 r:4 bg:#E8E8E6 animate pulse    (ações)
```

### Loading (Skeleton) — UX-MCP-002

```
MetricCards
├── Card (4×)
│   ├── Rect 80×10 r:4 bg:#E8E8E6 animate pulse  (label)
│   └── Rect 60×28 r:4 bg:#E8E8E6 animate pulse  (valor)

ExecutionsTable
├── TableHeader (normal)
└── SkeletonRows (8×)
    ├── Rect 80×14 r:4 bg:#E8E8E6 animate pulse
    ├── Rect 120×14 r:4 bg:#E8E8E6 animate pulse
    ├── Rect 60×20 r:4 bg:#E8E8E6 animate pulse
    ├── Rect 120×14 r:4 bg:#E8E8E6 animate pulse
    ├── Rect 50×14 r:4 bg:#E8E8E6 animate pulse
    └── Rect 140×14 r:4 bg:#E8E8E6 animate pulse
```

### Empty State — Agentes

```
EmptyContainer (flex-col, align-center, p:60px)
├── Ilustração (120×120, ícone robot/agent, stroke #CCC, fill none)
├── "Nenhum agente cadastrado." (16px 600 #888, mt:16px)
├── "Crie o primeiro agente MCP para iniciar automações." (13px 400 #AAA, mt:4px)
└── BtnCriar (primary, mt:16px)
    └── "Criar primeiro agente" (13px 700 #FFF)
```

### Empty State — Execuções

```
EmptyContainer (flex-col, align-center, p:60px)
├── Ilustração (120×120, ícone activity/monitor, stroke #CCC, fill none)
├── "Nenhuma execução MCP registrada nas últimas 24h." (16px 600 #888, mt:16px)
└── "As execuções aparecerão aqui automaticamente." (13px 400 #AAA, mt:4px)
```

### Empty Search

```
EmptySearchContainer (flex-col, align-center, p:40px)
├── Ícone search (48×48, stroke #CCC)
├── "Nenhum resultado para '{search}'." (14px 500 #888, mt:12px)
└── "Limpar filtros" (13px 600 #2E86C1, cursor pointer, mt:4px)
```

### Error State

```
ErrorContainer (flex-col, align-center, p:40px)
├── Ícone alert-triangle (48×48, stroke #E74C3C)
├── "Não foi possível carregar os dados." (14px 500 #888, mt:12px)
└── BtnRetry (secondary, mt:12px)
    └── "Tentar novamente" (13px 600 #555)
```

---

## 10. Medidas

```
Content area          1200×836    fill:#F5F5F3  padding:24px
Page header           auto×auto   flex justify-between
Tab bar               auto×44     border-bottom:2px #E8E8E6
Search bar            320×40      r:8   border:1px #E8E8E6  fill:#FFF
Filter select         180×40      r:8   border:1px #E8E8E6  fill:#FFF
Table card            auto×auto   r:12  border:1px #E8E8E6  fill:#FFF
Table header          auto×44     bg:#FAFAFA  border-bottom:1px #F0F0EE
Table row             auto×52     border-bottom:1px #F0F0EE  hover:#F8F8F6
Table cell padding    0 20px
Metric card           auto×auto   r:12  border:1px #E8E8E6  fill:#FFF  padding:20px
Metric value          —           28px 800
Status badge          auto×auto   r:4   padding:2px 8px
Escalation badge      auto×auto   r:10  padding:2px 8px  bg:#E74C3C
Action icon           16×16       stroke:#888  hover:colored
Drawer                480×100vh   fill:#FFF  shadow:-4px 0 24px rgba(0,0,0,0.08)
Drawer header         auto×64     border-bottom:1px #E8E8E6
Drawer footer         auto×72     border-top:1px #E8E8E6
Input field           100%×42     r:8   border:1px #E8E8E6
Textarea              100%×80     r:8   border:1px #E8E8E6
API Key field         100%×auto   r:8   border:1px #E8E8E6  fill:#F8F8F6
Modal card (API key)  520×auto    r:12  shadow:0 8px 32px rgba(0,0,0,0.12)
Modal card (revoke)   480×auto    r:12  shadow:0 8px 32px rgba(0,0,0,0.12)
Checkbox              16×16       r:4
Action card           auto×auto   r:12  border:1px #E8E8E6  fill:#FFF  padding:20px
Matrix cell           60×44       flex center
Detail panel          40%×auto    fill:#FFF
JSON viewer           100%×auto   r:8   fill:#F8F8F6  padding:12px
Button primary        auto×40     r:8   fill:#2E86C1
Button secondary      auto×40     r:8   border:1px #E8E8E6
Button danger         auto×40     r:8   fill:#E74C3C
Empty illustration    120×120
```

---

## 11. Responsividade

### UX-MCP-001 — Gestão de Agentes

| Breakpoint | Comportamento |
|---|---|
| >= 1280px | 3 painéis com tabs. Tabela com todas as colunas. Drawer lateral 480px overlay |
| 1024-1279px | Tabs mantidas. Tabela com colunas reduzidas (ocultar "API Key"). Drawer 420px overlay |
| 768-1023px | Tabs mantidas. Tabela com scroll horizontal. Drawer 100% full-screen |
| < 768px | Tabs em accordion. Tabela em card-list (1 card por agente). Drawer 100% full-screen. ApiKeyModal fullscreen |

### UX-MCP-002 — Monitor de Execuções

| Breakpoint | Comportamento |
|---|---|
| >= 1280px | Header 4 cards grid 4×1. Tabela completa. Detail panel split-view 60/40 |
| 1024-1279px | Header 4 cards grid 2×2. Tabela com colunas reduzidas (ocultar "Duração"). Detail panel overlay 80% |
| 768-1023px | Header 2 cards por linha com scroll. Tabela scroll horizontal. Detail panel full-screen |
| < 768px | Header 2 cards por linha scroll. Tabela card-list. Detail panel fullscreen push navigation |

---

## 12. Componentes a Criar

| Componente | Descrição | Reutilização |
|------------|-----------|--------------|
| `mcp/McpAgentsPage` | Página principal com 3 abas (Agentes, Ações, Permissões) | Rota /automacao/agentes |
| `mcp/AgentsTable` | Tabela de agentes com status, api_key_hint, ações | McpAgentsPage |
| `mcp/AgentFormDrawer` | Drawer create/edit com campos código, nome, owner, scopes | McpAgentsPage |
| `mcp/ApiKeyModal` | Modal one-time API key com copy + checkbox confirmação | McpAgentsPage |
| `mcp/RevokeModal` | Modal confirmação de revogação com motivo obrigatório | McpAgentsPage |
| `mcp/RotateKeyModal` | Modal confirmação de rotação de chave | McpAgentsPage |
| `mcp/ActionsCatalog` | Grid de cards de ações filtráveis | McpAgentsPage |
| `mcp/PermissionsMatrix` | Matriz agente × ação com checkboxes | McpAgentsPage |
| `mcp/McpMonitorPage` | Página de monitor com métricas + tabela + detail panel | Rota /automacao/execucoes |
| `mcp/McpMonitorHeader` | 4 cards de métricas 24h com thresholds coloridos | McpMonitorPage |
| `mcp/McpExecutionsTable` | Tabela cursor-based de execuções com badges e filtros | McpMonitorPage |
| `mcp/McpExecutionDetailPanel` | Painel split-view com detalhes, payload JSON, alertas | McpMonitorPage |
| `mcp/EscalationAlert` | Bloco vermelho de alerta de privilege escalation | McpExecutionDetailPanel |

---

## 13. Checklist

- [ ] Sidebar: "MCP Agentes" ativo na categoria INTEGRAÇÃO
- [ ] Breadcrumb: "Integração > MCP Agentes"
- [ ] Page header com título + botão "+ Criar Agente"
- [ ] Tab bar com 3 abas: Agentes, Catálogo de Ações, Permissões
- [ ] **Tab Agentes:** Tabela com colunas Código, Nome, Tipo, Status, API Key (hint), Ações
- [ ] Status como badge colorido (ACTIVE verde, REVOKED vermelho, etc.)
- [ ] API key exibida apenas como hint "sk-...****" (monospace)
- [ ] Ações por agente: Editar (drawer), Rotacionar Key (modal), Revogar (modal)
- [ ] Agente REVOKED: linha com opacidade reduzida, ações desabilitadas
- [ ] **Tab Catálogo:** Grid de action cards com código, nome, política (badge), scopes
- [ ] **Tab Permissões:** Matriz agente × ação com checkboxes
- [ ] Drawer 480px com campos: código, nome, owner (autocomplete), scopes (multi-select)
- [ ] Campo código readonly no modo edição
- [ ] ApiKeyModal: chave monospace + botão Copiar + checkbox obrigatório + Fechar
- [ ] RevokeModal: aviso + campo motivo (min 10 chars) + botão vermelho
- [ ] RotateKeyModal: aviso amarelo + confirmação
- [ ] **Monitor (UX-MCP-002):** 4 metric cards (Total, Taxa Sucesso %, Pendentes, Bloqueados)
- [ ] Métricas com cores por threshold (verde >95%, ambar 80-95%, vermelho <=80%)
- [ ] Badge "Escaladas" vermelho pulsante quando privilege_escalation_attempts > 0
- [ ] Tabela execuções: Agente, Ação, Status, Início, Duração, Resultado
- [ ] Linha com privilege_escalation: borda esquerda vermelha + badge "Escalada"
- [ ] Detail panel split-view (40% largura) com seções: Agente, Ação, Execução, Payload
- [ ] Payload sanitizado com "***" masking + tooltip explicativo
- [ ] Botão "Ver no inbox de aprovações" para CONTROLLED_PENDING
- [ ] Search bar para busca por nome/código ou correlation_id
- [ ] Filtros: agente, ação, status, date range
- [ ] Paginação cursor-based: "Carregar mais"
- [ ] Empty state com ilustração + botão/texto
- [ ] Error state com botão "Tentar novamente"
- [ ] Loading skeleton (cards + linhas animadas)
- [ ] Responsividade: drawer/modal fullscreen em mobile, card-list em < 768px
