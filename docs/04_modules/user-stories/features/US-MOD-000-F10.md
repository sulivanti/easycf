# US-MOD-000-F10 — Alteração de Senha Autenticada (Minha Conta)

**Status Ágil:** `READY`
**Data:** 2026-03-06
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-000** (Foundation — Auth Password Change)
**Referências Normativas:** DOC-DEV-001 §4.1, §5.1, §8.2, §12.2, §12.4 | SEC-000-01 | DOC-ARC-001 | DOC-ARC-003 | DOC-PADRAO-004

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-000, US-MOD-000-F01, US-MOD-000-F04, US-MOD-000-F08, DOC-DEV-001, DOC-ARC-001, DOC-ARC-003, SEC-000-01, DOC-PADRAO-004
- **nivel_arquitetura:** 2 (sessão em banco, kill-switch, domain events, bcrypt compare)
- **referencias_exemplos:** US-MOD-000-F01 (gerenciamento de sessões), US-MOD-000-F04 (reset externo), US-MOD-000-F08 (perfil autenticado)
- **evidencias:** *(adicionar links de PR/issue ao longo do refinamento)*
- **wave_entrega:** Wave 1
- **epico_pai:** US-MOD-000
- **manifests_vinculados:** N/A
- **pendencias:** N/A

---

## 1. Contexto e Problema

A feature **F08** (Perfil do Usuário Autenticado) documenta explicitamente que o `PUT /users/:id` **não altera o `passwordHash`** do usuário. A feature **F04** (Recuperação de Senha) cobre apenas o fluxo **externo** de reset por token de e-mail (para quem esqueceu a senha sem estar autenticado).

Nenhuma sub-história da F01–F09 cobre o fluxo em que o **usuário autenticado** — que conhece sua senha atual — deseja alterá-la via "Minha Conta". Esse é um caso de uso distinto de segurança mais elevada (exige validação da senha atual via bcrypt) e com regras próprias de revogação de sessões.

A ausência deste endpoint também cria um gap funcional no caso de `force_pwd_reset=true`: o sistema não tem como forçar o usuário a criar uma nova senha antes de acessar as demais rotas, pois não existe a rota para recebê-la de forma autenticada.

---

## 2. A Solução (Linguagem de Negócio)

Como **usuário autenticado**, quero alterar minha senha atual informando a senha antiga e a nova para proteger minha conta, sem precisar passar pelo fluxo de "Esqueci minha senha".

Como **time de segurança**, queremos garantir que:

- A senha atual seja validada (bcrypt compare) antes de qualquer alteração.
- Contas SSO (sem senha nativa) sejam rejeitadas com orientação clara.
- Ao alterar a senha, todas as **outras sessões ativas sejam revogadas** automaticamente — exceto a sessão corrente que realizou a operação.
- O campo `force_pwd_reset=true` force o usuário a usar **exclusivamente essa rota** antes de acessar qualquer outro recurso protegido.

### Fluxo Completo de Alteração de Senha

```text
[Usuário Autenticado]
   PUT /auth/change-password
     {
       "current_password": "SenhaAtual@123",
       "new_password":     "NovaSenha@456",
       "confirm_password": "NovaSenha@456"
     }
     │
     ├─ [Gate 1] verifyActiveSession() → sessão revogada? → 401
     ├─ [Gate 2] passwordHash inicia com "SSO_"? → 422 (instrução para login via provider)
     ├─ [Gate 3] bcrypt.compare(current_password, passwordHash) → falhou? → 401 genérico
     ├─ [Gate 4] new_password === confirm_password? (Zod) → falhou? → 422
     ├─ [Gate 5] force de senha forte (Zod) → falhou? → 422
     │
     ├─ UPDATE users SET passwordHash = bcrypt(new_password), forcePwdReset = false
     ├─ UPDATE user_sessions SET isRevoked = true
     │     WHERE userId = :userId AND id != :currentSessionId
     ├─ Auditoria: auth.password_changed (actorId = user.id, correlation_id)
     └─ Retorna 200
```

### Comportamento do Gate `force_pwd_reset`

```text
Usuário autenticado com force_pwd_reset = true
  ├─ Tenta acessar qualquer rota protegida (exceto /auth/change-password)
  │     → middleware retorna 403 com type="/problems/password-reset-required"
  │     → detail instrui o usuário a chamar PUT /auth/change-password
  └─ Chama PUT /auth/change-password com sucesso
        → force_pwd_reset = false
        → sessões anteriores revogadas
        → acesso liberado
```

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Alteração de Senha Autenticada

  Cenário: Alteração bem-sucedida de senha
    Dado que o usuário está autenticado com sessão válida
    E possui passwordHash nativo (não SSO)
    Quando ele envia PUT /auth/change-password com current_password correta, new_password forte e confirm_password iguais
    Então o status deve ser 200
    E passwordHash deve ser atualizado com o novo hash bcrypt
    E forcePwdReset deve ser false
    E todas as outras sessões do usuário devem ter isRevoked=true (exceto a sessão atual)
    E auditoria auth.password_changed deve ser criada com actorId=user.id e correlation_id

  Cenário: Senha atual incorreta
    Dado que o usuário envia uma current_password que não confere com o hash atual
    Quando PUT /auth/change-password é chamado
    Então deve retornar 401 com mensagem genérica
    E NÃO deve atualizar o passwordHash

  Cenário: Senhas novas não coincidem
    Dado que new_password difere de confirm_password
    Quando a requisição é feita
    Então deve retornar 422 com erro de validação Zod

  Cenário: Nova senha fraca
    Dado que new_password não satisfaz as regras de força (maiúscula, número, especial)
    Quando a requisição é feita
    Então deve retornar 422 com detalhe das regras não satisfeitas

  Cenário: Conta SSO — sem senha nativa
    Dado que o usuário tem passwordHash iniciado com "SSO_"
    Quando PUT /auth/change-password é chamado
    Então deve retornar 422 com detail="Contas via SSO não possuem senha local. Utilize o login com Google/Microsoft."
    E NÃO deve atualizar a senha

  Cenário: Sessão revogada (JWT válido mas kill-switch ativo)
    Dado que o sessionId no JWT aponta para uma sessão com isRevoked=true
    Quando PUT /auth/change-password é chamado
    Então deve retornar 401 antes de qualquer lógica de senha
    E detail deve instruir o usuário a fazer login novamente

  Cenário: force_pwd_reset bloqueia outras rotas protegidas
    Dado que o usuário autenticado tem force_pwd_reset=true
    Quando ele tenta acessar qualquer rota protegida que não seja PUT /auth/change-password
    Então deve retornar 403 com type="/problems/password-reset-required"
    E detail deve orientar o usuário a chamar PUT /auth/change-password

  Cenário: force_pwd_reset liberado após troca bem-sucedida
    Dado que o usuário com force_pwd_reset=true conclui a troca com sucesso
    Então force_pwd_reset deve ser false
    E o acesso às demais rotas deve ser restaurado

  Cenário: Revogação de outras sessões
    Dado que o usuário tem 3 sessões ativas (sessão A, B e C)
    E está autenticado via sessão A
    Quando a troca de senha é concluída com sucesso
    Então as sessões B e C devem ter isRevoked=true
    E a sessão A (corrente) NÃO deve ser revogada

  Cenário: Idempotência — reenvio com mesma Idempotency-Key
    Dado que a troca de senha foi concluída com sucesso via Idempotency-Key "abc-123"
    Quando um novo PUT /auth/change-password é enviado com a mesma Idempotency-Key "abc-123" dentro de 60s
    Então deve retornar 200 cacheado
    E NÃO deve gerar novo bcrypt hash nem nova revogação de sessões
```

---

## 4. Regras Críticas / Restrições Especiais

1. **Gate de Sessão Ativo Obrigatório (F01):** `verifyActiveSession()` é o **primeiro gate** — verifica `isRevoked` na tabela `user_sessions` antes de qualquer lógica de senha. JWT válido com sessão revogada = 401 imediato.

2. **Rejeição de Conta SSO (SEC-000-01):** Se `passwordHash` iniciar com `SSO_`, retornar 422 orientando o uso do provider. Não executar bcrypt.compare nem atualizar senha.

3. **Bcrypt Compare Obrigatório:** A `current_password` DEVE ser validada via `bcrypt.compare(current_password, user.passwordHash)` antes de qualquer alteração. Falha retorna 401 com mensagem genérica (não revelar se a senha existe ou é a conta SSO).

4. **Revogação Automática de Sessões:** Após troca bem-sucedida, executar `UPDATE user_sessions SET isRevoked=true WHERE userId=:id AND id != :currentSessionId`. A sessão corrente NÃO é revogada — o usuário continua logado com a nova senha para melhor UX.

5. **Gate de `force_pwd_reset` no Middleware:** O middleware de autenticação DEVE verificar `force_pwd_reset` em cada requisição protegida. Se `true`, bloquear com 403 (`/problems/password-reset-required`) e orientar para `PUT /auth/change-password`. **Exceção:** a própria rota `PUT /auth/change-password` nunca é bloqueada por este gate.

6. **`forcePwdReset` Zerado:** Após troca bem-sucedida, `UPDATE users SET forcePwdReset=false`. Idêntico ao comportamento do F04.

7. **Auditoria Obrigatória:** Evento `auth.password_changed` com `actorId=user.id`, `entity_type=user`, `entity_id=user.id`, `correlation_id` e `tenant_id`. Seguir formato `DATA-003`.

8. **`X-Correlation-ID` Obrigatório (DOC-ARC-003):** Toda resposta (sucesso e erro) DEVE propagar `X-Correlation-ID`. Erros RFC 9457 DEVEM incluir `extensions.correlationId`.

9. **Idempotência em `PUT /auth/change-password` (DOC-DEV-001):** O endpoint DEVE suportar `Idempotency-Key`. Reenvios com a mesma chave dentro de TTL de 60 segundos retornam a resposta cacheada sem novo hash nem nova revogação de sessões.

10. **Não usar este endpoint para confirmação de identidade em outros fluxos:** Este endpoint é exclusivamente para troca de senha autenticada. Confirmação de identidade para operações sensíveis (ex: exclusão de conta) deve ser tratada em US separada.

---

## 5. Definition of Ready (DoR) — Para Iniciar o Desenvolvimento

- [x] Owner definido.
- [x] Cenários Gherkin revisados e aprovados (seção 3).
- [x] Contrato `PUT /auth/change-password` documentado no OpenAPI com `operationId=changePassword_US-MOD-000-F10`.
- [x] Comportamento do middleware `force_pwd_reset` alinhado com US-MOD-000-F01 (gate de sessão) e documentado como regra do middleware.
- [x] Sem `PENDENTE-XXX` críticos em aberto.
- [x] Épico US-MOD-000 **aprovado**.

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `aprovada`.
