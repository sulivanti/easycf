> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 1.2.0  | 2026-03-31 | manage-pendentes | PENDENTE-010 → IMPLEMENTADA — Opção B (manter soft delete, toggle visual dispara DELETE com modal). Artefato: UX-001-C03. |
> | 1.1.0  | 2026-03-31 | manage-pendentes | PENDENTE-010 → DECIDIDA — Opção B (manter soft delete com modal de confirmação, toggle visual apenas) |
> | 1.0.0  | 2026-03-24 | validate-all  | Re-validação pós-codegen: PENDENTE-007 → RESOLVIDA (lint agora passa), 0 violações novas |
> | 0.9.0  | 2026-03-24 | validate-all  | Adição PENDENTE-007 — erros lint codegen (12 ocorrências) |
> | 0.8.0  | 2026-03-18 | Marcos Sulivan | PENDENTE-004 → IMPLEMENTADA — Opção A (NFR-001 v0.3.0 §7.1, FR-001 v0.3.0) |
> | 0.7.0  | 2026-03-18 | Marcos Sulivan | PENDENTE-004 → DECIDIDA (Opção A) |
> | 0.3.0  | 2026-03-18 | Marcos Sulivan | PENDENTE-006 → DECIDIDA (Opção A) |
> | 0.2.0  | 2026-03-17 | AGN-DEV-10  | Enriquecimento Batch 4: PENDENTE-006 (filtro view_history), revisao de pendencias abertas |
> | 0.6.0  | 2026-03-18 | Marcos Sulivan | PENDENTE-002 → IMPLEMENTADA — Opção A (INT-001 v0.3.0, INT-007) |
> | 0.5.0  | 2026-03-18 | Marcos Sulivan | PENDENTE-002 → DECIDIDA (Opção A) |
> | 0.4.0  | 2026-03-18 | Marcos Sulivan | PENDENTE-006 → IMPLEMENTADA — Opção A (UX-001 v0.2.1) |
> | 0.1.0  | 2026-03-16 | arquitetura | Criado por AGN-DEV-10 (enrich) |

# PEN-003 — Pendências e Questões Abertas do MOD-003

---

## ~~PENDENTE-001~~ — ✅ RESOLVIDA: Restore (FR-004) Coberto por US-MOD-003-F04

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **domínio:** BIZ
- **tipo:** LACUNA
- **origem:** FORGE
- **criado_em:** 2026-03-16
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-17
- **decidido_por:** arquitetura
- **opcao_escolhida:** A
- **justificativa_decisao:** Restore é operação complementar essencial ao soft-delete; criar feature dedicada garante cobertura Gherkin, domain event e UX completos
- **modulo:** MOD-003
- **rastreia_para:** FR-004, US-MOD-003-F04, BR-009, US-MOD-003-M01
- **tags:** restore, soft-delete, feature-dedicada
- **sla_data:** —
- **dependencias:** []

### Questão

O endpoint `PATCH /org-units/:id/restore` (FR-004) para restaurar unidades soft-deleted não possuía feature dedicada. Deve ser coberto como cenário dentro de F01 ou como feature independente (F04)?

### Impacto

Sem feature dedicada, o fluxo de restore ficaria sem Gherkin, sem domain event `org.unit_restored` e sem UX definida (toggle inativos + menu contextual).

### Opções

**Opção A — Criar US-MOD-003-F04 dedicada ao restore:**
Feature independente com endpoint `PATCH /org-units/:id/restore`, Gherkin completo, BR-009, domain event `org.unit_restored`, UX (toggle inativos + menu contextual).

- Prós: Cobertura completa; Gherkin dedicado; domain event rastreável; UX definida
- Contras: Feature adicional no épico (escopo levemente maior)

**Opção B — Incluir restore como cenário em F01 (Listagem/CRUD):**
Adicionar cenários de restore dentro da feature de listagem existente.

- Prós: Menos artefatos; feature consolidada
- Contras: F01 fica sobrecarregada; restore é operação distinta de CRUD padrão; dificulta rastreabilidade

### Recomendação

Opção A — restore é operação complementar essencial ao soft-delete e merece feature dedicada para garantir cobertura completa.

### Resolução

> **Decisão:** Opção A — Criada US-MOD-003-F04 dedicada ao restore
> **Decidido por:** arquitetura em 2026-03-17
> **Justificativa:** Restore é operação complementar essencial ao soft-delete; criar feature dedicada garante cobertura Gherkin, domain event e UX completos.
> **Artefato de saída:** US-MOD-003-F04 (restore), FR-004, BR-009, domain event `org.unit_restored`, US-MOD-003-M01, US-MOD-003-F01-M01
> **Implementado em:** 2026-03-17

## ~~PENDENTE-002~~ — ✅ IMPLEMENTADA: Endpoint de Timeline/Histórico (view_history)

- **status:** IMPLEMENTADA
- **severidade:** MÉDIA
- **domínio:** INT
- **tipo:** DEC-TEC
- **origem:** FORGE
- **criado_em:** 2026-03-16
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Consumir diretamente do MOD-000 evita duplicação de endpoint e o frontend já conhece o contrato de domain_events. Sem necessidade de FR adicional no MOD-003.
- **modulo:** MOD-003
- **rastreia_para:** INT-001, UX-001, FR-001
- **tags:** view_history, domain-events, timeline
- **sla_data:** —
- **dependencias:** []

### Questão

A ação `view_history` no UX-ORG-001 consome domain_events filtrados por `entity_type=org_unit`. Esse endpoint pertence ao MOD-000 (Foundation) ou o MOD-003 deve expor um proxy próprio?

### Impacto

Se for MOD-000, não precisamos de endpoint novo. Se for proxy, precisamos de FR adicional e rota no MOD-003.

### Opções

**Opção A — Consumir diretamente do MOD-000:**
Usar `GET /api/v1/domain-events?entity_type=org_unit&entity_id=:id` (MOD-000).

- Prós: Sem duplicação de endpoint; frontend já conhece o contrato; zero código novo no MOD-003
- Contras: Acoplamento do frontend ao endpoint do MOD-000

**Opção B — Criar proxy no MOD-003:**
Criar `GET /api/v1/org-units/:id/history` no MOD-003 como proxy.

- Prós: Encapsulamento; URL semântica por recurso
- Contras: Duplicação de lógica; FR adicional; manutenção extra

### Recomendação

Opção A — consumir do MOD-000 para evitar duplicação. O frontend já conhece o endpoint de domain_events.

### Resolução

> **Decisão:** Opção A — Consumir diretamente `GET /api/v1/domain-events?entity_type=org_unit&entity_id=:id` (MOD-000)
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** MOD-000 já expõe o endpoint genérico de domain events com filtro por entity_type. Criar proxy no MOD-003 seria duplicação sem valor agregado. O frontend já conhece o contrato.
> **Artefato de saída:** INT-001 v0.3.0 (INT-007 — Consumo de Domain Events para Timeline)
> **Implementado em:** 2026-03-18

## ~~PENDENTE-003~~ — ✅ RESOLVIDA: org_units é Cross-Tenant

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **domínio:** ARC
- **tipo:** DEC-TEC
- **origem:** FORGE
- **criado_em:** 2026-03-16
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-17
- **decidido_por:** arquitetura
- **opcao_escolhida:** A
- **justificativa_decisao:** Hierarquia organizacional abrange múltiplos tenants por natureza; isolamento via RBAC é mais adequado que RLS por tenant
- **modulo:** MOD-003
- **rastreia_para:** ADR-003, DATA-001, SEC-001
- **tags:** cross-tenant, rbac, isolamento, org-units
- **sla_data:** —
- **dependencias:** []

### Questão

A tabela `org_units` deve ter coluna `tenant_id` para isolamento via RLS ou deve ser cross-tenant com acesso controlado via RBAC (`@RequireScope`)?

### Impacto

Define o modelo de isolamento de dados para toda a hierarquia organizacional. Decisão errada pode causar vazamento de dados entre tenants ou bloquear funcionalidades cross-tenant legítimas.

### Opções

**Opção A — Cross-tenant por design (RBAC):**
A tabela `org_units` NÃO possui coluna `tenant_id`. Acesso controlado via RBAC (`@RequireScope`). A coluna `tenant_id` em `org_unit_tenant_links` é exclusivamente FK de vínculo funcional (N4→N5).

- Prós: Hierarquia organizacional natural abrange múltiplos tenants; sem duplicação de nós; RBAC granular
- Contras: Requer documentação clara (ADR-003) para evitar confusão; sem RLS automático

**Opção B — Isolamento por tenant_id + RLS:**
Adicionar `tenant_id` em `org_units` com RLS policy padrão.

- Prós: Isolamento automático via RLS; padrão consistente com outras tabelas
- Contras: Hierarquia duplicada por tenant; impossibilita estrutura organizacional compartilhada; contradiz o modelo N4→N5

### Recomendação

Opção A — a hierarquia organizacional é cross-tenant por design. O isolamento via RBAC é mais adequado que RLS para este caso.

### Resolução

> **Decisão:** Opção A — org_units é cross-tenant por design, acesso via RBAC
> **Decidido por:** arquitetura em 2026-03-17
> **Justificativa:** A hierarquia organizacional abrange múltiplos tenants por natureza. A coluna `tenant_id` em `org_unit_tenant_links` é exclusivamente FK de vínculo funcional (N4→N5), não coluna de isolamento. O acesso é controlado via RBAC (`@RequireScope`), não via RLS por tenant.
> **Artefato de saída:** ADR-003, DATA-001, SEC-001 §7 (documentação cross-tenant), comentário SQL na migration
> **Implementado em:** 2026-03-17

## ~~PENDENTE-004~~ — ✅ IMPLEMENTADA: Soft Limit de 500 Nós (Global)

- **status:** IMPLEMENTADA
- **severidade:** MÉDIA
- **domínio:** ARC
- **tipo:** DEC-TEC
- **origem:** FORGE
- **criado_em:** 2026-03-16
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Warning precoce via header permite planejamento sem bloquear operações legítimas. O administrador recebe aviso ao atingir 80% do soft limit, mantendo a operação funcional enquanto sinaliza necessidade de ação.
- **modulo:** MOD-003
- **rastreia_para:** NFR-001, FR-001, BR-001
- **tags:** soft-limit, capacity-planning, warning-header
- **sla_data:** —
- **dependencias:** []

### Questão

NFR-001 define soft limit de 500 nós org_units (total global — tabela cross-tenant). Qual o comportamento ao atingir o limite?

### Impacto

Sem definição, o sistema pode degradar silenciosamente ou bloquear sem mensagem clara.

### Opções

**Opção A — Warning no response header:**
Emitir `X-Limit-Warning` no response header ao criar nó quando `count > 400` (80% do soft limit).

- Prós: Warning precoce permite planejamento; não bloqueia operações legítimas; transparente para integrações via header
- Contras: Requer lógica de contagem no endpoint de criação; header pode ser ignorado por clientes

**Opção B — Hard block com 422:**
Bloquear criação com HTTP 422 ao atingir 500 nós.

- Prós: Previne degradação garantida; comportamento explícito
- Contras: Bloqueia operações legítimas; pode causar incidentes em produção

**Opção C — Apenas métricas/alertas internos:**
Sem impacto no usuário; apenas métricas Prometheus/Grafana e alertas para ops.

- Prós: Zero impacto no fluxo do usuário; monitoramento passivo
- Contras: Administrador não sabe que está perto do limite; reação apenas pós-degradação

### Recomendação

Opção A — warning precoce permite planejamento sem bloquear operações legítimas.

### Resolução

> **Decisão:** Opção A — Warning no response header (`X-Limit-Warning`) ao criar nó quando count > 400 (80%)
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** Warning precoce via header permite planejamento sem bloquear operações legítimas. O administrador recebe aviso ao atingir 80% do soft limit, mantendo a operação funcional enquanto sinaliza necessidade de ação.
> **Artefato de saída:** NFR-001 v0.3.0 (§7.1 Comportamento Soft Limit), FR-001 v0.3.0 (Gherkin + Soft Limit Warning)
> **Implementado em:** 2026-03-18

## ~~PENDENTE-005~~ — ✅ RESOLVIDA: Unicidade global de codigo (BR-008)

- **status:** IMPLEMENTADA
- **severidade:** MÉDIA
- **domínio:** DATA
- **tipo:** DEC-TEC
- **origem:** FORGE
- **criado_em:** 2026-03-16
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-17
- **decidido_por:** arquitetura
- **opcao_escolhida:** A
- **justificativa_decisao:** Catch de constraint violation evita race condition do SELECT+INSERT, simplicidade Nível 1, padrão RFC 9457 já configurado
- **modulo:** MOD-003
- **rastreia_para:** BR-008, FR-001, FR-001-C01
- **tags:** unicidade, constraint-violation, rfc-9457, 409
- **sla_data:** —
- **dependencias:** []

### Questão

BR-008 exige unicidade global do campo `codigo` em `org_units`. Como garantir unicidade sem race condition em cenários de criação concorrente?

### Impacto

Sem tratamento adequado, duas requisições concorrentes com mesmo `codigo` podem ambas passar a validação SELECT e tentar INSERT, resultando em erro não tratado do banco.

### Opções

**Opção A — Catch de constraint violation do PostgreSQL (23505):**
Confiar na UNIQUE constraint do banco e traduzir o erro `23505 — unique_violation` para HTTP 409 (Conflict) com body RFC 9457.

- Prós: Evita race condition do SELECT+INSERT; simplicidade máxima (Nível 1); padrão RFC 9457 já configurado no projeto
- Contras: Erro detectado apenas no INSERT (não preventivo); mensagem de erro requer mapeamento

**Opção B — SELECT+INSERT com lock advisory:**
Verificar unicidade via SELECT com `pg_advisory_lock` antes do INSERT.

- Prós: Feedback preventivo; controle total do erro
- Contras: Complexidade adicional; lock advisory pode causar contenção; race condition residual entre lock e insert

### Recomendação

Opção A — catch de constraint violation é a abordagem mais simples e confiável. RFC 9457 já configurado no projeto garante resposta padronizada.

### Resolução

> **Decisão:** Opção A — Catch de constraint violation (23505) → HTTP 409 RFC 9457
> **Decidido por:** arquitetura em 2026-03-17
> **Justificativa:** Evita race condition do SELECT+INSERT, simplicidade Nível 1, padrão RFC 9457 já configurado no projeto.
> **Artefato de saída:** FR-001-C01 (amendment unicidade), CHANGELOG 0.1.0 → 0.1.1
> **Implementado em:** 2026-03-17

## PENDENTE-006 — Inconsistencia no Filtro de view_history (tenant_id vs RBAC)

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** UX
- **tipo:** CONTRADICAO
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Contradição puramente documental — ADR-003 e SEC-002 são autoritativos, UX-001 deve alinhar com a decisão arquitetural cross-tenant
- **modulo:** MOD-003
- **rastreia_para:** UX-001, ADR-003, SEC-002, DATA-003
- **tags:** view_history, cross-tenant, domain-events
- **sla_data:** ---
- **dependencias:** []

### Questão

Na jornada "Ver Historico do No" em UX-001, o passo 3 diz: `GET /api/v1/domain-events?entity_type=org_unit&entity_id=:id (filtrado por tenant_id)`. Porém, ADR-003 e SEC-002 definem explicitamente que `org_units` é cross-tenant e que domain events com `entity_type=org_unit` são filtrados via RBAC (`org:unit:read`), NÃO por `tenant_id`. A menção a `tenant_id` na jornada UX contradiz a decisão arquitetural.

### Impacto

Se a implementação do frontend seguir o texto de UX-001 e filtrar por `tenant_id`, os domain events de org_units não serão retornados corretamente (pois não há tenant_id na tabela org_units). O endpoint do MOD-000 precisa suportar filtro por RBAC sem tenant_id para este caso.

### Opções

**Opção A — Corrigir texto de UX-001:**
Remover a menção a `(filtrado por tenant_id)` e substituir por `(protegido por org:unit:read)` no passo 3 da jornada "Ver Histórico".

- Prós: Alinha com ADR-003 e SEC-002; correção simples de documentação
- Contras: Nenhum

**Opção B — Manter filtro por tenant_id como fallback:**
Aceitar ambos filtros (tenant_id OU RBAC) no endpoint de domain-events do MOD-000.

- Prós: Flexibilidade para módulos com e sem tenant_id
- Contras: Complexidade no endpoint MOD-000; contradiz ADR-003 que diz explicitamente "não filtrar por tenant_id"

### Recomendação

Opção A — Corrigir o texto de UX-001 para alinhar com ADR-003 e SEC-002. A contradição é puramente documental.

### Resolução

> **Decisao:** Opção A — Corrigir texto de UX-001
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** ADR-003 e SEC-002 são autoritativos — org_units é cross-tenant e domain events são filtrados por RBAC (org:unit:read), não por tenant_id. A contradição é puramente documental.
> **Artefato de saida:** UX-001 v0.2.1 (passo 3 jornada Ver Histórico corrigido)
> **Implementado em:** 2026-03-18

---

## ~~PENDENTE-007~~ — ✅ RESOLVIDA: Erros de lint do codegen (ESLint + Prettier)

- **status:** RESOLVIDA
- **severidade:** MÉDIA
- **domínio:** ARC
- **tipo:** CONTRADIÇÃO
- **origem:** VALIDATE
- **criado_em:** 2026-03-24
- **criado_por:** validate-all
- **decidido_em:** 2026-03-24
- **decidido_por:** validate-all
- **opcao_escolhida:** N/A (auto-resolvida)
- **justificativa_decisao:** Re-validação pós-codegen confirma que `pnpm lint` e `pnpm format:check` retornam 0 erros para arquivos de org-units. Os 12 erros reportados anteriormente foram corrigidos.
- **modulo:** MOD-003
- **rastreia_para:** DOC-PADRAO-002, DOC-ARC-002, PEN-000/PENDENTE-018
- **tags:** lint, eslint, prettier, codegen
- **sla_data:** 2026-04-23
- **dependencias:** []

### Questão

Código gerado pelo codegen não passa em `pnpm lint`. 12 ocorrências de lint neste módulo (web/org-units: 9, api/org-units: 3). Parte do problema cross-module documentado em PEN-000 PENDENTE-018 (55 errors + 91 warnings em 19 módulos). Viola DOC-PADRAO-002 §4.3.

### Impacto

Gate `lint` do DOC-ARC-002 falharia se ativado. Erros incluem `react-hooks/set-state-in-effect` (cascading renders), `no-unused-vars` e formatação Prettier divergente.

### Opções

**Opção A — Correção incremental em 3 fases (alinhada com PEN-000 PENDENTE-018):**

1. `pnpm format` — corrige formatação Prettier automaticamente (0 risco)
2. `pnpm lint:fix` + remoção manual de unused imports/vars — elimina warnings
3. Refatoração dos errors React (extrair lógica de setState para callbacks/reducers)

- Prós: Baixo risco, cada fase é independente e reversível, consistente com decisão já tomada em PEN-000 PENDENTE-018
- Contras: Fase 3 requer entendimento da lógica de cada componente

**Opção B — Relaxar regras temporariamente com `eslint-disable`:**

Adicionar `eslint-disable` nos arquivos afetados e criar backlog de correção.

- Prós: Desbloqueia CI imediatamente
- Contras: Dívida técnica acumulada, esconde problemas reais (cascading renders). Opção C do PEN-000 PENDENTE-018 já foi descartada.

### Recomendação

Opção A — Correção incremental em 3 fases, consistente com a decisão já tomada em PEN-000 PENDENTE-018 (IMPLEMENTADA). As fases 1 e 2 são totalmente automatizáveis. A fase 3 segue padrão repetitivo (extrair setState para callback pattern).

### Resolução

> **Decisão:** Auto-resolvida — lint agora passa com 0 erros para MOD-003
> **Decidido por:** validate-all em 2026-03-24
> **Justificativa:** Re-validação pós-codegen confirma que `pnpm lint` e `pnpm format:check` retornam 0 erros para todos os arquivos em apps/api/src/modules/org-units/ e apps/web/src/modules/org-units/. Os 12 erros reportados anteriormente foram corrigidos durante o codegen iterativo.
> **Artefato de saída:** N/A (erros eliminados)
> **Implementado em:** 2026-03-24

---

## ~~PENDENTE-008~~ — ✅ DECIDIDA: Departamentos Vinculados (Tags no DetailPanel)

- **status:** DECIDIDA
- **severidade:** MEDIA
- **dominio:** UX/DATA
- **tipo:** LACUNA
- **origem:** PENPOT-REVIEW
- **criado_em:** 2026-03-29
- **criado_por:** Marcos Sulivan
- **decidido_em:** 2026-03-30
- **decidido_por:** arquitetura
- **opcao_escolhida:** Entidade independente primeiro (Fase 1 CRUD puro)
- **justificativa_decisao:** Departamentos são criados como entidade independente (flat, por tenant) com CRUD completo. A vinculação com org_units via tabela associativa `org_unit_departments` é adiada para fase posterior.
- **modulo:** MOD-003
- **rastreia_para:** UX-001-M01, 10-org-tree-spec.md, FR-002, DATA-002, BR-002, SEC-001-M01, SEC-002-M01, UX-002
- **tags:** departamentos, tags, detail-panel, crud
- **sla_data:** ---
- **dependencias:** [UX-001-M01]

### Questao

A spec 10-OrgTree define um CardDepartamentos no DetailPanel com tags (Diretoria, Engenharia Civil, etc.) e link "+ Novo Departamento". Esta funcionalidade requer uma entidade/relacao de departamentos vinculados a unidades organizacionais que nao existe no modelo de dados atual.

### Impacto

Sem esta funcionalidade, o CardDepartamentos no DetailPanel tera dados mockados ou ficara oculto. A feature pode ser implementada como modulo separado ou extensao do MOD-003.

### Opcoes

**Opcao A — Entidade independente primeiro (Fase 1):**
CRUD de departamentos como entidade flat por tenant, sem tabela associativa. CardDepartamentos no DetailPanel com estado empty/placeholder até fase posterior.

- Pros: Entidade pronta para uso imediato; CRUD completo; desacoplado de org_units
- Contras: CardDepartamentos no DetailPanel ainda sem dados vinculados

**Opcao B — CRUD + vinculação simultânea:**
Criar departamentos + tabela associativa `org_unit_departments` + endpoints de vinculação.

- Pros: Funcionalidade completa de uma vez
- Contras: Escopo muito grande; atrasa entrega; acoplamento prematuro

### Recomendacao

Opcao A — entidade independente primeiro. CRUD de departamentos é útil por si só e a vinculação pode ser adicionada depois via amendment.

### Resolução

> **Decisão:** Opção A — Entidade independente primeiro (Fase 1 CRUD puro)
> **Decidido por:** arquitetura em 2026-03-30
> **Justificativa:** Departamentos como entidade flat por tenant com CRUD completo. Vinculação com org_units via tabela associativa `org_unit_departments` adiada para fase posterior (MOD-003 v2 ou amendment dedicado).
> **Artefato de saída:** FR-002, DATA-002, BR-002, SEC-001-M01, SEC-002-M01, UX-002, 12-departments-spec.md
> **Implementado em:** 2026-03-30 (especificação normativa completa)

---

## PENDENTE-009 — Metricas no DetailPanel (Colaboradores + Projetos)

- **status:** ABERTA
- **severidade:** BAIXA
- **dominio:** FR/INT
- **tipo:** LACUNA
- **origem:** PENPOT-REVIEW
- **criado_em:** 2026-03-29
- **criado_por:** Marcos Sulivan
- **modulo:** MOD-003
- **rastreia_para:** UX-001-M01, 10-org-tree-spec.md
- **tags:** metricas, colaboradores, projetos, dashboard
- **sla_data:** ---
- **dependencias:** [UX-001-M01, MOD-002, MOD-005]

### Questao

A spec 10-OrgTree define dois MetricCards no DetailPanel: "Colaboradores Totais" (156) e "Projetos em Execucao" (28 com progress bar 70%). Estes dados dependem de modulos ainda nao integrados (MOD-002 gestao usuarios para colaboradores, MOD-005 modelagem processos para projetos).

### Impacto

Sem endpoints de agregacao cross-module, os MetricCards ficam sem dados reais. Podem ser renderizados com dados mockados ou ocultos.

### Recomendacao

Adiar para fase de integracao cross-module. Implementar MetricCards com dados mockados/placeholder no DetailPanel. Criar endpoints de agregacao quando MOD-002 e MOD-005 estiverem integrados.

---

## ~~PENDENTE-010~~ — ✅ IMPLEMENTADA: Toggle Status (Ativo/Inativo) vs Soft Delete

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** BIZ/FR
- **tipo:** DEC-TEC
- **origem:** PENPOT-REVIEW
- **criado_em:** 2026-03-29
- **criado_por:** Marcos Sulivan
- **decidido_em:** 2026-03-31
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** B
- **justificativa_decisao:** Manter soft delete com modal de confirmação preserva o modelo de dados existente (BR-005) e a compatibilidade com restore (BR-009). O toggle visual serve como trigger do fluxo DELETE existente, sem introduzir novo caminho de desativação. Sem mudança no backend.
- **modulo:** MOD-003
- **rastreia_para:** UX-001-M01, UX-001-C03, 11-org-form-spec.md, BR-005
- **tags:** status, toggle, soft-delete, desativacao
- **sla_data:** ---
- **dependencias:** [UX-001-M01]

### Questao

A spec 11-OrgForm-Edit define um Toggle de status (Ativo/Inativo) no formulario de edicao. O modelo atual usa soft delete (DELETE endpoint que seta deleted_at + status=INACTIVE). O toggle implica que status pode ser alterado via PATCH (sem soft delete), o que muda o modelo de negocio.

### Opcoes

**Opcao A — Toggle via PATCH (campo status editavel):**
Permitir `PATCH /org-units/:id { status: "INACTIVE" }` para desativar. Simplifica UX.
- Pros: UX intuitiva; alinhado com design Penpot
- Contras: Muda semantica de desativacao; precisa validar filhos ativos

**Opcao B — Manter soft delete, toggle visual apenas:**
Toggle no form dispara o mesmo fluxo DELETE (com modal de confirmacao). Visual de toggle, semantica de soft delete.
- Pros: Sem mudanca de modelo; compativel com restore existente
- Contras: Toggle que dispara modal pode confundir usuario

**Opcao C — Hibrido:**
Toggle para INACTIVE via PATCH, DELETE reservado para exclusao definitiva futura.
- Pros: Separacao clara entre desativar e excluir
- Contras: Mais complexo; dois caminhos para inativacao

### Recomendacao

Opcao B — manter soft delete com modal de confirmacao. O toggle visual serve como trigger do fluxo existente, sem mudar o modelo de dados.

### Resolução

> **Decisão:** Opção B — Manter soft delete, toggle visual apenas
> **Decidido por:** Marcos Sulivan em 2026-03-31
> **Justificativa:** Preserva o modelo de dados existente (BR-005, BR-009). O toggle visual no DetailPanel/InlineEdit serve como trigger do fluxo DELETE com modal de confirmação, sem introduzir novo endpoint ou semântica de desativação. Zero mudança no backend.
> **Artefato de saída:** UX-001-C03 (amendment: toggle visual → DELETE com modal)
> **Implementado em:** 2026-03-31

---

- **estado_item:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-31
- **rastreia_para:** US-MOD-003, FR-001, FR-002, FR-004, BR-008, BR-009, DATA-001, DATA-002, BR-002, NFR-001, UX-001, UX-002, ADR-003, ADR-004, SEC-002, SEC-001-M01, SEC-002-M01, DATA-003, INT-001, DOC-PADRAO-002, UX-001-M01
- **referencias_exemplos:** EX-CI-007
- **evidencias:** 10 pendentes total: 1 RESOLVIDA (007) + 7 IMPLEMENTADA (001, 002, 003, 004, 005, 006, 010) + 1 DECIDIDA (008) + 1 ABERTA (009).
