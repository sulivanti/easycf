---
title: "Criação do Primeiro Estágio via Duplo Clique no Canvas Vazio"
version: 1.0
date_created: 2026-03-30
last_updated: 2026-03-30
owner: Marcos Sulivan
tags: [app, ux, process-modeling, MOD-005]
---

# Introduction

Quando o analista acessa o editor visual de fluxo (`/processos/ciclos/:id/editor`) de um ciclo DRAFT recém-criado, o canvas exibe a mensagem "Dê duplo clique para criar o primeiro estágio" (`COPY.empty_canvas`). Porém, **não existe handler de duplo clique no canvas vazio** que realize essa criação. Além disso, criar um estágio requer que uma macroetapa já exista (`POST /admin/macro-stages/:mid/stages`), e ciclos recém-criados não possuem macroetapas.

Esta spec define o fluxo completo de criação do primeiro estágio a partir do canvas vazio, incluindo a criação automática de uma macroetapa padrão quando necessário.

## 1. Purpose & Scope

**Propósito:** Implementar a interação de duplo clique no canvas vazio (e no canvas com nós existentes) para criar estágios inline, cumprindo a promessa UX já declarada em `COPY.empty_canvas` e no manifest UX-PROC-001 (`create_stage_from_canvas`).

**Escopo:**
- Handler `onDoubleClick` no ReactFlow canvas (`FlowEditorPage.tsx`)
- Criação automática de macroetapa padrão se nenhuma existir ("Etapa Geral")
- Criação do estágio na posição do clique com valores padrão
- Refetch do flow após criação
- Abertura automática do painel de configuração (UX-PROC-002) para o estágio criado

**Público:** Desenvolvedores frontend e backend do ECF.

**Premissas:**
- Os endpoints `POST /admin/cycles/:cid/macro-stages` e `POST /admin/macro-stages/:mid/stages` já estão implementados e funcionais
- O ciclo está em status DRAFT (canvas vazio não ocorre em PUBLISHED/DEPRECATED)
- O usuário possui scope `process:cycle:write`

## 2. Definitions

| Termo | Definição |
|---|---|
| **Canvas vazio** | Estado `isEmpty` do FlowEditorPage: `macro_stages.length === 0` ou todas as macroetapas sem estágios |
| **Macroetapa padrão** | Macroetapa auto-criada com código `ETAPA-GERAL` e nome `Etapa Geral` quando nenhuma existe no ciclo |
| **Estágio inline** | Estágio criado diretamente no canvas com nome editável, sem modal intermediário |
| **Posição do clique** | Coordenadas `(x, y)` do evento de mouse no espaço do ReactFlow canvas, convertidas via `screenToFlowPosition` |

## 3. Requirements, Constraints & Guidelines

### Requisitos Funcionais

- **REQ-001**: O `FlowEditorPage` DEVE registrar um handler `onDoubleClick` no componente `<ReactFlow>` que crie um estágio na posição do clique.
- **REQ-002**: Se o ciclo não possui macroetapas (`macro_stages.length === 0`), o handler DEVE primeiro criar uma macroetapa padrão (`codigo: "ETAPA-GERAL"`, `nome: "Etapa Geral"`, `ordem: 1`) via `POST /admin/cycles/:cid/macro-stages` e então criar o estágio nessa macroetapa.
- **REQ-003**: O estágio criado DEVE ter valores padrão: `codigo: "EST-{sequencial}"` (ex: `EST-001`), `nome: "Novo estágio"`, `ordem: totalStages + 1`, `canvas_x` e `canvas_y` da posição do clique.
- **REQ-004**: Se o canvas está vazio (nenhum estágio), o primeiro estágio criado DEVE ter `is_initial: true`.
- **REQ-005**: Após criação bem-sucedida, o hook `useFlow` DEVE ser invalidado/refetchado para renderizar o novo nó no canvas.
- **REQ-006**: Após o refetch, o painel de configuração (StageConfigPanel / UX-PROC-002) DEVE abrir automaticamente para o estágio recém-criado, permitindo ao usuário editar nome, descrição e flags.
- **REQ-007**: O handler de duplo clique DEVE ser desabilitado quando `readonly === true` (ciclo PUBLISHED ou DEPRECATED).
- **REQ-008**: O handler de duplo clique em canvas NÃO DEVE disparar quando o duplo clique ocorre sobre um nó existente (evitar conflito com `StageNode.onDoubleClick`).

### Requisitos de UX

- **UXR-001**: A mensagem `COPY.empty_canvas` DEVE continuar sendo exibida no estado vazio, mas agora com um ícone de cursor + "duplo clique" para reforçar a affordance.
- **UXR-002**: Durante a criação (chamada API em andamento), o canvas DEVE exibir um indicador visual (nó fantasma ou spinner) na posição do clique para dar feedback imediato.
- **UXR-003**: Em caso de erro na criação, DEVE exibir toast com a mensagem de erro incluindo `correlation_id`.

### Restrições

- **CON-001**: O handler NÃO DEVE criar macroetapas duplicadas — se já existe pelo menos uma, o estágio deve ser criado na primeira macroetapa existente (menor `ordem`).
- **CON-002**: A criação DEVE respeitar o scope `process:cycle:write`. Se o usuário não possui o scope, o duplo clique no canvas não deve ter efeito.
- **CON-003**: NÃO deve ser possível criar estágios em ciclo PUBLISHED ou DEPRECATED (guard `readonly`).

### Guidelines

- **GUD-001**: Usar `reactFlowInstance.screenToFlowPosition()` para converter coordenadas do mouse para coordenadas do canvas.
- **GUD-002**: Gerar código sequencial do estágio (`EST-001`, `EST-002`, ...) a partir do total de estágios existentes no flow.
- **GUD-003**: Toda a lógica de criação (macroetapa condicional + estágio) deve estar encapsulada num hook customizado (`useCreateStageFromCanvas`) para manter o FlowEditorPage limpo.

## 4. Interfaces & Data Contracts

### 4.1 Hook `useCreateStageFromCanvas`

```typescript
interface UseCreateStageFromCanvasOptions {
  cycleId: string;
  flow: FlowResponseDTO | undefined;
  readonly: boolean;
  userScopes: readonly string[];
}

interface UseCreateStageFromCanvasResult {
  handleCanvasDoubleClick: (event: React.MouseEvent, position: { x: number; y: number }) => void;
  isPending: boolean;
  lastCreatedStageId: string | null;
}
```

### 4.2 Fluxo de chamadas API

```
onDoubleClick no canvas
  │
  ├─ readonly || !canWriteCycle(userScopes) → return (noop)
  │
  ├─ macro_stages.length === 0?
  │   ├─ SIM → POST /admin/cycles/:cid/macro-stages { codigo: "ETAPA-GERAL", nome: "Etapa Geral", ordem: 1 }
  │   │         └─ usa o macroStage.id retornado
  │   └─ NÃO → usa macro_stages[0].id (menor ordem)
  │
  └─ POST /admin/macro-stages/:mid/stages {
       codigo: "EST-{NNN}",
       nome: "Novo estágio",
       ordem: totalStages + 1,
       is_initial: totalStages === 0,
       canvas_x: position.x,
       canvas_y: position.y
     }
     └─ invalidateQueries(['process-modeling', 'flow', cycleId])
     └─ setSelectedStageId(response.id)
```

### 4.3 Payload: Macroetapa padrão

```json
{
  "codigo": "ETAPA-GERAL",
  "nome": "Etapa Geral",
  "ordem": 1
}
```

### 4.4 Payload: Estágio (exemplo — primeiro estágio)

```json
{
  "codigo": "EST-001",
  "nome": "Novo estágio",
  "ordem": 1,
  "is_initial": true,
  "canvas_x": 250,
  "canvas_y": 180
}
```

## 5. Acceptance Criteria

- **AC-001**: Given um ciclo DRAFT vazio (sem macroetapas e sem estágios), When o analista dá duplo clique no canvas, Then uma macroetapa "Etapa Geral" é criada E um estágio "Novo estágio" com `is_initial: true` aparece na posição do clique E o painel de configuração abre automaticamente.
- **AC-002**: Given um ciclo DRAFT com macroetapas mas sem estágios, When o analista dá duplo clique no canvas, Then um estágio é criado na primeira macroetapa existente (sem criar macroetapa duplicada) com `is_initial: true`.
- **AC-003**: Given um ciclo DRAFT com estágios existentes, When o analista dá duplo clique numa área vazia do canvas, Then um novo estágio é criado com `is_initial: false` na posição do clique.
- **AC-004**: Given um ciclo PUBLISHED, When o analista dá duplo clique no canvas, Then nada acontece (readonly guard).
- **AC-005**: Given um analista sem scope `process:cycle:write`, When dá duplo clique no canvas, Then nada acontece.
- **AC-006**: Given o analista deu duplo clique e a API está processando, When a requisição está em andamento, Then um indicador visual (nó fantasma/spinner) é exibido na posição do clique.
- **AC-007**: Given o duplo clique ocorre sobre um nó existente (StageNode), When o evento borbulha, Then o handler de canvas NÃO cria novo estágio (o handler do StageNode prevalece).

## 6. Test Automation Strategy

- **Test Levels**: Unit (hook `useCreateStageFromCanvas`), Integration (FlowEditorPage com MSW mocking endpoints)
- **Frameworks**: Vitest + React Testing Library + MSW (Mock Service Worker)
- **Test Data Management**: Fixtures de `FlowResponseDTO` com cenários: vazio, com macroetapa sem estágios, com estágios existentes
- **Cenários de teste unitário:**
  - Hook retorna `handleCanvasDoubleClick` que é noop quando `readonly=true`
  - Hook retorna `handleCanvasDoubleClick` que é noop quando scope ausente
  - Hook chama `createMacroStage` + `createStage` quando `macro_stages.length === 0`
  - Hook chama apenas `createStage` quando macroetapa já existe
  - Hook gera `codigo` sequencial correto (EST-001, EST-002, ...)
  - Hook seta `is_initial: true` apenas quando é o primeiro estágio
- **Cenários de teste de integração:**
  - Duplo clique em canvas vazio cria macroetapa + estágio + abre painel
  - Duplo clique sobre nó existente não cria novo estágio
  - Ciclo PUBLISHED ignora duplo clique
- **Coverage Requirements**: >= 90% para o hook, >= 80% para integração
- **Performance Testing**: N/A (operação pontual, sem carga)

## 7. Rationale & Context

A mensagem "Dê duplo clique para criar o primeiro estágio" já está implementada no frontend (`COPY.empty_canvas`) e documentada no manifest UX-PROC-001, porém a interação correspondente não foi implementada. Isso cria uma **quebra de expectativa** — o sistema promete uma affordance que não funciona.

A criação automática de macroetapa padrão é necessária porque o modelo de dados exige que todo estágio pertença a uma macroetapa (FK obrigatória `macro_stage_id`). Para não forçar o usuário a criar manualmente uma macroetapa antes do primeiro estágio (experiência pesada), optou-se por auto-criar uma macroetapa genérica que pode ser renomeada/reorganizada depois.

## 8. Dependencies & External Integrations

### Infraestrutura existente (sem modificações)

- **PLT-001**: React Flow >= 11 — método `screenToFlowPosition()` para conversão de coordenadas
- **PLT-002**: React Query (`@tanstack/react-query`) — `invalidateQueries` para refetch do flow

### Endpoints utilizados (já existentes)

- **EXT-001**: `POST /admin/cycles/:cid/macro-stages` (FR-005) — criar macroetapa padrão
- **EXT-002**: `POST /admin/macro-stages/:mid/stages` (FR-006) — criar estágio
- **EXT-003**: `GET /admin/cycles/:id/flow` (FR-011) — refetch após criação

### Dependência de módulo

- **DAT-001**: MOD-000 — RBAC scope `process:cycle:write` para autorizar criação

## 9. Examples & Edge Cases

### Edge Case 1: Duplo clique rápido

Se o usuário der duplo clique duas vezes rapidamente, a segunda chamada poderia criar macroetapa duplicada ou estágio duplicado. **Mitigação:** O hook deve usar flag `isPending` para ignorar cliques enquanto a criação está em andamento.

### Edge Case 2: Erro na criação da macroetapa

Se `POST /admin/cycles/:cid/macro-stages` falhar (ex: rede), o estágio NÃO deve ser criado. O toast de erro deve ser exibido e o canvas deve permanecer no estado vazio.

### Edge Case 3: Macroetapa "ETAPA-GERAL" já existe (pós-fork)

Após um fork, o ciclo novo já tem macroetapas copiadas. O handler deve verificar `macro_stages.length` e NÃO criar outra macroetapa.

### Edge Case 4: Duplo clique em coordenadas negativas

Se o canvas foi arrastado (pan) e o duplo clique resulta em coordenadas negativas, as coordenadas devem ser salvas como estão — ReactFlow suporta coordenadas negativas normalmente.

### Exemplo de código — Handler no FlowEditorPage

```tsx
// No <ReactFlow>:
<ReactFlow
  nodes={nodes}
  edges={edges}
  onDoubleClick={handleCanvasDoubleClick}  // <-- novo
  // ... demais props
>
```

```typescript
// No hook useCreateStageFromCanvas:
const nextCode = `EST-${String(totalStages + 1).padStart(3, '0')}`;
```

## 10. Validation Criteria

1. O duplo clique no canvas vazio de um ciclo DRAFT cria macroetapa + estágio com sucesso (verificável via GET /admin/cycles/:id/flow)
2. O estágio aparece renderizado no canvas na posição correta
3. O painel de configuração abre automaticamente
4. O duplo clique não tem efeito em ciclo PUBLISHED/DEPRECATED
5. Não há duplicação de macroetapas ao clicar múltiplas vezes
6. O `codigo` do estágio é sequencial e único dentro do ciclo

## 11. Related Specifications / Further Reading

- [MOD-005 — Modelagem de Processos](../04_modules/mod-005-modelagem-processos/mod-005-modelagem-processos.md)
- [UX-005 — Jornadas e Fluxos](../04_modules/mod-005-modelagem-processos/requirements/ux/UX-005.md)
- [Manifest UX-PROC-001 — Editor Visual](../05_manifests/screens/ux-proc-001.editor-visual.yaml)
- [Manifest UX-PROC-002 — Config Estágio](../05_manifests/screens/ux-proc-002.config-estagio.yaml)
- [spec-fix-cycle-response-schema-mismatch](spec-fix-cycle-response-schema-mismatch.md) — fix anterior no mapeamento camelCase/snake_case

---

## Appendix A: Plano de Execução

### Arquivos afetados

| # | Arquivo | Ação | Descrição |
|---|---|---|---|
| 1 | `apps/web/src/modules/process-modeling/hooks/use-create-stage-from-canvas.ts` | **CRIAR** | Novo hook com lógica de criação condicional (macroetapa + estágio) |
| 2 | `apps/web/src/modules/process-modeling/pages/FlowEditorPage.tsx` | **MODIFICAR** | Importar hook, adicionar `onDoubleClick` ao ReactFlow, melhorar empty state |
| 3 | `apps/web/src/modules/process-modeling/types/process-modeling.types.ts` | **MODIFICAR** | Atualizar `COPY.empty_canvas` se necessário (adicionar ícone/texto) |

### Steps

| Step | Descrição | Arquivos | Paralelizável |
|---|---|---|---|
| 1 | Criar hook `useCreateStageFromCanvas` com lógica de macroetapa condicional + estágio + invalidação | `use-create-stage-from-canvas.ts` | — |
| 2 | Integrar hook no `FlowEditorPage` — `onDoubleClick`, feedback visual, abertura do painel | `FlowEditorPage.tsx` | — |
| 3 | (Opcional) Melhorar texto/ícone do empty state | `process-modeling.types.ts` | Sim (com Step 2) |

### Paralelização

Steps 1 e 2 são sequenciais (2 depende de 1). Step 3 é independente e pode ser feito em paralelo com Step 2.

**Estimativa de complexidade:** Baixa — nenhuma alteração no backend, apenas frontend. Endpoints já existem e estão testados.
