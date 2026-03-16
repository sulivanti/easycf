> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-15 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-15 | AGN-DEV-04  | Enriquecimento DATA-003 (enrich-agent) |

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
| `user.created` | Novo usuário registrado | `users:create` | user | público (auto-registro) / `users:write` | `canRead(user)` + tenant | admin | 0 | cpf_cnpj, email |
| `user.updated` | Dados do usuário atualizados | `users:write` | user | `users:write` | `canRead(user)` + tenant | — | 0 | cpf_cnpj |
| `user.deleted` | Usuário soft-deleted | `users:delete` | user | `users:delete` | auditor/admin | admin + user | 1 | — |
| `user.profile_updated` | Perfil editado pelo próprio usuário | `auth:me_update` | user | próprio usuário | `canRead(user)` + tenant | — | 0 | — |

### Roles (F06, F12)

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields |
|---|---|---|---|---|---|---|---|---|
| `role.created` | Nova role criada | `roles:write` | role | `roles:write` | `canRead(role)` + tenant | admin | 0 | — |
| `role.updated` | Escopos da role atualizados (substituição total) | `roles:write` | role | `roles:write` | `canRead(role)` + tenant | admin | 0 | — |
| `role.deleted` | Role soft-deleted | `roles:write` | role | `roles:write` | auditor/admin | admin | 1 | — |

### Tenants (F07)

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields |
|---|---|---|---|---|---|---|---|---|
| `tenant.created` | Nova filial criada | `tenants:write` | tenant | `tenants:write` | `canRead(tenant)` | superadmin | 1 | — |
| `tenant.updated` | Dados da filial atualizados | `tenants:write` | tenant | `tenants:write` | `canRead(tenant)` | — | 0 | — |
| `tenant.status_changed` | Status da filial alterado (BLOCKED/ACTIVE) | `tenants:write` | tenant | `tenants:write` | auditor/admin | superadmin + affected users | 1 | — |
| `tenant.deleted` | Filial soft-deleted | `tenants:write` | tenant | `tenants:write` | auditor/admin | superadmin | 1 | — |

### Tenant-Users (F09)

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields |
|---|---|---|---|---|---|---|---|---|
| `tenant_user.added` | Usuário vinculado a filial | `tenants:write` | tenant_user | `tenants:write` | `canRead(tenant)` + admin | user + admin | 0 | — |
| `tenant_user.role_changed` | Role do usuário alterada no tenant | `tenants:write` | tenant_user | `tenants:write` | auditor/admin | user + admin | 1 | — |
| `tenant_user.blocked` | Usuário suspenso no tenant | `tenants:write` | tenant_user | `tenants:write` | auditor/admin | user + admin | 1 | — |
| `tenant_user.removed` | Usuário desvinculado do tenant | `tenants:write` | tenant_user | `tenants:write` | auditor/admin | user + admin | 1 | — |

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
  - **Notify:** (Sim/Não) → regra de destinatários (ref.: SEC-EventMatrix)
  - **Integração/Outbox:** (Sim/Não) → `dedupe_key`? TTL? retries?
  - **Sensibilidade:** `sensitivity_level=0|1|2` e campos mascaráveis (se houver)
  - **Payload policy (MUST):** snapshot mínimo + sem PII desnecessária

---

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-000, US-MOD-000-F01, US-MOD-000-F02, US-MOD-000-F03, US-MOD-000-F04, US-MOD-000-F05, US-MOD-000-F06, US-MOD-000-F07, US-MOD-000-F09, US-MOD-000-F10, US-MOD-000-F16, US-MOD-000-F17, DOC-ARC-003, DOC-FND-000, FR-000, SEC-000, SEC-EventMatrix
- **referencias_exemplos:** DOC-ARC-003 §1-§4 (6 dogmas, UIActionEnvelope, timeline), DOC-FND-000 §1.2 (session events), §3 (SEC-EventMatrix)
- **evidencias:** Extraído de US-MOD-000-F01 §4.5/§4.9, F05 §4.6, F06 §4.6, F07 §4.4/§4.5, F09 §4.4
