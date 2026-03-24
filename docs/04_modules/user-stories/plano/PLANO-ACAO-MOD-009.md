# Procedimento — Plano de Acao MOD-009 Movimentos sob Aprovacao (Aprovacoes e Alcadas)

> **Versao:** 3.3.0 | **Data:** 2026-03-24 | **Owner:** Marcos Sulivan
> **Estado atual do modulo:** READY (v1.0.0) | **Epico:** APPROVED (v1.2.0) | **Features:** 5/5 APPROVED
>
> Fases 0-5 concluidas. PENDENTE-001 (lint errors codegen) decidida (Opcao A — correcao incremental 3 fases) e implementada. Lint PASS: 0 ESLint errors, 0 Prettier warnings. 8 pendencias total, 8 IMPLEMENTADAS, 0 abertas.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-009 | APPROVED (v1.2.0) | DoR completo, 5 features vinculadas, principio "origem nao e autorizacao" documentado |
| Features F01-F05 | 5/5 APPROVED | F01 (Regras de controle+alcada), F02 (Motor de controle), F03 (Inbox+execucao+override), F04 (UX Inbox), F05 (UX Configurador regras) |
| Scaffold (forge-module) | CONCLUIDO | mod-009-movimentos-aprovacao/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | Agentes 01-11 confirmados em 4 batches, v0.9.0, todas as pendentes resolvidas |
| Codegen (7 agentes) | CONCLUIDO | 43 arquivos API (domain 15, application 17, presentation 10, infrastructure 1) + 24 arquivos Web + 2 DB schema + 1 OpenAPI. Execution-state atualizado com secao codegen completa |
| PENDENTEs | 0 abertas | 8 total: 8 IMPLEMENTADA (001-007 + PENDENTE-001) |
| ADRs | 4 criadas | Nivel 2 requer minimo 3 — atendido (ADR-001 a ADR-004) |
| Amendments | 0 | Nenhum |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v1.2.0 | Ultima entrada 2026-03-24 — Revalidacao completa PASS (lint+arch+qa+manifests+openapi+drizzle+endpoints) |
| Screen Manifests | 2/2 existem | UX-APROV-001, UX-APROV-002 |
| Dependencias | 3 upstream (MOD-000, MOD-004, MOD-006) | Consome Foundation core, delegacoes de acesso, case_id opcional |
| Dependentes | 1 downstream (MOD-010) | MOD-010 consome policy CONTROLLED para movimentos |
| Bloqueios | 0 | Nenhum BLK-* afeta MOD-009 diretamente |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-009 define o modulo de controle de movimentos sob aprovacao — interceptacao de operacoes criticas que exigem decisao formal antes de gerar efeito. Principio central: "Origem nao e autorizacao" — API, integracao sistemica e MCP podem iniciar solicitacoes, mas nao contornam alcada. Score 6/6 (todos os gatilhos presentes). Motor de controle sincrono com 4 criterios combinaveis (VALUE, HIERARCHY, ORIGIN, OBJECT+OPERATION), cadeias de aprovacao multinivel com timeout e escalada, segregacao de funcoes com excecao por scope, override auditado. 7 tabelas proprias, 13 endpoints, 13 domain events, 7 escopos.

```
1    (manual)              Revisar e finalizar epico US-MOD-009:             CONCLUIDO
                           - Escopo fechado (5 features: 3 Backend + 2 UX)  status_agil = APPROVED
                           - Principio "origem nao e autorizacao" definido    v1.2.0
                           - 4 criterios combinaveis de alcada
                           - Segregacao com excecao de auto-aprovacao
                           - DoR 100% completo
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-009.md

2    (manual)              Revisar e finalizar features F01-F05:             CONCLUIDO
                           - F01: API Regras de controle + alcada            5/5 APPROVED
                           - F02: API Motor de controle (interceptacao)
                           - F03: API Inbox + execucao + override
                           - F04: UX Inbox de aprovacoes
                           - F05: UX Configurador de regras
```

### Fase 1: Genese do Modulo — CONCLUIDA

O scaffold do modulo foi gerado via `forge-module`, criando a estrutura completa de 7 tabelas, 13 endpoints, 5 features e 13 domain events. Modulo ortogonal ao MOD-006 Gates: Gates operam dentro de fluxos de processo; Movimentos operam em qualquer operacao critica.

```
3    /forge-module          Scaffold gerado:                                 CONCLUIDO
                           - mod-009-movimentos-aprovacao/                   v0.1.0
                           - CHANGELOG.md
                           - requirements/ (BR, FR, DATA, INT, SEC, UX, NFR, PEN)
                           - adr/
                           - 7 tabelas, 13 endpoints, 5 features, 13 domain events
                           Stubs obrigatorios: DATA-003, SEC-002
```

### Fase 2: Enriquecimento — CONCLUIDA

O enriquecimento foi executado em 4 batches completos, com todos os 11 agentes confirmados. Destaque para o dominio rico do modulo: aggregate root ControlledMovement, 4 value objects (MovementStatus, ApprovalDecision, OriginType, ApprovalCriteria), 4 domain services (ControlEngine, ApprovalChainResolver, OverrideAuditor, AutoApprovalService). Todas as 7 pendencias foram identificadas e implementadas durante o enriquecimento.

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-NNN
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-NNN
> ```

```
4    /enrich                Enriquecimento completo (11 agentes):            CONCLUIDO
                           Batch 1: AGN-DEV-01 (MOD/Escala), AGN-DEV-02 (BR), AGN-DEV-03 (FR)
                           Batch 2: AGN-DEV-04 (DATA), AGN-DEV-05 (INT), AGN-DEV-08 (NFR)
                           Batch 3: AGN-DEV-06 (SEC), AGN-DEV-07 (UX)
                           Batch 4: AGN-DEV-09 (ADR), AGN-DEV-10 (PENDENTE), AGN-DEV-11 (VAL)
                           Resultado: v0.9.0, 4 ADRs, 7 pendentes implementadas
```

**Rastreio de agentes:**

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-009-movimentos-aprovacao.md | CONCLUIDO | v0.5.0 — aggregate root, value objects, domain services |
| 2 | AGN-DEV-02 | BR | BR-009.md | CONCLUIDO | Gherkin BDD para BR-001..BR-009, impactos explicitos |
| 3 | AGN-DEV-03 | FR | FR-009.md | CONCLUIDO | Gherkin para FR-001..FR-008, idempotency e timeline flags |
| 4 | AGN-DEV-04 | DATA | DATA-009.md, DATA-003.md | CONCLUIDO | FK ON DELETE RESTRICT, indices hot-query, formato individual por evento |
| 5 | AGN-DEV-05 | INT | INT-009.md | CONCLUIDO | 13 endpoints com JSON completos, erros RFC 9457, async failure |
| 6 | AGN-DEV-06 | SEC | SEC-009.md, SEC-002.md | CONCLUIDO | Segregacao/auto-aprovacao detalhada, LGPD Art. 18, retencao por categoria |
| 7 | AGN-DEV-07 | UX | UX-009.md | CONCLUIDO | action_ids DOC-UX-010 (20 acoes), state machines, WCAG 2.1 AA |
| 8 | AGN-DEV-08 | NFR | NFR-009.md | CONCLUIDO | SLOs detalhados, DR (RPO=0, RTO<15min), 10 metricas Prometheus |
| 9 | AGN-DEV-09 | ADR | ADR-001 a ADR-004 | CONCLUIDO | 4 ADRs criadas |
| 10 | AGN-DEV-10 | PENDENTE | pen-009-pendente.md | CONCLUIDO | 7 pendentes identificadas |
| 11 | AGN-DEV-11 | VAL | Cross-validation | CONCLUIDO | IDs, metadata, rastreabilidade verificados |

**Pendentes resolvidas — tabela-resumo:**

| # | ID | Status | Severidade | Decisao (1 linha) |
|---|---|---|---|---|
| 1 | PEN-009-001 | IMPLEMENTADA | ALTA | Domain event com outbox (assincrono) para callback pos-aprovacao |
| 2 | PEN-009-002 | IMPLEMENTADA | ALTA | Amendment DOC-FND-000-M03 — 7 scopes approval:* registrados |
| 3 | PEN-009-003 | IMPLEMENTADA | MEDIA | Body field dry_run: true no evaluate (sem side-effects) |
| 4 | PEN-009-004 | IMPLEMENTADA | MEDIA | In-app como MVP para notificacoes |
| 5 | PEN-009-005 | IMPLEMENTADA | BAIXA | Sem particionamento MVP, apenas indices (threshold 5M) |
| 6 | PEN-009-006 | IMPLEMENTADA | MEDIA | Endpoint dedicado POST /movements/:id/retry |
| 7 | PEN-009-007 | IMPLEMENTADA | BAIXA | Polling 60s MVP (SSE roadmap pos-MVP) |
| 8 | PENDENTE-001 | IMPLEMENTADA | MEDIA | Correcao lint codegen 3 fases (format+lint:fix+refactor) — Opcao A |

> Detalhes completos: requirements/pen-009-pendente.md

### Fase 3: Validacao — CONCLUIDA

O `/validate-all` foi executado em 2026-03-22 e todos os validadores aplicaveis passaram. Os scopes `approval:*` ja estavam registrados em DOC-FND-000 via amendment DOC-FND-000-M03 (PEN-009-002), garantindo Gate 3 verde para os manifests.

> **Decision tree de validacao:**
>
> ```
> Quero validar tudo de uma vez?
> ├── SIM → /validate-all (orquestra todos, pula os que nao tem artefato)
> └── NAO → Qual pilar?
>     ├── Sintaxe/links/metadados → /qa
>     ├── Screen manifests       → /validate-manifest
>     ├── Contratos OpenAPI      → /validate-openapi
>     ├── Schemas Drizzle        → /validate-drizzle
>     └── Endpoints Fastify      → /validate-endpoint
> ```

```
5a   /qa                    Validacao de sintaxe, links e metadados:          PASS
                           - Todos os artefatos com metadata valido
                           - Links internos resolvidos
                           - IDs consistentes

5b   /validate-manifest     Validacao dos Screen Manifests:                   PASS
                           - ux-aprov-001.inbox-aprovacoes.yaml: PASS
                           - ux-aprov-002.config-regras.yaml: PASS
                           - Gates 1-3 verdes (YAML valido, actions consistentes, scopes registrados)

5c   /validate-openapi      Validacao de contratos OpenAPI:                   PASS
                           Artefato: apps/api/openapi/mod-009-movement-approval.yaml
                           14 operacoes, correlation_id OK, RFC 9457 OK
                           4 warnings LOW (paginacao flat, /my/approvals sem paginacao,
                           invalid_fields ausente, sem examples)

5d   /validate-drizzle      Validacao de schemas Drizzle:                     PASS
                           Artefatos: apps/api/db/schema/movement-approval.ts,
                                      movement-approval.relations.ts
                           7/7 tabelas DOC-GNP-00 OK
                           20 warnings LOW (drift spec vs impl: naming, tipos, indices)

5e   /validate-endpoint     Validacao de endpoints Fastify:                   PASS
                           Artefatos: apps/api/src/modules/movement-approval/presentation/routes/
                                      (rules, engine, movements, approvals)
                           14/14 endpoints match OpenAPI
                           5 warnings advisory (Zod vs Typebox, retry scope, no pagination)
```

**Validadores Aplicaveis — Mapa de Cobertura:**

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | /qa | SIM (todos) | SIM — PASS | Todos os .md do modulo |
| 2 | /validate-manifest | SIM (manifests existem) | SIM — PASS | ux-aprov-001, ux-aprov-002 |
| 3 | /validate-openapi | SIM (Nivel 2) | SIM — PASS | openapi/mod-009-movement-approval.yaml (14 ops, 4 warnings LOW) |
| 4 | /validate-drizzle | SIM (Nivel 2) | SIM — PASS | movement-approval.ts, movement-approval.relations.ts (7 tabelas, 20 warnings LOW) |
| 5 | /validate-endpoint | SIM (Nivel 2) | SIM — PASS | routes/rules, engine, movements, approvals (14/14, 5 warnings advisory) |

### Fase 4: Promocao — CONCLUIDA

O modulo foi promovido a READY em 2026-03-23 via `/promote-module`. Todos os criterios DoR (1-7) foram atendidos previamente. O manifesto avancou de v0.5.0 (DRAFT) para v1.0.0 (READY), e o CHANGELOG registra a promocao como Etapa 5 do ciclo de estabilidade. A partir deste ponto, qualquer alteracao ao modulo requer amendment formal via `/create-amendment`.

```
6    /promote-module        Promocao DRAFT -> READY:                          CONCLUIDO
                           - estado_item: DRAFT -> READY                      v1.0.0
                           - Manifesto: v0.5.0 -> v1.0.0
                           - CHANGELOG: Etapa 5 (Selo READY)
                           - Todos os requisitos e ADRs selados
                           - Data: 2026-03-23
```

**Gate 0 — Definition of Ready (DoR) Check:**

| # | Criterio | Status | Evidencia |
|---|----------|--------|-----------|
| DoR-1 | 0 pendentes ABERTA ou EM_ANALISE | SIM | 7/7 IMPLEMENTADA |
| DoR-2 | Todos os pilares com artefato | SIM | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1) = 10/10 |
| DoR-3 | ADRs minimos para Nivel 2 (3+) | SIM | 4 ADRs (ADR-001 a ADR-004) |
| DoR-4 | Epico APPROVED | SIM | US-MOD-009 APPROVED v1.2.0 |
| DoR-5 | Todas as features APPROVED | SIM | 5/5 APPROVED |
| DoR-6 | Screen Manifests validados | SIM | 2/2 PASS (ux-aprov-001, ux-aprov-002) |
| DoR-7 | /qa verde | SIM | validate-all PASS 2026-03-22 |

> **Resultado:** Todos os criterios DoR atendidos. Modulo promovido a READY em 2026-03-23.

### Fase 5: Geracao de Codigo — CONCLUIDA

O modulo esta READY e o scaffold de aplicacao foi concluido em 2026-03-23. O codegen foi executado gerando codigo em todas as camadas aplicaveis ao Nivel 2 via 7 agentes (DB, CORE, APP, APP-APPROVALS, API, WEB, VAL). Foram gerados 42 arquivos TypeScript na API (domain: 15, application: 17, presentation: 10), 24 arquivos no web (types, api, hooks, components, pages), 3 arquivos DB (2 schema + 1 infrastructure), e 1 arquivo OpenAPI. Total: 70 arquivos de codigo. Validacao pos-codegen (`/validate-all`) aprovada em 2026-03-24 com 0 bloqueadores.

> **Nota:** O execution-state (.agents/execution-state/MOD-009.json) foi atualizado com secao `codegen` completa e `validations` com resultado do validate-all pos-codegen.

> **Decision tree de codegen:**
>
> ```
> Preciso gerar codigo para os modulos?
> ├── Scaffold existe? (apps/api/, apps/web/)
> │   └── NAO → /app-scaffold all (one-time, cria apps/api e apps/web)
> └── SIM → Qual escopo?
>     ├── Todos modulos READY (ordem topologica)  → /codegen-all (--dry-run para preview)
>     ├── Todos agentes de 1 modulo               → /codegen mod-NNN
>     └── 1 agente especifico                     → /codegen-agent mod-NNN AGN-COD-XX
> ```

```
7    /app-scaffold all      Criar scaffold de aplicacoes:                     CONCLUIDO
                           - apps/api/ (Fastify + Drizzle + OpenAPI)          2026-03-23
                           - apps/web/ (React + Vite + TanStack)

8    /codegen mod-009       Gerar codigo em todas as camadas:                 CONCLUIDO
                           Nivel 2 — todos os 7 agentes:
                           Fase 1: AGN-COD-DB (schemas Drizzle, OpenAPI)
                           Fase 2: AGN-COD-CORE (domain: entities, VOs, services, events, errors)
                           Fase 3: AGN-COD-APP (use cases, ports)
                           Fase 4: AGN-COD-API (routes, DTOs)
                           Fase 5: AGN-COD-WEB (pages, components, hooks, api, types)
                           Fase 6: AGN-COD-VAL (validacao cruzada)
                           Total: 69 arquivos gerados
```

**Rastreio de agentes COD:**

| # | Agente | Camada | Path | Status | Arquivos |
|---|--------|--------|------|--------|----------|
| 1 | AGN-COD-DB | infrastructure | apps/api/db/schema/movement-approval.ts, .relations.ts; infrastructure/schema.ts | CONCLUIDO | 3 |
| 2 | AGN-COD-CORE | domain | apps/api/src/modules/movement-approval/domain/ | CONCLUIDO | 15 (4 entities, 4 VOs, 4 services, 1 events, 1 errors, 1 index) |
| 3 | AGN-COD-APP | application | apps/api/src/modules/movement-approval/application/ (rules, engine, movements) | CONCLUIDO | 13 (11 use-cases, 2 ports) |
| 4 | AGN-COD-APP-APPROVALS | application | apps/api/src/modules/movement-approval/application/ (approvals) | CONCLUIDO | 4 (3 use-cases, 1 index) |
| 5 | AGN-COD-API | presentation | apps/api/src/modules/movement-approval/presentation/ + openapi/ | CONCLUIDO | 10 (4 routes, 4 DTOs, 1 index, 1 OpenAPI) |
| 6 | AGN-COD-WEB | web | apps/web/src/modules/movement-approval/ | CONCLUIDO | 24 (2 pages, 9 components, 4 hooks, 4 barrels, 2 api, 2 types, 1 index) |
| 7 | AGN-COD-VAL | validation | (cross-validation + /validate-all) | CONCLUIDO | 0 (validacao: 0 bloqueadores, 32 warnings LOW) |

**Inventario de codigo gerado — API:**

| Camada | Arquivos | Detalhe |
|--------|----------|---------|
| domain/entities | 4 | controlled-movement, approval-instance, approval-rule, movement-control-rule |
| domain/value-objects | 4 | movement-status, approval-decision, origin-type, approval-criteria |
| domain/services | 4 | control-engine, approval-chain-resolver, override-auditor, auto-approval |
| domain/events | 1 | movement-approval-events (13 domain events) |
| domain/errors | 1 | movement-approval-errors |
| application/use-cases | 12 | rules (5), engine (1), movements (5), approvals (3) |
| application/ports | 2 | repositories, services |
| presentation/routes | 4 | rules, engine, movements, approvals |
| presentation/dtos | 4 | rules, engine, movements, approvals |
| infrastructure | 1 | schema.ts |
| DB schema | 2 | movement-approval.ts, movement-approval.relations.ts |
| OpenAPI | 1 | mod-009-movement-approval.yaml |

**Inventario de codigo gerado — Web:**

| Camada | Arquivos | Detalhe |
|--------|----------|---------|
| pages | 2 | ApprovalInboxPage, RulesConfigPage |
| components | 9 | CountdownTimer, OriginBadge, PendingBadge, MovementCard, MovementDetailPanel, ApproveRejectForm, OverrideModal, ControlRuleDrawer, ApprovalChainEditor |
| hooks | 4 | use-control-rules, use-movements, use-approvals, use-engine |
| api | 1 | movement-approval.api |
| types | 1 | movement-approval.types |

### Fase 6: Pos-READY — SOB DEMANDA

O modulo foi promovido a READY em 2026-03-23. Nenhum amendment foi criado ate o momento. Alteracoes futuras ao modulo (pos-go-live, ajustes, novas funcionalidades como SSE para real-time inbox ou email como canal adicional) devem ser feitas exclusivamente via `/create-amendment`.

```
9    /update-specification  Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY -> delega para
                           /create-amendment automaticamente

10   /create-amendment      Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
                           Caso de uso previsto: ajustes pos-go-live,
                           SSE para real-time inbox, email como canal adicional
```

### Gestao de Pendencias

> **Decision tree de pendencias:**
>
> ```
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-009
> ├── Criar nova pendencia     → /manage-pendentes create PEN-009
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-009 PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-009 PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-009 PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-009 PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-009
> ```

```
11   /manage-pendentes list PEN-009
                           Estado atual MOD-009:
                             PEN-009: 8 itens total
                               8 IMPLEMENTADA (001-007 + PENDENTE-001)
                               0 ABERTA
                             SLA: nenhum vencido
```

**Pendencias — resumo compacto:**

| # | ID | Status | Severidade | Decisao (1 linha) |
|---|---|---|---|---|
| 1 | PEN-009-001 | IMPLEMENTADA | ALTA | Domain event outbox para callback pos-aprovacao |
| 2 | PEN-009-002 | IMPLEMENTADA | ALTA | Amendment DOC-FND-000-M03 (7 scopes) |
| 3 | PEN-009-003 | IMPLEMENTADA | MEDIA | dry_run body field no evaluate |
| 4 | PEN-009-004 | IMPLEMENTADA | MEDIA | In-app MVP para notificacoes |
| 5 | PEN-009-005 | IMPLEMENTADA | BAIXA | Sem particionamento MVP (threshold 5M) |
| 6 | PEN-009-006 | IMPLEMENTADA | MEDIA | Endpoint retry dedicado |
| 7 | PEN-009-007 | IMPLEMENTADA | BAIXA | Polling 60s MVP (SSE roadmap) |
| 8 | PENDENTE-001 | IMPLEMENTADA | MEDIA | Correcao lint codegen 3 fases (Opcao A) |

> Detalhes completos: requirements/pen-009-pendente.md

### Utilitarios

```
12   /action-plan mod-009   Atualizar este plano (re-diagnostico):            SOB DEMANDA
     --update               Preserva CHANGELOG, re-avalia todas as fases

13   /update-index          Atualizar INDEX.md apos qualquer mudanca:         SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-009

```
  [Fase 0]         [Fase 1]         [Fase 2]           [Fase 3]         [Fase 4]         [Fase 5]         [Fase 6]
  Pre-Modulo  -->  Genese     -->  Enriquecimento -->  Validacao   -->  Promocao   -->  Codegen    -->  Pos-READY
  CONCLUIDA        CONCLUIDA       CONCLUIDA           CONCLUIDA        CONCLUIDA        CONCLUIDA        SOB DEMANDA
  Epico APPROVED   Scaffold v0.1   11 agentes OK       validate-all     READY v1.0.0     70 arquivos      amendments
  5/5 features     7 tabelas       4 ADRs, 7 PEN       PASS 2026-03-22  DoR 7/7 OK       API+Web+DB       quando necessario
                                   (0 abertas)                          2026-03-23       VAL PASS 03-24

  Dependencias upstream: MOD-000 → MOD-004 → MOD-006 → MOD-009
  Camada topologica: 5
  Dependentes downstream: MOD-010 (policy CONTROLLED para movimentos)
```

## Particularidades do MOD-009

| Aspecto | Detalhe |
|---------|---------|
| Nivel de Arquitetura | Nivel 2 (DDD-lite + Full Clean) — score 6/6, todos os gatilhos presentes. Dominio rico com aggregate root ControlledMovement e 4 domain services. Todos os 6 agentes COD executados. |
| Principio "Origem nao e autorizacao" | API, integracao sistemica e MCP podem iniciar solicitacoes, mas nao contornam alcada. Toda operacao controlada passa pelo motor independente da origem. Impacto no codegen: OriginType como value object obrigatorio em todas as chamadas ao motor. |
| Ortogonalidade com MOD-006 Gates | MOD-006 Gates operam dentro de fluxos de processo (transicao de estagio). MOD-009 Movimentos operam em qualquer operacao critica (com ou sem processo). Complementares, nao concorrentes. Impacto no codegen: `case_id` e FK opcional em `controlled_movements`. |
| 4 criterios combinaveis | VALUE (valor > threshold), HIERARCHY (nivel organizacional), ORIGIN (API/MCP/AGENT sempre controlado), OBJECT+OPERATION (ex: DELETE produto). Combinacao permite alcadas complexas. Impacto no codegen: ApprovalCriteria como value object combinavel no domain. |
| Auto-aprovacao por scope | Excecao documentada a segregacao: se solicitante possui required_scope da alcada, movimento e AUTO_APPROVED sem inbox. Registrado em movement_history com event_type=AUTO_APPROVED_BY_SCOPE. ADR-002. Impacto no codegen: AutoApprovalService como domain service dedicado. |
| Override auditado | Justificativa minima 20 chars, scope approval:override, registro imutavel em movement_override_log. ADR-004. Impacto no codegen: OverrideAuditor como domain service com validacao de pre-condicoes. |
| Motor sincrono | Motor de controle avalia regras sincronamente (diferente do MOD-008 que e assincrono). Retorna 202 quando intercepta operacao. ADR-001. Impacto no codegen: ControlEngine como domain service sincrono na camada application. |
| Validacao pos-codegen | `/validate-all` executado em 2026-03-24: QA PASS, Manifests 2/2 PASS, OpenAPI PASS (14 ops), Drizzle PASS (7 tabelas), Endpoints PASS (14/14). 0 bloqueadores, 32 warnings LOW (drift spec vs impl em Drizzle, paginacao flat em OpenAPI). Execution-state atualizado com secoes codegen + validations. |

## Checklist Rapido — Validacao Pos-Codegen

- [x] Executar `/app-scaffold all` — scaffold apps/ concluido (2026-03-23)
- [x] Garantir codegen de dependencias upstream: MOD-000, MOD-004, MOD-006
- [x] Executar `/codegen mod-009` (7 agentes: DB, CORE, APP, APP-APPROVALS, API, WEB, VAL) — 70 arquivos gerados
- [x] Executar `/validate-all` pos-codegen — PASS (2026-03-24): 0 bloqueadores, 32 warnings LOW
- [x] Executar `pnpm lint` para verificar erros de compilacao — PASS (0 ESLint errors, 0 Prettier warnings — PENDENTE-001 IMPLEMENTADA)
- [x] Validacao arquitetural — PASS (DomainError+type+statusHint, Pattern A react-query, clean arch layering)
- [x] Executar `pnpm test` para validar testes unitarios — PASS (18 files, 199 tests: 10 novos MOD-009 + 8 MOD-000)

> **Nota:** Modulo READY desde 2026-03-23. Codegen completo com 70 arquivos e validacao pos-codegen aprovada. MOD-010 pode agora consumir policy CONTROLLED para movimentos via imports cross-module. Lint PASS (0 errors). Tests PASS (18 files, 199 tests — 102 novos MOD-009).

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 3.3.0 | 2026-03-24 | PENDENTE-001 decidida (Opcao A — correcao incremental 3 fases) e implementada. Lint PASS: 0 errors, 0 warnings. 8/8 pendencias IMPLEMENTADAS. |
| 3.2.0 | 2026-03-24 | Revalidacao completa: Lint PASS (0 ESLint, 10 Prettier warnings PENDENTE-001), Architecture PASS (DomainError+type+statusHint, Pattern A, clean arch), QA PASS, Manifests 2/2, OpenAPI 14 ops, Drizzle 7 tabelas+7 relations, Endpoints 14/14 (4 route files). 0 bloqueadores, 10 warnings. |
| 3.1.0 | 2026-03-24 | Atualizacao: /validate-all pos-codegen PASS (QA, Manifests 2/2, OpenAPI 14 ops, Drizzle 7 tabelas, Endpoints 14/14). 0 bloqueadores, 32 warnings LOW. Execution-state atualizado com secoes codegen + validations. Rastreio de agentes COD atualizado de "inferido" para confirmado. |
| 3.0.0 | 2026-03-24 | Atualizacao: Fase 5 CONCLUIDA (codegen completo — 69 arquivos gerados em todas as camadas API+Web+DB+OpenAPI, inferido do filesystem). Inventario detalhado de codigo por camada. Checklist atualizado para foco em validacao pos-codegen. Execution-state sem secao codegen — dados inferidos. |
| 2.1.0 | 2026-03-23 | Atualizacao: Fase 4 CONCLUIDA (modulo promovido DRAFT->READY v1.0.0 em 2026-03-23), Fase 5 (Codegen) adicionada como NAO INICIADA com rastreio de 6 agentes COD, Fase 6 (Pos-READY) renumerada, checklist atualizado para foco em codegen |
| 2.0.0 | 2026-03-23 | Recriacao: Fases 0-3 CONCLUIDAS (validate-all PASS 2026-03-22), Fase 4 PENDENTE, 0 pendencias abertas, DoR 7/7 atendido, modulo elegivel para promocao |
| 1.0.0 | 2026-03-22 | Criacao completa: Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 7 pendentes resolvidas (001-007), rastreio de 11 agentes, mapa de cobertura de 5 validadores, particularidades de dominio rico Nivel 2 |
