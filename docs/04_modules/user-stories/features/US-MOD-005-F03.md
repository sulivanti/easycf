# US-MOD-005-F03 — UX: Editor Visual de Fluxo (UX-PROC-001)

**Status Ágil:** `READY`
**Versão:** 1.0.2
**Data:** 2026-03-16
**Módulo Destino:** **MOD-005** (Modelagem de Processos — UX)
**Referências Normativas:** DOC-DEV-001, DOC-UX-010, DOC-ARC-003
**operationIds consumidos:** `admin_cycles_flow`, `admin_stages_create/update/delete`, `admin_transitions_create/delete`, `admin_cycles_publish`, `admin_cycles_fork`

## Metadados de Governança

- **status_agil:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-16
- **rastreia_para:** US-MOD-005, US-MOD-005-F01, US-MOD-005-F02, DOC-UX-010
- **nivel_arquitetura:** 2
- **tipo:** UX — editor visual de fluxo
- **epico_pai:** US-MOD-005
- **manifests_vinculados:** UX-PROC-001
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **analista de processos**, quero um editor visual de fluxo onde posso criar e conectar estágios graficamente, ver macroetapas como swimlanes, e publicar o ciclo quando estiver pronto — tudo sem escrever código ou manipular tabelas diretamente.

---

## 2. Escopo

### Inclui
- Canvas infinito com grafo de nós (estágios) e arestas (transições)
- Swimlanes por macroetapa com cores distintas (até 8 predefinidas)
- Criação de estágio via duplo clique no canvas
- Criação de transição via drag de aresta entre nós
- Deleção de estágio/transição via teclado (Delete/Backspace)
- Badges informativos nos nós (gates, papéis, is_initial, is_terminal)
- Modo readonly automático para ciclos PUBLISHED
- Publish com modal de confirmação e validação de estágio inicial
- Fork de ciclo publicado com redirecionamento para nova versão
- Mini-mapa para grafos grandes (> 15 nós)
- Integração com painel UX-PROC-002 via ícone de configuração

### Não inclui
- Configuração detalhada de estágio (gates, papéis, transições) — US-MOD-005-F04
- APIs de backend — US-MOD-005-F01, US-MOD-005-F02
- Execução de instâncias — MOD-006

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Editor Visual de Fluxo — UX-PROC-001

  Cenário: Carregamento do grafo com skeleton
    Dado que analista acessa /processos/ciclos/:id/editor
    Quando GET /admin/cycles/:id/flow está em andamento
    Então canvas exibe skeleton de nós e arestas placeholder
    E após resposta, nós e arestas são renderizados nas posições salvas

  Cenário: Criar estágio por duplo-clique no canvas
    Dado que o ciclo está em DRAFT
    Quando analista dá duplo clique na área de uma macroetapa no canvas
    Então um nó novo aparece inline com campo nome editável focado
    E ao confirmar (Enter), POST /admin/macro-stages/:mid/stages é chamado
    E nó é renderizado com cor da macroetapa correspondente

  Cenário: Criar transição arrastando aresta entre nós
    Dado que ciclo está em DRAFT e dois estágios existem no canvas
    Quando analista arrasta a porta de saída do Estágio A e solta na porta de entrada do Estágio B
    Então um dialog aparece para nomear a transição (ex: "Aprovar")
    E ao confirmar, POST /admin/stage-transitions é chamado
    E aresta é renderizada com label = nome da transição

  Cenário: Abrir configurador de estágio
    Dado que analista clica no ícone ⚙ de um nó
    Então painel lateral direito (UX-PROC-002) abre para aquele estágio
    E canvas continua visível à esquerda (layout split)

  Cenário: Swimlanes de macroetapas com cores distintas
    Dado que o ciclo tem 3 macroetapas
    Então canvas exibe 3 faixas horizontais com cores diferentes (até 8 predefinidas)
    E cada nó de estágio tem a cor da sua macroetapa
    E label da macroetapa aparece à esquerda de cada swimlane

  Cenário: Nó de estágio com badges informativos
    Dado que um estágio tem 2 gates e 3 papéis vinculados
    Então o nó exibe badges: "2 gates", "3 papéis"
    E is_initial exibe badge ⚑ azul, is_terminal exibe badge ⊠ cinza

  Cenário: Deletar estágio via teclado
    Dado que analista selecionou um nó (estágio) no canvas
    Quando pressiona Delete/Backspace
    Então modal de confirmação abre: "Deseja remover o estágio '{nome}'?"
    Quando confirma, DELETE /admin/stages/:id é chamado
    E nó e suas arestas desaparecem do canvas

  Cenário: Canvas em modo readonly para ciclo PUBLISHED
    Dado que o ciclo tem status=PUBLISHED
    Então canvas não permite arrasto de nós, duplo clique nem criação de arestas
    E banner "Ciclo publicado — use 'Nova versão' para editar" aparece no topo do canvas
    E botão "Nova versão" aparece no header (scope process:cycle:write)

  Cenário: Publicar ciclo — modal de confirmação
    Dado que ciclo está em DRAFT com estágio inicial definido
    Quando analista clica "Publicar" no header
    Então modal abre: "Ao publicar, o ciclo se tornará imutável. Continuar?"
    Quando confirma, POST /admin/cycles/:id/publish é chamado
    E status badge muda para PUBLISHED (verde)
    E canvas entra em modo readonly

  Cenário: Publicar falha sem estágio inicial
    Dado que nenhum estágio tem is_initial=true
    Quando analista tenta publicar
    Então Toast de erro: "O ciclo precisa de ao menos um estágio inicial antes de ser publicado."
    E nó(s) sem is_initial piscam levemente no canvas para indicar o problema

  Cenário: Fork de ciclo publicado
    Dado que ciclo está em PUBLISHED
    Quando analista clica "Nova versão"
    Então POST /admin/cycles/:id/fork é chamado
    E analista é redirecionado para o editor do novo ciclo DRAFT (versão +1)
    E Toast: "Nova versão criada. Você está editando a versão 2."

  Cenário: Mini-mapa para navegação em grafos grandes
    Dado que o ciclo tem mais de 15 nós
    Então mini-mapa é exibido no canto inferior direito do canvas
    E clique no mini-mapa move o viewport para a área correspondente
```

---

## 4. Manifests Vinculados

| Manifest | Tela | Arquivo |
|---|---|---|
| UX-PROC-001 | Editor Visual de Fluxo de Processo | [ux-proc-001.editor-visual.yaml](../../../05_manifests/screens/ux-proc-001.editor-visual.yaml) |

---

## 5. Regras Críticas

1. **Ciclo PUBLISHED** = canvas 100% readonly — nenhuma operação de escrita disponível
2. **Swimlanes**: nós sempre dentro da swimlane de sua macroetapa — drag entre swimlanes move estágio de macroetapa
3. **Posição dos nós**: salva em metadata do estágio (campo `canvas_x`, `canvas_y`) para persistência do layout
4. **Aresta cross-ciclo**: impossível na UI — porta de destino só aceita nós do mesmo ciclo (grafo auto-contido)
5. **Estágio com instâncias ativas**: badge de aviso no nó (ícone ⚠) — deleção bloqueada com mensagem explicativa

---

## 6. Definition of Ready (DoR) ✅

- [x] Manifest UX-PROC-001 criado
- [x] F01/F02 em READY (APIs consumidas pelo editor)
- [x] Biblioteca de canvas selecionada (React Flow ou similar)
- [x] Gherkin com 12 cenários cobrindo criação, edição, publicação e readonly
- [ ] Owner confirmar READY → APPROVED

## 7. Definition of Done (DoD)

- [ ] Canvas renderiza grafo completo (nós + arestas + swimlanes)
- [ ] Drag de aresta cria transição
- [ ] Duplo clique cria estágio inline
- [ ] Modo readonly em PUBLISHED
- [ ] Fork/publish funcionando com modal de confirmação
- [ ] Mini-mapa para grafos grandes (> 15 nós)
- [ ] Testes E2E dos fluxos críticos
- [ ] Evidências documentadas (PR/issue)

---

## 8. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Editor visual canvas com swimlanes, 12 cenários Gherkin, manifest UX-PROC-001. |
| 1.0.1 | 2026-03-16 | Marcos Sulivan | Revisão: alinha owner com épico. |
| 1.0.2 | 2026-03-16 | Marcos Sulivan | Revisão final: adiciona admin_stages_update aos operationIds (persistência canvas_x/canvas_y). |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
