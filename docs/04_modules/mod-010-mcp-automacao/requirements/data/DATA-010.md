> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-19 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-19 | AGN-DEV-04  | Enriquecimento DATA (enrich-agent) |
>
| 0.3.0  | 2026-03-19 | arquitetura | mcp_executions.status: adiciona CONTROLLED_APPROVED e CONTROLLED_REJECTED (PEN-010/PENDENTE-005) |
| 0.4.0  | 2026-03-19 | arquitetura | mcp_action_types seed: PREPARAR can_be_direct=false (PEN-010/PENDENTE-002) |

# DATA-010 — Modelo de Dados de MCP e Automação Governada

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-010, US-MOD-010-F01, US-MOD-010-F02, US-MOD-010-F03, FR-010, BR-010, DOC-DEV-001, DOC-ARC-003, DOC-FND-000
- **referencias_exemplos:** EX-AUTH-001, EX-SEC-001
- **evidencias:** N/A

---

## Princípios do Modelo

- **Multi-tenant obrigatório:** Todas as tabelas possuem `tenant_id` NOT NULL com FK para `tenants.id` e filtro mandatório em queries (DOC-FND-000 §2).
- **Campos padrão:** `created_at`, `updated_at` em todas as tabelas; `created_by` (FK→users.id) onde aplicável.
- **FK ON DELETE RESTRICT:** Todas as foreign keys usam `ON DELETE RESTRICT` para proteger integridade referencial — deleções DEVEM ser controladas por regras de negócio, nunca por cascade.
- **Soft-delete não aplicável:** Agentes MCP usam ciclo de vida via `status` (ACTIVE→INACTIVE→REVOKED). Ações usam `status` (ACTIVE/INACTIVE). Não há soft-delete com `deleted_at`.
- **Append-only em logs:** `mcp_executions` é append-only (NFR-006); registros nunca são editados após `completed_at` preenchido.

---

## Tabela 1 — `mcp_agents` (Agentes MCP)

| Campo | Tipo Negócio | Tipo DB | Nulidade | Constraint | Descrição |
|---|---|---|---|---|---|
| `id` | UUID | uuid | NOT NULL | PK | Identificador único do agente |
| `codigo` | String | varchar(50) | NOT NULL | UNIQUE per tenant | Imutável após criação (BR-005). ex: AGENT-COMERCIAL-01 |
| `nome` | String | varchar(200) | NOT NULL | | Nome descritivo do agente |
| `owner_user_id` | UUID | uuid | NOT NULL | FK→users.id ON DELETE RESTRICT | Usuário humano responsável pelo agente |
| `api_key_hash` | String | varchar(60) | NOT NULL | | Hash bcrypt (rounds>=12) da API key — NUNCA retornado em GET (BR-004) |
| `allowed_scopes` | JSON | jsonb | NOT NULL | CHECK (blocklist Phase 1) | Lista de escopos permitidos ao agente — validados contra blocklist (BR-002) |
| `status` | Enum | varchar(20) | NOT NULL | CHECK (status IN ('ACTIVE','INACTIVE','REVOKED')) | Ciclo de vida: ACTIVE→INACTIVE→REVOKED (irreversível, BR-006) |
| `phase2_create_enabled` | Boolean | boolean | NOT NULL | DEFAULT false | Habilita liberação Phase 2 para escopos *:create (BR-003) |
| `last_used_at` | Timestamp | timestamptz | NULL | | Atualizado a cada execução no gateway |
| `created_by` | UUID | uuid | NOT NULL | FK→users.id ON DELETE RESTRICT | Admin que criou o agente |
| `created_at` | Timestamp | timestamptz | NOT NULL | DEFAULT now() | |
| `updated_at` | Timestamp | timestamptz | NOT NULL | DEFAULT now() | |
| `revoked_at` | Timestamp | timestamptz | NULL | | Preenchido apenas quando status=REVOKED |
| `revocation_reason` | Text | text | NULL | | Motivo da revogação — obrigatório quando status=REVOKED (BR-015) |
| `tenant_id` | UUID | uuid | NOT NULL | FK→tenants.id ON DELETE RESTRICT | Isolamento multi-tenant |

**Constraints:**

- `UQ_mcp_agents_codigo_tenant` — UNIQUE(`codigo`, `tenant_id`)
- `CHK_mcp_agents_status` — CHECK(`status` IN ('ACTIVE', 'INACTIVE', 'REVOKED'))
- `CHK_mcp_agents_revoked_reason` — CHECK(`status` != 'REVOKED' OR `revocation_reason` IS NOT NULL)
- `CHK_mcp_agents_revoked_at` — CHECK(`status` != 'REVOKED' OR `revoked_at` IS NOT NULL)

**Índices:**

- `IDX_mcp_agents_tenant_status` — (`tenant_id`, `status`) — hot query: listar agentes por tenant filtrados por status
- `IDX_mcp_agents_owner` — (`owner_user_id`) — hot query: listar agentes de um owner
- `IDX_mcp_agents_codigo_tenant` — UNIQUE(`codigo`, `tenant_id`) — lookup por código

---

## Tabela 2 — `mcp_action_types` (Tipos de Ação MCP)

| Campo | Tipo Negócio | Tipo DB | Nulidade | Constraint | Descrição |
|---|---|---|---|---|---|
| `id` | UUID | uuid | NOT NULL | PK | |
| `codigo` | String | varchar(30) | NOT NULL | UNIQUE | CONSULTAR, PREPARAR, SUBMETER, EXECUTAR, MONITORAR |
| `nome` | String | varchar(100) | NOT NULL | | Nome descritivo do tipo |
| `can_be_direct` | Boolean | boolean | NOT NULL | | Se policy=DIRECT é permitida para este tipo (BR-007) |
| `can_approve` | Boolean | boolean | NOT NULL | DEFAULT false, CHECK (can_approve = false) | SEMPRE false — invariante estrutural (BR-014) |
| `created_at` | Timestamp | timestamptz | NOT NULL | DEFAULT now() | |
| `updated_at` | Timestamp | timestamptz | NOT NULL | DEFAULT now() | |

**Constraints:**

- `UQ_mcp_action_types_codigo` — UNIQUE(`codigo`)
- `CHK_mcp_action_types_no_approve` — CHECK(`can_approve` = false)

**Seed Data (migration):**

| codigo | nome | can_be_direct | can_approve |
|---|---|---|---|
| CONSULTAR | Consulta de dados | true | false |
| PREPARAR | Preparação de dados | false | false |
| SUBMETER | Submissão para processamento | false | false |
| EXECUTAR | Execução de operação | false | false |
| MONITORAR | Monitoramento de status | true | false |

**Índices:**

- `IDX_mcp_action_types_codigo` — UNIQUE(`codigo`) — lookup por código

---

## Tabela 3 — `mcp_actions` (Catálogo de Ações MCP)

| Campo | Tipo Negócio | Tipo DB | Nulidade | Constraint | Descrição |
|---|---|---|---|---|---|
| `id` | UUID | uuid | NOT NULL | PK | |
| `codigo` | String | varchar(50) | NOT NULL | UNIQUE per tenant | Imutável após criação (BR-013) |
| `nome` | String | varchar(200) | NOT NULL | | Nome descritivo da ação |
| `action_type_id` | UUID | uuid | NOT NULL | FK→mcp_action_types.id ON DELETE RESTRICT | Tipo da ação (CONSULTAR, PREPARAR, etc.) |
| `execution_policy` | Enum | varchar(20) | NOT NULL | CHECK (execution_policy IN ('DIRECT','CONTROLLED','EVENT_ONLY')) | Política de execução (BR-007, BR-008, BR-009) |
| `target_object_type` | String | varchar(100) | NOT NULL | | Objeto-alvo da ação (ex: 'pedido', 'estoque') |
| `required_scopes` | JSON | jsonb | NOT NULL | | Escopos que o agente precisa ter para executar — validados contra blocklist (BR-002) |
| `linked_routine_id` | UUID | uuid | NULL | FK→behavior_routines.id ON DELETE SET NULL | Rotina MOD-007 a avaliar antes da execução |
| `linked_integration_id` | UUID | uuid | NULL | FK→integration_configs.id ON DELETE SET NULL | Config de integração MOD-008 a executar |
| `description` | Text | text | NULL | | Descrição detalhada da ação |
| `status` | Enum | varchar(20) | NOT NULL | CHECK (status IN ('ACTIVE','INACTIVE')) DEFAULT 'ACTIVE' | Estado da ação |
| `created_by` | UUID | uuid | NOT NULL | FK→users.id ON DELETE RESTRICT | Admin que criou a ação |
| `created_at` | Timestamp | timestamptz | NOT NULL | DEFAULT now() | |
| `updated_at` | Timestamp | timestamptz | NOT NULL | DEFAULT now() | |
| `tenant_id` | UUID | uuid | NOT NULL | FK→tenants.id ON DELETE RESTRICT | |

**Constraints:**

- `UQ_mcp_actions_codigo_tenant` — UNIQUE(`codigo`, `tenant_id`)
- `CHK_mcp_actions_policy` — CHECK(`execution_policy` IN ('DIRECT', 'CONTROLLED', 'EVENT_ONLY'))
- `CHK_mcp_actions_status` — CHECK(`status` IN ('ACTIVE', 'INACTIVE'))

**Índices:**

- `IDX_mcp_actions_tenant_status` — (`tenant_id`, `status`) — hot query: listar ações ativas por tenant
- `IDX_mcp_actions_tenant_policy` — (`tenant_id`, `execution_policy`) — hot query: filtrar por política
- `IDX_mcp_actions_action_type` — (`action_type_id`) — join com mcp_action_types
- `IDX_mcp_actions_codigo_tenant` — UNIQUE(`codigo`, `tenant_id`) — lookup por código no gateway (passo 3)

---

## Tabela 4 — `mcp_executions` (Log de Execuções)

| Campo | Tipo Negócio | Tipo DB | Nulidade | Constraint | Descrição |
|---|---|---|---|---|---|
| `id` | UUID | uuid | NOT NULL | PK | |
| `agent_id` | UUID | uuid | NOT NULL | FK→mcp_agents.id ON DELETE RESTRICT | Agente que solicitou a execução |
| `action_id` | UUID | uuid | NOT NULL | FK→mcp_actions.id ON DELETE RESTRICT | Ação solicitada |
| `policy_applied` | String | varchar(20) | NOT NULL | CHECK (policy_applied IN ('DIRECT','CONTROLLED','EVENT_ONLY')) | Política efetivamente aplicada |
| `origin_ip` | String | varchar(45) | NULL | | IPv4 ou IPv6 do solicitante |
| `request_payload` | JSON | jsonb | NOT NULL | | Payload da requisição (sanitizado para PII) |
| `correlation_id` | String | varchar(64) | NOT NULL | | X-Correlation-ID para rastreamento cross-service |
| `status` | Enum | varchar(30) | NOT NULL | CHECK (status IN ('RECEIVED','DISPATCHED','DIRECT_SUCCESS','DIRECT_FAILED','CONTROLLED_PENDING','CONTROLLED_APPROVED','CONTROLLED_REJECTED','EVENT_EMITTED','BLOCKED')) | Status da execução |
| `blocked_reason` | Text | text | NULL | | Motivo do bloqueio (se status=BLOCKED) |
| `linked_movement_id` | UUID | uuid | NULL | FK→controlled_movements.id ON DELETE RESTRICT | Movement MOD-009 se CONTROLLED |
| `linked_integration_log_id` | UUID | uuid | NULL | FK→integration_call_logs.id ON DELETE SET NULL | Log de integração MOD-008 |
| `result_payload` | JSON | jsonb | NULL | | Resultado da execução (sanitizado) |
| `error_message` | Text | text | NULL | | Mensagem de erro (se falha) |
| `duration_ms` | Integer | integer | NULL | | Duração da execução em milissegundos |
| `received_at` | Timestamp | timestamptz | NOT NULL | DEFAULT now() | Momento de recebimento |
| `completed_at` | Timestamp | timestamptz | NULL | | Momento de conclusão |
| `tenant_id` | UUID | uuid | NOT NULL | FK→tenants.id ON DELETE RESTRICT | |

**Constraints:**

- `CHK_mcp_executions_status` — CHECK(`status` IN ('RECEIVED','DISPATCHED','DIRECT_SUCCESS','DIRECT_FAILED','CONTROLLED_PENDING','CONTROLLED_APPROVED','CONTROLLED_REJECTED','EVENT_EMITTED','BLOCKED'))
- `CHK_mcp_executions_blocked_reason` — CHECK(`status` != 'BLOCKED' OR `blocked_reason` IS NOT NULL)

**Índices:**

- `IDX_mcp_executions_tenant_received` — (`tenant_id`, `received_at` DESC) — hot query: listar execuções recentes por tenant
- `IDX_mcp_executions_agent` — (`agent_id`, `received_at` DESC) — hot query: histórico por agente
- `IDX_mcp_executions_action` — (`action_id`) — filtro por ação
- `IDX_mcp_executions_status` — (`tenant_id`, `status`) — hot query: filtro por status (BLOCKED, CONTROLLED_PENDING)
- `IDX_mcp_executions_correlation` — (`correlation_id`) — lookup por correlation_id para rastreamento
- `IDX_mcp_executions_movement` — (`linked_movement_id`) WHERE `linked_movement_id` IS NOT NULL — join com MOD-009

**Particionamento (recomendação):**

- Considerar particionamento por `received_at` (range mensal) quando volume exceder 10M registros por tenant — retenção de 5 anos (NFR-006).

---

## Tabela 5 — `mcp_agent_action_links` (Agente ↔ Ação)

| Campo | Tipo Negócio | Tipo DB | Nulidade | Constraint | Descrição |
|---|---|---|---|---|---|
| `id` | UUID | uuid | NOT NULL | PK | |
| `agent_id` | UUID | uuid | NOT NULL | FK→mcp_agents.id ON DELETE RESTRICT | Agente vinculado |
| `action_id` | UUID | uuid | NOT NULL | FK→mcp_actions.id ON DELETE RESTRICT | Ação vinculada |
| `granted_by` | UUID | uuid | NOT NULL | FK→users.id ON DELETE RESTRICT | Admin que concedeu o vínculo |
| `granted_at` | Timestamp | timestamptz | NOT NULL | DEFAULT now() | Data/hora da concessão |
| `valid_until` | Timestamp | timestamptz | NULL | | Vigência — NULL = sem expiração. Gateway ignora vínculos expirados (BR-011) |
| `tenant_id` | UUID | uuid | NOT NULL | FK→tenants.id ON DELETE RESTRICT | |

**Constraints:**

- `UQ_mcp_agent_action_links` — UNIQUE(`agent_id`, `action_id`) — cada par é único (BR-011)

**Índices:**

- `IDX_mcp_agent_action_links_agent` — (`agent_id`) — hot query: listar ações vinculadas a um agente
- `IDX_mcp_agent_action_links_action` — (`action_id`) — hot query: listar agentes vinculados a uma ação
- `IDX_mcp_agent_action_links_valid` — (`agent_id`, `valid_until`) WHERE `valid_until` IS NOT NULL — gateway passo 4: verificar vigência

---

## Diagrama de Relacionamentos (ERD textual)

```text
tenants ─────────┬──────────────────────────────────────────────────┐
                 │                                                   │
users ──────┬────┼───────────────────────────────────────────┐       │
            │    │                                            │       │
            │    ▼                                            ▼       ▼
            │  mcp_agents ◄──── mcp_agent_action_links ───► mcp_actions
            │    │                                            │
            │    │                                            │
            │    ▼                                            │
            │  mcp_executions ─────────────────────────────────┘
            │    │         │
            │    │         ▼
            │    │   controlled_movements (MOD-009)
            │    ▼
            │  integration_call_logs (MOD-008)
            │
            ▼
       mcp_action_types
```

---

## Migração

- **Ordem de criação:** `mcp_action_types` → `mcp_agents` → `mcp_actions` → `mcp_agent_action_links` → `mcp_executions`
- **Seed data:** `mcp_action_types` com 5 registros canônicos (CONSULTAR, PREPARAR, SUBMETER, EXECUTAR, MONITORAR)
- **Rollback:** DROP em ordem inversa (`mcp_executions` → `mcp_agent_action_links` → `mcp_actions` → `mcp_agents` → `mcp_action_types`)
