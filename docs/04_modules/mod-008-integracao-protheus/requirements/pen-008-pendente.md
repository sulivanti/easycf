> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-19 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-19 | AGN-DEV-10  | Enriquecimento Batch 4 — 5 pendências identificadas via análise cruzada dos pilares |
> | 0.3.0  | 2026-03-19 | arquitetura | PENDENTE-001 decidida: Opção B (tabela simples + trigger de migração) |
> | 0.4.0  | 2026-03-19 | arquitetura | PENDENTE-002 decidida: Opção A (retenção 6 meses + archive S3 com anonimização PII) |
> | 0.5.0  | 2026-03-19 | arquitetura | PENDENTE-004 implementada: Opção B+A (ticket Protheus + fallback default=10 + monitoramento) |
>
| 0.6.0  | 2026-03-19 | arquitetura | PENDENTE-003 decidida+implementada: Opção A (cache Redis OAuth2, lock distribuído, mid-flight expiry) |
| 0.7.0  | 2026-03-19 | arquitetura | PENDENTE-005 implementada: Opção A (seed automático HML com WireMock) |
| 0.8.0  | 2026-03-19 | arquitetura | PENDENTE-001 implementada: Opção B (tabela simples + trigger migração 10M; alerta 5M no NFR-008) |
| 0.9.0  | 2026-03-19 | arquitetura | PENDENTE-002 implementada: Opção A (retenção 6 meses hot + archive S3 anonimizado; original purgado) |

# PEN-008 — Questões Abertas da Integração Dinâmica Protheus

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-008, MOD-008, NFR-008, SEC-008, INT-008, DATA-008

---

## Painel de Controle

| # | ID | Severidade | Domínio | Tipo | Status | Título |
|---|---|---|---|---|---|---|
| 1 | PENDENTE-001 | 🟠 ALTA | DATA | DEC-TEC | ✅ IMPLEMENTADA | ~~Estratégia de particionamento de call_logs quando volume > 10M~~ |
| 2 | PENDENTE-002 | 🟠 ALTA | SEC | LACUNA | ✅ IMPLEMENTADA | ~~Política de retenção de call_logs vs. LGPD~~ |
| 3 | PENDENTE-003 | 🟡 MÉDIA | INT | LACUNA | ✅ IMPLEMENTADA | ~~Suporte a OAuth2 refresh token para Protheus~~ |
| 4 | PENDENTE-004 | 🟠 ALTA | INT | DEP-EXT | 🟢 IMPLEMENTADA | Limite real de concurrency do Protheus em produção |
| 5 | PENDENTE-005 | 🟡 MÉDIA | INFRA | LACUNA | ✅ IMPLEMENTADA | Seed de integration_services de HML para testes |

---

## PENDENTE-001 — Estratégia de Particionamento de call_logs Quando Volume > 10M

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **domínio:** DATA
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** B
- **implementado_em:** 2026-03-19
- **modulo:** MOD-008
- **rastreia_para:** DATA-008, NFR-008, FR-009
- **tags:** performance, particionamento, escalabilidade
- **sla_data:** —
- **dependencias:** []

### Questão

A tabela `integration_call_logs` é de alto volume (~1000-50000 registros/tenant/mês) e acumula request_payload + response_body em JSONB. O DATA-008 menciona "considerar particionamento por `queued_at` quando volume > 10M" e o NFR-008 §10 prevê particionamento mensal como estratégia de escalabilidade, mas nenhum artefato define quando, como e quem implementará o particionamento. Sem decisão, queries de listagem podem degradar além do SLO de 500ms p95 quando o volume crescer.

### Impacto

Degradação progressiva de performance em GET /admin/integration-logs e na query de DLQ monitoring (scan a cada 60s). O monitor UX-INTEG-002 ficaria lento e o alerta de DLQ poderia atrasar, comprometendo a operação.

### Opções

**Opção A — Particionamento nativo PostgreSQL por range (queued_at) mensal desde o início:**
Criar a tabela como partitioned table com partições mensais automáticas via pg_partman ou cron job.

- Prós: Zero migração futura; performance previsível desde o dia 1; queries com filtro de período aproveitam partition pruning.
- Contras: Complexidade adicional no setup inicial; overhead de gerenciar partições; FKs para tabelas partitioned exigem cuidado no PostgreSQL (FKs em partitions são parcialmente suportadas a partir do PG 12+).

**Opção B — Tabela simples com trigger de migração quando volume atingir 10M:**
Iniciar com tabela não-particionada. Monitorar volume via métrica. Quando atingir 10M, executar migração para partitioned table.

- Prós: Simplicidade inicial; menor overhead de setup; sem complexidade de partitions até ser necessário.
- Contras: Migração disruptiva (ALTER TABLE para partitioned exige lock ou pg_repack); risco de degradação antes da migração ser executada; dívida técnica acumulada.

### Recomendação

Opção B — iniciar com tabela simples e monitorar. O volume esperado no Wave 4 (poucos tenants, ~50 rotinas) não justifica a complexidade do particionamento desde o início. Adicionar alerta no NFR quando `integration_call_logs.count > 5M` para acionar a migração. Documentar o plano de migração como ADR quando necessário.

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| `/manage-pendentes decide PEN-008 PENDENTE-001 opção=B` | Formalizar decisão | Quando equipe validar a recomendação |

### Resolução

> **Decisão:** Opção B — Tabela simples com trigger de migração quando volume atingir 10M
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Volume esperado no Wave 4 (poucos tenants, ~50 rotinas) não justifica complexidade de particionamento desde o início. Alerta no NFR quando count > 5M aciona migração preventiva. Env var INTEGRATION_CONCURRENCY já limita throughput.
> **Artefato de saída:** Decisão documentada em PEN-008. Alerta `integration_call_logs.count > 5M` planejado no NFR-008 §6.5. Env var `INTEGRATION_CONCURRENCY` já limita throughput.
> **Implementado em:** PEN-008 v0.8.0, NFR-008 §6.5

---

## PENDENTE-002 — Política de Retenção de call_logs vs. LGPD

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **domínio:** SEC
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **implementado_em:** 2026-03-19
- **modulo:** MOD-008
- **rastreia_para:** SEC-008, DATA-008, NFR-008, BR-009
- **tags:** LGPD, retenção, auditoria, compliance
- **sla_data:** —
- **dependencias:** []

### Questão

O SEC-008 §4.2 menciona que call_logs são registros de auditoria imutáveis (BR-009), mas que `request_payload` e `response_body` PODEM conter PII transitória. O SEC-008 afirma que "call_logs seguem política de retenção do Foundation para dados de auditoria" e o NFR-008 §10 prevê "archive de call_logs > 6 meses para cold storage (S3)". Porém, nenhum artefato define: (1) qual é a política de retenção concreta do Foundation para auditoria, (2) como anonimizar PII em payloads sem deletar o registro de auditoria, (3) período exato de retenção em hot storage vs. cold storage.

### Impacto

Sem política definida, o sistema pode acumular PII transitória indefinidamente em call_logs, violando o princípio de minimização da LGPD. Adicionalmente, o custo de storage PostgreSQL cresce sem controle.

### Opções

**Opção A — Retenção de 6 meses em hot storage + archive para cold (S3) com anonimização de PII:**
Após 6 meses, mover registros para S3 (JSON comprimido) com PII anonimizada nos campos request_payload e response_body. Registros no banco são deletados (exceto metadados: id, status, correlation_id, duration_ms).

- Prós: Compliance LGPD; custo otimizado; rastreabilidade mantida via metadados.
- Contras: Complexidade de implementação (job de archive + pipeline de anonimização); queries históricas exigem consulta ao S3.

**Opção B — Retenção indefinida com anonimização in-place dos campos PII após 90 dias:**
Manter todos os registros no PostgreSQL, mas executar job de anonimização que substitui PII em request_payload e response_body por hashes após 90 dias.

- Prós: Sem infraestrutura de cold storage; queries históricas continuam no PostgreSQL.
- Contras: Custo de storage mais alto; anonimização in-place modifica registro de auditoria (conflito com imutabilidade BR-009).

### Recomendação

Opção A — retenção de 6 meses com archive para S3. A anonimização resolve a tensão entre auditoria imutável (BR-009) e LGPD, pois o registro arquivado é uma cópia anonimizada, enquanto o original é eventualmente purgado do hot storage.

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| `/manage-pendentes decide PEN-008 PENDENTE-002 opção=A` | Formalizar decisão com DPO | Quando DPO validar a política |

### Resolução

> **Decisão:** Opção A — Retenção de 6 meses em hot storage + archive para cold (S3) com anonimização de PII
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Resolve a tensão entre auditoria imutável (BR-009) e LGPD. O registro arquivado em S3 é cópia anonimizada; o original é purgado do hot storage após 6 meses. Metadados (id, status, correlation_id, duration_ms) permanecem no PostgreSQL para rastreabilidade.
> **Artefato de saída:** Política documentada em PEN-008. Registro arquivado em S3 é cópia anonimizada; original purgado após 6 meses. Metadados (id, status, correlation_id, duration_ms) permanecem no PostgreSQL.
> **Implementado em:** PEN-008 v0.9.0, NFR-008 §10

---

## PENDENTE-003 — Suporte a OAuth2 Refresh Token para Protheus

- **status:** IMPLEMENTADA
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Cache de token em Redis com TTL=expires_in-60s, renovacao lazy. Lock distribuido via SET NX EX para prevenir thundering herd. Redis ja na stack (BullMQ). client_credentials grant (sem refresh_token).
- **implementado_em:** 2026-03-19
- **severidade:** MÉDIA
- **domínio:** INT
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **modulo:** MOD-008
- **rastreia_para:** INT-004, FR-001, SEC-008, DATA-008
- **tags:** OAuth2, refresh-token, autenticação, Protheus
- **sla_data:** —
- **dependencias:** []

### Questão

O INT-008 §4 (INT-004) documenta o fluxo OAUTH2 como "client_credentials -> token endpoint -> access_token" com cache do token por `expires_in - 60s`. Porém, não especifica: (1) o que acontece quando o access_token expira durante uma chamada em andamento (mid-flight expiry), (2) se o Protheus suporta refresh_token ou apenas client_credentials grant, (3) como o cache de tokens é compartilhado entre múltiplos workers BullMQ, (4) se o token deve ser cacheado em Redis (compartilhado) ou em memória (por worker).

### Impacto

Sem definição, chamadas OAUTH2 podem falhar com 401 quando o token expira entre o cache e a execução. Com múltiplos workers, cada um pode solicitar um novo token simultaneamente, causando overhead desnecessário no token endpoint do Protheus.

### Opções

**Opção A — Cache de token em Redis com TTL = expires_in - 60s, renovação lazy:**
Armazenar access_token em Redis com chave `oauth2:token:{service_id}:{tenant_id}`. Qualquer worker verifica Redis antes de chamar o token endpoint. Se expirado, um único worker renova (lock distribuído) e os demais aguardam.

- Prós: Token compartilhado entre workers; mínimo de chamadas ao token endpoint; lock previne thundering herd.
- Contras: Dependência adicional do Redis para auth; complexidade de lock distribuído.

**Opção B — Cache em memória por worker, sem compartilhamento:**
Cada worker mantém seu próprio cache de tokens. Expiração individual.

- Prós: Simplicidade; sem lock distribuído.
- Contras: N workers = até N chamadas simultâneas ao token endpoint; overhead no Protheus; tokens podem divergir.

### Recomendação

Opção A — cache em Redis com lock distribuído. Redis já está na stack (BullMQ), e o lock via `SET NX EX` é trivial. O volume de chamadas OAUTH2 justifica o compartilhamento.

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| — | Validar com equipe Protheus se suportam refresh_token | Antes da implementação de F01 |

### Resolução

> **Decisão:** Opção A — Cache de token em Redis com TTL=expires_in-60s, renovação lazy. Chave: `oauth2:token:{service_id}:{tenant_id}`. Lock distribuído via `SET NX EX` para prevenir thundering herd. Redis já na stack (BullMQ). Grant type: `client_credentials` (sem refresh_token). Interceptor de 401 força renovação (mid-flight expiry).
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Token compartilhado entre workers minimiza chamadas ao token endpoint do Protheus. Lock distribuído previne thundering herd. Redis já disponível (BullMQ). client_credentials grant é o padrão Protheus (sem refresh_token). Interceptor de 401 resolve mid-flight expiry.
> **Artefato de saída:** INT-008 §INT-004 (fluxo OAUTH2 detalhado: cache Redis, lock, mid-flight expiry, tabela de erros)
> **Implementado em:** INT-008 v0.3.0

---

## PENDENTE-004 — Limite Real de Concurrency do Protheus em Produção

- **status:** ABERTA
- **severidade:** ALTA
- **domínio:** INT
- **tipo:** DEP-EXT
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **modulo:** MOD-008
- **rastreia_para:** INT-004, NFR-008, FR-005, SEC-008
- **tags:** concurrency, Protheus, rate-limit, performance
- **sla_data:** —
- **dependencias:** []

### Questão

O mod.md define `INTEGRATION_CONCURRENCY` (default: 10) como env var para limitar conexões simultâneas ao Protheus, e o NFR-008 menciona esse limite. Porém, o valor "10" é uma estimativa — o limite real de conexões simultâneas do Protheus em produção não está documentado. Adicionalmente, o Protheus pode ter rate limits próprios (429) que não foram mapeados. Sem o dado real, o sistema pode sobrecarregar o Protheus (concurrency muito alta) ou subutilizar a capacidade (concurrency muito baixa).

### Impacto

Concurrency muito alta: Protheus retorna 429 ou degrada, gerando DLQs em massa. Concurrency muito baixa: fila de integração cresce, aumentando a latência entre enqueue e execução (viola SLO de queue_latency).

### Opções

**Opção A — Manter default=10 e ajustar empiricamente em produção:**
Deploy com INTEGRATION_CONCURRENCY=10. Monitorar métricas de rate limit 429 e DLQ count. Ajustar iterativamente.

- Prós: Pragmático; não bloqueia desenvolvimento; ajuste dinâmico via env var sem redeploy.
- Contras: Risco de DLQ em massa na primeira semana de produção se o limite real for < 10.

**Opção B — Solicitar ao time Protheus o limit real antes do go-live:**
Obter documentação oficial do Protheus sobre conexões simultâneas e rate limits por tenant/IP.

- Prós: Dado concreto; configuração segura desde o go-live.
- Contras: Dependência externa; pode atrasar se o time Protheus não responder a tempo.

### Recomendação

Opção B como ação paralela (solicitar ao time Protheus) + Opção A como fallback (deploy com default=10 e monitoramento). O alerta "Rate limit 429 > 5% (15min window)" do NFR-008 §6.5 protege contra sobrecarga.

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| — | Abrir ticket para time Protheus solicitando limites de concurrency | Antes da sprint de F03 (Motor de execução) |

### Resolução

> **Decisão:** Opção B+A — Solicitar ao time Protheus o limite real de conexões simultâneas e rate limits por tenant/IP. Fallback: manter default=10 com monitoramento. Alerta 429>5% (15min window) protege contra sobrecarga.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Ação principal: solicitar ao time Protheus documentação oficial de conexões simultâneas e rate limits por tenant/IP em produção. Fallback: deploy com `INTEGRATION_CONCURRENCY=10` e monitoramento de métricas (rate limit 429, DLQ count). Ajuste dinâmico via env var sem redeploy. Alerta `Rate limit 429 > 5% (15min window)` do NFR-008 §6.5 protege contra sobrecarga.
> **Artefato de saída:** Ticket para time Protheus (ação externa) + NFR-008 atualizado com estratégia de ajuste dinâmico
> **Implementado em:** NFR-008 §5, §6.5

---

## PENDENTE-005 — Seed de integration_services de HML para Testes

- **status:** IMPLEMENTADA
- **severidade:** MÉDIA
- **domínio:** INFRA
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **modulo:** MOD-008
- **rastreia_para:** FR-001, BR-012, INT-004, NFR-008
- **tags:** seed, HML, testes, mock, DoR
- **sla_data:** —
- **dependencias:** []

### Questão

O BR-012 exige que o botão "Testar agora (HML)" use um serviço com `environment=HML`. Os cenários Gherkin de F01 e F04 dependem da existência de um serviço HML cadastrado. Porém, nenhum artefato define: (1) se o seed de HML é obrigatório para ambientes de desenvolvimento/teste, (2) como o mock do Protheus será provisionado para testes de integração e E2E, (3) quais dados mínimos o seed deve conter (base_url, auth_config mock, timeout).

### Impacto

Sem seed de HML, testes de integração e E2E que dependem do BR-012 (teste HML) e FR-001 (CRUD serviços) não podem ser executados de forma automatizada. Desenvolvedores precisarão criar serviços manualmente a cada reset de ambiente.

### Opções

**Opção A — Seed automático no migration/setup com serviço HML mock:**
Criar migration seed que insere `integration_services` com `environment=HML`, `base_url` apontando para mock server (WireMock ou similar), `auth_type=NONE`, `status=ACTIVE`. Seed executado em ambientes DEV e HML.

- Prós: Testes automatizados funcionam sem setup manual; DoR de F01 satisfeito; mock server provido pela infra de testes.
- Contras: Seed precisa ser mantido; mock server precisa ser configurado para simular respostas Protheus.

**Opção B — Seed manual documentado em README:**
Documentar os comandos de seed no README. Desenvolvedores executam manualmente.

- Prós: Zero código extra de seed.
- Contras: Propício a erro humano; bloqueador para CI/CD automatizado; violaria a regra de automação obrigatória (DOC-DEV-001 §0.2).

### Recomendação

Opção A — seed automático com mock server. Incluir na definição de DoR de F01: "Seed de HML com mock server disponível em ambiente de testes."

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| — | Criar seed migration + setup de mock server | Antes do início do desenvolvimento de F01 |

### Resolução

> **Decisão:** Opção A — Seed automático no migration/setup com serviço HML mock. Insere `integration_services` com `environment=HML`, `base_url=http://wiremock:8080`, `auth_type=NONE`, `status=ACTIVE`, `timeout_ms=5000`. Seed executado automaticamente em ambientes DEV e HML via migration.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Testes automatizados funcionam sem setup manual. DoR de F01 satisfeito. Mock server (WireMock) provido pela infra de testes. Seed mantido como migration seed para garantir reprodutibilidade. Incluir no DoR de F01: "Seed de HML com mock server disponível em ambiente de testes."
> **Artefato de saída:** DATA-008 (seed HML adicionado)
> **Implementado em:** DATA-008
