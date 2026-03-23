> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-19 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-19 | AGN-DEV-01  | Enriquecimento Batch 1 |
> | 0.3.0  | 2026-03-19 | AGN-DEV-04  | Enriquecimento Batch 2 — formato expandido por evento (PKG-DEV-001 §5), outbox, notify, maskable_fields |

# DATA-003 — Catálogo de Domain Events de Movimentos sob Aprovação

> Habilita linha do tempo (Thread), auditoria, Outbox e automação de notificações.

## Princípios (MUST)

- **Não use "permissão no evento" como fonte de verdade.**
  - Emit = permissão do comando
  - View = ACL + tenant da entity originária
- `sensitivity_level` é **guard-rail** (mascarar/bloquear cedo), não a regra principal.
- **Fonte Única da Verdade:** Tabela `domain_events` é a única fonte para auditoria/timeline (DOC-ARC-003 §1 Dogma 6).

---

## Catálogo de Domain Events

### 1. `approval.control_rule_created`

| Propriedade | Valor |
|---|---|
| **description** | Regra de controle de gravação criada |
| **origin_command** | `POST /api/v1/admin/control-rules` |
| **origin_entity** | `movement_control_rule` |
| **emit_permission_id** | `approval:rule:write` |
| **view_rule** | `canRead(control_rule)` + tenant |
| **notify.enabled** | false |
| **notify.recipients_rule** | — |
| **outbox.enabled** | false |
| **outbox.dedupe_key** | — |
| **sensitivity_level** | 0 |
| **maskable_fields** | — |
| **payload_policy** | snapshot: `id`, `codigo`, `nome`, `object_type`, `operation_type`, `status`, `priority`, `valid_from` |

### 2. `approval.control_rule_updated`

| Propriedade | Valor |
|---|---|
| **description** | Regra de controle de gravação atualizada |
| **origin_command** | `PATCH /api/v1/admin/control-rules/:id` |
| **origin_entity** | `movement_control_rule` |
| **emit_permission_id** | `approval:rule:write` |
| **view_rule** | `canRead(control_rule)` + tenant |
| **notify.enabled** | false |
| **notify.recipients_rule** | — |
| **outbox.enabled** | false |
| **outbox.dedupe_key** | — |
| **sensitivity_level** | 0 |
| **maskable_fields** | — |
| **payload_policy** | snapshot: `id`, `codigo`, `changed_fields` (before/after) |

### 3. `approval.approval_rule_created`

| Propriedade | Valor |
|---|---|
| **description** | Regra de alçada (nível de aprovação) criada |
| **origin_command** | `POST /api/v1/admin/control-rules/:id/approval-rules` |
| **origin_entity** | `approval_rule` |
| **emit_permission_id** | `approval:rule:write` |
| **view_rule** | `canRead(control_rule)` + tenant |
| **notify.enabled** | false |
| **notify.recipients_rule** | — |
| **outbox.enabled** | false |
| **outbox.dedupe_key** | — |
| **sensitivity_level** | 0 |
| **maskable_fields** | — |
| **payload_policy** | snapshot: `id`, `control_rule_id`, `level`, `approver_type`, `approver_ref`, `timeout_hours` |

### 4. `movement.created`

| Propriedade | Valor |
|---|---|
| **description** | Movimento controlado criado pelo motor de controle — operação interceptada aguarda aprovação |
| **origin_command** | `POST /api/v1/movement-engine/evaluate` |
| **origin_entity** | `controlled_movement` |
| **emit_permission_id** | `approval:engine:evaluate` |
| **view_rule** | `canRead(movement)` + tenant |
| **notify.enabled** | true |
| **notify.recipients_rule** | Aprovadores nível 1 (via `approval_rules` onde `level=1` para a `control_rule_id`) + solicitante |
| **outbox.enabled** | true |
| **outbox.dedupe_key** | `movement:{movement_id}:created` |
| **sensitivity_level** | 1 |
| **maskable_fields** | `operation_payload` (pode conter dados de negócio sensíveis) |
| **payload_policy** | snapshot: `movement_id`, `codigo`, `object_type`, `operation_type`, `origin_type`, `requested_by`, `status`, `operation_value`, `control_rule_id`, `correlation_id` |

### 5. `movement.approved`

| Propriedade | Valor |
|---|---|
| **description** | Movimento aprovado por um nível da cadeia de aprovação |
| **origin_command** | `POST /api/v1/my/approvals/:approvalId/approve` |
| **origin_entity** | `controlled_movement` |
| **emit_permission_id** | `approval:decide` |
| **view_rule** | `canRead(movement)` + tenant |
| **notify.enabled** | true |
| **notify.recipients_rule** | Solicitante (`requested_by`) + próximo nível de aprovadores (se houver) — se nível final, notifica solicitante com status APPROVED |
| **outbox.enabled** | true |
| **outbox.dedupe_key** | `movement:{movement_id}:approved:level:{level}` |
| **sensitivity_level** | 1 |
| **maskable_fields** | — |
| **payload_policy** | snapshot: `movement_id`, `status`, `actor_id`, `level`, `decided_at`, `parecer`, `is_final_level` |

### 6. `movement.rejected`

| Propriedade | Valor |
|---|---|
| **description** | Movimento reprovado — operação bloqueada, solicitante notificado |
| **origin_command** | `POST /api/v1/my/approvals/:approvalId/reject` |
| **origin_entity** | `controlled_movement` |
| **emit_permission_id** | `approval:decide` |
| **view_rule** | `canRead(movement)` + tenant |
| **notify.enabled** | true |
| **notify.recipients_rule** | Solicitante (`requested_by`) + watchers (aprovadores de outros níveis que já decidiram) |
| **outbox.enabled** | true |
| **outbox.dedupe_key** | `movement:{movement_id}:rejected` |
| **sensitivity_level** | 1 |
| **maskable_fields** | — |
| **payload_policy** | snapshot: `movement_id`, `status`, `actor_id`, `level`, `decided_at`, `parecer` |

### 7. `movement.executed`

| Propriedade | Valor |
|---|---|
| **description** | Operação executada com sucesso após aprovação completa |
| **origin_command** | Sistema (pós-aprovação) |
| **origin_entity** | `controlled_movement` |
| **emit_permission_id** | sistema (internal) |
| **view_rule** | `canRead(movement)` + tenant |
| **notify.enabled** | true |
| **notify.recipients_rule** | Solicitante (`requested_by`) + todos os aprovadores da cadeia |
| **outbox.enabled** | true |
| **outbox.dedupe_key** | `movement:{movement_id}:executed` |
| **sensitivity_level** | 1 |
| **maskable_fields** | `execution_payload` (pode conter dados de negócio sensíveis) |
| **payload_policy** | snapshot: `movement_id`, `status`, `executed_by`, `executed_at`, `result`, `correlation_id` |

### 8. `movement.failed`

| Propriedade | Valor |
|---|---|
| **description** | Execução da operação falhou após aprovação — requer atenção |
| **origin_command** | Sistema (pós-aprovação) |
| **origin_entity** | `controlled_movement` |
| **emit_permission_id** | sistema (internal) |
| **view_rule** | `canRead(movement)` + tenant |
| **notify.enabled** | true |
| **notify.recipients_rule** | Solicitante (`requested_by`) + admin do tenant |
| **outbox.enabled** | true |
| **outbox.dedupe_key** | `movement:{movement_id}:failed` |
| **sensitivity_level** | 1 |
| **maskable_fields** | `error_message` (pode conter detalhes internos) |
| **payload_policy** | snapshot: `movement_id`, `status`, `result`, `error_message`, `retry_of`, `correlation_id` |

### 9. `movement.cancelled`

| Propriedade | Valor |
|---|---|
| **description** | Movimento cancelado pelo solicitante antes de aprovação |
| **origin_command** | `POST /api/v1/movements/:id/cancel` |
| **origin_entity** | `controlled_movement` |
| **emit_permission_id** | `approval:movement:write` |
| **view_rule** | `canRead(movement)` + tenant |
| **notify.enabled** | true |
| **notify.recipients_rule** | Aprovadores com instâncias PENDING (libera da inbox) |
| **outbox.enabled** | true |
| **outbox.dedupe_key** | `movement:{movement_id}:cancelled` |
| **sensitivity_level** | 1 |
| **maskable_fields** | — |
| **payload_policy** | snapshot: `movement_id`, `status`, `actor_id`, `cancelled_at`, `cancellation_reason` |

### 10. `movement.overridden`

| Propriedade | Valor |
|---|---|
| **description** | Override executado — operação aprovada por autoridade superior com justificativa obrigatória |
| **origin_command** | `POST /api/v1/movements/:id/override` |
| **origin_entity** | `controlled_movement` |
| **emit_permission_id** | `approval:override` |
| **view_rule** | `canRead(movement)` + tenant |
| **notify.enabled** | true |
| **notify.recipients_rule** | Solicitante (`requested_by`) + admin do tenant + compliance (se configurado) |
| **outbox.enabled** | true |
| **outbox.dedupe_key** | `movement:{movement_id}:overridden` |
| **sensitivity_level** | 1 |
| **maskable_fields** | — |
| **payload_policy** | snapshot: `movement_id`, `status`, `overridden_by`, `overridden_at`, `justificativa` (MUST, min 20 chars), `scope_used` |

### 11. `movement.escalated`

| Propriedade | Valor |
|---|---|
| **description** | Aprovação escalou para próximo nível por timeout do nível atual |
| **origin_command** | Sistema (cron job de timeout) |
| **origin_entity** | `controlled_movement` |
| **emit_permission_id** | sistema (internal) |
| **view_rule** | `canRead(movement)` + tenant |
| **notify.enabled** | true |
| **notify.recipients_rule** | Novo aprovador (nível escalado via `escalation_rule_id`) + solicitante |
| **outbox.enabled** | true |
| **outbox.dedupe_key** | `movement:{movement_id}:escalated:level:{new_level}` |
| **sensitivity_level** | 1 |
| **maskable_fields** | — |
| **payload_policy** | snapshot: `movement_id`, `status`, `previous_level`, `new_level`, `escalated_from_rule_id`, `escalated_to_rule_id`, `timeout_at` |

### 12. `movement.timeout`

| Propriedade | Valor |
|---|---|
| **description** | Nível de aprovação expirou sem decisão — sem regra de escalada configurada |
| **origin_command** | Sistema (cron job de timeout) |
| **origin_entity** | `controlled_movement` |
| **emit_permission_id** | sistema (internal) |
| **view_rule** | `canRead(movement)` + tenant |
| **notify.enabled** | true |
| **notify.recipients_rule** | Admin do tenant + solicitante (`requested_by`) |
| **outbox.enabled** | true |
| **outbox.dedupe_key** | `movement:{movement_id}:timeout:level:{level}` |
| **sensitivity_level** | 1 |
| **maskable_fields** | — |
| **payload_policy** | snapshot: `movement_id`, `status`, `level`, `timeout_at`, `assigned_to` |

### 13. `movement.auto_approved`

| Propriedade | Valor |
|---|---|
| **description** | Auto-aprovação por suficiência de escopo — solicitante possui scope com `allow_self_approve=true` |
| **origin_command** | `POST /api/v1/movement-engine/evaluate` |
| **origin_entity** | `controlled_movement` |
| **emit_permission_id** | sistema (internal) |
| **view_rule** | `canRead(movement)` + tenant |
| **notify.enabled** | false |
| **notify.recipients_rule** | Solicitante (log apenas — sem notificação push) |
| **outbox.enabled** | true |
| **outbox.dedupe_key** | `movement:{movement_id}:auto_approved` |
| **sensitivity_level** | 1 |
| **maskable_fields** | — |
| **payload_policy** | snapshot: `movement_id`, `status`, `requested_by`, `scope_used` (justificativa automática), `control_rule_id` |

---

## Ponte UI-API-Domain (DOC-ARC-003 §3)

> Campos obrigatórios `ui_actions` e `operation_ids` completam o trajeto do clique ao banco.

| event_type | ui_actions | operation_ids |
|---|---|---|
| `approval.control_rule_created` | `create` | `admin_control_rules_create` |
| `approval.control_rule_updated` | `update` | `admin_control_rules_update` |
| `approval.approval_rule_created` | `create` | `admin_approval_rules_create` |
| `movement.created` | `evaluate` | `movement_engine_evaluate` |
| `movement.approved` | `approve` | `my_approvals_approve` |
| `movement.rejected` | `reject` | `my_approvals_reject` |
| `movement.executed` | — (sistema) | — |
| `movement.failed` | — (sistema) | — |
| `movement.cancelled` | `cancel` | `movements_cancel` |
| `movement.overridden` | `override` | `movements_override` |
| `movement.escalated` | — (cron) | — |
| `movement.timeout` | — (cron) | — |
| `movement.auto_approved` | `evaluate` | `movement_engine_evaluate` |

---

## Outbox / Deduplicação

| Propriedade | Valor | Justificativa |
|---|---|---|
| `outbox.enabled` | **true** (eventos 4–13) / false (eventos 1–3) | Eventos de movimentos (4–13) exigem garantia at-least-once para notificações e integrações; eventos administrativos (1–3) são síncronos sem side-effects externos |
| `dedupe_key` | `movement:{movement_id}:{event_suffix}` | Deduplicação por movimento + tipo de evento; para eventos com nível, inclui `:level:{level}` |
| `ttl` | Retenção padrão da tabela `domain_events` (definida no Foundation) | — |

> **Nota:** O outbox é essencial para garantir que notificações de aprovação, rejeição, timeout e escalada sejam entregues mesmo em cenário de falha parcial.

---

## Campos Mínimos Recomendados (DOC-FND-000 §3)

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid v4 | SIM | PK do evento |
| `tenant_id` | uuid | SIM | Isolamento multi-tenant |
| `entity_type` | text | SIM | Ex: `controlled_movement`, `movement_control_rule`, `approval_rule` |
| `entity_id` | uuid | SIM | ID da entidade afetada |
| `event_type` | text | SIM | Ex: `movement.created`, `movement.approved` |
| `payload` | jsonb | SIM | Snapshot mínimo da entidade (sem PII desnecessária) |
| `created_at` | timestamptz | SIM | Timestamp do evento |
| `created_by` | uuid | SIM | Usuário que disparou (ou `system` para cron/async) |
| `correlation_id` | uuid | SIM | Rastreabilidade cross-service (X-Correlation-ID) |
| `causation_id` | uuid | NÃO | Evento que causou este (ex: `movement.approved` no nível N-1 causa criação de instância nível N) |
| `sensitivity_level` | integer | SIM | 0 para admin (eventos 1–3), 1 para movimentos (eventos 4–13) |
| `dedupe_key` | text | NÃO | Usado nos eventos 4–13 (outbox enabled) |

**Indexes padrão (DOC-FND-000):**

- `(tenant_id, entity_type, entity_id, created_at DESC)` — timeline por entidade
- `(tenant_id, event_type, created_at DESC)` — busca por tipo de evento

---

## Regras de Filtragem (MUST)

1. `tenant_id` obrigatório em todas as consultas a `domain_events`
2. Validação ACL (`approval:movement:read` ou `approval:rule:read`) antes de retornar eventos
3. `sensitivity_level = 1` nos eventos de movimento — `operation_payload` e `execution_payload` referenciados via `movement_id`, não duplicados no evento
4. Override (`movement.overridden`): payload DEVE incluir `justificativa` (min 20 chars) e `scope_used`
5. Auto-aprovação (`movement.auto_approved`): payload DEVE incluir `scope_used` como justificativa automática
6. Escalada (`movement.escalated`): `causation_id` aponta para o evento `movement.timeout` que a causou

---

- **estado_item:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-23
- **rastreia_para:** US-MOD-009, DOC-ARC-003, DOC-FND-000, FR-009, SEC-009, INT-009
- **referencias_exemplos:** N/A
- **evidencias:** N/A
