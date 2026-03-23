> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-19 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-19 | AGN-DEV-04  | Enriquecimento DATA-003 domain events (enrich-agent) |

# DATA-003 — Catálogo de Domain Events de MCP e Automação Governada

- **estado_item:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-23
- **rastreia_para:** US-MOD-010, US-MOD-010-F01, US-MOD-010-F02, US-MOD-010-F03, FR-010, BR-010, DOC-ARC-003, DOC-FND-000, SEC-002
- **referencias_exemplos:** EX-SEC-001
- **evidencias:** N/A

> Habilita linha do tempo (Thread), auditoria, Outbox e automação de notificações.

---

## Princípios (MUST)

- **Não use "permissão no evento" como fonte de verdade.**
  - Emit = permissão do comando que origina o evento
  - View = ACL + tenant da entity originária
- `sensitivity_level` é **guard-rail** (mascarar/bloquear cedo), não a regra principal.
- **Fonte Única da Verdade:** Tabela `domain_events` é a única fonte para auditoria/timeline (DOC-ARC-003 §1 Dogma 6).
- **Ponte UI-API-Domain:** Eventos MCP fluem do Domain Service → Outbox → Event Bus → Timeline/Notification. A UI consome via polling ou WebSocket do timeline endpoint (MOD-000).

---

## Catálogo de Domain Events

### EVT-001 — `mcp.agent.created`

- **Descrição:** Agente MCP criado com identidade técnica governada
- **origin_command:** `POST /api/v1/admin/mcp-agents`
- **origin_entity:** `{ entity_type: "mcp.agent", entity_id_source: "response.id" }`
- **emit_permission:** `mcp:agent:write`
- **view_rule:** `canRead(mcp_agent) && tenantMatch(tenant_id)`
- **notify:**
  - enabled: true
  - recipients_rule: `admin(mcp:agent:read)`
  - channels: in-app
- **outbox:**
  - enabled: true
  - dedupe_key: `mcp.agent.created:{agent_id}`
  - ttl: 7d
- **sensitivity_level:** 1
- **maskable_fields:** `["owner_user_id"]`
- **payload_policy:** Snapshot mínimo: `{ agent_id, codigo, nome, owner_user_id, status, allowed_scopes_count, tenant_id }`. Sem PII. Sem api_key ou hash.
- **rastreia_para:** FR-001, BR-001

---

### EVT-002 — `mcp.agent.updated`

- **Descrição:** Dados do agente MCP atualizados (nome, status ACTIVE↔INACTIVE)
- **origin_command:** `PATCH /api/v1/admin/mcp-agents/:id`
- **origin_entity:** `{ entity_type: "mcp.agent", entity_id_source: "params.id" }`
- **emit_permission:** `mcp:agent:write`
- **view_rule:** `canRead(mcp_agent) && tenantMatch(tenant_id)`
- **notify:**
  - enabled: true
  - recipients_rule: `admin(mcp:agent:read) + owner(agent.owner_user_id)`
  - channels: in-app
- **outbox:**
  - enabled: true
  - dedupe_key: `mcp.agent.updated:{agent_id}:{updated_at_epoch}`
  - ttl: 7d
- **sensitivity_level:** 1
- **maskable_fields:** `[]`
- **payload_policy:** Snapshot de diff: `{ agent_id, changed_fields: [...], previous_status?, new_status?, tenant_id }`. Sem PII.
- **rastreia_para:** FR-001

---

### EVT-003 — `mcp.agent.scopes_updated`

- **Descrição:** Escopos permitidos do agente MCP foram alterados
- **origin_command:** `PATCH /api/v1/admin/mcp-agents/:id` (quando `allowed_scopes` muda)
- **origin_entity:** `{ entity_type: "mcp.agent", entity_id_source: "params.id" }`
- **emit_permission:** `mcp:agent:write`
- **view_rule:** `canRead(mcp_agent) && tenantMatch(tenant_id)`
- **notify:**
  - enabled: true
  - recipients_rule: `admin(mcp:agent:read) + owner(agent.owner_user_id) + security_admin(system:audit:read)`
  - channels: in-app
- **outbox:**
  - enabled: true
  - dedupe_key: `mcp.agent.scopes_updated:{agent_id}:{updated_at_epoch}`
  - ttl: 7d
- **sensitivity_level:** 1
- **maskable_fields:** `[]`
- **payload_policy:** `{ agent_id, scopes_added: [...], scopes_removed: [...], new_scopes_count, tenant_id }`. Lista de escopos sem PII.
- **rastreia_para:** FR-001, BR-002, BR-003

---

### EVT-004 — `mcp.agent.revoked`

- **Descrição:** Agente MCP revogado de forma imediata e irreversível
- **origin_command:** `POST /api/v1/admin/mcp-agents/:id/revoke`
- **origin_entity:** `{ entity_type: "mcp.agent", entity_id_source: "params.id" }`
- **emit_permission:** `mcp:agent:revoke`
- **view_rule:** `canRead(mcp_agent) && tenantMatch(tenant_id)`
- **notify:**
  - enabled: true
  - recipients_rule: `admin(mcp:agent:read) + owner(agent.owner_user_id) + security_admin(system:audit:read)`
  - channels: in-app, e-mail (owner)
- **outbox:**
  - enabled: true
  - dedupe_key: `mcp.agent.revoked:{agent_id}`
  - ttl: 30d
- **sensitivity_level:** 1
- **maskable_fields:** `[]`
- **payload_policy:** `{ agent_id, codigo, revoked_by, revocation_reason, revoked_at, tenant_id }`. Sem PII.
- **rastreia_para:** FR-002, BR-006, BR-015

---

### EVT-005 — `mcp.agent.key_rotated`

- **Descrição:** API key do agente MCP foi rotacionada — key anterior invalidada
- **origin_command:** `POST /api/v1/admin/mcp-agents/:id/rotate-key`
- **origin_entity:** `{ entity_type: "mcp.agent", entity_id_source: "params.id" }`
- **emit_permission:** `mcp:agent:write`
- **view_rule:** `canRead(mcp_agent) && tenantMatch(tenant_id)`
- **notify:**
  - enabled: true
  - recipients_rule: `admin(mcp:agent:read) + owner(agent.owner_user_id)`
  - channels: in-app, e-mail (owner)
- **outbox:**
  - enabled: true
  - dedupe_key: `mcp.agent.key_rotated:{agent_id}:{rotated_at_epoch}`
  - ttl: 7d
- **sensitivity_level:** 1
- **maskable_fields:** `[]`
- **payload_policy:** `{ agent_id, codigo, rotated_by, rotated_at, tenant_id }`. NUNCA incluir a key nova ou antiga.
- **rastreia_para:** FR-003, BR-004

---

### EVT-006 — `mcp.agent.action_granted`

- **Descrição:** Ação concedida a um agente MCP via vínculo
- **origin_command:** `POST /api/v1/admin/mcp-agents/:id/actions`
- **origin_entity:** `{ entity_type: "mcp.agent_action_link", entity_id_source: "response.id" }`
- **emit_permission:** `mcp:agent:write`
- **view_rule:** `canRead(mcp_agent) && tenantMatch(tenant_id)`
- **notify:**
  - enabled: true
  - recipients_rule: `admin(mcp:agent:read)`
  - channels: in-app
- **outbox:**
  - enabled: true
  - dedupe_key: `mcp.agent.action_granted:{agent_id}:{action_id}`
  - ttl: 7d
- **sensitivity_level:** 1
- **maskable_fields:** `[]`
- **payload_policy:** `{ agent_id, action_id, action_codigo, granted_by, valid_until, tenant_id }`.
- **rastreia_para:** FR-006, BR-011

---

### EVT-007 — `mcp.agent.action_revoked`

- **Descrição:** Ação revogada de um agente MCP (vínculo removido)
- **origin_command:** `DELETE /api/v1/admin/mcp-agents/:id/actions/:actionId`
- **origin_entity:** `{ entity_type: "mcp.agent_action_link", entity_id_source: "params.agent_id + params.actionId" }`
- **emit_permission:** `mcp:agent:write`
- **view_rule:** `canRead(mcp_agent) && tenantMatch(tenant_id)`
- **notify:**
  - enabled: true
  - recipients_rule: `admin(mcp:agent:read)`
  - channels: in-app
- **outbox:**
  - enabled: true
  - dedupe_key: `mcp.agent.action_revoked:{agent_id}:{action_id}`
  - ttl: 7d
- **sensitivity_level:** 1
- **maskable_fields:** `[]`
- **payload_policy:** `{ agent_id, action_id, action_codigo, revoked_by, tenant_id }`.
- **rastreia_para:** FR-006

---

### EVT-008 — `mcp.execution.completed`

- **Descrição:** Execução MCP completada (abrange DIRECT_SUCCESS, DIRECT_FAILED, CONTROLLED_PENDING, EVENT_EMITTED)
- **origin_command:** `POST /api/v1/mcp/execute`
- **origin_entity:** `{ entity_type: "mcp.execution", entity_id_source: "execution.id" }`
- **emit_permission:** (API key authn — sem scope OAuth; permissão implícita pela autenticação do agente)
- **view_rule:** `canRead(mcp_execution) && tenantMatch(tenant_id) && hasScope('mcp:log:read')`
- **notify:**
  - enabled: true (apenas para CONTROLLED_PENDING e DIRECT_FAILED)
  - recipients_rule: `admin(mcp:log:read)` (DIRECT_FAILED); `admin(mcp:log:read) + aprovadores_movimento` (CONTROLLED_PENDING)
  - channels: in-app
- **outbox:**
  - enabled: true
  - dedupe_key: `mcp.execution.completed:{execution_id}`
  - ttl: 30d
- **sensitivity_level:** 1
- **maskable_fields:** `["request_payload", "result_payload"]`
- **payload_policy:** `{ execution_id, agent_id, agent_codigo, action_id, action_codigo, policy_applied, status, correlation_id, duration_ms, linked_movement_id?, tenant_id }`. Payloads de request/result NÃO incluídos no evento (volume). Consultar via GET /admin/mcp-executions/:id.
- **rastreia_para:** FR-007, BR-008, BR-009, BR-010

---

### EVT-009 — `mcp.execution.blocked`

- **Descrição:** Execução MCP bloqueada — falha em algum passo de validação do gateway (exceto privilege escalation, que tem evento dedicado)
- **origin_command:** `POST /api/v1/mcp/execute`
- **origin_entity:** `{ entity_type: "mcp.execution", entity_id_source: "execution.id" }`
- **emit_permission:** (API key authn)
- **view_rule:** `canRead(mcp_execution) && tenantMatch(tenant_id) && hasScope('mcp:log:read')`
- **notify:**
  - enabled: true
  - recipients_rule: `admin(mcp:log:read) + owner(agent.owner_user_id)`
  - channels: in-app
- **outbox:**
  - enabled: true
  - dedupe_key: `mcp.execution.blocked:{execution_id}`
  - ttl: 30d
- **sensitivity_level:** 1
- **maskable_fields:** `["request_payload"]`
- **payload_policy:** `{ execution_id, agent_id, agent_codigo, action_code_attempted, blocked_reason, blocked_at_step, correlation_id, tenant_id }`.
- **rastreia_para:** FR-007, BR-010

---

### EVT-010 — `mcp.privilege_escalation_attempt`

- **Descrição:** Tentativa de escalada de privilégio detectada — agente tentou usar escopo bloqueado ou contornar blocklist Phase 1
- **origin_command:** `POST /api/v1/mcp/execute`
- **origin_entity:** `{ entity_type: "mcp.execution", entity_id_source: "execution.id" }`
- **emit_permission:** (API key authn)
- **view_rule:** `canRead(mcp_execution) && tenantMatch(tenant_id) && hasScope('mcp:log:read')`
- **notify:**
  - enabled: true
  - recipients_rule: `admin(mcp:log:read) + owner(agent.owner_user_id) + security_admin(system:audit:sensitive)`
  - channels: in-app, e-mail (security_admin)
- **outbox:**
  - enabled: true
  - dedupe_key: `mcp.privilege_escalation_attempt:{execution_id}`
  - ttl: 90d
- **sensitivity_level:** 2
- **maskable_fields:** `["request_payload"]`
- **payload_policy:** `{ execution_id, agent_id, agent_codigo, action_code_attempted, attempted_scopes, blocked_scopes_matched, owner_user_id, correlation_id, origin_ip, tenant_id }`. Incluir detalhes completos para investigação de segurança.
- **rastreia_para:** FR-008, BR-001, BR-002, BR-012

---

## Resumo do Catálogo

| # | event_type | sensitivity | notify | outbox |
|---|---|---|---|---|
| EVT-001 | `mcp.agent.created` | 1 | admin | sim |
| EVT-002 | `mcp.agent.updated` | 1 | admin, owner | sim |
| EVT-003 | `mcp.agent.scopes_updated` | 1 | admin, owner, security | sim |
| EVT-004 | `mcp.agent.revoked` | 1 | admin, owner, security | sim |
| EVT-005 | `mcp.agent.key_rotated` | 1 | admin, owner | sim |
| EVT-006 | `mcp.agent.action_granted` | 1 | admin | sim |
| EVT-007 | `mcp.agent.action_revoked` | 1 | admin | sim |
| EVT-008 | `mcp.execution.completed` | 1 | admin (on failure/controlled) | sim |
| EVT-009 | `mcp.execution.blocked` | 1 | admin, owner | sim |
| EVT-010 | `mcp.privilege_escalation_attempt` | 2 | admin, owner, security | sim |

---

## Referência SEC-002

A matriz de autorização Emit/View/Notify completa está em [SEC-002](../sec/SEC-002.md). Eventos com `sensitivity_level=2` (EVT-010) requerem mascaramento adicional e alertas de segurança conforme SEC-002.
