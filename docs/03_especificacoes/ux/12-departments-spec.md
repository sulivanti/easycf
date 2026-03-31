# 12-Departments — Spec Definitiva

> **Rota:** `/organizacao/departamentos` | **Módulo:** MOD-003 | **Screen ID:** UX-ORG-003
> **Viewport:** 1440 × 900 px | **Font:** Plus Jakarta Sans
> **Referência:** UX-002.md (jornadas e fluxos de departamentos)

---

## 1. Decisões de Design (PO)

AppShell reutilizado, com sidebar adaptada para este contexto:

| Item | Decisão |
|------|---------|
| Sidebar ativo | "Departamentos" (categoria ORGANIZAÇÃO) |
| Breadcrumb | "Organização › Departamentos" |
| Topbar direita | "Admin ECF" / "A1 Engenharia" + avatar "AE" |
| Sidebar footer | Dot verde + "Servidor Online" |
| Layout conteúdo | **Listagem full-width** com tabela + **Drawer lateral** para create/edit |
| Botão primário | Azul `#2E86C1` ("+ Novo Departamento") |
| Drawer | 480px slide-in da direita com overlay |

---

## 2. Sidebar — Variante Org

```
Sidebar (240×836, fill #FFF, border-right 1px #E8E8E6)
├── "ADMINISTRAÇÃO"
│   ├── Usuários (inativo)
│   └── Perfis e Permissões (inativo)
├── "ORGANIZAÇÃO"
│   ├── Estrutura Org. (inativo)
│   └── Departamentos (ATIVO: bg #E3F2FD, text #2E86C1)
├── "PROCESSOS"
│   └── Modelagem (inativo)
└── Footer: dot verde 8×8 #27AE60 + "Servidor Online" (text 12px #888888)
```

---

## 3. Cores (além do AppShell)

```
ATIVO BADGE          text:#1E7A42  bg:#E8F8EF  border:#B5E8C9
INATIVO BADGE        text:#888888  bg:#F5F5F3  border:#E8E8E6
TABLE HEADER BG      #FAFAFA     Fundo do header da tabela
TABLE ROW HOVER      #F8F8F6     Hover nas linhas da tabela
TABLE BORDER         #F0F0EE     Bordas horizontais entre linhas
DRAWER OVERLAY       rgba(0,0,0,0.3)   Backdrop do drawer
DRAWER SHADOW        -4px 0 24px rgba(0,0,0,0.08)
COLOR SWATCH BORDER  #E8E8E6     Borda dos swatches de cor
COLOR PREVIEW BG     cor selecionada  Fill dinâmico do preview
EMPTY STATE TEXT     #888888     Texto do empty state
EMPTY STATE ICON     #CCCCCC     Ícone ilustração empty state
DELETE BTN           text:#E74C3C  bg:transparent  border:#E74C3C
DELETE BTN HOVER     text:#FFF     bg:#E74C3C
SEARCH ICON          #CCCCCC     Ícone lupa na search bar
TOGGLE ACTIVE BG     #2E86C1     Toggle "Mostrar inativos" ativo
TOGGLE INACTIVE BG   #E8E8E6     Toggle "Mostrar inativos" inativo
```

---

## 4. Tipografia (conteúdo específico)

```
PAGE HEADER
  "Departamentos"                   800  24px  #111111
  "Gerencie os departamentos..."    400  13px  #888888
  "+ Novo Departamento"             700  13px  #FFFFFF  (botão azul)

SEARCH BAR
  Placeholder "Buscar por nome..."  400  13px  #CCCCCC
  Valor digitado                    500  13px  #111111

TABLE HEADER
  "CÓDIGO" etc.                     700  10px  uppercase  ls:+0.8px  #888888

TABLE BODY
  Código                            600  13px  #333333
  Nome                              500  13px  #111111
  Cor hex text                      400  11px  #888888
  Status badge "ATIVO"              700  10px  uppercase  (verde)
  Status badge "INATIVO"            700  10px  uppercase  (cinza)
  Data "30 mar 2026"                400  12px  #888888

DRAWER
  Título "Novo Departamento"        700  18px  #111111
  Label campo "CÓDIGO"              700  10px  uppercase  ls:+0.8px  #888888
  Input text                        500  14px  #111111
  Input placeholder                 400  14px  #CCCCCC
  Erro inline                       500  11px  #E74C3C
  "Criar" / "Salvar"                700  13px  #FFFFFF
  "Cancelar"                        600  13px  #555555

TOGGLE
  "Mostrar inativos"                500  12px  #555555

EMPTY STATE
  "Nenhum departamento cadastrado." 600  16px  #888888
  "Criar primeiro departamento"     700  13px  #2E86C1  (link/botão)
```

---

## 5. Estrutura de Elementos

```
12-Departments (frame 1440×900)
│
├── Topbar (branca 64px)
│   ├── Logo A1 azul + "GRUPO A1" / "PORTAL INTERNO"
│   ├── Separador + Breadcrumb: "Organização" #888 › "Departamentos" #111 bold
│   └── Direita: "Admin ECF" / "A1 Engenharia" + avatar "AE"
│
├── Sidebar (240px, ativo: "Departamentos")
│   └── (mesma estrutura seção 2)
│
└── ContentArea (1200×836, fill #F5F5F3, padding:24px)
    │
    ├── PageHeader (group, flex justify-between, align-center)
    │   ├── Esquerda
    │   │   ├── "Departamentos" (24px 800 #111)
    │   │   └── "Gerencie os departamentos do seu tenant" (13px 400 #888, mt:4px)
    │   └── Direita
    │       └── BtnNovo (primary: r:8, fill #2E86C1, h:40, p:0 20px)
    │           └── "+ Novo Departamento" (13px 700 #FFF)
    │
    ├── ToolBar (group, flex justify-between, align-center, mt:20px)
    │   ├── SearchBar (w:320, h:40, r:8, border #E8E8E6, fill #FFF)
    │   │   ├── ÍconeLupa (16×16, stroke #CCC, x:12)
    │   │   └── "Buscar por nome ou código..." (placeholder, x:38)
    │   └── ToggleInativos (group, gap:8px)
    │       ├── Toggle (w:36, h:20, r:10, bg #E8E8E6 ou #2E86C1)
    │       └── "Mostrar inativos" (12px 500 #555)
    │
    ├── TableCard (group, fill #FFF, r:12, border #E8E8E6, mt:16px, overflow hidden)
    │   │
    │   ├── TableHeader (h:44, bg #FAFAFA, border-bottom 1px #F0F0EE, p:0 20px)
    │   │   ├── "CÓDIGO" (w:120)
    │   │   ├── "NOME" (w:flex)
    │   │   ├── "COR" (w:80)
    │   │   ├── "STATUS" (w:100)
    │   │   ├── "CRIADO EM" (w:140)
    │   │   └── "AÇÕES" (w:80, text-align center)
    │   │
    │   ├── TableRow (h:52, border-bottom 1px #F0F0EE, p:0 20px, hover bg #F8F8F6)
    │   │   ├── Código "DEPT-DIR" (13px 600 #333)
    │   │   ├── Nome "Diretoria" (13px 500 #111)
    │   │   ├── CorBadge
    │   │   │   ├── Circle (16×16, r:50%, fill:#2E86C1)
    │   │   │   └── "#2E86C1" (11px 400 #888, ml:6px)
    │   │   ├── Badge "ATIVO" (verde: text #1E7A42, bg #E8F8EF, r:4, p:2px 8px)
    │   │   ├── "30 mar 2026" (12px 400 #888)
    │   │   └── Ações (flex, gap:8px, justify center)
    │   │       ├── BtnEdit (pencil 16×16, stroke #888, hover #2E86C1)
    │   │       └── BtnDelete (trash 16×16, stroke #888, hover #E74C3C)
    │   │
    │   ├── TableRow (repete para cada departamento...)
    │   │
    │   └── TableFooter (h:52, p:0 20px, flex justify-center)
    │       └── "Carregar mais" (13px 600 #2E86C1) — se has_more=true
    │
    └── [EmptyState] (alternativa ao TableCard quando data=[])
        ├── Ilustração (120×120, ícone departamento estilizado, stroke #CCC)
        ├── "Nenhum departamento cadastrado." (16px 600 #888, mt:16px)
        └── BtnCriar (secondary→primary: r:8, fill #2E86C1, h:40, mt:12px)
            └── "Criar primeiro departamento" (13px 700 #FFF)
```

---

## 6. Drawer (Create/Edit)

```
DrawerOverlay (fixed, inset 0, bg rgba(0,0,0,0.3), z:50)
│
└── DrawerPanel (480px×100vh, fill #FFF, right:0, shadow -4px 0 24px rgba(0,0,0,0.08))
    │
    ├── DrawerHeader (h:64, border-bottom 1px #E8E8E6, p:0 24px, flex align-center justify-between)
    │   ├── Título "Novo Departamento" ou "Editar Departamento" (18px 700 #111)
    │   └── BtnFechar (X 20×20, stroke #888, hover #333, cursor pointer)
    │
    ├── DrawerBody (flex-1, overflow-y auto, p:24px)
    │   │
    │   ├── CampoCodigo
    │   │   ├── Label "CÓDIGO" (10px 700 uppercase ls:+0.8px #888, mb:6px)
    │   │   ├── Input (w:100%, h:42, r:8, border #E8E8E6, p:10px 14px, font 14px 500 #111)
    │   │   │   └── [Modo edição: ReadOnlyField — fill #F8F8F6, border #F0F0EE, cursor default]
    │   │   └── [Erro] "Já existe um departamento com o código '{codigo}' neste tenant." (11px 500 #E74C3C, mt:4px)
    │   │
    │   ├── CampoNome (mt:16px)
    │   │   ├── Label "NOME" (mesma tipografia)
    │   │   ├── Input (mesma estrutura)
    │   │   └── [Erro] (mesma estrutura)
    │   │
    │   ├── CampoDescricao (mt:16px)
    │   │   ├── Label "DESCRIÇÃO"
    │   │   └── Textarea (w:100%, h:100, r:8, border #E8E8E6, p:10px 14px, resize vertical)
    │   │
    │   └── CampoCor (mt:16px)
    │       ├── Label "COR"
    │       ├── ColorPickerRow (flex, gap:12px, align-center, mt:6px)
    │       │   ├── HexInput (w:120, h:42, r:8, border #E8E8E6, p:10px 14px)
    │       │   │   └── placeholder "#000000" (14px 400 #CCC)
    │       │   ├── PreviewCircle (24×24, r:50%, fill:var(--cor), border 1px #E8E8E6)
    │       │   └── SwatchPalette (flex, gap:6px)
    │       │       ├── Swatch #2E86C1 (24×24, r:4, cursor pointer, border 2px transparent)
    │       │       ├── Swatch #27AE60
    │       │       ├── Swatch #E74C3C
    │       │       ├── Swatch #F39C12
    │       │       ├── Swatch #8E44AD
    │       │       ├── Swatch #1ABC9C
    │       │       ├── Swatch #E67E22
    │       │       └── Swatch #34495E
    │       │       [Swatch selecionado: border 2px #111]
    │       └── BadgePreview (mt:8px)
    │           └── Tag "Preview" (r:6, p:4px 12px, bg:var(--cor)10%, border 1px var(--cor)30%, text 12px 600 var(--cor))
    │
    └── DrawerFooter (h:72, border-top 1px #E8E8E6, p:16px 24px, flex justify-end gap:12px)
        ├── BtnCancelar (h:40, r:8, border #E8E8E6, p:0 20px, bg #FFF)
        │   └── "Cancelar" (13px 600 #555)
        └── BtnSalvar (h:40, r:8, fill #2E86C1, p:0 20px)
            └── "Criar" ou "Salvar" (13px 700 #FFF)
```

---

## 7. Modal de Confirmação (Desativar)

```
ModalOverlay (fixed, inset 0, bg rgba(0,0,0,0.3), z:60, flex center)
│
└── ModalCard (w:420, r:12, fill #FFF, shadow 0 8px 32px rgba(0,0,0,0.12), p:24px)
    │
    ├── ÍconeWarning (48×48, r:50%, bg #FFF3E0, stroke #E67E22, centrado)
    │
    ├── Título "Desativar departamento?" (18px 700 #111, mt:16px, text-align center)
    │
    ├── Mensagem (mt:8px, text-align center)
    │   └── "Deseja desativar o departamento **{nome}**? Ele poderá ser restaurado posteriormente."
    │       (13px 400 #555, **{nome}** em 600 #111)
    │
    └── BotõesRow (mt:24px, flex justify-center, gap:12px)
        ├── BtnCancelar (h:40, r:8, border #E8E8E6, p:0 20px)
        │   └── "Cancelar" (13px 600 #555)
        └── BtnDesativar (h:40, r:8, fill #E74C3C, p:0 20px)
            └── "Desativar" (13px 700 #FFF)
```

---

## 8. Color Picker — Especificação Detalhada

### Comportamento

1. **Input hex:** O usuário pode digitar diretamente o valor hex (ex: `#2E86C1`)
2. **Swatch palette:** 8 cores pré-definidas clicáveis. Clicar preenche o input automaticamente
3. **Preview circle:** Atualiza em tempo real conforme o input muda
4. **Badge preview:** Mostra como o departamento aparecerá como tag
5. **Validação:** Ao perder foco (blur) com valor inválido (ex: `#FFF`, `vermelho`, `#GGGGGG`), input recebe borda `#E74C3C` + mensagem "Formato de cor inválido. Use #RRGGBB." (11px 500 #E74C3C, mt:4px). Preview circle fica cinza `#E8E8E6`.
6. **Limpar:** Apagar o input define `cor: null` (sem cor)

### Swatch Palette (Cores Sugeridas)

| Cor | Nome semântico | Uso sugerido |
|-----|----------------|--------------|
| `#2E86C1` | Azul ECF | Departamentos técnicos |
| `#27AE60` | Verde | Departamentos operacionais |
| `#E74C3C` | Vermelho | Departamentos críticos |
| `#F39C12` | Amarelo | Departamentos de suporte |
| `#8E44AD` | Roxo | Departamentos estratégicos |
| `#1ABC9C` | Teal | Departamentos de inovação |
| `#E67E22` | Laranja | Departamentos de projetos |
| `#34495E` | Cinza escuro | Departamentos administrativos |

### Badge Colorido (Tag)

O departamento aparece como tag em diversas telas. O badge usa a cor do departamento:

```
Tag (inline-flex, r:6, p:4px 12px)
├── Circle (8×8, r:50%, fill: var(--cor), mr:6px)
└── Nome (12px 600 #333)
Border: 1px solid var(--cor) com 30% opacity
Background: var(--cor) com 10% opacity
```

Quando `cor: null` (sem cor definida):
```
Tag (inline-flex, r:6, p:4px 12px, border 1px #E8E8E6, bg #FFF)
└── Nome (12px 600 #888)
```

---

## 9. Estados da Tela

### Loading (Skeleton)

```
TableCard
├── TableHeader (normal)
└── SkeletonRows (6×)
    ├── Rect 80×14 r:4 bg:#E8E8E6 animate pulse  (código)
    ├── Rect 160×14 r:4 bg:#E8E8E6 animate pulse  (nome)
    ├── Circle 16×16 bg:#E8E8E6 animate pulse      (cor)
    ├── Rect 50×20 r:4 bg:#E8E8E6 animate pulse    (status)
    ├── Rect 80×14 r:4 bg:#E8E8E6 animate pulse    (data)
    └── Rect 48×14 r:4 bg:#E8E8E6 animate pulse    (ações)
```

### Empty State

```
EmptyContainer (flex-col, align-center, p:60px)
├── Ilustração (120×120, ícone folder-tag, stroke #CCC, fill none)
├── "Nenhum departamento cadastrado." (16px 600 #888, mt:16px)
├── "Crie departamentos para categorizar suas unidades organizacionais." (13px 400 #AAA, mt:4px)
└── BtnCriar (primary, mt:16px)
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
├── "Não foi possível carregar os departamentos." (14px 500 #888, mt:12px)
└── BtnRetry (secondary, mt:12px)
    └── "Tentar novamente" (13px 600 #555)
```

---

## 10. Medidas

```
Content area          1200×836    fill:#F5F5F3  padding:24px
Page header           auto×auto   flex justify-between
Search bar            320×40      r:8   border:1px #E8E8E6  fill:#FFF
Toggle track          36×20       r:10
Table card            auto×auto   r:12  border:1px #E8E8E6  fill:#FFF
Table header          auto×44     bg:#FAFAFA  border-bottom:1px #F0F0EE
Table row             auto×52     border-bottom:1px #F0F0EE  hover:#F8F8F6
Table cell padding    0 20px
Cor circle            16×16       r:50%
Status badge          auto×auto   r:4   padding:2px 8px
Action icon           16×16       stroke:#888  hover:colored
Drawer                480×100vh   fill:#FFF  shadow:-4px 0 24px rgba(0,0,0,0.08)
Drawer header         auto×64     border-bottom:1px #E8E8E6
Drawer footer         auto×72     border-top:1px #E8E8E6
Input field           100%×42     r:8   border:1px #E8E8E6
Textarea              100%×100    r:8   border:1px #E8E8E6
Hex input             120×42      r:8
Preview circle        24×24       r:50%
Swatch                24×24       r:4
Modal card            420×auto    r:12  shadow:0 8px 32px rgba(0,0,0,0.12)
Empty illustration    120×120
Button primary        auto×40     r:8   fill:#2E86C1
Button secondary      auto×40     r:8   border:1px #E8E8E6
Button danger         auto×40     r:8   fill:#E74C3C
```

---

## 11. Responsividade

| Breakpoint | Comportamento |
|---|---|
| ≥ 1280px | Tabela full-width, drawer 480px overlay, todas colunas visíveis |
| 1024–1279px | Tabela full-width, drawer 420px overlay, coluna "Criado em" hidden |
| 768–1023px | Tabela com scroll horizontal, drawer 100% full-screen, search bar 100% |
| < 768px | Cards verticais (1 card por departamento), drawer 100% full-screen, botão novo fixed bottom |

### Card Mobile (< 768px)

```
DeptCard (r:12, border 1px #E8E8E6, fill #FFF, p:16px, mb:12px)
├── HeaderRow (flex justify-between)
│   ├── Código "DEPT-DIR" (10px 700 uppercase #888)
│   └── Badge "ATIVO" (verde)
├── Nome "Diretoria" (16px 600 #111, mt:8px)
├── CorRow (flex align-center, mt:8px)
│   ├── Circle (12×12, fill cor)
│   └── "#2E86C1" (11px 400 #888, ml:6px)
└── FooterRow (flex justify-between, mt:12px)
    ├── "30 mar 2026" (11px 400 #888)
    └── Ações (flex gap:12px)
        ├── BtnEdit (pencil)
        └── BtnDelete (trash)
```

---

## 12. Componentes a Criar

| Componente | Descrição | Reutilização |
|------------|-----------|--------------|
| `departments/DepartmentsPage` | Página principal com tabela, search, toggle, header | Rota /organizacao/departamentos |
| `departments/DepartmentTable` | Tabela com colunas, paginação cursor, skeleton loading | DepartmentsPage |
| `departments/DepartmentDrawer` | Drawer lateral create/edit com form e color picker | DepartmentsPage |
| `departments/ColorPicker` | Input hex + swatch palette + preview circle + badge | DepartmentDrawer, futuras telas |
| `departments/DepartmentTag` | Badge colorido de departamento (circle + nome) | DetailPanel (org-units), DepartmentTable |
| `departments/DeactivateModal` | Modal de confirmação de desativação | DepartmentsPage |
| `ui/DrawerPanel` | Container drawer genérico (overlay + slide-in + header/footer) | DepartmentDrawer, futuras telas |

---

## 13. Checklist

- [ ] Sidebar: "Departamentos" ativo na categoria ORGANIZAÇÃO
- [ ] Breadcrumb: "Organização › Departamentos"
- [ ] Page header com título + botão "+ Novo Departamento"
- [ ] Search bar (320×40) com ícone lupa
- [ ] Toggle "Mostrar inativos"
- [ ] Tabela com 5 colunas: Código, Nome, Cor, Status, Criado em + Ações
- [ ] Cor exibida como circle colorido + hex text
- [ ] Status como badge verde (ATIVO) ou cinza (INATIVO)
- [ ] Ações: edit (pencil) + delete (trash) por linha
- [ ] Paginação cursor: "Carregar mais" no footer
- [ ] Drawer 480px slide-in com 4 campos (codigo, nome, descricao, cor)
- [ ] Color picker: input hex + 8 swatches + preview circle + badge preview
- [ ] Campo código readonly no modo edição (ReadOnlyField)
- [ ] Modal de confirmação para desativação
- [ ] Empty state com ilustração + botão criar
- [ ] Empty search com link "Limpar filtros"
- [ ] Error state com botão "Tentar novamente"
- [ ] Loading skeleton (6 linhas animadas)
- [ ] Responsividade: drawer full-screen em mobile, cards verticais < 768px
