# US-MOD-009-F05 — UX: Configurador de Regras (UX-APROV-002)

**Status Ágil:** `READY`
**Versão:** 1.0.0
**Data:** 2026-03-15
**Módulo Destino:** **MOD-009** (Aprovações e Alçadas — UX)
**Referências Normativas:** DOC-DEV-001, DOC-UX-010, DOC-ARC-003

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-009, US-MOD-009-F01, DOC-UX-010
- **nivel_arquitetura:** 2
- **tipo:** UX — configurador de regras de controle e alçada
- **epico_pai:** US-MOD-009
- **manifests_vinculados:** UX-APROV-002
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **administrador de governança**, quero configurar visualmente as regras de controle e as cadeias de alçada, podendo simular o comportamento do motor antes de ativar.

---

## 2. Escopo

### Inclui

- Tabela de regras de controle com drawer de criação/edição
- Toggle "Por valor" para critério de threshold
- Cadeia de alçada visual em cards horizontais conectados por setas
- Adição/remoção de níveis de aprovação com configuração de timeout e escalada
- Simulação dry-run do motor com resultado inline
- `allow_self_approve` exibido como toggle na UI (default false — habilita auto-aprovação por suficiência de escopo, ver épico §3.1)
- Vigência expirada com badge visual

### Não inclui

- APIs de backend — US-MOD-009-F01, F02, F03
- Inbox de aprovações — US-MOD-009-F04

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Configurador de Regras — UX-APROV-002

  Cenário: Criar regra de controle por origem
    Dado que admin abre drawer "Nova regra"
    Quando preenche codigo, object_type, operation_type, origin_types, priority, valid_from
    E clica "Criar"
    Então POST /admin/control-rules é chamado
    E abre automaticamente painel "Alçadas"

  Cenário: Criar regra por valor com threshold
    Dado que admin ativa toggle "Por valor"
    Então campos value_field e threshold aparecem

  Cenário: Cadeia de alçada em dois níveis com escalada
    Quando admin adiciona Nível 1 e Nível 2 com timeouts
    Então preview visual exibe: [Nível 1 (24h)] → [Nível 2 (48h)] → EXECUTAR

  Cenário: Preview visual da cadeia de alçada
    Dado que cadeia tem 3 níveis
    Então cards horizontais conectados por setas

  Cenário: Simulação dry-run do motor
    Quando admin clica "Simular motor"
    Então resultado inline: "CONTROLADO" ou "LIVRE"
    E aviso: "Simulação sem efeito."

  Cenário: Vigência expirada destacada visualmente
    Dado que regra tem valid_until = ontem
    Então badge âmbar "Vigência expirada"

  Cenário: allow_self_approve exibido como toggle
    Dado que admin abre drawer de alçada
    Então toggle "Auto-aprovação por scope" visível (default off)
    E tooltip explica: "Quando ativo, solicitantes com scope suficiente são auto-aprovados (§3.1)"
```

---

## 4. Manifests Vinculados

| Manifest | Tela | Arquivo |
|---|---|---|
| UX-APROV-002 | Configurador de Regras de Controle e Alçada | [ux-aprov-002.config-regras.yaml](../../../05_manifests/screens/ux-aprov-002.config-regras.yaml) |

---

## 5. Regras Críticas

1. **allow_self_approve**: toggle na UI — default false, habilita auto-aprovação por suficiência de escopo (ver épico §3.1)
2. **Criação de regra**: abre cadeia de alçada automaticamente
3. **Preview visual**: cards horizontais com setas obrigatório
4. **Simulação**: dry-run sem criar movimentos
5. **Prioridade**: tooltip explicativo

---

## 6. Definition of Ready (DoR) ✅

- [x] Manifest UX-APROV-002 criado
- [x] F01 em READY
- [x] Gherkin com 7 cenários
- [x] Owner confirmar READY → APPROVED (cascata do épico 2026-03-19)

## 7. Definition of Done (DoD)

- [ ] Drawer de criação de regra
- [ ] Toggle de valor
- [ ] Cadeia visual de alçada
- [ ] Simulação dry-run
- [ ] Badges de vigência
- [ ] Testes E2E
- [ ] Evidências documentadas (PR/issue)

---

## 8. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Configurador visual + cadeia de alçadas + simulação, 7 cenários Gherkin, manifest UX-APROV-002. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
