# Procedimento — Plano de Acao MOD-002 Gestao de Usuarios

> **Versao:** 1.0.0 | **Data:** 2026-03-21 | **Owner:** arquitetura
> **Estado atual do modulo:** DRAFT (v0.4.0) | **Epico:** READY (v1.2.0) | **Features:** 3/3 READY
>
> Fases 0-2 ja executadas. Proximo passo: Fase 3 (Validacao).

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-002 | READY (v1.2.0) | DoR completo, 3 features vinculadas |
| Features F01-F03 | 3/3 READY | Todas seladas (v1.2.0) |
| Scaffold (forge-module) | CONCLUIDO | mod-002-gestao-usuarios/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | Todos stubs preenchidos, 4 batches executados |
| PENDENTEs | 0 abertas | 3/3 IMPLEMENTADA |
| ADRs | 3 criadas (DRAFT) | Nivel 1 requer minimo 1 — atendido |
| Amendments | 0 criados | Nenhum amendment necessario ate o momento |
| Requirements | 16/16 existem | BR(6), FR(3), DATA(2), INT(1), SEC(2), UX(1), NFR(1) |
| CHANGELOG | v0.10.0 (PEN) / v0.4.0 (MOD) | Ultima entrada 2026-03-18 (PEN) / 2026-03-17 (MOD) |
| Screen Manifests | 3/3 existem | UX-USR-001, UX-USR-002, UX-USR-003 |
| Dependencias | 1 upstream (MOD-000) | Consome Users API (F05), Roles API (F06), Auth, Scopes |
| Bloqueios | 1 (BLK-001) | Amendment `users_invite_resend` no MOD-000 — PENDENTE-001 ja IMPLEMENTADA |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

```
1    (manual)              Revisar e finalizar epico US-MOD-002:             CONCLUIDO
                           - Escopo fechado (3 features UX-First)           status_agil = READY
                           - Gherkin validado nos Criterios de Aceite       v1.2.0
                           - DoR completo (owner, dependencias, impacto)
                           - Separacao MOD-002 (UX) vs MOD-000-F05 (API)
                           - Screen Manifests vinculados (3 YAML schema v1)
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-002.md

2    (manual)              Revisar e finalizar features F01-F03:             CONCLUIDO
                           - Gherkin detalhado validado                     3/3 READY
                           - nivel_arquitetura e wave_entrega confirmados
                           - manifests_vinculados preenchidos
                           - Scopes alinhados DOC-FND-000 §2.2
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-002-F{01..03}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

```
3    /forge-module MOD-002  Scaffold completo gerado:                        CONCLUIDO
                           mod.md, CHANGELOG.md, requirements/              v0.1.0 (2026-03-17)
                           (br/, fr/, data/, int/, sec/, ux/, nfr/),
                           adr/, amendments/
                           Stubs obrigatorios criados: DATA-003, SEC-002
                           Modulo UX-First: consome MOD-000-F05/F06
                           Pasta: docs/04_modules/mod-002-gestao-usuarios/
```

### Fase 2: Enriquecimento — CONCLUIDO
>
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
                           11 agentes executados sobre mod-002:              CONCLUIDO
                           Batch 1: AGN-DEV-01 (MOD — Nivel 1, score 2/6)  v0.4.0 (2026-03-17)
                                    AGN-DEV-02 (BR — 6 regras criadas)
                                    AGN-DEV-03 (FR — 3 specs enriquecidas)
                           Batch 2: AGN-DEV-04 (DATA — modelo consumido + eventos)
                                    AGN-DEV-05 (INT — RFC 9457, cache, CORS)
                                    AGN-DEV-08 (NFR — testabilidade, resiliencia)
                           Batch 3: AGN-DEV-06 (SEC — transport, threat model)
                                    AGN-DEV-07 (UX — error recovery, telemetria)
                           Batch 4: AGN-DEV-09 (ADR — 3 criadas)
                                    AGN-DEV-10 (PEN — 3 pendencias criadas)
                                    AGN-DEV-11 (VAL — migracao formato enriquecido)

                           PENDENTEs resolvidas durante/apos enriquecimento:
                           - PENDENTE-001: Amendment users_invite_resend no MOD-000
                             → Opcao A (IMPLEMENTADA — endpoint adicionado em FR-000 §FR-006)
                           - PENDENTE-002: Cooldown cross-tab anti-spam
                             → Opcao A (IMPLEMENTADA — known limitation v1 em BR-004)
                           - PENDENTE-003: Estrutura de copy centralizada (domain/copy.ts)
                             → Opcao A (IMPLEMENTADA — ADR-002 v0.2.0 atualizada)
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
5    /validate-all docs/04_modules/mod-002-gestao-usuarios/
                           Orquestra TODAS as validacoes em sequencia:        A EXECUTAR
                           Internamente executa:
                             1. /qa (lint, links, metadados, EX-*, §N, ciclos)
                             2. /validate-manifest (screen manifests vs schema v1)
                             3. /validate-openapi (contratos Spectral — N/A para UX-First)
                             4. /validate-drizzle (schemas Drizzle — N/A para UX-First)
                             5. /validate-endpoint (handlers Fastify — N/A para UX-First)
                           Skills 3-5 serao N/A: MOD-002 e UX-First sem backend proprio.
                           Apenas /qa e /validate-manifest sao aplicaveis.
                           Pre-condicao: Enriquecimento concluido
                           Pos-condicao: Relatorio consolidado pass/fail
```

> **Alternativa:** Executar validadores individuais quando quiser focar em um pilar:

```
5a   /qa docs/04_modules/mod-002-gestao-usuarios/
                           Diagnostico de sintaxe e integridade:              INDIVIDUAL
                           - lint:docs (Pass A-E: EX-*, §N, IDs, context-map, ciclos)
                           - Consistencia de metadados (estado_item, owner)
                           - Dead links, DoR alignment
                           - Verificar rastreia_para entre mod.md ↔ features ↔ manifests
                           - Verificar operationIds consumidos vs MOD-000

5b   /validate-manifest ux-usr-001.users-list.yaml
                           Validar manifests contra schema v1:               INDIVIDUAL
                           - ux-usr-001.users-list.yaml (listagem, /usuarios)
                           - ux-usr-002.user-form.yaml (formulario, /usuarios/novo)
                           - ux-usr-003.user-invite.yaml (convite, /usuarios/:id/convite)
                           Verifica: DOC-UX-010, operationId, RBAC,
                           telemetria, permissions (users:user:read/write/delete),
                           linked_stories referenciando US-MOD-002,
                           PII-Safe pattern (ADR-002), loading states

5c   /validate-openapi     N/A — MOD-002 nao possui backend proprio.         N/A
                           Endpoints consumidos pertencem ao MOD-000-F05/F06.
                           Validar paridade operationId ↔ manifest via /qa.

5d   /validate-drizzle     N/A — MOD-002 e UX-First (Nivel 1),              N/A
                           sem entidades de banco proprio.
                           Modelo de dados e consumidor do MOD-000.

5e   /validate-endpoint    N/A — MOD-002 nao possui handlers Fastify.        N/A
                           Frontend-only, consome API do MOD-000-F05/F06.
```

### Fase 4: Promocao — PENDENTE

```
10   /promote-module docs/04_modules/mod-002-gestao-usuarios/
                           Selar mod-002 como READY:                         A EXECUTAR (apos fase 3)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (3/3 IMPLEMENTADA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (16/16)
                             [DoR-3] Zero erros de lint? ................ A VERIFICAR (passo 5)
                             [DoR-4] Screen manifests validados? ........ A VERIFICAR (passo 5b)
                             [DoR-5] ADRs conforme nivel? ............... SIM (3 >= 1 para N1)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v0.10.0 PEN)
                             [DoR-7] Bloqueios cross-modulo? ............ ATENCAO (BLK-001 — ver Particularidades)

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
11   /update-specification docs/04_modules/mod-002-gestao-usuarios/requirements/fr/FR-001.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

12   /create-amendment FR-001 melhoria "adicionar campo X"
                           Criar amendment formal:                           SOB DEMANDA
                           Ex: BR-001-M01.md (melhoria)
                           Ex: SEC-001-C01.md (correcao)
                           Preserva documento base intacto
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md

13   /merge-amendment docs/04_modules/mod-002-gestao-usuarios/amendments/...
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
                           Ciclo de vida completo de pendencias:              SOB DEMANDA

                           Convencao de nomenclatura:
                             PEN-002       = arquivo container (pen-002-pendente.md)
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

                           Estado atual MOD-002:
                             PEN-002: 3 itens, todos IMPLEMENTADA (0 abertas)
                             SLA: nenhum vencido
```

### Utilitarios (qualquer momento)

```
14   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-002): <descricao>

15   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

17   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-002

```
US-MOD-002 (READY v1.2.0)              ← Fase 0: CONCLUIDA
  │  3 features READY (F01, F02, F03)
  │  3 screen manifests (UX-USR-001, UX-USR-002, UX-USR-003)
  │  6 operationIds consumidos do MOD-000
  │
  ▼
mod-002-gestao-usuarios/ (stubs DRAFT) ← Fase 1: CONCLUIDA (forge-module)
  │
  ▼
mod-002 enriquecido (DRAFT v0.4.0)     ← Fase 2: CONCLUIDA (11 agentes, 3 PENDENTEs resolvidas)
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
mod-002 validado (DRAFT)                ← Fase 3: A EXECUTAR
  │
  ├── Gate 0 (DoR): 5/7 atendidos, 2 a verificar (lint + manifests)
  ├── ATENCAO: BLK-001 — verificar se amendment users_invite_resend
  │   foi aplicado no MOD-000 antes de promover
  │
  ▼
mod-002 selado (READY)                  ← Fase 4: A EXECUTAR (apos fase 3)
  │
  ├── /create-amendment ← se precisar alterar base READY
  ├── /merge-amendment  ← para aplicar amendment aprovado (Gates 4-5: stale + conflitos)
  │
  ▼
mod-002 + amendments/                   ← Fase 5: SOB DEMANDA

MOD-002 depende de MOD-000 (Foundation).
MOD-002 e modulo folha (sem dependentes downstream).
Camada topologica: 1 (pode ser promovido apos MOD-000 estar READY).
```

---

## Particularidades do MOD-002

| Aspecto | Detalhe |
|---------|---------|
| Natureza UX-First | Modulo exclusivamente frontend — sem endpoints, DB ou handlers proprios. Consome 6 operationIds do MOD-000-F05/F06 |
| Modulo folha | Nenhum outro modulo depende do MOD-002 — promocao nao desbloqueia cadeia |
| BLK-001 (bloqueio) | Amendment `users_invite_resend` precisa existir no MOD-000-F05. PENDENTE-001 ja foi IMPLEMENTADA (endpoint adicionado em FR-000 §FR-006 DRAFT), mas o BLK-001 no DEPENDENCY-GRAPH.md ainda consta como PENDENTE. Verificar antes de promover |
| LGPD/PII-Safe | ADR-002 impoe PII-Safe UI Pattern — e-mail nunca exposto em toasts/modais. Copy centralizada em `domain/copy.ts` (PENDENTE-003 resolvida) |
| Cooldown anti-spam | BR-004 define cooldown 60s client-side. Known limitation v1: nao sincroniza cross-tab (PENDENTE-002 resolvida — aceito para backoffice interno) |
| Idempotencia frontend | ADR-003 define `Idempotency-Key` header em POST /users e POST /invite/resend |
| Alto volume de BR | 6 regras de negocio (vs 1 tipico para N1) — reflete complexidade de apresentacao (scopes, modos, cooldown, erros inline, PII) |

---

## Checklist Rapido — O que Falta para READY

- [ ] Verificar se BLK-001 foi resolvido (amendment `users_invite_resend` aplicado no MOD-000)
- [ ] Executar `/validate-all` no modulo (passo 5) — orquestra /qa + /validate-manifest
- [ ] Corrigir eventuais erros encontrados
- [ ] Executar `/promote-module docs/04_modules/mod-002-gestao-usuarios/` (passo 10)
- [ ] Verificar que Gate 0 (DoR) passa nos 7 criterios

> **Alternativa:** Se preferir validar por partes, use `/qa` e `/validate-manifest` individualmente (passos 5a-5b).

> **Nota:** MOD-002 so pode ser promovido apos MOD-000 estar READY (dependencia upstream). Adicionalmente, BLK-001 requer que o amendment `users_invite_resend` esteja implementado no MOD-000-F05.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 1.0.0 | 2026-03-21 | Criacao: estado atual, fases 0-5, DoR Gate 0, particularidades (BLK-001, LGPD, cooldown, idempotencia) |
