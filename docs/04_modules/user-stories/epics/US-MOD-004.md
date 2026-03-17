# US-MOD-004 — Identidade Avançada (Épico)

**Status Ágil:** `READY`
**Versão:** 1.1.0
**Data:** 2026-03-15
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-004** (Identidade Avançada)
**Épico de Negócio:** EP02

## Metadados de Governança

- **status_agil:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** EP02 (doc 01_Fundacao_Organizacional_e_de_Acesso), DOC-DEV-001, DOC-ARC-001, DOC-ARC-002, DOC-ARC-003, US-MOD-000-F06, US-MOD-000-F09, US-MOD-003, LGPD-BASE-001
- **nivel_arquitetura:** 2 (multi-tenant, cache Redis, domain events, vigência controlada)
- **evidencias:** N/A

---

## 1. Contexto e Problema

O MOD-000 cobre a identidade **operacional básica**: quem pode fazer o quê em qual filial (`tenant_users`). O MOD-003 cobre a estrutura organizacional (N1–N4). Mas há uma **lacuna entre os dois**: o sistema não sabe em qual *área organizacional* um usuário atua — informação essencial para que processos (MOD-005/006), parametrizações (MOD-007) e integrações (MOD-008) possam filtrar e controlar acesso por escopo de área.

Além disso, o modelo do documento normativo exige dois mecanismos que não existem:

1. **Compartilhamento controlado**: regra formal que expande visibilidade além do escopo principal, com motivo, autorizador e vigência.
2. **Delegação temporária**: usuário transfere parte de seu acesso a outro por TTL definido, sem transferir poder decisório.

Sem esses mecanismos, toda exceção de acesso é feita de forma implícita (risco de auditoria) ou exige intervenção manual do admin (ineficiência operacional).

---

## 2. O que MOD-000 já cobre e o que MOD-004 adiciona

| Camada | Onde vive | O que responde |
|---|---|---|
| Identidade básica | `users` (MOD-000-F05) | Quem é o sujeito? |
| Role e escopo funcional | `roles` + `role_scopes` (MOD-000-F06) | O que pode fazer? |
| Vínculo ao tenant (N5) | `tenant_users` (MOD-000-F09) | Em qual filial? |
| Estrutura org. | `org_units` (MOD-003) | Onde a organização existe? |
| **Escopo de área** | **`user_org_scopes` (MOD-004-F01)** | **Em qual área organizacional atua?** |
| **Compartilhamento** | **`access_shares` (MOD-004-F02)** | **Quais exceções ampliam visibilidade?** |
| **Delegação** | **`access_delegations` (MOD-004-F02)** | **Quando alguém atua em nome de outro?** |

---

## 3. Escopo do Épico

### Inclui
- API de vínculo usuário ↔ nó organizacional (`user_org_scopes`) — tipo PRIMARY ou SECONDARY
- API de compartilhamento controlado com vigência obrigatória (`access_shares`)
- API de delegação temporária com TTL obrigatório (`access_delegations`)
- Expiração automática via background job (marks EXPIRED/REVOKED quando `valid_until < now()`)
- Tela de gestão de escopo organizacional do usuário (UX-IDN-001)
- Tela de compartilhamentos e delegações ativas (UX-IDN-002)
- Novos escopos no catálogo: `identity:org_scope:*`, `identity:share:*`

### Não inclui
- Revisão periódica formal de acessos — roadmap Wave 3 (requer gestão de campanhas de revisão)
- Governança de concessão de acesso com fluxo de aprovação — MOD-009 (Aprovações e Alçadas)
- Contas técnicas e agentes associados — roadmap futuro (Wave 4+)

---

## 4. Decisões Arquiteturais Relevantes

### 4.1 user_org_scopes vs. tenant_users — diferença fundamental

```
tenant_users:     user ──► tenant (N5)  +  role       → RBAC operacional (O QUÊ + ONDE na filial)
user_org_scopes:  user ──► org_unit (N1–N4)             → Contexto organizacional (EM QUAL ÁREA)
```

Um usuário pode ter `tenant_users` em 3 filiais e `user_org_scopes` apontando para a Macroárea de Tecnologia (N3) que contém essas filiais. São dimensões ortogonais.

### 4.2 Delegação NÃO transfere poder decisório

```
Delegação PODE: preparar, consultar, visualizar, editar rascunhos
Delegação NÃO PODE: aprovar, executar movimentos controlados, assinar
```

Esta regra é reforçada por validação no service: `access_delegations` não pode conter escopos de aprovação (`*:approve`, `*:execute`, `*:sign`).

### 4.3 Compartilhamento — validação de autorização por scope

A segregação entre `authorized_by` e `grantor_id` **não é mais uma regra absoluta**. A validação é feita no service com base em scopes:

- Usuário com scope `identity:share:authorize` **pode** ser simultaneamente `grantor_id` e `authorized_by` (auto-autorização permitida).
- Usuário **sem** esse scope deve indicar um terceiro como `authorized_by` (diferente de `grantor_id`).

> Decisão técnica 2026-03-15: Removida como regra absoluta. Substituída por validação de scope no service.

---

## 5. Critérios de Aceite (Épico)

```gherkin
Funcionalidade: Épico Identidade Avançada MOD-004

  Cenário: Vínculo org independente do tenant_users
    Dado que um usuário tem tenant_users em 2 filiais
    Quando POST /admin/users/:id/org-scopes é chamado com org_unit_id de uma Macroárea N3
    Então o vínculo é criado sem alterar tenant_users
    E GET /admin/users/:id retorna tanto tenants[] quanto org_scopes[] separadamente

  Cenário: Delegação não pode incluir escopo de aprovação
    Dado que um usuário tenta criar delegação com scope contendo "finance:invoice:approve"
    Quando POST /access-delegations é chamado
    Então deve retornar 422: "Delegações não podem incluir escopos de ação 'approve', 'execute' ou 'sign'."

  Cenário: Compartilhamento auto-autorizado com scope permitido
    Dado que grantor_id = "user-A" e authorized_by = "user-A"
    E "user-A" possui scope "identity:share:authorize"
    Quando POST /admin/access-shares é chamado
    Então o compartilhamento é criado com sucesso

  Cenário: Compartilhamento auto-autorizado sem scope é bloqueado
    Dado que grantor_id = "user-B" e authorized_by = "user-B"
    E "user-B" NÃO possui scope "identity:share:authorize"
    Quando POST /admin/access-shares é chamado
    Então deve retornar 422: "Sem scope 'identity:share:authorize', o autorizador deve ser diferente do solicitante."

  Cenário: Expiração automática de compartilhamentos
    Dado que um access_share tem valid_until = ontem
    Quando o background job de expiração roda
    Então status deve ser EXPIRED
    E o evento identity.share_expired deve ser emitido

  Cenário: Sub-histórias bloqueadas sem aprovação do épico
    Dado que US-MOD-004 está com Status diferente de "APPROVED"
    Quando agente COD tentar forge-module para F01, F02, F03 ou F04
    Então a automação DEVE ser bloqueada
```

---

## 6. Definition of Ready (DoR) ✅

- [x] Gap entre MOD-000 e MOD-004 documentado e validado
- [x] Modelo de dados `user_org_scopes`, `access_shares`, `access_delegations` definido
- [x] Regra de delegação sem poder decisório documentada
- [x] Regra de validação de autorização por scope (`identity:share:authorize`) documentada
- [x] Features F01–F04 com Gherkin completo
- [x] Screen Manifests UX-IDN-001, UX-IDN-002 criados
- [x] Novos escopos mapeados para MOD-000-F12
- [ ] Owner confirmar READY → APPROVED

## 7. Definition of Done (DoD)

- [ ] F01–F04 individualmente aprovadas e scaffoldadas
- [ ] Background job de expiração testado com casos de borda (valid_until = agora, passado)
- [ ] Delegação bloqueia escopos de aprovação — validado por teste
- [ ] Compartilhamento: validação por scope (auto-autorização com `identity:share:authorize`, bloqueio sem scope) — validado por teste
- [ ] Cache Redis invalidado ao criar/revogar user_org_scopes
- [ ] Telas de gestão validadas com manifests

---

## 8. Sub-Histórias

```text
US-MOD-004  (este arquivo) ← Épico / Governança / Índice
  ├── US-MOD-004-F01  ← API: Vínculo Usuário ↔ Estrutura Org (user_org_scopes)
  ├── US-MOD-004-F02  ← API: Compartilhamento e Delegação (access_shares + access_delegations)
  ├── US-MOD-004-F03  ← UX: Gestão de Escopo Organizacional do Usuário (UX-IDN-001)
  └── US-MOD-004-F04  ← UX: Painel de Compartilhamentos e Delegações (UX-IDN-002)
```

| Sub-História | Tema | Tipo | Status |
|---|---|---|---|
| US-MOD-004-F01 | API: user_org_scopes (CRUD + invalidação Redis) | Backend | `READY` |
| US-MOD-004-F02 | API: access_shares + access_delegations + job expiração | Backend | `READY` |
| US-MOD-004-F03 | UX: Escopo organizacional do usuário | UX | `READY` |
| US-MOD-004-F04 | UX: Compartilhamentos e delegações ativas | UX | `READY` |

---

## 9. Modelo de Dados Completo

### Tabela: `user_org_scopes`

| Campo | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `user_id` | uuid | FK → users.id, NOT NULL | |
| `org_unit_id` | uuid | FK → org_units.id, NOT NULL | Nível N1–N4 |
| `scope_type` | varchar | PRIMARY \| SECONDARY | PRIMARY = área principal; SECONDARY = área adicional |
| `granted_by` | uuid | FK → users.id | Admin que concedeu |
| `valid_from` | timestamp | NOT NULL, default now() | |
| `valid_until` | timestamp | nullable | null = permanente |
| `status` | varchar | ACTIVE \| INACTIVE | |
| `created_at` | timestamp | | |
| `deleted_at` | timestamp | nullable | soft delete |

**Constraint:** `UNIQUE(user_id, org_unit_id)` — um usuário só pode ter um vínculo por nó.

### Tabela: `access_shares`

| Campo | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `grantor_id` | uuid | FK → users.id | Quem compartilha |
| `grantee_id` | uuid | FK → users.id | Quem recebe |
| `resource_type` | varchar | NOT NULL | `org_unit` \| `tenant` \| `process` |
| `resource_id` | uuid | NOT NULL | ID do recurso compartilhado |
| `allowed_actions` | jsonb | NOT NULL | Array de escopos concedidos |
| `reason` | text | NOT NULL | Motivo — obrigatório |
| `authorized_by` | uuid | FK → users.id, NOT NULL | Aprovador (pode ser = grantor se possuir scope `identity:share:authorize`) |
| `valid_from` | timestamp | NOT NULL | |
| `valid_until` | timestamp | NOT NULL | Expiração obrigatória |
| `status` | varchar | ACTIVE \| REVOKED \| EXPIRED | |
| `created_at` | timestamp | | |
| `revoked_at` | timestamp | nullable | |
| `revoked_by` | uuid | nullable, FK → users.id | |

**Nota:** A validação `authorized_by != grantor_id` é feita no **service** (não via CHECK constraint no banco). Usuários com scope `identity:share:authorize` podem ser simultaneamente grantor e authorized_by.

### Tabela: `access_delegations`

| Campo | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `delegator_id` | uuid | FK → users.id | Quem delega |
| `delegatee_id` | uuid | FK → users.id | Quem recebe |
| `role_id` | uuid | FK → roles.id, nullable | Role base da delegação |
| `org_unit_id` | uuid | FK → org_units.id, nullable | Escopo da delegação |
| `delegated_scopes` | jsonb | NOT NULL | Subconjunto dos escopos do delegador |
| `reason` | text | NOT NULL | |
| `valid_until` | timestamp | NOT NULL | TTL obrigatório |
| `status` | varchar | ACTIVE \| REVOKED \| EXPIRED | |
| `created_at` | timestamp | | |
| `revoked_at` | timestamp | nullable | |

**Constraint:** Escopos em `delegated_scopes` NÃO podem conter `*:approve`, `*:execute`, `*:sign`.

---

## 10. Endpoints do Módulo

| Método | Path | operationId | Scope | Descrição |
|---|---|---|---|---|
| GET | /api/v1/admin/users/:id/org-scopes | `admin_user_org_scopes_list` | `identity:org_scope:read` | Lista vínculos org do usuário |
| POST | /api/v1/admin/users/:id/org-scopes | `admin_user_org_scopes_create` | `identity:org_scope:write` | Criar vínculo usuário ↔ nó org |
| DELETE | /api/v1/admin/users/:id/org-scopes/:scopeId | `admin_user_org_scopes_delete` | `identity:org_scope:write` | Remover vínculo (soft delete) |
| GET | /api/v1/my/org-scopes | `my_org_scopes` | — (próprio usuário) | Usuário consulta seus próprios vínculos org |
| POST | /api/v1/admin/access-shares | `admin_access_shares_create` | `identity:share:write` | Criar compartilhamento controlado |
| GET | /api/v1/admin/access-shares | `admin_access_shares_list` | `identity:share:read` | Listar compartilhamentos ativos |
| DELETE | /api/v1/admin/access-shares/:id | `admin_access_shares_revoke` | `identity:share:revoke` | Revogar compartilhamento |
| GET | /api/v1/my/shared-accesses | `my_shared_accesses` | — | Usuário vê o que foi compartilhado com ele |
| POST | /api/v1/access-delegations | `access_delegations_create` | — (próprio usuário) | Criar delegação temporária |
| GET | /api/v1/access-delegations | `access_delegations_list` | — | Listar delegações ativas (ativas por / para mim) |
| DELETE | /api/v1/access-delegations/:id | `access_delegations_revoke` | — | Revogar delegação própria |

---

## 11. Novos Escopos — Amendment em MOD-000-F12

| Escopo | Descrição |
|---|---|
| `identity:org_scope:read` | Ver vínculos org de usuários |
| `identity:org_scope:write` | Criar/remover vínculos org |
| `identity:share:read` | Ver compartilhamentos controlados |
| `identity:share:write` | Criar compartilhamentos |
| `identity:share:revoke` | Revogar compartilhamentos |
| `identity:share:authorize` | Permite auto-autorizar compartilhamentos (grantor = authorized_by) |

---

## 12. OKRs

| # | Métrica | Alvo |
|---|---|---|
| OKR-1 | Delegações com escopo de aprovação bloqueadas | 100% |
| OKR-2 | Auto-autorização bloqueada quando usuário não possui scope `identity:share:authorize` | 100% |
| OKR-3 | Expiração automática em < 5min após valid_until | 100% |
| OKR-4 | Cache Redis invalidado ao criar/revogar user_org_scopes | 100% |

---

## 13. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação do zero. Gap mapeado, modelo de dados, endpoints, regras críticas, features F01–F04. |
| 1.1.0 | 2026-03-16 | Marcos Sulivan | Decisões técnicas 2026-03-15: segregação authorized_by substituída por validação de scope, CHECK constraint removido, novo scope identity:share:authorize, owner atualizado. |

---

> ⚠️ **Atenção:** (`forge-module`, `create-amendment`) **SÓ PODEM SER EXECUTADAS** com Status `APPROVED`.
