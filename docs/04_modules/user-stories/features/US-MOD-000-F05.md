# US-MOD-000-F05 — Cadastro e Gestão de Usuários (CRUD + Soft Delete + Auto-Registro)

**Status Ágil:** `READY`
**Data:** 2026-03-05
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-000** (Foundation — Users)
**Referências Normativas:** DOC-DEV-001 §5.1, §8.2 | DOC-ARC-001 | DOC-ARC-002 | LGPD (Lei 13.709/2018)

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-000, DOC-DEV-001, DOC-ARC-001, DOC-ARC-002
- **nivel_arquitetura:** 1 (CRUD + soft delete + cursor pagination)
- **referencias_exemplos:** N/A
- **evidencias:** *(adicionar links de PR/issue ao longo do refinamento)*
- **wave_entrega:** Wave 1
- **epico_pai:** US-MOD-000
- **manifests_vinculados:** ux-user-001, ux-user-002
- **pendencias:** N/A

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
id (PK, uuid)                    userId (PK, FK → users.id)
codigo (varchar, UNIQUE)          ← identificador amígável de negócio (ex: usr-00042)
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
4. **Boas-Vindas Assíncrono (INT-000-MAIL):** `sendWelcomeEmail` é fire-and-forget `.catch(console.error)`. O contrato `INT-000-MAIL` DEVE declarar `Timeout`, `Retry (3x)` e `DLQ: Sim` conforme `DOC-DEV-001 §4.3`. Falha no e-mail não bloqueia o 201.
5. **Paginação:** Exclusivamente via `cursor` na listagem para performance (sem problema de records shiftados).
6. **`X-Correlation-ID` Obrigatório (DOC-ARC-003):** Toda resposta DEVE propagar o `X-Correlation-ID`. O evento `user.created` DEVE incluir `correlation_id` no payload conforme `DATA-003`.
7. **Idempotência em `POST /api/v1/users` (DOC-DEV-001):** O endpoint de auto-registro DEVE suportar `Idempotency-Key`. Reenvios com a mesma chave dentro de TTL de 60 segundos retornam o registro já criado (ou 409 se já houver conflito) sem criar usuário duplicado.
8. **Campo `codigo` Constitucional (DOC-DEV-001 §DATA-XXX):** A tabela `users` DEVE conter o campo `codigo` (`varchar(100)`, NOT NULL, UNIQUE) como identificador amígável de negócio (ex: `usr-00042`). Questo campo é distinto do `email` e do `id` UUID.

---

## 5. Definition of Ready (DoR) — Para Iniciar o Desenvolvimento

- [x] Owner definido.
- [x] Cenários Gherkin revisados e aprovados.
- [x] Modelo de dados (`users` + `content_users`) revisado pelo time de dados.
- [x] Contrato dos endpoints documentado no OpenAPI (`POST /users`, `GET /users`, `DELETE /users/:id`).
- [x] Política de LGPD para `deletedAt` validada com compliance.
- [x] Épico US-MOD-000 **aprovado**.

---
> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `aprovada`.
