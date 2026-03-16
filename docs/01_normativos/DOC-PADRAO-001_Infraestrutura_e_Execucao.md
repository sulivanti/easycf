# DOC-PADRAO-001 — Padrões de Ambientes e Execução (Node.js + Docker)

- **id:** DOC-PADRAO-001
- **version:** 1.0.0
- **status:** ACTIVE
- **data_ultima_revisao:** 2026-03-04
- **owner:** infraestrutura
- **scope:** global (API, Workers, Docker)

## 1. Visão Geral

Este documento define os padrões e tecnologias escolhidas para a execução da API e dos Workers do projeto **EasyA2**, estabelecendo as fundações da arquitetura de backend.

> **Nota de nomenclatura:** **EasyA2** é o nome do produto/monorepo. **EasyCodeFramework** é o nome do framework de governança e geração de código que o sustenta.

## 2. Tecnologias Base

- **Runtime:** Node.js (v20 Alpine)
- **Gerenciador de Pacotes:** `pnpm` (Corepack habilitado)
- **Containerização:** Docker & Docker Compose
- **Banco de Dados:** PostgreSQL 17
- **Cache/Filas:** Redis 7
- **ORM:** Drizzle ORM

## 3. Estrutura de Execução (Docker)

O ambiente de desenvolvimento local é unificado pelo arquivo `docker-compose.yml`.

> 📌 **Atualização do docker-compose.yml:** edite os valores neste documento e aplique as alterações diretamente no `docker-compose.yml`.

### 3.1. Variáveis de Ambiente (`.env`)

Todos os serviços compartilham o mesmo escopo de variáveis. A definição obrigatória inclui:

- `PROJECT_NAME`: Previne conflitos de nomes na rede e nomeia os containers (ex: `easya2`)
- `API_PORT`: Porta de binding de acesso à aplicação (default: `3000`)
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: Credenciais locais do banco
- `DATABASE_URL`: String de conexão formal (Padrão: `postgresql://[user]:[password]@[host]:[port]/[db_name]`)

### 3.2. Padrão de Nomeação dos Containers

Todos os containers seguem o padrão `${PROJECT_NAME:-<default>}-<serviço>`, interpolando a variável `PROJECT_NAME` do `.env`:

| Serviço  | `container_name`                        | Default            |
|----------|-----------------------------------------|--------------------|
| postgres | `${PROJECT_NAME:-easya2}-postgres`      | `easya2-postgres`  |
| redis    | `${PROJECT_NAME:-easya2}-redis`         | `easya2-redis`     |
| api      | `${PROJECT_NAME:-easya2}-api`           | `easya2-api`       |
| worker   | `${PROJECT_NAME:-easya2}-worker`        | `easya2-worker`    |

### 3.3. Serviços

#### Banco de Dados (`postgres`)

- Imagem: `postgres:17-alpine`
- Porta Exposta: `5432`
- Persistência: Volume local `pg-data` (driver: `local`)
- Restart: `unless-stopped`

#### Cache (`redis`)

- Imagem: `redis:7-alpine`
- Porta Exposta: `6379`
- Restart: `unless-stopped`

#### Aplicação (`api` e `worker`)

- Base: `node:20-alpine` diretamente (sem Dockerfile dedicado em desenvolvimento local).
- `working_dir`: `/usr/src/app`
- Mapeamento: Volume `.:/usr/src/app` (Hot-reload em ambiente de desenvolvimento).
- Comandos: `api` → `pnpm dev` | `worker` → `pnpm dev:worker`
- Dependências: ambos dependem de `postgres` e `redis` estarem saudáveis.

### 3.4. Docker Compose Profiles

Os serviços de infraestrutura base (`postgres` e `redis`) sobem **sempre** com `docker compose up`.

Os serviços de aplicação (`api` e `worker`) possuem o profile `full` e **só sobem se ativados explicitamente**:

```powershell
# Apenas infraestrutura (banco + cache):
docker compose up -d

# Infraestrutura + API + Worker:
docker compose --profile full up -d
```

Essa separação permite que os serviços de aplicação rodem fora do Docker (via `pnpm dev`) enquanto o banco e o cache correm containerizados — padrão adotado no desenvolvimento local.

## 4. O Dockerfile

O `Dockerfile` oficial da aplicação deverá conter a estrutura otimizada:

1. Imagem base ultra-leve (`node:20-alpine`).
2. Habilitação do `pnpm` nativo via CLI (`corepack enable`).
3. Instalação agressiva via lockfile (`pnpm-lock.yaml`).
4. Inicialização via scripts mapeados no `package.json` (`pnpm dev`, `pnpm dev:worker`).

## 5. Gerenciamento do Projeto Node.js (`package.json`)

### Scripts Obrigatórios

- `"dev"`: Inicia o servidor da API com hot-reload.
- `"dev:worker"`: Inicia o processador de filas em background.
- `"db:generate"`: Gera as migrations SQL usando `drizzle-kit`.
- `"db:push"`: Sincroniza diretamente o schema do Drizzle para o banco (para dev rápido).
- `"db:migrate"`: Aplica as migrations oficiais em produção.

### Dependências Fundamentais

1. **Drizzle ORM:** `drizzle-orm`, `drizzle-kit` e driver do banco (ex: `postgres` ou `pg`).
2. **TypeScript:** `typescript`, `tsx` ou `ts-node` para transpilação em tempo de execução no modo dev.
3. **Tipagem:** `@types/node` e configurações relativas (`tsconfig.json`).

## 6. Scripts Utilitários e de Teste

Além dos scripts do `package.json`, o projeto utiliza scripts isolados em `src/scripts/` para validações rápidas:

### 6.1. Validação de E-mail (`test-email.ts`)

Para validar a integração com o Resend e as chaves de API:

```powershell
npx tsx apps/api/src/scripts/test-email.ts seu-email@exemplo.com
```

*Este script carrega automaticamente o `.env` da raiz e valida o `MailService`.*

## 7. Estrutura do Monorepo (pnpm Workspaces + Turborepo)

### 7.1. Visão Geral

O projeto usa a combinação `pnpm workspaces` + `Turborepo` para orquestrar múltiplos apps em um único repositório.

```
EasyA2/                     ← raiz do monorepo
├── apps/
│   ├── api/                ← app Fastify (compila para apps/api/dist/)
│   └── web/                ← app Vite/React (compila para apps/web/dist/)
├── package.json            ← workspace root (scripts via turbo)
├── pnpm-workspace.yaml     ← declara apps/* como workspaces
├── turbo.json              ← pipeline de build/dev/lint
└── tsconfig.json           ← BASE apenas (não compila nada)
```

### 7.2. Papéis dos `tsconfig.json`

| Arquivo | Papel | Compila? | `outDir` |
|---|---|---|---|
| `/tsconfig.json` (raiz) | **Base do monorepo** — apenas compartilha `compilerOptions` | ❌ Não | — |
| `apps/api/tsconfig.json` | Compilação da API | ✅ Sim | `apps/api/dist/` |

> **Regra:** O `tsconfig.json` da raiz **não deve ter** `include`, `outDir` ou `rootDir`. Sem um `include`, o TypeScript não compila nenhum arquivo. Os apps herdam as opções base via `"extends": "../../tsconfig.json"` (se necessário).

### 7.3. Pastas Geradas — O que é Esperado

| Pasta | Origem | Deve estar no git? |
|---|---|---|
| `node_modules/` (raiz) | `pnpm install` — hoisting de deps compartilhadas | ❌ (`.gitignore`) |
| `.turbo/` (raiz) | Cache local do Turborepo | ❌ (`.gitignore`) |
| `apps/api/dist/` | Compilação TypeScript da API | ❌ (`.gitignore`) |
| `apps/web/dist/` | Build de produção do Vite | ❌ (`.gitignore`) |
| `dist/` (raiz) | **Não deve existir** | ❌ (`.gitignore`) |

### 7.4. Registro de Correção (2026-03-03)

**Problema identificado:** O `tsconfig.json` original da raiz possuía `outDir: ./dist`, `rootDir: ./` e um `include` com `apps/api/src/**/*` e `drizzle.config.ts`. Isso fazia o compilador TS gerar output na raiz, criando:

- `dist/` na raiz (espelho da estrutura do monorepo)
- `drizzle.config.js` compilado solto na raiz
- `drizzle.config.ts` duplicado na raiz (a versão correta está em `apps/api/`)

**Solução aplicada:**

1. `tsconfig.json` da raiz convertido para arquivo base (sem `include`/`outDir`/`rootDir`)
2. `drizzle.config.ts` e `drizzle.config.js` duplicados da raiz foram removidos
3. Pasta `dist/` da raiz foi deletada
4. `.turbo/` adicionado ao `.gitignore`

### 7.5. Variáveis de Ambiente no Monorepo

Existe **um único `.env` na raiz** do monorepo — ele é a fonte de verdade para todos os apps. Consulte `DOC-PADRAO-004 §8` para as regras completas.

**Regra rápida:** Nunca crie `.env` dentro de `apps/api/` ou `apps/web/`. Os scripts de cada app carregam o `.env` da raiz via flag `--env-file=../../.env` do Node.js v20+:

```text
EasyA2/.env          ← único .env (não commitado)
EasyA2/.env.example  ← template obrigatório no repositório
```

Para configurar um novo ambiente basta:

```powershell
# Na raiz EasyA2/
cp .env.example .env
# Editar .env com as credenciais reais
```

#### Registro de Correção (2026-03-03)

**Problema:** `apps/api/.env` não existia → API falhava no boot com `[FATAL] DATABASE_URL não definida`.

**Solução:**

1. Confirmado `.env` único na raiz `EasyA2/`
2. Scripts de `apps/api/package.json` atualizados com `--env-file=../../.env`
3. `DOC-PADRAO-004 §8` criado com regras definitivas
