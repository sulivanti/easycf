> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento normativo/requisito em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: PKG-COD-001-C01

- **Documento base:** [PKG-COD-001](../../../02_pacotes_agentes/PKG-COD-001_Pacote_Agentes_Geracao_Codigo.md)
- **estado_item:** MERGED
- **Natureza:** C (Correção)
- **Data:** 2026-03-26
- **owner:** arquitetura
- **Motivação:** Adicionar regra anti-pattern DTO datetime em §3.4 (AGN-COD-API) para que o codegen não gere `.datetime()` em Zod response DTOs, reproduzindo bug HTTP 500.
- **rastreia_para:** DOC-GNP-00-C01 (EX-DTO-001)

---

## Detalhamento

### Adição a §3.4 AGN-COD-API — Anti-Pattern DTO Datetime

**Inserção:** Após o bloco "x-permissions" (~linha 203), antes de §3.5 AGN-COD-WEB.

**Anti-Pattern DTO Datetime (MUST NOT, EX-DTO-001):**

Em Zod schemas de response DTO, campos datetime **MUST** usar `z.string()` — **NUNCA** `z.string().datetime()`. O `serializerCompiler` do `fastify-type-provider-zod` valida estritamente o response body e `.datetime()` rejeita ISO strings retornadas pelo PostgreSQL/Drizzle, causando HTTP 500.

Ref: DOC-GNP-00 EX-DTO-001.

```typescript
// ❌ MUST NOT — causa HTTP 500
created_at: z.string().datetime()
updated_at: z.string().datetime().nullable()

// ✅ MUST — seguro para serialização
created_at: z.string()
updated_at: z.string().nullable()
```

---

## Impacto nos Pilares

- **Pilares afetados:** Nenhum adicional — esta é a cascata de DOC-GNP-00-C01 para o pacote codegen.
- **Ação requerida:** Atualizar gate de validação no codegen-agent (`.claude/commands/codegen-agent.md` §7.2) para verificar compliance.

---

## Resolução do Merge

> **Merged por:** merge-amendment em 2026-03-26
> **Versão base após merge:** 1.5.1
> **Alterações aplicadas:** Anti-pattern DTO datetime inserido em §3.4 AGN-COD-API do PKG-COD-001. Changelog atualizado.
