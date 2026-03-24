# Procedimento — Plano de Acao MOD-007 Parametrizacao Contextual e Rotinas

> **Versao:** 4.0.0 | **Data:** 2026-03-23 | **Owner:** Marcos Sulivan
> **Estado atual do modulo:** READY (v1.0.0) | **Epico:** READY (v1.4.0) | **Features:** 5/5 READY
>
> Fases 0-4 concluidas (modulo promovido a READY em 2026-03-23, epico+features selados READY). Proximo passo: Fase 5 (Geracao de Codigo) — executar `/app-scaffold` seguido de `/codegen mod-007`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-007 | READY (v1.4.0) | DoR completo, 5 features vinculadas, 4 gaps do Documento Mestre enderecados |
| Features F01-F05 | 5/5 READY | F01 (Enquadradores+Objetos+Incidencias), F02 (Rotinas+Itens+Versionamento), F03 (Motor de Avaliacao), F04 (UX Configurador), F05 (UX Cadastro Rotinas) |
| Scaffold (forge-module) | CONCLUIDO | mod-007-parametrizacao-contextual/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | Agentes 01-11 confirmados, v0.4.0, todas as pendentes resolvidas |
| Codegen (6 agentes) | NAO INICIADO | Scaffold apps/ concluido (2026-03-23). Executar `/codegen mod-007` |
| PENDENTEs | 0 abertas | 9 total: 9 IMPLEMENTADA (001-009) |
| ADRs | 6 criadas | Nivel 2 requer minimo 3 — atendido (ADR-001 a ADR-006) |
| Amendments | 0 | Nenhum |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v1.0.0 | Ultima entrada 2026-03-23 (promocao DRAFT->READY) |
| Screen Manifests | 2/2 existem | UX-PARAM-001, UX-ROTINA-001 |
| Dependencias | 5 upstream (MOD-000, MOD-003, MOD-004, MOD-005, MOD-006) | Consome Foundation core, org_units, scopes contextuais, ciclos referenciados, motor de transicao |
| Dependentes | 3 downstream (MOD-008, MOD-010, MOD-011) | MOD-008 herda behavior_routines, MOD-010/MOD-011 consomem motor |
| Bloqueios | 0 | Nenhum BLK-* afeta MOD-007 diretamente |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-007 define o modulo de parametrizacao contextual e rotinas de comportamento, que funciona como camada de mediacao: o mesmo objeto de negocio pode ter campos, defaults, dominios e validacoes diferentes dependendo do contexto ativo. O modulo endereca 4 gaps do Documento Mestre (versionamento de rotinas, priorizacao de contextos, separacao comportamento/integracao, historico de incidencia). Nivel de arquitetura 2 (DDD-lite + Full Clean) com 9 tabelas, 25 endpoints, motor de avaliacao com 6 passos e resolucao de conflitos em duas camadas.

```
1    (manual)              Revisar e finalizar epico US-MOD-007:             CONCLUIDO
                           - Escopo fechado (5 features: 3 Backend + 2 UX)  status_agil = READY
                           - 4 gaps do Documento Mestre enderecados          v1.4.0
                           - Resolucao de conflito em duas camadas definida
                           - Motor de avaliacao sem cache (decisao 2026-03-15)
                           - DoR 100% completo
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-007.md

2    (manual)              Revisar e finalizar features F01-F05:             CONCLUIDO
                           - F01: API Enquadradores + Objetos + Incidencias  5/5 READY
                           - F02: API Rotinas + Itens + Versionamento
                           - F03: Motor de Avaliacao (runtime)
                           - F04: UX Configurador de Enquadradores
                           - F05: UX Cadastro de Rotinas
```

### Fase 1: Genese do Modulo — CONCLUIDA

O scaffold do modulo foi gerado via `forge-module`, criando a estrutura completa de 9 tabelas, 25 endpoints, 5 features e 7 scopes. Primeiro modulo com motor de avaliacao runtime integrado ao MOD-006.

```
3    /forge-module          Scaffold gerado:                                 CONCLUIDO
                           - mod-007-parametrizacao-contextual/              v0.1.0
                           - CHANGELOG.md
                           - requirements/ (BR, FR, DATA, INT, SEC, UX, NFR, PEN)
                           - adr/
                           - 9 tabelas, 25 endpoints, 5 features, 7 scopes
                           Stubs obrigatorios: DATA-003, SEC-002
```

### Fase 2: Enriquecimento — CONCLUIDA

O enriquecimento foi executado em 4 batches, com todos os 11 agentes confirmados. As 9 pendencias foram identificadas e todas implementadas/resolvidas. Destaque: 6 ADRs criadas (motor sem cache, resolucao por restritividade, rotina PUBLISHED imutavel, conflito em duas camadas, motor always fresh, dry-run via flag).

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-NNN
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-NNN
> ```

```
4    /enrich                Enriquecimento completo (11 agentes):            CONCLUIDO
                           Batch 1: AGN-DEV-01 (MOD/Escala), AGN-DEV-02 (BR), AGN-DEV-03 (FR)
                           Batch 2: AGN-DEV-04 (DATA), AGN-DEV-05 (INT), AGN-DEV-08 (NFR)
                           Batch 3: AGN-DEV-06 (SEC), AGN-DEV-07 (UX)
                           Batch 4: AGN-DEV-09 (ADR), AGN-DEV-10 (PENDENTE), AGN-DEV-11 (VAL)
                           Re-enriquecimento: AGN-DEV-01 (confirmacao scopes DOC-FND-000)
                           Resultado: v0.4.0, 6 ADRs, 9 pendentes identificadas
```

**Rastreio de agentes:**

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-007-parametrizacao-contextual.md | CONCLUIDO | v0.4.0 (re-enriquecimento) |
| 2 | AGN-DEV-02 | BR | BR-007.md | CONCLUIDO | Gherkin extraido de F01-F05 |
| 3 | AGN-DEV-03 | FR | FR-007.md | CONCLUIDO | Done funcional, dependencias e Gherkin |
| 4 | AGN-DEV-04 | DATA | DATA-007.md, DATA-003.md | CONCLUIDO | 9 tabelas completas, domain events |
| 5 | AGN-DEV-05 | INT | INT-007.md | CONCLUIDO | Integracoes detalhadas com MOD-005/006 |
| 6 | AGN-DEV-06 | SEC | SEC-007.md, SEC-002.md | CONCLUIDO | Matriz de autorizacao, LGPD |
| 7 | AGN-DEV-07 | UX | UX-007.md | CONCLUIDO | 2 telas detalhadas, action_ids |
| 8 | AGN-DEV-08 | NFR | NFR-007.md | CONCLUIDO | SLOs, observabilidade, limites |
| 9 | AGN-DEV-09 | ADR | ADR-001 a ADR-006 | CONCLUIDO | 6 ADRs criadas |
| 10 | AGN-DEV-10 | PENDENTE | pen-007-pendente.md | CONCLUIDO | 9 pendentes identificadas |
| 11 | AGN-DEV-11 | VAL | Cross-validation | CONCLUIDO | 0 erros |

**Pendentes resolvidas — tabela-resumo:**

| # | ID | Status | Severidade | Decisao (1 linha) |
|---|---|---|---|---|
| 1 | PENDENTE-001 | IMPLEMENTADA | BAIXA | JSONLogic como engine v2 para condition_expr |
| 2 | PENDENTE-002 | IMPLEMENTADA | MEDIA | Job independente no MOD-007 (isolamento > DRY) |
| 3 | PENDENTE-003 | IMPLEMENTADA | BAIXA | Tabela auxiliar routine_integration_config (MOD-008 responsavel) |
| 4 | PENDENTE-004 | IMPLEMENTADA | MEDIA | Flag auto_deprecate_previous (default=false) |
| 5 | PENDENTE-005 | IMPLEMENTADA | MEDIA | Hard limit configuravel por tenant |
| 6 | PENDENTE-006 | IMPLEMENTADA | MEDIA | Flag dry_run no request body |
| 7 | PENDENTE-007 | IMPLEMENTADA | MEDIA | Manter links como historico (Opcao B) |
| 8 | PENDENTE-008 | IMPLEMENTADA | BAIXA | Bulk INSERT (unico statement) para fork |
| 9 | PENDENTE-009 | IMPLEMENTADA | ALTA | 7 scopes param:* registrados em DOC-FND-000 v1.8.0 |

> Detalhes completos: requirements/pen-007-pendente.md

### Fase 3: Validacao — CONCLUIDA

O `/validate-all` foi executado em 2026-03-22 e todos os validadores aplicaveis passaram. As pendencias bloqueantes (PENDENTE-006 e PENDENTE-009 de manifests) foram resolvidas antes da validacao. Scopes `param:*` registrados em DOC-FND-000 v1.8.0, desbloqueando Gate 3.

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
5a   /qa                    Validacao de sintaxe, links e metadados:          PASS
                           - Todos os artefatos com metadata valido
                           - Links internos resolvidos
                           - IDs consistentes

5b   /validate-manifest     Validacao dos Screen Manifests:                   PASS
                           - ux-param-001.config-enquadradores.yaml: PASS
                           - ux-rotina-001.editor-rotinas.yaml: PASS
                           - Gates 1-3 verdes (YAML valido, actions consistentes, scopes registrados)

5c   /validate-openapi      Validacao de contratos OpenAPI:                   FUTURO (pos-codigo)
                           Artefato: apps/api/openapi/mod-007-parametrizacao-contextual.yaml
                           Aplicavel (Nivel 2), mas arquivo de codigo nao existe ainda

5d   /validate-drizzle      Validacao de schemas Drizzle:                     FUTURO (pos-codigo)
                           Artefato: src/modules/contextual-params/schema.ts
                           Aplicavel (Nivel 2), mas arquivo de codigo nao existe ainda

5e   /validate-endpoint     Validacao de endpoints Fastify:                   FUTURO (pos-codigo)
                           Artefato: src/modules/contextual-params/routes/
                           Aplicavel (Nivel 2), mas arquivo de codigo nao existe ainda
```

**Validadores Aplicaveis — Mapa de Cobertura:**

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | /qa | SIM (todos) | SIM — PASS | Todos os .md do modulo |
| 2 | /validate-manifest | SIM (manifests existem) | SIM — PASS | ux-param-001, ux-rotina-001 |
| 3 | /validate-openapi | SIM (Nivel 2) | NAO — FUTURO (pos-codigo) | openapi/mod-007-*.yaml |
| 4 | /validate-drizzle | SIM (Nivel 2) | NAO — FUTURO (pos-codigo) | schema.ts |
| 5 | /validate-endpoint | SIM (Nivel 2) | NAO — FUTURO (pos-codigo) | routes/*.route.ts |

### Fase 4: Promocao — CONCLUIDA

O modulo foi promovido a READY em 2026-03-23 via `/promote-module`. Todos os criterios DoR (1-7) foram atendidos. O manifesto do modulo esta em v1.0.0, estado_item=READY. Todos os requisitos e ADRs foram selados. CHANGELOG.md avancou para Etapa 5 do pipeline Mermaid.

```
6    /promote-module        Promocao DRAFT -> READY:                          CONCLUIDO
                           - estado_item: DRAFT -> READY                     v1.0.0
                           - Manifesto selado em v1.0.0                      2026-03-23
                           - Todos os requisitos e ADRs selados
                           - CHANGELOG.md Etapa 5 (Selo READY)
                           - INDEX.md atualizado
                           - Commit: promocao confirmada
```

**Gate 0 — Definition of Ready (DoR) Check:**

| # | Criterio | Status | Evidencia |
|---|----------|--------|-----------|
| DoR-1 | 0 pendentes ABERTA ou EM_ANALISE | SIM | 9/9 IMPLEMENTADA |
| DoR-2 | Todos os pilares com artefato | SIM | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1) = 10/10 |
| DoR-3 | ADRs minimos para Nivel 2 (3+) | SIM | 6 ADRs (ADR-001 a ADR-006) |
| DoR-4 | Epico READY | SIM | US-MOD-007 READY v1.4.0 |
| DoR-5 | Todas as features READY | SIM | 5/5 READY |
| DoR-6 | Screen Manifests validados | SIM | 2/2 PASS (ux-param-001, ux-rotina-001) |
| DoR-7 | /qa verde | SIM | validate-all PASS 2026-03-22 |

> **Resultado:** Todos os criterios DoR atendidos. Modulo promovido a READY em 2026-03-23.

### Fase 5: Geracao de Codigo — NAO INICIADA

O modulo esta READY (v1.0.0), o que habilita a geracao de codigo. O scaffold de aplicacoes (`apps/api/` e `apps/web/`) foi concluido em 2026-03-23. MOD-007 e Nivel 2 (DDD-lite + Full Clean), portanto todos os 6 agentes de codigo sao aplicaveis: AGN-COD-DB, AGN-COD-CORE, AGN-COD-APP, AGN-COD-API, AGN-COD-WEB, AGN-COD-VAL. O slug do modulo e `contextual-params` (resolvido de `apps/api/src/modules/contextual-params/`).

> **Decision tree de codegen:**
>
> ```
> Preciso gerar codigo para os modulos?
> ├── Scaffold existe? (apps/api/, apps/web/)
> │   └── NAO → /app-scaffold all (one-time, cria apps/api e apps/web)
> └── SIM → Qual escopo?
>     ├── Todos modulos READY (ordem topologica)  → /codegen-all (--dry-run para preview)
>     ├── Todos agentes de 1 modulo               → /codegen mod-007
>     └── 1 agente especifico                     → /codegen-agent mod-007 AGN-COD-XX
> ```

```
7a   /app-scaffold all     Criar scaffold de aplicacoes:                     CONCLUIDO
                           - apps/api/ (Fastify + Drizzle + OpenAPI)          2026-03-23
                           - apps/web/ (React + Vite)
                           - package.json, tsconfig.json, estrutura base

7b   /codegen mod-007      Gerar codigo do modulo (6 agentes):               A EXECUTAR
                           Slug: contextual-params
                           Nivel: 2 (todos os 6 agentes aplicaveis)
                           Ordem: DB → CORE → APP → API → WEB → VAL
                           Pre-requisito: /app-scaffold concluido
                           Pre-requisito topologico: MOD-000..MOD-006 devem ter
                           codigo gerado antes (camada 5 na ordem topologica)
```

**Rastreio de agentes COD:**

| # | Agente | Camada | Path | Status | Arquivos |
|---|--------|--------|------|--------|----------|
| 1 | AGN-COD-DB | infrastructure | apps/api/src/modules/contextual-params/infrastructure/ | A EXECUTAR | 0 |
| 2 | AGN-COD-CORE | domain | apps/api/src/modules/contextual-params/domain/ | A EXECUTAR | 0 |
| 3 | AGN-COD-APP | application | apps/api/src/modules/contextual-params/application/ | A EXECUTAR | 0 |
| 4 | AGN-COD-API | presentation | apps/api/src/modules/contextual-params/presentation/ | A EXECUTAR | 0 |
| 5 | AGN-COD-WEB | web | apps/web/src/modules/contextual-params/ | A EXECUTAR | 0 |
| 6 | AGN-COD-VAL | validation | (cross-validation) | A EXECUTAR | — |

**Scaffold e pre-requisitos:**

- `apps/api/package.json` — EXISTE (scaffold concluido 2026-03-23)
- `apps/web/package.json` — EXISTE (scaffold concluido 2026-03-23)
- Ordem topologica: MOD-007 esta na camada 5. Dependencias upstream (MOD-000 a MOD-006) devem ter codigo gerado antes para que imports e tipos compartilhados estejam disponiveis.

**Validacoes pos-codegen:**

Apos a geracao de codigo, os 3 validadores marcados como FUTURO na Fase 3 tornam-se executaveis:
- `/validate-drizzle` — schemas Drizzle em `contextual-params/infrastructure/`
- `/validate-openapi` — contrato em `apps/api/openapi/mod-007-parametrizacao-contextual.yaml`
- `/validate-endpoint` — rotas Fastify em `contextual-params/presentation/routes/`

### Fase 6: Pos-READY — SOB DEMANDA

O modulo foi promovido a READY em 2026-03-23. Nenhum amendment foi criado ainda. Alteracoes futuras requerem o fluxo formal de amendments (`create-amendment`).

```
8    /update-specification  Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY -> delega para
                           /create-amendment automaticamente

9    /create-amendment      Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
                           Caso de uso previsto: ajustes pos-go-live,
                           condition_expr v2 (JSONLogic), integracao MOD-008
```

### Gestao de Pendencias

> **Decision tree de pendencias:**
>
> ```
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-007
> ├── Criar nova pendencia     → /manage-pendentes create PEN-007
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-007 PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-007 PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-007 PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-007 PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-007
> ```

```
10   /manage-pendentes list PEN-007
                           Estado atual MOD-007:
                             PEN-007: 9 itens total
                               9 IMPLEMENTADA (001-009)
                               0 ABERTA
                             SLA: nenhum vencido
```

**Pendencias — resumo compacto:**

| # | ID | Status | Severidade | Decisao (1 linha) |
|---|---|---|---|---|
| 1 | PENDENTE-001 | IMPLEMENTADA | BAIXA | JSONLogic como engine v2 |
| 2 | PENDENTE-002 | IMPLEMENTADA | MEDIA | Job independente (isolamento > DRY) |
| 3 | PENDENTE-003 | IMPLEMENTADA | BAIXA | Tabela auxiliar routine_integration_config |
| 4 | PENDENTE-004 | IMPLEMENTADA | MEDIA | Flag auto_deprecate_previous |
| 5 | PENDENTE-005 | IMPLEMENTADA | MEDIA | Hard limit configuravel por tenant |
| 6 | PENDENTE-006 | IMPLEMENTADA | MEDIA | Flag dry_run no evaluate |
| 7 | PENDENTE-007 | IMPLEMENTADA | MEDIA | Links como historico |
| 8 | PENDENTE-008 | IMPLEMENTADA | BAIXA | Bulk INSERT para fork |
| 9 | PENDENTE-009 | IMPLEMENTADA | ALTA | Scopes param:* em DOC-FND-000 |

> Detalhes completos: requirements/pen-007-pendente.md

### Utilitarios

```
     /qa                    Re-validar artefatos apos qualquer alteracao      SOB DEMANDA
     /update-index          Atualizar INDEX.md apos mudancas                  SOB DEMANDA
     /git                   Commit de alteracoes pendentes                    SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-007

```
  [Fase 0]         [Fase 1]         [Fase 2]           [Fase 3]         [Fase 4]         [Fase 5]         [Fase 6]
  Pre-Modulo  -->  Genese     -->  Enriquecimento -->  Validacao   -->  Promocao   -->  Codegen    -->  Pos-READY
  CONCLUIDA        CONCLUIDA       CONCLUIDA           CONCLUIDA        CONCLUIDA        <<<AQUI>>>      SOB DEMANDA
  Epico READY      Scaffold v0.1   11 agentes OK       validate-all     READY v1.0.0     scaffold OK     amendments
  5/5 READY        9 tabelas       6 ADRs, 9 PEN       PASS 2026-03-22  DoR 7/7 OK       6 agentes COD   quando necessario

  Dependencias upstream: MOD-000 → MOD-003 → MOD-004 → MOD-005 → MOD-006 → MOD-007
  Camada topologica: 5
  Dependentes downstream: MOD-008 (heranca), MOD-010 (motor), MOD-011 (motor)
```

## Particularidades do MOD-007

| Aspecto | Detalhe |
|---------|---------|
| Nivel de Arquitetura | Nivel 2 (DDD-lite + Full Clean) — dominio rico com motor de avaliacao, resolucao de conflitos, versionamento de rotinas. Todos os 6 agentes COD aplicaveis. |
| 4 Gaps do Documento Mestre | Todos enderecados: versionamento tecnico (GAP 1), priorizacao de contextos (GAP 2), separacao comportamento/integracao (GAP 3), historico de incidencia (GAP 4). Fundamentais para a consistencia do motor. |
| Motor sem cache | Decisao 2026-03-15: cache Redis removido do motor inteiro. Todas as chamadas executam ao vivo (consistencia > performance). Impacto: SLOs devem ser atingidos sem camada de cache, exigindo queries otimizadas. ADR-001, ADR-005. |
| Conflito em 2 camadas | Config-time: 422 se conflito. Runtime: safety net por restritividade. Campo priority removido. Isso simplifica o modelo mas exige que o motor de avaliacao implemente logica de restritividade corretamente. ADR-002, ADR-004. |
| Heranca MOD-008 | MOD-008 herda behavior_routines com routine_type=INTEGRATION. Tabela auxiliar routine_integration_config decidida (PENDENTE-003). A promocao do MOD-007 desbloqueia MOD-008 para codegen. |
| 6 ADRs (acima do minimo) | ADR-001 (cache removido), ADR-002 (priority removido), ADR-003 (PUBLISHED imutavel), ADR-004 (conflito 2 camadas), ADR-005 (always fresh), ADR-006 (dry-run via flag). Dobro do minimo exigido para Nivel 2 (3). |
| Scopes registrados | 7 scopes param:* registrados em DOC-FND-000 v1.8.0 (PENDENTE-009). Desbloqueou Gate 3 para manifests. Scopes canalizados via MOD-000-F12 amendment. |
| Camada topologica 5 | MOD-007 depende de 5 modulos upstream. Para codegen, todos os upstream devem ter codigo gerado primeiro. MOD-007 e o penultimo na cadeia antes dos modulos folha (MOD-008, MOD-010, MOD-011). |

## Checklist Rapido — O que Falta para Codegen

- [x] Executar `/app-scaffold all` — scaffold apps/ concluido (2026-03-23)
- [ ] Garantir que MOD-000..MOD-006 tenham codigo gerado (ordem topologica)
- [ ] Executar `/codegen mod-007` (6 agentes: DB → CORE → APP → API → WEB → VAL)
- [ ] Executar `/validate-drizzle` pos-codegen (schema.ts)
- [ ] Executar `/validate-openapi` pos-codegen (contrato YAML)
- [ ] Executar `/validate-endpoint` pos-codegen (rotas Fastify)

> **Nota:** MOD-007 esta READY e elegivel para codegen imediatamente apos o scaffold de apps/ existir e os modulos upstream terem sido gerados. A geracao de codigo do MOD-007 desbloqueia MOD-008 (heranca de behavior_routines), MOD-010 (motor de parametrizacao) e MOD-011 (routine-engine/evaluate).

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 4.0.0 | 2026-03-23 | Atualizacao: Epico promovido APPROVED→READY v1.4.0, Features F01-F05 promovidas APPROVED→READY, CHANGELOG E5 verde, execution-state atualizado com secao promotion, INDEX.md sincronizado |
| 3.0.0 | 2026-03-23 | Atualizacao: Fase 4 CONCLUIDA (modulo promovido a READY v1.0.0 em 2026-03-23), Fase 5 (Codegen) adicionada como NAO INICIADA com rastreio de 6 agentes COD, checklist reorientado para codegen |
| 2.0.0 | 2026-03-23 | Recriacao: Fases 0-3 CONCLUIDAS (validate-all PASS 2026-03-22), Fase 4 PENDENTE, PENDENTE-007/008/009 agora IMPLEMENTADA (0 abertas), DoR 7/7 atendido, modulo elegivel para promocao |
| 1.0.0 | 2026-03-22 | Criacao completa: Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 8 pendentes (6 resolvidas + 2 abertas), rastreio de 10 agentes, mapa de cobertura de 5 validadores, particularidades Nivel 2 DDD-lite, 4 gaps enderecados, 6 ADRs, motor sem cache, conflito 2 camadas |
