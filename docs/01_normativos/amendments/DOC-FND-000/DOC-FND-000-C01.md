> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento normativo/requisito em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-FND-000-C01

- **Documento base:** [DOC-FND-000](../../DOC-FND-000__Foundation.md)
- **estado_item:** MERGED
- **Natureza:** C (Correção)
- **Data:** 2026-03-31
- **owner:** ECF Core
- **Motivação:** O scope `mcp:agent:phase2-enable` registrado no catálogo §2.2 contém hífen, violando a regex canônica `^[a-z][a-z0-9_]*(:[a-z][a-z0-9_]*){1,2}$`. Deve ser renomeado para `mcp:agent:phase2_enable` (underscore).
- **rastreia_para:** spec-fix-scope-hyphen-rename, DOC-FND-000-M04, FR-010

---

## Detalhamento

### Seção Afetada: §2.2 — Catálogo de Scopes Canônicos

**Renomear** na tabela de scopes MOD-010:

| Antes | Depois |
|---|---|
| `mcp:agent:phase2-enable` | `mcp:agent:phase2_enable` |

**Renomear** na linha de histórico v1.7.0:

| Antes | Depois |
|---|---|
| `mcp:agent:read/write/revoke/phase2-enable` | `mcp:agent:read/write/revoke/phase2_enable` |

---

## Impacto nos Pilares

- **Pilares afetados:** FR (MOD-000 seed + MOD-010 FR-010), DATA (MOD-000 CHECK constraint)
- **Ação requerida:** Amendments derivados FR-000-C10 e FR-010-C01 já criados nesta sessão.
