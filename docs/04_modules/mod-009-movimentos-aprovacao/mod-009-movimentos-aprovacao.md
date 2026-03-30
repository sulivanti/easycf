> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.

# MOD-009 — Movimentos sob Aprovação (Aprovações e Alçadas)

- **id:** MOD-009
- **version:** 1.0.0
- **estado_item:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-23
- **architecture_level:** 2
- **rastreia_para:** US-MOD-009, US-MOD-009-F01, US-MOD-009-F02, US-MOD-009-F03, US-MOD-009-F04, US-MOD-009-F05, DOC-DEV-001, DOC-ARC-001, DOC-ARC-003, DOC-FND-000, MOD-000, MOD-004, MOD-006
- **referencias_exemplos:** EX-ESC-001
- **evidencias:** N/A

---

## 1. Objetivo

Módulo responsável pelo **controle de movimentos sob aprovação** — interceptação de operações críticas que exigem decisão formal antes de gerar efeito. O princípio central é: **"Origem não é autorização"** — API, integração sistêmica e MCP podem iniciar solicitações, mas não contornam alçada.

### Modelo de Domínio

O domínio é centrado no **Aggregate Root `ControlledMovement`**, que encapsula todas as invariantes do ciclo de vida de um movimento controlado: status, nível atual de aprovação, cadeia de aprovadores, e histórico de eventos. Toda mutação de estado (aprovação, rejeição, override, cancelamento, execução) passa obrigatoriamente pelo aggregate, garantindo consistência transacional.

**Value Objects:**

- `MovementStatus` — enum com transições válidas: `PENDING_APPROVAL → APPROVED | AUTO_APPROVED | REJECTED | CANCELLED | OVERRIDDEN`, `APPROVED → EXECUTED | FAILED`, `OVERRIDDEN → EXECUTED | FAILED`. Transições inválidas lançam `InvalidTransitionError`.
- `ApprovalDecision` — encapsula decisão (`APPROVED | REJECTED | TIMEOUT | ESCALATED`) com parecer obrigatório, timestamp e referência ao aprovador.
- `OriginType` — tipifica a origem da solicitação (`HUMAN | API | MCP | AGENT`). Usado como critério de avaliação pelo motor.
- `ApprovalCriteria` — valor combinável (`VALUE | HIERARCHY | ORIGIN | OBJECT`) que determina quando uma regra de controle incide sobre uma operação.

**Domain Services:**

- `ControlEngine` — motor de controle síncrono. Busca regras ACTIVE ordenadas por `priority`, avalia critérios combináveis, decide se operação é livre (`controlled: false`) ou controlada (`controlled: true` + INSERT `controlled_movements` + `approval_instances` nível 1). Retorna HTTP 202 quando intercepta.
- `ApprovalChainResolver` — resolve cadeia de aprovação multinível. Dado o `controlled_movement`, identifica aprovadores do nível atual por tipo (`ROLE | ORG_LEVEL | USER | SCOPE`), avalia timeouts e escaladas (`escalation_rule_id`).
- `OverrideAuditor` — valida pré-condições de override (scope `approval:override`, justificativa min 20 chars), registra em `movement_override_log` (imutável) e `movement_history`.
- `AutoApprovalService` — avalia se o solicitante possui `required_scope` com `allow_self_approve=true`. Se sim, cria movimento com status `AUTO_APPROVED` direto, sem inbox. Registra `event_type=AUTO_APPROVED_BY_SCOPE` em `movement_history`.

### Fluxo Principal

O motor de controle implementa avaliação síncrona de regras por prioridade: (1) buscar regras ACTIVE ordenadas por `priority`, (2) avaliar critério de valor, hierarquia, origem e objeto+operação, (3) se nenhuma regra incide → operação livre, (4) se alguma incide → verificar auto-aprovação por scope, (5) se não auto-aprovado → INSERT `controlled_movements` + `approval_instances` nível 1 + `movement_history`. Resposta HTTP 202 quando operação é interceptada.

Implementa motor de controle com 4 critérios combináveis de alçada (VALUE, HIERARCHY, ORIGIN, OBJECT+OPERATION), cadeias de aprovação multinível com timeout e escalada, inbox de aprovações com segregação de funções (solicitante ≠ aprovador), exceção de auto-aprovação por suficiência de escopo (AUTO_APPROVED_BY_SCOPE), e override auditado com justificativa obrigatória (min 20 chars). Modelo de 7 tabelas com rastreabilidade integral via `movement_history`.

## 1.1 Problema que resolve

- **Problema:** O sistema permite que operações críticas (criação de pedidos, integrações, exclusões) sejam executadas diretamente, sem controle formal de aprovação. Sem uma camada de controle de movimentos, não há como garantir que operações de alto valor, originadas de APIs, agentes MCP ou usuários sem alçada, passem por decisão formal antes de gerar efeito.
- **Impacto hoje:** Operações críticas podem ser executadas sem aprovação; sem segregação de funções; sem rastreabilidade de decisões.
- **Resultado esperado:** Motor de controle com 4 critérios combináveis, cadeias de aprovação multinível, inbox de aprovações, override auditado e rastreabilidade integral.

## 1.2 Público-alvo (personas e perfis)

| Persona | Scope requerido | Ações disponíveis |
|---|---|---|
| **Admin (regras)** | `approval:rule:read` + `approval:rule:write` | Configurar regras de controle e alçadas |
| **Sistema/Módulo chamador** | `approval:engine:evaluate` | Chamar motor de controle para avaliar operação |
| **Operador (leitura)** | `approval:movement:read` | Visualizar movimentos controlados |
| **Solicitante** | `approval:movement:write` | Cancelar movimentos próprios pendentes |
| **Aprovador** | `approval:decide` | Aprovar ou reprovar movimentos no inbox |
| **Gestor (override)** | `approval:override` | Override com justificativa obrigatória auditada |

## 1.3 Métricas de sucesso (OKRs)

| # | Métrica | Alvo |
|---|---|---|
| OKR-1 | Segregação mantida: solicitante sem scope suficiente nunca aprova o próprio movimento; auto-aprovação por scope registrada em 100% dos casos | 100% |
| OKR-2 | Override auditado com justificativa em movement_override_log | 100% |
| OKR-3 | Rastreabilidade integral: todos os eventos em movement_history | 100% |
| OKR-4 | API/MCP como origem gera movimento controlado quando regra aplica | 100% |

## 2. Escopo

### Inclui

- API: Regras de Controle de Gravação — define quais operações são controladas (F01)
- API: Regras de Alçada — define quem aprova e sob quais critérios (F01)
- API: Motor de Controle — intercepta operações e gera movimentos controlados (F02)
- API: Inbox de Aprovações — aprovadores veem e decidem sobre movimentos pendentes (F03)
- API: Execução e Override de Movimentos (F03)
- Histórico integral: solicitação, decisão, execução, falha, reprocessamento, cancelamento
- UX: Inbox de Aprovações (UX-APROV-001) (F04)
- UX: Configurador de Regras de Controle e Alçada (UX-APROV-002) (F05)

### Não inclui

- Gates de processo (dentro de fluxo de estágio) — MOD-006
- Delegação de identidade — MOD-004
- Agentes MCP disparando movimentos — MOD-010 (MCP como origem)
- Revisão periódica de acessos — roadmap Wave 3+

### Premissas e Restrições

- **Premissas:** MOD-000 provê auth, RBAC e catálogo de scopes. MOD-004 provê delegações de acesso. MOD-006 provê execução de casos (relação case_id opcional).
- **Restrições:** MOD-009 (Movimentos) é ortogonal ao MOD-006 (Gates). Gates operam dentro de fluxos de processo; Movimentos operam em qualquer operação crítica. A segregação solicitante ≠ aprovador é inegociável, com exceção documentada de auto-aprovação por suficiência de escopo (§3.1 do épico).

## 3. Nível de Arquitetura

**Nível 2 — DDD-lite + Full Clean** (DOC-ESC-001 §7)

Módulo com domínio rico: motor de controle síncrono com avaliação de regras por prioridade, 4 critérios combináveis de alçada (VALUE, HIERARCHY, ORIGIN, OBJECT+OPERATION), cadeia de aprovação multinível com timeout e escalada, segregação de funções com exceção por scope, override auditado com justificativa obrigatória (min 20 chars). Possui 7 tabelas próprias, 13 endpoints, 13 domain events, e integração com MOD-000 (RBAC + audit trail), MOD-004 (delegações) e MOD-006 (case_id opcional).

O aggregate root `ControlledMovement` centraliza todas as invariantes: status do movimento, nível atual de aprovação, cadeia de aprovadores, histórico de eventos. Nenhuma operação (aprovação, rejeição, override, execução) pode ser executada sem passar pelo aggregate, garantindo consistência transacional. Value objects (`MovementStatus`, `ApprovalDecision`, `OriginType`) encapsulam regras de estados válidos e transições permitidas. Domain services (`ControlEngine`, `ApprovalChainResolver`, `OverrideAuditor`) orquestram lógica cross-entity.

### Justificativa (Score DOC-ESC-001 §4.2: 6/6)

| Gatilho | Presente | Evidência |
|---|---|---|
| Estado/workflow | **SIM** | Motor de controle com avaliação síncrona; status PENDING_APPROVAL → APPROVED/REJECTED/OVERRIDDEN/EXECUTED/CANCELLED/FAILED; cadeia multinível com escalada |
| Compliance/auditoria | **SIM** | movement_history (rastreabilidade integral), movement_override_log (override auditado), segregação de funções, 13 domain events, X-Correlation-ID obrigatório |
| Concorrência/consistência | **SIM** | Aprovação atômica (controlled_movements + approval_instances + movement_history em transação), segregação validada no service |
| Integrações externas críticas | **SIM** | Intercepta operações de qualquer módulo (API, MCP, AGENT); correlação com MOD-006 (case_id) |
| Multi-tenant/escopo por cliente | **SIM** | `tenant_id` obrigatório em todas as queries, ACL via 7 scopes `approval:*` |
| Regras cruzadas/reuso alto | **SIM** | Motor reutilizável por qualquer módulo; 4 critérios combináveis; consome RBAC do MOD-000, delegações do MOD-004 |

### Estrutura Recomendada (DOC-ESC-001 §7.3)

#### API (`apps/api`)

```text
apps/api/src/modules/movement-approval/
  domain/
    aggregates/
      controlled-movement.ts        # Aggregate Root — controla invariantes do movimento
    entities/
      movement-control-rule.ts
      approval-rule.ts
      approval-instance.ts
      movement-execution.ts
      movement-history-entry.ts
      movement-override-log-entry.ts
    value-objects/
      movement-status.ts            # PENDING_APPROVAL | APPROVED | AUTO_APPROVED | REJECTED | EXECUTED | CANCELLED | OVERRIDDEN | FAILED
      approval-decision.ts          # APPROVED | REJECTED | TIMEOUT | ESCALATED
      origin-type.ts                # HUMAN | API | MCP | AGENT
      approval-criteria.ts          # VALUE | HIERARCHY | ORIGIN | OBJECT
    domain-services/
      control-engine.service.ts     # Motor de controle síncrono
      approval-chain-resolver.ts    # Resolução da cadeia de aprovação multinível
      override-auditor.service.ts   # Validação e registro de override
      auto-approval.service.ts      # Auto-aprovação por suficiência de escopo
    domain-events/
      movement-events.ts            # 13 domain events (DATA-003)
    errors/
      segregation-violation.error.ts
      justification-required.error.ts
      movement-not-pending.error.ts
      scope-insufficient.error.ts
  application/
    use-cases/
      create-control-rule.ts
      update-control-rule.ts
      create-approval-rule.ts
      update-approval-rule.ts
      evaluate-operation.ts
      approve-movement.ts
      reject-movement.ts
      cancel-movement.ts
      override-movement.ts
      execute-movement.ts
      auto-approve-by-scope.ts
    ports/
      control-rule-repository.port.ts
      approval-rule-repository.port.ts
      movement-repository.port.ts
      approval-instance-repository.port.ts
      execution-repository.port.ts
      history-repository.port.ts
      override-log-repository.port.ts
      scope-checker.port.ts           # Consulta scopes do solicitante (MOD-000)
      event-bus.port.ts
    dtos/
  infrastructure/
    db/
      repositories/
      mappers/
    clients/
      mod000-scope-checker.ts         # Implementa port de consulta ao MOD-000
  presentation/
    routes/
    controllers/
    validators/
    mappers/
```

#### Web (`apps/web`) — Nível 2 UI

```text
apps/web/src/modules/movement-approval/
  ui/
    screens/
      approval-inbox/                # UX-APROV-001 — Inbox de Aprovações
      rules-configurator/            # UX-APROV-002 — Configurador de Regras
    components/
      movement-card/                 # Card de movimento com countdown
      movement-detail-panel/         # Painel lateral de detalhes
      approval-chain-progress/       # Progresso da cadeia de aprovação
      override-modal/                # Modal de override com justificativa
      approve-reject-form/           # Form de aprovação/reprovação com parecer
      origin-badge/                  # Badge de origem (HUMAN, API, MCP, AGENT)
      control-rule-drawer/           # Drawer de criação/edição de regra
      approval-chain-editor/         # Editor visual de cadeia de alçada
      dry-run-simulator/             # Simulação inline do motor
      sidebar-badge/                 # Badge de contagem de pendências
  domain/
    state-machine.ts                 # Estado do movimento (readonly detection)
    rules.ts                         # Regras de UI (segregação visual, enable/disable)
    view-model.ts                    # Formatação de dados para inbox e painéis
  data/
    commands.ts                      # Mutations (approve, reject, override, cancel, etc.)
    queries.ts                       # GET /movements, GET /my/approvals
    mappers.ts                       # API DTO ↔ view-model
```

## 4. Dependências

- **Depende de:** MOD-000 (Foundation) — auth, RBAC scopes (`approval:*`), domain events, audit trail
- **Depende de:** MOD-004 (Identidade Avançada) — delegações de acesso
- **Depende de:** MOD-006 (Execução de Casos) — `case_id` opcional nos movimentos
- **Dependentes:** MOD-010 (MCP como origem de movimentos)

### Caminhos do Módulo (module_paths)

| Camada | Path |
|---|---|
| Especificação | `docs/04_modules/mod-009-movimentos-aprovacao/` |
| User Stories | `docs/04_modules/user-stories/features/US-MOD-009-F*.md` |
| Épico | `docs/04_modules/user-stories/epics/US-MOD-009.md` |
| Screen Manifests | `docs/05_manifests/screens/ux-aprov-001.inbox-aprovacoes.yaml`, `ux-aprov-002.config-regras.yaml` |
| API — Domain | `apps/api/src/modules/movement-approval/domain/` |
| API — Application | `apps/api/src/modules/movement-approval/application/` |
| API — Infrastructure | `apps/api/src/modules/movement-approval/infrastructure/` |
| API — Presentation | `apps/api/src/modules/movement-approval/presentation/` |
| API — Routes | `src/modules/movement-approval/routes/*.route.ts` |
| API — Schema | `src/modules/movement-approval/schema.ts` |
| API — Services | `src/modules/movement-approval/services/` |
| OpenAPI | `apps/api/openapi/mod-009-movimentos-aprovacao.yaml` |
| Migrations | `apps/api/src/modules/movement-approval/infrastructure/db/migrations/` |
| Tests — Unit | `apps/api/src/modules/movement-approval/**/*.spec.ts` |
| Tests — Integration | `apps/api/tests/integration/movement-approval/` |
| Web — UI | `apps/web/src/modules/movement-approval/ui/screens/`, `apps/web/src/modules/movement-approval/ui/components/` |
| Web — Domain | `apps/web/src/modules/movement-approval/domain/` |
| Web — Data | `apps/web/src/modules/movement-approval/data/` |

## 5. Sub-Histórias (Features)

| Feature | Tema | Tipo | Status |
|---|---|---|---|
| [US-MOD-009-F01](../user-stories/features/US-MOD-009-F01.md) | API Regras de controle + alçada | Backend | `READY` |
| [US-MOD-009-F02](../user-stories/features/US-MOD-009-F02.md) | API Motor de controle (interceptação) | Backend | `READY` |
| [US-MOD-009-F03](../user-stories/features/US-MOD-009-F03.md) | API Inbox + execução + override | Backend | `READY` |
| [US-MOD-009-F04](../user-stories/features/US-MOD-009-F04.md) | UX Inbox de aprovações | UX | `READY` |
| [US-MOD-009-F05](../user-stories/features/US-MOD-009-F05.md) | UX Configurador de regras | UX | `READY` |

## 6. Screen Manifests

| Manifest | Screen ID | Rota | Status |
|---|---|---|---|
| `docs/05_manifests/screens/ux-aprov-001.inbox-aprovacoes.yaml` | UX-APROV-001 | /aprovacoes | DRAFT |
| `docs/05_manifests/screens/ux-aprov-002.config-regras.yaml` | UX-APROV-002 | /aprovacoes/configurar | DRAFT |

## 7. Endpoints do Módulo

| Método | Path | operationId | Scope |
|---|---|---|---|
| GET | /api/v1/admin/control-rules | `admin_control_rules_list` | `approval:rule:read` |
| POST | /api/v1/admin/control-rules | `admin_control_rules_create` | `approval:rule:write` |
| PATCH | /api/v1/admin/control-rules/:id | `admin_control_rules_update` | `approval:rule:write` |
| POST | /api/v1/admin/control-rules/:id/approval-rules | `admin_approval_rules_create` | `approval:rule:write` |
| PATCH | /api/v1/admin/approval-rules/:id | `admin_approval_rules_update` | `approval:rule:write` |
| — | — | — | — |
| POST | /api/v1/movement-engine/evaluate | `movement_engine_evaluate` | `approval:engine:evaluate` |
| — | — | — | — |
| GET | /api/v1/movements | `movements_list` | `approval:movement:read` |
| GET | /api/v1/movements/:id | `movements_get` | `approval:movement:read` |
| POST | /api/v1/movements/:id/cancel | `movements_cancel` | `approval:movement:write` |
| POST | /api/v1/movements/:id/override | `movements_override` | `approval:override` |
| — | — | — | — |
| GET | /api/v1/my/approvals | `my_approvals_list` | — (próprio usuário) |
| POST | /api/v1/my/approvals/:approvalId/approve | `my_approvals_approve` | `approval:decide` |
| POST | /api/v1/my/approvals/:approvalId/reject | `my_approvals_reject` | `approval:decide` |

## 8. Novos Escopos — Amendment MOD-000-F12

| Escopo | Descrição |
|---|---|
| `approval:rule:read` | Ver regras de controle e alçadas |
| `approval:rule:write` | Criar/editar regras |
| `approval:engine:evaluate` | Chamar motor de controle (usado por outros módulos) |
| `approval:movement:read` | Ver movimentos controlados |
| `approval:movement:write` | Cancelar movimentos (pelo solicitante) |
| `approval:decide` | Aprovar ou reprovar movimentos |
| `approval:override` | Override com justificativa obrigatória (poder especial auditado) |

## 9. Requisitos (Índice)

<!-- start index -->
- [BR-009](requirements/br/BR-009.md) — Regras de Negócio de Movimentos sob Aprovação
- [FR-009](requirements/fr/FR-009.md) — Requisitos Funcionais de Movimentos sob Aprovação
- [DATA-009](requirements/data/DATA-009.md) — Modelo de Dados de Movimentos sob Aprovação
- [DATA-003](requirements/data/DATA-003.md) — Catálogo de Domain Events de Movimentos sob Aprovação
- [INT-009](requirements/int/INT-009.md) — Integrações e Contratos de Movimentos sob Aprovação
- [SEC-009](requirements/sec/SEC-009.md) — Segurança e Compliance de Movimentos sob Aprovação
- [SEC-002](requirements/sec/SEC-002.md) — Matriz de Autorização de Eventos de Movimentos sob Aprovação
- [UX-009](requirements/ux/UX-009.md) — Jornadas e Fluxos de Movimentos sob Aprovação
- [UX-009-C01](amendments/ux/UX-009-C01.md) — Correção: hex hardcoded → tokens semânticos no MovementsPage
- [INT-009-C01](amendments/int/INT-009-C01.md) — Correção: 13 endpoints enviam camelCase sem mapear para snake_case dos schemas Zod
- [NFR-009](requirements/nfr/NFR-009.md) — Requisitos Não Funcionais de Movimentos sob Aprovação
- [PEN-009](requirements/pen-009-pendente.md) — Questões Abertas de Movimentos sob Aprovação
<!-- end index -->

## 10. Decisões (ADR)

<!-- start adr-index -->
- [ADR-001](adr/ADR-001.md) — Motor de Controle Síncrono
- [ADR-002](adr/ADR-002.md) — Segregação com Exceção de Auto-Aprovação por Scope
- [ADR-003](adr/ADR-003.md) — Outbox Pattern para Domain Events de Movimentos
- [ADR-004](adr/ADR-004.md) — Override Auditado com Justificativa Mínima 20 Caracteres
<!-- end adr-index -->
