# US-MOD-002 — Gestão de Usuários (Épico UX-First)

**Status Ágil:** `READY`
**Versão:** 1.1.0
**Data:** 2026-03-16
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-002** (Gestão de Usuários — Backoffice)

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-16
- **rastreia_para:** US-MOD-000-F05, US-MOD-000-F06, US-MOD-000-F12, DOC-UX-011, DOC-UX-012, DOC-ARC-003, SEC-000-01, LGPD-BASE-001
- **nivel_arquitetura:** 1
- **evidencias:** Screen Manifests v1 criados (2026-03-15). DoR verificado, 3 features em READY, conteúdo revisado (2026-03-16)

---

## 1. Separação de Responsabilidades — MOD-002 vs MOD-000-F05

> **Esta é a distinção mais importante do módulo e deve ser compreendida antes de qualquer implementação.**

| Camada | Módulo | O que faz |
|---|---|---|
| **API (backend)** | MOD-000-F05 | Endpoints REST: `POST /users`, `GET /users`, `PATCH /users/:id`, `DELETE /users/:id`. Regras de negócio, validação, persistência, auditoria, idempotência. |
| **UX (frontend)** | **MOD-002** | Telas do backoffice admin: listagem, formulário de cadastro, fluxo de convite. **Consome** os operationIds do MOD-000-F05 — não cria novos endpoints. |

**MOD-002 é exclusivamente UX.** Toda lógica de backend vive no MOD-000-F05.

---

## 2. Contexto e Problema

O administrador do sistema precisa de uma interface para gerenciar o ciclo de vida de usuários: listar, criar, ativar via convite e acompanhar status. Sem telas formalizadas via Screen Manifests, a geração de código pode produzir interfaces inconsistentes com os padrões UX, sem rastreabilidade de ações e com comportamentos de segurança inadequados (mensagens que vazam informação, falta de loading states, ausência de correlationId nos toasts).

---

## 3. Abordagem UX-First

```text
Screen Manifest (YAML) → Feature Story (Gherkin) → Geração de Código → Consome API MOD-000-F05
```

---

## 4. Escopo

### Inclui

- Listagem paginada de usuários com filtros e busca (UX-USR-001)
- Formulário de criação de usuário com dois modos: senha temporária e convite por e-mail (UX-USR-002)
- Fluxo de convite: envio, reenvio e acompanhamento de status (UX-USR-003)
- Feedback de loading, skeleton e toasts com correlationId em todas as telas
- Filtro de sidebar e Sidebar seed para o módulo de usuários

### Não inclui

- **Endpoints de backend** — responsabilidade do MOD-000-F05
- Edição de usuários já cadastrados — roadmap futuro (MOD-002-F04)
- Importação em massa — roadmap futuro
- Aprovação multi-nível para criação de conta — roadmap futuro
- Tela de detalhe completa do usuário — roadmap futuro

---

## 5. Critérios de Aceite (Épico)

```gherkin
Funcionalidade: Épico UX-First do MOD-002

  Cenário: Sub-histórias só podem ser scaffoldadas após aprovação do épico
    Dado que US-MOD-002 está com Status diferente de "APPROVED"
    Quando um agente COD tentar executar forge-module para F01, F02 ou F03
    Então a automação DEVE ser bloqueada
    E DEVE indicar que a aprovação do épico é pré-requisito obrigatório

  Cenário: Screen Manifests conformes com schema v1
    Dado que os 3 manifests do MOD-002 foram criados
    Quando a skill validate-screen-manifest é executada
    Então todos devem validar sem erros
    E todos devem conter linked_stories referenciando US-MOD-002

  Cenário: operationIds existem no OpenAPI do MOD-000
    Dado os manifests do MOD-002
    Quando verificados contra o OpenAPI do MOD-000-F05 e F06
    Então users_list, users_create, users_get, users_delete, roles_list
    devem existir como operationIds estáveis

  Cenário: MOD-002 não cria endpoints novos
    Quando o scaffolding do MOD-002 for executado
    Então NENHUM novo endpoint deve ser gerado
    E apenas código de interface (componentes, rotas, stores) deve ser produzido
```

---

## 6. Definition of Ready (DoR) ✅

- [x] Separação MOD-002 (UX) vs MOD-000-F05 (API) documentada e validada
- [x] 3 Screen Manifests criados: UX-USR-001, UX-USR-002, UX-USR-003
- [x] Features F01, F02, F03 com Gherkin completo
- [x] operationIds de MOD-000-F05 e F06 declarados e verificados
- [x] Regras LGPD (PII nos toasts) e SEC-000-01 documentadas nas features
- [x] Sidebar seed do MOD-002 adicionado ao UX-SHELL-001 (nav-users existente)
- [x] Owner confirmar status READY → APPROVED

## 7. Definition of Done (DoD)

- [ ] F01, F02, F03 individualmente **aprovadas** e scaffoldadas
- [ ] validate-screen-manifest: 0 erros nos 3 manifests
- [ ] Nenhum endpoint novo gerado pelo scaffolding do MOD-002
- [ ] Testes E2E: listagem, criação com senha, criação com convite, reenvio de convite
- [ ] Acessibilidade: formulários com labels corretos, mensagens de erro associadas por aria-describedby
- [ ] Evidências documentadas (PR/issue)

---

## 8. Sub-Histórias

```text
US-MOD-002  (este arquivo) ← Épico / Governança / Índice
  ├── US-MOD-002-F01  ← Listagem de Usuários (UX-USR-001)
  ├── US-MOD-002-F02  ← Formulário de Cadastro (UX-USR-002)
  └── US-MOD-002-F03  ← Convite e Ativação (UX-USR-003)
```

| Sub-História | Tema | Screen Manifest | Status |
|---|---|---|---|
| US-MOD-002-F01 | Listagem de Usuários + Filtros + Ações | UX-USR-001 | `READY` |
| US-MOD-002-F02 | Formulário de Cadastro (senha / convite) | UX-USR-002 | `READY` |
| US-MOD-002-F03 | Fluxo de Convite e Ativação | UX-USR-003 | `READY` |

---

## 9. Screen Manifests

| Manifest | Screen ID | Rota | Status |
|---|---|---|---|
| `docs/05_manifests/screens/ux-usr-001.users-list.yaml` | UX-USR-001 | /usuarios | READY |
| `docs/05_manifests/screens/ux-usr-002.user-form.yaml` | UX-USR-002 | /usuarios/novo | READY |
| `docs/05_manifests/screens/ux-usr-003.user-invite.yaml` | UX-USR-003 | /usuarios/:id/convite | READY |

---

## 10. Dependências do MOD-000

| operationId | Feature | Endpoint | Usado em |
|---|---|---|---|
| `users_list` | F05 | GET /api/v1/users | UX-USR-001 — listagem paginada |
| `users_create` | F05 | POST /api/v1/users | UX-USR-002 — criação de usuário |
| `users_get` | F05 | GET /api/v1/users/:id | UX-USR-003 — detalhes do usuário |
| `users_delete` | F05 | DELETE /api/v1/users/:id | UX-USR-001 — desativar usuário |
| `users_invite_resend` | F05* | POST /api/v1/users/:id/invite/resend | UX-USR-003 — reenviar convite |
| `roles_list` | F06 | GET /api/v1/roles | UX-USR-002 — select de perfis |

> *`users_invite_resend` é um endpoint adicional a ser criado no MOD-000-F05 (amendment necessário).

---

## 11. Modelo de Dados Relevante (MOD-000-F05)

```text
users                            content_users
─────────────────────────        ──────────────────────────────
id         uuid PK               userId       FK → users.id
codigo     varchar UNIQUE         fullName     varchar
email      varchar UNIQUE         cpfCnpj      varchar UNIQUE (nullable)
status     ACTIVE|PENDING|        phone        varchar (nullable)
           BLOCKED|INACTIVE       avatarUrl    varchar (nullable)
force_pwd_reset boolean           cargo        varchar (nullable)
createdAt, deletedAt             departamento varchar (nullable)
                                 createdAt, deletedAt
```

Status relevantes para o UX:
- `ACTIVE` → usuário ativo (pode logar)
- `PENDING` → convite enviado, aguardando ativação
- `BLOCKED` → bloqueado pelo admin
- `INACTIVE` → soft-deleted

---

## 12. OKRs

| # | Métrica | Alvo |
|---|---|---|
| OKR-1 | Screen Manifests validados sem erro | 3/3 |
| OKR-2 | operationIds existentes no OpenAPI do MOD-000 | 6/6 |
| OKR-3 | PII protegida em toasts (e-mail nunca exposto em msg de erro) | 100% |
| OKR-4 | Loading states presentes em todas as actions não-client_only | 100% |

---

## 13. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.1.0 | 2026-03-16 | arquitetura | Revisão final: DoR completo verificado, owner confirma READY para aprovação. |
| 1.0.0 | 2026-03-15 | arquitetura | Reescrita completa no padrão ECF. Separação clara MOD-002 (UX) vs MOD-000-F05 (API). Feature cascade F01–F03. Screen Manifests v1 criados. Gherkin revisado. Incorporado de @incorporar/mod-002. |
| 0.2.1 | 2026-03-15 | arquitetura | Correção de manifests vinculados. Registro de pendências D15–D18. |
| 0.2.0 | 2026-03-14 | arquitetura | Reestruturação como épico formal. |
| 0.1.0 | 2026-03-09 | Product Owner | Criação inicial da US de cadastro de usuários |

---

> ⚠️ **Atenção:** As automações (`forge-module`, `create-amendment`) **SÓ PODEM SER EXECUTADAS** com Status `APPROVED`.
