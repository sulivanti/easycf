---
name: validate-screen-manifest
description: Valida Screen Manifests YAML contra o schema v1 (screen-manifest.v1.schema.json) e as regras de DOC-UX-010 (Catalogo de Acoes e Template UX). Verifica nomenclatura, catalogo de acoes, telemetria/rastreabilidade (DOC-ARC-003) e error mapping (DOC-UX-012). Triggers: "validar manifesto", "verificar screen manifest", "revisar UX manifest", "validar manifest da tela", ou automaticamente apos criacao/edicao de YAML em docs/05_manifests/screens/.
---

# Skill: validate-screen-manifest

## Objetivo

Atuar como auditor de Screen Manifests UX. Esta skill realiza **analise estatica** dos arquivos
YAML em `docs/05_manifests/screens/` verificando conformidade com cinco pilares obrigatorios
definidos em `DOC-UX-010`, `DOC-ARC-003` e `DOC-UX-012`:

1. **EX-UX-001** — Conformidade com JSON Schema v1
2. **EX-UX-002** — Nomenclatura e localizacao
3. **EX-UX-003** — Catalogo de acoes (DOC-UX-010)
4. **EX-UX-004** — Telemetria e rastreabilidade (DOC-ARC-003)
5. **EX-UX-005** — Error mapping e UX feedback (DOC-UX-012)

> [!WARNING]
> Esta skill **NAO EXECUTA** codigo, **NAO SOBE** servidores e **NAO FAZ** deploy.
> Ela le e analisa arquivos YAML estaticamente contra o schema e os normativos.

Esta skill e **complementar** a `validate-openapi-contract`: enquanto aquela verifica o contrato
YAML da API, esta verifica o contrato declarativo de tela (Screen Manifest).

---

## 1. Gatilhos de Ativacao

- "validar manifesto"
- "verificar screen manifest"
- "revisar UX manifest"
- "validar manifest da tela [nome]"
- "checar EX-UX"
- **Uso Automatico Obrigatorio:** Sempre que um Screen Manifest for criado ou modificado,
  execute esta skill antes de encerrar a sessao de trabalho.

---

## 2. Parametros de Execucao

Antes de iniciar, confirme com o usuario (ou extraia do contexto):

- **Arquivo(s) alvo:** caminho(s) do(s) manifest(s) YAML (ex: `docs/05_manifests/screens/ux-user-001.crud.yaml`)
- **Escopo da validacao:** `completa` (todos os pilares) ou pilares especificos (ex: `EX-UX-001,EX-UX-003`)

---

## 3. PASSO 1: Leitura dos Normativos (Obrigatorio)

**PARE.** Antes de validar qualquer arquivo, leia obrigatoriamente:

1. `docs/05_manifests/schemas/screen-manifest.v1.schema.json` — JSON Schema canonico
2. `docs/01_normativos/DOC-UX-010__Catalogo_Acoes_e_Template_UX.md` — Regras de acoes, nomenclatura e template

Extraia e internalize:
- Campos obrigatorios do schema (10 campos required no root)
- Patterns de `screen_id` (`^UX-[A-Z0-9]+-[0-9]{3}$`) e `entity_type` (`^[a-z][a-z0-9_]*$`)
- Catalogo de 37 acoes permitidas no enum `action_entry.action`
- Regras de telemetria (`propagate_headers` MUST incluir `X-Correlation-ID`)
- Regras de error_mapping (`default_user_message` obrigatorio)

---

## 4. PASSO 2: Validacao EX-UX-001 — Conformidade com JSON Schema v1

Leia o arquivo YAML alvo usando sua ferramenta de leitura de arquivo.

Verifique os seguintes itens contra o schema `screen-manifest.v1.schema.json`:

| Item | Regra | Severidade |
|------|-------|------------|
| `manifest_version` | Deve ser `1` (inteiro, const) | Critica |
| `screen_id` | Presente e conforme pattern `^UX-[A-Z0-9]+-[0-9]{3}$` | Critica |
| `name` | Presente, `minLength: 2` | Critica |
| `entity_type` | Presente e conforme pattern `^[a-z][a-z0-9_]*$` | Critica |
| `routes` | Array com ao menos 1 item, cada item com `path` e `method` | Critica |
| `telemetry_defaults` | Objeto com `event_name`, `required_fields` (min 3), `propagate_headers` | Critica |
| `permissions` | Objeto com ao menos 1 propriedade, valores no formato `recurso:acao` | Critica |
| `actions` | Array com ao menos 1 item | Critica |
| `ui_rules` | Objeto com `action_visibility` e `action_enablement` | Critica |
| `error_mapping` | Objeto com `default_user_message` e `http_status` | Critica |
| Campos extras | `additionalProperties: false` no root — campos nao declarados sao proibidos (exceto `linked_stories`) | Moderada |
| `linked_stories` | Se presente, array de strings conforme pattern `^US-[A-Z0-9]+-[A-Z0-9]+(-F[0-9]+)?$` | Moderada |

---

## 5. PASSO 3: Validacao EX-UX-002 — Nomenclatura e Localizacao

Verifique as convencoes de nomenclatura e organizacao:

| Item | Regra | Severidade |
|------|-------|------------|
| Localizacao do arquivo | DEVE estar em `docs/05_manifests/screens/` | Critica |
| Nome do arquivo | DEVE seguir o padrao `ux-{entity_type}-{seq}.{context}.yaml` | Critica |
| Coerencia screen_id vs nome | O `entity_type` extraido do nome do arquivo DEVE corresponder ao `entity_type` no YAML | Critica |
| Sequenciador `{seq}` | DEVE ser numerico de 3 digitos (ex: `001`, `002`) | Moderada |
| Entity types reservados | Para manifestos de infra/shell: `auth`, `shell`, `dashboard` sao entity_types validos | Informativa |
| Extensao | DEVE ser `.yaml` (nao `.yml`) | Moderada |

**Exemplos validos:**
- `ux-user-001.crud.yaml` → `screen_id: UX-USER-001`, `entity_type: user`
- `ux-auth-001.login.yaml` → `screen_id: UX-AUTH-001`, `entity_type: auth`
- `ux-shell-001.app-shell.yaml` → `screen_id: UX-SHELL-001`, `entity_type: shell`

---

## 6. PASSO 4: Validacao EX-UX-003 — Catalogo de Acoes (DOC-UX-010)

Para cada entrada no array `actions`, verifique:

| Item | Regra | Severidade |
|------|-------|------------|
| `action` no catalogo | O valor DEVE pertencer ao enum de 37 acoes do schema (view, filter, search, sort, paginate, create, update, delete, import, download_template, export, export_selected, print, view_kanban, view_gantt, bulk_select, bulk_update, bulk_create, clone, archive, unarchive, activate, deactivate, restore, comment, attachment_add, attachment_remove, attachment_download, attachment_list, share_manage, view_history, approve, reject, submit, publish, cancel, reprocess) | Critica |
| `operation_ids` nao-vazio | Se `client_only` nao e `true`, `operation_ids` DEVE ter ao menos 1 item | Critica |
| `client_only` + `operation_ids` | Se `client_only: true`, `operation_ids` PODE ser vazio | Informativa |
| `permission` formato | DEVE seguir pattern `^[a-z][a-z0-9_]*:[a-z][a-z0-9_]*$` (ex: `users:read`) | Critica |
| Acoes de escrita rastreavels | Acoes de escrita (create, update, delete, import, bulk_update, bulk_create, approve, reject, submit, publish, cancel) DEVEM mapear para `operation_ids` rastreavels no OpenAPI | Moderada |
| `meta_schema` valido | Se presente, DEVE ter `fields` array com itens contendo `name`, `type`, `pii` | Moderada |

---

## 7. PASSO 5: Validacao EX-UX-004 — Telemetria e Rastreabilidade (DOC-ARC-003)

Verifique as regras de telemetria e correlacao:

| Item | Regra | Severidade |
|------|-------|------------|
| `propagate_headers` inclui `X-Correlation-ID` | O array `telemetry_defaults.propagate_headers` DEVE conter `"X-Correlation-ID"` (enforced pelo schema via `contains`) | Critica |
| `required_fields` minimo 3 | O array `telemetry_defaults.required_fields` DEVE ter ao menos 3 campos | Critica |
| `event_name` presente | `telemetry_defaults.event_name` DEVE ser nao-vazio | Critica |
| Rastreabilidade de escrita | Acoes de escrita (create, update, delete, import, bulk_*) DEVEM ter `operation_ids` mapeados para endpoints rastreavels — idealmente com `operationId` correspondente no OpenAPI | Moderada |

---

## 8. PASSO 6: Validacao EX-UX-005 — Error Mapping e UX Feedback (DOC-UX-012)

Verifique as regras de mapeamento de erros e feedback ao usuario:

| Item | Regra | Severidade |
|------|-------|------------|
| `default_user_message` presente | `error_mapping.default_user_message` DEVE existir como fallback para erros nao mapeados | Critica |
| HTTP status comuns mapeados | Os status 401, 403, 422 e 500 DEVEM ter entradas em `error_mapping.http_status` | Moderada |
| `user_message` user-friendly | Mensagens NAO devem expor detalhes tecnicos (stack traces, nomes de tabelas, queries SQL) | Critica |
| `ui.type` valido | DEVE ser um de: `toast`, `form_validation`, `modal`, `inline` | Critica |
| `ui.level` valido | DEVE ser um de: `info`, `warning`, `error`, `success` | Critica |
| 422 com `form_validation` | O status 422 DEVE usar `ui.type: form_validation` e ter `invalid_fields_path` definido | Moderada |
| Mensagem de erro 401 | NAO deve revelar se o usuario existe (user enumeration prevention) | Critica |

---

## 9. Relatorio de Saida

Emita o relatorio no seguinte formato:

```
## Relatorio de Validacao Screen Manifest — {screen_id} — {Data}

### Resumo Executivo
| Pilar          | Status | Violacoes |
|----------------|--------|-----------|
| EX-UX-001 (Schema v1)           | OK/NOK | N |
| EX-UX-002 (Nomenclatura)        | OK/NOK | N |
| EX-UX-003 (Catalogo de Acoes)   | OK/NOK | N |
| EX-UX-004 (Telemetria)          | OK/NOK | N |
| EX-UX-005 (Error Mapping)       | OK/NOK | N |

### Violacoes Criticas
[Lista numerada: pilar, campo/path no YAML, descricao, correcao recomendada]

### Violacoes Moderadas
[Lista]

### Notas Informativas
[Observacoes opcionais sobre boas praticas]

### Status Final
[ ] Manifest aprovado para uso em geracao de codigo
[ ] Pendente correcoes criticas listadas acima
```

---

## Referencias Normativas

- `docs/05_manifests/schemas/screen-manifest.v1.schema.json` — JSON Schema canonico v1
- `docs/01_normativos/DOC-UX-010__Catalogo_Acoes_e_Template_UX.md` — Catalogo de acoes e regras de template UX
- `docs/01_normativos/DOC-ARC-003__Ponte_de_Rastreabilidade.md` — Telemetria, X-Correlation-ID
- `docs/01_normativos/DOC-UX-012__Tratamento_de_Erros_UX.md` — Error mapping e feedback UX (se existir)
