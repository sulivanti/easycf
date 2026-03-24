> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.

# CHANGELOG - MOD-010

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
| 1.0.0 | 2026-03-23 | promote-module | Promoção DRAFT→READY: manifesto v1.0.0, todos os requisitos e ADRs selados. Ciclo de estabilidade avança para Etapa 5. |
| 0.6.0 | 2026-03-19 | arquitetura | PENDENTE-006 decidida+implementada — Opcao A (NotificationService MOD-000) escolhida para canal e-mail de privilege escalation. Dependencia MOD-000 NotificationService multi-canal mapeada (MOD-000 ainda nao possui o servico). PEN-010 v0.9.0. |
| 0.5.0 | 2026-03-19 | AGN-DEV-09, AGN-DEV-10, AGN-DEV-11 | Enriquecimento Batch 4 (final) — AGN-DEV-09: 4 ADRs criadas (ADR-001 Gateway Síncrono, ADR-002 API Key bcrypt, ADR-003 Outbox Pattern, ADR-004 Blocklist Wildcard); mod.md §9 adr-index atualizado. AGN-DEV-10: PEN-010 atualizado com 6 pendências (2 altas: Phase 2 enable e amendment MOD-000-F12; 3 médias: PREPARAR default, DIRECT lógica, callback MOD-009; 1 baixa: e-mail config). AGN-DEV-11: Cross-validation — 2 erros corrigidos (rate limit SEC vs NFR, tenant_id mcp_action_types), 4 warnings documentados, cobertura completa verificada. |
| 0.4.0 | 2026-03-19 | AGN-DEV-06, AGN-DEV-07 | Enriquecimento Batch 3 — AGN-DEV-06: SEC-010 expandido com 14 seções (authn API key, authz RBAC 6 scopes, blocklist Phase 1/2 com enforcement WRITE+RUNTIME, privilege escalation sensitivity_level=2, segregação de funções, classificação de dados, payload sanitization, isolamento multi-tenant, retenção por entidade, LGPD Art.18 com direitos do titular, auditoria 10 EVTs mapeados, rate limits 6 operações, brute force protection, ciclo de vida API key); SEC-002 expandida com 3 sub-matrizes, maskable_fields detalhados, retenção por categoria, 5 cenários Gherkin BDD. AGN-DEV-07: UX-010 expandido com jornadas completas (UX-MCP-001: 8 passos + 5 estados + 3 state machines + 12 ações DOC-UX-010 + 8 componentes + 26 copy strings; UX-MCP-002: 7 passos + 8 estados + 2 state machines + 7 ações + 3 componentes + 16 copy strings), WCAG 2.1 AA (10 critérios + ARIA/keyboard), responsive 3 breakpoints, mapeamento action→endpoint→domain_event (10 ações), 11 cenários Gherkin BDD. |
| 0.3.0 | 2026-03-19 | AGN-DEV-04, AGN-DEV-05, AGN-DEV-08 | Enriquecimento Batch 2 — AGN-DEV-04: DATA-010 FK ON DELETE RESTRICT verificado, 13 índices hot-query, CHECK constraints, ERD textual, migração com ordem e rollback; DATA-003 expandido com formato individual EVT-001 a EVT-010 (outbox, dedupe_key, maskable_fields, payload_policy, notify rules). AGN-DEV-05: INT-010 enriquecido com 5 integrações detalhadas (MOD-009 síncrona, MOD-007 síncrona com degradação, MOD-008 BullMQ+DLQ, MOD-004 in-process, MOD-000 amendment) + 13 contratos de API (INT-006-A a INT-006-K) com request/response JSON, erros RFC 9457, failure behavior e observabilidade. AGN-DEV-08: NFR-010 enriquecido com 9 NFRs (SLOs P95/P99 por endpoint e política, disponibilidade 99.9%/99.5%, segurança API key, escalabilidade com limites e rate limiting, auditoria 5 anos append-only, observabilidade com 15 métricas Prometheus + 17 spans OpenTelemetry + 4 dashboards + 7 alertas, DR RPO 1h/RTO 4h, healthcheck liveness+readiness com bcrypt selftest). |
| 0.2.0 | 2026-03-19 | AGN-DEV-01 | Enriquecimento MOD/Escala — Justificativa architecture_level=2 com 6 gatilhos DOC-ESC-001, module_paths documentados (docs + apps/api + apps/web), EX-AUTH-001 e EX-SEC-001 referenciados. |
| 0.2.0 | 2026-03-19 | AGN-DEV-02 | Enriquecimento BR — Gherkin adicionado a BR-001..BR-009. Novas regras: BR-010 (8 passos gateway), BR-011 (vínculo único), BR-012 (privilege escalation), BR-013 (codigo ação imutável), BR-014 (can_approve false), BR-015 (revocation_reason obrigatório). |
| 0.2.0 | 2026-03-19 | AGN-DEV-03 | Enriquecimento FR — Done funcional, dependências, idempotência, timeline/notifications e Gherkin adicionados a FR-001..FR-009. Rastreabilidade cruzada com BR e DATA-003. |
| 0.1.0 | 2026-03-19 | arquitetura | Baseline Inicial — scaffold gerado via `forge-module` a partir de US-MOD-010 (APPROVED). 5 tabelas, 13 endpoints, 5 features (F01–F05), 3 políticas de execução. Stubs obrigatórios criados: DATA-003, SEC-002. Todos os itens nascem em `estado_item: DRAFT`. |
