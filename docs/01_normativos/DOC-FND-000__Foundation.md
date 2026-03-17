# DOC-FND-000 — Contratos Fundacionais (Foundation)

- **id:** DOC-FND-000
- **version:** 1.1.0
- **status:** ACTIVE
- **data_ultima_revisao:** 2026-03-17
- **owner:** arquitetura
- **scope:** global (contratos abstratos do módulo fundacional)

> **Escopo deste documento:** Define os **contratos abstratos** do núcleo fundacional do sistema — autenticação, RBAC, eventos de segurança, telemetria, tratamento de erros e storage. A **implementação concreta** desses contratos reside em `04_modules/mod-000-foundation/`. Documentos normativos DEVEM referenciar este DOC-FND-000 e nunca artefatos concretos de `04_modules/`.

---

## 1. Autenticação e Sessões (Auth)

### 1.1 Auth Flow

O módulo Foundation DEVE prover um fluxo completo de autenticação que inclui:

- **Login nativo** com e-mail e senha (bcrypt compare)
- **SSO** via provedores externos (quando habilitado)
- **MFA** (Multi-Factor Authentication) como camada opcional configurável por tenant
- **Kill-switch de sessão** em banco (invalidação imediata de todas as sessões ativas de um usuário)

### 1.2 Session Model

- Sessões DEVEM ser armazenadas em banco (não apenas JWT stateless) para permitir kill-switch
- O endpoint canônico de perfil é `GET /auth/me`, retornando: nome, e-mail, avatar, tenant ativo, branch ativa e array de `scopes` (permissões)
- Domain events DEVEM ser emitidos conforme o catálogo abaixo:

| Ação | `event_type` | Payload mínimo |
|---|---|---|
| Login bem-sucedido | `auth.login_success` | `user_id`, `tenant_id`, `session_id`, `correlation_id` |
| Login falhado | `auth.login_failed` | `identifier` (não e-mail), `reason`, `correlation_id` |
| Logout | `auth.logout` | `user_id`, `session_id`, `correlation_id` |
| Alteração de senha | `auth.password_changed` | `user_id`, `correlation_id` |

> **Nota:** O campo `identifier` em `auth.login_failed` NÃO DEVE conter e-mail ou PII — usar apenas um identificador opaco ou username truncado. O padrão `<domain>.<action>` segue a convenção de DOC-PADRAO-005 §8.

### 1.3 Contratos de Funcionalidades Auth

| Funcionalidade | Contrato | Descrição |
|---|---|---|
| Perfil autenticado | `GET /auth/me` | Retorna dados do usuário e permissões no tenant ativo |
| Alteração de senha | `POST /auth/change-password` | Requer sessão ativa, bcrypt compare da senha atual |
| Logout | `POST /auth/logout` | Invalida sessão ativa no banco |

---

## 2. RBAC — Catálogo Canônico de Permissões

### 2.1 Formato de Permissões

Todas as permissões do sistema seguem o formato `recurso:acao` (regex: `^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*$`).

### 2.2 Catálogo de Scopes Fundacionais

O Foundation define os scopes base do sistema. Todo módulo que adiciona novos scopes DEVE registrá-los via PR atualizando o catálogo canônico.

| Scope | Descrição |
|---|---|
| `users:read` | Visualizar lista e detalhes de usuários |
| `users:write` | Criar e editar usuários |
| `users:delete` | Remover usuários (soft-delete) |
| `roles:read` | Visualizar papéis e permissões |
| `roles:write` | Criar e editar papéis |
| `tenants:read` | Visualizar dados do tenant |
| `tenants:write` | Editar configurações do tenant |
| `audit:read` | Visualizar logs de auditoria |
| `audit:sensitive` | Acesso a campos sensíveis em logs de auditoria |
| `users:import` | Importar usuários em lote |
| `users:export` | Exportar dados de usuários |
| `users:comment` | Comentar em registros de usuários |
| `process:cycle:read` | Visualizar ciclos, estágios, gates, papéis e transições (MOD-005) |
| `process:cycle:write` | Criar e editar elementos do blueprint de processo (MOD-005) |
| `process:cycle:publish` | Publicar ciclo — promove DRAFT → PUBLISHED (MOD-005) |
| `process:cycle:delete` | Soft-delete de elementos do blueprint de processo (MOD-005) |

> **Regra de validação (Gate 3 — DOC-ARC-003B):** Todo scope referenciado em Screen Manifests DEVE existir neste catálogo. O CI DEVE falhar se encontrar scope não registrado.

### 2.3 Regra de Proteção

- Frontend: menus/rotas DEVEM ser ocultados se o usuário não possuir o scope correspondente (decisão UX, não substitui proteção de rota)
- Backend: todo endpoint protegido DEVE exigir `requireScope('users:read')` no `preHandler` (enforcement real)

---

## 3. SEC-EventMatrix — Matriz de Autorização de Eventos

### 3.1 Propósito

A SEC-EventMatrix define quem pode **emitir**, **visualizar** e **ser notificado** de cada tipo de evento do sistema. Todo módulo que implementa domain events DEVE declarar sua matriz seguindo este modelo.

### 3.2 Modelo Canônico

| Campo | Descrição |
|---|---|
| `action` | Ação que origina o evento (ex: `user_create`, `password_change`) |
| `event_type` | Tipo do domain event (ex: `UserCreated`, `PasswordChanged`) |
| `emit_perm` | Scope necessário para executar a ação que emite o evento |
| `view` | Regra de visualização: ACL da entity + tenant isolation |
| `notify` | Canais de notificação: e-mail, push, webhook |

### 3.3 Regras (MUST)

- `x-permissions` no OpenAPI é **documentação**; enforcement real segue: permissão do comando (emit), ACL da entity + tenant (view), `sensitivity_level` como guard-rail/mascaramento
- Endpoints de timeline/notifications que expõem "quem pode" DEVEM documentar `x-permissions` no OpenAPI

---

## 4. Telemetria — Contrato UI-Telemetry

### 4.1 Propósito

O rastreio intencional da UI para a API é padronizado via um pacote utilitário instanciável (`ui-telemetry`). A padronização ocorre no Envelope (payload) de Tracking/Observabilidade que as aplicações client-side emitem.

### 4.2 Contrato `UIActionEnvelope`

A interface gráfica de todos os aplicativos DEVE padronizar o envio de telemetria de ação usando o contrato `UIActionEnvelope` (definido em DOC-ARC-003 §2). O pacote `ui-telemetry` abstrai este contrato para o desenvolvedor frontend.

---

## 5. Tratamento de Erros (Error Handling)

### 5.1 Contrato RFC 9457

O Foundation define que todo erro HTTP retornado pela API DEVE seguir o padrão **Problem Details for HTTP APIs (RFC 9457)**, contendo:

| Propriedade | Obrigatória | Descrição |
|---|---|---|
| `type` | MUST | URI de referência do erro |
| `title` | MUST | Título amigável |
| `detail` | MUST | Mensagem voltada ao usuário |
| `status` | MUST | Código HTTP numérico |
| `correlationId` | MUST | Cópia do `X-Correlation-ID` para rastreamento |

### 5.2 Regra de Consumo pelo Frontend

O interceptor HTTP global do Application Shell DEVE verificar se a estrutura do payload segue RFC 9457 e exibir o `detail` via Notification System (Toast/Modal), incluindo o `correlationId` de forma visível ou copiável.

---

## 6. Storage — Categorias Fundacionais

### 6.1 Entity Types Fundacionais

O Foundation define os entity types base para o sistema de uploads e storage (DOC-PADRAO-005).

| entity_type | Purposes permitidos | Observações |
|---|---|---|
| `user` | `avatar`, `attachment` | Avatar: único ativo por usuário |
| `tenant` | `attachment` | Documentos do tenant |

> Módulos futuros DEVEM adicionar seus entity types na tabela canônica de DOC-PADRAO-005 §10 via PR.

---

## CHANGELOG

- v1.1.0 (2026-03-17): §2.2 — Adiciona 4 scopes do MOD-005 (Modelagem de Processos): `process:cycle:read/write/publish/delete`. Referência: US-MOD-005, SEC-005, INT-005.
- v1.0.0 (2026-03-15): Criação do documento. Contratos extraídos de DOC-UX-011, DOC-UX-012, DOC-ARC-001, DOC-ARC-003, DOC-ARC-003B e DOC-PADRAO-005 para eliminar acoplamento direto entre normativos e `04_modules/mod-000-foundation/`.

---

## Metadados

> Bloco de metadados canônico (padrão DOC-PADRAO-META v1.0.0).
