# Procedimento — Plano de Acao MOD-005 Modelagem de Processos (Blueprint)

> **Versao:** 1.1.0 | **Data:** 2026-03-21 | **Owner:** Marcos Sulivan
> **Estado atual do modulo:** DRAFT (v0.17.0) | **Epico:** READY (v1.2.0) | **Features:** 4/4 READY
>
> Fases 0-2 concluidas. Enriquecimento completo (11 agentes, 9 pendencias resolvidas, 4 ADRs aceitas). Pipeline Mermaid Etapa 5. Proximo passo: Fase 3 (Validacao) — executar `/validate-all`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-005 | READY (v1.2.0) | DoR completo, 4 features vinculadas |
| Features F01-F04 | 4/4 READY | F01 READY, F02 READY, F03 READY, F04 READY |
| Scaffold (forge-module) | CONCLUIDO | mod-005-modelagem-processos/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | Todos executados, multiplos passes de re-enriquecimento (v0.13.0 a v0.17.0). Mermaid Etapa 5 |
| PENDENTEs | 0 abertas | 9/9 resolvidas (6 RESOLVIDA + 3 IMPLEMENTADA batch 4) |
| ADRs | 4 criadas (aceitas) | Nivel 2 requer minimo 3 — atendido |
| Amendments | 0 criados | Nenhum amendment necessario ate o momento |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v0.17.0 | Ultima entrada 2026-03-17. Pipeline Etapa 5 (enriquecimento concluido) |
| Screen Manifests | 2/2 existem | UX-PROC-001 (editor-visual), UX-PROC-002 (config-estagio) |
| Dependencias | 3 upstream (MOD-000, MOD-003, MOD-004) | Camada topologica 3 — unico modulo com 3 dependencias diretas |
| Bloqueios | 1 (BLK-003) | MOD-005 bloqueado por MOD-004 (`org_scopes` para filtering) — PENDENTE |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

Epico US-MOD-005 criado e aprovado como READY (v1.2.0). Define a camada de **modelagem de processos** (blueprint) — o molde reutilizavel que MOD-006 (Execucao) instanciara. Separacao Blueprint vs Execucao e a decisao arquitetural central do sistema de processos.

```
1    (manual)              Revisar e finalizar epico US-MOD-005:             CONCLUIDO
                           - Escopo fechado (4 features)                    status_agil = READY
                           - Gherkin validado nos Criterios de Aceite       v1.2.0
                           - DoR completo (owner, dependencias, impacto)
                           - Separacao Blueprint (MOD-005) vs Execucao (MOD-006) formalizada
                           - 7 tabelas, 26 endpoints, 19 domain events especificados
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-005.md

2    (manual)              Revisar e finalizar features F01-F04:             CONCLUIDO
                           - F01 (API Core Blueprint CRUD) ....... READY    4/4 READY
                           - F02 (Editor Visual UX-PROC-001) ..... READY
                           - F03 (Configurador Estagio UX-PROC-002) READY
                           - F04 (Fork Atomico de Ciclo) ......... READY
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-005-F{01..04}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Scaffold gerado via `/forge-module` em 2026-03-16. Modulo full-stack Nivel 2 com backend (API de blueprints) e frontend (editor visual + configurador).

```
3    /forge-module MOD-005  Scaffold completo gerado:                        CONCLUIDO
                           mod.md, CHANGELOG.md, requirements/              v0.1.0 (2026-03-16)
                           (br/, fr/, data/, int/, sec/, ux/, nfr/),
                           adr/, amendments/
                           Stubs obrigatorios criados: DATA-003, SEC-002
                           Pasta: docs/04_modules/mod-005-modelagem-processos/
```

### Fase 2: Enriquecimento — CONCLUIDO

Enriquecimento completo com multiplos passes de re-enriquecimento (v0.2.0 inicial ate v0.17.0). MOD-005 e o modulo com maior volume de especificacao do projeto — 7 tabelas, 26 endpoints, 19 domain events, 13 FRs, 12 BRs — o que exigiu varios ciclos de refinamento.

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-005
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-005
> ```

#### Rastreio de Agentes Executados

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod.md | CONCLUIDO | v0.2.0 + v0.13.0 — Nivel 2 confirmado, re-enriquecimento com score 5/6 |
| 2 | AGN-DEV-02 | BR | BR-005 | CONCLUIDO | v0.3.0 + v0.14.0 — 12 regras de negocio (BR-001 a BR-012) |
| 3 | AGN-DEV-03 | FR | FR-005 | CONCLUIDO | v0.9.0 + v0.15.0 — 13 FRs com Gherkin expandido |
| 4 | AGN-DEV-04 | DATA | DATA-005, DATA-003 | CONCLUIDO | v0.4.0 — 7 tabelas, /flow SLA, outbox config |
| 5 | AGN-DEV-05 | INT | INT-005 | CONCLUIDO | v0.5.0 — 25 endpoints, RFC 9457, integracao MOD-006 |
| 6 | AGN-DEV-06 | SEC | SEC-005, SEC-002 | CONCLUIDO | v0.6.0 — 11 secoes, mascaramento, LGPD |
| 7 | AGN-DEV-07 | UX | UX-005 | CONCLUIDO | v0.7.0 — editor visual + configurador, 18 acoes UX-010 |
| 8 | AGN-DEV-08 | NFR | NFR-005 | CONCLUIDO | v0.10.0 — SLOs, topologia, 9 limites de capacidade |
| 9 | AGN-DEV-09 | ADR | ADR-001..004 | CONCLUIDO | v0.8.0 + v0.16.0 — 4 ADRs aceitas |
| 10 | AGN-DEV-10 | PEN | PEN-005 | CONCLUIDO | v0.11.0 + v0.17.0 — 9 questoes, todas resolvidas |

```
4    /enrich docs/04_modules/mod-005-modelagem-processos/
                           11 agentes executados sobre mod-005:              CONCLUIDO
                           Fase exec 1: AGN-DEV-01 (MOD — Nivel 2, score 5/6)
                           Fase exec 2: AGN-DEV-02 (BR — 12 regras), AGN-DEV-03 (FR — 13 specs)
                           Fase exec 3: AGN-DEV-04 (DATA — 7 tabelas, outbox)
                           Fase exec 4: AGN-DEV-05 (INT — 25 endpoints, RFC 9457)
                           Fase exec 5: AGN-DEV-06 (SEC — mascaramento, LGPD)
                           Fase exec 6: AGN-DEV-07 (UX — editor visual, 18 acoes)
                           Fase exec 7: AGN-DEV-08 (NFR — SLOs, 9 limites)
                           Fase exec 8: AGN-DEV-09 (ADR — 4 aceitas), AGN-DEV-10 (PEN — 9 resolvidas)
                           Re-enriquecimento: v0.13.0 a v0.17.0 (multiplos passes de refinamento)
```

#### PENDENTEs Resolvidas Durante Enriquecimento

| PENDENTE | Status | Resumo | Artefato de saida |
|----------|--------|--------|-------------------|
| Q1-Q3 | RESOLVIDA | Batch inicial (primeiras questoes do scaffold) | Requisitos base |
| Q4 | RESOLVIDA | Amendment scopes — novos escopos registrados | DOC-FND-000 v1.1.0 |
| Q5 | RESOLVIDA | ADR-001 aceita — cycle_id denormalizado em stages/gates/transitions | ADR-001 |
| Q6 | RESOLVIDA | Contagem de endpoints consolidada (26 total) | INT-005 |
| Q7 | IMPLEMENTADA | Domain events para update/delete de processos | DATA-003, SEC-002 |
| Q8 | IMPLEMENTADA | DELETE process_roles (endpoint adicional) | FR-005, INT-005 |
| Q9 | IMPLEMENTADA | ADR-002 status proposed para novos ciclos | ADR-002 |

### Fase 3: Validacao — PENDENTE

MOD-005 e Nivel 2 (full-stack), portanto **todos os 5 validadores sao aplicaveis**. Porem, os 3 validadores de codigo (OpenAPI, Drizzle, Endpoint) so podem ser executados apos o scaffold de codigo de producao — neste momento, apenas `/qa` e `/validate-manifest` sao executaveis.

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
| 2 | `/validate-manifest` | SIM | SIM | `ux-proc-001.editor-visual.yaml`, `ux-proc-002.config-estagio.yaml` |
| 3 | `/validate-openapi` | SIM | NAO (pos-codigo) | `apps/api/openapi/` — nao existe ainda |
| 4 | `/validate-drizzle` | SIM | NAO (pos-codigo) | `apps/api/src/modules/process-modeling/schema.ts` — nao existe |
| 5 | `/validate-endpoint` | SIM | NAO (pos-codigo) | `apps/api/src/modules/process-modeling/routes/` — nao existe |

```
5    /validate-all docs/04_modules/mod-005-modelagem-processos/
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
5a   /qa docs/04_modules/mod-005-modelagem-processos/
                           Diagnostico de sintaxe e integridade:              INDIVIDUAL
                           - lint:docs (Pass A-E: EX-*, §N, IDs, context-map, ciclos)
                           - Consistencia de metadados (estado_item, owner)
                           - Dead links, DoR alignment
                           - Verificar rastreia_para entre mod.md ↔ features ↔ manifests
                           - Atencao especial: 13 FRs e 12 BRs — volume alto de cross-refs

5b   /validate-manifest ux-proc-001.editor-visual.yaml
                           Validar manifests contra schema v1:               INDIVIDUAL
                           - ux-proc-001.editor-visual.yaml (editor visual de blueprint)
                           - ux-proc-002.config-estagio.yaml (configurador de estagio)
                           Verifica: DOC-UX-010 (18 acoes catalogadas), operationId,
                           RBAC (process:blueprint:read/write/delete),
                           telemetria, linked_stories referenciando US-MOD-005

5c   /validate-openapi apps/api/openapi/v1.yaml
                           Validar contratos OpenAPI referenciados:           FUTURO (pos-codigo)
                           - CRUD /api/v1/processes (blueprints)
                           - CRUD /api/v1/processes/:id/stages
                           - CRUD /api/v1/processes/:id/gates
                           - CRUD /api/v1/processes/:id/transitions
                           - POST /api/v1/processes/:id/fork (fork atomico)
                           - GET /api/v1/processes/:id/flow (tree query)
                           - Total: 26 endpoints (INT-005)
                           Artefato nao existe ainda.

5d   /validate-drizzle apps/api/src/modules/process-modeling/schema.ts
                           Validar schemas Drizzle:                          FUTURO (pos-codigo)
                           - processes (blueprint principal)
                           - process_stages, process_gates, process_transitions
                           - process_roles, process_stage_roles
                           - cycle_versions (versionamento com freeze)
                           - Total: 7 tabelas (DATA-005)
                           - cycle_version_id como FK imutavel (ADR-001)
                           Artefato nao existe ainda.

5e   /validate-endpoint apps/api/src/modules/process-modeling/routes/*.route.ts
                           Validar endpoints Fastify:                        FUTURO (pos-codigo)
                           - RBAC guards (requireScope process:blueprint:*)
                           - X-Correlation-ID propagado
                           - RFC 9457 Problem Details
                           - Idempotency-Key em create e fork
                           - Fork atomico: 7 tabelas em transacao unica (ADR-003)
                           - SLA fork < 2s (NFR-005)
                           Artefato nao existe ainda.
```

### Fase 4: Promocao — PENDENTE

Requer Fase 3 aprovada. Alem do DoR padrao, ha um bloqueio externo (BLK-003) que nao impede a **promocao da especificacao** mas impede a **implementacao** do codigo.

#### Bloqueadores para Promocao

1. **Fase 3 (validacao) pendente** — Executar `/validate-all` e corrigir violacoes encontradas.
2. **BLK-003: MOD-004 (org_scopes)** — MOD-005 depende de `org_scopes` do MOD-004 para filtering de processos por unidade organizacional. MOD-004 deve completar sua cadeia (validacao + promocao) antes de MOD-005 poder ser implementado. Nota: isto nao bloqueia a **promocao da especificacao**, apenas a implementacao.

```
10   /promote-module docs/04_modules/mod-005-modelagem-processos/
                           Selar mod-005 como READY:                         A EXECUTAR (apos fase 3)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (9/9 resolvidas)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (10/10)
                             [DoR-3] Zero erros de lint? ................ A VERIFICAR (passo 5)
                             [DoR-4] Screen manifests validados? ........ A VERIFICAR (passo 5b)
                             [DoR-5] ADRs conforme nivel? ............... SIM (4 >= 3 para N2)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v0.17.0)
                             [DoR-7] Bloqueios cross-modulo? ............ ATENCAO (BLK-003 — ver Particularidades)

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

Modulo ainda em DRAFT. Nenhum amendment criado ate o momento. Quando o modulo for selado como READY, qualquer mudanca devera seguir o fluxo formal de amendments.

```
11   /update-specification docs/04_modules/mod-005-modelagem-processos/requirements/fr/FR-005.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

12   /create-amendment FR-005 melhoria "adicionar campo X"
                           Criar amendment formal:                           SOB DEMANDA
                           Ex: BR-005-M01.md (melhoria)
                           Ex: SEC-005-C01.md (correcao)
                           Preserva documento base intacto
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md

13   /merge-amendment docs/04_modules/mod-005-modelagem-processos/amendments/...
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
> ├── Ver situacao atual       → /manage-pendentes list PEN-005
> ├── Criar nova pendencia     → /manage-pendentes create PEN-005
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-005 PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-005 PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-005 PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-005 PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-005
> ```

```
16   /manage-pendentes list PEN-005
                           Ciclo de vida completo de pendencias:              SOB DEMANDA

                           Convencao de nomenclatura:
                             PEN-005       = arquivo container (pen-005-pendente.md)
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

                           Estado atual MOD-005:
                             PEN-005: 9 itens, todos resolvidos (0 abertas)
                             SLA: nenhum vencido
```

#### Painel de Pendencias — Resumo Individual

| PENDENTE | Status | Resumo | Artefato de saida |
|----------|--------|--------|-------------------|
| Q1-Q3 | RESOLVIDA | Batch inicial (primeiras questoes do scaffold) | Requisitos base |
| Q4 | RESOLVIDA | Amendment scopes — novos escopos registrados no catalogo | DOC-FND-000 v1.1.0 |
| Q5 | RESOLVIDA | ADR-001 aceita — cycle_id denormalizado em stages/gates/transitions | ADR-001 (aceita) |
| Q6 | RESOLVIDA | Contagem de endpoints consolidada (26 total) | INT-005 |
| Q7 | IMPLEMENTADA | Domain events para update/delete de processos adicionados | DATA-003, SEC-002 |
| Q8 | IMPLEMENTADA | DELETE process_roles — endpoint adicional especificado | FR-005, INT-005 |
| Q9 | IMPLEMENTADA | ADR-002 status proposed para novos ciclos aceita | ADR-002 (aceita) |

### Utilitarios (qualquer momento)

```
14   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-005): <descricao>

15   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

17   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA

18   /action-plan MOD-005 --update
                           Recriar/atualizar este plano com dados frescos     SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-005

```
US-MOD-005 (READY v1.2.0)              ← Fase 0: CONCLUIDA
  │  4 features READY (F01-F04)
  │  2 screen manifests (UX-PROC-001, UX-PROC-002)
  │  7 tabelas, 26 endpoints, 19 domain events
  │
  ▼
mod-005-modelagem-processos/            ← Fase 1: CONCLUIDA (forge-module)
  │  (stubs DRAFT)
  │
  ▼
mod-005 enriquecido (DRAFT v0.17.0)    ← Fase 2: CONCLUIDA (11 agentes, 9 pendentes resolvidas, 4 ADRs aceitas)
  │
  ├── /validate-all .............. PROXIMO PASSO
  │     ├── /qa .................. sintaxe, links, metadados, Pass A-E
  │     ├── /validate-manifest ... screen manifests vs schema v1 (2 manifests)
  │     ├── /validate-openapi .... FUTURO (pos-codigo) — Nivel 2 full-stack
  │     ├── /validate-drizzle .... FUTURO (pos-codigo) — 7 tabelas blueprint
  │     └── /validate-endpoint ... FUTURO (pos-codigo) — 26 endpoints
  │
  ├── /manage-pendentes .......... SOB DEMANDA (ciclo: create → analyze → decide → implement)
  │     └── SLA: BLOQUEANTE 7d | ALTA 14d | MEDIA 30d | BAIXA 90d
  │
  ▼
mod-005 validado (DRAFT)                ← Fase 3: A EXECUTAR
  │
  ├── Gate 0 (DoR): 5/7 atendidos, 2 a verificar (lint + manifests)
  ├── ATENCAO: BLK-003 — verificar se MOD-004 (org_scopes) esta na rota
  │
  ▼
mod-005 selado (READY)                  ← Fase 4: A EXECUTAR (apos fase 3)
  │
  ├── /create-amendment ← se precisar alterar base READY
  ├── /merge-amendment  ← para aplicar amendment aprovado (Gates 4-5: stale + conflitos)
  │
  ▼
mod-005 + amendments/                   ← Fase 5: SOB DEMANDA

MOD-005 depende de MOD-000 (Foundation) + MOD-003 (Estrutura Organizacional) + MOD-004 (Identidade).
Camada topologica: 3. Unico modulo com 3 dependencias diretas.
Dependentes: MOD-006 (Execucao de Processos — consome blueprints publicados).
BLK-003: MOD-005 bloqueado por MOD-004 (org_scopes para filtering) — PENDENTE.
```

---

## Particularidades do MOD-005

| Aspecto | Detalhe |
|---------|---------|
| Modulo mais rico em artefatos | 7 tabelas, 26 endpoints, 19 domain events, 13 FRs, 12 BRs — o modulo com maior volume de especificacao ate agora. Multiplos passes de re-enriquecimento (v0.13.0 a v0.17.0) refletem a complexidade inerente da modelagem de processos |
| Separacao Blueprint vs Execucao | MOD-005 define o molde (blueprint), MOD-006 instancia e executa. Esta separacao e a decisao arquitetural central do sistema de processos — `cycle_version_id` como FK imutavel e a chave de integridade entre os dois modulos. Alterar esta fronteira impacta toda a cadeia MOD-005→006→007→008 |
| BLK-003: Bloqueado por MOD-004 | MOD-005 depende de `org_scopes` do MOD-004 para filtering de processos por unidade organizacional. MOD-004 deve completar sua cadeia (validacao + promocao) antes de MOD-005 poder ser **implementado**. Nota: o bloqueio nao impede a **promocao da especificacao**, apenas a geracao de codigo |
| 3 dependencias upstream | Unico modulo com 3 dependencias diretas (MOD-000, MOD-003, MOD-004). Camada topologica 3 — implementacao so pode ocorrer apos as 3 upstream estarem prontas. Isto o coloca no caminho critico do projeto |
| Fork atomico (ADR-003) | Operacao complexa que copia 7 tabelas em transacao unica com remapeamento de UUIDs. SLA de fork < 2s definido em NFR-005. Requer testes de performance dedicados durante implementacao |
| 4 ADRs aceitas (acima do minimo) | Score 5/6 de gatilhos justifica plenamente o Nivel 2. ADRs cobrem: cycle_id denormalizado (ADR-001), status proposed para novos ciclos (ADR-002), fork atomico (ADR-003), versionamento de ciclos com freeze (ADR-004). Todas aceitas — maturidade arquitetural alta |

---

## Checklist Rapido — O que Falta para READY

- [ ] Executar `/validate-all docs/04_modules/mod-005-modelagem-processos/`
- [ ] Corrigir violacoes encontradas na validacao (se houver)
- [ ] Re-executar validacao ate aprovacao limpa
- [ ] Confirmar que BLK-003 sera resolvido (MOD-004 na rota para implementacao)
- [ ] Executar `/promote-module docs/04_modules/mod-005-modelagem-processos/`

> **Nota:** MOD-005 so pode ser promovido apos MOD-000, MOD-003 e MOD-004 estarem READY (3 dependencias upstream). BLK-003 (org_scopes do MOD-004) nao impede a promocao da especificacao, mas bloqueia a implementacao de codigo. Como MOD-006 depende de MOD-005, este modulo esta no caminho critico.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 1.1.0 | 2026-03-21 | Reescrita formato hibrido: PASSOs numerados, decision trees padrao, gestao de pendencias completa (SLA/ciclo de vida), rastreio de agentes, painel de pendencias individual, bloqueadores explicitos, resumo visual vertical, notas contextuais |
| 1.0.0 | 2026-03-21 | Criacao inicial — diagnostico Fase 2 concluida (11 agentes, 9 pendentes, Mermaid Etapa 5). Nivel 2 DDD-lite com BLK-003 |
