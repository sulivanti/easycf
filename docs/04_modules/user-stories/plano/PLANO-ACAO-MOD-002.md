# Procedimento — Plano de Acao MOD-002 Gestao de Usuarios

> **Versao:** 4.0.0 | **Data:** 2026-03-23 | **Owner:** arquitetura
> **Estado atual do modulo:** READY (v1.0.0) | **Epico:** READY (v1.2.0) | **Features:** 3/3 READY
>
> Fases 0-4 concluidas — modulo promovido a READY em 2026-03-23. Proximo passo: Fase 5 (Geracao de Codigo) — executar `/app-scaffold all` e depois `/codegen mod-002`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-002 | READY (v1.2.0) | DoR completo, 3 features vinculadas, separacao clara MOD-002 (UX) vs MOD-000-F05 (API) |
| Features F01-F03 | 3/3 READY | F01 (Listagem Usuarios), F02 (Formulario Cadastro), F03 (Convite e Ativacao) |
| Scaffold (forge-module) | CONCLUIDO | mod-002-gestao-usuarios/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | Agentes 01-10 confirmados, v0.4.0, 3 pendentes resolvidas |
| Codegen (6 agentes) | NAO INICIADO | Scaffold de apps nao existe (apps/api/, apps/web/); executar `/app-scaffold all` primeiro |
| PENDENTEs | 0 abertas | 3 total: 3 IMPLEMENTADA |
| ADRs | 3 READY | Nivel 1 requer minimo 1 — atendido (ADR-001 UX-First, ADR-002 PII-Safe, ADR-003 Idempotency-Key) |
| Amendments | 0 | Nenhum |
| Requirements | 17/17 existem | BR(6), FR(3), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v1.0.0 | Ultima entrada 2026-03-23 (Promocao DRAFT→READY) |
| Screen Manifests | 3/3 existem | ux-usr-001, ux-usr-002, ux-usr-003 |
| Dependencias | 1 upstream (MOD-000) | Consome Users API (F05), Roles API (F06), Auth, Catalogo de Scopes (F12) |
| Bloqueios | 1 | BLK-001: Amendment `users_invite_resend` no MOD-000-F05 (PENDENTE no grafo — ja implementado como PENDENTE-001 IMPLEMENTADA) |

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

#### Pendentes Resolvidas — Resumo Compacto

| # | ID | Status | Sev. | Decisao (resumo) | Artefato |
|---|-----|--------|------|-------------------|----------|
| 1 | PENDENTE-001 | IMPLEMENTADA | BLOQUEANTE | Opcao A — Amendment users_invite_resend no MOD-000-F05 | FR-000 §FR-006 (MOD-000) |
| 2 | PENDENTE-002 | IMPLEMENTADA | MEDIA | Opcao A — Cooldown client-side, known limitation v1 | BR-004 v0.2.0 |
| 3 | PENDENTE-003 | IMPLEMENTADA | BAIXA | Opcao A — Object map plain strings em domain/copy.ts | ADR-002 v0.2.0 |

> Detalhes completos: requirements/pen-002-pendente.md

### Fase 3: Validacao — CONCLUIDA

O `/validate-all` foi executado em 2026-03-22 e todos os validadores aplicaveis retornaram PASS (29/29 manifests globais aprovados). O MOD-002 passou em todos os checks aplicaveis.

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
                           Orquestra TODAS as validacoes em sequencia:        CONCLUIDO (2026-03-22)
                           Internamente executa:                              PASS
                             1. /qa .......................... PASS
                             2. /validate-manifest ........... PASS (3 manifests)
                             3. /validate-openapi → N/A (UX-First, sem backend)
                             4. /validate-drizzle → N/A (UX-First, sem entidades)
                             5. /validate-endpoint → N/A (UX-First, sem handlers)
                           Pre-condicao: Enriquecimento concluido
                           Pos-condicao: Relatorio consolidado PASS
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Resultado | Artefatos |
|---|-----------|-------------------|-----------|-----------|
| 1 | `/qa` | SIM (todos) | PASS | mod-002-gestao-usuarios.md, requirements/*, adr/*, CHANGELOG.md |
| 2 | `/validate-manifest` | SIM (3 manifests existem) | PASS | ux-usr-001, ux-usr-002, ux-usr-003 |
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

### Fase 5: Geracao de Codigo — NAO INICIADA

O modulo esta READY e elegivel para geracao de codigo. Por ser UX-First (Nivel 1 sem backend proprio), apenas os agentes AGN-COD-WEB e AGN-COD-VAL sao aplicaveis — os agentes de API (DB, CORE, APP, API) sao N/A. O prerequisito e a existencia do scaffold de aplicacao (`apps/web/`), que ainda nao foi criado.

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
11   /app-scaffold all     Criar scaffold de aplicacao (one-time):           A EXECUTAR
                           - apps/api/ (Fastify + Drizzle + OpenAPI)
                           - apps/web/ (React + TanStack Router)
                           Pre-requisito para qualquer /codegen

12   /codegen mod-002      Gerar codigo para MOD-002:                        A EXECUTAR
                           Agentes aplicaveis (Nivel 1 UX-First):
                             AGN-COD-WEB .... Frontend (apps/web/src/modules/users/)
                             AGN-COD-VAL .... Validacao cruzada
                           Agentes N/A (UX-First, sem backend proprio):
                             AGN-COD-DB ..... N/A (sem entidades de banco)
                             AGN-COD-CORE ... N/A (Nivel 1 — sem camada Domain API)
                             AGN-COD-APP .... N/A (sem use cases API)
                             AGN-COD-API .... N/A (sem endpoints proprios)
                           Pre-condicao: estado_item = READY, scaffold existe
                           Pos-condicao: apps/web/src/modules/users/ populado
```

#### Rastreio de Agentes COD — MOD-002

| # | Agente | Camada | Path | Status | Arquivos |
|---|--------|--------|------|--------|----------|
| 1 | AGN-COD-DB | infrastructure | apps/api/src/modules/users/infrastructure/ | N/A (UX-First) | — |
| 2 | AGN-COD-CORE | domain | apps/api/src/modules/users/domain/ | N/A (Nivel 1) | — |
| 3 | AGN-COD-APP | application | apps/api/src/modules/users/application/ | N/A (UX-First) | — |
| 4 | AGN-COD-API | presentation | apps/api/src/modules/users/presentation/ | N/A (UX-First) | — |
| 5 | AGN-COD-WEB | web | apps/web/src/modules/users/ | A EXECUTAR | 0 |
| 6 | AGN-COD-VAL | validation | — | A EXECUTAR | — |

> **Nota sobre ordem topologica:** MOD-002 esta na camada topologica 1 (depende apenas de MOD-000). Para codegen completo, MOD-000 deve ter codigo gerado antes, pois MOD-002 consome operationIds de MOD-000-F05/F06. Se MOD-000 ainda nao tem codigo, o AGN-COD-WEB pode gerar os componentes com imports mockados, a serem resolvidos quando MOD-000 estiver codificado.

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
                             PEN-002: 3 itens total
                               3 IMPLEMENTADA (001-003)
                               0 ABERTA
                             SLA: nenhum vencido
```

| # | ID | Status | Sev. | Decisao (resumo) | Artefato |
|---|-----|--------|------|-------------------|----------|
| 1 | PENDENTE-001 | IMPLEMENTADA | BLOQUEANTE | Opcao A — Amendment users_invite_resend | FR-000 §FR-006 (MOD-000) |
| 2 | PENDENTE-002 | IMPLEMENTADA | MEDIA | Opcao A — Cooldown client-side (known limitation v1) | BR-004 v0.2.0 |
| 3 | PENDENTE-003 | IMPLEMENTADA | BAIXA | Opcao A — Object map plain strings domain/copy.ts | ADR-002 v0.2.0 |

> Detalhes completos: requirements/pen-002-pendente.md

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
  ├── ★ PROXIMO PASSO: /app-scaffold all → /codegen mod-002
  │     Agentes aplicaveis: AGN-COD-WEB, AGN-COD-VAL
  │     Scaffold de apps nao existe ainda
  │
  ▼
mod-002 com codigo gerado              ← Fase 5: A EXECUTAR (AGN-COD-WEB + AGN-COD-VAL)
  │
  ▼
mod-002 + amendments/                   ← Fase 6: SOB DEMANDA (0 amendments)

Dependencia upstream: MOD-000 (Foundation) — camada topologica 1.
MOD-002 e modulo folha — nao tem dependentes downstream.
BLK-001 (users_invite_resend) ja resolvido via PENDENTE-001.
```

---

## Particularidades do MOD-002

| Aspecto | Detalhe |
|---------|---------|
| Modulo UX-First (N1) | Exclusivamente frontend — consome 6 operationIds do MOD-000-F05/F06 (users_list, users_create, users_get, users_delete, users_invite_resend, roles_list). Os validadores `/validate-openapi`, `/validate-drizzle` e `/validate-endpoint` sao N/A. Os agentes COD de backend (DB, CORE, APP, API) sao N/A — apenas AGN-COD-WEB e AGN-COD-VAL se aplicam. |
| Nivel 1 — Clean Leve (Score 2/6) | Dois gatilhos ativos: integracoes externas criticas (6 operationIds de MOD-000) e multi-tenant (visibilidade filtrada por tenant_id, 3 scopes RBAC distintos). Justifica N1 por testabilidade com mocks e regras de apresentacao complexas. |
| BLK-001 resolvido | O DEPENDENCY-GRAPH lista BLK-001 (amendment `users_invite_resend` no MOD-000-F05) como PENDENTE. Na pratica, o endpoint ja foi adicionado ao MOD-000 via FR-000 §FR-006 (PENDENTE-001 IMPLEMENTADA). O status do BLK-001 no grafo precisa ser atualizado. |
| Protecao LGPD | ADR-002 (PII-Safe UI Pattern) determina que e-mails nunca aparecem em toasts, modais ou mensagens de erro. Todas as 3 telas seguem este padrao. E-mail so e exibido em campos de formulario, nunca em feedback ao usuario. |
| Idempotencia no frontend | ADR-003 (Idempotency-Key) define UUID v4 gerado no mount da tela, enviado em POSTs. Protege contra double-click e resubmissions. Cooldown de 60s no reenvio de convite e client-side only (known limitation v1 — PENDENTE-002). |
| Modulo folha | MOD-002 nao tem dependentes downstream. E um modulo consumidor puro — nao prove APIs ou servicos para outros modulos. |
| Promocao concluida | Modulo promovido a READY em 2026-03-23 (v1.0.0). Todas as ADRs e PEN-002 tambem selados como READY. A especificacao esta imutavel — alteracoes requerem amendments formais. |

---

## Checklist Rapido — O que Falta para Codegen

- [ ] Executar `/app-scaffold all` — criar scaffold de aplicacao (apps/api/, apps/web/) — pre-requisito one-time
- [ ] Executar `/codegen mod-002` — gerar codigo frontend (AGN-COD-WEB + AGN-COD-VAL)
- [ ] Verificar se MOD-000 tem codigo gerado (dependencia upstream para operationIds reais)

> **Nota:** O modulo ja esta READY (v1.0.0). O checklist para READY esta 100% completo. Os itens acima sao para a Fase 5 (Geracao de Codigo). MOD-002 e UX-First, portanto apenas a camada Web precisa de codigo. A dependencia upstream (MOD-000) deve idealmente ter seus endpoints codificados antes para que os imports de operationIds sejam reais, mas o codegen pode prosseguir com mocks.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 4.0.0 | 2026-03-23 | Atualizacao: Fase 4 promovida a CONCLUIDA (promote-module 2026-03-23, READY v1.0.0), Fase 5 reestruturada como Geracao de Codigo com rastreio de agentes COD e deteccao de scaffold, Fase 6 renumerada para Pos-READY, checklist atualizado para codegen |
| 3.0.0 | 2026-03-23 | Recriacao: Fase 3 atualizada para CONCLUIDA (validate-all PASS 2026-03-22), Gate 0 DoR 7/7 atendidos, Fase 4 como proximo passo, pendencias em formato compacto com referencia ao pen file |
| 2.0.0 | 2026-03-22 | Reescrita completa: detalhamento completo das 3 pendentes resolvidas (001-003), rastreio de 11 agentes, mapa de cobertura de validadores, particularidades (BLK-001, LGPD, cooldown, idempotencia, UX-First), painel de pendencias |
| 1.0.0 | 2026-03-21 | Criacao: estado atual, fases 0-5, DoR Gate 0, particularidades |
