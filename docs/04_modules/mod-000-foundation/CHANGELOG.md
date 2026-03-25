> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.

# CHANGELOG - MOD-000

## Ciclo de Estabilidade do Módulo

> 🟢 Verde = Concluído | 🟠 Laranja = Em Andamento | 🔵 Azul = Estável Ancestral | ⬜ Cinza = Previsto

```mermaid
flowchart TD
    E1["1 - História Geradora (Ágil)"]
    E2["2 - Forja Arquitetural (Scaffold)"]
    E3(["3 - Stubs em DRAFT"])
    E4["4 - Enriquecimento Simultâneo BDD/TDD"]
    E5(["5 - Selo READY (Estável Imutável)"])
    E6["6 - Adendos Futuros (Amendments)"]

    E1 --> E2 --> E3 --> E4 --> E5 --> E6

    style E1  fill:#27AE60,color:#fff,stroke:#1E8449
    style E2  fill:#27AE60,color:#fff,stroke:#1E8449
    style E3  fill:#27AE60,color:#fff,stroke:#1E8449
    style E4  fill:#27AE60,color:#fff,stroke:#1E8449
    style E5  fill:#27AE60,color:#fff,stroke:#1E8449
    style E6  fill:#E67E22,color:#fff,stroke:#CA6F1E,font-weight:bold
```

*O módulo está na **Etapa 5** — Selo READY (Estável Imutável). Alterações futuras via `create-amendment`.*

---

## Histórico de Versões

| Versão | Data | Responsável | Descrição |
|--------|------|-------------|-----------|
| 1.7.1 | 2026-03-25 | create-amendment | Amendment FR-000-C02: rota GET /auth/me ausente no entrypoint index.ts + divergência de shape backend/frontend (full_name→name, active_tenant_id→tenant:{id,name}). Dashboard, sidebar e header completamente quebrados. |
| 1.7.0 | 2026-03-25 | merge-amendment | Merge FR-000-C01 + DOC-FND-000-M01..M04: seed-admin.ts corrigido (25→63 scopes, alinhado com DOC-FND-000 §2.2). Selos retroativos: M01 (6 scopes case:*), M02 (reopen), M03 (7 approval:*), M04 (6 mcp:*). Sidebar e RBAC agora funcionais para todos os módulos. |
| 1.6.0 | 2026-03-25 | cascade-amendment | Cascade de FR-000-M01: 3 amendments derivados criados — DATA-000-M01 (coluna invite_token_created_at), INT-000-M01 (schemas OpenAPI Users API), SEC-000-M01 (regra anti-escalação role_id). Desbloqueia codegen MOD-002. |
| 1.5.0 | 2026-03-25 | arquitetura | Migração: 8 normative amendments movidos de amendments/normativos/ para docs/01_normativos/amendments/{DOC-ID}/. Normativos são transversais e não pertencem a módulos. |
| 1.4.3 | 2026-03-25 | merge-amendment | Merge DOC-UX-011-M01: nova §8 (Coming Soon Pattern) + CA-09 no DOC-UX-011 v1.3.0. |
| 1.4.2 | 2026-03-25 | merge-amendment | Merge DOC-PADRAO-001-C01: §4.4 Seed Inicial agora referencia catálogo canônico (DOC-FND-000 §2.2). Base DOC-PADRAO-001 bumped para v1.1.1. |
| 1.4.1 | 2026-03-25 | create-amendment | Amendment FR-000-C01: correção scopes do seed — `tenants:tenant:*` → `tenants:branch:*`, adicionados `system:audit:read/sensitive`, `users:user:import/export/comment`, `storage:file:upload/read`. Alinhamento com catálogo canônico DOC-FND-000 §2.2. Sem correção, sidebar não mostra Filiais nem Auditoria. |
| 1.4.0 | 2026-03-25 | create-amendment | 5 amendments M02 (lições deploy): DOC-UX-011-M02 (rota index, CA-07/CA-08), DOC-UX-012-M02 (auth context §5.3, CA-06), DOC-PADRAO-001-M01 (Docker multi-stage §4.2-4.4), DOC-GNP-00-M01 (artefatos obrigatórios §2.1), DOC-PADRAO-004-M01 (hostnames Docker §3.12). Todos status_implementacao: MERGED. |
| 1.3.0 | 2026-03-25 | create-amendment | Amendment DOC-UX-011-M01: novo pattern "Coming Soon" para rotas de módulos pendentes — componente ComingSoonPage shared + CA-09 (toda rota do sidebar DEVE ter route file). |
| 1.2.1 | 2026-03-25 | create-amendment | Amendment DOC-PADRAO-001-C01: §4.4 Seed Inicial deve referenciar catálogo canônico de scopes (DOC-FND-000 §2.2) — vinculação explícita para evitar seed desatualizado em deploys. |
| 1.2.0 | 2026-03-24 | create-amendment | Amendment FR-000-M01: DTO gaps Users API (F05) — adiciona role_id/role_name em UserListItem, invite_token_expired em UserDetail, mode/role_id em CreateUserRequest. Motivação: MOD-002 (Gestão de Usuários frontend) usa defaults hardcoded como workaround. |
| 1.1.0 | 2026-03-24 | validate-all | Validação Fase 3 aprovada — pronto para merge. QA: PASS. Manifests: 5/5. OpenAPI: PASS. Drizzle: PASS. Endpoints: PASS. 0 bloqueadores, 2 avisos (operationId MFA/sessions). |
| 1.0.0 | 2026-03-23 | promote-module | Promoção DRAFT→READY: manifesto v1.0.0, 9 requisitos (BR/FR/DATA/DATA-003/SEC/SEC-002/INT/UX/NFR), 4 ADRs selados. Épico + 17 features já READY. Ciclo de estabilidade avança para Etapa 5. |
| 0.10.0 | 2026-03-19 | manage-pendentes | Amendment DOC-FND-000-M02: 7º scope process:case:reopen registrado no catálogo canônico §2.2. Ref: PEN-006 PENDENTE-001. Total: 7 scopes process:case:*. |
| 0.9.0 | 2026-03-19 | manage-pendentes | Amendment DOC-FND-000-M01: 6 scopes process:case:* registrados no catálogo canônico §2.2 (MOD-006). Ref: PEN-006 PENDENTE-004. |
| 0.8.2 | 2026-03-18 | usuário | DATA-000 §7: nota chave amigável tenant_users — concatenação userId+tenantCode em runtime (PENDENTE-003 opção A). |
| 0.8.1 | 2026-03-18 | usuário | Amendment DOC-PADRAO-005-C01: limites de anexos configuráveis por entity_type no catálogo §10 (PENDENTE-004 opção C). Nova constraint CON-005, Gate STR-6. |
| 0.8.0 | 2026-03-18 | AGN-DEV-06 | SEC-000 enriquecido: refresh token rotation (PENDENTE-002), SSO identity linking (ADR-004). Evento auth.token_reuse_detected adicionado em DATA-003/SEC-002. Total: 36 events. |
| 0.7.0 | 2026-03-18 | AGN-DEV-09 | ADR-004 criado (Identity Linking SSO via senha nativa). FR-016 atualizado com fluxo completo (PENDENTE-001 opção B). Evento auth.sso_linked adicionado. |
| 0.6.0 | 2026-03-18 | usuário | Fix AVS-1→7 validate-all: scopes 3-seg em Gherkin BR-000, event names FR-009/FR-014 alinhados com DATA-003, 3 eventos scope.* adicionados (FR-010→DATA-003/SEC-002), contagens corrigidas (34 events), data_ultima_revisao sincronizada. |
| 0.5.0 | 2026-03-18 | usuário | Fix BLQ-1/2/3 validate-all: SEC-000 L64 audit:sensitive→3-seg, BR-014 401→400 (consistência FR-005), DATA-003 origin_command esclarecido como não-scope. |
| 0.4.0 | 2026-03-18 | usuário | Correção scopes 2-seg → 3-seg em SEC-000, SEC-002, DATA-000 (PENDENTE-006). Alinhamento com DOC-FND-000 v1.2.0 §2.1. |
| 0.3.0 | 2026-03-18 | usuário | FR-006: adição endpoint `users_invite_resend` (POST /api/v1/users/:id/invite/resend) — resolve PENDENTE-001 do PEN-002 (MOD-002). |
| 0.2.1 | 2026-03-17 | AGN-DEV-01 | Re-validação MOD/Escala — CHANGELOG sincronizado com mod.md, consistência de índice verificada. |
| 0.2.0 | 2026-03-17 | AGN-DEV-01 | Enriquecimento MOD/Escala — fix contagem eventos, atualização metadata, PEN-000 indexado. |
| 0.1.0 | 2026-03-15 | arquitetura | Baseline Inicial — scaffold gerado via `forge-module` a partir de US-MOD-000 (READY). Stubs obrigatórios criados: DATA-003, SEC-002. Todos os itens nascem em `estado_item: DRAFT`. |
