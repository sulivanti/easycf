> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO. NÃO EDITE DIRETAMENTE.** Use a skill pertinente para versionar alterações.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.2.0  | 2026-03-08 | arquitetura | Enriquecimento pós-aprovação do épico US-MOD-000 (scaffold-module) |
> | 0.1.0  | 2026-03-08 | arquitetura | Baseline Inicial (scaffold-module) |

# MOD-000 — Framework de Automação / Geradores (Foundation)

- Resumo: Governança de Documentos Normativos para Geração Automática de Código. Garante a aderência a padrões arquiteturais, segurança e contratos no framework base de desenvolvimento. Provê os serviços centrais de autenticação, autorização (RBAC), gestão de usuários, sessões, filiais multi-tenant, telemetria de UI e infraestrutura de CI.
- Doc canônico (módulo): `docs/04_modules/mod-000-foundation/mod.md`
- Changelog do módulo: `docs/04_modules/mod-000-foundation/CHANGELOG.md`

## 1. Escopo do Módulo

O MOD-000 é o **módulo Foundation** do projeto. Ele provê:

- **Autenticação e Sessões** (F01): Login, Logout, Kill-Switch, Refresh Token
- **MFA / TOTP** (F02): RFC 6238 via Google Authenticator / Authy
- **SSO OAuth2** (F03): Google + Microsoft/Azure AD
- **Recuperação de Senha** (F04): Forgot/Reset com token UUID (TTL 1h)
- **Gestão de Usuários** (F05): CRUD + Soft Delete + Auto-Registro
- **RBAC por Escopos** (F06): `modulo:recurso:acao` + cache Redis
- **Filiais Multi-Tenant** (F07): Hierarquia PAI→FILHA + Bloqueio
- **Perfil do Usuário** (F08): `GET /auth/me` + edição
- **Vínculo Usuário-Filial** (F09): `tenant_users` + role RBAC completo
- **Alteração de Senha** (F10): Force reset gate
- **Endpoint /info** (F11): Versão e Metadados
- **Catálogo de Permissões** (F12): CRUD de escopos com integridade referencial
- **Telemetria UI** (F13): `UIActionEnvelope` (DOC-ARC-003)
- **Correlação E2E** (F14): `correlationIdMiddleware`
- **CI Gates** (F15): Screen Manifests Validator
- **Storage e Upload** (F16): Presigned URLs via S3-compatible

## 2. Índice de Especificações

### Regras de Negócio (BR)

- [BR-000 — Regras de Negócio Core](requirements/br/BR-000.md)

### Funcionais (FR)

- [FR-000 — Requisitos Funcionais (F01–F16)](requirements/fr/FR-000.md)

### Dados (DATA)

- [DATA-000 — Modelo de Dados e Catálogo de Eventos](requirements/data/DATA-000.md)

### Integrações (INT)

- [INT-000 — Integrações Externas (E-mail, SSO, Storage, Redis)](requirements/int/INT-000.md)

### Segurança (SEC)

- [SEC-000 — Políticas de Segurança e SEC-EventMatrix](requirements/sec/SEC-000.md)

### Experiência do Usuário (UX)

- [UX-000 — Jornadas e Diagramas de Sequência](requirements/ux/UX-000.md)

### Não-Funcionais (NFR)

- [NFR-000 — Performance, Observabilidade, Disponibilidade e Segurança](requirements/nfr/NFR-000.md)

## 3. Architecture Decision Records (ADR)

- [ADR-000 — Decisões Arquiteturais Core (Sessão em Banco, Redis, Idempotência, Soft-Delete, Upload)](adr/ADR-000.md)

## Metadados de Governança

- **estado_item:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-08
- **rastreia_para:** DOC-DEV-001, DOC-GNP-00, DOC-ESC-001, DOC-GPA-001, DOC-ARC-001, DOC-ARC-002, DOC-ARC-003, DOC-UX-010, DOC-PADRAO-001, DOC-PADRAO-002, DOC-PADRAO-004, DOC-PADRAO-005
- **referencias_exemplos:** [US-MOD-000](../user-stories/epics/US-MOD-000.md)
- **evidencias:** N/A
