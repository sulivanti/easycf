> ⚠️ ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.

# DATA-000 — Identidade, Sessões e Auditoria Log (Foundation)

> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-05 | dba         | Baseline Inicial (scaffold-module via US-MOD-1&2) |

- **Objetivo:** Persistir dados de identidade do usuário primário (credentials), além de gerenciar persistência de Sessões para dar suporte ao processo de Logout/Kill-Switch imposto pela UX.

- **Tipo de Tabela/Armazenamento:** Relacional (SQL) Postgres + Drizzle ORM

## Tabela: `auth_users`

- `id`: uuid | NOT NULL
- `email`: varchar | NOT NULL | unique
- `password_hash`: text | NOT NULL (Hasheado usando biblioteca Argon2)
- `status`: enum('ACTIVE', 'BLOCKED', 'PENDING') | NOT NULL
- `mfa_secret`: text | NULL (Apenas atrelado se ativado por QR Code)
- `created_at`: timestamptz | NOT NULL | default=now()
- `updated_at`: timestamptz | NOT NULL | default=now()
- `deleted_at`: timestamptz | NULL (Soft Delete em caso de conta suspensa)

## Tabela: `auth_sessions`

- `id`: uuid | NOT NULL
- `user_id`: uuid | FK(auth_users) | NOT NULL (ON DELETE RESTRICT)
- `device_fp`: text | NOT NULL (Fingerprint string)
- `expires_at`: timestamptz | NOT NULL (Tempo validade real do DB, base do JWT)
- `is_revoked`: boolean | NOT NULL | default=false (Ativo de Logout, não fazer Hard Delete)
- `created_at`: timestamptz | NOT NULL | default=now()

## Eventos do Domínio Emitidos (Domain Events Mapping)

[session.created]

- Origem: POST `/api/v1/auth/login`
- Descrição: Nova sessão injetada. Notifica owner. Permissão atrelar: auth:login (Anonymous limit)

[session.revoked]

- Origem: POST `/api/v1/auth/logout` ou DELETE `/sessions/:id`
- Descrição: Sessão derrubada ativamente por encerramento de vínculo.

[session.revoked_by_admin]

- Origem: DELETE Kill-Switch.
- Descrição: Força encerramento em massa ou executado por agente C-Level superior.

## Eventos de Auditoria (Security / Logs)

- `auth.login.success`
- `auth.login.failure`
- `auth.login.blocked`

- **estado_item:** DRAFT
- **owner:** dba
- **data_ultima_revisao:** 2026-03-05
- **rastreia_para:** BR-000, FR-000, SEC-000
- **referencias_exemplos:** [US-MOD-001](../../../user-stories/US-MOD-001.md)
- **evidencias:** (Injetado)
