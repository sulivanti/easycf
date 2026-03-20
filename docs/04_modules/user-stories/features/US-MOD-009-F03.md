# US-MOD-009-F03 — API: Inbox de Aprovações, Execução e Override

**Status Ágil:** `APPROVED`
**Versão:** 1.0.0
**Data:** 2026-03-15
**Módulo Destino:** **MOD-009** (Aprovações e Alçadas — Backend)
**Referências Normativas:** DOC-DEV-001, DOC-ARC-001, DOC-ARC-003

## Metadados de Governança

- **status_agil:** APPROVED
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-009, US-MOD-009-F01, US-MOD-009-F02, DOC-ARC-001
- **nivel_arquitetura:** 2 (cadeia de aprovação, segregação, override auditado, rastreabilidade)
- **tipo:** Backend — cria novos endpoints
- **epico_pai:** US-MOD-009
- **manifests_vinculados:** N/A
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **aprovador**, quero um inbox com todos os movimentos pendentes para minha decisão, onde posso aprovar ou reprovar com parecer, e como **gestor de governança**, quero poder fazer override documentado em situações excepcionais.

---

## 2. Escopo

### Inclui
- Inbox do aprovador (`GET /my/approvals`) filtrado por alçada pessoal
- Aprovação e reprovação com parecer obrigatório
- Cadeia de aprovação em níveis (nível 1 aprovado → nível 2 criado)
- Segregação de funções: solicitante ≠ aprovador (validação no service). Exceção: auto-aprovação por suficiência de escopo (ver épico §3.1)
- Cancelamento de movimento pelo solicitante (apenas em PENDING_APPROVAL)
- Override com justificativa obrigatória (min 20 chars) + scope especial
- Execução do movimento após aprovação do último nível
- Registro de falha de execução com possibilidade de reprocessamento
- Rastreabilidade integral em `movement_history`

### Não inclui
- Regras de controle e alçada — US-MOD-009-F01
- Motor de interceptação — US-MOD-009-F02
- Interfaces UX — US-MOD-009-F04, F05

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Inbox de Aprovações, Execução e Override

  # ── Inbox do Aprovador ───────────────────────────────────────
  Cenário: Aprovador vê apenas movimentos do seu perfil
    Dado que João é ROLE=gerente_comercial
    E existem 3 movimentos: 2 para gerente_comercial, 1 para diretoria
    Quando GET /my/approvals
    Então João vê apenas os 2 movimentos da sua alçada

  Cenário: Inbox retorna detalhes suficientes para decisão
    Quando GET /my/approvals/:approvalId
    Então response inclui: movimento, operação, payload sanitizado, prazo, nível atual

  # ── Decisão de Aprovação ─────────────────────────────────────
  Cenário: Aprovar movimento nível 1 de 2 avança para nível 2
    Quando POST /my/approvals/:approvalId/approve com { parecer }
    Então approval_instances nível 1: status=APPROVED
    E movement.current_approval_level = 2
    E nova approval_instances criada para nível 2

  Cenário: Aprovar movimento de nível único executa operação
    Dado que alçada tem apenas 1 nível e aprovador aprova
    Então movement.status=APPROVED → EXECUTED
    E domain_event: movement.executed emitido

  Cenário: Solicitante sem scope suficiente não pode aprovar o próprio movimento
    Dado que solicitante_id = aprovador_id
    E solicitante NÃO possui o required_scope da alçada
    Quando POST /my/approvals/:approvalId/approve
    Então 422: "O solicitante não pode aprovar o próprio movimento (segregação de funções)."

  Cenário: Auto-aprovação por suficiência de escopo não passa pelo inbox
    Dado que solicitante possui o required_scope exigido pela alçada
    E allow_self_approve=true na approval_rule
    Quando motor cria o movimento
    Então movimento é auto-aprovado sem aparecer no inbox
    E movement_history registra AUTO_APPROVED_BY_SCOPE

  Cenário: Reprovar movimento encerra a cadeia
    Quando POST /my/approvals/:approvalId/reject com { parecer }
    Então movement.status=REJECTED
    E domain_event: movement.rejected emitido

  # ── Cancelamento pelo Solicitante ────────────────────────────
  Cenário: Solicitante cancela movimento pendente
    Quando POST /movements/:id/cancel com { motivo }
    Então movement.status=CANCELLED

  Cenário: Cancelamento não permitido após APPROVED
    Dado que movement.status=APPROVED
    Então 422: "Movimentos aprovados não podem ser cancelados."

  # ── Override ─────────────────────────────────────────────────
  Cenário: Override com justificativa obrigatória
    Dado que usuário tem scope approval:override
    Quando POST /movements/:id/override com { justificativa (min 20 chars) }
    Então operação executada, movement.status=OVERRIDDEN
    E INSERT movement_override_log
    E domain_event: movement.overridden emitido

  Cenário: Override sem justificativa suficiente bloqueado
    Dado que justificativa tem menos de 20 chars
    Então 422: "A justificativa deve ter ao menos 20 caracteres."

  # ── Execução do Movimento ─────────────────────────────────────
  Cenário: Execução falha registra retry disponível
    Dado que execução retornou erro
    Então movement_executions.result=FAILED
    E movement.status=FAILED
```

---

## 4. Domain Events

| event_type | sensitivity_level |
|---|---|
| `movement.approved` | 1 |
| `movement.rejected` | 1 |
| `movement.executed` | 1 |
| `movement.failed` | 1 |
| `movement.cancelled` | 1 |
| `movement.overridden` | 1 |
| `movement.escalated` | 1 |
| `movement.timeout` | 1 |

---

## 5. Regras Críticas

1. **Segregação de funções**: `decided_by != movement.requested_by` — validação no service. Exceção: auto-aprovação por suficiência de escopo (ver épico §3.1)
2. **Override**: `justificativa` mín 20 chars; `movement_override_log` imutável após criação
3. **Cadeia de aprovação**: nível 1 aprovado → nível 2 criado automaticamente
4. **Execução**: somente após último nível da cadeia APPROVED
5. **Cancelamento**: só em PENDING_APPROVAL — impossível após APPROVED/EXECUTED
6. **Rastreabilidade integral**: TODOS os eventos em `movement_history`

---

## 6. Definition of Ready (DoR) ✅

- [x] F01 e F02 em READY
- [x] Notification queue configurada
- [x] Gherkin com 11 cenários
- [x] Owner confirmar READY → APPROVED (cascata do épico 2026-03-19)

## 7. Definition of Done (DoD)

- [ ] Cadeia de aprovação testada (1 e 2 níveis)
- [ ] Segregação testada
- [ ] Override auditado
- [ ] Cancelamento e timeout testados
- [ ] Rastreabilidade completa em movement_history
- [ ] Evidências documentadas (PR/issue)

---

## 8. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Inbox + Execução + Override, 11 cenários Gherkin, domain events. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
