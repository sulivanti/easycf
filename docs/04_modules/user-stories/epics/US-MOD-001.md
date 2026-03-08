# US-MOD-001 — Backoffice Admin (Épico UX-First)

**Status:** `READY`  
**Versão:** 0.1.0  
**Data:** 2026-03-08  
**Autor(es):** Produto + Arquitetura  
**Módulo Destino:** **MOD-001** (Backoffice Admin)

## Metadados de Governança

- **estado_item:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-08
- **rastreia_para:** DOC-UX-010, DOC-UX-011, DOC-UX-012, DOC-ARC-003, US-MOD-000
- **evidencias:** N/A (em refinamento)

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

### Inclui (Fase 1 — UX-First)

- Especificação UX completa: Screen Manifests + Feature Stories (F01–F03)
- Épico balizador com DoR/DoD, OKRs e regra de aprovação em cascata

### Não inclui (tratados em outros épicos/módulos)

- Implementação de endpoints (MOD-000)
- Geração de código de produção (via skill `scaffold-module` após aprovação)
- Módulos de negócio além do Shell/Auth/Dashboard (roadmap futuro)

---

## 4. Critérios de Aceite (Épico)

```gherkin
Funcionalidade: Épico UX-First do MOD-001

  Cenário: Sub-histórias só podem ser scaffoldadas após aprovação do épico
    Dado que US-MOD-001 está com Status diferente de "aprovada"
    Quando um agente COD tentar executar scaffold-module para qualquer sub-história F01–F03
    Então a automação DEVE ser bloqueada
    E DEVE indicar que a aprovação do épico é pré-requisito obrigatório

  Cenário: Screen Manifests conformes com schema v1
    Dado que os 3 manifests do MOD-001 foram criados
    Quando a skill validate-screen-manifest é executada
    Então todos devem validar sem erros
    E todos devem conter linked_stories referenciando este épico

  Cenário: operationIds dos manifests existem no OpenAPI do MOD-000
    Dado os manifests do MOD-001
    Quando verificados contra o OpenAPI do MOD-000
    Então auth_login, auth_logout, auth_me, auth_forgot_password, auth_reset_password
    devem existir como operationIds estáveis
```

---

## 5. Definition of Ready (DoR)

- [x] Ajustes normativos aplicados: DOC-UX-010 §Manifestos de Infra/Shell + `linked_stories` no schema v1
- [x] 3 Screen Manifests criados e vinculados a este épico
- [x] 3 Feature Stories (F01–F03) em estado READY
- [x] Rastreabilidade com operationIds do MOD-000 declarada
- [x] Owner confirma status READY para aprovação

## 6. Definition of Done (DoD)

- [x] Todas as sub-histórias F01–F03 individualmente **aprovadas**
- [ ] Screen Manifests validados via skill `validate-screen-manifest`
- [ ] Paridade Manifest ↔ OpenAPI verificada (checklist do Verification Plan)
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
| [US-MOD-001-F01](../features/US-MOD-001-F01.md) | Shell de Autenticação e Layout Base | `READY` | arquitetura |
| [US-MOD-001-F02](../features/US-MOD-001-F02.md) | Telemetria de UI e Rastreabilidade do Shell | `READY` | arquitetura |
| [US-MOD-001-F03](../features/US-MOD-001-F03.md) | Dashboard Administrativo Executivo | `READY` | arquitetura |

> 📌 **Regra de aprovação em cascata:** Este épico (US-MOD-001) deve ser **aprovado antes** de qualquer sub-história. Cada F01–F03 deve ser aprovada individualmente antes de ter código scaffoldado.

---

## 8. Screen Manifests do Módulo

| Manifest | Screen ID | Tipo | Status |
| --- | --- | --- | --- |
| [ux-auth-001.login.yaml](file:///d:/Dev/EasyCodeFramework/docs/05_manifests/screens/ux-auth-001.login.yaml) | UX-AUTH-001 | auth | REFINING |
| [ux-shell-001.app-shell.yaml](file:///d:/Dev/EasyCodeFramework/docs/05_manifests/screens/ux-shell-001.app-shell.yaml) | UX-SHELL-001 | shell | REFINING |
| [ux-dash-001.main.yaml](file:///d:/Dev/EasyCodeFramework/docs/05_manifests/screens/ux-dash-001.main.yaml) | UX-DASH-001 | dashboard | REFINING |

---

## 9. OKRs de UX

| # | Métrica | Alvo |
| --- | --- | --- |
| OKR-1 | Screen Manifests validados contra schema v1 (0 erros) | 3/3 manifests |
| OKR-2 | operation_ids dos manifests existentes no OpenAPI MOD-000 | 100% de paridade |
| OKR-3 | Critérios Gherkin cobertos por testes de contrato ou E2E | F01–F03 completas |

---

## 10. Dependências do MOD-000

| operationId | Feature de origem | Contexto de uso no MOD-001 |
| --- | --- | --- |
| `auth_login` | US-MOD-000-F01 | UX-AUTH-001 — Login |
| `auth_logout` | US-MOD-000-F01 | UX-SHELL-001 — Logout |
| `auth_me` | US-MOD-000-F08 | UX-SHELL-001 (Header) + UX-DASH-001 (saudação) |
| `auth_forgot_password` | US-MOD-000-F04 | UX-AUTH-001 — Recuperação |
| `auth_reset_password` | US-MOD-000-F04 | UX-AUTH-001 — Reset |

---

## 11. CHANGELOG do Épico

| Versão | Data | Responsável | Descrição |
| --- | --- | --- | --- |
| 0.1.0 | 2026-03-08 | arquitetura | Criação inicial do épico UX-First com F01–F03 e 3 Screen Manifests |

---

> ⚠️ **Atenção:** As automações de arquitetura (`scaffold-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `aprovada`.
