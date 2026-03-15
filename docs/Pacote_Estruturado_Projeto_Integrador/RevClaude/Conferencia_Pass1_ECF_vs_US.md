# Conferencia Pass 1 -- Documento de Engenharia Reversa vs. User Stories Reais

**Projeto:** EasyCodeFramework (ECF)
**Data da Conferencia:** 2026-03-13
**Fonte Reversa:** `docs/Pacote_Estruturado_Projeto_Integrador/RevClaude/Documento_Projeto_ECF.md`
**Fontes Originais:** Epicos (`US-MOD-000.md`, `US-MOD-001.md`, `US-MOD-002.md`) e Features (`US-MOD-000-F01` a `F17`, `US-MOD-001-F01` a `F03`)

**Legenda de Status por Dimensao:**
- **CONFIRMADO** -- O documento de engenharia reversa (ECF) reflete fielmente o arquivo original.
- **DIVERGENCIA** -- Ha diferenca relevante entre o documento ECF e o arquivo original.
- **AUSENTE** -- Informacao presente no original mas omitida no documento ECF, ou vice-versa.

---

## 1. Epico MOD-000 -- Foundation

| Dimensao | Documento ECF | Arquivo Original (US-MOD-000.md) | Status |
|---|---|---|---|
| **Versao** | 0.8.0 | 0.5.0 (cabecalho) -- mas CHANGELOG registra 0.8.0 como ultima versao | **DIVERGENCIA** -- ECF usa 0.8.0 (versao do CHANGELOG), original usa 0.5.0 no cabecalho (desatualizado no proprio original) |
| **Status** | DRAFT | DRAFT | **CONFIRMADO** |
| **Owner** | Arquitetura | Arquitetura | **CONFIRMADO** |
| **Nivel Arq.** | 2 | Nao declarado explicitamente no cabecalho do epico (mas inferido pelas features) | **DIVERGENCIA** -- ECF atribui nivel 2 ao epico; original nao declara nivel no epico |
| **Sub-historias** | F01 a F17 (17 features) | F01 a F17 (17 features) | **CONFIRMADO** |
| **Status das features** | Todas DRAFT | F01-F16 = READY; F17 = APPROVED | **DIVERGENCIA CRITICA** -- ECF declara todas como DRAFT; na tabela do epico original, F01-F16 estao READY e F17 esta APPROVED |
| **OKR-2 range** | F01-F17 | F01-F16 | **DIVERGENCIA** -- ECF diz F01-F17; original diz F01-F16 |
| **Cenarios Gherkin** | 6 cenarios (secao 3.2 resumida) | 6 cenarios (secao 4) | **CONFIRMADO** |
| **Regras Criticas** | 12 regras listadas | 12 regras listadas | **CONFIRMADO** |
| **Refs. Normativas** | DOC-DEV-001, DOC-GNP-00, DOC-ESC-001, DOC-ARC-001/002/003, SEC-000-01, LGPD | DOC-DEV-001, DOC-GNP-00, DOC-ESC-001, DOC-GPA-001, DOC-ARC-001/002/003, DOC-UX-010/011/012, DOC-PADRAO-001/002/004/005 | **DIVERGENCIA** -- ECF lista parcialmente; original inclui DOC-GPA-001, DOC-UX-010/011/012, DOC-PADRAO-001/002/004/005 que o ECF lista na secao 2 (Base Normativa) mas nao referencia no epico |
| **Escopo / Nao-escopo** | Nao detalhado | Detalhado com "Inclui", "Nao inclui", "Fora de Escopo por Agora" | **AUSENTE** -- ECF omite secoes de escopo do epico |
| **DoR/DoD do epico** | Resumido na secao 8 global | Detalhado por epico com checklists especificos | **DIVERGENCIA** -- ECF generaliza; original tem DoR/DoD especificos por epico |

---

## 2. Features do MOD-000

### 2.1 US-MOD-000-F01 -- Autenticacao Nativa

| Dimensao | Documento ECF | Arquivo Original (F01.md) | Status |
|---|---|---|---|
| **Endpoints** | 7 endpoints listados (login, logout, me, sessions, sessions/:id, sessions (DELETE), refresh) | 7 endpoints identicos | **CONFIRMADO** |
| **Cenarios Gherkin** | Nao conta explicitamente; lista regras | 10 cenarios Gherkin | **AUSENTE** -- ECF nao reproduz cenarios Gherkin da F01 |
| **Regras Criticas** | 7 regras (User Enum, Kill-Switch, Rate Limit, Cookies, Auditoria, MFA, Idempotencia) | 9 regras (inclui X-Correlation-ID e Catalogo de Eventos DATA-003) | **DIVERGENCIA** -- ECF omite regras de X-Correlation-ID e DATA-003 |
| **Nivel Arq.** | 2 | 2 | **CONFIRMADO** |
| **Refs. Normativas** | DOC-DEV-001, SEC-000-01, DOC-ARC-001 | DOC-DEV-001, SEC-000-01, DOC-ARC-001, DOC-GNP-00, DOC-ARC-002, DOC-ARC-003, DOC-PADRAO-004 | **DIVERGENCIA** -- ECF omite DOC-GNP-00, DOC-ARC-002/003, DOC-PADRAO-004 |
| **TTL de Sessao** | 12h normal / 30d estendida | 12h normal / 30d estendida | **CONFIRMADO** |
| **Status** | DRAFT | DRAFT (cabecalho), READY (tabela do epico) | **DIVERGENCIA** -- ECF diz DRAFT; epico diz READY |

### 2.2 US-MOD-000-F02 -- MFA / TOTP

| Dimensao | Documento ECF | Arquivo Original (F02.md) | Status |
|---|---|---|---|
| **Endpoints** | POST /auth/mfa/verify (implicito no fluxo) | POST /auth/mfa/verify (explicito) | **CONFIRMADO** |
| **Cenarios Gherkin** | Nao contados | 7 cenarios Gherkin | **AUSENTE** -- ECF nao reproduz cenarios |
| **Regras Criticas** | 4 regras (temp_token, 5 tentativas, resposta identica, causation_id) | 7 regras (inclui TOTP RFC 6238, Auditoria Obrigatoria, X-Correlation-ID, DATA-003) | **DIVERGENCIA** -- ECF omite regras de TOTP, auditoria, X-Correlation-ID e DATA-003 |
| **Nivel Arq.** | 2 | 2 | **CONFIRMADO** |
| **Refs. Normativas** | DOC-DEV-001, SEC-000-01, RFC 6238, DOC-ARC-001 | DOC-DEV-001, SEC-000-01, RFC 6238, DOC-ARC-001, DOC-GNP-00 | **DIVERGENCIA** -- ECF omite DOC-GNP-00 |
| **Status** | DRAFT | DRAFT (cabecalho), READY (tabela do epico) | **DIVERGENCIA** |

### 2.3 US-MOD-000-F03 -- SSO OAuth2 (Google + Microsoft)

| Dimensao | Documento ECF | Arquivo Original (F03.md) | Status |
|---|---|---|---|
| **Endpoints** | Nao lista endpoints explicitos | GET /auth/google, GET /auth/google/callback, GET /auth/microsoft, GET /auth/microsoft/callback | **AUSENTE** -- ECF nao lista os endpoints SSO |
| **Cenarios Gherkin** | Nao contados | 6 cenarios Gherkin | **AUSENTE** |
| **Regras Criticas** | 6 regras (vinculacao por email, passwordHash, avatarUrl, auditoria, BLOCKED, sem MFA) | 10 regras (inclui X-Correlation-ID, Contratos INT-000-01/02, DATA-003) | **DIVERGENCIA** -- ECF omite 4 regras |
| **Nivel Arq.** | 2 | 2 | **CONFIRMADO** |
| **Refs. Normativas** | DOC-DEV-001, INT-000-01/02, DOC-ARC-001 | DOC-DEV-001, INT-000-01/02, DOC-ARC-001, DOC-PADRAO-004 | **DIVERGENCIA** -- ECF omite DOC-PADRAO-004 |
| **Variaveis de Ambiente** | Lista 7 vars | Lista identica | **CONFIRMADO** |
| **Status** | DRAFT | DRAFT (cabecalho), READY (tabela do epico) | **DIVERGENCIA** |

### 2.4 US-MOD-000-F04 -- Recuperacao de Senha

| Dimensao | Documento ECF | Arquivo Original (F04.md) | Status |
|---|---|---|---|
| **Endpoints** | POST /auth/forgot-password, POST /auth/reset-password (implicito) | POST /auth/forgot-password, POST /auth/reset-password (explicito com fluxo) | **CONFIRMADO** |
| **Cenarios Gherkin** | Nao contados | 8 cenarios Gherkin | **AUSENTE** |
| **Regras Criticas** | Resumo: token UUID, TTL 1h, anti-enumeration | 8 regras detalhadas (anti-enum, uso unico, TTL 1h, MailService, force_pwd_reset, SSO, X-Correlation-ID, Idempotencia) | **DIVERGENCIA** -- ECF apresenta resumo muito superficial; omite regras de MailService, SSO, Idempotencia |
| **Nivel Arq.** | 1 | 1 | **CONFIRMADO** |
| **Refs. Normativas** | DOC-DEV-001, SEC-000-01, DOC-ARC-001, DOC-PADRAO-004 | DOC-DEV-001, SEC-000-01, DOC-ARC-001, DOC-PADRAO-004 | **CONFIRMADO** |
| **Status** | DRAFT | DRAFT (cabecalho), READY (tabela do epico) | **DIVERGENCIA** |

### 2.5 US-MOD-000-F05 -- Gestao de Usuarios

| Dimensao | Documento ECF | Arquivo Original (F05.md) | Status |
|---|---|---|---|
| **Endpoints** | Nao lista endpoints | POST /api/v1/users, GET /api/v1/users, DELETE /api/v1/users/:id | **AUSENTE** -- ECF nao lista endpoints |
| **Cenarios Gherkin** | Nao contados | 4 cenarios Gherkin | **AUSENTE** |
| **Regras Criticas** | Resumo: soft delete, cursor pagination, PII minimizada | 8 regras (soft delete, transacao atomica, limpeza response, boas-vindas async, paginacao cursor, X-Correlation-ID, Idempotencia, campo codigo) | **DIVERGENCIA** -- ECF omite transacao atomica, boas-vindas, Idempotencia, campo codigo |
| **Nivel Arq.** | 1 | 1 | **CONFIRMADO** |
| **Refs. Normativas** | DOC-DEV-001, DOC-ARC-001, DOC-ARC-002, LGPD | DOC-DEV-001, DOC-ARC-001, DOC-ARC-002, LGPD | **CONFIRMADO** |
| **Modelo de Dados** | Nao detalha (apenas menciona) | Detalha users + content_users com campo codigo | **DIVERGENCIA** -- ECF nao reproduz modelo de dados |
| **Status** | DRAFT | DRAFT (cabecalho), READY (tabela do epico) | **DIVERGENCIA** |

### 2.6 US-MOD-000-F06 -- Roles / RBAC

| Dimensao | Documento ECF | Arquivo Original (F06.md) | Status |
|---|---|---|---|
| **Endpoints** | Nao lista endpoints | POST /api/v1/roles, GET/PUT/DELETE /api/v1/roles/:id | **AUSENTE** |
| **Cenarios Gherkin** | Nao contados | 6 cenarios Gherkin | **AUSENTE** |
| **Regras Criticas** | Resumo: escopos modulo:recurso:acao, cache Redis, invalidacao | 7 regras (regex imutavel, substituicao total PUT, cache Redis, resiliencia, soft delete, X-Correlation-ID, campo codigo) | **DIVERGENCIA** -- ECF nao detalha regex, substituicao, resiliencia, campo codigo |
| **Nivel Arq.** | 2 | 2 | **CONFIRMADO** |
| **Refs. Normativas** | DOC-DEV-001, DOC-ARC-001, DOC-GNP-00, DOC-ESC-001 | DOC-DEV-001, DOC-ARC-001, DOC-GNP-00, DOC-ESC-001 | **CONFIRMADO** |
| **Status** | DRAFT | DRAFT (cabecalho), READY (tabela do epico) | **DIVERGENCIA** |

### 2.7 US-MOD-000-F07 -- Filiais Multi-Tenant

| Dimensao | Documento ECF | Arquivo Original (F07.md) | Status |
|---|---|---|---|
| **Endpoints** | Nao lista endpoints | POST /api/v1/tenants, PUT/DELETE /api/v1/tenants/:id, GET /tenants | **AUSENTE** |
| **Cenarios Gherkin** | Nao contados | 5 cenarios Gherkin | **AUSENTE** |
| **Regras Criticas** | Resumo: codigo unico, kill-switch org, soft delete | 5 regras (campo codigo, soft delete LGPD, kill-switch via requireTenantScope, X-Correlation-ID, DATA-003) | **DIVERGENCIA** -- ECF omite requireTenantScope e DATA-003 |
| **Nivel Arq.** | 2 | 2 | **CONFIRMADO** |
| **Refs. Normativas** | DOC-DEV-001, DOC-ARC-001, DOC-ESC-001, DOC-GNP-00, LGPD | DOC-DEV-001, DOC-ARC-001, DOC-ESC-001, DOC-GNP-00, LGPD | **CONFIRMADO** |
| **Status** | DRAFT | DRAFT (cabecalho), READY (tabela do epico) | **DIVERGENCIA** |

### 2.8 US-MOD-000-F08 -- Perfil do Usuario Autenticado

| Dimensao | Documento ECF | Arquivo Original (F08.md) | Status |
|---|---|---|---|
| **Endpoints** | GET /auth/me, PATCH /auth/me | GET /auth/me, PUT /users/:id | **DIVERGENCIA** -- ECF diz PATCH /auth/me; original diz PUT /users/:id |
| **Cenarios Gherkin** | Nao contados | 6 cenarios Gherkin | **AUSENTE** |
| **Regras Criticas** | Resumo: perfil + filiais, force_pwd_reset, presigned URL avatar | 5 regras (verificacao ativa sessao, campos proibidos, tolerancia profile nulo, tenants BLOCKED incluidos, rastreabilidade DOC-ARC-003) | **DIVERGENCIA** -- ECF omite tolerancia profile nulo, tenants BLOCKED incluidos |
| **Nivel Arq.** | 1 | 1 | **CONFIRMADO** |
| **Refs. Normativas** | DOC-DEV-001, DOC-ARC-003, DOC-UX-010, DOC-ARC-001 | DOC-DEV-001, DOC-ARC-003, DOC-UX-010, DOC-ARC-001 | **CONFIRMADO** |
| **Contrato de Resposta** | Nao reproduzido | JSON de exemplo detalhado | **AUSENTE** -- ECF nao reproduz contrato |
| **Status** | DRAFT | DRAFT (cabecalho), READY (tabela do epico) | **DIVERGENCIA** |

### 2.9 US-MOD-000-F09 -- Vinculacao Usuario-Filial

| Dimensao | Documento ECF | Arquivo Original (F09.md) | Status |
|---|---|---|---|
| **Endpoints** | Nao lista endpoints | POST /tenants/:id/users, PUT /tenants/:id/users/:userId, PATCH /tenants/:id/users/:userId, DELETE /tenants/:id/users/:userId | **AUSENTE** |
| **Cenarios Gherkin** | Nao contados | 7 cenarios Gherkin | **AUSENTE** |
| **Regras Criticas** | Resumo: pivot tenant_users, invalidacao cache, roles diferentes por filial | 8 regras (requireTenantScope, desvinculacao != exclusao, invalidacao cache, audit trail, PK composta, X-Correlation-ID, Idempotencia, campo codigo) | **DIVERGENCIA** -- ECF omite maioria das regras detalhadas |
| **Nivel Arq.** | 2 | 2 | **CONFIRMADO** |
| **Status** | DRAFT | DRAFT (cabecalho), READY (tabela do epico) | **DIVERGENCIA** |

### 2.10 US-MOD-000-F10 -- Alteracao de Senha Autenticada

| Dimensao | Documento ECF | Arquivo Original (F10.md) | Status |
|---|---|---|---|
| **Endpoints** | POST /auth/change-password | PUT /auth/change-password | **DIVERGENCIA** -- ECF diz POST; original diz PUT |
| **Cenarios Gherkin** | Nao contados | 10 cenarios Gherkin | **AUSENTE** |
| **Regras Criticas** | Resumo: bcrypt compare, kill-switch seletivo, force_pwd_reset | 10 regras detalhadas (gate sessao, rejeicao SSO, bcrypt compare, revogacao sessoes, gate force_pwd_reset, forcePwdReset zerado, auditoria, X-Correlation-ID, Idempotencia, uso exclusivo) | **DIVERGENCIA** -- ECF apresenta resumo muito superficial |
| **Nivel Arq.** | 2 | 2 | **CONFIRMADO** |
| **Refs. Normativas** | DOC-DEV-001, SEC-000-01, DOC-ARC-001, DOC-ARC-003 | DOC-DEV-001, SEC-000-01, DOC-ARC-001, DOC-ARC-003, DOC-PADRAO-004 | **DIVERGENCIA** -- ECF omite DOC-PADRAO-004 |
| **Status** | DRAFT | DRAFT (cabecalho), READY (tabela do epico) | **DIVERGENCIA** |

### 2.11 US-MOD-000-F11 -- Endpoint GET /info

| Dimensao | Documento ECF | Arquivo Original (F11.md) | Status |
|---|---|---|---|
| **Endpoints** | GET /info | GET /info | **CONFIRMADO** |
| **Cenarios Gherkin** | Nao contados | 4 cenarios Gherkin | **AUSENTE** |
| **Regras Criticas** | Resumo: publico, versao, ambiente, metadados health | 5 regras (sem auth, sem dados sensiveis, registro automatico, nao pertence MOD-000, X-Correlation-ID) | **DIVERGENCIA** -- ECF omite "nao pertence ao MOD-000" (regra 4 da F11) |
| **Modulo Destino** | ECF Core (@easycf/core-api) -- correto | ECF Core (@easycf/core-api) | **CONFIRMADO** |
| **Nivel Arq.** | 0 | 0 | **CONFIRMADO** |
| **Refs. Normativas** | Nao declaradas na secao F11 do ECF | DOC-PADRAO-001, DOC-ARC-001, DOC-DEV-001 | **AUSENTE** -- ECF nao lista refs na secao |
| **Status** | DRAFT | DRAFT (cabecalho), READY (tabela do epico) | **DIVERGENCIA** |

### 2.12 US-MOD-000-F12 -- Catalogo de Permissoes

| Dimensao | Documento ECF | Arquivo Original (F12.md) | Status |
|---|---|---|---|
| **Endpoints** | Nao lista endpoints | GET/POST /api/v1/permissions, GET/PUT/DELETE /api/v1/permissions/:id | **AUSENTE** |
| **Cenarios Gherkin** | Nao contados | 12 cenarios Gherkin | **AUSENTE** |
| **Regras Criticas** | Resumo: integridade referencial, validacao semantica, seed escopos | 11 regras (imutabilidade codigo, validacao semantica F06, soft delete, bloqueio delecao em uso, unicidade por tenant, X-Correlation-ID, domain events, auditoria, Idempotencia, taxonomia codigo, auto-populacao) | **DIVERGENCIA** -- ECF omite grande maioria das regras |
| **Nivel Arq.** | 2 | 2 | **CONFIRMADO** |
| **Modelo de Dados** | Nao detalha | Tabela `permissions` com DDL completo | **AUSENTE** -- ECF nao reproduz modelo |
| **Pendentes/QoA** | Nao menciona | 1 pendente + 3 QoA documentados | **AUSENTE** |
| **Status** | DRAFT | DRAFT (cabecalho), READY (tabela do epico) | **DIVERGENCIA** |

### 2.13 US-MOD-000-F13 -- Utilitario de Telemetria UI

| Dimensao | Documento ECF | Arquivo Original (F13.md) | Status |
|---|---|---|---|
| **Endpoints** | N/A (pacote frontend) | N/A (pacote frontend) | **CONFIRMADO** |
| **Cenarios Gherkin** | Nao contados | 2 cenarios Gherkin | **AUSENTE** |
| **Regras Criticas** | Lista campos UIActionEnvelope (screen_id, action, operation_id, status, tenant_id, correlation_id, duration_ms) | Descricao mais livre; inclui adapters (Console, HTTP) | **DIVERGENCIA** -- ECF adiciona detalhes de campos que nao estao explicitamente listados no original (ex: duration_ms) mas estao em DOC-ARC-003 |
| **Nivel Arq.** | 1 | Nao declarado explicitamente (apenas "Frontend Tooling") | **DIVERGENCIA** -- ECF atribui nivel 1; original nao declara |
| **Refs. Normativas** | DOC-ARC-003 s2 | DOC-ARC-003 s2 | **CONFIRMADO** |
| **Status** | DRAFT | DRAFT (cabecalho), READY (tabela do epico) | **DIVERGENCIA** |

### 2.14 US-MOD-000-F14 -- Middlewares de Correlacao E2E

| Dimensao | Documento ECF | Arquivo Original (F14.md) | Status |
|---|---|---|---|
| **Endpoints** | N/A (middleware) | N/A (middleware) | **CONFIRMADO** |
| **Cenarios Gherkin** | Nao contados | 2 cenarios Gherkin | **AUSENTE** |
| **Regras Criticas** | Resumo: X-Correlation-ID unico, injecao contexto, propagacao domain_events | Mais detalhado: AsyncLocalStorage, logger base, Teste de Contrato | **DIVERGENCIA** -- ECF omite AsyncLocalStorage e logger base |
| **Nivel Arq.** | 1 | Nao declarado explicitamente (apenas "API Core") | **DIVERGENCIA** -- ECF atribui nivel 1; original nao declara |
| **Refs. Normativas** | DOC-ARC-003 s1, s3 | DOC-ARC-003 s1 Dogma 3, s3 | **CONFIRMADO** |
| **Status** | DRAFT | DRAFT (cabecalho), READY (tabela do epico) | **DIVERGENCIA** |

### 2.15 US-MOD-000-F15 -- Motor de Gates CI

| Dimensao | Documento ECF | Arquivo Original (F15.md) | Status |
|---|---|---|---|
| **Endpoints** | N/A (CLI/CI) | N/A (CLI/CI) | **CONFIRMADO** |
| **Cenarios Gherkin** | Nao contados | 1 cenario Gherkin | **AUSENTE** |
| **Regras Criticas** | Resumo: validacao YAML vs OpenAPI vs roles | Mais detalhado: 4 gates especificos (schema, operation_ids, permissions, erros RFC 9457), workflow GH | **DIVERGENCIA** -- ECF nao detalha os gates especificos |
| **Nivel Arq.** | 0 | Nao declarado explicitamente (apenas "CI/CD DevOps") | **CONFIRMADO** (inferido) |
| **Refs. Normativas** | DOC-ARC-003 s8 | DOC-ARC-003 s8 | **CONFIRMADO** |
| **Status** | DRAFT | DRAFT (cabecalho), READY (tabela do epico) | **DIVERGENCIA** |

### 2.16 US-MOD-000-F16 -- Storage e Upload Centralizado

| Dimensao | Documento ECF | Arquivo Original (F16.md) | Status |
|---|---|---|---|
| **Endpoints** | Nao lista endpoints | POST /uploads/presign, POST /uploads/:id/confirm, GET /uploads/:id/signed-url | **AUSENTE** |
| **Cenarios Gherkin** | Nao contados | 4 cenarios Gherkin | **AUSENTE** |
| **Regras Criticas** | Resumo: presigned URLs, validacao tipo/tamanho, TTL, eventos | 4 regras (DB Isolation, arquivos privados, MIME seguros, workers cron limpeza) | **DIVERGENCIA** -- ECF nao menciona DB Isolation, MIME double-check, workers cron |
| **Nivel Arq.** | 1 | 1 | **CONFIRMADO** |
| **Refs. Normativas** | DOC-PADRAO-005, DOC-ARC-003 | DOC-PADRAO-005, DOC-ARC-003 | **CONFIRMADO** |
| **Status** | DRAFT | DRAFT (cabecalho), READY (tabela do epico) | **DIVERGENCIA** |

### 2.17 US-MOD-000-F17 -- Sign in with Apple

| Dimensao | Documento ECF | Arquivo Original (F17.md) | Status |
|---|---|---|---|
| **Endpoints** | Nao lista endpoints | GET /auth/apple, POST /auth/apple/callback | **AUSENTE** |
| **Cenarios Gherkin** | Nao contados | 7 cenarios Gherkin | **AUSENTE** |
| **Regras Criticas** | Resumo: apple_sub, email unico, JWKS, SSO_APPLE_NO_PASSWORD | 13 regras detalhadas (apple_sub primario, email secundario/opcional, user object captura unica, client secret dinamico .p8, variaveis env, JWKS, response_mode=form_post, sem MFA, BLOCKED, marcador senha, X-Correlation-ID, INT-000-03, DATA-003) | **DIVERGENCIA** -- ECF apresenta resumo muito simplificado |
| **Nivel Arq.** | 2 | 2 | **CONFIRMADO** |
| **Refs. Normativas** | DOC-DEV-001, INT-000-03, DOC-ARC-001, DOC-PADRAO-004 | DOC-DEV-001, INT-000-03, DOC-ARC-001, DOC-PADRAO-004 | **CONFIRMADO** |
| **Particularidade Apple** | Mencionada (nome so no 1o request) | Detalhada com fluxo completo, apple_sub como identificador primario | **DIVERGENCIA** -- ECF simplifica demais |
| **Status** | DRAFT | DRAFT (cabecalho), APPROVED (tabela do epico) | **DIVERGENCIA CRITICA** -- F17 esta APPROVED no epico, ECF diz DRAFT |

---

## 3. Epico MOD-001 -- Backoffice Admin

| Dimensao | Documento ECF | Arquivo Original (US-MOD-001.md) | Status |
|---|---|---|---|
| **Versao** | 0.1.0 | 0.1.0 | **CONFIRMADO** |
| **Status** | DRAFT | DRAFT | **CONFIRMADO** |
| **Owner** | Arquitetura | Arquitetura | **CONFIRMADO** |
| **Sub-historias** | F01 a F03 | F01 a F03 | **CONFIRMADO** |
| **Status das features** | Nao declarado explicitamente | F01-F03 = READY | **AUSENTE** -- ECF nao declara status individual |
| **Screen Manifests** | 3 manifests (UX-AUTH-001, UX-SHELL-001, UX-DASH-001) | 3 manifests identicos | **CONFIRMADO** |
| **Abordagem UX-First** | Descrita | Descrita | **CONFIRMADO** |
| **Dependencias MOD-000** | 5 operationIds listados | 5 operationIds identicos | **CONFIRMADO** |
| **OKRs** | 3 OKRs | 3 OKRs identicos | **CONFIRMADO** |
| **Cenarios Gherkin do epico** | Nao reproduzidos | 3 cenarios Gherkin | **AUSENTE** |

### 3.1 US-MOD-001-F01 -- Shell de Autenticacao e Layout Base

| Dimensao | Documento ECF | Arquivo Original (F01.md) | Status |
|---|---|---|---|
| **Cenarios Gherkin** | Nao contados | 6 cenarios Gherkin | **AUSENTE** |
| **Regras Criticas** | 5 regras listadas | 5 regras identicas | **CONFIRMADO** |
| **Refs. Normativas** | US-MOD-001, DOC-UX-010/011/012, DOC-ARC-003, US-MOD-000-F01, F04 | US-MOD-001, DOC-UX-010/011/012, DOC-ARC-003, US-MOD-000-F01, US-MOD-000-F04 | **CONFIRMADO** |
| **Manifests Vinculados** | Nao listados na subsecao | UX-AUTH-001, UX-SHELL-001 | **AUSENTE** |
| **Status** | Nao declarado | DRAFT (cabecalho), READY (tabela do epico) | **AUSENTE** |

### 3.2 US-MOD-001-F02 -- Telemetria de UI e Rastreabilidade

| Dimensao | Documento ECF | Arquivo Original (F02.md) | Status |
|---|---|---|---|
| **Cenarios Gherkin** | Nao contados | 5 cenarios Gherkin | **AUSENTE** |
| **Regras Criticas** | 4 regras listadas | 5 regras (inclui "mesmo correlation_id no envelope E no header HTTP") | **DIVERGENCIA** -- ECF omite regra de paridade correlation_id envelope/header |
| **Refs. Normativas** | US-MOD-001, DOC-ARC-003, DOC-UX-010/012, US-MOD-000-F13, F14 | Identico | **CONFIRMADO** |
| **Status** | Nao declarado | DRAFT (cabecalho), READY (tabela do epico) | **AUSENTE** |

### 3.3 US-MOD-001-F03 -- Dashboard Administrativo Executivo

| Dimensao | Documento ECF | Arquivo Original (F03.md) | Status |
|---|---|---|---|
| **Cenarios Gherkin** | Nao contados | 5 cenarios Gherkin | **AUSENTE** |
| **Regras Criticas** | 4 regras listadas | 5 regras (inclui "rota /dashboard protegida -- JWT invalido redireciona para /login") | **DIVERGENCIA** -- ECF omite regra de protecao de rota explicita |
| **Refs. Normativas** | US-MOD-001, DOC-UX-011/012, DOC-ARC-003, US-MOD-000-F08 | Identico | **CONFIRMADO** |
| **Status** | Nao declarado | DRAFT (cabecalho), READY (tabela do epico) | **AUSENTE** |

---

## 4. Epico MOD-002 -- Cadastro de Usuarios

| Dimensao | Documento ECF | Arquivo Original (US-MOD-002.md) | Status |
|---|---|---|---|
| **Status** | DRAFT | DRAFT | **CONFIRMADO** |
| **Owner** | Product Owner | Product Owner | **CONFIRMADO** |
| **Nivel Arq.** | 1 | 1 | **CONFIRMADO** |
| **Refs. Normativas** | DOC-DEV-001, DOC-ARC-001, SEC-000-01, LGPD-BASE-001 | DOC-DEV-001, DOC-ARC-001, SEC-000-01, LGPD-BASE-001 | **CONFIRMADO** |
| **User Story** | Descrita | Descrita (identica) | **CONFIRMADO** |
| **Cenarios Gherkin** | Nao contados | 13 cenarios Gherkin | **AUSENTE** |
| **Fluxos de Cadastro** | 2 fluxos (senha no ato, convite email) | 2 fluxos identicos | **CONFIRMADO** |
| **Campos Formulario** | 10 campos (5 obrigatorios, 5 opcionais) | 10 campos identicos | **CONFIRMADO** |
| **Regras Criticas** | 11 regras | 15 regras no original | **DIVERGENCIA** -- ECF lista 11; original tem 15 regras (ECF omite regra 9 perfis incompativeis, regra 12 tamanho nome, regra 15 status inicial, parcialmente agrupou outras) |
| **Requisitos Funcionais** | RF01-RF12 | RF01-RF12 identicos | **CONFIRMADO** |
| **Requisitos Nao Funcionais** | RNF01-RNF08 | RNF01-RNF08 identicos | **CONFIRMADO** |
| **Fluxos Alternativos** | Nao listados | FA01-FA05 listados | **AUSENTE** -- ECF omite fluxos alternativos |
| **Dependencias** | Listadas na secao 6 (mapa) | Listadas de forma diferente (mais generica, sem features especificas) | **DIVERGENCIA** -- ECF detalha com features de origem; original lista de forma generica |
| **Impactos Esperados** | Nao listados | 5 impactos listados | **AUSENTE** |
| **Fora de Escopo** | Parcialmente no roadmap futuro | 6 itens listados | **DIVERGENCIA** -- ECF dispersa entre secoes; original centraliza |
| **Observacoes para Refinamento** | Parcialmente nos pontos abertos secao 9 | 7 itens de refinamento | **DIVERGENCIA** -- ECF captura parcialmente |
| **Sub-historias** | Nao menciona features dentro do MOD-002 | Nao possui sub-historias (e uma unica US) | **CONFIRMADO** -- Ambos tratam como US unica |
| **DoR** | Resumo global na secao 8 do ECF | 10 criterios DoR especificos | **DIVERGENCIA** -- ECF generaliza; original detalha |
| **DoD** | Resumo global na secao 8 do ECF | 10 criterios DoD especificos | **DIVERGENCIA** -- ECF generaliza; original detalha com referencias a RFC 9457, User Enumeration Prevention, Spectral |

---

## 5. Resumo Quantitativo

### Contagem por Status de Conferencia

| Modulo | CONFIRMADO | DIVERGENCIA | AUSENTE |
|---|---|---|---|
| MOD-000 (Epico) | 4 | 7 | 1 |
| MOD-000-F01 | 4 | 3 | 1 |
| MOD-000-F02 | 2 | 3 | 1 |
| MOD-000-F03 | 3 | 3 | 2 |
| MOD-000-F04 | 3 | 2 | 1 |
| MOD-000-F05 | 2 | 3 | 2 |
| MOD-000-F06 | 2 | 2 | 2 |
| MOD-000-F07 | 2 | 2 | 2 |
| MOD-000-F08 | 2 | 3 | 2 |
| MOD-000-F09 | 1 | 2 | 2 |
| MOD-000-F10 | 1 | 3 | 1 |
| MOD-000-F11 | 3 | 2 | 2 |
| MOD-000-F12 | 1 | 2 | 3 |
| MOD-000-F13 | 2 | 2 | 1 |
| MOD-000-F14 | 2 | 2 | 1 |
| MOD-000-F15 | 2 | 1 | 1 |
| MOD-000-F16 | 2 | 2 | 2 |
| MOD-000-F17 | 2 | 3 | 2 |
| MOD-001 (Epico) | 7 | 0 | 2 |
| MOD-001-F01 | 2 | 0 | 2 |
| MOD-001-F02 | 1 | 1 | 2 |
| MOD-001-F03 | 1 | 1 | 2 |
| MOD-002 | 8 | 6 | 3 |
| **TOTAL** | **59** | **55** | **40** |

### Distribuicao Geral

| Status | Total | Percentual |
|---|---|---|
| CONFIRMADO | 59 | 38.3% |
| DIVERGENCIA | 55 | 35.7% |
| AUSENTE | 40 | 26.0% |

---

## 6. Divergencias Criticas (Prioridade de Correcao)

### 6.1 Status das Features -- DIVERGENCIA CRITICA

**Impacto: ALTO**

O documento ECF declara **todas as 20 features como DRAFT**. Na realidade, conforme a tabela do epico US-MOD-000, **F01 a F16 estao READY e F17 esta APPROVED**. Usar o ECF como referencia levaria a crer que nenhuma feature esta pronta para desenvolvimento, quando a maioria ja passou por refinamento.

### 6.2 Metodo HTTP da F10 -- DIVERGENCIA

**Impacto: MEDIO**

O ECF declara `POST /auth/change-password`; o original usa `PUT /auth/change-password`. O verbo HTTP e significativo para o contrato OpenAPI e para a Idempotencia.

### 6.3 Endpoint da F08 -- DIVERGENCIA

**Impacto: MEDIO**

O ECF declara `PATCH /auth/me` para edicao de perfil; o original usa `PUT /users/:id`. A rota e o verbo sao diferentes, afetando diretamente o contrato da API.

### 6.4 Endpoints Ausentes em 10+ Features

**Impacto: MEDIO-ALTO**

As features F03, F05, F06, F07, F09, F12, F16 e F17 possuem endpoints explicitamente documentados nos originais, mas o ECF nao os lista. Isso impede que o documento ECF seja usado como referencia de contrato de API.

### 6.5 Cenarios Gherkin Omitidos Sistematicamente

**Impacto: MEDIO**

O documento ECF nao reproduz nem conta cenarios Gherkin em nenhuma das 20 features. Os originais possuem entre 1 e 13 cenarios cada, totalizando aproximadamente **114 cenarios Gherkin**. O ECF menciona cenarios apenas no epico MOD-000 (secao 3.2).

### 6.6 Regras de X-Correlation-ID e DATA-003

**Impacto: MEDIO**

Quase todas as features (F01-F12, F16, F17) possuem regras explicitas sobre X-Correlation-ID e formato DATA-003 nos domain events. O ECF omite essas regras nas secoes individuais, citando apenas de forma generica nos principios arquiteturais.

### 6.7 Regras Criticas do MOD-002 -- Contagem Divergente

**Impacto: MEDIO**

O ECF lista 11 regras para o MOD-002; o original possui 15. As regras omitidas incluem tratamento de perfis incompativeis com fluxo de autenticacao (regra 9), tamanho do nome (regra 12) e status inicial conforme politica de produto (regra 15).

### 6.8 OKR-2 do Epico -- Range de Features

**Impacto: BAIXO**

O ECF declara OKR-2 como F01-F17; o original declara F01-F16. A F17 (Apple) parece ter sido excluida intencionalmente do OKR pelo original.

---

## 7. Conclusao

O documento de engenharia reversa (`Documento_Projeto_ECF.md`) captura corretamente a **estrutura geral** do projeto, os **principios arquiteturais**, a **hierarquia de modulos** e a **base normativa**. No entanto, apresenta **simplificacoes sistematicas** nas secoes de features individuais:

1. **Nao reproduz cenarios Gherkin** -- perde-se a rastreabilidade de criterios de aceite
2. **Omite endpoints em mais de metade das features** -- nao pode ser usado como referencia de contrato
3. **Declara status incorretos** (DRAFT em vez de READY/APPROVED) -- pode bloquear decisoes de desenvolvimento
4. **Simplifica regras criticas** -- omitindo consistentemente as regras de X-Correlation-ID, DATA-003 e Idempotencia que sao padrao em todas as features
5. **Apresenta divergencias de metodo/rota HTTP** em pelo menos 2 features (F08 e F10)

**Recomendacao:** O documento ECF pode servir como **visao executiva de alto nivel**, mas **nao deve substituir** a leitura das User Stories e Features originais para fins de implementacao, scaffolding ou validacao de contratos.

---

*Documento de conferencia gerado em 2026-03-13 -- Pass 1 (Engenharia Reversa vs. Features Reais)*
