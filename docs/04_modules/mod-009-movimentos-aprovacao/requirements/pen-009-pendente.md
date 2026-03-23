> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-19 | arquitetura | Baseline Inicial (forge-module) |
> | 0.5.0  | 2026-03-19 | AGN-DEV-10  | Enriquecimento Batch 4 — pendências identificadas a partir de cross-reading de todos os artefatos do módulo |
> | 0.6.0  | 2026-03-19 | arquitetura | PEN-009-001 decidida (Opção 1 — domain event outbox) + PEN-009-002 implementada (Amendment DOC-FND-000-M03) |
>
| 0.7.0  | 2026-03-19 | arquitetura | PEN-009-003 implementada (dry_run body field), PEN-009-004 implementada (in-app MVP), PEN-009-006 implementada (endpoint retry) |
> | 0.8.0  | 2026-03-19 | arquitetura | PEN-009-007 implementada (polling 60s MVP, SSE roadmap pós-MVP) |
> | 0.9.0  | 2026-03-19 | arquitetura | PEN-009-005 implementada (sem particionamento MVP, apenas índices; threshold 5M para range mensal PostgreSQL 14+) |

# PEN-009 — Questões Abertas de Movimentos sob Aprovação

---

## Painel de Controle

| # | Severidade | Status | Domínio | Tipo | Título |
|---|---|---|---|---|---|
| PEN-009-001 | alta | implementada | INT-009 | decisão_técnica | Callback de execução pós-aprovação: domain event vs HTTP webhook |
| PEN-009-002 | alta | implementada | SEC-009 | amendment | Registro dos 7 scopes `approval:*` no catálogo MOD-000 (Amendment MOD-000-F12) |
| PEN-009-003 | média | implementada | UX-009 / INT-009 | funcionalidade | Dry-run mode para simulação do motor (contrato API `dry_run=true`) |
| PEN-009-004 | média | implementada | INT-009 / NFR-009 | decisão_técnica | Canal de notificação para aprovadores (email, in-app, ambos) |
| PEN-009-005 | baixa | implementada | DATA-009 | decisão_técnica | Estratégia de particionamento de `movement_history` para volumes altos |
| PEN-009-006 | média | implementada | FR-009 / INT-009 | funcionalidade | Endpoint de reprocessamento de movimento FAILED |
| PEN-009-007 | baixa | implementada | UX-009 | funcionalidade | Notificação real-time (WebSocket/SSE) vs polling para atualização do inbox |

Total: 7 | Abertas: 0 | Decididas: 0 | Implementadas: 7 | Bloqueantes: 0

---

## PEN-009-001 — Callback de Execução Pós-Aprovação

- **status:** implementada
- **severidade:** alta (bloqueante para implementação de FR-005 e INT-009 §4.3)
- **domínio:** INT-009, FR-009
- **tipo:** decisão_técnica
- **impacto:** Quando o último nível da cadeia aprova um movimento, MOD-009 precisa notificar o módulo chamador para executar a operação original usando `operation_payload`. O mecanismo de callback não está definido.
- **opções:**
  1. **Domain event com outbox (assíncrono):** MOD-009 emite `movement.approved` com `is_final_level: true`. Módulo chamador consome o evento e executa. Garantia at-least-once via outbox. Desvantagem: eventual consistency — pode haver delay entre aprovação e execução.
  2. **HTTP webhook (síncrono):** MOD-009 chama endpoint do módulo chamador via HTTP POST com `operation_payload`. Vantagem: execução imediata. Desvantagem: acoplamento runtime, retry management mais complexo.
  3. **Hybrid:** Domain event como trigger + HTTP callback como fallback. Complexidade operacional elevada.
- **recomendação:** Domain event com outbox (opção 1) — alinhado com ADR-003 e padrão já estabelecido para eventos 4-13. INT-009 §4.3 já sugere esta opção.
- **referências:** INT-009 §4.3 (`missing_info`), ADR-003, DATA-003 (evento 7), NFR-009 §5.3
- **decisão:** Opção 1 — Domain event com outbox (assíncrono)
- **decidido_por:** Marcos Sulivan em 2026-03-19
- **justificativa:** Alinhado com ADR-003 e padrão estabelecido para eventos 4-13. MOD-009 emite `movement.approved` com `is_final_level: true`. Módulo chamador consome e executa. Garantia at-least-once via outbox.
- **artefato_de_saida:** INT-009 §4.3 — contrato completo do callback event `movement.approved`

---

## PEN-009-002 — Amendment MOD-000-F12 para Registro de Scopes

- **status:** implementada
- **severidade:** alta (bloqueante para deployment — scopes não existem no catálogo MOD-000 até amendment ser aplicado)
- **domínio:** SEC-009, MOD-000
- **tipo:** amendment
- **impacto:** O MOD-009 define 7 scopes RBAC (`approval:rule:read`, `approval:rule:write`, `approval:engine:evaluate`, `approval:movement:read`, `approval:movement:write`, `approval:decide`, `approval:override`). Esses scopes devem ser registrados no catálogo de scopes do DOC-FND-000 §2.2 via amendment MOD-000-F12. Sem esse amendment, nenhum endpoint do MOD-009 é acessível.
- **opções:**
  1. **Amendment formal MOD-000-F12:** Criar documento de amendment seguindo padrão do framework, com os 7 scopes + descrições + categorização.
  2. **Registro via migration SQL:** Inserir scopes diretamente na tabela `scopes` do MOD-000. Sem rastreabilidade documental.
- **recomendação:** Amendment formal (opção 1) — garante rastreabilidade e segue o padrão do framework.
- **referências:** mod.md §8, SEC-009 §2, INT-009 §8
- **decisão:** Opção 1 — Amendment formal DOC-FND-000-M03
- **decidido_por:** Marcos Sulivan em 2026-03-19
- **justificativa:** Garante rastreabilidade e segue o padrão do framework. 7 scopes approval:* registrados no catálogo canônico DOC-FND-000 §2.2 com descrições e categorização conforme SEC-009 §2.
- **artefato_de_saida:** DOC-FND-000-M03 amendment (7 scopes approval:*). DOC-FND-000 v1.5.0 → v1.6.0.

---

## PEN-009-003 — Dry-Run Mode para Simulação do Motor

- **status:** implementada
- **severidade:** média
- **domínio:** UX-009, INT-009
- **tipo:** funcionalidade
- **impacto:** A tela UX-APROV-002 (Configurador de Regras) possui botão "Simular motor" (`act-config-simulate`) que chama `POST /movement-engine/evaluate` com `dry_run=true`. O contrato API para o modo dry-run não está especificado em INT-009. O endpoint precisa aceitar query param ou body field `dry_run=true` e retornar o resultado da avaliação sem criar registros (`controlled_movements`, `approval_instances`, `movement_history`).
- **opções:**
  1. **Query param `?dry_run=true`:** Simples, mas mistura concerns no mesmo endpoint.
  2. **Endpoint separado `POST /movement-engine/simulate`:** Semântica clara, mas duplica lógica do motor.
  3. **Body field `dry_run: true`:** Integrado ao contrato existente, o motor verifica o flag antes de persistir.
- **recomendação:** Body field `dry_run: true` (opção 3) — menor impacto no contrato existente; motor avalia normalmente e skip INSERT se `dry_run=true`.
- **referências:** UX-009 (act-config-simulate), INT-009 §2.2.1, FR-009 (FR-003)
- **decisão:** Opção 3 — Body field `dry_run: true` no POST /movement-engine/evaluate
- **decidido_por:** Marcos Sulivan em 2026-03-19
- **justificativa:** Motor avalia normalmente e skip INSERT se dry_run=true. Sem criar registros em controlled_movements, approval_instances, movement_history. Sem emitir domain events. Menor impacto no contrato existente.
- **artefato_de_saida:** INT-009 §2.2.1 — campo dry_run adicionado ao evaluate

---

## PEN-009-004 — Canal de Notificação para Aprovadores

- **status:** implementada
- **severidade:** média
- **domínio:** INT-009, NFR-009
- **tipo:** decisão_técnica
- **impacto:** DATA-003 define `notify.enabled=true` para eventos 4-13 com `notify.recipients_rule` detalhado, mas não especifica o canal de entrega (email, notificação in-app, push notification, ou combinação). O mecanismo de entrega afeta implementação do outbox consumer e dependências em serviços externos.
- **opções:**
  1. **In-app apenas:** Notificação no inbox do aprovador (badge + lista). Sem dependência externa. Desvantagem: aprovador precisa estar logado para ver.
  2. **Email + in-app:** Notificação dupla. Garante visibilidade mesmo offline. Desvantagem: dependência de serviço de email; risco de spam para aprovadores com alta carga.
  3. **Configurável por tenant/usuário:** Cada usuário ou tenant define seus canais preferidos. Máxima flexibilidade, maior complexidade.
- **recomendação:** In-app como MVP (opção 1); email como enhancement configurável por tenant (opção 3 no roadmap).
- **referências:** DATA-003 (notify.recipients_rule), NFR-009 §5.1, INT-009 §5
- **decisão:** Opção 1 — In-app como MVP
- **decidido_por:** Marcos Sulivan em 2026-03-19
- **justificativa:** Notificação no inbox do aprovador (badge + lista) via SidebarBadge. Sem dependência externa. Outbox consumer grava notificação na tabela de notificações in-app. Email como canal adicional configurável por tenant (roadmap, não MVP).
- **artefato_de_saida:** INT-009 §5 — canal notificação in-app documentado

---

## PEN-009-005 — Estratégia de Particionamento de `movement_history`

- **status:** implementada
- **severidade:** baixa
- **domínio:** DATA-009
- **tipo:** decisão_técnica
- **impacto:** NFR-009 §10 identifica que volumes acima de 10M registros por tenant em `movement_history` exigem particionamento por `created_at`. A decisão sobre o tipo de particionamento (range por mês/trimestre, hash, list) e a implementação (nativa PostgreSQL vs. application-level) está pendente.
- **opções:**
  1. **Range partitioning por mês** (nativo PostgreSQL 14+): Cada partição = 1 mês. Prune automático em queries com filtro de data.
  2. **Range partitioning por trimestre:** Menos partições, mais dados por partição.
  3. **Sem particionamento, apenas índices:** Suficiente até 10M registros.
- **recomendação:** Sem particionamento no MVP (opção 3); range por mês quando volume atingir threshold (opção 1).
- **referências:** NFR-009 §10, DATA-009 (tabela 6)
- **decisão:** Opção 3 — Sem particionamento no MVP, apenas índices. Suficiente até 10M registros. Range por mês (nativo PostgreSQL 14+) quando volume atingir 5M (alerta preventivo).
- **decidido_por:** Marcos Sulivan em 2026-03-19
- **justificativa:** Índices existentes em DATA-009 são suficientes para o MVP. Monitorar via métrica count de movement_history. Threshold de 5M registros para acionar migração para range partitioning por mês (PostgreSQL 14+ nativo). Evita complexidade prematura sem sacrificar performance futura.
- **artefato_de_saida:** Decisão registrada; threshold 5M para acionar migração para range partitioning mensal. Monitoramento via métrica count de movement_history.

---

## PEN-009-006 — Endpoint de Reprocessamento de Movimento FAILED

- **status:** implementada
- **severidade:** média
- **domínio:** FR-009, INT-009
- **tipo:** funcionalidade
- **impacto:** DATA-009 prevê campo `retry_of` (FK) em `movement_executions` para cadeia de retentativas. INT-009 §5.3 menciona reprocessamento possível. No entanto, não existe endpoint definido em INT-009 para disparar reprocessamento manual de um movimento com status FAILED. O admin precisa de uma forma de retrigger a execução.
- **opções:**
  1. **`POST /api/v1/movements/:id/retry`:** Endpoint dedicado com scope `approval:movement:write` ou `approval:override`.
  2. **Retry automático via outbox reprocessing:** Re-emitir `movement.approved` para trigger automático. Menos controle para o admin.
  3. **Admin manual via dashboard:** Sem endpoint dedicado; admin re-executa via scripts.
- **recomendação:** Endpoint dedicado (opção 1) com scope `approval:override` — operação excepcional similar ao override, requer auditoria.
- **referências:** DATA-009 (movement_executions.retry_of), INT-009 §5.3, NFR-009 §5.3
- **decisão:** Opção 1 — Endpoint dedicado POST /api/v1/movements/:id/retry
- **decidido_por:** Marcos Sulivan em 2026-03-19
- **justificativa:** Scope: approval:override. Cria novo registro em movement_executions com retry_of=original_id. Re-emite movement.approved para trigger execução. Operação excepcional com auditoria completa. Evento: movement.retried.
- **artefato_de_saida:** INT-009 — endpoint retry adicionado

---

## PEN-009-007 — Notificação Real-Time para Inbox

- **status:** implementada
- **severidade:** baixa
- **domínio:** UX-009
- **tipo:** funcionalidade
- **impacto:** UX-009 define `SidebarBadge` que atualiza a cada 60s via polling. Para melhor UX, notificação real-time (WebSocket ou SSE) permitiria atualização imediata do badge e da lista quando novos movimentos chegam ao inbox do aprovador.
- **opções:**
  1. **Polling a cada 60s (atual):** Simples, funcional, sem infraestrutura adicional.
  2. **WebSocket:** Atualização imediata. Requer infraestrutura de WebSocket (connection management, scaling).
  3. **SSE (Server-Sent Events):** Mais simples que WebSocket para push unidirecional. Compatível com load balancers HTTP/2.
- **recomendação:** Polling como MVP (opção 1); SSE como enhancement (opção 3) após validação de UX.
- **referências:** UX-009 (SidebarBadge, act-aprov-refresh)
- **decisão:** Opção 1 — Polling a cada 60s como MVP. SSE (Server-Sent Events) como enhancement pós-MVP após validação de UX.
- **decidido_por:** arquitetura em 2026-03-19
- **justificativa:** Polling a cada 60s é simples, funcional e não requer infraestrutura adicional. SSE (opção 3) é mais adequado que WebSocket para push unidirecional e compatível com load balancers HTTP/2, ficando no roadmap pós-MVP após validação de UX com usuários reais.
- **artefato_de_saida:** Decisão registrada. SSE no roadmap pós-MVP como enhancement de UX-009 (SidebarBadge).

---

- **estado_item:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-23
- **rastreia_para:** US-MOD-009, FR-009, INT-009, SEC-009, DATA-009, NFR-009, UX-009, DATA-003
- **referencias_exemplos:** N/A
- **evidencias:** N/A
