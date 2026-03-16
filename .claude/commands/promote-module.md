# Skill: promote-module

Orquestra o fluxo completo de revisao e promocao de features/epicos para READY.

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `promote-module`

> **Quando usar:** Apos o enriquecimento estar completo e as features/epico prontos para selar como READY.

## Argumento

$ARGUMENTS deve conter o caminho do modulo (ex: `docs/04_modules/mod-000-foundation/`).
Opcionalmente pode incluir seletor de lote (ex: `F01,F02,F03`). Se nao fornecido, promove todas as features.

## Fluxo de Promocao (Passo → Skill)

| # | Passo | Skill/Acao | Detalhe |
|---|-------|------------|---------|
| 1 | QA inicial (diagnostico) | `/qa docs` | Identifica problemas antes da promocao |
| 2 | Revisar e promover epico | Edicao direta | Alterar status_agil DRAFT→READY, marcar DoR |
| 3 | Revisar e promover features por lote | Edicao direta | Agrupar por dominio, alterar status_agil |
| 4 | QA final pos-promocao | `/qa docs` | Validar integridade apos mudancas |
| 5 | Atualizar indices | `/update-index` | Refletir novos status nos indices |
| 6 | Commit semantico | `/git` | Registrar promocao no historico |

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

## PASSO 4 — QA Final

Execute `/qa docs` novamente.

1. Confirme zero bloqueadores
2. Valide consistencia: epico READY + todas as features READY
3. Se houver erros, corrija antes de prosseguir

## PASSO 5 — Atualizar Indices

Execute `/update-index` para refletir os novos status nos indices markdown do projeto.

## PASSO 6 — Commit Semantico

Execute `/git commit` com mensagem no formato:

```
docs({mod-id}): promove epico e features {range} para READY
```

Exemplo: `docs(mod-000): promove epico e features F01-F17 para READY`
