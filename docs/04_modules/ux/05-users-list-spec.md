# 05-UsersList — Spec Definitiva

> **Rota:** `/usuarios` | **Módulo:** MOD-000 | **Frame Penpot:** `05-UsersList`
> **Viewport:** 1440 × 900 px | **Font:** Plus Jakarta Sans
> **Referências:** `stitchusers.png` + `screen.png` (AppShell)

---

## 1. Decisões de Design (PO)

| Item | Decisão |
|------|---------|
| Topbar fundo | Branco com border-bottom `#E8E8E6` |
| Logo A1 | Azul `#2E86C1`, radius 10 |
| Sidebar | Fixa 240px, texto visível |
| Sidebar item ativo | Azul `#2E86C1` com fundo `#E3F2FD` |
| Botão primário | Azul `#2E86C1` |
| Links | Azul `#2E86C1` |

---

## 2. Cores

```
AZUL PRIMÁRIO         #2E86C1     Logo, botões, links, sidebar ativo, avatar
AZUL HOVER            #256FA0     Hover botões
AZUL CLARO            #E3F2FD     Sidebar item ativo bg
PRETO                 #111111     Títulos, nomes, "Grupo A1"
FUNDO PÁGINA          #F5F5F3     ContentArea bg
BRANCO                #FFFFFF     Topbar, sidebar, cards, inputs, tabela
BORDA                 #E8E8E6     Todas as bordas
BORDA LIGHT           #F0F0EE     Divisores internos tabela
ERRO                  #E74C3C     Dot notificação

TEXTO
  primary             #111111
  secondary           #333333
  tertiary            #555555
  auxiliary           #888888
  hint                #AAAAAA
  placeholder         #CCCCCC

STATUS BADGES
  ATIVO               text:#1E7A42  bg:#E8F8EF  border:#B5E8C9
  INATIVO             text:#6C757D  bg:#F4F4F2  border:#E0E0DE
  BLOQUEADO           text:#C0392B  bg:#FFEBEE  border:#F5C6CB
```

---

## 3. Tipografia

```
TOPBAR
  "Grupo A1"           800  14px  #111111
  "PORTAL INTERNO"     600  10px  #888888  uppercase  ls:+1.2px
  Breadcrumb inativo   400  13px  #888888
  Breadcrumb ativo     700  13px  #111111
  "Empresa: A1..."     500  12px  #555555

SIDEBAR
  Categoria            700   9px  #AAAAAA  uppercase  ls:+1.4px
  Menu inativo         500  13px  #888888
  Menu ativo           700  13px  #2E86C1
  User nome            700  12px  #111111
  User email           400  11px  #888888

CONTEÚDO
  "Usuários"                        800  28px  lh:34px  ls:-1px  #111111
  Descrição                         400  14px  #888888
  "+ Novo Usuário"                  700  13px  #FFFFFF
  Placeholder busca                 400  13px  #CCCCCC
  "Busca Avançada"                  600  13px  #2E86C1
  "Filtrar por:"                    400  12px  #888888
  "Todos os Status"                 500  12px  #333333
  Cabeçalho tabela                  700  11px  uppercase  ls:+0.5px  #888888
  Célula tabela                     400  13px  #555555
  Nome (link)                       600  13px  #2E86C1
  Badge                             700  10px  uppercase
  "Exibindo 4 de 128 usuários"     400  12px  #888888
  "Carregar mais resultados"        500  12px  #333333
```

---

## 4. Medidas

```
Topbar               1440×64   fill:#FFF   border-bottom:1px #E8E8E6
Logo ícone            40×40     r:10        fill:#2E86C1
Separador topbar      1×24      fill:#E8E8E6
Sidebar              240×836    fill:#FFF   border-right:1px #E8E8E6
MenuItem             h:40       r:6         padding:10px 12px
Avatar               32×32      r:50%       fill:#2E86C1
ContentArea          1200×836   fill:#F5F5F3  padding:32px
Botão primary        h:40       r:8         fill:#2E86C1
Botão secondary      h:36       r:6         border:1px #E8E8E6
Input busca          520×42     r:8         border:1px #E8E8E6
Select filtro        ~160×36    r:6         border:1px #E8E8E6
Tabela container     r:10       border:1px #E8E8E6
Badge status         r:20       padding:3px 10px
```

---

## 5. Estrutura de Elementos

```
05-UsersList (frame 1440×900)
│
├── Topbar (frame 1440×64, fill #FFF, border-bottom 1px #E8E8E6)
│   ├── LogoIcone (rect 40×40, r:10, fill #2E86C1)
│   │   └── "A1" (text branco 16px 800)
│   ├── LogoTexto
│   │   ├── "Grupo A1" (text #111111 14px 800)
│   │   └── "PORTAL INTERNO" (text #888888 10px 600 uppercase)
│   ├── Separador (rect 1×24, fill #E8E8E6)
│   ├── Breadcrumb: "Início" #888888 › "Usuários" #111111 bold
│   ├── ÍconeSino (18×18, stroke #888888) + DotVermelho (7×7 #E74C3C)
│   └── "Empresa: A1 Engenharia" (text #555555 12px)
│
├── Sidebar (frame 240×836, fill #FFF, border-right 1px #E8E8E6)
│   ├── "ADMINISTRAÇÃO" (label categoria)
│   │   ├── Dashboard (inativo)
│   │   ├── Usuários (ATIVO: bg #E3F2FD, text #2E86C1)
│   │   ├── Perfis (inativo)
│   │   └── Empresas (inativo)
│   ├── "PROCESSOS" (label categoria)
│   │   ├── Solicitações (inativo)
│   │   └── Aprovações (inativo)
│   └── UserBlock: Avatar "AE" #2E86C1 + "Administrador ECF" + "admin@a1.com.br"
│
└── ContentArea (1200×836, fill #F5F5F3, padding 32px)
    ├── PageHeader (justify-between)
    │   ├── "Usuários" + "Gerencie os acessos..."
    │   └── Botão "+ Novo Usuário" (azul #2E86C1)
    │
    ├── BarraBusca (mt:24px)
    │   ├── Input lupa (520×42) + "Buscar por nome ou e-mail..."
    │   ├── "Busca Avançada" (link azul)
    │   └── "Filtrar por:" + Select "Todos os Status"
    │
    ├── Tabela (mt:16px, bg #FFF, r:10, border #E8E8E6)
    │   ├── Cabeçalho: STATUS | NOME | E-MAIL | PERFIL | EMPRESA | ÚLTIMO ACESSO | AÇÕES
    │   ├── L1: ATIVO    | Marcos Silva  | marcos.silva@a1.com.br  | Administrador | A1 Engenharia | 27/03/2026 | •••
    │   ├── L2: ATIVO    | Ana Oliveira  | ana.oliveira@a1.com.br  | Operador      | A1 Industrial | 26/03/2026 | •••
    │   ├── L3: INATIVO  | Julia Lima    | julia.lima@a1.com.br    | Operador      | A1 Agro       | 15/02/2026 | •••
    │   └── L4: BLOQUEADO| Pedro Mendes  | pedro.mendes@a1.com.br  | Operador      | A1 Industrial | 01/01/2026 | •••
    │
    └── Paginação (mt:12px)
        ├── "Exibindo 4 de 128 usuários"
        └── Botão "Carregar mais resultados"
```

---

## 6. Larguras das Colunas da Tabela

```
STATUS         110px
NOME           140px
E-MAIL         220px
PERFIL         150px
EMPRESA        150px
ÚLTIMO ACESSO  130px
AÇÕES           80px  (centrado)
```

---

## 7. Dropdown de Ações (menu contextual por status)

Ao clicar no "•••" de uma linha, exibe um dropdown (`ui/DropdownMenu`) ancorado à direita da célula. As ações mudam conforme o status do usuário.

### Componente visual

```
DropdownMenu (frame auto×auto, fill #FFF, r:8, border 1px #E8E8E6, shadow 0 4px 12px rgba(0,0,0,0.08))
│  padding: 6px
│  min-width: 180px
│
├── AçãoPrimária (rect w:100%, h:36, r:6, fill #E3F2FD, text #2E86C1 13px 600)
├── AçãoNormal (rect w:100%, h:36, r:6, fill transparente, text #555555 13px 400)
│   hover: fill #F8F8F6
├── Separador (rect w:calc(100%-16px), h:1, fill #E8E8E6, mx:8px, my:4px)
└── AçãoPerigosa (rect w:100%, h:36, r:6, fill transparente, text #C0392B 13px 400)
    hover: fill #FFF5F5
```

### Ações por status

**ATIVO:**
```
├── Editar              (primária, azul, ícone Pencil)        → navega para 06-UserForm
├── Resetar senha       (normal, ícone KeyRound)              → ConfirmationModal
├── ── separador ──
├── Desativar           (perigosa, vermelha, ícone UserMinus)  → ConfirmationModal
└── Bloquear            (perigosa, vermelha, ícone ShieldBan)  → ConfirmationModal
```

**INATIVO:**
```
├── Reativar            (primária, verde #1E7A42 sobre #E8F8EF, ícone UserCheck) → PATCH status
├── Editar              (normal, ícone Pencil)                → navega para 06-UserForm
├── ── separador ──
└── Bloquear            (perigosa, vermelha, ícone ShieldBan)  → ConfirmationModal
```

**BLOQUEADO:**
```
├── Desbloquear         (primária, verde #1E7A42 sobre #E8F8EF, ícone ShieldCheck) → PATCH status
├── Editar              (normal, ícone Pencil)                → navega para 06-UserForm
├── ── separador ──
└── Desativar           (perigosa, vermelha, ícone UserMinus)  → ConfirmationModal
```

**PENDENTE:**
```
├── Reenviar convite    (primária, azul, ícone Send)           → POST + CooldownButton 60s
├── Editar              (normal, ícone Pencil)                → navega para 06-UserForm
├── ── separador ──
├── Cancelar convite    (perigosa, vermelha, ícone MailX)      → ConfirmationModal
└── Bloquear            (perigosa, vermelha, ícone ShieldBan)  → ConfirmationModal
```

### Regras UX

1. **"Editar" existe em TODOS os estados** — sempre navega para 06-UserForm
2. **Ação primária** (destaque) é a mais relevante para aquele status
3. **Ações destrutivas** ficam abaixo do separador, em vermelho `#C0392B`
4. **ConfirmationModal obrigatório** para: Desativar, Bloquear, Cancelar convite
5. **Dropdown fecha** ao clicar fora ou ao selecionar uma ação
6. **Posição:** Ancorado ao "•••", alinhado à direita, abre para baixo (ou para cima se perto do fundo)

### Tipografia do Dropdown

```
Ação primária          600  13px  #2E86C1 (ou #1E7A42 para verde)
Ação normal            400  13px  #555555
Ação perigosa          400  13px  #C0392B
Ícone                  16×16  stroke da cor do texto  stroke-width 1.6
```

---

## 8. Checklist

- [ ] Topbar BRANCA com border-bottom (não preta)
- [ ] Logo A1 AZUL `#2E86C1` (não laranja)
- [ ] Sidebar 240px fixa com texto visível
- [ ] "Usuários" ativo: fundo `#E3F2FD`, texto `#2E86C1`
- [ ] Categorias "ADMINISTRAÇÃO" e "PROCESSOS" uppercase cinza
- [ ] UserBlock com avatar AZUL "AE" no rodapé
- [ ] Botão "+ Novo Usuário" azul `#2E86C1`
- [ ] SearchBar com lupa + "Busca Avançada" azul
- [ ] Filtro "Todos os Status" com chevron
- [ ] Tabela 7 colunas, 4 linhas
- [ ] Badges: ATIVO verde, INATIVO cinza, BLOQUEADO vermelho
- [ ] Nomes são links azuis
- [ ] Paginação: info + botão carregar mais
- [ ] Dropdown "•••" abre menu contextual
- [ ] Dropdown tem fundo branco, r:8, borda, shadow
- [ ] Ações mudam por status (ATIVO≠INATIVO≠BLOQUEADO≠PENDENTE)
- [ ] Ação primária tem fundo azul claro ou verde claro
- [ ] Ações destrutivas em vermelho abaixo do separador
- [ ] "Editar" presente em todos os dropdowns
- [ ] Ícones 16×16 à esquerda de cada ação
