# US-MOD-004-F01 — API: Vínculo Usuário ↔ Estrutura Organizacional

**Status Ágil:** `READY`
**Versão:** 1.0.0
**Data:** 2026-03-15
**Módulo Destino:** **MOD-004** (Identidade Avançada — Backend)
**Referências Normativas:** DOC-DEV-001, DOC-ARC-001, DOC-ARC-003

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-004, US-MOD-000-F06, US-MOD-000-F09, US-MOD-003-F01, DOC-ARC-001, DOC-ARC-003
- **nivel_arquitetura:** 2 (multi-tenant, cache Redis, domain events, vigência controlada)
- **tipo:** Backend — cria novos endpoints
- **epico_pai:** US-MOD-004
- **manifests_vinculados:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **administrador de acesso**, quero vincular usuários a nós da estrutura organizacional (N1–N4) para delimitar em qual *área* cada identidade tem escopo de atuação — complementando o vínculo a filiais já existente no MOD-000-F09.

---

## 2. Regras do Modelo

```
tenant_users  →  QUEM faz O QUÊ em qual FILIAL (N5)        [MOD-000-F09]
user_org_scopes → QUEM atua em qual ÁREA ORGANIZACIONAL (N1–N4) [MOD-004-F01]

São dimensões ORTOGONAIS. Criar um não implica criar o outro.
```

**scope_type:**
- `PRIMARY`: área principal do usuário (máximo 1 por usuário)
- `SECONDARY`: áreas adicionais (sem limite explícito, mas auditável)

**Invalidação de cache Redis:**
Ao criar ou remover um `user_org_scopes`, o sistema DEVE executar `DEL auth:org_scope:user:{userId}` para forçar refetch no próximo acesso a processos/rotinas que filtrem por área.

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: API de Vínculo Usuário ↔ Estrutura Organizacional

  Cenário: Criar vínculo PRIMARY para usuário
    Dado que o admin tem scope identity:org_scope:write
    E o usuário não tem nenhum vínculo PRIMARY ainda
    Quando POST /api/v1/admin/users/:id/org-scopes com { org_unit_id, scope_type: "PRIMARY" }
    Então o status deve ser 201
    E o vínculo é criado em user_org_scopes com status=ACTIVE
    E o cache Redis DEL auth:org_scope:user:{userId} deve ser executado
    E o evento identity.org_scope_granted deve ser emitido

  Cenário: Rejeitar segundo vínculo PRIMARY para o mesmo usuário
    Dado que o usuário já tem um vínculo PRIMARY ativo
    Quando POST /admin/users/:id/org-scopes com scope_type=PRIMARY
    Então deve retornar 409: "Usuário já possui uma área principal (PRIMARY). Revogue-a antes de criar outra."

  Cenário: Criar vínculo SECONDARY adicional
    Dado que o usuário já tem vínculo PRIMARY em N3-Tech
    Quando POST /admin/users/:id/org-scopes com { org_unit_id: N3-Finance, scope_type: "SECONDARY" }
    Então o status deve ser 201
    E o usuário agora tem 2 vínculos org (1 PRIMARY + 1 SECONDARY)

  Cenário: Rejeitar vínculo para nó org inexistente
    Dado que o org_unit_id enviado não existe
    Então deve retornar 404: "Nó organizacional não encontrado."

  Cenário: Rejeitar vínculo em tenant (N5) — somente N1–N4
    Dado que o org_unit_id aponta para um tenant (nível N5 via org_unit_tenant_links)
    Então deve retornar 422: "Vínculos organizacionais só são permitidos em nós N1–N4. Para vínculo com filial, use tenant_users."

  Cenário: Listar vínculos org do usuário com breadcrumb
    Dado que o usuário tem 2 vínculos org
    Quando GET /api/v1/admin/users/:id/org-scopes
    Então retorna array com { id, scope_type, org_unit: { id, codigo, nome, nivel, breadcrumb }, valid_until, status }

  Cenário: Soft delete de vínculo org
    Dado que existe vínculo org com id="scope-uuid"
    Quando DELETE /api/v1/admin/users/:id/org-scopes/:scopeId
    Então deleted_at é preenchido, status=INACTIVE
    E cache Redis DEL auth:org_scope:user:{userId} é executado
    E evento identity.org_scope_revoked emitido

  Cenário: Vínculo com vigência — expiração automática
    Dado que um vínculo é criado com valid_until = amanhã
    Quando o background job roda após a expiração
    Então status vira INACTIVE e deleted_at é preenchido
    E evento identity.org_scope_expired emitido

  Cenário: Usuário consulta seus próprios vínculos org
    Dado que o usuário está autenticado
    Quando GET /api/v1/my/org-scopes
    Então retorna apenas os vínculos desse usuário
    E não requer scope adicional (apenas autenticação válida)

  Cenário: RBAC — scope obrigatório para operações admin
    Dado que o caller não tem identity:org_scope:read
    Quando GET /api/v1/admin/users/:id/org-scopes
    Então retorna 403 RFC 9457
```

---

## 4. Domain Events

| event_type | Trigger | sensitivity_level |
|---|---|---|
| `identity.org_scope_granted` | POST (criar vínculo) | 1 |
| `identity.org_scope_revoked` | DELETE (remover) | 1 |
| `identity.org_scope_expired` | Background job (expirado) | 1 |

---

## 5. Regras Críticas

1. **Dimensão ortogonal ao tenant_users** — não substitui nem duplica MOD-000-F09
2. **Máximo 1 PRIMARY por usuário** — 409 se tentar criar segundo
3. **Somente N1–N4** — N5 (tenant) é gerenciado via tenant_users
4. **Cache Redis obrigatório**: `DEL auth:org_scope:user:{userId}` em toda mutação
5. **X-Correlation-ID** em todas as respostas; presente em todos os domain_events
6. **Idempotência** em POST com Idempotency-Key TTL 60s

## 6. DoR ✅ / DoD

**DoR:** Modelo de dados definido, MOD-003-F01 em READY (depende de org_units), escopos mapeados.
**DoD:** Migrations revisadas, testes de unicidade PRIMARY, cache Redis testado, background job de expiração com testes de borda, testes de contrato no OpenAPI.
