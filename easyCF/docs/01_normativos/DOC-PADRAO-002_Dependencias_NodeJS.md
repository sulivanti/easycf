# Padrões de Dependências Node.js (package.json)

## 1. Visão Geral

Este documento estabelece o padrão arquitetural de dependências para o ecossistema Node.js do projeto **EasyA1**, garantindo previsibilidade, segurança e padronização entre os desenvolvedores e os Agentes de Geração de Código (Pacote COD).

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
  - ⚠️ **Breaking Change v12:** A classe exposta é `OTP` (não mais `authenticator` ou `TOTP` das versões anteriores).
  - **Uso correto:**

    ```typescript
    import { OTP } from 'otplib';
    const otpTotp = new OTP({ strategy: 'totp' });
    const { valid } = otpTotp.verifySync({ token: totpCode, secret: userMfaSecret });
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

- **Redis:** `ioredis` (Cliente padrão, robusto para integração com BullMQ ou uso direto).

## 4. Bibliotecas de Desenvolvimento (DevDependencies)

O bloco de `devDependencies` garante o fluxo de trabalho local, linteis e tipagens, não subindo para produção.

### 4.1. TypeScript e Execução Local

- **TypeScript:** `typescript` e `@types/node`.
- **Executor Typescript (Hot-reload):** `tsx` (Extremamente rápido para rodar arquivos `.ts` diretamente no Node sem step de build separado em dev).

### 4.2. Migrations e Banco (CLI)

- **Drizzle Kit:** `drizzle-kit` (Ferramenta CLI oficial, `>= v0.31.0` recomendado).
  - _Nota Arquitetural:_ A partir da versão 0.30 do Kit, a propriedade obsoleta `driver: 'pg'` no `drizzle.config.ts` é proibida. Utilize **obrigatoriamente** `dialect: 'postgresql'` e `url: process.env.DATABASE_URL`.

### 4.3. Qualidade de Código

- **ESLint & Prettier:** Integração básica garantindo consistência. O ESLint usando a nova sintaxe plana (Flat Config).

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
