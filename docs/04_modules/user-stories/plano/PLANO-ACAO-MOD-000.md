# Procedimento — Plano de Acao MOD-000 Foundation

> **Versao:** 1.0.0 | **Data:** 2026-03-20 | **Owner:** arquitetura
> **Estado atual do modulo:** DRAFT (v0.10.0) | **Epico:** READY (v0.9.0) | **Features:** 17/17 READY
>
> Fases 0-2 ja executadas. Proximo passo: Fase 3 (Validacao).

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-000 | READY (v0.9.0) | DoR completo, 17 features vinculadas |
| Features F01-F17 | 17/17 READY | Todas seladas |
| Scaffold (forge-module) | CONCLUIDO | mod-000-foundation/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | Todos stubs preenchidos, v0.10.0 |
| PENDENTEs | 0 abertas | 7/7 IMPLEMENTADA |
| ADRs | 4 aceitas | Nivel 2 requer minimo 3 — atendido |
| Amendments | 5 criados | DOC-FND-000-M01..M04 + DOC-PADRAO-005-C01 |
| Requirements | 10/10 existem | BR, FR, DATA, DATA-003, SEC, SEC-002, INT, UX, NFR, PEN |
| CHANGELOG | v0.15.0 | Ultima entrada 2026-03-18 |
| Dependencias | 0 upstream | MOD-000 e raiz (11 dependentes) |
| Bloqueios | 0 | Nenhum BLK-* afeta MOD-000 |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

```
1    (manual)              Revisar e finalizar epico US-MOD-000:             CONCLUIDO
                           - Escopo fechado (17 features)                   status_agil = READY
                           - Gherkin validado nos Criterios de Aceite       v0.9.0
                           - DoR completo (owner, dependencias, impacto)
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-000.md

2    (manual)              Revisar e finalizar features F01-F17:             CONCLUIDO
                           - Gherkin detalhado validado                     17/17 READY
                           - nivel_arquitetura e wave_entrega confirmados
                           - manifests_vinculados preenchidos
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-000-F{01..17}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

```
3    /forge-module MOD-000  Scaffold completo gerado:                        CONCLUIDO
                           mod.md, CHANGELOG.md, requirements/              v0.1.0 (2026-03-15)
                           (br/, fr/, data/, int/, sec/, ux/, nfr/),
                           adr/, amendments/
                           Pasta: docs/04_modules/mod-000-foundation/
```

### Fase 2: Enriquecimento — CONCLUIDO
>
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

### Fase 3: Validacao — PENDENTE

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
                           Orquestra TODAS as validacoes em sequencia:        A EXECUTAR
                           Internamente executa:
                             1. /qa (lint, links, metadados, EX-*, §N, ciclos)
                             2. /validate-manifest (screen manifests vs schema v1)
                             3. /validate-openapi (contratos Spectral — se existirem)
                             4. /validate-drizzle (schemas Drizzle — se existirem)
                             5. /validate-endpoint (handlers Fastify — se existirem)
                           Skills 3-5 sao executadas condicionalmente: se os
                           artefatos de codigo ainda nao existem, /validate-all
                           pula o validador e reporta "N/A — artefato ausente".
                           Pre-condicao: Enriquecimento concluido
                           Pos-condicao: Relatorio consolidado pass/fail
```

> **Alternativa:** Executar validadores individuais quando quiser focar em um pilar:

```
5a   /qa docs/04_modules/mod-000-foundation/
                           Diagnostico de sintaxe e integridade:              INDIVIDUAL
                           - lint:docs (Pass A-E: EX-*, §N, IDs, context-map, ciclos)
                           - Consistencia de metadados (estado_item, owner)
                           - Dead links, DoR alignment

5b   /validate-manifest ux-auth-001.login.yaml
                           Validar manifests contra schema v1:               INDIVIDUAL
                           - ux-auth-001.login.yaml
                           - ux-auth-002.recuperacao-senha.yaml
                           - ux-usr-001.gestao-usuarios.yaml
                           - ux-dash-001.main.yaml (se existir)
                           Verifica: DOC-UX-010, operationId, RBAC,
                           telemetria, permissions vs DOC-FND-000 §2

5c   /validate-openapi apps/api/openapi/v1.yaml
                           Validar contratos OpenAPI referenciados:           INDIVIDUAL (pos-codigo)
                           - POST /auth/login, /auth/logout
                           - POST /auth/forgot-password, /auth/reset-password
                           - GET /auth/me, PATCH /auth/change-password
                           - GET /info
                           - CRUD /users, /roles, /tenants, /scopes
                           - POST /storage/presigned-url

5d   /validate-drizzle apps/api/src/modules/foundation/schema.ts
                           Validar schemas Drizzle:                          INDIVIDUAL (pos-codigo)
                           - users, sessions, roles, scopes, tenants,
                             tenant_users, mfa_secrets, oauth_accounts,
                             permissions, storage_objects
                           - Multitenancy, soft-delete, Zod, audit trail

5e   /validate-endpoint apps/api/src/modules/foundation/routes/auth.route.ts
                           Validar endpoints Fastify:                        INDIVIDUAL (pos-codigo)
                           - RBAC guards (requireScope)
                           - X-Correlation-ID propagado
                           - RFC 9457 Problem Details
                           - Alinhamento com OpenAPI
```

### Fase 4: Promocao — PENDENTE

```
10   /promote-module docs/04_modules/mod-000-foundation/
                           Selar mod-000 como READY:                         A EXECUTAR (apos fase 3)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (7/7 IMPLEMENTADA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (10/10)
                             [DoR-3] Zero erros de lint? ................ A VERIFICAR (passo 5)
                             [DoR-4] Screen manifests validados? ........ A VERIFICAR (passo 6)
                             [DoR-5] ADRs conforme nivel? ............... SIM (4 >= 3 para N2)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v0.15.0)
                             [DoR-7] Bloqueios cross-modulo? ............ SIM (0 bloqueios)

                           Fluxo interno:
                             Step 1: /qa (pre-check)
                             Step 2: Promover epico DRAFT→READY (ja READY)
                             Step 3: Promover features em lotes (ja READY)
                             Step 4: /qa (pos-check)
                             Step 5: /update-index
                             Step 6: /git commit
                           Pre-condicao: QA verde (passo 5), DoR-1..7 atendidos
                           Pos-condicao: estado_item = READY, INDEX.md atualizado, commit
```

### Fase 5: Pos-READY (quando necessario)

```
11   /update-specification docs/04_modules/mod-000-foundation/requirements/fr/FR-000.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

12   /create-amendment FR-000 melhoria "adicionar endpoint restore"
                           Criar amendment formal:                           SOB DEMANDA
                           Ex: BR-000-M01.md (melhoria)
                           Ex: SEC-000-C01.md (correcao)
                           Preserva documento base intacto
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md

13   /merge-amendment docs/04_modules/mod-000-foundation/amendments/sec/DOC-FND-000-M04.md
                           Aplicar amendment no documento base:              SOB DEMANDA
                           Gate 1: Amendment APPROVED ou DRAFT (com confirmacao)
                           Gate 2: Documento base existe
                           Gate 3: Dependencias cross-modulo (DEPENDENCY-GRAPH.md §3)
                           Gate 4: Stale detection (versao do base mudou?)
                           Gate 5: Amendments concorrentes para mesmo base
                           Pos-condicao: Base bumped, amendment MERGED, CHANGELOG atualizado

                           Amendments existentes (ja implementados):
                           - DOC-FND-000-M01 (6 scopes process:case:*)
                           - DOC-FND-000-M02 (scope process:case:reopen)
                           - DOC-FND-000-M03 (7 scopes approval/movement MOD-009)
                           - DOC-FND-000-M04 (6 scopes mcp:* MOD-010)
                           - DOC-PADRAO-005-C01 (limites de anexos configuraveis)
```

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
16   /manage-pendentes list PEN-000
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

                           Intencoes disponiveis:
                             list     — Exibe Painel de Controle com contagem por status
                             create   — Cria item com classificacao automatica (dominio, tipo, severidade)
                                        Gera minimo 2 opcoes com pros/contras e recomendacao
                             analyze  — Le artefatos em rastreia_para, busca ADRs similares,
                                        enriquece opcoes com trade-offs tecnicos
                             decide   — Registra decisao (opcao escolhida + justificativa)
                                        Move status para DECIDIDA
                             implement— Identifica mecanismo (edicao direta se DRAFT,
                                        /create-amendment se READY, ADR se decisao arquitetural)
                                        Move status para IMPLEMENTADA
                             cancel   — Registra motivo, move para CANCELADA
                             report   — Emite relatorio: total, por severidade, por dominio,
                                        conformidade de SLA (dentro/proximo/vencido)

                           Integracao com DoR (Gate 0 do /promote-module):
                             DoR-1 bloqueia promocao se houver itens ABERTA ou EM_ANALISE.
                             Todos devem estar IMPLEMENTADA, DECIDIDA ou CANCELADA.

                           Estado atual MOD-000:
                             PEN-000: 7 itens, todos IMPLEMENTADA (0 abertas)
                             SLA: nenhum vencido
```

### Utilitarios (qualquer momento)

```
14   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-000): <descricao>

15   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

17   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-000

```
US-MOD-000 (READY v0.9.0)              ← Fases 0: CONCLUIDA
  │
  ▼
mod-000-foundation/ (stubs DRAFT)       ← Fase 1: CONCLUIDA (forge-module)
  │
  ▼
mod-000 enriquecido (DRAFT v0.10.0)     ← Fase 2: CONCLUIDA (11 agentes, 7 PENDENTEs resolvidas)
  │
  ├── /validate-all .............. PROXIMO PASSO (orquestra /qa + /validate-manifest + demais)
  │     ├── /qa .................. sintaxe, links, metadados, Pass A-E
  │     ├── /validate-manifest ... screen manifests vs schema v1
  │     ├── /validate-openapi .... FUTURO (pos-codigo)
  │     ├── /validate-drizzle .... FUTURO (pos-codigo)
  │     └── /validate-endpoint ... FUTURO (pos-codigo)
  │
  ├── /manage-pendentes .......... SOB DEMANDA (ciclo: create → analyze → decide → implement)
  │     └── SLA: BLOQUEANTE 7d | ALTA 14d | MEDIA 30d | BAIXA 90d
  │
  ▼
mod-000 validado (DRAFT)                ← Fase 3: A EXECUTAR
  │
  ├── Gate 0 (DoR): 5/7 atendidos, 2 a verificar (lint + manifests)
  │
  ▼
mod-000 selado (READY)                  ← Fase 4: A EXECUTAR (apos fase 3)
  │
  ├── /create-amendment ← se precisar alterar base READY
  ├── /merge-amendment  ← para aplicar amendment aprovado (Gates 4-5: stale + conflitos)
  │
  ▼
mod-000 + amendments/                   ← Fase 5: SOB DEMANDA

MOD-000 e pre-requisito de TODOS os demais modulos.
Promover MOD-000 desbloqueia a cadeia MOD-001..011.
```

---

## Checklist Rapido — O que Falta para READY

- [ ] Executar `/validate-all` no modulo (passo 5) — orquestra /qa + /validate-manifest + demais
- [ ] Corrigir eventuais erros encontrados
- [ ] Executar `/promote-module docs/04_modules/mod-000-foundation/` (passo 10)
- [ ] Verificar que Gate 0 (DoR) passa nos 7 criterios

> **Alternativa:** Se preferir validar por partes, use `/qa` e `/validate-manifest` individualmente (passos 5a-5b).

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 1.0.0 | 2026-03-20 | Criacao: estado atual, fases 0-5, DoR Gate 0, merge-amendment, SLA, DEPENDENCY-GRAPH |
