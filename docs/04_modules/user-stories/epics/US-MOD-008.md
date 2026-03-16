# US-MOD-008 — Integração Dinâmica Protheus/TOTVS (Épico)

**Status Ágil:** `READY`
**Versão:** 1.0.0
**Data:** 2026-03-15
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-008** (Integração Dinâmica)
**Épico de Negócio:** EP07

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** EP07, doc 04_Integracoes_Aprovacoes_e_Automacao_Governada §2–3, US-MOD-007, US-MOD-006, US-MOD-000-F07, DOC-DEV-001 §4.3, DOC-ARC-001, DOC-ARC-003
- **nivel_arquitetura:** 2 (Outbox Pattern, BullMQ, retry com backoff, DLQ, audit log)
- **evidencias:** N/A

---

## 1. Contexto e Problema

O MOD-007 resolve a parametrização **comportamental** (campos, defaults, domínios na UI), mas o sistema precisa também de uma camada de **integração dinâmica** com o Protheus/TOTVS. Sem ela, cada integração exige código fixo por tela, tornando impossível adicionar novos fluxos de integração sem intervenção de desenvolvimento.

O MOD-008 herda a estrutura de rotinas do MOD-007 (`behavior_routines` com `routine_type='INTEGRATION'`) e adiciona configuração HTTP, mapeamento de campos e um motor de execução assíncrono com garantias de entrega.

```
behavior_routines (MOD-007)              integration_routines (MOD-008)
────────────────────────────             ─────────────────────────────────────
id, codigo, nome, version                id   PK
status, published_at                     routine_id   FK → behavior_routines.id
routine_type = 'INTEGRATION'  ←──────── service_id   FK → integration_services.id
                                         http_method  GET|POST|PUT|PATCH|DELETE
                                         endpoint_tpl varchar  (template com vars)
                                         timeout_ms   integer  default 30000
                                         retry_max    integer  default 3
                                         retry_backoff_ms integer default 1000
```

---

## 2. Fluxo Completo de Integração

```
DISPARO (origem)
  ├── Transição de estágio no MOD-006
  ├── Evento de caso (case_events)
  └── Chamada manual via UX (rerun/reprocessamento)
         │
         ▼
MOTOR DE INTEGRAÇÃO
  1. Buscar rotina de integração PUBLISHED vinculada ao contexto
  2. Validar campo-mapeamentos (required fields)
  3. Montar payload (field mappings + params + defaults)
  4. INSERT integration_call_logs (status=QUEUED) ← Outbox Pattern
  5. Enfileirar job BullMQ: integration-execution
         │
         ▼ (worker assíncrono)
  6. Executar HTTP call → integration_services endpoint
  7. Avaliar resposta: SUCCESS | FAILURE | PARTIAL
  8. UPDATE integration_call_logs (status=SUCCESS|FAILED, response_body, http_status)
  9. Emitir domain_event: integration.call_completed
  10. Se FAILED e retries < retry_max → re-enfileirar com backoff
  11. Se retries esgotados → status=DLQ, notificação ao monitor
```

---

## 3. Separação MOD-007 vs MOD-008

| | MOD-007 | MOD-008 |
|---|---|---|
| `routine_type` | `BEHAVIOR` | `INTEGRATION` |
| O que faz | Altera campos, defaults, domínios na UI/domínio | Executa chamada HTTP para sistema externo |
| Avaliado por | Motor de avaliação (síncrono, sem I/O externo) | Motor de execução (assíncrono, BullMQ) |
| Efeito colateral | Nenhum — apenas retorna resultado | Chama Protheus/TOTVS — efeito real |
| Rollback | Não aplicável (sem efeito) | Reprocessamento governado |
| Tabelas extras | `routine_items` | `integration_routines`, `integration_field_mappings`, `integration_params`, `integration_call_logs`, `integration_reprocess_requests` |

---

## 4. Escopo

### Inclui
- Catálogo de Serviços de Destino (integration_services): URL, autenticação, timeout
- Rotinas de Integração com mapeamento de campos e parâmetros (herda MOD-007)
- Motor de Execução assíncrono via BullMQ (Outbox Pattern, retry, DLQ)
- Log completo de cada chamada (payload, resposta, status técnico e funcional)
- Reprocessamento governado de chamadas em DLQ (com justificativa obrigatória)
- UX Editor de Rotinas de Integração (extensão de UX-ROTINA-001)
- UX Monitor de Integrações (log + DLQ + reprocessamento)

### Não inclui
- Controle de movimentos sob aprovação — MOD-009
- Agentes MCP disparando integrações — MOD-010
- Integração com outros sistemas além de Protheus/TOTVS Wave 4 — roadmap futuro

---

## 5. Critérios de Aceite (Épico)

```gherkin
Funcionalidade: Épico Integração Dinâmica MOD-008

  Cenário: Rotina de integração herda versionamento do MOD-007
    Dado que rotina com routine_type=INTEGRATION está PUBLISHED
    Quando qualquer campo da integration_routines é alterado
    Então 422: "Rotinas publicadas são imutáveis. Use o fork para criar nova versão."

  Cenário: Outbox garante que chamada não se perde se worker cair
    Dado que job foi enfileirado mas worker reinicia antes de executar
    Quando worker volta
    Então job é reprocessado da fila sem duplicidade (BullMQ idempotência)
    E integration_call_logs não tem registro duplicado

  Cenário: DLQ notifica operador após esgotar retries
    Dado que chamada falhou 3 vezes (retry_max=3)
    Então status=DLQ em integration_call_logs
    E alerta aparece no monitor UX-INTEG-002 com badge vermelho
    E domain_event: integration.call_dlq emitido

  Cenário: Reprocessamento de DLQ exige justificativa
    Dado que chamada está em DLQ
    Quando admin clica "Reprocessar" sem preencher motivo
    Então o botão permanece desabilitado
    Quando preenche motivo (min 10 chars) e confirma
    Então nova tentativa é enfileirada e log original preservado

  Cenário: Sub-histórias bloqueadas sem aprovação
    Dado que US-MOD-008 está diferente de "APPROVED"
    Então forge-module é bloqueado para todas as features
```

---

## 6. Definition of Ready (DoR) ✅

- [x] Herança de `behavior_routines` do MOD-007 documentada
- [x] Fluxo completo de execução (Outbox → BullMQ → retry → DLQ) definido
- [x] Modelo de dados completo (6 tabelas/extensões) definido
- [x] Integração com MOD-006 (disparo por transição) especificada
- [x] Features F01–F05 com Gherkin completo
- [x] Screen Manifests UX-INTEG-001, UX-INTEG-002 criados
- [x] Novos escopos mapeados para MOD-000-F12
- [ ] Owner confirmar READY → APPROVED

## 7. Definition of Done (DoD)

- [ ] F01–F05 aprovadas e scaffoldadas
- [ ] Outbox Pattern testado com falha de worker no meio da execução
- [ ] DLQ ativado após retry_max — notificação no monitor
- [ ] Reprocessamento preserva log original + cria novo log vinculado
- [ ] Payload e response body armazenados no call_log
- [ ] `X-Correlation-ID` propagado do caso → job BullMQ → log → domain_event

---

## 8. Sub-Histórias

```text
US-MOD-008
  ├── F01 ← API: Catálogo de Serviços + Rotinas de Integração
  ├── F02 ← API: Mapeamentos de Campos e Parâmetros
  ├── F03 ← API: Motor de Execução (BullMQ + Outbox + Retry + DLQ)
  ├── F04 ← UX: Editor de Rotinas de Integração (UX-INTEG-001)
  └── F05 ← UX: Monitor de Integrações (UX-INTEG-002)
```

| Feature | Tema | Tipo | Status |
|---|---|---|---|
| [US-MOD-008-F01](../features/US-MOD-008-F01.md) | API Catálogo de serviços + rotinas de integração | Backend | `READY` |
| [US-MOD-008-F02](../features/US-MOD-008-F02.md) | API Mapeamentos de campos e parâmetros | Backend | `READY` |
| [US-MOD-008-F03](../features/US-MOD-008-F03.md) | API Motor de execução (BullMQ + Outbox + DLQ) | Backend | `READY` |
| [US-MOD-008-F04](../features/US-MOD-008-F04.md) | UX Editor de rotinas de integração | UX | `READY` |
| [US-MOD-008-F05](../features/US-MOD-008-F05.md) | UX Monitor de integrações | UX | `READY` |

---

## 9. Modelo de Dados

### `integration_services` — Serviços de Destino
| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `codigo` | varchar(50) | UNIQUE NOT NULL | ex: PROTHEUS-PROD, PROTHEUS-HML |
| `nome` | varchar(200) | NOT NULL | |
| `base_url` | varchar | NOT NULL | ex: https://protheus.empresa.com/rest |
| `auth_type` | varchar | NONE\|BASIC\|BEARER\|OAUTH2 | |
| `auth_config` | jsonb | nullable | Credenciais criptografadas (não retornadas em GET) |
| `timeout_ms` | integer | default 30000 | |
| `status` | varchar | ACTIVE\|INACTIVE | |
| `environment` | varchar | PROD\|HML\|DEV | |
| `created_by` | uuid | FK→users | |

### `integration_routines` — Extensão das Rotinas de Integração
| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `routine_id` | uuid | FK→behavior_routines.id UNIQUE | Rotina base (routine_type='INTEGRATION') |
| `service_id` | uuid | FK→integration_services.id NOT NULL | Serviço de destino |
| `http_method` | varchar | GET\|POST\|PUT\|PATCH\|DELETE | |
| `endpoint_tpl` | varchar | NOT NULL | Template com vars: `/api/pedidos/{pedido_id}` |
| `content_type` | varchar | default 'application/json' | |
| `timeout_ms` | integer | nullable | Sobrescreve integration_services.timeout_ms |
| `retry_max` | integer | default 3 | 0 = sem retry |
| `retry_backoff_ms` | integer | default 1000 | Dobra a cada retry (backoff exponencial) |
| `trigger_events` | jsonb | nullable | Array de event_types que disparam esta rotina |

### `integration_field_mappings` — Mapeamento de Campos
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | |
| `routine_id` | uuid FK→behavior_routines.id | |
| `source_field` | varchar NOT NULL | Campo do Integrador (ex: caso.numero_pedido) |
| `target_field` | varchar NOT NULL | Campo do Protheus (ex: C5_NUM) |
| `mapping_type` | varchar | FIELD\|PARAM\|HEADER\|FIXED_VALUE\|DERIVED |
| `required` | boolean | default false |
| `transform_expr` | text | nullable | Expressão de transformação (ex: UPPER(value)) |
| `condition_expr` | text | nullable | Condição de inclusão no payload |
| `default_value` | varchar | nullable | Valor padrão se source vazio |
| `ordem` | integer | NOT NULL | Ordem de montagem do payload |

### `integration_params` — Parâmetros Técnicos
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | |
| `routine_id` | uuid FK→behavior_routines.id | |
| `param_key` | varchar NOT NULL | ex: empresa, filial, grupo_estoque |
| `param_type` | varchar | FIXED\|DERIVED_FROM_TENANT\|DERIVED_FROM_CONTEXT\|HEADER |
| `value` | varchar | nullable | Valor fixo se FIXED |
| `derivation_expr` | text | nullable | Expressão se DERIVED |
| `is_sensitive` | boolean | default false | true = nunca logado |

### `integration_call_logs` — Log de Chamadas
| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `routine_id` | uuid | FK→behavior_routines.id | |
| `case_id` | uuid | FK→case_instances.id, nullable | Caso que originou |
| `case_event_id` | uuid | FK→case_events.id, nullable | Evento que disparou |
| `correlation_id` | varchar | NOT NULL | X-Correlation-ID propagado |
| `status` | varchar | QUEUED\|RUNNING\|SUCCESS\|FAILED\|DLQ\|REPROCESSED | |
| `attempt_number` | integer | default 1 | |
| `parent_log_id` | uuid | FK→integration_call_logs.id, nullable | Para reprocessamento |
| `request_payload` | jsonb | nullable | Payload enviado |
| `request_headers` | jsonb | nullable | Headers (sensíveis mascarados) |
| `response_status` | integer | nullable | HTTP status da resposta |
| `response_body` | jsonb | nullable | Corpo da resposta |
| `response_protocol` | varchar | nullable | Protocolo retornado pelo Protheus |
| `error_message` | text | nullable | Mensagem de erro técnico |
| `started_at` | timestamp | | |
| `completed_at` | timestamp | nullable | |
| `duration_ms` | integer | nullable | |
| `queued_at` | timestamp | NOT NULL | Quando foi enfileirado (Outbox) |
| `reprocess_reason` | text | nullable | Motivo de reprocessamento |
| `reprocessed_by` | uuid | FK→users, nullable | |

### `integration_reprocess_requests` — Reprocessamentos
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | |
| `original_log_id` | uuid FK→integration_call_logs.id | Log original em DLQ |
| `requested_by` | uuid FK→users | |
| `requested_at` | timestamp | |
| `reason` | text NOT NULL | Justificativa obrigatória (min 10 chars) |
| `new_log_id` | uuid FK→integration_call_logs.id, nullable | Log da nova tentativa |
| `status` | varchar | PENDING\|EXECUTED\|CANCELLED | |

---

## 10. Endpoints do Módulo

| Método | Path | operationId | Scope |
|---|---|---|---|
| GET | /api/v1/admin/integration-services | `admin_integration_services_list` | `integration:service:read` |
| POST | /api/v1/admin/integration-services | `admin_integration_services_create` | `integration:service:write` |
| PATCH | /api/v1/admin/integration-services/:id | `admin_integration_services_update` | `integration:service:write` |
| — | — | — | — |
| GET | /api/v1/admin/routines?type=INTEGRATION | `admin_routines_list` (herda MOD-007) | `param:routine:read` |
| POST | /api/v1/admin/routines (routine_type=INTEGRATION) | `admin_routines_create` (herda) | `param:routine:write` |
| POST | /api/v1/admin/routines/:id/integration-config | `admin_integration_routines_configure` | `integration:routine:write` |
| POST | /api/v1/admin/routines/:id/field-mappings | `admin_field_mappings_create` | `integration:routine:write` |
| PATCH | /api/v1/admin/field-mappings/:id | `admin_field_mappings_update` | `integration:routine:write` |
| DELETE | /api/v1/admin/field-mappings/:id | `admin_field_mappings_delete` | `integration:routine:write` |
| POST | /api/v1/admin/routines/:id/params | `admin_integration_params_create` | `integration:routine:write` |
| PATCH | /api/v1/admin/integration-params/:id | `admin_integration_params_update` | `integration:routine:write` |
| — | — | — | — |
| POST | /api/v1/integration-engine/execute | `integration_engine_execute` | `integration:execute` |
| GET | /api/v1/admin/integration-logs | `admin_integration_logs_list` | `integration:log:read` |
| GET | /api/v1/admin/integration-logs/:id | `admin_integration_logs_get` | `integration:log:read` |
| POST | /api/v1/admin/integration-logs/:id/reprocess | `admin_integration_logs_reprocess` | `integration:log:reprocess` |

---

## 11. Novos Escopos — Amendment MOD-000-F12

| Escopo | Descrição |
|---|---|
| `integration:service:read` | Ver catálogo de serviços de destino |
| `integration:service:write` | Criar/editar serviços (credenciais mascaradas) |
| `integration:routine:write` | Configurar rotinas de integração (HTTP, mapeamentos, params) |
| `integration:execute` | Disparar execução manual de integração |
| `integration:log:read` | Ver logs de chamadas |
| `integration:log:reprocess` | Reprocessar chamadas em DLQ |

---

## 12. OKRs

| # | Métrica | Alvo |
|---|---|---|
| OKR-1 | Outbox garante zero perda de chamadas por crash de worker | 100% |
| OKR-2 | DLQ ativado após retry_max esgotado | 100% |
| OKR-3 | Credenciais em auth_config nunca retornadas em GET | 100% |
| OKR-4 | X-Correlation-ID propagado caso → BullMQ → log → domain_event | 100% |

---

## 13. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação do zero. Herança MOD-007, 6 tabelas, motor BullMQ, Outbox, DLQ, 5 features. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
