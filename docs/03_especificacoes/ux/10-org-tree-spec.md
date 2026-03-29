# 10-OrgTree — Spec Definitiva

> **Rota:** `/organizacao` | **Módulo:** MOD-001 | **Frame Penpot:** `10-OrgTree`
> **Viewport:** 1440 × 900 px | **Font:** Plus Jakarta Sans
> **Referência:** `screen.png` (Org Tree real) — layout split-panel (árvore + detalhe)

---

## 1. Decisões de Design (PO)

AppShell reutilizado, com sidebar adaptada para este contexto:

| Item | Decisão |
|------|---------|
| Sidebar ativo | "Estrutura Org." (categoria ORGANIZAÇÃO) |
| Breadcrumb | "Organização › Estrutura Organizacional" |
| Topbar direita | "Admin ECF" / "A1 Engenharia" + avatar "AE" |
| Sidebar footer | Dot verde + "Servidor Online" (em vez de UserBlock) |
| Layout conteúdo | **Split-panel:** Árvore 380px esquerda + Detalhe flex direita |
| Botão primário | Azul `#2E86C1` ("+ Nova Subdivisão") |
| Botão secondary | Branco + borda ("Editar Dados") |

---

## 2. Sidebar — Variante Org

Categorias diferentes da tela de Usuários:

```
Sidebar (240×836, fill #FFF, border-right 1px #E8E8E6)
├── "ADMINISTRAÇÃO"
│   ├── Usuários (inativo)
│   └── Perfis e Permissões (inativo)
├── "ORGANIZAÇÃO"
│   └── Estrutura Org. (ATIVO: bg #E3F2FD, text #2E86C1)
├── "PROCESSOS"
│   └── Modelagem (inativo)
└── Footer: dot verde 8×8 #27AE60 + "Servidor Online" (text 12px #888888)
```

---

## 3. Cores (além do AppShell)

```
ATIVO BADGE          text:#1E7A42  bg:#E8F8EF  border:#B5E8C9
READONLY BG          #F8F8F6     Fundo campos somente leitura
READONLY BORDER      #F0F0EE     Borda campos somente leitura
TREE SELECTED BG     #E3F2FD     Fundo do nó selecionado na árvore
TREE ICON            #2E86C1     Ícone Building do nó selecionado
TREE NODE NORMAL     #555555     Texto de nó não selecionado
TREE NODE SELECTED   #2E86C1     Texto de nó selecionado
TREE DOT             #888888     Dots de filhos na árvore
TREE CHEVRON         #888888     Seta expand/collapse
SECTION LABEL        #888888     "DADOS CADASTRAIS", "DEPARTAMENTOS VINCULADOS"
TAG BORDER           #E8E8E6     Borda dos tags de departamento
TAG TEXT             #333333     Texto dos tags
TAG ADD TEXT         #888888     "+ Novo Departamento"
TAG ADD BORDER       dashed #CCCCCC
CARD BLUE BG         #2E86C1     Card "Colaboradores Totais"
CARD BLUE TEXT       #FFFFFF     Texto sobre card azul
PROGRESS BAR BG      #E8E8E6     Trilha da progress bar
PROGRESS BAR FILL    #2E86C1     Preenchimento progress bar
```

---

## 4. Tipografia (conteúdo específico)

```
TREE PANEL
  "Estrutura de Unidades"           800  16px  #111111
  "Navegue pela hierarquia..."      400  12px  #888888
  Search placeholder                400  13px  #CCCCCC
  Nó raiz "Grupo A1"               700  14px  #111111
  Nó selecionado "A1 Engenharia"   700  13px  #2E86C1
  Nó normal "A1 Industrial"        500  13px  #555555
  Filho "Diretoria"                400  13px  #555555

DETAIL PANEL
  Header nome "A1 Engenharia"      800  24px  #111111
  Badge "ATIVO"                    700  10px  uppercase  (verde)
  Código "Cód: UN-0012"            400  12px  #888888
  "Editar Dados"                   600  13px  #555555
  "+ Nova Subdivisão"              700  13px  #FFFFFF

SEÇÕES
  "DADOS CADASTRAIS"               700  10px  uppercase  ls:+1px  #888888
  "DEPARTAMENTOS VINCULADOS"       700  10px  uppercase  ls:+1px  #888888
  Label campo "CNPJ" etc.          700  10px  uppercase  ls:+0.8px  #888888
  Valor campo                      500  14px  #111111
  "Ver todos (12)"                 600  12px  #2E86C1

TAGS
  "Diretoria" etc.                 500  13px  #333333
  "+ Novo Departamento"            400  13px  #888888

METRIC CARDS
  "COLABORADORES TOTAIS"           700  10px  uppercase  ls:+1px  #FFFFFF (sobre azul)
  "156"                            800  36px  #FFFFFF
  "14 novos nos últimos 30 dias"   400  11px  rgba(255,255,255,0.7)
  "PROJETOS EM EXECUÇÃO"           700  10px  uppercase  ls:+1px  #888888
  "28"                             800  36px  #111111
  "70% Meta"                       400  11px  #888888
```

---

## 5. Estrutura de Elementos

```
10-OrgTree (frame 1440×900)
│
├── Topbar (branca 64px)
│   ├── Logo A1 azul + "GRUPO A1" / "PORTAL INTERNO"
│   ├── Separador + Breadcrumb: "Organização" #888 › "Estrutura Organizacional" #111 bold
│   └── Direita: "Admin ECF" / "A1 Engenharia" + avatar "AE"
│
├── Sidebar (240px, ativo: "Estrutura Org.")
│   ├── ADMINISTRAÇÃO: Usuários, Perfis e Permissões
│   ├── ORGANIZAÇÃO: Estrutura Org. (ATIVO)
│   ├── PROCESSOS: Modelagem
│   └── Footer: dot verde + "Servidor Online"
│
└── ContentArea (1200×836, fill #F5F5F3, SEM padding — split-panel ocupa tudo)
    │
    ├── PainelÁrvore (frame 380px×836, fill #FFFFFF, border-right 1px #E8E8E6)
    │   │  padding: 20px
    │   │
    │   ├── "Estrutura de Unidades" (text 16px 800 #111)
    │   ├── "Navegue pela hierarquia do grupo" (text 12px #888, mt:4px)
    │   │
    │   ├── SearchBar (mt:16px)
    │   │   ├── FundoInput (340×40, r:8, border #E8E8E6, fill #FFF)
    │   │   ├── ÍconeLupa (16×16, stroke #CCC, x:12)
    │   │   └── "Buscar unidade ou depto..." (placeholder, x:38)
    │   │
    │   └── Árvore (mt:16px)
    │       ├── BotãoVoltar "‹" (14×14, stroke #888) + ÍconeBuilding (16×16) + "Grupo A1" (14px 700 #111)
    │       │
    │       └── NóExpandido (ml:24px, mt:8px)
    │           ├── NóSelecionado "A1 Engenharia" (bg #E3F2FD, r:6, p:8px 12px)
    │           │   ├── Chevron "‹" (rotated, 12×12, #2E86C1)
    │           │   ├── ÍconeBuilding (16×16, stroke #2E86C1)
    │           │   └── "A1 Engenharia" (13px 700 #2E86C1)
    │           │
    │           ├── Filhos (ml:32px, gap:4px)
    │           │   ├── Dot #888 8×8 + "Diretoria" (13px 400 #555)
    │           │   ├── Dot #888 8×8 + "Engenharia Civil"
    │           │   └── Dot #888 8×8 + "Projetos Especiais"
    │           │
    │           ├── NóColapsado "A1 Industrial" (mt:8px)
    │           │   ├── Chevron "›" (12×12, #888)
    │           │   ├── ÍconeBuilding (16×16, stroke #888)
    │           │   └── "A1 Industrial" (13px 500 #555)
    │           │
    │           └── NóColapsado "A1 Energia" (mt:4px)
    │               └── (mesma estrutura)
    │
    └── PainelDetalhe (frame flex×836, fill #F5F5F3, padding:24px, overflow-y:auto)
        │
        ├── HeaderDetalhe (group, fill #FFF, r:12, border #E8E8E6, p:20px, justify-between)
        │   ├── Esquerda (group)
        │   │   ├── ÍconeBuilding (40×40, r:10, fill #F5F5F3, stroke #888, centrado)
        │   │   ├── "A1 Engenharia" (24px 800 #111)
        │   │   ├── Badge "ATIVO" (verde)
        │   │   └── "Cód: UN-0012" (12px 400 #888)
        │   └── Direita (group, gap:12px)
        │       ├── BtnEditar (secondary: r:8, border #E8E8E6, h:40)
        │       │   ├── ÍconePencil (16×16, stroke #555)
        │       │   └── "Editar Dados" (13px 600 #555)
        │       └── BtnNova (primary: r:8, fill #2E86C1, h:40)
        │           └── "+ Nova Subdivisão" (13px 700 #FFF)
        │
        ├── CardDadosCadastrais (group, fill #FFF, r:12, border #E8E8E6, p:24px, mt:20px)
        │   ├── "DADOS CADASTRAIS" (section label)
        │   ├── Row1 (2 colunas, mt:16px)
        │   │   ├── ReadOnlyField "CNPJ" = "12.345.678/0001-90"
        │   │   └── ReadOnlyField "RAZÃO SOCIAL" = "A1 Engenharia e Construções Civis Ltda"
        │   ├── Row2 (3 colunas, mt:16px)
        │   │   ├── ReadOnlyField "FILIAL" = "São Paulo - SP"
        │   │   ├── ReadOnlyField "RESPONSÁVEL" = "Marcos Silva"
        │   │   └── ReadOnlyField "TELEFONE" = "(11) 3456-7890"
        │   └── Row3 (1 coluna, mt:16px)
        │       └── ReadOnlyField "E-MAIL DE CONTATO" = "contato@a1engenharia.com.br"
        │
        ├── CardDepartamentos (group, fill #FFF, r:12, border #E8E8E6, p:24px, mt:20px)
        │   ├── HeaderRow: "DEPARTAMENTOS VINCULADOS" + "Ver todos (12)" (link azul)
        │   └── TagsWrap (flex-wrap, gap:8px, mt:12px)
        │       ├── Tag "Diretoria" (r:6, border #E8E8E6, p:8px 16px)
        │       ├── Tag "Engenharia Civil"
        │       ├── Tag "Projetos Especiais"
        │       ├── Tag "Recursos Humanos"
        │       ├── Tag "Jurídico"
        │       └── Tag "+ Novo Departamento" (borda dashed #CCC, text #888)
        │
        └── MetricCards (group, 2 colunas, gap:20px, mt:20px)
            ├── CardColaboradores (fill #2E86C1, r:16, p:24px, h:~140)
            │   ├── "COLABORADORES TOTAIS" (10px 700 uppercase #FFF)
            │   ├── "156" (36px 800 #FFF)
            │   ├── "14 novos nos últimos 30 dias" (11px rgba(255,255,255,0.7))
            │   └── Decoração: 2 círculos semi-transparentes (rgba(255,255,255,0.1))
            └── CardProjetos (fill #FFF, r:16, border #E8E8E6, p:24px)
                ├── "PROJETOS EM EXECUÇÃO" (10px 700 uppercase #888)
                ├── "28" (36px 800 #111)
                └── ProgressBar (w:100%, h:6, r:3, bg #E8E8E6, fill 70% #2E86C1)
                    └── "70% Meta" (11px #888, alinhado à direita)
```

---

## 6. ReadOnlyField (componente reutilizável)

```
ReadOnlyField (group)
├── Label (10px 700 uppercase ls:+0.8px #888888, mb:6px)
└── Valor (rect auto×42, r:8, fill #F8F8F6, border 1px #F0F0EE, p:10px 14px)
    └── text (14px 500 #111111)
```

Diferença do Input editável:
- Fill: `#F8F8F6` (não branco)
- Border: `#F0F0EE` (mais sutil)
- Sem ícone, sem placeholder
- Cursor: default (não text)

---

## 7. Medidas

```
Tree panel           380×836     fill:#FFF   border-right:1px #E8E8E6
Detail panel         flex×836    fill:#F5F5F3  padding:24px  overflow-y:auto
Header card          auto×auto   r:12   border:1px #E8E8E6   padding:20px
Section card         auto×auto   r:12   border:1px #E8E8E6   padding:24px
ReadOnlyField value  auto×42     r:8    fill:#F8F8F6  border:1px #F0F0EE
Tag                  auto×auto   r:6    border:1px #E8E8E6   padding:8px 16px
Tag dashed           auto×auto   r:6    border:1px dashed #CCC  padding:8px 16px
Metric card blue     ~50%×140    r:16   fill:#2E86C1
Metric card white    ~50%×auto   r:16   border:1px #E8E8E6
Progress bar         100%×6      r:3    bg:#E8E8E6  fill:#2E86C1
Building icon bg     40×40       r:10   fill:#F5F5F3
Tree search          340×40      r:8    border:1px #E8E8E6
Tree node selected   auto×auto   r:6    fill:#E3F2FD  padding:8px 12px
```

---

## 8. Componentes a Criar

| Componente | Descrição | Reutilização |
|------------|-----------|--------------|
| `org/TreePanel` | Painel esquerdo com título, busca e árvore hierárquica | OrgTree, OrgScope |
| `org/TreeNode` | Nó da árvore com chevron, ícone, nome, estados selected/collapsed | TreePanel |
| `org/DetailPanel` | Painel direito com header, dados cadastrais, departamentos, métricas | OrgTree |
| `org/DepartmentTags` | Wrap de tags com "+ Novo Departamento" | DetailPanel |
| `ui/ReadOnlyField` | Label + valor em campo readonly (fill sutil, sem interação) | OrgForm, Profile, ~10 telas |
| `ui/ProgressBar` | Barra de progresso com percentual | Métricas, Dashboard futuro |

---

## 9. Checklist

- [ ] Layout split-panel: árvore 380px + detalhe flex
- [ ] Sidebar: "Estrutura Org." ativo na categoria ORGANIZAÇÃO
- [ ] Footer sidebar: dot verde + "Servidor Online"
- [ ] Breadcrumb: "Organização › Estrutura Organizacional"
- [ ] Topbar direita: "Admin ECF" / "A1 Engenharia" + avatar
- [ ] Árvore com 3 nós raiz: A1 Engenharia (expandido), A1 Industrial, A1 Energia
- [ ] "A1 Engenharia" selecionado com fundo `#E3F2FD`
- [ ] 3 filhos com dot cinza: Diretoria, Engenharia Civil, Projetos Especiais
- [ ] Header detalhe: ícone building + nome + ATIVO + código
- [ ] Botões "Editar Dados" (secondary) + "+ Nova Subdivisão" (azul primary)
- [ ] Dados Cadastrais com 6 ReadOnlyFields
- [ ] Departamentos com 5 tags + "+ Novo Departamento" dashed
- [ ] Card azul "COLABORADORES TOTAIS 156" com círculos decorativos
- [ ] Card branco "PROJETOS EM EXECUÇÃO 28" com progress bar 70%
