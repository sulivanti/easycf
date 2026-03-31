# US-MOD-003-F05 — CRUD de Departamentos

**Status Ágil:** `READY`
**Versão:** 1.0.0
**Data:** 2026-03-31
**Módulo Destino:** **MOD-003** (Estrutura Organizacional — Full-Stack)
**Referências Normativas:** DOC-DEV-001 §5.1, §8.2 | DOC-ARC-001 | DOC-ARC-002 | DOC-ARC-003

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-31
- **rastreia_para:** US-MOD-003, FR-002, DATA-002, BR-002, SEC-001-M01, SEC-002-M01, UX-002, 12-departments-spec, PEN-003/PENDENTE-008
- **nivel_arquitetura:** 2 (DDD-lite + Clean Completo)
- **tipo:** Full-Stack — cria novos endpoints + nova tela

---

## 1. A Solução

Como **administrador organizacional**, quero gerenciar departamentos (criar, listar, editar, desativar e restaurar) dentro do meu tenant, para que possam ser usados como tags categorizadoras nas unidades organizacionais em fase posterior.

---

## 2. Modelo de Dados

```sql
CREATE TABLE departments (
  id            uuid         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id     uuid         NOT NULL REFERENCES tenants(id) ON DELETE RESTRICT,
  codigo        varchar(50)  NOT NULL,
  nome          varchar(200) NOT NULL,
  descricao     text,
  status        varchar(20)  NOT NULL DEFAULT 'ACTIVE'
                             CHECK (status IN ('ACTIVE','INACTIVE')),
  cor           varchar(7)   CHECK (cor ~ '^#[0-9A-Fa-f]{6}$'),
  created_by    uuid         NOT NULL REFERENCES users(id),
  created_at    timestamptz  NOT NULL DEFAULT now(),
  updated_at    timestamptz  NOT NULL DEFAULT now(),
  deleted_at    timestamptz,

  CONSTRAINT uq_departments_tenant_codigo UNIQUE (tenant_id, codigo)
);

CREATE UNIQUE INDEX idx_departments_tenant_codigo
  ON departments (tenant_id, codigo) WHERE deleted_at IS NULL;

CREATE INDEX idx_departments_tenant_status
  ON departments (tenant_id, status) WHERE deleted_at IS NULL;
```

### Diferenças de org_units

| Aspecto | org_units | departments |
|---|---|---|
| Isolamento | Cross-tenant (ADR-003) | Por tenant (tenant_id) |
| Hierarquia | Árvore 4 níveis (parent_id) | Flat (sem hierarquia) |
| Unicidade codigo | Global (UNIQUE) | Por tenant (UNIQUE(tenant_id, codigo)) |
| Campo especial | nivel, parent_id | cor (hex #RRGGBB) |

---

## 3. Regras de Negócio

| Regra | Descrição | HTTP |
|---|---|---|
| BR-013 | Unicidade de codigo por tenant (catch 23505 → 409) | 409 |
| BR-014 | Codigo imutável após criação | 422 |
| BR-015 | Soft delete (status=INACTIVE + deleted_at) | 204 |
| BR-016 | Restore sem restrições (entidade flat) | 200 |
| BR-017 | Cor hex válida (#RRGGBB) ou null | 422 |
| BR-018 | Soft limit 100 por tenant (warning em 80%) | 201 + header |

---

## 4. Endpoints

| Método | Path | operationId | Scope | Descrição |
|---|---|---|---|---|
| POST | /api/v1/departments | `departments_create` | `org:dept:write` | Criar departamento (Idempotency-Key) |
| GET | /api/v1/departments | `departments_list` | `org:dept:read` | Listar com cursor pagination + filtros |
| GET | /api/v1/departments/:id | `departments_get` | `org:dept:read` | Detalhe do departamento |
| PATCH | /api/v1/departments/:id | `departments_update` | `org:dept:write` | Atualizar nome/descricao/cor |
| DELETE | /api/v1/departments/:id | `departments_delete` | `org:dept:delete` | Soft delete |
| PATCH | /api/v1/departments/:id/restore | `departments_restore` | `org:dept:write` | Restaurar departamento |

---

## 5. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: CRUD de Departamentos

  # ── CREATE ────────────────────────────────────────────────────
  Cenário: Criar departamento com dados válidos
    Dado que o usuário tem scope "org:dept:write"
    Quando POST /api/v1/departments com { codigo: "DEPT-DIR", nome: "Diretoria", cor: "#2E86C1" } e Idempotency-Key válida
    Então deve retornar 201 com id, tenant_id derivado do JWT, status="ACTIVE"
    E deve emitir domain event "org.dept_created" com entity_type=department

  Cenário: Rejeitar criação com codigo duplicado no tenant
    Dado que existe departamento com codigo="DEPT-DIR" no tenant do usuário
    Quando POST /api/v1/departments com { codigo: "DEPT-DIR", nome: "Outro" }
    Então deve retornar 409 com type="/problems/conflict"

  Cenário: Mesmo codigo em tenants diferentes é permitido
    Dado que existe departamento com codigo="DEPT-DIR" no tenant "T1"
    Quando POST /api/v1/departments com { codigo: "DEPT-DIR" } no tenant "T2"
    Então deve retornar 201

  Cenário: Idempotency-Key previne duplicação
    Dado que POST /departments retornou 201 com Idempotency-Key "key-abc"
    Quando o mesmo POST é repetido com Idempotency-Key "key-abc"
    Então deve retornar 201 com o mesmo recurso sem criar duplicado

  Cenário: Soft limit warning ao ultrapassar 80%
    Dado que o tenant possui 81 departamentos ativos
    Quando POST /api/v1/departments com dados válidos
    Então deve retornar 201
    E o response header X-Limit-Warning deve conter "departments_count=82"

  Cenário: Cor hex inválida retorna 422
    Quando POST /api/v1/departments com { codigo: "D1", nome: "Dept", cor: "#FFF" }
    Então deve retornar 422 com detail contendo "cor"

  # ── READ ──────────────────────────────────────────────────────
  Cenário: Listar departamentos com filtro de status
    Dado que o usuário tem scope "org:dept:read"
    Quando GET /api/v1/departments?status=ACTIVE
    Então deve retornar 200 com array de departamentos ativos do tenant
    E cada item deve conter id, codigo, nome, status, cor, created_at

  Cenário: Buscar departamento por nome
    Dado que existem departamentos "Diretoria" e "Engenharia"
    Quando GET /api/v1/departments?search=eng
    Então deve retornar 200 contendo "Engenharia" mas não "Diretoria"

  Cenário: Detalhe de departamento existente
    Dado que existe departamento com id=":id" no tenant do usuário
    Quando GET /api/v1/departments/:id
    Então deve retornar 200 com todos os campos incluindo descricao

  Cenário: Departamento de outro tenant retorna 404
    Dado que existe departamento no tenant "T2"
    Quando GET /api/v1/departments/:id pelo usuário do tenant "T1"
    Então deve retornar 404 (não 403)

  # ── UPDATE ────────────────────────────────────────────────────
  Cenário: Atualizar nome e cor do departamento
    Quando PATCH /api/v1/departments/:id com { nome: "Novo Nome", cor: "#27AE60" }
    Então deve retornar 200 com nome e cor atualizados
    E deve emitir domain event "org.dept_updated"

  Cenário: Tentativa de alterar codigo retorna 422
    Quando PATCH /api/v1/departments/:id com { codigo: "NOVO-COD" }
    Então deve retornar 422 com detail "O campo 'codigo' é imutável após criação."

  # ── DELETE / RESTORE ──────────────────────────────────────────
  Cenário: Soft delete de departamento ativo
    Dado que existe departamento ativo com id=":id"
    Quando DELETE /api/v1/departments/:id
    Então deve retornar 204
    E o departamento deve ter status="INACTIVE" e deleted_at preenchido
    E deve emitir domain event "org.dept_deleted"

  Cenário: Soft delete de departamento já inativo retorna 422
    Dado que existe departamento já desativado
    Quando DELETE /api/v1/departments/:id
    Então deve retornar 422 com detail "Departamento já está desativado."

  Cenário: Restaurar departamento inativo
    Dado que existe departamento inativo com id=":id"
    Quando PATCH /api/v1/departments/:id/restore
    Então deve retornar 200 com status="ACTIVE" e deleted_at=null
    E deve emitir domain event "org.dept_restored"

  Cenário: Restaurar departamento já ativo retorna 422
    Dado que existe departamento ativo
    Quando PATCH /api/v1/departments/:id/restore
    Então deve retornar 422 com detail "Departamento já está ativo."

  # ── Segurança e RBAC ─────────────────────────────────────────
  Cenário: Requisição sem scope bloqueada com 403
    Dado que o usuário não tem scope "org:dept:read"
    Quando GET /api/v1/departments é chamado
    Então deve retornar 403 RFC 9457 com type="/problems/forbidden"

  Cenário: Todos os eventos persistem em domain_events
    Dado que qualquer operação de escrita é executada
    Então o evento DEVE ser gravado em domain_events com:
    | campo             | valor exigido                          |
    | entity_type       | department                             |
    | correlation_id    | X-Correlation-ID da requisição         |
    | created_by        | id do usuário autenticado              |
    | sensitivity_level | 0 (dados organizacionais não-sensíveis)|
```

---

## 6. Regras Críticas / Restrições

1. **`tenant_id` derivado do JWT** — nunca aceito no body; extraído do token autenticado
2. **`codigo` imutável** após criação — identificador de negócio estável (BR-014)
3. **Unicidade por tenant**: UNIQUE(tenant_id, codigo), catch 23505 → 409 (BR-013)
4. **Cor hex válida**: `#RRGGBB` ou null — validação Zod + CHECK constraint (BR-017)
5. **Soft limit informativo**: 100 por tenant, warning em 80% via X-Limit-Warning (BR-018)
6. **Sem hierarquia**: entidade flat, sem parent_id, sem CTE
7. **X-Correlation-ID obrigatório** em todas as respostas (sucesso e erro RFC 9457)
8. **Idempotência em POST**: `Idempotency-Key` suportado com TTL 60s (ADR-004)

---

## 7. Domain Events

| event_type | Trigger | entity_type | sensitivity_level |
|---|---|---|---|
| `org.dept_created` | POST /departments | department | 0 |
| `org.dept_updated` | PATCH /departments/:id | department | 0 |
| `org.dept_deleted` | DELETE /departments/:id | department | 0 |
| `org.dept_restored` | PATCH /departments/:id/restore | department | 0 |

---

## 8. Tela — UX-ORG-003 (Gestão de Departamentos)

- **Rota:** `/organizacao/departamentos`
- **Layout:** Tabela full-width + Drawer lateral (480px) para create/edit
- **Componentes:** DepartmentsPage, DepartmentTable, DepartmentDrawer, ColorPicker, DepartmentTag, DeactivateModal, DrawerPanel
- **Estados:** loading (skeleton), empty, empty_search, error, loaded
- **Spec visual:** `docs/03_especificacoes/ux/12-departments-spec.md`
- **Jornadas:** Listar, Criar, Editar, Desativar, Restaurar (UX-002)

---

## 9. Definition of Ready (DoR) ✅

- [x] Modelo de dados `departments` definido com constraints (DATA-002 READY)
- [x] Regras de negócio BR-013–BR-018 documentadas (BR-002 READY)
- [x] Requisitos funcionais FR-007 com 6 endpoints e Gherkin (FR-002 READY)
- [x] Escopos `org:dept:*` adicionados ao catálogo (SEC-001 v0.3.0)
- [x] Matriz de autorização de eventos atualizada (SEC-002 v0.3.0)
- [x] Jornadas UX documentadas (UX-002 READY)
- [x] Spec visual detalhada (12-departments-spec.md)
- [x] PENDENTE-008 decidida (entidade independente, Fase 1)
- [x] Épico pai US-MOD-003 em estado READY

## 10. Definition of Done (DoD)

- [ ] Migration criada e revisada
- [ ] Drizzle schema `departments` com constraints e índices
- [ ] Todos os 6 endpoints documentados no OpenAPI com Spectral lint passando
- [ ] Testes unitários: unicidade por tenant, codigo imutável, cor hex, soft limit
- [ ] Testes de integração: CRUD completo com tenant isolation
- [ ] domain_events emitidos e verificados para 4 eventos
- [ ] Idempotency-Key testado em create
- [ ] RBAC: todos os endpoints retornam 403 sem scope correto
- [ ] Tenant isolation: departamento de outro tenant retorna 404
- [ ] Tela DepartmentsPage renderiza tabela + drawer + color picker
- [ ] Responsividade: drawer full-screen em mobile, cards < 768px

---

## 11. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-31 | arquitetura | Criação. CRUD departamentos (Fase 1): 6 endpoints, 6 BRs, 4 events, tela UX-ORG-003. Refs: FR-002, DATA-002, BR-002, SEC-001-M01, SEC-002-M01, UX-002, 12-departments-spec. |
