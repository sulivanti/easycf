> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-16 | arquitetura | Baseline Inicial (forge-module) |
> | 0.2.0  | 2026-03-17 | AGN-DEV-10  | Enriquecimento PENDENTE (enrich-agent) |
> | 0.3.0  | 2026-03-17 | AGN-DEV-10  | Re-enriquecimento PENDENTE — Q7, Q8, Q9 adicionadas (domain events update/delete, DELETE process_roles, ADR-002 status) |
> | 0.4.0  | 2026-03-18 | arquitetura | Q8 DECIDIDA -> IMPLEMENTADA — Opcao A (DELETE /admin/process-roles/:id) |
> | 0.5.0  | 2026-03-18 | Marcos Sulivan | Q9 ABERTA -> IMPLEMENTADA — Opcao A (ADR-002 status: accepted) |
> | 0.6.0  | 2026-03-18 | Marcos Sulivan | Q7 ABERTA -> DECIDIDA — Opcao A (eventos UPDATE/DELETE) |
> | 0.7.0  | 2026-03-18 | arquitetura | Q7 DECIDIDA -> IMPLEMENTADA — DATA-003 v0.4.0, SEC-002 v0.4.0 |
> | 0.8.0  | 2026-03-23 | validate-all | Batch 5 — PENDENTE-010..014 da validacao codegen |
> | 0.9.0  | 2026-03-24 | validate-all | PENDENTE-015 — erros lint codegen (7 ocorrencias) |
> | 1.0.0  | 2026-03-24 | validate-all | PENDENTE-016 — web deprecateCycle() incompativel (V-E06) |
| 1.1.0  | 2026-03-24 | manage-pendentes | PENDENTE-015 DECIDIDA → Opção A (correção incremental 3 fases) |
| 1.2.0  | 2026-03-24 | manage-pendentes | PENDENTE-015 IMPLEMENTADA — prettier + eslint fix (0 errors MOD-005) |
| 1.3.0  | 2026-03-24 | manage-pendentes | PENDENTE-010 DECIDIDA → Opção A (domain errors → DomainError) |
| 1.4.0  | 2026-03-24 | manage-pendentes | PENDENTE-011 DECIDIDA → Opção A (POST /admin/cycles/:id/deprecate) |
| 1.5.0  | 2026-03-24 | manage-pendentes | PENDENTE-010 IMPLEMENTADA — 4 domain errors → DomainError (type + statusHint 422/503) |
| 1.6.0  | 2026-03-24 | manage-pendentes | PENDENTE-011 IMPLEMENTADA — POST /admin/cycles/:id/deprecate + web client corrigido |
| 1.7.0  | 2026-03-24 | manage-pendentes | PENDENTE-012 DECIDIDA+IMPLEMENTADA — resolvida junto com PENDENTE-010 (statusHint já definido como 422) |
| 1.8.0  | 2026-03-24 | manage-pendentes | PENDENTE-013 DECIDIDA → Opção A (alinhar DTOs Zod com OpenAPI) |
| 1.9.0  | 2026-03-24 | manage-pendentes | PENDENTE-014 DECIDIDA → Opção A (adicionar ação update ao manifest) |
| 2.0.0  | 2026-03-24 | manage-pendentes | PENDENTE-016 IMPLEMENTADA — resolvida por PENDENTE-011 (web client já corrigido) |
| 2.1.0  | 2026-03-24 | manage-pendentes | PENDENTE-013 IMPLEMENTADA — DTOs Zod alinhados com OAS (gates +stage_id/descricao, roles flat) |
| 2.2.0  | 2026-03-24 | manage-pendentes | PENDENTE-014 IMPLEMENTADA — ação update_stage_position adicionada ao manifest ux-proc-001 (amendment) |

# PEN-005 — Questões Abertas da Modelagem de Processos

---

## Questões Resolvidas

### ~~Q1 — Biblioteca de canvas para editor visual (F03)~~

- **Pergunta original:** React Flow confirmado ou há alternativas em avaliação?
- **Resolução:** React Flow selecionado como biblioteca de canvas (US-MOD-005-F03 §6 DoR: "Biblioteca de canvas selecionada (React Flow ou similar)"). Estrutura de componentes detalhada em UX-005 §2.5 e mod.md (structure Web).
- **Resolvido em:** UX-005, mod.md §3 (estrutura)

### ~~Q2 — JSON rule engine para campo `condicao` em transições~~

- **Pergunta original:** Qual engine será adotada?
- **Resolução:** Marcado como "futura" no modelo de dados (DATA-005 §2.7: `condicao text nullable — Expressão de condição — futura JSON rule engine`). Campo existe na tabela mas engine não é necessária para o MVP. Decisão adiada para quando MOD-006 implementar avaliação de condições.
- **Resolvido em:** DATA-005 §2.7, US-MOD-005 §10

### ~~Q3 — Integração com MOD-006 para validação de deleção~~

- **Pergunta original:** API síncrona ou event-driven? Qual endpoint do MOD-006 será consultado?
- **Resolução:** API síncrona. Endpoint: `GET /internal/instances/count-active?stage_id={uuid}`. Timeout 3s, 1 retry. Fail-safe: bloquear deleção com 503 quando MOD-006 indisponível.
- **Resolvido em:** INT-005 §4.1, ADR-002, SEC-005 §10

---

## Questões Abertas Residuais

### ~~Q4 — Amendment MOD-000-F12 para registro de scopes~~

- **Pergunta original:** Os 4 scopes `process:cycle:read/write/publish/delete` devem ser registrados no catálogo canônico de permissões do Foundation (DOC-FND-000 §2).
- **Resolução:** Scopes adicionados diretamente ao DOC-FND-000 §2.2 (v1.0.0 → v1.1.0) com bump de versão e CHANGELOG. Gate CI (DOC-ARC-003B) agora reconhece os 4 scopes.
- **Resolvido em:** DOC-FND-000 v1.1.0 §2.2

### ~~Q5 — Estratégia de is_initial unique (ADR-001)~~

- **Pergunta original:** Trigger BEFORE INSERT/UPDATE vs. campo denormalizado `cycle_id` para garantir is_initial único por ciclo.
- **Resolução:** **Opção B aceita** — campo denormalizado `cycle_id` em `process_stages` com partial unique index nativo `UNIQUE(cycle_id) WHERE is_initial=true AND deleted_at IS NULL`. Trigger mínimo apenas para popular `cycle_id` a partir de `macro_stage_id`. Benefício colateral: simplifica BR-008 (cross-ciclo) e query /flow.
- **Resolvido em:** ADR-001 (status: accepted), DATA-005 §2.3

### ~~Q6 — Contagem de endpoints: 23 vs 25~~

- **Pergunta original:** O épico diz "23 endpoints" mas INT-005 documenta 25.
- **Resolução:** Contagem correta é **25**. Corrigido em: mod.md, INT-005, CHANGELOG. O catálogo de papéis tem 3 endpoints (list/create/update), não 1.
- **Resolvido em:** INT-005 §1, mod.md §3, CHANGELOG v0.1.0

---

## Questoes Abertas (Batch 4)

### ~~Q7 — Domain Events para operacoes de UPDATE e DELETE~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** DATA
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Dogma 6 (DOC-ARC-003) exige domain_events como única fonte de auditoria/timeline. Sem eventos UPDATE/DELETE a auditoria é incompleta por design.
- **modulo:** MOD-005
- **rastreia_para:** DATA-003, SEC-002, DOC-ARC-003
- **tags:** events, auditoria, timeline
- **sla_data:** ---
- **dependencias:** []

#### Questao

O catalogo DATA-003 define apenas eventos de criacao (`_created`, `_linked`). Nao ha eventos para operacoes de UPDATE (ex: `process.cycle_updated`, `process.stage_updated`) nem DELETE (ex: `process.stage_deleted`). A timeline de auditoria fica incompleta sem esses eventos. Esta omissao e intencional (escopo MVP) ou uma lacuna?

#### Impacto

Sem eventos de update/delete, a timeline do ciclo mostra apenas criacoes. Alteracoes de nome, reordenacao de estagios, remocao de gates e soft-deletes nao sao rastreados na tabela `domain_events`. Isso compromete o pilar de auditoria (DOC-ARC-003 Dogma 6: "tabela domain_events e a unica fonte para auditoria/timeline").

#### Opcoes

**Opcao A --- Adicionar eventos de UPDATE e DELETE ao DATA-003:**
Expandir o catalogo com ~9 eventos adicionais (cycle_updated, stage_updated, stage_deleted, gate_updated, gate_deleted, macro_stage_updated, macro_stage_deleted, transition_deleted, role_unlinked).

- Pros: Timeline completa; auditoria plena; consistencia com Dogma 6
- Contras: Mais eventos a emitir; maior volume na tabela domain_events

**Opcao B --- Manter apenas eventos de criacao (MVP):**
Adiar eventos de update/delete para fase posterior.

- Pros: Menos complexidade no MVP; volume menor
- Contras: Timeline incompleta; auditoria parcial; pode violar Dogma 6 da DOC-ARC-003

#### Recomendacao

Opcao A --- completar o catalogo. O Dogma 6 da DOC-ARC-003 e explícito: "tabela domain_events e a unica fonte para auditoria/timeline". Sem eventos de update/delete, a auditoria e incompleta por design.

#### Resolucao (preenchido quando DECIDIDA)

> **Decisao:** Opção A — Adicionar eventos de UPDATE e DELETE ao DATA-003
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** Dogma 6 (DOC-ARC-003): "tabela domain_events é a única fonte para auditoria/timeline". Sem eventos UPDATE/DELETE a auditoria é incompleta por design. Opção B violaria dogma arquitetural.
> **Artefato de saida:** DATA-003 v0.4.0 (10 eventos UPDATE/DELETE), SEC-002 v0.4.0 (matriz atualizada), mod.md (9→19 events)
> **Implementado em:** 2026-03-18

---

### ~~Q8 --- Endpoint DELETE para process_roles ausente~~

- **status:** IMPLEMENTADA
- **severidade:** BAIXA
- **dominio:** INT
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **modulo:** MOD-005
- **rastreia_para:** INT-005, FR-008, DATA-005
- **tags:** api, endpoint, roles
- **sla_data:** ---
- **dependencias:** []

#### Questao

INT-005 §1.7 define 3 endpoints para o catalogo de papeis (list/create/update) mas nenhum DELETE. DATA-005 §2.8 documenta que `process_roles` tem soft delete com RESTRICT (papel com vinculos ativos nao pode ser deletado). FR-008 tambem nao menciona DELETE. Um papel de processo criado erroneamente nao pode ser removido?

#### Impacto

Administradores nao conseguem desativar papeis obsoletos do catalogo global. Sem DELETE, o catalogo so cresce — papeis antigos poluem o autocomplete de vinculacao (UX-005 §3.3 Aba Papeis).

#### Opcoes

**Opcao A --- Adicionar DELETE /admin/process-roles/:id:**
Endpoint de soft delete com validacao: papel com `stage_role_links` ativos retorna 422.

- Pros: Catalogo gerenciavel; consistencia com padrao CRUD
- Contras: +1 endpoint (26 total); validacao de vinculos necessaria

**Opcao B --- Manter sem DELETE (catálogo append-only):**
Papeis obsoletos nao sao removidos, apenas ignorados.

- Pros: Simplicidade; sem risco de remover papel referenciado
- Contras: Catalogo cresce indefinidamente; UX degradada

#### Recomendacao

Opcao A --- adicionar DELETE com protecao de vinculos. O catalogo precisa ser gerenciavel. O padrao de soft delete + RESTRICT ja esta documentado em DATA-005 §2.8.

- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Catálogo precisa ser gerenciável; padrão soft delete + RESTRICT já documentado em DATA-005 §2.8

#### Resolucao (preenchido quando DECIDIDA)

> **Decisao:** Opção A — Adicionar DELETE /admin/process-roles/:id
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** O catálogo de papéis precisa ser gerenciável. O padrão de soft delete + RESTRICT já está documentado em DATA-005 §2.8. Sem DELETE, papéis obsoletos poluem o autocomplete indefinidamente.
> **Artefato de saida:** INT-005 §1.7 endpoint #26, §2.1 erro RESTRICT (role), §5 scope delete
> **Implementado em:** 2026-03-18

---

### ~~Q9 --- ADR-002 permanece com status "proposed"~~

- **status:** IMPLEMENTADA
- **severidade:** BAIXA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-17
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-18
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** A decisão já está consolidada em todos os artefatos dependentes (INT-005 §4.1, SEC-005 §10, NFR-005 §2). Aceitar formalmente corrige a inconsistência de governança.
- **modulo:** MOD-005
- **rastreia_para:** ADR-002, INT-005, SEC-005
- **tags:** adr, governance
- **sla_data:** ---
- **dependencias:** []

#### Questao

A ADR-002 (estrategia fail-safe para integracao MOD-005 -> MOD-006) ainda tem `status: proposed`. Todos os artefatos do modulo (INT-005 §4.1, SEC-005 §10, NFR-005 §2) ja referenciam e implementam a decisao como se fosse aceita. Falta a aceitacao formal.

#### Impacto

Baixo impacto pratico (a decisao ja esta implementada nos artefatos), mas cria inconsistencia de governanca: uma ADR "proposed" que na pratica ja e "accepted".

#### Opcoes

**Opcao A --- Aceitar ADR-002 formalmente:**
Alterar status para `accepted` no arquivo ADR-002.md.

- Pros: Consistencia; governanca correta
- Contras: Nenhum

**Opcao B --- Manter como proposed:**
Aguardar revisao formal do comite.

- Pros: Processo de aprovacao respeitado
- Contras: Inconsistencia com artefatos que ja implementam a decisao

#### Recomendacao

Opcao A --- aceitar formalmente. A decisao ja esta consolidada em todos os artefatos dependentes.

#### Resolucao (preenchido quando DECIDIDA)

> **Decisao:** Opção A — Aceitar ADR-002 formalmente
> **Decidido por:** Marcos Sulivan em 2026-03-18
> **Justificativa:** A decisão já está consolidada em todos os artefatos dependentes (INT-005 §4.1, SEC-005 §10, NFR-005 §2). Manter como "proposed" cria inconsistência de governança.
> **Artefato de saida:** ADR-002.md (status: proposed → accepted)
> **Implementado em:** 2026-03-18

---

## Questoes Abertas (Batch 5 — Validacao Codegen)

### ~~PENDENTE-010 — Domain errors estendem Error em vez de DomainError (BLOQUEANTE)~~

- **status:** IMPLEMENTADA
- **severidade:** BLOQUEANTE
- **dominio:** ARC
- **tipo:** CONTRADIÇÃO
- **origem:** VALIDATE
- **criado_em:** 2026-03-23
- **criado_por:** validate-all (AGN-COD-VAL)
- **decidido_em:** 2026-03-24
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** É o padrão do projeto (DOC-ARC-001). O foundationErrorHandler global só mapeia instanceof DomainError para RFC 9457. Handler específico por módulo (Opção B) duplica lógica e não escala.
- **modulo:** MOD-005
- **rastreia_para:** FR-005, INT-005, DOC-ARC-001
- **tags:** domain-error, error-handling, rfc9457
- **sla_data:** 2026-03-30
- **dependencias:** []

#### Questao

Os 3 domain errors do MOD-005 (`CycleImmutableError`, `CrossCycleTransitionError`, `StageHasInstancesError`) estendem `Error` nativo em vez de `DomainError` da foundation. O `foundationErrorHandler` global mapeia apenas `instanceof DomainError` para RFC 9457 Problem Details com status code correto. Com a heranca atual, todos os domain errors do MOD-005 caem no handler generico e retornam **500 Internal Server Error** em vez dos status codes especificados (422/409/503).

#### Impacto

Todos os cenarios de erro de dominio do modulo (ciclo imutavel, transicao cross-ciclo, estagio com instancias) retornam 500 em vez de respostas RFC 9457. Isso quebra o contrato OpenAPI, impede tratamento de erros no frontend, e viola DOC-ARC-001.

#### Opcoes

**Opcao A — Alterar domain errors para estender DomainError:**
Refatorar os 3 errors para estender `DomainError` (de MOD-000/foundation), implementando `type` (URI) e `statusHint` em vez de `statusCode` numerico.

- Pros: Alinhamento com foundationErrorHandler; RFC 9457 automatico; consistencia com outros modulos
- Contras: Dependencia explícita na classe DomainError da foundation

**Opcao B — Registrar error handler especifico para MOD-005:**
Adicionar um Fastify error handler no plugin do modulo que mapeia os errors antes do handler global.

- Pros: Nao altera classes existentes; isolamento
- Contras: Duplica logica de error handling; diverge do padrao do projeto; nao escala

#### Recomendacao

Opcao A — alterar domain errors para estender DomainError. E o padrao do projeto e garante que o handler global funcione corretamente sem logica duplicada.

#### Acao Sugerida

| Skill | Proposito | Quando executar |
|---|---|---|
| `/codegen-agent mod-005 AGN-COD-CORE` | Regenerar domain errors com heranca correta | Apos decisao |

#### Resolucao (preenchido quando DECIDIDA)

> **Decisao:** Opção A — Alterar domain errors para estender DomainError
> **Decidido por:** Marcos Sulivan em 2026-03-24
> **Justificativa:** Padrão do projeto (DOC-ARC-001). foundationErrorHandler mapeia apenas instanceof DomainError → RFC 9457. Handler específico por módulo duplica lógica e diverge do padrão. Todos os outros módulos usam DomainError.
> **Artefato de saida:** cycle-immutable.error.ts, cross-cycle-transition.error.ts, stage-has-instances.error.ts (4 classes → DomainError com type URI + statusHint 422/503)
> **Implementado em:** 2026-03-24

---

### ~~PENDENTE-011 — FR-004 (Deprecate Cycle) sem rota nem DTO~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** ARC
- **tipo:** LACUNA
- **origem:** VALIDATE
- **criado_em:** 2026-03-23
- **criado_por:** validate-all (AGN-COD-VAL)
- **decidido_em:** 2026-03-24
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Publish e fork já usam endpoint dedicado (POST /cycles/:id/publish, POST /cycles/:id/fork). Deprecate deve seguir o mesmo padrão de ações explícitas. PATCH ambíguo (Opção B) mistura update de dados com mudança de estado.
- **modulo:** MOD-005
- **rastreia_para:** FR-005, INT-005, cycles.route.ts
- **tags:** deprecation, routing, use-case-wiring
- **sla_data:** 2026-04-06
- **dependencias:** []

#### Questao

O `deprecateCycleUseCase` existe em `application/use-cases/` mas nenhuma rota o invoca. O `updateCycleBody` DTO so aceita `nome` e `descricao` — nao inclui campo `status`. FR-004 (Depreciacao de Ciclo) e completamente inalcancavel via API.

#### Impacto

Ciclos publicados nao podem ser depreciados via API. O ciclo de vida DRAFT → PUBLISHED → DEPRECATED fica incompleto. MOD-006 nao pode verificar se um blueprint foi depreciado.

#### Opcoes

**Opcao A — Endpoint dedicado POST /admin/cycles/:id/deprecate:**
Criar rota dedicada (similar a publish e fork) que invoca `deprecateCycleUseCase`.

- Pros: Semantica clara; consistente com publish/fork; operationId dedicado; facil de proteger com scope `process:cycle:write`
- Contras: +1 endpoint (27 total)

**Opcao B — Adicionar campo status ao PATCH /admin/cycles/:id:**
Expandir o DTO de update para aceitar `status: "DEPRECATED"` e despachar para o use-case correto.

- Pros: Menos endpoints; reusa rota existente
- Contras: PATCH fica ambiguo (update dados vs mudanca de estado); logica condicional no handler; contrato OpenAPI mais complexo

#### Recomendacao

Opcao A — endpoint dedicado. Publish e fork ja usam esse padrao. Manter consistencia no tratamento de transicoes de estado como acoes explicitas, nao como side-effects de PATCH.

#### Resolucao (preenchido quando DECIDIDA)

> **Decisao:** Opção A — Endpoint dedicado POST /admin/cycles/:id/deprecate
> **Decidido por:** Marcos Sulivan em 2026-03-24
> **Justificativa:** Consistência com publish/fork. Transições de estado devem ser ações explícitas, não side-effects de PATCH. Opção B tornaria PATCH ambíguo e adicionaria lógica condicional no handler.
> **Artefato de saida:** cycles.route.ts (POST /cycles/:id/deprecate, operationId admin_cycles_deprecate), process-modeling.api.ts (web client → POST)
> **Implementado em:** 2026-03-24

---

### ~~PENDENTE-012 — Status codes incorretos em domain errors (409 vs spec 422)~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** ARC
- **tipo:** CONTRADIÇÃO
- **origem:** VALIDATE
- **criado_em:** 2026-03-23
- **criado_por:** validate-all (AGN-COD-VAL)
- **decidido_em:** 2026-03-24
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Resolvida junto com PENDENTE-010. Ao refatorar domain errors para DomainError, statusHint foi definido como 422 (conforme spec e Gherkin). Código agora alinhado com contrato OpenAPI.
- **modulo:** MOD-005
- **rastreia_para:** FR-005, BR-005
- **tags:** status-code, error-handling, gherkin
- **sla_data:** 2026-04-06
- **dependencias:** [PENDENTE-010]

#### Questao

`CycleImmutableError` e `StageHasInstancesError` usam `statusCode = 409` (Conflict). Porem os cenarios Gherkin em FR-005 especificam `422` (Unprocessable Entity) para essas situacoes. O contrato OpenAPI tambem declara respostas 422 para esses casos.

#### Impacto

Mesmo apos corrigir PENDENTE-010 (heranca DomainError), os status codes retornados serao 409 em vez dos 422 documentados no contrato e nos cenarios de aceitacao. Frontend e testes de integracao falharao ao esperar 422.

#### Opcoes

**Opcao A — Alinhar errors com spec (422):**
Alterar `statusHint` dos domain errors para 422 conforme Gherkin e contrato OpenAPI.

- Pros: Consistencia spec↔codigo; testes de aceitacao passam; frontend recebe o esperado
- Contras: Nenhum significativo

**Opcao B — Alterar spec para 409:**
Atualizar Gherkin e OpenAPI para usar 409.

- Pros: 409 (Conflict) e semanticamente mais preciso para "ciclo imutavel"
- Contras: Requer amendment na spec READY; diverge do padrao adotado nos outros modulos

#### Recomendacao

Opcao A — alinhar codigo com spec. A spec e READY e foi validada. O codigo deve conformar ao contrato, nao o contrario. 422 e o padrao adotado no projeto para violacoes de regra de negocio.

#### Resolucao (preenchido quando DECIDIDA)

> **Decisao:** Opção A — Alinhar errors com spec (422)
> **Decidido por:** Marcos Sulivan em 2026-03-24
> **Justificativa:** Resolvida junto com PENDENTE-010. Ao refatorar para DomainError, statusHint já foi definido como 422. Código alinhado com contrato OpenAPI e Gherkin.
> **Artefato de saida:** cycle-immutable.error.ts (409→422), stage-has-instances.error.ts (409→422) — mesmos arquivos de PENDENTE-010
> **Implementado em:** 2026-03-24

---

### ~~PENDENTE-013 — StageDetailResponse e FlowResponse: mismatch DTO Zod vs OpenAPI~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** ARC
- **tipo:** CONTRADIÇÃO
- **origem:** VALIDATE
- **criado_em:** 2026-03-23
- **criado_por:** validate-all (AGN-COD-VAL)
- **decidido_em:** 2026-03-24
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** OAS é fonte de verdade (DOC-ARC-001). DTOs Zod devem conformar ao contrato OpenAPI. Dados adicionais devem ser expandidos explicitamente no OAS.
- **modulo:** MOD-005
- **rastreia_para:** INT-005, FR-005
- **tags:** dto, openapi, response-schema, zod
- **sla_data:** 2026-04-06
- **dependencias:** []

#### Questao

O DTO Zod `stageDetailResponse` difere estruturalmente do schema OpenAPI `StageDetailResponse`: (1) gates no DTO omitem `stage_id` e `descricao` que existem no OAS `GateResponse`; (2) roles no DTO usam objeto nested `role: { codigo, nome, can_approve }` enquanto o OAS usa shape flat `StageRoleLinkResponse` com `id, stage_id, role_id, required, max_assignees`. O mesmo mismatch se repete no `FlowResponse` para role items.

#### Impacto

O frontend que consome a API recebera payloads que nao conformam ao contrato OpenAPI documentado. Geradores de client SDK (openapi-typescript, orval) produzirao types que nao correspondem aos dados reais. Testes de contrato falharao.

#### Opcoes

**Opcao A — Alinhar DTOs Zod com OpenAPI (OAS e fonte de verdade):**
Atualizar os schemas Zod para corresponder exatamente aos response schemas do OpenAPI v1.yaml.

- Pros: Contrato e fonte de verdade (DOC-ARC-001); geradores de client funcionam; single source of truth
- Contras: DTO perde informacoes de conveniencia (nested role data)

**Opcao B — Alinhar OpenAPI com DTOs (DTO e fonte de verdade):**
Atualizar os response schemas no OpenAPI para refletir a estrutura nested dos DTOs.

- Pros: Frontend recebe dados mais ricos (role info junto com link); menos chamadas
- Contras: OpenAPI fica mais complexo; diverge do padrao RESTful flat responses

#### Recomendacao

Opcao A — OAS e fonte de verdade (DOC-ARC-001). DTOs Zod devem conformar ao contrato. Se dados adicionais sao necessarios, expandir o OAS explicitamente com campos documentados.

#### Resolucao (preenchido quando DECIDIDA)

> **Decisao:** Opção A — Alinhar DTOs Zod com OpenAPI (OAS é fonte de verdade)
> **Decidido por:** Marcos Sulivan em 2026-03-24
> **Justificativa:** OAS é fonte de verdade (DOC-ARC-001). DTOs Zod devem conformar ao contrato OpenAPI. Dados adicionais devem ser expandidos explicitamente no OAS. Geradores de client SDK e testes de contrato dependem dessa consistência.
> **Artefato de saida:** process-modeling.dto.ts, flow-graph.service.ts, process-modeling.types.ts, StageConfigPanel.tsx
> **Implementado em:** 2026-03-24

---

### ~~PENDENTE-014 — ux-proc-001 missing action update (mover estagio no canvas)~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** UX
- **tipo:** LACUNA
- **origem:** VALIDATE
- **criado_em:** 2026-03-23
- **criado_por:** validate-all (AGN-COD-VAL)
- **decidido_em:** 2026-03-24
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Manifests devem mapear todas as interações que resultam em chamadas API (DOC-UX-001). canvas_x/canvas_y são campos persistidos no banco (DATA-005). OperationId admin_stages_update já existe no OAS e deve ser referenciado pelo manifest.
- **modulo:** MOD-005
- **rastreia_para:** UX-005, US-MOD-005-F03, ux-proc-001.editor-visual.yaml
- **tags:** manifest, canvas, drag-drop, stage-position
- **sla_data:** 2026-04-06
- **dependencias:** []

#### Questao

O manifest `ux-proc-001.editor-visual.yaml` nao inclui a acao `update` para mover estagios no canvas (PATCH /admin/stages/:id com canvas_x/canvas_y). UX-005 §2.3 define essa acao e US-MOD-005-F03 lista `admin_stages_update` como operationId consumido. O operationId esta orfao — nenhuma acao do manifest o referencia.

#### Impacto

A posicao dos nos no canvas nao e persistida via a acao documentada no manifest. O editor visual perde a capacidade de salvar layout dos estagios. Tooling que gera codigo a partir de manifests nao incluira o handler de reposicionamento.

#### Opcoes

**Opcao A — Adicionar acao update ao manifest:**
Incluir acao `update_stage_position` (ou `update`) no manifest com operationId `admin_stages_update`, PATCH method, endpoint `/api/v1/admin/stages/:sid`.

- Pros: Manifest completo; operationId mapeado; geracao de codigo correto
- Contras: Modulo READY — requer amendment no manifest

**Opcao B — Documentar como acao implicita do canvas:**
Manter o manifest sem a acao explicita, documentando que a persistencia de posicao e gerenciada internamente pelo componente React Flow.

- Pros: Manifest mais simples; menos acoes
- Contras: OperationId orfao; contrato incompleto; diverge do padrao de mapeamento explicito

#### Recomendacao

Opcao A — adicionar acao explicita. Manifests devem mapear todas as interacoes que resultam em chamadas API (DOC-UX-001). A posicao do estagio e um campo persistido no banco (canvas_x, canvas_y em DATA-005).

#### Resolucao (preenchido quando DECIDIDA)

> **Decisao:** Opção A — Adicionar ação update ao manifest ux-proc-001
> **Decidido por:** Marcos Sulivan em 2026-03-24
> **Justificativa:** Manifests devem mapear todas as interações API (DOC-UX-001). canvas_x/canvas_y são persistidos (DATA-005). OperationId admin_stages_update já existe no OAS — deve estar mapeado no manifest. Módulo READY — implementação via amendment.
> **Artefato de saida:** AMD-UX-PROC-001-001 (amendments/ux/), ux-proc-001.editor-visual.yaml v1.1.0
> **Implementado em:** 2026-03-24

---

## ~~PENDENTE-015 — Erros de lint do codegen (ESLint + Prettier)~~

- **status:** IMPLEMENTADA
- **severidade:** MÉDIA
- **domínio:** ARC
- **tipo:** CONTRADIÇÃO
- **origem:** VALIDATE
- **criado_em:** 2026-03-24
- **criado_por:** validate-all
- **decidido_em:** 2026-03-24
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Correção incremental em 3 fases (format → lint:fix → refactor) é consistente com PEN-000 PENDENTE-018 já implementada. Opção B (eslint-disable) foi descartada no PEN-000.
- **modulo:** MOD-005
- **rastreia_para:** DOC-PADRAO-002, DOC-ARC-002, PEN-000/PENDENTE-018
- **tags:** lint, eslint, prettier, codegen
- **sla_data:** 2026-04-23
- **dependencias:** []

### Questão

Código gerado pelo codegen não passa em `pnpm lint`. 7 ocorrências de lint neste módulo (web/process-modeling: 7). Parte do problema cross-module documentado em PEN-000 PENDENTE-018 (55 errors + 91 warnings em 19 módulos). Viola DOC-PADRAO-002 §4.3.

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

### Resolução (preenchido quando DECIDIDA)

> **Decisão:** Opção A — Correção incremental em 3 fases (format → lint:fix → refactor)
> **Decidido por:** Marcos Sulivan em 2026-03-24
> **Justificativa:** Abordagem de baixo risco, cada fase independente e reversível. Consistente com decisão já tomada em PEN-000 PENDENTE-018. Opção B (eslint-disable) descartada por acumular dívida técnica.
> **Artefato de saída:** cycles.route.ts (Record<string,unknown> em vez de any), process-roles.route.ts (idem), 3 arquivos reformatados por Prettier (cycles.route.ts, process-roles.route.ts, stages.route.ts)
> **Implementado em:** 2026-03-24

---

## ~~PENDENTE-016 — Web API deprecateCycle() incompativel com backend~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** ARC
- **tipo:** CONTRADIÇÃO
- **origem:** VALIDATE
- **criado_em:** 2026-03-24
- **criado_por:** validate-all
- **decidido_em:** 2026-03-24
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Resolvida automaticamente pela implementação de PENDENTE-011 (POST /admin/cycles/:id/deprecate + web client corrigido para httpClient.post).
- **modulo:** MOD-005
- **rastreia_para:** FR-004, INT-005, cycles.route.ts, process-modeling.api.ts
- **tags:** web, api-client, deprecation, endpoint-mismatch
- **sla_data:** 2026-04-07
- **dependencias:** [PENDENTE-011]

### Questao

A funcao `deprecateCycle()` no web API client (`apps/web/src/modules/process-modeling/api/process-modeling.api.ts`) chama `httpClient.patch('/admin/cycles/${id}', { status: 'DEPRECATED' })`. Porem o backend `updateCycleBody` DTO Zod so aceita `nome` e `descricao` — nao inclui campo `status`. A deprecacao e **quebrada end-to-end**: o frontend envia um payload que o backend ignora silenciosamente (status field e stripped pela validacao Zod).

### Impacto

O botao "Deprecar" no FlowEditorPage dispara uma mutation que aparentemente sucede (PATCH retorna 200 com dados inalterados) mas o ciclo permanece PUBLISHED. O usuario recebe feedback falso de sucesso. Relacionado com PENDENTE-011 (deprecate sem rota dedicada).

### Opcoes

**Opcao A — Criar endpoint dedicado POST /admin/cycles/:id/deprecate e atualizar web client:**
Criar rota no backend (consistente com publish/fork) e alterar web client para `httpClient.post('/admin/cycles/${id}/deprecate', {})`.

- Pros: Consistencia com publish/fork; semantica clara; resolve PENDENTE-011 simultaneamente
- Contras: +1 endpoint

**Opcao B — Adicionar campo status ao PATCH DTO:**
Expandir `updateCycleBody` Zod para aceitar `status: 'DEPRECATED'`.

- Pros: Menos endpoints; web client ja funciona
- Contras: PATCH ambiguo; logica condicional no handler

### Recomendacao

Opcao A — resolver junto com PENDENTE-011 criando endpoint dedicado. Manter consistencia do padrao publish/fork/deprecate como acoes explicitas.

### Resolucao (preenchido quando DECIDIDA)

> **Decisao:** Opção A — Endpoint dedicado POST /admin/cycles/:id/deprecate + web client corrigido
> **Decidido por:** Marcos Sulivan em 2026-03-24
> **Justificativa:** Resolvida automaticamente pela implementação de PENDENTE-011. Web client já usa httpClient.post('/admin/cycles/${id}/deprecate', {}). Endpoint dedicado mantém consistência com publish/fork.
> **Artefato de saida:** cycles.route.ts (POST /admin/cycles/:id/deprecate), process-modeling.api.ts (httpClient.post)
> **Implementado em:** 2026-03-24

---

- **estado_item:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-24
- **rastreia_para:** US-MOD-005, INT-005, ADR-001, ADR-002, ADR-003, ADR-004, SEC-005, DATA-003, DATA-005, DOC-FND-000, DOC-ARC-003, DOC-PADRAO-002
- **referencias_exemplos:** N/A
- **evidencias:** PENDENTE-010..016 (1 bloqueante, 4 alta, 1 media implementada)
