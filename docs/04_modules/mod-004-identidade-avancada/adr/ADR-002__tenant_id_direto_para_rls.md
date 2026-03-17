> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-17 | AGN-DEV-09  | Criação (enrich-agent) |

# ADR-002 — `tenant_id` Direto nas Tabelas para Row-Level Security

## Contexto

As tabelas do MOD-004 (`user_org_scopes`, `access_shares`, `access_delegations`) referenciam `users` via FKs (`user_id`, `grantor_id`, `delegator_id`). O `tenant_id` do usuário já existe na tabela `users` do Foundation.

A questão é: derivar `tenant_id` via JOIN com `users` a cada query, ou armazenar diretamente em cada tabela do MOD-004?

DOC-DEV-001 (DATA-XXX template) lista `tenant_id` como "Obrigatório em modelagens B2B; Row-Level Security". O sistema é B2B multi-tenant.

## Decisão

**Incluir coluna `tenant_id` (FK → tenants.id) diretamente em todas as tabelas do MOD-004, com RLS policy no PostgreSQL.**

RLS policy: `tenant_id = current_setting('app.tenant_id')::uuid`

O valor é preenchido no momento da criação a partir do contexto de autenticação (`auth_me.tenant_id`).

## Alternativas Consideradas

| Alternativa | Prós | Contras |
|---|---|---|
| **A) Derivar via JOIN** com `users.tenant_id` | Sem duplicação de dados; Single Source of Truth | Performance: JOIN obrigatório em toda query; RLS complexo (subquery); índice parcial inviável |
| **B) `tenant_id` direto (escolhida)** | RLS simples e eficiente; índices compostos com `tenant_id` como prefixo; sem JOIN para filtro | Duplicação controlada (UUID, não mutável); custo de storage mínimo |

## Consequências

- **Positivas:**
  - RLS policy simples: `tenant_id = current_setting('app.tenant_id')::uuid`
  - Índices eficientes: `(tenant_id, ...)` como prefixo em todos os índices (ver DATA-001)
  - Queries sem JOIN adicional para filtro de tenant
  - Alinhado com DOC-DEV-001 DATA-XXX (campo obrigatório B2B)

- **Negativas:**
  - Duplicação de `tenant_id` (já existe em `users`)
  - Se um usuário mudar de tenant (raro em B2B), os registros históricos mantêm o tenant original — comportamento desejado para auditoria

- **Mitigações:**
  - `tenant_id` é UUID imutável (não muda após criação)
  - Consistência garantida na criação (service preenche a partir do JWT)

## Status

**ACEITA** — Derivada de DOC-DEV-001 (campo obrigatório B2B) + decisão de performance do AGN-DEV-04

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-17
- **rastreia_para:** US-MOD-004, DATA-001, SEC-001, DOC-DEV-001
- **referencias_exemplos:** EX-DB-001 (campos obrigatórios)
- **evidencias:** DATA-001 v0.2.0 (AGN-DEV-04)
