# Procedimento — Plano de Acao MOD-008 Integracao Dinamica Protheus/TOTVS

> **Versao:** 1.0.0 | **Data:** 2026-03-22 | **Owner:** arquitetura
> **Estado atual do modulo:** DRAFT (v0.7.0) | **Epico:** APPROVED (v1.2.0) | **Features:** 5/5 APPROVED
>
> Fases 0-2 concluidas. Proximo passo: Fase 3 (Validacao) — executar `/validate-all`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-008 | APPROVED (v1.2.0) | DoR completo, 5 features vinculadas, heranca MOD-007, Outbox + BullMQ + DLQ |
| Features F01-F05 | 5/5 APPROVED | F01 (Catalogo Servicos + Rotinas), F02 (Mapeamentos Campos/Params), F03 (Motor Execucao BullMQ), F04 (UX Editor Rotinas), F05 (UX Monitor Integracoes) |
| Scaffold (forge-module) | CONCLUIDO | mod-008-integracao-protheus/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | Agentes 01-10 confirmados, v0.7.0, 5 pendentes identificadas e resolvidas |
| PENDENTEs | 0 abertas | 5 total: 5 IMPLEMENTADA |
| ADRs | 4 aceitas | Nivel 2 requer minimo 2 — atendido (ADR-001 Outbox, ADR-002 Retry Outbox, ADR-003 Heranca MOD-007, ADR-004 AES-256) |
| Amendments | 0 | Nenhum |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v0.7.0 | Ultima entrada 2026-03-19 (Etapa 4 enriquecimento + pendentes) |
| Screen Manifests | 2/2 existem | ux-integ-001.editor-rotinas-integ, ux-integ-002.monitor-integracoes |
| Dependencias | 3 upstream (MOD-000, MOD-006, MOD-007) | Consome Foundation core, transicoes MOD-006, herda behavior_routines MOD-007 |
| Bloqueios | 1 (BLK-004) | MOD-008 bloqueado por MOD-005 — processos para rotinas de integracao |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-008 define o modulo de integracao dinamica com Protheus/TOTVS, construido sobre o Foundation (MOD-000) e herdando a estrutura de rotinas versionadas do MOD-007. O modulo cobre: Catalogo de Servicos de Destino, Rotinas de Integracao com mapeamento de campos, Motor de Execucao assincrono (Outbox Pattern + BullMQ + retry backoff exponencial + DLQ) e 2 telas UX (Editor de Rotinas + Monitor de Integracoes). Possui 6 tabelas proprias, 15 endpoints REST, 6 escopos, 8 domain events e 47 cenarios Gherkin.

```
1    (manual)              Revisar e finalizar epico US-MOD-008:             CONCLUIDO
                           - Escopo fechado (5 features, 3 backend + 2 UX)  status_agil = APPROVED
                           - Gherkin validado (47 cenarios, 5 features)     v1.2.0
                           - DoR completo (6 tabelas, 15 endpoints, 6 scopes)
                           - Heranca MOD-007 formalizada (behavior_routines)
                           - Outbox Pattern + BullMQ + DLQ definidos
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-008.md

2    (manual)              Revisar e finalizar features F01-F05:             CONCLUIDO
                           - F01: API Catalogo de Servicos + Rotinas         5/5 APPROVED
                           - F02: API Mapeamentos de Campos e Parametros
                           - F03: API Motor de Execucao (BullMQ + Outbox + DLQ)
                           - F04: UX Editor de Rotinas de Integracao (UX-INTEG-001)
                           - F05: UX Monitor de Integracoes (UX-INTEG-002)
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-008-F{01..05}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Modulo scaffoldado em 2026-03-19 a partir do epico APPROVED v1.2.0. Estrutura completa gerada com 6 tabelas, 15 endpoints, 5 features, 6 scopes.

```
3    /forge-module MOD-008  Scaffold completo gerado:                        CONCLUIDO
                           mod-008-integracao-protheus.md, CHANGELOG.md,    v0.1.0 (2026-03-19)
                           requirements/ (br/, fr/, data/, int/, sec/,
                           ux/, nfr/), adr/, amendments/
                           Stubs obrigatorios: DATA-003, SEC-002
                           Pasta: docs/04_modules/mod-008-integracao-protheus/
```

### Fase 2: Enriquecimento — CONCLUIDO

O enriquecimento do MOD-008 foi completo — todos os agentes rodaram em 2026-03-19 em 4 batches. Durante o processo, 5 pendencias foram identificadas e todas resolvidas. Destaque para decisoes arquiteturais de Outbox Pattern, retry gerenciado, heranca MOD-007 e credenciais AES-256.

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-008
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-008
> ```

```
4    /enrich docs/04_modules/mod-008-integracao-protheus/
                           Agentes executados sobre mod-008:                 CONCLUIDO
                           AGN-DEV-01 (MOD), AGN-DEV-02 (BR),              v0.7.0 (2026-03-19)
                           AGN-DEV-03 (FR), AGN-DEV-04 (DATA),
                           AGN-DEV-05 (INT), AGN-DEV-06 (SEC),
                           AGN-DEV-07 (UX), AGN-DEV-08 (NFR),
                           AGN-DEV-09 (ADR), AGN-DEV-10 (PEN)
                           5 pendentes criadas e resolvidas (001-005)
```

#### Rastreio de Agentes — MOD-008

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-008-integracao-protheus.md | CONCLUIDO | v0.2.0 — Nivel 2 confirmado, score DOC-ESC-001 6/6, premissas e restricoes expandidas |
| 2 | AGN-DEV-02 | BR | BR-008.md | CONCLUIDO | v0.2.0 — 12 regras de negocio (BR-001 a BR-012) com Gherkin extraidas de F01-F05 |
| 3 | AGN-DEV-03 | FR | FR-008.md | CONCLUIDO | v0.2.0 — 11 requisitos funcionais (FR-001 a FR-011) com done funcional, dependencias e Gherkin |
| 4 | AGN-DEV-04 | DATA | DATA-008.md, DATA-003.md | CONCLUIDO | DATA-008 v0.2.0 (6 tabelas completas), DATA-003 v0.2.0 (8 domain events completos) |
| 5 | AGN-DEV-05 | INT | INT-008.md | CONCLUIDO | v0.2.0 — 4 integracoes detalhadas (MOD-007 heranca, MOD-006 events, MOD-000 Foundation, Protheus HTTP REST) |
| 6 | AGN-DEV-06 | SEC | SEC-008.md, SEC-002.md | CONCLUIDO | SEC-008 v0.2.0 (authn, authz 15 endpoints, classificacao, LGPD), SEC-002 v0.2.0 (matriz Emit/View/Notify 8 eventos) |
| 7 | AGN-DEV-07 | UX | UX-008.md | CONCLUIDO | v0.2.0 — 2 telas detalhadas: UX-INTEG-001 (Editor 3 abas), UX-INTEG-002 (Monitor DLQ split-view) |
| 8 | AGN-DEV-08 | NFR | NFR-008.md | CONCLUIDO | v0.2.0 — SLOs p95/p99, limites, observabilidade Prometheus/OpenTelemetry, DLQ monitoring, healthchecks |
| 9 | AGN-DEV-09 | ADR | ADR-001, ADR-002, ADR-003, ADR-004 | CONCLUIDO | 4 ADRs criadas e aceitas |
| 10 | AGN-DEV-10 | PEN | pen-008-pendente.md | CONCLUIDO | v0.9.0 — 5 pendentes criadas e resolvidas |

#### Pendentes Resolvidas no Enriquecimento — Detalhamento Completo

> As 5 pendencias abaixo foram identificadas durante o enriquecimento e todas foram decididas e implementadas em 2026-03-19.

---

##### ~~PENDENTE-001 — Estrategia de Particionamento de call_logs Quando Volume > 10M~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** DATA
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** DATA-008, NFR-008, FR-009
- **tags:** performance, particionamento, escalabilidade
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** B

**Questao:**
A tabela `integration_call_logs` e de alto volume (~1000-50000 registros/tenant/mes) e acumula request_payload + response_body em JSONB. O DATA-008 menciona "considerar particionamento por `queued_at` quando volume > 10M" e o NFR-008 §10 preve particionamento mensal como estrategia de escalabilidade, mas nenhum artefato define quando, como e quem implementara o particionamento. Sem decisao, queries de listagem podem degradar alem do SLO de 500ms p95 quando o volume crescer.

**Impacto:**
Degradacao progressiva de performance em GET /admin/integration-logs e na query de DLQ monitoring (scan a cada 60s). O monitor UX-INTEG-002 ficaria lento e o alerta de DLQ poderia atrasar, comprometendo a operacao.

**Opcao A — Particionamento nativo PostgreSQL por range (queued_at) mensal desde o inicio:**
Criar a tabela como partitioned table com particoes mensais automaticas via pg_partman ou cron job.

- Pros: Zero migracao futura; performance previsivel desde o dia 1; queries com filtro de periodo aproveitam partition pruning.
- Contras: Complexidade adicional no setup inicial; overhead de gerenciar particoes; FKs para tabelas partitioned exigem cuidado no PostgreSQL (FKs em partitions sao parcialmente suportadas a partir do PG 12+).

**Opcao B — Tabela simples com trigger de migracao quando volume atingir 10M:**
Iniciar com tabela nao-particionada. Monitorar volume via metrica. Quando atingir 10M, executar migracao para partitioned table.

- Pros: Simplicidade inicial; menor overhead de setup; sem complexidade de partitions ate ser necessario.
- Contras: Migracao disruptiva (ALTER TABLE para partitioned exige lock ou pg_repack); risco de degradacao antes da migracao ser executada; divida tecnica acumulada.

**Recomendacao:** Opcao B — iniciar com tabela simples e monitorar. O volume esperado no Wave 4 (poucos tenants, ~50 rotinas) nao justifica a complexidade do particionamento desde o inicio.

**Resolucao:**

> **Decisao:** Opcao B — Tabela simples com trigger de migracao quando volume atingir 10M
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Volume esperado no Wave 4 (poucos tenants, ~50 rotinas) nao justifica complexidade de particionamento desde o inicio. Alerta no NFR quando count > 5M aciona migracao preventiva. Env var INTEGRATION_CONCURRENCY ja limita throughput.
> **Artefato de saida:** Decisao documentada em PEN-008. Alerta `integration_call_logs.count > 5M` planejado no NFR-008 §6.5. Env var `INTEGRATION_CONCURRENCY` ja limita throughput.
> **Implementado em:** PEN-008 v0.8.0, NFR-008 §6.5

---

##### ~~PENDENTE-002 — Politica de Retencao de call_logs vs. LGPD~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** SEC
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** SEC-008, DATA-008, NFR-008, BR-009
- **tags:** LGPD, retencao, auditoria, compliance
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A

**Questao:**
O SEC-008 §4.2 menciona que call_logs sao registros de auditoria imutaveis (BR-009), mas que `request_payload` e `response_body` PODEM conter PII transitoria. O SEC-008 afirma que "call_logs seguem politica de retencao do Foundation para dados de auditoria" e o NFR-008 §10 preve "archive de call_logs > 6 meses para cold storage (S3)". Porem, nenhum artefato define: (1) qual e a politica de retencao concreta do Foundation para auditoria, (2) como anonimizar PII em payloads sem deletar o registro de auditoria, (3) periodo exato de retencao em hot storage vs. cold storage.

**Impacto:**
Sem politica definida, o sistema pode acumular PII transitoria indefinidamente em call_logs, violando o principio de minimizacao da LGPD. Adicionalmente, o custo de storage PostgreSQL cresce sem controle.

**Opcao A — Retencao de 6 meses em hot storage + archive para cold (S3) com anonimizacao de PII:**
Apos 6 meses, mover registros para S3 (JSON comprimido) com PII anonimizada nos campos request_payload e response_body. Registros no banco sao deletados (exceto metadados: id, status, correlation_id, duration_ms).

- Pros: Compliance LGPD; custo otimizado; rastreabilidade mantida via metadados.
- Contras: Complexidade de implementacao (job de archive + pipeline de anonimizacao); queries historicas exigem consulta ao S3.

**Opcao B — Retencao indefinida com anonimizacao in-place dos campos PII apos 90 dias:**
Manter todos os registros no PostgreSQL, mas executar job de anonimizacao que substitui PII em request_payload e response_body por hashes apos 90 dias.

- Pros: Sem infraestrutura de cold storage; queries historicas continuam no PostgreSQL.
- Contras: Custo de storage mais alto; anonimizacao in-place modifica registro de auditoria (conflito com imutabilidade BR-009).

**Recomendacao:** Opcao A — retencao de 6 meses com archive para S3.

**Resolucao:**

> **Decisao:** Opcao A — Retencao de 6 meses em hot storage + archive para cold (S3) com anonimizacao de PII
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Resolve a tensao entre auditoria imutavel (BR-009) e LGPD. O registro arquivado em S3 e copia anonimizada; o original e purgado do hot storage apos 6 meses. Metadados (id, status, correlation_id, duration_ms) permanecem no PostgreSQL para rastreabilidade.
> **Artefato de saida:** Politica documentada em PEN-008. Registro arquivado em S3 e copia anonimizada; original purgado apos 6 meses. Metadados permanecem no PostgreSQL.
> **Implementado em:** PEN-008 v0.9.0, NFR-008 §10

---

##### ~~PENDENTE-003 — Suporte a OAuth2 Refresh Token para Protheus~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** INT
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** INT-004, FR-001, SEC-008, DATA-008
- **tags:** OAuth2, refresh-token, autenticacao, Protheus
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A

**Questao:**
O INT-008 §4 (INT-004) documenta o fluxo OAUTH2 como "client_credentials -> token endpoint -> access_token" com cache do token por `expires_in - 60s`. Porem, nao especifica: (1) o que acontece quando o access_token expira durante uma chamada em andamento (mid-flight expiry), (2) se o Protheus suporta refresh_token ou apenas client_credentials grant, (3) como o cache de tokens e compartilhado entre multiplos workers BullMQ, (4) se o token deve ser cacheado em Redis (compartilhado) ou em memoria (por worker).

**Impacto:**
Sem definicao, chamadas OAUTH2 podem falhar com 401 quando o token expira entre o cache e a execucao. Com multiplos workers, cada um pode solicitar um novo token simultaneamente, causando overhead desnecessario no token endpoint do Protheus.

**Opcao A — Cache de token em Redis com TTL = expires_in - 60s, renovacao lazy:**
Armazenar access_token em Redis com chave `oauth2:token:{service_id}:{tenant_id}`. Qualquer worker verifica Redis antes de chamar o token endpoint. Se expirado, um unico worker renova (lock distribuido) e os demais aguardam.

- Pros: Token compartilhado entre workers; minimo de chamadas ao token endpoint; lock previne thundering herd.
- Contras: Dependencia adicional do Redis para auth; complexidade de lock distribuido.

**Opcao B — Cache em memoria por worker, sem compartilhamento:**
Cada worker mantem seu proprio cache de tokens. Expiracao individual.

- Pros: Simplicidade; sem lock distribuido.
- Contras: N workers = ate N chamadas simultaneas ao token endpoint; overhead no Protheus; tokens podem divergir.

**Recomendacao:** Opcao A — cache em Redis com lock distribuido. Redis ja esta na stack (BullMQ).

**Resolucao:**

> **Decisao:** Opcao A — Cache de token em Redis com TTL=expires_in-60s, renovacao lazy. Chave: `oauth2:token:{service_id}:{tenant_id}`. Lock distribuido via `SET NX EX` para prevenir thundering herd. Redis ja na stack (BullMQ). Grant type: `client_credentials` (sem refresh_token). Interceptor de 401 forca renovacao (mid-flight expiry).
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Token compartilhado entre workers minimiza chamadas ao token endpoint do Protheus. Lock distribuido previne thundering herd. Redis ja disponivel (BullMQ). client_credentials grant e o padrao Protheus (sem refresh_token). Interceptor de 401 resolve mid-flight expiry.
> **Artefato de saida:** INT-008 §INT-004 (fluxo OAUTH2 detalhado: cache Redis, lock, mid-flight expiry, tabela de erros)
> **Implementado em:** INT-008 v0.3.0

---

##### ~~PENDENTE-004 — Limite Real de Concurrency do Protheus em Producao~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** INT
- **tipo:** DEP-EXT
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** INT-004, NFR-008, FR-005, SEC-008
- **tags:** concurrency, Protheus, rate-limit, performance
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** B+A

**Questao:**
O mod.md define `INTEGRATION_CONCURRENCY` (default: 10) como env var para limitar conexoes simultaneas ao Protheus, e o NFR-008 menciona esse limite. Porem, o valor "10" e uma estimativa — o limite real de conexoes simultaneas do Protheus em producao nao esta documentado. Adicionalmente, o Protheus pode ter rate limits proprios (429) que nao foram mapeados. Sem o dado real, o sistema pode sobrecarregar o Protheus (concurrency muito alta) ou subutilizar a capacidade (concurrency muito baixa).

**Impacto:**
Concurrency muito alta: Protheus retorna 429 ou degrada, gerando DLQs em massa. Concurrency muito baixa: fila de integracao cresce, aumentando a latencia entre enqueue e execucao (viola SLO de queue_latency).

**Opcao A — Manter default=10 e ajustar empiricamente em producao:**
Deploy com INTEGRATION_CONCURRENCY=10. Monitorar metricas de rate limit 429 e DLQ count. Ajustar iterativamente.

- Pros: Pragmatico; nao bloqueia desenvolvimento; ajuste dinamico via env var sem redeploy.
- Contras: Risco de DLQ em massa na primeira semana de producao se o limite real for < 10.

**Opcao B — Solicitar ao time Protheus o limit real antes do go-live:**
Obter documentacao oficial do Protheus sobre conexoes simultaneas e rate limits por tenant/IP.

- Pros: Dado concreto; configuracao segura desde o go-live.
- Contras: Dependencia externa; pode atrasar se o time Protheus nao responder a tempo.

**Recomendacao:** Opcao B como acao paralela + Opcao A como fallback.

**Resolucao:**

> **Decisao:** Opcao B+A — Solicitar ao time Protheus o limite real de conexoes simultaneas e rate limits por tenant/IP. Fallback: manter default=10 com monitoramento. Alerta 429>5% (15min window) protege contra sobrecarga.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Acao principal: solicitar ao time Protheus documentacao oficial de conexoes simultaneas e rate limits por tenant/IP em producao. Fallback: deploy com `INTEGRATION_CONCURRENCY=10` e monitoramento de metricas (rate limit 429, DLQ count). Ajuste dinamico via env var sem redeploy. Alerta `Rate limit 429 > 5% (15min window)` do NFR-008 §6.5 protege contra sobrecarga.
> **Artefato de saida:** Ticket para time Protheus (acao externa) + NFR-008 atualizado com estrategia de ajuste dinamico
> **Implementado em:** NFR-008 §5, §6.5

---

##### ~~PENDENTE-005 — Seed de integration_services de HML para Testes~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** INFRA
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** FR-001, BR-012, INT-004, NFR-008
- **tags:** seed, HML, testes, mock, DoR
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A

**Questao:**
O BR-012 exige que o botao "Testar agora (HML)" use um servico com `environment=HML`. Os cenarios Gherkin de F01 e F04 dependem da existencia de um servico HML cadastrado. Porem, nenhum artefato define: (1) se o seed de HML e obrigatorio para ambientes de desenvolvimento/teste, (2) como o mock do Protheus sera provisionado para testes de integracao e E2E, (3) quais dados minimos o seed deve conter (base_url, auth_config mock, timeout).

**Impacto:**
Sem seed de HML, testes de integracao e E2E que dependem do BR-012 (teste HML) e FR-001 (CRUD servicos) nao podem ser executados de forma automatizada. Desenvolvedores precisarao criar servicos manualmente a cada reset de ambiente.

**Opcao A — Seed automatico no migration/setup com servico HML mock:**
Criar migration seed que insere `integration_services` com `environment=HML`, `base_url` apontando para mock server (WireMock ou similar), `auth_type=NONE`, `status=ACTIVE`. Seed executado em ambientes DEV e HML.

- Pros: Testes automatizados funcionam sem setup manual; DoR de F01 satisfeito; mock server provido pela infra de testes.
- Contras: Seed precisa ser mantido; mock server precisa ser configurado para simular respostas Protheus.

**Opcao B — Seed manual documentado em README:**
Documentar os comandos de seed no README. Desenvolvedores executam manualmente.

- Pros: Zero codigo extra de seed.
- Contras: Propenso a erro humano; bloqueador para CI/CD automatizado; violaria a regra de automacao obrigatoria (DOC-DEV-001 §0.2).

**Recomendacao:** Opcao A — seed automatico com mock server.

**Resolucao:**

> **Decisao:** Opcao A — Seed automatico no migration/setup com servico HML mock. Insere `integration_services` com `environment=HML`, `base_url=http://wiremock:8080`, `auth_type=NONE`, `status=ACTIVE`, `timeout_ms=5000`. Seed executado automaticamente em ambientes DEV e HML via migration.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Testes automatizados funcionam sem setup manual. DoR de F01 satisfeito. Mock server (WireMock) provido pela infra de testes. Seed mantido como migration seed para garantir reprodutibilidade.
> **Artefato de saida:** DATA-008 (seed HML adicionado)
> **Implementado em:** DATA-008

---

### Fase 3: Validacao — PENDENTE

O `/validate-all` ainda nao foi executado para o MOD-008. Com o enriquecimento completo e todas as pendencias resolvidas, o proximo passo e executar a validacao.

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
5    /validate-all docs/04_modules/mod-008-integracao-protheus/
                           Orquestra TODAS as validacoes em sequencia:        A EXECUTAR
                           Internamente executa:
                             1. /qa (lint, links, metadados, EX-*, §N, ciclos)
                             2. /validate-manifest (screen manifests vs schema v1)
                             3. /validate-openapi (15 endpoints vs contratos)
                             4. /validate-drizzle (6 tabelas vs schema)
                             5. /validate-endpoint (handlers Fastify vs spec)
                           Pre-condicao: Enriquecimento concluido
                           Pos-condicao: Relatorio consolidado pass/fail
```

> **Alternativa:** Executar validadores individuais:

```
5a   /qa docs/04_modules/mod-008-integracao-protheus/
                           Diagnostico de sintaxe e integridade:              INDIVIDUAL
                           - lint:docs (Pass A-E: EX-*, §N, IDs, context-map, ciclos)
                           - Consistencia de metadados (estado_item, owner)
                           - Dead links, DoR alignment

5b   /validate-manifest ux-integ-001.editor-rotinas-integ.yaml
                           Validar manifests contra schema v1:               INDIVIDUAL
                           - ux-integ-001.editor-rotinas-integ.yaml
                           - ux-integ-002.monitor-integracoes.yaml
                           Verifica: DOC-UX-010, operationId, RBAC,
                           acoes UX-010, permissions, scopes

5c   /validate-openapi     Validar 15 endpoints vs contratos OpenAPI:        INDIVIDUAL
                           integration-services (3), routines (3),
                           field-mappings (3), params (2),
                           engine (1), logs (3)

5d   /validate-drizzle     Validar 6 tabelas vs schema Drizzle:              INDIVIDUAL
                           integration_services, integration_routines,
                           integration_field_mappings, integration_params,
                           integration_call_logs, integration_reprocess_requests

5e   /validate-endpoint    Validar handlers Fastify vs spec:                 INDIVIDUAL
                           15 endpoints com scopes, tenant_id, pagination
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | `/qa` | SIM (todos) | SIM | mod-008-integracao-protheus.md, requirements/*, adr/*, CHANGELOG.md |
| 2 | `/validate-manifest` | SIM (2 manifests existem) | SIM | ux-integ-001, ux-integ-002 |
| 3 | `/validate-openapi` | SIM (15 endpoints) | SIM | 15 endpoints REST documentados |
| 4 | `/validate-drizzle` | SIM (6 tabelas) | SIM | 6 tabelas em DATA-008 |
| 5 | `/validate-endpoint` | SIM (15 handlers) | SIM | 15 endpoints Fastify |

### Fase 4: Promocao — PENDENTE

```
10   /promote-module docs/04_modules/mod-008-integracao-protheus/
                           Selar mod-008 como READY:                         A EXECUTAR (apos fase 3)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (5/5 IMPLEMENTADA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (10/10)
                             [DoR-3] Zero erros de lint? ................ A VERIFICAR (executar /qa)
                             [DoR-4] Screen manifests validados? ........ A VERIFICAR (executar /validate-manifest)
                             [DoR-5] ADRs conforme nivel? ............... SIM (4 >= 2 para N2)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v0.7.0)
                             [DoR-7] Bloqueios cross-modulo? ............ ATENCAO (BLK-004 pendente)

                           Fluxo interno:
                             Step 1: /qa (pre-check)
                             Step 2: Promover estado_item DRAFT→READY
                             Step 3: /qa (pos-check)
                             Step 4: /update-index
                             Step 5: /git commit
                           Pre-condicao: QA verde, DoR-1..7 atendidos
                           Pos-condicao: estado_item = READY, INDEX.md atualizado, commit
```

> **Nota:** MOD-008 depende de MOD-000 (Foundation), MOD-006 (Execucao) e MOD-007 (Parametrizacao). A promocao do MOD-008 pode ocorrer independentemente — o DoR nao exige que dependencias upstream estejam READY (apenas que existam). Porem, BLK-004 (MOD-008 bloqueado por MOD-005 — processos para rotinas de integracao) deve ser monitorado. A geracao de codigo so pode ocorrer quando MOD-007 estiver READY (heranca de behavior_routines).

### Fase 5: Pos-READY (quando necessario)

```
11   /update-specification docs/04_modules/mod-008-integracao-protheus/requirements/fr/FR-008.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

12   /create-amendment FR-008 melhoria "descricao"
                           Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
                           Caso de uso previsto: ajustes pos-go-live
                           com dados reais de integracao Protheus
```

### Gestao de Pendencias (qualquer momento)

> **Decision tree de pendencias:**
>
> ```
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-008
> ├── Criar nova pendencia     → /manage-pendentes create PEN-008
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-008 PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-008 PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-008 PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-008 PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-008
> ```

```
16   /manage-pendentes list PEN-008
                           Estado atual MOD-008:
                             PEN-008: 5 itens total
                               5 IMPLEMENTADA (001-005)
                               0 ABERTA
                             SLA: nenhum vencido
```

#### Painel de Pendencias — Resumo Individual

| PENDENTE | Status | Sev. | Dominio | Decisao | Artefato de saida |
|----------|--------|------|---------|---------|-------------------|
| PENDENTE-001 | IMPLEMENTADA | ALTA | DATA | Opcao B — Tabela simples + trigger migracao 10M | NFR-008 §6.5 |
| PENDENTE-002 | IMPLEMENTADA | ALTA | SEC | Opcao A — Retencao 6 meses + archive S3 anonimizado | NFR-008 §10 |
| PENDENTE-003 | IMPLEMENTADA | MEDIA | INT | Opcao A — Cache Redis OAuth2, lock distribuido, mid-flight expiry | INT-008 v0.3.0 |
| PENDENTE-004 | IMPLEMENTADA | ALTA | INT | Opcao B+A — Ticket Protheus + fallback default=10 + monitoramento | NFR-008 §5, §6.5 |
| PENDENTE-005 | IMPLEMENTADA | MEDIA | INFRA | Opcao A — Seed automatico HML com WireMock | DATA-008 |

> Detalhamento completo: ver [Fase 2](#pendentes-resolvidas-no-enriquecimento--detalhamento-completo).

### Utilitarios (qualquer momento)

```
14   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-008): <descricao>

15   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

17   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-008

```
US-MOD-008 (APPROVED v1.2.0)              ← Fase 0: CONCLUIDA
  │  5/5 features APPROVED (3 backend + 2 UX)
  │  6 tabelas, 15 endpoints, 6 scopes, 8 domain events
  ▼
mod-008-integracao-protheus/ (stubs DRAFT) ← Fase 1: CONCLUIDA (forge-module v0.1.0)
  │
  ▼
mod-008 enriquecido (DRAFT v0.7.0)         ← Fase 2: CONCLUIDA (10 agentes, 5 PENDENTEs resolvidas)
  │
  ├── ★ PROXIMO PASSO: /validate-all
  │     ├── /qa .................. A EXECUTAR
  │     ├── /validate-manifest ... A EXECUTAR (2 manifests)
  │     ├── /validate-openapi .... A EXECUTAR (15 endpoints)
  │     ├── /validate-drizzle .... A EXECUTAR (6 tabelas)
  │     └── /validate-endpoint ... A EXECUTAR (15 handlers)
  │
  ▼
mod-008 validado (DRAFT)                   ← Fase 3: A EXECUTAR
  │
  ├── Gate 0 (DoR): 5/7 atendidos, 2 A VERIFICAR (lint + manifests)
  │   ⚠ BLK-004: MOD-008 bloqueado por MOD-005 (processos) — monitorar
  │
  ▼
mod-008 selado (READY)                     ← Fase 4: A EXECUTAR (apos fase 3)
  │
  ▼
mod-008 + amendments/                      ← Fase 5: SOB DEMANDA (0 amendments)

Dependencias upstream: MOD-000 (Foundation), MOD-006 (Execucao), MOD-007 (Parametrizacao).
Camada topologica: 6 (apos MOD-007/MOD-009).
MOD-008 prove integracao Protheus para MOD-010 (MCP).
```

---

## Particularidades do MOD-008

| Aspecto | Detalhe |
|---------|---------|
| Nivel 2 — DDD-lite + Full Clean (Score 6/6) | Todos os 6 gatilhos ativos: estado/workflow (DRAFT→PUBLISHED→DEPRECATED + QUEUED→RUNNING→SUCCESS/FAILED→DLQ), compliance/auditoria (8 domain events, audit log completo), concorrencia/consistencia (Outbox Pattern, BullMQ dedupe), integracoes externas criticas (HTTP Protheus com retry/DLQ), multi-tenant (tenant_id obrigatorio, 6 scopes), regras cruzadas/reuso (heranca MOD-007, trigger_events MOD-006). |
| Heranca do MOD-007 | Reutiliza `behavior_routines` com `routine_type='INTEGRATION'`. Versionamento (DRAFT→PUBLISHED→DEPRECATED), fork atomico e imutabilidade sao controlados integralmente pelo MOD-007. ADR-003 documenta a decisao. |
| Outbox Pattern (ADR-001) | INSERT em `integration_call_logs` com `status=QUEUED` ocorre dentro da mesma transacao da operacao de negocio. Worker BullMQ escaneia logs QUEUED e enfileira jobs. `call_log.id` usado como `jobId` para deduplicacao automatica. Garante OKR-1 (zero perda de chamadas). |
| Retry gerenciado pelo Outbox (ADR-002) | Retry controlado pelo Outbox (UPDATE call_log), nao pelo BullMQ nativo. Estado completo e persistente no PostgreSQL (`attempt_number`, timestamps, status transitions). DLQ governada no banco com domain events. |
| Credenciais criptografadas (ADR-004) | `auth_config` criptografado com AES-256-GCM via secret do ambiente. Descriptografia apenas no worker BullMQ em runtime, imediatamente antes da chamada HTTP. Endpoints GET retornam `"***"` (BR-002). |
| Bloqueio BLK-004 | MOD-008 bloqueado por MOD-005 (processos para rotinas de integracao). Monitorar resolucao antes do go-live. Nao impede promocao da especificacao. |
| 4 ADRs para Nivel 2 | Excede o minimo de 2 ADRs. ADR-001 (Outbox Pattern), ADR-002 (Retry Outbox vs BullMQ), ADR-003 (Heranca MOD-007), ADR-004 (AES-256 credenciais). Reflete a complexidade do dominio de integracao. |
| 3 dependencias upstream | MOD-000 (Foundation core), MOD-006 (transicoes inbound como trigger), MOD-007 (heranca behavior_routines). Camada topologica 6 — ultimo tier de implementacao junto com MOD-010 e MOD-011. |
| Motor assincrono BullMQ | Worker com concurrency controlada via env var `INTEGRATION_CONCURRENCY` (default: 10). DLQ ativada apos `retry_max` esgotado por rotina. Reprocessamento governado com justificativa obrigatoria (min 10 chars). |
| 2 telas UX dedicadas | UX-INTEG-001 (Editor de Rotinas — 3 abas: Config HTTP, Mapeamentos, Parametros) e UX-INTEG-002 (Monitor de Integracoes — metricas do dia, DLQ tab, split-view detalhe, chain de reprocessamentos). |

---

## Checklist Rapido — O que Falta para READY

- [ ] Executar `/validate-all docs/04_modules/mod-008-integracao-protheus/` — /qa + /validate-manifest + /validate-openapi + /validate-drizzle + /validate-endpoint
- [ ] Corrigir eventuais erros encontrados
- [ ] Executar `/promote-module docs/04_modules/mod-008-integracao-protheus/` — verificar Gate 0 (DoR) 7/7

> **Nota:** Todas as 5 pendencias ja estao IMPLEMENTADA. Os 10 artefatos de requisitos estao enriquecidos. As 4 ADRs excedem o minimo para Nivel 2. Ha 1 bloqueio (BLK-004: MOD-005 → MOD-008) que nao impede a promocao da especificacao, mas deve ser monitorado para a fase de implementacao. As 3 dependencias upstream (MOD-000, MOD-006, MOD-007) estao DRAFT mas isso nao impede a promocao — apenas a geracao de codigo depende de MOD-007 estar READY (heranca de behavior_routines).

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 1.0.0 | 2026-03-22 | Criacao completa: Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 5 pendentes resolvidas (001-005), rastreio de agentes, mapa de cobertura de validadores, particularidades Outbox/BullMQ/DLQ/heranca MOD-007 |
