> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.2.0  | 2026-03-19 | AGN-DEV-04  | Enriquecimento DATA-003 — maskable_fields, payload_policy, outbox, ponte UI-API-Domain, campos minimos |
> | 0.1.0  | 2026-03-18 | arquitetura | Baseline Inicial (forge-module) |

# DATA-003 — Catálogo de Domain Events da Execução de Casos

> Habilita linha do tempo (Thread), auditoria, Outbox e automação de notificações.

## Princípios (MUST)

- **Não use "permissão no evento" como fonte de verdade.**
  - Emit = permissão do comando que originou o evento
  - View = ACL + tenant da entity originária
- `sensitivity_level` é **guard-rail** (mascarar/bloquear cedo), não a regra principal.
- **Fonte Única da Verdade:** Tabela `domain_events` é a única fonte para auditoria/timeline (DOC-ARC-003 §1 Dogma 6).
- **SEC-002 referência:** Regras de autorização Emit/View/Notify estão detalhadas em SEC-002.

---

## Catálogo de Domain Events (11 eventos)

### Ciclo de Vida do Caso

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields | payload_policy |
|---|---|---|---|---|---|---|---|---|---|
| `case.opened` | Caso aberto vinculado a ciclo PUBLISHED | POST /api/v1/cases | `case_instance` | `process:case:write` | tenant + `process:case:read` | — | 1 | — | snapshot: id, codigo, cycle_id, cycle_version_id, current_stage_id, status, tenant_id, opened_by |
| `case.stage_transitioned` | Caso transitou para novo estágio | POST /api/v1/cases/:id/transition | `case_instance` | `process:case:write` | tenant + `process:case:read` | assigned_users | 1 | — | snapshot: id, codigo, from_stage_id, to_stage_id, transition_id, transitioned_by |
| `case.completed` | Caso concluido (estagio terminal) | POST /api/v1/cases/:id/transition | `case_instance` | `process:case:write` | tenant + `process:case:read` | admin + assigned_users | 1 | — | snapshot: id, codigo, final_stage_id, completed_at |
| `case.cancelled` | Caso cancelado com motivo | POST /api/v1/cases/:id/cancel | `case_instance` | `process:case:cancel` | tenant + `process:case:read` | admin + assigned_users | 1 | cancellation_reason | snapshot: id, codigo, cancelled_at; motivo truncado a 200 chars no payload |
| `case.on_hold` | Caso suspenso | POST /api/v1/cases/:id/hold | `case_instance` | `process:case:write` | tenant + `process:case:read` | assigned_users | 1 | — | snapshot: id, codigo, motivo |
| `case.resumed` | Caso retomado | POST /api/v1/cases/:id/resume | `case_instance` | `process:case:write` | tenant + `process:case:read` | assigned_users | 1 | — | snapshot: id, codigo |

### Gates

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields | payload_policy |
|---|---|---|---|---|---|---|---|---|---|
| `case.gate_resolved` | Gate resolvido (APPROVED/REJECTED/DOCUMENT/CHECKLIST) | POST /api/v1/cases/:id/gates/:gateId/resolve | `gate_instance` | `process:case:gate_resolve` | tenant + `process:case:read` | assigned_users | 1 | parecer | snapshot: case_id, gate_id, gate_type, status, decision, resolved_by; parecer truncado a 200 chars |
| `case.gate_waived` | Gate dispensado com motivo auditado | POST /api/v1/cases/:id/gates/:gateId/waive | `gate_instance` | `process:case:gate_waive` | tenant + `process:case:read` | admin | 1 | — | snapshot: case_id, gate_id, gate_type, waived_by, motivo |

### Atribuicoes

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields | payload_policy |
|---|---|---|---|---|---|---|---|---|---|
| `case.assignment_created` | Responsavel atribuido a papel | POST /api/v1/cases/:id/assignments | `case_assignment` | `process:case:assign` | tenant + `process:case:read` | assigned_user | 1 | — | snapshot: case_id, stage_id, process_role_id, user_id, assigned_by |
| `case.assignment_replaced` | Responsavel substituido | POST /api/v1/cases/:id/assignments | `case_assignment` | `process:case:assign` | tenant + `process:case:read` | prev_user, new_user | 1 | substitution_reason | snapshot: case_id, stage_id, process_role_id, prev_user_id, new_user_id, substitution_reason truncado a 200 chars |

### Eventos Avulsos

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields | payload_policy |
|---|---|---|---|---|---|---|---|---|---|
| `case.event_recorded` | Evento avulso registrado no caso | POST /api/v1/cases/:id/events | `case_event` | `process:case:write` | tenant + `process:case:read` | — | 1 | descricao | snapshot: case_id, event_type, stage_id, created_by; descricao truncada a 200 chars |

---

## Ponte UI-API-Domain (DOC-ARC-003 §3)

> Campos obrigatorios `ui_actions` e `operation_ids` completam o trajeto do clique ao banco.

| event_type | ui_actions | operation_ids |
|---|---|---|
| `case.opened` | `create` | `cases_open` |
| `case.stage_transitioned` | `transition` | `cases_transition` |
| `case.completed` | `transition` | `cases_transition` |
| `case.cancelled` | `cancel` | `cases_cancel` |
| `case.on_hold` | `hold` | `cases_hold` |
| `case.resumed` | `resume` | `cases_resume` |
| `case.gate_resolved` | `resolve` | `cases_gates_resolve` |
| `case.gate_waived` | `waive` | `cases_gates_waive` |
| `case.assignment_created` | `assign` | `cases_assignments_create` |
| `case.assignment_replaced` | `reassign` | `cases_assignments_create` |
| `case.event_recorded` | `record_event` | `cases_events_create` |

---

## Outbox / Deduplicacao

| Propriedade | Valor | Justificativa |
|---|---|---|
| `outbox.enabled` | false | MOD-006 nao possui integracoes assincronas externas que exijam garantia at-least-once. Eventos sao emitidos sincronamente na transacao |
| `dedupe_key` | null | POST /cases usa Idempotency-Key (TTL 60s) para deduplicacao no nivel HTTP |
| `ttl` | null | Retencao padrao da tabela `domain_events` (definida no Foundation) |

> **Nota futura:** Se MOD-008 (Integracao Protheus) precisar reagir a `case.stage_transitioned` ou `case.completed` via event-driven, habilitar outbox para esses eventos especificos.

---

## Campos Minimos Recomendados (DOC-FND-000 §3)

| Campo | Tipo | Obrigatorio | Descricao |
|---|---|---|---|
| `id` | uuid v4 | SIM | PK do evento |
| `tenant_id` | uuid | SIM | Isolamento multi-tenant |
| `entity_type` | text | SIM | Ex: `case_instance`, `gate_instance`, `case_assignment`, `case_event` |
| `entity_id` | uuid | SIM | ID da entidade afetada |
| `event_type` | text | SIM | Ex: `case.opened`, `case.stage_transitioned` |
| `payload` | jsonb | SIM | Snapshot minimo conforme payload_policy (sem PII desnecessaria) |
| `created_at` | timestamptz | SIM | Timestamp do evento |
| `created_by` | uuid | SIM | Usuario que disparou |
| `correlation_id` | uuid | SIM | Rastreabilidade cross-service (X-Correlation-ID) |
| `causation_id` | uuid | NAO | Evento que causou este (ex: transicao terminal gera case.completed apos case.stage_transitioned) |
| `sensitivity_level` | integer | SIM | 1 para todos os eventos MOD-006 |
| `dedupe_key` | text | NAO | Nao utilizado neste modulo |

**Indexes padrao (DOC-FND-000):**
- `(tenant_id, entity_type, entity_id, created_at DESC)` — timeline por entidade
- `(tenant_id, event_type, created_at DESC)` — busca por tipo de evento

---

## Regras de Filtragem (MUST)

1. `tenant_id` obrigatorio em todas as consultas a `domain_events`
2. Validacao ACL (`process:case:read`) antes de retornar eventos
3. `sensitivity_level = 1` em todos os eventos MOD-006 — operacoes com dados operacionais (pareceres, motivos) que podem conter informacoes de negocio
4. Campos com `maskable_fields` DEVEM ser truncados/mascarados conforme SEC-002
5. `causation_id` DEVE ser preenchido quando um evento causa outro (ex: transicao terminal → `case.stage_transitioned` causa `case.completed`)

---

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-006, US-MOD-006-F01, US-MOD-006-F02, BR-006, FR-006, SEC-002, DOC-ARC-003, DOC-FND-000, INT-006
- **referencias_exemplos:** EX-DATA-003
- **evidencias:** N/A
