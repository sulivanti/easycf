> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.

# MOD-004 — Identidade Avançada

- **id:** MOD-004
- **version:** 0.2.0
- **estado_item:** DRAFT
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-17
- **rastreia_para:** US-MOD-004, US-MOD-004-F01, US-MOD-004-F02, US-MOD-004-F03, US-MOD-004-F04, DOC-DEV-001, DOC-ARC-001, DOC-ARC-002, DOC-ARC-003, DOC-FND-000, US-MOD-000-F06, US-MOD-000-F09, US-MOD-003, LGPD-BASE-001
- **evidencias:** N/A

---

## 1. Objetivo

Módulo de identidade avançada que complementa o MOD-000 (identidade operacional básica) e o MOD-003 (estrutura organizacional) com três mecanismos:
1. **Escopo de área organizacional** — vincula usuários a nós N1–N4 da estrutura org (`user_org_scopes`), delimitando em qual área cada identidade atua.
2. **Compartilhamento controlado** — expande visibilidade de recursos além do escopo principal com motivo, autorizador e vigência obrigatória (`access_shares`).
3. **Delegação temporária** — transfere subconjunto de permissões por TTL definido, sem poder decisório (`access_delegations`).

## 2. Escopo

### Inclui
- API de vínculo usuário ↔ nó organizacional (`user_org_scopes`) — tipo PRIMARY ou SECONDARY
- API de compartilhamento controlado com vigência obrigatória (`access_shares`)
- API de delegação temporária com TTL obrigatório (`access_delegations`)
- Expiração automática via background job (marks EXPIRED/REVOKED quando `valid_until < now()`)
- Tela de gestão de escopo organizacional do usuário (UX-IDN-001)
- Tela de compartilhamentos e delegações ativas (UX-IDN-002)
- Novos escopos no catálogo: `identity:org_scope:*`, `identity:share:*`

### Não inclui
- Revisão periódica formal de acessos — roadmap Wave 3 (requer gestão de campanhas de revisão)
- Governança de concessão de acesso com fluxo de aprovação — MOD-009 (Aprovações e Alçadas)
- Contas técnicas e agentes associados — roadmap futuro (Wave 4+)

## 3. Nível de Arquitetura

**Nível 2 — DDD-lite + Clean Completo** (DOC-ESC-001 §7)

### Justificativa (Score DOC-ESC-001 §4.2: 5/6)

| Gatilho | Presente | Evidência |
|---|---|---|
| Estado/workflow | SIM | `user_org_scopes` com status ACTIVE/INACTIVE; `access_shares`/`access_delegations` com ACTIVE→REVOKED→EXPIRED (transições controladas por service + background job) |
| Compliance/auditoria | SIM | `reason` obrigatório em shares, `authorized_by` documentado, delegação sem poder decisório (`:approve`/`:execute`/`:sign` proibidos), LGPD-BASE-001 referenciado |
| Concorrência/consistência | SIM | Cache Redis obrigatório com invalidação por mutação (`DEL auth:org_scope:user:{userId}`), idempotência em POST via `Idempotency-Key` TTL 60s, Outbox Pattern para domain events |
| Integrações externas críticas | NÃO | Consome apenas MOD-000 e MOD-003 (APIs internas); Redis como broker efêmero |
| Multi-tenant/escopo por cliente | SIM | `tenant_id` herdado via `users`/`org_units`, filtro por área organizacional em processos consumidores |
| Regras cruzadas/reuso alto | SIM | `user_org_scopes` é consumido por MOD-005 (Processos), MOD-006 (Parametrizações), MOD-007 e MOD-008 para filtrar dados por área; `access_shares` amplia visibilidade cross-módulo |

> **Score 5/6** qualifica inequivocamente para Nível 2. A combinação de workflow com estados, compliance/auditoria, concorrência (cache + idempotência), multi-tenant e reuso alto exige domínio protegido com portas/adapters e domain events obrigatórios (DOC-ESC-001 §3.6).

### Implicações do Nível 2 (DOC-ESC-001 §7)

- **Domínio rico:** Entidades com invariantes (máximo 1 PRIMARY, escopos proibidos em delegação, validação de autorização por scope)
- **Domain Events:** MUST — 9 eventos catalogados em DATA-003, emitidos via Outbox Pattern
- **Portas/Adapters:** Repositórios, Redis cache adapter, BullMQ job adapter — todos com interfaces testáveis
- **Idempotência:** MUST em todos os endpoints de escrita (efeito colateral: cache + eventos)
- **Testes:** MUST — testes de domínio cobrindo invariantes + testes de use case com mocks das portas

## 4. Dependências

- **Depende de:** MOD-000 (Foundation — users, roles, tenant_users), MOD-003 (Estrutura Organizacional — org_units)
- **Dependentes:** MOD-005 (Processos), MOD-006 (Parametrizações), MOD-007, MOD-008 (Integrações)

### Caminhos do Módulo (module_paths) — Nível 2

#### Documentação

| Camada | Path |
|---|---|
| Especificação | `docs/04_modules/mod-004-identidade-avancada/` |
| User Stories | `docs/04_modules/user-stories/features/US-MOD-004-F*.md` |
| Épico | `docs/04_modules/user-stories/epics/US-MOD-004.md` |
| Screen Manifests | `docs/05_manifests/screens/ux-idn-001.org-scope.yaml`, `ux-idn-002.shares-delegations.yaml` |
| OpenAPI | `apps/api/openapi/v1.yaml` (seções identity-advanced) |

#### API (`apps/api`) — Estrutura Nível 2 (DOC-ESC-001 §7.3)

```text
apps/api/src/modules/identity-advanced/
  domain/
    aggregates/
      user-org-scope.ts          # Aggregate: user_org_scopes (invariante PRIMARY único)
      access-share.ts            # Aggregate: access_shares (validação authorized_by por scope)
      access-delegation.ts       # Aggregate: access_delegations (escopos proibidos)
    value-objects/
      scope-type.vo.ts           # VO: PRIMARY | SECONDARY
      delegated-scope.vo.ts      # VO: valida ausência de :approve/:execute/:sign
      share-authorization.vo.ts  # VO: lógica de auto-autorização por scope
    domain-events/
      identity-events.ts         # 9 domain events tipados
    errors/
      identity-errors.ts         # Erros de domínio (DuplicatePrimary, ProhibitedScope, etc.)
  application/
    use-cases/
      create-org-scope.ts
      delete-org-scope.ts
      list-org-scopes.ts
      create-access-share.ts
      revoke-access-share.ts
      create-access-delegation.ts
      revoke-access-delegation.ts
      expire-identity-grants.ts  # use case do background job
    ports/
      org-scope-repository.ts
      access-share-repository.ts
      access-delegation-repository.ts
      redis-cache-port.ts
      event-bus-port.ts
    dtos/
  infrastructure/
    db/
      repositories/
      mappers/
    cache/
      redis-org-scope-cache.ts   # Adapter: DEL auth:org_scope:user:{userId}
    messaging/
      expire-grants-worker.ts    # BullMQ worker
  presentation/
    routes/
    controllers/
    validators/
```

#### Web (`apps/web`) — Estrutura Nível 2

```text
apps/web/src/modules/identity-advanced/
  ui/
    screens/
      OrgScopeManagement/        # UX-IDN-001
      SharesDelegationsPanel/    # UX-IDN-002
    components/
      OrgScopeCard/
      ShareDrawer/
      DelegationDrawer/
    forms/
  domain/
    rules.ts                     # Regras de habilitar/desabilitar (auto-auth, escopos proibidos)
    view-model.ts                # Formatação de badges, expiração, breadcrumbs
  data/
    commands.ts                  # Mutações (POST/DELETE)
    queries.ts                   # Leituras (GET)
    mappers.ts
```

## 5. Premissas e Restrições

### Premissas
- MOD-000 (Foundation) e MOD-003 (Estrutura Organizacional) estão implementados e proveem `users`, `roles`, `tenant_users` e `org_units`
- Redis já está disponível no cluster como broker BullMQ (DOC-PADRAO-001)
- O catálogo de scopes do Foundation (DOC-FND-000 §2) aceita novos scopes via PR

### Restrições
- **LGPD:** payloads de domain events contêm apenas IDs e status (sem PII)
- **Redis:** uso restrito a cache efêmero e fila BullMQ (DOC-DEV-001 DATA-013 — proibido como banco primário)
- **Delegação:** NUNCA pode conter escopos `:approve`, `:execute`, `:sign` — regra inegociável
- **Vigência:** NUNCA existe compartilhamento ou delegação permanente — `valid_until` obrigatório

## 6. Métricas de Sucesso (OKRs)

| # | Métrica | Alvo |
|---|---|---|
| OKR-1 | Delegações com escopo de aprovação bloqueadas | 100% |
| OKR-2 | Auto-autorização bloqueada sem scope `identity:share:authorize` | 100% |
| OKR-3 | Expiração automática em < 5min após valid_until | 100% |
| OKR-4 | Cache Redis invalidado ao criar/revogar user_org_scopes | 100% |

## 7. Sub-Histórias (Features)

| Feature | Tema | Status |
|---|---|---|
| [US-MOD-004-F01](../user-stories/features/US-MOD-004-F01.md) | API: user_org_scopes (CRUD + invalidação Redis) | `READY` |
| [US-MOD-004-F02](../user-stories/features/US-MOD-004-F02.md) | API: access_shares + access_delegations + job expiração | `READY` |
| [US-MOD-004-F03](../user-stories/features/US-MOD-004-F03.md) | UX: Escopo organizacional do usuário | `READY` |
| [US-MOD-004-F04](../user-stories/features/US-MOD-004-F04.md) | UX: Compartilhamentos e delegações ativas | `READY` |

## 8. Itens Base (Canônicos) e Links

<!-- start index -->
- [BR-001](requirements/br/BR-001.md) — Regras de Negócio da Identidade Avançada
- [FR-001](requirements/fr/FR-001.md) — Requisitos Funcionais da Identidade Avançada
- [DATA-001](requirements/data/DATA-001.md) — Modelo de Dados da Identidade Avançada
- [DATA-003](requirements/data/DATA-003.md) — Catálogo de Domain Events da Identidade Avançada
- [INT-001](requirements/int/INT-001.md) — Integrações e Contratos da Identidade Avançada
- [SEC-001](requirements/sec/SEC-001.md) — Segurança e Compliance da Identidade Avançada
- [SEC-EventMatrix](requirements/sec/SEC-EventMatrix.md) — Matriz de Autorização de Eventos da Identidade Avançada
- [UX-001](requirements/ux/UX-001.md) — Jornadas e Fluxos da Identidade Avançada
- [NFR-001](requirements/nfr/NFR-001.md) — Requisitos Não Funcionais da Identidade Avançada
<!-- end index -->

## 9. Decisões (ADR)

<!-- start adr-index -->
- [ADR-001](adr/ADR-001__validacao_auto_autorizacao_no_service.md) — Validação de Auto-Autorização no Service (Não via CHECK Constraint)
- [ADR-002](adr/ADR-002__tenant_id_direto_para_rls.md) — `tenant_id` Direto nas Tabelas para Row-Level Security
<!-- end adr-index -->
