# US-MOD-000-F08 — Perfil do Usuário Autenticado (Consulta e Edição)

**Status:** `para aprovação`
**Data:** 2026-03-05
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-000** (Foundation — User Profile)
**Referências Normativas:** DOC-DEV-004 §4.1, §8.2 | DOC-ARC-003 (Ponte UI ↔ API) | DOC-UX-010 (Telemetria de UI) | DOC-ARC-001

---

## 1. Contexto e Problema

Falta formalizar o conteúdo de resposta do `/auth/me` para o frontend (quais dados expor, listagem de filiais embutida e handling da flag `force_pwd_reset`). A aplicação também requer que a verificação de sessão (kill-switch via banco) seja aplicada diretamente na consulta do perfil, garantindo consistência instantânea com `user_sessions`.

---

## 2. A Solução (Linguagem de Negócio)

Como **frontend**, preciso de um único endpoint (`/auth/me`) para montar a interface: os dados de apresentação, a listagem das filiais às quais o usuário pertence, os roles associados e o estado de requerimentos pendentes (como alteração forçada de senha).

### Dados Retornados por `/auth/me`

O payload deve trazer a intersecção de tabelas de usuário (ocultando hash sensitivos) e a listagem de tenants (`[ { tenantId, roleId, status } ]`).

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Consulta e Edição de Perfil de Usuário

  Cenário: Retorno do perfil completo pós-login
    Dado que GET /auth/me é chamado
    Então o sistema executa verificação ativa no banco em 'user_sessions' além do JWT puro
    E retorna { id, email, status, profile: {...}, tenants: [...] }
    E NÃO expõe passwordHash nem mfaSecret
    E mostra *todos* os tenants inclusive os bloqueados para UI renderizar os badges/mensagens corretos

  Cenário: O frontend manipula a flag `force_pwd_reset`
    Dado que login retorna user.force_pwd_reset = true
    Então o frontend obriga redirecionamento, e as rotas normais impedem o uso se houver barreira baseada em scopes/me
    
  Cenário: Usuário sem registros em content_users
    Dado que uma migração gerou um usuário s/ content
    Quando listar /auth/me
    Então profile deve ser NULL e o front resolve sem crash
    
  Cenário: Usuário Altera o Profile via UPDATE Users
    Dado que ele dispara PUT /users/:id
    Então apenas tabelas de exibição (content_users) sofrem alteração do fullname/cpf (se ele assim solicitar)
    E evento de user.updated é gerado
```

---

## 4. Regras Críticas / Restrições Especiais

1. **Validação Ativa de Sessão no `/me`:** `verifyActiveSession(request)` roda *toda* vez no banco. JWT puro válido com sessão marcada `isRevoked` deve explodir 401 Unauthorized imediato.
2. **Dados null:** Em contas SSO que falham em receber profiles via graph API/Google, o profile tem que saber tolerar nulls para `avatarUrl/fullname`.
3. **Ponte Rastreabilidade:** UI precisa remeter o CorrelationId pros logs.

---

> ⚠️ **Atenção:** As automações de arquitetura (`scaffold-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `aprovada`.
