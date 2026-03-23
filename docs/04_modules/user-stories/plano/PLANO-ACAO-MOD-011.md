# Procedimento — Plano de Acao MOD-011 SmartGrid

> **Versao:** 2.0.0 | **Data:** 2026-03-23 | **Owner:** arquitetura
> **Estado atual do modulo:** DRAFT (v0.14.0) | **Epico:** APPROVED (v1.1.0) | **Features:** 5/5 APPROVED
>
> Fases 0-3 concluidas. Fase 4 (Promocao) PENDENTE — 0 ABERTA, DoR elegivel. Proximo passo: executar `/promote-module MOD-011` para promocao a READY.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-011 | APPROVED (v1.1.0) | DoR completo, 5 features vinculadas, UX Consumer do MOD-007 |
| Features F01-F05 | 5/5 APPROVED | F01 (Amendment current_record_state), F02 (Grade Inclusao em Massa), F03 (Formulario Alteracao), F04 (Grade Exclusao em Massa), F05 (Acoes em Massa) |
| Scaffold (forge-module) | CONCLUIDO | mod-011-smartgrid/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | AGN-DEV-01 a AGN-DEV-11 confirmados, v0.14.0, 7 pendentes resolvidas |
| PENDENTEs | 0 ABERTA | 7 total: 7 IMPLEMENTADA (PEND-SGR-01 a PEND-SGR-07) |
| ADRs | 2 aceitas (ACCEPTED) | Nivel 1 requer minimo 1 — atendido (ADR-001 Motor 1-por-1, ADR-002 Sem Persistencia Server-Side) |
| Amendments | 0 (1 backlog) | Amendment MOD-007: campo `target_endpoints` no context_framer tipo OPERACAO (backlog) |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v0.14.0 | Ultima entrada 2026-03-19 (Etapa 4 — enriquecimento em andamento) |
| Screen Manifests | 3/3 existem | ux-sgr-001.inclusao-massa.yaml, ux-sgr-002.alteracao-registro.yaml, ux-sgr-003.exclusao-massa.yaml |
| Dependencias | 2 upstream (MOD-000, MOD-007) | Consome auth/RBAC do MOD-000 e routine-engine/evaluate do MOD-007 |
| Bloqueios | 0 | Nenhum BLK-* afeta MOD-011 |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

> **Decision tree de enriquecimento:**
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-NNN
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-NNN

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-011 define o componente SmartGrid como consumidor puro de UX do MOD-007. Modulo Nivel 1 (UX Consumer) sem tabelas de banco, sem endpoints API proprios e sem scopes RBAC proprios. 3 telas UX (UX-SGR-001/002/003), 5 features (F01 backend amendment + F02-F05 UX), 8 componentes UI. Toda validacao delegada ao motor `POST /routine-engine/evaluate` do MOD-007, chamado 1 objeto por vez. Persistencia intermediaria via Export/Import JSON (client-side).

```
1    (manual)              Revisar e finalizar epico US-MOD-011:             CONCLUIDO
                           - Escopo fechado (5 features: 1 backend + 4 UX)  status_agil = APPROVED
                           - Gherkin validado (motor por linha, manifests)    v1.1.0
                           - DoR completo (PEND-SGR-01/02 resolvidas)
                           - Nomenclatura SGR vs. ECF mapeada
                           - Decisoes arquiteturais documentadas
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-011.md

2    (manual)              Revisar e finalizar features F01-F05:             CONCLUIDO
                           - F01: Amendment current_record_state (backend)   5/5 APPROVED
                           - F02: UX Grade de Inclusao em Massa
                           - F03: UX Formulario de Alteracao de Registro
                           - F04: UX Grade de Exclusao em Massa
                           - F05: UX Acoes em Massa sobre Linhas
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-011-F01..F05.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Modulo scaffoldado via `forge-module` a partir do epico APPROVED (v1.1.0). Nivel 1 (UX Consumer) com score DOC-ESC-001 de 1/6 (apenas multi-tenant herdado). Scaffold criou estrutura completa: 0 tabelas, 0 endpoints proprios, 10 artefatos de requisitos + stubs obrigatorios (DATA-003, SEC-002), 3 screen manifests.

```
3    /forge-module          Gerar scaffold MOD-011:                          CONCLUIDO
                           - mod-011-smartgrid/ criada                       v0.1.0
                           - mod-011-smartgrid.md (manifesto)
                           - CHANGELOG.md (Etapa 1-3 verde)
                           - requirements/ com 10 artefatos (BR, FR, DATA x2, INT, SEC x2, UX, NFR, PEN)
                           - adr/ e amendments/ (vazios)
                           - 3 screen manifests em docs/05_manifests/screens/
                           Arquivo: docs/04_modules/mod-011-smartgrid/
```

### Fase 2: Enriquecimento — CONCLUIDA

O enriquecimento do MOD-011 foi executado via 4 batches sequenciais, cobrindo todos os 11 agentes. Apesar de ser Nivel 1 (UX Consumer), o modulo tem complexidade significativa na camada de apresentacao: 8 componentes UI, 3 telas com jornadas completas, integracao com motor MOD-007 chamado 1 objeto por vez. 5 pendencias foram identificadas durante o enriquecimento (PEND-SGR-01 a PEND-SGR-05), todas resolvidas. 2 pendencias adicionais (PEND-SGR-06, PEND-SGR-07) foram identificadas durante a Fase 3 de validacao e tambem resolvidas.

```
4    /enrich mod-011        Enriquecimento completo (11 agentes, 4 batches):  CONCLUIDO
                           Batch 1: AGN-DEV-01 (MOD), AGN-DEV-02 (BR),
                                    AGN-DEV-03 (FR)                          v0.1.0 → v0.4.0
                           Batch 2: AGN-DEV-04 (DATA), AGN-DEV-05 (INT),
                                    AGN-DEV-08 (NFR)                         v0.4.0 → v0.7.0
                           Batch 3: AGN-DEV-06 (SEC), AGN-DEV-07 (UX)       v0.7.0 → v0.9.0
                           Batch 4: AGN-DEV-09 (ADR), AGN-DEV-10 (PENDENTE),
                                    AGN-DEV-11 (VALIDACAO)                   v0.9.0 → v0.12.0
                           Pipeline pendentes: v0.12.0 → v0.14.0
```

#### Rastreio de Agentes

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD | mod-011-smartgrid.md | CONCLUIDO | v0.2.0, metricas de escopo, fluxo de integracao MOD-007, mapeamento response→status visual |
| 2 | AGN-DEV-02 | BR | BR-011.md | CONCLUIDO | v0.3.0, 10 regras de comportamento de interface BR-001..BR-010, Gherkin |
| 3 | AGN-DEV-03 | FR | FR-011.md | CONCLUIDO | v0.4.0, 9 requisitos funcionais FR-001..FR-009, cobrindo F01-F05, Gherkin |
| 4 | AGN-DEV-04 | DATA | DATA-011.md, DATA-003.md | CONCLUIDO | v0.5.0, contrato client-side JSON, entidades consumidas, 4 domain events delegados |
| 5 | AGN-DEV-05 | INT | INT-011.md | CONCLUIDO | v0.6.0, 3 integracoes (MOD-007, MOD-000, modulo destino dinamico) |
| 6 | AGN-DEV-06 | SEC | SEC-011.md, SEC-002.md | CONCLUIDO | v0.8.0, RBAC herdado, client-side security, soft delete, audit, LGPD, 4 eventos delegados |
| 7 | AGN-DEV-07 | UX | UX-011.md | CONCLUIDO | v0.9.0, 3 telas (SGR-001/002/003), jornadas, happy paths, erros, a11y, telemetria |
| 8 | AGN-DEV-08 | NFR | NFR-011.md | CONCLUIDO | v0.7.0, 10 NFRs (NFR-001..NFR-010), performance renderizacao, limites, SLOs, export/import |
| 9 | AGN-DEV-09 | ADR | ADR-001, ADR-002 | CONCLUIDO | v0.10.0, ADR-001 Motor 1-por-1 (ACCEPTED), ADR-002 Sem Persistencia Server-Side (ACCEPTED) |
| 10 | AGN-DEV-10 | PENDENTE | pen-011-pendente.md | CONCLUIDO | v0.11.0, PEND-SGR-01/02 resolvidas, PEND-SGR-03/04/05 documentadas |
| 11 | AGN-DEV-11 | VALIDACAO | cross-validation | CONCLUIDO | v0.12.0, todos checks passed, 1 warning menor, 3 questoes abertas documentadas |

#### Pendencias — Resumo Compacto

| # | ID | Status | Severidade | Decisao (1 linha) | Artefato |
|---|---|---|---|---|---|
| 1 | PEND-SGR-01 | IMPLEMENTADA | — | Mapeamento motor → status visual definido (blocking/alerta/valido/neutro) | INT-011, DATA-011 |
| 2 | PEND-SGR-02 | IMPLEMENTADA | — | `current_record_state` nullable adicionado ao contrato do motor | FR-011, INT-011 |
| 3 | PEND-SGR-03 | IMPLEMENTADA | — | Opcao B — 200 linhas padrao (MAX_GRID_ROWS=200) com virtualizacao | NFR-011 |
| 4 | PEND-SGR-04 | IMPLEMENTADA | — | Opcao A — `target_endpoints` no context_framer tipo OPERACAO | DATA-011, INT-011 |
| 5 | PEND-SGR-05 | IMPLEMENTADA | — | Opcao C — env var SMARTGRID_CONCURRENCY default=10 | NFR-011 |
| 6 | PEND-SGR-06 | IMPLEMENTADA | ALTA | Scope `param:engine:evaluate` registrado em DOC-FND-000 (via PEN-007 PENDENTE-009) | DOC-FND-000 |
| 7 | PEND-SGR-07 | IMPLEMENTADA | MEDIA | Opcao A — campo `notes` em acoes submit explicando endpoints dinamicos | ux-sgr-001/002/003.yaml |

> Detalhes completos: requirements/pen-011-pendente.md

### Fase 3: Validacao — CONCLUIDA

Validacao executada via `/validate-all` em 2026-03-22 com resultado PASS para todos os 3 manifests do modulo. Durante a validacao, 2 novas pendencias foram identificadas: PEND-SGR-06 (scope `param:engine:evaluate` nao registrado no catalogo canonico) e PEND-SGR-07 (`operation_id: null` em acoes submit dinamicas). Ambas foram resolvidas: PEND-SGR-06 via resolucao cross-module em PEN-007, PEND-SGR-07 via campo `notes` nos manifests explicando o design by-intent.

> **Decision tree de validacao:**
> Quero validar tudo de uma vez?
> ├── SIM → /validate-all (orquestra todos, pula os que nao tem artefato)
> └── NAO → Qual pilar?
>     ├── Sintaxe/links/metadados → /qa
>     ├── Screen manifests       → /validate-manifest
>     ├── Contratos OpenAPI      → /validate-openapi
>     ├── Schemas Drizzle        → /validate-drizzle
>     └── Endpoints Fastify      → /validate-endpoint

```
5a   /qa                    Validacao de sintaxe, links e metadados:          CONCLUIDO
                           - Todos os artefatos passaram qa check             validate-all 2026-03-22

5b   /validate-manifest    Validacao de screen manifests:                     CONCLUIDO
                           - ux-sgr-001.inclusao-massa.yaml PASS
                           - ux-sgr-002.alteracao-registro.yaml PASS
                           - ux-sgr-003.exclusao-massa.yaml PASS
                           - PEND-SGR-06 resolvida (scopes param:* registrados)
                           - PEND-SGR-07 resolvida (notes em acoes dinamicas)

5c   /validate-openapi     Validacao de contratos OpenAPI:                    N/A
                           - MOD-011 nao possui endpoints API proprios
                           - Consome MOD-007 (routine-engine/evaluate)

5d   /validate-drizzle     Validacao de schemas Drizzle:                      N/A
                           - MOD-011 nao possui tabelas de banco de dados
                           - Modulo UX puro (0 entidades persistentes)

5e   /validate-endpoint    Validacao de endpoints Fastify:                    N/A
                           - MOD-011 nao possui handlers Fastify proprios
                           - Apenas consome endpoints do MOD-007
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | `/qa` | SIM (todos) | SIM — PASS | Todos os 10 requisitos + mod.md + CHANGELOG |
| 2 | `/validate-manifest` | SIM (3 manifests) | SIM — PASS | ux-sgr-001.yaml, ux-sgr-002.yaml, ux-sgr-003.yaml |
| 3 | `/validate-openapi` | N/A (UX-First) | N/A | Sem endpoints proprios |
| 4 | `/validate-drizzle` | N/A (UX-First) | N/A | Sem tabelas proprias |
| 5 | `/validate-endpoint` | N/A (UX-First) | N/A | Sem handlers proprios |

### Fase 4: Promocao — PENDENTE

A promocao de DRAFT para READY esta elegivel. Todas as 7 pendencias estao IMPLEMENTADA, todos os validadores aplicaveis passaram, e todas as features estao APPROVED. O Gate 0 (DoR) pode ser executado imediatamente.

```
6    /promote-module        Gate 0 — DoR Pre-Promocao:                       A EXECUTAR

     DoR-1: 0 pendencias ABERTA?                                             SIM (0 ABERTA, 7 IMPLEMENTADA)
     DoR-2: Todos features APPROVED?                                         SIM (5/5)
     DoR-3: Todos requisitos existem?                                        SIM (10/10)
     DoR-4: ADRs minimos atendidos (>= 1 para Nivel 1)?                     SIM (2 ADRs)
     DoR-5: Screen manifests validos?                                        SIM (3/3 PASS)
     DoR-6: validate-all PASS?                                               SIM (2026-03-22)
     DoR-7: Owner aprova?                                                    A VERIFICAR
```

> **Nota:** Todos os criterios DoR estao atendidos exceto DoR-7 (aprovacao do owner). O modulo esta pronto para promocao imediata.

### Fase 5: Pos-READY — SOB DEMANDA

```
7    /create-amendment      Sob demanda apos READY:                           SOB DEMANDA
                           - 1 amendment em backlog: MOD-007 (target_endpoints
                             no context_framer tipo OPERACAO)
                           - Amendments futuros para extensoes de features UX
```

### Gestao de Pendencias

**SLA de Pendencias:**
- ALTA: resolver em ate 5 dias uteis
- MEDIA: resolver em ate 10 dias uteis
- BAIXA: resolver em ate 20 dias uteis

**Ciclo de vida:** ABERTA → EM_ANALISE → DECIDIDA → IMPLEMENTADA (ou CANCELADA)

> **Decision tree de pendencias:**
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-011
> ├── Criar nova pendencia     → /manage-pendentes create PEN-011
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-011 PEND-SGR-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-011 PEND-SGR-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-011 PEND-SGR-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-011 PEND-SGR-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-011

#### Pendencias — Referencia

| # | ID | Status | Severidade | Decisao (1 linha) |
|---|---|---|---|---|
| 1 | PEND-SGR-01 | IMPLEMENTADA | — | Mapeamento motor → status visual |
| 2 | PEND-SGR-02 | IMPLEMENTADA | — | current_record_state nullable |
| 3 | PEND-SGR-03 | IMPLEMENTADA | — | 200 linhas com virtualizacao |
| 4 | PEND-SGR-04 | IMPLEMENTADA | — | target_endpoints no context_framer |
| 5 | PEND-SGR-05 | IMPLEMENTADA | — | Concorrencia env var default=10 |
| 6 | PEND-SGR-06 | IMPLEMENTADA | ALTA | Scope param:engine:evaluate registrado |
| 7 | PEND-SGR-07 | IMPLEMENTADA | MEDIA | Notes em acoes submit dinamicas |

> Detalhes completos: requirements/pen-011-pendente.md

### Utilitarios

```
     /qa                    Re-validar apos alteracoes
     /validate-all          Validacao completa (manifests + qa)
     /manage-pendentes      Gerenciar ciclo de vida de pendencias
     /promote-module        Executar promocao quando DoR atendido
     /create-amendment      Criar adendo pos-READY
```

---

## Resumo Visual do Fluxo MOD-011

```
PRE-MODULO ──→ GENESE ──→ ENRIQUECIMENTO ──→ VALIDACAO ──→ PROMOCAO ──→ POS-READY
    [OK]         [OK]          [OK]              [OK]       [PRONTO]     [futuro]
                                                              │
                                                              ├── 0 ABERTA (todas IMPLEMENTADA)
                                                              └── DoR elegivel — executar /promote-module
```

**Posicao na cadeia topologica:** Camada 6 (MOD-011 depende de MOD-000 e MOD-007). Modulo folha — nenhum modulo depende de MOD-011.

**Dependencias upstream (2):**
- MOD-000 (Foundation) — auth, RBAC (scopes herdados do MOD-007), domain events para log de alteracoes
- MOD-007 (Parametrizacao Contextual) — motor de avaliacao (`routine-engine/evaluate`), configuracao de Operacoes (`context_framers`, `behavior_routines`)

---

## Particularidades do MOD-011

| Aspecto | Detalhe |
|---------|---------|
| Nivel de Arquitetura | Nivel 1 — UX Consumer. Score DOC-ESC-001: 1/6 (apenas multi-tenant herdado). Modulo sem dominio proprio: 0 tabelas, 0 endpoints, 0 scopes. Toda logica restrita a camada de apresentacao. |
| UX-First sem backend | MOD-011 e um consumidor puro do MOD-007. Nao cria tabelas, nao cria endpoints, nao cria scopes RBAC. Validadores `/validate-openapi`, `/validate-drizzle` e `/validate-endpoint` sao N/A — nao e omissao, e by-design. |
| 3 screen manifests | Unico modulo com 3 manifests YAML distintos (UX-SGR-001/002/003), cobrindo as 3 operacoes de massa (inclusao, alteracao, exclusao). Todos passaram validacao. |
| operation_id dinamico | PEND-SGR-07: acoes submit nos manifests tem `operation_id: null` e `endpoint: null` porque sao resolvidos em runtime via `target_endpoints` do context_framer. Design by-intent documentado via campo `notes` nos manifests. Gate 2 WARNING justificado. |
| Amendment backlog MOD-007 | O campo `target_endpoints` no context_framer tipo OPERACAO foi especificado (DATA-011 §6, INT-011 INT-003) mas requer amendment formal no MOD-007 para implementacao efetiva. Este amendment esta em backlog e nao bloqueia a especificacao do MOD-011. |
| Menor contagem de dependencias | Apenas 2 dependencias upstream (MOD-000, MOD-007) — uma das menores do portfolio. Posicao de modulo folha na Camada 6 (paralelo com MOD-010). |
| Pronto para promocao | Todos os criterios DoR estao atendidos. Modulo elegivel para promocao imediata via `/promote-module MOD-011`. |

---

## Checklist Rapido — O que Falta para READY

- [ ] Executar `/promote-module MOD-011` (Gate 0 DoR — todos criterios atendidos)
- [ ] Owner (arquitetura) aprovar promocao

> **Nota:** MOD-011 e modulo folha (Camada 6) — sua promocao nao bloqueia nenhum outro modulo. As dependencias upstream (MOD-000, MOD-007) devem estar READY antes do deploy efetivo. O amendment backlog no MOD-007 (target_endpoints) deve ser criado formalmente pos-promocao.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 2.0.0 | 2026-03-23 | Recriacao completa: Fases 0-3 CONCLUIDAS (validate-all 2026-03-22 PASS), Fase 4 PRONTA para promocao (0 ABERTA), PEND-SGR-06 e PEND-SGR-07 adicionadas e resolvidas, 3/3 screen manifests confirmados PASS, mapa de cobertura atualizado com 3 validadores N/A (UX-First) |
| 1.0.0 | 2026-03-22 | Criacao completa: Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 5 pendentes resolvidas (PEND-SGR-01 a PEND-SGR-05), rastreio de 11 agentes, mapa de cobertura de validadores, particularidades UX Consumer, amendment backlog MOD-007 |
