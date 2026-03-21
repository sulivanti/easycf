# Skill: validate-all

Orquestra a Fase 3 de validação pré-promoção, executando todas as skills de validação aplicáveis em sequência. Detecta automaticamente quais validações são pertinentes ao módulo.

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json`

> Cada skill individual mantém sua configuração e regras separadas. Esta skill apenas orquestra a execução e consolida o relatório.

## Hierarquia de validação

Esta skill é o **orquestrador pai** de todas as validações. A relação é:

```
/validate-all  (orquestrador — validação completa pré-promoção)
├── /qa                 (sintaxe: npm lint scripts — links, markdown, YAML schemas)
├── /validate-manifest  (semântica: manifests vs schema v1 e catálogo de scopes)
├── /validate-openapi   (semântica: contratos OpenAPI vs DOC-ARC-001)
├── /validate-drizzle   (semântica: schemas Drizzle vs regras DOC-GNP-00)
└── /validate-endpoint  (semântica: handlers Fastify vs contratos e normativos)
```

- `/qa` valida **integridade de arquivos** (links quebrados, formatação markdown, YAML parseable) via `pnpm run` scripts
- As demais validam **conformidade semântica** com normativos (LLM lê e julga o conteúdo)

## Argumento

$ARGUMENTS deve conter o caminho do módulo (ex: `docs/04_modules/mod-001-backoffice-admin/`).
Opcionalmente pode incluir filtros:

- `--skip=manifest,openapi` — pula validações específicas
- `--only=qa,manifest` — executa apenas as listadas

Se não fornecido, pergunte ao usuário.

---

## PASSO 1: Detecção do Módulo

Leia o `mod.md` do módulo informado para extrair:

1. `mod_id` (ex: `MOD-001`)
2. `tipo` ou contexto do módulo (UX-only, API, full-stack)
3. Lista de artefatos existentes

Se o módulo não existir, aborte com mensagem clara.

## PASSO 2: Descoberta de Artefatos

Determine quais validações são aplicáveis verificando a existência de artefatos:

| # | Validação | Skill | Condição de Aplicabilidade | Artefato a Localizar |
|---|-----------|-------|---------------------------|---------------------|
| 1 | QA geral | `/qa` | **Sempre aplicável** | — |
| 2 | Screen Manifests | `/validate-manifest` | Existem arquivos `ux-*.yaml` em `docs/05_manifests/screens/` para o módulo | `docs/05_manifests/screens/ux-{entity}*.yaml` |
| 3 | OpenAPI | `/validate-openapi` | Existe contrato OpenAPI do módulo | `apps/api/openapi/v*.yaml` com paths do módulo |
| 4 | Drizzle Schemas | `/validate-drizzle` | Existem schemas Drizzle do módulo | `apps/api/src/modules/{mod}/schema.ts` ou similar |
| 5 | Fastify Endpoints | `/validate-endpoint` | Existem handlers/rotas Fastify do módulo | `apps/api/src/modules/{mod}/routes/*.route.ts` ou similar |

Registre quais validações são **aplicáveis**, **N/A** e **puladas** (via `--skip`).

## PASSO 3: Confirmação com Usuário

Apresente o plano de validação antes de executar:

```
## Plano de Validação — {mod_id}

| # | Validação         | Status       | Artefatos encontrados |
|---|-------------------|-------------|----------------------|
| 1 | QA geral          | ▶ Aplicável  | —                    |
| 2 | Screen Manifests  | ▶ Aplicável  | 3 manifests          |
| 3 | OpenAPI           | ⊘ N/A        | Módulo UX-only       |
| 4 | Drizzle Schemas   | ⊘ N/A        | Sem schemas próprios |
| 5 | Fastify Endpoints | ⊘ N/A        | Sem handlers próprios|

Confirma execução? (s/n)
```

Aguarde confirmação. Se o usuário pedir ajustes, aplique-os.

## PASSO 4: Execução Sequencial

Execute cada validação aplicável na ordem definida. Para cada uma:

### 4.1 — QA Geral (sempre)

Invoque: `/qa all`

- Registre resultado (pass/fail)
- Se houver bloqueadores críticos, pergunte ao usuário se deseja continuar ou corrigir primeiro

### 4.2 — Screen Manifests (se aplicável)

Para **cada** manifest encontrado, invoque:

```
/validate-manifest {caminho_do_manifest}
```

- Registre resultado individual por manifest

### 4.3 — OpenAPI (se aplicável)

Invoque: `/validate-openapi {versão_ou_caminho}`

- Registre resultado

### 4.4 — Drizzle Schemas (se aplicável)

Para **cada** schema encontrado, invoque:

```
/validate-drizzle {caminho_do_schema}
```

- Registre resultado individual

### 4.5 — Fastify Endpoints (se aplicável)

Para **cada** handler/rota encontrado, invoque:

```
/validate-endpoint {caminho_do_handler}
```

- Registre resultado individual

## PASSO 5: Relatório Consolidado

Após todas as validações, emita o relatório final:

```
## Relatório de Validação Fase 3 — {mod_id}

### Resumo

| # | Validação         | Status | Resultado | Detalhes              |
|---|-------------------|--------|-----------|----------------------|
| 1 | QA geral          | ✅ RUN  | PASS      | 0 bloqueadores       |
| 2 | Screen Manifests  | ✅ RUN  | FAIL      | 2/3 aprovados        |
| 3 | OpenAPI           | ⊘ N/A  | —         | Módulo UX-only       |
| 4 | Drizzle Schemas   | ⊘ N/A  | —         | Sem schemas próprios |
| 5 | Fastify Endpoints | ⊘ N/A  | —         | Sem handlers próprios|

### Violações Encontradas

#### Screen Manifests
- `ux-auth-001.login.yaml`: EX-UX-003 — ação fora do catálogo (linha 42)

### Veredicto Final

| Critério           | Status |
|-------------------|--------|
| Bloqueadores       | 0      |
| Violações Críticas | 1      |
| Avisos             | 3      |
| **Pronto para promoção?** | ❌ NÃO |

### Próximos Passos
1. Corrija as violações críticas listadas acima
2. Re-execute `/validate-all {caminho_modulo}` para confirmar
3. Quando aprovado, execute `/promote-module {caminho_modulo}`
```

## Notas

- Esta skill **não modifica arquivos**. Apenas lê e reporta.
- Cada skill individual (`/qa`, `/validate-manifest`, etc.) mantém suas próprias regras e configuração.
- Para validações N/A, registre o motivo no relatório mas não trate como falha.
- Se uma validação falhar por erro de execução (não por violação), registre como `⚠ ERRO` e continue com as demais.
