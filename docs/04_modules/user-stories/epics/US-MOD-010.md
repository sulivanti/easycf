# US-MOD-010 — MCP e Automação Governada (Épico)

**Status Ágil:** `APPROVED`
**Versão:** 1.2.0
**Data:** 2026-03-19
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-010** (MCP e Automação Governada)
**Épico de Negócio:** EP09

## Metadados de Governança

- **status_agil:** APPROVED
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** EP09, doc 04_Integracoes_Aprovacoes_e_Automacao_Governada §6–7, doc 01_Fundacao_Organizacional_e_de_Acesso §7, US-MOD-004, US-MOD-007, US-MOD-008, US-MOD-009, DOC-DEV-001, DOC-ARC-001, DOC-ARC-003
- **nivel_arquitetura:** 2 (identidade técnica governada, políticas de execução, rastreabilidade integral)
- **evidencias:** N/A

---

## 1. Contexto e Problema

O sistema precisa suportar **agentes de automação (MCP)** que possam executar ações operacionais de forma programática, mas sem contornar os mecanismos de governança (aprovações, alçadas, segregação de funções). Sem esse módulo, toda automação precisa usar credenciais humanas ou bypass de controle — criando riscos de auditoria e segurança.

> **"O fato de o usuário poder aprovar não significa que seu agente associado também possa aprovar."**
> **"A automação pode preparar, validar, montar payload, submeter e acompanhar; a decisão pode continuar reservada ao humano autorizado."**

```
                    ┌─────────── MOD-010 ───────────┐
                    │                               │
  Usuário humano    │  Agente MCP  ─→  Ação MCP     │
  (dono do agente)  │  (conta      ─→  (catálogo)   │
        │           │  técnica)                      │
        │           └───────────────────────────────┘
        │                          │
        │                          ▼
        │               Política de Execução
        │                 ├── DIRECT        → Executa diretamente
        │                 ├── CONTROLLED    → Passa pelo MOD-009 (alçada)
        │                 └── EVENT_ONLY    → Apenas emite evento (sem escrita)
        │                          │
        │                  Rotina (MOD-007) ─→ Controle (MOD-009) ─→ Integração (MOD-008)
        │                          │
        └──────── Decisão de aprovação ◄──── RESERVADA AO HUMANO
```

---

## 2. Regra-Mãe de Não-Bypass

Consequências técnicas:
- **Agente MCP tem escopos próprios** — não herda escopos do usuário vinculado
- **Escopos bloqueados** (`*:delete`, `*:approve`, `approval:decide`, `approval:override`, `*:sign`, `*:execute`) **nunca podem ser atribuídos a agentes MCP** (Phase 1 — permanente)
- **Política CONTROLLED** sempre exige que a decisão final seja de um humano com `approval:decide`
- **Política DIRECT** só disponível para ações de baixo risco (consultas, preparações, submissões)

### 2.1 Blocklist de Escopos — Abordagem em Duas Fases

**Phase 1 (agora — permanente):**
Escopos permanentemente bloqueados para agentes MCP:
- `*:delete` — exclusões nunca permitidas a agentes
- `*:approve` — aprovações nunca permitidas a agentes
- `approval:decide` — decisão de aprovação
- `approval:override` — override de aprovação
- `*:sign` — assinaturas
- `*:execute` — execuções de gates

**Phase 2 (após MCP testado e validado em produção):**
Escopos que podem ser liberados sob condições:
- `*:create` — criação de objetos

Condições para liberação Phase 2:
1. MCP testado e validado em ambiente de produção
2. Aprovação explícita do owner (Marcos Sulivan)
3. Configuração **per-agent** (não global) — cada agente recebe liberação individual
4. Registro em auditoria com data e motivo

### 2.2 Detecção de Privilege Escalation

Tentativas de escalada de privilégio (agente tentando usar escopos bloqueados ou injetar escopos no payload) são classificadas como:
- **sensitivity_level=2** (alto) — evento `mcp.privilege_escalation_attempt`
- Alerta imediato no monitor **UX-MCP-002** (badge vermelho "Escalada de Privilégio")
- Registrado em `mcp_executions` com status=BLOCKED

---

## 3. Diferença Agente MCP vs. Conta Técnica

| | Conta Técnica (MOD-004 futuro) | Agente MCP |
|---|---|---|
| **Identidade** | Usuário de sistema sem login humano | Agente vinculado a protocolo MCP |
| **Vínculo** | A um serviço/aplicação | A um usuário humano (dono) |
| **Origem** | Chamadas de sistema | Requisições via protocolo MCP |
| **Aprovação** | Pode ter escopos de ação | NUNCA escopos de aprovação |
| **Rastreabilidade** | `origin_type=API` no MOD-009 | `origin_type=MCP` no MOD-009 |
| **Log** | `integration_call_logs` (MOD-008) | `mcp_executions` (MOD-010) |

---

## 4. As 3 Políticas de Execução

| Política | O que faz | Quando usar |
|---|---|---|
| `DIRECT` | Executa a ação imediatamente, sem passar pelo MOD-009 | Consultas, preparações, submissões de baixo risco sem efeito crítico |
| `CONTROLLED` | Passa pelo motor do MOD-009 — gera `controlled_movement` para aprovação humana | Escritas críticas, integrações, execuções com impacto real |
| `EVENT_ONLY` | Apenas emite `domain_event` — sem escrita direta, sem movimento controlado | Notificações, registros de contexto, triggers para outros sistemas |

---

## 5. Escopo

### Inclui
- API: Cadastro de Agentes MCP (identidade técnica governada)
- API: Catálogo de Ações MCP com tipos e políticas de execução
- API: Endpoint de recebimento de solicitações MCP (gateway de entrada)
- API: Motor de despacho MCP (avalia política → DIRECT/CONTROLLED/EVENT_ONLY)
- API: Log completo de execuções MCP
- UX: Gestão de Agentes e Ações (UX-MCP-001)
- UX: Monitor de Execuções MCP (UX-MCP-002)

### Não inclui
- Protocolo MCP em si (Model Context Protocol) — implementado pelo agente externo
- Conta técnica sem vínculo MCP — roadmap Wave 5+ (MOD-004 extensão)
- Revisão periódica de permissões de agentes — roadmap Wave 6

---

## 6. Critérios de Aceite (Épico)

```gherkin
Funcionalidade: Épico MCP e Automação Governada MOD-010

  Cenário: Agente não herda escopos de aprovação do usuário vinculado
    Dado que João tem scope "approval:decide"
    E João tem um agente MCP vinculado
    Quando o agente tenta executar ação com policy=DIRECT que requer "approval:decide"
    Então 403: "Agentes MCP não podem exercer escopos de aprovação."

  Cenário: Política CONTROLLED passa pelo motor MOD-009
    Dado que ação MCP tem execution_policy=CONTROLLED
    Quando agente solicita execução
    Então POST /movement-engine/evaluate é chamado com origin_type=MCP
    E se motor retorna controlled=true: controlled_movement criado
    E agente recebe 202: { movement_id, status: "PENDING_APPROVAL" }

  Cenário: Política EVENT_ONLY não produz escrita
    Dado que ação tem execution_policy=EVENT_ONLY
    Quando agente solicita execução
    Então domain_event emitido com context do agente
    E NENHUMA escrita em banco

  Cenário: Execução MCP totalmente rastreável
    Dado que agente executa ação
    Então mcp_executions registra: agent_id, action_id, policy_applied,
    payload, resultado, correlation_id, linked_movement_id (se CONTROLLED)

  Cenário: Sub-histórias bloqueadas sem aprovação
    Dado que US-MOD-010 está diferente de "APPROVED"
    Então forge-module é bloqueado
```

---

## 7. Definition of Ready (DoR) ✅

- [x] Cadeia lógica Agente→Ação→Política→MOD-009 documentada
- [x] Regra de não-herança de escopos de aprovação formalizada
- [x] 3 políticas de execução definidas com critérios claros
- [x] Diferença Agente MCP vs. Conta Técnica documentada
- [x] Modelo de dados completo (5 tabelas) definido
- [x] Features F01–F05 com Gherkin completo
- [x] Screen Manifests UX-MCP-001, UX-MCP-002 criados
- [x] Novos escopos mapeados para MOD-000-F12
- [x] Owner confirmar READY → APPROVED

## 8. Definition of Done (DoD)

- [ ] F01–F05 aprovadas e scaffoldadas
- [ ] Agente sem escopo de aprovação — testado em todos os cenários
- [ ] Política CONTROLLED integrada com motor MOD-009 — testada
- [ ] Política EVENT_ONLY produz apenas domain_event — validada sem escrita
- [ ] `mcp_executions` rastreável com todos os campos — auditada
- [ ] Gateway MCP valida autenticação do agente antes de processar

---

## 9. Sub-Histórias

```text
US-MOD-010
  ├── F01 ← API: Agentes MCP + Catálogo de Ações
  ├── F02 ← API: Gateway + Motor de Despacho MCP
  ├── F03 ← API: Log de Execuções MCP
  ├── F04 ← UX: Gestão de Agentes e Ações (UX-MCP-001)
  └── F05 ← UX: Monitor de Execuções MCP (UX-MCP-002)
```

| Feature | Tema | Tipo | Status |
|---|---|---|---|
| [US-MOD-010-F01](../features/US-MOD-010-F01.md) | API Agentes + Catálogo de Ações | Backend | `APPROVED` |
| [US-MOD-010-F02](../features/US-MOD-010-F02.md) | API Gateway + Motor de Despacho | Backend | `APPROVED` |
| [US-MOD-010-F03](../features/US-MOD-010-F03.md) | API Log de Execuções | Backend | `APPROVED` |
| [US-MOD-010-F04](../features/US-MOD-010-F04.md) | UX Gestão de Agentes e Ações | UX | `APPROVED` |
| [US-MOD-010-F05](../features/US-MOD-010-F05.md) | UX Monitor de Execuções | UX | `APPROVED` |

---

## 10. Modelo de Dados Completo

### `mcp_agents` — Agentes MCP
| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `codigo` | varchar(50) | UNIQUE NOT NULL | Imutável. ex: AGENT-COMERCIAL-01 |
| `nome` | varchar(200) | NOT NULL | |
| `owner_user_id` | uuid | FK→users.id NOT NULL | Usuário humano responsável |
| `api_key_hash` | varchar | NOT NULL | Hash bcrypt da API key — nunca retornado em GET |
| `allowed_scopes` | jsonb | NOT NULL | Lista de escopos permitidos ao agente |
| `status` | varchar | ACTIVE\|INACTIVE\|REVOKED | |
| `last_used_at` | timestamp | nullable | Atualizado a cada execução |
| `created_by` | uuid | FK→users.id | |
| `created_at`, `updated_at` | timestamp | | |
| `revoked_at` | timestamp | nullable | |
| `revocation_reason` | text | nullable | |

**Constraint crítica (Phase 1):** `allowed_scopes` NUNCA pode conter `*:delete`, `*:approve`, `approval:decide`, `approval:override`, `*:sign`, `*:execute`. Veja §2.1 para roadmap Phase 2 (`*:create`).

### `mcp_action_types` — Tipos de Ação MCP
| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | |
| `codigo` | varchar UNIQUE | CONSULTAR, PREPARAR, SUBMETER, EXECUTAR, MONITORAR |
| `nome` | varchar | |
| `can_be_direct` | boolean | Se policy=DIRECT é permitida para este tipo |
| `can_approve` | boolean | Sempre false (agentes não aprovam) |

### `mcp_actions` — Catálogo de Ações MCP
| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `codigo` | varchar(50) | UNIQUE NOT NULL | Imutável |
| `nome` | varchar(200) | NOT NULL | |
| `action_type_id` | uuid | FK→mcp_action_types | |
| `execution_policy` | varchar | DIRECT\|CONTROLLED\|EVENT_ONLY | |
| `target_object_type` | varchar | NOT NULL | Objeto-alvo da ação |
| `required_scopes` | jsonb | NOT NULL | Escopos que o agente precisa ter |
| `linked_routine_id` | uuid | FK→behavior_routines, nullable | Rotina MOD-007 a avaliar |
| `linked_integration_id` | uuid | FK→behavior_routines, nullable | Rotina de integração MOD-008 |
| `description` | text | nullable | |
| `status` | varchar | ACTIVE\|INACTIVE | |
| `created_by` | uuid | FK→users | |

### `mcp_executions` — Log de Execuções
| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `agent_id` | uuid | FK→mcp_agents.id NOT NULL | |
| `action_id` | uuid | FK→mcp_actions.id NOT NULL | |
| `policy_applied` | varchar | NOT NULL | |
| `origin_ip` | varchar | nullable | |
| `request_payload` | jsonb | NOT NULL | |
| `correlation_id` | varchar | NOT NULL | |
| `status` | varchar | RECEIVED\|DISPATCHED\|DIRECT_SUCCESS\|DIRECT_FAILED\|CONTROLLED_PENDING\|EVENT_EMITTED\|BLOCKED | |
| `linked_movement_id` | uuid | FK→controlled_movements, nullable | |
| `linked_integration_log_id` | uuid | FK→integration_call_logs, nullable | |
| `result_payload` | jsonb | nullable | |
| `error_message` | text | nullable | |
| `received_at` | timestamp | NOT NULL | |
| `completed_at` | timestamp | nullable | |

### `mcp_agent_action_links` — Agente ↔ Ação
| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `agent_id` | uuid | FK→mcp_agents.id | |
| `action_id` | uuid | FK→mcp_actions.id | |
| `granted_by` | uuid | FK→users.id | |
| `granted_at` | timestamp | | |
| `valid_until` | timestamp | nullable | |
| UNIQUE | | `(agent_id, action_id)` | |

---

## 11. Endpoints do Módulo

| Método | Path | operationId | Scope |
|---|---|---|---|
| GET | /api/v1/admin/mcp-agents | `admin_mcp_agents_list` | `mcp:agent:read` |
| POST | /api/v1/admin/mcp-agents | `admin_mcp_agents_create` | `mcp:agent:write` |
| PATCH | /api/v1/admin/mcp-agents/:id | `admin_mcp_agents_update` | `mcp:agent:write` |
| POST | /api/v1/admin/mcp-agents/:id/revoke | `admin_mcp_agents_revoke` | `mcp:agent:revoke` |
| POST | /api/v1/admin/mcp-agents/:id/rotate-key | `admin_mcp_agents_rotate_key` | `mcp:agent:write` |
| GET | /api/v1/admin/mcp-actions | `admin_mcp_actions_list` | `mcp:action:read` |
| POST | /api/v1/admin/mcp-actions | `admin_mcp_actions_create` | `mcp:action:write` |
| PATCH | /api/v1/admin/mcp-actions/:id | `admin_mcp_actions_update` | `mcp:action:write` |
| POST | /api/v1/admin/mcp-agents/:id/actions | `admin_mcp_agent_action_grant` | `mcp:agent:write` |
| DELETE | /api/v1/admin/mcp-agents/:id/actions/:actionId | `admin_mcp_agent_action_revoke` | `mcp:agent:write` |
| — | — | — | — |
| POST | /api/v1/mcp/execute | `mcp_execute` | (authn via API key, não JWT) |
| — | — | — | — |
| GET | /api/v1/admin/mcp-executions | `admin_mcp_executions_list` | `mcp:log:read` |
| GET | /api/v1/admin/mcp-executions/:id | `admin_mcp_executions_get` | `mcp:log:read` |

---

## 12. Novos Escopos — Amendment MOD-000-F12

| Escopo | Descrição |
|---|---|
| `mcp:agent:read` | Ver catálogo de agentes |
| `mcp:agent:write` | Criar/editar agentes e gerenciar permissões de ação |
| `mcp:agent:revoke` | Revogar agente (ação crítica separada) |
| `mcp:action:read` | Ver catálogo de ações |
| `mcp:action:write` | Criar/editar ações do catálogo |
| `mcp:log:read` | Ver execuções MCP e logs |

---

## 13. OKRs

| # | Métrica | Alvo |
|---|---|---|
| OKR-1 | Agente sem escopo de aprovação — bloqueado em 100% das tentativas | 100% |
| OKR-2 | Política CONTROLLED → motor MOD-009 chamado | 100% |
| OKR-3 | Política EVENT_ONLY → zero escritas em banco | 100% |
| OKR-4 | API key retornada apenas uma vez (na criação) — nunca em GET | 100% |

---

## 14. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação do zero. 5 tabelas, 3 políticas, gateway MCP, 5 features. Último módulo do backlog. |
| 1.1.0 | 2026-03-16 | Marcos Sulivan | Decisões técnicas 2026-03-15: blocklist expandida com *:delete, abordagem duas fases documentada, sensitivity_level=2 para privilege escalation. Owner atualizado. |
| 1.2.0 | 2026-03-19 | Marcos Sulivan | APPROVED com cascata. Todas as regras validadas: blocklist Phase 1, 3 políticas, API key once-only, sensitivity_level=2, DoR completo. Features F01–F05 aprovadas em cascata. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
