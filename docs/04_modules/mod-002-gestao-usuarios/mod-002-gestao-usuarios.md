> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.

# MOD-002 — Gestão de Usuários (Backoffice)

- **id:** MOD-002
- **version:** 1.0.0
- **estado_item:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-23
- **architecture_level:** 1
- **rastreia_para:** US-MOD-002, US-MOD-002-F01, US-MOD-002-F02, US-MOD-002-F03, DOC-DEV-001, DOC-ESC-001, DOC-ARC-003, DOC-FND-000, DOC-UX-010, DOC-UX-012, MOD-000, US-MOD-000-F05, US-MOD-000-F06, SEC-000-01, LGPD-BASE-001
- **referencias_exemplos:** EX-CI-006, EX-CI-007
- **evidencias:** AGN-DEV-01 enriquecido (2026-03-17): escala N1, score DOC-ESC-001 §4.2 (2pts), personas (3 perfis admin), OKRs (4 métricas), premissas/restrições, estrutura web N1 (DOC-ESC-001 §6.3). Batch 1 re-validado — sem lacunas. Batch 2 (AGN-DEV-04/05/08): DATA-001 criado (modelo consumido), DATA-003 re-validado, INT-001 enriquecido (RFC 9457, cache, CORS), NFR-001 enriquecido (testabilidade, resiliencia, seguranca UI, metricas qualidade). Batch 3 (AGN-DEV-06/07): SEC-001 v0.3.0 (transport security, threat model, RFC 9457 seguro), SEC-002 v0.3.0 (re-validado), UX-001 v0.3.0 (error recovery flows, telemetria detalhada, view-model mapping, segurança na UX). Batch 4 (AGN-DEV-09): ADR-002 criado (PII-Safe UI pattern LGPD), ADR-003 criado (Idempotency-Key frontend). Batch 4 (AGN-DEV-10): PENDENTE-002 criado (cooldown cross-tab), PENDENTE-003 criado (copy centralizada).

---

## 1. Objetivo

Módulo exclusivamente UX-First (frontend) que implementa as telas de backoffice para gestão do ciclo de vida de usuários: listagem paginada com filtros, formulário de cadastro com dois modos (convite por e-mail / senha temporária) e fluxo de convite com reenvio e cooldown. **Consome** os endpoints REST do MOD-000-F05 (Users API) e MOD-000-F06 (Roles API) — não cria endpoints novos.

## 1.1 Problema que resolve

- **Problema:** Sem telas formalizadas via Screen Manifests, a geração de código produz interfaces inconsistentes com os padrões UX, sem rastreabilidade de ações e com comportamentos de segurança inadequados (mensagens que vazam PII, falta de loading states, ausência de correlationId nos toasts).
- **Impacto hoje:** Administradores não têm interface padronizada para gerenciar usuários; risco de vazamento de e-mail em mensagens de erro.
- **Resultado esperado:** Interface backoffice completa, LGPD-compliant, com 3 telas cobrindo o ciclo de vida de usuários.

## 1.2 Público-alvo (personas e perfis)

| Persona | Scope requerido | Ações disponíveis |
|---|---|---|
| **Administrador (leitura)** | `users:user:read` | Listar usuários, visualizar status de convite |
| **Administrador (gestão)** | `users:user:read` + `users:user:write` | Criar usuários, reenviar convites |
| **Administrador (completo)** | `users:user:read` + `users:user:write` + `users:user:delete` | Todas as ações + desativar usuários |

## 1.3 Métricas de sucesso (OKRs)

| # | Métrica | Alvo |
|---|---|---|
| OKR-1 | Screen Manifests validados sem erro | 3/3 |
| OKR-2 | operationIds existentes no OpenAPI do MOD-000 | 6/6 |
| OKR-3 | PII protegida em toasts (e-mail nunca exposto em msg de erro) | 100% |
| OKR-4 | Loading states presentes em todas as actions não-client_only | 100% |

## 2. Escopo

### Inclui

- Listagem paginada de usuários com filtros e busca (UX-USR-001)
- Formulário de criação de usuário com dois modos: senha temporária e convite por e-mail (UX-USR-002)
- Fluxo de convite: envio, reenvio e acompanhamento de status (UX-USR-003)
- Feedback de loading, skeleton e toasts com correlationId em todas as telas
- Filtro de sidebar e Sidebar seed para o módulo de usuários
- Proteção LGPD: e-mail nunca exposto em toasts, modais ou mensagens de erro

### Não inclui

- **Endpoints de backend** — responsabilidade do MOD-000-F05
- Edição de usuários já cadastrados — roadmap futuro (MOD-002-F04)
- Importação em massa — roadmap futuro
- Aprovação multi-nível para criação de conta — roadmap futuro
- Tela de detalhe completa do usuário — roadmap futuro

### Premissas e Restrições

- **Premissas:** MOD-000-F05 (Users API) e MOD-000-F06 (Roles API) existem e estão estáveis com operationIds declarados. Auth e catálogo de scopes são providos pelo Foundation.
- **Restrições:** LGPD obriga proteção de PII em todas as mensagens de UI. Amendment `users_invite_resend` precisa ser criado no MOD-000-F05 antes do scaffolding da F03.

## 3. Nível de Arquitetura

**Nível 1 — Clean Leve** (DOC-ESC-001)

Módulo UX-First que consome API existente do MOD-000-F05. Apesar de não criar endpoints, a complexidade das regras de apresentação (visibilidade condicional por scope, tratamento de erros inline por campo, idempotência no frontend, cooldown anti-spam) justifica o Nível 1.

### Justificativa (DOC-ESC-001 §4)

**Score DOC-ESC-001 §4.2: 2 pontos** → Nível 1

| Gatilho §4.2 | Atende? | Detalhe |
|---|---|---|
| Estado/workflow | Nao | Sem transições backend — status do usuário é gerido pelo MOD-000-F05 |
| Dinheiro/limites/compliance | Nao | Sem cálculos financeiros |
| Concorrência/consistência | Nao | Idempotência no frontend via `Idempotency-Key`, mas sem locking |
| Integrações externas críticas | **Sim** | Consome 6 operationIds de MOD-000-F05/F06 |
| Multi-tenant/escopo por cliente | **Sim** | Visibilidade filtrada por tenant_id, 3 scopes RBAC distintos |
| Regras cruzadas/reuso alto | Nao | Regras são locais a cada tela |

**Gatilhos Nível 1 atendidos (§4.1):**

- Regra de negócio não-trivial: visibilidade condicional de ações por 3 scopes distintos (`users:user:read`, `users:user:write`, `users:user:delete`), tratamento de erros 422/409 inline por campo, cooldown 60s com countdown em tempo real
- Testabilidade com mocks: componentes de formulário com dois modos, idempotência, e estados condicionais requerem isolamento para testes unitários
- Integração com módulo externo: depende de MOD-000 Foundation (users API, roles API, auth, scopes)
- Mais de um endpoint alterando o mesmo recurso: `users_create`, `users_delete`, `users_invite_resend`

**Gatilhos Nível 2 NÃO atendidos:** sem workflow/estados backend, sem cálculos financeiros, sem concorrência forte, sem invariantes cruzando coleções

### Matriz MUST/SHOULD aplicável (DOC-ESC-001 §3.6 — Nível 1)

| Prática | Obrigatoriedade |
|---|---|
| Problem Details em erros | MUST — error_mapping nos 3 manifests |
| Correlation ID (Logs & Trace) | MUST — `X-Correlation-ID` propagado em todas as chamadas |
| Testes unitários de regra | MUST — componentes com lógica condicional (scopes, modos, cooldown) |
| Isolamento de domínio (Portas) | MUST — data layer separado de UI (DOC-ESC-001 §6.3 Web) |
| Idempotência no handler | MUST — `Idempotency-Key` em POST /users e POST /invite/resend |

### Checklist de PR — Nível 1 Web (DOC-ESC-001 §6.4)

- [ ] Data layer isolado e testável (`data/queries.ts`, `data/mappers.ts`)
- [ ] Mappers definidos (evitar acoplamento UI ↔ API)
- [ ] Regras de UI em `domain/` (view-model, formatters)
- [ ] Portas (interfaces) para dependências de IO
- [ ] Testes: pelo menos 1 teste por componente crítico (mocks das portas)

## 4. Dependências

- **Depende de:** MOD-000 (Foundation) — Users API (MOD-000-F05), Roles API (MOD-000-F06), Auth, Catálogo de Scopes (MOD-000-F12)
- **Dependentes:** N/A (módulo folha)

### Caminhos do Módulo (module_paths)

| Camada | Path |
|---|---|
| Especificação | `docs/04_modules/mod-002-gestao-usuarios/` |
| User Stories | `docs/04_modules/user-stories/features/US-MOD-002-F*.md` |
| Épico | `docs/04_modules/user-stories/epics/US-MOD-002.md` |
| Screen Manifests | `docs/05_manifests/screens/ux-usr-001.*.yaml`, `ux-usr-002.*.yaml`, `ux-usr-003.*.yaml` |
| Web — UI | `apps/web/src/modules/users/ui/screens/`, `apps/web/src/modules/users/ui/components/`, `apps/web/src/modules/users/ui/forms/` |
| Web — Domain | `apps/web/src/modules/users/domain/view-model.ts` |
| Web — Data | `apps/web/src/modules/users/data/queries.ts`, `apps/web/src/modules/users/data/mappers.ts` |

### Estrutura Web — Nível 1 (DOC-ESC-001 §6.3)

```text
apps/web/src/modules/users/
  ui/
    screens/
      UsersListScreen.tsx          ← UX-USR-001
      UserFormScreen.tsx           ← UX-USR-002
      UserInviteScreen.tsx         ← UX-USR-003
    components/
      UsersTable.tsx
      UserStatusBadge.tsx
      DeactivateModal.tsx
      PasswordStrengthIndicator.tsx
      CooldownButton.tsx
    forms/
      UserCreateForm.tsx           ← dois modos (convite / senha)
  domain/
    view-model.ts                  ← formatters, regras de visibilidade por scope
  data/
    queries.ts                     ← fetch via operationIds (users_list, users_get, etc.)
    mappers.ts                     ← API DTO ↔ view-model
```

## 5. Sub-Histórias (Features)

| Sub-História | Tema | Screen Manifest | Status |
|---|---|---|---|
| US-MOD-002-F01 | Listagem de Usuários + Filtros + Ações | UX-USR-001 | `READY` |
| US-MOD-002-F02 | Formulário de Cadastro (senha / convite) | UX-USR-002 | `READY` |
| US-MOD-002-F03 | Fluxo de Convite e Ativação | UX-USR-003 | `READY` |

## 6. Screen Manifests

| Manifest | Screen ID | Rota | Status |
|---|---|---|---|
| `docs/05_manifests/screens/ux-usr-001.users-list.yaml` | UX-USR-001 | /usuarios | READY |
| `docs/05_manifests/screens/ux-usr-002.user-form.yaml` | UX-USR-002 | /usuarios/novo | READY |
| `docs/05_manifests/screens/ux-usr-003.user-invite.yaml` | UX-USR-003 | /usuarios/:id/convite | READY |

## 7. operationIds Consumidos (MOD-000)

| operationId | Feature Origem | Endpoint | Usado em |
|---|---|---|---|
| `users_list` | F05 | GET /api/v1/users | UX-USR-001 — listagem paginada |
| `users_create` | F05 | POST /api/v1/users | UX-USR-002 — criação de usuário |
| `users_get` | F05 | GET /api/v1/users/:id | UX-USR-003 — detalhes do usuário |
| `users_delete` | F05 | DELETE /api/v1/users/:id | UX-USR-001 — desativar usuário |
| `users_invite_resend` | F05* | POST /api/v1/users/:id/invite/resend | UX-USR-003 — reenviar convite |
| `roles_list` | F06 | GET /api/v1/roles | UX-USR-001, UX-USR-002 — select de perfis |

> *`users_invite_resend` requer amendment no MOD-000-F05.

## 8. Requisitos (Índice)

<!-- start index -->
- [BR-001](requirements/br/BR-001.md) — Visibilidade de Ações por Scope RBAC
- [BR-002](requirements/br/BR-002.md) — Proteção de PII em Mensagens de UI (LGPD)
- [BR-003](requirements/br/BR-003.md) — Modos de Criação Mutuamente Exclusivos
- [BR-004](requirements/br/BR-004.md) — Anti-Spam: Cooldown 60s no Reenvio de Convite
- [BR-005](requirements/br/BR-005.md) — Idempotência no Frontend (Idempotency-Key)
- [BR-006](requirements/br/BR-006.md) — Tratamento de Erros: Inline vs Toast por Código HTTP
- [FR-001](requirements/fr/FR-001.md) — Listagem de Usuários com Filtros, Busca e Ações
- [FR-002](requirements/fr/FR-002.md) — Formulário de Cadastro de Usuário (Dois Modos)
- [FR-003](requirements/fr/FR-003.md) — Fluxo de Convite e Ativação de Usuário
- [DATA-001](requirements/data/DATA-001.md) — Modelo de Dados Consumidos
- [DATA-003](requirements/data/DATA-003.md) — Catálogo de Domain Events
- [INT-001](requirements/int/INT-001.md) — Integrações e Contratos
- [SEC-001](requirements/sec/SEC-001.md) — Segurança e Compliance
- [SEC-002](requirements/sec/SEC-002.md) — Matriz de Autorização de Eventos
- [UX-001](requirements/ux/UX-001.md) — UX e Jornadas
- [NFR-001](requirements/nfr/NFR-001.md) — Não-Funcionais
- [PEN-002](requirements/pen-002-pendente.md) — Questões Abertas do MOD-002 (Gestão de Usuários)
<!-- end index -->

## 9. ADR (Decisões Arquiteturais)

<!-- start adr-index -->
- [ADR-001](adr/ADR-001.md) — Módulo UX-First: Frontend Exclusivo sem Endpoints Próprios
- [ADR-002](adr/ADR-002.md) — PII-Safe UI Pattern: Proteção LGPD na Camada de Apresentação
- [ADR-003](adr/ADR-003.md) — Idempotência Frontend via Idempotency-Key Header
<!-- end adr-index -->
