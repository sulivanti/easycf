# US-MOD-000-F08 — Perfil do Usuário Autenticado (Consulta e Edição)

**Status Ágil:** `DRAFT`
**Data:** 2026-03-05
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-000** (Foundation — User Profile)
**Referências Normativas:** DOC-DEV-001 §4.1, §8.2 | DOC-ARC-003 (Ponte UI ↔ API) | DOC-UX-010 (Telemetria de UI) | DOC-ARC-001

## Metadados de Governança

- **status_agil:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-06
- **rastreia_para:** US-MOD-000, US-MOD-000-F01, US-MOD-000-F07, US-MOD-000-F09, DOC-DEV-001, DOC-ARC-001, DOC-ARC-003
- **nivel_arquitetura:** 1 (leitura enriquecida de sessão, kill-switch via banco, correlação UI→API)
- **referencias_exemplos:** N/A
- **evidencias:** *(adicionar links de PR/issue ao longo do refinamento)*

---

## 1. Contexto e Problema

O endpoint `/auth/me` é o ponto de entrada do frontend para montar a interface após o login. Falta formalizar:

- Quais dados são retornados (e quais são **excluídos** obrigatoriamente por segurança).
- Como a listagem de filiais vinculadas (`tenants`) é estruturada na resposta.
- O comportamento de `force_pwd_reset=true` no contrato da API.
- Que a verificação de sessão (kill-switch) é **ativa no banco a cada chamada**, não apenas via JWT.

---

## 2. A Solução (Linguagem de Negócio)

Como **frontend autenticado**, preciso chamar `GET /auth/me` para obter em uma única requisição:
os dados de apresentação do usuário, a lista de filiais às quais ele pertence (com seus roles), e flags de estado pendente (`force_pwd_reset`).

### Contrato de Resposta Esperado (`GET /auth/me`)

```json
{
  "id": "uuid",
  "email": "joao@empresa.com",
  "status": "ACTIVE",
  "force_pwd_reset": false,
  "profile": {
    "fullName": "João Silva",
    "avatarUrl": "https://...",
    "cpfCnpj": null
  },
  "tenants": [
    { "tenantId": "uuid", "tenantName": "Filial SP", "roleId": "uuid", "roleName": "Admin", "status": "ACTIVE" }
  ]
}
```

> **Nunca retornar:** `passwordHash`, `mfaSecret`, `deletedAt`.

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Consulta do Perfil do Usuário Autenticado

  Cenário: Retorno do perfil completo com sessão válida
    Dado que o usuário está autenticado com accessToken válido
    E a sessão correspondente ao sessionId do JWT tem isRevoked=false no banco
    Quando GET /auth/me é chamado
    Então deve retornar 200
    E o body deve conter: id, email, status, force_pwd_reset, profile{}, tenants[]
    E NÃO deve conter passwordHash nem mfaSecret
    E tenants[] deve listar todos os vínculos do usuário (incluindo tenants BLOCKED)

  Cenário: JWT válido mas sessão revogada (Kill-Switch ativo)
    Dado que o sessionId no payload do JWT aponta para uma sessão com isRevoked=true
    Quando GET /auth/me é chamado (mesmo com JWT ainda dentro do TTL)
    Então deve retornar 401 com type="/problems/session-revoked"
    E o detail deve instruir o usuário a fazer login novamente

  Cenário: Profile nulo (usuário criado sem content_users)
    Dado que existe um usuário em users mas SEM registro correspondente em content_users
    Quando GET /auth/me é chamado
    Então deve retornar 200
    E o campo profile deve ser null (sem erro 500)
    E o campo tenants[] deve continuar retornando normalmente

  Cenário: Usuário sem vínculos de tenant
    Dado que o usuário existe mas não tem registros em tenant_users
    Quando GET /auth/me é chamado
    Então deve retornar 200
    E tenants[] deve ser um array vazio []

  Cenário: Edição de dados de perfil
    Dado que o usuário está autenticado
    Quando PUT /users/:id é chamado com {"full_name": "Novo Nome"}
    Então deve atualizar fullName em content_users (não em users)
    E deve retornar 200 com o dado atualizado
    E o evento user.updated deve ser emitido com actorId=user.id
    E passwordHash NÃO deve ser alterado por este endpoint (ver US-MOD-000-F10 para alteração de senha autenticada)

  Cenário: Editar perfil de outro usuário sem permissão
    Dado que o usuário autenticado tem id="uuid-A"
    Quando PUT /users/uuid-B é chamado sem escopo de admin
    Então deve retornar 403 com type="/problems/forbidden"
```

---

## 4. Regras Críticas / Restrições Especiais

1. **Verificação Ativa de Sessão no `/me`:** `verifyActiveSession()` consulta a tabela `user_sessions` a **cada requisição**. JWT válido com `isRevoked=true` na sessão resulta em 401 imediato.
2. **Campos Proibidos na Resposta:** `passwordHash`, `mfaSecret`, `deletedAt` são **sempre omitidos** — inclusive em erros de validação/log.
3. **Tolerância a Profile Nulo:** Contas SSO ou migradas podem não ter `content_users`. A resposta deve tolerar `profile=null` sem lançar exceção.
4. **Tenants com BLOCKED incluídos:** O frontend precisa de todos os vínculos (incluindo bloqueados) para renderizar badges/mensagens de aviso corretos.
5. **Rastreabilidade (DOC-ARC-003):** O `X-Correlation-ID` retornado nos headers de resposta deve ser logado pela UI para rastreabilidade ponta a ponta.

---

## 5. Definition of Ready (DoR) — Para Iniciar o Desenvolvimento

- [ ] Owner definido.
- [ ] Cenários Gherkin revisados e aprovados.
- [ ] Contrato de `GET /auth/me` e `PUT /users/:id` documentado no OpenAPI.
- [ ] Comportamento de `force_pwd_reset` no middleware (gate de acesso) definido em US-MOD-000-F01.
- [ ] Modelo de dados (`users` + `content_users` + `tenant_users`) validado com F05, F07, F09.
- [ ] Épico US-MOD-000 **aprovado**.

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `aprovada`.
