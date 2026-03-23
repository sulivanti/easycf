# Procedimento — Plano de Acao MOD-004 Identidade Avancada

> **Versao:** 2.0.0 | **Data:** 2026-03-22 | **Owner:** Marcos Sulivan
> **Estado atual do modulo:** DRAFT (v0.9.0) | **Epico:** READY (v1.1.0) | **Features:** 4/4 READY
>
> Fases 0-2 concluidas. Proximo passo: Fase 3 (Validacao) — executar `/validate-all`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-004 | READY (v1.1.0) | DoR 7/8 completo (falta owner confirmar APPROVED), 4 features vinculadas, EP02 |
| Features F01-F04 | 4/4 READY | F01 (API: user_org_scopes), F02 (API: shares+delegations+job expiracao), F03 (UX: escopo org), F04 (UX: painel shares/delegations) |
| Scaffold (forge-module) | CONCLUIDO | mod-004-identidade-avancada/ com estrutura completa Nivel 2 |
| Enriquecimento (10 agentes) | CONCLUIDO | Agentes 01-10 confirmados, v0.9.0, 3 pendentes resolvidas |
| PENDENTEs | 0 abertas | 3 total: 3 IMPLEMENTADA |
| ADRs | 4 criadas | Nivel 2 requer minimo 3 — atendido (ADR-001 auto-auth service, ADR-002 tenant_id RLS, ADR-003 outbox pattern, ADR-004 regex escopos proibidos) |
| Amendments | 0 | Nenhum |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v0.9.0 | Ultima entrada 2026-03-17 (AGN-DEV-08 NFR). Pipeline Mermaid stale (E3 — enriquecimento de fato concluido) |
| Screen Manifests | 2/2 existem | ux-idn-001.org-scope, ux-idn-002.shares-delegations |
| Dependencias | 2 upstream (MOD-000, MOD-003) | Consome auth/RBAC/events de MOD-000 e org_units de MOD-003 |
| Bloqueios | 0 sobre MOD-004 | Nenhum BLK-* afeta MOD-004. MOD-004 emite BLK-003 (MOD-005 depende de org_scopes) |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-004 define a camada de identidade avancada que preenche a lacuna entre MOD-000 (identidade operacional basica — quem pode fazer o que em qual filial) e MOD-003 (estrutura organizacional — onde a organizacao existe). Tres mecanismos — escopo de area organizacional (`user_org_scopes`), compartilhamento controlado (`access_shares`) e delegacao temporaria (`access_delegations`) — resolvem o problema "em qual area organizacional um usuario atua". Com 4 features cobrindo backend (F01, F02) e frontend (F03, F04), o modulo foi aprovado como READY com DoR quase completo (7/8 — falta confirmacao formal APPROVED pelo owner).

```
1    (manual)              Revisar e finalizar epico US-MOD-004:             CONCLUIDO
                           - Escopo fechado (4 features: 2 backend + 2 UX)  status_agil = READY
                           - Gherkin validado (6 cenarios epico)             v1.1.0
                           - DoR completo (modelo de dados, endpoints, regras)
                           - Gap MOD-000 vs MOD-004 documentado
                           - Decisoes tecnicas 2026-03-15 incorporadas
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-004.md

2    (manual)              Revisar e finalizar features F01-F04:             CONCLUIDO
                           - F01: API user_org_scopes (CRUD + Redis)         4/4 READY
                           - F02: API access_shares + access_delegations + job
                           - F03: UX Escopo organizacional do usuario
                           - F04: UX Compartilhamentos e delegacoes ativas
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-004-F{01..04}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Primeiro modulo Nivel 2 (DDD-lite + Clean Completo) scaffoldado. Score 5/6 no DOC-ESC-001 §4.2 com gatilhos: estado/workflow, compliance/auditoria, concorrencia/consistencia, multi-tenant e regras cruzadas/reuso alto.

```
3    /forge-module MOD-004  Scaffold completo gerado:                        CONCLUIDO
                           mod-004-identidade-avancada.md, CHANGELOG.md,    v0.1.0 (2026-03-16)
                           requirements/ (br/, fr/, data/, int/, sec/,
                           ux/, nfr/), adr/, amendments/
                           Stubs obrigatorios: BR-001, FR-001, DATA-001,
                           DATA-003, INT-001, SEC-001, SEC-002, UX-001,
                           NFR-001, PEN-004
                           Pasta: docs/04_modules/mod-004-identidade-avancada/
```

### Fase 2: Enriquecimento — CONCLUIDO

O enriquecimento do MOD-004 foi completo — todos os 10 agentes rodaram entre 2026-03-16 e 2026-03-18 em 2 batches (batch 1: AGN-DEV-01 a AGN-DEV-03 em 2026-03-16; batch 2: AGN-DEV-04 a AGN-DEV-10 em 2026-03-17). Durante o processo, 3 pendencias foram identificadas e todas resolvidas. Destaque para o enriquecimento profundo exigido pelo Nivel 2: DDD-lite com aggregates, value objects, domain events (9 catalogados), Outbox Pattern, cache Redis com invalidacao+TTL, e 11 endpoints documentados.

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-004
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-004
> ```

```
4    /enrich docs/04_modules/mod-004-identidade-avancada/
                           Agentes executados sobre mod-004:                 CONCLUIDO
                           AGN-DEV-01 (MOD), AGN-DEV-02 (BR),              v0.9.0 (2026-03-17)
                           AGN-DEV-03 (FR), AGN-DEV-04 (DATA),
                           AGN-DEV-05 (INT), AGN-DEV-06 (SEC),
                           AGN-DEV-07 (UX), AGN-DEV-08 (NFR),
                           AGN-DEV-09 (ADR), AGN-DEV-10 (PEN)
                           3 pendentes criadas e resolvidas (001-003)
```

#### Rastreio de Agentes — MOD-004

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-004-identidade-avancada.md | CONCLUIDO | CHANGELOG v0.2.0 — Nivel 2 confirmado (score 5/6), module_paths detalhados (API+Web), OKRs, premissas/restricoes |
| 2 | AGN-DEV-02 | BR | BR-001.md | CONCLUIDO | v0.3.0 — Gherkin expandido de 4 para 14 cenarios, exemplos concretos, excecoes, impactos categorizados (DATA/FLOW/PERMISSIONS/STATE/COMPLIANCE) |
| 3 | AGN-DEV-03 | FR | FR-001.md | CONCLUIDO | v0.3.0 — 24 cenarios Gherkin (6+7+6+5), 11 endpoints consolidados, deps expandidas (INT-001, DATA-003, SEC-002) |
| 4 | AGN-DEV-04 | DATA | DATA-001.md, DATA-003.md | CONCLUIDO | v0.4.0 — tenant_id RLS, 12 indices explicitos, constraints ON DELETE RESTRICT, ERD expandido, outbox com dedupe_key, UI Actions DOC-ARC-003 |
| 5 | AGN-DEV-05 | INT | INT-001.md | CONCLUIDO | v0.5.0 — failure_behavior detalhado, contratos MOD-000/MOD-003, contrato exposicao INT-001.5 (user_org_scopes para MOD-005/006/007/008), TTL cache 300s |
| 6 | AGN-DEV-06 | SEC | SEC-001.md, SEC-002.md | CONCLUIDO | v0.6.0 — 11 endpoints mapeados com scopes, RLS, mascaramento por sensitivity_level, LGPD, Gherkin seguranca (5+4 cenarios) |
| 7 | AGN-DEV-07 | UX | UX-001.md | CONCLUIDO | v0.7.0 — 15 acoes mapeadas (4 UX-IDN-001 + 11 UX-IDN-002), telemetria UIActionEnvelope, acessibilidade, estados por painel, tratamento erros HTTP |
| 8 | AGN-DEV-08 | NFR | NFR-001.md | CONCLUIDO | v0.9.0 — SLOs (latencia p95, cache), topologia sync+async, degradacao (4 cenarios), health checks (4), metricas Prometheus (7), estrategia testes Nivel 2 |
| 9 | AGN-DEV-09 | ADR | ADR-001, ADR-002, ADR-003, ADR-004 | CONCLUIDO | v0.8.0 — 4 ADRs criadas: auto-auth service (ADR-001), tenant_id RLS (ADR-002), outbox pattern (ADR-003), regex escopos proibidos (ADR-004) |
| 10 | AGN-DEV-10 | PEN | pen-004-pendente.md | CONCLUIDO | v0.1.0 — 3 pendentes criadas (scopes catalogo, contrato exposicao, TTL cache) |

#### Pendentes Resolvidas no Enriquecimento — Detalhamento Completo

> As 3 pendencias abaixo foram identificadas durante o enriquecimento e todas foram decididas e implementadas em 2026-03-18.

---

##### ~~PENDENTE-001 — Scopes MOD-004 ausentes no catalogo canonico DOC-FND-000 §2.2~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** SEC
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **rastreia_para:** SEC-001, DOC-FND-000, MOD-000
- **tags:** scopes, catalogo-canonico, rbac, gate-3
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A

**Questao:**
O SEC-001 §2.1 define 8 escopos para o MOD-004 (`identity:org_scope:read`, `identity:org_scope:write`, `identity:share:read`, `identity:share:write`, `identity:share:revoke`, `identity:share:authorize`, `identity:delegation:read`, `identity:delegation:write`). Porem, o catalogo canonico em DOC-FND-000 §2.2 NAO lista nenhum desses scopes. Conforme DOC-FND-000 §2.2: "Todo modulo que adiciona novos scopes DEVE registra-los via PR atualizando o catalogo canonico." Adicionalmente, a regra de Gate 3 (DOC-ARC-003B) determina que o CI DEVE falhar se encontrar scope nao registrado.

**Impacto:**
Sem o registro no catalogo canonico, o Gate 3 do CI falhara ao validar os Screen Manifests do MOD-004. Os 8 scopes ficam sem rastreabilidade centralizada e outros modulos nao podem referenciar os scopes de identidade avancada.

**Opcao A — PR para DOC-FND-000 §2.2 agora:**
Registrar os 8 scopes no catalogo canonico imediatamente, seguindo o padrao de 3 segmentos ja adotado.

- Pros: desbloqueia Gate 3; rastreabilidade imediata; padrao seguido
- Contras: requer revisao da DOC-FND-000 (documento normativo)

**Opcao B — Registrar junto com a primeira implementacao:**
Adiar o registro para quando o primeiro PR de codigo do MOD-004 for aberto.

- Pros: registro junto com implementacao real; menos churn em docs
- Contras: Gate 3 falha ate o PR; outros modulos nao podem referenciar os scopes antecipadamente

**Recomendacao:** Opcao A — Registrar agora. O registro e simples (adicionar 8 linhas na tabela), segue o padrao ja aplicado por MOD-003 e MOD-005, e desbloqueia Gate 3 para validacao dos Screen Manifests.

**Resolucao:**

> **Decisao:** Opcao A — PR para DOC-FND-000 §2.2 agora
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** O registro e simples (adicionar 8 linhas na tabela), segue o padrao ja aplicado por MOD-003 e MOD-005, e desbloqueia Gate 3 para validacao dos Screen Manifests.
> **Artefato de saida:** DOC-FND-000 §2.2 (8 scopes identity:* adicionados ao catalogo canonico)
> **Implementado em:** 2026-03-18

---

##### ~~PENDENTE-002 — Contrato de consumo de user_org_scopes por modulos dependentes~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** INT
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **rastreia_para:** INT-001, MOD-005, MOD-006, MOD-007, MOD-008
- **tags:** integracao, consumo, user-org-scopes, dependentes
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A

**Questao:**
O mod.md §4 lista MOD-005, MOD-006, MOD-007 e MOD-008 como modulos dependentes que consomem `user_org_scopes` para filtrar dados por area organizacional. Porem, INT-001 documenta apenas as integracoes que o MOD-004 CONSOME (Redis, BullMQ, MOD-000, MOD-003), e nao o contrato que o MOD-004 EXPOE para consumidores. Nao existe documentacao de como os modulos downstream devem consultar `user_org_scopes` (JOIN direto? API interna? Event subscription?).

**Impacto:**
Sem contrato explicito, cada modulo consumidor pode implementar o consumo de forma diferente, gerando acoplamento inconsistente. Se o MOD-004 mudar a estrutura de `user_org_scopes`, nao ha referencia para avaliar impacto nos dependentes.

**Opcao A — Documentar contrato de exposicao em INT-001:**
Adicionar secao INT-001.5 com o contrato que o MOD-004 expoe: tabela `user_org_scopes` via JOIN direto (banco compartilhado), com campos, indices e regras de filtragem documentados.

- Pros: contrato explicito; impacto avaliavel em mudancas; padrao INT reaproveitavel
- Contras: pode ser prematuro se os modulos consumidores ainda nao estao especificados

**Opcao B — Delegar aos modulos consumidores:**
Cada MOD-005/006/007/008 documenta em seu proprio INT como consome `user_org_scopes`.

- Pros: responsabilidade do consumidor; documentacao onde e usada
- Contras: risco de inconsistencia; sem visao centralizada no MOD-004

**Recomendacao:** Opcao A — Documentar o contrato de exposicao no INT-001 do MOD-004.

**Acao sugerida:**

| Skill | Proposito | Quando executar |
|---|---|---|
| `/enrich-agent MOD-004 AGN-DEV-05` | Enriquecer INT-001 com secao INT-001.5 (contrato de exposicao) | Apos decisao |

**Resolucao:**

> **Decisao:** Opcao A — Documentar contrato de exposicao em INT-001 (secao INT-001.5)
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** Contrato de exposicao centralizado no INT-001 do MOD-004 permite avaliar impacto de mudancas em `user_org_scopes` nos modulos consumidores (MOD-005/006/007/008). Documentacao dispersa nos consumidores geraria inconsistencia e perda de visao centralizada.
> **Artefato de saida:** INT-001.5 v0.5.0 (contrato de exposicao user_org_scopes — tabela exposta, regras de consumo, padrao JOIN, invalidacao, modulos consumidores registrados)
> **Implementado em:** 2026-03-18

---

##### ~~PENDENTE-003 — Estrategia de expiracao do cache Redis (TTL vs invalidacao pura)~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **rastreia_para:** INT-001.1, NFR-001.1, DATA-001, ADR-003
- **tags:** redis, cache, ttl, invalidacao, performance
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A

**Questao:**
INT-001.1 define invalidacao de cache Redis via `DEL auth:org_scope:user:{userId}` em mutacoes (create/delete/expire). Porem, nao esta definido se a chave de cache e populada com TTL (auto-expira) ou se depende exclusivamente de invalidacao explicita. Se o Worker de expiracao (INT-001.2) falhar e a invalidacao Redis tambem falhar (fallback: log + continue), um usuario poderia manter cache stale indefinidamente com escopos organizacionais ja expirados.

**Impacto:**
Sem TTL no cache, uma falha dupla (Worker parado + Redis DEL falhando) pode manter escopos organizacionais desatualizados no cache por tempo indeterminado, afetando a filtragem por area em modulos consumidores (MOD-005-008).

**Opcao A — TTL no cache (ex: 5 minutos):**
Definir TTL na chave `auth:org_scope:user:{userId}` igual ao intervalo do job de expiracao. O cache auto-expira mesmo se a invalidacao explicita falhar.

- Pros: safety net contra falha dupla; comportamento previsivel; alinhado com OKR-3 (< 5min)
- Contras: cache miss mais frequente (a cada 5 min mesmo sem mutacao); leve aumento de carga no DB

**Opcao B — Invalidacao pura (sem TTL):**
Confiar exclusivamente no `DEL` explicito. Se falhar, o proximo acesso usa cache stale ate a proxima mutacao.

- Pros: cache hit maximo; sem round-trips desnecessarios ao DB
- Contras: risco de stale cache em falha dupla; sem safety net

**Recomendacao:** Opcao A — Usar TTL de 5 minutos, alinhado com o intervalo do background job.

**Acao sugerida:**

| Skill | Proposito | Quando executar |
|---|---|---|
| `/enrich-agent MOD-004 AGN-DEV-05` | Atualizar INT-001.1 com definicao de TTL | Apos decisao |

**Resolucao:**

> **Decisao:** Opcao A — TTL de 300s (5 minutos) no cache Redis
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** Safety net contra falha dupla (Worker parado + Redis DEL falhando). TTL alinhado com intervalo do background job (5min) e OKR-3. Custo aceitavel: 1 query extra por usuario a cada 5 min sem mutacao.
> **Artefato de saida:** INT-001.1 v0.4.0 (contrato SET com EX 300 + nota safety net)
> **Implementado em:** 2026-03-18

---

### Fase 3: Validacao — PENDENTE

O `/validate-all` ainda nao foi executado para o MOD-004. Com o enriquecimento completo e todas as pendencias resolvidas, o proximo passo e executar a validacao.

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
5    /validate-all docs/04_modules/mod-004-identidade-avancada/
                           Orquestra TODAS as validacoes em sequencia:        A EXECUTAR
                           Internamente executa:
                             1. /qa (lint, links, metadados, EX-*, §N, ciclos)
                             2. /validate-manifest (screen manifests vs schema v1)
                             3. /validate-openapi → FUTURO (pos-codigo)
                             4. /validate-drizzle → FUTURO (pos-codigo)
                             5. /validate-endpoint → FUTURO (pos-codigo)
                           Pre-condicao: Enriquecimento concluido
                           Pos-condicao: Relatorio consolidado pass/fail
```

> **Alternativa:** Executar validadores individuais:

```
5a   /qa docs/04_modules/mod-004-identidade-avancada/
                           Diagnostico de sintaxe e integridade:              INDIVIDUAL
                           - lint:docs (Pass A-E: EX-*, §N, IDs, context-map, ciclos)
                           - Consistencia de metadados (estado_item, owner)
                           - Dead links, DoR alignment

5b   /validate-manifest ux-idn-001.org-scope.yaml
                           Validar manifests contra schema v1:               INDIVIDUAL
                           - ux-idn-001.org-scope.yaml
                           - ux-idn-002.shares-delegations.yaml
                           Verifica: DOC-UX-010, operationId, RBAC,
                           telemetria, permissions

5c   /validate-openapi                                                       FUTURO (pos-codigo)
5d   /validate-drizzle                                                       FUTURO (pos-codigo)
5e   /validate-endpoint                                                      FUTURO (pos-codigo)
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | `/qa` | SIM (todos) | SIM | mod-004-identidade-avancada.md, requirements/*, adr/*, CHANGELOG.md |
| 2 | `/validate-manifest` | SIM (2 manifests existem) | SIM | ux-idn-001.org-scope, ux-idn-002.shares-delegations |
| 3 | `/validate-openapi` | SIM (Nivel 2) | FUTURO | apps/api/openapi/ — nao existe ainda |
| 4 | `/validate-drizzle` | SIM (Nivel 2) | FUTURO | apps/api/src/modules/identity-advanced/domain/ — nao existe |
| 5 | `/validate-endpoint` | SIM (Nivel 2) | FUTURO | apps/api/src/modules/identity-advanced/presentation/routes/ — nao existe |

### Fase 4: Promocao — PENDENTE

```
10   /promote-module docs/04_modules/mod-004-identidade-avancada/
                           Selar mod-004 como READY:                         A EXECUTAR (apos fase 3)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (3/3 IMPLEMENTADA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (10/10)
                             [DoR-3] Zero erros de lint? ................ A VERIFICAR (executar /qa)
                             [DoR-4] Screen manifests validados? ........ A VERIFICAR (executar /validate-manifest)
                             [DoR-5] ADRs conforme nivel? ............... SIM (4 >= 3 para N2)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v0.9.0)
                             [DoR-7] Bloqueios cross-modulo? ............ SIM (0 bloqueios sobre MOD-004)

                           Fluxo interno:
                             Step 1: /qa (pre-check)
                             Step 2: Promover estado_item DRAFT→READY
                             Step 3: /qa (pos-check)
                             Step 4: /update-index
                             Step 5: /git commit
                           Pre-condicao: QA verde, DoR-1..7 atendidos
                           Pos-condicao: estado_item = READY, INDEX.md atualizado, commit
```

> **Nota:** MOD-004 depende de MOD-000 (Foundation) e MOD-003 (Estrutura Organizacional), ambos ainda DRAFT. A promocao do MOD-004 pode ocorrer independentemente — o DoR nao exige que dependencias upstream estejam READY (apenas que existam). Porem, o codigo so pode ser gerado quando MOD-000 e MOD-003 estiverem READY (endpoints implementados). Rota sequencial ideal: MOD-000 → MOD-003 → MOD-004.

### Fase 5: Pos-READY (quando necessario)

```
11   /update-specification docs/04_modules/mod-004-identidade-avancada/requirements/fr/FR-001.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

12   /create-amendment FR-001 melhoria "descricao"
                           Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
                           Casos de uso previstos:
                           - Revisao periodica de acessos (Wave 3)
                           - Contas tecnicas e agentes (Wave 4+)
```

### Gestao de Pendencias (qualquer momento)

> **Decision tree de pendencias:**
>
> ```
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-004
> ├── Criar nova pendencia     → /manage-pendentes create PEN-004
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-004 PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-004 PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-004 PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-004 PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-004
> ```

```
16   /manage-pendentes list PEN-004
                           Estado atual MOD-004:
                             PEN-004: 3 itens total
                               3 IMPLEMENTADA (001-003)
                               0 ABERTA
                             SLA: nenhum vencido
```

#### Painel de Pendencias — Resumo Individual

| PENDENTE | Status | Sev. | Dominio | Decisao | Artefato de saida |
|----------|--------|------|---------|---------|-------------------|
| PENDENTE-001 | IMPLEMENTADA | ALTA | SEC | Opcao A — 8 scopes identity:* registrados no catalogo canonico (DOC-FND-000 §2.2) | DOC-FND-000 §2.2 |
| PENDENTE-002 | IMPLEMENTADA | MEDIA | INT | Opcao A — Contrato de exposicao user_org_scopes em INT-001.5 | INT-001.5 v0.5.0 |
| PENDENTE-003 | IMPLEMENTADA | MEDIA | ARC | Opcao A — TTL 300s no cache Redis como safety net contra falha dupla | INT-001.1 v0.4.0 |

> Detalhamento completo: ver [Fase 2](#pendentes-resolvidas-no-enriquecimento--detalhamento-completo).

### Utilitarios (qualquer momento)

```
14   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-004): <descricao>

15   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

17   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-004

```
US-MOD-004 (READY v1.1.0)              ← Fase 0: CONCLUIDA
  │  4/4 features READY (2 backend + 2 UX)
  │  Nivel 2 — DDD-lite + Clean Completo (score 5/6)
  ▼
mod-004-identidade-avancada/ (stubs DRAFT) ← Fase 1: CONCLUIDA (forge-module v0.1.0)
  │
  ▼
mod-004 enriquecido (DRAFT v0.9.0)     ← Fase 2: CONCLUIDA (10 agentes, 3 PENDENTEs resolvidas)
  │
  ├── ★ PROXIMO PASSO: /validate-all
  │     ├── /qa .................. A EXECUTAR
  │     ├── /validate-manifest ... A EXECUTAR (2 manifests)
  │     ├── /validate-openapi .... FUTURO (pos-codigo)
  │     ├── /validate-drizzle .... FUTURO (pos-codigo)
  │     └── /validate-endpoint ... FUTURO (pos-codigo)
  │
  ▼
mod-004 validado (DRAFT)                ← Fase 3: A EXECUTAR
  │
  ├── Gate 0 (DoR): 5/7 atendidos, 2 A VERIFICAR (lint + manifests)
  │
  ▼
mod-004 selado (READY)                  ← Fase 4: A EXECUTAR (apos fase 3)
  │
  ▼
mod-004 + amendments/                   ← Fase 5: SOB DEMANDA (0 amendments)

Dependencias upstream: MOD-000 (Foundation) + MOD-003 (Estrutura Organizacional)
Camada topologica: 2 (implementar apos MOD-000 e MOD-003)
Dependentes downstream: MOD-005 (Processos), MOD-006 (Execucao), MOD-007 (Parametrizacao), MOD-008 (Protheus), MOD-009 (Aprovacoes)
Bloqueio emitido: BLK-003 — MOD-005 depende de org_scopes de MOD-004
```

---

## Particularidades do MOD-004

| Aspecto | Detalhe |
|---------|---------|
| Hub de identidade avancada | MOD-004 preenche a lacuna entre MOD-000 (identidade basica: quem pode fazer o que em qual filial) e MOD-003 (estrutura organizacional: onde a organizacao existe). Tres mecanismos — escopo de area, compartilhamento controlado e delegacao temporaria — resolvem o problema "em qual area organizacional um usuario atua". Sua promocao desbloqueia BLK-003 e habilita MOD-005 (Processos) a avancar. |
| Nivel 2 com cache Redis obrigatorio | Unico modulo ate o momento que combina cache Redis com invalidacao por mutacao (`DEL auth:org_scope:user:{userId}`) E TTL safety net de 300s (decidido via PENDENTE-003). Background job BullMQ a cada 5min para expiracao automatica de shares/delegations/org_scopes via Outbox Pattern. |
| Regra inegociavel de delegacao | Delegacoes NUNCA podem conter escopos `:approve`, `:execute`, `:sign` — invariante de dominio protegido por regex no service (ADR-004). Esta regra impede que delegatarios tomem decisoes em nome do delegante, preservando segregacao de responsabilidade. |
| Validacao de autorizacao por scope (nao CHECK constraint) | Auto-autorizacao em compartilhamentos (`grantor_id = authorized_by`) e permitida condicionalmente ao scope `identity:share:authorize` — validacao no service, nao no banco (ADR-001). Decisao tecnica de 2026-03-15 removeu CHECK constraint absoluto. |
| 4 ADRs para Nivel 2 | Excede o minimo de 3 ADRs. ADR-001 (auto-auth service), ADR-002 (tenant_id RLS), ADR-003 (outbox pattern), ADR-004 (regex escopos proibidos). A riqueza de ADRs reflete decisoes arquiteturais nao-obvias do dominio de identidade. |
| Dependencias upstream ambas em DRAFT | MOD-000 e MOD-003 sao pre-requisitos na camada topologica e ambos ainda estao em DRAFT. A promocao de especificacao do MOD-004 nao depende do estado dos upstream, mas a implementacao de codigo sim. Rota sequencial ideal: MOD-000 → MOD-003 → MOD-004. |
| CHANGELOG Mermaid stale | Pipeline Mermaid ainda mostra Etapa 3 ("Stubs em DRAFT"), mas o enriquecimento (Etapa 4) esta integralmente concluido com 10 agentes e 3 pendencias resolvidas. Deve ser corrigido para Etapa 4 antes da validacao/promocao. |
| Escopo expandido pos-enriquecimento | INT-001 expandido com secao INT-001.5 (contrato de exposicao user_org_scopes) via PENDENTE-002, e INT-001.1 atualizado com TTL 300s via PENDENTE-003. Total de 10 artefatos de requisitos mantido. |

---

## Checklist Rapido — O que Falta para READY

- [ ] Corrigir pipeline Mermaid no CHANGELOG.md (E3 → E4 concluida)
- [ ] Executar `/validate-all docs/04_modules/mod-004-identidade-avancada/` — /qa + /validate-manifest
- [ ] Corrigir eventuais erros encontrados
- [ ] Re-executar validacao ate aprovacao limpa
- [ ] Executar `/promote-module docs/04_modules/mod-004-identidade-avancada/` — verificar Gate 0 (DoR) 7/7

> **Nota:** Todas as 3 pendencias ja estao IMPLEMENTADA. Os 10 artefatos de requisitos estao enriquecidos. As 4 ADRs excedem o minimo para Nivel 2. Nao ha bloqueios (BLK-*) afetando MOD-004. As dependencias upstream (MOD-000, MOD-003) estao DRAFT mas isso nao impede a promocao da especificacao — apenas a geracao de codigo. A promocao do MOD-004 desbloqueia BLK-003 e habilita MOD-005 (Processos) a avancar.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 2.0.0 | 2026-03-22 | Reescrita completa no formato padrao (sem acentos): Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 3 pendentes resolvidas (001-003), rastreio de 10 agentes, mapa de cobertura de validadores, particularidades Nivel 2 com cache Redis, 4 ADRs, dependencias upstream |
| 1.0.0 | 2026-03-21 | Criacao inicial. Diagnostico: Fase 2 concluida (10 agentes, 3 pendencias resolvidas). Pronto para Fase 3 (validacao) |
