# US-MOD-000-F12 — Catálogo de Permissões (CRUD de Escopos Pré-Definidos)

**Status Ágil:** `READY`
**Data:** 2026-03-06
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-000** (Foundation — RBAC Permissions Catalog)
**Referências Normativas:** DOC-DEV-001 §6, §8.2 | DOC-ARC-001 | DOC-ARC-003 | DOC-GNP-00 §RBAC | DOC-ESC-001

## Metadados de Governança

- **status_agil:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-15
- **rastreia_para:** US-MOD-000, US-MOD-000-F06, DOC-DEV-001, DOC-ARC-001, DOC-ARC-003, DOC-GNP-00, DOC-ESC-001
- **nivel_arquitetura:** 2 (integridade referencial RBAC + domain events + validação cruzada)
- **referencias_exemplos:** US-MOD-000-F06 (Roles/RBAC), US-MOD-000-F09 (Vinculação usuário-filial)
- **evidencias:** *(adicionar links de PR/issue ao longo do refinamento)*
- **wave_entrega:** Wave 1
- **epico_pai:** US-MOD-000
- **manifests_vinculados:** N/A
- **pendencias:** N/A

### Pendentes

| ID | Pendência | Impacto | Opção A | Opção B | Recomendação |
| --- | --- | --- | --- | --- | --- |
| PENDENTE-F12-003 | Hierarquia de escopos (ex: `finance:*:*` permite todos os sub-escopos finance) | Wildcard pode simplificar a atribuição de roles de admin, mas adiciona complexidade ao `requireScope` | **Nenhum wildcard** — apenas escopos exatos do catálogo | **Wildcard** `módulo:*:*` para admins globais | Opção A por ora: manter simples; wildcards são extensão futura |

---

## 1. Contexto e Problema

A feature **F06** (Gestão de Roles/RBAC) define o formato de escopo `módulo:recurso:ação` com validação via regex `^[a-z_]+:[a-z_]+:[a-z_]+$`. Porém, a validação atual garante apenas a **forma sintática** do escopo — não a **existência semântica**.

Isso significa que qualquer string bem formada como `finance:nada:inventado` ou `modulo_inexistente:acoes:criar` pode ser atribuída a uma role sem que o sistema tenha qualquer conhecimento sobre o que esse escopo representa ou se ele deveria existir.

**Consequências práticas:**

1. O frontend de edição de roles não tem uma fonte confiável para listar as opções disponíveis de escopos — exige codificação hard-coded ou documentação manual.
2. Administradores podem criar roles com escopos "fantasmas" que apontam para recursos que não existem, tornando o RBAC inconsistente.
3. Não há como auditar "quais escopos do sistema nunca foram atribuídos a nenhuma role" (cobertura de permissões).
4. Internacionalização e descrições humanas dos escopos não têm um lugar canônico.

O **catálogo de permissões** resolve estas lacunas: ele é a **tabela de verdade** dos escopos que o sistema reconhece como válidos.

---

## 2. A Solução (Linguagem de Negócio)

Como **administrador do sistema**, quero gerenciar um catálogo de permissões (escopos) pré-definidos, para garantir que as roles só possam ser configuradas com escopos que o sistema realmente conhece e expõe.

Como **frontend**, quero ter um endpoint `GET /permissions` para listar as permissões disponíveis, agrupadas por módulo, para preencher os dropdowns de configuração de roles sem depender de hard-code.

Como **time de arquitetura**, queremos que qualquer atribuição de escopo a uma role seja validada contra o catálogo, impedindo escopos inexistentes de entrar no sistema.

### Modelo de Dados — Tabela `permissions`

```sql
CREATE TABLE permissions (
  id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id   UUID        NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  codigo      VARCHAR(200) NOT NULL,                   -- ex: "finance:invoice:approve" (o escopo)
  name        VARCHAR(200) NOT NULL,                   -- ex: "Aprovar Faturas"
  description TEXT,                                    -- descrição humana do escopo
  module      VARCHAR(100) NOT NULL,                   -- ex: "finance"
  resource    VARCHAR(100) NOT NULL,                   -- ex: "invoice"
  action      VARCHAR(100) NOT NULL,                   -- ex: "approve"
  status      VARCHAR(20)  NOT NULL DEFAULT 'ACTIVE',  -- ACTIVE | INACTIVE
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  deleted_at  TIMESTAMPTZ,                             -- soft delete padrão do projeto
  UNIQUE (tenant_id, codigo)
);
```

> **Nota de multi-tenancy:** O campo `codigo` (que armazena o escopo) é único **por tenant**. Cada tenant pode ter seu próprio catálogo de permissões isolado. O padrão do código ainda deve seguir `^[a-z_]+:[a-z_]+:[a-z_]+$`.

### Contrato HTTP

| Verbo | Rota | Escopo Necessário | Descrição |
| --- | --- | --- | --- |
| `GET` | `/api/v1/permissions` | `permissions:catalog:read` | Listar permissões (com filtros) |
| `GET` | `/api/v1/permissions/:id` | `permissions:catalog:read` | Detalhar uma permissão |
| `POST` | `/api/v1/permissions` | `permissions:catalog:write` | Criar nova permissão |
| `PUT` | `/api/v1/permissions/:id` | `permissions:catalog:write` | Atualizar permissão (name/description/status) |
| `DELETE` | `/api/v1/permissions/:id` | `permissions:catalog:write` | Soft delete de permissão |

> ⚠️ **O campo `scope` é imutável após a criação.** Alterar um escopo quebraria todas as role_scopes que o referenciam. Para "renomear" um escopo, deve-se criar um novo e deprecar o antigo.

### Exemplo de Payload — POST /permissions

```json
{
  "codigo":      "finance:invoice:approve",
  "name":        "Aprovar Faturas",
  "description": "Permite que o usuário aprove faturas financeiras para pagamento.",
  "module":      "finance",
  "resource":    "invoice",
  "action":      "approve"
}
```

**Resposta 201 Created:**

```json
{
  "id":          "a1b2c3d4-...",
  "codigo":      "finance:invoice:approve",
  "name":        "Aprovar Faturas",
  "description": "Permite que o usuário aprove faturas financeiras para pagamento.",
  "module":      "finance",
  "resource":    "invoice",
  "action":      "approve",
  "status":      "ACTIVE",
  "created_at":  "2026-03-06T22:00:00.000Z"
}
```

### GET /permissions — Filtros e Agrupamento

```http
GET /api/v1/permissions?module=finance&status=ACTIVE&page=1&limit=50
```

**Resposta:**

```json
{
  "data": [
    {
      "id":          "...",
      "codigo":      "finance:invoice:approve",
      "name":        "Aprovar Faturas",
      "description": "...",
      "module":      "finance",
      "resource":    "invoice",
      "action":      "approve",
      "status":      "ACTIVE"
    }
  ],
  "pagination": {
    "page":       1,
    "limit":      50,
    "total":      12,
    "totalPages": 1
  }
}
```

### Integração com F06 — Validação ao Atribuir Escopos a Roles

```text
POST /roles ou PUT /roles/:id
  body: { scopes: ["finance:invoice:approve", "users:profile:read"] }

  ├─ [Validação Sintática] Regex ^[a-z_]+:[a-z_]+:[a-z_]+$ (F06 — existente)
  └─ [Validação Semântica — NOVO F12]
       └─ SELECT codigo FROM permissions
             WHERE tenant_id=:tenantId
               AND scope IN (...escopos enviados)
               AND status='ACTIVE'
               AND deleted_at IS NULL
         ├─ Se todos os escopos encontrados → prosseguir
         └─ Se algum escopo não encontrado → 422 com detalhe:
              {
                "type": "/problems/invalid-scopes",
                "title": "Escopos inválidos no catálogo",
                "status": 422,
                "detail": "Os seguintes escopos não existem no catálogo de permissões ativo: [\"finance:nada:inventado\"]",
                "extensions": { "invalidScopes": ["finance:nada:inventado"], "correlationId": "..." }
              }
```

---

## 3. Critérios de Aceite (Gherkin)

```gherkin
Funcionalidade: Catálogo de Permissões (CRUD de Escopos)

  Cenário: Criação bem-sucedida de permissão
    Dado que o usuário tem o escopo "permissions:catalog:write"
    Quando POST /api/v1/permissions é chamado com codigo válido, name e module/resource/action
    Então deve retornar 201 com a permissão criada
    E o evento permissions.created deve ser emitido
    E a auditoria permissions.permission.created deve ser gerada com correlation_id

  Cenário: Escopo duplicado no mesmo tenant
    Dado que já existe uma permissão com codigo "finance:invoice:approve" no tenant
    Quando POST /api/v1/permissions é chamado com o mesmo codigo
    Então deve retornar 409 Conflict com type="/problems/scope-already-exists"

  Cenário: Escopo com formato inválido
    Dado que o body contém codigo="Finance:Invoice:Approve" (maiúsculas)
    Quando POST /api/v1/permissions é chamado
    Então deve retornar 422 com validação Zod indicando o regex obrigatório

  Cenário: Listar permissões filtradas por módulo
    Dado que existem 5 permissões do módulo "finance" e 3 do módulo "users"
    Quando GET /api/v1/permissions?module=finance é chamado
    Então deve retornar apenas as 5 permissões do módulo "finance"
    E total deve ser 5

  Cenário: Atualizar name e description da permissão
    Dado que existe uma permissão com id "abc-123"
    Quando PUT /api/v1/permissions/abc-123 é chamado com novo name e description
    Então deve retornar 200 com os dados atualizados
    E updated_at deve ser atualizado
    E o campo codigo NÃO deve ser alterado (imutável)
    E o evento permissions.updated deve ser emitido

  Cenário: Tentativa de alterar o campo codigo via PUT (imutável)
    Dado que existe uma permissão com codigo "finance:invoice:approve"
    Quando PUT /api/v1/permissions/:id é chamado com codigo="finance:invoice:approve_v2"
    Então deve retornar 422 com detail="O campo codigo é imutável após a criação"

  Cenário: Soft delete de permissão não utilizada
    Dado que a permissão "finance:invoice:approve" não está atribuída a nenhuma role ativa
    Quando DELETE /api/v1/permissions/:id é chamado
    Então deve retornar 204 No Content
    E deleted_at deve ser preenchido
    E status deve ser INACTIVE
    E o evento permissions.deleted deve ser emitido

  Cenário: Tentativa de soft delete de permissão em uso
    Dado que a permissão "finance:invoice:approve" está atribuída a 2 roles ativas
    Quando DELETE /api/v1/permissions/:id é chamado
    Então deve retornar 409 Conflict com type="/problems/permission-in-use"
    E detail deve listar as roles que utilizam o escopo

  Cenário: Validação semântica ao atribuir escopo inexistente a uma role
    Dado que o catálogo de permissões não possui o escopo "finance:nada:inventado"
    Quando POST /roles ou PUT /roles/:id é chamado com scopes=["finance:nada:inventado"]
    Então deve retornar 422 com type="/problems/invalid-scopes"
    E o detalhe deve listar os escopos inválidos

  Cenário: Validação semântica ao atribuir escopo INACTIVE a uma role
    Dado que a permissão "finance:archive:delete" existe mas com status=INACTIVE
    Quando PUT /roles/:id é chamado com scopes=["finance:archive:delete"]
    Então deve retornar 422 com detail indicando que o escopo está inativo no catálogo

  Cenário: Acesso negado sem o escopo correto
    Dado que o usuário não tem o escopo "permissions:catalog:read" nem "permissions:catalog:write"
    Quando qualquer rota /permissions é chamada
    Então deve retornar 403 com type="/problems/forbidden" e correlationId

  Cenário: Idempotência — reenvio de criação com mesma Idempotency-Key
    Dado que POST /permissions foi executado com sucesso com Idempotency-Key "perm-xyz"
    Quando o mesmo POST é enviado novamente com Idempotency-Key "perm-xyz" dentro de TTL
    Então deve retornar 201 com a resposta cacheada
    E NÃO deve inserir um segundo registro
```

---

## 4. Regras Críticas / Restrições Especiais

1. **Campo `codigo` é Imutável e atua como Scope:** Uma vez criado, o campo `codigo` (que guarda o texto do escopo) não pode ser alterado via PUT. Alterar o código quebraria as referências. Para "renomear", crie uma nova permissão e deprece a antiga (`status=INACTIVE`).

2. **Validação Semântica no F06 (Validação em Aplicação):** A partir desta US, `POST /roles` e `PUT /roles/:id` DEVEM validar todos os códigos de escopos enviados contra a tabela `permissions` (apenas `status='ACTIVE'` e `deleted_at IS NULL`) em nível de aplicação. Escopos não encontrados retornam 422.

3. **Soft Delete Obrigatório:** Conforme o padrão do projeto, deleções são soft (`deleted_at + status=INACTIVE`). Hard delete proibido, pois a auditoria histórica e os domain events precisam rastreabilidade.

4. **Bloqueio de Deleção em Uso:** Antes de soft deletar, verificar se o `codigo` existe em algum `role_scopes` ativo. Se sim, retornar 409 Conflict com a lista de roles afetadas.

5. **Unicidade por Tenant:** O par `(tenant_id, codigo)` é UNIQUE. Um tenant pode ter no máximo uma permissão por escopo. A unicidade NÃO é global (multi-tenancy isolado).

6. **`X-Correlation-ID` Obrigatório (DOC-ARC-003):** Todas as respostas (sucesso e erro) DEVEM propagar `X-Correlation-ID`. Erros RFC 9457 DEVEM incluir `extensions.correlationId`.

7. **Domain Events Obrigatórios:**
   - `permissions.created` → POST bem-sucedido
   - `permissions.updated` → PUT bem-sucedido
   - `permissions.deleted` → DELETE bem-sucedido (soft)
   - Todos devem conter: `entityId`, `entityType="permission"`, `actorId`, `tenantId`, `correlation_id`.

8. **Auditoria (DOC-ARC-003):** Toda mutação gera entrada na tabela de auditoria com `entity_type="permission"`, `entity_id=permission.id`, `actor_id`, `tenant_id`, `correlation_id`.

9. **Idempotência em POST/PUT (DOC-DEV-001):** Suporte a `Idempotency-Key` para evitar duplicações em caso de retry. TTL de 60 segundos.

10. **Taxonomia Canônica (`codigo`):** A entidade `permissions` DEVE adotar `codigo` como seu campo para armazenar o escopo, seguindo o padrão canônico exigido no épico US-MOD-000.

11. **Auto-população por módulo (bootstrap):** Recomenda-se que o módulo execute seeds de permissões ao inicializar em ambiente novo. Cada feature que define escopos deve contribuir com um seed declarativo na tabela `permissions`.

---

## 5. Question of Architecture (QoA) — Decisões a Tomar

| # | Questão | Contexto | Decisão Recomendada |
| --- | --- | --- | --- |
| QoA-01 | Seeds de permissões automáticos vs. manuais | Se automáticos, quem é responsável por declarar os escopos de cada módulo? | Automático via `permissions.seed.ts` por módulo, executado em migrations |
| QoA-02 | Escopo global vs. por tenant | Algumas permissões são universais (ex: `auth:token:refresh`) — devem existir por tenant ou em uma tabela global? | Por tenant — consistência com isolamento multi-tenant |
| QoA-03 | Cache Redis para lookup de permissões | O lookup `permissions → role_scopes` no F06 pode ser cacheado? | Sim: key `auth:catalog:{tenantId}:{scope}` com TTL curto (5 min); invalidado no PUT/DELETE de permissões |

---

## 6. Definition of Ready (DoR) — Para Iniciar o Desenvolvimento

- [x] Owner definido.
- [x] PENDENTE-F12-001 (FK vs validação em aplicação) resolvido (validação em aplicação).
- [x] PENDENTE-F12-002 (bloqueio de deleção em uso) resolvido (retorna 409).
- [x] PENDENTE-F12-003 (wildcards de escopo) decidido (recomendação: não por ora).
- [x] QoA-01 (seeds automáticos) decidido.
- [x] QoA-02 (escopo global vs. por tenant) decidido.
- [x] Cenários Gherkin revisados e aprovados (seção 3).
- [x] Contrato dos endpoints documentado no OpenAPI com `operationId` por endpoint.
- [x] Estratégia de integração com F06 validada (onde o lookup acontece: service ou middleware).
- [x] Sem `PENDENTE-XXX` críticos em aberto.
- [x] Épico US-MOD-000 **aprovado**.

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `aprovada`.
