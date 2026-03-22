# US-MOD-006-F01 — API: Abertura de Caso e Motor de Transição

**Status Ágil:** `APPROVED`
**Versão:** 1.1.0
**Data:** 2026-03-18
**Módulo Destino:** **MOD-006** (Execução de Casos — Backend)
**Referências Normativas:** DOC-DEV-001, DOC-ARC-001, DOC-ARC-003

## Metadados de Governança

- **status_agil:** APPROVED
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-18
- **rastreia_para:** US-MOD-006, US-MOD-005-F01, US-MOD-005-F02, DOC-ARC-001, DOC-ARC-003
- **nivel_arquitetura:** 2 (domínio rico, transições com invariantes, audit trail completo)
- **tipo:** Backend — cria novos endpoints
- **epico_pai:** US-MOD-006
- **manifests_vinculados:** N/A
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **usuário operacional**, quero abrir um caso vinculado a um ciclo de processo publicado e movê-lo entre estágios, respeitando as regras de gates e papéis definidas no blueprint, para que o progresso seja rastreável e controlado.

---

## 2. Sequência do Motor de Transição

```
POST /api/v1/cases/:id/transition
  body: { transition_id, evidence?, motivo? }

MOTOR (executa em ordem, para no primeiro erro):

  [1] Caso existe e status = OPEN?
        → NÃO: 422 "Caso não está aberto."

  [2] A transição existe no blueprint e parte do current_stage?
        → NÃO: 422 "Transição inválida para o estágio atual."

  [3] O usuário tem o papel permitido pela transição (allowed_roles)?
        → NÃO: 403 "Seu papel não autoriza esta transição."

  [4] Todos os gate_instances required=true do current_stage têm status=RESOLVED?
        → NÃO: 422 "Gate '{nome}' não foi resolvido."
                extensions: { pending_gates: [{ id, nome, gate_type }] }

  [5] Se transition.evidence_required=true → evidence foi fornecida no body?
        → NÃO: 422 "Esta transição requer evidência (nota ou arquivo)."

  [OK] Executa transição:
    a) INSERT stage_history (from=current, to=next, transition_id, transitioned_by, evidence)
    b) UPDATE case_instances SET current_stage_id = to_stage_id
    c) Se to_stage.is_terminal → UPDATE status = COMPLETED, completed_at = now()
    d) INSERT case_events (event_type=STAGE_TRANSITIONED, metadata={from, to, transition_name})
    e) Emite domain_event: case.stage_transitioned
    f) Cria gate_instances PENDING para todos os gates do novo estágio
```

---

## 3. Escopo

### Inclui

- Abertura de caso vinculado a ciclo PUBLISHED com freeze do `cycle_version_id`
- Geração automática de `codigo` (padrão `CASO-{YYYY}-{SEQ5}`)
- Criação automática de `gate_instances` PENDING ao entrar em estágio
- Motor de transição com validação sequencial (5 passos)
- Controles do caso: ON_HOLD, RESUME, CANCEL
- Transição para estágio terminal completa o caso automaticamente
- Domain events para todas as operações

### Não inclui

- Resolução de gates (aprovação, documento, checklist) — US-MOD-006-F02
- Atribuição e reatribuição de responsáveis — US-MOD-006-F02
- Registro de eventos avulsos — US-MOD-006-F02
- Interface do painel de caso — US-MOD-006-F03
- Listagem de casos — US-MOD-006-F04

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: API Abertura de Caso e Motor de Transição

  # ── Abertura ─────────────────────────────────────────────────
  Cenário: Abrir caso em ciclo PUBLISHED
    Dado que existe ciclo com status=PUBLISHED e estágio inicial definido
    Quando POST /api/v1/cases com { cycle_id, tenant_id, org_unit_id?, object_type?, object_id? }
    Então status 201 com case_instance criada
    E current_stage_id = estágio is_initial do ciclo
    E cycle_version_id = id do ciclo vigente (freeze)
    E gate_instances PENDING criadas para todos os gates do estágio inicial
    E stage_history registra abertura (from_stage_id=null, to_stage_id=inicial)
    E evento case.opened emitido

  Cenário: Rejeitar abertura em ciclo não-PUBLISHED
    Dado que ciclo tem status=DRAFT ou DEPRECATED
    Quando POST /api/v1/cases com esse cycle_id
    Então 422: "Apenas ciclos publicados podem ter novos casos abertos."

  Cenário: codigo gerado automaticamente e único
    Dado que a instância é criada
    Então codigo segue padrão: "CASO-{YYYY}-{SEQ5}" (ex: CASO-2026-00042)
    E é único na plataforma

  # ── Motor de Transição ───────────────────────────────────────
  Cenário: Transição bem-sucedida sem gates pendentes
    Dado que todos os gates required do estágio atual estão RESOLVED
    E o usuário tem papel com allowed_role na transição
    Quando POST /cases/:id/transition com { transition_id }
    Então stage_history registra a transição
    E current_stage_id é atualizado para o novo estágio
    E gate_instances PENDING criadas para gates do novo estágio
    E evento case.stage_transitioned emitido

  Cenário: Motor bloqueia com gate APPROVAL pending
    Dado que estágio atual tem gate "Aprovação Gerencial" APPROVAL required=true com status=PENDING
    Quando POST /cases/:id/transition
    Então 422: "Gate 'Aprovação Gerencial' não foi resolvido."
    E extensions.pending_gates = [{ id, nome, gate_type: "APPROVAL" }]
    E current_stage_id permanece inalterado

  Cenário: Motor bloqueia sem papel autorizado
    Dado que transição tem allowed_roles=["APROVADOR"] e o usuário é "RESPONSAVEL"
    Quando POST /cases/:id/transition
    Então 403: "Seu papel (Responsável) não autoriza esta transição."

  Cenário: Transição exige evidência não fornecida
    Dado que stage_transition tem evidence_required=true
    Quando POST /cases/:id/transition sem campo evidence no body
    Então 422: "Esta transição requer evidência (nota ou arquivo)."

  Cenário: Transição para estágio terminal completa o caso
    Dado que to_stage.is_terminal=true
    Quando transição é executada
    Então case.status=COMPLETED e completed_at=now()
    E evento case.completed emitido

  Cenário: Gate INFORMATIVE nunca bloqueia transição
    Dado que único gate do estágio é INFORMATIVE required=true com status=PENDING
    Quando POST /cases/:id/transition
    Então motor NÃO é bloqueado pelo gate INFORMATIVE
    E transição ocorre normalmente

  # ── Controles do Caso ───────────────────────────────────────
  Cenário: Colocar caso em espera (ON_HOLD)
    Dado que caso está OPEN
    Quando POST /cases/:id/hold com { motivo }
    Então case.status=ON_HOLD
    E case_events registra: event_type=ON_HOLD, descricao=motivo
    E event: case.on_hold emitido

  Cenário: Retomar caso em espera
    Dado que caso está ON_HOLD
    Quando POST /cases/:id/resume
    Então case.status=OPEN
    E case_events: event_type=RESUMED

  Cenário: Cancelar caso com motivo obrigatório
    Dado que caso está OPEN ou ON_HOLD
    Quando POST /cases/:id/cancel com { motivo }
    Então case.status=CANCELLED, cancelled_at=now(), cancellation_reason=motivo
    E event: case.cancelled emitido

  # ── Ciclo frozen ────────────────────────────────────────────
  Cenário: Fork do ciclo não afeta casos em andamento
    Dado que o ciclo v1 tem caso aberto com current_stage_id=estágio-A
    Quando ciclo v1 é forked para v2 e estágio-A é renomeado em v2
    Então GET /cases/:id ainda mostra estágio-A com nome original
    E cycle_version_id do caso ainda aponta para v1
```

---

## 5. Domain Events

| event_type | sensitivity_level |
|---|---|
| `case.opened` | 1 |
| `case.stage_transitioned` | 1 |
| `case.completed` | 1 |
| `case.cancelled` | 1 |
| `case.on_hold` | 1 |
| `case.resumed` | 1 |

---

## 6. Regras Críticas

1. **cycle_version_id freeze**: capturado no momento de abertura — imutável após isso
2. **Gate INFORMATIVE**: nunca bloqueia motor, mesmo com required=true
3. **gate_instances**: criadas automaticamente ao entrar em novo estágio (um registro por gate do estágio)
4. **Estágio terminal**: transição para is_terminal=true → status=COMPLETED automático
5. **Idempotência em POST /cases**: Idempotency-Key com TTL 60s
6. **X-Correlation-ID** obrigatório em todos os domain events

---

## 7. Definition of Ready (DoR) ✅

- [x] MOD-005 em READY (blueprint de ciclos, estágios, gates, transições)
- [x] Motor de transição com 5 passos de validação documentado
- [x] Modelo de dados (case_instances, stage_history) definido
- [x] Gherkin com 13 cenários cobrindo abertura, motor, controles e freeze
- [x] Owner confirmar READY → APPROVED ✅ (2026-03-18)

## 8. Definition of Done (DoD)

- [ ] Motor testado com todos os cenários de bloqueio (gate, papel, evidence)
- [ ] Freeze do cycle_version_id validado com fork
- [ ] gate_instances auto-criadas ao entrar em estágio
- [ ] Transição para terminal completa caso automaticamente
- [ ] Idempotency-Key funcional
- [ ] Evidências documentadas (PR/issue)

---

## 9. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Abertura de caso + motor de transição, 13 cenários Gherkin, domain events. |
| 1.1.0 | 2026-03-18 | Marcos Sulivan | Revisão final e promoção para APPROVED. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
