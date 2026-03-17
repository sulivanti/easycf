# US-MOD-005-F04 — UX: Configurador de Estágio (UX-PROC-002)

**Status Ágil:** `READY`
**Versão:** 1.0.2
**Data:** 2026-03-16
**Módulo Destino:** **MOD-005** (Modelagem de Processos — UX)
**Referências Normativas:** DOC-DEV-001, DOC-UX-010, DOC-ARC-003
**operationIds consumidos:** `admin_stages_get/update`, `admin_gates_create/update/delete`, `admin_stage_roles_create/delete`, `admin_transitions_create/delete`, `admin_process_roles_list`

## Metadados de Governança

- **status_agil:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-16
- **rastreia_para:** US-MOD-005, US-MOD-005-F01, US-MOD-005-F02, US-MOD-005-F03, DOC-UX-010
- **nivel_arquitetura:** 2
- **tipo:** UX — painel lateral de configuração
- **epico_pai:** US-MOD-005
- **manifests_vinculados:** UX-PROC-002
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **analista de processos**, quero configurar cada estágio com seus gates, papéis esperados e transições de saída em um painel lateral detalhado, sem perder a visão do fluxo completo no canvas.

---

## 2. Escopo

### Inclui
- Painel lateral (drawer direito) integrado ao canvas de F03
- 4 abas: Informações, Gates, Papéis, Transições
- Edição inline de nome/descrição do estágio com save
- Toggle de estágio inicial/terminal com validação de conflito
- CRUD de gates com drag-and-drop para reordenação
- Vínculo de papéis via autocomplete do catálogo global
- CRUD de transições de saída com autocomplete de estágio destino
- Seção "Entrada" (transições chegando) em modo readonly
- Sincronização bidirecional canvas ↔ painel
- Auto-save com debounce 800ms nos campos inline
- Modo readonly para ciclo PUBLISHED em todas as abas

### Não inclui
- Canvas e grafo visual — US-MOD-005-F03
- APIs de backend — US-MOD-005-F01, US-MOD-005-F02
- Avaliação de gates em runtime — MOD-006

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Configurador de Estágio — UX-PROC-002

  Cenário: Painel abre para o estágio selecionado
    Dado que analista clica em ⚙ de um estágio no canvas
    Então painel lateral desliza da direita com título "{codigo} — {nome}"
    E aba "Informações" está ativa por padrão

  Cenário: Salvar nome do estágio
    Dado que analista edita o campo nome na aba Info
    Quando clica em "Salvar"
    Então PATCH /admin/stages/:id é chamado com { nome }
    E nó correspondente no canvas atualiza o nome em tempo real (sem reload)

  Cenário: Toggle "estágio inicial" com aviso se outro já é inicial
    Dado que outro estágio já tem is_initial=true
    Quando analista ativa o toggle "Estágio inicial" para o estágio atual
    Então aviso inline: "O estágio '{codigo}' já é o inicial. Desmarque-o primeiro."
    E toggle permanece desativado até o conflito ser resolvido

  Cenário: Adicionar gate APPROVAL ao estágio
    Dado que analista está na aba "Gates" em ciclo DRAFT
    Quando clica (+) e preenche nome="Aprovação Gerencial", tipo=APPROVAL, required=true
    Então POST /admin/stages/:sid/gates é chamado
    E gate aparece na lista com ícone de APPROVAL (azul) e badge "Obrigatório"
    E contador de gates no nó do canvas incrementa

  Cenário: Reordenar gates por drag-and-drop
    Dado que há 3 gates na lista
    Quando analista arrasta gate 3 para posição 1
    Então PATCH /admin/gates/:id com { ordem: 1 } é chamado para o gate movido
    E lista reordena visualmente imediatamente (optimistic update)

  Cenário: Gate INFORMATIVE exibe badge "Não bloqueia"
    Dado que gate tem gate_type=INFORMATIVE
    Então badge cinza "Não bloqueia" aparece ao lado do nome
    E tooltip explica: "Este gate registra informação mas não impede o avanço."

  Cenário: Vincular papel ao estágio
    Dado que analista está na aba "Papéis"
    Quando seleciona "APROVADOR" no autocomplete e clica "Vincular"
    Então POST /admin/stages/:sid/roles é chamado
    E papel aparece na lista com badge can_approve se aplicável
    E contador de papéis no nó do canvas incrementa

  Cenário: Papel can_approve=true exibe badge visual
    Dado que papel APROVADOR tem can_approve=true
    Então badge "Com poder decisório" (azul) aparece ao lado do papel na lista

  Cenário: Adicionar transição de saída via painel
    Dado que analista está na aba "Transições" → seção "Saída"
    Quando clica (+), seleciona estágio destino no autocomplete e nomeia "Aprovar"
    Então POST /admin/stage-transitions é chamado
    E transição aparece na seção Saída
    E aresta correspondente aparece no canvas (sincronização bidirecional)

  Cenário: Transição com gate_required=true exibe badge laranja
    Dado que transição tem gate_required=true
    Então badge laranja "Requer gate" aparece na linha da transição
    E aresta correspondente no canvas fica laranja

  Cenário: Seção Entrada (transições chegando) é readonly
    Dado que existem 2 transições que chegam neste estágio
    Então seção "Entrada" exibe a lista mas sem botões de edição
    E tooltip em cada item: "Configure esta transição no estágio de origem."

  Cenário: Painel em modo readonly para ciclo PUBLISHED
    Dado que ciclo tem status=PUBLISHED
    Então todas as abas do painel exibem os dados mas sem controles de edição
    E banner no topo do painel: "Ciclo publicado — somente leitura."
```

---

## 4. Manifests Vinculados

| Manifest | Tela | Arquivo |
|---|---|---|
| UX-PROC-002 | Configurador de Estágio | [ux-proc-002.config-estagio.yaml](../../../05_manifests/screens/ux-proc-002.config-estagio.yaml) |

---

## 5. Regras Críticas

1. **Sincronização bidirecional**: mudanças no painel refletem imediatamente no canvas (e vice-versa)
2. **Auto-save** nas abas Gates, Papéis e Transições: debounce 800ms nos campos inline
3. **Modo readonly**: ciclo PUBLISHED → painel readonly em TODAS as abas
4. **Seção Entrada (transições)**: sempre readonly no painel — configuração é feita no estágio de origem

---

## 6. Definition of Ready (DoR) ✅

- [x] Manifest UX-PROC-002 criado
- [x] F01/F02 em READY (APIs consumidas pelo painel)
- [x] F03 em READY (canvas onde painel é integrado)
- [x] Gherkin com 12 cenários cobrindo 4 abas e modo readonly
- [ ] Owner confirmar READY → APPROVED

## 7. Definition of Done (DoD)

- [ ] 4 abas funcionando (Info, Gates, Papéis, Transições)
- [ ] Drag-and-drop de gates com reordenação
- [ ] Autocomplete de papéis e estágios destino
- [ ] Sincronização bidirecional canvas ↔ painel
- [ ] Modo readonly em PUBLISHED (todas as abas)
- [ ] Testes de integração canvas-painel
- [ ] Evidências documentadas (PR/issue)

---

## 8. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Painel lateral com 4 abas, 12 cenários Gherkin, manifest UX-PROC-002. |
| 1.0.1 | 2026-03-16 | Marcos Sulivan | Revisão: alinha owner com épico. |
| 1.0.2 | 2026-03-16 | Marcos Sulivan | Revisão final: adiciona operationIds consumidos para rastreabilidade com F01/F02. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
