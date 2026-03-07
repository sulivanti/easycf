# US-MOD-000-F14 — Middlewares de Correlação E2E (CorrelationId Middleware)

**Status:** `para aprovação`
**Módulo Destino:** **MOD-000** (Foundation - API Core)
**Épico Pai:** [US-MOD-000](../epics/US-MOD-000.md)

### Metadados de Governança

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-06
- **rastreia_para:** DOC-ARC-003 (§1 Dogma 3 e §3 Domain Events Bridge)

---

## 1. Contexto e Problema

A fundação técnica da rastreabilidade (`X-Correlation-ID`) exige que a API identifique univocamente toda requisição que entra e repasse esse mesmo ID a cada camada adjacente (Log, Serviços e, mandatória, a persistência na tabela `domain_events`). Se a API deixa isso como opcional, os desenvolvedores de microsserviços esquecerão de injetar a chave nas transações de banco de dados, quebrando assim a ponte UI ↔ API ↔ Domain.

## 2. A Solução

Implementar um conjunto de middlewares nativos em Fastify/NodeJS (ou no framework HTTP oficial adotado) que garantam a leitura do `X-Correlation-ID`. Caso o Front-End não tenha mandado (ex. chamada de fora), o middleware forçosamente gerará um UUIDv4 único. Este ID não transitará de forma insegura, mas sim atrelado ao ciclo de vida da Promise (ex: usando `AsyncLocalStorage` do Node). Todas as inserções no `DomainEventService` beberão automaticamente desse ID corrente.

## 3. Escopo

### Inclui

- Criação de um `correlation-id.middleware.ts`.
- Configuração do injetor para o contexto global da requisição (ex: Fastify `decorateRequest`).
- Padronização: Devolver sempre o `X-Correlation-ID` no response header (para facilitar tracking por Postman ou browsers).
- Atualização do logger base (`pino` / `winston`) para incluir sempre o payload `{ correlation_id }`.
- Garantia via Teste de Contrato de que a persistência final na `domain_events` grava a coluna correlata.

### Não inclui

- Refatoração extensiva de microsserviços legados que não usam do Core API (somente fundação futura).

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Middleware de Propagação do Correlation ID

  Cenário: API recebe requisição e devolve no Response
    Dado que envio um GET genérico /health sem um correlation_id definido
    Quando a API responder
    Então DEVE existir o header "X-Correlation-ID" populado com UUID gerado

  Cenário: UI envia rastreio e backend obedece
    Dado que a camada web envie o "X-Correlation-ID: UI-MEU-RASTREIO" num request POST /v1
    Quando a operação de mutation acontecer
    Então a tabela de banco `domain_events` DEVE estar assinada com `UI-MEU-RASTREIO`
```

---

## 5. Definition of Ready (DoR) e Done (DoD)

*(Mesmas diretrizes globais do épico US-MOD-000)*

- **DoD Específico:** Arquivo de Teste de Integração validando que uma chamada de ponta-a-ponta aciona o repasse de ID até o DB Mockado.
