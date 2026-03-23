# Procedimento — Plano de Acao MOD-004 Identidade Avancada

> **Versao:** 3.0.0 | **Data:** 2026-03-23 | **Owner:** Marcos Sulivan
> **Estado atual do modulo:** DRAFT (v0.9.0) | **Epico:** READY (v1.1.0) | **Features:** 4/4 READY
>
> Fases 0-3 concluidas (validate-all PASS em 2026-03-22). Proximo passo: Fase 4 (Promocao) — executar `/promote-module`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-004 | READY (v1.1.0) | DoR 7/8 completo (falta owner confirmar APPROVED), 4 features vinculadas, EP02 |
| Features F01-F04 | 4/4 READY | F01 (API: user_org_scopes), F02 (API: shares+delegations+job expiracao), F03 (UX: escopo org), F04 (UX: painel shares/delegations) |
| Scaffold (forge-module) | CONCLUIDO | mod-004-identidade-avancada/ com estrutura completa Nivel 2 |
| Enriquecimento (10 agentes) | CONCLUIDO | Agentes 01-10 confirmados, v0.9.0, 3 pendentes resolvidas |
| PENDENTEs | 0 abertas | 3 total: 3 IMPLEMENTADA |
| ADRs | 4 criadas | Nivel 2 requer minimo 3 — atendido (ADR-001 auto-auth service, ADR-002 tenant_id RLS, ADR-003 outbox pattern, ADR-004 regex escopos proibidos) |
| Amendments | 0 | Nenhum |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v0.9.0 | Ultima entrada 2026-03-17 (AGN-DEV-08 NFR) |
| Screen Manifests | 2/2 existem | ux-idn-001.org-scope, ux-idn-002.shares-delegations |
| Dependencias | 2 upstream (MOD-000, MOD-003) | Consome auth/RBAC/events de MOD-000 e org_units de MOD-003 |
| Bloqueios | 0 sobre MOD-004 | Nenhum BLK-* afeta MOD-004. MOD-004 emite BLK-003 (MOD-005 depende de org_scopes) |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-004 define a camada de identidade avancada que preenche a lacuna entre MOD-000 (identidade operacional basica — quem pode fazer o que em qual filial) e MOD-003 (estrutura organizacional — onde a organizacao existe). Tres mecanismos — escopo de area organizacional (`user_org_scopes`), compartilhamento controlado (`access_shares`) e delegacao temporaria (`access_delegations`) — resolvem o problema "em qual area organizacional um usuario atua". Com 4 features cobrindo backend (F01, F02) e frontend (F03, F04), o modulo foi aprovado como READY com DoR quase completo (7/8 — falta confirmacao formal APPROVED pelo owner).

```
1    (manual)              Revisar e finalizar epico US-MOD-004:             CONCLUIDO
                           - Escopo fechado (4 features: 2 backend + 2 UX)  status_agil = READY
                           - Gherkin validado (6 cenarios epico)             v1.1.0
                           - DoR completo (modelo de dados, endpoints, regras)
                           - Gap MOD-000 vs MOD-004 documentado
                           - Decisoes tecnicas 2026-03-15 incorporadas
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-004.md

2    (manual)              Revisar e finalizar features F01-F04:             CONCLUIDO
                           - F01: API user_org_scopes (CRUD + Redis)         4/4 READY
                           - F02: API access_shares + access_delegations + job
                           - F03: UX Escopo organizacional do usuario
                           - F04: UX Compartilhamentos e delegacoes ativas
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-004-F{01..04}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Primeiro modulo Nivel 2 (DDD-lite + Clean Completo) scaffoldado na camada topologica 2. Score 5/6 no DOC-ESC-001 §4.2 com gatilhos: estado/workflow, compliance/auditoria, concorrencia/consistencia, multi-tenant e regras cruzadas/reuso alto.

```
3    /forge-module MOD-004  Scaffold completo gerado:                        CONCLUIDO
                           mod-004-identidade-avancada.md, CHANGELOG.md,    v0.1.0 (2026-03-16)
                           requirements/ (br/, fr/, data/, int/, sec/,
                           ux/, nfr/), adr/, amendments/
                           Stubs obrigatorios: BR-001, FR-001, DATA-001,
                           DATA-003, INT-001, SEC-001, SEC-002, UX-001,
                           NFR-001, PEN-004
                           Pasta: docs/04_modules/mod-004-identidade-avancada/
```

### Fase 2: Enriquecimento — CONCLUIDO

O enriquecimento do MOD-004 foi completo — todos os 10 agentes rodaram entre 2026-03-16 e 2026-03-18 em 2 batches (batch 1: AGN-DEV-01 a AGN-DEV-03 em 2026-03-16; batch 2: AGN-DEV-04 a AGN-DEV-10 em 2026-03-17). Durante o processo, 3 pendencias foram identificadas e todas resolvidas. Destaque para o enriquecimento profundo exigido pelo Nivel 2: DDD-lite com aggregates, value objects, domain events (9 catalogados), Outbox Pattern, cache Redis com invalidacao+TTL, e 11 endpoints documentados.

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-004
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-004
> ```

```
4    /enrich docs/04_modules/mod-004-identidade-avancada/
                           Agentes executados sobre mod-004:                 CONCLUIDO
                           AGN-DEV-01 (MOD), AGN-DEV-02 (BR),              v0.9.0 (2026-03-17)
                           AGN-DEV-03 (FR), AGN-DEV-04 (DATA),
                           AGN-DEV-05 (INT), AGN-DEV-06 (SEC),
                           AGN-DEV-07 (UX), AGN-DEV-08 (NFR),
                           AGN-DEV-09 (ADR), AGN-DEV-10 (PEN)
                           3 pendentes criadas e resolvidas (001-003)
```

#### Rastreio de Agentes — MOD-004

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-004-identidade-avancada.md | CONCLUIDO | CHANGELOG v0.2.0 — Nivel 2 confirmado (score 5/6), module_paths detalhados (API+Web), OKRs, premissas/restricoes |
| 2 | AGN-DEV-02 | BR | BR-001.md | CONCLUIDO | v0.3.0 — Gherkin expandido de 4 para 14 cenarios, exemplos concretos, excecoes, impactos categorizados (DATA/FLOW/PERMISSIONS/STATE/COMPLIANCE) |
| 3 | AGN-DEV-03 | FR | FR-001.md | CONCLUIDO | v0.3.0 — 24 cenarios Gherkin (6+7+6+5), 11 endpoints consolidados, deps expandidas (INT-001, DATA-003, SEC-002) |
| 4 | AGN-DEV-04 | DATA | DATA-001.md, DATA-003.md | CONCLUIDO | v0.4.0 — tenant_id RLS, 12 indices explicitos, constraints ON DELETE RESTRICT, ERD expandido, outbox com dedupe_key, UI Actions DOC-ARC-003 |
| 5 | AGN-DEV-05 | INT | INT-001.md | CONCLUIDO | v0.5.0 — failure_behavior detalhado, contratos MOD-000/MOD-003, contrato exposicao INT-001.5 (user_org_scopes para MOD-005/006/007/008), TTL cache 300s |
| 6 | AGN-DEV-06 | SEC | SEC-001.md, SEC-002.md | CONCLUIDO | v0.6.0 — 11 endpoints mapeados com scopes, RLS, mascaramento por sensitivity_level, LGPD, Gherkin seguranca (5+4 cenarios) |
| 7 | AGN-DEV-07 | UX | UX-001.md | CONCLUIDO | v0.7.0 — 15 acoes mapeadas (4 UX-IDN-001 + 11 UX-IDN-002), telemetria UIActionEnvelope, acessibilidade, estados por painel, tratamento erros HTTP |
| 8 | AGN-DEV-08 | NFR | NFR-001.md | CONCLUIDO | v0.9.0 — SLOs (latencia p95, cache), topologia sync+async, degradacao (4 cenarios), health checks (4), metricas Prometheus (7), estrategia testes Nivel 2 |
| 9 | AGN-DEV-09 | ADR | ADR-001, ADR-002, ADR-003, ADR-004 | CONCLUIDO | v0.8.0 — 4 ADRs criadas: auto-auth service (ADR-001), tenant_id RLS (ADR-002), outbox pattern (ADR-003), regex escopos proibidos (ADR-004) |
| 10 | AGN-DEV-10 | PEN | pen-004-pendente.md | CONCLUIDO | v0.1.0 — 3 pendentes criadas (scopes catalogo, contrato exposicao, TTL cache) |

#### Pendentes Resolvidas no Enriquecimento — Resumo Compacto

> As 3 pendencias foram identificadas durante o enriquecimento e todas decididas e implementadas em 2026-03-18.

| # | ID | Status | Sev. | Decisao (1 linha) | Artefato |
|---|---|---|---|---|---|
| 1 | PENDENTE-001 | IMPLEMENTADA | ALTA | Opcao A — 8 scopes identity:* registrados em DOC-FND-000 §2.2 | DOC-FND-000 §2.2 |
| 2 | PENDENTE-002 | IMPLEMENTADA | MEDIA | Opcao A — Contrato exposicao user_org_scopes em INT-001.5 | INT-001.5 v0.5.0 |
| 3 | PENDENTE-003 | IMPLEMENTADA | MEDIA | Opcao A — TTL 300s no cache Redis como safety net | INT-001.1 v0.4.0 |

> Detalhes completos: requirements/pen-004-pendente.md

---

### Fase 3: Validacao — CONCLUIDA

O `/validate-all` foi executado em 2026-03-22 com resultado PASS: 29/29 manifests validos em todos os pilares. Os 2 screen manifests proprios do MOD-004 (ux-idn-001, ux-idn-002) passaram na validacao contra schema v1. Nenhuma pendencia adicional identificada. Fase 3 CONCLUIDA.

> **Decision tree de validacao:**
>
> ```
> Quero validar tudo de uma vez?
> ├── SIM → /validate-all (orquestra todos, pula os que nao tem artefato)
> └── NAO → Qual pilar?
>     ├── Sintaxe/links/metadados → /qa
>     ├── Screen manifests       → /validate-manifest
>     ├── Contratos OpenAPI      → /validate-openapi
>     ├── Schemas Drizzle        → /validate-drizzle
>     └── Endpoints Fastify      → /validate-endpoint
> ```

```
5    /validate-all docs/04_modules/mod-004-identidade-avancada/
                           Orquestra TODAS as validacoes em sequencia:        CONCLUIDO (2026-03-22)
                           Internamente executa:
                             1. /qa (lint, links, metadados, EX-*, §N, ciclos)
                             2. /validate-manifest (screen manifests vs schema v1)
                             3. /validate-openapi → FUTURO (pos-codigo)
                             4. /validate-drizzle → FUTURO (pos-codigo)
                             5. /validate-endpoint → FUTURO (pos-codigo)
                           Pre-condicao: Enriquecimento concluido
                           Pos-condicao: Relatorio consolidado PASS
```

> **Alternativa:** Executar validadores individuais:

```
5a   /qa docs/04_modules/mod-004-identidade-avancada/
                           Diagnostico de sintaxe e integridade:              PASS
                           - lint:docs (Pass A-E: EX-*, §N, IDs, context-map, ciclos)
                           - Consistencia de metadados (estado_item, owner)
                           - Dead links, DoR alignment

5b   /validate-manifest ux-idn-001.org-scope.yaml
                           Validar manifests contra schema v1:               PASS
                           - ux-idn-001.org-scope.yaml
                           - ux-idn-002.shares-delegations.yaml
                           Verifica: DOC-UX-010, operationId, RBAC,
                           telemetria, permissions

5c   /validate-openapi                                                       FUTURO (pos-codigo)
5d   /validate-drizzle                                                       FUTURO (pos-codigo)
5e   /validate-endpoint                                                      FUTURO (pos-codigo)
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | `/qa` | SIM (todos) | SIM — PASS | mod-004-identidade-avancada.md, requirements/*, adr/*, CHANGELOG.md |
| 2 | `/validate-manifest` | SIM (2 manifests existem) | SIM — PASS | ux-idn-001.org-scope, ux-idn-002.shares-delegations |
| 3 | `/validate-openapi` | SIM (Nivel 2) | FUTURO (pos-codigo) | apps/api/openapi/ — nao existe ainda |
| 4 | `/validate-drizzle` | SIM (Nivel 2) | FUTURO (pos-codigo) | apps/api/src/modules/identity-advanced/domain/ — nao existe |
| 5 | `/validate-endpoint` | SIM (Nivel 2) | FUTURO (pos-codigo) | apps/api/src/modules/identity-advanced/presentation/routes/ — nao existe |

### Fase 4: Promocao — PENDENTE

```
10   /promote-module docs/04_modules/mod-004-identidade-avancada/
                           Selar mod-004 como READY:                         A EXECUTAR
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (3/3 IMPLEMENTADA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (10/10)
                             [DoR-3] Zero erros de lint? ................ SIM (validate-all 2026-03-22 PASS)
                             [DoR-4] Screen manifests validados? ........ SIM (2/2 manifests PASS)
                             [DoR-5] ADRs conforme nivel? ............... SIM (4 >= 3 para N2)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v0.9.0)
                             [DoR-7] Bloqueios cross-modulo? ............ SIM (0 bloqueios sobre MOD-004)

                           Fluxo interno:
                             Step 1: /qa (pre-check)
                             Step 2: Promover estado_item DRAFT→READY
                             Step 3: /qa (pos-check)
                             Step 4: /update-index
                             Step 5: /git commit
                           Pre-condicao: QA verde, DoR-1..7 atendidos
                           Pos-condicao: estado_item = READY, INDEX.md atualizado, commit
```

> **Nota:** MOD-004 depende de MOD-000 (Foundation) e MOD-003 (Estrutura Organizacional), ambos ainda DRAFT. A promocao do MOD-004 pode ocorrer independentemente — o DoR nao exige que dependencias upstream estejam READY (apenas que existam). Porem, o codigo so pode ser gerado quando MOD-000 e MOD-003 estiverem READY (endpoints implementados). Rota sequencial ideal: MOD-000 → MOD-003 → MOD-004.

### Fase 5: Pos-READY (quando necessario)

```
11   /update-specification docs/04_modules/mod-004-identidade-avancada/requirements/fr/FR-001.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

12   /create-amendment FR-001 melhoria "descricao"
                           Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
                           Casos de uso previstos:
                           - Revisao periodica de acessos (Wave 3)
                           - Contas tecnicas e agentes (Wave 4+)
```

### Gestao de Pendencias (qualquer momento)

> **Decision tree de pendencias:**
>
> ```
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-004
> ├── Criar nova pendencia     → /manage-pendentes create PEN-004
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-004 PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-004 PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-004 PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-004 PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-004
> ```

```
16   /manage-pendentes list PEN-004
                           Estado atual MOD-004:
                             PEN-004: 3 itens total
                               3 IMPLEMENTADA (001-003)
                               0 ABERTA
                             SLA: nenhum vencido
```

#### Painel de Pendencias — Resumo Compacto

| # | ID | Status | Sev. | Decisao (1 linha) | Artefato |
|---|---|---|---|---|---|
| 1 | PENDENTE-001 | IMPLEMENTADA | ALTA | Opcao A — 8 scopes identity:* registrados em DOC-FND-000 §2.2 | DOC-FND-000 §2.2 |
| 2 | PENDENTE-002 | IMPLEMENTADA | MEDIA | Opcao A — Contrato exposicao user_org_scopes em INT-001.5 | INT-001.5 v0.5.0 |
| 3 | PENDENTE-003 | IMPLEMENTADA | MEDIA | Opcao A — TTL 300s no cache Redis como safety net | INT-001.1 v0.4.0 |

> Detalhes completos: requirements/pen-004-pendente.md

### Utilitarios (qualquer momento)

```
14   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-004): <descricao>

15   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

17   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-004

```
US-MOD-004 (READY v1.1.0)              ← Fase 0: CONCLUIDA
  │  4/4 features READY (2 backend + 2 UX)
  │  Nivel 2 — DDD-lite + Clean Completo (score 5/6)
  ▼
mod-004-identidade-avancada/ (stubs DRAFT) ← Fase 1: CONCLUIDA (forge-module v0.1.0)
  │
  ▼
mod-004 enriquecido (DRAFT v0.9.0)     ← Fase 2: CONCLUIDA (10 agentes, 3 PENDENTEs resolvidas)
  │
  ▼
mod-004 validado (DRAFT)                ← Fase 3: CONCLUIDA (validate-all 2026-03-22 PASS, 29/29)
  │  ├── /qa .................. PASS
  │  ├── /validate-manifest ... PASS (2 manifests)
  │  ├── /validate-openapi .... FUTURO (pos-codigo)
  │  ├── /validate-drizzle .... FUTURO (pos-codigo)
  │  └── /validate-endpoint ... FUTURO (pos-codigo)
  │
  ├── ★ PROXIMO PASSO: executar /promote-module
  ├── Gate 0 (DoR): 7/7 atendidos
  │
  ▼
mod-004 selado (READY)                  ← Fase 4: A EXECUTAR
  │
  ▼
mod-004 + amendments/                   ← Fase 5: SOB DEMANDA (0 amendments)

Dependencias upstream: MOD-000 (Foundation) + MOD-003 (Estrutura Organizacional)
Camada topologica: 2 (implementar apos MOD-000 e MOD-003)
Dependentes downstream: MOD-005 (Processos), MOD-006 (Execucao), MOD-007 (Parametrizacao), MOD-008 (Protheus), MOD-009 (Aprovacoes)
Bloqueio emitido: BLK-003 — MOD-005 depende de org_scopes de MOD-004
```

---

## Particularidades do MOD-004

| Aspecto | Detalhe |
|---------|---------|
| Hub de identidade avancada | MOD-004 preenche a lacuna entre MOD-000 (identidade basica: quem pode fazer o que em qual filial) e MOD-003 (estrutura organizacional: onde a organizacao existe). Tres mecanismos — escopo de area, compartilhamento controlado e delegacao temporaria — resolvem o problema "em qual area organizacional um usuario atua". Sua promocao desbloqueia BLK-003 e habilita MOD-005 (Processos) a avancar. |
| Nivel 2 com cache Redis obrigatorio | Unico modulo ate o momento que combina cache Redis com invalidacao por mutacao (`DEL auth:org_scope:user:{userId}`) E TTL safety net de 300s (decidido via PENDENTE-003). Background job BullMQ a cada 5min para expiracao automatica de shares/delegations/org_scopes via Outbox Pattern. |
| Regra inegociavel de delegacao | Delegacoes NUNCA podem conter escopos `:approve`, `:execute`, `:sign` — invariante de dominio protegido por regex no service (ADR-004). Esta regra impede que delegatarios tomem decisoes em nome do delegante, preservando segregacao de responsabilidade. |
| Validacao de autorizacao por scope (nao CHECK constraint) | Auto-autorizacao em compartilhamentos (`grantor_id = authorized_by`) e permitida condicionalmente ao scope `identity:share:authorize` — validacao no service, nao no banco (ADR-001). Decisao tecnica de 2026-03-15 removeu CHECK constraint absoluto. |
| 4 ADRs para Nivel 2 | Excede o minimo de 3 ADRs. ADR-001 (auto-auth service), ADR-002 (tenant_id RLS), ADR-003 (outbox pattern), ADR-004 (regex escopos proibidos). A riqueza de ADRs reflete decisoes arquiteturais nao-obvias do dominio de identidade. |
| Dependencias upstream ambas em DRAFT | MOD-000 e MOD-003 sao pre-requisitos na camada topologica e ambos ainda estao em DRAFT. A promocao de especificacao do MOD-004 nao depende do estado dos upstream, mas a implementacao de codigo sim. Rota sequencial ideal: MOD-000 → MOD-003 → MOD-004. |

---

## Checklist Rapido — O que Falta para READY

- [x] Enriquecimento completo (10 agentes, 3 pendencias resolvidas)
- [x] Executar `/validate-all` — /qa + /validate-manifest PASS (2026-03-22)
- [ ] Executar `/promote-module docs/04_modules/mod-004-identidade-avancada/` — verificar Gate 0 (DoR) 7/7

> **Nota:** Todas as 3 pendencias ja estao IMPLEMENTADA. Os 10 artefatos de requisitos estao enriquecidos e validados. As 4 ADRs excedem o minimo para Nivel 2. Nao ha bloqueios (BLK-*) afetando MOD-004. As dependencias upstream (MOD-000, MOD-003) estao DRAFT mas isso nao impede a promocao da especificacao — apenas a geracao de codigo. A promocao do MOD-004 desbloqueia BLK-003 e habilita MOD-005 (Processos) a avancar.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 3.0.0 | 2026-03-23 | Recriacao: Fase 3 CONCLUIDA (validate-all 2026-03-22 PASS 29/29 manifests). Fase 4 PENDENTE. DoR Gate 0 7/7 atendidos. Pendencias compactadas (referencia pen file). Proximo passo: /promote-module |
| 2.0.0 | 2026-03-22 | Reescrita completa no formato padrao (sem acentos): Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 3 pendentes resolvidas (001-003), rastreio de 10 agentes, mapa de cobertura de validadores, particularidades Nivel 2 com cache Redis, 4 ADRs, dependencias upstream |
| 1.0.0 | 2026-03-21 | Criacao inicial. Diagnostico: Fase 2 concluida (10 agentes, 3 pendencias resolvidas). Pronto para Fase 3 (validacao) |
