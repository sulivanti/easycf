# Procedimento — Plano de Acao MOD-009 Movimentos sob Aprovacao

> **Versao:** 1.0.0 | **Data:** 2026-03-22 | **Owner:** arquitetura
> **Estado atual do modulo:** DRAFT (v0.9.0) | **Epico:** APPROVED (v1.2.0) | **Features:** 5/5 APPROVED
>
> Fases 0-2 concluidas. Proximo passo: Fase 3 (Validacao) — executar `/validate-all`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-009 | APPROVED (v1.2.0) | DoR completo, 5 features vinculadas, 4 criterios de alcada, 7 tabelas, 13 endpoints |
| Features F01-F05 | 5/5 APPROVED | F01 (Regras de Controle + Alcada), F02 (Motor de Controle), F03 (Inbox + Execucao + Override), F04 (UX Inbox), F05 (UX Configurador) |
| Scaffold (forge-module) | CONCLUIDO | mod-009-movimentos-aprovacao/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | Agentes 01-11 confirmados, v0.9.0, 7 pendentes resolvidas |
| PENDENTEs | 0 abertas | 7 total: 7 IMPLEMENTADA |
| ADRs | 4 aceitas | Nivel 2 requer minimo 2 — atendido (ADR-001 Motor Sincrono, ADR-002 Segregacao Auto-Aprovacao, ADR-003 Outbox Pattern, ADR-004 Override 20 chars) |
| Amendments | 0 | Nenhum |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v0.9.0 | Ultima entrada 2026-03-19 (Etapa 4 — PEN-009-005 particionamento) |
| Screen Manifests | 2/2 existem | ux-aprov-001 (Inbox Aprovacoes), ux-aprov-002 (Configurador Regras) |
| Dependencias | 3 upstream (MOD-000, MOD-004, MOD-006) | Consome Foundation core, delegacoes de acesso, case_id opcional |
| Bloqueios | 0 | Nenhum BLK-* afeta MOD-009 |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-009 define o modulo de controle de movimentos sob aprovacao — interceptacao de operacoes criticas que exigem decisao formal antes de gerar efeito. O principio central e "Origem nao e autorizacao": API, integracao sistemica e MCP podem iniciar solicitacoes, mas nao contornam alcada. O modulo implementa motor de controle sincrono com 4 criterios combinaveis (VALUE, HIERARCHY, ORIGIN, OBJECT+OPERATION), cadeias de aprovacao multinivel com timeout e escalada, inbox de aprovacoes, override auditado e rastreabilidade integral via 7 tabelas e 13 domain events.

```
1    (manual)              Revisar e finalizar epico US-MOD-009:             CONCLUIDO
                           - Escopo fechado (5 features: 3 Backend + 2 UX)  status_agil = APPROVED
                           - 4 criterios de alcada definidos                 v1.2.0
                           - Principio "origem nao e autorizacao"
                           - Segregacao com excecao auto-aprovacao por scope
                           - 7 tabelas, 13 endpoints, 13 domain events
                           - DoR completo
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-009.md

2    (manual)              Revisar e finalizar features F01-F05:             CONCLUIDO
                           - F01: API Regras de Controle + Alcada            5/5 APPROVED
                           - F02: API Motor de Controle (interceptacao)
                           - F03: API Inbox + Execucao + Override
                           - F04: UX Inbox de Aprovacoes (UX-APROV-001)
                           - F05: UX Configurador de Regras (UX-APROV-002)
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-009-F{01..05}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Modulo de dominio rico (Nivel 2 — DDD-lite + Full Clean) com aggregate root `ControlledMovement`, 4 value objects, 4 domain services, 7 tabelas e 13 endpoints. Scaffoldado em 2026-03-19 via `forge-module` a partir de US-MOD-009 (APPROVED).

```
3    /forge-module MOD-009  Scaffold completo gerado:                        CONCLUIDO
                           mod-009-movimentos-aprovacao.md, CHANGELOG.md,   v0.1.0 (2026-03-19)
                           requirements/ (br/, fr/, data/, int/, sec/,
                           ux/, nfr/), adr/, amendments/
                           Stubs obrigatorios: DATA-003, SEC-002
                           Pasta: docs/04_modules/mod-009-movimentos-aprovacao/
```

### Fase 2: Enriquecimento — CONCLUIDO

O enriquecimento do MOD-009 foi completo — todos os agentes rodaram em 2026-03-19 em 4 batches sequenciais. Durante o processo, 7 pendencias foram identificadas e todas resolvidas. Destaque para PEN-009-001 (callback pos-aprovacao via domain event outbox) e PEN-009-002 (amendment MOD-000-F12 para registro de 7 scopes approval:*).

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> +-- SIM -> /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> +-- NAO -> Qual escopo?
>     +-- Todos agentes de 1 modulo  -> /enrich mod-009
>     +-- 1 agente especifico        -> /enrich-agent AGN-DEV-XX mod-009
> ```

```
4    /enrich docs/04_modules/mod-009-movimentos-aprovacao/
                           Agentes executados sobre mod-009:                 CONCLUIDO
                           AGN-DEV-01 (MOD), AGN-DEV-02 (BR),              v0.9.0 (2026-03-19)
                           AGN-DEV-03 (FR), AGN-DEV-04 (DATA),
                           AGN-DEV-05 (INT), AGN-DEV-06 (SEC),
                           AGN-DEV-07 (UX), AGN-DEV-08 (NFR),
                           AGN-DEV-09 (ADR), AGN-DEV-10 (PEN),
                           AGN-DEV-11 (CROSS-VALIDATION)
                           7 pendentes criadas e resolvidas (001-007)
```

#### Rastreio de Agentes — MOD-009

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-009-movimentos-aprovacao.md | CONCLUIDO | CHANGELOG v0.2.0 — narrativa expandida, aggregate root, value objects, domain services, module_paths, score 6/6 |
| 2 | AGN-DEV-02 | BR | BR-009.md | CONCLUIDO | v0.2.0 — Gherkin BDD adicionado a BR-001..BR-009, impactos explicitos |
| 3 | AGN-DEV-03 | FR | FR-009.md | CONCLUIDO | v0.2.0 — Gherkin BDD adicionado a FR-001..FR-008, idempotency e timeline flags completos |
| 4 | AGN-DEV-04 | DATA | DATA-009.md, DATA-003.md | CONCLUIDO | DATA-009 v0.3.0 (FK ON DELETE RESTRICT, indices hot-query, campos padrao), DATA-003 v0.3.0 (formato expandido por evento PKG-DEV-001 §5, outbox, notify, maskable_fields) |
| 5 | AGN-DEV-05 | INT | INT-009.md | CONCLUIDO | v0.3.0 — request/response JSON completos para 13 endpoints, erros RFC 9457, middleware/hook integration pattern, async failure behavior |
| 6 | AGN-DEV-06 | SEC | SEC-009.md, SEC-002.md | CONCLUIDO | SEC-009 v0.4.0 (segregacao/auto-aprovacao/cancelamento/override, Gherkin BDD, LGPD, auditoria), SEC-002 v0.4.0 (retencao por categoria, maskable_fields, Gherkin enforcement) |
| 7 | AGN-DEV-07 | UX | UX-009.md | CONCLUIDO | v0.4.0 — action_ids DOC-UX-010 (11 acoes inbox + 9 acoes configurador), state machines, acessibilidade WCAG 2.1 AA, responsive, estados loading/error/empty, mapeamento action-endpoint-event (16 entradas), Gherkin BDD |
| 8 | AGN-DEV-08 | NFR | NFR-009.md | CONCLUIDO | v0.3.0 — SLOs detalhados (baseline/alvo P95/P99), healthcheck, DR (RPO=0, RTO<15min), limites (5 niveis, 200 regras, 10K pendentes, 256KB payload), observabilidade completa (logging, 10 metricas Prometheus, traces OpenTelemetry, 4 dashboards, 8 alertas) |
| 9 | AGN-DEV-09 | ADR | ADR-001, ADR-002, ADR-003, ADR-004 | CONCLUIDO | 4 ADRs criadas e aceitas |
| 10 | AGN-DEV-10 | PEN | pen-009-pendente.md | CONCLUIDO | v0.5.0 — 7 pendentes criadas, todas implementadas |
| 11 | AGN-DEV-11 | CROSS | cross-validation | CONCLUIDO | IDs, metadata, rastreabilidade, cobertura de eventos, scopes, endpoints, SLOs verificados |

#### Pendentes Resolvidas no Enriquecimento — Detalhamento Completo

> As 7 pendencias abaixo foram identificadas durante o enriquecimento e todas foram decididas e implementadas em 2026-03-19.

---

##### ~~PEN-009-001 — Callback de Execucao Pos-Aprovacao~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** INT-009, FR-009
- **tipo:** decisao_tecnica
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** INT-009 §4.3, ADR-003, DATA-003 (evento 7), NFR-009 §5.3
- **tags:** callback, domain-event, outbox, pos-aprovacao
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** 1

**Questao:**
Quando o ultimo nivel da cadeia aprova um movimento, MOD-009 precisa notificar o modulo chamador para executar a operacao original usando `operation_payload`. O mecanismo de callback nao estava definido.

**Impacto:**
Sem callback, movimentos aprovados ficam em APPROVED indefinidamente, sem execucao da operacao original. Bloqueante para implementacao de FR-005 e INT-009 §4.3.

**Opcao 1 — Domain event com outbox (assincrono):**
MOD-009 emite `movement.approved` com `is_final_level: true`. Modulo chamador consome o evento e executa. Garantia at-least-once via outbox.

- Pros: Desacoplamento, garantia de entrega, alinhado com ADR-003
- Contras: Eventual consistency — pode haver delay entre aprovacao e execucao

**Opcao 2 — HTTP webhook (sincrono):**
MOD-009 chama endpoint do modulo chamador via HTTP POST com `operation_payload`.

- Pros: Execucao imediata
- Contras: Acoplamento runtime, retry management mais complexo

**Opcao 3 — Hybrid:**
Domain event como trigger + HTTP callback como fallback.

- Pros: Maxima confiabilidade
- Contras: Complexidade operacional elevada

**Recomendacao:** Opcao 1 — Domain event com outbox, alinhado com ADR-003 e padrao ja estabelecido para eventos 4-13.

**Resolucao:**

> **Decisao:** Opcao 1 — Domain event com outbox (assincrono)
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Alinhado com ADR-003 e padrao estabelecido para eventos 4-13. MOD-009 emite `movement.approved` com `is_final_level: true`. Modulo chamador consome e executa. Garantia at-least-once via outbox.
> **Artefato de saida:** INT-009 §4.3 — contrato completo do callback event `movement.approved`
> **Implementado em:** 2026-03-19

---

##### ~~PEN-009-002 — Amendment MOD-000-F12 para Registro de Scopes~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** SEC-009, MOD-000
- **tipo:** amendment
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** mod.md §8, SEC-009 §2, INT-009 §8
- **tags:** scopes, rbac, amendment, mod-000
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** 1

**Questao:**
O MOD-009 define 7 scopes RBAC (`approval:rule:read`, `approval:rule:write`, `approval:engine:evaluate`, `approval:movement:read`, `approval:movement:write`, `approval:decide`, `approval:override`). Esses scopes devem ser registrados no catalogo de scopes do DOC-FND-000 §2.2 via amendment MOD-000-F12. Sem esse amendment, nenhum endpoint do MOD-009 e acessivel.

**Impacto:**
Bloqueante para deployment — scopes nao existem no catalogo MOD-000 ate amendment ser aplicado. Nenhum endpoint funciona sem os scopes registrados.

**Opcao 1 — Amendment formal MOD-000-F12:**
Criar documento de amendment seguindo padrao do framework, com os 7 scopes + descricoes + categorizacao.

- Pros: Rastreabilidade completa, segue padrao do framework
- Contras: Requer criacao de artefato documental

**Opcao 2 — Registro via migration SQL:**
Inserir scopes diretamente na tabela `scopes` do MOD-000.

- Pros: Rapido
- Contras: Sem rastreabilidade documental

**Recomendacao:** Opcao 1 — Amendment formal, garante rastreabilidade.

**Resolucao:**

> **Decisao:** Opcao 1 — Amendment formal DOC-FND-000-M03
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Garante rastreabilidade e segue o padrao do framework. 7 scopes approval:* registrados no catalogo canonico DOC-FND-000 §2.2 com descricoes e categorizacao conforme SEC-009 §2.
> **Artefato de saida:** DOC-FND-000-M03 amendment (7 scopes approval:*). DOC-FND-000 v1.5.0 -> v1.6.0.
> **Implementado em:** 2026-03-19

---

##### ~~PEN-009-003 — Dry-Run Mode para Simulacao do Motor~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** UX-009, INT-009
- **tipo:** funcionalidade
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** UX-009 (act-config-simulate), INT-009 §2.2.1, FR-009 (FR-003)
- **tags:** dry-run, simulacao, motor, configurador
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** 3

**Questao:**
A tela UX-APROV-002 (Configurador de Regras) possui botao "Simular motor" (`act-config-simulate`) que chama `POST /movement-engine/evaluate` com `dry_run=true`. O contrato API para o modo dry-run nao estava especificado em INT-009.

**Impacto:**
Sem contrato dry-run, o botao de simulacao no configurador nao tem especificacao de backend. Administradores nao podem testar regras antes de ativar.

**Opcao 1 — Query param `?dry_run=true`:**
Simples, mas mistura concerns no mesmo endpoint.

- Pros: Simplicidade
- Contras: Mistura concerns

**Opcao 2 — Endpoint separado `POST /movement-engine/simulate`:**
Semantica clara.

- Pros: Separacao de responsabilidades
- Contras: Duplica logica do motor

**Opcao 3 — Body field `dry_run: true`:**
Integrado ao contrato existente.

- Pros: Menor impacto no contrato, motor avalia normalmente e skip INSERT
- Contras: Campo adicional no body

**Recomendacao:** Opcao 3 — Body field, menor impacto no contrato existente.

**Resolucao:**

> **Decisao:** Opcao 3 — Body field `dry_run: true` no POST /movement-engine/evaluate
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Motor avalia normalmente e skip INSERT se dry_run=true. Sem criar registros em controlled_movements, approval_instances, movement_history. Sem emitir domain events. Menor impacto no contrato existente.
> **Artefato de saida:** INT-009 §2.2.1 — campo dry_run adicionado ao evaluate
> **Implementado em:** 2026-03-19

---

##### ~~PEN-009-004 — Canal de Notificacao para Aprovadores~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** INT-009, NFR-009
- **tipo:** decisao_tecnica
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** DATA-003 (notify.recipients_rule), NFR-009 §5.1, INT-009 §5
- **tags:** notificacao, in-app, email, aprovadores
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** 1

**Questao:**
DATA-003 define `notify.enabled=true` para eventos 4-13 com `notify.recipients_rule` detalhado, mas nao especificava o canal de entrega (email, notificacao in-app, push, ou combinacao).

**Impacto:**
O mecanismo de entrega afeta implementacao do outbox consumer e dependencias em servicos externos. Sem definicao, aprovadores podem nao ser notificados.

**Opcao 1 — In-app apenas:**
Notificacao no inbox do aprovador (badge + lista). Sem dependencia externa.

- Pros: Simples, sem dependencia externa
- Contras: Aprovador precisa estar logado para ver

**Opcao 2 — Email + in-app:**
Notificacao dupla.

- Pros: Visibilidade offline
- Contras: Dependencia de servico de email, risco de spam

**Opcao 3 — Configuravel por tenant/usuario:**
Maxima flexibilidade.

- Pros: Cada tenant/usuario define canais preferidos
- Contras: Maior complexidade

**Recomendacao:** Opcao 1 — In-app como MVP; email como enhancement configuravel por tenant no roadmap.

**Resolucao:**

> **Decisao:** Opcao 1 — In-app como MVP
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Notificacao no inbox do aprovador (badge + lista) via SidebarBadge. Sem dependencia externa. Outbox consumer grava notificacao na tabela de notificacoes in-app. Email como canal adicional configuravel por tenant no roadmap pos-MVP.
> **Artefato de saida:** INT-009 §5 — canal notificacao in-app documentado
> **Implementado em:** 2026-03-19

---

##### ~~PEN-009-005 — Estrategia de Particionamento de `movement_history`~~

- **status:** IMPLEMENTADA
- **severidade:** BAIXA
- **dominio:** DATA-009
- **tipo:** decisao_tecnica
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** NFR-009 §10, DATA-009 (tabela 6)
- **tags:** particionamento, movement-history, postgresql, performance
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** 3

**Questao:**
NFR-009 §10 identifica que volumes acima de 10M registros por tenant em `movement_history` exigem particionamento por `created_at`. A decisao sobre tipo de particionamento e implementacao estava pendente.

**Impacto:**
Sem estrategia definida, queries em movement_history degradam a partir de 10M registros. Performance de auditoria e timeline comprometida.

**Opcao 1 — Range partitioning por mes (nativo PostgreSQL 14+):**
Cada particao = 1 mes. Prune automatico em queries com filtro de data.

- Pros: Prune automatico, alinhado com PostgreSQL nativo
- Contras: Complexidade de migrations, muitas particoes ao longo do tempo

**Opcao 2 — Range partitioning por trimestre:**
Menos particoes, mais dados por particao.

- Pros: Menos particoes para gerenciar
- Contras: Prune menos granular

**Opcao 3 — Sem particionamento, apenas indices:**
Suficiente ate 10M registros.

- Pros: Zero complexidade, indices existentes em DATA-009 suficientes
- Contras: Degradacao apos 10M registros

**Recomendacao:** Opcao 3 — Sem particionamento no MVP; range por mes quando volume atingir threshold.

**Resolucao:**

> **Decisao:** Opcao 3 — Sem particionamento no MVP, apenas indices. Suficiente ate 10M registros. Range por mes (nativo PostgreSQL 14+) quando volume atingir 5M (alerta preventivo).
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Indices existentes em DATA-009 sao suficientes para o MVP. Monitorar via metrica count de movement_history. Threshold de 5M registros para acionar migracao para range partitioning por mes (PostgreSQL 14+ nativo). Evita complexidade prematura sem sacrificar performance futura.
> **Artefato de saida:** Decisao registrada; threshold 5M para acionar migracao para range partitioning mensal. Monitoramento via metrica count de movement_history.
> **Implementado em:** 2026-03-19

---

##### ~~PEN-009-006 — Endpoint de Reprocessamento de Movimento FAILED~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** FR-009, INT-009
- **tipo:** funcionalidade
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** DATA-009 (movement_executions.retry_of), INT-009 §5.3, NFR-009 §5.3
- **tags:** retry, reprocessamento, failed, endpoint
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** 1

**Questao:**
DATA-009 preve campo `retry_of` (FK) em `movement_executions` para cadeia de retentativas. INT-009 §5.3 menciona reprocessamento possivel. No entanto, nao existia endpoint definido em INT-009 para disparar reprocessamento manual de um movimento com status FAILED.

**Impacto:**
Sem endpoint, movimentos FAILED ficam em estado terminal sem possibilidade de reexecucao. Admin depende de scripts manuais para retry.

**Opcao 1 — `POST /api/v1/movements/:id/retry`:**
Endpoint dedicado com scope `approval:override`.

- Pros: Controle explicito, auditavel, scope restrito
- Contras: Endpoint adicional

**Opcao 2 — Retry automatico via outbox reprocessing:**
Re-emitir `movement.approved` para trigger automatico.

- Pros: Sem endpoint novo
- Contras: Menos controle para o admin

**Opcao 3 — Admin manual via dashboard:**
Sem endpoint dedicado; admin re-executa via scripts.

- Pros: Zero implementacao
- Contras: Sem auditoria, sem rastreabilidade, alto risco operacional

**Recomendacao:** Opcao 1 — Endpoint dedicado com scope `approval:override`, operacao excepcional similar ao override.

**Resolucao:**

> **Decisao:** Opcao 1 — Endpoint dedicado POST /api/v1/movements/:id/retry
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Scope: approval:override. Cria novo registro em movement_executions com retry_of=original_id. Re-emite movement.approved para trigger execucao. Operacao excepcional com auditoria completa. Evento: movement.retried.
> **Artefato de saida:** INT-009 — endpoint retry adicionado
> **Implementado em:** 2026-03-19

---

##### ~~PEN-009-007 — Notificacao Real-Time para Inbox~~

- **status:** IMPLEMENTADA
- **severidade:** BAIXA
- **dominio:** UX-009
- **tipo:** funcionalidade
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** UX-009 (SidebarBadge, act-aprov-refresh)
- **tags:** real-time, polling, sse, websocket, inbox
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** arquitetura
- **opcao_escolhida:** 1

**Questao:**
UX-009 define `SidebarBadge` que atualiza a cada 60s via polling. Para melhor UX, notificacao real-time (WebSocket ou SSE) permitiria atualizacao imediata do badge e da lista quando novos movimentos chegam ao inbox do aprovador.

**Impacto:**
Com polling 60s, aprovadores podem esperar ate 1 minuto para ver novos movimentos. Em cenarios de alta urgencia, o delay pode ser inaceitavel.

**Opcao 1 — Polling a cada 60s (atual):**
Simples, funcional, sem infraestrutura adicional.

- Pros: Zero complexidade, funcional
- Contras: Delay de ate 60s

**Opcao 2 — WebSocket:**
Atualizacao imediata.

- Pros: Push imediato
- Contras: Infraestrutura de WebSocket (connection management, scaling)

**Opcao 3 — SSE (Server-Sent Events):**
Mais simples que WebSocket para push unidirecional.

- Pros: Compativel com load balancers HTTP/2, mais simples que WebSocket
- Contras: Unidirecional apenas

**Recomendacao:** Opcao 1 — Polling como MVP; SSE como enhancement pos-MVP apos validacao de UX.

**Resolucao:**

> **Decisao:** Opcao 1 — Polling a cada 60s como MVP. SSE (Server-Sent Events) como enhancement pos-MVP apos validacao de UX.
> **Decidido por:** arquitetura em 2026-03-19
> **Justificativa:** Polling a cada 60s e simples, funcional e nao requer infraestrutura adicional. SSE (opcao 3) e mais adequado que WebSocket para push unidirecional e compativel com load balancers HTTP/2, ficando no roadmap pos-MVP apos validacao de UX com usuarios reais.
> **Artefato de saida:** Decisao registrada. SSE no roadmap pos-MVP como enhancement de UX-009 (SidebarBadge).
> **Implementado em:** 2026-03-19

---

### Fase 3: Validacao — PENDENTE

O `/validate-all` ainda nao foi executado para o MOD-009. Com o enriquecimento completo e todas as pendencias resolvidas, o proximo passo e executar a validacao.

> **Decision tree de validacao:**
>
> ```
> Quero validar tudo de uma vez?
> +-- SIM -> /validate-all (orquestra todos, pula os que nao tem artefato)
> +-- NAO -> Qual pilar?
>     +-- Sintaxe/links/metadados -> /qa
>     +-- Screen manifests       -> /validate-manifest
>     +-- Contratos OpenAPI      -> /validate-openapi
>     +-- Schemas Drizzle        -> /validate-drizzle
>     +-- Endpoints Fastify      -> /validate-endpoint
> ```

```
5    /validate-all docs/04_modules/mod-009-movimentos-aprovacao/
                           Orquestra TODAS as validacoes em sequencia:        A EXECUTAR
                           Internamente executa:
                             1. /qa (lint, links, metadados, EX-*, §N, ciclos)
                             2. /validate-manifest (screen manifests vs schema v1)
                             3. /validate-openapi (contratos OpenAPI vs INT-009)
                             4. /validate-drizzle (schemas Drizzle vs DATA-009)
                             5. /validate-endpoint (handlers Fastify vs INT-009)
                           Pre-condicao: Enriquecimento concluido
                           Pos-condicao: Relatorio consolidado pass/fail
```

> **Alternativa:** Executar validadores individuais:

```
5a   /qa docs/04_modules/mod-009-movimentos-aprovacao/
                           Diagnostico de sintaxe e integridade:              INDIVIDUAL
                           - lint:docs (Pass A-E: EX-*, §N, IDs, context-map, ciclos)
                           - Consistencia de metadados (estado_item, owner)
                           - Dead links, DoR alignment

5b   /validate-manifest ux-aprov-001.inbox-aprovacoes.yaml
                           Validar manifests contra schema v1:               INDIVIDUAL
                           - ux-aprov-001.inbox-aprovacoes.yaml
                           - ux-aprov-002.config-regras.yaml
                           Verifica: DOC-UX-010, operationId, RBAC,
                           action_ids, state machines, permissions

5c   /validate-openapi mod-009                                               INDIVIDUAL
5d   /validate-drizzle mod-009                                               INDIVIDUAL
5e   /validate-endpoint mod-009                                              INDIVIDUAL
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | `/qa` | SIM (todos) | SIM | mod-009-movimentos-aprovacao.md, requirements/*, adr/*, CHANGELOG.md |
| 2 | `/validate-manifest` | SIM (2 manifests existem) | SIM | ux-aprov-001, ux-aprov-002 |
| 3 | `/validate-openapi` | SIM (13 endpoints definidos) | SIM | INT-009 (contratos OpenAPI) |
| 4 | `/validate-drizzle` | SIM (7 tabelas definidas) | SIM | DATA-009 (7 tabelas) |
| 5 | `/validate-endpoint` | SIM (13 handlers previstos) | SIM | INT-009 (13 endpoints) |

### Fase 4: Promocao — PENDENTE

```
10   /promote-module docs/04_modules/mod-009-movimentos-aprovacao/
                           Selar mod-009 como READY:                         A EXECUTAR (apos fase 3)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (7/7 IMPLEMENTADA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (10/10)
                             [DoR-3] Zero erros de lint? ................ A VERIFICAR (executar /qa)
                             [DoR-4] Screen manifests validados? ........ A VERIFICAR (executar /validate-manifest)
                             [DoR-5] ADRs conforme nivel? ............... SIM (4 >= 2 para N2)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v0.9.0)
                             [DoR-7] Bloqueios cross-modulo? ............ SIM (0 bloqueios)

                           Fluxo interno:
                             Step 1: /qa (pre-check)
                             Step 2: Promover estado_item DRAFT->READY
                             Step 3: /qa (pos-check)
                             Step 4: /update-index
                             Step 5: /git commit
                           Pre-condicao: QA verde, DoR-1..7 atendidos
                           Pos-condicao: estado_item = READY, INDEX.md atualizado, commit
```

> **Nota:** MOD-009 depende de MOD-000 (Foundation), MOD-004 (Identidade Avancada) e MOD-006 (Execucao de Casos). A promocao do MOD-009 pode ocorrer independentemente — o DoR nao exige que dependencias upstream estejam READY (apenas que existam). Porem, o codigo so pode ser gerado quando as dependencias upstream estiverem READY (endpoints implementados).

### Fase 5: Pos-READY (quando necessario)

```
11   /update-specification docs/04_modules/mod-009-movimentos-aprovacao/requirements/fr/FR-009.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY -> delega para
                           /create-amendment automaticamente

12   /create-amendment FR-009 melhoria "descricao"
                           Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
                           Caso de uso previsto: endpoint retry (se contrato
                           mudar apos READY), SSE enhancement (quando
                           validacao UX indicar necessidade)
```

### Gestao de Pendencias (qualquer momento)

> **Decision tree de pendencias:**
>
> ```
> O que preciso fazer com pendencias?
> +-- Ver situacao atual       -> /manage-pendentes list PEN-009
> +-- Criar nova pendencia     -> /manage-pendentes create PEN-009
> +-- Analisar opcoes          -> /manage-pendentes analyze PEN-009 PEN-009-XXX
> +-- Registrar decisao        -> /manage-pendentes decide PEN-009 PEN-009-XXX opcao=X
> +-- Implementar decisao      -> /manage-pendentes implement PEN-009 PEN-009-XXX
> +-- Cancelar pendencia       -> /manage-pendentes cancel PEN-009 PEN-009-XXX
> +-- Relatorio consolidado    -> /manage-pendentes report PEN-009
> ```

```
16   /manage-pendentes list PEN-009
                           Estado atual MOD-009:
                             PEN-009: 7 itens total
                               7 IMPLEMENTADA (001-007)
                               0 ABERTA
                             SLA: nenhum vencido
```

#### Painel de Pendencias — Resumo Individual

| PENDENTE | Status | Sev. | Dominio | Decisao | Artefato de saida |
|----------|--------|------|---------|---------|-------------------|
| PEN-009-001 | IMPLEMENTADA | ALTA | INT-009, FR-009 | Opcao 1 — Domain event com outbox (assincrono) | INT-009 §4.3 |
| PEN-009-002 | IMPLEMENTADA | ALTA | SEC-009, MOD-000 | Opcao 1 — Amendment formal DOC-FND-000-M03 | DOC-FND-000-M03 |
| PEN-009-003 | IMPLEMENTADA | MEDIA | UX-009, INT-009 | Opcao 3 — Body field dry_run no evaluate | INT-009 §2.2.1 |
| PEN-009-004 | IMPLEMENTADA | MEDIA | INT-009, NFR-009 | Opcao 1 — In-app como MVP | INT-009 §5 |
| PEN-009-005 | IMPLEMENTADA | BAIXA | DATA-009 | Opcao 3 — Sem particionamento MVP, indices | Decisao registrada |
| PEN-009-006 | IMPLEMENTADA | MEDIA | FR-009, INT-009 | Opcao 1 — Endpoint POST /movements/:id/retry | INT-009 |
| PEN-009-007 | IMPLEMENTADA | BAIXA | UX-009 | Opcao 1 — Polling 60s MVP, SSE roadmap | Decisao registrada |

> Detalhamento completo: ver [Fase 2](#pendentes-resolvidas-no-enriquecimento--detalhamento-completo).

### Utilitarios (qualquer momento)

```
14   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-009): <descricao>

15   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

17   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-009

```
US-MOD-009 (APPROVED v1.2.0)             <- Fase 0: CONCLUIDA
  |  5/5 features APPROVED (3 Backend + 2 UX)
  v
mod-009-movimentos-aprovacao/ (stubs DRAFT) <- Fase 1: CONCLUIDA (forge-module v0.1.0)
  |
  v
mod-009 enriquecido (DRAFT v0.9.0)        <- Fase 2: CONCLUIDA (11 agentes, 7 PENDENTEs resolvidas)
  |
  +-- * PROXIMO PASSO: /validate-all
  |     +-- /qa .................. A EXECUTAR
  |     +-- /validate-manifest ... A EXECUTAR (2 manifests)
  |     +-- /validate-openapi .... A EXECUTAR (13 endpoints)
  |     +-- /validate-drizzle .... A EXECUTAR (7 tabelas)
  |     +-- /validate-endpoint ... A EXECUTAR (13 handlers)
  |
  v
mod-009 validado (DRAFT)                  <- Fase 3: A EXECUTAR
  |
  +-- Gate 0 (DoR): 5/7 atendidos, 2 A VERIFICAR (lint + manifests)
  |
  v
mod-009 selado (READY)                    <- Fase 4: A EXECUTAR (apos fase 3)
  |
  v
mod-009 + amendments/                     <- Fase 5: SOB DEMANDA (0 amendments)

Dependencias upstream: MOD-000 (Foundation), MOD-004 (Identidade), MOD-006 (Execucao) — camada topologica 5.
MOD-009 prove motor de controle para MOD-010 (MCP como origem de movimentos).
```

---

## Particularidades do MOD-009

| Aspecto | Detalhe |
|---------|---------|
| Dominio rico (Nivel 2) | Motor de controle sincrono com 4 criterios combinaveis de alcada. Aggregate root `ControlledMovement` centraliza invariantes. 4 value objects, 4 domain services. Score 6/6 — todos os gatilhos presentes (estado/workflow, compliance/auditoria, concorrencia, integracoes, multi-tenant, regras cruzadas). |
| 7 tabelas proprias | `movement_control_rules`, `approval_rules`, `controlled_movements`, `approval_instances`, `movement_executions`, `movement_history`, `movement_override_log`. Rastreabilidade integral via `movement_history` com 11 event_types. |
| 13 endpoints | 5 admin (regras), 1 motor (evaluate), 4 movimentos (list/get/cancel/override), 3 inbox (list/approve/reject). Endpoint retry adicionado via PEN-009-006. |
| 13 domain events | 3 administrativos (sincrono simples) + 10 de movimentos (outbox pattern, ADR-003). Notificacao in-app via outbox consumer. |
| 7 scopes RBAC | Registrados via amendment DOC-FND-000-M03. Segregacao de funcoes com excecao de auto-aprovacao por scope (ADR-002, allow_self_approve=true). |
| 4 ADRs para Nivel 2 | ADR-001 (Motor Sincrono), ADR-002 (Segregacao + Auto-Aprovacao), ADR-003 (Outbox Pattern eventos 4-13), ADR-004 (Override 20 chars). Excede o minimo de 2 ADRs para Nivel 2. |
| Principio "Origem nao e autorizacao" | API, integracao sistemica e MCP podem iniciar solicitacoes, mas nao contornam alcada. origin_type IN ['API', 'MCP', 'AGENT'] pode ser configurado para sempre exigir aprovacao humana. |
| MOD-009 vs MOD-006 | Ortogonais: MOD-006 Gates operam dentro de fluxos de processo (transicoes de estagio); MOD-009 Movimentos operam em qualquer operacao critica (com ou sem processo). MOD-009 consome `case_id` opcional de MOD-006. |
| Dependencia tripla upstream | MOD-000 (auth, RBAC, events), MOD-004 (scopes para auto-approval), MOD-006 (case_id opcional). Camada topologica 5 (implementacao apos MOD-006). |

---

## Checklist Rapido — O que Falta para READY

- [ ] Executar `/validate-all docs/04_modules/mod-009-movimentos-aprovacao/` — /qa + /validate-manifest + /validate-openapi + /validate-drizzle + /validate-endpoint
- [ ] Corrigir eventuais erros encontrados
- [ ] Executar `/promote-module docs/04_modules/mod-009-movimentos-aprovacao/` — verificar Gate 0 (DoR) 7/7

> **Nota:** Todas as 7 pendencias ja estao IMPLEMENTADA. Os 10 artefatos de requisitos estao enriquecidos. As 4 ADRs excedem o minimo para Nivel 2. Nao ha bloqueios (BLK-*) afetando MOD-009. As dependencias upstream (MOD-000, MOD-004, MOD-006) estao DRAFT mas isso nao impede a promocao da especificacao — apenas a geracao de codigo.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 1.0.0 | 2026-03-22 | Criacao completa: Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 7 pendentes resolvidas (001-007), rastreio de 11 agentes, mapa de cobertura de 5 validadores, particularidades de dominio rico Nivel 2 |
