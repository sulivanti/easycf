> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-16 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-16 | AGN-DEV-04  | Enriquecimento DATA (enrich-agent) |

# DATA-001 — Modelo de Dados do Backoffice Admin

> Permitir gerar **modelo**, **migração**, **queries** e **contratos** sem inferência arriscada.

- **Objetivo:** Documentar as entidades consumidas pelo módulo Backoffice Admin. Este módulo é **UX-First** e **não possui entidades de banco próprias** — consome exclusivamente entidades do MOD-000 (Foundation).
- **Tipo de Tabela/Armazenamento:** N/A — módulo consumidor

---

## Entidades Consumidas do MOD-000

O MOD-001 consome as seguintes entidades do Foundation via endpoints REST, sem acesso direto ao banco:

| Entidade MOD-000 | Endpoint Consumido | Dados Relevantes para o Shell | Referência |
|---|---|---|---|
| `users` | GET /auth/me (auth_me) | `name`, `email`, `scopes[]` | US-MOD-000-F08 |
| `tenants` | GET /auth/me (auth_me) | `tenant.name`, `tenant.id` | US-MOD-000-F07 |
| `user_sessions` | POST /auth/login, POST /auth/logout | JWT (access_token, refresh_token) | US-MOD-000-F01 |
| `password_reset_tokens` | POST /auth/forgot-password, POST /auth/reset-password | token UUID na URL | US-MOD-000-F04 |

### Princípio Anti-Duplicação (DOC-FND-000 §2)

O MOD-001 **NÃO DEVE** criar tabelas, schemas ou entidades próprias. Toda a persistência é gerenciada pelo MOD-000. O frontend consome dados via API REST e armazena estado apenas em memória (React state/context).

### Dados em Memória (Frontend)

| Dado | Fonte | Escopo | Regra |
|---|---|---|---|
| Nome do usuário | auth_me.name | WelcomeWidget, ProfileWidget | Sempre via auth_me, nunca localStorage (BR-008) |
| Scopes do usuário | auth_me.scopes[] | Sidebar, ModuleShortcuts | Filtro de menu e atalhos (BR-005) |
| Tenant ativo | auth_me.tenant | WelcomeWidget, ProfileWidget | Nome e ID do tenant |
| JWT tokens | Cookies httpOnly | Interceptor HTTP | Gerenciado pelo browser, não acessível via JS |

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-16
- **rastreia_para:** US-MOD-001, FR-001, MOD-000, DATA-000, BR-005, BR-008
- **referencias_exemplos:** N/A
- **evidencias:** N/A
