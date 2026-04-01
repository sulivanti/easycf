# 95-SmartGrid — Spec Definitiva

> **Rota:** `/ferramentas/smartgrid` | **Módulo:** MOD-011 | **Screen IDs:** UX-SGR-001, UX-SGR-002, UX-SGR-003
> **Viewport:** 1440 × 900 px | **Font:** Plus Jakarta Sans
> **Referência:** UX-011.md (jornadas e fluxos do SmartGrid)

---

## 1. Decisões de Design (PO)

AppShell reutilizado, com sidebar adaptada para este contexto:

| Item | Decisão |
|------|---------|
| Sidebar ativo | "SmartGrid" (categoria FERRAMENTAS) |
| Breadcrumb | "Ferramentas › SmartGrid" |
| Topbar direita | "Admin ECF" / "A1 Engenharia" + avatar "AE" |
| Sidebar footer | Dot verde + "Servidor Online" |
| Layout conteúdo (UX-SGR-001) | **Grade full-width** editável com toolbar de ações em massa |
| Layout conteúdo (UX-SGR-002) | **Formulário + sidebar metadata** (280px) |
| Layout conteúdo (UX-SGR-003) | **Grade de seleção** + painel split de confirmação |
| Botão primário | Azul `#2E86C1` ("Submeter Lote" / "Salvar") |
| Botão perigo | Vermelho `#E74C3C` ("Excluir N registros") |

---

## 2. Sidebar — Variante Ferramentas

```
Sidebar (240×836, fill #FFF, border-right 1px #E8E8E6)
├── "ADMINISTRAÇÃO"
│   ├── Usuários (inativo)
│   └── Perfis e Permissões (inativo)
├── "ORGANIZAÇÃO"
│   └── Estrutura Org. (inativo)
├── "PROCESSOS"
│   ├── Modelagem (inativo)
│   ├── Casos (inativo)
│   └── Parametrização (inativo)
├── "APROVAÇÃO"
│   └── Movimentos (inativo)
├── "INTEGRAÇÃO"
│   ├── Protheus (inativo)
│   └── MCP Agentes (inativo)
├── "FERRAMENTAS"
│   └── SmartGrid (ATIVO: bg #E3F2FD, text #2E86C1)
└── Footer: dot verde 8×8 #27AE60 + "Servidor Online" (text 12px #888888)
```

---

## 3. Cores (além do AppShell)

```
VALID INDICATOR       bg:#E8F8EF  border-left:3px #27AE60     Linha válida ✅
WARNING INDICATOR     bg:#FFF8E1  border-left:3px #F39C12     Linha com alerta ⚠️
ERROR INDICATOR       bg:#FFEBEE  border-left:3px #E74C3C     Linha com erro ❌
VALID CELL            text:#1E7A42  bg:transparent             Célula OK
WARNING CELL          text:#E67E22  bg:#FFF8E1                 Célula com alerta
ERROR CELL            text:#E74C3C  bg:#FFEBEE                 Célula com erro bloqueante
TOOLBAR BG            #FFFFFF     Fundo da toolbar
TOOLBAR BORDER        #E8E8E6     Borda inferior da toolbar
GRID HEADER BG        #FAFAFA     Fundo do header da grade
GRID ROW HOVER        #F8F8F6     Hover nas linhas da grade
GRID BORDER           #F0F0EE     Bordas horizontais entre linhas
CELL EDITING          border:2px #2E86C1                      Célula em edição
FOOTER BAR BG         #FAFAFA     Fundo do footer com contagem
READONLY FIELD BG     #F8F8F6     Campo readonly no formulário
READONLY LOCK         #CCCCCC     Ícone de cadeado
METADATA SIDEBAR BG   #FAFAFA     Fundo do sidebar de metadata
DELETE SPLIT RED      bg:#FFEBEE  border:1px #F5C6CB          Painel bloqueados
DELETE SPLIT GREEN    bg:#E8F8EF  border:1px #B5E8C9          Painel liberados
DANGER BTN            text:#FFF   bg:#E74C3C                  Botão excluir
DANGER BTN HOVER      bg:#C0392B                              Hover perigo
DISABLED BTN          bg:#E8E8E6  text:#CCCCCC                Botão desabilitado
MODAL OVERLAY         rgba(0,0,0,0.3)   Backdrop
```

---

## 4. Tipografia (conteúdo específico)

```
PAGE HEADER
  "Grade de Inclusão em Massa"    800  24px  #111111
  "Operação: {nome_operacao}"     400  13px  #888888
  "Submeter Lote"                 700  13px  #FFFFFF  (botão azul)

TOOLBAR
  "Import JSON"                   600  12px  #555555  (botão secondary)
  "Export JSON"                   600  12px  #555555
  "+ Nova Linha"                  700  12px  #2E86C1
  "Ações em Lote"                 600  12px  #555555  (dropdown)

GRID HEADER
  "CÓDIGO" etc.                   700  10px  uppercase  ls:+0.8px  #888888

GRID BODY
  Valor de célula                 500  13px  #111111
  Célula placeholder              400  13px  #CCCCCC
  Célula erro                     500  13px  #E74C3C
  Célula alerta                   500  13px  #E67E22
  Status ícone ✅                  —    14px  aria-label:"Linha válida"
  Status ícone ⚠️                  —    14px  aria-label:"Linha com alerta"
  Status ícone ❌                  —    14px  aria-label:"Linha com erro bloqueante"

FOOTER
  "6 de 8 linhas válidas"         500  13px  #555555
  "Submeter Lote"                 700  13px  #FFFFFF  (botão azul, disabled se ❌)

FORMULÁRIO (UX-SGR-002)
  Título do registro              700  18px  #111111
  Label campo "CÓDIGO"            700  10px  uppercase  ls:+0.8px  #888888
  Input text                      500  14px  #111111
  Input placeholder               400  14px  #CCCCCC
  Readonly value                  500  14px  #888888
  Lock icon                       —    16px  #CCCCCC
  Erro inline                     500  11px  #E74C3C
  Alerta inline                   500  11px  #E67E22
  "Validar"                       700  13px  #FFFFFF  (botão azul)
  "Salvar"                        700  13px  #FFFFFF  (botão azul)
  "Cancelar"                      600  13px  #555555

METADATA SIDEBAR
  "STATUS"                        700  10px  uppercase  ls:+0.8px  #888888
  Valor "ATIVO"                   600  12px  #1E7A42
  "CRIADO EM"                     700  10px  uppercase  ls:+0.8px  #888888
  Data                            400  12px  #555555
  "ATUALIZADO EM"                 700  10px  uppercase  ls:+0.8px  #888888
  "ENQUADRADOR"                   700  10px  uppercase  ls:+0.8px  #888888

DELETE PANEL
  "Não podem ser excluídos (2)"   700  14px  #E74C3C
  "Prontos para exclusão (3)"     700  14px  #27AE60
  Motivo bloqueio                 400  12px  #E74C3C
  Nome do registro                500  13px  #111111
  "Cancelar"                      600  13px  #555555
  "Excluir 3 registros"           700  13px  #FFFFFF  (botão danger)

RESULT FEEDBACK
  "3 registros excluídos com sucesso"    600  14px  #1E7A42
  "2 registros não excluídos"            600  14px  #E74C3C
  Motivo falha                           400  12px  #888888
  "Fechar"                               600  13px  #555555
```

---

## 5. View 1 — Grade de Inclusão em Massa (UX-SGR-001)

### Estrutura de Elementos

```
95-SmartGrid-Inclusao (frame 1440×900)
│
├── Topbar (branca 64px)
│   ├── Logo A1 azul + "GRUPO A1" / "PORTAL INTERNO"
│   ├── Separador + Breadcrumb: "Ferramentas" #888 › "SmartGrid" #111 bold
│   └── Direita: "Admin ECF" / "A1 Engenharia" + avatar "AE"
│
├── Sidebar (240px, ativo: "SmartGrid")
│   └── (mesma estrutura seção 2)
│
└── ContentArea (1200×836, fill #F5F5F3, padding:24px)
    │
    ├── PageHeader (group, flex justify-between, align-center)
    │   ├── Esquerda
    │   │   ├── "Grade de Inclusão em Massa" (24px 800 #111)
    │   │   └── "Operação: {nome_operacao}" (13px 400 #888, mt:4px)
    │   └── Direita (flex, gap:8px)
    │       ├── BtnImport (secondary: r:8, border #E8E8E6, h:36, p:0 14px)
    │       │   └── ↓ ícone + "Import JSON" (12px 600 #555)
    │       └── BtnExport (secondary: r:8, border #E8E8E6, h:36, p:0 14px)
    │           └── ↑ ícone + "Export JSON" (12px 600 #555)
    │
    ├── Toolbar (group, flex justify-between, align-center, mt:16px)
    │   ├── Esquerda (flex, gap:8px)
    │   │   ├── BtnNovaLinha (text: r:8, h:36, p:0 14px)
    │   │   │   └── "+ Nova Linha" (12px 700 #2E86C1)
    │   │   └── BtnAcoesLote (dropdown: r:8, border #E8E8E6, h:36, p:0 14px)
    │   │       └── "Ações em Lote" + chevron-down (12px 600 #555)
    │   │       └── [Dropdown]
    │   │           ├── "Aplicar valor em coluna" (13px 500 #333)
    │   │           ├── "Limpar coluna" (13px 500 #333)
    │   │           └── "Duplicar linhas selecionadas" (13px 500 #333)
    │   └── Direita
    │       └── Contagem "8 linhas" (12px 400 #888)
    │
    ├── GridCard (group, fill #FFF, r:12, border #E8E8E6, mt:12px, overflow hidden)
    │   │
    │   ├── GridHeader (h:44, bg #FAFAFA, border-bottom 1px #F0F0EE, p:0 16px)
    │   │   ├── Checkbox (18×18, r:4, border #E8E8E6)
    │   │   ├── "STATUS" (w:50)
    │   │   ├── "CÓDIGO" (w:120)
    │   │   ├── "DESCRIÇÃO" (w:flex)
    │   │   ├── "VALOR" (w:100)
    │   │   ├── "QUANTIDADE" (w:100)
    │   │   ├── "TIPO" (w:120)
    │   │   └── "DEPARTAMENTO" (w:140)
    │   │
    │   ├── GridRow (h:48, border-bottom 1px #F0F0EE, p:0 16px, border-left:3px)
    │   │   ├── [border-left cor = status: #27AE60 valid, #F39C12 warning, #E74C3C error]
    │   │   ├── Checkbox (18×18)
    │   │   ├── StatusIcon (✅ ou ⚠️ ou ❌, 14px)
    │   │   ├── CellCodigo (click-to-edit, 13px 500 #111)
    │   │   ├── CellDescricao (click-to-edit, 13px 500 #111)
    │   │   ├── CellValor (click-to-edit, 13px 500 #111, text-align right)
    │   │   ├── CellQuantidade (click-to-edit, 13px 500 #111, text-align right)
    │   │   ├── CellTipo (dropdown, 13px 500 #111)
    │   │   └── CellDepartamento (dropdown, 13px 500 #111)
    │   │
    │   ├── [Linhas 1-3: border-left #27AE60, ícone ✅]
    │   ├── [Linhas 4-5: border-left #F39C12, ícone ⚠️, célula com alerta bg #FFF8E1]
    │   ├── [Linha 6: border-left #E74C3C, ícone ❌, célula com erro bg #FFEBEE]
    │   ├── [Linhas 7-8: border-left #27AE60, ícone ✅]
    │   │
    │   └── GridFooter (h:52, p:0 16px, flex justify-between, align-center, bg #FAFAFA, border-top 1px #F0F0EE)
    │       ├── Contagem "6 de 8 linhas válidas" (13px 500 #555)
    │       └── BtnSubmeter (primary: r:8, fill #2E86C1, h:40, p:0 20px)
    │           └── "Submeter Lote" (13px 700 #FFF)
    │           [Disabled se qualquer linha ❌: fill #E8E8E6, text #CCC, cursor not-allowed]
    │
    └── [Modal: CloseConfirmationModal — ao tentar sair com dados não salvos]
```

### Modal de Confirmação de Saída

```
ModalOverlay (fixed, inset 0, bg rgba(0,0,0,0.3), z:60, flex center)
│
└── ModalCard (w:420, r:12, fill #FFF, shadow 0 8px 32px rgba(0,0,0,0.12), p:24px)
    │
    ├── ÍconeWarning (48×48, r:50%, bg #FFF3E0, stroke #E67E22, centrado)
    │
    ├── Título "Alterações não salvas" (18px 700 #111, mt:16px, text-align center)
    │
    ├── Mensagem (mt:8px, text-align center)
    │   └── "Existem alterações não salvas. Deseja sair?"
    │       (13px 400 #555)
    │
    └── BotõesRow (mt:24px, flex justify-center, gap:12px)
        ├── BtnCancelar (h:40, r:8, border #E8E8E6, p:0 20px)
        │   └── "Cancelar" (13px 600 #555)
        ├── BtnExportar (h:40, r:8, border #2E86C1, p:0 20px)
        │   └── "Exportar e sair" (13px 600 #2E86C1)
        └── BtnSair (h:40, r:8, fill #E74C3C, p:0 20px)
            └── "Sair sem exportar" (13px 700 #FFF)
```

### Modal de Import JSON

```
ModalOverlay (fixed, inset 0, bg rgba(0,0,0,0.3), z:60, flex center)
│
└── ModalCard (w:520, r:12, fill #FFF, shadow 0 8px 32px rgba(0,0,0,0.12), p:24px)
    │
    ├── Título "Importar JSON" (18px 700 #111)
    │
    ├── DropZone (mt:16px, w:100%, h:160, r:8, border:2px dashed #E8E8E6, flex-col center)
    │   ├── Ícone upload (48×48, stroke #CCC)
    │   ├── "Arraste um arquivo ou clique para selecionar" (13px 500 #888, mt:8px)
    │   └── ".json (máx. {MAX} linhas)" (11px 400 #CCC, mt:4px)
    │
    ├── [Após upload: SchemaValidationPreview]
    │   ├── Ícone ✅ + "Schema válido — {N} linhas detectadas" (13px 500 #1E7A42)
    │   └── OU Ícone ❌ + "Schema inválido: {motivo}" (13px 500 #E74C3C)
    │
    └── BotõesRow (mt:24px, flex justify-end, gap:12px)
        ├── BtnCancelar (h:40, r:8, border #E8E8E6, p:0 20px)
        │   └── "Cancelar" (13px 600 #555)
        └── BtnImportar (h:40, r:8, fill #2E86C1, p:0 20px, disabled se schema inválido)
            └── "Importar" (13px 700 #FFF)
```

---

## 6. View 2 — Formulário de Alteração (UX-SGR-002)

### Estrutura de Elementos

```
95-SmartGrid-Alteracao (frame 1440×900)
│
├── Topbar (branca 64px)
│   ├── Logo A1 azul + "GRUPO A1" / "PORTAL INTERNO"
│   ├── Separador + Breadcrumb: "Ferramentas" #888 › "SmartGrid" #888 › "Alterar Registro" #111 bold
│   └── Direita: "Admin ECF" / "A1 Engenharia" + avatar "AE"
│
├── Sidebar (240px, ativo: "SmartGrid")
│
└── ContentArea (1200×836, fill #F5F5F3, padding:24px)
    │
    ├── TopActions (flex justify-between, align-center)
    │   ├── BtnVoltar (text: flex, gap:6px, align-center)
    │   │   └── ← ícone + "Voltar" (13px 600 #555)
    │   └── BtnValidar (primary: r:8, fill #2E86C1, h:36, p:0 14px)
    │       └── "Validar" (12px 700 #FFF)
    │
    ├── FormLayout (flex, gap:24px, mt:16px)
    │   │
    │   ├── FormCard (flex:1, fill #FFF, r:12, border #E8E8E6, p:24px)
    │   │   │
    │   │   ├── FormTitle "Alterar Registro" (18px 700 #111)
    │   │   │
    │   │   ├── FieldGroup (mt:20px, display:grid, grid:2col, gap:16px)
    │   │   │   │
    │   │   │   ├── CampoCodigo (readonly)
    │   │   │   │   ├── Label "CÓDIGO" (10px 700 uppercase ls:+0.8px #888, mb:6px)
    │   │   │   │   ├── ReadOnlyField (w:100%, h:42, r:8, fill #F8F8F6, border #F0F0EE, p:10px 14px)
    │   │   │   │   │   ├── Valor (14px 500 #888)
    │   │   │   │   │   └── LockIcon (16×16, stroke #CCC, float right)
    │   │   │   │   └── Tooltip hover: "Este campo não pode ser editado para o status atual do registro."
    │   │   │   │
    │   │   │   ├── CampoDescricao (editable)
    │   │   │   │   ├── Label "DESCRIÇÃO" (mesma tipografia)
    │   │   │   │   └── Input (w:100%, h:42, r:8, border #E8E8E6, p:10px 14px, font 14px 500 #111)
    │   │   │   │
    │   │   │   ├── CampoValor (editable)
    │   │   │   │   ├── Label "VALOR"
    │   │   │   │   └── Input (mesma estrutura)
    │   │   │   │
    │   │   │   ├── CampoQuantidade (editable)
    │   │   │   │   ├── Label "QUANTIDADE"
    │   │   │   │   └── Input (mesma estrutura)
    │   │   │   │
    │   │   │   ├── CampoTipo (readonly)
    │   │   │   │   ├── Label "TIPO"
    │   │   │   │   ├── ReadOnlyField (mesma estrutura readonly + lock)
    │   │   │   │   └── Tooltip hover
    │   │   │   │
    │   │   │   └── CampoDepartamento (editable)
    │   │   │       ├── Label "DEPARTAMENTO"
    │   │   │       └── Select (w:100%, h:42, r:8, border #E8E8E6)
    │   │   │
    │   │   ├── ValidationResults (mt:20px, r:8, border #E8E8E6, p:16px)
    │   │   │   ├── Título "Resultados da Validação" (14px 700 #111, mb:12px)
    │   │   │   ├── AlertRow (flex, gap:8px, align-center, p:8px, r:6, bg #FFF8E1)
    │   │   │   │   └── ⚠️ + "Campo 'Valor' abaixo do mínimo recomendado." (12px 500 #E67E22)
    │   │   │   └── SummaryRow (mt:8px)
    │   │   │       └── "1 alerta • 0 erros bloqueantes" (12px 400 #888)
    │   │   │
    │   │   └── FormFooter (mt:20px, flex justify-end, gap:12px)
    │   │       ├── BtnCancelar (h:40, r:8, border #E8E8E6, p:0 20px)
    │   │       │   └── "Cancelar" (13px 600 #555)
    │   │       └── BtnSalvar (h:40, r:8, fill #2E86C1, p:0 20px)
    │   │           └── "Salvar" (13px 700 #FFF)
    │   │           [Disabled se blocking errors: fill #E8E8E6, text #CCC]
    │   │
    │   └── MetadataSidebar (w:280, fill #FFF, r:12, border #E8E8E6, p:20px)
    │       │
    │       ├── SidebarTitle "Metadata" (14px 700 #111, mb:16px)
    │       │
    │       ├── MetaItem (mb:16px)
    │       │   ├── Label "STATUS" (10px 700 uppercase ls:+0.8px #888)
    │       │   └── Badge "ATIVO" (mt:4px, r:4, p:2px 8px, text 10px 700 #1E7A42, bg #E8F8EF)
    │       │
    │       ├── MetaItem (mb:16px)
    │       │   ├── Label "CRIADO EM"
    │       │   └── Valor "30 mar 2026, 14:32" (12px 400 #555, mt:4px)
    │       │
    │       ├── MetaItem (mb:16px)
    │       │   ├── Label "ATUALIZADO EM"
    │       │   └── Valor "31 mar 2026, 09:15" (12px 400 #555, mt:4px)
    │       │
    │       └── MetaItem
    │           ├── Label "ENQUADRADOR"
    │           └── Valor "Motor MOD-007 v2.1" (12px 400 #555, mt:4px)
```

---

## 7. View 3 — Grade de Exclusão em Massa (UX-SGR-003)

### Estrutura de Elementos

```
95-SmartGrid-Exclusao (frame 1440×900)
│
├── Topbar (branca 64px)
│   ├── Logo A1 azul + "GRUPO A1" / "PORTAL INTERNO"
│   ├── Separador + Breadcrumb: "Ferramentas" #888 › "SmartGrid" #888 › "Exclusão em Massa" #111 bold
│   └── Direita: "Admin ECF" / "A1 Engenharia" + avatar "AE"
│
├── Sidebar (240px, ativo: "SmartGrid")
│
└── ContentArea (1200×836, fill #F5F5F3, padding:24px)
    │
    ├── PageHeader (flex justify-between, align-center)
    │   ├── Esquerda
    │   │   ├── "Exclusão em Massa" (24px 800 #111)
    │   │   └── "5 registros selecionados" (13px 400 #888, mt:4px)
    │   └── BtnVerificar (primary: r:8, fill #2E86C1, h:40, p:0 20px)
    │       └── "Verificar" (13px 700 #FFF)
    │
    ├── GridCard (fill #FFF, r:12, border #E8E8E6, mt:16px)
    │   ├── GridHeader (h:44, bg #FAFAFA, border-bottom 1px #F0F0EE, p:0 16px)
    │   │   ├── "STATUS" (w:60)
    │   │   ├── "CÓDIGO" (w:120)
    │   │   ├── "DESCRIÇÃO" (w:flex)
    │   │   └── "RESULTADO" (w:200)
    │   │
    │   └── GridRows (5 linhas)
    │       ├── Row com ✅ "Pode ser excluído" (text #1E7A42)
    │       ├── Row com ✅ "Pode ser excluído"
    │       ├── Row com ❌ "Bloqueado: {motivo}" (text #E74C3C)
    │       ├── Row com ✅ "Pode ser excluído"
    │       └── Row com ❌ "Bloqueado: {motivo}"
    │
    └── [Overlay: DeleteConfirmationPanel]
```

### DeleteConfirmationPanel

```
ConfirmationOverlay (fixed, inset 0, bg rgba(0,0,0,0.3), z:50, flex center)
│
└── ConfirmationCard (w:720, r:12, fill #FFF, shadow 0 8px 32px rgba(0,0,0,0.12))
    │
    ├── Header (p:20px 24px, border-bottom 1px #E8E8E6)
    │   └── "Confirmação de Exclusão" (18px 700 #111)
    │
    ├── SplitView (flex, min-h:300px)
    │   │
    │   ├── BlockedPanel (flex:1, p:20px, bg #FFEBEE, border-right 1px #F0F0EE)
    │   │   ├── Título "Não podem ser excluídos (2)" (14px 700 #E74C3C, mb:12px)
    │   │   ├── RecordItem (p:12px, r:8, bg #FFF, mb:8px, border 1px #F5C6CB)
    │   │   │   ├── Nome "REG-004 — Item Bloqueado" (13px 600 #111)
    │   │   │   └── Motivo "Possui movimentos pendentes de aprovação" (12px 400 #E74C3C, mt:4px)
    │   │   └── RecordItem (mesma estrutura)
    │   │
    │   └── ReadyPanel (flex:1, p:20px, bg #E8F8EF)
    │       ├── Título "Prontos para exclusão (3)" (14px 700 #27AE60, mb:12px)
    │       ├── RecordItem (p:12px, r:8, bg #FFF, mb:8px, border 1px #B5E8C9)
    │       │   └── Nome "REG-001 — Item Válido" (13px 600 #111)
    │       ├── RecordItem
    │       └── RecordItem
    │
    └── Footer (p:16px 24px, border-top 1px #E8E8E6, flex justify-end, gap:12px)
        ├── BtnCancelar (h:40, r:8, border #E8E8E6, p:0 20px)
        │   └── "Cancelar" (13px 600 #555)
        └── BtnExcluir (h:40, r:8, fill #E74C3C, p:0 20px)
            └── "Excluir 3 registros" (13px 700 #FFF)
```

### DeleteResultFeedback

```
FeedbackCard (w:480, r:12, fill #FFF, shadow 0 8px 32px rgba(0,0,0,0.12), p:24px)
│
├── Título "Resultado da Exclusão" (18px 700 #111, mb:16px)
│
├── SuccessSection (p:12px, r:8, bg #E8F8EF, mb:12px)
│   └── ✅ "3 registros excluídos com sucesso" (14px 600 #1E7A42)
│
├── FailureSection (p:12px, r:8, bg #FFEBEE)
│   ├── ❌ "2 registros não excluídos" (14px 600 #E74C3C, mb:8px)
│   ├── FailItem "REG-004 — Possui movimentos pendentes" (12px 400 #888, ml:22px)
│   └── FailItem "REG-005 — Registro já excluído" (12px 400 #888, ml:22px)
│
└── BtnFechar (mt:20px, h:40, r:8, border #E8E8E6, p:0 20px, align-self center)
    └── "Fechar" (13px 600 #555)
```

---

## 8. Estados da Tela

### Loading (Skeleton) — UX-SGR-001

```
GridCard
├── GridHeader (normal)
└── SkeletonRows (6×)
    ├── Rect 18×18 r:4 bg:#E8E8E6 animate pulse   (checkbox)
    ├── Circle 14×14 bg:#E8E8E6 animate pulse      (status)
    ├── Rect 80×14 r:4 bg:#E8E8E6 animate pulse    (código)
    ├── Rect 180×14 r:4 bg:#E8E8E6 animate pulse   (descrição)
    ├── Rect 60×14 r:4 bg:#E8E8E6 animate pulse    (valor)
    ├── Rect 50×14 r:4 bg:#E8E8E6 animate pulse    (quantidade)
    ├── Rect 80×14 r:4 bg:#E8E8E6 animate pulse    (tipo)
    └── Rect 100×14 r:4 bg:#E8E8E6 animate pulse   (departamento)
```

### Loading (Skeleton) — UX-SGR-002

```
FormCard
├── Rect 200×20 r:4 bg:#E8E8E6 animate pulse       (título)
├── Grid 2col (mt:20px)
│   ├── FieldSkeleton × 6
│   │   ├── Rect 60×10 r:4 bg:#E8E8E6 animate pulse (label)
│   │   └── Rect 100%×42 r:8 bg:#E8E8E6 animate pulse (input)
```

### Empty State — UX-SGR-001

```
EmptyContainer (flex-col, align-center, p:60px)
├── Ilustração (120×120, ícone grid, stroke #CCC, fill none)
├── "Nenhuma linha adicionada." (16px 600 #888, mt:16px)
├── "Clique em 'Adicionar linha' para começar." (13px 400 #AAA, mt:4px)
└── BtnAdicionar (primary, mt:16px)
    └── "+ Adicionar primeira linha" (13px 700 #FFF)
```

### Error State

```
ErrorContainer (flex-col, align-center, p:40px)
├── Ícone alert-triangle (48×48, stroke #E74C3C)
├── "Não foi possível carregar a configuração da Operação." (14px 500 #888, mt:12px)
└── BtnRetry (secondary, mt:12px)
    └── "Tentar novamente" (13px 600 #555)
```

---

## 9. Medidas

```
Content area          1200×836    fill:#F5F5F3  padding:24px
Page header           auto×auto   flex justify-between
Toolbar               auto×48     flex justify-between  align-center
Grid card             auto×auto   r:12  border:1px #E8E8E6  fill:#FFF
Grid header           auto×44     bg:#FAFAFA  border-bottom:1px #F0F0EE
Grid row              auto×48     border-bottom:1px #F0F0EE  hover:#F8F8F6
Grid cell padding     0 12px
Grid footer           auto×52     bg:#FAFAFA  border-top:1px #F0F0EE
Status indicator      border-left:3px  (cor por status)
Checkbox              18×18       r:4   border:1px #E8E8E6
Cell editing border   2px solid #2E86C1
Form card             flex:1      r:12  border:1px #E8E8E6  fill:#FFF  p:24px
Metadata sidebar      280×auto    r:12  border:1px #E8E8E6  fill:#FFF  p:20px
Input field           100%×42     r:8   border:1px #E8E8E6
Readonly field        100%×42     r:8   fill:#F8F8F6  border:#F0F0EE
Lock icon             16×16       stroke:#CCC
Confirmation card     720×auto    r:12  shadow:0 8px 32px rgba(0,0,0,0.12)
Feedback card         480×auto    r:12  shadow:0 8px 32px rgba(0,0,0,0.12)
Close modal           420×auto    r:12
Import modal          520×auto    r:12
Button primary        auto×40     r:8   fill:#2E86C1
Button secondary      auto×40     r:8   border:1px #E8E8E6
Button danger         auto×40     r:8   fill:#E74C3C
Button disabled       auto×40     r:8   fill:#E8E8E6  text:#CCC
Button small          auto×36     r:8
```

---

## 10. Responsividade

| Breakpoint | Comportamento |
|---|---|
| >= 1280px | Grade full-width, todas colunas visíveis, formulário com sidebar metadata |
| 1024-1279px | Grade com scroll horizontal, formulário sem sidebar metadata (metadata abaixo) |
| 768-1023px | Grade compacta (3 colunas visíveis + scroll), formulário single-column, modais 100% width |
| < 768px | Grade em cards verticais (1 card por registro), formulário full-screen, DeleteConfirmationPanel em stack vertical |

---

## 11. Componentes a Criar

| Componente | Descrição | Reutilização |
|---|---|---|
| `smartgrid/SmartGridPage` | Página principal com grade editável, toolbar, footer | Rota /ferramentas/smartgrid/inclusao-em-massa |
| `smartgrid/SmartDataGrid` | Grade editável com colunas dinâmicas, validação por linha, click-to-edit | SmartGridPage |
| `smartgrid/SmartGridHeader` | Header com nome da Operação, botões Import/Export | SmartGridPage |
| `smartgrid/MassActionToolbar` | Toolbar com "+ Nova Linha", "Ações em Lote" dropdown | SmartGridPage |
| `smartgrid/GridFooterBar` | Footer com contagem de linhas válidas + botão "Submeter Lote" | SmartGridPage |
| `smartgrid/SmartEditForm` | Formulário de alteração com campos dinâmicos (editáveis + readonly) | Rota /{modulo}/{rotina}/{id}/alterar |
| `smartgrid/ValidationResultsPanel` | Painel de resultados de validação (alertas + erros inline) | SmartEditForm, SmartGridPage |
| `smartgrid/MetadataSidebar` | Sidebar com metadata do registro (status, datas, enquadrador) | SmartEditForm |
| `smartgrid/DeleteConfirmationPanel` | Split view com registros bloqueados (vermelho) e liberados (verde) | Rota exclusao-em-massa |
| `smartgrid/DeleteResultFeedback` | Feedback de resultado da exclusão com contadores | Rota exclusao-em-massa |
| `smartgrid/CloseConfirmationModal` | Modal de confirmação ao sair com dados não salvos | SmartGridPage |
| `smartgrid/ImportJsonModal` | Modal de upload JSON com validação de schema | SmartGridPage |
| `ui/ReadOnlyField` | Campo readonly com ícone de cadeado | SmartEditForm, futuras telas |

---

## 12. Checklist

- [ ] Sidebar: "SmartGrid" ativo na categoria FERRAMENTAS
- [ ] Breadcrumb: "Ferramentas › SmartGrid"
- [ ] UX-SGR-001: Grade editável com colunas dinâmicas do motor MOD-007
- [ ] UX-SGR-001: Indicadores de validação por linha (✅ ⚠️ ❌) com border-left colorido
- [ ] UX-SGR-001: Toolbar com Import JSON, Export JSON, + Nova Linha, Ações em Lote
- [ ] UX-SGR-001: Click-to-edit nas células, Tab para avançar
- [ ] UX-SGR-001: Footer com contagem "X de Y linhas válidas" + botão "Submeter Lote"
- [ ] UX-SGR-001: "Submeter Lote" disabled se qualquer linha com ❌
- [ ] UX-SGR-001: Modal de confirmação ao sair com dados não salvos
- [ ] UX-SGR-001: Modal de Import JSON com validação de schema
- [ ] UX-SGR-002: Formulário com campos editáveis e readonly (lock icon)
- [ ] UX-SGR-002: Motor evaluation roda no open (loading state)
- [ ] UX-SGR-002: Botão "Validar" → resultados inline → "Salvar" (disabled se blocking)
- [ ] UX-SGR-002: Sidebar metadata (280px) com Status, Criado em, Atualizado em, Enquadrador
- [ ] UX-SGR-003: Grade com validação pré-exclusão por registro
- [ ] UX-SGR-003: DeleteConfirmationPanel split view (vermelho bloqueados / verde liberados)
- [ ] UX-SGR-003: DeleteResultFeedback com contagem sucesso/falha
- [ ] UX-SGR-003: Botão "Excluir N registros" (danger) no footer do painel
- [ ] Acessibilidade: Tab/Enter/Escape na grade, aria-labels nos ícones de status
- [ ] Acessibilidade: Focus trap em modais, aria-describedby em erros inline
- [ ] Loading skeleton para grade e formulário
- [ ] Empty state para grade sem linhas
- [ ] Error state com botão "Tentar novamente"
- [ ] Responsividade: grade horizontal scroll < 1280px, cards < 768px
