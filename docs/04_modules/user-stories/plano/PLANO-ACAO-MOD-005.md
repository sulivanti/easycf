# Procedimento — Plano de Acao MOD-005 Modelagem de Processos

> **Versao:** 6.5.0 | **Data:** 2026-03-24 | **Owner:** Marcos Sulivan
> **Estado atual do modulo:** READY (v1.0.2) | **Epico:** READY (v1.2.0) | **Features:** 4/4 READY
>
> Fases 0-4 concluidas. Codegen completo (6/6 agentes). **15/16 pendencias IMPLEMENTADA**, 1 DECIDIDA. PENDENTE-013 IMPLEMENTADA (DTOs Zod alinhados com OAS — gates +stage_id/descricao, roles flat). PENDENTE-014 DECIDIDA (adicionar update ao manifest). **0 ABERTA**. Proximo passo: `/manage-pendentes implement PEN-005 PENDENTE-014` (adicionar acao update ao manifest).

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-005 | READY (v1.2.0) | DoR completo, 4 features vinculadas, EP03 |
| Features F01-F04 | 4/4 READY | F01 (API: Ciclos+Macroetapas+Estagios v1.1.0), F02 (API: Gates+Papeis+Transicoes v1.0.2), F03 (UX: Editor Visual v1.0.2), F04 (UX: Configurador Estagio v1.0.2) |
| Scaffold (forge-module) | CONCLUIDO | mod-005-modelagem-processos/ com estrutura completa Nivel 2 |
| Enriquecimento (11 agentes) | CONCLUIDO | Agentes 01-10 confirmados (re-enriquecimento completo), v0.17.0 |
| Codegen (6 agentes) | CONCLUIDO (com violacoes) | 6/6 agentes done. 42 arquivos gerados. AGN-COD-VAL detectou 1 bloqueador + 4 criticas |
| PENDENTEs | 0 abertas / 16 total | 15 IMPLEMENTADA (Q1-Q9, 010-013, 015-016). 014 DECIDIDA (🟢). 0 ABERTA. |
| ADRs | 4 criadas (accepted) | Nivel 2 requer minimo 3 — atendido (ADR-001..004) |
| Amendments | 0 | Nenhum |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v1.0.2 | Ultima entrada 2026-03-24 (validate-all re-validacao). Pipeline Mermaid Etapa 5 |
| Screen Manifests | 2/2 existem | ux-proc-001.editor-visual (FAIL), ux-proc-002.config-estagio (PASS) |
| Dependencias | 3 upstream (MOD-000, MOD-003, MOD-004) | Consome auth/RBAC de MOD-000, org_units de MOD-003, org_scopes de MOD-004 |
| Bloqueios | 1 recebido (BLK-003) | MOD-005 bloqueado por MOD-004 (org_scopes). Emite BLK-002 para MOD-006 |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-005 define a camada de modelagem de processos (blueprint) — a separacao conceitual entre o molde (MOD-005) e o produto moldado (MOD-006). Modelo de 7 tabelas com versionamento imutavel de ciclos publicados, grafo de transicoes com condicoes e evidencias, e catalogo global de papeis de processo. Com 4 features cobrindo backend (F01, F02) e frontend (F03, F04), o modulo foi aprovado como READY com DoR completo.

```
1    (manual)              Revisar e finalizar epico US-MOD-005:             CONCLUIDO
                           - Escopo fechado (4 features: 2 backend + 2 UX)  status_agil = READY
                           - Gherkin validado (5 cenarios epico)             v1.2.0
                           - DoR completo (7 tabelas, 25 endpoints, regras)
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-005.md

2    (manual)              Revisar e finalizar features F01-F04:             CONCLUIDO
                           - F01: API Ciclos + Macroetapas + Estagios        4/4 READY
                           - F02: API Gates + Papeis + Transicoes
                           - F03: UX Editor Visual de Fluxo (UX-PROC-001)
                           - F04: UX Configurador de Estagio (UX-PROC-002)
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-005-F{01..04}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Modulo Nivel 2 (DDD-lite + Full Clean) scaffoldado na camada topologica 3. Score 5/6 no DOC-ESC-001 §4.2.

```
3    /forge-module          Scaffold criado:                                 CONCLUIDO
                           Pasta: mod-005-modelagem-processos/
                           Nivel 2 — DDD-lite + Full Clean
                           Artefatos: mod.md, CHANGELOG.md, requirements/
```

### Fase 2: Enriquecimento — CONCLUIDA

Enriquecimento mais intenso do projeto com 17 versoes no CHANGELOG e 9 questoes resolvidas. 5 agentes precisaram de re-enriquecimento.

```
4    /enrich mod-005        Enriquecimento completo:                         CONCLUIDO
                           11 agentes executados (AGN-DEV-01..10)
                           5 agentes re-enriquecidos
                           9 questoes levantadas e resolvidas (Q1-Q9)
                           Versao final: v0.17.0
```

### Fase 3: Validacao Spec — CONCLUIDA (pre-READY)

```
5    /validate-all          Validacao pre-promocao (spec):                   CONCLUIDO (2026-03-22)
                           /qa .................. PASS
                           /validate-manifest ... PASS (2/2)
                           /validate-openapi .... FUTURO (pos-codigo)
                           /validate-drizzle .... FUTURO (pos-codigo)
                           /validate-endpoint ... FUTURO (pos-codigo)
```

### Fase 4: Promocao — CONCLUIDA

```
6    /promote-module        Promocao DRAFT → READY:                          CONCLUIDO (2026-03-23)
                           Gate 0 — DoR: 7/7 atendidos
                           estado_item = READY (v1.0.0)
```

> **Nota sobre BLK-003:** MOD-005 recebe bloqueio BLK-003 (depende de `org_scopes` de MOD-004). Isso nao impediu a promocao de spec mas afeta a geracao de codigo — MOD-004 precisa ter codigo gerado antes na ordem topologica.

### Fase 5: Geracao de Codigo — EM ANDAMENTO (correcoes pendentes)

Codegen completo (6/6 agentes done), porem a validacao cruzada (AGN-COD-VAL) identificou violacoes que precisam ser corrigidas antes de considerar a fase concluida.

> **Decision tree de codegen:**
>
> ```
> Preciso gerar codigo para os modulos?
> ├── Scaffold existe? (apps/api/, apps/web/)
> │   └── NAO → /app-scaffold all (one-time, cria apps/api e apps/web)
> └── SIM → Qual escopo?
>     ├── Todos modulos READY (ordem topologica)  → /codegen-all (--dry-run para preview)
>     ├── Todos agentes de 1 modulo               → /codegen mod-005
>     └── 1 agente especifico                     → /codegen-agent mod-005 AGN-COD-XX
> ```

```
7    /app-scaffold all      Criar scaffold de aplicacoes:                     CONCLUIDO (2026-03-23)
                           - apps/api/ (Fastify + Drizzle + OpenAPI)
                           - apps/web/ (Next.js + React)

8    /codegen mod-005       Gerar codigo para MOD-005 (Nivel 2 — 6 agentes): CONCLUIDO (2026-03-23)
                           42 arquivos gerados em 6 fases
                           AGN-COD-VAL: FAIL (1 bloqueador + 4 criticas)

9    (correcoes)            Corrigir violacoes da validacao cruzada:          EM ANDAMENTO
                           V-E01 BLOQUEANTE: ✅ RESOLVIDO (PENDENTE-010)
                           V-E02 ALTA: ✅ RESOLVIDO (PENDENTE-011)
                           V-E03 ALTA: ✅ RESOLVIDO (PENDENTE-012)
                           V-E04 ALTA: ✅ RESOLVIDO (PENDENTE-013 — DTOs alinhados)
                           V-E06 ALTA: ✅ RESOLVIDO (PENDENTE-016/011)
                           V-M01 ALTA: 🟢 DECIDIDO (PENDENTE-014 — implementar)

10   /validate-all mod-005  Re-validacao 2026-03-24:                            EXECUTADO (FAIL)
                           Lint: PASS. Format: PASS. QA: WARN (5 TS reactflow).
                           Drizzle: PASS (7/7). Endpoints: FAIL.
                           V-E01 BLOQUEANTE, V-E02/V-E03/V-E06 ALTA persistem.
                           V-M01 ALTA (manifest) persiste. Correcoes pendentes.
```

#### Rastreio de Agentes COD — MOD-005

| # | Agente | Camada | Path | Status | Arquivos |
|---|--------|--------|------|--------|----------|
| 1 | AGN-COD-DB | infrastructure | apps/api/db/schema/process-modeling.ts, .relations.ts, index.ts | DONE (2026-03-23 23:15) | 3 |
| 2 | AGN-COD-CORE | domain | apps/api/src/modules/process-modeling/domain/ | DONE (2026-03-23 23:30) | 10 |
| 3 | AGN-COD-APP | application | apps/api/src/modules/process-modeling/application/ | DONE (2026-03-24 00:15) | 15 |
| 4 | AGN-COD-API | presentation | apps/api/src/modules/process-modeling/presentation/, openapi/ | DONE (2026-03-24 01:00) | 6 |
| 5 | AGN-COD-WEB | web | apps/web/src/modules/process-modeling/ | DONE (2026-03-24 02:00) | 8 |
| 6 | AGN-COD-VAL | validation | (cross-layer) | DONE (2026-03-23 22:00) | 0 |

**Total:** 42 arquivos gerados (3 DB + 10 domain + 15 application + 6 presentation + 8 web)

#### Resultado da Validacao Cruzada (AGN-COD-VAL)

| # | Validador | Resultado | Detalhes |
|---|-----------|-----------|----------|
| 0 | Lint + Format | PASS | 0 erros lint, 0 erros format (2026-03-24) |
| 1 | QA (TypeScript) | WARN | 5 TS errors — reactflow module not found (3) + implicit any (2) — infra-level deps |
| 2 | Screen Manifests | WARN | 1/2 — ux-proc-002 PASS, ux-proc-001 WARN (V-M01 ALTA: missing update action) |
| 3 | OpenAPI | PASS | Endpoints in v1.yaml. All 11 FR endpoints present in routes |
| 4 | Drizzle Schemas | PASS | 7/7 tabelas, 23 indexes, 7 relacoes, CHECK constraints, 0 violacoes |
| 5 | Fastify Endpoints | FAIL | 1 BLOQUEANTE (V-E01) + 3 ALTA (V-E02, V-E03, V-E06) + 2 MEDIA |
| 6 | Web Layer | WARN | 11 files OK. V-E06: deprecateCycle() PATCH incompativel com backend |

#### Violacoes a Corrigir

| # | ID | Sev. | Validador | Descricao | Acao |
|---|---|---|---|---|---|
| 1 | V-E01 | **BLOQUEANTE** | Endpoint | Domain errors estendem `Error` em vez de `DomainError` — 500 em vez de RFC 9457 | Alterar CycleImmutableError, CrossCycleTransitionError, StageHasInstancesError para estender DomainError com `type` e `statusHint` |
| 2 | V-E02 | **ALTA** | Endpoint | FR-004 (Deprecate Cycle) sem rota — `deprecateCycleUseCase` existe mas nenhuma rota invoca | Adicionar endpoint dedicado ou campo `status` no PATCH DTO |
| 3 | V-E03 | **ALTA** | Endpoint | Status codes incorretos: errors usam 409, spec Gherkin diz 422 | Alinhar statusCode/statusHint com spec |
| 4 | V-E04 | **ALTA** | Endpoint | StageDetailResponse mismatch DTO Zod vs OpenAPI (gates falta descricao, roles nested vs flat) | Alinhar DTOs |
| 5 | V-M01 | **ALTA** | Manifest | ux-proc-001 missing `update` action (mover estagio canvas_x/canvas_y) | Adicionar acao ao manifest |
| 6 | V-E05 | MEDIA | Endpoint | FlowResponse role items nested vs flat mismatch | Alinhar com OAS |
| 7 | V-E06 | **ALTA** | Web | `deprecateCycle()` usa PATCH com `{status:'DEPRECATED'}` mas backend PATCH DTO nao aceita `status` — deprecacao quebrada end-to-end | Alinhar com V-E02 (endpoint dedicado ou corrigir web client) |
| 8 | V-O01 | MEDIA | OpenAPI | UpdateCycleRequest nao inclui campo `status` para FR-004 | Resolver com V-E02 |
| 9 | V-M02 | MEDIA | Manifest | ux-proc-001 missing `deactivate` action | Avaliar necessidade |
| 10 | V-M03 | MEDIA | Manifest | ux-proc-001 missing `view_history` action | Avaliar necessidade |

### Fase 6: Pos-READY — SOB DEMANDA

```
11   /create-amendment       Criar amendment formal se necessario:             SOB DEMANDA
                           Casos previstos pos-codegen:
                           - JSON rule engine para condicoes de transicao
                           - Novos tipos de gate
                           - Ajustes identificados pelo AGN-COD-VAL
```

### Gestao de Pendencias (qualquer momento)

> **Decision tree de pendencias:**
>
> ```
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-005
> ├── Criar nova pendencia     → /manage-pendentes create PEN-005
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-005 PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-005 PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-005 PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-005 PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-005
> ```

```
16   /manage-pendentes list PEN-005
                           Estado atual MOD-005:
                             PEN-005: 16 itens total
                               15 IMPLEMENTADA (Q1-Q9, PENDENTE-010, 011, 012, 013, 015, 016)
                               1 DECIDIDA (PENDENTE-014) — aguarda implementacao
                               0 ABERTA
                             SLA: todos dentro do prazo
```

#### Painel de Pendencias — Resumo Compacto

| # | ID | Status | Sev. | Decisao (1 linha) | Artefato |
|---|---|---|---|---|---|
| 1 | Q1 | ✅ IMPLEMENTADA | — | React Flow confirmado como biblioteca canvas | UX-005 |
| 2 | Q2 | ✅ IMPLEMENTADA | — | JSON rule engine marcado futuro | DATA-005 §2.7 |
| 3 | Q3 | ✅ IMPLEMENTADA | — | API sincrona GET /internal/instances/count-active | INT-005 §4.1, ADR-002 |
| 4 | Q4 | ✅ IMPLEMENTADA | — | 4 scopes process:cycle:* em DOC-FND-000 v1.1.0 | DOC-FND-000 §2.2 |
| 5 | Q5 | ✅ IMPLEMENTADA | — | cycle_id denormalizado + partial unique index | ADR-001, DATA-005 |
| 6 | Q6 | ✅ IMPLEMENTADA | — | Contagem correta: 25 endpoints | INT-005, mod.md |
| 7 | Q7 | ✅ IMPLEMENTADA | MEDIA | 10 eventos UPDATE/DELETE no DATA-003 | DATA-003 v0.4.0 |
| 8 | Q8 | ✅ IMPLEMENTADA | BAIXA | DELETE /admin/process-roles/:id adicionado | INT-005 §1.7 |
| 9 | Q9 | ✅ IMPLEMENTADA | BAIXA | ADR-002 status → accepted | ADR-002.md |
| 10 | PENDENTE-010 | ✅ IMPLEMENTADA | 🔴BLOQ | ~~Opcao A — 4 errors → DomainError (type URI + statusHint 422/503)~~ | domain/errors/*.ts |
| 11 | PENDENTE-011 | ✅ IMPLEMENTADA | 🟠ALTA | ~~Opcao A — POST /admin/cycles/:id/deprecate + web client~~ | cycles.route.ts, process-modeling.api.ts |
| 12 | PENDENTE-012 | ✅ IMPLEMENTADA | 🟠ALTA | ~~Opcao A — statusHint 422 (resolvido com PENDENTE-010)~~ | domain/errors/*.ts |
| 13 | PENDENTE-013 | ✅ IMPLEMENTADA | 🟠ALTA | ~~Opcao A — DTOs Zod alinhados com OAS (gates +stage_id/descricao, roles flat)~~ | process-modeling.dto.ts, flow-graph.service.ts, process-modeling.types.ts, StageConfigPanel.tsx |
| 14 | PENDENTE-014 | 🟢 DECIDIDA | 🟠ALTA | Opcao A — adicionar acao update ao manifest ux-proc-001 | ux-proc-001.yaml |
| 15 | PENDENTE-015 | ✅ IMPLEMENTADA | 🟡MEDIA | Opcao A — format + lint fix (3 fases) | cycles.route.ts, process-roles.route.ts, stages.route.ts |
| 16 | PENDENTE-016 | ✅ IMPLEMENTADA | 🟠ALTA | ~~Opcao A — resolvida por PENDENTE-011 (web client corrigido)~~ | process-modeling.api.ts |

> Detalhes completos: requirements/pen-005-pendente.md

### Utilitarios (qualquer momento)

```
14   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-005): <descricao>

15   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-005

```
US-MOD-005 (READY v1.2.0)              ← Fase 0: CONCLUIDA
  │  4/4 features READY (2 backend + 2 UX)
  │  Nivel 2 — DDD-lite + Full Clean (score 5/6)
  ▼
mod-005-modelagem-processos/ (stubs)    ← Fase 1: CONCLUIDA (forge-module v0.1.0)
  ▼
mod-005 enriquecido (v0.17.0)          ← Fase 2: CONCLUIDA (11 runs, 9 questoes resolvidas)
  ▼
mod-005 validado spec                   ← Fase 3: CONCLUIDA (validate-all 2026-03-22 PASS)
  ▼
mod-005 selado (READY v1.0.0)          ← Fase 4: CONCLUIDA (promote-module 2026-03-23)
  │
  ├── ★ FASE ATUAL: Codegen concluido, 2 correcoes DECIDIDAS aguardam implementacao
  │
  ▼
mod-005 codigo gerado (42 arquivos)    ← Fase 5: EM ANDAMENTO
  │  6/6 agentes COD done
  │  Violacoes: 5/6 RESOLVIDAS, 1/6 DECIDIDA (implementar)
  │  ├── V-E01 BLOQUEANTE .... ✅ RESOLVIDO (DomainError)
  │  ├── V-E02/E03/E06 ....... ✅ RESOLVIDOS (deprecate + status codes)
  │  ├── V-E04 (DTO mismatch)  ✅ RESOLVIDO (PENDENTE-013 IMPLEMENTADA)
  │  └── V-M01 (manifest) .... 🟢 DECIDIDO → implementar
  │
  │  ★ PROXIMO PASSO: implementar PENDENTE-014, re-executar /validate-all
  │
  ▼
mod-005 + amendments/                   ← Fase 6: SOB DEMANDA (0 amendments)

Dependencias upstream: MOD-000 (Foundation) + MOD-003 (Estrutura Org) + MOD-004 (Identidade Avancada)
Camada topologica: 3
Dependentes downstream: MOD-006 (Execucao de Casos), MOD-007 (Parametrizacao)
Bloqueio recebido: BLK-003 — org_scopes de MOD-004 (implementacao)
Bloqueio emitido: BLK-002 — MOD-006 depende de blueprints + cycle_version_id freeze
```

---

## Particularidades do MOD-005

| Aspecto | Detalhe |
|---------|---------|
| Modulo-molde da cadeia de processos | MOD-005 e o "molde" e MOD-006 e o "produto moldado". Blueprints publicados sao imutaveis — qualquer mudanca requer fork criando nova versao. |
| Enriquecimento mais intenso do projeto | 17 versoes no CHANGELOG, 9 questoes resolvidas. 5 agentes precisaram de re-enriquecimento. |
| Fork atomico com remapeamento de UUIDs | ADR-003 define fork como transacao unica copiando 7 tabelas com novos UUIDs. Operacao mais complexa do modulo. |
| BLK-003 recebido de MOD-004 | Depende de `org_scopes` para filtering. Nao impediu promocao spec mas afeta codegen. |
| Editor visual com React Flow | UX-PROC-001 usa React Flow com nodos customizados, swimlanes, mini-mapa, sincronizacao bidirecional com UX-PROC-002. |
| 4 ADRs cobrindo decisoes nao-obvias | ADR-001 (is_initial unique), ADR-002 (fail-safe MOD-006), ADR-003 (fork atomico), ADR-004 (optimistic locking). |
| Validacao pos-codegen com violacoes | AGN-COD-VAL identificou domain errors mal-herdados (BLOQUEANTE), rota de deprecacao ausente, mismatches DTO/OAS. Requer correcoes antes de fechar Fase 5. |

---

## Checklist Rapido — O que Falta para Codigo Completo

- [x] Enriquecimento completo (11 runs, 9 questoes resolvidas)
- [x] Validacao spec (`/validate-all` 2026-03-22 PASS)
- [x] Promocao (`/promote-module` 2026-03-23 — READY v1.0.0)
- [x] Scaffold apps (`/app-scaffold all` 2026-03-23)
- [x] Codegen (`/codegen mod-005` — 6/6 agentes done, 42 arquivos)
- [x] Corrigir V-E01 BLOQUEANTE: domain errors → DomainError (PENDENTE-010 IMPLEMENTADA 2026-03-24)
- [x] Corrigir V-E02 ALTA: POST /admin/cycles/:id/deprecate (PENDENTE-011 IMPLEMENTADA 2026-03-24)
- [x] Corrigir V-E03 ALTA: status codes 422 (resolvido com PENDENTE-010/012, 2026-03-24)
- [x] Corrigir V-E06 ALTA: web deprecateCycle() → POST /deprecate (PENDENTE-016 IMPLEMENTADA 2026-03-24)
- [x] Corrigir V-E04 MEDIA: alinhar StageDetailResponse DTO vs OAS (PENDENTE-013 IMPLEMENTADA 2026-03-24 — gates +stage_id/descricao, roles flat)
- [ ] Corrigir V-M01 ALTA: adicionar acao `update` ao ux-proc-001 (PENDENTE-014 DECIDIDA → implementar)
- [ ] Re-executar `/validate-all mod-005` — obter PASS
- [x] `pnpm lint` — PASS (2026-03-24)
- [x] `pnpm format:check` — PASS (2026-03-24)
- [ ] `pnpm test` — verificar pos-correcoes

> **Nota:** Codegen completo, **0 pendencias ABERTA**. Resta 1 DECIDIDA (PENDENTE-014: adicionar acao update ao manifest via amendment). Apos implementacao, re-executar `/validate-all mod-005` para confirmar PASS. MOD-005 desbloqueia BLK-002 e habilita MOD-006 (Execucao de Casos).

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 6.5.0 | 2026-03-24 | PENDENTE-013 IMPLEMENTADA — DTOs Zod alinhados com OAS: gates +stage_id/descricao, roles flat (4 arquivos alterados). V-E04 resolvido. Resta 1 DECIDIDA (014). |
| 6.4.0 | 2026-03-24 | PENDENTE-013 DECIDIDA (Opcao A: alinhar DTOs Zod com OAS), PENDENTE-014 DECIDIDA (Opcao A: adicionar update ao manifest), PENDENTE-016 IMPLEMENTADA (resolvida por PENDENTE-011). 0 ABERTA restantes — todas 16 pendencias resolvidas. |
| 6.3.0 | 2026-03-24 | PENDENTE-010+011+012 IMPLEMENTADAS: 4 domain errors → DomainError (RFC 9457, 422), POST /cycles/:id/deprecate criado, web client corrigido. V-E01 BLOQUEANTE + V-E03 + V-E06 resolvidos. PENDENTE-012 resolvida como side-effect de 010 (statusHint 422). 3 abertas restantes. |
| 6.2.0 | 2026-03-24 | PENDENTE-010 DECIDIDA (Opcao A: DomainError) + PENDENTE-011 DECIDIDA (Opcao A: POST /deprecate). Painel atualizado: 4 abertas, 2 decididas, 10 implementadas. |
| 6.1.0 | 2026-03-24 | PENDENTE-015 DECIDIDA (Opcao A) e IMPLEMENTADA: Prettier + ESLint corrigidos (0 erros MOD-005). Painel atualizado com batch 5 (PENDENTE-010..016). 6 abertas restantes. |
| 6.0.0 | 2026-03-24 | Re-validacao /validate-all: Lint PASS, Format PASS, QA WARN (5 TS reactflow), Drizzle PASS (7/7), Endpoints FAIL (1 bloqueador + 3 criticas persistem). Nova violacao V-E06 (web deprecateCycle broken). Checklist atualizado. |
| 5.0.0 | 2026-03-23 | Atualizacao: Fase 5 EM ANDAMENTO — codegen 6/6 agentes done (42 arquivos). AGN-COD-VAL executado: FAIL com 1 bloqueador (domain errors herdam Error) + 4 criticas (deprecacao sem rota, status codes, DTO mismatches, manifest acao faltante). Tabela de violacoes adicionada. Checklist atualizado com correcoes pendentes. |
| 4.0.0 | 2026-03-23 | Atualizacao: Fase 4 CONCLUIDA (promote-module DRAFT→READY v1.0.0). Fase 5 adicionada (NAO INICIADA, scaffold concluido). Rastreio de agentes COD incluido. |
| 3.0.0 | 2026-03-23 | Recriacao: Fase 3 CONCLUIDA (validate-all 2026-03-22 PASS 29/29). Fase 4 PENDENTE. DoR 6/7. |
| 2.0.0 | 2026-03-22 | Reescrita completa: detalhamento das 9 pendentes, rastreio de agentes, mapa de cobertura, particularidades |
| 1.1.0 | 2026-03-21 | Reescrita formato hibrido: decision trees, gestao pendencias, resumo visual |
| 1.0.0 | 2026-03-21 | Criacao inicial — diagnostico Fase 2 concluida |
