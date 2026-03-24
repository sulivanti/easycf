# US-MOD-007-F03 — API: Motor de Avaliação (Runtime)

**Status Ágil:** `READY`
**Versão:** 1.3.0
**Data:** 2026-03-23
**Módulo Destino:** **MOD-007** (Parametrização Contextual — Backend)
**Referências Normativas:** DOC-DEV-001, DOC-ARC-001, DOC-ARC-003

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-23
- **rastreia_para:** US-MOD-007, US-MOD-007-F01, US-MOD-007-F02, US-MOD-006
- **nivel_arquitetura:** 2 (motor de avaliação, resolução por restritividade, sem cache, integração MOD-006)
- **tipo:** Backend — endpoint de runtime
- **epico_pai:** US-MOD-007
- **manifests_vinculados:** N/A
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **sistema** (chamado pelo MOD-006, pelo frontend e por agentes), quero avaliar quais regras de comportamento se aplicam a um objeto em determinado contexto, retornando campos visíveis, obrigatórios, defaults, domínios e validações de forma coerente e auditada.

---

## 2. Algoritmo de Avaliação

> **Decisão técnica 2026-03-15:** Cache Redis removido do motor inteiro. Todas as chamadas executam ao vivo. Campo `priority` removido — conflitos resolvidos por restritividade.

```
POST /api/v1/routine-engine/evaluate
  body: { object_type, object_id?, context: [{ framer_id }], stage_id? }

PASSO 1: Encontrar regras de incidência ativas
  SELECT ir.* FROM incidence_rules ir
  WHERE ir.framer_id IN (context.framer_ids)
    AND ir.target_object_id = resolve_target(object_type)
    AND ir.status = 'ACTIVE'
    AND (ir.valid_until IS NULL OR ir.valid_until > now())

PASSO 2: Para cada regra → encontrar rotina PUBLISHED vinculada
  JOIN routine_incidence_links + behavior_routines WHERE status='PUBLISHED'

PASSO 3: Avaliar itens de cada rotina (por ordem)
  Para cada routine_item:
    - Avaliar condition_expr (se presente)
    - Acumular resultado por campo

PASSO 4: Resolver conflitos entre rotinas (safety net)
  - Regra mais RESTRITIVA vence: HIDE > SHOW, SET_REQUIRED > SET_OPTIONAL, domínio menor prevalece
  - Campos sem conflito → mesclados (union)

PASSO 5: Construir response
  {
    visible_fields: [...],
    hidden_fields: [...],
    required_fields: [...],
    optional_fields: [...],
    defaults: { field_key: value, ... },
    domain_restrictions: { field_key: { allowed: [...] }, ... },
    validations: [ { field, rule, message, is_blocking } ],
    blocking_validations: [ { field, message, routine_id } ],  ← bloqueia MOD-006
    applied_routines: [ { routine_id, routine_version } ]
  }

PASSO 6: Persistir em domain_events (GAP 4 resolvido)
  SE applied_routines não vazio:
    INSERT domain_events {
      event_type: 'routine.applied',
      entity_type: object_type,
      entity_id: object_id,
      payload: { routines_applied[], context, result_summary },
      correlation_id: X-Correlation-ID,
      sensitivity_level: 0
    }
```

---

## 3. Escopo

### Inclui

- Endpoint `POST /routine-engine/evaluate` (runtime, sem cache)
- Algoritmo de mescla com resolução por restritividade (6 passos)
- Registro de `routine.applied` em domain_events (apenas com efeito)
- Retorno de `blocking_validations` para integração com MOD-006

### Não inclui

- CRUD de enquadradores e regras — US-MOD-007-F01
- CRUD de rotinas e itens — US-MOD-007-F02
- Interfaces de configuração — US-MOD-007-F04, F05
- condition_expr avançada (v2) — roadmap futuro

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Motor de Avaliação de Regras

  Cenário: Avaliação com contexto único
    Dado que enquadrador "SERV-ENG" tem rotina PUBLISHED com itens:
      SHOW projeto_wbs, SET_REQUIRED projeto_wbs, HIDE deposito_id, REQUIRE_EVIDENCE CONTRACT
    Quando POST /routine-engine/evaluate com { object_type: "PEDIDO_VENDA", context: [{ framer_id: serv-eng }] }
    Então response.visible_fields inclui "projeto_wbs"
    E response.required_fields inclui "projeto_wbs"
    E response.hidden_fields inclui "deposito_id"
    E response.validations inclui REQUIRE_EVIDENCE

  Cenário: Dois contextos — mescla sem conflito
    Dado que há 2 rotinas com campos diferentes (sem sobreposição)
    Quando motor avalia com ambos os framers
    Então response combina todos os campos de ambas as rotinas

  Cenário: Dois contextos — conflito resolvido por restritividade (safety net)
    Dado que Rotina-A define projeto_wbs como SET_REQUIRED
    E Rotina-B define projeto_wbs como SET_OPTIONAL
    Quando motor avalia com ambos (exceção: dados legados ou race condition)
    Então response.required_fields inclui projeto_wbs (SET_REQUIRED > SET_OPTIONAL)
    E response inclui applied_routines com ambas as rotinas listadas

  Cenário: blocking_validations bloqueia transição no MOD-006
    Dado que rotina tem item VALIDATION is_blocking=true para campo ncm
    E o caso não tem ncm preenchido no objeto vinculado
    Quando MOD-006 chama /routine-engine/evaluate antes da transição
    Então blocking_validations não vazia
    E MOD-006 retorna 422: "Validação de rotina impediu a transição: {validation_message}"

  Cenário: domain_events registrado com routine.applied
    Dado que motor avaliou e aplicou 2 rotinas
    Quando a avaliação é concluída
    Então domain_events tem: event_type='routine.applied', correlation_id preenchido
    E payload.routines_applied=[{ routine_id, version }]

  Cenário: Motor retorna vazio se nenhuma rotina ativa para o contexto
    Dado que nenhuma incidence_rule ativa liga o framer ao objeto
    Quando POST /routine-engine/evaluate
    Então 200 com response vazio (todos os arrays empty, sem bloqueio)
    E domain_events NÃO é criado (sem incidência = nada a registrar)

  Cenário: Motor é chamado com context vazio
    Dado que context=[{}] (sem framer_id)
    Então 422: "Pelo menos um enquadrador deve ser informado no contexto."

```

---

## 5. Regras Críticas

1. **Sem cache** — todas as chamadas executam ao vivo (decisão 2026-03-15: consistência > performance)
2. **domain_events só para avaliações com efeito** — response vazio não gera evento
3. **blocking_validations**: integração com MOD-006 — transição bloqueada com 422 específico
4. **X-Correlation-ID propagado** ao domain_event de routine.applied
5. **condition_expr**: ignorado em v1 (motor aplica todos os itens sem condição)
6. **Conflitos runtime**: safety net — regra mais restritiva vence (HIDE > SHOW, SET_REQUIRED > SET_OPTIONAL)

---

## 6. Definition of Ready (DoR) ✅

- [x] F01 e F02 em READY (enquadradores, rotinas e itens)
- [x] Pelo menos 2 rotinas PUBLISHED com itens para teste
- [x] Algoritmo de 6 passos documentado
- [x] Gherkin com 7 cenários (cache removido)
- [x] Owner confirmar READY → APPROVED (2026-03-19)

## 7. Definition of Done (DoD)

- [ ] Algoritmo de mescla testado com conflito por restritividade (safety net)
- [ ] blocking_validations testado com integração MOD-006
- [ ] domain_events gerado para avaliações com efeito
- [ ] Response vazio sem domain_events
- [ ] Evidências documentadas (PR/issue)

---

## 8. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Motor de avaliação runtime, 8 cenários Gherkin, cache Redis, domain events. |
| 1.1.0 | 2026-03-18 | Marcos Sulivan | Alinha com épico v1.1.0: remove cache Redis, remove campo priority do algoritmo e response, substitui resolução por prioridade por resolução por restritividade (safety net), remove cenário de cache. |
| 1.2.0 | 2026-03-19 | Marcos Sulivan | Revisão final e promoção READY → APPROVED. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
