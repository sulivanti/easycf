# 40-Identity — Spec Definitiva

> **Rota:** `/organizacao/identidade` | **Módulo:** MOD-004 | **Screen IDs:** UX-IDN-001, UX-IDN-002
> **Viewport:** 1440 × 900 px | **Font:** Plus Jakarta Sans
> **Referência:** UX-001.md (jornadas e fluxos da identidade avançada)

---

## 1. Decisões de Design (PO)

AppShell reutilizado, com sidebar adaptada para este contexto:

| Item | Decisão |
|------|---------|
| Sidebar ativo | "Identidade Avançada" (categoria ORGANIZAÇÃO) |
| Breadcrumb | "Organização › Identidade Avançada" |
| Topbar direita | "Admin ECF" / "A1 Engenharia" + avatar "AE" |
| Sidebar footer | Dot verde + "Servidor Online" |
| Layout conteúdo (UX-IDN-001) | **Listagem full-width** com tabela de usuários e seus escopos + **Drawer lateral** para atribuição |
| Layout conteúdo (UX-IDN-002) | **3 abas** (Compartilhamentos, Delegações, Recebidos) com tabelas + **Drawer lateral** para create |
| Botão primário | Azul `#2E86C1` ("+ Atribuir Escopo" / "+ Novo Compartilhamento" / "+ Nova Delegação") |
| Drawer | 480px slide-in da direita com overlay |
| Navegação entre views | Tabs ou sub-rotas: `/organizacao/identidade/escopos` e `/organizacao/identidade/compartilhamentos` |

---

## 2. Sidebar — Variante Identidade

```
Sidebar (240×836, fill #FFF, border-right 1px #E8E8E6)
├── "ADMINISTRAÇÃO"
│   ├── Usuários (inativo)
│   └── Perfis e Permissões (inativo)
├── "ORGANIZAÇÃO"
│   ├── Estrutura Org. (inativo)
│   ├── Departamentos (inativo)
│   └── Identidade Avançada (ATIVO: bg #E3F2FD, text #2E86C1)
├── "PROCESSOS"
│   └── Modelagem (inativo)
└── Footer: dot verde 8×8 #27AE60 + "Servidor Online" (text 12px #888888)
```

---

## 3. Cores (além do AppShell)

```
PRIMARY BADGE        text:#FFFFFF  bg:#2E86C1  border:#256FA0
SECONDARY BADGE      text:#555555  bg:#F5F5F3  border:#E8E8E6
SCOPE PILL           text:#2E86C1  bg:#E3F2FD  border:#B8D9F2
ATIVO BADGE          text:#1E7A42  bg:#E8F8EF  border:#B5E8C9
INATIVO BADGE        text:#888888  bg:#F5F5F3  border:#E8E8E6
EXPIRADO BADGE       text:#888888  bg:#F5F5F3  border:#E8E8E6  text-decoration:line-through
EXPIRA BREVE BADGE   text:#E67E22  bg:#FFF3E0  border:#FFE0B2
TABLE HEADER BG      #FAFAFA     Fundo do header da tabela
TABLE ROW HOVER      #F8F8F6     Hover nas linhas da tabela
TABLE BORDER         #F0F0EE     Bordas horizontais entre linhas
DRAWER OVERLAY       rgba(0,0,0,0.3)   Backdrop do drawer
DRAWER SHADOW        -4px 0 24px rgba(0,0,0,0.08)
TAB ACTIVE           text:#2E86C1  border-bottom:2px #2E86C1
TAB INACTIVE         text:#888888  border-bottom:2px transparent
TREE NODE HOVER      #F8F8F6
TREE NODE SELECTED   bg:#E3F2FD  text:#2E86C1
CHECKBOX CHECKED     bg:#2E86C1  border:#2E86C1
CHECKBOX UNCHECKED   bg:#FFF     border:#E8E8E6
DELETE BTN           text:#E74C3C  bg:transparent  border:#E74C3C
DELETE BTN HOVER     text:#FFF     bg:#E74C3C
BANNER INFO BG       #E3F2FD
BANNER INFO BORDER   #B8D9F2
BANNER INFO TEXT     #2E86C1
BANNER WARNING BG    #FFF3E0
BANNER WARNING BORDER #FFE0B2
BANNER WARNING TEXT  #E67E22
```

---

## 4. Tipografia (conteúdo específico)

```
PAGE HEADER
  "Escopo Organizacional"           800  24px  #111111
  "Gerencie os escopos..."          400  13px  #888888
  "+ Atribuir Escopo"               700  13px  #FFFFFF  (botão azul)

TABS (UX-IDN-002)
  Tab ativa                         700  13px  #2E86C1
  Tab inativa                       500  13px  #888888

TABLE HEADER
  "USUÁRIO" etc.                    700  10px  uppercase  ls:+0.8px  #888888

TABLE BODY
  Nome do usuário                   600  13px  #111111
  E-mail                            400  12px  #888888
  Scope pill "Diretoria"            600  11px  #2E86C1
  Badge "PRIMARY"                   700  10px  uppercase  (azul)
  Badge "SECONDARY"                 700  10px  uppercase  (cinza)
  Badge "ATIVO"                     700  10px  uppercase  (verde)
  Badge "EXPIRADO"                  700  10px  uppercase  (cinza, strikethrough)
  Badge "Expira em 3d"              700  10px  uppercase  (âmbar)
  Data "30 mar 2026"                400  12px  #888888

DRAWER
  Título "Atribuir Escopo"          700  18px  #111111
  Label campo "USUÁRIO"             700  10px  uppercase  ls:+0.8px  #888888
  Input text                        500  14px  #111111
  Input placeholder                 400  14px  #CCCCCC
  Erro inline                       500  11px  #E74C3C
  Banner informativo                500  12px  #2E86C1
  "Vincular" / "Criar"              700  13px  #FFFFFF
  "Cancelar"                        600  13px  #555555

TREE SELECTOR
  Nó nível 1 (N1)                   700  13px  #111111
  Nó nível 2 (N2)                   600  13px  #333333
  Nó nível 3 (N3)                   500  13px  #333333
  Nó nível 4 (N4)                   500  13px  #555555
  Ícone chevron                     16×16  stroke #888

EMPTY STATE
  "Nenhum escopo atribuído."        600  16px  #888888
  "Atribuir primeiro escopo"        700  13px  #2E86C1  (link/botão)

MODAL
  Título "Revogar compartilhamento?" 700  18px  #111111
  Mensagem                          400  13px  #555555
  "Cancelar"                        600  13px  #555555
  "Revogar"                         700  13px  #FFFFFF  (bg vermelho)
```

---

## 5. Estrutura de Elementos

### View 1 — Escopo Organizacional (UX-IDN-001)

```
40-Identity-Scopes (frame 1440×900)
│
├── Topbar (branca 64px)
│   ├── Logo A1 azul + "GRUPO A1" / "PORTAL INTERNO"
│   ├── Separador + Breadcrumb: "Organização" #888 › "Identidade Avançada" #111 bold
│   └── Direita: "Admin ECF" / "A1 Engenharia" + avatar "AE"
│
├── Sidebar (240px, ativo: "Identidade Avançada")
│   └── (mesma estrutura seção 2)
│
└── ContentArea (1200×836, fill #F5F5F3, padding:24px)
    │
    ├── PageHeader (group, flex justify-between, align-center)
    │   ├── Esquerda
    │   │   ├── "Escopo Organizacional" (24px 800 #111)
    │   │   └── "Gerencie os vínculos de escopo organizacional dos usuários" (13px 400 #888, mt:4px)
    │   └── Direita
    │       └── BtnAtribuir (primary: r:8, fill #2E86C1, h:40, p:0 20px)
    │           └── "+ Atribuir Escopo" (13px 700 #FFF)
    │
    ├── ToolBar (group, flex justify-between, align-center, mt:20px)
    │   ├── SearchBar (w:320, h:40, r:8, border #E8E8E6, fill #FFF)
    │   │   ├── ÍconeLupa (16×16, stroke #CCC, x:12)
    │   │   └── "Buscar por nome ou e-mail..." (placeholder, x:38)
    │   └── FilterGroup (flex, gap:12px)
    │       ├── FilterTipo (select: "Todos os Tipos" / "PRIMARY" / "SECONDARY")
    │       └── FilterStatus (select: "Todos" / "Ativos" / "Expirados")
    │
    ├── TableCard (group, fill #FFF, r:12, border #E8E8E6, mt:16px, overflow hidden)
    │   │
    │   ├── TableHeader (h:44, bg #FAFAFA, border-bottom 1px #F0F0EE, p:0 20px)
    │   │   ├── "USUÁRIO" (w:220)
    │   │   ├── "ESCOPO PRINCIPAL" (w:200)
    │   │   ├── "ESCOPOS ADICIONAIS" (w:flex)
    │   │   ├── "STATUS" (w:100)
    │   │   └── "AÇÕES" (w:80, text-align center)
    │   │
    │   ├── TableRow (h:56, border-bottom 1px #F0F0EE, p:0 20px, hover bg #F8F8F6)
    │   │   ├── Usuário (flex, gap:10px, align-center)
    │   │   │   ├── Avatar (32×32, r:50%, bg #2E86C1, text "MS" 11px 700 #FFF)
    │   │   │   └── Info (flex-col)
    │   │   │       ├── "Marcos Silva" (13px 600 #111)
    │   │   │       └── "marcos.silva@a1.com.br" (12px 400 #888)
    │   │   ├── ScopePrimary
    │   │   │   └── Pill "Diretoria" (r:6, p:4px 12px, bg #E3F2FD, text 11px 600 #2E86C1, border 1px #B8D9F2)
    │   │   │       + Badge "PRIMARY" (10px 700 #FFF, bg #2E86C1, r:4, p:1px 6px, ml:6px)
    │   │   ├── ScopesAdicionais (flex, gap:6px, flex-wrap)
    │   │   │   ├── Pill "Engenharia" (r:6, p:4px 12px, bg #F5F5F3, text 11px 600 #555, border 1px #E8E8E6)
    │   │   │   └── Pill "+2" (r:6, p:4px 8px, bg #F5F5F3, text 11px 600 #888, border 1px #E8E8E6, cursor pointer)
    │   │   ├── Badge "ATIVO" (verde: text #1E7A42, bg #E8F8EF, r:4, p:2px 8px)
    │   │   └── Ações (flex, gap:8px, justify center)
    │   │       ├── BtnEdit (pencil 16×16, stroke #888, hover #2E86C1)
    │   │       └── BtnRevoke (x-circle 16×16, stroke #888, hover #E74C3C)
    │   │
    │   ├── TableRow (repete para cada usuário com escopos...)
    │   │
    │   └── TableFooter (h:52, p:0 20px, flex justify-center)
    │       └── "Carregar mais" (13px 600 #2E86C1) — se has_more=true
    │
    └── [EmptyState] (alternativa ao TableCard quando data=[])
        ├── Ilustração (120×120, ícone org-tree, stroke #CCC)
        ├── "Nenhum escopo atribuído." (16px 600 #888, mt:16px)
        ├── "Clique em Atribuir Escopo para vincular áreas organizacionais." (13px 400 #AAA, mt:4px)
        └── BtnAtribuir (primary, mt:16px)
```

### View 2 — Compartilhamentos e Delegações (UX-IDN-002)

```
40-Identity-Shares (frame 1440×900)
│
├── Topbar (mesma estrutura)
├── Sidebar (mesma estrutura, "Identidade Avançada" ativo)
│
└── ContentArea (1200×836, fill #F5F5F3, padding:24px)
    │
    ├── PageHeader (group, flex justify-between, align-center)
    │   ├── Esquerda
    │   │   ├── "Compartilhamentos e Delegações" (24px 800 #111)
    │   │   └── "Gerencie compartilhamentos de acesso e delegações de escopo" (13px 400 #888, mt:4px)
    │   └── Direita
    │       └── BtnNovo (primary, muda label conforme aba ativa)
    │
    ├── TabBar (flex, gap:0, mt:20px, border-bottom 2px #E8E8E6)
    │   ├── Tab "Meus Compartilhamentos" (p:12px 20px, border-bottom 2px #2E86C1, text 13px 700 #2E86C1) — ATIVA
    │   ├── Tab "Minhas Delegações" (p:12px 20px, border-bottom 2px transparent, text 13px 500 #888)
    │   └── Tab "Acessos Recebidos" (p:12px 20px, border-bottom 2px transparent, text 13px 500 #888)
    │
    ├── [Tab 1 — Meus Compartilhamentos]
    │   │
    │   ├── TableCard (fill #FFF, r:12, border #E8E8E6, mt:16px)
    │   │   ├── TableHeader (h:44, bg #FAFAFA)
    │   │   │   ├── "COMPARTILHADO COM" (w:200)
    │   │   │   ├── "ESCOPO / RECURSO" (w:200)
    │   │   │   ├── "TIPO" (w:120)
    │   │   │   ├── "VALIDADE" (w:140)
    │   │   │   ├── "STATUS" (w:100)
    │   │   │   └── "AÇÕES" (w:80, text-align center)
    │   │   │
    │   │   ├── TableRow (h:52)
    │   │   │   ├── Grantee (flex, gap:8px, align-center)
    │   │   │   │   ├── Avatar (28×28, r:50%)
    │   │   │   │   └── "Ana Oliveira" (13px 500 #111)
    │   │   │   ├── Scope "Relatórios Diretoria" (13px 500 #333)
    │   │   │   ├── Tipo "Leitura" (12px 400 #555)
    │   │   │   ├── Validade "até 15 abr 2026" (12px 400 #888)
    │   │   │   │   [ou Badge âmbar "Expira em 3d"]
    │   │   │   ├── Badge "ATIVO" (verde)
    │   │   │   └── Ações
    │   │   │       └── BtnRevogar (x-circle 16×16, stroke #888, hover #E74C3C)
    │   │   │
    │   │   └── TableFooter (cursor pagination)
    │   │
    │   └── [EmptyState] "Nenhum compartilhamento ativo."
    │
    ├── [Tab 2 — Minhas Delegações]
    │   │
    │   ├── SectionDadas
    │   │   ├── SectionTitle "Delegações Dadas" (16px 700 #111, mb:12px)
    │   │   └── TableCard
    │   │       ├── TableHeader
    │   │       │   ├── "DELEGADO" (w:200)
    │   │       │   ├── "ESCOPOS" (w:flex)
    │   │       │   ├── "PERÍODO" (w:160)
    │   │       │   ├── "MOTIVO" (w:160)
    │   │       │   └── "AÇÕES" (w:80)
    │   │       └── TableRow (escopos como pills, data range)
    │   │
    │   ├── SectionRecebidas (mt:24px)
    │   │   ├── SectionTitle "Delegações Recebidas" (16px 700 #111, mb:12px)
    │   │   ├── Banner "Escopos obtidos por delegação não podem ser re-delegados." (role="alert")
    │   │   └── TableCard (mesma estrutura, sem coluna AÇÕES de revogar)
    │   │
    │   └── [EmptyState] "Nenhuma delegação ativa."
    │
    └── [Tab 3 — Acessos Recebidos]
        │
        ├── Banner "Estes acessos são temporários e expiram automaticamente." (info, role="alert")
        │
        ├── SectionShares
        │   ├── SectionTitle "Compartilhamentos Recebidos" (16px 700 #111, mb:12px)
        │   └── TableCard
        │       ├── TableHeader
        │       │   ├── "CONCEDENTE" (w:200)
        │       │   ├── "ESCOPO / RECURSO" (w:200)
        │       │   ├── "AÇÕES PERMITIDAS" (w:flex)
        │       │   └── "VÁLIDO ATÉ" (w:140)
        │       └── TableRow
        │
        ├── SectionDelegations (mt:24px)
        │   ├── SectionTitle "Delegações Recebidas" (16px 700 #111, mb:12px)
        │   ├── Banner "Escopos obtidos por delegação não podem ser re-delegados."
        │   └── TableCard (mesma estrutura de delegações recebidas)
        │
        └── [EmptyState] "Você não possui acessos compartilhados ou delegados no momento."
```

---

## 6. Drawers

### Drawer — Atribuir Escopo (UX-IDN-001)

```
DrawerOverlay (fixed, inset 0, bg rgba(0,0,0,0.3), z:50)
│
└── DrawerPanel (480px×100vh, fill #FFF, right:0, shadow -4px 0 24px rgba(0,0,0,0.08))
    │
    ├── DrawerHeader (h:64, border-bottom 1px #E8E8E6, p:0 24px, flex align-center justify-between)
    │   ├── Título "Atribuir Escopo Organizacional" (18px 700 #111)
    │   └── BtnFechar (X 20×20, stroke #888, hover #333, cursor pointer)
    │
    ├── DrawerBody (flex-1, overflow-y auto, p:24px)
    │   │
    │   ├── CampoUsuario
    │   │   ├── Label "USUÁRIO" (10px 700 uppercase ls:+0.8px #888, mb:6px)
    │   │   ├── Autocomplete (w:100%, h:42, r:8, border #E8E8E6, p:10px 14px, font 14px 500 #111)
    │   │   │   └── Placeholder "Buscar por nome ou e-mail..."
    │   │   └── [Erro] (11px 500 #E74C3C, mt:4px)
    │   │
    │   ├── CampoTipo (mt:16px)
    │   │   ├── Label "TIPO DE ESCOPO"
    │   │   ├── RadioGroup (flex, gap:12px, mt:6px)
    │   │   │   ├── Radio "Principal (PRIMARY)" (r:50%, checked → fill #2E86C1)
    │   │   │   └── Radio "Secundário (SECONDARY)" (r:50%, unchecked → border #E8E8E6)
    │   │   └── [Aviso] "Remova a área principal atual antes de adicionar uma nova." (11px 500 #E67E22, mt:4px)
    │   │       [Exibido quando já há PRIMARY e PRIMARY está selecionado]
    │   │
    │   ├── CampoAreaOrg (mt:16px)
    │   │   ├── Label "ÁREA ORGANIZACIONAL"
    │   │   ├── TreeSelector (w:100%, r:8, border #E8E8E6, mt:6px, max-h:300, overflow-y auto)
    │   │   │   ├── [N1] "Grupo A1" (checkbox, indent:0, font 13px 700 #111)
    │   │   │   │   ├── [N2] "A1 Engenharia" (checkbox, indent:24px, font 13px 600 #333)
    │   │   │   │   │   ├── [N3] "Diretoria" (checkbox, indent:48px, font 13px 500 #333)
    │   │   │   │   │   └── [N3] "Engenharia Civil" (checkbox, indent:48px)
    │   │   │   │   └── [N2] "A1 Industrial" (checkbox, indent:24px)
    │   │   │   │       └── [N4] "Produção" (checkbox, indent:72px, font 13px 500 #555)
    │   │   │   └── [N1] (repete...)
    │   │   │   [Nós N5 (tenant) NÃO aparecem]
    │   │   │   [Nós INACTIVE NÃO aparecem]
    │   │   └── [Erro] "O nó organizacional informado não existe ou está inativo." (11px 500 #E74C3C, mt:4px)
    │   │
    │   └── CampoValidade (mt:16px)
    │       ├── Label "VÁLIDO ATÉ (OPCIONAL)"
    │       ├── DatePicker (w:100%, h:42, r:8, border #E8E8E6, p:10px 14px)
    │       │   └── [Datas passadas bloqueadas no calendar]
    │       └── [Erro] "A data de expiração deve ser no futuro." (11px 500 #E74C3C, mt:4px)
    │
    └── DrawerFooter (h:72, border-top 1px #E8E8E6, p:16px 24px, flex justify-end gap:12px)
        ├── BtnCancelar (h:40, r:8, border #E8E8E6, p:0 20px, bg #FFF)
        │   └── "Cancelar" (13px 600 #555)
        └── BtnVincular (h:40, r:8, fill #2E86C1, p:0 20px)
            └── "Vincular" (13px 700 #FFF)
            [Disabled quando PRIMARY já existe e tipo=PRIMARY]
```

### Drawer — Novo Compartilhamento (UX-IDN-002)

```
DrawerPanel (480px×100vh)
│
├── DrawerHeader → "Novo Compartilhamento"
│
├── DrawerBody
│   ├── CampoGrantee
│   │   ├── Label "BENEFICIÁRIO"
│   │   ├── Autocomplete (filtra apenas usuários ativos do tenant)
│   │   └── [Erro] "O usuário destinatário não foi encontrado ou não pertence ao tenant."
│   │
│   ├── CampoRecurso (mt:16px)
│   │   ├── Label "TIPO DE RECURSO"
│   │   └── Select (resource_type)
│   │
│   ├── CampoRecursoId (mt:16px)
│   │   ├── Label "RECURSO"
│   │   └── Autocomplete (resource_id, filtra por resource_type selecionado)
│   │
│   ├── CampoAcoes (mt:16px)
│   │   ├── Label "AÇÕES PERMITIDAS"
│   │   └── MultiSelect (allowed_actions)
│   │
│   ├── CampoMotivo (mt:16px)
│   │   ├── Label "MOTIVO"
│   │   ├── Textarea (w:100%, h:80, r:8, border #E8E8E6, p:10px 14px, resize vertical)
│   │   └── [Erro] "O motivo do compartilhamento é obrigatório."
│   │
│   ├── CampoAutorizador (mt:16px)
│   │   ├── Label "AUTORIZADO POR"
│   │   ├── Autocomplete (authorized_by)
│   │   ├── [Badge info] "Você possui permissão para auto-autorizar." (se scope identity:share:authorize)
│   │   └── [Aviso] "Sem permissão para auto-autorizar. Selecione outro aprovador." (se sem scope)
│   │
│   └── CampoValidade (mt:16px)
│       ├── Label "VÁLIDO ATÉ"
│       ├── DatePicker (datas passadas bloqueadas)
│       └── [Erro] "A data de expiração deve ser no futuro."
│
└── DrawerFooter
    ├── BtnCancelar
    └── BtnCriar "Criar" (disabled se auto-auth sem scope)
```

### Drawer — Nova Delegação (UX-IDN-002)

```
DrawerPanel (480px×100vh)
│
├── DrawerHeader → "Nova Delegação"
│
├── DrawerBody
│   ├── Banner "Os escopos delegados não podem ser re-delegados pelo beneficiário." (role="alert", bg #E3F2FD, border 1px #B8D9F2, p:12px 16px, r:8, text 12px 500 #2E86C1)
│   │
│   ├── CampoDelegatee (mt:16px)
│   │   ├── Label "DELEGADO"
│   │   ├── Autocomplete (filtra apenas usuários ativos do tenant)
│   │   └── [Erro] "O usuário destinatário não foi encontrado ou não pertence ao tenant."
│   │
│   ├── CampoEscopos (mt:16px)
│   │   ├── Label "ESCOPOS A DELEGAR"
│   │   ├── MultiSelect (escopos do token do usuário)
│   │   │   ├── Escopo "identity:read" (habilitado, checkbox)
│   │   │   ├── Escopo "identity:write" (habilitado, checkbox)
│   │   │   ├── Escopo "identity:approve" (DESABILITADO, tooltip: "Escopos de aprovação não podem ser delegados.", aria-disabled="true")
│   │   │   ├── Escopo "identity:execute" (DESABILITADO)
│   │   │   └── Escopo "identity:sign" (DESABILITADO)
│   │   └── [Erro] "Delegações não podem incluir escopos de aprovação, execução ou assinatura."
│   │
│   ├── CampoPeriodo (mt:16px)
│   │   ├── Label "PERÍODO"
│   │   ├── DateRangePicker (flex, gap:8px)
│   │   │   ├── DatePicker "Início" (h:42, r:8)
│   │   │   └── DatePicker "Fim" (h:42, r:8)
│   │   └── [Erro] "A data de expiração é obrigatória para compartilhamentos/delegações."
│   │
│   └── CampoMotivo (mt:16px)
│       ├── Label "MOTIVO"
│       ├── Textarea (w:100%, h:80, r:8)
│       └── [Erro] "O motivo do compartilhamento é obrigatório."
│
└── DrawerFooter
    ├── BtnCancelar
    └── BtnCriar "Criar Delegação" (13px 700 #FFF)
```

---

## 7. Modais

### Modal — Revogar Compartilhamento

```
ModalOverlay (fixed, inset 0, bg rgba(0,0,0,0.3), z:60, flex center)
│
└── ModalCard (w:420, r:12, fill #FFF, shadow 0 8px 32px rgba(0,0,0,0.12), p:24px)
    │
    ├── ÍconeWarning (48×48, r:50%, bg #FFF3E0, stroke #E67E22, centrado)
    │
    ├── Título "Revogar compartilhamento?" (18px 700 #111, mt:16px, text-align center)
    │
    ├── Mensagem (mt:8px, text-align center)
    │   └── "Confirma revogação deste compartilhamento? O acesso de **{nome}** será removido imediatamente."
    │       (13px 400 #555, **{nome}** em 600 #111)
    │
    └── BotõesRow (mt:24px, flex justify-center, gap:12px)
        ├── BtnCancelar (h:40, r:8, border #E8E8E6, p:0 20px) [FOCO PADRÃO]
        │   └── "Cancelar" (13px 600 #555)
        └── BtnRevogar (h:40, r:8, fill #E74C3C, p:0 20px)
            └── "Revogar" (13px 700 #FFF)
```

### Modal — Revogar Delegação

```
ModalOverlay (mesma estrutura)
│
└── ModalCard (w:420, r:12, fill #FFF, shadow 0 8px 32px rgba(0,0,0,0.12), p:24px)
    │
    ├── ÍconeWarning (48×48, r:50%, bg #FFF3E0, stroke #E67E22, centrado)
    │
    ├── Título "Revogar delegação?" (18px 700 #111, mt:16px, text-align center)
    │
    ├── Mensagem (mt:8px, text-align center)
    │   └── "Deseja revogar a delegação para **{nome}**? Os escopos delegados serão removidos imediatamente."
    │       (13px 400 #555)
    │
    └── BotõesRow (mt:24px, flex justify-center, gap:12px)
        ├── BtnCancelar [FOCO PADRÃO]
        └── BtnRevogar "Revogar" (fill #E74C3C)
```

### Modal — Remover Escopo PRIMARY (UX-IDN-001)

```
ModalCard (w:420)
│
├── ÍconeWarning (vermelho, bg #FFEBEE)
├── Título "Remover área principal?" (18px 700 #111)
├── Mensagem "Ao remover a área principal, processos vinculados a este usuário podem perder contexto organizacional."
│   (13px 400 #555)
└── BotõesRow
    ├── BtnCancelar [FOCO PADRÃO]
    └── BtnRemover "Remover mesmo assim" (fill #E74C3C, visualmente diferenciado)
```

---

## 8. Estados

### Loading (Skeleton)

```
TableCard
├── TableHeader (normal)
└── SkeletonRows (6×)
    ├── Circle 32×32 bg:#E8E8E6 animate pulse     (avatar)
    ├── Rect 120×14 r:4 bg:#E8E8E6 animate pulse  (nome)
    ├── Rect 100×20 r:4 bg:#E8E8E6 animate pulse  (scope primary)
    ├── Rect 160×20 r:4 bg:#E8E8E6 animate pulse  (scopes adicionais)
    ├── Rect 50×20 r:4 bg:#E8E8E6 animate pulse   (status)
    └── Rect 48×14 r:4 bg:#E8E8E6 animate pulse   (ações)
```

### Empty State (Escopos)

```
EmptyContainer (flex-col, align-center, p:60px)
├── Ilustração (120×120, ícone org-tree, stroke #CCC, fill none)
├── "Nenhum escopo atribuído." (16px 600 #888, mt:16px)
├── "Clique em Atribuir Escopo para vincular áreas organizacionais." (13px 400 #AAA, mt:4px)
└── BtnAtribuir (primary, mt:16px)
```

### Empty State (Compartilhamentos)

```
EmptyContainer (flex-col, align-center, p:40px)
├── Ilustração (80×80, ícone share, stroke #CCC)
├── "Nenhum compartilhamento ativo." (14px 600 #888, mt:12px)
└── BtnCriar "+ Novo Compartilhamento" (primary, mt:12px)
```

### Empty State (Delegações)

```
EmptyContainer (flex-col, align-center, p:40px)
├── Ilustração (80×80, ícone delegation, stroke #CCC)
├── "Nenhuma delegação ativa." (14px 600 #888, mt:12px)
└── BtnCriar "+ Nova Delegação" (primary, mt:12px)
```

### Empty State (Recebidos)

```
EmptyContainer (flex-col, align-center, p:40px)
├── Ilustração (80×80, ícone inbox, stroke #CCC)
└── "Você não possui acessos compartilhados ou delegados no momento." (14px 600 #888, mt:12px)
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

## 9. Medidas

```
Content area          1200×836    fill:#F5F5F3  padding:24px
Page header           auto×auto   flex justify-between
Search bar            320×40      r:8   border:1px #E8E8E6  fill:#FFF
Tab bar               auto×44     border-bottom:2px #E8E8E6
Tab item              auto×44     padding:12px 20px
Table card            auto×auto   r:12  border:1px #E8E8E6  fill:#FFF
Table header          auto×44     bg:#FAFAFA  border-bottom:1px #F0F0EE
Table row             auto×56     border-bottom:1px #F0F0EE  hover:#F8F8F6
Table cell padding    0 20px
Avatar                32×32       r:50%
Scope pill            auto×auto   r:6   padding:4px 12px
Status badge          auto×auto   r:4   padding:2px 8px
Action icon           16×16       stroke:#888  hover:colored
Drawer                480×100vh   fill:#FFF  shadow:-4px 0 24px rgba(0,0,0,0.08)
Drawer header         auto×64     border-bottom:1px #E8E8E6
Drawer footer         auto×72     border-top:1px #E8E8E6
Input field           100%×42     r:8   border:1px #E8E8E6
Textarea              100%×80     r:8   border:1px #E8E8E6
Tree selector         100%×auto   r:8   border:1px #E8E8E6  max-h:300
Tree indent per lvl   24px
Modal card            420×auto    r:12  shadow:0 8px 32px rgba(0,0,0,0.12)
Banner                auto×auto   r:8   p:12px 16px  border:1px
Empty illustration    120×120 (scopes), 80×80 (tabs)
Button primary        auto×40     r:8   fill:#2E86C1
Button secondary      auto×40     r:8   border:1px #E8E8E6
Button danger         auto×40     r:8   fill:#E74C3C
Filter select         auto×36     r:6   border:1px #E8E8E6
```

---

## 10. Componentes a Criar

| Componente | Descrição | Reutilização |
|------------|-----------|--------------|
| `identity/OrgScopePage` | View 1 — tabela de escopos organizacionais com search e filtros | Rota /organizacao/identidade/escopos |
| `identity/OrgScopeTable` | Tabela com colunas usuário, scope primary, adicionais, status | OrgScopePage |
| `identity/OrgScopeDrawer` | Drawer atribuição de escopo com tree-selector e radio tipo | OrgScopePage |
| `identity/SharesDelegationsPage` | View 2 — painel 3 abas (compartilhamentos, delegações, recebidos) | Rota /organizacao/identidade/compartilhamentos |
| `identity/SharesTab` | Tab compartilhamentos com tabela + drawer de criação | SharesDelegationsPage |
| `identity/DelegationsTab` | Tab delegações com seções dadas/recebidas + drawer de criação | SharesDelegationsPage |
| `identity/ReceivedTab` | Tab acessos recebidos com seções shares/delegations | SharesDelegationsPage |
| `identity/CreateShareDrawer` | Drawer novo compartilhamento (grantee, recurso, ações, motivo, autorizador) | SharesTab |
| `identity/CreateDelegationDrawer` | Drawer nova delegação (delegatee, escopos com disabled, período, motivo) | DelegationsTab |
| `identity/RevokeModal` | Modal de confirmação de revogação (share ou delegação) | SharesTab, DelegationsTab |
| `identity/RemoveScopeModal` | Modal de remoção de escopo com aviso especial para PRIMARY | OrgScopePage |
| `identity/ScopePill` | Pill de escopo organizacional com badge PRIMARY/SECONDARY | OrgScopeTable, futuras telas |
| `ui/TreeSelector` | Seletor de árvore org com checkboxes, níveis N1–N4, busca | OrgScopeDrawer, futuras telas |
| `ui/TabBar` | Barra de abas reutilizável com navegação por teclado | SharesDelegationsPage, futuras telas |
| `ui/Banner` | Banner informativo/warning com role="alert" | DrawerBody, TabContent |
| `ui/DrawerPanel` | Container drawer genérico (overlay + slide-in + header/footer) | Todos os drawers (se não existir) |

---

## 11. Checklist

- [ ] Sidebar: "Identidade Avançada" ativo na categoria ORGANIZAÇÃO
- [ ] Breadcrumb: "Organização › Identidade Avançada"
- [ ] **View 1 — Escopo Organizacional (UX-IDN-001)**
  - [ ] Page header com título + botão "+ Atribuir Escopo"
  - [ ] Search bar (320×40) com ícone lupa
  - [ ] Filtros: tipo (PRIMARY/SECONDARY) e status
  - [ ] Tabela com colunas: Usuário, Escopo Principal, Escopos Adicionais, Status, Ações
  - [ ] Avatar + nome + e-mail na coluna Usuário
  - [ ] Scope pills com badge PRIMARY (azul) / SECONDARY (cinza)
  - [ ] Pill "+N" para escopos adicionais overflow
  - [ ] Ações: edit (pencil) + revoke (x-circle) por linha
  - [ ] Drawer 480px com tree-selector (N1–N4, sem N5, sem inativos)
  - [ ] Radio PRIMARY/SECONDARY no drawer
  - [ ] Aviso inline quando já há PRIMARY
  - [ ] DatePicker com datas passadas bloqueadas
  - [ ] Modal remoção PRIMARY com aviso especial
  - [ ] Modal remoção SECONDARY padrão
- [ ] **View 2 — Compartilhamentos e Delegações (UX-IDN-002)**
  - [ ] 3 abas: Meus Compartilhamentos, Minhas Delegações, Acessos Recebidos
  - [ ] Navegação por teclado entre abas (Arrow keys)
  - [ ] Tab Compartilhamentos: tabela com grantee, escopo, tipo, validade, status, ações
  - [ ] Badges expiração: âmbar (≤7d), vermelho ("Expira amanhã"), cinza+strikethrough (EXPIRED)
  - [ ] Aba oculta se sem scope identity:share:read
  - [ ] Drawer novo compartilhamento com autocomplete grantee, motivo obrigatório
  - [ ] Auto-autorização condicional ao scope
  - [ ] Tab Delegações: seções "Dadas" e "Recebidas"
  - [ ] Banner re-delegação proibida
  - [ ] Drawer nova delegação com escopos approve/execute/sign desabilitados
  - [ ] Tab Recebidos: seções shares + delegações recebidas
  - [ ] Banner acessos temporários
  - [ ] EXPIRED items visíveis por 30 dias em cinza
- [ ] **Estados**
  - [ ] Loading skeleton por view/aba
  - [ ] Empty state com ilustração + ação (por contexto)
  - [ ] Error state com botão "Tentar novamente"
- [ ] **Acessibilidade**
  - [ ] Foco automático no primeiro campo ao abrir drawers
  - [ ] Escape para fechar drawers
  - [ ] aria-label em badges e pills
  - [ ] aria-disabled + tooltip em escopos desabilitados
  - [ ] Banners com role="alert"
  - [ ] Foco no "Cancelar" em modais de revogação
- [ ] Paginação cursor: "Carregar mais" em todas as tabelas
