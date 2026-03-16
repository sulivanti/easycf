# US-MOD-010-F03 — API: Log de Execuções MCP

**Status Ágil:** `READY`
**Versão:** 1.0.0
**Data:** 2026-03-15
**Módulo Destino:** **MOD-010** (MCP e Automação Governada — Backend)
**Referências Normativas:** DOC-DEV-001, DOC-ARC-001

## Metadados de Governança
- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-010, US-MOD-010-F02, DOC-ARC-001
- **nivel_arquitetura:** 2
- **tipo:** Backend — endpoints de consulta
- **epico_pai:** US-MOD-010
- **manifests_vinculados:** N/A
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **administrador de governança**, quero consultar o log completo de execuções MCP com filtros, ver detalhes incluindo movimentos vinculados e identificar tentativas de escalada de privilégio.

---

## 2. Escopo

### Inclui
- `GET /admin/mcp-executions` com filtros e paginação cursor-based
- `GET /admin/mcp-executions/:id` com detalhe incluindo movimento vinculado
- Payload sanitizado (dados sensíveis mascarados pelo servidor)
- Flag visual para privilege_escalation_attempt
- API key jamais exposta em nenhum endpoint

### Não inclui
- Cadastro de agentes e ações — US-MOD-010-F01
- Gateway de execução — US-MOD-010-F02
- Interfaces UX — US-MOD-010-F04, F05

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Log de Execuções MCP

  Cenário: Listar execuções com filtros
    Dado que admin tem scope mcp:log:read
    Quando GET /admin/mcp-executions?agent_id=uuid&status=CONTROLLED_PENDING
    Então retorna execuções filtradas com paginação cursor-based

  Cenário: Detalhe inclui movimento vinculado
    Dado que execução tem linked_movement_id
    Quando GET /admin/mcp-executions/:id
    Então response inclui linked_movement com codigo e status

  Cenário: Log nunca retorna API key do agente
    Quando GET /admin/mcp-executions/:id
    Então api_key_hash AUSENTE da response

  Cenário: Payload sanitizado de dados sensíveis
    Dado que payload contém "password" ou "api_key"
    Então campos mascarados como "***"

  Cenário: Privilege escalation — indicador visual
    Dado que mcp.privilege_escalation_attempt foi emitido
    Então execução tem badge "Tentativa de escalada"
```

---

## 4. Regras Críticas

1. API key: jamais exposta em nenhum endpoint
2. Payload sensível: mascarado pelo servidor
3. Privilege escalation: flag visível para auditoria
4. Cursor-based pagination

---

## 5. DoR ✅ / DoD

**DoR:** F02 em READY.
**DoD:** Filtros testados, payload sanitizado, privilege escalation visível, API key ausente.

---

## 6. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Log de Execuções MCP, 5 cenários Gherkin. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
