# US-MOD-000-F02 — Autenticação de Dois Fatores via TOTP (MFA)

**Status Ágil:** `READY`
**Data:** 2026-03-05
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-000** (Foundation — Auth MFA)
**Referências Normativas:** DOC-DEV-001 §5.3, §8.2, §12.4 | SEC-000-01 | RFC 6238 (TOTP) | DOC-ARC-001 | DOC-GNP-00

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-000, US-MOD-000-F01, DOC-DEV-001, DOC-ARC-001, DOC-GNP-00, SEC-000-01
- **nivel_arquitetura:** 2 (DDD — temp_token com escopo restrito, domain events de sessão)
- **referencias_exemplos:** N/A
- **evidencias:** *(adicionar links de PR/issue ao longo do refinamento)*
- **wave_entrega:** Wave 1
- **epico_pai:** US-MOD-000
- **manifests_vinculados:** N/A
- **pendencias:** N/A

---

## 1. Contexto e Problema

O sistema implementou o fluxo de MFA em `apps/api/src/modules/auth/mfa.routes.ts`, porém não existe nenhuma User Story que formalize o contrato do endpoint `/mfa/verify`, as regras de segurança do `temp_token` (escopo restrito, TTL curto) e os critérios de aceite que garantem conformidade com RFC 6238.

Usuários com MFA configurado representam os de **maior criticidade de segurança** no sistema, tornando esta US prioritária.

---

## 2. A Solução (Linguagem de Negócio)

Como **usuário com MFA habilitado**, quero que, após inserir minhas credenciais de login, o sistema me solicite um código TOTP de 6 dígitos gerado pelo meu aplicativo autenticador (Google Authenticator, Authy, 1Password), antes de emitir meu token de sessão definitivo.

Como **time de segurança**, queremos garantir que o MFA:

- Seja obrigatório e não "bypassável" para usuários que o tenham configurado.
- Utilize um token temporário de escopo restrito entre as etapas de login e verificação.
- Valide o código TOTP conforme RFC 6238 (HMAC-SHA1, janela de 30 segundos).
- Registre todas as tentativas (sucesso e falha) na trilha de auditoria.

### Fluxo Completo MFA

```text
ETAPA 1 — Login Inicial (US-MOD-000-F01)
  POST /auth/login {email, password}
    └─ [mfa_secret presente?]
          SIM → retorna {mfa_required: true, temp_token, expires_in: 300}
          NÃO → fluxo normal (sessão criada, tokens emitidos)

ETAPA 2 — Verificação TOTP (Esta US)
  POST /auth/mfa/verify {temp_token, totp_code}
    ├─ Valida temp_token JWT (escopo mfa-only, TTL 5min)
    ├─ Verifica scope === 'mfa-only' (previne uso de access_token)
    ├─ Busca usuário, verifica status=ACTIVE e mfa_secret presente
    ├─ Valida TOTP: otplib RFC 6238 (30s window)
    │     ├─ INVÁLIDO → 401 + auditoria auth.mfa.failed
    │     └─ VÁLIDO → continua
    ├─ Cria UserSession no banco
    ├─ Emite access_token + refresh_token definitivos
    └─ Auditoria: auth.mfa.success | Evento: session.created
```

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Autenticação de Dois Fatores via TOTP (MFA)

  Cenário: Login com MFA habilitado redireciona para verificação de código
    Dado que o usuário "maria@empresa.com" tem mfa_secret preenchido
    Quando ele faz login com credenciais válidas via POST /auth/login
    Então o status deve ser 200
    E o body deve conter "mfa_required": true, "temp_token" e "expires_in": 300
    E NÃO deve conter "access_token" nem "refresh_token"
    E NÃO deve haver inserção na tabela user_sessions neste momento

  Cenário: Verificação bem-sucedida com TOTP válido
    Dado que o usuário recebeu um temp_token válido (dentro de 5 minutos)
    E o código TOTP de 6 dígitos gerado pelo app autenticador é correto
    Quando ele envia POST /auth/mfa/verify com {"temp_token": "...", "totp_code": "123456"}
    Então o status deve ser 200
    E o body deve conter access_token, refresh_token, token_type="Bearer", expires_in, user.id, user.name
    E uma nova linha deve ser inserida em user_sessions com isRevoked=false
    E o evento de domínio session.created deve ser emitido com payload.mfa_verified=true
    E a auditoria auth.mfa.success deve ser criada com actorId=user.id

  Cenário: Código TOTP inválido
    Dado que o usuário tem um temp_token válido mas enviou totp_code = "000000" (incorreto)
    Quando POST /auth/mfa/verify é chamado
    Então o status deve ser 401
    E o body deve seguir RFC 9457 com type="/problems/invalid-totp", title="Código Inválido"
    E a auditoria auth.mfa.failed deve ser criada com reason="invalid_totp"

  Cenário: temp_token expirado (mais de 5 minutos)
    Dado que o usuário recebeu um temp_token há mais de 5 minutos
    Quando ele envia POST /auth/mfa/verify com esse temp_token expirado
    Então o status deve ser 401 com type="/problems/invalid-token"
    E o detail deve instruir o usuário a fazer login novamente

  Cenário: Tentativa de usar access_token normal no lugar do temp_token
    Dado que o usuário tem um access_token com escopo padrão (não mfa-only)
    Quando ele tenta enviá-lo como temp_token
    Então o status deve ser 401 com detail="Token não autorizado para esta operação."

  Cenário: Tentativas repetidas de código TOTP inválido (brute-force)
    Dado que o mesmo temp_token fez 5+ tentativas com totp_code inválido em menos de 2 minutos
    Quando uma nova tentativa é feita
    Então deve retornar 429 (RFC 9457) com retry_after
    E o temp_token deve ser invalidado por segurança (revogado antes do TTL natural)

  Cenário: Código TOTP com formato incorreto (diferente de 6 dígitos)
    Dado que o usuário enviou totp_code com menos ou mais de 6 caracteres
    Quando POST /auth/mfa/verify é chamado
    Então deve retornar 422 com erro de validação Zod
```

---

## 4. Regras Críticas / Restrições Especiais

1. **TOTP conforme RFC 6238:** Validação via `otplib` com estratégia TOTP (HMAC-SHA1, janela de 30 segundos).

2. **temp_token com Escopo Restrito:** JWT com payload `{ userId, sessionScope: 'mfa-only' }`, TTL 5 minutos. O backend DEVE validar que `sessionScope === 'mfa-only'` antes de processar.

3. **Auditoria Obrigatória:** `auth.mfa.success` (actorId = user.id, entityId = session.id) e `auth.mfa.failed` (actorId = user.id, reason = 'invalid_totp').

4. **Resposta de Sucesso Idêntica ao Login Nativo:** O contrato de resposta deve ser exatamente o mesmo da US-MOD-000-F01, garantindo que o frontend não precise tratar os dois fluxos de forma diferente.

5. **Brute-Force TOTP:** Após 5 tentativas inválidas com o mesmo `temp_token`, o token deve ser revogado e o usuário deve reiniciar o login. Rate limit de tentativas por `temp_token` (não por IP).

6. **`X-Correlation-ID` Obrigatório (DOC-ARC-003):** O `X-Correlation-ID` da requsição inicial de login (etapa 1 — F01) DEVE ser propagado como `causation_id` no evento `auth.mfa.success`, garantindo rastreabilidade da cadeia login→MFA. Respostas de erro RFC 9457 DEVEM incluir `extensions.correlationId`.

7. **Catálogo de Eventos (DATA-003):** Os eventos `auth.mfa.success` e `auth.mfa.failed` DEVEM seguir o formato padronizado `DATA-003` com campos `correlation_id`, `causation_id`, `entity_type=user_session`, `sensitivity_level=1`.

---

## 5. Definition of Ready (DoR) — Para Iniciar o Desenvolvimento

- [x] Owner definido (arquitetura).
- [x] Cenários Gherkin revisados e aprovados.
- [x] Contrato do endpoint `POST /auth/mfa/verify` documentado no OpenAPI.
- [x] Sem `PENDENTE-XXX` críticos em aberto.
- [x] Feature US-MOD-000-F01 **aprovada**.
- [x] Épico US-MOD-000 **aprovado**.

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `aprovada`.
