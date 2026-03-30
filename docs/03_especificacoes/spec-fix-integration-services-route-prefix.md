---
title: "Fix: Mismatch de prefixo nas rotas de Integration Services e Routines (MOD-008)"
version: 1.0
date_created: 2026-03-30
owner: arquitetura
tags: [bugfix, routing, MOD-008, integration-protheus]
---

# Introduction

As rotas `servicesRoutes` e `routinesRoutes` do MOD-008 (Integração Dinâmica Protheus) são registradas com o prefixo `/api/v1`, mas o frontend (HTTP client) e os comentários nos próprios arquivos de rota indicam que o prefixo correto é `/api/v1/admin`. Isso causa o erro **"Route GET:/api/v1/admin/integration-services not found"** ao acessar a tela `/integration/services`.

## 1. Purpose & Scope

Corrigir o prefixo de registro das rotas `servicesRoutes` e `routinesRoutes` no arquivo de bootstrap do Fastify para que os endpoints fiquem acessíveis nos caminhos esperados pelo frontend.

**Escopo:** Apenas o arquivo de registro (`apps/api/src/index.ts`). As definições de rota e o frontend já estão corretos.

**Audiência:** Desenvolvedores que mantêm o backend da API.

## 2. Definitions

| Termo | Definição |
|-------|-----------|
| `servicesRoutes` | Plugin Fastify que registra os endpoints CRUD de Integration Services (`/integration-services`) |
| `routinesRoutes` | Plugin Fastify que registra endpoints de configuração de rotinas, field mappings e params |
| `engineRoutes` | Plugin Fastify que registra endpoints de execução e logs (já funciona corretamente) |
| Prefixo | Primeiro segmento de caminho passado em `app.register(plugin, { prefix })` |

## 3. Requirements, Constraints & Guidelines

### Diagnóstico da causa-raiz

O arquivo `apps/api/src/index.ts` (linhas 155-158) registra as rotas do MOD-008 assim:

```typescript
// MOD-008 Integration Protheus — relative paths
await app.register(servicesRoutes, { prefix: '/api/v1' });       // ❌ falta /admin
await app.register(routinesRoutes, { prefix: '/api/v1' });       // ❌ falta /admin
await app.register(integrationEngineRoutes, { prefix: '/api/v1' }); // ✅ correto (engine usa /admin/ inline nos paths)
```

**Rotas resultantes (atual vs esperado):**

| Plugin | Path no arquivo de rota | Prefixo atual | Rota resultante | Rota esperada pelo frontend |
|--------|------------------------|---------------|-----------------|----------------------------|
| `servicesRoutes` | `/integration-services` | `/api/v1` | `/api/v1/integration-services` | `/api/v1/admin/integration-services` |
| `routinesRoutes` | `/routines/:id/integration-config` | `/api/v1` | `/api/v1/routines/:id/integration-config` | `/api/v1/admin/routines/:id/integration-config` |
| `engineRoutes` | `/admin/integration-logs` | `/api/v1` | `/api/v1/admin/integration-logs` | `/api/v1/admin/integration-logs` ✅ |
| `engineRoutes` | `/integration-engine/execute` | `/api/v1` | `/api/v1/integration-engine/execute` | `/api/v1/integration-engine/execute` ✅ |

O `engineRoutes` funciona porque inclui `/admin/` diretamente nos paths das rotas que precisam dele.

### Requisitos

- **REQ-001**: O prefixo de `servicesRoutes` DEVE ser alterado de `/api/v1` para `/api/v1/admin`.
- **REQ-002**: O prefixo de `routinesRoutes` DEVE ser alterado de `/api/v1` para `/api/v1/admin`.
- **REQ-003**: O prefixo de `integrationEngineRoutes` NÃO DEVE ser alterado (já está correto).
- **CON-001**: Nenhum outro módulo ou rota deve ser afetado pela alteração.

## 4. Interfaces & Data Contracts

Após a correção, os endpoints ficam:

**servicesRoutes (prefixo `/api/v1/admin`):**
- `GET    /api/v1/admin/integration-services` — Listar serviços
- `POST   /api/v1/admin/integration-services` — Criar serviço
- `PATCH  /api/v1/admin/integration-services/:id` — Atualizar serviço

**routinesRoutes (prefixo `/api/v1/admin`):**
- `POST   /api/v1/admin/routines/:id/integration-config` — Configurar extensão HTTP
- `POST   /api/v1/admin/routines/:id/field-mappings` — Criar field mapping
- `PATCH  /api/v1/admin/field-mappings/:id` — Atualizar field mapping
- `DELETE /api/v1/admin/field-mappings/:id` — Deletar field mapping
- `POST   /api/v1/admin/routines/:id/params` — Criar param
- `PATCH  /api/v1/admin/integration-params/:id` — Atualizar param

**engineRoutes (prefixo `/api/v1`, sem alteração):**
- `POST   /api/v1/integration-engine/execute` — Executar integração
- `GET    /api/v1/admin/integration-logs` — Listar logs
- `GET    /api/v1/admin/integration-logs/:id` — Detalhe do log
- `POST   /api/v1/admin/integration-logs/:id/reprocess` — Reprocessar DLQ

## 5. Acceptance Criteria

- **AC-001**: Dado que a API está rodando, quando `GET /api/v1/admin/integration-services` é chamado com sessão válida e scope `integration:service:read`, então retorna status 200 com a lista paginada de serviços.
- **AC-002**: Dado que a API está rodando, quando `POST /api/v1/admin/integration-services` é chamado com body válido, então retorna status 201 com o serviço criado.
- **AC-003**: Dado que a API está rodando, quando `POST /api/v1/admin/routines/:id/integration-config` é chamado, então retorna status 200/201 com a configuração.
- **AC-004**: A tela `/integration/services` no frontend carrega sem erros de "Route not found".
- **AC-005**: As rotas de `engineRoutes` continuam funcionando sem alteração.

## 6. Test Automation Strategy

- **Smoke test manual**: Acessar `https://ecf.jetme.com.br/integration/services` e verificar que a listagem carrega.
- **cURL de verificação**: `curl -s -o /dev/null -w "%{http_code}" https://ecf.jetme.com.br/api/v1/admin/integration-services` deve retornar 401 (não 404).

## 7. Rationale & Context

O bug é um erro de codegen: os comentários nos arquivos de rota indicam o prefixo `/api/v1/admin`, e o frontend foi gerado com essa expectativa, mas o registro no `index.ts` usou apenas `/api/v1`. O `engineRoutes` escapou do bug porque suas rotas admin incluem `/admin/` diretamente no path.

## 8. Dependencies & External Integrations

- **PLT-001**: Fastify — `app.register(plugin, { prefix })` é o mecanismo de prefixo.
- **DAT-001**: Nenhuma migração de banco necessária.

## 9. Examples & Edge Cases

```typescript
// ── ANTES (index.ts, linhas 155-158) ──
await app.register(servicesRoutes, { prefix: '/api/v1' });
await app.register(routinesRoutes, { prefix: '/api/v1' });
await app.register(integrationEngineRoutes, { prefix: '/api/v1' });

// ── DEPOIS ──
await app.register(servicesRoutes, { prefix: '/api/v1/admin' });
await app.register(routinesRoutes, { prefix: '/api/v1/admin' });
await app.register(integrationEngineRoutes, { prefix: '/api/v1' }); // sem alteração
```

**Edge case:** Se houver rotas de `routinesRoutes` que NÃO devem estar sob `/admin/`, elas precisariam ser extraídas para um plugin separado. Após análise, todas as rotas de `routinesRoutes` são administrativas e devem estar sob `/admin/`.

## 10. Validation Criteria

1. `GET /api/v1/admin/integration-services` retorna 200 (com auth) ou 401 (sem auth), nunca 404.
2. Nenhuma rota de outros módulos foi afetada.
3. `GET /api/v1/integration-engine/execute` continua retornando 405 (método errado) ou 200 (POST), nunca 404.

## 11. Related Specifications / Further Reading

- [MOD-008 — Integração Dinâmica Protheus/TOTVS](../04_modules/mod-008-integracao-protheus/mod-008-integracao-protheus.md)
- [DOC-ARC-004 — Error Handling](../01_normativos/)

---

## Appendix A: Plano de Execução

### Arquivos afetados

| # | Arquivo | Alteração |
|---|---------|-----------|
| 1 | `apps/api/src/index.ts` | Alterar prefixo de `servicesRoutes` e `routinesRoutes` de `/api/v1` para `/api/v1/admin` |

### Steps

| Step | Ação | Paralelizável |
|------|------|---------------|
| 1 | Alterar prefixo no `index.ts` (2 linhas) | — |
| 2 | Build da API (`pnpm build`) | Após step 1 |
| 3 | Smoke test: acessar `/integration/services` no browser | Após step 2 |

**Complexidade:** Trivial — alteração de 2 linhas em 1 arquivo.
**Risco:** Baixo — correção isolada ao registro de prefixo, sem impacto em lógica de negócio.
