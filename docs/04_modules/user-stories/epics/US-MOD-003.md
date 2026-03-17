# US-MOD-003 — Estrutura Organizacional (Épico)

**Status Ágil:** `READY`
**Versão:** 1.1.0
**Data:** 2026-03-15
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-003** (Estrutura Organizacional)
**Épico de Negócio:** EP01

## Metadados de Governança

- **status_agil:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** EP01 (doc 01_Fundacao_Organizacional_e_de_Acesso), DOC-DEV-001, DOC-ARC-001, DOC-ARC-002, DOC-ARC-003, DOC-UX-011, DOC-UX-012, US-MOD-000-F07, US-MOD-000-F12, LGPD-BASE-001
- **nivel_arquitetura:** 1 (CRUD + soft delete + tree query CTE)
- **evidencias:** N/A (aguardando aprovação)

---

## 1. Contexto e Problema

O sistema precisa de uma hierarquia organizacional formal de 5 níveis que sirva como **referência de pertencimento** para todas as entidades de negócio — usuários, processos, rotinas e integrações. Sem ela, escopos de acesso ficam limitados ao nível de filial (tenant), impossibilitando visão corporativa consolidada, delegações por área e governança multi-camada.

O documento normativo **01_Fundacao_Organizacional_e_de_Acesso** define os 5 níveis:

| Nível | Nome | Pergunta orientadora |
|---|---|---|
| N1 | Grupo Corporativo | A qual agrupamento máximo isso pertence? |
| N2 | Unidade | Em qual unidade principal isso se enquadra? |
| N3 | Macroárea | Qual domínio de atuação está sendo tratado? |
| N4 | Subunidade Organizacional | Qual desdobramento interno responde por isso? |
| N5 | Entidade Jurídica / Estabelecimento | Qual CNPJ/filial materializa essa unidade? |

---

## 2. Decisão Arquitetural Central — N5 = Tenant

> **Esta é a decisão mais importante do módulo.**

O **N5 (Entidade Jurídica / Estabelecimento) já existe como `tenants`** no MOD-000-F07. O MOD-003 **vincula** os nós N5 ao tenant existente — não cria uma tabela paralela.

```
org_units (N1–N4)                    tenants (N5 — MOD-000-F07)
──────────────────────               ──────────────────────────
id   uuid PK                         id     uuid PK
...                                  codigo varchar UNIQUE
                                     nome   varchar
                                     status ACTIVE|BLOCKED|INACTIVE

org_unit_tenant_links (N4 → N5)
──────────────────────────────────
org_unit_id  FK → org_units.id     (N4)
tenant_id    FK → tenants.id       (N5)
```

Implicações:
- Uma Subunidade (N4) pode ter **múltiplos estabelecimentos** (N5/tenants) vinculados
- Um Tenant (N5) pode estar vinculado a **apenas uma** Subunidade N4 por vez
- N5 nunca é criado pelo MOD-003 — é gerenciado pelo MOD-000-F07 (filiais)

---

## 3. Diferença de Outros Módulos: MOD-003 é Full-Stack

| Módulo | Backend | Frontend |
|---|---|---|
| MOD-000 | ✅ Cria endpoints próprios | ❌ Sem telas próprias |
| MOD-001 | ❌ Consome MOD-000 | ✅ Shell e Dashboard |
| MOD-002 | ❌ Consome MOD-000-F05 | ✅ Listagem e Formulário |
| **MOD-003** | **✅ Cria endpoints próprios** | **✅ Telas próprias** |

O MOD-003 precisa de novos endpoints (`/org-units`) **e** de novas telas. É o primeiro módulo verdadeiramente full-stack depois do Foundation.

---

## 4. Escopo

### Inclui
- API CRUD de unidades organizacionais N1–N4 com soft delete
- Tree query para visualização hierárquica (CTE recursivo)
- Vinculação N4 → N5 (tenant existente do MOD-000-F07)
- Tela de árvore organizacional com navegação hierárquica (UX-ORG-001)
- Formulário de criação/edição de nó com seleção de pai (UX-ORG-002)
- Novos escopos no catálogo MOD-000-F12: `org:unit:read`, `org:unit:write`, `org:unit:delete`

### Não inclui
- Gestão de usuários dentro de cada nó — MOD-004
- Regras de acesso por estrutura org. — MOD-004
- Importação em massa de hierarquia — roadmap futuro
- Histórico de mudanças estruturais — roadmap futuro (MOD-003 v2)
- Movimentação de nós na árvore (drag-and-drop) — roadmap futuro

---

## 5. Critérios de Aceite (Épico)

```gherkin
Funcionalidade: Épico Estrutura Organizacional MOD-003

  Cenário: N5 vinculado ao tenant existente, não duplicado
    Dado que um tenant existe em MOD-000-F07
    Quando um nó N4 é vinculado a ele via org_unit_tenant_links
    Então o N5 não deve ser criado como org_unit separado
    E GET /org-units/tree deve incluir o tenant como folha N5

  Cenário: Hierarquia não pode exceder 5 níveis
    Dado que existe uma árvore N1 → N2 → N3 → N4
    Quando tentar criar um filho direto de um nó N4 como org_unit
    Então o sistema deve retornar 422 com "Nível máximo (N4) atingido. Use vinculação de tenant para N5."

  Cenário: Soft delete bloqueado com filhos ativos
    Dado que um nó N2 tem filhos N3 ativos
    Quando DELETE /org-units/:id é chamado
    Então deve retornar 422: "Não é possível desativar um nó com subunidades ativas."

  Cenário: Sub-histórias só scaffoldadas após aprovação
    Dado que US-MOD-003 está diferente de "APPROVED"
    Quando um agente COD tentar forge-module para F01, F02 ou F03
    Então a automação DEVE ser bloqueada
```

---

## 6. Definition of Ready (DoR) ✅

- [x] Decisão N5 = tenant documentada e validada (não duplicar tabela)
- [x] Modelo de dados `org_units` + `org_unit_tenant_links` definido
- [x] Features F01, F02, F03 com Gherkin completo
- [x] Screen Manifests UX-ORG-001, UX-ORG-002 criados
- [x] Novos escopos mapeados para catálogo MOD-000-F12
- [x] Regras de integridade da árvore (loop, max nivel, soft delete) documentadas
- [ ] Owner confirmar READY → APPROVED

## 7. Definition of Done (DoD)

- [ ] F01, F02, F03 individualmente aprovadas e scaffoldadas
- [ ] `GET /org-units/tree` retorna árvore completa N1–N5 em <200ms (com até 100 nós, com cache de árvore invalidado apenas em alterações)
- [ ] Soft delete bloqueado quando há filhos ativos — validado por teste
- [ ] Vinculação N4 → tenant testada com tenant existente e tenant inexistente
- [ ] Tela de árvore renderiza hierarquia expansível até N5
- [ ] Escopos `org:unit:*` adicionados ao catálogo via MOD-000-F12

---

## 8. Sub-Histórias

```text
US-MOD-003  (este arquivo) ← Épico / Governança / Índice
  ├── US-MOD-003-F01  ← API Core — CRUD + Tree Query + Vinculação N5
  ├── US-MOD-003-F02  ← Árvore Organizacional (UX-ORG-001)
  └── US-MOD-003-F03  ← Formulário de Nó Organizacional (UX-ORG-002)
```

| Sub-História | Tema | Tipo | Status |
|---|---|---|---|
| US-MOD-003-F01 | API: CRUD + tree query + vinculação tenant | **Backend** | `READY` |
| US-MOD-003-F02 | Tela de Árvore Organizacional | **UX** | `READY` |
| US-MOD-003-F03 | Formulário de Criação/Edição de Nó | **UX** | `READY` |

---

## 9. Modelo de Dados

### Tabela: `org_units`

| Campo | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | uuid | PK | Identificador técnico |
| `codigo` | varchar(50) | UNIQUE, NOT NULL | Identificador amigável (ex: GC-001, UN-SP) |
| `nome` | varchar(200) | NOT NULL | Nome da unidade organizacional |
| `descricao` | text | nullable | Descrição opcional |
| `nivel` | integer | NOT NULL, CHECK (1..4) | 1=Grupo Corp., 2=Unidade, 3=Macroárea, 4=Subunidade |
| `parent_id` | uuid | FK → org_units.id, nullable | Nulo apenas para N1 |
| `status` | varchar | ACTIVE \| INACTIVE | Soft delete via status + deleted_at |
| `created_by` | uuid | FK → users.id | Quem criou |
| `created_at` | timestamp | NOT NULL | |
| `updated_at` | timestamp | NOT NULL | |
| `deleted_at` | timestamp | nullable | Soft delete |

### Tabela: `org_unit_tenant_links`

| Campo | Tipo | Constraints | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `org_unit_id` | uuid | FK → org_units.id | Deve ser nível N4 |
| `tenant_id` | uuid | FK → tenants.id | Tenant existente (MOD-000-F07) |
| `created_by` | uuid | FK → users.id | |
| `created_at` | timestamp | | |
| `deleted_at` | timestamp | nullable | Soft unlink |

**Constraint:** `UNIQUE (org_unit_id, tenant_id)` — mesmo par não pode aparecer duas vezes.

### Restrições de integridade da árvore

1. N1 não tem `parent_id` (nullable)
2. N2 deve ter `parent_id` apontando para N1
3. N3 deve ter `parent_id` apontando para N2
4. N4 deve ter `parent_id` apontando para N3
5. `nivel` deve ser exatamente `parent.nivel + 1`
6. Prevenção de loop: um nó não pode ser ancestral de si mesmo (validado com CTE)

---

## 10. Endpoints do Módulo

| Método | Path | operationId | Scope | Descrição |
|---|---|---|---|---|
| GET | /api/v1/org-units | `org_units_list` | `org:unit:read` | Listagem flat com filtros |
| POST | /api/v1/org-units | `org_units_create` | `org:unit:write` | Criar nó N1–N4 |
| GET | /api/v1/org-units/tree | `org_units_tree` | `org:unit:read` | Árvore hierárquica N1–N5 |
| GET | /api/v1/org-units/:id | `org_units_get` | `org:unit:read` | Detalhe + breadcrumb |
| PATCH | /api/v1/org-units/:id | `org_units_update` | `org:unit:write` | Atualizar nome/descrição/status |
| DELETE | /api/v1/org-units/:id | `org_units_delete` | `org:unit:delete` | Soft delete |
| POST | /api/v1/org-units/:id/tenants | `org_units_link_tenant` | `org:unit:write` | Vincular tenant N5 a nó N4 |
| DELETE | /api/v1/org-units/:id/tenants/:tenantId | `org_units_unlink_tenant` | `org:unit:delete` | Desvincular tenant |

---

## 11. Novos Escopos — Amendment em MOD-000-F12

Os seguintes escopos devem ser adicionados ao catálogo de permissões via amendment:

| Escopo | Descrição |
|---|---|
| `org:unit:read` | Visualizar a estrutura organizacional e árvore |
| `org:unit:write` | Criar e editar nós organizacionais e vínculos de tenant |
| `org:unit:delete` | Desativar nós e remover vínculos |

---

## 12. OKRs

| # | Métrica | Alvo |
|---|---|---|
| OKR-1 | `GET /org-units/tree` latência com 100 nós (cache invalidado em alterações) | < 200ms |
| OKR-2 | Tentativas de criar loop na árvore bloqueadas | 100% |
| OKR-3 | Screen Manifests validados sem erro | 2/2 |
| OKR-4 | Soft delete com filhos ativos sempre bloqueado | 100% |

---

## 13. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação do zero. Decisão N5=tenant documentada, modelo de dados, endpoints, escopos, features F01–F03. |
| 1.1.0 | 2026-03-16 | Marcos Sulivan | Decisões técnicas 2026-03-15: volume árvore ajustado de 500 para ~100 nós, cache strategy documentada, owner atualizado. |

---

> ⚠️ **Atenção:** As automações (`forge-module`, `create-amendment`) **SÓ PODEM SER EXECUTADAS** com Status `APPROVED`.
