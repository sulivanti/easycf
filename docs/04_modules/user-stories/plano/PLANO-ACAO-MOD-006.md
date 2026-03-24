# Procedimento — Plano de Acao MOD-006 Execucao de Casos

> **Versao:** 4.0.0 | **Data:** 2026-03-23 | **Owner:** Marcos Sulivan
> **Estado atual do modulo:** READY (v1.1.0) | **Epico:** READY (v0.9.0) | **Features:** 4/4 READY
>
> Fases 0-5 concluidas. Codegen completo: 6 agentes executados, 46 arquivos gerados (DB 3, CORE 15, APP 19, API 2, WEB 7). Validacao cruzada PASS. Proximo passo: `/validate-all` pos-codigo (OpenAPI, Drizzle, Endpoints).

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-006 | READY (v0.9.0) | DoR 9/9 completo, 4 features vinculadas, EP04. Epico e features selados READY (2026-03-23) |
| Features F01-F04 | 4/4 READY | F01 (API: abertura+motor transicao), F02 (API: gates+responsaveis+eventos), F03 (UX: painel caso+timeline), F04 (UX: listagem casos) |
| Scaffold (forge-module) | CONCLUIDO | mod-006-execucao-casos/ com estrutura completa Nivel 2 |
| Enriquecimento (10 agentes) | CONCLUIDO | AGN-DEV-01 a AGN-DEV-10 confirmados via CHANGELOG + requirements, v0.4.0, 5 pendentes resolvidas |
| Codegen (6 agentes) | CONCLUIDO | 6/6 agentes done, 46 arquivos gerados (2026-03-23). Validacao cruzada PASS |
| PENDENTEs | 0 abertas | 5 total: 5 IMPLEMENTADA (001-005) |
| ADRs | 5 criadas (seladas READY) | Nivel 2 requer minimo 3 — atendido (ADR-001 motor atomico, ADR-002 freeze cycle_version, ADR-003 3 historicos, ADR-004 optimistic locking, ADR-005 background job expiracao) |
| Amendments | 0 proprios (2 cross-module) | DOC-FND-000-M01 (6 scopes process:case:*) e DOC-FND-000-M02 (scope reopen) criados no Foundation |
| Requirements | 10/10 existem (selados READY) | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v1.2.0 | Ultima entrada 2026-03-23 (validate-all pos-codigo). Pipeline Mermaid Etapa 5 (Selo READY) |
| Screen Manifests | 2/2 existem | ux-case-001.painel-caso, ux-case-002.listagem-casos |
| Dependencias | 4 upstream (MOD-000, MOD-003, MOD-004, MOD-005) | Consome auth/RBAC de MOD-000, org_units de MOD-003, delegacoes de MOD-004, blueprints de MOD-005 |
| Bloqueios | 1 recebido (BLK-002) | MOD-006 bloqueado por MOD-005 (blueprints + cycle_version_id freeze devem estar implementados) — afeta codegen, nao spec |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-006 define a camada de execucao de casos — o motor que transforma blueprints do MOD-005 em instancias concretas rastreavies. Tres historicos independentes (estagio, gates, eventos/atribuicoes) garantem auditoria completa. O motor de transicao implementa 5 validacoes sequenciais obrigatorias antes de qualquer mudanca de estagio. O principio central e "o caso nunca sente mudancas no blueprint" — ao abrir, captura `cycle_version_id` vigente (freeze). Unico epico do projeto ja promovido a APPROVED (2026-03-18), com DoR 9/9 completo.

```
1    (manual)              Revisar e finalizar epico US-MOD-006:             CONCLUIDO
                           - Escopo fechado (4 features: 2 backend + 2 UX)  status_agil = APPROVED
                           - Gherkin validado (5 cenarios epico)             v1.2.0
                           - DoR completo (5 tabelas, 16 endpoints, motor)
                           - 3 historicos independentes documentados
                           - Motor de transicao com 5 validacoes sequenciais
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-006.md

2    (manual)              Revisar e finalizar features F01-F04:             CONCLUIDO
                           - F01: API abertura + motor de transicao          4/4 READY
                           - F02: API gates + responsaveis + eventos
                           - F03: UX Painel do caso + timeline (UX-CASE-001)
                           - F04: UX Listagem de casos (UX-CASE-002)
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-006-F{01..04}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Modulo Nivel 2 (DDD-lite + Full Clean) scaffoldado na camada topologica 4. Score 5/6 no DOC-ESC-001 §4.2. Segundo modulo da cadeia de processos (MOD-005 blueprint → MOD-006 execucao). Aggregate root `CaseInstance` centraliza todas as invariantes.

```
3    /forge-module MOD-006  Scaffold completo gerado:                        CONCLUIDO
                           mod-006-execucao-casos.md, CHANGELOG.md,         v0.1.0 (2026-03-18)
                           requirements/ (br/, fr/, data/, int/, sec/,
                           ux/, nfr/), adr/, amendments/
                           Stubs obrigatorios: BR-006, FR-006, DATA-006,
                           DATA-003, INT-006, SEC-006, SEC-002, UX-006,
                           NFR-006, PEN-006
                           Pasta: docs/04_modules/mod-006-execucao-casos/
```

### Fase 2: Enriquecimento — CONCLUIDO

O enriquecimento do MOD-006 foi executado em 2026-03-19 com todos os 10 agentes. O CHANGELOG do modulo registra apenas 3 versoes de agentes (v0.2.0 AGN-DEV-01, v0.3.0 AGN-DEV-09, v0.4.0 AGN-DEV-10), mas os headers dos artefatos de requisitos confirmam a execucao de todos os 10 agentes (AGN-DEV-02 em BR-006, AGN-DEV-03 em FR-006, AGN-DEV-04 em DATA-003/DATA-006, AGN-DEV-05 em INT-006, AGN-DEV-06 em SEC-002/SEC-006, AGN-DEV-07 em UX-006, AGN-DEV-08 em NFR-006). 5 pendencias foram identificadas — todas com severidade ALTA ou MEDIA — e todas resolvidas no mesmo dia. Destaque para o motor de transicao atomico (ADR-001), freeze de cycle_version_id (ADR-002), 3 historicos independentes (ADR-003), e 2 amendments cross-module no Foundation (DOC-FND-000-M01 para 6 scopes, DOC-FND-000-M02 para scope reopen).

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-006
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-006
> ```

```
4    /enrich docs/04_modules/mod-006-execucao-casos/
                           Agentes executados sobre mod-006:                 CONCLUIDO
                           AGN-DEV-01 (MOD), AGN-DEV-02 (BR),              v0.4.0 (2026-03-19)
                           AGN-DEV-03 (FR), AGN-DEV-04 (DATA),
                           AGN-DEV-05 (INT), AGN-DEV-06 (SEC),
                           AGN-DEV-07 (UX), AGN-DEV-08 (NFR),
                           AGN-DEV-09 (ADR), AGN-DEV-10 (PEN)
                           5 pendentes criadas e resolvidas (001-005)
                           2 amendments cross-module no Foundation
```

#### Rastreio de Agentes — MOD-006

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-006-execucao-casos.md | CONCLUIDO | CHANGELOG v0.2.0 — narrativa arquitetural expandida (aggregate root, value objects, domain services), referencia EX-ESC-001 |
| 2 | AGN-DEV-02 | BR | BR-006.md | CONCLUIDO | BR-006 v0.2.0 — Gherkin adicionado a regras existentes, BR-011 a BR-017 adicionados (delegacao expira, valid_until, reabertura) |
| 3 | AGN-DEV-03 | FR | FR-006.md | CONCLUIDO | FR-006 v0.2.0 — Gherkin, done funcional, dependencias, idempotencia e timeline/notifications detalhados |
| 4 | AGN-DEV-04 | DATA | DATA-006.md, DATA-003.md | CONCLUIDO | DATA-006 v0.2.0 — constraints, value objects, invariantes, migracao, relacionamentos cross-module; DATA-003 v0.2.0 — maskable_fields, payload_policy, outbox |
| 5 | AGN-DEV-05 | INT | INT-006.md | CONCLUIDO | INT-006 v0.2.0 — contratos request/response detalhados, headers, erros RFC 9457, integracoes consumidas com failure behavior |
| 6 | AGN-DEV-06 | SEC | SEC-006.md, SEC-002.md | CONCLUIDO | SEC-006 v0.2.0 — classificacao, LGPD, mascaramento, retencao, input validation, row-level authz; SEC-002 v0.2.0 — regras Emit/View/Notify, masking |
| 7 | AGN-DEV-07 | UX | UX-006.md | CONCLUIDO | UX-006 v0.2.0 — jornadas detalhadas, action_ids UX-010, estados loading/empty/error, happy path, alternativas, mapeamento endpoint/event |
| 8 | AGN-DEV-08 | NFR | NFR-006.md | CONCLUIDO | NFR-006 v0.2.0 — SLOs detalhados, concorrencia, input validation, DR, escalabilidade futura, testabilidade |
| 9 | AGN-DEV-09 | ADR | ADR-001 a ADR-005 | CONCLUIDO | CHANGELOG v0.3.0 — 5 ADRs: motor atomico, freeze cycle_version_id, 3 historicos independentes, optimistic locking, background job expiracao |
| 10 | AGN-DEV-10 | PEN | pen-006-pendente.md | CONCLUIDO | CHANGELOG v0.4.0 — 5 questoes abertas registradas, todas resolvidas em 2026-03-19 |

#### Pendentes Resolvidas no Enriquecimento — Resumo Compacto

> As 5 pendencias foram identificadas durante o enriquecimento e todas decididas e implementadas em 2026-03-19.

| # | ID | Status | Sev. | Decisao (1 linha) | Artefato |
|---|---|---|---|---|---|
| 1 | PENDENTE-001 | IMPLEMENTADA | ALTA | Opcao B — scope dedicado `process:case:reopen` | DOC-FND-000-M02 (amendment) |
| 2 | PENDENTE-002 | IMPLEMENTADA | ALTA | Opcao B — DelegationCheckerPort pattern para expiracao atribuicoes | ADR-005, FR-014, INT-006 §3.2 |
| 3 | PENDENTE-003 | IMPLEMENTADA | MEDIA | Opcao A — query param dedicado `object_id` (exact match B-tree) | FR-009, INT-006 §2.7 |
| 4 | PENDENTE-004 | IMPLEMENTADA | ALTA | Opcao A — amendment imediato DOC-FND-000-M01 (6 scopes process:case:*) | DOC-FND-000-M01 (amendment) |
| 5 | PENDENTE-005 | IMPLEMENTADA | MEDIA | Opcao B — `target_stage_id` obrigatorio no REOPENED, gates recriados PENDING | FR-007, FR-002, DATA-006, BR-016 |

> Detalhes completos: requirements/pen-006-pendente.md

---

### Fase 3: Validacao — CONCLUIDA

O `/validate-all` foi executado em 2026-03-22 com resultado PASS: 29/29 manifests validos em todos os pilares. Os 2 screen manifests proprios do MOD-006 (ux-case-001, ux-case-002) passaram na validacao contra schema v1. Nenhuma pendencia adicional identificada. Fase 3 CONCLUIDA.

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
5    /validate-all docs/04_modules/mod-006-execucao-casos/
                           Orquestra TODAS as validacoes em sequencia:        CONCLUIDO (2026-03-22)
                           Internamente executa:
                             1. /qa (lint, links, metadados, EX-*, §N, ciclos)
                             2. /validate-manifest (screen manifests vs schema v1)
                             3. /validate-openapi → FUTURO (pos-codigo)
                             4. /validate-drizzle → FUTURO (pos-codigo)
                             5. /validate-endpoint → FUTURO (pos-codigo)
                           Pre-condicao: Enriquecimento concluido
                           Pos-condicao: Relatorio consolidado PASS
```

> **Alternativa:** Executar validadores individuais:

```
5a   /qa docs/04_modules/mod-006-execucao-casos/
                           Diagnostico de sintaxe e integridade:              PASS
                           - lint:docs (Pass A-E: EX-*, §N, IDs, context-map, ciclos)
                           - Consistencia de metadados (estado_item, owner)
                           - Dead links, DoR alignment

5b   /validate-manifest ux-case-001.painel-caso.yaml
                           Validar manifests contra schema v1:               PASS
                           - ux-case-001.painel-caso.yaml
                           - ux-case-002.listagem-casos.yaml
                           Verifica: DOC-UX-010, operationId, RBAC,
                           telemetria, permissions

5c   /validate-openapi                                                       FUTURO (pos-codigo)
5d   /validate-drizzle                                                       FUTURO (pos-codigo)
5e   /validate-endpoint                                                      FUTURO (pos-codigo)
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | `/qa` | SIM (todos) | SIM — PASS | mod-006-execucao-casos.md, requirements/*, adr/*, CHANGELOG.md |
| 2 | `/validate-manifest` | SIM (2 manifests existem) | SIM — PASS | ux-case-001.painel-caso, ux-case-002.listagem-casos |
| 3 | `/validate-openapi` | SIM (Nivel 2) | FUTURO (pos-codigo) | apps/api/openapi/mod-006-execucao-casos.yaml — nao existe ainda |
| 4 | `/validate-drizzle` | SIM (Nivel 2) | FUTURO (pos-codigo) | apps/api/src/modules/case-execution/domain/ — nao existe |
| 5 | `/validate-endpoint` | SIM (Nivel 2) | FUTURO (pos-codigo) | apps/api/src/modules/case-execution/presentation/routes/ — nao existe |

### Fase 4: Promocao — CONCLUIDA

A promocao do MOD-006 foi executada em 2026-03-23 via `/promote-module`. O manifesto foi selado como READY v1.0.0 com todos os requisitos e ADRs selados. O CHANGELOG do modulo registra a entrada v1.0.0 com responsavel `promote-module`. O pipeline Mermaid avancou para Etapa 5 (Selo READY). O BLK-002 (MOD-005 → MOD-006) nao impediu a promocao da especificacao — afeta apenas a geracao de codigo.

```
10   /promote-module docs/04_modules/mod-006-execucao-casos/
                           Selar mod-006 como READY:                         CONCLUIDO (2026-03-23)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (5/5 IMPLEMENTADA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (10/10)
                             [DoR-3] Zero erros de lint? ................ SIM (validate-all 2026-03-22 PASS)
                             [DoR-4] Screen manifests validados? ........ SIM (2/2 manifests PASS)
                             [DoR-5] ADRs conforme nivel? ............... SIM (5 >= 3 para N2)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v1.0.0)
                             [DoR-7] Bloqueios cross-modulo? ............ OK (BLK-002 afeta codegen, nao spec)

                           Fluxo interno executado:
                             Step 1: /qa (pre-check) — PASS
                             Step 2: Promover estado_item DRAFT→READY
                             Step 3: /qa (pos-check) — PASS
                             Step 4: /update-index
                             Step 5: /git commit
                           Resultado: estado_item = READY, version = 1.0.0, INDEX.md atualizado
```

### Fase 5: Geracao de Codigo — CONCLUIDA

Codegen completo executado em 2026-03-23 com todos os 6 agentes. Total: 46 arquivos gerados em 5 camadas (DB, CORE, APP, API, WEB) + validacao cruzada (VAL) PASS. O scaffold de aplicacao (apps/api/ e apps/web/) existia desde 2026-03-23. Como Nivel 2, todos os 6 agentes COD foram executados. Validacao cruzada confirmou consistencia Schema→Domain→Application→Presentation→Web, cobertura de 7 scopes e 11 domain events.

> **Decision tree de codegen:**
>
> ```
> Preciso gerar codigo para os modulos?
> ├── Scaffold existe? (apps/api/, apps/web/)
> │   └── NAO → /app-scaffold all (one-time, cria apps/api e apps/web)
> └── SIM → Qual escopo?
>     ├── Todos modulos READY (ordem topologica)  → /codegen-all (--dry-run para preview)
>     ├── Todos agentes de 1 modulo               → /codegen mod-006
>     └── 1 agente especifico                     → /codegen-agent mod-006 AGN-COD-XX
> ```

```
6    /app-scaffold all      Criar scaffold de aplicacao (one-time):          CONCLUIDO
                           - apps/api/ (Fastify + Drizzle + OpenAPI)          2026-03-23
                           - apps/web/ (React + Vite + TanStack)
                           Pos-condicao: apps/api/package.json, apps/web/package.json

7    /codegen mod-006       Gerar codigo para MOD-006 (6 agentes):           CONCLUIDO (2026-03-23)
                           Executado na ordem de dependencia:
                             AGN-COD-DB   → 3 arquivos (schema + relations + index)
                             AGN-COD-CORE → 15 arquivos (VOs, errors, events, services)
                             AGN-COD-APP  → 19 arquivos (6 ports + 13 use cases)
                             AGN-COD-API  → 2 arquivos (DTOs Zod + routes 16 endpoints)
                             AGN-COD-WEB  → 7 arquivos (types, API, hooks, pages)
                             AGN-COD-VAL  → PASS (validacao cruzada 6/6 checks)
                           Total: 46 arquivos gerados
                           Pos-condicao: Codigo gerado, validacao cruzada PASS
```

#### Rastreio de Agentes COD — MOD-006

| # | Agente | Camada | Path | Status | Arquivos |
|---|--------|--------|------|--------|----------|
| 1 | AGN-COD-DB | infrastructure | apps/api/db/schema/ | CONCLUIDO | 3 |
| 2 | AGN-COD-CORE | domain | apps/api/src/modules/case-execution/domain/ | CONCLUIDO | 15 |
| 3 | AGN-COD-APP | application | apps/api/src/modules/case-execution/application/ | CONCLUIDO | 19 |
| 4 | AGN-COD-API | presentation | apps/api/src/modules/case-execution/presentation/ | CONCLUIDO | 2 |
| 5 | AGN-COD-WEB | web | apps/web/src/modules/case-execution/ | CONCLUIDO | 7 |
| 6 | AGN-COD-VAL | validation | (cross-layer) | CONCLUIDO | 0 (PASS) |

#### Pre-requisitos para Codegen

1. **Scaffold de aplicacao:** `apps/api/package.json` e `apps/web/package.json` existem (scaffold concluido 2026-03-23).
2. **Ordem topologica:** MOD-006 esta na camada 4. Dependencias upstream (MOD-000, MOD-003, MOD-004, MOD-005) devem ter codigo gerado antes. Verificar status de codegen desses modulos.
3. **BLK-002:** Blueprints do MOD-005 + `cycle_version_id` freeze devem estar implementados em codigo. Enquanto MOD-005 nao tiver codigo, MOD-006 nao pode implementar a integracao BlueprintReaderPort.

```
8    /validate-openapi mod-006
                           Validar contrato OpenAPI apos geracao:            N/A (paths MOD-006 nao no v1.yaml)
                           apps/api/openapi/v1.yaml (tag case-execution)

9    /validate-drizzle mod-006
                           Validar schemas Drizzle apos geracao:             CONCLUIDO — PASS (7/7 regras)
                           apps/api/db/schema/case-execution.ts

10   /validate-endpoint mod-006
                           Validar endpoints Fastify apos geracao:           CONCLUIDO — PASS (8/10, 2 avisos)
                           apps/api/src/modules/case-execution/presentation/routes/cases.route.ts
```

### Fase 6: Pos-READY — SOB DEMANDA

O modulo esta READY e selado. Qualquer alteracao futura requer amendment formal via `/create-amendment`. Nao ha amendments proprios do MOD-006 ate o momento. Os 2 amendments cross-module (DOC-FND-000-M01 e DOC-FND-000-M02) foram criados durante o enriquecimento para registrar scopes no Foundation.

```
11   /update-specification docs/04_modules/mod-006-execucao-casos/requirements/fr/FR-006.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

12   /create-amendment FR-006 melhoria "descricao"
                           Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
                           Casos de uso previstos:
                           - Integracao com MOD-007 (parametrizacao contextual)
                           - Integracao com MOD-008 (trigger Protheus por transicao)
                           - Fluxo de aprovacao previa via MOD-009
```

#### Contexto dos Amendments Cross-Module

| Amendment | Modulo alvo | Contexto | Quando criado |
|-----------|-------------|----------|---------------|
| DOC-FND-000-M01 | MOD-000 (Foundation) | Registra 6 scopes `process:case:*` no catalogo canonico DOC-FND-000 §2.2. Desbloqueio do Gate CI para screen manifests. | Pre-READY (2026-03-19, durante enriquecimento) |
| DOC-FND-000-M02 | MOD-000 (Foundation) | Registra scope `process:case:reopen` para acao excepcional de reabertura de caso COMPLETED. | Pre-READY (2026-03-19, durante enriquecimento) |

### Gestao de Pendencias (qualquer momento)

> **Decision tree de pendencias:**
>
> ```
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-006
> ├── Criar nova pendencia     → /manage-pendentes create PEN-006
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-006 PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-006 PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-006 PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-006 PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-006
> ```

```
16   /manage-pendentes list PEN-006
                           Estado atual MOD-006:
                             PEN-006: 5 itens total
                               5 IMPLEMENTADA (001-005)
                               0 ABERTA
                             SLA: nenhum vencido
```

#### Painel de Pendencias — Resumo Compacto

| # | ID | Status | Sev. | Decisao (1 linha) | Artefato |
|---|---|---|---|---|---|
| 1 | PENDENTE-001 | IMPLEMENTADA | ALTA | Opcao B — scope dedicado `process:case:reopen` | DOC-FND-000-M02 |
| 2 | PENDENTE-002 | IMPLEMENTADA | ALTA | Opcao B — DelegationCheckerPort pattern | ADR-005, FR-014, INT-006 §3.2 |
| 3 | PENDENTE-003 | IMPLEMENTADA | MEDIA | Opcao A — query param `object_id` exact match | FR-009, INT-006 §2.7 |
| 4 | PENDENTE-004 | IMPLEMENTADA | ALTA | Opcao A — amendment imediato DOC-FND-000-M01 | DOC-FND-000-M01 |
| 5 | PENDENTE-005 | IMPLEMENTADA | MEDIA | Opcao B — `target_stage_id` obrigatorio no REOPENED | FR-007, FR-002, DATA-006, BR-016 |

> Detalhes completos: requirements/pen-006-pendente.md

### Utilitarios (qualquer momento)

```
14   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-006): <descricao>

15   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

17   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-006

```
US-MOD-006 (READY v0.9.0)             <- Fase 0: CONCLUIDA
  |  4/4 features READY (2 backend + 2 UX)
  |  Nivel 2 — DDD-lite + Full Clean (score 5/6)
  v
mod-006-execucao-casos/ (stubs DRAFT)  <- Fase 1: CONCLUIDA (forge-module v0.1.0)
  |
  v
mod-006 enriquecido (DRAFT v0.4.0)    <- Fase 2: CONCLUIDA (10 agentes, 5 PENDENTEs resolvidas)
  |
  v
mod-006 validado (DRAFT)               <- Fase 3: CONCLUIDA (validate-all 2026-03-22 PASS, 29/29)
  |  +-- /qa .................. PASS
  |  +-- /validate-manifest ... PASS (2 manifests)
  |  +-- /validate-openapi .... FUTURO (pos-codigo)
  |  +-- /validate-drizzle .... FUTURO (pos-codigo)
  |  +-- /validate-endpoint ... FUTURO (pos-codigo)
  |
  v
mod-006 selado (READY v1.0.0)          <- Fase 4: CONCLUIDA (promote-module 2026-03-23)
  |  Gate 0 (DoR): 7/7 atendidos
  |
  +-- CONCLUIDO: /codegen mod-006 (46 arquivos)
  |
  v
mod-006 codigo gerado                  <- Fase 5: CONCLUIDA (6 agentes, 46 arquivos, 2026-03-23)
  |  DB(3) + CORE(15) + APP(19) + API(2) + WEB(7) + VAL(PASS)
  |  Validacao cruzada PASS em todas as camadas
  |
  v
mod-006 + amendments/                  <- Fase 6: SOB DEMANDA (0 amendments proprios)

Dependencias upstream: MOD-000 + MOD-003 + MOD-004 + MOD-005
Camada topologica: 4 (implementar apos MOD-000 -> MOD-003 -> MOD-004 -> MOD-005)
Dependentes downstream: MOD-007 (Parametrizacao), MOD-008 (Protheus), MOD-009 (Aprovacao)
Bloqueio recebido: BLK-002 — blueprints + cycle_version_id freeze de MOD-005 (implementacao, nao spec)
Amendments cross-module: DOC-FND-000-M01 (6 scopes), DOC-FND-000-M02 (scope reopen)
```

---

## Particularidades do MOD-006

| Aspecto | Detalhe |
|---------|---------|
| Epico e features selados READY | US-MOD-006 promovido de APPROVED a READY (v0.9.0) em 2026-03-23, com DoR 9/9 completo. Features F01-F04 tambem seladas READY (v0.9.0). Manifesto READY v1.0.0. Ciclo documental completo. |
| Motor de transicao com 5 validacoes sequenciais | O motor de transicao implementa 5 passos obrigatorios: (1) caso OPEN, (2) transicao valida no blueprint, (3) papel autorizado, (4) gates required resolvidos, (5) evidencia fornecida se required. Qualquer falha retorna 422 com motivo especifico. ADR-001 garante atomicidade em transacao unica. |
| 3 historicos independentes | stage_history, gate_instances e case_events/case_assignments sao historicos independentes com timeline intercalada. Um estagio pode durar dias e ter 3 reatribuicoes sem mudanca de estagio. ADR-003 documenta esta decisao e suas implicacoes para queries e performance. |
| Freeze de cycle_version_id | O caso nunca "sente" mudancas no blueprint. Ao abrir, captura `cycle_version_id` vigente. Fork ou atualizacao no MOD-005 nao afeta instancias em andamento. ADR-002 documenta esta decisao e a separacao blueprint/execucao. |
| 2 amendments cross-module no Foundation | PENDENTE-004 e PENDENTE-001 resultaram em 2 amendments no MOD-000: DOC-FND-000-M01 (6 scopes process:case:*) e DOC-FND-000-M02 (scope process:case:reopen). Isso demonstra o impacto cross-module do MOD-006 sobre o catalogo de scopes do Foundation. |
| BLK-002 e cadeia de dependencias longa | MOD-006 esta na camada topologica 4 com a cadeia mais longa: MOD-000 → MOD-003 → MOD-004 → MOD-005 → MOD-006. O BLK-002 (blueprints publicados) e a dependencia mais critica para implementacao. A especificacao ja esta READY independentemente. |
| 5 ADRs — maior quantidade do projeto | Excede significativamente o minimo de 3 ADRs para Nivel 2. Cada ADR resolve um problema arquitetural especifico: atomicidade do motor, freeze de versao, historicos independentes, concorrencia otimista, e expiracao de atribuicoes via background job. |
| Nivel 2 completo com todas as 6 camadas COD | Como modulo DDD-lite + Full Clean (score 5/6), todos os 6 agentes COD sao aplicaveis. Isso inclui AGN-COD-CORE (domain layer) que e exclusivo de Nivel 2. A estrutura de codigo prevista inclui aggregates, entities, value-objects, domain-services, domain-events, use-cases, ports e DTOs. |

---

## Checklist Rapido — O que Falta para Codigo

- [x] Enriquecimento completo (10 agentes, 5 pendencias resolvidas)
- [x] Executar `/validate-all` — /qa + /validate-manifest PASS (2026-03-22)
- [x] Executar `/promote-module` — READY v1.0.0 (2026-03-23)
- [x] Executar `/app-scaffold all` — scaffold apps/ concluido (2026-03-23)
- [x] Executar `/codegen mod-006` — 6 agentes, 46 arquivos gerados (2026-03-23)
- [x] Executar `/validate-all` pos-codigo — PASS (0 bloqueadores, 4 avisos) (2026-03-23)
  - [x] QA: PASS
  - [x] Manifests: 2/2 PASS
  - [ ] OpenAPI: N/A (paths pendentes no v1.yaml)
  - [x] Drizzle: PASS (7/7)
  - [x] Endpoints: PASS (8/10, 2 avisos)

> **Nota:** A especificacao esta completa e selada (READY v1.0.0). Todas as 5 pendencias estao IMPLEMENTADA. Os 10 artefatos de requisitos e 5 ADRs estao selados. O proximo marco e a geracao de codigo, que depende do scaffold de aplicacao e da ordem topologica. O BLK-002 (MOD-005 → MOD-006) exige que os blueprints do MOD-005 estejam implementados em codigo antes que o MOD-006 possa implementar BlueprintReaderPort e DelegationCheckerPort. A geracao de codigo do MOD-006 desbloqueia MOD-007 (Parametrizacao), MOD-008 (Protheus) e MOD-009 (Aprovacao) na camada seguinte.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 4.1.0 | 2026-03-23 | Atualizacao: validate-all pos-codigo executado — PASS (0 bloqueadores, 4 avisos). Checklist atualizado. Execution state com secao validations |
| 4.0.0 | 2026-03-23 | Atualizacao: Fase 5 CONCLUIDA — codegen completo (6 agentes, 46 arquivos). Rastreio de agentes COD atualizado. Checklist atualizado. Resumo visual atualizado. Validadores pos-codigo marcados PENDENTE |
| 3.1.0 | 2026-03-23 | Atualizacao: Epico APPROVED→READY (v0.9.0) e features F01-F04 APPROVED→READY (v0.9.0). Execution state atualizado com secao promotion. INDEX.md e manifesto sincronizados com status READY |
| 3.0.0 | 2026-03-23 | Atualizacao: Fase 4 CONCLUIDA (promote-module 2026-03-23, READY v1.0.0). Fase 5 NAO INICIADA (codegen). CHANGELOG Mermaid corrigido (Etapa 5). Checklist atualizado para foco em codegen. Rastreio de 6 agentes COD adicionado. Pre-requisitos de codegen detalhados (scaffold + ordem topologica + BLK-002) |
| 2.0.0 | 2026-03-23 | Recriacao: Fase 3 CONCLUIDA (validate-all 2026-03-22 PASS 29/29 manifests). Fase 4 PENDENTE. DoR Gate 0 6/7 (BLK-002 nao bloqueia spec). Rastreio de 10 agentes via CHANGELOG+requirements. Pendencias compactadas (referencia pen file). 2 amendments cross-module. Proximo passo: /promote-module |
| 1.0.0 | 2026-03-22 | Criacao completa: Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 5 pendentes resolvidas (001-005), rastreio de 10 agentes, mapa de cobertura de 5 validadores, particularidades Nivel 2 DDD-lite, bloqueio BLK-002, 2 amendments cross-module |
