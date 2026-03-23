# Procedimento — Plano de Acao MOD-008 Integracao Dinamica Protheus/TOTVS

> **Versao:** 4.0.0 | **Data:** 2026-03-23 | **Owner:** Marcos Sulivan
> **Estado atual do modulo:** READY (v1.0.0) | **Epico:** APPROVED (v1.2.0) | **Features:** 5/5 APPROVED
>
> Fases 0-4 concluidas. Modulo promovido para READY em 2026-03-23 (commit a61efb9). Fase 5 (Geracao de Codigo) NAO INICIADA — scaffold de aplicacao inexistente (`apps/api/`, `apps/web/` nao encontrados). Proximo passo: executar `/app-scaffold all` para criar a estrutura de aplicacao, depois `/codegen mod-008`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-008 | APPROVED (v1.2.0) | DoR completo, 5 features vinculadas, heranca MOD-007 documentada |
| Features F01-F05 | 5/5 APPROVED | F01 (Catalogo+Rotinas), F02 (Mapeamentos+Params), F03 (Motor BullMQ+Outbox+DLQ), F04 (UX Editor), F05 (UX Monitor) |
| Scaffold (forge-module) | CONCLUIDO | mod-008-integracao-protheus/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | 11/11 agentes confirmados em 4 batches (v0.5.0), 8/8 pendentes IMPLEMENTADA |
| Codegen (6 agentes) | NAO INICIADO | Scaffold de aplicacao inexistente (apps/api/ e apps/web/ nao encontrados). Executar `/app-scaffold all` primeiro. |
| PENDENTEs | 0 ABERTA | 8 total: 8/8 IMPLEMENTADA (PENDENTE-004 confirmada 2026-03-23: default=10, max=20) |
| ADRs | 4 criadas (aceitas) | Nivel 2 requer minimo 3 — atendido (ADR-001 a ADR-004) |
| Amendments | 0 criados | Diretorios de amendments existem (br, data, fr, int, nfr, sec, ux) mas vazios |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v1.0.0 | Ultima entrada 2026-03-23 — Etapa 5 (Selo READY) |
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
                           - Escopo fechado (5 features: 3 Backend + 2 UX)  status_agil = APPROVED
                           - Heranca MOD-007 documentada                     v1.2.0
                           - Fluxo completo Outbox -> BullMQ -> retry -> DLQ
                           - Principio de mapeamento WS Protheus definido
                           - DoR 100% completo
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-008.md

2    (manual)              Revisar e finalizar features F01-F05:             CONCLUIDO
                           - F01: API Catalogo de servicos + rotinas         5/5 APPROVED
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

### Fase 3: Validacao — CONCLUIDA

O `/validate-all` foi executado em 2026-03-22 e todos os validadores aplicaveis passaram. As pendencias bloqueantes de manifests (PENDENTE-006 YAML duplicada, PENDENTE-007 action type, PENDENTE-008 scopes) foram resolvidas antes da validacao final.

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
                           - ux-integ-001.editor-rotinas-integ.yaml: PASS
                           - ux-integ-002.monitor-integracoes.yaml: PASS
                           - Gates 1-3 verdes (YAML valido, actions consistentes, scopes registrados)

5c   /validate-openapi      Validacao de contratos OpenAPI:                   FUTURO (pos-codigo)
                           Artefato: apps/api/openapi/mod-008-integracao-protheus.yaml
                           Aplicavel (Nivel 2), mas arquivo de codigo nao existe ainda

5d   /validate-drizzle      Validacao de schemas Drizzle:                     FUTURO (pos-codigo)
                           Artefato: apps/api/src/modules/integration-protheus/schema.ts
                           Aplicavel (Nivel 2), mas arquivo de codigo nao existe ainda

5e   /validate-endpoint     Validacao de endpoints Fastify:                   FUTURO (pos-codigo)
                           Artefato: apps/api/src/modules/integration-protheus/routes/
                           Aplicavel (Nivel 2), mas arquivo de codigo nao existe ainda
```

**Validadores Aplicaveis — Mapa de Cobertura:**

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | /qa | SIM (todos) | SIM — PASS | Todos os .md do modulo |
| 2 | /validate-manifest | SIM (manifests existem) | SIM — PASS | ux-integ-001, ux-integ-002 |
| 3 | /validate-openapi | SIM (Nivel 2) | NAO — FUTURO (pos-codigo) | openapi/mod-008-*.yaml |
| 4 | /validate-drizzle | SIM (Nivel 2) | NAO — FUTURO (pos-codigo) | schema.ts |
| 5 | /validate-endpoint | SIM (Nivel 2) | NAO — FUTURO (pos-codigo) | routes/*.route.ts |

### Fase 4: Promocao — CONCLUIDA

Modulo promovido para READY (v1.0.0) em 2026-03-23 via `/promote-module`. DoR 7/7 atendido. Todas as 8 pendencias IMPLEMENTADA. Commit: a61efb9.

```
6    /promote-module        Promocao DRAFT -> READY:                          CONCLUIDO
                           Fluxo interno:                                     commit a61efb9
                             Step 1: /qa (pre-check) — PASS                  2026-03-23
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
| DoR-4 | Epico APPROVED | SIM | US-MOD-008 APPROVED v1.2.0 |
| DoR-5 | Todas as features APPROVED | SIM | 5/5 APPROVED |
| DoR-6 | Screen Manifests validados | SIM | 2/2 PASS (ux-integ-001, ux-integ-002) |
| DoR-7 | /qa verde | SIM | validate-all PASS 2026-03-22 |

> **Resultado:** 7/7 criterios atendidos. Modulo selado READY v1.0.0.

### Fase 5: Geracao de Codigo — NAO INICIADA

O modulo esta READY (pre-requisito para codegen atendido), porem o scaffold de aplicacao (apps/api/ e apps/web/) nao existe ainda. E necessario executar `/app-scaffold all` primeiro para criar a estrutura monorepo, e depois `/codegen mod-008` para gerar o codigo em todas as 6 camadas. Como Nivel 2 (DDD-lite + Full Clean), todos os 6 agentes COD sao aplicaveis.

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
7a   /app-scaffold all      Criar scaffold de aplicacao:                      A EXECUTAR
                           - apps/api/ (Fastify + Drizzle + BullMQ)
                           - apps/web/ (Next.js / React)
                           - package.json, tsconfig, etc.
                           Pre-requisito one-time para todos os modulos

7b   /codegen mod-008       Gerar codigo para MOD-008 (6 agentes):            A EXECUTAR
                           Requer: 7a concluido
                           Nivel 2 → todos os 6 agentes aplicaveis
                           Slug esperado: integration-protheus
                           Camadas: DB, CORE, APP, API, WEB, VAL
```

**Rastreio de agentes COD:**

| # | Agente | Camada | Path | Status | Arquivos |
|---|--------|--------|------|--------|----------|
| 1 | AGN-COD-DB | infrastructure | apps/api/src/modules/integration-protheus/infrastructure/ | A EXECUTAR | 0 |
| 2 | AGN-COD-CORE | domain | apps/api/src/modules/integration-protheus/domain/ | A EXECUTAR | 0 |
| 3 | AGN-COD-APP | application | apps/api/src/modules/integration-protheus/application/ | A EXECUTAR | 0 |
| 4 | AGN-COD-API | presentation | apps/api/src/modules/integration-protheus/presentation/ | A EXECUTAR | 0 |
| 5 | AGN-COD-WEB | web | apps/web/src/modules/integration-protheus/ | A EXECUTAR | 0 |
| 6 | AGN-COD-VAL | validation | (cross-layer) | A EXECUTAR | 0 |

**Scaffold e pre-requisitos:**

- `apps/api/package.json` — NAO ENCONTRADO (scaffold inexistente)
- `apps/web/package.json` — NAO ENCONTRADO (scaffold inexistente)
- Comando: `/app-scaffold all` (one-time, cria ambos apps)

**Ordem topologica e dependencias para codegen:**
MOD-008 esta na camada topologica 6. Antes de gerar codigo para MOD-008, os seguintes modulos upstream devem ter codigo gerado (ou ao menos os artefatos que MOD-008 importa):
- MOD-000 (Foundation core — auth, RBAC, domain_events)
- MOD-006 (Execucao — case_events, transicoes)
- MOD-007 (Parametrizacao — behavior_routines, heranca)

**Validacao pos-codegen:**
Apos a geracao de codigo, os validadores 5c/5d/5e (OpenAPI, Drizzle, Endpoint) tornam-se executaveis. Re-executar `/validate-all` para confirmar conformidade.

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

Diretorios de amendments ja existem (br, data, fr, int, nfr, sec, ux) mas estao vazios. Nenhum amendment foi necessario ate o momento.

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
  CONCLUIDA        CONCLUIDA       CONCLUIDA           CONCLUIDA        CONCLUIDA      NAO INICIADA     SOB DEMANDA
  Epico APPROVED   Scaffold v0.1   11 agentes OK       validate-all     READY v1.0.0   scaffold apps/   amendments
  5/5 features     6 tabelas       4 ADRs, 8 PEN       PASS 2026-03-22  a61efb9        nao existe       quando necessario
                                   (8 IMPLEMENTADA)                     2026-03-23     ================
                                                                                       >>> PROXIMO <<<

  Dependencias upstream: MOD-000 → MOD-006 → MOD-007 (heranca)
  Camada topologica: 6
  Bloqueio externo: BLK-004 (MOD-005 → processos para rotinas integracao) — PENDENTE
  Dependentes downstream: MOD-010 (integracoes externas via MCP)
```

## Particularidades do MOD-008

| Aspecto | Detalhe |
|---------|---------|
| Nivel de Arquitetura | Nivel 2 (DDD-lite + Full Clean) — score 6/6, todos os gatilhos presentes. Unico modulo com integracao externa critica (Protheus/TOTVS). Isso significa que todos os 6 agentes COD sao aplicaveis e a complexidade de codegen e a mais alta entre os modulos. |
| Heranca MOD-007 | Herda behavior_routines com routine_type=INTEGRATION. Versionamento imutavel (DRAFT->PUBLISHED->DEPRECATED), fork com copia. Tabela auxiliar integration_routines via extensao 1:1 (ADR-003). Implica que o codegen do MOD-008 depende de tabelas e tipos do MOD-007 ja estarem gerados. |
| Outbox Pattern | Garantia de entrega: INSERT call_log dentro da transacao de negocio (atomicidade). BullMQ dedupe via jobId = call_log.id. Retry backoff exponencial. DLQ governada com justificativa obrigatoria. ADR-001, ADR-002. A camada domain (AGN-COD-CORE) devera modelar o ciclo de vida completo: QUEUED->RUNNING->SUCCESS/FAILED->DLQ->REPROCESSED. |
| Credenciais criptografadas | auth_config em AES-256 via secret do ambiente. Nunca retornadas em GET. Mascaradas em logs e domain events. ADR-004. Impacta diretamente o AGN-COD-DB (campo JSONB com crypto) e AGN-COD-API (mascaramento em serialization). |
| PENDENTE-004 (resolvida) | Limite real confirmado pelo time Protheus em 2026-03-23: INTEGRATION_CONCURRENCY default=10, max=20 conexoes simultaneas. NFR-008 atualizado com valores concretos. Dado importante para configuracao do worker BullMQ no codegen. |
| BLK-004 | Bloqueio externo: MOD-005 (processos) precisa prover blueprints para rotinas de integracao. Nao bloqueia promocao nem codegen do MOD-008, mas afeta testes E2E que dependem de trigger_events por transicao de estagio. |
| OAuth2 com Redis | Cache de token em Redis com TTL=expires_in-60s, lock distribuido via SET NX EX, interceptor de 401 para mid-flight expiry. Decisao PENDENTE-003. Impacta o AGN-COD-APP (use case de execucao deve implementar o fluxo OAuth2). |

## Checklist Rapido — O que Falta para Codegen

- [ ] Executar `/app-scaffold all` — criar apps/api/ e apps/web/ (one-time para todo o monorepo)
- [ ] Executar `/codegen mod-008` — gerar codigo nas 6 camadas (DB, CORE, APP, API, WEB, VAL)
- [ ] Re-executar `/validate-all` — validar OpenAPI, Drizzle e Endpoints pos-codegen
- [ ] Verificar dependencias upstream: MOD-000, MOD-006, MOD-007 devem ter codigo gerado antes ou em paralelo

> **Nota:** MOD-008 esta na camada topologica 6. Se usando `/codegen-all`, a ordem topologica e respeitada automaticamente. Se usando `/codegen mod-008` isoladamente, garantir que os modulos upstream ja tenham codigo gerado para evitar erros de import.

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 4.0.0 | 2026-03-23 | Atualizacao: adicionada Fase 5 (Geracao de Codigo) com status NAO INICIADA — scaffold de aplicacao inexistente, rastreio de 6 agentes COD, pre-requisitos topologicos. Checklist atualizado de Pos-READY para Codegen. Todas as 8 pendentes confirmadas IMPLEMENTADA. |
| 3.0.0 | 2026-03-23 | Fase 4 CONCLUIDA — READY v1.0.0 selado (commit a61efb9). Resumo visual e checklist atualizados |
| 2.1.0 | 2026-03-23 | PENDENTE-004 → IMPLEMENTADA (limite Protheus confirmado: default=10, max=20). DoR 7/7 atendido. Fase 4 desbloqueada — pronto para /promote-module |
| 2.0.0 | 2026-03-23 | Recriacao: Fases 0-3 CONCLUIDAS (validate-all PASS 2026-03-22), Fase 4 BLOQUEADA por PENDENTE-004 (1 ABERTA), PENDENTE-006/007/008 agora IMPLEMENTADA, DoR 6/7 (DoR-1 falha), BLK-004 documentado |
| 1.0.0 | 2026-03-22 | Criacao completa: Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 5 pendentes resolvidas (001-005), rastreio de agentes, mapa de cobertura de validadores, particularidades Outbox/BullMQ/DLQ/heranca MOD-007 |
