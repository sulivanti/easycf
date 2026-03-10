# US-MOD-000-F06 — Gestão de Perfis (Roles) e Controle de Acesso Baseado em Escopos (RBAC)

**Status Ágil:** `DRAFT`
**Data:** 2026-03-05
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-000** (Foundation — RBAC)
**Referências Normativas:** DOC-DEV-001 §6, §8.2 | DOC-ARC-001 | DOC-GNP-00 §RBAC | DOC-ESC-001

## Metadados de Governança

- **status_agil:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-06
- **rastreia_para:** US-MOD-000, DOC-DEV-001, DOC-ARC-001, DOC-ESC-001, DOC-GNP-00
- **nivel_arquitetura:** 2 (RBAC + cache Redis + domain events de permissões)
- **referencias_exemplos:** N/A
- **evidencias:** *(adicionar links de PR/issue ao longo do refinamento)*

---

## 1. Contexto e Problema

O sistema implementou um módulo RBAC completo em `apps/api/src/modules/roles/roles.routes.ts` operando com escopos no padrão `módulo:recurso:ação`.
Porém, sem esta US, faltam documentações e garantias sobre: o padrão de regex dos escopos, a substituição total de escopos no UPDATE (não é append), o funcionamento do cache Redis e sua invalidação automática, e as mensagens de erro (403 Forbidden) do `requireScope`.

---

## 2. A Solução (Linguagem de Negócio)

Como **administrador do sistema**, quero gerenciar Roles atribuindo conjuntos de escopos de permissão, para controlar o acesso de grupos de usuários.

Como **time de engenharia**, queremos que o RBAC siga um padrão imutável de escopo, que tenha alto desempenho (cache Redis) e que o middleware não chame o banco em requisições repetidas.

### Padrão de Escopos

```text
Formato: módulo:recurso:ação
Regex:   ^[a-z_]+:[a-z_]+:[a-z_]+$

Exemplos válidos: roles:write, users:profile:read, finance:invoice:approve
Exemplos inválidos: Roles:Write (maiúsculas), finance::approve (vazio no meio)
```

### Comportamento de Atualização (Substituição vs. Append)

```text
ANTES: role "Admin" tem escopos [users:profile:read, roles:write]
PUT /roles/{id} { scopes: ["finance:invoice:approve"] }
DEPOIS: role "Admin" tem escopos [finance:invoice:approve] (substituiu o anterior)
```

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Gestão de Roles e RBAC por Escopos

  Cenário: Criação de role com escopos válidos
    Dado que o usuário tem o escopo "roles:write"
    Quando POST /api/v1/roles é chamado com name, description e scopes
    Então deve retornar 201 com a role criada e inserções atômicas em roles e role_scopes
    E o evento role.created deve ser emitido
    E a auditoria roles.role.created deve ser gerada

  Cenário: Criação sem o escopo roles:write (Forbidden)
    Dado que o usuário não tem o escopo "roles:write"
    Quando GET, POST, PUT, DELETE /api/v1/roles é chamado
    Então deve retornar 403 com RFC 9457 (type="/problems/forbidden")

  Cenário: Escopo com formato inválido
    Dado que o body contém um escopo "Roles:Write"
    Quando chamado
    Então deve retornar 422 com erro de validação (Zod) informando o regex

  Cenário: Substituição completa de escopos via atualização (PUT)
    Dado que a role tem dois escopos
    Quando PUT /roles/:id altera para *um* novo escopo
    Então os antigos são deletados (transaction)
    E apenas o novo permanece

  Cenário: Cache Redis deve ser invalidado
    Dado que existe cache na key "auth:scopes:role:{id}"
    Quando ocorre PUT ou DELETE
    Então o Redis executa DEL "auth:scopes:role:{id}" e força fetch no próximo request

  Cenário: Exclusão de role existente (Soft Delete)
    Dado que a role é deletada via DELETE /roles/:id
    Então deve alterar o status para INACTIVE e preencher deletedAt (mantendo integridade referencial)
    E cache Redis limpo
```

---

## 4. Regras Críticas / Restrições Especiais

1. **Padrão de Escopo Imutável:** Regex `^[a-z_]+:[a-z_]+:[a-z_]+$`. Validação de entrada obrigatória para bloquear maiúsculas.
2. **Substituição Total de Escopos:** PUT faz DELETE + INSERT via transação Drizzle. Não é append.
3. **Cache Redis Obrigatório:** Key `auth:scopes:role:{roleId}` é preenchida no middleware `requireScope`. DEL é executado sempre que uma mutação ocorre na role.
4. **Resiliência do Cache:** Falha no comando Redis `DEL` ou `SET` NÃO pode derrubar as rotas CRUD. Deve-se capturar com silencioso e prosseguir.
5. **Soft Delete de Roles:** A exclusão preenche `deletedAt` e altera `status=INACTIVE`. Não utiliza remoção física (hard delete) para preservar histórico referencial de auditoria.
6. **`X-Correlation-ID` Obrigatório (DOC-ARC-003):** Toda resposta DEVE propagar o `X-Correlation-ID`. Erros 403 (sem escopo) e 422 (formato inválido) DEVEM incluir `extensions.correlationId`. O evento `role.created` DEVE incluir `correlation_id` conforme `DATA-003`.
7. **Campo `codigo` Constitucional em `roles` (DOC-DEV-001 §DATA-XXX):** A tabela `roles` DEVE conter o campo `codigo` (`varchar(100)`, NOT NULL, UNIQUE) como identificador amígável de negócio (ex: `admin`, `operador-financeiro`). Este campo é distinto do `id` UUID e do `name`.

---

## 5. Definition of Ready (DoR) — Para Iniciar o Desenvolvimento

- [ ] Owner definido.
- [ ] PENDENTE-F06-001 (hard delete vs soft delete de roles) resolvido.
- [ ] Cenários Gherkin revisados e aprovados.
- [ ] Contrato dos endpoints documentado no OpenAPI (`/roles`, `/roles/:id`).
- [ ] Sem `PENDENTE-XXX` críticos em aberto.
- [ ] Épico US-MOD-000 **aprovado**.

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `aprovada`.
