> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-16 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-16 | AGN-DEV-06  | Enriquecimento SEC-EventMatrix (enrich-agent) |

# SEC-EventMatrix — Matriz de Autorização de Eventos do Backoffice Admin

> Modelo canônico conforme DOC-FND-000 §3.

## Princípios (MUST)

- **Não use "permissão no evento" como fonte de verdade.**
  - **Emit** é controlado pela permissão do **comando** que gera o evento.
  - **View** é controlado pela permissão de leitura da **entity originária** (ACL) + `tenant_id`.
- `sensitivity_level` **não substitui** ACL/RBAC: serve apenas como **guard-rail**.
- **Autorização de Linha (MUST):** toda leitura em `domain_events` e `notifications` MUST filtrar por `tenant_id`.

## Glossário

- **Emit**: quem pode disparar o evento (derivado do comando).
- **View**: quem pode ler/visualizar eventos (timeline/auditoria).
- **Notify**: quem recebe notificações (inbox/real-time), resolvido por regra.

---

## Contexto MOD-001

O MOD-001 é **UX-First** — os domain events são emitidos pelo MOD-000 (backend). Esta matriz documenta a autorização de **visualização dos eventos correlacionados** pela telemetria UI do Shell, vinculados via `X-Correlation-ID`.

## Matriz de Autorização — Eventos Correlacionados (MOD-000 → MOD-001 UI)

### Auth Events (disparados pelo MOD-000, correlacionados pela UI)

| action | event_type (MOD-000) | UIActionEnvelope (MOD-001) | emit_perm | view | notify | sensitivity |
|---|---|---|---|---|---|---|
| Login OK | `auth.login_success` | submit_login (succeeded) | público (próprio usuário) | `canRead(session)` + tenant | admin | 0 |
| Login falhou | `auth.login_failed` | submit_login (failed) | público (próprio usuário) | auditor/admin only | security + admin | 1 |
| Logout | `auth.logout` | submit_logout (succeeded) | público (próprio usuário) | `canRead(session)` + tenant | — | 0 |
| Forgot password | `auth.password_reset_requested` | submit_forgot_password (succeeded) | público (qualquer) | auditor/admin only | — | 1 |
| Reset password | `auth.password_reset_completed` | submit_reset_password (succeeded) | público (via token) | auditor/admin only | security + user | 1 |

### Shell Events (sem domain event backend — apenas telemetria UI)

| action | UIActionEnvelope (MOD-001) | emit_perm | view | notify | sensitivity |
|---|---|---|---|---|---|
| Load profile | load_current_user (succeeded/failed) | usuário autenticado | próprio usuário + admin | — | 0 |
| Load dashboard | load_dashboard_profile (succeeded/failed) | usuário autenticado | próprio usuário + admin | — | 0 |
| Navigate sidebar | navigate_sidebar (ui_only) | usuário autenticado | — (client_only) | — | 0 |
| Navigate breadcrumb | navigate_breadcrumb (ui_only) | usuário autenticado | — (client_only) | — | 0 |

### Regras de Filtragem (MUST)

- Toda consulta a `domain_events` relacionados ao auth MUST filtrar por `tenant_id`
- Eventos `auth.login_failed` são visíveis apenas para auditor/admin (nunca para o próprio usuário que falhou)
- Eventos `auth.password_reset_requested` NÃO revelam se o e-mail existe (anti-enumeração, BR-002)
- UIActionEnvelopes pré-auth (UX-AUTH-001) NÃO contêm `tenant_id` — não são indexáveis por tenant

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-16
- **rastreia_para:** US-MOD-001-F02, DATA-003, BR-001, BR-002, BR-006, SEC-001, DOC-ARC-003, DOC-FND-000
- **referencias_exemplos:** N/A
- **evidencias:** N/A
