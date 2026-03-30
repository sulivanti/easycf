# DOC-UX-011-M05 — AppShell Layout Unificado (Stitch Modelagem)

- **amendment_id:** DOC-UX-011-M05
- **parent_doc:** DOC-UX-011
- **type:** ALTER
- **status:** MERGED
- **data:** 2026-03-27
- **autor:** produto + UX
- **motivacao:** Alinhar o AppShell ao stitch `modelagem_de_processos_corrigido` (referência canônica). Topbar passa de dark (#111) para branca com border-b. Sidebar passa de 220px para 240px fixa (SPEC-THEME-001 §4.1). Accent interativo passa de laranja para azul.

---

## 1. Alterações na §2.2 (Identidade Visual A1)

### 1.1 Topbar (Header)

| Propriedade | Valor Anterior | Novo Valor |
|-------------|---------------|------------|
| Altura | `h-13` (52px) | `h-16` (64px) |
| Fundo | `bg-a1-dark` (#111111) | `bg-white` (#FFFFFF) |
| Borda | nenhuma | `border-b border-neutral-200` |
| Layout | 3 zonas (logo w-220 / breadcrumb / profile) | 3 zonas (logo w-16 / breadcrumb / profile) |

**Zona esquerda (logo):** Largura fixa w-16 (64px, alinhada com sidebar colapsada). Logo: ícone 26x26px rounded-[5px] `bg-primary-600` com SVG "A1" (branco). Sem texto "Grupo A1" na topbar (movido para sidebar expandida).

**Zona central (breadcrumb):** Separador "/" em `text-neutral-400`, segmentos inativos `text-neutral-500`, segmento ativo `text-neutral-800 font-semibold`.

**Zona direita (profile):** Nome `text-neutral-800` font-medium, subtexto tenant `text-neutral-500`, avatar circle 30px `bg-primary-600`.

### 1.2 Sidebar

| Propriedade | Valor Anterior | Novo Valor |
|-------------|---------------|------------|
| Largura | `w-[220px]` fixa | `w-60` (240px) fixa (SPEC-THEME-001 §4.1) |
| Fundo | `bg-white` | `bg-white` (mantido) |
| Border | `border-r border-a1-border` | `border-r border-neutral-200` |

**Sidebar 240px fixa:** Exibe ícones + labels + section headers. Sem comportamento collapsible (Penpot confirma sidebar fixa em todas as telas).

**Item ativo:** `bg-primary-50 text-primary-600 font-semibold` (sem borda lateral laranja). Ícone `stroke-primary-600`.

**Item inativo:** `text-neutral-500 hover:bg-primary-50`. Ícone `stroke-neutral-400`.

**Badges:** `rounded-full bg-primary-600 text-white text-[9px]`.

### 1.3 Content Area

| Propriedade | Valor Anterior | Novo Valor |
|-------------|---------------|------------|
| Fundo | `bg-a1-bg` (#F5F5F3) | `bg-neutral-50` (#f8fafc) |

### 1.4 Skeleton States

- SidebarSkeleton: `w-16` bg-white border-r border-neutral-200
- HeaderSkeleton: `h-16` bg-white border-b border-neutral-200
- Skeleton bars: `bg-neutral-200` com animate-pulse

---

## 2. Impacto

- `AppShell.tsx`: Reestruturação completa de Topbar, Sidebar e Skeletons.
- `ProfileWidget.tsx`: variant muda de `dark` para `light` (topbar agora é branca).
- `Breadcrumb`: Cores migram de white/dark para slate tones.
