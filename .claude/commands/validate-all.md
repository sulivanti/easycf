# Skill: validate-all

Orquestra a Fase 3 de validação pré-promoção, executando todas as skills de validação aplicáveis em sequência. Detecta automaticamente quais validações são pertinentes ao módulo.

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json`

> Cada skill individual mantém sua configuração e regras separadas. Esta skill apenas orquestra a execução e consolida o relatório.

## Hierarquia de validação

Esta skill é o **orquestrador pai** de todas as validações. A relação é:

```
/validate-all  (orquestrador — validação completa pré-promoção)
├── lint check          (tooling: pnpm lint + pnpm format:check — DOC-PADRAO-002 §4.3)
├── /qa                 (sintaxe: npm lint scripts — links, markdown, YAML schemas)
├── /validate-manifest  (semântica: manifests vs schema v1 e catálogo de scopes)
├── /validate-openapi   (semântica: contratos OpenAPI vs DOC-ARC-001)
├── /validate-drizzle   (semântica: schemas Drizzle vs regras DOC-GNP-00)
└── /validate-endpoint  (semântica: handlers Fastify vs contratos e normativos)
```

- **lint check** valida **qualidade de código** (ESLint + Prettier) conforme DOC-PADRAO-002 §4.3 e gate `lint` do DOC-ARC-002
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

Leia o manifesto do módulo (arquivo `<dirname>.md`, ex: `mod-001-backoffice-admin.md`) para extrair:

1. `mod_id` (ex: `MOD-001`)
2. `tipo` ou contexto do módulo (UX-only, API, full-stack)
3. Lista de artefatos existentes

Se o módulo não existir, aborte com mensagem clara.

## PASSO 2: Descoberta de Artefatos

Determine quais validações são aplicáveis verificando a existência de artefatos:

| # | Validação | Skill / Comando | Condição de Aplicabilidade | Artefato a Localizar |
|---|-----------|-----------------|---------------------------|---------------------|
| 0 | Lint Check | `pnpm lint` + `pnpm format:check` | **Sempre aplicável** (se existem arquivos `.ts`/`.tsx` do módulo em `apps/`) | `apps/api/src/modules/{mod}/`, `apps/web/src/modules/{mod}/` |
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

### 4.0 — Lint Check (sempre, se existem arquivos .ts/.tsx do módulo)

Execute os dois comandos na raiz do monorepo:

1. `pnpm lint` — capturar a saída e filtrar apenas linhas referentes aos paths do módulo (`apps/api/src/modules/{mod_slug}/` e/ou `apps/web/src/modules/{mod_slug}/`)
2. `pnpm format:check` — idem, filtrar apenas arquivos do módulo

**Classificação do resultado:**

| Condição | Status |
|---|---|
| 0 errors ESLint + 0 format issues | `PASS` |
| Apenas warnings ESLint (0 errors) + 0 format issues | `WARN` (não bloqueia promoção) |
| ≥1 error ESLint OU ≥1 format issue | `FAIL` |
| Nenhum arquivo `.ts`/`.tsx` do módulo em `apps/` | `N/A` |

Registre:
- Quantidade de errors, warnings (ESLint) e arquivos com problemas de formatação (Prettier)
- Regras mais frequentes (top 3)

> **Ref normativa:** DOC-PADRAO-002 §4.3, DOC-ARC-002 gate `lint`.

### 4.0.5 — Validação Arquitetural (sempre, se existem arquivos do módulo)

Verifique conformidade com padrões obrigatórios do PKG-COD-001:

**Domain Errors (se `apps/api/src/modules/{mod_slug}/domain/errors/` existe):**
1. Todas as classes de erro DEVEM estender `DomainError` (não `Error`)
2. Todas DEVEM ter campo `readonly type: string` (formato `/problems/...`)
3. Todas DEVEM ter campo `readonly statusHint: number`
4. Se algum arquivo viola → `FAIL` com lista de arquivos violadores

**Web Module Structure (se `apps/web/src/modules/{mod_slug}/` existe):**
1. Estrutura DEVE seguir Pattern A: `api/`, `hooks/`, `pages/`, `types/`
2. NÃO DEVE conter Pattern B: `data/`, `domain/`, `ui/`
3. Hooks DEVEM usar `@tanstack/react-query` (`useQuery`/`useMutation`)
4. Se Pattern B detectado → `FAIL` com diretórios incorretos

**Classificação:**

| Condição | Status |
|---|---|
| Todos checks passam | `PASS` |
| Apenas avisos menores | `WARN` |
| Violação de herança DomainError OU Pattern B detectado | `FAIL` |
| Nenhum arquivo aplicável | `N/A` |

**Exemplo de output — FAIL (Domain Errors):**

```
### 4.0.5 — Validação Arquitetural — MOD-{NNN}

**Domain Errors:**
| # | Arquivo | extends | type | statusHint | Status |
|---|---------|---------|------|------------|--------|
| 1 | {slug}-errors.ts → ResourceNotFoundError | Error ❌ | ausente ❌ | ausente ❌ | FAIL |
| 2 | {slug}-errors.ts → InvalidConfigError | Error ❌ | ausente ❌ | ausente ❌ | FAIL |
| 3 | {slug}-errors.ts → DuplicateEntryError | Error ❌ | ausente ❌ | ausente ❌ | FAIL |

→ **3 classes violam PKG-COD-001 §3.2** — devem estender DomainError com type + statusHint.

**Web Module Structure:**
| Check | Esperado | Encontrado | Status |
|---|---|---|---|
| Pattern A (api/, hooks/, pages/, types/) | Sim | Não — encontrado data/, domain/, ui/ | FAIL |
| React Query em hooks/ | useQuery/useMutation | Diretório hooks/ inexistente | FAIL |

→ **Pattern B detectado** — módulo web precisa ser reestruturado para Pattern A.

**Resultado: FAIL** (5 violações críticas)
```

**Exemplo de output — PASS:**

```
### 4.0.5 — Validação Arquitetural — MOD-{NNN}

**Domain Errors:**
| # | Arquivo | extends | type | statusHint | Status |
|---|---------|---------|------|------------|--------|
| 1 | {slug}-errors.ts → ResourceNotFoundError | DomainError ✅ | /problems/resource-not-found ✅ | 404 ✅ | PASS |

**Web Module Structure:**
| Check | Esperado | Encontrado | Status |
|---|---|---|---|
| Pattern A | Sim | api/, hooks/, pages/, types/ ✅ | PASS |
| React Query | useQuery/useMutation | use-items.ts → useQuery ✅ | PASS |

**Resultado: PASS** (0 violações)
```

### 4.0.7 — Promotion Consistency Check (sempre, se manifesto diz READY)

Se o manifesto do módulo tem `estado_item: READY`, valide consistência entre os três artefatos de status:

1. **Execution state:** `.agents/execution-state/MOD-{NNN}.json` DEVE conter `promotion.completed: true`
2. **Features:** TODAS as features em `user-stories/features/US-{MOD-ID}-F*.md` DEVEM ter `status_agil: READY` (não `APPROVED`, não `DRAFT`)
3. **Épico:** `user-stories/epics/US-{MOD-ID}.md` DEVE ter `status_agil: READY`

**Classificação:**

| Condição | Status |
|---|---|
| Manifesto não é READY | `N/A` |
| Todos os 3 checks passam | `PASS` |
| Execution state sem `promotion` | `WARN` (módulo pode ter sido promovido manualmente) |
| Features com status != READY | `FAIL` (inconsistência — features ficaram para trás) |

**Exemplo — FAIL:**

```
### 4.0.7 — Promotion Consistency — MOD-009

| Check | Esperado | Encontrado | Status |
|---|---|---|---|
| Execution state promotion | completed: true | seção ausente | WARN |
| Features READY | 5/5 READY | 5/5 APPROVED | FAIL |
| Épico READY | READY | READY | PASS |

→ **5 features com status APPROVED ao invés de READY** — inconsistência com manifesto.
```

> **Ref:** Este gate detecta divergências entre manifesto, features e execution state (Issues #8 e #12 da auditoria v0.9.0).

### 4.0.8 — Temporal Integrity Check (sempre, se execution state existe)

Se `.agents/execution-state/MOD-{NNN}.json` existe e contém seção `codegen`, valide integridade temporal:

1. `codegen.completed_at` DEVE ser estritamente posterior a `codegen.started_at` (não same-minute)
2. Para cada agente em `codegen.agents`: `completed_at` DEVE ser posterior a `codegen.started_at`
3. Para cada agente em `codegen.agents`: `completed_at` DEVE ser anterior ou igual a `codegen.completed_at`
4. Se `promotion.completed_at` existe: DEVE ser posterior a `codegen.completed_at` (promoção acontece depois do codegen)

**Classificação:**

| Condição | Status |
|---|---|
| Sem execution state ou sem codegen | `N/A` |
| Todos timestamps consistentes | `PASS` |
| Same-minute (started == completed) | `WARN` |
| Timestamp impossível (completed < started) | `FAIL` |

**Exemplo — FAIL:**

```
### 4.0.8 — Temporal Integrity — MOD-008

| Check | started_at | completed_at | Delta | Status |
|---|---|---|---|---|
| codegen | 2026-03-23T23:30:00Z | 2026-03-24T17:30:00Z | +18h | PASS |
| AGN-COD-DB | — | 2026-03-24T00:15:00Z | +45m | PASS |
| AGN-COD-VAL | — | 2026-03-23T04:30:00Z | **-19h** | FAIL |

→ **AGN-COD-VAL.completed_at é 19h ANTERIOR a codegen.started_at** — timestamp impossível.
```

> **Ref:** Este gate detecta paradoxos temporais nos execution states (Issues #3 e #5 da auditoria v0.9.0).

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
| 0 | Lint Check        | ✅ RUN  | WARN      | 0 errors, 3 warnings (no-unused-vars) |
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

## PASSO 6: Registrar Execution State

Após o relatório consolidado, registre o estado de validação no execution state.

1. Leia `.agents/execution-state/MOD-{NNN}.json` (se existir) ou crie um novo
2. Atualize (ou crie) a seção `validations`:

```json
{
  "module_id": "MOD-{NNN}",
  "module_path": "{caminho_modulo}",
  "last_updated": "{ISO_TIMESTAMP}",
  "validations": {
    "last_run": "{ISO_TIMESTAMP}",
    "lint":     { "status": "PASS|WARN|FAIL|N/A", "run_at": "{ISO_TIMESTAMP}", "eslint_errors": 0, "eslint_warnings": 0, "prettier_issues": 0, "top_rules": [] },
    "qa":       { "status": "PASS|FAIL|N/A|ERROR", "run_at": "{ISO_TIMESTAMP}", "blockers": 0, "violations": 0, "warnings": 0 },
    "manifest": { "status": "PASS|FAIL|N/A|ERROR", "run_at": "{ISO_TIMESTAMP}", "total": N, "passed": N, "violations": [] },
    "openapi":  { "status": "PASS|FAIL|N/A|ERROR", "run_at": "{ISO_TIMESTAMP}" },
    "drizzle":  { "status": "PASS|FAIL|N/A|ERROR", "run_at": "{ISO_TIMESTAMP}" },
    "endpoint": { "status": "PASS|FAIL|N/A|ERROR", "run_at": "{ISO_TIMESTAMP}" },
    "verdict": {
      "ready_for_promotion": true,
      "blockers": 0,
      "critical_violations": 0,
      "warnings": 0
    }
  }
}
```

- Para validações `N/A`, use `"status": "N/A"` e `"run_at": null`
- Para validações que deram erro de execução, use `"status": "ERROR"`
- `verdict` é o resumo do "Veredicto Final" do PASSO 5
- Preserve seções existentes (`scaffold`, `codegen`, `tests`) — faça merge, não sobrescreva
- **Adicionalmente**, atualize a seção `tests.pnpm_lint` no execution-state com o resultado do step 4.0:

```json
"tests": {
  "pnpm_lint": {
    "status": "PASS|WARN|FAIL|N/A",
    "run_at": "{ISO_TIMESTAMP}",
    "eslint_errors": 0,
    "eslint_warnings": 0,
    "prettier_issues": 0
  }
}
```

> Isso alimenta o `/action-plan` que consome `tests.pnpm_lint.status` para o checklist rápido.

## PASSO 7: Atualizar CHANGELOG

Localize o `CHANGELOG.md` do módulo e adicione uma entrada na tabela "Histórico de Versões":

```
| {next_version} | {data_atual} | validate-all | Validação Fase 3: {resultado_geral}. QA: {status_qa}. Manifests: {N_passed}/{N_total}. OpenAPI: {status}. Drizzle: {status}. Endpoints: {status}. |
```

A versão deve ser o próximo patch bump da última entrada existente.

> **Nota:** Registre o veredicto no CHANGELOG. Se PASS: `"Validação Fase 3 aprovada — pronto para merge."`. Se FAIL: `"Validação Fase 3 com {N} violações críticas — ver pen file."`.

## PASSO 8: Sincronizar Plano de Ação

Atualize o plano de ação do módulo para refletir os resultados da validação:

1. Verifique se o plano existe: `docs/04_modules/user-stories/plano/PLANO-ACAO-MOD-{NNN}.md`
2. Se **existe** → invoque `/action-plan {caminho_modulo} --update`
3. Se **não existe** → invoque `/action-plan {caminho_modulo}` (criação completa)

> **Nota:** O action-plan lê `.agents/execution-state/MOD-{NNN}.json` para dados precisos. A seção `validations` registrada no PASSO 6 será consumida aqui.

## PASSO 9: Registro de Pendências (violações → pen file)

Se o relatório (PASSO 5) contém **Bloqueadores** ou **Violações Críticas**, execute este passo. Se o veredicto foi PASS sem violações críticas, **skip** este passo.

### 9.1 — Deduplicação

Para cada violação crítica ou bloqueador encontrado:

1. Leia o arquivo `pen-{NNN}-pendente.md` do módulo (se existir)
2. Para cada violação, verifique se **já existe** um PENDENTE com:
   - O mesmo artefato em `rastreia_para` (ex: `UX-000`, `FR-002`), **E**
   - Título ou questão que cubra o mesmo problema
3. Se já existe → marque como `EXISTENTE (PENDENTE-XXX)` — não duplicar
4. Se não existe → marque como `NOVA`

### 9.2 — Registro automático

Todas as violações marcadas como `NOVA` são registradas **automaticamente** — sem confirmação do usuário.

Se **todas** as violações já têm PENDENTE correspondente, informe: `"Todas as violações já possuem pendências registradas. Nenhuma ação necessária."` e skip.

Apresente o resumo da deduplicação antes de criar:

```
### Pendências — Deduplicação

| # | Violação | Artefato | Severidade | Status |
|---|----------|----------|------------|--------|
| 1 | EX-UX-003 — ação fora do catálogo | ux-auth-001.login.yaml | ALTA | NOVA → registrando |
| 2 | EX-DATA-001 — campo obrigatório ausente | DATA-003 | BLOQUEANTE | NOVA → registrando |
| 3 | EX-SEC-002 — escopo não registrado | SEC-002 | ALTA | EXISTENTE (PENDENTE-006) |
```

### 9.3 — Criação via manage-pendentes

> **REGRA CRÍTICA:** O registro de pendências DEVE ser feito **exclusivamente** via invocação de `/manage-pendentes create PEN-{NNN}` em modo programático. **NUNCA** edite o arquivo `pen-{NNN}-pendente.md` diretamente. Escrever direto no pen file quebra a cadeia de automação: o `/manage-pendentes` PASSO 6 dispara `/action-plan --update`, que propaga os dados para o plano de ação. Se você escrever direto, o plano NÃO será atualizado.

Para cada violação `NOVA`, invoque `/manage-pendentes create PEN-{NNN}` em **modo programático** com:

- **questão:** Descrição da violação (ex: `"EX-UX-003: ação '{action}' fora do catálogo UX-010 no manifest {file}"`)
- **origem:** `VALIDATE`
- **artefatos impactados:** O(s) arquivo(s) onde a violação foi detectada
- **severidade:** Conforme classificação: Bloqueador → `BLOQUEANTE`, Violação Crítica → `ALTA`
- **domínio:** Inferido do validador de origem (manifest → `UX`, openapi → `ARC`, drizzle → `DATA`, endpoint → `ARC`, qa → inferir do tipo de erro)
- **tipo:** `CONTRADIÇÃO` (artefato existe mas não conforma) ou `LACUNA` (artefato faltante)
- **ID:** DEVE seguir o formato `PENDENTE-{NNN}` sequencial. **NUNCA** usar prefixos alternativos (ex: `PEND-SGR-`, `PEN-XXX-NNN`). O formato canônico é definido pelo `/manage-pendentes`.

Aguarde a conclusão de cada `/manage-pendentes create` antes de prosseguir para a próxima violação — a skill executa o `/action-plan --update` internamente.

### 9.4 — Resumo do Registro

Após todas as criações, emita:

```
### Pendências Registradas

- {N} pendências criadas em pen-{NNN}-pendente.md (origem: VALIDATE)
- {M} violações já cobertas por pendências existentes
- 📋 Plano de ação atualizado: PLANO-ACAO-MOD-{NNN}.md
```

---

## Notas

- Esta skill **lê e reporta** (PASSOs 1-5), **registra execution state** (PASSO 6) e opcionalmente **registra pendências** (PASSO 7) quando há violações críticas.
- O registro de pendências é delegado ao `/manage-pendentes` (modo programático, `origem: VALIDATE`) — esta skill não edita o pen file diretamente.
- Cada skill individual (`/qa`, `/validate-manifest`, etc.) mantém suas próprias regras e configuração.
- Para validações N/A, registre o motivo no relatório mas não trate como falha.
- Se uma validação falhar por erro de execução (não por violação), registre como `⚠ ERRO` e continue com as demais.
