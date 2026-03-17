# US-MOD-008-F03 — API: Motor de Execução (BullMQ + Outbox + Retry + DLQ)

**Status Ágil:** `READY`
**Versão:** 1.0.0
**Data:** 2026-03-15
**Módulo Destino:** **MOD-008** (Integração Dinâmica — Backend)
**Referências Normativas:** DOC-DEV-001 §4.3, DOC-ARC-001, DOC-ARC-003

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-008, US-MOD-008-F01, US-MOD-008-F02, US-MOD-006, DOC-DEV-001 §4.3, DOC-ARC-003
- **nivel_arquitetura:** 2 (Outbox Pattern, BullMQ, retry backoff exponencial, DLQ, audit log)
- **tipo:** Backend — motor assíncrono
- **epico_pai:** US-MOD-008
- **manifests_vinculados:** N/A
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **sistema**, quero um motor assíncrono que executa chamadas HTTP ao Protheus com garantias de entrega (Outbox Pattern), retry com backoff exponencial e DLQ para chamadas irrecuperáveis — de forma que falhas sejam observáveis e reprocessáveis sem intervenção no código.

---

## 2. Outbox Pattern — Garantia de Entrega

```
TRANSAÇÃO DE NEGÓCIO (ex: case.stage_transitioned)
  │
  ├── INSERT stage_history
  ├── UPDATE case_instances.current_stage_id
  └── INSERT integration_call_logs (status=QUEUED, queued_at=now()) ← OUTBOX

COMMIT da transação de negócio ← tudo ou nada

WORKER BullMQ (processo separado, monitora QUEUED logs)
  └── SELECT * FROM integration_call_logs WHERE status='QUEUED' ORDER BY queued_at
  └── Enfileira job: { log_id, routine_id, case_id, correlation_id }

WORKER DE EXECUÇÃO
  └── UPDATE integration_call_logs SET status='RUNNING'
  └── Montar payload (field_mappings + params)
  └── HTTP call → integration_services.base_url + endpoint_tpl
  └── Se SUCCESS:
        UPDATE status=SUCCESS, response_body, http_status, completed_at, duration_ms
        domain_event: integration.call_completed
  └── Se FAILED e attempt < retry_max:
        UPDATE status=QUEUED (requeue), attempt_number+1
        Aguarda retry_backoff_ms * 2^(attempt-1) (backoff exponencial)
  └── Se FAILED e attempt = retry_max:
        UPDATE status=DLQ
        domain_event: integration.call_dlq
        Notificação ao monitor (UX-INTEG-002)
```

---

## 3. Escopo

### Inclui
- Endpoint `POST /integration-engine/execute` (disparo manual/programático)
- Outbox Pattern: INSERT log DENTRO da transação de negócio
- Worker BullMQ com concurrency controlada por env var `INTEGRATION_CONCURRENCY` (default 10) — ajustável por ops sem deploy
- Retry com backoff exponencial (`retry_backoff_ms × 2^(attempt-1)`)
- DLQ após esgotar retry_max
- Reprocessamento de DLQ via API com justificativa e novo log vinculado
- X-Correlation-ID propagado em toda a cadeia
- Domain events para cada estado (queued, completed, failed, dlq, reprocessed)

### Não inclui
- Catálogo de serviços e rotinas — US-MOD-008-F01
- Mapeamentos de campos — US-MOD-008-F02
- Monitor UX — US-MOD-008-F05

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Motor de Execução BullMQ

  Cenário: Execução bem-sucedida
    Dado que job foi enfileirado com call_log.status=QUEUED
    Quando worker executa a chamada e Protheus retorna 200
    Então integration_call_logs.status=SUCCESS
    E response_body e http_status salvos
    E duration_ms calculado
    E domain_event: integration.call_completed emitido com correlation_id

  Cenário: Falha transitória → retry com backoff
    Dado que Protheus retorna 503 (primeiro attempt)
    Então status=QUEUED (requeue) e attempt_number=2
    E worker aguarda retry_backoff_ms=1000ms antes de tentar novamente
    Quando Protheus retorna 503 novamente (segundo attempt)
    Então aguarda 2000ms (1000 × 2^1)
    Quando Protheus retorna 503 (terceiro e último attempt)
    Então status=DLQ
    E domain_event: integration.call_dlq emitido

  Cenário: Outbox — chamada não se perde se worker reiniciar
    Dado que log está QUEUED e worker reinicia antes de executar
    Quando worker volta
    Então re-escaneia logs QUEUED e reenfileira o job
    E chamada é executada exatamente uma vez (sem duplicidade)

  Cenário: Execução manual via API (reprocessamento ou teste)
    Dado que admin tem scope integration:execute
    Quando POST /integration-engine/execute com { routine_id, case_id, dry_run: false }
    Então job é enfileirado imediatamente
    E log criado com correlation_id do request

  Cenário: X-Correlation-ID propagado em toda a cadeia
    Dado que case.stage_transitioned tem correlation_id="abc-123"
    Quando motor executa a chamada HTTP
    Então header X-Correlation-ID: "abc-123" presente na chamada ao Protheus
    E integration_call_logs.correlation_id = "abc-123"
    E domain_event.correlation_id = "abc-123"

  Cenário: Reprocessamento de DLQ cria novo log vinculado ao original
    Dado que call_log está em DLQ
    E admin preencheu motivo e confirmou reprocessamento
    Quando POST /admin/integration-logs/:id/reprocess com { reason }
    Então integration_reprocess_requests criado
    E novo integration_call_logs criado com parent_log_id = id original
    E attempt_number = 1 (começa novo ciclo de retries)
    E log original preservado (status=DLQ, sem alteração)

  Cenário: Timeout da chamada HTTP
    Dado que service.timeout_ms=30000 e Protheus não responde em 30s
    Então chamada abortada: status=FAILED, error_message="Timeout após 30000ms"
    E retry é iniciado normalmente

  Cenário: Payload sensível não aparece nos logs
    Dado que params incluem item is_sensitive=true
    Quando chamada é executada e logada
    Então request_headers no log tem campos sensíveis substituídos por "***"
    E request_payload não contém valores de params is_sensitive
```

---

## 5. Domain Events

| event_type | sensitivity_level |
|---|---|
| `integration.call_queued` | 0 |
| `integration.call_completed` | 0 |
| `integration.call_failed` | 0 |
| `integration.call_dlq` | 0 |
| `integration.call_reprocessed` | 0 |

---

## 6. Configuração BullMQ

```
Queue: integration-execution
  defaultJobOptions:
    removeOnComplete: false  ← manter para auditoria
    removeOnFail: false       ← manter para DLQ
    attempts: 1               ← 1 tentativa por job (retry gerenciado pelo Outbox)
    backoff: { type: 'fixed', delay: 0 }  ← backoff no Outbox, não no BullMQ

Concurrency: 10 workers por instância
DLQ monitoring: a cada 60s escaneia logs DLQ sem notificação → notificação UX
```

---

## 7. Regras Críticas

1. **Outbox Pattern**: INSERT log DENTRO da transação de negócio — atomicidade garantida
2. **Retry gerenciado pelo Outbox**, não pelo BullMQ (simplifica o modelo)
3. **Backoff exponencial**: `retry_backoff_ms × 2^(attempt-1)` — max configurável
4. **Duplicate prevention**: job usa `jobId = call_log.id` — BullMQ deduplica automaticamente
5. **X-Correlation-ID**: propagado como header HTTP E gravado no log E no domain_event
6. **Credenciais**: mascaradas antes de gravar em log, independente de is_sensitive
7. **Reprocessamento**: cria NOVO log (parent_log_id) — log original imutável

---

## 8. Definition of Ready (DoR) ✅

- [x] F01 e F02 em READY (serviços, rotinas, mapeamentos)
- [x] BullMQ já na stack (MOD-004), Redis disponível
- [x] Outbox Pattern documentado com 6 passos
- [x] Gherkin com 8 cenários
- [ ] Owner confirmar READY → APPROVED

## 9. Definition of Done (DoD)

- [ ] Outbox testado com crash de worker
- [ ] Retry backoff exponencial testado
- [ ] DLQ ativado após retry_max
- [ ] Reprocessamento cria novo log com parent_log_id
- [ ] X-Correlation-ID em todos os pontos
- [ ] Credenciais mascaradas em logs
- [ ] Evidências documentadas (PR/issue)

---

## 10. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Motor BullMQ + Outbox + Retry + DLQ, 8 cenários Gherkin, domain events. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
