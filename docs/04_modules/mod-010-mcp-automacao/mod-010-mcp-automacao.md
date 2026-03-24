> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-19 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-19 | AGN-DEV-01  | Enriquecimento MOD/Escala (enrich-agent) |

# MOD-010 — MCP e Automação Governada

- **id:** MOD-010
- **version:** 1.0.0
- **estado_item:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-23
- **architecture_level:** 2
- **rastreia_para:** US-MOD-010, US-MOD-010-F01, US-MOD-010-F02, US-MOD-010-F03, US-MOD-010-F04, US-MOD-010-F05, DOC-DEV-001, DOC-ARC-001, DOC-ARC-003, DOC-FND-000, DOC-ESC-001, MOD-000, MOD-004, MOD-007, MOD-008, MOD-009
- **referencias_exemplos:** EX-ESC-001, EX-AUTH-001, EX-SEC-001
- **evidencias:** N/A

---

## 1. Objetivo

Módulo responsável pela **automação governada via protocolo MCP** — agentes de automação com identidade técnica própria que executam ações operacionais sem contornar mecanismos de governança (aprovações, alçadas, segregação de funções). O princípio central é: **"O fato de o usuário poder aprovar não significa que seu agente associado também possa aprovar."**

### Modelo de Domínio

O domínio é centrado no **Aggregate Root `McpAgent`**, que encapsula a identidade técnica governada do agente, seus escopos permitidos (com blocklist permanente de escopos de aprovação) e o ciclo de vida (ACTIVE → INACTIVE → REVOKED). Ações MCP são despachadas via `McpGateway` que avalia políticas de execução e roteia para o caminho correto.

**Value Objects:**

- `ExecutionPolicy` — enum com 3 políticas: `DIRECT` (execução imediata, baixo risco), `CONTROLLED` (passa pelo MOD-009 para aprovação humana), `EVENT_ONLY` (apenas emite domain_event, zero escrita).
- `AgentStatus` — enum `ACTIVE | INACTIVE | REVOKED`. Revogação é irreversível.
- `ActionType` — tipifica ações: `CONSULTAR | PREPARAR | SUBMETER | EXECUTAR | MONITORAR`. Campo `can_be_direct` controla elegibilidade para política DIRECT. Campo `can_approve` é sempre `false`.

**Domain Services:**

- `McpGateway` — gateway de entrada. Algoritmo de 8 passos: (1) autenticar agente via API key/bcrypt, (2) verificar status ACTIVE, (3) buscar ação pelo action_code, (4) verificar vínculo agente↔ação + valid_until, (5) verificar required_scopes ⊆ allowed_scopes, (6) dupla verificação blocklist de escopos de aprovação, (7) INSERT mcp_executions (RECEIVED), (8) avaliar policy → DIRECT/CONTROLLED/EVENT_ONLY.
- `ScopeBlocklistValidator` — valida que `allowed_scopes` de um agente NUNCA contém escopos bloqueados Phase 1: `*:delete`, `*:approve`, `approval:decide`, `approval:override`, `*:sign`, `*:execute`. Detecta tentativas de privilege escalation (`sensitivity_level=2`).
- `McpDispatcher` — despacha para o caminho correto: DIRECT executa e retorna 200, CONTROLLED chama MOD-009 motor e retorna 202 com `movement_id`, EVENT_ONLY emite domain_event sem escrita e retorna 200.

### Fluxo Principal

O gateway implementa autenticação por API key (não JWT), validação sequencial de 8 passos, e despacho por política. Agentes MCP têm escopos próprios — não herdam escopos do usuário vinculado. Escopos de aprovação são permanentemente bloqueados (Phase 1). Política CONTROLLED sempre exige decisão final humana via MOD-009. Todas as execuções são registradas em `mcp_executions` com rastreabilidade integral (correlation_id, agent_id, action_id, policy_applied, payload, resultado).

## 1.1 Problema que resolve

- **Problema:** O sistema precisa suportar agentes de automação (MCP) que executem ações operacionais de forma programática, mas sem contornar os mecanismos de governança. Sem esse módulo, toda automação precisa usar credenciais humanas ou bypass de controle — criando riscos de auditoria e segurança.
- **Impacto hoje:** Automação impossível sem comprometer governança; risco de agentes executando ações de aprovação; sem rastreabilidade de execuções automatizadas.
- **Resultado esperado:** Agentes MCP com identidade técnica governada, 3 políticas de execução, blocklist de escopos permanente, rastreabilidade integral via `mcp_executions`.

## 1.2 Público-alvo (personas e perfis)

| Persona | Scope requerido | Ações disponíveis |
|---|---|---|
| **Admin (agentes)** | `mcp:agent:read` + `mcp:agent:write` | Cadastrar agentes, gerenciar escopos, vincular ações |
| **Admin (revogação)** | `mcp:agent:revoke` | Revogar agentes (ação crítica separada) |
| **Admin (ações)** | `mcp:action:read` + `mcp:action:write` | Gerenciar catálogo de ações e políticas |
| **Admin (monitor)** | `mcp:log:read` | Monitorar execuções MCP, identificar escaladas |
| **Agente MCP** | (authn via API key) | Executar ações conforme política atribuída |

## 1.3 Escopo

### Inclui

- API: Cadastro de Agentes MCP (identidade técnica governada)
- API: Catálogo de Ações MCP com tipos e políticas de execução
- API: Endpoint de recebimento de solicitações MCP (gateway de entrada)
- API: Motor de despacho MCP (avalia política → DIRECT/CONTROLLED/EVENT_ONLY)
- API: Log completo de execuções MCP
- UX: Gestão de Agentes e Ações (UX-MCP-001)
- UX: Monitor de Execuções MCP (UX-MCP-002)

### Não inclui (Fora de escopo)

- Protocolo MCP em si (Model Context Protocol) — implementado pelo agente externo
- Conta técnica sem vínculo MCP — roadmap Wave 5+ (MOD-004 extensão)
- Revisão periódica de permissões de agentes — roadmap Wave 6

## 1.4 Métricas de sucesso (OKRs)

- **OKR-1:** Agente sem escopo de aprovação — bloqueado em 100% das tentativas | Alvo: 100%
- **OKR-2:** Política CONTROLLED → motor MOD-009 chamado | Alvo: 100%
- **OKR-3:** Política EVENT_ONLY → zero escritas em banco | Alvo: 100%
- **OKR-4:** API key retornada apenas uma vez (na criação) — nunca em GET | Alvo: 100%

## 1.5 Justificativa do Nível de Arquitetura (DOC-ESC-001)

**Nível:** 2 — DDD-lite + Clean Completo

**Gatilhos ativados (DOC-ESC-001 §4.1 — Nível 2 requer 2+ gatilhos):**

| # | Gatilho | Justificativa no MOD-010 |
|---|---------|--------------------------|
| 1 | Workflow com estados | Agente MCP tem ciclo de vida `ACTIVE → INACTIVE → REVOKED` (irreversível). Execuções transitam `RECEIVED → DISPATCHED → DIRECT_SUCCESS/DIRECT_FAILED/CONTROLLED_PENDING/EVENT_EMITTED/BLOCKED`. |
| 2 | Compliance e auditoria | Blocklist permanente de escopos (Phase 1), detecção de privilege escalation (`sensitivity_level=2`), rastreabilidade integral em `mcp_executions`. API key retornada apenas uma vez (compliance de segredos). |
| 3 | Concorrência e consistência forte | Gateway MCP com algoritmo de 8 passos sequenciais: autenticação, validação de status, verificação de vínculo, verificação de escopos, dupla checagem blocklist, registro de execução, despacho por política. Idempotência na rotação de chaves. |
| 4 | Integrações externas críticas | Integração com MOD-009 (motor de movimentos controlados), MOD-007 (rotinas comportamentais), MOD-008 (integrações externas). Política CONTROLLED gera `controlled_movement` no MOD-009. |
| 5 | Multi-tenant com regras por tenant | Todos os agentes e execuções filtrados por `tenant_id` (herdado via Foundation). Escopos e ações isolados por tenant. |
| 6 | Regras cruzadas e reuso alto | `ScopeBlocklistValidator` reusado em criação, edição e gateway. `McpGateway` orquestra domain services cruzados. 3 políticas de execução com caminhos distintos. |

**Score DOC-ESC-001:** 6 pontos (todos gatilhos ativados) → Nível 2 confirmado.

**Aggregate Root:** `McpAgent` — fronteira transacional clara (identidade + escopos + status + vínculos com ações).

**Domain Services:** `McpGateway`, `ScopeBlocklistValidator`, `McpDispatcher` — invariantes de negócio protegidas no domínio.

**Value Objects:** `ExecutionPolicy`, `AgentStatus`, `ActionType` — tipos imutáveis com validação ao criar.

## 1.6 Caminhos do Módulo (module_paths)

```text
docs/04_modules/mod-010-mcp-automacao/
  mod-010-mcp-automacao.md                  # Este arquivo (MOD-010)
  CHANGELOG.md                              # Histórico de alterações
  requirements/
    br/BR-010.md                            # Regras de negócio
    fr/FR-010.md                            # Requisitos funcionais
    data/DATA-010.md                        # Modelo de dados
    data/DATA-003.md                        # Catálogo de domain events
    int/INT-010.md                          # Integrações
    sec/SEC-010.md                          # Segurança e compliance
    sec/SEC-002.md                          # Matriz de autorização de eventos
    ux/UX-010.md                            # Experiência do usuário
    nfr/NFR-010.md                          # Requisitos não funcionais
    pen-010-pendente.md                     # Pendências
  adr/                                      # Decisões arquiteturais
  amendments/                               # Emendas (quando READY)
```

```text
apps/api/src/modules/mcp/
  domain/
    aggregates/mcp-agent.ts                 # Aggregate Root McpAgent
    entities/mcp-action.ts                  # Entidade McpAction
    value-objects/execution-policy.ts       # VO ExecutionPolicy (DIRECT|CONTROLLED|EVENT_ONLY)
    value-objects/agent-status.ts           # VO AgentStatus (ACTIVE|INACTIVE|REVOKED)
    value-objects/action-type.ts            # VO ActionType (CONSULTAR|PREPARAR|SUBMETER|EXECUTAR|MONITORAR)
    domain-services/mcp-gateway.ts          # Gateway de entrada (algoritmo 8 passos)
    domain-services/scope-blocklist-validator.ts  # Validação de escopos bloqueados
    domain-services/mcp-dispatcher.ts       # Despacho por política
    domain-events/                          # 10 domain events
    errors/                                 # Erros de domínio
  application/
    use-cases/
      create-agent.ts
      update-agent.ts
      revoke-agent.ts
      rotate-agent-key.ts
      create-action.ts
      update-action.ts
      grant-agent-action.ts
      revoke-agent-action.ts
      execute-mcp.ts                        # Orquestra McpGateway + McpDispatcher
      list-executions.ts
    ports/
      mcp-agent-repository.ts
      mcp-action-repository.ts
      mcp-execution-repository.ts
      movement-engine-gateway.ts            # Port para MOD-009
    dtos/
  infrastructure/
    db/
      repositories/
      mappers/
    clients/
      movement-engine-client.ts             # Adapter MOD-009
  presentation/
    controllers/
    routes/
    validators/

apps/web/src/modules/mcp/
  ui/
    screens/
      mcp-agents-list.tsx                   # UX-MCP-001
      mcp-agent-form.tsx                    # UX-MCP-001
      mcp-executions-monitor.tsx            # UX-MCP-002
    components/
    forms/
  domain/
    view-model.ts
  data/
    queries.ts
    commands.ts
    mappers.ts
```

---

## 1.7 Dependências

- **Depende de:** MOD-000 (Foundation) — auth, RBAC scopes (`mcp:*`), domain events, audit trail
- **Depende de:** MOD-004 (Identidade Avançada) — scopes delegados para agentes MCP
- **Depende de:** MOD-007 (Parametrização Contextual) — motor de parametrização para configuração dinâmica
- **Depende de:** MOD-008 (Integração Protheus) — integrações externas acionadas via MCP
- **Depende de:** MOD-009 (Movimentos sob Aprovação) — policy CONTROLLED para movimentos que requerem aprovação
- **Dependentes:** Nenhum (módulo folha)

---

## 2. Diferença Agente MCP vs. Conta Técnica

| | Conta Técnica (MOD-004 futuro) | Agente MCP |
|---|---|---|
| **Identidade** | Usuário de sistema sem login humano | Agente vinculado a protocolo MCP |
| **Vínculo** | A um serviço/aplicação | A um usuário humano (dono) |
| **Origem** | Chamadas de sistema | Requisições via protocolo MCP |
| **Aprovação** | Pode ter escopos de ação | NUNCA escopos de aprovação |
| **Rastreabilidade** | `origin_type=API` no MOD-009 | `origin_type=MCP` no MOD-009 |
| **Log** | `integration_call_logs` (MOD-008) | `mcp_executions` (MOD-010) |

---

## 3. Regra-Mãe de Não-Bypass

### 3.1 Blocklist de Escopos — Phase 1 (Permanente)

Escopos permanentemente bloqueados para agentes MCP:

- `*:delete` — exclusões nunca permitidas a agentes
- `*:approve` — aprovações nunca permitidas a agentes
- `approval:decide` — decisão de aprovação
- `approval:override` — override de aprovação
- `*:sign` — assinaturas
- `*:execute` — execuções de gates

### 3.2 Phase 2 (Liberação per-agent)

Escopos que podem ser liberados sob condições após MCP testado em produção:

- `*:create` — criação de objetos

Condições: aprovação explícita do owner, configuração per-agent (não global), registro em auditoria.

### 3.3 Detecção de Privilege Escalation

Tentativas de escalada classificadas como `sensitivity_level=2`, evento `mcp.privilege_escalation_attempt`, badge vermelho no UX-MCP-002, registrado em `mcp_executions` com `status=BLOCKED`.

---

## 4. As 3 Políticas de Execução

| Política | O que faz | Quando usar |
|---|---|---|
| `DIRECT` | Executa a ação imediatamente | Consultas, preparações, submissões de baixo risco |
| `CONTROLLED` | Passa pelo motor do MOD-009 — gera `controlled_movement` | Escritas críticas, integrações, execuções com impacto |
| `EVENT_ONLY` | Apenas emite `domain_event` — sem escrita direta | Notificações, registros de contexto, triggers |

---

## 5. Modelo de Dados

5 tabelas: `mcp_agents`, `mcp_action_types`, `mcp_actions`, `mcp_executions`, `mcp_agent_action_links`.

Detalhes completos em [DATA-010](requirements/data/DATA-010.md).

---

## 6. Endpoints do Módulo

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
| POST | /api/v1/mcp/execute | `mcp_execute` | (authn via API key) |
| GET | /api/v1/admin/mcp-executions | `admin_mcp_executions_list` | `mcp:log:read` |
| GET | /api/v1/admin/mcp-executions/:id | `admin_mcp_executions_get` | `mcp:log:read` |

---

## 7. Novos Escopos — Amendment MOD-000-F12

| Escopo | Descrição |
|---|---|
| `mcp:agent:read` | Ver catálogo de agentes |
| `mcp:agent:write` | Criar/editar agentes e gerenciar permissões de ação |
| `mcp:agent:revoke` | Revogar agente (ação crítica separada) |
| `mcp:action:read` | Ver catálogo de ações |
| `mcp:action:write` | Criar/editar ações do catálogo |
| `mcp:log:read` | Ver execuções MCP e logs |

---

## 8. Sub-Histórias (Features)

| Feature | Tema | Tipo | Status |
|---|---|---|---|
| [US-MOD-010-F01](../user-stories/features/US-MOD-010-F01.md) | API Agentes + Catálogo de Ações | Backend | `READY` |
| [US-MOD-010-F02](../user-stories/features/US-MOD-010-F02.md) | API Gateway + Motor de Despacho | Backend | `READY` |
| [US-MOD-010-F03](../user-stories/features/US-MOD-010-F03.md) | API Log de Execuções | Backend | `READY` |
| [US-MOD-010-F04](../user-stories/features/US-MOD-010-F04.md) | UX Gestão de Agentes e Ações | UX | `READY` |
| [US-MOD-010-F05](../user-stories/features/US-MOD-010-F05.md) | UX Monitor de Execuções | UX | `READY` |

---

## 9. Itens base (canônicos) e links

- BR-010 — Regras de Negócio de MCP e Automação Governada
  Doc: `requirements/br/BR-010.md`
- FR-010 — Requisitos Funcionais de MCP e Automação Governada
  Doc: `requirements/fr/FR-010.md`
- DATA-010 — Modelo de Dados de MCP e Automação Governada
  Doc: `requirements/data/DATA-010.md`
- DATA-003 — Catálogo de Domain Events
  Doc: `requirements/data/DATA-003.md`
- INT-010 — Integrações de MCP e Automação Governada
  Doc: `requirements/int/INT-010.md`
- SEC-010 — Segurança, Auditoria e Compliance
  Doc: `requirements/sec/SEC-010.md`
- SEC-002 — Matriz de Autorização de Eventos
  Doc: `requirements/sec/SEC-002.md`
- UX-010 — Experiência do Usuário de MCP e Automação Governada
  Doc: `requirements/ux/UX-010.md`
- NFR-010 — Requisitos Não Funcionais
  Doc: `requirements/nfr/NFR-010.md`

### Decisões (ADR)

- [ADR-001](adr/ADR-001.md) — Gateway Síncrono de 8 Passos (Por Que Síncrono e Não Async)
- [ADR-002](adr/ADR-002.md) — API Key via bcrypt (Por Que bcrypt e Não HMAC/JWT para Agentes)
- [ADR-003](adr/ADR-003.md) — Outbox Pattern para Domain Events (Por Que Outbox e Não Publish Direto)
- [ADR-004](adr/ADR-004.md) — Blocklist como Wildcard Pattern Matching (Por Que Regex-like e Não Lista Exata)

---

## 10. Metadados do item (MOD-010)

- **estado_item:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-23
- **rastreia_para:** US-MOD-010, DOC-DEV-001, DOC-ARC-001, DOC-ARC-003, DOC-FND-000, DOC-ESC-001
- **referencias_exemplos:** EX-ESC-001, EX-AUTH-001, EX-SEC-001
- **evidencias:** N/A
