# DOC-GNP-00 — Guia Normativo e Padrões (TS + Node + Vite/React)

- **id:** DOC-GNP-00
- **version:** 2.0.0
- **status:** ACTIVE
- **data_ultima_revisao:** 2026-02-20
- **owner:** arquitetura
- **scope:** global (padronização do produto final em monorepo)

---

## 0) Como usar este pacote (GNP + CEE + CHE)

Este documento consolida os três guias:

- **DOC-GNP-00:** regras normativas (**MUST/SHOULD/MAY**)
- **DOC-CEE-00:** catálogo copy/paste de exemplos `EX-*` (incorporados nos Anexos Aditivos abaixo)
- **DOC-CHE-00:** checklist de artefatos `EX-*` que DEVEM existir no repositório (refletido nos Anexos e em `docs/05_patches/`)

**Documentos relacionados**

- DOC-DEV-001 (especificação executável)
- DOC-ESC-001 (níveis de arquitetura)
- DOC-GPA-001 (agentes DEV/COD)

---

## 1) IDs e rastreabilidade (Gate)

### EX-TRACE (referência)

- Requisitos com IDs; dependências explícitas entre FR/BR/DATA/INT/SEC/NFR/UX/ADR.
- O repositório usa `@contract EX-...` e IDs de requisitos.

### EX-DOC-004 — Linkagem automática: `@contract EX-...` + verificador

Script de verificação (Node) que falha se referenciar ID inexistente (gate de IDs).

---

## 2) CI/CD — gates mínimos (referência)

- OpenAPI lint/validação (Spectral + validate) e rastreabilidade de IDs (EX-CI-006, EX-CI-007).

---

## 3) Developer Experience (DX) e Tooling
>
> **Objetivo:** Reduzir a sobrecarga cognitiva e prevenir a "Paralisia por Análise" de novos desenvolvedores diante de arquiteturas fortemente normatizadas.

- **CLI / Scaffolding (`SHOULD`):** A arquitetura base SHOULD prover um pipeline local (ex: `npx scaffold generate module` ou via Agente COD) automatizando a criação de stubs e esqueletos (Controller, UseCase, Repository, DTOs).
- **Abstração de Boilerplate (`MUST`):** Os templates gerados MUST já prever e resolver automaticamente as seguintes engrenagens sistêmicas:
  - Injeção e propagação no logger do cabeçalho `X-Correlation-ID`.
  - Tratamento e envelopamento padronizado de exceções (`RFC 9457 Problem Details`).
  - Verificação de chave de `Idempotency-Key` (via middleware ou base do Use Case).
  - Wrapper transacional garantindo a execução (Entity Base + Content) e o despacho do Domain Event (Outbox) em um único `commit`.
- **Prevenção de Gargalos DB (Nível 2 - DDD) (`MUST`):** Ferramentas que abstraem e estruturam a leitura e manipulação de fluxos pesados/mensageria não podem ferir a estabilidade da máquina.
  - A filtragem de autorização via matriz no caso de exibição de Timelines/Logbook (`canRead()`) **MUST NÃO** iterar e delegar processamento para a memória do Node.js originando "N+1 queries" no Banco de Dados. A amarração `canRead(entity)` **MUST ser um JOIN ou Subquery enxuto na própria relacional**.
  - O subsistema ou tabela de armazenamento final que alimenta *Channels* de Mensagem como Notificações Locais à UX/Caixas de entrada do sistema **MUST** possuir estratégia ativa de descarte (TTL - Time to Live) cronológico ou política agressiva de tabela particionada (ex: expirar em 60 a 90 dias).
- **Foco na Entidade:** A fricção deve ser nula para os "cerimoniais" da arquitetura, permitindo ao humano ou Agente focar 100% no *Core Business* do Use Case.

---

# (ANEXO ADITIVO) OpenAPI/Swagger — EX-OAS-001..004 (para Gate de IDs)

> Estes exemplos são a "âncora" para agentes COD citarem/gerarem contrato OpenAPI e não quebrarem o Gate de IDs (EX-CI-007), já que `EX-OAS-*` passa a estar definido neste consolidado.

## EX-OAS-001 — Skeleton OpenAPI v1 (contrato mínimo completo)

Arquivo referência: `apps/api/openapi/v1.yaml`

```yaml
openapi: 3.1.0
info:
  title: EasyA2 API
  version: 1.0.0
servers:
  - url: /api/v1
paths:
  /health:
    get:
      operationId: getHealth
      responses:
        '200':
          description: OK
components:
  schemas:
    ProblemDetails:
      type: object
      properties:
        type: { type: string }
        title: { type: string }
        status: { type: integer }
        detail: { type: string }
        instance: { type: string }
  parameters:
    XCorrelationId:
      name: X-Correlation-ID
      in: header
      schema: { type: string, format: uuid }
    IdempotencyKey:
      name: Idempotency-Key
      in: header
      schema: { type: string }
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

## EX-OAS-002 — Regras Spectral mínimas (lint)

Arquivo referência: `apps/api/openapi/spectral.yaml`

```yaml
extends: ["spectral:oas"]
rules:
  path-versioning:
    description: All paths must start with api version
    given: $.paths[*]~
    then:
      field: "@key"
      function: pattern
      functionOptions:
        match: "^/api/v[0-9]+/"
  operation-operationId:
    description: Operation must have an operationId
    given: $.paths[*][*]
    then:
      field: operationId
      function: truthy
```

## EX-OAS-003 — Swagger UI local padronizado

Arquivo referência: `apps/api/src/docs/swagger-setup.example.ts`

```typescript
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { FastifyInstance } from 'fastify';
import path from 'path';

export async function setupSwagger(app: FastifyInstance) {
  await app.register(fastifySwagger, {
    mode: 'static',
    specification: {
      path: path.join(__dirname, '../../openapi/v1.yaml'),
      baseDir: path.join(__dirname, '../../openapi'),
    },
  });

  await app.register(fastifySwaggerUi, {
    routePrefix: '/docs',
  });
}
```

## EX-OAS-004 — Teste de contrato (OpenAPI)

Arquivo referência: `apps/api/src/tests/integration/openapi.contract.example.test.ts`

```typescript
import supertest from 'supertest';
import { expect, describe, it } from 'vitest';
import { matchers } from 'vitest-json-schema';
import swaggerDocument from '../../openapi/v1.json'; // parsed version
import { buildApp } from '../../server'; // fastify app factory

expect.extend(matchers);

describe('OpenAPI Contract Test', () => {
  it('should match schema for /health', async () => {
    const app = await buildApp();
    await app.ready();
    
    const res = await supertest(app.server).get('/api/v1/health');
    const schema = swaggerDocument.paths['/health'].get.responses['200'].content['application/json'].schema;
    expect(res.body).toMatchSchema(schema);
  });
});
```

---

# (ANEXO ADITIVO) OpenAPI x-permissions (timeline/notifications)
>
> `x-permissions` é **documentação**; enforcement real é comando (Emit) + ACL/tenant (View) e guard-rails por sensibilidade.

Snippet referência:

- `apps/api/openapi/snippets/timeline-notifications.x-permissions.yaml`

---

# (ANEXO ADITIVO) Eventos ↔ Permissões (SEC + DATA)
>
> Princípio: **não usar "permissão no evento" como fonte de verdade**; Emit = comando, View = ACL+tenant.

- Patch SEC: `SEC-002` (Matriz Emit/View/Notify)
- Patch DATA: `DATA-003` com catálogo obrigatório e rastreável

---

# (ANEXO ADITIVO) Infraestrutura e Observabilidade — EX-IDEMP-001, EX-RES-001, EX-OBS-001, EX-TRACE-001, EX-DB-001, EX-NAME-001

> Exemplos canônicos de padrões de infraestrutura, resiliência e observabilidade. Âncoras para o Gate de IDs (EX-CI-007).

## EX-IDEMP-001 — Idempotência em operações de escrita

Operações de escrita com efeito colateral DEVEM suportar `Idempotency-Key`. O middleware abaixo previne reprocessamento.

```typescript
// apps/api/src/infra/middleware/idempotency.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { redis } from '../cache/redis-client';

const IDEMPOTENCY_TTL = 86400; // 24h

export async function idempotencyGuard(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const key = request.headers['idempotency-key'] as string | undefined;
  if (!key) return; // sem chave = sem proteção (endpoints que não exigem)

  const cacheKey = `idempotency:${request.user.tenant_id}:${key}`;
  const cached = await redis.get(cacheKey);

  if (cached) {
    const previous = JSON.parse(cached);
    return reply.status(previous.status).send(previous.body);
  }

  // Armazena após resposta (hook onSend)
  reply.raw.on('finish', async () => {
    // Salva somente para 2xx
    if (reply.statusCode >= 200 && reply.statusCode < 300) {
      await redis.setex(
        cacheKey,
        IDEMPOTENCY_TTL,
        JSON.stringify({ status: reply.statusCode, body: reply.payload }),
      );
    }
  });
}
```

## EX-RES-001 — Resiliência com retry e circuit breaker

Chamadas a serviços externos ou integrações DEVEM implementar retry com backoff exponencial e circuit breaker para evitar cascata de falhas.

```typescript
// apps/api/src/infra/resilience/retry-with-breaker.ts

interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  circuitThreshold: number; // falhas consecutivas para abrir circuito
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 200,
  circuitThreshold: 5,
};

let consecutiveFailures = 0;
let circuitOpen = false;
let circuitOpenUntil = 0;

export async function withResilience<T>(
  fn: () => Promise<T>,
  opts: Partial<RetryOptions> = {},
): Promise<T> {
  const { maxRetries, baseDelayMs, circuitThreshold } = {
    ...DEFAULT_OPTIONS,
    ...opts,
  };

  if (circuitOpen && Date.now() < circuitOpenUntil) {
    throw new Error('Circuit breaker OPEN — request rejected');
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      consecutiveFailures = 0;
      circuitOpen = false;
      return result;
    } catch (err) {
      consecutiveFailures++;
      if (consecutiveFailures >= circuitThreshold) {
        circuitOpen = true;
        circuitOpenUntil = Date.now() + 30_000; // 30s cooldown
      }
      if (attempt === maxRetries) throw err;
      await new Promise((r) =>
        setTimeout(r, baseDelayMs * Math.pow(2, attempt)),
      );
    }
  }
  throw new Error('Unreachable');
}

// Uso:
const result = await withResilience(() => externalService.call(payload), {
  maxRetries: 3,
  baseDelayMs: 500,
});
```

## EX-OBS-001 — Observabilidade e telemetria estruturada

Todo módulo DEVE emitir logs estruturados com campos padronizados. O padrão garante rastreabilidade end-to-end.

```typescript
// apps/api/src/infra/observability/structured-logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL ?? 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  serializers: {
    req: (req) => ({
      method: req.method,
      url: req.url,
      correlation_id: req.headers['x-correlation-id'],
      tenant_id: req.user?.tenant_id,
    }),
  },
});

// Padrão de log por operação:
logger.info({
  event: 'user_created',
  correlation_id: request.headers['x-correlation-id'],
  tenant_id: request.user.tenant_id,
  actor_id: request.user.id,
  entity_id: createdUser.id,
  duration_ms: elapsed,
});

// Métricas expostas para Prometheus/Grafana:
// - http_requests_total{method, path, status}
// - http_request_duration_seconds{method, path}
// - domain_events_emitted_total{event_type, module}
// - background_jobs_duration_seconds{job_name, status}
```

## EX-TRACE-001 — Rastreabilidade com correlation_id

Toda requisição DEVE propagar `X-Correlation-ID` do request ao response, logs, domain events e jobs assíncronos. Se não recebido, o middleware DEVE gerar um UUID v4.

```typescript
// apps/api/src/infra/middleware/correlation-id.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'crypto';

export async function correlationIdHook(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const correlationId =
    (request.headers['x-correlation-id'] as string) ?? randomUUID();

  // Injeta no request para uso nos handlers/use cases
  request.correlationId = correlationId;

  // Propaga no response
  reply.header('X-Correlation-ID', correlationId);
}

// Propagação para domain events e jobs:
const event = {
  event_type: 'UserCreated',
  correlation_id: request.correlationId,
  actor_id: request.user.id,
  tenant_id: request.user.tenant_id,
  payload: { user_id: user.id },
  occurred_at: new Date().toISOString(),
};

// Propagação para BullMQ jobs:
await queue.add('send-welcome-email', {
  ...jobData,
  correlation_id: request.correlationId,
});
```

## EX-DB-001 — Campos obrigatórios em tabelas (padrão de schema)

Toda tabela do sistema DEVE incluir os campos base abaixo. O padrão garante auditoria, multi-tenancy e soft-delete uniformes.

```typescript
// apps/api/src/infra/db/base-columns.ts
import { pgTable, uuid, timestamp, varchar } from 'drizzle-orm/pg-core';

// Campos MUST em toda tabela:
export const baseColumns = {
  id: uuid('id').primaryKey().defaultRandom(),
  tenant_id: uuid('tenant_id').notNull(), // RLS — isolamento por tenant
  created_at: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  created_by: uuid('created_by').notNull(), // actor_id (quem criou)
  updated_by: uuid('updated_by').notNull(), // actor_id (última alteração)
  deleted_at: timestamp('deleted_at', { withTimezone: true }), // soft-delete
};

// Uso:
export const users = pgTable('users', {
  ...baseColumns,
  email: varchar('email', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  // ...campos específicos
});

// Índice obrigatório para RLS:
// CREATE INDEX idx_users_tenant_id ON users(tenant_id);
// CREATE INDEX idx_users_tenant_deleted ON users(tenant_id, deleted_at);
```

## EX-NAME-001 — Naming convention (banco, API, código)

Convenção de nomenclatura padronizada para garantir consistência entre camadas.

```
## Banco de Dados (PostgreSQL)
- Tabelas: snake_case, plural (ex: users, org_units, process_cycles)
- Colunas: snake_case (ex: tenant_id, created_at, deleted_at)
- Índices: idx_{tabela}_{colunas} (ex: idx_users_tenant_id)
- Foreign keys: fk_{tabela}_{referencia} (ex: fk_users_role_id)
- Constraints: chk_{tabela}_{regra} (ex: chk_users_email_format)

## API (endpoints)
- Paths: kebab-case, plural (ex: /api/v1/org-units, /api/v1/process-cycles)
- Query params: snake_case (ex: ?page_size=20&sort_by=created_at)
- Body fields: camelCase (ex: { tenantId, createdAt, orgUnitId })
- Headers: Title-Case-Hyphen (ex: X-Correlation-ID, Idempotency-Key)

## Código (TypeScript)
- Arquivos: kebab-case (ex: user-repository.ts, create-user.use-case.ts)
- Classes/Interfaces: PascalCase (ex: UserRepository, CreateUserUseCase)
- Variáveis/funções: camelCase (ex: findByTenantId, userScopes)
- Constantes: UPPER_SNAKE_CASE (ex: MAX_PAGE_SIZE, IDEMPOTENCY_TTL)
- Enums: PascalCase (membros UPPER_SNAKE_CASE)
```
