# DOC-ARC-001 — Padrões de Contrato OpenAPI/Swagger

- **id:** DOC-ARC-001
- **version:** 1.0.0
- **status:** ACTIVE
- **data_ultima_revisao:** 2026-03-04
- **owner:** arquitetura
- **scope:** global (todos os módulos)
- **supersedes:** DOC-DEV-001 §5.3

> **Fonte de verdade:** Este documento substituiu a seção §5.3 do `DOC-DEV-001`.

---

## A) Organização do OpenAPI (MUST)

- **Arquivo canônico por versão:** `apps/api/openapi/v{X}.yaml` (ex.: `apps/api/openapi/v1.yaml`).
- **Paths versionados:** toda operação exposta deve iniciar com `/api/v{X}/...`.
- **OpenAPI recomendado:** `openapi: 3.1.0` (preferível); se houver restrição de tooling, 3.0.x é aceitável.
- **Reuso obrigatório:** usar `components` + `$ref` para evitar duplicação (schemas, responses, parameters, securitySchemes).

---

## B) Convenções por Operação (MUST)

Para cada `paths.{path}.{method}`:

1. **`operationId` único e estável** (padrão sugerido: `{modulo}_{acao}` — ex.: `payments_create`, `users_list`).
2. **`tags` por módulo** (ex.: `Payments`, `Users`) para facilitar navegação e ownership.
3. **Resumo e descrição:** `summary` obrigatório; `description` quando houver nuance/regra de negócio.
4. **Headers padronizados:**
   - `X-Correlation-ID`: obrigatório em request e response.
   - `Idempotency-Key`: obrigatório em operações de escrita com efeito colateral quando aplicável.
5. **Erros padronizados:** respostas `4xx/5xx` MUST usar `application/problem+json` (RFC 9457) com `extensions.correlationId`.
   - Para 422: `extensions.invalid_fields[]` (campos inválidos).
6. **Paginação e filtros:** endpoints de listagem MUST padronizar query params + envelope `{ data, meta }`. Endpoints de timeline/histórico DEVEM usar **Cursor Pagination** (`?limit=N&cursor=...`); listagens CRUD simples PODEM usar **Offset Pagination** (`?page=N&page_size=N`).
7. **Segurança:** declarar `security` por operação (ou global) e `components.securitySchemes` (JWT/OAuth/etc).

---

## C) Componentes Reutilizáveis (SHOULD)

- `components.schemas.ProblemDetails` (RFC 9457) + `components.responses.*` (401/403/404/409/422/500).
- `components.parameters.XCorrelationId`, `components.parameters.IdempotencyKey`.
- Schemas de paginação e metadados (ex.: `PaginationMeta`, `ListEnvelope<T>`).

---

## D) Qualidade do Contrato (SHOULD — recomendado forte)

- Incluir `examples` para requests e responses críticas (principalmente erros 404/409/422 e retornos 200/201).
- Sempre declarar `required` nos campos realmente obrigatórios e evitar schemas frouxos (`any`/`object` sem `properties`).
- Evitar breaking changes silenciosas: remoção/renome de campos exige versão nova (`v2.yaml`).

---

## E) Estratégia de Geração (MUST)

A estratégia pode ser:

- **Spec-first:** o YAML é atualizado primeiro e a implementação segue o contrato; OU
- **Code-first:** o OpenAPI é gerado a partir de código/DTOs/anotações.

Independente da estratégia:

- O artefato final **MUST** ser o YAML/JSON versionado no repositório (`apps/api/openapi/v{X}.yaml`).
- Mudanças em rotas/DTOs/responses **MUST** refletir no OpenAPI na **mesma PR**.
- O CI **MUST** aplicar lint (Spectral) e validação de contrato.

---

## F) Tooling Recomendado

| Script | Função |
|---|---|
| `openapi:lint` | Roda Spectral no `openapi/v{X}.yaml` |
| `openapi:validate` | Valida OpenAPI (parser) |
| `openapi:serve` | Sobe Swagger UI local apontando para o YAML versionado |
| `openapi:contract-test` | Valida responses reais/fixtures contra schema OpenAPI |

---

## G) Definition of Done (DoD) por Endpoint (MUST)

Um endpoint só é "Done" se:

- [ ] Está implementado e testado
- [ ] Está documentado no OpenAPI da versão correta (`apps/api/openapi/v{X}.yaml`)
- [ ] Declara headers obrigatórios (`X-Correlation-ID`, `Idempotency-Key` quando aplicável)
- [ ] Declara responses de erro em Problem Details (`application/problem+json`)
- [ ] Passa lint (Spectral) e gates de contrato no CI

---

## H) OpenAPI — x-permissions (Timeline/Notifications)

- Snippet de referência: `apps/api/openapi/snippets/timeline-notifications.x-permissions.yaml`
- Regra (MUST): `x-permissions` é **documentação**; enforcement real segue:
  - **Emit:** permissão do comando
  - **View:** ACL da entity originária + tenant
  - `visibility_level/sensitivity_level`: guard-rail/mascaramento

> Ver regras completas em: DOC-FND-000 §3 (SEC-002 — Matriz de Autorização de Eventos)

---

---

## Apêndice — Exemplos Canônicos (EX-*)

> Âncoras referenciáveis por módulos via `referencias_exemplos`. Cada ID é único e rastreável pelo Gate de IDs (EX-CI-007).

### EX-API-001 — Endpoint CRUD completo (padrão OpenAPI)

Exemplo de endpoint de listagem com todos os headers, paginação, segurança e error responses obrigatórios.

```yaml
# apps/api/openapi/v1.yaml (trecho)
paths:
  /api/v1/users:
    get:
      operationId: users_list
      tags: [Users]
      summary: Lista usuários do tenant
      description: Retorna lista paginada de usuários ativos com filtros opcionais.
      parameters:
        - $ref: '#/components/parameters/XCorrelationId'
        - name: page
          in: query
          schema: { type: integer, minimum: 1, default: 1 }
        - name: page_size
          in: query
          schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
        - name: search
          in: query
          schema: { type: string }
          description: Busca por nome ou e-mail
      security:
        - bearerAuth: []
      responses:
        '200':
          description: Lista paginada
          headers:
            X-Correlation-ID:
              schema: { type: string, format: uuid }
          content:
            application/json:
              schema:
                type: object
                properties:
                  data:
                    type: array
                    items: { $ref: '#/components/schemas/UserSummary' }
                  meta:
                    $ref: '#/components/schemas/PaginationMeta'
        '401': { $ref: '#/components/responses/Unauthorized' }
        '403': { $ref: '#/components/responses/Forbidden' }
    post:
      operationId: users_create
      tags: [Users]
      summary: Cria um novo usuário
      parameters:
        - $ref: '#/components/parameters/XCorrelationId'
        - $ref: '#/components/parameters/IdempotencyKey'
      security:
        - bearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/CreateUserInput' }
      responses:
        '201':
          description: Usuário criado
          content:
            application/json:
              schema: { $ref: '#/components/schemas/User' }
        '409': { $ref: '#/components/responses/Conflict' }
        '422': { $ref: '#/components/responses/UnprocessableEntity' }
```

### EX-PAGE-001 — Paginação padronizada (offset e cursor)

Padrões de paginação para listagens CRUD (offset) e timelines/histórico (cursor).

```yaml
# Offset Pagination (listagens CRUD simples)
components:
  schemas:
    PaginationMeta:
      type: object
      required: [page, page_size, total, total_pages]
      properties:
        page: { type: integer, example: 1 }
        page_size: { type: integer, example: 20 }
        total: { type: integer, example: 150 }
        total_pages: { type: integer, example: 8 }
```

```yaml
# Cursor Pagination (timelines, notifications, histórico)
components:
  schemas:
    CursorPaginationMeta:
      type: object
      required: [limit, has_more]
      properties:
        limit: { type: integer, example: 50 }
        next_cursor: { type: string, nullable: true, example: "eyJpZCI6MTAwfQ==" }
        has_more: { type: boolean, example: true }

  parameters:
    CursorParam:
      name: cursor
      in: query
      schema: { type: string }
      description: Cursor opaco retornado em meta.next_cursor
    LimitParam:
      name: limit
      in: query
      schema: { type: integer, minimum: 1, maximum: 100, default: 50 }
```

```typescript
// Uso no handler (cursor pagination):
const { limit = 50, cursor } = request.query;
const decodedCursor = cursor ? decodeCursor(cursor) : null;

const rows = await db
  .select()
  .from(events)
  .where(
    and(
      eq(events.tenant_id, tenantId),
      decodedCursor ? lt(events.id, decodedCursor.id) : undefined,
    ),
  )
  .orderBy(desc(events.created_at))
  .limit(limit + 1); // +1 para detectar has_more

const hasMore = rows.length > limit;
const data = hasMore ? rows.slice(0, limit) : rows;

return {
  data,
  meta: {
    limit,
    has_more: hasMore,
    next_cursor: hasMore ? encodeCursor({ id: data[data.length - 1].id }) : null,
  },
};
```

---

## Metadados

> Bloco de metadados canônico movido para o topo do documento (padrão DOC-PADRAO-META v1.0.0).
