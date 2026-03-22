# US-MOD-011-F01 — Amendment: current_record_state no Motor de Avaliação (MOD-007-F03)

**Status Ágil:** `APPROVED`
**Versão:** 1.1.0
**Data:** 2026-03-19
**Módulo Destino:** **MOD-011** → impacto em **MOD-007** (Backend — Amendment)
**Referências Normativas:** DOC-DEV-001, DOC-ARC-001

## Metadados de Governança

- **status_agil:** APPROVED
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-011, US-MOD-007-F03, PEND-SGR-02
- **nivel_arquitetura:** 2
- **tipo:** Backend — amendment em MOD-007-F03
- **epico_pai:** US-MOD-011
- **manifests_vinculados:** N/A
- **pendencias:** PEND-SGR-02
- **evidencias:** N/A

---

## 1. Contexto

O motor `POST /routine-engine/evaluate` avalia regras com base no contexto (Operação). Mas o SmartGrid precisa avaliar também o **estado atual do registro** (ex: `status="Baixado"`) para determinar se campos são editáveis.

---

## 2. Amendment no Contrato do Motor

```diff
body (DEPOIS — com amendment):
{
  object_type, object_id?, context, stage_id?,
+ current_record_state?: { "status": "Baixado", "tipo": "MP", ... }  ← NOVO (nullable)
}
```

**Compatibilidade**: `current_record_state` nullable — motor v1 continua funcionando.

---

## 3. Escopo

### Inclui

- Campo `current_record_state` nullable no request do motor
- Avaliação de `condition_expr` contra campos do `current_record_state`
- Campos ausentes → condição avaliada como false (degradação suave)
- Cache Redis bypass quando `current_record_state` presente

### Não inclui

- Novos tipos de routine_item
- Interfaces UX (são features separadas F02–F05)

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Amendment current_record_state no motor de avaliação

  Cenário: Motor avalia condition_expr contra estado do registro
    Dado que rotina tem item FIELD_VISIBILITY HIDE com condition_expr="status=='Baixado'"
    E current_record_state = { status: "Baixado" }
    Quando POST /routine-engine/evaluate com current_record_state preenchido
    Então response.hidden_fields inclui o campo do item

  Cenário: Sem current_record_state — comportamento v1 preservado
    Dado que request não tem campo current_record_state
    Quando POST /routine-engine/evaluate
    Então motor funciona como v1: condition_expr não é avaliada

  Cenário: current_record_state com campos parciais
    Dado que condition_expr referencia campo "tipo" não presente no current_record_state
    Quando motor avalia
    Então condição com campo ausente tratada como false (não aplica o item)

  Cenário: Cache Redis invalidado quando current_record_state presente
    Dado que cache está ativo
    Quando chamada inclui current_record_state
    Então cache é BYPASSADO (dado dinâmico não cachea)
```

---

## 5. Regras Críticas

1. `current_record_state` nullable — backward compatible com v1
2. Cache Redis **bypass** quando presente — dado dinâmico
3. Campos ausentes → condição = `false` (degradação suave)
4. `domain_events` gerado normalmente independente do uso do campo

---

## 6. DoR ✅ / DoD

**DoR:** MOD-007-F03 em READY, PEND-SGR-02 aprovada.
**DoD:** Testes com/sem current_record_state, cache bypass, condição parcial, backward compatibility.

---

## 7. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Amendment current_record_state, 4 cenários Gherkin. |
| 1.1.0 | 2026-03-19 | arquitetura | APPROVED. PEND-SGR-02 resolvida. Cascata do épico US-MOD-011. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
