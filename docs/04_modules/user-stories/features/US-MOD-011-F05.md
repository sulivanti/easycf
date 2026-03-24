# US-MOD-011-F05 — UX: Ações em Massa sobre Linhas Selecionadas

**Status Ágil:** `READY`
**Versão:** 1.2.0
**Data:** 2026-03-24
**Módulo Destino:** **MOD-011** (SmartGrid — UX, parte de UX-SGR-001)
**Referências Normativas:** DOC-DEV-001, DOC-UX-010

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-24
- **rastreia_para:** US-MOD-011, US-MOD-011-F02
- **tipo:** UX — toolbar de ações em massa
- **epico_pai:** US-MOD-011
- **manifests_vinculados:** UX-SGR-001
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **usuário operacional na grade de inclusão**, quero aplicar operações em lote sobre as linhas selecionadas — preencher coluna, limpar coluna ou duplicar linha — sem fazer manualmente.

---

## 2. Escopo

### Inclui

- Toolbar oculta (não desabilitada) quando nenhuma linha selecionada
- "Aplicar valor": select coluna + input valor → preenche em todas as linhas marcadas
- "Limpar coluna": select coluna → remove valor em todas as linhas marcadas
- "Duplicar item": exatamente 1 linha → N cópias no final da grade
- Status das linhas afetadas volta a neutro após qualquer ação

### Não inclui

- Grade de inclusão (container) — US-MOD-011-F02
- Validação — coberta pela F02

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Ações em Massa sobre Linhas — UX-SGR-001 (toolbar)

  Cenário: Toolbar visível apenas com linhas marcadas
    Dado que nenhuma linha selecionada
    Então botões ocultos
    Quando seleciona ≥1 linha
    Então toolbar aparece

  Cenário: Aplicar valor em coluna
    Então preenche coluna em todas as linhas marcadas, status volta a neutro

  Cenário: Limpar coluna nas linhas marcadas
    Então remove valor, status volta a neutro

  Cenário: Duplicar item — exatamente 1 linha
    Então N cópias no final da grade com status neutro

  Cenário: Duplicar item — mais de 1 linha marcada
    Então mensagem explicativa, nenhuma linha criada

  Cenário: Status reiniciado após ação em massa
    Então linhas afetadas voltam a neutro, "Salvar" desabilitado
```

---

## 4. Regras Críticas

1. Toolbar **oculta** (não desabilitada) sem seleção
2. "Duplicar" = exatamente 1 linha
3. Novas linhas duplicadas no final da grade
4. Qualquer ação reinicia status para neutro

---

## 5. DoR ✅ / DoD

**DoR:** UX-SGR-001 manifest aprovado (PEND-SGR-01 resolvida).
**DoD:** Toolbar show/hide, aplicar valor, limpar coluna, duplicar 1 e N, status reiniciado.

---

## 6. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Ações em massa, 6 cenários Gherkin. |
| 1.1.0 | 2026-03-19 | arquitetura | APPROVED. Cascata do épico US-MOD-011. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
