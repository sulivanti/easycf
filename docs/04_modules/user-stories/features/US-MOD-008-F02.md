# US-MOD-008-F02 — API: Mapeamentos de Campos e Parâmetros

**Status Ágil:** `APPROVED`
**Versão:** 1.1.0
**Data:** 2026-03-19
**Módulo Destino:** **MOD-008** (Integração Dinâmica — Backend)
**Referências Normativas:** DOC-DEV-001, DOC-ARC-001

## Metadados de Governança

- **status_agil:** APPROVED
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-008, US-MOD-008-F01
- **nivel_arquitetura:** 2 (mapeamento dinâmico, transform_expr, condition_expr, mascaramento)
- **tipo:** Backend — cria novos endpoints
- **epico_pai:** US-MOD-008
- **manifests_vinculados:** N/A
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **arquiteto de integração**, quero definir como cada campo do Integrador se transforma no campo correspondente do Protheus, incluindo campos fixos, derivados do tenant e expressões de transformação, para que o payload seja montado corretamente em runtime sem código fixo.

---

## 2. Tipos de Mapeamento

| mapping_type | Origem | Exemplo |
|---|---|---|
| `FIELD` | Campo do caso/objeto | `case.numero_pedido` → `C5_NUM` |
| `PARAM` | Parâmetro de contexto | `tenant.codigo_empresa` → `C5_FILIAL` |
| `HEADER` | Header HTTP | `X-Correlation-ID` como header da chamada |
| `FIXED_VALUE` | Valor literal | `"PV"` → `C5_TIPO` |
| `DERIVED` | Expressão calculada | `UPPER(case.nome_cliente)` → `A1_NOME` |

---

## 3. Escopo

### Inclui
- CRUD de mapeamentos com 5 tipos (FIELD, PARAM, HEADER, FIXED_VALUE, DERIVED)
- CRUD de parâmetros técnicos com 4 tipos (FIXED, DERIVED_FROM_TENANT, DERIVED_FROM_CONTEXT, HEADER)
- Campos required: ausência aborta execução antes do HTTP
- transform_expr: expressões simples (v1: UPPER, LOWER, TRIM, CONCAT, DATE_FORMAT)
- condition_expr: inclusão condicional no payload
- is_sensitive: mascaramento em todos os logs
- Ordem do payload preservada conforme campo `ordem`

### Não inclui
- Catálogo de serviços e config HTTP — US-MOD-008-F01
- Motor de execução — US-MOD-008-F03
- Interface de editor — US-MOD-008-F04

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Mapeamentos de Campos e Parâmetros

  Cenário: Criar mapeamento FIELD obrigatório
    Quando POST /admin/routines/:id/field-mappings com {
      source_field: "case.object.numero_pedido",
      target_field: "C5_NUM",
      mapping_type: "FIELD",
      required: true, ordem: 1
    }
    Então mapeamento criado e disponível para o motor

  Cenário: Mapeamento FIXED_VALUE insere literal no payload
    Dado que mapeamento tem mapping_type=FIXED_VALUE e default_value="PV"
    Quando motor monta payload
    Então payload["C5_TIPO"] = "PV" independente do objeto

  Cenário: Mapeamento PARAM derivado do tenant
    Dado que param tem param_type=DERIVED_FROM_TENANT e derivation_expr="tenant.codigo"
    Quando motor avalia para case no tenant "SP01"
    Então payload inclui o codigo do tenant resolvido

  Cenário: transform_expr aplicada ao valor do campo
    Dado que mapeamento tem source_field="case.nome" e transform_expr="UPPER(value)"
    Quando motor resolve o mapeamento com case.nome="João Silva"
    Então payload inclui "JOÃO SILVA" (maiúsculas)

  Cenário: Campo obrigatório ausente bloqueia execução
    Dado que mapeamento required=true e source_field="case.numero_nf"
    E caso não tem numero_nf preenchido
    Quando motor tenta montar o payload
    Então execução abortada: status=FAILED, error_message="Campo obrigatório ausente: case.numero_nf"
    E integration_call_logs criado com status=FAILED (sem chamada HTTP)

  Cenário: condition_expr determina inclusão condicional
    Dado que mapeamento tem condition_expr="case.tipo == 'SERVICO'"
    E caso tem tipo="PRODUTO"
    Quando motor avalia
    Então campo NOT incluído no payload (condição falsa)

  Cenário: Parâmetro is_sensitive mascarado no log
    Dado que param tem is_sensitive=true e param_key="api_key"
    Quando chamada é executada e logada
    Então integration_call_logs.request_headers["api_key"] = "***"

  Cenário: Reordenação de mapeamentos afeta ordem no payload JSON
    Dado que mapeamentos têm ordem: C5_NUM(1), C5_FILIAL(2), C5_TIPO(3)
    Quando payload é montado
    Então JSON preserva a ordem declarada dos campos
```

---

## 5. Regras Críticas

1. **Campos required=true**: ausência aborta execução antes do HTTP — status=FAILED sem chamar Protheus
2. **is_sensitive=true**: valor mascarado em TODOS os logs — sem exceção
3. **transform_expr**: expressão simples (v1: UPPER, LOWER, TRIM, CONCAT, DATE_FORMAT)
4. **condition_expr**: expressão booleana simples (v1: ==, !=, IN, NOT NULL)
5. **Ordem do payload**: preservada conforme campo `ordem` dos mapeamentos

---

## 6. Definition of Ready (DoR) ✅

- [x] F01 em READY (depende de rotinas e serviços)
- [x] Lista de campos alvo do Protheus disponível como seed
- [x] 5 tipos de mapeamento documentados
- [x] Gherkin com 8 cenários
- [x] Owner confirmar READY → APPROVED (2026-03-19)

## 7. Definition of Done (DoD)

- [ ] Todos os 5 tipos de mapeamento testados
- [ ] is_sensitive mascarado em todos os logs
- [ ] required abort testado (sem chamada HTTP)
- [ ] condition_expr testada
- [ ] Evidências documentadas (PR/issue)

---

## 8. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Mapeamentos + Parâmetros, 8 cenários Gherkin. |
| 1.1.0 | 2026-03-19 | arquitetura | Promoção READY → APPROVED (cascata do épico US-MOD-008 v1.2.0). |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
