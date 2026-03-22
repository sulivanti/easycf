# US-MOD-010-F02 — API: Gateway e Motor de Despacho MCP

**Status Ágil:** `APPROVED`
**Versão:** 1.1.0
**Data:** 2026-03-19
**Módulo Destino:** **MOD-010** (MCP e Automação Governada — Backend)
**Referências Normativas:** DOC-DEV-001, DOC-ARC-001, DOC-ARC-003

## Metadados de Governança

- **status_agil:** APPROVED
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-010, US-MOD-010-F01, US-MOD-009, DOC-ARC-001
- **nivel_arquitetura:** 2
- **tipo:** Backend — gateway de entrada MCP
- **epico_pai:** US-MOD-010
- **manifests_vinculados:** N/A
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **sistema**, quero um gateway que recebe solicitações de agentes MCP, autentica a API key, valida permissões, avalia a política de execução e despacha para o caminho correto (DIRECT/CONTROLLED/EVENT_ONLY) — com rastreabilidade completa.

---

## 2. Algoritmo do Gateway

```
POST /api/v1/mcp/execute
  [1] Autenticar agente (bcrypt)
  [2] Verificar ACTIVE
  [3] Buscar ação pelo action_code
  [4] Verificar vínculo agente ↔ ação + valid_until
  [5] Verificar required_scopes ⊆ allowed_scopes
  [6] Dupla verificação: nenhum escopo de aprovação
  [7] INSERT mcp_executions (RECEIVED)
  [8] Avaliar policy → DIRECT / CONTROLLED / EVENT_ONLY
```

---

## 3. Escopo

### Inclui

- Endpoint `POST /mcp/execute` (autenticação por API key, não JWT)
- Algoritmo de 8 passos com validação sequencial
- Despacho DIRECT: executa e retorna 200
- Despacho CONTROLLED: chama MOD-009, retorna 202
- Despacho EVENT_ONLY: emite domain_event, zero escrita, retorna 200
- Detecção de tentativa de escalada de privilégio no payload

### Não inclui

- Cadastro de agentes e ações — US-MOD-010-F01
- Log de execuções (consulta) — US-MOD-010-F03

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Gateway e Motor de Despacho MCP

  Cenário: Autenticação por API key — chave válida
    Dado que agente tem key válida
    Quando POST /mcp/execute com header correto
    Então gateway autentica e prossegue

  Cenário: Autenticação falha — chave inválida
    Então 401: "API key inválida."

  Cenário: Política DIRECT — executa e retorna resultado
    Dado que ação tem execution_policy=DIRECT
    Quando POST /mcp/execute
    Então 200 com resultado, mcp_executions.status=DIRECT_SUCCESS

  Cenário: Política CONTROLLED — gera movimento e retorna 202
    Dado que ação tem execution_policy=CONTROLLED
    Quando POST /mcp/execute
    Então POST /movement-engine/evaluate chamado com origin_type=MCP
    E 202: { movement_id, message: "Aguardando aprovação humana" }

  Cenário: Política EVENT_ONLY — emite evento sem escrita
    Dado que ação tem execution_policy=EVENT_ONLY
    Quando POST /mcp/execute
    Então domain_event emitido, NENHUMA escrita transacional, 200

  Cenário: Agente sem vínculo com a ação
    Então 403: "Agente não autorizado para a ação."

  Cenário: Vínculo expirado
    Então 403: "Permissão para esta ação expirou."

  Cenário: X-Correlation-ID gerado e propagado
    Quando POST /mcp/execute sem correlation_id
    Então gateway gera automaticamente e propaga

  Cenário: Injeção de escopo de aprovação bloqueada
    Dado que payload contém tentativa de escalada
    Então campo ignorado + evento mcp.privilege_escalation_attempt emitido
```

---

## 5. Domain Events

| event_type | sensitivity_level |
|---|---|
| `mcp.execution_direct` | 1 |
| `mcp.execution_controlled` | 1 |
| `mcp.action_event_emitted` | 1 |
| `mcp.execution_blocked` | 1 |
| `mcp.privilege_escalation_attempt` | 2 |

## 6. Regras Críticas

1. Autenticação por API key — endpoint não aceita JWT humano
2. CONTROLLED: origem fica como MCP no log mesmo se motor retorna controlled=false
3. EVENT_ONLY: zero escrita transacional
4. Privilege escalation: alerta sensitivity_level=2
5. X-Correlation-ID: gerado se ausente

---

## 7. DoR ✅ / DoD

**DoR:** F01 em READY, MOD-009 em READY.
**DoD:** 3 políticas testadas, autenticação testada, escalada detectada, correlation_id propagado.

---

## 8. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Gateway + Motor de Despacho, 9 cenários Gherkin, domain events. |
| 1.1.0 | 2026-03-19 | Marcos Sulivan | APPROVED em cascata com épico US-MOD-010 v1.2.0. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
