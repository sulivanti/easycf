# Procedimento — Plano de Acao MOD-001 Backoffice Admin

> **Versao:** 2.1.0 | **Data:** 2026-03-23 | **Owner:** arquitetura
> **Estado atual do modulo:** READY (v1.0.0) | **Epico:** READY (v0.5.0) | **Features:** 3/3 READY
>
> Fases 0-4 concluidas. Modulo promovido a READY em 2026-03-23 (v1.0.0). Proximo passo: executar `/app-scaffold all` e depois `/codegen docs/04_modules/mod-001-backoffice-admin/` (UX-First — apenas AGN-COD-WEB + AGN-COD-VAL).

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-001 | READY (v0.5.0) | DoR completo, 3 features vinculadas, abordagem UX-First |
| Features F01-F03 | 3/3 READY | F01 (Shell Auth + Layout), F02 (Telemetria UI), F03 (Dashboard Executivo) |
| Scaffold (forge-module) | CONCLUIDO | mod-001-backoffice-admin/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | Agentes 01-10 confirmados, v0.10.0, 4 pendentes resolvidas |
| Codegen (6 agentes) | NAO INICIADO | Scaffold apps/ inexistente. UX-First: apenas AGN-COD-WEB e AGN-COD-VAL aplicaveis (Nivel 1 sem API propria) |
| PENDENTEs | 0 abertas | 4 total: 4 IMPLEMENTADA |
| ADRs | 3 aceitas | Nivel 1 requer minimo 1 — atendido (ADR-001 Clean Leve, ADR-002 Telemetria, ADR-003 Zero-Blank-Screen) |
| Amendments | 0 | Nenhum |
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

#### Pendentes Resolvidas — Resumo Compacto

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

### Fase 5: Geracao de Codigo — NAO INICIADA

MOD-001 esta READY (pre-requisito para codegen atendido). Como modulo UX-First (Nivel 1 sem backend proprio), apenas os agentes AGN-COD-WEB e AGN-COD-VAL sao aplicaveis — os agentes de backend (DB, CORE, APP, API) sao N/A porque o modulo nao possui module_paths de API.

> **Decision tree de codegen:**
>
> ```
> Preciso gerar codigo para os modulos?
> ├── Scaffold existe? (apps/api/, apps/web/)
> │   └── NAO → /app-scaffold all (one-time, cria apps/api e apps/web)
> └── SIM → Qual escopo?
>     ├── Todos modulos READY (ordem topologica)  → /codegen-all (--dry-run para preview)
>     ├── Todos agentes de 1 modulo               → /codegen mod-001
>     └── 1 agente especifico                     → /codegen-agent mod-001 AGN-COD-WEB
> ```

```
7    /app-scaffold all      Bootstrap dos workspaces monorepo:                A EXECUTAR (one-time)
                           Cria apps/api/ e apps/web/ com estrutura base
                           Pre-condicao: Nenhuma (gate detecta se ja existe)

8    /codegen docs/04_modules/mod-001-backoffice-admin/
                           Gerar codigo para mod-001 (UX-First):             A EXECUTAR (apos scaffold)
                           Fase 1: AGN-COD-DB   → N/A (sem API paths)
                           Fase 2: AGN-COD-CORE → N/A (Nivel 1, sem Domain)
                           Fase 3: AGN-COD-APP  → N/A (sem API paths)
                           Fase 4: AGN-COD-API  → N/A (sem API paths)
                           Fase 5: AGN-COD-WEB  (frontend — UI, estados, consumo API MOD-000)
                           Fase 6: AGN-COD-VAL  (validacao cruzada — read-only)
                           Pre-condicao: Scaffold existe, estado_item = READY
                           Pos-condicao: Codigo gerado em apps/web/src/modules/backoffice-admin/
```

> **Nota:** MOD-001 depende de MOD-000 (Foundation) para endpoints de auth. O codigo do MOD-000 deve ser gerado primeiro (camada topologica 0). MOD-001 esta na camada topologica 1. O `/codegen-all` respeita esta ordem automaticamente.

#### Rastreio de Agentes COD — MOD-001

| # | Agente | Camada | Path | Status | Arquivos |
|---|--------|--------|------|--------|----------|
| 1 | AGN-COD-DB | infrastructure | — | N/A (UX-First, sem API paths) | 0 |
| 2 | AGN-COD-CORE | domain | — | N/A (Nivel 1) | 0 |
| 3 | AGN-COD-APP | application | — | N/A (UX-First, sem API paths) | 0 |
| 4 | AGN-COD-API | presentation | — | N/A (UX-First, sem API paths) | 0 |
| 5 | AGN-COD-WEB | web | apps/web/src/modules/backoffice-admin/ | A EXECUTAR | 0 |
| 6 | AGN-COD-VAL | validation | (read-only) | A EXECUTAR | 0 |

#### Pre-requisitos para Codegen

1. **Scaffold:** `apps/web/package.json` — NAO EXISTE → executar `/app-scaffold all`
2. **Dependencia upstream:** MOD-000 deve ter codigo gerado primeiro (camada topologica 0)
3. **Ordem topologica:** MOD-001 esta na camada 1 — executar apos MOD-000

### Fase 6: Pos-READY (quando necessario)

```
9    /update-specification docs/04_modules/mod-001-backoffice-admin/requirements/fr/FR-001.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

10   /create-amendment FR-001 melhoria "adicionar tela MFA"
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
                             PEN-001: 4 itens total
                               4 IMPLEMENTADA (001-004)
                               0 ABERTA
                             SLA: nenhum vencido
```

| # | ID | Status | Sev. | Decisao (resumo) | Artefato |
|---|-----|--------|------|-------------------|----------|
| 1 | PENDENTE-001 | IMPLEMENTADA | MEDIA | Opcao C — React Query/SWR cache 30s | FR-004, FR-005 |
| 2 | PENDENTE-002 | IMPLEMENTADA | BAIXA | Opcao B — Sidebar empty state | FR-004, UX-001 |
| 3 | PENDENTE-003 | IMPLEMENTADA | ALTA | Opcao A — FR-007 + INT-006 Alterar Senha | FR-007, INT-006, DATA-003 |
| 4 | PENDENTE-004 | IMPLEMENTADA | MEDIA | Opcao B — fallback MFA redirect | FR-001 v0.6.0 |

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
  ├── ★ PROXIMO PASSO: /app-scaffold all → /codegen mod-001
  │
  ▼
mod-001 codigo gerado                   ← Fase 5: NAO INICIADA
  │  Scaffold apps/ inexistente
  │  UX-First: apenas AGN-COD-WEB + AGN-COD-VAL
  │  Depende de MOD-000 ter codigo gerado primeiro
  │
  ▼
mod-001 + amendments/                   ← Fase 6: SOB DEMANDA (0 amendments)

Dependencia upstream: MOD-000 (Foundation) — camada topologica 1.
MOD-001 prove Application Shell para MOD-002+ (Sidebar, Header, Breadcrumb).
```

---

## Particularidades do MOD-001

| Aspecto | Detalhe |
|---------|---------|
| Modulo UX-First | Nao possui backend proprio — consome endpoints do MOD-000 (Foundation). No codegen, apenas AGN-COD-WEB e AGN-COD-VAL sao aplicaveis (4 agentes de backend sao N/A). Validadores `/validate-openapi`, `/validate-drizzle` e `/validate-endpoint` continuam N/A. |
| Nivel 1 — Clean Leve (Score 1/6) | Unico gatilho ativo: multi-tenant (Sidebar filtrada por scopes). Score 1/6 qualificaria para Nivel 0, mas Nivel 1 escolhido por testabilidade e evolucao prevista (ADR-001). |
| Provedor do Application Shell | MOD-002+ utilizam o Shell provido por este modulo (Sidebar, Header, Breadcrumb). Gerar codigo do MOD-001 e relevante para a cadeia de frontend. |
| 3 ADRs para Nivel 1 | Excede o minimo de 1 ADR. ADR-001 (Clean Leve), ADR-002 (Telemetria Pre/Pos-Auth), ADR-003 (Zero-Blank-Screen com Skeleton Timeout 3s). |
| Dependencia exclusiva de MOD-000 | Todos os 6 operationIds consumidos sao do Foundation. O codigo do MOD-000 deve ser gerado antes para que o MOD-001 possa referenciar tipos e guards compartilhados. |
| Escopo expandido pos-enriquecimento | PENDENTE-003 expandiu o escopo com FR-007 (Alterar Senha) e INT-006, passando de 10 para 12 artefatos de requisitos. |

---

## Checklist Rapido — Codegen MOD-001

Modulo ja esta READY. Checklist de geracao de codigo:

- [ ] Executar `/app-scaffold all` — criar apps/api/ e apps/web/ (se nao executado)
- [ ] Aguardar codegen do MOD-000 (camada topologica 0 — pre-requisito)
- [ ] Executar `/codegen docs/04_modules/mod-001-backoffice-admin/` — gerar codigo (WEB + VAL)
- [ ] Revisar arquivos gerados em apps/web/src/modules/backoffice-admin/
- [ ] Executar `pnpm test` e `pnpm lint`

> **Nota:** MOD-001 e UX-First na camada topologica 1. Apenas AGN-COD-WEB gera codigo (apps/web/). Os 4 agentes de backend sao skippados automaticamente. O `/codegen-all` orquestra a ordem correta (MOD-000 primeiro, depois MOD-001).

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 2.1.0 | 2026-03-23 | Atualizacao: Fase 4 CONCLUIDA (promote-module 2026-03-23, v1.0.0 READY). Nova Fase 5: Geracao de Codigo — NAO INICIADA (UX-First: AGN-COD-WEB + AGN-COD-VAL, 4 agentes backend N/A). Decision tree de codegen adicionado. Checklist atualizado para foco em codegen |
| 2.0.0 | 2026-03-23 | Recriacao: Fase 3 atualizada para CONCLUIDA (validate-all PASS 2026-03-22), Gate 0 DoR 7/7 atendidos, Fase 4 como proximo passo, pendencias em formato compacto com referencia ao pen file |
| 1.0.0 | 2026-03-22 | Criacao completa: Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 4 pendentes resolvidas, rastreio de agentes, mapa de cobertura de validadores, particularidades UX-First |
