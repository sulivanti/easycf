# US-MOD-008-F01 — API: Catálogo de Serviços e Rotinas de Integração

**Status Ágil:** `APPROVED`
**Versão:** 1.1.0
**Data:** 2026-03-19
**Módulo Destino:** **MOD-008** (Integração Dinâmica — Backend)
**Referências Normativas:** DOC-DEV-001, DOC-ARC-001

## Metadados de Governança

- **status_agil:** APPROVED
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-008, US-MOD-007-F02, DOC-ARC-001
- **nivel_arquitetura:** 2 (credenciais criptografadas, herança MOD-007, trigger events)
- **tipo:** Backend — cria novos endpoints
- **epico_pai:** US-MOD-008
- **manifests_vinculados:** N/A
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **arquiteto de integração**, quero cadastrar os serviços de destino (Protheus/TOTVS) e criar rotinas de integração dinâmicas que definem o contrato entre o Integrador e o sistema externo — sem escrever código fixo por tela.

---

## 2. Segurança de Credenciais

```
auth_config armazenado:
  - Criptografado em repouso (AES-256 via secret do ambiente)
  - NUNCA retornado em GET /integration-services (mascarado: "***")
  - Acessível apenas pelo worker de execução em runtime
  - Log de chamada: headers sensíveis mascarados antes de persistir
```

---

## 3. Escopo

### Inclui

- CRUD de Serviços de Destino com auth_config criptografado e mascarado
- Criação de rotinas com `routine_type=INTEGRATION` (herda MOD-007)
- Configuração HTTP: método, endpoint template com variáveis, timeout, retry, backoff
- `trigger_events` para disparo automático por eventos do MOD-006
- Fork herda config HTTP + mapeamentos + params

### Não inclui

- Mapeamentos de campos e parâmetros — US-MOD-008-F02
- Motor de execução — US-MOD-008-F03
- Interfaces de editor — US-MOD-008-F04

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Catálogo de Serviços e Rotinas de Integração

  # ── Serviços ─────────────────────────────────────────────────
  Cenário: Criar serviço Protheus de produção
    Quando POST /admin/integration-services com {
      codigo: "PROTHEUS-PROD",
      base_url: "https://protheus.empresa.com/rest",
      auth_type: "BASIC",
      auth_config: { username: "user", password: "pass" },
      environment: "PROD"
    }
    Então status 201
    E auth_config armazenado criptografado
    E evento integration.service_created emitido

  Cenário: GET de serviço nunca retorna auth_config
    Dado que serviço tem auth_type=BASIC com credenciais reais
    Quando GET /admin/integration-services/:id
    Então response.auth_config = "***" (mascarado)
    E senha NUNCA presente na resposta

  Cenário: Serviço INACTIVE não pode ter rotinas ativas disparadas
    Dado que serviço está INACTIVE
    Quando motor de execução tenta chamar rotina vinculada a esse serviço
    Então chamada não ocorre: status=FAILED, error_message="Serviço inativo."

  # ── Rotinas de Integração ─────────────────────────────────────
  Cenário: Criar rotina de integração herdando versionamento do MOD-007
    Quando POST /admin/routines com { routine_type: "INTEGRATION", codigo, nome }
    E POST /admin/routines/:id/integration-config com {
      service_id, http_method: "POST",
      endpoint_tpl: "/WSRESTPV001/PedidoVenda",
      retry_max: 3, retry_backoff_ms: 1000,
      trigger_events: ["case.stage_transitioned"]
    }
    Então behavior_routines criada com routine_type=INTEGRATION
    E integration_routines criada com a configuração HTTP

  Cenário: endpoint_tpl suporta variáveis do contexto
    Dado que endpoint_tpl = "/api/pedidos/{case.object_id}"
    Quando motor de execução resolve o template com case_id
    Então a URL real usa o valor de case.object_id

  Cenário: trigger_events vincula rotina a eventos do MOD-006
    Dado que trigger_events=["case.stage_transitioned"] e estágio = "EM_APROVAÇÃO"
    Quando caso transita para "EM_APROVAÇÃO"
    Então motor de integração é disparado automaticamente
    E correlation_id do case.stage_transitioned é propagado ao job

  Cenário: Rotina publicada herda imutabilidade do MOD-007
    Dado que rotina routine_type=INTEGRATION está PUBLISHED
    Quando PATCH /admin/routines/:id/integration-config
    Então 422: "Rotinas publicadas são imutáveis. Use o fork para criar nova versão."

  Cenário: Fork de rotina de integração copia configuração HTTP e mapeamentos
    Dado que rotina tem integration_routines config + 5 field_mappings + 3 params
    Quando POST /admin/routines/:id/fork com { change_reason }
    Então behavior_routines fork herda do MOD-007
    E integration_routines copiada com novos IDs
    E field_mappings e params copiados com novos IDs

  Cenário: Credenciais de serviço atualizadas nunca aparecem em logs
    Dado que params incluem item is_sensitive=true (ex: api_key)
    Quando motor executa chamada
    Então integration_call_logs.request_headers = { "Authorization": "***" }
    E valor real nunca gravado no log
```

---

## 5. Domain Events

| event_type | sensitivity_level |
|---|---|
| `integration.service_created` | 0 |
| `integration.service_updated` | 0 |
| `integration.routine_configured` | 0 |

---

## 6. Regras Críticas

1. `auth_config` — criptografado em repouso, nunca retornado em GET
2. Herança total do versionamento MOD-007 (DRAFT→PUBLISHED→DEPRECATED, fork)
3. `trigger_events` — array de event_types do MOD-006 que disparam a rotina
4. `endpoint_tpl` — suporta variáveis `{campo.path}` resolvidas em runtime
5. Parâmetros com `is_sensitive=true` — mascarados no log

---

## 7. Definition of Ready (DoR) ✅

- [x] MOD-007 em READY (herança de rotinas)
- [x] Seed de integration_services de HML disponível para testes
- [x] Gherkin com 9 cenários
- [x] Owner confirmar READY → APPROVED (2026-03-19)

## 8. Definition of Done (DoD)

- [ ] Credenciais nunca em GET
- [ ] Fork copia toda a estrutura (HTTP + mapeamentos + params)
- [ ] trigger_events dispara motor
- [ ] PUBLISHED imutável
- [ ] Evidências documentadas (PR/issue)

---

## 9. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Catálogo de serviços + rotinas de integração, 9 cenários Gherkin, domain events. |
| 1.1.0 | 2026-03-19 | arquitetura | Promoção READY → APPROVED (cascata do épico US-MOD-008 v1.2.0). |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
