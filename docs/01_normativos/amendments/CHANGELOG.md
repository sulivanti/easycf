> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> Atualizado por `/create-amendment` (PASSO 4a) e `/merge-amendment`.

# CHANGELOG — Amendments de Documentos Normativos

Trilha de auditoria dos amendments transversais que residem em `docs/01_normativos/amendments/`.
Documentos normativos não pertencem a módulos — este CHANGELOG substitui o PASSO 4 de módulo.

---

## Histórico de Versões

| Versão | Data | Responsável | Descrição |
|--------|------|-------------|-----------|
| 0.19.0 | 2026-03-26 | merge-amendment | Merge DOC-UX-011-M04: nova §2.2 Identidade Visual A1 no AppShell. DOC-UX-011 v1.5.0. Topbar dark, sidebar branca, accent laranja, skeleton states. |
| 0.18.0 | 2026-03-26 | merge-amendment | Merge DOC-UX-013-M01: tokens A1 brand + text hierarchy em §2.1, escala tipografica A1 em §2.2, excecao SVG inline em §3.4. DOC-UX-013 v1.2.0. |
| 0.17.0 | 2026-03-26 | create-amendment | Criacao DOC-UX-011-M04: redesign AppShell A1 — topbar dark #111, sidebar branca w-220 accent laranja, content bg #F5F5F3, skeleton states A1. Ref: Ux-Paginas.md, DOC-UX-013-M01. |
| 0.16.0 | 2026-03-26 | create-amendment | Criacao DOC-UX-013-M01: design tokens A1 — cores brand (#F58C32, #111111, #F5F5F3, #E8E8E6), hierarquia de texto (6 niveis), tipografia display (Plus Jakarta Sans), excecao SVG inline. Ref: Ux-Paginas.md (Paper). |
| 0.15.1 | 2026-03-26 | merge-amendment | Merge PKG-COD-001-C01: anti-pattern DTO datetime em §3.4 AGN-COD-API. PKG-COD-001 v1.5.1. Ref: EX-DTO-001. |
| 0.15.0 | 2026-03-26 | merge-amendment | Merge DOC-GNP-00-C01: novo EX-DTO-001 inserido após EX-DB-001. DOC-GNP-00 v2.1.1. Campos datetime em Zod response DTOs MUST usar z.string(). |
| 0.14.2 | 2026-03-26 | create-amendment | Criação PKG-COD-001-C01: anti-pattern DTO datetime em §3.4 AGN-COD-API — codegen MUST NOT gerar .datetime() em response DTOs. Ref: DOC-GNP-00-C01 EX-DTO-001. |
| 0.14.1 | 2026-03-26 | create-amendment | Criação DOC-GNP-00-C01: novo EX-DTO-001 — campos datetime em Zod response DTOs MUST usar z.string(), MUST NOT usar .datetime(). Previne HTTP 500 do serializerCompiler. |
| 0.14.0 | 2026-03-25 | merge-amendment | Merge DOC-UX-011-M03: nova §6.2 LogoutConfirmDialog obrigatório no Widget de Perfil. DOC-UX-011 v1.4.0. Ref: spec-auth-ui-components. |
| 0.13.0 | 2026-03-25 | merge-amendment | Merge DOC-PADRAO-005-C01: §10 expandida com `max_attachments` por entity_type, CON-005, Gate STR-6. DOC-PADRAO-005 v1.0.1. Resolve PENDENTE-004. |
| 0.12.0 | 2026-03-25 | create-amendment | Criação DOC-UX-011-M03: §6.2 LogoutConfirmDialog obrigatório no Widget de Perfil — confirmação antes de logout, prevenção de logout acidental. Referencia spec-auth-ui-components (REQ-LC-001 a REQ-LC-010). |
| 0.11.0 | 2026-03-25 | merge-amendment | Merge batch: DOC-PADRAO-002-M01 (§3.4 Cache e Filas expandida v1.4.0), INT-000-M02 (RBAC cache mod-000), INT-006-M01 (email queue mod-006), INT-008-M01 (ingest queue mod-008). Todos MERGED. |
| 0.10.0 | 2026-03-25 | cascade-amendment | Cascata DOC-PADRAO-002-M01 → 3 derivados: INT-000-M02 (mod-000 RBAC cache), INT-006-M01 (mod-006 email queue), INT-008-M01 (mod-008 ingestão queue). Alinhamento com §3.4.1–3.4.5. |
| 0.9.0 | 2026-03-25 | create-amendment | Criação DOC-PADRAO-002-M01: §3.4 expansão Cache e Filas — ioredis ^5.x config padrão, BullMQ ^5.x como dep core, key naming convention, TTL por categoria, separação databases, health check. Incorpora regras da skill redis-development. |
| 0.8.0 | 2026-03-25 | merge-amendment | Merge batch: DOC-PADRAO-001-M01 (Docker multi-stage §4.2-4.4), DOC-PADRAO-004-M01 (hostnames Docker §3.12), DOC-UX-011-M02 (CA-07/CA-08 proibição inline), DOC-UX-012-M02 (auth context §5.3 CA-06), DOC-GNP-00-M01 (artefatos obrigatórios §2.1). Todos MERGED. |
| 0.7.0 | 2026-03-25 | merge-amendment | Merge DOC-UX-011-M01: nova §8 Coming Soon Pattern + CA-09 no DOC-UX-011 v1.3.0. |
| 0.6.0 | 2026-03-25 | merge-amendment | Merge DOC-PADRAO-001-C01: §4.4 Seed referencia catálogo canônico (DOC-FND-000 §2.2). DOC-PADRAO-001 v1.1.1. |
| 0.5.0 | 2026-03-25 | create-amendment | Criação batch 5 amendments (lições deploy): DOC-UX-011-M02, DOC-UX-012-M02, DOC-PADRAO-001-M01, DOC-GNP-00-M01, DOC-PADRAO-004-M01. |
| 0.4.0 | 2026-03-25 | create-amendment | Criação DOC-UX-011-M01: pattern Coming Soon para rotas de módulos pendentes (CA-09). |
| 0.3.0 | 2026-03-25 | create-amendment | Criação DOC-PADRAO-001-C01: §4.4 Seed deve referenciar catálogo canônico de scopes. |
| 0.2.0 | 2026-03-25 | arquitetura | Migração: 8 normative amendments movidos de mod-000/amendments/normativos/ para docs/01_normativos/amendments/{DOC-ID}/. INDEX.md criado. |
| 0.1.0 | 2026-03-18 | create-amendment | Criação DOC-PADRAO-005-C01: limites de anexos por entity_type no catálogo §10 (resolve PEN-000 PENDENTE-004). |
