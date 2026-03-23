> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.9.1  | 2026-03-17 | arquitetura | Baseline enriquecido |
> | 0.10.0 | 2026-03-17 | AGN-DEV-01  | Enriquecimento MOD/Escala — valida nível 1, atualiza module_paths, reforça escopo |

# MOD-001 — Backoffice Admin (UX-First Shell)

- **id:** MOD-001
- **version:** 1.0.0
- **estado_item:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-23
- **rastreia_para:** US-MOD-001, US-MOD-001-F01, US-MOD-001-F02, US-MOD-001-F03, DOC-DEV-001, DOC-ESC-001, DOC-UX-010, DOC-UX-011, DOC-UX-012, DOC-ARC-003, DOC-FND-000, MOD-000
- **evidencias:** N/A

---

## 1. Objetivo

Módulo UX-First que implementa o Shell de Autenticação (Login, Recuperação de Senha, Reset), o Application Shell (Sidebar + Header + Breadcrumb + ProfileWidget), o Dashboard executivo pós-login e a Telemetria de UI com regras pré/pós-autenticação. Construído sobre o Foundation (MOD-000), consumindo seus endpoints de auth.

## 2. Escopo

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

## 3. Nível de Arquitetura

**Nível 1 — Clean Leve** (DOC-ESC-001 §6)

Módulo UX-First sem lógica de domínio própria. Consome endpoints do MOD-000 (Foundation) e define contratos de interface via Screen Manifests (YAML schema v1). Não possui entidades de banco, handlers de API ou agregados — toda a lógica de negócio reside no MOD-000.

### Justificativa (Score DOC-ESC-001 §4.2: 1/6)

| Gatilho | Presente | Evidência |
|---|---|---|
| Estado/workflow | NÃO | Sem transições de estado — painéis login/forgot/reset são client-only, sem máquina de estados |
| Compliance/auditoria | NÃO | Telemetria UIActionEnvelope é passthrough para MOD-000; auditoria reside no Foundation |
| Concorrência/consistência | NÃO | Operações são UI-only ou delegadas ao backend (MOD-000) |
| Integrações externas críticas | NÃO | Consome apenas MOD-000 (API interna); sem providers externos |
| Multi-tenant/escopo por cliente | SIM | Sidebar filtrada por `auth_me.scopes[]`, `tenant_id` em UIActionEnvelope pós-auth |
| Regras cruzadas/reuso alto | NÃO | Módulo consumidor, não provedor; Shell é específico do Backoffice |

> **Nota:** Score 1/6 qualifica para Nível 0, mas optamos por Nível 1 por: (a) testabilidade com mocks dos endpoints MOD-000, (b) separação presentation/data/domain no frontend, (c) evolução prevista com novos módulos consumindo o Shell.

## 4. Dependências

- **Depende de:** MOD-000 (Foundation) — auth_login, auth_logout, auth_forgot_password, auth_reset_password, auth_me, auth_change_password
- **Dependentes:** MOD-002+ (todos os módulos frontend utilizam o Application Shell — Sidebar, Header, Breadcrumb — provido por este módulo para navegação e layout)

### Caminhos do Módulo (module_paths)

| Camada | Path |
|---|---|
| Especificação | `docs/04_modules/mod-001-backoffice-admin/` |
| Requisitos | `docs/04_modules/mod-001-backoffice-admin/requirements/` (br/, fr/, data/, sec/, ux/, nfr/, int/) |
| ADRs | `docs/04_modules/mod-001-backoffice-admin/adr/` |
| User Stories | `docs/04_modules/user-stories/features/US-MOD-001-F*.md` |
| Epico | `docs/04_modules/user-stories/epics/US-MOD-001.md` |
| Screen Manifests | `docs/05_manifests/screens/ux-auth-001.login.yaml`, `ux-shell-001.app-shell.yaml`, `ux-dash-001.main.yaml` |
| Web — UI | `apps/web/src/modules/backoffice-admin/ui/screens/`, `apps/web/src/modules/backoffice-admin/ui/components/` |
| Web — Domain | `apps/web/src/modules/backoffice-admin/domain/` (view-model, rules) |
| Web — Data | `apps/web/src/modules/backoffice-admin/data/` (queries, mappers) |

## 5. Sub-Histórias (Features)

| Feature | Tema | Status |
|---|---|---|
| [US-MOD-001-F01](../user-stories/features/US-MOD-001-F01.md) | Shell de Autenticação e Layout Base | `READY` |
| [US-MOD-001-F02](../user-stories/features/US-MOD-001-F02.md) | Telemetria de UI e Rastreabilidade do Shell | `READY` |
| [US-MOD-001-F03](../user-stories/features/US-MOD-001-F03.md) | Dashboard Administrativo Executivo | `READY` |

## 6. Itens Base (Canônicos) e Links

<!-- start index -->
- [BR-001](requirements/br/BR-001.md) — Regras de Negócio do Backoffice Admin
- [FR-001](requirements/fr/FR-001.md) — Requisitos Funcionais do Backoffice Admin
- [FR-007](requirements/fr/FR-007.md) — Alteração de Senha via ProfileWidget
- [DATA-001](requirements/data/DATA-001.md) — Modelo de Dados do Backoffice Admin
- [DATA-003](requirements/data/DATA-003.md) — Catálogo de Domain Events do Backoffice Admin
- [INT-001](requirements/int/INT-001.md) — Integrações e Contratos do Backoffice Admin
- [INT-006](requirements/int/INT-006.md) — Contrato de Integração: Alteração de Senha
- [SEC-001](requirements/sec/SEC-001.md) — Segurança e Compliance do Backoffice Admin
- [SEC-002](requirements/sec/SEC-002.md) — Matriz de Autorização de Eventos do Backoffice Admin
- [UX-001](requirements/ux/UX-001.md) — Jornadas e Fluxos do Backoffice Admin
- [NFR-001](requirements/nfr/NFR-001.md) — Requisitos Não Funcionais do Backoffice Admin
- [PEN-001](requirements/pen-001-pendente.md) — Questões Abertas do Backoffice Admin
<!-- end index -->

## 7. Decisões (ADR)

<!-- start adr-index -->
- [ADR-001](adr/ADR-001__nivel_1_clean_leve.md) — Nível 1 (Clean Leve) para Módulo UX-First com Score 1/6
- [ADR-002](adr/ADR-002__telemetria_pre_pos_auth.md) — Separação de Telemetria Pré/Pós-Autenticação via UIActionEnvelope
- [ADR-003](adr/ADR-003__zero_blank_screen.md) — Princípio Zero-Blank-Screen com Skeleton Timeout de 3 Segundos
<!-- end adr-index -->
