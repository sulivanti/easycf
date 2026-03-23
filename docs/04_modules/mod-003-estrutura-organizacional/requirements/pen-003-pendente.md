> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.2.0  | 2026-03-17 | AGN-DEV-10  | Enriquecimento Batch 4: PENDENTE-006 (filtro view_history), revisao de pendencias abertas |
> | 0.8.0  | 2026-03-18 | Marcos Sulivan | PENDENTE-004 → IMPLEMENTADA — Opção A (NFR-001 v0.3.0 §7.1, FR-001 v0.3.0) |
>
| 0.7.0  | 2026-03-18 | Marcos Sulivan | PENDENTE-004 → DECIDIDA (Opção A) |
| 0.3.0  | 2026-03-18 | Marcos Sulivan | PENDENTE-006 → DECIDIDA (Opção A) |
> | 0.6.0  | 2026-03-18 | Marcos Sulivan | PENDENTE-002 → IMPLEMENTADA — Opção A (INT-001 v0.3.0, INT-007) |
> | 0.5.0  | 2026-03-18 | Marcos Sulivan | PENDENTE-002 → DECIDIDA (Opção A) |
> | 0.4.0  | 2026-03-18 | Marcos Sulivan | PENDENTE-006 → IMPLEMENTADA — Opção A (UX-001 v0.2.1) |
> | 0.1.0  | 2026-03-16 | arquitetura | Criado por AGN-DEV-10 (enrich) |

# PEN-003 — Pendências e Questões Abertas do MOD-003

---

## ~~PENDENTE-001~~ — ✅ RESOLVIDA: Restore (FR-004) Coberto por US-MOD-003-F04

- **Resolução (2026-03-17):** Opção A adotada — criada US-MOD-003-F04 dedicada ao restore. Endpoint `PATCH /org-units/:id/restore` (FR-004) com Gherkin completo, BR-009, domain event `org.unit_restored`, UX (toggle inativos + menu contextual). Épico US-MOD-003 atualizado via amendment US-MOD-003-M01. F01 atualizada via amendment US-MOD-003-F01-M01.

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

- **Resolução (2026-03-17):** A tabela `org_units` é **cross-tenant por design** e NÃO possui coluna `tenant_id`. A hierarquia organizacional abrange múltiplos tenants por natureza. A coluna `tenant_id` em `org_unit_tenant_links` é exclusivamente FK de vínculo funcional (N4→N5), não coluna de isolamento. O acesso é controlado via RBAC (`@RequireScope`), não via RLS por tenant. Documentado em ADR-003, DATA-001 e SEC-001 §7. Comentário SQL adicionado na migration.

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

- **Resolução (2026-03-17):** Usar catch da constraint violation do PostgreSQL (código `23505 — unique_violation`) e traduzir para HTTP 409 RFC 9457. Justificativa: evita race condition do SELECT+INSERT, simplicidade Nível 1, padrão RFC 9457 já configurado. Documentado em amendment FR-001-C01. CHANGELOG bumped 0.1.0 → 0.1.1.

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

### Questao

Na jornada "Ver Historico do No" em UX-001, o passo 3 diz: `GET /api/v1/domain-events?entity_type=org_unit&entity_id=:id (filtrado por tenant_id)`. Porem, ADR-003 e SEC-002 definem explicitamente que `org_units` e cross-tenant e que domain events com `entity_type=org_unit` sao filtrados via RBAC (`org:unit:read`), NAO por `tenant_id`. A mencao a `tenant_id` na jornada UX contradiz a decisao arquitetural.

### Impacto

Se a implementacao do frontend seguir o texto de UX-001 e filtrar por `tenant_id`, os domain events de org_units nao serao retornados corretamente (pois nao ha tenant_id na tabela org_units). O endpoint do MOD-000 precisa suportar filtro por RBAC sem tenant_id para este caso.

### Opcoes

**Opcao A --- Corrigir texto de UX-001:**
Remover a mencao a `(filtrado por tenant_id)` e substituir por `(protegido por org:unit:read)` no passo 3 da jornada "Ver Historico".

- Pros: Alinha com ADR-003 e SEC-002; correcao simples de documentacao
- Contras: Nenhum

**Opcao B --- Manter filtro por tenant_id como fallback:**
Aceitar ambos filtros (tenant_id OU RBAC) no endpoint de domain-events do MOD-000.

- Pros: Flexibilidade para modulos com e sem tenant_id
- Contras: Complexidade no endpoint MOD-000; contradiz ADR-003 que diz explicitamente "nao filtrar por tenant_id"

### Recomendacao

Opcao A --- Corrigir o texto de UX-001 para alinhar com ADR-003 e SEC-002. A contradição e puramente documental.

### Resolucao (preenchido quando DECIDIDA)

> **Decisao:** Opção A — Corrigir texto de UX-001
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** ADR-003 e SEC-002 são autoritativos — org_units é cross-tenant e domain events são filtrados por RBAC (org:unit:read), não por tenant_id. A contradição é puramente documental.
> **Artefato de saida:** UX-001 v0.2.1 (passo 3 jornada Ver Histórico corrigido)
> **Implementado em:** 2026-03-18

---

- **estado_item:** READY
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-23
- **rastreia_para:** US-MOD-003, FR-001, FR-004, BR-008, BR-009, DATA-001, NFR-001, UX-001, ADR-003, ADR-004, SEC-002, DATA-003, INT-001
- **referencias_exemplos:** EX-CI-007
- **evidencias:** N/A
