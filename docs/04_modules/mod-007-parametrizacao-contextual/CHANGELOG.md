> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.

# CHANGELOG - MOD-007

## Ciclo de Estabilidade do Módulo

> 🟢 Verde = Concluído | 🟠 Laranja = Em Andamento | 🔵 Azul = Estável Ancestral | ⬜ Cinza = Previsto

```mermaid
flowchart TD
    E1["1 - História Geradora (Ágil)"]
    E2["2 - Forja Arquitetural (Scaffold)"]
    E3(["3 - Stubs em DRAFT"])
    E4["4 - Enriquecimento Simultâneo BDD/TDD"]
    E5(["5 - Selo READY (Estável Imutável)"])
    E6["6 - Adendos Futuros (Amendments)"]

    E1 --> E2 --> E3 --> E4 --> E5 --> E6

    style E1  fill:#27AE60,color:#fff,stroke:#1E8449
    style E2  fill:#27AE60,color:#fff,stroke:#1E8449
    style E3  fill:#27AE60,color:#fff,stroke:#1E8449
    style E4  fill:#27AE60,color:#fff,stroke:#1E8449
    style E5  fill:#27AE60,color:#fff,stroke:#1E8449
    style E6  fill:#F39C12,color:#fff,stroke:#D68910
```

*O módulo está na **Etapa 6 — Adendos Futuros (Amendments). Amendment UX-007-M01 em DRAFT.**

---

## Histórico de Versões

| Versão | Data | Responsável | Descrição |
|--------|------|-------------|-----------|
| 1.11.0 | 2026-04-01 | codegen | Codegen v2: 6 agentes, 17 arquivos (2 criados + 15 modificados). Camadas: DB (schema incidenceType), CORE (entity + VO + ports), APP (3 use cases), API (DTOs + 2 routes), WEB (TriStateCell, MatrixLegend, IncidenceMatrix tri-state, FramersConfigPage 3-panel, DryRunModal, IncidenceRulesPage). Alinha código com DATA-007-M01, FR-007-M01, UX-007-M01. |
| 1.10.1 | 2026-04-01 | validate-all | Validação pos-merge amendments: Lint WARN (4 errors pre-existing no-explicit-any, 69 format pre-existing). Arch PASS (6/6 DomainError, Pattern A, React Query). QA PASS. Manifests 2/2 PASS. Drizzle WARN (spec atualizada, código pendente codegen v2). Endpoints PASS. 0 bloqueadores. Verdict: PASS_WITH_WARNINGS — specs atualizadas, código pendente codegen v2. |
| 1.10.0 | 2026-04-01 | merge-amendment | Merge FR-007-M01 → FR-007 v1.1.0: incidence_type em FR-004 CRUD + FR-009 evaluate response, 8 cenários Gherkin |
| 1.9.0 | 2026-04-01 | merge-amendment | Merge DATA-007-M01 → DATA-007 v1.1.0: campo incidence_type (OBR/OPC/AUTO) em incidence_rules (E-005), CHECK + index |
| 1.8.0 | 2026-04-01 | merge-amendment | Merge UX-007-M01 → UX-007 v1.1.0: layout 3-panel, matriz tri-state, FramersList, DryRunModal, TriStateCell, MatrixLegend, responsividade |
| 1.7.0 | 2026-04-01 | create-amendment | Amendment FR-007-M01: adicionar incidence_type nos endpoints CRUD incidence-rules (FR-004) e no response do motor evaluate (FR-009) — derivado de UX-007-M01, suporte ao color-coding tri-state |
| 1.6.0 | 2026-04-01 | create-amendment | Amendment DATA-007-M01: adicionar campo incidence_type (OBR/OPC/AUTO) em incidence_rules (E-005) — derivado de UX-007-M01, mudanca semantica da matriz de binaria para tri-state |
| 1.5.0 | 2026-04-01 | create-amendment | Amendment UX-007-M01: alinhar UX com spec 90-parametrization v2 — matriz tri-state (OBR/OPC/AUTO), 3-panel layout simultaneo, FramersList como panel-list, DryRunModal com resultados color-coded, ForkModal/PublishModal refinados, TriStateCell + MatrixLegend novos componentes |
| 1.4.0 | 2026-03-24 | validate-all | Validação Fase 3 aprovada — pronto para merge. Lint: PASS (0 errors/warnings). Format: PASS. Arquitetura: PASS (6/6 DomainError, Pattern A, React Query). QA: PASS. Manifests: 2/2 PASS. OpenAPI: N/A (inline). Drizzle: PASS (9 tabelas). Endpoints: PASS (7 route files). 0 bloqueadores, 0 violações críticas, 0 avisos. Domain errors corrigidos (PENDENTE-011 resolvida). |
| 1.3.0 | 2026-03-24 | validate-all | Validacao pos-codegen: lint PASS, format PASS, drizzle 9 tabelas OK, relations OK, 25 endpoints OK, 14 domain events OK, 6 hooks react-query OK, 2 pages OK. Warnings: domain errors nao estendem DomainError (cross-module), openapi standalone ausente. FAIL: tests_present. PENDENTE-011 registrada. Verdict: PASS_WITH_WARNINGS. |
| 1.2.0 | 2026-03-24 | codegen | Codegen concluido: 6 agentes executados, 57 arquivos gerados. Camadas: DB (3), CORE (14), APP (22), API (10), WEB (8), VAL (0 — validacao). Checks: 5/7 passed, tests_present missing, openapi standalone missing. |
| 1.1.0 | 2026-03-24 | codegen | Codegen parcial: AGN-COD-APP + AGN-COD-API (2 agentes, 32 arquivos). Camadas: application (22 use cases + ports), presentation (10 routes + DTOs). Faltam: WEB, VAL. |
| 1.0.0 | 2026-03-23 | promote-module | Promoção DRAFT→READY: manifesto v1.0.0, todos os requisitos e ADRs selados. Ciclo de estabilidade avança para Etapa 5. |
| 0.6.0 | 2026-03-19 | arquitetura | PENDENTE-001 decidida+implementada: Opção 1 — JSONLogic como engine v2 para `condition_expr`. Serialização nativa em jsonb, biblioteca madura (json-logic-js). CEL como fallback se limitações forem encontradas. ADR futuro quando v2 iniciar. |
| 0.5.0 | 2026-03-19 | arquitetura | PENDENTE-003 decidida+implementada: Opção 2 — tabela auxiliar `routine_integration_config` com FK para `behavior_routines.id` WHERE `routine_type=INTEGRATION`. MOD-008 responsável pela migração quando wave chegar. |
| 0.1.0 | 2026-03-19 | arquitetura | Baseline Inicial — scaffold gerado via `forge-module` a partir de US-MOD-007 (APPROVED). 9 tabelas, 24 endpoints, 5 features (F01–F05), 7 scopes. Stubs obrigatórios criados: DATA-003, SEC-002. Todos os itens nascem em `estado_item: DRAFT`. |
