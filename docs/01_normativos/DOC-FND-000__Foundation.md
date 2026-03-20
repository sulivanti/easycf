# DOC-FND-000 — Contratos Fundacionais (Foundation)

- **id:** DOC-FND-000
- **version:** 1.7.0
- **status:** ACTIVE
- **data_ultima_revisao:** 2026-03-18
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

Todas as permissões do sistema seguem o formato `dominio:entidade:acao` (regex: `^[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*){1,2}$`). O formato com 3 segmentos é o padrão canônico — permite distinguir entidades dentro do mesmo domínio (ex: `users:user:read` vs `users:role:read`).

### 2.2 Catálogo de Scopes Fundacionais

O Foundation define os scopes base do sistema. Todo módulo que adiciona novos scopes DEVE registrá-los via PR atualizando o catálogo canônico.

| Scope | Módulo | Descrição |
|---|---|---|
| `users:user:read` | MOD-000 | Visualizar lista e detalhes de usuários |
| `users:user:write` | MOD-000 | Criar e editar usuários |
| `users:user:delete` | MOD-000 | Remover usuários (soft-delete) |
| `users:user:import` | MOD-000 | Importar usuários em lote |
| `users:user:export` | MOD-000 | Exportar dados de usuários |
| `users:user:comment` | MOD-000 | Comentar em registros de usuários |
| `users:role:read` | MOD-000 | Visualizar papéis e permissões |
| `users:role:write` | MOD-000 | Criar e editar papéis |
| `tenants:branch:read` | MOD-000 | Visualizar dados do tenant/filial |
| `tenants:branch:write` | MOD-000 | Editar configurações do tenant/filial |
| `system:audit:read` | MOD-000 | Visualizar logs de auditoria |
| `system:audit:sensitive` | MOD-000 | Acesso a campos sensíveis em logs de auditoria |
| `org:unit:read` | MOD-003 | Visualizar a estrutura organizacional e árvore |
| `org:unit:write` | MOD-003 | Criar, editar e restaurar nós organizacionais e vínculos de tenant |
| `org:unit:delete` | MOD-003 | Desativar nós e remover vínculos |
| `process:cycle:read` | MOD-005 | Visualizar ciclos, estágios, gates, papéis e transições |
| `process:cycle:write` | MOD-005 | Criar e editar elementos do blueprint de processo |
| `process:cycle:publish` | MOD-005 | Publicar ciclo — promove DRAFT → PUBLISHED |
| `process:cycle:delete` | MOD-005 | Soft-delete de elementos do blueprint de processo |
| `identity:org_scope:read` | MOD-004 | Visualizar vínculos organizacionais de usuários |
| `identity:org_scope:write` | MOD-004 | Criar e remover vínculos organizacionais |
| `identity:share:read` | MOD-004 | Visualizar compartilhamentos de acesso |
| `identity:share:write` | MOD-004 | Criar compartilhamentos de acesso |
| `identity:share:revoke` | MOD-004 | Revogar compartilhamentos de acesso |
| `identity:share:authorize` | MOD-004 | Permitir auto-autorização em compartilhamentos (grantor = authorized_by) |
| `identity:delegation:read` | MOD-004 | Visualizar delegações temporárias (admin) |
| `identity:delegation:write` | MOD-004 | Criar delegações temporárias (admin — endpoints self-service não requerem scope) |
| `process:case:read` | MOD-006 | Visualizar casos, histórico, gates, responsáveis e eventos |
| `process:case:write` | MOD-006 | Abrir casos, transitar estágios, registrar eventos |
| `process:case:cancel` | MOD-006 | Cancelar caso (ação crítica separada) |
| `process:case:gate_resolve` | MOD-006 | Resolver gates (aprovar/rejeitar) |
| `process:case:gate_waive` | MOD-006 | Dispensar gate obrigatório (poder especial) |
| `process:case:assign` | MOD-006 | Atribuir e reatribuir responsáveis |
| `process:case:reopen` | MOD-006 | Reabrir caso COMPLETED (ação excepcional auditada) |
| `storage:file:upload` | MOD-000 | Upload de arquivos via presigned URL |
| `storage:file:read` | MOD-000 | Leitura/download de arquivos armazenados |
| `approval:rule:read` | MOD-009 | Visualizar regras de controle e alçadas |
| `approval:rule:write` | MOD-009 | Criar e editar regras de controle e alçada |
| `approval:engine:evaluate` | MOD-009 | Avaliar operação no motor de controle (usado por módulos chamadores) |
| `approval:movement:read` | MOD-009 | Visualizar movimentos controlados |
| `approval:movement:write` | MOD-009 | Cancelar movimentos (pelo solicitante) |
| `approval:decide` | MOD-009 | Aprovar ou reprovar movimentos no inbox |
| `approval:override` | MOD-009 | Override com justificativa obrigatória |
| `mcp:agent:read` | MOD-010 | Visualizar agentes MCP e detalhes |
| `mcp:agent:write` | MOD-010 | Criar e editar agentes MCP |
| `mcp:agent:revoke` | MOD-010 | Revogar agentes MCP (irreversível) |
| `mcp:agent:phase2-enable` | MOD-010 | Habilitar Phase 2 create para agente individual |
| `mcp:key:rotate` | MOD-010 | Rotacionar API key de agente MCP |
| `mcp:execution:read` | MOD-010 | Visualizar log de execuções MCP |

> **Regra de validação (Gate 3 — DOC-ARC-003B):** Todo scope referenciado em Screen Manifests DEVE existir neste catálogo. O CI DEVE falhar se encontrar scope não registrado.

### 2.3 Regra de Proteção

- Frontend: menus/rotas DEVEM ser ocultados se o usuário não possuir o scope correspondente (decisão UX, não substitui proteção de rota)
- Backend: todo endpoint protegido DEVE exigir `requireScope('users:user:read')` no `preHandler` (enforcement real)

---

## 3. SEC-002 — Matriz de Autorização de Eventos

### 3.1 Propósito

A SEC-002 define quem pode **emitir**, **visualizar** e **ser notificado** de cada tipo de evento do sistema. Todo módulo que implementa domain events DEVE declarar sua matriz seguindo este modelo.

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

---

## Apêndice — Exemplos Canônicos (EX-*)

> Âncoras referenciáveis por módulos via `referencias_exemplos`. Cada ID é único e rastreável pelo Gate de IDs (EX-CI-007).

### EX-AUTH-001 — Middleware RBAC (requireScope)

Padrão de enforcement de permissão no `preHandler` do Fastify. Toda rota protegida DEVE usar este padrão.

```typescript
// apps/api/src/infra/auth/require-scope.ts
import { FastifyRequest, FastifyReply } from 'fastify';

export function requireScope(...scopes: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const userScopes: string[] = request.user?.scopes ?? [];

    const hasAll = scopes.every((s) => userScopes.includes(s));
    if (!hasAll) {
      return reply.status(403).send({
        type: 'https://api.easya2.com/errors/forbidden',
        title: 'Forbidden',
        status: 403,
        detail: `Missing required scope(s): ${scopes.join(', ')}`,
        correlationId: request.headers['x-correlation-id'],
      });
    }
  };
}

// Uso no handler:
app.get(
  '/api/v1/users',
  { preHandler: [requireScope('users:user:read')] },
  listUsersHandler,
);
```

### EX-PII-001 — Mascaramento de PII em logs e respostas

Dados pessoais identificáveis (PII) DEVEM ser mascarados em logs, payloads de auditoria e respostas de timeline. O padrão abaixo aplica-se a qualquer campo sensível.

```typescript
// apps/api/src/infra/logging/pii-mask.ts

const PII_FIELDS = ['email', 'cpf', 'phone', 'name', 'document'];

export function maskPII(obj: Record<string, unknown>): Record<string, unknown> {
  const masked = { ...obj };
  for (const key of Object.keys(masked)) {
    if (PII_FIELDS.includes(key.toLowerCase())) {
      const val = String(masked[key]);
      masked[key] = val.length > 4
        ? val.slice(0, 2) + '***' + val.slice(-2)
        : '***';
    }
  }
  return masked;
}

// Uso em logger:
logger.info({ event: 'user_created', payload: maskPII(userData) });
// Resultado: { email: "jo***om", cpf: "12***90", name: "Jo***es" }
```

### EX-SEC-001 — Checklist de segurança por módulo

Todo módulo DEVE validar os seguintes controles no PR de entrega. Este checklist é o padrão mínimo de segurança aplicável a qualquer módulo.

```markdown
## SEC Checklist — MOD-XXX

- [ ] Todos os endpoints protegidos usam `requireScope()` (EX-AUTH-001)
- [ ] PII mascarada em logs e auditoria (EX-PII-001)
- [ ] Validação de input via Zod schemas na borda (Fastify)
- [ ] Rate limiting configurado (herdado MOD-000 ou customizado)
- [ ] Queries parametrizadas (Drizzle ORM, sem SQL raw não sanitizado)
- [ ] Secrets fora do repositório (variáveis de ambiente, scanner no CI)
- [ ] Domain events com `correlation_id` e sem PII no payload
- [ ] Testes de segurança (tentativa de acesso sem scope, com scope errado)
```

### EX-SEC-002 — Validação de integridade de comandos emissores

Comandos que emitem domain events DEVEM validar a integridade do emissor (quem disparou a ação). O padrão garante que o `actor_id` no evento corresponde ao usuário autenticado.

```typescript
// apps/api/src/infra/events/validate-emitter.ts
import { FastifyRequest } from 'fastify';

interface DomainEventPayload {
  event_type: string;
  actor_id: string;
  tenant_id: string;
  correlation_id: string;
  [key: string]: unknown;
}

export function validateEmitterIntegrity(
  request: FastifyRequest,
  payload: DomainEventPayload,
): void {
  if (payload.actor_id !== request.user.id) {
    throw new Error(
      `Emitter mismatch: token user ${request.user.id} ≠ payload actor ${payload.actor_id}`,
    );
  }
  if (payload.tenant_id !== request.user.tenant_id) {
    throw new Error(
      `Tenant mismatch: token tenant ${request.user.tenant_id} ≠ payload tenant ${payload.tenant_id}`,
    );
  }
}

// Uso no use case antes de emitir evento:
validateEmitterIntegrity(request, {
  event_type: 'UserCreated',
  actor_id: request.user.id,
  tenant_id: request.user.tenant_id,
  correlation_id: request.headers['x-correlation-id'],
});
```

---

## CHANGELOG

- v1.7.0 (2026-03-19): §2.2 — Adiciona 6 scopes MOD-010 (MCP e Automação Governada): `mcp:agent:read/write/revoke/phase2-enable`, `mcp:key:rotate`, `mcp:execution:read`. Referência: PEN-010 PENDENTE-004, Amendment DOC-FND-000-M04.
- v1.6.0 (2026-03-19): §2.2 — Adiciona 7 scopes MOD-009 (Movimentos sob Aprovação): `approval:rule:read/write`, `approval:engine:evaluate`, `approval:movement:read/write`, `approval:decide`, `approval:override`. Referência: PEN-009 PEN-009-002, Amendment DOC-FND-000-M03.
- v1.5.0 (2026-03-19): §2.2 — Adiciona 7º scope MOD-006: `process:case:reopen` (reabertura excepcional auditada). Total: 7 scopes `process:case:*`. Referência: PEN-006 PENDENTE-001. Apêndice — 4 exemplos canônicos adicionados (EX-AUTH-001, EX-PII-001, EX-SEC-001, EX-SEC-002).
- v1.4.0 (2026-03-19): §2.2 — Adiciona 6 scopes MOD-006 (Execução de Casos): `process:case:read/write/cancel/gate_resolve/gate_waive/assign`. Referência: PEN-006 PENDENTE-004, US-MOD-006, SEC-006 §2.1.
- v1.3.0 (2026-03-18): §2.2 — Adiciona 2 scopes de Storage fundacional: `storage:file:upload`, `storage:file:read`. Referência: PEN-000 PENDENTE-007, SEC-000 §2.
- v1.2.0 (2026-03-17): §2.1 — Formato de scopes atualizado de `recurso:acao` (2 seg.) para `dominio:entidade:acao` (3 seg.) como padrão canônico. §2.2 — Catálogo migrado para 3 segmentos, coluna Módulo adicionada, 3 scopes MOD-003 (`org:unit:read/write/delete`) registrados. Referência: US-MOD-003, VAL MOD-001.
- v1.1.0 (2026-03-17): §2.2 — Adiciona 4 scopes do MOD-005 (Modelagem de Processos): `process:cycle:read/write/publish/delete`. Referência: US-MOD-005, SEC-005, INT-005.
- v1.0.0 (2026-03-15): Criação do documento. Contratos extraídos de DOC-UX-011, DOC-UX-012, DOC-ARC-001, DOC-ARC-003, DOC-ARC-003B e DOC-PADRAO-005 para eliminar acoplamento direto entre normativos e `04_modules/mod-000-foundation/`.

---

## Metadados

> Bloco de metadados canônico (padrão DOC-PADRAO-META v1.0.0).
