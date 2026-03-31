---
title: Guard de Edição Inline — Org Units
version: 1.0
date_created: 2026-03-30
last_updated: 2026-03-30
owner: Marcos Sulivan
tags: bugfix, ux, org-units, inline-edit, guard
---

# Introduction

Na tela de Unidades Organizacionais (`/org-units`), ao iniciar a edição inline de uma entidade e clicar em outra ação (selecionar outra entidade na árvore, criar nova subdivisão, desativar, etc.), as alterações em curso são descartadas silenciosamente. Esta especificação define o comportamento de guard de edição: um diálogo de confirmação que impede a perda acidental de dados não salvos.

## 1. Purpose & Scope

**Propósito:** Implementar um guard de navegação intra-página que intercepte qualquer ação que causaria a perda do formulário de edição inline ativo no `DetailPanel` da tela `OrgTreePage`.

**Escopo:**
- Aplica-se apenas à tela `/org-units` (componente `OrgTreePage` + `DetailPanel`)
- Intercepta ações de seleção de outra entidade, abertura de formulário de criação, e ações de contexto da árvore enquanto `isEditing === true`
- Utiliza o componente shared `ConfirmationModal` já existente no projeto

**Público:** Desenvolvedores frontend do módulo MOD-003 (Estrutura Organizacional).

**Premissas:**
- O `ConfirmationModal` (`apps/web/src/shared/ui/confirmation-modal.tsx`) já está disponível e é usado no `OrgTreePage` para outras confirmações
- A edição inline é controlada pelo estado local `isEditing` no `DetailPanel`

## 2. Definitions

| Termo | Definição |
|-------|-----------|
| **Guard de edição** | Mecanismo que intercepta ações destrutivas para o formulário e exige confirmação do usuário |
| **Edição inline** | Modo de edição in-place no `DetailPanel` onde campos `ReadOnlyField` se transformam em inputs editáveis |
| **Ação destrutiva** | Qualquer ação que resultaria no descarte do formulário de edição: selecionar outra entidade, abrir painel de criação, editar outra entidade via menu de contexto |
| **DetailPanel** | Componente do painel direito do split-panel que exibe detalhes e permite edição inline |

## 3. Requirements, Constraints & Guidelines

### Requisitos Funcionais

- **REQ-001**: Ao clicar em outra entidade na árvore enquanto `isEditing === true` e o formulário possuir alterações não salvas, o sistema DEVE exibir um diálogo de confirmação com as opções "Cancelar Edição" e "Continuar Editando"
- **REQ-002**: Se o usuário confirmar "Cancelar Edição", o sistema DEVE descartar as alterações, sair do modo de edição (`isEditing = false`) e navegar para a entidade selecionada
- **REQ-003**: Se o usuário escolher "Continuar Editando", o sistema DEVE manter o modo de edição ativo na entidade atual, sem alterar `selectedId`
- **REQ-004**: O guard DEVE interceptar também a abertura do formulário de criação ("Nova Unidade" / "Nova Subdivisão") enquanto estiver editando
- **REQ-005**: O guard DEVE interceptar a ação "Editar" de outra entidade via menu de contexto da árvore
- **REQ-006**: Se o formulário NÃO possui alterações (form === detailToForm(detail)), as ações devem prosseguir sem diálogo — o guard só dispara quando há dirty state
- **REQ-007**: O estado `isEditing` DEVE ser elevado (lifted) do `DetailPanel` para o `OrgTreePage` para que o guard possa ser verificado antes de alterar `selectedId`

### Restrições

- **CON-001**: Utilizar exclusivamente o `ConfirmationModal` shared já existente — NÃO criar novo componente de modal
- **CON-002**: O diálogo NÃO deve usar a variant `destructive` — deve usar variant `warning` ou `default` por se tratar de confirmação de descarte, não de exclusão de dados
- **CON-003**: O guard NÃO se aplica a ações que não causam perda do formulário (ex: scroll na árvore, toggle de inativos, busca)

### Guidelines

- **GUD-001**: A comparação de dirty state deve usar deep equality simples entre `form` e `detailToForm(detail)` — sem bibliotecas extras
- **GUD-002**: A ação pendente (ex: selecionar entidade B) deve ser armazenada em state temporário e executada somente após confirmação

## 4. Interfaces & Data Contracts

### Estado do Guard (OrgTreePage)

```typescript
// Novo state no OrgTreePage para controlar o guard
interface EditGuardState {
  open: boolean;
  pendingAction: (() => void) | null;
}
```

### Props alteradas no DetailPanel

```typescript
export interface DetailPanelProps {
  detail: OrgUnitDetailVM | null;
  isLoading: boolean;
  userScopes: readonly string[];
  requestEdit?: boolean;
  onEditHandled?: () => void;
  onCreateChild: (parentId: string) => void;
  // NOVOS — para elevar estado de edição ao parent
  isEditing: boolean;
  onEditingChange: (editing: boolean) => void;
  isDirty: boolean; // form !== detailToForm(detail)
}
```

### Textos do Diálogo (COPY)

```typescript
// Adicionar ao objeto COPY em org-units.types.ts
modal: {
  editGuardTitle: 'Edição em andamento',
  editGuardBody: 'Você possui alterações não salvas. Deseja cancelar a edição?',
  editGuardCancel: 'Continuar Editando',
  editGuardConfirm: 'Cancelar Edição',
}
```

### Fluxo de Interceptação

```text
Usuário clica em entidade B (ou "Nova Unidade", ou "Editar" via contexto)
  └─ OrgTreePage verifica: isEditing && isDirty?
       ├─ NÃO → executa ação normalmente
       └─ SIM → armazena ação em pendingAction, abre EditGuardModal
            ├─ "Cancelar Edição" → onEditingChange(false), executa pendingAction, limpa guard
            └─ "Continuar Editando" → limpa guard, NÃO executa ação
```

## 5. Acceptance Criteria

- **AC-001**: Given o usuário está editando a entidade A com alterações, When clica na entidade B na árvore, Then um diálogo aparece com "Cancelar Edição" e "Continuar Editando"
- **AC-002**: Given o diálogo está aberto, When o usuário clica "Cancelar Edição", Then o modo de edição é desativado, as alterações são descartadas, e a entidade B é selecionada
- **AC-003**: Given o diálogo está aberto, When o usuário clica "Continuar Editando", Then o diálogo fecha e o usuário permanece editando a entidade A
- **AC-004**: Given o usuário está editando sem alterações (form limpo), When clica na entidade B, Then a entidade B é selecionada diretamente sem diálogo
- **AC-005**: Given o usuário está editando a entidade A com alterações, When clica em "Nova Unidade", Then o diálogo de guard aparece antes de abrir o formulário de criação
- **AC-006**: Given o usuário está editando a entidade A com alterações, When clica "Editar" no menu de contexto da entidade C, Then o diálogo de guard aparece antes de iniciar edição da entidade C
- **AC-007**: Given o usuário NÃO está editando, When realiza qualquer ação na árvore, Then nenhum diálogo é exibido

## 6. Test Automation Strategy

- **Test Levels**: Unitário (lógica isDirty) + E2E (fluxo completo com Playwright)
- **Frameworks**: Vitest para unitários, Playwright para E2E
- **Unitário — isDirty**:
  - Testar que `detailToForm(detail)` comparado com form inalterado retorna `false`
  - Testar que qualquer campo alterado retorna `true`
- **E2E — Guard flow**:
  - Editar entidade A → alterar campo → clicar entidade B → verificar modal → "Cancelar Edição" → verificar entidade B selecionada
  - Editar entidade A → alterar campo → clicar entidade B → verificar modal → "Continuar Editando" → verificar entidade A ainda em edição
  - Editar entidade A → sem alterar → clicar entidade B → verificar navegação direta sem modal

## 7. Rationale & Context

**Problema atual:** O `handleSelect` no `OrgTreePage` (linha 99) altera `selectedId` incondicionalmente. Quando `selectedId` muda, o `DetailPanel` recebe novo `detail` e o `isEditing` local é implicitamente resetado, descartando silenciosamente qualquer formulário em edição.

**Por que elevar `isEditing`:** O guard precisa ser verificado no `OrgTreePage` (que controla `selectedId`), mas `isEditing` é estado local do `DetailPanel`. Elevar o estado permite que o parent intercepte a navegação antes de alterar `selectedId`.

**Por que comparar dirty state:** Exibir o diálogo mesmo quando o formulário não foi alterado seria irritante para o usuário. O guard só deve disparar quando há risco real de perda de dados.

## 8. Dependencies & External Integrations

### Infrastructure Dependencies

- **INF-001**: `ConfirmationModal` (`apps/web/src/shared/ui/confirmation-modal.tsx`) — componente shared já existente

### Technology Platform Dependencies

- **PLT-001**: React 19 — `useState`, `useCallback` para state management do guard

## 9. Examples & Edge Cases

### Edge Case 1: Edição via menu de contexto durante edição ativa

```text
1. Usuário edita entidade A (via botão "Editar Dados")
2. Altera campo "Nome"
3. Clica com botão direito na entidade C → "Editar"
4. Guard intercepta: "Edição em andamento — Cancelar Edição / Continuar Editando"
5a. "Cancelar Edição" → sai do edit de A, seleciona C, inicia edit de C
5b. "Continuar Editando" → permanece editando A
```

### Edge Case 2: Mutation em andamento

```text
1. Usuário clica "Salvar Alterações" (mutation pending)
2. Enquanto salva, clica na entidade B
3. Guard NÃO deve interceptar durante mutation pending — a mutation vai completar e o isEditing será resetado automaticamente
4. Alternativa: desabilitar cliques na árvore durante mutation
```

### Edge Case 3: Criar subdivisão da mesma entidade

```text
1. Usuário edita entidade A
2. Clica "Nova Subdivisão" (que chama onCreateChild com parentId = A.id)
3. Guard intercepta pois a abertura do FormPanel descartaria a edição
```

## 10. Validation Criteria

1. O diálogo de guard aparece APENAS quando `isEditing && isDirty`
2. "Cancelar Edição" executa a ação pendente corretamente (selecionar outra entidade / abrir criação / editar outra)
3. "Continuar Editando" preserva 100% do estado do formulário
4. Ações que não causam perda (scroll, busca, toggle inativos) NÃO disparam guard
5. Após cancelar edição via guard, o `DetailPanel` volta ao modo visualização limpo

## 11. Related Specifications / Further Reading

- `docs/04_modules/mod-003-estrutura-organizacional/mod-003-estrutura-organizacional.md` — Manifesto MOD-003
- `apps/web/src/modules/org-units/components/DetailPanel.tsx` — Componente de edição inline
- `apps/web/src/modules/org-units/pages/OrgTreePage.tsx` — Página principal com split-panel
- `apps/web/src/shared/ui/confirmation-modal.tsx` — Modal de confirmação shared

---

## Appendix A: Plano de Execução

### Arquivos Afetados

| # | Arquivo | Tipo de Alteração |
|---|---------|-------------------|
| 1 | `apps/web/src/modules/org-units/types/org-units.types.ts` | Adicionar textos COPY do guard |
| 2 | `apps/web/src/modules/org-units/components/DetailPanel.tsx` | Elevar `isEditing`/`isDirty` para props, remover state local |
| 3 | `apps/web/src/modules/org-units/pages/OrgTreePage.tsx` | Adicionar state `isEditing`/`isDirty`/`editGuard`, interceptar handlers |

### Steps

1. **Step 1 — COPY texts** (arquivo 1): Adicionar `editGuardTitle`, `editGuardBody`, `editGuardCancel`, `editGuardConfirm` ao objeto `COPY.modal`
2. **Step 2 — Elevar estado no DetailPanel** (arquivo 2): Substituir `useState(isEditing)` local por props `isEditing` + `onEditingChange`. Calcular `isDirty` via comparação `form` vs `detailToForm(detail)` e expor via prop callback. Manter `form` como state local.
3. **Step 3 — Guard no OrgTreePage** (arquivo 3):
   - Adicionar states: `isEditing`, `isDirty`, `editGuard: EditGuardState`
   - Criar helper `guardedAction(action: () => void)` que verifica `isEditing && isDirty` antes de executar
   - Envolver `handleSelect`, `handleOpenCreate`, `handleOpenEdit` com `guardedAction`
   - Adicionar `ConfirmationModal` para o guard com `onConfirm` que executa `pendingAction` e reseta editing
   - Passar `isEditing`/`onEditingChange`/`isDirty` como props ao `DetailPanel`

### Paralelização

- Step 1 pode ser feito em paralelo com Step 2
- Step 3 depende de Step 1 e Step 2
