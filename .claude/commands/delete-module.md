# Skill: delete-module

Remover de forma definitiva e governada toda a estrutura de documentação (pasta raiz) de um determinado Módulo em `docs/04_modules/`.

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `delete-module`

> **CUIDADO: Operação destrutiva e irreversível (sem backup).** Para erros de scaffold recente, prefira `/rollback-module` que preserva backup via git stash.

## Argumento

$ARGUMENTS deve conter o ID do módulo (ex: `MOD-005` ou apenas `005`). Se não fornecido, pergunte ao usuário.

Flags opcionais:
- `--dry-run` — apenas lista o que seria destruído, sem executar
- `--no-backup` — pula criação de backup (não recomendado)
- `--force` — pula verificação de dependentes (usar com extrema cautela)

## PASSO 1: Verificação de Dependentes

Antes de destruir, verifique se outros módulos dependem deste:

1. Leia cada manifesto de módulo em `docs/04_modules/mod-*/mod-*.md`
2. Procure referências ao módulo alvo na seção de dependências e em `rastreia_para`
3. Se encontrar dependentes:

```
## Bloqueio — MOD-{ID} é dependência de outros módulos

Módulos que dependem de MOD-{ID}:
- MOD-006 (Seção 4. Dependências: "depende de MOD-005 para blueprints")
- MOD-008 (Seção 4. Dependências: "depende de MOD-005 para rotinas")

Não é seguro deletar. Use --force para ignorar (não recomendado).
```

Se `--force`, continue com aviso. Caso contrário, **aborte**.

## PASSO 2: Inventário e Confirmação

Liste todo o conteúdo que será destruído:

```
## Exclusão — MOD-{ID}

### Arquivos que serão destruídos:
- docs/04_modules/mod-{ID}-{nome}/ ({N} arquivos, {N} subdiretórios)
  - mod-{ID}-{nome}.md (manifesto do módulo)
  - CHANGELOG.md
  - requirements/ ({N} arquivos)
  - adr/ ({N} arquivos)
  - amendments/ ({N} arquivos)

### Manifests associados:
- docs/05_manifests/screens/ux-{entity}-*.yaml ({N} arquivos)

### User Stories associadas:
- docs/04_modules/user-stories/features/US-MOD-{ID}-*.md ({N} arquivos)

Confirma exclusão definitiva? (sim/não)
```

Se `--dry-run`, exiba o inventário e **pare** sem executar.

## PASSO 3: Backup (a menos que `--no-backup`)

Antes de destruir, crie backup via git stash:

```bash
git stash push -m "delete-mod-{ID}-backup" -- docs/04_modules/mod-{ID}-*/
```

Informe ao usuário: `"Backup criado em git stash. Para restaurar: git stash pop"`

## PASSO 4: Execução

1. Exclua o diretório do módulo: `docs/04_modules/mod-{ID}-*/`
2. Exclua manifests associados em `docs/05_manifests/screens/` (se existirem)
3. **NÃO exclua** user stories — apenas marque como `REJECTED` com nota: `> Módulo MOD-{ID} deletado em {Data}.`

## PASSO 5: Atualização do Índice Global

> **IMPORTANTE:** Sem este passo, o `docs/INDEX.md` mantém referências quebradas.

Após a exclusão, invoque `/project:update-index`:

- **Arquivo alvo:** `docs/INDEX.md`
- **Pasta a indexar:** `docs/04_modules/`

## Passo Final: Comunicação

Avise o usuário:
- Módulo removido do projeto
- `docs/INDEX.md` atualizado
- Backup disponível via `git stash list` (se criado)
- User stories marcadas como REJECTED (não deletadas)
