# Plano Estratégico: EasyCodeFramework (ECF)

## Visão Geral e Arquitetura do Monorepo

O ECF operará como um monorepo gerenciado por **pnpm workspaces** e **TurboRepo**. Isso proporciona extrema agilidade para desenvolver os pacotes do framework enquanto os testamos simultaneamente em uma aplicação "cliente" embutida no próprio repositório (o `playground`).

### Estrutura de Diretórios Detalhada

```text
EasyCodeFramework/
├── pnpm-workspace.yaml
├── turbo.json
├── package.json (root)
│
├── apps/
│   └── playground/                → Aplicação de teste "Dummy App" para validar o framework em tempo real
│       ├── src/
│       │   ├── index.ts           → Monta o app usando o createApp() do @easycf/core-api
│       │   └── db/schema.ts       → Estende os schemas do @easycf/db-schemas
│       └── package.json           → Consome os pacotes locais do workspace
│
├── packages/
│   ├── core-api/                  → Pilar 1: O "Motor" do ECF (npm package)
│   │   ├── src/
│   │   │   ├── bootstrap/         → createApp(config), factory do Fastify
│   │   │   ├── plugins/           → JWT, Swagger, Rate Limit configuráveis
│   │   │   ├── middlewares/       → correlationId, tenantParsing
│   │   │   └── handlers/          → Error handler padronizado RFC 9457
│   │   └── package.json           → (Dependências: fastify, zod, drizzle como *peerDependencies*)
│   │
│   ├── db-schemas/                → Tabelas base multi-tenant
│   │   ├── src/
│   │   │   ├── tenants.schema.ts
│   │   │   └── users.schema.ts
│   │   └── package.json
│   │
│   ├── module-auth/               → Módulo de Autenticação plug-and-play (Opcional)
│   └── module-iam/                → Módulo de RBAC / Permissões (Opcional)
│
├── tooling/                     
│   ├── normative-docs/            → Pilar 2: Templates Markdown 
│   │   ├── 01_normativos/         → Regras do projeto parametrizadas {{project_name}}
│   │   └── 04_modules/            → Estrutura boilerplate de um módulo
│   │
│   ├── agent-skills/              → Pilar 3: Skills do Antigravity
│   │   ├── scaffold-module/
│   │   ├── validate-drizzle-schemas/
│   │   └── package.json           → Manifest das skills com versionamento
│   │
│   └── cli/                       → CLI do ECF (npx easycf)
│       ├── src/
│       │   ├── commands/
│       │   │   ├── init.ts        → Scaffold de um novo projeto (copia docs e skills)
│       │   │   └── update.ts      → Atualiza skills normativas em projetos existentes
│       │   └── index.ts
│       └── package.json
└── docs/                          → Documentação pública do ECF
```

---

## Estratégia de Distribuição via Git e Documentação

Para garantir uma adoção sem atrito, a criação de novos projetos seguirá primordialmente o modelo de **Repositório Template (Git Clone)** acelerado.

1. **Repositório/Template Base:** O ECF fornecerá uma aplicação boilerplate final (ex: a pasta `apps/template-project` ou um repositório satélite) que integrará todos os pilares (Core, Skills e Docs normativos). Cada novo projeto nascerá de um `git clone` desse repositório base.
2. **Documentação Viva e Rica (READMEs):** Como a porta de entrada do dev será o repositório clonado (o GitHub/Lab corporativo), a primeira impressão precisa ser cirúrgica.
   * **README do Template:** Extremamente visual e instrutivo abordando: "Como inicializar o ambiente de dev", "Como usar o Antigravity para criar o 1º módulo", "Onde ficam as configurações de banco/Drizzle", e a "Visão geral da Arquitetura do Sistema".
   * **READMEs dos Pacotes do Framework:** Cada pacote (`@easycf/core-api`, `@easycf/module-iam`) deverá ter detalhado na sua raiz *Por Que Existe*, *Como Usar* e *Configurações Injetáveis*.
   * **Automação via Skill:** O template incluirá nativamente a skill `readme-blueprint-generator`, permitindo que os próprios agentes mantenham a documentação corporativa atualizada ao passo que os devs modificam o novo projeto.

---

## Roadmap de Execução Detalhado (Faseado)

### 🚀 Fase 0: Fundação do Ecossistema (Estimativa: 1-2 dias)

**Objetivo:** Criar a infraestrutura base do monorepo e garantir que os pacotes consigam conversar entre si.

1. Inicialização do Monorepo (pnpm-workspace.yaml, turbo.json, package.json root).
2. Criação de pacotes de configurações compartilhadas (`@easycf/tsconfig`, `@easycf/eslint-config`).
3. Criação do `apps/playground` como laboratório de testes interno.

### 📦 Fase 1: Desacoplamento do Pilar 1 - Core API (Estimativa: 3-5 dias)

**Objetivo:** Extrair as maravilhas técnicas do EasyA2 para pacotes reutilizáveis npm.

1. Extrair `createApp(options)` e middlewares/plugins para `@easycf/core-api`.
2. Extrair tabelas núcleo (Tenant, User) para `@easycf/db-schemas`.
3. Testar a importação no `apps/playground`.

### 📄 Fase 2: Git Template, CLI e Governança (Estimativa: 3-4 dias)

**Objetivo:** Criar a estrutura base que será alvo do `git clone`, eliminar o "copia e cola" e parametrizar a documentação (READMEs e Normativos).

1. **Criação do App de Template:** Montar o repositório base que consumirá o `@easycf/core-api` e servirá de origem para novos projetos.
2. **Escrita dos READMEs Instrucionais (Rich Docs):** Escrever a documentação detalhada apontando o fluxo "do Zero ao Deploy", a ligação com os agentes e as políticas baseantes.
3. **Parametrização de Documentos Normativos:** Substituir identificadores explícitos (ex: "EasyA2") por variáveis (`{{project_name}}`) nos templates `01_normativos`.
4. **CLI (Acelerador):** Criar pacote `@easycf/cli` com o comando `init` que simplesmente clona a branch de template, roda o `npm install` e injeta as variáveis no `README.md` recém clonado.

### 🤖 Fase 3: Extração do Pilar 3 - Skills de Agente IA (Estimativa: 3 dias)

**Objetivo:** Garantir que o cérebro do Antigravity possa ser distribuído para novos projetos como um ativo.

1. Limpar hardcodings (ex: paths absolutos do EasyA2) nas 14 skills atuais.
2. Embutir distribuição das skills no fluxo do `eascyf init`.
3. Criar versionamento das skills para atualizações futuras (`easycf update-skills`).

### 🔌 Fase 4: Opcionalidade via Módulos Prontos (Estimativa: 4-6 dias)

**Objetivo:** Opcionalizar áreas completas de negócio.

1. `@easycf/module-auth` (Roteamento de login, refresh, guards).
2. `@easycf/module-iam` (Roles, Permissões, RBAC extensível).

### 🌐 Fase 5: Entrega, Documentação e Golden Path (Estimativa: 2-3 dias)

**Objetivo:** Polimento da documentação oficial do framework e primeira implantação oficial via Git.

1. **Revisão Final dos READMEs:** Garantir que todos os componentes (`@easycf/*`) e o Template Base tenham guias visuais e exemplos de uso impecáveis para leitura rápida e autossuficiente no portal git.
2. **Simulação da Primeira Experiência (Dev Ex):** Rodar um "mock test" imitando o onboarding de um novo desenvolvedor (apenas fazendo `git clone` e seguindo o README mestre).
3. **Publicação / Push Oficial:** Subir os templates, READMEs e o monorepo para o servidor de versionamento corporativo.
4. **Teste derradeiro (Migrar EasyA2):** Refatorar o projeto original do EasyA2 para remover seus arquivos extraídos e usar o ECF no seu lugar.
