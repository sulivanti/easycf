> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-19 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-19 | AGN-DEV-04  | Enriquecimento DATA-003 — catálogo de domain events delegados |

# DATA-003 — Catálogo de Domain Events do SmartGrid

> Habilita linha do tempo (Thread), auditoria, Outbox e automação de notificações.

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** US-MOD-011, US-MOD-011-F02, US-MOD-011-F03, US-MOD-011-F04, DOC-ARC-003, DOC-FND-000, SEC-002
- **referencias_exemplos:** N/A
- **evidencias:** N/A

## Princípios (MUST)

- **Não use "permissão no evento" como fonte de verdade.**
  - Emit = permissão do comando
  - View = ACL + tenant da entity originária
- `sensitivity_level` é **guard-rail** (mascarar/bloquear cedo), não a regra principal.
- **Fonte Única da Verdade:** Tabela `domain_events` é a única fonte para auditoria/timeline (DOC-ARC-003 §1 Dogma 6).
- **MOD-011 não emite domain events próprios.** Todos os eventos são emitidos pelos módulos destino (MOD-007 para avaliação, módulo do registro para CRUD). O SmartGrid é o **originador da ação do usuário** que resulta no evento.

---

## Catálogo de Domain Events

### Eventos Indiretos — Disparados pelo Módulo Destino via Ações do SmartGrid

> Os eventos abaixo são emitidos pelos módulos que detêm os registros operados pelo SmartGrid. O SmartGrid dispara a ação (via API do módulo destino) e o módulo destino emite o evento correspondente na sua tabela `domain_events`.

| # | event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | feature |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `{modulo}.{entity}.created` | Registro criado via inclusão em massa | POST /{modulo}/{entity} (operationId dinâmico) | `{entity_type}` do módulo destino | Scope do módulo destino (ex: `{dominio}:{entidade}:write`) | tenant + ACL do módulo destino | Conforme regras do módulo destino | Definido pelo módulo destino | F02 (FR-009) |
| 2 | `{modulo}.{entity}.updated` | Registro alterado via formulário de alteração | PUT/PATCH /{modulo}/{entity}/{id} (operationId dinâmico) | `{entity_type}` do módulo destino | Scope do módulo destino (ex: `{dominio}:{entidade}:write`) | tenant + ACL do módulo destino | Conforme regras do módulo destino | Definido pelo módulo destino | F03 (FR-006) |
| 3 | `{modulo}.{entity}.deleted` | Registro excluído logicamente via exclusão em massa | DELETE /{modulo}/{entity}/{id} (soft delete) | `{entity_type}` do módulo destino | Scope do módulo destino (ex: `{dominio}:{entidade}:delete`) | tenant + ACL do módulo destino | Conforme regras do módulo destino | Definido pelo módulo destino | F04 (FR-007) |

### Evento de Avaliação — Disparado pelo MOD-007

| # | event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | feature |
|---|---|---|---|---|---|---|---|---|---|
| 4 | `param.routine_applied` | Motor avaliou rotinas para linha/registro da grade | POST /routine-engine/evaluate | `routine_evaluation` | `param:engine:evaluate` | tenant + `param:routine:read` | — | 0 | F02, F03, F04 |

---

## Notas sobre Rastreabilidade

### Payload do Evento de Alteração (F03)

O evento `{modulo}.{entity}.updated` DEVE incluir no payload mínimo:

| Campo | Tipo | Descrição |
|---|---|---|
| `entity_id` | uuid | ID do registro alterado |
| `tenant_id` | uuid | Tenant do registro |
| `user_id` | uuid | Usuário que realizou a alteração via SmartGrid |
| `correlation_id` | uuid | Correlation ID propagado pela UI |
| `changes` | `Array<{ field, old_value, new_value }>` | Lista de campos alterados com valores anterior e novo |
| `source` | string | `"smartgrid"` — identifica que a alteração veio do SmartGrid |

> O campo `source: "smartgrid"` permite distinguir alterações feitas via SmartGrid de alterações feitas via formulário padrão do módulo destino.

### Payload do Evento de Exclusão (F04)

O evento `{modulo}.{entity}.deleted` DEVE incluir no payload mínimo:

| Campo | Tipo | Descrição |
|---|---|---|
| `entity_id` | uuid | ID do registro excluído |
| `tenant_id` | uuid | Tenant do registro |
| `user_id` | uuid | Usuário que realizou a exclusão via SmartGrid |
| `correlation_id` | uuid | Correlation ID propagado pela UI |
| `delete_type` | string | `"soft"` — sempre exclusão lógica (BR-009) |
| `source` | string | `"smartgrid"` — identifica origem |

### Payload do Evento de Criação (F02)

O evento `{modulo}.{entity}.created` DEVE incluir no payload mínimo:

| Campo | Tipo | Descrição |
|---|---|---|
| `entity_id` | uuid | ID do registro criado |
| `tenant_id` | uuid | Tenant do registro |
| `user_id` | uuid | Usuário que realizou a criação via SmartGrid |
| `correlation_id` | uuid | Correlation ID propagado pela UI |
| `source` | string | `"smartgrid"` — identifica origem |
| `batch_id` | uuid | ID do lote de inclusão (permite agrupar registros de um mesmo "Salvar") |

---

## Referências

- **SEC-002:** Matriz de Autorização de Eventos (Emit/View/Notify) do SmartGrid
- **DOC-ARC-003:** Padrão de Domain Events
- **DOC-FND-000:** Contratos Fundacionais (tabela `domain_events`)

---

<!-- Enriquecimento: AGN-DEV-04 completo -->
