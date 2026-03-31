---
title: "Fix Definitivo: Scope com hífen persiste no banco — regressão recorrente"
version: 1.0
date_created: 2026-03-31
owner: Marcos Sulivan
tags: [bugfix, cross-module, MOD-000, scopes, regression, database, migration]
---

# Introduction

O scope `mcp:agent:phase2-enable` (com hífen) continua causando erros de validação apesar de 7 tentativas de correção anteriores. A análise profunda revela que **todas as correções anteriores trataram sintomas** enquanto a causa raiz persistente ficou intocada: **o dado legado no banco de dados não é corrigido automaticamente na inicialização da aplicação**.

## 1. Purpose & Scope

Eliminar a regressão recorrente do scope `mcp:agent:phase2-enable` implementando uma correção que atua na única camada que todas as tentativas anteriores ignoraram: **migration SQL automática** que corrige o dado no banco sem depender de ação manual.

**Audiência:** Desenvolvedores backend.

**Escopo:**
- Migration Drizzle para renomear scopes com hífens no banco
- Hardening do `drizzle-repositories.ts` contra dados legados
- Prevenção de regressões futuras

**Fora de escopo:** Alterações no VO Scope (já está correto), no seed (já validado), no catálogo (já renomeado).

## 2. Definitions

| Termo | Definição |
|-------|-----------|
| **Dado legado** | Valor `mcp:agent:phase2-enable` persistido na tabela `role_permissions.scope` antes do fix FR-000-C10 |
| **RENAMES** | Mapeamento de scopes antigos → novos em `seed-admin.ts:122-124`. Só executa em `pnpm db:seed` manual |
| **Migration** | Script Drizzle que altera dados no banco de forma determinística e idempotente na inicialização da app |
| **VO Scope** | Value Object `scope.vo.ts` com regex `^[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*){1,2}$` |

## 3. Requirements, Constraints & Guidelines

### Análise das 7 correções anteriores e por que falharam

| # | Fix | O que fez | Por que não resolveu |
|---|-----|-----------|---------------------|
| 1 | FR-000-C01 | Corrigiu nomes no catálogo documental | Dado no banco ficou intocado |
| 2 | FR-000-C05 | JWT passou a incluir scopes | Não corrigiu o valor no banco |
| 3 | FR-000-C08 | RefreshToken re-lê scopes do banco | Lê o dado legado e quebra |
| 4 | FR-000-C09 | Seed não abortava mais se admin existia | RENAMES adicionado, mas só roda manual |
| 5 | DATA-000-C03 | Relaxou CHECK constraint para aceitar hífens | Band-aid perigoso (revertido) |
| 6 | FR-000-C10 | Renomeou no catálogo + RENAMES no seed | RENAMES requer `pnpm db:seed` manual |
| 7 | FR-000-C11 | Removeu normalização, adicionou validação no seed + testes | Valida catálogo, não corrige banco |

### A causa raiz que persiste

```
                   ┌─────────────────────────────────────┐
                   │  role_permissions.scope (BANCO)     │
                   │  = 'mcp:agent:phase2-enable'        │
                   │  (dado legado, NUNCA migrado)       │
                   └─────────────┬───────────────────────┘
                                 │ SELECT na inicialização
                                 ▼
                   ┌─────────────────────────────────────┐
                   │  drizzle-repositories.ts:573        │
                   │  Scope.create(p.scope)              │
                   │  → DomainValidationError! 💥        │
                   └─────────────────────────────────────┘
```

**O RENAMES no seed-admin.ts:122-140:**
- Só roda quando o usuário executa manualmente `pnpm db:seed`
- Não há garantia de que o seed seja re-executado após deploy
- Não é uma migration — não é rastreável, não é idempotente por padrão

### Requisitos

- **REQ-001**: Criar uma migration SQL Drizzle que renomeie `mcp:agent:phase2-enable` → `mcp:agent:phase2_enable` na tabela `role_permissions`. A migration deve ser **idempotente** (executar N vezes sem erro).
- **REQ-002**: A migration deve ser genérica — renomear QUALQUER scope com hífen para underscore, não apenas `phase2-enable`. Usar `UPDATE role_permissions SET scope = REPLACE(scope, '-', '_') WHERE scope LIKE '%-%'`.
- **REQ-003**: O `drizzle-repositories.ts:573` (`mapToRole`) deve ter um fallback resiliente: se `Scope.create()` falhar em um scope lido do banco, logar um WARNING e excluir o scope inválido do array (não crashar a operação inteira).
- **REQ-004**: Adicionar teste de integração que verifica que a migration corrige dados legados.

### Constraints

- **CON-001**: A migration deve usar o sistema de migrations do Drizzle (não SQL raw manual).
- **CON-002**: O fallback no repository é temporário — após confirmar que a migration rodou em todos os ambientes, pode ser removido em versão futura.
- **CON-003**: O RENAMES no seed pode ser mantido como fallback, mas não deve ser a única linha de defesa.

### Guidelines

- **GUD-001**: Toda nova adição de scope no catálogo DEVE passar pelo CI test existente (`scope.vo.test.ts` — "all SCOPES in scopes-catalog pass Scope.create()"). Isso já existe e funciona.
- **GUD-002**: Nunca relaxar o CHECK constraint ou adicionar normalização no VO para acomodar dados inválidos. A correção deve ser no dado, não na validação.

## 4. Interfaces & Data Contracts

### Migration SQL

```sql
-- Idempotent: safe to run multiple times
UPDATE role_permissions
SET scope = REPLACE(scope, '-', '_')
WHERE scope ~ '.*-.*';
```

### Fallback no repository

```typescript
// drizzle-repositories.ts — mapToRole
private mapToRole(
  row: typeof roles.$inferSelect,
  perms: (typeof rolePermissions.$inferSelect)[],
): RoleProps {
  const validScopes: Scope[] = [];
  for (const p of perms) {
    try {
      validScopes.push(Scope.create(p.scope));
    } catch (err) {
      console.warn(
        `[RoleRepository] Scope inválido ignorado: "${p.scope}" (role: ${row.codigo}). Execute migration para corrigir.`,
      );
    }
  }
  return {
    id: row.id,
    codigo: row.codigo,
    name: row.name,
    description: row.description,
    status: row.status as RoleProps['status'],
    scopes: validScopes,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
  };
}
```

## 5. Acceptance Criteria

- **AC-001**: Após executar a migration, `SELECT scope FROM role_permissions WHERE scope LIKE '%-%'` retorna 0 linhas.
- **AC-002**: App inicia sem erros de `DomainValidationError` em `mapToRole`, mesmo se a migration não tiver sido executada (fallback ativo).
- **AC-003**: O fallback loga WARNING com o scope inválido e nome da role para diagnóstico.
- **AC-004**: Seed continua funcionando normalmente (RENAMES + validação como fallback).
- **AC-005**: Testes existentes continuam passando (scope.vo.test.ts, incluindo rejeição de hífens).

## 6. Test Automation Strategy

- **Frameworks**: Vitest
- **Cenários**:
  - Migration SQL executada com dados legados → dados corrigidos
  - Migration SQL executada sem dados legados → noop (idempotente)
  - `mapToRole` com scope inválido no banco → retorna role sem o scope, loga warning
  - `mapToRole` com todos os scopes válidos → comportamento inalterado

## 7. Rationale & Context

### Por que migrations, não seed RENAMES

| Aspecto | Seed RENAMES | Migration SQL |
|---------|-------------|---------------|
| Execução | Manual (`pnpm db:seed`) | Automática (app startup / deploy) |
| Rastreabilidade | Nenhuma (função no script) | Arquivo versionado + histórico |
| Idempotência | Sim, mas requer execução | Sim, controlada pelo Drizzle |
| Garantia em deploy | Nenhuma | Pipeline CI/CD roda migrations |
| Cobertura | Só role super-admin | Todas as tabelas/roles afetadas |

### Por que fallback no repository

Mesmo com migration, é possível que:
- Um ambiente de desenvolvimento tenha dados antigos
- Um backup restaurado reintroduza o dado legado
- Uma integração externa insira scope inválido diretamente no banco

O fallback garante que a aplicação **não crasha** — degrada graciosamente com log de warning.

## 8. Dependencies & External Integrations

### Módulos afetados
- **MOD-000** (Foundation): Migration + repository + seed

### Dependências técnicas
- **Drizzle Kit**: Para gerar a migration SQL
- **PostgreSQL**: Execução da migration

## 9. Examples & Edge Cases

### Cenário principal

```
1. Banco tem: role_permissions.scope = 'mcp:agent:phase2-enable'
2. Deploy roda migration: UPDATE ... SET scope = REPLACE(scope, '-', '_')
3. Banco agora tem: 'mcp:agent:phase2_enable'
4. App inicia → drizzle-repositories.ts lê → Scope.create() aceita → OK
```

### Edge case: migration não executou

```
1. Banco AINDA tem: 'mcp:agent:phase2-enable'
2. App inicia → drizzle-repositories.ts:573 → Scope.create() FALHA
3. Fallback: scope ignorado, WARNING logado
4. Role carrega sem o scope inválido (degradação graceful)
5. Operador vê log, executa migration manualmente
```

### Edge case: múltiplos scopes com hífen

```
UPDATE role_permissions SET scope = REPLACE(scope, '-', '_') WHERE scope ~ '.*-.*';
-- Corrige TODOS de uma vez, não apenas phase2-enable
```

## 10. Validation Criteria

- [ ] Migration SQL criada e versionada no Drizzle
- [ ] `SELECT scope FROM role_permissions WHERE scope LIKE '%-%'` retorna 0 após migration
- [ ] App inicia sem erros mesmo com dados legados (fallback ativo)
- [ ] Log de WARNING visível para scopes inválidos
- [ ] Testes existentes passam (scope.vo.test.ts)
- [ ] Seed RENAMES mantido como fallback secundário

## 11. Related Specifications / Further Reading

- `docs/03_especificacoes/spec-fix-scope-hyphen-rename.md` — Spec original do rename
- `docs/03_especificacoes/spec-scope-pipeline-definitive-fix.md` — Spec da "correção definitiva" (C11)
- Amendments: FR-000-C10, FR-000-C11, DATA-000-C03, DOC-FND-000-C01
- VO Scope: `apps/api/src/modules/foundation/domain/value-objects/scope.vo.ts`

---

## Appendix A: Plano de Execução

### Arquivos afetados

| # | Arquivo | Alteração |
|---|---------|-----------|
| 1 | `apps/api/db/migrations/XXXX_fix_scope_hyphens.sql` | **NOVO** — Migration SQL idempotente |
| 2 | `apps/api/src/modules/foundation/infrastructure/drizzle-repositories.ts` | **EDITAR** — Fallback resiliente no `mapToRole` (linha 573) |

### Steps

| Step | Descrição | Paralelizável |
|------|-----------|---------------|
| S1 | Criar migration SQL via Drizzle Kit | Sim (com S2) |
| S2 | Editar `mapToRole` no drizzle-repositories.ts — adicionar try/catch + warning | Sim (com S1) |
| S3 | Executar migration localmente e validar | Após S1 |
| S4 | Rodar testes existentes + verificar que app inicia sem erros | Após S1+S2 |

### Paralelização

```
S1 ──── S3 ──┐
             ├── S4
S2 ──────────┘
```
