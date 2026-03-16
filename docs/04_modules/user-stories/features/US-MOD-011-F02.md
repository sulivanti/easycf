# US-MOD-011-F02 — UX: Grade de Inclusão em Massa (UX-SGR-001)

**Status Ágil:** `READY` (aguarda PEND-SGR-01)
**Versão:** 1.0.0
**Data:** 2026-03-15
**Módulo Destino:** **MOD-011** (SmartGrid — UX)
**Referências Normativas:** DOC-DEV-001, DOC-UX-010, DOC-ARC-003
**operationIds consumidos:** `routine_engine_evaluate`, `admin_framers_list`

## Metadados de Governança
- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-011, US-MOD-011-F01, US-MOD-007-F03, DOC-UX-010
- **tipo:** UX — grade editável de inclusão em massa
- **epico_pai:** US-MOD-011
- **manifests_vinculados:** UX-SGR-001
- **pendencias:** PEND-SGR-01
- **evidencias:** N/A

---

## 1. A Solução

Como **usuário operacional**, quero preencher múltiplos registros em uma grade, validar todas as linhas contra a Operação e salvar o lote somente quando todas estiverem válidas — podendo exportar/importar JSON.

---

## 2. Escopo

### Inclui
- Grade com colunas definidas por `visible_fields` do motor, defaults pré-preenchidos
- Validação por linha (motor 1 por vez) com status ✅ ❌ ⚠️
- "Salvar" habilitado somente com 100% ✅
- Revalidação sempre total (todas as linhas)
- Export/Import JSON client-side (sem servidor)
- Modal de confirmação ao fechar com dados não salvos
- Limite configurável de linhas por sessão

### Não inclui
- Ações em massa — US-MOD-011-F05
- Alteração de registro — US-MOD-011-F03
- Exclusão em massa — US-MOD-011-F04

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Grade de Inclusão em Massa — UX-SGR-001

  Cenário: Grade carregada com campos da Operação
    Dado que a grade está configurada com Operação "COMPRA-SERVICO"
    Quando a grade é aberta
    Então colunas = visible_fields, asterisco = required_fields, defaults pré-preenchidos

  Cenário: Linhas novas iniciam com status neutro
    Então todas as linhas sem ícone, botão "Salvar" desabilitado

  Cenário: Validação individual — linha válida
    Então ícone ✅

  Cenário: Validação individual — linha com bloqueio
    Então ícone ❌ com mensagem de blocking_validation

  Cenário: Validação individual — linha com alerta
    Então ícone ⚠️ sem bloquear salvamento

  Cenário: Botão "Salvar" habilitado somente com 100% ✅

  Cenário: Revalidação sempre revalida todas as linhas

  Cenário: Exportar estado em JSON
    Então download de { operacao_id, columns, rows }

  Cenário: Importar JSON previamente exportado
    Então grade populada, status neutro, aviso se Operação diferente

  Cenário: Fechar sem exportar — modal de confirmação

  Cenário: Limite máximo de linhas
    Então botão "Adicionar" desabilitado ao atingir limite
```

---

## 4. Manifests Vinculados

| Manifest | Tela | Arquivo |
|---|---|---|
| UX-SGR-001 | Grade de Inclusão em Massa | [ux-sgr-001.inclusao-massa.yaml](../../../05_manifests/screens/ux-sgr-001.inclusao-massa.yaml) |

## 5. Regras Críticas

1. Motor chamado 1 linha por vez
2. Revalidação total
3. "Salvar" somente 100% ✅
4. Export/Import client-side
5. Modal ao fechar com dados não salvos
6. Limite de linhas configurável

---

## 6. DoR ✅ / DoD

**DoR:** PEND-SGR-01 resolvida, F01 em READY.
**DoD:** Grade renderiza campos do motor, validação por linha, export/import, limite de linhas, modal de confirmação, testes E2E.

---

## 7. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Grade de inclusão em massa, 11 cenários Gherkin, manifest UX-SGR-001. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
