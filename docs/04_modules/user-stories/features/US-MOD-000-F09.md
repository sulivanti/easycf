# US-MOD-000-F09 — Vinculação de Usuários a Filiais com Roles (tenant_users)

**Status:** `em revisao`
**Data:** 2026-03-05
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-000** (Foundation — Tenant-User Binding)
**Referências Normativas:** DOC-DEV-001 §7, §8.2 | DOC-ESC-001 §Multi-Tenant | DOC-GNP-00 §RBAC | DOC-ARC-001 | DOC-ARC-003

## Metadados de Governança

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-06
- **rastreia_para:** US-MOD-000, US-MOD-000-F06, US-MOD-000-F07, DOC-DEV-001, DOC-ARC-001, DOC-ARC-002, DOC-ARC-003, DOC-ESC-001, DOC-GNP-00
- **nivel_arquitetura:** 2 (multi-tenant isolado, RBAC pivot, invalidação de cache Redis, audit trail)
- **referencias_exemplos:** N/A
- **evidencias:** *(adicionar links de PR/issue ao longo do refinamento)*

---

## 1. Contexto e Problema

O módulo `tenantUsers.routes.ts` é o **hub central** da plataforma: vincula `userId`, `tenantId` e `roleId` formando o triple de identidade-organização-acesso.

Sem esta US formalizada, há risco de:

- Confundir "suspensão" (bloquear vínculo num tenant) com "exclusão do usuário da plataforma" — operações radicalmente diferentes com impactos distintos de LGPD.
- Realizar mudanças de role sem invalidar o cache Redis, mantendo permissões antigas ativas.
- Não gerar trilha de auditoria granular para detecção de fraudes de acesso.

---

## 2. A Solução (Linguagem de Negócio)

Como **administrador global / gerente de filial**, quero vincular um usuário a um tenant atribuindo-lhe um papel (`roleId`). Posso suspendê-lo temporariamente no contexto do tenant, alterar seu papel ou desvincular definitivamente — sem nunca excluir o usuário da plataforma.

### Modelo do Pivot `tenant_users`

```text
PK composta: (userId, tenantId) — um único role por usuário por filial

tenant_users
  userId    → FK users.id
  tenantId  → FK tenants.id
  roleId    → FK roles.id
  status    → ACTIVE | BLOCKED | INACTIVE
  createdAt
  updatedAt
  deletedAt → soft delete (LGPD)
```

### Implicações de Status no Pivot

| Status | Usuário acessa outras filiais? | Acesso a esta filial |
|---|---|---|
| `ACTIVE` | ✅ Sim | ✅ Sim |
| `BLOCKED` | ✅ Sim | ❌ Não (403 via `requireTenantScope`) |
| `INACTIVE`| ✅ Sim | ❌ Não (registro oculto de listagens) |

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Gestão do Vínculo Usuário-Tenant (tenant_users)

  Cenário: Criação de vínculo bem-sucedida
    Dado que o usuário "uuid-user" existe com status ACTIVE
    E o tenant "uuid-tenant" existe com status ACTIVE
    E a role "uuid-role" existe
    Quando POST /tenants/uuid-tenant/users é chamado com {"userId":"uuid-user","roleId":"uuid-role","status":"ACTIVE"}
    Então deve retornar 201 com o vínculo criado
    E uma linha deve ser inserida em tenant_users com status=ACTIVE
    E o evento tenant_user.added deve ser emitido com {userId, tenantId, roleId}
    E a auditoria tenant_users.created deve ser gerada com actorId=admin.id

  Cenário: Prevenção de vínculo duplicado (userId+tenantId já existe)
    Dado que o vínculo (userId="uuid-user", tenantId="uuid-tenant") já existe na tabela
    Quando POST /tenants/uuid-tenant/users é chamado com o mesmo userId
    Então deve retornar 409 com type="/problems/conflict"
    E detail deve indicar que o usuário já está vinculado a este tenant

  Cenário: Alteração de role do usuário no tenant
    Dado que o vínculo (userId, tenantId) existe com roleId="operador-uuid"
    Quando PUT /tenants/uuid-tenant/users/uuid-user é chamado com {"roleId":"admin-uuid"}
    Então a linha em tenant_users deve ter roleId atualizado para "admin-uuid"
    E o cache Redis com a key "auth:scopes:role:operador-uuid" deve receber DEL
    E o evento tenant_user.role_changed deve ser emitido
    E a auditoria tenant_users.updated deve ser gerada com actorId=admin.id

  Cenário: Suspensão de usuário no tenant (BLOCKED no pivot)
    Dado que o vínculo existe com status=ACTIVE
    Quando PATCH /tenants/uuid-tenant/users/uuid-user é chamado com {"status":"BLOCKED"}
    Então status do vínculo deve ser BLOCKED
    E o usuário continua ativo em outros tenants (sem alterar users.status)
    E a próxima requisição do usuário neste tenant deve retornar 403 via requireTenantScope
    E o evento tenant_user.blocked deve ser emitido

  Cenário: Desvinculação do usuário do tenant (soft delete no pivot)
    Dado que o vínculo existe com status=ACTIVE ou BLOCKED
    Quando DELETE /tenants/uuid-tenant/users/uuid-user é chamado
    Então status deve mudar para INACTIVE e deletedAt = now() no pivot tenant_users
    E o registro em users NÃO deve ser alterado (usuário permanece ativo na plataforma)
    E o evento tenant_user.removed deve ser emitido com {userId, tenantId}

  Cenário: Usuário BLOCKED no pivot tenta acessar rota do tenant
    Dado que o vínculo (userId, tenantId) tem status=BLOCKED
    Quando o usuário faz qualquer requisição autenticada com X-Tenant-ID=uuid-tenant
    Então o middleware requireTenantScope deve retornar 403 com type="/problems/forbidden"
    E detail deve indicar acesso suspenso neste tenant
```

---

## 4. Regras Críticas / Restrições Especiais

1. **`requireTenantScope` é o guard inquebrável:** Toda rota que necessite contexto de tenant passa por este middleware. Ele verifica `status` do vínculo no pivot — não apenas a existência. `BLOCKED` e `INACTIVE` resultam em 403.
2. **Desvinculação ≠ Exclusão da Plataforma (LGPD):** `DELETE /tenants/:id/users/:userId` executa `status=INACTIVE` + `deletedAt=now()` no pivot `tenant_users`. **Nunca altera nem exclui** o registro em `users` ou `content_users`.
3. **Invalidação de Cache Redis:** Toda alteração de `roleId` deve executar `DEL auth:scopes:role:{roleId_antigo}` para que o próximo request busque as permissões atualizadas. Falha no DEL não deve derrubar a operação.
4. **Audit Trail Obrigatória (DATA-003):** Adições (`tenant_user.added`), mudanças de role (`tenant_user.role_changed`), bloqueios (`tenant_user.blocked`) e remoções (`tenant_user.removed`) DEVEM gerar evento na `domain_events` com `correlation_id`, `entity_type=tenant_user`, `sensitivity_level=1`.
5. **PK Composta (userId + tenantId):** Um usuário só pode ter **um role ativo por tenant**. Tentativa de vínculo duplicado retorna 409.
6. **`X-Correlation-ID` Obrigatório (DOC-ARC-003):** Toda resposta DEVE propagar o `X-Correlation-ID`. Eventos de domínio emitidos DEVEM incluir `correlation_id` e `causation_id` conforme `DATA-003`.
7. **Idempotência em `POST /tenants/:id/users` (DOC-DEV-001):** O endpoint DEVE suportar `Idempotency-Key`. Reenvios com a mesma chave dentro de TTL de 60 segundos retornam o vínculo já criado sem criar duplicata nem emitir evento duplicado.
8. **Campo `codigo` no Pivot (DOC-DEV-001 §DATA-XXX):** O pivot `tenant_users` com PK composta `(userId, tenantId)` não requer campo `codigo` próprio. Se houver necessidade de referenciar um vínculo externamente, expor `userId+tenantCode` como chave amigável. Esta decisão deve ser registrada em ADR antes da implementação.

---

## 5. Definition of Ready (DoR) — Para Iniciar o Desenvolvimento

- [ ] Owner definido.
- [ ] Cenários Gherkin revisados e aprovados.
- [ ] Modelo do pivot `tenant_users` revisado pelo time de dados (confirmação da PK composta e soft delete).
- [ ] Comportamento do `requireTenantScope` ao verificar status do pivot documentado.
- [ ] Contrato dos endpoints documentado no OpenAPI (`/tenants/:id/users`, `PUT`, `PATCH`, `DELETE`).
- [ ] Features US-MOD-000-F06 e US-MOD-000-F07 **aprovadas** (dependência de roles e tenants).
- [ ] Épico US-MOD-000 **aprovado**.

---

> ⚠️ **Atenção:** As automações de arquitetura (`scaffold-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `aprovada`.
