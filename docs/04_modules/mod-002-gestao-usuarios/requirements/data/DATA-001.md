> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-17 | AGN-DEV-04  | Criação Batch 2 — modelo de dados consumidos do MOD-000 |

# DATA-001 — Modelo de Dados Consumidos (Gestão de Usuários)

> Documentar entidades, DTOs e view-models consumidos pelo MOD-002 para geração determinística de mappers, queries e contratos de tela.

- **Objetivo:** Documentar as entidades consumidas pelo módulo de Gestão de Usuários. MOD-002 é **UX-First** e **não possui entidades de banco próprias** — consome exclusivamente entidades do MOD-000 (Foundation) via REST API.
- **Tipo de Tabela/Armazenamento:** N/A — módulo consumidor

---

## Nota Arquitetural — UX-First

MOD-002 **NÃO DEVE** criar tabelas, schemas ou entidades próprias. Toda a persistência e domain logic são gerenciadas pelo MOD-000-F05 (Users API) e MOD-000-F06 (Roles API). O frontend consome dados via API REST e armazena estado apenas em memória (React state / TanStack Query cache).

### Princípio Anti-Duplicacao (DOC-FND-000 §2)

Entidades `users`, `roles`, `tenants`, `user_sessions` pertencem ao Foundation. Este catálogo documenta apenas os **DTOs consumidos** e o **view-model** necessário para a camada de apresentação.

---

## Entidades Consumidas do MOD-000

| Entidade MOD-000 | Endpoint Consumido | Dados Relevantes para MOD-002 | Referência |
|---|---|---|---|
| `users` | GET /api/v1/users (`users_list`) | `id`, `fullName`, `email`, `status`, `roleId`, `roleName`, `createdAt` | FR-001, INT-001 |
| `users` | GET /api/v1/users/:id (`users_get`) | `id`, `fullName`, `status`, `inviteTokenExpired`, `createdAt` | FR-003, INT-001 |
| `users` | POST /api/v1/users (`users_create`) | Request: `fullName`, `email`, `roleId`, `mode`/`password`. Response: `id`, `fullName`, `status`, `createdAt` | FR-002, INT-001 |
| `users` | DELETE /api/v1/users/:id (`users_delete`) | Response: `id`, `status` (INACTIVE) | FR-001, INT-001 |
| `users` | POST /api/v1/users/:id/invite/resend (`users_invite_resend`) | Response: `message` | FR-003, INT-001 |
| `roles` | GET /api/v1/roles (`roles_list`) | `id`, `name`, `description` | FR-001, FR-002, INT-001 |

---

## DTOs de Resposta (API → Frontend)

### UserListItemDTO

Retornado por `users_list` — cada item do array `data[]`.

| Campo | Tipo | Obrigatorio | Nota |
|---|---|---|---|
| `id` | UUID | Sim | PK do usuário |
| `fullName` | string | Sim | Nome completo |
| `email` | string | Sim | PII — exibido apenas na coluna da tabela, NUNCA em toasts (BR-002) |
| `status` | enum (ACTIVE, PENDING, BLOCKED, INACTIVE) | Sim | Usado para badge e filtro |
| `roleId` | UUID | Sim | FK para roles |
| `roleName` | string | Sim | Nome do perfil — exibido na coluna |
| `createdAt` | ISO8601 | Sim | Data de criação — exibido na coluna |

### UserDetailDTO

Retornado por `users_get` — objeto `data`.

| Campo | Tipo | Obrigatorio | Nota |
|---|---|---|---|
| `id` | UUID | Sim | PK do usuário |
| `fullName` | string | Sim | Nome exibido no titulo da tela (BR-002) |
| `status` | enum | Sim | Determina badge e disponibilidade do botao de reenvio |
| `inviteTokenExpired` | boolean | Sim | Determina alerta de token expirado (FR-003) |
| `createdAt` | ISO8601 | Sim | Metadata |

### RoleDTO

Retornado por `roles_list` — cada item do array `data[]`.

| Campo | Tipo | Obrigatorio | Nota |
|---|---|---|---|
| `id` | UUID | Sim | Enviado como `roleId` no POST |
| `name` | string | Sim | Label do select |
| `description` | string | Sim | Tooltip ou texto auxiliar |

### PaginationMeta

Retornado no campo `meta` de `users_list`.

| Campo | Tipo | Obrigatorio | Nota |
|---|---|---|---|
| `nextCursor` | string/null | Sim | null = ultima pagina |
| `total` | integer | Sim | Total de registros (para exibir "Mostrando X de Y") |

---

## View-Model (Frontend)

O view-model transforma DTOs em dados prontos para renderizacao (DOC-ESC-001 §6.3 — `domain/view-model.ts`).

### UserViewModel

| Campo | Tipo | Origem | Logica |
|---|---|---|---|
| `id` | UUID | `UserListItemDTO.id` | Direto |
| `displayName` | string | `UserListItemDTO.fullName` | Direto — usado em tabela, modal, titulo |
| `statusBadge` | `{ label: string, color: string }` | `UserListItemDTO.status` | ACTIVE=verde, PENDING=ambar, BLOCKED=vermelho, INACTIVE=cinza |
| `roleName` | string | `UserListItemDTO.roleName` | Direto |
| `createdAtFormatted` | string | `UserListItemDTO.createdAt` | Formatado locale pt-BR (dd/MM/yyyy) |
| `canDeactivate` | boolean | `status !== 'INACTIVE'` + scope `users:user:delete` | Regra combinada (BR-001) |
| `canResendInvite` | boolean | `status === 'PENDING'` + scope `users:user:write` | Regra combinada (BR-001) |
| `isInviteExpired` | boolean | `UserDetailDTO.inviteTokenExpired` | Direto — usado para alerta ambar (FR-003) |

### Regras de Visibilidade (BR-001)

| Elemento UI | Scope necessario | Regra |
|---|---|---|
| Botao "Novo Usuario" | `users:user:write` | `hide_if_no_permission` — nao renderizar |
| Acao "Desativar" | `users:user:delete` | `hide_if_no_permission` + `status !== 'INACTIVE'` |
| Acao "Reenviar convite" | `users:user:write` | `hide_if_no_permission` + `status === 'PENDING'` |
| Rota /usuarios | `users:user:read` | Redirect para /dashboard sem scope |
| Rota /usuarios/novo | `users:user:write` | Redirect para /usuarios sem scope |

---

## Dados em Memoria (Frontend)

| Dado | Fonte | Cache | Regra |
|---|---|---|---|
| Lista de usuarios | `users_list` | TanStack Query (staleTime configuravel) | Invalidar apos `users_create` ou `users_delete` |
| Lista de roles | `roles_list` | TanStack Query (staleTime longo) | Dados semi-estaticos — invalidar apenas em remount |
| Detalhe do usuario | `users_get` | TanStack Query (staleTime curto) | Invalidar apos `users_invite_resend` |
| Estado do formulario | React state (useState/useForm) | Nenhum | Descartado ao trocar modo (BR-003) ou apos sucesso |
| Idempotency-Key | UUID v4 gerado no mount | Nenhum | Regenerado apos sucesso (BR-005) |
| Cooldown de reenvio | Timer client-side | Nenhum | 60s apos sucesso (BR-004) |

### Regras de PII (BR-002 / LGPD)

- **E-mail:** Visivel SOMENTE no campo de input do formulario e na coluna da tabela. NUNCA em toasts, modais, mensagens de erro ou domain events.
- **Nome:** Visivel em tabela, modal de desativacao, titulo de convite. NAO incluir em payloads de domain events quando `sensitivity_level >= 1` (DATA-003).
- **Nenhum dado em localStorage/sessionStorage** — estado exclusivamente em memoria (SEC-001 §4).

---

## Referencias Obrigatorias

- **INT-001:** Contratos completos dos 6 operationIds
- **DATA-003:** Catalogo de domain events emitidos pelo MOD-000 como consequencia das acoes do MOD-002
- **SEC-001 §3:** Classificacao de dados e sensitivity levels
- **DOC-FND-000 §2:** Anti-duplicacao de entidades Foundation

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-17
- **rastreia_para:** US-MOD-002, US-MOD-002-F01, US-MOD-002-F02, US-MOD-002-F03, FR-001, FR-002, FR-003, BR-001, BR-002, BR-003, BR-005, INT-001, SEC-001, DATA-003, DOC-FND-000
- **referencias_exemplos:** EX-TRACE-001, EX-DATA-001
- **evidencias:** Modelo de dados consumidos documentado com 6 endpoints, 4 DTOs, 1 view-model. Regras PII/LGPD formalizadas. Cache strategy definida. Anti-duplicacao Foundation respeitada.
