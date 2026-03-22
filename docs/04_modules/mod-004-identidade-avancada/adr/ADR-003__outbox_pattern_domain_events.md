> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-17 | AGN-DEV-09  | Criação Batch 4 (enrich-agent) |

# ADR-003 — Outbox Pattern para Emissão de Domain Events

## Contexto

O MOD-004 define 9 domain events (DATA-003) que devem ser emitidos de forma confiável em resposta a operações de escrita (POST, DELETE) e ao background job de expiração. Esses eventos alimentam a timeline de auditoria, notificações e integração com módulos consumidores (MOD-005, MOD-006, MOD-007, MOD-008).

O problema fundamental é garantir **at-least-once delivery** sem perda de eventos em caso de falha entre a persistência da entidade e a publicação do evento. A arquitetura Nível 2 (DOC-ESC-001 §7) exige domain events obrigatórios com confiabilidade.

## Decisão

**Utilizar o Outbox Pattern: INSERT do domain event na mesma transação SQL da mutação da entidade. Um Worker separado (BullMQ) faz claim do outbox e processa/publica os eventos.**

Fluxo:

1. Service executa mutação (INSERT/UPDATE na tabela de negócio)
2. Na mesma transação: INSERT na tabela `domain_events` com `processed_at = NULL`
3. COMMIT atômico
4. Worker (separado do API server) faz polling na `domain_events` WHERE `processed_at IS NULL`
5. Worker processa o evento (notificações, timeline, etc.) e marca `processed_at = now()`
6. Deduplicação via `UNIQUE(tenant_id, dedupe_key)` — retry seguro

## Alternativas Consideradas

| Alternativa | Prós | Contras |
|---|---|---|
| **A) Publish direto após commit** (ex: `eventBus.emit()` após `await repo.save()`) | Simples; baixa latência | Evento perdido se app crash entre commit e emit; sem garantia de delivery; impossível replay |
| **B) Event Sourcing completo** | Replay nativo; histórico completo | Complexidade extrema para o escopo do módulo; overhead de projeções; overkill para Nível 2 |
| **C) Outbox Pattern (escolhida)** | At-least-once garantido; transação atômica; Worker independente; replay possível; deduplicação nativa | Latência de polling (mitigada com BullMQ cron 5min); tabela `domain_events` cresce (mitigada com retenção 5 anos + purging) |
| **D) CDC (Change Data Capture) via Debezium** | Transparente para a aplicação; evento derivado do WAL | Infra adicional (Debezium + Kafka); complexidade operacional; overhead para equipe pequena |

## Consequências

- **Positivas:**
  - Garantia de at-least-once delivery sem infraestrutura adicional (usa PostgreSQL + BullMQ já existentes)
  - Transação atômica: se o INSERT na entidade falhar, o evento também não é criado
  - Worker desacoplado do API server — falha no Worker não impacta endpoints
  - Deduplicação nativa via `UNIQUE(tenant_id, dedupe_key)` — retry seguro sem duplicação
  - Replay possível: re-processar eventos não processados após incidente
  - Alinhado com DOC-DEV-001 DATA-012 (Worker separado faz claim do outbox)

- **Negativas:**
  - Latência entre commit e processamento do evento (polling interval do Worker)
  - Tabela `domain_events` pode crescer significativamente — requer política de retenção (5 anos definida em SEC-001)
  - O Worker precisa ser monitorado (health check, alerting se parado > 10min — NFR-001.2)

- **Mitigações:**
  - Background job com cron `*/5 * * * *` (latência máxima ~5 min — OKR-3)
  - Índices otimizados em `domain_events` (DATA-003): `(tenant_id, entity_type, entity_id, created_at DESC)` e `(tenant_id, event_type, created_at DESC)`
  - Purging cron para registros processados com mais de 5 anos (SEC-001 §5)
  - Health check: métrica `identity.expiration.job.last_run_at` com alerta se > 10min (NFR-001.2)

## Status

**ACEITA** — Padrão Nível 2 mandatório (DOC-ESC-001 §3.6, DOC-DEV-001 DATA-012)

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-17
- **rastreia_para:** US-MOD-004, DATA-003, INT-001.2, NFR-001, SEC-001, DOC-ESC-001, DOC-DEV-001
- **referencias_exemplos:** EX-IDEMP-001 (idempotência), EX-RES-001 (resiliência)
- **evidencias:** DATA-003 v0.2.0 (9 eventos catalogados), INT-001.2 (BullMQ Worker)
