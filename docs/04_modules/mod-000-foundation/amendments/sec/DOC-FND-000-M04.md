> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - Emenda sobre documento normativo em estado ACTIVE.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-FND-000-M04

- **Documento base:** [DOC-FND-000](../../../../01_normativos/DOC-FND-000__Foundation.md)
- **estado_item:** DRAFT
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-19
- **owner:** Marcos Sulivan
- **Motivação:** Registrar 6 scopes `mcp:*` do MOD-010 (MCP e Automação Governada) no catálogo canônico DOC-FND-000 §2.2. Sem esses scopes, o RBAC do Foundation não reconhece permissões MCP e todos os endpoints admin retornam 403. Deploy do MOD-010 bloqueado até este amendment ser aplicado.
- **rastreia_para:** PEN-010 PENDENTE-004, INT-010 INT-005, SEC-010, US-MOD-010

---

## Detalhamento

Adicionados 6 scopes ao catálogo canônico DOC-FND-000 §2.2:

| Scope | Módulo | Descrição |
|---|---|---|
| `mcp:agent:read` | MOD-010 | Visualizar agentes MCP e detalhes |
| `mcp:agent:write` | MOD-010 | Criar e editar agentes MCP |
| `mcp:agent:revoke` | MOD-010 | Revogar agentes MCP (irreversível) |
| `mcp:agent:phase2-enable` | MOD-010 | Habilitar Phase 2 create para agente individual |
| `mcp:key:rotate` | MOD-010 | Rotacionar API key de agente MCP |
| `mcp:execution:read` | MOD-010 | Visualizar log de execuções MCP |

Versão DOC-FND-000 bumped: 1.6.0 → 1.7.0.

---

## Impacto nos Pilares

- **Pilares afetados:** SEC-010 (MOD-010) — referências a "Amendment MOD-000-F12 pendente" atualizadas para "scopes registrados"; INT-010 INT-005 — dependência de amendment satisfeita; mod-010 mod.md §8 — scopes agora existem no catálogo canônico
- **Ação requerida:** Nenhuma — os artefatos MOD-010 já referenciam os scopes corretamente. Gate CI (DOC-ARC-003B) agora passa para Screen Manifests do MOD-010.
- **Migration SQL:** INSERT dos 6 scopes na tabela `scopes` do MOD-000 deve ser incluído no PR de deploy do MOD-010.
