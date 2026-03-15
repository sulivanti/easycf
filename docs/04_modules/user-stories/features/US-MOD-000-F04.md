# US-MOD-000-F04 — Recuperação de Senha por E-mail (Forgot / Reset Password)

**Status Ágil:** `DRAFT`
**Data:** 2026-03-05
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-000** (Foundation — Auth Password Recovery)
**Referências Normativas:** DOC-DEV-001 §5.1, §8.2, §12.4 | SEC-000-01 | DOC-ARC-001 | DOC-PADRAO-004

## Metadados de Governança

- **status_agil:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-06
- **rastreia_para:** US-MOD-000, DOC-DEV-001, DOC-ARC-001, DOC-PADRAO-004, SEC-000-01
- **nivel_arquitetura:** 1 (token de reset em banco, MailService, anti-enumeration)
- **referencias_exemplos:** N/A
- **evidencias:** *(adicionar links de PR/issue ao longo do refinamento)*
- **wave_entrega:** Wave 1
- **epico_pai:** US-MOD-000
- **manifests_vinculados:** N/A
- **pendencias:** N/A

---

## 1. Contexto e Problema

O sistema implementou a recuperação de senha em `apps/api/src/modules/auth/passwordReset.routes.ts`, mas faltam a documentação formal que define o comportamento de segurança anti-enumeration (sempre 200), o modelo de dados do token de reset (TTL 1h, uso único), e o comportamento sobre `force_pwd_reset`.

Fluxos de recuperação mal documentados frequentemente resultam em vulnerabilidades críticas. Esta US garante que o comportamento seguro seja o único comportamento aceito.

---

## 2. A Solução (Linguagem de Negócio)

Como **usuário que esqueceu sua senha**, quero solicitar um link de redefinição via e-mail para que eu possa criar uma nova senha sem precisar contatar suporte.

Como **time de segurança**, queremos garantir que o fluxo de reset:

- Não revele se um e-mail está cadastrado ou não (anti-enumeration).
- Use tokens de reset de uso único com TTL de 1 hora gerados via UUID v4.
- Aplique regras de força de senha no momento do reset.

### Fluxo Completo de Recuperação de Senha

```text
ETAPA 1 — Solicitar link de reset
  POST /auth/forgot-password { email: "joao@empresa.com" }
    ├─ Busca usuário pelo email
    ├─ NÃO EXISTE → retorna 200 (genérico, anti-enumeration)
    └─ EXISTE
         ├─ Gera token = crypto.randomUUID()
         ├─ Insere em password_reset_tokens {userId, token, expiresAt: now+1h}
         ├─ Chama MailService com {FRONTEND_URL}/reset-password?token={UUID}
         ├─ Auditoria: auth.password_reset.requested (actorId=undefined)
         └─ Retorna 200 genérico

ETAPA 2 — Usar o link de reset
  POST /auth/reset-password?token={UUID} { new_password, confirm_password }
    ├─ Valida token em password_reset_tokens WHERE usedAt=null AND expiresAt > now
    ├─ Token inválido/expirado → 401 genérico
    └─ Token válido
         ├─ Valida força da senha (Zod)
         ├─ UPDATE users SET passwordHash=newHash, forcePwdReset=false
         ├─ UPDATE password_reset_tokens SET usedAt=now()
         ├─ Auditoria: auth.password_reset.completed
         └─ Retorna 200
```

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Recuperação de Senha por E-mail

  Cenário: Solicitação com e-mail cadastrado
    Dado que "joao@empresa.com" existe na tabela users
    Quando POST /auth/forgot-password é chamado
    Então o status deve ser 200
    E o body deve ser {"message": "Se este e-mail estiver cadastrado, você receberá um link."}
    E um registro deve ser inserido em password_reset_tokens com expiresAt = now + 1h
    E o MailService deve ser chamado com o link contendo o token UUID

  Cenário: Solicitação com e-mail NÃO cadastrado (anti-enumeration)
    Dado que "fantasma@empresa.com" NÃO existe no banco
    Quando POST /auth/forgot-password é chamado
    Então o status deve ser 200
    E o body deve ser IDÊNTICO ao do cenário com e-mail válido
    E NÃO deve ser inserido nenhum registro nem enviado e-mail

  Cenário: Reset bem-sucedido com token válido e senha forte
    Dado que existe um token UUID válido (expiresAt no futuro, usedAt=null)
    Quando POST /auth/reset-password?token=... é chamado com senhas que coincidem e são fortes
    Então o status deve ser 200
    E a senha do usuário deve ser atualizada com novo hash bcrypt
    E o campo forcePwdReset deve ser definido como false
    E usedAt do token deve ser preenchido (invalidado)
    E auditoria auth.password_reset.completed deve ser criada

  Cenário: Token expirado ou já utilizado
    Dado que o token expirou ou tem usedAt != null
    Quando POST /auth/reset-password?token=... é chamado
    Então deve retornar 401 com type="/problems/invalid-token"
    E NÃO deve atualizar a senha

  Cenário: Token ausente na query string
    Quando POST /auth/reset-password é chamado sem ?token
    Então deve retornar 400 com detail informando que ?token é obrigatório

  Cenário: Nova senha fraca (sem letra maiúscula, número ou caracteres especiais)
    Dado que a nova senha falha nas regras de força
    Quando a requisição é feita
    Então deve retornar 422 com erro de validação Zod

  Cenário: Tentativa de reset por usuário SSO (sem senha nativa)
    Dado que o usuário tem passwordHash="SSO_GOOGLE_NO_PASSWORD"
    Quando POST /auth/reset-password?token=... é chamado com nova senha
    Então deve retornar 422 com detail="Contas via SSO não possuem senha local. Utilize o login com Google/Microsoft."
    E NÃO deve atualizar a senha

  Cenário: Senhas não coincidem (new_password != confirm_password)
    Quando a requisição é feita com senhas diferentes
    Então deve retornar 422
```

---

## 4. Regras Críticas / Restrições Especiais

1. **Anti-Enumeration Obrigatório (SEC-000-01):** Resposta de `POST /forgot-password` sempre 200 com mesmo corpo. Nunca retornar 404.

2. **Token de Uso Único:** Após sucesso, atualizar `usedAt=now()`. Tentativa de reuso retorna 401 genérico (igual ao token expirado).

3. **TTL do Token: 1 hora** — não configurável, hardcoded por segurança. `crypto.randomUUID()` garante 122 bits de entropia.

4. **Integração MailService (INT-000-MAIL):** Em desenvolvimento local fita no console; em prod usa provedor via contrato `MailService.sendPasswordResetEmail(email, link)`. O contrato `INT-000-MAIL` DEVE declarar `Timeout`, `Retry (3x)`, `Backoff exponencial` e `DLQ: Sim` conforme `DOC-DEV-001 §4.3`. O envio DEVE ser assimíncrono (fire-and-forget) com log de falha.

5. **`force_pwd_reset` zerado:** Um usuário com reset obrigatório deve se livrar dele ao concluir via `POST /reset-password`.

6. **Usuário SSO sem senha nativa:** O endpoint `POST /reset-password` deve identificar `passwordHash` iniciado por `SSO_` e retornar 422 com mensagem orientando o login via provider. Não atualizar hash nesse caso.

7. **`X-Correlation-ID` Obrigatório (DOC-ARC-003):** Respostas de `POST /forgot-password` e `POST /reset-password` DEVEM incluir `X-Correlation-ID` no header. Respostas de erro RFC 9457 DEVEM incluir `extensions.correlationId`. A auditoria `auth.password_reset.requested` DEVE registrar `correlation_id`.

8. **Idempotência em `POST /auth/forgot-password` (DOC-DEV-001):** O endpoint DEVE suportar `Idempotency-Key`. Reenvios com a mesma chave e e-mail dentro de TTL de 60 segundos retornam 200 sem gerar novo token de reset nem reenviar o e-mail.

---

## 5. Definition of Ready (DoR) — Para Iniciar o Desenvolvimento

- [ ] Owner definido.
- [ ] Cenários Gherkin revisados e aprovados.
- [ ] Contrato de `POST /forgot-password` e `POST /reset-password` documentado no OpenAPI.
- [ ] Contrato `MailService.sendPasswordResetEmail` definido (interface).
- [ ] Sem `PENDENTE-XXX` críticos em aberto.
- [ ] Épico US-MOD-000 **aprovado**.

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `aprovada`.
