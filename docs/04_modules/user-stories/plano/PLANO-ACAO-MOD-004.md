# Procedimento — Plano de Ação MOD-004 Identidade Avançada

> **Versão:** 1.0.0 | **Data:** 2026-03-21 | **Owner:** Marcos Sulivan
> **Estado atual do módulo:** DRAFT (0.3.0) | **Épico:** READY (1.1.0) | **Features:** 4/4 READY
>
> Enriquecimento concluído (10 agentes executados, 3 pendências resolvidas). Módulo pronto para validação. Próximo passo: executar `/validate-all docs/04_modules/mod-004-identidade-avancada/`.

---

## Estado Atual — Resumo Diagnóstico

| Item | Estado | Detalhe |
|------|--------|---------|
| Épico US-MOD-004 | READY (1.1.0) | DoR 7/8 completo (falta owner confirmar APPROVED), 4 features vinculadas |
| Features F01–F04 | 4/4 READY | F01 (API: user_org_scopes) ✅, F02 (API: shares+delegations) ✅, F03 (UX: escopo org) ✅, F04 (UX: painel shares/delegations) ✅ |
| Scaffold (forge-module) | CONCLUÍDO | `mod-004-identidade-avancada/` com mod.md, CHANGELOG.md, requirements/, adr/, amendments/, tests/ |
| Enriquecimento (agentes) | CONCLUÍDO | 10 agentes executados (AGN-DEV-01 a AGN-DEV-10) em 2 batches (2026-03-16 e 2026-03-17). Pipeline Mermaid stale — mostra E3, deveria ser E4 |
| PENDENTEs | 0 abertas | 3/3 IMPLEMENTADA (scopes no catálogo, contrato exposição, TTL Redis 300s) |
| ADRs | 4 criadas (DRAFT) | Nível 2 requer mínimo 3 — ✅ atendido. ADR-001 (auto-auth service), ADR-002 (tenant_id RLS), ADR-003 (outbox pattern), ADR-004 (regex escopos proibidos) |
| Amendments | 0 | Nenhum amendment criado (módulo ainda em DRAFT) |
| Requirements | 10/10 existem | BR(1), FR(1), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v0.9.0 | Última entrada 2026-03-17 (AGN-DEV-08 NFR). Pipeline Mermaid stale (E3 — enriquecimento de fato concluído) |
| Screen Manifests | 2/2 existem | UX-IDN-001 (org-scope), UX-IDN-002 (shares-delegations) |
| Dependências | 2 upstream (MOD-000 DRAFT v0.10.0, MOD-003 DRAFT v0.3.0) | Camada topológica 2. Consome auth/RBAC/events de MOD-000 e org_units de MOD-003 |
| Bloqueios | 0 sobre MOD-004 | Nenhum BLK-* afeta MOD-004. MOD-004 é bloqueador de BLK-003 (MOD-005 depende de org_scopes) |

---

## Procedimento por Fases

### Fase 0: Pré-Módulo — CONCLUÍDA

O épico US-MOD-004 define a camada de identidade avançada que preenche a lacuna entre MOD-000 (identidade operacional básica) e MOD-003 (estrutura organizacional). Com 4 features cobrindo backend (F01: user_org_scopes, F02: shares+delegations) e frontend (F03: gestão de escopo, F04: painel de shares/delegations), o módulo foi aprovado como READY com DoR quase completo (7/8 — falta confirmação formal APPROVED pelo owner).

```text
Status: CONCLUÍDA
Épico: US-MOD-004 — READY (1.1.0)
Features: F01 (READY), F02 (READY), F03 (READY), F04 (READY) — 4/4
Screen Manifests: UX-IDN-001 ✅, UX-IDN-002 ✅
DoR: 7/8 critérios atendidos
```

---

### Fase 1: Gênese do Módulo — CONCLUÍDA

Scaffold gerado via `/forge-module` em 2026-03-16 a partir do épico READY. Criou a estrutura completa com todos os pilares de requirements obrigatórios para um módulo Nível 2.

```text
Status: CONCLUÍDA
Comando executado: /forge-module US-MOD-004
Resultado: Pasta mod-004-identidade-avancada/ criada com:
  - mod.md (metadados + índice de itens base + ADR index)
  - CHANGELOG.md (pipeline Mermaid)
  - requirements/ (10 artefatos: BR-001, FR-001, DATA-001, DATA-003, INT-001, SEC-001, SEC-002, UX-001, NFR-001, PEN-004)
  - adr/ (4 ADRs criados durante enriquecimento)
  - amendments/ (vazio)
  - tests/ (vazio)
```

---

### Fase 2: Enriquecimento — CONCLUÍDA

> **Decision tree de enriquecimento:**
> Quero enriquecer todos os módulos elegíveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NÃO → Qual escopo?
> ├── Todos agentes de 1 módulo  → /enrich mod-NNN
> └── 1 agente específico        → /enrich-agent AGN-DEV-XX mod-NNN

Primeiro módulo full-stack pós-Foundation a completar o ciclo de enriquecimento. Os 10 agentes executaram em 2 batches (batch 1: AGN-DEV-01 a AGN-DEV-03 em 2026-03-16; batch 2: AGN-DEV-04 a AGN-DEV-10 em 2026-03-17). O módulo Nível 2 exigiu enriquecimento profundo: DDD-lite com aggregates, value objects, domain events (9 catalogados), Outbox Pattern, cache Redis com invalidação+TTL, e 11 endpoints documentados.

#### Tabela de Rastreio de Agentes

| # | Agente | Pilar | Artefato | Status | Evidência |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod.md | ✅ Concluído | v0.2.0 (2026-03-16) — Nível 2 confirmado (score 5/6), module_paths detalhados (API+Web), OKRs, premissas/restrições |
| 2 | AGN-DEV-02 | BR | BR-001 | ✅ Concluído | v0.3.0 (2026-03-17) — Gherkin expandido de 4→14 cenários, exemplos concretos, exceções, impactos categorizados (DATA/FLOW/PERMISSIONS/STATE/COMPLIANCE) |
| 3 | AGN-DEV-03 | FR | FR-001 | ✅ Concluído | v0.3.0 (2026-03-17) — 24 cenários Gherkin, 11 endpoints consolidados, deps expandidas (INT-001, DATA-003, SEC-002) |
| 4 | AGN-DEV-04 | DATA | DATA-001, DATA-003 | ✅ Concluído | v0.4.0 (2026-03-17) — 12 índices, ERD expandido, tenant_id RLS, outbox com dedupe_key, UI Actions DOC-ARC-003 |
| 5 | AGN-DEV-05 | INT | INT-001 | ✅ Concluído | v0.5.0 (2026-03-18) — failure_behavior detalhado, contrato exposição INT-001.5 (user_org_scopes para MOD-005/006/007/008), TTL cache 300s |
| 6 | AGN-DEV-06 | SEC | SEC-001, SEC-002 | ✅ Concluído | v0.6.0 (2026-03-17) — 11 endpoints mapeados com scopes, RLS, mascaramento por sensitivity_level, LGPD, Gherkin segurança |
| 7 | AGN-DEV-07 | UX | UX-001 | ✅ Concluído | v0.7.0 (2026-03-17) — 15 ações mapeadas (4 IDN-001 + 11 IDN-002), telemetria UIActionEnvelope, acessibilidade, estados por painel |
| 8 | AGN-DEV-08 | NFR | NFR-001 | ✅ Concluído | v0.9.0 (2026-03-17) — SLOs (latência p95, cache), topologia sync+async, degradação (4 cenários), health checks (4), métricas Prometheus (7), estratégia testes Nível 2 |
| 9 | AGN-DEV-09 | ADR | ADR-001..004 | ✅ Concluído | v0.8.0 (2026-03-17) — 4 ADRs criadas: auto-auth service (ADR-001), tenant_id RLS (ADR-002), outbox pattern (ADR-003), regex escopos proibidos (ADR-004) |
| 10 | AGN-DEV-10 | PEN | PEN-004 | ✅ Concluído | v0.1.0 (2026-03-17) — 3 pendências criadas (scopes catálogo, contrato exposição, TTL cache) |

#### Pendências Resolvidas Durante o Enriquecimento

| PENDENTE | Status | Sev. | Domínio | Decisão | Artefato de saída |
|----------|--------|------|---------|---------|-------------------|
| PENDENTE-001 | ✅ IMPLEMENTADA | ALTA | SEC | Opção A — Registrar 8 scopes em DOC-FND-000 §2.2 agora | DOC-FND-000 §2.2 (8 scopes identity:* adicionados) |
| PENDENTE-002 | ✅ IMPLEMENTADA | MÉDIA | INT | Opção A — Contrato de exposição user_org_scopes em INT-001.5 | INT-001.5 v0.5.0 (tabela exposta, regras de consumo, padrão JOIN) |
| PENDENTE-003 | ✅ IMPLEMENTADA | MÉDIA | ARC | Opção A — TTL 300s no cache Redis como safety net | INT-001.1 v0.4.0 (SET com EX 300 + nota safety net) |

> **Nota:** O pipeline Mermaid no CHANGELOG.md ainda mostra Etapa 3 (stale). O enriquecimento está concluído — deveria estar em Etapa 4. Corrigir antes da promoção.

---

### Fase 3: Validação — PENDENTE

> **Decision tree de validação:**
> Quero validar tudo de uma vez?
> ├── SIM → /validate-all (orquestra todos, pula os que não têm artefato)
> └── NÃO → Qual pilar?
> ├── Sintaxe/links/metadados → /qa
> ├── Screen manifests       → /validate-manifest
> ├── Contratos OpenAPI      → /validate-openapi
> ├── Schemas Drizzle        → /validate-drizzle
> └── Endpoints Fastify      → /validate-endpoint

O módulo ainda não passou por nenhuma validação formal. Com Fases 0–2 concluídas e 10 artefatos enriquecidos, esta é a próxima fase a executar. Os validadores de código (OpenAPI, Drizzle, Endpoint) são aplicáveis pelo Nível 2, mas os artefatos de código ainda não existem.

#### Validadores Aplicáveis — Mapa de Cobertura

| # | Validador | Aplicável (Nível) | Executável agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | `/qa` | SIM (todos) | ✅ SIM | Todos os artefatos em `mod-004-identidade-avancada/` |
| 2 | `/validate-manifest` | SIM (manifests existem) | ✅ SIM | `ux-idn-001.org-scope.yaml`, `ux-idn-002.shares-delegations.yaml` |
| 3 | `/validate-openapi` | SIM (Nível 2) | ❌ FUTURO (pós-código) | `apps/api/openapi/` — não existe ainda |
| 4 | `/validate-drizzle` | SIM (Nível 2) | ❌ FUTURO (pós-código) | `apps/api/src/modules/identity-advanced/domain/` — não existe |
| 5 | `/validate-endpoint` | SIM (Nível 2) | ❌ FUTURO (pós-código) | `apps/api/src/modules/identity-advanced/presentation/routes/` — não existe |

**Para executar (especificação):**

```bash
# Passo 5: Validação completa de especificação
/validate-all docs/04_modules/mod-004-identidade-avancada/    # A EXECUTAR

# Ou individualmente:
# 5a. QA geral (sintaxe, links, metadados)
/qa all                                                        # A EXECUTAR

# 5b. Screen Manifests
/validate-manifest docs/05_manifests/screens/ux-idn-001.org-scope.yaml        # A EXECUTAR
/validate-manifest docs/05_manifests/screens/ux-idn-002.shares-delegations.yaml # A EXECUTAR
```

**Validadores pós-código (após scaffold de código):**

```bash
# 5c. OpenAPI (quando contrato existir)
/validate-openapi apps/api/openapi/v1.yaml                                    # FUTURO

# 5d. Drizzle (quando schema existir)
/validate-drizzle apps/api/src/modules/identity-advanced/domain/schema.ts     # FUTURO

# 5e. Endpoints (quando handlers existirem)
/validate-endpoint apps/api/src/modules/identity-advanced/presentation/routes/ # FUTURO
```

---

### Fase 4: Promoção — PENDENTE

Requer Fase 3 aprovada e DoR completo. Com 6/7 critérios já atendidos, o único bloqueador real é a validação (Fase 3).

```bash
# Gate 0 (DoR) — Verificação pré-promoção
```

| # | Critério DoR | Status | Evidência |
|---|---|---|---|
| DoR-1 | Épico READY | ✅ SIM | US-MOD-004 v1.1.0 READY |
| DoR-2 | Todas features READY | ✅ SIM | 4/4 READY (F01, F02, F03, F04) |
| DoR-3 | Requirements existem (todos os pilares) | ✅ SIM | 10/10 artefatos (BR, FR, DATA×2, INT, SEC×2, UX, NFR, PEN) |
| DoR-4 | ADRs mínimos (≥3 para Nível 2) | ✅ SIM | 4 ADRs criadas (ADR-001 a ADR-004) |
| DoR-5 | PENDENTEs sem ABERTA/EM_ANALISE | ✅ SIM | 0 abertas, 3/3 IMPLEMENTADA |
| DoR-6 | Validação (Fase 3) aprovada | ❌ NÃO | Nenhuma validação executada ainda |
| DoR-7 | Dependências upstream satisfeitas | ⚠️ A VERIFICAR | MOD-000 (DRAFT v0.10.0) + MOD-003 (DRAFT v0.3.0) — ambos ainda em DRAFT |

#### Bloqueadores para Promoção

1. **Fase 3 (validação) pendente** — Executar `/validate-all` e corrigir violações. Único bloqueador direto.
2. **Dependências upstream em DRAFT** — MOD-000 (v0.10.0) e MOD-003 (v0.3.0) ainda são DRAFT. Promoção de MOD-004 pode ser feita independentemente da promoção dos upstream (o DoR valida que os artefatos existem, não que estejam READY), mas a implementação de código dependerá de MOD-000 e MOD-003 estarem implementados.
3. **CHANGELOG Mermaid stale** — Pipeline mostra Etapa 3 quando deveria mostrar Etapa 4 concluída. Corrigir antes da promoção para consistência.

```bash
# Quando DoR atendido:
/promote-module docs/04_modules/mod-004-identidade-avancada/    # PENDENTE
```

---

### Fase 5: Pós-READY — SOB DEMANDA

Módulo ainda em DRAFT. Nenhum amendment criado. Após promoção, qualquer alteração ao módulo requer amendment formal.

```bash
# Após promoção, usar para mudanças:
/create-amendment docs/04_modules/mod-004-identidade-avancada/   # SOB DEMANDA
/merge-amendment <caminho-do-amendment>                          # SOB DEMANDA
```

---

### Gestão de Pendências

> **Decision tree de pendências:**
> O que preciso fazer com pendências?
> ├── Ver situação atual       → /manage-pendentes list PEN-004
> ├── Criar nova pendência     → /manage-pendentes create PEN-004
> ├── Analisar opções          → /manage-pendentes analyze PEN-004 PENDENTE-XXX
> ├── Registrar decisão        → /manage-pendentes decide PEN-004 PENDENTE-XXX opcao=X
> ├── Implementar decisão      → /manage-pendentes implement PEN-004 PENDENTE-XXX
> ├── Cancelar pendência       → /manage-pendentes cancel PEN-004 PENDENTE-XXX
> └── Relatório consolidado    → /manage-pendentes report PEN-004

**Estado atual:** 3/3 pendências resolvidas — nenhuma ação necessária.

#### Painel de Pendências — Resumo Individual

| PENDENTE | Status | Sev. | Domínio | Decisão | Artefato de saída |
|----------|--------|------|---------|---------|-------------------|
| PENDENTE-001 | ✅ IMPLEMENTADA | ALTA | SEC | Opção A — 8 scopes `identity:*` registrados no catálogo canônico (DOC-FND-000 §2.2) | DOC-FND-000 §2.2 atualizado |
| PENDENTE-002 | ✅ IMPLEMENTADA | MÉDIA | INT | Opção A — Contrato de exposição `user_org_scopes` documentado em INT-001.5 para consumidores downstream | INT-001.5 v0.5.0 |
| PENDENTE-003 | ✅ IMPLEMENTADA | MÉDIA | ARC | Opção A — TTL 300s no cache Redis como safety net contra falha dupla (Worker+DEL) | INT-001.1 v0.4.0 |

**SLA:** Todas as pendências foram resolvidas em 1 dia (criadas 2026-03-17, implementadas 2026-03-18).

---

### Utilitários

```bash
# Atualizar índice do mod.md
/update-index docs/04_modules/mod-004-identidade-avancada/mod.md

# Corrigir pipeline Mermaid no CHANGELOG (stale — mostra E3, deveria ser E4+)
# Editar manualmente CHANGELOG.md para refletir Etapa 4 concluída

# Gerar commit
/git commit

# Recriar/atualizar este plano
/action-plan MOD-004 --update
```

---

## Resumo Visual do Fluxo MOD-004

```text
Fase 0         Fase 1         Fase 2              Fase 3           Fase 4        Fase 5
Pré-Módulo     Gênese         Enriquecimento      Validação        Promoção      Pós-READY
──────────     ──────         ──────────────      ─────────        ────────      ─────────
[✅ DONE]  →  [✅ DONE]  →  [✅ DONE]        → [⬜ PENDENTE] → [⬜ PENDENTE] → [⬜ SOB DEMANDA]
                              │                    │
                              │ 10/10 agentes ✅   │ /qa + /validate-manifest → A EXECUTAR
                              │ 3/3 pendentes ✅   │ OpenAPI/Drizzle/Endpoint → FUTURO
                              │ 4 ADRs ✅          │
                              └────────────────────┘

Dependências upstream:  MOD-000 (Foundation, DRAFT v0.10.0) + MOD-003 (Estrutura Org., DRAFT v0.3.0)
Camada topológica:      2 (implementar após MOD-000 e MOD-003)
Dependentes downstream: MOD-005 (Processos), MOD-006 (Execução), MOD-007 (Parametrização), MOD-008 (Protheus)
Bloqueio emitido:       BLK-003 — MOD-005 depende de org_scopes de MOD-004
```

---

## Particularidades do MOD-004

| Aspecto | Detalhe |
|---------|---------|
| Hub de identidade avançada | MOD-004 preenche a lacuna entre MOD-000 (identidade básica: quem pode fazer o quê em qual filial) e MOD-003 (estrutura organizacional: onde a organização existe). Três mecanismos — escopo de área, compartilhamento controlado e delegação temporária — resolvem o problema "em qual área organizacional um usuário atua". Sua promoção desbloqueia BLK-003 e habilita 4 módulos downstream a consumir `user_org_scopes`. |
| Nível 2 com cache Redis obrigatório | Único módulo até o momento que combina cache Redis com invalidação por mutação (`DEL auth:org_scope:user:{userId}`) E TTL safety net de 300s (ADR decidida via PENDENTE-003). Background job BullMQ a cada 5min para expiração automática de shares/delegations/org_scopes via Outbox Pattern. |
| Regra inegociável de delegação | Delegações NUNCA podem conter escopos `:approve`, `:execute`, `:sign` — invariante de domínio protegido por regex no service (ADR-004). Esta regra impede que delegatários tomem decisões em nome do delegante, preservando segregação de responsabilidade. |
| Validação de autorização por scope (não CHECK constraint) | Auto-autorização em compartilhamentos (`grantor_id = authorized_by`) é permitida condicionalmente ao scope `identity:share:authorize` — validação no service, não no banco (ADR-001). Decisão técnica de 2026-03-15 removeu CHECK constraint absoluto. |
| CHANGELOG Mermaid stale | Pipeline Mermaid ainda mostra Etapa 3 ("Stubs em DRAFT"), mas o enriquecimento (Etapa 4) está integralmente concluído com 10 agentes e 3 pendências resolvidas. Deve ser corrigido para Etapa 4 antes da validação/promoção. |
| Dependências upstream ambas em DRAFT | MOD-000 (v0.10.0) e MOD-003 (v0.3.0) são pré-requisitos na camada topológica e ambos ainda estão em DRAFT. A promoção de especificação do MOD-004 não depende do estado dos upstream, mas a implementação de código sim. Rota sequencial ideal: MOD-000 → MOD-003 → MOD-004. |

---

## Checklist Rápido — O que Falta para READY

- [ ] Corrigir pipeline Mermaid no CHANGELOG.md (E3 → E4 concluída)
- [ ] Executar `/validate-all docs/04_modules/mod-004-identidade-avancada/`
- [ ] Corrigir violações encontradas na validação (se houver)
- [ ] Re-executar validação até aprovação limpa
- [ ] Verificar que MOD-000 e MOD-003 estão na rota para READY (dependências upstream)
- [ ] Executar `/promote-module docs/04_modules/mod-004-identidade-avancada/`

> **Nota:** Todas as outras pré-condições para promoção já estão atendidas — épico READY, 4/4 features READY, 10/10 requirements, 4 ADRs (≥3 para Nível 2), 0 pendências abertas. A promoção de MOD-004 desbloqueia BLK-003 e habilita MOD-005 (Processos) a avançar.

---

## CHANGELOG deste Documento

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0.0 | 2026-03-21 | Criação. Diagnóstico: Fase 2 concluída (10 agentes, 3 pendências resolvidas). Pronto para Fase 3 (validação). Nível 2 full-stack com cache Redis, 4 ADRs, 2 screen manifests. Dependências upstream (MOD-000, MOD-003) ambas DRAFT. |
