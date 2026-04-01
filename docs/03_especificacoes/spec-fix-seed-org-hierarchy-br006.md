# Spec: Fix Seed — Hierarquia Organizacional Completa (BR-006)

> **Módulo:** MOD-003 (Estrutura Organizacional)
> **Data:** 2026-03-31
> **Autor:** Marcos Sulivan
> **Status:** READY

---

## 1. Problema

O script `seed-admin.ts` cria um único nó N1 (Grupo Corporativo) e vincula o tenant diretamente a ele via `org_unit_tenant_links`. Isso viola **BR-006** que determina:

> "A vinculação de tenant (N5) via `org_unit_tenant_links` só é aceita em nós com `nivel=4`. Tentativas em outros níveis retornam 422."

O use case `LinkTenantUseCase` valida corretamente essa regra, mas o seed bypassa a camada de domínio e insere direto no banco — criando um estado inválido que nunca seria possível via API.

O mesmo problema existe em `fix-seed-org-unit.ts`.

## 2. Solução

Os scripts de seed devem criar a hierarquia organizacional completa N1→N2→N3→N4 e vincular o tenant ao nó **N4**, conforme BR-006.

### Hierarquia de seed:

| Nível | Código | Nome | Descrição |
|-------|--------|------|-----------|
| N1 | GRUPO-A1 | Grupo A1 | Grupo corporativo raiz |
| N2 | UNIDADE-A1 | Unidade A1 | Unidade regional |
| N3 | MACRO-A1 | Macroárea A1 | Macroárea operacional |
| N4 | SUB-A1 | Subunidade A1 | Subunidade organizacional |

O tenant é vinculado ao N4 (SUB-A1), respeitando BR-006.

## 3. Arquivos impactados

| Arquivo | Ação |
|---------|------|
| `apps/api/db/seed-admin.ts` | Criar 4 nós (N1→N4), vincular tenant ao N4 |
| `apps/api/db/fix-seed-org-unit.ts` | Mesmo ajuste — criar hierarquia completa |

## 4. Critérios de aceite

1. Seed roda sem erros em banco limpo
2. `org_unit_tenant_links.org_unit_id` aponta para nó com `nivel=4`
3. `GET /org-units/tree` retorna hierarquia completa N1→N2→N3→N4→(tenant N5)
4. Nenhuma violação de BR-006 no estado pós-seed

## 5. Rastreabilidade

- **BR-006:** Vinculação N5 exclusivamente em nós N4
- **BR-001:** Hierarquia de 5 níveis
- **BR-002:** Nível derivado do pai
- **FR-001:** CRUD org units (seed bootstrap)
- **FR-003:** Vinculação N4→Tenant
- **ADR-001:** N5 como tenant existente
