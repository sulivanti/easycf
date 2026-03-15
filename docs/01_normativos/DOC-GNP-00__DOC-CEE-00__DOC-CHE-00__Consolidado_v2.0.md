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

- Patch SEC: `SEC-EventMatrix` (Matriz Emit/View/Notify)
- Patch DATA: `DATA-003` com catálogo obrigatório e rastreável
