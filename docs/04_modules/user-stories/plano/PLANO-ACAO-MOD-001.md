# Procedimento — Plano de Acao MOD-001 Backoffice Admin

> **Versao:** 2.0.0 | **Data:** 2026-03-23 | **Owner:** arquitetura
> **Estado atual do modulo:** DRAFT (v0.10.0) | **Epico:** READY (v0.5.0) | **Features:** 3/3 READY
>
> Fases 0-3 concluidas (validate-all PASS 2026-03-22). Proximo passo: Fase 4 (Promocao) — executar `/promote-module`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-001 | READY (v0.5.0) | DoR completo, 3 features vinculadas, abordagem UX-First |
| Features F01-F03 | 3/3 READY | F01 (Shell Auth + Layout), F02 (Telemetria UI), F03 (Dashboard Executivo) |
| Scaffold (forge-module) | CONCLUIDO | mod-001-backoffice-admin/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | Agentes 01-10 confirmados, v0.10.0, 4 pendentes resolvidas |
| PENDENTEs | 0 abertas | 4 total: 4 IMPLEMENTADA |
| ADRs | 3 aceitas | Nivel 1 requer minimo 1 — atendido (ADR-001 Clean Leve, ADR-002 Telemetria, ADR-003 Zero-Blank-Screen) |
| Amendments | 0 | Nenhum |
| Requirements | 12/12 existem | BR(1), FR(2), DATA(2), INT(2), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v0.9.1 | Ultima entrada 2026-03-17 (Etapa 4 pipeline) |
| Screen Manifests | 3/3 existem | ux-auth-001, ux-shell-001, ux-dash-001 |
| Dependencias | 1 upstream (MOD-000) | Consome auth_login, auth_logout, auth_me, auth_forgot_password, auth_reset_password, auth_change_password |
| Bloqueios | 0 | Nenhum BLK-* afeta MOD-001 |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-001 define o primeiro modulo de negocio construido sobre o Foundation, com abordagem UX-First: Screen Manifests YAML e User Stories orientadas a UX sao definidos **antes** de qualquer geracao de codigo backend. O modulo cobre Shell de Autenticacao, Application Shell e Dashboard Executivo.

```
1    (manual)              Revisar e finalizar epico US-MOD-001:             CONCLUIDO
                           - Escopo fechado (3 features UX-First)           status_agil = READY
                           - Gherkin validado (cascata, manifests, telemetria)  v0.5.0
                           - DoR completo (schema v1, 3 manifests, operationIds)
                           - Abordagem UX-First formalizada
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-001.md

2    (manual)              Revisar e finalizar features F01-F03:             CONCLUIDO
                           - F01: Shell Auth + Layout Base                  3/3 READY
                           - F02: Telemetria UI e Rastreabilidade
                           - F03: Dashboard Administrativo Executivo
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-001-F{01..03}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Primeiro modulo UX-First pos-Foundation. Scaffoldado em 2026-03-16 apos rollback de uma tentativa anterior (v0.3.0 do epico registra rollback de scaffold destruido).

```
3    /forge-module MOD-001  Scaffold completo gerado:                        CONCLUIDO
                           mod-001-backoffice-admin.md, CHANGELOG.md,       v0.1.0 (2026-03-16)
                           requirements/ (br/, fr/, data/, int/, sec/,
                           ux/, nfr/), adr/, amendments/
                           Stubs obrigatorios: DATA-003, SEC-002
                           Pasta: docs/04_modules/mod-001-backoffice-admin/
```

### Fase 2: Enriquecimento — CONCLUIDA

O enriquecimento do MOD-001 foi completo — todos os agentes rodaram entre 2026-03-16 e 2026-03-18. Durante o processo, 4 pendencias foram identificadas e todas resolvidas. Destaque para PENDENTE-003 que expandiu o escopo com FR-007 (Alterar Senha) e INT-006.

> **Decision tree de enriquecimento:**
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-001
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-001

```
4    /enrich docs/04_modules/mod-001-backoffice-admin/
                           Agentes executados sobre mod-001:                 CONCLUIDO
                           AGN-DEV-01 (MOD), AGN-DEV-02 (BR),              v0.10.0 (2026-03-17)
                           AGN-DEV-03 (FR), AGN-DEV-04 (DATA),
                           AGN-DEV-05 (INT), AGN-DEV-06 (SEC),
                           AGN-DEV-07 (UX), AGN-DEV-08 (NFR),
                           AGN-DEV-09 (ADR), AGN-DEV-10 (PEN)
                           4 pendentes criadas e resolvidas (001-004)
```

#### Rastreio de Agentes — MOD-001

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-001-backoffice-admin.md | CONCLUIDO | CHANGELOG v0.2.0, v0.9.1 — Nivel 1 confirmado, pipeline corrigido |
| 2 | AGN-DEV-02 | BR | BR-001.md | CONCLUIDO | v0.4.0 — BR-009/BR-010 adicionadas (skeleton timeout, erro 5xx) |
| 3 | AGN-DEV-03 | FR | FR-001.md, FR-007.md | CONCLUIDO | FR-001 v0.4.0, FR-007 v0.1.0 (Alterar Senha — PENDENTE-003) |
| 4 | AGN-DEV-04 | DATA | DATA-001.md, DATA-003.md | CONCLUIDO | DATA-001 v0.4.0, DATA-003 v0.5.0 (UIActionEnvelope change_password) |
| 5 | AGN-DEV-05 | INT | INT-001.md, INT-006.md | CONCLUIDO | INT-001 v0.5.0, INT-006 v0.1.0 (POST /auth/change-password) |
| 6 | AGN-DEV-06 | SEC | SEC-001.md, SEC-002.md | CONCLUIDO | SEC-001 v0.4.0, SEC-002 v0.5.0 (auth.password_changed na matriz) |
| 7 | AGN-DEV-07 | UX | UX-001.md | CONCLUIDO | v0.6.0 — mapeamento Acoes→Endpoints→Events, submit_change_password |
| 8 | AGN-DEV-08 | NFR | NFR-001.md | CONCLUIDO | v0.4.0 — zero-blank-screen, resiliencia, telemetria retry |
| 9 | AGN-DEV-09 | ADR | ADR-001, ADR-002, ADR-003 | CONCLUIDO | 3 ADRs criadas e aceitas |
| 10 | AGN-DEV-10 | PEN | pen-001-pendente.md | CONCLUIDO | v0.12.0 — 4 pendentes criadas e resolvidas |

#### Pendentes Resolvidas — Resumo Compacto

| # | ID | Status | Sev. | Decisao (resumo) | Artefato |
|---|-----|--------|------|-------------------|----------|
| 1 | PENDENTE-001 | IMPLEMENTADA | MEDIA | Opcao C — React Query/SWR cache 30s | FR-004, FR-005 |
| 2 | PENDENTE-002 | IMPLEMENTADA | BAIXA | Opcao B — Sidebar empty state com icone | FR-004, UX-001 |
| 3 | PENDENTE-003 | IMPLEMENTADA | ALTA | Opcao A — FR-007 + INT-006 Alterar Senha | FR-007, INT-006, DATA-003 |
| 4 | PENDENTE-004 | IMPLEMENTADA | MEDIA | Opcao B — fallback defensivo MFA redirect | FR-001 v0.6.0 |

> Detalhes completos: requirements/pen-001-pendente.md

### Fase 3: Validacao — CONCLUIDA

O `/validate-all` foi executado em 2026-03-22 e todos os validadores aplicaveis retornaram PASS (29/29 manifests globais aprovados). O MOD-001 passou em todos os checks aplicaveis.

> **Decision tree de validacao:**
> Quero validar tudo de uma vez?
> ├── SIM → /validate-all (orquestra todos, pula os que nao tem artefato)
> └── NAO → Qual pilar?
>     ├── Sintaxe/links/metadados → /qa
>     ├── Screen manifests       → /validate-manifest
>     ├── Contratos OpenAPI      → /validate-openapi
>     ├── Schemas Drizzle        → /validate-drizzle
>     └── Endpoints Fastify      → /validate-endpoint

```
5    /validate-all docs/04_modules/mod-001-backoffice-admin/
                           Orquestra TODAS as validacoes em sequencia:        CONCLUIDO (2026-03-22)
                           Internamente executa:                              PASS
                             1. /qa .......................... PASS
                             2. /validate-manifest ........... PASS (3 manifests)
                             3. /validate-openapi → N/A (UX-First, sem backend)
                             4. /validate-drizzle → N/A (UX-First, sem entidades)
                             5. /validate-endpoint → N/A (UX-First, sem handlers)
                           Pre-condicao: Enriquecimento concluido ✓
                           Pos-condicao: Relatorio consolidado PASS
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Resultado | Artefatos |
|---|-----------|-------------------|-----------|-----------|
| 1 | `/qa` | SIM (todos) | PASS | mod-001-backoffice-admin.md, requirements/*, adr/*, CHANGELOG.md |
| 2 | `/validate-manifest` | SIM (3 manifests existem) | PASS | ux-auth-001, ux-shell-001, ux-dash-001 |
| 3 | `/validate-openapi` | N/A | N/A | UX-First — sem backend proprio (endpoints sao do MOD-000) |
| 4 | `/validate-drizzle` | N/A | N/A | UX-First — sem entidades de banco proprias |
| 5 | `/validate-endpoint` | N/A | N/A | UX-First — sem handlers Fastify proprios |

### Fase 4: Promocao — PENDENTE

Com a Fase 3 concluida com sucesso, o modulo esta apto para promocao. Todos os criterios do Gate 0 (DoR) estao atendidos.

```
10   /promote-module docs/04_modules/mod-001-backoffice-admin/
                           Selar mod-001 como READY:                         A EXECUTAR
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (4/4 IMPLEMENTADA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (12/12)
                             [DoR-3] Zero erros de lint? ................ SIM (validate-all PASS)
                             [DoR-4] Screen manifests validados? ........ SIM (validate-all PASS)
                             [DoR-5] ADRs conforme nivel? ............... SIM (3 >= 1 para N1)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v0.9.1)
                             [DoR-7] Bloqueios cross-modulo? ............ SIM (0 bloqueios)

                           Fluxo interno:
                             Step 1: /qa (pre-check)
                             Step 2: Promover estado_item DRAFT→READY
                             Step 3: /qa (pos-check)
                             Step 4: /update-index
                             Step 5: /git commit
                           Pre-condicao: QA verde, DoR-1..7 atendidos
                           Pos-condicao: estado_item = READY, INDEX.md atualizado, commit
```

> **Nota:** MOD-001 depende de MOD-000 (Foundation) que ainda esta DRAFT. A promocao do MOD-001 pode ocorrer independentemente — o DoR nao exige que dependencias upstream estejam READY (apenas que existam). Porem, o codigo so pode ser gerado quando MOD-000 estiver READY (endpoints implementados).

### Fase 5: Pos-READY (quando necessario)

```
11   /update-specification docs/04_modules/mod-001-backoffice-admin/requirements/fr/FR-001.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

12   /create-amendment FR-001 melhoria "adicionar tela MFA"
                           Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
                           Caso de uso previsto: UX-MFA-001 (tela MFA)
                           quando MOD-000 ativar MFA e o roadmap mudar
```

### Gestao de Pendencias (qualquer momento)

> **Decision tree de pendencias:**
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-001
> ├── Criar nova pendencia     → /manage-pendentes create PEN-001
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-001 PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-001 PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-001 PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-001 PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-001

```
16   /manage-pendentes list PEN-001
                           Estado atual MOD-001:
                             PEN-001: 4 itens total
                               4 IMPLEMENTADA (001-004)
                               0 ABERTA
                             SLA: nenhum vencido
```

| # | ID | Status | Sev. | Decisao (resumo) | Artefato |
|---|-----|--------|------|-------------------|----------|
| 1 | PENDENTE-001 | IMPLEMENTADA | MEDIA | Opcao C — React Query/SWR cache 30s | FR-004, FR-005 |
| 2 | PENDENTE-002 | IMPLEMENTADA | BAIXA | Opcao B — Sidebar empty state | FR-004, UX-001 |
| 3 | PENDENTE-003 | IMPLEMENTADA | ALTA | Opcao A — FR-007 + INT-006 Alterar Senha | FR-007, INT-006, DATA-003 |
| 4 | PENDENTE-004 | IMPLEMENTADA | MEDIA | Opcao B — fallback MFA redirect | FR-001 v0.6.0 |

> Detalhes completos: requirements/pen-001-pendente.md

### Utilitarios (qualquer momento)

```
14   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-001): <descricao>

15   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

17   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-001

```
US-MOD-001 (READY v0.5.0)              ← Fase 0: CONCLUIDA
  │  3/3 features READY (UX-First)
  ▼
mod-001-backoffice-admin/ (stubs DRAFT) ← Fase 1: CONCLUIDA (forge-module v0.1.0)
  │
  ▼
mod-001 enriquecido (DRAFT v0.10.0)     ← Fase 2: CONCLUIDA (10 agentes, 4 PENDENTEs resolvidas)
  │
  ▼
mod-001 validado (DRAFT)                ← Fase 3: CONCLUIDA (validate-all PASS 2026-03-22)
  │
  ├── ★ PROXIMO PASSO: /promote-module
  │     Gate 0 (DoR): 7/7 atendidos
  │
  ▼
mod-001 selado (READY)                  ← Fase 4: A EXECUTAR
  │
  ▼
mod-001 + amendments/                   ← Fase 5: SOB DEMANDA (0 amendments)

Dependencia upstream: MOD-000 (Foundation) — camada topologica 1.
MOD-001 prove Application Shell para MOD-002+ (Sidebar, Header, Breadcrumb).
```

---

## Particularidades do MOD-001

| Aspecto | Detalhe |
|---------|---------|
| Modulo UX-First | Nao possui backend proprio — consome endpoints do MOD-000 (Foundation). Os validadores `/validate-openapi`, `/validate-drizzle` e `/validate-endpoint` sao N/A. Apenas `/qa` e `/validate-manifest` sao aplicaveis. |
| Nivel 1 — Clean Leve (Score 1/6) | Unico gatilho ativo: multi-tenant (Sidebar filtrada por scopes). Score 1/6 qualificaria para Nivel 0, mas Nivel 1 escolhido por testabilidade e evolucao prevista (ADR-001). |
| Provedor do Application Shell | MOD-002+ utilizam o Shell provido por este modulo (Sidebar, Header, Breadcrumb). Promover MOD-001 e relevante para a cadeia de frontend, mas nao bloqueia modulos backend. |
| 3 ADRs para Nivel 1 | Excede o minimo de 1 ADR. ADR-001 (Clean Leve), ADR-002 (Telemetria Pre/Pos-Auth), ADR-003 (Zero-Blank-Screen com Skeleton Timeout 3s). A riqueza de ADRs reflete decisoes de UX nao-obvias. |
| Dependencia exclusiva de MOD-000 | Todos os 6 operationIds consumidos sao do Foundation: auth_login, auth_logout, auth_me, auth_forgot_password, auth_reset_password, auth_change_password. Nenhuma integracao externa. |
| Escopo expandido pos-enriquecimento | PENDENTE-003 expandiu o escopo com FR-007 (Alterar Senha) e INT-006, passando de 10 para 12 artefatos de requisitos. A UX do ProfileWidget ficou completa. |

---

## Checklist Rapido — O que Falta para READY

- [ ] Executar `/promote-module docs/04_modules/mod-001-backoffice-admin/` — verificar Gate 0 (DoR) 7/7

> **Nota:** Todas as 4 pendencias ja estao IMPLEMENTADA. Os 12 artefatos de requisitos estao enriquecidos. As 3 ADRs excedem o minimo para Nivel 1. Nao ha bloqueios (BLK-*) afetando MOD-001. A validacao (Fase 3) foi concluida com PASS em 2026-03-22. A unica dependencia upstream (MOD-000) esta DRAFT mas isso nao impede a promocao da especificacao — apenas a geracao de codigo.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 2.0.0 | 2026-03-23 | Recriacao: Fase 3 atualizada para CONCLUIDA (validate-all PASS 2026-03-22), Gate 0 DoR 7/7 atendidos, Fase 4 como proximo passo, pendencias em formato compacto com referencia ao pen file |
| 1.0.0 | 2026-03-22 | Criacao completa: Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 4 pendentes resolvidas, rastreio de agentes, mapa de cobertura de validadores, particularidades UX-First |
