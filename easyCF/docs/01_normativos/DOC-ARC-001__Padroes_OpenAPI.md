# DOC-ARC-001 — Padrões de Contrato OpenAPI/Swagger

> **Escopo:** Normativo global — aplicável a todas as rotas sob `/api/v{X}/...` em todos os módulos.  
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
6. **Paginação e filtros:** endpoints de listagem MUST padronizar query params + envelope `{ data, meta }` (cursor quando aplicável).
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

> Ver regras completas em: `docs/04_modules/mod-000-foundation/requirements/sec/SEC-000.md → SEC-EventMatrix`

---

## Metadados

- id: DOC-ARC-001
- title: Padrões de Contrato OpenAPI/Swagger
- version: 1.0
- status: Ativo
- data_ultima_revisao: 2026-03-04
- owner: arquitetura
- scope: global (todos os módulos)
- migrado_de: DOC-DEV-001 §5.3
