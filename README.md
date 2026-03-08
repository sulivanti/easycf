# EasyCodeFramework 🚀

O **EasyCodeFramework (ECF)** é a fundação para criação e gestão de APIs transacionais escaláveis com Node.js, empoderado por skills nativas de Inteligência Artificial usando Antigravity.

Este projeto visa estabelecer padrões rigorosos de desenvolvimento, arquitetura em níveis (Clean Architecture e DDD-lite) e automações nativas para um ecossistema sólido e previsível de APIs e interfaces web.

Atualmente, o projeto foca no desenvolvimento base e na estruturação de seus módulos normativos, com módulos em refinamento.

---

## Stack Tecnológico

A tecnologia base escolhida preconiza alta performance e tipagem rigorosa:

- **Runtime e Ferramentas:** Node.js (v20 Alpine), pnpm (Corepack), Turborepo (Monorepo), tsx.
- **Framework Web/API:** Fastify v4.29.x
- **Gestão de Banco e ORM:** PostgreSQL 17, Drizzle ORM (driver nativo `postgres`), redis 7 (ioredis).
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

## Módulos Implementados

| Módulo | Documentação Raiz | Status |
| --- | --- | --- |
| **MOD-001 — Backoffice (Admin)** | [mod.md](docs/04_modules/mod-001-backoffice-admin/mod.md) | `REFINING` |

> *Para um índice completo das funcionalidades ou módulos em desuso (.bkp), ver `docs/INDEX.md`.*

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

Em seguida, faça o download de pacotes e inicialize o servidor da API fora do contêiner para utilizar o hot-reload (`tsx`):

```bash
pnpm install

# Para executar migrações para o banco (caso necessário)
pnpm run db:generate
pnpm run db:push

# Para iniciar a API em ambiente local
pnpm run dev
```

> **Fonte:** `DOC-PADRAO-001` e `DOC-PADRAO-004`.

---

## Automação de Qualidade (QA)

O projeto consolida diversas rotinas estáticas e validações de documentação em uma única pipeline via npm scripts:

- **`npm run qa:all`:** Master Quality Gate. Roda tanto o lint de documentação quanto a verificação de esquemas JSON nos manifestos YAML de forma consecutiva e exibe apenas os retornos úteis sobre itens com defeito (falha de tipagem, links mortos em `.md`).
- **`npm run lint:docs`:** Busca e conserta referências de *dead-links* entre os documentos canônicos da especificação na pasta `docs/`.
- **`npm run validate:manifests`:** Audita dinamicamente todos os manifestos de UI (`05_manifests/screens`) em conformidade estrita aos esquemas versionados via Ajv.

> 🤖 **Dica para Agentes:** Caso exista alguma inconsistência nos arquivos Markdown (ex: *links quebrados* após rename) ou um arquivo `YAML` fora do modelo, simplesmente acoste-se à skill **`qa_assistant`** ou rode `npm run qa:all` no terminal para relatar os problemas ao desenvolvedor.

---

## Padrões de Desenvolvimento

- **Zero Alucinação / Padrões Declarativos:** Utilize sempre o [DOC-DEV-001_especificacao_executavel.md](docs/01_normativos/DOC-DEV-001_especificacao_executavel.md) para redigir ou codificar comportamentos.
- **Testes (DOC-ARC-002):** A cobertura do código deve abranger os Use Cases puramente em memória (Testes Unitários sem mock de I/O) e roteiras de integração com banco **real** (Testcontainers, postgres efêmero). É **proibido mockar UseCases e repositórios em testes de API E2E**.
- **Gestão Eficiente Múltiplos Apps:** Devido ao pnpm Workspaces + Turborepo, dependências e compilações (`dist`) habitam cada respectivo pacote, isolando e organizando a transpilação final.

---

## Fluxo de Contribuição e Agentes

A automação arquitetural orientada a Inteligência Artificial (Antigravity) permeia este ecossistema.

**O Processo (Ciclo de Vida):**

1. **User Story (US):** Cria-se/aprova-se o requisito de negócio na pasta `user-stories/features/`.
2. **Geração Baseline:** Uma vez que essa US alcança o status `aprovada`, usufrui-se de rotinas automáticas de agentes (`scaffold-module`) que fundem essa US aos contratos obrigatórios (`DOC-DEV-001`), forjando o boilerplate (schemas, queries, routes, handlers em níveis 0/1/2).
3. **Evolução Segura (Amendments):** Códigos ou regras alteradas após aprovação inicial nunca sobressaem silenciosamente nos documentos. Documenta-se em Emendas - Improvements (M), Correções (C) e Revisões (R) via skill `create-amendment`.

As **Agent Skills** repousam fisicamente em `.agents/skills/`.

---

## Processo de Release (Publicação)

Para compilar uma nova versão do framework e disparar a atualização do repositório público (template), siga os passos abaixo no terminal do monorepo:

```bash
# 1. GERAR A RELEASE BÁSICA (Aumenta a versão e prepara as pastas)
# Ele copia os arquivos do framework para dentro da pasta dist/ (que será o repositório público clorado) e cria uma tag de release.
pnpm run release

# 2. PUBLICAR O TEMPLATE PÚBLICO
# Navegue até a pasta dist/easycf, que é clone do repositório público no GitHub.
cd dist/easycf
# Suba as mudanças geradas no template
git push
# Suba a tag de versão
git push --tags

# 3. PUBLICAR O FRAMEWORK PRIVADO (Monorepo)
# Volte duas pastas para retornar à raiz do seu projeto/monorepo privado.
cd ../..
# Suba as alterações do package.json com a nova numeração de versão para salvar a versão aqui.
git push
```

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
| **Estratégia de Testes** | [DOC-ARC-002__Estrategia_Testes.md](docs/01_normativos/DOC-ARC-002__Estrategia_Testes.md) |
| **Padrões OpenAPI** | [DOC-ARC-001__Padroes_OpenAPI.md](docs/01_normativos/DOC-ARC-001__Padroes_OpenAPI.md) |
| **Ponte de Rastreabilidade** | [DOC-ARC-003__Ponte_de_Rastreabilidade.md](docs/01_normativos/DOC-ARC-003__Ponte_de_Rastreabilidade.md) |
| **Catálogo Ações e UX** | [DOC-UX-010__Catalogo_Acoes_e_Template_UX.md](docs/01_normativos/DOC-UX-010__Catalogo_Acoes_e_Template_UX.md) |
| **App Shell e Navegação** | [DOC-UX-011__Application_Shell_e_Navegacao.md](docs/01_normativos/DOC-UX-011__Application_Shell_e_Navegacao.md) |
| **Componentes e Feedback** | [DOC-UX-012__Componentes_Globais_e_Feedback.md](docs/01_normativos/DOC-UX-012__Componentes_Globais_e_Feedback.md) |
| **Guia Padrão Agente** | [DOC-GPA-001_Guia_Padrao_Agente.md](docs/01_normativos/DOC-GPA-001_Guia_Padrao_Agente.md) |

*(Markdown formatado em UTF-8).*
