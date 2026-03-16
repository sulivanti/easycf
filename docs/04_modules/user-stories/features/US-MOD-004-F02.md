# US-MOD-004-F02 — API: Compartilhamento Controlado e Delegação Temporária

**Status Ágil:** `READY`
**Versão:** 1.0.0
**Data:** 2026-03-15
**Módulo Destino:** **MOD-004** (Identidade Avançada — Backend)
**Referências Normativas:** DOC-DEV-001 §6, DOC-ARC-003, LGPD-BASE-001

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-004, DOC-DEV-001 §6, LGPD-BASE-001, DOC-ARC-003
- **nivel_arquitetura:** 2 (multi-tenant, cache Redis, domain events, vigência controlada)
- **tipo:** Backend — cria novos endpoints
- **epico_pai:** US-MOD-004
- **manifests_vinculados:** N/A
- **evidencias:** N/A

---

## 1. Contexto

Dois mecanismos distintos precisam coexistir:

**Compartilhamento controlado (`access_shares`):**
Regra formal pela qual um administrador expande a visibilidade de um recurso para outro usuário, fora do escopo principal, com motivo documentado, autorizador distinto e vigência obrigatória.

**Delegação temporária (`access_delegations`):**
Mecanismo pelo qual um *usuário* transfere um subconjunto de suas próprias permissões para outro usuário por um período limitado — sem transferir poder decisório (aprovação, execução de movimentos controlados).

---

## 2. Regras Fundamentais

### access_shares
- `authorized_by ≠ grantor_id` — quem solicita não pode se auto-autorizar (segregação de funções)
- `valid_until` obrigatório — não existe compartilhamento permanente via este mecanismo
- `reason` obrigatório — rastreabilidade
- Revogação disponível a qualquer momento pelo `authorized_by` ou por admin com scope `identity:share:revoke`

### access_delegations
- `valid_until` obrigatório — não existe delegação permanente
- `delegated_scopes` NUNCA pode conter `*:approve`, `*:execute`, `*:sign` — validado no service
- O delegatee não pode sub-delegar (sem re-delegação em cadeia)
- O delegator só pode delegar escopos que ele próprio possui

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Compartilhamento Controlado e Delegação Temporária

  # ── access_shares ────────────────────────────────────────────
  Cenário: Criar compartilhamento controlado válido
    Dado que admin tem scope identity:share:write
    E grantor_id != authorized_by
    E valid_until está no futuro
    Quando POST /api/v1/admin/access-shares com todos os campos obrigatórios
    Então o status deve ser 201
    E access_shares é criado com status=ACTIVE
    E o evento identity.share_created é emitido com correlation_id

  Cenário: Rejeitar compartilhamento com grantor = authorized_by
    Dado que grantor_id = authorized_by = "user-A"
    Quando POST /api/v1/admin/access-shares
    Então deve retornar 422: "O autorizador não pode ser o mesmo que o solicitante (segregação de funções)."

  Cenário: Rejeitar compartilhamento sem valid_until
    Dado que valid_until não está no body
    Então deve retornar 422: "A data de expiração é obrigatória para compartilhamentos."

  Cenário: Rejeitar compartilhamento sem motivo
    Dado que reason está vazio ou ausente
    Então deve retornar 422: "O motivo do compartilhamento é obrigatório."

  Cenário: Revogar compartilhamento ativo
    Dado que o admin ou authorized_by chama DELETE /admin/access-shares/:id
    Então status=REVOKED e revoked_at=now() e revoked_by=caller.id
    E evento identity.share_revoked emitido

  Cenário: Expiração automática pelo background job
    Dado que valid_until < now() e status=ACTIVE
    Quando o job roda a cada 5 minutos
    Então status=EXPIRED e o evento identity.share_expired é emitido
    E o grantee perde o acesso no próximo request

  Cenário: Grantee consulta compartilhamentos recebidos
    Dado que o usuário tem 2 shares ativos para ele
    Quando GET /api/v1/my/shared-accesses
    Então retorna apenas os shares com status=ACTIVE destinados ao caller
    E inclui resource_type, resource_id, allowed_actions, valid_until, reason

  Cenário: Listagem admin com filtros
    Dado que admin tem scope identity:share:read
    Quando GET /api/v1/admin/access-shares?status=ACTIVE&grantee_id=uuid
    Então retorna shares filtrados com paginação cursor-based

  # ── access_delegations ───────────────────────────────────────
  Cenário: Criar delegação temporária válida
    Dado que o delegator tem scope "finance:invoice:read" em seu token
    Quando POST /api/v1/access-delegations com { delegatee_id, delegated_scopes: ["finance:invoice:read"], valid_until }
    Então o status deve ser 201
    E access_delegations é criado com status=ACTIVE
    E evento identity.delegation_created emitido

  Cenário: Rejeitar delegação com escopo de aprovação
    Dado que delegated_scopes contém "finance:invoice:approve"
    Quando POST /api/v1/access-delegations
    Então deve retornar 422: "Delegações não podem incluir escopos de aprovação, execução ou assinatura."

  Cenário: Rejeitar delegação de escopo que o delegator não possui
    Dado que o delegator não tem "hr:salary:read" em seu token
    Quando tenta delegar "hr:salary:read"
    Então deve retornar 422: "Não é possível delegar um escopo que você não possui."

  Cenário: Rejeitar sub-delegação (re-delegação em cadeia)
    Dado que user-B recebeu delegação de user-A
    Quando user-B tenta criar nova delegação com os mesmos escopos para user-C
    Então deve retornar 422: "Escopos obtidos por delegação não podem ser re-delegados."

  Cenário: Revogar delegação própria
    Dado que o delegator chama DELETE /api/v1/access-delegations/:id
    Então status=REVOKED e revoked_at=now()
    E evento identity.delegation_revoked emitido

  Cenário: Listar delegações ativas (como delegator e delegatee)
    Dado que o usuário tem 2 delegações dadas e 1 recebida
    Quando GET /api/v1/access-delegations
    Então retorna tanto "given" (delegadas por mim) quanto "received" (delegadas para mim)
    Filtrando apenas status=ACTIVE

  Cenário: Expiração automática de delegação
    Dado que valid_until < now() e status=ACTIVE
    Quando o background job roda
    Então status=EXPIRED e o evento identity.delegation_expired emitido
```

---

## 4. Background Job de Expiração

```
Job: expire_identity_grants
Frequência: a cada 5 minutos (cron: */5 * * * *)
BullMQ queue: identity-expiration

O job executa em lote:
  UPDATE access_shares SET status='EXPIRED' WHERE valid_until < now() AND status='ACTIVE'
  UPDATE access_delegations SET status='EXPIRED' WHERE valid_until < now() AND status='ACTIVE'

Para cada registro expirado → emite domain_event via Outbox Pattern
Falha no job: DLQ com retry 3x — NÃO bloqueia operações da aplicação
```

---

## 5. Domain Events

| event_type | Trigger | sensitivity_level |
|---|---|---|
| `identity.share_created` | POST access_shares | 1 |
| `identity.share_revoked` | DELETE access_shares | 1 |
| `identity.share_expired` | Background job | 1 |
| `identity.delegation_created` | POST access_delegations | 1 |
| `identity.delegation_revoked` | DELETE access_delegations | 1 |
| `identity.delegation_expired` | Background job | 1 |

---

## 6. Regras Críticas

1. `authorized_by ≠ grantor_id` — CHECK constraint na DB + validação no service
2. `valid_until` obrigatório em AMBOS os mecanismos — sem "permanente"
3. `reason` obrigatório em compartilhamentos — auditabilidade
4. Delegação NUNCA contém `*:approve`, `*:execute`, `*:sign`
5. Delegação SOMENTE de escopos que o delegator possui no token atual
6. Sem re-delegação em cadeia — delegatee não pode sub-delegar
7. Background job via BullMQ com Outbox Pattern — falha não impacta aplicação

## 7. DoR ✅ / DoD

**DoR:** Modelo definido, escopos proibidos em delegação listados, job de expiração arquitetado.
**DoD:** Todos os cenários Gherkin cobertos, background job testado (happy path + DLQ), testes de segregação grantor ≠ authorized_by, testes de escopo proibido em delegação, testes de sub-delegação bloqueada.
