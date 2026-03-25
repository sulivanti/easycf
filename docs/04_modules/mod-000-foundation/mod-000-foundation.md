> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-15 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.1  | 2026-03-17 | AGN-DEV-01  | Re-validação MOD/Escala — CHANGELOG sincronizado, consistência verificada |
> | 0.2.0  | 2026-03-17 | AGN-DEV-01  | Enriquecimento MOD/Escala — fix contagem eventos, atualização metadata |

# MOD-000 — Foundation (Framework de Automação / Geradores)

- **id:** MOD-000
- **version:** 1.5.0
- **estado_item:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-24
- **rastreia_para:** US-MOD-000, DOC-DEV-001, DOC-GNP-00, DOC-ESC-001, DOC-GPA-001, DOC-ARC-001, DOC-ARC-002, DOC-ARC-003, DOC-UX-010, DOC-PADRAO-001, DOC-PADRAO-002, DOC-PADRAO-004, DOC-PADRAO-005, DOC-FND-000
- **evidencias:** N/A

---

## 1. Objetivo

Módulo fundacional (Core/Foundation) que estabelece os contratos abstratos e a infraestrutura base do sistema: autenticação nativa + SSO + MFA, gerenciamento de sessões com kill-switch, RBAC por escopos, gestão de usuários e filiais multi-tenant, catálogo de permissões, telemetria UI, correlação E2E, gates de pipeline CI, storage centralizado e tratamento de erros RFC 9457.

## 2. Escopo

### Inclui

- Autenticação nativa (login, logout, sessões, kill-switch, refresh)
- MFA / TOTP (RFC 6238)
- SSO OAuth2 (Google + Microsoft / Azure AD) + Sign in with Apple (OIDC/JWKS)
- Recuperação de senha (forgot / reset — token UUID, TTL 1h)
- Gestão de usuários (CRUD + soft delete + auto-registro)
- Roles / RBAC por escopos (módulo:recurso:ação + cache Redis)
- Filiais multi-tenant (CRUD + soft delete + bloqueio)
- Perfil do usuário autenticado (/auth/me + edição)
- Vinculação usuário-filial com role (tenant_users + RBAC completo)
- Alteração de senha autenticada (/auth/change-password)
- Endpoint GET /info (versão e metadados do sistema)
- Catálogo de permissões — CRUD de escopos pré-definidos
- Utilitário de telemetria UI (UIActionEnvelope)
- Middlewares de correlação E2E (CorrelationId Middleware)
- Motor de gates de pipeline CI (Screen Manifests Validator)
- Módulo de storage e upload centralizado (presigned URLs)

### Não inclui

- Lógica de negócio de módulos dependentes (MOD-001+)
- Construção de UI/Shell (governado por DOC-UX-011 e DOC-UX-012)
- Criação ou alteração de documentos normativos

## 3. Nível de Arquitetura

**Nível 2 — DDD-lite + Clean Completo** (DOC-ESC-001 §4)

Módulo base sem dependências de outros módulos. Todos os demais módulos dependem do Foundation.

### Justificativa (Score DOC-ESC-001 §4.2: 6/6)

| Gatilho | Presente | Evidência |
|---|---|---|
| Estado/workflow | SIM | Sessões com estados (ativa/expirada/revogada), kill-switch, MFA flow |
| Compliance/auditoria | SIM | LGPD, audit logs obrigatórios, domain events com sensitivity_level |
| Concorrência/consistência | SIM | Session kill-switch (invalidação atômica), refresh token rotation |
| Integrações externas críticas | SIM | SSO OAuth2 (Google, Microsoft/Azure AD), Sign in with Apple (OIDC/JWKS) |
| Multi-tenant/escopo por cliente | SIM | Isolamento obrigatório via `tenant_id`, RBAC por tenant |
| Regras cruzadas/reuso alto | SIM | Motor RBAC (`@RequireScope`) consumido por todos os módulos do sistema |

> **Nota:** Embora seja o módulo "Core/Foundation", a complexidade intrínseca (auth, RBAC, multi-tenant, SSO, MFA, audit) exige Nível 2 para proteger invariantes críticas de segurança e consistência transacional.

## 4. Dependências

- **Depende de:** Nenhum módulo (é o núcleo)
- **Dependentes:** Todos os módulos do sistema (MOD-001+)

### Caminhos do Módulo (module_paths)

| Camada | Path |
|---|---|
| Especificação | `docs/04_modules/mod-000-foundation/` |
| User Stories | `docs/04_modules/user-stories/features/US-MOD-000-F*.md` |
| API (código) | `apps/api/src/modules/foundation/` |
| Web (código) | `apps/web/src/modules/foundation/` |
| Schemas Drizzle | `src/modules/foundation/schema.ts` |
| Rotas Fastify | `src/modules/foundation/routes/*.route.ts` |

## 5. Sub-Histórias (Features)

| Feature | Tema | Status |
|---|---|---|
| [US-MOD-000-F01](../user-stories/features/US-MOD-000-F01.md) | Autenticação nativa + sessões | `READY` |
| [US-MOD-000-F02](../user-stories/features/US-MOD-000-F02.md) | MFA / TOTP (RFC 6238) | `READY` |
| [US-MOD-000-F03](../user-stories/features/US-MOD-000-F03.md) | SSO OAuth2 — Google + Microsoft | `READY` |
| [US-MOD-000-F04](../user-stories/features/US-MOD-000-F04.md) | Recuperação de senha | `READY` |
| [US-MOD-000-F05](../user-stories/features/US-MOD-000-F05.md) | Gestão de usuários (CRUD + soft delete) | `READY` |
| [US-MOD-000-F06](../user-stories/features/US-MOD-000-F06.md) | Roles / RBAC por escopos | `READY` |
| [US-MOD-000-F07](../user-stories/features/US-MOD-000-F07.md) | Filiais multi-tenant | `READY` |
| [US-MOD-000-F08](../user-stories/features/US-MOD-000-F08.md) | Perfil do usuário autenticado | `READY` |
| [US-MOD-000-F09](../user-stories/features/US-MOD-000-F09.md) | Vinculação usuário-filial com role | `READY` |
| [US-MOD-000-F10](../user-stories/features/US-MOD-000-F10.md) | Alteração de senha autenticada | `READY` |
| [US-MOD-000-F11](../user-stories/features/US-MOD-000-F11.md) | Endpoint GET /info | `READY` |
| [US-MOD-000-F12](../user-stories/features/US-MOD-000-F12.md) | Catálogo de permissões | `READY` |
| [US-MOD-000-F13](../user-stories/features/US-MOD-000-F13.md) | Telemetria UI (UIActionEnvelope) | `READY` |
| [US-MOD-000-F14](../user-stories/features/US-MOD-000-F14.md) | Middlewares de correlação E2E | `READY` |
| [US-MOD-000-F15](../user-stories/features/US-MOD-000-F15.md) | Motor de gates CI | `READY` |
| [US-MOD-000-F16](../user-stories/features/US-MOD-000-F16.md) | Storage e upload centralizado | `READY` |
| [US-MOD-000-F17](../user-stories/features/US-MOD-000-F17.md) | Sign in with Apple | `READY` |

## 6. Itens Base (Canônicos) e Links

<!-- start index -->
- [BR-000](requirements/br/BR-000.md) — Regras de Negócio do Foundation (14 regras)
- [FR-000](requirements/fr/FR-000.md) — Requisitos Funcionais do Foundation (19 requisitos)
- [DATA-000](requirements/data/DATA-000.md) — Modelo de Dados do Foundation (8 entidades)
- [DATA-003](requirements/data/DATA-003.md) — Catálogo de Domain Events do Foundation (36 eventos)
- [INT-000](requirements/int/INT-000.md) — Integrações e Contratos do Foundation (6 integrações)
- [SEC-000](requirements/sec/SEC-000.md) — Segurança e Compliance do Foundation (8 seções)
- [SEC-002](requirements/sec/SEC-002.md) — Matriz de Autorização de Eventos do Foundation (34 entradas)
- [UX-000](requirements/ux/UX-000.md) — Jornadas e Fluxos do Foundation (8 telas/jornadas, v0.3.0)
- [NFR-000](requirements/nfr/NFR-000.md) — Requisitos Não Funcionais do Foundation (SLOs, observabilidade, DR)
- [PEN-000](requirements/pen-000-pendente.md) — Questões Abertas do Foundation (18 pendências: 18 IMPLEMENTADA, 0 ABERTA)
<!-- end index -->

## 7. Decisões (ADR)

<!-- start adr-index -->
- [ADR-001](adr/ADR-001.md#adr-001--sessão-ancorada-em-banco-desvio-de-stateless-jwt) — Sessão Ancorada em Banco (Desvio de Stateless JWT) — accepted
- [ADR-002](adr/ADR-001.md#adr-002--substituição-total-de-escopos-em-roles-put-vs-patch) — Substituição Total de Escopos em Roles (PUT vs PATCH) — accepted
- [ADR-003](adr/ADR-001.md#adr-003--separação-de-tabelas-users--content_users) — Separação de Tabelas users / content_users — accepted
- [ADR-004](adr/ADR-004.md) — Vinculação SSO com Confirmação de Senha Nativa (Identity Linking) — accepted
<!-- end adr-index -->

## 8. Amendments

<!-- start amendments-index -->
- [DOC-FND-000-M01](amendments/sec/DOC-FND-000-M01.md) — 6 scopes process:case:* registrados no catálogo canônico §2.2 (MOD-006, PEN-006 PENDENTE-004)
- [DOC-FND-000-M02](amendments/sec/DOC-FND-000-M02.md) — 7º scope process:case:reopen no catálogo §2.2 (PEN-006 PENDENTE-001)
- [DOC-FND-000-M03](amendments/sec/DOC-FND-000-M03.md) — 7 scopes approval:* registrados no catálogo §2.2 (MOD-009, PEN-009 PENDENTE-002)
- [DOC-FND-000-M04](amendments/sec/DOC-FND-000-M04.md) — 6 scopes mcp:* registrados no catálogo §2.2 (MOD-010, PEN-010 PENDENTE-004)
- [FR-000-M01](amendments/fr/FR-000-M01.md) — DTO gaps Users API (F05): role_id/role_name em UserListItem, invite_token_expired em UserDetail, mode/role_id em CreateUserRequest (MOD-002)
- [FR-000-C01](amendments/fr/FR-000-C01.md) — Correção scopes do seed: alinhar com catálogo canônico DOC-FND-000 §2.2 (tenants:branch:*, system:audit:*, storage:file:*)
- [FR-000-C02](amendments/fr/FR-000-C02.md) — Correção: rota GET /auth/me ausente no index.ts + shape backend/frontend desalinhado (name, tenant objeto, scopes)
- [DATA-000-C02](amendments/data/DATA-000-C02.md) — Correção: tenant_id vazio em domain_events causa crash no INSERT (login e todos use-cases MOD-000)
- [FR-000-C04](amendments/fr/FR-000-C04.md) — Correção: mapeamento camelCase→snake_case nas rotas de auth (login, refresh, /me) + refreshResponse separado (DEF-001/DEF-002)
- [INT-000-C01](amendments/int/INT-000-C01.md) — Correção: OpenAPI v1.yaml referencia LoginResponse (com user) para /auth/refresh — trocar por RefreshResponse (derivado de FR-000-C04)
<!-- end amendments-index -->

> **Nota:** 8 amendments de documentos normativos foram migrados para `docs/01_normativos/amendments/{DOC-ID}/` em 2026-03-25. Normativos são transversais e não pertencem a nenhum módulo específico. Ver: DOC-PADRAO-001-C01, DOC-PADRAO-001-M01, DOC-PADRAO-004-M01, DOC-PADRAO-005-C01, DOC-UX-011-M01, DOC-UX-011-M02, DOC-UX-012-M02, DOC-GNP-00-M01.
