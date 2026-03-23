# Procedimento — Plano de Acao MOD-001 Backoffice Admin

> **Versao:** 1.0.0 | **Data:** 2026-03-22 | **Owner:** arquitetura
> **Estado atual do modulo:** DRAFT (v0.10.0) | **Epico:** READY (v0.5.0) | **Features:** 3/3 READY
>
> Fases 0-2 concluidas. Proximo passo: Fase 3 (Validacao) — executar `/validate-all`.

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

Primeiro modulo full-stack pos-Foundation. Scaffoldado em 2026-03-16 apos rollback de uma tentativa anterior (v0.3.0 do epico registra rollback de scaffold destruido).

```
3    /forge-module MOD-001  Scaffold completo gerado:                        CONCLUIDO
                           mod-001-backoffice-admin.md, CHANGELOG.md,       v0.1.0 (2026-03-16)
                           requirements/ (br/, fr/, data/, int/, sec/,
                           ux/, nfr/), adr/, amendments/
                           Stubs obrigatorios: DATA-003, SEC-002
                           Pasta: docs/04_modules/mod-001-backoffice-admin/
```

### Fase 2: Enriquecimento — CONCLUIDO

O enriquecimento do MOD-001 foi completo — todos os agentes rodaram entre 2026-03-16 e 2026-03-18. Durante o processo, 4 pendencias foram identificadas e todas resolvidas. Destaque para PENDENTE-003 que expandiu o escopo com FR-007 (Alterar Senha) e INT-006.

> **Decision tree de enriquecimento:**
>
> ```
> Quero enriquecer todos os modulos elegiveis?
> ├── SIM → /enrich-all (sequencial, com checkpoint e --dry-run/--resume)
> └── NAO → Qual escopo?
>     ├── Todos agentes de 1 modulo  → /enrich mod-001
>     └── 1 agente especifico        → /enrich-agent AGN-DEV-XX mod-001
> ```

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

#### Pendentes Resolvidas no Enriquecimento — Detalhamento Completo

> As 4 pendencias abaixo foram identificadas durante o enriquecimento e todas foram decididas e implementadas em 2026-03-18.

---

##### ~~PENDENTE-001 — Estrategia de Cache de auth_me entre Shell e Dashboard~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-16
- **criado_por:** AGN-DEV-10
- **rastreia_para:** FR-004, FR-005, INT-002, INT-005
- **tags:** cache, auth-me, react-query, performance
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** usuario
- **opcao_escolhida:** C

**Questao:**
O Shell (UX-SHELL-001) e o Dashboard (UX-DASH-001) ambos chamam `GET /auth/me` ao montar. Devem compartilhar o resultado via React Context/cache ou cada componente faz sua propria chamada?

**Impacto:**
Performance (chamada duplicada), consistencia (dados sempre frescos vs. stale), complexidade (cache management)

**Opcao A — Cada componente chama auth_me independentemente:**
Simplicidade maxima, 2 requisicoes no carregamento inicial.

- Pros: Zero complexidade, sem gerenciamento de cache
- Contras: Chamada duplicada, desperdicio de banda

**Opcao B — Shell chama auth_me e injeta via React Context:**
1 requisicao, mas acoplamento Shell↔Dashboard.

- Pros: 1 requisicao, dados compartilhados
- Contras: Acoplamento Shell↔Dashboard, Context precisa ser mantido

**Opcao C — React Query/SWR com cache de 30s:**
1 requisicao efetiva, cache automatico, sem acoplamento.

- Pros: 1 requisicao efetiva, cache automatico entre Shell e Dashboard, sem acoplamento direto
- Contras: Dependencia de lib de cache (React Query ou SWR)

**Recomendacao:** Opcao C (React Query/SWR) — balance entre performance e simplicidade.

**Resolucao:**

> **Decisao:** Opcao C — React Query/SWR com cache de 30s
> **Decidido por:** usuario em 2026-03-18
> **Justificativa:** Cache TTL curto (30s) garante dados frescos sem duplicar chamadas. Shell e Dashboard compartilham resultado via query key sem acoplamento direto. Se lib de cache ja existe no projeto, custo zero de adocao.
> **Artefato de saida:** FR-004 v0.5.0, FR-005 v0.4.0 — clausula de cache auth_me adicionada
> **Implementado em:** 2026-03-18

---

##### ~~PENDENTE-002 — Comportamento do Shell quando auth_me retorna scopes vazios~~

- **status:** IMPLEMENTADA
- **severidade:** BAIXA
- **dominio:** UX
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-16
- **criado_por:** AGN-DEV-10
- **rastreia_para:** FR-004, UX-001, BR-005
- **tags:** sidebar, empty-state, scopes, ux
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** B

**Questao:**
Se auth_me retorna `scopes=[]`, o Dashboard mostra "Nenhum modulo disponivel". Mas a Sidebar tambem fica completamente vazia — apenas o Header com ProfileWidget e visivel. Isso e aceitavel do ponto de vista UX ou devemos exibir um estado vazio explicativo na Sidebar?

**Impacto:**
UX (primeira impressao do admin sem permissoes), suporte (chamados por "tela em branco").

**Opcao A — Sidebar vazia e aceitavel:**
O Dashboard ja explica a situacao com "Nenhum modulo disponivel para seu perfil."

- Pros: Zero complexidade; ja implementado no Dashboard
- Contras: Sidebar completamente vazia pode parecer bug; usuario pode nao notar mensagem do Dashboard

**Opcao B — Sidebar exibe mensagem "Nenhum modulo configurado" com icone informativo:**
Quando `scopes=[]`, Sidebar exibe item placeholder com icone `Info` e texto explicativo.

- Pros: UX clara; contexto imediato; reduz chamados de suporte
- Contras: Componente extra na Sidebar (complexidade minima)

**Recomendacao:** Opcao B — melhora a UX sem complexidade adicional.

**Resolucao:**

> **Decisao:** Opcao B — Sidebar exibe mensagem "Nenhum modulo configurado" com icone informativo
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** Sidebar com mensagem explicativa melhora UX sem complexidade. Evita percepcao de "tela quebrada" e reduz chamados de suporte. O Dashboard ja trata scopes=[] com mensagem propria, mas Sidebar vazia sem contexto confunde o usuario.
> **Artefato de saida:** FR-004 v0.7.0 (empty state Sidebar), UX-001 v0.5.0 (UX-002 empty state atualizado)
> **Implementado em:** 2026-03-18

---

##### ~~PENDENTE-003 — Fluxo de "Alterar Senha" no ProfileWidget~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** BIZ
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **rastreia_para:** FR-004, UX-001, INT-001, DOC-FND-000
- **tags:** alterar-senha, profile-widget, lacuna-fr
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A

**Questao:**
O dropdown do ProfileWidget (FR-004, UX-002) lista a acao "Alterar Senha", que deveria disparar `POST /auth/change-password` (DOC-FND-000 §1.3). Porem, nao existe nenhum FR dedicado ao fluxo de alteracao de senha (campos senha_atual + nova_senha + confirmar_nova_senha), nenhum INT documentando o contrato desse endpoint e nenhum UIActionEnvelope correspondente em DATA-003.

**Impacto:**
Sem especificacao, o fluxo de alteracao de senha sera implementado sem criterios de aceite definidos. Omissao pode levar a inconsistencias de UX, falta de telemetria e ausencia de testes E2E.

**Opcao A — Criar FR-007, INT-006 e UIActionEnvelope para "Alterar Senha":**
Especificar o fluxo completo: modal no ProfileWidget, campos senha_atual + nova_senha + confirmar, POST /auth/change-password, domain event `auth.password_changed`.

- Pros: Cobertura completa, rastreabilidade, testes E2E definidos
- Contras: Escopo adicional no MOD-001 (mais um FR + INT)

**Opcao B — Adiar para MOD-002 ou sprint futuro:**
Marcar "Alterar Senha" como "roadmap futuro" no ProfileWidget dropdown (desabilitado ou oculto).

- Pros: Reduz escopo do MOD-001
- Contras: ProfileWidget entregue com funcionalidade incompleta, UX confusa

**Recomendacao:** Opcao A — o fluxo de alteracao de senha e parte natural do Shell de autenticacao e o endpoint ja existe no Foundation.

**Acao sugerida:**

| Skill | Proposito | Quando executar |
|---|---|---|
| `/enrich-agent mod-001 AGN-DEV-03` | Criar FR-007 (Alterar Senha) | Apos decisao |
| `/enrich-agent mod-001 AGN-DEV-05` | Criar INT-006 (change-password) | Apos FR-007 |

**Resolucao:**

> **Decisao:** Opcao A — Criar FR-007, INT-006 e UIActionEnvelope para "Alterar Senha"
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** O fluxo de alteracao de senha e parte natural do Shell de autenticacao e o endpoint ja existe no Foundation (DOC-FND-000 §1.3). O custo de especificar e baixo (FR-007 + INT-006 + 1 UIActionEnvelope) e a UX fica completa. Adiar (Opcao B) entregaria ProfileWidget com funcionalidade incompleta.
> **Artefato de saida:** FR-007 v0.1.0 (Alterar Senha via modal ProfileWidget), INT-006 v0.1.0 (POST /auth/change-password), DATA-003 v0.5.0 (UIActionEnvelope submit_change_password), INT-001 v0.5.0 (tabela resumo atualizada)
> **Implementado em:** 2026-03-18

---

##### ~~PENDENTE-004 — Tela MFA (/login/mfa) referenciada mas nao especificada~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** BIZ
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **rastreia_para:** FR-001, UX-001, MOD-001
- **tags:** mfa, login, roadmap, lacuna-ux
- **dependencias:** []
- **decidido_em:** 2026-03-18
- **decidido_por:** usuario
- **opcao_escolhida:** B

**Questao:**
FR-001 especifica que login com `mfa_required=true` redireciona para `/login/mfa?session=temp_token`. Porem, o mod.md §2 lista "MFA/TOTP na tela de login (UX-MFA-001 — roadmap futuro)" no escopo "Nao Inclui". Nao ha FR, UX, INT ou Screen Manifest para a tela MFA. Se o MOD-000 ja suporta MFA, o redirect vai para uma rota inexistente.

**Impacto:**
Se o Foundation ativar MFA para algum tenant antes do MOD-001 especificar a tela, o usuario sera redirecionado para uma rota sem componente — resultando em 404 ou tela branca (viola principio Zero-Blank-Screen, ADR-003).

**Opcao A — Especificar tela MFA minima no MOD-001 (UX-MFA-001):**
Criar FR, UX e INT para um fluxo MFA basico. Mover MFA de "Nao Inclui" para "Inclui" no mod.md.

- Pros: Evita rota orfao, cobertura completa
- Contras: Aumenta escopo significativamente

**Opcao B — Manter MFA como roadmap, mas adicionar fallback no redirect:**
Se `mfa_required=true` e a rota /login/mfa nao existe, exibir Toast informativo: "MFA requerido. Contate o administrador." e nao redirecionar.

- Pros: Escopo minimo, sem tela branca, graceful degradation
- Contras: Funcionalidade MFA indisponivel ate ser especificada

**Recomendacao:** Opcao B — manter MFA como roadmap, mas implementar fallback defensivo. Garante Zero-Blank-Screen (ADR-003).

**Resolucao:**

> **Decisao:** Opcao B — Manter MFA como roadmap, mas adicionar fallback no redirect
> **Decidido por:** usuario em 2026-03-18
> **Justificativa:** MFA permanece roadmap futuro (mod.md §2). Fallback defensivo evita rota orfao/tela branca caso MOD-000 ative MFA antes da tela ser especificada. Zero-Blank-Screen (ADR-003) preservado.
> **Artefato de saida:** FR-001 v0.6.0 — fallback defensivo mfa_required (Toast + nao redireciona)
> **Implementado em:** 2026-03-18

---

### Fase 3: Validacao — PENDENTE

O `/validate-all` ainda nao foi executado para o MOD-001. Com o enriquecimento completo e todas as pendencias resolvidas, o proximo passo e executar a validacao.

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
5    /validate-all docs/04_modules/mod-001-backoffice-admin/
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
5a   /qa docs/04_modules/mod-001-backoffice-admin/
                           Diagnostico de sintaxe e integridade:              INDIVIDUAL
                           - lint:docs (Pass A-E: EX-*, §N, IDs, context-map, ciclos)
                           - Consistencia de metadados (estado_item, owner)
                           - Dead links, DoR alignment

5b   /validate-manifest ux-auth-001.login.yaml
                           Validar manifests contra schema v1:               INDIVIDUAL
                           - ux-auth-001.login.yaml
                           - ux-shell-001.app-shell.yaml
                           - ux-dash-001.main.yaml
                           Verifica: DOC-UX-010, operationId, RBAC,
                           telemetria pre/pos-auth, permissions

5c   /validate-openapi                                                       N/A (UX-First)
5d   /validate-drizzle                                                       N/A (UX-First)
5e   /validate-endpoint                                                      N/A (UX-First)
```

#### Validadores Aplicaveis — Mapa de Cobertura

| # | Validador | Aplicavel (nivel) | Executavel agora | Artefatos |
|---|-----------|-------------------|------------------|-----------|
| 1 | `/qa` | SIM (todos) | SIM | mod-001-backoffice-admin.md, requirements/*, adr/*, CHANGELOG.md |
| 2 | `/validate-manifest` | SIM (3 manifests existem) | SIM | ux-auth-001, ux-shell-001, ux-dash-001 |
| 3 | `/validate-openapi` | N/A | N/A | UX-First — sem backend proprio (endpoints sao do MOD-000) |
| 4 | `/validate-drizzle` | N/A | N/A | UX-First — sem entidades de banco proprias |
| 5 | `/validate-endpoint` | N/A | N/A | UX-First — sem handlers Fastify proprios |

### Fase 4: Promocao — PENDENTE

```
10   /promote-module docs/04_modules/mod-001-backoffice-admin/
                           Selar mod-001 como READY:                         A EXECUTAR (apos fase 3)
                           Gate 0 — Definition of Ready (DoR):
                             [DoR-1] PENDENTEs resolvidos? .............. SIM (4/4 IMPLEMENTADA)
                             [DoR-2] Arquivos de requisito existem? ..... SIM (12/12)
                             [DoR-3] Zero erros de lint? ................ A VERIFICAR (executar /qa)
                             [DoR-4] Screen manifests validados? ........ A VERIFICAR (executar /validate-manifest)
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
>
> ```
> O que preciso fazer com pendencias?
> ├── Ver situacao atual       → /manage-pendentes list PEN-001
> ├── Criar nova pendencia     → /manage-pendentes create PEN-001
> ├── Analisar opcoes          → /manage-pendentes analyze PEN-001 PENDENTE-XXX
> ├── Registrar decisao        → /manage-pendentes decide PEN-001 PENDENTE-XXX opcao=X
> ├── Implementar decisao      → /manage-pendentes implement PEN-001 PENDENTE-XXX
> ├── Cancelar pendencia       → /manage-pendentes cancel PEN-001 PENDENTE-XXX
> └── Relatorio consolidado    → /manage-pendentes report PEN-001
> ```

```
16   /manage-pendentes list PEN-001
                           Estado atual MOD-001:
                             PEN-001: 4 itens total
                               4 IMPLEMENTADA (001-004)
                               0 ABERTA
                             SLA: nenhum vencido
```

#### Painel de Pendencias — Resumo Individual

| PENDENTE | Status | Sev. | Dominio | Decisao | Artefato de saida |
|----------|--------|------|---------|---------|-------------------|
| PENDENTE-001 | IMPLEMENTADA | MEDIA | ARC | Opcao C — React Query/SWR cache 30s | FR-004, FR-005 |
| PENDENTE-002 | IMPLEMENTADA | BAIXA | UX | Opcao B — Sidebar empty state com icone | FR-004, UX-001 |
| PENDENTE-003 | IMPLEMENTADA | ALTA | BIZ | Opcao A — FR-007 + INT-006 Alterar Senha | FR-007, INT-006, DATA-003, INT-001 |
| PENDENTE-004 | IMPLEMENTADA | MEDIA | BIZ | Opcao B — fallback defensivo MFA redirect | FR-001 v0.6.0 |

> Detalhamento completo: ver [Fase 2](#pendentes-resolvidas-no-enriquecimento--detalhamento-completo).

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
  ├── ★ PROXIMO PASSO: /validate-all
  │     ├── /qa .................. A EXECUTAR
  │     ├── /validate-manifest ... A EXECUTAR (3 manifests)
  │     ├── /validate-openapi .... N/A (UX-First)
  │     ├── /validate-drizzle .... N/A (UX-First)
  │     └── /validate-endpoint ... N/A (UX-First)
  │
  ▼
mod-001 validado (DRAFT)                ← Fase 3: A EXECUTAR
  │
  ├── Gate 0 (DoR): 5/7 atendidos, 2 A VERIFICAR (lint + manifests)
  │
  ▼
mod-001 selado (READY)                  ← Fase 4: A EXECUTAR (apos fase 3)
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

- [ ] Executar `/validate-all docs/04_modules/mod-001-backoffice-admin/` — /qa + /validate-manifest
- [ ] Corrigir eventuais erros encontrados
- [ ] Executar `/promote-module docs/04_modules/mod-001-backoffice-admin/` — verificar Gate 0 (DoR) 7/7

> **Nota:** Todas as 4 pendencias ja estao IMPLEMENTADA. Os 12 artefatos de requisitos estao enriquecidos. As 3 ADRs excedem o minimo para Nivel 1. Nao ha bloqueios (BLK-*) afetando MOD-001. A unica dependencia upstream (MOD-000) esta DRAFT mas isso nao impede a promocao da especificacao — apenas a geracao de codigo.

---

## CHANGELOG deste Documento

| Versao | Data | Descricao |
|--------|------|-----------|
| 1.0.0 | 2026-03-22 | Criacao completa: Fases 0-2 CONCLUIDAS, Fase 3 PENDENTE, detalhamento completo das 4 pendentes resolvidas (001-004), rastreio de agentes, mapa de cobertura de validadores, particularidades UX-First |
