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

1. Fazer o bump da versão no `package.json` do monorepo privado.
2. Clonar silenciosamente o repositório público `easycf-template` na pasta `dist/`.
3. Sincronizar o conteúdo atualizado para essa pasta.
4. Fazer o commit `"release: vX.Y.Z"` e criar a tag no repositório de distribuição.

## Publicar a Versão

O script não faz o push automático por segurança. Para efetivar o release:

### 1. No Repositório de Distribuição (Público)

```powershell
cd dist/easycf
git push && git push --tags
cd ../..
```

### 2. No Seu Monorepo (Privado)

```powershell
git push
```

## Testar o Scaffolding

Após o push, valide que o usuário final consegue baixar:

```powershell
# Em uma pasta temporária fora do repositório
npx degit sulivanti/easycf ceasy
```

## Manutenção de Versões Passadas (Hotfix)

Se precisar corrigir a `v1.0.0` enquanto está na `v2.0.0`:

1. `git checkout -b fix-v1.0 v1.0.0`
2. Aplique a correção.
3. `pnpm run release` (ele gerará a `v1.0.1`).
4. `git checkout main`.
