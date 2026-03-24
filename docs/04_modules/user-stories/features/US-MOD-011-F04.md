# US-MOD-011-F04 — UX: Grade de Exclusão em Massa (UX-SGR-003)

**Status Ágil:** `READY`
**Versão:** 1.2.0
**Data:** 2026-03-24
**Módulo Destino:** **MOD-011** (SmartGrid — UX)
**Referências Normativas:** DOC-DEV-001, DOC-UX-010

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-24
- **rastreia_para:** US-MOD-011, US-MOD-011-F01
- **tipo:** UX — grade de exclusão em massa
- **epico_pai:** US-MOD-011
- **manifests_vinculados:** UX-SGR-003
- **pendencias:** PEND-SGR-02
- **evidencias:** N/A

---

## 1. A Solução

Como **usuário operacional**, quero selecionar múltiplos registros, verificar quais podem ser excluídos conforme a Operação e o status, confirmar e executar a exclusão lógica.

---

## 2. Escopo

### Inclui

- Validação prévia por registro (motor com `current_record_state`)
- Classificação: registros liberados vs. bloqueados (com motivo)
- Exclusão apenas dos liberados (`deleted_at + status=INACTIVE`)
- Confirmação obrigatória antes da exclusão
- Feedback por registro após execução

### Não inclui

- Grade de inclusão — US-MOD-011-F02
- Formulário de alteração — US-MOD-011-F03

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Exclusão em Massa — UX-SGR-003

  Cenário: Validação prévia classifica registros
    Então lista de liberados e bloqueados exibida antes da confirmação

  Cenário: Exclusão apenas dos liberados
    Então liberados: deleted_at + INACTIVE; bloqueados: sem alteração

  Cenário: Cancelar antes da confirmação
    Então nenhum registro alterado

  Cenário: Confirmação sempre obrigatória

  Cenário: Exclusão física nunca acontece
    Então sempre soft delete
```

---

## 4. Manifests Vinculados

| Manifest | Tela | Arquivo |
|---|---|---|
| UX-SGR-003 | Grade de Exclusão em Massa | [ux-sgr-003.exclusao-massa.yaml](../../../05_manifests/screens/ux-sgr-003.exclusao-massa.yaml) |

## 5. Regras Críticas

1. Validação antes da confirmação
2. Exclusão sempre lógica (`deleted_at + status=INACTIVE`)
3. Confirmação explícita obrigatória
4. F01 (`current_record_state`) obrigatório

---

## 6. DoR ✅ / DoD

**DoR:** F01 resolvido, campo de exclusão lógica no modelo do módulo destino.
**DoD:** Validação pré-confirmação, mix liberados/bloqueados, exclusão lógica, feedback por registro.

---

## 7. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Grade de exclusão em massa, 5 cenários Gherkin, manifest UX-SGR-003. |
| 1.1.0 | 2026-03-19 | arquitetura | APPROVED. PEND-SGR-02 resolvida. Cascata do épico US-MOD-011. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
