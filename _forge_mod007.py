#!/usr/bin/env python3
"""Forge MOD-007 scaffold files."""
import os

base = "D:/Dev/EasyCodeFramework/docs/04_modules/mod-007-parametrizacao-contextual"

AUTOMATION_HEADER = (
    '> \u26a0\ufe0f **ARQUIVO GERIDO POR AUTOMA\u00c7\u00c3O.**\n'
    '> - **Status DRAFT:** Enrique\u00e7a o conte\u00fado deste arquivo diretamente.\n'
    '> - **Status READY:** N\u00c3O EDITE DIRETAMENTE. Use a skill `create-amendment`.\n'
)

BASELINE_TABLE = (
    '>\n'
    '> | Vers\u00e3o | Data       | Respons\u00e1vel | Status/Integra\u00e7\u00e3o |\n'
    '> |--------|------------|-------------|-------------------|\n'
    '> | 0.1.0  | 2026-03-19 | arquitetura | Baseline Inicial (forge-module) |\n'
)

files = {}

# ============================================================
# mod.md
# ============================================================
files["mod.md"] = f"""{AUTOMATION_HEADER}
# MOD-007 \u2014 Parametriza\u00e7\u00e3o Contextual e Rotinas

- **id:** MOD-007
- **version:** 0.1.0
- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **architecture_level:** 2
- **rastreia_para:** US-MOD-007, US-MOD-007-F01, US-MOD-007-F02, US-MOD-007-F03, US-MOD-007-F04, US-MOD-007-F05, DOC-DEV-001, DOC-ESC-001, DOC-ARC-001, DOC-ARC-003, DOC-FND-000, MOD-000, MOD-003, MOD-006
- **referencias_exemplos:** EX-ESC-001
- **evidencias:** N/A

---

## 1. Objetivo

M\u00f3dulo respons\u00e1vel pela **parametriza\u00e7\u00e3o contextual e rotinas de comportamento** que permitem que o mesmo objeto de neg\u00f3cio (ex: Pedido de Venda, Cadastro de Produto) tenha campos, defaults, dom\u00ednios e valida\u00e7\u00f5es diferentes dependendo do contexto de neg\u00f3cio ativo. Funciona como **camada de media\u00e7\u00e3o** entre enquadradores (contextos de neg\u00f3cio), regras de incid\u00eancia e rotinas de comportamento, possibilitando configura\u00e7\u00e3o zero-code de varia\u00e7\u00f5es operacionais.

O m\u00f3dulo implementa: API CRUD de tipos de enquadrador e enquadradores com vig\u00eancia, objetos-alvo e campos-alvo, regras de incid\u00eancia com detec\u00e7\u00e3o de conflito em config-time (UNIQUE constraint + 422), rotinas de comportamento com ciclo de vida DRAFT\u2192PUBLISHED\u2192DEPRECATED e versionamento com fork, motor de avalia\u00e7\u00e3o runtime (sem cache, always fresh) que resolve conflitos pela regra mais restritiva, integra\u00e7\u00e3o com MOD-006 via `blocking_validations`, e registro de incid\u00eancias aplicadas via `domain_events`. Modelo de 9 tabelas com separa\u00e7\u00e3o clara entre enquadramento (framers + incidence) e comportamento (routines + items).

## 1.1 Problema que resolve

- **Problema:** Sem parametriza\u00e7\u00e3o contextual, toda varia\u00e7\u00e3o de comportamento de um objeto de neg\u00f3cio precisa ser codificada como l\u00f3gica fixa no c\u00f3digo-fonte, tornando o sistema inflex\u00edvel para cen\u00e1rios operacionais distintos.
- **Impacto hoje:** Cada nova opera\u00e7\u00e3o, classe de produto ou tipo de documento exige deploy com c\u00f3digo novo. Regras de neg\u00f3cio ficam espalhadas em `if/else` n\u00e3o audit\u00e1veis.
- **Resultado esperado:** Motor de parametriza\u00e7\u00e3o configur\u00e1vel via admin que aplica comportamentos (visibilidade, obrigatoriedade, defaults, dom\u00ednios, valida\u00e7\u00f5es, evid\u00eancias) por contexto de neg\u00f3cio, sem necessidade de altera\u00e7\u00e3o de c\u00f3digo.

## 1.2 P\u00fablico-alvo (personas e perfis)

| Persona | Scope requerido | A\u00e7\u00f5es dispon\u00edveis |
|---|---|---|
| **Configurador (leitura)** | `param:framer:read` + `param:routine:read` | Visualizar enquadradores, objetos, regras, rotinas e hist\u00f3rico |
| **Configurador (escrita)** | `param:framer:write` + `param:routine:write` | Criar/editar enquadradores, regras de incid\u00eancia, rotinas DRAFT |
| **Publicador** | `param:routine:publish` | Publicar rotinas (DRAFT \u2192 PUBLISHED) |
| **Administrador** | `param:framer:delete` | Inativar enquadradores e regras de incid\u00eancia |
| **Motor (sistema)** | `param:engine:evaluate` | Chamar motor de avalia\u00e7\u00e3o (usado por MOD-006 e frontend) |

## 1.3 M\u00e9tricas de sucesso (OKRs)

| # | M\u00e9trica | Alvo |
|---|---|---|
| OKR-1 | Conflito de incid\u00eancia bloqueado no cadastro; safety net runtime (mais restritivo vence) funcional | 100% |
| OKR-2 | Rotina PUBLISHED rejeita edi\u00e7\u00e3o | 100% |
| OKR-3 | `routine.applied` em domain_events para cada avalia\u00e7\u00e3o com efeito | 100% |
| OKR-4 | MOD-006 bloqueia transi\u00e7\u00e3o por `blocking_validations` do motor | 100% |

## 2. Escopo

### Inclui

- API CRUD de Tipos de Enquadrador e Enquadradores com vig\u00eancia e versionamento (F01)
- API CRUD de Objetos-Alvo e Campos-Alvo (F01)
- API CRUD de Regras de Incid\u00eancia com detec\u00e7\u00e3o de conflito em config-time (F01)
- API CRUD de Rotinas de Comportamento com itens e ciclo DRAFT\u2192PUBLISHED\u2192DEPRECATED (F02)
- Fork de rotinas PUBLISHED com c\u00f3pia de itens e links (F02)
- Motor de Avalia\u00e7\u00e3o runtime sem cache \u2014 sempre ao vivo (F03)
- Resolu\u00e7\u00e3o de conflito em duas camadas: config-time 422 + runtime mais restritivo vence (F03)
- Integra\u00e7\u00e3o com MOD-006 via `blocking_validations` no motor (F03)
- Registro de incid\u00eancias aplicadas via `domain_events` com `routine.applied` (F03)
- UX Configurador de Enquadradores com matriz de incid\u00eancia (UX-PARAM-001) (F04)
- UX Cadastro de Rotinas com split-view editor e dry-run (UX-ROTINA-001) (F05)

### N\u00e3o inclui

- Rotinas de Integra\u00e7\u00e3o (Protheus/TOTVS) \u2014 MOD-008
- Motor de aprova\u00e7\u00e3o de rotinas via fluxo formal \u2014 MOD-009
- Avalia\u00e7\u00e3o de regras em batch/importa\u00e7\u00e3o em massa \u2014 roadmap futuro

### Premissas e Restri\u00e7\u00f5es

- **Premissas:** MOD-006 prov\u00ea o motor de transi\u00e7\u00e3o que consome o endpoint `/routine-engine/evaluate`. MOD-003 prov\u00ea estrutura organizacional. MOD-000 prov\u00ea auth, RBAC e cat\u00e1logo de scopes.
- **Restri\u00e7\u00f5es:** Nenhum cache Redis no motor de avalia\u00e7\u00e3o \u2014 consist\u00eancia obrigat\u00f3ria. Rotinas PUBLISHED s\u00e3o imut\u00e1veis \u2014 fork \u00e9 o \u00fanico caminho para modifica\u00e7\u00e3o. UNIQUE constraint em `(framer_id, target_object_id)` impede conflitos no cadastro.

## 3. N\u00edvel de Arquitetura

**N\u00edvel 2 \u2014 DDD-lite + Full Clean** (DOC-ESC-001 \u00a77)

M\u00f3dulo com dom\u00ednio rico: motor de avalia\u00e7\u00e3o com 6 passos (find incidence \u2192 find routines \u2192 evaluate items \u2192 resolve conflicts \u2192 construct response \u2192 persist events), ciclo de vida de rotinas (DRAFT\u2192PUBLISHED\u2192DEPRECATED) com invariante de imutabilidade em PUBLISHED, fork com c\u00f3pia deep de itens e links, resolu\u00e7\u00e3o de conflito em duas camadas (config-time UNIQUE + runtime safety net por restritividade), 9 tabelas pr\u00f3prias, 23 endpoints, integra\u00e7\u00e3o com MOD-006 (blocking_validations), e domain events com `routine.applied`.

### Justificativa (Score DOC-ESC-001 \u00a74.2: 5/6)

| Gatilho | Presente | Evid\u00eancia |
|---|---|---|
| Estado/workflow | **SIM** | Ciclo DRAFT\u2192PUBLISHED\u2192DEPRECATED; fork com versionamento; vig\u00eancia de enquadradores (valid_from/valid_until) |
| Compliance/auditoria | **SIM** | domain_events com `routine.applied`, versionamento com change_reason obrigat\u00f3rio, imutabilidade PUBLISHED |
| Concorr\u00eancia/consist\u00eancia | **SIM** | UNIQUE constraint em incidence_rules, motor sem cache (always fresh), conflito runtime resolvido por restritividade |
| Integra\u00e7\u00f5es externas cr\u00edticas | **N\u00c3O** | Sem providers externos; integra MOD-006 (motor transi\u00e7\u00e3o) e MOD-000 (RBAC) |
| Multi-tenant/escopo por cliente | **SIM** | `tenant_id` em queries, ACL via 7 scopes `param:*` |
| Regras cruzadas/reuso alto | **SIM** | Motor de avalia\u00e7\u00e3o consumido por MOD-006 e frontend; rotinas compartilhadas entre enquadradores |

## 4. Depend\u00eancias

### Depende de

| M\u00f3dulo | O que consome |
|---|---|
| MOD-000 (Foundation) | Auth, RBAC scopes (`param:*`), domain events, audit trail, tenant_id |
| MOD-003 (Estrutura Organizacional) | Contexto organizacional para enquadramento |
| MOD-006 (Execu\u00e7\u00e3o de Casos) | Motor de transi\u00e7\u00e3o consome `/routine-engine/evaluate` |

### Dependentes

| M\u00f3dulo | O que consome |
|---|---|
| MOD-008 (Integra\u00e7\u00e3o Protheus) | Herda estrutura base de rotinas com `routine_type=INTEGRATION` |

## 5. Endpoints

| M\u00e9todo | Path | operationId | Scope |
|---|---|---|---|
| GET | /api/v1/admin/framer-types | `admin_framer_types_list` | `param:framer:read` |
| POST | /api/v1/admin/framer-types | `admin_framer_types_create` | `param:framer:write` |
| GET | /api/v1/admin/framers | `admin_framers_list` | `param:framer:read` |
| POST | /api/v1/admin/framers | `admin_framers_create` | `param:framer:write` |
| PATCH | /api/v1/admin/framers/:id | `admin_framers_update` | `param:framer:write` |
| DELETE | /api/v1/admin/framers/:id | `admin_framers_delete` | `param:framer:delete` |
| GET | /api/v1/admin/target-objects | `admin_target_objects_list` | `param:framer:read` |
| POST | /api/v1/admin/target-objects | `admin_target_objects_create` | `param:framer:write` |
| POST | /api/v1/admin/target-objects/:id/fields | `admin_target_fields_create` | `param:framer:write` |
| GET | /api/v1/admin/incidence-rules | `admin_incidence_rules_list` | `param:framer:read` |
| POST | /api/v1/admin/incidence-rules | `admin_incidence_rules_create` | `param:framer:write` |
| PATCH | /api/v1/admin/incidence-rules/:id | `admin_incidence_rules_update` | `param:framer:write` |
| DELETE | /api/v1/admin/incidence-rules/:id | `admin_incidence_rules_delete` | `param:framer:delete` |
| GET | /api/v1/admin/routines | `admin_routines_list` | `param:routine:read` |
| POST | /api/v1/admin/routines | `admin_routines_create` | `param:routine:write` |
| GET | /api/v1/admin/routines/:id | `admin_routines_get` | `param:routine:read` |
| PATCH | /api/v1/admin/routines/:id | `admin_routines_update` | `param:routine:write (DRAFT only)` |
| POST | /api/v1/admin/routines/:id/publish | `admin_routines_publish` | `param:routine:publish` |
| POST | /api/v1/admin/routines/:id/fork | `admin_routines_fork` | `param:routine:write` |
| POST | /api/v1/admin/routines/:id/items | `admin_routine_items_create` | `param:routine:write` |
| PATCH | /api/v1/admin/routine-items/:id | `admin_routine_items_update` | `param:routine:write` |
| DELETE | /api/v1/admin/routine-items/:id | `admin_routine_items_delete` | `param:routine:write` |
| POST | /api/v1/routine-engine/evaluate | `routine_engine_evaluate` | `param:engine:evaluate` |

## 6. Novos Escopos \u2014 Amendment MOD-000-F12

| Escopo | Descri\u00e7\u00e3o |
|---|---|
| `param:framer:read` | Ver enquadradores, tipos, objetos, campos e regras |
| `param:framer:write` | Criar e editar enquadradores e regras de incid\u00eancia |
| `param:framer:delete` | Inativar enquadradores e regras |
| `param:routine:read` | Ver rotinas, itens e hist\u00f3rico |
| `param:routine:write` | Criar e editar rotinas (somente DRAFT) |
| `param:routine:publish` | Publicar rotina (DRAFT \u2192 PUBLISHED) |
| `param:engine:evaluate` | Chamar o motor de avalia\u00e7\u00e3o (usado por MOD-006 e frontend) |

## 7. Modelo de Dados (9 tabelas)

Detalhamento completo em [DATA-007](requirements/data/DATA-007.md).
"""

# ============================================================
# CHANGELOG.md
# ============================================================
files["CHANGELOG.md"] = f"""{AUTOMATION_HEADER}
# CHANGELOG - MOD-007

## Ciclo de Estabilidade do M\u00f3dulo

> \ud83d\udfe2 Verde = Conclu\u00eddo | \ud83d\udfe0 Laranja = Em Andamento | \ud83d\udfe5 Azul = Est\u00e1vel Ancestral | \u2b1c Cinza = Previsto

```mermaid
flowchart TD
    E1["1 - Hist\u00f3ria Geradora (\u00c1gil)"]
    E2["2 - Forja Arquitetural (Scaffold)"]
    E3(["3 - Stubs em DRAFT"])
    E4["4 - Enriquecimento Simult\u00e2neo BDD/TDD"]
    E5(["5 - Selo READY (Est\u00e1vel Imut\u00e1vel)"])
    E6["6 - Adendos Futuros (Amendments)"]

    E1 --> E2 --> E3 --> E4 --> E5 --> E6

    style E1  fill:#27AE60,color:#fff,stroke:#1E8449
    style E2  fill:#27AE60,color:#fff,stroke:#1E8449
    style E3  fill:#E67E22,color:#fff,stroke:#CA6F1E,font-weight:bold
    style E4  fill:#95A5A6,color:#fff,stroke:#7F8C8D
    style E5  fill:#95A5A6,color:#fff,stroke:#7F8C8D
    style E6  fill:#95A5A6,color:#fff,stroke:#7F8C8D
```

*O m\u00f3dulo est\u00e1 na **Etapa 3** \u2014 stubs gerados em DRAFT, aguardando enriquecimento.*

---

## Hist\u00f3rico de Vers\u00f5es

| Vers\u00e3o | Data | Respons\u00e1vel | Descri\u00e7\u00e3o |
|--------|------|-------------|-----------|
| 0.1.0 | 2026-03-19 | arquitetura | Baseline Inicial \u2014 scaffold gerado via `forge-module` a partir de US-MOD-007 (APPROVED). 9 tabelas, 23 endpoints, 5 features (F01\u2013F05), 7 scopes param:*. Stubs obrigat\u00f3rios criados: DATA-003, SEC-002. Todos os itens nascem em `estado_item: DRAFT`. |
"""

# ============================================================
# BR-007.md
# ============================================================
files["requirements/br/BR-007.md"] = f"""{AUTOMATION_HEADER}{BASELINE_TABLE}
# BR-007 \u2014 Regras de Neg\u00f3cio da Parametriza\u00e7\u00e3o Contextual e Rotinas

---

## BR-001 \u2014 Conflito de Incid\u00eancia Bloqueado no Cadastro (Config-time)

- **Regra:** O sistema impede a cria\u00e7\u00e3o de regras de incid\u00eancia duplicadas para o mesmo par (framer_id, target_object_id). Ao detectar conflito, retorna 422: "Conflito de incid\u00eancia detectado. Resolva o conflito antes de salvar."
- **Exemplo:** Enquadrador "Servi\u00e7o de Engenharia" j\u00e1 est\u00e1 vinculado ao objeto "Pedido de Venda". Tentativa de criar outra regra para o mesmo par retorna 422.
- **Exce\u00e7\u00f5es:** Nenhuma. UNIQUE constraint inegoci\u00e1vel.
- **Impacto:** STATE, COMPLIANCE

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-007, US-MOD-007-F01, DATA-007, SEC-007

---

## BR-002 \u2014 Runtime Safety Net (Mais Restritivo Vence)

- **Regra:** Se por exce\u00e7\u00e3o (dados legados, race condition) dois contextos conflitantes coexistirem em runtime, a regra mais restritiva vence. HIDE > SHOW, SET_REQUIRED > SET_OPTIONAL, dom\u00ednio menor prevalece. Campos n\u00e3o conflitantes s\u00e3o mesclados (union).
- **Exemplo:** Regra A diz SHOW campo X, Regra B diz HIDE campo X \u2192 HIDE prevalece.
- **Exce\u00e7\u00f5es:** Nenhuma. Regra de seguran\u00e7a inegoci\u00e1vel.
- **Impacto:** STATE, COMPLIANCE, SECURITY

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-007, US-MOD-007-F03, FR-007, SEC-007

---

## BR-003 \u2014 Rotina PUBLISHED \u00c9 Imut\u00e1vel

- **Regra:** Rotinas com status=PUBLISHED n\u00e3o podem ser editadas (PATCH retorna 422). Para modificar, \u00e9 obrigat\u00f3rio fazer fork, que cria nova vers\u00e3o em DRAFT com c\u00f3pia de todos os itens e links de incid\u00eancia.
- **Exemplo:** PATCH /admin/routines/:id em rotina PUBLISHED \u2192 422: "Rotinas publicadas s\u00e3o imut\u00e1veis. Crie uma nova vers\u00e3o."
- **Exce\u00e7\u00f5es:** Nenhuma. Imutabilidade garante auditoria.
- **Impacto:** STATE, COMPLIANCE

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-007, US-MOD-007-F02, FR-007, DATA-007

---

## BR-004 \u2014 C\u00f3digo de Enquadrador e Rotina \u00c9 Imut\u00e1vel

- **Regra:** O campo `codigo` de enquadradores e rotinas \u00e9 imut\u00e1vel ap\u00f3s cria\u00e7\u00e3o. Tentativa de altera\u00e7\u00e3o via PATCH \u00e9 ignorada ou retorna 422.
- **Impacto:** STATE, COMPLIANCE

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-007, US-MOD-007-F01, US-MOD-007-F02, DATA-007

---

## BR-005 \u2014 V\u00ednculo Rotina\u2194Incid\u00eancia Somente para PUBLISHED

- **Regra:** Apenas rotinas com status=PUBLISHED podem ser vinculadas a regras de incid\u00eancia via `routine_incidence_links`. Tentativa de vincular rotina DRAFT ou DEPRECATED retorna 422.
- **Impacto:** STATE

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-007, US-MOD-007-F02, DATA-007

---

## BR-006 \u2014 Motor de Avalia\u00e7\u00e3o Sem Cache

- **Regra:** Todas as chamadas ao motor de avalia\u00e7\u00e3o (`/routine-engine/evaluate`) executam ao vivo, sem cache Redis. Opera\u00e7\u00f5es cr\u00edticas exigem consist\u00eancia \u2014 zero risco de dado desatualizado.
- **Impacto:** STATE, COMPLIANCE

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-007, US-MOD-007-F03, FR-007, NFR-007

---

## BR-007 \u2014 Fork Obriga change_reason

- **Regra:** Ao fazer fork de uma rotina PUBLISHED, o campo `change_reason` \u00e9 obrigat\u00f3rio (m\u00ednimo 10 caracteres). O fork copia todos os itens (novos IDs) e links de incid\u00eancia.
- **Impacto:** COMPLIANCE

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-007, US-MOD-007-F02, DATA-007

---

## BR-008 \u2014 Publica\u00e7\u00e3o Exige M\u00ednimo 1 Item

- **Regra:** Rotina DRAFT s\u00f3 pode ser promovida para PUBLISHED se tiver pelo menos 1 routine_item vinculado.
- **Impacto:** STATE

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-007, US-MOD-007-F02, FR-007

---

## BR-009 \u2014 Vig\u00eancia de Enquadradores

- **Regra:** Enquadradores possuem `valid_from` e `valid_until`. O motor s\u00f3 considera enquadradores com vig\u00eancia ativa (valid_from <= now e (valid_until is null ou valid_until > now)).
- **Impacto:** STATE

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-007, US-MOD-007-F01, US-MOD-007-F03, DATA-007

---

## BR-010 \u2014 domain_events Somente com Efeito

- **Regra:** O motor s\u00f3 persiste `domain_events` com `event_type='routine.applied'` quando a avalia\u00e7\u00e3o teve efeito (rotinas aplicadas). Avalia\u00e7\u00f5es sem rotinas incidentes n\u00e3o geram evento.
- **Impacto:** STATE, COMPLIANCE

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-007, US-MOD-007-F03, DATA-003, SEC-002
"""

# ============================================================
# FR-007.md (stub - details in Write tool earlier, already created successfully? No it failed.)
# ============================================================
files["requirements/fr/FR-007.md"] = f"""{AUTOMATION_HEADER}{BASELINE_TABLE}
# FR-007 \u2014 Requisitos Funcionais da Parametriza\u00e7\u00e3o Contextual e Rotinas

---

## FR-001 \u2014 CRUD de Tipos de Enquadrador

- **Descri\u00e7\u00e3o:** Listar e criar tipos de enquadrador (OPERACAO, CLASSE_PRODUTO, TIPO_DOCUMENTO, CONTEXTO_PROCESSO).
- **Endpoints:** GET/POST /api/v1/admin/framer-types
- **Scope:** `param:framer:read`, `param:framer:write`
- **Prioridade:** Must
- **Done funcional:** Listagem retorna todos os tipos. Cria\u00e7\u00e3o valida unicidade do codigo.
- **Efeito colateral?** N\u00e3o
- **Depend\u00eancias:** BR-007, DATA-007, MOD-000

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-007-F01, BR-007, DATA-007

---

## FR-002 \u2014 CRUD de Enquadradores com Vig\u00eancia

- **Descri\u00e7\u00e3o:** Criar, listar, atualizar e inativar enquadradores com vig\u00eancia. Campo `codigo` imut\u00e1vel e auto-uppercase.
- **Endpoints:** GET/POST /api/v1/admin/framers, PATCH/DELETE /api/v1/admin/framers/:id
- **Scope:** `param:framer:read`, `param:framer:write`, `param:framer:delete`
- **Prioridade:** Must
- **Done funcional:** Codigo UNIQUE uppercase. PATCH ignora codigo. DELETE soft-delete.
- **Efeito colateral?** N\u00e3o
- **Depend\u00eancias:** BR-004, BR-009, DATA-007

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-007-F01, BR-004, BR-009, DATA-007

---

## FR-003 \u2014 CRUD de Objetos-Alvo e Campos-Alvo

- **Descri\u00e7\u00e3o:** Listar/criar objetos-alvo e campos-alvo.
- **Endpoints:** GET/POST /api/v1/admin/target-objects, POST .../fields
- **Scope:** `param:framer:read`, `param:framer:write`
- **Prioridade:** Must
- **Depend\u00eancias:** DATA-007

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-007-F01, DATA-007

---

## FR-004 \u2014 CRUD de Regras de Incid\u00eancia com Detec\u00e7\u00e3o de Conflito

- **Descri\u00e7\u00e3o:** CRUD de regras (framer \u2192 target_object). UNIQUE constraint bloqueia duplicatas com 422.
- **Endpoints:** GET/POST/PATCH/DELETE /api/v1/admin/incidence-rules
- **Scope:** `param:framer:read`, `param:framer:write`, `param:framer:delete`
- **Prioridade:** Must
- **Depend\u00eancias:** BR-001, DATA-007

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-007-F01, BR-001, DATA-007

---

## FR-005 \u2014 CRUD de Rotinas de Comportamento com Versionamento

- **Descri\u00e7\u00e3o:** Criar DRAFT, listar por status, atualizar (s\u00f3 DRAFT), publicar, fork, deprecar.
- **Endpoints:** GET/POST/PATCH /api/v1/admin/routines, POST .../publish, POST .../fork
- **Scope:** `param:routine:read`, `param:routine:write`, `param:routine:publish`
- **Prioridade:** Must
- **Done funcional:** PATCH s\u00f3 DRAFT. Publish exige min 1 item. Fork copia itens + links, exige change_reason (min 10 chars). PUBLISHED imut\u00e1vel.
- **Efeito colateral?** Sim (Publish emite domain event)
- **Depend\u00eancias:** BR-003, BR-005, BR-007, BR-008, DATA-007

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-007-F02, BR-003, BR-005, BR-007, BR-008, DATA-007

---

## FR-006 \u2014 CRUD de Itens da Rotina

- **Descri\u00e7\u00e3o:** Criar, atualizar e remover itens (s\u00f3 DRAFT). 7 tipos de item. Reordena\u00e7\u00e3o por campo `ordem`.
- **Endpoints:** POST /api/v1/admin/routines/:id/items, PATCH/DELETE /api/v1/admin/routine-items/:id
- **Scope:** `param:routine:write`
- **Prioridade:** Must
- **Depend\u00eancias:** BR-003, DATA-007

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-007-F02, BR-003, DATA-007

---

## FR-007 \u2014 Motor de Avalia\u00e7\u00e3o (Runtime)

- **Descri\u00e7\u00e3o:** Endpoint que recebe contexto e retorna campos vis\u00edveis/ocultos, obrigat\u00f3rios/opcionais, defaults, restri\u00e7\u00f5es de dom\u00ednio, valida\u00e7\u00f5es e blocking_validations.
- **Endpoint:** POST /api/v1/routine-engine/evaluate
- **Scope:** `param:engine:evaluate`
- **Prioridade:** Must
- **Algoritmo (6 passos):**
  1. Busca regras de incid\u00eancia ativas para o contexto
  2. Busca rotinas PUBLISHED vinculadas via routine_incidence_links
  3. Avalia itens das rotinas por ordem
  4. Resolve conflitos pela regra mais restritiva (safety net)
  5. Constr\u00f3i resposta estruturada
  6. Persiste domain_event `routine.applied` (somente se houve efeito)
- **Response:** `{{ visible_fields, hidden_fields, required_fields, optional_fields, defaults, domain_restrictions, validations, blocking_validations, applied_routines }}`
- **Done funcional:** Sem cache. blocking_validations integra com MOD-006. X-Correlation-ID propagado. condition_expr ignorado em v1.
- **Efeito colateral?** Sim (Persiste domain_event)
- **Depend\u00eancias:** BR-002, BR-006, BR-009, BR-010, DATA-003, DATA-007, MOD-006

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-007-F03, BR-002, BR-006, BR-009, BR-010, DATA-003, SEC-002

---

## FR-008 \u2014 UX Configurador de Enquadradores (UX-PARAM-001)

- **Descri\u00e7\u00e3o:** Tela de configura\u00e7\u00e3o com tabela de enquadradores, painel de objetos-alvo, matriz de incid\u00eancia visual, simula\u00e7\u00e3o dry-run.
- **Scope:** `param:framer:read`, `param:framer:write`
- **Prioridade:** Must
- **Depend\u00eancias:** FR-001, FR-002, FR-003, FR-004, FR-007, UX-007

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-007-F04, UX-007

---

## FR-009 \u2014 UX Cadastro de Rotinas (UX-ROTINA-001)

- **Descri\u00e7\u00e3o:** Tela com listagem, split-view editor, formul\u00e1rio adaptativo, drag-and-drop, auto-save 600ms, publica\u00e7\u00e3o, fork, readonly mode, preview dry-run, timeline de vers\u00f5es.
- **Scope:** `param:routine:read`, `param:routine:write`, `param:routine:publish`
- **Prioridade:** Must
- **Depend\u00eancias:** FR-005, FR-006, FR-007, UX-007

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-007-F05, UX-007
"""

# Write all files
for fpath, content in files.items():
    full = os.path.join(base, fpath)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Created: {fpath}")

print("\\nDone! All core files created.")
