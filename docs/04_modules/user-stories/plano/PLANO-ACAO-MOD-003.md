# Procedimento — Plano de Acao MOD-003 Estrutura Organizacional

> **Versao:** 1.2.0 | **Data:** 2026-03-21 | **Owner:** Marcos Sulivan
> **Estado atual do modulo:** DRAFT (v0.3.0) | **Epico:** READY (v1.1.0) | **Features:** 3/4 READY
>
> Fases 0-1 concluidas. Fase 2 em andamento (9/11 agentes, F04 TODO). Proximo passo: completar enriquecimento restante e promover F04 para READY, depois executar validacao completa.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-003 | READY (v1.1.0) | DoR completo, 4 features vinculadas (F01-F04) |
| Features F01-F04 | 3/4 READY | F01 READY, F02 READY, F03 READY, F04 TODO (Restore — adicionada pos-scaffold via amendment) |
| Scaffold (forge-module) | CONCLUIDO | mod-003-estrutura-organizacional/ com estrutura completa |
| Enriquecimento (11 agentes) | EM ANDAMENTO | 9 agentes concluidos (AGN-DEV-02 a -10). AGN-DEV-01 e -11 sem evidencia explicita |
| PENDENTEs | 0 abertas | 6/6 resolvidas (3 IMPLEMENTADA + 3 RESOLVIDA) |
| ADRs | 4 criadas (DRAFT) | Nivel 2 requer minimo 3 — atendido |
| Amendments | 3 criados | FR-001-C01, US-MOD-003-M01, US-MOD-003-F01-M01 (todos pre-READY) |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v0.2.1 | Ultima entrada 2026-03-18. Pipeline Etapa 4 (Enriquecimento) |
| Screen Manifests | 2/2 existem | UX-ORG-001 (org-tree), UX-ORG-002 (org-form) |
| Dependencias | 1 upstream (MOD-000) | Consome tenants (F07), catalogo de escopos (F12), auth, domain_events |
| Bloqueios | 0 | Nenhum BLK-* afeta MOD-003 |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

Epico US-MOD-003 criado e aprovado como READY (v1.1.0). Define hierarquia organizacional
formal de 5 niveis (N1-N5) como referencia de pertencimento para todas as entidades de negocio.

```
1    (manual)              Revisar e finalizar epico US-MOD-003:             CONCLUIDO
                           - Escopo fechado (4 features)                    status_agil = READY
                           - F04 (Restore) adicionada pos-scaffold via      v1.1.0
                             amendment US-MOD-003-M01 (2026-03-17)
                           - Gherkin validado nos Criterios de Aceite
                           - DoR completo (owner, dependencias, impacto)
                           - Hierarquia 5 niveis (N1-N5) formalizada
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-003.md

2    (manual)              Revisar e finalizar features F01-F04:             PARCIAL
                           - F01 (API Core CRUD + Tree + N5) .... READY     3/4 READY
                           - F02 (Arvore UX-ORG-001) ........... READY
                           - F03 (Formulario UX-ORG-002) ....... READY
                           - F04 (Restore soft-deleted) ........ TODO
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-003-F{01..04}.md
```

> **Nota sobre F04:** A feature de Restore foi adicionada **depois** do scaffold e do primeiro ciclo de enriquecimento, via amendment US-MOD-003-M01. Seu status TODO nao impede o progresso das demais fases de especificacao, mas precisa ser promovida para READY antes da promocao do modulo. O endpoint `PATCH /org-units/:id/restore` ja esta documentado em FR-001, o domain event `org.unit_restored` ja consta em DATA-003 (via amendment US-MOD-003-F01-M01), e o comportamento UX (toggle inativos + menu contextual) esta descrito em UX-001.

### Fase 1: Genese do Modulo — CONCLUIDA

Primeiro modulo full-stack (backend + frontend) apos o Foundation. Scaffold gerado em 2026-03-16.

```
3    /forge-module MOD-003  Scaffold completo gerado:                        CONCLUIDO
                           mod.md, CHANGELOG.md, requirements/              v0.1.0 (2026-03-16)
                           (br/, fr/, data/, int/, sec/, ux/, nfr/),
                           adr/, amendments/
                           Stubs obrigatorios criados: DATA-003, SEC-002
                           Pasta: docs/04_modules/mod-003-estrutura-organizacional/
```

### Fase 2: Enriquecimento — EM ANDAMENTO

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-003
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-003
> ```

#### Rastreio de Agentes Executados

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod.md | SEM EVIDENCIA | mod.md v0.3.0 — sem header de agente. Pode ter executado sem deixar rastro explicito |
| 2 | AGN-DEV-02 | BR | BR-001 | CONCLUIDO | v0.2.0 (2026-03-17) — BR-010, BR-011, BR-012 adicionadas |
| 3 | AGN-DEV-03 | FR | FR-001 | CONCLUIDO | v0.2.0 (2026-03-17) — FR-005 criado, Gherkin expandido |
| 4 | AGN-DEV-04 | DATA | DATA-001, DATA-003 | CONCLUIDO | v0.2.0 (2026-03-17) — migracao, outbox/dedupe |
| 5 | AGN-DEV-05 | INT | INT-001 | CONCLUIDO | v0.2.0 (2026-03-17) — contratos, failure behavior |
| 6 | AGN-DEV-06 | SEC | SEC-001, SEC-002 | CONCLUIDO | v0.2.0 (2026-03-17) — scope mapping, auth matrix |
| 7 | AGN-DEV-07 | UX | UX-001 | CONCLUIDO | v0.2.0 (2026-03-17) — copy catalog, telemetria |
| 8 | AGN-DEV-08 | NFR | NFR-001 | CONCLUIDO | v0.2.0 (2026-03-17) — topologia, paginacao |
| 9 | AGN-DEV-09 | ADR | ADR-001..004 | CONCLUIDO | v0.2.0 (2026-03-17) — rastreabilidade expandida |
| 10 | AGN-DEV-10 | PEN | PEN-003 | CONCLUIDO | v0.2.0 (2026-03-17) — PENDENTE-006 criada |
| 11 | AGN-DEV-11 | VAL | (consolidacao) | SEM EVIDENCIA | Sem entrada no CHANGELOG |

```
4    /enrich docs/04_modules/mod-003-estrutura-organizacional/
                           11 agentes — 9 concluidos, 2 sem evidencia:      EM ANDAMENTO
                           Batch 1: AGN-DEV-01 (MOD — Nivel 2)             SEM EVIDENCIA
                                    (mod.md v0.3.0 sem header de agente)
                           Batch 1: AGN-DEV-02 (BR — BR-010..012 criadas)  v0.2.0 (2026-03-17)
                                    AGN-DEV-03 (FR — FR-005, Gherkin)
                           Batch 2: AGN-DEV-04 (DATA — migracao, outbox)
                                    AGN-DEV-05 (INT — contratos, failure)
                                    AGN-DEV-08 (NFR — topologia, paginacao)
                           Batch 3: AGN-DEV-06 (SEC — scope mapping, auth matrix)
                                    AGN-DEV-07 (UX — copy catalog, telemetria)
                           Batch 4: AGN-DEV-09 (ADR — rastreabilidade expandida)
                                    AGN-DEV-10 (PEN — PENDENTE-006 criada)
                           Consolidacao: AGN-DEV-11 (VAL)                   SEM EVIDENCIA
```

#### PENDENTEs Resolvidas Durante Enriquecimento

| PENDENTE | Status | Severidade | Decisao | Artefato de saida |
|----------|--------|------------|---------|-------------------|
| PENDENTE-001 | RESOLVIDA | ALTA | F04 dedicada ao Restore | US-MOD-003-F04, amendments M01 e F01-M01 |
| PENDENTE-002 | IMPLEMENTADA | MEDIA | Timeline via MOD-000 (Opcao A) | INT-001 v0.3.0, INT-007 |
| PENDENTE-003 | RESOLVIDA | ALTA | org_units cross-tenant sem tenant_id | ADR-003 (decisao arquitetural) |
| PENDENTE-004 | IMPLEMENTADA | MEDIA | Soft limit 500 nos, warning header | NFR-001 v0.3.0, FR-001 v0.3.0 |
| PENDENTE-005 | RESOLVIDA | MEDIA | Constraint catch 23505 → 409 | FR-001-C01 (amendment) |
| PENDENTE-006 | IMPLEMENTADA | BAIXA | UX-001 filtro por RBAC, nao tenant_id | UX-001 v0.2.1 |

#### O que falta para completar o enriquecimento

1. **AGN-DEV-01 (MOD/Escala):** Verificar se ja executou — mod.md v0.3.0 pode refletir execucao sem header explicito. Se nao executou, rodar `/enrich-agent AGN-DEV-01 mod-003`.
2. **AGN-DEV-11 (VAL — validacao cruzada):** Sem evidencia no CHANGELOG. Executar para garantir consolidacao.
3. **F04 (Restore):** Feature adicionada pos-scaffold. Artefatos de F04 podem precisar de enriquecimento quando F04 for promovida a READY.

```
# Opcao 1: Re-executar enriquecimento completo (idempotente — re-executa apenas o que falta)
/enrich docs/04_modules/mod-003-estrutura-organizacional/                    A EXECUTAR

# Opcao 2: Executar apenas agentes especificos
/enrich-agent AGN-DEV-01 docs/04_modules/mod-003-estrutura-organizacional/   A VERIFICAR
/enrich-agent AGN-DEV-11 docs/04_modules/mod-003-estrutura-organizacional/   A VERIFICAR
```

### Fase 3: Validacao — PENDENTE

MOD-003 e Nivel 2 (full-stack), portanto **todos os 5 validadores sao aplicaveis**. Porem, os 3 validadores de codigo (OpenAPI, Drizzle, Endpoint) so podem ser executados apos o scaffold de codigo de producao — neste momento, apenas `/qa` e `/validate-manifest` sao executaveis.

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

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (N2) | Executavel agora | Artefatos |
|---|-----------|----------------|------------------|-----------|
| 1 | `/qa` | SIM | SIM | Todos os .md do modulo |
| 2 | `/validate-manifest` | SIM | SIM | `ux-org-001.org-tree.yaml`, `ux-org-002.org-form.yaml` |
| 3 | `/validate-openapi` | SIM | NAO (pos-codigo) | `apps/api/openapi/` — nao existe ainda |
| 4 | `/validate-drizzle` | SIM | NAO (pos-codigo) | `apps/api/src/modules/org-units/schema.ts` — nao existe |
| 5 | `/validate-endpoint` | SIM | NAO (pos-codigo) | `apps/api/src/modules/org-units/routes/` — nao existe |

```
5    /validate-all docs/04_modules/mod-003-estrutura-organizacional/
                           Orquestra TODAS as validacoes em sequencia:        A EXECUTAR
                           Internamente executa:
                             1. /qa (lint, links, metadados, EX-*, §N, ciclos)
                             2. /validate-manifest (screen manifests vs schema v1)
                             3. /validate-openapi (contratos Spectral — Nivel 2)
                             4. /validate-drizzle (schemas Drizzle — Nivel 2)
                             5. /validate-endpoint (handlers Fastify — Nivel 2)
                           Skills 3-5 sao aplicaveis (Nivel 2 full-stack) mas
                           artefatos de codigo nao existem ainda — /validate-all
                           pula o validador e reporta "N/A — artefato ausente".
                           Pre-condicao: Enriquecimento concluido
                           Pos-condicao: Relatorio consolidado pass/fail
```

> **Alternativa:** Executar validadores individuais quando quiser focar em um pilar:

```
5a   /qa docs/04_modules/mod-003-estrutura-organizacional/
                           Diagnostico de sintaxe e integridade:              INDIVIDUAL
                           - lint:docs (Pass A-E: EX-*, §N, IDs, context-map, ciclos)
                           - Consistencia de metadados (estado_item, owner)
                           - Dead links, DoR alignment
                           - Verificar rastreia_para entre mod.md ↔ features ↔ manifests
                           - Verificar amendments vinculados corretamente (3 existentes)

5b   /validate-manifest ux-org-001.org-tree.yaml
                           Validar manifests contra schema v1:               INDIVIDUAL
                           - ux-org-001.org-tree.yaml (arvore hierarquica, /org-units/tree)
                           - ux-org-002.org-form.yaml (formulario de no, /org-units/novo)
                           Verifica: DOC-UX-010, operationId, RBAC,
                           telemetria, permissions (org:unit:read/write/delete),
                           linked_stories referenciando US-MOD-003,
                           cross-tenant awareness (ADR-003)

5c   /validate-openapi apps/api/openapi/v1.yaml
                           Validar contratos OpenAPI referenciados:           FUTURO (pos-codigo)
                           - CRUD /api/v1/org-units (create, get, update, delete)
                           - GET /api/v1/org-units/tree (CTE recursivo)
                           - POST /api/v1/org-units/:id/link-tenant
                           - DELETE /api/v1/org-units/:id/link-tenant/:tenantId
                           - PATCH /api/v1/org-units/:id/restore (F04)
                           Artefato nao existe ainda.

5d   /validate-drizzle apps/api/src/modules/org-units/schema.ts
                           Validar schemas Drizzle:                          FUTURO (pos-codigo)
                           - org_units (N1-N4, soft delete, parent_id FK self-ref)
                           - org_unit_tenant_links (N4→N5, constraint unique)
                           - Multitenancy: cross-tenant sem tenant_id (ADR-003)
                           - Idempotency: Idempotency-Key com TTL 60s
                           Artefato nao existe ainda.

5e   /validate-endpoint apps/api/src/modules/org-units/routes/*.route.ts
                           Validar endpoints Fastify:                        FUTURO (pos-codigo)
                           - RBAC guards (requireScope org:unit:*)
                           - X-Correlation-ID propagado
                           - RFC 9457 Problem Details
                           - Idempotency-Key em create e link-tenant
                           - Constraint catch 23505 → 409 (FR-001-C01)
                           - CTE recursivo com prevencao de loop
                           Artefato nao existe ainda.
```

### Fase 4: Promocao — PENDENTE

Requer Fase 2 concluida (todos os agentes), Fase 3 aprovada (QA verde) e **F04 em READY**.

#### Bloqueadores para Promocao

1. **F04 (Restore) em TODO** — Precisa ser promovida para READY. O conteudo ja existe (endpoint em FR-001, evento em DATA-003, UX em UX-001), mas a feature story precisa de revisao e selo READY.
2. **Enriquecimento incompleto** — AGN-DEV-01 (MOD/Escala) e AGN-DEV-11 (VAL) sem evidencia de execucao.
3. **Validacao Fase 3** — Nao executada ainda.

```
10   /promote-module docs/04_modules/mod-003-estrutura-organizacional/
                           Selar mod-003 como READY:                         A EXECUTAR (apos fase 3)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (6/6 resolvidas)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (10/10)
                             [DoR-3] Zero erros de lint? ................ A VERIFICAR (passo 5)
                             [DoR-4] Screen manifests validados? ........ A VERIFICAR (passo 5b)
                             [DoR-5] ADRs conforme nivel? ............... SIM (4 >= 3 para N2)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v0.2.1)
                             [DoR-7] Bloqueios cross-modulo? ............ SIM (0 bloqueios)

                           BLOQUEADORES adicionais (nao cobertos pelo DoR padrao):
                             - F04 (Restore) em TODO — promover para READY
                             - AGN-DEV-01 e -11 sem evidencia de execucao
                             - MOD-000 (upstream) deve estar READY

                           Fluxo interno:
                             Step 1: /qa (pre-check)
                             Step 2: Promover epico DRAFT→READY (ja READY)
                             Step 3: Promover features em lotes (F01-F03 ja READY, F04 pendente)
                             Step 4: /qa (pos-check)
                             Step 5: /update-index
                             Step 6: /git commit
                           Pre-condicao: QA verde (passo 5), DoR-1..7 atendidos, F04 READY
                           Pos-condicao: estado_item = READY, INDEX.md atualizado, commit
```

### Fase 5: Pos-READY (quando necessario)

Modulo ainda em DRAFT. Os 3 amendments existentes sao **correcoes feitas durante o enriquecimento** (pre-READY), nao alteracoes pos-selagem. Quando o modulo for selado como READY, qualquer mudanca devera seguir o fluxo formal de amendments.

```
11   /update-specification docs/04_modules/mod-003-estrutura-organizacional/requirements/fr/FR-001.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

12   /create-amendment FR-001 melhoria "adicionar campo X"
                           Criar amendment formal:                           SOB DEMANDA
                           Ex: BR-001-M01.md (melhoria)
                           Ex: SEC-001-C01.md (correcao)
                           Preserva documento base intacto
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md

13   /merge-amendment docs/04_modules/mod-003-estrutura-organizacional/amendments/...
                           Aplicar amendment no documento base:              SOB DEMANDA
                           Gate 1: Amendment APPROVED ou DRAFT (com confirmacao)
                           Gate 2: Documento base existe
                           Gate 3: Dependencias cross-modulo (DEPENDENCY-GRAPH.md §3)
                           Gate 4: Stale detection (versao do base mudou?)
                           Gate 5: Amendments concorrentes para mesmo base
                           Pos-condicao: Base bumped, amendment MERGED, CHANGELOG atualizado

                           Amendments existentes (pre-READY, criados durante enriquecimento):
                           - FR-001-C01 — Estrategia de constraint catch (PostgreSQL 23505 → 409)
                             para unicidade de codigo. Resolve PENDENTE-005.
                           - US-MOD-003-M01 — Inclusao de F04 (Restore) no epico: tree §8,
                             tabela §8, endpoints §10. Resolve PENDENTE-001.
                           - US-MOD-003-F01-M01 — Adicao do domain event org.unit_restored
                             a tabela de F01. Complemento do amendment anterior.
```

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
                           Ciclo de vida completo de pendencias:              SOB DEMANDA

                           Convencao de nomenclatura:
                             PEN-003       = arquivo container (pen-003-pendente.md)
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

                           Estado atual MOD-003:
                             PEN-003: 6 itens, todos resolvidos (0 abertas)
                             SLA: nenhum vencido
```

#### Painel de Pendencias — Resumo Individual

| PENDENTE | Status | Sev. | Dominio | Decisao | Artefato de saida |
|----------|--------|------|---------|---------|-------------------|
| PENDENTE-001 | RESOLVIDA | ALTA | ARC | F04 dedicada ao Restore | US-MOD-003-F04, amendments M01 e F01-M01 |
| PENDENTE-002 | IMPLEMENTADA | MEDIA | INT | Timeline via MOD-000 (Opcao A) | INT-001 v0.3.0, INT-007 |
| PENDENTE-003 | RESOLVIDA | ALTA | ARC | org_units cross-tenant sem tenant_id | ADR-003 (decisao arquitetural) |
| PENDENTE-004 | IMPLEMENTADA | MEDIA | NFR | Soft limit 500 nos, warning header | NFR-001 v0.3.0, FR-001 v0.3.0 |
| PENDENTE-005 | RESOLVIDA | MEDIA | FR | Constraint catch 23505 → 409 | FR-001-C01 (amendment) |
| PENDENTE-006 | IMPLEMENTADA | BAIXA | UX | Filtro view_history por RBAC, nao tenant_id | UX-001 v0.2.1 |

### Utilitarios (qualquer momento)

```
14   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-003): <descricao>

15   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

17   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA

18   /action-plan MOD-003 --update
                           Recriar/atualizar este plano com dados frescos     SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-003

```
US-MOD-003 (READY v1.1.0)              ← Fase 0: CONCLUIDA
  │  4 features (F01-F03 READY, F04 TODO)
  │  2 screen manifests (UX-ORG-001, UX-ORG-002)
  │  3 amendments pre-READY
  │
  ▼
mod-003-estrutura-organizacional/       ← Fase 1: CONCLUIDA (forge-module)
  │  (stubs DRAFT)
  │
  ▼
mod-003 enriquecido (DRAFT v0.3.0)     ← Fase 2: EM ANDAMENTO (9/11 agentes, F04 TODO)
  │
  ├── Completar enriquecimento:
  │     ├── Verificar AGN-DEV-01 (MOD/Escala)
  │     ├── Verificar AGN-DEV-11 (VAL consolidacao)
  │     └── Promover F04 (Restore) para READY
  │
  ├── /validate-all .............. PROXIMO PASSO (apos enriquecimento completo)
  │     ├── /qa .................. sintaxe, links, metadados, Pass A-E
  │     ├── /validate-manifest ... screen manifests vs schema v1 (2 manifests)
  │     ├── /validate-openapi .... FUTURO (pos-codigo) — Nivel 2 full-stack
  │     ├── /validate-drizzle .... FUTURO (pos-codigo) — org_units, org_unit_tenant_links
  │     └── /validate-endpoint ... FUTURO (pos-codigo) — CRUD + tree + link-tenant + restore
  │
  ├── /manage-pendentes .......... SOB DEMANDA (ciclo: create → analyze → decide → implement)
  │     └── SLA: BLOQUEANTE 7d | ALTA 14d | MEDIA 30d | BAIXA 90d
  │
  ▼
mod-003 validado (DRAFT)                ← Fase 3: A EXECUTAR
  │
  ├── Gate 0 (DoR): 5/7 atendidos, 2 a verificar (lint + manifests)
  ├── BLOQUEADOR: F04 deve estar READY antes da promocao
  │
  ▼
mod-003 selado (READY)                  ← Fase 4: A EXECUTAR (apos fase 3 + F04 READY)
  │
  ├── /create-amendment ← se precisar alterar base READY
  ├── /merge-amendment  ← para aplicar amendment aprovado (Gates 4-5: stale + conflitos)
  │
  ▼
mod-003 + amendments/                   ← Fase 5: SOB DEMANDA

MOD-003 depende de MOD-000 (Foundation).
MOD-003 e hub de dependencia: MOD-004, MOD-005, MOD-006, MOD-007 dependem dele.
Camada topologica: 1. Promocao desbloqueia 4+ modulos downstream.
```

---

## Particularidades do MOD-003

| Aspecto | Detalhe |
|---------|---------|
| Primeiro full-stack pos-Foundation | Nivel 2 (DDD-lite + Clean Completo, score 5/6). Primeiro modulo com backend + frontend proprios. Validadores de codigo (OpenAPI, Drizzle, Endpoint) aplicaveis mas so executaveis apos scaffold de codigo |
| Cross-tenant por design | Tabela `org_units` NAO possui `tenant_id` (ADR-003). Acesso controlado por RBAC (`org:unit:*`), nao por RLS. Esta e uma excecao importante em relacao ao padrao multi-tenant dos demais modulos. Impacta SEC-002, UX-001 (filtros) e qualquer modulo que referencie org_units |
| F04 adicionada pos-scaffold | Feature de Restore criada via amendment US-MOD-003-M01 depois do primeiro ciclo de enriquecimento. Precisa de revisao dedicada e promocao para READY. O conteudo tecnico ja existe (endpoint em FR-001, evento em DATA-003, UX em UX-001), mas a feature story ainda e TODO |
| Hub de dependencia | MOD-003 e referenciado por MOD-004 (identidade), MOD-005 (processos), MOD-006 (execucao), MOD-007 (parametrizacao) como hierarquia organizacional canonica. Promocao desbloqueia progresso em 4+ modulos downstream — priorizar |
| 4 ADRs (acima do minimo) | Score 5/6 justifica Nivel 2 com folga. ADRs documentam decisoes criticas: N5=tenant existente (ADR-001), CTE recursivo vs materialized path (ADR-002), cross-tenant sem tenant_id (ADR-003), idempotencia fail-open via MOD-000 (ADR-004) |
| 3 amendments pre-READY | FR-001-C01 (constraint catch 23505), US-MOD-003-M01 (F04 no epico), US-MOD-003-F01-M01 (evento org.unit_restored). Todos criados durante enriquecimento como correcoes, nao pos-selagem. Demonstram maturidade iterativa do modulo |

---

## Checklist Rapido — O que Falta para READY

- [ ] Completar enriquecimento (verificar AGN-DEV-01 e AGN-DEV-11)
- [ ] Promover F04 (Restore) de TODO para READY
- [ ] Executar `/validate-all docs/04_modules/mod-003-estrutura-organizacional/`
- [ ] Corrigir eventuais erros encontrados na validacao
- [ ] Re-executar validacao ate aprovacao limpa
- [ ] Verificar que Gate 0 (DoR) passa nos 7 criterios
- [ ] Executar `/promote-module docs/04_modules/mod-003-estrutura-organizacional/`

> **Alternativa:** Se preferir validar por partes, use `/qa` e `/validate-manifest` individualmente (passos 5a-5b).

> **Nota:** MOD-003 so pode ser promovido apos MOD-000 estar READY (dependencia upstream). Adicionalmente, F04 deve estar READY antes da promocao do modulo. Como hub de dependencia, priorizar a promocao do MOD-003 desbloqueia 4 modulos downstream.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 1.2.0 | 2026-03-21 | Versao hibrida: estrutura padrao (PASSO, decision trees) + riqueza explicativa (tabela de agentes, painel de pendencias, bloqueadores, notas contextuais sobre F04/cross-tenant/amendments) |
| 1.1.0 | 2026-03-21 | Reescrita: formato padronizado conforme template (PASSO numerados, decision trees, gestao de pendencias completa, resumo visual vertical) |
| 1.0.0 | 2026-03-21 | Criacao inicial — diagnostico Fase 2 em andamento (9 agentes, F04 TODO, 0 pendentes abertas) |
