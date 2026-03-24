# Procedimento — Plano de Acao MOD-002 Gestao de Usuarios

> **Versao:** 5.4.0 | **Data:** 2026-03-24 | **Owner:** arquitetura
> **Estado atual do modulo:** READY (v1.1.0) | **Epico:** READY (v1.2.0) | **Features:** 3/3 READY
>
> Fases 0-5 concluidas — codegen completo (13 arquivos WEB Pattern A + 6 test files + 1 copy.ts). Validacao Fase 3 re-executada 2026-03-24: Lint PASS, QA PASS, Manifests 3/3 PASS, Arquitetura PASS. 6 PENDENTEs total — **6/6 IMPLEMENTADA** (zero pendencias abertas). Proximo passo: amendment MOD-000-F05 (DTO gaps).

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-002 | READY (v1.2.0) | DoR completo, 3 features vinculadas, separacao clara MOD-002 (UX) vs MOD-000-F05 (API) |
| Features F01-F03 | 3/3 READY | F01 (Listagem Usuarios), F02 (Formulario Cadastro), F03 (Convite e Ativacao) |
| Scaffold (forge-module) | CONCLUIDO | mod-002-gestao-usuarios/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | Agentes 01-10 confirmados, v0.4.0, 3 pendentes resolvidas |
| Codegen (6 agentes) | CONCLUIDO (2026-03-23) | 4 skipped (UX-First), WEB done (14 arquivos + 6 test files + 1 copy.ts), VAL done (findings resolvidos) |
| PENDENTEs | 0 abertas | 6 total: 6/6 IMPLEMENTADA (001-006) — zero pendencias abertas |
| ADRs | 3 READY | Nivel 1 requer minimo 1 — atendido (ADR-001 UX-First, ADR-002 PII-Safe, ADR-003 Idempotency-Key) |
| Amendments | 0 | Nenhum |
| Requirements | 17/17 existem | BR(6), FR(3), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v1.1.0 | Ultima entrada 2026-03-24 (Validacao Fase 3 aprovada) |
| Screen Manifests | 3/3 existem | ux-usr-001, ux-usr-002, ux-usr-003 |
| Dependencias | 1 upstream (MOD-000) | Consome Users API (F05), Roles API (F06), Auth, Catalogo de Scopes (F12) |
| Bloqueios | 0 | BLK-001 resolvido via PENDENTE-001 IMPLEMENTADA |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-002 define o modulo exclusivamente UX-First (frontend) para gestao do ciclo de vida de usuarios no backoffice: listagem paginada, formulario de cadastro com dois modos (convite/senha temporaria) e fluxo de convite com reenvio e cooldown. A separacao MOD-002 (UX) vs MOD-000-F05 (API) e a decisao arquitetural central — MOD-002 nao cria endpoints novos.

```
1    (manual)              Revisar e finalizar epico US-MOD-002:             CONCLUIDO
                           - Separacao MOD-002 (UX) vs MOD-000-F05 (API)   status_agil = READY
                           - 3 features UX-First com Gherkin completo      v1.2.0
                           - DoR completo (manifests, operationIds, LGPD)
                           - 6 operationIds de MOD-000-F05/F06 declarados
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-002.md

2    (manual)              Revisar e finalizar features F01-F03:             CONCLUIDO
                           - F01: Listagem de Usuarios + Filtros + Acoes   3/3 READY
                           - F02: Formulario de Cadastro (senha / convite)
                           - F03: Fluxo de Convite e Ativacao
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-002-F{01..03}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Modulo UX-First scaffoldado em 2026-03-17, consumindo endpoints do MOD-000-F05 (Users API) e F06 (Roles API). Nao cria endpoints proprios.

```
3    /forge-module MOD-002  Scaffold completo gerado:                        CONCLUIDO
                           mod-002-gestao-usuarios.md, CHANGELOG.md,        v0.1.0 (2026-03-17)
                           requirements/ (br/, fr/, data/, int/, sec/,
                           ux/, nfr/), adr/, amendments/
                           Stubs obrigatorios: DATA-003, SEC-002
                           Pasta: docs/04_modules/mod-002-gestao-usuarios/
```

### Fase 2: Enriquecimento — CONCLUIDA

O enriquecimento do MOD-002 foi completo — todos os agentes rodaram entre 2026-03-17 e 2026-03-18. O modulo recebeu enriquecimento rico: 6 BRs (visibilidade por scope, PII/LGPD, modos mutuamente exclusivos, cooldown, idempotencia, erros inline), 3 FRs detalhados, e 3 ADRs. Foram identificadas 3 pendencias e todas resolvidas.

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-002
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-002
> ```

```
4    /enrich docs/04_modules/mod-002-gestao-usuarios/
                           Agentes executados sobre mod-002:                 CONCLUIDO
                           AGN-DEV-01 (MOD), AGN-DEV-02 (BR),              v0.4.0 (2026-03-17)
                           AGN-DEV-03 (FR), AGN-DEV-04 (DATA),
                           AGN-DEV-05 (INT), AGN-DEV-06 (SEC),
                           AGN-DEV-07 (UX), AGN-DEV-08 (NFR),
                           AGN-DEV-09 (ADR), AGN-DEV-10 (PEN)
                           3 pendentes criadas e resolvidas (001-003)
```

#### Rastreio de Agentes — MOD-002

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-002-gestao-usuarios.md | CONCLUIDO | v0.4.0 — score 2pts N1, personas 3 perfis, OKRs, premissas, estrutura web N1 |
| 2 | AGN-DEV-02 | BR | BR-001..BR-006 | CONCLUIDO | Batch 1 — rastreabilidade BR-003→FR-002, BR-004→FR-003 corrigida |
| 3 | AGN-DEV-03 | FR | FR-001, FR-002, FR-003 | CONCLUIDO | Batch 1 — campos idempotency/timeline explicitos |
| 4 | AGN-DEV-04 | DATA | DATA-001, DATA-003 | CONCLUIDO | DATA-001 criado (modelo consumido), DATA-003 re-validado |
| 5 | AGN-DEV-05 | INT | INT-001 | CONCLUIDO | RFC 9457, cache, CORS documentados |
| 6 | AGN-DEV-06 | SEC | SEC-001, SEC-002 | CONCLUIDO | Transport security, threat model, RFC 9457 seguro |
| 7 | AGN-DEV-07 | UX | UX-001 | CONCLUIDO | Error recovery flows, telemetria detalhada, view-model mapping |
| 8 | AGN-DEV-08 | NFR | NFR-001 | CONCLUIDO | Testabilidade, resiliencia, seguranca UI, metricas qualidade |
| 9 | AGN-DEV-09 | ADR | ADR-001, ADR-002, ADR-003 | CONCLUIDO | ADR-002 PII-Safe UI, ADR-003 Idempotency-Key frontend |
| 10 | AGN-DEV-10 | PEN | pen-002-pendente.md | CONCLUIDO | v0.10.0 — 3 pendentes criadas e resolvidas |

#### Pendentes Resolvidas (Enriquecimento) — Resumo Compacto

| # | ID | Status | Sev. | Decisao (resumo) | Artefato |
|---|-----|--------|------|-------------------|----------|
| 1 | PENDENTE-001 | IMPLEMENTADA | BLOQUEANTE | Opcao A — Amendment users_invite_resend no MOD-000-F05 | FR-000 §FR-006 (MOD-000) |
| 2 | PENDENTE-002 | IMPLEMENTADA | MEDIA | Opcao A — Cooldown client-side, known limitation v1 | BR-004 v0.2.0 |
| 3 | PENDENTE-003 | IMPLEMENTADA | BAIXA | Opcao A — Object map plain strings em domain/copy.ts | ADR-002 v0.2.0 |

> Detalhes completos: requirements/pen-002-pendente.md

### Fase 3: Validacao — CONCLUIDA

O `/validate-all` foi re-executado em 2026-03-24 e todos os validadores aplicaveis retornaram PASS. Lint Check: 0 errors, 0 warnings, 0 format issues. Validacao Arquitetural: Pattern A correto (api/, components/, hooks/, pages/, types/), React Query em 6 hooks, sem Pattern B. QA: 0 bloqueadores MOD-002. Manifests: 3/3 aprovados (schema v1 + semantica). Execucao anterior: 2026-03-22 (29/29 manifests globais aprovados).

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
5    /validate-all docs/04_modules/mod-002-gestao-usuarios/
                           Orquestra TODAS as validacoes em sequencia:        CONCLUIDO (2026-03-24)
                           Internamente executa:                              PASS
                             0. Lint Check .................. PASS (0 errors, 0 warnings, 0 format)
                             0.5 Validacao Arquitetural ..... PASS (Pattern A, React Query)
                             1. /qa .......................... PASS (0 bloqueadores MOD-002)
                             2. /validate-manifest ........... PASS (3/3 manifests, schema+semantica)
                             3. /validate-openapi → N/A (UX-First, sem backend)
                             4. /validate-drizzle → N/A (UX-First, sem entidades)
                             5. /validate-endpoint → N/A (UX-First, sem handlers)
                           Pre-condicao: Enriquecimento concluido
                           Pos-condicao: Relatorio consolidado PASS
                           Execucao anterior: 2026-03-22 (PASS)
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Resultado | Artefatos |
|---|-----------|-------------------|-----------|-----------|
| 0 | Lint Check (ESLint + Prettier) | SIM (sempre) | PASS (2026-03-24) | 0 errors, 0 warnings, 0 format issues |
| 0.5 | Validacao Arquitetural | SIM (sempre) | PASS (2026-03-24) | Pattern A (api/, components/, hooks/, pages/, types/), React Query em 6 hooks |
| 1 | `/qa` | SIM (todos) | PASS (2026-03-24) | 0 bloqueadores MOD-002, 2 warnings markdown menores no pen file |
| 2 | `/validate-manifest` | SIM (3 manifests existem) | PASS (2026-03-24) | ux-usr-001 (EX-UX-001..005 PASS), ux-usr-002 (PASS), ux-usr-003 (PASS) |
| 3 | `/validate-openapi` | N/A | N/A | UX-First — sem backend proprio (endpoints sao do MOD-000) |
| 4 | `/validate-drizzle` | N/A | N/A | UX-First — sem entidades de banco proprias |
| 5 | `/validate-endpoint` | N/A | N/A | UX-First — sem handlers Fastify proprios |

### Fase 4: Promocao — CONCLUIDA

O modulo foi promovido a READY em 2026-03-23 via `/promote-module`. Todos os criterios do Gate 0 (DoR) foram atendidos. O manifesto foi selado em v1.0.0, todos os requisitos e ADRs foram promovidos a READY, e o CHANGELOG registra a entrada de promocao.

```
10   /promote-module docs/04_modules/mod-002-gestao-usuarios/
                           Selar mod-002 como READY:                         CONCLUIDO (2026-03-23)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (3/3 IMPLEMENTADA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (17/17)
                             [DoR-3] Zero erros de lint? ................ SIM (validate-all PASS)
                             [DoR-4] Screen manifests validados? ........ SIM (validate-all PASS)
                             [DoR-5] ADRs conforme nivel? ............... SIM (3 >= 1 para N1)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v1.0.0)
                             [DoR-7] Bloqueios cross-modulo? ............ SIM (BLK-001 ja resolvido via PENDENTE-001)

                           Resultado:
                             estado_item: DRAFT → READY
                             version: 0.4.0 → 1.0.0
                             ADRs: 3/3 seladas como READY
                             PEN-002: estado_item selado como READY
                             CHANGELOG: entrada v1.0.0 adicionada
```

### Fase 5: Geracao de Codigo — CONCLUIDA

Codegen completo executado em 2026-03-23. Por ser UX-First (Nivel 1 sem backend proprio), 4 agentes foram skipped (DB, CORE, APP, API). AGN-COD-WEB gerou 14 arquivos em `apps/web/src/modules/users/`. AGN-COD-VAL executou validacao cruzada com 1 erro (testes ausentes), 2 warnings (DTO gaps Foundation, copy.ts nao gerado) e 1 note (telemetria UX). PENDENTE-004 (testes) resolvida em 2026-03-24: Opcao C (unit + component tests) implementada com 6 arquivos de teste e 59 tests passing. PENDENTE-005 (copy.ts) resolvida em 2026-03-24: Opcao A implementada — `domain/copy.ts` criado e 8 componentes migrados para usar constantes centralizadas.

> **Decision tree de codegen:**
>
> ```
> Preciso gerar codigo para os modulos?
> ├── Scaffold existe? (apps/api/, apps/web/)
> │   └── NAO → /app-scaffold all (one-time, cria apps/api e apps/web)
> └── SIM → Qual escopo?
>     ├── Todos modulos READY (ordem topologica)  → /codegen-all (--dry-run para preview)
>     ├── Todos agentes de 1 modulo               → /codegen mod-002
>     └── 1 agente especifico                     → /codegen-agent mod-002 AGN-COD-XX
> ```

```
11   /app-scaffold all     Criar scaffold de aplicacao (one-time):           CONCLUIDO (2026-03-23)
                           - apps/api/ (Fastify + Drizzle + OpenAPI)
                           - apps/web/ (React + TanStack Router)
                           Pre-requisito para qualquer /codegen

12   /codegen mod-002      Gerar codigo para MOD-002:                        CONCLUIDO (2026-03-23)
                           Agentes executados:
                             AGN-COD-DB ..... skipped (UX-First, sem entidades)
                             AGN-COD-CORE ... skipped (Nivel 1, sem Domain API)
                             AGN-COD-APP .... skipped (UX-First, sem use cases API)
                             AGN-COD-API .... skipped (UX-First, sem endpoints)
                             AGN-COD-WEB .... done (14 arquivos gerados)
                             AGN-COD-VAL .... done (1 erro, 2 warnings, 1 note)
                           Pre-condicao: estado_item = READY, scaffold existe
                           Pos-condicao: apps/web/src/modules/users/ populado
```

#### Rastreio de Agentes COD — MOD-002

| # | Agente | Camada | Path | Status | Arquivos |
|---|--------|--------|------|--------|----------|
| 1 | AGN-COD-DB | infrastructure | apps/api/src/modules/users/infrastructure/ | skipped (UX-First) | 0 |
| 2 | AGN-COD-CORE | domain | apps/api/src/modules/users/domain/ | skipped (Nivel 1) | 0 |
| 3 | AGN-COD-APP | application | apps/api/src/modules/users/application/ | skipped (UX-First) | 0 |
| 4 | AGN-COD-API | presentation | apps/api/src/modules/users/presentation/ | skipped (UX-First) | 0 |
| 5 | AGN-COD-WEB | web | apps/web/src/modules/users/ | done (2026-03-23) | 14 |
| 6 | AGN-COD-VAL | validation | — | done (2026-03-23) | 0 (validacao apenas) |

#### Arquivos Gerados — AGN-COD-WEB (14 arquivos) + Pos-codegen (7 arquivos)

| # | Path | Camada | Contract Refs |
|---|------|--------|---------------|
| 1 | apps/web/src/modules/users/data/types.ts | data | DATA-001, FR-002, BR-003 |
| 2 | apps/web/src/modules/users/data/mappers.ts | data | DATA-001, BR-001, BR-002, BR-006 |
| 3 | apps/web/src/modules/users/data/queries.ts | data | FR-001, FR-002, FR-003, BR-004, BR-005 |
| 4 | apps/web/src/modules/users/domain/view-model.ts | domain | DATA-001, BR-001, BR-002 |
| 5 | apps/web/src/modules/users/domain/permissions.ts | domain | BR-001, SEC-001 |
| 6 | apps/web/src/modules/users/domain/copy.ts | domain | ADR-002, BR-002, BR-006, PEN-003, PEN-005 |
| 7 | apps/web/src/modules/users/ui/components/UserStatusBadge.tsx | ui | UX-001, FR-001, FR-003 |
| 8 | apps/web/src/modules/users/ui/components/DeactivateModal.tsx | ui | FR-001, BR-002 |
| 9 | apps/web/src/modules/users/ui/components/PasswordStrengthIndicator.tsx | ui | FR-002 |
| 10 | apps/web/src/modules/users/ui/components/CooldownButton.tsx | ui | FR-003, BR-004 |
| 11 | apps/web/src/modules/users/ui/components/UsersTable.tsx | ui | FR-001, UX-001, BR-001, BR-002 |
| 12 | apps/web/src/modules/users/ui/forms/UserCreateForm.tsx | ui | FR-002, BR-003, BR-005, BR-006 |
| 13 | apps/web/src/modules/users/ui/screens/UsersListScreen.tsx | ui | UX-USR-001, FR-001, BR-001, BR-002, BR-006 |
| 14 | apps/web/src/modules/users/ui/screens/UserFormScreen.tsx | ui | UX-USR-002, FR-002, BR-002, BR-005, BR-006 |
| 15 | apps/web/src/modules/users/ui/screens/UserInviteScreen.tsx | ui | UX-USR-003, FR-003, BR-002, BR-004, BR-006 |
| 16 | apps/web/src/modules/users/domain/permissions.test.ts | test | PENDENTE-004, NFR-001 |
| 17 | apps/web/src/modules/users/domain/view-model.test.ts | test | PENDENTE-004, NFR-001 |
| 18 | apps/web/src/modules/users/data/mappers.test.ts | test | PENDENTE-004, NFR-001 |
| 19 | apps/web/src/modules/users/ui/components/CooldownButton.test.tsx | test | PENDENTE-004, NFR-001 |
| 20 | apps/web/src/modules/users/ui/components/DeactivateModal.test.tsx | test | PENDENTE-004, NFR-001 |
| 21 | apps/web/src/modules/users/ui/forms/UserCreateForm.test.tsx | test | PENDENTE-004, NFR-001 |

#### Resultado AGN-COD-VAL — Validacao Cruzada

| Check | Resultado | Detalhe |
|-------|-----------|---------|
| RFC 9457 Problem Details | PASS | extractFieldErrors() em mappers.ts; 422/409 inline, 500 toast |
| Correlation ID | PASS | correlationId propagado em toasts de erro nas 3 screens |
| Idempotency | PASS | crypto.randomUUID() em queries.ts; regenerado apos success |
| Layering Clean Arch | PASS | data/ → domain/ → ui/ isolados; mappers separados |
| Tests Present | ~~FAIL~~ → PASS | RESOLVIDO (2026-03-24): 6 test files, 59 tests passing — permissions, view-model, mappers, CooldownButton, DeactivateModal, UserCreateForm |
| OpenAPI | N/A | UX-First, sem endpoints proprios |
| Permissions | N/A | Sem OpenAPI proprio; scopes documentados em SEC-001/BR-001 |
| WCAG/A11y | PASS | 36 ocorrencias aria-*/role= em 8 arquivos |
| LGPD/PII | PASS | Email nunca em toasts/modais; verificado em todas as 3 screens |
| AbortController | PASS | Presente em queries.ts para cleanup de requests |

#### Findings AGN-COD-VAL

| # | Sev. | Localizacao | Mensagem | Acao |
|---|------|-------------|----------|------|
| 1 | ~~ERROR~~ | apps/web/src/modules/users/ | ~~Nenhum arquivo de teste~~ → RESOLVIDO: 6 test files, 59 tests (2026-03-24) | PENDENTE-004 IMPLEMENTADA |
| 2 | WARNING | data/types.ts, data/mappers.ts | Foundation UserListItem falta roleId/roleName; UserDetail falta inviteTokenExpired | Amendment MOD-000-F05 |
| 3 | ~~WARNING~~ | domain/ | ~~domain/copy.ts documentado em PEN-003/ADR-002 mas nao gerado. Strings inline~~ → RESOLVIDO: copy.ts criado, 8 componentes migrados (2026-03-24) | PENDENTE-005 IMPLEMENTADA |
| 4 | NOTE | ui/screens/, data/queries.ts | Telemetria UX (ux.action.*) especificada em UX-001 §7 nao implementada | Depende de Foundation SDK |

> **Nota sobre ordem topologica:** MOD-002 esta na camada topologica 1 (depende apenas de MOD-000). Os 14 arquivos gerados usam Foundation httpClient para comunicacao com a API. As lacunas de DTO (roleId/roleName, inviteTokenExpired) sao contornadas com defaults e serao resolvidas via amendment MOD-000-F05.

### Fase 6: Pos-READY — SOB DEMANDA

Nenhum amendment criado ate o momento. Alteracoes futuras na especificacao requerem `/create-amendment`.

```
13   /update-specification docs/04_modules/mod-002-gestao-usuarios/requirements/fr/FR-001.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

14   /create-amendment FR-001 melhoria "adicionar edicao de usuario"
                           Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
                           Caso de uso previsto: MOD-002-F04 (edicao)
```

### Gestao de Pendencias

> **Decision tree de pendencias:**
>
> ```
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-002
> ├── Criar nova pendencia     → /manage-pendentes create PEN-002
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-002 PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-002 PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-002 PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-002 PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-002
> ```

```
16   /manage-pendentes list PEN-002
                           Estado atual MOD-002:
                             PEN-002: 6 itens total
                               6/6 IMPLEMENTADA (001-006) — zero pendencias abertas
                             SLA: todos atendidos
```

| # | ID | Status | Sev. | Decisao (resumo) | Artefato |
|---|-----|--------|------|-------------------|----------|
| 1 | PENDENTE-001 | IMPLEMENTADA | BLOQUEANTE | Opcao A — Amendment users_invite_resend | FR-000 §FR-006 (MOD-000) |
| 2 | PENDENTE-002 | IMPLEMENTADA | MEDIA | Opcao A — Cooldown client-side (known limitation v1) | BR-004 v0.2.0 |
| 3 | PENDENTE-003 | IMPLEMENTADA | BAIXA | Opcao A — Object map plain strings domain/copy.ts | ADR-002 v0.2.0 |
| 4 | PENDENTE-004 | IMPLEMENTADA | ALTA | Opcao C — Unit + component tests (6 files, 59 tests) | permissions.test.ts, view-model.test.ts, mappers.test.ts, CooldownButton.test.tsx, DeactivateModal.test.tsx, UserCreateForm.test.tsx |
| 5 | PENDENTE-005 | IMPLEMENTADA | MEDIA | Opcao A — copy.ts criado, 8 componentes migrados | apps/web/src/modules/users/domain/copy.ts |
| 6 | PENDENTE-006 | IMPLEMENTADA | MEDIA | ~~Lint codegen — 10 ocorrencias originais, agora 0 (corrigido por PEN-000/PENDENTE-018)~~ | DOC-PADRAO-002, DOC-ARC-002 |

> Detalhes completos: requirements/pen-002-pendente.md (v0.17.0)
> **Nota:** PENDENTE-006 marcada IMPLEMENTADA em 2026-03-24. Os 10 erros lint originais ja haviam sido corrigidos durante PENDENTE-004 (tests) e PENDENTE-005 (copy.ts). `pnpm lint` + `prettier --check` confirmam 0 erros em web/users.

### Utilitarios (qualquer momento)

```
17   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-002): <descricao>

18   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

19   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-002

```
US-MOD-002 (READY v1.2.0)              ← Fase 0: CONCLUIDA
  │  3/3 features READY (UX-First)
  ▼
mod-002-gestao-usuarios/ (stubs DRAFT)  ← Fase 1: CONCLUIDA (forge-module v0.1.0)
  │
  ▼
mod-002 enriquecido (DRAFT v0.4.0)      ← Fase 2: CONCLUIDA (10 agentes, 3 PENDENTEs resolvidas)
  │
  ▼
mod-002 validado (DRAFT)                ← Fase 3: CONCLUIDA (validate-all PASS 2026-03-22)
  │
  ▼
mod-002 selado (READY v1.0.0)          ← Fase 4: CONCLUIDA (promote-module 2026-03-23)
  │
  ▼
mod-002 com codigo gerado              ← Fase 5: CONCLUIDA (21 arquivos total)
  │  AGN-COD-WEB: 14 arquivos (data/3, domain/2, ui/9)
  │  Tests: 6 arquivos, 59 tests passing (2026-03-24)
  │  copy.ts: 1 arquivo, 8 componentes migrados (2026-03-24)
  │  AGN-COD-VAL: todos findings resolvidos
  │
  ├── ✅ PENDENTE-004: Testes unitarios + componente (IMPLEMENTADA)
  ├── ✅ PENDENTE-005: domain/copy.ts criado + 8 componentes migrados (IMPLEMENTADA)
  │
  ▼
mod-002 + amendments/                   ← Fase 6: SOB DEMANDA (0 amendments)

Dependencia upstream: MOD-000 (Foundation) — camada topologica 1.
MOD-002 e modulo folha — nao tem dependentes downstream.
BLK-001 (users_invite_resend) ja resolvido via PENDENTE-001.
Todas as 5 PENDENTEs resolvidas (5/5 IMPLEMENTADA).
```

---

## Particularidades do MOD-002

| Aspecto | Detalhe |
|---------|---------|
| Modulo UX-First (N1) | Exclusivamente frontend — consome 6 operationIds do MOD-000-F05/F06 (users_list, users_create, users_get, users_delete, users_invite_resend, roles_list). Os validadores `/validate-openapi`, `/validate-drizzle` e `/validate-endpoint` sao N/A. Os agentes COD de backend (DB, CORE, APP, API) sao N/A — apenas AGN-COD-WEB e AGN-COD-VAL se aplicam. |
| Nivel 1 — Clean Leve (Score 2/6) | Dois gatilhos ativos: integracoes externas criticas (6 operationIds de MOD-000) e multi-tenant (visibilidade filtrada por tenant_id, 3 scopes RBAC distintos). Justifica N1 por testabilidade com mocks e regras de apresentacao complexas. |
| BLK-001 resolvido | O DEPENDENCY-GRAPH lista BLK-001 (amendment `users_invite_resend` no MOD-000-F05) como PENDENTE. Na pratica, o endpoint ja foi adicionado ao MOD-000 via FR-000 §FR-006 (PENDENTE-001 IMPLEMENTADA). O status do BLK-001 no grafo precisa ser atualizado. |
| Protecao LGPD | ADR-002 (PII-Safe UI Pattern) determina que e-mails nunca aparecem em toasts, modais ou mensagens de erro. Todas as 3 telas seguem este padrao. E-mail so e exibido em campos de formulario, nunca em feedback ao usuario. AGN-COD-VAL confirmou conformidade LGPD em todos os 14 arquivos. Strings centralizadas em `domain/copy.ts` para auditoria facilitada. |
| Idempotencia no frontend | ADR-003 (Idempotency-Key) define UUID v4 gerado no mount da tela, enviado em POSTs. Protege contra double-click e resubmissions. Cooldown de 60s no reenvio de convite e client-side only (known limitation v1 — PENDENTE-002). |
| Modulo folha | MOD-002 nao tem dependentes downstream. E um modulo consumidor puro — nao prove APIs ou servicos para outros modulos. |
| Codegen completo com todos findings resolvidos | AGN-COD-WEB gerou 14 arquivos cobrindo data/, domain/ e ui/. AGN-COD-VAL identificou 1 erro (testes ausentes) e 2 warnings (DTO gaps, copy.ts). PENDENTE-004 (testes) resolvida com 6 test files e 59 tests. PENDENTE-005 (copy.ts) resolvida com criacao do arquivo e migracao de 8 componentes. Total: 21 arquivos em users/ (14 gerados + 6 testes + 1 copy.ts). Todos os findings de AGN-COD-VAL resolvidos exceto DTO gaps (amendment MOD-000-F05). |
| Foundation DTO gaps | 3 campos faltam nos DTOs do MOD-000-F05: UserListItem.roleId/roleName, UserDetail.inviteTokenExpired, CreateUserRequest.mode/roleId. Workarounds aplicados (defaults). Requer amendment MOD-000-F05. |

---

## Checklist Rapido — O que Falta

- [x] Executar `/app-scaffold all` — criar scaffold de aplicacao — CONCLUIDO (2026-03-23)
- [x] Executar `/codegen mod-002` — AGN-COD-WEB (14 arquivos) — CONCLUIDO (2026-03-23)
- [x] Executar AGN-COD-VAL — validacao cruzada — CONCLUIDO (2026-03-23, 1 erro, 2 warnings)
- [x] Resolver PENDENTE-004 — testes unitarios + componente (6 files, 59 tests) — CONCLUIDO (2026-03-24)
- [x] Resolver PENDENTE-005 — criar domain/copy.ts e migrar strings inline (8 componentes) — CONCLUIDO (2026-03-24)
- [x] Executar `/validate-all` — Lint PASS, QA PASS, Manifests 3/3 PASS, Arquitetura PASS — CONCLUIDO (2026-03-24)
- [x] `pnpm lint` — 0 errors, 0 warnings — PASS (2026-03-24)
- [x] Resolver PENDENTE-006 — lint ja limpo, marcada IMPLEMENTADA em 2026-03-24
- [ ] Amendment MOD-000-F05 — adicionar roleId/roleName/inviteTokenExpired aos DTOs — WARNING
- [ ] Verificar se MOD-000 tem codigo gerado (dependencia upstream para operationIds reais)

> **Nota:** Codegen concluido. Todas as 5 PENDENTEs resolvidas (5/5 IMPLEMENTADA). PENDENTE-004 (testes) resolvida com 59 tests covering domain/ (permissions, view-model), data/ (mappers) e ui/ (CooldownButton, DeactivateModal, UserCreateForm). PENDENTE-005 (copy.ts) resolvida com criacao de `domain/copy.ts` (object map centralizado conforme ADR-002) e migracao de 8 componentes (inline strings → COPY constants). Os DTO gaps do Foundation sao contornados com defaults e podem ser resolvidos via amendment quando conveniente.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 5.4.0 | 2026-03-24 | Atualizacao: PENDENTE-006 resolvida (Opcao A — lint ja corrigido, verificado via pnpm lint + prettier --check = 0 erros). 6/6 PENDENTEs IMPLEMENTADA, zero abertas. pen-002-pendente.md v0.17.0. |
| 5.3.0 | 2026-03-24 | Atualizacao: validate-all re-executado (Lint PASS 0/0/0, Arquitetura PASS Pattern A, QA PASS, Manifests 3/3 PASS). PENDENTE-006 (lint) registrada mas ja resolvida por PEN-000/PENDENTE-018. Execution state atualizado com validations. CHANGELOG modulo v1.1.0. |
| 5.2.0 | 2026-03-24 | Atualizacao: PENDENTE-005 resolvida (Opcao A — domain/copy.ts criado, 8 componentes migrados para COPY constants), todas 5/5 PENDENTEs IMPLEMENTADA, 0 abertas, finding WARNING copy.ts agora RESOLVIDO, tabela de arquivos expandida para 21 (14+6+1), pen-002-pendente.md v0.14.0 |
| 5.1.0 | 2026-03-24 | Atualizacao: PENDENTE-004 resolvida (Opcao C — unit + component tests, 6 files, 59 tests passing), pendentes 4/5 IMPLEMENTADA, 1 ABERTA (005 copy.ts), finding ERROR testes agora RESOLVIDO |
| 5.0.0 | 2026-03-23 | Atualizacao: Fase 5 promovida a CONCLUIDA (codegen 2026-03-23, AGN-COD-WEB 14 arquivos, AGN-COD-VAL 1 erro/2 warnings), 2 novas pendentes ABERTA (004 testes, 005 copy.ts), tabelas de arquivos gerados e findings AGN-COD-VAL adicionadas |
| 4.0.0 | 2026-03-23 | Atualizacao: Fase 4 promovida a CONCLUIDA (promote-module 2026-03-23, READY v1.0.0), Fase 5 reestruturada como Geracao de Codigo com rastreio de agentes COD e deteccao de scaffold, Fase 6 renumerada para Pos-READY, checklist atualizado para codegen |
| 3.0.0 | 2026-03-23 | Recriacao: Fase 3 atualizada para CONCLUIDA (validate-all PASS 2026-03-22), Gate 0 DoR 7/7 atendidos, Fase 4 como proximo passo, pendencias em formato compacto com referencia ao pen file |
| 2.0.0 | 2026-03-22 | Reescrita completa: detalhamento completo das 3 pendentes resolvidas (001-003), rastreio de 11 agentes, mapa de cobertura de validadores, particularidades (BLK-001, LGPD, cooldown, idempotencia, UX-First), painel de pendencias |
| 1.0.0 | 2026-03-21 | Criacao: estado atual, fases 0-5, DoR Gate 0, particularidades |
