# Procedimento — Plano de Acao MOD-008 Integracao Dinamica Protheus/TOTVS

> **Versao:** 3.0.0 | **Data:** 2026-03-23 | **Owner:** Marcos Sulivan
> **Estado atual do modulo:** READY (v1.0.0) | **Epico:** READY (v1.0.0) | **Features:** 5/5 READY
>
> Fases 0-4 concluidas. Modulo promovido para READY em 2026-03-23 (commit a61efb9). Selo imutavel — alteracoes futuras via `/create-amendment`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-008 | APPROVED (v1.2.0) | DoR completo, 5 features vinculadas, heranca MOD-007 documentada |
| Features F01-F05 | 5/5 APPROVED | F01 (Catalogo+Rotinas), F02 (Mapeamentos+Params), F03 (Motor BullMQ+Outbox+DLQ), F04 (UX Editor), F05 (UX Monitor) |
| Scaffold (forge-module) | CONCLUIDO | mod-008-integracao-protheus/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | Agentes 01-11 confirmados em 4 batches, v0.7.0, 7/8 pendentes resolvidas |
| PENDENTEs | 0 ABERTA | 8 total: 8/8 IMPLEMENTADA (PENDENTE-004 resolvida 2026-03-23: default=10, max=20) |
| ADRs | 4 criadas | Nivel 2 requer minimo 3 — atendido (ADR-001 a ADR-004) |
| Amendments | 0 | Nenhum |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v0.7.0 | Ultima entrada 2026-03-19 |
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

O enriquecimento foi executado em 4 batches, com todos os 11 agentes confirmados. Das 8 pendencias identificadas, 7 foram implementadas. PENDENTE-004 (limite real de concurrency do Protheus) permanece ABERTA — e uma dependencia externa (tipo DEP-EXT) que requer informacao do time Protheus. Nao bloqueia enriquecimento nem validacao, mas bloqueia promocao (DoR-1).

> **Decision tree de enriquecimento:**
> Quero enriquecer todos os modulos elegiveis?
> |- SIM -> /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> |-- NAO -> Qual escopo?
>     |- Todos agentes de 1 modulo  -> /enrich mod-NNN
>     |-- 1 agente especifico        -> /enrich-agent AGN-DEV-XX mod-NNN

```
4    /enrich                Enriquecimento completo (11 agentes):            CONCLUIDO
                           Batch 1: AGN-DEV-01 (MOD/Escala), AGN-DEV-02 (BR), AGN-DEV-03 (FR)
                           Batch 2: AGN-DEV-04 (DATA), AGN-DEV-05 (INT), AGN-DEV-08 (NFR)
                           Batch 3: AGN-DEV-06 (SEC), AGN-DEV-07 (UX)
                           Batch 4: AGN-DEV-09 (ADR), AGN-DEV-10 (PENDENTE), AGN-DEV-11 (VAL)
                           Resultado: v0.7.0, 4 ADRs, 8 pendentes (7 implementadas, 1 aberta)
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

| # | ID | Status | Severidade | Decisao (1 linha) |
|---|---|---|---|---|
| 1 | PENDENTE-001 | IMPLEMENTADA | ALTA | Tabela simples + trigger migracao 10M |
| 2 | PENDENTE-002 | IMPLEMENTADA | ALTA | Retencao 6 meses hot + archive S3 anonimizado |
| 3 | PENDENTE-003 | IMPLEMENTADA | MEDIA | Cache Redis OAuth2, lock distribuido, mid-flight expiry |
| 4 | ~~PENDENTE-004~~ | IMPLEMENTADA | ALTA | Limite confirmado: default=10, max=20 (2026-03-23) |
| 5 | PENDENTE-005 | IMPLEMENTADA | MEDIA | Seed automatico HML com WireMock |
| 6 | PENDENTE-006 | IMPLEMENTADA | BLOQUEANTE | YAML key duplicada corrigida em ux-integ-001 |
| 7 | PENDENTE-007 | IMPLEMENTADA | MEDIA | navigate_to_case type corrigido em ux-integ-002 |
| 8 | PENDENTE-008 | IMPLEMENTADA | ALTA | Scopes integration:* registrados em DOC-FND-000 v1.8.0 |

> Detalhes completos: requirements/pen-008-pendente.md

### Fase 3: Validacao — CONCLUIDA

O `/validate-all` foi executado em 2026-03-22 e todos os validadores aplicaveis passaram. As pendencias bloqueantes de manifests (PENDENTE-006 YAML duplicada, PENDENTE-007 action type, PENDENTE-008 scopes) foram resolvidas antes da validacao final. PENDENTE-004 (concurrency Protheus) e uma questao de infraestrutura que nao afeta validacao de artefatos.

> **Decision tree de validacao:**
> Quero validar tudo de uma vez?
> |- SIM -> /validate-all (orquestra todos, pula os que nao tem artefato)
> |-- NAO -> Qual pilar?
>     |- Sintaxe/links/metadados -> /qa
>     |- Screen manifests       -> /validate-manifest
>     |- Contratos OpenAPI      -> /validate-openapi
>     |- Schemas Drizzle        -> /validate-drizzle
>     |-- Endpoints Fastify      -> /validate-endpoint

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
                           Artefato: src/modules/integration-protheus/schema.ts
                           Aplicavel (Nivel 2), mas arquivo de codigo nao existe ainda

5e   /validate-endpoint     Validacao de endpoints Fastify:                   FUTURO (pos-codigo)
                           Artefato: src/modules/integration-protheus/routes/
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
| DoR-1 | 0 pendentes ABERTA ou EM_ANALISE | **SIM** | 8/8 IMPLEMENTADA (PENDENTE-004 resolvida 2026-03-23) |
| DoR-2 | Todos os pilares com artefato | SIM | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1) = 10/10 |
| DoR-3 | ADRs minimos para Nivel 2 (3+) | SIM | 4 ADRs (ADR-001 a ADR-004) |
| DoR-4 | Epico APPROVED | SIM | US-MOD-008 APPROVED v1.2.0 |
| DoR-5 | Todas as features APPROVED | SIM | 5/5 APPROVED |
| DoR-6 | Screen Manifests validados | SIM | 2/2 PASS (ux-integ-001, ux-integ-002) |
| DoR-7 | /qa verde | SIM | validate-all PASS 2026-03-22 |

> **Resultado:** 7/7 criterios atendidos. Modulo elegivel para promocao imediata.

**Bloqueadores para Promocao:**

Nenhum. Todos resolvidos. Modulo selado READY v1.0.0.

### Fase 5: Pos-READY — SOB DEMANDA

```
7    /update-specification  Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY -> delega para
                           /create-amendment automaticamente

8    /create-amendment      Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
                           Caso de uso previsto: ajustes pos-go-live
                           com dados reais de integracao Protheus
```

> **Nota:** MOD-008 depende de MOD-000 (Foundation), MOD-006 (Execucao) e MOD-007 (Parametrizacao). A promocao do MOD-008 pode ocorrer independentemente — o DoR nao exige que dependencias upstream estejam READY (apenas que existam). Porem, BLK-004 (MOD-008 bloqueado por MOD-005 — processos para rotinas de integracao) deve ser monitorado. A geracao de codigo so pode ocorrer quando MOD-007 estiver READY (heranca de behavior_routines).

### Gestao de Pendencias

> **Decision tree de pendencias:**
> O que preciso fazer com pendencias?
> |- Ver situacao atual       -> /manage-pendentes list PEN-008
> |- Criar nova pendencia     -> /manage-pendentes create PEN-008
> |- Analisar opcoes          -> /manage-pendentes analyze PEN-008 PENDENTE-XXX
> |- Registrar decisao        -> /manage-pendentes decide PEN-008 PENDENTE-XXX opcao=X
> |- Implementar decisao      -> /manage-pendentes implement PEN-008 PENDENTE-XXX
> |- Cancelar pendencia       -> /manage-pendentes cancel PEN-008 PENDENTE-XXX
> |-- Relatorio consolidado    -> /manage-pendentes report PEN-008

```
9    /manage-pendentes list PEN-008
                           Estado atual MOD-008:
                             PEN-008: 8 itens total
                               7 IMPLEMENTADA (001-003, 005-008)
                               1 ABERTA (PENDENTE-004)
                             SLA: nenhum vencido
                             BLOQUEIO: PENDENTE-004 bloqueia DoR-1
```

**Pendencias — resumo compacto:**

| # | ID | Status | Severidade | Decisao (1 linha) |
|---|---|---|---|---|
| 1 | PENDENTE-001 | IMPLEMENTADA | ALTA | Tabela simples + trigger migracao 10M |
| 2 | PENDENTE-002 | IMPLEMENTADA | ALTA | Retencao 6m hot + archive S3 anonimizado |
| 3 | PENDENTE-003 | IMPLEMENTADA | MEDIA | Cache Redis OAuth2 com lock distribuido |
| 4 | ~~PENDENTE-004~~ | IMPLEMENTADA | ALTA | Limite confirmado default=10, max=20 (2026-03-23) |
| 5 | PENDENTE-005 | IMPLEMENTADA | MEDIA | Seed automatico HML com WireMock |
| 6 | PENDENTE-006 | IMPLEMENTADA | BLOQUEANTE | YAML key duplicada corrigida |
| 7 | PENDENTE-007 | IMPLEMENTADA | MEDIA | Action type corrigido |
| 8 | PENDENTE-008 | IMPLEMENTADA | ALTA | Scopes integration:* em DOC-FND-000 |

> Detalhes completos: requirements/pen-008-pendente.md

---

## Resumo Visual do Fluxo MOD-008

```
  [Fase 0]         [Fase 1]         [Fase 2]           [Fase 3]         [Fase 4]       [Fase 5]
  Pre-Modulo  -->  Genese     -->  Enriquecimento -->  Validacao   -->  Promocao  -->  Pos-READY
  CONCLUIDA        CONCLUIDA       CONCLUIDA           CONCLUIDA        CONCLUIDA      SOB DEMANDA
  Epico APPROVED   Scaffold v0.1   11 agentes OK       validate-all     READY v1.0.0   amendments
  5/5 features     6 tabelas       4 ADRs, 8 PEN       PASS 2026-03-22  a61efb9        quando necessario
                                   (8 IMPLEMENTADA)                     2026-03-23

  Dependencias upstream: MOD-000 -> MOD-006 -> MOD-007 (heranca)
  Camada topologica: 6
  Bloqueio externo: BLK-004 (MOD-005 -> processos para rotinas integracao)
  Dependentes downstream: MOD-010 (integracoes externas via MCP)
```

## Particularidades do MOD-008

| Aspecto | Detalhe |
|---------|---------|
| Nivel de Arquitetura | Nivel 2 (DDD-lite + Full Clean) — score 6/6, todos os gatilhos presentes. Unico modulo com integracao externa critica (Protheus/TOTVS). |
| Heranca MOD-007 | Herda behavior_routines com routine_type=INTEGRATION. Versionamento imutavel (DRAFT->PUBLISHED->DEPRECATED), fork com copia. Tabela auxiliar routine_integration_config via extensao 1:1 (ADR-003). |
| Outbox Pattern | Garantia de entrega: INSERT call_log dentro da transacao de negocio (atomicidade). BullMQ dedupe via jobId = call_log.id. Retry backoff exponencial. DLQ governada com justificativa obrigatoria. ADR-001, ADR-002. |
| Credenciais criptografadas | auth_config em AES-256 via secret do ambiente. Nunca retornadas em GET. Mascaradas em logs e domain events. ADR-004. |
| PENDENTE-004 (resolvida) | Limite real confirmado pelo time Protheus: INTEGRATION_CONCURRENCY default=10, max=20. NFR-008 atualizado. Nao bloqueia mais a promocao. |
| BLK-004 | Bloqueio externo: MOD-005 (processos) precisa prover blueprints para rotinas de integracao. Nao bloqueia promocao do MOD-008, mas afeta implementacao. |
| OAuth2 com Redis | Cache de token em Redis com TTL=expires_in-60s, lock distribuido via SET NX EX, interceptor de 401 para mid-flight expiry. Decisao PENDENTE-003. |

## Checklist Rapido — Status READY

- [x] Resolver PENDENTE-004 (limite concurrency Protheus) — confirmado default=10, max=20
- [x] Executar `/promote-module mod-008` (Fase 4) — READY v1.0.0 (commit a61efb9)

> **Modulo selado.** READY v1.0.0 em 2026-03-23. Alteracoes futuras via `/create-amendment`.

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 3.0.0 | 2026-03-23 | Fase 4 CONCLUIDA — READY v1.0.0 selado (commit a61efb9). Resumo visual e checklist atualizados |
| 2.1.0 | 2026-03-23 | PENDENTE-004 → IMPLEMENTADA (limite Protheus confirmado: default=10, max=20). DoR 7/7 atendido. Fase 4 desbloqueada — pronto para /promote-module |
| 2.0.0 | 2026-03-23 | Recriacao: Fases 0-3 CONCLUIDAS (validate-all PASS 2026-03-22), Fase 4 BLOQUEADA por PENDENTE-004 (1 ABERTA), PENDENTE-006/007/008 agora IMPLEMENTADA, DoR 6/7 (DoR-1 falha), BLK-004 documentado |
| 1.0.0 | 2026-03-22 | Criacao completa: Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 5 pendentes resolvidas (001-005), rastreio de agentes, mapa de cobertura de validadores, particularidades Outbox/BullMQ/DLQ/heranca MOD-007 |
