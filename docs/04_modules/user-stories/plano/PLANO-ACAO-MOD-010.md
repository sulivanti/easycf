# Procedimento — Plano de Acao MOD-010 MCP e Automacao Governada

> **Versao:** 1.0.0 | **Data:** 2026-03-22 | **Owner:** arquitetura
> **Estado atual do modulo:** DRAFT (v0.6.0) | **Epico:** APPROVED (v1.2.0) | **Features:** 5/5 APPROVED
>
> Fases 0-2 concluidas. Proximo passo: Fase 3 (Validacao) — executar `/validate-all`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-010 | APPROVED (v1.2.0) | DoR completo, 5 features vinculadas, 3 politicas de execucao, blocklist Phase 1/2 |
| Features F01-F05 | 5/5 APPROVED | F01 (API Agentes + Catalogo), F02 (API Gateway + Motor), F03 (API Log), F04 (UX Gestao), F05 (UX Monitor) |
| Scaffold (forge-module) | CONCLUIDO | mod-010-mcp-automacao/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | AGN-DEV-01 a AGN-DEV-11 confirmados, v0.6.0, 6 pendentes resolvidas |
| PENDENTEs | 0 abertas | 6 total: 6 IMPLEMENTADA |
| ADRs | 4 criadas | Nivel 2 requer minimo 2 — atendido (ADR-001 Gateway Sincrono, ADR-002 API Key bcrypt, ADR-003 Outbox Pattern, ADR-004 Blocklist Wildcard) |
| Amendments | 0 | Nenhum (modulo ainda DRAFT) |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v0.6.0 | Ultima entrada 2026-03-19 (Batch 4 final + PENDENTE-006 resolvida) |
| Screen Manifests | 0 YAML | UX-MCP-001, UX-MCP-002 documentados em UX-010 (sem YAML standalone) |
| Dependencias | 5 upstream (MOD-000, MOD-004, MOD-007, MOD-008, MOD-009) | Consome Foundation core, scopes, parametrizacao, integracoes, motor de aprovacao |
| Bloqueios | 0 | Nenhum BLK-* afeta MOD-010 diretamente |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-010 define o modulo de automacao governada via protocolo MCP — agentes com identidade tecnica propria que executam acoes sem contornar governanca. Principio central: "O fato de o usuario poder aprovar nao significa que seu agente associado tambem possa aprovar." O modulo cobre API de Agentes, Gateway de Despacho com 3 politicas (DIRECT/CONTROLLED/EVENT_ONLY), Log de Execucoes e interfaces UX de Gestao e Monitor.

```
1    (manual)              Revisar e finalizar epico US-MOD-010:             CONCLUIDO
                           - Escopo fechado (5 features, 3 politicas)       status_agil = APPROVED
                           - Gherkin validado (blocklist, CONTROLLED, rastreabilidade)  v1.2.0
                           - DoR completo (5 tabelas, 13 endpoints, 6 scopes)
                           - Regra-Mae de Nao-Bypass formalizada
                           - Blocklist Phase 1/2 documentada
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-010.md

2    (manual)              Revisar e finalizar features F01-F05:             CONCLUIDO
                           - F01: API Agentes MCP + Catalogo de Acoes       5/5 APPROVED
                           - F02: API Gateway + Motor de Despacho MCP
                           - F03: API Log de Execucoes MCP
                           - F04: UX Gestao de Agentes e Acoes (UX-MCP-001)
                           - F05: UX Monitor de Execucoes MCP (UX-MCP-002)
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-010-F{01..05}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Modulo de Nivel 2 (DDD-lite + Clean Completo) com 6 gatilhos DOC-ESC-001 ativados. Score 6/6 — o mais alto do sistema. Aggregate Root McpAgent com Domain Services (McpGateway, ScopeBlocklistValidator, McpDispatcher) e Value Objects (ExecutionPolicy, AgentStatus, ActionType).

```
3    /forge-module MOD-010  Scaffold completo gerado:                        CONCLUIDO
                           mod-010-mcp-automacao.md, CHANGELOG.md,          v0.1.0 (2026-03-19)
                           requirements/ (br/, fr/, data/, int/, sec/,
                           ux/, nfr/), adr/, amendments/
                           Stubs obrigatorios: DATA-003, SEC-002
                           5 tabelas, 13 endpoints, 6 scopes mcp:*
                           Pasta: docs/04_modules/mod-010-mcp-automacao/
```

### Fase 2: Enriquecimento — CONCLUIDO

O enriquecimento do MOD-010 foi completo — todos os agentes rodaram em 2026-03-19. Durante o processo, 6 pendencias foram identificadas e todas resolvidas no mesmo dia. Destaque para a complexidade do modulo: 14 secoes em SEC-010, 5 integracoes detalhadas em INT-010 com 13 contratos, 4 ADRs criadas, e cross-validation com 2 erros corrigidos e 4 warnings documentados.

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> |-- SIM -> /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> +-- NAO -> Qual escopo?
>     |-- Todos agentes de 1 modulo  -> /enrich mod-010
>     +-- 1 agente especifico        -> /enrich-agent AGN-DEV-XX mod-010
> ```

```
4    /enrich docs/04_modules/mod-010-mcp-automacao/
                           Agentes executados sobre mod-010:                 CONCLUIDO
                           AGN-DEV-01 (MOD), AGN-DEV-02 (BR),              v0.6.0 (2026-03-19)
                           AGN-DEV-03 (FR), AGN-DEV-04 (DATA),
                           AGN-DEV-05 (INT), AGN-DEV-06 (SEC),
                           AGN-DEV-07 (UX), AGN-DEV-08 (NFR),
                           AGN-DEV-09 (ADR), AGN-DEV-10 (PEN),
                           AGN-DEV-11 (Cross-validation)
                           6 pendentes criadas e resolvidas (001-006)
```

#### Rastreio de Agentes — MOD-010

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-010-mcp-automacao.md | CONCLUIDO | CHANGELOG v0.2.0 — Nivel 2 confirmado (score 6/6), module_paths documentados, EX-AUTH-001 e EX-SEC-001 referenciados |
| 2 | AGN-DEV-02 | BR | BR-010.md | CONCLUIDO | v0.2.0 — Gherkin adicionado a BR-001..BR-009. Novas regras: BR-010 (8 passos gateway), BR-011 (vinculo unico), BR-012 (privilege escalation), BR-013 (codigo acao imutavel), BR-014 (can_approve false), BR-015 (revocation_reason obrigatorio) |
| 3 | AGN-DEV-03 | FR | FR-010.md | CONCLUIDO | v0.2.0 — Done funcional, dependencias, idempotencia, timeline/notifications e Gherkin. Rastreabilidade cruzada com BR e DATA-003 |
| 4 | AGN-DEV-04 | DATA | DATA-010.md, DATA-003.md | CONCLUIDO | DATA-010 v0.2.0 (FK ON DELETE RESTRICT, 13 indices, CHECK constraints, ERD, migracao), DATA-003 v0.2.0 (EVT-001 a EVT-010 formato individual, outbox, dedupe_key) |
| 5 | AGN-DEV-05 | INT | INT-010.md | CONCLUIDO | v0.2.0 — 5 integracoes detalhadas (MOD-009 sincrona, MOD-007 sincrona, MOD-008 BullMQ+DLQ, MOD-004 in-process, MOD-000 amendment) + 13 contratos de API (INT-006-A a INT-006-K) |
| 6 | AGN-DEV-06 | SEC | SEC-010.md, SEC-002.md | CONCLUIDO | SEC-010 v0.2.0 (14 secoes: authn API key, authz RBAC 6 scopes, blocklist Phase 1/2, privilege escalation, LGPD Art.18, rate limits 6 operacoes, brute force protection), SEC-002 v0.2.0 (3 sub-matrizes, maskable_fields, 5 cenarios Gherkin BDD) |
| 7 | AGN-DEV-07 | UX | UX-010.md | CONCLUIDO | v0.2.0 — UX-MCP-001 (8 passos + 5 estados + 3 state machines + 12 acoes + 8 componentes + 26 copy strings), UX-MCP-002 (7 passos + 8 estados + 2 state machines + 7 acoes + 3 componentes + 16 copy strings), WCAG 2.1 AA, responsive 3 breakpoints, 11 cenarios Gherkin BDD |
| 8 | AGN-DEV-08 | NFR | NFR-010.md | CONCLUIDO | v0.2.0 — 9 NFRs (SLOs P95/P99 por endpoint e politica, disponibilidade 99.9%/99.5%, seguranca API key, escalabilidade, auditoria 5 anos append-only, observabilidade 15 metricas Prometheus + 17 spans OpenTelemetry + 4 dashboards + 7 alertas, DR RPO 1h/RTO 4h, healthcheck com bcrypt selftest) |
| 9 | AGN-DEV-09 | ADR | ADR-001, ADR-002, ADR-003, ADR-004 | CONCLUIDO | 4 ADRs criadas: ADR-001 (Gateway Sincrono 8 Passos), ADR-002 (API Key bcrypt), ADR-003 (Outbox Pattern), ADR-004 (Blocklist Wildcard Pattern Matching) |
| 10 | AGN-DEV-10 | PEN | pen-010-pendente.md | CONCLUIDO | v0.9.0 — 6 pendentes criadas e todas resolvidas |
| 11 | AGN-DEV-11 | Cross-validation | (todos) | CONCLUIDO | 2 erros corrigidos (rate limit SEC vs NFR, tenant_id mcp_action_types), 4 warnings documentados, cobertura completa verificada |

#### Pendentes Resolvidas no Enriquecimento — Detalhamento Completo

> As 6 pendencias abaixo foram identificadas durante o enriquecimento e todas foram decididas e implementadas em 2026-03-19.

---

##### ~~PENDENTE-001 — Phase 2 `*:create`: Mecanismo Exato de Habilitacao Per-Agent~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** SEC
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** BR-003, FR-001, SEC-010, DATA-010
- **tags:** phase2, create, scopes, per-agent
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** B

**Questao:**
Como exatamente o flag `phase2_create_enabled` e habilitado para um agente individual? BR-003 define as condicoes (aprovacao do owner, per-agent, registro em auditoria), mas nao existe endpoint ou fluxo concreto para ativar essa flag. O campo existe na tabela `mcp_agents` (DATA-010), mas nenhum FR descreve o endpoint de habilitacao.

**Impacto:**
Sem definicao concreta, a implementacao da Phase 2 ficara ambigua. O dev pode implementar como campo PATCH simples (sem aprovacao do owner) ou criar fluxo desnecessariamente complexo. Bloqueio parcial: Phase 1 funciona, mas Phase 2 nao pode ser implementada.

**Opcao A — Flag via PATCH com validacao de owner:**
Habilitar `phase2_create_enabled` via `PATCH /admin/mcp-agents/:id` com campo `phase2_create_enabled: true`. Validacao: o admin que faz o PATCH DEVE ser o `owner_user_id` do agente OU ter scope especifico `mcp:agent:phase2-enable`. Evento `mcp.agent.scopes_updated` (EVT-003) emitido.

- Pros: Simples, reutiliza endpoint existente, auditoria via EVT-003
- Contras: Mistura configuracao de seguranca com edicao geral; risco de habilitacao acidental

**Opcao B — Endpoint dedicado com confirmacao:**
Criar `POST /admin/mcp-agents/:id/enable-phase2` com body `{ "reason": "motivo" }`. Scope requerido: `mcp:agent:write` + `mcp:agent:phase2-enable`. Resposta inclui confirmacao explicita. Evento dedicado `mcp.agent.phase2_enabled`.

- Pros: Separacao clara, auditoria dedicada, impossivel habilitar acidentalmente
- Contras: Endpoint adicional, scope adicional a registrar no Foundation

**Resolucao:**

> **Decisao:** Opcao B — Endpoint dedicado `POST /admin/mcp-agents/:id/enable-phase2` com body `{ "reason": "motivo" }`. Scope requerido: `mcp:agent:write` + `mcp:agent:phase2-enable`. Evento dedicado `mcp.agent.phase2_enabled`.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** A habilitacao de Phase 2 e uma decisao de seguranca que merece fluxo separado, similar a separacao de `mcp:agent:revoke` de `mcp:agent:write`. Separacao clara, auditoria dedicada, impossivel habilitar acidentalmente.
> **Artefato de saida:** FR-010 (novo FR-010 — endpoint Phase 2 enable)
> **Implementado em:** FR-010 ssFR-010

---

##### ~~PENDENTE-002 — PREPARAR `can_be_direct`: Default Nao Definido~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** BIZ
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** BR-007, FR-004, DATA-010
- **tags:** action-types, can_be_direct, preparar, seed-data
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A

**Questao:**
O seed data de `mcp_action_types` define `can_be_direct` para PREPARAR como "configuravel" (BR-007, FR-004, DATA-010 seed table). Qual e o valor DEFAULT na migration: `true` ou `false`? E quem/como pode alterar esse valor posteriormente (e seed data imutavel ou editavel via API)?

**Impacto:**
O dev que criar a migration precisa de um valor concreto. Se `true`, acoes do tipo PREPARAR podem ser DIRECT por padrao (mais permissivo). Se `false`, todas precisam de CONTROLLED por padrao (mais restritivo). Impacto medio — a implementacao pode prosseguir com valor padrao conservador (`false`).

**Opcao A — Default `false` (conservador):**
PREPARAR comeca com `can_be_direct=false`. Admin pode solicitar alteracao via amendment/configuracao. Alinha com o principio de menor privilegio.

- Pros: Seguro por padrao, alinhado com compliance
- Contras: Acoes de preparacao de baixo risco exigiriam CONTROLLED desnecessariamente

**Opcao B — Default `true` (pragmatico):**
PREPARAR comeca com `can_be_direct=true`. Justificativa: preparar dados sem persistir (preview) e uma operacao de leitura enriquecida.

- Pros: Pragmatico para casos comuns, menos overhead no gateway
- Contras: Pode permitir DIRECT para preparacoes com side-effects nao previstos

**Resolucao:**

> **Decisao:** Opcao A — Default `false` (conservador). PREPARAR comeca com `can_be_direct=false`. Principio de menor privilegio.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Principio de menor privilegio. Preparacoes com side-effects nao previstos ficam protegidas. Default conservador alinhado com compliance. Ajustavel por tenant quando necessario.
> **Artefato de saida:** DATA-010 (seed atualizado, can_be_direct=false) + BR-010 ssBR-007 (texto alinhado)
> **Implementado em:** DATA-010 v0.4.0, BR-010

---

##### ~~PENDENTE-003 — Despacho DIRECT: Logica Concreta de Execucao Nao Detalhada~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** ARC
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** FR-007, BR-007, BR-009, INT-002, INT-003
- **tags:** direct, dispatch, gateway, execution-logic
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A

**Questao:**
Quando o gateway despacha uma acao DIRECT (passo 8), o que exatamente acontece? FR-007 diz "executa acao, atualiza status->DIRECT_SUCCESS/DIRECT_FAILED, retorna 200", mas nao detalha: (1) O que significa "executar a acao" concretamente? E uma chamada a um service interno? A uma integracao MOD-008? A rotina MOD-007? (2) Como o resultado (`result_payload`) e produzido? (3) Se a acao tem `linked_routine_id` (MOD-007), a rotina e avaliada ANTES do despacho DIRECT?

**Impacto:**
Sem logica concreta, o dev precisara inventar o mecanismo de despacho DIRECT. Pode gerar implementacao divergente. Impacto medio — os fluxos CONTROLLED e EVENT_ONLY estao bem definidos; DIRECT e o unico pendente.

**Opcao A — DIRECT como orchestration port:**
`McpDispatcher` recebe a acao e chama um `ActionExecutor` port (interface). Cada acao DIRECT tem um executor registrado via DI (strategy pattern). O executor produz o `result_payload`. Se `linked_routine_id` presente, avalia rotina MOD-007 ANTES. Se `linked_integration_id` presente, enfileira job MOD-008 APOS execucao (post-processing).

- Pros: Extensivel, testavel, cada acao pode ter logica propria
- Contras: Requer registry de executors; complexidade de setup

**Opcao B — DIRECT como proxy generico:**
DIRECT simplesmente chama um endpoint generico `/api/v1/internal/{target_object_type}/{action_code}` com o payload do agente. O modulo alvo implementa o endpoint. MOD-010 nao sabe o que a acao faz internamente.

- Pros: Desacoplamento total, MOD-010 so roteia
- Contras: Menos controle, dificil garantir timeouts e metricas

**Resolucao:**

> **Decisao:** Opcao A — DIRECT como orchestration port. `McpDispatcher` recebe acao e chama `ActionExecutor` port (interface). Cada acao DIRECT tem executor registrado via DI (strategy pattern). Se `linked_routine_id` presente, avalia rotina MOD-007 ANTES. Se `linked_integration_id` presente, enfileira job MOD-008 APOS. Alinhado com DDD-lite Nivel 2.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Extensivel, testavel, cada acao pode ter logica propria. Alinha com DDD-lite (Nivel 2) e permite controle fino de observabilidade e error handling.
> **Artefato de saida:** FR-010 ssFR-007 (logica DIRECT dispatch detalhada com cenarios Gherkin)
> **Implementado em:** FR-010 v0.4.0

---

##### ~~PENDENTE-004 — Amendment MOD-000-F12: Registro de Scopes no Foundation~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** INT
- **tipo:** DEP-EXT
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** INT-005, SEC-010, MOD-000
- **tags:** amendment, foundation, scopes, rbac, deployment
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** B

**Questao:**
INT-005 documenta que os 6 scopes MCP devem ser registrados no Foundation via Amendment MOD-000-F12. Este amendment ainda nao existe no MOD-000. O deploy do MOD-010 e bloqueado ate que o amendment seja criado e aplicado. Quem cria o amendment? Quando?

**Impacto:**
Sem o amendment, o RBAC do Foundation nao reconhece scopes `mcp:*` e todos os endpoints admin retornam 403 para qualquer usuario. Bloqueio total do MOD-010 em ambiente de runtime.

**Opcao A — Amendment criado pelo MOD-010 (self-service):**
O proprio pipeline de deploy do MOD-010 inclui migration que registra os scopes na tabela de permissoes do Foundation.

- Pros: Autonomia do time, deploy independente
- Contras: Viola principio de ownership (Foundation e dono do catalogo de scopes)

**Opcao B — Amendment criado pelo time Foundation:**
O time do MOD-000 cria o amendment MOD-000-F12 com os 6 scopes. MOD-010 depende desse amendment antes do deploy.

- Pros: Ownership correto, catalogo centralizado
- Contras: Dependencia cross-team, potencial bloqueio por calendario

**Resolucao:**

> **Decisao:** Opcao B — Amendment criado pelo time Foundation via `/create-amendment MOD-000`. Ownership correto do catalogo de scopes.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Ownership correto do catalogo centralizado. Amendment DOC-FND-000-M04 criado imediatamente para nao bloquear calendario. 6 scopes `mcp:*` registrados: `mcp:agent:read`, `mcp:agent:write`, `mcp:agent:revoke`, `mcp:agent:phase2-enable`, `mcp:key:rotate`, `mcp:execution:read`.
> **Artefato de saida:** DOC-FND-000-M04 amendment (6 scopes mcp:*). DOC-FND-000 v1.6.0 -> v1.7.0.
> **Implementado em:** DOC-FND-000 ss2.2, DOC-FND-000-M04

---

##### ~~PENDENTE-005 — Callback Pos-Aprovacao MOD-009 -> MOD-010~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** INT
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** FR-007, BR-008, INT-001, DATA-010
- **tags:** callback, mod-009, controlled, approval, movement
- **dependencias:** []
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A

**Questao:**
Quando uma execucao CONTROLLED e aprovada ou rejeitada no MOD-009, como o MOD-010 e notificado? INT-001 documenta a chamada MOD-010 -> MOD-009 (request), mas nao documenta o callback MOD-009 -> MOD-010 (notification de decisao). O campo `mcp_executions.status` precisa transitar de `CONTROLLED_PENDING` para um estado final (aprovado/rejeitado), mas nenhum endpoint de callback esta definido.

**Impacto:**
Sem callback, execucoes CONTROLLED ficam permanentemente em `CONTROLLED_PENDING`. O monitor UX-MCP-002 mostraria execucoes pendentes eternamente. O agente MCP nao tem como saber o resultado final.

**Opcao A — Callback HTTP do MOD-009:**
MOD-009 chama `POST /api/v1/internal/mcp/executions/{execution_id}/movement-callback` com resultado da decisao. MOD-010 atualiza `mcp_executions.status` para `APPROVED`/`REJECTED` e emite evento.

- Pros: Notificacao imediata, implementacao straightforward
- Contras: Requer endpoint adicional no MOD-010 + configuracao no MOD-009

**Opcao B — Domain event do MOD-009:**
MOD-009 emite `movement.decided` como domain event. MOD-010 consome via subscriber e atualiza `mcp_executions`.

- Pros: Desacoplado, reutiliza infra de eventos
- Contras: Latencia adicional (outbox delay), eventual consistency

**Resolucao:**

> **Decisao:** Opcao A — Callback HTTP: MOD-009 chama `POST /api/v1/internal/mcp/executions/{execution_id}/movement-callback` com resultado da decisao. MOD-010 atualiza `mcp_executions.status` para `APPROVED`/`REJECTED` e emite evento. Domain event coexiste para auditoria.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Callback HTTP garante consistencia imediata — execucoes CONTROLLED nao ficam em CONTROLLED_PENDING indefinidamente. Domain event coexiste para auditoria e desacoplamento, mas o mecanismo primario e o callback sincrono.
> **Artefato de saida:** INT-010 ssINT-007 (contrato callback HTTP) + INT-009 ss4.3.3 + DATA-010 (status CONTROLLED_APPROVED/CONTROLLED_REJECTED adicionados)
> **Implementado em:** INT-010 v0.3.0, INT-009 v0.5.0, DATA-010 v0.3.0

---

##### ~~PENDENTE-006 — Canal de Notificacao para Privilege Escalation (E-mail Config)~~

- **status:** IMPLEMENTADA
- **severidade:** BAIXA
- **dominio:** INFRA
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **rastreia_para:** SEC-010, SEC-002, DATA-003, NFR-007
- **tags:** email, notification, privilege-escalation, infrastructure
- **dependencias:** [MOD-000 NotificationService multi-canal]
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A

**Questao:**
SEC-002 e DATA-003 (EVT-010) definem que tentativas de privilege escalation devem notificar `security_admin` via e-mail. Tambem EVT-004 (revoke) e EVT-005 (key_rotated) notificam owner via e-mail. Qual infra de e-mail sera utilizada? O Foundation (MOD-000) ja tem um servico de envio de e-mail configurado? Existe um servico compartilhado ou cada modulo configura seu proprio provider?

**Impacto:**
Impacto baixo — o modulo funciona sem e-mail (notificacoes in-app sao suficientes para MVP). E-mail e um canal adicional de seguranca. Porem, para compliance de producao, alertas de security devem chegar por canal independente da UI.

**Opcao A — Usar servico de notificacao do Foundation:**
MOD-000 ja tem (ou tera) um `NotificationService` que abstrai canais (in-app, e-mail, webhook). MOD-010 usa o servico existente passando `channels: ["in-app", "email"]`.

- Pros: Reutiliza infra, configuracao centralizada
- Contras: Dependencia do Foundation ter o servico pronto

**Opcao B — Configuracao propria com SMTP direto:**
MOD-010 configura envio de e-mail via variavel de ambiente (`MCP_SMTP_*`). Envia diretamente via nodemailer.

- Pros: Autonomia, sem dependencia
- Contras: Duplicacao de configuracao SMTP, inconsistencia com outros modulos

**Resolucao:**

> **Decisao:** Opcao A — Usar NotificationService do Foundation (MOD-000). MOD-010 chama servico existente com `channels: ["in-app", "email"]` para notificacoes de privilege escalation (EVT-010), revoke (EVT-004) e key_rotated (EVT-005). Configuracao SMTP centralizada no Foundation.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Reutiliza infraestrutura centralizada, evita duplicacao de configuracao SMTP por modulo. Alinhado com principio de ownership — Foundation e dono da infra transversal.
> **Artefato de saida:** Dependencia MOD-000 (NotificationService multi-canal) mapeada. MOD-000 ainda NAO possui NotificationService — deve ser implementado como servico multi-canal (in-app + email + webhook).
> **Implementado em:** PEN-010 v0.9.0 (dependencia mapeada; implementacao efetiva depende de MOD-000 NotificationService)

---

### Fase 3: Validacao — PENDENTE

O `/validate-all` ainda nao foi executado para o MOD-010. Com o enriquecimento completo e todas as pendencias resolvidas, o proximo passo e executar a validacao.

> **Decision tree de validacao:**
>
> ```
> Quero validar tudo de uma vez?
> |-- SIM -> /validate-all (orquestra todos, pula os que nao tem artefato)
> +-- NAO -> Qual pilar?
>     |-- Sintaxe/links/metadados -> /qa
>     |-- Screen manifests       -> /validate-manifest
>     |-- Contratos OpenAPI      -> /validate-openapi
>     |-- Schemas Drizzle        -> /validate-drizzle
>     +-- Endpoints Fastify      -> /validate-endpoint
> ```

```
5    /validate-all docs/04_modules/mod-010-mcp-automacao/
                           Orquestra TODAS as validacoes em sequencia:        A EXECUTAR
                           Internamente executa:
                             1. /qa (lint, links, metadados, EX-*, ssN, ciclos)
                             2. /validate-manifest (screen manifests vs schema v1)
                             3. /validate-openapi (contratos OpenAPI vs endpoints)
                             4. /validate-drizzle (schemas Drizzle vs DATA-010)
                             5. /validate-endpoint (handlers Fastify vs rotas)
                           Pre-condicao: Enriquecimento concluido
                           Pos-condicao: Relatorio consolidado pass/fail
```

> **Alternativa:** Executar validadores individuais:

```
5a   /qa docs/04_modules/mod-010-mcp-automacao/
                           Diagnostico de sintaxe e integridade:              INDIVIDUAL
                           - lint:docs (Pass A-E: EX-*, ssN, IDs, context-map, ciclos)
                           - Consistencia de metadados (estado_item, owner)
                           - Dead links, DoR alignment

5b   /validate-manifest UX-MCP-001, UX-MCP-002
                           Validar manifests contra schema v1:               INDIVIDUAL
                           Verifica: DOC-UX-010, operationId, RBAC,
                           telemetria, permissions

5c   /validate-openapi     Validar contratos OpenAPI:                        INDIVIDUAL
                           13 endpoints, 6 scopes mcp:*
                           Verifica: operationId, request/response schemas,
                           erros RFC 9457, pagination

5d   /validate-drizzle     Validar schemas Drizzle vs DATA-010:              INDIVIDUAL
                           5 tabelas: mcp_agents, mcp_action_types,
                           mcp_actions, mcp_executions, mcp_agent_action_links
                           13 indices, CHECK constraints, FK ON DELETE RESTRICT

5e   /validate-endpoint    Validar handlers Fastify vs rotas:                INDIVIDUAL
                           13 endpoints (10 admin + 1 execute + 2 log)
                           Authn: JWT (admin) + API key (execute)
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | `/qa` | SIM (todos) | SIM | mod-010-mcp-automacao.md, requirements/*, adr/*, CHANGELOG.md |
| 2 | `/validate-manifest` | SIM (2 manifests referenciados) | SIM | UX-MCP-001, UX-MCP-002 |
| 3 | `/validate-openapi` | SIM (13 endpoints) | SIM | 13 endpoints com operationIds |
| 4 | `/validate-drizzle` | SIM (5 tabelas) | SIM | mcp_agents, mcp_action_types, mcp_actions, mcp_executions, mcp_agent_action_links |
| 5 | `/validate-endpoint` | SIM (13 handlers) | SIM | 10 admin + 1 execute + 2 log |

### Fase 4: Promocao — PENDENTE

```
10   /promote-module docs/04_modules/mod-010-mcp-automacao/
                           Selar mod-010 como READY:                         A EXECUTAR (apos fase 3)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (6/6 IMPLEMENTADA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (10/10)
                             [DoR-3] Zero erros de lint? ................ A VERIFICAR (executar /qa)
                             [DoR-4] Screen manifests validados? ........ A VERIFICAR (executar /validate-manifest)
                             [DoR-5] ADRs conforme nivel? ............... SIM (4 >= 2 para N2)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v0.6.0)
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

> **Nota:** MOD-010 depende de 5 modulos upstream (MOD-000, MOD-004, MOD-007, MOD-008, MOD-009). A promocao do MOD-010 pode ocorrer independentemente — o DoR nao exige que dependencias upstream estejam READY (apenas que existam). Porem, o codigo so pode ser gerado quando as dependencias estiverem implementadas. MOD-010 esta na camada topologica 6 (ultima).

### Fase 5: Pos-READY (quando necessario)

```
11   /update-specification docs/04_modules/mod-010-mcp-automacao/requirements/fr/FR-010.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY -> delega para
                           /create-amendment automaticamente

12   /create-amendment FR-010 melhoria "adicionar suporte Phase 2"
                           Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
                           Caso de uso previsto: Phase 2 liberacao de *:create
                           quando MCP testado e validado em producao
```

### Gestao de Pendencias (qualquer momento)

> **Decision tree de pendencias:**
>
> ```
> O que preciso fazer com pendencias?
> |-- Ver situacao atual       -> /manage-pendentes list PEN-010
> |-- Criar nova pendencia     -> /manage-pendentes create PEN-010
> |-- Analisar opcoes          -> /manage-pendentes analyze PEN-010 PENDENTE-XXX
> |-- Registrar decisao        -> /manage-pendentes decide PEN-010 PENDENTE-XXX opcao=X
> |-- Implementar decisao      -> /manage-pendentes implement PEN-010 PENDENTE-XXX
> |-- Cancelar pendencia       -> /manage-pendentes cancel PEN-010 PENDENTE-XXX
> +-- Relatorio consolidado    -> /manage-pendentes report PEN-010
> ```

```
16   /manage-pendentes list PEN-010
                           Estado atual MOD-010:
                             PEN-010: 6 itens total
                               6 IMPLEMENTADA (001-006)
                               0 ABERTA
                             SLA: nenhum vencido
```

#### Painel de Pendencias — Resumo Individual

| PENDENTE | Status | Sev. | Dominio | Decisao | Artefato de saida |
|----------|--------|------|---------|---------|-------------------|
| PENDENTE-001 | IMPLEMENTADA | ALTA | SEC | Opcao B — Endpoint dedicado Phase 2 enable | FR-010 |
| PENDENTE-002 | IMPLEMENTADA | MEDIA | BIZ | Opcao A — Default false (conservador) | DATA-010, BR-010 |
| PENDENTE-003 | IMPLEMENTADA | MEDIA | ARC | Opcao A — DIRECT orchestration port | FR-010 |
| PENDENTE-004 | IMPLEMENTADA | ALTA | INT | Opcao B — Amendment pelo Foundation | DOC-FND-000-M04 |
| PENDENTE-005 | IMPLEMENTADA | MEDIA | INT | Opcao A — Callback HTTP MOD-009->MOD-010 | INT-010, DATA-010 |
| PENDENTE-006 | IMPLEMENTADA | BAIXA | INFRA | Opcao A — NotificationService MOD-000 | PEN-010 (dependencia mapeada) |

> Detalhamento completo: ver [Fase 2](#pendentes-resolvidas-no-enriquecimento--detalhamento-completo).

### Utilitarios (qualquer momento)

```
14   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-010): <descricao>

15   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

17   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-010

```
US-MOD-010 (APPROVED v1.2.0)           <- Fase 0: CONCLUIDA
  |  5/5 features APPROVED
  |  3 politicas: DIRECT, CONTROLLED, EVENT_ONLY
  v
mod-010-mcp-automacao/ (stubs DRAFT)    <- Fase 1: CONCLUIDA (forge-module v0.1.0)
  |
  v
mod-010 enriquecido (DRAFT v0.6.0)     <- Fase 2: CONCLUIDA (11 agentes, 6 PENDENTEs resolvidas)
  |
  |-- * PROXIMO PASSO: /validate-all
  |     |-- /qa .................. A EXECUTAR
  |     |-- /validate-manifest ... A EXECUTAR (2 manifests)
  |     |-- /validate-openapi .... A EXECUTAR (13 endpoints)
  |     |-- /validate-drizzle .... A EXECUTAR (5 tabelas)
  |     +-- /validate-endpoint ... A EXECUTAR (13 handlers)
  |
  v
mod-010 validado (DRAFT)                <- Fase 3: A EXECUTAR
  |
  |-- Gate 0 (DoR): 5/7 atendidos, 2 A VERIFICAR (lint + manifests)
  |
  v
mod-010 selado (READY)                  <- Fase 4: A EXECUTAR (apos fase 3)
  |
  v
mod-010 + amendments/                   <- Fase 5: SOB DEMANDA (0 amendments)

Dependencias upstream: MOD-000, MOD-004, MOD-007, MOD-008, MOD-009
Camada topologica: 6 (ultima — modulo folha).
Nenhum modulo depende de MOD-010.
```

---

## Particularidades do MOD-010

| Aspecto | Detalhe |
|---------|---------|
| Modulo Nivel 2 — DDD-lite + Clean Completo (Score 6/6) | Todos os 6 gatilhos DOC-ESC-001 ativados: workflow com estados, compliance/auditoria, concorrencia/consistencia forte, integracoes externas criticas, multi-tenant, regras cruzadas e reuso alto. Score maximo do sistema. |
| Aggregate Root McpAgent | Fronteira transacional clara: identidade + escopos + status + vinculos com acoes. 3 Domain Services: McpGateway (8 passos), ScopeBlocklistValidator, McpDispatcher. 3 Value Objects: ExecutionPolicy, AgentStatus, ActionType. |
| Blocklist de Escopos Phase 1/2 | Phase 1 (permanente): 6 escopos bloqueados (`*:delete`, `*:approve`, `approval:decide`, `approval:override`, `*:sign`, `*:execute`). Phase 2 (futuro, per-agent): `*:create` liberavel sob condicoes. |
| 3 Politicas de Execucao | DIRECT (execucao imediata via ActionExecutor port), CONTROLLED (passa pelo MOD-009 para aprovacao humana), EVENT_ONLY (apenas emite domain_event, zero escrita). |
| Autenticacao via API Key (nao JWT) | Endpoint `POST /mcp/execute` usa API key bcrypt — nao JWT. API key retornada apenas uma vez (na criacao). Rotacao via endpoint dedicado. Brute force protection com rate limiting. |
| Modulo folha com 5 dependencias upstream | Depende de MOD-000 (Foundation), MOD-004 (Identidade), MOD-007 (Parametrizacao), MOD-008 (Integracoes), MOD-009 (Aprovacao). Nenhum modulo depende de MOD-010. Camada topologica 6 (ultima). |
| 4 ADRs para Nivel 2 | Excede o minimo de 2 ADRs. ADR-001 (Gateway Sincrono), ADR-002 (API Key bcrypt), ADR-003 (Outbox Pattern), ADR-004 (Blocklist Wildcard). Decisoes de arquitetura criticas para seguranca e observabilidade. |
| 6 Pendentes resolvidas no mesmo dia | Todas as 6 pendencias foram identificadas, analisadas, decididas e implementadas em 2026-03-19. Destaque para PENDENTE-001 (Phase 2 enable) e PENDENTE-004 (Amendment Foundation) de severidade ALTA. |
| Observabilidade rica | 15 metricas Prometheus, 17 spans OpenTelemetry, 4 dashboards, 7 alertas. SLOs P95/P99 por endpoint e por politica. Healthcheck com bcrypt selftest. |
| Dependencia futura: NotificationService MOD-000 | PENDENTE-006 mapeou dependencia de NotificationService multi-canal no Foundation (in-app + email + webhook). MOD-000 ainda nao possui o servico — deve ser implementado antes do deploy de producao do MOD-010. |

---

## Checklist Rapido — O que Falta para READY

- [ ] Executar `/validate-all docs/04_modules/mod-010-mcp-automacao/` — /qa + /validate-manifest + /validate-openapi + /validate-drizzle + /validate-endpoint
- [ ] Corrigir eventuais erros encontrados
- [ ] Executar `/promote-module docs/04_modules/mod-010-mcp-automacao/` — verificar Gate 0 (DoR) 7/7

> **Nota:** Todas as 6 pendencias ja estao IMPLEMENTADA. Os 10 artefatos de requisitos estao enriquecidos. As 4 ADRs excedem o minimo para Nivel 2. Nao ha bloqueios (BLK-*) afetando MOD-010. As 5 dependencias upstream (MOD-000, MOD-004, MOD-007, MOD-008, MOD-009) estao DRAFT mas isso nao impede a promocao da especificacao — apenas a geracao de codigo. MOD-010 esta na camada topologica 6 (ultima) e nenhum modulo depende dele.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 1.0.0 | 2026-03-22 | Criacao completa: Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 6 pendentes resolvidas (001-006), rastreio de 11 agentes, mapa de cobertura de 5 validadores, particularidades Nivel 2 DDD-lite Score 6/6 |
