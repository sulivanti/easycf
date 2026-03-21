# Skill: qa_assistant

Pipeline de qualidade para validação de **sintaxe e integridade** de arquivos do projeto (links, markdown, YAML schemas). Executa npm scripts de linting.

> **Relação com `/validate-all`:** Esta skill é invocada automaticamente como primeiro passo do `/validate-all`. Use `/qa` isoladamente para diagnóstico rápido de integridade. Use `/validate-all` para validação completa pré-promoção (inclui `/qa` + validações semânticas via LLM).

| Cenário | Skill |
|---|---|
| Quero checar se links e markdown estão OK | `/qa` |
| Quero validar um módulo antes de promover | `/validate-all` (inclui `/qa`) |

## Argumento

$ARGUMENTS pode conter o escopo da validação (ex: `docs`, `manifests`, `all`). Se não fornecido, roda tudo.

## Objetivos

1. **Garantir integridade da documentação:** Verificar referências relativas entre arquivos markdown, corrigir links quebrados
2. **Validar manifestos YAML:** Conferir artefatos declarativos contra JSON schemas
3. **Feedback corretivo em PT-BR:** Avaliar mensagens de erro e sugerir correções claras

## Comandos de QA

### `pnpm run qa:all` — Master Quality Gate

Roda todas as validações de uma vez.

### `pnpm run lint:docs` — Lint de Documentação

Inspeciona `.md` em `docs/` buscando dead-links e inconsistências de metadados.

**Checagem de User Story (OBRIGATÓRIO):**
1. Confirme que normativos marcados como prontos `[x]` na "Definition of Ready" EXISTEM no projeto
2. Verifique que `Status:` é compatível com `estado_item:` nos metadados
3. Garanta que `Referências Normativas` bate com `rastreia_para`

### `pnpm run lint:markdown` — Lint de Sintaxe

Valida formatação markdown via markdownlint-cli2. Se falhar com regras como `MD009`, `MD012`, `MD040`, avalie e corrija.

### Validação via Extensão markdownlint (VSCode)

**Pré-requisito:** extensão `DavidAnson.vscode-markdownlint` instalada.

A extensão usa o mesmo engine (markdownlint-cli2) e a mesma configuração (`.markdownlint.json`) que o CLI, oferecendo validação interativa:

1. **Lint do workspace:** `Ctrl+Shift+P` → `markdownlint.lintWorkspace` para escanear todos os `.md` do projeto
2. **Revisar problemas:** `Ctrl+Shift+M` para abrir o painel Problems e filtrar por warnings `MD###`
3. **Auto-fix:** `Ctrl+Shift+P` → `markdownlint.fixAll` ou Format Document (`Shift+Alt+F`) para corrigir violações automaticamente

### `pnpm run validate:manifests` — Validação de Manifestos

Confere YAMLs em `docs/05_manifests/screens/` contra JSON schemas. Erros exibem keywords que falharam (`type`, `required`, etc.).

## Fluxo de Execução

1. Se pedido genérico ("rode os testes", "valide tudo"): execute `pnpm run qa:all`
2. Interprete erros do console
3. Para erros em YAML: proponha o delta de correção
4. Para dead-links: identifique o caminho correto
5. Para User Stories: valide DoR, referências quebradas, alinhamento de status
