> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-19 | arquitetura | Baseline Inicial (forge-module) |
> | 0.3.0  | 2026-03-20 | AGN-DEV-04  | Re-enriquecimento DATA-003 Batch 2 — EVT-013/EVT-014 (link/unlink), dry_run suppression note, data atualizada |
> | 0.2.0  | 2026-03-19 | AGN-DEV-04  | Enriquecimento DATA-003 (enrich-agent) — catalogo completo com outbox, payload_policy, maskable_fields |

# DATA-003 — Catalogo de Domain Events da Parametrizacao Contextual e Rotinas

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-20
- **rastreia_para:** US-MOD-007, US-MOD-007-F01, US-MOD-007-F02, US-MOD-007-F03, DOC-ARC-003, DOC-FND-000, SEC-002, SEC-007, FR-007, FR-009, FR-010, INT-007
- **referencias_exemplos:** EX-DEV-001 (Envelope DATA-003)
- **evidencias:** N/A

> Habilita linha do tempo (Thread), auditoria, Outbox e automacao de notificacoes.

## Principios (MUST)

- **Nao use "permissao no evento" como fonte de verdade.**
  - Emit = permissao do comando que originou o evento
  - View = ACL + tenant da entity originaria
- `sensitivity_level` e **guard-rail** (mascarar/bloquear cedo), nao a regra principal.
- **Fonte Unica da Verdade:** Tabela `domain_events` e a unica fonte para auditoria/timeline (DOC-ARC-003 §1 Dogma 6).
- **SEC-002 referencia:** Regras de autorizacao Emit/View/Notify estao detalhadas em [SEC-002](../sec/SEC-002.md).

---

## Catalogo de Domain Events (14 eventos)

### Enquadradores e Regras de Incidencia (F01) — 6 eventos

#### EVT-001 — `framer_type.created`

| Campo | Valor |
|---|---|
| **event_type** | `framer_type.created` |
| **description** | Tipo de enquadrador criado |
| **origin_command** | POST /api/v1/admin/framer-types |
| **origin_entity** | entity_type: `context_framer_type`, entity_id_source: `response.id` |
| **emit_permission** | `param:framer:write` |
| **view_rule** | `tenant_id` match + `param:framer:read` |
| **notify** | enabled: false |
| **outbox** | enabled: false, dedupe_key: null, ttl: null |
| **sensitivity_level** | 1 (operacional) |
| **maskable_fields** | nenhum |
| **payload_policy** | Snapshot minimo: { id, codigo, nome, tenant_id }. Sem PII. |

#### EVT-002 — `framer.created`

| Campo | Valor |
|---|---|
| **event_type** | `framer.created` |
| **description** | Enquadrador de contexto criado |
| **origin_command** | POST /api/v1/admin/framers |
| **origin_entity** | entity_type: `context_framer`, entity_id_source: `response.id` |
| **emit_permission** | `param:framer:write` |
| **view_rule** | `tenant_id` match + `param:framer:read` |
| **notify** | enabled: false |
| **outbox** | enabled: false, dedupe_key: null, ttl: null |
| **sensitivity_level** | 1 (operacional) |
| **maskable_fields** | nenhum |
| **payload_policy** | Snapshot minimo: { id, codigo, nome, framer_type_id, status, valid_from, valid_until, tenant_id }. Sem PII. |

#### EVT-003 — `framer.updated`

| Campo | Valor |
|---|---|
| **event_type** | `framer.updated` |
| **description** | Enquadrador de contexto atualizado |
| **origin_command** | PATCH /api/v1/admin/framers/:id |
| **origin_entity** | entity_type: `context_framer`, entity_id_source: `params.id` |
| **emit_permission** | `param:framer:write` |
| **view_rule** | `tenant_id` match + `param:framer:read` |
| **notify** | enabled: false |
| **outbox** | enabled: false, dedupe_key: null, ttl: null |
| **sensitivity_level** | 1 (operacional) |
| **maskable_fields** | nenhum |
| **payload_policy** | Snapshot diff: { id, changed_fields: [...], previous_values: {...}, new_values: {...} }. Sem PII. |

#### EVT-004 — `framer.expired`

| Campo | Valor |
|---|---|
| **event_type** | `framer.expired` |
| **description** | Enquadrador expirou por vigencia (background job) |
| **origin_command** | Sistema (framer-expiration.job.ts — valid_until atingido) |
| **origin_entity** | entity_type: `context_framer`, entity_id_source: `framer.id` |
| **emit_permission** | sistema (sem scope de usuario — job automatico) |
| **view_rule** | `tenant_id` match + `param:framer:read` |
| **notify** | enabled: true, recipients_rule: admin (usuarios com `param:framer:write`) |
| **outbox** | enabled: false, dedupe_key: null, ttl: null |
| **sensitivity_level** | 1 (operacional) |
| **maskable_fields** | nenhum |
| **payload_policy** | Snapshot minimo: { id, codigo, nome, valid_until, expired_at, tenant_id }. Sem PII. |

#### EVT-005 — `incidence_rule.created`

| Campo | Valor |
|---|---|
| **event_type** | `incidence_rule.created` |
| **description** | Regra de incidencia criada |
| **origin_command** | POST /api/v1/admin/incidence-rules |
| **origin_entity** | entity_type: `incidence_rule`, entity_id_source: `response.id` |
| **emit_permission** | `param:framer:write` |
| **view_rule** | `tenant_id` match + `param:framer:read` |
| **notify** | enabled: false |
| **outbox** | enabled: false, dedupe_key: null, ttl: null |
| **sensitivity_level** | 1 (operacional) |
| **maskable_fields** | nenhum |
| **payload_policy** | Snapshot minimo: { id, framer_id, target_object_id, status, valid_from, tenant_id }. Sem PII. |

#### EVT-006 — `incidence_rule.updated`

| Campo | Valor |
|---|---|
| **event_type** | `incidence_rule.updated` |
| **description** | Regra de incidencia atualizada |
| **origin_command** | PATCH /api/v1/admin/incidence-rules/:id |
| **origin_entity** | entity_type: `incidence_rule`, entity_id_source: `params.id` |
| **emit_permission** | `param:framer:write` |
| **view_rule** | `tenant_id` match + `param:framer:read` |
| **notify** | enabled: false |
| **outbox** | enabled: false, dedupe_key: null, ttl: null |
| **sensitivity_level** | 1 (operacional) |
| **maskable_fields** | nenhum |
| **payload_policy** | Snapshot diff: { id, changed_fields: [...], previous_values: {...}, new_values: {...} }. Sem PII. |

---

### Rotinas de Comportamento (F02) — 7 eventos

#### EVT-007 — `routine.created`

| Campo | Valor |
|---|---|
| **event_type** | `routine.created` |
| **description** | Rotina de comportamento criada |
| **origin_command** | POST /api/v1/admin/routines |
| **origin_entity** | entity_type: `behavior_routine`, entity_id_source: `response.id` |
| **emit_permission** | `param:routine:write` |
| **view_rule** | `tenant_id` match + `param:routine:read` |
| **notify** | enabled: false |
| **outbox** | enabled: false, dedupe_key: null, ttl: null |
| **sensitivity_level** | 1 (operacional) |
| **maskable_fields** | nenhum |
| **payload_policy** | Snapshot minimo: { id, codigo, nome, routine_type, version, status, tenant_id }. Sem PII. |

#### EVT-008 — `routine.published`

| Campo | Valor |
|---|---|
| **event_type** | `routine.published` |
| **description** | Rotina publicada (DRAFT -> PUBLISHED) |
| **origin_command** | POST /api/v1/admin/routines/:id/publish |
| **origin_entity** | entity_type: `behavior_routine`, entity_id_source: `params.id` |
| **emit_permission** | `param:routine:publish` |
| **view_rule** | `tenant_id` match + `param:routine:read` |
| **notify** | enabled: true, recipients_rule: admin (usuarios com `param:routine:publish` ou `param:framer:write`) |
| **outbox** | enabled: false, dedupe_key: null, ttl: null |
| **sensitivity_level** | 1 (operacional) |
| **maskable_fields** | nenhum |
| **payload_policy** | Snapshot: { id, codigo, nome, version, published_at, approved_by, items_count, tenant_id }. Sem PII exceto approved_by (user_id opaco). |

#### EVT-009 — `routine.forked`

| Campo | Valor |
|---|---|
| **event_type** | `routine.forked` |
| **description** | Rotina forkada (nova versao criada) |
| **origin_command** | POST /api/v1/admin/routines/:id/fork |
| **origin_entity** | entity_type: `behavior_routine`, entity_id_source: `response.id` (nova rotina) |
| **emit_permission** | `param:routine:write` |
| **view_rule** | `tenant_id` match + `param:routine:read` |
| **notify** | enabled: false |
| **outbox** | enabled: false, dedupe_key: null, ttl: null |
| **sensitivity_level** | 1 (operacional) |
| **maskable_fields** | `change_reason` (truncar a 200 chars) |
| **payload_policy** | Snapshot: { id (novo), parent_routine_id, version, change_reason (truncado), items_copied_count, links_copied_count, tenant_id }. Sem PII. |

#### EVT-010 — `routine.deprecated`

| Campo | Valor |
|---|---|
| **event_type** | `routine.deprecated` |
| **description** | Rotina deprecada (PUBLISHED -> DEPRECATED) |
| **origin_command** | PATCH /api/v1/admin/routines/:id (status=DEPRECATED) |
| **origin_entity** | entity_type: `behavior_routine`, entity_id_source: `params.id` |
| **emit_permission** | `param:routine:write` |
| **view_rule** | `tenant_id` match + `param:routine:read` |
| **notify** | enabled: true, recipients_rule: admin (usuarios com `param:routine:publish` ou `param:framer:write`) |
| **outbox** | enabled: false, dedupe_key: null, ttl: null |
| **sensitivity_level** | 1 (operacional) |
| **maskable_fields** | nenhum |
| **payload_policy** | Snapshot minimo: { id, codigo, nome, version, deprecated_at, tenant_id }. Sem PII. |

#### EVT-011 — `routine.item_added`

| Campo | Valor |
|---|---|
| **event_type** | `routine.item_added` |
| **description** | Item adicionado a rotina DRAFT |
| **origin_command** | POST /api/v1/admin/routines/:id/items |
| **origin_entity** | entity_type: `routine_item`, entity_id_source: `response.id` |
| **emit_permission** | `param:routine:write` |
| **view_rule** | `tenant_id` match + `param:routine:read` |
| **notify** | enabled: false |
| **outbox** | enabled: false, dedupe_key: null, ttl: null |
| **sensitivity_level** | 1 (operacional) |
| **maskable_fields** | nenhum |
| **payload_policy** | Snapshot minimo: { id, routine_id, item_type, action, target_field_id, ordem, tenant_id }. Sem PII. value jsonb NAO incluido no evento (pode conter dados de negocio sensiveis). |

#### EVT-012B — `routine.incidence_linked`

| Campo | Valor |
|---|---|
| **event_type** | `routine.incidence_linked` |
| **description** | Rotina PUBLISHED vinculada a regra de incidencia |
| **origin_command** | POST /api/v1/admin/incidence-rules/:id/link-routine |
| **origin_entity** | entity_type: `routine_incidence_link`, entity_id_source: `response.id` |
| **emit_permission** | `param:framer:write` |
| **view_rule** | `tenant_id` match + `param:framer:read` |
| **notify** | enabled: false |
| **outbox** | enabled: false, dedupe_key: null, ttl: null |
| **sensitivity_level** | 1 (operacional) |
| **maskable_fields** | nenhum |
| **payload_policy** | Snapshot minimo: { id, routine_id, incidence_rule_id, tenant_id }. Sem PII. |

#### EVT-012C — `routine.incidence_unlinked`

| Campo | Valor |
|---|---|
| **event_type** | `routine.incidence_unlinked` |
| **description** | Vinculo entre rotina e regra de incidencia removido |
| **origin_command** | DELETE /api/v1/admin/incidence-rules/:id/unlink-routine/:routineId |
| **origin_entity** | entity_type: `routine_incidence_link`, entity_id_source: `params.routineId + params.id` |
| **emit_permission** | `param:framer:write` |
| **view_rule** | `tenant_id` match + `param:framer:read` |
| **notify** | enabled: false |
| **outbox** | enabled: false, dedupe_key: null, ttl: null |
| **sensitivity_level** | 1 (operacional) |
| **maskable_fields** | nenhum |
| **payload_policy** | Snapshot minimo: { routine_id, incidence_rule_id, tenant_id }. Sem PII. |

---

### Motor de Avaliacao (F03) — 1 evento

#### EVT-012 — `routine.applied`

| Campo | Valor |
|---|---|
| **event_type** | `routine.applied` |
| **description** | Motor de avaliacao aplicou rotina(s) a um objeto em contexto. Emitido somente quando ao menos 1 rotina e aplicada (BR-010). |
| **origin_command** | POST /api/v1/routine-engine/evaluate |
| **origin_entity** | entity_type: `evaluation_result`, entity_id_source: gerado (correlation_id do request) |
| **emit_permission** | `param:engine:evaluate` |
| **view_rule** | `tenant_id` match + `param:routine:read` |
| **notify** | enabled: false |
| **outbox** | enabled: false, dedupe_key: null, ttl: null |
| **sensitivity_level** | 1 (operacional) |
| **maskable_fields** | nenhum |
| **payload_policy** | Snapshot: { object_type, object_id, context_framers: [...], applied_routines: [{ routine_id, version, items_applied_count }], blocking_validations_count, correlation_id, tenant_id }. Sem PII. Nao incluir valor completo dos itens aplicados (volume). |

---

## Regras Globais de Eventos

| Regra | Descricao |
|---|---|
| **Persistencia** | Todos os eventos sao persistidos na tabela `domain_events` (Foundation DOC-ARC-003 §1) |
| **Correlation** | Todos os eventos incluem `X-Correlation-ID` do request original |
| **Tenant isolation** | Leitura de eventos filtrada obrigatoriamente por `tenant_id` |
| **Outbox** | Nenhum evento deste modulo usa outbox pattern (todos sao intra-sistema) |
| **Retencao** | Padrao Foundation (configuravel por tenant) |
| **Emissao condicional** | `routine.applied` so emitido quando applied_routines > 0 (BR-010) |
| **Supressao dry_run** | Quando `dry_run: true` no request de avaliacao, o motor executa passos 1-5 normalmente mas **NAO** persiste `routine.applied` (EVT-012). Sem side-effects (FR-009, PEN-007/PEN-006). |
| **Mascaramento** | `change_reason` truncado a 200 chars em `routine.forked`; `value` jsonb NAO incluido em `routine.item_added` |
