---
title: "Fix: Erro safeParse ao desativar unidade organizacional + Filtro 'Mostrar inativos' sem efeito"
version: 1.0
date_created: 2026-04-01
owner: Marcos Sulivan
tags: bugfix, MOD-003, org-units, serialization, zod, tree-filter
---

# Introduction

Correção de dois bugs no módulo MOD-003 (Estrutura Organizacional):

1. **Erro de serialização ao desativar:** Ao desativar uma unidade organizacional (DELETE `/org-units/:id`), o sistema retorna `schema.safeParse is not a function`, embora a desativação persista corretamente no banco.
2. **Filtro "Mostrar inativos" sem efeito:** O checkbox "Mostrar inativos" na tela de árvore organizacional não exibe nenhuma unidade inativa, pois o endpoint `GET /org-units/tree` retorna apenas unidades ativas.

## 1. Purpose & Scope

Corrigir os dois bugs sem alteração de regras de negócio ou contratos existentes. O escopo limita-se a:

- Substituir schemas de response JSON literal por Zod schemas nos endpoints DELETE e PATCH/restore
- Adicionar query param `include_inactive` no endpoint `GET /org-units/tree`
- Ajustar o repositório para incluir unidades inativas condicionalmente
- Conectar o checkbox do frontend ao novo parâmetro da API

**Público-alvo:** Desenvolvedores do ECF.
**Premissa:** O `fastify-type-provider-zod` está configurado globalmente com `serializerCompiler`, exigindo Zod schemas em todas as definições de response.

## 2. Definitions

| Termo | Definição |
|-------|-----------|
| `serializerCompiler` | Função do `fastify-type-provider-zod` que valida responses via `.safeParse()` — requer Zod schemas |
| Soft delete | Padrão onde `status='INACTIVE'` + `deletedAt=timestamp` marca exclusão lógica |
| Tree query | Endpoint `GET /org-units/tree` que retorna hierarquia organizacional montada em memória |

## 3. Requirements, Constraints & Guidelines

### Bug 1 — Erro `schema.safeParse is not a function`

- **BUG-001**: Os endpoints DELETE `/org-units/:id` e PATCH `/org-units/:id/restore` usam JSON Schema literal (`{ type: 'object', properties: { message: { type: 'string' } } }`) na definição de `response`. O `serializerCompiler` do Zod tenta chamar `.safeParse()` nesse objeto, que não possui tal método.
- **REQ-001**: Substituir os schemas de response desses dois endpoints por um Zod schema: `z.object({ message: z.string() })`. Pode-se criar um schema reutilizável `genericMessageResponse` no arquivo de DTOs ou importar de `common.dto.ts` se já existir.
- **CON-001**: A response body (`{ message: "..." }`) não muda — apenas o schema de validação.

### Bug 2 — Filtro "Mostrar inativos" sem efeito

- **BUG-002**: O repository `getTree()` filtra com `WHERE status='ACTIVE' AND deletedAt IS NULL` (linhas 100 do `drizzle-repositories.ts`), portanto nunca retorna unidades inativas. O frontend filtra `visibleChildren` corretamente via `showInactive`, mas o dado nunca chega.
- **REQ-002**: Adicionar query parameter `include_inactive: z.boolean().optional().default(false)` ao endpoint `GET /org-units/tree`.
- **REQ-003**: Quando `include_inactive=true`, o repository `getTree()` deve remover o filtro `eq(orgUnits.status, 'ACTIVE')`, mantendo apenas `isNull(orgUnits.deletedAt)` como filtro base (soft-deleted units com `deletedAt != null` continuam ocultos).
- **REQ-004**: O hook `useOrgTree()` no frontend deve aceitar um parâmetro `includeInactive` e passá-lo como query string ao endpoint.
- **REQ-005**: A `OrgTreePage` deve passar `showInactive` ao hook `useOrgTree()` para que a API retorne os dados correspondentes.
- **CON-002**: A filtragem client-side no `OrgTreeNode` (linha 131) permanece como está — serve como segunda camada de filtragem visual.
- **GUD-001**: Incluir `include_inactive` na `queryKey` do React Query para que a troca do toggle invalide o cache corretamente.

## 4. Interfaces & Data Contracts

### 4.1 Response schema (Bug 1)

**Antes (JSON literal):**
```typescript
// org-units.route.ts — DELETE /:id e PATCH /:id/restore
response: {
  200: { type: 'object' as const, properties: { message: { type: 'string' as const } } },
}
```

**Depois (Zod schema):**
```typescript
// org-units.dto.ts — novo schema
export const genericMessageResponse = z.object({
  message: z.string(),
});

// org-units.route.ts
response: { 200: genericMessageResponse }
```

### 4.2 Tree endpoint query param (Bug 2)

**Antes:**
```
GET /org-units/tree
```

**Depois:**
```
GET /org-units/tree?include_inactive=true
```

**Schema atualizado:**
```typescript
// org-units.dto.ts
export const orgUnitTreeQuery = z.object({
  include_inactive: z
    .enum(['true', 'false'])
    .optional()
    .default('false')
    .transform((v) => v === 'true'),
});
```

### 4.3 Repository interface

```typescript
// repositories.ts (ports)
getTree(includeInactive?: boolean, tx?: TransactionContext): Promise<readonly OrgUnitTreeNode[]>;
```

### 4.4 Frontend hook

```typescript
// use-org-tree.ts
export function useOrgTree(includeInactive = false) {
  return useQuery({
    queryKey: [...ORG_TREE_KEY, { includeInactive }],
    queryFn: ({ signal }) => fetchOrgTree(includeInactive, signal),
    select: (data) => data.tree.map(toTreeNodeVM),
  });
}
```

### 4.5 API client

```typescript
// org-units.api.ts
export async function fetchOrgTree(
  includeInactive = false,
  signal?: AbortSignal,
): Promise<OrgUnitTreeResponseDTO> {
  const query = includeInactive ? '?include_inactive=true' : '';
  return httpClient.get<OrgUnitTreeResponseDTO>(`/org-units/tree${query}`, { signal });
}
```

## 5. Acceptance Criteria

- **AC-001**: Given o usuário desativa uma unidade organizacional, When a API processa o DELETE, Then a response retorna `{ message: "Unidade organizacional desativada." }` com status 200 sem erro de serialização.
- **AC-002**: Given o usuário restaura uma unidade desativada, When a API processa o PATCH /restore, Then a response retorna `{ message: "Unidade organizacional restaurada." }` com status 200 sem erro de serialização.
- **AC-003**: Given o checkbox "Mostrar inativos" está desmarcado, When a árvore carrega, Then apenas unidades ativas são exibidas (comportamento atual mantido).
- **AC-004**: Given o checkbox "Mostrar inativos" está marcado, When a árvore carrega, Then unidades inativas também são exibidas com badge "Inativo" e opacity 50%.
- **AC-005**: Given unidades inativas são exibidas, When o usuário clica no menu contextual de uma inativa, Then apenas a opção "Restaurar" (e "Ver histórico") é disponível — "Editar", "Novo filho", "Desativar" ficam ocultos.

## 6. Test Automation Strategy

- **Unit test**: Verificar que `genericMessageResponse.safeParse({ message: 'test' })` retorna `success: true`.
- **Integration test**: DELETE de org-unit deve retornar 200 sem erro (já existe em `crud.integration.test.ts` — garantir que não há falha de serialização).
- **Integration test**: GET /org-units/tree?include_inactive=true deve retornar unidades com status INACTIVE (novo teste).
- **Frameworks**: Vitest
- **Coverage**: Os dois bugs devem ter testes de regressão.

## 7. Rationale & Context

### Bug 1
O `fastify-type-provider-zod` registra um `serializerCompiler` global que espera Zod schemas em todas as definições de response. Os endpoints DELETE e PATCH/restore foram escritos com JSON Schema literal (provavelmente copiados de exemplos Fastify padrão), gerando incompatibilidade. O handler executa com sucesso antes da serialização, por isso a operação persiste mas o client recebe erro 500.

### Bug 2
O endpoint `GET /org-units/tree` foi projetado originalmente para exibir apenas a árvore ativa, conforme FR-002. Porém, o requisito UX-001 (tela de árvore) inclui o toggle "Mostrar inativos" que pressupõe que inativos estejam disponíveis. Há uma lacuna entre o contrato da API e a expectativa da UI.

## 8. Dependencies & External Integrations

### Technology Platform Dependencies
- **PLT-001**: `fastify-type-provider-zod` — Requer Zod schemas em responses (motivação do Bug 1)

### Data Dependencies
- **DAT-001**: Tabela `org_units` — campo `status` e `deleted_at` para filtro de inativos

## 9. Examples & Edge Cases

### Edge Case 1: Nó pai inativo com filhos ativos
Quando `include_inactive=true`, nós inativos aparecem na árvore. Porém, se um nó pai foi desativado mas seus filhos permaneceram ativos (cenário possível via manipulação direta do banco), ambos aparecem — o pai com badge "Inativo" e os filhos normalmente.

### Edge Case 2: Toggle rápido do checkbox
O React Query deve tratar o toggle como nova queryKey, cancelando a request anterior via `signal` e buscando dados novos. Não há risco de race condition pois `queryKey` inclui `includeInactive`.

### Edge Case 3: Sem inativos no banco
Se não há unidades inativas, marcar o checkbox não muda a exibição — comportamento correto.

## 10. Validation Criteria

1. DELETE `/org-units/:id` retorna 200 com body JSON válido (sem erro `safeParse`)
2. PATCH `/org-units/:id/restore` retorna 200 com body JSON válido (sem erro `safeParse`)
3. GET `/org-units/tree` sem parâmetro retorna apenas unidades ativas (regressão)
4. GET `/org-units/tree?include_inactive=true` retorna unidades ativas + inativas
5. Checkbox "Mostrar inativos" na UI efetivamente exibe/oculta nós inativos

## 11. Related Specifications / Further Reading

- [spec-fix-org-units-response-schema-mismatch.md](spec-fix-org-units-response-schema-mismatch.md) — Spec anterior de mismatch de schema em org-units
- [MOD-003 Manifesto](../04_modules/mod-003-estrutura-organizacional/mod-003-estrutura-organizacional.md)
- Documentação `fastify-type-provider-zod`: validação de response schemas

---

## Appendix A: Plano de Execução

### Arquivos afetados

| # | Arquivo | Alteração |
|---|---------|-----------|
| 1 | `apps/api/src/modules/org-units/presentation/dtos/org-units.dto.ts` | Adicionar `genericMessageResponse` e `orgUnitTreeQuery` |
| 2 | `apps/api/src/modules/org-units/presentation/routes/org-units.route.ts` | Importar e usar `genericMessageResponse` nos endpoints DELETE e restore; adicionar querystring schema ao tree endpoint |
| 3 | `apps/api/src/modules/org-units/application/ports/repositories.ts` | Adicionar param `includeInactive` ao método `getTree` |
| 4 | `apps/api/src/modules/org-units/infrastructure/drizzle-repositories.ts` | Condicionar filtro de status no `getTree()` |
| 5 | `apps/api/src/modules/org-units/application/use-cases/get-org-unit-tree.use-case.ts` | Passar `includeInactive` ao repository |
| 6 | `apps/web/src/modules/org-units/api/org-units.api.ts` | Adicionar param `includeInactive` ao `fetchOrgTree` |
| 7 | `apps/web/src/modules/org-units/hooks/use-org-tree.ts` | Aceitar e propagar `includeInactive`, incluir na queryKey |
| 8 | `apps/web/src/modules/org-units/pages/OrgTreePage.tsx` | Passar `showInactive` ao `useOrgTree()` |

### Steps

| Step | Descrição | Arquivos | Paralelo? |
|------|-----------|----------|-----------|
| 1 | Criar Zod schema `genericMessageResponse` + `orgUnitTreeQuery` no DTO | #1 | — |
| 2 | Corrigir response schemas dos endpoints DELETE e restore | #2 | Sim (com Step 1 pronto) |
| 3 | Adicionar querystring + lógica `include_inactive` no tree endpoint | #2, #3, #4, #5 | Sim (com Step 1 pronto) |
| 4 | Atualizar API client, hook e página no frontend | #6, #7, #8 | Sim (com Step 3 pronto) |
| 5 | Testes de regressão | — | Após Steps 2-4 |

### Paralelização

- Steps 2 e 3 podem rodar em paralelo após Step 1
- Step 4 depende de Step 3 (contrato da API deve existir)
- Step 5 depende de tudo anterior
