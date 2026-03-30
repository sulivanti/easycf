---
title: "Fix: Erro ao carregar estrutura organizacional — GET /org-units/tree retorna 500"
version: 1.0
date_created: 2026-03-30
owner: ECF Core Team
tags: [bugfix, org-units, MOD-003, fastify, schema-validation]
---

# Introduction

Ao acessar o cadastro de Estrutura Organizacional (`/organizacao`), a tela exibe **"Erro ao carregar estrutura. Tente novamente."** com um botão "Tentar novamente". A causa raiz é um **schema mismatch** no endpoint `GET /api/v1/org-units/tree`: o handler envia o resultado do use case diretamente (`reply.send(result)`) sem mapear os campos `TenantSummary` de camelCase para snake_case. Fastify valida a resposta contra o schema Zod, detecta `tenantId` onde esperava `tenant_id`, e retorna HTTP 500.

## 1. Purpose & Scope

**Propósito:** Corrigir o mapeamento camelCase→snake_case no handler `GET /api/v1/org-units/tree` para que a resposta passe na validação do schema Zod e o frontend consiga carregar a árvore organizacional.

**Escopo:**
- `GET /api/v1/org-units/tree` (handler em `org-units.route.ts` linhas 133-146)

**Fora de escopo:**
- Demais endpoints org-units — já corrigidos em `spec-fix-org-units-response-schema-mismatch.md` (FR-001-C03)
- Frontend `OrgTreePage.tsx` — o componente de erro funciona corretamente, o problema é exclusivamente no backend

**Audiência:** Desenvolvedores API.

## 2. Definitions

| Termo | Definição |
|-------|-----------|
| Schema mismatch | Fastify valida a resposta contra o schema Zod declarado na rota; se falha, retorna 500 |
| camelCase | Formato do repository/domain (`tenantId`) |
| snake_case | Formato do contrato API (`tenant_id`) |
| `TenantSummary` | Interface do domain port com campos `{ tenantId, codigo, name }` |
| `orgUnitTenantSummary` | Schema Zod que espera `{ tenant_id, codigo, name }` |

## 3. Requirements, Constraints & Guidelines

### Defeito identificado

- **DEF-001: GET /org-units/tree envia `result` sem mapeamento de tenants**
  - **Localização:** `apps/api/src/modules/org-units/presentation/routes/org-units.route.ts` linhas 141-144
  - **Código atual:**
    ```typescript
    handler: async (request, reply) => {
      const result = await request.dipiContainer.getOrgUnitTreeUseCase.execute();
      return reply.status(200).send(result);
    },
    ```
  - **Repository retorna:** `TenantSummary` com campo `tenantId` (camelCase)
    - Definido em `apps/api/src/modules/org-units/application/ports/repositories.ts` linha 32-36
  - **Schema espera:** `orgUnitTenantSummary` com campo `tenant_id` (snake_case)
    - Definido em `apps/api/src/modules/org-units/presentation/dtos/org-units.dto.ts` linhas 86-90
  - **Resultado:** Fastify rejeita a resposta → HTTP 500 → frontend exibe "Erro ao carregar estrutura"

### Requisitos

- **REQ-001:** O handler do `GET /org-units/tree` DEVE mapear recursivamente os nós da árvore, convertendo `tenantId` → `tenant_id` em cada nó antes de enviar a resposta.
- **REQ-002:** A função de mapeamento DEVE ser recursiva para tratar `children` em todos os níveis da hierarquia (N1→N2→N3→N4).
- **REQ-003:** A correção NÃO DEVE alterar o schema Zod, a interface `TenantSummary`, nem o contrato do use case — apenas o handler da rota.

### Constraint

- **CON-001:** Manter o padrão estabelecido por FR-001-C03: mapeamento explícito campo a campo no handler, sem enviar objetos raw.

## 4. Interfaces & Data Contracts

### Input (use case output — camelCase)

```typescript
{
  tree: [
    {
      id: "uuid",
      codigo: "GRP",
      nome: "Grupo A1",
      descricao: null,
      nivel: 1,
      status: "ACTIVE",
      children: [...],
      tenants: [
        { tenantId: "uuid", codigo: "001", name: "Filial SP" }  // ← camelCase
      ]
    }
  ]
}
```

### Output esperado (schema Zod — snake_case)

```typescript
{
  tree: [
    {
      id: "uuid",
      codigo: "GRP",
      nome: "Grupo A1",
      descricao: null,
      nivel: 1,
      status: "ACTIVE",
      children: [...],
      tenants: [
        { tenant_id: "uuid", codigo: "001", name: "Filial SP" }  // ← snake_case
      ]
    }
  ]
}
```

### Código corrigido proposto

```typescript
// Helper para mapear nó da árvore recursivamente
function mapTreeNode(node: {
  id: string;
  codigo: string;
  nome: string;
  descricao: string | null;
  nivel: number;
  status: string;
  children: unknown[];
  tenants: { tenantId: string; codigo: string; name: string }[];
}) {
  return {
    id: node.id,
    codigo: node.codigo,
    nome: node.nome,
    descricao: node.descricao,
    nivel: node.nivel,
    status: node.status,
    tenants: node.tenants.map((t) => ({
      tenant_id: t.tenantId,
      codigo: t.codigo,
      name: t.name,
    })),
    children: (node.children as typeof node[]).map(mapTreeNode),
  };
}

// Handler corrigido
handler: async (request, reply) => {
  const result = await request.dipiContainer.getOrgUnitTreeUseCase.execute();
  return reply.status(200).send({
    tree: result.tree.map(mapTreeNode),
  });
},
```

## 5. Acceptance Criteria

- **AC-001:** Given a árvore organizacional com nós N1→N4 com tenants vinculados, When `GET /api/v1/org-units/tree` é chamado, Then a resposta é 200 com `tenant_id` (snake_case) em todos os nós.
- **AC-002:** Given a árvore vazia (sem nós), When `GET /api/v1/org-units/tree` é chamado, Then a resposta é `{ "tree": [] }` com status 200.
- **AC-003:** Given a correção aplicada, When o usuário acessa `/organizacao` no frontend, Then a árvore organizacional carrega normalmente sem exibir o estado de erro.

## 6. Test Automation Strategy

- **Test Levels:** Integration (rota Fastify com banco real)
- **Frameworks:** Vitest + Fastify inject
- **Cenários:**
  1. Árvore com nós em múltiplos níveis + tenants vinculados → verificar `tenant_id` na resposta
  2. Árvore vazia → verificar `{ tree: [] }`
  3. Nó N4 sem tenants → verificar `tenants: []`

## 7. Rationale & Context

Este é o mesmo padrão de bug já corrigido em `spec-fix-org-units-response-schema-mismatch.md` (FR-001-C03) para os endpoints list, detail e update. O endpoint `/tree` não foi incluído naquela correção porque seu handler era mais simples (sem campos Date). Porém, a conversão `tenantId` → `tenant_id` nos objetos `TenantSummary` embarcados é igualmente necessária.

O schema Zod do Fastify age como contrato de saída — qualquer campo extra ou com nome diferente causa rejeição da resposta com 500, protegendo contra vazamento de dados internos. O custo é que TODOS os handlers devem mapear explicitamente.

## 8. Dependencies & External Integrations

### Technology Platform Dependencies
- **PLT-001:** Fastify response validation — valida output contra schema Zod automaticamente

### Data Dependencies
- **DAT-001:** Tabela `org_units` — nós da árvore
- **DAT-002:** Tabela `org_unit_tenant_links` + `tenants` — links N4→N5

## 9. Examples & Edge Cases

```typescript
// Edge case 1: Nó sem filhos e sem tenants
{ id: "...", codigo: "SUB", nome: "Sub", descricao: null, nivel: 3, status: "ACTIVE", children: [], tenants: [] }

// Edge case 2: Nó N4 com múltiplos tenants
{
  id: "...", codigo: "FIL", nome: "Filial", descricao: null, nivel: 4, status: "ACTIVE",
  children: [],
  tenants: [
    { tenant_id: "uuid-1", codigo: "001", name: "Tenant A" },
    { tenant_id: "uuid-2", codigo: "002", name: "Tenant B" },
  ]
}

// Edge case 3: Árvore profunda (N1→N2→N3→N4) — mapeamento recursivo deve funcionar em todos os níveis
```

## 10. Validation Criteria

- [ ] `GET /api/v1/org-units/tree` retorna 200 (não 500)
- [ ] Resposta passa na validação do schema Zod (`orgUnitTreeResponse`)
- [ ] Campo `tenant_id` (snake_case) presente em todos os nós com tenants
- [ ] Campo `tenantId` (camelCase) ausente da resposta
- [ ] Frontend `OrgTreePage` carrega a árvore sem exibir estado de erro

## 11. Related Specifications / Further Reading

- [spec-fix-org-units-response-schema-mismatch.md](spec-fix-org-units-response-schema-mismatch.md) — Correção análoga para endpoints list, detail e update (FR-001-C03)
- [FR-001.md](../04_modules/mod-003-estrutura-organizacional/requirements/fr/FR-001.md) — Requisitos funcionais CRUD
- [org-units.route.ts](../../apps/api/src/modules/org-units/presentation/routes/org-units.route.ts) — Arquivo-alvo da correção

---

## Appendix A: Plano de Execução

### Arquivos afetados

| # | Arquivo | Ação | Descrição |
|---|---------|------|-----------|
| 1 | `apps/api/src/modules/org-units/presentation/routes/org-units.route.ts` | Editar | Adicionar função `mapTreeNode` e corrigir handler do `GET /tree` (linhas 133-146) |

### Steps

| Step | Descrição | Paralelo? |
|------|-----------|-----------|
| 1 | Adicionar helper `mapTreeNode` no arquivo de rotas (ou como função privada no topo) | — |
| 2 | Alterar handler do `GET /tree` para usar `reply.send({ tree: result.tree.map(mapTreeNode) })` | — |
| 3 | Testar manualmente: `GET /api/v1/org-units/tree` deve retornar 200 | — |
| 4 | Verificar frontend: `/organizacao` deve carregar a árvore sem erro | Sim (com step 3) |

### Estimativa de impacto

- **1 arquivo** modificado
- **~20 linhas** adicionadas/alteradas
- **Risco:** Baixo — alteração isolada em um handler, sem efeitos colaterais
