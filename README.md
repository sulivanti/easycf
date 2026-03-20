# EasyCodeFramework 🚀

O **EasyCodeFramework (ECF)** é a fundação para criação e gestão de APIs transacionais escaláveis com Node.js, empoderado por skills nativas de Inteligência Artificial usando Antigravity.

Este projeto visa estabelecer padrões rigorosos de desenvolvimento, arquitetura em níveis (Clean Architecture e DDD-lite) e automações nativas para um ecossistema sólido e previsível de APIs e interfaces web.

Atualmente, o projeto foca no refinamento de seus módulos normativos e na geração de código a partir das especificações aprovadas.

---

## Stack Tecnológico

A tecnologia base escolhida preconiza alta performance e tipagem rigorosa:

- **Runtime e Ferramentas:** Node.js (v20 Alpine), pnpm (Corepack), tsx.
- **Framework Web/API (Recomendado):** Fastify v4.29.x
- **Gestão de Banco e ORM (Recomendado):** PostgreSQL 17, Drizzle ORM (driver nativo `postgres`), redis 7 (ioredis).
- **Mapeamento e Validação:** Zod.
- **Autenticação e Segurança:** `@fastify/jwt@8.x`, `@fastify/oauth2@7.x`, `@fastify/rate-limit`, `otplib@12.x`.
- **Containers:** Docker & Docker Compose (separação explícita entre Infraestrutura e Aplicação).

> **Fonte:** `DOC-PADRAO-001` e `DOC-PADRAO-002`.

---

## Arquitetura

O ecossistema adota uma Escala de Arquitetura em Níveis (0, 1 e 2), escalando em complexidade conforme a criticidade e complexidade do negócio:

- **Nível 0 (CRUD Direto):** Para rotas sem regra de negócio aparente. Cerimônia mínima.
- **Nível 1 (Clean Leve):** Recomendado como padrão. Separa Presentation, Application e Infraestrutura. Traz interfaces onde Mocks são necessários para teste.
- **Nível 2 (DDD Completo):** Para domínios core onde a integridade transacional é máxima (Domain com Entidades, VOs, Aggregates, Eventos e Invariantes explícitas).

**Pilares Inegociáveis End-to-End:**

- **Observabilidade:** Obrigatório uso e propagação de `X-Correlation-ID`. Logs são estruturados sem vazamento de PII.
- **Contratos (API HTTP):** Problem Details (RFC 9457) mandatórios para falhas, URIs sempre versionadas (`/api/v1/...`).
- **Resiliência:** Idempotência exigida em todas requisições com mutação lateral importante (Gatilhos Financeiros, Workflows, Disparo E-mail).

> **Fonte:** `DOC-ESC-001`.

---

## Modulos

| Modulo | Epico | Nivel | Status |
| --- | --- | --- | --- |
| **MOD-000 — Foundation** | [US-MOD-000](docs/04_modules/user-stories/epics/US-MOD-000.md) | N2 | `DRAFT` |
| **MOD-001 — Backoffice Admin** | [US-MOD-001](docs/04_modules/user-stories/epics/US-MOD-001.md) | N1 | `DRAFT` |
| **MOD-002 — Gestao de Usuarios** | [US-MOD-002](docs/04_modules/user-stories/epics/US-MOD-002.md) | — | `READY` |
| **MOD-003 — Estrutura Organizacional** | [US-MOD-003](docs/04_modules/user-stories/epics/US-MOD-003.md) | N2 | `DRAFT` |
| **MOD-004 — Identidade Avancada** | [US-MOD-004](docs/04_modules/user-stories/epics/US-MOD-004.md) | N2 | `DRAFT` |
| **MOD-005 — Modelagem de Processos** | [US-MOD-005](docs/04_modules/user-stories/epics/US-MOD-005.md) | N2 | `DRAFT` |

> *Para um indice completo das funcionalidades, ver `docs/INDEX.md`.*

---

## Primeiros Passos (Getting Started)

### 1. Pré-Requisitos

- **Docker** e **Docker Compose**
- **Node.js** (v20+)
- **pnpm** habilitado (`corepack enable`)

### 2. Configurando as Variáveis de Ambiente

No **EasyCodeFramework**, há **apenas um `.env` centralizado na raiz do repositório**.

```bash
cp .env.example .env
```

Gere os segredos faltantes (`JWT_SECRET`, credenciais de banco, provedores SSO). Se houver discrepâncias de inicialização relativas ao `.env`, ocorreu a política de **Fail-Fast** devido às exigências de esquema (via Zod no boot).

### 3. Rodando o Ambiente Local

Suba a infraestrutura base de banco de dados (Postgres) e cache (Redis) via Docker:

```bash
docker compose up -d
```

Em seguida, instale as dependencias do monorepo:

```bash
pnpm install
```

> **Fonte:** `DOC-PADRAO-001` e `DOC-PADRAO-004`.

---

## Automação de Qualidade (QA)

O projeto consolida diversas rotinas estáticas e validações de documentação em uma única pipeline via npm scripts:

- **`pnpm run qa:all`:** Master Quality Gate. Roda lint de documentação, lint de Markdown e validação de esquemas JSON nos manifestos YAML de forma consecutiva, exibindo apenas os retornos úteis sobre itens com defeito (falha de tipagem, links mortos em `.md`).
- **`pnpm run lint:docs`:** Busca referências de *dead-links* entre os documentos canônicos da especificação na pasta `docs/`.
- **`pnpm run lint:markdown`:** Valida formatação Markdown em todos os arquivos `.md` do projeto via `markdownlint-cli2`.
- **`pnpm run validate:manifests`:** Audita dinamicamente todos os manifestos de UI (`05_manifests/screens`) em conformidade estrita aos esquemas versionados via Ajv.

> 🤖 **Dica para Agentes:** Caso exista alguma inconsistência nos arquivos Markdown (ex: *links quebrados* após rename) ou um arquivo `YAML` fora do modelo, acione a skill **`qa_assistant`** ou rode `pnpm run qa:all` no terminal para relatar os problemas ao desenvolvedor.

---

## Padrões de Desenvolvimento

- **Zero Alucinação / Padrões Declarativos:** Utilize sempre o [DOC-DEV-001_especificacao_executavel.md](docs/01_normativos/DOC-DEV-001_especificacao_executavel.md) para redigir ou codificar comportamentos.
- **Testes (DOC-ARC-002):** A cobertura do código deve abranger os Use Cases puramente em memória (Testes Unitários sem mock de I/O) e roteiras de integração com banco **real** (Testcontainers, postgres efêmero). É **proibido mockar UseCases e repositórios em testes de API E2E**.
- **Gestao Eficiente:** Dependencias e automacoes sao organizadas via pnpm Workspaces.

---

## Fluxo de Contribuição e Agentes

A automação arquitetural orientada a Inteligência Artificial (Antigravity) permeia este ecossistema. O fluxo completo está descrito em `DOC-DEV-002`.

**O Processo (Ciclo de Vida):**

1. **User Story (US):** Cria-se/aprova-se o requisito de negócio na pasta `user-stories/features/`.
2. **Geração Baseline:** Uma vez que essa US alcança o status `READY`, usufrui-se de rotinas automáticas de agentes (`forge-module`) que fundem essa US aos contratos obrigatórios (`DOC-DEV-001`), forjando o boilerplate (schemas, queries, routes, handlers em níveis 0/1/2).
3. **Evolução Segura (Amendments):** Códigos ou regras alteradas após aprovação inicial nunca sobressaem silenciosamente nos documentos. Documenta-se em Emendas — Improvements (M), Correções (C) e Revisões (R) via skill `create-amendment`.

As **Agent Skills** repousam fisicamente em `.claude/commands/`.

---

## Agent Skills (Antigravity)

Todas as skills ficam em `.claude/commands/`. Para utilizá-las, basta pedir ao agente de IA no chat do editor (ou usar `/nome-da-skill`). Abaixo, cada skill com seu propósito, quando usar e exemplos de prompt.

### Gestão de Módulos

#### `forge-module`

Gera a estrutura completa de documentação de um novo módulo (MOD-XXX) a partir de uma User Story aprovada. Lê obrigatoriamente DOC-DEV-001 e DOC-DEV-002 para garantir conformidade.

**Quando usar:** Quando uma User Story atinge `status_agil: READY` e o módulo precisa ser scaffoldado.

**O que gera:**

- Pasta `docs/04_modules/mod-{ID}-{nome}/` com todas as subpastas
- Stubs de requisitos: `BR-`, `FR-`, `DATA-`, `SEC-`, `UX-`, `NFR-`
- `mod.md`, `CHANGELOG.md`, `CONVENTIONS.md`, `permissions.yaml`
- Pastas `amendments/`, `adr/`, `diagrams/`, `snippets/`
- Todos os documentos com `estado_item: DRAFT`

**Exemplos:**

```text
"Forge module para US-MOD-020 de relatórios financeiros"
"Scaffold do novo módulo de gestão de contratos"
"Criar a estrutura do MOD-015"
```

---

#### `delete-module`

Remove fisicamente todo o diretório de um módulo da documentação. Usado para limpeza ou descontinuação.

**Quando usar:** Quando um módulo foi descontinuado ou precisa ser removido definitivamente.

**Exemplos:**

```text
"Apagar o MOD-005 da documentação"
"Excluir completamente o módulo de teste"
```

---

#### `rollback-module`

Desfaz a geração de um módulo (`forge-module`), deletando a pasta de documentação e retornando a User Story original para `TODO` ou `REJECTED`.

**Quando usar:** Quando o `forge-module` foi executado prematuramente ou com especificação incorreta. Somente se nenhum código técnico foi escrito ainda.

**Exemplos:**

```text
"Fazer rollback do MOD-012"
"Desfazer scaffold porque a especificação mudou"
"Reprovar o módulo de pagamentos"
```

---

### Documentação e Especificações

#### `create-amendment`

Cria uma emenda governada para especificações que já estão em estado `READY`. Nunca edita o documento original — cria um delta versionado.

**Quando usar:** Quando precisa alterar, detalhar ou corrigir uma especificação selada (`READY`). Existem 3 tipos:

- **M (Melhoria):** Adiciona funcionalidade ou detalha comportamento existente
- **C (Correção):** Corrige erro factual ou bug na especificação
- **R (Revisão):** Esclarece sem alterar comportamento

**O que gera:** Arquivo `{ID}-{Tipo}{NN}.md` (ex: `FR-001-M02.md`) na pasta `amendments/`. Atualiza o documento base, `mod.md` e `CHANGELOG.md`.

**Exemplos:**

```text
"Criar emenda para FR-101 detalhando o novo fluxo de exportação"
"Adicionar melhoria na regra de negócio BR-003"
"Corrigir erro na especificação SEC-001"
```

---

#### `create-specification`

Cria uma nova especificação técnica para contratos que NÃO pertencem a módulos (cache, eventos de domínio, integrações externas, observabilidade).

**Quando usar:** Para especificar contratos técnicos transversais. **Não usar para módulos** — para módulos, use `forge-module`.

**Exemplos:**

```text
"Criar especificação para estratégia de cache do módulo de produtos"
"Especificar padrão de eventos de domínio para auditoria"
"Documentar contrato de integração com sistema de faturamento externo"
```

---

#### `update-specification`

Atualiza uma especificação existente. Se a spec está dentro de `docs/04_modules/`, delega automaticamente para `create-amendment`.

**Quando usar:** Para atualizar especificações genéricas (fora de módulos). Nunca edite specs de módulo diretamente.

**Exemplos:**

```text
"Atualizar a spec do carrinho com novos requisitos"
"Adicionar nova regra na especificação de cache"
```

---

#### `create-oo-component-documentation`

Gera documentação técnica padronizada para componentes OO (handlers Fastify, repositórios Drizzle, services, middlewares).

**Quando usar:** Ao gerar código backend ou quando precisar documentar componentes existentes.

**O que gera:** Documentação completa com diagramas Mermaid, referência de interfaces, exemplos de uso e validação de contratos arquiteturais (RBAC, RFC 9457, Correlation ID, Multi-Tenant).

**Exemplos:**

```text
"Documentar o repositório ItemRepository do módulo de pedidos"
"Gerar documentação técnica para o handler de autenticação"
"Doc do serviço de integração com gateway de pagamento"
```

---

#### `readme-blueprint-generator`

Gera ou atualiza o `README.md` analisando normativos, módulos e manifestos do projeto.

**Quando usar:** No onboarding de novos desenvolvedores, após ciclo de entrega, ou quando o README está desatualizado. Frequência sugerida: a cada 2-3 módulos entregues.

**Exemplos:**

```text
"Gerar README do projeto"
"Atualizar README para os novos módulos"
"Documentar para novos devs entrando na equipe"
```

---

### Validação e Qualidade

#### `validate-drizzle-schemas`

Valida schemas Drizzle ORM contra as regras fundamentais do projeto: isolamento multi-tenant, anti-patterns, integração Zod, audit trail, soft-delete e domain events.

**Quando usar:** Obrigatório após criar ou modificar qualquer schema de banco de dados.

**O que valida:**

- Nunca recriar entidades base (users, tenants, sessions) — usar FK
- Toda query filtra por `tenant_id` no SQL (nunca em memória)
- Exportar Zod schemas via `createInsertSchema` e `$inferSelect`
- Tabelas de negócio têm `deleted_at` (soft-delete) e audit log
- Domain events seguem padrão genérico com `correlation_id`

**Exemplos:**

```text
"Validar schema.ts de contas de usuários"
"Checar se há anti-patterns neste schema do banco"
"Validar isolamento multi-tenant no schema de pedidos"
```

---

#### `validate-fastify-endpoint`

Valida estaticamente código de endpoint Fastify contra contratos arquiteturais invioláveis: RBAC, rastreabilidade e RFC 9457.

**Quando usar:** Obrigatório após gerar ou modificar handlers backend.

**O que valida:**

- Rota usa guard `@RequireScope` (ou comentário `// ROTA PÚBLICA`)
- Mutações (POST/PUT/PATCH/DELETE) propagam `X-Correlation-ID`
- Erros usam formato RFC 9457 (Problem Details)
- Rota declara `schema: { body?, querystring?, params?, response }`

**Exemplos:**

```text
"Validar rota de login"
"Revisar endpoint de criação de usuários em user.routes.ts"
"Verificar segurança do handler de produtos"
```

---

#### `validate-openapi-contract`

Audita contrato YAML OpenAPI contra regras EX-OAS-001 a EX-OAS-004: estrutura, versionamento, Spectral lint, Swagger UI e testes de contrato.

**Quando usar:** Obrigatório após gerar ou modificar rotas Fastify. Complementa `validate-fastify-endpoint` auditando o YAML.

**O que valida:**

- OpenAPI 3.1.0, paths versionados (`/api/v{X}/...`)
- `operationId` único e estável, `x-permissions` documentados
- ProblemDetails schema com `correlationId`
- Headers `X-Correlation-ID` e `Idempotency-Key` declarados
- Zero erros no Spectral lint

**Exemplos:**

```text
"Validar contrato openapi da API v1"
"Lint do yaml openapi completo"
"Checar contrato da rota de login"
```

---

#### `validate-screen-manifest`

Valida manifestos de tela YAML contra schema v1 e regras DOC-UX-010 (EX-UX-001 a EX-UX-005): nomenclatura, catálogo de ações, telemetria e mapeamento de erros.

**Quando usar:** Obrigatório após criar ou editar YAML em `docs/05_manifests/screens/`.

**O que valida:**

- Schema v1 (campos obrigatórios: `screen_id`, `entity_type`, `actions`, etc.)
- Nomenclatura: `ux-{entity_type}-{seq}.{context}.yaml`
- Ações no catálogo permitido (37 ações padronizadas)
- `X-Correlation-ID` em `propagate_headers`
- Mapeamento de erros HTTP (401, 403, 422, 500)

**Exemplos:**

```text
"Validar manifesto UX-USER-001"
"Checar screen manifest da tela de login"
"Verificar manifest de CRUD de produtos"
```

---

#### `qa_assistant`

Pipeline de qualidade que valida documentação, manifestos e integridade geral do projeto.

**Quando usar:** Para rodar validações de qualidade, CI local, ou checagem geral do projeto.

**Comandos disponíveis:**

- `pnpm run qa:all` — Master Quality Gate (roda tudo)
- `pnpm run lint:docs` — Verifica dead-links em markdown
- `pnpm run lint:markdown` — Valida sintaxe markdown
- `pnpm run validate:manifests` — Valida manifestos YAML contra schemas

**Exemplos:**

```text
"Rode os testes de qualidade"
"Faz a checagem completa"
"Pode validar tudo?"
```

---

### Operações e Utilitários

#### `git_assistant`

Assistente Git com suporte a commits semânticos em PT-BR e sincronização multi-repo.

**Quando usar:** Para operações git, commits semânticos, ou sincronização entre repositórios privado e público.

**Comandos:**

- `pnpm run commit` — Commit semântico interativo
- `pnpm run sync:private` — Sincroniza repositório privado
- `pnpm run sync:public` — Sincroniza template público

**Exemplos:**

```text
"Terminei essa User Story, faz o commit pra mim"
"Sincroniza o projeto privado"
"Publicar as alterações no repositório template"
```

---

#### `update-markdown-file-index`

Atualiza seções de índice/tabela em arquivos markdown com lista de arquivos de um diretório especificado.

**Quando usar:** Quando índices de documentação precisam ser atualizados. Também invocada automaticamente por outras skills (`forge-module`, `create-amendment`, `delete-module`, `rollback-module`).

**Exemplos:**

```text
"Atualizar índice do diretório docs/04_modules em mod.md"
"Atualizar o docs/INDEX.md com novos módulos"
"Reindexar a pasta de amendments"
```

---

#### `drizzle-orm`

Referência completa de padrões Drizzle ORM: schemas, relações, queries, transações, migrações e performance.

**Quando usar:** Quando tiver dúvidas sobre padrões Drizzle ORM ou precisar de referência para implementação.

**Exemplos:**

```text
"Como fazer um join com Drizzle corretamente?"
"Qual padrão de query builder para paginação?"
"Explicar relações many-to-many no Drizzle"
```

---

#### `skill-creator`

Meta-skill para criar, avaliar e otimizar novas skills. Inclui benchmark, avaliação com subagentes e empacotamento para distribuição.

**Quando usar:** Quando precisar criar uma skill nova, melhorar uma existente, ou medir performance de skills.

**Exemplos:**

```text
"Criar uma nova skill para validar padronização de commits"
"Melhorar a skill de validação de Drizzle schemas"
"Analisar as métricas de performance da skill validate-fastify-endpoint"
```

---

## Processo de Release (Publicação)

Para compilar uma nova versão do framework e disparar a atualização do repositório público (template):

```bash
# 1. GERAR A RELEASE (bumpa versão, copia arquivos para dist/ e cria tag)
pnpm run release

# 2. SINCRONIZAR O REPOSITÓRIO PÚBLICO
pnpm run sync:public

# 3. SINCRONIZAR O REPOSITÓRIO PRIVADO (commita e pusha o monorepo)
pnpm run sync:private
```

> Ver o workflow `/release` para o processo completo gerido pelo agente.

---

## Documentação Normativa

Todos os normativos mantêm seus identificadores em caráter imutável para rastreabilidades CI/PR. Leia os itens abaixo para profundidade nos tópicos:

| Documento | Caminho |
| --- | --- |
| **Consolidado Geral (MUST/SHOULD)** | [DOC-GNP-00__DOC-CEE-00__DOC-CHE-00__Consolidado_v2.0.md](docs/01_normativos/DOC-GNP-00__DOC-CEE-00__DOC-CHE-00__Consolidado_v2.0.md) |
| **Escala de Arquitetura (0, 1 e 2)** | [DOC-ESC-001__Escala_de_Arquitetura_Niveis_0_1_2.md](docs/01_normativos/DOC-ESC-001__Escala_de_Arquitetura_Niveis_0_1_2.md) |
| **Infraestrutura e Execução** | [DOC-PADRAO-001_Infraestrutura_e_Execucao.md](docs/01_normativos/DOC-PADRAO-001_Infraestrutura_e_Execucao.md) |
| **Dependências NodeJS** | [DOC-PADRAO-002_Dependencias_NodeJS.md](docs/01_normativos/DOC-PADRAO-002_Dependencias_NodeJS.md) |
| **Variáveis de Ambiente** | [DOC-PADRAO-004_Variaveis_de_Ambiente.md](docs/01_normativos/DOC-PADRAO-004_Variaveis_de_Ambiente.md) |
| **Storage e Upload** | [DOC-PADRAO-005_Storage_e_Upload.md](docs/01_normativos/DOC-PADRAO-005_Storage_e_Upload.md) |
| **Especificação Executável** | [DOC-DEV-001_especificacao_executavel.md](docs/01_normativos/DOC-DEV-001_especificacao_executavel.md) |
| **Fluxo de Agentes e Governança** | [DOC-DEV-002_fluxo_agentes_e_governanca.md](docs/01_normativos/DOC-DEV-002_fluxo_agentes_e_governanca.md) |
| **Estratégia de Testes** | [DOC-ARC-002__Estrategia_Testes.md](docs/01_normativos/DOC-ARC-002__Estrategia_Testes.md) |
| **Padrões OpenAPI** | [DOC-ARC-001__Padroes_OpenAPI.md](docs/01_normativos/DOC-ARC-001__Padroes_OpenAPI.md) |
| **Ponte de Rastreabilidade** | [DOC-ARC-003__Ponte_de_Rastreabilidade.md](docs/01_normativos/DOC-ARC-003__Ponte_de_Rastreabilidade.md) |
| **Catálogo Ações e UX** | [DOC-UX-010__Catalogo_Acoes_e_Template_UX.md](docs/01_normativos/DOC-UX-010__Catalogo_Acoes_e_Template_UX.md) |
| **App Shell e Navegação** | [DOC-UX-011__Application_Shell_e_Navegacao.md](docs/01_normativos/DOC-UX-011__Application_Shell_e_Navegacao.md) |
| **Componentes e Feedback** | [DOC-UX-012__Componentes_Globais_e_Feedback.md](docs/01_normativos/DOC-UX-012__Componentes_Globais_e_Feedback.md) |
| **Contratos Fundacionais** | [DOC-FND-000__Foundation.md](docs/01_normativos/DOC-FND-000__Foundation.md) |
| **Manifestos e Gates CI** | [DOC-ARC-003B__Manifestos_Declarativos_e_Gates_CI.md](docs/01_normativos/DOC-ARC-003B__Manifestos_Declarativos_e_Gates_CI.md) |
| **Guia Padrão Agente** | [DOC-GPA-001_Guia_Padrao_Agente.md](docs/01_normativos/DOC-GPA-001_Guia_Padrao_Agente.md) |

*(Markdown formatado em UTF-8).*
