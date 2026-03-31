---
title: "Fix: Scope mcp:agent:phase2-enable viola formato canônico (hífen)"
version: 1.0
date_created: 2026-03-31
owner: ECF Core
tags: [bugfix, auth, scopes, naming, cross-module]
---

# Introduction

O scope `mcp:agent:phase2-enable` contém um **hífen** (`-`) que viola a regex canônica do Value Object `Scope` (`^[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*){1,2}$`). Ao passar por `Scope.create()`, o scope é rejeitado com erro de validação. Um amendment anterior (DATA-000-C03) relaxou o CHECK constraint do banco para aceitar hífens, mas a solução correta é renomear o scope para `mcp:agent:phase2_enable` (underscore) e reverter o CHECK constraint à regex canônica.

## 1. Purpose & Scope

**Propósito:** Renomear o scope `mcp:agent:phase2-enable` para `mcp:agent:phase2_enable` em todo o codebase e documentação, e reverter o CHECK constraint à regex canônica (sem hífens).

**Escopo:**
- Código: seed, use case, schema Drizzle
- Documentação: DOC-FND-000, FR-010, PEN-010, amendments
- Afeta: MOD-000 (Foundation), MOD-010 (MCP)

## 2. Definitions

| Termo | Definição |
|---|---|
| **Scope canônico** | String no formato `dominio:entidade:acao` validada pela regex `^[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*){1,2}$` |
| **CHECK constraint** | Restrição SQL no banco que valida o formato do scope |

## 3. Requirements, Constraints & Guidelines

- **REQ-001**: Renomear `mcp:agent:phase2-enable` → `mcp:agent:phase2_enable` em todos os arquivos de código (.ts).
- **REQ-002**: Renomear o scope na documentação normativa (DOC-FND-000 §2.2) e em todos os documentos de requisitos (FR-010, PEN-010, amendments).
- **REQ-003**: Reverter o CHECK constraint `role_permissions_scope_check` no schema Drizzle para a regex canônica original: `^[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*){1,2}$` (sem hífens).
- **REQ-004**: Se houver dados no banco de produção com o scope antigo (`phase2-enable`), uma migration SQL DEVE atualizar o valor antes de reverter o CHECK constraint.
- **CON-001**: O Value Object `Scope` (`scope.vo.ts`) NÃO precisa ser alterado — a regex já é correta e deve permanecer `[a-z0-9_]` (sem hífens).

## 4. Interfaces & Data Contracts

### Migration SQL (REQ-004)

```sql
-- Renomear scope no banco antes de reverter CHECK constraint
UPDATE role_permissions SET scope = 'mcp:agent:phase2_enable' WHERE scope = 'mcp:agent:phase2-enable';

-- Reverter CHECK constraint para regex canônica (sem hífens)
ALTER TABLE role_permissions DROP CONSTRAINT role_permissions_scope_check;
ALTER TABLE role_permissions ADD CONSTRAINT role_permissions_scope_check
  CHECK (scope ~ '^[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*){1,2}$');
```

## 5. Acceptance Criteria

- **AC-001**: `Scope.create('mcp:agent:phase2_enable')` não lança erro.
- **AC-002**: `Scope.create('mcp:agent:phase2-enable')` lança `DomainValidationError` (comportamento correto — hífens não são aceitos).
- **AC-003**: O seed insere `mcp:agent:phase2_enable` (underscore) sem erro.
- **AC-004**: O CHECK constraint do banco rejeita hífens novamente.

## 6. Test Automation Strategy

- Testes existentes do `Scope` VO já cobrem a regex — nenhum teste novo necessário.
- Verificar que o seed roda sem erros após a mudança.

## 7. Rationale & Context

O scope foi introduzido no DOC-FND-000 v1.7.0 (amendment DOC-FND-000-M04) com hífen por engano. O DATA-000-C03 relaxou o CHECK constraint como workaround, mas a solução correta é corrigir o nome do scope na origem. Manter a regex canônica sem hífens é preferível para evitar inconsistências futuras.

## 8. Dependencies & External Integrations

Nenhuma dependência nova. A migration SQL deve ser executada no banco de produção antes de atualizar o CHECK constraint.

## 9. Examples & Edge Cases

### Edge Case: banco de produção sem o scope antigo
Se o seed nunca foi rodado com sucesso (o scope não existe no banco), a migration UPDATE é no-op — seguro executar.

## 10. Validation Criteria

1. `Scope.create('mcp:agent:phase2_enable')` → sucesso
2. Seed roda sem erros
3. `grep -r "phase2-enable" apps/` → zero resultados
4. CHECK constraint no banco rejeita hífens

## 11. Related Specifications / Further Reading

- `docs/04_modules/mod-000-foundation/amendments/data/DATA-000-C03.md` — Amendment que relaxou o CHECK (será revertido)
- `docs/01_normativos/DOC-FND-000__Foundation.md` §2.2 — Catálogo canônico de scopes

---

## Appendix A: Plano de Execução

### Arquivos Afetados

| # | Arquivo | Ação | Descrição |
|---|---|---|---|
| 1 | `apps/api/db/seed-admin.ts` | **MODIFICAR** | `phase2-enable` → `phase2_enable` |
| 2 | `apps/api/src/modules/mcp/application/use-cases/agents/enable-phase2.use-case.ts` | **MODIFICAR** | Comentário: `phase2-enable` → `phase2_enable` |
| 3 | `apps/api/db/schema/foundation.ts` | **MODIFICAR** | Reverter CHECK constraint: `[a-z0-9_-]` → `[a-z0-9_]` |
| 4 | `docs/01_normativos/DOC-FND-000__Foundation.md` | **MODIFICAR** | Renomear scope no catálogo §2.2 |
| 5 | `docs/04_modules/mod-010-mcp-automacao/requirements/fr/FR-010.md` | **MODIFICAR** | Renomear scope (6 ocorrências) |
| 6 | `docs/04_modules/mod-010-mcp-automacao/requirements/pen-010-pendente.md` | **MODIFICAR** | Renomear scope (5 ocorrências) |

### Steps

| Step | Descrição | Paralelizável |
|---|---|---|
| 1 | Renomear em código (.ts): seed, use case, schema | Sim |
| 2 | Renomear em documentação | Sim (paralelo com Step 1) |
| 3 | Executar migration SQL no banco de produção | Após deploy |

### Estimativa de Impacto
- **Risco:** Baixo — rename find-and-replace + revert CHECK constraint
- **Rollback:** Simples — revert do commit
- **Downtime:** Zero (migration UPDATE é instantânea)
