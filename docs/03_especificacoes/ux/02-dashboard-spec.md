# 02-Dashboard — Spec Definitiva

> **Rota:** `/` | **Módulo:** MOD-000 | **Frame Penpot:** `02-Dashboard`
> **Viewport:** 1440 × 900 px | **Font:** Plus Jakarta Sans
> **Referência:** `screen.png` (Dashboard real)

---

## 1. Decisões de Design (PO)

AppShell idêntico ao definido em `05-users-list-spec.md`:
- Topbar branca 64px, logo azul `#2E86C1`, breadcrumb, sino, empresa
- Sidebar fixa 240px, item ativo azul `#2E86C1` com fundo `#E3F2FD`

| Item | Decisão |
|------|---------|
| Sidebar ativo | "Dashboard" (ícone Home) |
| Breadcrumb | "Início › Dashboard" |
| Dados à direita da topbar | "Administrador ECF" + "Acesso Nível 5" + avatar "AE" |

---

## 2. Cores (além do AppShell)

```
CARD VALOR AMBER     #E67E22     "08" Aprovações Pendentes (design system --color-warning)
CARD VALOR GREEN     #27AE60     "05" Agentes MCP (design system --color-success)
CARD VALOR BLACK     #111111     "12" Processos Ativos, "47" Usuários Ativos

DOT AZUL             #2E86C1     "Em execução" (Processos Ativos)
DOT AMBER            #E67E22     "Aguardando revisão" (Aprovações)
DOT GREEN            #27AE60     "Base cadastrada" (Usuários), "Online e operando" (MCP)

DONUT VERDE          #27AE60     Concluído 40%
DONUT AMBER          #E67E22     Andamento 25%
DONUT VERMELHO       #E74C3C     Atrasado 20%
DONUT AZUL           #2E86C1     Planejado 15%
DONUT BG             #F0F0EE     Trilha de fundo do donut

ACTIVITY DOTS
  Verde              #27AE60     Aprovação
  Azul               #2E86C1     Criação
  Amber              #E67E22     Processamento
  Vermelho           #E74C3C     Falha

BADGE CÓDIGO
  bg normal          #F5F5F3     Badge "PR-0042", "MOD-018"
  text normal        #333333
  bg danger          #FFEBEE     Badge "MCP-003"
  text danger        #C0392B

LINK VER TUDO        #2E86C1     "VER TUDO" uppercase
```

---

## 3. Tipografia (conteúdo específico)

```
TÍTULO               "Dashboard"                         800  28px  lh:34px  ls:-1px  #111111
DESCRIÇÃO            "Visão geral em tempo real..."      400  14px  #888888

METRIC CARD
  Label              "PROCESSOS ATIVOS" etc.             700  10px  uppercase  ls:+1px  #888888
  Valor              "12" etc.                           800  36px  lh:40px  #111111 (ou cor semântica)
  Indicador          "Em execução" etc.                  400  11px  #AAAAAA
  Dot                circle 6×6, cor semântica

DONUT CHART
  Título seção       "Distribuição por Status"            700  14px  #111111
  Valor central      "72"                                800  24px  #111111
  Label central      "TOTAL"                             700   9px  uppercase  ls:+1px  #AAAAAA
  Legenda item       "Concluído" etc.                    400  12px  #555555
  Legenda %          "40%" etc.                          700  12px  #111111

ATIVIDADES
  Título seção       "Atividades Recentes"               700  14px  #111111
  "VER TUDO"                                             700  10px  uppercase  ls:+1px  #2E86C1
  Nome ator          "Carlos Silva" etc.                 700  13px  #111111
  Descrição          "aprovou o processo" etc.           400  13px  #555555
  Badge código       "PR-0042" etc.                      700  10px
  Timestamp          "Hoje, 14:32" etc.                  400  11px  #AAAAAA
```

---

## 4. Estrutura de Elementos

```
02-Dashboard (frame 1440×900)
│
├── Topbar (ver AppShell, breadcrumb: "Início › Dashboard")
│   └── DireitaTopbar: "Administrador ECF" / "Acesso Nível 5" + avatar "AE"
│
├── Sidebar (ver AppShell, ativo: "Dashboard")
│
└── ContentArea (1200×836, fill #F5F5F3, padding 32px)
    │
    ├── PageHeader (group)
    │   ├── "Dashboard" (text display)
    │   └── "Visão geral em tempo real dos processos e agentes do sistema." (text desc)
    │
    ├── MetricGrid (group, mt:24px, 4 colunas, gap 20px)
    │   │
    │   ├── Card "Processos Ativos" (fill #FFF, r:16, border #E8E8E6, p:24px)
    │   │   ├── "PROCESSOS ATIVOS" (text label)
    │   │   ├── "12" (text 36px 800 #111111)
    │   │   └── Dot azul + "Em execução" (text 11px #AAAAAA)
    │   │
    │   ├── Card "Aprovações Pendentes"
    │   │   ├── "APROVAÇÕES PENDENTES" (text label)
    │   │   ├── "08" (text 36px 800 #E67E22)
    │   │   └── Dot amber + "Aguardando revisão"
    │   │
    │   ├── Card "Usuários Ativos"
    │   │   ├── "USUÁRIOS ATIVOS" (text label)
    │   │   ├── "47" (text 36px 800 #111111)
    │   │   └── Dot verde + "Base cadastrada"
    │   │
    │   └── Card "Agentes MCP"
    │       ├── "AGENTES MCP" (text label)
    │       ├── "05" (text 36px 800 #27AE60)
    │       └── Dot verde + "Online e operando"
    │
    └── SecondRow (group, mt:24px, 2 colunas: 5fr + 7fr, gap 20px)
        │
        ├── CardDonut (fill #FFF, r:16, border #E8E8E6, p:24px, ~42% largura)
        │   ├── "Distribuição por Status" (text 14px 700 #111111)
        │   ├── DonutChart (SVG 144×144, stroke-width 14, centrado)
        │   │   ├── Trilha de fundo (#F0F0EE)
        │   │   ├── Segmento verde 40% (#27AE60)
        │   │   ├── Segmento amber 25% (#E67E22)
        │   │   ├── Segmento vermelho 20% (#E74C3C)
        │   │   └── Segmento azul 15% (#2E86C1)
        │   │   └── Centro: "72" (24px 800) + "TOTAL" (9px 700 uppercase)
        │   └── Legenda (grupo vertical, gap 12px, à direita do donut)
        │       ├── Dot verde + "Concluído" + "40%"
        │       ├── Dot amber + "Andamento" + "25%"
        │       ├── Dot vermelho + "Atrasado" + "20%"
        │       └── Dot azul + "Planejado" + "15%"
        │
        └── CardAtividades (fill #FFF, r:16, border #E8E8E6, p:24px, ~58% largura)
            ├── HeaderRow (justify-between)
            │   ├── "Atividades Recentes" (text 14px 700 #111111)
            │   └── "VER TUDO" (text 10px 700 uppercase ls:+1px #2E86C1)
            └── ListaAtividades (grupo vertical, gap 16px)
                ├── Item 1: Dot verde + "Carlos Silva aprovou o processo PR-0042" + "Hoje, 14:32"
                ├── Item 2: Dot azul + "Ana Martins criou nova modelagem MOD-018" + "Hoje, 11:15"
                ├── Item 3: Dot amber + "Agente DocParser processou 24 documentos em lote" + "Hoje, 09:48"
                └── Item 4: Dot vermelho + "Sistema detectou falha crítica no agente MCP-003" + "Ontem, 18:20"
```

---

## 5. Medidas

```
Metric Card          ~270×auto   r:16   border:1px #E8E8E6   padding:24px
Card Donut           ~470×auto   r:16   border:1px #E8E8E6   padding:24px
Card Atividades      ~650×auto   r:16   border:1px #E8E8E6   padding:24px
Donut SVG            144×144     stroke-width:14
Donut center text    dentro do SVG, centrado
Legend dot            8×8        r:50%
Activity dot          8×8        r:50%
Badge código          r:4        padding:2px 8px
Activity item         padding:12px, r:8 (hover bg)
```

---

## 6. Componentes a Criar

| Componente | Descrição | Reutilização |
|------------|-----------|--------------|
| `dashboard/MetricCard` | Card com label uppercase, valor grande, dot indicator | Dashboard |
| `dashboard/DonutChart` | SVG donut com segmentos, centro e legenda | Dashboard, relatórios |
| `dashboard/ActivityList` | Lista vertical com dot colorido, texto misto, timestamp | Dashboard |
| `dashboard/ActivityItem` | Item individual: dot + ator bold + descrição + badge + timestamp | ActivityList |

---

## 7. Diferença da Topbar (Dashboard vs outras telas)

Na topbar do Dashboard, o lado direito mostra:
```
"Administrador ECF" (12px 700 #111111)
"Acesso Nível 5" (10px 400 #888888)
Avatar "AE" (40×40, r:50%, fill #E8E8E6, border 2px #E8E8E6, text #555555 13px 700)
```

Nas demais telas mostra:
```
"Empresa: A1 Engenharia" (12px 500 #555555)
```

---

## 8. Checklist

- [ ] AppShell: Topbar branca, logo azul, sidebar 240px
- [ ] Sidebar: "Dashboard" ativo com fundo `#E3F2FD`
- [ ] Breadcrumb: "Início › Dashboard"
- [ ] Topbar direita: "Administrador ECF" + "Acesso Nível 5" + avatar
- [ ] Título: "Dashboard" 28px extrabold
- [ ] 4 metric cards em grid horizontal
- [ ] Card 1: "PROCESSOS ATIVOS" = 12 (preto)
- [ ] Card 2: "APROVAÇÕES PENDENTES" = 08 (amber `#E67E22`)
- [ ] Card 3: "USUÁRIOS ATIVOS" = 47 (preto)
- [ ] Card 4: "AGENTES MCP" = 05 (verde `#27AE60`)
- [ ] Cada card tem dot colorido + texto indicador
- [ ] Donut chart com 4 segmentos + "72 TOTAL" no centro
- [ ] Legenda do donut com dots + labels + percentuais
- [ ] Lista "Atividades Recentes" com 4 itens
- [ ] "VER TUDO" azul no canto superior direito
- [ ] Badges de código (PR-0042, MOD-018, MCP-003)
- [ ] MCP-003 com badge vermelho (falha)
- [ ] Cards com radius 16px e borda `#E8E8E6`
