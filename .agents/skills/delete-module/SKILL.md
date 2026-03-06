---
description: Exclui fisicamente a pasta de um módulo inteiro da arquitetura. Usado para limpeza de testes ou descontinuação. Triggers: "excluir módulo", "apagar MOD-XXX", "delete module".
---

# Skill: delete-module

## Objetivo

Remover de forma definitiva e governada toda a estrutura de documentação (pasta raiz) de um determinado Módulo em `docs/04_modules/`. Ideal para apagar rastros de testes ou remover sistemas legados da arquitetura.

---

## 1. Gatilhos

- "excluir módulo"
- "apagar o MOD-XXX"
- "remover módulo de teste"

## 2. PASSO 1: Confirmação Destrutiva

Antes de executar, peça confirmação explícita se o fluxo não for automatizado: *"Tem certeza que deseja apagar o MOD-{ID} inteiro da documentação?"*

---

## 3. PASSO 2: Execução

1. Localize a pasta exata do módulo: `docs/04_modules/mod-{ID}-*`.
2. Valide se a pasta existe usando os comandos correspondentes.
3. Exclua o diretório inteiro e seus subdiretórios com comandos de terminal. No Windows/Powershell: `Remove-Item -Recurse -Force "docs/04_modules/mod-{ID}-*"`. Em ambientes Unix: `rm -rf docs/04_modules/mod-{ID}-*`.

---

## 4. PASSO 3: Atualização do Índice Global (update-markdown-file-index)

> [!IMPORTANT]
> Este passo é obrigatório. Sem ele, o `docs/INDEX.md` mantém referências quebradas para uma pasta que não existe mais.

Após a exclusão, **invoque a skill `update-markdown-file-index`**:

- **Arquivo alvo:** `docs/INDEX.md`
- **Pasta a indexar:** `docs/04_modules/`

Isso garante que o índice raiz reflita a remoção do módulo e não apresente links mortos.

---

## Passo Final: Comunicação

Avise o usuário que o módulo foi extirpado do projeto e que o `docs/INDEX.md` foi atualizado.
