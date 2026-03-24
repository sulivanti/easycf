> **EMENDA** — Este arquivo altera o artefato-base sem modificá-lo diretamente.
>
> | Campo | Valor |
> |---|---|
> | Artefato-base | ux-proc-001.editor-visual.yaml |
> | Módulo | MOD-005 |
> | Versão da emenda | 0.1.0 |
> | Data | 2026-03-24 |
> | Origem | PENDENTE-014 (PEN-005) |
> | Autor | Marcos Sulivan |

# AMD-UX-PROC-001-001 — Ação update_stage_position no manifest do editor visual

## Motivação

O manifest `ux-proc-001.editor-visual.yaml` não incluía a ação `update` para mover estágios no canvas (PATCH /admin/stages/:sid com canvas_x/canvas_y). UX-005 §2.3 define essa ação e US-MOD-005-F03 lista `admin_stages_update` como operationId consumido. O operationId estava órfão — nenhuma ação do manifest o referenciava.

## Alteração

### ux-proc-001.editor-visual.yaml — `actions[]`

**Adicionado** nova ação entre `create_stage_from_canvas` e `create_transition_from_canvas`:

```yaml
- id: update_stage_position
  label: "Mover estágio no canvas (persistir posição)"
  type: submit
  operation_id: admin_stages_update
  http_method: PATCH
  endpoint: "/api/v1/admin/stages/:sid"
  requires_scope: ["process:cycle:write"]
  loading_state: none
  error_handling:
    strategy: toast
    include_correlation_id: true
    user_message: "Não foi possível salvar a posição do estágio."
  notes: "Dispara ao soltar nó após drag no canvas. Persiste canvas_x/canvas_y no estágio (DATA-005 §2.3)."
```

### ux-proc-001.editor-visual.yaml — `components[canvas-area].actions_used`

**Antes:**
```yaml
actions_used: [create_stage_from_canvas, create_transition_from_canvas,
               delete_stage_from_canvas, delete_transition_from_canvas, open_stage_config]
```

**Depois:**
```yaml
actions_used: [create_stage_from_canvas, update_stage_position, create_transition_from_canvas,
               delete_stage_from_canvas, delete_transition_from_canvas, open_stage_config]
```

## Rastreabilidade

- **PENDENTE-014** (PEN-005): ux-proc-001 missing action update
- **UX-005 §2.3**: Define a interação de reposicionamento de estágio no canvas
- **US-MOD-005-F03**: Lista `admin_stages_update` como operationId consumido
- **DATA-005 §2.3**: Define campos `canvas_x`/`canvas_y` na tabela de estágios
