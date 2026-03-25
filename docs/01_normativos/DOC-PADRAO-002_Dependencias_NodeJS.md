# DOC-PADRAO-002 — Padrões de Dependências Node.js (package.json)

- **id:** DOC-PADRAO-002
- **version:** 1.4.0
- **status:** ACTIVE
- **data_ultima_revisao:** 2026-03-25
- **owner:** infraestrutura
- **scope:** global (gestão de dependências pnpm/Turbo)

## 1. Visão Geral

Este documento estabelece o padrão arquitetural de dependências para o ecossistema Node.js do projeto **EasyA2**, garantindo previsibilidade, segurança e padronização entre os desenvolvedores e os Agentes de Geração de Código (Pacote COD).

O projeto adota uma abordagem minimalista e fortemente tipada, evitando _frameworks_ muito opinativos em favor de bibliotecas especializadas integradas sob o controle da aplicação.

## 2. Padrões de Módulo e Runtime

- **Engine:** Node.js v20+
- **Sistema de Módulos:** ECMAScript Modules (`"type": "module"`)
- **Package Manager:** `pnpm` (via Corepack e orquestrado por PNPM Workspaces)
- **Monorepo Orchestrator:** `turbo` (Turborepo) gerenciando caching de build e execução concorrente das aplicações.

## 3. Bibliotecas Core (Dependencies)

O bloco de `dependencies` foca unicamente no que rodará em produção.

### 3.1. Framework Web / API

- **Fastify:** `fastify` e seus ecossistemas core (`@fastify/cors`, `@fastify/helmet`). Escolhido pela alta performance e excelente integração nativa com TypeScript e validação de schemas. A versão homologada para o projeto é a **v4.29.x**.
- **Fastify JWT:** `@fastify/jwt`.
  - 🚨 **Aviso de Compatibilidade:** Como o projeto utiliza a engine Fastify `v4.x`, é estritamente obrigatório utilizar o `@fastify/jwt@8.x`. Versões superiores (v9+) exigirão o Fastify v5 e causarão o crash `FST_ERR_PLUGIN_VERSION_MISMATCH` fatal durante o boot do servidor.
- **Fastify OAuth2:** `@fastify/oauth2@7.x` — plugin para fluxos OAuth2/PKCE com suporte nativo a Google, Microsoft Azure AD, GitHub e outros providers.
  - 🚨 **Workaround de Tipagem:** A versão `7.x` exporta as constantes de configuração (`GOOGLE_CONFIGURATION`, `MICROSOFT_CONFIGURATION`) no objeto `default` em runtime, mas os tipos TypeScript omitem algumas delas. Use o cast `(fastifyOauth2 as any).GOOGLE_CONFIGURATION` nos arquivos de rotas SSO.
  - **Variáveis de Ambiente Obrigatórias para SSO:**

    ```env
    GOOGLE_CLIENT_ID=...
    GOOGLE_CLIENT_SECRET=...
    GOOGLE_CALLBACK_URI=http://localhost:3000/api/v1/auth/google/callback
    MICROSOFT_CLIENT_ID=...
    MICROSOFT_CLIENT_SECRET=...
    MICROSOFT_CALLBACK_URI=http://localhost:3000/api/v1/auth/microsoft/callback
    ```

- **Fastify Rate Limit:** `@fastify/rate-limit@9.x` — proteção contra brute-force e DDoS.
  - **Configuração global:** 100 req/min por IP (todas as rotas).
  - **Rota `POST /auth/login`:** sobrescrita para **10 tentativas / 15 minutos por IP**.
  - Resposta `429` segue RFC 9457 com `error_code: TOO_MANY_ATTEMPTS` e header `Retry-After`.
  - ⚠️ **Compatibilidade:** `@fastify/rate-limit@9.x` é compatível com Fastify `v4.x`. Versões superiores exigem Fastify v5.

- **OTP Library:** `otplib@12.x` — geração e verificação de TOTP/HOTP (RFC 6238). Usado no fluxo de MFA.
  - **Uso correto (v12):**

    ```typescript
    import { authenticator } from 'otplib';

    // Gerar secret e token
    const secret = authenticator.generateSecret();
    const token = authenticator.generate(secret);

    // Verificar token
    const isValid = authenticator.check(token, secret);
    ```

- **Resend Node SDK:** `resend` — abstração simples e moderna para envio de e-mails transacionais.
  - O provedor exige configuração da variável contendo a chave de API `RESEND_API_KEY`.
  - Usado no serviço `MailService` para recuperação de senhas. Se ausente, opera em modo silencioso localmente para DEV.

### 3.2. Persistência de Dados (ORM e DB)

- **Drizzle ORM:** `drizzle-orm` (Motor do ORM, `>= v0.45.0` recomendado).
- **Driver Postgres:** `postgres` (Driver nativo `Postgres.js`, altamente performático e alinhado com o Drizzle).

> **🚨 Aviso de Compatibilidade:** Ao instalar o Drizzle e o ecossistema adjacente, as versões precisam estar alinhadas. O uso do `drizzle-zod` exige paridade exata para não haver conflitos de importação ESM (ex: `drizzle-zod@0.8+` exige impreterivelmente `drizzle-orm@0.45+`).

### 3.3. Validação e Tipagem (Runtime)

- **Zod:** `zod` (Validador universal para schemas do Drizzle, payloads e variáveis de ambiente).

### 3.4. Cache e Filas

#### 3.4.1 Cliente Redis

- **ioredis:** `ioredis@^5.x` — Cliente Redis padrão do projeto. Suporta Cluster, Sentinel, pipelining e Lua scripting.

**Configuração padrão obrigatória (singleton por processo):**

```typescript
import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 200, 2000); // backoff até 2s
  },
  lazyConnect: true,
  connectTimeout: 5000,
  commandTimeout: 5000,
});
```

**Regras:**
- **MUST** usar `REDIS_URL` do ambiente (conforme DOC-PADRAO-004 §3.4).
- **MUST** usar instância singleton — nunca criar conexão por request.
- **MUST** configurar `retryStrategy` com backoff exponencial.
- **SHOULD** usar `lazyConnect: true` para controlar momento da conexão.
- **MUST NOT** usar `enableReadyCheck: false` em produção.

#### 3.4.2 Filas — BullMQ

- **bullmq:** `bullmq@^5.x` — Sistema de filas baseado em Redis. Dependência core para processamento assíncrono.

**Regras:**
- **MUST** reutilizar a conexão ioredis do §3.4.1 (opção `connection`).
- **MUST** nomear filas com prefixo do módulo: `{mod-NNN}:{domínio}` (ex: `mod-006:email`, `mod-008:ingest`).
- **SHOULD** configurar `defaultJobOptions.removeOnComplete` para evitar crescimento infinito.
- **MAY** adicionar `@bull-board/api` + `@bull-board/fastify` como devDependency para dashboard de debug.

#### 3.4.3 Key Naming Convention

Padrão obrigatório para todas as chaves Redis do projeto:

```
{módulo}:{entidade}:{id}[:{atributo}]
```

**Exemplos:**

| Chave | Uso |
|-------|-----|
| `mod-003:tenant:uuid` | Cache de tenant |
| `mod-000:rbac:user:uuid` | Cache RBAC por usuário |
| `mod-006:notify:job:uuid` | Job de notificação |
| `session:token-hash` | Sessão de usuário |
| `ratelimit:ip:addr` | Rate limiting por IP |

**Regras:**
- **MUST** usar `:` como separador (convenção Redis universal).
- **MUST** prefixar com módulo owner (`mod-NNN:`) exceto chaves transversais (session, ratelimit).
- **MUST NOT** usar espaços, underscores ou chaves longas (URLs inteiras, etc.).
- **SHOULD** manter chaves curtas — consomem memória.

#### 3.4.4 TTL e Políticas de Expiração

**TTL padrão por categoria:**

| Categoria | TTL | Justificativa |
|-----------|-----|---------------|
| Cache RBAC | 5 min (300s) | Balança freshness vs performance |
| Sessão | 24h (86400s) | Alinhado com JWT expiry |
| Cache geral (queries) | 1h (3600s) | Default seguro |
| Rate limiting | 1–60s | Conforme janela de rate limit |
| Jobs BullMQ (completed) | 24h | Cleanup automático |
| Locks distribuídos | 10–30s | Auto-release em caso de crash |

**Regras:**
- **MUST** definir TTL em toda chave de cache — sem exceção.
- **MUST NOT** usar `SET` sem `EX`/`PX` para chaves de cache.
- **SHOULD** usar `setex` ou equivalente atômico para garantir TTL.
- Para dados persistentes (ex: configuração), usar **MUST** com `noeviction` no database separado.

#### 3.4.5 Separação de Redis Databases

| Database | Uso | Eviction Policy |
|----------|-----|-----------------|
| db0 | Cache (RBAC, queries, geral) | `allkeys-lru` |
| db1 | Filas BullMQ | `noeviction` |
| db2 | Sessions | `volatile-ttl` |

**Regras:**
- **MUST** separar cache e filas em databases distintas para evitar eviction de jobs.
- **SHOULD** configurar `maxmemory` por instância (recomendado: 256MB para dev, sizing por ambiente em prod).
- Conexões ioredis para cada database devem ser instâncias separadas com `db` option.

#### 3.4.6 Health Check

```typescript
async function redisHealthCheck(redis: Redis): Promise<'ok' | 'degraded'> {
  try {
    const pong = await redis.ping();
    return pong === 'PONG' ? 'ok' : 'degraded';
  } catch {
    return 'degraded';
  }
}
```

- **MUST** expor health check Redis no endpoint `/health` (conforme DOC-PADRAO-001).
- **SHOULD** incluir latência do PING no payload de health.

### 3.5. Frontend (SPA)

O bloco de dependências frontend é gerenciado no workspace `apps/web/`.

#### Roteamento

- **TanStack Router:** `@tanstack/react-router@^1.x` — roteamento SPA type-safe com code splitting nativo via `lazy()`. Integra-se naturalmente com React Query para data loading.
  - **Não usar** `react-router-dom`. O TanStack Router é o router autorizado para o projeto.

#### Server State

- **TanStack React Query:** `@tanstack/react-query@^5.x` — gerenciamento de server state (cache, refetch, invalidation). Já em uso nos módulos gerados.
  - **DevTools:** `@tanstack/react-query-devtools@^5.x` (devDependency) — painel de debug para queries em desenvolvimento.

#### Animações

- **Motion:** `motion@^12.x` — biblioteca de animações declarativas, successor do framer-motion. Tree-shakeable e com API moderna.
  - Uso obrigatório para: Modal (scale-up + backdrop), Drawer (slide), Toast (slide + fade), transições de página.

#### Styling

- **Tailwind CSS v4:** `tailwindcss@^4.x` + `@tailwindcss/vite@^4.x` — framework de styling utilitário.
  - 🚨 **Compatibilidade v4:** Tailwind v4 **NÃO** usa `postcss.config.js` nem `tailwind.config.js`. A configuração é feita via plugin Vite (`@tailwindcss/vite`) e bloco `@theme` no CSS entry point. Ver DOC-UX-013 §3.
  - **CSS entry point:** `src/index.css` com `@import "tailwindcss"` + bloco `@theme` contendo os design tokens (DOC-UX-013 §2).

#### Component Library (shadcn/ui)

- **shadcn/ui** — gerador de componentes que copia código-fonte para `src/shared/ui/`. Não é uma dependência npm — é um CLI que gera código. Os componentes gerados dependem de:
  - `class-variance-authority` (cva) — variants tipadas para componentes (size, variant)
  - `clsx` — composição condicional de classes
  - `tailwind-merge` — resolve conflitos de classes Tailwind
  - `@radix-ui/react-dialog` — primitivo headless para modais (focus trap, ESC, aria-*)
  - `@radix-ui/react-dropdown-menu` — primitivo headless para dropdown menus
  - `@radix-ui/react-tooltip` — primitivo headless para tooltips
  - `@radix-ui/react-label` — primitivo headless para labels acessíveis
  - `@radix-ui/react-slot` — composição via `asChild` pattern
  - `vaul` — drawer primitivo (usado pelo shadcn Drawer)
  - `sonner` — toast system (usado pelo shadcn Sonner)
- 🚨 **Atenção:** Os pacotes `@radix-ui/*` são instalados automaticamente pelo `npx shadcn@latest add`. **NÃO instalar manualmente** — o CLI resolve as dependências corretas para cada componente.
- Ver DOC-UX-013 §4 para lista completa de componentes obrigatórios e processo de inicialização.

#### Resumo de Dependências Frontend

| Pacote | Tipo | Versão |
|--------|------|--------|
| `@tanstack/react-router` | dependency | `^1.x` |
| `@tanstack/react-query` | dependency | `^5.x` |
| `motion` | dependency | `^12.x` |
| `tailwindcss` | dependency | `^4.x` |
| `class-variance-authority` | dependency | `^0.7.x` |
| `clsx` | dependency | `^2.x` |
| `tailwind-merge` | dependency | `^2.x` |
| `sonner` | dependency | `^2.x` |
| `@radix-ui/react-*` | dependency | (gerenciado pelo shadcn CLI) |
| `vaul` | dependency | `^1.x` |
| `@tailwindcss/vite` | devDependency | `^4.x` |
| `@tanstack/react-query-devtools` | devDependency | `^5.x` |
| `@tanstack/react-router-devtools` | devDependency | `^1.x` |

## 4. Bibliotecas de Desenvolvimento (DevDependencies)

O bloco de `devDependencies` garante o fluxo de trabalho local, linteis e tipagens, não subindo para produção.

### 4.1. TypeScript e Execução Local

- **TypeScript:** `typescript` e `@types/node`.
- **Executor Typescript (Hot-reload):** `tsx` (Extremamente rápido para rodar arquivos `.ts` diretamente no Node sem step de build separado em dev).

### 4.2. Migrations e Banco (CLI)

- **Drizzle Kit:** `drizzle-kit` (Ferramenta CLI oficial, `>= v0.31.0` recomendado).
  - _Nota Arquitetural:_ A partir da versão 0.30 do Kit, a propriedade obsoleta `driver: 'pg'` no `drizzle.config.ts` é proibida. Utilize **obrigatoriamente** `dialect: 'postgresql'` e `url: process.env.DATABASE_URL`.

### 4.3. Qualidade de Código (ESLint + Prettier)

O monorepo possui tooling de linting e formatação centralizado na raiz do projeto.

#### ESLint v9 — Flat Config

Configuração única em `eslint.config.mjs` (raiz). Não há `.eslintrc` por workspace.

**Plugins ativos:**

| Plugin | Propósito |
|---|---|
| `@eslint/js` | Regras recomendadas do ESLint core |
| `typescript-eslint` | Parser + regras TypeScript (`tseslint.configs.recommended`) |
| `eslint-plugin-react` | Regras React (apenas `apps/web/`) |
| `eslint-plugin-react-hooks` | Regras de hooks React (apenas `apps/web/`) |
| `eslint-config-prettier` | Desativa regras de formatação que conflitam com Prettier |

**Regras globais:**

| Regra | Severidade | Detalhes |
|---|---|---|
| `@typescript-eslint/no-unused-vars` | `warn` | Ignora variáveis/args com prefixo `_` (`argsIgnorePattern: '^_'`, `varsIgnorePattern: '^_'`) |
| `@typescript-eslint/consistent-type-imports` | `warn` | Força `import type { Foo }` para importações somente de tipo |

**Overrides por escopo:**

- **`apps/web/**/*.{ts,tsx}`** — Adiciona `react/recommended` + `react-hooks/recommended`. Desativa `react/react-in-jsx-scope` e `react/prop-types`.
- **`**/*.test.ts`, `**/*.test.tsx`, `**/test/**/*.ts`** — Relaxa `no-explicit-any` e `no-non-null-assertion` (off) para facilitar escrita de testes.

**Ignores globais:** `**/node_modules/**`, `**/dist/**`, `**/build/**`, `**/.astro/**`, `**/coverage/**`.

#### Prettier

Configuração em `.prettierrc` (raiz):

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "endOfLine": "lf"
}
```

#### Scripts disponíveis (raiz)

| Script | Comando | Descrição |
|---|---|---|
| `pnpm lint` | `eslint apps/` | Executa linting em todos os workspaces |
| `pnpm lint:fix` | `eslint apps/ --fix` | Corrige automaticamente o que for possível |
| `pnpm format` | `prettier --write "apps/**/*.{ts,tsx,json}"` | Formata todo o código |
| `pnpm format:check` | `prettier --check "apps/**/*.{ts,tsx,json}"` | Verifica formatação (CI) |

#### Regra obrigatória (MUST)

> **Todo código novo DEVE passar em `pnpm lint` e `pnpm format:check` sem erros antes de merge.** Agentes de codegen devem gerar código já aderente às regras listadas acima.

## 5. Estrutura Modelo de Scripts e Monorepo (Turborepo)

O projeto usa a arquitetura de **Monorepo**. Para orquestrar as tarefas de Node.js dos diferentes pacotes (ex: `apps/api` e `apps/web`), é utilizado o **Turborepo** via arquivo `turbo.json`.

Ao atuar no desenvolvimento ou deploy, os Agentes devem esperar e respeitar os seguintes scripts baseados nas bibliotecas acima **na raiz do projeto (`package.json` root)**:

```json
"scripts": {
  "build": "turbo run build",
  "dev": "turbo run dev",
  "lint": "turbo run lint"
}
```

Dentro de `apps/api/package.json`, por outro lado, aplicam-se os scripts de domínio específico:

```json
"scripts": {
  "dev": "tsx watch src/server.ts",
  "dev:worker": "tsx watch src/worker.ts",
  "build": "tsc",
  "start": "node dist/server.js",
  "db:generate": "drizzle-kit generate:pg",
  "db:push": "drizzle-kit push:pg",
  "db:migrate": "tsx src/db/migrate.ts"
}
```

## 6. Integração com Agentes (Pacote COD)

Agentes de geração de API (`AGN-COD-API`) e Banco (`AGN-COD-DB`) **devem** assumir o uso exclusivo de Fastify e Drizzle/Zod, sendo proibida a injeção aleatória de Express, TypeORM ou Prisma nestes fluxos automatizados, a menos que autorizado por um Amendment oficial (ADA).

O agente de frontend (`AGN-COD-WEB`) **DEVE** usar exclusivamente:
- **Tailwind CSS v4** para styling (PROIBIDO inline styles para layout/cor/tipografia — ver DOC-UX-013 §3.4)
- **@tanstack/react-router** para roteamento SPA (PROIBIDO `window.location.href` e `react-router-dom`)
- **@tanstack/react-query** para server state
- **motion** para animações de Modal, Drawer, Toast
- Componentes de `@shared/ui/` (PROIBIDO recriar Button, Input, etc. por módulo — ver DOC-UX-013 §4)

---

## CHANGELOG

| Versão | Data | Descrição |
|---|---|---|
| 1.4.0 | 2026-03-25 | §3.4 expandida com ioredis ^5.x config, BullMQ ^5.x, key naming, TTL, databases, health check (DOC-PADRAO-002-M01) |
| 1.3.0 | 2026-03-24 | §3.5 expandida com shadcn/ui stack: cva, clsx, tailwind-merge, Radix UI, vaul, sonner |
| 1.2.0 | 2026-03-24 | Nova §3.5 Frontend (SPA) com TanStack Router, React Query, motion, Tailwind v4. Atualizada §6 com regras AGN-COD-WEB |
| 1.1.0 | 2026-03-24 | Expandida §4.3 com detalhamento completo de ESLint v9 Flat Config, plugins, regras, Prettier e scripts |
| 1.0.0 | 2026-03-04 | Versão inicial |
