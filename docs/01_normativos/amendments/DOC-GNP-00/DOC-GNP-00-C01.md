> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento normativo/requisito em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-GNP-00-C01

- **Documento base:** [DOC-GNP-00](../../DOC-GNP-00__DOC-CEE-00__DOC-CHE-00__Consolidado_v2.0.md)
- **estado_item:** MERGED
- **Natureza:** C (Correção)
- **Data:** 2026-03-26
- **owner:** arquitetura
- **Motivação:** Adicionar exemplo canônico EX-DTO-001 que proíbe `.datetime()` em Zod response DTOs. O `serializerCompiler` do `fastify-type-provider-zod` valida estritamente o response body e rejeita ISO strings com timezone offsets ou precisão de microssegundos retornadas pelo PostgreSQL/Drizzle, causando HTTP 500.
- **rastreia_para:** commits c59ce8a, 1730239 (hotfixes org-units e users)

---

## Detalhamento

### EX-DTO-001 — Campos datetime em Zod Response DTOs (MUST)

**Inserção:** Após EX-DB-001 (~linha 451 do DOC-GNP-00), antes de EX-NAME-001.

Em Zod schemas usados como response DTO (registrados via `fastify-type-provider-zod`), campos datetime **MUST** usar `z.string()`. **MUST NOT** usar `z.string().datetime()`.

**Motivo:** O `serializerCompiler` valida estritamente o response body. `.datetime()` rejeita ISO strings com timezone offsets ou precisão de microssegundos retornadas pelo PostgreSQL/Drizzle, causando HTTP 500.

```typescript
// ❌ Anti-pattern — causa HTTP 500 em runtime
const ResponseDTO = z.object({
  created_at: z.string().datetime(),
  updated_at: z.string().datetime().nullable(),
});

// ✅ Correto — z.string() aceita qualquer formato ISO retornado pelo DB
const ResponseDTO = z.object({
  created_at: z.string(),
  updated_at: z.string().nullable(),
});
```

**Escopo:** Apenas response DTOs (serialização). Para request DTOs (input validation), `.datetime()` pode ser usado se validação strict for desejada.

---

## Impacto nos Pilares

- **Pilares afetados:** PKG-COD-001 (agentes codegen §3.4 AGN-COD-API)
- **Ação requerida:** Adicionar regra anti-pattern DTO datetime em PKG-COD-001 §3.4 para que o codegen não reproduza o bug. Amendment PKG-COD-001-C01 necessário.

---

## Resolução do Merge

> **Merged por:** merge-amendment em 2026-03-26
> **Versão base após merge:** 2.1.1
> **Alterações aplicadas:** Novo EX-DTO-001 inserido após EX-DB-001 no DOC-GNP-00. Header do anexo aditivo atualizado.
