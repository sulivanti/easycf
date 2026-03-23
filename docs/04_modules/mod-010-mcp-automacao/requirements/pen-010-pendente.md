> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-19 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-19 | AGN-DEV-10  | Enriquecimento PENDENTE (enrich-agent) — 6 pendências identificadas |
> | 0.3.0  | 2026-03-19 | arquitetura | PENDENTE-001 implementada (Opção B — endpoint Phase 2 enable) + PENDENTE-004 implementada (Amendment DOC-FND-000-M04) |
>
| 0.4.0  | 2026-03-19 | arquitetura | PENDENTE-005 decidida (Opção A — callback HTTP MOD-009→MOD-010) |
| 0.5.0  | 2026-03-19 | arquitetura | PENDENTE-005 implementada — INT-010 §INT-007, INT-009 §4.3.3, DATA-010 status expandido |
| 0.6.0  | 2026-03-19 | arquitetura | PENDENTE-003 decidida (Opção A — DIRECT como orchestration port, strategy pattern) |
| 0.7.0  | 2026-03-19 | arquitetura | PENDENTE-003 implementada — FR-010 §FR-007 lógica DIRECT dispatch detalhada |
| 0.8.0  | 2026-03-19 | arquitetura | PENDENTE-002 decidida+implementada — PREPARAR can_be_direct=false (DATA-010 seed + BR-007) |
| 0.9.0  | 2026-03-19 | arquitetura | PENDENTE-006 decidida+implementada — Opcao A (NotificationService MOD-000). Dependencia MOD-000 mapeada. |
| 1.0.0  | 2026-03-22 | arquitetura | PENDENTE-007 → IMPLEMENTADA (scopes MCP alinhados em DOC-FND-000 v1.8.0) |

# PEN-010 — Questões Abertas de MCP e Automação Governada

- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-22
- **rastreia_para:** US-MOD-010, MOD-010, BR-010, FR-010, SEC-010, INT-010

---

## Painel de Controle

| # | ID | Severidade | Status | Dominio | Titulo |
|---|---|---|---|---|---|
| 1 | PENDENTE-001 | 🟠 ALTA | 🟢 IMPLEMENTADA | SEC | Phase 2 `*:create`: mecanismo exato de habilitacao per-agent |
| 2 | PENDENTE-002 | 🟡 MEDIA | ✅ IMPLEMENTADA | BIZ | ~~PREPARAR `can_be_direct`: default nao definido~~ |
| 3 | PENDENTE-003 | 🟡 MEDIA | ✅ IMPLEMENTADA | ARC | ~~Despacho DIRECT: logica concreta de execucao nao detalhada~~ |
| 4 | PENDENTE-004 | 🟠 ALTA | 🟢 IMPLEMENTADA | INT | Amendment MOD-000-F12: registro de scopes no Foundation |
| 5 | PENDENTE-005 | 🟡 MEDIA | ✅ IMPLEMENTADA | INT | ~~Callback pos-aprovacao MOD-009 → MOD-010~~ |
| 6 | PENDENTE-006 | 🟢 BAIXA | ✅ IMPLEMENTADA | INFRA | ~~Canal de notificacao para privilege escalation (e-mail config)~~ |
| 7 | PENDENTE-007 | 🟠 ALTA | ✅ IMPLEMENTADA | UX | ~~Scopes MCP nos manifests divergem do catálogo canônico~~ |

---

## PENDENTE-001 — Phase 2 `*:create`: Mecanismo Exato de Habilitacao Per-Agent

- **status:** ABERTA
- **severidade:** ALTA
- **dominio:** SEC
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **modulo:** MOD-010
- **rastreia_para:** BR-003, FR-001, SEC-010, DATA-010
- **tags:** phase2, create, scopes, per-agent
- **sla_data:** —
- **dependencias:** []

### Questao

Como exatamente o flag `phase2_create_enabled` e habilitado para um agente individual? BR-003 define as condicoes (aprovacao do owner, per-agent, registro em auditoria), mas nao existe endpoint ou fluxo concreto para ativar essa flag. O campo existe na tabela `mcp_agents` (DATA-010), mas nenhum FR descreve o endpoint de habilitacao (ex: `POST /admin/mcp-agents/:id/enable-phase2` ou se e um campo do PATCH).

### Impacto

Sem definicao concreta, a implementacao da Phase 2 ficara ambigua. O dev pode implementar como campo PATCH simples (sem aprovacao do owner) ou criar fluxo desnecessariamente complexo. Bloqueio parcial: Phase 1 funciona, mas Phase 2 nao pode ser implementada.

### Opcoes

**Opcao A — Flag via PATCH com validacao de owner:**
Habilitar `phase2_create_enabled` via `PATCH /admin/mcp-agents/:id` com campo `phase2_create_enabled: true`. Validacao: o admin que faz o PATCH DEVE ser o `owner_user_id` do agente OU ter scope especifico `mcp:agent:phase2-enable`. Evento `mcp.agent.scopes_updated` (EVT-003) emitido com detalhe da habilitacao.

- Pros: Simples, reutiliza endpoint existente, auditoria via EVT-003
- Contras: Mistura configuracao de seguranca com edicao geral; risco de habilitacao acidental

**Opcao B — Endpoint dedicado com confirmacao:**
Criar `POST /admin/mcp-agents/:id/enable-phase2` com body `{ "reason": "motivo" }`. Scope requerido: `mcp:agent:write` + `mcp:agent:phase2-enable`. Resposta inclui confirmacao explicita. Evento dedicado `mcp.agent.phase2_enabled`.

- Pros: Separacao clara, auditoria dedicada, impossivel habilitar acidentalmente
- Contras: Endpoint adicional, scope adicional a registrar no Foundation

### Recomendacao

Opcao B — a habilitacao de Phase 2 e uma decisao de seguranca que merece fluxo separado, similar a separacao de `mcp:agent:revoke` de `mcp:agent:write`.

### Acao Sugerida (se aplicavel)

| Skill | Proposito | Quando executar |
|---|---|---|
| `/update-specification` | Adicionar FR para endpoint Phase 2 enable | Apos decisao |

### Resolucao

> **Decisao:** Opcao B — Endpoint dedicado `POST /admin/mcp-agents/:id/enable-phase2` com body `{ "reason": "motivo" }`. Scope requerido: `mcp:agent:write` + `mcp:agent:phase2-enable`. Evento dedicado `mcp.agent.phase2_enabled`.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** A habilitacao de Phase 2 e uma decisao de seguranca que merece fluxo separado, similar a separacao de `mcp:agent:revoke` de `mcp:agent:write`. Separacao clara, auditoria dedicada, impossivel habilitar acidentalmente.
> **Artefato de saida:** FR-010 (novo FR-010 — endpoint Phase 2 enable)
> **Implementado em:** FR-010 §FR-010

---

## PENDENTE-002 — PREPARAR `can_be_direct`: Default Nao Definido

- **status:** IMPLEMENTADA
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Default false (conservador). Principio de menor privilegio. Preparacoes com side-effects nao previstos ficam protegidas. Ajustavel por tenant.
- **implementado_em:** 2026-03-19
- **severidade:** MEDIA
- **dominio:** BIZ
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **modulo:** MOD-010
- **rastreia_para:** BR-007, FR-004, DATA-010
- **tags:** action-types, can_be_direct, preparar, seed-data
- **sla_data:** —
- **dependencias:** []

### Questao

O seed data de `mcp_action_types` define `can_be_direct` para PREPARAR como "configuravel" (BR-007, FR-004, DATA-010 seed table). Qual e o valor DEFAULT na migration: `true` ou `false`? E quem/como pode alterar esse valor posteriormente (e seed data imutavel ou editavel via API)?

### Impacto

O dev que criar a migration precisa de um valor concreto. Se `true`, acoes do tipo PREPARAR podem ser DIRECT por padrao (mais permissivo). Se `false`, todas precisam de CONTROLLED por padrao (mais restritivo). Impacto medio — a implementacao pode prosseguir com valor padrao conservador (`false`).

### Opcoes

**Opcao A — Default `false` (conservador):**
PREPARAR comeca com `can_be_direct=false`. Admin pode solicitar alteracao via amendment/configuracao. Alinha com o principio de menor privilegio.

- Pros: Seguro por padrao, alinhado com compliance
- Contras: Acoes de preparacao de baixo risco (ex: montar preview de pedido) exigiriam CONTROLLED desnecessariamente

**Opcao B — Default `true` (pragmatico):**
PREPARAR comeca com `can_be_direct=true`. Justificativa: preparar dados sem persistir (preview) e uma operacao de leitura enriquecida.

- Pros: Pragmatico para casos comuns, menos overhead no gateway
- Contras: Pode permitir DIRECT para preparacoes com side-effects nao previstos

### Recomendacao

Opcao A — `false` como default, com possibilidade de ajuste por tenant via amendment. Principio de menor privilegio.

### Resolucao

> **Decisao:** Opcao A — Default `false` (conservador). PREPARAR comeca com `can_be_direct=false`. Admin pode ajustar por tenant via amendment/configuracao. Principio de menor privilegio.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Principio de menor privilegio. Preparacoes com side-effects nao previstos ficam protegidas. Default conservador alinhado com compliance. Ajustavel por tenant quando necessario.
> **Artefato de saida:** DATA-010 (seed atualizado, can_be_direct=false) + BR-010 §BR-007 (texto alinhado)
> **Implementado em:** DATA-010 v0.4.0, BR-010

---

## PENDENTE-003 — Despacho DIRECT: Logica Concreta de Execucao Nao Detalhada

- **status:** IMPLEMENTADA
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** DIRECT como orchestration port com strategy pattern. Alinhado com DDD-lite Nivel 2. Permite controle fino de observabilidade e error handling.
- **implementado_em:** 2026-03-19
- **severidade:** MEDIA
- **dominio:** ARC
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **modulo:** MOD-010
- **rastreia_para:** FR-007, BR-007, BR-009, INT-002, INT-003
- **tags:** direct, dispatch, gateway, execution-logic
- **sla_data:** —
- **dependencias:** []

### Questao

Quando o gateway despacha uma acao DIRECT (passo 8), o que exatamente acontece? FR-007 diz "executa acao, atualiza status→DIRECT_SUCCESS/DIRECT_FAILED, retorna 200", mas nao detalha: (1) O que significa "executar a acao" concretamente? E uma chamada a um service interno? A uma integracao MOD-008? A rotina MOD-007? (2) Como o resultado (`result_payload`) e produzido? (3) Se a acao tem `linked_routine_id` (MOD-007), a rotina e avaliada ANTES do despacho DIRECT? E se tem `linked_integration_id` (MOD-008)?

### Impacto

Sem logica concreta, o dev precisara inventar o mecanismo de despacho DIRECT. Pode gerar implementacao divergente. Impacto medio — os fluxos CONTROLLED e EVENT_ONLY estao bem definidos; DIRECT e o unico pendente.

### Opcoes

**Opcao A — DIRECT como orchestration port:**
`McpDispatcher` recebe a acao e chama um `ActionExecutor` port (interface). Cada acao DIRECT tem um executor registrado via DI (strategy pattern). O executor produz o `result_payload`. Se `linked_routine_id` presente, avalia rotina MOD-007 ANTES. Se `linked_integration_id` presente, enfileira job MOD-008 APOS execucao (post-processing).

- Pros: Extensivel, testavel, cada acao pode ter logica propria
- Contras: Requer registry de executors; complexidade de setup

**Opcao B — DIRECT como proxy generico:**
DIRECT simplesmente chama um endpoint generico `/api/v1/internal/{target_object_type}/{action_code}` com o payload do agente. O modulo alvo implementa o endpoint. MOD-010 nao sabe o que a acao faz internamente.

- Pros: Desacoplamento total, MOD-010 so roteia
- Contras: Menos controle, dificil garantir timeouts e metricas; endpoint generico pode nao existir

### Recomendacao

Opcao A — alinha com DDD-lite (Nivel 2) e permite controle fino de observabilidade e error handling.

### Resolucao

> **Decisao:** Opcao A — DIRECT como orchestration port. `McpDispatcher` recebe acao e chama `ActionExecutor` port (interface). Cada acao DIRECT tem executor registrado via DI (strategy pattern). Se `linked_routine_id` presente, avalia rotina MOD-007 ANTES. Se `linked_integration_id` presente, enfileira job MOD-008 APOS. Alinhado com DDD-lite Nivel 2.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Extensivel, testavel, cada acao pode ter logica propria. Alinha com DDD-lite (Nivel 2) e permite controle fino de observabilidade e error handling. Opcao B (proxy generico) descartada por falta de controle sobre timeouts e metricas.
> **Artefato de saida:** FR-010 §FR-007 (logica DIRECT dispatch detalhada com cenarios Gherkin)
> **Implementado em:** FR-010 v0.4.0

---

## PENDENTE-004 — Amendment MOD-000-F12: Registro de Scopes no Foundation

- **status:** ABERTA
- **severidade:** ALTA
- **dominio:** INT
- **tipo:** DEP-EXT
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **modulo:** MOD-010
- **rastreia_para:** INT-005, SEC-010, MOD-000
- **tags:** amendment, foundation, scopes, rbac, deployment
- **sla_data:** —
- **dependencias:** []

### Questao

INT-005 documenta que os 6 scopes MCP devem ser registrados no Foundation via Amendment MOD-000-F12. Este amendment ainda nao existe no MOD-000. O deploy do MOD-010 e bloqueado ate que o amendment seja criado e aplicado. Quem cria o amendment? Quando?

### Impacto

Sem o amendment, o RBAC do Foundation nao reconhece scopes `mcp:*` e todos os endpoints admin retornam 403 para qualquer usuario. Bloqueio total do MOD-010 em ambiente de runtime.

### Opcoes

**Opcao A — Amendment criado pelo MOD-010 (self-service):**
O proprio pipeline de deploy do MOD-010 inclui migration que registra os scopes na tabela de permissoes do Foundation. O amendment e documentado no MOD-010.

- Pros: Autonomia do time, deploy independente
- Contras: Viola principio de ownership (Foundation e dono do catalogo de scopes)

**Opcao B — Amendment criado pelo time Foundation:**
O time do MOD-000 cria o amendment MOD-000-F12 com os 6 scopes. MOD-010 depende desse amendment antes do deploy.

- Pros: Ownership correto, catalogo centralizado
- Contras: Dependencia cross-team, potencial bloqueio por calendario

### Recomendacao

Opcao B com mitigacao: criar o amendment via `/create-amendment MOD-000` com os 6 scopes documentados, submetendo para revisao do time Foundation. Migration inclusa no PR do amendment.

### Acao Sugerida (se aplicavel)

| Skill | Proposito | Quando executar |
|---|---|---|
| `/create-amendment MOD-000` | Criar Amendment MOD-000-F12 com 6 scopes MCP | Imediatamente (pre-requisito de deploy) |

### Resolucao

> **Decisao:** Opcao B — Amendment criado pelo time Foundation via `/create-amendment MOD-000`. Ownership correto do catalogo de scopes.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Ownership correto do catalogo centralizado. Amendment DOC-FND-000-M04 criado imediatamente para nao bloquear calendario. 6 scopes `mcp:*` registrados: `mcp:agent:read`, `mcp:agent:write`, `mcp:agent:revoke`, `mcp:agent:phase2-enable`, `mcp:key:rotate`, `mcp:execution:read`.
> **Artefato de saida:** DOC-FND-000-M04 amendment (6 scopes mcp:*). DOC-FND-000 v1.6.0 → v1.7.0.
> **Implementado em:** DOC-FND-000 §2.2, DOC-FND-000-M04

---

## PENDENTE-005 — Callback Pos-Aprovacao MOD-009 → MOD-010

- **status:** IMPLEMENTADA
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Callback HTTP para consistencia imediata. Domain event coexiste para auditoria.
- **implementado_em:** 2026-03-19
- **severidade:** MEDIA
- **dominio:** INT
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **modulo:** MOD-010
- **rastreia_para:** FR-007, BR-008, INT-001, DATA-010
- **tags:** callback, mod-009, controlled, approval, movement
- **sla_data:** —
- **dependencias:** []

### Questao

Quando uma execucao CONTROLLED e aprovada ou rejeitada no MOD-009, como o MOD-010 e notificado? INT-001 documenta a chamada MOD-010 → MOD-009 (request), mas nao documenta o callback MOD-009 → MOD-010 (notification de decisao). O campo `mcp_executions.status` precisa transitar de `CONTROLLED_PENDING` para um estado final (aprovado/rejeitado), mas nenhum endpoint de callback esta definido.

### Impacto

Sem callback, execucoes CONTROLLED ficam permanentemente em `CONTROLLED_PENDING`. O monitor UX-MCP-002 mostraria execucoes pendentes eternamente. O agente MCP nao tem como saber o resultado final.

### Opcoes

**Opcao A — Callback HTTP do MOD-009:**
MOD-009 chama `POST /api/v1/internal/mcp/executions/{execution_id}/movement-callback` com resultado da decisao. MOD-010 atualiza `mcp_executions.status` para `APPROVED`/`REJECTED` e emite evento.

- Pros: Notificacao imediata, implementacao straightforward
- Contras: Requer endpoint adicional no MOD-010 + configuracao no MOD-009

**Opcao B — Domain event do MOD-009:**
MOD-009 emite `movement.decided` como domain event. MOD-010 consome via subscriber e atualiza `mcp_executions`.

- Pros: Desacoplado, reutiliza infra de eventos
- Contras: Latencia adicional (outbox delay), eventual consistency

### Recomendacao

Opcao A — callback HTTP para consistencia imediata. O domain event pode coexistir para auditoria.

### Acao Sugerida (se aplicavel)

| Skill | Proposito | Quando executar |
|---|---|---|
| `/update-specification` | Adicionar endpoint de callback e novo contrato INT | Apos decisao |

### Resolucao

> **Decisao:** Opcao A — Callback HTTP: MOD-009 chama `POST /api/v1/internal/mcp/executions/{execution_id}/movement-callback` com resultado da decisao. MOD-010 atualiza `mcp_executions.status` para `APPROVED`/`REJECTED` e emite evento. Domain event coexiste para auditoria.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Callback HTTP garante consistencia imediata — execucoes CONTROLLED nao ficam em CONTROLLED_PENDING indefinidamente. Domain event pode coexistir para auditoria e desacoplamento, mas o mecanismo primario e o callback sincrono.
> **Artefato de saida:** INT-010 §INT-007 (contrato callback HTTP movement-callback) + INT-009 §4.3.3 (callback HTTP para movimentos MCP) + DATA-010 (status CONTROLLED_APPROVED/CONTROLLED_REJECTED adicionados)
> **Implementado em:** INT-010 v0.3.0, INT-009 v0.5.0, DATA-010 v0.3.0

---

## PENDENTE-006 — Canal de Notificacao para Privilege Escalation (E-mail Config)

- **status:** IMPLEMENTADA
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Usar NotificationService do Foundation (MOD-000) com channels: [in-app, email]. Centraliza configuracao, evita duplicacao SMTP.
- **implementado_em:** 2026-03-19
- **severidade:** BAIXA
- **dominio:** INFRA
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **modulo:** MOD-010
- **rastreia_para:** SEC-010, SEC-002, DATA-003, NFR-007
- **tags:** email, notification, privilege-escalation, infrastructure
- **sla_data:** —
- **dependencias:** [MOD-000 NotificationService multi-canal]

### Questao

SEC-002 e DATA-003 (EVT-010) definem que tentativas de privilege escalation devem notificar `security_admin` via e-mail. Tambem EVT-004 (revoke) e EVT-005 (key_rotated) notificam owner via e-mail. Qual infra de e-mail sera utilizada? O Foundation (MOD-000) ja tem um servico de envio de e-mail configurado? Existe um servico compartilhado ou cada modulo configura seu proprio provider?

### Impacto

Impacto baixo — o modulo funciona sem e-mail (notificacoes in-app sao suficientes para MVP). E-mail e um canal adicional de seguranca. Porem, para compliance de producao, alertas de security devem chegar por canal independente da UI.

### Opcoes

**Opcao A — Usar servico de notificacao do Foundation:**
MOD-000 ja tem (ou tera) um `NotificationService` que abstrai canais (in-app, e-mail, webhook). MOD-010 usa o servico existente passando `channels: ["in-app", "email"]`.

- Pros: Reutiliza infra, configuracao centralizada
- Contras: Dependencia do Foundation ter o servico pronto

**Opcao B — Configuracao propria com SMTP direto:**
MOD-010 configura envio de e-mail via variavel de ambiente (`MCP_SMTP_*`). Envia diretamente via nodemailer.

- Pros: Autonomia, sem dependencia
- Contras: Duplicacao de configuracao SMTP, inconsistencia com outros modulos

### Recomendacao

Opcao A — alinhar com Foundation. Se servico de e-mail nao existir ainda, registrar como dependencia de infra.

### Resolucao

> **Decisao:** Opcao A — Usar NotificationService do Foundation (MOD-000). MOD-010 chama servico existente com `channels: ["in-app", "email"]` para notificacoes de privilege escalation (EVT-010), revoke (EVT-004) e key_rotated (EVT-005). Configuracao SMTP centralizada no Foundation.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Reutiliza infraestrutura centralizada, evita duplicacao de configuracao SMTP por modulo. Alinhado com principio de ownership — Foundation e dono da infra transversal. Opcao B (SMTP direto) descartada por duplicacao e inconsistencia.
> **Artefato de saida:** Dependencia MOD-000 (NotificationService multi-canal) mapeada. MOD-000 ainda NAO possui NotificationService — deve ser implementado como servico multi-canal (in-app + email + webhook) para atender MOD-010 e demais modulos.
> **Implementado em:** PEN-010 v0.9.0 (dependencia mapeada; implementacao efetiva depende de MOD-000 NotificationService)

---

## ~~PENDENTE-007 — Scopes MCP nos manifests divergem do catálogo canônico~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** UX
- **tipo:** CONTRADIÇÃO
- **origem:** VALIDATE
- **criado_em:** 2026-03-22
- **criado_por:** validate-all
- **decidido_em:** 2026-03-22
- **decidido_por:** arquitetura
- **opcao_escolhida:** A
- **implementado_em:** 2026-03-22
- **modulo:** MOD-010
- **rastreia_para:** DOC-FND-000, ux-mcp-001, ux-mcp-002, PENDENTE-004
- **tags:** scopes, rbac, divergence, gate-3
- **sla_data:** —
- **dependencias:** [PENDENTE-004]

### Questao

O Amendment DOC-FND-000-M04 (PENDENTE-004) registrou 6 scopes MCP no catálogo canônico: `mcp:agent:read/write/revoke`, `mcp:agent:phase2-enable`, `mcp:key:rotate`, `mcp:execution:read`. Porém, os manifests UX-MCP-001 e UX-MCP-002 usam scopes **diferentes** dos registrados:

| No Catálogo | No Manifest | Usado em |
|---|---|---|
| `mcp:key:rotate` | (não usado) | — |
| `mcp:execution:read` | (não usado) | — |
| (não registrado) | `mcp:action:read` | ux-mcp-001 |
| (não registrado) | `mcp:action:write` | ux-mcp-001 |
| (não registrado) | `mcp:log:read` | ux-mcp-002 |

O módulo spec (seção 7) define `mcp:action:read/write` e `mcp:log:read`, divergindo do que foi registrado no amendment.

### Impacto

Gate 3 falha para ambos manifests MOD-010. O catálogo canônico e o módulo spec estão desalinhados.

### Resolução

> **Decisão:** Opção A — Alinhar DOC-FND-000 §2.2 com módulo spec
> **Decidido por:** arquitetura em 2026-03-22
> **Justificativa:** Catálogo atualizado: `mcp:key:rotate` e `mcp:execution:read` removidos; `mcp:action:read`, `mcp:action:write`, `mcp:log:read` adicionados. Scopes agora alinham com módulo spec seção 7 e manifests. Gate 3 verde.
> **Artefato de saída:** DOC-FND-000 §2.2 (scopes MCP linhas 105-111)
> **Implementado em:** DOC-FND-000 v1.8.0
