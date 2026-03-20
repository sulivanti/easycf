> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-19 | arquitetura | Baseline Inicial (forge-module) |
> | 0.4.0  | 2026-03-20 | AGN-DEV-01  | Re-enriquecimento MOD/Escala Batch 1 — confirmação scopes DOC-FND-000, revisão alinhamento |
> | 0.3.0  | 2026-03-19 | AGN-DEV-09  | ADR index atualizado (enrich-agent) — Batch 4 |
> | 0.2.0  | 2026-03-19 | AGN-DEV-01  | Enriquecimento MOD/Escala (enrich-agent) |

# MOD-007 — Parametrização Contextual e Rotinas

- **id:** MOD-007
- **version:** 0.4.0
- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-20
- **architecture_level:** 2
- **rastreia_para:** US-MOD-007, US-MOD-007-F01, US-MOD-007-F02, US-MOD-007-F03, US-MOD-007-F04, US-MOD-007-F05, DOC-DEV-001, DOC-ARC-001, DOC-ARC-003, DOC-FND-000, MOD-000, MOD-003, MOD-004, MOD-005, MOD-006
- **referencias_exemplos:** EX-ESC-001 (Score de Nível), EX-DEV-001 (Envelope MOD)
- **evidencias:** N/A

---

## 1. Objetivo

Módulo responsável pela **parametrização contextual** de objetos de negócio e pelo **cadastro de rotinas de comportamento**. Funciona como camada de mediação: o mesmo objeto (ex: Pedido de Venda) pode ter campos, defaults, domínios e validações diferentes dependendo do contexto de negócio ativo (enquadrador). O módulo implementa enquadradores de contexto com vigência, objetos-alvo com campos parametrizáveis, regras de incidência com detecção de conflitos em config-time, rotinas de comportamento com versionamento (DRAFT → PUBLISHED → DEPRECATED), e motor de avaliação runtime que resolve conflitos por restritividade. Modelo de 9 tabelas com 4 gaps do Documento Mestre endereçados.

O motor de avaliação executa 6 passos sequenciais: (1) encontrar regras de incidência ativas, (2) encontrar rotinas PUBLISHED vinculadas, (3) avaliar itens por ordem, (4) resolver conflitos por restritividade (safety net), (5) construir response, (6) persistir domain_events. Sem cache — todas as chamadas executam ao vivo.

## 1.1 Problema que resolve

- **Problema:** Sem parametrização contextual, toda variação de comportamento precisa ser codificada como lógica fixa, tornando o sistema inflexível para cenários operacionais distintos.
- **Impacto hoje:** Campos, defaults, domínios e validações são fixos independente do contexto de negócio.
- **Resultado esperado:** Camada de mediação completa com enquadradores, rotinas versionadas, motor de avaliação e integração com MOD-006.

## 1.2 Público-alvo (personas e perfis)

| Persona | Scope requerido | Ações disponíveis |
|---|---|---|
| **Analista funcional (leitura)** | `param:framer:read` + `param:routine:read` | Visualizar enquadradores, regras, rotinas e itens |
| **Analista funcional (escrita)** | `param:framer:write` + `param:routine:write` | Criar e editar enquadradores, regras, rotinas e itens (DRAFT) |
| **Publicador** | `param:routine:publish` | Publicar rotinas (DRAFT → PUBLISHED) |
| **Administrador** | `param:framer:delete` | Inativar enquadradores e regras |
| **Sistema (MOD-006/frontend)** | `param:engine:evaluate` | Chamar o motor de avaliação em runtime |

## 1.3 Métricas de sucesso (OKRs)

| # | Métrica | Alvo |
|---|---|---|
| OKR-1 | Conflito de incidência bloqueado no cadastro; safety net runtime (mais restritivo vence) funcional | 100% |
| OKR-2 | Rotina PUBLISHED rejeita edição | 100% |
| OKR-3 | `routine.applied` em domain_events para cada avaliação com efeito | 100% |
| OKR-4 | MOD-006 bloqueia transição por `blocking_validations` do motor | 100% |

## 2. Escopo

### Inclui

- API CRUD de Tipos de Enquadrador e Enquadradores com versionamento e vigência (F01)
- API CRUD de Objetos-Alvo e Campos-Alvo (F01)
- API CRUD de Regras de Incidência com UNIQUE constraint e detecção de conflitos config-time (F01)
- API CRUD de Rotinas de Comportamento com itens e versionamento DRAFT → PUBLISHED → DEPRECATED (F02)
- Fork de rotinas com cópia de itens e links de incidência (F02)
- Motor de Avaliação de Regras com resolução por restritividade, sem cache (F03)
- Registro de incidências aplicadas via domain_events (F03)
- UX Configurador de Enquadradores com matriz de incidência (F04)
- UX Cadastro de Rotinas com editor split-view e versionamento (F05)

### Não inclui

- Rotinas de Integração (Protheus) — MOD-008
- Motor de aprovação de rotinas via fluxo formal — MOD-009
- Avaliação de regras em batch/importação em massa — roadmap futuro
- condition_expr avançada (rule engine v2) — roadmap futuro

### Premissas e Restrições

- **Premissas:** MOD-000 provê auth, RBAC e catálogo de scopes. MOD-006 consome o motor de avaliação. MOD-005 provê blueprints referenciados nos enquadradores de tipo CONTEXTO_PROCESSO.
- **Restrições:** Cache Redis removido do motor inteiro (decisão 2026-03-15: consistência > performance). Campo `priority` removido de `incidence_rules` — conflitos resolvidos por restritividade.

## 3. Nível de Arquitetura

**Nível 2 — DDD-lite + Full Clean** (DOC-ESC-001 §7)

Módulo com domínio rico: motor de avaliação com 6 passos, resolução de conflitos em duas camadas (config-time block + runtime safety net), versionamento de rotinas com ciclo DRAFT → PUBLISHED → DEPRECATED, 7 tipos de itens parametrizáveis, fork com cópia de itens e links. Possui 9 tabelas próprias, 25 endpoints (23 originais + 2 link/unlink-routine — INT-007), integração com MOD-006 (motor de transição), MOD-005 (enquadradores de processo) e MOD-000 (RBAC + audit trail).

O aggregate root `BehaviorRoutine` centraliza invariantes: status da rotina, itens, publicação e fork. Value objects (`RoutineStatus`, `ItemType`, `ItemAction`) encapsulam regras de estados válidos. Domain services (`EvaluationEngine`, `ConflictResolver`, `IncidenceValidator`) orquestram lógica cross-entity.

### Justificativa (Score DOC-ESC-001 §4.2: 5/6)

| Gatilho | Presente | Evidência |
|---|---|---|
| Estado/workflow | **SIM** | Rotinas com ciclo DRAFT → PUBLISHED → DEPRECATED; enquadradores com vigência e expiração automática |
| Compliance/auditoria | **SIM** | domain_events routine.applied, routine_version_history com change_reason obrigatório, X-Correlation-ID |
| Concorrência/consistência | **SIM** | UNIQUE constraint config-time, safety net runtime por restritividade, motor sem cache |
| Integrações externas críticas | **NÃO** | Sem providers externos; integra apenas módulos internos (MOD-006, MOD-005, MOD-000) |
| Multi-tenant/escopo por cliente | **SIM** | `tenant_id` obrigatório em todas as queries, ACL via 7 scopes `param:*` |
| Regras cruzadas/reuso alto | **SIM** | Motor consumido por MOD-006 e frontend, rotinas incidem sobre objetos de múltiplos módulos |

### Estrutura Recomendada (DOC-ESC-001 §7.3)

#### API (`apps/api`)

```text
apps/api/src/modules/contextual-params/
  domain/
    aggregates/
      behavior-routine.ts         # Aggregate Root — controla invariantes da rotina
    entities/
      context-framer.ts
      context-framer-type.ts
      target-object.ts
      target-field.ts
      incidence-rule.ts
      routine-item.ts
      routine-incidence-link.ts
      routine-version-history.ts
    value-objects/
      routine-status.ts           # DRAFT | PUBLISHED | DEPRECATED
      item-type.ts                # FIELD_VISIBILITY | REQUIRED | DEFAULT | DOMAIN | DERIVATION | VALIDATION | EVIDENCE
      item-action.ts              # SHOW | HIDE | SET_REQUIRED | SET_OPTIONAL | SET_DEFAULT | RESTRICT_DOMAIN | VALIDATE | REQUIRE_EVIDENCE
      framer-status.ts            # ACTIVE | INACTIVE
    domain-services/
      evaluation-engine.service.ts   # Motor de avaliação com 6 passos
      conflict-resolver.service.ts   # Resolução por restritividade (safety net)
      incidence-validator.service.ts # Detecção de conflitos config-time
      framer-expiration.service.ts   # Background job de expiração
    domain-events/
      param-events.ts             # Domain events (DATA-003)
    errors/
      incidence-conflict.error.ts
      routine-immutable.error.ts
      routine-no-items.error.ts
      routine-draft-link.error.ts
      codigo-immutable.error.ts
  application/
    use-cases/
      create-framer-type.ts
      create-framer.ts
      update-framer.ts
      delete-framer.ts
      create-target-object.ts
      create-target-field.ts
      create-incidence-rule.ts
      update-incidence-rule.ts
      delete-incidence-rule.ts
      create-routine.ts
      update-routine.ts
      publish-routine.ts
      fork-routine.ts
      create-routine-item.ts
      update-routine-item.ts
      delete-routine-item.ts
      evaluate-rules.ts
    ports/
      framer-type-repository.port.ts
      framer-repository.port.ts
      target-object-repository.port.ts
      target-field-repository.port.ts
      incidence-rule-repository.port.ts
      routine-repository.port.ts
      routine-item-repository.port.ts
      routine-incidence-link-repository.port.ts
      version-history-repository.port.ts
      event-bus.port.ts
    dtos/
  infrastructure/
    db/
      repositories/
      mappers/
    jobs/
      framer-expiration.job.ts    # Background job de expiração de enquadradores
  presentation/
    routes/
    controllers/
    validators/
    mappers/
```

#### Web (`apps/web`) — Nível 2 UI

```text
apps/web/src/modules/contextual-params/
  ui/
    screens/
      config-enquadradores/       # UX-PARAM-001 — Configurador de Enquadradores
      editor-rotinas/              # UX-ROTINA-001 — Editor de Rotinas
    components/
      framer-drawer/               # Drawer CRUD de enquadrador
      incidence-matrix/            # Matriz visual enquadrador × objeto
      target-object-panel/         # Painel de objetos-alvo com campos expandíveis
      routine-list/                # Lista de rotinas com filtro por status
      routine-editor/              # Editor split-view de rotina
      routine-item-form/           # Formulário adaptativo por tipo de item
      routine-timeline/            # Timeline de histórico de versões
      dry-run-preview/             # Pré-visualização do motor (dry-run)
      item-drag-handle/            # Drag-and-drop para reordenação de itens
    forms/
      framer-form.tsx              # Form de criação/edição de enquadrador
      incidence-rule-form.tsx      # Form de regra de incidência
      routine-form.tsx             # Form de criação de rotina
      routine-item-field-visibility.tsx
      routine-item-required.tsx
      routine-item-default.tsx
      routine-item-domain.tsx
      routine-item-derivation.tsx
      routine-item-validation.tsx
      routine-item-evidence.tsx
  domain/
    routine-status-machine.ts      # Estado da rotina (DRAFT/PUBLISHED/DEPRECATED)
    rules.ts                       # Regras de UI (enable/disable por status)
    view-model.ts                  # Formatação de dados para editor e matriz
  data/
    commands.ts                    # Mutations (create, update, publish, fork, etc.)
    queries.ts                     # GET /framers, GET /routines, POST /evaluate
    mappers.ts                     # API DTO ↔ view-model
```

## 4. Dependências

- **Depende de:** MOD-000 (Foundation) — auth, RBAC scopes (`param:*`), domain events, audit trail
- **Depende de:** MOD-006 (Execução de Casos) — motor de transição consome o endpoint de avaliação
- **Depende de:** MOD-005 (Modelagem de Processos) — enquadradores de tipo CONTEXTO_PROCESSO referenciam ciclos
- **Depende de:** MOD-004 (Identidade Avançada) — background job de expiração de enquadradores pode ser estendido
- **Depende de:** MOD-003 (Estrutura Organizacional) — enquadradores podem incidir sobre objetos de org_units
- **Dependentes:** MOD-008 (Integração Protheus) — herda a base de rotinas com routine_type=INTEGRATION

### Caminhos do Módulo (module_paths)

| Camada | Path |
|---|---|
| Especificação | `docs/04_modules/mod-007-parametrizacao-contextual/` |
| User Stories | `docs/04_modules/user-stories/features/US-MOD-007-F*.md` |
| Épico | `docs/04_modules/user-stories/epics/US-MOD-007.md` |
| Screen Manifests | `docs/05_manifests/screens/ux-param-001.config-enquadradores.yaml`, `ux-rotina-001.editor-rotinas.yaml` |
| API — Routes | `src/modules/contextual-params/routes/*.route.ts` |
| API — Schema | `src/modules/contextual-params/schema.ts` |
| API — Services | `src/modules/contextual-params/services/` |
| OpenAPI | `apps/api/openapi/mod-007-parametrizacao-contextual.yaml` |
| Web — UI | `apps/web/src/modules/contextual-params/ui/screens/`, `apps/web/src/modules/contextual-params/ui/components/` |
| Web — Domain | `apps/web/src/modules/contextual-params/domain/` |
| Web — Data | `apps/web/src/modules/contextual-params/data/` |

## 5. Sub-Histórias (Features)

| Feature | Tema | Tipo | Status |
|---|---|---|---|
| [US-MOD-007-F01](../user-stories/features/US-MOD-007-F01.md) | API Enquadradores + Objetos + Incidências | Backend | `APPROVED` |
| [US-MOD-007-F02](../user-stories/features/US-MOD-007-F02.md) | API Rotinas + Itens + Versionamento | Backend | `APPROVED` |
| [US-MOD-007-F03](../user-stories/features/US-MOD-007-F03.md) | Motor de Avaliação (runtime) | Backend | `APPROVED` |
| [US-MOD-007-F04](../user-stories/features/US-MOD-007-F04.md) | UX Configurador de Enquadradores | UX | `APPROVED` |
| [US-MOD-007-F05](../user-stories/features/US-MOD-007-F05.md) | UX Cadastro de Rotinas | UX | `APPROVED` |

## 6. Screen Manifests

| Manifest | Screen ID | Rota | Status |
|---|---|---|---|
| `docs/05_manifests/screens/ux-param-001.config-enquadradores.yaml` | UX-PARAM-001 | /parametrizacao/enquadradores | DRAFT |
| `docs/05_manifests/screens/ux-rotina-001.editor-rotinas.yaml` | UX-ROTINA-001 | /parametrizacao/rotinas | DRAFT |

## 7. Endpoints do Módulo

| Método | Path | operationId | Scope |
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
| PATCH | /api/v1/admin/routines/:id | `admin_routines_update` | `param:routine:write (só DRAFT)` |
| POST | /api/v1/admin/routines/:id/publish | `admin_routines_publish` | `param:routine:publish` |
| POST | /api/v1/admin/routines/:id/fork | `admin_routines_fork` | `param:routine:write` |
| POST | /api/v1/admin/routines/:id/items | `admin_routine_items_create` | `param:routine:write` |
| PATCH | /api/v1/admin/routine-items/:id | `admin_routine_items_update` | `param:routine:write` |
| DELETE | /api/v1/admin/routine-items/:id | `admin_routine_items_delete` | `param:routine:write` |
| POST | /api/v1/admin/incidence-rules/:id/link-routine | `admin_incidence_rules_link_routine` | `param:framer:write` |
| DELETE | /api/v1/admin/incidence-rules/:id/unlink-routine/:routineId | `admin_incidence_rules_unlink_routine` | `param:framer:write` |
| POST | /api/v1/routine-engine/evaluate | `routine_engine_evaluate` | `param:engine:evaluate` |

## 8. Novos Escopos — Amendment MOD-000-F12

| Escopo | Descrição |
|---|---|
| `param:framer:read` | Ver enquadradores, tipos, objetos, campos e regras |
| `param:framer:write` | Criar e editar enquadradores e regras de incidência |
| `param:framer:delete` | Inativar enquadradores e regras |
| `param:routine:read` | Ver rotinas, itens e histórico |
| `param:routine:write` | Criar e editar rotinas (somente DRAFT) |
| `param:routine:publish` | Publicar rotina (DRAFT → PUBLISHED) |
| `param:engine:evaluate` | Chamar o motor de avaliação (usado por MOD-006 e frontend) |

## 9. Requisitos (Índice)

<!-- start index -->
- [BR-007](requirements/br/BR-007.md) — Regras de Negócio da Parametrização Contextual
- [FR-007](requirements/fr/FR-007.md) — Requisitos Funcionais da Parametrização Contextual
- [DATA-007](requirements/data/DATA-007.md) — Modelo de Dados da Parametrização Contextual
- [DATA-003](requirements/data/DATA-003.md) — Catálogo de Domain Events da Parametrização Contextual
- [INT-007](requirements/int/INT-007.md) — Integrações e Contratos da Parametrização Contextual
- [SEC-007](requirements/sec/SEC-007.md) — Segurança e Compliance da Parametrização Contextual
- [SEC-002](requirements/sec/SEC-002.md) — Matriz de Autorização de Eventos da Parametrização Contextual
- [UX-007](requirements/ux/UX-007.md) — Jornadas e Fluxos da Parametrização Contextual
- [NFR-007](requirements/nfr/NFR-007.md) — Requisitos Não Funcionais da Parametrização Contextual
- [PEN-007](requirements/pen-007-pendente.md) — Questões Abertas da Parametrização Contextual
<!-- end index -->

## 10. Decisões (ADR)

<!-- start adr-index -->
- [ADR-001](adr/ADR-001.md) — Cache Redis Removido do Motor de Avaliação (Consistência > Performance)
- [ADR-002](adr/ADR-002.md) — Campo priority Removido de incidence_rules — Resolução por Restritividade no Runtime
- [ADR-003](adr/ADR-003.md) — Rotina PUBLISHED Imutável — Fork como Único Caminho para Nova Versão
- [ADR-004](adr/ADR-004.md) — Resolução de Conflito em Duas Camadas (Config-time 422 + Runtime Safety Net)
- [ADR-005](adr/ADR-005.md) — Motor de Avaliação Always Fresh (Sem Cache em Nenhuma Camada)
- [ADR-006](adr/ADR-006.md) — Dry-Run via Flag no Request Body (Supressão de Domain Events)
<!-- end adr-index -->
