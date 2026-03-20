# US-MOD-003-F01 — API Core de Estrutura Organizacional

**Status Ágil:** `READY`
**Versão:** 1.0.0
**Data:** 2026-03-15
**Módulo Destino:** **MOD-003** (Estrutura Organizacional — Backend)
**Referências Normativas:** DOC-DEV-001 §5.1, §8.2 | DOC-ARC-001 | DOC-ARC-002 | DOC-ARC-003

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-003, US-MOD-000-F07, US-MOD-000-F12, DOC-DEV-001, DOC-ARC-001, LGPD-BASE-001
- **nivel_arquitetura:** 1 (CRUD + soft delete + CTE tree query)
- **tipo:** Backend — cria novos endpoints

---

## 1. A Solução

Como **administrador organizacional**, quero uma API para criar e manter a hierarquia corporativa em 4 níveis (N1–N4), vincular estabelecimentos legais (N5/tenants) a subunidades, e consultar a árvore completa, para que todos os outros módulos possam referenciar pertencimento organizacional.

---

## 2. Modelo de Dados

```sql
-- Tabela principal
CREATE TABLE org_units (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo      VARCHAR(50)  NOT NULL UNIQUE,
  nome        VARCHAR(200) NOT NULL,
  descricao   TEXT,
  nivel       INTEGER      NOT NULL CHECK (nivel BETWEEN 1 AND 4),
  parent_id   UUID         REFERENCES org_units(id),
  status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE'
                           CHECK (status IN ('ACTIVE','INACTIVE')),
  created_by  UUID         NOT NULL REFERENCES users(id),
  created_at  TIMESTAMP    NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP    NOT NULL DEFAULT now(),
  deleted_at  TIMESTAMP
);

-- Vinculação N4 → Tenant (N5)
CREATE TABLE org_unit_tenant_links (
  id           UUID      PRIMARY KEY DEFAULT gen_random_uuid(),
  org_unit_id  UUID      NOT NULL REFERENCES org_units(id),
  tenant_id    UUID      NOT NULL REFERENCES tenants(id),
  created_by   UUID      NOT NULL REFERENCES users(id),
  created_at   TIMESTAMP NOT NULL DEFAULT now(),
  deleted_at   TIMESTAMP,
  UNIQUE (org_unit_id, tenant_id)
);

-- Índices para performance
CREATE INDEX idx_org_units_parent   ON org_units(parent_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_org_units_nivel    ON org_units(nivel)     WHERE deleted_at IS NULL;
CREATE INDEX idx_org_units_status   ON org_units(status)    WHERE deleted_at IS NULL;
CREATE INDEX idx_outl_org_unit      ON org_unit_tenant_links(org_unit_id) WHERE deleted_at IS NULL;
```

---

## 3. Regras de Integridade da Árvore

1. **Nivel derivado do pai:** `nivel` DEVE ser exatamente `parent.nivel + 1`. O valor não deve ser enviado pelo cliente — é calculado no backend.
2. **N1 sem pai:** nós de nivel=1 têm `parent_id=null`.
3. **Prevenção de loop:** antes de criar/mover um nó, verificar via CTE que o `parent_id` não é descendente do nó atual.
4. **N4 exclusivo para vinculação:** `org_unit_tenant_links` só aceita `org_unit_id` com `nivel=4`.
5. **Soft delete com filhos:** só permitido se não houver filhos com `status=ACTIVE` e `deleted_at IS NULL`.
6. **`codigo` imutável:** após criação, o `codigo` não pode ser alterado (é identificador de negócio estável).

---

## 4. Tree Query — CTE Recursivo

```sql
-- GET /api/v1/org-units/tree
WITH RECURSIVE org_tree AS (
  -- Âncoras: N1 (raízes)
  SELECT
    ou.id, ou.codigo, ou.nome, ou.nivel, ou.parent_id, ou.status,
    ARRAY[ou.id] AS path,
    ou.nome::TEXT AS breadcrumb
  FROM org_units ou
  WHERE ou.parent_id IS NULL
    AND ou.deleted_at IS NULL

  UNION ALL

  -- Recursão: filhos
  SELECT
    ou.id, ou.codigo, ou.nome, ou.nivel, ou.parent_id, ou.status,
    ot.path || ou.id,
    ot.breadcrumb || ' > ' || ou.nome
  FROM org_units ou
  INNER JOIN org_tree ot ON ot.id = ou.parent_id
  WHERE ou.deleted_at IS NULL
)
SELECT
  ot.*,
  -- Tenants vinculados (N5) para nós N4
  COALESCE(
    json_agg(
      json_build_object('id', t.id, 'codigo', t.codigo, 'nome', t.nome, 'status', t.status)
    ) FILTER (WHERE t.id IS NOT NULL),
    '[]'
  ) AS tenants
FROM org_tree ot
LEFT JOIN org_unit_tenant_links outl ON outl.org_unit_id = ot.id AND outl.deleted_at IS NULL
LEFT JOIN tenants t ON t.id = outl.tenant_id
GROUP BY ot.id, ot.codigo, ot.nome, ot.nivel, ot.parent_id, ot.status, ot.path, ot.breadcrumb
ORDER BY ot.path;
```

---

## 5. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: API Core de Estrutura Organizacional

  # ── CRUD básico ──────────────────────────────────────────────
  Cenário: Criar nó raiz (N1) com dados válidos
    Dado que POST /api/v1/org-units é chamado com { nome: "Grupo Alpha", codigo: "GC-001" }
    E não há parent_id no body (N1 não tem pai)
    Então o status deve ser 201
    E nivel deve ser 1 (calculado pelo backend)
    E o evento org.unit_created deve ser emitido com entity_type=org_unit

  Cenário: Criar nó filho com nivel derivado automaticamente
    Dado que existe um nó N1 com id="uuid-n1"
    Quando POST /api/v1/org-units é chamado com { nome: "Unidade SP", codigo: "UN-SP", parent_id: "uuid-n1" }
    Então o nivel retornado deve ser 2 (parent.nivel + 1)
    E o parent_id deve ser "uuid-n1"

  Cenário: Rejeitar criação com codigo duplicado
    Dado que já existe um nó com codigo="GC-001"
    Quando POST /api/v1/org-units é chamado com codigo="GC-001"
    Então deve retornar 409 com type="/problems/conflict" e detail="Código já utilizado."

  Cenário: Rejeitar criação de filho de N4 (nivel máximo atingido)
    Dado que existe um nó com nivel=4
    Quando POST /api/v1/org-units é chamado com parent_id apontando para esse nó
    Então deve retornar 422 com detail="Nível máximo N4 atingido. Use vinculação de tenant para N5."

  Cenário: Atualizar nome e descrição de um nó
    Dado que PATCH /api/v1/org-units/:id é chamado com { nome: "Novo Nome" }
    Então o nome é atualizado e updated_at é renovado
    E o evento org.unit_updated é emitido

  Cenário: Rejeitar atualização do campo codigo
    Dado que PATCH /api/v1/org-units/:id inclui { codigo: "NOVO-001" }
    Então deve retornar 422: "O campo 'codigo' é imutável após criação."

  # ── Soft Delete ───────────────────────────────────────────────
  Cenário: Soft delete permitido quando nó não tem filhos ativos
    Dado que um nó N3 não tem filhos com status=ACTIVE
    Quando DELETE /api/v1/org-units/:id é chamado
    Então deleted_at é preenchido, status vira INACTIVE
    E o evento org.unit_deleted é emitido

  Cenário: Soft delete bloqueado com filhos ativos
    Dado que um nó N2 tem 3 filhos N3 com status=ACTIVE
    Quando DELETE /api/v1/org-units/:id é chamado
    Então deve retornar 422 com detail="Não é possível desativar um nó com subunidades ativas."
    E a lista dos filhos ativos deve estar em extensions.active_children[]

  # ── Tree Query ────────────────────────────────────────────────
  Cenário: GET /org-units/tree retorna hierarquia completa
    Dado que existe a árvore: GC-001 → UN-SP → MA-TECH → SU-DEV → (tenant: sp01)
    Quando GET /api/v1/org-units/tree é chamado
    Então a resposta deve ser uma estrutura aninhada com N1 na raiz
    E nós N4 devem ter array "tenants" com os tenants vinculados
    E o campo "breadcrumb" deve ser "Grupo Alpha > Unidade SP > Macroárea Tech > Subunidade Dev"

  Cenário: Tree query exclui nós com deleted_at preenchido
    Dado que um nó N3 foi soft-deleted
    Quando GET /api/v1/org-units/tree é chamado sem filtro
    Então o nó deletado e seus descendentes NÃO devem aparecer na árvore

  Cenário: GET /org-units/:id retorna breadcrumb do nó
    Dado que existe um nó N3 com ancestrais N1 e N2
    Quando GET /api/v1/org-units/:id é chamado
    Então a resposta deve incluir array "ancestors": [{ id, codigo, nome, nivel }]
    E o campo "breadcrumb" com o caminho completo separado por " > "

  # ── Vinculação N5 (Tenant) ────────────────────────────────────
  Cenário: Vincular tenant existente a nó N4
    Dado que existe um nó N4 e um tenant existente com id="tenant-uuid"
    Quando POST /api/v1/org-units/:id/tenants com { tenant_id: "tenant-uuid" }
    Então deve retornar 201
    E o vínculo é criado em org_unit_tenant_links
    E o evento org.tenant_linked é emitido

  Cenário: Rejeitar vinculação em nó que não é N4
    Dado que um nó tem nivel=3
    Quando POST /api/v1/org-units/:id/tenants é chamado
    Então deve retornar 422: "Vinculação de tenant só é permitida em nós de nível N4."

  Cenário: Rejeitar vinculação de tenant inexistente
    Dado que o tenant_id enviado não existe na tabela tenants
    Então deve retornar 404: "Tenant não encontrado."

  Cenário: Rejeitar vínculo duplicado
    Dado que o par (org_unit_id, tenant_id) já existe com deleted_at=null
    Então deve retornar 409: "Este estabelecimento já está vinculado a esta subunidade."

  Cenário: Soft unlink — desvincular tenant de N4
    Dado que existe o vínculo ativo
    Quando DELETE /api/v1/org-units/:id/tenants/:tenantId é chamado
    Então deleted_at é preenchido no vínculo (soft unlink)
    E o evento org.tenant_unlinked é emitido

  # ── Observabilidade ───────────────────────────────────────────
  Cenário: Todos os eventos persistem em domain_events
    Dado que qualquer operação de escrita é executada
    Então o evento DEVE ser gravado em domain_events com:
    | campo          | valor exigido                          |
    | entity_type    | org_unit                               |
    | correlation_id | X-Correlation-ID da requisição         |
    | created_by     | id do usuário autenticado              |
    | sensitivity_level | 0 (dados organizacionais não-sensíveis) |

  # ── Segurança e RBAC ─────────────────────────────────────────
  Cenário: Requisição sem scope bloqueada com 403
    Dado que o usuário não tem scope "org:unit:read"
    Quando GET /api/v1/org-units é chamado
    Então deve retornar 403 RFC 9457 com type="/problems/forbidden"
```

---

## 6. Regras Críticas / Restrições

1. **`nivel` calculado no backend** — nunca aceito do cliente; derivado de `parent.nivel + 1`
2. **`codigo` imutável** após criação — identificador de negócio estável
3. **Prevenção de loop**: validação via CTE antes de aceitar `parent_id`
4. **Soft delete condicional**: só permitido sem filhos ativos em `org_units` E sem vínculos ativos em `org_unit_tenant_links`
5. **Vinculação só em N4**: `org_unit_tenant_links` rejeita `org_unit_id` com `nivel != 4`
6. **X-Correlation-ID obrigatório** em todas as respostas (sucesso e erro RFC 9457)
7. **Idempotência em POST**: `Idempotency-Key` suportado com TTL 60s para `org_units_create` e `org_units_link_tenant`
8. **Tree query**: latência alvo < 200ms para árvores com até 100 nós (índice em `parent_id`, sem cache — todas as chamadas executam ao vivo)
9. **Paginação flat**: `GET /org-units` usa cursor-based pagination (não tree)

---

## 7. Domain Events

| event_type | Trigger | entity_type | sensitivity_level |
|---|---|---|---|
| `org.unit_created` | POST /org-units | org_unit | 0 |
| `org.unit_updated` | PATCH /org-units/:id | org_unit | 0 |
| `org.unit_deleted` | DELETE /org-units/:id | org_unit | 0 |
| `org.tenant_linked` | POST /org-units/:id/tenants | org_unit | 0 |
| `org.tenant_unlinked` | DELETE /org-units/:id/tenants/:tid | org_unit | 0 |

---

## 8. Definition of Ready (DoR) ✅

- [x] Modelo de dados `org_units` + `org_unit_tenant_links` definido com constraints
- [x] CTE recursivo de tree query documentado
- [x] Regras de integridade da árvore documentadas (loop, nivel max, soft delete)
- [x] Todos os endpoints com operationId, scope e comportamento definidos
- [x] Novos escopos `org:unit:*` mapeados para catálogo MOD-000-F12
- [x] Épico pai US-MOD-003 em estado READY

## 9. Definition of Done (DoD)

- [ ] Migrations criadas e revisadas pelo time de dados
- [ ] Todos os endpoints documentados no OpenAPI com Spectral lint passando
- [ ] Testes unitários: regras de integridade da árvore (loop, nivel, soft delete)
- [ ] Testes de integração: CTE tree query com árvore real de 50+ nós
- [ ] Testes de performance: tree query < 200ms com 100 nós (índice validado, sem cache)
- [ ] domain_events emitidos e verificados para todos os eventos
- [ ] Idempotency-Key testado em create e link_tenant
- [ ] RBAC: todos os endpoints retornam 403 sem scope correto

---

## 10. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação do zero. Modelo de dados, CTE, todos os endpoints, regras de árvore, domain events. |
