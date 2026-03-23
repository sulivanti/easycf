# Procedimento — Plano de Acao MOD-007 Parametrizacao Contextual e Rotinas

> **Versao:** 1.0.0 | **Data:** 2026-03-22 | **Owner:** arquitetura
> **Estado atual do modulo:** DRAFT (v0.4.0) | **Epico:** APPROVED (v1.3.0) | **Features:** 5/5 APPROVED
>
> Fases 0-2 concluidas. Proximo passo: Fase 3 (Validacao) — executar `/validate-all`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-007 | APPROVED (v1.3.0) | DoR completo, 5 features vinculadas, 4 gaps do Documento Mestre enderecados |
| Features F01-F05 | 5/5 APPROVED | F01 (Enquadradores+Objetos+Incidencias), F02 (Rotinas+Itens+Versionamento), F03 (Motor de Avaliacao), F04 (UX Configurador), F05 (UX Cadastro Rotinas) |
| Scaffold (forge-module) | CONCLUIDO | mod-007-parametrizacao-contextual/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | Agentes 01-10 confirmados, v0.4.0, 6 pendentes resolvidas + 2 abertas |
| PENDENTEs | 2 abertas | 8 total: 6 IMPLEMENTADA, 2 ABERTA (PENDENTE-007, PENDENTE-008) |
| ADRs | 6 criadas | Nivel 2 requer minimo 2 — atendido (ADR-001 a ADR-006) |
| Amendments | 0 | Nenhum |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v0.6.0 | Ultima entrada 2026-03-19 (PENDENTE-001 decidida) |
| Screen Manifests | 2/2 existem | ux-param-001, ux-rotina-001 |
| Dependencias | 5 upstream (MOD-000, MOD-003, MOD-004, MOD-005, MOD-006) | Consome Foundation core, org_units, scopes contextuais, ciclos referenciados, motor de transicao |
| Dependentes | 3 downstream (MOD-008, MOD-010, MOD-011) | MOD-008 herda behavior_routines, MOD-010/MOD-011 consomem motor |
| Bloqueios | 0 | Nenhum BLK-* afeta MOD-007 diretamente |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-007 define o modulo de parametrizacao contextual e rotinas de comportamento, que funciona como camada de mediacao: o mesmo objeto de negocio pode ter campos, defaults, dominios e validacoes diferentes dependendo do contexto ativo. O modulo endereqa 4 gaps do Documento Mestre (versionamento de rotinas, priorizacao de contextos, separacao comportamento/integracao, historico de incidencia). Nivel de arquitetura 2 (DDD-lite + Full Clean) com 9 tabelas, 25 endpoints, motor de avaliacao com 6 passos e resolucao de conflitos em duas camadas.

```
1    (manual)              Revisar e finalizar epico US-MOD-007:             CONCLUIDO
                           - Escopo fechado (5 features: 3 Backend + 2 UX)  status_agil = APPROVED
                           - 4 gaps do Documento Mestre enderecados          v1.3.0
                           - Resolucao de conflito em duas camadas definida
                           - Motor de avaliacao sem cache (decisao 2026-03-15)
                           - DoR 100% completo
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-007.md

2    (manual)              Revisar e finalizar features F01-F05:             CONCLUIDO
                           - F01: API Enquadradores + Objetos + Incidencias  5/5 APPROVED
                           - F02: API Rotinas + Itens + Versionamento
                           - F03: Motor de Avaliacao (runtime)
                           - F04: UX Configurador de Enquadradores
                           - F05: UX Cadastro de Rotinas
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-007-F{01..05}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Modulo de Nivel 2 com dominio rico. Scaffoldado em 2026-03-19 a partir do epico APPROVED. Estrutura completa com 9 tabelas, 25 endpoints, 7 scopes e stubs obrigatorios (DATA-003, SEC-002).

```
3    /forge-module MOD-007  Scaffold completo gerado:                        CONCLUIDO
                           mod-007-parametrizacao-contextual.md, CHANGELOG.md, v0.1.0 (2026-03-19)
                           requirements/ (br/, fr/, data/, int/, sec/,
                           ux/, nfr/, pen/), adr/, amendments/
                           Stubs obrigatorios: DATA-003, SEC-002
                           Pasta: docs/04_modules/mod-007-parametrizacao-contextual/
```

### Fase 2: Enriquecimento — CONCLUIDO

O enriquecimento do MOD-007 foi completo — todos os agentes rodaram entre 2026-03-19 e 2026-03-20, incluindo re-enriquecimento (Batch 1-4). Durante o processo, 8 pendencias foram identificadas: 6 decididas e implementadas, 2 permanecem abertas (PENDENTE-007 e PENDENTE-008). Destaque para as decisoes arquiteturais que geraram 6 ADRs e resolveram questoes criticas como engine de expressao (JSONLogic), isolamento de jobs (independente), tabela auxiliar para MOD-008, flag auto_deprecate, limites configuraveis e dry-run.

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-007
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-007
> ```

```
4    /enrich docs/04_modules/mod-007-parametrizacao-contextual/
                           Agentes executados sobre mod-007:                 CONCLUIDO
                           AGN-DEV-01 (MOD), AGN-DEV-02 (BR),              v0.4.0 (2026-03-20)
                           AGN-DEV-03 (FR), AGN-DEV-04 (DATA),
                           AGN-DEV-05 (INT), AGN-DEV-06 (SEC),
                           AGN-DEV-07 (UX), AGN-DEV-08 (NFR),
                           AGN-DEV-09 (ADR), AGN-DEV-10 (PEN)
                           8 pendentes criadas (6 resolvidas, 2 abertas)
                           6 ADRs criadas
```

#### Rastreio de Agentes — MOD-007

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-007-parametrizacao-contextual.md | CONCLUIDO | v0.4.0 — Nivel 2 confirmado, scopes DOC-FND-000, revisao alinhamento |
| 2 | AGN-DEV-02 | BR | BR-007.md | CONCLUIDO | v0.3.0 — BR-001..BR-013 com Gherkin, BR-013 (tenant_id obrigatorio) |
| 3 | AGN-DEV-03 | FR | FR-007.md | CONCLUIDO | v0.5.0 — FR-001..FR-010, Gherkin, idempotency, auto_deprecate, dry_run, limites 422 |
| 4 | AGN-DEV-04 | DATA | DATA-007.md, DATA-003.md | CONCLUIDO | DATA-007 v0.3.0 (9 entidades, constraints, indexes, FK map), DATA-003 v0.3.0 (14 domain events) |
| 5 | AGN-DEV-05 | INT | INT-007.md | CONCLUIDO | v0.3.0 — 5 integracoes, contratos request/response, dry_run flag, INT-005 MOD-005 |
| 6 | AGN-DEV-06 | SEC | SEC-007.md, SEC-002.md | CONCLUIDO | SEC-007 v0.3.0 (authn, authz, 7 scopes, tenant isolation), SEC-002 v0.3.0 (matriz 14 eventos) |
| 7 | AGN-DEV-07 | UX | UX-007.md | CONCLUIDO | v0.3.0 — jornadas UX-PARAM-001 e UX-ROTINA-001, link/unlink, dry_run, auto_deprecate |
| 8 | AGN-DEV-08 | NFR | NFR-007.md | CONCLUIDO | v0.5.0 — SLOs motor (p95<200ms, p99<500ms), CRUD (p95<300ms), disponibilidade >=99.9%, limites configuraveis |
| 9 | AGN-DEV-09 | ADR | ADR-001..ADR-006 | CONCLUIDO | 6 ADRs criadas e re-enriquecidas (cache removido, priority removido, PUBLISHED imutavel, conflito 2 camadas, always fresh, dry-run flag) |
| 10 | AGN-DEV-10 | PEN | pen-007-pendente.md | CONCLUIDO | v0.8.0 — 8 pendentes (6 IMPLEMENTADA, 2 ABERTA) |

#### Pendentes Resolvidas no Enriquecimento — Detalhamento Completo

> As 6 pendencias abaixo foram identificadas durante o enriquecimento e decididas/implementadas entre 2026-03-19 e 2026-03-20. As 2 pendencias abertas (PENDENTE-007 e PENDENTE-008) sao de severidade MEDIA/BAIXA e podem ser decididas antes ou durante a implementacao.

---

##### ~~PENDENTE-001 — condition_expr: Escopo e Sintaxe (v2)~~

- **status:** IMPLEMENTADA
- **severidade:** BAIXA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** FR-004, FR-006, FR-009, DATA-007
- **tags:** condition-expr, json-logic, rule-engine, v2
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** 1

**Questao:**
O campo `condition_expr` em `incidence_rules` e `routine_items` e nullable em v1 (motor ignora). Em v2, sera necessario definir a sintaxe JSON do rule engine. O campo existe no schema (DATA-007) como `jsonb nullable` mas nao e avaliado pelo motor em v1.

**Impacto:**
F01 (incidence_rules), F02 (routine_items), F03 (motor de avaliacao — passo 3 precisara interpretar condition_expr)

**Opcao 1 — JSONLogic:**
Biblioteca madura, JSON nativo, facil de serializar/deserializar. Limitacoes em expressoes complexas com contexto aninhado.

- Pros: Serializacao nativa em jsonb, biblioteca madura (json-logic-js), zero camada de transformacao
- Contras: Limitacoes em expressoes complexas com contexto aninhado

**Opcao 2 — CEL (Common Expression Language):**
Mais expressivo, tipado, usado pelo Google. Requer compilacao de expressao.

- Pros: Mais expressivo, tipado, ecossistema Google
- Contras: Overhead maior, requer compilacao de expressao

**Opcao 3 — Custom DSL:**
Maximo controle, mas custo elevado.

- Pros: Maximo controle
- Contras: Custo de desenvolvimento e manutencao elevado, documentacao e onboarding complexos

**Recomendacao:** Opcao 1 (JSONLogic) — simplicidade, maturidade, serializacao nativa em jsonb.

**Resolucao:**

> **Decisao:** Opcao 1 — JSONLogic como engine de expressao para condition_expr v2. Serializacao nativa em JSON, biblioteca madura. CEL como fallback se limitacoes forem encontradas.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** JSONLogic oferece o melhor equilibrio entre simplicidade e poder expressivo para v2. Serializacao nativa em JSON elimina camada de transformacao — condition_expr armazenado em jsonb e diretamente interpretavel pelo motor. Maturidade da biblioteca (json-logic-js) reduz risco.
> **Artefato de saida:** Decisao registrada em PEN-007. ADR futuro quando v2 iniciar.
> **Implementado em:** Decisao arquitetural documentada; implementacao fisica quando v2 do motor iniciar.

---

##### ~~PENDENTE-002 — Background Job de Expiracao: Compartilhar com MOD-004?~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** BR-002, FR-002, DATA-003, INT-007
- **tags:** job, expiracao, mod-004, isolamento
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** 1

**Questao:**
O job de expiracao de enquadradores (`framer-expiration.job.ts`, BR-002) usa o mesmo padrao do job de expiracao de `access_delegations` no MOD-004. Ambos verificam `valid_until < now()` e mudam status para INACTIVE/EXPIRED. Reutilizar infraestrutura do MOD-004 ou criar job independente?

**Impacto:**
F01 (enquadradores), INT-007 (integracao MOD-004), NFR-007 (resiliencia do job)

**Opcao 1 — Job independente no MOD-007:**
Isolamento total. Falha no job do MOD-004 nao afeta expiracao de enquadradores. Duplicacao de logica de scheduling.

- Pros: Isolamento total, menor blast radius, healthcheck dedicado
- Contras: Duplicacao de logica de scheduling

**Opcao 2 — Infraestrutura compartilhada (job runner generico):**
Extrair job runner generico para MOD-000. MOD-004 e MOD-007 registram suas entidades. Menos duplicacao, mais acoplamento.

- Pros: Menos duplicacao, DRY
- Contras: Acoplamento, complexidade, falha no runner afeta todos

**Opcao 3 — Estender job do MOD-004:**
Menor esforco, mas cria dependencia circular.

- Pros: Menor esforco
- Contras: Dependencia circular (MOD-007 depende de MOD-004 para expiracao)

**Recomendacao:** Opcao 1 — isolamento e mais importante que DRY nesta fase.

**Resolucao:**

> **Decisao:** Opcao 1 — Job independente no MOD-007. Isolamento total.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Isolamento > DRY nesta fase. O job `framer-expiration.job.ts` tem scheduler proprio e healthcheck dedicado. Menor blast radius em caso de falha. Revisitar Opcao 2 quando houver 3+ modulos com jobs de expiracao.
> **Artefato de saida:** NFR-007 (decisao de isolamento documentada)
> **Implementado em:** NFR-007

---

##### ~~PENDENTE-003 — Rotina de Integracao (MOD-008): Campos Especificos~~

- **status:** IMPLEMENTADA
- **severidade:** BAIXA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** DATA-007, INT-007, ADR-003
- **tags:** mod-008, integracao, tabela-auxiliar, routine-type
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** 2

**Questao:**
MOD-008 herdara `behavior_routines` com `routine_type=INTEGRATION`. Campos especificos de integracao (ex: `integration_target`, `mapping_config`, `retry_policy`) devem ser colunas nullable na mesma tabela ou tabela auxiliar com FK?

**Impacto:**
DATA-007 (behavior_routines), INT-007 (INT-004), schema de migracao

**Opcao 1 — Colunas nullable na tabela `behavior_routines`:**
Simples. Campos de integracao sao nullable e ignorados quando `routine_type=BEHAVIOR`.

- Pros: Simples, uma unica tabela
- Contras: Polui tabela principal com campos de outro modulo

**Opcao 2 — Tabela auxiliar `routine_integration_config`:**
FK para `behavior_routines.id` com `WHERE routine_type=INTEGRATION`. Mais limpo, sem colunas nullable.

- Pros: Normalizacao, ownership claro (MOD-007 possui behavior_routines, MOD-008 possui routine_integration_config)
- Contras: Join adicional para rotinas de integracao

**Recomendacao:** Opcao 2 — evita poluir a tabela principal com campos de outro modulo.

**Resolucao:**

> **Decisao:** Opcao 2 — Tabela auxiliar `routine_integration_config`. MOD-008 responsavel pela criacao e migracao.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Normalizacao > simplicidade neste caso. Colunas nullable criariam acoplamento estrutural entre MOD-007 e MOD-008. Ownership claro. Alinhado com ADR-003.
> **Artefato de saida:** Decisao registrada em PEN-007. MOD-008 implementa quando wave chegar.
> **Implementado em:** Decisao arquitetural documentada; migracao fisica sob responsabilidade de MOD-008.

---

##### ~~PENDENTE-004 — Fork Auto-Depreca Versao Anterior?~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** BIZ
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** BR-008, BR-012, FR-005, FR-008, UX-007
- **tags:** fork, auto-deprecate, versionamento, publish
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** 3

**Questao:**
Ao fazer fork de rotina PUBLISHED, a versao original permanece PUBLISHED. Duas versoes podem coexistir como PUBLISHED. O fork deveria auto-deprecar a versao anterior automaticamente?

**Impacto:**
BR-008 (fork), BR-012 (deprecacao), FR-005, FR-008, UX-007 (fluxo de fork)

**Opcao 1 — Nao auto-deprecar (comportamento atual):**
Administrador decide quando deprecar. Permite coexistencia temporaria para migracao gradual.

- Pros: Flexibilidade maxima, migracao gradual de regras
- Contras: Requer acao manual do administrador para deprecar

**Opcao 2 — Auto-deprecar ao publicar o fork:**
Ao publicar nova versao, versao anterior automaticamente DEPRECATED.

- Pros: Gestao simplificada, sem versoes orfas
- Contras: Remove flexibilidade de migracao gradual

**Opcao 3 — Auto-deprecar com flag opcional:**
`POST /admin/routines/:id/publish` aceita `{ auto_deprecate_previous: true }`. Default = false.

- Pros: Maxima flexibilidade, default conservador (nao depreca), permite automacao quando desejado
- Contras: Complexidade adicional no endpoint de publish

**Recomendacao:** Opcao 3 — combina seguranca com flexibilidade.

**Resolucao:**

> **Decisao:** Opcao 3 — Flag opcional `auto_deprecate_previous: boolean` (default: false) no body de `POST /admin/routines/:id/publish`.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Default conservador protege contra deprecacao acidental. Permite automacao quando desejado. Principio de menor surpresa.
> **Artefato de saida:** FR-007 (flag auto_deprecate_previous adicionado ao endpoint publish)
> **Implementado em:** FR-007

---

##### ~~PENDENTE-005 — Limites de Itens por Rotina e Regras por Enquadrador~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** NFR-001, NFR-007, FR-004, FR-006, DATA-007
- **tags:** limites, performance, tenant-config, hard-limit
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** 3

**Questao:**
NFR-007 define SLOs baseados em "ate 10 regras de incidencia ativas e 50 routine_items". Nao ha limite tecnico impedindo criacao acima desses valores. Motor pode exceder SLO.

**Impacto:**
NFR-001 (performance motor), NFR-007, FR-006 (itens), FR-004 (regras)

**Opcao 1 — Hard limit via validacao de endpoint:**
POST retorna 422 se limite atingido. Seguro mas inflexivel.

- Pros: Seguro, motor sempre dentro dos SLOs
- Contras: Inflexivel para cenarios legitimos de alta complexidade

**Opcao 2 — Soft limit com warning no UX:**
UI exibe warning. Backend nao bloqueia. Monitora via observabilidade.

- Pros: Flexivel, sem bloqueio
- Contras: Motor pode exceder SLOs sem controle

**Opcao 3 — Hard limit configuravel por tenant:**
Default = 50 itens / 10 regras. Configuravel por tenant para cenarios excepcionais.

- Pros: Protecao default + flexibilidade, 422 com payload informativo (LIMIT_EXCEEDED, current, max, configurable)
- Contras: Requer integracao com tenant_config do Foundation

**Recomendacao:** Opcao 3 — combina protecao default com flexibilidade.

**Resolucao:**

> **Decisao:** Opcao 3 — Hard limit configuravel por tenant. Default: 50 itens/rotina, 10 regras/enquadrador.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Protecao default dentro dos SLOs (<200ms p95). Configuracao por tenant via tenant_config ou env var. Response 422: `{error: LIMIT_EXCEEDED, current: N, max: M, configurable: true}`.
> **Artefato de saida:** NFR-007 (limites configuraveis) + FR-007 (validacoes 422 nos endpoints)
> **Implementado em:** NFR-007, FR-007

---

##### ~~PENDENTE-006 — Auditoria de Dry-Run: Persistir ou Nao?~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** BR-010, FR-009, DATA-003, UX-007, SEC-007
- **tags:** dry-run, domain-events, auditoria, motor
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** 1

**Questao:**
O UX de dry-run (preview do motor) chama `POST /routine-engine/evaluate` com dados reais. Motor emite domain event `routine.applied` para toda avaliacao com efeito (BR-010). Dry-runs gerariam domain events "falsos" que poluiriam a timeline de auditoria.

**Impacto:**
BR-010 (domain events condicionais), DATA-003 (EVT-012), UX-007 (dry-run preview), SEC-007 (auditoria)

**Opcao 1 — Flag `dry_run: true` no request body:**
Motor executa normalmente mas NAO persiste domain event. Response identico mas sem side-effects.

- Pros: Menor impacto no schema de endpoints (25 endpoints ja definidos), motor reutiliza toda a logica
- Contras: Flag no body pode ser esquecido pelo caller

**Opcao 2 — Endpoint separado `POST /routine-engine/dry-run`:**
Endpoint dedicado sem persistencia. Mais explicito no OpenAPI.

- Pros: Mais explicito, impossivel esquecer
- Contras: Duplicacao de logica entre evaluate e dry-run, 26o endpoint

**Opcao 3 — Persistir com tag `is_dry_run: true`:**
Domain event com campo `is_dry_run: true`. Auditoria completa mas timeline precisa de filtro.

- Pros: Auditoria completa de previews
- Contras: Poluicao do event store, filtro obrigatorio em timeline

**Recomendacao:** Opcao 1 — menor impacto, motor reutiliza toda a logica, apenas suprime persistencia.

**Resolucao:**

> **Decisao:** Opcao 1 — Flag `dry_run: true` no request body de POST /routine-engine/evaluate. Motor executa mas NAO persiste domain event `routine.applied`. Sem side-effects.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Menor impacto no schema de endpoints. Motor reutiliza toda a logica, apenas suprime emissao do domain event routine.applied (EVT-012). Response inclui `dry_run: true`.
> **Artefato de saida:** FR-007 (flag dry_run adicionado ao FR-009), ADR-006 criada
> **Implementado em:** FR-007, ADR-006

---

##### PENDENTE-007 — Auto-Deprecate: Migracao Automatica de routine_incidence_links (ABERTA)

- **status:** ABERTA
- **severidade:** MEDIA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-20
- **criado_por:** AGN-DEV-10
- **rastreia_para:** BR-008, BR-012, FR-008, ADR-003, PENDENTE-004, DATA-007
- **tags:** auto-deprecate, incidence-links, migration
- **dependencias:** []

**Questao:**
Quando `auto_deprecate_previous: true` e acionado no publish, a versao PUBLISHED anterior e marcada como DEPRECATED. Os `routine_incidence_links` da versao deprecada continuam existindo. Motor ignora (filtra PUBLISHED), mas links ficam "orfaos". Devem ser migrados para nova versao, removidos, ou mantidos como historico?

**Impacto:**
Links orfaos acumulam sem proposito funcional. UX da matriz de incidencia precisa decidir como exibir.

**Recomendacao:** Opcao B (manter como historico) — o fork ja copia links para nova versao (ADR-003). Links da versao deprecada servem como historico. Motor ignora automaticamente. UX deve exibir badge "versao deprecada".

---

##### PENDENTE-008 — Bulk Create de Routine Items na Operacao de Fork (ABERTA)

- **status:** ABERTA
- **severidade:** BAIXA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-20
- **criado_por:** AGN-DEV-10
- **rastreia_para:** FR-005, FR-007, ADR-003, DATA-007, NFR-006
- **tags:** fork, bulk-create, performance, routine-items
- **dependencias:** []

**Questao:**
Fork (FR-005, ADR-003) copia todos os `routine_items` da versao original. Com 50 itens (limite maximo), o fork executa 50 INSERTs individuais. A copia deve ser via bulk INSERT ou itens individuais na mesma transacao?

**Impacto:**
Com 50 itens, 50 INSERTs individuais sao aceitaveis (<100ms). Se limite configuravel for aumentado (ex: 200 itens), abordagem individual pode impactar latencia.

**Recomendacao:** Opcao A (bulk INSERT) — para fork, nao e necessario emitir domain event por item (evento `routine.forked` ja cobre). UUIDs via `gen_random_uuid()`. Performance constante.

---

### Fase 3: Validacao — PENDENTE

O `/validate-all` ainda nao foi executado para o MOD-007. Com o enriquecimento completo e 6 das 8 pendencias resolvidas, o proximo passo e executar a validacao.

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
5    /validate-all docs/04_modules/mod-007-parametrizacao-contextual/
                           Orquestra TODAS as validacoes em sequencia:        A EXECUTAR
                           Internamente executa:
                             1. /qa (lint, links, metadados, EX-*, §N, ciclos)
                             2. /validate-manifest (screen manifests vs schema v1)
                             3. /validate-openapi (contratos OpenAPI vs INT-007)
                             4. /validate-drizzle (schema Drizzle vs DATA-007)
                             5. /validate-endpoint (handlers Fastify vs FR-007)
                           Pre-condicao: Enriquecimento concluido
                           Pos-condicao: Relatorio consolidado pass/fail
```

> **Alternativa:** Executar validadores individuais:

```
5a   /qa docs/04_modules/mod-007-parametrizacao-contextual/
                           Diagnostico de sintaxe e integridade:              INDIVIDUAL
                           - lint:docs (Pass A-E: EX-*, §N, IDs, context-map, ciclos)
                           - Consistencia de metadados (estado_item, owner)
                           - Dead links, DoR alignment

5b   /validate-manifest ux-param-001.config-enquadradores.yaml
                           Validar manifests contra schema v1:               INDIVIDUAL
                           - ux-param-001.config-enquadradores.yaml
                           - ux-rotina-001.editor-rotinas.yaml
                           Verifica: DOC-UX-010, operationId, RBAC,
                           telemetria, permissions

5c   /validate-openapi                                                       A EXECUTAR
                           Validar contratos OpenAPI contra INT-007
                           (25 endpoints, 7 scopes)

5d   /validate-drizzle                                                       A EXECUTAR
                           Validar schemas Drizzle contra DATA-007
                           (9 tabelas, 18 indexes, 7 UNIQUE constraints)

5e   /validate-endpoint                                                      A EXECUTAR
                           Validar handlers Fastify contra FR-007
                           (25 endpoints)
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | `/qa` | SIM (todos) | SIM | mod-007-parametrizacao-contextual.md, requirements/*, adr/*, CHANGELOG.md |
| 2 | `/validate-manifest` | SIM (2 manifests existem) | SIM | ux-param-001, ux-rotina-001 |
| 3 | `/validate-openapi` | SIM (Nivel 2, 25 endpoints) | SIM | INT-007, FR-007 |
| 4 | `/validate-drizzle` | SIM (Nivel 2, 9 tabelas) | SIM | DATA-007 |
| 5 | `/validate-endpoint` | SIM (Nivel 2, 25 endpoints) | SIM | FR-007 |

### Fase 4: Promocao — PENDENTE

```
10   /promote-module docs/04_modules/mod-007-parametrizacao-contextual/
                           Selar mod-007 como READY:                         A EXECUTAR (apos fase 3)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. PARCIAL (6/8 IMPLEMENTADA, 2 ABERTA sev. MEDIA/BAIXA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (10/10)
                             [DoR-3] Zero erros de lint? ................ A VERIFICAR (executar /qa)
                             [DoR-4] Screen manifests validados? ........ A VERIFICAR (executar /validate-manifest)
                             [DoR-5] ADRs conforme nivel? ............... SIM (6 >= 2 para N2)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v0.6.0)
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

> **Nota:** MOD-007 depende de MOD-000 (Foundation), MOD-003, MOD-004, MOD-005 e MOD-006. A promocao do MOD-007 pode ocorrer independentemente — o DoR nao exige que dependencias upstream estejam READY (apenas que existam). Porem, o codigo so pode ser gerado quando as dependencias upstream estiverem READY (endpoints implementados). As 2 pendentes abertas (PENDENTE-007 e PENDENTE-008) sao de severidade MEDIA/BAIXA e podem ser decididas durante a implementacao — nao bloqueiam promocao.

### Fase 5: Pos-READY (quando necessario)

```
11   /update-specification docs/04_modules/mod-007-parametrizacao-contextual/requirements/fr/FR-007.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

12   /create-amendment FR-007 melhoria "adicionar condition_expr v2"
                           Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
                           Caso de uso previsto: condition_expr v2 (JSONLogic)
                           quando roadmap ativar v2 do motor
```

### Gestao de Pendencias (qualquer momento)

> **Decision tree de pendencias:**
>
> ```
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-007
> ├── Criar nova pendencia     → /manage-pendentes create PEN-007
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-007 PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-007 PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-007 PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-007 PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-007
> ```

```
16   /manage-pendentes list PEN-007
                           Estado atual MOD-007:
                             PEN-007: 8 itens total
                               6 IMPLEMENTADA (001-006)
                               2 ABERTA (007, 008)
                             SLA: nenhum vencido
```

#### Painel de Pendencias — Resumo Individual

| PENDENTE | Status | Sev. | Dominio | Decisao | Artefato de saida |
|----------|--------|------|---------|---------|-------------------|
| PENDENTE-001 | IMPLEMENTADA | BAIXA | ARC | Opcao 1 — JSONLogic como engine v2 para condition_expr | PEN-007 (decisao registrada) |
| PENDENTE-002 | IMPLEMENTADA | MEDIA | ARC | Opcao 1 — Job independente, isolamento > DRY | NFR-007 |
| PENDENTE-003 | IMPLEMENTADA | BAIXA | ARC | Opcao 2 — Tabela auxiliar routine_integration_config | PEN-007 (decisao registrada) |
| PENDENTE-004 | IMPLEMENTADA | MEDIA | BIZ | Opcao 3 — Flag auto_deprecate_previous (default=false) | FR-007 |
| PENDENTE-005 | IMPLEMENTADA | MEDIA | ARC | Opcao 3 — Hard limit configuravel por tenant | NFR-007, FR-007 |
| PENDENTE-006 | IMPLEMENTADA | MEDIA | ARC | Opcao 1 — Flag dry_run no request body | FR-007, ADR-006 |
| PENDENTE-007 | ABERTA | MEDIA | ARC | — (recomendacao: manter links como historico) | — |
| PENDENTE-008 | ABERTA | BAIXA | ARC | — (recomendacao: bulk INSERT) | — |

> Detalhamento completo: ver [Fase 2](#pendentes-resolvidas-no-enriquecimento--detalhamento-completo).

### Utilitarios (qualquer momento)

```
14   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-007): <descricao>

15   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

17   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-007

```
US-MOD-007 (APPROVED v1.3.0)              ← Fase 0: CONCLUIDA
  │  5/5 features APPROVED (3 Backend + 2 UX)
  │  4 gaps do Documento Mestre enderecados
  ▼
mod-007-parametrizacao-contextual/ (stubs DRAFT) ← Fase 1: CONCLUIDA (forge-module v0.1.0)
  │
  ▼
mod-007 enriquecido (DRAFT v0.4.0)     ← Fase 2: CONCLUIDA (10 agentes, 6/8 PENDENTEs resolvidas)
  │
  ├── ★ PROXIMO PASSO: /validate-all
  │     ├── /qa .................. A EXECUTAR
  │     ├── /validate-manifest ... A EXECUTAR (2 manifests)
  │     ├── /validate-openapi .... A EXECUTAR (25 endpoints)
  │     ├── /validate-drizzle .... A EXECUTAR (9 tabelas)
  │     └── /validate-endpoint ... A EXECUTAR (25 endpoints)
  │
  ▼
mod-007 validado (DRAFT)                ← Fase 3: A EXECUTAR
  │
  ├── Gate 0 (DoR): 5/7 atendidos, 2 A VERIFICAR (lint + manifests)
  │   Nota: 2 PENDENTEs ABERTA (sev. MEDIA/BAIXA) nao bloqueiam
  │
  ▼
mod-007 selado (READY)                  ← Fase 4: A EXECUTAR (apos fase 3)
  │
  ▼
mod-007 + amendments/                   ← Fase 5: SOB DEMANDA (0 amendments)

Dependencias upstream: MOD-000, MOD-003, MOD-004, MOD-005, MOD-006 — camada topologica 5.
MOD-007 prove motor de parametrizacao para MOD-008 (heranca), MOD-010 (consumo), MOD-011 (consumo).
```

---

## Particularidades do MOD-007

| Aspecto | Detalhe |
|---------|---------|
| Nivel 2 — DDD-lite + Full Clean (Score 5/6) | Dominio rico com aggregate root (BehaviorRoutine), value objects (RoutineStatus, ItemType, ItemAction), domain services (EvaluationEngine, ConflictResolver, IncidenceValidator). Todos os validadores aplicaveis. |
| 4 Gaps do Documento Mestre | GAP 1 (versionamento tecnico), GAP 2 (priorizacao de contextos — duas camadas), GAP 3 (separacao comportamento/integracao), GAP 4 (historico de incidencia) — todos enderecados neste modulo. |
| Motor de Avaliacao sem Cache | Decisao tecnica 2026-03-15: consistencia > performance. Todas as chamadas executam ao vivo. SLO <200ms p95 garantido por indexes otimizados. Formalizado em ADR-001 e ADR-005. |
| Resolucao de Conflito em Duas Camadas | Camada 1 (config-time): UNIQUE constraint bloqueia cadastro duplicado com 422. Camada 2 (runtime safety net): regra mais restritiva vence (HIDE > SHOW, SET_REQUIRED > SET_OPTIONAL, dominio menor). Campo `priority` removido (ADR-002). |
| 6 ADRs para Nivel 2 | Excede o minimo de 2 ADRs. ADR-001 (Cache Removido), ADR-002 (Priority Removido), ADR-003 (PUBLISHED Imutavel), ADR-004 (Conflito 2 Camadas), ADR-005 (Always Fresh), ADR-006 (Dry-Run Flag). Riqueza de ADRs reflete complexidade do dominio. |
| 9 Tabelas com Isolamento Multi-Tenant | Todas as tabelas filtram por `tenant_id` obrigatorio (BR-013). 18 indexes otimizados, 7 UNIQUE constraints, 7 CHECK constraints. |
| 25 Endpoints com 7 Scopes | 23 endpoints originais + 2 link/unlink-routine. Scopes granulares: param:framer:{read,write,delete}, param:routine:{read,write,publish}, param:engine:evaluate. |
| 14 Domain Events | Catalogo completo em DATA-003 com emit/view/notify/outbox/sensitivity. Supressao de dry_run para evitar poluicao do audit trail. |
| Provedor para 3 Modulos Downstream | MOD-008 herda behavior_routines (routine_type=INTEGRATION). MOD-010 e MOD-011 consomem routine-engine/evaluate. |
| 2 PENDENTEs Abertas nao Bloqueantes | PENDENTE-007 (auto-deprecate links) e PENDENTE-008 (bulk INSERT no fork) sao decisoes de implementacao — nao bloqueiam promocao nem desenvolvimento. Recomendacoes ja definidas. |

---

## Checklist Rapido — O que Falta para READY

- [ ] Decidir PENDENTE-007 (links orfaos no auto-deprecate) — recomendacao: manter como historico
- [ ] Decidir PENDENTE-008 (bulk INSERT no fork) — recomendacao: bulk INSERT
- [ ] Executar `/validate-all docs/04_modules/mod-007-parametrizacao-contextual/` — qa + manifests + openapi + drizzle + endpoint
- [ ] Corrigir eventuais erros encontrados
- [ ] Executar `/promote-module docs/04_modules/mod-007-parametrizacao-contextual/` — verificar Gate 0 (DoR) 7/7

> **Nota:** As 6 pendencias resolvidas cobrem todas as decisoes arquiteturais criticas (engine v2, isolamento de jobs, tabela auxiliar MOD-008, auto-deprecate, limites configuraveis, dry-run). As 2 abertas sao de implementacao e podem ser decididas durante o desenvolvimento. Os 10 artefatos de requisitos estao enriquecidos. As 6 ADRs excedem o minimo para Nivel 2. Nao ha bloqueios (BLK-*) afetando MOD-007. As 5 dependencias upstream (MOD-000 a MOD-006) estao DRAFT mas isso nao impede a promocao da especificacao — apenas a geracao de codigo.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 1.0.0 | 2026-03-22 | Criacao completa: Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 8 pendentes (6 resolvidas + 2 abertas), rastreio de 10 agentes, mapa de cobertura de 5 validadores, particularidades Nivel 2 DDD-lite, 4 gaps enderecados, 6 ADRs, motor sem cache, conflito 2 camadas |
