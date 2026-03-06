---
name: validate-screen-manifest
description: Valida e gera arquivos de Screen Manifest (`.yaml`) para telas UX do projeto, garantindo conformidade com o schema v1, rastreabilidade de ações (DOC-ARC-003), permissões RBAC e catálogo de ações (DOC-UX-010). Use esta skill sempre que: criar, editar ou revisar arquivos de manifesto em `docs/05_manifests/screens/`; ao finalizar a geração de um arquivo `UX-{ID}.md` em um scaffold de módulo; quando o usuário pedir "criar manifesto de tela", "gerar screen manifest", "validar UX manifest", "criar UX-XXX-manifest", ou "o que falta no manifesto desta tela".
---

# Skill: validate-screen-manifest

## Objetivo

Validar arquivos YAML de Screen Manifest contra as regras estruturais do **schema v1** e as regras de conformidade do projeto (rastreabilidade, RBAC, catálogo de ações). Quando acionada após um scaffold de módulo, gerar o manifesto de tela inicial correspondente ao `UX-{ID}.md` criado.

> 📄 **Schema canônico:** [`screen-manifest.v1.schema.json`](../../docs/05_manifests/schemas/screen-manifest.v1.schema.json)
> 📄 **Catálogo de ações:** [`DOC-UX-010`](../../docs/01_normativos/DOC-UX-010__Catalogo_Acoes_e_Template_UX.md)
> 📄 **Rastreabilidade:** [`DOC-ARC-003`](../../docs/01_normativos/DOC-ARC-003__Ponte_de_Rastreabilidade.md)

---

## 1. Quando Usar Esta Skill

Esta skill tem dois modos de operação:

- **Modo Validação:** O usuário apresenta um manifesto existente e quer saber se está correto.
- **Modo Geração:** O usuário pede a criação de um novo manifesto (ou o `scaffold-module` invoca como passo pós-UX).

Se o modo não estiver claro pelo contexto, pergunte. Se estiver vindo do `scaffold-module`, vá direto para o Modo Geração.

---

## 2. Regras de Validação (aplicar em ambos os modos)

### 2.1 Regras Estruturais (Schema v1)

Valide cada campo obrigatório. A ausência de qualquer um é uma **Violação Crítica**:

| Campo raiz          | Obrigatoriedade | Regra                                                              |
|---------------------|-----------------|-------------------------------------------------------------------|
| `manifest_version`  | Obrigatório     | Deve ser exatamente `1` (integer)                                 |
| `screen_id`         | Obrigatório     | Padrão: `^UX-[A-Z0-9]+-[0-9]{3}$` (ex.: `UX-USER-001`)          |
| `name`              | Obrigatório     | String descritiva da tela (mínimo 2 caracteres)                   |
| `entity_type`       | Obrigatório     | `snake_case`, ex.: `user`, `invoice`, `project`                   |
| `routes`            | Obrigatório     | Array com pelo menos 1 rota (`path` + `method` HTTP válido)       |
| `telemetry_defaults`| Obrigatório     | Ver regra 2.2 abaixo                                              |
| `permissions`       | Obrigatório     | Objeto com pelo menos 1 entrada no formato `recurso:acao`         |
| `actions`           | Obrigatório     | Array com pelo menos 1 ação — ver regra 2.3                       |
| `ui_rules`          | Obrigatório     | Objeto raiz com `action_visibility` e `action_enablement`         |
| `error_mapping`     | Obrigatório     | Objeto raiz com `default_user_message` e `http_status`            |

### 2.2 Regras de Telemetria (DOC-ARC-003)

- `telemetry_defaults.propagate_headers` DEVE conter `"X-Correlation-ID"`.
  - **Violação Crítica** se ausente — quebra a rastreabilidade Front → API → Banco.
- `event_name` deve ser `snake_case`.
- `required_fields` deve ter no mínimo 3 campos.

### 2.3 Regras de Ações

Para **cada entrada** em `actions`:

| Campo          | Regra                                                                          |
|----------------|--------------------------------------------------------------------------------|
| `action`       | DEVE estar no catálogo do `DOC-UX-010`. Valor inválido = **Violação Crítica** |
| `operation_ids`| DEVE ter pelo menos 1 item, exceto quando `client_only: true`                 |
| `permissions`  | Array de strings no formato `recurso:acao` (ex.: `users:read`)                |

**Violação Alta:** `operation_ids` vazio quando `client_only` não é `true`.
**Violação Média:** `action` não está no catálogo do `DOC-UX-010`.

**Catálogo de actions válidas** (extraído do DOC-UX-010):
`view`, `filter`, `search`, `sort`, `paginate`, `create`, `update`, `delete`, `import`, `download_template`, `export`, `export_selected`, `print`, `view_kanban`, `view_gantt`, `bulk_select`, `bulk_update`, `bulk_create`, `clone`, `archive`, `unarchive`, `activate`, `deactivate`, `restore`, `comment`, `attachment_add`, `attachment_remove`, `attachment_download`, `attachment_list`, `share_manage`, `view_history`, `approve`, `reject`, `submit`, `publish`, `cancel`, `reprocess`

### 2.4 Regras de `ui_rules` por Ação (enablement inline)

Quando uma ação declara `ui_rules.action_enablement` inline (dentro do array `actions`), cada condição deve ter:

- `field`: nome do campo do registro (ex.: `status`, `deleted_at`)
- `operator`: `==`, `!=`, `in`, `not_in`, `is_null`, `is_not_null`
- `value`: valor tipado correspondente ao operador

Operadores `==`, `!=`, `in`, `not_in` exigem o campo `value`. **Violação Média** se ausente.

---

## 3. Modo Geração — Como Gerar um Manifesto

Quando solicitado a gerar um manifesto novo, siga estes passos:

### Passo A: Coletar informações mínimas

Se não estiver disponível no contexto:

- Qual é o `screen_id`? (padrão `UX-{ENTIDADE}-{SEQ}`, ex.: `UX-INVOICE-001`)
- Qual é o `entity_type`? (singular `snake_case`)
- Quais rotas esta tela consome? (ex.: `GET /invoices`, `POST /invoices`)
- Quais ações devem estar disponíveis? (selecione do catálogo UX-010)

Se vier do `scaffold-module`, extraia do arquivo `UX-{ID}.md` gerado.

### Passo B: Gerar o arquivo

Salvar em `docs/05_manifests/screens/{screen_id_lower}.{entity_type}.yaml`.
Exemplo: `ux-invoice-001.invoice-list.yaml`

Use como base o template abaixo, preenchendo todas as lacunas com dados reais (proibido deixar placeholders):

```yaml
manifest_version: 1
screen_id: "UX-XXX-001"
name: "Nome Descritivo da Tela"
entity_type: "entity_type"

routes:
  - path: "/resource"
    method: GET

telemetry_defaults:
  event_name: "entity_type.screen_viewed"
  required_fields:
    - "screen_id"
    - "tenant_id"
    - "correlation_id"
  propagate_headers:
    - "X-Correlation-ID"

permissions:
  read: "entity_type:read"
  write: "entity_type:write"

actions:
  - action: "view"
    client_only: false
    operation_ids:
      - "entity_type_list"
    permissions:
      - "entity_type:read"
    error_mapping:
      http_status: [401, 403, 500]

ui_rules:
  action_visibility:
    strategy: "hide_if_no_permission"
  action_enablement: []

error_mapping:
  default_user_message: "Ocorreu um erro inesperado. Tente novamente."
  http_status:
    "401":
      user_message: "Sessão expirada. Faça login novamente."
      ui:
        type: "modal"
        level: "error"
    "403":
      user_message: "Você não tem permissão para executar esta ação."
      ui:
        type: "toast"
        level: "error"
    "500":
      user_message: "Erro interno do servidor. Contate o suporte."
      ui:
        type: "toast"
        level: "error"
```

### Passo C: Validar o arquivo gerado

Após gerar, execute imediatamente as validações da Seção 2 sobre o arquivo criado. Se houver violações, corrija antes de reportar ao usuário.

---

## 4. Output Format

### ✅ Quando válido (ou gerado com sucesso)

```text
✅ Screen Manifest válido: UX-USER-001 (docs/05_manifests/screens/ux-user-001.users-list.yaml)
- 11 ações mapeadas
- Rastreabilidade: X-Correlation-ID presente ✓
- Permissões RBAC: formato correto ✓
```

### ❌ Quando há violações

```text
❌ Screen Manifest com violações: UX-USER-001

VIOLAÇÕES CRÍTICAS (bloqueantes):
  [C1] Campo obrigatório ausente: `manifest_version` — adicione `manifest_version: 1` no topo do arquivo.
  [C2] `telemetry_defaults.propagate_headers` não contém "X-Correlation-ID" — violação DOC-ARC-003.

VIOLAÇÕES ALTAS:
  [A1] Ação `import`: `operation_ids` está vazio e `client_only` não é true — toda ação de backend DEVE referenciar ao menos um operationId do OpenAPI.

VIOLAÇÕES MÉDIAS:
  [M1] Ação `sync`: não está no catálogo DOC-UX-010. Use uma das ações válidas ou solicite extensão do catálogo.
```

---

## 5. Gate de Módulo (pós-scaffold)

Quando invocado pelo `scaffold-module` após geração de um módulo com telas UX:

1. Verificar se existe ao menos 1 arquivo em `docs/05_manifests/screens/` com `screen_id` contendo o código do módulo.
2. Se não existir, gerar o manifesto inicial automaticamente (Modo Geração — Passo A a C).
3. Reportar no sumário final do scaffold: `UX Manifest: ux-{module}-001.{entity}.yaml criado em docs/05_manifests/screens/`.
