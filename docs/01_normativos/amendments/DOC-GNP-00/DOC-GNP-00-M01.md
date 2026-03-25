> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento normativo em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-GNP-00-M01

- **Documento base:** [DOC-GNP-00](../../DOC-GNP-00__DOC-CEE-00__DOC-CHE-00__Consolidado_v2.0.md)
- **estado_item:** MERGED
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-25
- **owner:** arquitetura
- **Motivação:** No primeiro deploy, o build Docker falhou por ausência de entry points (`src/index.ts`, `drizzle.config.ts`). O normativo não definia explicitamente quais artefatos são obrigatórios por workspace — cada desenvolvedor assumia que o scaffold os criaria. Necessário definir gate de build explícito com lista de artefatos mínimos.
- **rastreia_para:** DOC-GNP-00, DOC-PADRAO-001 §4.2, DOC-UX-011 §2.2, DOC-UX-012 §5.3

---

## Detalhamento

### Nova seção: §2.1 — Artefatos Obrigatórios por Workspace (Gate de Build)

Todo workspace DEVE ter seus artefatos mínimos presentes antes de merge na branch principal. A ausência impede o build Docker e o deploy.

#### Workspace `apps/api/`

| Artefato | Obrigatório | Descrição |
|----------|-------------|-----------|
| `src/index.ts` | ✅ | Entry point Fastify. Referenciado pelo `build` script. Sem ele, `tsup` falha. |
| `drizzle.config.ts` | ✅ | Configuração do Drizzle Kit. Sem ele, `drizzle-kit push` e `drizzle-kit generate` falham. |
| `db/schema/index.ts` | ✅ | Barrel export de todos os schemas Drizzle. Referenciado pelo `drizzle.config.ts`. |
| `db/seed-admin.ts` | ✅ | Seed script para criar admin + tenant + role iniciais no primeiro deploy. |

#### Workspace `apps/web/`

| Artefato | Obrigatório | Descrição |
|----------|-------------|-----------|
| `index.html` | ✅ | Entry point do Vite. Sem ele, `vite build` falha. |
| `src/main.tsx` | ✅ | Bootstrap React com auth context inicializado do localStorage (DOC-UX-012 §5.3). |
| `src/routes/index.tsx` | ✅ | Rota raiz `/` com redirect para `/login` ou `/dashboard` (DOC-UX-011 CA-08). |
| `src/routes/login.tsx` | ✅ | Rota de login importando `LoginPage` do módulo foundation — NÃO inline (DOC-UX-011 CA-07). |

---

## Impacto nos Pilares

- **Pilares afetados:** FR (artefatos obrigatórios), NFR (build gate)
- **Módulos impactados:** MOD-000 (API entry points), MOD-001 (web entry points), todos os módulos (gate transversal)
- **Ação requerida:**
  1. Verificar existência dos 4 artefatos API: `src/index.ts`, `drizzle.config.ts`, `db/schema/index.ts`, `db/seed-admin.ts`
  2. Verificar existência dos 4 artefatos Web: `index.html`, `src/main.tsx`, `src/routes/index.tsx`, `src/routes/login.tsx`
  3. `/app-scaffold` e `/codegen` devem garantir criação desses artefatos

---

## Resolução do Merge

> **Merged por:** merge-amendment (selo retroativo) em 2026-03-25
> **Versão base após merge:** DOC-GNP-00 v2.1.0
> **Alterações aplicadas:** Nova §2.1 Artefatos Obrigatórios por Workspace (gate de build) — conteúdo incorporado no base doc durante o primeiro deploy
