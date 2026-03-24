# DOC-ARC-002 — Estratégia de Testes Automáticos

- **id:** DOC-ARC-002
- **version:** 1.1.0
- **status:** ACTIVE
- **data_ultima_revisao:** 2026-03-24
- **owner:** arquitetura
- **scope:** global (todos os módulos e agentes)
- **supersedes:** DOC-DEV-001 §5.5

> **Fonte de verdade:** Este documento substituiu a seção §5.5 do `DOC-DEV-001`.

---

## Princípios Gerais

Garantir a saúde do CI/CD com testes rápidos, confiáveis e que valham o custo de manutenção. Agentes geradores **MUST** seguir os limites arquiteturais abaixo.

---

## Testes Unitários (Core / Domain)

- **MUST NOT** ter dependências reais de I/O (Banco de Dados, Filas, Rede).
- Mock de repositório apenas se estritamente necessário; priorize sempre testar a entidade/aggregate pura **em memória**.
- Velocidade esperada: < 1s por suite de unit tests.

**O que testar:**

- Lógica de domínio (entidades, value objects, aggregates)
- Regras de negócio puras (BRs sem I/O)
- Transformações e validações de dados

**O que NÃO testar unitariamente:**

- Controllers/Routes (testar em integração)
- Repositórios com banco real (testar em integração)

---

## Testes de Integração (API / Use Cases)

- **MUST** utilizar banco de dados real efêmero (ex: **Testcontainers**) ou SQLite em memória transacional.
- É completamente **PROIBIDO** mockar os Use Cases, Services ou Repositórios ao testar o fluxo da API (Controllers/Routes). O teste deve bater na rota e validar a escrita **real** no DB temporário.
- Cada teste de integração deve começar com banco limpo (transação revertida ou banco reiniciado).

**O que testar:**

- Rotas HTTP de ponta a ponta (Request → Controller → UseCase → Repository → DB)
- Contratos de request/response conforme OpenAPI (`DOC-ARC-001`)
- Comportamentos de erro (422 com `invalid_fields`, 404, 409, 401, 403)
- Headers obrigatórios (`X-Correlation-ID` propagado)

**Tooling sugerido:**

- `supertest` (HTTP assertions sobre Fastify/Express)
- `Testcontainers` (PostgreSQL 17 efêmero real)
- `vitest` ou `jest` como runner

---

## Testes de Contrato (Contract Testing)

- O OpenAPI é utilizado como fonte verdade dos contratos HTTP.
- Usar `openapi:contract-test` para validar responses reais/fixtures contra o schema OpenAPI versionado.
- Ver detalhes de tooling em `DOC-ARC-001 §F`.

---

## Gate de CI (MUST)

| Gate | Tipo | Critério de Falha | Status |
|---|---|---|---|
| `lint` | Unitário | Erro de linting (ESLint, Prettier) | ✅ IMPLEMENTADO |
| `test:unit` | Unitário | Qualquer falha em testes unitários | ⚠️ PENDENTE |
| `test:integration` | Integração | Qualquer falha em testes de integração | ⚠️ PENDENTE |
| `openapi:lint` | Contrato | Spectral reporta erro no OpenAPI | ⚠️ PENDENTE |
| `openapi:contract-test` | Contrato | Response real diverge do schema | ⚠️ PENDENTE |

> ⚠️ Os gates `test:unit`, `test:integration`, `openapi:lint` e `openapi:contract-test` estão pendentes de implementação. Ver [Status de Implementação (Gap Analysis)](#status-de-implementação-gap-analysis---2026-03-04) abaixo.
>
> ✅ **Gate `lint`:** Tooling configurado via `eslint.config.mjs` + `.prettierrc` na raiz. Scripts: `pnpm lint`, `pnpm format:check`. Detalhes em `DOC-PADRAO-002 §4.3`.

---

## Anti-Patterns Proibidos

| Anti-Pattern | Motivo |
|---|---|
| Mockar UseCase/Service no teste de rota | O teste não valida a integração real; esconde bugs de contrato entre camadas |
| Usar banco de produção/staging em testes | Dados corruptos, testes não isolados |
| Testes unitários com I/O real (banco, fila, e-mail) | Lentos, frágeis, dependentes de ambiente |
| Ignorar `X-Correlation-ID` nos testes de integração | Dificulta rastreabilidade no CI quando um teste falha |

---

## Status de Implementação (Gap Analysis - 2026-03-04)

Atualmente, o projeto encontra-se em deficit com este normativo. As seguintes pendências foram identificadas e documentadas em `docs/PLAN_TEST_ALIGNMENT.md`:

- **Bibliotecas Ausentes:** Os arquivos `package.json` não possuem as dependências de testes listadas na estratégia (como Vitest, Supertest, Testcontainers, etc).
- **Estrutura Ausente:** A organização de pastas exigida (ex: `apps/api/src/tests/factories`, `helpers`, `fixtures`) ainda não existe no código.
- **Falta de Implementação:** As especificações `TST-000.md` e `TST-001.md` exigem cobertura detalhada, porém não há arquivos de teste (`*.test.ts` ou `*.spec.ts`) implementados.

---

## Metadados

> Bloco de metadados canônico movido para o topo do documento (padrão DOC-PADRAO-META v1.0.0).

---

## CHANGELOG

| Versão | Data | Descrição |
|---|---|---|
| 1.1.0 | 2026-03-24 | Gate `lint` atualizado para ✅ IMPLEMENTADO; adicionada nota com tooling real |
| 1.0.0 | 2026-03-04 | Versão inicial |
