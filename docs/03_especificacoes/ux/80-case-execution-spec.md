# 80-Case-Execution — Spec Definitiva

> **Rota:** `/processos/casos` | **Módulo:** MOD-006 | **Screen IDs:** UX-CASE-001, UX-CASE-002
> **Viewport:** 1440 × 900 px | **Font:** Plus Jakarta Sans
> **Referência:** UX-006.md (jornadas e fluxos de execução de casos)

---

## 1. Decisões de Design (PO)

AppShell reutilizado, com sidebar adaptada para este contexto:

| Item | Decisão |
|------|---------|
| Sidebar ativo | "Casos" (categoria PROCESSOS) |
| Breadcrumb | "Processos › Casos" |
| Topbar direita | "Admin ECF" / "A1 Engenharia" + avatar "AE" |
| Sidebar footer | Dot verde + "Servidor Online" |
| Layout conteúdo (lista) | **Listagem full-width** com tabela + **Drawer lateral** para novo caso |
| Layout conteúdo (detalhe) | **Painel do caso** com header card, barra de progresso, 3 abas |
| Botão primário | Azul `#2E86C1` ("+ Novo Caso") |
| Drawer | 480px slide-in da direita com overlay |

---

## 2. Sidebar — Variante Processos

```
Sidebar (240×836, fill #FFF, border-right 1px #E8E8E6)
├── "ADMINISTRAÇÃO"
│   ├── Usuários (inativo)
│   └── Perfis e Permissões (inativo)
├── "ORGANIZAÇÃO"
│   └── Estrutura Org. (inativo)
├── "PROCESSOS"
│   ├── Modelagem (inativo)
│   └── Casos (ATIVO: bg #E3F2FD, text #2E86C1)
├── "APROVAÇÃO"
│   └── Movimentos (inativo)
└── Footer: dot verde 8×8 #27AE60 + "Servidor Online" (text 12px #888888)
```

---

## 3. Cores (além do AppShell)

```
STATUS OPEN              text:#2E86C1  bg:#E3F2FD  border:#B5D4F0
STATUS IN_PROGRESS       text:#B8860B  bg:#FFF3E0  border:#FFE0B2
STATUS COMPLETED         text:#1E7A42  bg:#E8F8EF  border:#B5E8C9
STATUS CANCELLED         text:#888888  bg:#F5F5F3  border:#E8E8E6
STATUS ON_HOLD           text:#E67E22  bg:#FFF3E0  border:#FFE0B2

GATE PENDING             text:#B8860B  bg:#FFF3E0  border:#FFE0B2
GATE RESOLVED            text:#1E7A42  bg:#E8F8EF  border:#B5E8C9
GATE WAIVED              text:#888888  bg:#F5F5F3  border:#E8E8E6
GATE REJECTED            text:#C0392B  bg:#FFEBEE  border:#F5C6CB

PROGRESS COMPLETED       #27AE60     Segmento de macroetapa concluída
PROGRESS CURRENT         #2E86C1     Segmento de macroetapa atual
PROGRESS FUTURE          #E8E8E6     Segmento de macroetapa futura

TIMELINE DOT BLUE        #2E86C1     Evento de criação
TIMELINE DOT GREEN       #27AE60     Evento de transição / gate resolvido
TIMELINE DOT GRAY        #CCCCCC     Evento genérico (evidência, comentário)

BADGE PENDENTES          text:#FFF  bg:#E74C3C   Badge vermelho de gates pendentes

TABLE HEADER BG          #FAFAFA     Fundo do header da tabela
TABLE ROW HOVER          #F8F8F6     Hover nas linhas da tabela
TABLE BORDER             #F0F0EE     Bordas horizontais entre linhas
DRAWER OVERLAY           rgba(0,0,0,0.3)   Backdrop do drawer
DRAWER SHADOW            -4px 0 24px rgba(0,0,0,0.08)
TAB ACTIVE               text:#2E86C1  border-bottom:2px #2E86C1
TAB INACTIVE             text:#888888  border-bottom:none
TRANSITION BTN ENABLED   bg:#2E86C1  text:#FFF
TRANSITION BTN DISABLED  bg:#E8E8E6  text:#AAA  cursor:not-allowed
```

---

## 4. Tipografia (conteúdo específico)

```
PAGE HEADER (lista)
  "Casos"                             800  24px  #111111
  "Gerencie os casos de execução..."  400  13px  #888888
  "+ Novo Caso"                       700  13px  #FFFFFF  (botão azul)

CASE HEADER (detalhe)
  "CASO-2026-0042"                    700  20px  monospace  #111111
  Badge status "EM ANDAMENTO"         700  10px  uppercase  (variante por status)
  Breadcrumb estágio                  500  13px  #888888  (atual: 700 #111111)

PROGRESS BAR
  Label macroetapa                    600  10px  uppercase  #555555
  Label macroetapa atual              700  10px  uppercase  #2E86C1

TABS
  "Gates" / "Atribuições" / "Timeline"  600  13px  (ativo: 700 #2E86C1)

GATE CARD
  Nome do gate                        600  14px  #111111
  Tipo (APPROVAL/DOCUMENT/CHECKLIST)  700  9px   uppercase  ls:+0.8px  #888888
  Badge status "PENDENTE"             700  10px  uppercase  (variante)
  Parecer / nota                      400  13px  #555555

TIMELINE
  Evento título                       600  13px  #111111
  Data/hora                           400  11px  #888888
  Descrição                           400  12px  #555555

TABLE HEADER
  "CÓDIGO" etc.                       700  10px  uppercase  ls:+0.8px  #888888

TABLE BODY
  Código                              600  13px  #333333  monospace
  Ciclo                               500  13px  #111111
  Estágio                             500  13px  #111111
  Status badge                        700  10px  uppercase  (variante)
  Responsável                         500  13px  #111111
  Data "30 mar 2026"                  400  12px  #888888
  Badge pendentes "3"                 700  10px  #FFF  (bg vermelho)

DRAWER
  Título "Novo Caso"                  700  18px  #111111
  Label campo "CICLO"                 700  10px  uppercase  ls:+0.8px  #888888
  Input text                          500  14px  #111111
  Input placeholder                   400  14px  #CCCCCC
  Radio label                         500  13px  #333333
  "Abrir Caso" / "Cancelar"           700  13px  #FFFFFF / 600 13px #555555

TRANSITION BUTTON
  "Avançar para {estágio}"            700  13px  #FFFFFF  (habilitado)
  Tooltip (desabilitado)              400  11px  #FFFFFF  bg:#333  r:4

EMPTY STATE
  "Nenhum caso encontrado."           600  16px  #888888
  "Abrir primeiro caso"               700  13px  #2E86C1  (link/botão)
```

---

## 5. View 1 — Painel do Caso em Andamento (UX-CASE-001)

### 5.1 Estrutura de Elementos

```
80-CasePanel (frame 1440×900)
│
├── Topbar (branca 64px)
│   ├── Logo A1 azul + "GRUPO A1" / "PORTAL INTERNO"
│   ├── Separador + Breadcrumb: "Processos" #888 › "Casos" #888 › "CASO-2026-0042" #111 bold
│   └── Direita: "Admin ECF" / "A1 Engenharia" + avatar "AE"
│
├── Sidebar (240px, ativo: "Casos")
│   └── (mesma estrutura seção 2)
│
└── ContentArea (1200×836, fill #F5F5F3, padding:24px)
    │
    ├── HeaderCard (fill #FFF, r:12, border 1px #E8E8E6, p:20px 24px)
    │   ├── TopRow (flex justify-between, align-center)
    │   │   ├── Esquerda (flex, align-center, gap:12px)
    │   │   │   ├── CaseCode "CASO-2026-0042" (20px 700 monospace #111)
    │   │   │   └── StatusBadge "EM ANDAMENTO" (variante IN_PROGRESS)
    │   │   └── Direita (flex, gap:8px)
    │   │       ├── BtnSuspender (secondary: r:8, border #E8E8E6, h:36)
    │   │       │   └── "Suspender" (12px 600 #555)
    │   │       └── BtnCancelar (danger-outline: r:8, border #E74C3C, h:36)
    │   │           └── "Cancelar" (12px 600 #E74C3C)
    │   └── StageBreadcrumb (flex, align-center, gap:8px, mt:12px)
    │       ├── "Abertura" (13px 500 #888 — concluído)
    │       ├── Chevron "›" (#CCC)
    │       ├── "Revisão" (13px 700 #111 — atual, underline #2E86C1)
    │       ├── Chevron "›" (#CCC)
    │       └── "Aprovação N2" (13px 500 #AAA — futuro)
    │
    ├── ProgressBar (mt:16px, h:8, r:4, overflow:hidden, flex)
    │   ├── Segment1 (flex:1, bg #27AE60) — Abertura (concluída)
    │   ├── Segment2 (flex:1, bg #2E86C1) — Revisão (atual)
    │   └── Segment3 (flex:1, bg #E8E8E6) — Aprovação N2 (futura)
    │
    ├── TabBar (mt:20px, flex, gap:0, border-bottom 1px #E8E8E6)
    │   ├── Tab "Gates" (p:12px 20px, 13px 700 #2E86C1, border-bottom 2px #2E86C1)
    │   ├── Tab "Atribuições" (p:12px 20px, 13px 600 #888)
    │   └── Tab "Timeline" (p:12px 20px, 13px 600 #888)
    │
    ├── TabContent — Gates (mt:16px, flex-col, gap:12px)
    │   │
    │   ├── GateCard (fill #FFF, r:10, border 1px #E8E8E6, p:16px 20px)
    │   │   ├── CardHeader (flex justify-between, align-center)
    │   │   │   ├── Esquerda (flex-col)
    │   │   │   │   ├── GateName "Documentação Completa" (14px 600 #111)
    │   │   │   │   └── GateType "DOCUMENT" (9px 700 uppercase ls:+0.8px #888, mt:2px)
    │   │   │   └── GateBadge "RESOLVIDO" (variante RESOLVED, verde)
    │   │   └── [Sem ações — já resolvido]
    │   │
    │   ├── GateCard (fill #FFF, r:10, border 1px #E8E8E6, p:16px 20px)
    │   │   ├── CardHeader (flex justify-between, align-center)
    │   │   │   ├── Esquerda (flex-col)
    │   │   │   │   ├── GateName "Aprovação do Gestor" (14px 600 #111)
    │   │   │   │   └── GateType "APPROVAL" (9px 700 uppercase ls:+0.8px #888, mt:2px)
    │   │   │   └── GateBadge "PENDENTE" (variante PENDING, âmbar)
    │   │   └── CardActions (flex, gap:8px, mt:12px)
    │   │       ├── BtnResolver (primary: r:8, bg #2E86C1, h:36, p:0 16px)
    │   │       │   └── "Resolver" (12px 700 #FFF)
    │   │       └── BtnDispensa (secondary: r:8, border #E8E8E6, h:36, p:0 16px)
    │   │           └── "Dispensar" (12px 600 #555)
    │   │
    │   └── GateCard (fill #FFF, r:10, border 1px #E8E8E6, p:16px 20px)
    │       ├── CardHeader (flex justify-between, align-center)
    │       │   ├── Esquerda (flex-col)
    │       │   │   ├── GateName "Checklist de Conformidade" (14px 600 #111)
    │       │   │   └── GateType "CHECKLIST" (9px 700 uppercase ls:+0.8px #888, mt:2px)
    │       │   └── GateBadge "PENDENTE" (variante PENDING, âmbar)
    │       └── ChecklistItems (mt:12px, flex-col, gap:8px)
    │           ├── CheckItem [x] "Formulário preenchido" (13px 500 #111, checked)
    │           ├── CheckItem [x] "Documentos digitalizados" (13px 500 #111, checked)
    │           ├── CheckItem [x] "Assinaturas coletadas" (13px 500 #111, checked)
    │           ├── CheckItem [ ] "Validação técnica" (13px 500 #888, unchecked)
    │           └── CheckItem [ ] "Aprovação financeira" (13px 500 #888, unchecked)
    │
    ├── TabContent — Atribuições (hidden quando aba não ativa)
    │   └── AssignmentList (flex-col, gap:12px)
    │       ├── AssignmentCard (fill #FFF, r:10, border 1px #E8E8E6, p:16px 20px)
    │       │   ├── Role "Revisor Técnico" (14px 600 #111)
    │       │   ├── Assigned "Ana Oliveira" (13px 500 #333, mt:4px) + avatar
    │       │   └── BtnReatribuir (12px 600 #2E86C1, mt:8px, cursor pointer)
    │       └── AssignmentCard (fill #FFF, r:10, border 1px #E8E8E6 border-left 3px #E74C3C, p:16px 20px)
    │           ├── Role "Aprovador N2" (14px 600 #111)
    │           ├── Label "Obrigatório — não atribuído" (12px 500 #E74C3C, mt:4px)
    │           └── BtnAtribuir (12px 700 #2E86C1, mt:8px) "Atribuir"
    │
    ├── TabContent — Timeline (hidden quando aba não ativa)
    │   └── TimelineList (flex-col, gap:0, position:relative)
    │       ├── TimelineItem (flex, gap:16px, pb:20px)
    │       │   ├── DotCol (flex-col, align-center)
    │       │   │   ├── Dot (12×12, r:50%, bg #2E86C1)
    │       │   │   └── Line (w:2, flex:1, bg #E8E8E6)
    │       │   └── Content
    │       │       ├── Title "Caso criado" (13px 600 #111)
    │       │       └── Meta "30 mar 2026 09:15" (11px 400 #888)
    │       ├── TimelineItem (...)
    │       │   ├── Dot (bg #27AE60)
    │       │   └── Title "Transição para 'Revisão'" + Meta
    │       └── (mais itens...)
    │
    └── TransitionBar (mt:20px, flex justify-end)
        └── BtnTransition (r:8, h:44, p:0 24px)
            └── "Avançar para Aprovação N2" (13px 700)
            [Habilitado: bg #2E86C1, text #FFF]
            [Desabilitado: bg #E8E8E6, text #AAA, tooltip "Resolva todos os gates pendentes"]
```

### 5.2 Evidência (mini-form inline)

```
EvidenceForm (mt:12px, p:12px, bg #FAFAFA, r:8, border 1px #E8E8E6)
├── Textarea (w:100%, h:60, r:6, border 1px #E8E8E6, p:8px 12px, 13px 400)
│   └── placeholder "Nota ou parecer..."
├── UploadRow (flex, align-center, gap:12px, mt:8px)
│   ├── BtnUpload (secondary: r:6, border #E8E8E6, h:32, p:0 12px)
│   │   └── "📎 Anexar arquivo" (11px 600 #555)
│   └── FileName (11px 400 #888) — exibido após seleção
└── BtnConfirmar (primary: r:6, bg #2E86C1, h:32, p:0 16px, mt:8px)
    └── "Confirmar" (11px 700 #FFF) — desabilitado até preenchimento
```

### 5.3 Modal de Confirmação (Cancelar / Dispensar)

```
ModalOverlay (fixed, inset 0, bg rgba(0,0,0,0.3), z:60, flex center)
│
└── ModalCard (w:420, r:12, fill #FFF, shadow 0 8px 32px rgba(0,0,0,0.12), p:24px)
    │
    ├── ÍconeWarning (48×48, r:50%, bg #FFF3E0, stroke #E67E22, centrado)
    │
    ├── Título "Cancelar caso?" (18px 700 #111, mt:16px, text-align center)
    │
    ├── Mensagem (mt:8px, text-align center)
    │   └── "Deseja cancelar o caso **CASO-2026-0042**? Esta ação não pode ser desfeita."
    │       (13px 400 #555, **código** em 600 #111)
    │
    ├── [Variante Waive] MotivoField (mt:16px)
    │   ├── Label "MOTIVO DA DISPENSA" (10px 700 uppercase ls:+0.8px #888)
    │   └── Textarea (w:100%, h:80, r:8, min 20 chars) + contador de chars
    │
    └── BotõesRow (mt:24px, flex justify-center, gap:12px)
        ├── BtnCancelar (h:40, r:8, border #E8E8E6, p:0 20px)
        │   └── "Voltar" (13px 600 #555)
        └── BtnConfirmar (h:40, r:8, fill #E74C3C, p:0 20px)
            └── "Cancelar Caso" (13px 700 #FFF)
```

---

## 6. View 2 — Listagem de Casos (UX-CASE-002)

### 6.1 Estrutura de Elementos

```
80-CaseList (frame 1440×900)
│
├── Topbar (branca 64px)
│   ├── Logo A1 azul + "GRUPO A1" / "PORTAL INTERNO"
│   ├── Separador + Breadcrumb: "Processos" #888 › "Casos" #111 bold
│   └── Direita: "Admin ECF" / "A1 Engenharia" + avatar "AE"
│
├── Sidebar (240px, ativo: "Casos")
│   └── (mesma estrutura seção 2)
│
└── ContentArea (1200×836, fill #F5F5F3, padding:24px)
    │
    ├── PageHeader (group, flex justify-between, align-center)
    │   ├── Esquerda
    │   │   ├── "Casos" (24px 800 #111)
    │   │   └── "Gerencie os casos de execução do seu tenant" (13px 400 #888, mt:4px)
    │   └── Direita
    │       └── BtnNovo (primary: r:8, fill #2E86C1, h:40, p:0 20px)
    │           └── "+ Novo Caso" (13px 700 #FFF)
    │
    ├── FilterBar (flex, align-center, gap:12px, mt:20px, flex-wrap)
    │   ├── SelectCiclo (w:200, h:40, r:8, border #E8E8E6, fill #FFF)
    │   │   └── placeholder "Ciclo" — lista apenas PUBLISHED
    │   ├── SelectStatus (w:160, h:40, r:8, border #E8E8E6, fill #FFF)
    │   │   └── options: Todos, Aberto, Em Andamento, Concluído, Cancelado, Em Espera
    │   ├── SelectEstagio (w:180, h:40, r:8, border #E8E8E6, fill #FFF)
    │   │   └── placeholder "Estágio"
    │   ├── ToggleMinhaResp (flex, align-center, gap:8px)
    │   │   ├── Toggle (w:36, h:20, r:10, bg #E8E8E6 ou #2E86C1)
    │   │   └── "Minha responsabilidade" (12px 500 #555)
    │   ├── DateRange (w:200, h:40, r:8, border #E8E8E6, fill #FFF)
    │   │   └── placeholder "Período"
    │   └── SearchBar (w:240, h:40, r:8, border #E8E8E6, fill #FFF)
    │       ├── ÍconeLupa (16×16, stroke #CCC, x:12)
    │       └── placeholder "Buscar por código..."
    │
    ├── TableCard (group, fill #FFF, r:12, border #E8E8E6, mt:16px, overflow hidden)
    │   │
    │   ├── TableHeader (h:44, bg #FAFAFA, border-bottom 1px #F0F0EE, p:0 20px)
    │   │   ├── "CÓDIGO" (w:140)
    │   │   ├── "CICLO" (w:160)
    │   │   ├── "ESTÁGIO ATUAL" (w:160)
    │   │   ├── "STATUS" (w:130)
    │   │   ├── "RESPONSÁVEL" (w:150)
    │   │   ├── "CRIADO EM" (w:120)
    │   │   └── "AÇÕES" (w:80, text-align center)
    │   │
    │   ├── TableRow (h:52, border-bottom 1px #F0F0EE, p:0 20px, hover bg #F8F8F6)
    │   │   ├── Código "CASO-2026-0042" (13px 600 #333 monospace, cursor pointer → navega)
    │   │   ├── Ciclo "Onboarding v2.1" (13px 500 #111)
    │   │   ├── Estágio "Revisão" (13px 500 #111)
    │   │   ├── Badge "EM ANDAMENTO" (variante IN_PROGRESS)
    │   │   ├── Responsável "Ana Oliveira" (13px 500 #111)
    │   │   ├── "30 mar 2026" (12px 400 #888)
    │   │   └── Ações (flex, gap:8px, justify center)
    │   │       ├── BtnVer (eye 16×16, stroke #888, hover #2E86C1)
    │   │       └── BadgePendentes "3" (min-w:20, h:20, r:10, bg #E74C3C, text 10px 700 #FFF, text-align center)
    │   │
    │   ├── TableRow (repete para cada caso...)
    │   │
    │   └── TableFooter (h:52, p:0 20px, flex justify-center)
    │       └── "Carregar mais" (13px 600 #2E86C1) — se has_more=true
    │
    └── [EmptyState] (alternativa ao TableCard quando data=[])
        ├── Ilustração (120×120, ícone folder-play estilizado, stroke #CCC)
        ├── "Nenhum caso encontrado." (16px 600 #888, mt:16px)
        ├── "Abra um caso para iniciar a execução de um ciclo." (13px 400 #AAA, mt:4px)
        └── BtnCriar (primary, mt:16px)
            └── "Abrir primeiro caso" (13px 700 #FFF)
```

### 6.2 Drawer — Novo Caso

```
DrawerOverlay (fixed, inset 0, bg rgba(0,0,0,0.3), z:50)
│
└── DrawerPanel (480px×100vh, fill #FFF, right:0, shadow -4px 0 24px rgba(0,0,0,0.08))
    │
    ├── DrawerHeader (h:64, border-bottom 1px #E8E8E6, p:0 24px, flex align-center justify-between)
    │   ├── Título "Novo Caso" (18px 700 #111)
    │   └── BtnFechar (X 20×20, stroke #888, hover #333, cursor pointer)
    │
    ├── DrawerBody (flex-1, overflow-y auto, p:24px)
    │   │
    │   ├── CampoCiclo
    │   │   ├── Label "CICLO" (10px 700 uppercase ls:+0.8px #888, mb:6px)
    │   │   ├── Select (w:100%, h:42, r:8, border #E8E8E6, p:10px 14px, font 14px 500 #111)
    │   │   │   └── Lista apenas ciclos com status PUBLISHED
    │   │   └── [Empty] "Nenhum ciclo publicado disponível." (11px 500 #E74C3C, mt:4px)
    │   │
    │   ├── CampoDescricao (mt:16px)
    │   │   ├── Label "DESCRIÇÃO"
    │   │   └── Textarea (w:100%, h:100, r:8, border #E8E8E6, p:10px 14px, resize vertical)
    │   │
    │   ├── CampoPrioridade (mt:16px)
    │   │   ├── Label "PRIORIDADE"
    │   │   └── RadioGroup (flex-col, gap:8px, mt:6px)
    │   │       ├── Radio "Normal" (checked default, 13px 500 #333)
    │   │       ├── Radio "Alta" (13px 500 #333)
    │   │       └── Radio "Urgente" (13px 500 #E74C3C)
    │   │
    │   └── CampoObservacoes (mt:16px)
    │       ├── Label "OBSERVAÇÕES INICIAIS"
    │       └── Textarea (w:100%, h:80, r:8, border #E8E8E6, p:10px 14px, resize vertical)
    │           └── placeholder "Observações opcionais..."
    │
    └── DrawerFooter (h:72, border-top 1px #E8E8E6, p:16px 24px, flex justify-end gap:12px)
        ├── BtnCancelar (h:40, r:8, border #E8E8E6, p:0 20px, bg #FFF)
        │   └── "Cancelar" (13px 600 #555)
        └── BtnAbrir (h:40, r:8, fill #2E86C1, p:0 20px)
            └── "Abrir Caso" (13px 700 #FFF)
```

---

## 7. Estados da Tela

### Loading (Skeleton) — Lista

```
TableCard
├── TableHeader (normal)
└── SkeletonRows (6×)
    ├── Rect 100×14 r:4 bg:#E8E8E6 animate pulse  (código)
    ├── Rect 120×14 r:4 bg:#E8E8E6 animate pulse  (ciclo)
    ├── Rect 80×14 r:4 bg:#E8E8E6 animate pulse   (estágio)
    ├── Rect 80×20 r:4 bg:#E8E8E6 animate pulse   (status)
    ├── Rect 100×14 r:4 bg:#E8E8E6 animate pulse  (responsável)
    ├── Rect 70×14 r:4 bg:#E8E8E6 animate pulse   (data)
    └── Rect 40×14 r:4 bg:#E8E8E6 animate pulse   (ações)
```

### Loading (Skeleton) — Detalhe

```
ContentArea
├── HeaderCard skeleton (h:80, r:12, bg #FFF)
│   ├── Rect 180×20 r:4 bg:#E8E8E6 animate pulse
│   └── Rect 100×16 r:4 bg:#E8E8E6 animate pulse
├── ProgressBar skeleton (h:8, r:4, bg #E8E8E6, mt:16px)
├── TabBar skeleton (mt:20px, flex, gap:20px)
│   ├── Rect 60×14 r:4 bg:#E8E8E6 animate pulse
│   ├── Rect 80×14 r:4 bg:#E8E8E6 animate pulse
│   └── Rect 70×14 r:4 bg:#E8E8E6 animate pulse
└── GateCards skeleton (3×, mt:16px)
    └── Rect 100%×60 r:10 bg:#E8E8E6 animate pulse
```

### Empty State — Lista

```
EmptyContainer (flex-col, align-center, p:60px)
├── Ilustração (120×120, ícone folder-play, stroke #CCC, fill none)
├── "Nenhum caso encontrado." (16px 600 #888, mt:16px)
├── "Abra um caso para iniciar a execução de um ciclo." (13px 400 #AAA, mt:4px)
└── BtnCriar (primary, mt:16px)
```

### Empty State — Gates

```
EmptyGatesContainer (flex-col, align-center, p:40px)
├── Ícone shield-check (48×48, stroke #CCC)
└── "Este estágio não possui gates." (14px 500 #888, mt:12px)
```

### Error State

```
ErrorContainer (flex-col, align-center, p:40px)
├── Ícone alert-triangle (48×48, stroke #E74C3C)
├── "Não foi possível carregar os casos." (14px 500 #888, mt:12px)
└── BtnRetry (secondary, mt:12px)
    └── "Tentar novamente" (13px 600 #555)
```

---

## 8. Medidas

```
Content area          1200×836    fill:#F5F5F3  padding:24px
Page header           auto×auto   flex justify-between
Filter bar            auto×40     flex, gap:12px, mt:20px
Select filter         varies×40   r:8   border:1px #E8E8E6  fill:#FFF
Toggle track          36×20       r:10
Search bar (lista)    240×40      r:8   border:1px #E8E8E6  fill:#FFF
Table card            auto×auto   r:12  border:1px #E8E8E6  fill:#FFF
Table header          auto×44     bg:#FAFAFA  border-bottom:1px #F0F0EE
Table row             auto×52     border-bottom:1px #F0F0EE  hover:#F8F8F6
Table cell padding    0 20px
Badge pendentes       min-w:20×20 r:10  bg:#E74C3C
Header card           auto×auto   r:12  border:1px #E8E8E6  fill:#FFF  p:20px 24px
Progress bar          auto×8      r:4
Tab bar               auto×44     border-bottom:1px #E8E8E6
Gate card             auto×auto   r:10  border:1px #E8E8E6  fill:#FFF  p:16px 20px
Timeline dot          12×12       r:50%
Timeline line         w:2         bg:#E8E8E6
Transition button     auto×44     r:8
Drawer                480×100vh   fill:#FFF  shadow:-4px 0 24px rgba(0,0,0,0.08)
Drawer header         auto×64     border-bottom:1px #E8E8E6
Drawer footer         auto×72     border-top:1px #E8E8E6
Input field           100%×42     r:8   border:1px #E8E8E6
Textarea              100%×100    r:8   border:1px #E8E8E6
Modal card            420×auto    r:12  shadow:0 8px 32px rgba(0,0,0,0.12)
Empty illustration    120×120
Button primary        auto×40     r:8   fill:#2E86C1
Button secondary      auto×40     r:8   border:1px #E8E8E6
Button danger         auto×40     r:8   fill:#E74C3C
```

---

## 9. Responsividade

| Breakpoint | Comportamento |
|---|---|
| >= 1280px | Tabela full-width, drawer 480px overlay, todas colunas visíveis |
| 1024-1279px | Tabela full-width, drawer 420px overlay, colunas "Responsável" e "Criado em" hidden |
| 768-1023px | Tabela com scroll horizontal, drawer 100% full-screen, filtros em coluna |
| < 768px | Cards verticais (1 card por caso), drawer 100% full-screen, botão novo fixed bottom |

### Card Mobile (< 768px)

```
CaseCard (r:12, border 1px #E8E8E6, fill #FFF, p:16px, mb:12px)
├── HeaderRow (flex justify-between)
│   ├── Código "CASO-2026-0042" (10px 700 monospace #888)
│   └── Badge "EM ANDAMENTO" (variante)
├── Ciclo "Onboarding v2.1" (14px 600 #111, mt:8px)
├── Estágio "Revisão" (12px 500 #555, mt:4px)
├── FooterRow (flex justify-between, mt:12px)
│   ├── "30 mar 2026" (11px 400 #888)
│   └── BadgePendentes "3" (se aplicável)
```

---

## 10. Componentes a Criar

| Componente | Descrição | Reutilização |
|------------|-----------|--------------|
| `cases/CaseListPage` | Página de listagem com tabela, filtros, header | Rota /processos/casos |
| `cases/CasePanelPage` | Página de detalhe com header, progresso, abas | Rota /processos/casos/:id |
| `cases/CaseTable` | Tabela com colunas, badges, paginação cursor | CaseListPage |
| `cases/CaseDrawer` | Drawer lateral para abertura de novo caso | CaseListPage |
| `cases/GateCard` | Card de gate com status, ações, checklist inline | CasePanelPage (aba Gates) |
| `cases/AssignmentCard` | Card de atribuição de papel com reatribuição | CasePanelPage (aba Atribuições) |
| `cases/CaseTimeline` | Timeline vertical com dots coloridos e eventos | CasePanelPage (aba Timeline) |
| `cases/ProgressBar` | Barra de progresso segmentada por macroetapa | CasePanelPage |
| `cases/TransitionButton` | Botão de transição com tooltip de bloqueio | CasePanelPage |
| `cases/EvidenceForm` | Mini-form inline com nota + upload de arquivo | GateCard, TransitionButton |
| `cases/CancelModal` | Modal de confirmação para cancelamento | CasePanelPage |
| `cases/WaiveModal` | Modal de dispensa com campo de motivo (min 20 chars) | GateCard |
| `cases/StatusBadge` | Badge de status do caso (OPEN/IN_PROGRESS/COMPLETED/CANCELLED) | CaseTable, CasePanelPage |
| `cases/PendingBadge` | Badge vermelho com contagem de gates pendentes | CaseTable |

---

## 11. Checklist

- [ ] Sidebar: "Casos" ativo na categoria PROCESSOS
- [ ] Breadcrumb: "Processos › Casos" (lista) / "Processos › Casos › CASO-xxxx" (detalhe)
- [ ] Page header com título + botão "+ Novo Caso"
- [ ] Filtros: Ciclo (PUBLISHED), Status, Estágio, "Minha responsabilidade", Date range, Busca
- [ ] Tabela com 7 colunas: Código, Ciclo, Estágio Atual, Status, Responsável, Criado em, Ações
- [ ] Badge vermelho com contagem de gates pendentes na coluna Ações
- [ ] Paginação cursor: "Carregar mais" no footer
- [ ] Drawer 480px para novo caso com 4 campos (ciclo, descrição, prioridade, observações)
- [ ] Header card do caso com código monospace + status badge + breadcrumb de estágio
- [ ] Barra de progresso segmentada por macroetapa (verde/azul/cinza)
- [ ] 3 abas: Gates, Atribuições, Timeline
- [ ] Gate cards com status (PENDING/RESOLVED/WAIVED), botão Resolver, botão Dispensar
- [ ] Checklist inline para gates tipo CHECKLIST
- [ ] Evidência: mini-form com nota + upload de arquivo
- [ ] Atribuição com avatar, botão reatribuir, indicação de papel obrigatório não atribuído
- [ ] Timeline vertical com dots coloridos (azul criação, verde transição, cinza genérico)
- [ ] Botão de transição habilitado/desabilitado conforme gates
- [ ] Modal de confirmação para cancelamento e dispensa (com motivo min 20 chars)
- [ ] Empty state lista com ilustração + botão "Abrir primeiro caso"
- [ ] Empty state gates "Este estágio não possui gates."
- [ ] Error state com botão "Tentar novamente"
- [ ] Loading skeleton para lista e detalhe
- [ ] Responsividade: drawer full-screen em mobile, cards verticais < 768px
