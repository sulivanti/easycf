> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-16 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-17 | AGN-DEV-04  | Enriquecimento DATA-003 (enrich-agent) |
> | 0.3.0  | 2026-03-17 | AGN-DEV-04  | Re-enriquecimento DATA-003 — ui_actions + operation_ids (DOC-ARC-003 §3), ponte UI-API-Domain |
>
| 0.4.0  | 2026-03-18 | AGN-DEV-04  | Enriquecimento DATA-003 — eventos UPDATE/DELETE adicionados (PEN-005 Q7 Opção A) |

# DATA-003 — Catálogo de Domain Events da Modelagem de Processos

> Habilita linha do tempo (Thread), auditoria, Outbox e automação de notificações.

## Princípios (MUST)

- **Não use "permissão no evento" como fonte de verdade.**
  - Emit = permissão do comando
  - View = ACL + tenant da entity originária
- `sensitivity_level` é **guard-rail** (mascarar/bloquear cedo), não a regra principal.
- **Fonte Única da Verdade:** Tabela `domain_events` é a única fonte para auditoria/timeline (DOC-ARC-003 §1 Dogma 6).

---

## Catálogo de Domain Events

### Ciclos de Processo

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields | payload_policy |
|---|---|---|---|---|---|---|---|---|---|
| `process.cycle_created` | Ciclo criado em DRAFT | POST /admin/cycles | `process_cycle` | `process:cycle:write` | tenant + `process:cycle:read` | — | 0 | — | snapshot: id, codigo, nome, version, status |
| `process.cycle_published` | Ciclo promovido a PUBLISHED (imutável) | POST /admin/cycles/:id/publish | `process_cycle` | `process:cycle:publish` | tenant + `process:cycle:read` | admin | 0 | — | snapshot: id, codigo, nome, version, published_at |
| `process.cycle_forked` | Nova versão DRAFT a partir de PUBLISHED | POST /admin/cycles/:id/fork | `process_cycle` | `process:cycle:write` | tenant + `process:cycle:read` | — | 0 | — | snapshot: new_id, parent_cycle_id, new_version |
| `process.cycle_deprecated` | Ciclo depreciado (sem novas instâncias) | PATCH /admin/cycles/:id status→DEPRECATED | `process_cycle` | `process:cycle:write` | tenant + `process:cycle:read` | admin | 0 | — | snapshot: id, codigo, version |
| `process.cycle_updated` | Campos do ciclo DRAFT alterados (nome, descrição) | PATCH /admin/cycles/:id | `process_cycle` | `process:cycle:write` | tenant + `process:cycle:read` | — | 0 | — | snapshot: id, changed_fields (before/after) |

### Estrutura do Blueprint

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields | payload_policy |
|---|---|---|---|---|---|---|---|---|---|
| `process.macro_stage_created` | Macroetapa adicionada ao ciclo | POST /admin/cycles/:cid/macro-stages | `process_macro_stage` | `process:cycle:write` | tenant + `process:cycle:read` | — | 0 | — | snapshot: id, cycle_id, codigo, nome, ordem |
| `process.stage_created` | Estágio adicionado à macroetapa | POST /admin/macro-stages/:mid/stages | `process_stage` | `process:cycle:write` | tenant + `process:cycle:read` | — | 0 | — | snapshot: id, macro_stage_id, codigo, nome, is_initial, is_terminal |
| `process.gate_created` | Gate adicionado ao estágio | POST /admin/stages/:sid/gates | `process_gate` | `process:cycle:write` | tenant + `process:cycle:read` | — | 0 | — | snapshot: id, stage_id, nome, gate_type, required, ordem |
| `process.stage_role_linked` | Papel vinculado ao estágio | POST /admin/stages/:sid/roles | `stage_role_link` | `process:cycle:write` | tenant + `process:cycle:read` | — | 0 | — | snapshot: id, stage_id, role_id, required |
| `process.transition_created` | Transição entre estágios criada | POST /admin/stage-transitions | `stage_transition` | `process:cycle:write` | tenant + `process:cycle:read` | — | 0 | — | snapshot: id, from_stage_id, to_stage_id, nome, gate_required, evidence_required |

### Operações de UPDATE

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields | payload_policy |
|---|---|---|---|---|---|---|---|---|---|
| `process.macro_stage_updated` | Campos da macroetapa alterados | PATCH /admin/cycles/:cid/macro-stages/:id | `process_macro_stage` | `process:cycle:write` | tenant + `process:cycle:read` | — | 0 | — | snapshot: id, cycle_id, changed_fields (before/after) |
| `process.stage_updated` | Campos do estágio alterados | PATCH /admin/macro-stages/:mid/stages/:id | `process_stage` | `process:cycle:write` | tenant + `process:cycle:read` | — | 0 | — | snapshot: id, macro_stage_id, changed_fields (before/after) |
| `process.gate_updated` | Campos do gate alterados | PATCH /admin/stages/:sid/gates/:id | `process_gate` | `process:cycle:write` | tenant + `process:cycle:read` | — | 0 | — | snapshot: id, stage_id, changed_fields (before/after) |

### Operações de DELETE

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields | payload_policy |
|---|---|---|---|---|---|---|---|---|---|
| `process.macro_stage_deleted` | Macroetapa removida (soft-delete) | DELETE /admin/cycles/:cid/macro-stages/:id | `process_macro_stage` | `process:cycle:write` | tenant + `process:cycle:read` | — | 0 | — | snapshot: id, cycle_id, codigo, nome |
| `process.stage_deleted` | Estágio removido (soft-delete, ciclo DRAFT) | DELETE /admin/macro-stages/:mid/stages/:id | `process_stage` | `process:cycle:write` | tenant + `process:cycle:read` | — | 0 | — | snapshot: id, macro_stage_id, codigo, nome |
| `process.gate_deleted` | Gate removido (soft-delete) | DELETE /admin/stages/:sid/gates/:id | `process_gate` | `process:cycle:write` | tenant + `process:cycle:read` | — | 0 | — | snapshot: id, stage_id, nome, gate_type |
| `process.transition_deleted` | Transição removida (hard-delete) | DELETE /admin/stage-transitions/:id | `stage_transition` | `process:cycle:write` | tenant + `process:cycle:read` | — | 0 | — | snapshot: id, from_stage_id, to_stage_id, nome |
| `process.stage_role_unlinked` | Papel desvinculado do estágio (hard-delete) | DELETE /admin/stages/:sid/roles/:id | `stage_role_link` | `process:cycle:write` | tenant + `process:cycle:read` | — | 0 | — | snapshot: id, stage_id, role_id |
| `process.role_deleted` | Papel de processo removido (soft-delete) | DELETE /admin/process-roles/:id | `process_role` | `process:cycle:delete` | tenant + `process:cycle:read` | — | 0 | — | snapshot: id, codigo, nome |

---

## Ponte UI-API-Domain (DOC-ARC-003 §3)

> Campos obrigatórios `ui_actions` e `operation_ids` completam o trajeto do clique ao banco.

| event_type | ui_actions | operation_ids |
|---|---|---|
| `process.cycle_created` | `create` | `admin_cycles_create` |
| `process.cycle_published` | `publish` | `admin_cycles_publish` |
| `process.cycle_forked` | `fork` | `admin_cycles_fork` |
| `process.cycle_deprecated` | `update` | `admin_cycles_update` |
| `process.macro_stage_created` | `create` | `admin_macro_stages_create` |
| `process.stage_created` | `create` | `admin_stages_create` |
| `process.gate_created` | `create` | `admin_gates_create` |
| `process.stage_role_linked` | `create` | `admin_stage_roles_create` |
| `process.transition_created` | `create` | `admin_transitions_create` |
| `process.cycle_updated` | `update` | `admin_cycles_update` |
| `process.macro_stage_updated` | `update` | `admin_macro_stages_update` |
| `process.stage_updated` | `update` | `admin_stages_update` |
| `process.gate_updated` | `update` | `admin_gates_update` |
| `process.macro_stage_deleted` | `delete` | `admin_macro_stages_delete` |
| `process.stage_deleted` | `delete` | `admin_stages_delete` |
| `process.gate_deleted` | `delete` | `admin_gates_delete` |
| `process.transition_deleted` | `delete` | `admin_transitions_delete` |
| `process.stage_role_unlinked` | `delete` | `admin_stage_roles_delete` |
| `process.role_deleted` | `delete` | `admin_process_roles_delete` |

---

## Outbox / Deduplicação

| Propriedade | Valor | Justificativa |
|---|---|---|
| `outbox.enabled` | false | MOD-005 é blueprint administrativo; sem integrações assíncronas externas que exijam garantia at-least-once |
| `dedupe_key` | null | Sem necessidade de deduplicação — comandos são síncronos e idempotentes por design |
| `ttl` | null | Retenção padrão da tabela `domain_events` (definida no Foundation) |

> **Nota:** Se MOD-006 precisar reagir a `process.cycle_published` ou `process.cycle_deprecated` via event-driven, habilitar outbox para esses 2 eventos específicos.

---

## Campos Mínimos Recomendados (DOC-FND-000 §3)

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid v4 | SIM | PK do evento |
| `tenant_id` | uuid | SIM | Isolamento multi-tenant |
| `entity_type` | text | SIM | Ex: `process_cycle`, `process_stage` |
| `entity_id` | uuid | SIM | ID da entidade afetada |
| `event_type` | text | SIM | Ex: `process.cycle_created` |
| `payload` | jsonb | SIM | Snapshot mínimo da entidade (sem PII) |
| `created_at` | timestamptz | SIM | Timestamp do evento |
| `created_by` | uuid | SIM | Usuário que disparou |
| `correlation_id` | uuid | SIM | Rastreabilidade cross-service (X-Correlation-ID) |
| `causation_id` | uuid | NÃO | Evento que causou este (ex: fork gera multiple creates) |
| `sensitivity_level` | integer | SIM | 0 para todos os eventos MOD-005 |
| `dedupe_key` | text | NÃO | Não utilizado neste módulo |

**Indexes padrão (DOC-FND-000):**

- `(tenant_id, entity_type, entity_id, created_at DESC)` — timeline por entidade
- `(tenant_id, event_type, created_at DESC)` — busca por tipo de evento

---

## Regras de Filtragem (MUST)

1. `tenant_id` obrigatório em todas as consultas a `domain_events`
2. Validação ACL (`process:cycle:read`) antes de retornar eventos
3. `sensitivity_level = 0` em todos os eventos MOD-005 — operações administrativas sem dados sensíveis
4. Fork (`process.cycle_forked`) gera `causation_id` apontando para o evento de publicação original quando aplicável

- **estado_item:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-23
- **rastreia_para:** US-MOD-005, US-MOD-005-F01, US-MOD-005-F02, BR-005, SEC-002, SEC-005, DOC-ARC-003, DOC-FND-000, INT-005
- **referencias_exemplos:** EX-DATA-003
- **evidencias:** N/A
