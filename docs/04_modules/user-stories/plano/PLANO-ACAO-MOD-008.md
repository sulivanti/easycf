# Procedimento — Plano de Acao MOD-008 Integracao Dinamica Protheus/TOTVS

> **Versao:** 7.0.0 | **Data:** 2026-03-24 | **Owner:** Marcos Sulivan
> **Estado atual do modulo:** READY (v1.0.0) | **Epico:** READY (v1.3.0) | **Features:** 5/5 READY
>
> Fases 0-5 concluidas. Codegen completo (6/6 agentes, 35 arquivos). Re-validacao completa executada (2026-03-24): WARN (0 bloqueadores, 4 ALTA inalteradas, 7 warnings). Proximo passo: corrigir 4 violacoes ALTA.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-008 | READY (v1.3.0) | DoR completo, 5 features vinculadas, heranca MOD-007 documentada |
| Features F01-F05 | 5/5 READY | F01 (Catalogo+Rotinas), F02 (Mapeamentos+Params), F03 (Motor BullMQ+Outbox+DLQ), F04 (UX Editor), F05 (UX Monitor) |
| Scaffold (forge-module) | CONCLUIDO | mod-008-integracao-protheus/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | 11/11 agentes confirmados em 4 batches (v0.5.0), 8/8 pendentes IMPLEMENTADA |
| Codegen (6 agentes) | CONCLUIDO | 6/6 agentes done, 35 arquivos gerados (2026-03-23). DB(3), CORE(8), APP(12), API(6), WEB(6), VAL(0) |
| Validacao pos-codegen | WARN | 0 bloqueadores, 4 ALTA, 7 warnings. QA PASS (45 files), Lint WARN (cross-mod), Arch WARN (DomainError), OpenAPI WARN, Drizzle PASS (6/6), Endpoint WARN, Manifest WARN |
| PENDENTEs | 0 ABERTA | 8 total: 8/8 IMPLEMENTADA (PENDENTE-004 confirmada 2026-03-23: default=10, max=20) |
| ADRs | 4 criadas (aceitas) | Nivel 2 requer minimo 3 — atendido (ADR-001 a ADR-004) |
| Amendments | 0 criados | Nenhum amendment necessario ate o momento |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v1.3.0 | Ultima entrada 2026-03-24 — validate-all WARN (re-validacao) |
| Screen Manifests | 2/2 existem | UX-INTEG-001, UX-INTEG-002 |
| Dependencias | 3 upstream (MOD-000, MOD-006, MOD-007) | Consome Foundation core, transicoes inbound, herda behavior_routines |
| Dependentes | 1 downstream (MOD-010) | MOD-010 consome integracoes externas via MCP |
| Bloqueios | 1 | BLK-004: MOD-008 bloqueado por MOD-005 (processos para rotinas de integracao) — PENDENTE |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-008 define o modulo de integracao dinamica com Protheus/TOTVS, que herda a estrutura de rotinas versionadas do MOD-007 (`behavior_routines` com `routine_type='INTEGRATION'`) e adiciona configuracao HTTP, mapeamento de campos, parametros tecnicos e um motor de execucao assincrono com garantias de entrega via Outbox Pattern + BullMQ. Score 6/6 (todos os gatilhos presentes). 6 tabelas proprias, 15 endpoints, 6 escopos, 8 domain events, 47 cenarios Gherkin.

```
1    (manual)              Revisar e finalizar epico US-MOD-008:             CONCLUIDO
                           - Escopo fechado (5 features: 3 Backend + 2 UX)  status_agil = READY
                           - Heranca MOD-007 documentada                     v1.3.0
                           - Fluxo completo Outbox -> BullMQ -> retry -> DLQ
                           - Principio de mapeamento WS Protheus definido
                           - DoR 100% completo
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-008.md

2    (manual)              Revisar e finalizar features F01-F05:             CONCLUIDO
                           - F01: API Catalogo de servicos + rotinas         5/5 READY
                           - F02: API Mapeamentos de campos e parametros
                           - F03: API Motor de execucao (BullMQ+Outbox+DLQ)
                           - F04: UX Editor de rotinas de integracao
                           - F05: UX Monitor de integracoes
```

### Fase 1: Genese do Modulo — CONCLUIDA

O scaffold do modulo foi gerado via `forge-module`, criando a estrutura completa de 6 tabelas, 15 endpoints, 5 features e 6 escopos. Modulo com integracao externa critica (Protheus/TOTVS) — unico modulo com dependencia de sistema externo.

```
3    /forge-module          Scaffold gerado:                                 CONCLUIDO
                           - mod-008-integracao-protheus/                    v0.1.0
                           - CHANGELOG.md
                           - requirements/ (BR, FR, DATA, INT, SEC, UX, NFR, PEN)
                           - adr/
                           - 6 tabelas, 15 endpoints, 5 features, 6 escopos
                           Stubs obrigatorios: DATA-003, SEC-002
```

### Fase 2: Enriquecimento — CONCLUIDA

O enriquecimento foi executado em 4 batches, com todos os 11 agentes confirmados. Das 8 pendencias identificadas, todas foram implementadas. PENDENTE-004 (limite real de concurrency do Protheus) foi confirmada em 2026-03-23 com valores default=10, max=20 conexoes simultaneas.

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
                           Resultado: v0.5.0, 4 ADRs, 8 pendentes (8 implementadas)
```

**Rastreio de agentes:**

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-008-integracao-protheus.md | CONCLUIDO | v0.2.0 — score 6/6, premissas expandidas |
| 2 | AGN-DEV-02 | BR | BR-008.md | CONCLUIDO | 12 regras de negocio com Gherkin |
| 3 | AGN-DEV-03 | FR | FR-008.md | CONCLUIDO | 11 requisitos funcionais com Gherkin |
| 4 | AGN-DEV-04 | DATA | DATA-008.md, DATA-003.md | CONCLUIDO | 6 tabelas completas, 8 domain events |
| 5 | AGN-DEV-05 | INT | INT-008.md | CONCLUIDO | 4 integracoes, 15 endpoints, contratos de erro |
| 6 | AGN-DEV-06 | SEC | SEC-008.md, SEC-002.md | CONCLUIDO | Matriz 15 endpoints x scopes, LGPD, credenciais |
| 7 | AGN-DEV-07 | UX | UX-008.md | CONCLUIDO | 2 telas detalhadas (Editor + Monitor) |
| 8 | AGN-DEV-08 | NFR | NFR-008.md | CONCLUIDO | SLOs, DLQ monitoring, concorrencia |
| 9 | AGN-DEV-09 | ADR | ADR-001 a ADR-004 | CONCLUIDO | 4 ADRs criadas |
| 10 | AGN-DEV-10 | PENDENTE | pen-008-pendente.md | CONCLUIDO | 8 pendentes identificadas |
| 11 | AGN-DEV-11 | VAL | Cross-validation | CONCLUIDO | 0 erros, 2 warnings |

**Pendentes — tabela-resumo:**

| # | ID | Status | Severidade | Decisao (1 linha) | Artefato |
|---|---|---|---|---|---|
| 1 | PENDENTE-001 | IMPLEMENTADA | ALTA | Tabela simples + trigger migracao 10M | NFR-008 §6.5 |
| 2 | PENDENTE-002 | IMPLEMENTADA | ALTA | Retencao 6 meses hot + archive S3 anonimizado | NFR-008 §10 |
| 3 | PENDENTE-003 | IMPLEMENTADA | MEDIA | Cache Redis OAuth2, lock distribuido, mid-flight expiry | INT-008 §INT-004 |
| 4 | PENDENTE-004 | IMPLEMENTADA | ALTA | Limite confirmado: default=10, max=20 (2026-03-23) | NFR-008 §5, §6.5 |
| 5 | PENDENTE-005 | IMPLEMENTADA | MEDIA | Seed automatico HML com WireMock | DATA-008 |
| 6 | PENDENTE-006 | IMPLEMENTADA | BLOQUEANTE | YAML key duplicada corrigida em ux-integ-001 | ux-integ-001.yaml |
| 7 | PENDENTE-007 | IMPLEMENTADA | MEDIA | navigate_to_case type corrigido em ux-integ-002 | ux-integ-002.yaml |
| 8 | PENDENTE-008 | IMPLEMENTADA | ALTA | Scopes integration:* registrados em DOC-FND-000 v1.8.0 | DOC-FND-000 §2.2 |

> Detalhes completos: requirements/pen-008-pendente.md

### Fase 3: Validacao — CONCLUIDA (com ressalvas pos-codegen)

A validacao pre-promocao foi executada em 2026-03-22 e todos os validadores aplicaveis passaram. As pendencias bloqueantes de manifests (PENDENTE-006, 007, 008) foram resolvidas antes da validacao final. Apos o codegen (2026-03-23), o `/validate-all` foi re-executado com resultado WARN: 0 bloqueadores, 4 violacoes ALTA e 5 MEDIA. O modulo permanece valido para operacao mas as violacoes ALTA devem ser corrigidas.

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
                           - 10 req files + 32 source files
                           - Todos os imports resolvidos
                           - IDs consistentes

5b   /validate-manifest     Validacao dos Screen Manifests:                   WARN (1/2 PASS)
                           - ux-integ-002.monitor-integracoes.yaml: PASS
                           - ux-integ-001.editor-rotinas-integ.yaml: FAIL
                             V-M01: missing update_param action (ALTA)
                             V-M02: missing view_history action (MEDIA)
                             V-M03: Both manifests lack per-status-code error granularity (MEDIA)

5c   /validate-openapi      Validacao de contratos OpenAPI:                   PASS (com warnings)
                           - 13/13 own endpoints presentes
                           - W-OAS-1: No error response schemas (ALTA)
                           - W-OAS-2: MetricsResponse orphaned (MEDIA)

5d   /validate-drizzle      Validacao de schemas Drizzle:                     PASS
                           - 6/6 tabelas validadas
                           - 21 indexes, 16 CHECKs, 0 violations

5e   /validate-endpoint     Validacao de endpoints Fastify:                   PASS (com warnings)
                           - 13/13 endpoints
                           - V-RT-1: 5 mutations lack correlation_id (ALTA)
                           - V-RT-2: routineStatus stub (ALTA)
                           - V-RT-3/4: timestamps/created_by (MEDIA)
```

**Validadores Aplicaveis — Mapa de Cobertura:**

| # | Validador | Aplicavel (nivel) | Status | Artefatos |
|---|-----------|-------------------|--------|-----------|
| 1 | /qa | SIM (todos) | PASS | Todos os .md do modulo + 32 source files |
| 2 | /validate-manifest | SIM (manifests existem) | WARN (1/2) | ux-integ-001, ux-integ-002 |
| 3 | /validate-openapi | SIM (Nivel 2) | PASS (2 warnings) | openapi/mod-008-integration-protheus.yaml |
| 4 | /validate-drizzle | SIM (Nivel 2) | PASS | integration-protheus.ts, integration-protheus.relations.ts |
| 5 | /validate-endpoint | SIM (Nivel 2) | PASS (4 warnings) | routes/services, routines, engine |

**Violacoes ALTA a corrigir:**

| # | Validador | ID | Descricao |
|---|-----------|-----|-----------|
| 1 | /validate-manifest | V-M01 | ux-integ-001 missing `update_param` action |
| 2 | /validate-openapi | W-OAS-1 | Sem error response schemas nos 13 endpoints |
| 3 | /validate-endpoint | V-RT-1 | 5 mutations sem `correlation_id` propagado |
| 4 | /validate-endpoint | V-RT-2 | `routineStatus` stub — precisa implementar logica real |

### Fase 4: Promocao — CONCLUIDA

Modulo promovido para READY (v1.0.0) em 2026-03-23 via `/promote-module`. DoR 7/7 atendido. Todas as 8 pendencias IMPLEMENTADA.

```
6    /promote-module        Promocao DRAFT -> READY:                          CONCLUIDO
                           Fluxo interno:                                     2026-03-23
                             Step 1: /qa (pre-check) — PASS
                             Step 2: Promover estado_item DRAFT->READY
                             Step 3: /qa (pos-check) — PASS
                             Step 4: /update-index
                             Step 5: /git commit
                           Resultado: READY v1.0.0 selado
```

**Gate 0 — Definition of Ready (DoR) Check:**

| # | Criterio | Status | Evidencia |
|---|----------|--------|-----------|
| DoR-1 | 0 pendentes ABERTA ou EM_ANALISE | **SIM** | 8/8 IMPLEMENTADA (PENDENTE-004 confirmada 2026-03-23) |
| DoR-2 | Todos os pilares com artefato | SIM | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1) = 10/10 |
| DoR-3 | ADRs minimos para Nivel 2 (3+) | SIM | 4 ADRs (ADR-001 a ADR-004) |
| DoR-4 | Epico READY | SIM | US-MOD-008 READY v1.3.0 |
| DoR-5 | Todas as features READY | SIM | 5/5 READY |
| DoR-6 | Screen Manifests validados | SIM | 2/2 existem (ux-integ-001, ux-integ-002) |
| DoR-7 | /qa verde | SIM | validate-all PASS 2026-03-22 |

> **Resultado:** 7/7 criterios atendidos. Modulo selado READY v1.0.0.

### Fase 5: Geracao de Codigo — CONCLUIDA

O codegen foi executado em 2026-03-23 com todos os 6 agentes concluidos e 35 arquivos gerados. Como Nivel 2 (DDD-lite + Full Clean), todos os agentes COD foram aplicaveis: DB (3 arquivos de schema Drizzle), CORE (8 arquivos de domain — value objects, entity, errors, events, service), APP (12 use cases cobrindo todos os 15 endpoints), API (6 arquivos — DTOs, 3 route files, index, OpenAPI YAML), WEB (6 arquivos — types, queries, permissions, copy, 2 screens), e VAL (validacao cruzada, 0 arquivos adicionais).

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
7a   /app-scaffold all      Criar scaffold de aplicacao:                      CONCLUIDO
                           - apps/api/ (Fastify + Drizzle + BullMQ)           2026-03-23
                           - apps/web/ (Next.js / React)
                           - package.json, tsconfig, etc.

7b   /codegen mod-008       Gerar codigo para MOD-008 (6 agentes):            CONCLUIDO
                           - 6/6 agentes done                                 2026-03-23
                           - 35 arquivos gerados
                           - Todas as camadas: DB, CORE, APP, API, WEB, VAL

7c   /validate-all          Validacao pos-codegen:                            WARN
                           - QA: PASS                                         2026-03-23
                           - Manifest: 1/2 (ux-integ-001 FAIL)
                           - OpenAPI: PASS (2 warnings)
                           - Drizzle: PASS (6/6 tabelas, 0 violations)
                           - Endpoint: PASS (4 warnings ALTA)
                           Veredicto: 0 bloqueadores, 4 ALTA, 5 MEDIA

7d   /validate-all          Re-validacao completa:                            WARN
                           - QA: PASS (45 source files)                       2026-03-24
                           - Lint: WARN (cross-module PEN-000/018)
                           - Architecture: WARN (DomainError, cross-mod)
                           - Manifest: WARN (V-M01 inalterada)
                           - OpenAPI: WARN (sem error schemas 4xx/5xx)
                           - Drizzle: PASS (6/6, 21 idx, 16 CHK, 0 viol)
                           - Endpoint: WARN (V-RT-1/V-RT-2 inalteradas)
                           Veredicto: 0 bloqueadores, 4 ALTA, 7 warnings
```

**Rastreio de agentes COD:**

| # | Agente | Camada | Path | Status | Arquivos |
|---|--------|--------|------|--------|----------|
| 1 | AGN-COD-DB | infrastructure | apps/api/db/schema/integration-protheus.ts, .relations.ts, index.ts | done (2026-03-23) | 3 |
| 2 | AGN-COD-CORE | domain | apps/api/src/modules/integration-protheus/domain/ | done (2026-03-23) | 8 |
| 3 | AGN-COD-APP | application | apps/api/src/modules/integration-protheus/application/ | done (2026-03-23) | 12 |
| 4 | AGN-COD-API | presentation | apps/api/src/modules/integration-protheus/presentation/ + openapi/ | done (2026-03-23) | 6 |
| 5 | AGN-COD-WEB | web | apps/web/src/modules/integration-protheus/ | done (2026-03-23) | 6 |
| 6 | AGN-COD-VAL | validation | (cross-layer) | done (2026-03-23) | 0 |

**Scaffold e pre-requisitos:**

- `apps/api/package.json` — EXISTE (scaffold concluido 2026-03-23)
- `apps/web/package.json` — EXISTE (scaffold concluido 2026-03-23)

**Ordem topologica e dependencias para codegen:**
MOD-008 esta na camada topologica 6. Os seguintes modulos upstream devem ter codigo gerado (ou ao menos os artefatos que MOD-008 importa):
- MOD-000 (Foundation core — auth, RBAC, domain_events)
- MOD-006 (Execucao — case_events, transicoes)
- MOD-007 (Parametrizacao — behavior_routines, heranca)

**Acoes pos-codegen pendentes:**
Apos a geracao de codigo, o `/validate-all` foi executado e retornou WARN. Ha 4 violacoes ALTA que devem ser corrigidas:
1. **V-M01** — ux-integ-001 missing `update_param` action: adicionar action no manifest
2. **W-OAS-1** — OpenAPI sem error response schemas: adicionar schemas 4xx/5xx nos 13 endpoints
3. **V-RT-1** — 5 mutations sem `correlation_id`: propagar X-Correlation-ID nas rotas de mutacao
4. **V-RT-2** — `routineStatus` stub: implementar logica real de status da rotina

### Fase 6: Pos-READY — SOB DEMANDA

```
8    /update-specification  Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY -> delega para
                           /create-amendment automaticamente

9    /create-amendment      Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
                           Caso de uso previsto: ajustes pos-go-live
                           com dados reais de integracao Protheus
```

Nenhum amendment foi necessario ate o momento. Diretorios de amendments existem mas estao vazios.

> **Nota:** MOD-008 depende de MOD-000 (Foundation), MOD-006 (Execucao) e MOD-007 (Parametrizacao). BLK-004 (MOD-008 bloqueado por MOD-005 — processos para rotinas de integracao) permanece PENDENTE. Nao bloqueia a geracao de codigo do MOD-008 diretamente, mas afeta a implementacao completa em runtime (rotinas de integracao precisam de processos do MOD-005 para serem acionadas via trigger_events).

### Gestao de Pendencias

> **Decision tree de pendencias:**
>
> ```
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-008
> ├── Criar nova pendencia     → /manage-pendentes create PEN-008
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-008 PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-008 PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-008 PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-008 PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-008
> ```

```
10   /manage-pendentes list PEN-008
                           Estado atual MOD-008:
                             PEN-008: 8 itens total
                               8 IMPLEMENTADA (001-008)
                               0 ABERTA
                             SLA: nenhum vencido
                             BLOQUEIO: nenhum
```

**Pendencias — resumo compacto:**

| # | ID | Status | Severidade | Decisao (1 linha) |
|---|---|---|---|---|
| 1 | PENDENTE-001 | IMPLEMENTADA | ALTA | Tabela simples + trigger migracao 10M |
| 2 | PENDENTE-002 | IMPLEMENTADA | ALTA | Retencao 6m hot + archive S3 anonimizado |
| 3 | PENDENTE-003 | IMPLEMENTADA | MEDIA | Cache Redis OAuth2 com lock distribuido |
| 4 | PENDENTE-004 | IMPLEMENTADA | ALTA | Limite confirmado default=10, max=20 (2026-03-23) |
| 5 | PENDENTE-005 | IMPLEMENTADA | MEDIA | Seed automatico HML com WireMock |
| 6 | PENDENTE-006 | IMPLEMENTADA | BLOQUEANTE | YAML key duplicada corrigida |
| 7 | PENDENTE-007 | IMPLEMENTADA | MEDIA | Action type corrigido |
| 8 | PENDENTE-008 | IMPLEMENTADA | ALTA | Scopes integration:* em DOC-FND-000 |

> Detalhes completos: requirements/pen-008-pendente.md

### Utilitarios

```
     /update-index          Atualizar INDEX.md apos mudancas:                 SOB DEMANDA
     /qa                    Re-validar apos qualquer edicao:                  SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-008

```
  [Fase 0]         [Fase 1]         [Fase 2]           [Fase 3]         [Fase 4]       [Fase 5]         [Fase 6]
  Pre-Modulo  -->  Genese     -->  Enriquecimento -->  Validacao   -->  Promocao  -->  Codegen     -->  Pos-READY
  CONCLUIDA        CONCLUIDA       CONCLUIDA           CONCLUIDA        CONCLUIDA      CONCLUIDA        SOB DEMANDA
  Epico READY      Scaffold v0.1   11 agentes OK       validate-all     READY v1.0.0   6/6 agentes      amendments
  5/5 READY        6 tabelas       4 ADRs, 8 PEN       WARN (pos-cod)   2026-03-23     35 arquivos      quando necessario
                                   (8 IMPLEMENTADA)    4 ALTA a corr.                  2026-03-23
                                                       ================
                                                       >>> CORRIGIR <<<

  Dependencias upstream: MOD-000 → MOD-006 → MOD-007 (heranca)
  Camada topologica: 6
  Bloqueio externo: BLK-004 (MOD-005 → processos para rotinas integracao) — PENDENTE
  Dependentes downstream: MOD-010 (integracoes externas via MCP)
```

## Particularidades do MOD-008

| Aspecto | Detalhe |
|---------|---------|
| Nivel de Arquitetura | Nivel 2 (DDD-lite + Full Clean) — score 6/6, todos os gatilhos presentes. Unico modulo com integracao externa critica (Protheus/TOTVS). Isso significa que todos os 6 agentes COD sao aplicaveis e a complexidade de codegen e a mais alta entre os modulos. |
| Heranca MOD-007 | Herda behavior_routines com routine_type=INTEGRATION. Versionamento imutavel (DRAFT->PUBLISHED->DEPRECATED), fork com copia. Tabela auxiliar integration_routines via extensao 1:1 (ADR-003). O codegen do MOD-008 depende de tabelas e tipos do MOD-007 ja estarem gerados. |
| Outbox Pattern | Garantia de entrega: INSERT call_log dentro da transacao de negocio (atomicidade). BullMQ dedupe via jobId = call_log.id. Retry backoff exponencial. DLQ governada com justificativa obrigatoria. ADR-001, ADR-002. A camada domain (AGN-COD-CORE) modelou o ciclo de vida completo: QUEUED->RUNNING->SUCCESS/FAILED->DLQ->REPROCESSED. |
| Credenciais criptografadas | auth_config em AES-256 via secret do ambiente. Nunca retornadas em GET. Mascaradas em logs e domain events. ADR-004. Impacta o AGN-COD-DB (campo JSONB com crypto) e AGN-COD-API (mascaramento em serialization). |
| PENDENTE-004 (resolvida) | Limite real confirmado pelo time Protheus em 2026-03-23: INTEGRATION_CONCURRENCY default=10, max=20 conexoes simultaneas. NFR-008 atualizado com valores concretos. Dado importante para configuracao do worker BullMQ no codegen. |
| BLK-004 | Bloqueio externo: MOD-005 (processos) precisa prover blueprints para rotinas de integracao. Nao bloqueia promocao nem codegen do MOD-008, mas afeta testes E2E que dependem de trigger_events por transicao de estagio. |
| OAuth2 com Redis | Cache de token em Redis com TTL=expires_in-60s, lock distribuido via SET NX EX, interceptor de 401 para mid-flight expiry. Decisao PENDENTE-003. Implementado no AGN-COD-APP (use case execute-integration). |
| Validacao pos-codegen | WARN com 4 ALTA: faltam error schemas OpenAPI, correlation_id em 5 mutations, routineStatus stub, e action update_param no manifest ux-integ-001. Nenhum e bloqueante, mas devem ser corrigidos antes do go-live. |

## Checklist Rapido — Pos-Codegen

- [x] Executar `/app-scaffold all` — scaffold apps/ concluido (2026-03-23)
- [x] Executar `pnpm install` — dependencias instaladas (2026-03-23)
- [x] Executar `/codegen mod-008` — 6/6 agentes done, 35 arquivos (2026-03-23)
- [x] Revisar apps/api — DB(3) + CORE(8) + APP(12) + API(6) concluidos
- [x] Revisar apps/web — WEB(6) concluido (2 screens: RoutineEditor + IntegrationMonitor)
- [x] Executar `/validate-all` — WARN (0 bloqueadores, 4 ALTA, 5 MEDIA)
- [ ] Corrigir V-M01: adicionar action `update_param` em ux-integ-001 manifest
- [ ] Corrigir W-OAS-1: adicionar error response schemas (4xx/5xx) nos 13 endpoints OpenAPI
- [ ] Corrigir V-RT-1: propagar `X-Correlation-ID` nas 5 mutations sem correlation_id
- [ ] Corrigir V-RT-2: implementar logica real de `routineStatus` (remover stub)
- [ ] Re-executar `/validate-all` — confirmar 0 ALTA apos correcoes
- [ ] Executar `pnpm lint` — verificar lint sem erros
- [ ] Executar `pnpm test` — verificar testes passando

> **Nota:** MOD-008 esta na camada topologica 6. As 4 violacoes ALTA sao corrigiveis sem impacto em outros modulos. Apos correcao e re-validacao, o modulo estara pronto para testes de integracao. O bloqueio BLK-004 (MOD-005) afeta apenas testes E2E com trigger_events reais. O dependente downstream MOD-010 (MCP) pode iniciar codegen independentemente — consome apenas os tipos e endpoints do MOD-008.

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 7.0.0 | 2026-03-24 | Re-validacao completa (/validate-all): WARN mantido — 4 ALTA inalteradas, 7 warnings (inclui lint cross-mod e DomainError). Drizzle PASS (6/6). QA PASS (45 files). Nenhum novo bloqueador. |
| 6.0.0 | 2026-03-24 | Atualizacao: Fase 5 (Codegen) promovida para CONCLUIDA — 6/6 agentes done, 35 arquivos gerados (2026-03-23). Validacao pos-codegen executada: WARN (0 bloqueadores, 4 ALTA, 5 MEDIA). Checklist atualizado de Codegen para Pos-Codegen com itens de correcao pendentes. Rastreio de agentes COD preenchido com dados reais do execution-state. |
| 5.0.0 | 2026-03-23 | Atualizacao: Epico promovido APPROVED→READY v1.3.0, features F01-F05 promovidas APPROVED→READY v1.2.0. Execution state atualizado com secao promotion. CHANGELOG E5 mermaid verde. INDEX.md atualizado. |
| 4.0.0 | 2026-03-23 | Atualizacao: adicionada Fase 5 (Geracao de Codigo) com status NAO INICIADA — scaffold de aplicacao inexistente, rastreio de 6 agentes COD, pre-requisitos topologicos. Checklist atualizado de Pos-READY para Codegen. Todas as 8 pendentes confirmadas IMPLEMENTADA. |
| 3.0.0 | 2026-03-23 | Fase 4 CONCLUIDA — READY v1.0.0 selado (commit a61efb9). Resumo visual e checklist atualizados |
| 2.1.0 | 2026-03-23 | PENDENTE-004 → IMPLEMENTADA (limite Protheus confirmado: default=10, max=20). DoR 7/7 atendido. Fase 4 desbloqueada — pronto para /promote-module |
| 2.0.0 | 2026-03-23 | Recriacao: Fases 0-3 CONCLUIDAS (validate-all PASS 2026-03-22), Fase 4 BLOQUEADA por PENDENTE-004 (1 ABERTA), PENDENTE-006/007/008 agora IMPLEMENTADA, DoR 6/7 (DoR-1 falha), BLK-004 documentado |
| 1.0.0 | 2026-03-22 | Criacao completa: Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 5 pendentes resolvidas (001-005), rastreio de agentes, mapa de cobertura de validadores, particularidades Outbox/BullMQ/DLQ/heranca MOD-007 |
