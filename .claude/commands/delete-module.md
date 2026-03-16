# Skill: delete-module

Remover de forma definitiva e governada toda a estrutura de documentação (pasta raiz) de um determinado Módulo em `docs/04_modules/`.

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `delete-module`

## Argumento

$ARGUMENTS deve conter o ID do módulo (ex: `MOD-005` ou apenas `005`). Se não fornecido, pergunte ao usuário.

## PASSO 1: Confirmação Destrutiva

Antes de executar, peça confirmação explícita: *"Tem certeza que deseja apagar o MOD-{ID} inteiro da documentação?"*

## PASSO 2: Execução

1. Localize a pasta exata do módulo: `docs/04_modules/mod-{ID}-*`.
2. Valide se a pasta existe.
3. Exclua o diretório inteiro e seus subdiretórios.

## PASSO 3: Atualização do Índice Global

> **IMPORTANTE:** Sem este passo, o `docs/INDEX.md` mantém referências quebradas.

Após a exclusão, invoque `/project:update-index`:

- **Arquivo alvo:** `docs/INDEX.md`
- **Pasta a indexar:** `docs/04_modules/`

## Passo Final: Comunicação

Avise o usuário que o módulo foi removido do projeto e que o `docs/INDEX.md` foi atualizado.
