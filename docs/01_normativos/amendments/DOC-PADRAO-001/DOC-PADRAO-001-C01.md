> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento normativo em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-PADRAO-001-C01

- **Documento base:** [DOC-PADRAO-001](../../DOC-PADRAO-001_Infraestrutura_e_Execucao.md)
- **estado_item:** MERGED
- **Natureza:** C (Correção)
- **Data:** 2026-03-25
- **owner:** arquitetura
- **Motivação:** §4.4 "Seed Inicial" diz "role super-admin com todas as permissões" mas não referencia o catálogo canônico de scopes (DOC-FND-000 §2.2). Isso permite que o seed fique desatualizado silenciosamente quando novos scopes são registrados via amendments (ex: DOC-FND-000-M01 a M04).
- **rastreia_para:** DOC-FND-000, DOC-PADRAO-001

---

## Detalhamento

### Alteração em §4.4 — Seed Inicial (Primeiro Deploy)

**Texto atual (linha 159):**

> O seed cria: tenant padrão, role `super-admin` com todas as permissões, e usuário admin inicial.

**Texto proposto:**

> O seed cria: tenant padrão, role `super-admin` com **todos os scopes do catálogo canônico** (DOC-FND-000 §2.2), e usuário admin inicial.
>
> **Regra de consistência:** O script `db/seed-admin.ts` DEVE importar ou referenciar a lista canônica de scopes definida em DOC-FND-000 §2.2. Quando novos scopes forem registrados via amendments ao catálogo (ex: DOC-FND-000-M01…M04), o seed DEVE ser atualizado para incluí-los. A ausência de scopes no seed resulta em sidebar vazia e funcionalidades inacessíveis no primeiro deploy.

### Justificativa

Sem essa vinculação explícita, o seed pode criar um `super-admin` com array de scopes vazio ou desatualizado, causando:
1. Sidebar do AppShell sem itens de menu (BR-005 filtra por scopes)
2. ModuleShortcuts do Dashboard vazios
3. Impressão de sistema quebrado no primeiro acesso pós-deploy

---

## Impacto nos Pilares

- **Pilares afetados:** FR (seed script), SEC (permissões iniciais)
- **Ação requerida:** Atualizar `db/seed-admin.ts` para importar scopes de DOC-FND-000 §2.2 ao invés de lista hardcoded

---

## Resolução do Merge

> **Merged por:** merge-amendment em 2026-03-25
> **Versão base após merge:** DOC-PADRAO-001 v1.1.1
> **Alterações aplicadas:** §4.4 atualizado com referência ao catálogo canônico + regra de consistência de scopes
