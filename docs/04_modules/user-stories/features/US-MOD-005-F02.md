# US-MOD-005-F02 — API: Gates, Papéis e Transições

**Status Ágil:** `READY`
**Versão:** 1.0.0
**Data:** 2026-03-15
**Módulo Destino:** **MOD-005** (Modelagem de Processos — Backend)
**Referências Normativas:** DOC-DEV-001, DOC-ARC-001

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-005, US-MOD-005-F01, DOC-ARC-001
- **nivel_arquitetura:** 2 (grafo de transições, validação de gates, integridade referencial)
- **tipo:** Backend — cria novos endpoints
- **epico_pai:** US-MOD-005
- **manifests_vinculados:** N/A
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **analista de processos**, quero configurar os pontos de controle (gates), as participações esperadas (papéis) e as rotas de navegação (transições) entre estágios, para que o MOD-006 saiba exatamente quais condições são necessárias antes de mover um caso de estágio.

---

## 2. Tipos de Gate

| gate_type | Comportamento | required=true | required=false |
|---|---|---|---|
| `APPROVAL` | Requer decisão formal (Aprovar/Reprovar) | Bloqueia avanço | Registra sem bloquear |
| `DOCUMENT` | Requer anexo de evidência | Bloqueia avanço | Alerta sem bloquear |
| `CHECKLIST` | Lista de verificação com itens | Bloqueia se itens pendentes | Registra estado dos itens |
| `INFORMATIVE` | Registro de informação | Nunca bloqueia | Nunca bloqueia |

---

## 3. Escopo

### Inclui
- CRUD de Gates vinculados a estágios com 4 tipos (APPROVAL, DOCUMENT, CHECKLIST, INFORMATIVE)
- Ordenação de gates com avaliação sequencial
- Catálogo global de Papéis de processo com flag `can_approve`
- Vínculo Estágio × Papel (N:N) com flag `required`
- CRUD de Transições entre estágios do mesmo ciclo
- Validações: cross-ciclo rejeitado, auto-transição rejeitada, `gate_required`, `evidence_required`, `allowed_roles`

### Não inclui
- CRUD de Ciclos, Macroetapas e Estágios — US-MOD-005-F01
- Avaliação de gates em runtime (resolução) — MOD-006
- Atribuição de responsáveis reais a papéis — MOD-006
- Editor visual — US-MOD-005-F03

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: API Gates, Papéis e Transições

  # ── Gates ────────────────────────────────────────────────────
  Cenário: Criar gate APPROVAL obrigatório em estágio
    Dado que estágio existe em ciclo DRAFT
    Quando POST /admin/stages/:sid/gates com { nome, gate_type: "APPROVAL", required: true, ordem: 1 }
    Então 201 com gate criado
    E evento process.gate_created emitido

  Cenário: Gates avaliados em ordem crescente
    Dado que estágio tem gates com ordem 1 (DOCUMENT) e ordem 2 (APPROVAL)
    Quando MOD-006 avalia gates antes de transição
    Então gate de ordem 1 é avaliado primeiro
    E gate de ordem 2 só é avaliado se ordem 1 estiver resolvido ou for required=false

  Cenário: Gate INFORMATIVE nunca bloqueia transição
    Dado que estágio tem apenas gate_type=INFORMATIVE com required=true
    Quando MOD-006 tenta transitar o caso
    Então a transição não é bloqueada pelo gate
    E o gate é registrado como "informativo" no histórico

  Cenário: Reordenar gates via campo ordem
    Dado que existem 3 gates com ordem 1, 2, 3
    Quando PATCH /admin/gates/:id com { ordem: 1 } no que era ordem 3
    Então sistema reordena automaticamente sem duplicar ordens

  Cenário: Gate não pode ser criado em ciclo PUBLISHED
    Dado que ciclo está em status=PUBLISHED
    Quando POST /admin/stages/:sid/gates
    Então 422: "Ciclo publicado é imutável."

  # ── Papéis ───────────────────────────────────────────────────
  Cenário: Criar papel no catálogo global
    Dado que POST /admin/process-roles com { codigo: "APROVADOR", nome: "Aprovador", can_approve: true }
    Então 201 com papel criado

  Cenário: Papel com can_approve=true fica disponível para gates APPROVAL
    Dado que papel APROVADOR tem can_approve=true
    Quando MOD-006 avalia gate APPROVAL em um estágio
    Então apenas usuários com papel que tem can_approve=true podem registrar decisão formal

  Cenário: Vincular papel a estágio
    Dado que estágio existe em ciclo DRAFT
    Quando POST /admin/stages/:sid/roles com { role_id: "uuid-aprovador", required: true }
    Então 201 com vínculo criado
    E extensions: { stage_id, role: { codigo, nome, can_approve }, required }

  Cenário: Rejeitar vínculo duplicado papel-estágio
    Dado que APROVADOR já está vinculado ao estágio
    Quando POST /admin/stages/:sid/roles com mesmo role_id
    Então 409: "Este papel já está vinculado a este estágio."

  # ── Transições ────────────────────────────────────────────────
  Cenário: Criar transição entre estágios do mesmo ciclo
    Dado que from_stage e to_stage pertencem ao mesmo ciclo
    Quando POST /admin/stage-transitions com { from_stage_id, to_stage_id, nome: "Aprovar" }
    Então 201 com transição criada
    E evento process.transition_created emitido

  Cenário: Rejeitar transição cross-ciclo
    Dado que from_stage pertence ao Ciclo A e to_stage ao Ciclo B
    Quando POST /admin/stage-transitions
    Então 422: "Os estágios de origem e destino devem pertencer ao mesmo ciclo."

  Cenário: Rejeitar auto-transição (from = to)
    Dado que from_stage_id = to_stage_id
    Então 422: "Um estágio não pode transitar para si mesmo."

  Cenário: Transição com gate_required=true só disponível se gate resolvido
    Dado que transição tem gate_required=true
    Quando MOD-006 avalia se a transição está disponível para o caso
    Então transição só aparece como disponível se todos os gates required=true do from_stage estão resolvidos

  Cenário: Allowed_roles restringe quem pode iniciar a transição
    Dado que transição tem allowed_roles=["uuid-aprovador"]
    Quando MOD-006 verifica quem pode executar essa transição
    Então apenas usuários atribuídos ao papel APROVADOR nesse estágio podem acionar

  Cenário: Transição com evidence_required=true exige nota ou arquivo
    Dado que transição tem evidence_required=true
    Quando MOD-006 tenta executar a transição sem evidência
    Então 422: "Esta transição requer evidência (nota ou arquivo)."
```

---

## 5. Domain Events

| event_type | sensitivity_level |
|---|---|
| `process.gate_created` | 0 |
| `process.stage_role_linked` | 0 |
| `process.transition_created` | 0 |

---

## 6. Regras Críticas

1. **Gate INFORMATIVE**: nunca bloqueia — apenas registra (mesmo com required=true)
2. **can_approve**: campo do `process_role` que habilita decisão formal em gates APPROVAL
3. **Transição cross-ciclo**: CHECK na DB via FK de ciclo derivado do stage; validação no service
4. **gate_required na transição**: consulta ao MOD-006 (instâncias de gate) — dependência de runtime
5. **allowed_roles**: subconjunto de papéis vinculados ao estágio (validado no service)
6. **Todos os elementos sob ciclo PUBLISHED**: imutáveis (gates, papéis, transições)

---

## 7. Definition of Ready (DoR) ✅

- [x] F01 em READY (depende de cycles/stages)
- [x] Catálogo de process_roles seed definido
- [x] 4 tipos de gate documentados com matriz de comportamento
- [x] Gherkin com 15 cenários cobrindo gates, papéis e transições
- [ ] Owner confirmar READY → APPROVED

## 8. Definition of Done (DoD)

- [ ] Testes de gate_type (APPROVAL, DOCUMENT, CHECKLIST, INFORMATIVE)
- [ ] Transição cross-ciclo rejeitada
- [ ] Auto-transição rejeitada
- [ ] allowed_roles validado
- [ ] PUBLISHED imutável para todos os sub-elementos (gates, papéis, transições)
- [ ] Evidências documentadas (PR/issue)

---

## 9. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. CRUD Gates + Papéis + Transições, 15 cenários Gherkin, domain events. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
