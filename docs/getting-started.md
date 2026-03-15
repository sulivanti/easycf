# Getting Started

## Criando um novo projeto

Use `degit` para copiar o template do EasyCodeFramework para o seu novo projeto:

```bash
npx degit sulivanti/easycf meu-projeto
cd meu-projeto
```

O template inclui:

- Documentos Normativos (`docs/01_normativos/`)
- Skills de IA para automacao (`.agents/skills/`)
- User Stories e templates (`docs/04_modules/user-stories/`)
- Estrutura de governanca XP-Driven

## Workflow de Desenvolvimento

### 1. Defina User Stories

Crie suas User Stories em `docs/04_modules/user-stories/features/` usando o template em `docs/04_modules/user-stories/templates/TEMPLATE-USER-STORY.md`.

### 2. Scaffold de Modulos

Quando uma User Story estiver com `status_agil: READY`, peca ao agente de IA:

> "Faca scaffold do modulo X"

A skill `forge-module` criara toda a estrutura de documentacao do modulo em `docs/04_modules/mod-XXX-nome/`.

### 3. Itere sobre os Requisitos

Com o modulo scaffoldado, edite livremente os documentos enquanto estiverem em `estado_item: DRAFT`. Quando estabilizar, marque como `READY`.

### 4. Amendments para Mudancas Futuras

Documentos selados (`READY`) so podem ser alterados via amendments:

> "Crie uma emenda de melhoria para FR-001"

A skill `create-amendment` gerencia o versionamento automaticamente.

## Documentacao de Referencia

- `docs/01_normativos/DOC-DEV-001` — Template de Especificacao Executavel
- `docs/01_normativos/DOC-DEV-002` — Fluxo de Agentes e Governanca XP
- `docs/01_normativos/DOC-ESC-001` — Escala de Arquitetura (Niveis 0/1/2)
