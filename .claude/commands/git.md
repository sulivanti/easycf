# Skill: git_assistant

Assistente Git com suporte a commits semânticos em PT-BR, release automatizado e sincronização multi-repo para o EasyCodeFramework.

## Argumento

$ARGUMENTS pode conter a ação desejada (ex: `commit`, `release`, `release:minor`, `push`). Se não fornecido, analise o contexto.

## Diretrizes

1. **PT-BR Estrito**: Todas as mensagens de commit em português do Brasil
2. **UTF-8 Estrito**: Preservar codificação UTF-8 para evitar mojibake
3. **Semantic Commits**: Formato `<tipo>(<escopo>): <descrição no imperativo>` (ex: `feat: adiciona componente de alerta`)
4. **Não incluir arquivos sensíveis**: Nunca commitar `.env`, `credentials.json`, imagens soltas no root (`*.png`, `*.jpg`), `deploy-update.txt`

## Repositórios

| Alias | URL | Descrição |
|-------|-----|-----------|
| **origin** (privado) | `github.com/sulivanti/EasyCodeFramework` | Monorepo completo de desenvolvimento |
| **easycf** (público) | `github.com/sulivanti/easycf` | Template de distribuição open-source |

## Comandos Disponíveis

### 1. Commit Semântico (`commit`)

Analise `git status` e `git diff --stat`, agrupe as mudanças por tema e crie um ou mais commits semânticos.

**Tipos válidos:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

**Formato da mensagem:**
```
<tipo>(<escopo>): <descrição imperativo PT-BR>

<corpo opcional — o que mudou e por quê>

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```

**Regras de staging:**
- Prefira `git add <arquivos específicos>` a `git add .`
- Exclua: `.claude/settings.local.json`, imagens soltas no root, `deploy-update.txt`
- Ao commitar docs + código juntos, use o tipo do código (ex: `fix`) e mencione docs no corpo

### 2. Release (`release`, `release:minor`, `release:major`)

O release é **100% automatizado** via `pnpm run release`. O script `.agents/scripts/release.mjs`:

1. Lê a versão atual do `package.json` root
2. Faz bump semântico (patch/minor/major)
3. Clona o repo público em `dist/easycf`
4. Copia template consolidado (docs, agents, configs)
5. Cria commit + tag `vX.Y.Z` no repo público
6. Atualiza `package.json` e cria commit de bump no repo privado

**Fluxo completo de release:**

```text
1. Commitar mudanças pendentes (commit semântico)
2. pnpm run release              ← patch (default)
   pnpm run release:minor        ← minor
   pnpm run release -- major     ← major
3. Push privado:  git push origin main
4. Push público:  cd dist/easycf && git push && git push --tags && cd ../..
```

**Quando usar cada bump:**

| Bump | Quando | Exemplo |
|------|--------|---------|
| `patch` (default) | Bugfix, correção, ajuste pontual | `fix: corrige tenant_id vazio` |
| `minor` | Nova feature, novo módulo, melhoria significativa | `feat: implementa MOD-003 org-units` |
| `major` | Breaking change, reestruturação arquitetural | Migração de framework |

**Regra importante:** O script NÃO faz push automaticamente. Após o release, SEMPRE execute os pushes para ambos os repos. Se o usuário pedir "release", execute o fluxo completo incluindo os pushes.

### 3. Push (`push`)

Push simples para o repositório privado (sem release):

```bash
git push origin main
```

Usar quando: mudanças já commitadas, sem necessidade de release/tag.

## Fluxo de Decisão

```text
Usuário pede para...
├── "commitar" / "salvar" / "commit"
│   → Comando 1 (commit semântico)
│
├── "release" / "versionar" / "publicar" / "atualizar repositórios"
│   → Comando 2 (release completo)
│   → Inclui: commit pendentes + pnpm run release + push privado + push público
│
├── "push" / "enviar" / "sincronizar"
│   → Se há commits não-pushados: Comando 3 (push)
│   → Se há mudanças não-commitadas: Comando 1 + Comando 3
│
├── "release minor" / "nova feature"
│   → Comando 2 com `pnpm run release:minor`
│
└── Contexto ambíguo
    → Pergunte: "Deseja apenas commitar, ou fazer release completo com versão e push?"
```

## ⛔ PROIBIÇÕES — Releases

1. **NUNCA fazer release manual** — deletar arquivos e commitar "release: vX.Y.Z" manualmente é PROIBIDO. SEMPRE usar `pnpm run release` que opera numa pasta isolada (`dist/easycf`) sem tocar no working tree.
2. **NUNCA deletar arquivos do repo privado para "preparar" o release público** — o script `release.mjs` copia APENAS os arquivos necessários para o template. O repo privado mantém TODOS os arquivos.
3. **NUNCA usar `git add -A` ou `git add .` em commits de release** — isso pode incluir deleções acidentais.

### Histórico de incidente
Em v0.20.0, um release manual deletou 1.298 arquivos (incluindo o próprio `release.mjs`), destruindo o módulo Foundation inteiro e quebrando 7 módulos dependentes. O procedimento correto (`pnpm run release`) teria evitado isso completamente.

## Checklist pré-release

Antes de executar o release, verifique:

1. `git status` — sem mudanças não-commitadas (ou commite primeiro)
2. `pnpm -F @easycode/api build` — build passa sem erros
3. Branch é `main` — releases sempre partem de main
4. `.agents/scripts/release.mjs` existe — se não existir, restaurar via git antes de prosseguir
5. **CONFIRMAR**: vou usar `pnpm run release`, NÃO vou fazer commit manual de release

## Fallback — Se `release.mjs` não existir

Se o script foi deletado acidentalmente:
1. Restaurar: `git show 3c045c6:.agents/scripts/release.mjs > .agents/scripts/release.mjs`
2. Commitar a restauração: `git add .agents/scripts/release.mjs && git commit -m "fix: restaura release.mjs deletado acidentalmente"`
3. Só então executar o release: `pnpm run release`
