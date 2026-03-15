# DOC-ARC-003B — Manifestos Declarativos e Gates de CI

- **id:** DOC-ARC-003B
- **version:** 1.0.0
- **status:** READY
- **data_ultima_revisao:** 2026-03-14
- **owner:** arquitetura
- **scope:** global (Screen Manifests, Gates CI)
- **supersedes:** DOC-ARC-003 §8–§9

> **Origem:** Este documento foi extraído do DOC-ARC-003 (§8 e §9) para reduzir a densidade do documento original e separar responsabilidades. As regras de rastreabilidade (UI ↔ API ↔ Domain) permanecem em `DOC-ARC-003`.

---

## 1. Gates de Validação em CI (Qualidade Assegurada)

Para impedir débitos técnicos e garantir que os manifestos declarativos funcionem de ponta a ponta, o CI deve implementar as seguintes regras práticas (O "Pacote Pronto"):

1. **Gate 1 — Manifest válido (schema):** Falha se algum YAML/JSON não validar o schema esperado (ex. ferramentas típicas como *ajv* ou *jsonschema*).
2. **Gate 2 — Action não-client_only precisa ter operationId:** Para cada action mapeada, se `client_only != true`, a action MUST possuir `operation_ids.length >= 1`.
3. **Gate 3 — permission usada precisa existir no catálogo RBAC:** O manifest usa permissões (ex. `users:read`, `users:write`). Falha se alguma delas não estiver registrada no catálogo canônico de permissões (DOC-FND-000 §2).
4. **Gate 4 — operationId do manifest precisa existir no OpenAPI:** Falha se algum `operation_id` mapeado no manifest (`client_only: false`) não for encontrado no arquivo base do Swagger/OpenAPI.
5. **Gate 5 — X-Correlation-ID obrigatório em actions que chamam API:** Se a action referenciar `operation_ids`, seu `telemetry_defaults.propagate_headers` MUST conter a injeção do `X-Correlation-ID`.
6. **Gate 6 — Consistência Import/Export como Job:** Se o manifest empregar as actions `import` ou `export`, exige-se imperativamente que exista a rota de polling equivalente (`jobs_get`) no OpenAPI. (Recomendado o `jobs_download_result` para export).
7. **Gate 7 — Error mapping mínimo RFC 9457:** O array de mapeamento de falhas da UI (`error_mapping.http_status`) de toda action ativa na API *deve incluir no mínimo:* `401`, `403`, `409`, `422` e `500`.
8. **Gate 8 — Meta schema sem PII por padrão:** Para estancar vazamento de dados em log, falha caso um campo não autorizado do metadata constar flag `pii: true` desautorizada.
9. **Gate 9 — Enablement rules só referem campos conhecidos da Entidade:** Valida se as regras visíveis do Frontend (`ui_rules.action_enablement[].enabled_when.*[].field`) referenciam campos ativamente modelados na Entidade de Banco atrelada (ex. `DATA-USER` enumerando `status`, `deleted_at`, impedindo regras fantasmas na UI).

---

## 2. Manifestos Declarativos e MVP: Caso de Referência ("Usuários")

### A. Referência da Entidade do Banco (`data_users`)

Campos Fixos: `id`, `codigo`, `status`, `tenant_id`, `created_at`, `updated_at`, `deleted_at`.

### B. Mapeamento de Extensão (Domain Bridge Catalog)

| Domain Event | Origem Cmd | UI Actions (UX-010) | operation_ids | Emit Perm. | Padrão Leitura (View) | Masking Sensitivity | Payload Policy (Snapshot Mínimo) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `user.created` | `users:create` | `create` | `users_create` | `users:write` | `canRead` & `tenantMatch` | 2 | `user_id, codigo, status, created_by` |
| `user.updated` | `users:update` | `update` | `users_update` | `users:write` | `canRead` & `tenantMatch` | 2 | `user_id, changed_fields: []` |
| `user.archived` | `users:archive` | `archive` | `users_archive` | `users:write` | `canRead` & `tenantMatch` | 1 | `user_id, archived_at` |
| `user.restored` | `users:restore` | `restore` / `unarchive` | `users_restore` | `users:write` | `canRead` & `tenantMatch` | 1 | `user_id, restored_at` |
| `user.activated` | `users:activate`| `activate` | `users_activate`| `users:write` | `canRead` & `tenantMatch` | 1 | `user_id, status="ACTIVE"` |
| `user.deactivated`| `users:deact.`| `deactivate`| `users_deactivate`| `users:write` | `canRead` & `tenantMatch` | 1 | `user_id, status="INACTIVE", reason_code` |
| `user.roles_a*`| `users:roles`| `update` | `users_role_assign`| `users:write` | `canRead` & `tenantMatch` | 1 | `user_id, added_role_ids: []` |
| `user.roles_r*`| `users:roles`| `update` | `users_role_remove`| `users:write` | `canRead` & `tenantMatch` | 1 | `user_id, removed_role_ids: []` |
| `user.pwd_req`| `users:reset`| `submit` | `users_pwd_reset_req`| `users:write` | `canRead` & `tenantMatch` | 2 | `user_id, channel="email"` (sem token) |

**C. Eventos de Job Referência** (`users_import_job_create`)
Eventos: `import.job_created`, `import.job_completed`, `import.job_failed`. Payload livre de PII, reportando unicamente `job_id, file_ref, process_counts`.

### D. Screen Manifests

**UX-USER-001 (Lista Mestra)**
**Objetivo Visual:** Listar com filtros e permitir Ações Grid/Bulk e Jobs.
**Eventos Esperados de Falha RFC 9457 UI:** 422 para os Forms/import; 409 para Código Existente; 403 para Sem Permissão.

| Action (do Catálogo UX-010) | Comportamento Requerido da Tela | operationId OpenAPI | Permissão Mínima |
| --- | --- | --- | --- |
| `view`, `search`, `filter`, `sort`, `paginate` | Listar; Parametrizadores em Query (`q`, `status`, `role_id`) e paginação no Backend. | `users_list` | `users:read` |
| `create` | Acionamento Bottom/Header; Invoca Modal. Retorno de `422` pinta Label de erro inline. | `users_create` | `users:write` |
| `activate/deactivate/archive/restore` | Menu de linha ("3 pontinhos"). Botões que cruzam estado atual (status da linha da query = DISABLED). | `users_activate` etc | `users:write` |
| `bulk_select`, `bulk_update` | Grid View Master. Seleciona `IDs` múltiplos, aplica form sobre coleção. | `users_bulk_upd_*` | `users:write` |
| `import`, `download_template`, `reprocess`| Fluxos orientados a UX de Job. Renderização forçada em `Disabled: Processando`. | `users_import_*` | `users:import` |
| `export`, `export_selected` | Fluxos p/ Jobs visando filtragem p/ extração. Gera File-Blob final. | `users_export_*` | `users:export` |

**UX-USER-002 (Detalhe e Edição Geral)**
**Objetivo Visual:** Ver Formulário detalhado, linha do tempo centralizada e status de transição de um ator focado.

| Action (do Catálogo UX-010) | Comportamento Requerido da Tela | operationId OpenAPI | Permissão Mínima |
| --- | --- | --- | --- |
| `view`, `update` | Form isolado. Get para preencher DTO UI e Update restritivo (comportamento 409 Conflito email/código). | `users_get` & `users_update` | `users:read` / `users:write` |
| `activate/deactivate/archive/restore` | Comutação contextual do Botão de Estado Topo da Tela com base nativa. | `users_activate` etc | `users:write` |
| `comment`, `attachment_*` | Blocos/Tabs Adicionais na Base. UI manipula coleção satélite. | `user_comment_*` etc | `users:comment` etc |
| `view_history` | Aba Central de Audit/Timeline. Retorna `domain_events_...` (Filtrada p/ Masking). | `domain_events_list_by_entity` | `audit:read` (ver DOC-ARC-003 §4.4) |

---

## Metadados

**Changelog:**
- `1.0.0` (2026-03-14): Documento extraído do DOC-ARC-003 §8–§9 para separação de responsabilidades.
