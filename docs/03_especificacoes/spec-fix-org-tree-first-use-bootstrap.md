---
title: "Fix: Primeiro uso do sistema — org tree error handling + seed org unit N1 + script fix produção"
version: 1.0
date_created: 2026-03-30
owner: ECF Core Team
tags: [bugfix, org-units, MOD-003, MOD-000, seed, observability, first-use]
---

# Introduction

Após deploy v0.18.1 (fix camelCase→snake_case), a tela de Estrutura Organizacional continua mostrando "Erro ao carregar estrutura" em cenários de primeiro uso. Três problemas encadeados foram identificados: (1) o handler GET /tree não tem try/catch, impossibilitando diagnóstico de erros; (2) o seed não cria org unit N1 raiz, deixando o banco vazio; (3) não existe script para corrigir ambientes já provisionados. Esta spec endereça todos os três pontos.

## 1. Purpose & Scope

**Propósito:** Garantir que o fluxo de primeiro uso do sistema funcione end-to-end — do seed à visualização da árvore organizacional — e que erros sejam diagnosticáveis.

**Escopo:**
- Handler `GET /api/v1/org-units/tree` — error handling + logging
- Seed `seed-admin.ts` — inclusão de org unit N1 raiz + link tenant
- Script `fix-seed-org-unit.ts` — fix idempotente para ambientes já provisionados
- Frontend `OrgTreePage.tsx` — log de erro no console do browser

**Fora de escopo:**
- Schema mismatch camelCase/snake_case (já corrigido em v0.18.1, spec `spec-fix-org-tree-load-error.md`)
- Criação de org units N2-N4 (operação manual do admin via UI)

**Audiência:** Desenvolvedores API e Frontend.

## 2. Definitions

| Termo | Definição |
|-------|-----------|
| Org Unit N1 | Unidade organizacional de nível 1 (Grupo Corporativo), raiz da árvore |
| Tenant | Entidade lógica de isolamento de dados; vinculado a org units via `org_unit_tenant_links` |
| Seed | Script que popula o banco com dados iniciais para primeiro uso |
| Fix script | Script idempotente que corrige dados em ambientes já existentes |
| First-use | Cenário onde o sistema é acessado pela primeira vez após deploy |

## 3. Requirements, Constraints & Guidelines

### Defeitos identificados

- **DEF-001: Handler GET /tree sem try/catch**
  - **Localização:** `apps/api/src/modules/org-units/presentation/routes/org-units.route.ts` linhas 141-165
  - **Impacto:** Qualquer erro no use case ou repositório vira HTTP 500 genérico sem log útil
  - **Solução:** Envolver handler em try/catch com `request.log.error` antes de re-throw

- **DEF-002: Seed não cria org unit N1**
  - **Localização:** `apps/api/db/seed-admin.ts`
  - **Impacto:** Banco fica com `org_units` vazio; GET /tree retorna `{ tree: [] }` mas o admin não entende que precisa criar a estrutura manualmente
  - **Solução:** Inserir org unit N1 "Grupo A1" e vincular ao tenant no seed

- **DEF-003: Sem script de fix para produção**
  - **Impacto:** Ambientes já provisionados (seed já rodou) não têm como receber a org unit N1 sem recriar o banco
  - **Solução:** Novo script `fix-seed-org-unit.ts` idempotente

### Requisitos

- **REQ-001:** O handler do `GET /org-units/tree` DEVE envolver a execução em try/catch e logar o erro com `request.log.error` incluindo stack trace antes de re-throw.
- **REQ-002:** O seed (`seed-admin.ts`) DEVE criar uma org unit N1 raiz com codigo `GRUPO-A1`, nome `Grupo A1`, status `ACTIVE`, nivel `1`, e vincular ao tenant criado via `org_unit_tenant_links`.
- **REQ-003:** O script `fix-seed-org-unit.ts` DEVE ser idempotente — verificar se já existe org unit com `nivel=1` antes de criar.
- **REQ-004:** O script fix DEVE buscar automaticamente o tenant e admin existentes, sem exigir parâmetros adicionais além de `DATABASE_URL`.
- **REQ-005:** O frontend `OrgTreePage.tsx` DEVE logar o objeto `error` via `console.error` no bloco `isError` para facilitar debug no browser.

### Constraints

- **CON-001:** O seed e o script fix DEVEM usar as mesmas tabelas Drizzle (`orgUnits`, `orgUnitTenantLinks`) do schema existente.
- **CON-002:** O script fix NÃO DEVE alterar dados existentes — apenas inserir se não existir.
- **CON-003:** A org unit N1 DEVE respeitar o CHECK constraint `org_units_parent_check` (nivel=1 → parentId IS NULL).

## 4. Interfaces & Data Contracts

### Org Unit N1 inserida pelo seed/fix

```typescript
{
  id: randomUUID(),
  codigo: 'GRUPO-A1',
  nome: 'Grupo A1',
  descricao: 'Unidade organizacional raiz',
  nivel: 1,
  parentId: null,
  status: 'ACTIVE',
  createdBy: adminId, // ID do admin criado pelo seed
}
```

### Link Tenant → Org Unit

```typescript
{
  id: randomUUID(),
  orgUnitId: orgUnitId, // ID da org unit N1 criada acima
  tenantId: tenantId,   // ID do tenant existente
  createdBy: adminId,
}
```

### Handler GET /tree — padrão try/catch

```typescript
handler: async (request, reply) => {
  try {
    const result = await request.dipiContainer.getOrgUnitTreeUseCase.execute();
    // mapTreeNode... (já implementado)
    return reply.status(200).send({ tree: result.tree.map(mapTreeNode) });
  } catch (err) {
    request.log.error({ err, stack: (err as Error).stack }, 'GET /org-units/tree failed');
    throw err;
  }
}
```

## 5. Acceptance Criteria

- **AC-001:** Given um banco recém-criado, When `seed-admin.ts` é executado, Then a tabela `org_units` contém 1 registro com `nivel=1`, `codigo='GRUPO-A1'`, `status='ACTIVE'`.
- **AC-002:** Given o seed executado, When a tabela `org_unit_tenant_links` é consultada, Then existe 1 link entre a org unit N1 e o tenant padrão.
- **AC-003:** Given um banco onde o seed antigo já rodou (sem org unit), When `fix-seed-org-unit.ts` é executado, Then a org unit N1 e o link são criados.
- **AC-004:** Given a org unit N1 já existente, When `fix-seed-org-unit.ts` é executado novamente, Then o script pula a criação e exibe mensagem informativa.
- **AC-005:** Given o handler com try/catch, When ocorre um erro no use case, Then o log do Fastify contém a mensagem de erro com stack trace.
- **AC-006:** Given o frontend com console.error, When a API retorna erro, Then o console do browser mostra o objeto de erro detalhado.

## 6. Test Automation Strategy

- **Test Levels:** Manual (seed/fix) + Integration (handler)
- **Frameworks:** Vitest + Fastify inject (para handler)
- **Cenários:**
  1. Seed em banco limpo → verificar org unit N1 + link tenant criados
  2. Fix em banco com seed antigo → verificar org unit N1 criada
  3. Fix em banco com org unit N1 existente → verificar idempotência (skip)
  4. Handler GET /tree com erro forçado → verificar log com stack trace

## 7. Rationale & Context

O deploy v0.18.1 corrigiu o schema mismatch (camelCase→snake_case) que causava 500 no GET /tree. Porém, em produção o admin não conseguia operar porque:

1. **Sem observabilidade:** O handler não logava erros — diagnóstico dependia de adivinhação
2. **Banco vazio:** O seed criava tenant + admin + role, mas não criava org units — a funcionalidade principal do módulo ficava vazia
3. **Sem fix retroativo:** Ambientes já provisionados não tinham como receber a org unit sem recriar tudo

Esta spec resolve o "cold start problem" do sistema: após o seed, o admin já vê a org unit raiz e pode começar a construir a estrutura organizacional.

## 8. Dependencies & External Integrations

### Data Dependencies
- **DAT-001:** Tabela `org_units` — recebe insert da org unit N1
- **DAT-002:** Tabela `org_unit_tenant_links` — recebe insert do link tenant→org unit
- **DAT-003:** Tabela `tenants` — referência FK para o link
- **DAT-004:** Tabela `users` — referência FK para `created_by`

### Technology Platform Dependencies
- **PLT-001:** Drizzle ORM — insert via schemas tipados
- **PLT-002:** Fastify logger (pino) — `request.log.error` para logging estruturado

## 9. Examples & Edge Cases

```typescript
// Edge case 1: Seed executado em banco que já tem admin (idempotência do seed)
// O seed verifica se admin existe antes de tudo — se existe, pula tudo incluindo org unit
// Isso é correto: se o admin já existe, o fix-seed-org-unit.ts deve ser usado

// Edge case 2: Fix executado com múltiplos tenants
// O script pega o primeiro tenant encontrado — adequado para cenário de primeiro uso
// Para multi-tenant avançado, o admin deve criar links manualmente

// Edge case 3: Fix executado sem nenhum tenant
// O script exibe erro e sai com código 1 — não é possível criar link sem tenant
```

## 10. Validation Criteria

- [x] Handler GET /tree tem try/catch com `request.log.error`
- [x] Seed cria org unit N1 "Grupo A1" + link tenant
- [x] Output do seed inclui "Org Unit: Grupo A1 (GRUPO-A1)"
- [x] Script `fix-seed-org-unit.ts` é idempotente (verifica antes de criar)
- [x] Script fix busca tenant e admin automaticamente
- [x] Frontend loga erro no console via `console.error`
- [x] Build API passa sem erros
- [x] Build Web passa sem erros

## 11. Related Specifications / Further Reading

- [spec-fix-org-tree-load-error.md](spec-fix-org-tree-load-error.md) — Spec anterior: fix schema mismatch camelCase/snake_case (v0.18.1)
- [spec-fix-org-units-response-schema-mismatch.md](spec-fix-org-units-response-schema-mismatch.md) — Fix análogo para outros endpoints org-units
- [mod-003-estrutura-organizacional.md](../04_modules/mod-003-estrutura-organizacional/mod-003-estrutura-organizacional.md) — Manifesto do módulo

---

## Appendix A: Plano de Execução

### Arquivos afetados

| # | Arquivo | Ação | Descrição |
|---|---------|------|-----------|
| 1 | `apps/api/src/modules/org-units/presentation/routes/org-units.route.ts` | Editar | Envolver handler GET /tree em try/catch + `request.log.error` |
| 2 | `apps/api/db/seed-admin.ts` | Editar | Adicionar import de `orgUnits`/`orgUnitTenantLinks` + insert org unit N1 + link tenant |
| 3 | `apps/api/db/fix-seed-org-unit.ts` | **Criar** | Script idempotente para fix em produção |
| 4 | `apps/web/src/modules/org-units/pages/OrgTreePage.tsx` | Editar | Adicionar `error` no destructuring + `console.error` no bloco isError |

### Steps

| Step | Descrição | Paralelo? |
|------|-----------|-----------|
| 1 | Adicionar try/catch no handler GET /tree | Sim (com 2, 3, 4) |
| 2 | Atualizar seed com org unit N1 + link tenant | Sim (com 1, 3, 4) |
| 3 | Criar script fix-seed-org-unit.ts | Sim (com 1, 2, 4) |
| 4 | Adicionar console.error no OrgTreePage | Sim (com 1, 2, 3) |
| 5 | Build API + Web para validar compilação | Após 1-4 |
| 6 | Executar fix-seed-org-unit.ts em produção | Após deploy |
| 7 | Reiniciar processo do servidor | Após deploy |
| 8 | Verificar GET /tree via curl + UI | Após 6-7 |

### Estimativa de impacto

- **3 arquivos** modificados + **1 arquivo** criado
- **~90 linhas** adicionadas/alteradas
- **Risco:** Baixo — seed/fix são aditivos e idempotentes; try/catch não altera comportamento funcional
