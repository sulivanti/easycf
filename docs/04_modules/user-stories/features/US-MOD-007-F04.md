# US-MOD-007-F04 — UX: Configurador de Enquadradores (UX-PARAM-001)

**Status Ágil:** `READY`
**Versão:** 1.3.0
**Data:** 2026-03-23
**Módulo Destino:** **MOD-007** (Parametrização Contextual — UX)
**Referências Normativas:** DOC-DEV-001, DOC-UX-010, DOC-ARC-003
**operationIds consumidos:** `admin_framers_list/create/update/delete`, `admin_target_objects_list`, `admin_target_fields_create`, `admin_incidence_rules_list/create/update`, `routine_engine_evaluate`

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-23
- **rastreia_para:** US-MOD-007, US-MOD-007-F01, US-MOD-007-F03, DOC-UX-010
- **nivel_arquitetura:** 2
- **tipo:** UX — configurador de enquadradores e matriz de incidência
- **epico_pai:** US-MOD-007
- **manifests_vinculados:** UX-PARAM-001
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **analista funcional**, quero gerenciar enquadradores de contexto, visualizar a matriz de incidência entre enquadradores e objetos-alvo, e simular o resultado do motor antes de publicar rotinas.

---

## 2. Escopo

### Inclui

- Tabela de enquadradores com filtro por tipo, CRUD via drawer, inativação com modal de impacto
- Painel de Objetos-Alvo com campos expandíveis e adição de campos
- Matriz visual de incidência (enquadradores × objetos) com badges de status (ACTIVE/INACTIVE)
- Detecção de conflitos: UNIQUE constraint impede duplicatas; célula ocupada não é clicável para criar nova regra
- Criação de regra de incidência via clique em célula vazia
- Simulação dry-run do motor no drawer de regra
- codigo uppercase automático e imutável

### Não inclui

- CRUD de rotinas e editor de itens — US-MOD-007-F05
- Motor de avaliação — US-MOD-007-F03
- APIs de backend — US-MOD-007-F01

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Configurador de Enquadradores — UX-PARAM-001

  Cenário: Criar enquadrador com vigência
    Dado que admin está no painel "Enquadradores" com scope param:framer:write
    Quando abre drawer "Novo enquadrador" e preenche:
      codigo="SERV-ENG", nome="Serviço de Engenharia", tipo=OPERACAO, valid_from=hoje
    E clica "Criar"
    Então POST /admin/framers é chamado
    E item aparece na tabela com status ACTIVE e badge de tipo

  Cenário: codigo uppercase automático no campo
    Dado que admin digita "serv-eng" no campo código
    Então campo exibe "SERV-ENG" automaticamente
    E tooltip: "O código não pode ser alterado após a criação."

  Cenário: Enquadrador com valid_until passado exibe badge âmbar
    Dado que enquadrador tem valid_until = ontem e ainda status=ACTIVE
    Então a linha exibe badge âmbar "Expirando"
    E tooltip: "Este enquadrador expirará em breve e será inativado automaticamente."

  Cenário: Inativar enquadrador exibe aviso de impacto
    Quando admin clica "Inativar" num enquadrador ACTIVE
    Então modal: "Enquadradores inativos não disparam regras de incidência.
      Rotinas vinculadas a este enquadrador deixarão de ser aplicadas."
    Quando confirma
    Então DELETE /admin/framers/:id é chamado e status muda para INACTIVE

  Cenário: Painel Objetos-Alvo exibe campos expandíveis
    Dado que objeto "PEDIDO_VENDA" tem 5 campos
    Quando admin expande o objeto
    Então lista de campos aparece com field_key, label, tipo, badge is_system
    E campos is_system=true sem botões de editar/deletar

  Cenário: Adicionar campo ao objeto-alvo
    Dado que admin clica "Adicionar campo" em "PEDIDO_VENDA"
    Quando preenche field_key="ncm", label="NCM Fiscal", tipo=TEXT
    E clica "Adicionar"
    Então POST /admin/target-objects/:id/fields é chamado
    E novo campo aparece na lista

  Cenário: Matriz de incidência renderiza corretamente
    Dado que há 3 enquadradores e 4 objetos-alvo
    Então a matriz exibe 3 linhas × 4 colunas
    E células com regra mostram badge com status (ACTIVE verde, INACTIVE cinza)
    E células sem regra ficam vazias (clicáveis para criar)

  Cenário: Célula ocupada impede criação de duplicata
    Dado que já existe regra para framer=SERV-ENG + object=PEDIDO_VENDA
    Quando admin clica na célula ocupada
    Então drawer abre em modo edição/visualização da regra existente
    E botão "Criar" não é exibido (UNIQUE constraint protege)

  Cenário: Criar regra de incidência clicando em célula vazia
    Quando admin clica em célula vazia da matriz (framer=SERV-ENG, object=PEDIDO_VENDA)
    Então drawer abre pré-preenchido com framer e objeto
    E seção "Rotinas vinculadas" exibe lista de behavior_routines PUBLISHED disponíveis
    Quando admin vincula rotina e clica "Criar"
    Então POST /admin/incidence-rules é chamado
    E célula da matriz ganha badge com status ACTIVE

  Cenário: Simular motor no drawer de regra
    Dado que drawer de uma regra está aberto
    Quando admin clica "Simular motor"
    Então POST /routine-engine/evaluate é chamado (dry-run)
    E resultado aparece inline no drawer com seções: visíveis, obrigatórios, defaults, bloqueantes
    E aviso: "Simulação sem efeito — nenhum registro é criado."

  Cenário: Acesso sem scope redirecionado
    Dado que usuário não tem param:framer:read
    Quando acessa /parametrizacao/enquadradores
    Então redirect /dashboard com Toast "Sem permissão."
```

---

## 4. Manifests Vinculados

| Manifest | Tela | Arquivo |
|---|---|---|
| UX-PARAM-001 | Configurador de Enquadradores e Regras de Incidência | [ux-param-001.config-enquadradores.yaml](../../../05_manifests/screens/ux-param-001.config-enquadradores.yaml) |

---

## 5. Regras Críticas

1. **codigo uppercase automático** + imutável após criação (tooltip no campo)
2. **UNIQUE constraint**: célula ocupada abre regra existente em vez de criar duplicata
3. **Simular motor**: pré-visualiza resultado sem criar domain_events (dry-run)
4. **valid_until**: expiração automática pelo background job (mesmo job do MOD-004)
5. **is_system campos**: exibidos mas sem botões de edição/exclusão

---

## 6. Definition of Ready (DoR) ✅

- [x] Manifest UX-PARAM-001 criado
- [x] F01/F03 em READY (APIs e motor consumidos)
- [x] Seed de framer_types padrão existente
- [x] Gherkin com 11 cenários
- [x] Owner confirmar READY → APPROVED (2026-03-19)

## 7. Definition of Done (DoD)

- [ ] Matriz de incidência renderizada corretamente
- [ ] Célula ocupada abre regra existente (UNIQUE constraint)
- [ ] Simulação dry-run funcionando
- [ ] CRUD de enquadradores e campos via drawer
- [ ] Testes E2E dos fluxos críticos
- [ ] Evidências documentadas (PR/issue)

---

## 8. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. Configurador com 3 painéis, matriz de incidência, 11 cenários Gherkin, manifest UX-PARAM-001. |
| 1.1.0 | 2026-03-18 | Marcos Sulivan | Alinha com épico v1.1.0: remove badges de prioridade, substitui cenário de conflito de prioridade por UNIQUE constraint, célula ocupada abre regra existente, remove campo prioridade do drawer. |
| 1.2.0 | 2026-03-19 | Marcos Sulivan | Revisão final e promoção READY → APPROVED. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
