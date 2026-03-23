# Procedimento — Plano de Acao MOD-003 Estrutura Organizacional

> **Versao:** 4.0.0 | **Data:** 2026-03-23 | **Owner:** Marcos Sulivan
> **Estado atual do modulo:** READY (v1.0.0) | **Epico:** READY (v1.1.0) | **Features:** 4/4 READY
>
> Fases 0-4 concluidas (modulo promovido a READY em 2026-03-23). Proximo passo: Fase 5 (Geracao de Codigo) — executar `/app-scaffold all` para criar apps/api e apps/web, depois `/codegen mod-003`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-003 | READY (v1.1.0) | DoR completo, 4 features vinculadas, hierarquia 5 niveis |
| Features F01-F04 | 4/4 READY | F01 (API Core CRUD + Tree), F02 (Arvore UX), F03 (Formulario UX), F04 (Restore) — todas READY |
| Scaffold (forge-module) | CONCLUIDO | mod-003-estrutura-organizacional/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | Todos os agentes confirmados, v0.3.0, 6 pendentes resolvidas |
| Codegen (6 agentes) | NAO INICIADO | Scaffold de codigo nao existe (apps/api, apps/web nao criados). Executar /app-scaffold primeiro |
| PENDENTEs | 0 abertas | 6 total: 3 RESOLVIDA + 3 IMPLEMENTADA |
| ADRs | 4 READY (proposed) | Nivel 2 requer minimo 3 — atendido (ADR-001 N5=Tenant, ADR-002 CTE Recursivo, ADR-003 Cross-Tenant, ADR-004 Idempotency-Key) |
| Amendments | 3 criados | FR-001-C01 (constraint catch), US-MOD-003-M01 (F04 no epico), US-MOD-003-F01-M01 (org.unit_restored) |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v1.0.0 | Ultima entrada 2026-03-23 (Promocao DRAFT→READY) |
| Screen Manifests | 2/2 existem | ux-org-001.org-tree.yaml, ux-org-002.org-form.yaml |
| Dependencias | 1 upstream (MOD-000 READY) | Consome tenants (F07), catalogo de escopos (F12), auth, domain_events |
| Bloqueios | 0 | Nenhum BLK-* afeta MOD-003 |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-003 define o primeiro modulo verdadeiramente full-stack depois do Foundation. Implementa a hierarquia organizacional formal de 5 niveis (N1-N5), servindo como referencia de pertencimento para todas as entidades de negocio. A decisao arquitetural central e que N5 = tenant existente do MOD-000-F07 (nao cria tabela paralela).

```
1    (manual)              Revisar e finalizar epico US-MOD-003:             CONCLUIDO
                           - Decisao N5=tenant documentada e validada        status_agil = READY
                           - Modelo org_units + org_unit_tenant_links        v1.1.0
                           - 4 features (F01-F04 READY)
                           - 8 endpoints com operationIds definidos
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-003.md

2    (manual)              Revisar e finalizar features F01-F04:             CONCLUIDO (4/4 READY)
                           - F01: API Core CRUD + Tree + Vinculacao N5      READY
                           - F02: Arvore Organizacional (UX-ORG-001)        READY
                           - F03: Formulario de No (UX-ORG-002)             READY
                           - F04: Restore de Unidade Organizacional         READY
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-003-F{01..04}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Primeiro modulo full-stack pos-Foundation. Scaffoldado em 2026-03-16 com estrutura completa incluindo camadas API (presentation, application, domain, infrastructure) e Web (ui, domain, data).

```
3    /forge-module MOD-003  Scaffold completo gerado:                        CONCLUIDO
                           mod-003-estrutura-organizacional.md,             v0.1.0 (2026-03-16)
                           CHANGELOG.md, requirements/ (br/, fr/, data/,
                           int/, sec/, ux/, nfr/), adr/, amendments/
                           Stubs obrigatorios: DATA-003, SEC-002
                           Pasta: docs/04_modules/mod-003-estrutura-organizacional/
```

### Fase 2: Enriquecimento — CONCLUIDA

O enriquecimento do MOD-003 foi completo — todos os agentes rodaram entre 2026-03-16 e 2026-03-18. Durante o processo, 6 pendencias foram identificadas e todas resolvidas. Destaque: PENDENTE-001 gerou a feature F04 (Restore) via amendment US-MOD-003-M01; PENDENTE-003 resultou na ADR-003 (org_units cross-tenant); PENDENTE-005 resultou no amendment FR-001-C01 (constraint catch).

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-003
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-003
> ```

```
4    /enrich docs/04_modules/mod-003-estrutura-organizacional/
                           Agentes executados sobre mod-003:                 CONCLUIDO
                           AGN-DEV-01 (MOD), AGN-DEV-02 (BR),              v0.3.0 (2026-03-17)
                           AGN-DEV-03 (FR), AGN-DEV-04 (DATA),
                           AGN-DEV-05 (INT), AGN-DEV-06 (SEC),
                           AGN-DEV-07 (UX), AGN-DEV-08 (NFR),
                           AGN-DEV-09 (ADR), AGN-DEV-10 (PEN),
                           AGN-DEV-11 (PEN format)
                           6 pendentes criadas e resolvidas (001-006)
                           3 amendments criados (FR-001-C01, US-MOD-003-M01, US-MOD-003-F01-M01)
```

#### Rastreio de Agentes — MOD-003

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-003-estrutura-organizacional.md | CONCLUIDO | v0.3.0 — Nivel 2 confirmado (score 5/6), module_paths full-stack |
| 2 | AGN-DEV-02 | BR | BR-001.md | CONCLUIDO | Regras de arvore, soft delete condicional, codigo imutavel |
| 3 | AGN-DEV-03 | FR | FR-001.md | CONCLUIDO | CRUD + tree query + vinculacao, amendment FR-001-C01 |
| 4 | AGN-DEV-04 | DATA | DATA-001.md, DATA-003.md | CONCLUIDO | Modelo org_units + links, 6 domain events catalogados |
| 5 | AGN-DEV-05 | INT | INT-001.md | CONCLUIDO | 8 endpoints com contratos, INT-007 (domain events timeline) |
| 6 | AGN-DEV-06 | SEC | SEC-001.md, SEC-002.md | CONCLUIDO | 3 escopos org:unit:*, matriz de autorizacao, cross-tenant |
| 7 | AGN-DEV-07 | UX | UX-001.md | CONCLUIDO | Jornadas arvore, formulario, vinculacao, historico |
| 8 | AGN-DEV-08 | NFR | NFR-001.md | CONCLUIDO | Soft limit 500 nos, tree query < 200ms, indices |
| 9 | AGN-DEV-09 | ADR | ADR-001..ADR-004 | CONCLUIDO | 4 ADRs criadas e aceitas (N5=tenant, CTE, cross-tenant, idempotency) |
| 10 | AGN-DEV-10 | PEN | pen-003-pendente.md | CONCLUIDO | 6 pendentes criadas e resolvidas |

#### Pendentes Resolvidas — Resumo Compacto

| # | ID | Status | Sev. | Decisao (resumo) | Artefato |
|---|-----|--------|------|-------------------|----------|
| 1 | PENDENTE-001 | RESOLVIDA | ALTA | Opcao A — Criada F04 (Restore) com endpoint + UX | US-MOD-003-F04, amendments |
| 2 | PENDENTE-002 | IMPLEMENTADA | MEDIA | Opcao A — Consumir domain_events do MOD-000 diretamente | INT-001 v0.3.0, INT-007 |
| 3 | PENDENTE-003 | RESOLVIDA | ALTA | org_units cross-tenant por design, sem coluna tenant_id | ADR-003, DATA-001, SEC-001 |
| 4 | PENDENTE-004 | IMPLEMENTADA | MEDIA | Opcao A — Warning header X-Limit-Warning ao criar (80% soft limit) | NFR-001 v0.3.0, FR-001 v0.3.0 |
| 5 | PENDENTE-005 | RESOLVIDA | MEDIA | Constraint catch PostgreSQL 23505 → HTTP 409 RFC 9457 | Amendment FR-001-C01 |
| 6 | PENDENTE-006 | IMPLEMENTADA | MEDIA | Opcao A — Corrigir texto UX-001 (RBAC, nao tenant_id) | UX-001 v0.2.1 |

> Detalhes completos: requirements/pen-003-pendente.md

### Fase 3: Validacao — CONCLUIDA

O `/validate-all` foi executado em 2026-03-22 e todos os validadores aplicaveis retornaram PASS (29/29 manifests globais aprovados). O MOD-003 passou em todos os checks aplicaveis. Os validadores de codigo (/validate-openapi, /validate-drizzle, /validate-endpoint) sao aplicaveis para Nivel 2 mas serao executaveis apenas apos geracao de codigo (Fase 5).

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
5    /validate-all docs/04_modules/mod-003-estrutura-organizacional/
                           Orquestra TODAS as validacoes em sequencia:        CONCLUIDO (2026-03-22)
                           Internamente executa:                              PASS
                             1. /qa .......................... PASS
                             2. /validate-manifest ........... PASS (2 manifests)
                             3. /validate-openapi → FUTURO (pos-codigo)
                             4. /validate-drizzle → FUTURO (pos-codigo)
                             5. /validate-endpoint → FUTURO (pos-codigo)
                           Pre-condicao: Enriquecimento concluido
                           Pos-condicao: Relatorio consolidado PASS
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Resultado | Artefatos |
|---|-----------|-------------------|-----------|-----------|
| 1 | `/qa` | SIM (todos) | PASS | mod-003-estrutura-organizacional.md, requirements/*, adr/*, amendments/*, CHANGELOG.md |
| 2 | `/validate-manifest` | SIM (2 manifests existem) | PASS | ux-org-001.org-tree.yaml, ux-org-002.org-form.yaml |
| 3 | `/validate-openapi` | SIM (Nivel 2) | FUTURO (pos-codigo) | Endpoints /org-units nao scaffoldados ainda |
| 4 | `/validate-drizzle` | SIM (Nivel 2) | FUTURO (pos-codigo) | Schema org_units nao scaffoldado ainda |
| 5 | `/validate-endpoint` | SIM (Nivel 2) | FUTURO (pos-codigo) | Handlers Fastify nao scaffoldados ainda |

### Fase 4: Promocao — CONCLUIDA

O modulo foi promovido a READY em 2026-03-23. Todos os criterios do Gate 0 (DoR) foram atendidos. A feature F04 (anteriormente TODO) foi promovida a READY antes da promocao do modulo, resultando em 4/4 features READY. O CHANGELOG avancou para Etapa 5 (Selo READY).

```
10   /promote-module docs/04_modules/mod-003-estrutura-organizacional/
                           Selar mod-003 como READY:                         CONCLUIDO (2026-03-23)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (6/6 resolvidas/implementadas)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (10/10)
                             [DoR-3] Zero erros de lint? ................ SIM (validate-all PASS)
                             [DoR-4] Screen manifests validados? ........ SIM (validate-all PASS)
                             [DoR-5] ADRs conforme nivel? ............... SIM (4 >= 3 para N2)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v1.0.0)
                             [DoR-7] Bloqueios cross-modulo? ............ SIM (0 bloqueios)

                           Resultado:
                             estado_item: DRAFT → READY
                             version: 0.3.0 → 1.0.0
                             CHANGELOG: Etapa 5 — Selo READY
                             Todos os requisitos e ADRs selados como READY
```

### Fase 5: Geracao de Codigo — NAO INICIADA

O modulo esta READY e apto para geracao de codigo. Porem, o scaffold de aplicacao (apps/api e apps/web) ainda nao foi criado — apenas `apps/template-project/` existe. E necessario executar `/app-scaffold all` antes de qualquer agente COD. MOD-003 e Nivel 2 (DDD-lite + Clean Completo), portanto todos os 6 agentes COD sao aplicaveis. A dependencia upstream MOD-000 tambem esta READY, o que libera o codegen sem restricoes.

> **Decision tree de codegen:**
>
> ```
> Preciso gerar codigo para os modulos?
> ├── Scaffold existe? (apps/api/, apps/web/)
> │   └── NAO → /app-scaffold all (one-time, cria apps/api e apps/web)
> └── SIM → Qual escopo?
>     ├── Todos modulos READY (ordem topologica)  → /codegen-all (--dry-run para preview)
>     ├── Todos agentes de 1 modulo               → /codegen mod-003
>     └── 1 agente especifico                     → /codegen-agent mod-003 AGN-COD-XX
> ```

```
11   /app-scaffold all      Criar scaffold de aplicacao:                     A EXECUTAR
                           apps/api/ (Fastify + Drizzle + OpenAPI)
                           apps/web/ (React + Vite + TanStack)
                           Pre-condicao: nenhuma (one-time setup)
                           Pos-condicao: apps/api/package.json e apps/web/package.json existem

12   /codegen mod-003       Gerar codigo para todas as camadas:              A EXECUTAR
                           Nivel 2 — 6 agentes aplicaveis (ordem topologica):
                             Phase 1: AGN-COD-DB (migracoes, schemas Drizzle)
                             Phase 2: AGN-COD-CORE (entidades, VOs, invariantes DDD-lite)
                             Phase 3: AGN-COD-APP (use cases, ports, DTOs)
                             Phase 4: AGN-COD-API (endpoints Fastify, OpenAPI, tests)
                             Phase 5: AGN-COD-WEB (React components, queries, mappers)
                             Phase 6: AGN-COD-VAL (validacao cruzada final)
                           Pre-condicao: /app-scaffold concluido, MOD-000 READY (atendido)
                           Pos-condicao: codigo gerado em todas as camadas

13   /validate-all docs/04_modules/mod-003-estrutura-organizacional/
                           Re-executar validacao pos-codigo:                 A EXECUTAR (pos-codegen)
                             1. /qa .......................... re-validar
                             2. /validate-manifest ........... re-validar
                             3. /validate-openapi ............ EXECUTAVEL (pos-codigo)
                             4. /validate-drizzle ............ EXECUTAVEL (pos-codigo)
                             5. /validate-endpoint ........... EXECUTAVEL (pos-codigo)
```

#### Rastreio de Agentes COD — MOD-003

| # | Agente | Camada | Path | Status | Arquivos |
|---|--------|--------|------|--------|----------|
| 1 | AGN-COD-DB | infrastructure | apps/api/src/modules/org-units/infrastructure/, apps/api/db/ | A EXECUTAR | 0 |
| 2 | AGN-COD-CORE | domain | apps/api/src/modules/org-units/domain/ | A EXECUTAR | 0 |
| 3 | AGN-COD-APP | application | apps/api/src/modules/org-units/application/ | A EXECUTAR | 0 |
| 4 | AGN-COD-API | presentation | apps/api/src/modules/org-units/presentation/, apps/api/openapi/ | A EXECUTAR | 0 |
| 5 | AGN-COD-WEB | web | apps/web/src/modules/org-units/ | A EXECUTAR | 0 |
| 6 | AGN-COD-VAL | validation | (cross-layer) | A EXECUTAR | 0 |

#### Pre-requisitos para Codegen

1. **Scaffold de aplicacao:** `apps/api/` e `apps/web/` nao existem. Executar `/app-scaffold all` antes de qualquer agente COD.
2. **Dependencia upstream MOD-000:** READY (v1.0.0) — sem bloqueio. O codigo do Foundation deve ser gerado antes ou em paralelo (camada topologica 0).
3. **Ordem topologica:** MOD-003 esta na camada 1. Pode ser gerado em paralelo com MOD-001 e MOD-002, desde que MOD-000 esteja pronto.

### Fase 6: Pos-READY — SOB DEMANDA

Os 3 amendments ja existentes foram criados pre-READY (durante enriquecimento). Apos promocao, novos amendments seguirao o fluxo formal via `/create-amendment`.

```
14   /update-specification docs/04_modules/mod-003-estrutura-organizacional/requirements/fr/FR-001.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

15   /create-amendment FR-001 melhoria "adicionar movimentacao drag-and-drop"
                           Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
                           Caso de uso previsto: movimentacao de nos na arvore
```

#### Amendments Existentes (pre-READY)

| # | Amendment | Contexto | Quando |
|---|-----------|----------|--------|
| 1 | FR-001-C01 | Estrategia de constraint catch (PostgreSQL 23505 → 409) para unicidade de codigo | Pre-READY (PENDENTE-005) |
| 2 | US-MOD-003-M01 | Inclusao de F04 (Restore) no tree view, tabela de sub-historias e endpoints do epico | Pre-READY (PENDENTE-001) |
| 3 | US-MOD-003-F01-M01 | Adicao do domain event org.unit_restored a tabela de F01 | Pre-READY (PENDENTE-001) |

### Gestao de Pendencias (qualquer momento)

> **Decision tree de pendencias:**
>
> ```
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-003
> ├── Criar nova pendencia     → /manage-pendentes create PEN-003
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-003 PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-003 PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-003 PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-003 PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-003
> ```

```
16   /manage-pendentes list PEN-003
                           Estado atual MOD-003:
                             PEN-003: 6 itens total
                               3 RESOLVIDA (001, 003, 005)
                               3 IMPLEMENTADA (002, 004, 006)
                               0 ABERTA
                             SLA: nenhum vencido
```

| # | ID | Status | Sev. | Decisao (resumo) | Artefato |
|---|-----|--------|------|-------------------|----------|
| 1 | PENDENTE-001 | RESOLVIDA | ALTA | Opcao A — Criada F04 (Restore) | US-MOD-003-F04, amendments |
| 2 | PENDENTE-002 | IMPLEMENTADA | MEDIA | Opcao A — Consumir domain_events MOD-000 | INT-001 v0.3.0 |
| 3 | PENDENTE-003 | RESOLVIDA | ALTA | org_units cross-tenant, sem tenant_id | ADR-003, DATA-001 |
| 4 | PENDENTE-004 | IMPLEMENTADA | MEDIA | Opcao A — Warning header soft limit | NFR-001 v0.3.0 |
| 5 | PENDENTE-005 | RESOLVIDA | MEDIA | Constraint catch 23505 → 409 | FR-001-C01 |
| 6 | PENDENTE-006 | IMPLEMENTADA | MEDIA | Opcao A — Corrigir UX-001 (RBAC) | UX-001 v0.2.1 |

> Detalhes completos: requirements/pen-003-pendente.md

### Utilitarios (qualquer momento)

```
17   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-003): <descricao>

18   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

19   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-003

```
US-MOD-003 (READY v1.1.0)              ← Fase 0: CONCLUIDA
  │  4/4 features READY
  │  Full-stack: backend + frontend
  ▼
mod-003-estrutura-organizacional/       ← Fase 1: CONCLUIDA (forge-module v0.1.0)
  │  (stubs DRAFT)
  ▼
mod-003 enriquecido (DRAFT v0.3.0)      ← Fase 2: CONCLUIDA (11 agentes, 6 PENDENTEs resolvidas)
  │  + 3 amendments + 4 ADRs
  ▼
mod-003 validado (DRAFT)                ← Fase 3: CONCLUIDA (validate-all PASS 2026-03-22)
  │  /qa PASS, /validate-manifest PASS
  │  /validate-openapi, drizzle, endpoint → FUTURO (pos-codigo)
  ▼
mod-003 selado (READY v1.0.0)           ← Fase 4: CONCLUIDA (2026-03-23)
  │  estado_item: READY, todos artefatos selados
  │
  ├── ★ PROXIMO PASSO: /app-scaffold all → /codegen mod-003
  │     Scaffold de codigo nao existe ainda
  │     6 agentes COD aplicaveis (Nivel 2)
  │
  ▼
mod-003 codegen                         ← Fase 5: NAO INICIADA (A EXECUTAR)
  │  AGN-COD-DB → AGN-COD-CORE → AGN-COD-APP → AGN-COD-API → AGN-COD-WEB → AGN-COD-VAL
  ▼
mod-003 + amendments/                   ← Fase 6: SOB DEMANDA (3 amendments pre-READY)

Dependencia upstream: MOD-000 (Foundation READY v1.0.0) — camada topologica 0. Sem bloqueio.
Dependentes downstream: MOD-004 (Identidade Avancada), MOD-005..MOD-007 (referencia org_units).
MOD-003 e referencia canonica de pertencimento para todos os modulos.
```

---

## Particularidades do MOD-003

| Aspecto | Detalhe |
|---------|---------|
| Primeiro modulo full-stack pos-Foundation | MOD-003 e o unico modulo (ate camada 1) que cria endpoints proprios (/org-units) E telas proprias (UX-ORG-001, UX-ORG-002). MOD-001 e MOD-002 sao UX-First sem backend. Isso significa que o codegen sera significativamente mais complexo (API + Web) — todos os 6 agentes COD sao aplicaveis. |
| Nivel 2 — DDD-lite + Clean Completo (Score 5/6) | Score mais alto da camada 1. Cinco gatilhos ativos: estado/workflow (ACTIVE/INACTIVE), compliance/auditoria (domain events, LGPD), concorrencia/consistencia (Idempotency-Key, CTE), multi-tenant (cross-tenant, RBAC), regras cruzadas (referencia canonica). Unico ausente: integracoes externas criticas. |
| org_units cross-tenant (ADR-003) | Decisao arquitetural nao-obvia: a tabela org_units NAO possui coluna tenant_id. A hierarquia e cross-tenant por natureza (abrange multiplos estabelecimentos). Controle de acesso via RBAC (@RequireScope), nao via RLS. Impacto: todos os modulos downstream que referenciam org_units devem estar cientes dessa decisao. |
| F04 (Restore) agora READY | Feature adicionada pos-scaffold via amendment US-MOD-003-M01 durante o enriquecimento (PENDENTE-001). Anteriormente TODO, foi promovida a READY junto com o modulo. Endpoint PATCH /org-units/:id/restore com regra BR-009 (pai deve estar ativo). |
| 3 amendments pre-READY | Mais amendments que qualquer outro modulo da camada 1. Reflete a complexidade e iteracoes do enriquecimento: constraint catch para unicidade, inclusao de F04 no epico, domain event org.unit_restored. |
| Referencia canonica de pertencimento | Modulos MOD-004 (identidade), MOD-005 (processos), MOD-006 (execucao), MOD-007 (parametrizacao) referenciam org_units como hierarquia. A promocao de MOD-003 desbloqueia validacoes cruzadas e codegen de modulos dependentes. |
| MOD-000 upstream agora READY | A dependencia upstream MOD-000 (Foundation) foi promovida a READY (v1.0.0). Isso elimina qualquer restricao para geracao de codigo do MOD-003. O codegen pode prosseguir assim que o scaffold de aplicacao for criado. |

---

## Checklist Rapido — O que Falta para Codegen

- [ ] Executar `/app-scaffold all` — criar apps/api e apps/web (one-time setup global)
- [ ] Executar `/codegen mod-003` — gerar codigo em todas as 6 camadas (DB, CORE, APP, API, WEB, VAL)
- [ ] Executar `/validate-all` pos-codigo — validar openapi, drizzle e endpoint (anteriormente FUTURO)

> **Nota:** O modulo esta READY (v1.0.0). Todas as 6 pendencias estao resolvidas/implementadas. Os 10 artefatos de requisitos estao selados. As 4 ADRs excedem o minimo de 3 para Nivel 2. Nao ha bloqueios (BLK-*) afetando MOD-003. A dependencia upstream MOD-000 esta READY. MOD-003 e referencia para MOD-004+ — seu codegen desbloqueia codegen dos modulos da camada 2 em diante. Na ordem topologica, MOD-003 esta na camada 1 e pode ser gerado em paralelo com MOD-001 e MOD-002.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 4.0.0 | 2026-03-23 | Atualizacao: Fase 4 CONCLUIDA (promocao READY v1.0.0 em 2026-03-23), F04 promovida TODO→READY (4/4 features), MOD-000 upstream READY, Fase 5 desbloqueada (NAO INICIADA), checklist atualizado para codegen, Resumo Visual reflete estado pos-READY |
| 3.0.0 | 2026-03-23 | Recriacao: Fase 3 atualizada para CONCLUIDA (validate-all PASS 2026-03-22), Gate 0 DoR 7/7 atendidos, Fase 4 como proximo passo, pendencias em formato compacto com referencia ao pen file, validadores de codigo marcados FUTURO |
| 2.0.0 | 2026-03-22 | Reescrita completa: detalhamento inline das 6 pendentes com questao/opcoes/resolucao, rastreio de agentes expandido, mapa de cobertura de validadores, particularidades atualizadas |
| 1.2.0 | 2026-03-21 | Versao hibrida: estrutura padrao (PASSO, decision trees) + riqueza explicativa (tabela de agentes, painel de pendencias, bloqueadores, notas contextuais sobre F04/cross-tenant/amendments) |
| 1.1.0 | 2026-03-21 | Reescrita: formato padronizado conforme template (PASSO numerados, decision trees, gestao de pendencias completa, resumo visual vertical) |
| 1.0.0 | 2026-03-21 | Criacao inicial — diagnostico Fase 2 em andamento (9 agentes, F04 TODO, 0 pendentes abertas) |
