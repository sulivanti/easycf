# Procedimento — Plano de Acao MOD-004 Identidade Avancada

> **Versao:** 9.0.0 | **Data:** 2026-03-24 | **Owner:** Marcos Sulivan
> **Estado atual do modulo:** READY (v1.0.0) | **Epico:** READY (v1.1.0) | **Features:** 4/4 READY
>
> Todas as 5 pendencias resolvidas (5/5 IMPLEMENTADA). PENDENTE-004 (lint) e PENDENTE-005 (DomainError base class) corrigidas em codigo. Lint MOD-004 limpo, identity-errors.ts agora estende DomainError (RFC 9457 compliant). Proximo passo: `pnpm install` → `pnpm test`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-004 | READY (v1.1.0) | DoR completo, 4 features vinculadas, EP02 |
| Features F01-F04 | 4/4 READY | F01 (API: user_org_scopes), F02 (API: shares+delegations+job expiracao), F03 (UX: escopo org), F04 (UX: painel shares/delegations) |
| Scaffold (forge-module) | CONCLUIDO | mod-004-identidade-avancada/ com estrutura completa Nivel 2 |
| Enriquecimento (10 agentes) | CONCLUIDO | Agentes 01-10 confirmados, v0.9.0, 3 pendentes resolvidas |
| Codegen (6 agentes) | CONCLUIDO (6/6) | DB (3), CORE (7), APP (12), API (3), WEB (12), VAL (0 — validacao). 37 arquivos gerados. Validacao cruzada aprovada com ressalvas menores. |
| PENDENTEs | 0 abertas | 5 total: 5 IMPLEMENTADA (001-005 todas resolvidas) |
| ADRs | 4 criadas | Nivel 2 requer minimo 3 — atendido (ADR-001 auto-auth service, ADR-002 tenant_id RLS, ADR-003 outbox pattern, ADR-004 regex escopos proibidos) |
| Amendments | 0 | Nenhum |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v1.2.0 | Ultima entrada 2026-03-24 (validate-all pos-codegen) |
| Screen Manifests | 2/2 existem | ux-idn-001.org-scope, ux-idn-002.shares-delegations |
| Dependencias | 2 upstream (MOD-000, MOD-003) | Ambos READY (v1.0.0). Consome auth/RBAC/events de MOD-000 e org_units de MOD-003 |
| Bloqueios | 0 sobre MOD-004 | Nenhum BLK-* afeta MOD-004. MOD-004 emite BLK-003 (MOD-005 depende de org_scopes) |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-004 define a camada de identidade avancada que preenche a lacuna entre MOD-000 (identidade operacional basica — quem pode fazer o que em qual filial) e MOD-003 (estrutura organizacional — onde a organizacao existe). Tres mecanismos — escopo de area organizacional (`user_org_scopes`), compartilhamento controlado (`access_shares`) e delegacao temporaria (`access_delegations`) — resolvem o problema "em qual area organizacional um usuario atua". Com 4 features cobrindo backend (F01, F02) e frontend (F03, F04), o modulo foi aprovado como READY com DoR completo.

```
1    (manual)              Revisar e finalizar epico US-MOD-004:             CONCLUIDO
                           - Escopo fechado (4 features: 2 backend + 2 UX)  status_agil = READY
                           - Gherkin validado (6 cenarios epico)             v1.1.0
                           - DoR completo (modelo de dados, endpoints, regras)
                           - Gap MOD-000 vs MOD-004 documentado
                           - Decisoes tecnicas 2026-03-15 incorporadas
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-004.md

2    (manual)              Revisar e finalizar features F01-F04:             CONCLUIDO
                           - F01: API user_org_scopes (CRUD + Redis)         4/4 READY
                           - F02: API access_shares + access_delegations + job
                           - F03: UX Escopo organizacional do usuario
                           - F04: UX Compartilhamentos e delegacoes ativas
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-004-F{01..04}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Primeiro modulo Nivel 2 (DDD-lite + Clean Completo) scaffoldado na camada topologica 2. Score 5/6 no DOC-ESC-001 §4.2 com gatilhos: estado/workflow, compliance/auditoria, concorrencia/consistencia, multi-tenant e regras cruzadas/reuso alto.

```
3    /forge-module MOD-004  Scaffold completo gerado:                        CONCLUIDO
                           mod-004-identidade-avancada.md, CHANGELOG.md,    v0.1.0 (2026-03-16)
                           requirements/ (br/, fr/, data/, int/, sec/,
                           ux/, nfr/), adr/, amendments/
                           Stubs obrigatorios: BR-001, FR-001, DATA-001,
                           DATA-003, INT-001, SEC-001, SEC-002, UX-001,
                           NFR-001, PEN-004
                           Pasta: docs/04_modules/mod-004-identidade-avancada/
```

### Fase 2: Enriquecimento — CONCLUIDO

O enriquecimento do MOD-004 foi completo — todos os 10 agentes rodaram entre 2026-03-16 e 2026-03-18 em 2 batches (batch 1: AGN-DEV-01 a AGN-DEV-03 em 2026-03-16; batch 2: AGN-DEV-04 a AGN-DEV-10 em 2026-03-17). Durante o processo, 3 pendencias foram identificadas e todas resolvidas. Destaque para o enriquecimento profundo exigido pelo Nivel 2: DDD-lite com aggregates, value objects, domain events (9 catalogados), Outbox Pattern, cache Redis com invalidacao+TTL, e 11 endpoints documentados.

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-004
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-004
> ```

```
4    /enrich docs/04_modules/mod-004-identidade-avancada/
                           Agentes executados sobre mod-004:                 CONCLUIDO
                           AGN-DEV-01 (MOD), AGN-DEV-02 (BR),              v0.9.0 (2026-03-17)
                           AGN-DEV-03 (FR), AGN-DEV-04 (DATA),
                           AGN-DEV-05 (INT), AGN-DEV-06 (SEC),
                           AGN-DEV-07 (UX), AGN-DEV-08 (NFR),
                           AGN-DEV-09 (ADR), AGN-DEV-10 (PEN)
                           3 pendentes criadas e resolvidas (001-003)
```

#### Rastreio de Agentes — MOD-004

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-004-identidade-avancada.md | CONCLUIDO | CHANGELOG v0.2.0 — Nivel 2 confirmado (score 5/6), module_paths detalhados (API+Web), OKRs, premissas/restricoes |
| 2 | AGN-DEV-02 | BR | BR-001.md | CONCLUIDO | v0.3.0 — Gherkin expandido de 4 para 14 cenarios, exemplos concretos, excecoes, impactos categorizados (DATA/FLOW/PERMISSIONS/STATE/COMPLIANCE) |
| 3 | AGN-DEV-03 | FR | FR-001.md | CONCLUIDO | v0.3.0 — 24 cenarios Gherkin (6+7+6+5), 11 endpoints consolidados, deps expandidas (INT-001, DATA-003, SEC-002) |
| 4 | AGN-DEV-04 | DATA | DATA-001.md, DATA-003.md | CONCLUIDO | v0.4.0 — tenant_id RLS, 12 indices explicitos, constraints ON DELETE RESTRICT, ERD expandido, outbox com dedupe_key, UI Actions DOC-ARC-003 |
| 5 | AGN-DEV-05 | INT | INT-001.md | CONCLUIDO | v0.5.0 — failure_behavior detalhado, contratos MOD-000/MOD-003, contrato exposicao INT-001.5 (user_org_scopes para MOD-005/006/007/008), TTL cache 300s |
| 6 | AGN-DEV-06 | SEC | SEC-001.md, SEC-002.md | CONCLUIDO | v0.6.0 — 11 endpoints mapeados com scopes, RLS, mascaramento por sensitivity_level, LGPD, Gherkin seguranca (5+4 cenarios) |
| 7 | AGN-DEV-07 | UX | UX-001.md | CONCLUIDO | v0.7.0 — 15 acoes mapeadas (4 UX-IDN-001 + 11 UX-IDN-002), telemetria UIActionEnvelope, acessibilidade, estados por painel, tratamento erros HTTP |
| 8 | AGN-DEV-08 | NFR | NFR-001.md | CONCLUIDO | v0.9.0 — SLOs (latencia p95, cache), topologia sync+async, degradacao (4 cenarios), health checks (4), metricas Prometheus (7), estrategia testes Nivel 2 |
| 9 | AGN-DEV-09 | ADR | ADR-001, ADR-002, ADR-003, ADR-004 | CONCLUIDO | v0.8.0 — 4 ADRs criadas: auto-auth service (ADR-001), tenant_id RLS (ADR-002), outbox pattern (ADR-003), regex escopos proibidos (ADR-004) |
| 10 | AGN-DEV-10 | PEN | pen-004-pendente.md | CONCLUIDO | v0.1.0 — 3 pendentes criadas (scopes catalogo, contrato exposicao, TTL cache) |

#### Pendentes Resolvidas no Enriquecimento — Resumo Compacto

> As 3 pendencias foram identificadas durante o enriquecimento e todas decididas e implementadas em 2026-03-18.

| # | ID | Status | Sev. | Decisao (1 linha) | Artefato |
|---|---|---|---|---|---|
| 1 | PENDENTE-001 | IMPLEMENTADA | ALTA | Opcao A — 8 scopes identity:* registrados em DOC-FND-000 §2.2 | DOC-FND-000 §2.2 |
| 2 | PENDENTE-002 | IMPLEMENTADA | MEDIA | Opcao A — Contrato exposicao user_org_scopes em INT-001.5 | INT-001.5 v0.5.0 |
| 3 | PENDENTE-003 | IMPLEMENTADA | MEDIA | Opcao A — TTL 300s no cache Redis como safety net | INT-001.1 v0.4.0 |

> Detalhes completos: requirements/pen-004-pendente.md

---

### Fase 3: Validacao — CONCLUIDA

O `/validate-all` foi executado em 2026-03-22 com resultado PASS: 29/29 manifests validos em todos os pilares. Os 2 screen manifests proprios do MOD-004 (ux-idn-001, ux-idn-002) passaram na validacao contra schema v1. Nenhuma pendencia adicional identificada. Fase 3 CONCLUIDA.

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
5    /validate-all docs/04_modules/mod-004-identidade-avancada/
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
5a   /qa docs/04_modules/mod-004-identidade-avancada/
                           Diagnostico de sintaxe e integridade:              PASS
                           - lint:docs (Pass A-E: EX-*, §N, IDs, context-map, ciclos)
                           - Consistencia de metadados (estado_item, owner)
                           - Dead links, DoR alignment

5b   /validate-manifest ux-idn-001.org-scope.yaml
                           Validar manifests contra schema v1:               PASS
                           - ux-idn-001.org-scope.yaml
                           - ux-idn-002.shares-delegations.yaml
                           Verifica: DOC-UX-010, operationId, RBAC,
                           telemetria, permissions

5c   /validate-openapi                                                       FUTURO (pos-codigo)
5d   /validate-drizzle                                                       FUTURO (pos-codigo)
5e   /validate-endpoint                                                      FUTURO (pos-codigo)
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | `/qa` | SIM (todos) | SIM — PASS | mod-004-identidade-avancada.md, requirements/*, adr/*, CHANGELOG.md |
| 2 | `/validate-manifest` | SIM (2 manifests existem) | SIM — PASS | ux-idn-001.org-scope, ux-idn-002.shares-delegations |
| 3 | `/validate-openapi` | SIM (Nivel 2) | SIM — PASS com ressalvas (AGN-COD-VAL 2026-03-23) | apps/api/openapi/v1.yaml (11 endpoints). Ressalvas: 401 responses ausentes, x-permissions self-service |
| 4 | `/validate-drizzle` | SIM (Nivel 2) | SIM — APROVADO CONDICIONAL (AGN-COD-VAL 2026-03-23) | apps/api/db/schema/identity-advanced.ts (3 tabelas). Condicional: Zod schemas minor |
| 5 | `/validate-endpoint` | SIM (Nivel 2) | SIM — PASS (AGN-COD-VAL 2026-03-23) | apps/api/src/modules/identity-advanced/presentation/routes/identity-advanced.route.ts (11 endpoints) |

### Fase 4: Promocao — CONCLUIDA

A promocao do MOD-004 foi executada em 2026-03-23 via `/promote-module`, avancando `estado_item` de DRAFT (v0.9.0) para READY (v1.0.0). O Gate 0 (DoR) foi atendido em todos os 7 criterios. O CHANGELOG do modulo registra a Etapa 5 (Selo READY) no pipeline Mermaid. Todos os requisitos e ADRs foram selados como READY. Esta promocao torna o MOD-004 elegivel para geracao de codigo (Fase 5).

```
6    /promote-module docs/04_modules/mod-004-identidade-avancada/
                           Selar mod-004 como READY:                         CONCLUIDO (2026-03-23)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (3/3 IMPLEMENTADA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (10/10)
                             [DoR-3] Zero erros de lint? ................ SIM (validate-all 2026-03-22 PASS)
                             [DoR-4] Screen manifests validados? ........ SIM (2/2 manifests PASS)
                             [DoR-5] ADRs conforme nivel? ............... SIM (4 >= 3 para N2)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v1.0.0)
                             [DoR-7] Bloqueios cross-modulo? ............ SIM (0 bloqueios sobre MOD-004)

                           Fluxo interno executado:
                             Step 1: /qa (pre-check) — PASS
                             Step 2: Promover estado_item DRAFT→READY (v1.0.0)
                             Step 3: /qa (pos-check) — PASS
                             Step 4: /update-index
                             Step 5: /git commit
                           Pos-condicao: estado_item = READY, INDEX.md atualizado, commit
```

### Fase 5: Geracao de Codigo — CONCLUIDA (6/6 agentes)

O codegen do MOD-004 foi concluido em 2026-03-23 com todos os 6 agentes executados: DB (schemas Drizzle), CORE (aggregates, VOs, domain errors), APP (use cases, ports, domain events), API (routes, DTOs, OpenAPI), WEB (12 arquivos: types, queries, commands, mappers, permissions, rules, view-models, 2 telas React, 3 componentes) e VAL (validacao cruzada). Total: 37 arquivos de codigo cobrindo toda a stack full-stack (infraestrutura → dominio → aplicacao → apresentacao → frontend → validacao).

> **Decision tree de codegen:**
>
> ```
> Preciso gerar codigo para os modulos?
> ├── Scaffold existe? (apps/api/, apps/web/)
> │   └── NAO → /app-scaffold all (one-time, cria apps/api e apps/web)
> └── SIM → Qual escopo?
>     ├── Todos modulos READY (ordem topologica)  → /codegen-all (--dry-run para preview)
>     ├── Todos agentes de 1 modulo               → /codegen mod-004
>     └── 1 agente especifico                     → /codegen-agent mod-004 AGN-COD-XX
> ```

```
7    /app-scaffold all      Criar scaffold de aplicacao:                      CONCLUIDO (2026-03-23)
                           - apps/api/ (Fastify + Drizzle + BullMQ)
                           - apps/web/ (React + TanStack)
                           Pre-condicao: Nenhuma (one-time setup)
                           Pos-condicao: package.json, tsconfig, estrutura base

8    /codegen mod-004       Gerar codigo para todas as camadas:               CONCLUIDO (6/6)
                           Nivel 2 — todos os 6 agentes executados
                           Slug: identity-advanced
                           Pre-condicao: /app-scaffold concluido
                           Resultado: DB (3), CORE (7), APP (12), API (3),
                           WEB (12), VAL (validacao). 37 arquivos totais.
                           Validacao cruzada: aprovada com ressalvas menores
```

#### Rastreio de Agentes COD — MOD-004

| # | Agente | Camada | Path | Status | Arquivos |
|---|--------|--------|------|--------|----------|
| 1 | AGN-COD-DB | infrastructure | apps/api/db/schema/ | DONE (2026-03-23 23:10) | 3 |
| 2 | AGN-COD-CORE | domain | apps/api/src/modules/identity-advanced/domain/ | DONE (2026-03-23 23:25) | 7 |
| 3 | AGN-COD-APP | application | apps/api/src/modules/identity-advanced/application/ | DONE (2026-03-23 23:45) | 12 |
| 4 | AGN-COD-API | presentation | apps/api/src/modules/identity-advanced/presentation/, apps/api/openapi/ | DONE (2026-03-24 00:10) | 3 |
| 5 | AGN-COD-WEB | web | apps/web/src/modules/identity-advanced/ | DONE (2026-03-23 22:30) | 12 |
| 6 | AGN-COD-VAL | validation | (cross-layer) | DONE (2026-03-23 23:00) | 0 |

#### Scaffold e Pre-requisitos

- **apps/api/package.json:** EXISTE — criado via `/app-scaffold all` (2026-03-23)
- **apps/web/package.json:** EXISTE — criado via `/app-scaffold all` (2026-03-23)
- **Dependencias upstream com codigo:** MOD-000 (READY) e MOD-003 (READY) — ambos elegiveis para codegen. Ordem topologica ideal: MOD-000 → MOD-003 → MOD-004.
- **Nota:** O `/codegen-all` respeita a ordem topologica automaticamente. Se preferir gerar apenas MOD-004, assegure que MOD-000 e MOD-003 ja tenham codigo gerado (tabelas referenciadas por FK e APIs consumidas).

### Fase 6: Pos-READY — SOB DEMANDA

```
9    /update-specification docs/04_modules/mod-004-identidade-avancada/requirements/fr/FR-001.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

10   /create-amendment FR-001 melhoria "descricao"
                           Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
                           Casos de uso previstos:
                           - Revisao periodica de acessos (Wave 3)
                           - Contas tecnicas e agentes (Wave 4+)
```

### Gestao de Pendencias (qualquer momento)

> **Decision tree de pendencias:**
>
> ```
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-004
> ├── Criar nova pendencia     → /manage-pendentes create PEN-004
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-004 PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-004 PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-004 PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-004 PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-004
> ```

```
11   /manage-pendentes list PEN-004
                           Estado atual MOD-004:
                             PEN-004: 5 itens total
                               5 IMPLEMENTADA (001-005)
                               0 ABERTA
                             SLA: nenhum vencido (todas resolvidas)
```

#### Painel de Pendencias — Resumo Compacto

| # | ID | Status | Sev. | Decisao (1 linha) | Artefato |
|---|---|---|---|---|---|
| 1 | PENDENTE-001 | IMPLEMENTADA | ALTA | Opcao A — 8 scopes identity:* registrados em DOC-FND-000 §2.2 | DOC-FND-000 §2.2 |
| 2 | PENDENTE-002 | IMPLEMENTADA | MEDIA | Opcao A — Contrato exposicao user_org_scopes em INT-001.5 | INT-001.5 v0.5.0 |
| 3 | PENDENTE-003 | IMPLEMENTADA | MEDIA | Opcao A — TTL 300s no cache Redis como safety net | INT-001.1 v0.4.0 |
| 4 | PENDENTE-004 | IMPLEMENTADA | MEDIA | Opcao A — Correcao incremental lint (4x no-explicit-any + Prettier) | identity-advanced.route.ts |
| 5 | PENDENTE-005 | IMPLEMENTADA | ALTA | Opcao A — Refatorar 12 subclasses → DomainError (code→type, httpStatus→statusHint) | identity-errors.ts |

> Detalhes completos: requirements/pen-004-pendente.md

### Utilitarios (qualquer momento)

```
12   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-004): <descricao>

13   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

14   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-004

```
US-MOD-004 (READY v1.1.0)              ← Fase 0: CONCLUIDA
  │  4/4 features READY (2 backend + 2 UX)
  │  Nivel 2 — DDD-lite + Clean Completo (score 5/6)
  ▼
mod-004-identidade-avancada/ (stubs DRAFT) ← Fase 1: CONCLUIDA (forge-module v0.1.0)
  │
  ▼
mod-004 enriquecido (DRAFT v0.9.0)     ← Fase 2: CONCLUIDA (10 agentes, 3 PENDENTEs resolvidas)
  │
  ▼
mod-004 validado (DRAFT)                ← Fase 3: CONCLUIDA (validate-all 2026-03-22 PASS, 29/29)
  │  ├── /qa .................. PASS
  │  ├── /validate-manifest ... PASS (2 manifests)
  │  ├── /validate-openapi .... FUTURO (pos-codigo)
  │  ├── /validate-drizzle .... FUTURO (pos-codigo)
  │  └── /validate-endpoint ... FUTURO (pos-codigo)
  │
  ▼
mod-004 selado (READY v1.0.0)          ← Fase 4: CONCLUIDA (promote-module 2026-03-23)
  │  Gate 0 (DoR): 7/7 atendidos
  │
  │
  ▼
mod-004 codigo gerado (completo)      ← Fase 5: CONCLUIDA (6/6 agentes, 37 arquivos)
  │  ✅ DB (3) → ✅ CORE (7) → ✅ APP (12) → ✅ API (3) → ✅ WEB (12) → ✅ VAL
  │  Validacao cruzada: aprovada com ressalvas menores
  │  pnpm lint: PASS (PENDENTE-004 implementada — 4x no-explicit-any corrigidos)
  │  PENDENTE-005: IMPLEMENTADA (12 subclasses → DomainError, RFC 9457 compliant)
  │  ★ PROXIMO PASSO: pnpm install → pnpm test
  │
  ▼
mod-004 + amendments/                  ← Fase 6: SOB DEMANDA (0 amendments)

Dependencias upstream: MOD-000 (Foundation, READY v1.0.0) + MOD-003 (Estrutura Org, READY v1.0.0)
Camada topologica: 2 (implementar apos MOD-000 e MOD-003)
Dependentes downstream: MOD-005 (Processos), MOD-006 (Execucao), MOD-007 (Parametrizacao), MOD-008 (Protheus), MOD-009 (Aprovacoes)
Bloqueio emitido: BLK-003 — MOD-005 depende de org_scopes de MOD-004
```

---

## Particularidades do MOD-004

| Aspecto | Detalhe |
|---------|---------|
| Hub de identidade avancada | MOD-004 preenche a lacuna entre MOD-000 (identidade basica: quem pode fazer o que em qual filial) e MOD-003 (estrutura organizacional: onde a organizacao existe). Tres mecanismos — escopo de area, compartilhamento controlado e delegacao temporaria — resolvem o problema "em qual area organizacional um usuario atua". Sua promocao desbloqueia BLK-003 e habilita MOD-005 (Processos) a avancar. |
| Nivel 2 com cache Redis obrigatorio | Unico modulo ate o momento que combina cache Redis com invalidacao por mutacao (`DEL auth:org_scope:user:{userId}`) E TTL safety net de 300s (decidido via PENDENTE-003). Background job BullMQ a cada 5min para expiracao automatica de shares/delegations/org_scopes via Outbox Pattern. |
| Regra inegociavel de delegacao | Delegacoes NUNCA podem conter escopos `:approve`, `:execute`, `:sign` — invariante de dominio protegido por regex no service (ADR-004). Esta regra impede que delegatarios tomem decisoes em nome do delegante, preservando segregacao de responsabilidade. |
| Validacao de autorizacao por scope (nao CHECK constraint) | Auto-autorizacao em compartilhamentos (`grantor_id = authorized_by`) e permitida condicionalmente ao scope `identity:share:authorize` — validacao no service, nao no banco (ADR-001). Decisao tecnica de 2026-03-15 removeu CHECK constraint absoluto. |
| 4 ADRs para Nivel 2 | Excede o minimo de 3 ADRs. ADR-001 (auto-auth service), ADR-002 (tenant_id RLS), ADR-003 (outbox pattern), ADR-004 (regex escopos proibidos). A riqueza de ADRs reflete decisoes arquiteturais nao-obvias do dominio de identidade. |
| Dependencias upstream READY | MOD-000 (v1.0.0) e MOD-003 (v1.0.0) estao ambos READY. A cadeia topologica esta totalmente desbloqueada para geracao de codigo. Rota sequencial ideal: MOD-000 → MOD-003 → MOD-004. |
| Codegen elegivel — 6 agentes | Nivel 2 qualifica para todos os 6 agentes COD: DB (migracoes+schemas), CORE (aggregates+VOs+domain events), APP (use cases+ports), API (endpoints+OpenAPI), WEB (telas+forms), VAL (validacao cruzada). Slug de codigo: `identity-advanced`. |

---

## Checklist Rapido — Status do Codigo

- [x] Epico READY (v1.1.0) — 4/4 features READY
- [x] Enriquecimento completo (10 agentes, 3 pendencias resolvidas)
- [x] Validacao PASS (validate-all 2026-03-22)
- [x] Promocao READY (v1.0.0, 2026-03-23)
- [x] Dependencias upstream READY (MOD-000 v1.0.0, MOD-003 v1.0.0)
- [x] Executar `/app-scaffold all` — CONCLUIDO (2026-03-23)
- [x] `/codegen mod-004 AGN-COD-DB` — 3 arquivos (schemas Drizzle) — DONE 2026-03-23
- [x] `/codegen mod-004 AGN-COD-CORE` — 7 arquivos (aggregates, VOs, errors) — DONE 2026-03-23
- [x] `/codegen mod-004 AGN-COD-APP` — 12 arquivos (use cases, ports, domain events) — DONE 2026-03-23
- [x] `/codegen mod-004 AGN-COD-API` — 3 arquivos (routes, DTOs, OpenAPI) — DONE 2026-03-24
- [x] `/codegen mod-004 AGN-COD-WEB` — 12 arquivos (types, queries, commands, components, screens) — DONE 2026-03-23
- [x] `/codegen mod-004 AGN-COD-VAL` — validacao cruzada aprovada com ressalvas menores — DONE 2026-03-23
- [x] Validacao pos-codigo: `/validate-drizzle` APROVADO CONDICIONAL, `/validate-openapi` PASS com ressalvas, `/validate-endpoint` PASS
- [ ] `pnpm install` — instalar dependencias
- [ ] `pnpm test` — executar testes
- [x] `pnpm lint` — PASS para MOD-004 (PENDENTE-004 implementada 2026-03-24: 4x `no-explicit-any` removidos + Prettier)
- [x] Resolver PENDENTE-005 — 12 subclasses refatoradas para estender DomainError (code→type `/problems/identity/*`, httpStatus→statusHint). RFC 9457 compliant. (2026-03-24)

> **Nota:** Codegen 6/6 agentes concluidos (37 arquivos). Todas as 5 pendencias resolvidas (5/5 IMPLEMENTADA). Lint e DomainError compliance corrigidos. Ressalvas menores do codegen: (1) 401 responses ausentes no OpenAPI, (2) x-permissions self-service, (3) scripts openapi:lint/serve (infra cross-modulo).

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 9.0.0 | 2026-03-24 | Atualizacao: PENDENTE-005 DECIDIDA (Opcao A) e IMPLEMENTADA — 12 subclasses refatoradas para estender DomainError (code→type /problems/identity/*, httpStatus→statusHint). RFC 9457 compliant. Todas as 5 pendencias agora IMPLEMENTADA. Proximo passo: pnpm install, pnpm test |
| 8.0.0 | 2026-03-24 | Atualizacao: PENDENTE-004 DECIDIDA (Opcao A) e IMPLEMENTADA — 4x `no-explicit-any` removidos de identity-advanced.route.ts + Prettier aplicado. Lint MOD-004 limpo. PENDENTEs: 4/5 IMPLEMENTADA, 1 ABERTA (PENDENTE-005). Proximo passo: resolver PENDENTE-005 |
| 7.0.0 | 2026-03-24 | Atualizacao: validate-all pos-codegen executado — lint/format PASS, 6 validadores semanticos PASS, 1 violacao arquitetural (PENDENTE-005). PENDENTE-004 (lint codegen) registrada. |
| 6.0.0 | 2026-03-23 | Atualizacao: Fase 5 CONCLUIDA — codegen 6/6 agentes done. WEB (12 arquivos: types, queries, commands, mappers, permissions, rules, view-model, OrgScopeCard, ShareDrawer, DelegationDrawer, OrgScopeManagement, SharesDelegationsPanel) e VAL (validacao cruzada aprovada com ressalvas menores). 37 arquivos totais. validate-drizzle APROVADO CONDICIONAL, validate-openapi PASS com ressalvas, validate-endpoint PASS. Proximo passo: pnpm install, pnpm test |
| 5.0.0 | 2026-03-23 | Atualizacao: Fase 5 EM ANDAMENTO — codegen 4/6 agentes concluidos (DB, CORE, APP, API done; WEB, VAL pendentes). 25 arquivos gerados. Validadores pos-codigo validate-openapi e validate-endpoint PASS. Checklist atualizado com progresso granular por agente. Proximo passo: /codegen mod-004 AGN-COD-WEB,AGN-COD-VAL |
| 4.0.0 | 2026-03-23 | Atualizacao: Fase 4 CONCLUIDA (promote-module 2026-03-23, DRAFT v0.9.0→READY v1.0.0). Fase 5 (Codegen) adicionada como NAO INICIADA com rastreio de 6 agentes COD. Dependencias upstream MOD-000 e MOD-003 agora READY. Checklist atualizado para fase de codigo. Proximo passo: /app-scaffold all → /codegen mod-004 |
| 3.0.0 | 2026-03-23 | Recriacao: Fase 3 CONCLUIDA (validate-all 2026-03-22 PASS 29/29 manifests). Fase 4 PENDENTE. DoR Gate 0 7/7 atendidos. Pendencias compactadas (referencia pen file). Proximo passo: /promote-module |
| 2.0.0 | 2026-03-22 | Reescrita completa no formato padrao (sem acentos): Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 3 pendentes resolvidas (001-003), rastreio de 10 agentes, mapa de cobertura de validadores, particularidades Nivel 2 com cache Redis, 4 ADRs, dependencias upstream |
| 1.0.0 | 2026-03-21 | Criacao inicial. Diagnostico: Fase 2 concluida (10 agentes, 3 pendencias resolvidas). Pronto para Fase 3 (validacao) |
