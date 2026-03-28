> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Documento normativo em estado READY.
> - Para alterações, use a skill `create-amendment`.

# DOC-UX-014 — Page Layout Blueprints

- **id:** DOC-UX-014
- **estado_item:** READY
- **Versão:** 1.0.0
- **Data:** 2026-03-28
- **owner:** arquitetura
- **Depende de:** DOC-UX-010, DOC-UX-013

---

## §0 Objetivo

Define a composição obrigatória de componentes `@shared/ui/` por tipo de tela (`type` do screen manifest). Garante que AGN-COD-WEB nunca produza páginas bare-bones, aplicando blueprints com cobertura de estados (loading, empty, error) para cada tipo.

**Regra universal:** TODA página DEVE implementar:
- **Loading** → `Skeleton` (placeholder animado durante carregamento)
- **Empty** → `EmptyState` (ilustração + mensagem quando não há dados)
- **Error** → `Toast` com `correlationId` (RFC 9457) + `ErrorBoundary`

---

## §1 Blueprints por Tipo de Tela

### §1.1 `list` — Tabela Paginada + Filtros

| Campo | Valor |
|-------|-------|
| **required_components** | `PageHeader`, `SearchBar`, `FilterBar`, `Table`, `Pagination`, `EmptyState`, `Skeleton`, `ConfirmationModal` |
| **state_coverage** | loading → `Skeleton` (N linhas placeholder), empty → `EmptyState` (ilustração + "Nenhum registro encontrado"), error → `Toast` + `correlationId` |

**Regras específicas:**
- `PageHeader` DEVE incluir título, contagem de registros e botão de ação primária (se aplicável)
- `SearchBar` DEVE ter debounce ≥ 300ms e sincronizar com query param `?q=`
- `FilterBar` DEVE sincronizar filtros com query params da URL para deep link
- `Table` DEVE ter menu de ações por linha (dropdown ou ícones)
- `Pagination` DEVE ser cursor-based (append) ou offset-based conforme manifest
- `ConfirmationModal` obrigatório para ações destrutivas (delete, deactivate)

### §1.2 `form` — Formulário de Cadastro/Edição

| Campo | Valor |
|-------|-------|
| **required_components** | `PageHeader`, `FormField`, `Button` (submit + `isLoading`), `Skeleton` |
| **state_coverage** | loading → `Skeleton` (modo edição, enquanto carrega dados existentes), empty → N/A (formulários não têm estado vazio), error → inline por campo (422) + `Toast` (5xx) |

**Regras específicas:**
- `PageHeader` DEVE incluir título ("Novo X" ou "Editar X") e botão "Voltar"
- `Button` de submit DEVE entrar em estado `isLoading` durante requisição
- Erros 422 DEVEM ser mapeados inline por campo via `extensions.invalid_fields`
- Erros 409 (conflito/duplicidade) DEVEM ser inline no campo relevante
- Modo edição DEVE exibir `Skeleton` enquanto carrega dados existentes

### §1.3 `detail` — Visualização de Registro

| Campo | Valor |
|-------|-------|
| **required_components** | `PageHeader`, `StatusBadge`, `Skeleton` |
| **state_coverage** | loading → `Skeleton` (campos e metadados), empty → N/A (registro não encontrado → redirect), error → `Toast` + redirect para listagem se 404 |

**Regras específicas:**
- `PageHeader` DEVE incluir título com identificador do registro e ações (Editar, Excluir)
- `StatusBadge` DEVE refletir o estado atual do registro
- 404 → redirect para listagem com Toast "Registro não encontrado"

### §1.4 `dashboard` — Painel com Cards e Widgets

| Campo | Valor |
|-------|-------|
| **required_components** | `PageHeader`, `Skeleton` (per widget) |
| **state_coverage** | loading → `Skeleton` per card/widget, empty → `EmptyState` per card (mensagem contextual), error → `Toast` + `correlationId` |

**Regras específicas:**
- Cada widget/card DEVE ter `Skeleton` individual (loading independente)
- Cards sem dados DEVEM exibir `EmptyState` contextual, não sumir
- Grid responsivo: ≥ 3 colunas desktop, 2 tablet, 1 mobile
- Widgets com erro NÃO devem derrubar toda a página — isolar falhas

### §1.5 `config` — Editor de Configurações/Regras

| Campo | Valor |
|-------|-------|
| **required_components** | `PageHeader`, `FormField`, `Table`, `ConfirmationModal`, `Skeleton` |
| **state_coverage** | loading → `Skeleton` (formulários e tabelas), empty → `EmptyState` (se config não existe), error → `Toast` + `correlationId` |

**Regras específicas:**
- `ConfirmationModal` obrigatório para salvar alterações em configurações críticas
- Pode combinar `FormField` (configurações simples) e `Table` (regras/listas)
- `Skeleton` DEVE cobrir todos os campos e tabelas durante carregamento

### §1.6 `monitor` — Log Table + Status Badges

| Campo | Valor |
|-------|-------|
| **required_components** | `PageHeader`, `Table`, `StatusBadge`, `Pagination`, `Skeleton`, `EmptyState` |
| **state_coverage** | loading → `Skeleton` (tabela), empty → `EmptyState` ("Nenhum registro de log"), error → `Toast` + `correlationId` |

**Regras específicas:**
- `StatusBadge` DEVE usar cores semânticas (success/warning/error/info)
- Auto-refresh opcional com indicador visual de "atualizando"
- `Table` DEVE suportar ordenação por timestamp

### §1.7 `inbox` — Fila de Itens Pendentes

| Campo | Valor |
|-------|-------|
| **required_components** | `PageHeader` (com counter badge), `Table` ou cards, `Badge`, `Pagination`, `EmptyState`, `Skeleton` |
| **state_coverage** | loading → `Skeleton` (lista), empty → `EmptyState` ("Tudo em dia!" / "All caught up"), error → `Toast` + `correlationId` |

**Regras específicas:**
- `PageHeader` DEVE incluir badge com contagem de itens pendentes
- Estado vazio DEVE usar mensagem positiva ("Tudo em dia!")
- Items lidos vs não-lidos DEVEM ter diferenciação visual (bold/background)

---

## §2 Regra Universal de State Coverage

Independente do tipo de tela, TODA página gerada por AGN-COD-WEB DEVE:

1. **Loading:** Renderizar `Skeleton` (de `@shared/ui/skeleton`) durante carregamento inicial de dados. O Skeleton DEVE cobrir a área exata que será preenchida pelos dados.
2. **Empty:** Renderizar `EmptyState` (de `@shared/ui/empty-state`) quando a query retorna zero resultados. A mensagem DEVE ser contextual ao domínio.
3. **Error:** Renderizar `Toast` (via `sonner` de `@shared/ui/sonner`) com `correlationId` do RFC 9457 para erros de API. Usar `ErrorBoundary` para erros de renderização.
4. **ErrorBoundary:** Toda página DEVE ser envolvida por `ErrorBoundary` que captura erros React e exibe fallback amigável.

---

## §3 Mapeamento de Components para @shared/ui/

| Blueprint Component | Import `@shared/ui/` | Arquivo |
|--------------------|-----------------------|---------|
| PageHeader | `page-header` | `page-header.tsx` |
| SearchBar | `search-bar` | `search-bar.tsx` |
| FilterBar | `filter-bar` | `filter-bar.tsx` |
| Table | `table` | `table.tsx` |
| Pagination | `pagination` | `pagination.tsx` |
| EmptyState | `empty-state` | `empty-state.tsx` |
| Skeleton | `skeleton` | `skeleton.tsx` |
| ConfirmationModal | `confirmation-modal` | `confirmation-modal.tsx` |
| FormField | `form-field` | `form-field.tsx` |
| Button | `button` | `button.tsx` |
| Select | `select` | `select.tsx` |
| StatusBadge | `status-badge` | `status-badge.tsx` |
| Badge | `badge` | `badge.tsx` |
| Spinner | `spinner` | `spinner.tsx` |
| Toast (sonner) | `sonner` | `sonner.tsx` |
| Input | `input` | `input.tsx` |
| Dialog | `dialog` | `dialog.tsx` |
| Tag | `tag` | `tag.tsx` |

---

## §4 Como AGN-COD-WEB Deve Usar Este Documento

1. Ler o `type` do screen manifest
2. Consultar o blueprint correspondente neste documento (§1.x)
3. Garantir que **todos** os `required_components` do blueprint estão presentes no plano
4. Implementar **todos** os estados de `state_coverage` do blueprint
5. Se o manifest tem `shared_ui_components` → usar esses imports (mais específico)
6. Se não tem → usar os `required_components` do blueprint como fallback
7. Validar compliance na etapa 7.2 do codegen-agent

---

## Changelog

| Versão | Data | Autor | Descrição |
|--------|------|-------|-----------|
| 1.0.0 | 2026-03-28 | arquitetura | Criação inicial. Blueprints para 7 tipos de tela (list, form, detail, dashboard, config, monitor, inbox). |
