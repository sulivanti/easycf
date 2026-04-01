# 70-Process-Editor — Spec Definitiva

> **Rota:** `/processos/ciclos/:id/editor` | **Modulo:** MOD-005 | **Screen IDs:** UX-PROC-001, UX-PROC-002
> **Viewport:** 1440 x 900 px | **Font:** Plus Jakarta Sans
> **Referencia:** UX-005.md (jornadas e fluxos da modelagem de processos)

---

## 1. Decisoes de Design (PO)

AppShell reutilizado, com sidebar adaptada para contexto de processos:

| Item | Decisao |
|------|---------|
| Sidebar ativo | "Modelagem" (categoria PROCESSOS) |
| Breadcrumb | "Processos > Modelagem > Editor" |
| Topbar direita | "Admin ECF" / "A1 Engenharia" + avatar "AE" |
| Sidebar footer | Dot verde + "Servidor Online" |
| Layout conteudo | **Canvas full-width** (React Flow) + **Painel lateral** para configuracao de estagio |
| Botoes de acao | Save (secondary), Publish (primary azul `#2E86C1`), Fork (secondary) |
| Painel lateral | 480px slide-in da direita com overlay |

---

## 2. Sidebar — Variante Processos

```
Sidebar (240x836, fill #FFF, border-right 1px #E8E8E6)
+-- "ADMINISTRACAO"
|   +-- Usuarios (inativo)
|   +-- Perfis e Permissoes (inativo)
+-- "ORGANIZACAO"
|   +-- Estrutura Org. (inativo)
|   +-- Departamentos (inativo)
+-- "PROCESSOS"
|   +-- Modelagem (ATIVO: bg #E3F2FD, text #2E86C1)
+-- Footer: dot verde 8x8 #27AE60 + "Servidor Online" (text 12px #888888)
```

---

## 3. Cores (alem do AppShell)

```
DRAFT BADGE          text:#B8860B  bg:#FFF3E0  border:#FFE0B2
PUBLISHED BADGE      text:#1E7A42  bg:#E8F8EF  border:#B5E8C9
DEPRECATED BADGE     text:#888888  bg:#F5F5F3  border:#E8E8E6
SWIMLANE BG 1        #F0F7FF     Azul claro (faixa par)
SWIMLANE BG 2        #FFF8F0     Laranja claro (faixa impar)
SWIMLANE BORDER      #E0E8F0     Borda entre swimlanes
STAGE NODE BG        #FFFFFF     Fundo do no de estagio
STAGE NODE BORDER    #2E86C1     Borda do no (azul)
STAGE NODE SELECTED  #1A5F8B     Borda do no selecionado (azul escuro, 2px)
GATE DIAMOND BG      #F39C12     Fundo do icone gate (laranja)
GATE DIAMOND BORDER  #E67E22     Borda do gate
EDGE COLOR           #888888     Cor padrao das arestas
EDGE GATE REQUIRED   #F39C12     Aresta com gate_required (laranja)
MINIMAP BG           #FAFAFA     Fundo do mini-mapa
MINIMAP BORDER       #E8E8E6     Borda do mini-mapa
EMPTY DASHED BORDER  #CCCCCC     Borda tracejada do canvas vazio
READONLY BANNER BG   #E3F2FD     Banner readonly (azul claro)
READONLY BANNER TEXT #2E86C1     Texto do banner readonly
READONLY NODE OPACITY 0.7        Opacidade dos nos em modo readonly
AUTOSAVE GREEN       #27AE60     Indicador "Salvo"
AUTOSAVE RED         #E74C3C     Indicador "Erro ao salvar"
TAB ACTIVE           #2E86C1     Aba ativa (borda inferior)
TAB INACTIVE         #888888     Aba inativa
GATE APPROVAL        text:#2E86C1  bg:#E3F2FD   Badge tipo APPROVAL
GATE DOCUMENT        text:#27AE60  bg:#E8F8EF   Badge tipo DOCUMENT
GATE CHECKLIST       text:#8E44AD  bg:#F3E5F5   Badge tipo CHECKLIST
GATE INFORMATIVE     text:#888888  bg:#F5F5F3   Badge tipo INFORMATIVE
CAN_APPROVE BADGE    text:#2E86C1  bg:#E3F2FD   Badge "Com poder decisorio"
```

---

## 4. Tipografia (conteudo especifico)

```
TOP TOOLBAR
  Nome do ciclo                    700  18px  #111111
  Status badge "DRAFT"             700  10px  uppercase  (amarelo)
  Status badge "PUBLISHED"         700  10px  uppercase  (verde)
  "Salvar"                         600  13px  #555555
  "Publicar"                       700  13px  #FFFFFF  (botao azul)
  "Fork"                           600  13px  #555555

STAGE NODE
  Nome do estagio                  600  13px  #111111
  Badges (gates, papeis)           700   9px  #888888

GATE DIAMOND
  Icone gate                       —    12px  #FFFFFF  (dentro do diamante)

SWIMLANE
  Nome da macroetapa               700  11px  uppercase  ls:+0.8px  #888888

MINI-MAP
  (sem texto, apenas viewport)

ZOOM CONTROLS
  "+" / "−"                        700  16px  #555555

EMPTY STATE
  "Clique duas vezes para criar o primeiro estagio"
                                   600  16px  #888888

READONLY BANNER
  "Este ciclo esta publicado..."   500  13px  #2E86C1
  "Fork"                           700  13px  #2E86C1  (link/botao)

PANEL HEADER
  "{codigo} — {nome}"             700  16px  #111111
  Auto-save "Salvando..." / "Salvo" / "Erro ao salvar"
                                   500  11px  variavel

PANEL TABS
  Tab label                        600  13px  var(--tab-color)

PANEL CONTENT
  Label campo                      700  10px  uppercase  ls:+0.8px  #888888
  Input text                       500  14px  #111111
  Input placeholder                400  14px  #CCCCCC
  Gate type badge                  700  10px  uppercase
  Role name                        500  13px  #111111
  "+ Adicionar Gate" etc.          700  13px  #2E86C1
```

---

## 5. View 1 — Editor Visual de Fluxo (UX-PROC-001)

### 5.1 Estrutura de Elementos

```
70-ProcessEditor (frame 1440x900)
|
+-- Topbar (branca 64px)
|   +-- Logo A1 azul + "GRUPO A1" / "PORTAL INTERNO"
|   +-- Separador + Breadcrumb: "Processos" #888 > "Modelagem" #888 > "Editor" #111 bold
|   +-- Direita: "Admin ECF" / "A1 Engenharia" + avatar "AE"
|
+-- Sidebar (240px, ativo: "Modelagem")
|   +-- (mesma estrutura secao 2)
|
+-- ContentArea (1200x836, fill #F5F5F3, padding:0)
    |
    +-- TopToolbar (h:56, bg #FFFFFF, border-bottom 1px #E8E8E6, p:0 24px, flex align-center justify-between)
    |   +-- Esquerda (flex, align-center, gap:12px)
    |   |   +-- CycleName "Ciclo de Compras v2" (18px 700 #111)
    |   |   +-- StatusBadge "DRAFT" (10px 700 uppercase, r:4, p:2px 8px, amarelo)
    |   +-- Direita (flex, gap:8px)
    |       +-- BtnSave (secondary: r:8, border #E8E8E6, h:36, p:0 16px)
    |       |   +-- "Salvar" (13px 600 #555)
    |       +-- BtnPublish (primary: r:8, fill #2E86C1, h:36, p:0 16px)
    |       |   +-- "Publicar" (13px 700 #FFF)
    |       +-- BtnOverflow (secondary: r:8, border #E8E8E6, h:36, w:36)
    |           +-- "..." (16px 600 #555)
    |           +-- [Dropdown: "Historico", "Deprecar" (apenas PUBLISHED)]
    |
    +-- CanvasArea (flex-1, position relative)
    |   |
    |   +-- ReactFlowCanvas (100% x 100%)
    |   |   |
    |   |   +-- Swimlane "Solicitacao" (full-width, h:auto min 200, bg #F0F7FF)
    |   |   |   +-- SwimlaneLabel "SOLICITACAO" (11px 700 uppercase #888, p:12px 16px)
    |   |   |   +-- StageNode "Preenchimento" (w:180, h:72, r:12, bg #FFF, border 1px #2E86C1)
    |   |   |   |   +-- Nome (13px 600 #111, p:12px)
    |   |   |   |   +-- BadgeRow (flex, gap:4px, p:0 12px 8px)
    |   |   |   |       +-- GatesBadge "2 gates" (9px 700 #888, bg #F5F5F3, r:4, p:2px 6px)
    |   |   |   |       +-- RolesBadge "3 papeis" (9px 700 #888, bg #F5F5F3, r:4, p:2px 6px)
    |   |   |   |       +-- InitialBadge (flag) (apenas se is_initial)
    |   |   |   +-- StageNode "Revisao" (mesma estrutura)
    |   |   |   +-- TransitionEdge (de Preenchimento para Revisao, stroke #888, strokeWidth 1.5)
    |   |   |
    |   |   +-- Swimlane "Aprovacao" (full-width, h:auto min 200, bg #FFF8F0)
    |   |       +-- SwimlaneLabel "APROVACAO"
    |   |       +-- StageNode "Aprovacao N1"
    |   |       +-- StageNode "Aprovacao N2"
    |   |       +-- TransitionEdge (de N1 para N2, com GateDiamond no meio)
    |   |       +-- GateDiamond (w:24, h:24, rotated 45deg, bg #F39C12, border 1px #E67E22)
    |   |
    |   +-- MiniMap (position absolute, bottom:16px, right:16px, w:120, h:80)
    |   |   +-- Frame (r:8, border 1px #E8E8E6, bg #FAFAFA, overflow hidden)
    |   |   +-- ViewportRect (stroke #2E86C1, fill rgba(46,134,193,0.1))
    |   |
    |   +-- ZoomControls (position absolute, bottom:16px, left:16px, flex-col, gap:4px)
    |       +-- BtnZoomIn (w:36, h:36, r:8, bg #FFF, border 1px #E8E8E6)
    |       |   +-- "+" (16px 700 #555, text-align center)
    |       +-- BtnZoomOut (w:36, h:36, r:8, bg #FFF, border 1px #E8E8E6)
    |           +-- "−" (16px 700 #555, text-align center)
    |
    +-- [ReadonlyBanner] (condicional: cycle.status === PUBLISHED)
    |   +-- Banner (h:44, bg #E3F2FD, flex align-center justify-center, gap:12px)
    |       +-- Icone info (16x16, stroke #2E86C1)
    |       +-- "Este ciclo esta publicado. Crie um Fork para editar." (13px 500 #2E86C1)
    |       +-- BtnFork (r:6, border 1px #2E86C1, h:28, p:0 12px)
    |           +-- "Fork" (12px 700 #2E86C1)
    |
    +-- [EmptyCanvasState] (condicional: macro_stages.length === 0 && !readonly)
        +-- DashedRect (w:400, h:200, border 2px dashed #CCC, r:12, position absolute, centered)
            +-- FlowIcon (48x48, stroke #CCC, fill none, mb:16px)
            +-- "Clique duas vezes para criar o primeiro estagio" (16px 600 #888)
```

### 5.2 Estados da Tela

| Estado | Comportamento | Componente |
|---|---|---|
| **loading** | Skeleton de nos e arestas placeholder no canvas | Skeleton nodes + edges |
| **loaded** | Nos e arestas renderizados nas posicoes salvas (`canvas_x`, `canvas_y`) | React Flow canvas |
| **empty_editable** | Canvas vazio com prompt: "De duplo clique para criar o primeiro estagio." + icone de fluxo. Cursor `pointer`. Handler `onDoubleClick` ativo. | EmptyState com icone de fluxo + cursor hint |
| **empty_readonly** | Canvas vazio com mensagem: "Ciclo publicado — somente leitura." Cursor `default`. Sem handler. | EmptyState readonly |
| **empty_no_permission** | Canvas vazio com mensagem: "Sem permissao de edicao neste ciclo." Cursor `default`. Sem handler. | EmptyState permissao |
| **error** | Toast de erro + canvas com ultima versao em cache (se disponivel) | Toast RFC 9457 + correlationId |
| **readonly** | Banner "Ciclo publicado — use 'Nova versao' para editar" + nenhuma acao de escrita. Nos com opacity 0.7. | ReadonlyBanner + overlay |

### 5.3 Acoes

| action_id | label_pt | endpoint / operationId | domain_event |
|---|---|---|---|
| `view` | Carregar editor | GET /admin/cycles/:id/flow | — |
| `create` | Criar estagio | POST /admin/macro-stages/:mid/stages | `process.stage_created` |
| `create` | Criar transicao | POST /admin/stage-transitions | `process.transition_created` |
| `update` | Mover estagio | PATCH /admin/stages/:id (canvas_x/y) | — |
| `delete` | Deletar estagio | DELETE /admin/stages/:id | — |
| `delete` | Deletar transicao | DELETE /admin/stage-transitions/:id | — |
| `publish` | Publicar ciclo | POST /admin/cycles/:id/publish | `process.cycle_published` |
| `clone` | Fork (nova versao) | POST /admin/cycles/:id/fork | `process.cycle_forked` |
| `deactivate` | Deprecar ciclo | PATCH /admin/cycles/:id (status DEPRECATED) | `process.cycle_deprecated` |
| `create` | Auto-criar macroetapa padrao | POST /admin/cycles/:cid/macro-stages | `process.macro_stage_created` |
| `view_history` | Ver historico | GET /domain-events?entity_type=process_cycle&entity_id=:id | — |

---

## 6. View 2 — Configurador de Estagio (UX-PROC-002)

### 6.1 Estrutura de Elementos

```
StageConfigPanel (480x100vh, fill #FFF, position fixed right:0, shadow -4px 0 24px rgba(0,0,0,0.08), z:40)
|
+-- PanelHeader (h:64, border-bottom 1px #E8E8E6, p:0 24px, flex align-center justify-between)
|   +-- Esquerda (flex, align-center, gap:8px)
|   |   +-- Titulo "{codigo} — {nome}" (16px 700 #111)
|   +-- Direita (flex, align-center, gap:12px)
|       +-- AutoSaveIndicator
|       |   +-- [saving] "Salvando..." (11px 500 #888, animate pulse)
|       |   +-- [saved] "Salvo" (11px 500 #27AE60) + checkmark
|       |   +-- [error] "Erro ao salvar" (11px 500 #E74C3C)
|       +-- BtnFechar (X 20x20, stroke #888, hover #333, cursor pointer)
|
+-- TabBar (h:44, border-bottom 1px #E8E8E6, flex, p:0 24px)
|   +-- Tab "Informacoes" (13px 600, p:12px 16px, border-bottom 2px transparent)
|   +-- Tab "Gates" (mesma estrutura)
|   +-- Tab "Papeis" (mesma estrutura)
|   +-- Tab "Transicoes" (mesma estrutura)
|   +-- [Tab ativa: color #2E86C1, border-bottom 2px #2E86C1]
|   +-- [Tab inativa: color #888, border-bottom 2px transparent]
|
+-- PanelBody (flex-1, overflow-y auto, p:24px)
|   |
|   +-- [Tab Informacoes]
|   |   +-- CampoNome
|   |   |   +-- Label "NOME" (10px 700 uppercase ls:+0.8px #888, mb:6px)
|   |   |   +-- Input (w:100%, h:42, r:8, border #E8E8E6, p:10px 14px, font 14px 500 #111)
|   |   +-- CampoDescricao (mt:16px)
|   |   |   +-- Label "DESCRICAO"
|   |   |   +-- Textarea (w:100%, h:100, r:8, border #E8E8E6, p:10px 14px, resize vertical)
|   |   +-- CampoMacroStage (mt:16px)
|   |   |   +-- Label "MACROETAPA"
|   |   |   +-- Select (w:100%, h:42, r:8, border #E8E8E6, p:10px 14px)
|   |   +-- CampoPosicao (mt:16px)
|   |   |   +-- Label "POSICAO (ORDEM)"
|   |   |   +-- Input number (w:100, h:42, r:8, border #E8E8E6)
|   |   +-- TogglesRow (mt:16px, flex, gap:24px)
|   |       +-- ToggleInicial (flex, align-center, gap:8px)
|   |       |   +-- Toggle (w:36, h:20, r:10)
|   |       |   +-- "Estagio Inicial" (12px 500 #555)
|   |       +-- ToggleTerminal (flex, align-center, gap:8px)
|   |           +-- Toggle (w:36, h:20, r:10)
|   |           +-- "Estagio Terminal" (12px 500 #555)
|   |
|   +-- [Tab Gates]
|   |   +-- GateList (flex-col, gap:8px)
|   |   |   +-- GateItem (r:8, border 1px #E8E8E6, p:12px 16px, flex align-center justify-between)
|   |   |   |   +-- Esquerda (flex, align-center, gap:8px)
|   |   |   |   |   +-- DragHandle (6x16, 3 dots vertical, stroke #CCC, cursor grab)
|   |   |   |   |   +-- GateName (13px 500 #111)
|   |   |   |   |   +-- GateTypeBadge (10px 700 uppercase, r:4, p:2px 8px)
|   |   |   |   |       +-- APPROVAL: text #2E86C1, bg #E3F2FD
|   |   |   |   |       +-- DOCUMENT: text #27AE60, bg #E8F8EF
|   |   |   |   |       +-- CHECKLIST: text #8E44AD, bg #F3E5F5
|   |   |   |   |       +-- INFORMATIVE: text #888, bg #F5F5F3
|   |   |   |   +-- Direita (flex, align-center, gap:8px)
|   |   |   |       +-- ToggleActive (w:36, h:20, r:10)
|   |   |   |       +-- BtnEdit (pencil 14x14, stroke #888, hover #2E86C1) [oculto se readonly]
|   |   |   |       +-- BtnDelete (X 14x14, stroke #888, hover #E74C3C) [oculto se readonly]
|   |   |   +-- (repete para cada gate...)
|   |   +-- BtnAddGate (mt:12px, flex align-center, gap:6px, cursor pointer) [oculto se readonly]
|   |       +-- "+" (16px 600 #2E86C1)
|   |       +-- "Adicionar Gate" (13px 700 #2E86C1)
|   |
|   +-- [Tab Papeis]
|   |   +-- RoleList (flex-col, gap:8px)
|   |   |   +-- RoleItem (r:8, border 1px #E8E8E6, p:12px 16px, flex align-center justify-between)
|   |   |   |   +-- Esquerda (flex, align-center, gap:8px)
|   |   |   |   |   +-- RoleName (13px 500 #111)
|   |   |   |   |   +-- [CanApproveBadge] "Com poder decisorio" (10px 700, text #2E86C1, bg #E3F2FD, r:4, p:2px 8px)
|   |   |   |   +-- Direita
|   |   |   |       +-- BtnUnlink (X 14x14, stroke #888, hover #E74C3C) [oculto se readonly]
|   |   |   +-- (repete para cada papel...)
|   |   +-- BtnAddRole (mt:12px, flex align-center, gap:6px, cursor pointer) [oculto se readonly]
|   |       +-- "+" (16px 600 #2E86C1)
|   |       +-- "Vincular Papel" (13px 700 #2E86C1)
|   |
|   +-- [Tab Transicoes]
|       +-- SectionLabel "SAIDA" (10px 700 uppercase ls:+0.8px #888, mb:8px)
|       +-- TransitionList (flex-col, gap:8px)
|       |   +-- TransitionItem (r:8, border 1px #E8E8E6, p:12px 16px, flex align-center justify-between)
|       |   |   +-- Esquerda (flex, align-center, gap:8px)
|       |   |   |   +-- Arrow right (14x14, stroke #888)
|       |   |   |   +-- DestinationName (13px 500 #111)
|       |   |   |   +-- [GateRequiredBadge] "Requer gate" (10px 700, text #F39C12, bg #FFF3E0, r:4, p:2px 8px)
|       |   |   +-- Direita
|       |   |       +-- BtnDelete (X 14x14, stroke #888, hover #E74C3C) [oculto se readonly]
|       |   +-- (repete para cada transicao de saida...)
|       +-- BtnAddTransition (mt:12px, flex align-center, gap:6px) [oculto se readonly]
|       |   +-- "+" (16px 600 #2E86C1)
|       |   +-- "Nova Transicao" (13px 700 #2E86C1)
|       +-- SectionLabel "ENTRADA" (mt:24px, 10px 700 uppercase ls:+0.8px #888, mb:8px)
|       +-- TransitionReadonlyList (flex-col, gap:8px)
|           +-- TransitionItem (r:8, border 1px #F0F0EE, bg #FAFAFA, p:12px 16px)
|               +-- Arrow left (14x14, stroke #CCC)
|               +-- OriginName (13px 500 #888)
|               +-- Tooltip: "Configure esta transicao no estagio de origem."
```

### 6.2 Estados da Tela

| Estado | Comportamento | Componente |
|---|---|---|
| **loading** | Spinner na aba ativa enquanto carrega dados do estagio | Spinner inline |
| **loaded** | 4 abas com dados populados | Tabs com conteudo |
| **saving** | Indicador "Salvando..." no header do painel (debounce 800ms) | AutoSaveIndicator |
| **error** | Toast de erro + campo reverte ao valor anterior | Toast RFC 9457 |
| **readonly** | Banner "Ciclo publicado — somente leitura." + sem controles de edicao | ReadonlyBanner |

### 6.3 Auto-save

- Debounce de 800ms apos ultima alteracao
- Indicador no header do painel: "Salvando..." (pulse) -> "Salvo" (verde) -> "Erro ao salvar" (vermelho, retry 3s)
- Sincronizacao bidirecional com canvas: alteracoes no painel refletem imediatamente nos nos/arestas

---

## 7. Sincronizacao Bidirecional Canvas <-> Painel

| Acao no Painel | Reflexo no Canvas |
|---|---|
| Salvar nome do estagio | No atualiza label em tempo real |
| Adicionar/remover gate | Badge de gates no no incrementa/decrementa |
| Vincular/desvincular papel | Badge de papeis no no incrementa/decrementa |
| Adicionar transicao de saida | Aresta aparece no canvas |
| Remover transicao | Aresta desaparece do canvas |
| Toggle is_initial | Badge flag aparece/desaparece no no |
| Toggle is_terminal | Badge terminal aparece/desaparece no no |

| Acao no Canvas | Reflexo no Painel |
|---|---|
| Selecionar outro no | Painel recarrega dados do novo estagio |
| Deletar no selecionado | Painel fecha automaticamente |
| Criar transicao via drag | Se painel aberto para o from_stage, aba Transicoes atualiza |

---

## 8. Medidas

```
Content area          1200x836    fill:#F5F5F3  padding:0 (canvas full-bleed)
Top toolbar           auto x 56   bg:#FFF  border-bottom:1px #E8E8E6
Stage node            180x72     r:12  border:1px #2E86C1  fill:#FFF
Gate diamond          24x24      rotated 45deg  fill:#F39C12
Swimlane label area   auto x 32   padding:12px 16px
MiniMap               120x80     r:8   border:1px #E8E8E6  fill:#FAFAFA
Zoom button           36x36      r:8   border:1px #E8E8E6  fill:#FFF
Empty dashed rect     400x200    r:12  border:2px dashed #CCC
Readonly banner       auto x 44   bg:#E3F2FD
Panel                 480x100vh  fill:#FFF  shadow:-4px 0 24px rgba(0,0,0,0.08)
Panel header          auto x 64   border-bottom:1px #E8E8E6
Panel tab bar         auto x 44   border-bottom:1px #E8E8E6
Gate item             auto x auto r:8   border:1px #E8E8E6  padding:12px 16px
Role item             auto x auto r:8   border:1px #E8E8E6  padding:12px 16px
Transition item       auto x auto r:8   border:1px #E8E8E6  padding:12px 16px
Toggle track          36x20      r:10
Button primary        auto x 36   r:8   fill:#2E86C1
Button secondary      auto x 36   r:8   border:1px #E8E8E6
Type badge            auto x auto r:4   padding:2px 8px
```

---

## 9. Responsividade

| Breakpoint | Comportamento |
|---|---|
| >= 1280px | Canvas full-width, painel 480px overlay, mini-map e zoom visiveis |
| 1024-1279px | Canvas full-width, painel 420px overlay, mini-map oculto |
| 768-1023px | Canvas full-width, painel 100% full-screen, toolbar compacta |
| < 768px | Canvas com pinch-to-zoom, painel 100% full-screen, toolbar em menu hamburger |

---

## 10. Componentes a Criar

| Componente | Descricao | Reutilizacao |
|---|---|---|
| `process-modeling/FlowEditorPage` | Pagina principal com canvas React Flow + toolbar + banners | Rota /processos/ciclos/:id/editor |
| `process-modeling/StageNode` | No customizado do React Flow (nome, badges, estado) | FlowEditorPage |
| `process-modeling/GateDiamond` | Icone gate no formato diamante nas arestas | FlowEditorPage |
| `process-modeling/TransitionEdge` | Aresta customizada com label e gate indicator | FlowEditorPage |
| `process-modeling/Swimlane` | Faixa horizontal por macroetapa | FlowEditorPage |
| `process-modeling/StageConfigPanel` | Painel lateral 480px com 4 abas | FlowEditorPage |
| `process-modeling/GateList` | Lista de gates com drag-and-drop e badges de tipo | StageConfigPanel |
| `process-modeling/GateDialog` | Dialog para criar/editar gate | StageConfigPanel |
| `process-modeling/RoleAutocomplete` | Autocomplete de papeis do catalogo global | StageConfigPanel |
| `process-modeling/RoleLinkDialog` | Dialog para vincular papel | StageConfigPanel |
| `process-modeling/TransitionDialog` | Dialog para criar transicao | StageConfigPanel |
| `process-modeling/TransitionForm` | Autocomplete destino + checkboxes | StageConfigPanel |
| `process-modeling/AutoSaveIndicator` | "Salvando..." / "Salvo" / "Erro ao salvar" | StageConfigPanel |
| `process-modeling/GateTypeBadge` | Badge colorido por tipo de gate | GateList, StageNode |
| `process-modeling/ReadonlyBanner` | Banner azul para ciclo publicado | FlowEditorPage |
| `process-modeling/EmptyCanvasState` | Retangulo tracejado com mensagem | FlowEditorPage |
| `process-modeling/GhostNode` | No placeholder translucido durante criacao | FlowEditorPage |

---

## 11. Copy

| Contexto | Mensagem |
|---|---|
| success_publish | "Ciclo publicado com sucesso." |
| success_fork | "Nova versao criada. Voce esta editando a versao {version}." |
| success_create_stage | *(no aparece inline — sem toast)* |
| success_create_transition | *(aresta aparece — sem toast)* |
| error_publish_no_initial | "O ciclo precisa de ao menos um estagio inicial antes de ser publicado." |
| error_immutable | "Ciclos publicados sao imutaveis. Use o fork para criar uma nova versao." |
| error_active_instances | "Este estagio possui {count} instancia(s) ativa(s) em andamento." |
| empty_canvas | "De duplo clique para criar o primeiro estagio." |
| empty_canvas_readonly | "Ciclo publicado — somente leitura." |
| empty_canvas_no_permission | "Sem permissao de edicao neste ciclo." |
| error_create_stage | "Erro ao criar estagio. Tente novamente." |
| error_no_write_permission | "Voce nao tem permissao para editar este ciclo." |
| success_deprecate | "Ciclo depreciado. Novas instancias bloqueadas." |
| confirm_deprecate | "Ao deprecar, novas instancias serao bloqueadas. Instancias ativas continuarao normalmente. Continuar?" |
| readonly_banner | "Este ciclo esta publicado. Crie um Fork para editar." |
| error_duplicate_role | "Este papel ja esta vinculado a este estagio." |
| error_initial_conflict | "O estagio '{codigo}' ja e o inicial. Desmarque-o primeiro." |
| error_auto_transition | "Um estagio nao pode transitar para si mesmo." |
| auto_save_saving | "Salvando..." |
| auto_save_saved | "Salvo" |
| auto_save_error | "Erro ao salvar" |
| tooltip_entrada_readonly | "Configure esta transicao no estagio de origem." |
| tooltip_informative | "Este gate registra informacao mas nao impede o avanco." |

---

## 12. Checklist

- [ ] Sidebar: "Modelagem" ativo na categoria PROCESSOS
- [ ] Breadcrumb: "Processos > Modelagem > Editor"
- [ ] Top toolbar com nome do ciclo + badge de status + botoes Save/Publish
- [ ] Canvas React Flow full-width com swimlanes
- [ ] Stage nodes com nome, badges (gates, papeis, initial, terminal)
- [ ] Gate diamonds nas arestas com gate_required
- [ ] Transition edges com label
- [ ] Mini-map (120x80, bottom-right)
- [ ] Zoom controls (bottom-left: +/- buttons)
- [ ] Empty canvas state com retangulo tracejado + mensagem
- [ ] Readonly banner para ciclo PUBLISHED com botao Fork
- [ ] Nos com opacity 0.7 em modo readonly
- [ ] Painel lateral 480px ao clicar no de estagio
- [ ] 4 abas no painel: Informacoes, Gates, Papeis, Transicoes
- [ ] Tab Informacoes: nome, descricao, macroetapa select, posicao, toggles
- [ ] Tab Gates: lista com type badge, drag-and-drop, add/edit/delete
- [ ] Tab Papeis: lista com can_approve badge, add/remove
- [ ] Tab Transicoes: saida (editavel) + entrada (readonly)
- [ ] Auto-save com debounce 800ms e indicador visual
- [ ] Sincronizacao bidirecional canvas <-> painel
- [ ] GhostNode durante criacao de estagio
- [ ] Modais de confirmacao (publish, delete, deprecate)
