---
title: "Fix: Mismatch entre Response Schema e Handler no módulo Process Modeling (MOD-005)"
version: 1.0
date_created: 2026-03-28
owner: ECF Core
tags: [bugfix, process-modeling, MOD-005, serialization, fastify]
---

# Introduction

Ao cadastrar, editar ou carregar um ciclo de processo no FlowEditorPage, a API retorna HTTP 500 com a mensagem "Response doesn't match the schema". O erro ocorre porque os handlers de rota enviam dados que não correspondem ao Zod response schema registrado no `serializerCompiler` do Fastify.

## 1. Purpose & Scope

Corrigir **todos** os mismatches entre os Zod response schemas e os dados efetivamente enviados pelos handlers nas rotas de ciclos de processo (`cycles.route.ts`).

**Audiência:** Agente de codegen ou desenvolvedor que editar MOD-005.

**Premissa:** O `fastify-type-provider-zod` valida o response body via `.parse()` antes de enviar ao cliente. Qualquer divergência entre o schema e o payload causa HTTP 500.

## 2. Definitions

| Termo | Definição |
|-------|-----------|
| **serializerCompiler** | Função do `fastify-type-provider-zod` que valida response bodies contra o Zod schema antes de serializar |
| **camelCase→snake_case** | Convenção: domain entities usam camelCase, DTOs de API usam snake_case |
| **FlowGraph** | Tipo retornado por `assembleFlowGraph()` — nested graph com camelCase |
| **flowResponse** | Zod schema esperado pelo endpoint GET /cycles/:id/flow — snake_case |

## 3. Requirements, Constraints & Guidelines

### Bugs encontrados

- **BUG-001**: `GET /admin/cycles/:id/flow` — Handler envia `result` (tipo `FlowGraph`) diretamente via `reply.send(result)` sem mapeamento. O `FlowGraph` usa `{cycleId: string, macroStages: [...]}` com propriedades camelCase, mas `flowResponse` espera `{cycle: {id, codigo, nome, version, status}, macro_stages: [...]}` com propriedades snake_case. **Mismatch estrutural completo.**

- **BUG-002**: `POST /admin/cycles/:id/deprecate` — Handler envia `nome: null` (linha 310 de cycles.route.ts), mas `cycleResponse` declara `nome: z.string()` (não-nullable). O campo `nome` do ciclo nunca é null; o handler deveria enviar `result.nome`.

### Requisitos de correção

- **REQ-001**: O handler de `GET /cycles/:id/flow` DEVE mapear o `FlowGraph` (camelCase) para o formato do `flowResponse` (snake_case), incluindo buscar os dados do ciclo (id, codigo, nome, version, status) para popular `cycle`.
- **REQ-002**: O handler de `POST /cycles/:id/deprecate` DEVE enviar `nome: result.nome` em vez de `nome: null`.
- **REQ-003**: Verificar e corrigir todos os handlers de `cycles.route.ts` que usam `new Date().toISOString()` para `created_at`/`updated_at` — devem usar os timestamps reais do resultado do use case quando disponíveis.
- **CON-001**: Não alterar os Zod schemas — eles estão corretos e alinhados com o OpenAPI contract.
- **CON-002**: Não alterar o domain service `assembleFlowGraph()` — a conversão camelCase→snake_case é responsabilidade da camada de apresentação.

## 4. Interfaces & Data Contracts

### BUG-001: Mapeamento FlowGraph → flowResponse

**Entrada (FlowGraph do domain service):**
```typescript
{
  cycleId: string,
  macroStages: [{
    id, codigo, nome, ordem,
    stages: [{
      id, codigo, nome, descricao, ordem,
      isInitial, isTerminal, canvasX, canvasY,
      gates: [{ id, stageId, nome, descricao, gateType, required, ordem }],
      roles: [{ id, stageId, roleId, required, maxAssignees }],
      transitionsOut: [{ id, fromStageId, toStageId, nome, condicao, gateRequired, evidenceRequired, allowedRoles }]
    }]
  }]
}
```

**Saída esperada (flowResponse Zod schema):**
```typescript
{
  cycle: { id, codigo, nome, version, status },
  macro_stages: [{
    id, codigo, nome, ordem,
    stages: [{
      id, codigo, nome, ordem,
      is_initial, is_terminal, canvas_x, canvas_y,
      gates: [{ id, stage_id, nome, descricao, gate_type, required, ordem }],
      roles: [{ id, stage_id, role_id, required, max_assignees }],
      transitions_out: [{ id, to_stage_id, to_stage_codigo, nome, gate_required, evidence_required, allowed_roles }]
    }]
  }]
}
```

### BUG-002: Deprecate handler

**Antes (errado):**
```typescript
nome: null,  // cycleResponse.nome é z.string() — não-nullable
```

**Depois (correto):**
```typescript
nome: result.nome,
```

## 5. Acceptance Criteria

- **AC-001**: `GET /admin/cycles/:id/flow` retorna 200 com body válido conforme `flowResponse` schema para um ciclo com macro-stages, stages, gates, roles e transitions.
- **AC-002**: `POST /admin/cycles/:id/deprecate` retorna 200 com body válido conforme `cycleResponse` schema, incluindo `nome` como string (não null).
- **AC-003**: `POST /admin/cycles` (create) retorna 201 e o FlowEditorPage carrega sem erro.
- **AC-004**: `PATCH /admin/cycles/:id` (update) retorna 200 e o ciclo editado carrega sem erro.
- **AC-005**: Nenhum endpoint de cycles.route.ts produz "Response doesn't match the schema" para dados válidos.

## 6. Test Automation Strategy

- **Unit**: Testar função `mapFlowGraphToResponse()` isoladamente — dado um FlowGraph, retorna flowResponse-compatible object.
- **Integration**: Test route handler com Fastify inject para cada endpoint de ciclos — verificar que o response body passa pelo serializerCompiler sem erro.
- **Framework**: Vitest
- **Coverage**: Todos os 9 endpoints de ciclos em `cycles.route.ts` devem ter response validation coverage.

## 7. Rationale & Context

O `fastify-type-provider-zod` usa o schema registrado em `response: { 200: ... }` para validar o body **antes** de serializar. Em runtime, quando o handler envia dados que não "parseiam" contra o Zod schema, o Fastify lança uma exceção interna que resulta em HTTP 500 com mensagem genérica.

A convenção do ECF é:
- **Domain layer**: camelCase (TypeScript idiomático)
- **API DTOs**: snake_case (alinhado com OpenAPI e convenção REST)
- **Mapping**: feito na camada de apresentação (route handlers)

O handler de `/flow` foi gerado sem essa camada de mapeamento — provavelmente erro do codegen que enviou `reply.send(result)` diretamente.

## 8. Dependencies & External Integrations

- **PLT-001**: `fastify-type-provider-zod` — serializerCompiler valida responses
- **DAT-001**: ProcessCycle aggregate — fornece dados do ciclo para popular `cycle` no flowResponse

## 9. Examples & Edge Cases

### Mapeamento completo do flow handler

```typescript
// cycles.route.ts — GET /cycles/:id/flow handler
handler: async (request, reply) => {
  const cycle = await request.dipiContainer.getCycleUseCase.execute({
    id: request.params.id,
    tenantId: request.session.tenantId,
  });

  const result = await request.dipiContainer.getCycleFlowUseCase.execute({
    cycleId: request.params.id,
  });

  return reply.send({
    cycle: {
      id: cycle.id,
      codigo: cycle.codigo,
      nome: cycle.nome,
      version: cycle.version,
      status: cycle.status,
    },
    macro_stages: result.macroStages.map((ms) => ({
      id: ms.id,
      codigo: ms.codigo,
      nome: ms.nome,
      ordem: ms.ordem,
      stages: ms.stages.map((s) => ({
        id: s.id,
        codigo: s.codigo,
        nome: s.nome,
        ordem: s.ordem,
        is_initial: s.isInitial,
        is_terminal: s.isTerminal,
        canvas_x: s.canvasX,
        canvas_y: s.canvasY,
        gates: s.gates.map((g) => ({
          id: g.id,
          stage_id: g.stageId,
          nome: g.nome,
          descricao: g.descricao,
          gate_type: g.gateType,
          required: g.required,
          ordem: g.ordem,
        })),
        roles: s.roles.map((r) => ({
          id: r.id,
          stage_id: r.stageId,
          role_id: r.roleId,
          required: r.required,
          max_assignees: r.maxAssignees,
        })),
        transitions_out: s.transitionsOut.map((t) => ({
          id: t.id,
          to_stage_id: t.toStageId,
          to_stage_codigo: /* lookup stage codigo */ '',
          nome: t.nome,
          gate_required: t.gateRequired,
          evidence_required: t.evidenceRequired,
          allowed_roles: t.allowedRoles,
        })),
      })),
    })),
  });
},
```

### Edge case: `to_stage_codigo`

O `flowTransitionItem` exige `to_stage_codigo: z.string()`. O `FlowTransitionRow` do domain service não inclui `to_stage_codigo` — precisa ser resolvido via lookup no array de stages. O handler deve construir um `Map<stageId, stageCodigo>` a partir dos stages do result para popular esse campo.

### Edge case: Deprecate com dados reais

```typescript
// POST /cycles/:id/deprecate — usar dados do result, não hardcoded
return reply.send({
  id: result.id,
  tenant_id: request.session.tenantId,
  codigo: result.codigo,
  nome: result.nome,           // ← string real, não null
  descricao: result.descricao, // ← valor real, não hardcoded null
  version: result.version,
  status: result.status,
  parent_cycle_id: result.parentCycleId ?? null,
  published_at: result.publishedAt?.toISOString() ?? null,
  created_by: result.createdBy ?? request.session.userId,
  created_at: result.createdAt.toISOString(),
  updated_at: result.updatedAt.toISOString(),
});
```

## 10. Validation Criteria

1. `pnpm --filter @easycode/api exec tsc --noEmit` — zero erros
2. Cada endpoint de `cycles.route.ts` deve retornar response que passa pelo Zod schema sem erro
3. FlowEditorPage carrega ciclo sem "Response doesn't match the schema"
4. CyclesListPage lista ciclos normalmente
5. Criar, editar, publicar, fork, deprecar — todos funcionam sem erro 500

## 11. Related Specifications / Further Reading

- `docs/01_normativos/amendments/DOC-GNP-00/DOC-GNP-00-C01.md` — Regra anti-pattern DTO datetime
- `docs/01_normativos/amendments/PKG-COD-001/PKG-COD-001-C01.md` — Codegen compliance
- `apps/api/src/modules/process-modeling/presentation/dtos/process-modeling.dto.ts` — Zod schemas
- `apps/api/src/modules/process-modeling/presentation/routes/cycles.route.ts` — Handlers afetados
- `apps/api/src/modules/process-modeling/domain/domain-services/flow-graph.service.ts` — FlowGraph type

---

## Appendix A: Plano de Execução

### Arquivos afetados

| Arquivo | Ação | Descrição |
|---------|------|-----------|
| `apps/api/src/modules/process-modeling/presentation/routes/cycles.route.ts` | FIX | Corrigir handler flow (BUG-001) + deprecate (BUG-002) + publish/update/create (REQ-003) |
| `apps/api/src/modules/process-modeling/presentation/routes/stages.route.ts` | VERIFY | Verificar se handlers de stages têm mismatches similares |

### Steps

| # | Step | Depende de | Paralelizável |
|---|------|-----------|---------------|
| 1 | Corrigir handler `GET /cycles/:id/flow` — adicionar mapeamento FlowGraph→flowResponse com lookup de stage codigo para transitions | — | Não |
| 2 | Corrigir handler `POST /cycles/:id/deprecate` — usar `result.nome` e dados reais | — | Sim com Step 1 |
| 3 | Revisar e corrigir handlers `POST /cycles`, `PATCH /cycles/:id`, `POST /cycles/:id/publish`, `POST /cycles/:id/fork` — usar timestamps reais quando disponíveis | — | Sim com Step 1 |
| 4 | Verificar `stages.route.ts` para mismatches similares | Step 1 | Não |
| 5 | Rodar `tsc --noEmit` na API | Steps 1-4 | Não |
| 6 | Testar manualmente: criar ciclo → editar → carregar flow → publicar → fork → deprecar | Step 5 | Não |
