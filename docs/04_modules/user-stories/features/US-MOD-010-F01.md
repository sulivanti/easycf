# US-MOD-010-F01 — API: Agentes MCP e Catálogo de Ações

**Status Ágil:** `READY`
**Versão:** 1.0.0
**Data:** 2026-03-15
**Módulo Destino:** **MOD-010** (MCP e Automação Governada — Backend)
**Referências Normativas:** DOC-DEV-001, DOC-ARC-001

## Metadados de Governança
- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-010, US-MOD-004, US-MOD-009, DOC-ARC-001
- **nivel_arquitetura:** 2
- **tipo:** Backend — cria novos endpoints
- **epico_pai:** US-MOD-010
- **manifests_vinculados:** N/A
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **administrador de governança**, quero cadastrar agentes MCP com identidades técnicas próprias, definir o catálogo de ações disponíveis para automação e controlar quais agentes podem executar quais ações — garantindo que nenhum agente herde poder decisório do usuário vinculado.

---

## 2. Segurança da API Key

```
CRIAÇÃO: gera key 256 bits base64url → retorna UMA VEZ → armazena hash bcrypt (rounds ≥ 12)
ROTAÇÃO: nova key retornada UMA VEZ → anterior invalidada
GET: NUNCA retorna key nem hash
AUTENTICAÇÃO: header X-MCP-Agent-Key → bcrypt.compare
```

---

## 3. Escopo

### Inclui
- CRUD de Agentes MCP com API key bcrypt, escopos permitidos, revogação
- Rotação de API key com invalidação imediata
- CRUD de Tipos de Ação (CONSULTAR, PREPARAR, SUBMETER, EXECUTAR, MONITORAR)
- CRUD de Ações com política de execução (DIRECT/CONTROLLED/EVENT_ONLY)
- Vínculo agente ↔ ação com vigência
- Bloqueio de escopos de aprovação em agentes

### Não inclui
- Gateway e motor de despacho — US-MOD-010-F02
- Log de execuções — US-MOD-010-F03
- Interfaces UX — US-MOD-010-F04, F05

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Agentes MCP e Catálogo de Ações

  Cenário: Criar agente MCP com escopos permitidos
    Quando POST /admin/mcp-agents com { codigo, nome, owner_user_id, allowed_scopes }
    Então 201 com api_key raw UMA VEZ
    E api_key_hash armazenado (bcrypt)
    E GET NÃO retorna api_key

  Cenário: Rejeitar escopo de aprovação em agente
    Dado que allowed_scopes inclui "approval:decide"
    Então 422: "Agentes MCP não podem ter escopos de aprovação: approval:decide"

  Cenário: Rotação de API key invalida a anterior
    Quando POST /admin/mcp-agents/:id/rotate-key
    Então nova api_key retornada uma vez
    E autenticação com key antiga: 401

  Cenário: Revogar agente bloqueia execuções futuras
    Quando POST /admin/mcp-agents/:id/revoke com { reason }
    Então status=REVOKED e POST /mcp/execute: 403

  Cenário: Criar ação com política CONTROLLED
    Quando POST /admin/mcp-actions com { execution_policy: "CONTROLLED" }
    Então ação criada — agentes passam pelo MOD-009

  Cenário: Ação DIRECT só para tipos com can_be_direct=true
    Dado que action_type tem can_be_direct=false
    Quando POST /admin/mcp-actions com execution_policy=DIRECT
    Então 422

  Cenário: Vincular agente a ação
    Quando POST /admin/mcp-agents/:id/actions com { action_id, valid_until }
    Então mcp_agent_action_links criado

  Cenário: Revogar vínculo agente-ação
    Quando DELETE /admin/mcp-agents/:id/actions/:actionId
    Então vínculo removido
```

---

## 5. Domain Events

| event_type | sensitivity_level |
|---|---|
| `mcp.agent_created` | 1 |
| `mcp.agent_revoked` | 1 |
| `mcp.agent_key_rotated` | 1 |
| `mcp.agent_action_granted` | 1 |
| `mcp.agent_action_revoked` | 1 |

## 6. Regras Críticas

1. API key retornada **uma única vez** — sem recuperação
2. `allowed_scopes` blocklist (Phase 1 permanente): `*:delete`, `*:approve`, `approval:decide`, `approval:override`, `*:sign`, `*:execute`
3. `api_key_hash`: bcrypt rounds ≥ 12, nunca exposto
4. Revogação: imediata
5. `codigo` imutável

---

## 7. DoR ✅ / DoD

**DoR:** Modelo definido, seed de mcp_action_types.
**DoD:** API key uma vez, escopos de aprovação bloqueados, rotação/revogação testadas, vínculos agente-ação testados.

---

## 8. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Agentes + Catálogo de Ações, 8 cenários Gherkin, domain events. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
