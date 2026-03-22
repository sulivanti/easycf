# Procedimento — Plano de Acao MOD-001 Backoffice Admin

> **Versao:** 1.0.0 | **Data:** 2026-03-21 | **Owner:** arquitetura
> **Estado atual do modulo:** DRAFT (v0.10.0) | **Epico:** READY (v0.5.0) | **Features:** 3/3 READY
>
> Fases 0-2 ja executadas. Proximo passo: Fase 3 (Validacao).

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-001 | READY (v0.5.0) | DoR completo, 3 features vinculadas |
| Features F01-F03 | 3/3 READY | Todas seladas |
| Scaffold (forge-module) | CONCLUIDO | mod-001-backoffice-admin/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | Todos stubs preenchidos, v0.10.0 |
| PENDENTEs | 0 abertas | 4/4 IMPLEMENTADA |
| ADRs | 3 criadas (DRAFT) | Nivel 1 requer minimo 1 — atendido |
| Amendments | 0 criados | Nenhum amendment necessario ate o momento |
| Requirements | 11/11 existem | BR, FR, FR-007, DATA, DATA-003, INT, INT-006, SEC, SEC-002, UX, NFR |
| CHANGELOG | v0.12.0 (PEN) / v0.10.0 (MOD) | Ultima entrada 2026-03-18 (PEN) / 2026-03-17 (MOD) |
| Screen Manifests | 3/3 existem | UX-AUTH-001, UX-SHELL-001, UX-DASH-001 (schema v1) |
| Dependencias | 1 upstream (MOD-000) | MOD-001 consome auth endpoints do Foundation |
| Bloqueios | 0 | Nenhum BLK-* afeta MOD-001 |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

```
1    (manual)              Revisar e finalizar epico US-MOD-001:             CONCLUIDO
                           - Escopo fechado (3 features)                   status_agil = READY
                           - Gherkin validado nos Criterios de Aceite       v0.5.0
                           - DoR completo (owner, dependencias, impacto)
                           - Screen Manifests vinculados (3 YAML schema v1)
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-001.md

2    (manual)              Revisar e finalizar features F01-F03:             CONCLUIDO
                           - Gherkin detalhado validado                     3/3 READY
                           - nivel_arquitetura e wave_entrega confirmados
                           - manifests_vinculados preenchidos
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-001-F{01..03}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

```
3    /forge-module MOD-001  Scaffold completo gerado:                        CONCLUIDO
                           mod.md, CHANGELOG.md, requirements/              v0.1.0 (2026-03-16)
                           (br/, fr/, data/, int/, sec/, ux/, nfr/),
                           adr/, amendments/
                           Stubs obrigatorios criados: DATA-003, SEC-002
                           Pasta: docs/04_modules/mod-001-backoffice-admin/
```

### Fase 2: Enriquecimento — CONCLUIDO
>
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
                           11 agentes executados sobre mod-001:              CONCLUIDO
                           Fase exec 1: AGN-DEV-01 (MOD — Nivel 1)         v0.10.0 (2026-03-17)
                           Fase exec 2: AGN-DEV-02 (BR)
                           Fase exec 3: AGN-DEV-03 (FR)
                           Fase exec 4: AGN-DEV-04 (DATA + eventos)
                           Fase exec 5: AGN-DEV-05 (INT), AGN-DEV-08 (NFR)
                           Fase exec 6: AGN-DEV-06 (SEC + EventMatrix)
                           Fase exec 7: AGN-DEV-07 (UX — manifests)
                           Fase exec 8: AGN-DEV-09 (ADR — 3 criadas), AGN-DEV-10 (PEN — 4 implementadas)
                           Fase exec 9: AGN-DEV-11 (VAL — validacao cruzada)

                           PENDENTEs resolvidas durante enriquecimento:
                           - PENDENTE-001: Cache auth_me → Opcao C (React Query 30s TTL)
                           - PENDENTE-002: Empty State Sidebar → Opcao B (mensagem "Nenhum modulo")
                           - PENDENTE-003: Alterar Senha no ProfileWidget → Opcao A (FR-007 + INT-006)
                           - PENDENTE-004: Tela MFA → Opcao B (roadmap, fallback defensivo)

                           Artefatos criados durante resolucao de PENDENTEs:
                           - FR-007 v0.1.0 (Alteracao de Senha via ProfileWidget)
                           - INT-006 v0.1.0 (POST /auth/change-password)
                           - DATA-003 v0.5.0 (UIActionEnvelope submit_change_password)
                           - FR-001 v0.7.0 (fallback defensivo MFA redirect)
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
5    /validate-all docs/04_modules/mod-001-backoffice-admin/
                           Orquestra TODAS as validacoes em sequencia:        A EXECUTAR
                           Internamente executa:
                             1. /qa (lint, links, metadados, EX-*, §N, ciclos)
                             2. /validate-manifest (screen manifests vs schema v1)
                             3. /validate-openapi (contratos Spectral — se existirem)
                             4. /validate-drizzle (schemas Drizzle — N/A para Nivel 1 UX-First)
                             5. /validate-endpoint (handlers Fastify — N/A para Nivel 1 UX-First)
                           Skills 3-5 serao N/A: MOD-001 e UX-First sem backend proprio.
                           Apenas /qa e /validate-manifest sao aplicaveis.
                           Pre-condicao: Enriquecimento concluido
                           Pos-condicao: Relatorio consolidado pass/fail
```

> **Alternativa:** Executar validadores individuais quando quiser focar em um pilar:

```
5a   /qa docs/04_modules/mod-001-backoffice-admin/
                           Diagnostico de sintaxe e integridade:              INDIVIDUAL
                           - lint:docs (Pass A-E: EX-*, §N, IDs, context-map, ciclos)
                           - Consistencia de metadados (estado_item, owner)
                           - Dead links, DoR alignment
                           - Verificar rastreia_para entre mod.md ↔ features ↔ manifests

5b   /validate-manifest ux-auth-001.login.yaml
                           Validar manifests contra schema v1:               INDIVIDUAL
                           - ux-auth-001.login.yaml (auth, /login, pre_auth=true)
                           - ux-shell-001.app-shell.yaml (shell, /*, post_auth)
                           - ux-dash-001.main.yaml (dashboard, /dashboard, post_auth)
                           Verifica: DOC-UX-010, operationId, RBAC,
                           telemetria (include_tenant_id pre/pos), permissions,
                           linked_stories referenciando US-MOD-001

5c   /validate-openapi     N/A — MOD-001 nao possui backend proprio.         N/A
                           Endpoints consumidos pertencem ao MOD-000.
                           Validar paridade operationId ↔ manifest via /qa.

5d   /validate-drizzle     N/A — MOD-001 e UX-First (Nivel 1),              N/A
                           sem entidades de banco proprio.
                           Modelo de dados e consumidor do MOD-000.

5e   /validate-endpoint    N/A — MOD-001 nao possui handlers Fastify.        N/A
                           Frontend-only, consome API do MOD-000.
```

### Fase 4: Promocao — PENDENTE

```
10   /promote-module docs/04_modules/mod-001-backoffice-admin/
                           Selar mod-001 como READY:                         A EXECUTAR (apos fase 3)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (4/4 IMPLEMENTADA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (11/11)
                             [DoR-3] Zero erros de lint? ................ A VERIFICAR (passo 5)
                             [DoR-4] Screen manifests validados? ........ A VERIFICAR (passo 5b)
                             [DoR-5] ADRs conforme nivel? ............... SIM (3 >= 1 para N1)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v0.12.0 PEN)
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
11   /update-specification docs/04_modules/mod-001-backoffice-admin/requirements/fr/FR-001.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

12   /create-amendment FR-001 melhoria "adicionar campo X"
                           Criar amendment formal:                           SOB DEMANDA
                           Ex: BR-001-M01.md (melhoria)
                           Ex: SEC-001-C01.md (correcao)
                           Preserva documento base intacto
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md

13   /merge-amendment docs/04_modules/mod-001-backoffice-admin/amendments/...
                           Aplicar amendment no documento base:              SOB DEMANDA
                           Gate 1: Amendment APPROVED ou DRAFT (com confirmacao)
                           Gate 2: Documento base existe
                           Gate 3: Dependencias cross-modulo (DEPENDENCY-GRAPH.md §3)
                           Gate 4: Stale detection (versao do base mudou?)
                           Gate 5: Amendments concorrentes para mesmo base
                           Pos-condicao: Base bumped, amendment MERGED, CHANGELOG atualizado

                           Amendments existentes: nenhum (modulo ainda DRAFT)
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
                           Ciclo de vida completo de pendencias:              SOB DEMANDA

                           Convencao de nomenclatura:
                             PEN-001       = arquivo container (pen-001-pendente.md)
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

                           Estado atual MOD-001:
                             PEN-001: 4 itens, todos IMPLEMENTADA (0 abertas)
                             SLA: nenhum vencido
```

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
US-MOD-001 (READY v0.5.0)              ← Fases 0: CONCLUIDA
  │  3 features READY (F01, F02, F03)
  │  3 screen manifests (UX-AUTH-001, UX-SHELL-001, UX-DASH-001)
  │
  ▼
mod-001-backoffice-admin/ (stubs DRAFT) ← Fase 1: CONCLUIDA (forge-module)
  │
  ▼
mod-001 enriquecido (DRAFT v0.10.0)     ← Fase 2: CONCLUIDA (11 agentes, 4 PENDENTEs resolvidas)
  │
  ├── /validate-all .............. PROXIMO PASSO (orquestra /qa + /validate-manifest)
  │     ├── /qa .................. sintaxe, links, metadados, Pass A-E
  │     ├── /validate-manifest ... screen manifests vs schema v1 (3 manifests)
  │     ├── /validate-openapi .... N/A (sem backend proprio)
  │     ├── /validate-drizzle .... N/A (sem entidades de banco)
  │     └── /validate-endpoint ... N/A (sem handlers Fastify)
  │
  ├── /manage-pendentes .......... SOB DEMANDA (ciclo: create → analyze → decide → implement)
  │     └── SLA: BLOQUEANTE 7d | ALTA 14d | MEDIA 30d | BAIXA 90d
  │
  ▼
mod-001 validado (DRAFT)                ← Fase 3: A EXECUTAR
  │
  ├── Gate 0 (DoR): 5/7 atendidos, 2 a verificar (lint + manifests)
  │
  ▼
mod-001 selado (READY)                  ← Fase 4: A EXECUTAR (apos fase 3)
  │
  ├── /create-amendment ← se precisar alterar base READY
  ├── /merge-amendment  ← para aplicar amendment aprovado (Gates 4-5: stale + conflitos)
  │
  ▼
mod-001 + amendments/                   ← Fase 5: SOB DEMANDA

MOD-001 depende de MOD-000 (Foundation).
MOD-001 e pre-requisito do Application Shell usado por MOD-002+.
Camada topologica: 1 (pode ser promovido apos MOD-000 estar READY).
```

---

## Particularidades do MOD-001 vs MOD-000

| Aspecto | MOD-000 (Foundation) | MOD-001 (Backoffice Admin) |
|---------|---------------------|---------------------------|
| Nivel | 2 — Clean Padrao | 1 — Clean Leve |
| Natureza | Backend (API, DB, RBAC) | UX-First (Shell frontend) |
| Entidades DB | users, sessions, roles, etc. | Nenhuma (consome MOD-000) |
| Endpoints API | 15+ (auth, users, roles, etc.) | Nenhum (consome MOD-000) |
| Screen Manifests | 4 manifests | 3 manifests (auth, shell, dash) |
| Features | 17 | 3 |
| PENDENTEs | 7 | 4 |
| ADRs requeridas | >= 3 (Nivel 2) | >= 1 (Nivel 1) |
| Validadores aplicaveis | /qa, /validate-manifest, /validate-openapi, /validate-drizzle, /validate-endpoint | /qa, /validate-manifest (demais N/A) |
| Amendments | 5 criados | 0 |

---

## Checklist Rapido — O que Falta para READY

- [ ] Executar `/validate-all` no modulo (passo 5) — orquestra /qa + /validate-manifest
- [ ] Corrigir eventuais erros encontrados
- [ ] Executar `/promote-module docs/04_modules/mod-001-backoffice-admin/` (passo 10)
- [ ] Verificar que Gate 0 (DoR) passa nos 7 criterios

> **Alternativa:** Se preferir validar por partes, use `/qa` e `/validate-manifest` individualmente (passos 5a-5b).

> **Nota:** MOD-001 so pode ser promovido apos MOD-000 estar READY (dependencia upstream).

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 1.0.0 | 2026-03-21 | Criacao: estado atual, fases 0-5, DoR Gate 0, particularidades N1 vs N2, DEPENDENCY-GRAPH |
