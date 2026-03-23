# Procedimento — Plano de Acao MOD-000 Foundation

> **Versao:** 1.4.0 | **Data:** 2026-03-23 | **Owner:** arquitetura
> **Estado atual do modulo:** READY (v1.0.0) | **Epico:** READY (v0.9.0) | **Features:** 17/17 READY
>
> Fases 0-4 concluidas. Modulo promovido a READY em 2026-03-23 (v1.0.0). Proximo passo: executar `/app-scaffold all` para criar estrutura de codigo, depois `/codegen docs/04_modules/mod-000-foundation/` para gerar codigo das 6 camadas.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-000 | READY (v0.9.0) | DoR completo, 17 features vinculadas |
| Features F01-F17 | 17/17 READY | Todas seladas — F01 (Auth), F02 (MFA), F03 (SSO), F04 (Forgot), F05 (Users), F06 (RBAC), F07 (Tenants), F08 (Profile), F09 (Tenant-User), F10 (Change-Pwd), F11 (GET /info), F12 (Scopes CRUD), F13 (Telemetria UI), F14 (Correlation E2E), F15 (CI Gates), F16 (Storage), F17 (Apple SSO) |
| Scaffold (forge-module) | CONCLUIDO | mod-000-foundation/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | Todos os 11 agentes executados, v0.10.0 atingida |
| Codegen (6 agentes) | NAO INICIADO | Scaffold apps/ inexistente. 0 arquivos de codigo gerados. Executar /app-scaffold + /codegen |
| PENDENTEs | 0 abertas | 12 total: 12/12 IMPLEMENTADA |
| ADRs | 4 aceitas (2 arquivos) | Nivel 2 requer minimo 3 — atendido (ADR-001/002/003 em ADR-001.md + ADR-004.md) |
| Amendments | 5 criados | DOC-PADRAO-005-C01, DOC-FND-000-M01, M02, M03, M04 (todos pre-READY) |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v1.0.0 | Ultima entrada 2026-03-23 (Etapa 5 pipeline — READY) |
| Screen Manifests | 5 proprios MOD-000 | ux-auth-001, ux-auth-003, ux-role-001, ux-tenant-001, ux-tenant-002 |
| Dependencias | 0 upstream | MOD-000 e raiz — camada topologica 0 (11 dependentes) |
| Bloqueios | 0 pendencias bloqueantes | BLK-001 (MOD-002 → amendment F05) resolvido. 0 pendencias ABERTA. |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-000 define a governanca de documentos normativos para o framework de geracao automatica de codigo. Com 17 features mapeadas cobrindo auth, RBAC, multi-tenant, SSO, MFA, storage, telemetria e CI gates, o epico foi promovido a READY em v0.9.0 com DoR completo.

```
1    (manual)              Revisar e finalizar epico US-MOD-000:             CONCLUIDO
                           - Escopo fechado (17 features)                   status_agil = READY
                           - Gherkin validado nos Criterios de Aceite       v0.9.0
                           - DoR completo (owner, dependencias, impacto)
                           - 14 documentos normativos cobertos como
                             fonte de verdade (DOC-DEV-001 a DOC-UX-012)
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-000.md

2    (manual)              Revisar e finalizar features F01-F17:             CONCLUIDO
                           - Gherkin detalhado validado                     17/17 READY
                           - nivel_arquitetura e wave_entrega confirmados
                           - manifests_vinculados preenchidos
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-000-F{01..17}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Primeiro modulo scaffoldado do sistema. Como Foundation, nao possui dependencias upstream — todos os demais modulos (MOD-001 a MOD-011) dependem dele.

```
3    /forge-module MOD-000  Scaffold completo gerado:                        CONCLUIDO
                           mod.md, CHANGELOG.md, requirements/              v0.1.0 (2026-03-15)
                           (br/, fr/, data/, int/, sec/, ux/, nfr/),
                           adr/, amendments/
                           Pasta: docs/04_modules/mod-000-foundation/
```

### Fase 2: Enriquecimento — CONCLUIDO

O enriquecimento do MOD-000 foi completo — todos os 11 agentes rodaram em 8 fases de execucao. Durante o processo, 7 pendencias (PENDENTE-001 a 007) foram identificadas, decididas e implementadas. O modulo atingiu v0.10.0.

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-000
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-000
> ```

```
4    /enrich docs/04_modules/mod-000-foundation/
                           11 agentes executados sobre mod-000:              CONCLUIDO
                           Fase exec 1: AGN-DEV-01 (MOD — Nivel 2)         v0.10.0 (2026-03-18)
                           Fase exec 2: AGN-DEV-02 (BR), AGN-DEV-03 (FR)
                           Fase exec 3: AGN-DEV-04 (DATA + eventos)
                           Fase exec 4: AGN-DEV-05 (INT), AGN-DEV-08 (NFR)
                           Fase exec 5: AGN-DEV-06 (SEC + EventMatrix)
                           Fase exec 6: AGN-DEV-07 (UX — manifests)
                           Fase exec 7: AGN-DEV-09 (ADR — 4 aceitas), AGN-DEV-10 (PEN — 7 implementadas)
                           Fase exec 8: AGN-DEV-11 (VAL — validacao cruzada)
```

#### Rastreio de Agentes — MOD-000

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod.md | CONCLUIDO | CHANGELOG v0.2.0-0.2.1 (2026-03-17) |
| 2 | AGN-DEV-02 | BR | BR-000.md | CONCLUIDO | 14 regras enriquecidas |
| 3 | AGN-DEV-03 | FR | FR-000.md | CONCLUIDO | 19 requisitos funcionais |
| 4 | AGN-DEV-04 | DATA | DATA-000.md, DATA-003.md | CONCLUIDO | 8 entidades, 34 domain events |
| 5 | AGN-DEV-05 | INT | INT-000.md | CONCLUIDO | 6 integracoes |
| 6 | AGN-DEV-06 | SEC | SEC-000.md, SEC-002.md | CONCLUIDO | CHANGELOG v0.8.0 (2026-03-18) — refresh rotation, SSO linking |
| 7 | AGN-DEV-07 | UX | UX-000.md | CONCLUIDO | 8 telas/jornadas mapeadas |
| 8 | AGN-DEV-08 | NFR | NFR-000.md | CONCLUIDO | SLOs, observabilidade, DR |
| 9 | AGN-DEV-09 | ADR | ADR-001.md, ADR-004.md | CONCLUIDO | 4 ADRs aceitas |
| 10 | AGN-DEV-10 | PEN | pen-000-pendente.md | CONCLUIDO | 7 pendencias (001-007) criadas e resolvidas |
| 11 | AGN-DEV-11 | VAL | validacao cruzada | CONCLUIDO | Findings geraram PENDENTE-005/006/007 |

#### Pendentes Resolvidas no Enriquecimento — Resumo

> 7 pendencias identificadas durante o enriquecimento (AGN-DEV-10/AGN-DEV-11), todas decididas e implementadas em 2026-03-18.

| # | ID | Sev. | Decisao | Artefato |
|---|---|---|---|---|
| 1 | PENDENTE-001 | ALTA | Opcao B — SSO linking com senha nativa | ADR-004, FR-000 v0.7.0 |
| 2 | PENDENTE-002 | ALTA | Opcao B — refresh token rotation | FR-000, SEC-000, DATA-003, SEC-002 |
| 3 | PENDENTE-003 | BAIXA | Opcao A — userId+tenantCode concatenado | DATA-000 v0.5.0 |
| 4 | PENDENTE-004 | MEDIA | Opcao C — limite anexos configuravel | DOC-PADRAO-005-C01 |
| 5 | PENDENTE-005 | MEDIA | Opcao A — 422 para token reset expirado | BR-000 v0.6.0 |
| 6 | PENDENTE-006 | — | Opcao A — migracao scopes 3-seg | SEC-000, SEC-002, DATA-000 |
| 7 | PENDENTE-007 | ALTA | Opcao A — scopes storage 3-seg | DOC-FND-000 v1.3.0 |

> Detalhes completos: requirements/pen-000-pendente.md

### Fase 3: Validacao — CONCLUIDA

O `/validate-all` foi executado em 2026-03-20 e identificou 5 pendencias (PENDENTE-008 a 012) no dominio UX (screen manifests). Todas foram resolvidas em 2026-03-22: manifests reescritos para schema v1, module corrigido, Screen IDs padronizados, 4 novos manifests criados. O `/validate-all` foi re-executado em 2026-03-22 com resultado PASS: 29/29 manifests validos, 5/5 manifests proprios MOD-000 aprovados. Fase 3 CONCLUIDA.

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
5    /validate-all docs/04_modules/mod-000-foundation/
                           Orquestra TODAS as validacoes em sequencia:        CONCLUIDO (2026-03-22)
                           Internamente executa:
                             1. /qa (lint, links, metadados, EX-*, §N, ciclos)
                             2. /validate-manifest (screen manifests vs schema v1)
                             3. /validate-openapi (contratos Spectral — se existirem)
                             4. /validate-drizzle (schemas Drizzle — se existirem)
                             5. /validate-endpoint (handlers Fastify — se existirem)
                           Skills 3-5 executadas condicionalmente:
                             FUTURO (pos-codigo) — artefatos inexistentes
                           Resultado: 29/29 manifests PASS, 0 violacoes
```

#### Pendentes da Fase 3 — Resolvidas (2026-03-22)

> 5 pendencias UX identificadas pelo `/validate-all`. Todas resolvidas em 2026-03-22.

| # | ID | Severidade | Decisao | Artefato |
|---|---|---|---|---|
| 1 | PENDENTE-008 | CRITICA | Opcao A — Reescrita schema v1 | ux-usr-001/002/003 v2.0.0 |
| 2 | PENDENTE-009 | ALTA | Opcao A — Corrigir MOD-001→MOD-000 | ux-auth-001 v1.1.0 |
| 3 | PENDENTE-010 | MEDIA | Opcao A — Padronizar UX-USR- | UX-000 v0.3.0 |
| 4 | PENDENTE-011 | MEDIA | Opcao A — Manter unificado + MFA | UX-000 v0.3.0, ux-auth-001 v1.1.0 |
| 5 | PENDENTE-012 | ALTA | Opcao A — Criar 4 manifests | ux-auth-003, ux-role-001, ux-tenant-001, ux-tenant-002 v1.0.0 |

> Detalhes completos: requirements/pen-000-pendente.md

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | `/qa` | SIM (todos) | SIM — CONCLUIDO | mod.md, requirements/*, adr/*, CHANGELOG.md |
| 2 | `/validate-manifest` | SIM (manifests existem) | SIM — CONCLUIDO | ux-auth-001, ux-auth-003, ux-role-001, ux-tenant-001, ux-tenant-002 (MOD-000) |
| 3 | `/validate-openapi` | SIM (Nivel 2) | NAO — FUTURO (pos-codigo) | apps/api/openapi/v1.yaml (nao existe) |
| 4 | `/validate-drizzle` | SIM (Nivel 2) | NAO — FUTURO (pos-codigo) | apps/api/src/modules/foundation/schema.ts (nao existe) |
| 5 | `/validate-endpoint` | SIM (Nivel 2) | NAO — FUTURO (pos-codigo) | apps/api/src/modules/foundation/routes/ (nao existe) |

### Fase 4: Promocao — CONCLUIDA

Modulo promovido a READY em 2026-03-23 (v1.0.0). Todos os criterios DoR atendidos. Manifesto selado, 9 requisitos promovidos, 4 ADRs aceitas, CHANGELOG atualizado para Etapa 5.

```
6    /promote-module docs/04_modules/mod-000-foundation/
                           Selar mod-000 como READY:                         CONCLUIDO (2026-03-23)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (12/12 IMPLEMENTADA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (10/10)
                             [DoR-3] Zero erros de lint? ................ SIM (validate-all PASS)
                             [DoR-4] Screen manifests validados? ........ SIM (5/5 manifests PASS)
                             [DoR-5] ADRs conforme nivel? ............... SIM (4 >= 3 para N2)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v1.0.0)
                             [DoR-7] Bloqueios cross-modulo? ............ SIM (0 bloqueios recebidos)

                           Resultado:
                             estado_item: DRAFT → READY
                             version: 0.10.0 → 1.0.0
                             CHANGELOG: Etapa 5 — Selo READY
                             INDEX.md: atualizado
```

### Fase 5: Geracao de Codigo — NAO INICIADA

MOD-000 esta READY (pre-requisito para codegen atendido). Porem o scaffold dos workspaces apps/ ainda nao existe — nenhum arquivo de codigo foi gerado. Como Nivel 2, o modulo requer todas as 6 camadas: DB, CORE, APP, API, WEB e VAL.

> **Decision tree de codegen:**
>
> ```
> Preciso gerar codigo para os modulos?
> ├── Scaffold existe? (apps/api/, apps/web/)
> │   └── NAO → /app-scaffold all (one-time, cria apps/api e apps/web)
> └── SIM → Qual escopo?
>     ├── Todos modulos READY (ordem topologica)  → /codegen-all (--dry-run para preview)
>     ├── Todos agentes de 1 modulo               → /codegen mod-000
>     └── 1 agente especifico                     → /codegen-agent mod-000 AGN-COD-XX
> ```

```
7    /app-scaffold all      Bootstrap dos workspaces monorepo:                A EXECUTAR (one-time)
                           Cria apps/api/ e apps/web/ com:
                             - package.json, tsconfig.json
                             - Estrutura de diretorios (src/modules/, db/, openapi/, test/)
                             - vite.config.ts (web)
                             - pnpm-workspace.yaml (se nao existir)
                           Pre-condicao: Nenhuma (gate detecta se ja existe)
                           Pos-condicao: Scaffold pronto para codegen

8    /codegen docs/04_modules/mod-000-foundation/
                           Gerar codigo para mod-000 (6 agentes):            A EXECUTAR (apos scaffold)
                           Fase 1: AGN-COD-DB   (infrastructure, migrations, schemas)
                           Fase 2: AGN-COD-CORE (domain — entidades, VOs, invariantes)
                           Fase 3: AGN-COD-APP  (application — use cases, eventos)
                           Fase 4: AGN-COD-API  (presentation — endpoints, OpenAPI)
                           Fase 5: AGN-COD-WEB  (frontend — UI, estados, consumo API)
                           Fase 6: AGN-COD-VAL  (validacao cruzada — read-only)
                           Pre-condicao: Scaffold existe, estado_item = READY
                           Pos-condicao: Codigo gerado em apps/api/ e apps/web/
```

> **Nota contexto:** Para modulos grandes ou complexos, considere executar em batches:
> - Batch 1: `AGN-COD-DB,AGN-COD-CORE` (infraestrutura + dominio)
> - Batch 2: `AGN-COD-APP,AGN-COD-API` (application + endpoints)
> - Batch 3: `AGN-COD-WEB,AGN-COD-VAL` (frontend + validacao)

#### Rastreio de Agentes COD — MOD-000

| # | Agente | Camada | Path | Status | Arquivos |
|---|--------|--------|------|--------|----------|
| 1 | AGN-COD-DB | infrastructure | apps/api/src/modules/foundation/infrastructure/, db/ | A EXECUTAR | 0 |
| 2 | AGN-COD-CORE | domain | apps/api/src/modules/foundation/domain/ | A EXECUTAR | 0 |
| 3 | AGN-COD-APP | application | apps/api/src/modules/foundation/application/ | A EXECUTAR | 0 |
| 4 | AGN-COD-API | presentation | apps/api/src/modules/foundation/presentation/, openapi/, test/ | A EXECUTAR | 0 |
| 5 | AGN-COD-WEB | web | apps/web/src/modules/foundation/ | A EXECUTAR | 0 |
| 6 | AGN-COD-VAL | validation | (read-only) | A EXECUTAR | 0 |

#### Pre-requisitos para Codegen

1. **Scaffold:** `apps/api/package.json` — NAO EXISTE → executar `/app-scaffold all`
2. **Scaffold:** `apps/web/package.json` — NAO EXISTE → executar `/app-scaffold all`
3. **Ordem topologica:** MOD-000 esta na camada 0 (sem dependencias) — pode ser gerado primeiro
4. **pnpm install:** Executar apos scaffold para instalar dependencias base

### Fase 6: Pos-READY (quando necessario)

```
9    /update-specification docs/04_modules/mod-000-foundation/requirements/fr/FR-000.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

10   /create-amendment FR-000 melhoria "adicionar endpoint restore"
                           Criar amendment formal:                           SOB DEMANDA
                           Ex: BR-000-M01.md (melhoria)
                           Ex: SEC-000-C01.md (correcao)
                           Preserva documento base intacto
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md

11   /merge-amendment docs/04_modules/mod-000-foundation/amendments/sec/DOC-FND-000-M04.md
                           Aplicar amendment no documento base:              SOB DEMANDA
                           Gate 1: Amendment APPROVED ou DRAFT (com confirmacao)
                           Gate 2: Documento base existe
                           Gate 3: Dependencias cross-modulo (DEPENDENCY-GRAPH.md §3)
                           Gate 4: Stale detection (versao do base mudou?)
                           Gate 5: Amendments concorrentes para mesmo base
                           Pos-condicao: Base bumped, amendment MERGED, CHANGELOG atualizado
```

#### Amendments Existentes

| Amendment | Natureza | Contexto | Criado |
|-----------|----------|----------|--------|
| DOC-PADRAO-005-C01 | Correcao | Limites de anexos configuraveis por entity_type — resolve PENDENTE-004 (max_attachments, CON-005, Gate STR-6) | 2026-03-18 (pre-READY) |
| DOC-FND-000-M01 | Melhoria | 6 scopes `process:case:*` registrados em DOC-FND-000 §2.2 para MOD-006 | 2026-03-19 (pre-READY) |
| DOC-FND-000-M02 | Melhoria | 7o scope `process:case:reopen` em DOC-FND-000 §2.2 — complementa M01 | 2026-03-19 (pre-READY) |
| DOC-FND-000-M03 | Melhoria | 7 scopes `approval:*` para MOD-009 (Movimentos sob Aprovacao) em DOC-FND-000 §2.2 | 2026-03-19 (pre-READY) |
| DOC-FND-000-M04 | Melhoria | 6 scopes `mcp:*` para MOD-010 (MCP e Automacao Governada) em DOC-FND-000 §2.2 | 2026-03-19 (pre-READY) |

> Todos os 5 amendments foram criados **antes** da promocao (pre-READY) — sao melhorias e correcoes integradas ao ciclo de enriquecimento. Nenhum amendment pos-READY existe ainda.

### Gestao de Pendencias (qualquer momento)

> **Decision tree de pendencias:**
>
> ```
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-000
> ├── Criar nova pendencia     → /manage-pendentes create PEN-000
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-000 PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-000 PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-000 PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-000 PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-000
> ```

```
12   /manage-pendentes list PEN-000
                           Ciclo de vida completo de pendencias:              SOB DEMANDA

                           Convencao de nomenclatura:
                             PEN-000       = arquivo container (pen-000-pendente.md)
                             PENDENTE-NNN  = item individual (## PENDENTE-001 — ...)

                           SLA de resolucao por severidade:
                             BLOQUEANTE = 7 dias  (impede promocao, escalar imediatamente)
                             ALTA       = 14 dias (escalar ao owner apos 7 dias sem progresso)
                             MEDIA      = 30 dias (revisar na proxima sessao de planejamento)
                             BAIXA      = 90 dias (pode ser adiada, reavaliar se relevante)

                           Ciclo de vida do item:
                             ABERTA → EM_ANALISE → DECIDIDA → IMPLEMENTADA
                               │         │            │
                               └─────────┴────────────┴── CANCELADA (com motivo)

                           Estado atual MOD-000:
                             PEN-000: 12 itens total
                               12 IMPLEMENTADA (001-012) ← DoR-1 atendido
                               0 ABERTA
                             Todas as pendencias resolvidas
```

#### Painel de Pendencias — Resumo Individual

| PENDENTE | Status | Sev. | Dominio | Decisao | Artefato de saida |
|----------|--------|------|---------|---------|-------------------|
| PENDENTE-001 | IMPLEMENTADA | ALTA | SEC | Opcao B — SSO linking com senha nativa | ADR-004, FR-000 v0.7.0 |
| PENDENTE-002 | IMPLEMENTADA | ALTA | SEC | Opcao B — refresh token rotation | FR-000, SEC-000, DATA-003, SEC-002 |
| PENDENTE-003 | IMPLEMENTADA | BAIXA | DATA | Opcao A — userId+tenantCode concatenado | DATA-000 v0.5.0 |
| PENDENTE-004 | IMPLEMENTADA | MEDIA | ARC | Opcao C — limite anexos configuravel | DOC-PADRAO-005-C01 |
| PENDENTE-005 | IMPLEMENTADA | MEDIA | ARC | Opcao A — 422 para token reset expirado | BR-000 v0.6.0 |
| PENDENTE-006 | IMPLEMENTADA | — | SEC/DATA | Opcao A — migracao scopes 3-seg | SEC-000, SEC-002, DATA-000 |
| PENDENTE-007 | IMPLEMENTADA | ALTA | SEC | Opcao A — scopes storage 3-seg | DOC-FND-000 v1.3.0 |
| PENDENTE-008 | IMPLEMENTADA | CRITICA | UX | Opcao A — manifests reescritos schema v1 | ux-usr-001/002/003 v2.0.0 |
| PENDENTE-009 | IMPLEMENTADA | ALTA | UX | Opcao A — module corrigido MOD-001→MOD-000 | ux-auth-001 atualizado |
| PENDENTE-010 | IMPLEMENTADA | MEDIA | UX | Opcao A — Screen IDs padronizados UX-USR | UX-000 atualizado |
| PENDENTE-011 | IMPLEMENTADA | MEDIA | UX | Opcao A — Login+Forgot unificados em UX-AUTH-001 | ux-auth-001 v1.0.0 |
| PENDENTE-012 | IMPLEMENTADA | ALTA | UX | Opcao A — 4 manifests criados | ux-auth-003, ux-role-001, ux-tenant-001, ux-tenant-002 |

> Detalhes completos: requirements/pen-000-pendente.md

### Utilitarios (qualquer momento)

```
13   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-000): <descricao>

14   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

15   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-000

```
US-MOD-000 (READY v0.9.0)              ← Fase 0: CONCLUIDA
  │  17/17 features READY
  ▼
mod-000-foundation/ (stubs DRAFT)       ← Fase 1: CONCLUIDA (forge-module v0.1.0)
  │
  ▼
mod-000 enriquecido (DRAFT v0.10.0)     ← Fase 2: CONCLUIDA (11 agentes, 7+5 PENDENTEs resolvidas)
  │
  ▼
mod-000 validado (DRAFT)                ← Fase 3: CONCLUIDA (validate-all PASS 29/29)
  │
  ▼
mod-000 selado (READY v1.0.0)           ← Fase 4: CONCLUIDA (promote-module 2026-03-23)
  │
  ├── ★ PROXIMO PASSO: /app-scaffold all → /codegen mod-000
  │
  ▼
mod-000 codigo gerado                   ← Fase 5: NAO INICIADA
  │  Scaffold apps/ inexistente
  │  0/6 agentes COD executados
  │  Nivel 2: DB → CORE → APP → API → WEB → VAL
  │
  ▼
mod-000 + amendments/                   ← Fase 6: SOB DEMANDA (5 amendments pre-READY existem)

MOD-000 e pre-requisito de TODOS os demais modulos.
Na ordem topologica, MOD-000 e camada 0 — deve ser o primeiro a ter codigo gerado.
```

---

## Particularidades do MOD-000

| Aspecto | Detalhe |
|---------|---------|
| Modulo raiz (Foundation) | Nenhuma dependencia upstream. Todos os 11 modulos (MOD-001 a MOD-011) dependem diretamente de MOD-000. Gerar codigo do MOD-000 primeiro e essencial para que os demais modulos possam referenciar tipos, schemas e guards compartilhados. |
| Nivel 2 — DDD-lite + Clean Completo | Score 6/6 nos gatilhos DOC-ESC-001 §4.2. Complexidade intrinseca alta: auth, RBAC multi-tenant, SSO, MFA, audit, domain events com sensitivity_level. Requer todas as 6 camadas de codegen (DB, CORE, APP, API, WEB, VAL). |
| Alto volume de amendments pre-READY | 5 amendments criados antes da promocao (DOC-FND-000-M01 a M04 + DOC-PADRAO-005-C01). Outros modulos (MOD-006, MOD-009, MOD-010) ja demandam extensoes no catalogo de scopes do Foundation. |
| Bloqueador de MOD-002 (BLK-001) | Resolvido — endpoint `users_invite_resend` adicionado em FR-006 (CHANGELOG v0.3.0). |
| Screen manifests com cobertura completa | 5 manifests YAML proprios: ux-auth-001 (login), ux-auth-003 (sessions), ux-role-001 (roles), ux-tenant-001 (tenants), ux-tenant-002 (tenant-users). |
| Primeiro modulo para codegen | Camada topologica 0 — MOD-000 deve ter codigo gerado antes de qualquer outro modulo. O codegen dos demais referenciarao tipos e contracts do Foundation. |

---

## Checklist Rapido — Codegen MOD-000

Modulo ja esta READY. Checklist de geracao de codigo:

- [ ] Executar `/app-scaffold all` — criar apps/api/ e apps/web/
- [ ] Executar `pnpm install` na raiz do monorepo
- [ ] Executar `/codegen docs/04_modules/mod-000-foundation/` — gerar codigo (6 agentes)
- [ ] Revisar arquivos gerados em apps/api/src/modules/foundation/
- [ ] Revisar arquivos gerados em apps/web/src/modules/foundation/
- [ ] Executar `/validate-all` pos-codigo (openapi, drizzle, endpoint)
- [ ] Executar `pnpm test` e `pnpm lint`

> **Nota:** MOD-000 e camada topologica 0 — gerar codigo aqui desbloqueia `/codegen-all` para os demais modulos. Apos codegen do MOD-000, os validadores que eram "FUTURO (pos-codigo)" passam a ser executaveis.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 1.4.0 | 2026-03-23 | Atualizacao: Fase 4 CONCLUIDA (promote-module 2026-03-23, v1.0.0 READY). Nova Fase 5: Geracao de Codigo — NAO INICIADA (scaffold inexistente, 0/6 agentes COD). Fase 5 renumerada para Fase 6 (Pos-READY). Decision tree de codegen adicionado. Checklist atualizado para foco em codegen. Pendentes inline convertidas para tabela-resumo compacta |
| 1.3.0 | 2026-03-22 | Atualizacao: PENDENTE-008 a 012 IMPLEMENTADAS. Fase 3 CONCLUIDA (validate-all re-executado: 29/29 manifests PASS). Screen Manifests agora 5 proprios MOD-000. Checklist 6/7 concluido — falta apenas /promote-module. Proximo passo: promocao |
| 1.2.0 | 2026-03-22 | Atualizacao: PENDENTE-012 adicionada (5 screen manifests YAML ausentes). PENDENTEs total agora 12 (7 IMPLEMENTADA, 5 ABERTA: 008-012). Screen Manifests corrigido para refletir 1 manifest proprio MOD-000 (ux-auth-001). Bloqueadores atualizados, checklist expandido |
| 1.1.0 | 2026-03-22 | Melhoria: detalhamento completo de TODAS as 11 pendencias inline — resolvidas (001-007) na Fase 2 e abertas (008-011) na Fase 3. Questao, opcoes com pros/contras, recomendacao, acao sugerida e resolucao para cada item |
