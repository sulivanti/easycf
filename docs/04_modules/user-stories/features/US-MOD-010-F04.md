# US-MOD-010-F04 — UX: Gestão de Agentes e Ações (UX-MCP-001)

**Status Ágil:** `APPROVED`
**Versão:** 1.1.0
**Data:** 2026-03-19
**Módulo Destino:** **MOD-010** (MCP e Automação Governada — UX)
**Referências Normativas:** DOC-DEV-001, DOC-UX-010, DOC-ARC-003

## Metadados de Governança
- **status_agil:** APPROVED
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-010, US-MOD-010-F01, DOC-UX-010
- **nivel_arquitetura:** 2
- **tipo:** UX — gestão de agentes e ações MCP
- **epico_pai:** US-MOD-010
- **manifests_vinculados:** UX-MCP-001
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **administrador de governança**, quero gerenciar agentes MCP, o catálogo de ações e a matriz de permissões agente↔ação em uma interface visual, com garantia de que API keys são exibidas apenas uma vez e escopos de aprovação não são atribuíveis.

---

## 2. Escopo

### Inclui
- Tabela de agentes com status, CRUD via drawer, revogação com motivo
- Modal de API key exibida uma única vez (com checkbox obrigatório para fechar)
- Rotação de key com aviso de invalidação imediata
- Catálogo de ações com badges de política (DIRECT/CONTROLLED/EVENT_ONLY)
- Matriz agentes × ações (permissões com vigência)
- Escopos de aprovação ausentes da lista de allowed_scopes
- Drawer de criação de ação com select de política e vínculos MOD-007/008

### Não inclui
- APIs de backend — US-MOD-010-F01, F02, F03
- Monitor de execuções — US-MOD-010-F05

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Gestão de Agentes e Ações — UX-MCP-001

  Cenário: Criar agente — API key exibida apenas uma vez
    Quando admin cria agente com sucesso
    Então modal: "Copie sua API key agora. Ela não será exibida novamente."
    E botão "Fechar" desabilitado até clicar "Copiei a chave"

  Cenário: allowed_scopes — escopos de aprovação não listados
    Dado que admin edita allowed_scopes
    Então "approval:decide", "approval:override" NÃO aparecem

  Cenário: Revogar agente com motivo
    Quando admin clica "Revogar" e confirma
    Então badge "REVOGADO" vermelho

  Cenário: Matriz de ações por agente
    Então painel exibe agentes × ações com checkboxes

  Cenário: Política badge colorido no catálogo
    Então DIRECT=verde, CONTROLLED=âmbar, EVENT_ONLY=cinza

  Cenário: Rotação de key com aviso
    Quando admin clica "Rodar chave"
    Então aviso de invalidação imediata + modal de nova key
```

---

## 4. Manifests Vinculados

| Manifest | Tela | Arquivo |
|---|---|---|
| UX-MCP-001 | Gestão de Agentes e Ações MCP | [ux-mcp-001.gestao-agentes.yaml](../../../05_manifests/screens/ux-mcp-001.gestao-agentes.yaml) |

## 5. Regras Críticas

1. API key: UMA VEZ — modal com checkbox
2. allowed_scopes: escopos de aprovação AUSENTES
3. REVOKED: linha desabilitada
4. Rotação: aviso antes de confirmar

---

## 6. DoR ✅ / DoD

**DoR:** Manifest UX-MCP-001 criado, F01 em READY.
**DoD:** Modal de key, escopos filtrados, matriz, rotação, revogação, testes E2E.

---

## 7. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Gestão de agentes + ações, 6 cenários Gherkin, manifest UX-MCP-001. |
| 1.1.0 | 2026-03-19 | Marcos Sulivan | APPROVED em cascata com épico US-MOD-010 v1.2.0. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
