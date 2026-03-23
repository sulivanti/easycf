# Procedimento — Plano de Acao MOD-010 MCP e Automacao Governada

> **Versao:** 3.1.0 | **Data:** 2026-03-23 | **Owner:** Marcos Sulivan
> **Estado atual do modulo:** READY (v1.0.0) | **Epico:** APPROVED (v1.2.0) | **Features:** 5/5 APPROVED
>
> Fases 0-4 concluidas. Modulo selado READY v1.0.0 (commit 5ca283e, 2026-03-23). Fase 5 (Geracao de Codigo) NAO INICIADA — scaffold de apps nao existe ainda. Proximo passo: executar `/app-scaffold all` para criar apps/api e apps/web, depois `/codegen mod-010`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-010 | APPROVED (v1.2.0) | DoR completo, 5 features vinculadas, 3 politicas de execucao, blocklist Phase 1/2 |
| Features F01-F05 | 5/5 APPROVED | F01 (API Agentes + Catalogo), F02 (API Gateway + Motor), F03 (API Log), F04 (UX Gestao), F05 (UX Monitor) |
| Scaffold (forge-module) | CONCLUIDO | mod-010-mcp-automacao/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | AGN-DEV-01 a AGN-DEV-11 confirmados, v0.6.0, 7 pendentes identificadas e resolvidas |
| Codegen (6 agentes) | NAO INICIADO | Scaffold de apps nao existe (apps/api/, apps/web/). Todas 5 dependencias upstream READY. Executar `/app-scaffold all` + `/codegen mod-010` |
| PENDENTEs | 0 ABERTA | 7 total: 7/7 IMPLEMENTADA |
| ADRs | 4 criadas (ACCEPTED) | Nivel 2 requer minimo 3 — atendido (ADR-001 Gateway Sincrono, ADR-002 API Key bcrypt, ADR-003 Outbox Pattern, ADR-004 Blocklist Wildcard) |
| Amendments | 0 | Nenhum (modulo recem-selado READY) |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v1.0.0 | Ultima entrada 2026-03-23 (Etapa 5 — Selo READY) |
| Screen Manifests | 2/2 existem | ux-mcp-001.gestao-agentes.yaml, ux-mcp-002.monitor-execucoes.yaml |
| Dependencias | 5 upstream (MOD-000, MOD-004, MOD-007, MOD-008, MOD-009) | Todas 5 READY. Consome Foundation core, scopes delegados, parametrizacao, integracoes externas, motor de aprovacao |
| Bloqueios | 0 | Nenhum BLK-* afeta MOD-010 diretamente |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-NNN
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-NNN
> ```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-010 define o modulo de automacao governada via protocolo MCP — agentes com identidade tecnica propria que executam acoes operacionais sem contornar mecanismos de governanca (aprovacoes, alcadas, segregacao de funcoes). Principio central: "O fato de o usuario poder aprovar nao significa que seu agente associado tambem possa aprovar." O modulo cobre API de Agentes, Gateway de Despacho com 3 politicas (DIRECT/CONTROLLED/EVENT_ONLY), Log de Execucoes e interfaces UX de Gestao e Monitor.

```
1    (manual)              Revisar e finalizar epico US-MOD-010:             CONCLUIDO
                           - Escopo fechado (5 features, 3 politicas)       status_agil = APPROVED
                           - Gherkin validado (blocklist, CONTROLLED, rastreabilidade)  v1.2.0
                           - DoR completo (5 tabelas, 13 endpoints, 6 scopes)
                           - Regra-Mae de Nao-Bypass formalizada
                           - Blocklist Phase 1/2 documentada
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-010.md

2    (manual)              Revisar e finalizar features F01-F05:             CONCLUIDO
                           - F01: API Agentes MCP + Catalogo de Acoes       5/5 APPROVED
                           - F02: API Gateway + Motor de Despacho MCP
                           - F03: API Log de Execucoes
                           - F04: UX Gestao de Agentes e Acoes
                           - F05: UX Monitor de Execucoes MCP
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-010-F01..F05.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Modulo scaffoldado via `forge-module` a partir do epico APPROVED (v1.2.0). Nivel 2 (DDD-lite + Clean Completo) com 6 gatilhos DOC-ESC-001 ativados. Scaffold criou estrutura completa: 5 tabelas, 13 endpoints, 9 artefatos de requisitos + stubs obrigatorios (DATA-003, SEC-002).

```
3    /forge-module          Gerar scaffold MOD-010:                          CONCLUIDO
                           - mod-010-mcp-automacao/ criada                   v0.1.0
                           - mod-010-mcp-automacao.md (manifesto)
                           - CHANGELOG.md (Etapa 1-3 verde)
                           - requirements/ com 10 artefatos (BR, FR, DATA x2, INT, SEC x2, UX, NFR, PEN)
                           - adr/ e amendments/ (vazios)
                           Arquivo: docs/04_modules/mod-010-mcp-automacao/
```

### Fase 2: Enriquecimento — CONCLUIDA

O enriquecimento do MOD-010 foi executado via 4 batches sequenciais, cobrindo todos os 11 agentes. O modulo e o mais complexo do portfolio (Nivel 2, Score 6/6 DOC-ESC-001), com 7 pendencias identificadas durante o enriquecimento — todas resolvidas e IMPLEMENTADA. O CHANGELOG do modulo registra cada batch e resolucao de pendencia em detalhe.

```
4    /enrich mod-010        Enriquecimento completo (11 agentes, 4 batches):  CONCLUIDO
                           Batch 1: AGN-DEV-01 (MOD/Escala), AGN-DEV-02 (BR),
                                    AGN-DEV-03 (FR)                          v0.1.0 → v0.2.0
                           Batch 2: AGN-DEV-04 (DATA), AGN-DEV-05 (INT),
                                    AGN-DEV-08 (NFR)                         v0.2.0 → v0.3.0
                           Batch 3: AGN-DEV-06 (SEC), AGN-DEV-07 (UX)       v0.3.0 → v0.4.0
                           Batch 4: AGN-DEV-09 (ADR), AGN-DEV-10 (PENDENTE),
                                    AGN-DEV-11 (VALIDACAO)                   v0.4.0 → v0.5.0
                           Pipeline pendentes: v0.5.0 → v0.6.0
```

#### Rastreio de Agentes

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-010-mcp-automacao.md | CONCLUIDO | v0.2.0, architecture_level=2, 6 gatilhos, module_paths |
| 2 | AGN-DEV-02 | BR | BR-010.md | CONCLUIDO | v0.2.0, Gherkin BR-001..BR-015 |
| 3 | AGN-DEV-03 | FR | FR-010.md | CONCLUIDO | v0.2.0, Done funcional, dependencias, Gherkin FR-001..FR-009 |
| 4 | AGN-DEV-04 | DATA | DATA-010.md, DATA-003.md | CONCLUIDO | v0.3.0, FK ON DELETE RESTRICT, 13 indices, ERD, EVT-001..EVT-010 |
| 5 | AGN-DEV-05 | INT | INT-010.md | CONCLUIDO | v0.3.0, 5 integracoes, 13 contratos de API, erros RFC 9457 |
| 6 | AGN-DEV-06 | SEC | SEC-010.md, SEC-002.md | CONCLUIDO | v0.4.0, 14 secoes SEC, 3 sub-matrizes SEC-002, 5 cenarios Gherkin |
| 7 | AGN-DEV-07 | UX | UX-010.md | CONCLUIDO | v0.4.0, UX-MCP-001 (8 passos, 5 estados), UX-MCP-002 (7 passos, 8 estados) |
| 8 | AGN-DEV-08 | NFR | NFR-010.md | CONCLUIDO | v0.3.0, 9 NFRs, SLOs P95/P99, 15 metricas Prometheus, 17 spans OTEL |
| 9 | AGN-DEV-09 | ADR | ADR-001..ADR-004 | CONCLUIDO | v0.5.0, 4 ADRs (Gateway, API Key, Outbox, Blocklist) |
| 10 | AGN-DEV-10 | PENDENTE | pen-010-pendente.md | CONCLUIDO | v0.5.0, 7 pendencias documentadas (2 ALTA, 3 MEDIA, 1 BAIXA, 1 ALTA/VALIDATE) |
| 11 | AGN-DEV-11 | VALIDACAO | cross-validation | CONCLUIDO | v0.5.0, 2 erros corrigidos, 4 warnings documentados |

#### Pendencias — Resumo Compacto

| # | ID | Status | Severidade | Decisao (1 linha) | Artefato |
|---|---|---|---|---|---|
| 1 | PENDENTE-001 | IMPLEMENTADA | ALTA | Opcao B — endpoint dedicado `POST /enable-phase2` com scope separado | FR-010 |
| 2 | PENDENTE-002 | IMPLEMENTADA | MEDIA | Opcao A — PREPARAR `can_be_direct=false` (conservador) | DATA-010, BR-010 |
| 3 | PENDENTE-003 | IMPLEMENTADA | MEDIA | Opcao A — DIRECT como orchestration port, strategy pattern | FR-010 |
| 4 | PENDENTE-004 | IMPLEMENTADA | ALTA | Opcao B — Amendment DOC-FND-000-M04 criado pelo time Foundation | DOC-FND-000 |
| 5 | PENDENTE-005 | IMPLEMENTADA | MEDIA | Opcao A — Callback HTTP MOD-009 → MOD-010 | INT-010, DATA-010 |
| 6 | PENDENTE-006 | IMPLEMENTADA | BAIXA | Opcao A — NotificationService do Foundation (MOD-000) | dependencia mapeada |
| 7 | PENDENTE-007 | IMPLEMENTADA | ALTA | Opcao A — DOC-FND-000 §2.2 alinhado com modulo spec | DOC-FND-000 v1.8.0 |

> Detalhes completos: requirements/pen-010-pendente.md

### Fase 3: Validacao — CONCLUIDA

Validacao executada via `/validate-all` em 2026-03-22 com resultado PASS para todos os manifests do modulo. Durante a validacao, PENDENTE-007 foi identificada e resolvida (scopes MCP nos manifests divergiam do catalogo canonico — DOC-FND-000 atualizado para v1.8.0).

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
5a   /qa                    Validacao de sintaxe, links e metadados:          CONCLUIDO
                           - Todos os artefatos passaram qa check             validate-all 2026-03-22

5b   /validate-manifest    Validacao de screen manifests:                     CONCLUIDO
                           - ux-mcp-001.gestao-agentes.yaml PASS
                           - ux-mcp-002.monitor-execucoes.yaml PASS
                           - PENDENTE-007 resolvida durante validacao (scopes alinhados)

5c   /validate-openapi     Validacao de contratos OpenAPI:                    FUTURO (pos-codigo)
                           - Artefato de codigo nao existe ainda
                           - 13 endpoints definidos em spec, OpenAPI sera gerado pos-implementacao

5d   /validate-drizzle     Validacao de schemas Drizzle:                      FUTURO (pos-codigo)
                           - 5 tabelas definidas em DATA-010
                           - Schema Drizzle sera criado durante implementacao

5e   /validate-endpoint    Validacao de endpoints Fastify:                    FUTURO (pos-codigo)
                           - 13 endpoints definidos
                           - Handlers Fastify serao implementados pos-scaffold de codigo
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | `/qa` | SIM (todos) | SIM — PASS | Todos os 10 requisitos + mod.md + CHANGELOG |
| 2 | `/validate-manifest` | SIM (2 manifests) | SIM — PASS | ux-mcp-001.yaml, ux-mcp-002.yaml |
| 3 | `/validate-openapi` | SIM (Nivel 2) | NAO — pos-codigo | 13 endpoints em spec, OpenAPI futuro |
| 4 | `/validate-drizzle` | SIM (Nivel 2) | NAO — pos-codigo | 5 tabelas em DATA-010, schema futuro |
| 5 | `/validate-endpoint` | SIM (Nivel 2) | NAO — pos-codigo | 13 endpoints em spec, handlers futuro |

### Fase 4: Promocao — CONCLUIDA

Modulo promovido para READY (v1.0.0) em 2026-03-23 via `/promote-module`. DoR 7/7 atendido. Todas as 7 pendencias IMPLEMENTADA. Commit: 5ca283e.

```
6    /promote-module        Gate 0 — DoR Pre-Promocao:                       CONCLUIDO
                                                                             commit 5ca283e
     DoR-1: 0 pendencias ABERTA?                                             SIM (7/7 IMPLEMENTADA)
     DoR-2: Todos features APPROVED?                                         SIM (5/5)
     DoR-3: Todos requisitos existem?                                        SIM (10/10)
     DoR-4: ADRs minimos atendidos (>= 3 para Nivel 2)?                     SIM (4 ADRs)
     DoR-5: Screen manifests validos?                                        SIM (2/2 PASS)
     DoR-6: validate-all PASS?                                               SIM (2026-03-22)
     DoR-7: Owner aprova?                                                    SIM
                           Resultado: READY v1.0.0 selado                    2026-03-23
```

#### Bloqueadores para Promocao

Nenhum. Todos resolvidos. Modulo selado READY v1.0.0.

### Fase 5: Geracao de Codigo — NAO INICIADA

Modulo READY v1.0.0 — pre-requisito de codegen atendido. Todas as 5 dependencias upstream (MOD-000, MOD-004, MOD-007, MOD-008, MOD-009) estao READY. Porem, o scaffold de aplicacoes (apps/api/, apps/web/) ainda nao existe. Nivel 2 requer todos os 6 agentes COD: AGN-COD-DB, AGN-COD-CORE, AGN-COD-APP, AGN-COD-API, AGN-COD-WEB, AGN-COD-VAL.

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
7a   /app-scaffold all     Scaffold de aplicacoes:                            A EXECUTAR
                           - Criar apps/api/ (Fastify + Drizzle + OpenAPI)
                           - Criar apps/web/ (React + TanStack)
                           - Pre-requisito one-time para todos os modulos
                           Verificar: apps/api/package.json e apps/web/package.json

7b   /codegen mod-010      Geracao de codigo (6 agentes, Nivel 2):            A EXECUTAR
                           - AGN-COD-DB: migrations, schemas Drizzle (5 tabelas)
                           - AGN-COD-CORE: aggregates, entities, VOs, domain services
                           - AGN-COD-APP: use cases, ports, DTOs
                           - AGN-COD-API: controllers, routes, OpenAPI, testes
                           - AGN-COD-WEB: screens, components, queries, commands
                           - AGN-COD-VAL: validacao cruzada global
                           Path API: apps/api/src/modules/mcp/
                           Path Web: apps/web/src/modules/mcp/
```

#### Rastreio de Agentes COD

| # | Agente | Camada | Path | Status | Arquivos |
|---|--------|--------|------|--------|----------|
| 1 | AGN-COD-DB | infrastructure | apps/api/src/modules/mcp/infrastructure/, apps/api/db/ | A EXECUTAR | 0 |
| 2 | AGN-COD-CORE | domain | apps/api/src/modules/mcp/domain/ | A EXECUTAR | 0 |
| 3 | AGN-COD-APP | application | apps/api/src/modules/mcp/application/ | A EXECUTAR | 0 |
| 4 | AGN-COD-API | presentation | apps/api/src/modules/mcp/presentation/, apps/api/openapi/ | A EXECUTAR | 0 |
| 5 | AGN-COD-WEB | web | apps/web/src/modules/mcp/ | A EXECUTAR | 0 |
| 6 | AGN-COD-VAL | validation | (cross-layer) | A EXECUTAR | 0 |

#### Pre-requisitos para Codegen

1. **Scaffold de apps:** `apps/api/package.json` e `apps/web/package.json` NAO existem. Executar `/app-scaffold all` primeiro (operacao one-time que cria a estrutura base para todos os modulos).
2. **Dependencias upstream READY:** Todas 5 dependencias upstream READY — sem bloqueio.
3. **Ordem topologica:** MOD-010 esta na Camada 6 (ultima). Idealmente, codigo dos modulos upstream (MOD-000 a MOD-009) deve ser gerado antes para que adapters e ports possam referenciar tipos reais. Considerar `/codegen-all` para respeitar ordem topologica automaticamente.

### Fase 6: Pos-READY — SOB DEMANDA

Modulo selado READY v1.0.0. Alteracoes futuras exclusivamente via `/create-amendment`. Nenhum amendment criado ate o momento.

```
8    /create-amendment      Sob demanda apos READY:                           SOB DEMANDA
                           - Nenhum amendment criado
                           - Amendments futuros para extensoes Phase 2, novos action types, etc.
```

### Gestao de Pendencias

**SLA de Pendencias:**
- ALTA: resolver em ate 5 dias uteis
- MEDIA: resolver em ate 10 dias uteis
- BAIXA: resolver em ate 20 dias uteis

**Ciclo de vida:** ABERTA → EM_ANALISE → DECIDIDA → IMPLEMENTADA (ou CANCELADA)

> **Decision tree de pendencias:**
>
> ```
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-010
> ├── Criar nova pendencia     → /manage-pendentes create PEN-010
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-010 PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-010 PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-010 PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-010 PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-010
> ```

#### Pendencias — Referencia

| # | ID | Status | Severidade | Decisao (1 linha) |
|---|---|---|---|---|
| 1 | PENDENTE-001 | IMPLEMENTADA | ALTA | Endpoint dedicado Phase 2 enable |
| 2 | PENDENTE-002 | IMPLEMENTADA | MEDIA | PREPARAR can_be_direct=false |
| 3 | PENDENTE-003 | IMPLEMENTADA | MEDIA | DIRECT orchestration port |
| 4 | PENDENTE-004 | IMPLEMENTADA | ALTA | Amendment DOC-FND-000-M04 (scopes MCP) |
| 5 | PENDENTE-005 | IMPLEMENTADA | MEDIA | Callback HTTP MOD-009 → MOD-010 |
| 6 | PENDENTE-006 | IMPLEMENTADA | BAIXA | NotificationService MOD-000 |
| 7 | PENDENTE-007 | IMPLEMENTADA | ALTA | Scopes alinhados DOC-FND-000 v1.8.0 |

> Detalhes completos: requirements/pen-010-pendente.md

### Utilitarios

```
     /qa                    Re-validar apos alteracoes
     /validate-all          Validacao completa (manifests + qa)
     /manage-pendentes      Gerenciar ciclo de vida de pendencias
     /create-amendment      Criar adendo pos-READY
     /app-scaffold          Scaffold de aplicacoes (one-time)
     /codegen               Gerar codigo de um modulo
     /codegen-all           Gerar codigo de todos modulos READY (ordem topologica)
```

---

## Resumo Visual do Fluxo MOD-010

```
PRE-MODULO ──→ GENESE ──→ ENRIQUECIMENTO ──→ VALIDACAO ──→ PROMOCAO ──→ CODEGEN ──→ POS-READY
    [OK]         [OK]          [OK]              [OK]        [OK]       [pendente]  [sob demanda]
                                                          READY v1.0.0
                                                          5ca283e                    ◄── voce esta aqui
                                                          2026-03-23
```

**Posicao na cadeia topologica:** Camada 6 (MOD-010 depende de MOD-000, MOD-004, MOD-007, MOD-008, MOD-009). Modulo folha — nenhum modulo depende de MOD-010.

**Dependencias upstream (5) — todas READY:**
- MOD-000 (Foundation) — READY — auth, RBAC, domain events, audit trail, NotificationService
- MOD-004 (Identidade Avancada) — READY — scopes delegados para agentes MCP
- MOD-007 (Parametrizacao Contextual) — READY — motor de parametrizacao para configuracao dinamica
- MOD-008 (Integracao Protheus) — READY — integracoes externas acionadas via MCP
- MOD-009 (Movimentos sob Aprovacao) — READY — policy CONTROLLED para movimentos que requerem aprovacao

---

## Particularidades do MOD-010

| Aspecto | Detalhe |
|---------|---------|
| Nivel de Arquitetura | Nivel 2 — DDD-lite + Clean Completo. Score DOC-ESC-001: 6/6 gatilhos ativados (workflow, compliance, concorrencia, integracoes criticas, multi-tenant, regras cruzadas). Modulo mais complexo do portfolio. Requer todos os 6 agentes COD. |
| Aggregate Root | `McpAgent` — fronteira transacional clara. Domain Services: McpGateway (8 passos), ScopeBlocklistValidator, McpDispatcher. Value Objects: ExecutionPolicy, AgentStatus, ActionType. |
| Pendencias | 0 ABERTA. 7/7 IMPLEMENTADA. Modulo selado READY v1.0.0. |
| Maior contagem de dependencias | 5 dependencias upstream — a maior do portfolio. Posicao de modulo folha na Camada 6 significa que nenhum deploy e bloqueado por MOD-010, mas o proprio MOD-010 depende de muitos modulos estarem prontos. Todas 5 agora READY. |
| API Key once-only | Mecanismo de seguranca critico: API key retornada apenas uma vez na criacao, armazenada via bcrypt hash. Nunca retornada em GET. Rotacao gera nova key com idempotencia. |
| Blocklist em 2 fases | Phase 1 (permanente): 6 padroes de escopo bloqueados. Phase 2 (futuro): `*:create` liberavel per-agent sob condicoes. Endpoint dedicado Phase 2 enable definido (PENDENTE-001 IMPLEMENTADA). |
| Screen Manifests | 2 manifests YAML existem e passaram validacao. UX-MCP-001 (Gestao Agentes), UX-MCP-002 (Monitor Execucoes). |
| Codegen — escopo completo | Nivel 2 requer 6 agentes COD. Slug: `mcp`. Paths: `apps/api/src/modules/mcp/` (domain, application, infrastructure, presentation) e `apps/web/src/modules/mcp/` (UI screens, components). Scaffold de apps e pre-requisito one-time pendente. |

---

## Checklist Rapido — O que Falta para Codegen

- [ ] Executar `/app-scaffold all` — criar apps/api e apps/web (one-time para todo o portfolio)
- [ ] Executar `/codegen mod-010` ou `/codegen-all` — gerar codigo das 6 camadas
- [ ] Pos-codegen: `/validate-openapi` — validar contratos OpenAPI gerados (13 endpoints)
- [ ] Pos-codegen: `/validate-drizzle` — validar schemas Drizzle gerados (5 tabelas)
- [ ] Pos-codegen: `/validate-endpoint` — validar endpoints Fastify gerados (13 endpoints)

> **Nota:** MOD-010 esta na Camada 6 (ultima na cadeia topologica). Para `/codegen-all`, codigo dos modulos upstream sera gerado primeiro automaticamente. Para `/codegen mod-010` individual, garanta que dependencias upstream ja possuam codigo gerado para que adapters possam referenciar tipos reais.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 3.1.0 | 2026-03-23 | Atualizacao: Fase 5 (Geracao de Codigo) adicionada como NAO INICIADA (scaffold apps inexistente, todas 5 deps upstream READY). Fase 6 (Pos-READY) renumerada. Rastreio de agentes COD, pre-requisitos de codegen, checklist de codegen e decision tree de codegen adicionados. CHANGELOG do modulo atualizado para v1.0.0. Status das dependencias upstream confirmado: todas 12 modulos READY |
| 3.0.0 | 2026-03-23 | Fase 4 CONCLUIDA — READY v1.0.0 selado (commit 5ca283e). Resumo visual, checklist e particularidades atualizados |
| 2.1.0 | 2026-03-23 | PENDENTE-001 e PENDENTE-004 → IMPLEMENTADA (status sincronizado — artefatos ja existiam). DoR 7/7 atendido. Fase 4 desbloqueada — pronto para /promote-module |
| 2.0.0 | 2026-03-23 | Recriacao completa: Fases 0-3 CONCLUIDAS (validate-all 2026-03-22 PASS), Fase 4 BLOQUEADA por 2 ABERTA (PENDENTE-001, PENDENTE-004), PENDENTE-007 adicionada e resolvida, screen manifests 2/2 confirmados, mapa de cobertura atualizado |
| 1.0.0 | 2026-03-22 | Criacao completa: Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 6 pendentes resolvidas (001-006), rastreio de 11 agentes, mapa de cobertura de 5 validadores, particularidades Nivel 2 DDD-lite Score 6/6 |
