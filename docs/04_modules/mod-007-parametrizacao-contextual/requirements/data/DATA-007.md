> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-19 | arquitetura | Baseline Inicial (forge-module) |
> | 1.1.0  | 2026-04-01 | merge-amendment | Merge DATA-007-M01: campo incidence_type (OBR/OPC/AUTO) em incidence_rules (E-005) + CHECK + index |
> | 0.3.0  | 2026-03-20 | AGN-DEV-04  | Re-enriquecimento DATA Batch 2 — BR-013 ref, dry_run flag, tenant_config hint, data_ultima_revisao atualizada |
> | 0.2.0  | 2026-03-19 | AGN-DEV-04  | Enriquecimento DATA (enrich-agent) — entidades detalhadas, constraints, indexes, migration notes, FK map |

# DATA-007 — Modelo de Dados da Parametrização Contextual e Rotinas

- **estado_item:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-04-01
- **rastreia_para:** US-MOD-007, US-MOD-007-F01, US-MOD-007-F02, US-MOD-007-F03, BR-007, BR-013, FR-007, SEC-007, DATA-003, DATA-007-M01, UX-007-M01
- **referencias_exemplos:** EX-DEV-001 (Envelope DATA)
- **evidencias:** N/A

---

## Visao Geral

O modulo MOD-007 possui **9 tabelas** organizadas em 3 dominios:

1. **Enquadramento:** `context_framer_types`, `context_framers`, `target_objects`, `target_fields`
2. **Incidencia:** `incidence_rules`
3. **Comportamento:** `behavior_routines`, `routine_items`, `routine_incidence_links`, `routine_version_history`

Todas as tabelas com dados de tenant possuem `tenant_id` NOT NULL para isolamento obrigatorio (DOC-FND-000 §2). FKs para `users` referenciam a tabela Foundation sem duplicar a entidade.

---

## Entidades

### E-001 — `context_framer_types`

Catalogo de tipos de enquadrador. Tipos pre-definidos: OPERACAO, CLASSE_PRODUTO, TIPO_DOCUMENTO, CONTEXTO_PROCESSO.

| Campo | Tipo | Constraint | Obrigatorio | Descricao |
|---|---|---|---|---|
| `id` | uuid | PK | SIM | Identificador unico |
| `codigo` | varchar(50) | UNIQUE NOT NULL | SIM | Codigo imutavel, auto-uppercase. Ex: OPERACAO, CLASSE_PRODUTO |
| `nome` | varchar(200) | NOT NULL | SIM | Nome legivel do tipo |
| `descricao` | text | — | NAO | Descricao opcional |
| `tenant_id` | uuid | NOT NULL | SIM | Isolamento multi-tenant (DOC-FND-000) |
| `created_by` | uuid | FK users(id) | SIM | Usuario que criou |
| `created_at` | timestamptz | NOT NULL DEFAULT now() | SIM | Data de criacao |
| `updated_at` | timestamptz | NOT NULL DEFAULT now() | SIM | Data de atualizacao |

**Constraints:**

- PK: `id`
- UNIQUE: `(tenant_id, codigo)` — codigo unico por tenant
- FK: `created_by` -> `users(id)` (MOD-000)

**Indexes:**

- `idx_framer_types_tenant_codigo` UNIQUE (tenant_id, codigo)

**Notas de Migracao:**

- Seed inicial com 4 tipos: OPERACAO, CLASSE_PRODUTO, TIPO_DOCUMENTO, CONTEXTO_PROCESSO
- `codigo` deve ser convertido para uppercase via trigger ou application layer

---

### E-002 — `context_framers`

Enquadradores de contexto com vigencia e versionamento. Representam contextos de negocio que determinam comportamento parametrizado.

| Campo | Tipo | Constraint | Obrigatorio | Descricao |
|---|---|---|---|---|
| `id` | uuid | PK | SIM | Identificador unico |
| `codigo` | varchar(50) | NOT NULL | SIM | Codigo imutavel apos criacao (BR-001), auto-uppercase |
| `nome` | varchar(200) | NOT NULL | SIM | Nome legivel |
| `framer_type_id` | uuid | FK context_framer_types(id) NOT NULL | SIM | Tipo do enquadrador |
| `status` | varchar(20) | NOT NULL DEFAULT 'ACTIVE' | SIM | ACTIVE ou INACTIVE |
| `version` | integer | NOT NULL DEFAULT 1 | SIM | Versao do enquadrador |
| `valid_from` | timestamptz | NOT NULL | SIM | Inicio da vigencia (BR-002) |
| `valid_until` | timestamptz | — | NAO | Fim da vigencia (null = sem expiracao) |
| `tenant_id` | uuid | NOT NULL | SIM | Isolamento multi-tenant |
| `created_by` | uuid | FK users(id) | SIM | Usuario que criou |
| `created_at` | timestamptz | NOT NULL DEFAULT now() | SIM | Data de criacao |
| `updated_at` | timestamptz | NOT NULL DEFAULT now() | SIM | Data de atualizacao |
| `deleted_at` | timestamptz | — | NAO | Soft-delete timestamp |

**Constraints:**

- PK: `id`
- UNIQUE: `(tenant_id, codigo)` — codigo unico por tenant
- FK: `framer_type_id` -> `context_framer_types(id)`
- FK: `created_by` -> `users(id)` (MOD-000)
- CHECK: `status IN ('ACTIVE', 'INACTIVE')`
- CHECK: `valid_until IS NULL OR valid_until > valid_from`

**Indexes:**

- `idx_framers_tenant_codigo` UNIQUE (tenant_id, codigo)
- `idx_framers_type_status` (framer_type_id, status) WHERE deleted_at IS NULL
- `idx_framers_vigencia` (valid_from, valid_until) WHERE status = 'ACTIVE' AND deleted_at IS NULL
- `idx_framers_tenant_status` (tenant_id, status) WHERE deleted_at IS NULL

**Notas de Migracao:**

- `codigo` imutabilidade enforced via application layer (BR-001)
- Background job `framer-expiration.job.ts` executa periodicamente para expirar enquadradores com `valid_until < now()` (BR-002)

---

### E-003 — `target_objects`

Objetos de negocio parametrizaveis. Representam entidades de outros modulos cujo comportamento pode ser alterado por rotinas.

| Campo | Tipo | Constraint | Obrigatorio | Descricao |
|---|---|---|---|---|
| `id` | uuid | PK | SIM | Identificador unico |
| `codigo` | varchar(50) | UNIQUE NOT NULL | SIM | Codigo imutavel. Ex: PEDIDO_VENDA, CADASTRO_PRODUTO, CASO_PROCESSO |
| `nome` | varchar(200) | NOT NULL | SIM | Nome legivel |
| `modulo_ecf` | varchar(20) | — | NAO | Modulo ECF de origem (ex: MOD-006, MOD-008) |
| `descricao` | text | — | NAO | Descricao opcional |
| `tenant_id` | uuid | NOT NULL | SIM | Isolamento multi-tenant |
| `created_at` | timestamptz | NOT NULL DEFAULT now() | SIM | Data de criacao |
| `updated_at` | timestamptz | NOT NULL DEFAULT now() | SIM | Data de atualizacao |

**Constraints:**

- PK: `id`
- UNIQUE: `(tenant_id, codigo)` — codigo unico por tenant

**Indexes:**

- `idx_target_objects_tenant_codigo` UNIQUE (tenant_id, codigo)

**Notas de Migracao:**

- `codigo` imutabilidade enforced via application layer (BR-001)

---

### E-004 — `target_fields`

Campos individuais de objetos-alvo que podem ter comportamento alterado por itens de rotina.

| Campo | Tipo | Constraint | Obrigatorio | Descricao |
|---|---|---|---|---|
| `id` | uuid | PK | SIM | Identificador unico |
| `target_object_id` | uuid | FK target_objects(id) NOT NULL | SIM | Objeto-alvo pai |
| `field_key` | varchar(100) | NOT NULL | SIM | Chave tecnica do campo (ex: "projeto_wbs") |
| `field_label` | varchar(200) | — | NAO | Nome legivel |
| `field_type` | varchar(20) | NOT NULL | SIM | TEXT, NUMBER, DATE, SELECT, BOOLEAN, FILE |
| `is_system` | boolean | NOT NULL DEFAULT false | SIM | true = campo do sistema (nao editavel pelo admin — FR-003) |
| `tenant_id` | uuid | NOT NULL | SIM | Isolamento multi-tenant |
| `created_at` | timestamptz | NOT NULL DEFAULT now() | SIM | Data de criacao |
| `updated_at` | timestamptz | NOT NULL DEFAULT now() | SIM | Data de atualizacao |

**Constraints:**

- PK: `id`
- UNIQUE: `(target_object_id, field_key)` — campo unico por objeto
- FK: `target_object_id` -> `target_objects(id)` ON DELETE CASCADE
- CHECK: `field_type IN ('TEXT', 'NUMBER', 'DATE', 'SELECT', 'BOOLEAN', 'FILE')`

**Indexes:**

- `idx_fields_object_key` UNIQUE (target_object_id, field_key)
- `idx_fields_tenant` (tenant_id)

---

### E-005 — `incidence_rules`

Regras de incidencia que vinculam enquadradores a objetos-alvo. UNIQUE constraint impede conflito config-time (BR-003).

| Campo | Tipo | Constraint | Obrigatorio | Descricao |
|---|---|---|---|---|
| `id` | uuid | PK | SIM | Identificador unico |
| `framer_id` | uuid | FK context_framers(id) NOT NULL | SIM | Enquadrador vinculado |
| `target_object_id` | uuid | FK target_objects(id) NOT NULL | SIM | Objeto-alvo vinculado |
| `condition_expr` | text | — | NAO | Expressao futura (JSON rule engine v2 — PENDENTE-001) |
| `valid_from` | timestamptz | NOT NULL | SIM | Inicio da vigencia |
| `valid_until` | timestamptz | — | NAO | Fim da vigencia |
| `incidence_type` | varchar(10) | NOT NULL DEFAULT 'OBR' | SIM | Tipo de incidencia: OBR (obrigatorio), OPC (opcional), AUTO (auto-apply). Ref: UX-007-M01 |
| `status` | varchar(20) | NOT NULL DEFAULT 'ACTIVE' | SIM | ACTIVE ou INACTIVE |
| `tenant_id` | uuid | NOT NULL | SIM | Isolamento multi-tenant |
| `created_by` | uuid | FK users(id) | SIM | Usuario que criou |
| `created_at` | timestamptz | NOT NULL DEFAULT now() | SIM | Data de criacao |
| `updated_at` | timestamptz | NOT NULL DEFAULT now() | SIM | Data de atualizacao |

**Constraints:**

- PK: `id`
- UNIQUE: `(tenant_id, framer_id, target_object_id)` — conflito bloqueado no cadastro (BR-003). Retorna 422 em violacao.
- FK: `framer_id` -> `context_framers(id)`
- FK: `target_object_id` -> `target_objects(id)`
- FK: `created_by` -> `users(id)` (MOD-000)
- CHECK: `status IN ('ACTIVE', 'INACTIVE')`
- CHECK: `incidence_type IN ('OBR', 'OPC', 'AUTO')`
- CHECK: `valid_until IS NULL OR valid_until > valid_from`

**Nota:** Campo `priority` foi **removido** (BR-011). Resolucao de conflitos e feita exclusivamente por restritividade no runtime (BR-004).

**Indexes:**

- `idx_incidence_tenant_framer_object` UNIQUE (tenant_id, framer_id, target_object_id)
- `idx_incidence_status_vigencia` (status, valid_from, valid_until) WHERE status = 'ACTIVE'
- `idx_incidence_framer` (framer_id) — join no motor
- `idx_incidence_type` (incidence_type) — filtro por tipo na matriz UI
- `idx_incidence_tenant` (tenant_id)

---

### E-006 — `behavior_routines`

Rotinas de comportamento com ciclo de vida DRAFT -> PUBLISHED -> DEPRECATED. Aggregate root do dominio de comportamento.

| Campo | Tipo | Constraint | Obrigatorio | Descricao |
|---|---|---|---|---|
| `id` | uuid | PK | SIM | Identificador unico |
| `codigo` | varchar(50) | NOT NULL | SIM | Codigo imutavel apos criacao (BR-001) |
| `nome` | varchar(200) | NOT NULL | SIM | Nome legivel |
| `routine_type` | varchar(20) | NOT NULL | SIM | BEHAVIOR (MOD-007) ou INTEGRATION (MOD-008) |
| `version` | integer | NOT NULL DEFAULT 1 | SIM | Versao da rotina |
| `status` | varchar(20) | NOT NULL DEFAULT 'DRAFT' | SIM | DRAFT, PUBLISHED ou DEPRECATED |
| `parent_routine_id` | uuid | FK behavior_routines(id) | NAO | Origem do fork (null se rotina original) |
| `published_at` | timestamptz | — | NAO | Data da publicacao |
| `approved_by` | uuid | FK users(id) | NAO | Usuario que publicou |
| `tenant_id` | uuid | NOT NULL | SIM | Isolamento multi-tenant |
| `created_by` | uuid | FK users(id) | SIM | Usuario que criou |
| `created_at` | timestamptz | NOT NULL DEFAULT now() | SIM | Data de criacao |
| `updated_at` | timestamptz | NOT NULL DEFAULT now() | SIM | Data de atualizacao |
| `deleted_at` | timestamptz | — | NAO | Soft-delete (so em DRAFT) |

**Constraints:**

- PK: `id`
- UNIQUE: `(tenant_id, codigo)` — codigo unico por tenant
- FK: `parent_routine_id` -> `behavior_routines(id)` — self-ref para fork
- FK: `approved_by` -> `users(id)` (MOD-000)
- FK: `created_by` -> `users(id)` (MOD-000)
- CHECK: `status IN ('DRAFT', 'PUBLISHED', 'DEPRECATED')`
- CHECK: `routine_type IN ('BEHAVIOR', 'INTEGRATION')`

**Invariantes do Aggregate Root (application layer):**

- PUBLISHED e imutavel — rejeita PATCH com 422 (BR-005)
- Publicacao exige >= 1 item (BR-006)
- Fork so de PUBLISHED (BR-008)
- Soft-delete so em DRAFT
- DEPRECATED nao aceita novos vinculos (BR-012)

**Indexes:**

- `idx_routines_tenant_codigo` UNIQUE (tenant_id, codigo)
- `idx_routines_status` (status) WHERE deleted_at IS NULL
- `idx_routines_type_status` (routine_type, status) WHERE deleted_at IS NULL
- `idx_routines_tenant_status` (tenant_id, status) WHERE deleted_at IS NULL
- `idx_routines_parent` (parent_routine_id) WHERE parent_routine_id IS NOT NULL

---

### E-007 — `routine_items`

Itens parametrizaveis dentro de uma rotina. 7 tipos de item com 8 acoes possiveis.

| Campo | Tipo | Constraint | Obrigatorio | Descricao |
|---|---|---|---|---|
| `id` | uuid | PK | SIM | Identificador unico |
| `routine_id` | uuid | FK behavior_routines(id) NOT NULL | SIM | Rotina pai |
| `item_type` | varchar(30) | NOT NULL | SIM | FIELD_VISIBILITY, REQUIRED, DEFAULT, DOMAIN, DERIVATION, VALIDATION, EVIDENCE |
| `target_field_id` | uuid | FK target_fields(id) | NAO | Campo-alvo (nullable para itens cross-field) |
| `action` | varchar(30) | NOT NULL | SIM | SHOW, HIDE, SET_REQUIRED, SET_OPTIONAL, SET_DEFAULT, RESTRICT_DOMAIN, VALIDATE, REQUIRE_EVIDENCE |
| `value` | jsonb | — | NAO | Valor parametrizado (ex: default value, domain list, validation rule) |
| `condition_expr` | text | — | NAO | Condicao de aplicacao (v2 — PENDENTE-001) |
| `validation_message` | varchar(500) | — | NAO | Mensagem exibida para itens tipo VALIDATION |
| `is_blocking` | boolean | NOT NULL DEFAULT false | SIM | true = bloqueia transicao no MOD-006 (FR-009) |
| `ordem` | integer | NOT NULL | SIM | Ordem de avaliacao no motor (sequencial) |
| `created_at` | timestamptz | NOT NULL DEFAULT now() | SIM | Data de criacao |
| `updated_at` | timestamptz | NOT NULL DEFAULT now() | SIM | Data de atualizacao |

**Constraints:**

- PK: `id`
- FK: `routine_id` -> `behavior_routines(id)` ON DELETE CASCADE
- FK: `target_field_id` -> `target_fields(id)`
- CHECK: `item_type IN ('FIELD_VISIBILITY', 'REQUIRED', 'DEFAULT', 'DOMAIN', 'DERIVATION', 'VALIDATION', 'EVIDENCE')`
- CHECK: `action IN ('SHOW', 'HIDE', 'SET_REQUIRED', 'SET_OPTIONAL', 'SET_DEFAULT', 'RESTRICT_DOMAIN', 'VALIDATE', 'REQUIRE_EVIDENCE')`

**Indexes:**

- `idx_items_routine_ordem` (routine_id, ordem) — avaliacao sequencial no motor
- `idx_items_target_field` (target_field_id) WHERE target_field_id IS NOT NULL

**Notas:**

- Edicao/remocao de itens so permitida quando rotina pai em DRAFT (BR-005)
- `ordem` define sequencia de execucao no passo 3 do motor (FR-009)

---

### E-008 — `routine_incidence_links`

Tabela de associacao N:N entre rotinas PUBLISHED e regras de incidencia. So permite vinculos com rotinas PUBLISHED (BR-007).

| Campo | Tipo | Constraint | Obrigatorio | Descricao |
|---|---|---|---|---|
| `id` | uuid | PK | SIM | Identificador unico |
| `routine_id` | uuid | FK behavior_routines(id) NOT NULL | SIM | Rotina PUBLISHED vinculada |
| `incidence_rule_id` | uuid | FK incidence_rules(id) NOT NULL | SIM | Regra de incidencia vinculada |
| `created_at` | timestamptz | NOT NULL DEFAULT now() | SIM | Data de criacao |

**Constraints:**

- PK: `id`
- UNIQUE: `(routine_id, incidence_rule_id)` — impede duplicata
- FK: `routine_id` -> `behavior_routines(id)` ON DELETE CASCADE
- FK: `incidence_rule_id` -> `incidence_rules(id)`

**Invariantes (application layer):**

- So permite vincular rotinas com status=PUBLISHED (BR-007)
- Nao permite vincular rotinas DEPRECATED (BR-012)

**Indexes:**

- `idx_links_routine_incidence` UNIQUE (routine_id, incidence_rule_id)
- `idx_links_incidence` (incidence_rule_id) — join no motor de avaliacao

---

### E-009 — `routine_version_history`

Historico de versionamento de rotinas. Registra cada fork com justificativa obrigatoria.

| Campo | Tipo | Constraint | Obrigatorio | Descricao |
|---|---|---|---|---|
| `id` | uuid | PK | SIM | Identificador unico |
| `routine_id` | uuid | FK behavior_routines(id) NOT NULL | SIM | Nova versao (rotina criada pelo fork) |
| `previous_version_id` | uuid | FK behavior_routines(id) NOT NULL | SIM | Versao anterior (rotina original) |
| `changed_by` | uuid | FK users(id) NOT NULL | SIM | Usuario que executou o fork |
| `change_reason` | text | NOT NULL | SIM | Justificativa (minimo 10 chars — BR-008) |
| `changed_at` | timestamptz | NOT NULL DEFAULT now() | SIM | Data do fork |

**Constraints:**

- PK: `id`
- FK: `routine_id` -> `behavior_routines(id)`
- FK: `previous_version_id` -> `behavior_routines(id)`
- FK: `changed_by` -> `users(id)` (MOD-000)
- CHECK: `length(change_reason) >= 10`

**Indexes:**

- `idx_version_history_routine` (routine_id) — timeline de versoes
- `idx_version_history_previous` (previous_version_id) — ancestralidade

---

## Mapa de Foreign Keys

| Tabela Origem | Campo | Tabela Destino | Tipo |
|---|---|---|---|
| `context_framers` | `framer_type_id` | `context_framer_types` | Intra-modulo |
| `context_framers` | `created_by` | `users` (MOD-000) | Inter-modulo (Foundation) |
| `target_fields` | `target_object_id` | `target_objects` | Intra-modulo |
| `incidence_rules` | `framer_id` | `context_framers` | Intra-modulo |
| `incidence_rules` | `target_object_id` | `target_objects` | Intra-modulo |
| `incidence_rules` | `created_by` | `users` (MOD-000) | Inter-modulo (Foundation) |
| `behavior_routines` | `parent_routine_id` | `behavior_routines` | Self-ref (fork) |
| `behavior_routines` | `approved_by` | `users` (MOD-000) | Inter-modulo (Foundation) |
| `behavior_routines` | `created_by` | `users` (MOD-000) | Inter-modulo (Foundation) |
| `routine_items` | `routine_id` | `behavior_routines` | Intra-modulo |
| `routine_items` | `target_field_id` | `target_fields` | Intra-modulo |
| `routine_incidence_links` | `routine_id` | `behavior_routines` | Intra-modulo |
| `routine_incidence_links` | `incidence_rule_id` | `incidence_rules` | Intra-modulo |
| `routine_version_history` | `routine_id` | `behavior_routines` | Intra-modulo |
| `routine_version_history` | `previous_version_id` | `behavior_routines` | Intra-modulo |
| `routine_version_history` | `changed_by` | `users` (MOD-000) | Inter-modulo (Foundation) |

---

## Resumo de Contagens

| Metrica | Valor |
|---|---|
| Total de tabelas | 9 |
| Total de FKs intra-modulo | 10 |
| Total de FKs inter-modulo (Foundation) | 6 |
| Total de UNIQUE constraints | 7 |
| Total de CHECK constraints | 8 |
| Total de indexes recomendados | 19 |

---

## Nota: Limites Configuraveis por Tenant (PEN-007/PENDENTE-005)

Os limites operacionais abaixo sao configurados externamente via `tenant_config` (MOD-000 Foundation). O MOD-007 consulta esses limites no momento de validacao e retorna 422 `LIMIT_EXCEEDED` quando excedidos:

| Limite | Default | Entidade impactada | Referencia |
|---|---|---|---|
| Max itens por rotina | 50 | `routine_items` (E-007) | FR-006, NFR-006 |
| Max regras por enquadrador | 10 | `incidence_rules` (E-005) | FR-004, NFR-006 |

Esses limites **nao** sao colunas no schema — sao consultados em runtime via servico de configuracao Foundation. Nao ha tabela propria para armazena-los.

---

## Nota: Isolamento por tenant_id (BR-013)

Todas as 9 tabelas do modulo que possuem `tenant_id` aplicam filtro obrigatorio em TODAS as queries (SELECT, INSERT, UPDATE, DELETE). O `tenant_id` e injetado pelo middleware Foundation a partir do JWT/sessao — NUNCA aceito via body ou query param. Isso e enforced na application layer e validado por testes de integracao.

---

## Domain Events

Ver [DATA-003](DATA-003.md) para o catalogo completo de 14 domain events com Emit/View/Notify/outbox/sensitivity.
