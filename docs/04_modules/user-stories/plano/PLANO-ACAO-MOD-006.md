# Procedimento — Plano de Acao MOD-006 Execucao de Casos

> **Versao:** 2.0.0 | **Data:** 2026-03-23 | **Owner:** Marcos Sulivan
> **Estado atual do modulo:** DRAFT (v0.4.0) | **Epico:** APPROVED (v1.2.0) | **Features:** 4/4 APPROVED
>
> Fases 0-3 concluidas (validate-all PASS em 2026-03-22). Proximo passo: Fase 4 (Promocao) — executar `/promote-module`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-006 | APPROVED (v1.2.0) | DoR 9/9 completo, 4 features vinculadas, EP04. Unico epico ja APPROVED |
| Features F01-F04 | 4/4 APPROVED | F01 (API: abertura+motor transicao), F02 (API: gates+responsaveis+eventos), F03 (UX: painel caso+timeline), F04 (UX: listagem casos) |
| Scaffold (forge-module) | CONCLUIDO | mod-006-execucao-casos/ com estrutura completa Nivel 2 |
| Enriquecimento (10 agentes) | CONCLUIDO | AGN-DEV-01 a AGN-DEV-10 confirmados via CHANGELOG + requirements, v0.4.0, 5 pendentes resolvidas |
| PENDENTEs | 0 abertas | 5 total: 5 IMPLEMENTADA (001-005) |
| ADRs | 5 criadas | Nivel 2 requer minimo 3 — atendido (ADR-001 motor atomico, ADR-002 freeze cycle_version, ADR-003 3 historicos, ADR-004 optimistic locking, ADR-005 background job expiracao) |
| Amendments | 0 proprios (2 cross-module) | DOC-FND-000-M01 (6 scopes process:case:*) e DOC-FND-000-M02 (scope reopen) criados no Foundation |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v0.4.0 | Ultima entrada 2026-03-19 (AGN-DEV-10 PEN). Pipeline Mermaid Etapa 4 (stale — enriquecimento concluido) |
| Screen Manifests | 2/2 existem | ux-case-001.painel-caso, ux-case-002.listagem-casos |
| Dependencias | 4 upstream (MOD-000, MOD-003, MOD-004, MOD-005) | Consome auth/RBAC de MOD-000, org_units de MOD-003, delegacoes de MOD-004, blueprints de MOD-005 |
| Bloqueios | 1 recebido (BLK-002) | MOD-006 bloqueado por MOD-005 (blueprints + cycle_version_id freeze devem estar implementados) |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-006 define a camada de execucao de casos — o motor que transforma blueprints do MOD-005 em instancias concretas rastreavies. Tres historicos independentes (estagio, gates, eventos/atribuicoes) garantem auditoria completa. O motor de transicao implementa 5 validacoes sequenciais obrigatorias antes de qualquer mudanca de estagio. O principio central e "o caso nunca sente mudancas no blueprint" — ao abrir, captura `cycle_version_id` vigente (freeze). Unico epico do projeto ja promovido a APPROVED (2026-03-18), com DoR 9/9 completo.

```
1    (manual)              Revisar e finalizar epico US-MOD-006:             CONCLUIDO
                           - Escopo fechado (4 features: 2 backend + 2 UX)  status_agil = APPROVED
                           - Gherkin validado (5 cenarios epico)             v1.2.0
                           - DoR completo (5 tabelas, 16 endpoints, motor)
                           - 3 historicos independentes documentados
                           - Motor de transicao com 5 validacoes sequenciais
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-006.md

2    (manual)              Revisar e finalizar features F01-F04:             CONCLUIDO
                           - F01: API abertura + motor de transicao          4/4 APPROVED
                           - F02: API gates + responsaveis + eventos
                           - F03: UX Painel do caso + timeline (UX-CASE-001)
                           - F04: UX Listagem de casos (UX-CASE-002)
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-006-F{01..04}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Modulo Nivel 2 (DDD-lite + Full Clean) scaffoldado na camada topologica 4. Score 5/6 no DOC-ESC-001 §4.2. Segundo modulo da cadeia de processos (MOD-005 blueprint → MOD-006 execucao). Aggregate root `CaseInstance` centraliza todas as invariantes.

```
3    /forge-module MOD-006  Scaffold completo gerado:                        CONCLUIDO
                           mod-006-execucao-casos.md, CHANGELOG.md,         v0.1.0 (2026-03-18)
                           requirements/ (br/, fr/, data/, int/, sec/,
                           ux/, nfr/), adr/, amendments/
                           Stubs obrigatorios: BR-006, FR-006, DATA-006,
                           DATA-003, INT-006, SEC-006, SEC-002, UX-006,
                           NFR-006, PEN-006
                           Pasta: docs/04_modules/mod-006-execucao-casos/
```

### Fase 2: Enriquecimento — CONCLUIDO

O enriquecimento do MOD-006 foi executado em 2026-03-19 com todos os 10 agentes. O CHANGELOG do modulo registra apenas 3 versoes de agentes (v0.2.0 AGN-DEV-01, v0.3.0 AGN-DEV-09, v0.4.0 AGN-DEV-10), mas os headers dos artefatos de requisitos confirmam a execucao de todos os 10 agentes (AGN-DEV-02 em BR-006, AGN-DEV-03 em FR-006, AGN-DEV-04 em DATA-003/DATA-006, AGN-DEV-05 em INT-006, AGN-DEV-06 em SEC-002/SEC-006, AGN-DEV-07 em UX-006, AGN-DEV-08 em NFR-006). 5 pendencias foram identificadas — todas com severidade ALTA ou MEDIA — e todas resolvidas no mesmo dia. Destaque para o motor de transicao atomico (ADR-001), freeze de cycle_version_id (ADR-002), 3 historicos independentes (ADR-003), e 2 amendments cross-module no Foundation (DOC-FND-000-M01 para 6 scopes, DOC-FND-000-M02 para scope reopen).

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-006
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-006
> ```

```
4    /enrich docs/04_modules/mod-006-execucao-casos/
                           Agentes executados sobre mod-006:                 CONCLUIDO
                           AGN-DEV-01 (MOD), AGN-DEV-02 (BR),              v0.4.0 (2026-03-19)
                           AGN-DEV-03 (FR), AGN-DEV-04 (DATA),
                           AGN-DEV-05 (INT), AGN-DEV-06 (SEC),
                           AGN-DEV-07 (UX), AGN-DEV-08 (NFR),
                           AGN-DEV-09 (ADR), AGN-DEV-10 (PEN)
                           5 pendentes criadas e resolvidas (001-005)
                           2 amendments cross-module no Foundation
```

#### Rastreio de Agentes — MOD-006

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-006-execucao-casos.md | CONCLUIDO | CHANGELOG v0.2.0 — narrativa arquitetural expandida (aggregate root, value objects, domain services), referencia EX-ESC-001 |
| 2 | AGN-DEV-02 | BR | BR-006.md | CONCLUIDO | BR-006 v0.2.0 — Gherkin adicionado a regras existentes, BR-011 a BR-017 adicionados (delegacao expira, valid_until, reabertura) |
| 3 | AGN-DEV-03 | FR | FR-006.md | CONCLUIDO | FR-006 v0.2.0 — Gherkin, done funcional, dependencias, idempotencia e timeline/notifications detalhados |
| 4 | AGN-DEV-04 | DATA | DATA-006.md, DATA-003.md | CONCLUIDO | DATA-006 v0.2.0 — constraints, value objects, invariantes, migracao, relacionamentos cross-module; DATA-003 v0.2.0 — maskable_fields, payload_policy, outbox |
| 5 | AGN-DEV-05 | INT | INT-006.md | CONCLUIDO | INT-006 v0.2.0 — contratos request/response detalhados, headers, erros RFC 9457, integracoes consumidas com failure behavior |
| 6 | AGN-DEV-06 | SEC | SEC-006.md, SEC-002.md | CONCLUIDO | SEC-006 v0.2.0 — classificacao, LGPD, mascaramento, retencao, input validation, row-level authz; SEC-002 v0.2.0 — regras Emit/View/Notify, masking |
| 7 | AGN-DEV-07 | UX | UX-006.md | CONCLUIDO | UX-006 v0.2.0 — jornadas detalhadas, action_ids UX-010, estados loading/empty/error, happy path, alternativas, mapeamento endpoint/event |
| 8 | AGN-DEV-08 | NFR | NFR-006.md | CONCLUIDO | NFR-006 v0.2.0 — SLOs detalhados, concorrencia, input validation, DR, escalabilidade futura, testabilidade |
| 9 | AGN-DEV-09 | ADR | ADR-001 a ADR-005 | CONCLUIDO | CHANGELOG v0.3.0 — 5 ADRs: motor atomico, freeze cycle_version_id, 3 historicos independentes, optimistic locking, background job expiracao |
| 10 | AGN-DEV-10 | PEN | pen-006-pendente.md | CONCLUIDO | CHANGELOG v0.4.0 — 5 questoes abertas registradas, todas resolvidas em 2026-03-19 |

#### Pendentes Resolvidas no Enriquecimento — Resumo Compacto

> As 5 pendencias foram identificadas durante o enriquecimento e todas decididas e implementadas em 2026-03-19.

| # | ID | Status | Sev. | Decisao (1 linha) | Artefato |
|---|---|---|---|---|---|
| 1 | PENDENTE-001 | IMPLEMENTADA | ALTA | Opcao B — scope dedicado `process:case:reopen` | DOC-FND-000-M02 (amendment) |
| 2 | PENDENTE-002 | IMPLEMENTADA | ALTA | Opcao B — DelegationCheckerPort pattern para expiracao atribuicoes | ADR-005, FR-014, INT-006 §3.2 |
| 3 | PENDENTE-003 | IMPLEMENTADA | MEDIA | Opcao A — query param dedicado `object_id` (exact match B-tree) | FR-009, INT-006 §2.7 |
| 4 | PENDENTE-004 | IMPLEMENTADA | ALTA | Opcao A — amendment imediato DOC-FND-000-M01 (6 scopes process:case:*) | DOC-FND-000-M01 (amendment) |
| 5 | PENDENTE-005 | IMPLEMENTADA | MEDIA | Opcao B — `target_stage_id` obrigatorio no REOPENED, gates recriados PENDING | FR-007, FR-002, DATA-006, BR-016 |

> Detalhes completos: requirements/pen-006-pendente.md

---

### Fase 3: Validacao — CONCLUIDA

O `/validate-all` foi executado em 2026-03-22 com resultado PASS: 29/29 manifests validos em todos os pilares. Os 2 screen manifests proprios do MOD-006 (ux-case-001, ux-case-002) passaram na validacao contra schema v1. Nenhuma pendencia adicional identificada. Fase 3 CONCLUIDA.

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
5    /validate-all docs/04_modules/mod-006-execucao-casos/
                           Orquestra TODAS as validacoes em sequencia:        CONCLUIDO (2026-03-22)
                           Internamente executa:
                             1. /qa (lint, links, metadados, EX-*, §N, ciclos)
                             2. /validate-manifest (screen manifests vs schema v1)
                             3. /validate-openapi → FUTURO (pos-codigo)
                             4. /validate-drizzle → FUTURO (pos-codigo)
                             5. /validate-endpoint → FUTURO (pos-codigo)
                           Pre-condicao: Enriquecimento concluido
                           Pos-condicao: Relatorio consolidado PASS
```

> **Alternativa:** Executar validadores individuais:

```
5a   /qa docs/04_modules/mod-006-execucao-casos/
                           Diagnostico de sintaxe e integridade:              PASS
                           - lint:docs (Pass A-E: EX-*, §N, IDs, context-map, ciclos)
                           - Consistencia de metadados (estado_item, owner)
                           - Dead links, DoR alignment

5b   /validate-manifest ux-case-001.painel-caso.yaml
                           Validar manifests contra schema v1:               PASS
                           - ux-case-001.painel-caso.yaml
                           - ux-case-002.listagem-casos.yaml
                           Verifica: DOC-UX-010, operationId, RBAC,
                           telemetria, permissions

5c   /validate-openapi                                                       FUTURO (pos-codigo)
5d   /validate-drizzle                                                       FUTURO (pos-codigo)
5e   /validate-endpoint                                                      FUTURO (pos-codigo)
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | `/qa` | SIM (todos) | SIM — PASS | mod-006-execucao-casos.md, requirements/*, adr/*, CHANGELOG.md |
| 2 | `/validate-manifest` | SIM (2 manifests existem) | SIM — PASS | ux-case-001.painel-caso, ux-case-002.listagem-casos |
| 3 | `/validate-openapi` | SIM (Nivel 2) | FUTURO (pos-codigo) | apps/api/openapi/mod-006-execucao-casos.yaml — nao existe ainda |
| 4 | `/validate-drizzle` | SIM (Nivel 2) | FUTURO (pos-codigo) | apps/api/src/modules/case-execution/domain/ — nao existe |
| 5 | `/validate-endpoint` | SIM (Nivel 2) | FUTURO (pos-codigo) | apps/api/src/modules/case-execution/presentation/routes/ — nao existe |

### Fase 4: Promocao — PENDENTE

```
10   /promote-module docs/04_modules/mod-006-execucao-casos/
                           Selar mod-006 como READY:                         A EXECUTAR
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (5/5 IMPLEMENTADA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (10/10)
                             [DoR-3] Zero erros de lint? ................ SIM (validate-all 2026-03-22 PASS)
                             [DoR-4] Screen manifests validados? ........ SIM (2/2 manifests PASS)
                             [DoR-5] ADRs conforme nivel? ............... SIM (5 >= 3 para N2)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v0.4.0)
                             [DoR-7] Bloqueios cross-modulo? ............ ATENCAO (BLK-002 recebido de MOD-005)

                           Fluxo interno:
                             Step 1: /qa (pre-check)
                             Step 2: Promover estado_item DRAFT→READY
                             Step 3: /qa (pos-check)
                             Step 4: /update-index
                             Step 5: /git commit
                           Pre-condicao: QA verde, DoR-1..7 atendidos
                           Pos-condicao: estado_item = READY, INDEX.md atualizado, commit
```

> **Nota sobre BLK-002:** MOD-006 recebe bloqueio BLK-002 (depende de blueprints publicados + `cycle_version_id` freeze de MOD-005). Isso afeta a **implementacao de codigo**, nao a promocao de especificacao. O DoR avalia completude da especificacao. MOD-006 pode ser promovido a READY independentemente do estado do MOD-005 — mas a geracao de codigo requer MOD-000 → MOD-003 → MOD-004 → MOD-005 → MOD-006 sequencial.

#### Bloqueadores para Promocao

1. **BLK-002 (MOD-005 → MOD-006):** Blueprints + `cycle_version_id` freeze devem estar implementados. Impacto: implementacao de codigo, nao especificacao. MOD-005 ainda DRAFT.
2. **CHANGELOG Mermaid stale:** Pipeline Mermaid mostra Etapa 4 (enriquecimento em andamento), mas o enriquecimento ja esta concluido. Deve ser corrigido para Etapa 5 antes da promocao.

### Fase 5: Pos-READY (quando necessario)

```
11   /update-specification docs/04_modules/mod-006-execucao-casos/requirements/fr/FR-006.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

12   /create-amendment FR-006 melhoria "descricao"
                           Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
                           Casos de uso previstos:
                           - Integracao com MOD-007 (parametrizacao contextual)
                           - Integracao com MOD-008 (trigger Protheus por transicao)
                           - Fluxo de aprovacao previa via MOD-009
```

### Gestao de Pendencias (qualquer momento)

> **Decision tree de pendencias:**
>
> ```
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-006
> ├── Criar nova pendencia     → /manage-pendentes create PEN-006
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-006 PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-006 PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-006 PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-006 PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-006
> ```

```
16   /manage-pendentes list PEN-006
                           Estado atual MOD-006:
                             PEN-006: 5 itens total
                               5 IMPLEMENTADA (001-005)
                               0 ABERTA
                             SLA: nenhum vencido
```

#### Painel de Pendencias — Resumo Compacto

| # | ID | Status | Sev. | Decisao (1 linha) | Artefato |
|---|---|---|---|---|---|
| 1 | PENDENTE-001 | IMPLEMENTADA | ALTA | Opcao B — scope dedicado `process:case:reopen` | DOC-FND-000-M02 |
| 2 | PENDENTE-002 | IMPLEMENTADA | ALTA | Opcao B — DelegationCheckerPort pattern | ADR-005, FR-014, INT-006 §3.2 |
| 3 | PENDENTE-003 | IMPLEMENTADA | MEDIA | Opcao A — query param `object_id` exact match | FR-009, INT-006 §2.7 |
| 4 | PENDENTE-004 | IMPLEMENTADA | ALTA | Opcao A — amendment imediato DOC-FND-000-M01 | DOC-FND-000-M01 |
| 5 | PENDENTE-005 | IMPLEMENTADA | MEDIA | Opcao B — `target_stage_id` obrigatorio no REOPENED | FR-007, FR-002, DATA-006, BR-016 |

> Detalhes completos: requirements/pen-006-pendente.md

### Utilitarios (qualquer momento)

```
14   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-006): <descricao>

15   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

17   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-006

```
US-MOD-006 (APPROVED v1.2.0)           ← Fase 0: CONCLUIDA
  │  4/4 features APPROVED (2 backend + 2 UX)
  │  Nivel 2 — DDD-lite + Full Clean (score 5/6)
  ▼
mod-006-execucao-casos/ (stubs DRAFT)  ← Fase 1: CONCLUIDA (forge-module v0.1.0)
  │
  ▼
mod-006 enriquecido (DRAFT v0.4.0)    ← Fase 2: CONCLUIDA (10 agentes, 5 PENDENTEs resolvidas)
  │
  ▼
mod-006 validado (DRAFT)               ← Fase 3: CONCLUIDA (validate-all 2026-03-22 PASS, 29/29)
  │  ├── /qa .................. PASS
  │  ├── /validate-manifest ... PASS (2 manifests)
  │  ├── /validate-openapi .... FUTURO (pos-codigo)
  │  ├── /validate-drizzle .... FUTURO (pos-codigo)
  │  └── /validate-endpoint ... FUTURO (pos-codigo)
  │
  ├── ★ PROXIMO PASSO: executar /promote-module
  ├── Gate 0 (DoR): 6/7 atendidos, 1 ATENCAO (BLK-002 — nao bloqueia spec)
  │
  ▼
mod-006 selado (READY)                 ← Fase 4: A EXECUTAR
  │
  ▼
mod-006 + amendments/                  ← Fase 5: SOB DEMANDA (0 amendments proprios)

Dependencias upstream: MOD-000 + MOD-003 + MOD-004 + MOD-005
Camada topologica: 4 (implementar apos MOD-000 → MOD-003 → MOD-004 → MOD-005)
Dependentes downstream: MOD-007 (Parametrizacao), MOD-008 (Protheus), MOD-009 (Aprovacao)
Bloqueio recebido: BLK-002 — blueprints + cycle_version_id freeze de MOD-005 (implementacao, nao spec)
Amendments cross-module: DOC-FND-000-M01 (6 scopes), DOC-FND-000-M02 (scope reopen)
```

---

## Particularidades do MOD-006

| Aspecto | Detalhe |
|---------|---------|
| Unico epico APPROVED do projeto | US-MOD-006 e o unico epico promovido a APPROVED (2026-03-18), com DoR 9/9 completo incluindo confirmacao formal do owner. Todos os demais epicos estao em READY. Isso significa que features F01-F04 tambem estao APPROVED (nao READY). |
| Motor de transicao com 5 validacoes sequenciais | O motor de transicao implementa 5 passos obrigatorios: (1) caso OPEN, (2) transicao valida no blueprint, (3) papel autorizado, (4) gates required resolvidos, (5) evidencia fornecida se required. Qualquer falha retorna 422 com motivo especifico. ADR-001 garante atomicidade em transacao unica. |
| 3 historicos independentes | stage_history, gate_instances e case_events/case_assignments sao historicos independentes com timeline intercalada. Um estagio pode durar dias e ter 3 reatribuicoes sem mudanca de estagio. ADR-003 documenta esta decisao e suas implicacoes para queries e performance. |
| Freeze de cycle_version_id | O caso nunca "sente" mudancas no blueprint. Ao abrir, captura `cycle_version_id` vigente. Fork ou atualizacao no MOD-005 nao afeta instancias em andamento. ADR-002 documenta esta decisao e a separacao blueprint/execucao. |
| 2 amendments cross-module no Foundation | PENDENTE-004 e PENDENTE-001 resultaram em 2 amendments no MOD-000: DOC-FND-000-M01 (6 scopes process:case:*) e DOC-FND-000-M02 (scope process:case:reopen). Isso demonstra o impacto cross-module do MOD-006 sobre o catalogo de scopes do Foundation. |
| CHANGELOG Mermaid stale | Pipeline Mermaid mostra Etapa 4 (enriquecimento em andamento), mas o enriquecimento esta integralmente concluido com 10 agentes e 5 pendencias resolvidas. Deve ser corrigido para Etapa 5 antes da promocao. |
| BLK-002 e cadeia de dependencias longa | MOD-006 esta na camada topologica 4 com a cadeia mais longa: MOD-000 → MOD-003 → MOD-004 → MOD-005 → MOD-006. O BLK-002 (blueprints publicados) e a dependencia mais critica para implementacao. A especificacao pode ser promovida independentemente. |
| 5 ADRs — maior quantidade do projeto | Excede significativamente o minimo de 3 ADRs para Nivel 2. Cada ADR resolve um problema arquitetural especifico: atomicidade do motor, freeze de versao, historicos independentes, concorrencia otimista, e expiracao de atribuicoes via background job. |

---

## Checklist Rapido — O que Falta para READY

- [x] Enriquecimento completo (10 agentes, 5 pendencias resolvidas)
- [x] Executar `/validate-all` — /qa + /validate-manifest PASS (2026-03-22)
- [ ] Corrigir pipeline Mermaid no CHANGELOG.md (E4 → E5 concluida)
- [ ] Executar `/promote-module docs/04_modules/mod-006-execucao-casos/` — verificar Gate 0 (DoR)

> **Nota:** Todas as 5 pendencias estao IMPLEMENTADA. Os 10 artefatos de requisitos estao enriquecidos e validados. As 5 ADRs excedem o minimo para Nivel 2. Nao ha pendencias abertas. O BLK-002 (MOD-005 → MOD-006) afeta implementacao de codigo, nao promocao de especificacao. Os 2 amendments cross-module (DOC-FND-000-M01 e M02) ja foram implementados no Foundation. A promocao do MOD-006 e pre-requisito para que MOD-007 (Parametrizacao), MOD-008 (Protheus) e MOD-009 (Aprovacao) avancem na camada seguinte.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 2.0.0 | 2026-03-23 | Recriacao: Fase 3 CONCLUIDA (validate-all 2026-03-22 PASS 29/29 manifests). Fase 4 PENDENTE. DoR Gate 0 6/7 (BLK-002 nao bloqueia spec). Rastreio de 10 agentes via CHANGELOG+requirements. Pendencias compactadas (referencia pen file). 2 amendments cross-module. Proximo passo: /promote-module |
| 1.0.0 | 2026-03-22 | Criacao completa: Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 5 pendentes resolvidas (001-005), rastreio de 10 agentes, mapa de cobertura de 5 validadores, particularidades Nivel 2 DDD-lite, bloqueio BLK-002, 2 amendments cross-module |
