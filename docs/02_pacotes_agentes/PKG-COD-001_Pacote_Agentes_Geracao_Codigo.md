# PKG-COD-001 — Pacote 2: Agentes de Geração de Código (GNP + CEE + CHE) (6 agentes)

**id:** PKG-COD-001
**Versão:** 1.5.1
**Data:** 2026-03-26
**Base:** DOC-DEV-001 + DOC-ESC-001 + DOC-GNP-00 v2.0 + DOC-GPA-001 + EX-OAS-* + Events↔Permissions Pack + UX-010

Este pacote define **6 agentes especialistas** para geração de código e validação, focando em atuar de forma isolada nas **Camadas da Arquitetura** do projeto.

---

## 0) Contrato de execução (comum a todos)

### 0.1 Regras de saída e Structured Outputs (MUST)

- O orquestrador (`Node.js`) **MUST** utilizar capacidades nativas de `Structured Outputs` (ex: `response_format: { type: "json_schema" }`) da API da LLM.
- A saída deve ser estritamente aderente ao JSON Schema definido. O uso de parsers baseados em "Regex/Tolerância" no código está desencorajado, garantindo a integridade via contrato strict na chamada LLM.
- Se não puder cumprir sem inventar: retornar `error` padrão.

### 0.2 Envelope padrão (MUST)

```json
{
  "agent_meta": {
    "contract": "DOC-AGN-BASE",
    "agent_id": "AGN-COD-XX",
    "agent_name": "…",
    "version": "1.3",
    "mode": "conservador|criativo",
    "run_id": "uuid-opcional",
    "attempt": 1
  },
  "work_log": {
    "assumptions": ["…"],
    "approach": ["…"],
    "missing_info": ["…"]
  },
  "result": {},
  "validation": {
    "checks_passed": ["…"],
    "checks_failed": ["…"]
  }
}
```

### 0.3 Erro padrão (MUST)

```json
{
  "error": {
    "code": "CANNOT_COMPLY",
    "message": "motivo objetivo",
    "missing_info": ["perguntas objetivas (se aplicável)"]
  }
}
```

### 0.4 Integração Obrigatória com Skills (MUST)

- Os agentes COD **MUST** obrigatoriamente consultar e utilizar as skills presentes no diretório `.claude/commands` (como `forge-module`, `update-specification`, `readme-blueprint`, etc.) ao gerarem código ou documentação interna da arquitetura.
- O uso dessas skills garante o emprego de templates, prompts (via `prompt-builder`) e fluxos previamente testados, prevenindo construções ad-hoc fora dos padrões de padronização do projeto.

---

## 1) Regra de Produção e Ownership: "Plan → Generate (chunked)" (MUST)

Para evitar truncamento e prevenir sobrescrita acidental, o orquestrador opera em duas fases:

- **Fase A (PLAN):** agente retorna plano de arquivos dentro do escopo (`ownership.allowed_prefixes`). **Sem gerar conteúdo**.
- **Fase B (EMIT_FILES):** orquestrador pede **1 arquivo por vez** (recomendado) até `remaining_files=[]`.

Regras de segurança e parsing:

- Agente **NÃO PODE** escrever fora de `allowed_prefixes`.
- Conteúdo de arquivo **MUST** ser `content_lines[]` (array), evitando string gigante/truncamento.
- `@contract` MUST aparecer em cabeçalho/JSDoc de artefatos relevantes (EX-* e IDs FR/BR/…).

---

## 2) Schema `result` (para produtores COD)

### 2.1 Phase A — `plan`

```json
{
  "phase": "plan",
  "ownership": {
    "allowed_prefixes": ["apps/api/src/..."],
    "deny_patterns": ["../", "~", "/etc/"]
  },
  "file_tree": ["..."],
  "plan": {
    "ordered_files": ["path/a.ts", "path/b.ts"],
    "notes": ["..."]
  },
  "contract_refs": {
    "ex_ids": ["EX-..."],
    "notes": ["..."]
  }
}
```

### 2.2 Phase B — `emit_files`

```json
{
  "phase": "emit_files",
  "files": [
    {
      "path": "apps/api/src/....ts",
      "content_lines": ["line 1", "line 2"],
      "file_chunk": { "part": 1, "of": 1 }
    }
  ],
  "remaining_files": ["..."],
  "partial": false,
  "suggested_commands": ["npm test", "npm run lint"],
  "contract_refs": {
    "ex_ids": ["EX-..."],
    "notes": ["..."]
  }
}
```

---

## 3) Catálogo de Agentes de Geração (Camadas e Ownership)

### 3.1 AGN-COD-DB — Banco de Dados

- **Allowed Prefixes:** `apps/api/src/infrastructure/`, `apps/api/db/migrations/`, `apps/api/db/schema/`
- **Protagonismo:** migrações, DDL, JSONB, índices, constraints, soft delete.
- **Anti-Pattern Foundation:** Nunca crie DDL/migrations de `users`, `tenants` ou sessões, a menos que o módulo seja explicitamente de Identidade. Faça apenas chaves estrangeiras (`FK`) para estas tabelas.

**Amarração com eventos/notificações**

- Se implementar `domain_events`, `notifications`, `outbox`, watchers: aplicar as regras do domínio (DATA-003/004/005 etc) e respeitar SEC-002 (Emit/View/Notify).

### 3.2 AGN-COD-CORE — Domínio (DDD-lite)

- **Allowed Prefixes:** `apps/api/src/domain/`
- **Protagonismo:** entidades/VO/invariantes baseadas estritamente em BR-xxx.

**Contratos Obrigatórios — Domain Errors (MUST)**

1. **MUST** estender `DomainError` (classe abstrata de `apps/api/src/modules/foundation/domain/errors/domain-errors.ts`). **NUNCA** usar `extends Error` diretamente.
2. **MUST** incluir campo `readonly type: string` com URI Problem Details (RFC 9457). Formato: `'/problems/{kebab-case-error-name}'`.
3. **MUST** incluir campo `readonly statusHint: number` com HTTP status code semântico (400, 403, 404, 409, 422, etc.).
4. **MUST NOT** usar campos `code` ou `statusCode` — esses são substituídos por `type` e `statusHint` conforme DOC-GNP-00.
5. **MUST** importar `DomainError` do Foundation: `import { DomainError } from '@modules/foundation/domain/errors/domain-errors';`

```typescript
// ✅ CORRETO — padrão obrigatório
import { DomainError } from '@modules/foundation/domain/errors/domain-errors';

export class ResourceNotAvailableError extends DomainError {
  readonly type = '/problems/resource-not-available';
  readonly statusHint = 422;
  constructor(resourceId: string) {
    super(`Resource ${resourceId} is not available`);
  }
}

// ❌ PROIBIDO — extends Error direto
export class ResourceNotAvailableError extends Error {
  readonly code = 'RESOURCE_NOT_AVAILABLE';
  readonly statusCode = 422;
}
```

### 3.3 AGN-COD-APP — Application/UseCases

- **Allowed Prefixes:** `apps/api/src/application/`
- **Protagonismo:** transações, idempotência, autorização fina (SEC-xxx), despacho/consumo de eventos.

**Amarração Events↔Permissions (MUST)**

- Emit: checar permissão do comando.
- View: manter ACL+tenant como regra forte.
- Notify: resolver destinatários conforme SEC-002 (watchers + papéis + hierarquia).

### 3.4 AGN-COD-API — Endpoints + OpenAPI

- **Allowed Prefixes:** `apps/api/src/presentation/`, `apps/api/src/shared/`, **e** `apps/api/openapi/`, `apps/api/src/docs/`, `apps/api/test/`
- **Protagonismo:** controllers, routers, DTOs, Problem Details, headers, e **contrato OpenAPI**.
- **Anti-Pattern Foundation:** Nunca recrie middlewares de JWT, autenticação ou parsing de token. Utilize o guard existente (ex: `@RequireScope('module:res:act')`) exposto pelo container ou framework base.

**OpenAPI (MUST, EX-OAS)**

- Gerar/manter:

  - `apps/api/openapi/v1.yaml` (**EX-OAS-001**)
  - `apps/api/openapi/spectral.yaml` (**EX-OAS-002**)
  - Swagger UI local (**EX-OAS-003**)
  - Teste de contrato (**EX-OAS-004**)

**x-permissions (quando aplicável)**

- Para timeline/notifications, documentar `x-permissions` no OpenAPI como metadado (não enforcement).
- Usar o snippet:

  - `apps/api/openapi/snippets/timeline-notifications.x-permissions.yaml`

**Anti-Pattern DTO Datetime (MUST NOT, EX-DTO-001)**

Em Zod schemas de response DTO, campos datetime **MUST** usar `z.string()` — **NUNCA** `z.string().datetime()`. O `serializerCompiler` do `fastify-type-provider-zod` valida estritamente o response body e `.datetime()` rejeita ISO strings retornadas pelo PostgreSQL/Drizzle, causando HTTP 500. Ref: DOC-GNP-00 EX-DTO-001.

```typescript
// ❌ MUST NOT — causa HTTP 500
created_at: z.string().datetime()
updated_at: z.string().datetime().nullable()

// ✅ MUST — seguro para serialização
created_at: z.string()
updated_at: z.string().nullable()
```

### 3.5 AGN-COD-WEB — Frontend

- **Allowed Prefixes:** `apps/web/src/modules/{slug}/`
- **Protagonismo:** UI, estados Loading/Empty/Error conforme UX-xxx; consumo de API.
- **Required Docs:** DOC-GNP-00, DOC-UX-010, DOC-UX-011, DOC-UX-012, DOC-UX-013

**Contratos Obrigatórios — Estrutura de Diretório (MUST)**

Todo módulo web **MUST** seguir a estrutura **Pattern A** abaixo. **NUNCA** gerar variantes alternativas (data/domain/ui/):

```
apps/web/src/modules/{slug}/
├── api/            # Clients HTTP (fetch wrappers tipados)
├── components/     # Componentes específicos do módulo ({EntityName}Card, {EntityName}Timeline)
├── hooks/          # React hooks (useQuery/useMutation wrappers)
├── pages/          # Page components (1 por rota)
└── types/          # TypeScript types/interfaces do módulo
```

**Contratos Obrigatórios — React Query (MUST)**

1. **MUST** criar hooks wrapper em `hooks/` usando `useQuery()` para reads e `useMutation()` para writes (de `@tanstack/react-query`).
2. **MUST NOT** fazer chamadas fetch diretas em componentes — toda interação com API passa por hooks.
3. **MUST** usar `queryKey` estruturado: `['{slug}', '{entity}', ...params]`.

```typescript
// ✅ CORRETO — hook wrapper obrigatório
import { useQuery } from '@tanstack/react-query';
import { listItems } from '../api/{slug}.api';

export function useItems(filters: ItemFilters) {
  return useQuery({
    queryKey: ['{slug}', '{entity}', filters],
    queryFn: () => listItems(filters),
  });
}
```

**Regras de Styling (MUST)**

1. **MUST** usar exclusivamente Tailwind CSS v4 para styling de layout, cor e tipografia.
2. **MUST NOT** usar inline `style={{}}` para layout, cor, tipografia ou espaçamento. Exceções: valores dinâmicos em runtime (ex: `style={{ width: `${progress}%` }}`).
3. **MUST** usar tokens semânticos definidos no `@theme` (DOC-UX-013 §2). Hex/RGB hardcoded é proibido.

**Regras de Componentes (MUST)**

4. **MUST** importar componentes de UI de `@shared/ui/` (Button, Input, Badge, Modal, Drawer, Table, Skeleton, Toast, Spinner).
5. **MUST NOT** recriar componentes equivalentes dentro de `src/modules/{slug}/`. Shared components são ownership exclusivo do scaffold.
6. Componentes específicos do módulo (ex: `{EntityName}Card`, `{EntityName}Timeline`) podem ser criados em `src/modules/{slug}/components/`.

**Regras de Roteamento (MUST)**

7. **MUST** usar `<Link>` ou `router.navigate()` do `@tanstack/react-router` para navegação in-app.
8. **MUST NOT** usar `window.location.href` para navegação interna.
9. **MUST** criar rotas lazy-loaded via `lazy()` do TanStack Router.

**Regras de Animação (MUST)**

10. **MUST** usar `motion` (DOC-PADRAO-002 §3.5) para animações de Modal (scale-up + backdrop), Drawer (slide), Toast (slide + fade).
11. **MUST** respeitar `prefers-reduced-motion` — animações instantâneas quando redução é solicitada.

**Regras de State (MUST)**

12. **MUST** usar `@tanstack/react-query` para server state (cache, refetch, invalidation).
13. **MUST** usar Router Context do `@tanstack/react-router` para dados de autenticação (user, scopes, tenantId).
14. **MUST NOT** usar Redux, Zustand ou React Context genérico para auth state.

**Anti-Pattern Foundation**

- Nunca recrie guards de autenticação — use os Route Guards definidos em DOC-UX-011 §3.3.
- Nunca recrie componentes de feedback (Toast, Spinner) — importe de `@shared/ui/`.

---

## 4) Validador do Pacote (Tópico 0)

> **Regra de Orquestração (Chunking):** Para otimizar tokens e evitar gargalos de contexto LLM, o orquestrador Node.js **MUST** fatiar o documento de Especificação Executável (por Headings) e fornecer ao validador estrutural apenas a fração de Markdown estrita correspondente ao módulo/camada em análise.

### 4.1 AGN-COD-VAL — Validador Global

- **Propósito:** validar output de `AGN-COD-*` contra o pacote e checklist de qualidade.

### 4.2 Schema `result` (AGN-COD-VAL)

```json
{
  "code_validation": {
    "summary": { "errors": 0, "warnings": 0, "notes": 0 },
    "findings": [
      {
        "severity": "error|warning|note",
        "location": "caminho/do/arquivo/ou/regra",
        "message": "…",
        "fix_suggestion": "…",
        "contract_refs": { "ex_ids": ["EX-..."], "notes": ["…"] }
      }
    ],
    "checks": {
      "problem_details_rfc9457": true,
      "correlation_id": true,
      "idempotency": "ok|missing|n/a",
      "layering_clean_arch": "ok|warning",
      "tests_present": "ok|missing",
      "openapi_present_and_linted": "ok|missing|n/a",
      "x_permissions_documented": "ok|missing|n/a"
    },
    "pagination": { "partial": false, "next_cursor": "...", "page_size": 50 }
  }
}
```

---

## 5) Template de System Prompt (base para qualquer agente de Código)

```text
SYSTEM:
Você é o agente especialista <AGN-XXX>. Propósito: <foco exclusivo da sua Camada/Validador>.

Prioridade:
1) Não inventar dependências/fatos; se faltar escopo, usar work_log.missing_info.
2) Cumprir DOC-GNP-00 v2.0 + DOC-ESC-001 + DOC-DEV-001. Aderir estritamente aos Anti-Patterns do Foundation (Não recrie usuários, tenants ou guardiões genéricos de auth).
3) Responder apenas JSON válido. (Retorne APENAS o JSON. Não inclua saudações, explicacoes prévias ou marcações markdown).
4) Rastreabilidade: se gerar artefato baseado em exemplo normativo, incluir @contract EX-... no código e registrar em result.contract_refs.ex_ids.

OpenAPI (quando AGN-COD-API):
- MUST cumprir EX-OAS-001..004 e, quando existir timeline/notifications, documentar x-permissions (metadado).
```

---

## 6) Changelog

- v1.5.1 (2026-03-26): Merge PKG-COD-001-C01: anti-pattern DTO datetime em §3.4 AGN-COD-API — MUST NOT usar `.datetime()` em Zod response DTOs. Ref: DOC-GNP-00 EX-DTO-001.
- v1.5 (2026-03-24): Adição de **Contratos Obrigatórios** em §3.2 (DomainError, RFC 9457) e §3.5 (Pattern A, React Query hooks). Causa raiz: auditoria detectou 27 classes de erro com `extends Error` e 2 padrões web incompatíveis gerados por codegen sem enforcement.
- v1.4 (2026-03-24): Expansão de §3.5 AGN-COD-WEB com regras MUST para Tailwind, shared components, TanStack Router, motion e React Query. Allowed prefixes refinados para `apps/web/src/modules/{slug}/`.
- v1.3 (2026-03-02): Adição do subtópico 0.4 que obriga o uso de skills do diretório `.claude/commands`.
- v1.2 (2026-02-27): Amarração explícita com EX-OAS-001..004, x-permissions (timeline/notifications), SEC-002, DATA-003 e UX-010; expansão de ownership do AGN-COD-API para `apps/api/openapi/`.
- v1.1 (2026-02-22): Base por camadas, plan→emit_files, content_lines[], validador.
