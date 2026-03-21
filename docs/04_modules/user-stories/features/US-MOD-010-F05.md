# US-MOD-010-F05 — UX: Monitor de Execuções MCP (UX-MCP-002)

**Status Ágil:** `APPROVED`
**Versão:** 1.1.0
**Data:** 2026-03-19
**Módulo Destino:** **MOD-010** (MCP e Automação Governada — UX)
**Referências Normativas:** DOC-DEV-001, DOC-UX-010, DOC-ARC-003

## Metadados de Governança
- **status_agil:** APPROVED
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-010, US-MOD-010-F03, DOC-UX-010
- **nivel_arquitetura:** 2
- **tipo:** UX — monitor de execuções MCP
- **epico_pai:** US-MOD-010
- **manifests_vinculados:** UX-MCP-002
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **administrador de governança**, quero monitorar todas as execuções MCP com métricas, filtros, detalhes de payload e identificação visual de tentativas de escalada de privilégio.

---

## 2. Escopo

### Inclui
- Header com métricas (24h): total, DIRECT_SUCCESS %, CONTROLLED_PENDING #, BLOCKED #
- Badge vermelho para privilege_escalation_attempts
- Tabela com filtros (agente, ação, status, data range) e paginação cursor-based
- Detalhe split-view com payload sanitizado, resultado, correlation_id
- Link para movimento vinculado (→ UX-APROV-001) se CONTROLLED_PENDING

### Não inclui
- APIs de backend — US-MOD-010-F01, F02, F03
- Gestão de agentes — US-MOD-010-F04

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Monitor de Execuções MCP — UX-MCP-002

  Cenário: Privilege escalation destaca badge vermelho
    Dado que mcp.privilege_escalation_attempt emitido
    Então badge vermelho "⚠ Escalada" na linha

  Cenário: CONTROLLED_PENDING mostra link para movimento
    Dado que execução tem linked_movement_id
    Então link "Ver no inbox" navega para UX-APROV-001

  Cenário: Filtrar por agente e política
    Quando admin filtra por agent_id e policy=CONTROLLED
    Então apenas execuções correspondentes aparecem

  Cenário: Detalhe split-view com payload sanitizado
    Quando admin clica numa execução
    Então painel lateral com agente, ação, política, payload ("***" sensíveis), resultado

  Cenário: Métricas do dia no header
    Então header exibe total, taxa DIRECT_SUCCESS, CONTROLLED_PENDING, BLOCKED
```

---

## 4. Manifests Vinculados

| Manifest | Tela | Arquivo |
|---|---|---|
| UX-MCP-002 | Monitor de Execuções MCP | [ux-mcp-002.monitor-execucoes.yaml](../../../05_manifests/screens/ux-mcp-002.monitor-execucoes.yaml) |

## 5. Regras Críticas

1. API key: JAMAIS exibida no monitor
2. Privilege escalation: badge permanente
3. CONTROLLED_PENDING: link direto para inbox

---

## 6. DoR ✅ / DoD

**DoR:** Manifest UX-MCP-002 criado, F03 em READY.
**DoD:** Métricas, filtros, detalhe, badge escalada, link para movimento, testes E2E.

---

## 7. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Monitor de execuções, 5 cenários Gherkin, manifest UX-MCP-002. |
| 1.1.0 | 2026-03-19 | Marcos Sulivan | APPROVED em cascata com épico US-MOD-010 v1.2.0. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
