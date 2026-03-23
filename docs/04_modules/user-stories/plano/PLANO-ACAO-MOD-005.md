# Procedimento — Plano de Acao MOD-005 Modelagem de Processos

> **Versao:** 3.0.0 | **Data:** 2026-03-23 | **Owner:** Marcos Sulivan
> **Estado atual do modulo:** DRAFT (v0.17.0) | **Epico:** READY (v1.2.0) | **Features:** 4/4 READY
>
> Fases 0-3 concluidas (validate-all PASS em 2026-03-22). Proximo passo: Fase 4 (Promocao) — executar `/promote-module`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-005 | READY (v1.2.0) | DoR 7/8 completo (falta owner confirmar APPROVED), 4 features vinculadas, EP03 |
| Features F01-F04 | 4/4 READY | F01 (API: Ciclos+Macroetapas+Estagios), F02 (API: Gates+Papeis+Transicoes), F03 (UX: Editor Visual), F04 (UX: Configurador Estagio) |
| Scaffold (forge-module) | CONCLUIDO | mod-005-modelagem-processos/ com estrutura completa Nivel 2 |
| Enriquecimento (11 agentes) | CONCLUIDO | Agentes 01-10 confirmados (AGN-DEV-01 x2, AGN-DEV-02 x2, AGN-DEV-03 x2, AGN-DEV-09 x2, AGN-DEV-10 x2 = re-enriquecimento), v0.17.0 |
| PENDENTEs | 0 abertas | 9 total: 9 IMPLEMENTADA (Q1-Q9) |
| ADRs | 4 criadas | Nivel 2 requer minimo 3 — atendido (ADR-001 is_initial unique, ADR-002 fail-safe MOD-006, ADR-003 fork atomico, ADR-004 optimistic locking) |
| Amendments | 0 | Nenhum |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v0.17.0 | Ultima entrada 2026-03-17 (AGN-DEV-10 re-enriquecimento PEN). Pipeline Mermaid Etapa 5 |
| Screen Manifests | 2/2 existem | ux-proc-001.editor-visual, ux-proc-002.config-estagio |
| Dependencias | 3 upstream (MOD-000, MOD-003, MOD-004) | Consome auth/RBAC de MOD-000, org_units de MOD-003, org_scopes de MOD-004 |
| Bloqueios | 1 recebido (BLK-003) | MOD-005 bloqueado por MOD-004 (org_scopes para filtering). Tambem emite BLK-002 para MOD-006 |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-005 define a camada de modelagem de processos (blueprint) — a separacao conceitual entre o molde (MOD-005) e o produto moldado (MOD-006). Modelo de 7 tabelas com versionamento imutavel de ciclos publicados, grafo de transicoes com condicoes e evidencias, e catalogo global de papeis de processo. O principio "Etapa nao e responsavel" (doc normativo) fundamenta a separacao Papel (processo) vs Role (RBAC). Com 4 features cobrindo backend (F01, F02) e frontend (F03, F04), o modulo foi aprovado como READY com DoR quase completo.

```
1    (manual)              Revisar e finalizar epico US-MOD-005:             CONCLUIDO
                           - Escopo fechado (4 features: 2 backend + 2 UX)  status_agil = READY
                           - Gherkin validado (5 cenarios epico)             v1.2.0
                           - DoR completo (7 tabelas, 25 endpoints, regras)
                           - Separacao Blueprint vs Execucao documentada
                           - Versionamento de ciclos (DRAFT→PUBLISHED→DEPRECATED)
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-005.md

2    (manual)              Revisar e finalizar features F01-F04:             CONCLUIDO
                           - F01: API Ciclos + Macroetapas + Estagios        4/4 READY
                           - F02: API Gates + Papeis + Transicoes
                           - F03: UX Editor Visual de Fluxo (UX-PROC-001)
                           - F04: UX Configurador de Estagio (UX-PROC-002)
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-005-F{01..04}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Modulo Nivel 2 (DDD-lite + Full Clean) scaffoldado na camada topologica 3. Score 5/6 no DOC-ESC-001 §4.2. Primeiro modulo da cadeia de processos (MOD-005 → MOD-006 → MOD-007).

```
3    /forge-module MOD-005  Scaffold completo gerado:                        CONCLUIDO
                           mod-005-modelagem-processos.md, CHANGELOG.md,    v0.1.0 (2026-03-16)
                           requirements/ (br/, fr/, data/, int/, sec/,
                           ux/, nfr/), adr/, amendments/
                           Stubs obrigatorios: BR-005, FR-005, DATA-005,
                           DATA-003, INT-005, SEC-005, SEC-002, UX-005,
                           NFR-005, PEN-005
                           Pasta: docs/04_modules/mod-005-modelagem-processos/
```

### Fase 2: Enriquecimento — CONCLUIDO

O enriquecimento do MOD-005 foi o mais intenso do projeto — 17 versoes no CHANGELOG, com re-enriquecimento de 5 agentes (AGN-DEV-01, 02, 03, 09, 10) necessario apos o enriquecimento inicial revelar lacunas e questoes interdependentes. Durante o processo, 9 questoes foram levantadas (Q1-Q9) e todas resolvidas: Q1 (React Flow), Q2 (JSON rule engine), Q3 (integracao MOD-006), Q4 (scopes DOC-FND-000), Q5 (ADR-001 is_initial), Q6 (contagem endpoints), Q7 (domain events UPDATE/DELETE), Q8 (DELETE process_roles), Q9 (ADR-002 status proposed). Destaque para o modelo de 7 tabelas, 26 endpoints, 19 domain events, fork atomico com remapeamento de UUIDs.

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-005
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-005
> ```

```
4    /enrich docs/04_modules/mod-005-modelagem-processos/
                           Agentes executados sobre mod-005:                 CONCLUIDO
                           AGN-DEV-01 (MOD x2), AGN-DEV-02 (BR x2),       v0.17.0 (2026-03-17)
                           AGN-DEV-03 (FR x2), AGN-DEV-04 (DATA),
                           AGN-DEV-05 (INT), AGN-DEV-06 (SEC),
                           AGN-DEV-07 (UX), AGN-DEV-08 (NFR),
                           AGN-DEV-09 (ADR x2), AGN-DEV-10 (PEN x2)
                           9 questoes criadas e resolvidas (Q1-Q9)
```

#### Rastreio de Agentes — MOD-005

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-005-modelagem-processos.md | CONCLUIDO (x2) | v0.2.0 — Nivel 2 confirmado (score 5/6), module_paths; v0.13.0 — re-enriquecimento, contadores atualizados |
| 2 | AGN-DEV-02 | BR | BR-005.md | CONCLUIDO (x2) | v0.3.0 — 10 regras BR-001 a BR-010, Gherkin, exemplos; v0.14.0 — BR-011 (depreciacao), BR-012 (reordenacao). Total: 12 regras |
| 3 | AGN-DEV-03 | FR | FR-005.md | CONCLUIDO (x2) | v0.9.0 — 13 requisitos FR-001 a FR-013; v0.15.0 — Gherkin adicionado, deps BR-011/012 incorporadas |
| 4 | AGN-DEV-04 | DATA | DATA-005.md, DATA-003.md | CONCLUIDO | v0.4.0 — 7 tabelas completas, constraints, indexes, seed data, migracao, queries criticas (/flow SLA <200ms), catalogo events expandido |
| 5 | AGN-DEV-05 | INT | INT-005.md | CONCLUIDO | v0.5.0 — 25 endpoints documentados, contratos, RFC 9457, contrato /flow, integracao MOD-006, 4 escopos RBAC |
| 6 | AGN-DEV-06 | SEC | SEC-005.md, SEC-002.md | CONCLUIDO | v0.6.0 — 11 secoes SEC (authn, authz, classificacao, retencao, mascaramento, soft delete, imutabilidade, tenant isolation, auditoria, LGPD) |
| 7 | AGN-DEV-07 | UX | UX-005.md | CONCLUIDO | v0.7.0 — UX-PROC-001 (editor visual: 8 acoes, 5 estados, 7 componentes) + UX-PROC-002 (configurador: 4 abas, 10 acoes, sincronizacao bidirecional) |
| 8 | AGN-DEV-08 | NFR | NFR-005.md | CONCLUIDO | v0.10.0 — SLOs (/flow <200ms, fork <2s), topologia sync, 2 healthchecks, DR, 9 limites capacidade, 5 pilares observabilidade |
| 9 | AGN-DEV-09 | ADR | ADR-001 a ADR-004 | CONCLUIDO (x2) | v0.8.0 — ADR-001 (is_initial unique), ADR-002 (fail-safe MOD-006); v0.16.0 — ADR-003 (fork atomico), ADR-004 (optimistic locking) |
| 10 | AGN-DEV-10 | PEN | pen-005-pendente.md | CONCLUIDO (x2) | v0.11.0 — Q1-Q6 (3 resolvidas, 3 abertas); v0.17.0 — Q7-Q9 adicionadas. Total: 9 questoes, todas IMPLEMENTADA |

#### Pendentes Resolvidas no Enriquecimento — Resumo Compacto

> As 9 questoes foram identificadas durante o enriquecimento e todas decididas e implementadas entre 2026-03-17 e 2026-03-18.

| # | ID | Status | Sev. | Decisao (1 linha) | Artefato |
|---|---|---|---|---|---|
| 1 | Q1 | IMPLEMENTADA | — | React Flow confirmado como biblioteca de canvas | UX-005, mod.md |
| 2 | Q2 | IMPLEMENTADA | — | JSON rule engine marcado como futuro (campo nullable) | DATA-005 §2.7 |
| 3 | Q3 | IMPLEMENTADA | — | API sincrona GET /internal/instances/count-active (timeout 3s, fail-safe 503) | INT-005 §4.1, ADR-002 |
| 4 | Q4 | IMPLEMENTADA | — | 4 scopes process:cycle:* registrados em DOC-FND-000 v1.1.0 | DOC-FND-000 §2.2 |
| 5 | Q5 | IMPLEMENTADA | — | Opcao B — campo denormalizado cycle_id + partial unique index | ADR-001, DATA-005 §2.3 |
| 6 | Q6 | IMPLEMENTADA | — | Contagem correta: 25 endpoints (corrigido mod.md e INT-005) | INT-005 §1, mod.md |
| 7 | Q7 | IMPLEMENTADA | MEDIA | Opcao A — 10 eventos UPDATE/DELETE adicionados ao DATA-003 | DATA-003 v0.4.0, SEC-002 v0.4.0 |
| 8 | Q8 | IMPLEMENTADA | BAIXA | Opcao A — DELETE /admin/process-roles/:id adicionado | INT-005 §1.7 |
| 9 | Q9 | IMPLEMENTADA | BAIXA | Opcao A — ADR-002 status: proposed → accepted | ADR-002.md |

> Detalhes completos: requirements/pen-005-pendente.md

---

### Fase 3: Validacao — CONCLUIDA

O `/validate-all` foi executado em 2026-03-22 com resultado PASS: 29/29 manifests validos em todos os pilares. Os 2 screen manifests proprios do MOD-005 (ux-proc-001, ux-proc-002) passaram na validacao contra schema v1. Nenhuma pendencia adicional identificada. Fase 3 CONCLUIDA.

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
5    /validate-all docs/04_modules/mod-005-modelagem-processos/
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
5a   /qa docs/04_modules/mod-005-modelagem-processos/
                           Diagnostico de sintaxe e integridade:              PASS
                           - lint:docs (Pass A-E: EX-*, §N, IDs, context-map, ciclos)
                           - Consistencia de metadados (estado_item, owner)
                           - Dead links, DoR alignment

5b   /validate-manifest ux-proc-001.editor-visual.yaml
                           Validar manifests contra schema v1:               PASS
                           - ux-proc-001.editor-visual.yaml
                           - ux-proc-002.config-estagio.yaml
                           Verifica: DOC-UX-010, operationId, RBAC,
                           telemetria, permissions

5c   /validate-openapi                                                       FUTURO (pos-codigo)
5d   /validate-drizzle                                                       FUTURO (pos-codigo)
5e   /validate-endpoint                                                      FUTURO (pos-codigo)
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | `/qa` | SIM (todos) | SIM — PASS | mod-005-modelagem-processos.md, requirements/*, adr/*, CHANGELOG.md |
| 2 | `/validate-manifest` | SIM (2 manifests existem) | SIM — PASS | ux-proc-001.editor-visual, ux-proc-002.config-estagio |
| 3 | `/validate-openapi` | SIM (Nivel 2) | FUTURO (pos-codigo) | apps/api/openapi/mod-005-modelagem-processos.yaml — nao existe ainda |
| 4 | `/validate-drizzle` | SIM (Nivel 2) | FUTURO (pos-codigo) | apps/api/src/modules/process-modeling/domain/ — nao existe |
| 5 | `/validate-endpoint` | SIM (Nivel 2) | FUTURO (pos-codigo) | apps/api/src/modules/process-modeling/presentation/routes/ — nao existe |

### Fase 4: Promocao — PENDENTE

```
10   /promote-module docs/04_modules/mod-005-modelagem-processos/
                           Selar mod-005 como READY:                         A EXECUTAR
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (9/9 IMPLEMENTADA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (10/10)
                             [DoR-3] Zero erros de lint? ................ SIM (validate-all 2026-03-22 PASS)
                             [DoR-4] Screen manifests validados? ........ SIM (2/2 manifests PASS)
                             [DoR-5] ADRs conforme nivel? ............... SIM (4 >= 3 para N2)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v0.17.0)
                             [DoR-7] Bloqueios cross-modulo? ............ ATENCAO (BLK-003 recebido de MOD-004)

                           Fluxo interno:
                             Step 1: /qa (pre-check)
                             Step 2: Promover estado_item DRAFT→READY
                             Step 3: /qa (pos-check)
                             Step 4: /update-index
                             Step 5: /git commit
                           Pre-condicao: QA verde, DoR-1..7 atendidos
                           Pos-condicao: estado_item = READY, INDEX.md atualizado, commit
```

> **Nota sobre BLK-003:** MOD-005 recebe bloqueio BLK-003 (depende de `org_scopes` de MOD-004 para filtering de processos). Isso afeta a **implementacao de codigo**, nao a promocao de especificacao. O DoR avalia completude da especificacao, nao a viabilidade de deploy. MOD-005 pode ser promovido a READY independentemente do estado do MOD-004 — mas a geracao de codigo requer MOD-000 → MOD-003 → MOD-004 → MOD-005 sequencial.

#### Bloqueadores para Promocao

1. **BLK-003 (MOD-004 → MOD-005):** `org_scopes` para filtering precisam existir. Impacto: implementacao de codigo, nao especificacao. MOD-004 ainda DRAFT.
2. **CHANGELOG Mermaid:** Pipeline Mermaid mostra Etapa 5 (aguardando selo READY), que reflete corretamente o estado pos-validacao.

### Fase 5: Pos-READY (quando necessario)

```
11   /update-specification docs/04_modules/mod-005-modelagem-processos/requirements/fr/FR-005.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

12   /create-amendment FR-005 melhoria "descricao"
                           Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
                           Casos de uso previstos:
                           - JSON rule engine para condicoes de transicao
                           - Novos tipos de gate alem dos 4 iniciais
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
                           Estado atual MOD-005:
                             PEN-005: 9 itens total
                               9 IMPLEMENTADA (Q1-Q9)
                               0 ABERTA
                             SLA: nenhum vencido
```

#### Painel de Pendencias — Resumo Compacto

| # | ID | Status | Sev. | Decisao (1 linha) | Artefato |
|---|---|---|---|---|---|
| 1 | Q1 | IMPLEMENTADA | — | React Flow confirmado como biblioteca canvas | UX-005 |
| 2 | Q2 | IMPLEMENTADA | — | JSON rule engine marcado futuro | DATA-005 §2.7 |
| 3 | Q3 | IMPLEMENTADA | — | API sincrona GET /internal/instances/count-active | INT-005 §4.1, ADR-002 |
| 4 | Q4 | IMPLEMENTADA | — | 4 scopes process:cycle:* em DOC-FND-000 v1.1.0 | DOC-FND-000 §2.2 |
| 5 | Q5 | IMPLEMENTADA | — | cycle_id denormalizado + partial unique index | ADR-001, DATA-005 |
| 6 | Q6 | IMPLEMENTADA | — | Contagem correta: 25 endpoints | INT-005, mod.md |
| 7 | Q7 | IMPLEMENTADA | MEDIA | 10 eventos UPDATE/DELETE no DATA-003 | DATA-003 v0.4.0 |
| 8 | Q8 | IMPLEMENTADA | BAIXA | DELETE /admin/process-roles/:id adicionado | INT-005 §1.7 |
| 9 | Q9 | IMPLEMENTADA | BAIXA | ADR-002 status → accepted | ADR-002.md |

> Detalhes completos: requirements/pen-005-pendente.md

### Utilitarios (qualquer momento)

```
14   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-005): <descricao>

15   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

17   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-005

```
US-MOD-005 (READY v1.2.0)              ← Fase 0: CONCLUIDA
  │  4/4 features READY (2 backend + 2 UX)
  │  Nivel 2 — DDD-lite + Full Clean (score 5/6)
  ▼
mod-005-modelagem-processos/ (stubs DRAFT) ← Fase 1: CONCLUIDA (forge-module v0.1.0)
  │
  ▼
mod-005 enriquecido (DRAFT v0.17.0)    ← Fase 2: CONCLUIDA (11 runs, 9 questoes resolvidas)
  │
  ▼
mod-005 validado (DRAFT)                ← Fase 3: CONCLUIDA (validate-all 2026-03-22 PASS, 29/29)
  │  ├── /qa .................. PASS
  │  ├── /validate-manifest ... PASS (2 manifests)
  │  ├── /validate-openapi .... FUTURO (pos-codigo)
  │  ├── /validate-drizzle .... FUTURO (pos-codigo)
  │  └── /validate-endpoint ... FUTURO (pos-codigo)
  │
  ├── ★ PROXIMO PASSO: executar /promote-module
  ├── Gate 0 (DoR): 6/7 atendidos, 1 ATENCAO (BLK-003 — nao bloqueia spec)
  │
  ▼
mod-005 selado (READY)                  ← Fase 4: A EXECUTAR
  │
  ▼
mod-005 + amendments/                   ← Fase 5: SOB DEMANDA (0 amendments)

Dependencias upstream: MOD-000 (Foundation) + MOD-003 (Estrutura Org) + MOD-004 (Identidade Avancada)
Camada topologica: 3 (implementar apos MOD-000 → MOD-003 → MOD-004)
Dependentes downstream: MOD-006 (Execucao de Casos), MOD-007 (Parametrizacao)
Bloqueio recebido: BLK-003 — org_scopes de MOD-004 para filtering (implementacao, nao spec)
Bloqueio emitido: BLK-002 — MOD-006 depende de blueprints + cycle_version_id freeze
```

---

## Particularidades do MOD-005

| Aspecto | Detalhe |
|---------|---------|
| Modulo-molde da cadeia de processos | MOD-005 e o "molde" e MOD-006 e o "produto moldado". A separacao Blueprint vs Execucao e principio fundamental do sistema. Blueprints publicados sao imutaveis — qualquer mudanca requer fork criando nova versao. Instancias no MOD-006 referenciam `cycle_version_id` (nao `cycle_id`), garantindo leitura historica. |
| Enriquecimento mais intenso do projeto | Com 17 versoes no CHANGELOG e 9 questoes resolvidas, MOD-005 teve o enriquecimento mais complexo. 5 agentes precisaram de re-enriquecimento (AGN-DEV-01, 02, 03, 09, 10) apos questoes interdependentes serem identificadas. Isso reflete a riqueza do dominio: 7 tabelas, 26 endpoints, 19 domain events, fork atomico. |
| Fork atomico com remapeamento de UUIDs | ADR-003 define fork de ciclo publicado como transacao unica que copia 7 tabelas com novos UUIDs e causation_id para rastreabilidade. E a operacao mais complexa do modulo e justifica Nivel 2 por si so. |
| BLK-003 recebido de MOD-004 | MOD-005 depende de `org_scopes` de MOD-004 para filtering de processos por area organizacional. Este bloqueio afeta a implementacao de codigo mas nao impede a promocao da especificacao para READY. |
| Editor visual com React Flow | UX-PROC-001 usa React Flow como biblioteca de canvas com nodos customizados, swimlanes por macroetapa, mini-mapa obrigatorio a partir de 15 nos, e sincronizacao bidirecional com UX-PROC-002 (configurador de estagio). |
| 4 ADRs cobrindo decisoes nao-obvias | ADR-001 (is_initial unique via campo denormalizado), ADR-002 (fail-safe integracao MOD-006 com 503), ADR-003 (fork atomico transacao unica), ADR-004 (optimistic locking via updated_at). Cada ADR resolve um problema arquitetural especifico do dominio de processos. |

---

## Checklist Rapido — O que Falta para READY

- [x] Enriquecimento completo (11 runs, 9 questoes resolvidas)
- [x] Executar `/validate-all` — /qa + /validate-manifest PASS (2026-03-22)
- [ ] Executar `/promote-module docs/04_modules/mod-005-modelagem-processos/` — verificar Gate 0 (DoR)

> **Nota:** Todas as 9 questoes estao IMPLEMENTADA. Os 10 artefatos de requisitos estao enriquecidos e validados. As 4 ADRs atendem o minimo para Nivel 2. Nao ha pendencias abertas. O BLK-003 (MOD-004 → MOD-005) afeta implementacao de codigo, nao promocao de especificacao. A promocao do MOD-005 desbloqueia BLK-002 e habilita MOD-006 (Execucao de Casos) a avancar. Rota sequencial ideal: MOD-000 → MOD-003 → MOD-004 → MOD-005.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 3.0.0 | 2026-03-23 | Recriacao: Fase 3 CONCLUIDA (validate-all 2026-03-22 PASS 29/29 manifests). Fase 4 PENDENTE. DoR Gate 0 6/7 (BLK-003 nao bloqueia spec). Pendencias compactadas (referencia pen file). Proximo passo: /promote-module |
| 2.0.0 | 2026-03-22 | Reescrita completa no formato padrao: detalhamento completo das 9 pendentes (Q1-Q9) com questao, opcoes, resolucao, rastreio de agentes, mapa de cobertura de validadores, particularidades, resumo visual |
| 1.1.0 | 2026-03-21 | Reescrita formato hibrido: PASSOs numerados, decision trees padrao, gestao de pendencias completa (SLA/ciclo de vida), rastreio de agentes, painel de pendencias individual, bloqueadores explicitos, resumo visual vertical, notas contextuais |
| 1.0.0 | 2026-03-21 | Criacao inicial — diagnostico Fase 2 concluida (11 agentes, 9 pendentes, Mermaid Etapa 5). Nivel 2 DDD-lite com BLK-003 |
