> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.3.0  | 2026-03-19 | manage-pendentes | REOPENED target_stage_id no payload + transição §5.1 atualizada. Ref PEN-006/PENDENTE-005 |
> | 0.2.0  | 2026-03-19 | AGN-DEV-04  | Enriquecimento DATA — constraints detalhados, value objects, invariantes, migração, relacionamentos cross-module |
> | 0.1.0  | 2026-03-18 | arquitetura | Baseline Inicial (forge-module) |

# DATA-006 — Modelo de Dados da Execução de Casos

---

## 1. Visão Geral

5 tabelas próprias que capturam o ciclo de vida de casos sobre blueprints do MOD-005. O aggregate root é `case_instances`, que centraliza todas as invariantes de estado (status, estágio atual, gates pendentes, atribuições ativas).

```
case_instances          → O CASO em si (status geral, datas, objeto de negócio)
    │                     Aggregate Root — todas as operações passam por aqui
    │
    ├── stage_history   → ONDE o caso esteve (mudanças de estágio)
    │                     Append-only — nunca editado após inserção
    │
    ├── gate_instances  → COMO os gates foram resolvidos (decisões formais)
    │                     UNIQUE(case_id, gate_id) — um gate por caso
    │
    ├── case_assignments → QUEM está responsável agora (por papel, com vigência)
    │                     Soft-toggle via is_active — nunca deletado
    │
    └── case_events     → O QUE aconteceu (fatos relevantes sem mudança de estágio)
                          Append-only — nunca editado após inserção
```

### 1.1 Anti-patterns evitados (DOC-FND-000)

- **NÃO** recria tabelas de users, tenants ou credentials — apenas FK para `users.id` e `tenants.id`
- **NÃO** duplica autenticação/autorização — usa `@RequireScope` e `tenant_id` como filtro mandatório
- **NÃO** duplica tabelas de blueprint do MOD-005 — referencia via FK para `process_cycles`, `process_stages`, `process_gates`, `stage_transitions`, `process_roles`

---

## 2. Tabelas

### 2.1 `case_instances` — Instância do Caso (Aggregate Root)

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | UUID v4 gerado no servidor |
| `codigo` | varchar(50) | UNIQUE NOT NULL | Identificador amigável (ex: CASO-2026-00042). Gerado automaticamente (BR-010) |
| `cycle_id` | uuid | FK→process_cycles.id NOT NULL | Ciclo de referência |
| `cycle_version_id` | uuid | FK→process_cycles.id NOT NULL | Versão exata frozen ao abrir o caso (BR-001). Imutável após criação |
| `current_stage_id` | uuid | FK→process_stages.id NOT NULL | Estágio atual |
| `status` | varchar(20) | NOT NULL CHECK(status IN ('OPEN','COMPLETED','CANCELLED','ON_HOLD')) | Máquina de estados (BR-012) |
| `object_type` | varchar(100) | nullable | Tipo do objeto de negócio vinculado (ex: 'sale_order') |
| `object_id` | uuid | nullable | ID do objeto de negócio |
| `org_unit_id` | uuid | FK→org_units.id, nullable | Área organizacional do caso (MOD-003) |
| `tenant_id` | uuid | FK→tenants.id NOT NULL | Filial/tenant do caso. Filtro mandatório em todas as queries |
| `opened_by` | uuid | FK→users.id NOT NULL | Quem abriu o caso |
| `opened_at` | timestamptz | NOT NULL DEFAULT now() | |
| `completed_at` | timestamptz | nullable | Preenchido quando status→COMPLETED (BR-004). Limpo em REOPENED (BR-016) |
| `cancelled_at` | timestamptz | nullable | Preenchido quando status→CANCELLED |
| `cancellation_reason` | text | nullable | Obrigatório quando status→CANCELLED (BR-011) |
| `created_at` | timestamptz | NOT NULL DEFAULT now() | |
| `updated_at` | timestamptz | NOT NULL DEFAULT now() | Atualizado via trigger ou application |

**Constraints:**

- CHECK: `status IN ('OPEN','COMPLETED','CANCELLED','ON_HOLD')`
- CHECK: `cancelled_at IS NOT NULL` quando `status = 'CANCELLED'` (enforced via application — BR-011)
- CHECK: `cancellation_reason IS NOT NULL` quando `status = 'CANCELLED'` (enforced via application)

**Indexes:**

- `idx_case_instances_tenant_status` — (tenant_id, status) — filtro principal da listagem
- `idx_case_instances_cycle` — (cycle_id) — filtro por ciclo
- `idx_case_instances_codigo` — UNIQUE (codigo) — busca por código amigável
- `idx_case_instances_tenant_opened_at` — (tenant_id, opened_at DESC) — ordenação padrão da listagem
- `idx_case_instances_object` — (object_type, object_id) WHERE object_id IS NOT NULL — busca por objeto de negócio vinculado
- `idx_case_instances_org_unit` — (org_unit_id) WHERE org_unit_id IS NOT NULL — filtro por área organizacional

**Value Objects associados:**

- `CaseStatus`: OPEN | COMPLETED | CANCELLED | ON_HOLD — com transições válidas (BR-012)

### 2.2 `stage_history` — Histórico de Estágio (Append-only)

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `case_id` | uuid | FK→case_instances.id NOT NULL ON DELETE CASCADE | |
| `from_stage_id` | uuid | FK→process_stages.id, nullable | null = abertura do caso |
| `to_stage_id` | uuid | FK→process_stages.id NOT NULL | |
| `transition_id` | uuid | FK→stage_transitions.id, nullable | null = abertura |
| `transitioned_by` | uuid | FK→users.id NOT NULL | |
| `transitioned_at` | timestamptz | NOT NULL DEFAULT now() | |
| `motivo` | text | nullable | |
| `evidence` | jsonb | nullable | `{ type: 'note'\|'file', content?, url? }` |

**Invariantes:**

- Append-only: registros NUNCA são editados ou deletados
- `from_stage_id = null` apenas no primeiro registro (abertura do caso)
- `transition_id` referencia transição válida do blueprint frozen (cycle_version_id)

**Indexes:**

- `idx_stage_history_case` — (case_id, transitioned_at DESC) — timeline por caso
- `idx_stage_history_tenant` — via JOIN com case_instances (tenant isolation)

### 2.3 `gate_instances` — Instância de Gate

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `case_id` | uuid | FK→case_instances.id NOT NULL ON DELETE CASCADE | |
| `gate_id` | uuid | FK→process_gates.id NOT NULL | Gate do blueprint |
| `stage_id` | uuid | FK→process_stages.id NOT NULL | Estágio ao qual o gate pertence |
| `status` | varchar(20) | NOT NULL CHECK(status IN ('PENDING','RESOLVED','WAIVED','REJECTED')) DEFAULT 'PENDING' | |
| `resolved_by` | uuid | FK→users.id, nullable | |
| `resolved_at` | timestamptz | nullable | |
| `decision` | varchar(20) | nullable CHECK(decision IN ('APPROVED','REJECTED','WAIVED')) | Para APPROVAL gates |
| `parecer` | text | nullable | Nota do aprovador. Obrigatório para APPROVAL (enforced via application) |
| `evidence` | jsonb | nullable | `{ type: "file", url, filename }` para DOCUMENT gates |
| `checklist_items` | jsonb | nullable | `[{ id, label, checked }]` para CHECKLIST gates |

**Constraints:**

- UNIQUE (case_id, gate_id) — Um gate por caso
- CHECK: `status IN ('PENDING','RESOLVED','WAIVED','REJECTED')`
- CHECK: `decision IN ('APPROVED','REJECTED','WAIVED')` quando `decision IS NOT NULL`

**Invariantes:**

- Criados automaticamente com status=PENDING ao entrar em novo estágio (FR-001, FR-002)
- Gate INFORMATIVE nunca bloqueia transição (BR-005)
- Gate APPROVAL requer can_approve=true no papel do usuário (BR-008)
- Resolução de CHECKLIST requer todos os itens checked=true (BR-013)

**Value Objects associados:**

- `GateResolutionStatus`: PENDING | RESOLVED | WAIVED | REJECTED
- `GateDecision`: APPROVED | REJECTED | WAIVED

**Indexes:**

- `idx_gate_instances_case_status` — (case_id, status) — verificação de gates pendentes no motor de transição
- `idx_gate_instances_case_stage` — (case_id, stage_id) — listagem de gates por estágio

### 2.4 `case_assignments` — Atribuição de Responsáveis

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `case_id` | uuid | FK→case_instances.id NOT NULL ON DELETE CASCADE | |
| `stage_id` | uuid | FK→process_stages.id NOT NULL | Estágio para o qual é atribuído |
| `process_role_id` | uuid | FK→process_roles.id NOT NULL | Papel que exerce |
| `user_id` | uuid | FK→users.id NOT NULL | Usuário atribuído |
| `assigned_by` | uuid | FK→users.id NOT NULL | Quem fez a atribuição |
| `assigned_at` | timestamptz | NOT NULL DEFAULT now() | |
| `valid_until` | timestamptz | nullable | Para atribuições temporárias (BR-017) |
| `is_active` | boolean | NOT NULL DEFAULT true | false = substituído/encerrado/expirado |
| `substitution_reason` | text | nullable | |
| `delegation_id` | uuid | FK→access_delegations.id, nullable | Se atribuição veio de delegação MOD-004 (BR-015) |

**Invariantes:**

- No máximo UMA atribuição ativa por (case_id, stage_id, process_role_id) — enforced via application (BR-007)
- Reatribuição DEVE desativar anterior antes de criar novo (BR-007)
- Atribuição com delegation_id expira junto com a delegação (BR-015)
- Atribuição com valid_until auto-expira (BR-017)
- Soft-toggle: registros nunca são deletados, apenas desativados (is_active=false)

**Indexes:**

- `idx_case_assignments_case_active` — (case_id, is_active) WHERE is_active=true — atribuições ativas do caso
- `idx_case_assignments_user` — (user_id, is_active) WHERE is_active=true — filtro "Minha responsabilidade" (FR-009)
- `idx_case_assignments_delegation` — (delegation_id) WHERE delegation_id IS NOT NULL — expiração via delegação
- `idx_case_assignments_valid_until` — (valid_until) WHERE is_active=true AND valid_until IS NOT NULL — job de expiração

### 2.5 `case_events` — Eventos Avulsos do Caso (Append-only)

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `case_id` | uuid | FK→case_instances.id NOT NULL ON DELETE CASCADE | |
| `event_type` | varchar(30) | NOT NULL CHECK(event_type IN ('COMMENT','EXCEPTION','REOPENED','EVIDENCE','REASSIGNED','ON_HOLD','RESUMED','STAGE_TRANSITIONED')) | |
| `descricao` | text | NOT NULL | |
| `created_by` | uuid | FK→users.id NOT NULL | |
| `created_at` | timestamptz | NOT NULL DEFAULT now() | |
| `metadata` | jsonb | nullable | Dados extras por tipo de evento |
| `stage_id` | uuid | FK→process_stages.id NOT NULL | Estágio no momento do evento |

**Invariantes:**

- Append-only: registros NUNCA são editados ou deletados
- `event_type=REOPENED` causa side-effect no aggregate (status→OPEN, completed_at→null, current_stage_id→target_stage_id) — BR-016. Payload DEVE incluir `target_stage_id` (UUID, NOT NULL, FK→process_stages.id do mesmo cycle_id). Gates do estágio destino recriados como PENDING. Ref: PEN-006/PENDENTE-005 Opção B
- `event_type=STAGE_TRANSITIONED` é registrado automaticamente pelo motor de transição (FR-002)

**Indexes:**

- `idx_case_events_case` — (case_id, created_at DESC) — timeline por caso
- `idx_case_events_type` — (case_id, event_type) — filtragem por tipo de evento

---

## 3. Diagrama de Relacionamentos

```
MOD-005 (Blueprint — read-only)     MOD-006 (Execução — read-write)
┌─────────────────┐                 ┌──────────────────────────────┐
│ process_cycles   │◄───cycle_id──── │ case_instances (Aggregate)   │
│                  │◄───version_id── │   │                          │
│ process_stages   │◄───stage_ids──  │   ├── stage_history (A/O)    │
│ process_gates    │◄───gate_id────  │   ├── gate_instances          │
│ stage_transitions│◄───trans_id───  │   ├── case_assignments        │
│ process_roles    │◄───role_id────  │   └── case_events (A/O)      │
│ stage_role_links │                 └──────────────────────────────┘
└─────────────────┘                          │         │
                                             │         │
MOD-004 (Identidade)                         │    MOD-003 (Org)
┌──────────────────┐                         │    ┌────────────┐
│ access_delegations│◄───delegation_id────────┘    │ org_units   │
└──────────────────┘                               └────────────┘
                                                        ▲
                                                        │
                                               org_unit_id (nullable)

MOD-000 (Foundation — contratos herdados)
┌──────────────┐
│ users         │◄── opened_by, transitioned_by, resolved_by, user_id, assigned_by, created_by
│ tenants       │◄── tenant_id (filtro mandatório em TODAS as queries)
│ domain_events │◄── 11 domain events emitidos (DATA-003)
└──────────────┘

A/O = Append-Only
```

---

## 4. Regras de Migração

### 4.1 Ordem de criação (DDL)

1. `case_instances` — depende de: process_cycles, process_stages, org_units, tenants, users
2. `stage_history` — depende de: case_instances, process_stages, stage_transitions, users
3. `gate_instances` — depende de: case_instances, process_gates, process_stages, users
4. `case_assignments` — depende de: case_instances, process_stages, process_roles, users, access_delegations
5. `case_events` — depende de: case_instances, process_stages, users

### 4.2 Estratégia de migração

- Usar migrations sequenciais do framework (TypeORM/Prisma)
- Todas as tabelas requerem MOD-005 instalado previamente (FKs para blueprint)
- MOD-004 é dependência opcional (delegation_id nullable)
- MOD-003 é dependência opcional (org_unit_id nullable)

### 4.3 Seed data

- Nenhum seed data obrigatório para este módulo
- Casos são criados operacionalmente via POST /api/v1/cases

---

## 5. Transições de Estado (Value Objects)

### 5.1 CaseStatus

```
        ┌────────────┐
        │    OPEN     │◄──── abertura (POST /cases)
        └─────┬──────┘
              │
    ┌─────────┼──────────┐
    │         │          │
    ▼         ▼          ▼
ON_HOLD   COMPLETED  CANCELLED
    │         ▲
    │         │
    └─► OPEN ─┘ (resume)    COMPLETED ──► OPEN (REOPENED — BR-016)
```

Transições válidas (BR-012):

- OPEN → ON_HOLD (hold)
- OPEN → COMPLETED (transição para estágio terminal — BR-004)
- OPEN → CANCELLED (cancel — BR-011)
- ON_HOLD → OPEN (resume)
- ON_HOLD → CANCELLED (cancel)
- COMPLETED → OPEN (REOPENED — requer scope `process:case:reopen` + `target_stage_id` obrigatório — BR-016, PEN-006/PENDENTE-005)

### 5.2 GateResolutionStatus

```
PENDING ──► RESOLVED (resolve com decision APPROVED ou tipo DOCUMENT/CHECKLIST)
PENDING ──► REJECTED (resolve com decision REJECTED — para APPROVAL)
PENDING ──► WAIVED (dispensa — BR-014)
```

### 5.3 GateDecision (para APPROVAL gates)

- `APPROVED` — gate aprovado
- `REJECTED` — gate reprovado (motor NÃO avança)
- `WAIVED` — gate dispensado (equivale a RESOLVED para fins do motor)

---

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-006, US-MOD-006-F01, US-MOD-006-F02, BR-006, FR-006, DOC-ARC-001, DOC-FND-000, MOD-005, MOD-004, MOD-003
- **referencias_exemplos:** EX-DATA-001
- **evidencias:** N/A
