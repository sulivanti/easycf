# Procedimento — Plano de Ação por Épico

> Cada seção segue o mesmo gabarito de 6 fases (0-5) + Utilitários.
> Adapte passos marcados "N/A" quando o módulo for UX-only ou não possuir código ainda.

---

## MOD-000 — Foundation (Governança de Documentos Normativos)

─────────────────────────────────────────────────────────────
PASSO    SKILL/AÇÃO    COMANDO / DETALHES    PRÉ-CONDIÇÃO    PÓS-CONDIÇÃO
─────────────────────────────────────────────────────────────

── Fase 0: Pré-Módulo ──

1    (manual)    Revisar e finalizar épico US-MOD-000:    status_agil = DRAFT    status_agil = READY
        - Fechar escopo (Inclui/Não Inclui)
        - Validar Gherkin dos Critérios de Aceite
        - Preencher DoR completo (owner, dependências, impacto)
        - Aprovar épico (regra cascata — MOD-000 é raiz)
        Arquivo: docs/04_modules/user-stories/epics/US-MOD-000.md

2    (manual)    Revisar e finalizar features F01-F17:    épico READY    status_agil = READY (F01-F17)
        - Validar Gherkin detalhado de cada feature
        - Confirmar nivel_arquitetura e wave_entrega
        - Vincular manifests_vinculados
        Arquivos: docs/04_modules/user-stories/features/US-MOD-000-F{01..17}.md

── Fase 1: Gênese do Módulo ──

3    /forge-module    Forjar módulo consumindo US-MOD-000 (READY)    status_agil = READY    mod-000-foundation/ criada
        Gera scaffold completo:        estado_item = DRAFT (todos stubs)
        mod.md, CHANGELOG.md, requirements/        update-index executado
        (br/, fr/, data/, int/, sec/, ux/, nfr/),
        adr/, tests/, amendments/

── Fase 2: Enriquecimento ──

4    /enrich    Orquestrar 11 agentes para mod-000:    pasta mod-000 existe    Stubs preenchidos (DRAFT)
        Fase exec 1: AGN-DEV-01 (MOD — escala N0/N1/N2)        estado_item permanece DRAFT
        Fase exec 2: AGN-DEV-02 (BR), AGN-DEV-03 (FR)
        Fase exec 3: AGN-DEV-04 (DATA + eventos)
        Fase exec 4: AGN-DEV-05 (INT), AGN-DEV-08 (NFR)
        Fase exec 5: AGN-DEV-06 (SEC + EventMatrix)
        Fase exec 6: AGN-DEV-07 (UX — consome manifests)
        Fase exec 7: AGN-DEV-09 (ADR), AGN-DEV-10 (PENDENTE)
        Fase exec 8: AGN-DEV-11 (VAL — validação cruzada)

    Alternativa: /enrich-agent para executar agente individual
        Ex: /enrich-agent AGN-DEV-04 mod-000 (só DATA)

── Fase 3: Validação ──

5    /qa    Diagnóstico geral pré-promoção    Enriquecimento concluído    Relatório pass/fail
        - lint:docs, lint:markdown        Lista de correções necessárias
        - Consistência de metadados
        - Dead links, DoR alignment

6    /validate-manifest    Validar os 3 manifests contra schema v1:    Manifests existem    Relatório por manifest
        - ux-auth-001.login.yaml
        - ux-shell-001.app-shell.yaml
        - ux-dash-001.main.yaml
        Verifica: DOC-UX-010, operationId, RBAC, telemetria

7    /validate-openapi    Validar contratos OpenAPI referenciados:    Contratos existem    Relatório Spectral
        - POST /auth/login, /auth/logout
        - POST /auth/forgot-password, /auth/reset-password
        - GET /auth/me, PATCH /auth/change-password
        - GET /info
        - CRUD /users, /roles, /tenants, /scopes
        - POST /storage/presigned-url

8    /validate-drizzle    Validar schemas Drizzle:    Schema files existem    Relatório violations
        - users, sessions, roles, scopes, tenants,
          tenant_users, mfa_secrets, oauth_accounts,
          permissions, storage_objects
        - Multitenancy, soft-delete, Zod, audit trail

9    /validate-endpoint    Validar endpoints Fastify:    Handler files existem    Relatório por endpoint
        - RBAC guards presentes
        - X-Correlation-ID propagado
        - RFC 9457 Problem Details
        - Alinhamento com OpenAPI

    Nota: Passos 7-9 dependem de código existir.
    Se mod-000 ainda não tem código, executar após implementação.

── Fase 4: Promoção ──

10    /promote-module    Selar mod-000 como READY:    QA verde (passo 5)    estado_item = READY (congelado)
        Step interno 1: /qa (pré-check)        INDEX.md atualizado
        Step interno 2: Promover épico DRAFT→READY        Commit semântico criado
        Step interno 3: Promover features em lotes
        Step interno 4: /qa (pós-check)
        Step interno 5: /update-index
        Step interno 6: /git commit

── Fase 5: Pós-READY (quando necessário) ──

11    /update-specification    Se spec de módulo precisa de ajuste:    estado_item = READY    Delega para create-amendment
        Detecta que é módulo → redireciona

12    /create-amendment    Criar amendment formal:    estado_item = READY    Amendment criado
        Ex: BR-001-M01.md (melhoria)        CHANGELOG bumped
        Ex: SEC-001-C01.md (correção)        Índices atualizados
        Preserva documento base intacto

── Utilitários (qualquer momento) ──

13    /git    Commit semântico após qualquer alteração    Mudanças staged    Commit PT-BR criado
        Formato: docs(mod-000): <descrição>

14    /update-index    Atualizar índices se criou/removeu arquivos    Arquivos alterados    INDEX.md sincronizado

15    /readme-blueprint    Atualizar README.md do repositório    Estrutura alterada    README.md atualizado

─────────────────────────────────────────────────────────────

Resumo visual do fluxo MOD-000:

US-MOD-000 (DRAFT)
  │ ← passos 1-2: revisão manual (17 features!)
  ▼
US-MOD-000 (READY)
  │ ← passo 3: /forge-module (disparo único)
  ▼
mod-000-foundation/ (stubs DRAFT)
  │ ← passo 4: /enrich (11 agentes, 8 fases)
  ▼
mod-000 enriquecido (DRAFT)
  │ ← passos 5-9: /qa + /validate-* (5 validadores)
  ▼
mod-000 validado (DRAFT)
  │ ← passo 10: /promote-module
  ▼
mod-000 selado (READY — congelado)
  │ ← passos 11-12: /create-amendment (se necessário)
  ▼
mod-000 + amendments/

⚠️ MOD-000 é pré-requisito de TODOS os demais módulos (regra cascata).

---

## MOD-001 — Backoffice Admin (UX-First Shell)

─────────────────────────────────────────────────────────────
PASSO    SKILL/AÇÃO    COMANDO / DETALHES    PRÉ-CONDIÇÃO    PÓS-CONDIÇÃO
─────────────────────────────────────────────────────────────
Sequencia de comandos

Fase 0: Pré-Módulo:  
Revisar e finalizar épico US-MOD-001: e mudar para READY
Revisar e finalizar features F01-F03: e mudar para READY
obs.: d - the 3 screen manifests (ux-auth-001, ux-shell-001, ux-dash-001) and the schema v1 all exist. Now I have everything I need to create the plan.

── Fase 1: Gênese do Módulo ──
Forjar módulo consumindo US-MOD-001

── Fase 0: Pré-Módulo ──

1    (manual)    Revisar e finalizar épico US-MOD-001:    status_agil = DRAFT    status_agil = READY
        - Fechar escopo (Inclui/Não Inclui)
        - Validar Gherkin dos Critérios de Aceite
        - Preencher DoR completo (owner, dependências, impacto)
        - Aprovar épico (regra cascata)
        Arquivo: docs/04_modules/user-stories/epics/US-MOD-001.md

2    (manual)    Revisar e finalizar features F01-F03:    épico READY    status_agil = READY (F01-F03)
        - Validar Gherkin detalhado de cada feature
        - Confirmar nivel_arquitetura e wave_entrega
        - Vincular manifests_vinculados
        Arquivos: docs/04_modules/user-stories/features/US-MOD-001-F0{1,2,3}.md

── Fase 1: Gênese do Módulo ──

3    /forge-module    Forjar módulo consumindo US-MOD-001 (READY)    status_agil = READY    mod-001-backoffice-admin/ criada
        Gera scaffold completo:        estado_item = DRAFT (todos stubs)
        mod.md, CHANGELOG.md, requirements/        update-index executado
        (br/, fr/, data/, int/, sec/, ux/, nfr/),
        adr/, tests/, amendments/

── Fase 2: Enriquecimento ──

4    /enrich    Orquestrar 11 agentes para mod-001:    pasta mod-001 existe    Stubs preenchidos (DRAFT)
        Fase exec 1: AGN-DEV-01 (MOD — escala N0/N1/N2)        estado_item permanece DRAFT
        Fase exec 2: AGN-DEV-02 (BR), AGN-DEV-03 (FR)
        Fase exec 3: AGN-DEV-04 (DATA + eventos)
        Fase exec 4: AGN-DEV-05 (INT), AGN-DEV-08 (NFR)
        Fase exec 5: AGN-DEV-06 (SEC + EventMatrix)
        Fase exec 6: AGN-DEV-07 (UX — consome manifests)
        Fase exec 7: AGN-DEV-09 (ADR), AGN-DEV-10 (PENDENTE)
        Fase exec 8: AGN-DEV-11 (VAL — validação cruzada)

    Alternativa: /enrich-agent para executar agente individual
        Ex: /enrich-agent AGN-DEV-04 mod-001 (só DATA)

── Fase 3: Validação ──

5    /qa    Diagnóstico geral pré-promoção    Enriquecimento concluído    Relatório pass/fail
        - lint:docs, lint:markdown        Lista de correções necessárias
        - Consistência de metadados
        - Dead links, DoR alignment

6    /validate-manifest    Validar os 3 manifests contra schema v1:    Manifests existem    Relatório por manifest
        - ux-auth-001.login.yaml
        - ux-shell-001.app-shell.yaml
        - ux-dash-001.main.yaml
        Verifica: DOC-UX-010, operationId, RBAC, telemetria

7    /validate-openapi    N/A — MOD-001 é UX-only    —    —
        Não cria endpoints próprios;
        consome operationIds de MOD-000.

8    /validate-drizzle    N/A — MOD-001 é UX-only    —    —
        Sem schemas Drizzle próprios.

9    /validate-endpoint    N/A — MOD-001 é UX-only    —    —
        Sem handlers Fastify próprios.

── Fase 4: Promoção ──

10    /promote-module    Selar mod-001 como READY:    QA verde (passo 5)    estado_item = READY (congelado)
        Step interno 1: /qa (pré-check)        INDEX.md atualizado
        Step interno 2: Promover épico DRAFT→READY        Commit semântico criado
        Step interno 3: Promover features em lotes
        Step interno 4: /qa (pós-check)
        Step interno 5: /update-index
        Step interno 6: /git commit

── Fase 5: Pós-READY (quando necessário) ──

11    /update-specification    Se spec de módulo precisa de ajuste:    estado_item = READY    Delega para create-amendment
        Detecta que é módulo → redireciona

12    /create-amendment    Criar amendment formal:    estado_item = READY    Amendment criado
        Ex: BR-001-M01.md (melhoria)        CHANGELOG bumped
        Ex: SEC-001-C01.md (correção)        Índices atualizados
        Preserva documento base intacto

── Utilitários (qualquer momento) ──

13    /git    Commit semântico após qualquer alteração    Mudanças staged    Commit PT-BR criado
        Formato: docs(mod-001): <descrição>

14    /update-index    Atualizar índices se criou/removeu arquivos    Arquivos alterados    INDEX.md sincronizado

15    /readme-blueprint    Atualizar README.md do repositório    Estrutura alterada    README.md atualizado

─────────────────────────────────────────────────────────────

Resumo visual do fluxo MOD-001:

US-MOD-001 (DRAFT)
  │ ← passos 1-2: revisão manual
  ▼
US-MOD-001 (READY)
  │ ← passo 3: /forge-module (disparo único)
  ▼
mod-001-backoffice-admin/ (stubs DRAFT)
  │ ← passo 4: /enrich (11 agentes, 8 fases)
  ▼
mod-001 enriquecido (DRAFT)
  │ ← passos 5-6: /qa + /validate-manifest (UX-only)
  ▼
mod-001 validado (DRAFT)
  │ ← passo 10: /promote-module
  ▼
mod-001 selado (READY — congelado)
  │ ← passos 11-12: /create-amendment (se necessário)
  ▼
mod-001 + amendments/

---

## MOD-002 — Gestão de Usuários (UX-First)

─────────────────────────────────────────────────────────────
PASSO    SKILL/AÇÃO    COMANDO / DETALHES    PRÉ-CONDIÇÃO    PÓS-CONDIÇÃO
─────────────────────────────────────────────────────────────

── Fase 0: Pré-Módulo ──

1    (manual)    Revisar e finalizar épico US-MOD-002:    status_agil = DRAFT    status_agil = READY
        - Fechar escopo (Inclui/Não Inclui)        MOD-000-F05 READY
        - Validar Gherkin dos Critérios de Aceite
        - Preencher DoR completo (owner, dependências, impacto)
        - Confirmar separação: MOD-000-F05 (backend) vs MOD-002 (UX)
        - Aprovar épico (regra cascata)
        Arquivo: docs/04_modules/user-stories/epics/US-MOD-002.md

2    (manual)    Revisar e finalizar features F01-F03:    épico READY    status_agil = READY (F01-F03)
        - F01: Listagem de usuários com filtros (UX-USR-001)
        - F02: Formulário de criação (UX-USR-002)
        - F03: Fluxo de convite (UX-USR-003)
        - Validar Gherkin detalhado de cada feature
        - Confirmar nivel_arquitetura e wave_entrega
        - Vincular manifests_vinculados
        Arquivos: docs/04_modules/user-stories/features/US-MOD-002-F0{1,2,3}.md

── Fase 1: Gênese do Módulo ──

3    /forge-module    Forjar módulo consumindo US-MOD-002 (READY)    status_agil = READY    mod-002-gestao-usuarios/ criada
        Gera scaffold completo:        estado_item = DRAFT (todos stubs)
        mod.md, CHANGELOG.md, requirements/        update-index executado
        (br/, fr/, data/, int/, sec/, ux/, nfr/),
        adr/, tests/, amendments/

── Fase 2: Enriquecimento ──

4    /enrich    Orquestrar 11 agentes para mod-002:    pasta mod-002 existe    Stubs preenchidos (DRAFT)
        Fase exec 1: AGN-DEV-01 (MOD — escala N0/N1/N2)        estado_item permanece DRAFT
        Fase exec 2: AGN-DEV-02 (BR), AGN-DEV-03 (FR)
        Fase exec 3: AGN-DEV-04 (DATA + eventos)
        Fase exec 4: AGN-DEV-05 (INT), AGN-DEV-08 (NFR)
        Fase exec 5: AGN-DEV-06 (SEC + EventMatrix)
        Fase exec 6: AGN-DEV-07 (UX — consome manifests USR-001/002/003)
        Fase exec 7: AGN-DEV-09 (ADR), AGN-DEV-10 (PENDENTE)
        Fase exec 8: AGN-DEV-11 (VAL — validação cruzada)

    Alternativa: /enrich-agent para executar agente individual

── Fase 3: Validação ──

5    /qa    Diagnóstico geral pré-promoção    Enriquecimento concluído    Relatório pass/fail
        - lint:docs, lint:markdown        Lista de correções necessárias
        - Consistência de metadados
        - Dead links, DoR alignment

6    /validate-manifest    Validar os 3 manifests contra schema v1:    Manifests existem    Relatório por manifest
        - ux-usr-001.users-list.yaml
        - ux-usr-002.user-form.yaml
        - ux-usr-003.user-invite.yaml
        Verifica: DOC-UX-010, operationId, RBAC, telemetria

7    /validate-openapi    N/A — MOD-002 é UX-only    —    —
        Não cria endpoints próprios;
        consome operationIds de MOD-000-F05
        (users_list, users_create, users_get, users_delete,
         users_invite_resend, roles_list).

8    /validate-drizzle    N/A — MOD-002 é UX-only    —    —
        Sem schemas Drizzle próprios.

9    /validate-endpoint    N/A — MOD-002 é UX-only    —    —
        Sem handlers Fastify próprios.

── Fase 4: Promoção ──

10    /promote-module    Selar mod-002 como READY:    QA verde (passo 5)    estado_item = READY (congelado)
        Step interno 1: /qa (pré-check)        INDEX.md atualizado
        Step interno 2: Promover épico DRAFT→READY        Commit semântico criado
        Step interno 3: Promover features em lotes
        Step interno 4: /qa (pós-check)
        Step interno 5: /update-index
        Step interno 6: /git commit

── Fase 5: Pós-READY (quando necessário) ──

11    /update-specification    Se spec de módulo precisa de ajuste:    estado_item = READY    Delega para create-amendment
        Detecta que é módulo → redireciona

12    /create-amendment    Criar amendment formal:    estado_item = READY    Amendment criado
        Preserva documento base intacto        CHANGELOG bumped

── Utilitários (qualquer momento) ──

13    /git    Commit semântico após qualquer alteração    Mudanças staged    Commit PT-BR criado
        Formato: docs(mod-002): <descrição>

14    /update-index    Atualizar índices se criou/removeu arquivos    Arquivos alterados    INDEX.md sincronizado

15    /readme-blueprint    Atualizar README.md do repositório    Estrutura alterada    README.md atualizado

─────────────────────────────────────────────────────────────

Resumo visual do fluxo MOD-002:

US-MOD-002 (DRAFT)
  │ ← passos 1-2: revisão manual (confirmar separação MOD-000-F05 backend)
  ▼
US-MOD-002 (READY)
  │ ← passo 3: /forge-module (disparo único)
  ▼
mod-002-gestao-usuarios/ (stubs DRAFT)
  │ ← passo 4: /enrich (11 agentes, 8 fases)
  ▼
mod-002 enriquecido (DRAFT)
  │ ← passos 5-6: /qa + /validate-manifest (UX-only)
  ▼
mod-002 validado (DRAFT)
  │ ← passo 10: /promote-module
  ▼
mod-002 selado (READY — congelado)
  │ ← passos 11-12: /create-amendment (se necessário)
  ▼
mod-002 + amendments/

---

## MOD-003 — Estrutura Organizacional (Full-Stack)

─────────────────────────────────────────────────────────────
PASSO    SKILL/AÇÃO    COMANDO / DETALHES    PRÉ-CONDIÇÃO    PÓS-CONDIÇÃO
─────────────────────────────────────────────────────────────

── Fase 0: Pré-Módulo ──

1    (manual)    Revisar e finalizar épico US-MOD-003:    status_agil = DRAFT    status_agil = READY
        - Fechar escopo (Inclui/Não Inclui)        MOD-000-F07 READY (tenants)
        - Validar decisão arquitetural: N5 = tenants existente
        - Confirmar hierarquia 5 níveis (N1-N4 + N5=tenant)
        - Validar Gherkin dos Critérios de Aceite
        - Preencher DoR completo (owner, dependências, impacto)
        - Aprovar épico (regra cascata)
        Arquivo: docs/04_modules/user-stories/epics/US-MOD-003.md

2    (manual)    Revisar e finalizar features F01-F03:    épico READY    status_agil = READY (F01-F03)
        - F01: API Core — CRUD + Tree Query + N5 Linking
        - F02: Tela Árvore Organizacional (UX-ORG-001)
        - F03: Formulário de Nó (UX-ORG-002)
        - Validar 8 endpoints (org_units_*)
        - Confirmar 3 novos scopes (org:unit:read/write/delete)
        - Validar constraint CTE <200ms com ~100 nós
        Arquivos: docs/04_modules/user-stories/features/US-MOD-003-F0{1,2,3}.md

── Fase 1: Gênese do Módulo ──

3    /forge-module    Forjar módulo consumindo US-MOD-003 (READY)    status_agil = READY    mod-003-estrutura-org/ criada
        Gera scaffold completo:        estado_item = DRAFT (todos stubs)
        mod.md, CHANGELOG.md, requirements/        update-index executado
        (br/, fr/, data/, int/, sec/, ux/, nfr/),
        adr/, tests/, amendments/

── Fase 2: Enriquecimento ──

4    /enrich    Orquestrar 11 agentes para mod-003:    pasta mod-003 existe    Stubs preenchidos (DRAFT)
        Fase exec 1: AGN-DEV-01 (MOD — escala N0/N1/N2)        estado_item permanece DRAFT
        Fase exec 2: AGN-DEV-02 (BR), AGN-DEV-03 (FR)
        Fase exec 3: AGN-DEV-04 (DATA — org_units, CTE tree)
        Fase exec 4: AGN-DEV-05 (INT), AGN-DEV-08 (NFR — CTE <200ms)
        Fase exec 5: AGN-DEV-06 (SEC — 3 scopes org:unit:*)
        Fase exec 6: AGN-DEV-07 (UX — consome manifests ORG-001/002)
        Fase exec 7: AGN-DEV-09 (ADR — N5=tenant decision), AGN-DEV-10 (PENDENTE)
        Fase exec 8: AGN-DEV-11 (VAL — validação cruzada)

    Alternativa: /enrich-agent para executar agente individual

── Fase 3: Validação ──

5    /qa    Diagnóstico geral pré-promoção    Enriquecimento concluído    Relatório pass/fail
        - lint:docs, lint:markdown        Lista de correções necessárias
        - Consistência de metadados
        - Dead links, DoR alignment

6    /validate-manifest    Validar os 2 manifests contra schema v1:    Manifests existem    Relatório por manifest
        - ux-org-001.org-tree.yaml
        - ux-org-002.org-form.yaml
        Verifica: DOC-UX-010, operationId, RBAC, telemetria

7    /validate-openapi    Validar contratos OpenAPI referenciados:    Contratos existem    Relatório Spectral
        - GET /org-units (list + tree)
        - POST /org-units
        - GET /org-units/:id
        - PATCH /org-units/:id
        - DELETE /org-units/:id
        - POST /org-units/:id/link-tenant
        - DELETE /org-units/:id/unlink-tenant

8    /validate-drizzle    Validar schemas Drizzle:    Schema files existem    Relatório violations
        - org_units (parent_id, level, soft-delete)
        - org_unit_tenants (link N4→N5)
        - Multitenancy, soft-delete, Zod, audit trail
        - Constraint: soft-delete blocked com filhos ativos

9    /validate-endpoint    Validar endpoints Fastify:    Handler files existem    Relatório por endpoint
        - RBAC guards (org:unit:read/write/delete)
        - X-Correlation-ID propagado
        - RFC 9457 Problem Details
        - Alinhamento com OpenAPI
        - CTE tree performance

    Nota: Passos 7-9 dependem de código existir.

── Fase 4: Promoção ──

10    /promote-module    Selar mod-003 como READY:    QA verde (passo 5)    estado_item = READY (congelado)
        Step interno 1: /qa (pré-check)        INDEX.md atualizado
        Step interno 2: Promover épico DRAFT→READY        Commit semântico criado
        Step interno 3: Promover features em lotes
        Step interno 4: /qa (pós-check)
        Step interno 5: /update-index
        Step interno 6: /git commit

── Fase 5: Pós-READY (quando necessário) ──

11    /update-specification    Se spec de módulo precisa de ajuste:    estado_item = READY    Delega para create-amendment
        Detecta que é módulo → redireciona

12    /create-amendment    Criar amendment formal:    estado_item = READY    Amendment criado
        Preserva documento base intacto        CHANGELOG bumped

── Utilitários (qualquer momento) ──

13    /git    Commit semântico: docs(mod-003): <descrição>    Mudanças staged    Commit PT-BR criado

14    /update-index    Atualizar índices    Arquivos alterados    INDEX.md sincronizado

15    /readme-blueprint    Atualizar README.md    Estrutura alterada    README.md atualizado

─────────────────────────────────────────────────────────────

Resumo visual do fluxo MOD-003:

US-MOD-003 (DRAFT)
  │ ← passos 1-2: revisão manual (validar N5=tenant, hierarquia 5 níveis)
  ▼
US-MOD-003 (READY)
  │ ← passo 3: /forge-module (disparo único)
  ▼
mod-003-estrutura-org/ (stubs DRAFT)
  │ ← passo 4: /enrich (11 agentes, 8 fases)
  ▼
mod-003 enriquecido (DRAFT)
  │ ← passos 5-9: /qa + /validate-* (5 validadores — full-stack)
  ▼
mod-003 validado (DRAFT)
  │ ← passo 10: /promote-module
  ▼
mod-003 selado (READY — congelado)
  │ ← passos 11-12: /create-amendment (se necessário)
  ▼
mod-003 + amendments/

---

## MOD-004 — Identidade Avançada (Compartilhamento & Delegação)

─────────────────────────────────────────────────────────────
PASSO    SKILL/AÇÃO    COMANDO / DETALHES    PRÉ-CONDIÇÃO    PÓS-CONDIÇÃO
─────────────────────────────────────────────────────────────

── Fase 0: Pré-Módulo ──

1    (manual)    Revisar e finalizar épico US-MOD-004:    status_agil = DRAFT    status_agil = READY
        - Fechar escopo (Inclui/Não Inclui)        MOD-003 READY (org_units)
        - Validar 3 camadas ortogonais:        MOD-000 READY (identity base)
          · user_org_scopes (usuário ↔ org_unit)
          · access_shares (expansão de visibilidade)
          · access_delegations (transferência temporária)
        - Confirmar blocklist delegação (\*:approve, \*:execute, \*:sign)
        - Validar Gherkin dos Critérios de Aceite
        - Preencher DoR completo
        - Aprovar épico (regra cascata)
        Arquivo: docs/04_modules/user-stories/epics/US-MOD-004.md

2    (manual)    Revisar e finalizar features F01-F04:    épico READY    status_agil = READY (F01-F04)
        - F01: API — User ↔ Org Structure Linking
        - F02: API — Sharing & Delegation + auto-expiration job
        - F03: UX — User Org Scope Management (UX-IDN-001)
        - F04: UX — Sharing & Delegation Panel (UX-IDN-002)
        - Confirmar 6 novos scopes (identity:org_scope:*, identity:share:*)
        Arquivos: docs/04_modules/user-stories/features/US-MOD-004-F0{1,2,3,4}.md

── Fase 1: Gênese do Módulo ──

3    /forge-module    Forjar módulo consumindo US-MOD-004 (READY)    status_agil = READY    mod-004-identidade-avancada/ criada
        Gera scaffold completo        estado_item = DRAFT (todos stubs)

── Fase 2: Enriquecimento ──

4    /enrich    Orquestrar 11 agentes para mod-004:    pasta mod-004 existe    Stubs preenchidos (DRAFT)
        Fase exec 1: AGN-DEV-01 (MOD — escala N0/N1/N2)        estado_item permanece DRAFT
        Fase exec 2: AGN-DEV-02 (BR), AGN-DEV-03 (FR)
        Fase exec 3: AGN-DEV-04 (DATA — user_org_scopes, access_shares, access_delegations)
        Fase exec 4: AGN-DEV-05 (INT — job expiração), AGN-DEV-08 (NFR)
        Fase exec 5: AGN-DEV-06 (SEC — blocklist delegação, self-approval share)
        Fase exec 6: AGN-DEV-07 (UX — consome manifests IDN-001/002)
        Fase exec 7: AGN-DEV-09 (ADR), AGN-DEV-10 (PENDENTE)
        Fase exec 8: AGN-DEV-11 (VAL — validação cruzada)

    Alternativa: /enrich-agent para executar agente individual

── Fase 3: Validação ──

5    /qa    Diagnóstico geral pré-promoção    Enriquecimento concluído    Relatório pass/fail

6    /validate-manifest    Validar os 2 manifests contra schema v1:    Manifests existem    Relatório por manifest
        - ux-idn-001.org-scope.yaml
        - ux-idn-002.shares-delegations.yaml
        Verifica: DOC-UX-010, operationId, RBAC, telemetria

7    /validate-openapi    Validar contratos OpenAPI:    Contratos existem    Relatório Spectral
        - CRUD /user-org-scopes
        - CRUD /access-shares
        - CRUD /access-delegations
        - POST /access-shares/:id/revoke
        - POST /access-delegations/:id/revoke

8    /validate-drizzle    Validar schemas Drizzle:    Schema files existem    Relatório violations
        - user_org_scopes (FK user + org_unit)
        - access_shares (reason, valid_until, revoked_at)
        - access_delegations (blocklist scopes, valid_until)
        - Multitenancy, soft-delete, Zod, audit trail

9    /validate-endpoint    Validar endpoints Fastify:    Handler files existem    Relatório por endpoint
        - RBAC guards (identity:org_scope:*, identity:share:*)
        - Validação: delegação não pode incluir *:approve/*:execute/*:sign
        - Auto-expiration job testado
        - X-Correlation-ID propagado
        - RFC 9457 Problem Details

    Nota: Passos 7-9 dependem de código existir.

── Fase 4: Promoção ──

10    /promote-module    Selar mod-004 como READY:    QA verde (passo 5)    estado_item = READY (congelado)
        Steps internos 1-6 (padrão)        INDEX.md atualizado, commit criado

── Fase 5: Pós-READY (quando necessário) ──

11    /update-specification    Se spec precisa de ajuste    estado_item = READY    Delega para create-amendment
12    /create-amendment    Criar amendment formal    estado_item = READY    Amendment criado, CHANGELOG bumped

── Utilitários (qualquer momento) ──

13    /git    Commit semântico: docs(mod-004): <descrição>    Mudanças staged    Commit PT-BR criado
14    /update-index    Atualizar índices    Arquivos alterados    INDEX.md sincronizado
15    /readme-blueprint    Atualizar README.md    Estrutura alterada    README.md atualizado

─────────────────────────────────────────────────────────────

Resumo visual do fluxo MOD-004:

US-MOD-004 (DRAFT)
  │ ← passos 1-2: revisão manual (3 camadas ortogonais, blocklist delegação)
  ▼
US-MOD-004 (READY)
  │ ← passo 3: /forge-module
  ▼
mod-004-identidade-avancada/ (stubs DRAFT)
  │ ← passo 4: /enrich (11 agentes, 8 fases)
  ▼
mod-004 enriquecido (DRAFT)
  │ ← passos 5-9: /qa + /validate-* (5 validadores — full-stack)
  ▼
mod-004 validado (DRAFT)
  │ ← passo 10: /promote-module
  ▼
mod-004 selado (READY — congelado)
  │ ← passos 11-12: /create-amendment (se necessário)
  ▼
mod-004 + amendments/

---

## MOD-005 — Modelagem de Processos (Blueprint)

─────────────────────────────────────────────────────────────
PASSO    SKILL/AÇÃO    COMANDO / DETALHES    PRÉ-CONDIÇÃO    PÓS-CONDIÇÃO
─────────────────────────────────────────────────────────────

── Fase 0: Pré-Módulo ──

1    (manual)    Revisar e finalizar épico US-MOD-005:    status_agil = DRAFT    status_agil = READY
        - Fechar escopo (Inclui/Não Inclui)        MOD-000 READY
        - Validar separação: MOD-005 (blueprint/molde) vs MOD-006 (execução)
        - Confirmar hierarquia: Cycle → Macro-stage → Stage → Gate/Role/Transition
        - Validar versionamento: DRAFT→PUBLISHED→DEPRECATED (imutável quando publicado)
        - Preencher DoR completo
        - Aprovar épico (regra cascata)
        Arquivo: docs/04_modules/user-stories/epics/US-MOD-005.md

2    (manual)    Revisar e finalizar features F01-F04:    épico READY    status_agil = READY (F01-F04)
        - F01: API — Cycles + Macro-stages + Stages (CRUD + versioning)
        - F02: API — Gates + Roles + Transitions (graph navigation)
        - F03: UX — Visual Flow Editor (UX-PROC-001)
        - F04: UX — Stage Configurator (UX-PROC-002)
        - Confirmar 8 tabelas de banco
        - Confirmar 4 novos scopes (process:cycle:*)
        Arquivos: docs/04_modules/user-stories/features/US-MOD-005-F0{1,2,3,4}.md

── Fase 1: Gênese do Módulo ──

3    /forge-module    Forjar módulo consumindo US-MOD-005 (READY)    status_agil = READY    mod-005-modelagem-processos/ criada
        Gera scaffold completo        estado_item = DRAFT (todos stubs)

── Fase 2: Enriquecimento ──

4    /enrich    Orquestrar 11 agentes para mod-005:    pasta mod-005 existe    Stubs preenchidos (DRAFT)
        Fase exec 1: AGN-DEV-01 (MOD — escala N0/N1/N2)        estado_item permanece DRAFT
        Fase exec 2: AGN-DEV-02 (BR), AGN-DEV-03 (FR)
        Fase exec 3: AGN-DEV-04 (DATA — 8 tabelas: cycles, macro_stages, stages,
                     gates, roles, stage_role_links, stage_transitions, version_history)
        Fase exec 4: AGN-DEV-05 (INT), AGN-DEV-08 (NFR)
        Fase exec 5: AGN-DEV-06 (SEC — 4 scopes process:cycle:*)
        Fase exec 6: AGN-DEV-07 (UX — consome manifests PROC-001/002, mini-map 15+ nós)
        Fase exec 7: AGN-DEV-09 (ADR — imutabilidade PUBLISHED), AGN-DEV-10 (PENDENTE)
        Fase exec 8: AGN-DEV-11 (VAL — validação cruzada)

    Alternativa: /enrich-agent para executar agente individual

── Fase 3: Validação ──

5    /qa    Diagnóstico geral pré-promoção    Enriquecimento concluído    Relatório pass/fail

6    /validate-manifest    Validar os 2 manifests contra schema v1:    Manifests existem    Relatório por manifest
        - ux-proc-001.editor-visual.yaml
        - ux-proc-002.config-estagio.yaml
        Verifica: DOC-UX-010, operationId, RBAC, telemetria

7    /validate-openapi    Validar contratos OpenAPI:    Contratos existem    Relatório Spectral
        - CRUD /process-cycles (+ versioning: fork, publish, deprecate)
        - CRUD /process-cycles/:id/macro-stages
        - CRUD /process-cycles/:id/stages
        - CRUD /stages/:id/gates
        - CRUD /stages/:id/roles
        - CRUD /stages/:id/transitions

8    /validate-drizzle    Validar schemas Drizzle:    Schema files existem    Relatório violations
        - process_cycles (version, status: DRAFT/PUBLISHED/DEPRECATED)
        - process_macro_stages, process_stages
        - process_gates, process_roles, stage_role_links
        - stage_transitions (from_stage, to_stage, condition, evidence_required)
        - Multitenancy, soft-delete, Zod, audit trail

9    /validate-endpoint    Validar endpoints Fastify:    Handler files existem    Relatório por endpoint
        - RBAC guards (process:cycle:read/write/publish/delete)
        - Imutabilidade: PUBLISHED não aceita PATCH
        - Fork de ciclo publicado
        - X-Correlation-ID propagado, RFC 9457

    Nota: Passos 7-9 dependem de código existir.

── Fase 4: Promoção ──

10    /promote-module    Selar mod-005 como READY    QA verde (passo 5)    estado_item = READY (congelado)

── Fase 5: Pós-READY ──

11    /update-specification    Se spec precisa de ajuste    estado_item = READY    Delega para create-amendment
12    /create-amendment    Criar amendment formal    estado_item = READY    Amendment criado, CHANGELOG bumped

── Utilitários ──

13    /git    Commit semântico: docs(mod-005): <descrição>    Mudanças staged    Commit PT-BR criado
14    /update-index    Atualizar índices    Arquivos alterados    INDEX.md sincronizado
15    /readme-blueprint    Atualizar README.md    Estrutura alterada    README.md atualizado

─────────────────────────────────────────────────────────────

Resumo visual do fluxo MOD-005:

US-MOD-005 (DRAFT)
  │ ← passos 1-2: revisão manual (blueprint vs execução, versionamento imutável)
  ▼
US-MOD-005 (READY)
  │ ← passo 3: /forge-module
  ▼
mod-005-modelagem-processos/ (stubs DRAFT)
  │ ← passo 4: /enrich (11 agentes, 8 fases)
  ▼
mod-005 enriquecido (DRAFT)
  │ ← passos 5-9: /qa + /validate-* (5 validadores — full-stack)
  ▼
mod-005 validado (DRAFT)
  │ ← passo 10: /promote-module
  ▼
mod-005 selado (READY — congelado)
  │ ← passos 11-12: /create-amendment (se necessário)
  ▼
mod-005 + amendments/

---

## MOD-006 — Execução de Casos (Process Instance Execution)

─────────────────────────────────────────────────────────────
PASSO    SKILL/AÇÃO    COMANDO / DETALHES    PRÉ-CONDIÇÃO    PÓS-CONDIÇÃO
─────────────────────────────────────────────────────────────

── Fase 0: Pré-Módulo ──

1    (manual)    Revisar e finalizar épico US-MOD-006:    status_agil = DRAFT    status_agil = READY
        - Fechar escopo (Inclui/Não Inclui)        MOD-005 READY (blueprint)
        - Validar motor de transição:        MOD-004 READY (identity)
          gates pendentes? user tem role? evidência fornecida?        MOD-003 READY (org)
        - Confirmar 3 históricos independentes:
          · stage_history (onde o caso esteve)
          · gate_instances (como gates foram resolvidos)
          · case_assignments (quem é responsável agora)
        - Confirmar que instância referencia cycle_version_id congelado
        - Preencher DoR completo
        - Aprovar épico (regra cascata)
        Arquivo: docs/04_modules/user-stories/epics/US-MOD-006.md

2    (manual)    Revisar e finalizar features F01-F04:    épico READY    status_agil = READY (F01-F04)
        - F01: API — Case Opening + Transition Motor
        - F02: API — Gates, Responsibilities & Events
        - F03: UX — Case Panel in Progress (UX-CASE-001)
        - F04: UX — Cases Listing (UX-CASE-002)
        - Confirmar 5 tabelas (case_instances, stage_history,
          gate_instances, case_assignments, case_events)
        - Confirmar 6 novos scopes (process:case:*)
        Arquivos: docs/04_modules/user-stories/features/US-MOD-006-F0{1,2,3,4}.md

── Fase 1: Gênese do Módulo ──

3    /forge-module    Forjar módulo consumindo US-MOD-006 (READY)    status_agil = READY    mod-006-execucao-casos/ criada
        Gera scaffold completo        estado_item = DRAFT (todos stubs)

── Fase 2: Enriquecimento ──

4    /enrich    Orquestrar 11 agentes para mod-006:    pasta mod-006 existe    Stubs preenchidos (DRAFT)
        Fase exec 1: AGN-DEV-01 (MOD — escala N0/N1/N2)        estado_item permanece DRAFT
        Fase exec 2: AGN-DEV-02 (BR), AGN-DEV-03 (FR)
        Fase exec 3: AGN-DEV-04 (DATA — case_instances, stage_history,
                     gate_instances, case_assignments, case_events)
        Fase exec 4: AGN-DEV-05 (INT — hook MOD-007), AGN-DEV-08 (NFR)
        Fase exec 5: AGN-DEV-06 (SEC — 6 scopes process:case:*, segregação)
        Fase exec 6: AGN-DEV-07 (UX — consome manifests CASE-001/002, timeline interleaved)
        Fase exec 7: AGN-DEV-09 (ADR — cycle_version_id frozen), AGN-DEV-10 (PENDENTE)
        Fase exec 8: AGN-DEV-11 (VAL — validação cruzada)

    Alternativa: /enrich-agent para executar agente individual

── Fase 3: Validação ──

5    /qa    Diagnóstico geral pré-promoção    Enriquecimento concluído    Relatório pass/fail

6    /validate-manifest    Validar os 2 manifests contra schema v1:    Manifests existem    Relatório por manifest
        - ux-case-001.painel-caso.yaml
        - ux-case-002.listagem-casos.yaml
        Verifica: DOC-UX-010, operationId, RBAC, telemetria

7    /validate-openapi    Validar contratos OpenAPI:    Contratos existem    Relatório Spectral
        - POST /cases (abertura)
        - POST /cases/:id/transition (motor de transição)
        - POST /cases/:id/gates/:gateId/resolve
        - POST /cases/:id/gates/:gateId/waive
        - PATCH /cases/:id/assign
        - GET /cases, GET /cases/:id
        - GET /cases/:id/timeline

8    /validate-drizzle    Validar schemas Drizzle:    Schema files existem    Relatório violations
        - case_instances (cycle_version_id FK frozen, status, business_object)
        - stage_history (case_id, stage_id, entered_at, exited_at)
        - gate_instances (case_id, gate_id, resolved_by, decision)
        - case_assignments (case_id, user_id, role)
        - case_events (case_id, event_type, payload)
        - Multitenancy, soft-delete, Zod, audit trail

9    /validate-endpoint    Validar endpoints Fastify:    Handler files existem    Relatório por endpoint
        - RBAC guards (process:case:read/write/cancel/gate_resolve/gate_waive/assign)
        - Motor de transição: validação de gates + role + evidência
        - Timeline interleaved (3 históricos cronológicos)
        - X-Correlation-ID propagado, RFC 9457

    Nota: Passos 7-9 dependem de código existir.

── Fase 4: Promoção ──

10    /promote-module    Selar mod-006 como READY    QA verde (passo 5)    estado_item = READY (congelado)

── Fase 5: Pós-READY ──

11    /update-specification    Se spec precisa de ajuste    estado_item = READY    Delega para create-amendment
12    /create-amendment    Criar amendment formal    estado_item = READY    Amendment criado, CHANGELOG bumped

── Utilitários ──

13    /git    Commit semântico: docs(mod-006): <descrição>    Mudanças staged    Commit PT-BR criado
14    /update-index    Atualizar índices    Arquivos alterados    INDEX.md sincronizado
15    /readme-blueprint    Atualizar README.md    Estrutura alterada    README.md atualizado

─────────────────────────────────────────────────────────────

Resumo visual do fluxo MOD-006:

US-MOD-006 (DRAFT)
  │ ← passos 1-2: revisão manual (motor transição, 3 históricos, cycle frozen)
  ▼
US-MOD-006 (READY)
  │ ← passo 3: /forge-module
  ▼
mod-006-execucao-casos/ (stubs DRAFT)
  │ ← passo 4: /enrich (11 agentes, 8 fases)
  ▼
mod-006 enriquecido (DRAFT)
  │ ← passos 5-9: /qa + /validate-* (5 validadores — full-stack)
  ▼
mod-006 validado (DRAFT)
  │ ← passo 10: /promote-module
  ▼
mod-006 selado (READY — congelado)
  │ ← passos 11-12: /create-amendment (se necessário)
  ▼
mod-006 + amendments/

---

## MOD-007 — Parametrização Contextual e Rotinas (Behavioral Rules Engine)

─────────────────────────────────────────────────────────────
PASSO    SKILL/AÇÃO    COMANDO / DETALHES    PRÉ-CONDIÇÃO    PÓS-CONDIÇÃO
─────────────────────────────────────────────────────────────

── Fase 0: Pré-Módulo ──

1    (manual)    Revisar e finalizar épico US-MOD-007:    status_agil = DRAFT    status_agil = READY
        - Fechar escopo (Inclui/Não Inclui)        MOD-006 READY (case hook)
        - Validar conceitos chave:        MOD-003 READY (org)
          · context_framer (enquadrador — quem)
          · target_object (o quê)
          · incidence_rule (quando — condição framer→object)
          · behavior_routine (como — items: FIELD_VISIBILITY, REQUIRED, etc.)
        - Validar versionamento rotinas: DRAFT→PUBLISHED→DEPRECATED
        - Validar resolução de conflitos:
          · config-time: bloqueia 422
          · runtime: safety net (mais restritivo vence)
        - Confirmar distinção: behavioral vs integration (routine_type)
        - Preencher DoR completo
        - Aprovar épico (regra cascata)
        Arquivo: docs/04_modules/user-stories/epics/US-MOD-007.md

2    (manual)    Revisar e finalizar features F01-F05:    épico READY    status_agil = READY (F01-F05)
        - F01: API — Framers + Target Objects + Incidence Rules
        - F02: API — Behavioral Routines + Items + Versioning
        - F03: API — Evaluation Motor (hook MOD-006)
        - F04: UX — Framer Configurator (UX-PARAM-001)
        - F05: UX — Routine Catalog (UX-ROTINA-001)
        - Confirmar 9 tabelas de banco
        - Confirmar 7 novos scopes (param:framer:*, param:routine:*, param:engine:*)
        Arquivos: docs/04_modules/user-stories/features/US-MOD-007-F0{1,2,3,4,5}.md

── Fase 1: Gênese do Módulo ──

3    /forge-module    Forjar módulo consumindo US-MOD-007 (READY)    status_agil = READY    mod-007-parametrizacao/ criada
        Gera scaffold completo        estado_item = DRAFT (todos stubs)

── Fase 2: Enriquecimento ──

4    /enrich    Orquestrar 11 agentes para mod-007:    pasta mod-007 existe    Stubs preenchidos (DRAFT)
        Fase exec 1: AGN-DEV-01 (MOD — escala N0/N1/N2)        estado_item permanece DRAFT
        Fase exec 2: AGN-DEV-02 (BR), AGN-DEV-03 (FR)
        Fase exec 3: AGN-DEV-04 (DATA — 9 tabelas: framer_types, framers,
                     target_objects, target_fields, incidence_rules,
                     behavior_routines, routine_items, routine_incidence_links, version_history)
        Fase exec 4: AGN-DEV-05 (INT — hook MOD-006), AGN-DEV-08 (NFR — NO cache, always fresh)
        Fase exec 5: AGN-DEV-06 (SEC — 7 scopes param:*, conflito config-time)
        Fase exec 6: AGN-DEV-07 (UX — consome manifests PARAM-001, ROTINA-001)
        Fase exec 7: AGN-DEV-09 (ADR — conflict resolution strategy), AGN-DEV-10 (PENDENTE)
        Fase exec 8: AGN-DEV-11 (VAL — validação cruzada)

    Alternativa: /enrich-agent para executar agente individual

── Fase 3: Validação ──

5    /qa    Diagnóstico geral pré-promoção    Enriquecimento concluído    Relatório pass/fail

6    /validate-manifest    Validar os 2 manifests contra schema v1:    Manifests existem    Relatório por manifest
        - ux-param-001.config-enquadradores.yaml
        - ux-rotina-001.editor-rotinas.yaml
        Verifica: DOC-UX-010, operationId, RBAC, telemetria

7    /validate-openapi    Validar contratos OpenAPI:    Contratos existem    Relatório Spectral
        - CRUD /context-framers
        - CRUD /target-objects
        - CRUD /incidence-rules
        - CRUD /behavior-routines (+ versioning: fork, publish, deprecate)
        - CRUD /behavior-routines/:id/items
        - POST /engine/evaluate (motor de avaliação)

8    /validate-drizzle    Validar schemas Drizzle:    Schema files existem    Relatório violations
        - framer_types, framers, target_objects, target_fields
        - incidence_rules (FK framer + target_object)
        - behavior_routines (version, status, routine_type)
        - routine_items (type: FIELD_VISIBILITY/REQUIRED/DEFAULT/DOMAIN/VALIDATION)
        - routine_incidence_links
        - Multitenancy, soft-delete, Zod, audit trail

9    /validate-endpoint    Validar endpoints Fastify:    Handler files existem    Relatório por endpoint
        - RBAC guards (param:framer:*, param:routine:*, param:engine:evaluate)
        - Imutabilidade: PUBLISHED não aceita PATCH
        - Conflito config-time retorna 422
        - Motor: NO cache, always fresh
        - domain_events: routine.applied
        - X-Correlation-ID propagado, RFC 9457

    Nota: Passos 7-9 dependem de código existir.

── Fase 4: Promoção ──

10    /promote-module    Selar mod-007 como READY    QA verde (passo 5)    estado_item = READY (congelado)

── Fase 5: Pós-READY ──

11    /update-specification    Se spec precisa de ajuste    estado_item = READY    Delega para create-amendment
12    /create-amendment    Criar amendment formal    estado_item = READY    Amendment criado, CHANGELOG bumped

── Utilitários ──

13    /git    Commit semântico: docs(mod-007): <descrição>    Mudanças staged    Commit PT-BR criado
14    /update-index    Atualizar índices    Arquivos alterados    INDEX.md sincronizado
15    /readme-blueprint    Atualizar README.md    Estrutura alterada    README.md atualizado

─────────────────────────────────────────────────────────────

Resumo visual do fluxo MOD-007:

US-MOD-007 (DRAFT)
  │ ← passos 1-2: revisão manual (4 conceitos, versionamento, conflitos, routine_type)
  ▼
US-MOD-007 (READY)
  │ ← passo 3: /forge-module
  ▼
mod-007-parametrizacao/ (stubs DRAFT)
  │ ← passo 4: /enrich (11 agentes, 8 fases)
  ▼
mod-007 enriquecido (DRAFT)
  │ ← passos 5-9: /qa + /validate-* (5 validadores — full-stack)
  ▼
mod-007 validado (DRAFT)
  │ ← passo 10: /promote-module
  ▼
mod-007 selado (READY — congelado)
  │ ← passos 11-12: /create-amendment (se necessário)
  ▼
mod-007 + amendments/

---

## MOD-008 — Integração Dinâmica Protheus/TOTVS (Outbox & Async Retry)

─────────────────────────────────────────────────────────────
PASSO    SKILL/AÇÃO    COMANDO / DETALHES    PRÉ-CONDIÇÃO    PÓS-CONDIÇÃO
─────────────────────────────────────────────────────────────

── Fase 0: Pré-Módulo ──

1    (manual)    Revisar e finalizar épico US-MOD-008:    status_agil = DRAFT    status_agil = READY
        - Fechar escopo (Inclui/Não Inclui)        MOD-007 READY (rotinas)
        - Validar herança de MOD-007: routine_type='INTEGRATION'        MOD-006 READY (case trigger)
        - Validar fluxo de execução:
          1. Trigger (case transition, event, manual rerun)
          2. Outbox Pattern (INSERT QUEUED antes da fila)
          3. BullMQ worker async → HTTP call → Protheus
          4. Avaliação: SUCCESS | FAILURE | PARTIAL
          5. Retry com backoff (default: 3x, configurável)
          6. DLQ após max retries → reprocess manual com justificativa
        - Confirmar INTEGRATION_CONCURRENCY env var (default: 10)
        - Preencher DoR completo
        - Aprovar épico (regra cascata)
        Arquivo: docs/04_modules/user-stories/epics/US-MOD-008.md

2    (manual)    Revisar e finalizar features F01-F05:    épico READY    status_agil = READY (F01-F05)
        - F01: API — Integration Services Catalog + Routines
        - F02: API — Field Mappings & Parameters
        - F03: API — Execution Motor (BullMQ + Outbox + Retry + DLQ)
        - F04: UX — Integration Routine Editor (UX-INTEG-001)
        - F05: UX — Integration Monitor (UX-INTEG-002)
        - Confirmar 6 tabelas de banco
        - Confirmar 6 novos scopes (integration:*)
        Arquivos: docs/04_modules/user-stories/features/US-MOD-008-F0{1,2,3,4,5}.md

── Fase 1: Gênese do Módulo ──

3    /forge-module    Forjar módulo consumindo US-MOD-008 (READY)    status_agil = READY    mod-008-integracao-protheus/ criada
        Gera scaffold completo        estado_item = DRAFT (todos stubs)

── Fase 2: Enriquecimento ──

4    /enrich    Orquestrar 11 agentes para mod-008:    pasta mod-008 existe    Stubs preenchidos (DRAFT)
        Fase exec 1: AGN-DEV-01 (MOD — escala N0/N1/N2)        estado_item permanece DRAFT
        Fase exec 2: AGN-DEV-02 (BR), AGN-DEV-03 (FR)
        Fase exec 3: AGN-DEV-04 (DATA — integration_services, integration_routines,
                     integration_field_mappings, integration_params,
                     integration_call_logs, integration_reprocess_requests)
        Fase exec 4: AGN-DEV-05 (INT — BullMQ, Outbox, Protheus HTTP),
                     AGN-DEV-08 (NFR — concurrency, retry backoff, DLQ)
        Fase exec 5: AGN-DEV-06 (SEC — 6 scopes integration:*, DLQ reprocess audit)
        Fase exec 6: AGN-DEV-07 (UX — consome manifests INTEG-001/002, DLQ red badge)
        Fase exec 7: AGN-DEV-09 (ADR — Outbox Pattern decision), AGN-DEV-10 (PENDENTE)
        Fase exec 8: AGN-DEV-11 (VAL — validação cruzada)

    Alternativa: /enrich-agent para executar agente individual

── Fase 3: Validação ──

5    /qa    Diagnóstico geral pré-promoção    Enriquecimento concluído    Relatório pass/fail

6    /validate-manifest    Validar os 2 manifests contra schema v1:    Manifests existem    Relatório por manifest
        - ux-integ-001.editor-rotinas-integ.yaml
        - ux-integ-002.monitor-integracoes.yaml
        Verifica: DOC-UX-010, operationId, RBAC, telemetria

7    /validate-openapi    Validar contratos OpenAPI:    Contratos existem    Relatório Spectral
        - CRUD /integration-services
        - CRUD /integration-routines
        - CRUD /integration-routines/:id/field-mappings
        - CRUD /integration-routines/:id/params
        - POST /integration-routines/:id/execute
        - GET /integration-call-logs
        - POST /integration-call-logs/:id/reprocess

8    /validate-drizzle    Validar schemas Drizzle:    Schema files existem    Relatório violations
        - integration_services (name, base_url, auth_type)
        - integration_routines (FK service, routine_type='INTEGRATION', HTTP config)
        - integration_field_mappings (source_field, target_field, transform)
        - integration_params (key, value, encrypted)
        - integration_call_logs (status: QUEUED/RUNNING/SUCCESS/FAILURE/PARTIAL, retry_count)
        - integration_reprocess_requests (justification min 20 chars)
        - Multitenancy, soft-delete, Zod, audit trail

9    /validate-endpoint    Validar endpoints Fastify:    Handler files existem    Relatório por endpoint
        - RBAC guards (integration:service:*, integration:routine:*, integration:execute,
          integration:log:read, integration:log:reprocess)
        - Outbox Pattern: transactional insert antes da fila
        - BullMQ worker concurrency via env
        - DLQ handling + reprocess com justificativa
        - X-Correlation-ID propagado, RFC 9457

    Nota: Passos 7-9 dependem de código existir.

── Fase 4: Promoção ──

10    /promote-module    Selar mod-008 como READY    QA verde (passo 5)    estado_item = READY (congelado)

── Fase 5: Pós-READY ──

11    /update-specification    Se spec precisa de ajuste    estado_item = READY    Delega para create-amendment
12    /create-amendment    Criar amendment formal    estado_item = READY    Amendment criado, CHANGELOG bumped

── Utilitários ──

13    /git    Commit semântico: docs(mod-008): <descrição>    Mudanças staged    Commit PT-BR criado
14    /update-index    Atualizar índices    Arquivos alterados    INDEX.md sincronizado
15    /readme-blueprint    Atualizar README.md    Estrutura alterada    README.md atualizado

─────────────────────────────────────────────────────────────

Resumo visual do fluxo MOD-008:

US-MOD-008 (DRAFT)
  │ ← passos 1-2: revisão manual (Outbox, BullMQ, DLQ, retry backoff, Protheus)
  ▼
US-MOD-008 (READY)
  │ ← passo 3: /forge-module
  ▼
mod-008-integracao-protheus/ (stubs DRAFT)
  │ ← passo 4: /enrich (11 agentes, 8 fases)
  ▼
mod-008 enriquecido (DRAFT)
  │ ← passos 5-9: /qa + /validate-* (5 validadores — full-stack)
  ▼
mod-008 validado (DRAFT)
  │ ← passo 10: /promote-module
  ▼
mod-008 selado (READY — congelado)
  │ ← passos 11-12: /create-amendment (se necessário)
  ▼
mod-008 + amendments/

---

## MOD-009 — Controle de Movimentos Sob Aprovação

─────────────────────────────────────────────────────────────
PASSO    SKILL/AÇÃO    COMANDO / DETALHES    PRÉ-CONDIÇÃO    PÓS-CONDIÇÃO
─────────────────────────────────────────────────────────────

── Fase 0: Pré-Módulo ──

1    (manual)    Revisar e finalizar épico US-MOD-009:    status_agil = DRAFT    status_agil = READY
        - Fechar escopo (Inclui/Não Inclui)        MOD-004 READY (identity)
        - Validar princípio: "Origem NÃO é autorização"        MOD-006 READY (cases)
        - Confirmar diferença: Gates (MOD-006) vs Movimentos (MOD-009)        MOD-007 READY (params)
        - Validar 4 critérios de aprovação (combináveis):        MOD-008 READY (integration)
          1. VALUE: operation_value > threshold
          2. HIERARCHY: user.org_level < required_level
          3. ORIGIN: origin_type IN ['API', 'MCP', 'AGENT'] → sempre requer humano
          4. OBJECT: object_type + operation_type
        - Validar exceção auto-aprovação (§3.1):
          solicitante possui required_scope → auto-approve sem inbox
        - Confirmar segregação: solicitante ≠ aprovador
        - Confirmar override com justificativa (min 20 chars)
        - Preencher DoR completo
        - Aprovar épico (regra cascata)
        Arquivo: docs/04_modules/user-stories/epics/US-MOD-009.md

2    (manual)    Revisar e finalizar features F01-F05:    épico READY    status_agil = READY (F01-F05)
        - F01: API — Movement Control Rules + Approval Rules
        - F02: API — Control Motor (interception + movement creation)
        - F03: API — Approval Inbox + Execution + Override
        - F04: UX — Approval Inbox (UX-APROV-001)
        - F05: UX — Rules Configurator (UX-APROV-002)
        - Confirmar 7 tabelas de banco
        - Confirmar 7 novos scopes (approval:*)
        Arquivos: docs/04_modules/user-stories/features/US-MOD-009-F0{1,2,3,4,5}.md

── Fase 1: Gênese do Módulo ──

3    /forge-module    Forjar módulo consumindo US-MOD-009 (READY)    status_agil = READY    mod-009-movimentos-aprovacao/ criada
        Gera scaffold completo        estado_item = DRAFT (todos stubs)

── Fase 2: Enriquecimento ──

4    /enrich    Orquestrar 11 agentes para mod-009:    pasta mod-009 existe    Stubs preenchidos (DRAFT)
        Fase exec 1: AGN-DEV-01 (MOD — escala N0/N1/N2)        estado_item permanece DRAFT
        Fase exec 2: AGN-DEV-02 (BR), AGN-DEV-03 (FR)
        Fase exec 3: AGN-DEV-04 (DATA — movement_control_rules, approval_rules,
                     controlled_movements, approval_instances,
                     movement_executions, movement_history, movement_override_log)
        Fase exec 4: AGN-DEV-05 (INT — motor interception), AGN-DEV-08 (NFR)
        Fase exec 5: AGN-DEV-06 (SEC — segregação, auto-scope exception,
                     override audit, 7 scopes approval:*)
        Fase exec 6: AGN-DEV-07 (UX — consome manifests APROV-001/002)
        Fase exec 7: AGN-DEV-09 (ADR — origem ≠ autorização), AGN-DEV-10 (PENDENTE)
        Fase exec 8: AGN-DEV-11 (VAL — validação cruzada)

    Alternativa: /enrich-agent para executar agente individual

── Fase 3: Validação ──

5    /qa    Diagnóstico geral pré-promoção    Enriquecimento concluído    Relatório pass/fail

6    /validate-manifest    Validar os 2 manifests contra schema v1:    Manifests existem    Relatório por manifest
        - ux-aprov-001.inbox-aprovacoes.yaml
        - ux-aprov-002.config-regras.yaml
        Verifica: DOC-UX-010, operationId, RBAC, telemetria

7    /validate-openapi    Validar contratos OpenAPI:    Contratos existem    Relatório Spectral
        - CRUD /movement-control-rules
        - CRUD /approval-rules
        - POST /movements/evaluate (motor de controle)
        - GET /approval-inbox
        - POST /approval-inbox/:id/approve
        - POST /approval-inbox/:id/reject
        - POST /approval-inbox/:id/override
        - GET /movements, GET /movements/:id

8    /validate-drizzle    Validar schemas Drizzle:    Schema files existem    Relatório violations
        - movement_control_rules (criteria: VALUE/HIERARCHY/ORIGIN/OBJECT)
        - approval_rules (required_scope, threshold, approval_level)
        - controlled_movements (status, origin_type, operation_value)
        - approval_instances (approver_id ≠ requester_id, decision)
        - movement_executions (result, executed_at)
        - movement_history (full audit trail)
        - movement_override_log (justification min 20 chars, override_by)
        - Multitenancy, soft-delete, Zod, audit trail

9    /validate-endpoint    Validar endpoints Fastify:    Handler files existem    Relatório por endpoint
        - RBAC guards (approval:rule:*, approval:engine:evaluate,
          approval:movement:*, approval:decide, approval:override)
        - Segregação: solicitante ≠ aprovador (exceto auto-scope)
        - Override: justificativa obrigatória min 20 chars
        - 4 critérios combináveis no motor
        - X-Correlation-ID propagado, RFC 9457

    Nota: Passos 7-9 dependem de código existir.

── Fase 4: Promoção ──

10    /promote-module    Selar mod-009 como READY    QA verde (passo 5)    estado_item = READY (congelado)

── Fase 5: Pós-READY ──

11    /update-specification    Se spec precisa de ajuste    estado_item = READY    Delega para create-amendment
12    /create-amendment    Criar amendment formal    estado_item = READY    Amendment criado, CHANGELOG bumped

── Utilitários ──

13    /git    Commit semântico: docs(mod-009): <descrição>    Mudanças staged    Commit PT-BR criado
14    /update-index    Atualizar índices    Arquivos alterados    INDEX.md sincronizado
15    /readme-blueprint    Atualizar README.md    Estrutura alterada    README.md atualizado

─────────────────────────────────────────────────────────────

Resumo visual do fluxo MOD-009:

US-MOD-009 (DRAFT)
  │ ← passos 1-2: revisão manual (4 critérios, segregação, auto-scope, override)
  ▼
US-MOD-009 (READY)
  │ ← passo 3: /forge-module
  ▼
mod-009-movimentos-aprovacao/ (stubs DRAFT)
  │ ← passo 4: /enrich (11 agentes, 8 fases)
  ▼
mod-009 enriquecido (DRAFT)
  │ ← passos 5-9: /qa + /validate-* (5 validadores — full-stack)
  ▼
mod-009 validado (DRAFT)
  │ ← passo 10: /promote-module
  ▼
mod-009 selado (READY — congelado)
  │ ← passos 11-12: /create-amendment (se necessário)
  ▼
mod-009 + amendments/

---

## MOD-010 — MCP e Automação Governada

─────────────────────────────────────────────────────────────
PASSO    SKILL/AÇÃO    COMANDO / DETALHES    PRÉ-CONDIÇÃO    PÓS-CONDIÇÃO
─────────────────────────────────────────────────────────────

── Fase 0: Pré-Módulo ──

1    (manual)    Revisar e finalizar épico US-MOD-010:    status_agil = DRAFT    status_agil = READY
        - Fechar escopo (Inclui/Não Inclui)        MOD-004 READY (identity)
        - Validar regra: "User can approve ≠ agent can approve"        MOD-007 READY (params)
        - Confirmar blocklist Fase 1 (permanente):        MOD-008 READY (integration)
          \*:delete, \*:approve, approval:decide,        MOD-009 READY (approval)
          approval:override, \*:sign, \*:execute
        - Confirmar Fase 2 (após MCP validado em prod):
          *:create — liberação per-agent com aprovação explícita do owner
        - Validar 3 políticas de execução:
          1. DIRECT: execução imediata (low-risk)
          2. CONTROLLED: passa pelo motor MOD-009 → decisão humana
          3. EVENT_ONLY: emite domain_event apenas (sem escrita)
        - Confirmar: API key retornada apenas na criação (nunca em GET)
        - Confirmar: tentativa de escalação → sensitivity_level=2, trigger alert
        - Preencher DoR completo
        - Aprovar épico (regra cascata)
        Arquivo: docs/04_modules/user-stories/epics/US-MOD-010.md

2    (manual)    Revisar e finalizar features F01-F05:    épico READY    status_agil = READY (F01-F05)
        - F01: API — MCP Agents + Action Catalog
        - F02: API — Gateway + Dispatch Motor
        - F03: API — Execution Log
        - F04: UX — Agent & Action Management (UX-MCP-001)
        - F05: UX — Execution Monitor (UX-MCP-002)
        - Confirmar 5 tabelas de banco
        - Confirmar 6 novos scopes (mcp:*)
        Arquivos: docs/04_modules/user-stories/features/US-MOD-010-F0{1,2,3,4,5}.md

── Fase 1: Gênese do Módulo ──

3    /forge-module    Forjar módulo consumindo US-MOD-010 (READY)    status_agil = READY    mod-010-mcp-automacao/ criada
        Gera scaffold completo        estado_item = DRAFT (todos stubs)

── Fase 2: Enriquecimento ──

4    /enrich    Orquestrar 11 agentes para mod-010:    pasta mod-010 existe    Stubs preenchidos (DRAFT)
        Fase exec 1: AGN-DEV-01 (MOD — escala N0/N1/N2)        estado_item permanece DRAFT
        Fase exec 2: AGN-DEV-02 (BR), AGN-DEV-03 (FR)
        Fase exec 3: AGN-DEV-04 (DATA — mcp_agents, mcp_action_types,
                     mcp_actions, mcp_executions, mcp_agent_action_links)
        Fase exec 4: AGN-DEV-05 (INT — gateway dispatch, MOD-009 motor),
                     AGN-DEV-08 (NFR — API key security, escalation alert)
        Fase exec 5: AGN-DEV-06 (SEC — blocklist Fase 1/2, 3 políticas,
                     6 scopes mcp:*, API key never in GET, escalation detection)
        Fase exec 6: AGN-DEV-07 (UX — consome manifests MCP-001/002)
        Fase exec 7: AGN-DEV-09 (ADR — blocklist governance), AGN-DEV-10 (PENDENTE)
        Fase exec 8: AGN-DEV-11 (VAL — validação cruzada)

    Alternativa: /enrich-agent para executar agente individual

── Fase 3: Validação ──

5    /qa    Diagnóstico geral pré-promoção    Enriquecimento concluído    Relatório pass/fail

6    /validate-manifest    Validar os 2 manifests contra schema v1:    Manifests existem    Relatório por manifest
        - ux-mcp-001.gestao-agentes.yaml
        - ux-mcp-002.monitor-execucoes.yaml
        Verifica: DOC-UX-010, operationId, RBAC, telemetria

7    /validate-openapi    Validar contratos OpenAPI:    Contratos existem    Relatório Spectral
        - CRUD /mcp-agents (POST retorna api_key uma vez)
        - POST /mcp-agents/:id/revoke
        - CRUD /mcp-action-types
        - CRUD /mcp-actions
        - POST /mcp-agents/:id/actions/:actionId/dispatch (gateway)
        - GET /mcp-executions (log)

8    /validate-drizzle    Validar schemas Drizzle:    Schema files existem    Relatório violations
        - mcp_agents (name, api_key_hash, status, owner_id)
        - mcp_action_types (name, execution_policy: DIRECT/CONTROLLED/EVENT_ONLY)
        - mcp_actions (FK agent + action_type, enabled)
        - mcp_executions (status, sensitivity_level, policy_applied)
        - mcp_agent_action_links (FK agent + action)
        - Multitenancy, soft-delete, Zod, audit trail
        - API key: armazenar apenas hash, nunca plaintext

9    /validate-endpoint    Validar endpoints Fastify:    Handler files existem    Relatório por endpoint
        - RBAC guards (mcp:agent:*, mcp:action:*, mcp:log:read)
        - Blocklist enforcement: rejeitar ações bloqueadas
        - Policy routing: DIRECT/CONTROLLED/EVENT_ONLY
        - CONTROLLED → delega para MOD-009 motor
        - API key retornada apenas no POST de criação
        - Escalation detection → sensitivity_level=2
        - X-Correlation-ID propagado, RFC 9457

    Nota: Passos 7-9 dependem de código existir.

── Fase 4: Promoção ──

10    /promote-module    Selar mod-010 como READY    QA verde (passo 5)    estado_item = READY (congelado)

── Fase 5: Pós-READY ──

11    /update-specification    Se spec precisa de ajuste    estado_item = READY    Delega para create-amendment
12    /create-amendment    Criar amendment formal    estado_item = READY    Amendment criado, CHANGELOG bumped

── Utilitários ──

13    /git    Commit semântico: docs(mod-010): <descrição>    Mudanças staged    Commit PT-BR criado
14    /update-index    Atualizar índices    Arquivos alterados    INDEX.md sincronizado
15    /readme-blueprint    Atualizar README.md    Estrutura alterada    README.md atualizado

─────────────────────────────────────────────────────────────

Resumo visual do fluxo MOD-010:

US-MOD-010 (DRAFT)
  │ ← passos 1-2: revisão manual (blocklist, 3 políticas, API key, escalation)
  ▼
US-MOD-010 (READY)
  │ ← passo 3: /forge-module
  ▼
mod-010-mcp-automacao/ (stubs DRAFT)
  │ ← passo 4: /enrich (11 agentes, 8 fases)
  ▼
mod-010 enriquecido (DRAFT)
  │ ← passos 5-9: /qa + /validate-* (5 validadores — full-stack)
  ▼
mod-010 validado (DRAFT)
  │ ← passo 10: /promote-module
  ▼
mod-010 selado (READY — congelado)
  │ ← passos 11-12: /create-amendment (se necessário)
  ▼
mod-010 + amendments/

---

## MOD-011 — SmartGrid (Edição em Massa)

─────────────────────────────────────────────────────────────
PASSO    SKILL/AÇÃO    COMANDO / DETALHES    PRÉ-CONDIÇÃO    PÓS-CONDIÇÃO
─────────────────────────────────────────────────────────────

── Fase 0: Pré-Módulo ──

1    (manual)    Revisar e finalizar épico US-MOD-011:    status_agil = DRAFT    status_agil = READY
        - Fechar escopo (Inclui/Não Inclui)        MOD-007-F03 READY (motor)
        - Confirmar: MOD-011 é PURE UX consumer de MOD-007
        - Sem regras de negócio próprias
        - Validar nomenclatura: "Operação" → context_framer (type=OPERACAO)
        - Confirmar: sem persistência server-side de draft (Export/Import JSON client)
        - Confirmar motor chamado 1 objeto por vez (sem batch endpoint MOD-007 v1)
        - Verificar pendências:
          · PEND-SGR-01: Motor output → visual state mapping
          · PEND-SGR-02: current_record_state no motor (bloqueia F01, F03, F04)
        - Preencher DoR completo
        - Aprovar épico (regra cascata)
        Arquivo: docs/04_modules/user-stories/epics/US-MOD-011.md

2    (manual)    Revisar e finalizar features F01-F05:    épico READY    status_agil = READY (F01-F05)
        - F01: API Amendment — MOD-007-F03 suporte current_record_state
        - F02: UX — Bulk Inclusion Grid (UX-SGR-001)
        - F03: UX — Record Edit Form (UX-SGR-002)
        - F04: UX — Bulk Deletion Grid (UX-SGR-003)
        - F05: UX — Bulk Actions on Rows (parte de UX-SGR-001)
        - Verificar resolução de PEND-SGR-01 e PEND-SGR-02
        Arquivos: docs/04_modules/user-stories/features/US-MOD-011-F0{1,2,3,4,5}.md

── Fase 1: Gênese do Módulo ──

3    /forge-module    Forjar módulo consumindo US-MOD-011 (READY)    status_agil = READY    mod-011-smartgrid/ criada
        Gera scaffold completo        estado_item = DRAFT (todos stubs)

── Fase 2: Enriquecimento ──

4    /enrich    Orquestrar 11 agentes para mod-011:    pasta mod-011 existe    Stubs preenchidos (DRAFT)
        Fase exec 1: AGN-DEV-01 (MOD — escala N0/N1/N2)        estado_item permanece DRAFT
        Fase exec 2: AGN-DEV-02 (BR), AGN-DEV-03 (FR)
        Fase exec 3: AGN-DEV-04 (DATA — sem tabelas próprias, consome MOD-007)
        Fase exec 4: AGN-DEV-05 (INT — chamada motor MOD-007-F03),
                     AGN-DEV-08 (NFR — performance bulk, JSON export/import)
        Fase exec 5: AGN-DEV-06 (SEC — herda scopes MOD-007, sem scopes novos)
        Fase exec 6: AGN-DEV-07 (UX — consome manifests SGR-001/002/003)
        Fase exec 7: AGN-DEV-09 (ADR — pure UX consumer decision), AGN-DEV-10 (PENDENTE — SGR-01/02)
        Fase exec 8: AGN-DEV-11 (VAL — validação cruzada)

    Alternativa: /enrich-agent para executar agente individual

── Fase 3: Validação ──

5    /qa    Diagnóstico geral pré-promoção    Enriquecimento concluído    Relatório pass/fail

6    /validate-manifest    Validar os 3 manifests contra schema v1:    Manifests existem    Relatório por manifest
        - ux-sgr-001.inclusao-massa.yaml
        - ux-sgr-002.alteracao-registro.yaml
        - ux-sgr-003.exclusao-massa.yaml
        Verifica: DOC-UX-010, operationId, RBAC, telemetria

7    /validate-openapi    Parcial — F01 cria amendment em MOD-007-F03:    Contrato MOD-007 existe    Relatório Spectral
        - Validar extensão de POST /engine/evaluate
          para aceitar current_record_state
        Demais endpoints são de MOD-007 (já validados).

8    /validate-drizzle    N/A — MOD-011 é UX-only    —    —
        Sem schemas Drizzle próprios.
        F01 é amendment ao schema de MOD-007.

9    /validate-endpoint    N/A — MOD-011 é UX-only    —    —
        Sem handlers Fastify próprios.
        F01 é amendment ao handler de MOD-007.

── Fase 4: Promoção ──

10    /promote-module    Selar mod-011 como READY    QA verde (passo 5)    estado_item = READY (congelado)

── Fase 5: Pós-READY ──

11    /update-specification    Se spec precisa de ajuste    estado_item = READY    Delega para create-amendment
12    /create-amendment    Criar amendment formal    estado_item = READY    Amendment criado, CHANGELOG bumped

── Utilitários ──

13    /git    Commit semântico: docs(mod-011): <descrição>    Mudanças staged    Commit PT-BR criado
14    /update-index    Atualizar índices    Arquivos alterados    INDEX.md sincronizado
15    /readme-blueprint    Atualizar README.md    Estrutura alterada    README.md atualizado

─────────────────────────────────────────────────────────────

Resumo visual do fluxo MOD-011:

US-MOD-011 (DRAFT)
  │ ← passos 1-2: revisão manual (pure UX, pendências SGR-01/02, sem draft server)
  ▼
US-MOD-011 (READY)
  │ ← passo 3: /forge-module
  ▼
mod-011-smartgrid/ (stubs DRAFT)
  │ ← passo 4: /enrich (11 agentes, 8 fases)
  ▼
mod-011 enriquecido (DRAFT)
  │ ← passos 5-7: /qa + /validate-manifest + /validate-openapi (parcial)
  ▼
mod-011 validado (DRAFT)
  │ ← passo 10: /promote-module
  ▼
mod-011 selado (READY — congelado)
  │ ← passos 11-12: /create-amendment (se necessário)
  ▼
mod-011 + amendments/

---

## Cadeia de Dependências (Ordem Sugerida de Execução)

    MOD-000 (Foundation) ─────────────────────────────────── alicerce de tudo
      ├─ MOD-001 (Backoffice Admin) ──────────────────────── UX shell
      ├─ MOD-002 (Gestão Usuários) ───────────────────────── UX user mgmt
      ├─ MOD-003 (Estrutura Org) ─────────────────────────── full-stack org tree
      │    └─ MOD-004 (Identidade Avançada) ──────────────── sharing & delegation
      ├─ MOD-005 (Modelagem Processos) ───────────────────── blueprint standalone
      │    └─ MOD-006 (Execução Casos) ───────────────────── depends MOD-005+003+004
      │         └─ MOD-007 (Parametrização) ──────────────── depends MOD-006+003
      │              ├─ MOD-008 (Integração Protheus) ────── depends MOD-007+006
      │              │    └─ MOD-009 (Movimentos Aprovação)─ depends MOD-004+006+007+008
      │              │         └─ MOD-010 (MCP Automação) ── depends MOD-004+007+008+009
      │              └─ MOD-011 (SmartGrid) ──────────────── depends MOD-007-F03

### Waves de Entrega Sugeridas

| Wave | Módulos | Justificativa |
|------|---------|---------------|
| Wave 0 | MOD-000 | Alicerce — tudo depende dele |
| Wave 1 | MOD-001, MOD-002, MOD-003, MOD-005 | Independentes entre si (exceto MOD-000) |
| Wave 2 | MOD-004, MOD-006 | Dependem de Wave 1 |
| Wave 3 | MOD-007 | Depende de MOD-006 |
| Wave 4 | MOD-008, MOD-011 | Dependem de MOD-007 |
| Wave 5 | MOD-009 | Depende de MOD-004+006+007+008 |
| Wave 6 | MOD-010 | Depende de MOD-009 (último na cadeia) |
