# US-MOD-000-F07 — Gestão de Filiais Multi-Tenant (CRUD + Soft Delete)

**Status:** `para aprovação`
**Data:** 2026-03-05
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-000** (Foundation — Multi-Tenant)
**Referências Normativas:** DOC-DEV-004 §7, §8.2 | DOC-ARC-001 | DOC-ESC-001 | DOC-GNP-00 §Multi-Tenant | LGPD

---

## 1. Contexto e Problema

O sistema é multi-tenant e gerencia os dados separadamente para diferentes filiais ou empresas. Esta US formaliza o que significa o campo `code` (único, uppercase), o `requireTenantScope`, o impacto de um `status: BLOCKED` nas sessões dos usuários vinculados e as diretrizes LGPD aplicadas para soft delete do tenant (preservação por auditoria).

---

## 2. A Solução (Linguagem de Negócio)

Como **administrador superadmin**, quero criar Filiais, renomeá-las, bloqueá-las temporariamente (inadimplência) ou desativá-las (soft delete).
Como **usuário**, quero ter minha experiência dentro da filial estritamente restrita a ela (header `X-Tenant-ID`).

### Status do Tenant e Suas Implicações

| Status | Significado | Usuários conseguem logar? | Dados acessíveis? |
|---|---|---|---|
| `ACTIVE` | Operacional | ✅ Sim | ✅ Sim |
| `BLOCKED` | Suspenso temporariamente | ❌ Não (403) | ❌ Não |
| `INACTIVE` | Desativado permanentemente (soft delete) | ❌ Não | ⚠️ Somente para auditoria |

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Gestão de Filiais (Multi-Tenant)

  Cenário: Criação de nova filial com dados válidos
    Dado que POST /api/v1/tenants é chamado com {"name": "Nova Filial", "code": "sp01"}
    Então deve retornar 201 com code convertido para UPPERCASE ("sp01" → "SP01")
    E status=ACTIVE e evento tenant.created gerado

  Cenário: Criação com code duplicado
    Dado que já existe SP01
    Quando criar tenant com code "sp01"
    Então deve retornar erro 409 de conflito

  Cenário: Atualização de status da filial (Bloqueio)
    Dado que PUT /tenants/:id muda para BLOCKED
    Então a partir do request subsequente, usuários da referida filial não podem mais acessar rotas (via requireTenantScope bloqueando interceptivo)

  Cenário: Soft Delete do tenant
    Dado que DELETE /tenants/:id é chamado
    Então status altera para INACTIVE e deletedAt vira now()
    E não gera Hard Delete, respeitando preservação referencial (LGPD)

  Cenário: Proteção nas Listagens por Usuário Comum
    Dado que GET /tenants é chamado por escopo normal
    Então as listagens são governadas e não expõem tenans INACTIVE a menos explícito
```

---

## 4. Regras Críticas / Restrições Especiais

1. **`code` é sempre UPPERCASE:** A conversão é feita automaticamente no input. Nunca usar case-insensitive na lógica após persistência.
2. **Soft Delete LGPD:** Tenants excluidos preservam registros conectados e `deletedAt`. Sem cascade DELETE.
3. **Implicação Sistêmica do Bloqueio:** O tenant `BLOCKED` não limpa JWTs, mas o middleware `requireTenantScope` verifica status e barra usuários instantaneamente (Kill-Switch nível organizacional).

---

> ⚠️ **Atenção:** As automações de arquitetura (`scaffold-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `aprovada`.
