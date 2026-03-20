> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-19 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-19 | AGN-DEV-04  | Enriquecimento DATA — 6 tabelas completas com campos, tipos, constraints, índices, FKs, soft-delete |
| 0.3.0  | 2026-03-19 | arquitetura | §5 — Seed data HML para testes (PEN-008/PENDENTE-005) |

# DATA-008 — Modelo de Dados da Integração Dinâmica Protheus

> Permitir gerar **modelo**, **migração**, **queries** e **contratos** sem inferência arriscada.

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-008, US-MOD-008-F01, US-MOD-008-F02, US-MOD-008-F03, BR-008, FR-008, SEC-008, DATA-003, INT-008, DOC-FND-000
- **referencias_exemplos:** EX-DEV-001 (Envelope DATA)
- **evidencias:** N/A

---

## Visão Geral

O MOD-008 possui **6 tabelas** organizadas em 3 domínios:

1. **Catálogo:** `integration_services`
2. **Configuração:** `integration_routines`, `integration_field_mappings`, `integration_params`
3. **Execução:** `integration_call_logs`, `integration_reprocess_requests`

**Tipo de Tabela/Armazenamento:** PostgreSQL — tabelas próprias do módulo com soft delete (padrão `deleted_at` nullable).

**Anti-patterns Foundation (DOC-FND-000):** Este modelo NÃO recria entidades de users, tenants ou auth. Utiliza apenas FKs para `users(id)` e `tenants(id)`.

---

## 1. Diagrama de Relacionamento

```
tenants (MOD-000)
  └── integration_services (N)

behavior_routines (MOD-007, routine_type='INTEGRATION')
  └── integration_routines (1:1)
        ├── integration_field_mappings (N)
        ├── integration_params (N)
        └── integration_call_logs (N)
              └── integration_reprocess_requests (N)

integration_services (1)
  └── integration_routines (N)
```

---

## 2. Entidades

### 2.1 `integration_services` — Catálogo de Serviços de Destino

> Registra serviços externos (Protheus/TOTVS) com URL, autenticação e configuração de ambiente.

| Campo | Tipo | Required | Constraint | Descrição |
|---|---|---|---|---|
| `id` | uuid | SIM | PK | |
| `tenant_id` | uuid | SIM | FK→tenants(id) NOT NULL | Isolamento multi-tenant (DOC-FND-000) |
| `codigo` | varchar(50) | SIM | NOT NULL | Ex: PROTHEUS-PROD, PROTHEUS-HML |
| `nome` | varchar(200) | SIM | NOT NULL | Nome amigável do serviço |
| `base_url` | varchar(500) | SIM | NOT NULL | Ex: https://protheus.empresa.com/rest |
| `auth_type` | varchar(20) | SIM | NOT NULL, CHECK IN ('NONE','BASIC','BEARER','OAUTH2') | Tipo de autenticação |
| `auth_config` | jsonb | NÃO | nullable | Credenciais criptografadas (AES-256). NUNCA retornado em GET (BR-002) |
| `timeout_ms` | integer | SIM | NOT NULL, default 30000 | Timeout padrão para chamadas ao serviço |
| `status` | varchar(20) | SIM | NOT NULL, CHECK IN ('ACTIVE','INACTIVE') | Status operacional |
| `environment` | varchar(10) | SIM | NOT NULL, CHECK IN ('PROD','HML','DEV') | Ambiente do serviço |
| `created_by` | uuid | SIM | FK→users(id) NOT NULL | Usuário que criou |
| `created_at` | timestamptz | SIM | NOT NULL, default now() | |
| `updated_at` | timestamptz | SIM | NOT NULL, default now() | |
| `deleted_at` | timestamptz | NÃO | nullable | Soft delete |

**Constraints:**
- `UNIQUE(tenant_id, codigo) WHERE deleted_at IS NULL` — unicidade de código por tenant
- `CHECK(auth_type IN ('NONE', 'BASIC', 'BEARER', 'OAUTH2'))`
- `CHECK(status IN ('ACTIVE', 'INACTIVE'))`
- `CHECK(environment IN ('PROD', 'HML', 'DEV'))`
- `CHECK(timeout_ms > 0 AND timeout_ms <= 120000)`
- FK `tenant_id` → `tenants(id)` ON DELETE RESTRICT
- FK `created_by` → `users(id)` ON DELETE RESTRICT

**Indexes:**
- `idx_integration_services_tenant_id` → `(tenant_id)`
- `idx_integration_services_tenant_codigo` → `(tenant_id, codigo) WHERE deleted_at IS NULL` — suporta UNIQUE
- `idx_integration_services_tenant_status` → `(tenant_id, status) WHERE deleted_at IS NULL` — listagem filtrada

**Soft-delete policy:** Serviços referenciados por `integration_routines` ativas NÃO podem ser soft-deleted (BR-003). Validação no application layer.

**Volume estimado:** ~10-50 registros por tenant (poucos serviços por ambiente).

---

### 2.2 `integration_routines` — Extensão HTTP das Rotinas de Integração

> Extensão 1:1 de `behavior_routines` (MOD-007) para rotinas com `routine_type='INTEGRATION'`. Define configuração HTTP, endpoint template, retry e trigger events.

| Campo | Tipo | Required | Constraint | Descrição |
|---|---|---|---|---|
| `id` | uuid | SIM | PK | |
| `tenant_id` | uuid | SIM | FK→tenants(id) NOT NULL | Isolamento multi-tenant (DOC-FND-000) |
| `routine_id` | uuid | SIM | FK→behavior_routines(id) UNIQUE NOT NULL | Rotina base (routine_type='INTEGRATION') |
| `service_id` | uuid | SIM | FK→integration_services(id) NOT NULL | Serviço de destino |
| `http_method` | varchar(10) | SIM | NOT NULL, CHECK IN ('GET','POST','PUT','PATCH','DELETE') | Método HTTP |
| `endpoint_tpl` | varchar(500) | SIM | NOT NULL | Template com vars: `/api/pedidos/{pedido_id}` |
| `content_type` | varchar(100) | NÃO | default 'application/json' | Content-Type do request |
| `timeout_ms` | integer | NÃO | nullable | Sobrescreve integration_services.timeout_ms se preenchido |
| `retry_max` | integer | SIM | NOT NULL, default 3 | 0 = sem retry |
| `retry_backoff_ms` | integer | SIM | NOT NULL, default 1000 | Dobra a cada retry (backoff exponencial: retry_backoff_ms × 2^(attempt-1)) |
| `trigger_events` | jsonb | NÃO | nullable | Array de event_types que disparam esta rotina. Ex: ["case.stage_transitioned","case.opened"] |
| `created_at` | timestamptz | SIM | NOT NULL, default now() | |
| `updated_at` | timestamptz | SIM | NOT NULL, default now() | |
| `deleted_at` | timestamptz | NÃO | nullable | Soft delete |

**Constraints:**
- `UNIQUE(routine_id) WHERE deleted_at IS NULL` — extensão 1:1
- `CHECK(http_method IN ('GET', 'POST', 'PUT', 'PATCH', 'DELETE'))`
- `CHECK(retry_max >= 0 AND retry_max <= 10)`
- `CHECK(retry_backoff_ms >= 100 AND retry_backoff_ms <= 60000)`
- `CHECK(timeout_ms IS NULL OR (timeout_ms > 0 AND timeout_ms <= 120000))`
- FK `tenant_id` → `tenants(id)` ON DELETE RESTRICT
- FK `routine_id` → `behavior_routines(id)` ON DELETE RESTRICT
- FK `service_id` → `integration_services(id)` ON DELETE RESTRICT

**Indexes:**
- `idx_integration_routines_tenant_id` → `(tenant_id)`
- `idx_integration_routines_routine_id` → `(routine_id) WHERE deleted_at IS NULL` — suporta UNIQUE
- `idx_integration_routines_service_id` → `(service_id) WHERE deleted_at IS NULL` — busca por serviço

**Soft-delete policy:** Herda imutabilidade do MOD-007 — rotinas PUBLISHED são imutáveis (BR-001). Soft-delete apenas para DRAFT/DEPRECATED.

**Volume estimado:** ~50-200 rotinas por tenant.

**Nota de herança (MOD-007):** O versionamento (DRAFT→PUBLISHED→DEPRECATED), fork e imutabilidade são controlados na tabela `behavior_routines` do MOD-007. Esta tabela apenas estende com configuração HTTP.

---

### 2.3 `integration_field_mappings` — Mapeamento de Campos

> Define como os campos do sistema interno são mapeados para o payload da chamada HTTP ao Protheus.

| Campo | Tipo | Required | Constraint | Descrição |
|---|---|---|---|---|
| `id` | uuid | SIM | PK | |
| `tenant_id` | uuid | SIM | FK→tenants(id) NOT NULL | Isolamento multi-tenant (DOC-FND-000) |
| `routine_id` | uuid | SIM | FK→behavior_routines(id) NOT NULL | Rotina de integração associada |
| `source_field` | varchar(200) | SIM | NOT NULL | Campo do sistema (ex: caso.numero_pedido) |
| `target_field` | varchar(200) | SIM | NOT NULL | Campo do Protheus (ex: C5_NUM) |
| `mapping_type` | varchar(20) | SIM | NOT NULL, CHECK IN ('FIELD','PARAM','HEADER','FIXED_VALUE','DERIVED') | Tipo do mapeamento |
| `required` | boolean | SIM | NOT NULL, default false | Campo obrigatório no payload |
| `transform_expr` | text | NÃO | nullable | Expressão de transformação (ex: UPPER(value)) |
| `condition_expr` | text | NÃO | nullable | Condição de inclusão no payload |
| `default_value` | varchar(500) | NÃO | nullable | Valor padrão se source vazio |
| `ordem` | integer | SIM | NOT NULL | Ordem de montagem do payload |
| `created_at` | timestamptz | SIM | NOT NULL, default now() | |
| `updated_at` | timestamptz | SIM | NOT NULL, default now() | |
| `deleted_at` | timestamptz | NÃO | nullable | Soft delete |

**Constraints:**
- `UNIQUE(routine_id, source_field, target_field) WHERE deleted_at IS NULL` — impede duplicata de mapeamento
- `CHECK(mapping_type IN ('FIELD', 'PARAM', 'HEADER', 'FIXED_VALUE', 'DERIVED'))`
- `CHECK(ordem >= 1)`
- FK `tenant_id` → `tenants(id)` ON DELETE RESTRICT
- FK `routine_id` → `behavior_routines(id)` ON DELETE RESTRICT

**Indexes:**
- `idx_field_mappings_tenant_id` → `(tenant_id)`
- `idx_field_mappings_routine_ordem` → `(routine_id, ordem) WHERE deleted_at IS NULL` — ordenação natural
- `idx_field_mappings_routine_unique` → `(routine_id, source_field, target_field) WHERE deleted_at IS NULL` — suporta UNIQUE

**Soft-delete policy:** Herda imutabilidade da rotina pai. Soft-delete apenas se rotina está em DRAFT (BR-001).

**Volume estimado:** ~500-2000 mapeamentos por tenant (10-20 por rotina).

---

### 2.4 `integration_params` — Parâmetros Técnicos

> Parâmetros adicionais enviados na chamada HTTP (headers, query params, valores fixos ou derivados do contexto).

| Campo | Tipo | Required | Constraint | Descrição |
|---|---|---|---|---|
| `id` | uuid | SIM | PK | |
| `tenant_id` | uuid | SIM | FK→tenants(id) NOT NULL | Isolamento multi-tenant (DOC-FND-000) |
| `routine_id` | uuid | SIM | FK→behavior_routines(id) NOT NULL | Rotina de integração associada |
| `param_key` | varchar(100) | SIM | NOT NULL | Ex: empresa, filial, grupo_estoque |
| `param_type` | varchar(30) | SIM | NOT NULL, CHECK IN ('FIXED','DERIVED_FROM_TENANT','DERIVED_FROM_CONTEXT','HEADER') | Tipo do parâmetro |
| `value` | varchar(500) | NÃO | nullable | Valor fixo se FIXED |
| `derivation_expr` | text | NÃO | nullable | Expressão se DERIVED_FROM_TENANT ou DERIVED_FROM_CONTEXT |
| `is_sensitive` | boolean | SIM | NOT NULL, default false | true = nunca logado em call_logs (BR-005) |
| `created_at` | timestamptz | SIM | NOT NULL, default now() | |
| `updated_at` | timestamptz | SIM | NOT NULL, default now() | |
| `deleted_at` | timestamptz | NÃO | nullable | Soft delete |

**Constraints:**
- `UNIQUE(routine_id, param_key) WHERE deleted_at IS NULL` — unicidade de chave por rotina
- `CHECK(param_type IN ('FIXED', 'DERIVED_FROM_TENANT', 'DERIVED_FROM_CONTEXT', 'HEADER'))`
- FK `tenant_id` → `tenants(id)` ON DELETE RESTRICT
- FK `routine_id` → `behavior_routines(id)` ON DELETE RESTRICT

**Indexes:**
- `idx_integration_params_tenant_id` → `(tenant_id)`
- `idx_integration_params_routine_key` → `(routine_id, param_key) WHERE deleted_at IS NULL` — suporta UNIQUE

**Soft-delete policy:** Herda imutabilidade da rotina pai. Soft-delete apenas se rotina está em DRAFT (BR-001).

**Volume estimado:** ~200-500 parâmetros por tenant (3-5 por rotina).

---

### 2.5 `integration_call_logs` — Log de Chamadas

> Registro completo de cada chamada HTTP executada pelo motor de integração. Tabela de alto volume. Outbox Pattern: INSERT com status=QUEUED dentro da transação de negócio.

| Campo | Tipo | Required | Constraint | Descrição |
|---|---|---|---|---|
| `id` | uuid | SIM | PK | Também utilizado como jobId no BullMQ (deduplicação) |
| `tenant_id` | uuid | SIM | FK→tenants(id) NOT NULL | Isolamento multi-tenant (DOC-FND-000) |
| `routine_id` | uuid | SIM | FK→behavior_routines(id) NOT NULL | Rotina executada |
| `case_id` | uuid | NÃO | FK→case_instances(id) nullable | Caso que originou (MOD-006), nullable para execuções manuais |
| `case_event_id` | uuid | NÃO | FK→case_events(id) nullable | Evento que disparou (MOD-006) |
| `correlation_id` | varchar(100) | SIM | NOT NULL | X-Correlation-ID propagado em toda a cadeia |
| `status` | varchar(20) | SIM | NOT NULL, CHECK IN ('QUEUED','RUNNING','SUCCESS','FAILED','DLQ','REPROCESSED') | Status da chamada |
| `attempt_number` | integer | SIM | NOT NULL, default 1 | Tentativa atual |
| `parent_log_id` | uuid | NÃO | FK→integration_call_logs(id) nullable | Log original para reprocessamento (chain) |
| `request_payload` | jsonb | NÃO | nullable | Payload enviado ao Protheus |
| `request_headers` | jsonb | NÃO | nullable | Headers enviados (sensíveis mascarados — BR-004) |
| `response_status` | integer | NÃO | nullable | HTTP status code da resposta |
| `response_body` | jsonb | NÃO | nullable | Corpo da resposta do Protheus |
| `response_protocol` | varchar(50) | NÃO | nullable | Protocolo retornado pelo Protheus |
| `error_message` | text | NÃO | nullable | Mensagem de erro técnico |
| `started_at` | timestamptz | NÃO | nullable | Início da execução HTTP |
| `completed_at` | timestamptz | NÃO | nullable | Fim da execução HTTP |
| `duration_ms` | integer | NÃO | nullable | Duração em milissegundos |
| `queued_at` | timestamptz | SIM | NOT NULL | Quando foi enfileirado (Outbox INSERT) |
| `reprocess_reason` | text | NÃO | nullable | Motivo de reprocessamento |
| `reprocessed_by` | uuid | NÃO | FK→users(id) nullable | Usuário que solicitou reprocessamento |
| `created_at` | timestamptz | SIM | NOT NULL, default now() | |
| `updated_at` | timestamptz | SIM | NOT NULL, default now() | |

**Constraints:**
- `CHECK(status IN ('QUEUED', 'RUNNING', 'SUCCESS', 'FAILED', 'DLQ', 'REPROCESSED'))`
- `CHECK(attempt_number >= 1)`
- `CHECK(duration_ms IS NULL OR duration_ms >= 0)`
- FK `tenant_id` → `tenants(id)` ON DELETE RESTRICT
- FK `routine_id` → `behavior_routines(id)` ON DELETE RESTRICT
- FK `case_id` → `case_instances(id)` ON DELETE RESTRICT
- FK `case_event_id` → `case_events(id)` ON DELETE RESTRICT
- FK `parent_log_id` → `integration_call_logs(id)` ON DELETE RESTRICT
- FK `reprocessed_by` → `users(id)` ON DELETE RESTRICT

**Indexes:**
- `idx_call_logs_tenant_id` → `(tenant_id)`
- `idx_call_logs_tenant_status` → `(tenant_id, status)` — filtro por status (DLQ monitoring)
- `idx_call_logs_tenant_routine_queued` → `(tenant_id, routine_id, queued_at DESC)` — listagem de logs por rotina
- `idx_call_logs_correlation_id` → `(correlation_id)` — rastreabilidade cross-service
- `idx_call_logs_case_id` → `(case_id) WHERE case_id IS NOT NULL` — busca por caso
- `idx_call_logs_parent_log_id` → `(parent_log_id) WHERE parent_log_id IS NOT NULL` — chain de reprocessamento
- `idx_call_logs_dlq` → `(tenant_id, status, queued_at DESC) WHERE status = 'DLQ'` — DLQ monitoring scan

**Soft-delete policy:** Logs NÃO possuem soft-delete. São registros de auditoria imutáveis (BR-009). O status REPROCESSED marca logs originais que foram reprocessados, mas o registro permanece intacto.

**Volume estimado:** Alto — ~1000-50000 registros por tenant/mês dependendo da frequência de integrações. Considerar particionamento por `queued_at` quando volume > 10M.

---

### 2.6 `integration_reprocess_requests` — Reprocessamentos

> Registro de solicitações de reprocessamento de chamadas em DLQ. Justificativa obrigatória (min 10 chars) para auditoria.

| Campo | Tipo | Required | Constraint | Descrição |
|---|---|---|---|---|
| `id` | uuid | SIM | PK | |
| `tenant_id` | uuid | SIM | FK→tenants(id) NOT NULL | Isolamento multi-tenant (DOC-FND-000) |
| `original_log_id` | uuid | SIM | FK→integration_call_logs(id) NOT NULL | Log original em DLQ |
| `requested_by` | uuid | SIM | FK→users(id) NOT NULL | Usuário que solicitou |
| `requested_at` | timestamptz | SIM | NOT NULL, default now() | Data/hora da solicitação |
| `reason` | text | SIM | NOT NULL, CHECK(length(reason) >= 10) | Justificativa obrigatória (min 10 chars — BR-010) |
| `new_log_id` | uuid | NÃO | FK→integration_call_logs(id) nullable | Log da nova tentativa (preenchido após execução) |
| `status` | varchar(20) | SIM | NOT NULL, CHECK IN ('PENDING','EXECUTED','CANCELLED') | Status do reprocessamento |
| `created_at` | timestamptz | SIM | NOT NULL, default now() | |
| `updated_at` | timestamptz | SIM | NOT NULL, default now() | |

**Constraints:**
- `CHECK(status IN ('PENDING', 'EXECUTED', 'CANCELLED'))`
- `CHECK(length(reason) >= 10)` — justificativa mínima 10 chars
- FK `tenant_id` → `tenants(id)` ON DELETE RESTRICT
- FK `original_log_id` → `integration_call_logs(id)` ON DELETE RESTRICT
- FK `requested_by` → `users(id)` ON DELETE RESTRICT
- FK `new_log_id` → `integration_call_logs(id)` ON DELETE RESTRICT

**Indexes:**
- `idx_reprocess_requests_tenant_id` → `(tenant_id)`
- `idx_reprocess_requests_original_log` → `(original_log_id)` — busca por log original
- `idx_reprocess_requests_tenant_status` → `(tenant_id, status)` — filtro por status

**Soft-delete policy:** Reprocessamentos NÃO possuem soft-delete. São registros de auditoria.

**Volume estimado:** Baixo — ~10-100 por tenant/mês (apenas chamadas que falharam e foram reprocessadas).

---

## 3. Queries Críticas

### 3.1 DLQ Monitoring Scan (a cada 60s)

```sql
SELECT id, routine_id, correlation_id, queued_at, error_message, attempt_number
FROM integration_call_logs
WHERE tenant_id = :tenant_id
  AND status = 'DLQ'
ORDER BY queued_at DESC
LIMIT 100;
```

**Index utilizado:** `idx_call_logs_dlq`

### 3.2 Chain de Reprocessamento

```sql
WITH RECURSIVE chain AS (
  SELECT id, parent_log_id, status, attempt_number, queued_at
  FROM integration_call_logs
  WHERE id = :log_id AND tenant_id = :tenant_id
  UNION ALL
  SELECT cl.id, cl.parent_log_id, cl.status, cl.attempt_number, cl.queued_at
  FROM integration_call_logs cl
  JOIN chain c ON cl.parent_log_id = c.id
)
SELECT * FROM chain ORDER BY queued_at ASC;
```

### 3.3 Listagem de Logs por Rotina (paginação cursor-based)

```sql
SELECT id, status, correlation_id, attempt_number, response_status, duration_ms, queued_at
FROM integration_call_logs
WHERE tenant_id = :tenant_id
  AND routine_id = :routine_id
  AND (queued_at, id) < (:cursor_queued_at, :cursor_id)
ORDER BY queued_at DESC, id DESC
LIMIT :page_size;
```

**Index utilizado:** `idx_call_logs_tenant_routine_queued`

---

## 4. Migração

### 4.1 Ordem de Criação

1. `integration_services` (depende de: tenants, users)
2. `integration_routines` (depende de: tenants, behavior_routines, integration_services)
3. `integration_field_mappings` (depende de: tenants, behavior_routines)
4. `integration_params` (depende de: tenants, behavior_routines)
5. `integration_call_logs` (depende de: tenants, behavior_routines, case_instances, case_events, users)
6. `integration_reprocess_requests` (depende de: tenants, users, integration_call_logs)

### 4.2 Dependências Externas (FKs cross-module)

| FK | Tabela externa | Módulo |
|---|---|---|
| `tenants(id)` | tenants | MOD-000 (Foundation) |
| `users(id)` | users | MOD-000 (Foundation) |
| `behavior_routines(id)` | behavior_routines | MOD-007 (Parametrização) |
| `case_instances(id)` | case_instances | MOD-006 (Execução) |
| `case_events(id)` | case_events | MOD-006 (Execução) |

---

## 5. Seed Data — HML para Testes (PEN-008/PENDENTE-005)

> **Decisão (PENDENTE-005):** Seed automático executado em ambientes DEV e HML via migration. Provisiona serviço mock para testes de integração e E2E.

### 5.1 Seed: `integration_services` (HML Mock)

O seed insere um registro de serviço HML apontando para mock server (WireMock) para que testes de integração e E2E possam ser executados automaticamente sem setup manual.

**Dados do seed:**

```json
{
  "codigo": "PROTHEUS-HML-MOCK",
  "nome": "Protheus HML Mock (WireMock)",
  "base_url": "http://wiremock:8080",
  "auth_type": "NONE",
  "auth_config": null,
  "timeout_ms": 5000,
  "status": "ACTIVE",
  "environment": "HML"
}
```

| Campo | Valor | Justificativa |
|---|---|---|
| `codigo` | `PROTHEUS-HML-MOCK` | Identificação clara de que é mock |
| `nome` | `Protheus HML Mock (WireMock)` | Nome amigável |
| `base_url` | `http://wiremock:8080` | Endereço do container WireMock na rede de testes |
| `auth_type` | `NONE` | Mock server não requer autenticação |
| `auth_config` | `null` | Sem credenciais |
| `timeout_ms` | `5000` | Timeout reduzido para testes (5s vs 30s default) |
| `status` | `ACTIVE` | Pronto para uso imediato |
| `environment` | `HML` | Atende BR-012 (botão "Testar agora HML") |

### 5.2 Ambientes de Execução

| Ambiente | Seed executado? | Justificativa |
|---|---|---|
| **DEV** | SIM | Desenvolvedores precisam de HML mock para testes locais |
| **HML** | SIM | Testes de integração E2E dependem do serviço HML |
| **PROD** | NÃO | Produção usa serviços reais configurados pelo admin |

### 5.3 Implementação

- Seed implementado como migration SQL idempotente (`INSERT ... ON CONFLICT DO NOTHING`)
- `tenant_id` e `created_by` preenchidos com tenant/user padrão de seed (definidos no Foundation)
- WireMock deve ser provisionado na infra de testes com stubs para os 15 endpoints Protheus documentados em INT-008 §INT-004
- **DoR de F01:** "Seed de HML com mock server disponível em ambiente de testes"
