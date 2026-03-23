# Procedimento — Plano de Acao MOD-002 Gestao de Usuarios

> **Versao:** 2.0.0 | **Data:** 2026-03-22 | **Owner:** arquitetura
> **Estado atual do modulo:** DRAFT (v0.4.0) | **Epico:** READY (v1.2.0) | **Features:** 3/3 READY
>
> Fases 0-2 concluidas. Proximo passo: Fase 3 (Validacao) — executar `/validate-all`.

---

## Estado Atual — Resumo Diagnostico

| Item | Estado | Detalhe |
|------|--------|---------|
| Epico US-MOD-002 | READY (v1.2.0) | DoR completo, 3 features vinculadas, abordagem UX-First, separacao MOD-002 (UX) vs MOD-000-F05 (API) |
| Features F01-F03 | 3/3 READY | F01 (Listagem de Usuarios), F02 (Formulario de Cadastro), F03 (Convite e Ativacao) |
| Scaffold (forge-module) | CONCLUIDO | mod-002-gestao-usuarios/ com estrutura completa |
| Enriquecimento (11 agentes) | CONCLUIDO | Agentes 01-11 confirmados, v0.4.0 (MOD) / v0.10.0 (PEN), 3 pendentes resolvidas |
| PENDENTEs | 0 abertas | 3 total: 3 IMPLEMENTADA |
| ADRs | 3 aceitas | Nivel 1 requer minimo 1 — atendido (ADR-001 UX-First, ADR-002 PII-Safe UI, ADR-003 Idempotency-Key) |
| Amendments | 0 | Nenhum |
| Requirements | 16/16 existem | BR(6), FR(3), DATA(2), INT(1), SEC(2), UX(1), NFR(1), PEN(1) |
| CHANGELOG | v0.4.0 (MOD) / v0.10.0 (PEN) | Ultima entrada 2026-03-18 (PEN) / 2026-03-17 (MOD) |
| Screen Manifests | 3/3 existem | ux-usr-001 (listagem), ux-usr-002 (formulario), ux-usr-003 (convite) |
| Dependencias | 1 upstream (MOD-000) | Consome Users API (F05), Roles API (F06), Auth, Catalogo de Scopes (F12) |
| Bloqueios | 1 (BLK-001) | Amendment `users_invite_resend` no MOD-000 — PENDENTE-001 ja IMPLEMENTADA mas BLK-001 consta PENDENTE no DEPENDENCY-GRAPH |

---

## Procedimento por Fases

```
PASSO    SKILL/ACAO              DETALHES                                    STATUS
```

### Fase 0: Pre-Modulo — CONCLUIDA

O epico US-MOD-002 define o modulo de Gestao de Usuarios como exclusivamente UX-First: Screen Manifests YAML e User Stories orientadas a UX sao definidos **antes** de qualquer geracao de codigo. O modulo consome 6 operationIds do MOD-000-F05 (Users API) e MOD-000-F06 (Roles API) — nao cria endpoints novos. Cobre Listagem Paginada, Formulario de Cadastro (dois modos) e Fluxo de Convite com Reenvio.

```
1    (manual)              Revisar e finalizar epico US-MOD-002:             CONCLUIDO
                           - Escopo fechado (3 features UX-First)           status_agil = READY
                           - Gherkin validado (cascata, manifests, operationIds)  v1.2.0
                           - DoR completo (separacao UX vs API, manifests, scopes)
                           - Separacao MOD-002 (UX) vs MOD-000-F05 (API) documentada
                           - Screen Manifests vinculados (3 YAML schema v1)
                           - operationIds de MOD-000-F05 e F06 declarados e verificados
                           Arquivo: docs/04_modules/user-stories/epics/US-MOD-002.md

2    (manual)              Revisar e finalizar features F01-F03:             CONCLUIDO
                           - F01: Listagem de Usuarios + Filtros + Acoes    3/3 READY
                           - F02: Formulario de Cadastro (senha / convite)
                           - F03: Fluxo de Convite e Ativacao
                           - Scopes alinhados DOC-FND-000 §2.2
                           - Cenarios de erro e acesso ampliados (v1.2.0)
                           Arquivos: docs/04_modules/user-stories/features/US-MOD-002-F{01..03}.md
```

### Fase 1: Genese do Modulo — CONCLUIDA

Modulo UX-First pos-Foundation. Scaffoldado em 2026-03-17 a partir do epico READY (v1.2.0). Consome MOD-000-F05 (Users API) e MOD-000-F06 (Roles API).

```
3    /forge-module MOD-002  Scaffold completo gerado:                        CONCLUIDO
                           mod-002-gestao-usuarios.md, CHANGELOG.md,        v0.1.0 (2026-03-17)
                           requirements/ (br/, fr/, data/, int/, sec/,
                           ux/, nfr/), adr/, amendments/
                           Stubs obrigatorios: DATA-003, SEC-002
                           Modulo UX-First: consome MOD-000-F05/F06
                           Pasta: docs/04_modules/mod-002-gestao-usuarios/
```

### Fase 2: Enriquecimento — CONCLUIDO

O enriquecimento do MOD-002 foi completo — 11 agentes rodaram entre 2026-03-17 e 2026-03-18 em 4 batches. Durante o processo, 3 pendencias foram identificadas e todas resolvidas. Destaque para PENDENTE-001 que era BLOQUEANTE (amendment no MOD-000-F05) e foi resolvida com endpoint adicionado diretamente em FR-000 §FR-006.

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-002
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-002
> ```

```
4    /enrich docs/04_modules/mod-002-gestao-usuarios/
                           Agentes executados sobre mod-002:                 CONCLUIDO
                           AGN-DEV-01 (MOD), AGN-DEV-02 (BR),              v0.4.0 (2026-03-17)
                           AGN-DEV-03 (FR), AGN-DEV-04 (DATA),
                           AGN-DEV-05 (INT), AGN-DEV-06 (SEC),
                           AGN-DEV-07 (UX), AGN-DEV-08 (NFR),
                           AGN-DEV-09 (ADR), AGN-DEV-10 (PEN),
                           AGN-DEV-11 (VAL)
                           3 pendentes criadas e resolvidas (001-003)
```

#### Rastreio de Agentes — MOD-002

| # | Agente | Pilar | Artefato | Status | Evidencia |
|---|--------|-------|----------|--------|-----------|
| 1 | AGN-DEV-01 | MOD/Escala | mod-002-gestao-usuarios.md | CONCLUIDO | CHANGELOG v0.2.0, v0.3.0 — Nivel 1 confirmado (score 2/6), personas com scopes, OKRs, premissas/restricoes |
| 2 | AGN-DEV-02 | BR | BR-001..BR-006 | CONCLUIDO | v0.2.0/v0.3.0 — 6 regras criadas (scopes RBAC, PII LGPD, modos exclusivos, cooldown, idempotencia, erros inline/toast) |
| 3 | AGN-DEV-03 | FR | FR-001, FR-002, FR-003 | CONCLUIDO | v0.2.0/v0.3.0 — 3 specs enriquecidas, idempotencia/timeline explicitos |
| 4 | AGN-DEV-04 | DATA | DATA-001, DATA-003 | CONCLUIDO | DATA-001 v0.1.0 (modelo consumido), DATA-003 v0.3.0 (catalogo eventos re-validado) |
| 5 | AGN-DEV-05 | INT | INT-001 | CONCLUIDO | v0.3.0 — RFC 9457, cache, CORS, alinhamento DATA-001 |
| 6 | AGN-DEV-06 | SEC | SEC-001, SEC-002 | CONCLUIDO | SEC-001 v0.3.0 (transport security, threat model), SEC-002 v0.3.0 (re-validado) |
| 7 | AGN-DEV-07 | UX | UX-001 | CONCLUIDO | v0.3.0 — error recovery flows, telemetria detalhada, view-model mapping |
| 8 | AGN-DEV-08 | NFR | NFR-001 | CONCLUIDO | v0.3.0 — testabilidade, resiliencia, seguranca UI, metricas qualidade |
| 9 | AGN-DEV-09 | ADR | ADR-001, ADR-002, ADR-003 | CONCLUIDO | 3 ADRs criadas e aceitas (UX-First, PII-Safe UI, Idempotency-Key) |
| 10 | AGN-DEV-10 | PEN | pen-002-pendente.md | CONCLUIDO | v0.4.0..v0.10.0 — 3 pendentes criadas e resolvidas |
| 11 | AGN-DEV-11 | VAL | pen-002-pendente.md | CONCLUIDO | v0.2.0/v0.3.0 — migracao para formato enriquecido (TEMPLATE-PENDENTE §4) |

#### Pendentes Resolvidas no Enriquecimento — Detalhamento Completo

> As 3 pendencias abaixo foram identificadas durante o enriquecimento e todas foram decididas e implementadas em 2026-03-18.

---

##### ~~PENDENTE-001 — Amendment `users_invite_resend` no MOD-000-F05~~

- **status:** IMPLEMENTADA
- **severidade:** BLOQUEANTE
- **dominio:** ARC
- **tipo:** DEP-EXT
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **rastreia_para:** US-MOD-002, US-MOD-002-F03, FR-003, INT-001, DATA-003, SEC-002, UX-001, MOD-000, US-MOD-000-F05
- **tags:** amendment, cross-module, wave-1, users-api
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** usuario
- **opcao_escolhida:** A

**Questao:**
O endpoint `POST /api/v1/users/:id/invite/resend` (operationId: `users_invite_resend`) nao existe no MOD-000-F05 atual. A feature F03 (UX-USR-003 — Fluxo de Convite e Ativacao) depende deste endpoint para funcionar.

**Impacto:**
Bloqueio de DoD: F03 nao pode ser scaffoldada nem testada sem este endpoint. Artefatos impactados: FR-003, INT-001, DATA-003 (`user.invite_resent`), SEC-002, UX-001 (Jornada 3). Nao bloqueia F01 e F02 que podem ser scaffoldadas independentemente.

**Opcao A — Criar amendment no MOD-000-F05 (Recomendada):**
Usar `/create-amendment` no MOD-000-F05 para adicionar o endpoint. Contrato minimo ja documentado em US-MOD-002-F03 §1.

- Pros: resolve o bloqueio definitivamente; contrato ja especificado (scope, status, outbox, idempotencia); alinhado com padrao do Foundation
- Contras: depende de revisao/aprovacao do owner do MOD-000

**Opcao B — Stub temporario no frontend:**
Implementar F03 com endpoint mockado e feature flag. Habilitar quando o amendment for criado.

- Pros: permite iniciar o scaffolding de F03 imediatamente
- Contras: complexidade adicional de feature flag sem beneficio real; risco de divergencia entre mock e contrato final; trabalho descartavel

**Recomendacao:** Opcao A — Criar o amendment no MOD-000-F05 antes de iniciar o scaffolding da F03. F01 e F02 podem ser scaffoldadas em paralelo sem bloqueio.

**Resolucao:**

> **Decisao:** Opcao A — Criar amendment no MOD-000-F05
> **Decidido por:** usuario em 2026-03-18
> **Justificativa:** Resolve o bloqueio definitivamente; contrato minimo ja documentado em US-MOD-002-F03 §1 (scope, status, outbox, idempotencia); alinhado com padrao do Foundation. Stub temporario (Opcao B) adicionaria complexidade descartavel sem beneficio real.
> **Artefato de saida:** FR-000 §FR-006 (MOD-000) v0.5.0 — endpoint `users_invite_resend` adicionado diretamente (DRAFT)
> **Implementado em:** 2026-03-18

---

##### ~~PENDENTE-002 — Cooldown Anti-Spam Cross-Tab~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** ARC
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **rastreia_para:** US-MOD-002-F03, FR-003, BR-004, SEC-001, NFR-001
- **tags:** cooldown, anti-spam, cross-tab, ux-behavior
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** usuario
- **opcao_escolhida:** A

**Questao:**
BR-004 define cooldown de 60s client-side no botao "Reenviar convite". O que acontece quando o admin abre a mesma tela de convite em multiplas abas? Cada aba teria seu proprio timer independente, permitindo burlar o cooldown abrindo nova aba. O backend (MOD-000-F05) possui rate limiting generico (SEC-001 §8), mas nao esta especificado se existe rate limiting especifico por `user_id + invite_resend`.

**Impacto:**
Sem rate limiting backend especifico, admin pode enviar convites ilimitados abrindo novas abas, gerando spam de e-mail. Artefatos impactados: BR-004 (regra incompleta), FR-003 (cenarios de edge case), NFR-001 (resiliencia), INT-001 (contrato com backend).

**Opcao A — Aceitar cooldown apenas client-side (Recomendada para v1):**
O cooldown client-side e suficiente para o caso de uso nominal (admin bem-intencionado). O rate limiting generico do gateway protege contra abuso sistematico. Documentar a limitacao como "known limitation v1".

- Pros: zero complexidade adicional; rate limiting do gateway cobre cenario de abuso
- Contras: admin pode contornar cooldown via multiplas abas (cenario improvavel em backoffice interno)

**Opcao B — Sincronizar cooldown via BroadcastChannel API:**
Usar `BroadcastChannel` para sincronizar timer entre abas do mesmo origin.

- Pros: cooldown consistente cross-tab; sem round-trip ao backend
- Contras: complexidade adicional; `BroadcastChannel` requer polyfill em Safari < 15.4; beneficio marginal para backoffice interno

**Opcao C — Rate limiting especifico no backend (MOD-000-F05):**
Solicitar amendment no MOD-000-F05 para rate limiting por `user_id + invite_resend` (ex: 1 reenvio a cada 60s por user).

- Pros: protecao server-side real; independente do frontend
- Contras: requer amendment adicional no MOD-000; complexidade de implementacao no backend; ja existe rate limiting generico no gateway

**Recomendacao:** Opcao A para v1. Cooldown client-side e suficiente para backoffice interno com usuarios confiaveis. Documentar como "known limitation" e reavaliar se telemetria indicar abuso.

**Resolucao:**

> **Decisao:** Opcao A — Aceitar cooldown apenas client-side (known limitation v1)
> **Decidido por:** usuario em 2026-03-18
> **Justificativa:** Cooldown client-side e suficiente para backoffice interno com usuarios confiaveis. O rate limiting generico do gateway (SEC-001 §8) protege contra abuso sistematico. BroadcastChannel (Opcao B) adiciona complexidade marginal e requer polyfill. Rate limiting backend especifico (Opcao C) requer amendment adicional no MOD-000 sem beneficio proporcional. Documentar como known limitation v1 e reavaliar se telemetria indicar abuso.
> **Artefato de saida:** BR-004 v0.2.0 (secao "Known Limitation v1" adicionada com descricao, justificativa e criterio de reavaliacao)
> **Implementado em:** 2026-03-18

---

##### ~~PENDENTE-003 — Estrutura de Copy Centralizada (`domain/copy.ts`)~~

- **status:** IMPLEMENTADA
- **severidade:** BAIXA
- **dominio:** UX
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **rastreia_para:** US-MOD-002, ADR-002, BR-002, BR-006, UX-001, SEC-001
- **tags:** copy, i18n, lgpd, pii-safe
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A

**Questao:**
O ADR-002 (PII-Safe UI Pattern) determina que todas as mensagens de feedback (toasts, modais, erros inline) devem ser definidas como constantes centralizadas em `domain/copy.ts` para facilitar auditoria LGPD. Qual a estrutura interna desse arquivo? As mensagens devem ser plain strings, template functions com parametros seguros, ou um sistema de i18n?

**Impacto:**
Sem definicao, cada desenvolvedor cria strings inline nos componentes, dificultando auditoria LGPD e violando ADR-002. Artefatos impactados: ADR-002 (consequencia 1), BR-002 (enforcement), BR-006 (copy de erros), UX-001 (copy section).

**Opcao A — Object map com plain strings (Recomendada):**
Objeto TypeScript com chaves semanticas e valores string. Parametros seguros via template function quando necessario (ex: `deactivateModal: (name: string) => \`O usuario ${name} perdera acesso imediatamente.\``).

- Pros: simples; type-safe; auditavel via grep; sem dependencia de lib de i18n
- Contras: sem suporte nativo a pluralizacao ou locales multiplos (aceitavel — backoffice apenas pt-BR)

**Opcao B — Lib de i18n (react-intl, i18next):**
Usar biblioteca de internacionalizacao com arquivos de mensagens.

- Pros: suporte a pluralizacao, formatacao de datas, multiplos locales futuramente
- Contras: over-engineering para backoffice pt-BR only; dependencia adicional; complexidade de setup

**Recomendacao:** Opcao A — Object map simples em `domain/copy.ts`. Suficiente para backoffice pt-BR. Se i18n for necessario no futuro, migracao e trivial (extrair strings para arquivo JSON de locale).

**Resolucao:**

> **Decisao:** Opcao A — Object map com plain strings em `domain/copy.ts`
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** Object map com plain strings e simples, type-safe, auditavel via grep e sem dependencia de lib de i18n. Suficiente para backoffice pt-BR only. Migracao para i18n futura e trivial (extrair strings para arquivo JSON de locale).
> **Artefato de saida:** ADR-002 v0.2.0 (§Estrutura de `domain/copy.ts` adicionada)
> **Implementado em:** 2026-03-18

---

### Fase 3: Validacao — PENDENTE

O `/validate-all` ainda nao foi executado para o MOD-002. Com o enriquecimento completo e todas as pendencias resolvidas, o proximo passo e executar a validacao.

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
5    /validate-all docs/04_modules/mod-002-gestao-usuarios/
                           Orquestra TODAS as validacoes em sequencia:        A EXECUTAR
                           Internamente executa:
                             1. /qa (lint, links, metadados, EX-*, §N, ciclos)
                             2. /validate-manifest (screen manifests vs schema v1)
                             3. /validate-openapi → N/A (UX-First, sem backend)
                             4. /validate-drizzle → N/A (UX-First, sem entidades)
                             5. /validate-endpoint → N/A (UX-First, sem handlers)
                           Pre-condicao: Enriquecimento concluido
                           Pos-condicao: Relatorio consolidado pass/fail
```

> **Alternativa:** Executar validadores individuais:

```
5a   /qa docs/04_modules/mod-002-gestao-usuarios/
                           Diagnostico de sintaxe e integridade:              INDIVIDUAL
                           - lint:docs (Pass A-E: EX-*, §N, IDs, context-map, ciclos)
                           - Consistencia de metadados (estado_item, owner)
                           - Dead links, DoR alignment
                           - Verificar rastreia_para entre mod.md ↔ features ↔ manifests
                           - Verificar operationIds consumidos vs MOD-000

5b   /validate-manifest ux-usr-001.users-list.yaml
                           Validar manifests contra schema v1:               INDIVIDUAL
                           - ux-usr-001.users-list.yaml (listagem, /usuarios)
                           - ux-usr-002.user-form.yaml (formulario, /usuarios/novo)
                           - ux-usr-003.user-invite.yaml (convite, /usuarios/:id/convite)
                           Verifica: DOC-UX-010, operationId, RBAC,
                           telemetria, permissions (users:user:read/write/delete),
                           linked_stories referenciando US-MOD-002,
                           PII-Safe pattern (ADR-002), loading states

5c   /validate-openapi                                                       N/A (UX-First)
5d   /validate-drizzle                                                       N/A (UX-First)
5e   /validate-endpoint                                                      N/A (UX-First)
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | `/qa` | SIM (todos) | SIM | mod-002-gestao-usuarios.md, requirements/*, adr/*, CHANGELOG.md |
| 2 | `/validate-manifest` | SIM (3 manifests existem) | SIM | ux-usr-001, ux-usr-002, ux-usr-003 |
| 3 | `/validate-openapi` | N/A | N/A | UX-First — sem backend proprio (endpoints sao do MOD-000) |
| 4 | `/validate-drizzle` | N/A | N/A | UX-First — sem entidades de banco proprias |
| 5 | `/validate-endpoint` | N/A | N/A | UX-First — sem handlers Fastify proprios |

### Fase 4: Promocao — PENDENTE

```
10   /promote-module docs/04_modules/mod-002-gestao-usuarios/
                           Selar mod-002 como READY:                         A EXECUTAR (apos fase 3)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (3/3 IMPLEMENTADA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (16/16)
                             [DoR-3] Zero erros de lint? ................ A VERIFICAR (executar /qa)
                             [DoR-4] Screen manifests validados? ........ A VERIFICAR (executar /validate-manifest)
                             [DoR-5] ADRs conforme nivel? ............... SIM (3 >= 1 para N1)
                             [DoR-6] CHANGELOG atualizado? .............. SIM (v0.4.0 MOD / v0.10.0 PEN)
                             [DoR-7] Bloqueios cross-modulo? ............ ATENCAO (BLK-001 — ver Particularidades)

                           Fluxo interno:
                             Step 1: /qa (pre-check)
                             Step 2: Promover estado_item DRAFT→READY
                             Step 3: /qa (pos-check)
                             Step 4: /update-index
                             Step 5: /git commit
                           Pre-condicao: QA verde, DoR-1..7 atendidos
                           Pos-condicao: estado_item = READY, INDEX.md atualizado, commit
```

> **Nota:** MOD-002 depende de MOD-000 (Foundation) que ainda esta DRAFT. A promocao do MOD-002 pode ocorrer independentemente — o DoR nao exige que dependencias upstream estejam READY (apenas que existam). Porem, o codigo so pode ser gerado quando MOD-000 estiver READY (endpoints implementados). Adicionalmente, BLK-001 requer que o amendment `users_invite_resend` esteja implementado no MOD-000-F05 para que F03 possa ser scaffoldada.

### Fase 5: Pos-READY (quando necessario)

```
11   /update-specification docs/04_modules/mod-002-gestao-usuarios/requirements/fr/FR-001.md
                           Se spec precisa de ajuste apos READY:             SOB DEMANDA
                           Detecta estado_item=READY → delega para
                           /create-amendment automaticamente

12   /create-amendment FR-001 melhoria "adicionar campo X"
                           Criar amendment formal:                           SOB DEMANDA
                           Naming: {Pilar}-{ID}-{Natureza}{Seq}.md
                           Caso de uso previsto: MOD-002-F04 (edicao de usuarios)
                           quando o roadmap incluir a feature futura
```

### Gestao de Pendencias (qualquer momento)

> **Decision tree de pendencias:**
>
> ```
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-002
> ├── Criar nova pendencia     → /manage-pendentes create PEN-002
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-002 PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-002 PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-002 PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-002 PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-002
> ```

```
16   /manage-pendentes list PEN-002
                           Estado atual MOD-002:
                             PEN-002: 3 itens total
                               3 IMPLEMENTADA (001-003)
                               0 ABERTA
                             SLA: nenhum vencido
```

#### Painel de Pendencias — Resumo Individual

| PENDENTE | Status | Sev. | Dominio | Decisao | Artefato de saida |
|----------|--------|------|---------|---------|-------------------|
| PENDENTE-001 | IMPLEMENTADA | BLOQUEANTE | ARC | Opcao A — Amendment users_invite_resend no MOD-000-F05 | FR-000 §FR-006 (MOD-000) |
| PENDENTE-002 | IMPLEMENTADA | MEDIA | ARC | Opcao A — Cooldown client-side (known limitation v1) | BR-004 v0.2.0 |
| PENDENTE-003 | IMPLEMENTADA | BAIXA | UX | Opcao A — Object map plain strings em domain/copy.ts | ADR-002 v0.2.0 |

> Detalhamento completo: ver [Fase 2](#pendentes-resolvidas-no-enriquecimento--detalhamento-completo).

### Utilitarios (qualquer momento)

```
14   /git commit            Commit semantico apos qualquer alteracao           SOB DEMANDA
                           Formato: docs(mod-002): <descricao>

15   /update-index          Atualizar indices se criou/removeu arquivos       SOB DEMANDA
                           INDEX.md sincronizado

17   /readme-blueprint      Atualizar README.md do repositorio               SOB DEMANDA
```

---

## Resumo Visual do Fluxo MOD-002

```
US-MOD-002 (READY v1.2.0)              ← Fase 0: CONCLUIDA
  │  3/3 features READY (UX-First)
  │  3 screen manifests (UX-USR-001, UX-USR-002, UX-USR-003)
  │  6 operationIds consumidos do MOD-000 (F05+F06)
  ▼
mod-002-gestao-usuarios/ (stubs DRAFT) ← Fase 1: CONCLUIDA (forge-module v0.1.0)
  │
  ▼
mod-002 enriquecido (DRAFT v0.4.0)     ← Fase 2: CONCLUIDA (11 agentes, 3 PENDENTEs resolvidas)
  │
  ├── ★ PROXIMO PASSO: /validate-all
  │     ├── /qa .................. A EXECUTAR
  │     ├── /validate-manifest ... A EXECUTAR (3 manifests)
  │     ├── /validate-openapi .... N/A (UX-First)
  │     ├── /validate-drizzle .... N/A (UX-First)
  │     └── /validate-endpoint ... N/A (UX-First)
  │
  ├── /manage-pendentes .......... SOB DEMANDA (ciclo: create → analyze → decide → implement)
  │     └── SLA: BLOQUEANTE 7d | ALTA 14d | MEDIA 30d | BAIXA 90d
  │
  ▼
mod-002 validado (DRAFT)                ← Fase 3: A EXECUTAR
  │
  ├── Gate 0 (DoR): 5/7 atendidos, 2 A VERIFICAR (lint + manifests)
  ├── ATENCAO: BLK-001 — verificar se amendment users_invite_resend
  │   foi aplicado no MOD-000 antes de promover
  │
  ▼
mod-002 selado (READY)                  ← Fase 4: A EXECUTAR (apos fase 3)
  │
  ▼
mod-002 + amendments/                   ← Fase 5: SOB DEMANDA (0 amendments)

Dependencia upstream: MOD-000 (Foundation) — camada topologica 1.
MOD-002 e modulo folha (sem dependentes downstream).
```

---

## Particularidades do MOD-002

| Aspecto | Detalhe |
|---------|---------|
| Modulo UX-First | Nao possui backend proprio — consome 6 operationIds do MOD-000-F05 (users_list, users_create, users_get, users_delete, users_invite_resend) e MOD-000-F06 (roles_list). Os validadores `/validate-openapi`, `/validate-drizzle` e `/validate-endpoint` sao N/A. Apenas `/qa` e `/validate-manifest` sao aplicaveis. |
| Nivel 1 — Clean Leve (Score 2/6) | Dois gatilhos ativos: integracoes externas criticas (6 operationIds MOD-000) e multi-tenant (visibilidade filtrada por tenant_id, 3 scopes RBAC). Score 2/6 qualifica para Nivel 1. Complexidade de apresentacao (scopes, modos, cooldown, erros inline, PII) justifica o nivel. |
| Modulo folha | Nenhum outro modulo depende do MOD-002 — promocao nao desbloqueia cadeia downstream. |
| BLK-001 (bloqueio cross-modulo) | Amendment `users_invite_resend` precisa existir no MOD-000-F05. PENDENTE-001 ja foi IMPLEMENTADA (endpoint adicionado em FR-000 §FR-006 DRAFT), mas o BLK-001 no DEPENDENCY-GRAPH.md ainda consta como PENDENTE. Verificar e atualizar antes de promover. F01 e F02 podem ser scaffoldadas independentemente. |
| LGPD/PII-Safe (ADR-002) | PII-Safe UI Pattern — e-mail nunca exposto em toasts/modais/erros inline. Copy centralizada em `domain/copy.ts` com object map plain strings (PENDENTE-003 resolvida). Mensagens usam texto fixo sem interpolacao de PII. Unico dado pessoal permitido: fullName em modais de confirmacao. |
| Cooldown anti-spam (BR-004) | Cooldown 60s client-side no botao "Reenviar convite". Known limitation v1: nao sincroniza cross-tab (PENDENTE-002 resolvida — aceito para backoffice interno). Rate limiting generico do gateway cobre abuso sistematico. |
| Idempotencia frontend (ADR-003) | `Idempotency-Key` header (UUID v4) em POST /users e POST /invite/resend. Gerado no mount do componente, mantido ate sucesso (2xx), regenerado no proximo mount. Complementa disable de botao (NFR-001 §3). |
| Alto volume de BR | 6 regras de negocio (vs 1 tipico para N1) — reflete complexidade de apresentacao (scopes RBAC, PII LGPD, modos exclusivos, cooldown, idempotencia, erros inline/toast). |
| Dependencia exclusiva de MOD-000 | Todos os 6 operationIds consumidos sao do Foundation: users_list, users_create, users_get, users_delete, users_invite_resend (F05) e roles_list (F06). Nenhuma integracao externa alem do MOD-000. |
| 3 ADRs para Nivel 1 | Excede o minimo de 1 ADR. ADR-001 (UX-First sem endpoints proprios), ADR-002 (PII-Safe UI Pattern LGPD), ADR-003 (Idempotency-Key frontend). A riqueza de ADRs reflete decisoes de UX e compliance nao-obvias. |

---

## Checklist Rapido — O que Falta para READY

- [ ] Verificar se BLK-001 foi resolvido no DEPENDENCY-GRAPH.md (amendment `users_invite_resend` aplicado no MOD-000)
- [ ] Executar `/validate-all docs/04_modules/mod-002-gestao-usuarios/` — /qa + /validate-manifest
- [ ] Corrigir eventuais erros encontrados
- [ ] Executar `/promote-module docs/04_modules/mod-002-gestao-usuarios/` — verificar Gate 0 (DoR) 7/7

> **Alternativa:** Se preferir validar por partes, use `/qa` e `/validate-manifest` individualmente (passos 5a-5b).

> **Nota:** Todas as 3 pendencias ja estao IMPLEMENTADA. Os 16 artefatos de requisitos estao enriquecidos. As 3 ADRs excedem o minimo para Nivel 1. O unico bloqueio (BLK-001) ja tem PENDENTE-001 IMPLEMENTADA mas precisa ser atualizado no DEPENDENCY-GRAPH.md. A unica dependencia upstream (MOD-000) esta DRAFT mas isso nao impede a promocao da especificacao — apenas a geracao de codigo.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 2.0.0 | 2026-03-22 | Reescrita completa: detalhamento completo das 3 pendentes resolvidas (001-003), rastreio de 11 agentes, mapa de cobertura de validadores, particularidades (BLK-001, LGPD, cooldown, idempotencia, UX-First), painel de pendencias |
| 1.0.0 | 2026-03-21 | Criacao: estado atual, fases 0-5, DoR Gate 0, particularidades |
