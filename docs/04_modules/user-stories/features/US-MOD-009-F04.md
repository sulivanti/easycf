# US-MOD-009-F04 — UX: Inbox de Aprovações (UX-APROV-001)

**Status Ágil:** `READY`
**Versão:** 1.0.0
**Data:** 2026-03-15
**Módulo Destino:** **MOD-009** (Aprovações e Alçadas — UX)
**Referências Normativas:** DOC-DEV-001, DOC-UX-010, DOC-ARC-003
**operationIds consumidos:** `my_approvals_list/approve/reject`, `movements_list/cancel`, `movements_override`

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-009, US-MOD-009-F02, US-MOD-009-F03, DOC-UX-010
- **nivel_arquitetura:** 2
- **tipo:** UX — inbox de aprovações
- **epico_pai:** US-MOD-009
- **manifests_vinculados:** UX-APROV-001
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **aprovador**, quero um inbox centralizado com todos os movimentos pendentes para minha decisão, com informações suficientes para aprovar/reprovar sem precisar sair da tela, e um histórico completo de cada movimento para auditoria.

---

## 2. Escopo

### Inclui
- Inbox pessoal com cards por movimento pendente (contagem, countdown de prazo)
- Badge na sidebar com contagem de pendências (atualiza 60s)
- Detalhe split-view com resumo, operação, cadeia de aprovação, histórico
- Aprovação/reprovação com parecer obrigatório (min 10 chars)
- Override com confirmação dupla (justificativa min 20 chars + checkbox)
- Cancelamento de movimentos próprios (aba "Enviados por Mim")
- Painel "Todos os Movimentos" para admin (scope `approval:movement:read`)
- Badges de origem (HUMAN, API, MCP, AGENT)
- Segregação visual: botões desabilitados se caller=solicitante

### Não inclui
- APIs de backend — US-MOD-009-F01, F02, F03
- Configurador de regras — US-MOD-009-F05

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Inbox de Aprovações — UX-APROV-001

  Cenário: Inbox carrega apenas movimentos pendentes para mim
    Dado que João é ROLE=gerente_comercial
    E existem 3 movimentos: 2 para gerente_comercial (PENDING), 1 EXECUTED
    Quando João acessa /aprovacoes
    Então o inbox exibe 2 cards

  Cenário: Badge no sidebar com contagem de pendências
    Dado que João tem 3 aprovações pendentes
    Então item "Aprovações" na sidebar exibe badge âmbar "3"

  Cenário: Card exibe countdown de prazo
    Dado que approval_instance tem timeout_at = 2 horas à frente
    Então card exibe badge vermelho "Expira em 1h 58m"

  Cenário: Abrir detalhe do movimento
    Quando João clica "Ver detalhes"
    Então painel lateral abre com seções: Resumo, Operação, Cadeia, Histórico

  Cenário: Aprovar com parecer obrigatório
    Quando preenche parecer (min 10 chars) e confirma
    Então POST /my/approvals/:approvalId/approve é chamado

  Cenário: Reprovar com parecer obrigatório
    Quando preenche parecer e confirma
    Então POST /my/approvals/:approvalId/reject é chamado

  Cenário: Botões desabilitados se caller=solicitante
    Dado que o movimento foi solicitado pelo próprio João
    Então botões "Aprovar" e "Reprovar" desabilitados
    E tooltip: "Você não pode aprovar o próprio movimento."

  Cenário: Override com confirmação dupla
    Dado que João tem scope approval:override
    Quando clica "Override"
    Então modal com justificativa min 20 chars + checkbox de confirmação

  Cenário: Cancelar movimento enviado por mim
    Dado que João solicitou e movimento está PENDING_APPROVAL
    Quando clica "Cancelar" e preenche motivo
    Então POST /movements/:id/cancel é chamado

  Cenário: Movimento na cadeia — ver progresso
    Dado que movimento tem 2 níveis e nível 1 aprovado
    Então card exibe: "Nível 2 de 2 — aguardando sua aprovação"

  Cenário: Payload da operação exibido de forma segura
    Dado que operation_payload contém campo sensível
    Então campo aparece como "***" (sanitizado pelo servidor)
```

---

## 4. Manifests Vinculados

| Manifest | Tela | Arquivo |
|---|---|---|
| UX-APROV-001 | Inbox de Aprovações | [ux-aprov-001.inbox-aprovacoes.yaml](../../../05_manifests/screens/ux-aprov-001.inbox-aprovacoes.yaml) |

---

## 5. Regras Críticas

1. **Segregação**: botões Aprovar/Reprovar desabilitados se caller=solicitante
2. **Parecer**: obrigatório (min 10 chars)
3. **Override**: checkbox + justificativa min 20 chars
4. **Badge sidebar**: contagem pessoal, atualiza 60s
5. **Origins**: badges visuais distintos para API, MCP, AGENT

---

## 6. Definition of Ready (DoR) ✅

- [x] Manifest UX-APROV-001 criado
- [x] F02/F03 em READY
- [x] Gherkin com 11 cenários
- [ ] Owner confirmar READY → APPROVED

## 7. Definition of Done (DoD)

- [ ] Inbox filtrado por alçada
- [ ] Countdown de prazo funcional
- [ ] Aprovação/reprovação com parecer
- [ ] Segregação visual
- [ ] Override com dupla confirmação
- [ ] Testes E2E
- [ ] Evidências documentadas (PR/issue)

---

## 8. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Inbox com decisão, override, segregação, 11 cenários Gherkin, manifest UX-APROV-001. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
