# US-MOD-007-F02 — API: Rotinas de Comportamento, Itens e Versionamento

**Status Ágil:** `READY`
**Versão:** 1.2.0
**Data:** 2026-03-23
**Módulo Destino:** **MOD-007** (Parametrização Contextual — Backend)
**Referências Normativas:** DOC-DEV-001, DOC-ARC-001

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-23
- **rastreia_para:** US-MOD-007, US-MOD-007-F01
- **nivel_arquitetura:** 2 (versionamento de rotinas, itens parametrizados, integração com MOD-006)
- **tipo:** Backend — cria novos endpoints
- **epico_pai:** US-MOD-007
- **manifests_vinculados:** N/A
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **administrador funcional**, quero criar e versionar rotinas de comportamento com seus itens (campo, obrigatoriedade, default, domínio, validação, evidência), publicá-las com governança e vinculá-las a regras de incidência, para que o motor aplique o comportamento correto em runtime.

---

## 2. Versionamento de Rotinas (GAP 1 resolvido)

```
DRAFT ──► PUBLISHED ──► DEPRECATED
  ▲            │
  └──── fork (copia itens + links de incidência → novo DRAFT)

Regras:
- Instâncias de casos ativas (MOD-006) referenciam a versão PUBLISHED vigente na época.
- Ao fazer fork, routine_version_history registra parent + reason.
- Se uma rotina é DEPRECATED mas há domain_events com essa versão: dados históricos preservados.
```

---

## 3. Tipos de Item e Seus Campos

| item_type | action(s) | Campos específicos |
|---|---|---|
| `FIELD_VISIBILITY` | SHOW \| HIDE | `target_field_id`, `condition_expr` |
| `REQUIRED` | SET_REQUIRED \| SET_OPTIONAL | `target_field_id`, `condition_expr` |
| `DEFAULT` | SET_DEFAULT | `target_field_id`, `value` (valor padrão) |
| `DOMAIN` | RESTRICT_DOMAIN | `target_field_id`, `value` (array de valores permitidos) |
| `DERIVATION` | DERIVE | `target_field_id`, `value` (expressão de derivação) |
| `VALIDATION` | VALIDATE | `target_field_id`, `value` (regra), `validation_message`, `is_blocking` |
| `EVIDENCE` | REQUIRE_EVIDENCE | `target_field_id` (nullable — evidência do objeto inteiro), `value` (tipo de evidência) |

---

## 4. Escopo

### Inclui

- CRUD de Rotinas de Comportamento com ciclo DRAFT → PUBLISHED → DEPRECATED
- CRUD de Itens de Rotina com 7 tipos (FIELD_VISIBILITY, REQUIRED, DEFAULT, DOMAIN, DERIVATION, VALIDATION, EVIDENCE)
- Fork de rotina PUBLISHED com cópia de itens e links de incidência
- Vínculo rotina ↔ regra de incidência (somente PUBLISHED)
- Histórico de versões com `change_reason` obrigatório
- Validação: PUBLISHED imutável, publicação exige ao menos 1 item

### Não inclui

- Enquadradores e regras de incidência — US-MOD-007-F01
- Motor de avaliação — US-MOD-007-F03
- Interface de cadastro — US-MOD-007-F05

---

## 5. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: API Rotinas de Comportamento e Versionamento

  Cenário: Criar rotina DRAFT com itens
    Quando POST /admin/routines com { codigo: "ROT-SERV-ENG", nome: "Rotina Serviço de Engenharia", routine_type: "BEHAVIOR" }
    E POST /admin/routines/:id/items com { item_type: "FIELD_VISIBILITY", action: "SHOW", target_field_id: uuid-projeto, ordem: 1 }
    E POST /admin/routines/:id/items com { item_type: "REQUIRED", action: "SET_REQUIRED", target_field_id: uuid-projeto, ordem: 2 }
    E POST /admin/routines/:id/items com { item_type: "FIELD_VISIBILITY", action: "HIDE", target_field_id: uuid-deposito, ordem: 3 }
    E POST /admin/routines/:id/items com { item_type: "EVIDENCE", action: "REQUIRE_EVIDENCE", value: { evidence_type: "CONTRACT" }, ordem: 4 }
    Então rotina DRAFT criada com 4 itens

  Cenário: Publicar rotina exige ao menos 1 item
    Dado que rotina DRAFT não tem itens
    Quando POST /admin/routines/:id/publish
    Então 422: "Rotinas sem itens não podem ser publicadas."

  Cenário: Rotina PUBLISHED é imutável
    Dado que rotina tem status=PUBLISHED
    Quando POST /admin/routines/:id/items
    Então 422: "Rotinas publicadas são imutáveis. Use o fork para criar nova versão."

  Cenário: Fork cria nova versão DRAFT com itens copiados
    Dado que rotina PUBLISHED tem 4 itens e 2 links de incidência
    Quando POST /admin/routines/:id/fork com { change_reason: "Adicionar campo NCM" }
    Então novo DRAFT criado com version+1, mesmos itens copiados (novos IDs)
    E routine_version_history registra previous_version_id + change_reason
    E os 2 links de incidência são copiados para a nova versão

  Cenário: Vincular rotina a regra de incidência
    Dado que rotina está PUBLISHED e incidence_rule existe
    Quando POST /admin/routines/:id com { incidence_rule_ids: ["uuid-regra"] }
    Então routine_incidence_links criado
    E motor passa a considerar esta rotina quando a regra for ativada

  Cenário: Rejeitar vínculo de rotina DRAFT a incidência
    Dado que rotina está em DRAFT
    Quando tentar vincular a incidence_rule
    Então 422: "Apenas rotinas publicadas podem ser vinculadas a regras de incidência."

  Cenário: Item VALIDATION is_blocking=true aparece em blocking_validations
    Dado que item de validação tem is_blocking=true
    E motor avalia e item é violado (condição de erro ativa)
    Quando POST /routine-engine/evaluate
    Então response inclui blocking_validations: [{ field, message, routine_id }]

  Cenário: Item DOMAIN restringe lista de valores
    Dado que rotina tem item DOMAIN para campo NCM com value=["3926.90","8544.42"]
    Quando motor avalia
    Então response inclui domain_restrictions: { ncm: { allowed: ["3926.90","8544.42"] } }
```

---

## 6. Domain Events

| event_type | sensitivity_level |
|---|---|
| `param.routine_created` | 0 |
| `param.routine_published` | 0 |
| `param.routine_forked` | 0 |
| `param.routine_deprecated` | 0 |
| `param.routine_item_added` | 0 |

---

## 7. Regras Críticas

1. **PUBLISHED imutável**: itens não editáveis nem deletáveis — fork é o único caminho
2. **Fork copia tudo**: itens (novos IDs) + links de incidência
3. **Vínculo só para PUBLISHED**: rotina DRAFT não pode ser vinculada a incidence_rule
4. **routine_version_history**: `change_reason` obrigatório no fork
5. **is_blocking**: VALIDATION com is_blocking=true bloqueia transição no MOD-006

---

## 8. Definition of Ready (DoR) ✅

- [x] F01 em READY (depende de enquadradores e objetos)
- [x] `target_fields` seed para os objetos usados
- [x] 7 tipos de item documentados com campos
- [x] Gherkin com 8 cenários
- [x] Owner confirmar READY → APPROVED (2026-03-19)

## 9. Definition of Done (DoD)

- [ ] Todos os 7 tipos de item testados
- [ ] Fork clona itens e links corretamente
- [ ] Publicação sem itens bloqueada
- [ ] PUBLISHED imutável para itens
- [ ] is_blocking testado com integração MOD-006
- [ ] Evidências documentadas (PR/issue)

---

## 10. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. CRUD Rotinas + Itens + Versionamento, 8 cenários Gherkin, domain events. |
| 1.1.0 | 2026-03-19 | Marcos Sulivan | Revisão final e promoção READY → APPROVED. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
