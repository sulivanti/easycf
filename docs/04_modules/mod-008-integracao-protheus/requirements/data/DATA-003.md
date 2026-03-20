> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-19 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-19 | AGN-DEV-04  | Enriquecimento DATA-003 — 8 domain events completos com payload, sensitivity, view rule, ponte UI-API-Domain |

# DATA-003 — Catálogo de Domain Events da Integração Dinâmica Protheus

> Habilita linha do tempo (Thread), auditoria, Outbox e automação de notificações.

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-008, US-MOD-008-F01, US-MOD-008-F03, BR-008, FR-008, SEC-002, SEC-008, DOC-ARC-003, DOC-FND-000
- **referencias_exemplos:** EX-DEV-001 (Envelope DATA-003)
- **evidencias:** N/A

## Princípios (MUST)

- **Não use "permissão no evento" como fonte de verdade.**
  - Emit = permissão do comando que originou o evento
  - View = ACL + tenant da entity originária
- `sensitivity_level` é **guard-rail** (mascarar/bloquear cedo), não a regra principal.
- **Fonte Única da Verdade:** Tabela `domain_events` é a única fonte para auditoria/timeline (DOC-ARC-003 §1 Dogma 6).
- **SEC-002 referencia:** Regras de autorização Emit/View/Notify estão detalhadas em [SEC-002](../sec/SEC-002.md).

---

## Catálogo de Domain Events

### Catálogo de Serviços

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields | payload_policy |
|---|---|---|---|---|---|---|---|---|---|
| `integration.service_created` | Serviço de integração cadastrado | POST /admin/integration-services | `integration_service` | `integration:service:write` | tenant + `integration:service:read` | — | 0 | `auth_config` | snapshot: entity_id, tenant_id, codigo, nome, base_url, auth_type, environment, correlation_id |
| `integration.service_updated` | Campos do serviço alterados | PATCH /admin/integration-services/:id | `integration_service` | `integration:service:write` | tenant + `integration:service:read` | — | 0 | `auth_config` | snapshot: entity_id, tenant_id, changed_fields[] (before/after exceto auth_config), correlation_id |

### Configuração de Rotinas

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields | payload_policy |
|---|---|---|---|---|---|---|---|---|---|
| `integration.routine_configured` | Rotina de integração configurada (HTTP, endpoint, retry) | POST /admin/routines/:id/integration-config | `integration_routine` | `integration:routine:write` | tenant + `integration:service:read` | — | 0 | — | snapshot: routine_id, service_id, http_method, endpoint_tpl, retry_max, correlation_id |

### Execução — Motor de Integração

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields | payload_policy |
|---|---|---|---|---|---|---|---|---|---|
| `integration.call_queued` | Chamada enfileirada via Outbox Pattern | INSERT call_log (status=QUEUED) dentro da transação | `integration_call_log` | `integration:execute` | tenant + `integration:log:read` | — | 0 | `request_payload` (se is_sensitive) | snapshot: log_id, routine_id, case_id, correlation_id, queued_at |
| `integration.call_completed` | Chamada HTTP concluída com sucesso | Worker: status→SUCCESS | `integration_call_log` | `integration:execute` (worker) | tenant + `integration:log:read` | — | 0 | `response_body` (se contém PII) | snapshot: log_id, routine_id, http_status, duration_ms, correlation_id |
| `integration.call_failed` | Chamada HTTP falhou (retry pendente ou esgotado) | Worker: status→FAILED | `integration_call_log` | `integration:execute` (worker) | tenant + `integration:log:read` | — | 0 | — | snapshot: log_id, routine_id, error_message, attempt_number, http_status, correlation_id |
| `integration.call_dlq` | Chamada movida para DLQ após esgotar retries | Worker: status→DLQ após retry_max | `integration_call_log` | `integration:execute` (worker) | tenant + `integration:log:read` + admin | admin (alerta) | 1 | — | snapshot: log_id, routine_id, total_attempts, error_message, correlation_id |
| `integration.call_reprocessed` | Chamada DLQ reprocessada por operador | POST /admin/integration-logs/:id/reprocess | `integration_call_log` | `integration:log:reprocess` | tenant + `integration:log:read` + admin | admin | 0 | — | snapshot: log_id, original_log_id, new_log_id, reason, reprocessed_by, correlation_id |

---

## Ponte UI-API-Domain (DOC-ARC-003 §3)

> Campos obrigatórios `ui_actions` e `operation_ids` completam o trajeto do clique ao banco.

| event_type | ui_actions | operation_ids |
|---|---|---|
| `integration.service_created` | `create` | `admin_integration_services_create` |
| `integration.service_updated` | `update` | `admin_integration_services_update` |
| `integration.routine_configured` | `create` | `admin_integration_routines_configure` |
| `integration.call_queued` | `execute` | `integration_engine_execute` |
| `integration.call_completed` | — (worker) | — (worker async) |
| `integration.call_failed` | — (worker) | — (worker async) |
| `integration.call_dlq` | — (worker) | — (worker async) |
| `integration.call_reprocessed` | `reprocess` | `admin_integration_logs_reprocess` |

---

## Outbox / Deduplicação

| Propriedade | Valor | Justificativa |
|---|---|---|
| `outbox.enabled` | **true** (para call_queued, call_completed, call_failed, call_dlq, call_reprocessed) | Motor de execução assíncrono — garantia at-least-once via Outbox Pattern (BR-005) |
| `outbox.enabled` | false (para service_created, service_updated, routine_configured) | Operações CRUD administrativas síncronas sem necessidade de garantia at-least-once |
| `dedupe_key` | `integration_call_logs.id` | Usado como jobId no BullMQ — previne execução duplicada |
| `ttl` | Retenção padrão da tabela `domain_events` (definida no Foundation) | — |

---

## Campos Mínimos Recomendados (DOC-FND-000 §3)

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid v4 | SIM | PK do evento |
| `tenant_id` | uuid | SIM | Isolamento multi-tenant |
| `entity_type` | text | SIM | Ex: `integration_service`, `integration_call_log` |
| `entity_id` | uuid | SIM | ID da entidade afetada |
| `event_type` | text | SIM | Ex: `integration.call_completed` |
| `payload` | jsonb | SIM | Snapshot mínimo (sem PII desnecessária, auth_config NUNCA incluído) |
| `created_at` | timestamptz | SIM | Timestamp do evento |
| `created_by` | uuid | SIM | Usuário que disparou (ou system para worker) |
| `correlation_id` | uuid | SIM | Rastreabilidade cross-service (X-Correlation-ID) |
| `causation_id` | uuid | NÃO | Evento que causou este (ex: call_queued → call_completed) |
| `sensitivity_level` | integer | SIM | 0 para operações admin, 1 para DLQ (contém info de erro potencialmente sensível) |
| `dedupe_key` | text | NÃO | `integration_call_logs.id` para eventos de execução |

**Indexes padrão (DOC-FND-000):**
- `(tenant_id, entity_type, entity_id, created_at DESC)` — timeline por entidade
- `(tenant_id, event_type, created_at DESC)` — busca por tipo de evento

---

## Regras de Filtragem (MUST)

1. `tenant_id` obrigatório em todas as consultas a `domain_events`
2. Validação ACL antes de retornar eventos:
   - Eventos de serviços: `integration:service:read`
   - Eventos de execução: `integration:log:read`
   - Eventos de DLQ e reprocessamento: `integration:log:read` + role admin
3. `auth_config` NUNCA incluído em payloads de eventos (BR-004, SEC-008)
4. `request_headers` com campos sensíveis mascarados antes de inclusão no payload (BR-004)
5. `causation_id` utilizado para encadear: `call_queued` → `call_completed`/`call_failed` → `call_dlq` → `call_reprocessed`

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-008, US-MOD-008-F01, US-MOD-008-F03, BR-008, FR-008, SEC-002, SEC-008, DOC-ARC-003, DOC-FND-000, INT-008
- **referencias_exemplos:** EX-DATA-003
- **evidencias:** N/A
