---
title: "Correção Definitiva do Pipeline de Scopes — Validação no INSERT e Teste de Consistência"
version: 1.0
date_created: 2026-03-31
owner: ECF Core
tags: [bugfix, auth, scopes, validation, testing, cross-module]
---

# Introduction

Desde 2026-03-25, foram necessárias 7 correções (FR-000-C01, C05, C08, C09, C10, DATA-000-C03, normalização VO) para resolver variações do mesmo problema: "Permissão insuficiente". Cada fix tratou um sintoma, mas a causa raiz sistêmica nunca foi endereçada: o seed insere strings brutas no banco sem validação pelo Value Object `Scope`, e erros só são detectados em runtime (login/refresh).

## 1. Purpose & Scope

**Propósito:** Eliminar a classe inteira de bugs de scopes inválidos implementando validação no ponto de entrada (seed INSERT) e teste de consistência no CI.

**Escopo:**
- `seed-admin.ts` — validação de scopes antes de INSERT
- `scope.vo.ts` — remoção da normalização band-aid
- Testes unitários — consistência seed ↔ VO + rejeição de hífens
- Afeta: MOD-000 (Foundation)

## 2. Definitions

| Termo | Definição |
|---|---|
| **Scope canônico** | String `dominio:entidade:acao` validada por `^[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*){1,2}$` |
| **VO Scope** | Value Object (`scope.vo.ts`) que valida e encapsula um scope |
| **Pipeline de scopes** | Caminho: catálogo DOC-FND-000 → seed SCOPES[] → DB → VO → JWT → middleware |
| **Band-aid** | Correção superficial que mascara o problema em vez de resolvê-lo |

## 3. Requirements, Constraints & Guidelines

### Histórico de Correções (diagnóstico)

| # | Fix | Sintoma | Causa real |
|---|-----|---------|------------|
| 1 | C01 | Sidebar sem "Filiais" | Seed tinha nomes inventados vs catálogo |
| 2 | C05 | 403 após login | LoginUseCase gerava JWT sem scopes |
| 3 | C08 | 403 após ~15min | RefreshTokenUseCase copiava scopes vazios |
| 4 | C09 | Novos scopes não chegavam ao admin | Seed abortava quando admin existia |
| 5 | C10 | `phase2-enable` rejeitado | Scope com hífen viola regex canônica |
| 6 | DATA-C03 | INSERT falhava no banco | CHECK relaxado como workaround (revertido) |
| 7 | Normalização VO | Erro no login | `replace(/-/g, '_')` esconde dados inválidos |

### Problema Sistêmico

O pipeline tem 3 fontes de verdade desconectadas:

```
DOC-FND-000 §2.2 (catálogo)  ←  humano escreve texto livre
         ↓ (copia manualmente)
seed-admin.ts SCOPES[]        ←  array de strings, sem validação
         ↓ (INSERT direto)
role_permissions.scope (DB)   ←  CHECK constraint valida regex
         ↓ (SELECT)
Scope.create() (VO)           ←  valida regex (pode divergir do CHECK)
         ↓
JWT scopes[]                  ←  strings brutas
         ↓
requireScope() (middleware)   ←  comparação literal
```

### Requisitos da Correção

- **REQ-001**: O `seed-admin.ts` DEVE validar cada scope do array `SCOPES` via `Scope.create()` **antes** de qualquer operação no banco. Se algum scope falhar na validação, o seed DEVE abortar com mensagem de erro explícita e `process.exit(1)`.

- **REQ-002**: O `Scope.create()` DEVE rejeitar scopes com hífens (lançar `DomainValidationError`), NÃO normalizar silenciosamente. A linha `replace(/-/g, '_')` DEVE ser removida. Scopes inválidos devem ser corrigidos na **fonte** (seed/catálogo), não mascarados no VO.

- **REQ-003**: Um teste unitário DEVE importar o array `SCOPES` do seed e validar cada scope com `Scope.create()`. Se alguém adicionar um scope inválido ao seed, o CI DEVE quebrar.

- **REQ-004**: Um teste unitário DEVE documentar que hífens são **rejeitados** pelo `Scope.create()`:
  ```typescript
  expect(() => Scope.create('mcp:agent:phase2-enable')).toThrow(DomainValidationError);
  ```

- **CON-001**: A tabela `RENAMES` no `syncSuperAdminPermissions` já resolve a migração de dados legados no banco. A validação no seed é complementar — protege contra erros futuros.

- **CON-002**: O CHECK constraint no banco (`role_permissions_scope_check`) DEVE permanecer com a regex canônica `^[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*){1,2}$` (sem hífens). Já está correto após FR-000-C10.

- **GUD-001**: O array `SCOPES` do seed deve ser exportado como constante para permitir importação nos testes sem duplicação.

## 4. Interfaces & Data Contracts

### seed-admin.ts — Validação de Startup

```typescript
import { Scope } from '../src/modules/foundation/domain/value-objects/scope.vo.js';

// Após definição do array SCOPES e antes de qualquer DB operation
const invalidScopes: string[] = [];
for (const s of SCOPES) {
  try {
    Scope.create(s);
  } catch {
    invalidScopes.push(s);
  }
}
if (invalidScopes.length > 0) {
  console.error(`❌ ${invalidScopes.length} scope(s) inválido(s) no seed:`);
  invalidScopes.forEach((s) => console.error(`   - "${s}"`));
  console.error('Corrija no array SCOPES antes de executar o seed.');
  process.exit(1);
}
```

### scope.vo.ts — Remoção da Normalização

```typescript
static create(raw: string): Scope {
  const trimmed = raw.trim();  // SEM replace(/-/g, '_')
  // ... validação normal
}
```

## 5. Acceptance Criteria

- **AC-001**: Seed com scope válido (`mcp:agent:phase2_enable`) → executa normalmente.
- **AC-002**: Seed com scope inválido (simular `mcp:agent:phase2-enable`) → aborta antes de tocar o banco.
- **AC-003**: `Scope.create('mcp:agent:phase2-enable')` → lança `DomainValidationError` (rejeita, não normaliza).
- **AC-004**: `Scope.create('mcp:agent:phase2_enable')` → sucesso.
- **AC-005**: Teste de consistência seed ↔ VO passa no CI.
- **AC-006**: Todos os 16+ testes existentes do Scope VO continuam passando.

## 6. Test Automation Strategy

- **Nível**: Unit test (Vitest)
- **Arquivo**: `apps/api/test/foundation/domain/value-objects/scope.vo.test.ts`
- **Novos cenários**:
  1. `rejects hyphens in scope segments` — AC-003
  2. `all seed SCOPES pass Scope.create() validation` — AC-005
  3. `normalizes hyphens` deve ser REMOVIDO se existir (ou nunca adicionado)

## 7. Rationale & Context

A normalização `replace(/-/g, '_')` foi adicionada como emergência para desbloquear o login em produção (scope `phase2-enable` no banco). Agora que o scope foi renomeado no banco (via seed RENAMES) e no catálogo (DOC-FND-000-C01), a normalização é desnecessária e perigosa — ela permite que futuros scopes inválidos entrem no sistema silenciosamente.

A validação no seed é a **barreira primária**: se um scope não passa pelo VO, ele nunca entra no banco. O teste de CI é a **barreira secundária**: se alguém edita o array SCOPES errado, o build quebra antes do deploy.

## 8. Dependencies & External Integrations

Nenhuma dependência nova.

**Pré-requisito:** O scope `mcp:agent:phase2-enable` já foi renomeado para `phase2_enable` no seed (FR-000-C10) e no banco (RENAMES no syncSuperAdminPermissions). A remoção da normalização é segura.

## 9. Examples & Edge Cases

### Edge Case 1: Scope novo adicionado com typo
```typescript
// Alguém adiciona ao SCOPES:
'mcp:agent:phase2-create',  // hífen por engano
```
**Antes (sem esta spec):** Scope entra no banco, erro só aparece no login em produção.
**Depois (com esta spec):** Seed aborta imediatamente com mensagem clara. CI quebra no teste.

### Edge Case 2: Banco com scope legado não renomeado
Se o banco ainda contém `phase2-enable` (RENAMES não executou), o `Scope.create()` vai rejeitar ao carregar a role. Isso é **correto** — força a execução do seed para corrigir o dado.

## 10. Validation Criteria

1. `npx vitest run test/foundation/domain/value-objects/scope.vo.test.ts` — todos passam
2. `pnpm -F @easycode/api db:seed` — roda sem erros
3. `npx tsc --noEmit` — zero erros
4. Seed com scope inválido no SCOPES → aborta com mensagem clara

## 11. Related Specifications / Further Reading

- `docs/03_especificacoes/spec-fix-scope-hyphen-rename.md` — Rename do scope phase2-enable
- `docs/04_modules/mod-000-foundation/amendments/fr/FR-000-C10.md` — Amendment do rename
- `docs/04_modules/mod-000-foundation/requirements/fr/FR-000.md` — FR-007 (Seed sync)

---

## Appendix A: Plano de Execução

### Arquivos Afetados

| # | Arquivo | Ação | Descrição |
|---|---|---|---|
| 1 | `apps/api/src/modules/foundation/domain/value-objects/scope.vo.ts` | **MODIFICAR** | Remover `replace(/-/g, '_')` |
| 2 | `apps/api/db/seed-admin.ts` | **MODIFICAR** | Adicionar validação `Scope.create()` no startup + exportar SCOPES |
| 3 | `apps/api/test/foundation/domain/value-objects/scope.vo.test.ts` | **MODIFICAR** | Adicionar testes: rejeição hífens + consistência seed SCOPES |

### Steps

| Step | Descrição | Paralelizável |
|---|---|---|
| 1 | Remover normalização do `scope.vo.ts` | Sim |
| 2 | Adicionar validação + export no `seed-admin.ts` | Sim |
| 3 | Adicionar testes no `scope.vo.test.ts` | Depende de Step 1 |

### Estimativa de Impacto
- **Risco:** Baixo — remoção de 1 linha no VO + adição de validação no seed
- **Rollback:** Simples — revert do commit
- **Downtime:** Zero
