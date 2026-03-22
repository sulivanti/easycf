# US-MOD-001-F02 — Telemetria de UI e Rastreabilidade do Shell

**Status Ágil:** `READY`
**Versão:** 0.5.0
**Data:** 2026-03-16
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-001** (Backoffice Admin)

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-16
- **rastreia_para:** US-MOD-001, DOC-ARC-003, DOC-UX-010, DOC-UX-012, US-MOD-000-F13, US-MOD-000-F14
- **evidencias:** Transição TODO → READY (2026-03-16) — DoR verificado, conteúdo revisado
- **wave_entrega:** Wave 1
- **epico_pai:** US-MOD-001
- **manifests_vinculados:** ux-auth-001, ux-shell-001, ux-dash-001
- **pendencias:** N/A

---

## 1. Contexto e Problema

O pacote `@easycf/ui-telemetry` (definido em US-MOD-000-F13) exporta o contrato `UIActionEnvelope` para rastreabilidade UI → API → Domain Events. Esta feature aplica esse pacote nos 3 manifests do MOD-001, com regras específicas por fase de autenticação.

**Diferencial em relação à US-MOD-000-F13:**
F13 **define e exporta** o pacote. Esta story especifica **como integrá-lo nas 3 telas do Shell**, com:

- `tenant_id` ausente em ações pré-autenticação (UX-AUTH-001)
- `tenant_id` presente em ações pós-autenticação (UX-SHELL-001, UX-DASH-001)
- `X-Correlation-ID` propagado em toda requisição HTTP não-client_only

---

## 2. A Solução (Linguagem de Negócio)

Como **time de engenharia**, queremos que toda ação rastreável do Shell do MOD-001 produza um `UIActionEnvelope` correto, permitindo correlacionar um clique até o evento de domínio no banco de dados.

---

## 3. Contrato UIActionEnvelope por Ação

### UX-AUTH-001 (pré-autenticação — `tenant_id` AUSENTE)

| action_id | operation_id | type | tenant_id | Evento emitido |
| --- | --- | --- | --- | --- |
| submit_login | auth_login | submit | ❌ ausente | requested → succeeded/failed |
| submit_forgot_password | auth_forgot_password | submit | ❌ ausente | requested → succeeded/failed |
| submit_reset_password | auth_reset_password | submit | ❌ ausente | requested → succeeded/failed |
| navigate_to_forgot | — | client_only | ❌ ausente | ui_only=true |
| navigate_to_login | — | client_only | ❌ ausente | ui_only=true |

### UX-SHELL-001 (pós-autenticação — `tenant_id` PRESENTE)

| action_id | operation_id | type | tenant_id | Evento emitido |
| --- | --- | --- | --- | --- |
| load_current_user | auth_me | view | ✅ presente | requested → succeeded/failed |
| submit_logout | auth_logout | submit | ✅ presente | requested → succeeded/failed |
| navigate_sidebar | — | client_only | ✅ presente | ui_only=true |
| navigate_breadcrumb | — | client_only | ✅ presente | ui_only=true |

### UX-DASH-001 (pós-autenticação — `tenant_id` PRESENTE)

| action_id | operation_id | type | tenant_id | Evento emitido |
| --- | --- | --- | --- | --- |
| load_dashboard_profile | auth_me | view | ✅ presente | requested → succeeded/failed |

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Telemetria de UI no Shell do MOD-001

  # ── Regra pré-autenticação ───────────────────────────────────
  Cenário: Ação de login emite UIActionEnvelope sem tenant_id
    Dado que o usuário está na tela /login (UX-AUTH-001, pre_auth=true)
    Quando ele clica em "Entrar" (submit_login)
    Então o pacote @easycf/ui-telemetry deve emitir UIActionEnvelope com:
      | campo        | valor        |
      | screen_id    | UX-AUTH-001  |
      | action_id    | submit_login |
      | operation_id | auth_login   |
      | status       | requested    |
    E o campo tenant_id NÃO deve estar presente no envelope

  Cenário: Ação client-only não emite requisição HTTP
    Dado que o usuário está no painel login
    Quando ele clica em "Esqueci minha senha" (navigate_to_forgot — client_only=true)
    Então nenhuma requisição HTTP deve ser feita
    E o pacote pode emitir evento local com ui_only=true
    E X-Correlation-ID NÃO deve ser enviado (não há requisição)

  # ── Ciclo de vida do envelope ────────────────────────────────
  Cenário: Envelope transita de requested para succeeded em login OK
    Dado que o envelope com status=requested foi emitido para submit_login
    Quando a API retorna 200
    Então um segundo envelope deve ser emitido com:
      | campo       | valor     |
      | status      | succeeded |
      | http_status | 200       |
      | duration_ms | > 0       |

  Cenário: Envelope transita de requested para failed em login inválido
    Dado que o envelope com status=requested foi emitido para submit_login
    Quando a API retorna 401
    Então o envelope deve ser atualizado com:
      | campo        | valor                   |
      | status       | failed                  |
      | http_status  | 401                     |
      | problem_type | /problems/unauthorized  |
      | duration_ms  | > 0                     |

  # ── Regra pós-autenticação ───────────────────────────────────
  Cenário: Ação pós-auth inclui tenant_id correto
    Dado que o usuário está autenticado no Shell (UX-SHELL-001, pre_auth=false)
    Quando o Shell monta e dispara load_current_user (auth_me)
    Então o UIActionEnvelope deve incluir:
      | campo     | valor                         |
      | screen_id | UX-SHELL-001                  |
      | action_id | load_current_user             |
      | tenant_id | <id do tenant ativo no JWT>   |
      | status    | requested                     |

  # ── X-Correlation-ID ─────────────────────────────────────────
  Cenário: Toda requisição HTTP do Shell tem X-Correlation-ID
    Dado que o usuário está no Shell e uma action não-client_only é disparada
    Quando a requisição HTTP é enviada
    Então o header X-Correlation-ID DEVE estar presente
    E o mesmo correlation_id DEVE estar no UIActionEnvelope emitido
    E o mesmo correlation_id DEVE aparecer no Toast de erro, se houver

  Cenário: X-Correlation-ID é único por ação
    Dado que o usuário disparou submit_login e depois load_dashboard_profile
    Então cada ação deve ter um correlation_id distinto
    E cada correlation_id deve ser um UUID v4 válido

  # ── Ações UX-DASH-001 ────────────────────────────────────────
  Cenário: load_dashboard_profile emite telemetria com tenant_id
    Dado que o usuário acessou /dashboard
    Quando load_dashboard_profile é disparado no mount do componente
    Então o UIActionEnvelope deve incluir tenant_id do JWT
    E screen_id = "UX-DASH-001"
    E operation_id = "auth_me"
```

---

## 5. Definition of Ready (DoR)

- [x] Pacote `@easycf/ui-telemetry` especificado em US-MOD-000-F13
- [x] Middleware `X-Correlation-ID` especificado em US-MOD-000-F14
- [x] 3 Screen Manifests criados com `telemetry_defaults` e `pre_auth` configurados
- [x] Tabela de envelopes por ação documentada nesta feature (seção 3)
- [x] Épico pai US-MOD-001 em estado READY

## 6. Definition of Done (DoD)

- [ ] `UIActionEnvelope` emitido corretamente em todas as actions não-client_only dos 3 manifests
- [ ] `tenant_id` ausente em todas as ações da UX-AUTH-001 — validado por teste de integração
- [ ] `tenant_id` presente em todas as ações pós-auth — validado por teste de integração
- [ ] `X-Correlation-ID` presente em todos os headers HTTP não-client_only — validado por teste
- [ ] `duration_ms` preenchido em todos os envelopes `succeeded` e `failed`
- [ ] `problem_type` derivado do RFC 9457 presente em envelopes `failed`

---

## 7. Manifests Vinculados

| Manifest | Screen ID | Ações rastreadas (não-client_only) |
| --- | --- | --- |
| `docs/05_manifests/screens/ux-auth-001.login.yaml` | UX-AUTH-001 | submit_login, submit_forgot_password, submit_reset_password |
| `docs/05_manifests/screens/ux-shell-001.app-shell.yaml` | UX-SHELL-001 | load_current_user, submit_logout |
| `docs/05_manifests/screens/ux-dash-001.main.yaml` | UX-DASH-001 | load_dashboard_profile |

---

## 8. Regras Críticas

1. `tenant_id` **DEVE** ser `null` ou omitido em toda ação de `UX-AUTH-001` (`pre_auth=true`)
2. `X-Correlation-ID` **DEVE** estar presente no header HTTP de toda requisição não-`client_only`
3. O mesmo `correlation_id` **DEVE** compor o `UIActionEnvelope` **e** o header HTTP da requisição
4. `status` **DEVE** transitar: `requested` → `succeeded` (2xx) ou `failed` (4xx/5xx)
5. `duration_ms` **DEVE** ser preenchido em todas as emissões de `succeeded` e `failed`
6. `problem_type` **DEVE** ser derivado do campo `type` da resposta RFC 9457 em envelopes `failed`
7. Ações `client_only` **NÃO DEVEM** gerar requisição HTTP — apenas evento local (`ui_only=true`)

---

## 9. CHANGELOG

| Versão | Data | Responsável | Descrição |
| --- | --- | --- | --- |
| 0.5.0 | 2026-03-16 | arquitetura | Transição TODO → READY — DoR verificado, conteúdo revisado, rollback concluído |
| 0.4.0 | 2026-03-15 | arquitetura | Incorporação da revisão: tabela de envelopes por ação (seção 3), +3 cenários Gherkin (client_only sem HTTP, problem_type em failed, X-Correlation-ID único), DoD expandido (duration_ms, problem_type), manifests_vinculados atualizado, 7 regras críticas |
| 0.3.0 | 2026-03-15 | arquitetura | Rollback de READY para TODO — scaffold destruído |
| 0.1.0 | 2026-03-08 | arquitetura | Criação inicial |

---

> ⚠️ **Atenção:** As automações (`forge-module`, `create-amendment`) **SÓ PODEM SER EXECUTADAS** com Status `APPROVED`.
