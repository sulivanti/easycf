> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-15 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-15 | AGN-DEV-04  | Enriquecimento DATA-003 (enrich-agent) |
> | 0.8.0  | 2026-03-18 | AGN-DEV-06  | Adição evento auth.token_reuse_detected (PENDENTE-002, refresh token rotation). Total: 36 events |
> | 0.7.0  | 2026-03-18 | usuário     | Adição evento auth.sso_linked (ADR-004, FR-016). Total: 35 events |
> | 0.6.0  | 2026-03-18 | usuário     | Adição 3 eventos scope.* (FR-010): scope.created/updated/deleted. Total: 34 events |
> | 0.5.0  | 2026-03-18 | usuário     | Esclarecimento: origin_command é identificador descritivo, não scope (resolve BLQ-3 validate-all) |
> | 0.4.0  | 2026-03-18 | usuário     | Adição evento `user.invite_resent` (FR-006, resolve BLQ-001 do validate-all) |
| 0.3.0  | 2026-03-17 | AGN-DEV-04  | Alinhamento emit_permission com scopes 3-seg DOC-FND-000 v1.2.0 |

# DATA-003 — Catálogo de Domain Events do Foundation

> Habilita linha do tempo (Thread), auditoria, Outbox e automação de notificações.

## Princípios (MUST)

- **Não use "permissão no evento" como fonte de verdade.**
  - Emit = permissão do comando
  - View = ACL + tenant da entity originária
- `sensitivity_level` é **guard-rail** (mascarar/bloquear cedo), não a regra principal.
- **Fonte Única da Verdade:** Tabela `domain_events` é a única fonte para auditoria/timeline (DOC-ARC-003 §1 Dogma 6). Proibido criar tabelas satélites de logs.

## Campos mínimos recomendados

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid | SIM | PK |
| `tenant_id` | uuid | SIM | Isolamento multi-tenant |
| `entity_type` | text | SIM | Tipo da entidade originária |
| `entity_id` | text | SIM | ID da entidade |
| `event_type` | text | SIM | Tipo do evento (padrão `dominio.acao`) |
| `payload` | jsonb | SIM | Snapshot mínimo, sem PII desnecessária |
| `created_at` | timestamptz | SIM | Timestamp UTC |
| `created_by` | uuid/text | NÃO | actorId (NULL se anônimo) |
| `correlation_id` | text | SIM | X-Correlation-ID propagado |
| `causation_id` | text | NÃO | Evento que causou este |
| `sensitivity_level` | smallint | SIM | 0=público, 1=interno, 2=confidencial, 3=restrito |
| `dedupe_key` | text | NÃO | UNIQUE(tenant_id, dedupe_key) para idempotência |

## Índices padrão exigidos

- `(tenant_id, entity_type, entity_id, created_at DESC)` — timeline por entidade
- `(tenant_id, event_type, created_at DESC)` — filtro por tipo de evento

---

## Catálogo de Eventos do Foundation

> **Nota:** A coluna `origin_command` é um **identificador descritivo do comando** que origina o evento (ex: `auth:login`, `users:create`). **Não é um scope de permissão** — a coluna `emit_permission` contém os scopes reais no formato canônico 3-segmentos (`dominio:entidade:acao`, DOC-FND-000 §2.1). O formato 2-segmentos em `origin_command` é intencional para legibilidade.

### Auth (F01, F02, F03, F04, F10, F17)

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields |
|---|---|---|---|---|---|---|---|---|
| `auth.login_success` | Login bem-sucedido | `auth:login` | session | público (ação do próprio usuário) | `canRead(session)` + tenant | admin | 0 | — |
| `auth.login_failed` | Tentativa de login falhada | `auth:login` | session | público (ação do próprio usuário) | auditor/admin only | security + admin | 1 | identifier (sem e-mail) |
| `auth.logout` | Logout do usuário | `auth:logout` | session | público (ação do próprio usuário) | `canRead(session)` + tenant | — | 0 | — |
| `auth.password_changed` | Alteração de senha | `auth:change_password` | user | próprio usuário | auditor/admin | security + user | 1 | — |
| `auth.mfa_enabled` | MFA ativado pelo usuário | `auth:mfa_setup` | user | próprio usuário | auditor/admin | security | 1 | — |
| `auth.mfa_verified` | Código MFA verificado com sucesso | `auth:mfa_verify` | session | próprio usuário | `canRead(session)` + tenant | — | 0 | — |
| `auth.mfa_failed` | Código MFA incorreto | `auth:mfa_verify` | session | próprio usuário | auditor/admin | security | 1 | — |
| `auth.sso_login` | Login via SSO (Google/Microsoft/Apple) | `auth:sso_callback` | session | público | `canRead(session)` + tenant | admin | 0 | — |
| `auth.sso_linked` | Conta SSO vinculada a conta nativa existente (ADR-004) | `auth:sso_link_confirm` | user | próprio usuário | auditor/admin | security + user | 1 | — |
| `auth.token_reuse_detected` | Refresh token reutilizado — família invalidada (PENDENTE-002) | `auth:refresh` | session | sistema (automático) | auditor/admin only | security + admin | 2 | — |
| `auth.forgot_password_requested` | Solicitação de recuperação de senha | `auth:forgot_password` | user | público | auditor/admin | security | 1 | email (mascarar) |
| `auth.password_reset` | Senha redefinida via token | `auth:reset_password` | user | público (token válido) | auditor/admin | security + user | 1 | — |

### Sessions (F01)

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields |
|---|---|---|---|---|---|---|---|---|
| `session.created` | Nova sessão criada após login | `auth:login` | session | público | `canRead(session)` + tenant | — | 0 | device_fp |
| `session.revoked` | Sessão individual revogada (Kill-Switch) | `auth:session_revoke` | session | próprio usuário / admin | `canRead(session)` + tenant | user (se revogada por admin) | 0 | — |
| `session.revoked_all` | Todas as sessões revogadas (Kill-Switch global) | `auth:session_revoke_all` | user | próprio usuário / admin | auditor/admin | user | 1 | — |

### Users (F05, F08)

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields |
|---|---|---|---|---|---|---|---|---|
| `user.created` | Novo usuário registrado | `users:create` | user | público (auto-registro) / `users:user:write` | `canRead(user)` + tenant | admin | 0 | cpf_cnpj, email |
| `user.updated` | Dados do usuário atualizados | `users:write` | user | `users:user:write` | `canRead(user)` + tenant | — | 0 | cpf_cnpj |
| `user.deleted` | Usuário soft-deleted | `users:delete` | user | `users:user:delete` | auditor/admin | admin + user | 1 | — |
| `user.profile_updated` | Perfil editado pelo próprio usuário | `auth:me_update` | user | próprio usuário | `canRead(user)` + tenant | — | 0 | — |
| `user.invite_resent` | Convite de ativação reenviado | `users:invite_resend` | user | `users:user:write` | `canRead(user)` + tenant | admin | 1 | — |

### Roles (F06, F12)

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields |
|---|---|---|---|---|---|---|---|---|
| `role.created` | Nova role criada | `roles:write` | role | `users:role:write` | `canRead(role)` + tenant | admin | 0 | — |
| `role.updated` | Escopos da role atualizados (substituição total) | `roles:write` | role | `users:role:write` | `canRead(role)` + tenant | admin | 0 | — |
| `role.deleted` | Role soft-deleted | `roles:write` | role | `users:role:write` | auditor/admin | admin | 1 | — |

### Tenants (F07)

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields |
|---|---|---|---|---|---|---|---|---|
| `tenant.created` | Nova filial criada | `tenants:write` | tenant | `tenants:branch:write` | `canRead(tenant)` | superadmin | 1 | — |
| `tenant.updated` | Dados da filial atualizados | `tenants:write` | tenant | `tenants:branch:write` | `canRead(tenant)` | — | 0 | — |
| `tenant.status_changed` | Status da filial alterado (BLOCKED/ACTIVE) | `tenants:write` | tenant | `tenants:branch:write` | auditor/admin | superadmin + affected users | 1 | — |
| `tenant.deleted` | Filial soft-deleted | `tenants:write` | tenant | `tenants:branch:write` | auditor/admin | superadmin | 1 | — |

### Tenant-Users (F09)

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields |
|---|---|---|---|---|---|---|---|---|
| `tenant_user.added` | Usuário vinculado a filial | `tenants:write` | tenant_user | `tenants:branch:write` | `canRead(tenant)` + admin | user + admin | 0 | — |
| `tenant_user.role_changed` | Role do usuário alterada no tenant | `tenants:write` | tenant_user | `tenants:branch:write` | auditor/admin | user + admin | 1 | — |
| `tenant_user.blocked` | Usuário suspenso no tenant | `tenants:write` | tenant_user | `tenants:branch:write` | auditor/admin | user + admin | 1 | — |
| `tenant_user.removed` | Usuário desvinculado do tenant | `tenants:write` | tenant_user | `tenants:branch:write` | auditor/admin | user + admin | 1 | — |

### Scopes (F10)

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields |
|---|---|---|---|---|---|---|---|---|
| `scope.created` | Novo scope registrado no catálogo | `scopes:create` | scope | `users:role:write` | auditor/admin | admin | 0 | — |
| `scope.updated` | Scope atualizado no catálogo | `scopes:update` | scope | `users:role:write` | auditor/admin | admin | 0 | — |
| `scope.deleted` | Scope removido do catálogo | `scopes:delete` | scope | `users:role:write` | auditor/admin | admin | 1 | — |

### Storage (F16)

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields |
|---|---|---|---|---|---|---|---|---|
| `storage.upload_completed` | Upload de arquivo concluído | `storage:upload` | storage_file | scope do entity_type | `canRead(entity)` + tenant | — | 0 | — |
| `storage.file_deleted` | Arquivo removido | `storage:delete` | storage_file | scope do entity_type | auditor/admin | — | 0 | — |

---

### Formato padrão para cada evento

- `[EVENT_TYPE]`
  - **Descrição:** (o que significa)
  - **Origem (comando):** `<modulo:acao>` + referência (FR/BR se aplicável)
  - **UI Actions (DOC-ARC-003):** Lista de ações `DOC-UX-010` atreladas na tela
  - **Operation IDs (DOC-ARC-003):** Lista de `operationId` da OpenAPI referenciados
  - **Entity originária:** `<entity_type>` / `<entity_id>`
  - **Emit (perm do comando):** `<permission_id>` *(documentação)*
  - **View (regra):** `canRead(entity) && tenantMatch` *(sempre)* + observações
  - **Notify:** (Sim/Não) → regra de destinatários (ref.: SEC-002)
  - **Integração/Outbox:** (Sim/Não) → `dedupe_key`? TTL? retries?
  - **Sensibilidade:** `sensitivity_level=0|1|2` e campos mascaráveis (se houver)
  - **Payload policy (MUST):** snapshot mínimo + sem PII desnecessária

---

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-18
- **rastreia_para:** US-MOD-000, US-MOD-000-F01, US-MOD-000-F02, US-MOD-000-F03, US-MOD-000-F04, US-MOD-000-F05, US-MOD-000-F06, US-MOD-000-F07, US-MOD-000-F09, US-MOD-000-F10, US-MOD-000-F16, US-MOD-000-F17, DOC-ARC-003, DOC-FND-000, FR-000, SEC-000, SEC-002
- **referencias_exemplos:** DOC-ARC-003 §1-§4 (6 dogmas, UIActionEnvelope, timeline), DOC-FND-000 §1.2 (session events), §2.1-§2.2 (scopes canônicos 3 seg.), §3 (SEC-002)
- **evidencias:** Extraído de US-MOD-000-F01 §4.5/§4.9, F05 §4.6, F06 §4.6, F07 §4.4/§4.5, F09 §4.4. emit_permission alinhado com DOC-FND-000 v1.2.0. auth.sso_linked adicionado (ADR-004). Total: 35 events
