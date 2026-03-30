> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.

# MOD-005 — Modelagem de Processos (Blueprint)

- **id:** MOD-005
- **version:** 1.0.0
- **estado_item:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-23
- **rastreia_para:** US-MOD-005, US-MOD-005-F01, US-MOD-005-F02, US-MOD-005-F03, US-MOD-005-F04, DOC-DEV-001, DOC-ESC-001, DOC-ARC-001, DOC-ARC-002, DOC-ARC-003, DOC-FND-000, MOD-000, MOD-003, MOD-004
- **evidencias:** N/A

---

## 1. Objetivo

Módulo responsável pela **modelagem de processos** (blueprint), definindo como fluxos operacionais existem conceitualmente: Ciclos versionados, Macroetapas, Estágios, Gates de validação, Papéis de processo e Transições entre estágios. Separação clara entre blueprint (MOD-005) e execução de instâncias (MOD-006). Modelo de 7 tabelas com versionamento imutável de ciclos publicados, grafo de transições com condições e evidências, e catálogo global de papéis de processo.

## 2. Escopo

### Inclui

- API CRUD de Ciclos com versionamento (DRAFT → PUBLISHED → DEPRECATED)
- Fork de ciclo publicado criando nova versão DRAFT
- API CRUD de Macroetapas vinculadas a ciclos com ordenação relativa
- API CRUD de Estágios vinculados a macroetapas com flags `is_initial` / `is_terminal`
- API CRUD de Gates vinculados a estágios (4 tipos: APPROVAL, DOCUMENT, CHECKLIST, INFORMATIVE)
- API CRUD de Papéis de processo (catálogo global reutilizável com flag `can_approve`)
- API CRUD de vínculos Estágio × Papel (N:N com flags `required` e `max_assignees`)
- API CRUD de Transições de Estágio (grafo de navegação com condições e evidências)
- Endpoint `/flow` para retorno do grafo completo do ciclo (SLA < 200ms)
- Editor visual de fluxo (UX-PROC-001) — canvas com swimlanes, nós e arestas drag-configurable, mini-mapa obrigatório a partir de 15 nós
- Configurador de estágio detalhado (UX-PROC-002) — painel lateral com 4 abas: Info, Gates, Papéis, Transições

### Não inclui

- Abertura de instâncias concretas de ciclo — MOD-006
- Execução de gates e atribuição de responsáveis — MOD-006
- Parametrização contextual de comportamentos por estágio — MOD-007
- Implementação de endpoints de auth/RBAC — MOD-000

## 3. Nível de Arquitetura

**Nível 2 — DDD-lite + Full Clean** (DOC-ESC-001 §7)

Módulo com domínio rico: máquina de estados (DRAFT → PUBLISHED → DEPRECATED), invariantes de integridade (estágio inicial único, imutabilidade de PUBLISHED, deleção protegida), grafo de transições com validações cross-entidade, e fork atômico de estrutura completa. Possui 7 tabelas próprias, 26 endpoints administrativos, 19 domain events, e integração com MOD-000 (RBAC + audit trail) e MOD-006 (integridade referencial em runtime). 13 requisitos funcionais (FR-001 a FR-013), 12 regras de negócio (BR-001 a BR-012), 4 ADRs aceitas, e 2 telas UX (editor visual + configurador de estágio).

### Justificativa (Score DOC-ESC-001 §4.2: 5/6)

| Gatilho | Presente | Evidência |
|---|---|---|
| Estado/workflow | **SIM** | Máquina de estados DRAFT → PUBLISHED → DEPRECATED; ciclo publicado é imutável; fork como único caminho de mudança |
| Compliance/auditoria | **SIM** | 19 domain events (DATA-003), audit trail via DOC-ARC-003, imutabilidade como controle de integridade documental |
| Concorrência/consistência | **SIM** | Integridade referencial com MOD-006 (deleção protegida de estágios com instâncias ativas), estágio inicial único por ciclo (partial unique index), fork atômico copiando 7 tabelas com novos IDs |
| Integrações externas críticas | **NÃO** | Sem providers externos; integra apenas módulos internos (MOD-000, MOD-006) |
| Multi-tenant/escopo por cliente | **SIM** | `tenant_id` obrigatório em todas as queries (DOC-FND-000 §3), ACL via 4 scopes `process:cycle:*` |
| Regras cruzadas/reuso alto | **SIM** | Blueprint reutilizado pelo MOD-006 (instâncias referenciam `cycle_version_id`), catálogo global de papéis de processo (`process_roles`), grafo de transições compartilhado |

### Estrutura Recomendada (DOC-ESC-001 §7.3)

#### API (`apps/api`)

```text
apps/api/src/modules/process-modeling/
  domain/
    aggregates/
      process-cycle.ts         # Aggregate Root — controla invariantes do ciclo
    entities/
      macro-stage.ts
      stage.ts
      gate.ts
      stage-transition.ts
    value-objects/
      cycle-status.ts          # DRAFT | PUBLISHED | DEPRECATED
      gate-type.ts             # APPROVAL | DOCUMENT | CHECKLIST | INFORMATIVE
    domain-services/
      cycle-fork.service.ts    # Fork atômico de estrutura completa
      flow-graph.service.ts    # Montagem do grafo para /flow
    domain-events/
      process-events.ts        # 19 domain events (DATA-003)
    errors/
      cycle-immutable.error.ts
      cross-cycle-transition.error.ts
      stage-has-instances.error.ts
  application/
    use-cases/
      create-cycle.ts
      publish-cycle.ts
      fork-cycle.ts
      deprecate-cycle.ts
      manage-macro-stages.ts
      manage-stages.ts
      manage-gates.ts
      manage-transitions.ts
      manage-process-roles.ts
      get-cycle-flow.ts
    ports/
      cycle-repository.port.ts
      stage-repository.port.ts
      gate-repository.port.ts
      transition-repository.port.ts
      process-role-repository.port.ts
      instance-checker.port.ts  # Consulta MOD-006 para instâncias ativas
      event-bus.port.ts
    dtos/
  infrastructure/
    db/
      repositories/
      mappers/
    clients/
      mod006-instance-checker.ts  # Implementa port de consulta ao MOD-006
  presentation/
    routes/
    controllers/
    validators/
    mappers/
```

#### Web (`apps/web`) — Nível 2 UI

```text
apps/web/src/modules/process-modeling/
  ui/
    screens/
      cycle-editor/              # UX-PROC-001 — Canvas + React Flow
      stage-configurator/        # UX-PROC-002 — Painel lateral 4 abas
    components/
      flow-canvas/               # Componentes do editor visual
      stage-node/                # Nó customizado para React Flow
      transition-edge/           # Aresta customizada
      swimlane/                  # Faixa de macroetapa
      mini-map/                  # Mini-mapa para grafos > 15 nós
      gate-list/                 # Lista de gates com drag-and-drop
      role-autocomplete/         # Autocomplete do catálogo de papéis
    forms/
  domain/
    state-machine.ts             # Estado do ciclo (readonly detection)
    rules.ts                     # Regras de UI (enable/disable por status)
    view-model.ts                # Formatação de dados do grafo
  data/
    commands.ts                  # Mutations (create, update, delete, publish, fork)
    queries.ts                   # GET /flow, GET /process-roles
    mappers.ts                   # Adaptação API ↔ React Flow nodes/edges
```

## 4. Dependências

- **Depende de:** MOD-000 (Foundation) — auth, RBAC scopes (`process:cycle:*`), domain events, audit trail
- **Depende de:** MOD-003 (Estrutura Organizacional) — entidades organizacionais referenciadas nos processos
- **Depende de:** MOD-004 (Identidade Avançada) — perfis de usuários atribuíveis via MOD-006
- **Dependentes:** MOD-006 (Execução de Processos) — consome blueprints publicados para instanciar

### Caminhos do Módulo (module_paths)

| Camada | Path |
|---|---|
| Especificação | `docs/04_modules/mod-005-modelagem-processos/` |
| User Stories | `docs/04_modules/user-stories/features/US-MOD-005-F*.md` |
| Épico | `docs/04_modules/user-stories/epics/US-MOD-005.md` |
| Screen Manifests | `docs/05_manifests/screens/ux-proc-001.editor-visual.yaml`, `ux-proc-002.config-estagio.yaml` |
| API — Routes | `src/modules/process-modeling/routes/*.route.ts` |
| API — Schema | `src/modules/process-modeling/schema.ts` |
| API — Services | `src/modules/process-modeling/services/` |
| OpenAPI | `apps/api/openapi/mod-005-modelagem-processos.yaml` |
| Web — UI | `apps/web/src/modules/process-modeling/ui/screens/`, `apps/web/src/modules/process-modeling/ui/components/` |
| Web — Domain | `apps/web/src/modules/process-modeling/domain/` |
| Web — Data | `apps/web/src/modules/process-modeling/data/` |

## 5. Sub-Histórias (Features)

| Feature | Tema | Tipo | Status |
|---|---|---|---|
| [US-MOD-005-F01](../user-stories/features/US-MOD-005-F01.md) | API Ciclos + Macroetapas + Estágios | Backend | `READY` |
| [US-MOD-005-F02](../user-stories/features/US-MOD-005-F02.md) | API Gates + Papéis + Transições | Backend | `READY` |
| [US-MOD-005-F03](../user-stories/features/US-MOD-005-F03.md) | UX Editor Visual de Fluxo | UX | `READY` |
| [US-MOD-005-F04](../user-stories/features/US-MOD-005-F04.md) | UX Configurador de Estágio | UX | `READY` |

## 6. Itens Base (Canônicos) e Links

<!-- start index -->
- [BR-005](requirements/br/BR-005.md) — Regras de Negócio da Modelagem de Processos
- [FR-005](requirements/fr/FR-005.md) — Requisitos Funcionais da Modelagem de Processos
- [DATA-005](requirements/data/DATA-005.md) — Modelo de Dados da Modelagem de Processos
- [DATA-003](requirements/data/DATA-003.md) — Catálogo de Domain Events da Modelagem de Processos
- [INT-005](requirements/int/INT-005.md) — Integrações e Contratos da Modelagem de Processos
- [SEC-005](requirements/sec/SEC-005.md) — Segurança e Compliance da Modelagem de Processos
- [SEC-002](requirements/sec/SEC-002.md) — Matriz de Autorização de Eventos da Modelagem de Processos
- [UX-005](requirements/ux/UX-005.md) — Jornadas e Fluxos da Modelagem de Processos
- [NFR-005](requirements/nfr/NFR-005.md) — Requisitos Não Funcionais da Modelagem de Processos
- [PEN-005](requirements/pen-005-pendente.md) — Questões Abertas da Modelagem de Processos
<!-- end index -->

## 7. Decisões (ADR)

<!-- start adr-index -->
- [ADR-001](adr/ADR-001.md) — Garantia de Estágio Inicial Único por Ciclo (Trigger vs. Campo Denormalizado)
- [ADR-002](adr/ADR-002.md) — Estratégia Fail-Safe na Integração MOD-005 → MOD-006 (Deleção Protegida)
- [ADR-003](adr/ADR-003.md) — Fork Atômico via Transação Única com Remapeamento de UUIDs
- [ADR-004](adr/ADR-004.md) — Optimistic Locking via `updated_at` para Edição Concorrente de Ciclos DRAFT
<!-- end adr-index -->

## 8. Amendments

- [AMD-UX-PROC-001-001](amendments/ux/AMD-UX-PROC-001-001__action_update_stage_position.md) — Ação update_stage_position no editor visual
- [FR-011-C01](amendments/fr/FR-011-C01.md) — Correção: flow handler sem mapeamento camelCase→snake_case (HTTP 500)
- [FR-001-C01](amendments/fr/FR-001-C01.md) — Correção: deprecate envia nome:null + handlers usam timestamps fake
- [UX-005-M01](amendments/ux/UX-005-M01.md) — Melhoria: duplo clique no canvas vazio cria macroetapa padrão + primeiro estágio
- [FR-008-C01](amendments/fr/FR-008-C01.md) — Correção: frontend ProcessRolesPage sem funcionalidade de edição (PATCH)
- [UX-005-C01](amendments/ux/UX-005-C01.md) — Correção: falha silenciosa no double-click do canvas vazio (guards sem feedback + mutation sem onError)
