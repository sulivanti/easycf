> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-15 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-15 | AGN-DEV-06  | Enriquecimento SEC-EventMatrix (enrich-agent) |

# SEC-EventMatrix — Matriz de Autorização de Eventos do Foundation

> Modelo canônico conforme DOC-FND-000 §3.

## Princípios (MUST)

- **Não use "permissão no evento" como fonte de verdade.**
  - **Emit** é controlado pela permissão do **comando** que gera o evento.
  - **View** é controlado pela permissão de leitura da **entity originária** (ACL) + `tenant_id`.
- `sensitivity_level` **não substitui** ACL/RBAC: serve apenas como **guard-rail** (mascarar payload, bloquear early-return).
- **Autorização de Linha (MUST):** toda leitura em `domain_events` e `notifications` MUST filtrar por `tenant_id` e respeitar a ACL do registro originário.

## Glossário

- **Emit**: quem pode disparar o evento (derivado do comando).
- **View**: quem pode ler/visualizar eventos (timeline/auditoria).
- **Notify**: quem recebe notificações (inbox/real-time), resolvido por regra.

---

## Matriz Completa de Autorização de Eventos

### Auth Events

| action | event_type | emit_perm | view | notify |
|---|---|---|---|---|
| login | `auth.login_success` | público (próprio usuário) | `canRead(session)` + tenant | admin |
| login_failed | `auth.login_failed` | público (próprio usuário) | auditor/admin only | security + admin |
| logout | `auth.logout` | público (próprio usuário) | `canRead(session)` + tenant | — |
| password_change | `auth.password_changed` | próprio usuário | auditor/admin | security + user |
| mfa_enable | `auth.mfa_enabled` | próprio usuário | auditor/admin | security |
| mfa_verify | `auth.mfa_verified` | próprio usuário | `canRead(session)` + tenant | — |
| mfa_failed | `auth.mfa_failed` | próprio usuário | auditor/admin | security |
| sso_login | `auth.sso_login` | público | `canRead(session)` + tenant | admin |
| forgot_password | `auth.forgot_password_requested` | público | auditor/admin | security |
| reset_password | `auth.password_reset` | público (token válido) | auditor/admin | security + user |

### Session Events

| action | event_type | emit_perm | view | notify |
|---|---|---|---|---|
| session_create | `session.created` | derivado de auth:login | `canRead(session)` + tenant | — |
| session_revoke | `session.revoked` | próprio usuário / admin | `canRead(session)` + tenant | user (se por admin) |
| session_revoke_all | `session.revoked_all` | próprio usuário / admin | auditor/admin | user |

### User Events

| action | event_type | emit_perm | view | notify |
|---|---|---|---|---|
| user_create | `user.created` | público (auto-registro) / `users:write` | `canRead(user)` + tenant | admin |
| user_update | `user.updated` | `users:write` | `canRead(user)` + tenant | — |
| user_delete | `user.deleted` | `users:delete` | auditor/admin | admin + user |
| user_profile_update | `user.profile_updated` | próprio usuário | `canRead(user)` + tenant | — |

### Role Events

| action | event_type | emit_perm | view | notify |
|---|---|---|---|---|
| role_create | `role.created` | `roles:write` | `canRead(role)` + tenant | admin |
| role_update | `role.updated` | `roles:write` | `canRead(role)` + tenant | admin |
| role_delete | `role.deleted` | `roles:write` | auditor/admin | admin |

### Tenant Events

| action | event_type | emit_perm | view | notify |
|---|---|---|---|---|
| tenant_create | `tenant.created` | `tenants:write` | `canRead(tenant)` | superadmin |
| tenant_update | `tenant.updated` | `tenants:write` | `canRead(tenant)` | — |
| tenant_status_change | `tenant.status_changed` | `tenants:write` | auditor/admin | superadmin + affected users |
| tenant_delete | `tenant.deleted` | `tenants:write` | auditor/admin | superadmin |

### Tenant-User Events

| action | event_type | emit_perm | view | notify |
|---|---|---|---|---|
| tenant_user_add | `tenant_user.added` | `tenants:write` | `canRead(tenant)` + admin | user + admin |
| tenant_user_role_change | `tenant_user.role_changed` | `tenants:write` | auditor/admin | user + admin |
| tenant_user_block | `tenant_user.blocked` | `tenants:write` | auditor/admin | user + admin |
| tenant_user_remove | `tenant_user.removed` | `tenants:write` | auditor/admin | user + admin |

### Storage Events

| action | event_type | emit_perm | view | notify |
|---|---|---|---|---|
| upload_complete | `storage.upload_completed` | scope do entity_type | `canRead(entity)` + tenant | — |
| file_delete | `storage.file_deleted` | scope do entity_type | auditor/admin | — |

---

## Regras de Filtragem (MUST)

1. **tenant_id obrigatório:** Toda query em `domain_events` DEVE incluir `WHERE tenant_id = :tenantId`
2. **ACL da entity:** Antes de retornar eventos, validar que o requisitante tem permissão de leitura na entidade originária
3. **sensitivity_level como guard-rail:**
   - `0` (público): visível para qualquer usuário com `audit:read`
   - `1` (interno): visível para admin/auditor com `audit:read`
   - `2` (confidencial): requer `audit:sensitive`
   - `3` (restrito): requer `audit:sensitive` + justificativa registrada

---

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-000, DOC-ARC-003, DOC-FND-000, DATA-003, FR-000, SEC-000
- **referencias_exemplos:** DOC-FND-000 §3 (modelo canônico SEC-EventMatrix), DOC-ARC-003 §1 (6 dogmas)
- **evidencias:** Alinhado com DATA-003 (28 event_types catalogados)
