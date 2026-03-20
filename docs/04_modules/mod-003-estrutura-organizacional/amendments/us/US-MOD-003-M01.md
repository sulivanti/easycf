> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento base em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: US-MOD-003-M01

- **Documento base:** [US-MOD-003](../../../user-stories/epics/US-MOD-003.md)
- **estado_item:** DRAFT
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-17
- **owner:** arquitetura
- **Motivação:** Incluir US-MOD-003-F04 (Restore de Unidade Organizacional) na estrutura do épico — tree view §8, tabela de sub-histórias §8 e endpoint `PATCH /org-units/:id/restore` na tabela de endpoints §10.
- **rastreia_para:** US-MOD-003, US-MOD-003-F04, PENDENTE-001

---

## Detalhamento

### §8 — Tree View (adição)

```text
US-MOD-003  (épico) ← Governança / Índice
  ├── US-MOD-003-F01  ← API Core — CRUD + Tree Query + Vinculação N5
  ├── US-MOD-003-F02  ← Árvore Organizacional (UX-ORG-001)
  ├── US-MOD-003-F03  ← Formulário de Nó Organizacional (UX-ORG-002)
  └── US-MOD-003-F04  ← Restore de Unidade Organizacional (Backend + UX)
```

### §8 — Tabela de Sub-Histórias (adição de linha)

| Sub-História | Tema | Tipo | Status |
|---|---|---|---|
| US-MOD-003-F04 | Restore de Unidade Organizacional | **Backend + UX** | `TODO` |

### §10 — Tabela de Endpoints (adição de linha)

| Método | Path | operationId | Scope | Descrição |
|---|---|---|---|---|
| PATCH | /api/v1/org-units/:id/restore | `org_units_restore` | `org:unit:write` | Restaurar nó soft-deleted |

---

## Impacto nos Pilares

- **Pilares afetados:** FR (FR-004 já documentado), BR (BR-009 já documentado), DATA (DATA-003 já inclui evento), SEC (SEC-002 já inclui evento), UX (UX-ORG-001 recebe toggle + menu contextual)
- **Ação requerida:** Nenhuma — os pilares já contemplam o restore via enriquecimento prévio. Esta emenda apenas alinha o épico com o estado atual da especificação.
