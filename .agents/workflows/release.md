---
description: processo de release de nova versão do EasyCodeFramework (bump de versão, sync do template, git tag)
---

# Release do EasyCodeFramework

Este workflow documenta o processo completo para publicar uma nova versão do framework.

## Pré-requisitos

Antes de fazer o release, valide:

- [ ] Todos os testes passando (`pnpm lint`)
- [ ] As skills em `.agents/skills/` estão atualizadas
- [ ] Os normativos em `docs/01_normativos/` estão atualizados
- [ ] O `apps/template-project/` reflete o estado desejado do template
- [ ] O Git está limpo (sem changes não commitados) ou você commitou as mudanças do desenvolvimento

## Executar o Release

Escolha o tipo de bump conforme o que mudou:

| Tipo | Quando usar | Exemplo |
|---|---|---|
| **patch** | Correções e pequenas melhorias | `0.1.0 → 0.1.1` |
| **minor** | Novas funcionalidades retrocompatíveis | `0.1.0 → 0.2.0` |
| **major** | Quebra de compatibilidade | `0.1.0 → 1.0.0` |

// turbo

### Passo 1: Rodar o script de release (patch — padrão)

```powershell
pnpm run release
```

### Passo 2: (Alternativa) Minor release

```powershell
pnpm run release:minor
```

### Passo 3: (Alternativa) Major release

```powershell
pnpm run release:major
```

O script irá automaticamente:

1. Calcular a nova versão e atualizar o `package.json`
2. Popular `easyCF/` com os arquivos corretos do template
3. Fazer o commit `"release: vX.Y.Z"`
4. Criar o Git tag `vX.Y.Z`

## Publicar no GitHub

Após o script concluir com sucesso:

```powershell
git push && git push --tags
```

## Testar Localmente Antes do Push

Antes de publicar, valide que o template funciona:

```powershell
# Em uma pasta temporária fora do repositório
cd ..
npx degit sulivanti/EasyCodeFramework/easyCF teste-release
ls teste-release
```

Verifique que a pasta contém:

- `.agents/skills/` com todas as skills
- `docs/01_normativos/` com os normativos
- `package.json` com `{{project_name}}`
- `.cursorrules`
- `RELEASE.md` com a versão correta

## Após o Push — O que o Usuário Vê

```bash
# Versão mais recente (branch main)
npx degit sulivanti/EasyCodeFramework/easyCF meu-app

# Versão específica (via Git tag)
npx degit sulivanti/EasyCodeFramework/easyCF#v0.2.0 meu-app
```
