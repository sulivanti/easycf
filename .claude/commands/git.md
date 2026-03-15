# Skill: git_assistant

Assistente Git com suporte a commits semânticos em PT-BR e UTF-8 para o EasyCodeFramework.

## Argumento

$ARGUMENTS pode conter a ação desejada (ex: `commit`, `sync:private`, `sync:public`). Se não fornecido, analise o contexto.

## Diretrizes

1. **PT-BR Estrito**: Todas as mensagens de commit em português do Brasil
2. **UTF-8 Estrito**: Preservar codificação UTF-8 para evitar mojibake
3. **Semantic Commits**: Formato `<tipo>(<escopo>): <descrição no imperativo>` (ex: `feat: adiciona componente de alerta`)

## Comandos Disponíveis

### 1. Commit Semântico

Use `pnpm run commit` ou execute diretamente:

```bash
git status
git add .
git commit -m "feat(module): implementa nova funcionalidade em pt-br"
```

Tipos válidos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`, `revert`

### 2. Sincronização Privada (`pnpm run sync:private`)

Usar quando: "salvar o dia", "comitar tudo do projeto privado", "fazer sync completo"
Gera commit `chore` e pusha para o remote origin.

### 3. Sincronização Pública (`pnpm run sync:public`)

Usar quando: "sincronizar o público", "publicar alterações no template"
Sincroniza com repositório público open-source.

## Fluxo de Decisão

1. **Ao finalizar implementação:** Analise arquivos, use formato `feat(US-MOD-XXX-FYY): descrição` e execute
2. **"Sincronizar" sem especificar:** Assuma `sync:private` se em desenvolvimento, ou pergunte
3. **Release:** Use `pnpm run release` seguido de `sync:public` e `sync:private`
