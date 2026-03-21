# Skill: rollback-module

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `rollback-module`

> **CUIDADO: Uso exclusivo para cenário de erro estratégico.**
> Ativar somente quando o `forge-module` gerou um módulo prematuramente ou incorretamente. NÃO use para ajustes de conteúdo — para isso, use `/project:create-amendment`. Este fluxo é destrutivo.

Permitir que a arquitetura recue um passo: destrói a documentação canônica gerada e reabre a User Story para ajustes.

## Argumento

$ARGUMENTS deve conter o ID do módulo e motivo (ex: `MOD-012 "especificação mudou"`). Se não fornecido, pergunte ao usuário.

Flags opcionais:
- `--dry-run` — apenas lista o que seria destruído, sem executar
- `--no-backup` — pula criação de backup (não recomendado)

## PASSO 1: Verificação de Segurança (Gate de Implementação)

Um módulo só pode sofrer rollback se **nenhum código técnico** (Fastify, Drizzle, rotas, testes) tiver sido gerado.

Verifique se existem arquivos em `apps/api/src/modules/{mod}/`. Se existirem, **aborte**: `"Módulo já possui código gerado. Rollback não é seguro — use git revert ou remova manualmente."`

Confirme com o usuário antes de prosseguir, listando o que será destruído:

```
## Rollback — MOD-{ID}

### Arquivos que serão destruídos:
- docs/04_modules/mod-{ID}-{nome}/ ({N} arquivos)

### User Stories que serão revertidas:
- US-MOD-{ID}-*.md → status alterado para TODO/REJECTED

Confirma? (sim/não)
```

Se `--dry-run`, exiba a lista acima e **pare** sem executar.

## PASSO 1.5: Backup (a menos que `--no-backup`)

Antes de destruir, crie um backup via git stash ou tag:

```bash
git stash push -m "rollback-mod-{ID}-backup" -- docs/04_modules/mod-{ID}-*/
```

Informe ao usuário: `"Backup criado em git stash. Para restaurar: git stash pop"`

## PASSO 2: Reversão da User Story

1. Encontre a User Story em `docs/04_modules/user-stories/features/` (ex: `US-MOD-{ID}-*.md`).
2. Altere `status_agil:` de `READY`/`DONE` para `TODO` ou `REJECTED`.
3. Adicione nota: `> Rollback executado em {Data}: {Motivo}`.

## PASSO 3: Destruição do Scaffold

1. Localize a pasta: `docs/04_modules/mod-{ID}-*`.
2. Delete toda a pasta e conteúdo.

## PASSO 4: Atualização do Índice Global

Após a exclusão, invoque `/project:update-index`:

- **Arquivo alvo:** `docs/INDEX.md`
- **Pasta a indexar:** `docs/04_modules/`

## Passo Final: Comunicação

Confirme que a pasta do módulo foi removida e a User Story retornou ao pipeline de ideação.
