# Skill: validate-screen-manifest

Valida Screen Manifests YAML contra schema v1 e regras de DOC-UX-010. Verifica nomenclatura, catálogo de ações, telemetria/rastreabilidade e error mapping.

> **Caminhos:** `.agents/paths.json` | **Contexto normativo:** `.agents/context-map.json` → `validate-manifest`

> Esta skill NÃO EXECUTA código. Lê e analisa YAML estaticamente.
> Complementar a `/project:validate-openapi` (contrato da API).

## Argumento

$ARGUMENTS deve conter o caminho do manifest YAML (ex: `docs/05_manifests/screens/ux-user-001.crud.yaml`). Se não fornecido, pergunte ao usuário.

## PASSO 1: Leitura dos Normativos

Leia obrigatoriamente:
1. `docs/05_manifests/schemas/screen-manifest.v1.schema.json`
2. `docs/01_normativos/DOC-UX-010__Catalogo_Acoes_e_Template_UX.md`

## PASSO 2: EX-UX-001 — Conformidade Schema v1

| Item | Regra | Severidade |
|------|-------|------------|
| `manifest_version` | Deve ser `1` | Crítica |
| `screen_id` | Pattern `^UX-[A-Z0-9]+-[0-9]{3}$` | Crítica |
| `name` | Presente, `minLength: 2` | Crítica |
| `entity_type` | Pattern `^[a-z][a-z0-9_]*$` | Crítica |
| `routes` | Array com 1+ items (`path` + `method`) | Crítica |
| `telemetry_defaults` | `event_name`, `required_fields` (min 3), `propagate_headers` | Crítica |
| `permissions` | 1+ propriedade, formato `recurso:acao` (catálogo RBAC em DOC-FND-000 §2) | Crítica |
| `actions` | Array com 1+ item | Crítica |
| `ui_rules` | `action_visibility` e `action_enablement` | Crítica |
| `error_mapping` | `default_user_message` e `http_status` | Crítica |

## PASSO 3: EX-UX-002 — Nomenclatura

- Arquivo em `docs/05_manifests/screens/`
- Nome: `ux-{entity_type}-{seq}.{context}.yaml`
- `entity_type` do nome = `entity_type` do YAML
- Extensão `.yaml` (não `.yml`)

## PASSO 4: EX-UX-003 — Catálogo de Ações

- `action` deve pertencer ao enum de 37 ações permitidas
- Se não `client_only`, `operation_ids` deve ter 1+ item
- `permission` no formato `^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*$`

## PASSO 5: EX-UX-004 — Telemetria

- `propagate_headers` DEVE conter `X-Correlation-ID`
- `required_fields` mínimo 3 itens
- `event_name` não-vazio

## PASSO 6: EX-UX-005 — Error Mapping

- `default_user_message` obrigatório
- Status 401, 403, 422, 500 mapeados
- Mensagens NÃO expõem detalhes técnicos
- `ui.type`: toast, form_validation, modal, inline
- `ui.level`: info, warning, error, success
- 422 DEVE usar `form_validation` com `invalid_fields_path`

## Relatório

Tabela resumo por pilar (EX-UX-001 a 005), violações, notas e status final.
