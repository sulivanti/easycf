# US-MOD-000-F17 — Login via Sign in with Apple (Apple ID)

**Status Ágil:** `DRAFT`
**Data:** 2026-03-09
**Autor(es):** Arquitetura
**Módulo Destino:** **MOD-000** (Foundation — Auth SSO)
**Referências Normativas:** DOC-DEV-001 §4.2, §8.2 | INT-000-03 (Apple OAuth2 / OIDC) | DOC-ARC-001 | DOC-PADRAO-004

## Metadados de Governança

- **status_agil:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-09
- **rastreia_para:** US-MOD-000, DOC-DEV-001, DOC-ARC-001, DOC-PADRAO-004, INT-000-03
- **nivel_arquitetura:** 2 (integração externa OIDC/OAuth2, auto-provisionamento, domain events)
- **referencias_exemplos:** N/A
- **evidencias:** *(adicionar links de PR/issue ao longo do refinamento)*
- **wave_entrega:** Wave 2 (fase separada)
- **epico_pai:** US-MOD-000
- **manifests_vinculados:** N/A
- **pendencias:** INT-000-03 (contrato Apple), migration apple_sub, chave .p8

---

## 1. Contexto e Problema

O sistema já suporta SSO via Google e Microsoft (US-MOD-000-F03), cobrindo o cenário corporativo. Contudo, **Sign in with Apple** é obrigatório nas diretrizes da Apple Store para aplicações iOS/macOS que ofereçam qualquer outra opção de login social, tornando sua ausência um bloqueador de publicação mobile.

O protocolo Apple utiliza OIDC (OpenID Connect) com peculiaridades importantes que o diferenciam dos outros providers já implementados:

- O campo `email` pode ser **nulo ou privatizado** (Apple Relay Email), dependendo da escolha do usuário.
- O `id_token` JWT é assinado com chaves públicas rotativas da Apple (JWKS).
- O Apple **retorna o `user` object (name) apenas no primeiro login** (`POST` do callback). Acessos subsequentes enviam apenas o `code` sem o `user` object.
- A autenticação server-to-server usa **Client Secret gerado dinamicamente** via JWT assinado com chave privada `.p8` (diferente de `client_secret` estático do Google/Microsoft).

Sem documentação formal, esses comportamentos podem ser implementados incorretamente, levando a usuários sem nome cadastrado, duplicação de contas, ou falhas na renovação do Client Secret.

---

## 2. A Solução (Linguagem de Negócio)

Como **usuário de dispositivo Apple (iOS/macOS)**, quero fazer login com meu Apple ID para que o sistema reconheça minha identidade, crie ou vincule minha conta automaticamente, e me autentique sem precisar de senha separada.

### Fluxo Authorization Code Flow com OIDC (Apple)

```text
APPLE:
  GET /auth/apple → redirect para appleid.apple.com/auth/authorize
      ├─ Parâmetros: response_type=code id_token, response_mode=form_post, scope=name email
      │
  POST /auth/apple/callback  {code, id_token, user? (JSON — apenas 1º login)}
      ├─ Valida assinatura do id_token via JWKS (https://appleid.apple.com/auth/keys)
      ├─ Extrai sub (Apple User ID estável) + email (pode ser Relay ou nulo)
      ├─ [user object presente?]
      │     SIM → extrai name (firstName + lastName) — armazena; nunca virá novamente
      │     NÃO → usa name armazenado ou fallback "Apple User"
      ├─ [Usuário existe por apple_sub?] SIM → reutiliza | NÃO → verifica por email → NÃO → cria (isNewUser=true)
      ├─ Cria UserSession + emite JWT interno do sistema
      └─ redirect → {FRONTEND_URL}/sso-success?token=JWT&provider=apple&is_new_user=...
```

### Modelo de Usuário SSO Apple Provisionado

```typescript
// users: passwordHash = "SSO_APPLE_NO_PASSWORD"
// users: apple_sub = "000000.abcdef1234567890.1234" (identificador estável da Apple — indexado)
// content_users: fullName = Apple firstName+lastName (capturado apenas no 1º callback) | fallback "Apple User"
// content_users: avatarUrl = null (Apple não fornece avatar)
// content_users: email = Apple Relay Email ("xxxxx@privaterelay.appleid.com") ou e-mail real, conforme escolha do usuário
```

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Login via Sign in with Apple

  Cenário: Primeiro login com Apple — usuário não existe no sistema (com e-mail e nome)
    Dado que não existe nenhum usuário com o apple_sub "000000.abc123.1234" na tabela users
    E o callback POST /auth/apple/callback retorna id_token válido com sub, email e user object {firstName, lastName}
    Quando o callback é processado
    Então deve ser validada a assinatura do id_token via JWKS da Apple
    E um novo registro deve ser inserido em users com passwordHash="SSO_APPLE_NO_PASSWORD", status="ACTIVE" e apple_sub preenchido
    E um registro deve ser inserido em content_users com fullName="{firstName} {lastName}" e avatarUrl=null
    E o redirect deve ser para {FRONTEND_URL}/sso-success?token=JWT&provider=apple&is_new_user=true
    E a auditoria auth.sso_apple.register deve ser criada com actorId=user.id
    E o evento user.sso_linked deve ser emitido com {provider:"apple", is_new_user:true}

  Cenário: Login subsequente com Apple — usuário já existe (sem user object no callback)
    Dado que já existe um usuário com o apple_sub "000000.abc123.1234" na tabela users
    E o callback POST /auth/apple/callback NÃO contém user object (comportamento padrão da Apple após 1º login)
    Quando o callback é processado
    Então o sistema deve localizar o usuário pelo apple_sub
    E NÃO deve criar um novo registro em users
    E o redirect deve ser com is_new_user=false
    E a auditoria auth.sso_apple.login deve ser criada

  Cenário: Primeiro login com Apple — usuário oculta e-mail (Apple Relay Email)
    Dado que o usuário optou por ocultar o e-mail na tela de consentimento da Apple
    E o id_token contém um email no formato "xxxxx@privaterelay.appleid.com"
    Quando o callback é processado
    Então o sistema deve armazenar o Relay Email como e-mail principal do usuário
    E o usuário deve ser provisionado normalmente (status="ACTIVE")

  Cenário: Vinculação por e-mail — usuário com conta nativa faz login via Apple pelo mesmo e-mail
    Dado que "joao@empresa.com" tem conta nativa (com passwordHash real) e sem apple_sub preenchido
    E o id_token traz email="joao@empresa.com" e sub="000000.abc123.1234"
    Quando o callback é processado
    Então o sistema deve identificar a conta existente pelo e-mail
    E deve preencher o campo apple_sub na conta existente
    E deve criar uma nova sessão para essa conta (sem criar novo usuário)
    E a auditoria deve ser auth.sso_apple.login (não register)

  Cenário: id_token com assinatura inválida ou expirado
    Dado que o id_token recebido no callback possui assinatura inválida ou claim "exp" no passado
    Quando o callback é processado
    Então deve redirecionar para {FRONTEND_URL}/login?error=sso_failed&provider=apple
    E o erro deve ser logado no servidor com nível ERROR incluindo o correlationId

  Cenário: Usuário com status BLOCKED tenta login via Apple
    Dado que o apple_sub ou e-mail identificado corresponde a um usuário com status "BLOCKED"
    Quando o callback do Apple é processado
    Então deve redirecionar para {FRONTEND_URL}/login?error=account_blocked&provider=apple
    E NÃO deve criar UserSession
    E a auditoria auth.sso_apple.blocked deve ser criada com actorId=user.id

  Cenário: Apple não retorna e-mail E não existe conta pelo apple_sub
    Dado que o id_token não contém campo email (caso raro de escopos não concedidos)
    E não existe nenhum usuário com o apple_sub correspondente no banco
    Quando o callback é processado
    Então deve redirecionar para {FRONTEND_URL}/login?error=no_email_provided&provider=apple
    E NÃO deve provisionar nenhum usuário
```

---

## 4. Regras Críticas / Restrições Especiais

1. **Identificador Primário é `apple_sub`:** O campo `sub` do `id_token` é o identificador estável e permanente da identidade Apple do usuário. A vinculação de conta DEVE priorizar `apple_sub` antes de tentar vinculação por e-mail.

2. **E-mail é secundário e opcional:** O campo `email` pode estar ausente ou ser um endereço Relay (`@privaterelay.appleid.com`). Ambos são válidos para provisionamento. O sistema NÃO pode exigir e-mail real para autenticação Apple.

3. **`user` object — Captura Única:** A Apple envia `firstName`, `lastName` **apenas no primeiro callback** (POST). O backend DEVE persistir esses dados imediatamente. Em acessos subsequentes, o `user` object não estará presente — usar o valor já armazenado sem falhar.

4. **Client Secret Dinâmico (DOC-PADRAO-004):** O Apple OAuth não usa `client_secret` estático. O segredo é um JWT gerado sob demanda, assinado com a chave privada `.p8` armazenada como variável de ambiente (`APPLE_PRIVATE_KEY`). O JWT gerado tem TTL máximo de 6 meses e DEVE ser renovado antes do vencimento.

5. **Variáveis de Ambiente Obrigatórias (DOC-PADRAO-004):**
   `APPLE_CLIENT_ID` (Services ID / Bundle ID), `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` (conteúdo do arquivo `.p8`), `APPLE_CALLBACK_URI`, `FRONTEND_URL`.

6. **Validação de `id_token` via JWKS:** O backend DEVE buscar e cachear as chaves públicas da Apple em `https://appleid.apple.com/auth/keys`. A assinatura DEVE ser verificada server-to-server — nunca confiar no token sem validação criptográfica.

7. **`response_mode=form_post` Obrigatório:** A Apple exige que o callback seja recebido via `POST` com `Content-Type: application/x-www-form-urlencoded`. A rota `/auth/apple/callback` DEVE aceitar apenas `POST`.

8. **Sem MFA no fluxo SSO Apple (Fase 1):** Segurança de segundo fator é responsabilidade da Apple (Face ID / Touch ID / Apple ID 2FA).

9. **Usuário BLOCKED via SSO Apple:** O auto-provisionamento não reativa contas bloqueadas. Se o `apple_sub` ou e-mail existe com `status=BLOCKED`, o redirect é para página de erro — nunca emite sessão.

10. **Marcador de Senha SSO:** `passwordHash = 'SSO_APPLE_NO_PASSWORD'` — nunca um hash bcrypt válido. Não expor esse valor em respostas de API.

11. **`X-Correlation-ID` Obrigatório (DOC-ARC-003):** O `correlationId` DEVE ser propagado no redirect de sucesso (`sso-success`) e embutido nos eventos de domínio (`user.sso_linked`). Erros de redirect DEVEM logar o `correlationId` no servidor com nível ERROR.

12. **Contrato de Integração Externo (INT-000-03):** O contrato com a Apple OIDC DEVE declarar `Timeout`, `Retry`, `Backoff/Jitter` e política de `Fallback` para a chamada de validação JWKS, conforme `DOC-DEV-001 §4.3`.

13. **Catálogo de Eventos (DATA-003):** Os eventos `auth.sso_apple.register`, `auth.sso_apple.login`, `auth.sso_apple.blocked`, `user.sso_linked` DEVEM seguir o formato `DATA-003` com `correlation_id`, `sensitivity_level=1` (dados de provedor ext.), `tenant_id`, `entity_type`, `entity_id`, `event_type`, `payload`, `created_by`.

---

## 5. Definition of Ready (DoR) — Para Iniciar o Desenvolvimento

<!-- Atenção: Não marque as referências de contratos e normativos (DOC-*, INT-*) como concluídas [ ] se o arquivo físico ainda não tiver sido efetivamente criado no repositório. O CI irá falhar. -->

- [ ] Owner definido.
- [ ] Cenários Gherkin revisados e aprovados pelo time.
- [ ] Variáveis de ambiente (`APPLE_CLIENT_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY`, `APPLE_CALLBACK_URI`) documentadas em DOC-PADRAO-004. *(pendente: adicionar vars ao arquivo físico DOC-PADRAO-004)*
- [ ] Contrato `INT-000-03` criado com retry/timeout/fallback documentados para chamada JWKS. *(pendente: arquivo INT-000-03 não existe no repositório)*
- [ ] Campo `apple_sub` adicionado à tabela `users` via migration (indexado, nullable, unique). *(pendente: migration não criada)*
- [ ] Endpoints `/auth/apple` e `/auth/apple/callback` documentados no OpenAPI. *(pendente: spec OpenAPI a criar)*
- [ ] Épico US-MOD-000 **aprovado**.

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
