> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento normativo em estado ACTIVE.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-FND-000-M03

- **Documento base:** [DOC-FND-000](../../../../01_normativos/DOC-FND-000__Foundation.md)
- **estado_item:** DRAFT
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-19
- **owner:** Marcos Sulivan
- **Motivação:** Registrar 7 scopes `approval:*` do MOD-009 (Movimentos sob Aprovação) no catálogo canônico DOC-FND-000 §2.2, desbloqueando o Gate CI (DOC-ARC-003B) para Screen Manifests do módulo. Sem esses scopes, todos os endpoints MOD-009 retornam 403.
- **rastreia_para:** PEN-009 PEN-009-002, SEC-009 §2, INT-009 §8, US-MOD-009

---

## Detalhamento

Adicionados 7 scopes ao catálogo canônico DOC-FND-000 §2.2:

| Scope | Módulo | Descrição |
|---|---|---|
| `approval:rule:read` | MOD-009 | Visualizar regras de controle e alçadas |
| `approval:rule:write` | MOD-009 | Criar e editar regras de controle e alçada |
| `approval:engine:evaluate` | MOD-009 | Avaliar operação no motor de controle (usado por módulos chamadores) |
| `approval:movement:read` | MOD-009 | Visualizar movimentos controlados |
| `approval:movement:write` | MOD-009 | Cancelar movimentos (pelo solicitante) |
| `approval:decide` | MOD-009 | Aprovar ou reprovar movimentos no inbox |
| `approval:override` | MOD-009 | Override com justificativa obrigatória |

Versão DOC-FND-000 bumped: 1.5.0 → 1.6.0.

---

## Impacto nos Pilares

- **Pilares afetados:** SEC-009 (MOD-009) — referências a "scopes a registrar via MOD-000-F12" atualizadas para "scopes registrados"; INT-009 §8 — scopes agora existem no catálogo canônico
- **Ação requerida:** Nenhuma — os artefatos MOD-009 já referenciam os scopes corretamente. Gate CI (DOC-ARC-003B) agora passa para Screen Manifests do MOD-009.
- **Migration SQL:** INSERT dos 7 scopes na tabela `scopes` do MOD-000 deve ser incluído no PR de deploy do MOD-009.
