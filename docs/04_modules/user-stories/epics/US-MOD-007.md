# US-MOD-007 — Parametrização Contextual e Rotinas (Épico)

**Status Ágil:** `APPROVED`
**Versão:** 1.3.0
**Data:** 2026-03-19
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-007** (Parametrização Contextual e Rotinas)
**Épicos de Negócio:** EP05 (Parametrização Contextual) + EP06 (Cadastro de Rotinas)

## Metadados de Governança

- **status_agil:** APPROVED
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** EP05, EP06, doc 03_Parametrizacao_Contextual_e_Cadastro_de_Rotinas, DOC-DEV-001, DOC-ARC-001, DOC-ARC-003, US-MOD-006, US-MOD-003, US-MOD-004
- **nivel_arquitetura:** 2 (versionamento de rotinas, motor de avaliação, integração com MOD-006)
- **evidencias:** N/A

---

## 1. Contexto e Problema

O sistema precisa de uma **camada de mediação** que permita que o mesmo objeto de negócio (ex: Pedido de Venda) tenha campos, defaults, domínios e validações diferentes dependendo do contexto de negócio ativo. Sem essa parametrização contextual, toda variação de comportamento precisa ser codificada como lógica fixa, tornando o sistema inflexível para cenários operacionais distintos.

```
ENQUADRADOR  →  QUAL contexto de negócio está ativo?
                (Operação = "Serviço de Engenharia", Classe = "Produto Importado")

ROTINA       →  QUAL pacote de comportamento deve ser aplicado?
                (exibir campo X, tornar Y obrigatório, restringir domínio Z)

INCIDÊNCIA   →  EM QUE CIRCUNSTÂNCIA o enquadrador dispara a rotina sobre o objeto?
                (quando Operação="Serviço" + Objeto="Pedido de Venda" → aplica Rotina-01)
```

O módulo funciona como **camada de mediação**: o mesmo objeto (`Pedido de Venda`) pode ter campos, defaults, domínios e validações diferentes dependendo do contexto de negócio em vigor.

---

## 2. Separação Rotina de Comportamento vs. Rotina de Integração

> **Decisão arquitetural documentada no Documento Mestre (seção 7.1, GAP 3)**

| Tipo | Módulo | O que faz |
|---|---|---|
| **Rotina de Comportamento** | **MOD-007** | Altera campos, defaults, domínios e validações na UI/domínio de negócio |
| **Rotina de Integração** | MOD-008 | Orquestra chamadas a APIs externas (Protheus/TOTVS) |

Ambas compartilham estrutura base (id, versão, vigência, governança), mas têm `routine_type` distinto e campos específicos exclusivos.

---

## 3. Os 4 Gaps do Documento Mestre — Todos Endereçados Aqui

| Gap | Problema | Solução neste módulo |
|---|---|---|
| GAP 1 | Sem versionamento técnico de rotinas | Ciclo DRAFT→PUBLISHED→DEPRECATED + freeze de versão aplicada |
| GAP 2 | Sem regra de priorização de contextos | Duas camadas: (1) Conflito detectado ao salvar regra bloqueia cadastro com 422; (2) Runtime safety net: regra mais restritiva sempre vence. Campo `priority` removido. |
| GAP 3 | Rotina de comportamento ≠ rotina de integração | `routine_type` distinto; MOD-008 herda a base mas adiciona seus campos |
| GAP 4 | Histórico de incidência sem destino técnico | `domain_events` com `event_type='routine.applied'` |

---

## 4. Ponto de Integração com MOD-006

O motor de transição do MOD-006 (passo [5]) chama o MOD-007:

```
POST /api/v1/routine-engine/evaluate
  body: {
    object_type: "case_instance",
    object_id:   "uuid-do-caso",
    context: {
      framer_type: "CONTEXTO_DE_PROCESSO",
      framer_id:   "uuid-do-enquadrador",
      stage_id:    "uuid-do-estágio"  ← context adicional
    }
  }
  → retorna: { fields, required_fields, defaults, domain_restrictions, validations, blocking_validations }
```

Se `blocking_validations` não vazio → MOD-006 bloqueia a transição com 422.

### 4.1 Motor de avaliação sem cache

> Decisão técnica 2026-03-15: Cache Redis removido do motor inteiro. Todas as chamadas ao motor de avaliação executam ao vivo, sem exceção. Operações críticas exigem consistência — zero risco de dado desatualizado.

### 4.2 Resolução de conflito em duas camadas

1. **Configuração (config-time):** Ao salvar uma regra de incidência, o sistema verifica se já existe regra conflitante para o mesmo enquadrador + objeto. Se houver conflito, o cadastro é bloqueado com erro 422.
2. **Runtime (safety net):** Se por exceção (dados legados, race condition) dois contextos conflitantes coexistirem, a regra mais restritiva sempre vence. Nenhum campo `priority` é usado — a restritividade é determinada pela natureza da ação (HIDE > SHOW, SET_REQUIRED > SET_OPTIONAL, domínio menor prevalece).

---

## 5. Escopo

### Inclui (Wave 3)

- API CRUD de Tipos de Enquadrador e Enquadradores com versionamento
- API CRUD de Objetos-Alvo e Campos-Alvo
- API CRUD de Regras de Incidência (enquadrador → objeto + vigência + UNIQUE constraint)
- API CRUD de Rotinas de Comportamento com itens e versionamento
- Motor de Avaliação de Regras (endpoint de runtime consultado por MOD-006 e frontend)
- Publicação de rotinas (DRAFT → PUBLISHED → DEPRECATED)
- Registro de incidências aplicadas via `domain_events`
- UX Configurador de Enquadradores (UX-PARAM-001)
- UX Cadastro de Rotinas (UX-ROTINA-001)

### Não inclui

- Rotinas de Integração (Protheus) — MOD-008
- Motor de aprovação de rotinas via fluxo formal — MOD-009
- Avaliação de regras em batch/importação em massa — roadmap futuro

---

## 6. Critérios de Aceite (Épico)

```gherkin
Funcionalidade: Épico Parametrização Contextual e Rotinas MOD-007

  Cenário: Mesmo objeto, comportamento diferente por contexto
    Dado que existe enquadrador "Serviço de Engenharia" (tipo=Operação)
    E rotina "Rotina-Servico" com itens: mostrar campo Projeto (obrigatório), ocultar campo Depósito
    E regra de incidência: enquadrador=Serviço + objeto=PedidoVenda → rotina=Rotina-Servico
    Quando motor avalia { object_type: "PedidoVenda", framer: "Serviço de Engenharia" }
    Então retorna: { visible: ["Projeto"], required: ["Projeto"], hidden: ["Depósito"] }

  Cenário: Conflito detectado no cadastro bloqueia a criação da regra
    Dado que já existe regra de incidência para enquadrador "A" + objeto "PedidoVenda"
    Quando POST /admin/incidence-rules tenta criar outra regra para o mesmo enquadrador + objeto
    Então deve retornar 422: "Conflito de incidência detectado. Resolva o conflito antes de salvar."

  Cenário: Runtime safety net — regra mais restritiva vence
    Dado que por exceção existem 2 regras incidentes para o mesmo objeto (legacy ou race condition)
    Quando motor avalia ambas em runtime
    Então a regra mais restritiva vence em campos conflitantes
    E regras não conflitantes são mescladas

  Cenário: Rotina publicada é imutável
    Dado que rotina tem status=PUBLISHED
    Quando PATCH /admin/routines/:id com qualquer item
    Então 422: "Rotinas publicadas são imutáveis. Crie uma nova versão."

  Cenário: domain_events registra incidência aplicada
    Dado que motor avalia e aplica rotina
    Então domain_events recebe event_type='routine.applied' com
    { routine_id, routine_version, context_id, object_id, items_applied[], result }

  Cenário: Sub-histórias bloqueadas sem aprovação do épico
    Dado que US-MOD-007 está diferente de "APPROVED"
    Então forge-module para qualquer feature é bloqueado
```

---

## 7. Definition of Ready (DoR) ✅

- [x] 4 gaps do Documento Mestre endereçados e documentados
- [x] Separação Rotina de Comportamento (MOD-007) vs Integração (MOD-008) formalizada
- [x] Ponto de integração com MOD-006 (motor de transição) especificado
- [x] Resolução de conflito em duas camadas (config-time block + runtime safety net) definida
- [x] Modelo de dados completo (9 tabelas) definido
- [x] Features F01–F05 com Gherkin completo
- [x] Novos escopos mapeados para MOD-000-F12
- [x] Owner confirmar READY → APPROVED (2026-03-19)

## 8. Definition of Done (DoD)

- [ ] F01–F05 aprovadas e scaffoldadas
- [ ] Motor de avaliação: conflito bloqueado no cadastro; runtime safety net (mais restritivo vence) validado por teste
- [ ] Rotina PUBLISHED rejeita edição — validado por teste
- [ ] `domain_events` com `routine.applied` gerado a cada avaliação com efeito
- [ ] MOD-006 integrado: transição bloqueada por `blocking_validations` do motor

---

## 9. Sub-Histórias

```text
US-MOD-007
  ├── F01 ← API: Enquadradores + Objetos-Alvo + Regras de Incidência
  ├── F02 ← API: Rotinas de Comportamento + Itens + Versionamento
  ├── F03 ← API: Motor de Avaliação (runtime hook para MOD-006 e frontend)
  ├── F04 ← UX: Configurador de Enquadradores e Regras (UX-PARAM-001)
  └── F05 ← UX: Cadastro de Rotinas (UX-ROTINA-001)
```

| Feature | Tema | Tipo | Status |
|---|---|---|---|
| [US-MOD-007-F01](../features/US-MOD-007-F01.md) | API Enquadradores + Objetos + Incidências | Backend | `APPROVED` |
| [US-MOD-007-F02](../features/US-MOD-007-F02.md) | API Rotinas + Itens + Versionamento | Backend | `APPROVED` |
| [US-MOD-007-F03](../features/US-MOD-007-F03.md) | Motor de Avaliação (runtime) | Backend | `APPROVED` |
| [US-MOD-007-F04](../features/US-MOD-007-F04.md) | UX Configurador de Enquadradores | UX | `APPROVED` |
| [US-MOD-007-F05](../features/US-MOD-007-F05.md) | UX Cadastro de Rotinas | UX | `APPROVED` |

---

## 10. Modelo de Dados Completo

### `context_framer_types` — Tipos de Enquadrador

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | |
| `codigo` | varchar UNIQUE | ex: OPERACAO, CLASSE_PRODUTO, TIPO_DOCUMENTO, CONTEXTO_PROCESSO |
| `nome` | varchar | |
| `descricao` | text | |
| `created_by` | uuid FK→users | |

### `context_framers` — Enquadradores

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `codigo` | varchar(50) | UNIQUE NOT NULL | Imutável após criação |
| `nome` | varchar(200) | NOT NULL | |
| `framer_type_id` | uuid | FK→context_framer_types | |
| `status` | varchar | ACTIVE\|INACTIVE | |
| `version` | integer | default 1 | |
| `valid_from` | timestamp | NOT NULL | |
| `valid_until` | timestamp | nullable | null = sem expiração |
| `created_by` | uuid | FK→users | |
| `deleted_at` | timestamp | nullable | |

### `target_objects` — Objetos-Alvo

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | |
| `codigo` | varchar UNIQUE | ex: PEDIDO_VENDA, CADASTRO_PRODUTO, CASO_PROCESSO |
| `nome` | varchar | |
| `modulo_ecf` | varchar | MOD-006, MOD-008, etc. — rastreabilidade |
| `descricao` | text | |

### `target_fields` — Campos-Alvo

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | |
| `target_object_id` | uuid FK→target_objects | |
| `field_key` | varchar NOT NULL | Chave do campo no objeto (ex: "projeto_wbs", "deposito_id") |
| `field_label` | varchar | Nome legível |
| `field_type` | varchar | TEXT\|NUMBER\|DATE\|SELECT\|BOOLEAN\|FILE |
| `is_system` | boolean | true = campo definido pelo sistema, não editável pelo admin |

### `incidence_rules` — Regras de Incidência

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `framer_id` | uuid | FK→context_framers | |
| `target_object_id` | uuid | FK→target_objects | |
| `condition_expr` | text | nullable | Expressão de condição futura (JSON rule engine v2) |
| `valid_from` | timestamp | NOT NULL | |
| `valid_until` | timestamp | nullable | |
| `status` | varchar | ACTIVE\|INACTIVE | |
| `created_by` | uuid | FK→users | |
| UNIQUE | | `(framer_id, target_object_id)` | Um enquadrador por objeto por incidência |

### `behavior_routines` — Rotinas de Comportamento

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `codigo` | varchar(50) | UNIQUE NOT NULL | Imutável após criação |
| `nome` | varchar(200) | NOT NULL | |
| `routine_type` | varchar | BEHAVIOR (MOD-007) \| INTEGRATION (MOD-008) | |
| `version` | integer | NOT NULL, default 1 | |
| `status` | varchar | DRAFT\|PUBLISHED\|DEPRECATED | |
| `parent_routine_id` | uuid | FK→behavior_routines, nullable | Origem do fork |
| `published_at` | timestamp | nullable | |
| `approved_by` | uuid | FK→users, nullable | |
| `created_by` | uuid | FK→users | |
| `deleted_at` | timestamp | nullable | Só em DRAFT |

### `routine_items` — Itens da Rotina

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | |
| `routine_id` | uuid FK→behavior_routines | |
| `item_type` | varchar | FIELD_VISIBILITY\|REQUIRED\|DEFAULT\|DOMAIN\|DERIVATION\|VALIDATION\|EVIDENCE |
| `target_field_id` | uuid FK→target_fields, nullable | Campo afetado |
| `action` | varchar | SHOW\|HIDE\|SET_REQUIRED\|SET_OPTIONAL\|SET_DEFAULT\|RESTRICT_DOMAIN\|VALIDATE\|REQUIRE_EVIDENCE |
| `value` | jsonb | nullable | Valor parametrizado (ex: default="SP-01", domain=["A","B","C"]) |
| `condition_expr` | text | nullable | Condição de aplicação do item |
| `validation_message` | varchar | nullable | Mensagem de erro para VALIDATION |
| `is_blocking` | boolean | default false | true = bloqueia transição/save no MOD-006 |
| `ordem` | integer | NOT NULL | Ordem de avaliação |

### `routine_incidence_links` — Rotina ↔ Incidência

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | |
| `routine_id` | uuid FK→behavior_routines | Rotina PUBLISHED |
| `incidence_rule_id` | uuid FK→incidence_rules | |
| UNIQUE | | `(routine_id, incidence_rule_id)` | |

### `routine_version_history` — Histórico de Versões

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | uuid PK | |
| `routine_id` | uuid FK→behavior_routines | Nova versão |
| `previous_version_id` | uuid FK→behavior_routines | Versão anterior |
| `changed_by` | uuid FK→users | |
| `change_reason` | text NOT NULL | |
| `changed_at` | timestamp | |

---

## 11. Endpoints do Módulo

| Método | Path | operationId | Scope |
|---|---|---|---|
| GET | /api/v1/admin/framer-types | `admin_framer_types_list` | `param:framer:read` |
| POST | /api/v1/admin/framer-types | `admin_framer_types_create` | `param:framer:write` |
| GET | /api/v1/admin/framers | `admin_framers_list` | `param:framer:read` |
| POST | /api/v1/admin/framers | `admin_framers_create` | `param:framer:write` |
| PATCH | /api/v1/admin/framers/:id | `admin_framers_update` | `param:framer:write` |
| DELETE | /api/v1/admin/framers/:id | `admin_framers_delete` | `param:framer:delete` |
| — | — | — | — |
| GET | /api/v1/admin/target-objects | `admin_target_objects_list` | `param:framer:read` |
| POST | /api/v1/admin/target-objects | `admin_target_objects_create` | `param:framer:write` |
| POST | /api/v1/admin/target-objects/:id/fields | `admin_target_fields_create` | `param:framer:write` |
| — | — | — | — |
| GET | /api/v1/admin/incidence-rules | `admin_incidence_rules_list` | `param:framer:read` |
| POST | /api/v1/admin/incidence-rules | `admin_incidence_rules_create` | `param:framer:write` |
| PATCH | /api/v1/admin/incidence-rules/:id | `admin_incidence_rules_update` | `param:framer:write` |
| DELETE | /api/v1/admin/incidence-rules/:id | `admin_incidence_rules_delete` | `param:framer:delete` |
| — | — | — | — |
| GET | /api/v1/admin/routines | `admin_routines_list` | `param:routine:read` |
| POST | /api/v1/admin/routines | `admin_routines_create` | `param:routine:write` |
| GET | /api/v1/admin/routines/:id | `admin_routines_get` | `param:routine:read` |
| PATCH | /api/v1/admin/routines/:id | `admin_routines_update` | `param:routine:write (só DRAFT)` |
| POST | /api/v1/admin/routines/:id/publish | `admin_routines_publish` | `param:routine:publish` |
| POST | /api/v1/admin/routines/:id/fork | `admin_routines_fork` | `param:routine:write` |
| POST | /api/v1/admin/routines/:id/items | `admin_routine_items_create` | `param:routine:write` |
| PATCH | /api/v1/admin/routine-items/:id | `admin_routine_items_update` | `param:routine:write` |
| DELETE | /api/v1/admin/routine-items/:id | `admin_routine_items_delete` | `param:routine:write` |
| — | — | — | — |
| POST | /api/v1/routine-engine/evaluate | `routine_engine_evaluate` | `param:engine:evaluate` |

---

## 12. Novos Escopos — Amendment MOD-000-F12

| Escopo | Descrição |
|---|---|
| `param:framer:read` | Ver enquadradores, tipos, objetos, campos e regras |
| `param:framer:write` | Criar e editar enquadradores e regras de incidência |
| `param:framer:delete` | Inativar enquadradores e regras |
| `param:routine:read` | Ver rotinas, itens e histórico |
| `param:routine:write` | Criar e editar rotinas (somente DRAFT) |
| `param:routine:publish` | Publicar rotina (DRAFT → PUBLISHED) |
| `param:engine:evaluate` | Chamar o motor de avaliação (usado por MOD-006 e frontend) |

---

## 13. OKRs

| # | Métrica | Alvo |
|---|---|---|
| OKR-1 | Conflito de incidência bloqueado no cadastro; safety net runtime (mais restritivo vence) funcional | 100% |
| OKR-2 | Rotina PUBLISHED rejeita edição | 100% |
| OKR-3 | `routine.applied` em domain_events para cada avaliação com efeito | 100% |
| OKR-4 | MOD-006 bloqueia transição por `blocking_validations` do motor | 100% |

---

## 14. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação do zero. 9 tabelas, motor de avaliação, 4 gaps resolvidos, 5 features. |
| 1.1.0 | 2026-03-16 | Marcos Sulivan | Decisões técnicas 2026-03-15: campo priority removido de incidence_rules, resolução de conflito em duas camadas (config-time + runtime safety net), cache Redis removido do motor, owner atualizado. |
| 1.2.0 | 2026-03-18 | Marcos Sulivan | Revisão de alinhamento: propaga decisões v1.1.0 para F01–F05. F01: remove priorização, adiciona duas camadas. F03: remove cache Redis e priority do algoritmo/response. F04: remove badges de prioridade, UNIQUE constraint na UX. F05: remove ref cache Redis. Épico pronto para APPROVED. |
| 1.3.0 | 2026-03-19 | Marcos Sulivan | Revisão final e promoção READY → APPROVED. Todas as features F01–F05 aprovadas. DoR 100% completo. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
