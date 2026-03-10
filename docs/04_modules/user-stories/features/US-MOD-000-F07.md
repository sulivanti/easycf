# US-MOD-000-F07 — Gestão de Filiais Multi-Tenant (CRUD + Soft Delete)

**Status Ágil:** `DRAFT`
**Data:** 2026-03-05
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-000** (Foundation — Multi-Tenant)
**Referências Normativas:** DOC-DEV-001 §7, §8.2 | DOC-ARC-001 | DOC-ESC-001 | DOC-GNP-00 §Multi-Tenant | LGPD

## Metadados de Governança

- **status_agil:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-06
- **rastreia_para:** US-MOD-000, US-MOD-000-F09, DOC-DEV-001, DOC-ARC-001, DOC-ESC-001, DOC-GNP-00
- **nivel_arquitetura:** 2 (multi-tenant isolado, kill-switch org, domain events)
- **referencias_exemplos:** N/A
- **evidencias:** *(adicionar links de PR/issue ao longo do refinamento)*

---

## 1. Contexto e Problema

O sistema é multi-tenant e gerencia os dados separadamente para diferentes filiais ou empresas. Esta US formaliza o que significa o campo `code` (único, uppercase), o `requireTenantScope`, o impacto de um `status: BLOCKED` nas sessões dos usuários vinculados e as diretrizes LGPD aplicadas para soft delete do tenant (preservação por auditoria).

---

## 2. A Solução (Linguagem de Negócio)

Como **administrador superadmin**, quero criar Filiais, renomeá-las, bloqueá-las temporariamente (inadimplência) ou desativá-las (soft delete).
Como **usuário**, quero ter minha experiência dentro da filial estritamente restrita a ela (header `X-Tenant-ID`).

### Status do Tenant e Suas Implicações

| Status | Significado | Usuários conseguem logar? | Dados acessíveis? |
| --- | --- | --- | --- |
| `ACTIVE` | Operacional | ✅ Sim | ✅ Sim |
| `BLOCKED` | Suspenso temporariamente | ❌ Não (403) | ❌ Não |
| `INACTIVE` | Desativado permanentemente (soft delete) | ❌ Não | ⚠️ Somente para auditoria |

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Gestão de Filiais (Multi-Tenant)

  Cenário: Criação de nova filial com dados válidos
    Dado que POST /api/v1/tenants é chamado com {"name": "Nova Filial", "codigo": "sp01"}
    Então deve retornar 201 com codigo convertido para UPPERCASE ("sp01" → "SP01")
    E status=ACTIVE e evento tenant.created gerado

  Cenário: Criação com codigo duplicado
    Dado que já existe SP01
    Quando criar tenant com codigo "sp01"
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

1. **Campo `codigo` Identidade de Negócio:** O campo `codigo` atua como identificador humano da filial (ex: número da loja, código ERP). Ele é `UNIQUE` em toda a plataforma. FK de outras tabelas para `tenants` DEVEM referenciar via `tenant_id` (UUID), nunca via `codigo`.
2. **Soft Delete LGPD:** Tenants excluídos preservam registros conectados e `deletedAt`. Sem cascade DELETE.
3. **Implicação Sistêmica do Bloqueio:** O tenant `BLOCKED` não limpa JWTs, mas o middleware `requireTenantScope` verifica status e barra usuários instantaneamente (Kill-Switch nível organizacional).
4. **`X-Correlation-ID` Obrigatório (DOC-ARC-003):** Toda resposta DEVE propagar o `X-Correlation-ID`. Os eventos `tenant.created`, `tenant.blocked`, `tenant.deleted` DEVEM incluir `correlation_id` no payload conforme `DATA-003`.
5. **Catálogo de Eventos (DATA-003):** Os eventos `tenant.created`, `tenant.status_changed`, `tenant.deleted` DEVEM seguir o formato padronizado `DATA-003` com `entity_type=tenant`, `sensitivity_level=1`, `correlation_id` obrigatório.

---

## 5. Definition of Ready (DoR) — Para Iniciar o Desenvolvimento

- [ ] Owner definido.
- [ ] Cenários Gherkin revisados e aprovados.
- [ ] Modelo de dados do tenant revisado pelo time de dados.
- [ ] Contrato dos endpoints documentado no OpenAPI (`/tenants`, `/tenants/:id`).
- [ ] Comportamento do `requireTenantScope` ao detectar status `BLOCKED` documentado como regra do middleware.
- [ ] Épico US-MOD-000 **aprovado**.

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `aprovada`.
