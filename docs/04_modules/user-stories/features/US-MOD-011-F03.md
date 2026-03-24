# US-MOD-011-F03 — UX: Formulário de Alteração de Registro (UX-SGR-002)

**Status Ágil:** `READY`
**Versão:** 1.2.0
**Data:** 2026-03-24
**Módulo Destino:** **MOD-011** (SmartGrid — UX)
**Referências Normativas:** DOC-DEV-001, DOC-UX-010

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-24
- **rastreia_para:** US-MOD-011, US-MOD-011-F01, US-MOD-007-F03
- **tipo:** UX — formulário de alteração
- **epico_pai:** US-MOD-011
- **manifests_vinculados:** UX-SGR-002
- **pendencias:** PEND-SGR-02
- **evidencias:** N/A

---

## 1. A Solução

Como **usuário operacional**, quero editar um registro existente respeitando o status atual e as regras da Operação, com rastreabilidade do que foi mudado.

---

## 2. Escopo

### Inclui

- Avaliação com `current_record_state` ao abrir (F01 amendment)
- Status bloqueante impede abertura do formulário
- Campos editáveis = visible_fields não bloqueados; campos bloqueados = readonly com cadeado
- Validação antes de salvar
- Log via domain_events (campo, valor anterior, novo valor)
- Formulário sempre em tela separada (nunca inline)

### Não inclui

- Grade de inclusão — US-MOD-011-F02
- Grade de exclusão — US-MOD-011-F04

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Formulário de Alteração — UX-SGR-002

  Cenário: Abrir alteração de registro com status permitido
    Então formulário abre com campos editáveis e readonly conforme motor

  Cenário: Registro com status bloqueante — tela não abre
    Então mensagem de bloqueio exibida

  Cenário: Salvar alteração válida
    Então alteração persistida + domain_events com campo/valor anterior/novo

  Cenário: Formulário sempre em tela separada
```

---

## 4. Manifests Vinculados

| Manifest | Tela | Arquivo |
|---|---|---|
| UX-SGR-002 | Formulário de Alteração de Registro | [ux-sgr-002.alteracao-registro.yaml](../../../05_manifests/screens/ux-sgr-002.alteracao-registro.yaml) |

## 5. Regras Críticas

1. Tela separada: jamais inline
2. `current_record_state` obrigatório — depende do F01
3. Log via domain_events
4. Campos readonly (não ocultos) quando bloqueados por condição

---

## 6. DoR ✅ / DoD

**DoR:** F01 resolvido (PEND-SGR-02), contrato de log confirmado.
**DoD:** Status bloqueante impede abertura, campos readonly por condição, log testado, tela separada.

---

## 7. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Formulário de alteração, 4 cenários Gherkin, manifest UX-SGR-002. |
| 1.1.0 | 2026-03-19 | arquitetura | APPROVED. PEND-SGR-02 resolvida. Cascata do épico US-MOD-011. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
