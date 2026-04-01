# 90-Parametrization — Spec Definitiva

> **Rota:** `/configuracao/parametrizacao` | **Módulo:** MOD-007 | **Screen IDs:** UX-PARAM-001, UX-ROTINA-001
> **Viewport:** 1440 × 900 px | **Font:** Plus Jakarta Sans
> **Referência:** UX-007.md (jornadas e fluxos da parametrização contextual e rotinas)

---

## 1. Decisões de Design (PO)

AppShell reutilizado, com sidebar adaptada para este contexto:

| Item | Decisão |
|------|---------|
| Sidebar ativo | "Parametrização" (categoria PROCESSOS) |
| Breadcrumb | "Processos › Parametrização" |
| Topbar direita | "Admin ECF" / "A1 Engenharia" + avatar "AE" |
| Sidebar footer | Dot verde + "Servidor Online" |
| Layout conteúdo (UX-PARAM-001) | **3-panel layout** (left 280px + center flex + right flex) |
| Layout conteúdo (UX-ROTINA-001) | **Split-view** (left 280px + right flex) |
| Botão primário | Azul `#2E86C1` |
| Modais | Centralizados com overlay |

---

## 2. Sidebar — Variante Parametrização

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
│   └── Parametrização (ATIVO: bg #E3F2FD, text #2E86C1)
├── "APROVAÇÃO"
│   └── Movimentos (inativo)
└── Footer: dot verde 8×8 #27AE60 + "Servidor Online" (text 12px #888888)
```

---

## 3. Cores (além do AppShell)

```
ACTIVE BADGE         text:#1E7A42  bg:#E8F8EF  border:#B5E8C9
EXPIRED BADGE        text:#B8860B  bg:#FFF3E0  border:#FFE0B2
INACTIVE BADGE       text:#888888  bg:#F5F5F3  border:#E8E8E6
DRAFT BADGE          text:#B8860B  bg:#FFF3E0  border:#FFE0B2
PUBLISHED BADGE      text:#1E7A42  bg:#E8F8EF  border:#B5E8C9
DEPRECATED BADGE     text:#888888  bg:#F5F5F3  border:#E8E8E6
BLOCKING BADGE       text:#C0392B  bg:#FFEBEE  border:#F5C6CB
PANEL BG             #FFFFFF     Fundo dos painéis
PANEL BORDER         #E8E8E6     Borda entre painéis
TABLE HEADER BG      #FAFAFA     Fundo do header da tabela/lista
TABLE ROW HOVER      #F8F8F6     Hover nas linhas
TABLE BORDER         #F0F0EE     Bordas horizontais entre linhas
MATRIX CELL BG       #FFFFFF     Fundo das células da matriz
MATRIX CELL CHECKED  #E3F2FD     Célula com checkbox ativo
MATRIX HEADER BG     #FAFAFA     Header da matriz
MODAL OVERLAY        rgba(0,0,0,0.3)   Backdrop do modal
MODAL SHADOW         0 8px 32px rgba(0,0,0,0.12)
AUTO-SAVE GREEN      #27AE60     Indicador "Salvo"
WARNING ICON BG      #FFF3E0     Fundo do ícone warning
WARNING ICON STROKE  #E67E22     Stroke do ícone warning
LINK BUTTON          text:#2E86C1  Botões de vincular/desvincular
EMPTY STATE TEXT     #888888     Texto do empty state
EMPTY STATE ICON     #CCCCCC     Ícone ilustração empty state
```

---

## 4. Tipografia (conteúdo específico)

```
PAGE HEADER
  "Parametrização"                 800  24px  #111111
  "Configure enquadradores..."    400  13px  #888888
  "+ Novo Enquadrador"            700  13px  #FFFFFF  (botão azul)

PANEL HEADER
  "Enquadradores"                 700  16px  #111111
  "Objetos Alvo"                  700  16px  #111111
  "Matriz de Incidência"          700  16px  #111111

LIST ITEM
  Nome enquadrador                600  13px  #111111
  Tipo                            400  12px  #888888
  Datas vigência                  400  11px  #888888
  Status badge "ATIVO"            700  10px  uppercase  (verde)
  Status badge "EXPIRADO"         700  10px  uppercase  (âmbar)

MATRIX
  Header coluna (rotina)          700  10px  uppercase  ls:+0.8px  #888888
  Header linha (enquadrador)      600  12px  #333333
  Checkbox cell                   —    —     —

ROUTINE LIST
  Nome rotina                     600  13px  #111111
  Versão                          400  12px  #888888
  Status badge "RASCUNHO"         700  10px  uppercase  (âmbar)
  Status badge "PUBLICADA"        700  10px  uppercase  (verde)
  Status badge "DEPRECADA"        700  10px  uppercase  (cinza)

EDITOR
  Título rotina                   700  18px  #111111
  Label campo "TIPO DO ITEM"      700  10px  uppercase  ls:+0.8px  #888888
  Item description                500  13px  #333333
  Item type badge                 700  10px  uppercase  #2E86C1
  Auto-save "Salvo"               600  12px  #27AE60
  Toolbar button                  700  13px  #FFFFFF  (botão azul)

MODAL
  Título modal                    700  18px  #111111
  Mensagem                        400  13px  #555555
  Textarea placeholder            400  14px  #CCCCCC
  Char counter                    400  11px  #888888
  "Cancelar"                      600  13px  #555555
  "Criar Fork"                    700  13px  #FFFFFF
  Warning text                    500  13px  #E67E22
```

---

## 5. View 1 — Configurador de Enquadradores e Regras de Incidência (UX-PARAM-001)

### 5.1 Estrutura de Elementos

```
90-Parametrization-View1 (frame 1440×900)
│
├── Topbar (branca 64px)
│   ├── Logo A1 azul + "GRUPO A1" / "PORTAL INTERNO"
│   ├── Separador + Breadcrumb: "Processos" #888 › "Parametrização" #111 bold
│   └── Direita: "Admin ECF" / "A1 Engenharia" + avatar "AE"
│
├── Sidebar (240px, ativo: "Parametrização")
│   └── (mesma estrutura seção 2)
│
└── ContentArea (1200×836, fill #F5F5F3, padding:24px)
    │
    ├── PageHeader (group, flex justify-between, align-center)
    │   ├── Esquerda
    │   │   ├── "Parametrização" (24px 800 #111)
    │   │   └── "Configure enquadradores, objetos-alvo e regras de incidência" (13px 400 #888, mt:4px)
    │   └── Direita (flex, gap:12px)
    │       ├── BtnDryRun (secondary: r:8, border #E8E8E6, h:40, p:0 20px, bg #FFF)
    │       │   └── "Simular Dry-Run" (13px 600 #555)
    │       └── BtnNovo (primary: r:8, fill #2E86C1, h:40, p:0 20px)
    │           └── "+ Novo Enquadrador" (13px 700 #FFF)
    │
    ├── ThreePanelLayout (flex, gap:16px, mt:20px, flex:1)
    │   │
    │   ├── LeftPanel (w:280px, fill #FFF, r:12, border #E8E8E6, flex-shrink:0)
    │   │   ├── PanelHeader (h:48, border-bottom 1px #F0F0EE, p:0 16px, flex align-center)
    │   │   │   └── "Enquadradores" (16px 700 #111)
    │   │   └── FramersList (overflow-y auto, flex:1)
    │   │       ├── FramerItem (p:12px 16px, border-bottom 1px #F0F0EE, cursor pointer, hover bg #F8F8F6)
    │   │       │   ├── TopRow (flex justify-between, align-center)
    │   │       │   │   ├── Name "Enquadrador Compras" (13px 600 #111)
    │   │       │   │   └── Badge "ATIVO" (verde: text #1E7A42, bg #E8F8EF, r:4, p:2px 8px, 10px 700)
    │   │       │   ├── Type "Tipo: AQUISIÇÃO" (12px 400 #888, mt:4px)
    │   │       │   └── Validity "01/01/2026 — 31/12/2026" (11px 400 #888, mt:2px)
    │   │       │
    │   │       ├── FramerItem (selected: bg #E3F2FD, border-left 3px #2E86C1)
    │   │       │   ├── Name "Enquadrador RH" (13px 600 #2E86C1)
    │   │       │   ├── Badge "ATIVO" (verde)
    │   │       │   ├── Type "Tipo: PESSOAL"
    │   │       │   └── Validity "01/03/2026 — 28/02/2027"
    │   │       │
    │   │       ├── FramerItem
    │   │       │   ├── Name "Enquadrador Fiscal" (13px 600 #111)
    │   │       │   ├── Badge "EXPIRADO" (âmbar: text #B8860B, bg #FFF3E0, r:4, p:2px 8px)
    │   │       │   ├── Type "Tipo: TRIBUTÁRIO"
    │   │       │   └── Validity "01/01/2025 — 31/12/2025"
    │   │       │
    │   │       └── FramerItem
    │   │           ├── Name "Enquadrador Logística" (13px 600 #111)
    │   │           ├── Badge "ATIVO" (verde)
    │   │           ├── Type "Tipo: OPERACIONAL"
    │   │           └── Validity "15/06/2026 — 14/06/2027"
    │   │
    │   ├── CenterPanel (flex:1, fill #FFF, r:12, border #E8E8E6)
    │   │   ├── PanelHeader (h:48, border-bottom 1px #F0F0EE, p:0 16px, flex align-center justify-between)
    │   │   │   ├── "Objetos Alvo" (16px 700 #111)
    │   │   │   └── BtnVincular (text: 13px 600 #2E86C1, cursor pointer)
    │   │   │       └── "+ Vincular"
    │   │   └── TargetObjectsList (overflow-y auto, flex:1, p:16px)
    │   │       ├── ObjectItem (p:12px, r:8, border 1px #E8E8E6, mb:8px)
    │   │       │   ├── TopRow (flex justify-between, align-center)
    │   │       │   │   ├── Name "Requisição de Compras" (13px 600 #111)
    │   │       │   │   └── BtnUnlink (text: 12px 500 #E74C3C, cursor pointer) "Desvincular"
    │   │       │   └── Module "Módulo: MOD-006" (11px 400 #888, mt:4px)
    │   │       │
    │   │       ├── ObjectItem
    │   │       │   ├── Name "Contrato de Serviço" (13px 600 #111)
    │   │       │   ├── BtnUnlink "Desvincular"
    │   │       │   └── Module "Módulo: MOD-006"
    │   │       │
    │   │       └── ObjectItem
    │   │           ├── Name "Ordem de Pagamento" (13px 600 #111)
    │   │           ├── BtnUnlink "Desvincular"
    │   │           └── Module "Módulo: MOD-006"
    │   │
    │   └── RightPanel (flex:1, fill #FFF, r:12, border #E8E8E6)
    │       ├── PanelHeader (h:48, border-bottom 1px #F0F0EE, p:0 16px, flex align-center justify-between)
    │       │   ├── "Matriz de Incidência" (16px 700 #111)
    │       │   └── FilterBadge "Somente PUBLISHED" (10px 700 #1E7A42, bg #E8F8EF, r:4, p:2px 8px)
    │       └── IncidenceMatrix (overflow auto, flex:1, p:16px)
    │           └── MatrixGrid (display grid)
    │               ├── HeaderRow
    │               │   ├── Cell (vazio, w:140px)
    │               │   ├── ColHeader "Rot. Validação" (10px 700 uppercase #888, text-align center, w:120px)
    │               │   ├── ColHeader "Rot. Visibilidade" (idem)
    │               │   ├── ColHeader "Rot. Obrigatoriedade" (idem)
    │               │   └── ColHeader "Rot. Domínio" (idem)
    │               │
    │               ├── DataRow (border-bottom 1px #F0F0EE, h:44px, hover bg #F8F8F6)
    │               │   ├── RowHeader "Enq. Compras" (12px 600 #333, w:140px, p:0 12px)
    │               │   ├── CheckboxCell (checked, bg #E3F2FD, center)
    │               │   ├── CheckboxCell (checked)
    │               │   ├── CheckboxCell (unchecked)
    │               │   └── CheckboxCell (checked)
    │               │
    │               ├── DataRow (selected row, bg #E3F2FD)
    │               │   ├── RowHeader "Enq. RH" (12px 600 #2E86C1)
    │               │   ├── CheckboxCell (checked)
    │               │   ├── CheckboxCell (unchecked)
    │               │   ├── CheckboxCell (checked)
    │               │   └── CheckboxCell (checked)
    │               │
    │               └── DataRow
    │                   ├── RowHeader "Enq. Logística"
    │                   ├── CheckboxCell (unchecked)
    │                   ├── CheckboxCell (checked)
    │                   ├── CheckboxCell (unchecked)
    │                   └── CheckboxCell (checked)
```

---

## 6. View 2 — Cadastro e Editor de Rotinas (UX-ROTINA-001)

### 6.1 Estrutura de Elementos

```
90-Parametrization-View2 (frame 1440×900)
│
├── Topbar (branca 64px)
│   ├── Logo A1 azul + "GRUPO A1" / "PORTAL INTERNO"
│   ├── Separador + Breadcrumb: "Processos" #888 › "Parametrização" #111 › "Rotinas" #111 bold
│   └── Direita: "Admin ECF" / "A1 Engenharia" + avatar "AE"
│
├── Sidebar (240px, ativo: "Parametrização")
│   └── (mesma estrutura seção 2)
│
└── ContentArea (1200×836, fill #F5F5F3, padding:24px)
    │
    └── SplitView (flex, gap:16px, flex:1)
        │
        ├── LeftPanel (w:280px, fill #FFF, r:12, border #E8E8E6, flex-shrink:0, flex-col)
        │   ├── PanelHeader (h:48, border-bottom 1px #F0F0EE, p:0 16px, flex align-center justify-between)
        │   │   ├── "Rotinas" (16px 700 #111)
        │   │   └── BtnNova (text: 13px 600 #2E86C1) "+ Nova"
        │   ├── FilterBar (p:8px 16px, border-bottom 1px #F0F0EE)
        │   │   └── StatusFilter (select, w:100%, h:36, r:6, border #E8E8E6, 12px 500)
        │   │       └── options: "Todos", "Rascunho", "Publicada", "Deprecada"
        │   └── RoutinesList (overflow-y auto, flex:1)
        │       ├── RoutineItem (p:12px 16px, border-bottom 1px #F0F0EE, cursor pointer)
        │       │   ├── TopRow (flex justify-between, align-center)
        │       │   │   ├── Name "Rotina de Validação Compras" (13px 600 #111)
        │       │   │   └── Badge "RASCUNHO" (âmbar: text #B8860B, bg #FFF3E0, r:4, p:2px 8px, 10px 700)
        │       │   └── Version "v3 · 5 itens" (11px 400 #888, mt:4px)
        │       │
        │       ├── RoutineItem (selected: bg #E3F2FD, border-left 3px #2E86C1)
        │       │   ├── Name "Rotina de Visibilidade RH" (13px 600 #2E86C1)
        │       │   ├── Badge "PUBLICADA" (verde: text #1E7A42, bg #E8F8EF, r:4, p:2px 8px)
        │       │   └── Version "v2 · 3 itens · Publicada 15/03/2026"
        │       │
        │       ├── RoutineItem
        │       │   ├── Name "Rotina de Obrigatoriedade" (13px 600 #111)
        │       │   ├── Badge "PUBLICADA" (verde)
        │       │   └── Version "v1 · 4 itens · Publicada 10/03/2026"
        │       │
        │       ├── RoutineItem
        │       │   ├── Name "Rotina de Domínio Fiscal" (13px 600 #111)
        │       │   ├── Badge "DEPRECADA" (cinza: text #888, bg #F5F5F3, r:4, p:2px 8px)
        │       │   └── Version "v1 · 2 itens · Deprecada 20/03/2026"
        │       │
        │       └── RoutineItem
        │           ├── Name "Rotina de Evidências" (13px 600 #111)
        │           ├── Badge "RASCUNHO" (âmbar)
        │           └── Version "v1 · 1 item"
        │
        └── RightPanel (flex:1, fill #FFF, r:12, border #E8E8E6, flex-col)
            ├── EditorHeader (h:64, border-bottom 1px #F0F0EE, p:0 20px, flex align-center justify-between)
            │   ├── Esquerda (flex, align-center, gap:12px)
            │   │   ├── Title "Rotina de Validação Compras" (18px 700 #111)
            │   │   ├── Badge "RASCUNHO" (âmbar)
            │   │   └── Version "v3" (12px 400 #888)
            │   └── Direita (flex, gap:8px)
            │       ├── AutoSave "Salvo ✓" (12px 600 #27AE60)
            │       ├── BtnPrevia (secondary: r:8, border #E8E8E6, h:36, p:0 16px)
            │       │   └── "Prévia" (13px 600 #555)
            │       ├── BtnFork (secondary: r:8, border #E8E8E6, h:36, p:0 16px)
            │       │   └── "Fork" (13px 600 #555)
            │       └── BtnPublicar (primary: r:8, fill #2E86C1, h:36, p:0 16px)
            │           └── "Publicar" (13px 700 #FFF)
            │
            ├── ItemsList (overflow-y auto, flex:1, p:20px)
            │   ├── RoutineItem (p:16px, r:8, border 1px #E8E8E6, mb:12px, hover shadow)
            │   │   ├── ItemHeader (flex justify-between, align-center)
            │   │   │   ├── Left (flex, gap:8px, align-center)
            │   │   │   │   ├── DragHandle (6×16, stroke #CCC, cursor grab)
            │   │   │   │   ├── TypeBadge "FIELD_VISIBILITY" (10px 700 #2E86C1, bg #E3F2FD, r:4, p:2px 8px)
            │   │   │   │   └── Ordinal "#1" (11px 600 #888)
            │   │   │   └── BtnRemover (trash 16×16, stroke #888, hover #E74C3C)
            │   │   └── Description "Ocultar campo CNPJ quando tipo=PF" (13px 500 #333, mt:8px)
            │   │
            │   ├── RoutineItem
            │   │   ├── TypeBadge "REQUIRED"
            │   │   ├── Ordinal "#2"
            │   │   └── Description "Campo valor obrigatório quando tipo=Compra"
            │   │
            │   └── RoutineItem
            │       ├── TypeBadge "VALIDATION"
            │       ├── Ordinal "#3"
            │       ├── BlockingBadge "BLOQUEANTE" (10px 700 #C0392B, bg #FFEBEE, r:4, p:2px 8px)
            │       └── Description "Valor máximo R$ 50.000"
            │
            └── EditorFooter (h:56, border-top 1px #F0F0EE, p:0 20px, flex align-center)
                └── BtnAdicionarItem (text: 13px 600 #2E86C1, cursor pointer)
                    └── "+ Adicionar Item"
```

---

## 7. Modal Dry-Run Simulação

```
ModalOverlay (fixed, inset 0, bg rgba(0,0,0,0.3), z:60, flex center)
│
└── ModalCard (w:560, r:12, fill #FFF, shadow 0 8px 32px rgba(0,0,0,0.12), p:24px)
    │
    ├── ÍconeWarning (48×48, r:50%, bg #FFF3E0, stroke #E67E22, centrado)
    │
    ├── Título "Simulação Dry-Run" (18px 700 #111, mt:16px, text-align center)
    │
    ├── Aviso (mt:8px, text-align center)
    │   └── "Atenção: esta simulação não persiste dados nem registra eventos."
    │       (13px 500 #E67E22, bg #FFF3E0, r:8, p:12px 16px)
    │
    ├── FormSection (mt:20px)
    │   ├── Label "OBJETOS PARA SIMULAR" (10px 700 uppercase ls:+0.8px #888, mb:6px)
    │   └── Select (w:100%, h:42, r:8, border #E8E8E6, 14px 500 #111)
    │       └── options: objetos vinculados ao enquadrador selecionado
    │
    ├── BtnExecutar (primary, w:100%, h:42, r:8, fill #2E86C1, mt:16px)
    │   └── "Executar Simulação" (13px 700 #FFF)
    │
    ├── ResultsArea (mt:20px, border-top 1px #F0F0EE, pt:16px)
    │   ├── SectionTitle "Regras que seriam disparadas:" (14px 700 #111, mb:12px)
    │   ├── RuleResult (p:8px 12px, r:6, bg #E8F8EF, mb:8px)
    │   │   ├── RuleName "Rotina de Validação Compras → VALIDATION" (12px 600 #1E7A42)
    │   │   └── RuleDetail "Valor máximo R$ 50.000 — BLOQUEANTE" (11px 400 #333, mt:2px)
    │   ├── RuleResult (p:8px 12px, r:6, bg #E3F2FD, mb:8px)
    │   │   ├── RuleName "Rotina de Validação Compras → REQUIRED" (12px 600 #2E86C1)
    │   │   └── RuleDetail "Campo valor obrigatório quando tipo=Compra" (11px 400 #333)
    │   └── RuleResult (p:8px 12px, r:6, bg #E3F2FD)
    │       ├── RuleName "Rotina de Visibilidade RH → FIELD_VISIBILITY" (12px 600 #2E86C1)
    │       └── RuleDetail "Ocultar campo CNPJ quando tipo=PF" (11px 400 #333)
    │
    └── BotõesRow (mt:24px, flex justify-end, gap:12px)
        └── BtnFechar (secondary: r:8, border #E8E8E6, h:40, p:0 20px)
            └── "Fechar" (13px 600 #555)
```

---

## 8. Modal Fork com Motivo

```
ModalOverlay (fixed, inset 0, bg rgba(0,0,0,0.3), z:60, flex center)
│
└── ModalCard (w:480, r:12, fill #FFF, shadow 0 8px 32px rgba(0,0,0,0.12), p:24px)
    │
    ├── Título "Fork da Rotina" (18px 700 #111)
    │
    ├── Subtítulo (mt:4px)
    │   └── "Será criada uma nova versão DRAFT a partir desta rotina." (13px 400 #888)
    │
    ├── CampoMotivo (mt:20px)
    │   ├── Label "MOTIVO DA ALTERAÇÃO" (10px 700 uppercase ls:+0.8px #888, mb:6px)
    │   ├── Textarea (w:100%, h:120, r:8, border #E8E8E6, p:12px 14px, font 14px 500 #111)
    │   │   └── placeholder "Descreva o motivo da alteração..." (14px 400 #CCC)
    │   ├── CharCounter (flex justify-end, mt:4px)
    │   │   └── "0/10 mín." (11px 400 #888) — muda para #27AE60 quando ≥ 10
    │   └── [Erro] "O motivo deve ter pelo menos 10 caracteres." (11px 500 #E74C3C, mt:4px)
    │
    └── BotõesRow (mt:24px, flex justify-end, gap:12px)
        ├── BtnCancelar (h:40, r:8, border #E8E8E6, p:0 20px, bg #FFF)
        │   └── "Cancelar" (13px 600 #555)
        └── BtnCriarFork (h:40, r:8, fill #2E86C1, p:0 20px)
            └── "Criar Fork" (13px 700 #FFF)
            [disabled quando chars < 10: opacity 0.5, cursor not-allowed]
```

---

## 9. Modal Publicar com Auto-Deprecate

```
ModalOverlay (fixed, inset 0, bg rgba(0,0,0,0.3), z:60, flex center)
│
└── ModalCard (w:420, r:12, fill #FFF, shadow 0 8px 32px rgba(0,0,0,0.12), p:24px)
    │
    ├── ÍconeCheck (48×48, r:50%, bg #E8F8EF, stroke #27AE60, centrado)
    │
    ├── Título "Publicar rotina?" (18px 700 #111, mt:16px, text-align center)
    │
    ├── Mensagem (mt:8px, text-align center)
    │   └── "Ao publicar, a rotina se tornará imutável. Continuar?"
    │       (13px 400 #555)
    │
    ├── ToggleRow (mt:16px, flex align-center, gap:8px, p:12px, r:8, bg #F5F5F3)
    │   ├── Toggle (w:36, h:20, r:10, bg #E8E8E6 ou #2E86C1)
    │   └── "Deprecar versão anterior automaticamente" (12px 500 #555)
    │
    └── BotõesRow (mt:24px, flex justify-center, gap:12px)
        ├── BtnCancelar (h:40, r:8, border #E8E8E6, p:0 20px)
        │   └── "Cancelar" (13px 600 #555)
        └── BtnPublicar (h:40, r:8, fill #2E86C1, p:0 20px)
            └── "Publicar" (13px 700 #FFF)
```

---

## 10. Estados da Tela

### Loading (Skeleton)

```
LeftPanel
├── PanelHeader (normal)
└── SkeletonItems (4×)
    ├── Rect 160×14 r:4 bg:#E8E8E6 animate pulse  (nome)
    ├── Rect 80×10 r:4 bg:#E8E8E6 animate pulse   (tipo)
    └── Rect 120×10 r:4 bg:#E8E8E6 animate pulse  (vigência)

CenterPanel
├── PanelHeader (normal)
└── SkeletonItems (3×)
    ├── Rect 200×14 r:4 bg:#E8E8E6 animate pulse  (nome objeto)
    └── Rect 100×10 r:4 bg:#E8E8E6 animate pulse  (módulo)

RightPanel
├── PanelHeader (normal)
└── SkeletonGrid (3×4)
    └── Rect 20×20 r:4 bg:#E8E8E6 animate pulse  (checkbox)
```

### Empty State (Enquadradores)

```
EmptyContainer (flex-col, align-center, p:60px)
├── Ilustração (120×120, ícone grid, stroke #CCC, fill none)
├── "Nenhum enquadrador cadastrado." (16px 600 #888, mt:16px)
├── "Clique em 'Novo enquadrador' para começar." (13px 400 #AAA, mt:4px)
└── BtnCriar (primary, mt:16px)
```

### Empty State (Rotinas)

```
EmptyContainer (flex-col, align-center, p:60px)
├── Ilustração (120×120, ícone list, stroke #CCC, fill none)
├── "Nenhuma rotina cadastrada." (16px 600 #888, mt:16px)
├── "Clique em 'Nova rotina' para começar." (13px 400 #AAA, mt:4px)
└── BtnCriar (primary, mt:16px)
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

## 11. Medidas

```
Content area          1200×836    fill:#F5F5F3  padding:24px
Page header           auto×auto   flex justify-between
Left panel            280×auto    r:12  border:1px #E8E8E6  fill:#FFF
Center panel          flex×auto   r:12  border:1px #E8E8E6  fill:#FFF
Right panel           flex×auto   r:12  border:1px #E8E8E6  fill:#FFF
Panel header          auto×48     border-bottom:1px #F0F0EE
Framer item           auto×auto   p:12px 16px  border-bottom:1px #F0F0EE
Object item           auto×auto   p:12px  r:8  border:1px #E8E8E6
Matrix cell           120×44      border-bottom:1px #F0F0EE
Checkbox              20×20       r:4  border:2px #E8E8E6
Checkbox checked      20×20       r:4  fill:#2E86C1  border:2px #2E86C1
Status badge          auto×auto   r:4   padding:2px 8px
Editor header         auto×64     border-bottom:1px #F0F0EE
Editor item           auto×auto   p:16px  r:8  border:1px #E8E8E6
Editor footer         auto×56     border-top:1px #F0F0EE
Modal card            420–560×auto r:12  shadow:0 8px 32px rgba(0,0,0,0.12)
Modal warning icon    48×48       r:50%
Button primary        auto×40     r:8   fill:#2E86C1
Button secondary      auto×40     r:8   border:1px #E8E8E6
Button toolbar        auto×36     r:8
Textarea              100%×120    r:8   border:1px #E8E8E6
Empty illustration    120×120
```

---

## 12. Responsividade

| Breakpoint | Comportamento |
|---|---|
| >= 1280px | 3-panel layout full-width, todas as colunas da matriz visíveis |
| 1024–1279px | 3-panel layout com right panel colapsável via toggle, matriz com scroll horizontal |
| 768–1023px | Painel único com tabs (Enquadradores / Objetos / Matriz), editor full-width |
| < 768px | Painel único com tabs empilhados, editor full-screen, modais full-screen |

---

## 13. Componentes a Criar

| Componente | Descrição | Reutilização |
|------------|-----------|--------------|
| `parametrization/ParametrizationPage` | Página principal com 3-panel layout e tab de rotinas | Rota /configuracao/parametrizacao |
| `parametrization/FramersList` | Lista de enquadradores com status badges e seleção | LeftPanel (View 1) |
| `parametrization/TargetObjectsPanel` | Lista de objetos vinculados com link/unlink | CenterPanel (View 1) |
| `parametrization/IncidenceMatrix` | Grid checkbox enquadrador × rotina com filtro PUBLISHED | RightPanel (View 1) |
| `parametrization/DryRunModal` | Modal de simulação dry-run com select e resultados | ParametrizationPage |
| `parametrization/RoutinesList` | Lista de rotinas com filtro por status e badges | LeftPanel (View 2) |
| `parametrization/RoutineEditor` | Split-view editor com itens, drag-and-drop, auto-save | RightPanel (View 2) |
| `parametrization/RoutineItemCard` | Card de item com type badge, descrição, drag handle | RoutineEditor |
| `parametrization/ItemTypeForm` | Formulário adaptativo por tipo (7 variantes) | RoutineEditor |
| `parametrization/ForkModal` | Modal com textarea motivo obrigatório (min 10 chars) | RoutineEditor |
| `parametrization/PublishModal` | Modal de publicação com toggle auto-deprecate | RoutineEditor |
| `parametrization/AutoSaveIndicator` | Indicador inline "Salvo" com debounce 600ms | RoutineEditor |
| `ui/ThreePanelLayout` | Container genérico 3-panel (left fixed + center + right) | ParametrizationPage, futuras telas |

---

## 14. Checklist

- [ ] Sidebar: "Parametrização" ativo na categoria PROCESSOS
- [ ] Breadcrumb: "Processos › Parametrização"
- [ ] Page header com título + botões "Simular Dry-Run" e "+ Novo Enquadrador"
- [ ] Left panel (280px): lista de enquadradores com nome, tipo, status badge, vigência
- [ ] Enquadradores com badge ATIVO (verde) ou EXPIRADO (âmbar)
- [ ] Seleção de enquadrador com highlight visual (bg #E3F2FD, border-left azul)
- [ ] Center panel: objetos-alvo com botão "+ Vincular" e "Desvincular" por item
- [ ] Right panel: matriz de incidência enquadrador × rotina com checkboxes
- [ ] Filtro "Somente PUBLISHED" na matriz de incidência
- [ ] Modal dry-run com aviso de não persistência + select de objetos + resultados
- [ ] Split-view rotinas: lista à esquerda (280px) + editor à direita
- [ ] Lista de rotinas com filtro por status (DRAFT/PUBLISHED/DEPRECATED)
- [ ] Status badges: RASCUNHO (âmbar), PUBLICADA (verde), DEPRECADA (cinza)
- [ ] Editor com header: título + versão + status + toolbar (Publicar, Fork, Prévia)
- [ ] Lista de itens com 7 tipos: FIELD_VISIBILITY, REQUIRED, DEFAULT, DOMAIN, DERIVATION, VALIDATION, EVIDENCE
- [ ] Type badge por item + drag handle (DRAFT only)
- [ ] VALIDATION com badge "BLOQUEANTE" quando is_blocking=true
- [ ] Auto-save com debounce 600ms + indicador "Salvo" verde
- [ ] Modal publicar com toggle "Deprecar versão anterior automaticamente"
- [ ] Modal fork com textarea motivo obrigatório (min 10 chars) + char counter
- [ ] Botão "Criar Fork" desabilitado quando chars < 10
- [ ] Empty states para enquadradores e rotinas
- [ ] Loading skeleton nos 3 painéis
- [ ] Error state com botão "Tentar novamente"
