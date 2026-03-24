# US-MOD-007-F01 — API: Enquadradores, Objetos-Alvo e Regras de Incidência

**Status Ágil:** `READY`
**Versão:** 1.3.0
**Data:** 2026-03-23
**Módulo Destino:** **MOD-007** (Parametrização Contextual — Backend)
**Referências Normativas:** DOC-DEV-001, DOC-ARC-001

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-23
- **rastreia_para:** US-MOD-007, US-MOD-003, DOC-ARC-001
- **nivel_arquitetura:** 2 (enquadradores com vigência, detecção de conflitos config-time, UNIQUE constraint)
- **tipo:** Backend — cria novos endpoints
- **epico_pai:** US-MOD-007
- **manifests_vinculados:** N/A
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **analista funcional**, quero definir os enquadradores de contexto, os objetos-alvo que recebem parametrização e as regras que determinam quando um enquadrador incide sobre um objeto, para que o motor de avaliação saiba quais rotinas aplicar em cada situação.

---

## 2. Resolução de Conflito em Duas Camadas (GAP 2 resolvido)

> **Decisão técnica 2026-03-15:** Campo `priority` removido de `incidence_rules`. Conflito é resolvido em duas camadas.

```
CAMADA 1 — Config-time (cadastro):
  UNIQUE(framer_id, target_object_id) impede duplicação.
  Ao salvar regra, sistema verifica se já existe regra para o mesmo
  enquadrador + objeto. Se houver → 422 "Conflito de incidência detectado."

CAMADA 2 — Runtime (safety net):
  Se por exceção (dados legados, race condition) dois contextos
  conflitantes coexistirem, a regra mais RESTRITIVA sempre vence:
    HIDE > SHOW, SET_REQUIRED > SET_OPTIONAL, domínio menor prevalece.
  Campos NÃO conflitantes são MESCLADOS (union, não substituição).

condition_expr (futura): permite condições JSON para incidência condicional.
  Na versão 1: condição sempre verdadeira (campo nullable, ignorado pelo motor v1).
```

---

## 3. Escopo

### Inclui

- CRUD de Tipos de Enquadrador (catálogo: OPERACAO, CLASSE_PRODUTO, TIPO_DOCUMENTO, CONTEXTO_PROCESSO)
- CRUD de Enquadradores com vigência (`valid_from`/`valid_until`), código imutável, expiração automática
- CRUD de Objetos-Alvo com campos-alvo (field_key, field_type, is_system)
- CRUD de Regras de Incidência com vigência, UNIQUE constraint e detecção de conflitos config-time
- Domain events para todas as operações

### Não inclui

- Rotinas de comportamento e seus itens — US-MOD-007-F02
- Motor de avaliação — US-MOD-007-F03
- Interface de configuração — US-MOD-007-F04

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: API Enquadradores, Objetos e Regras de Incidência

  # ── Tipos de Enquadrador ────────────────────────────────────
  Cenário: Criar tipo de enquadrador
    Quando POST /admin/framer-types com { codigo: "OPERACAO", nome: "Operação" }
    Então 201 com tipo criado
    E evento param.framer_type_created emitido

  # ── Enquadradores ────────────────────────────────────────────
  Cenário: Criar enquadrador com vigência obrigatória
    Dado que framer_type "OPERACAO" existe
    Quando POST /admin/framers com { codigo: "SERV-ENG", nome: "Serviço de Engenharia",
      framer_type_id, valid_from: hoje }
    Então 201 com enquadrador criado, status=ACTIVE

  Cenário: Enquadrador com valid_until expira automaticamente
    Dado que enquadrador tem valid_until = ontem e status=ACTIVE
    Quando background job de expiração roda
    Então status=INACTIVE e evento param.framer_expired emitido

  Cenário: codigo imutável após criação
    Quando PATCH /admin/framers/:id com { codigo: "NOVO-CODIGO" }
    Então 422: "O campo 'codigo' é imutável após criação."

  # ── Objetos-Alvo e Campos ───────────────────────────────────
  Cenário: Cadastrar objeto-alvo com campos
    Quando POST /admin/target-objects com { codigo: "PEDIDO_VENDA", nome: "Pedido de Venda", modulo_ecf: "MOD-008" }
    E POST /admin/target-objects/:id/fields com { field_key: "projeto_wbs", field_label: "Projeto/WBS", field_type: "TEXT" }
    Então objeto e campo criados, disponíveis para vincular a regras

  # ── Regras de Incidência ─────────────────────────────────────
  Cenário: Criar regra de incidência
    Dado que framer "SERV-ENG" e objeto "PEDIDO_VENDA" existem
    Quando POST /admin/incidence-rules com { framer_id, target_object_id }
    Então 201 com regra criada, status=ACTIVE

  Cenário: Conflito detectado ao salvar bloqueia cadastro
    Dado que já existe regra para SERV-ENG + PEDIDO_VENDA
    Quando POST /admin/incidence-rules com mesmo framer_id + target_object_id
    Então 422: "Conflito de incidência detectado. Resolva o conflito antes de salvar."

  Cenário: RBAC: scope obrigatório
    Dado que caller não tem param:framer:read
    Quando GET /admin/framers
    Então 403 RFC 9457
```

---

## 5. Domain Events

| event_type | sensitivity_level |
|---|---|
| `param.framer_type_created` | 0 |
| `param.framer_created` | 0 |
| `param.framer_expired` | 0 |
| `param.incidence_rule_created` | 0 |
| `param.incidence_rule_updated` | 0 |

---

## 6. Regras Críticas

1. `codigo` imutável após criação em framers e target_objects
2. `valid_until` nos framers: background job expira (mesmo job do MOD-004 pode ser estendido)
3. UNIQUE `(framer_id, target_object_id)` em incidence_rules — conflito bloqueado no cadastro com 422
4. Campo `priority` removido — resolução por restritividade no runtime (safety net)
5. `condition_expr`: nullable em v1, preparado para rule engine em v2

---

## 7. Definition of Ready (DoR) ✅

- [x] Modelo definido (framer_types, framers, target_objects, target_fields, incidence_rules)
- [x] Seed de framer_types padrão (OPERACAO, CLASSE_PRODUTO, TIPO_DOCUMENTO, CONTEXTO_PROCESSO)
- [x] Gherkin com 7 cenários
- [x] Owner confirmar READY → APPROVED (2026-03-19)

## 8. Definition of Done (DoD)

- [ ] CRUD completo com RBAC
- [ ] Expiração de framers testada via background job
- [ ] Conflito bloqueado no cadastro (UNIQUE constraint + 422)
- [ ] codigo imutável validado
- [ ] Evidências documentadas (PR/issue)

---

## 9. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. CRUD Enquadradores + Objetos + Incidências, 8 cenários Gherkin, domain events. |
| 1.1.0 | 2026-03-18 | Marcos Sulivan | Alinha com épico v1.1.0: remove campo priority, substitui regra de priorização por resolução em duas camadas (config-time block + runtime safety net), remove cenário de listagem com conflitos detectados. |
| 1.2.0 | 2026-03-19 | Marcos Sulivan | Revisão final e promoção READY → APPROVED. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
