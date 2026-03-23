# Procedimento — Plano de Acao MOD-011 SmartGrid

> **Versao:** 1.0.0 | **Data:** 2026-03-22 | **Owner:** arquitetura
> **Estado atual do modulo:** DRAFT (v0.14.0) | **Epico:** APPROVED (v1.1.0) | **Features:** 5/5 APPROVED
>
> Fases 0-2 concluidas. Proximo passo: Fase 3 (Validacao) — executar `/validate-all`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-011 | APPROVED (v1.1.0) | DoR completo, 5 features vinculadas, UX Consumer do MOD-007 |
| Features F01-F05 | 5/5 APPROVED | F01 (Amendment current_record_state), F02 (Grade Inclusao em Massa), F03 (Formulario Alteracao), F04 (Grade Exclusao em Massa), F05 (Acoes em Massa) |
| Scaffold (forge-module) | CONCLUIDO | mod-011-smartgrid/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | Agentes 01-11 confirmados, v0.14.0, 5 pendentes resolvidas |
| PENDENTEs | 0 abertas | 5 total: 5 IMPLEMENTADA (PEND-SGR-01 a PEND-SGR-05) |
| ADRs | 2 aceitas | Nivel 1 requer minimo 1 — atendido (ADR-001 Motor 1-por-1, ADR-002 Sem Persistencia Server-Side) |
| Amendments | 1 backlog | Amendment MOD-007: campo `target_endpoints` no context_framer tipo OPERACAO |
| Requirements | 14/14 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1), ADR(2), mod.md(1), CHANGELOG(1) |
| CHANGELOG | v0.14.0 | Ultima entrada 2026-03-19 (Pipeline PEND-SGR-04) |
| Screen Manifests | 3/3 existem | ux-sgr-001, ux-sgr-002, ux-sgr-003 |
| Dependencias | 2 upstream (MOD-000, MOD-007) | Consome auth/RBAC do MOD-000 e routine-engine/evaluate do MOD-007 |
| Bloqueios | 0 | Nenhum BLK-* afeta MOD-011 |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

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
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-011-F{01..05}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Modulo UX Consumer (Nivel 1) scaffoldado em 2026-03-19. Zero tabelas, zero endpoints proprios, 5 features, 3 screen manifests. Stubs obrigatorios DATA-003 e SEC-002 criados automaticamente.

```
3    /forge-module MOD-011  Scaffold completo gerado:                        CONCLUIDO
                           mod-011-smartgrid.md, CHANGELOG.md,              v0.1.0 (2026-03-19)
                           requirements/ (br/, fr/, data/, int/, sec/,
                           ux/, nfr/), adr/
                           Stubs obrigatorios: DATA-003, SEC-002
                           Pasta: docs/04_modules/mod-011-smartgrid/
```

### Fase 2: Enriquecimento — CONCLUIDO

O enriquecimento do MOD-011 foi completo — todos os agentes rodaram em 2026-03-19. Durante o processo, 5 pendencias foram identificadas e todas resolvidas. Destaque para PEND-SGR-03 (limite 200 linhas), PEND-SGR-04 (target_endpoints no context_framer) e PEND-SGR-05 (concorrencia configuravel via env var).

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-011
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-011
> ```

```
4    /enrich docs/04_modules/mod-011-smartgrid/
                           Agentes executados sobre mod-011:                 CONCLUIDO
                           AGN-DEV-01 (MOD), AGN-DEV-02 (BR),              v0.14.0 (2026-03-19)
                           AGN-DEV-03 (FR), AGN-DEV-04 (DATA),
                           AGN-DEV-05 (INT), AGN-DEV-06 (SEC),
                           AGN-DEV-07 (UX), AGN-DEV-08 (NFR),
                           AGN-DEV-09 (ADR), AGN-DEV-10 (PEN),
                           AGN-DEV-11 (VAL — validacao cruzada)
                           5 pendentes criadas e resolvidas (SGR-01 a SGR-05)
```

#### Rastreio de Agentes — MOD-011

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-011-smartgrid.md | CONCLUIDO | CHANGELOG v0.2.0 — metricas de escopo, fluxo de integracao com MOD-007, mapeamento response→status visual |
| 2 | AGN-DEV-02 | BR | BR-011.md | CONCLUIDO | v0.2.0 — 10 regras de comportamento de interface (BR-001 a BR-010) com Gherkin |
| 3 | AGN-DEV-03 | FR | FR-011.md | CONCLUIDO | v0.2.0 — 9 requisitos funcionais (FR-001 a FR-009) com Gherkin, cobrindo F01-F05 |
| 4 | AGN-DEV-04 | DATA | DATA-011.md, DATA-003.md | CONCLUIDO | DATA-011 v0.2.0 (contrato client-side JSON, entidades consumidas, grid state), DATA-003 v0.2.0 (catalogo de 4 domain events delegados com payloads) |
| 5 | AGN-DEV-05 | INT | INT-011.md | CONCLUIDO | v0.2.0 — 3 integracoes (INT-001 a INT-003): contratos completos MOD-007 com/sem current_record_state, MOD-000 auth/RBAC, modulo destino dinamico |
| 6 | AGN-DEV-06 | SEC | SEC-011.md, SEC-002.md | CONCLUIDO | SEC-011 v0.2.0 (RBAC herdado, client-side security, soft delete, audit, telemetria, LGPD), SEC-002 v0.2.0 (matriz de autorizacao de 4 eventos delegados) |
| 7 | AGN-DEV-07 | UX | UX-011.md | CONCLUIDO | v0.2.0 — 3 telas (UX-SGR-001/002/003): jornadas, happy paths, cenarios de erro, estados, acoes mapeadas para DOC-UX-010, componentes, copy, telemetria, a11y |
| 8 | AGN-DEV-08 | NFR | NFR-011.md | CONCLUIDO | v0.2.0 — 10 requisitos nao funcionais (NFR-001 a NFR-010): performance de renderizacao, limites de linhas, SLOs de validacao, export/import, observabilidade, a11y |
| 9 | AGN-DEV-09 | ADR | ADR-001.md, ADR-002.md | CONCLUIDO | 2 ADRs criadas e aceitas: motor 1-por-1, sem persistencia server-side |
| 10 | AGN-DEV-10 | PEN | pen-011-pendente.md | CONCLUIDO | v0.2.0 — PEND-SGR-01/02 documentadas como resolvidas, 3 novas questoes abertas (PEND-SGR-03/04/05) |
| 11 | AGN-DEV-11 | VAL | (validacao cruzada) | CONCLUIDO | v0.12.0 — todos os checks passed: rastreabilidade, cobertura F01-F05, consistencia DATA-003/SEC-002, mapeamento UX/acoes. 1 warning menor. |

#### Pendentes Resolvidas no Enriquecimento — Detalhamento Completo

> As 5 pendencias abaixo foram identificadas durante o enriquecimento e todas foram decididas e implementadas entre 2026-03-15 e 2026-03-19.

---

##### ~~PEND-SGR-01 — Contrato de mapeamento resultado do motor para estado visual da linha~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** ARC
- **tipo:** LACUNA
- **origem:** PRE-ENRICH
- **criado_em:** 2026-03-15
- **criado_por:** arquitetura
- **rastreia_para:** INT-011, DATA-011, mod-011-smartgrid.md
- **tags:** motor, mapeamento, status-visual, response
- **dependencias:** []
- **decidido_em:** 2026-03-15
- **decidido_por:** arquitetura
- **opcao_escolhida:** (unica — definicao do contrato)

**Questao:**
Como mapear o resultado do motor `POST /routine-engine/evaluate` (campos `blocking_validations`, `validations`) para o estado visual de cada linha na grade? Sem essa definicao, a UI nao sabe como interpretar o response do motor.

**Impacto:**
Sem mapeamento definido, cada desenvolvedor interpretaria o response de forma diferente, gerando inconsistencia na UX entre as 3 telas (UX-SGR-001/002/003).

**Resolucao:**

> **Decisao:** Mapeamento definido com 4 estados visuais:
> - `blocking_validations.length > 0` → status bloqueante (icone vermelho ❌) — Save desabilitado
> - `validations.length > 0` (sem blocking) → alerta (icone amarelo ⚠️) — Save permitido
> - Ambos vazios → valido (icone verde ✅) — Save habilitado (contribui)
> - Sem avaliacao realizada → neutro (sem icone) — Save desabilitado
> **Decidido por:** arquitetura em 2026-03-15
> **Justificativa:** Contrato claro e deterministico. 4 estados cobrem todos os cenarios possiveis. Alerta (⚠️) nao bloqueia salvamento por design — permite que o usuario prossiga com avisos informativos.
> **Artefato de saida:** INT-011 (INT-001.4), DATA-011 (secao 3.2), mod.md (secao "Mapeamento Response do Motor para Status Visual")
> **Implementado em:** 2026-03-15

---

##### ~~PEND-SGR-02 — Suporte a `current_record_state` no motor MOD-007-F03~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** ARC
- **tipo:** LACUNA
- **origem:** PRE-ENRICH
- **criado_em:** 2026-03-15
- **criado_por:** arquitetura
- **rastreia_para:** US-MOD-011-F01, FR-011 (FR-001), INT-011 (INT-001.2)
- **tags:** current-record-state, motor, amendment, condition-expr
- **dependencias:** []
- **decidido_em:** 2026-03-15
- **decidido_por:** arquitetura
- **opcao_escolhida:** (unica — definicao do amendment)

**Questao:**
O formulario de alteracao (UX-SGR-002) e a grade de exclusao (UX-SGR-003) precisam avaliar `condition_expr` contra o estado atual do registro (ex: status="Baixado" bloqueia edicao). O motor MOD-007-F03 v1 nao aceita o estado do registro como input. Como resolver?

**Impacto:**
Sem `current_record_state`, o motor nao pode avaliar condicoes baseadas no estado do registro. Features F03 (alteracao) e F04 (exclusao) ficariam sem validacao contextual.

**Resolucao:**

> **Decisao:** Campo `current_record_state` nullable adicionado ao contrato do motor
> - Quando presente: motor avalia `condition_expr` contra os campos fornecidos. Cache Redis bypassado (dado dinamico).
> - Campos ausentes no `current_record_state`: condicao avaliada como `false` (degradacao suave).
> - Quando ausente: comportamento v1 preservado (backward compatible).
> **Decidido por:** arquitetura em 2026-03-15
> **Justificativa:** Amendment menor no MOD-007-F03. Backward compatible — sem o campo, motor opera normalmente. Cache bypass necessario pois `current_record_state` e dado dinamico que invalida cache.
> **Artefato de saida:** US-MOD-011-F01, FR-011 (FR-001), INT-011 (INT-001.2)
> **Implementado em:** 2026-03-15

---

##### ~~PEND-SGR-03 — Limite Padrao de Linhas na Grade (MI-001)~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** FR-005, NFR-001, NFR-002, NFR-004, NFR-005, BR-007
- **tags:** limite-linhas, performance, virtualizacao, MAX_GRID_ROWS
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** arquitetura
- **opcao_escolhida:** B

**Questao:**
Qual o limite padrao de linhas na grade de inclusao em massa (UX-SGR-001)? Sem limite definido, a UI pode degradar com centenas de linhas e o "Validar Tudo" geraria centenas de chamadas ao motor.

**Impacto:**
Performance (renderizacao client-side), sobrecarga no motor (centenas de chamadas), experiencia do usuario (tempo de espera).

**Opcao A — 100 linhas:**
Limite conservador que garante performance sem virtualizacao.

- Pros: Performance garantida mesmo sem virtualizacao, "Validar Tudo" com 10 concorrentes levaria ~5s
- Contras: Pode ser restritivo para operacoes com muitos registros

**Opcao B — 200 linhas com virtualizacao obrigatoria:**
Limite maior viabilizado por virtualizacao (react-virtual/tanstack-virtual).

- Pros: Cobre a maioria dos cenarios de uso, virtualizacao garante renderizacao fluida, "Validar Tudo" com 10 concorrentes ~10s, Export JSON < 1MB
- Contras: Virtualizacao obrigatoria adiciona dependencia de lib

**Opcao C — Configuravel por tenant:**
Limite variavel definido por configuracao do tenant.

- Pros: Flexibilidade maxima
- Contras: Complexidade de configuracao, precisa de UI de administracao

**Recomendacao:** Opcao B — 200 linhas com virtualizacao obrigatoria. Se testes de performance indicarem degradacao em hardware modesto, reduzir para 100. Opcao C como evolucao futura.

**Resolucao:**

> **Decisao:** Opcao B — 200 linhas como padrao (MAX_GRID_ROWS=200)
> **Decidido por:** arquitetura em 2026-03-19
> **Justificativa:** 200 linhas e viavel com virtualizacao (react-virtual/tanstack-virtual) e throttling ja especificados. "Validar Tudo" com concorrencia 10 levaria ~10s (p95). Export JSON < 1MB. Se testes de performance indicarem degradacao em hardware modesto, reduzir para 100. Configuravel por tenant como evolucao futura.
> **Artefato de saida:** NFR-011 NFR-002 (limite padrao MAX_GRID_ROWS=200, virtualizacao obrigatoria via react-virtual/tanstack-virtual)
> **Implementado em:** 2026-03-19

---

##### ~~PEND-SGR-04 — Mecanismo de Resolucao do operationId Dinamico do Modulo Destino (MI-002)~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** FR-006, FR-007, FR-009, INT-011 (INT-003), DATA-011
- **tags:** target-endpoints, operationId, modulo-destino, context-framer
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** arquitetura
- **opcao_escolhida:** A

**Questao:**
O SmartGrid precisa chamar endpoints CRUD de um modulo destino variavel (ex: POST /compras/servicos, PATCH /compras/servicos/{id}). Como resolver os endpoints do modulo destino de forma generica sem hardcoding?

**Impacto:**
Sem mecanismo de resolucao, o SmartGrid precisaria de configuracao manual por operacao ou hardcoding de endpoints, violando o principio de UX generico.

**Opcao A — Campo `target_endpoints` no context_framer tipo OPERACAO:**
O context_framer inclui objeto com endpoints do modulo destino (create, update, delete). SmartGrid le no mount da grade.

- Pros: Explicito, declarativo, lido no mount junto com config da Operacao, sem chamada adicional
- Contras: Requer amendment menor no MOD-007 (schema do context_framer)

**Opcao B — Convencao de naming (derivar path do object_type):**
SmartGrid constroi o path baseado no `object_type` (ex: `compra_servico` → `/api/v1/compras/servicos`).

- Pros: Zero configuracao adicional
- Contras: Convencao rigida, quebra com paths nao padrao, fragilidade em renaming

**Opcao C — Registro separado (tabela de mapeamento):**
Tabela dedicada que mapeia operacao_id → endpoints.

- Pros: Flexivel, independente do context_framer
- Contras: Tabela adicional (viola principio 0 tabelas do MOD-011), endpoint adicional

**Recomendacao:** Opcao A — campo `target_endpoints` no context_framer. Explicito, declarativo, sem tabela extra.

**Resolucao:**

> **Decisao:** Opcao A — Campo `target_endpoints` no context_framer tipo OPERACAO
> **Decidido por:** arquitetura em 2026-03-19
> **Justificativa:** Solucao explicita e declarativa. O context_framer ja carrega toda a configuracao da Operacao — adicionar `target_endpoints` e natural. SmartGrid le no mount junto com `visible_fields`, `required_fields`, etc. Requer amendment menor no MOD-007 (campo opcional, backward compatible).
> **Artefato de saida:** DATA-011 §6 (campo `target_endpoints` no schema), INT-011 INT-003 (resolucao via `target_endpoints` nos 3 fluxos), backlog amendment MOD-007
> **Implementado em:** 2026-03-19

---

##### ~~PEND-SGR-05 — Estrategia de Concorrencia para "Validar Tudo" e "Salvar Lote"~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** NFR-003, NFR-004, NFR-007, BR-002, BR-003, ADR-001
- **tags:** concorrencia, throttling, SMARTGRID_CONCURRENCY, env-var
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** arquitetura
- **opcao_escolhida:** C

**Questao:**
"Validar Tudo" executa N chamadas ao motor (1 por linha — BR-002). Com 200 linhas, enviar todas simultaneamente sobrecarregaria o servidor. Qual a estrategia de concorrencia?

**Impacto:**
Sem throttling, 200 chamadas simultaneas podem degradar o motor MOD-007, causar timeouts e prejudicar outros tenants.

**Opcao A — Concorrencia fixa de 5:**
Pool de 5 chamadas simultaneas. Simples, mas pode ser subotimo.

- Pros: Simples, previsivel
- Contras: Sem tuning por ambiente, pode ser lento em producao (200/5*500ms = 20s)

**Opcao B — Concorrencia fixa de 10:**
Pool de 10 chamadas simultaneas. Equilibrio entre velocidade e carga.

- Pros: Rapido (200/10*500ms = 10s), equilibrado
- Contras: Pode ser excessivo para ambientes dev/staging com menos recursos

**Opcao C — Configuravel via environment variable:**
`SMARTGRID_CONCURRENCY` com default=10. Permite tuning sem rebuild.

- Pros: Tuning sem rebuild: dev=2, staging=5, prod=10. Flexibilidade maxima. Calculo: 200 linhas / 10 concorrentes = 20 batches x 500ms p95 = ~10s
- Contras: Mais uma env var para documentar/manter

**Recomendacao:** Opcao C — configuravel via env var. Equilibra performance e flexibilidade.

**Resolucao:**

> **Decisao:** Opcao C — Configuravel via environment variable SMARTGRID_CONCURRENCY com default=10
> **Decidido por:** arquitetura em 2026-03-19
> **Justificativa:** Permite tuning sem rebuild. Valores recomendados: dev=2, staging=5, prod=10. Para 200 linhas com latencia p95 de 500ms e concorrencia 10, "Validar Tudo" levaria ~10s.
> **Artefato de saida:** NFR-011 NFR-004 (concorrencia configuravel via env var SMARTGRID_CONCURRENCY, default=10)
> **Implementado em:** 2026-03-19

---

### Fase 3: Validacao — PENDENTE

O `/validate-all` ainda nao foi executado para o MOD-011. Com o enriquecimento completo e todas as pendencias resolvidas, o proximo passo e executar a validacao.

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
5    /validate-all docs/04_modules/mod-011-smartgrid/
                           Orquestra TODAS as validacoes em sequencia:        A EXECUTAR
                           Internamente executa:
                             1. /qa (lint, links, metadados, EX-*, §N, ciclos)
                             2. /validate-manifest (screen manifests vs schema v1)
                             3. /validate-openapi → N/A (UX Consumer, sem backend)
                             4. /validate-drizzle → N/A (UX Consumer, sem entidades)
                             5. /validate-endpoint → N/A (UX Consumer, sem handlers)
                           Pre-condicao: Enriquecimento concluido
                           Pos-condicao: Relatorio consolidado pass/fail
```

> **Alternativa:** Executar validadores individuais:

```
5a   /qa docs/04_modules/mod-011-smartgrid/
                           Diagnostico de sintaxe e integridade:              INDIVIDUAL
                           - lint:docs (Pass A-E: EX-*, §N, IDs, context-map, ciclos)
                           - Consistencia de metadados (estado_item, owner)
                           - Dead links, DoR alignment

5b   /validate-manifest ux-sgr-001.inclusao-massa.yaml
                           Validar manifests contra schema v1:               INDIVIDUAL
                           - ux-sgr-001.inclusao-massa.yaml
                           - ux-sgr-002.alteracao-registro.yaml
                           - ux-sgr-003.exclusao-massa.yaml
                           Verifica: DOC-UX-010, operationId, RBAC,
                           telemetria, permissions, componentes

5c   /validate-openapi                                                       N/A (UX Consumer)
5d   /validate-drizzle                                                       N/A (UX Consumer)
5e   /validate-endpoint                                                      N/A (UX Consumer)
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | `/qa` | SIM (todos) | SIM | mod-011-smartgrid.md, requirements/*, adr/*, CHANGELOG.md |
| 2 | `/validate-manifest` | SIM (3 manifests existem) | SIM | ux-sgr-001, ux-sgr-002, ux-sgr-003 |
| 3 | `/validate-openapi` | N/A | N/A | UX Consumer — sem backend proprio (endpoints sao do MOD-007 e modulo destino) |
| 4 | `/validate-drizzle` | N/A | N/A | UX Consumer — sem entidades de banco proprias (0 tabelas) |
| 5 | `/validate-endpoint` | N/A | N/A | UX Consumer — sem handlers Fastify proprios (0 endpoints) |

### Fase 4: Promocao — PENDENTE

```
10   /promote-module docs/04_modules/mod-011-smartgrid/
                           Selar mod-011 como READY:                         A EXECUTAR (apos fase 3)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (5/5 IMPLEMENTADA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (14/14)
                             [DoR-3] Zero erros de lint? ................ A VERIFICAR (executar /qa)
                             [DoR-4] Screen manifests validados? ........ A VERIFICAR (executar /validate-manifest)
                             [DoR-5] ADRs conforme nivel? ............... SIM (2 >= 1 para N1)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v0.14.0)
                             [DoR-7] Bloqueios cross-modulo? ............ SIM (0 bloqueios)

                           Fluxo interno:
                             Step 1: /qa (pre-check)
                             Step 2: Promover estado_item DRAFT→READY
                             Step 3: /qa (pos-check)
                             Step 4: /update-index
                             Step 5: /git commit
                           Pre-condicao: QA verde, DoR-1..7 atendidos
                           Pos-condicao: estado_item = READY, INDEX.md atualizado, commit
```

> **Nota:** MOD-011 depende de MOD-000 (Foundation) e MOD-007 (Parametrizacao Contextual), ambos ainda DRAFT. A promocao do MOD-011 pode ocorrer independentemente — o DoR nao exige que dependencias upstream estejam READY (apenas que existam). Porem, o codigo so pode ser gerado quando MOD-000 e MOD-007 estiverem READY (endpoints implementados). Adicionalmente, o amendment `target_endpoints` no MOD-007 precisa ser formalizado.

### Fase 5: Pos-READY (quando necessario)

```
11   /update-specification docs/04_modules/mod-011-smartgrid/requirements/fr/FR-011.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

12   /create-amendment FR-011 melhoria "endpoint batch no motor"
                           Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
                           Caso de uso previsto: Se MOD-007 criar endpoint
                           batch, migrar motor-evaluator.ts

13   /create-amendment MOD-007 "target_endpoints no context_framer"
                           Amendment no MOD-007:                             BACKLOG
                           Adicionar campo target_endpoints ao schema
                           de context_framer tipo OPERACAO.
                           Backward compatible (campo opcional).
                           Ref: DATA-011 §6, PEND-SGR-04
```

### Gestao de Pendencias (qualquer momento)

> **Decision tree de pendencias:**
>
> ```
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-011
> ├── Criar nova pendencia     → /manage-pendentes create PEN-011
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-011 PEND-SGR-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-011 PEND-SGR-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-011 PEND-SGR-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-011 PEND-SGR-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-011
> ```

```
16   /manage-pendentes list PEN-011
                           Estado atual MOD-011:
                             PEN-011: 5 itens total
                               5 IMPLEMENTADA (SGR-01 a SGR-05)
                               0 ABERTA
                             SLA: nenhum vencido
```

#### Painel de Pendencias — Resumo Individual

| PENDENTE | Status | Sev. | Dominio | Decisao | Artefato de saida |
|----------|--------|------|---------|---------|-------------------|
| PEND-SGR-01 | IMPLEMENTADA | MEDIA | ARC | Mapeamento response→status visual (4 estados) | INT-011 (INT-001.4), DATA-011 (§3.2), mod.md |
| PEND-SGR-02 | IMPLEMENTADA | ALTA | ARC | current_record_state nullable no motor | US-MOD-011-F01, FR-011 (FR-001), INT-011 (INT-001.2) |
| PEND-SGR-03 | IMPLEMENTADA | MEDIA | ARC | Opcao B — limite 200 linhas (MAX_GRID_ROWS=200) | NFR-011 (NFR-002) |
| PEND-SGR-04 | IMPLEMENTADA | ALTA | ARC | Opcao A — target_endpoints no context_framer | DATA-011 (§6), INT-011 (INT-003), backlog amendment MOD-007 |
| PEND-SGR-05 | IMPLEMENTADA | MEDIA | ARC | Opcao C — env var SMARTGRID_CONCURRENCY default=10 | NFR-011 (NFR-004) |

> Detalhamento completo: ver [Fase 2](#pendentes-resolvidas-no-enriquecimento--detalhamento-completo).

### Utilitarios (qualquer momento)

```
14   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-011): <descricao>

15   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

17   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-011

```
US-MOD-011 (APPROVED v1.1.0)              ← Fase 0: CONCLUIDA
  │  5/5 features APPROVED (1 backend + 4 UX)
  ▼
mod-011-smartgrid/ (stubs DRAFT)           ← Fase 1: CONCLUIDA (forge-module v0.1.0)
  │
  ▼
mod-011 enriquecido (DRAFT v0.14.0)        ← Fase 2: CONCLUIDA (11 agentes, 5 PENDENTEs resolvidas)
  │
  ├── ★ PROXIMO PASSO: /validate-all
  │     ├── /qa .................. A EXECUTAR
  │     ├── /validate-manifest ... A EXECUTAR (3 manifests)
  │     ├── /validate-openapi .... N/A (UX Consumer)
  │     ├── /validate-drizzle .... N/A (UX Consumer)
  │     └── /validate-endpoint ... N/A (UX Consumer)
  │
  ▼
mod-011 validado (DRAFT)                   ← Fase 3: A EXECUTAR
  │
  ├── Gate 0 (DoR): 5/7 atendidos, 2 A VERIFICAR (lint + manifests)
  │
  ▼
mod-011 selado (READY)                     ← Fase 4: A EXECUTAR (apos fase 3)
  │
  ▼
mod-011 + amendments/                      ← Fase 5: SOB DEMANDA (1 amendment backlog: MOD-007 target_endpoints)

Dependencias upstream: MOD-000 (Foundation) — camada topologica 0.
                       MOD-007 (Parametrizacao) — camada topologica 5.
MOD-011 esta na camada topologica 6 (ultima). Nao ha modulos dependentes downstream.
```

---

## Particularidades do MOD-011

| Aspecto | Detalhe |
|---------|---------|
| Modulo UX Consumer (Nivel 1) | Nao possui backend proprio — consome motor do MOD-007 e endpoints de modulos destino dinamicos. Os validadores `/validate-openapi`, `/validate-drizzle` e `/validate-endpoint` sao N/A. Apenas `/qa` e `/validate-manifest` sao aplicaveis. |
| Zero tabelas, zero endpoints, zero scopes | MOD-011 e puramente UX. 0 tabelas de banco, 0 endpoints API proprios, 0 scopes RBAC proprios (herda `param:engine:evaluate` e `param:framer:read` do MOD-007). |
| Modulo destino dinamico | O SmartGrid opera sobre qualquer modulo destino via `target_endpoints` no context_framer. Nao ha acoplamento com modulo especifico — os endpoints CRUD sao resolvidos em runtime. |
| Motor chamado 1-por-1 (ADR-001) | Sem endpoint batch no MOD-007 v1. "Validar Tudo" executa N chamadas individuais com throttling configuravel (SMARTGRID_CONCURRENCY). Feedback visual progressivo por linha. |
| Sem persistencia server-side (ADR-002) | Estado da grade em memoria do navegador. Recuperacao via Export/Import JSON client-side. Modal de confirmacao ao fechar protege contra perda acidental. |
| 8 componentes UI | SmartGridHeader, MassActionToolbar, SmartDataGrid, CloseConfirmationModal, SelectionList, DeleteConfirmationPanel, DeleteResultFeedback, SmartEditForm. |
| Amendment backlog no MOD-007 | PEND-SGR-04 gerou necessidade de amendment no MOD-007: adicionar campo `target_endpoints` ao schema de `context_framer` tipo OPERACAO. Amendment menor, backward compatible. |
| 2 ADRs para Nivel 1 | Excede o minimo de 1 ADR. ADR-001 (Motor 1-por-1) e ADR-002 (Sem Persistencia Server-Side) documentam decisoes arquiteturais nao-obvias que impactam UX e performance. |
| Dependencia de MOD-000 e MOD-007 | Camada topologica 6 (ultima). MOD-000 prove auth/RBAC, MOD-007 prove motor de avaliacao. Sem dependentes downstream. |

---

## Checklist Rapido — O que Falta para READY

- [ ] Executar `/validate-all docs/04_modules/mod-011-smartgrid/` — /qa + /validate-manifest
- [ ] Corrigir eventuais erros encontrados
- [ ] Executar `/promote-module docs/04_modules/mod-011-smartgrid/` — verificar Gate 0 (DoR) 7/7
- [ ] Formalizar amendment MOD-007 (campo `target_endpoints` no context_framer)

> **Nota:** Todas as 5 pendencias ja estao IMPLEMENTADA. Os 14 artefatos de requisitos estao enriquecidos. As 2 ADRs excedem o minimo para Nivel 1. Nao ha bloqueios (BLK-*) afetando MOD-011. As dependencias upstream (MOD-000, MOD-007) estao DRAFT mas isso nao impede a promocao da especificacao — apenas a geracao de codigo. O amendment backlog no MOD-007 (target_endpoints) precisa ser formalizado via `/create-amendment` antes ou durante a implementacao.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 1.0.0 | 2026-03-22 | Criacao completa: Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 5 pendentes resolvidas (PEND-SGR-01 a PEND-SGR-05), rastreio de 11 agentes, mapa de cobertura de validadores, particularidades UX Consumer, amendment backlog MOD-007 |
