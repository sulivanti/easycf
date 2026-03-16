# Pendencias — User Stories (MOD-003 a MOD-011)

> Arquivo temporario de acompanhamento. Gerado em 2026-03-15.

---

## Status Geral

| Modulo   | Titulo                                | Features | Status |
|----------|---------------------------------------|----------|--------|
| MOD-003  | Estrutura Organizacional              | 3        | READY  |
| MOD-004  | Identidade Avancada                   | 4        | READY  |
| MOD-005  | Modelagem de Processos (Blueprint)    | 4        | READY  |
| MOD-006  | Execucao de Casos (Instances)         | 4        | READY  |
| MOD-007  | Parametrizacao Contextual e Rotinas   | 5        | READY  |
| MOD-008  | Integracao Dinamica Protheus/TOTVS    | 5        | READY  |
| MOD-009  | Controle de Movimentos Sob Aprovacao  | 5        | READY  |
| MOD-010  | MCP e Automacao Governada             | 5        | READY  |
| MOD-011  | SmartGrid — Edicao em Massa           | 5        | READY  |

---

## Pendencias por Modulo

### MOD-003 — Estrutura Organizacional

- [ ] Aprovacao do owner
- [ ] Dependencia em MOD-000-F07 (tenant) e MOD-000-F12
- [ ] SLA: tree query CTE < 200ms com 500 nos

### MOD-004 — Identidade Avancada

- [ ] Aprovacao do owner
- [ ] Dependencia em MOD-003-F01 (org structure API)
- [ ] Background job de expiracao de delegacoes (intervalo 5min)
- [ ] Segregacao de deveres (shares: authorized_by != grantor_id)

### MOD-005 — Modelagem de Processos

- [ ] Aprovacao do owner
- [ ] Editor visual deve suportar 50 nos sem falha visual
- [ ] Ciclos publicados sao imutaveis — fork para nova versao

### MOD-006 — Execucao de Casos

- [ ] Aprovacao do owner
- [ ] Dependencia em MOD-005 (ciclos/estagios definidos)
- [ ] Motor de transicao com 5 etapas de validacao (gate, role, evidence)
- [ ] cycle_version_id congelado na criacao da instancia

### MOD-007 — Parametrizacao Contextual

- [ ] Aprovacao do owner
- [ ] Motor de avaliacao com 6 etapas + cache Redis (30s)
- [ ] blocking_validations bloqueiam transicoes do MOD-006
- [ ] Resolucao de conflito por prioridade (2 contextos conflitantes)

### MOD-008 — Integracao Dinamica Protheus/TOTVS

- [ ] Aprovacao do owner
- [ ] Herda behavior_routines do MOD-007 (routine_type=INTEGRATION)
- [ ] Outbox Pattern + BullMQ (concurrency 10, exponential backoff)
- [ ] DLQ com reprocessamento exigindo justificativa (min 10 chars)

### MOD-009 — Controle de Movimentos Sob Aprovacao

- [ ] Aprovacao do owner
- [ ] Middleware interceptor para motor de controle
- [ ] Resposta 202 quando movimento PENDING
- [ ] Override com justificativa min 20 chars + auditoria completa
- [ ] Segregacao: solicitante != aprovador (CHECK constraint)

### MOD-010 — MCP e Automacao Governada

- [ ] Aprovacao do owner
- [ ] API key 256 bits, bcrypt >= 12 rounds, retornada uma unica vez
- [ ] Blocklist de escopos de aprovacao (agents nunca herdam do owner)
- [ ] 3 politicas de execucao: DIRECT, CONTROLLED (via MOD-009), EVENT_ONLY
- [ ] Deteccao de privilege escalation + alerta

### MOD-011 — SmartGrid: Componente de Grade com Edicao em Massa

- [ ] Aprovacao do owner
- [ ] **PEND-SGR-01** — Contrato de mapeamento: resultado do motor → estado visual da linha (bloqueia F02)
- [ ] **PEND-SGR-02** — Suporte a `current_record_state` no motor MOD-007-F03 (bloqueia F01, F03, F04)
- [ ] Dependencia em MOD-007-F03 (POST /routine-engine/evaluate)
- [ ] Dependencia em MOD-007-F01 (context_framers com framer_type=OPERACAO)
- [ ] Dependencia em MOD-007-F02 (routine_items: FIELD_VISIBILITY, REQUIRED, DEFAULT, DOMAIN, VALIDATION)
- [ ] 3 Screen Manifests em DRAFT (UX-SGR-001, UX-SGR-002, UX-SGR-003) — aguardam resolucao das PENDs

#### Detalhamento das Pendencias Bloqueantes

**PEND-SGR-01 — Contrato motor → estado visual**

| Item                | Detalhe                                                    |
|---------------------|------------------------------------------------------------|
| Descricao           | Definir como a resposta do motor mapeia para estado visual |
| Bloqueia            | F02 (Grade de Inclusao em Massa), manifest UX-SGR-001      |
| O que falta definir | `blocking_validations[]` → estado ❌ (erro/bloqueio)       |
|                     | `validations[]` → estado ⚠️ (warning)                     |
|                     | resposta vazia → estado ✅ (valido)                        |
|                     | Se warnings permitem ou bloqueiam o save                   |
|                     | Regras de rendering de tooltip/mensagem por tipo           |
| Resolucao necessaria| Antes de iniciar F02 e promover UX-SGR-001 de DRAFT → READY|

**PEND-SGR-02 — current_record_state no motor**

| Item                | Detalhe                                                    |
|---------------------|------------------------------------------------------------|
| Descricao           | Amendment no POST /routine-engine/evaluate para aceitar estado atual do registro |
| Bloqueia            | F01 (Amendment backend), F03 (Formulario Alteracao), F04 (Grade Exclusao) |
| Manifests bloqueados| UX-SGR-002, UX-SGR-003 (ambos DRAFT)                      |
| Contrato proposto   | Novo campo opcional no body: `current_record_state?: { status, tipo, ... }` |
| Regras do amendment | Campo nullable (backward compatible)                       |
|                     | Cache Redis bypass quando presente (dados dinamicos)       |
|                     | Campo ausente no state → condition avalia como `false`     |
|                     | domain_events gerados normalmente                          |
| Testes exigidos     | Condition match, backward compat, partial fields, cache bypass |
| Resolucao necessaria| Antes de iniciar F01, F03, F04 e promover UX-SGR-002/003   |

#### Status por Feature

| Feature | Tema                                      | Tipo     | Bloqueador  | Criterios |
|---------|-------------------------------------------|----------|-------------|-----------|
| F01     | Amendment: current_record_state no motor  | Backend  | PEND-SGR-02 | 4         |
| F02     | Grade de Inclusao em Massa (UX-SGR-001)   | UX       | PEND-SGR-01 | 11        |
| F03     | Formulario de Alteracao (UX-SGR-002)      | UX       | PEND-SGR-02 | 4         |
| F04     | Grade de Exclusao em Massa (UX-SGR-003)   | UX       | PEND-SGR-02 | 5         |
| F05     | Acoes em Massa sobre Linhas               | UX       | Nenhum      | 6         |

---

## Cadeia de Dependencias Critica

### Visao Geral

```
MOD-000 (Foundation)
  └─> MOD-001/002 (UX Shell + Usuarios)
       └─> MOD-003 (Org) ─> MOD-004 (Identidade)
            └─> MOD-005 (Processos) ─> MOD-006 (Casos)
                 └─> MOD-007 (Params) ─> MOD-008 (Integracao)
                 │    └─> MOD-011 (SmartGrid) [consome motor MOD-007]
                      └─> MOD-009 (Aprovacoes) ─> MOD-010 (MCP)
```

### Detalhamento de Cada Elo

#### MOD-000 (Foundation) ─> Todos os modulos

MOD-000 e a base de toda a cadeia. Fornece:

| Artefato           | Feature    | Consumido por                           |
|--------------------|------------|-----------------------------------------|
| `users` table      | F05        | Todos (created_by, owner, etc.)         |
| `tenants` table    | F07        | MOD-003 (org_unit_tenant_links)         |
| `roles` table      | F06        | MOD-004, MOD-009                        |
| `role_scopes`      | F06        | Todos (validacao de permissao)          |
| `tenant_users`     | F09        | MOD-004, MOD-006                        |
| Catalogo de scopes | F12        | Todos (cada modulo faz amendment)       |
| Domain events infra| F14        | Todos (emit/listen de eventos)          |
| Auth endpoints     | F01, F04   | MOD-001 (login, logout, forgot, reset)  |
| `auth_me` endpoint | F08        | MOD-001 (perfil + saudacao)             |

**Impacto se MOD-000 atrasar:** Bloqueio total. Nenhum modulo pode iniciar sem F05, F06, F07, F12.

---

#### MOD-001/002 (UX Shell + Usuarios) ─> MOD-003

MOD-001 fornece o Application Shell (layout, sidebar, router) que todos os modulos UX subsequentes utilizam como container.

- **MOD-001-F01:** Auth Shell + Layout (manifests UX-AUTH-001, UX-SHELL-001)
- **MOD-001-F03:** Dashboard (manifest UX-DASH-001)
- **MOD-002:** Gestao de usuarios (API backend em MOD-000-F05)

**Impacto se MOD-001 atrasar:** Todas as features UX de MOD-003 a MOD-010 ficam sem container. Backend pode avancar independente.

---

#### MOD-003 (Org) ─> MOD-004, MOD-005, MOD-006, MOD-007, MOD-009

MOD-003 cria a hierarquia organizacional (N1-N4) e vincula tenants (N5).

| Artefato consumido       | Tabela/API             | Quem consome                          |
|--------------------------|------------------------|---------------------------------------|
| Unidades organizacionais | `org_units`            | MOD-004 (user_org_scopes.org_unit_id) |
| Arvore hierarquica       | GET `/org-units/tree`  | MOD-004-F03 (UX breadcrumb)          |
| Contexto organizacional  | `org_units.id`         | MOD-006 (case.org_unit_id)           |
| Enquadramento contextual | `org_units`            | MOD-007 (framers de contexto)        |
| Alcada por nivel org     | `org_units`            | MOD-009 (approver_type=ORG_LEVEL)    |

**Eventos emitidos:** `org.unit_created`, `org.unit_updated`, `org.unit_deleted`, `org.tenant_linked`, `org.tenant_unlinked`

**Dependencias proprias:**
- MOD-000-F07 (`tenants` para N5)
- MOD-000-F12 (amendment: `org:unit:read`, `org:unit:write`, `org:unit:delete`)

**Impacto se MOD-003 atrasar:** MOD-004 nao pode vincular usuarios a unidades. MOD-009 nao pode usar alcada por nivel organizacional.

---

#### MOD-004 (Identidade) ─> MOD-006, MOD-009, MOD-010

MOD-004 gerencia escopos usuario-organizacao, compartilhamentos e delegacoes.

| Artefato consumido      | Tabela/API              | Quem consome                           |
|-------------------------|-------------------------|----------------------------------------|
| Escopos org do usuario  | `user_org_scopes`       | MOD-006 (validacao de papel no caso)   |
| Delegacoes temporarias  | `access_delegations`    | MOD-006-F02 (case_assignments.delegation_id) |
| Shares formais          | `access_shares`         | MOD-009 (aprovadores delegados)        |
| Bloqueio de scopes      | Regra de negocio        | MOD-010 (agents nao herdam approval scopes) |

**Eventos emitidos:** `identity.org_scope_granted/revoked/expired`, `identity.share_created/revoked/expired`, `identity.delegation_created/revoked/expired`

**Background job:** `expire_identity_grants` (BullMQ, ciclo 5min) — expira shares e delegacoes com `valid_until < now()`

**Dependencias proprias:**
- MOD-003-F01 (`org_units` para user_org_scopes)
- MOD-000-F06 (`roles` para heranca de scopes)
- MOD-000-F12 (amendment: 5 novos scopes de identidade)

**Impacto se MOD-004 atrasar:** MOD-006 nao pode atribuir responsaveis com delegacao. MOD-010 perde a regra de bloqueio de escopos.

---

#### MOD-005 (Processos Blueprint) ─> MOD-006

MOD-005 define a estrutura de processos (ciclos, macroetapas, estagios, gates, papeis, transicoes). MOD-006 executa instancias desses blueprints.

| Artefato consumido       | Tabela                   | Quem consome                    |
|--------------------------|--------------------------|---------------------------------|
| Ciclos publicados        | `process_cycles`         | MOD-006-F01 (cycle_version_id) |
| Macroetapas              | `process_macro_stages`   | MOD-006-F03 (barra progresso)  |
| Estagios                 | `process_stages`         | MOD-006-F01 (current_stage_id) |
| Gates                    | `process_gates`          | MOD-006-F02 (gate_instances)   |
| Papeis                   | `process_roles`          | MOD-006-F02 (case_assignments) |
| Vinculos estagio-papel   | `stage_role_links`       | MOD-006-F01 (validacao papel)  |
| Transicoes               | `stage_transitions`      | MOD-006-F01 (motor transicao)  |

**Eventos emitidos:** `process.cycle_created/published/forked/deprecated`, `process.macro_stage_created`, `process.stage_created`

**Regra critica:** Ciclos PUBLISHED sao imutaveis. Qualquer alteracao exige fork (nova versao).

**4 tipos de gate:** APPROVAL (exige can_approve), DOCUMENT, CHECKLIST, INFORMATIVE

**Dependencias proprias:**
- MOD-000-F12 (amendment: 4 novos scopes de processo)

**Impacto se MOD-005 atrasar:** MOD-006 nao pode abrir casos — sem blueprint nao ha instancia.

---

#### MOD-006 (Casos) ─> MOD-007, MOD-008, MOD-009, MOD-010

MOD-006 e o modulo central de execucao. Seus domain events disparam acoes em 4 modulos downstream.

| Artefato consumido         | Tabela/API/Evento              | Quem consome                           |
|----------------------------|--------------------------------|----------------------------------------|
| Eventos de transicao       | `case.stage_transitioned`      | MOD-008-F03 (trigger_events dispatch)  |
| Instancias de caso         | `case_instances`               | MOD-008-F03 (integration_call_logs.case_id) |
| Motor de transicao (hook)  | Step 5 do motor                | MOD-007-F03 (chama /routine-engine/evaluate) |
| Operacoes de caso          | API `/cases/:id/*`             | MOD-009-F02 (movement control intercept) |
| Acoes sobre casos          | API `/cases/:id/*`             | MOD-010-F02 (MCP gateway dispatch)     |

**Motor de transicao (5 etapas):**
1. Caso existe e nao esta terminal/cancelado
2. Transicao e valida (existe em stage_transitions)
3. Usuario tem papel exigido (stage_role_links)
4. Todos os gates estao resolvidos
5. Evidencias obrigatorias estao presentes

**Eventos emitidos:** `case.opened`, `case.stage_transitioned`, `case.completed`, `case.cancelled`, `case.on_hold`, `case.resumed`, `case.gate_resolved`, `case.gate_waived`, `case.assignment_created`, `case.assignment_replaced`, `case.event_recorded`

**Regra critica:** `cycle_version_id` congelado na abertura — o caso sempre usa o blueprint da versao em que foi criado.

**Dependencias proprias:**
- MOD-005-F01 e F02 (blueprint completo)
- MOD-004-F02 (`access_delegations` para assignments)
- MOD-003-F01 (`org_units` para case.org_unit_id)

**Impacto se MOD-006 atrasar:** MOD-007 perde o hook de avaliacao. MOD-008 perde o trigger de integracao. MOD-009 perde operacoes para interceptar.

---

#### MOD-007 (Params) ─> MOD-006 (runtime), MOD-008, MOD-011

MOD-007 define parametrizacao contextual e rotinas de comportamento. Tem integracao runtime bidirecional com MOD-006 e MOD-011.

| Artefato consumido         | Tabela/API                          | Quem consome                        |
|----------------------------|-------------------------------------|-------------------------------------|
| Motor de avaliacao         | POST `/routine-engine/evaluate`     | MOD-006-F01 (step 5 do motor)      |
| Motor de avaliacao         | POST `/routine-engine/evaluate`     | MOD-011 (1x por linha da grade)    |
| blocking_validations       | Resposta do motor                   | MOD-006-F01 (bloqueia com 422)     |
| blocking_validations       | Resposta do motor                   | MOD-011-F02/F03/F04 (estado visual)|
| behavior_routines (heranca)| `behavior_routines` table           | MOD-008-F01 (routine_type=INTEGRATION) |
| Versionamento de rotinas   | `routine_version_history`           | MOD-008-F02 (herda modelo)         |
| context_framers (OPERACAO) | `context_framers` table             | MOD-011 (configura colunas grade)  |
| routine_items (5 tipos)    | `routine_items` table               | MOD-011 (FIELD_VIS, REQ, DEF, DOM, VAL) |

**Motor de avaliacao (6 etapas):**
1. Encontra regras de incidencia aplicaveis ao contexto
2. Resolve rotinas vinculadas (PUBLISHED only)
3. Merge de conflitos por prioridade (menor = mais precedente)
4. Avalia itens da rotina (7 tipos: FIELD_VISIBILITY, REQUIRED, DEFAULT, DOMAIN, DERIVATION, VALIDATION, EVIDENCE)
5. Cache Redis (TTL 30s)
6. Retorna resultado com blocking_validations

**7 tipos de item de rotina:**
- FIELD_VISIBILITY — visibilidade de campos
- REQUIRED — campos obrigatorios
- DEFAULT — valores padrao
- DOMAIN — dominio de valores
- DERIVATION — calculo derivado
- VALIDATION (is_blocking) — validacao que pode bloquear
- EVIDENCE — evidencias exigidas

**Eventos emitidos:** `param.framer_type_created`, `param.framer_created/expired`, `param.incidence_rule_created/updated`, `routine.applied`

**Dependencias proprias:**
- MOD-000-F12 (amendment: 7 novos scopes)

**Impacto se MOD-007 atrasar:** MOD-006 perde parametrizacao contextual nas transicoes. MOD-008 nao tem modelo de rotinas para herdar. MOD-011 fica totalmente bloqueado (depende do motor para todas as features).

---

#### MOD-008 (Integracao) ─> MOD-009, MOD-010

MOD-008 executa integracoes com Protheus/TOTVS via BullMQ e Outbox Pattern.

| Artefato consumido          | Tabela/API                          | Quem consome                        |
|-----------------------------|-------------------------------------|-------------------------------------|
| Rotinas de integracao       | `integration_routines`              | MOD-009 (movement control sobre execucao) |
| Logs de execucao            | `integration_call_logs`             | MOD-010 (MCP pode vincular acoes)  |
| Servicos cadastrados        | `integration_services`              | MOD-010 (MCP actions linkam servicos) |

**Arquitetura de execucao:**
- **Outbox Pattern:** INSERT log na mesma transacao de negocio (garante zero perda)
- **BullMQ:** concurrency=10, sem retry interno (gerenciado pelo Outbox)
- **Retry:** exponential backoff `2^(attempt-1)` segundos
- **DLQ:** apos `retry_max` tentativas, move para Dead Letter Queue
- **Reprocessamento:** cria novo log com `parent_log_id`, exige justificativa (min 10 chars)

**trigger_events:** array configuravel — ex: `["case.stage_transitioned"]` dispara integracao automaticamente

**Eventos emitidos:** `integration.service_created/updated`, `integration.routine_configured`, `integration.call_queued/completed/failed/dlq/reprocessed`

**Dependencias proprias:**
- MOD-007-F01/F02 (`behavior_routines` com `routine_type=INTEGRATION`)
- MOD-006-F01 (domain events como trigger)
- MOD-000-F12 (amendment: 6 novos scopes)

**Impacto se MOD-008 atrasar:** Integracoes Protheus/TOTVS nao funcionam. MOD-010 perde acoes de integracao no catalogo MCP.

---

#### MOD-009 (Aprovacoes) ─> MOD-010

MOD-009 intercepta operacoes criticas e exige aprovacao por alcada.

| Artefato consumido          | Tabela/API                          | Quem consome                        |
|-----------------------------|-------------------------------------|-------------------------------------|
| Motor de controle           | POST `/movement-engine/evaluate`    | MOD-010-F02 (policy=CONTROLLED)    |
| Regras de controle          | `movement_control_rules`            | MOD-010-F02 (avaliacao de acoes MCP) |
| Inbox de aprovacoes         | GET `/my/approvals`                 | MOD-010-F05 (link UX-APROV-001)    |

**4 criterios de aprovacao:**
1. **Valor** — threshold monetario (value_threshold)
2. **Hierarquia** — nivel organizacional do aprovador (approver_type=ORG_LEVEL)
3. **Origem** — tipo de origem da operacao (origin_type: UI, API, MCP, BATCH)
4. **Objeto+Operacao** — tipo do objeto + tipo da operacao

**Fluxo do motor:**
1. Recebe operacao via middleware
2. Avalia regras aplicaveis (multiplas regras: apenas a de menor prioridade incide)
3. `controlled=false` → operacao executa livremente
4. `controlled=true` → cria `controlled_movement` + `approval_instances` nivel 1
5. Retorna 202 com `movement_id`
6. Aprovacao nivel 1 → auto-cria nivel 2 (se cadeia tem mais niveis)
7. Ultimo nivel aprovado → executa operacao original

**Regras de segregacao:**
- `solicitante != aprovador` (CHECK constraint no banco + validacao no service)
- Override exige scope especial + justificativa min 20 chars + auditoria completa

**Eventos emitidos:** `movement.created/approved/rejected/executed/failed/cancelled/overridden/escalated/timeout`

**Dependencias proprias:**
- MOD-003-F01 (`org_units` para approver_type=ORG_LEVEL)
- MOD-000-F06 (`roles` para approver_type=ROLE)
- MOD-000-F12 (amendment: 7 novos scopes incl. `approval:decide`, `approval:override`)

**Impacto se MOD-009 atrasar:** MOD-010 perde governanca — agentes MCP com policy CONTROLLED executam sem controle.

---

#### MOD-010 (MCP) ─> Modulo Final (cadeia principal)

MOD-010 e o ultimo elo da cadeia principal. Nao possui dependentes.

**Dependencias diretas:**
- MOD-009-F02 (`/movement-engine/evaluate` para policy=CONTROLLED)
- MOD-000-F12 (amendment: 6 novos scopes)
- MOD-004 (regra: agentes NUNCA herdam escopos de aprovacao do owner)

**3 politicas de execucao (dispatch):**

| Politica      | Comportamento                              | Resposta |
|---------------|--------------------------------------------|----------|
| DIRECT        | Executa imediatamente sem aprovacao        | 200      |
| CONTROLLED    | Cria movimento via MOD-009 motor           | 202      |
| EVENT_ONLY    | Emite evento sem escrita no banco          | 200      |

**Gateway (8 etapas de autenticacao):**
1. Extrai API key do header
2. bcrypt compare (rounds >= 12)
3. Valida agente ativo (status=ACTIVE)
4. Valida acao no catalogo
5. Valida link agente-acao (mcp_agent_action_links)
6. Valida scopes do agente (exclui blocklist)
7. Detecta privilege escalation → alerta (sensitivity=2)
8. Dispatch conforme politica

**Blocklist de escopos (agentes NUNCA recebem):**
- `approval:decide`
- `approval:override`
- `*:approve`
- `*:sign`
- `*:execute`

**Seguranca da API key:**
- 256 bits, gerada uma unica vez (retornada apenas no POST de criacao)
- Armazenada como hash bcrypt (rounds >= 12)
- Nunca retornada em GET
- Rotacao invalida a key anterior imediatamente

---

#### MOD-011 (SmartGrid) ─> Componente UX Transversal

MOD-011 e um componente UX puro de grade editavel com operacoes em massa. Consome exclusivamente o motor do MOD-007 e nao possui backend proprio (apenas amendment no MOD-007-F03).

| Artefato consumido                | Tabela/API                          | Como consome                          |
|-----------------------------------|-------------------------------------|---------------------------------------|
| Motor de avaliacao                | POST `/routine-engine/evaluate`     | 1 chamada por linha da grade          |
| Enquadradores de operacao         | `context_framers` (OPERACAO)        | Configura colunas visiveis da grade   |
| Itens de rotina                   | `routine_items`                     | FIELD_VISIBILITY, REQUIRED, DEFAULT, DOMAIN, VALIDATION |
| **Amendment:** current_record_state| Body do `/routine-engine/evaluate` | F03 (alteracao) e F04 (exclusao)      |

**Tipo de modulo:** UX-only (nao cria tabelas proprias, nao emite domain events proprios)

**Natureza:** Componente reutilizavel — qualquer modulo futuro que precise de inclusao/alteracao/exclusao em massa utilizara o SmartGrid.

**Relacao com MOD-007 (bidirecional em design):**
- MOD-011 **consome** o motor do MOD-007 (read-only)
- MOD-011-F01 **amenda** o motor do MOD-007-F03 (adiciona `current_record_state`)
- A resposta do motor define: campos visiveis, obrigatorios, defaults, dominio, validacoes

**3 telas (Screen Manifests):**

| Manifest       | Tela                      | Rota                                   | Status |
|----------------|---------------------------|----------------------------------------|--------|
| UX-SGR-001     | Grade de Inclusao em Massa| `/{modulo}/{rotina}/inclusao-em-massa` | DRAFT  |
| UX-SGR-002     | Formulario de Alteracao   | `/{modulo}/{rotina}/{id}/alterar`      | DRAFT  |
| UX-SGR-003     | Grade de Exclusao em Massa| `/{modulo}/{rotina}/exclusao-em-massa` | DRAFT  |

**Regras criticas:**
- Motor chamado **1 linha por vez** (nunca batch)
- "Save" habilitado apenas com **100% linhas validas** (✅)
- Exclusao sempre **logica** (`deleted_at` + `status=INACTIVE`)
- Campos bloqueados por condicao ficam **readonly com icone** (nunca ocultos)
- Formulario de alteracao sempre em **rota separada** (nunca inline na grade)
- Sem persistencia de draft server-side (tudo client-side)

**Dependencias proprias:**
- MOD-007-F03 (`/routine-engine/evaluate`)
- MOD-007-F01 (`context_framers` com `framer_type=OPERACAO`)
- MOD-007-F02 (`routine_items` — 5 dos 7 tipos)
- MOD-000-F14 (`domain_events` para log de alteracoes)

**Impacto se MOD-011 atrasar:** Nenhum modulo depende diretamente do MOD-011, mas futuras telas de operacao em massa ficam sem componente padronizado.

---

### Matriz de Dependencias Cruzadas

```
            000  001  003  004  005  006  007  008  009  010  011
MOD-000      -    .    .    .    .    .    .    .    .    .    .
MOD-001     <<<   -    .    .    .    .    .    .    .    .    .
MOD-003     <<<   .    -    .    .    .    .    .    .    .    .
MOD-004     <<<   .   <<<   -    .    .    .    .    .    .    .
MOD-005     <<<   .    .    .    -    .    .    .    .    .    .
MOD-006     <<<   .   <<<  <<<  <<<   -    .    .    .    .    .
MOD-007     <<<   .    .    .    .   <->   -    .    .    .    .
MOD-008     <<<   .    .    .    .   <<<  <<<   -    .    .    .
MOD-009     <<<   .   <<<   .    .    .    .    .    -    .    .
MOD-010     <<<   .    .   <<<   .    .    .    .   <<<   -    .
MOD-011     <<<   .    .    .    .    .   <->   .    .    .    -

<<< = depende de          <-> = bidirecional (runtime/amendment)
```

### Chamadas de API entre Modulos (Runtime)

| Origem     | Destino    | Endpoint                       | Quando                              |
|------------|------------|--------------------------------|-------------------------------------|
| MOD-006-F01| MOD-007-F03| POST /routine-engine/evaluate  | Step 5 do motor de transicao        |
| MOD-010-F02| MOD-009-F02| POST /movement-engine/evaluate | Acao MCP com policy=CONTROLLED      |
| MOD-008-F03| MOD-006    | Listen case.stage_transitioned | Trigger de integracao automatica    |
| MOD-011-F02| MOD-007-F03| POST /routine-engine/evaluate  | 1x por linha na grade (sem current_record_state) |
| MOD-011-F03| MOD-007-F03| POST /routine-engine/evaluate  | Avaliacao com current_record_state (alteracao)   |
| MOD-011-F04| MOD-007-F03| POST /routine-engine/evaluate  | Validacao pre-exclusao com current_record_state  |

### Background Jobs Criticos

| Modulo  | Job                        | Engine  | Ciclo   | Funcao                              |
|---------|----------------------------|---------|---------|-------------------------------------|
| MOD-004 | expire_identity_grants     | BullMQ  | 5 min   | Expira shares/delegacoes vencidas   |
| MOD-007 | expire_framers             | BullMQ  | 5 min   | Expira enquadradores vencidos       |
| MOD-008 | integration-execution      | BullMQ  | on-demand| Executa integracoes (Outbox+retry)  |
| MOD-009 | escalate_approvals         | BullMQ  | config  | Escala aprovacoes com timeout       |

### Amendments ao Catalogo de Scopes (MOD-000-F12)

Cada modulo adiciona scopes ao catalogo central:

| Modulo  | Scopes adicionados                                                                 |
|---------|------------------------------------------------------------------------------------|
| MOD-003 | `org:unit:read`, `org:unit:write`, `org:unit:delete`                               |
| MOD-004 | `identity:org_scope:read/write`, `identity:share:read/write/revoke`                |
| MOD-005 | `process:cycle:read/write/publish/delete`                                          |
| MOD-006 | `process:case:read/write/cancel`, `process:case:gate_resolve/gate_waive/assign`    |
| MOD-007 | `param:framer:read/write/delete`, `param:routine:read/write/publish`, `param:engine:evaluate` |
| MOD-008 | `integration:service:read/write`, `integration:routine:write/execute`, `integration:log:read/reprocess` |
| MOD-009 | `approval:rule:read/write`, `approval:engine:evaluate`, `approval:movement:read/write`, `approval:decide`, `approval:override` |
| MOD-010 | `mcp:agent:read/write/revoke`, `mcp:action:read/write`, `mcp:log:read`            |

---

## Pendencias Transversais

### 1. MOD-001 — Rollback de READY para TODO (2026-03-15)

**MOD-001 teve rollback de READY para TODO em 2026-03-15.**

Impactos potenciais:
- [ ] Todas as features UX de MOD-003 a MOD-011 dependem do Application Shell (MOD-001-F01)
- [ ] Sem o shell, as telas dos modulos nao tem container (sidebar, router, layout)
- [ ] **Mitigacao possivel:** backend de MOD-003 a MOD-010 pode avancar independente do shell UX
- [ ] Necessario estabilizar MOD-001 antes de iniciar qualquer feature UX dos modulos subsequentes
- [ ] Investigar causa do rollback e definir prazo para re-promocao a READY

### 2. PEND-SGR-01 — Contrato motor → estado visual (MOD-011)

- [ ] Definir mapeamento formal: `blocking_validations[]` → ❌, `validations[]` → ⚠️, vazio → ✅
- [ ] Definir se warnings permitem ou bloqueiam save
- [ ] Definir regras de tooltip/mensagem por tipo de validacao
- [ ] **Bloqueia:** MOD-011-F02 (Grade Inclusao), manifest UX-SGR-001
- [ ] **Responsavel:** Arquitetura

### 3. PEND-SGR-02 — Amendment current_record_state no motor MOD-007 (MOD-011)

- [ ] Aprovar amendment no POST `/routine-engine/evaluate`
- [ ] Campo `current_record_state` nullable no body (backward compatible)
- [ ] Cache Redis bypass quando presente (dados dinamicos nao cacheiaveis)
- [ ] Campos ausentes no state → condition avalia como `false`
- [ ] **Bloqueia:** MOD-011-F01 (backend), MOD-011-F03 (alteracao), MOD-011-F04 (exclusao), manifests UX-SGR-002 e UX-SGR-003
- [ ] **Responsavel:** Arquitetura
