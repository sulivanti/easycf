# US-MOD-009-F01 — API: Regras de Controle e Alçada

**Status Ágil:** `APPROVED`
**Versão:** 1.0.0
**Data:** 2026-03-15
**Módulo Destino:** **MOD-009** (Aprovações e Alçadas — Backend)
**Referências Normativas:** DOC-DEV-001, DOC-ARC-001

## Metadados de Governança

- **status_agil:** APPROVED
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-009, US-MOD-007, US-MOD-004, DOC-ARC-001
- **nivel_arquitetura:** 2 (alçadas hierárquicas, escalada, segregação de funções)
- **tipo:** Backend — cria novos endpoints
- **epico_pai:** US-MOD-009
- **manifests_vinculados:** N/A
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **administrador de governança**, quero definir quais operações em quais objetos são controladas (e por quais origens), e configurar as alçadas hierárquicas de aprovação com timeouts e escaladas, para que o motor de controle saiba exatamente o que bloquear e quem deve aprovar.

---

## 2. Combinação de Critérios de Alçada

```
Exemplo: Pedido de Venda com valor > R$ 50.000
  Nível 1 → Aprovador: ROLE=gerente_comercial  (timeout: 24h → escala para nível 2)
  Nível 2 → Aprovador: ORG_LEVEL=N2           (timeout: 48h → sem escalada → TIMEOUT status)
```

---

## 3. Escopo

### Inclui

- CRUD de Regras de Controle de Gravação (object_type, operation_type, origin_types, valor, prioridade, vigência)
- CRUD de Regras de Alçada com níveis em cadeia (approver_type, timeout, escalada)
- Validação: `allow_self_approve` default false — controle de auto-aprovação por suficiência de escopo (ver épico §3.1)
- Prioridade e vigência respeitadas pelo motor

### Não inclui

- Motor de controle (interceptação) — US-MOD-009-F02
- Inbox e execução — US-MOD-009-F03
- Interfaces UX — US-MOD-009-F04, F05

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Regras de Controle e Alçada

  Cenário: Criar regra de controle por origem API
    Quando POST /admin/control-rules com {
      codigo: "RCG-API-INTEGRACAO", object_type: "integration_call",
      operation_type: "EXECUTE", origin_types: ["API", "MCP", "AGENT"],
      priority: 10, valid_from: hoje
    }
    Então 201 com regra criada, status=ACTIVE
    E evento approval.control_rule_created emitido

  Cenário: Criar regra por valor com alçada em dois níveis
    Dado que regra "RCG-PEDIDO-VALOR" tem value_field=valor, value_threshold=50000
    Quando POST /admin/control-rules/:id/approval-rules com { level: 1, approver_type: "ROLE", approver_ref: "uuid-gerente", timeout_hours: 24 }
    E POST /admin/control-rules/:id/approval-rules com { level: 2, approver_type: "ORG_LEVEL", approver_ref: "N2", timeout_hours: 48 }
    Então regra de alçada em 2 níveis criada

  Cenário: allow_self_approve controlado por admin
    Quando POST /admin/approval-rules com { allow_self_approve: true }
    Então regra criada com allow_self_approve=true
    E auto-aprovação por suficiência de escopo habilitada para esta alçada (ver épico §3.1)

  Cenário: Regra com priority menor avaliada primeiro
    Dado que há 2 regras ACTIVE para o mesmo object_type com prioridades 10 e 50
    Quando motor avalia
    Então regra de priority=10 é avaliada primeiro

  Cenário: Regra com valid_until expirada não é avaliada
    Dado que regra tem valid_until = ontem
    Quando motor avalia
    Então regra não é considerada (fora de vigência)

  Cenário: escalation_rule_id referencia outro nível da mesma regra
    Dado que nível 1 tem escalation_rule_id apontando para nível 2
    Quando nível 1 faz timeout
    Então approval_instance nível 1 recebe status=ESCALATED
    E nova approval_instance criada para nível 2

  Cenário: RBAC: scope obrigatório para configurar regras
    Dado que caller não tem approval:rule:write
    Quando POST /admin/control-rules
    Então 403 RFC 9457
```

---

## 5. Domain Events

| event_type | sensitivity_level |
|---|---|
| `approval.control_rule_created` | 0 |
| `approval.control_rule_updated` | 0 |
| `approval.approval_rule_created` | 0 |

---

## 6. Regras Críticas

1. `allow_self_approve` default false — quando true, habilita auto-aprovação por suficiência de escopo (ver épico §3.1). Validação no service.
2. `priority` — menor = maior precedência (igual ao MOD-007)
3. `valid_from`/`valid_until` — vigência respeitada pelo motor a cada avaliação
4. Escalada: `escalation_rule_id` deve apontar para `approval_rules.level > level_atual`
5. `codigo` imutável após criação

---

## 7. Definition of Ready (DoR) ✅

- [x] Modelo definido (movement_control_rules, approval_rules)
- [x] 4 critérios de alçada documentados
- [x] Gherkin com 7 cenários
- [x] Owner confirmar READY → APPROVED (cascata do épico 2026-03-19)

## 8. Definition of Done (DoD)

- [ ] Alçada em cadeia testada (1 e 2 níveis)
- [ ] Timeout e escalada testados
- [ ] allow_self_approve bloqueado
- [ ] Vigência respeitada
- [ ] Evidências documentadas (PR/issue)

---

## 9. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Regras de Controle + Alçada, 7 cenários Gherkin, domain events. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
