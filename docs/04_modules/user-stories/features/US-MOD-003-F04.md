# US-MOD-003-F04 — Restore de Unidade Organizacional

**Status Ágil:** `READY`
**Versão:** 1.0.0 | **Data:** 2026-03-17 | **Módulo:** MOD-003
**operationIds consumidos:** `org_units_restore`

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-17
- **rastreia_para:** US-MOD-003, US-MOD-003-F01, US-MOD-003-F02, FR-004, BR-009, DATA-003, SEC-001, SEC-002
- **nivel_arquitetura:** 1 (Clean Leve — reusa padrão CRUD do MOD-003)
- **tipo:** Backend + UX — novo endpoint + ação na árvore

---

## 1. A Solução

Como **administrador organizacional**, quero restaurar unidades organizacionais previamente desativadas (soft-deleted), para corrigir desativações acidentais ou reativar partes da hierarquia sem precisar recriá-las do zero.

---

## 2. Contexto e Motivação

O MOD-003 já implementa soft delete (US-MOD-003-F01), mas não oferece caminho de volta. Sem restore, o administrador precisaria recriar manualmente o nó e reconfigurar vínculos de tenant. Esta feature fecha o ciclo de vida ACTIVE → INACTIVE → ACTIVE.

### Dependências

- **FR-004** — Requisito funcional já documentado durante enriquecimento
- **BR-009** — Regra de negócio: restore condicional (pai deve estar ativo)
- **DATA-003** — Domain event `org.unit_restored` já catalogado
- **SEC-002** — Autorização do evento já mapeada (`org:unit:write`)

---

## 3. Endpoint

### `PATCH /api/v1/org-units/:id/restore`

| Aspecto | Detalhe |
|---|---|
| **Método** | PATCH |
| **Path** | `/api/v1/org-units/:id/restore` |
| **operationId** | `org_units_restore` |
| **Scope requerido** | `org:unit:write` |
| **Idempotência** | Sim — restore de nó já ativo retorna 200 sem efeito |
| **Request body** | Nenhum (a ação é determinística) |
| **Content-Type** | `application/json` |

### Respostas

| Status | Cenário | Body |
|---|---|---|
| 200 | Nó restaurado com sucesso | `{ id, codigo, nome, nivel, status: "ACTIVE", deleted_at: null, ... }` |
| 200 | Nó já está ativo (idempotente) | Mesmo body, sem efeito colateral |
| 403 | Sem scope `org:unit:write` | RFC 9457 `type="/problems/forbidden"` |
| 404 | Nó não encontrado | RFC 9457 `type="/problems/not-found"` |
| 422 | Nó não está soft-deleted | RFC 9457 `detail="Este nó já está ativo."` |
| 422 | Pai está inativo | RFC 9457 `detail="Não é possível restaurar: o nó pai está inativo."` |

### Efeitos colaterais

1. `deleted_at` → `NULL`
2. `status` → `ACTIVE`
3. `updated_at` → `now()`
4. Domain event `org.unit_restored` emitido na mesma transação DB
5. Sem cache — próxima chamada a `GET /org-units/tree` reflete o restore automaticamente

---

## 4. Regras de Negócio (BR-009)

1. **Pai deve estar ativo:** Se `parent_id` referencia um nó com `deleted_at IS NOT NULL` ou `status = INACTIVE`, retornar 422. Isso previne "nós órfãos ativos" na hierarquia.
2. **Exceção para N1 (raiz):** Nós com `parent_id = NULL` (N1) podem ser restaurados sem restrição de pai.
3. **Idempotência natural:** Se o nó já está ativo (`deleted_at IS NULL` e `status = ACTIVE`), retornar 200 sem modificação.
4. **Filhos NÃO são restaurados em cascata:** Apenas o nó solicitado é restaurado. Filhos soft-deleted permanecem inativos — o administrador deve restaurá-los individualmente (bottom-up se necessário, ou top-down).

---

## 5. Domain Event

| Campo | Valor |
|---|---|
| `event_type` | `org.unit_restored` |
| `entity_type` | `org_unit` |
| `entity_id` | `org_units.id` |
| `emit_permission` | `org:unit:write` |
| `view_rule` | RBAC `org:unit:read` (cross-tenant — ADR-003) |
| `notify` | admin |
| `sensitivity_level` | 0 |
| `maskable_fields` | nenhum |
| `payload_policy` | `{ id, codigo, nome, nivel, restored_by, restored_at }` |

---

## 6. UX — Integração nas Telas Existentes

### UX-ORG-001 (Árvore — US-MOD-003-F02)

1. **Filtro "Mostrar inativos":** Toggle no toolbar da árvore. Quando ativo, nós soft-deleted aparecem com opacidade reduzida + badge "Inativo".
2. **Menu contextual:** Em nós inativos, exibir ação "Restaurar" (ícone: `undo` ou `refresh`). Ação só aparece se o usuário tem scope `org:unit:write`.
3. **Modal de confirmação:** "Restaurar unidade '[codigo] — [nome]'?" com botão "Restaurar" (primary) e "Cancelar".
4. **Feedback:**
   - 200 → Toast "Unidade '[codigo] — [nome]' restaurada com sucesso." + nó volta a exibição normal
   - 422 (pai inativo) → Inline no modal: "Não é possível restaurar: o nó pai '[pai.codigo] — [pai.nome]' está inativo. Restaure-o primeiro."

### UX-ORG-002 (Formulário — US-MOD-003-F03)

- **Não é necessário alterar o formulário.** O restore é uma ação direta (sem campos editáveis), melhor servida pelo menu contextual na árvore.

---

## 7. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Restore de Unidade Organizacional — US-MOD-003-F04

  # ── Happy Path ──────────────────────────────────────────────
  Cenário: Restaurar nó soft-deleted com pai ativo
    Dado que existe um nó N3 com deleted_at preenchido e status=INACTIVE
    E o pai N2 tem deleted_at=NULL e status=ACTIVE
    Quando PATCH /api/v1/org-units/:id/restore é chamado
    Então deve retornar 200
    E deleted_at deve ser NULL
    E status deve ser "ACTIVE"
    E updated_at deve ser renovado
    E o evento org.unit_restored deve ser emitido

  Cenário: Restaurar nó raiz (N1) sem restrição de pai
    Dado que existe um nó N1 soft-deleted (parent_id=NULL)
    Quando PATCH /api/v1/org-units/:id/restore é chamado
    Então deve retornar 200 e o nó deve voltar a ACTIVE

  # ── Idempotência ────────────────────────────────────────────
  Cenário: Restore de nó já ativo retorna 200 sem efeito
    Dado que existe um nó N3 com status=ACTIVE e deleted_at=NULL
    Quando PATCH /api/v1/org-units/:id/restore é chamado
    Então deve retornar 200 com o nó inalterado
    E nenhum domain event deve ser emitido

  # ── Validações ──────────────────────────────────────────────
  Cenário: Restore bloqueado quando pai está inativo
    Dado que existe um nó N3 soft-deleted
    E o pai N2 tem deleted_at preenchido (também inativo)
    Quando PATCH /api/v1/org-units/:id/restore é chamado
    Então deve retornar 422: "Não é possível restaurar: o nó pai está inativo."

  Cenário: Restore de nó inexistente retorna 404
    Dado que o id informado não existe na tabela org_units
    Quando PATCH /api/v1/org-units/:id/restore é chamado
    Então deve retornar 404 RFC 9457

  Cenário: Restore sem scope retorna 403
    Dado que o usuário não tem scope "org:unit:write"
    Quando PATCH /api/v1/org-units/:id/restore é chamado
    Então deve retornar 403 RFC 9457

  # ── Não-cascata ─────────────────────────────────────────────
  Cenário: Filhos soft-deleted NÃO são restaurados em cascata
    Dado que um nó N2 foi soft-deleted junto com seus filhos N3
    Quando PATCH /api/v1/org-units/:id/restore é chamado para o N2
    Então apenas o N2 deve ser restaurado
    E os filhos N3 devem permanecer com deleted_at preenchido

  # ── UX ──────────────────────────────────────────────────────
  Cenário: Toggle "Mostrar inativos" exibe nós soft-deleted
    Dado que o admin está na tela /organizacao (UX-ORG-001)
    Quando ativa o toggle "Mostrar inativos"
    Então nós soft-deleted devem aparecer com opacidade reduzida e badge "Inativo"

  Cenário: Ação "Restaurar" no menu contextual de nó inativo
    Dado que o admin tem scope org:unit:write
    E o toggle "Mostrar inativos" está ativo
    Quando clica no menu contextual de um nó inativo
    Então a opção "Restaurar" deve estar disponível

  Cenário: Feedback de sucesso ao restaurar via UX
    Dado que o admin clica "Restaurar" no modal de confirmação
    Quando PATCH /api/v1/org-units/:id/restore retorna 200
    Então deve exibir Toast "Unidade '[codigo] — [nome]' restaurada com sucesso."
    E o nó deve voltar à exibição normal na árvore

  Cenário: Feedback de erro ao restaurar nó com pai inativo
    Dado que o admin clica "Restaurar" em nó cujo pai está inativo
    Quando PATCH /api/v1/org-units/:id/restore retorna 422
    Então deve exibir inline no modal: "Não é possível restaurar: o nó pai está inativo. Restaure-o primeiro."
```

---

## 8. Observabilidade

- `X-Correlation-ID` propagado na resposta e no domain event
- Log estruturado: `{ action: "restore", entity_type: "org_unit", entity_id, tenant_id, actor_id, correlation_id }`
- Sem PII nos logs

---

## 9. Definition of Ready (DoR)

- [x] Endpoint documentado com request/response/erros
- [x] Regra BR-009 (pai ativo) documentada com exceção para N1
- [x] Domain event `org.unit_restored` catalogado em DATA-003 e SEC-002
- [x] Scope `org:unit:write` já cobre restore (SEC-001)
- [x] UX definida: toggle inativos + menu contextual + modal
- [x] Gherkin cobrindo happy path, validações, idempotência, cascata e UX

## 10. Definition of Done (DoD)

- [ ] Endpoint implementado e documentado no OpenAPI (Spectral lint passando)
- [ ] Testes unitários: restore com pai ativo, pai inativo, N1 sem pai, nó já ativo
- [ ] Testes de integração: restore + domain event emitido + tree query reflete estado atualizado
- [ ] Domain event `org.unit_restored` emitido e verificado
- [ ] RBAC: retorna 403 sem scope `org:unit:write`
- [ ] UX: toggle "Mostrar inativos" funcional na árvore
- [ ] UX: ação "Restaurar" no menu contextual com modal de confirmação

---

## 11. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-17 | arquitetura | Criação. Endpoint restore, BR-009, domain event, UX na árvore. Resolve PENDENTE-001. |
