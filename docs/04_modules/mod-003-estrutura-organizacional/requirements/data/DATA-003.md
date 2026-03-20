> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.2.0  | 2026-03-17 | AGN-DEV-04  | Enriquecimento: outbox/dedupe, payload schemas, operation_ids, resumo de integridade |
> | 0.1.0  | 2026-03-16 | arquitetura | Baseline Inicial (forge-module) |

# DATA-003 — Catálogo de Domain Events da Estrutura Organizacional

> Habilita linha do tempo (Thread), auditoria, Outbox e automação de notificações.

## Princípios (MUST)

- **Não use "permissão no evento" como fonte de verdade.**
  - Emit = permissão do comando
  - View = RBAC (`org:unit:read`) — sem filtro por tenant (ADR-003: org_units é cross-tenant)
- `sensitivity_level` é **guard-rail** (mascarar/bloquear cedo), não a regra principal.
- **Fonte Única da Verdade:** Tabela `domain_events` é a única fonte para auditoria/timeline.

## Contexto MOD-003

O MOD-003 é **full-stack** com endpoints próprios. Cada operação de escrita emite domain events na tabela `domain_events` (MOD-000) com `entity_type=org_unit`. Todos os eventos possuem `sensitivity_level=0` (dados organizacionais não-sensíveis).

---

## Catálogo de Domain Events

| event_type | description | origin_command | emit_permission | view_rule | notify | sensitivity_level |
|---|---|---|---|---|---|---|
| `org.unit_created` | Unidade organizacional criada (N1–N4) | POST /org-units (`org:unit:write`) | `org:unit:write` | RBAC `org:unit:read` | creator + admin | 0 |
| `org.unit_updated` | Unidade organizacional atualizada (nome/descrição/status) | PATCH /org-units/:id (`org:unit:write`) | `org:unit:write` | RBAC `org:unit:read` | — | 0 |
| `org.unit_deleted` | Unidade organizacional desativada (soft delete) | DELETE /org-units/:id (`org:unit:delete`) | `org:unit:delete` | RBAC `org:unit:read` | admin | 0 |
| `org.unit_restored` | Unidade organizacional restaurada (undo soft delete) | PATCH /org-units/:id/restore (`org:unit:write`) | `org:unit:write` | RBAC `org:unit:read` | admin | 0 |
| `org.tenant_linked` | Tenant (N5) vinculado a subunidade N4 | POST /org-units/:id/tenants (`org:unit:write`) | `org:unit:write` | RBAC `org:unit:read` | admin | 0 |
| `org.tenant_unlinked` | Tenant (N5) desvinculado de subunidade N4 | DELETE /org-units/:id/tenants/:tid (`org:unit:delete`) | `org:unit:delete` | RBAC `org:unit:read` | admin | 0 |

---

## Formato Detalhado por Evento

### `org.unit_created`

- **Descrição:** Unidade organizacional criada com sucesso (N1–N4)
- **Origem (comando):** `org:create` — FR-001, POST /api/v1/org-units
- **UI Actions (DOC-ARC-003):** `["create"]`
- **Operation IDs (DOC-ARC-003):** `["org_units_create"]`
- **Entity originária:** `org_unit` / `org_units.id`
- **Emit (perm do comando):** `org:unit:write`
- **View (regra):** RBAC `org:unit:read` (cross-tenant — ADR-003)
- **Notify:** Sim → creator + admin do módulo
- **Integração/Outbox:** Não
- **Sensibilidade:** `sensitivity_level=0`
- **Maskable fields:** nenhum (dados organizacionais não-sensíveis)
- **Payload policy:** snapshot mínimo (id, codigo, nome, nivel, parent_id, status)

### `org.unit_updated`

- **Descrição:** Unidade organizacional atualizada (nome/descrição/status)
- **Origem (comando):** `org:update` — FR-001, PATCH /api/v1/org-units/:id
- **UI Actions (DOC-ARC-003):** `["update"]`
- **Operation IDs (DOC-ARC-003):** `["org_units_update"]`
- **Entity originária:** `org_unit` / `org_units.id`
- **Emit (perm do comando):** `org:unit:write`
- **View (regra):** RBAC `org:unit:read` (cross-tenant — ADR-003)
- **Notify:** Não
- **Integração/Outbox:** Não
- **Sensibilidade:** `sensitivity_level=0`
- **Maskable fields:** nenhum
- **Payload policy:** campos alterados (diff) + id/codigo

### `org.unit_deleted`

- **Descrição:** Unidade organizacional desativada (soft delete)
- **Origem (comando):** `org:delete` — FR-001, DELETE /api/v1/org-units/:id
- **UI Actions (DOC-ARC-003):** `["delete"]`
- **Operation IDs (DOC-ARC-003):** `["org_units_delete"]`
- **Entity originária:** `org_unit` / `org_units.id`
- **Emit (perm do comando):** `org:unit:delete`
- **View (regra):** RBAC `org:unit:read` (cross-tenant — ADR-003)
- **Notify:** Sim → admin
- **Integração/Outbox:** Não
- **Sensibilidade:** `sensitivity_level=0`
- **Maskable fields:** nenhum
- **Payload policy:** metadados (id, codigo, motivo, quem, quando)

### `org.unit_restored`

- **Descrição:** Unidade organizacional restaurada após soft delete
- **Origem (comando):** `org:restore` — FR-004, PATCH /api/v1/org-units/:id/restore
- **UI Actions (DOC-ARC-003):** `["restore"]`
- **Operation IDs (DOC-ARC-003):** `["org_units_restore"]`
- **Entity originária:** `org_unit` / `org_units.id`
- **Emit (perm do comando):** `org:unit:write`
- **View (regra):** RBAC `org:unit:read` (cross-tenant — ADR-003)
- **Notify:** Sim → admin
- **Integração/Outbox:** Não
- **Sensibilidade:** `sensitivity_level=0`
- **Maskable fields:** nenhum
- **Payload policy:** metadados (id, codigo, restored_by, restored_at)

### `org.tenant_linked`

- **Descrição:** Tenant (N5/estabelecimento) vinculado a subunidade N4
- **Origem (comando):** `org:link_tenant` — FR-003, POST /api/v1/org-units/:id/tenants
- **UI Actions (DOC-ARC-003):** `["create"]`
- **Operation IDs (DOC-ARC-003):** `["org_units_link_tenant"]`
- **Entity originária:** `org_unit` / `org_units.id`
- **Emit (perm do comando):** `org:unit:write`
- **View (regra):** RBAC `org:unit:read` (cross-tenant — ADR-003)
- **Notify:** Sim → admin
- **Integração/Outbox:** Não
- **Sensibilidade:** `sensitivity_level=0`
- **Maskable fields:** nenhum
- **Payload policy:** org_unit_id, tenant_id, tenant_codigo

### `org.tenant_unlinked`

- **Descrição:** Tenant (N5/estabelecimento) desvinculado de subunidade N4
- **Origem (comando):** `org:unlink_tenant` — FR-003, DELETE /api/v1/org-units/:id/tenants/:tid
- **UI Actions (DOC-ARC-003):** `["delete"]`
- **Operation IDs (DOC-ARC-003):** `["org_units_unlink_tenant"]`
- **Entity originária:** `org_unit` / `org_units.id`
- **Emit (perm do comando):** `org:unit:delete`
- **View (regra):** RBAC `org:unit:read` (cross-tenant — ADR-003)
- **Notify:** Sim → admin
- **Integração/Outbox:** Não
- **Sensibilidade:** `sensitivity_level=0`
- **Maskable fields:** nenhum
- **Payload policy:** org_unit_id, tenant_id

---

## Outbox / Integração

- **Outbox habilitado:** Nao para todos os 6 eventos do MOD-003
- **Justificativa:** Todos os eventos sao gravados na tabela `domain_events` (MOD-000) dentro da mesma transacao DB que a operacao principal. Nao ha necessidade de outbox pattern pois nao ha integracao assincrona externa (sem filas, sem webhooks). A consistencia e garantida pela transacao atomica
- **Dedupe key:** N/A (sem outbox)
- **TTL:** N/A (retencao seguindo politica global de `domain_events`)

## Resumo de Payload por Evento

| event_type | Campos obrigatorios no payload | Campos opcionais |
|---|---|---|
| `org.unit_created` | `id`, `codigo`, `nome`, `nivel`, `parent_id`, `status`, `created_by` | `descricao` |
| `org.unit_updated` | `id`, `codigo`, campos alterados (diff) | — |
| `org.unit_deleted` | `id`, `codigo`, `deleted_by`, `deleted_at` | `motivo` |
| `org.unit_restored` | `id`, `codigo`, `restored_by`, `restored_at` | — |
| `org.tenant_linked` | `org_unit_id`, `tenant_id`, `tenant_codigo`, `created_by` | — |
| `org.tenant_unlinked` | `org_unit_id`, `tenant_id`, `deleted_by` | — |

> **Regra:** Todos os payloads DEVEM incluir `correlation_id` (propagado do header `X-Correlation-ID`) e `actor_id` (user autenticado). Estes campos sao injetados pelo middleware de domain events do MOD-000, nao pelo modulo.

## Mapeamento Operation IDs (DOC-ARC-003)

| event_type | operation_id | UI action |
|---|---|---|
| `org.unit_created` | `org_units_create` | `create` |
| `org.unit_updated` | `org_units_update` | `update` |
| `org.unit_deleted` | `org_units_delete` | `delete` |
| `org.unit_restored` | `org_units_restore` | `restore` |
| `org.tenant_linked` | `org_units_link_tenant` | `create` |
| `org.tenant_unlinked` | `org_units_unlink_tenant` | `delete` |

---

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-17
- **rastreia_para:** US-MOD-003, US-MOD-003-F01, US-MOD-003-F04, FR-001, FR-003, FR-004, BR-001, BR-012, ADR-003, DOC-ARC-003, DOC-FND-000, SEC-001, SEC-002, INT-004
- **referencias_exemplos:** EX-CI-007, EX-CI-006
- **evidencias:** N/A
