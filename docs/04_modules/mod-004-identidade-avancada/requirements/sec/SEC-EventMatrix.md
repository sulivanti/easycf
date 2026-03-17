> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-16 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-17 | AGN-DEV-06  | Enriquecimento SEC-EventMatrix (enrich-agent) |

# SEC-EventMatrix — Matriz de Autorização de Eventos da Identidade Avançada

> Modelo canônico conforme DOC-FND-000 §3.

## Princípios (MUST)

- **Não use "permissão no evento" como fonte de verdade.**
  - **Emit** é controlado pela permissão do **comando** que gera o evento.
  - **View** é controlado pela permissão de leitura da **entity originária** (ACL) + `tenant_id`.
- `sensitivity_level` **não substitui** ACL/RBAC: serve apenas como **guard-rail** (mascarar/bloquear early-return).
- **Autorização de Linha (MUST):** Toda leitura em `domain_events` e `notifications` MUST filtrar por `tenant_id` e respeitar a ACL do registro originário.
- **Performance (MUST):** Proibido iterar em memória (N+1). O `canRead` de listagens MUST ser executado por JOIN ou subquery eficiente contra `tenant_users` ou mapeamento de Roles.

## Glossário

- **Emit**: quem pode disparar o evento (derivado do comando).
- **View**: quem pode ler/visualizar eventos (timeline/auditoria).
- **Notify**: quem recebe notificações (inbox/real-time), resolvido por regra (watchers + papéis + hierarquia).
- **Owner/Requester/Approver**: papéis típicos definidos por domínio; watchers podem complementar.

---

## Matriz de Autorização — MOD-004

### user_org_scopes (F01)

| action | event_type | emit_perm | view | notify | sensitivity | maskable_fields | payload_policy |
|---|---|---|---|---|:---:|---|---|
| Criar vínculo org | `identity.org_scope_granted` | `identity:org_scope:write` | `canRead(user_org_scopes)` + tenant | admin + owner da área | 1 | — | snapshot: user_id, org_unit_id, scope_type, status, granted_by |
| Remover vínculo org | `identity.org_scope_revoked` | `identity:org_scope:write` | `canRead(user_org_scopes)` + tenant | admin + owner da área + usuário afetado | 1 | — | metadados: user_id, org_unit_id, scope_type, revoked_by |
| Expiração auto vínculo | `identity.org_scope_expired` | sistema (job) | `canRead(user_org_scopes)` + tenant | admin + usuário afetado | 1 | — | metadados: user_id, org_unit_id, scope_type, valid_until |

### access_shares (F02)

| action | event_type | emit_perm | view | notify | sensitivity | maskable_fields | payload_policy |
|---|---|---|---|---|:---:|---|---|
| Criar compartilhamento | `identity.share_created` | `identity:share:write` | `canRead(access_shares)` + tenant | grantee + authorized_by + admin | 1 | `allowed_actions` | snapshot: grantor_id, grantee_id, resource_type, resource_id, reason, authorized_by, valid_until |
| Revogar compartilhamento | `identity.share_revoked` | `identity:share:revoke` | `canRead(access_shares)` + tenant | grantee + grantor + admin | 1 | — | metadados: grantor_id, grantee_id, resource_type, resource_id, revoked_by |
| Expiração auto share | `identity.share_expired` | sistema (job) | `canRead(access_shares)` + tenant | grantee + grantor | 1 | — | metadados: grantor_id, grantee_id, resource_type, resource_id, valid_until |

### access_delegations (F02)

| action | event_type | emit_perm | view | notify | sensitivity | maskable_fields | payload_policy |
|---|---|---|---|---|:---:|---|---|
| Criar delegação | `identity.delegation_created` | próprio usuário (delegator) | delegator + delegatee + admin + tenant | delegatee + admin | 1 | `delegated_scopes` | snapshot: delegator_id, delegatee_id, valid_until, reason. NOTA: `delegated_scopes` NÃO no payload do evento |
| Revogar delegação | `identity.delegation_revoked` | próprio usuário (delegator) | delegator + delegatee + admin + tenant | delegatee | 1 | — | metadados: delegator_id, delegatee_id |
| Expiração auto delegação | `identity.delegation_expired` | sistema (job) | delegator + delegatee + admin + tenant | delegatee + delegator | 1 | — | metadados: delegator_id, delegatee_id, valid_until |

---

## Regras de Filtragem (MUST)

### Regras gerais

1. **Toda** consulta a `domain_events` do MOD-004 MUST incluir `WHERE tenant_id = :current_tenant` (RLS)
2. Eventos de **expiração** (sistema/job) não exigem scope de emit — são automáticos

### Regras por entity_type

| entity_type | View rule | Detalhe |
|---|---|---|
| `user_org_scopes` | `canRead(user_org_scopes) && tenantMatch` | Admin com `identity:org_scope:read` ou o próprio usuário |
| `access_shares` | `canRead(access_shares) && tenantMatch` | Admin com `identity:share:read`, grantor, grantee ou authorized_by |
| `access_delegations` | `(caller == delegator \|\| caller == delegatee \|\| isAdmin) && tenantMatch` | Sem scope especial — apenas participantes diretos |

### Regras de mascaramento em notificações

| Campo | Regra | Justificativa |
|---|---|---|
| `allowed_actions` (shares) | NÃO incluir no payload de notificação push/inbox | Contém nomes de scopes internos — sensitivity_level=1 |
| `delegated_scopes` (delegations) | NÃO incluir no payload do domain event nem notificação | Contém nomes de scopes — sensitivity_level=1 |
| `reason` | Incluir no domain event; truncar a 200 chars em notificação | Pode conter contexto sensível |

### Regras de retenção de eventos

| Tabela | Retenção | Purging |
|---|---|---|
| `domain_events` (MOD-004) | 5 anos | Cron purging após período |
| `notifications` (MOD-004) | 90 dias após `read_at` | Cron purging |

---

## Critérios de aceite (Gherkin) — SEC-EventMatrix

```gherkin
Funcionalidade: Autorização de Eventos MOD-004

  Cenário: Domain events filtrados por tenant
    Dado que User-A pertence ao Tenant-1
    E existem domain_events de user_org_scopes no Tenant-1 e Tenant-2
    Quando User-A consulta timeline de eventos
    Então retorna apenas eventos com tenant_id = Tenant-1

  Cenário: Delegações visíveis apenas para participantes
    Dado que User-C não é delegator nem delegatee de uma delegação
    Quando User-C consulta domain_events de access_delegations
    Então NÃO vê eventos dessa delegação

  Cenário: Notificação de share não contém allowed_actions
    Dado que um access_share foi criado com allowed_actions: ["finance:report:read"]
    Quando a notificação é gerada para o grantee
    Então o payload da notificação NÃO contém o campo allowed_actions

  Cenário: Notificação de delegação não contém delegated_scopes
    Dado que uma delegação foi criada com delegated_scopes: ["finance:invoice:read"]
    Quando a notificação é gerada para o delegatee
    Então o payload NÃO contém delegated_scopes
```

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-17
- **rastreia_para:** US-MOD-004, US-MOD-004-F01, US-MOD-004-F02, DATA-003, SEC-001, BR-001, DOC-ARC-003, DOC-FND-000
- **referencias_exemplos:** EX-AUTH-001 (RBAC), EX-PII-001 (mascaramento)
- **evidencias:** N/A
