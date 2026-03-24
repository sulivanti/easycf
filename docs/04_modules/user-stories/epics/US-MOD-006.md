# US-MOD-006 — Execução de Casos (Épico)

**Status Ágil:** `READY`
**Versão:** 0.9.0
**Data:** 2026-03-23
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-006** (Execução de Casos)
**Épico de Negócio:** EP04

## Metadados de Governança

- **status_agil:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-23
- **rastreia_para:** EP04 (doc 02_Arquitetura_de_Processo_e_Execucao), US-MOD-005, US-MOD-004, US-MOD-003, US-MOD-000-F09, DOC-DEV-001, DOC-ARC-001, DOC-ARC-003
- **nivel_arquitetura:** 2 (domínio rico, transições com invariantes, audit trail completo)
- **evidencias:** N/A

---

## 1. Contexto e Problema

O MOD-005 define o **blueprint** dos processos — a estrutura conceitual de ciclos, estágios, gates e transições. Porém, sem uma camada de **execução**, não há como transformar esses modelos em casos concretos, rastrear progresso, resolver gates ou atribuir responsáveis.

> **O caso nunca "sente" mudanças no blueprint.** Ao abrir uma instância, o sistema captura o `stage_id` inicial e o `cycle_version_id` vigente. Qualquer fork ou atualização do ciclo no MOD-005 não afeta instâncias em andamento.

| MOD-005 (Blueprint) | MOD-006 (Execução) |
|---|---|
| `process_stages` — quais estágios existem | `case_instances` — em qual estágio o caso está agora |
| `stage_transitions` — quais movimentos são possíveis | `stage_history` — quais movimentos ocorreram |
| `process_gates` — quais gates o estágio tem | `gate_instances` — como o gate foi resolvido neste caso |
| `stage_role_links` — quais papéis o estágio espera | `case_assignments` — quem está atribuído agora |
| — | `case_events` — fatos relevantes sem mudança de estágio |

---

## 2. Três Históricos Independentes

```
case_instances          → O CASO em si (status geral, datas, objeto de negócio)
    │
    ├── stage_history   → ONDE o caso esteve (mudanças de estágio)
    │                     Um estágio pode durar dias; o responsável pode mudar 3 vezes
    │
    ├── gate_instances  → COMO os gates foram resolvidos (decisões formais, documentos)
    │
    ├── case_assignments → QUEM está responsável agora (por papel, com vigência)
    │                      Muda sem mudar o estágio corrente
    │
    └── case_events     → O QUE aconteceu (fatos relevantes sem mudança de estágio)
                          Reabertura, exceção, comentário, evidência avulsa, reatribuição
```

> **Regra-mãe:** "Nem todo fato relevante do caso altera o estágio; por isso o histórico de eventos é complementar ao histórico de estágio." — doc normativo

---

## 3. Motor de Transição de Estágios

Antes de executar qualquer transição, o motor avalia em sequência:

```
1. A transição existe no blueprint? (stage_transitions)
2. O usuário atual tem o papel permitido? (allowed_roles na transição)
3. Todos os gates required=true do estágio atual estão RESOLVED?
4. Se evidence_required=true → evidência foi fornecida no request?
5. Validações do MOD-007 (parametrização contextual) — se integrado

→ SE TODAS OK: executa transição
   - stage_history: registra saída do estágio anterior
   - case_instances: atualiza current_stage_id
   - gate_instances: arquiva os gates resolvidos
   - case_events: registra evento de transição
   - domain_events: emite case.stage_transitioned

→ SE FALHAR EM QUALQUER PASSO: 422 com motivo específico
```

---

## 4. Escopo

### Inclui

- API para abrir instâncias de caso sobre ciclos PUBLISHED (F01)
- Motor de transição de estágios com validação de gates e papéis (F01)
- API de resolução de gates (aprovação, documento, checklist) (F02)
- API de atribuição e reatribuição de responsáveis por papel (F02)
- API de registro de eventos avulsos do caso (F02)
- Painel de caso em andamento com timeline (UX-CASE-001) (F03)
- Listagem de casos ativos com filtros (UX-CASE-002) (F04)

### Não inclui

- Abertura de caso com fluxo de aprovação prévia — MOD-009
- Parametrização contextual de comportamento por enquadrador — MOD-007
- Integração com Protheus disparada por transição — MOD-008

---

## 5. Critérios de Aceite (Épico)

```gherkin
Funcionalidade: Épico Execução de Casos MOD-006

  Cenário: Instância referencia versão frozen do ciclo
    Dado que ciclo v1 está PUBLISHED e caso é aberto
    Quando ciclo v1 é DEPRECATED e ciclo v2 é publicado
    Então o caso existente ainda referencia cycle_version_id de v1
    E GET /cases/:id retorna blueprint com estrutura da v1

  Cenário: Motor de transição bloqueia gate não resolvido
    Dado que estágio atual tem gate APPROVAL required=true com status=PENDING
    Quando POST /cases/:id/transition com qualquer transição
    Então 422: "Gate 'Aprovação Gerencial' ainda não foi resolvido."
    E case.current_stage_id permanece inalterado

  Cenário: Histórico de estágio e de responsável são independentes
    Dado que caso está no Estágio A com responsável João
    Quando João é substituído por Maria (reatribuição, sem transição)
    Então case_assignments registra a reatribuição com motivo
    E stage_history NÃO registra nova entrada
    E current_stage_id permanece Estágio A

  Cenário: Evento registrado sem mudança de estágio
    Dado que caso está no Estágio B
    Quando POST /cases/:id/events com { event_type: "COMMENT", descricao: "..." }
    Então case_events registra o evento
    E stage_history NÃO registra nova entrada
    E current_stage_id permanece Estágio B

  Cenário: Sub-histórias bloqueadas sem aprovação
    Dado que US-MOD-006 está diferente de "APPROVED"
    Então forge-module para qualquer feature é bloqueado
```

---

## 6. Definition of Ready (DoR) ✅

- [x] Três históricos independentes documentados e justificados
- [x] Motor de transição com sequência de validações definida
- [x] Modelo de dados completo (5 tabelas) definido
- [x] Dependências de MOD-005 (stages, gates, transitions) mapeadas
- [x] Dependência de MOD-004 (delegações como atribuição) mapeada
- [x] Features F01–F04 com Gherkin completo
- [x] Screen Manifests UX-CASE-001, UX-CASE-002 criados
- [x] Novos escopos mapeados para MOD-000-F12
- [x] Owner confirmar READY → APPROVED ✅ (2026-03-18)

## 7. Definition of Done (DoD)

- [ ] F01–F04 aprovadas e scaffoldadas
- [ ] Motor de transição testado: gate bloqueante, papel não autorizado, evidence_required
- [ ] Histórico de estágio e de responsável independentes — validado por teste
- [ ] Instância referencia cycle_version_id frozen — validado com fork após abertura
- [ ] Timeline do caso exibe os 3 históricos intercalados cronologicamente

---

## 8. Sub-Histórias

```text
US-MOD-006
  ├── F01 ← API: Abertura de Caso + Motor de Transição
  ├── F02 ← API: Gates, Responsáveis e Eventos
  ├── F03 ← UX: Painel do Caso em Andamento (UX-CASE-001)
  └── F04 ← UX: Listagem de Casos (UX-CASE-002)
```

| Feature | Tema | Tipo | Status |
|---|---|---|---|
| [US-MOD-006-F01](../features/US-MOD-006-F01.md) | API abertura + motor de transição | Backend | `READY` |
| [US-MOD-006-F02](../features/US-MOD-006-F02.md) | API gates + responsáveis + eventos | Backend | `READY` |
| [US-MOD-006-F03](../features/US-MOD-006-F03.md) | UX Painel do caso + timeline | UX | `READY` |
| [US-MOD-006-F04](../features/US-MOD-006-F04.md) | UX Listagem de casos | UX | `READY` |

---

## 9. Modelo de Dados Completo

### `case_instances` — Instância do Caso

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `codigo` | varchar(50) | UNIQUE NOT NULL | Identificador amigável (ex: CASO-2026-00042) |
| `cycle_id` | uuid | FK→process_cycles.id | Ciclo de referência |
| `cycle_version_id` | uuid | FK→process_cycles.id | **Versão exata frozen ao abrir o caso** |
| `current_stage_id` | uuid | FK→process_stages.id | Estágio atual |
| `status` | varchar | OPEN\|COMPLETED\|CANCELLED\|ON_HOLD | |
| `object_type` | varchar | nullable | Tipo do objeto de negócio vinculado (ex: 'sale_order') |
| `object_id` | uuid | nullable | ID do objeto de negócio |
| `org_unit_id` | uuid | FK→org_units.id, nullable | Área organizacional do caso |
| `tenant_id` | uuid | FK→tenants.id NOT NULL | Filial/tenant do caso |
| `opened_by` | uuid | FK→users.id | |
| `opened_at` | timestamp | NOT NULL | |
| `completed_at` | timestamp | nullable | |
| `cancelled_at` | timestamp | nullable | |
| `cancellation_reason` | text | nullable | |
| `created_at`, `updated_at` | timestamp | | |

### `stage_history` — Histórico de Estágio

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `case_id` | uuid | FK→case_instances.id NOT NULL | |
| `from_stage_id` | uuid | FK→process_stages.id, nullable | null = abertura do caso |
| `to_stage_id` | uuid | FK→process_stages.id NOT NULL | |
| `transition_id` | uuid | FK→stage_transitions.id, nullable | null = abertura |
| `transitioned_by` | uuid | FK→users.id NOT NULL | |
| `transitioned_at` | timestamp | NOT NULL | |
| `motivo` | text | nullable | |
| `evidence` | jsonb | nullable | `{ type: 'note'\|'file', content, url }` |

### `gate_instances` — Instância de Gate

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `case_id` | uuid | FK→case_instances.id NOT NULL | |
| `gate_id` | uuid | FK→process_gates.id NOT NULL | |
| `stage_id` | uuid | FK→process_stages.id NOT NULL | Estágio ao qual o gate pertence |
| `status` | varchar | PENDING\|RESOLVED\|WAIVED\|REJECTED | |
| `resolved_by` | uuid | FK→users.id, nullable | |
| `resolved_at` | timestamp | nullable | |
| `decision` | varchar | nullable | APPROVED\|REJECTED\|WAIVED (para APPROVAL gates) |
| `parecer` | text | nullable | Nota do aprovador |
| `evidence` | jsonb | nullable | Arquivo/URL de evidência (para DOCUMENT gates) |
| `checklist_items` | jsonb | nullable | Array de itens + check (para CHECKLIST gates) |
| UNIQUE | | `(case_id, gate_id)` | Um gate por caso |

### `case_assignments` — Atribuição de Responsáveis

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `case_id` | uuid | FK→case_instances.id NOT NULL | |
| `stage_id` | uuid | FK→process_stages.id NOT NULL | Estágio para o qual é atribuído |
| `process_role_id` | uuid | FK→process_roles.id NOT NULL | Papel que exerce |
| `user_id` | uuid | FK→users.id NOT NULL | Usuário atribuído |
| `assigned_by` | uuid | FK→users.id NOT NULL | Quem fez a atribuição |
| `assigned_at` | timestamp | NOT NULL | |
| `valid_until` | timestamp | nullable | Para atribuições temporárias |
| `is_active` | boolean | default true | false = substituído/encerrado |
| `substitution_reason` | text | nullable | |
| `delegation_id` | uuid | FK→access_delegations.id, nullable | Se atribuição veio de delegação MOD-004 |

### `case_events` — Eventos Avulsos do Caso

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `case_id` | uuid | FK→case_instances.id NOT NULL | |
| `event_type` | varchar | COMMENT\|EXCEPTION\|REOPENED\|EVIDENCE\|REASSIGNED\|ON_HOLD\|RESUMED | |
| `descricao` | text | NOT NULL | |
| `created_by` | uuid | FK→users.id NOT NULL | |
| `created_at` | timestamp | NOT NULL | |
| `metadata` | jsonb | nullable | Dados extras por tipo de evento |
| `stage_id` | uuid | FK→process_stages.id | Estágio no momento do evento |

---

## 10. Endpoints do Módulo

| Método | Path | operationId | Scope |
|---|---|---|---|
| POST | /api/v1/cases | `cases_open` | `process:case:write` |
| GET | /api/v1/cases | `cases_list` | `process:case:read` |
| GET | /api/v1/cases/:id | `cases_get` | `process:case:read` |
| POST | /api/v1/cases/:id/transition | `cases_transition` | `process:case:write` |
| POST | /api/v1/cases/:id/cancel | `cases_cancel` | `process:case:cancel` |
| POST | /api/v1/cases/:id/hold | `cases_hold` | `process:case:write` |
| POST | /api/v1/cases/:id/resume | `cases_resume` | `process:case:write` |
| — | — | — | — |
| GET | /api/v1/cases/:id/gates | `cases_gates_list` | `process:case:read` |
| POST | /api/v1/cases/:id/gates/:gateId/resolve | `cases_gates_resolve` | `process:case:gate_resolve` |
| POST | /api/v1/cases/:id/gates/:gateId/waive | `cases_gates_waive` | `process:case:gate_waive` |
| — | — | — | — |
| GET | /api/v1/cases/:id/assignments | `cases_assignments_list` | `process:case:read` |
| POST | /api/v1/cases/:id/assignments | `cases_assignments_create` | `process:case:assign` |
| PATCH | /api/v1/cases/:id/assignments/:aid | `cases_assignments_update` | `process:case:assign` |
| — | — | — | — |
| GET | /api/v1/cases/:id/events | `cases_events_list` | `process:case:read` |
| POST | /api/v1/cases/:id/events | `cases_events_create` | `process:case:write` |
| — | — | — | — |
| GET | /api/v1/cases/:id/timeline | `cases_timeline` | `process:case:read` |

---

## 11. Novos Escopos — Amendment MOD-000-F12

| Escopo | Descrição |
|---|---|
| `process:case:read` | Visualizar casos, histórico, gates, responsáveis e eventos |
| `process:case:write` | Abrir casos, transitar, registrar eventos |
| `process:case:cancel` | Cancelar caso (ação crítica separada) |
| `process:case:gate_resolve` | Resolver gates (aprovar/rejeitar) |
| `process:case:gate_waive` | Dispensar gate obrigatório (poder especial) |
| `process:case:assign` | Atribuir e reatribuir responsáveis |

---

## 12. OKRs

| # | Métrica | Alvo |
|---|---|---|
| OKR-1 | Motor de transição bloqueia gate pending | 100% |
| OKR-2 | Instâncias referenciam cycle_version frozen após fork | 100% |
| OKR-3 | stage_history e case_assignments são independentes | 100% |
| OKR-4 | Timeline intercala os 3 históricos cronologicamente | sem falha |

---

## 13. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação do zero. 5 tabelas, motor de transição, 3 históricos independentes, 4 features. |
| 1.1.0 | 2026-03-16 | Marcos Sulivan | Decisões técnicas 2026-03-15: todas as decisões já estavam corretas. Owner atualizado. |
| 0.9.0 | 2026-03-23 | promote-module | Promoção APPROVED→READY: épico + features F01-F04 selados. |
| 1.2.0 | 2026-03-18 | Marcos Sulivan | Revisão final e promoção para APPROVED. DoR completo. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
