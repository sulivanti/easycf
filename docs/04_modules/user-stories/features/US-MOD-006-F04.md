# US-MOD-006-F04 — UX: Listagem de Casos (UX-CASE-002)

**Status Ágil:** `APPROVED`
**Versão:** 1.1.0
**Data:** 2026-03-18
**Módulo Destino:** **MOD-006** (Execução de Casos — UX)
**Referências Normativas:** DOC-DEV-001, DOC-UX-010, DOC-ARC-003

## Metadados de Governança

- **status_agil:** APPROVED
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-18
- **rastreia_para:** US-MOD-006, US-MOD-006-F01, US-MOD-006-F03, DOC-UX-010
- **nivel_arquitetura:** 2
- **tipo:** UX — listagem com filtros
- **epico_pai:** US-MOD-006
- **manifests_vinculados:** UX-CASE-002
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **usuário operacional ou gestor**, quero uma listagem de todos os casos com filtros por ciclo, status, estágio e minha responsabilidade, para priorizar meu trabalho e acompanhar o estado dos processos.

---

## 2. Escopo

### Inclui

- Tabela de casos com colunas: código, ciclo, estágio, status, meu papel, gates pendentes, data abertura
- Filtros: ciclo (PUBLISHED), status, estágio atual, "Minha responsabilidade", date range
- Persistência de filtros na URL (deep link)
- Paginação cursor-based (sem offset)
- Busca por código do caso ou object_id (debounce 400ms)
- Drawer para abertura de novo caso (select ciclo PUBLISHED + campos opcionais)
- Badge vermelho para gates pendentes com navegação para aba Gates
- Estado vazio com CTA contextual

### Não inclui

- Painel de detalhe do caso — US-MOD-006-F03
- APIs de backend — US-MOD-006-F01, US-MOD-006-F02
- Relatórios e dashboards — escopo futuro

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Listagem de Casos — UX-CASE-002

  Cenário: Carregamento com skeleton
    Dado que usuário acessa /casos com process:case:read
    Quando GET /cases está em andamento
    Então tabela exibe skeleton com N linhas placeholder

  Cenário: Badge vermelho para cases com gates pendentes
    Dado que um caso tem 2 gate_instances PENDING
    Então coluna "Gates" exibe badge vermelho "2"
    E clique no badge navega para /casos/:id aba Gates

  Cenário: Filtro "Minha responsabilidade"
    Dado que usuário ativa filtro "Minha responsabilidade"
    Então GET /cases?assigned_to_me=true é chamado
    E apenas casos onde o usuário é case_assignment ativo aparecem
    E filtro persiste na URL (?assigned_to_me=true)

  Cenário: Abrir novo caso via drawer
    Dado que usuário tem scope process:case:write e clica "Novo Caso"
    Então drawer abre com select de ciclo (apenas PUBLISHED)
    Quando seleciona ciclo e clica "Abrir caso"
    Então POST /cases é chamado
    E após 201, redireciona para /casos/:id do novo caso

  Cenário: Filtros persistidos na URL para deep link
    Dado que usuário filtrou por ciclo=Comercial e status=OPEN
    Quando compartilha a URL
    Então outro usuário abre com os mesmos filtros aplicados

  Cenário: Estado vazio com CTA
    Dado que não há casos com os filtros aplicados
    Então: "Nenhum caso encontrado." + link "Abrir primeiro caso" se scope write

  Cenário: Paginação cursor-based
    Dado que há 50 casos
    Quando usuário chega ao fim da lista
    Então botão "Carregar mais" aparece se nextCursor presente
    E novos casos são adicionados à lista (append, sem substituição)
```

---

## 4. Manifests Vinculados

| Manifest | Tela | Arquivo |
|---|---|---|
| UX-CASE-002 | Listagem de Casos | [ux-case-002.listagem-casos.yaml](../../../05_manifests/screens/ux-case-002.listagem-casos.yaml) |

---

## 5. Regras Críticas

1. **Cursor-based**: nunca offset/page — problema de records shiftados
2. **Gates pendentes**: coluna badge clickável → navega para aba Gates do caso
3. **Minha responsabilidade**: filtro extra (não padrão) — precisa ser explicitamente ativado
4. **URL sync**: todos os filtros persistem em query params

---

## 6. Definition of Ready (DoR) ✅

- [x] Manifest UX-CASE-002 criado
- [x] F01 em READY (API cases_list consumida)
- [x] Gherkin com 7 cenários cobrindo listagem, filtros, paginação e abertura
- [x] Owner confirmar READY → APPROVED ✅ (2026-03-18)

## 7. Definition of Done (DoD)

- [ ] Listagem cursor-based funcional
- [ ] Filtros com URL sync
- [ ] Drawer de abertura de caso
- [ ] Badge de gates pendentes com navegação
- [ ] Filtro "Minha responsabilidade"
- [ ] Testes com diferentes combinações de filtros
- [ ] Evidências documentadas (PR/issue)

---

## 8. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Listagem cursor-based, filtros, drawer de abertura, 7 cenários Gherkin. |
| 1.1.0 | 2026-03-18 | Marcos Sulivan | Revisão final e promoção para APPROVED. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
