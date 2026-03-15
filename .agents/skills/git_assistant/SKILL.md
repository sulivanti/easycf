---
name: git_assistant
description: Assistente de Git para uso integrado no EasyCodeFramework com suporte ao Português do Brasil (PT-BR) e UTF-8.
---

# Git Assistant Skill

Esta *Skill* define o comportamento que o agente de inteligência (você) deve adotar sempre que o usuário solicitar operações de `git`, salvamento de versão, sincronização, ou commits.

## Objetivos e Diretrizes Principais

1. **PT-BR Estrito**: Todas as mensagens de commit MUST serem redigidas em português do Brasil (PT-BR).
2. **UTF-8 Estrito**: Garanta que as chamadas no terminal para criação de arquivos ou leitura preservem a codificação UTF-8 para evitar "mojibake" com acentuações.
3. **Padrão Semantic / Conventional Commits**: Sempre use o padrão estruturado `<tipo>(<escopo opcional>): <descrição no imperativo>`. Ex: `feat: adiciona componente de alerta`.

## Scripts Existentes

Você tem três comandos principais disponíveis via `package.json` ou diretamente os scripts:

### 1. Commit Semântico (`npm run commit` ou `node .agents/scripts/git-semantic-commit.js`)

Use este comando ou imite seu comportamento (fazendo os passos no terminal diretamente ou invocando-o) quando o usuário disser "faça os commits" de forma detalhada e quiser aprovação por etapas das responsabilidades (ex: um commit para o banco de dados e outro para a UI). Se fizer via terminal interativo as vezes não funcionará perfeitamente para nós, agentes, devido a dependência de standard input iterativo. Portanto, como Agente, você pode **você mesmo rodar os comandos no terminal**, como:

```bash
git add .
git commit -m "feat(module): implementa nova funcionalidade em pt-br"
```

Lembre do `git status` antes.

### 2. Sincronização Privada (`npm run sync:private` ou `powershell .agents/scripts/git-sync-private.ps1`)

Use este comando quando o usuário pedir para:

- "salvar o dia"
- "comitar tudo do projeto privado"
- "fazer o sync completo"
Ele gerará um commit *chore* e empurrará para o remote origin atual.

**Como Invocar via Agente:** Use a tool `run_command` rodando no powershell:
`npm run sync:private`

### 3. Sincronização Pública (`npm run sync:public` ou `powershell .agents/scripts/git-sync-public.ps1`)

Use este comando quando o usuário:

- Pede para "sincronizar o público"
- Publicar as novas alterações no repositório template (open-source).

**Como Invocar via Agente:** Use a tool `run_command` rodando no powershell:
`npm run sync:public`

## Tarefas Comuns como Agente

1. **Ao finalizar de implementar algo grande:**
   O usuário diz: "Terminei essa User Story, faz o commit pra mim".
   **Você deve:** Analisar os arquivos, usar o formato `feat(US-MOD-000-F10): atualiza script e docs` (em PT-BR) e executar via `run_command`.

2. **Quando solicitado 'Sincronizar' sem especificar:**
   Assuma o `npm run sync:private` se ainda estivermos no meio do desenvolvimento de uma funcionalidade, ou pergunte ao usuário.
