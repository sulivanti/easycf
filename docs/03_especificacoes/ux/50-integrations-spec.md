# 50-Integrations — Spec Definitiva

> **Rota:** `/integracoes/protheus` | **Módulo:** MOD-008 | **Screen IDs:** UX-INTEG-001, UX-INTEG-002
> **Viewport:** 1440 × 900 px | **Font:** Plus Jakarta Sans
> **Referência:** UX-008.md (jornadas e fluxos de integração Protheus)

---

## 1. Decisões de Design (PO)

AppShell reutilizado, com sidebar adaptada para contexto de integração:

| Item | Decisão |
|------|---------|
| Sidebar ativo | "Protheus" (categoria INTEGRAÇÃO) |
| Breadcrumb | "Integração › Protheus" |
| Topbar direita | "Admin ECF" / "A1 Engenharia" + avatar "AE" |
| Sidebar footer | Dot verde + "Servidor Online" |
| Layout conteúdo (UX-INTEG-001) | **Split-view:** lista de rotinas (280px) + editor com 3 abas (direita) |
| Layout conteúdo (UX-INTEG-002) | **Dashboard:** 4 cards de métricas + tabela de logs + split panel de detalhe |
| Botão primário | Azul `#2E86C1` |
| Status badges | DRAFT=âmbar, PUBLISHED=verde |

---

## 2. Sidebar — Variante Integração

```
Sidebar (240×836, fill #FFF, border-right 1px #E8E8E6)
├── "APROVAÇÃO"
│   └── Movimentos Controlados (inativo)
├── "INTEGRAÇÃO"
│   ├── Protheus (ATIVO: bg #E3F2FD, text #2E86C1)
│   └── MCP Agentes (inativo)
└── Footer: dot verde 8×8 #27AE60 + "Servidor Online" (text 12px #888888)
```

---

## 3. Cores (além do AppShell)

```
DRAFT BADGE          text:#B8860B  bg:#FFF3E0  border:#FFE0B2
PUBLISHED BADGE      text:#1E7A42  bg:#E8F8EF  border:#B5E8C9
SUCCESS BADGE        text:#1E7A42  bg:#E8F8EF  border:#B5E8C9
FAILED BADGE         text:#C0392B  bg:#FFEBEE  border:#F5C6CB
DLQ BADGE            text:#FFFFFF  bg:#C0392B  border:#C0392B
QUEUED BADGE         text:#888888  bg:#F5F5F3  border:#E8E8E6
RUNNING BADGE        text:#2E86C1  bg:#E3F2FD  border:#90CAF9
PROD WARNING BG      #FFEBEE     Banner de ambiente produção
PROD WARNING BORDER  #F5C6CB
PROD WARNING TEXT    #C0392B
TAB ACTIVE           text:#2E86C1  border-bottom:2px #2E86C1
TAB INACTIVE         text:#888888  border-bottom:none
METRIC CARD BG       #FFFFFF     Cards de métricas
METRIC CARD BORDER   #E8E8E6
METRIC VALUE         #111111     Valor principal grande
METRIC LABEL         #888888     Label da métrica
DLQ COUNT BG         #FFEBEE     Card DLQ quando > 0
SPLIT LIST BG        #FFFFFF     Fundo lista de rotinas
SPLIT LIST BORDER    #E8E8E6     Borda direita da lista
SPLIT LIST ACTIVE    #E3F2FD     Rotina selecionada
CONNECTOR LINE       #2E86C1     Linhas de mapeamento source→target
DRAG HANDLE          #CCCCCC     Ícone de drag
MASKED VALUE         #888888     Texto "••••••" de valores sensíveis
TABLE HEADER BG      #FAFAFA
TABLE ROW HOVER      #F8F8F6
TABLE BORDER         #F0F0EE
DETAIL PANEL BG      #FFFFFF
DETAIL PANEL BORDER  #E8E8E6
JSON VIEWER BG       #F8F8F6     Fundo do bloco JSON
SEARCH ICON          #CCCCCC
```

---

## 4. Tipografia (conteúdo específico)

```
PAGE HEADER
  "Editor de Rotinas" / "Monitor"   800  24px  #111111
  "Gerencie rotinas de integração"  400  13px  #888888

ROUTINE LIST (280px)
  Nome da rotina                    600  13px  #111111
  Serviço destino                   400  11px  #888888
  Versão "v3"                       600  10px  #888888
  Status badge "DRAFT"              700  10px  uppercase  (âmbar)
  Status badge "PUBLISHED"          700  10px  uppercase  (verde)

TAB BAR
  Tab ativa                         700  13px  #2E86C1
  Tab inativa                       500  13px  #888888

EDITOR FIELDS
  Label "MÉTODO HTTP" etc.          700  10px  uppercase  ls:+0.8px  #888888
  Input text                        500  14px  #111111
  Input placeholder                 400  14px  #CCCCCC
  Erro inline                       500  11px  #E74C3C

MAPPING TABLE
  Campo origem                      500  13px  #111111
  Seta "→"                          400  16px  #CCCCCC
  Campo destino                     500  13px  #111111
  Tipo badge "FIELD"                700   9px  uppercase  #2E86C1
  Tipo badge "FIXED_VALUE"          700   9px  uppercase  #8E44AD
  Tipo badge "DERIVED"              700   9px  uppercase  #E67E22
  Expressão                         400  12px  #555555  font-family:monospace

PARAMS LIST
  Chave param                       600  13px  #111111
  Valor mascarado "••••••"          400  13px  #888888
  Tooltip sensível                  400  11px  #555555

METRIC CARDS
  Valor "98.5%"                     800  28px  #111111
  Label "Taxa de Sucesso"           500  12px  #888888

LOG TABLE
  ID curto                          500  12px  #333333  font-family:monospace
  Rotina nome                       500  13px  #111111
  Duração "340ms"                   400  12px  #888888
  Timestamp relativo                400  12px  #888888

DETAIL PANEL
  Section title "Request"           700  14px  #111111
  JSON code                         400  12px  #333333  font-family:monospace
  Masked value "***"                400  12px  #C0392B  font-family:monospace

BUTTONS
  "Testar HML"                      600  13px  #555555  (secondary)
  "Publicar"                        700  13px  #FFFFFF  (primary)
  "Nova Versão"                     600  13px  #2E86C1  (outline)
  "Reprocessar"                     700  13px  #FFFFFF  (danger)
```

---

## 5. View 1 — Editor de Rotinas de Integração (UX-INTEG-001)

### 5.1 Estrutura de Elementos

```
50-IntegrationEditor (frame 1440×900)
│
├── Topbar (branca 64px)
│   ├── Logo A1 azul + "GRUPO A1" / "PORTAL INTERNO"
│   ├── Separador + Breadcrumb: "Integração" #888 › "Protheus" #111 bold
│   └── Direita: "Admin ECF" / "A1 Engenharia" + avatar "AE"
│
├── Sidebar (240px, ativo: "Protheus")
│   └── (mesma estrutura seção 2)
│
└── ContentArea (1200×836, fill #F5F5F3, padding:0)
    │
    ├── ContentHeader (h:64, bg:#FFF, border-bottom 1px #E8E8E6, p:0 24px, flex align-center justify-between)
    │   ├── Esquerda (flex align-center gap:12px)
    │   │   ├── RoutineName "CTB-001 — Lançamento Contábil" (18px 700 #111)
    │   │   └── StatusBadge "DRAFT" (âmbar) ou "PUBLISHED" (verde)
    │   └── Direita (flex gap:8px)
    │       ├── BtnTest (secondary: r:8, border #E8E8E6, h:36, p:0 16px)
    │       │   └── "Testar HML" (13px 600 #555)
    │       ├── BtnPublish (primary: r:8, fill #2E86C1, h:36, p:0 16px)
    │       │   └── "Publicar" (13px 700 #FFF)
    │       └── BtnFork (outline: r:8, border #2E86C1, h:36, p:0 16px)
    │           └── "Nova Versão" (13px 600 #2E86C1)
    │
    └── SplitView (flex, h:calc(836-64))
        │
        ├── RoutineList (w:280, bg:#FFF, border-right 1px #E8E8E6, overflow-y auto)
        │   │
        │   ├── ListHeader (h:48, p:0 16px, flex align-center justify-between, border-bottom 1px #E8E8E6)
        │   │   ├── "Rotinas" (13px 700 #111)
        │   │   └── BtnNova (+ icon 16×16, stroke #2E86C1, cursor pointer)
        │   │
        │   ├── SearchInput (m:12px, h:36, r:6, border #E8E8E6, p:0 12px 0 32px)
        │   │   ├── ÍconeLupa (14×14, stroke #CCC, x:10)
        │   │   └── placeholder "Buscar rotina..." (12px 400 #CCC)
        │   │
        │   ├── RoutineItem (p:12px 16px, border-bottom 1px #F0F0EE, cursor pointer, hover bg:#F8F8F6)
        │   │   ├── Row (flex justify-between align-center)
        │   │   │   ├── Nome "CTB-001" (13px 600 #111, truncate)
        │   │   │   └── StatusBadge "DRAFT" (9px 700 uppercase âmbar)
        │   │   └── Sub "Protheus HML → /WSRESTPV001" (11px 400 #888, mt:2px, truncate)
        │   │
        │   ├── RoutineItem.active (bg:#E3F2FD, border-left 3px #2E86C1)
        │   │   └── (mesma estrutura, nome em #2E86C1)
        │   │
        │   └── RoutineItem (repete...)
        │
        └── EditorPane (flex:1, bg:#F5F5F3, overflow-y auto)
            │
            ├── [ProdWarningBanner] (bg:#FFEBEE, border 1px #F5C6CB, p:12px 20px, m:16px 20px 0)
            │   └── "⚠ Atenção: esta rotina chamará o ambiente de PRODUÇÃO." (13px 600 #C0392B)
            │
            ├── TabBar (h:44, bg:#FFF, border-bottom 1px #E8E8E6, p:0 20px, flex gap:24px)
            │   ├── Tab.active "Configuração HTTP" (13px 700 #2E86C1, border-bottom 2px #2E86C1, pb:12px)
            │   ├── Tab "Mapeamentos de Campo" (13px 500 #888)
            │   └── Tab "Parâmetros" (13px 500 #888)
            │
            ├── [Tab 1 — Configuração HTTP] (p:20px)
            │   │
            │   ├── FieldGroup (flex gap:16px)
            │   │   ├── CampoServico (flex:1)
            │   │   │   ├── Label "SERVIÇO DE DESTINO" (10px 700 uppercase ls:+0.8px #888, mb:6px)
            │   │   │   └── Select (w:100%, h:42, r:8, border #E8E8E6)
            │   │   │       └── Options com badge: "PROTHEUS-PROD" (badge vermelho), "PROTHEUS-HML" (badge âmbar)
            │   │   └── CampoMetodo (w:160)
            │   │       ├── Label "MÉTODO HTTP"
            │   │       └── Select (GET, POST, PUT, PATCH, DELETE) default:POST
            │   │
            │   ├── CampoEndpoint (mt:16px)
            │   │   ├── Label "ENDPOINT TEMPLATE"
            │   │   ├── Input (w:100%, h:42, r:8, border #E8E8E6)
            │   │   │   └── placeholder "/WSRESTPV001/{recurso}"
            │   │   └── Preview "Preview: /WSRESTPV001/[resolvido em runtime]" (11px 400 #888, mt:4px)
            │   │
            │   ├── FieldGroup (flex gap:16px, mt:16px)
            │   │   ├── CampoTimeout (w:200)
            │   │   │   ├── Label "TIMEOUT (MS)"
            │   │   │   └── Input (placeholder "Padrão do serviço: 30000ms")
            │   │   ├── CampoRetryMax (w:160)
            │   │   │   ├── Label "RETRY MAX"
            │   │   │   └── Input (type:number, default:3, min:0, max:10)
            │   │   └── CampoBackoff (w:200)
            │   │       ├── Label "RETRY BACKOFF (MS)"
            │   │       ├── Input (default:1000)
            │   │       └── Hint "Dobra a cada tentativa" (11px 400 #888)
            │   │
            │   ├── CampoTrigger (mt:16px)
            │   │   ├── Label "DISPARAR QUANDO"
            │   │   └── MultiSelect (tags: case.stage_transitioned, case.opened, case.completed, case.cancelled)
            │   │
            │   ├── BtnRow (mt:24px, flex gap:8px)
            │   │   └── BtnSalvar (primary: r:8, fill #2E86C1, h:40, p:0 20px)
            │   │       └── "Salvar configuração" (13px 700 #FFF)
            │   │
            │   └── [TestResultPanel] (mt:16px, bg:#F8F8F6, r:8, border 1px #E8E8E6, p:16px)
            │       ├── Row (flex align-center gap:12px)
            │       │   ├── StatusBadge "200 OK" (verde) ou "503 Error" (vermelho)
            │       │   └── Duration "340ms" (12px 400 #888)
            │       └── ResponseBody (mt:8px, bg:#FFF, r:6, border 1px #E8E8E6, p:12px, font-family:monospace, 12px, max-h:200, overflow-y auto)
            │
            ├── [Tab 2 — Mapeamentos de Campo] (p:20px)
            │   │
            │   ├── MappingHeader (flex justify-between align-center, mb:16px)
            │   │   ├── "Mapeamentos de Campo" (16px 700 #111)
            │   │   └── BtnAdd (secondary: r:8, border #E8E8E6, h:36, p:0 16px)
            │   │       └── "+ Adicionar Mapeamento" (13px 600 #555)
            │   │
            │   ├── MappingArea (flex gap:24px)
            │   │   │
            │   │   ├── SourceColumn (flex:1, bg:#FFF, r:8, border 1px #E8E8E6)
            │   │   │   ├── ColumnHeader (h:40, bg:#FAFAFA, r:8 8 0 0, p:0 16px, border-bottom 1px #F0F0EE)
            │   │   │   │   └── "Campos Origem" (11px 700 uppercase #888)
            │   │   │   └── FieldList
            │   │   │       └── FieldItem (p:10px 16px, border-bottom 1px #F0F0EE, flex align-center gap:8px)
            │   │   │           ├── DragHandle (grip icon 12×12, stroke #CCC, cursor grab)
            │   │   │           ├── TypeBadge "FIELD" (9px 700 uppercase, p:2px 6px, r:4)
            │   │   │           └── FieldName "caso.numero_processo" (13px 500 #111)
            │   │   │
            │   │   ├── ConnectorArea (w:60, flex-col align-center justify-center)
            │   │   │   └── ConnectorLine (per mapping: seta → stroke #2E86C1, stroke-width:1.5)
            │   │   │
            │   │   └── TargetColumn (flex:1, bg:#FFF, r:8, border 1px #E8E8E6)
            │   │       ├── ColumnHeader (h:40, bg:#FAFAFA, r:8 8 0 0, p:0 16px, border-bottom 1px #F0F0EE)
            │   │       │   └── "Campos Destino" (11px 700 uppercase #888)
            │   │       └── FieldList
            │   │           └── FieldItem (p:10px 16px, border-bottom 1px #F0F0EE, flex align-center gap:8px)
            │   │               ├── FieldName "CT1_FILIAL" (13px 500 #111)
            │   │               ├── [ReqBadge] "req." (9px 600 #C0392B, bg:#FFEBEE, r:4, p:1px 6px)
            │   │               └── [CondBadge] "cond." (9px 600 #B8860B, bg:#FFF3E0, r:4, p:1px 6px)
            │   │
            │   └── TransformRow (mt:8px per mapping, bg:#F8F8F6, r:6, p:8px 12px)
            │       ├── Label "Transformação:" (11px 600 #888)
            │       └── Expression "UPPER(value)" (12px 400 #555, font-family:monospace)
            │
            └── [Tab 3 — Parâmetros] (p:20px)
                │
                ├── ParamsHeader (flex justify-between align-center, mb:16px)
                │   ├── "Parâmetros" (16px 700 #111)
                │   └── BtnAdd (secondary: r:8, border #E8E8E6, h:36, p:0 16px)
                │       └── "+ Adicionar Parâmetro" (13px 600 #555)
                │
                └── ParamsList (bg:#FFF, r:8, border 1px #E8E8E6)
                    ├── ParamHeader (h:40, bg:#FAFAFA, r:8 8 0 0, p:0 16px, border-bottom 1px #F0F0EE, flex)
                    │   ├── "CHAVE" (w:200, 11px 700 uppercase #888)
                    │   ├── "TIPO" (w:180)
                    │   ├── "VALOR" (flex:1)
                    │   └── "AÇÕES" (w:60, text-align center)
                    │
                    ├── ParamRow (h:48, p:0 16px, border-bottom 1px #F0F0EE, flex align-center)
                    │   ├── Chave "PROTHEUS_TOKEN" (13px 600 #111, w:200)
                    │   ├── TypeBadge "FIXED" (9px 700 uppercase, w:180)
                    │   ├── Valor "••••••" (13px 400 #888, flex:1)
                    │   │   └── [Tooltip] "Valor sensível — nunca exibido ou logado."
                    │   └── BtnDelete (trash 16×16, stroke #888, hover #E74C3C, w:60, text-align center)
                    │
                    ├── ParamRow (valor visível para não-sensíveis)
                    │   ├── Chave "EMPRESA_PADRAO" (13px 600 #111)
                    │   ├── TypeBadge "DERIVED_FROM_TENANT"
                    │   ├── Derivation "tenant.empresa_codigo" (13px 400 #555, font-family:monospace)
                    │   └── BtnDelete
                    │
                    └── ParamRow (repete...)
```

### 5.2 ReadonlyBanner (rotina PUBLISHED)

```
ReadonlyBanner (bg:#E3F2FD, border 1px #90CAF9, r:8, p:12px 20px, m:0 20px, flex align-center justify-between)
├── "Rotina publicada — use 'Nova versão' para editar." (13px 500 #2E86C1)
└── BtnNovaVersao (outline: r:6, border #2E86C1, h:32, p:0 12px)
    └── "Nova versão" (12px 600 #2E86C1)
```

### 5.3 ForkModal

```
ModalOverlay (fixed, inset 0, bg rgba(0,0,0,0.3), z:60, flex center)
│
└── ModalCard (w:480, r:12, fill #FFF, shadow 0 8px 32px rgba(0,0,0,0.12), p:24px)
    │
    ├── Título "Nova versão (fork)" (18px 700 #111)
    │
    ├── Mensagem (mt:8px)
    │   └── "Será criado um novo DRAFT com a configuração atual copiada." (13px 400 #555)
    │
    ├── CampoMotivo (mt:16px)
    │   ├── Label "MOTIVO DA MUDANÇA" (10px 700 uppercase ls:+0.8px #888, mb:6px)
    │   ├── Textarea (w:100%, h:80, r:8, border #E8E8E6, p:10px 14px)
    │   │   └── placeholder "Descreva o motivo (mín. 10 caracteres)"
    │   └── [Erro] "Motivo deve ter ao menos 10 caracteres." (11px 500 #E74C3C, mt:4px)
    │
    └── BotõesRow (mt:24px, flex justify-end, gap:12px)
        ├── BtnCancelar (h:40, r:8, border #E8E8E6, p:0 20px)
        │   └── "Cancelar" (13px 600 #555)
        └── BtnConfirmar (h:40, r:8, fill #2E86C1, p:0 20px)
            └── "Criar nova versão" (13px 700 #FFF)
```

### 5.4 TestConfirmModal

```
ModalOverlay (fixed, inset 0, bg rgba(0,0,0,0.3), z:60, flex center)
│
└── ModalCard (w:420, r:12, fill #FFF, shadow 0 8px 32px rgba(0,0,0,0.12), p:24px)
    │
    ├── ÍconeWarning (48×48, r:50%, bg #FFF3E0, stroke #E67E22, centrado)
    ├── Título "Testar em homologação?" (18px 700 #111, mt:16px, text-align center)
    ├── Mensagem (mt:8px, text-align center)
    │   └── "Este teste usará o serviço 'PROTHEUS-HML'. Continuar?" (13px 400 #555)
    └── BotõesRow (mt:24px, flex justify-center, gap:12px)
        ├── BtnCancelar (h:40, r:8, border #E8E8E6, p:0 20px)
        │   └── "Cancelar" (13px 600 #555)
        └── BtnTestar (h:40, r:8, fill #2E86C1, p:0 20px)
            └── "Executar teste" (13px 700 #FFF)
```

---

## 6. View 2 — Monitor de Integrações (UX-INTEG-002)

### 6.1 Estrutura de Elementos

```
50-IntegrationMonitor (frame 1440×900)
│
├── Topbar (branca 64px)
│   ├── Logo A1 azul + "GRUPO A1" / "PORTAL INTERNO"
│   ├── Separador + Breadcrumb: "Integração" #888 › "Monitor" #111 bold
│   └── Direita: "Admin ECF" / "A1 Engenharia" + avatar "AE"
│
├── Sidebar (240px, ativo: "Protheus")
│   └── (mesma estrutura seção 2)
│
└── ContentArea (1200×836, fill #F5F5F3, padding:24px)
    │
    ├── PageHeader (flex justify-between align-center)
    │   ├── Esquerda
    │   │   ├── "Monitor de Integrações" (24px 800 #111)
    │   │   └── "Acompanhe chamadas e reprocesse itens em DLQ" (13px 400 #888, mt:4px)
    │   └── Direita (flex align-center gap:8px)
    │       └── AutoRefreshBadge "Atualizando..." (12px 500 #2E86C1, opacity pulse animation)
    │
    ├── MetricCards (flex gap:16px, mt:20px)
    │   │
    │   ├── MetricCard (flex:1, bg:#FFF, r:12, border 1px #E8E8E6, p:20px)
    │   │   ├── Label "Taxa de Sucesso" (12px 500 #888)
    │   │   ├── Value "98.5%" (28px 800 #1E7A42, mt:4px)
    │   │   └── ProgressBar (w:100%, h:4, r:2, bg:#E8E8E6, mt:8px)
    │   │       └── Fill (w:98.5%, h:4, r:2, bg:#27AE60)
    │   │
    │   ├── MetricCard (flex:1)
    │   │   ├── Label "Total (24h)" (12px 500 #888)
    │   │   └── Value "1.247" (28px 800 #111, mt:4px)
    │   │
    │   ├── MetricCard (flex:1, bg:#FFEBEE quando count>0)
    │   │   ├── Label "Em DLQ" (12px 500 #888)
    │   │   ├── Value "3" (28px 800 #C0392B, mt:4px)
    │   │   └── DLQBadge "requer atenção" (10px 600 #C0392B)
    │   │
    │   └── MetricCard (flex:1)
    │       ├── Label "Latência Média" (12px 500 #888)
    │       └── Value "340ms" (28px 800 #111, mt:4px)
    │
    ├── Filters (flex gap:12px, mt:20px, flex-wrap:wrap, align-center)
    │   ├── SelectRotina (w:200, h:36, r:6, border #E8E8E6, font 12px)
    │   │   └── placeholder "Todas as rotinas"
    │   ├── SelectStatus (w:160, h:36, r:6, border #E8E8E6)
    │   │   └── options: ALL, QUEUED, RUNNING, SUCCESS, FAILED, DLQ
    │   ├── SelectServico (w:180, h:36, r:6, border #E8E8E6)
    │   │   └── placeholder "Todos os serviços"
    │   ├── InputCorrelation (w:240, h:36, r:6, border #E8E8E6)
    │   │   └── placeholder "Correlation ID"
    │   ├── DateRange (flex gap:8px)
    │   │   ├── InputDe (w:140, h:36, r:6, type:date)
    │   │   └── InputAte (w:140, h:36, r:6, type:date)
    │   └── BtnLimpar (h:36, r:6, p:0 12px, border #E8E8E6, bg:#FFF)
    │       └── "Limpar" (12px 600 #555)
    │
    ├── LogTable (bg:#FFF, r:12, border 1px #E8E8E6, mt:16px, overflow hidden)
    │   │
    │   ├── TableHeader (h:44, bg:#FAFAFA, border-bottom 1px #F0F0EE, p:0 20px, flex)
    │   │   ├── "STATUS" (w:100)
    │   │   ├── "ROTINA" (w:200)
    │   │   ├── "TIMESTAMP" (w:140)
    │   │   ├── "DURAÇÃO" (w:100)
    │   │   ├── "RETRY" (w:80)
    │   │   ├── "HTTP" (w:70)
    │   │   └── "AÇÕES" (w:80, text-align center)
    │   │
    │   ├── LogRow (h:52, p:0 20px, border-bottom 1px #F0F0EE, hover bg:#F8F8F6, cursor pointer)
    │   │   ├── StatusBadge "SUCCESS" (verde)
    │   │   ├── Rotina "CTB-001 v3" (13px 500 #111)
    │   │   ├── Timestamp "há 5min" (12px 400 #888)
    │   │   ├── Duration "340ms" (12px 400 #888)
    │   │   ├── Retry "1 de 3" (12px 400 #888)
    │   │   ├── HttpStatus "200" (12px 600 #1E7A42)
    │   │   └── BtnExpand (chevron-right 16×16, stroke #888)
    │   │
    │   ├── LogRow (DLQ example)
    │   │   ├── StatusBadge "DLQ" (vermelho escuro, bg #C0392B, text #FFF)
    │   │   ├── Rotina "FIN-002 v1" (13px 500 #111)
    │   │   ├── Timestamp "há 2h" (12px 400 #888)
    │   │   ├── Duration "15230ms" (12px 400 #E74C3C)
    │   │   ├── Retry "3 de 3" (12px 400 #E74C3C)
    │   │   ├── HttpStatus "503" (12px 600 #C0392B)
    │   │   └── BtnExpand
    │   │
    │   ├── LogRow (repete...)
    │   │
    │   └── TableFooter (h:52, p:0 20px, flex justify-between align-center)
    │       ├── "Exibindo 25 de 1.247 chamadas" (12px 400 #888)
    │       └── BtnCarregar "Carregar mais" (13px 600 #2E86C1, cursor pointer)
    │
    └── [DetailPanel] (aparece ao clicar em LogRow — split-view direita)
        │
        └── DetailSplit (w:480, bg:#FFF, border-left 1px #E8E8E6, shadow -4px 0 24px rgba(0,0,0,0.08))
            │
            ├── DetailHeader (h:56, p:0 20px, flex align-center justify-between, border-bottom 1px #E8E8E6)
            │   ├── "Detalhes da Chamada" (16px 700 #111)
            │   └── BtnFechar (X 18×18, stroke #888, hover #333)
            │
            ├── DetailBody (flex:1, overflow-y auto, p:20px)
            │   │
            │   ├── SectionResumo (mb:20px)
            │   │   ├── SectionTitle "Resumo" (14px 700 #111, mb:8px)
            │   │   ├── Row: "Rotina:" "CTB-001 v3" (13px)
            │   │   ├── Row: "Serviço:" "PROTHEUS-HML" (13px)
            │   │   ├── Row: "Status:" StatusBadge
            │   │   ├── Row: "Correlation ID:" "a1b2c3d4" (monospace, copy icon)
            │   │   └── Row: "Caso:" link "/casos/123" (13px 600 #2E86C1)
            │   │
            │   ├── SectionRequest (mb:20px, collapsible, open by default)
            │   │   ├── SectionTitle "Request" (14px 700 #111, flex align-center gap:8px)
            │   │   │   └── ChevronToggle (12×12, rotate on collapse)
            │   │   ├── MethodURL "POST /WSRESTPV001/MATA410" (13px 600 #333, bg:#F8F8F6, r:6, p:8px 12px)
            │   │   ├── Headers (mt:8px)
            │   │   │   ├── "Authorization: ***" (12px monospace #C0392B)
            │   │   │   │   └── [Tooltip] "Dado sensível mascarado por política de segurança."
            │   │   │   └── "Content-Type: application/json" (12px monospace #333)
            │   │   └── JSONViewer (mt:8px, bg:#F8F8F6, r:6, border 1px #E8E8E6, p:12px, max-h:200, overflow-y auto)
            │   │       └── JSON formatado (12px monospace #333)
            │   │
            │   ├── SectionResponse (mb:20px, collapsible, open by default)
            │   │   ├── SectionTitle "Response" + HttpStatus badge
            │   │   └── JSONViewer (mesma estrutura)
            │   │
            │   ├── [SectionErro] (mb:20px, collapsible, apenas FAILED/DLQ)
            │   │   ├── SectionTitle "Erro" (14px 700 #C0392B)
            │   │   └── ErrorMessage (13px 400 #333, bg:#FFEBEE, r:6, p:12px)
            │   │
            │   └── [SectionHistorico] (collapsible)
            │       ├── SectionTitle "Histórico de Tentativas"
            │       └── AttemptList
            │           ├── AttemptItem (flex align-center gap:8px, p:8px 0, border-bottom 1px #F0F0EE)
            │           │   ├── "Tentativa 1" (12px 600 #333)
            │           │   ├── StatusBadge (mini)
            │           │   ├── Date "31 mar 2026, 14:30" (12px 400 #888)
            │           │   └── Link "Ver" (12px 600 #2E86C1)
            │           └── AttemptItem (repete...)
            │
            └── DetailFooter (h:56, p:0 20px, border-top 1px #E8E8E6, flex align-center justify-end)
                └── [BtnReprocessar] (apenas DLQ: h:36, r:8, fill #E74C3C, p:0 16px)
                    └── "Reprocessar" (13px 700 #FFF)
```

### 6.2 Modal de Reprocessamento (DLQ)

```
ModalOverlay (fixed, inset 0, bg rgba(0,0,0,0.3), z:60, flex center)
│
└── ModalCard (w:480, r:12, fill #FFF, shadow 0 8px 32px rgba(0,0,0,0.12), p:24px)
    │
    ├── ÍconeWarning (48×48, r:50%, bg #FFEBEE, stroke #E74C3C, centrado)
    │
    ├── Título "Reprocessar chamada?" (18px 700 #111, mt:16px, text-align center)
    │
    ├── Mensagem (mt:8px, text-align center)
    │   └── "Será criada uma nova tentativa. O log original será preservado." (13px 400 #555)
    │
    ├── CampoMotivo (mt:16px)
    │   ├── Label "MOTIVO" (10px 700 uppercase ls:+0.8px #888, mb:6px)
    │   ├── Textarea (w:100%, h:80, r:8, border #E8E8E6, p:10px 14px, font 14px 400 #111)
    │   │   └── placeholder "Descreva o motivo do reprocessamento (mín. 10 caracteres)"
    │   └── [Erro] "Motivo deve ter ao menos 10 caracteres." (11px 500 #E74C3C, mt:4px)
    │
    └── BotõesRow (mt:24px, flex justify-center, gap:12px)
        ├── BtnCancelar (h:40, r:8, border #E8E8E6, p:0 20px, bg #FFF)
        │   └── "Cancelar" (13px 600 #555)
        └── BtnReprocessar (h:40, r:8, fill #E74C3C, p:0 20px)
            └── "Reprocessar" (13px 700 #FFF)
```

---

## 7. Estados da Tela

### UX-INTEG-001 — Editor

#### Loading (Skeleton)

```
RoutineList
├── SkeletonItems (6×)
│   ├── Rect 140×14 r:4 bg:#E8E8E6 animate pulse
│   └── Rect 100×10 r:4 bg:#E8E8E6 animate pulse (mt:4px)

EditorPane
├── SkeletonTab (3 rects 80×14 gap:24px)
└── SkeletonFields (4×)
    ├── Rect 100×10 r:4 bg:#E8E8E6 animate pulse (label)
    └── Rect 100%×42 r:8 bg:#E8E8E6 animate pulse (input)
```

#### Empty State (lista)

```
EmptyContainer (flex-col, align-center, p:60px, w:280)
├── Ícone integração (64×64, stroke #CCC)
├── "Nenhuma rotina de integração cadastrada." (14px 600 #888, mt:12px, text-align center)
└── BtnCriar (primary, mt:12px)
    └── "Criar primeira rotina" (13px 700 #FFF)
```

#### Readonly (PUBLISHED)

```
Todos os inputs com:
├── fill #F8F8F6
├── border #F0F0EE
├── cursor default
├── pointer-events none
ReadonlyBanner visível no topo do EditorPane
BtnPublish oculto, BtnFork visível
```

### UX-INTEG-002 — Monitor

#### Loading (Skeleton)

```
MetricCards (4×)
├── Rect 80×12 r:4 bg:#E8E8E6 animate pulse (label)
└── Rect 60×28 r:4 bg:#E8E8E6 animate pulse (value)

LogTable
├── TableHeader (normal)
└── SkeletonRows (8×)
    └── 7 rects por linha, animate pulse
```

#### Empty State

```
EmptyContainer (flex-col, align-center, p:60px)
├── Ícone monitor (80×80, stroke #CCC)
├── "Nenhuma chamada de integração registrada." (16px 600 #888, mt:16px)
└── "As chamadas aparecerão aqui automaticamente." (13px 400 #AAA, mt:4px)
```

#### Empty DLQ

```
EmptyDLQ (flex-col, align-center, p:40px)
├── Ícone check-circle (48×48, stroke #27AE60)
├── "Nenhuma chamada em DLQ. Tudo certo!" (14px 600 #1E7A42, mt:12px)
```

---

## 8. Medidas

```
Content area (INTEG-001)   1200×836    fill:#F5F5F3  padding:0
Content area (INTEG-002)   1200×836    fill:#F5F5F3  padding:24px
Routine list               280×772     fill:#FFF     border-right:1px #E8E8E6
Editor pane                920×772     fill:#F5F5F3  overflow-y:auto
Content header             auto×64     bg:#FFF       border-bottom:1px #E8E8E6
Tab bar                    auto×44     bg:#FFF       border-bottom:1px #E8E8E6
Metric card                auto×auto   r:12  border:1px #E8E8E6  fill:#FFF  p:20px
Filter select              varies×36   r:6   border:1px #E8E8E6
Log table                  auto×auto   r:12  border:1px #E8E8E6  fill:#FFF
Table header               auto×44     bg:#FAFAFA  border-bottom:1px #F0F0EE
Table row                  auto×52     border-bottom:1px #F0F0EE  hover:#F8F8F6
Detail panel               480×100%    fill:#FFF  border-left:1px #E8E8E6  shadow
Input field                100%×42     r:8   border:1px #E8E8E6
Select field               varies×42   r:8   border:1px #E8E8E6
Status badge               auto×auto   r:4   padding:2px 8px
Type badge                 auto×auto   r:4   padding:2px 6px
Modal card                 480×auto    r:12  shadow:0 8px 32px rgba(0,0,0,0.12)
Button primary             auto×40     r:8   fill:#2E86C1
Button secondary           auto×36     r:8   border:1px #E8E8E6
Button danger              auto×40     r:8   fill:#E74C3C
Routine item               280×auto    p:12px 16px
Routine item active        border-left:3px #2E86C1
Source/Target column        flex:1     r:8   border:1px #E8E8E6
Connector area             60×auto
Progress bar               100%×4      r:2
JSON viewer                auto×auto   r:6   max-h:200  overflow-y:auto
```

---

## 9. Componentes a Criar

| Componente | Descrição | Reutilização |
|------------|-----------|--------------|
| `integrations/IntegrationEditorPage` | Split-view: lista + editor 3 abas | Rota /integracoes/rotinas |
| `integrations/IntegrationRoutinesList` | Lista lateral 280px com busca e status | IntegrationEditorPage |
| `integrations/HttpConfigTab` | Aba config HTTP: serviço, método, endpoint, retry, trigger | IntegrationEditorPage |
| `integrations/FieldMappingsTab` | Aba mapeamentos: drag-and-drop source→target | IntegrationEditorPage |
| `integrations/IntegrationParamsTab` | Aba parâmetros: lista com mascaramento sensível | IntegrationEditorPage |
| `integrations/ProdWarningBanner` | Banner vermelho ambiente PROD | HttpConfigTab |
| `integrations/ReadonlyBanner` | Banner rotina publicada + botão nova versão | IntegrationEditorPage |
| `integrations/TestResultPanel` | Resultado inline: status, response, duration | HttpConfigTab |
| `integrations/EndpointPreview` | Preview do template de endpoint resolvido | HttpConfigTab |
| `integrations/ForkModal` | Modal fork com motivo obrigatório | IntegrationEditorPage |
| `integrations/TestConfirmModal` | Modal confirmação teste HML | IntegrationEditorPage |
| `integrations/IntegrationMonitorPage` | Dashboard: métricas + tabela + filtros | Rota /integracoes/monitor |
| `integrations/MonitorMetricCards` | 4 cards: success rate, total, DLQ, latência | IntegrationMonitorPage |
| `integrations/IntegrationLogsTable` | Tabela de logs com paginação cursor | IntegrationMonitorPage |
| `integrations/LogDetailPanel` | Split panel detalhe: resumo, request, response, erro, histórico | IntegrationMonitorPage |
| `integrations/ReprocessModal` | Modal reprocessamento DLQ com motivo | LogDetailPanel |
| `integrations/AutoRefreshIndicator` | Badge "Atualizando..." com pulse | IntegrationMonitorPage |
| `ui/JSONViewer` | Viewer JSON formatado com syntax highlight | LogDetailPanel, futuras telas |
| `ui/CollapsibleSection` | Seção colapsável com chevron | LogDetailPanel, futuras telas |

---

## 10. Checklist

- [ ] Sidebar: "Protheus" ativo na categoria INTEGRAÇÃO
- [ ] Breadcrumb: "Integração › Protheus" (editor) / "Integração › Monitor" (monitor)
- [ ] **UX-INTEG-001 — Editor:**
  - [ ] Split-view: lista 280px + editor direita
  - [ ] Lista de rotinas com busca, status badge, serviço destino
  - [ ] Item ativo com borda esquerda azul e fundo #E3F2FD
  - [ ] Content header com nome rotina + status + ações (Testar, Publicar, Fork)
  - [ ] 3 abas: Configuração HTTP, Mapeamentos de Campo, Parâmetros
  - [ ] Tab HTTP: serviço, método, endpoint template, timeout, retry, trigger events
  - [ ] Tab Mapeamentos: duas colunas drag-and-drop source→target com conectores
  - [ ] Tab Parâmetros: lista chave/tipo/valor com mascaramento sensível
  - [ ] ProdWarningBanner quando serviço PROD selecionado
  - [ ] ReadonlyBanner + inputs desabilitados quando PUBLISHED
  - [ ] TestResultPanel inline após teste HML
  - [ ] ForkModal com campo motivo (mín. 10 chars)
  - [ ] TestConfirmModal antes de executar teste
  - [ ] Empty state lista: "Nenhuma rotina cadastrada"
  - [ ] Loading skeleton na lista e campos
- [ ] **UX-INTEG-002 — Monitor:**
  - [ ] 4 cards de métricas: Taxa Sucesso (%), Total 24h, DLQ count, Latência média
  - [ ] Card DLQ com fundo vermelho quando count > 0
  - [ ] Progress bar no card Taxa de Sucesso
  - [ ] Filtros: rotina, status, serviço, correlation ID, período, limpar
  - [ ] Tabela de logs: STATUS, ROTINA, TIMESTAMP, DURAÇÃO, RETRY, HTTP, AÇÕES
  - [ ] Status badges coloridos: QUEUED=cinza, RUNNING=azul, SUCCESS=verde, FAILED=vermelho, DLQ=vermelho escuro
  - [ ] Clique em linha abre detail panel (480px) à direita
  - [ ] Detail panel: Resumo, Request, Response, Erro, Histórico (seções colapsáveis)
  - [ ] Headers sensíveis mascarados como "***" com tooltip
  - [ ] JSON viewer formatado para request/response
  - [ ] Botão "Reprocessar" no footer do detail panel (apenas DLQ)
  - [ ] Modal reprocessamento: motivo obrigatório (mín. 10 chars)
  - [ ] Auto-refresh 30s para RUNNING/QUEUED, 60s para métricas
  - [ ] Badge "Atualizando..." com animação pulse
  - [ ] Paginação cursor: "Carregar mais" no footer
  - [ ] Empty state: "Nenhuma chamada registrada"
  - [ ] Empty DLQ: "Tudo certo!" com ícone verde
  - [ ] Loading skeleton para métricas e tabela
