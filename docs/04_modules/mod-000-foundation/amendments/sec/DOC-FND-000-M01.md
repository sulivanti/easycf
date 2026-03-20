> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento normativo em estado ACTIVE.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-FND-000-M01

- **Documento base:** [DOC-FND-000](../../../../01_normativos/DOC-FND-000__Foundation.md)
- **estado_item:** DRAFT
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-19
- **owner:** Marcos Sulivan
- **Motivação:** Registrar 6 scopes `process:case:*` do MOD-006 (Execução de Casos) no catálogo canônico DOC-FND-000 §2.2, desbloqueando o Gate CI (DOC-ARC-003B) para Screen Manifests do módulo.
- **rastreia_para:** US-MOD-006, SEC-006 §2.1, PEN-006 PENDENTE-004

---

## Detalhamento

Adicionados 6 scopes ao catálogo canônico DOC-FND-000 §2.2:

| Scope | Módulo | Descrição |
|---|---|---|
| `process:case:read` | MOD-006 | Visualizar casos, histórico, gates, responsáveis e eventos |
| `process:case:write` | MOD-006 | Abrir casos, transitar estágios, registrar eventos |
| `process:case:cancel` | MOD-006 | Cancelar caso (ação crítica separada) |
| `process:case:gate_resolve` | MOD-006 | Resolver gates (aprovar/rejeitar) |
| `process:case:gate_waive` | MOD-006 | Dispensar gate obrigatório (poder especial) |
| `process:case:assign` | MOD-006 | Atribuir e reatribuir responsáveis |

Versão DOC-FND-000 bumped: 1.3.0 → 1.4.0.

---

## Impacto nos Pilares

- **Pilares afetados:** SEC-006 (MOD-006) — referências a "scopes a registrar" podem ser atualizadas para "scopes registrados"
- **Ação requerida:** Quando PENDENTE-001 for decidida e resultar em 7º scope (`process:case:reopen`), criar DOC-FND-000-M02
