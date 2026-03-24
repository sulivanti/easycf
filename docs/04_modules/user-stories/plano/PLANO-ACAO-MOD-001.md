# Procedimento — Plano de Acao MOD-001 Backoffice Admin

> **Versao:** 3.5.0 | **Data:** 2026-03-24 | **Owner:** arquitetura
> **Estado atual do modulo:** READY (v1.0.0) | **Epico:** READY (v0.5.0) | **Features:** 3/3 READY
>
> Fases 0-6 concluidas. Todas as 9/9 pendencias resolvidas (IMPLEMENTADA). PENDENTE-009 implementada (Opcao A — lint errors ja corrigidos via PEN-000/PENDENTE-018, confirmado 0 errors). 2 amendments criados (AMD-INT-005-001, AMD-SEC-001-001). Proximo passo: `pnpm install` + `pnpm test` + `pnpm lint`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-001 | READY (v0.5.0) | DoR completo, 3 features vinculadas, abordagem UX-First |
| Features F01-F03 | 3/3 READY | F01 (Shell Auth + Layout), F02 (Telemetria UI), F03 (Dashboard Executivo) |
| Scaffold (forge-module) | CONCLUIDO | mod-001-backoffice-admin/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | Agentes 01-10 confirmados, v0.10.0, 4 pendentes resolvidas |
| Codegen (6 agentes) | CONCLUIDO (2026-03-23) | Scaffold apps/ ok. WEB done (16 arquivos), DB/CORE/APP/API skipped (Nivel 1), VAL done (1E/3W/1N) |
| PENDENTEs | 0 abertas | 9 total: 9 IMPLEMENTADA (001-009) |
| ADRs | 3 aceitas | Nivel 1 requer minimo 1 — atendido (ADR-001 Clean Leve, ADR-002 Telemetria, ADR-003 Zero-Blank-Screen) |
| Amendments | 2 | AMD-INT-005-001 (timeout configuravel — PENDENTE-008), AMD-SEC-001-001 (interceptor 401 global — PENDENTE-007) |
| Requirements | 12/12 existem | BR(1), FR(2), DATA(2), INT(2), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v1.0.0 | Ultima entrada 2026-03-23 (Etapa 5 pipeline — READY) |
| Screen Manifests | 3/3 existem | ux-auth-001, ux-shell-001, ux-dash-001 |
| Dependencias | 1 upstream (MOD-000) | Consome auth_login, auth_logout, auth_me, auth_forgot_password, auth_reset_password, auth_change_password |
| Bloqueios | 0 | Nenhum BLK-* afeta MOD-001 |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-001 define o primeiro modulo de negocio construido sobre o Foundation, com abordagem UX-First: Screen Manifests YAML e User Stories orientadas a UX sao definidos **antes** de qualquer geracao de codigo backend. O modulo cobre Shell de Autenticacao, Application Shell e Dashboard Executivo.

```
1    (manual)              Revisar e finalizar epico US-MOD-001:             CONCLUIDO
                           - Escopo fechado (3 features UX-First)           status_agil = READY
                           - Gherkin validado (cascata, manifests, telemetria)  v0.5.0
                           - DoR completo (schema v1, 3 manifests, operationIds)
                           - Abordagem UX-First formalizada
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-001.md

2    (manual)              Revisar e finalizar features F01-F03:             CONCLUIDO
                           - F01: Shell Auth + Layout Base                  3/3 READY
                           - F02: Telemetria UI e Rastreabilidade
                           - F03: Dashboard Administrativo Executivo
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-001-F{01..03}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Primeiro modulo UX-First pos-Foundation. Scaffoldado em 2026-03-16 apos rollback de uma tentativa anterior (v0.3.0 do epico registra rollback de scaffold destruido).

```
3    /forge-module MOD-001  Scaffold completo gerado:                        CONCLUIDO
                           mod-001-backoffice-admin.md, CHANGELOG.md,       v0.1.0 (2026-03-16)
                           requirements/ (br/, fr/, data/, int/, sec/,
                           ux/, nfr/), adr/, amendments/
                           Stubs obrigatorios: DATA-003, SEC-002
                           Pasta: docs/04_modules/mod-001-backoffice-admin/
```

### Fase 2: Enriquecimento — CONCLUIDA

O enriquecimento do MOD-001 foi completo — todos os agentes rodaram entre 2026-03-16 e 2026-03-18. Durante o processo, 4 pendencias foram identificadas e todas resolvidas. Destaque para PENDENTE-003 que expandiu o escopo com FR-007 (Alterar Senha) e INT-006.

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-001
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-001
> ```

```
4    /enrich docs/04_modules/mod-001-backoffice-admin/
                           Agentes executados sobre mod-001:                 CONCLUIDO
                           AGN-DEV-01 (MOD), AGN-DEV-02 (BR),              v0.10.0 (2026-03-17)
                           AGN-DEV-03 (FR), AGN-DEV-04 (DATA),
                           AGN-DEV-05 (INT), AGN-DEV-06 (SEC),
                           AGN-DEV-07 (UX), AGN-DEV-08 (NFR),
                           AGN-DEV-09 (ADR), AGN-DEV-10 (PEN)
                           4 pendentes criadas e resolvidas (001-004)
```

#### Rastreio de Agentes — MOD-001

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-001-backoffice-admin.md | CONCLUIDO | CHANGELOG v0.2.0, v0.9.1 — Nivel 1 confirmado, pipeline corrigido |
| 2 | AGN-DEV-02 | BR | BR-001.md | CONCLUIDO | v0.4.0 — BR-009/BR-010 adicionadas (skeleton timeout, erro 5xx) |
| 3 | AGN-DEV-03 | FR | FR-001.md, FR-007.md | CONCLUIDO | FR-001 v0.4.0, FR-007 v0.1.0 (Alterar Senha — PENDENTE-003) |
| 4 | AGN-DEV-04 | DATA | DATA-001.md, DATA-003.md | CONCLUIDO | DATA-001 v0.4.0, DATA-003 v0.5.0 (UIActionEnvelope change_password) |
| 5 | AGN-DEV-05 | INT | INT-001.md, INT-006.md | CONCLUIDO | INT-001 v0.5.0, INT-006 v0.1.0 (POST /auth/change-password) |
| 6 | AGN-DEV-06 | SEC | SEC-001.md, SEC-002.md | CONCLUIDO | SEC-001 v0.4.0, SEC-002 v0.5.0 (auth.password_changed na matriz) |
| 7 | AGN-DEV-07 | UX | UX-001.md | CONCLUIDO | v0.6.0 — mapeamento Acoes→Endpoints→Events, submit_change_password |
| 8 | AGN-DEV-08 | NFR | NFR-001.md | CONCLUIDO | v0.4.0 — zero-blank-screen, resiliencia, telemetria retry |
| 9 | AGN-DEV-09 | ADR | ADR-001, ADR-002, ADR-003 | CONCLUIDO | 3 ADRs criadas e aceitas |
| 10 | AGN-DEV-10 | PEN | pen-001-pendente.md | CONCLUIDO | v0.12.0 — 4 pendentes criadas e resolvidas |

#### Pendentes Resolvidas (Enriquecimento) — Resumo Compacto

| # | ID | Status | Sev. | Decisao (resumo) | Artefato |
|---|-----|--------|------|-------------------|----------|
| 1 | PENDENTE-001 | IMPLEMENTADA | MEDIA | Opcao C — React Query/SWR cache 30s | FR-004, FR-005 |
| 2 | PENDENTE-002 | IMPLEMENTADA | BAIXA | Opcao B — Sidebar empty state com icone | FR-004, UX-001 |
| 3 | PENDENTE-003 | IMPLEMENTADA | ALTA | Opcao A — FR-007 + INT-006 Alterar Senha | FR-007, INT-006, DATA-003 |
| 4 | PENDENTE-004 | IMPLEMENTADA | MEDIA | Opcao B — fallback defensivo MFA redirect | FR-001 v0.6.0 |

> Detalhes completos: requirements/pen-001-pendente.md

### Fase 3: Validacao — CONCLUIDA

O `/validate-all` foi executado em 2026-03-22 e todos os validadores aplicaveis retornaram PASS (29/29 manifests globais aprovados). O MOD-001 passou em todos os checks aplicaveis.

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
5    /validate-all docs/04_modules/mod-001-backoffice-admin/
                           Orquestra TODAS as validacoes em sequencia:        CONCLUIDO (2026-03-22)
                           Internamente executa:                              PASS
                             1. /qa .......................... PASS
                             2. /validate-manifest ........... PASS (3 manifests)
                             3. /validate-openapi → N/A (UX-First, sem backend)
                             4. /validate-drizzle → N/A (UX-First, sem entidades)
                             5. /validate-endpoint → N/A (UX-First, sem handlers)
                           Pre-condicao: Enriquecimento concluido ✓
                           Pos-condicao: Relatorio consolidado PASS
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Resultado | Artefatos |
|---|-----------|-------------------|-----------|-----------|
| 1 | `/qa` | SIM (todos) | PASS | mod-001-backoffice-admin.md, requirements/*, adr/*, CHANGELOG.md |
| 2 | `/validate-manifest` | SIM (3 manifests existem) | PASS | ux-auth-001, ux-shell-001, ux-dash-001 |
| 3 | `/validate-openapi` | N/A | N/A | UX-First — sem backend proprio (endpoints sao do MOD-000) |
| 4 | `/validate-drizzle` | N/A | N/A | UX-First — sem entidades de banco proprias |
| 5 | `/validate-endpoint` | N/A | N/A | UX-First — sem handlers Fastify proprios |

### Fase 4: Promocao — CONCLUIDA

Modulo promovido a READY em 2026-03-23 (v1.0.0). Todos os criterios DoR atendidos.

```
6    /promote-module docs/04_modules/mod-001-backoffice-admin/
                           Selar mod-001 como READY:                         CONCLUIDO (2026-03-23)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (4/4 IMPLEMENTADA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (12/12)
                             [DoR-3] Zero erros de lint? ................ SIM (validate-all PASS)
                             [DoR-4] Screen manifests validados? ........ SIM (3/3 PASS)
                             [DoR-5] ADRs conforme nivel? ............... SIM (3 >= 1 para N1)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v1.0.0)
                             [DoR-7] Bloqueios cross-modulo? ............ SIM (0 bloqueios)

                           Resultado:
                             estado_item: DRAFT → READY
                             version: 0.10.0 → 1.0.0
                             CHANGELOG: Etapa 5 — Selo READY
```

### Fase 5: Geracao de Codigo — CONCLUIDA

Codegen completo em 2026-03-23. O scaffold foi criado (`/app-scaffold all`), seguido pela execucao dos 6 agentes COD. Como modulo UX-First (Nivel 1 sem backend proprio), os agentes de backend (DB, CORE, APP, API) foram skippados automaticamente. AGN-COD-WEB gerou 16 arquivos e AGN-COD-VAL validou o output com 1 erro, 3 warnings e 1 note — criando 4 novas pendencias (005-008). Pos-codegen: todas as 4 pendencias resolvidas em 2026-03-24. PENDENTE-006 (telemetria) — telemetry.ts + 6 hooks integrados. PENDENTE-005 (testes) — 10 arquivos de teste com vitest + RTL. PENDENTE-008 (timeout) — AMD-INT-005-001 + timeout opcional. PENDENTE-007 (interceptor 401) — AMD-SEC-001-001 + redirect global no apiRequest().

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
7    /app-scaffold all      Bootstrap dos workspaces monorepo:                CONCLUIDO (2026-03-23)
                           Criou apps/api/ e apps/web/ com estrutura base
                           pnpm_workspace atualizado

8    /codegen-agent docs/04_modules/mod-001-backoffice-admin/ AGN-COD-DB
                           Banco de Dados:                                   SKIPPED
                           Nivel 1 UX-First — sem module_paths API

     /codegen-agent docs/04_modules/mod-001-backoffice-admin/ AGN-COD-CORE
                           Dominio (DDD-lite):                               SKIPPED
                           Nivel 1 — sem camada Domain

     /codegen-agent docs/04_modules/mod-001-backoffice-admin/ AGN-COD-APP
                           Application / UseCases:                           SKIPPED
                           Nivel 1 UX-First — sem module_paths API

     /codegen-agent docs/04_modules/mod-001-backoffice-admin/ AGN-COD-API
                           Endpoints + OpenAPI:                              SKIPPED
                           Nivel 1 UX-First — sem module_paths API

     /codegen-agent docs/04_modules/mod-001-backoffice-admin/ AGN-COD-WEB
                           Frontend:                                         CONCLUIDO (2026-03-23)
                           16 arquivos gerados em apps/web/src/modules/backoffice-admin/
                           Camadas: data/ (7), domain/ (3), ui/screens/ (2), ui/components/ (4)

     /codegen-agent docs/04_modules/mod-001-backoffice-admin/ AGN-COD-VAL
                           Validador Global:                                 CONCLUIDO (2026-03-23)
                           Resultado: 1 erro, 3 warnings, 1 note
                           Checks: RFC9457 ✅, correlation_id ✅, layering ✅, tests ❌
                           4 pendencias criadas (005-008)
                           codegen.completed_at definido (todos agentes finalizados)
```

#### Rastreio de Agentes COD — MOD-001

| # | Agente | Camada | Path | Status | Arquivos |
|---|--------|--------|------|--------|----------|
| 1 | AGN-COD-DB | infrastructure | — | SKIPPED (Nivel 1 UX-First) | 0 |
| 2 | AGN-COD-CORE | domain | — | SKIPPED (Nivel 1) | 0 |
| 3 | AGN-COD-APP | application | — | SKIPPED (Nivel 1 UX-First) | 0 |
| 4 | AGN-COD-API | presentation | — | SKIPPED (Nivel 1 UX-First) | 0 |
| 5 | AGN-COD-WEB | web | apps/web/src/modules/backoffice-admin/ | DONE (2026-03-23) | 16 |
| 6 | AGN-COD-VAL | validation | (read-only) | DONE (2026-03-23) | 0 (validacao) |

#### Arquivos em apps/web/src/modules/backoffice-admin/ (17 fonte + 10 teste)

| # | Path | Linhas | Camada |
|---|------|--------|--------|
| 1 | data/api-client.ts | 113 | data |
| 2 | data/queries/use-auth-me.ts | 63 | data |
| 3 | data/mutations/use-login.ts | 56 | data |
| 4 | data/mutations/use-forgot-password.ts | 28 | data |
| 5 | data/mutations/use-reset-password.ts | 32 | data |
| 6 | data/mutations/use-logout.ts | 31 | data |
| 7 | data/mutations/use-change-password.ts | 40 | data |
| 8 | data/telemetry.ts | 119 | data (PENDENTE-006) |
| 9 | domain/greeting.ts | 25 | domain |
| 10 | domain/sidebar-config.ts | 89 | domain |
| 11 | domain/shortcut-config.ts | 66 | domain |
| 12 | ui/screens/LoginPage.tsx | 368 | ui |
| 13 | ui/screens/DashboardPage.tsx | 191 | ui |
| 14 | ui/components/AppShell.tsx | 206 | ui |
| 15 | ui/components/ProfileWidget.tsx | 152 | ui |
| 16 | ui/components/ChangePasswordModal.tsx | 218 | ui |
| 17 | ui/components/Toast.tsx | 125 | ui |
| — | **Arquivos de teste (PENDENTE-005)** | | |
| 18 | domain/greeting.test.ts | — | test |
| 19 | domain/sidebar-config.test.ts | — | test |
| 20 | domain/shortcut-config.test.ts | — | test |
| 21 | data/api-client.test.ts | — | test |
| 22 | ui/components/Toast.test.tsx | — | test |
| 23 | ui/components/ChangePasswordModal.test.tsx | — | test |
| 24 | ui/components/ProfileWidget.test.tsx | — | test |
| 25 | ui/components/AppShell.test.tsx | — | test |
| 26 | ui/screens/LoginPage.test.tsx | — | test |
| 27 | ui/screens/DashboardPage.test.tsx | — | test |
| — | **Infraestrutura de teste** | | |
| 28 | ../../vitest.config.ts | — | config |
| 29 | ../../src/test-setup.ts | — | config |
| 30 | __tests__/test-utils.tsx | — | test |

#### Resultado da Validacao AGN-COD-VAL

| Check | Resultado |
|-------|-----------|
| problem_details_rfc9457 | ✅ OK |
| correlation_id | ✅ OK |
| idempotency | ✅ N/A |
| layering_clean_arch | ✅ OK |
| tests_present | ❌ MISSING |
| openapi_present_and_linted | ✅ N/A |
| x_permissions_documented | ✅ N/A |

| # | Sev. | Finding | Pendencia |
|---|------|---------|-----------|
| 1 | ERROR | ~~Testes unitarios ausentes~~ — RESOLVIDO (10 arquivos de teste criados) | PENDENTE-005 (IMPLEMENTADA) |
| 2 | WARNING | ~~UIActionEnvelope/telemetria nao implementada~~ — RESOLVIDO (telemetry.ts) | PENDENTE-006 (IMPLEMENTADA) |
| 3 | WARNING | ~~Interceptor 401 nao e global~~ — RESOLVIDO (redirect global no apiRequest + AMD-SEC-001-001) | PENDENTE-007 (IMPLEMENTADA) |
| 4 | WARNING | ~~Timeout auth_me 5s vs 3s especificado em INT-005~~ — RESOLVIDO (timeout opcional + AMD-INT-005-001) | PENDENTE-008 (IMPLEMENTADA) |
| 5 | NOTE | Icones de toggle com emoji (🙈👁) — renderizacao inconsistente | (nao gera pendencia) |
| 6 | ERROR | ~~Lint errors codegen (7 ocorrencias ESLint + Prettier)~~ — RESOLVIDO (0 errors confirmado, ja corrigidos via PEN-000/PENDENTE-018) | PENDENTE-009 (IMPLEMENTADA) |

> Dados de execution state: `.agents/execution-state/MOD-001.json` — timestamps precisos de cada agente.

### Fase 6: Pos-READY — EM USO

2 amendments criados ate o momento. O modulo permanece READY; amendments documentam mudancas sem alterar a base selada.

```
9    /create-amendment INT-005 melhoria "timeout configuravel"
                           Amendment criado:                                 CONCLUIDO (2026-03-24)
                           AMD-INT-005-001__timeout_configuravel.md
                           Origem: PENDENTE-008 — timeout opcional em
                           RequestOptions + use-auth-me 3s

9b   /create-amendment SEC-001 melhoria "interceptor 401 global"
                           Amendment criado:                                 CONCLUIDO (2026-03-24)
                           AMD-SEC-001-001__interceptor_401_global.md
                           Origem: PENDENTE-007 — redirect /login global
                           no apiRequest() do api-client.ts

10   /update-specification docs/04_modules/mod-001-backoffice-admin/requirements/fr/FR-001.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

11   /create-amendment FR-001 melhoria "adicionar tela MFA"
                           Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
                           Caso de uso previsto: UX-MFA-001 (tela MFA)
                           quando MOD-000 ativar MFA e o roadmap mudar
```

### Gestao de Pendencias (qualquer momento)

> **Decision tree de pendencias:**
>
> ```
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-001
> ├── Criar nova pendencia     → /manage-pendentes create PEN-001
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-001 PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-001 PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-001 PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-001 PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-001
> ```

```
16   /manage-pendentes list PEN-001
                           Estado atual MOD-001:
                             PEN-001: 9 itens total
                               8 IMPLEMENTADA (001-008)
                               0 ABERTA
                             SLA: nenhum vencido — todas resolvidas
```

| # | ID | Status | Sev. | Decisao (resumo) | Artefato |
|---|-----|--------|------|-------------------|----------|
| 1 | PENDENTE-001 | IMPLEMENTADA | MEDIA | Opcao C — React Query/SWR cache 30s | FR-004, FR-005 |
| 2 | PENDENTE-002 | IMPLEMENTADA | BAIXA | Opcao B — Sidebar empty state | FR-004, UX-001 |
| 3 | PENDENTE-003 | IMPLEMENTADA | ALTA | Opcao A — FR-007 + INT-006 Alterar Senha | FR-007, INT-006, DATA-003 |
| 4 | PENDENTE-004 | IMPLEMENTADA | MEDIA | Opcao B — fallback MFA redirect | FR-001 v0.6.0 |
| 5 | PENDENTE-005 | IMPLEMENTADA | ALTA | Opcao C — 10 test files (vitest + RTL) | *.test.ts/tsx, vitest.config.ts |
| 6 | PENDENTE-006 | IMPLEMENTADA | ALTA | Opcao A — telemetry.ts + integracao 6 hooks | telemetry.ts, use-*.ts |
| 7 | PENDENTE-007 | IMPLEMENTADA | MEDIA | Opcao A — interceptor 401 global apiRequest() + AMD-SEC-001-001 | api-client.ts |
| 8 | PENDENTE-008 | IMPLEMENTADA | BAIXA | Opcao A — timeout opcional RequestOptions + AMD-INT-005-001 | api-client.ts, use-auth-me.ts |
| 9 | PENDENTE-009 | IMPLEMENTADA | MEDIA | Opcao A — lint errors ja corrigidos (0 errors confirmado) | PEN-000/PENDENTE-018 |

> Detalhes completos: requirements/pen-001-pendente.md

### Utilitarios (qualquer momento)

```
14   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-001): <descricao>

15   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

17   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-001

```
US-MOD-001 (READY v0.5.0)              ← Fase 0: CONCLUIDA
  │  3/3 features READY (UX-First)
  ▼
mod-001-backoffice-admin/ (stubs DRAFT) ← Fase 1: CONCLUIDA (forge-module v0.1.0)
  │
  ▼
mod-001 enriquecido (DRAFT v0.10.0)     ← Fase 2: CONCLUIDA (10 agentes, 4 PENDENTEs resolvidas)
  │
  ▼
mod-001 validado (DRAFT)                ← Fase 3: CONCLUIDA (validate-all PASS 2026-03-22)
  │
  ▼
mod-001 selado (READY v1.0.0)           ← Fase 4: CONCLUIDA (promote-module 2026-03-23)
  │
  ▼
mod-001 codigo gerado                   ← Fase 5: CONCLUIDA (2026-03-23)
  │  Scaffold apps/ ok (api + web)
  │  AGN-COD-WEB: 16 arquivos em apps/web/src/modules/backoffice-admin/
  │  AGN-COD-VAL: 1E/3W/1N → 4 pendencias (005-008) — todas IMPLEMENTADAS
  │  Pos-codegen: telemetry.ts, testes, timeout, interceptor 401
  │
  ▼
mod-001 + amendments/                   ← Fase 6: EM USO (2 amendments: AMD-INT-005-001, AMD-SEC-001-001)
  │
  ├── ★ PROXIMO PASSO: pnpm install + pnpm test + pnpm lint

Dependencia upstream: MOD-000 (Foundation) — camada topologica 1.
MOD-001 prove Application Shell para MOD-002+ (Sidebar, Header, Breadcrumb).
```

---

## Particularidades do MOD-001

| Aspecto | Detalhe |
|---------|---------|
| Modulo UX-First | Nao possui backend proprio — consome endpoints do MOD-000 (Foundation). No codegen, apenas AGN-COD-WEB e AGN-COD-VAL foram executados (4 agentes de backend skippados). Validadores `/validate-openapi`, `/validate-drizzle` e `/validate-endpoint` sao N/A no codegen-val. |
| Nivel 1 — Clean Leve (Score 1/6) | Unico gatilho ativo: multi-tenant (Sidebar filtrada por scopes). Score 1/6 qualificaria para Nivel 0, mas Nivel 1 escolhido por testabilidade e evolucao prevista (ADR-001). |
| Provedor do Application Shell | MOD-002+ utilizam o Shell provido por este modulo (Sidebar, Header, Breadcrumb). O codigo gerado e a base de frontend para toda a aplicacao. |
| 3 ADRs para Nivel 1 | Excede o minimo de 1 ADR. ADR-001 (Clean Leve), ADR-002 (Telemetria Pre/Pos-Auth), ADR-003 (Zero-Blank-Screen com Skeleton Timeout 3s). |
| Dependencia exclusiva de MOD-000 | Todos os 6 operationIds consumidos sao do Foundation. O codigo do MOD-001 consome APIs via api-client.ts com fetch wrapper centralizado. |
| Escopo expandido pos-enriquecimento | PENDENTE-003 expandiu o escopo com FR-007 (Alterar Senha) e INT-006, passando de 10 para 12 artefatos de requisitos. |
| 4 pendencias do codegen-val | AGN-COD-VAL identificou 4 gaps (005-008). Todas 4 IMPLEMENTADAS: testes (005), telemetria (006), interceptor 401 (007), timeout (008). Zero pendencias abertas. |

---

## Checklist Rapido — Pos-Codegen MOD-001

Modulo READY com codegen completo. Itens restantes para qualidade de codigo:

- [x] Executar `/app-scaffold all` — criar apps/api/ e apps/web/ (2026-03-23)
- [x] Executar codegen MOD-001 — AGN-COD-WEB (16 arquivos gerados, 2026-03-23)
- [x] Executar codegen MOD-001 — AGN-COD-VAL (validacao cruzada, 2026-03-23)
- [x] Revisar arquivos gerados em apps/web/src/modules/backoffice-admin/ (16 arquivos)
- [x] **PENDENTE-005 (ALTA):** Testes unitarios + componente criados — 10 test files com vitest + RTL (2026-03-24)
- [x] **PENDENTE-006 (ALTA):** UIActionEnvelope/telemetria implementada — telemetry.ts + 6 hooks (2026-03-24)
- [x] **PENDENTE-007 (MEDIA):** Interceptor 401 global no apiRequest() — AMD-SEC-001-001, api-client.ts (2026-03-24)
- [x] **PENDENTE-008 (BAIXA):** Timeout configuravel por endpoint — AMD-INT-005-001, api-client.ts, use-auth-me.ts (2026-03-24)
- [x] **PENDENTE-009 (MEDIA):** Lint errors codegen — ja corrigidos via PEN-000/PENDENTE-018, 0 errors confirmado (2026-03-24)
- [ ] Executar `pnpm install` (novas deps: vitest, @testing-library/react, jsdom)
- [ ] Executar `pnpm test` e `pnpm lint`

> **Nota:** 8/8 pendencias resolvidas. Todas as pendencias do codegen-val implementadas. Apos `pnpm install`, os 10 arquivos de teste podem ser executados via `pnpm --filter @easycode/web test`.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 3.5.0 | 2026-03-24 | Atualizacao: PENDENTE-009 IMPLEMENTADA (Opcao A — lint errors ja corrigidos via PEN-000/PENDENTE-018, 0 errors confirmado). 9/9 pendencias resolvidas |
| 3.4.0 | 2026-03-24 | Atualizacao: PENDENTE-007 IMPLEMENTADA (Opcao A — interceptor 401 global no apiRequest() + AMD-SEC-001-001). 8/8 pendencias resolvidas, 2 amendments. Zero pendencias abertas |
| 3.3.0 | 2026-03-24 | Atualizacao: PENDENTE-008 IMPLEMENTADA (Opcao A — timeout opcional RequestOptions + use-auth-me 3s + AMD-INT-005-001). 7/8 pendencias resolvidas, 1 amendment criado. Fase 6 atualizada para EM USO |
| 3.2.0 | 2026-03-24 | Atualizacao: PENDENTE-005 IMPLEMENTADA (Opcao C — 10 test files: 3 domain + 1 data + 6 component + vitest config + test-utils). 6/8 pendencias resolvidas. Checklist e resumo atualizados |
| 3.1.0 | 2026-03-24 | Atualizacao: PENDENTE-005 DECIDIDA (Opcao C testes), PENDENTE-006 IMPLEMENTADA (Opcao A telemetry.ts + hooks). 2 abertas restantes (007, 008). Checklist e resumo visual atualizados |
| 3.0.0 | 2026-03-23 | Atualizacao: Fase 5 CONCLUIDA — scaffold ok, AGN-COD-WEB done (16 arquivos), AGN-COD-VAL done (1E/3W/1N). codegen.completed_at definido. 4 novas pendencias (005-008) do validador. Checklist atualizado para foco pos-codegen |
| 2.1.0 | 2026-03-23 | Atualizacao: Fase 4 CONCLUIDA (promote-module 2026-03-23, v1.0.0 READY). Nova Fase 5: Geracao de Codigo — NAO INICIADA (UX-First: AGN-COD-WEB + AGN-COD-VAL, 4 agentes backend N/A). Decision tree de codegen adicionado. Checklist atualizado para foco em codegen |
| 2.0.0 | 2026-03-23 | Recriacao: Fase 3 atualizada para CONCLUIDA (validate-all PASS 2026-03-22), Gate 0 DoR 7/7 atendidos, Fase 4 como proximo passo, pendencias em formato compacto com referencia ao pen file |
| 1.0.0 | 2026-03-22 | Criacao completa: Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 4 pendentes resolvidas, rastreio de agentes, mapa de cobertura de validadores, particularidades UX-First |
