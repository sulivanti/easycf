# US-MOD-001 — Backoffice Admin (Épico UX-First)

**Status Ágil:** `TODO`
**Versão:** 0.4.0
**Data:** 2026-03-15

> Rollback executado em 2026-03-15: Scaffold gerado prematuramente — reaberto para ajustes.
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-001** (Backoffice Admin)

## Metadados de Governança

- **status_agil:** TODO
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** DOC-UX-010, DOC-UX-011, DOC-UX-012, DOC-ARC-003, US-MOD-000
- **evidencias:** Rollback de READY para TODO (2026-03-15) — scaffold destruído. Revisão de conteúdo incorporada (2026-03-15)

---

## 1. Contexto e Problema

O MOD-001 (Backoffice Admin) é o primeiro módulo de negócio construído sobre o Foundation (MOD-000). Sua abordagem é **UX-First**: os contratos de interface (Screen Manifests YAML) e as User Stories orientadas à experiência do usuário são definidos **antes** de qualquer geração de código backend, garantindo rastreabilidade completa desde o clique até o banco de dados.

---

## 2. Abordagem UX-First

```text
Screen Manifest (YAML) → User Story (UX) → Geração de Código → Backend
```

Cada tela do módulo possui:

1. **Screen Manifest** declarativo em `docs/05_manifests/screens/` (schema v1)
2. **Feature Story** detalhando critérios de aceite em Gherkin
3. Rastreabilidade para `operationIds` do OpenAPI do MOD-000

---

## 3. Escopo do Épico

### Inclui

- Shell de autenticação: tela de Login, Recuperação de Senha, Reset de Senha (UX-AUTH-001)
- Application Shell: Sidebar + Header + Breadcrumb + ProfileWidget (UX-SHELL-001)
- Dashboard executivo pós-login com saudação e atalhos por scope (UX-DASH-001)
- Telemetria de UI via `@easycf/ui-telemetry` com regras pré/pós-autenticação

### Não inclui

- Implementação de endpoints backend (coberta por MOD-000)
- MFA/TOTP na tela de login (UX-MFA-001 — roadmap futuro)
- SSO (fluxo OAuth2 redireciona para provider externo — sem tela no sistema)
- Módulos de negócio além do Shell/Auth/Dashboard (MOD-002 em diante)
- Geração de código de produção (via `forge-module` após aprovação)

---

## 4. Critérios de Aceite (Épico)

```gherkin
Funcionalidade: Épico UX-First do MOD-001

  Cenário: Sub-histórias só podem ser scaffoldadas após aprovação do épico
    Dado que US-MOD-001 está com Status diferente de "APPROVED"
    Quando um agente COD tentar executar forge-module para qualquer sub-história F01–F03
    Então a automação DEVE ser bloqueada
    E DEVE indicar que a aprovação do épico é pré-requisito obrigatório

  Cenário: Screen Manifests conformes com schema v1
    Dado que os 3 manifests do MOD-001 foram criados
    Quando a skill validate-screen-manifest é executada
    Então todos devem validar sem erros
    E todos devem conter linked_stories referenciando US-MOD-001

  Cenário: operationIds dos manifests existem no OpenAPI do MOD-000
    Dado os manifests do MOD-001
    Quando verificados contra o OpenAPI do MOD-000
    Então auth_login, auth_logout, auth_me, auth_forgot_password, auth_reset_password
    devem existir como operationIds estáveis no OpenAPI

  Cenário: Telemetria correta por fase de autenticação
    Dado que o manifest UX-AUTH-001 tem pre_auth=true
    E os manifests UX-SHELL-001 e UX-DASH-001 têm pre_auth=false
    Quando a skill validate-screen-manifest verificar os telemetry_defaults
    Então UX-AUTH-001 DEVE ter include_tenant_id=false
    E UX-SHELL-001 e UX-DASH-001 DEVEM ter include_tenant_id=true
```

---

## 5. Definition of Ready (DoR)

- [ ] Schema v1 do Screen Manifest formalizado (`docs/05_manifests/screen-manifest.schema.v1.yaml`)
- [ ] 3 Screen Manifests criados e vinculados: UX-AUTH-001, UX-SHELL-001, UX-DASH-001
- [ ] 3 Feature Stories (F01–F03) em estado READY com Gherkin revisado
- [ ] Rastreabilidade com operationIds do MOD-000 declarada e verificada
- [ ] Regras de telemetria pré/pós-auth documentadas nos manifests
- [ ] Owner confirma status READY para aprovação

## 6. Definition of Done (DoD)

- [ ] Todas as sub-histórias F01–F03 individualmente **aprovadas**
- [ ] Screen Manifests validados via `validate-screen-manifest` (0 erros)
- [ ] Paridade Manifest ↔ OpenAPI verificada (todos os operationIds existem no MOD-000)
- [ ] Testes E2E dos fluxos críticos: login, logout, recuperação de senha, carregamento do dashboard
- [ ] Evidências documentadas (links de PR/issue)

---

## 7. Sub-Histórias do MOD-001 (Épico)

```text
US-MOD-001  (este arquivo) ← Épico / Governança / Índice
  ├── US-MOD-001-F01  ← Shell de Autenticação e Layout Base (UX-AUTH-001 + UX-SHELL-001)
  ├── US-MOD-001-F02  ← Telemetria de UI e Rastreabilidade do Shell (todos os 3 manifests)
  └── US-MOD-001-F03  ← Dashboard Administrativo Executivo (UX-DASH-001)
```

| Sub-História | Tema | Status | Owner |
| --- | --- | --- | --- |
| [US-MOD-001-F01](../features/US-MOD-001-F01.md) | Shell de Autenticação e Layout Base | `TODO` | arquitetura |
| [US-MOD-001-F02](../features/US-MOD-001-F02.md) | Telemetria de UI e Rastreabilidade do Shell | `TODO` | arquitetura |
| [US-MOD-001-F03](../features/US-MOD-001-F03.md) | Dashboard Administrativo Executivo | `TODO` | arquitetura |

> 📌 **Regra de aprovação em cascata:** Este épico (US-MOD-001) deve ser **aprovado antes** de qualquer sub-história. Cada F01–F03 deve ser aprovada individualmente antes de ter código scaffoldado.

---

## 8. Screen Manifests do Módulo

| Manifest | Screen ID | Tipo | Rota | Status |
| --- | --- | --- | --- | --- |
| `docs/05_manifests/screens/ux-auth-001.login.yaml` | UX-AUTH-001 | auth | /login | TODO |
| `docs/05_manifests/screens/ux-shell-001.app-shell.yaml` | UX-SHELL-001 | shell | /* | TODO |
| `docs/05_manifests/screens/ux-dash-001.main.yaml` | UX-DASH-001 | dashboard | /dashboard | TODO |

---

## 9. OKRs de UX

| # | Métrica | Alvo |
| --- | --- | --- |
| OKR-1 | Screen Manifests validados contra schema v1 (0 erros) | 3/3 manifests |
| OKR-2 | operationIds dos manifests existentes no OpenAPI MOD-000 | 100% de paridade |
| OKR-3 | Critérios Gherkin cobertos por testes de contrato ou E2E | F01–F03 completas |
| OKR-4 | User Enumeration Prevention validado em testes de segurança | auth_login, auth_forgot_password |

---

## 10. Dependências do MOD-000

| operationId | Feature de origem | Contexto de uso no MOD-001 | Manifest |
| --- | --- | --- | --- |
| `auth_login` | US-MOD-000-F01 | Login do usuário | UX-AUTH-001 |
| `auth_logout` | US-MOD-000-F01 | Botão "Sair" no ProfileWidget | UX-SHELL-001 |
| `auth_forgot_password` | US-MOD-000-F04 | Recuperação de senha | UX-AUTH-001 |
| `auth_reset_password` | US-MOD-000-F04 | Redefinição de senha com token | UX-AUTH-001 |
| `auth_me` | US-MOD-000-F08 | Perfil no Header + saudação no Dashboard | UX-SHELL-001, UX-DASH-001 |

---

## 11. CHANGELOG do Épico

| Versão | Data | Responsável | Descrição |
| --- | --- | --- | --- |
| 0.4.0 | 2026-03-15 | arquitetura | Incorporação da revisão: escopo detalhado com IDs de tela, cenário Gherkin de telemetria, OKR-4 (user enumeration), DoR/DoD expandidos, tabela de dependências com coluna Manifest, exclusões explícitas (MFA, SSO) |
| 0.3.0 | 2026-03-15 | arquitetura | Rollback de READY para TODO — scaffold destruído |
| 0.1.0 | 2026-03-08 | arquitetura | Criação inicial do épico UX-First com F01–F03 e 3 Screen Manifests |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
