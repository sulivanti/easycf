# EasyCodeFramework 🚀

O **EasyCodeFramework (ECF)** é a fundação para criação e gestão de APIs transacionais escaláveis com Node.js, empoderado por skills nativas de Inteligência Artificial usando Antigravity.

> **Princípio de produto:** Você **nunca precisa clonar ou baixar o repositório do ECF**. O framework é consumido inteiramente via `npx` e `npm`. Seu único repositório local é o **seu app**.

---

## Os 3 Pilares do ECF

| Pilar | Descrição |
|---|---|
| **`@easycf/core-api`** | Runtime de alta performance configurado com Fastify, pino e padronização de erros rígida (RFC 9457). Publicado no npm e instalado como dependência do seu app. |
| **`@easycf/cli`** | Ferramenta de linha de comando para scaffolding. Usada via `npx` — sem instalação global necessária. |
| **Agent Skills (`.agents/skills`)** | O coração da filosofia **AI-First**. Copiadas automaticamente para o seu app pelo CLI. Geram código aderente às regras arquiteturais sem esforço manual. |

---

## Passo 1: Inicialização AI-First (Criando seu App)

O processo de inicialização do EasyCodeFramework é **100% focado em Inteligência Artificial (AI-First)**. A sua IA (como Cursor, Claude ou Copilot) atuará como a construtora principal do projeto, consumindo o motor de habilidades do framework para gerar código seguindo nossas leis arquiteturais.

Crie uma nova subpasta vazia e siga os passos básicos abaixo:

**1. Instale o Motor de Skills da IA:**
Abra o seu terminal na pasta do novo projeto e utilize o gerenciador oficial da comunidade para instalar todas as nossas *Agent Skills* (e trazer a pasta `.agents/skills/`) diretamente do GitHub, sem precisar clonar o projeto inteiro:

```bash
npx skills add https://github.com/sulivanti/EasyCodeFramework.git
```

Isso garante que a sua IA terá superpoderes como o utilitário `scaffold-module` e as regras de `validate-drizzle-schemas` prontas para operar localmente.

**2. Traga os Normativos:**
Além das habilidades operacionais, a IA precisa de memória descritiva (`DOC-DEV-001`). Copie manualmente do repositório principal as pastas e arquivos constitucionais para a sua nova pasta:

- A pasta completa `docs/` *(que contém as leis arquiteturais)*
- O arquivo `.cursorrules` *(que guia o comportamento contínuo da sua IDE)*

**3. Ignição da API por Prompt:**
Agora, basta você abrir o Editor de código e fazer uma solicitação direta ao Chat/Composer da sua Inteligência Artificial:

> **Comando IA (Copie e Cole):**
> ✨ *"Eu acabei de configurar nossos .agents e docs. Inicie nossa aplicação! Crie um arquivo `package.json` fechado para este projeto com '@easycf/core-api' e 'fastify' como dependência. Adicione também um script de dev apontando para 'tsx watch src/index.ts' e crie o arquivo base com uma inicialização padrão fastify usando `createApp()`. Por fim, rode o comando pnpm install localmente."*

A infraestrutura inicial está erguida, os motores de agência configurados, as leis documentadas. Você já pode usar `pnpm dev`! 🎉

---

## Passo 2: Trabalhando COM a Inteligência Artificial (Skills)

No ECF, o seu foco é o **design e a regra de negócio**. O trabalho repetitivo de criar rotas, repositórios e DTOs é delegado à IA por meio das **Agent Skills** — que já estão na pasta `.agents/skills/` do seu app.

**Exemplos práticos:**

- **Gerar um Novo Módulo (`scaffold-module`):** Você tem uma *User Story* para Gestão de Usuários? Peça para a IA rodar a skill `scaffold-module`. Ela cria rotas, schemas Drizzle e repositórios no padrão do framework.

  - **O Gate de Aprovação:** A IA só gera código se a US estiver com `Status: aprovada`. Com `draft` ou `em revisao`, ela recusa e para o processo.

  - **A Estrutura Unificada de Módulos:** Todo e qualquer módulo gerado (do Foundation Nível 0 até Features Nível 1) obedece à rigorosa e idêntica arquitetura de pastas em `docs/04_modules/mod-NNN-nome/`:
    - `mod.md` e `permissions.yaml` — O manifesto do módulo e os escopos de ACL (acesso) que ele expõe.
    - `README.md`, `CHANGELOG.md`, `CONVENTIONS.md` — Arquivos de utilidade com visão geral, o histórico auditável de mudanças (amendments) e convenções locais de IDs.
    - `requirements/` — A fonte da verdade canônica. Subdividida em 9 pilares vitais: Regras (`br`), Funcionais (`fr`), Dados (`data`), Segurança (`sec`), UX (`ux`), Integrações (`int`), Não-Funcionais (`nfr`), Implementação (`imp`) e Testes (`tst`).
    - `amendments/` — A base da rastreabilidade. Para não destruir a história de um requisito, todo ajuste ou correção é primeiro desenhado aqui como arquivos delta (`M` de melhoria, `C` de correção ou `R` de revisão).
    - `adr/` — Decisões Arquiteturais Registradas que afetam o módulo.
    - `diagrams/` e `snippets/` — Para apoios visuais Mermaid (Sequence/C4) e trechos de código recorrentes.

- **Validar o Banco de Dados (`validate-drizzle-schemas`):** Criou ou editou um schema? A IA varre o código verificando conformidade com as regras de multi-tenant.

- **Documentar seu Código (`create-oo-component-documentation`):** Finalizou uma API? Gera o documento arquitetural padronizado.

---

## Passo 3: O Contrato entre a User Story e o DOC-DEV-001

> **Princípio Fundamental:** A User Story descreve dados e comportamentos **de negócio**. O `DOC-DEV-001` define os contratos arquiteturais obrigatórios. Qualquer skill que trate a US como fonte exclusiva comete um erro arquitetural.

### Na Entrevista da User Story (`draft-user-story`)

Foque apenas nos **campos de negócio**:

> ✅ **Correto:** *"A entidade `user` tem `email`, `senha` e `mfa_secret`."*
> ❌ **Errado:** *"A entidade `user` tem `id`, `tenant_id`, `email`, `created_at`, `deleted_at`..."*

Os campos `id`, `codigo`, `status`, `tenant_id`, `created_at`, `updated_at` e `deleted_at` são **gerados automaticamente** pelo framework. Incluí-los na US gera ruído.

#### A Árvore de User Stories (Onde salvar)

As US no framework não ficam jogadas. Após redigir a história usando o modelo em `user-stories/templates/TEMPLATE-USER-STORY.md`, salve-a de acordo com sua finalidade na pasta `docs/04_modules/user-stories/`:

- `epics/`: US balizadora (ex: `US-MOD-000.md`). Serve como índice agregador de funcionalidades.
- `features/`: A fundação (Baseline). O que está sendo feito do zero (ex: `US-MOD-000-F01`).
- `amendments/`: Evoluções e intervenções pós-criação. Subdividida em `improvements/`, `corrections/` e `revisions/`.

### Na Geração do Módulo (`scaffold-module`)

A skill realiza uma **fusão obrigatória** entre a US e o `DOC-DEV-001`:

| O que vem da **User Story** | O que vem do **DOC-DEV-001** |
|---|---|
| Campos de negócio (`email`, `mfa_secret`) | Campos constitucionais (`id uuid`, `codigo`, `status`, `tenant_id`, timestamps, `deleted_at`) |
| Regras de negócio (Gherkin) | Estrutura obrigatória do BR (`estado_item`, `owner`, `rastreia_para`) |
| Endpoints e fluxos | `Done funcional` (obrigatório), `Idempotência` se efeito colateral |
| Restrições citadas na US | Classificação LGPD, `Autorização de Linha` (tenant_id em events) |
| Integrações mencionadas | Timeout, Retry, Backoff, DLQ (obrigatórios mesmo sem menção na US) |

### Na Validação de Schemas (`validate-drizzle-schemas`)

As violações mais comuns detectadas:

- 🔴 `id: varchar(36)` em vez de `uuid().defaultRandom()` → **Violação Crítica**
- 🔴 `onDelete: 'cascade'` em FKs → **Violação Crítica** (NUNCA CASCADE, sempre RESTRICT)
- 🟠 `deleted_at` ausente → **Violação Alta** (hard delete proibido)
- 🟡 `codigo` ausente → **Violação Média** (identificador amigável obrigatório)

---

## Passo 4: Regras de Ouro Inegociáveis

1. **Português Sempre**: Conversações, documentações e discussões sempre em português do Brasil (exceto nomes de variáveis/arquivos de código com regras em inglês).
2. **UTF-8 de Ponta a Ponta**: Nunca salve arquivos, banco ou dados em formato não-UTF-8. Toda falha de mojibake começa aí. Garanta: *Origem → API → Banco → Tela*.

---

## Passo 5: Estrutura do Seu App

Após o `init`, a estrutura do seu app será:

```
meu-super-app/
├── .agents/
│   └── skills/           ← Todas as Skills do ECF (scaffold-module, validate-drizzle-schemas...)
├── docs/
│   └── 01_normativos/    ← DOC-DEV-001 e demais normativos do framework
├── src/
│   └── index.ts          ← Ponto de entrada do servidor Fastify
├── .cursorrules           ← Regras arquiteturais para o editor IA
└── package.json           ← Com @easycf/core-api como dependência npm
```

Tudo que você precisa está aqui. **A pasta do EasyCodeFramework não existe no seu ambiente.**

---

## Passo 6: Infraestrutura Local (Docker)

O ambiente de desenvolvimento usa Docker Compose com **dois modos de uso**:

### Serviços

| Serviço    | Imagem                  | Porta   | Sempre sobe? |
|------------|-------------------------|---------|--------------|
| `postgres` | `postgres:17-alpine`    | `5432`  | ✅ Sim        |
| `redis`    | `redis:7-alpine`        | `6379`  | ✅ Sim        |
| `api`      | `node:20-alpine`        | `3000`  | 🔵 Profile `full` |
| `worker`   | `node:20-alpine`        | —       | 🔵 Profile `full` |

Todos os containers são nomeados seguindo o padrão `${PROJECT_NAME}-<serviço>` (ex: `easya1-postgres`).

### Comandos

```powershell
# Apenas infraestrutura (banco + cache) — padrão para desenvolvimento local
docker compose up -d

# Infraestrutura + API + Worker (container completo)
docker compose --profile full up -d
```

> **Dica:** No desenvolvimento local, suba apenas `postgres` e `redis` via Docker e rode a API fora do container com `pnpm dev`. O hot-reload fica muito mais rápido.

### Atualizando o `docker-compose.yml`

O arquivo `docker-compose.yml` é gerado a partir do normativo `DOC-PADRAO-001`. **Não edite o arquivo diretamente.** Para atualizar:

1. Edite os valores em `docs/01_normativos/DOC-PADRAO-001_Infraestrutura_e_Execucao.md`
2. Regenere o arquivo rodando:

```powershell
node .agents/skills/generate-docker-compose/scripts/generate.mjs
```

O script imprime um relatório dos valores extraídos e grava o `docker-compose.yml` atualizado.

### Variáveis de Ambiente necessárias (`.env`)

```env
PROJECT_NAME=meu-super-app
API_PORT=3000
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin
POSTGRES_DB=meu-super-app
DATABASE_URL=postgresql://admin:admin@localhost:5432/meu-super-app
```

Copie o `.env.example` e ajuste para o seu projeto:

```powershell
cp .env.example .env
```

---

## Passo 7: Evoluindo o Módulo (C01, M01, R01)

Arquivos gerados pela skill (`BR-001.md`, `FR-001.md`) **nunca são editados diretamente**. Usamos **Emendas (Amendments)** para rastrear o histórico.

Acione a skill `create-amendment` quando precisar de alterações. Os tipos de emenda são:

| Código | Tipo | Quando usar |
|---|---|---|
| `C` (ex: `SEC-001-C01.md`) | Correção | Bug ou falha de regra no que já foi feito |
| `M` (ex: `FR-001-M01.md`) | Melhoria | Adição de funcionalidade nova a requisito existente |
| `R` (ex: `BR-001-R01.md`) | Revisão | Mudança de regra de negócio (lei nova, diretriz da empresa) |

**Exemplo prático:** Aprove a US da alteração e peça: *"Execute a skill `create-amendment` no pilar `fr` baseada na US aprovada"*. A IA gera o anexo `FR-001-M01` sem destruir o histórico original.

---

## Mais Comandos

```bash
# Para ejetar um módulo paramétrico no seu projeto
npx @easycf/cli add

# (Seleciona entre Auth / IAM / Core-DB)
```

---

*Consulte `docs/01_normativos/` no seu app gerado para a documentação normativa completa do framework.*
