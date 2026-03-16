# {{project_name}}

> Projeto gerado a partir do **EasyCodeFramework (ECF)**.
> Este repositorio herda as politicas de Governanca, Documentacao Normativa e Automacao por Agentes do framework base.

---

## O que e o ECF?

O EasyCodeFramework e um **framework de documentacao, governanca e automacao por agentes/skills**. Ele fornece:

- **Documentos Normativos** (`docs/01_normativos/`) — padroes de arquitetura, seguranca, testes e observabilidade
- **Skills de IA** (`.claude/commands/`) — automacao para scaffolding de modulos, validacao, amendments e mais
- **Workflow XP-Driven** — separacao entre velocidade agil (User Stories) e estabilidade tecnica (Especificacoes)

---

## Estrutura do Projeto

```
{{project_name}}/
├── .agents/
│   └── skills/          # Skills de automacao para agentes de IA
├── docs/
│   ├── 01_normativos/   # Documentos normativos canonicos
│   ├── 02_pacotes_agentes/  # Pacotes de agentes
│   ├── 03_especificacoes/   # Templates de especificacao
│   ├── 04_modules/      # Modulos, User Stories e requisitos
│   └── 05_manifests/    # Manifestos de tela (UI)
└── README.md
```

---

## Como Trabalhar

### 1. Defina User Stories

Crie suas User Stories em `docs/04_modules/user-stories/features/` seguindo o template padrao.

### 2. Use as Skills do Agente

No chat do seu editor (Cursor, VS Code + Claude Code, etc.), peca ao agente:

- *"Faca scaffold do modulo de Faturamento"* — usa a skill `forge-module`
- *"Crie uma emenda para FR-001"* — usa a skill `create-amendment`
- *"Valide os schemas Drizzle"* — usa a skill `validate-drizzle-schemas`

### 3. Siga o Fluxo XP

```
User Story (TODO) → READY → forge-module → DRAFT (editar livremente)
                                              ↓
                                    Codificar + Testar
                                              ↓
                              Specs READY (seladas) → Amendments para mudancas futuras
```

---

## Documentacao

Consulte os normativos em `docs/01_normativos/` para padroes obrigatorios:

- **DOC-DEV-001** — Especificacao Executavel (template de modulo)
- **DOC-DEV-002** — Fluxo de Agentes e Governanca XP
- **DOC-ESC-001** — Escala de Arquitetura (Niveis 0, 1, 2)
- **DOC-ARC-001** — Padroes OpenAPI
- **DOC-ARC-002** — Estrategia de Testes
