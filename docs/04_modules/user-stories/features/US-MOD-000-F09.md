# US-MOD-000-F09 — Vinculação de Usuários a Filiais com Roles (tenant_users)

**Status:** `para aprovação`
**Data:** 2026-03-05
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-000** (Foundation — Tenant-User Binding)
**Referências Normativas:** DOC-DEV-004 §7, §8.2 | DOC-ESC-001 §Multi-Tenant | DOC-GNP-00 §RBAC | DOC-ARC-001 | DOC-ARC-003

---

## 1. Contexto e Problema

O módulo `tenantUsers.routes.ts` é o grande **hub central e coração** da plataforma: vincula Identidade (`userId`), Acesso Organizacional (`tenantId`) e Nível de Escopo/Privilégios (`roleId`).
Sem essa história detalhada, o fluxo operacional de "bloqueio temporário" vs "desvinculação completa" é confundidamente interligado na governança, levando a vazamentos de dados ou deleções acidentais globais de LGPD (remover usuário do tenant != deletar usuário da base inteira).

---

## 2. A Solução (Linguagem de Negócio)

Como **administrador global / gerente de filial**, quero vincular um usuário ao contexto do meu Tenant, escolhendo sua Role (gerente, estoquista, financeiro). Se o usuário for transacionar em múltiplas filiais, cada vinculação é estritamente isolada e gerenciável.

### Ciclo e PK Múltipla

A associação ocorre num registro pivot `[userId, tenantId]` em `tenant_users`. Um usuário só pode assumir *um único* role de contexto para cada filial em que interaja ativamente.

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Gestão do Vínculo Usuário-Tenant

  Cenário: Admin injeta usuário num contexto com gerência
    Dado que POST /tenants/:id/users
    Quando enviar { userId: uuid, roleId: gerenteUuid, status: ACTIVE}
    Então associa o usuário e emite tenant_user.added
    
  Cenário: Prevenção a duplicação na filial
    Dado que usuário X já está no Tenant Y
    Quando forçar novo POST igual
    Então erro 409 Constraint
    
  Cenário: Update na Role = Invalidação imediata do Cache global (Redis)
    Dado que PUT /tenants/:id/users/:id altera de 'Operador' para 'Admin'
    Então é imperativo que a listagem antiga armazenada pra esse par Role+Tenant seja limpada para o escopo requalificar no header subsequente.

  Cenário: Suspensão x Remoção
    Dado que um usuário de tenant recebe status BLOCKED apenas nesse Pivot
    Então sua navegação em outras Tenants continua perfeita. O scope de requireTenantScope corta requisições de 403.
    A Deleção da associação altera `status=INACTIVE` no pivot, sumindo-o da view sem estourar tabelas. 
```

---

## 4. Regras Críticas / Restrições Especiais

1. **Hierarchy Isolation Barrier (requireTenantScope):** Este middleware é o muro inquebrável. Não existe acesso "múltiplo" simultâneo para o content DB sem chave explícita injetando escopo.
2. **Desvinculação ≠ Exclusão da Plataforma (LGPD):** Remover usuário do tenant_users inativa a relation — NUNCA exclua a record de `users` do banco principal.
3. **Eventos Fortes (Audit Trail Obrigatória):** Adições, Mudanças de Role (Up/Down) e bloqueios na modelagem `tenantUsers` requerem trilha granular pro Compliance verificar fraudes.

---

> ⚠️ **Atenção:** As automações de arquitetura (`scaffold-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `aprovada`.
