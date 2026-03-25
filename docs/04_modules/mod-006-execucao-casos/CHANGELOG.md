> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.

# CHANGELOG - MOD-006

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
    style E6  fill:#95A5A6,color:#fff,stroke:#7F8C8D
```

*O módulo está na **Etapa 5 — Selo READY (Estável Imutável). Alterações futuras via `create-amendment`.**

---

## Histórico de Versões

| Versão | Data | Responsável | Descrição |
|--------|------|-------------|-----------|
| 1.7.0 | 2026-03-25 | merge-amendment | Merge INT-006-M01: nova seção §7 Email Queue — Convenções BullMQ/Redis (fila `mod-006:email`, singleton, removeOnComplete, db1, health check). INT-006 bumped para v0.5.0. Derivado de DOC-PADRAO-002-M01. |
| 1.6.0 | 2026-03-24 | validate-all | Validação Fase 3 aprovada — pronto para merge. Lint: PASS (0 errors/warnings). Format: PASS. Arquitetura: PASS (7/7 DomainError, Pattern A, React Query). QA: PASS. Manifests: 2/2 PASS. OpenAPI: PASS (16/16). Drizzle: PASS (5 tabelas). Endpoints: PASS (16/16). 0 bloqueadores, 0 violações críticas, 0 avisos. |
| 1.5.0 | 2026-03-24 | validate-all | Validação completa (lint+format+architecture+qa+manifest+openapi+drizzle+endpoint). Lint: PASS. Format: PASS. QA: PASS. Manifests: 2/2 PASS. Drizzle: PASS (5 tabelas, 12 indexes, 4 checks). OpenAPI: PASS (16/16). Endpoints: PASS (16/16). Arquitetura: WARN — 7 domain errors estendem Error ao invés de DomainError (PENDENTE-008). Web Pattern A: PASS. Hooks React Query: PASS. 0 bloqueadores, 0 violações críticas, 3 avisos (PENDENTE-007 lint, PENDENTE-008 DomainError, qa:all cross-module). |
| 1.4.0 | 2026-03-24 | validate-all | Validação pós-correção PENDENTE-006 aprovada. QA: PASS. Manifests: 2/2 PASS. Drizzle: PASS (2 avisos menores). OpenAPI: PASS (16/16 endpoints, operationIds corretos). Endpoints: PASS (16/16, todas as 5 correções PENDENTE-006 aplicadas). 0 bloqueadores, 0 violações críticas, 2 avisos. |
| 1.3.0 | 2026-03-23 | validate-all | Validação Fase 3 com 4 violações críticas. QA: PASS. Manifests: 2/2 PASS. Drizzle: PASS. Endpoints: FAIL (13/16, paths divergem da spec, /controls consolidado, PATCH ausente, 5 operationId mismatches). OpenAPI: N/A (contrato inexistente). |
| 1.2.0 | 2026-03-23 | validate-all | Validação pós-código aprovada. QA: PASS. Manifests: 2/2 PASS. Drizzle: PASS (7/7 regras). Endpoints: PASS (8/10, 2 avisos). OpenAPI: N/A (paths pendentes). 0 bloqueadores, 4 avisos. |
| 1.1.0 | 2026-03-23 | codegen | Codegen concluído: 6 agentes executados, 46 arquivos gerados. Camadas: DB, CORE, APP (19), API (2), WEB (7), VAL. Validação cruzada PASS em todas as camadas. |
| 1.0.0 | 2026-03-23 | promote-module | Promoção DRAFT→READY: manifesto v1.0.0, todos os requisitos e ADRs selados. Ciclo de estabilidade avança para Etapa 5. |
| 0.4.0 | 2026-03-19 | AGN-DEV-10 | Enriquecimento PENDENTE: 5 questões abertas registradas (escopo REOPENED, expiração atribuições, índice object_id, amendment scopes, gates em reabertura). |
| 0.3.0 | 2026-03-19 | AGN-DEV-09 | Enriquecimento ADR: 5 ADRs criadas (motor atômico, freeze cycle_version_id, 3 históricos independentes, optimistic locking, background job expiração). |
| 0.2.0 | 2026-03-19 | AGN-DEV-01 | Enriquecimento MOD: narrativa arquitetural expandida (aggregate root, value objects, domain services), referência EX-ESC-001, versão bumped. |
| 0.1.0 | 2026-03-18 | arquitetura | Baseline Inicial — scaffold gerado via `forge-module` a partir de US-MOD-006 (APPROVED). 5 tabelas, 17 endpoints, 4 features (F01–F04), 11 domain events. Stubs obrigatórios criados: DATA-003, SEC-002. Todos os itens nascem em `estado_item: DRAFT`. |
