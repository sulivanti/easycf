> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-19 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-19 | AGN-DEV-01  | Enriquecimento MOD/Escala (enrich-agent) |

# MOD-008 — Integração Dinâmica Protheus/TOTVS

- **id:** MOD-008
- **version:** 1.0.0
- **estado_item:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-23
- **architecture_level:** 2 (Outbox Pattern, BullMQ, retry com backoff exponencial, DLQ, audit log, credenciais criptografadas)
- **rastreia_para:** US-MOD-008, US-MOD-007, US-MOD-006, US-MOD-000-F07, DOC-DEV-001 §4.3, DOC-ARC-001, DOC-ARC-003, DOC-ESC-001, DOC-FND-000
- **referencias_exemplos:** EX-AUTH-001, EX-PII-001, EX-SEC-001
- **evidencias:** N/A

---

## 1. Objetivo

Módulo responsável pela **integração dinâmica** com o sistema Protheus/TOTVS, permitindo que fluxos de integração HTTP sejam configurados, mapeados e executados sem código fixo por tela. Herda a estrutura de rotinas versionadas do MOD-007 (`behavior_routines` com `routine_type='INTEGRATION'`) e adiciona configuração HTTP, mapeamento de campos, parâmetros técnicos e um motor de execução assíncrono com garantias de entrega via Outbox Pattern + BullMQ. Possui 6 tabelas próprias (`integration_services`, `integration_routines`, `integration_field_mappings`, `integration_params`, `integration_call_logs`, `integration_reprocess_requests`), 15 endpoints REST, 6 escopos de permissão, 8 domain events, 2 telas UX (editor de rotinas + monitor de integrações) e 5 features APPROVED com 47 cenários Gherkin.

### Problema que resolve

O MOD-007 resolve a parametrização **comportamental** (campos, defaults, domínios na UI), mas o sistema precisa também de uma camada de **integração dinâmica** com o Protheus/TOTVS. Sem ela, cada integração exige código fixo por tela, tornando impossível adicionar novos fluxos de integração sem intervenção de desenvolvimento.

O MOD-008 herda a estrutura de rotinas do MOD-007 (`behavior_routines` com `routine_type='INTEGRATION'`) e adiciona configuração HTTP, mapeamento de campos e um motor de execução assíncrono com garantias de entrega.

### Público-alvo

| Persona | Perfil | Ações |
|---|---|---|
| Arquiteto de Integração | Configura serviços, rotinas, mapeamentos | CRUD services, routines, mappings, params |
| Operador de Integrações | Monitora execuções, reprocessa DLQ | View logs, reprocess DLQ |
| Sistema (Motor BullMQ) | Executa chamadas HTTP ao Protheus | Execute, retry, DLQ |

### Métricas de sucesso (OKRs)

| # | Métrica | Alvo |
|---|---|---|
| OKR-1 | Outbox garante zero perda de chamadas por crash de worker | 100% |
| OKR-2 | DLQ ativado após retry_max esgotado | 100% |
| OKR-3 | Credenciais em auth_config nunca retornadas em GET | 100% |
| OKR-4 | X-Correlation-ID propagado caso → BullMQ → log → domain_event | 100% |

### Premissas e Restrições

- BullMQ já na stack (MOD-004), Redis disponível
- Protheus possui limitação de conexões simultâneas — concurrency ajustável via env var `INTEGRATION_CONCURRENCY` (default: 10)
- Herança total do versionamento MOD-007 (DRAFT→PUBLISHED→DEPRECATED, fork)
- WS Protheus aceita e processa todos os campos recebidos — mapeamento é fonte da verdade
- Credenciais em `auth_config` criptografadas em repouso (AES-256), nunca retornadas em GET
- Retry gerenciado pelo Outbox, não pelo BullMQ (simplifica o modelo)

---

## 2. Escopo

### Inclui

- Catálogo de Serviços de Destino (`integration_services`): URL, autenticação, timeout, environment (PROD/HML/DEV)
- Rotinas de Integração com mapeamento de campos e parâmetros (herda MOD-007)
- 5 tipos de mapeamento: FIELD, PARAM, HEADER, FIXED_VALUE, DERIVED
- 4 tipos de parâmetro: FIXED, DERIVED_FROM_TENANT, DERIVED_FROM_CONTEXT, HEADER
- Motor de Execução assíncrono via BullMQ (Outbox Pattern, retry backoff exponencial, DLQ)
- Log completo de cada chamada (payload, resposta, status técnico e funcional)
- Reprocessamento governado de chamadas em DLQ (com justificativa obrigatória, min 10 chars)
- UX Editor de Rotinas de Integração (UX-INTEG-001) — 3 abas: Config HTTP, Mapeamentos, Parâmetros
- UX Monitor de Integrações (UX-INTEG-002) — métricas do dia, DLQ tab, split-view, chain de reprocessamentos

### Não inclui

- Controle de movimentos sob aprovação — MOD-009
- Agentes MCP disparando integrações — MOD-010
- Integração com outros sistemas além de Protheus/TOTVS Wave 4 — roadmap futuro

### Roadmap futuro

| Item | Trigger |
|---|---|
| Integração com outros ERPs | Demanda de mercado pós Wave 4 |
| Agentes MCP como dispatcher | MOD-010 APPROVED |

---

## 3. Nível de Arquitetura

**Nível 2 — DDD-lite + Full Clean** (DOC-ESC-001 §7)

Módulo com domínio rico: Outbox Pattern garantindo atomicidade entre transação de negócio e enfileiramento, motor assíncrono BullMQ com retry backoff exponencial e DLQ governada, credenciais criptografadas (AES-256) com mascaramento em GET e logs, herança de versionamento imutável do MOD-007 (DRAFT→PUBLISHED→DEPRECATED), mapeamento dinâmico de campos com expressões de transformação, e audit log completo com correlation_id propagado de ponta a ponta. Possui 6 tabelas próprias, 15 endpoints REST, 8 domain events, 6 escopos, e integração com MOD-006 (trigger_events por transição de estágio) e MOD-007 (herança de behavior_routines). 5 features APPROVED com 47 cenários Gherkin distribuídos em 3 features backend (F01-F03) e 2 features UX (F04-F05).

### Justificativa (Score DOC-ESC-001 §4.2: 6/6)

| Gatilho | Presente | Evidência |
|---|---|---|
| Estado/workflow | **SIM** | Herança de máquina de estados DRAFT → PUBLISHED → DEPRECATED do MOD-007; ciclo de vida do call_log: QUEUED → RUNNING → SUCCESS/FAILED → DLQ → REPROCESSED |
| Compliance/auditoria | **SIM** | 8 domain events (DATA-003), audit log completo com payload/response/correlation_id, log original imutável após reprocessamento, justificativa obrigatória para reprocessamento |
| Concorrência/consistência | **SIM** | Outbox Pattern (INSERT log dentro da transação de negócio — atomicidade), BullMQ dedupe via jobId = call_log.id, retry backoff exponencial, idempotência do worker |
| Integrações externas críticas | **SIM** | Chamadas HTTP ao Protheus/TOTVS com retry, timeout, DLQ; credenciais criptografadas (AES-256); concurrency controlada por env var |
| Multi-tenant/escopo por cliente | **SIM** | `tenant_id` obrigatório em todas as queries (DOC-FND-000 §2), ACL via 6 scopes `integration:*` (DOC-FND-000 §2.2) |
| Regras cruzadas/reuso alto | **SIM** | Herança do MOD-007 (behavior_routines), trigger_events vinculados ao MOD-006, mapeamento dinâmico reutilizável por múltiplas rotinas, catálogo de serviços compartilhado |

---

## 4. Dependências

| Módulo | Relação | Detalhe |
|---|---|---|
| MOD-000 | Ancestral | Auth, tenants, scopes, domain_events, storage (DOC-FND-000) |
| MOD-006 | Inbound | Eventos de transição de estágio (`trigger_events`: `case.stage_transitioned`, `case.opened`, etc.) |
| MOD-007 | Herança | `behavior_routines` com `routine_type='INTEGRATION'` — versionamento, fork, imutabilidade de PUBLISHED |

---

## 5. Sub-Histórias (Features)

| Feature | Tema | Tipo | Status |
|---|---|---|---|
| [US-MOD-008-F01](../user-stories/features/US-MOD-008-F01.md) | API Catálogo de serviços + rotinas de integração | Backend | `APPROVED` |
| [US-MOD-008-F02](../user-stories/features/US-MOD-008-F02.md) | API Mapeamentos de campos e parâmetros | Backend | `APPROVED` |
| [US-MOD-008-F03](../user-stories/features/US-MOD-008-F03.md) | API Motor de execução (BullMQ + Outbox + DLQ) | Backend | `APPROVED` |
| [US-MOD-008-F04](../user-stories/features/US-MOD-008-F04.md) | UX Editor de rotinas de integração | UX | `APPROVED` |
| [US-MOD-008-F05](../user-stories/features/US-MOD-008-F05.md) | UX Monitor de integrações | UX | `APPROVED` |

---

## 6. Screen Manifests

| Manifest | Tela | Arquivo | Feature |
|---|---|---|---|
| UX-INTEG-001 | Editor de Rotinas de Integração | [ux-integ-001.editor-rotinas-integ.yaml](../../05_manifests/screens/ux-integ-001.editor-rotinas-integ.yaml) | F04 |
| UX-INTEG-002 | Monitor de Integrações | [ux-integ-002.monitor-integracoes.yaml](../../05_manifests/screens/ux-integ-002.monitor-integracoes.yaml) | F05 |

---

## 7. Endpoints do Módulo

| Método | Path | operationId | Scope |
|---|---|---|---|
| GET | /api/v1/admin/integration-services | `admin_integration_services_list` | `integration:service:read` |
| POST | /api/v1/admin/integration-services | `admin_integration_services_create` | `integration:service:write` |
| PATCH | /api/v1/admin/integration-services/:id | `admin_integration_services_update` | `integration:service:write` |
| GET | /api/v1/admin/routines?type=INTEGRATION | `admin_routines_list` (herda MOD-007) | `param:routine:read` |
| POST | /api/v1/admin/routines (routine_type=INTEGRATION) | `admin_routines_create` (herda) | `param:routine:write` |
| POST | /api/v1/admin/routines/:id/integration-config | `admin_integration_routines_configure` | `integration:routine:write` |
| POST | /api/v1/admin/routines/:id/field-mappings | `admin_field_mappings_create` | `integration:routine:write` |
| PATCH | /api/v1/admin/field-mappings/:id | `admin_field_mappings_update` | `integration:routine:write` |
| DELETE | /api/v1/admin/field-mappings/:id | `admin_field_mappings_delete` | `integration:routine:write` |
| POST | /api/v1/admin/routines/:id/params | `admin_integration_params_create` | `integration:routine:write` |
| PATCH | /api/v1/admin/integration-params/:id | `admin_integration_params_update` | `integration:routine:write` |
| POST | /api/v1/integration-engine/execute | `integration_engine_execute` | `integration:execute` |
| GET | /api/v1/admin/integration-logs | `admin_integration_logs_list` | `integration:log:read` |
| GET | /api/v1/admin/integration-logs/:id | `admin_integration_logs_get` | `integration:log:read` |
| POST | /api/v1/admin/integration-logs/:id/reprocess | `admin_integration_logs_reprocess` | `integration:log:reprocess` |

---

## 8. Novos Escopos — Amendment MOD-000-F12

| Escopo | Descrição |
|---|---|
| `integration:service:read` | Ver catálogo de serviços de destino |
| `integration:service:write` | Criar/editar serviços (credenciais mascaradas) |
| `integration:routine:write` | Configurar rotinas de integração (HTTP, mapeamentos, params) |
| `integration:execute` | Disparar execução manual de integração |
| `integration:log:read` | Ver logs de chamadas |
| `integration:log:reprocess` | Reprocessar chamadas em DLQ |

---

## 9. Requisitos (Índice)

<!-- start index -->
- [BR-008](requirements/br/BR-008.md) — Regras de Negócio
- [FR-008](requirements/fr/FR-008.md) — Requisitos Funcionais
  - [FR-008-M01](amendments/fr/FR-008-M01.md) — Adicionar avg_latency_ms ao endpoint de métricas (derivado UX-008-M01)
- [DATA-008](requirements/data/DATA-008.md) — Modelo de Dados (6 tabelas)
- [DATA-003](requirements/data/DATA-003.md) — Catálogo de Domain Events
- [INT-008](requirements/int/INT-008.md) — Integrações
  - [INT-008-C01](amendments/int/INT-008-C01.md) — Correção prefixo registro rotas servicesRoutes/routinesRoutes
  - [INT-008-M01](amendments/int/INT-008-M01.md) — Convenções BullMQ/Redis para ingest queue (derivado DOC-PADRAO-002-M01)
- [SEC-008](requirements/sec/SEC-008.md) — Segurança e Compliance
- [SEC-002](requirements/sec/SEC-002.md) — Matriz de Autorização de Eventos
- [UX-008](requirements/ux/UX-008.md) — Experiência do Usuário
  - [UX-008-M01](amendments/ux/UX-008-M01.md) — Alinhar layout React com designs Penpot (50-IntegrationEditor + 50-IntegrationMonitor)
- [NFR-008](requirements/nfr/NFR-008.md) — Requisitos Não-Funcionais
  - [NFR-008-C01](amendments/nfr/NFR-008-C01.md) — Tipagem Drizzle InferInsertModel obrigatório, as any proibido
- [pen-008-pendente](requirements/pen-008-pendente.md) — Questões em Aberto
<!-- end index -->

---

## 10. Decisões (ADR)

<!-- start adr-index -->
- [ADR-001](adr/ADR-001.md) — Outbox Pattern para Garantia de Entrega de Chamadas
- [ADR-002](adr/ADR-002.md) — Retry Gerenciado pelo Outbox, Não pelo BullMQ
- [ADR-003](adr/ADR-003.md) — Herança de behavior_routines do MOD-007 via Extensão 1:1
- [ADR-004](adr/ADR-004.md) — Credenciais Criptografadas em Repouso com AES-256 via Secret do Ambiente
<!-- end adr-index -->
