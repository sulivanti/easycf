# US-MOD-006-F03 — UX: Painel do Caso em Andamento (UX-CASE-001)

**Status Ágil:** `APPROVED`
**Versão:** 1.1.0
**Data:** 2026-03-18
**Módulo Destino:** **MOD-006** (Execução de Casos — UX)
**Referências Normativas:** DOC-DEV-001, DOC-UX-010, DOC-ARC-003

## Metadados de Governança

- **status_agil:** APPROVED
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-18
- **rastreia_para:** US-MOD-006, US-MOD-006-F01, US-MOD-006-F02, DOC-UX-010
- **nivel_arquitetura:** 2
- **tipo:** UX — painel de caso em andamento
- **epico_pai:** US-MOD-006
- **manifests_vinculados:** UX-CASE-001
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **usuário operacional**, quero ver tudo sobre o meu caso em uma única tela: em que estágio estou, quais gates preciso resolver, quem é responsável por quê, quais transições estão disponíveis e um histórico completo de tudo que aconteceu.

---

## 2. Escopo

### Inclui
- Header com código do caso, ciclo, status e estágio atual
- Barra de progresso por macroetapas (concluída / atual / futura)
- Botões de transição habilitados/desabilitados conforme gates e papéis
- Mini-form inline para transições com evidence_required
- Aba Gates: resolução por tipo (APPROVAL, DOCUMENT, CHECKLIST) + dispensa (waive)
- Aba Responsáveis: atribuição, reatribuição com confirmação modal
- Aba Histórico: timeline intercalando 3 históricos + campo de comentário
- Controles contextuais: Suspender, Retomar, Cancelar (com modal e motivo)
- Modo readonly para casos COMPLETED/CANCELLED

### Não inclui
- APIs de backend — US-MOD-006-F01, US-MOD-006-F02
- Listagem de casos — US-MOD-006-F04
- Editor de blueprint — US-MOD-005-F03

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Painel do Caso — UX-CASE-001

  Cenário: Carregamento com skeleton
    Dado que usuário acessa /casos/:id com process:case:read
    Quando GET /cases/:id está em andamento
    Então header, barra de progresso e painel principal exibem skeleton

  Cenário: Barra de progresso mostra macroetapa atual
    Dado que ciclo tem macroetapas: Preparação, Validação, Aprovação
    E caso está em estágio da macroetapa "Validação"
    Então "Preparação" aparece com ✓ (concluída)
    E "Validação" aparece destacada (atual)
    E "Aprovação" aparece neutra (futura)

  Cenário: Transição disponível sem bloqueios — botão ativo
    Dado que todos os gates required do estágio atual estão RESOLVED
    E usuário tem o papel autorizado para a transição "Aprovar"
    Então botão "Aprovar" está habilitado e clicável
    Quando clica em "Aprovar"
    Então modal de confirmação: "Deseja avançar para 'Aguardando Execução'?"
    Quando confirma
    Então POST /cases/:id/transition é chamado
    E estágio atualiza no header e na barra de progresso

  Cenário: Transição bloqueada por gate pendente
    Dado que gate "Aprovação Gerencial" está PENDING
    Então botão da transição que requer gate está desabilitado
    E tooltip: "Gate 'Aprovação Gerencial' ainda pendente"

  Cenário: Transição com evidence_required — mini-form inline
    Dado que transição tem evidence_required=true
    Quando usuário clica no botão da transição
    Então mini-form inline abre: campo nota (textarea) OU upload de arquivo
    E botão "Confirmar transição" só habilita após evidence preenchida

  Cenário: Resolver gate APPROVAL
    Dado que usuário está na aba "Gates" e tem papel com can_approve=true
    Quando clica "Resolver" no gate "Aprovação Gerencial" (APPROVAL)
    Então form inline abre: radio APROVAR / REPROVAR + textarea parecer (obrigatório)
    Quando seleciona APROVAR e preenche parecer e confirma
    Então POST /cases/:id/gates/:gateId/resolve é chamado
    E card do gate muda para RESOLVED com badge verde "Aprovado"
    E se todos os gates required RESOLVED: botões de transição são habilitados automaticamente

  Cenário: Gate APPROVAL resolvido com REJECTED
    Dado que gate é resolvido com decision=REJECTED
    Então card do gate muda para badge vermelho "Reprovado" com parecer
    E botões de transição permanecem bloqueados
    E na timeline: entry GATE_RESOLVED com badge "Reprovado" em vermelho

  Cenário: Dispensar gate com justificativa obrigatória
    Dado que usuário tem scope process:case:gate_waive
    Quando clica "Dispensar" num gate obrigatório
    Então form abre com aviso: "Esta ação será auditada. Informe o motivo."
    E campo motivo obrigatório (min 20 chars)
    Quando confirma
    Então card do gate muda para "Dispensado" (badge âmbar)

  Cenário: Reatribuir responsável
    Dado que usuário está na aba "Responsáveis" com process:case:assign
    Quando clica "Reatribuir" no papel RESPONSAVEL
    Então autocomplete de usuários abre
    Quando seleciona Maria e clica "Confirmar"
    Então modal: "Substituir João por Maria no papel Responsável?"
    Quando confirma
    Então PATCH /cases/:id/assignments/:aid é chamado
    E card do RESPONSAVEL atualiza para Maria

  Cenário: Papel required sem atribuição — aviso visual
    Dado que papel RESPONSAVEL é required=true e não tem atribuição ativa
    Então card do papel tem borda vermelha e label "Obrigatório — não atribuído"
    E botões de transição estão desabilitados com tooltip "Papel Responsável não atribuído"

  Cenário: Adicionar comentário na timeline
    Dado que usuário está na aba "Histórico"
    Quando digita "Aguardando resposta do cliente" no campo do rodapé e confirma
    Então POST /cases/:id/events { event_type: "COMMENT" } é chamado
    E novo item aparece no topo da timeline imediatamente (optimistic update)

  Cenário: Timeline intercala 3 históricos
    Dado que o caso tem: transição às 09h, gate resolvido às 14h, comentário às 10h
    Quando usuário abre aba "Histórico"
    Então ordem exibida: 14h (GATE), 10h (EVENT), 09h (STAGE)
    E cada tipo tem ícone e cor distintos

  Cenário: Caso ON_HOLD — transições e gates bloqueados na UI
    Dado que caso.status=ON_HOLD
    Então botões de transição mostram banner "Caso em espera — suspenda ou retome"
    E resolução de gates está desabilitada
    E botão "Retomar" aparece no header

  Cenário: Caso COMPLETED — painel somente leitura
    Dado que caso.status=COMPLETED
    Então header mostra badge azul "Concluído" com data de conclusão
    E aba "Responsáveis" sem botões de ação
    E aba "Gates" sem botões de ação
    E botão "Comentar" permanece ativo (registro de observações pós-conclusão)
```

---

## 4. Manifests Vinculados

| Manifest | Tela | Arquivo |
|---|---|---|
| UX-CASE-001 | Painel do Caso em Andamento | [ux-case-001.painel-caso.yaml](../../../05_manifests/screens/ux-case-001.painel-caso.yaml) |

---

## 5. Regras Críticas

1. **Transições**: UI pré-habilita/desabilita baseada em gate_instances conhecidas — validação definitiva é server-side
2. **Gate WAIVE**: campo motivo obrigatório (min 20 chars) + aviso de auditoria visível
3. **ON_HOLD**: bloqueia transições e gates na UI com banner explicativo
4. **Timeline**: optimistic update para comentários — sem reload da página
5. **Reatribuição**: sempre exige confirmação modal com "Substituir X por Y?"

---

## 6. Definition of Ready (DoR) ✅

- [x] Manifest UX-CASE-001 criado
- [x] F01/F02 em READY (APIs consumidas pelo painel)
- [x] Gherkin com 14 cenários cobrindo todas as abas e estados do caso
- [x] Owner confirmar READY → APPROVED ✅ (2026-03-18)

## 7. Definition of Done (DoD)

- [ ] 4 painéis funcionando (Visão Geral, Gates, Responsáveis, Histórico)
- [ ] Transições habilitadas/desabilitadas por gates e papéis
- [ ] Gates com forms por tipo (APPROVAL, DOCUMENT, CHECKLIST)
- [ ] Timeline intercalada com 3 históricos
- [ ] Reatribuição com confirmação modal
- [ ] Modo readonly para COMPLETED/CANCELLED
- [ ] Testes E2E dos fluxos críticos
- [ ] Evidências documentadas (PR/issue)

---

## 8. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Painel do caso com 4 abas, 14 cenários Gherkin, manifest UX-CASE-001. |
| 1.1.0 | 2026-03-18 | Marcos Sulivan | Revisão final e promoção para APPROVED. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
