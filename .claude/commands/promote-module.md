# Skill: promote-module

Orquestra o fluxo completo de revisao e promocao de features/epicos para READY.

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `promote-module`

> **Quando usar:** Apos o enriquecimento estar completo e as features/epico prontos para selar como READY.

## Argumento

$ARGUMENTS deve conter o caminho do modulo (ex: `docs/04_modules/mod-000-foundation/`).
Opcionalmente pode incluir seletor de lote (ex: `F01,F02,F03`). Se nao fornecido, promove todas as features.

## Definition of Ready (Gate 0) — Obrigatorio

Antes de iniciar a promocao, **todos** os criterios abaixo DEVEM ser atendidos. Se qualquer gate falhar, **ABORTE** e informe o usuario qual criterio nao foi atendido.

```text
Gate 0 — Definition of Ready (DoR)
├── [DoR-1] Todos PENDENTEs resolvidos?
│   └── Leia pen-{NNN}-pendente.md. Todo item DEVE ter status IMPLEMENTADA, CANCELADA ou DECIDIDA.
│       Itens ABERTA ou EM_ANALISE → ABORTE: "PENDENTE-XXX ainda aberto. Resolva antes de promover."
│
├── [DoR-2] Todos arquivos de requisito existem?
│   └── Verifique existencia de: BR-{NNN}.md, FR-{NNN}.md, DATA-{NNN}.md, SEC-{NNN}.md,
│       INT-{NNN}.md, UX-{NNN}.md, NFR-{NNN}.md em requirements/
│       Faltando → ABORTE: "Arquivo {pilar}-{NNN}.md nao encontrado."
│
├── [DoR-3] Zero erros de lint no modulo?
│   └── Execute `node .agents/scripts/lint-docs.js`. Erros → ABORTE: "Lint falhou com N erros."
│
├── [DoR-4] Screen manifests validados?
│   └── Se o modulo possui telas (UX-{NNN}.md referencia manifests), verifique que os YAMLs
│       em docs/05_manifests/screens/ existem e sao validos. Se nao ha telas, pule este gate.
│
├── [DoR-5] ADRs documentados conforme nivel de arquitetura?
│   └── Leia o manifesto do módulo (<dirname>.md) campo architecture_level e conte ADRs em adr/:
│       Nivel 0-1: minimo 1 ADR
│       Nivel 2:   minimo 3 ADRs
│       Insuficiente → ABORTE: "Nivel {N} requer minimo {M} ADRs, encontrados {X}."
│
├── [DoR-6] CHANGELOG atualizado?
│   └── Verifique que CHANGELOG.md possui entrada com a versao de promocao.
│       Sem entrada → ABORTE: "CHANGELOG.md sem entrada para versao de promocao."
│
└── [DoR-7] Bloqueios cross-modulo resolvidos?
    └── Consulte docs/04_modules/DEPENDENCY-GRAPH.md §3 (Bloqueios).
        Se o modulo consta como bloqueado (BLK-*) e o bloqueador nao esta implementado:
        AVISE: "Bloqueio BLK-XXX: {detalhe}. Confirme para prosseguir mesmo assim."
```

> **Referencia:** DOC-ESC-001 (niveis de arquitetura), DOC-DEP-001 (DEPENDENCY-GRAPH.md §3 bloqueios).

## Fluxo de Promocao (Passo → Skill)

| # | Passo | Skill/Acao | Detalhe |
|---|-------|------------|---------|
| 1 | QA inicial (diagnostico) | `/qa docs` | Identifica problemas antes da promocao |
| 2 | Revisar e promover epico | Edicao direta | Alterar status_agil DRAFT→READY, marcar DoR |
| 3 | Revisar e promover features por lote | Edicao direta | Agrupar por dominio, alterar status_agil |
| 4 | Atualizar manifesto do modulo | Edicao direta | `estado_item` DRAFT→READY, bump version, data |
| 5 | Atualizar CHANGELOG | Edicao direta | Entrada de versao + mermaid E5→verde |
| 6 | Registrar Execution State | Edicao JSON | Secao `promotion` no MOD-{NNN}.json |
| 7 | QA final pos-promocao | `/qa docs` | Validar integridade apos mudancas |
| 8 | Atualizar indices | `/update-index` | Refletir novos status nos indices |
| 9 | Sincronizar Plano de Acao | `/action-plan --update` | Propagar progresso para plano de acao |
| 10 | Commit semantico | `/git` | Registrar promocao no historico |

## PASSO 0.5 — Gate de Execution State (Hard Block)

**ANTES** do QA inicial, verifique o execution state do módulo:

1. Leia `.agents/execution-state/MOD-{NNN}.json`
2. Se a seção `validations.verdict` existe:
   - Se `ready_for_promotion === false` → **ABORTE**: `"Execution state indica ready_for_promotion: false. Existem {blockers} bloqueadores e {critical_violations} violações críticas. Execute /validate-all para re-validar ou corrija as violações primeiro."`
   - Se `ready_for_promotion === true` → prossiga
3. Se a seção `validations` **não existe** → **AVISE**: `"⚠ Nenhuma validação registrada no execution state. Recomendado: execute /validate-all antes de promover."` Pergunte ao usuário se deseja continuar.
4. Verifique integridade temporal: se `codegen.completed_at` existe, confirme que é posterior a `codegen.started_at`. Se paradoxo detectado → **AVISE** e peça confirmação.

**Exemplo — execution state que BLOQUEIA promoção:**

```json
// .agents/execution-state/MOD-{NNN}.json
{
  "validations": {
    "verdict": {
      "ready_for_promotion": false,    // ← BLOQUEIA
      "blockers": 1,
      "critical_violations": 4,
      "warnings": 2
    }
  }
}
```

```
❌ ABORTADO: Execution state indica ready_for_promotion: false.
   Existem 1 bloqueadores e 4 violações críticas.
   Execute /validate-all {caminho_modulo} para re-validar
   ou corrija as violações primeiro.
```

**Exemplo — execution state que PERMITE promoção:**

```json
// .agents/execution-state/MOD-{NNN}.json
{
  "validations": {
    "verdict": {
      "ready_for_promotion": true,     // ← PERMITE
      "blockers": 0,
      "critical_violations": 0,
      "warnings": 3
    }
  }
}
```

```
✅ Gate 0.5: Execution state aprovado (0 bloqueadores, 0 críticos, 3 warnings).
   Prosseguindo para QA inicial...
```

**Exemplo — execution state SEM validações (aviso):**

```json
// .agents/execution-state/MOD-{NNN}.json
{
  "codegen": { "completed_at": "2026-03-23T15:00:00Z" }
  // sem seção "validations"
}
```

```
⚠ Nenhuma validação registrada no execution state para MOD-{NNN}.
  Recomendado: execute /validate-all {caminho_modulo}
  antes de promover. Deseja continuar mesmo assim? (sim/não)
```

> **Nota:** Este gate NÃO pode ser bypassed. Se `ready_for_promotion: false`, a única forma de prosseguir é corrigir as violações e re-executar `/validate-all`.

## PASSO 1 — QA Inicial

Execute `/qa docs` no modulo alvo.

1. Registre issues encontradas
2. Corrija bloqueadores antes de prosseguir
3. Se nao houver bloqueadores, avance para PASSO 2

## PASSO 2 — Promover Epico

Localize o epico em `docs/04_modules/user-stories/epics/US-{MOD-ID}.md`.

Aplique as seguintes alteracoes:
1. `status_agil: DRAFT` → `status_agil: READY`
2. Bump de `versao` (ex: 0.5.0 → 0.9.0)
3. `data_ultima_revisao` → data atual
4. Marque todos os itens DoR como `[x]`

## PASSO 3 — Promover Features por Lote

Agrupe features por dominio funcional para revisao coesa. Localize features em `docs/04_modules/user-stories/features/US-{MOD-ID}-{FXX}.md`.

**Sugestao de agrupamento** (adaptar conforme o modulo):
- **Lote A** — Dominio principal do modulo
- **Lote B** — Dominio secundario
- **Lote C** — Transversais (multi-tenant, RBAC)
- **Lote D** — Infra/Observabilidade
- **Lote E** — Demais

Para **cada feature** do lote:
1. Revise conteudo (cenarios Gherkin, contratos, pendencias criticas)
2. `status_agil: DRAFT` → `status_agil: READY`
3. `data_ultima_revisao` → data atual
4. Marque todos os itens DoR como `[x]`

Ao concluir um lote, informe o usuario e prossiga para o proximo.

## PASSO 4 — Atualizar Manifesto do Modulo

Localize o manifesto do modulo (`<dirname>.md`, ex: `mod-002-gestao-usuarios.md`).

Aplique as seguintes alteracoes:
1. `estado_item: DRAFT` → `estado_item: READY`
2. Bump de `version` para `1.0.0` (selo READY = primeira versao estavel)
3. `data_ultima_revisao` → data atual

> **Nota:** O manifesto do modulo e diferente do epico. O epico (`US-MOD-{NNN}.md`) tem `status_agil`, o manifesto tem `estado_item`. Ambos devem ser atualizados.

## PASSO 5 — Atualizar CHANGELOG

Localize `CHANGELOG.md` do modulo.

### 5.1 — Adicionar entrada de versao

Adicione uma nova linha na tabela "Historico de Versoes":

```
| 1.0.0 | {data_atual} | promote-module | Promocao DRAFT→READY: manifesto v1.0.0, todos os requisitos e ADRs selados. Epico + features ja READY. Ciclo de estabilidade avanca para Etapa 5. |
```

### 5.2 — Atualizar mermaid (Ciclo de Estabilidade)

No diagrama mermaid, atualize o estilo da Etapa 5 de laranja (em andamento) para verde (concluido):

```
style E5  fill:#27AE60,color:#fff,stroke:#1E8449
```

Se havia uma etapa anterior em laranja, mude-a tambem para verde.

### 5.3 — Atualizar texto de etapa

Atualize o texto descritivo abaixo do mermaid:

```
*O modulo esta na **Etapa 5 — Selo READY (Estavel Imutavel). Alteracoes futuras via `create-amendment`.**
```

## PASSO 6 — Registrar Execution State

Registre o estado de promocao no execution state do modulo.

1. Leia `.agents/execution-state/MOD-{NNN}.json` (se existir) ou crie um novo
2. Atualize (ou crie) a secao `promotion`:

```json
{
  "module_id": "MOD-{NNN}",
  "module_path": "{caminho_modulo}",
  "last_updated": "{ISO_TIMESTAMP}",
  "promotion": {
    "completed": true,
    "completed_at": "{ISO_TIMESTAMP}",
    "version": "1.0.0",
    "gates_passed": ["DoR-1", "DoR-2", "DoR-3", "DoR-4", "DoR-5", "DoR-6", "DoR-7"],
    "epic_status": "READY",
    "features_promoted": ["F01", "F02", "..."]
  }
}
```

- Preserve secoes existentes (`scaffold`, `codegen`, `validations`, `tests`) — faca merge, nao sobrescreva

## PASSO 6.5 — Gate de Consistência Pós-Promoção (MUST)

Após registrar o execution state, valide consistência entre os três artefatos de status. **Todos** os checks abaixo DEVEM passar. Se qualquer um falhar, CORRIJA antes de prosseguir.

### Checks obrigatórios:

1. **Execution state → promotion:** `.agents/execution-state/MOD-{NNN}.json` DEVE conter `promotion.completed: true` e `promotion.completed_at` com timestamp válido
2. **Manifesto → status:** O manifesto do módulo (`<dirname>.md`) DEVE ter `estado_item: READY`
3. **Features → status:** TODAS as features em `user-stories/features/US-{MOD-ID}-F*.md` DEVEM ter `status_agil: READY` (não `APPROVED`, não `DRAFT`)
4. **Épico → status:** O épico em `user-stories/epics/US-{MOD-ID}.md` DEVE ter `status_agil: READY`

### Se falhar:

```
❌ Gate 6.5 — Inconsistência detectada:
  - [1] ✅ Execution state: promotion.completed = true
  - [2] ✅ Manifesto: estado_item = READY
  - [3] ❌ Features: US-MOD-009-F03 tem status_agil = APPROVED (esperado: READY)
  - [4] ✅ Épico: status_agil = READY

  Correção: alterando US-MOD-009-F03 status_agil APPROVED → READY
```

Corrija automaticamente divergências detectadas (edite o arquivo) e re-valide. Só prossiga quando todos os 4 checks passarem.

> **Ref:** Este gate previne a situação onde o manifesto diz READY mas features ficam em APPROVED ou execution-state sem registro de promoção (Issues #8 e #12 da auditoria v0.9.0).

## PASSO 7 — QA Final

Execute `/qa docs` novamente.

1. Confirme zero bloqueadores
2. Valide consistencia: epico READY + todas as features READY + manifesto READY
3. Se houver erros, corrija antes de prosseguir

## PASSO 8 — Atualizar Indices

Execute `/update-index` para refletir os novos status nos indices markdown do projeto.

## PASSO 9 — Sincronizar Plano de Acao

Atualize o plano de acao do modulo para refletir a promocao:

1. Verifique se o plano existe: `docs/04_modules/user-stories/plano/PLANO-ACAO-MOD-{NNN}.md`
2. Se **existe** → invoque `/action-plan {caminho_modulo} --update`
3. Se **nao existe** → invoque `/action-plan {caminho_modulo}` (criacao completa)

> **Nota:** O action-plan le `.agents/execution-state/MOD-{NNN}.json` para dados precisos. A secao `promotion` registrada no PASSO 6 sera consumida aqui.

## PASSO 10 — Commit Semantico

Execute `/git commit` com mensagem no formato:

```
docs({mod-id}): promove epico e features {range} para READY
```

Exemplo: `docs(mod-000): promove epico e features F01-F17 para READY`
