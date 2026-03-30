> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.

# MOD-006 — Execução de Casos

- **id:** MOD-006
- **version:** 1.0.0
- **estado_item:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-23
- **architecture_level:** 2
- **rastreia_para:** US-MOD-006, US-MOD-006-F01, US-MOD-006-F02, US-MOD-006-F03, US-MOD-006-F04, DOC-DEV-001, DOC-ESC-001, DOC-ARC-001, DOC-ARC-003, DOC-FND-000, MOD-000, MOD-003, MOD-004, MOD-005
- **referencias_exemplos:** EX-ESC-001
- **evidencias:** N/A

---

## 1. Objetivo

Módulo responsável pela **execução de casos** sobre blueprints publicados pelo MOD-005. Transforma modelos conceituais em instâncias concretas rastreáveis: abertura de casos vinculados a ciclos PUBLISHED com freeze de versão, motor de transição de estágios com validação sequencial de gates e papéis, resolução de gates (APPROVAL, DOCUMENT, CHECKLIST), atribuição e reatribuição de responsáveis por papel, registro de eventos avulsos e timeline intercalando 3 históricos independentes (estágio, gates, eventos). Modelo de 5 tabelas com separação clara entre blueprint (MOD-005) e execução (MOD-006).

O motor de transição implementa 5 validações sequenciais obrigatórias antes de qualquer mudança de estágio: (1) caso OPEN, (2) transição válida no blueprint, (3) papel autorizado, (4) gates required resolvidos, (5) evidência fornecida se required. Essa sequência garante integridade total do fluxo operacional sem necessidade de validações externas ad-hoc.

## 1.1 Problema que resolve

- **Problema:** O MOD-005 define o blueprint dos processos — a estrutura conceitual de ciclos, estágios, gates e transições. Porém, sem uma camada de execução, não há como transformar esses modelos em casos concretos, rastrear progresso, resolver gates ou atribuir responsáveis.
- **Impacto hoje:** Processos modelados não podem ser instanciados; sem rastreabilidade de progresso operacional.
- **Resultado esperado:** Motor de execução completo com 3 históricos independentes, gates resolvíveis, atribuições auditáveis e timeline intercalada.

## 1.2 Público-alvo (personas e perfis)

| Persona | Scope requerido | Ações disponíveis |
|---|---|---|
| **Operador (leitura)** | `process:case:read` | Visualizar casos, histórico, gates, responsáveis e eventos |
| **Operador (execução)** | `process:case:read` + `process:case:write` | Abrir casos, transitar estágios, registrar eventos |
| **Aprovador** | `process:case:gate_resolve` | Resolver gates de aprovação |
| **Gestor** | `process:case:assign` + `process:case:cancel` | Atribuir responsáveis, cancelar casos |
| **Auditor** | `process:case:gate_waive` | Dispensar gates obrigatórios (ação auditada) |
| **Auditor (reabertura)** | `process:case:reopen` | Reabrir caso COMPLETED (ação excepcional auditada) |

## 1.3 Métricas de sucesso (OKRs)

| # | Métrica | Alvo |
|---|---|---|
| OKR-1 | Motor de transição bloqueia gate pending | 100% |
| OKR-2 | Instâncias referenciam cycle_version frozen após fork | 100% |
| OKR-3 | stage_history e case_assignments são independentes | 100% |
| OKR-4 | Timeline intercala os 3 históricos cronologicamente | sem falha |

## 2. Escopo

### Inclui

- API para abrir instâncias de caso sobre ciclos PUBLISHED (F01)
- Motor de transição de estágios com validação de gates e papéis (F01)
- Controles do caso: ON_HOLD, RESUME, CANCEL (F01)
- API de resolução de gates (aprovação, documento, checklist) (F02)
- API de dispensa de gates (waive) com escopo especial (F02)
- API de atribuição e reatribuição de responsáveis por papel (F02)
- API de registro de eventos avulsos do caso (F02)
- Endpoint de timeline intercalando 3 históricos (F02)
- Painel de caso em andamento com timeline (UX-CASE-001) (F03)
- Listagem de casos ativos com filtros (UX-CASE-002) (F04)

### Não inclui

- Abertura de caso com fluxo de aprovação prévia — MOD-009
- Parametrização contextual de comportamento por enquadrador — MOD-007
- Integração com Protheus disparada por transição — MOD-008
- Definição de blueprints de processo — MOD-005

### Premissas e Restrições

- **Premissas:** MOD-005 está estável com blueprints publicáveis. MOD-004 provê delegações de acesso. MOD-000 provê auth, RBAC e catálogo de scopes.
- **Restrições:** O caso nunca "sente" mudanças no blueprint — ao abrir, captura o `cycle_version_id` vigente (freeze). Qualquer fork ou atualização no MOD-005 não afeta instâncias em andamento.

## 3. Nível de Arquitetura

**Nível 2 — DDD-lite + Full Clean** (DOC-ESC-001 §7)

Módulo com domínio rico: motor de transição com 5 passos de validação sequencial, 3 históricos independentes (estágio, gates, eventos/atribuições), invariantes de integridade (gates required bloqueiam transição, papéis required bloqueiam transição), freeze de cycle_version_id, e resolução de gates com 3 tipos distintos. Possui 5 tabelas próprias, 16 endpoints, 11 domain events, e integração com MOD-005 (blueprints), MOD-004 (delegações) e MOD-000 (RBAC + audit trail).

O aggregate root `CaseInstance` centraliza todas as invariantes: status do caso, estágio atual, gates pendentes e atribuições ativas. Nenhuma operação (transição, resolução de gate, atribuição) pode ser executada sem passar pelo aggregate, garantindo consistência transacional. Value objects (`CaseStatus`, `GateResolutionStatus`, `GateDecision`) encapsulam regras de estados válidos e transições permitidas. Domain services (`TransitionEngine`, `GateResolver`, `TimelineService`) orquestram lógica cross-entity que não pertence a um único aggregate.

### Justificativa (Score DOC-ESC-001 §4.2: 5/6)

| Gatilho | Presente | Evidência |
|---|---|---|
| Estado/workflow | **SIM** | Motor de transição com 5 validações sequenciais; status OPEN → COMPLETED/CANCELLED/ON_HOLD; gates com estados PENDING → RESOLVED/WAIVED/REJECTED |
| Compliance/auditoria | **SIM** | 3 históricos independentes (audit trail completo), gate waive auditado, 11 domain events, X-Correlation-ID obrigatório |
| Concorrência/consistência | **SIM** | Transição atômica (stage_history + case_instances + gate_instances + case_events em transação), reatribuição desativa anterior antes de criar novo |
| Integrações externas críticas | **NÃO** | Sem providers externos; integra apenas módulos internos (MOD-005, MOD-004, MOD-000) |
| Multi-tenant/escopo por cliente | **SIM** | `tenant_id` obrigatório em todas as queries, ACL via 6 scopes `process:case:*` |
| Regras cruzadas/reuso alto | **SIM** | Consome blueprints do MOD-005 (stages, gates, transitions, roles), delegações do MOD-004, atribuição via stage_role_links do MOD-005 |

### Estrutura Recomendada (DOC-ESC-001 §7.3)

#### API (`apps/api`)

```text
apps/api/src/modules/case-execution/
  domain/
    aggregates/
      case-instance.ts          # Aggregate Root — controla invariantes do caso
    entities/
      stage-history-entry.ts
      gate-instance.ts
      case-assignment.ts
      case-event.ts
    value-objects/
      case-status.ts            # OPEN | COMPLETED | CANCELLED | ON_HOLD
      gate-resolution-status.ts # PENDING | RESOLVED | WAIVED | REJECTED
      gate-decision.ts          # APPROVED | REJECTED | WAIVED
    domain-services/
      transition-engine.service.ts  # Motor de transição com 5 validações
      gate-resolver.service.ts      # Resolução de gates por tipo
      timeline.service.ts           # Montagem da timeline intercalada
    domain-events/
      case-events.ts            # 11 domain events (DATA-003)
    errors/
      gate-pending.error.ts
      role-not-authorized.error.ts
      evidence-required.error.ts
      role-required-unassigned.error.ts
  application/
    use-cases/
      open-case.ts
      transition-stage.ts
      hold-case.ts
      resume-case.ts
      cancel-case.ts
      resolve-gate.ts
      waive-gate.ts
      create-assignment.ts
      update-assignment.ts
      record-event.ts
      get-timeline.ts
    ports/
      case-repository.port.ts
      stage-history-repository.port.ts
      gate-instance-repository.port.ts
      assignment-repository.port.ts
      case-event-repository.port.ts
      blueprint-reader.port.ts     # Leitura do blueprint do MOD-005
      delegation-checker.port.ts   # Consulta delegações do MOD-004
      event-bus.port.ts
    dtos/
  infrastructure/
    db/
      repositories/
      mappers/
    clients/
      mod005-blueprint-reader.ts   # Implementa port de leitura do MOD-005
      mod004-delegation-checker.ts # Implementa port de consulta ao MOD-004
  presentation/
    routes/
    controllers/
    validators/
    mappers/
```

#### Web (`apps/web`) — Nível 2 UI

```text
apps/web/src/modules/case-execution/
  ui/
    screens/
      case-panel/                # UX-CASE-001 — Painel do caso em andamento
      case-list/                 # UX-CASE-002 — Listagem de casos
    components/
      progress-bar/              # Barra de progresso por macroetapas
      transition-buttons/        # Botões de transição habilitados/desabilitados
      evidence-form/             # Mini-form inline para evidence_required
      gate-card/                 # Card de gate com resolução por tipo
      assignment-card/           # Card de responsável com reatribuição
      timeline-feed/             # Feed de timeline intercalada
      case-status-badge/         # Badge de status do caso
      case-drawer/               # Drawer para abertura de novo caso
    forms/
      gate-approval-form.tsx     # Form de resolução APPROVAL
      gate-document-form.tsx     # Form de resolução DOCUMENT
      gate-checklist-form.tsx    # Form de resolução CHECKLIST
      gate-waive-form.tsx        # Form de dispensa com motivo
  domain/
    state-machine.ts             # Estado do caso (readonly detection)
    rules.ts                     # Regras de UI (enable/disable por gates, papéis, status)
    view-model.ts                # Formatação de dados para timeline e painéis
  data/
    commands.ts                  # Mutations (open, transition, resolve, assign, etc.)
    queries.ts                   # GET /cases, GET /cases/:id, GET /timeline
    mappers.ts                   # API DTO ↔ view-model
```

## 4. Dependências

- **Depende de:** MOD-000 (Foundation) — auth, RBAC scopes (`process:case:*`), domain events, audit trail
- **Depende de:** MOD-005 (Modelagem de Processos) — blueprints publicados (ciclos, estágios, gates, transições, papéis)
- **Depende de:** MOD-004 (Identidade Avançada) — delegações de acesso para atribuições
- **Depende de:** MOD-003 (Estrutura Organizacional) — `org_unit_id` nos casos
- **Dependentes:** MOD-007 (Parametrização Contextual), MOD-008 (Integração Protheus), MOD-009 (Aprovação Prévia)

### Caminhos do Módulo (module_paths)

| Camada | Path |
|---|---|
| Especificação | `docs/04_modules/mod-006-execucao-casos/` |
| User Stories | `docs/04_modules/user-stories/features/US-MOD-006-F*.md` |
| Épico | `docs/04_modules/user-stories/epics/US-MOD-006.md` |
| Screen Manifests | `docs/05_manifests/screens/ux-case-001.painel-caso.yaml`, `ux-case-002.listagem-casos.yaml` |
| API — Routes | `src/modules/case-execution/routes/*.route.ts` |
| API — Schema | `src/modules/case-execution/schema.ts` |
| API — Services | `src/modules/case-execution/services/` |
| OpenAPI | `apps/api/openapi/mod-006-execucao-casos.yaml` |
| Web — UI | `apps/web/src/modules/case-execution/ui/screens/`, `apps/web/src/modules/case-execution/ui/components/` |
| Web — Domain | `apps/web/src/modules/case-execution/domain/` |
| Web — Data | `apps/web/src/modules/case-execution/data/` |

## 5. Sub-Histórias (Features)

| Feature | Tema | Tipo | Status |
|---|---|---|---|
| [US-MOD-006-F01](../user-stories/features/US-MOD-006-F01.md) | API abertura + motor de transição | Backend | `READY` |
| [US-MOD-006-F02](../user-stories/features/US-MOD-006-F02.md) | API gates + responsáveis + eventos | Backend | `READY` |
| [US-MOD-006-F03](../user-stories/features/US-MOD-006-F03.md) | UX Painel do caso + timeline | UX | `READY` |
| [US-MOD-006-F04](../user-stories/features/US-MOD-006-F04.md) | UX Listagem de casos | UX | `READY` |

## 6. Screen Manifests

| Manifest | Screen ID | Rota | Status |
|---|---|---|---|
| `docs/05_manifests/screens/ux-case-001.painel-caso.yaml` | UX-CASE-001 | /casos/:id | DRAFT |
| `docs/05_manifests/screens/ux-case-002.listagem-casos.yaml` | UX-CASE-002 | /casos | DRAFT |

## 7. Endpoints do Módulo

| Método | Path | operationId | Scope |
|---|---|---|---|
| POST | /api/v1/cases | `cases_open` | `process:case:write` |
| GET | /api/v1/cases | `cases_list` | `process:case:read` |
| GET | /api/v1/cases/:id | `cases_get` | `process:case:read` |
| POST | /api/v1/cases/:id/transition | `cases_transition` | `process:case:write` |
| POST | /api/v1/cases/:id/cancel | `cases_cancel` | `process:case:cancel` |
| POST | /api/v1/cases/:id/hold | `cases_hold` | `process:case:write` |
| POST | /api/v1/cases/:id/resume | `cases_resume` | `process:case:write` |
| GET | /api/v1/cases/:id/gates | `cases_gates_list` | `process:case:read` |
| POST | /api/v1/cases/:id/gates/:gateId/resolve | `cases_gates_resolve` | `process:case:gate_resolve` |
| POST | /api/v1/cases/:id/gates/:gateId/waive | `cases_gates_waive` | `process:case:gate_waive` |
| GET | /api/v1/cases/:id/assignments | `cases_assignments_list` | `process:case:read` |
| POST | /api/v1/cases/:id/assignments | `cases_assignments_create` | `process:case:assign` |
| PATCH | /api/v1/cases/:id/assignments/:aid | `cases_assignments_update` | `process:case:assign` |
| GET | /api/v1/cases/:id/events | `cases_events_list` | `process:case:read` |
| POST | /api/v1/cases/:id/events | `cases_events_create` | `process:case:write` |
| GET | /api/v1/cases/:id/timeline | `cases_timeline` | `process:case:read` |

## 8. Novos Escopos — Registrados em DOC-FND-000 §2.2 (v1.5.0)

| Escopo | Descrição |
|---|---|
| `process:case:read` | Visualizar casos, histórico, gates, responsáveis e eventos |
| `process:case:write` | Abrir casos, transitar, registrar eventos |
| `process:case:cancel` | Cancelar caso (ação crítica separada) |
| `process:case:gate_resolve` | Resolver gates (aprovar/rejeitar) |
| `process:case:gate_waive` | Dispensar gate obrigatório (poder especial) |
| `process:case:assign` | Atribuir e reatribuir responsáveis |
| `process:case:reopen` | Reabrir caso COMPLETED (ação excepcional auditada — PEN-006 PENDENTE-001) |

## 9. Requisitos (Índice)

<!-- start index -->
- [BR-006](requirements/br/BR-006.md) — Regras de Negócio da Execução de Casos
- [FR-006](requirements/fr/FR-006.md) — Requisitos Funcionais da Execução de Casos
- [DATA-006](requirements/data/DATA-006.md) — Modelo de Dados da Execução de Casos
- [DATA-003](requirements/data/DATA-003.md) — Catálogo de Domain Events da Execução de Casos
- [INT-006](requirements/int/INT-006.md) — Integrações e Contratos da Execução de Casos
- [SEC-006](requirements/sec/SEC-006.md) — Segurança e Compliance da Execução de Casos
- [SEC-002](requirements/sec/SEC-002.md) — Matriz de Autorização de Eventos da Execução de Casos
- [UX-006](requirements/ux/UX-006.md) — Jornadas e Fluxos da Execução de Casos
- [NFR-006](requirements/nfr/NFR-006.md) — Requisitos Não Funcionais da Execução de Casos
- [PEN-006](requirements/pen-006-pendente.md) — Questões Abertas da Execução de Casos
- [INT-006-C01](amendments/int/INT-006-C01.md) — Correção: 4 endpoints enviam camelCase sem mapear para snake_case dos schemas Zod
<!-- end index -->

## 10. Decisões (ADR)

<!-- start adr-index -->
- [ADR-001](adr/ADR-001.md) — Motor de Transição Atômico em Transação Única
- [ADR-002](adr/ADR-002.md) — Freeze de cycle_version_id na Abertura do Caso
- [ADR-003](adr/ADR-003.md) — Três Históricos Independentes com Timeline Intercalada
- [ADR-004](adr/ADR-004.md) — Optimistic Locking via updated_at no Aggregate CaseInstance
- [ADR-005](adr/ADR-005.md) — Background Job para Expiração Automática de Atribuições
<!-- end adr-index -->
