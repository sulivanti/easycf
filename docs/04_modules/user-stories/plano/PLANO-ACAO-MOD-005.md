# Procedimento — Plano de Acao MOD-005 Modelagem de Processos (Blueprint)

> **Versao:** 2.0.0 | **Data:** 2026-03-22 | **Owner:** Marcos Sulivan
> **Estado atual do modulo:** DRAFT (v0.17.0) | **Epico:** READY (v1.2.0) | **Features:** 4/4 READY
>
> Fases 0-2 concluidas. Proximo passo: Fase 3 (Validacao) — executar `/validate-all`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-005 | READY (v1.2.0) | DoR completo, 4 features vinculadas, separacao Blueprint vs Execucao formalizada |
| Features F01-F04 | 4/4 READY | F01 (API Ciclos+Macroetapas+Estagios), F02 (API Gates+Papeis+Transicoes), F03 (UX Editor Visual), F04 (UX Configurador Estagio) |
| Scaffold (forge-module) | CONCLUIDO | mod-005-modelagem-processos/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | Agentes 01-10 confirmados, v0.17.0, 9 pendentes resolvidas |
| PENDENTEs | 0 abertas | 9 total: 6 RESOLVIDA + 3 IMPLEMENTADA |
| ADRs | 4 aceitas | Nivel 2 requer minimo 3 — atendido (ADR-001 cycle_id denormalizado, ADR-002 fail-safe MOD-006, ADR-003 fork atomico, ADR-004 optimistic locking) |
| Amendments | 0 | Nenhum |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v0.17.0 | Ultima entrada 2026-03-17 (Etapa 5 pipeline) |
| Screen Manifests | 2/2 existem | ux-proc-001.editor-visual, ux-proc-002.config-estagio |
| Dependencias | 3 upstream (MOD-000, MOD-003, MOD-004) | Consome Foundation core, org_unit_id, org_scopes |
| Bloqueios | 1 (BLK-003) | MOD-005 bloqueado por MOD-004 (org_scopes para filtering) — PENDENTE |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-005 define a camada de **modelagem de processos** (blueprint) — o molde reutilizavel que MOD-006 (Execucao) instanciara. Separacao Blueprint vs Execucao e a decisao arquitetural central do sistema de processos. Modelo de 7 tabelas com versionamento imutavel de ciclos publicados, grafo de transicoes com condicoes e evidencias, e catalogo global de papeis de processo.

```
1    (manual)              Revisar e finalizar epico US-MOD-005:             CONCLUIDO
                           - Escopo fechado (4 features)                    status_agil = READY
                           - Gherkin validado (imutabilidade, transicao,    v1.2.0
                             gates, delecao protegida)
                           - DoR completo (7 tabelas, 26 endpoints,
                             19 domain events, owner, separacao MOD-005/006)
                           - Separacao Blueprint (MOD-005) vs Execucao (MOD-006) formalizada
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-005.md

2    (manual)              Revisar e finalizar features F01-F04:             CONCLUIDO
                           - F01: API Ciclos + Macroetapas + Estagios       4/4 READY
                           - F02: API Gates + Papeis + Transicoes
                           - F03: UX Editor Visual de Fluxo (UX-PROC-001)
                           - F04: UX Configurador de Estagio (UX-PROC-002)
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-005-F{01..04}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Modulo full-stack Nivel 2 (DDD-lite + Full Clean). Scaffoldado em 2026-03-16 com stubs obrigatorios DATA-003 e SEC-002. Backend (API de blueprints) e frontend (editor visual + configurador de estagio).

```
3    /forge-module MOD-005  Scaffold completo gerado:                        CONCLUIDO
                           mod-005-modelagem-processos.md, CHANGELOG.md,    v0.1.0 (2026-03-16)
                           requirements/ (br/, fr/, data/, int/, sec/,
                           ux/, nfr/), adr/, amendments/
                           Stubs obrigatorios: DATA-003, SEC-002
                           Pasta: docs/04_modules/mod-005-modelagem-processos/
```

### Fase 2: Enriquecimento — CONCLUIDO

O enriquecimento do MOD-005 foi completo — todos os agentes rodaram entre 2026-03-16 e 2026-03-18 com multiplos passes de re-enriquecimento (v0.2.0 ate v0.17.0). MOD-005 e o modulo com maior volume de especificacao do projeto — 7 tabelas, 26 endpoints, 19 domain events, 13 FRs, 12 BRs — o que exigiu varios ciclos de refinamento. Durante o processo, 9 pendencias foram identificadas e todas resolvidas.

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
                           AGN-DEV-01 (MOD), AGN-DEV-02 (BR),              v0.17.0 (2026-03-17)
                           AGN-DEV-03 (FR), AGN-DEV-04 (DATA),
                           AGN-DEV-05 (INT), AGN-DEV-06 (SEC),
                           AGN-DEV-07 (UX), AGN-DEV-08 (NFR),
                           AGN-DEV-09 (ADR), AGN-DEV-10 (PEN)
                           9 pendentes criadas e resolvidas (Q1-Q9)
                           Re-enriquecimento: v0.13.0 a v0.17.0 (multiplos passes)
```

#### Rastreio de Agentes — MOD-005

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-005-modelagem-processos.md | CONCLUIDO | v0.2.0 + v0.13.0 — Nivel 2 confirmado (score 5/6), rastreia_para inclui DOC-ESC-001, summary atualizado |
| 2 | AGN-DEV-02 | BR | BR-005.md | CONCLUIDO | v0.3.0 + v0.14.0 — 12 regras de negocio (BR-001 a BR-012), BR-011 depreciacao, BR-012 reordenacao |
| 3 | AGN-DEV-03 | FR | FR-005.md | CONCLUIDO | v0.9.0 + v0.15.0 — 13 FRs com Gherkin expandido, dependencias BR-011/BR-012 incorporadas |
| 4 | AGN-DEV-04 | DATA | DATA-005.md, DATA-003.md | CONCLUIDO | DATA-005 v0.4.0 (7 tabelas, /flow SLA), DATA-003 v0.5.0 (19 domain events, outbox, UIActionEnvelope) |
| 5 | AGN-DEV-05 | INT | INT-005.md | CONCLUIDO | v0.5.0 — 26 endpoints documentados, RFC 9457, integracao MOD-006, 4 escopos RBAC |
| 6 | AGN-DEV-06 | SEC | SEC-005.md, SEC-002.md | CONCLUIDO | SEC-005 v0.6.0 (11 secoes, LGPD), SEC-002 v0.5.0 (matriz autorização 19 eventos) |
| 7 | AGN-DEV-07 | UX | UX-005.md | CONCLUIDO | v0.7.0 — editor visual + configurador, 18 acoes UX-010, sincronizacao bidirecional |
| 8 | AGN-DEV-08 | NFR | NFR-005.md | CONCLUIDO | v0.10.0 — SLOs (/flow <200ms, fork <2s), 9 limites de capacidade, 5 pilares observabilidade |
| 9 | AGN-DEV-09 | ADR | ADR-001, ADR-002, ADR-003, ADR-004 | CONCLUIDO | v0.8.0 + v0.16.0 — 4 ADRs criadas e aceitas |
| 10 | AGN-DEV-10 | PEN | pen-005-pendente.md | CONCLUIDO | v0.11.0 + v0.17.0 — 9 pendentes criadas e resolvidas |

#### Pendentes Resolvidas no Enriquecimento — Detalhamento Completo

> As 9 pendencias abaixo foram identificadas durante o enriquecimento e todas foram decididas e implementadas entre 2026-03-17 e 2026-03-18.

---

##### ~~Q1 — Biblioteca de canvas para editor visual (F03)~~

- **status:** RESOLVIDA
- **severidade:** MEDIA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-16
- **criado_por:** AGN-DEV-10
- **rastreia_para:** UX-005, mod-005-modelagem-processos.md
- **tags:** canvas, react-flow, editor-visual
- **dependencias:** []

**Questao:**
React Flow confirmado ou ha alternativas em avaliacao para o editor visual de blueprints (UX-PROC-001)?

**Resolucao:**

> **Decisao:** React Flow selecionado como biblioteca de canvas (US-MOD-005-F03 §6 DoR: "Biblioteca de canvas selecionada (React Flow ou similar)"). Estrutura de componentes detalhada em UX-005 §2.5 e mod.md (structure Web).
> **Artefato de saida:** UX-005, mod.md §3 (estrutura)

---

##### ~~Q2 — JSON rule engine para campo `condicao` em transicoes~~

- **status:** RESOLVIDA
- **severidade:** MEDIA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-16
- **criado_por:** AGN-DEV-10
- **rastreia_para:** DATA-005, US-MOD-005
- **tags:** rule-engine, condicao, transicao
- **dependencias:** []

**Questao:**
Qual engine sera adotada para o campo `condicao` (JSON rule engine) em transicoes de estagio?

**Resolucao:**

> **Decisao:** Marcado como "futura" no modelo de dados (DATA-005 §2.7: `condicao text nullable — Expressao de condicao — futura JSON rule engine`). Campo existe na tabela mas engine nao e necessaria para o MVP. Decisao adiada para quando MOD-006 implementar avaliacao de condicoes.
> **Artefato de saida:** DATA-005 §2.7, US-MOD-005 §10

---

##### ~~Q3 — Integracao com MOD-006 para validacao de delecao~~

- **status:** RESOLVIDA
- **severidade:** ALTA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-16
- **criado_por:** AGN-DEV-10
- **rastreia_para:** INT-005, ADR-002, SEC-005
- **tags:** mod-006, delecao-protegida, fail-safe
- **dependencias:** []

**Questao:**
Integracao MOD-005 com MOD-006 para validacao de delecao de estagios — API sincrona ou event-driven? Qual endpoint do MOD-006 sera consultado?

**Resolucao:**

> **Decisao:** API sincrona. Endpoint: `GET /internal/instances/count-active?stage_id={uuid}`. Timeout 3s, 1 retry. Fail-safe: bloquear delecao com 503 quando MOD-006 indisponivel (ADR-002).
> **Artefato de saida:** INT-005 §4.1, ADR-002 (accepted), SEC-005 §10

---

##### ~~Q4 — Amendment MOD-000-F12 para registro de scopes~~

- **status:** RESOLVIDA
- **severidade:** MEDIA
- **dominio:** ARC
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **rastreia_para:** DOC-FND-000, US-MOD-005
- **tags:** scopes, rbac, foundation
- **dependencias:** []

**Questao:**
Os 4 scopes `process:cycle:read/write/publish/delete` devem ser registrados no catalogo canonico de permissoes do Foundation (DOC-FND-000 §2). Como proceder?

**Resolucao:**

> **Decisao:** Scopes adicionados diretamente ao DOC-FND-000 §2.2 (v1.0.0 → v1.1.0) com bump de versao e CHANGELOG. Gate CI (DOC-ARC-003B) agora reconhece os 4 scopes.
> **Artefato de saida:** DOC-FND-000 v1.1.0 §2.2

---

##### ~~Q5 — Estrategia de is_initial unique (ADR-001)~~

- **status:** RESOLVIDA
- **severidade:** ALTA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-17
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** B
- **rastreia_para:** ADR-001, DATA-005, BR-002, BR-008
- **tags:** is-initial, unique, trigger, denormalizacao
- **dependencias:** []

**Questao:**
Trigger BEFORE INSERT/UPDATE vs. campo denormalizado `cycle_id` para garantir is_initial unico por ciclo.

**Opcao A — Trigger BEFORE INSERT/UPDATE:**
Validacao de unicidade via trigger PL/pgSQL. Sem denormalizacao.

- Pros: Modelo limpo sem denormalizacao
- Contras: Trigger oculta logica de validacao; complexidade no fork

**Opcao B — Campo denormalizado `cycle_id` em `process_stages`:**
Partial unique index nativo `UNIQUE(cycle_id) WHERE is_initial=true AND deleted_at IS NULL`.

- Pros: Constraint nativo; simplifica BR-008 (cross-ciclo); fork natural
- Contras: Denormalizacao (risco mitigado — relacao imutavel)

**Recomendacao:** Opcao B — partial unique index nativo com campo denormalizado.

**Resolucao:**

> **Decisao:** Opcao B — Campo denormalizado `cycle_id` em `process_stages` com partial unique index
> **Decidido por:** Marcos Sulivan em 2026-03-17
> **Justificativa:** `cycle_id` e derivavel e estavel — estagio nunca muda de macroetapa/ciclo. Partial unique index nativo do PostgreSQL garante BR-002 no nivel de banco. Beneficio colateral: simplifica validacao de transicao cross-ciclo (BR-008) e query /flow (FR-011).
> **Artefato de saida:** ADR-001 (accepted), DATA-005 §2.3 (novo campo + partial unique index + trigger minimo)
> **Implementado em:** 2026-03-17

---

##### ~~Q6 — Contagem de endpoints: 23 vs 25~~

- **status:** RESOLVIDA
- **severidade:** BAIXA
- **dominio:** INT
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **rastreia_para:** INT-005, mod-005-modelagem-processos.md
- **tags:** endpoints, contagem, consolidacao
- **dependencias:** []

**Questao:**
O epico diz "23 endpoints" mas INT-005 documenta 25. Qual contagem esta correta?

**Resolucao:**

> **Decisao:** Contagem correta e **25** (posteriormente 26 apos Q8). Corrigido em: mod.md, INT-005, CHANGELOG. O catalogo de papeis tem 3 endpoints (list/create/update), nao 1.
> **Artefato de saida:** INT-005 §1, mod.md §3, CHANGELOG v0.1.0

---

##### ~~Q7 — Domain Events para operacoes de UPDATE e DELETE~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** DATA
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **rastreia_para:** DATA-003, SEC-002, DOC-ARC-003
- **tags:** events, auditoria, timeline
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A

**Questao:**
O catalogo DATA-003 define apenas eventos de criacao (`_created`, `_linked`). Nao ha eventos para operacoes de UPDATE (ex: `process.cycle_updated`, `process.stage_updated`) nem DELETE (ex: `process.stage_deleted`). A timeline de auditoria fica incompleta sem esses eventos. Esta omissao e intencional (escopo MVP) ou uma lacuna?

**Impacto:**
Sem eventos de update/delete, a timeline do ciclo mostra apenas criacoes. Alteracoes de nome, reordenacao de estagios, remocao de gates e soft-deletes nao sao rastreados na tabela `domain_events`. Isso compromete o pilar de auditoria (DOC-ARC-003 Dogma 6: "tabela domain_events e a unica fonte para auditoria/timeline").

**Opcao A — Adicionar eventos de UPDATE e DELETE ao DATA-003:**
Expandir o catalogo com ~9 eventos adicionais (cycle_updated, stage_updated, stage_deleted, gate_updated, gate_deleted, macro_stage_updated, macro_stage_deleted, transition_deleted, role_unlinked).

- Pros: Timeline completa; auditoria plena; consistencia com Dogma 6
- Contras: Mais eventos a emitir; maior volume na tabela domain_events

**Opcao B — Manter apenas eventos de criacao (MVP):**
Adiar eventos de update/delete para fase posterior.

- Pros: Menos complexidade no MVP; volume menor
- Contras: Timeline incompleta; auditoria parcial; pode violar Dogma 6 da DOC-ARC-003

**Recomendacao:** Opcao A — completar o catalogo. O Dogma 6 da DOC-ARC-003 e explicito: "tabela domain_events e a unica fonte para auditoria/timeline". Sem eventos de update/delete, a auditoria e incompleta por design.

**Resolucao:**

> **Decisao:** Opcao A — Adicionar eventos de UPDATE e DELETE ao DATA-003
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** Dogma 6 (DOC-ARC-003): "tabela domain_events e a unica fonte para auditoria/timeline". Sem eventos UPDATE/DELETE a auditoria e incompleta por design. Opcao B violaria dogma arquitetural.
> **Artefato de saida:** DATA-003 v0.4.0 (10 eventos UPDATE/DELETE), SEC-002 v0.4.0 (matriz atualizada), mod.md (9→19 events)
> **Implementado em:** 2026-03-18

---

##### ~~Q8 — Endpoint DELETE para process_roles ausente~~

- **status:** IMPLEMENTADA
- **severidade:** BAIXA
- **dominio:** INT
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **rastreia_para:** INT-005, FR-008, DATA-005
- **tags:** api, endpoint, roles
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A

**Questao:**
INT-005 §1.7 define 3 endpoints para o catalogo de papeis (list/create/update) mas nenhum DELETE. DATA-005 §2.8 documenta que `process_roles` tem soft delete com RESTRICT (papel com vinculos ativos nao pode ser deletado). FR-008 tambem nao menciona DELETE. Um papel de processo criado erroneamente nao pode ser removido?

**Impacto:**
Administradores nao conseguem desativar papeis obsoletos do catalogo global. Sem DELETE, o catalogo so cresce — papeis antigos poluem o autocomplete de vinculacao (UX-005 §3.3 Aba Papeis).

**Opcao A — Adicionar DELETE /admin/process-roles/:id:**
Endpoint de soft delete com validacao: papel com `stage_role_links` ativos retorna 422.

- Pros: Catalogo gerenciavel; consistencia com padrao CRUD
- Contras: +1 endpoint (26 total); validacao de vinculos necessaria

**Opcao B — Manter sem DELETE (catalogo append-only):**
Papeis obsoletos nao sao removidos, apenas ignorados.

- Pros: Simplicidade; sem risco de remover papel referenciado
- Contras: Catalogo cresce indefinidamente; UX degradada

**Recomendacao:** Opcao A — adicionar DELETE com protecao de vinculos. O catalogo precisa ser gerenciavel. O padrao de soft delete + RESTRICT ja esta documentado em DATA-005 §2.8.

**Resolucao:**

> **Decisao:** Opcao A — Adicionar DELETE /admin/process-roles/:id
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** O catalogo de papeis precisa ser gerenciavel. O padrao de soft delete + RESTRICT ja esta documentado em DATA-005 §2.8. Sem DELETE, papeis obsoletos poluem o autocomplete indefinidamente.
> **Artefato de saida:** INT-005 §1.7 endpoint #26, §2.1 erro RESTRICT (role), §5 scope delete
> **Implementado em:** 2026-03-18

---

##### ~~Q9 — ADR-002 permanece com status "proposed"~~

- **status:** IMPLEMENTADA
- **severidade:** BAIXA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **rastreia_para:** ADR-002, INT-005, SEC-005
- **tags:** adr, governance
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A

**Questao:**
A ADR-002 (estrategia fail-safe para integracao MOD-005 → MOD-006) ainda tem `status: proposed`. Todos os artefatos do modulo (INT-005 §4.1, SEC-005 §10, NFR-005 §2) ja referenciam e implementam a decisao como se fosse aceita. Falta a aceitacao formal.

**Impacto:**
Baixo impacto pratico (a decisao ja esta implementada nos artefatos), mas cria inconsistencia de governanca: uma ADR "proposed" que na pratica ja e "accepted".

**Opcao A — Aceitar ADR-002 formalmente:**
Alterar status para `accepted` no arquivo ADR-002.md.

- Pros: Consistencia; governanca correta
- Contras: Nenhum

**Opcao B — Manter como proposed:**
Aguardar revisao formal do comite.

- Pros: Processo de aprovacao respeitado
- Contras: Inconsistencia com artefatos que ja implementam a decisao

**Recomendacao:** Opcao A — aceitar formalmente. A decisao ja esta consolidada em todos os artefatos dependentes.

**Resolucao:**

> **Decisao:** Opcao A — Aceitar ADR-002 formalmente
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** A decisao ja esta consolidada em todos os artefatos dependentes (INT-005 §4.1, SEC-005 §10, NFR-005 §2). Manter como "proposed" cria inconsistencia de governanca.
> **Artefato de saida:** ADR-002.md (status: proposed → accepted)
> **Implementado em:** 2026-03-18

---

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

```
5    /validate-all docs/04_modules/mod-005-modelagem-processos/
                           Orquestra TODAS as validacoes em sequencia:        A EXECUTAR
                           Internamente executa:
                             1. /qa (lint, links, metadados, EX-*, §N, ciclos)
                             2. /validate-manifest (screen manifests vs schema v1)
                             3. /validate-openapi → N/A (artefato ausente)
                             4. /validate-drizzle → N/A (artefato ausente)
                             5. /validate-endpoint → N/A (artefato ausente)
                           Skills 3-5 sao aplicaveis (Nivel 2 full-stack) mas
                           artefatos de codigo nao existem ainda — /validate-all
                           pula o validador e reporta "N/A — artefato ausente".
                           Pre-condicao: Enriquecimento concluido
                           Pos-condicao: Relatorio consolidado pass/fail
```

> **Alternativa:** Executar validadores individuais:

```
5a   /qa docs/04_modules/mod-005-modelagem-processos/
                           Diagnostico de sintaxe e integridade:              INDIVIDUAL
                           - lint:docs (Pass A-E: EX-*, §N, IDs, context-map, ciclos)
                           - Consistencia de metadados (estado_item, owner)
                           - Dead links, DoR alignment
                           - Atencao especial: 13 FRs e 12 BRs — volume alto de cross-refs

5b   /validate-manifest ux-proc-001.editor-visual.yaml
                           Validar manifests contra schema v1:               INDIVIDUAL
                           - ux-proc-001.editor-visual.yaml (editor visual)
                           - ux-proc-002.config-estagio.yaml (configurador)
                           Verifica: DOC-UX-010 (18 acoes), operationId, RBAC
                           (process:cycle:read/write/publish/delete),
                           telemetria, linked_stories referenciando US-MOD-005

5c   /validate-openapi                                                       N/A (pos-codigo)
5d   /validate-drizzle                                                       N/A (pos-codigo)
5e   /validate-endpoint                                                      N/A (pos-codigo)
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | `/qa` | SIM (todos) | SIM | mod-005-modelagem-processos.md, requirements/*, adr/*, CHANGELOG.md |
| 2 | `/validate-manifest` | SIM (2 manifests existem) | SIM | ux-proc-001.editor-visual, ux-proc-002.config-estagio |
| 3 | `/validate-openapi` | SIM (Nivel 2) | NAO (pos-codigo) | apps/api/openapi/mod-005-modelagem-processos.yaml — nao existe ainda |
| 4 | `/validate-drizzle` | SIM (Nivel 2) | NAO (pos-codigo) | apps/api/src/modules/process-modeling/schema.ts — nao existe |
| 5 | `/validate-endpoint` | SIM (Nivel 2) | NAO (pos-codigo) | apps/api/src/modules/process-modeling/routes/ — nao existe |

### Fase 4: Promocao — PENDENTE

```
10   /promote-module docs/04_modules/mod-005-modelagem-processos/
                           Selar mod-005 como READY:                         A EXECUTAR (apos fase 3)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (9/9 resolvidas)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (10/10)
                             [DoR-3] Zero erros de lint? ................ A VERIFICAR (executar /qa)
                             [DoR-4] Screen manifests validados? ........ A VERIFICAR (executar /validate-manifest)
                             [DoR-5] ADRs conforme nivel? ............... SIM (4 >= 3 para N2)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v0.17.0)
                             [DoR-7] Bloqueios cross-modulo? ............ ATENCAO (BLK-003 — nao impede promocao da spec)

                           Fluxo interno:
                             Step 1: /qa (pre-check)
                             Step 2: Promover estado_item DRAFT→READY
                             Step 3: /qa (pos-check)
                             Step 4: /update-index
                             Step 5: /git commit
                           Pre-condicao: QA verde, DoR-1..7 atendidos
                           Pos-condicao: estado_item = READY, INDEX.md atualizado, commit
```

> **Nota:** MOD-005 depende de MOD-000 (Foundation), MOD-003 (Estrutura Organizacional) e MOD-004 (Identidade Avancada). A promocao da **especificacao** pode ocorrer independentemente — o DoR nao exige que dependencias upstream estejam READY (apenas que existam). Porem, o codigo so pode ser gerado quando as 3 dependencias upstream estiverem implementadas. BLK-003 (org_scopes do MOD-004) nao impede a promocao, apenas a implementacao.

### Fase 5: Pos-READY (quando necessario)

```
11   /update-specification docs/04_modules/mod-005-modelagem-processos/requirements/fr/FR-005.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

12   /create-amendment FR-005 melhoria "adicionar campo X"
                           Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
                           Ex: BR-005-M01.md (melhoria)
                           Ex: SEC-005-C01.md (correcao)

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
                           Estado atual MOD-005:
                             PEN-005: 9 itens total
                               6 RESOLVIDA (Q1-Q6)
                               3 IMPLEMENTADA (Q7-Q9)
                               0 ABERTA
                             SLA: nenhum vencido
```

#### Painel de Pendencias — Resumo Individual

| PENDENTE | Status | Sev. | Dominio | Decisao | Artefato de saida |
|----------|--------|------|---------|---------|-------------------|
| Q1 | RESOLVIDA | MEDIA | ARC | React Flow confirmado como biblioteca de canvas | UX-005, mod.md |
| Q2 | RESOLVIDA | MEDIA | ARC | JSON rule engine adiada para MVP, campo existe como nullable | DATA-005 |
| Q3 | RESOLVIDA | ALTA | ARC | API sincrona, fail-safe bloqueia delecao (503) | INT-005, ADR-002 |
| Q4 | RESOLVIDA | MEDIA | ARC | Scopes adicionados ao DOC-FND-000 v1.1.0 | DOC-FND-000 |
| Q5 | RESOLVIDA | ALTA | ARC | Opcao B — cycle_id denormalizado + partial unique index | ADR-001, DATA-005 |
| Q6 | RESOLVIDA | BAIXA | INT | Contagem correta: 26 endpoints | INT-005, mod.md |
| Q7 | IMPLEMENTADA | MEDIA | DATA | Opcao A — 10 eventos UPDATE/DELETE adicionados | DATA-003, SEC-002 |
| Q8 | IMPLEMENTADA | BAIXA | INT | Opcao A — DELETE /admin/process-roles/:id adicionado | INT-005 |
| Q9 | IMPLEMENTADA | BAIXA | ARC | Opcao A — ADR-002 status proposed → accepted | ADR-002 |

> Detalhamento completo: ver [Fase 2](#pendentes-resolvidas-no-enriquecimento--detalhamento-completo).

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
  ▼
mod-005-modelagem-processos/            ← Fase 1: CONCLUIDA (forge-module v0.1.0)
  │  (stubs DRAFT)
  ▼
mod-005 enriquecido (DRAFT v0.17.0)     ← Fase 2: CONCLUIDA (11 agentes, 9 PENDENTEs resolvidas)
  │
  ├── ★ PROXIMO PASSO: /validate-all
  │     ├── /qa .................. A EXECUTAR
  │     ├── /validate-manifest ... A EXECUTAR (2 manifests)
  │     ├── /validate-openapi .... N/A (pos-codigo)
  │     ├── /validate-drizzle .... N/A (pos-codigo)
  │     └── /validate-endpoint ... N/A (pos-codigo)
  │
  ▼
mod-005 validado (DRAFT)                ← Fase 3: A EXECUTAR
  │
  ├── Gate 0 (DoR): 5/7 atendidos, 2 A VERIFICAR (lint + manifests)
  ├── ATENCAO: BLK-003 — nao impede promocao da spec
  │
  ▼
mod-005 selado (READY)                  ← Fase 4: A EXECUTAR (apos fase 3)
  │
  ▼
mod-005 + amendments/                   ← Fase 5: SOB DEMANDA (0 amendments)

Dependencias upstream: MOD-000 (Foundation) + MOD-003 (Estrutura Org) + MOD-004 (Identidade).
Camada topologica: 3. Unico modulo com 3 dependencias diretas.
Dependentes: MOD-006 (Execucao — consome blueprints publicados), MOD-007, MOD-008.
BLK-003: MOD-005 bloqueado por MOD-004 (org_scopes) — nao impede promocao da spec.
```

---

## Particularidades do MOD-005

| Aspecto | Detalhe |
|---------|---------|
| Modulo mais rico em artefatos | 7 tabelas, 26 endpoints, 19 domain events, 13 FRs, 12 BRs — o modulo com maior volume de especificacao ate agora. Multiplos passes de re-enriquecimento (v0.13.0 a v0.17.0) refletem a complexidade inerente da modelagem de processos. |
| Nivel 2 — DDD-lite + Full Clean (Score 5/6) | 5 de 6 gatilhos ativos: estado/workflow, compliance/auditoria, concorrencia/consistencia, multi-tenant, regras cruzadas/reuso alto. Unico gatilho ausente: integracoes externas criticas (integra apenas modulos internos). 4 ADRs excedem o minimo de 3 para Nivel 2. |
| Separacao Blueprint vs Execucao | MOD-005 define o molde (blueprint), MOD-006 instancia e executa. `cycle_version_id` como FK imutavel e a chave de integridade entre os dois modulos. Alterar esta fronteira impacta toda a cadeia MOD-005→006→007→008. |
| BLK-003: Bloqueado por MOD-004 | MOD-005 depende de `org_scopes` do MOD-004 para filtering de processos por unidade organizacional. O bloqueio nao impede a **promocao da especificacao**, apenas a **implementacao** de codigo. |
| 3 dependencias upstream | Unico modulo com 3 dependencias diretas (MOD-000, MOD-003, MOD-004). Camada topologica 3 — implementacao so pode ocorrer apos as 3 upstream estarem prontas. Isto o coloca no caminho critico do projeto. |
| Fork atomico (ADR-003) | Operacao complexa que copia 7 tabelas em transacao unica com remapeamento de UUIDs. SLA de fork < 2s definido em NFR-005. Mapa old→new em memoria (~500 registros max). Requer testes de performance dedicados durante implementacao. |
| Optimistic locking (ADR-004) | Todos os PATCH usam `updated_at` como token de versao com 409 Conflict. Alinhamento cross-modulo (mesmo padrao de MOD-001, MOD-003). Auto-save com debounce 800ms no frontend. |

---

## Checklist Rapido — O que Falta para READY

- [ ] Executar `/validate-all docs/04_modules/mod-005-modelagem-processos/` — /qa + /validate-manifest
- [ ] Corrigir eventuais erros encontrados
- [ ] Re-executar validacao ate aprovacao limpa
- [ ] Confirmar que BLK-003 sera resolvido (MOD-004 na rota para implementacao)
- [ ] Executar `/promote-module docs/04_modules/mod-005-modelagem-processos/` — verificar Gate 0 (DoR) 7/7

> **Nota:** Todas as 9 pendencias ja estao resolvidas (6 RESOLVIDA + 3 IMPLEMENTADA). Os 10 artefatos de requisitos estao enriquecidos. As 4 ADRs excedem o minimo para Nivel 2. BLK-003 (org_scopes do MOD-004) nao impede a promocao da especificacao — apenas a geracao de codigo. As 3 dependencias upstream (MOD-000, MOD-003, MOD-004) estao DRAFT mas isso nao bloqueia a promocao do MOD-005.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 2.0.0 | 2026-03-22 | Reescrita completa no formato padrao: detalhamento completo das 9 pendentes (Q1-Q9) com questao, opcoes, resolucao, rastreio de agentes, mapa de cobertura de validadores, particularidades, resumo visual |
| 1.1.0 | 2026-03-21 | Reescrita formato hibrido: PASSOs numerados, decision trees padrao, gestao de pendencias completa (SLA/ciclo de vida), rastreio de agentes, painel de pendencias individual, bloqueadores explicitos, resumo visual vertical, notas contextuais |
| 1.0.0 | 2026-03-21 | Criacao inicial — diagnostico Fase 2 concluida (11 agentes, 9 pendentes, Mermaid Etapa 5). Nivel 2 DDD-lite com BLK-003 |
