---
title: "Fix: POST /admin/cycles/:cid/macro-stages retorna 400 — params schema JSON literal em vez de Zod"
version: 1.0
date_created: 2026-03-30
last_updated: 2026-03-30
owner: Marcos Sulivan
tags: [bugfix, app, process-modeling, MOD-005]
---

# Introduction

Ao dar duplo clique no canvas vazio do editor de ciclos, o frontend chama `POST /api/v1/admin/cycles/:cid/macro-stages` para criar a macroetapa padrão ("Etapa Geral"). O servidor retorna **400 Bad Request**, impedindo a criação do primeiro estágio.

**Causa raiz:** A rota POST `/cycles/:cid/macro-stages` define o `schema.params` como um **JSON Schema literal** (objeto plain), enquanto todas as outras rotas do mesmo arquivo usam **Zod schemas** (ex: `cycleIdParam`). O `validatorCompiler` do `fastify-type-provider-zod` espera schemas Zod e chama `.safeParse()` no objeto recebido. Quando recebe um JSON Schema literal (sem `.safeParse()`), lança `TypeError`, que o Fastify converte em 400.

Além disso, o param se chama `:cid` nessa rota, mas o `cycleIdParam` padrão usa `{ id: ... }`. É necessário um schema Zod específico para `:cid` ou usar o `macroStageIdParam` existente (que já define `mid`) como referência.

## 1. Purpose & Scope

**Propósito:** Corrigir o erro 400 na criação de macroetapas trocando o JSON Schema literal por um Zod schema compatível com o `validatorCompiler`.

**Escopo:** 1 arquivo backend — a rota de macro-stages no `cycles.route.ts`.

## 2. Definitions

| Termo | Definição |
|---|---|
| **JSON Schema literal** | Objeto plain `{ type: 'object', properties: {...} }` usado como schema no Fastify |
| **Zod schema** | Schema criado via `z.object({...})` do `zod` — possui método `.safeParse()` |
| **validatorCompiler** | Função configurada via `fastify-type-provider-zod` que valida request data usando Zod |

## 3. Requirements, Constraints & Guidelines

- **REQ-001**: A rota `POST /cycles/:cid/macro-stages` DEVE usar um Zod schema para `params`, não um JSON Schema literal.
- **REQ-002**: O Zod schema DEVE validar que `:cid` é uma string UUID.
- **CON-001**: O nome do param na rota é `:cid` (não `:id`), portanto o Zod schema deve usar `z.object({ cid: z.string().uuid() })`.
- **GUD-001**: Criar um `cidParam` reutilizável no DTO file, análogo ao `cycleIdParam` existente.

## 4. Interfaces & Data Contracts

### Novo Zod schema (DTO)

```typescript
// Em process-modeling.dto.ts
export const cidParam = z.object({ cid: z.string().uuid() });
```

### Rota corrigida

```typescript
// Em cycles.route.ts — POST /cycles/:cid/macro-stages
app.post<{ Params: z.infer<typeof cidParam>; Body: z.infer<typeof createMacroStageBody> }>(
  '/cycles/:cid/macro-stages',
  {
    schema: {
      params: cidParam,  // ERA: { type: 'object', properties: { cid: ... } }
      body: createMacroStageBody,
      // ...
    },
    // ...
  }
);
```

## 5. Acceptance Criteria

- **AC-001**: Given um ciclo DRAFT existente, When `POST /admin/cycles/:cid/macro-stages` é chamado com body válido `{ codigo, nome, ordem }`, Then o servidor retorna 201 com a macroetapa criada.
- **AC-002**: Given um `cid` inválido (não UUID), When o POST é chamado, Then o servidor retorna 422 (validation error, não 400).
- **AC-003**: Given o usuário dá duplo clique no canvas vazio do editor, When a macroetapa + estágio são criados, Then ambos aparecem no canvas sem erro.

## 6. Test Automation Strategy

- Testar manualmente o duplo clique no canvas vazio após o fix
- Verificar no browser DevTools que a resposta é 201 (não 400)

## 7. Rationale & Context

O projeto usa `fastify-type-provider-zod` com `validatorCompiler` e `serializerCompiler` globais. Todas as rotas DEVEM usar Zod schemas (não JSON Schema literals) para `params`, `body` e `querystring`. Esta rota foi gerada com um JSON Schema literal provavelmente por uma inconsistência no codegen — todas as outras 11 rotas do mesmo arquivo usam `cycleIdParam` (Zod).

## 8. Dependencies & External Integrations

Nenhuma. Apenas corrige o schema da rota existente.

## 9. Examples & Edge Cases

### Reprodução do bug

```
1. Acesse /processos/ciclos/:id/editor (ciclo DRAFT sem estágios)
2. Dê duplo clique no canvas
3. DevTools: POST /api/v1/admin/cycles/:id/macro-stages → 400
4. Toast de erro aparece
```

### Após o fix

```
1. Acesse /processos/ciclos/:id/editor (ciclo DRAFT sem estágios)
2. Dê duplo clique no canvas
3. DevTools: POST /api/v1/admin/cycles/:id/macro-stages → 201
4. Estágio "Novo estágio" aparece no canvas
```

## 10. Validation Criteria

1. `POST /admin/cycles/:cid/macro-stages` retorna 201 com body válido
2. Nenhuma rota no `cycles.route.ts` usa JSON Schema literal para params
3. TypeScript compila sem erros

## 11. Related Specifications / Further Reading

- [spec-cycle-editor-empty-canvas-first-stage](spec-cycle-editor-empty-canvas-first-stage.md) — spec original da funcionalidade
- [MOD-005](../04_modules/mod-005-modelagem-processos/mod-005-modelagem-processos.md) — manifesto do módulo

---

## Appendix A: Plano de Execução

### Arquivos afetados

| # | Arquivo | Ação | Descrição |
|---|---|---|---|
| 1 | `apps/api/src/modules/process-modeling/presentation/dtos/process-modeling.dto.ts` | **MODIFICAR** | Adicionar `cidParam = z.object({ cid: z.string().uuid() })` |
| 2 | `apps/api/src/modules/process-modeling/presentation/routes/cycles.route.ts` | **MODIFICAR** | Trocar JSON Schema literal por `cidParam` no POST macro-stages |

### Steps

| Step | Descrição | Arquivos | Paralelizável |
|---|---|---|---|
| 1 | Adicionar `cidParam` Zod schema no DTO | `process-modeling.dto.ts` | — |
| 2 | Substituir JSON Schema literal por `cidParam` na rota POST macro-stages | `cycles.route.ts` | Depende de 1 |

### Paralelização

Steps sequenciais (2 depende de 1). Fix mínimo — 2 edições em 2 arquivos.
