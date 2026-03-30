---
title: "Fix: Editor de Ciclo — Falha Silenciosa na Criação de Estágio via Double-Click"
version: 1.0
date_created: 2026-03-30
owner: Marcos Sulivan
tags: [bugfix, process-modeling, MOD-005, UX]
---

# Introduction

O editor visual de ciclos de processo (`/processos/ciclos/:id/editor`) exibe permanentemente a mensagem "Dê duplo clique para criar o primeiro estágio" mesmo após tentativas de criação. O duplo clique no canvas vazio não produz feedback visual quando falha, impossibilitando o diagnóstico pelo usuário.

## 1. Purpose & Scope

Corrigir a falha silenciosa no fluxo de criação do primeiro estágio no editor de ciclos. O problema afeta qualquer ciclo em status DRAFT quando o duplo clique é interceptado por guards sem feedback, ou quando a mutation de criação falha sem notificação.

**Escopo:**
- Hook `useCreateStageFromCanvas` — adicionar feedback para cada guard que bloqueia a ação
- Componente `FlowEditorPage` — exibir toast/mensagem de erro quando a mutation falha
- Garantir que o fluxo completo (double-click → macro-stage auto-criação → stage criação → re-render canvas) funciona end-to-end

**Audiência:** Desenvolvedores frontend MOD-005.

## 2. Definitions

| Termo | Definição |
|-------|-----------|
| **Canvas vazio** | Estado do editor quando `macro_stages.length === 0` ou todos os macro_stages têm `stages.length === 0` |
| **Guard** | Condição de curto-circuito no handler de double-click que aborta a execução silenciosamente |
| **Macro-stage auto-criação** | Criação automática da macro-etapa padrão "ETAPA-GERAL" quando nenhuma existe no ciclo |
| **isEmpty** | Variável derivada: `flow.macro_stages.length === 0 \|\| flow.macro_stages.every((ms) => ms.stages.length === 0)` |

## 3. Requirements, Constraints & Guidelines

### 3.1 Diagnóstico — Guards silenciosos (root cause primário)

O hook `useCreateStageFromCanvas` (linha 96-110) contém 4 guards que retornam sem feedback:

```typescript
if (readonly) return;                    // Guard 1: ciclo não é DRAFT
if (!canWriteCycle(userScopes)) return;  // Guard 2: sem scope process:cycle:write
if (mutation.isPending) return;          // Guard 3: mutation já em andamento
if (!flow) return;                       // Guard 4: dados do flow não carregados
```

**Nenhum desses guards emite toast, console.warn, ou altera estado visual.** Se o usuário não possui o scope `process:cycle:write`, o duplo clique é simplesmente ignorado.

### 3.2 Diagnóstico — Mutation sem onError (root cause secundário)

A mutation em `useCreateStageFromCanvas` (linha 62-93) não tem handler `onError`. Se o POST para `/admin/macro-stages` ou `/admin/stages` falhar (ex: 403, 409, 500), o spinner desaparece e o canvas volta ao estado vazio sem mensagem.

### 3.3 Requisitos de correção

- **REQ-001**: Quando o guard `readonly` bloqueia o double-click, o canvas vazio deve exibir mensagem contextual: "Ciclo publicado — use 'Nova versão' para editar." (já existe em `COPY.readonly_banner`). O cursor deve ser `default` em vez de `pointer`.
- **REQ-002**: Quando o guard `canWriteCycle` bloqueia, o canvas vazio deve exibir: "Você não tem permissão para editar este ciclo." via toast de erro.
- **REQ-003**: Quando a mutation falha (onError), exibir toast com a mensagem de erro do servidor ou fallback "Erro ao criar estágio. Tente novamente."
- **REQ-004**: Adicionar `console.warn` em cada guard para facilitar debugging em produção.
- **REQ-005**: O estado `isEmpty` no canvas vazio deve diferenciar visualmente entre "pode criar" (cursor pointer, instrução de double-click) e "não pode criar" (cursor default, mensagem explicativa do motivo).
- **REQ-006**: Após criação bem-sucedida do estágio, o `invalidateQueries` deve aguardar a refetch completar antes de considerar a operação finalizada, garantindo que o canvas re-renderize sem flash do estado vazio.

### 3.4 Constraints

- **CON-001**: Não alterar a lógica de guards — apenas adicionar feedback visual/auditivo
- **CON-002**: Manter compatibilidade com o sistema de toasts existente no Foundation (`useToast` ou equivalente)
- **CON-003**: Não quebrar o fluxo de criação quando os guards não bloqueiam (caminho feliz)

## 4. Interfaces & Data Contracts

### 4.1 Hook useCreateStageFromCanvas — novo retorno

```typescript
interface UseCreateStageFromCanvasResult {
  handleCanvasDoubleClick: (event: React.MouseEvent) => void;
  isPending: boolean;
  lastCreatedStageId: string | null;
  error: string | null;           // NOVO: mensagem de erro da última tentativa
  canCreate: boolean;             // NOVO: derivado de !readonly && canWriteCycle && !!flow
  blockReason: string | null;     // NOVO: razão pela qual canCreate=false
}
```

### 4.2 Novas entradas em COPY

```typescript
export const COPY = {
  // ...existentes...
  error_create_stage: 'Erro ao criar estágio. Tente novamente.',
  error_no_write_permission: 'Você não tem permissão para editar este ciclo.',
  empty_canvas_readonly: 'Ciclo publicado — somente leitura.',
  empty_canvas_no_permission: 'Sem permissão de edição neste ciclo.',
} as const;
```

## 5. Acceptance Criteria

- **AC-001**: Given um ciclo DRAFT com scope `process:cycle:write`, When o usuário dá duplo clique no canvas vazio, Then um estágio "Novo estágio" é criado e o canvas re-renderiza mostrando o nó do estágio.
- **AC-002**: Given um ciclo PUBLISHED, When o editor carrega, Then o canvas vazio mostra "Ciclo publicado — somente leitura." com cursor default (sem instrução de double-click).
- **AC-003**: Given um ciclo DRAFT sem scope `process:cycle:write`, When o editor carrega, Then o canvas vazio mostra "Sem permissão de edição neste ciclo." com cursor default.
- **AC-004**: Given um ciclo DRAFT com scope correto, When o double-click aciona a mutation e ela falha (ex: erro 500), Then um toast de erro é exibido com a mensagem do servidor.
- **AC-005**: Given um ciclo DRAFT com estágio já criado, When o endpoint `/flow` retorna macro_stages com stages preenchidos, Then o canvas exibe os nós do React Flow (isEmpty=false).
- **AC-006**: Given criação bem-sucedida, When o invalidateQueries completa, Then o canvas transiciona suavemente de "vazio" para "com nós" sem flash intermediário.

## 6. Test Automation Strategy

- **Unit tests** (`vitest`):
  - Testar `useCreateStageFromCanvas` com mock de cada guard: verificar que `canCreate` e `blockReason` refletem o estado correto
  - Testar que `onError` popula `error` no resultado do hook
- **Integration tests**:
  - Testar o fluxo completo com MSW: double-click → POST macro-stage → POST stage → GET flow atualizado → canvas re-render
  - Testar cenário de falha: mock de 403 no POST → toast de erro visível
- **Coverage**: funções modificadas devem ter ≥ 80% de cobertura

## 7. Rationale & Context

O editor de ciclos foi implementado na sprint MOD-005 com foco no caminho feliz (happy path). Os guards de segurança foram corretamente implementados mas sem feedback ao usuário, seguindo um padrão defensivo que prioriza segurança sobre UX. Com o sistema em produção, essa falha silenciosa causa confusão: o usuário vê a instrução "Dê duplo clique" mas nada acontece, sem indicação do motivo.

A URL reportada (`/processos/ciclos/42d724b7-f0b0-4619-9c4d-ede6dd101818/editor`) sugere que o ciclo existe no banco mas algum guard está bloqueando — provavelmente `canWriteCycle` ou `readonly`.

## 8. Dependencies & External Integrations

### Technology Platform Dependencies
- **PLT-001**: React Flow (reactflow) — Biblioteca de canvas utilizada para renderizar nós e edges
- **PLT-002**: TanStack React Query — Gerenciamento de cache e invalidação após mutations

### Internal Dependencies
- **INT-001**: MOD-000 Foundation — Sistema de toasts (`useToast`) para feedback de erro
- **INT-002**: MOD-005 Backend — Endpoints POST `/admin/macro-stages` e POST `/admin/stages` já existentes

## 9. Examples & Edge Cases

### Edge Case 1: Macro-stage existe mas stages foram todos deletados

```
API retorna: { macro_stages: [{ id: "...", stages: [] }] }
isEmpty = true (every ms.stages.length === 0)
→ Canvas mostra estado vazio corretamente
→ Double-click deve funcionar normalmente (macro-stage já existe, pula auto-criação)
```

### Edge Case 2: Race condition — duplo double-click rápido

```
Primeiro click inicia mutation (isPending=true)
Segundo click é bloqueado pelo guard mutation.isPending
→ Comportamento correto, sem necessidade de mudança
→ Spinner já é exibido durante isPending
```

### Edge Case 3: Sessão expirada durante double-click

```
POST /admin/macro-stages retorna 401
→ httpClient deve redirecionar para login (comportamento Foundation)
→ Se não redirecionar, onError deve capturar e mostrar toast genérico
```

## 10. Validation Criteria

1. O canvas vazio em ciclo DRAFT com permissões corretas permite criação de estágio via double-click
2. O canvas vazio em ciclo não-DRAFT mostra mensagem de readonly sem instrução de double-click
3. O canvas vazio sem permissão de escrita mostra mensagem de permissão sem instrução de double-click
4. Falhas na mutation são comunicadas via toast de erro
5. Não há regressão no caminho feliz de criação de estágios subsequentes (segundo, terceiro estágio, etc.)

## 11. Related Specifications / Further Reading

- `docs/04_modules/mod-005-modelagem-processos/mod-005-modelagem-processos.md` — Manifesto MOD-005
- `docs/04_modules/mod-005-modelagem-processos/requirements/ux/UX-005.md` — Requisitos UX do editor
- `docs/03_especificacoes/spec-cycle-editor-empty-canvas-first-stage.md` — Spec original do canvas vazio

---

## Appendix A: Plano de Execução

### Arquivos afetados

| # | Arquivo | Tipo de alteração |
|---|---------|-------------------|
| 1 | `apps/web/src/modules/process-modeling/hooks/use-create-stage-from-canvas.ts` | Adicionar `canCreate`, `blockReason`, `error`; handler `onError` na mutation; `console.warn` nos guards |
| 2 | `apps/web/src/modules/process-modeling/pages/FlowEditorPage.tsx` | Consumir novos campos do hook; diferenciar canvas vazio por motivo; integrar toast de erro |
| 3 | `apps/web/src/modules/process-modeling/types/process-modeling.types.ts` | Adicionar novas entradas COPY (`error_create_stage`, `error_no_write_permission`, etc.) |

### Steps

| Step | Descrição | Paralelizável com |
|------|-----------|--------------------|
| 1 | Adicionar novas constantes COPY em `process-modeling.types.ts` | — |
| 2 | Refatorar `useCreateStageFromCanvas` para expor `canCreate`, `blockReason`, `error` e adicionar `onError` + `console.warn` | Após step 1 |
| 3 | Atualizar `FlowEditorPage` para consumir os novos campos e diferenciar o estado do canvas vazio | Após step 2 |
| 4 | Integrar toast de erro no `FlowEditorPage` usando sistema de toasts do Foundation | Junto com step 3 |
| 5 | Testes unitários do hook refatorado | Após step 2 |
| 6 | Teste de integração do fluxo completo | Após step 3 |

### Paralelização

```
Step 1 ──→ Step 2 ──→ Step 3 + Step 4 (paralelo)
                  └──→ Step 5
                        └──→ Step 6
```
