# US-MOD-009-F02 — API: Motor de Controle

**Status Ágil:** `READY`
**Versão:** 1.0.0
**Data:** 2026-03-15
**Módulo Destino:** **MOD-009** (Aprovações e Alçadas — Backend)
**Referências Normativas:** DOC-DEV-001, DOC-ARC-001

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-009, US-MOD-009-F01, DOC-ARC-001
- **nivel_arquitetura:** 2 (motor síncrono, avaliação de regras, criação de movimentos)
- **tipo:** Backend — endpoint de runtime
- **epico_pai:** US-MOD-009
- **manifests_vinculados:** N/A
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **sistema**, quero um motor que interpreta tentativas de operação crítica, avalia as regras de controle ativas e decide imediatamente se a operação pode executar livremente ou deve ser bloqueada e convertida em movimento controlado.

---

## 2. Algoritmo do Motor

```
POST /api/v1/movement-engine/evaluate
  body: { object_type, operation_type, origin_type, requested_by, operation_payload, operation_value, context }

MOTOR:
  [1] Buscar regras ACTIVE ordenadas por priority
  [2] Para cada regra: avaliar critério de valor e origem
  [3] Se nenhuma regra incide → { controlled: false }
  [4] Se alguma regra incide → INSERT controlled_movements + approval_instances nível 1
      → { controlled: true, movement_id, status: "PENDING_APPROVAL" }
```

---

## 3. Escopo

### Inclui

- Endpoint `POST /movement-engine/evaluate` (síncrono)
- Avaliação de regras por prioridade, valor, origem e vigência
- Criação de `controlled_movements` e `approval_instances` nível 1
- Disparo de notificação via domain_event `movement.created`
- X-Correlation-ID propagado ao movimento

### Não inclui

- Regras de controle e alçada (configuração) — US-MOD-009-F01
- Inbox e decisão de aprovação — US-MOD-009-F03

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Motor de Controle de Movimentos

  Cenário: Operação livre — nenhuma regra incide
    Dado que não há regra ACTIVE para object_type=comentario + operation_type=CREATE
    Quando POST /movement-engine/evaluate
    Então response: { controlled: false }

  Cenário: Operação controlada por origem API
    Dado que regra ACTIVE tem origin_types=["API"] para object_type=integration_call
    Quando motor avalia com origin_type=API
    Então controlled_movements criado com status=PENDING_APPROVAL
    E response: { controlled: true, movement_id }

  Cenário: Operação controlada por valor
    Dado que regra tem value_threshold=50000 e operation_value=75000
    Quando motor avalia
    Então movement criado — valor excede o threshold

  Cenário: Operação não controlada por valor abaixo do threshold
    Dado que value_threshold=50000 e operation_value=30000
    Quando motor avalia
    Então controlled=false

  Cenário: Regra com origin_types=["HUMAN","API"] controla ambas origens
    Quando motor avalia com origin_type=HUMAN e com origin_type=API
    Então ambas geram controlled_movements

  Cenário: movement.created dispara notificação aos aprovadores do nível 1
    Dado que alçada nível 1 tem aprovador ROLE=gerente
    Quando domain_event movement.created é emitido
    Então notification queue recebe mensagem para aprovadores

  Cenário: Múltiplas regras — apenas a de menor priority incide
    Dado que há 2 regras com priority=10 e priority=50
    Quando motor avalia
    Então apenas priority=10 gera o movimento

  Cenário: X-Correlation-ID propagado ao movimento
    Dado que request tem header X-Correlation-ID="abc-123"
    Quando motor cria o controlled_movement
    Então controlled_movements.correlation_id = "abc-123"
```

---

## 5. Domain Events

| event_type | sensitivity_level |
|---|---|
| `movement.created` | 1 |
| `movement.cancelled` | 1 |

---

## 6. Regras Críticas

1. **controlled=false → módulo executor age normalmente**
2. **controlled=true → módulo executor NÃO executa** — retorna 202
3. **Múltiplas regras**: apenas a de menor `priority` que incide gera o movimento
4. **X-Correlation-ID**: propagado ao `controlled_movements` e ao `domain_event`
5. **Motor é síncrono**: responde imediatamente — notificação é assíncrona

---

## 7. Definition of Ready (DoR) ✅

- [x] F01 em READY (regras configuradas)
- [x] Algoritmo do motor documentado
- [x] Gherkin com 8 cenários
- [x] Owner confirmar READY → APPROVED (cascata do épico 2026-03-19)

## 8. Definition of Done (DoD)

- [ ] Motor testado para todos os critérios (valor, origem, objeto)
- [ ] Múltiplas regras testadas (prioridade)
- [ ] correlation_id propagado
- [ ] Notificação disparada via domain_event
- [ ] Evidências documentadas (PR/issue)

---

## 9. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Motor de controle síncrono, 8 cenários Gherkin, domain events. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
