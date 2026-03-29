# SPEC-THEME-001 — Tema Visual do Projeto ECF (Grupo A1)

- **id:** SPEC-THEME-001
- **version:** 1.0.0
- **status:** READY
- **data_ultima_revisao:** 2026-03-29
- **owner:** produto + UX
- **scope:** projeto ECF — valores visuais específicos do Grupo A1

---

## 1. Objetivo

Este documento consolida **todos os valores visuais específicos** do projeto ECF / Grupo A1. É a fonte de verdade para cores, fontes, marca, layout do shell e status badges.

**Hierarquia de prevalência:**
1. Spec de tela (`NN-nome-spec.md`) — valores específicos da tela
2. **SPEC-THEME-001** (este documento) — valores do projeto
3. DOC-UX-013 — regras estruturais do framework (fallback)

---

## 2. Paleta de Cores

### 2.1 Cores Primárias

| Token Semântico | Hex | Uso |
|-----------------|-----|-----|
| AZUL PRIMÁRIO | `#2E86C1` | Logo, botões, links, sidebar ativo, avatar, paginação |
| AZUL HOVER | `#256FA0` | Hover de botões e links |
| AZUL CLARO | `#E3F2FD` | Sidebar item ativo bg, seleções |
| LARANJA (accent) | `#F58C32` | **Exclusivo** para logo A1 e branding do login |
| LARANJA GRAD | `#F5A04E` | Gradiente do logo (apenas login) |

### 2.2 Fundos e Superfícies

| Token | Hex | Uso |
|-------|-----|-----|
| FUNDO PÁGINA | `#F5F5F3` | ContentArea bg |
| BRANCO | `#FFFFFF` | Topbar, sidebar, cards, inputs, tabela |
| BORDA | `#E8E8E6` | Todas as bordas |
| BORDA LIGHT | `#F0F0EE` | Divisores internos tabela |

### 2.3 Hierarquia de Texto

| Nível | Hex | Uso |
|-------|-----|-----|
| primary | `#111111` | Títulos, nomes, "Grupo A1" |
| secondary | `#333333` | Labels, textos de dropdown |
| tertiary | `#555555` | Células de tabela, checkbox |
| auxiliary | `#888888` | Descrições, breadcrumb inativo, hints |
| hint | `#AAAAAA` | Categorias sidebar, "OU CONTINUE COM" |
| placeholder | `#CCCCCC` | Placeholders, ícones inputs |

### 2.4 Cores Semânticas

| Uso | Hex |
|-----|-----|
| ERRO / notificação dot | `#E74C3C` |
| SUCESSO | `#27AE60` |
| SUCESSO BG | `#E8F8EF` |
| WARNING (card amber) | `#E67E22` |

### 2.5 Status Badges

| Status | Text | Background | Border |
|--------|------|------------|--------|
| ATIVO | `#1E7A42` | `#E8F8EF` | `#B5E8C9` |
| INATIVO | `#6C757D` | `#F4F4F2` | `#E0E0DE` |
| BLOQUEADO | `#C0392B` | `#FFEBEE` | `#F5C6CB` |
| PENDENTE | `#B8860B` | `#FFF3E0` | `#FFE0B2` |

---

## 3. Tipografia

### 3.1 Fonte Principal

| Propriedade | Valor |
|-------------|-------|
| Família | `Plus Jakarta Sans` |
| Fallback | `system-ui, sans-serif` |
| Código / monospace | `JetBrains Mono` |

### 3.2 Escala Tipográfica

| Nível | Weight | Size | Line-height | Letter-spacing | Uso |
|-------|--------|------|-------------|----------------|-----|
| Display | 800 | 28px | 34px | -1px | Títulos de página ("Usuários", "Dashboard") |
| Title | 700 | 20px | 24px | — | Títulos de seção |
| Subtitle | 700 | 14px | 20px | — | Subtítulos de cards |
| Body | 400 | 13px | 16px | — | Texto padrão, células de tabela |
| Label | 600/700 | 11px | 14px | +0.5px, uppercase | Cabeçalhos de tabela, labels de form |
| Section | 700 | 9px | 12px | +1.4px, uppercase | Headers de sidebar |
| Caption | 400 | 11px | 14px | — | Datas, metadados |
| Micro | 400 | 10px | 12px | — | "PORTAL INTERNO", tenant info |
| Badge | 700 | 10px | — | uppercase | Status badges |

### 3.3 Topbar Tipografia

| Elemento | Weight | Size | Color |
|----------|--------|------|-------|
| "Grupo A1" | 800 | 14px | `#111111` |
| "PORTAL INTERNO" | 600 | 10px | `#888888` (uppercase, ls:+1.2px) |
| Breadcrumb inativo | 400 | 13px | `#888888` |
| Breadcrumb ativo | 700 | 13px | `#111111` |
| "Empresa: A1..." | 500 | 12px | `#555555` |

### 3.4 Sidebar Tipografia

| Elemento | Weight | Size | Color |
|----------|--------|------|-------|
| Categoria | 700 | 9px | `#AAAAAA` (uppercase, ls:+1.4px) |
| Menu inativo | 500 | 13px | `#888888` |
| Menu ativo | 700 | 13px | `#2E86C1` |
| User nome (footer) | 700 | 12px | `#111111` |
| User email (footer) | 400 | 11px | `#888888` |

---

## 4. Layout Shell

### 4.1 Sidebar

| Propriedade | Valor |
|-------------|-------|
| Largura | **240px fixa** (não colapsável) |
| Fundo | `#FFFFFF` |
| Borda | `border-right: 1px solid #E8E8E6` |
| Padding | `py-4 px-3` |
| Labels | Sempre visíveis |
| Categorias | Uppercase, separador visual entre grupos |
| Item ativo | bg `#E3F2FD`, text `#2E86C1`, font-weight 700 |
| Item inativo | text `#888888`, hover bg `#F5F5F3` |
| Footer | Avatar circular bg `#2E86C1` + nome + email |

### 4.2 Topbar

| Propriedade | Valor |
|-------------|-------|
| Altura | **64px** |
| Fundo | `#FFFFFF` |
| Borda | `border-bottom: 1px solid #E8E8E6` |
| Logo | Ícone A1 azul `#2E86C1`, radius 10px |
| "Grupo A1" + "PORTAL INTERNO" | À direita do logo |
| Breadcrumb | Centro, separador "/" |
| Zona direita | Sino com badge vermelho, "Empresa: ..." , avatar |

### 4.3 Content Area

| Propriedade | Valor |
|-------------|-------|
| Fundo | `#F5F5F3` |
| Padding | `32px` |

---

## 5. Marca (Grupo A1)

| Elemento | Valor |
|----------|-------|
| Logo | Ícone quadrado azul `#2E86C1` com "A1" branco bold italic |
| Logo radius | `10px` |
| Texto | "Grupo A1" (800, 14px, `#111111`) |
| Subtexto | "PORTAL INTERNO" (600, 10px, `#888888`, uppercase) |
| Login branding | Painel esquerdo escuro `#111111` com gradiente, tagline italic, logo laranja |

---

## 6. Componentes de UI — Valores do Projeto

### 6.1 Botões

| Tipo | Background | Text | Border | Radius | Height |
|------|-----------|------|--------|--------|--------|
| Primário | `#2E86C1` | `#FFFFFF` | — | `8px` | `36px` |
| Primário hover | `#256FA0` | `#FFFFFF` | — | — | — |
| Outline | `#FFFFFF` | `#333333` | `1px solid #E8E8E6` | `8px` | `36px` |
| Ghost | transparent | `#2E86C1` | — | `8px` | — |
| Destructive | `#E74C3C` | `#FFFFFF` | — | `8px` | — |

### 6.2 Inputs

| Propriedade | Valor |
|-------------|-------|
| Fundo | `#FFFFFF` |
| Borda | `1px solid #E8E8E6` |
| Radius | `8px` |
| Height | `40px` |
| Placeholder color | `#CCCCCC` |
| Focus border | `#2E86C1` |
| Focus ring | `0 0 0 3px rgba(46,134,193,0.15)` |

### 6.3 Tabela

| Propriedade | Valor |
|-------------|-------|
| Header bg | `#FFFFFF` |
| Header text | `#888888` (700, 11px, uppercase, ls:+0.5px) |
| Row bg | `#FFFFFF` |
| Row border | `1px solid #F0F0EE` |
| Row hover | `#F9F9F7` |
| Cell text | `#555555` (400, 13px) |
| Link text | `#2E86C1` (600, 13px) |

### 6.4 Cards

| Propriedade | Valor |
|-------------|-------|
| Fundo | `#FFFFFF` |
| Borda | `1px solid #E8E8E6` |
| Radius | `12px` |
| Shadow | none (flat design) |

---

## 7. Mapeamento para Tokens CSS (index.css)

Os valores acima devem ser mapeados nos seguintes tokens em `apps/web/src/index.css`:

```css
@theme {
  /* Projeto ECF — valores de SPEC-THEME-001 */
  --color-primary-600: #2E86C1;     /* era #2563eb */
  --color-primary-700: #256FA0;     /* hover */
  --color-primary-50: #E3F2FD;      /* active bg */
  --font-display: 'Plus Jakarta Sans', system-ui, sans-serif;
  --color-bg-page: #F5F5F3;         /* era #f8fafc */
  --color-a1-border: #E8E8E6;       /* era #e2e8f0 */

  /* Text Hierarchy */
  --color-a1-text-primary: #111111;
  --color-a1-text-secondary: #333333;
  --color-a1-text-tertiary: #555555;
  --color-a1-text-auxiliary: #888888;
  --color-a1-text-hint: #AAAAAA;
  --color-a1-text-placeholder: #CCCCCC;

  /* Layout */
  --sidebar-expanded: 15rem;         /* 240px fixo */
  --topbar-height: 4rem;             /* 64px */
}
```

---

## CHANGELOG

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0.0 | 2026-03-29 | Criação inicial — consolidação de valores visuais de todas as specs de tela |
