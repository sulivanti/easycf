> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-16 | arquitetura | Baseline Inicial (forge-module) |
> | 0.3.0  | 2026-03-17 | AGN-DEV-04  | Re-enriquecimento DATA-003 — adiciona sensitivity_level, EX-*, nota de desvio DATA-003 |
> | 0.2.0  | 2026-03-16 | AGN-DEV-04  | Enriquecimento DATA-003 (enrich-agent) |

# DATA-003 — Catálogo de Domain Events do Backoffice Admin

> Habilita linha do tempo (Thread), auditoria, Outbox e automação de notificações.

## Princípios (MUST)

- **Não use "permissão no evento" como fonte de verdade.**
  - Emit = permissão do comando
  - View = ACL + tenant da entity originária
- `sensitivity_level` é **guard-rail** (mascarar/bloquear cedo), não a regra principal.
- **Fonte Única da Verdade:** Tabela `domain_events` é a única fonte para auditoria/timeline (DOC-ARC-003 §1 Dogma 6).

## Contexto MOD-001

O MOD-001 é **UX-First**: não emite domain events no backend (essa responsabilidade é do MOD-000). O que o MOD-001 produz são **UIActionEnvelopes** — eventos de telemetria UI que rastreiam ações do usuário no frontend e se correlacionam com os domain events do MOD-000 via `X-Correlation-ID`.

> **Nota de desvio (DATA-003):** Este catálogo NÃO segue o formato padrão de domain events (tabela `event_type`, `origin_command`, `emit_permission`, `view_rule`, `notify`, `sensitivity_level`, `maskable_fields`) porque o MOD-001 não emite domain events. Em vez disso, cataloga UIActionEnvelopes conforme DOC-ARC-003 §2. Os domain events correspondentes residem no MOD-000. Desvio aceito — módulo consumidor UX-First.

## Catálogo de UIActionEnvelopes (Telemetria UI)

### UX-AUTH-001 — Ações Pré-Autenticação (tenant_id AUSENTE)

| action_id | operation_id | type | tenant_id | sensitivity | Ciclo de vida |
|---|---|---|---|---|---|
| `submit_login` | auth_login | submit | ❌ ausente | 1 (credenciais) | requested → succeeded/failed |
| `submit_forgot_password` | auth_forgot_password | submit | ❌ ausente | 1 (e-mail) | requested → succeeded/failed |
| `submit_reset_password` | auth_reset_password | submit | ❌ ausente | 1 (token) | requested → succeeded/failed |
| `navigate_to_forgot` | — | client_only | ❌ ausente | 0 | ui_only=true |
| `navigate_to_login` | — | client_only | ❌ ausente | 0 | ui_only=true |

### UX-SHELL-001 — Ações Pós-Autenticação (tenant_id PRESENTE)

| action_id | operation_id | type | tenant_id | sensitivity | Ciclo de vida |
|---|---|---|---|---|---|
| `load_current_user` | auth_me | view | ✅ presente | 0 | requested → succeeded/failed |
| `submit_logout` | auth_logout | submit | ✅ presente | 0 | requested → succeeded/failed |
| `navigate_sidebar` | — | client_only | ✅ presente | 0 | ui_only=true |
| `navigate_breadcrumb` | — | client_only | ✅ presente | 0 | ui_only=true |

### UX-DASH-001 — Ações Pós-Autenticação (tenant_id PRESENTE)

| action_id | operation_id | type | tenant_id | sensitivity | Ciclo de vida |
|---|---|---|---|---|---|
| `load_dashboard_profile` | auth_me | view | ✅ presente | 0 | requested → succeeded/failed |

## Correlação UI ↔ Backend Domain Events

| UIActionEnvelope (frontend) | Domain Event (MOD-000 backend) | Correlação |
|---|---|---|
| submit_login (succeeded) | `auth.login_success` | X-Correlation-ID |
| submit_login (failed) | `auth.login_failed` | X-Correlation-ID |
| submit_logout (succeeded) | `auth.logout` | X-Correlation-ID |
| submit_forgot_password (succeeded) | `auth.password_reset_requested` | X-Correlation-ID |
| submit_reset_password (succeeded) | `auth.password_reset_completed` | X-Correlation-ID |
| load_current_user (succeeded) | — (leitura, sem evento) | X-Correlation-ID |
| load_dashboard_profile (succeeded) | — (leitura, sem evento) | X-Correlation-ID |

## Campos do UIActionEnvelope (DOC-ARC-003 §2)

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `correlation_id` | uuid v4 | SIM | Único por ação, propagado no header HTTP |
| `screen_id` | text | SIM | UX-AUTH-001, UX-SHELL-001 ou UX-DASH-001 |
| `action_id` | text | SIM | Identificador da ação (ex: submit_login) |
| `operation_id` | text | NÃO | operationId do OpenAPI (se não client_only) |
| `tenant_id` | uuid | CONDICIONAL | Presente em pós-auth, ausente em pré-auth |
| `status` | text | SIM | requested, succeeded, failed |
| `http_status` | int | NÃO | Preenchido em succeeded/failed |
| `duration_ms` | int | NÃO | Preenchido em succeeded/failed |
| `problem_type` | text | NÃO | Derivado de RFC 9457 em failed |

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-17
- **rastreia_para:** US-MOD-001-F02, FR-006, BR-001, BR-002, BR-006, SEC-EventMatrix, DOC-ARC-003, DOC-FND-000
- **referencias_exemplos:** EX-CI-007
- **evidencias:** N/A
