# US-MOD-008-F05 — UX: Monitor de Integrações (UX-INTEG-002)

**Status Ágil:** `APPROVED`
**Versão:** 1.1.0
**Data:** 2026-03-19
**Módulo Destino:** **MOD-008** (Integração Dinâmica — UX)
**Referências Normativas:** DOC-DEV-001, DOC-UX-010, DOC-ARC-003

## Metadados de Governança

- **status_agil:** APPROVED
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-008, US-MOD-008-F03, DOC-UX-010
- **nivel_arquitetura:** 2
- **tipo:** UX — monitor de integrações com DLQ
- **epico_pai:** US-MOD-008
- **manifests_vinculados:** UX-INTEG-002
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **operador de integrações**, quero monitorar o status de todas as chamadas ao Protheus em tempo quase-real, identificar falhas rapidamente, ver o payload completo de cada chamada e reprocessar itens em DLQ com justificativa formal.

---

## 2. Escopo

### Inclui

- Header com métricas do dia (total, taxa de sucesso, DLQ count)
- Tabela de logs com status badges, auto-refresh para RUNNING/QUEUED (30s)
- Filtros: rotina, status, serviço, correlation_id, período (URL sync)
- Detalhe split-view com seções colapsáveis (resumo, request, response, erro, histórico)
- Payload sensível mascarado (servidor aplica antes de retornar)
- Tab DLQ dedicado com badge vermelho e botão "Reprocessar"
- Reprocessamento com motivo obrigatório (min 10 chars)
- Chain de reprocessamentos (histórico de tentativas)
- Paginação cursor-based
- Link "Ver caso" para navegação ao caso vinculado

### Não inclui

- APIs de backend — US-MOD-008-F01, F02, F03
- Editor de rotinas — US-MOD-008-F04

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Monitor de Integrações — UX-INTEG-002

  Cenário: Header com métricas do dia
    Dado que existem 150 chamadas nas últimas 24h: 140 SUCCESS, 8 FAILED, 2 DLQ
    Quando admin acessa /integracoes/monitor
    Então header exibe: "Total: 150 | Taxa de sucesso: 93.3% | DLQ: 2"
    E badge "DLQ: 2" em vermelho se DLQ > 0

  Cenário: Log RUNNING pisca indicando execução em andamento
    Dado que uma chamada tem status=RUNNING
    Então a linha exibe badge azul piscando "Executando..."
    E auto-refresh atualiza a linha a cada 30s automaticamente

  Cenário: Abrir detalhe de chamada em split view
    Quando admin clica numa linha da tabela
    Então painel lateral abre à direita com seções colapsáveis:
      Resumo, Request, Response, Erro (se houver), Histórico de tentativas
    E canvas principal (tabela) permanece visível à esquerda

  Cenário: Payload sensível mascarado no painel de detalhe
    Dado que request_headers inclui "Authorization: Bearer ***"
    Quando admin abre o painel de detalhe
    Então o header Authorization exibe "***" (valor mascarado pelo servidor)
    E tooltip: "Dado sensível mascarado por política de segurança."

  Cenário: Histórico de tentativas mostra chain de reprocessamentos
    Dado que log v1 está DLQ, v2 foi reprocessado e também falhou (DLQ), v3 está SUCCESS
    Quando admin abre o painel de detalhe de qualquer versão
    Então seção "Histórico de tentativas" mostra: v1→DLQ, v2→DLQ, v3→SUCCESS
    E linha do SUCCESS em verde; linhas DLQ em vermelho

  Cenário: Tab DLQ com badge vermelho
    Dado que há 5 chamadas em DLQ
    Então o tab "DLQ" exibe badge vermelho "5"
    E badge atualiza automaticamente a cada 60s

  Cenário: Reprocessar chamada em DLQ — motivo obrigatório
    Dado que admin está no painel DLQ e clica "Reprocessar"
    Então modal abre: "Reprocessar chamada?"
    E campo "Motivo" obrigatório (min 10 chars)
    Quando preenche motivo e confirma
    Então POST /admin/integration-logs/:id/reprocess é chamado
    E badge DLQ decrementa imediatamente (optimistic update)
    E Toast: "Reprocessamento enfileirado. Log original preservado."
    E log original na tabela permanece DLQ (sem alteração)

  Cenário: Log reprocessado linkado ao original
    Dado que reprocessamento foi executado
    Quando admin abre o log original (DLQ)
    Então seção "Histórico de tentativas" inclui o novo log como "Reprocessamento v2"
    E link "Ver nova tentativa" navega para o novo log

  Cenário: Filtro por Correlation ID localiza chamada de um caso específico
    Dado que admin tem o correlation_id de uma transição específica
    Quando digita no filtro "Correlation ID"
    Então apenas o log correspondente aparece (busca exata)
    E botão "Ver caso" no detalhe navega para /casos/:id

  Cenário: Acesso sem scope redirecionado
    Dado que usuário não tem integration:log:read
    Quando acessa /integracoes/monitor
    Então redirect /dashboard com Toast "Sem permissão."
```

---

## 4. Manifests Vinculados

| Manifest | Tela | Arquivo |
|---|---|---|
| UX-INTEG-002 | Monitor de Integrações | [ux-integ-002.monitor-integracoes.yaml](../../../05_manifests/screens/ux-integ-002.monitor-integracoes.yaml) |

---

## 5. Regras Críticas

1. **Auto-refresh**: apenas linhas RUNNING/QUEUED — evitar polling desnecessário
2. **Motivo de reprocessamento**: min 10 chars, obrigatório sem exceção
3. **Log original imutável**: o DLQ permanece DLQ mesmo após reprocessamento bem-sucedido
4. **Payload sensível**: servidor mascara ANTES de retornar — UI não aplica máscara
5. **Badge DLQ**: optimistic update ao confirmar reprocessamento

---

## 6. Definition of Ready (DoR) ✅

- [x] Manifest UX-INTEG-002 criado
- [x] F03 em READY (motor de execução com logs)
- [x] Gherkin com 10 cenários
- [x] Owner confirmar READY → APPROVED (2026-03-19)

## 7. Definition of Done (DoD)

- [ ] Monitor com métricas do dia
- [ ] Auto-refresh para RUNNING/QUEUED
- [ ] Detalhe split-view com payload mascarado
- [ ] DLQ tab com badge e reprocessamento
- [ ] Chain de tentativas no histórico
- [ ] Filtro por correlation_id
- [ ] Testes E2E de reprocessamento
- [ ] Evidências documentadas (PR/issue)

---

## 8. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Monitor com DLQ, 10 cenários Gherkin, manifest UX-INTEG-002. |
| 1.1.0 | 2026-03-19 | arquitetura | Promoção READY → APPROVED (cascata do épico US-MOD-008 v1.2.0). |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
