# US-MOD-000-F03 — Login via SSO OAuth2 (Google e Microsoft / Azure AD)

**Status:** `para aprovação`
**Data:** 2026-03-05
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-000** (Foundation — Auth SSO)
**Referências Normativas:** DOC-DEV-004 §4.2, §8.2 | INT-000-01 (Google OAuth2) | INT-000-02 (Microsoft OAuth2) | DOC-ARC-001 | DOC-PADRAO-004

---

## 1. Contexto e Problema

O sistema implementou SSO via OAuth2 para Google e Microsoft em `apps/api/src/modules/auth/sso.routes.ts`. Porém, não existe documentação formal que defina o contrato de cada provider, a estratégia de auto-provisionamento, o tratamento de conflito de e-mails e a auditoria diferenciada entre primeiro acesso (`register`) e acessos subsequentes (`login`).

---

## 2. A Solução (Linguagem de Negócio)

Como **usuário corporativo**, quero fazer login com minha conta Google ou Microsoft para que o sistema reconheça automaticamente minha identidade, crie ou vincule minha conta, e me autentique sem precisar de uma senha separada.

### Fluxo OAuth2 (Authorization Code Flow)

```text
GOOGLE:
  GET /auth/google → redirect para accounts.google.com
  GET /auth/google/callback?code=...
    ├─ Troca code → access_token (server-to-server)
    ├─ GET googleapis.com/oauth2/v2/userinfo → {email, name, picture}
    ├─ [Usuário existe?] SIM → reutiliza | NÃO → cria (isNewUser=true)
    ├─ Cria UserSession + emite JWT
    └─ redirect → {FRONTEND_URL}/sso-success?token=JWT&provider=google&is_new_user=...

MICROSOFT:
  GET /auth/microsoft → redirect para login.microsoftonline.com
  GET /auth/microsoft/callback?code=...
    ├─ GET graph.microsoft.com/v1.0/me → {displayName, mail, userPrincipalName}
    ├─ [email vazio?] → redirect /login?error=no_email_provided&provider=microsoft
    └─ [Mesmo fluxo do Google]
```

### Modelo de Usuário SSO Provisionado

```typescript
// users: passwordHash = "SSO_GOOGLE_NO_PASSWORD" | "SSO_MICROSOFT_NO_PASSWORD"
// content_users: fullName = Google.name | MS.displayName; avatarUrl = Google.picture | null
```

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Login via SSO OAuth2 (Google e Microsoft)

  Cenário: Primeiro login com Google — usuário não existe no sistema
    Dado que o e-mail "novo@empresa.com" não existe na tabela users
    Quando o callback do Google é processado com {email, name, picture}
    Então um novo registro deve ser inserido em users com passwordHash="SSO_GOOGLE_NO_PASSWORD" e status="ACTIVE"
    E um registro deve ser inserido em content_users com fullName e avatarUrl preenchidos
    E o redirect deve ser para {FRONTEND_URL}/sso-success?token=JWT&provider=google&is_new_user=true
    E a auditoria auth.sso_google.register deve ser criada
    E o evento user.sso_linked deve ser emitido com {provider:"google", is_new_user:true}

  Cenário: Login subsequente com Google — usuário já existe
    Dado que o e-mail "existente@empresa.com" já existe na tabela users
    Quando o callback do Google é processado com o mesmo e-mail
    Então NÃO deve ser criado um novo registro em users
    E o redirect deve ser com is_new_user=false
    E a auditoria auth.sso_google.login deve ser criada

  Cenário: Microsoft retorna sem campo mail e sem userPrincipalName
    Dado que a API do Microsoft Graph não retornou nenhum e-mail utilizável
    Quando o callback é processado
    Então deve redirecionar para {FRONTEND_URL}/login?error=no_email_provided&provider=microsoft

  Cenário: Falha no callback do Google (token inválido)
    Dado que o código de autorização do Google é inválido
    Quando o callback é processado
    Então deve redirecionar para {FRONTEND_URL}/login?error=sso_failed&provider=google
    E o erro deve ser logado no servidor com nível ERROR

  Cenário: Usuário com cadastro nativo faz login via Google pelo mesmo e-mail
    Dado que "joao@empresa.com" tem conta nativa (com passwordHash real)
    Quando ele autentica via Google com o mesmo e-mail
    Então o sistema deve identificar a conta existente (by email)
    E deve criar uma nova sessão para essa conta existente (sem criar novo usuário)
    E a auditoria deve ser auth.sso_google.login (não register)
```

---

## 4. Regras Críticas / Restrições Especiais

1. **Auto-provisionamento por E-mail:** Vinculação feita exclusivamente por e-mail. Se já existe, a conta é reutilizada.

2. **Marcador de Senha SSO:** `passwordHash = 'SSO_GOOGLE_NO_PASSWORD'` ou `'SSO_MICROSOFT_NO_PASSWORD'` — nunca um hash bcrypt válido. Não expor esse valor em respostas de API.

3. **Variáveis de Ambiente Obrigatórias (DOC-PADRAO-004):**
   `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URI`, `MICROSOFT_CLIENT_ID`, `MICROSOFT_CLIENT_SECRET`, `MICROSOFT_CALLBACK_URI`, `FRONTEND_URL`.

4. **Auditoria Diferenciada:** Primeiro acesso: `.register`. Acessos subsequentes: `.login`. Evento de domínio: `user.sso_linked` com `{provider, is_new_user}`.

5. **avatarUrl:** Apenas Google fornece `picture`. Microsoft → `avatarUrl = null`.

6. **Sem MFA no fluxo SSO (Fase 1):** Segurança de segundo fator é responsabilidade do provider.

---

> ⚠️ **Atenção:** As automações de arquitetura (`scaffold-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `aprovada`.
