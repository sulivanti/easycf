# DOC-PADRAO-004 — Padrões de Variáveis de Ambiente e Configuração

**Versão:** 2.0 | **Última revisão:** 2026-03-06

---

## 1. Visão Geral

Este documento estabelece o padrão arquitetural para gerenciamento e tipagem de variáveis de ambiente no ecossistema Node.js do **EasyCodeFramework**, aplicável a todos os projetos gerados pelo framework e a todos os ambientes (desenvolvimento, testes, homologação e produção).

O arquivo `.env.example` na raiz do projeto é a **fonte de verdade imutável** do catálogo de variáveis. Todo agente ou desenvolvedor deve consultá-lo como referência primária.

---

## 2. Separação de Preocupações (SoC)

As seguintes categorias de dados devem **obrigatória e exclusivamente** residir em variáveis de ambiente (`.env` local, secret managers ou injeção de container em produção):

| Categoria | Exemplos |
|---|---|
| **Identidade e Ambiente** | `NODE_ENV`, `PROJECT_NAME` |
| **Endpoints e URLs** | `API_BASE_URL`, `FRONTEND_URL` |
| **Credenciais sensíveis** | `POSTGRES_PASSWORD`, `JWT_SECRET`, `RESEND_API_KEY` |
| **Strings de conexão** | `DATABASE_URL`, `REDIS_URL` |
| **Configurações de rede** | `API_PORT`, `CORS_ORIGIN` |
| **Observabilidade** | `LOG_LEVEL` |
| **Branding dinâmico** | `BRAND_NAME`, `BRAND_PRIMARY_COLOR` |
| **Integrações SSO** | `SSO_GOOGLE_ENABLED`, `GOOGLE_CLIENT_ID`, etc. |
| **Controle de acesso** | `PUBLIC_REGISTRATION_ENABLED` |

> **Regra:** Feature flags que ditam comportamentos de negócio granulares **não** devem estar em variáveis de ambiente globais, salvo quando versam sobre disponibilidade de serviços externos (ex: `SSO_GOOGLE_ENABLED`).

---

## 3. Catálogo de Variáveis

O catálogo abaixo mapeia todas as variáveis do `.env.example`. A coluna **Obrigatória** indica se a ausência da variável impede o boot da aplicação.

### 3.1. Projeto e Ambiente

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `NODE_ENV` | ✅ | `development` | Modo de execução: `development`, `test`, `production` |
| `PROJECT_NAME` | ✅ | — | Nome do projeto; usado para nomear containers Docker |
| `COMPOSE_PROJECT_NAME` | ✅ | — | Prefixo dos containers no Docker Compose (idêntico ao `PROJECT_NAME`) |

### 3.2. Aplicação (API e Frontend)

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `API_PORT` | ✅ | `3000` | Porta de binding da API |
| `API_BASE_URL` | ✅ | `http://localhost:3000` | URL pública da API; usada em respostas RFC 9457 e OAS |
| `FRONTEND_URL` | ✅ | `http://localhost:5173` | URL pública do frontend; usada em redirects, cookies e e-mails |
| `CORS_ORIGIN` | ✅ | `http://localhost:5173` | Origens CORS permitidas (múltiplas separadas por vírgula) |
| `LOG_LEVEL` | — | `info` | Granularidade do log: `trace` \| `debug` \| `info` \| `warn` \| `error` \| `fatal` |

### 3.3. Banco de Dados (PostgreSQL)

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `POSTGRES_USER` | ✅ | `admin` | Usuário do PostgreSQL |
| `POSTGRES_PASSWORD` | ✅ | — | Senha do PostgreSQL |
| `POSTGRES_DB` | ✅ | — | Nome do banco de dados |
| `DATABASE_URL` | ✅ | — | String de conexão Drizzle ORM (`postgresql://user:pass@host:port/db`) |

### 3.4. Cache e Fila (Redis)

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `REDIS_URL` | ✅ | `redis://localhost:6379` | URL de conexão com o Redis |

### 3.5. Segurança (JWT)

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `JWT_SECRET` | ✅ | — | Chave secreta JWT. Mínimo 32 caracteres. Gere com: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `JWT_EXPIRES_IN` | — | `15m` | Duração do token de acesso (ex: `15m`, `1h`) |
| `JWT_REFRESH_EXPIRES_IN` | — | `7d` | Duração do refresh token |

### 3.6. E-mail (Resend)

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `RESEND_API_KEY` | ✅* | — | Chave da API do Resend. Obrigatória se o módulo de e-mail estiver ativo. Obtenha em [resend.com](https://resend.com/api-keys) |
| `MAIL_FROM` | — | — | Endereço remetente padrão (ex: `noreply@seudominio.com`) |

### 3.7. Branding

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `BRAND_NAME` | — | — | Nome da marca exibido em templates de e-mail e UI |
| `BRAND_PRIMARY_COLOR` | — | `#1A56DB` | Cor primária em hex para templates |

### 3.8. SSO — Google (INT-000-01)

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `SSO_GOOGLE_ENABLED` | ✅ | `false` | Habilita autenticação via Google |
| `GOOGLE_CLIENT_ID` | ✅* | — | Client ID do Google OAuth 2.0 |
| `GOOGLE_CLIENT_SECRET` | ✅* | — | Client Secret do Google OAuth 2.0 |
| `GOOGLE_CALLBACK_URI` | ✅* | — | URI de callback registrada no Google Console |

> ✅* = Obrigatória apenas quando `SSO_GOOGLE_ENABLED=true`.

### 3.9. SSO — Microsoft / Azure AD (INT-000-02)

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `SSO_MICROSOFT_ENABLED` | ✅ | `false` | Habilita autenticação via Microsoft |
| `MICROSOFT_CLIENT_ID` | ✅* | — | Client ID do App Registration no Azure |
| `MICROSOFT_CLIENT_SECRET` | ✅* | — | Client Secret do Azure AD |
| `MICROSOFT_TENANT_ID` | ✅* | — | Tenant ID do Azure AD |
| `MICROSOFT_CALLBACK_URI` | ✅* | — | URI de callback registrada no Azure Portal |

> ✅* = Obrigatória apenas quando `SSO_MICROSOFT_ENABLED=true`.

### 3.10. Controle de Acesso

| Variável | Obrigatória | Padrão | Descrição |
|---|---|---|---|
| `PUBLIC_REGISTRATION_ENABLED` | — | `true` | Permite que novos usuários se cadastrem sem convite |

---

## 4. Validação Rigorosa no Boot (Fail-Fast)

É imperativo que qualquer variável requerida seja validada durante a subida (boot) da aplicação.

- O projeto exige validação via **schema Zod** de todas as variáveis vitais no ponto de entrada (ex: `server.ts` ou num arquivo dedicado `env.ts`).
- Caso o processo detecte ausência ou má-formatação, deve lançar exceção e encerrar com `process.exit(1)` **imediatamente** — nunca prosseguir de forma instável.

```typescript
// Exemplo: packages/core-api/src/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  REDIS_URL: z.string().url().default('redis://localhost:6379'),
  // ...
});

export const env = envSchema.parse(process.env);
```

---

## 5. Problem Details e Conformidade RFC 9457

A arquitetura Fastify adota a padronização de erros conforme a [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457.html).

- O campo `type` dos erros **nunca** deve ter URL hardcoded de produção.
- A base da URL deve vir de `API_BASE_URL`:
  - Dev: `http://localhost:3000/problems/bad-request`
  - Produção: `https://api.seudominio.com/problems/bad-request`
- Links de referência ao frontend devem usar `FRONTEND_URL`.

---

## 6. Arquivos de Ambiente Locais

| Arquivo | Commitado? | Propósito |
|---|---|---|
| `.env` | ❌ | Ambiente de desenvolvimento local com segredos reais |
| `.env.example` | ✅ | Template obrigatório no repositório — sem segredos |
| `.env.test` | ❌ | Configurações para testes automatizados (e2e, integração) |
| `.env.local` | ❌ | Sobrescrita local de qualquer valor |

> **Regra crítica:** Sempre que uma nova variável for adicionada ao `.env`, o `.env.example` **deve ser atualizado imediatamente** no mesmo commit/PR.

---

## 7. Referências no Código

Módulos não devem inferir protocolo (`http`/`https`) diretamente. Sempre use template com a variável:

```typescript
// ✅ Correto
const problemUrl = `${env.API_BASE_URL}/problems/bad-request`;

// ❌ Errado — hardcoded
const problemUrl = 'https://api.easya1.com/problems/bad-request';
```

---

## 8. Alinhamento com Contratos (OpenAPI)

Nas especificações de contrato (`v1.yaml`), use o placeholder `{{API_BASE_URL}}` nos exemplos de resposta de erro para indicar que a URI é montada dinamicamente.

---

## 9. Estratégia de `.env` no Monorepo

### 9.1. Fonte Única de Verdade

No monorepo existe **um único `.env` na raiz**. Ele é a fonte de verdade para todos os apps:

```text
EasyCodeFramework/
├── .env              ← ✅ ÚNICO arquivo de variáveis (não commitado)
├── .env.example      ← ✅ Template obrigatório no repositório (sem segredos)
├── apps/
│   ├── api/          ← ❌ NÃO deve ter .env próprio
│   └── web/          ← ❌ NÃO deve ter .env próprio
├── packages/
│   └── core-api/     ← ❌ NÃO deve ter .env próprio
```

> **Regra:** Nunca crie `.env` dentro de `apps/` ou `packages/`. Todo `.env` local dentro de um pacote indica duplicação e risco de divergência.

### 9.2. Como as Variáveis chegam aos Apps (Node.js v20+)

Os scripts `dev`, `start`, `db:migrate` etc. usam a flag `--env-file` nativa do Node.js v20+:

```json
{
  "scripts": {
    "dev":        "tsx watch --env-file=../../.env src/server.ts",
    "start":      "node --env-file=../../.env dist/server.js",
    "db:migrate": "tsx --env-file=../../.env src/db/migrate.ts"
  }
}
```

A flag `--env-file` injeta as variáveis **antes** de qualquer módulo ESM ser carregado — fundamental em ESM porque `import` estáticos são *hoisted* e executados antes do código do módulo.

> **Atenção:** Não substitua `--env-file` por `dotenv.config()` inline. A ordem de execução ESM não garante que o dotenv rode antes dos imports.

### 9.3. Scripts do Drizzle-kit

O `drizzle-kit` não é um script tsx, portanto usa `node --env-file` explicitamente:

```json
{
  "db:generate": "node --env-file=../../.env node_modules/.bin/drizzle-kit generate",
  "db:push":     "node --env-file=../../.env node_modules/.bin/drizzle-kit push",
  "db:studio":   "node --env-file=../../.env node_modules/.bin/drizzle-kit studio"
}
```

### 9.4. Configurando um Novo Ambiente

```powershell
# Na raiz do projeto
cp .env.example .env
# Editar .env com as credenciais reais — veja as marcações <PREENCHER>
```

---

## 10. Checklist para Agentes e Desenvolvedores

Ao adicionar uma nova variável de ambiente ao projeto:

- [ ] Adicionar a variável ao `.env` local com valor real
- [ ] Adicionar a chave (sem segredo) ao `.env.example` com comentário descritivo no bloco correto
- [ ] Adicionar a variável ao schema Zod de validação (`env.ts`)
- [ ] Atualizar a tabela do catálogo neste documento (Seção 3)
- [ ] Se for variável de integração SSO/terceiros: adicionar skeletons das variáveis relacionadas no `.env.example`
