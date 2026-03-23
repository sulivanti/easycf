# Procedimento — Plano de Acao MOD-006 Execucao de Casos

> **Versao:** 1.0.0 | **Data:** 2026-03-22 | **Owner:** arquitetura
> **Estado atual do modulo:** DRAFT (v0.4.0) | **Epico:** APPROVED (v1.2.0) | **Features:** 4/4 APPROVED
>
> Fases 0-2 concluidas. Proximo passo: Fase 3 (Validacao) — executar `/validate-all`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-006 | APPROVED (v1.2.0) | DoR completo, 4 features vinculadas, 3 historicos independentes, motor de transicao |
| Features F01-F04 | 4/4 APPROVED | F01 (API abertura + motor), F02 (API gates + responsaveis + eventos), F03 (UX Painel), F04 (UX Listagem) |
| Scaffold (forge-module) | CONCLUIDO | mod-006-execucao-casos/ com estrutura completa |
| Enriquecimento (10 agentes) | CONCLUIDO | Agentes 01-10 confirmados, v0.4.0, 5 pendentes resolvidas |
| PENDENTEs | 0 abertas | 5 total: 5 IMPLEMENTADA |
| ADRs | 5 aceitas | Nivel 2 requer minimo 3 — atendido (ADR-001 a ADR-005) |
| Amendments | 0 no modulo | 2 amendments cross-module em MOD-000 (DOC-FND-000-M01, DOC-FND-000-M02) |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v0.4.0 | Ultima entrada 2026-03-19 (Etapa 4 enriquecimento) |
| Screen Manifests | 2/2 existem | ux-case-001.painel-caso, ux-case-002.listagem-casos |
| Dependencias | 4 upstream (MOD-000, MOD-003, MOD-004, MOD-005) | Consome auth/RBAC, org_units, delegacoes, blueprints publicados |
| Dependentes | 3 downstream (MOD-007, MOD-008, MOD-009) | Parametrizacao, Protheus, Aprovacao |
| Bloqueios | 1 (BLK-002) | MOD-005 deve ter blueprints + cycle_version_id freeze implementados |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-006 define o modulo de execucao de casos sobre blueprints do MOD-005. O dominio e rico: motor de transicao com 5 validacoes sequenciais, 3 historicos independentes (estagio, gates, eventos/atribuicoes), freeze de cycle_version_id, resolucao de gates com 3 tipos (APPROVAL, DOCUMENT, CHECKLIST), e atribuicao de responsaveis por papel. Nivel 2 (DDD-lite + Full Clean) com aggregate root CaseInstance, value objects (CaseStatus, GateResolutionStatus, GateDecision) e domain services (TransitionEngine, GateResolver, TimelineService). 5 tabelas proprias, 16 endpoints, 11 domain events, 7 scopes RBAC.

```
1    (manual)              Revisar e finalizar epico US-MOD-006:             CONCLUIDO
                           - Escopo fechado (4 features)                    status_agil = APPROVED
                           - 3 historicos independentes documentados         v1.2.0
                           - Motor de transicao com 5 validacoes definido
                           - Modelo de dados completo (5 tabelas)
                           - DoR completo (9/9 itens verificados)
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-006.md

2    (manual)              Revisar e finalizar features F01-F04:             CONCLUIDO
                           - F01: API Abertura de Caso + Motor de Transicao  4/4 APPROVED
                           - F02: API Gates + Responsaveis + Eventos
                           - F03: UX Painel do Caso em Andamento (UX-CASE-001)
                           - F04: UX Listagem de Casos (UX-CASE-002)
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-006-F{01..04}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Modulo scaffoldado em 2026-03-18 via `forge-module` a partir do epico APPROVED. Gerou estrutura completa com 5 tabelas, 16 endpoints, 4 features, 11 domain events. Stubs obrigatorios DATA-003 e SEC-002 criados automaticamente.

```
3    /forge-module MOD-006  Scaffold completo gerado:                        CONCLUIDO
                           mod-006-execucao-casos.md, CHANGELOG.md,         v0.1.0 (2026-03-18)
                           requirements/ (br/, fr/, data/, int/, sec/,
                           ux/, nfr/), adr/, amendments/
                           Stubs obrigatorios: DATA-003, SEC-002
                           Pasta: docs/04_modules/mod-006-execucao-casos/
```

### Fase 2: Enriquecimento — CONCLUIDO

O enriquecimento do MOD-006 foi completo — todos os agentes rodaram em 2026-03-19. Durante o processo, 5 pendencias foram identificadas e todas resolvidas no mesmo dia. Destaque para PENDENTE-001 que criou novo scope `process:case:reopen` (7o scope) e PENDENTE-004 que gerou 2 amendments cross-module no MOD-000 (DOC-FND-000-M01 e M02).

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
```

#### Rastreio de Agentes — MOD-006

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-006-execucao-casos.md | CONCLUIDO | CHANGELOG v0.2.0 — narrativa arquitetural expandida (aggregate root, value objects, domain services), referencia EX-ESC-001 |
| 2 | AGN-DEV-02 | BR | BR-006.md | CONCLUIDO | v0.2.0 — Gherkin adicionado a regras existentes, BR-011 a BR-017 adicionados |
| 3 | AGN-DEV-03 | FR | FR-006.md | CONCLUIDO | v0.2.0 — Gherkin, done funcional, dependencias, idempotencia e timeline/notifications detalhados |
| 4 | AGN-DEV-04 | DATA | DATA-006.md, DATA-003.md | CONCLUIDO | DATA-006 v0.2.0 (constraints, value objects, invariantes, migracao), DATA-003 v0.2.0 (maskable_fields, payload_policy, outbox, ponte UI-API-Domain) |
| 5 | AGN-DEV-05 | INT | INT-006.md | CONCLUIDO | v0.2.0 — contratos request/response detalhados, headers, erros RFC 9457, integracoes consumidas com failure behavior |
| 6 | AGN-DEV-06 | SEC | SEC-006.md, SEC-002.md | CONCLUIDO | SEC-006 v0.2.0 (classificacao, LGPD, mascaramento, retencao, row-level authz), SEC-002 v0.2.0 (Emit/View/Notify, causation chain) |
| 7 | AGN-DEV-07 | UX | UX-006.md | CONCLUIDO | v0.2.0 — jornadas detalhadas, action_ids UX-010, estados loading/empty/error, mapeamento endpoint/event |
| 8 | AGN-DEV-08 | NFR | NFR-006.md | CONCLUIDO | v0.2.0 — SLOs detalhados, concorrencia, input validation, DR, escalabilidade futura, testabilidade |
| 9 | AGN-DEV-09 | ADR | ADR-001 a ADR-005 | CONCLUIDO | 5 ADRs criadas e aceitas (motor atomico, freeze cycle_version_id, 3 historicos, optimistic locking, background job expiracao) |
| 10 | AGN-DEV-10 | PEN | pen-006-pendente.md | CONCLUIDO | v0.4.0 — 5 pendentes criadas e resolvidas (001-005) |

#### Pendentes Resolvidas no Enriquecimento — Detalhamento Completo

> As 5 pendencias abaixo foram identificadas durante o enriquecimento e todas foram decididas e implementadas em 2026-03-19.

---

##### ~~PENDENTE-001 — Escopo especial para reabertura de caso COMPLETED (REOPENED)~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** SEC
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** BR-016, FR-007, SEC-006, SEC-002, DOC-FND-000
- **tags:** reopened, scope, security, audit
- **dependencias:** [PENDENTE-004]
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** B

**Questao:**
BR-016 define que reabrir caso COMPLETED requer "escopo especial (a definir)". SEC-006 §2.2 e SEC-002 repetem "escopo a definir (missing_info)". Qual scope controla a acao de reabertura? Deve ser um scope existente reutilizado ou um novo scope dedicado?

**Impacto:**
Sem definicao do scope, a implementacao de FR-007 (registro de evento REOPENED com side-effect status COMPLETED -> OPEN) nao pode ser protegida adequadamente. A acao e critica (reverte conclusao do caso) e precisa de controle de acesso explicito para auditoria e compliance.

**Opcao A — Reutilizar `process:case:gate_waive`:**
REOPENED e uma acao excepcional semelhante a waive — ambas revertem decisoes formais. O scope gate_waive ja e concedido apenas a perfis de auditoria/gestao.

- Pros: Sem novo scope; menor custo de catalogo; mesma persona (auditor) executa ambas
- Contras: Semantica imprecisa (waive refere-se a gates, nao a reabertura); pode confundir regras de concessao

**Opcao B — Criar novo scope `process:case:reopen`:**
Scope dedicado exclusivamente para reabertura de casos COMPLETED.

- Pros: Semantica clara; granularidade maxima; facilita auditoria (scope aparece em logs)
- Contras: Mais um scope no catalogo (total: 7); requer amendment MOD-000-F12 adicional; perfis precisam ser atualizados

**Opcao C — Reutilizar `process:case:cancel`:**
Cancel e reopen sao ambas acoes criticas de ciclo de vida do caso, restritas a gestores.

- Pros: Mesmo nivel de criticidade; mesma persona; sem novo scope
- Contras: Semantica invertida (cancel encerra, reopen reverte encerramento); confuso para administradores de permissoes

**Recomendacao:** Opcao B — `process:case:reopen` como scope dedicado.

**Resolucao:**

> **Decisao:** Opcao B — Criar novo scope `process:case:reopen`
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Acao excepcional de alto impacto e auditada. Scope dedicado process:case:reopen permite rastreabilidade clara em logs. Custo de +1 scope e baixo vs beneficio de clareza semantica.
> **Artefato de saida:** DOC-FND-000-M02 (amendments/sec/DOC-FND-000-M02.md)
> **Implementado em:** 2026-03-19

---

##### ~~PENDENTE-002 — Mecanismo de expiracao automatica de atribuicoes (BR-015/BR-017)~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** BR-015, BR-017, FR-006, ADR-005, NFR-006, INT-006, MOD-004
- **tags:** expiration, background-job, delegation, assignment
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** B

**Questao:**
BR-015 (delegacao expira) e BR-017 (valid_until expira) exigem desativacao automatica de atribuicoes. ADR-005 propoe background job a cada 5 minutos. Entretanto, nao esta definido: (1) como o job detecta que uma delegacao MOD-004 expirou — consulta direta a `access_delegations.expires_at` ou evento de MOD-004? (2) qual a tolerancia aceitavel de latencia entre expiracao real e desativacao? (3) o job deve emitir domain events ou apenas atualizar o banco?

**Impacto:**
Sem definicao clara do mecanismo, a implementacao pode ser inconsistente (ex: job que consulta tabela de outro modulo sem contrato formal) ou ter latencia inaceitavel (ex: atribuicao expirada ha 30 min ainda aparece como ativa). Afeta tambem o healthcheck do job (NFR-006 §3).

**Opcao A — Background job com consulta direta a access_delegations:**
Job a cada 5 min consulta `case_assignments` JOIN `access_delegations` WHERE `expires_at < now()`.

- Pros: Implementacao simples; sem dependencia de evento externo; funciona imediatamente
- Contras: Acoplamento direto ao schema do MOD-004; se MOD-004 mudar schema, job quebra; latencia de ate 5 min

**Opcao B — Background job + port/adapter (DelegationCheckerPort pattern):**
Job a cada 5 min usa DelegationCheckerPort (ja definido em mod.md §3) para verificar expiracao — abstrai acesso ao MOD-004.

- Pros: Desacoplamento via port; testavel com mock; padrao ja estabelecido no modulo
- Contras: Latencia de ate 5 min; port precisa de metodo adicional (`getExpiredDelegations`)

**Opcao C — Event-driven via MOD-004 (complementar ao job):**
MOD-004 emite `delegation.expired` -> handler no MOD-006 desativa atribuicoes imediatamente. Job mantido como fallback.

- Pros: Latencia minima; reacao imediata; desacoplamento via eventos
- Contras: MOD-004 nao emite esse evento hoje; complexidade de implementacao; precisa de outbox no MOD-004

**Recomendacao:** Opcao B no curto prazo (job via DelegationCheckerPort), evoluindo para Opcao C quando MOD-004 implementar domain events de expiracao.

**Resolucao:**

> **Decisao:** Opcao B — Background job + port/adapter (DelegationCheckerPort pattern)
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Port/adapter DelegationCheckerPort ja existe na arquitetura. Basta adicionar getExpiredDelegations. Desacoplamento via port garante que mudancas no MOD-004 nao quebram o job. Evoluir para event-driven quando MOD-004 implementar delegation.expired.
> **Artefato de saida:** ADR-005 (secao expiracao + status accepted), FR-014 (background job), INT-006 §3.2 (contrato getExpiredDelegations)
> **Implementado em:** 2026-03-19

---

##### ~~PENDENTE-003 — Indice de busca por object_id na listagem de casos~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** DATA
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** DATA-006, FR-009, NFR-006
- **tags:** index, search, object_id, performance
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A

**Questao:**
DATA-006 define `idx_case_instances_object` como index parcial `(object_type, object_id) WHERE object_id IS NOT NULL` para busca por objeto de negocio vinculado. FR-009 permite busca por `object_id` via parametro `search`. Porem: (1) o filtro `search` faz busca textual por `codigo` ou `object_id` — como funciona a busca por UUID em campo de texto livre? (2) o indice parcial e suficiente para o SLO < 300ms (NFR-006) ou e necessario GIN/trigram para busca parcial? (3) deve haver endpoint dedicado `GET /cases?object_id={uuid}` ao inves de usar `search`?

**Impacto:**
Se a busca por object_id nao for otimizada, modulos dependentes (MOD-007, MOD-008) que precisam localizar casos por objeto de negocio terao latencia degradada. O SLO < 300ms da listagem pode ser comprometido com busca textual em UUIDs.

**Opcao A — Query param dedicado `object_id` (exact match):**
Adicionar `object_id` como query param especifico em GET /cases, com busca exata via indice `idx_case_instances_object`.

- Pros: Performance excelente (exact match em indice B-tree); semantica clara; SLO garantido
- Contras: Mais um query param; duplicacao com `search` para quem nao sabe o UUID exato

**Opcao B — Manter busca via `search` com deteccao de UUID:**
Se `search` contem formato UUID, buscar em `object_id` via exact match; caso contrario, buscar em `codigo` via LIKE.

- Pros: Interface simples (um campo serve para tudo); sem novo query param
- Contras: Logica de deteccao de UUID no backend; se o formato mudar no futuro, query quebra; ambiguidade

**Opcao C — Ambos (dedicado + search):**
Query param `object_id` para integracoes programaticas + `search` para UI com deteccao de UUID.

- Pros: Melhor dos dois mundos; integracoes usam param dedicado, UI usa search
- Contras: Mais complexidade; dois caminhos para o mesmo resultado

**Recomendacao:** Opcao A — query param dedicado `object_id`.

**Resolucao:**

> **Decisao:** Opcao A — Query param dedicado `object_id` (exact match)
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Integracoes programaticas (MOD-007, MOD-008) precisam de exact match confiavel via B-tree. Search continua para busca textual por codigo na UI. Simplicidade e performance sobre flexibilidade.
> **Artefato de saida:** FR-009 (query param object_id), INT-006 §2.7 (contrato atualizado)
> **Implementado em:** 2026-03-19

---

##### ~~PENDENTE-004 — Amendment MOD-000-F12 para registro dos 6 scopes process:case:*~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** SEC
- **tipo:** DEP-EXT
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** SEC-006, DOC-FND-000, MOD-000, US-MOD-006
- **tags:** scopes, rbac, foundation, amendment
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A

**Questao:**
O MOD-006 define 6 novos scopes `process:case:*` (read, write, cancel, gate_resolve, gate_waive, assign). SEC-006 §2.1 afirma que "todos os 6 scopes DEVEM ser registrados no catalogo canonico de DOC-FND-000 §2.2 via Amendment MOD-000-F12". Atualmente, esses scopes NAO estao no DOC-FND-000. Quando e como sera executado o amendment? Se PENDENTE-001 resultar em novo scope (process:case:reopen), serao 7 scopes.

**Impacto:**
Sem registro no catalogo canonico, o Gate CI (DOC-ARC-003B) rejeitara Screen Manifests que referenciem esses scopes. A implementacao do MOD-006 nao pode ser deployada sem que os scopes existam no Foundation.

**Opcao A — Amendment imediato (antes do desenvolvimento):**
Executar `/create-amendment MOD-000` agora para registrar os 6 (ou 7) scopes.

- Pros: Desbloqueio imediato do Gate CI; scopes disponiveis para testes desde o inicio
- Contras: Se PENDENTE-001 ainda nao esta decidida, pode ser necessario segundo amendment

**Opcao B — Amendment junto com a primeira PR do MOD-006:**
Incluir o amendment no mesmo PR que cria o scaffold do modulo.

- Pros: Uma unica revisao; amendment e implementacao juntos; evita retrabalho se PENDENTE-001 mudar
- Contras: PR maior; revisao do Foundation junto com modulo novo

**Recomendacao:** Opcao A — amendment imediato.

**Resolucao:**

> **Decisao:** Opcao A — Amendment imediato (antes do desenvolvimento)
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Dependencia bloqueante para deploy. Gate CI rejeita Screen Manifests sem scopes registrados. Desbloqueio antecipado do CI vale mais que otimizacao de PRs.
> **Artefato de saida:** DOC-FND-000-M01 (amendments/sec/DOC-FND-000-M01.md)
> **Implementado em:** 2026-03-19

---

##### ~~PENDENTE-005 — Comportamento de gates ao reabrir caso COMPLETED~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** BIZ
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** BR-016, FR-002, FR-007, DATA-006
- **tags:** reopened, gates, state-machine, business-rules
- **dependencias:** [PENDENTE-001]
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** B

**Questao:**
Quando um caso COMPLETED e reaberto (BR-016, REOPENED), o `current_stage_id` permanece no estagio terminal. Os gate_instances desse estagio ja estao RESOLVED. As questoes sao: (1) O caso reaberto permanece no estagio terminal com gates ja resolvidos? (2) Deve ser movido de volta ao estagio anterior (qual?)? (3) Os gates do estagio devem ser resetados para PENDING? (4) Quem define para qual estagio o caso retorna?

**Impacto:**
Sem definicao, a reabertura coloca o caso em estado ambiguo: OPEN mas no estagio terminal (is_terminal=true). O motor de transicao pode nao ter transicoes de saida definidas para um estagio terminal no blueprint (ja que estagios terminais sao endpoints). O operador ficaria preso sem como avancar ou retroceder.

**Opcao A — Caso permanece no estagio terminal; operador faz transicao reversa:**
O blueprint define transicoes reversas explicitas a partir de estagios terminais. Quem configura o blueprint decide para onde o caso pode ir.

- Pros: Flexibilidade total via blueprint; sem logica especial no motor; blueprints explicitos
- Contras: Requer que o blueprint preveja reabertura (pode nao ter transicao); se nao tiver, caso fica preso

**Opcao B — REOPENED inclui `target_stage_id` obrigatorio no body:**
O operador que reabre informa para qual estagio o caso deve retornar. Gates do estagio destino sao recriados como PENDING.

- Pros: Controle explicito; sem ambiguidade; gates resetados para o novo contexto
- Contras: Complexidade no endpoint POST /events (REOPENED vira quase uma transicao); muda contrato de FR-007

**Opcao C — Caso volta ao penultimo estagio (ultimo registro em stage_history):**
Logica automatica: ler ultimo stage_history e reverter para from_stage_id. Gates recriados.

- Pros: Automatico; sem input adicional do operador
- Contras: O penultimo estagio pode nao ser o correto; sem flexibilidade; logica fragil se houver multiplos caminhos

**Recomendacao:** Opcao B — `target_stage_id` obrigatorio no body de REOPENED.

**Resolucao:**

> **Decisao:** Opcao B — REOPENED inclui `target_stage_id` obrigatorio no body
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Motor nao adivinha — operador decide para qual estagio retornar via target_stage_id obrigatorio. Gates do estagio destino recriados como PENDING. Principio de explicitness.
> **Artefato de saida:** FR-007 (target_stage_id + scope reopen), FR-002 (gate reset na reabertura), DATA-006 (payload REOPENED), BR-016 (regra completa)
> **Implementado em:** 2026-03-19

---

### Fase 3: Validacao — PENDENTE

O `/validate-all` ainda nao foi executado para o MOD-006. Com o enriquecimento completo e todas as pendencias resolvidas, o proximo passo e executar a validacao.

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
                           Orquestra TODAS as validacoes em sequencia:        A EXECUTAR
                           Internamente executa:
                             1. /qa (lint, links, metadados, EX-*, §N, ciclos)
                             2. /validate-manifest (screen manifests vs schema v1)
                             3. /validate-openapi (contratos OpenAPI)
                             4. /validate-drizzle (schemas Drizzle)
                             5. /validate-endpoint (handlers Fastify)
                           Pre-condicao: Enriquecimento concluido
                           Pos-condicao: Relatorio consolidado pass/fail
```

> **Alternativa:** Executar validadores individuais:

```
5a   /qa docs/04_modules/mod-006-execucao-casos/
                           Diagnostico de sintaxe e integridade:              INDIVIDUAL
                           - lint:docs (Pass A-E: EX-*, §N, IDs, context-map, ciclos)
                           - Consistencia de metadados (estado_item, owner)
                           - Dead links, DoR alignment

5b   /validate-manifest ux-case-001.painel-caso.yaml
                           Validar manifests contra schema v1:               INDIVIDUAL
                           - ux-case-001.painel-caso.yaml
                           - ux-case-002.listagem-casos.yaml
                           Verifica: DOC-UX-010, operationId, RBAC,
                           permissions, scopes process:case:*

5c   /validate-openapi mod-006-execucao-casos.yaml                           A EXECUTAR
                           16 endpoints: cases CRUD + transition + gates
                           + assignments + events + timeline

5d   /validate-drizzle mod-006                                               A EXECUTAR
                           5 tabelas: case_instances, stage_history,
                           gate_instances, case_assignments, case_events

5e   /validate-endpoint mod-006                                              A EXECUTAR
                           16 handlers Fastify com scopes RBAC
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | `/qa` | SIM (todos) | SIM | mod-006-execucao-casos.md, requirements/*, adr/*, CHANGELOG.md |
| 2 | `/validate-manifest` | SIM (2 manifests existem) | SIM | ux-case-001.painel-caso, ux-case-002.listagem-casos |
| 3 | `/validate-openapi` | SIM (nivel 2 — backend completo) | SIM | 16 endpoints, 7 scopes |
| 4 | `/validate-drizzle` | SIM (nivel 2 — 5 tabelas proprias) | SIM | case_instances, stage_history, gate_instances, case_assignments, case_events |
| 5 | `/validate-endpoint` | SIM (nivel 2 — handlers Fastify) | SIM | 16 rotas com scope RBAC |

### Fase 4: Promocao — PENDENTE

```
10   /promote-module docs/04_modules/mod-006-execucao-casos/
                           Selar mod-006 como READY:                         A EXECUTAR (apos fase 3)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (5/5 IMPLEMENTADA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (10/10)
                             [DoR-3] Zero erros de lint? ................ A VERIFICAR (executar /qa)
                             [DoR-4] Screen manifests validados? ........ A VERIFICAR (executar /validate-manifest)
                             [DoR-5] ADRs conforme nivel? ............... SIM (5 >= 3 para N2)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v0.4.0)
                             [DoR-7] Bloqueios cross-modulo? ............ ATENCAO (BLK-002 — MOD-005)

                           Fluxo interno:
                             Step 1: /qa (pre-check)
                             Step 2: Promover estado_item DRAFT→READY
                             Step 3: /qa (pos-check)
                             Step 4: /update-index
                             Step 5: /git commit
                           Pre-condicao: QA verde, DoR-1..7 atendidos
                           Pos-condicao: estado_item = READY, INDEX.md atualizado, commit
```

> **Nota:** MOD-006 depende de MOD-000 (Foundation), MOD-003 (Org Structure), MOD-004 (Identidade) e MOD-005 (Processos), todos ainda DRAFT. A promocao do MOD-006 pode ocorrer independentemente — o DoR nao exige que dependencias upstream estejam READY (apenas que existam). Porem, ha o bloqueio BLK-002: blueprints + cycle_version_id freeze do MOD-005 devem estar implementados para que o MOD-006 funcione em runtime.

### Fase 5: Pos-READY (quando necessario)

```
11   /update-specification docs/04_modules/mod-006-execucao-casos/requirements/fr/FR-006.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

12   /create-amendment FR-006 melhoria "descricao da alteracao"
                           Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
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

#### Painel de Pendencias — Resumo Individual

| PENDENTE | Status | Sev. | Dominio | Decisao | Artefato de saida |
|----------|--------|------|---------|---------|-------------------|
| PENDENTE-001 | IMPLEMENTADA | ALTA | SEC | Opcao B — scope dedicado process:case:reopen | DOC-FND-000-M02 |
| PENDENTE-002 | IMPLEMENTADA | ALTA | ARC | Opcao B — DelegationCheckerPort pattern | ADR-005, FR-014, INT-006 §3.2 |
| PENDENTE-003 | IMPLEMENTADA | MEDIA | DATA | Opcao A — query param dedicado object_id | FR-009, INT-006 §2.7 |
| PENDENTE-004 | IMPLEMENTADA | ALTA | SEC | Opcao A — amendment imediato DOC-FND-000-M01 | DOC-FND-000-M01 |
| PENDENTE-005 | IMPLEMENTADA | MEDIA | BIZ | Opcao B — target_stage_id obrigatorio no REOPENED | FR-007, FR-002, DATA-006, BR-016 |

> Detalhamento completo: ver [Fase 2](#pendentes-resolvidas-no-enriquecimento--detalhamento-completo).

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
US-MOD-006 (APPROVED v1.2.0)              ← Fase 0: CONCLUIDA
  │  4/4 features APPROVED (Backend + UX)
  ▼
mod-006-execucao-casos/ (stubs DRAFT)      ← Fase 1: CONCLUIDA (forge-module v0.1.0)
  │
  ▼
mod-006 enriquecido (DRAFT v0.4.0)         ← Fase 2: CONCLUIDA (10 agentes, 5 PENDENTEs resolvidas)
  │
  ├── ★ PROXIMO PASSO: /validate-all
  │     ├── /qa .................. A EXECUTAR
  │     ├── /validate-manifest ... A EXECUTAR (2 manifests)
  │     ├── /validate-openapi .... A EXECUTAR (16 endpoints)
  │     ├── /validate-drizzle .... A EXECUTAR (5 tabelas)
  │     └── /validate-endpoint ... A EXECUTAR (16 handlers)
  │
  ▼
mod-006 validado (DRAFT)                   ← Fase 3: A EXECUTAR
  │
  ├── Gate 0 (DoR): 5/7 atendidos, 2 A VERIFICAR (lint + manifests)
  │
  ▼
mod-006 selado (READY)                     ← Fase 4: A EXECUTAR (apos fase 3)
  │
  ▼
mod-006 + amendments/                      ← Fase 5: SOB DEMANDA (0 amendments no modulo)

Dependencias upstream: MOD-000, MOD-003, MOD-004, MOD-005 — camada topologica 4.
Bloqueio: BLK-002 (MOD-005 blueprints + cycle_version_id freeze).
MOD-006 prove motor de execucao para MOD-007 (Parametrizacao), MOD-008 (Protheus), MOD-009 (Aprovacao).
Amendments cross-module: DOC-FND-000-M01 (6 scopes), DOC-FND-000-M02 (scope reopen).
```

---

## Particularidades do MOD-006

| Aspecto | Detalhe |
|---------|---------|
| Nivel 2 — DDD-lite + Full Clean (Score 5/6) | Dominio rico com aggregate root CaseInstance, value objects (CaseStatus, GateResolutionStatus, GateDecision), domain services (TransitionEngine, GateResolver, TimelineService). Todos os 5 validadores aplicaveis. |
| Motor de Transicao com 5 Validacoes | Sequencia obrigatoria: (1) caso OPEN, (2) transicao valida no blueprint, (3) papel autorizado, (4) gates required resolvidos, (5) evidencia fornecida se required. ADR-001 garante atomicidade em transacao unica. |
| 3 Historicos Independentes | stage_history (onde esteve), gate_instances (como gates foram resolvidos), case_events (fatos relevantes sem mudanca de estagio). ADR-003 formaliza a decisao. Timeline intercala os 3 cronologicamente. |
| Freeze de cycle_version_id | Ao abrir um caso, o sistema captura a versao exata do ciclo vigente. Fork ou atualizacao do blueprint no MOD-005 nao afeta instancias em andamento. ADR-002 formaliza. Bloqueio BLK-002 depende de MOD-005 implementar isso. |
| 7 Scopes RBAC | 6 scopes originais + 1 scope reopen (PENDENTE-001). Registrados via 2 amendments no MOD-000 (DOC-FND-000-M01 e M02). Granularidade maxima para auditoria. |
| 5 ADRs para Nivel 2 | Excede o minimo de 3. ADR-001 (Motor Atomico), ADR-002 (Freeze cycle_version_id), ADR-003 (3 Historicos), ADR-004 (Optimistic Locking), ADR-005 (Background Job Expiracao). |
| Bloqueio BLK-002 | MOD-005 deve ter blueprints + cycle_version_id freeze implementados antes que MOD-006 possa funcionar em runtime. Nao impede promocao da especificacao, mas impede deploy. |
| 4 Dependencias Upstream | MOD-000 (auth, RBAC, events), MOD-003 (org_units), MOD-004 (delegacoes), MOD-005 (blueprints). Camada topologica 4 — mais profunda que a maioria dos modulos. |
| 3 Dependentes Downstream | MOD-007 (avalia motor durante transicoes), MOD-008 (transicoes inbound como trigger), MOD-009 (gates dentro de processos). MOD-006 e ponto critico na cadeia. |
| Background Job de Expiracao | ADR-005 + PENDENTE-002: job a cada 5 min via DelegationCheckerPort para desativar atribuicoes expiradas. Evolutivamente migrara para event-driven quando MOD-004 emitir delegation.expired. |

---

## Checklist Rapido — O que Falta para READY

- [ ] Executar `/validate-all docs/04_modules/mod-006-execucao-casos/` — /qa + /validate-manifest + /validate-openapi + /validate-drizzle + /validate-endpoint
- [ ] Corrigir eventuais erros encontrados
- [ ] Executar `/promote-module docs/04_modules/mod-006-execucao-casos/` — verificar Gate 0 (DoR) 7/7

> **Nota:** Todas as 5 pendencias ja estao IMPLEMENTADA. Os 10 artefatos de requisitos estao enriquecidos. As 5 ADRs excedem o minimo para Nivel 2 (3). Ha 1 bloqueio (BLK-002 — MOD-005) que nao impede promocao da especificacao mas impede deploy. Os 7 scopes ja foram registrados no Foundation via amendments DOC-FND-000-M01 e M02. Camada topologica 4 — depende de MOD-000, MOD-003, MOD-004 e MOD-005.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 1.0.0 | 2026-03-22 | Criacao completa: Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 5 pendentes resolvidas (001-005), rastreio de 10 agentes, mapa de cobertura de 5 validadores, particularidades Nivel 2 DDD-lite, bloqueio BLK-002, 2 amendments cross-module |
