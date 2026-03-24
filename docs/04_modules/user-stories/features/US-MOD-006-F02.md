# US-MOD-006-F02 — API: Gates, Responsáveis e Eventos

**Status Ágil:** `READY`
**Versão:** 0.9.0
**Data:** 2026-03-23
**Módulo Destino:** **MOD-006** (Execução de Casos — Backend)
**Referências Normativas:** DOC-DEV-001, DOC-ARC-001

## Metadados de Governança

- **status_agil:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-23
- **rastreia_para:** US-MOD-006, US-MOD-006-F01, US-MOD-004-F02, US-MOD-000-F06
- **nivel_arquitetura:** 2 (resolução de gates, atribuições com vigência, audit trail)
- **tipo:** Backend — cria novos endpoints
- **epico_pai:** US-MOD-006
- **manifests_vinculados:** N/A
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **usuário com papel no processo**, quero resolver gates, registrar eventos e gerenciar as atribuições de responsáveis, mantendo um histórico auditável de tudo que aconteceu no caso — mesmo quando não há mudança de estágio.

---

## 2. Escopo

### Inclui

- Resolução de gates por tipo (APPROVAL com decisão, DOCUMENT com upload, CHECKLIST com itens)
- Dispensa de gate obrigatório (waive) com escopo especial e motivo auditado
- Atribuição e reatribuição de responsáveis por papel do estágio
- Atribuição via delegação MOD-004 com expiração automática
- Atribuição temporária com `valid_until`
- Registro de eventos avulsos (COMMENT, EXCEPTION, REOPENED, EVIDENCE, etc.)
- Endpoint de timeline intercalando os 3 históricos cronologicamente
- Validação: papel required=true sem atribuição bloqueia motor de transição

### Não inclui

- Motor de transição e abertura de caso — US-MOD-006-F01
- Interface do painel de caso — US-MOD-006-F03
- Listagem de casos — US-MOD-006-F04
- Criação de gates no blueprint — US-MOD-005-F02

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: API Gates, Responsáveis e Eventos

  # ── Resolução de Gates ───────────────────────────────────────
  Cenário: Resolver gate APPROVAL com decisão APPROVED
    Dado que gate_instance tem status=PENDING e gate_type=APPROVAL
    E o usuário tem papel com can_approve=true atribuído ao estágio
    Quando POST /cases/:id/gates/:gateId/resolve com { decision: "APPROVED", parecer: "..." }
    Então gate_instance.status=RESOLVED, decision=APPROVED, resolved_by=user.id, resolved_at=now()
    E evento case.gate_resolved emitido
    E se TODOS os gates required=true estão RESOLVED → Motor habilita transições disponíveis

  Cenário: Resolver gate APPROVAL com REJECTED
    Dado que usuário com can_approve=true chama resolve com { decision: "REJECTED", parecer }
    Então gate_instance.status=RESOLVED, decision=REJECTED
    E case_events registra: event_type=EXCEPTION, metadata={ gate_id, decision: "REJECTED", parecer }
    E Motor NÃO avança automaticamente (reprovação não transita o caso)

  Cenário: Resolver gate DOCUMENT com arquivo
    Dado que gate_type=DOCUMENT e required=true
    Quando POST /cases/:id/gates/:gateId/resolve com { evidence: { type: "file", url, filename } }
    Então gate_instance.status=RESOLVED, evidence salvo
    E evento case.gate_resolved emitido

  Cenário: Resolver gate CHECKLIST com todos os itens marcados
    Dado que gate_type=CHECKLIST com 3 itens
    Quando POST resolve com { checklist_items: [{ id: 1, checked: true }, ...todos true] }
    Então status=RESOLVED
    Quando POST resolve com item não marcado
    Então 422: "Todos os itens do checklist são obrigatórios."

  Cenário: Dispensar gate obrigatório (waive) requer escopo especial
    Dado que gate required=true está PENDING
    E usuário tem scope process:case:gate_waive
    Quando POST /cases/:id/gates/:gateId/waive com { motivo }
    Então gate_instance.status=WAIVED
    E case_events: event_type=EXCEPTION, metadata={ gate_id, waived_by, motivo }
    E aviso: "Gate dispensado ficará registrado para auditoria."

  Cenário: Rejeitar resolução de gate por usuário sem can_approve
    Dado que gate_type=APPROVAL e usuário tem papel RESPONSAVEL (can_approve=false)
    Quando POST /cases/:id/gates/:gateId/resolve com decision=APPROVED
    Então 403: "Seu papel não possui poder decisório para gates de aprovação."

  # ── Atribuição de Responsáveis ───────────────────────────────
  Cenário: Atribuir responsável a papel do estágio atual
    Dado que estágio tem papel RESPONSAVEL vinculado (stage_role_links)
    Quando POST /cases/:id/assignments com { process_role_id, user_id, stage_id }
    Então case_assignments criada com is_active=true
    E evento case.assignment_created emitido

  Cenário: Reatribuir responsável — desativa anterior
    Dado que papel RESPONSAVEL já tem atribuição ativa para user-A
    Quando POST /cases/:id/assignments com user_id=user-B para o mesmo papel
    Então atribuição de user-A: is_active=false, substitution_reason registrado
    E nova atribuição para user-B: is_active=true
    E case_events: event_type=REASSIGNED, metadata={from: user-A, to: user-B, role: RESPONSAVEL}

  Cenário: Atribuição via delegação MOD-004
    Dado que user-B tem access_delegation ativa de user-A
    E a delegação inclui escopos compatíveis com o papel APOIO
    Quando POST /cases/:id/assignments com { user_id: user-B, delegation_id: uuid }
    Então case_assignments criada com delegation_id preenchido
    E expires automaticamente quando access_delegation expirar

  Cenário: Atribuição com vigência temporária
    Dado que atribuição é criada com valid_until = 3 dias
    Quando os 3 dias passam (background job ou na próxima verificação)
    Então is_active=false e case_events: event_type=REASSIGNED (auto-expirado)

  Cenário: Papel required=true sem atribuição bloqueia transição
    Dado que stage_role_links tem papel RESPONSAVEL required=true
    E não há case_assignment ativa para RESPONSAVEL neste estágio
    Quando POST /cases/:id/transition
    Então 422: "O papel 'Responsável' é obrigatório neste estágio e não foi atribuído."

  # ── Eventos Avulsos ──────────────────────────────────────────
  Cenário: Registrar comentário no caso
    Dado que usuário tem process:case:write
    Quando POST /cases/:id/events com { event_type: "COMMENT", descricao: "Aguardando contato..." }
    Então case_events criado com current stage_id, created_by, created_at
    E NOT altera current_stage_id do caso

  Cenário: Registrar reabertura com motivo
    Dado que caso está COMPLETED (excepcionalmente, com escopo especial)
    Quando POST /cases/:id/events com { event_type: "REOPENED", descricao: "Correção necessária" }
    Então case.status=OPEN
    E case_events: event_type=REOPENED
    E case.completed_at=null

  Cenário: Timeline intercala os 3 históricos
    Dado que caso tem: 2 transições (stage_history), 1 gate resolvido (gate_instances), 3 comentários (case_events)
    Quando GET /cases/:id/timeline
    Então retorna array ordenado por timestamp com todos os 6 eventos
    E cada item tem: type (STAGE_CHANGE | GATE_RESOLVED | EVENT), timestamp, actor, descrição
```

---

## 4. Domain Events

| event_type | sensitivity_level |
|---|---|
| `case.gate_resolved` | 1 |
| `case.gate_waived` | 1 |
| `case.assignment_created` | 1 |
| `case.assignment_replaced` | 1 |
| `case.event_recorded` | 1 |

---

## 5. GET /cases/:id/timeline — Estrutura da Resposta

```json
{
  "case_id": "uuid",
  "timeline": [
    {
      "type": "STAGE_CHANGE",
      "timestamp": "2026-03-10T09:00:00Z",
      "actor": { "id": "uuid", "name": "João Silva" },
      "from_stage": { "codigo": "RASCUNHO", "nome": "Rascunho" },
      "to_stage": { "codigo": "EM_ANALISE", "nome": "Em Análise" },
      "transition": { "nome": "Enviar para análise" },
      "evidence": null
    },
    {
      "type": "GATE_RESOLVED",
      "timestamp": "2026-03-11T14:30:00Z",
      "actor": { "id": "uuid", "name": "Maria Gestora" },
      "gate": { "nome": "Aprovação Gerencial", "gate_type": "APPROVAL" },
      "decision": "APPROVED",
      "parecer": "Aprovado conforme critérios."
    },
    {
      "type": "EVENT",
      "timestamp": "2026-03-12T10:00:00Z",
      "actor": { "id": "uuid", "name": "Carlos Analista" },
      "event_type": "COMMENT",
      "descricao": "Cliente confirmou os dados."
    }
  ]
}
```

---

## 6. Regras Críticas

1. **Gate APPROVAL**: apenas papel com `can_approve=true` pode resolver (403 caso contrário)
2. **Gate waive**: escopo `process:case:gate_waive` obrigatório — ação auditada em case_events
3. **Reatribuição**: sempre desativa o anterior antes de criar o novo — sem atribuições duplas ativas
4. **Role required=true**: bloqueia motor de transição se sem atribuição ativa
5. **Reabertura**: requer escopo especial; zera completed_at; registra evento
6. **Timeline**: ordenação estritamente por timestamp — os 3 históricos intercalados
7. **delegation_id**: se atribuição derivada de delegação MOD-004, expirar automaticamente com a delegação

---

## 7. Definition of Ready (DoR) ✅

- [x] F01 em READY (depende de motor de transição e abertura)
- [x] `process_roles` seed criado (RESPONSAVEL, APROVADOR, APOIO, CONSULTA, AUDITOR)
- [x] Gherkin com 14 cenários cobrindo gates, responsáveis, eventos e timeline
- [x] Estrutura da timeline JSON documentada
- [x] Owner confirmar READY → APPROVED ✅ (2026-03-18)

## 8. Definition of Done (DoD)

- [ ] Todos os cenários Gherkin cobertos por testes
- [ ] Timeline testado com 3 históricos intercalados
- [ ] Gate waive auditado em case_events
- [ ] Reatribuição desativa anterior automaticamente
- [ ] Atribuição via delegação expira com delegação
- [ ] Evidências documentadas (PR/issue)

---

## 9. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Gates + Responsáveis + Eventos + Timeline, 14 cenários Gherkin, domain events. |
| 1.1.0 | 2026-03-18 | Marcos Sulivan | Revisão final e promoção para APPROVED. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
