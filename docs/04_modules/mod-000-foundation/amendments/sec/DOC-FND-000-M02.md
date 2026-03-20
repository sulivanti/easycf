> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento normativo em estado ACTIVE.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-FND-000-M02

- **Documento base:** [DOC-FND-000](../../../../01_normativos/DOC-FND-000__Foundation.md)
- **estado_item:** DRAFT
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-19
- **owner:** Marcos Sulivan
- **Motivação:** Adicionar 7º scope `process:case:reopen` ao catálogo canônico DOC-FND-000 §2.2. Total: 7 scopes `process:case:*`. Decisão de PEN-006 PENDENTE-001 (Opção B — scope dedicado para reabertura).
- **rastreia_para:** PEN-006 PENDENTE-001, BR-016, FR-007

---

## Detalhamento

Adicionado scope ao catálogo canônico DOC-FND-000 §2.2:

| Scope | Módulo | Descrição |
|---|---|---|
| `process:case:reopen` | MOD-006 | Reabrir caso COMPLETED (ação excepcional auditada) |

Total de scopes `process:case:*` no catálogo: **7** (read, write, cancel, gate_resolve, gate_waive, assign, reopen).

Versão DOC-FND-000 bumped: 1.4.0 → 1.5.0.

---

## Impacto nos Pilares

- **Pilares afetados:** SEC-006 (MOD-006) — atualizar referências de "escopo a definir" para `process:case:reopen`; SEC-002 (MOD-006) — adicionar entrada na matriz de autorização para REOPENED; mod.md §1.2 — adicionar persona com scope reopen
- **Ação requerida:** Editar SEC-006, SEC-002, BR-016 e FR-007 para referenciar `process:case:reopen` ao invés de "escopo especial (a definir)"
