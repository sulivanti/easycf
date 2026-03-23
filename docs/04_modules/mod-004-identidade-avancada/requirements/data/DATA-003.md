> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-16 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-17 | AGN-DEV-04  | Enriquecimento DATA-003 (enrich-agent) |
> | 0.3.0  | 2026-03-17 | AGN-DEV-04  | Enriquecimento Batch 2 — rastreia_para expandido, alinhamento com BR-001.10-12 |

# DATA-003 — Catálogo de Domain Events da Identidade Avançada

> Habilita linha do tempo (Thread), auditoria, Outbox e automação de notificações.

## Princípios (MUST)

- **Não use "permissão no evento" como fonte de verdade.**
  - Emit = permissão do comando
  - View = ACL + tenant da entity originária
- `sensitivity_level` é **guard-rail** (mascarar/bloquear cedo), não a regra principal.
- **Fonte Única da Verdade:** Tabela `domain_events` é a única fonte para auditoria/timeline (DOC-ARC-003 §1 Dogma 6).
- **Performance (MUST):** Proibido iterar em memória (N+1). O `canRead` de listagens MUST ser executado por JOIN ou subquery eficiente contra `tenant_users` ou mapeamento de Roles.

---

## Catálogo de Eventos

### user_org_scopes (F01)

- `identity.org_scope_granted`
  - **Descrição:** Vínculo usuário ↔ nó organizacional criado
  - **Origem (comando):** `identity:org_scope:write` (POST /api/v1/admin/users/:id/org-scopes)
  - **UI Actions (DOC-ARC-003):** `["create"]`
  - **Operation IDs:** `admin_user_org_scopes_create`
  - **Entity originária:** `user_org_scopes` / `{scope_id}`
  - **Emit (perm do comando):** `identity:org_scope:write`
  - **View (regra):** `canRead(user_org_scopes) && tenantMatch`
  - **Notify:** admin + owner da área org
  - **Outbox:** `{ enabled: true, dedupe_key: "org_scope_granted:{scope_id}", ttl: null }`
  - **Sensibilidade:** `sensitivity_level=1`
  - **Maskable fields:** `[]` (sem PII direta)
  - **Payload policy:** snapshot mínimo — `{ user_id, org_unit_id, scope_type, status, granted_by }`

- `identity.org_scope_revoked`
  - **Descrição:** Vínculo organizacional removido (soft delete)
  - **Origem (comando):** `identity:org_scope:write` (DELETE /api/v1/admin/users/:id/org-scopes/:scopeId)
  - **UI Actions (DOC-ARC-003):** `["delete"]`
  - **Operation IDs:** `admin_user_org_scopes_delete`
  - **Entity originária:** `user_org_scopes` / `{scope_id}`
  - **Emit (perm do comando):** `identity:org_scope:write`
  - **View (regra):** `canRead(user_org_scopes) && tenantMatch`
  - **Notify:** admin + owner da área org + usuário afetado
  - **Outbox:** `{ enabled: true, dedupe_key: "org_scope_revoked:{scope_id}", ttl: null }`
  - **Sensibilidade:** `sensitivity_level=1`
  - **Maskable fields:** `[]`
  - **Payload policy:** metadados — `{ user_id, org_unit_id, scope_type, revoked_by }`

- `identity.org_scope_expired`
  - **Descrição:** Vínculo organizacional expirado automaticamente pelo background job
  - **Origem (comando):** Background job `expire_identity_grants`
  - **UI Actions (DOC-ARC-003):** N/A (sistema)
  - **Entity originária:** `user_org_scopes` / `{scope_id}`
  - **Emit (perm do comando):** sistema (job)
  - **View (regra):** `canRead(user_org_scopes) && tenantMatch`
  - **Notify:** admin + usuário afetado
  - **Outbox:** `{ enabled: true, dedupe_key: "org_scope_expired:{scope_id}", ttl: null }`
  - **Sensibilidade:** `sensitivity_level=1`
  - **Maskable fields:** `[]`
  - **Payload policy:** metadados — `{ user_id, org_unit_id, scope_type, valid_until }`

### access_shares (F02)

- `identity.share_created`
  - **Descrição:** Compartilhamento controlado criado
  - **Origem (comando):** `identity:share:write` (POST /api/v1/admin/access-shares)
  - **UI Actions (DOC-ARC-003):** `["create"]`
  - **Operation IDs:** `admin_access_shares_create`
  - **Entity originária:** `access_shares` / `{share_id}`
  - **Emit (perm do comando):** `identity:share:write`
  - **View (regra):** `canRead(access_shares) && tenantMatch`
  - **Notify:** grantee + authorized_by + admin
  - **Outbox:** `{ enabled: true, dedupe_key: "share_created:{share_id}", ttl: null }`
  - **Sensibilidade:** `sensitivity_level=1`
  - **Maskable fields:** `["allowed_actions"]` (pode conter nomes de scopes internos)
  - **Payload policy:** snapshot mínimo — `{ grantor_id, grantee_id, resource_type, resource_id, reason, authorized_by, valid_until }`

- `identity.share_revoked`
  - **Descrição:** Compartilhamento revogado manualmente
  - **Origem (comando):** `identity:share:revoke` (DELETE /api/v1/admin/access-shares/:id)
  - **UI Actions (DOC-ARC-003):** `["delete"]`
  - **Operation IDs:** `admin_access_shares_revoke`
  - **Entity originária:** `access_shares` / `{share_id}`
  - **Emit (perm do comando):** `identity:share:revoke`
  - **View (regra):** `canRead(access_shares) && tenantMatch`
  - **Notify:** grantee + grantor + admin
  - **Outbox:** `{ enabled: true, dedupe_key: "share_revoked:{share_id}", ttl: null }`
  - **Sensibilidade:** `sensitivity_level=1`
  - **Maskable fields:** `[]`
  - **Payload policy:** metadados — `{ grantor_id, grantee_id, resource_type, resource_id, revoked_by }`

- `identity.share_expired`
  - **Descrição:** Compartilhamento expirado automaticamente pelo background job
  - **Origem (comando):** Background job `expire_identity_grants`
  - **UI Actions (DOC-ARC-003):** N/A (sistema)
  - **Entity originária:** `access_shares` / `{share_id}`
  - **Emit (perm do comando):** sistema (job)
  - **View (regra):** `canRead(access_shares) && tenantMatch`
  - **Notify:** grantee + grantor
  - **Outbox:** `{ enabled: true, dedupe_key: "share_expired:{share_id}", ttl: null }`
  - **Sensibilidade:** `sensitivity_level=1`
  - **Maskable fields:** `[]`
  - **Payload policy:** metadados — `{ grantor_id, grantee_id, resource_type, resource_id, valid_until }`

### access_delegations (F02)

- `identity.delegation_created`
  - **Descrição:** Delegação temporária criada
  - **Origem (comando):** próprio usuário (POST /api/v1/access-delegations)
  - **UI Actions (DOC-ARC-003):** `["create"]`
  - **Operation IDs:** `access_delegations_create`
  - **Entity originária:** `access_delegations` / `{delegation_id}`
  - **Emit (perm do comando):** próprio usuário (delegator)
  - **View (regra):** `(caller == delegator || caller == delegatee || isAdmin) && tenantMatch`
  - **Notify:** delegatee + admin
  - **Outbox:** `{ enabled: true, dedupe_key: "delegation_created:{delegation_id}", ttl: null }`
  - **Sensibilidade:** `sensitivity_level=1`
  - **Maskable fields:** `["delegated_scopes"]` (contém nomes de scopes internos)
  - **Payload policy:** snapshot mínimo — `{ delegator_id, delegatee_id, valid_until, reason }`. Nota: `delegated_scopes` NÃO incluído no payload do evento — apenas IDs e metadados.

- `identity.delegation_revoked`
  - **Descrição:** Delegação revogada pelo delegator
  - **Origem (comando):** próprio usuário (DELETE /api/v1/access-delegations/:id)
  - **UI Actions (DOC-ARC-003):** `["delete"]`
  - **Operation IDs:** `access_delegations_revoke`
  - **Entity originária:** `access_delegations` / `{delegation_id}`
  - **Emit (perm do comando):** próprio usuário (delegator)
  - **View (regra):** `(caller == delegator || caller == delegatee || isAdmin) && tenantMatch`
  - **Notify:** delegatee
  - **Outbox:** `{ enabled: true, dedupe_key: "delegation_revoked:{delegation_id}", ttl: null }`
  - **Sensibilidade:** `sensitivity_level=1`
  - **Maskable fields:** `[]`
  - **Payload policy:** metadados — `{ delegator_id, delegatee_id }`

- `identity.delegation_expired`
  - **Descrição:** Delegação expirada automaticamente pelo background job
  - **Origem (comando):** Background job `expire_identity_grants`
  - **UI Actions (DOC-ARC-003):** N/A (sistema)
  - **Entity originária:** `access_delegations` / `{delegation_id}`
  - **Emit (perm do comando):** sistema (job)
  - **View (regra):** `(caller == delegator || caller == delegatee || isAdmin) && tenantMatch`
  - **Notify:** delegatee + delegator
  - **Outbox:** `{ enabled: true, dedupe_key: "delegation_expired:{delegation_id}", ttl: null }`
  - **Sensibilidade:** `sensitivity_level=1`
  - **Maskable fields:** `[]`
  - **Payload policy:** metadados — `{ delegator_id, delegatee_id, valid_until }`

---

## Resumo — Tabela Consolidada

| event_type | entity_type | Trigger | emit_perm | view_rule | notify | sensitivity | outbox | maskable_fields |
|---|---|---|---|---|---|:---:|:---:|---|
| `identity.org_scope_granted` | user_org_scopes | POST | `identity:org_scope:write` | canRead + tenant | admin + area owner | 1 | ✅ | — |
| `identity.org_scope_revoked` | user_org_scopes | DELETE | `identity:org_scope:write` | canRead + tenant | admin + area owner + user | 1 | ✅ | — |
| `identity.org_scope_expired` | user_org_scopes | Job | sistema | canRead + tenant | admin + user | 1 | ✅ | — |
| `identity.share_created` | access_shares | POST | `identity:share:write` | canRead + tenant | grantee + auth_by + admin | 1 | ✅ | allowed_actions |
| `identity.share_revoked` | access_shares | DELETE | `identity:share:revoke` | canRead + tenant | grantee + grantor + admin | 1 | ✅ | — |
| `identity.share_expired` | access_shares | Job | sistema | canRead + tenant | grantee + grantor | 1 | ✅ | — |
| `identity.delegation_created` | access_delegations | POST | próprio usuário | delegator/delegatee/admin + tenant | delegatee + admin | 1 | ✅ | delegated_scopes |
| `identity.delegation_revoked` | access_delegations | DELETE | próprio usuário | delegator/delegatee/admin + tenant | delegatee | 1 | ✅ | — |
| `identity.delegation_expired` | access_delegations | Job | sistema | delegator/delegatee/admin + tenant | delegatee + delegator | 1 | ✅ | — |

---

## Campos do Domain Event (DOC-DEV-001 DATA-003)

Todos os eventos seguem o schema padrão da tabela `domain_events`:

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid | SIM | Único por evento |
| `tenant_id` | uuid | SIM | Isolamento multi-tenant |
| `entity_type` | text | SIM | `user_org_scopes`, `access_shares` ou `access_delegations` |
| `entity_id` | uuid | SIM | ID do registro afetado |
| `event_type` | text | SIM | Um dos 9 tipos catalogados acima |
| `payload` | jsonb | SIM | Conforme payload policy de cada evento |
| `created_at` | timestamptz | SIM | Timestamp do evento |
| `created_by` | uuid | SIM | Usuário que disparou (ou `system` para jobs) |
| `correlation_id` | uuid | SIM | X-Correlation-ID propagado |
| `causation_id` | uuid | NÃO | ID do evento causador (para cadeia) |
| `sensitivity_level` | int | SIM | 1 para todos os eventos deste módulo |
| `dedupe_key` | text | SIM | `{event_type_suffix}:{entity_id}` — UNIQUE `(tenant_id, dedupe_key)` |

### Índices padrão exigidos (DOC-DEV-001)

- `(tenant_id, entity_type, entity_id, created_at DESC)`
- `(tenant_id, event_type, created_at DESC)`

- **estado_item:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-23
- **rastreia_para:** US-MOD-004, US-MOD-004-F01, US-MOD-004-F02, FR-001, BR-001, DATA-001, SEC-001, SEC-002, DOC-ARC-003, DOC-FND-000
- **referencias_exemplos:** EX-TRACE-001 (rastreabilidade domain events)
- **evidencias:** N/A
