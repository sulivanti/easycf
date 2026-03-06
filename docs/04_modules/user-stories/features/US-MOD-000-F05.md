# US-MOD-000-F05 — Cadastro e Gestão de Usuários (CRUD + Soft Delete + Auto-Registro)

**Status:** `para aprovação`
**Data:** 2026-03-05
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-000** (Foundation — Users)
**Referências Normativas:** DOC-DEV-004 §5.1, §8.2 | DOC-ARC-001 | DOC-ARC-002 | LGPD (Lei 13.709/2018)

---

## 1. Contexto e Problema

O sistema possui um módulo completo de gestão de usuários em `apps/api/src/modules/users/users.routes.ts`, mas não existe User Story que defina os campos obrigatórios no auto-registro, a estrutura separada de duas tabelas (`users` vs `content_users`), a paginação cursor-based e as regras de soft delete para compliance com LGPD.

---

## 2. A Solução (Linguagem de Negócio)

Como **usuário anônimo**, quero me auto-registrar fornecendo e-mail, senha, nome completo e CPF/CNPJ (opcional).

Como **administrador**, quero listar, consultar, editar e desativar usuários preservando os dados via soft delete para auditoria.

### Modelo de Dados — Separação de Identidade / Conteúdo

```text
users (Autenticação)             content_users (Dados de Exibição)
──────────────────────           ─────────────────────────────────
id (PK)                          userId (PK, FK → users.id)
email (UNIQUE)                   fullName
passwordHash                     cpfCnpj (UNIQUE)
status (ACTIVE|BLOCKED|...)      avatarUrl
createdAt, deletedAt             createdAt, deletedAt
```

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Cadastro e Gestão de Usuários

  Cenário: Auto-registro bem-sucedido
    Dado que POST /api/v1/users é público
    Quando um usuário envia {"email":"a@a.com", "password":"...", "full_name":"...", "cpf_cnpj":"..."}
    Então o status deve ser 201 com os dados criados (nunca retornando passwordHash)
    E deve inserir atômicamente em users (status=ACTIVE) e content_users
    E o evento user.created deve ser emitido
    E MailService.sendWelcomeEmail deve ser chamado de forma assíncrona (fire-and-forget)

  Cenário: Auto-registro com e-mail duplicado
    Dado que o e-mail já existe
    Quando chamado
    Então deve retornar 409 com type="/problems/conflict"

  Cenário: Listagem paginada (cursor-based)
    Dado que o usuário está autenticado
    Quando GET /api/v1/users?limit=20 é chamado
    Então deve retornar 200 com {data: [...], meta: {limit, nextCursor}}
    E cada item deve omitir dados sensíveis

  Cenário: Soft Delete do Usuário
    Dado que o admin tem escopo correto
    Quando DELETE /api/v1/users/:id é chamado
    Então status vira INACTIVE e deletedAt é preenchido em users/content_users
    E a operação deve ser soft delete (dados preservados para LGPD)
    E evento user.deleted emitido
```

---

## 4. Regras Críticas / Restrições Especiais

1. **Soft Delete Obrigatório (LGPD):** Nunca hard delete. `deletedAt` ativado em ambas as tabelas e status `INACTIVE`.
2. **Transação Atômica:** Inserção em `users` e `content_users` deve usar transação Drizzle.
3. **Limpeza de Response:** Nunca retornar `passwordHash` ou `mfaSecret` nos resumos e profiles.
4. **Boas-Vindas Assíncrono:** `sendWelcomeEmail` é fire-and-forget `.catch(console.error)`. Falha no e-mail não bloqueia o 201.
5. **Paginação:** Exclusivamente via `cursor` na listagem para performance (sem problema de records shiftados).

---
> ⚠️ **Atenção:** As automações de arquitetura (`scaffold-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `aprovada`.
