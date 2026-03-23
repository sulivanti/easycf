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
>
| 0.4.0  | 2026-03-18 | arquitetura | Q8 DECIDIDA → IMPLEMENTADA — Opção A (DELETE /admin/process-roles/:id adicionado ao INT-005 §1.7) |
| 0.5.0  | 2026-03-18 | Marcos Sulivan | Q9 ABERTA → IMPLEMENTADA — Opção A (ADR-002 status: proposed → accepted) |
| 0.6.0  | 2026-03-18 | Marcos Sulivan | Q7 ABERTA → DECIDIDA — Opção A (adicionar eventos UPDATE/DELETE ao DATA-003) |
| 0.7.0  | 2026-03-18 | arquitetura | Q7 DECIDIDA → IMPLEMENTADA — DATA-003 v0.4.0, SEC-002 v0.4.0, mod.md atualizado |

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

- **estado_item:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-23
- **rastreia_para:** US-MOD-005, INT-005, ADR-001, ADR-002, ADR-003, ADR-004, SEC-005, DATA-003, DATA-005, DOC-FND-000, DOC-ARC-003
- **referencias_exemplos:** N/A
- **evidencias:** N/A
