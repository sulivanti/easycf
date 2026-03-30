---
title: "Próximos Passos MOD-002 — Endpoints MOD-000, Edição de Usuário, Telemetria UX"
version: 1.0
date_created: 2026-03-30
owner: arquitetura
tags: [api, frontend, telemetria, MOD-000, MOD-002]
---

# Introduction

Esta spec consolida os 3 próximos passos identificados após o codegen do dropdown de ações (UX-001-C03): criação de 2 endpoints ausentes no MOD-000-F05, implementação da tela de edição de usuário (MOD-002-F04), e instrumentação de telemetria UX. Cada item é independente e pode ser implementado em paralelo.

## 1. Purpose & Scope

**Propósito:** Documentar contratos técnicos para 3 evoluções que desbloqueiam funcionalidades parcialmente implementadas no MOD-002.

**Escopo:**
- **Item A:** 2 novos endpoints no MOD-000-F05 (reset-password, cancel-invite)
- **Item B:** Tela de edição de usuário + rota /usuarios/:id (MOD-002-F04)
- **Item C:** Hook de telemetria UX para ações do dropdown

**Não inclui:** Alterações no MOD-002 que já foram implementadas (dropdown 4 variantes, hooks, modais).

## 2. Definitions

| Termo | Definição |
|-------|-----------|
| MOD-000-F05 | Feature 05 do Foundation — Users API (CRUD de usuários) |
| MOD-002-F04 | Feature 04 do MOD-002 — Edição de usuário (roadmap) |
| UX-010 | Padrão de catálogo de ações UX (DOC-UX-010) |

## 3. Requirements, Constraints & Guidelines

### Item A — Endpoints MOD-000-F05

- **REQ-A01:** Criar `POST /api/v1/users/:id/reset-password` — admin inicia reset de senha para o usuário. Requer scope `users:user:write`. Envia e-mail de reset via Outbox.
- **REQ-A02:** Criar `DELETE /api/v1/users/:id/invite` — cancela convite pendente. Requer scope `users:user:delete`. Pré-condição: status PENDING (409 se não PENDING). Altera status para INACTIVE.
- **CON-A01:** Ambos endpoints DEVEM seguir RFC 9457 ProblemDetails para erros.
- **CON-A02:** Ambos endpoints DEVEM emitir domain events (DATA-003-M01): `user.password_reset` e `user.invite_cancelled`.
- **CON-A03:** Ambos endpoints DEVEM exigir `tenant_id` no contexto JWT.

### Item B — Tela de Edição (MOD-002-F04)

- **REQ-B01:** Criar rota `/usuarios/:id` no TanStack Router, lazy-loaded.
- **REQ-B02:** Criar `UserEditPage.tsx` — formulário preenchido com dados do usuário (GET /users/:id).
- **REQ-B03:** Campos editáveis: nome, perfil (roleId). E-mail readonly. Toggle de status (se scope write).
- **REQ-B04:** Submit via `PATCH /api/v1/users/:id` (já existe no MOD-000).
- **GUD-B01:** Reutilizar componentes do UserFormPage (campos, validação) via composição.

### Item C — Telemetria UX

- **REQ-C01:** Criar hook `useTelemetry()` em `@modules/foundation/hooks/` que emite eventos `ux.action.requested`, `ux.action.succeeded`, `ux.action.failed`.
- **REQ-C02:** Payload mínimo: `correlation_id`, `screen_id`, `tenant_id`, `action_id`, `timestamp`.
- **CON-C01:** Depende de endpoint de ingestão de telemetria no Foundation (não existe ainda). Hook deve ser no-op gracioso enquanto endpoint não existir.

## 4. Interfaces & Data Contracts

### POST /api/v1/users/:id/reset-password

```
Request:  {} (body vazio)
Headers:  Authorization: Bearer <JWT>, X-Correlation-ID: <uuid>
Response 200: { "message": "Password reset email sent." }
Response 404: ProblemDetails (usuário não encontrado)
Response 403: ProblemDetails (sem scope)
```

### DELETE /api/v1/users/:id/invite

```
Request:  (sem body)
Headers:  Authorization: Bearer <JWT>, X-Correlation-ID: <uuid>
Response 200: { "data": { "id": "<uuid>", "status": "INACTIVE", "updatedAt": "<ISO8601>" } }
Response 404: ProblemDetails (usuário não encontrado)
Response 409: ProblemDetails (status não é PENDING)
Response 403: ProblemDetails (sem scope)
```

## 5. Acceptance Criteria

- **AC-A01:** Given admin com scope `users:user:write`, When POST /users/:id/reset-password, Then 200 + e-mail de reset enviado + domain event `user.password_reset`.
- **AC-A02:** Given usuário com status PENDING, When DELETE /users/:id/invite, Then 200 + status alterado para INACTIVE + domain event `user.invite_cancelled`.
- **AC-A03:** Given usuário com status ACTIVE, When DELETE /users/:id/invite, Then 409 ProblemDetails.
- **AC-B01:** Given admin acessa /usuarios/:id, When dados carregam, Then formulário exibe nome, e-mail (readonly), perfil e status.
- **AC-B02:** Given admin edita nome e clica Salvar, When PATCH /users/:id, Then toast de sucesso + redirect /usuarios.
- **AC-C01:** Given hook useTelemetry instalado, When ação é executada, Then evento emitido (ou no-op se endpoint indisponível).

## 6. Test Automation Strategy

- **Item A:** Testes de integração Fastify (vitest) para ambos endpoints — happy path + erros.
- **Item B:** Testes de componente com `@testing-library/react` para UserEditPage.
- **Item C:** Teste unitário do hook com mock de fetch.

## 7. Rationale & Context

Estes 3 itens foram identificados como lacunas durante o codegen do MOD-002 (UX-001-C03). O dropdown de ações já implementa as 4 variantes por status, mas 2 ações ("Resetar senha" e "Cancelar convite") dependem de endpoints que não existem no MOD-000. A tela de edição é pré-requisito para a ação "Editar" funcionar plenamente. A telemetria é uma lacuna transversal documentada desde o Batch 3 de enriquecimento.

## 8. Dependencies & External Integrations

- **DEP-001:** MOD-000 Foundation — endpoints existentes (PATCH /users/:id, GET /users/:id)
- **DEP-002:** Outbox Pattern — para envio de e-mail de reset de senha
- **DEP-003:** TanStack Router — para nova rota /usuarios/:id

## 9. Examples & Edge Cases

```typescript
// Item A — reset-password use case
async resetPassword(userId: string, adminId: string): Promise<void> {
  const user = await this.usersRepo.findById(userId);
  if (!user) throw new UserNotFoundError(userId);
  const token = crypto.randomUUID();
  await this.usersRepo.setResetToken(userId, token);
  await this.outbox.enqueue('user.password_reset', {
    user_id: userId,
    reset_by: adminId,
    timestamp: new Date().toISOString(),
  });
}
```

**Edge case:** Admin tenta resetar senha de si mesmo — permitido (sem restrição especial).
**Edge case:** DELETE invite quando convite já expirou — ainda cancela (altera status para INACTIVE).

## 10. Validation Criteria

- [ ] Endpoints retornam ProblemDetails RFC 9457 em todos os erros
- [ ] Domain events emitidos com payload correto (sem PII)
- [ ] Tela de edição carrega dados reais via GET /users/:id
- [ ] Hook de telemetria não quebra se endpoint indisponível (graceful no-op)
- [ ] Build TypeScript sem erros (tsc --noEmit)

## 11. Related Specifications / Further Reading

- [UX-001-C03](../04_modules/mod-002-gestao-usuarios/amendments/ux/UX-001-C03.md) — Amendment pai (dropdown 4 variantes)
- [FR-001-M01](../04_modules/mod-002-gestao-usuarios/amendments/fr/FR-001-M01.md) — Ações contextuais completas
- [INT-001-M01](../04_modules/mod-002-gestao-usuarios/amendments/int/INT-001-M01.md) — Contratos dos novos endpoints
- [DATA-003-M01](../04_modules/mod-002-gestao-usuarios/amendments/data/DATA-003-M01.md) — Domain events novos
- [05-users-list-spec.md](ux/05-users-list-spec.md) — Layout de referência

---

## Appendix A: Plano de Execução

### Steps (3 itens independentes — paralelizáveis)

| Step | Item | Módulo | Arquivos afetados | Depende de |
|------|------|--------|-------------------|------------|
| 1A | Endpoint reset-password | MOD-000 | `apps/api/src/modules/foundation/presentation/routes/users.route.ts`, `apps/api/src/modules/foundation/application/use-cases/reset-password.ts`, `apps/api/openapi/v1.yaml` | — |
| 1B | Endpoint cancel-invite | MOD-000 | `apps/api/src/modules/foundation/presentation/routes/users.route.ts`, `apps/api/src/modules/foundation/application/use-cases/cancel-invite.ts`, `apps/api/openapi/v1.yaml` | — |
| 2 | Tela de edição | MOD-002 | `apps/web/src/modules/users/pages/UserEditPage.tsx`, `apps/web/src/modules/users/hooks/use-update-user.ts`, `apps/web/src/routes/_auth.usuarios.$userId.tsx` | 1A (para resetar senha funcionar na edição) |
| 3 | Telemetria UX | MOD-000 + MOD-002 | `apps/web/src/modules/foundation/hooks/use-telemetry.ts`, `apps/web/src/modules/users/pages/UsersListPage.tsx` | — (pode ser no-op) |

### Paralelização

```
Item A (1A+1B)  ──→ [MOD-000 amendments + codegen]
Item B (2)      ──→ [MOD-002 amendment + codegen]    (pode rodar em paralelo)
Item C (3)      ──→ [hook Foundation + integração]    (pode rodar em paralelo)
```

### Estado dos módulos afetados

| Módulo | estado_item | Ação necessária |
|--------|-------------|-----------------|
| MOD-000 | READY | `/create-amendment` para FR-000, INT (endpoints) |
| MOD-002 | READY | `/create-amendment` para FR (tela edição) |
