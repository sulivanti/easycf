# US-MOD-000-F01 — Autenticação Nativa com E-mail, Senha e Gerenciamento de Sessão

**Status Ágil:** `DRAFT`
**Data:** 2026-03-05
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-000** (Foundation — Auth Core)
**Referências Normativas:** DOC-DEV-001 §4.1 (FR), §4.4 (SEC), §5.3 (API) | SEC-000-01 | DOC-ARC-001 | DOC-GNP-00

## Metadados de Governança

- **status_agil:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-06
- **rastreia_para:** US-MOD-000, DOC-DEV-001, DOC-ARC-001, DOC-ARC-002, DOC-ARC-003, DOC-GNP-00, DOC-PADRAO-004, SEC-000-01
- **nivel_arquitetura:** 2 (DDD — domain events, sessão em banco, kill-switch)
- **referencias_exemplos:** N/A
- **evidencias:** *(adicionar links de PR/issue ao longo do refinamento)*
- **wave_entrega:** Wave 1
- **epico_pai:** US-MOD-000
- **manifests_vinculados:** ux-auth-001
- **pendencias:** N/A

---

## 1. Contexto e Problema

O sistema EasyA2 possui um conjunto robusto de rotas de autenticação implementado em `apps/api/src/modules/auth/auth.routes.ts`, porém **nenhuma User Story formaliza os requisitos funcionais, as regras de segurança, os contratos de API e os critérios de aceite** que esse módulo deve satisfazer.

Sem essa formalização ocorre o risco de: regras de segurança críticas (rate limiting, user enumeration prevention, kill-switch) serem revertidas sem revisão; testes de contrato divergirem do comportamento real; novos desenvolvedores não compreenderem o modelo de sessão ancorada no banco (Kill-Switch).

O modelo de sessão implementado **não é stateless puro** — o JWT carrega um `sessionId` que é validado em banco a cada requisição. Isso é um desvio intencional de stateless JWT clássico, justificado pela necessidade de Kill-Switch imediato.

---

## 2. A Solução (Linguagem de Negócio)

Como **usuário do sistema**, quero fazer login com meu e-mail e senha para receber tokens de acesso e poder acessar as rotas protegidas da plataforma.

### Fluxo Completo de Autenticação

```text
[Usuário]
   ├─ POST /auth/login  {email, password, remember_me?, device_fp?}
   │       ├─ [Rate Limit: 10 req / 15min / IP]
   │       ├─ [Verifica status: ACTIVE, BLOCKED, PENDING...]
   │       ├─ [Valida bcrypt(password) vs passwordHash]
   │       ├─ [MFA configurado?]
   │       │     ├─ SIM → {mfa_required: true, temp_token, expires_in:300}
   │       │     └─ NÃO → cria UserSession + emite JWT
   │       └─ [Auditoria: auth.login.success | Evento: session.created]
   │
   ├─ POST /auth/logout           → isRevoked=true + audit
   ├─ GET  /auth/me               → perfil + filiais vinculadas
   ├─ GET  /auth/sessions         → lista sessões ativas
   ├─ DELETE /auth/sessions/:id   → Kill-Switch individual
   ├─ DELETE /auth/sessions       → Kill-Switch global
   └─ POST /auth/refresh          → renova access_token
```

### TTL de Sessão

| Modo | `remember_me` | TTL da Sessão | TTL do JWT |
| --- | --- | --- | --- |
| Sessão Normal | `false` (padrão) | 12 horas | `12h` |
| Sessão Estendida | `true` | 30 dias | `30d` |

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Autenticação Nativa com E-mail e Senha

  Cenário: Login bem-sucedido sem MFA
    Dado que existe um usuário com email "joao@empresa.com" e status "ACTIVE"
    E a senha "Senha@123" está corretamente hasheada no banco
    Quando ele envia POST /auth/login com {"email":"joao@empresa.com","password":"Senha@123"}
    Então o status deve ser 200
    E o corpo deve conter: access_token, refresh_token, token_type="Bearer", expires_in, user.id, user.name, user.force_pwd_reset
    E cookies httpOnly accessToken e refreshToken devem ser setados
    E uma linha deve ser inserida em user_sessions com isRevoked=false
    E auditoria auth.login.success deve ser criada com actorId=user.id

  Cenário: Desvio para MFA quando mfa_secret configurado
    Dado que o usuário tem o campo mfa_secret preenchido no banco
    Quando o login com credenciais válidas é realizado
    Então o body deve conter {"mfa_required": true, "temp_token": "...", "expires_in": 300}
    E NÃO deve conter access_token nem refresh_token
    E NÃO deve criar sessão em user_sessions

  Cenário: Credenciais inválidas (e-mail ou senha incorretos)
    Dado que o email não existe ou a senha não confere
    Quando POST /auth/login é chamado
    Então o status deve ser 401 com mensagem genérica "E-mail ou senha incorretos."
    E actorId na auditoria deve ser undefined (nunca revelar existência do usuário)

  Cenário: Conta BLOCKED
    Dado que o usuário possui status "BLOCKED"
    Quando ele tenta fazer login
    Então deve retornar 403 com type="/problems/account-blocked"
    E auditoria auth.login.blocked com actorId=user.id

  Cenário: Rate Limit excedido
    Dado que o IP fez 10+ tentativas em 15 minutos
    Quando nova tentativa é realizada
    Então deve retornar 429 (RFC 9457) com retry_after em segundos

  Cenário: Logout
    Dado que o usuário está autenticado
    Quando ele chama POST /auth/logout
    Então a sessão deve ser marcada como isRevoked=true no banco
    E auditoria auth.logout.success deve ser criada

  Cenário: Kill-Switch de sessão específica
    Dado que o usuário tem múltiplas sessões abertas
    Quando ele chama DELETE /auth/sessions/:sessionId
    Então apenas essa sessão deve ser revogada
    E deve retornar 204

  Cenário: Kill-Switch Global
    Dado que o usuário chama DELETE /auth/sessions
    Então TODAS as suas sessões devem ser revogadas
    E evento session.revoked_by_admin com all_sessions=true

  Cenário: Renovação de token com sessão válida
    Dado que o access_token expirou mas a sessão no banco é válida
    Quando POST /auth/refresh é chamado com cookie refreshToken
    Então deve receber 200 com novo access_token

  Cenário: Renovação com sessão revogada
    Dado que a sessão foi revogada pelo Kill-Switch
    Quando POST /auth/refresh é tentado
    Então deve retornar 401
```

---

## 4. Regras Críticas / Restrições Especiais

1. **User Enumeration Prevention (SEC-000-01):** Resposta de login sempre genérica. `actorId=undefined` e `entityId=UUID_NULO` na auditoria de falha.

2. **Kill-Switch em Banco:** `sessionId` embutido no JWT é validado no banco a cada request via `verifyActiveSession()`. JWT válido + sessão revogada = 401.

3. **Rate Limiting:** 10 tentativas / 15 min / IP. Violação = 429 (RFC 9457) com `retry_after`.

4. **Cookies httpOnly:** `accessToken` (`path=/`) e `refreshToken` (`path=/api/v1/auth/refresh`), ambos `httpOnly=true`, `sameSite=lax`.

5. **Auditoria Obrigatória:** `auth.login.success/failure/blocked`, `auth.logout.success`, `auth.session.revoked/revoked_all`.

6. **Desvio MFA:** Se `mfa_secret` preenchido → emite apenas `temp_token` (escopo `mfa-only`, TTL 5min). Fluxo continua em US-MOD-000-F02.

7. **`X-Correlation-ID` Obrigatório (DOC-ARC-003):** Toda resposta (sucesso e erro) DEVE propagar o `X-Correlation-ID` recebido no header da requisição. Respostas de erro RFC 9457 DEVEM incluir `extensions.correlationId`. O `correlationId` DEVE ser embutido nos eventos de domínio emitidos (`session.created`, `session.revoked`).

8. **Idempotência em `POST /auth/login` (DOC-DEV-001):** O endpoint DEVE suportar `Idempotency-Key` no header. Reenvios com a mesma chave dentro de TTL de 30 segundos retornam a resposta cacheada sem criar nova sessão duplicada em `user_sessions`.

9. **Catálogo de Eventos (DATA-003):** Os eventos `session.created`, `session.revoked`, `session.revoked_all` DEVEM seguir o formato padronizado `DATA-003` com campos: `tenant_id`, `entity_type`, `entity_id`, `event_type`, `payload`, `correlation_id`, `created_by`. Nenhuma tabela de log exclusiva deve ser criada — a `domain_events` é a fonte única.

---

## 5. Definition of Ready (DoR) — Para Iniciar o Desenvolvimento

- [ ] Owner definido.
- [ ] Cenários Gherkin revisados e aprovados pelo time (seção 3).
- [ ] Contrato de API documentado no OpenAPI (`/auth/login`, `/auth/logout`, `/auth/sessions`, `/auth/refresh`).
- [ ] Sem `PENDENTE-XXX` críticos em aberto.
- [ ] Épico US-MOD-000 **aprovado**.

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `aprovada`.
