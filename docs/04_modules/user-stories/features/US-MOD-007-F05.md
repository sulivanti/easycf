# US-MOD-007-F05 — UX: Cadastro de Rotinas (UX-ROTINA-001)

**Status Ágil:** `APPROVED`
**Versão:** 1.2.0
**Data:** 2026-03-19
**Módulo Destino:** **MOD-007** (Parametrização Contextual — UX)
**Referências Normativas:** DOC-DEV-001, DOC-UX-010, DOC-ARC-003
**operationIds consumidos:** `admin_routines_list/create/get`, `admin_routines_publish/fork`, `admin_routine_items_create/update/delete`, `routine_engine_evaluate`

## Metadados de Governança

- **status_agil:** APPROVED
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-007, US-MOD-007-F02, US-MOD-007-F03, DOC-UX-010
- **nivel_arquitetura:** 2
- **tipo:** UX — editor de rotinas com versionamento
- **epico_pai:** US-MOD-007
- **manifests_vinculados:** UX-ROTINA-001
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **administrador funcional**, quero um editor de rotinas onde posso criar, configurar itens, pré-visualizar o resultado e publicar versões, com histórico de todas as mudanças e possibilidade de criar novas versões sem afetar rotinas já em uso.

---

## 2. Escopo

### Inclui

- Listagem de rotinas com filtro por status (DRAFT/PUBLISHED/DEPRECATED)
- Editor split-view (lista à esquerda, editor de itens à direita)
- Formulário adaptativo por tipo de item (7 tipos com campos dinâmicos)
- Drag-and-drop de itens para reordenação (DRAFT only)
- Auto-save de itens com debounce 600ms
- Publicação com modal de confirmação e validação (exige ao menos 1 item)
- Fork com motivo obrigatório (min 10 chars) e cópia de itens
- Modo readonly para PUBLISHED com banner
- Pré-visualização dry-run do motor com resultado em seções
- Timeline de histórico de versões com ancestralidade visual

### Não inclui

- Configurador de enquadradores — US-MOD-007-F04
- Motor de avaliação — US-MOD-007-F03
- APIs de backend — US-MOD-007-F02

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Cadastro de Rotinas — UX-ROTINA-001

  Cenário: Criar rotina DRAFT
    Dado que admin tem scope param:routine:write
    Quando clica "Nova rotina", preenche codigo="ROT-SERV-ENG", nome="Serviço de Engenharia"
    E clica "Criar"
    Então POST /admin/routines é chamado
    E nova linha aparece na lista com status DRAFT (badge âmbar) e "0 itens"

  Cenário: Editor abre ao selecionar rotina
    Quando admin clica na rotina na listagem
    Então painel direito (editor) abre com header, lista de itens e rodapé
    E painel esquerdo (lista) permanece visível (split view)

  Cenário: Adicionar item FIELD_VISIBILITY (SHOW)
    Dado que rotina está em DRAFT
    Quando admin clica "Adicionar item" e seleciona tipo=FIELD_VISIBILITY
    Então campos aparecem: select action (SHOW/HIDE), autocomplete campo-alvo
    Quando preenche action=SHOW, campo=projeto_wbs e confirma
    Então POST /admin/routines/:id/items é chamado
    E item aparece na lista com badge "SHOW · projeto_wbs"

  Cenário: Formulário se adapta ao tipo de item selecionado
    Dado que admin está adicionando item
    Quando seleciona tipo=DOMAIN
    Então campo para lista de valores permitidos aparece (multi-input com chips)
    Quando seleciona tipo=VALIDATION
    Então campo para regra, mensagem de erro e toggle is_blocking aparecem

  Cenário: Item VALIDATION com is_blocking=true — badge visível
    Dado que item de validação tem is_blocking=true
    Então badge vermelho "Bloqueante" aparece na linha do item
    E tooltip: "Este item bloqueia a transição de estágio no MOD-006 se violado."

  Cenário: Reordenar itens por drag-and-drop (DRAFT only)
    Dado que há 3 itens na rotina DRAFT
    Quando admin arrasta item 3 para posição 1
    Então PATCH /admin/routine-items/:id com { ordem: 1 } é chamado ao soltar
    E lista reordena visualmente (optimistic update)

  Cenário: Auto-save ao editar item
    Dado que admin editou o campo "mensagem de erro" de um item
    Quando não digita por 600ms
    Então PATCH /admin/routine-items/:id é chamado automaticamente
    E ícone de "salvo" aparece brevemente no item

  Cenário: Publicar rotina com confirmação
    Dado que rotina DRAFT tem ao menos 1 item
    Quando admin clica "Publicar"
    Então modal: "Ao publicar, a rotina se tornará imutável. Continuar?"
    Quando confirma
    Então POST /admin/routines/:id/publish é chamado
    E status badge muda para PUBLISHED (verde)
    E editor entra em modo readonly + banner "Rotina publicada — use 'Nova versão' para modificar."

  Cenário: Publicar rotina sem itens é bloqueado
    Dado que rotina DRAFT não tem itens
    Quando admin clica "Publicar"
    Então Toast: "Adicione ao menos um item antes de publicar."
    E POST /publish NÃO é chamado

  Cenário: Fork com motivo obrigatório
    Dado que rotina está PUBLISHED
    Quando admin clica "Nova versão"
    Então modal abre com campo "Motivo da mudança" (textarea, obrigatório, min 10 chars)
    Quando preenche e confirma
    Então POST /admin/routines/:id/fork é chamado
    E novo DRAFT aparece na listagem com version+1 e os mesmos itens copiados
    E Toast: "Nova versão criada. Você está editando a versão 2."

  Cenário: Editor readonly para rotina PUBLISHED
    Dado que rotina selecionada está em PUBLISHED
    Então lista de itens não tem drag handles, sem botões editar/deletar
    E botão "Adicionar item" não aparece
    E banner no topo do editor: "Rotina publicada — somente leitura."

  Cenário: Pré-visualização (dry-run)
    Dado que admin clica "Pré-visualizar" no editor
    Então drawer lateral abre com selects pré-preenchidos (objeto e enquadrador vinculados)
    Quando clica "Simular"
    Então POST /routine-engine/evaluate é chamado
    E resultado exibido em seções: visíveis, obrigatórios, ocultos, defaults, domínios, validações
    E validações com is_blocking=true destacadas com badge vermelho
    E aviso: "Simulação sem efeito (dry-run) — nenhum event é registrado."

  Cenário: Histórico de versões em timeline
    Dado que rotina tem 3 versões (v1 DEPRECATED, v2 PUBLISHED, v3 DRAFT)
    Quando admin abre aba "Histórico de Versões"
    Então timeline mostra as 3 versões com: número, status, data, publicada por, motivo
    E linhas de ancestralidade visual (v3 ← v2 ← v1)
    Quando clica em v1: abre visualização readonly dos itens daquela versão
```

---

## 4. Manifests Vinculados

| Manifest | Tela | Arquivo |
|---|---|---|
| UX-ROTINA-001 | Cadastro e Editor de Rotinas de Comportamento | [ux-rotina-001.editor-rotinas.yaml](../../../05_manifests/screens/ux-rotina-001.editor-rotinas.yaml) |

---

## 5. Regras Críticas

1. **Split view**: lista à esquerda sempre visível — editor à direita abre ao selecionar rotina
2. **Auto-save de itens**: debounce 600ms — sem botão "Salvar" explícito por campo
3. **Fork**: campo "Motivo" obrigatório (min 10 chars) — armazenado em `routine_version_history`
4. **PUBLISHED**: editor completamente readonly — banner sempre visível
5. **Preview (dry-run)**: NÃO cria domain_events
6. **is_blocking=true**: badge vermelho visível na listagem + no preview — rastreabilidade clara

---

## 6. Definition of Ready (DoR) ✅

- [x] Manifest UX-ROTINA-001 criado
- [x] F02/F03 em READY (APIs e motor consumidos)
- [x] Gherkin com 13 cenários cobrindo editor, publicação, fork e preview
- [x] Owner confirmar READY → APPROVED (2026-03-19)

## 7. Definition of Done (DoD)

- [ ] Editor split-view funcionando
- [ ] Todos os 7 tipos de item com formulário adaptativo
- [ ] Drag-and-drop de itens com reordenação
- [ ] Fork com motivo obrigatório
- [ ] PUBLISHED readonly com banner
- [ ] Preview dry-run com resultado em seções
- [ ] Timeline de versões com ancestralidade visual
- [ ] Testes E2E dos fluxos críticos
- [ ] Evidências documentadas (PR/issue)

---

## 8. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Editor split-view, 13 cenários Gherkin, manifest UX-ROTINA-001. |
| 1.1.0 | 2026-03-18 | Marcos Sulivan | Alinha com épico v1.1.0: remove referência a cache Redis no dry-run. |
| 1.2.0 | 2026-03-19 | Marcos Sulivan | Revisão final e promoção READY → APPROVED. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
