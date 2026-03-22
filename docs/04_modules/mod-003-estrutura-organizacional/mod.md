> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.

# MOD-003 — Estrutura Organizacional

- **id:** MOD-003
- **version:** 0.3.0
- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-17
- **architecture_level:** 2
- **rastreia_para:** US-MOD-003, US-MOD-003-F01, US-MOD-003-F02, US-MOD-003-F03, US-MOD-003-F04, DOC-DEV-001, DOC-ESC-001, DOC-ARC-001, DOC-ARC-002, DOC-ARC-003, DOC-UX-010, DOC-UX-012, DOC-FND-000, MOD-000, US-MOD-000-F07, US-MOD-000-F12, LGPD-BASE-001
- **evidencias:** N/A

---

## 1. Objetivo

Módulo full-stack que implementa a hierarquia organizacional formal de 5 níveis (N1–N5), servindo como referência de pertencimento para todas as entidades de negócio — usuários, processos, rotinas e integrações. Provê API CRUD de unidades organizacionais (N1–N4), tree query via CTE recursivo, vinculação N4→N5 (tenant existente do MOD-000-F07) e telas de árvore/formulário.

## 2. Escopo

### Inclui

- API CRUD de unidades organizacionais N1–N4 com soft delete, restore e idempotência (`Idempotency-Key`)
- Tree query para visualização hierárquica via CTE recursivo (`GET /api/v1/org-units/tree`)
- Vinculação N4 → N5 (tenant existente do MOD-000-F07) com endpoints dedicados
- Tela de árvore organizacional com navegação hierárquica, busca client-side e toggle de inativos (UX-ORG-001)
- Formulário de criação/edição de nó com seleção de pai e nível derivado automaticamente (UX-ORG-002)
- Restore de unidades soft-deleted via menu contextual na árvore (F04)
- Domain events para todas as operações de escrita (`org.unit_created`, `org.unit_updated`, `org.unit_deleted`, `org.unit_restored`, `org.tenant_linked`, `org.tenant_unlinked`)
- Novos escopos registrados no catálogo DOC-FND-000 §2.2: `org:unit:read`, `org:unit:write`, `org:unit:delete`

### Não inclui

- Gestão de usuários dentro de cada nó — MOD-004
- Regras de acesso por estrutura org. — MOD-004
- Importação em massa de hierarquia — roadmap futuro
- Histórico de mudanças estruturais — roadmap futuro (MOD-003 v2)
- Movimentação de nós na árvore (drag-and-drop) — roadmap futuro

## 3. Nível de Arquitetura

**Nível 2 — DDD-lite + Clean Completo** (DOC-ESC-001)

Módulo full-stack com endpoints próprios (`/api/v1/org-units`) e telas próprias. É o primeiro módulo verdadeiramente full-stack depois do Foundation. Modelo de dados: `org_units` (N1–N4) + `org_unit_tenant_links` (N4→N5). N5 = tenant existente do MOD-000-F07 — não cria tabela paralela.

### Justificativa (DOC-ESC-001 §4.2)

**Score de gatilhos:** 5/6

| # | Gatilho | Atendido | Evidência |
|---|---------|----------|-----------|
| 1 | Estado/workflow com máquina de estados | **SIM** | Transições `ACTIVE`→`INACTIVE` via soft-delete, restore (`INACTIVE`→`ACTIVE`), bloqueio de delete com filhos ativos — 4 transições com guarda condicional |
| 2 | Compliance/auditoria obrigatória | **SIM** | `LGPD-BASE-001` referenciado; domain events obrigatórios em todas as operações de escrita (`org.unit_created/updated/deleted/restored`, `org.tenant_linked/unlinked`); `sensitivity_level` declarado por evento |
| 3 | Concorrência/consistência | **SIM** | `Idempotency-Key` com TTL 60s em create e link_tenant; CTE recursivo com prevenção de loop (validação de ancestralidade antes de aceitar `parent_id`); `codigo` imutável pós-criação; constraint de unicidade `(org_unit_id, tenant_id)` |
| 4 | Integrações externas críticas | **NÃO** | Depende de MOD-000 (Foundation) — integração interna, não externa |
| 5 | Multi-tenant com RLS e escopo por cliente | **SIM** | Tabela `org_units` é cross-tenant (ADR-003); vinculação N4→N5 via `org_unit_tenant_links`; escopos `org:unit:read/write/delete` registrados no catálogo DOC-FND-000 §2.2 |
| 6 | Regras cruzadas/reuso alto entre módulos | **SIM** | Estrutura organizacional é referência canônica de pertencimento para todos os módulos — MOD-004 (identidade avançada), processos, rotinas e integrações referenciam `org_units` como hierarquia |

**Gatilhos Nível 1 também atendidos (base):**

- Regra de negócio não-trivial: hierarquia de 5 níveis com validação de parentesco, profundidade máxima N1→N4, e vinculação N4→N5
- Testabilidade com mocks: use cases de CRUD hierárquico + tree query CTE requerem isolamento de repositório
- Integração com módulo externo: depende de MOD-000 Foundation (tenants, catálogo de escopos, auth, domain_events)
- Múltiplos endpoints alterando o mesmo recurso: create, update, soft-delete e restore sobre `org_units`

## 4. Dependências

- **Depende de:** MOD-000 (Foundation) — tenants (MOD-000-F07), catálogo de escopos (MOD-000-F12), auth, domain_events
- **Dependentes:** MOD-004 (futuro — gestão de usuários por nó organizacional)

### Caminhos do Módulo (module_paths)

| Camada | Path | Nota |
|---|---|---|
| Especificação | `docs/04_modules/mod-003-estrutura-organizacional/` | Requisitos, ADRs, amendments |
| User Stories | `docs/04_modules/user-stories/features/US-MOD-003-F*.md` | F01–F04 |
| Épico | `docs/04_modules/user-stories/epics/US-MOD-003.md` | Governança e DoR/DoD |
| Screen Manifests | `docs/05_manifests/screens/ux-org-001.*.yaml`, `ux-org-002.*.yaml` | UX declarativo |
| API — Presentation | `apps/api/src/modules/org-units/presentation/` | Routes, controllers, validators (Nível 1) |
| API — Application | `apps/api/src/modules/org-units/application/` | Use cases, ports, DTOs (Nível 1) |
| API — Domain | `apps/api/src/modules/org-units/domain/` | Types, VOs essenciais, errors (Nível 1) |
| API — Infrastructure | `apps/api/src/modules/org-units/infrastructure/` | Repositories, mappers DB (Nível 1) |
| API — Schema | `src/modules/org-units/schema.ts` | Drizzle schema |
| Web — UI | `apps/web/src/modules/org-units/ui/screens/`, `apps/web/src/modules/org-units/ui/components/` | React components |
| Web — Domain | `apps/web/src/modules/org-units/domain/` | View models, formatters |
| Web — Data | `apps/web/src/modules/org-units/data/` | Queries, mappers API |

## 5. Sub-Histórias (Features)

| Feature | Tema | Tipo | Status |
|---|---|---|---|
| [US-MOD-003-F01](../user-stories/features/US-MOD-003-F01.md) | API Core — CRUD + Tree Query + Vinculação N5 | **Backend** | `READY` |
| [US-MOD-003-F02](../user-stories/features/US-MOD-003-F02.md) | Árvore Organizacional (UX-ORG-001) | **UX** | `READY` |
| [US-MOD-003-F03](../user-stories/features/US-MOD-003-F03.md) | Formulário de Nó Organizacional (UX-ORG-002) | **UX** | `READY` |
| [US-MOD-003-F04](../user-stories/features/US-MOD-003-F04.md) | Restore de Unidade Organizacional | **Backend + UX** | `TODO` |

## 6. Itens Base (Canônicos) e Links

<!-- start index -->
- [BR-001](requirements/br/BR-001.md) — Regras de Negócio da Estrutura Organizacional
- [FR-001](requirements/fr/FR-001.md) — Requisitos Funcionais da Estrutura Organizacional
- [DATA-001](requirements/data/DATA-001.md) — Modelo de Dados da Estrutura Organizacional
- [DATA-003](requirements/data/DATA-003.md) — Catálogo de Domain Events da Estrutura Organizacional
- [INT-001](requirements/int/INT-001.md) — Integrações e Contratos da Estrutura Organizacional
- [SEC-001](requirements/sec/SEC-001.md) — Segurança e Compliance da Estrutura Organizacional
- [SEC-002](requirements/sec/SEC-002.md) — Matriz de Autorização de Eventos da Estrutura Organizacional
- [UX-001](requirements/ux/UX-001.md) — Jornadas e Fluxos da Estrutura Organizacional
- [NFR-001](requirements/nfr/NFR-001.md) — Requisitos Não Funcionais da Estrutura Organizacional
- [PEN-003](requirements/pen-003-pendente.md) — Pendências e Questões Abertas da Estrutura Organizacional
<!-- end index -->

## 7. Decisões (ADR)

<!-- start adr-index -->
- [ADR-001](adr/ADR-001.md) — N5 como Tenant Existente (MOD-000-F07), Não como Org Unit
- [ADR-002](adr/ADR-002.md) — CTE Recursivo para Tree Query (vs. Materialized Path / Nested Sets)
- [ADR-003](adr/ADR-003.md) — org_units é Cross-Tenant (Sem Coluna tenant_id)
- [ADR-004](adr/ADR-004.md) — Idempotency-Key via MOD-000 com Fail-Open (Sem Tabela Paralela)
<!-- end adr-index -->

## 8. Amendments

- [FR-001-C01](amendments/fr/FR-001-C01.md) — Estratégia de constraint catch (PostgreSQL 23505 → 409) para unicidade de codigo
- [US-MOD-003-M01](amendments/us/US-MOD-003-M01.md) — Inclusão de F04 (Restore) no tree view, tabela de sub-histórias e endpoints do épico
- [US-MOD-003-F01-M01](amendments/us/US-MOD-003-F01-M01.md) — Adição do domain event org.unit_restored à tabela de F01
