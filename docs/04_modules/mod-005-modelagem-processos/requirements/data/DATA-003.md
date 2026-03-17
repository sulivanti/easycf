> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-16 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-17 | AGN-DEV-04  | Enriquecimento DATA-003 (enrich-agent) |

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

### Estrutura do Blueprint

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields | payload_policy |
|---|---|---|---|---|---|---|---|---|---|
| `process.macro_stage_created` | Macroetapa adicionada ao ciclo | POST /admin/cycles/:cid/macro-stages | `process_macro_stage` | `process:cycle:write` | tenant + `process:cycle:read` | — | 0 | — | snapshot: id, cycle_id, codigo, nome, ordem |
| `process.stage_created` | Estágio adicionado à macroetapa | POST /admin/macro-stages/:mid/stages | `process_stage` | `process:cycle:write` | tenant + `process:cycle:read` | — | 0 | — | snapshot: id, macro_stage_id, codigo, nome, is_initial, is_terminal |
| `process.gate_created` | Gate adicionado ao estágio | POST /admin/stages/:sid/gates | `process_gate` | `process:cycle:write` | tenant + `process:cycle:read` | — | 0 | — | snapshot: id, stage_id, nome, gate_type, required, ordem |
| `process.stage_role_linked` | Papel vinculado ao estágio | POST /admin/stages/:sid/roles | `stage_role_link` | `process:cycle:write` | tenant + `process:cycle:read` | — | 0 | — | snapshot: id, stage_id, role_id, required |
| `process.transition_created` | Transição entre estágios criada | POST /admin/stage-transitions | `stage_transition` | `process:cycle:write` | tenant + `process:cycle:read` | — | 0 | — | snapshot: id, from_stage_id, to_stage_id, nome, gate_required, evidence_required |

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

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-17
- **rastreia_para:** US-MOD-005, US-MOD-005-F01, US-MOD-005-F02, BR-005, SEC-EventMatrix, DOC-ARC-003, DOC-FND-000
- **referencias_exemplos:** N/A
- **evidencias:** N/A
