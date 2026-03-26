> **ARQUIVO GERIDO POR AUTOMACAO.**
> - Emenda sobre documento normativo/requisito em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-UX-011-M04

- **Documento base:** [DOC-UX-011](../../DOC-UX-011__Application_Shell_e_Navegacao.md)
- **estado_item:** MERGED
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-26
- **owner:** produto + UX
- **Motivacao:** Redesign do AppShell para identidade visual A1 (Grupo A1). Topbar escura, sidebar branca com accent laranja, content area cinza claro. Extraido do export Paper (Ux-Paginas.md) que define o layout compartilhado por todas as 8 telas do sistema.
- **rastreia_para:** DOC-UX-013-M01, Ux-Paginas.md (Paper export)

---

## Detalhamento

### 2.1 Estrutura Obrigatoria — Visual A1

O Application Shell DEVE adotar a seguinte identidade visual A1:

#### Topbar (Header)

```
Altura: h-13 (52px)
Fundo: bg-a1-dark (#111111)
Layout: flex items-center, tres zonas (logo | breadcrumb | profile)
```

**Zona esquerda (logo):**
- Largura fixa: w-[220px] (alinhada com sidebar)
- Border-right: 1px solid #1E1E1E (sutil, dark-on-dark)
- Logo: icone quadrado 26x26px rounded-[5px] bg-a1-accent (#F58C32) com SVG "A1"
- Texto: "Grupo A1" (branco, bold, 13px) + "Portal Interno" (#444, 10px) empilhados

**Zona central (breadcrumb):**
- Flex grow, px-5
- Separador: "/" em #333
- Segmentos inativos: #555, text-xs
- Segmento ativo (ultimo): branco, font-semibold, text-xs

**Zona direita (profile):**
- Nome do usuario: branco, font-medium, text-xs
- Subtexto (tenant): #444, text-[10px]
- Avatar: circle 30x30px bg-a1-accent (#F58C32), iniciais em branco bold 11px

#### Sidebar

```
Largura: w-[220px]
Fundo: bg-white
Border: border-r border-a1-border (#E8E8E6)
Padding: py-4 px-2.5
Overflow: overflow-y-auto
```

**Section headers:**
- uppercase tracking-[1.4px] text-[9px]/3 font-bold text-a1-text-placeholder (#CCC)
- Margin: mb-1.25 px-2

**Items (inativos):**
- flex items-center rounded-md py-2 px-2.5 gap-2.25
- Texto: text-[13px]/4 text-a1-text-auxiliary (#888)
- Icones: stroke #BBB, 14x14px, strokeWidth 1.5

**Item ativo:**
- bg-a1-active-bg (#FFF5EC)
- border-left: 2.5px solid a1-accent (#F58C32)
- Texto: text-a1-accent (#F58C32) font-bold text-[13px]/4
- Icone: stroke #F58C32

**Badges (contadores):**
- rounded-full bg-a1-dark (#111) text-white text-[9px] px-1.5

**Separador entre secoes:**
- h-px bg-[#F0F0EE] mx-0 mt-1 mb-3.5

**Profile widget (bottom sidebar — opcional):**
- mt-auto, avatar 28px bg-a1-accent com iniciais
- Nome: text-a1-text-primary (#111) font-semibold text-xs
- Tenant: text-a1-text-hint (#AAA) text-[10px]

#### Content Area

```
Fundo: bg-a1-bg (#F5F5F3)
Padding: mantido (p-6)
Overflow: overflow-auto
```

#### Page Header (dentro do content, por pagina)

```
Fundo: bg-white
Border: border-b border-a1-border (#E8E8E6)
Padding: py-4.5 px-6
Layout: flex items-center justify-between
Titulo: font-extrabold text-lg text-a1-text-primary letter-spacing-[-0.4px]
Subtitulo: text-[11px] text-a1-text-hint (#AAA)
```

### Skeleton States

Os skeletons de loading DEVEM adotar as cores A1:
- SidebarSkeleton: w-[220px] bg-white border-r border-a1-border
- HeaderSkeleton: h-13 bg-a1-dark
- Skeleton bars: bg-a1-border (#E8E8E6) com animate-pulse

---

## Impacto nos Pilares

- **Pilares afetados:** UX (DOC-UX-013 — tokens A1 ja cobertos por DOC-UX-013-M01)
- **Acao requerida:** DOC-UX-013-M01 deve ser merged antes ou junto com este amendment para garantir que os tokens referenciados existam.
- **Codigo:** `AppShell.tsx`, `sidebar-config.ts`, `ProfileWidget.tsx`, `index.css` devem ser atualizados apos merge de ambos amendments.

---

## Resolucao do Merge

> **Merged por:** merge-amendment em 2026-03-26
> **Versao base apos merge:** 1.5.0
> **Alteracoes aplicadas:** Nova §2.2 Identidade Visual A1 (topbar, sidebar, content area, skeleton states)
