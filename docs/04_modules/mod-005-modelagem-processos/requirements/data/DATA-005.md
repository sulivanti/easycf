> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-16 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-17 | AGN-DEV-04  | Enriquecimento DATA (enrich-agent) |

# DATA-005 — Modelo de Dados da Modelagem de Processos

> Permitir gerar **modelo**, **migração**, **queries** e **contratos** sem inferência arriscada.

- **Objetivo:** Documentar as 7 tabelas do módulo MOD-005 (Modelagem de Processos / Blueprint).
- **Tipo de Tabela/Armazenamento:** PostgreSQL — tabelas próprias do módulo com soft delete.

---

## 1. Diagrama de Relacionamento

```
process_cycles (1)
  └── process_macro_stages (N)
        └── process_stages (N)
              ├── process_gates (N)
              ├── stage_role_links (N) ──► process_roles (catálogo global)
              └── stage_transitions (N, from/to)
```

---

## 2. Entidades

### 2.1 `process_cycles` — Ciclos de Processo

> Aggregate Root. Controla a máquina de estados DRAFT → PUBLISHED → DEPRECATED.

| Campo | Tipo | Required | Constraint | Descrição |
|---|---|---|---|---|
| `id` | uuid | SIM | PK | |
| `tenant_id` | uuid | SIM | FK→tenants.id, NOT NULL | Isolamento multi-tenant (DOC-FND-000) |
| `codigo` | varchar(50) | SIM | UNIQUE NOT NULL | Imutável após criação (BR-006) |
| `nome` | varchar(200) | SIM | NOT NULL | |
| `descricao` | text | NÃO | nullable | |
| `version` | integer | SIM | NOT NULL, default 1 | Incrementa a cada fork |
| `status` | varchar(20) | SIM | NOT NULL, CHECK IN ('DRAFT','PUBLISHED','DEPRECATED') | Máquina de estados (BR-010) |
| `parent_cycle_id` | uuid | NÃO | FK→process_cycles.id, nullable | Ciclo origem do fork |
| `published_at` | timestamptz | NÃO | nullable | Preenchido ao publicar |
| `created_by` | uuid | SIM | FK→users.id | |
| `created_at` | timestamptz | SIM | NOT NULL, default now() | |
| `updated_at` | timestamptz | SIM | NOT NULL, default now() | |
| `deleted_at` | timestamptz | NÃO | nullable | Soft delete — somente DRAFT/DEPRECATED (BR-005) |

**Constraints:**
- `UNIQUE(tenant_id, codigo, version)` — unicidade de código+versão por tenant
- `CHECK(status IN ('DRAFT', 'PUBLISHED', 'DEPRECATED'))`

**Indexes:**
- `idx_cycles_tenant_status` → `(tenant_id, status)` — listagem filtrada
- `idx_cycles_parent` → `(parent_cycle_id)` WHERE parent_cycle_id IS NOT NULL — histórico de versões

---

### 2.2 `process_macro_stages` — Macroetapas

| Campo | Tipo | Required | Constraint | Descrição |
|---|---|---|---|---|
| `id` | uuid | SIM | PK | |
| `cycle_id` | uuid | SIM | FK→process_cycles.id NOT NULL | |
| `codigo` | varchar(50) | SIM | NOT NULL | Imutável (BR-006). Único dentro do ciclo |
| `nome` | varchar(200) | SIM | NOT NULL | |
| `ordem` | integer | SIM | NOT NULL | Ordem dentro do ciclo |
| `created_by` | uuid | SIM | FK→users.id | |
| `created_at` | timestamptz | SIM | NOT NULL, default now() | |
| `updated_at` | timestamptz | SIM | NOT NULL, default now() | |
| `deleted_at` | timestamptz | NÃO | nullable | Bloqueado se estágios ativos (BR-005) |

**Constraints:**
- `UNIQUE(cycle_id, codigo) WHERE deleted_at IS NULL` — unicidade por ciclo
- `UNIQUE(cycle_id, ordem) WHERE deleted_at IS NULL` — sem duplicata de ordem

**Indexes:**
- `idx_macro_stages_cycle_ordem` → `(cycle_id, ordem)` — ordenação natural

---

### 2.3 `process_stages` — Estágios

| Campo | Tipo | Required | Constraint | Descrição |
|---|---|---|---|---|
| `id` | uuid | SIM | PK | |
| `macro_stage_id` | uuid | SIM | FK→process_macro_stages.id NOT NULL | |
| `cycle_id` | uuid | SIM | FK→process_cycles.id NOT NULL | Denormalizado (ADR-001). Populado via trigger BEFORE INSERT |
| `codigo` | varchar(50) | SIM | NOT NULL | Imutável (BR-006). Único dentro da macroetapa |
| `nome` | varchar(200) | SIM | NOT NULL | |
| `descricao` | text | NÃO | nullable | |
| `ordem` | integer | SIM | NOT NULL | Ordem dentro da macroetapa |
| `is_initial` | boolean | SIM | default false | Apenas 1 por ciclo (BR-002) |
| `is_terminal` | boolean | SIM | default false | Sem transições de saída obrigatórias |
| `canvas_x` | integer | NÃO | nullable | Posição X no editor visual (UX-PROC-001) |
| `canvas_y` | integer | NÃO | nullable | Posição Y no editor visual (UX-PROC-001) |
| `created_by` | uuid | SIM | FK→users.id | |
| `created_at` | timestamptz | SIM | NOT NULL, default now() | |
| `updated_at` | timestamptz | SIM | NOT NULL, default now() | |
| `deleted_at` | timestamptz | NÃO | nullable | Bloqueado se instâncias ativas no MOD-006 (BR-005) |

**Constraints:**
- `UNIQUE(macro_stage_id, codigo) WHERE deleted_at IS NULL`
- `UNIQUE(cycle_id) WHERE is_initial=true AND deleted_at IS NULL` — partial unique index nativo (ADR-001, Opção B aceita)

**Indexes:**
- `idx_stages_macro_ordem` → `(macro_stage_id, ordem)` — ordenação natural
- `idx_stages_initial_unique` → `UNIQUE(cycle_id) WHERE is_initial=true AND deleted_at IS NULL` — garante BR-002 no nível de banco
- `idx_stages_cycle` → `(cycle_id)` — simplifica validação cross-ciclo (BR-008) e query /flow

**Trigger de consistência (ADR-001):**
```sql
-- Popula cycle_id automaticamente a partir de macro_stage_id
CREATE TRIGGER trg_stages_set_cycle_id
  BEFORE INSERT ON process_stages
  FOR EACH ROW EXECUTE FUNCTION fn_stages_set_cycle_id();
```

---

### 2.4 `process_gates` — Gates de Validação

| Campo | Tipo | Required | Constraint | Descrição |
|---|---|---|---|---|
| `id` | uuid | SIM | PK | |
| `stage_id` | uuid | SIM | FK→process_stages.id NOT NULL | Pré-condição de SAÍDA do estágio |
| `nome` | varchar(200) | SIM | NOT NULL | |
| `descricao` | text | NÃO | nullable | |
| `gate_type` | varchar(20) | SIM | CHECK IN ('APPROVAL','DOCUMENT','CHECKLIST','INFORMATIVE') | |
| `required` | boolean | SIM | default true | false = registra mas não bloqueia. INFORMATIVE nunca bloqueia (BR-007) |
| `ordem` | integer | SIM | NOT NULL | Avaliados em ordem crescente |
| `created_by` | uuid | SIM | FK→users.id | |
| `created_at` | timestamptz | SIM | NOT NULL, default now() | |
| `updated_at` | timestamptz | SIM | NOT NULL, default now() | |
| `deleted_at` | timestamptz | NÃO | nullable | |

**Constraints:**
- `CHECK(gate_type IN ('APPROVAL', 'DOCUMENT', 'CHECKLIST', 'INFORMATIVE'))`
- `UNIQUE(stage_id, ordem) WHERE deleted_at IS NULL`

**Indexes:**
- `idx_gates_stage_ordem` → `(stage_id, ordem)` — avaliação sequencial

---

### 2.5 `process_roles` — Papéis de Processo (catálogo global)

> Catálogo global reutilizável. Papel ≠ Role RBAC (BR-009).

| Campo | Tipo | Required | Constraint | Descrição |
|---|---|---|---|---|
| `id` | uuid | SIM | PK | |
| `tenant_id` | uuid | SIM | FK→tenants.id, NOT NULL | Isolamento multi-tenant |
| `codigo` | varchar(50) | SIM | NOT NULL | Imutável (BR-006). Ex: RESPONSAVEL, APROVADOR, APOIO |
| `nome` | varchar(100) | SIM | NOT NULL | |
| `descricao` | text | NÃO | nullable | |
| `can_approve` | boolean | SIM | default false | true = poder decisório em gates APPROVAL |
| `created_by` | uuid | SIM | FK→users.id | |
| `created_at` | timestamptz | SIM | NOT NULL, default now() | |
| `updated_at` | timestamptz | SIM | NOT NULL, default now() | |
| `deleted_at` | timestamptz | NÃO | nullable | |

**Constraints:**
- `UNIQUE(tenant_id, codigo) WHERE deleted_at IS NULL`

**Indexes:**
- `idx_process_roles_tenant` → `(tenant_id)` — listagem por tenant

---

### 2.6 `stage_role_links` — Vínculo Estágio × Papel

| Campo | Tipo | Required | Constraint | Descrição |
|---|---|---|---|---|
| `id` | uuid | SIM | PK | |
| `stage_id` | uuid | SIM | FK→process_stages.id NOT NULL | |
| `role_id` | uuid | SIM | FK→process_roles.id NOT NULL | |
| `required` | boolean | SIM | default false | Obrigatório preencher antes de avançar |
| `max_assignees` | integer | NÃO | nullable | null = sem limite |
| `created_by` | uuid | SIM | FK→users.id | |
| `created_at` | timestamptz | SIM | NOT NULL, default now() | |

**Constraints:**
- `UNIQUE(stage_id, role_id)` — sem duplicata de papel por estágio

**Indexes:**
- `idx_stage_roles_stage` → `(stage_id)` — listar papéis do estágio
- `idx_stage_roles_role` → `(role_id)` — reverse lookup

---

### 2.7 `stage_transitions` — Transições entre Estágios

| Campo | Tipo | Required | Constraint | Descrição |
|---|---|---|---|---|
| `id` | uuid | SIM | PK | |
| `from_stage_id` | uuid | SIM | FK→process_stages.id NOT NULL | |
| `to_stage_id` | uuid | SIM | FK→process_stages.id NOT NULL | |
| `nome` | varchar(100) | SIM | NOT NULL | Ex: "Aprovar", "Reprovar", "Solicitar Revisão" |
| `condicao` | text | NÃO | nullable | Expressão de condição — futura JSON rule engine |
| `gate_required` | boolean | SIM | default false | Gates do from_stage devem estar resolvidos |
| `evidence_required` | boolean | SIM | default false | Requer evidência (arquivo/nota) para transitar |
| `allowed_roles` | jsonb | NÃO | nullable | Array de process_role.id que podem iniciar esta transição |
| `created_by` | uuid | SIM | FK→users.id | |
| `created_at` | timestamptz | SIM | NOT NULL, default now() | |
| `updated_at` | timestamptz | SIM | NOT NULL, default now() | |

**Constraints:**
- `UNIQUE(from_stage_id, to_stage_id, nome)` — sem duplicata de transição nomeada
- `CHECK(from_stage_id != to_stage_id)` — sem auto-transição (BR-008)

**Indexes:**
- `idx_transitions_from` → `(from_stage_id)` — transições de saída
- `idx_transitions_to` → `(to_stage_id)` — transições de entrada

**Validação no service (BR-008):** `from_stage` e `to_stage` devem pertencer ao mesmo ciclo. Derivado via join: `stage → macro_stage → cycle`.

---

## 3. Seed Data Recomendado

### 3.1 Papéis de Processo (process_roles)

| codigo | nome | can_approve | Descrição |
|---|---|---|---|
| `RESPONSAVEL` | Responsável | false | Executor principal do estágio |
| `APROVADOR` | Aprovador | true | Poder decisório em gates APPROVAL |
| `APOIO` | Apoio | false | Colaborador secundário |
| `CONSULTA` | Consulta | false | Consultado mas não decide |
| `AUDITOR` | Auditor | false | Observador com acesso de leitura |

---

## 4. Migração: Ordem de Criação

```text
1. process_roles        (sem FK externa ao módulo)
2. process_cycles       (FK→users, FK→tenants)
3. process_macro_stages (FK→process_cycles)
4. process_stages       (FK→process_macro_stages)
5. process_gates        (FK→process_stages)
6. stage_role_links     (FK→process_stages, FK→process_roles)
7. stage_transitions    (FK→process_stages x2)
```

---

## 5. Queries Críticas

### 5.1 GET /flow — Grafo completo do ciclo (SLA < 200ms)

```sql
-- Estratégia: 1 query com JOINs + agrupamento em memória
SELECT c.*, ms.*, s.*, g.*, srl.*, pr.*, st.*
FROM process_cycles c
JOIN process_macro_stages ms ON ms.cycle_id = c.id AND ms.deleted_at IS NULL
JOIN process_stages s ON s.macro_stage_id = ms.id AND s.deleted_at IS NULL
LEFT JOIN process_gates g ON g.stage_id = s.id AND g.deleted_at IS NULL
LEFT JOIN stage_role_links srl ON srl.stage_id = s.id
LEFT JOIN process_roles pr ON pr.id = srl.role_id AND pr.deleted_at IS NULL
LEFT JOIN stage_transitions st ON st.from_stage_id = s.id
WHERE c.id = :cycle_id AND c.deleted_at IS NULL
ORDER BY ms.ordem, s.ordem, g.ordem;
```

**Nota:** Avaliar uso de `WITH` (CTE) ou queries separadas + agrupamento no service se a query monolítica ultrapassar 200ms com grafos grandes (>50 nós, OKR-4).

### 5.2 Validação de is_initial único

```sql
-- Trigger BEFORE INSERT/UPDATE
SELECT COUNT(*) FROM process_stages s
JOIN process_macro_stages ms ON ms.id = s.macro_stage_id
WHERE ms.cycle_id = :cycle_id
  AND s.is_initial = true
  AND s.deleted_at IS NULL
  AND s.id != :current_stage_id;
```

### 5.3 Validação de instâncias ativas (integração MOD-006)

```sql
-- Port: InstanceCheckerPort.countActiveByStageId(stageId)
-- Implementação delegada ao MOD-006
SELECT COUNT(*) FROM process_instances
WHERE current_stage_id = :stage_id
  AND status IN ('ACTIVE', 'PENDING');
```

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-17
- **rastreia_para:** US-MOD-005, US-MOD-005-F01, US-MOD-005-F02, DOC-ARC-001, DOC-ARC-002, BR-005, SEC-EventMatrix
- **referencias_exemplos:** N/A
- **evidencias:** N/A
