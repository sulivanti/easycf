# US-MOD-005-F01 — API: Ciclos, Macroetapas e Estágios

**Status Ágil:** `READY`
**Versão:** 1.1.0
**Data:** 2026-03-16
**Módulo Destino:** **MOD-005** (Modelagem de Processos — Backend)
**Referências Normativas:** DOC-DEV-001, DOC-ARC-001, DOC-ARC-002

## Metadados de Governança

- **status_agil:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-16
- **rastreia_para:** US-MOD-005, DOC-DEV-001, DOC-ARC-001, DOC-ARC-002
- **nivel_arquitetura:** 2 (versionamento de blueprints, grafo de transições, integridade referencial com instâncias)
- **tipo:** Backend — cria novos endpoints
- **epico_pai:** US-MOD-005
- **manifests_vinculados:** N/A
- **pendencias:** N/A
- **evidencias:** N/A

---

## 1. A Solução

Como **analista de processos**, quero criar e manter ciclos de processo com suas macroetapas e estágios, versionando mudanças sem impactar instâncias ativas, para que processos em andamento no MOD-006 continuem estáveis enquanto versões futuras são preparadas.

---

## 2. Estados do Ciclo e Transições Válidas

```
DRAFT ──► PUBLISHED ──► DEPRECATED
  ▲           │
  └───── fork (cria novo DRAFT baseado no PUBLISHED)
```

- **DRAFT**: editável. Pode ser deletado (soft).
- **PUBLISHED**: imutável. Aceita instâncias no MOD-006. Só pode ser DEPRECATED (não revertido a DRAFT).
- **DEPRECATED**: não aceita novas instâncias. Instâncias ativas continuam até concluir.
- **Fork**: cria novo ciclo DRAFT com `parent_cycle_id` apontando para o publicado.

---

## 3. Escopo

### Inclui

- CRUD completo de Ciclos com máquina de estados (DRAFT → PUBLISHED → DEPRECATED)
- Fork de ciclo publicado criando nova versão DRAFT
- CRUD de Macroetapas vinculadas a ciclos com ordenação relativa
- CRUD de Estágios vinculados a macroetapas com flags `is_initial` / `is_terminal`
- Endpoint `/flow` para retorno do grafo completo do ciclo (SLA < 200ms)
- Validações de integridade: estágio inicial único, publicação exige initial, deleção protegida

### Não inclui

- Gates, papéis e transições — US-MOD-005-F02
- Editor visual — US-MOD-005-F03
- Configurador de estágio — US-MOD-005-F04
- Instâncias concretas de ciclo — MOD-006

---

## 4. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: API Ciclos, Macroetapas e Estágios

  # ── Ciclos ───────────────────────────────────────────────────
  Cenário: Criar ciclo em DRAFT
    Quando POST /api/v1/admin/cycles com { codigo, nome }
    Então status 201, cycle.status=DRAFT, version=1
    E evento process.cycle_created emitido

  Cenário: Publicar ciclo DRAFT que tem ao menos 1 estágio inicial
    Dado que o ciclo tem ao menos 1 macroetapa, 1 estágio com is_initial=true
    Quando POST /admin/cycles/:id/publish
    Então status=PUBLISHED, published_at=now()
    E evento process.cycle_published emitido

  Cenário: Rejeitar publicação de ciclo sem estágio inicial
    Dado que nenhum estágio tem is_initial=true
    Quando POST /admin/cycles/:id/publish
    Então 422: "O ciclo precisa de ao menos um estágio inicial (is_initial=true) para ser publicado."

  Cenário: Ciclo PUBLISHED rejeita edição direta
    Dado que o ciclo tem status=PUBLISHED
    Quando PATCH /admin/cycles/:id com qualquer campo
    Então 422: "Ciclos publicados são imutáveis. Use o fork para criar uma nova versão."

  Cenário: Fork de ciclo PUBLISHED cria nova versão DRAFT
    Dado que existe ciclo v1 PUBLISHED com id="cycle-v1"
    Quando POST /admin/cycles/cycle-v1/fork
    Então novo ciclo criado com status=DRAFT, version=2, parent_cycle_id="cycle-v1"
    E todas as macroetapas, estágios, gates, transições são copiados para o novo ciclo
    E retorna 201 com novo ciclo

  Cenário: Soft delete só permitido em DRAFT
    Dado que ciclo tem status=PUBLISHED
    Quando DELETE /admin/cycles/:id
    Então 422: "Somente ciclos em DRAFT podem ser excluídos. Para descontinuar, use DEPRECATED."

  Cenário: Deprecar ciclo PUBLISHED
    Dado que ciclo tem status=PUBLISHED
    Quando PATCH /admin/cycles/:id com { status: "DEPRECATED" }
    Então status=DEPRECATED
    E novas instâncias no MOD-006 são bloqueadas para este ciclo
    E instâncias ativas existentes continuam até conclusão
    E evento process.cycle_deprecated emitido

  Cenário: Rejeitar depreciação de ciclo em DRAFT
    Dado que ciclo tem status=DRAFT
    Quando PATCH /admin/cycles/:id com { status: "DEPRECATED" }
    Então 422: "Somente ciclos publicados podem ser depreciados."

  Cenário: GET /admin/cycles/:id/flow retorna grafo completo
    Dado que o ciclo tem 3 macroetapas, 8 estágios e 10 transições
    Quando GET /admin/cycles/:id/flow
    Então retorna { cycle, macro_stages: [ { ...macro, stages: [ { ...stage, gates[], roles[], transitions_out[] } ] } ] }
    E latência < 200ms

  # ── Macroetapas ──────────────────────────────────────────────
  Cenário: Criar macroetapa em ciclo DRAFT
    Dado que o ciclo está em DRAFT
    Quando POST /admin/cycles/:cid/macro-stages com { codigo, nome, ordem }
    Então 201 com macroetapa criada
    E evento process.macro_stage_created emitido

  Cenário: Rejeitar macroetapa em ciclo PUBLISHED
    Dado que o ciclo está em PUBLISHED
    Quando POST /admin/cycles/:cid/macro-stages
    Então 422: "Ciclo publicado é imutável."

  Cenário: Reordenar macroetapas via campo ordem
    Dado que existem 3 macroetapas com ordem 1, 2, 3
    Quando PATCH /admin/macro-stages/:id com { ordem: 1 } na que tinha ordem 3
    Então as demais são reordenadas automaticamente (ordem é relativa, não há duplicatas)

  Cenário: Soft delete de macroetapa com estágios ativos bloqueado
    Dado que a macroetapa tem 2 estágios com deleted_at=null
    Quando DELETE /admin/macro-stages/:id
    Então 422: "Desative os estágios antes de remover a macroetapa."

  # ── Estágios ─────────────────────────────────────────────────
  Cenário: Criar estágio com is_initial=true (único por ciclo)
    Dado que o ciclo não tem estágio inicial
    Quando POST /admin/macro-stages/:mid/stages com { codigo, nome, is_initial: true }
    Então 201 com estágio criado como inicial

  Cenário: Rejeitar segundo estágio inicial no mesmo ciclo
    Dado que o ciclo já tem 1 estágio com is_initial=true
    Quando POST /admin/macro-stages/:mid/stages com is_initial=true
    Então 409: "Este ciclo já possui um estágio inicial. Desmarque o atual antes de definir outro."

  Cenário: Soft delete de estágio com instâncias MOD-006 ativas bloqueado
    Dado que o estágio tem 5 instâncias ativas no MOD-006
    Quando DELETE /admin/stages/:id
    Então 422: "Este estágio possui 5 instância(s) ativa(s) em andamento."
    E extensions.active_instances = 5

  Cenário: Estágio terminal aceita ausência de transições de saída
    Dado que estágio tem is_terminal=true
    Quando GET /admin/stages/:id
    Então transitions_out pode ser array vazio sem erro de validação
```

---

## 5. Domain Events

| event_type | Trigger | sensitivity_level |
|---|---|---|
| `process.cycle_created` | POST /cycles | 0 |
| `process.cycle_published` | POST /cycles/:id/publish | 0 |
| `process.cycle_forked` | POST /cycles/:id/fork | 0 |
| `process.cycle_deprecated` | PATCH status→DEPRECATED | 0 |
| `process.macro_stage_created` | POST macro-stages | 0 |
| `process.stage_created` | POST stages | 0 |

---

## 6. Regras Críticas

1. **Imutabilidade de PUBLISHED**: nenhum campo aceitável via PATCH; fork é o único caminho para mudança
2. **Estágio inicial único por ciclo**: `UNIQUE(cycle_id) WHERE is_initial=true AND deleted_at IS NULL`
3. **Publicação exige estágio inicial**: gate de negócio no service de publicação
4. **Fork copia toda a estrutura**: macroetapas, estágios, gates, role_links e transições clonados com novos IDs
5. **Deleção protegida**: macroetapa com estágios não-deletados → 422; estágio com instâncias ativas → 422
6. **codigo imutável** após criação (identificador estável para integrações)

---

## 7. Definition of Ready (DoR) ✅

- [x] Modelo de dados definido (tabelas cycles, macro_stages, stages)
- [x] Máquina de estados DRAFT → PUBLISHED → DEPRECATED documentada
- [x] Dependência de MOD-006 (instâncias) documentada para validação de deleção
- [x] Gherkin com 17 cenários cobrindo happy path e edge cases
- [ ] Owner confirmar READY → APPROVED

## 8. Definition of Done (DoD)

- [ ] Testes de PUBLISHED imutável passando
- [ ] Fork clona estrutura completa (macroetapas, estágios, gates, transições)
- [ ] Estágio inicial único por ciclo validado
- [ ] Publicação sem estágio inicial bloqueada
- [ ] Deleção de estágio com instâncias ativas bloqueada
- [ ] Endpoint `/flow` retorna grafo completo com latência < 200ms
- [ ] Evidências documentadas (PR/issue)

---

## 9. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação. CRUD Ciclos + Macroetapas + Estágios, versionamento, domain events. |
| 1.0.1 | 2026-03-16 | Marcos Sulivan | Revisão: corrige contagem de cenários (16→15), alinha owner com épico. |
| 1.1.0 | 2026-03-16 | Marcos Sulivan | Revisão final: adiciona 2 cenários DEPRECATED (happy + edge), corrige Gherkin "Criar ciclo" (Dado→Quando). Total: 17 cenários. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
