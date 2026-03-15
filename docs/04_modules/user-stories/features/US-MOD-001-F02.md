# US-MOD-001-F02 — Telemetria de UI e Rastreabilidade do Shell

**Status Ágil:** `DRAFT`
**Versão:** 0.1.0  
**Data:** 2026-03-08  
**Autor(es):** Produto + Arquitetura  
**Módulo Destino:** **MOD-001** (Backoffice Admin)

## Metadados de Governança

- **status_agil:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-08
- **rastreia_para:** US-MOD-001, DOC-ARC-003, DOC-UX-010, DOC-UX-012, US-MOD-000-F13, US-MOD-000-F14
- **evidencias:** N/A (aguardando aprovação do épico US-MOD-001)
- **wave_entrega:** Wave 1
- **epico_pai:** US-MOD-001
- **manifests_vinculados:** N/A
- **pendencias:** N/A

---

## 1. Contexto e Problema

O pacote `ui-telemetry` (definido em US-MOD-000-F13) fornece o contrato `UIActionEnvelope` para rastreabilidade UI → API → Domain. Esta feature aplica esse pacote especificamente às telas do Shell do MOD-001, garantindo que:

- Ações pré-autenticação (`UX-AUTH-001`) emitam o envelope **sem** `tenant_id`
- Ações pós-autenticação (`UX-SHELL-001`, `UX-DASH-001`) emitam com `tenant_id` correto
- O header `X-Correlation-ID` seja propagado em toda requisição API do Shell

**Diferencial em relação à US-MOD-000-F13:**  
`F13` define e exporta o pacote. Esta story especifica **como integrá-lo no contexto do Shell de autenticação do MOD-001**, com as regras específicas de ausência de `tenant_id` pré-auth.

---

## 2. A Solução (Linguagem de Negócio)

Como **time de engenharia**, queremos que toda ação do Shell do MOD-001 produza telemetria rastreável, permitindo correlacionar um clique de usuário com o evento de domínio correspondente no banco de dados — respeitando as restrições de fase pré-autenticação.

---

## 3. Escopo

### Inclui

- Integração do pacote `ui-telemetry` nos 3 manifests do MOD-001
- Regra de omissão de `tenant_id` para ações de `UX-AUTH-001`
- Validação de presença de `X-Correlation-ID` em todas as actions não-`client_only`
- Mapeamento `status: requested → succeeded | failed` com `http_status` real

### Não inclui

- Definição ou exportação do pacote `ui-telemetry` (coberto por US-MOD-000-F13)
- Middleware de correlação no backend (coberto por US-MOD-000-F14)
- Dashboards de observabilidade ou alertas

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Telemetria de UI no Shell do MOD-001

  Cenário: Ação de login emite UIActionEnvelope sem tenant_id
    Dado que o usuário está na tela de Login (UX-AUTH-001)
    Quando ele submete o formulário de login
    Então o pacote ui-telemetry deve emitir UIActionEnvelope com:
      | campo        | valor                    |
      | screen_id    | UX-AUTH-001              |
      | action       | submit                   |
      | operation_id | auth_login               |
      | status       | requested                |
    E o campo tenant_id NÃO deve estar presente no envelope (DOC-ARC-003 §2)

  Cenário: Ação de login bem-sucedida atualiza status do envelope
    Dado que o envelope com status "requested" foi emitido
    Quando a API retorna 200
    Então o pacote deve emitir um segundo envelope com status "succeeded"
    E duration_ms deve estar preenchido

  Cenário: Ação de login com erro atualiza status e inclui http_status
    Dado que o envelope com status "requested" foi emitido
    Quando a API retorna 401
    Então o pacote deve emitir envelope com status "failed"
    E http_status = 401
    E problem_type derivado de RFC 9457

  Cenário: Toda requisição API do Shell propaga X-Correlation-ID
    Dado que o usuário está autenticado no Shell
    Quando qualquer action não-client_only é disparada (view, submit)
    Então o header X-Correlation-ID deve estar presente na requisição HTTP
    E o mesmo correlation_id deve compor o UIActionEnvelope emitido

  Cenário: Ações client-only não emitem telemetria de rede
    Dado que o usuário troca de painel (login ↔ recover) na UX-AUTH-001
    Quando a action "view" client_only=true é executada
    Então nenhuma requisição HTTP deve ser feita
    E o pacote ui-telemetry pode emitir evento local (ui_only=true)
```

---

## 5. Definition of Ready (DoR)

- [ ] Pacote `ui-telemetry` especificado em US-MOD-000-F13
- [ ] Middleware `X-Correlation-ID` especificado em US-MOD-000-F14
- [ ] Screen Manifests dos 3 telas do MOD-001 criados com `telemetry_defaults`
- [ ] Regra de omissão de `tenant_id` documentada em DOC-ARC-003 §2
- [ ] US-MOD-001 aprovada pelo owner

## 6. Definition of Done (DoD)

- [ ] `UIActionEnvelope` emitido corretamente em todas as actions não-`client_only` dos 3 manifests
- [ ] Testes de integração validam ausência de `tenant_id` em ações de `UX-AUTH-001`
- [ ] `X-Correlation-ID` verificado em todos os headers de requisição do Shell
- [ ] Evidências (PR/issue) documentadas neste arquivo

---

## 7. Manifests Vinculados

| Manifest | Screen ID | Ações rastreadas |
| --- | --- | --- |
| [ux-auth-001.login.yaml](file:///d:/Dev/EasyCodeFramework/docs/05_manifests/screens/ux-auth-001.login.yaml) | UX-AUTH-001 | submit (auth_login, auth_forgot_password, auth_reset_password) |
| [ux-shell-001.app-shell.yaml](file:///d:/Dev/EasyCodeFramework/docs/05_manifests/screens/ux-shell-001.app-shell.yaml) | UX-SHELL-001 | view (auth_me), submit (auth_logout) |
| [ux-dash-001.main.yaml](file:///d:/Dev/EasyCodeFramework/docs/05_manifests/screens/ux-dash-001.main.yaml) | UX-DASH-001 | view (auth_me) |

---

## 8. Regras Críticas

1. `tenant_id` DEVE ser `null` ou omitido em toda ação de `UX-AUTH-001` (fase pré-autenticação)
2. `X-Correlation-ID` DEVE estar presente nos headers de toda requisição API não-`client_only`
3. O mesmo `correlation_id` DEVE compor o `UIActionEnvelope` **e** o header HTTP da requisição
4. `status` DEVE transitar: `requested` → `succeeded` (2xx) ou `failed` (4xx/5xx)
5. `duration_ms` DEVE ser preenchido em todas as emissões de `succeeded` e `failed`
