> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.3.0  | 2026-03-17 | AGN-DEV-04  | Re-validado Batch 2 — consistência com BR/FR/INT/SEC confirmada, DATA-002 adicionado |
> | 0.2.0  | 2026-03-17 | AGN-DEV-04  | Enriquecido — catálogo completo per PKG-DEV-001 §5 |
> | 0.1.0  | 2026-03-17 | arquitetura | Baseline Inicial (forge-module) |

# DATA-003 — Catálogo de Domain Events (Gestão de Usuários)

> Habilita linha do tempo (Thread), auditoria, Outbox e automação de notificações.

## Nota Arquitetural — UX-First

MOD-002 é exclusivamente frontend. **Não cria tabelas nem emite domain events diretamente.** Os eventos listados abaixo são **emitidos pelo MOD-000-F05 (backend)** como consequência das ações de UI do MOD-002. Este catálogo documenta:

1. Quais eventos a UX **dispara indiretamente** via chamadas API
2. Quais campos de **payload são relevantes** para a camada de apresentação
3. Quais **regras de mascaramento** a UI deve respeitar ao consumir esses eventos

**Anti-pattern Foundation:** Não duplicar a tabela `domain_events` do MOD-000. Apenas catalogar os event_types relevantes para este módulo.

## Princípios (MUST)

- **Não use "permissão no evento" como fonte de verdade.**
  - Emit = permissão do **comando** que gera o evento
  - View = ACL + tenant da **entity originária**
- `visibility_level`/`sensitivity_level` são **guard-rails** (mascarar/bloquear cedo), não a regra principal.
- **Autorização de Linha (MUST):** toda leitura em `domain_events` MUST filtrar por `tenant_id` e respeitar ACL do registro originário.

---

## Catálogo de Eventos

### `user.created`

- **Descrição:** Usuário criado no sistema (modo convite ou senha temporária)
- **Origem (comando):** `users:create` — FR-002 (POST /api/v1/users)
- **UI Actions (DOC-ARC-003):** `["create"]`
- **Operation IDs:** `users_create`
- **Entity originária:** `user` / `users.id`
- **Emit (perm do comando):** `users:user:write`
- **View (regra):** `canRead(user) && tenantMatch`
- **Notify:** Sim → creator + admin do módulo
- **Integração/Outbox:** Sim (modo convite) → envio de e-mail via Outbox Pattern. `dedupe_key`: `user_id + invite`. TTL: N/A. Retries: 3.
- **Sensibilidade:** `sensitivity_level=0`
- **Campos mascaráveis:** `email` (se exposto no payload — MUST mascarar para `sensitivity_level >= 1`)
- **Payload policy (MUST):** snapshot mínimo: `{ user_id, fullName, roleId, mode, status }`. **Sem e-mail no payload** (LGPD / BR-002).

### `user.deactivated`

- **Descrição:** Usuário desativado via soft-delete pelo administrador
- **Origem (comando):** `users:delete` — FR-001 (DELETE /api/v1/users/:id)
- **UI Actions (DOC-ARC-003):** `["delete"]`
- **Operation IDs:** `users_delete`
- **Entity originária:** `user` / `users.id`
- **Emit (perm do comando):** `users:user:delete`
- **View (regra):** `canRead(user) && tenantMatch`
- **Notify:** Sim → owner do registro + admin
- **Integração/Outbox:** Não
- **Sensibilidade:** `sensitivity_level=1`
- **Campos mascaráveis:** `email`, `fullName` (metadados apenas — sem dump de PII)
- **Payload policy (MUST):** metadados: `{ user_id, deactivated_by, reason_code, timestamp }`. Sem e-mail. Sem nome completo no payload (acessível via entity originária).

### `user.invite_resent`

- **Descrição:** Convite de ativação reenviado pelo administrador
- **Origem (comando):** `users:invite_resend` — FR-003 (POST /api/v1/users/:id/invite/resend)
- **UI Actions (DOC-ARC-003):** `["submit"]`
- **Operation IDs:** `users_invite_resend`
- **Entity originária:** `user` / `users.id`
- **Emit (perm do comando):** `users:user:write`
- **View (regra):** `canRead(user) && tenantMatch`
- **Notify:** Sim → admin (o usuário PENDING recebe e-mail via Outbox, não via notificação in-app)
- **Integração/Outbox:** Sim → reenvio de e-mail via Outbox Pattern. `dedupe_key`: `user_id + invite_resend + timestamp`. TTL: 60s (alinhado com cooldown BR-004). Retries: 3.
- **Sensibilidade:** `sensitivity_level=1`
- **Campos mascaráveis:** `email` (nunca no payload)
- **Payload policy (MUST):** metadados: `{ user_id, resent_by, attempt_number, timestamp }`. **Sem e-mail ou token** no payload.

---

## Tabela Resumo (DOC-DEV-001 §4.2 formato obrigatório)

| event_type | description | origin_command | emit_permission | view_rule | notify | sensitivity_level | maskable_fields |
|---|---|---|---|---|---|---|---|
| `user.created` | Usuário criado (convite ou senha) | `users:create` | `users:user:write` | `canRead(user) && tenantMatch` | creator + admin | 0 | `email` |
| `user.deactivated` | Usuário desativado (soft-delete) | `users:delete` | `users:user:delete` | `canRead(user) && tenantMatch` | owner + admin | 1 | `email`, `fullName` |
| `user.invite_resent` | Convite de ativação reenviado | `users:invite_resend` | `users:user:write` | `canRead(user) && tenantMatch` | admin | 1 | `email` |

---

## Eventos Conhecidos mas Fora do Escopo Atual

| event_type | Motivo | Quando catalogar |
|---|---|---|
| `user.activated` | Usuário ativa conta via link — ação do próprio usuário, fora do backoffice | Quando MOD-000-F05 declarar formalmente |
| `user.blocked` | Admin bloqueia usuário — funcionalidade não coberta pelo MOD-002 atual | Roadmap futuro (MOD-002-F04 ou amendment) |
| `user.updated` | Edição de dados do usuário — fora de escopo (MOD-002 v1) | Roadmap futuro (MOD-002-F04) |

---

## Referências Obrigatórias

- **SEC-002:** `requirements/sec/SEC-002.md` — Matriz Emit/View/Notify alinhada
- **DOC-FND-000 §3:** Modelo canônico de SEC-002
- **DOC-DEV-001 §4.2:** Formato obrigatório DATA-003

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-17
- **rastreia_para:** US-MOD-002, US-MOD-002-F01, US-MOD-002-F02, US-MOD-002-F03, FR-001, FR-002, FR-003, BR-002, BR-004, BR-005, DOC-ARC-003, DOC-FND-000, SEC-002
- **referencias_exemplos:** EX-TRACE-001
- **evidencias:** Catálogo completo per PKG-DEV-001 §5. 3 eventos catalogados. 3 eventos fora de escopo documentados. Payload policies LGPD-compliant (BR-002). Outbox documentado para convite e reenvio. Batch 2: DATA-001 criado, consistência cruzada BR/FR/INT/SEC confirmada.
