> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.

# MOD-011 — SmartGrid: Componente de Grade com Edição em Massa

- **id:** MOD-011
- **version:** 1.0.0
- **estado_item:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-24
- **rastreia_para:** US-MOD-011, US-MOD-011-F01, US-MOD-011-F02, US-MOD-011-F03, US-MOD-011-F04, US-MOD-011-F05, DOC-DEV-001, DOC-ESC-001, DOC-ARC-003, DOC-FND-000, MOD-000, MOD-007
- **evidencias:** N/A

---

## 1. Objetivo

Módulo responsável por fornecer um **componente de grade editável para operações em massa** (inclusão, alteração e exclusão de múltiplos registros) que respeita regras de negócio configuradas no MOD-007 (Parametrização Contextual). MOD-011 é um **consumidor puro de UX** — não contém regras de negócio próprias, não possui tabelas de banco de dados e não cria novos escopos RBAC. Toda validação é delegada ao motor `POST /routine-engine/evaluate` do MOD-007, chamado 1 objeto por vez. Persistência intermediária via Export/Import JSON (client-side, sem servidor). 3 telas UX (UX-SGR-001, UX-SGR-002, UX-SGR-003), 1 amendment em MOD-007-F03 (`current_record_state`).

### Metricas de Escopo

| Metrica | Valor |
|---|---|
| Tabelas de banco de dados | 0 (UX puro) |
| Endpoints API proprios | 0 (consome MOD-007) |
| Amendment em MOD-007 | 2 (F01 — `current_record_state`; PEND-SGR-04 — `target_endpoints` no context_framer) |
| Telas UX | 3 (UX-SGR-001, UX-SGR-002, UX-SGR-003) |
| Features | 5 (F01 backend amendment + F02-F05 UX) |
| Screen Manifests | 3 |
| Scopes RBAC proprios | 0 (herda `param:engine:evaluate`, `param:framer:read` do MOD-007) |
| Domain events proprios | 0 (logs delegados ao modulo destino via MOD-000) |
| Componentes UI | 8 (SmartGridHeader, MassActionToolbar, SmartDataGrid, CloseConfirmationModal, SelectionList, DeleteConfirmationPanel, DeleteResultFeedback, SmartEditForm) |

## 2. Escopo

### Inclui

- Componente de grade editável com inclusão em massa (UX-SGR-001)
- Formulário de alteração de registro com validação por status (UX-SGR-002)
- Grade de exclusão em massa com pré-validação (UX-SGR-003)
- Integração com `routine-engine/evaluate` por linha (1 objeto por vez)
- Validação visual por linha com estados: ✅ válida, ❌ bloqueante, ⚠️ alerta
- Ações em massa sobre linhas selecionadas (aplicar valor, limpar coluna, duplicar)
- Export/Import de estado em JSON (client-side, sem servidor)
- Amendment no MOD-007-F03: suporte a `current_record_state` no motor de avaliação

### Não inclui

- Configuração de Operações — permanece no MOD-007 (UX-ROTINA-001)
- Persistência de rascunhos no servidor
- Endpoint batch de validação
- Criação de novas tabelas de banco de dados (MOD-011 é UX puro)
- Criação de novos escopos RBAC (herda `param:engine:evaluate` e `param:framer:read` do MOD-007)

## 3. Nível de Arquitetura

**Nível 1 — UX Consumer** (DOC-ESC-001 §6)

Módulo sem domínio próprio: não possui tabelas, não possui regras de negócio, não possui scopes. Consome o motor de avaliação do MOD-007 como fonte de verdade para renderização dinâmica de formulários e grades. Lógica restrita à camada de apresentação (rendering, validação visual, export/import client-side).

### Justificativa (Score DOC-ESC-001 §4.2: 1/6)

| Gatilho | Presente | Evidência |
|---|---|---|
| Estado/workflow | **NÃO** | Sem máquina de estados própria. Status visual (✅/❌/⚠️) é efêmero na UI |
| Compliance/auditoria | **NÃO** | Logs de alteração delegados ao domain_events do módulo destino (via MOD-000) |
| Concorrência/consistência | **NÃO** | Sem persistência server-side. Grade é sessão do navegador |
| Integrações externas críticas | **NÃO** | Consome apenas MOD-007 (interno) |
| Multi-tenant/escopo por cliente | **SIM** | Herda tenant isolation do MOD-007 (chamadas ao motor passam tenant_id) |
| Regras cruzadas/reuso alto | **NÃO** | Componente reutilizável, mas sem regras de domínio |

### Estrutura Recomendada (DOC-ESC-001 §6.2)

#### Web (`apps/web`) — Nível 1 UI

```text
apps/web/src/modules/smartgrid/
  ui/
    screens/
      bulk-insert/              # UX-SGR-001 — Grade de Inclusão em Massa
      record-edit/              # UX-SGR-002 — Formulário de Alteração
      bulk-delete/              # UX-SGR-003 — Grade de Exclusão em Massa
    components/
      data-grid/                # Componente de grade editável
      row-status-icon/          # ✅ ❌ ⚠️ status visual por linha
      mass-action-toolbar/      # Toolbar de ações em massa (F05)
      close-confirmation-modal/ # Modal de confirmação ao fechar
      export-import-json/       # Botões e lógica de export/import
      blocked-record-message/   # Mensagem de registro bloqueado (F03)
    forms/
      record-edit-form/         # Formulário dinâmico de alteração (F03)
  domain/
    motor-evaluator.ts          # Wrapper para POST /routine-engine/evaluate
    row-status-mapper.ts        # Mapeamento motor response → status visual
    json-serializer.ts          # Serialização/deserialização do estado da grade
    rules.ts                    # Regras de UI (enable/disable Save, toolbar show/hide)
  data/
    commands.ts                 # Mutations (save batch, save single, soft delete)
    queries.ts                  # GET /routine-engine/evaluate
    mappers.ts                  # Adaptação motor response → grid columns
```

#### API (`apps/api`) — Amendment Only

```text
apps/api/src/modules/parametrization/  # MOD-007 — amendment F01
  # Arquivo(s) alterado(s) para suportar current_record_state no evaluate
```

## Fluxo de Integração com MOD-007

```text
┌──────────────────────────────────────────────────────────┐
│ SmartGrid (MOD-011) — Camada de Apresentação             │
│                                                          │
│  UX-SGR-001        UX-SGR-002        UX-SGR-003          │
│  (Inclusão em      (Alteração de     (Exclusão em        │
│   Massa)            Registro)          Massa)            │
│                                                          │
│  motor-evaluator.ts (wrapper)                            │
│       │                                                  │
└───────┼──────────────────────────────────────────────────┘
        │ POST /api/v1/routine-engine/evaluate
        │ (1 objeto por vez, com ou sem current_record_state)
        ▼
┌──────────────────────────────────────────────────────────┐
│ MOD-007 — Motor de Avaliação                             │
│  context_framer (tipo OPERACAO) → behavior_routine       │
│  → routine_items (FIELD_VISIBILITY, REQUIRED, DEFAULT,   │
│     DOMAIN, VALIDATION) → response                       │
│  { visible_fields, required_fields, defaults,            │
│    domain_restrictions, validations,                     │
│    blocking_validations }                                │
└──────────────────────────────────────────────────────────┘
```

### Mapeamento Response do Motor para Status Visual

| Campo do Response | Status Visual | Comportamento na UI |
|---|---|---|
| `blocking_validations` nao vazio | ❌ Bloqueante | Linha/registro impedido. Mensagem exibida. Save desabilitado. |
| `validations` nao vazio (sem blocking) | ⚠️ Alerta | Linha com aviso. Save permitido. |
| Nenhuma violacao | ✅ Valida | Linha OK. Contribui para habilitar Save. |
| Sem avaliacao realizada | Neutro (sem icone) | Estado inicial. Save desabilitado ate validacao. |

## 4. Dependências

- **Depende de:** MOD-007 (Parametrização Contextual) — motor de avaliação (`routine-engine/evaluate`), configuração de Operações (`context_framers`, `behavior_routines`)
- **Depende de:** MOD-000 (Foundation) — auth, RBAC (scopes herdados do MOD-007), domain events para log de alterações
- **Dependentes:** Nenhum

### Caminhos do Módulo (module_paths)

| Camada | Path |
|---|---|
| Especificação | `docs/04_modules/mod-011-smartgrid/` |
| User Stories | `docs/04_modules/user-stories/features/US-MOD-011-F*.md` |
| Épico | `docs/04_modules/user-stories/epics/US-MOD-011.md` |
| Screen Manifests | `docs/05_manifests/screens/ux-sgr-001.inclusao-massa.yaml`, `ux-sgr-002.alteracao-registro.yaml`, `ux-sgr-003.exclusao-massa.yaml` |
| Web — UI | `apps/web/src/modules/smartgrid/ui/screens/`, `apps/web/src/modules/smartgrid/ui/components/` |
| Web — Domain | `apps/web/src/modules/smartgrid/domain/` |
| Web — Data | `apps/web/src/modules/smartgrid/data/` |
| Amendment MOD-007 | `apps/api/src/modules/parametrization/` (F01 — `current_record_state`) |

## 5. Sub-Histórias (Features)

| Feature | Tema | Tipo | Status |
|---|---|---|---|
| [US-MOD-011-F01](../user-stories/features/US-MOD-011-F01.md) | Amendment: `current_record_state` no motor MOD-007 | Backend (amendment) | `APPROVED` |
| [US-MOD-011-F02](../user-stories/features/US-MOD-011-F02.md) | UX Grade de Inclusão em Massa | UX | `APPROVED` |
| [US-MOD-011-F03](../user-stories/features/US-MOD-011-F03.md) | UX Formulário de Alteração de Registro | UX | `APPROVED` |
| [US-MOD-011-F04](../user-stories/features/US-MOD-011-F04.md) | UX Grade de Exclusão em Massa | UX | `APPROVED` |
| [US-MOD-011-F05](../user-stories/features/US-MOD-011-F05.md) | UX Ações em Massa sobre Linhas | UX | `APPROVED` |

## 6. Itens Base (Canônicos) e Links

<!-- start index -->
- [BR-011](requirements/br/BR-011.md) — Regras de Negócio do SmartGrid
- [FR-011](requirements/fr/FR-011.md) — Requisitos Funcionais do SmartGrid
- [DATA-011](requirements/data/DATA-011.md) — Modelo de Dados do SmartGrid
- [DATA-003](requirements/data/DATA-003.md) — Catálogo de Domain Events do SmartGrid
- [INT-011](requirements/int/INT-011.md) — Integrações e Contratos do SmartGrid
- [SEC-011](requirements/sec/SEC-011.md) — Segurança e Compliance do SmartGrid
- [SEC-002](requirements/sec/SEC-002.md) — Matriz de Autorização de Eventos do SmartGrid
- [UX-011](requirements/ux/UX-011.md) — Jornadas e Fluxos do SmartGrid
- [NFR-011](requirements/nfr/NFR-011.md) — Requisitos Não Funcionais do SmartGrid
- [PEN-011](requirements/pen-011-pendente.md) — Questões Abertas do SmartGrid
- [UX-011-M01](amendments/ux/UX-011-M01.md) — Melhoria: Alinhar UX com spec 95-smartgrid (grade editavel, formulario, exclusao, modais, ReadOnlyField)
<!-- end index -->

## 7. Decisões (ADR)

<!-- start adr-index -->
- [ADR-001](adr/ADR-001.md) — Motor de Avaliação Chamado 1 Objeto por Vez (Sem Batch Endpoint)
- [ADR-002](adr/ADR-002.md) — Sem Persistência Server-Side de Drafts (Export/Import JSON Client-Side)
<!-- end adr-index -->
