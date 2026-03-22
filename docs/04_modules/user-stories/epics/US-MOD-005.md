# US-MOD-005 — Modelagem de Processos (Épico)

**Status Ágil:** `READY`
**Versão:** 1.2.0
**Data:** 2026-03-16
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-005** (Modelagem de Processos)
**Épico de Negócio:** EP03

## Metadados de Governança

- **status_agil:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** EP03 (doc 02_Arquitetura_de_Processo_e_Execucao), DOC-DEV-001, DOC-ARC-001, DOC-ARC-002, DOC-ARC-003, US-MOD-003, US-MOD-004, US-MOD-000-F06, LGPD-BASE-001
- **nivel_arquitetura:** 2 (versionamento de blueprints, grafo de transições, integridade referencial com instâncias)
- **evidencias:** N/A

---

## 1. Contexto e Problema

> **"Etapa não é responsável."** — doc 02_Arquitetura_de_Processo_e_Execucao

O sistema precisa de uma camada de **modelagem de processos** que defina como fluxos operacionais existem conceitualmente (blueprint), separada da camada de execução que instancia esses fluxos. Sem essa separação, mudanças estruturais em processos impactam instâncias ativas, criando riscos de integridade e rastreabilidade.

O MOD-005 define o **blueprint** do processo — como o fluxo existe conceitualmente. O MOD-006 gerencia as **instâncias concretas** que seguem esse blueprint.

| Camada | Módulo | O que contém |
|---|---|---|
| **Blueprint** (modelo) | **MOD-005** | Ciclo, Macroetapa, Estágio, Gate, Papel, Transição |
| **Execução** (instância) | MOD-006 | Instância do Ciclo, Histórico de Estágio, Responsável, Eventos |

**MOD-005 é o molde. MOD-006 é o produto moldado.**

---

## 2. Hierarquia de Entidades

```
Ciclo                     ← processo-mãe (ex: "Ciclo Comercial v2")
  └── Macroetapa          ← bloco amplo (ex: "Preparação", "Validação", "Aprovação")
        └── Estágio       ← ponto operacional (ex: "Rascunho", "Em Análise", "Aguardando Aprovação")
              ├── Gate    ← validação formal para avançar (ex: "Aprovação Gerencial Obrigatória")
              └── Papel   ← participação funcional (Responsável, Aprovador, Apoio, Consulta, Auditor)

Transição de Estágio      ← de onde → para onde + condição + evidência exigida
```

---

## 3. Decisão Arquitetural: Versionamento de Ciclos

Um ciclo publicado **não pode ser editado** — qualquer mudança cria uma nova versão. Isso garante que instâncias ativas (MOD-006) não sejam impactadas por mudanças estruturais retroativas.

```
Ciclo "Comercial" v1  →  PUBLISHED (imutável)
                               ↓ fork
Ciclo "Comercial" v2  →  DRAFT → PUBLISHED
```

Instâncias ativas no MOD-006 sempre referenciam `cycle_version_id` (não `cycle_id`) para preservar leitura histórica mesmo após novas versões.

---

## 4. "Papel" no Processo ≠ Role RBAC

| Conceito | Onde vive | O que é |
|---|---|---|
| **Role** (RBAC) | MOD-000-F06 | Conjunto de escopos funcionais (`finance:invoice:read`) |
| **Papel** (Processo) | MOD-005 | Tipo de participação funcional num estágio (`Responsável`, `Aprovador`, `Apoio`) |

O vínculo entre um Papel e um usuário/role real é feito na **atribuição de responsáveis** — que pertence ao MOD-006, não ao MOD-005.

---

## 5. Escopo

### Inclui

- API CRUD de Ciclos com versionamento (DRAFT → PUBLISHED → DEPRECATED)
- API CRUD de Macroetapas vinculadas a ciclos
- API CRUD de Estágios vinculados a macroetapas
- API CRUD de Gates vinculados a estágios (pré-condição de saída)
- API CRUD de Papéis de processo (catálogo global reutilizável)
- API CRUD de vínculos Estágio × Papel (quais participações cada estágio espera)
- API CRUD de Transições de Estágio (grafo de navegação com condições e evidências)
- Editor visual de fluxo (UX-PROC-001) — nós e arestas drag-configurable, mini-mapa obrigatório a partir de 15 nós
- Configurador de estágio detalhado (UX-PROC-002) — gates, papéis, transições

### Não inclui

- Abertura de instâncias concretas de ciclo — MOD-006
- Execução de gates e atribuição de responsáveis — MOD-006
- Parametrização contextual de comportamentos por estágio — MOD-007

---

## 6. Critérios de Aceite (Épico)

```gherkin
Funcionalidade: Épico Modelagem de Processos MOD-005

  Cenário: Ciclo publicado é imutável
    Dado que um ciclo está com status=PUBLISHED
    Quando PATCH /admin/cycles/:id é chamado com qualquer campo
    Então deve retornar 422: "Ciclos publicados são imutáveis. Crie uma nova versão."

  Cenário: Transição só aceita estágios do mesmo ciclo
    Dado que from_stage pertence ao Ciclo A e to_stage pertence ao Ciclo B
    Quando POST /admin/stage-transitions é chamado
    Então deve retornar 422: "Os estágios de origem e destino devem pertencer ao mesmo ciclo."

  Cenário: Gate sem aprovador definido não bloqueia se tipo=informativo
    Dado que um gate tem type=INFORMATIVE e required=false
    Quando a transição é avaliada
    Então o gate não bloqueia o avanço (apenas registra)

  Cenário: Estágio não pode ser deletado se há instâncias ativas
    Dado que um estágio tem instâncias ativas no MOD-006
    Quando DELETE /admin/stages/:id
    Então deve retornar 422 com contagem de instâncias ativas

  Cenário: Sub-histórias bloqueadas sem aprovação
    Dado que US-MOD-005 está com Status diferente de "APPROVED"
    Quando agente COD tentar forge-module para qualquer feature
    Então a automação DEVE ser bloqueada
```

---

## 7. Definition of Ready (DoR) ✅

- [x] Separação Blueprint (MOD-005) vs. Execução (MOD-006) documentada
- [x] Versionamento de ciclos (DRAFT → PUBLISHED → DEPRECATED) definido
- [x] Distinção Papel (processo) vs. Role (RBAC) documentada
- [x] Modelo de dados completo (7 tabelas) definido
- [x] Features F01–F04 com Gherkin completo
- [x] Screen Manifests UX-PROC-001, UX-PROC-002 criados
- [x] Novos escopos mapeados para MOD-000-F12
- [ ] Owner confirmar READY → APPROVED

## 8. Definition of Done (DoD)

- [ ] F01–F04 individualmente aprovadas e scaffoldadas
- [ ] Ciclo PUBLISHED rejeita edição — validado por teste
- [ ] Ciclo PUBLISHED deprecável; DRAFT não deprecável — validado por teste
- [ ] Transição cross-ciclo rejeitada — validado por teste
- [ ] Deleção de estágio com instâncias ativas bloqueada
- [ ] Editor visual renderiza grafo com estágios + transições
- [ ] Escopos `process:*` adicionados ao catálogo via MOD-000-F12

---

## 9. Sub-Histórias

```text
US-MOD-005
  ├── F01 ← API: Ciclos + Macroetapas + Estágios (CRUD + versionamento)
  ├── F02 ← API: Gates + Papéis + Transições (grafo de navegação)
  ├── F03 ← UX: Editor Visual de Fluxo (UX-PROC-001)
  └── F04 ← UX: Configurador de Estágio (UX-PROC-002)
```

| Feature | Tema | Tipo | Status |
|---|---|---|---|
| [US-MOD-005-F01](../features/US-MOD-005-F01.md) | API Ciclos + Macroetapas + Estágios | Backend | `READY` |
| [US-MOD-005-F02](../features/US-MOD-005-F02.md) | API Gates + Papéis + Transições | Backend | `READY` |
| [US-MOD-005-F03](../features/US-MOD-005-F03.md) | UX Editor Visual de Fluxo | UX | `READY` |
| [US-MOD-005-F04](../features/US-MOD-005-F04.md) | UX Configurador de Estágio | UX | `READY` |

---

## 10. Modelo de Dados Completo

### `process_cycles` — Ciclos

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `codigo` | varchar(50) | UNIQUE NOT NULL | Imutável após criação |
| `nome` | varchar(200) | NOT NULL | |
| `descricao` | text | nullable | |
| `version` | integer | NOT NULL, default 1 | Incrementa a cada fork |
| `status` | varchar | DRAFT\|PUBLISHED\|DEPRECATED | |
| `parent_cycle_id` | uuid | FK→process_cycles.id, nullable | Ciclo origem do fork |
| `published_at` | timestamp | nullable | Preenchido ao publicar |
| `created_by` | uuid | FK→users.id | |
| `created_at`, `updated_at` | timestamp | | |
| `deleted_at` | timestamp | nullable | Soft delete (somente DRAFT/DEPRECATED) |

### `process_macro_stages` — Macroetapas

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `cycle_id` | uuid | FK→process_cycles.id NOT NULL | |
| `codigo` | varchar(50) | NOT NULL | Único dentro do ciclo |
| `nome` | varchar(200) | NOT NULL | |
| `ordem` | integer | NOT NULL | Ordem dentro do ciclo |
| `created_by` | uuid | FK→users.id | |
| `deleted_at` | timestamp | nullable | |

### `process_stages` — Estágios

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `macro_stage_id` | uuid | FK→process_macro_stages.id NOT NULL | |
| `codigo` | varchar(50) | NOT NULL | Único dentro da macroetapa |
| `nome` | varchar(200) | NOT NULL | |
| `descricao` | text | nullable | |
| `ordem` | integer | NOT NULL | |
| `is_initial` | boolean | default false | Apenas 1 por ciclo (CHECK via trigger) |
| `is_terminal` | boolean | default false | Estágio final (sem transições de saída obrigatórias) |
| `canvas_x` | integer | nullable | Posição X do nó no editor visual (UX-PROC-001) |
| `canvas_y` | integer | nullable | Posição Y do nó no editor visual (UX-PROC-001) |
| `created_by` | uuid | FK→users.id | |
| `deleted_at` | timestamp | nullable | Bloqueado se instâncias ativas |

### `process_gates` — Gates

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `stage_id` | uuid | FK→process_stages.id NOT NULL | Estágio ao qual o gate é pré-condição de SAÍDA |
| `nome` | varchar(200) | NOT NULL | |
| `descricao` | text | nullable | |
| `gate_type` | varchar | APPROVAL\|DOCUMENT\|CHECKLIST\|INFORMATIVE | |
| `required` | boolean | default true | false = registra mas não bloqueia |
| `ordem` | integer | NOT NULL | Gates são avaliados em ordem |
| `created_by` | uuid | FK→users.id | |
| `deleted_at` | timestamp | nullable | |

### `process_roles` — Papéis (catálogo global)

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `codigo` | varchar(50) | UNIQUE NOT NULL | ex: RESPONSAVEL, APROVADOR, APOIO, CONSULTA, AUDITOR |
| `nome` | varchar(100) | NOT NULL | |
| `descricao` | text | nullable | |
| `can_approve` | boolean | default false | Se true: papel com poder decisório |
| `created_by` | uuid | FK→users.id | |
| `deleted_at` | timestamp | nullable | |

### `stage_role_links` — Estágio × Papel

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `stage_id` | uuid | FK→process_stages.id NOT NULL | |
| `role_id` | uuid | FK→process_roles.id NOT NULL | |
| `required` | boolean | default false | Se obrigatório preencher antes de avançar |
| `max_assignees` | integer | nullable | null = sem limite |
| `created_by` | uuid | FK→users.id | |
| UNIQUE | | `(stage_id, role_id)` | |

### `stage_transitions` — Transições

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `from_stage_id` | uuid | FK→process_stages.id NOT NULL | |
| `to_stage_id` | uuid | FK→process_stages.id NOT NULL | |
| `nome` | varchar(100) | NOT NULL | ex: "Aprovar", "Reprovar", "Solicitar Revisão" |
| `condicao` | text | nullable | Expressão de condição (futura — JSON rule engine) |
| `gate_required` | boolean | default false | Se gate do from_stage deve estar resolvido |
| `evidence_required` | boolean | default false | Requer evidência (arquivo/nota) para transitar |
| `allowed_roles` | jsonb | nullable | Array de process_role.id que podem iniciar esta transição |
| `created_by` | uuid | FK→users.id | |
| UNIQUE | | `(from_stage_id, to_stage_id, nome)` | |
| CHECK | | `from_stage_id != to_stage_id` | Sem auto-transição |

---

## 11. Endpoints do Módulo

| Método | Path | operationId | Scope |
|---|---|---|---|
| GET | /api/v1/admin/cycles | `admin_cycles_list` | `process:cycle:read` |
| POST | /api/v1/admin/cycles | `admin_cycles_create` | `process:cycle:write` |
| GET | /api/v1/admin/cycles/:id | `admin_cycles_get` | `process:cycle:read` |
| PATCH | /api/v1/admin/cycles/:id | `admin_cycles_update` | `process:cycle:write` |
| POST | /api/v1/admin/cycles/:id/publish | `admin_cycles_publish` | `process:cycle:publish` |
| POST | /api/v1/admin/cycles/:id/fork | `admin_cycles_fork` | `process:cycle:write` |
| DELETE | /api/v1/admin/cycles/:id | `admin_cycles_delete` | `process:cycle:delete` |
| GET | /api/v1/admin/cycles/:id/flow | `admin_cycles_flow` | `process:cycle:read` |
| — | — | — | — |
| POST | /api/v1/admin/cycles/:cid/macro-stages | `admin_macro_stages_create` | `process:cycle:write` |
| PATCH | /api/v1/admin/macro-stages/:id | `admin_macro_stages_update` | `process:cycle:write` |
| DELETE | /api/v1/admin/macro-stages/:id | `admin_macro_stages_delete` | `process:cycle:delete` |
| — | — | — | — |
| POST | /api/v1/admin/macro-stages/:mid/stages | `admin_stages_create` | `process:cycle:write` |
| GET | /api/v1/admin/stages/:id | `admin_stages_get` | `process:cycle:read` |
| PATCH | /api/v1/admin/stages/:id | `admin_stages_update` | `process:cycle:write` |
| DELETE | /api/v1/admin/stages/:id | `admin_stages_delete` | `process:cycle:delete` |
| — | — | — | — |
| POST | /api/v1/admin/stages/:sid/gates | `admin_gates_create` | `process:cycle:write` |
| PATCH | /api/v1/admin/gates/:id | `admin_gates_update` | `process:cycle:write` |
| DELETE | /api/v1/admin/gates/:id | `admin_gates_delete` | `process:cycle:delete` |
| POST | /api/v1/admin/stages/:sid/roles | `admin_stage_roles_create` | `process:cycle:write` |
| DELETE | /api/v1/admin/stages/:sid/roles/:rid | `admin_stage_roles_delete` | `process:cycle:delete` |
| POST | /api/v1/admin/stage-transitions | `admin_transitions_create` | `process:cycle:write` |
| DELETE | /api/v1/admin/stage-transitions/:id | `admin_transitions_delete` | `process:cycle:delete` |
| — | — | — | — |
| GET | /api/v1/admin/process-roles | `admin_process_roles_list` | `process:cycle:read` |
| POST | /api/v1/admin/process-roles | `admin_process_roles_create` | `process:cycle:write` |
| PATCH | /api/v1/admin/process-roles/:id | `admin_process_roles_update` | `process:cycle:write` |

---

## 12. Novos Escopos — Amendment MOD-000-F12

| Escopo | Descrição |
|---|---|
| `process:cycle:read` | Visualizar ciclos, estágios, gates, papéis e transições |
| `process:cycle:write` | Criar e editar elementos do blueprint |
| `process:cycle:publish` | Publicar ciclo (promove DRAFT → PUBLISHED) |
| `process:cycle:delete` | Soft-delete de elementos do blueprint |

---

## 13. OKRs

| # | Métrica | Alvo |
|---|---|---|
| OKR-1 | Ciclo PUBLISHED rejeita edição direta | 100% |
| OKR-2 | Transição cross-ciclo rejeitada | 100% |
| OKR-3 | Deleção com instâncias ativas bloqueada | 100% |
| OKR-4 | Editor visual renderiza grafo completo N estágios; mini-mapa ativo a partir de 15 nós | Sem falha visual até 50 nós |

---

## 14. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação do zero. Modelo de 7 tabelas, versionamento, grafo de transições, 4 features. |
| 1.1.0 | 2026-03-16 | Marcos Sulivan | Decisões técnicas 2026-03-15: mini-mapa obrigatório a partir de 15 nós documentado no épico, owner atualizado. |
| 1.2.0 | 2026-03-16 | Marcos Sulivan | Revisão: corrige contagem de tabelas (8→7), adiciona canvas_x/canvas_y ao modelo de process_stages, alinha owner das features. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
