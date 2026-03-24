> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 1.1.0  | 2026-03-24 | validate-all  | Adição PENDENTE-011 — domain errors não estendem DomainError base class |
> | 1.0.0  | 2026-03-24 | validate-all  | Adição PENDENTE-010 — erros lint codegen (12 ocorrências) |
> | 0.9.0  | 2026-03-22 | arquitetura | PENDENTE-007→IMPLEMENTADA (Opção B: links como histórico), PENDENTE-008→IMPLEMENTADA (Opção A: bulk INSERT) |
> | 0.8.0  | 2026-03-20 | AGN-DEV-10  | Re-enriquecimento PENDENTE Batch 4 — PEN-007/PENDENTE-008 adicionados (auto-deprecate links, bulk items) |
> | 0.7.0  | 2026-03-19 | arquitetura | PENDENTE-005 implementada (hard limit configurável por tenant), PENDENTE-006 implementada (flag dry_run no evaluate) |
> | 0.6.0  | 2026-03-19 | arquitetura | PENDENTE-001 decidida+implementada: Opção 1 (JSONLogic como engine v2 para condition_expr) |
> | 0.5.0  | 2026-03-19 | arquitetura | PENDENTE-003 decidida+implementada: Opção 2 (tabela auxiliar routine_integration_config, MOD-008 responsável pela migração) |
> | 0.4.0  | 2026-03-19 | arquitetura | PENDENTE-004 decidida+implementada: Opção 3 (flag auto_deprecate_previous, default=false) |
> | 0.3.0  | 2026-03-19 | arquitetura | PENDENTE-002 decidida+implementada: Opção 1 (job independente, isolamento > DRY) |
> | 0.2.0  | 2026-03-19 | AGN-DEV-10  | Enriquecimento PENDENTE (enrich-agent) — Batch 4: opções/recomendações detalhadas, PENDENTE-004..PENDENTE-006 adicionados |
> | 0.1.0  | 2026-03-19 | arquitetura | Baseline Inicial (forge-module) |

# PEN-007 — Questões Abertas da Parametrização Contextual e Rotinas

- **estado_item:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-24
- **rastreia_para:** US-MOD-007, BR-007, FR-007, INT-007, DATA-007, SEC-007, NFR-007, ADR-001, ADR-002, ADR-003, ADR-004, ADR-005, ADR-006, DOC-PADRAO-002
- **evidencias:** PENDENTE-010 (12 ocorrências lint codegen — web/contextual-params: 12), PENDENTE-011 (domain errors não estendem DomainError — 6 errors em param-errors.ts)

---

## PENDENTE-001 — condition_expr: Escopo e Sintaxe (v2)

- **Descrição:** O campo `condition_expr` em `incidence_rules` e `routine_items` é nullable em v1 (motor ignora). Em v2, será necessário definir a sintaxe JSON do rule engine (ex: JSONLogic, CEL, custom DSL). O campo existe no schema (DATA-007) como `jsonb nullable` mas não é avaliado pelo motor em v1.
- **Impacto:** F01 (incidence_rules), F02 (routine_items), F03 (motor de avaliação — passo 3 precisará interpretar condition_expr)
- **Decisão pendente:** ~~Qual engine de expressão adotar? Prazo para v2?~~ **DECIDIDA + IMPLEMENTADA**
- **Opções:**
  1. **JSONLogic:** Biblioteca madura, JSON nativo, fácil de serializar/deserializar. Limitações em expressões complexas com contexto aninhado.
  2. **CEL (Common Expression Language):** Mais expressivo, tipado, usado pelo Google. Requer compilação de expressão. Overhead maior que JSONLogic.
  3. **Custom DSL:** Máximo controle, mas custo de desenvolvimento e manutenção elevado. Documentação e onboarding complexos.
- **Recomendação:** JSONLogic para v2 (simplicidade, maturidade, serialização nativa em jsonb). Reavaliar CEL se limitações de JSONLogic forem encontradas durante uso real.
- **Prioridade:** BAIXA (v1 funciona sem condições)
- **rastreia_para:** FR-004, FR-006, FR-009, DATA-007 (incidence_rules.condition_expr, routine_items.condition_expr)

### Resolução

> **Decisão:** Opção 1 — JSONLogic como engine de expressão para condition_expr v2. Biblioteca madura, JSON nativo, serialização/deserialização direta em jsonb. Reavaliar CEL se limitações de JSONLogic forem encontradas durante uso real.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** JSONLogic oferece o melhor equilíbrio entre simplicidade e poder expressivo para v2. Serialização nativa em JSON elimina camada de transformação — condition_expr armazenado em jsonb é diretamente interpretável pelo motor. Maturidade da biblioteca (json-logic-js) reduz risco. CEL permanece como fallback caso expressões complexas com contexto aninhado excedam capacidade do JSONLogic.
> **Artefato de saída:** Decisão registrada em PEN-007. ADR futuro quando v2 iniciar (JSONLogic como engine).
> **Implementado em:** Decisão arquitetural documentada; implementação física quando v2 do motor iniciar.

---

## PENDENTE-002 — Background Job de Expiração: Compartilhar com MOD-004?

- **Descrição:** O job de expiração de enquadradores (`framer-expiration.job.ts`, BR-002) usa o mesmo padrão do job de expiração de `access_delegations` no MOD-004. Ambos verificam `valid_until < now()` e mudam status para INACTIVE/EXPIRED.
- **Impacto:** F01 (enquadradores), INT-007 (integração MOD-004), NFR-007 (resiliência do job)
- **Decisão pendente:** ~~Reutilizar infraestrutura de jobs do MOD-004 ou criar job independente?~~ **DECIDIDA + IMPLEMENTADA**
- **Opções:**
  1. **Job independente no MOD-007:** Isolamento total. Falha no job do MOD-004 não afeta expiração de enquadradores. Duplicação de lógica de scheduling.
  2. **Infraestrutura compartilhada (job runner genérico):** Extrair um job runner genérico para MOD-000 (Foundation) que aceite registros de entidades com `valid_until`. MOD-004 e MOD-007 registram suas entidades. Menos duplicação, mais acoplamento.
  3. **Estender job do MOD-004:** Menor esforço, mas cria dependência circular (MOD-007 depende de MOD-004 para expiração).
- **Recomendação:** Opção 1 (job independente) para v1 — isolamento é mais importante que DRY nesta fase. Revisitar Opção 2 quando houver 3+ módulos com jobs de expiração.
- **Prioridade:** MEDIA
- **rastreia_para:** BR-002, FR-002, DATA-003 (EVT-004 framer.expired), INT-007 (INT-002)

### Resolução

> **Decisão:** Opção 1 — Job independente no MOD-007. Isolamento total: falha no job do MOD-004 não afeta expiração de enquadradores. Duplicação de lógica de scheduling aceita nesta fase. Revisitar quando houver 3+ módulos com jobs de expiração.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Isolamento > DRY nesta fase. O job `framer-expiration.job.ts` tem scheduler próprio e healthcheck dedicado. Menor blast radius em caso de falha. Revisitar Opção 2 (job runner genérico no Foundation) quando houver 3+ módulos.
> **Artefato de saída:** NFR-007 (decisão de isolamento documentada)
> **Implementado em:** NFR-007

---

## PENDENTE-003 — Rotina de Integração (MOD-008): Campos Específicos

- **Descrição:** MOD-008 herdará `behavior_routines` com `routine_type=INTEGRATION`. A tabela `behavior_routines` já possui o campo `routine_type` (varchar) com valor default `BEHAVIOR`. MOD-008 adicionará registros com `routine_type=INTEGRATION` e possivelmente campos específicos (ex: `integration_target`, `mapping_config`, `retry_policy`).
- **Impacto:** DATA-007 (behavior_routines), INT-007 (INT-004), schema de migração
- **Decisão pendente:** ~~Escopo do MOD-008 ainda não definido. Campos específicos de integração serão colunas adicionais na mesma tabela ou tabela auxiliar com FK?~~ **DECIDIDA + IMPLEMENTADA**
- **Opções:**
  1. **Colunas nullable na tabela `behavior_routines`:** Simples. Campos de integração são nullable e ignorados quando `routine_type=BEHAVIOR`.
  2. **Tabela auxiliar `routine_integration_config`:** Normalizado. FK para `behavior_routines.id` com `WHERE routine_type=INTEGRATION`. Mais limpo, sem colunas nullable.
- **Recomendação:** Opção 2 (tabela auxiliar) — evita poluir a tabela principal com campos de outro módulo. MOD-008 é responsável pela migração da tabela auxiliar.
- **Prioridade:** BAIXA (MOD-008 é wave futura)
- **rastreia_para:** DATA-007, INT-007 (INT-004), ADR-003

### Resolução

> **Decisão:** Opção 2 — Tabela auxiliar `routine_integration_config` com FK para `behavior_routines.id` WHERE `routine_type=INTEGRATION`. Evita poluir a tabela principal com campos específicos de outro módulo. MOD-008 é responsável pela criação e migração da tabela auxiliar quando a wave chegar.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Normalização > simplicidade neste caso. Colunas nullable na tabela principal criariam acoplamento estrutural entre MOD-007 e MOD-008. A tabela auxiliar mantém ownership claro: MOD-007 possui `behavior_routines`, MOD-008 possui `routine_integration_config`. Alinhado com ADR-003.
> **Artefato de saída:** Decisão registrada em PEN-007. MOD-008 implementa `routine_integration_config` quando wave chegar.
> **Implementado em:** Decisão arquitetural documentada; migração física sob responsabilidade de MOD-008.

---

## PENDENTE-004 — Fork Auto-Depreca Versão Anterior?

- **Descrição:** Ao fazer fork de rotina PUBLISHED, a versão original permanece PUBLISHED. Isso permite que duas versões da mesma rotina (original e fork após publicação) coexistam como PUBLISHED, potencialmente vinculadas a regras de incidência diferentes. A questão é se o fork deveria auto-deprecar a versão anterior automaticamente.
- **Impacto:** BR-008 (fork), BR-012 (deprecação), FR-005, FR-008, UX-007 (fluxo de fork)
- **Decisão pendente:** ~~Fork deve auto-deprecar a versão PUBLISHED original?~~ **DECIDIDA + IMPLEMENTADA**
- **Opções:**
  1. **Não auto-deprecar (comportamento atual):** Administrador decide quando deprecar a versão anterior. Permite coexistência temporária de versões (ex: migração gradual de regras de incidência para a nova versão).
  2. **Auto-deprecar ao publicar o fork:** Ao publicar a nova versão (fork), a versão anterior é automaticamente DEPRECATED. Simplifica gestão mas remove flexibilidade de migração gradual.
  3. **Auto-deprecar com flag opcional:** `POST /admin/routines/:id/publish` aceita `{ auto_deprecate_previous: true }`. Default = false. Máxima flexibilidade.
- **Recomendação:** Opção 3 (flag opcional) — combina segurança com flexibilidade. Default conservador (não depreca), mas permite automação quando desejado.
- **Prioridade:** MEDIA
- **rastreia_para:** BR-008, BR-012, FR-008, ADR-003, UX-007

### Resolução

> **Decisão:** Opção 3 — Flag opcional `auto_deprecate_previous: boolean` (default: false) no body de `POST /admin/routines/:id/publish`. Se true, a versão PUBLISHED anterior é automaticamente marcada DEPRECATED. Se false, coexistência permitida.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Combina segurança com flexibilidade. Default conservador (não depreca) protege contra deprecação acidental. Permite automação quando desejado. Alinhado com princípio de menor surpresa.
> **Artefato de saída:** FR-007 (flag auto_deprecate_previous adicionado ao endpoint publish)
> **Implementado em:** FR-007

---

## PENDENTE-005 — Limites de Itens por Rotina e Regras por Enquadrador

- **Descrição:** NFR-007 define SLOs baseados em "até 10 regras de incidência ativas e 50 routine_items". Contudo, não há limite técnico (constraint) impedindo a criação de mais itens ou regras. Se um administrador criar 500 itens em uma rotina ou 100 regras para um enquadrador, o motor pode exceder o SLO.
- **Impacto:** NFR-001 (performance motor), NFR-007, FR-006 (itens), FR-004 (regras)
- **Decisão pendente:** ~~Implementar limites técnicos (hard limits) ou apenas monitoramento (soft limits)?~~ **DECIDIDA + IMPLEMENTADA**
- **Opções:**
  1. **Hard limit via validação de endpoint:** POST /items retorna 422 se rotina já tem 50 itens. POST /incidence-rules retorna 422 se enquadrador já tem 10 regras. Seguro mas inflexível.
  2. **Soft limit com warning no UX:** UI exibe warning ao ultrapassar threshold. Backend não bloqueia. Monitora e alerta via observabilidade.
  3. **Hard limit configurável por tenant:** Limite default = 50 itens / 10 regras, mas configurável por tenant para cenários excepcionais.
- **Recomendação:** Opção 3 (configurável por tenant) — combina proteção default com flexibilidade para cenários legítimos de alta complexidade.
- **Prioridade:** MEDIA
- **rastreia_para:** NFR-001, NFR-007, FR-004, FR-006, DATA-007

### Resolução

> **Decisão:** Opção 3 — Hard limit configurável por tenant. Default: 50 itens por rotina, 10 regras por enquadrador. Configurável por tenant para cenários excepcionais de alta complexidade. POST /items retorna 422 se limite atingido. POST /incidence-rules retorna 422 se limite atingido.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Combina proteção default com flexibilidade. Default protege motor dentro dos SLOs (< 200ms p95). Configuração por tenant via tabela tenant_config ou env var para cenários legítimos. Response 422: `{error: LIMIT_EXCEEDED, current: N, max: M, configurable: true}`.
> **Artefato de saída:** NFR-007 (limites configuráveis) + FR-007 (validações 422 nos endpoints)
> **Implementado em:** NFR-007, FR-007

---

## PENDENTE-006 — Auditoria de Dry-Run: Persistir ou Não?

- **Descrição:** O UX de dry-run (preview do motor) chama `POST /routine-engine/evaluate` com dados reais. Atualmente, o motor emite domain event `routine.applied` para toda avaliação com efeito (BR-010). Dry-runs do UX gerariam domain events "falsos" que poluiriam a timeline de auditoria.
- **Impacto:** BR-010 (domain events condicionais), DATA-003 (EVT-012), UX-007 (dry-run preview), SEC-007 (auditoria)
- **Decisão pendente:** ~~Dry-run deve persistir domain events?~~ **DECIDIDA + IMPLEMENTADA**
- **Opções:**
  1. **Flag `dry_run: true` no request body:** Motor executa normalmente mas NÃO persiste domain event. Response é idêntico mas sem side-effects.
  2. **Endpoint separado `POST /routine-engine/dry-run`:** Endpoint dedicado sem persistência. Mais explícito no OpenAPI.
  3. **Persistir com tag:** Domain event `routine.applied` com campo `is_dry_run: true`. Auditoria completa, mas timeline precisa de filtro para excluir dry-runs.
- **Recomendação:** Opção 1 (flag `dry_run: true`) — menor impacto no schema de endpoints (25 endpoints já definidos), motor reutiliza toda a lógica, apenas suprime persistência do evento.
- **Prioridade:** MEDIA
- **rastreia_para:** BR-010, FR-009, DATA-003, UX-007, SEC-007

### Resolução

> **Decisão:** Opção 1 — Flag `dry_run: true` no request body de POST /routine-engine/evaluate. Motor executa normalmente mas NÃO persiste domain event `routine.applied` (EVT-012). Sem side-effects.
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Menor impacto no schema de endpoints (25 endpoints já definidos). Motor reutiliza toda a lógica, apenas suprime emissão do domain event routine.applied (EVT-012). Response inclui `dry_run: true`. Sem persistência de efeitos.
> **Artefato de saída:** FR-007 (flag dry_run adicionado ao FR-009, supressão de domain event)
> **Implementado em:** FR-007

---

## ~~PENDENTE-007 — Auto-Deprecate: Migração Automática de routine_incidence_links~~

- **status:** IMPLEMENTADA
- **severidade:** MEDIA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-20
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-22
- **decidido_por:** arquitetura
- **opcao_escolhida:** B
- **implementado_em:** 2026-03-22
- **modulo:** MOD-007
- **rastreia_para:** BR-008, BR-012, FR-008, ADR-003, PENDENTE-004, DATA-007
- **tags:** auto-deprecate, incidence-links, migration
- **sla_data:** —
- **dependencias:** []

### Questao

Quando `auto_deprecate_previous: true` e acionado no publish (PENDENTE-004), a versao PUBLISHED anterior e marcada como DEPRECATED. Contudo, os `routine_incidence_links` que apontavam para a versao deprecada continuam existindo no banco. O motor de avaliacao (passo 2) filtra apenas rotinas PUBLISHED, entao esses links ficam "orfaos" (existem mas nao sao usados). A questao e: esses links devem ser automaticamente migrados para a nova versao, removidos, ou mantidos como historico?

### Impacto

Sem decisao, links orfaos acumulam no banco sem proposito funcional. Administradores podem se confundir ao ver regras de incidencia "vinculadas" a rotinas que nao estao mais ativas. O UX da matriz de incidencia precisa decidir como exibir esses links.

### Opcoes

**Opcao A — Migrar links automaticamente:**
Na operacao de publish com `auto_deprecate_previous: true`, copiar todos os `routine_incidence_links` da versao deprecada para a nova versao publicada (se o fork ja nao os copiou). Remover links da versao deprecada.

- Pros: Zero links orfaos; transicao transparente para o administrador; motor continua funcionando sem gaps
- Contras: Operacao de publish fica mais complexa (transacao maior); se o fork ja copiou links, pode haver duplicatas

**Opcao B — Manter links como historico:**
Links da versao deprecada permanecem no banco. Motor ignora (filtra PUBLISHED). UX exibe com badge "inativo".

- Pros: Historico completo; auditoria de quais regras estavam vinculadas a cada versao; operacao de publish simples
- Contras: Acumulo de links orfaos; UX precisa de filtro/badge para distinguir links ativos de inativos

**Opcao C — Remover links da versao deprecada:**
Na operacao de auto-deprecate, soft-delete dos links da versao deprecada.

- Pros: Banco limpo; sem ambiguidade no UX
- Contras: Perde historico de vinculacao; nao pode "reativar" versao deprecada com links intactos

### Recomendacao

Opcao B (manter como historico) — o fork ja copia links para a nova versao (ADR-003 ponto 3), entao a nova versao publicada ja tera seus proprios links. Links da versao deprecada servem como historico de auditoria. Motor ignora automaticamente (filtra PUBLISHED). UX deve exibir badge "versao deprecada" nos links inativos.

### Acao Sugerida (se aplicavel)

| Skill | Proposito | Quando executar |
|---|---|---|
| `/update-specification FR-007` | Adicionar nota sobre links orfaos no FR-008 (fork) | Apos decisao |
| `/update-specification UX-007` | Adicionar badge "versao deprecada" na matriz de incidencia | Apos decisao |

### Resolucao

> **Decisao:** Opcao B — Manter links como historico
> **Decidido por:** arquitetura em 2026-03-22
> **Justificativa:** Fork ja copia links para nova versao (ADR-003 ponto 3). Links da versao deprecada servem como historico de auditoria. Motor ignora automaticamente (filtra PUBLISHED). FR-007 FR-008 atualizado com nota sobre links orfaos. UX-007 UX-ROTINA-001 atualizado com badge "versao deprecada" na matriz de incidencia.
> **Artefato de saida:** FR-007 (nota FR-008), UX-007 (badge versao deprecada)
> **Implementado em:** 2026-03-22

---

## ~~PENDENTE-008 — Bulk Create de Routine Items na Operacao de Fork~~

- **status:** IMPLEMENTADA
- **severidade:** BAIXA
- **dominio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-20
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-22
- **decidido_por:** arquitetura
- **opcao_escolhida:** A
- **implementado_em:** 2026-03-22
- **modulo:** MOD-007
- **rastreia_para:** FR-005, FR-007, ADR-003, DATA-007, NFR-006
- **tags:** fork, bulk-create, performance, routine-items
- **sla_data:** —
- **dependencias:** []

### Questao

A operacao de fork (FR-005, ADR-003) copia todos os `routine_items` da versao original para a nova rotina DRAFT. Se uma rotina tem 50 itens (limite maximo — NFR-006), o fork executa 50 INSERTs individuais. A questao e: a copia deve ser feita via bulk INSERT (um unico statement) ou itens individuais dentro da mesma transacao?

### Impacto

Com 50 itens, 50 INSERTs individuais na mesma transacao sao aceitaveis em termos de performance (< 100ms). Contudo, se o limite configuravel por tenant (PENDENTE-005) for aumentado significativamente (ex: 200 itens), a abordagem individual pode impactar latencia do fork. A decisao afeta a implementacao do use-case `fork-routine.ts`.

### Opcoes

**Opcao A — Bulk INSERT (unico statement):**
`INSERT INTO routine_items (...) SELECT ... FROM routine_items WHERE routine_id = :original_id` com novos UUIDs gerados no banco.

- Pros: Performance otima independente do numero de itens; unico round-trip ao banco; transacao mais curta
- Contras: UUIDs gerados no banco (nao no aplicativo); domain events de criacao de itens nao sao emitidos individualmente (fork e um evento unico)

**Opcao B — Itens individuais na mesma transacao:**
Loop no aplicativo com INSERT por item. Todos dentro de uma unica transacao.

- Pros: UUIDs gerados no aplicativo (consistente com fluxo normal de criacao); cada item pode ter validacao individual; mais familiar para desenvolvedores
- Contras: N round-trips ao banco (N = numero de itens); transacao mais longa; performance degrada com mais itens

### Recomendacao

Opcao A (bulk INSERT) — para o fork, nao e necessario emitir domain event por item (o evento `routine.forked` ja cobre a operacao). UUIDs podem ser gerados via `gen_random_uuid()` no PostgreSQL. Performance constante independente do numero de itens. Consistente com a decisao de simplicidade operacional (ADR-001, ADR-005).

### Acao Sugerida (se aplicavel)

| Skill | Proposito | Quando executar |
|---|---|---|
| N/A | Decisao tecnica de implementacao — impacta apenas `fork-routine.ts` | Durante implementacao |

### Resolucao

> **Decisao:** Opcao A — Bulk INSERT (unico statement)
> **Decidido por:** arquitetura em 2026-03-22
> **Justificativa:** Fork e evento unico (`routine.forked`), nao necessita domain event por item. `gen_random_uuid()` no PostgreSQL gera UUIDs. Performance constante. Consistente com ADR-001/ADR-005 (simplicidade operacional). Decisao tecnica de implementacao para `fork-routine.ts` — sem domain event por item, sem validacao individual (itens ja validados na versao original).
> **Artefato de saida:** PEN-007 (decisao documentada — implementacao efetiva no `fork-routine.ts` durante codificacao)
> **Implementado em:** 2026-03-22 (decisao; codigo em sprint futuro)

---

## PENDENTE-009 — ~~Scopes `param:*` não registrados em DOC-FND-000 §2.2~~

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **dominio:** UX
- **tipo:** LACUNA
- **origem:** VALIDATE
- **criado_em:** 2026-03-22
- **criado_por:** validate-all
- **modulo:** MOD-007
- **rastreia_para:** DOC-FND-000, ux-param-001, ux-rotina-001, SEC-007
- **tags:** scopes, rbac, amendment, gate-3
- **sla_data:** —
- **dependencias:** []

### Questao

Os manifests que consomem scopes `param:*` (ux-param-001, ux-rotina-001) e MOD-011 (ux-sgr-001/002/003 via `param:engine:evaluate`) referenciam 7 scopes que NÃO existem no catálogo canônico DOC-FND-000 §2.2: `param:framer:read`, `param:framer:write`, `param:framer:delete`, `param:routine:read`, `param:routine:write`, `param:routine:publish`, `param:engine:evaluate`. O módulo spec (seção 8) referencia "Amendment MOD-000-F12" como veículo de registro, mas este amendment só foi aplicado para scopes `mcp:*` (MOD-010). Os scopes `param:*` nunca foram registrados.

### Impacto

Gate 3 (DOC-ARC-003B) falha para TODOS os manifests de MOD-007 e para os 3 manifests de MOD-011 que herdam `param:engine:evaluate`. Bloqueio de promoção para READY.

### Acao Sugerida

| Skill | Proposito | Quando executar |
|---|---|---|
| `/create-amendment MOD-000` | Registrar 7 scopes `param:*` em DOC-FND-000 §2.2 | Imediatamente (pré-requisito de promoção) |

### Resolucao

> **Decisao:** 7 scopes `param:*` registrados diretamente em DOC-FND-000 §2.2 v1.8.0
> **Decidido por:** validate-all em 2026-03-22
> **Justificativa:** Gate 3 (DOC-ARC-003B) exige que todos os scopes referenciados em Screen Manifests existam no catálogo canônico.
> **Artefato de saida:** DOC-FND-000 v1.8.0 — 7 scopes adicionados: param:framer:read/write/delete, param:routine:read/write/publish, param:engine:evaluate
> **Implementado em:** DOC-FND-000 v1.8.0

---

## PENDENTE-010 — Erros de lint do codegen (ESLint + Prettier)

- **status:** ABERTA
- **severidade:** MÉDIA
- **domínio:** ARC
- **tipo:** CONTRADIÇÃO
- **origem:** VALIDATE
- **criado_em:** 2026-03-24
- **criado_por:** validate-all
- **modulo:** MOD-007
- **rastreia_para:** DOC-PADRAO-002, DOC-ARC-002, PEN-000/PENDENTE-018
- **tags:** lint, eslint, prettier, codegen
- **sla_data:** 2026-04-23
- **dependencias:** []

### Questão

Código gerado pelo codegen não passa em `pnpm lint`. 12 ocorrências de lint neste módulo (web/contextual-params: 12). Parte do problema cross-module documentado em PEN-000 PENDENTE-018 (55 errors + 91 warnings em 19 módulos). Viola DOC-PADRAO-002 §4.3.

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

> **Decisão:** —
> **Decidido por:** — em —
> **Justificativa:** —
> **Artefato de saída:** —
> **Implementado em:** —

---

## PENDENTE-011 — Domain errors não estendem DomainError base class

- **status:** ABERTA
- **severidade:** MEDIA
- **dominio:** ARC
- **tipo:** CONTRADIÇÃO
- **origem:** VALIDATE
- **criado_em:** 2026-03-24
- **criado_por:** validate-all
- **modulo:** MOD-007
- **rastreia_para:** DOC-GNP-00, DOC-ARC-001, PEN-000
- **tags:** domain-error, base-class, architecture, cross-module
- **sla_data:** 2026-04-23
- **dependencias:** []

### Questão

Os 6 domain errors em `apps/api/src/modules/contextual-params/domain/errors/param-errors.ts` estendem `Error` diretamente em vez de `DomainError` (classe abstrata em `foundation/domain/errors/domain-errors.ts`). A `DomainError` base class define `type: string` (RFC 9457 URI) e `statusHint: number`, campos que o error-handler precisa mapear. O MOD-007 usa um error-handler customizado com duck-typing (`code`/`statusCode`), que funciona mas diverge do padrão canônico. Padrão idêntico encontrado em MOD-006 (case-execution).

### Impacto

Funcional: nenhum (error-handler de MOD-007 faz duck-typing com `code` + `statusCode`). Arquitetural: diverge do padrão canônico usado por org-units, movement-approval e mcp. Se um middleware centralizado substituir os error-handlers por módulo, os errors de MOD-007 e MOD-006 não seriam capturados pela guarda `instanceof DomainError`.

### Opções

**Opção A — Refatorar para estender DomainError:**
Alterar os 6 errors para estender `DomainError` (ou `DomainValidationError`), adicionando campos `type` e `statusHint`. Remover `code` e `statusCode` customizados. Atualizar error-handler para usar `instanceof DomainError`.

- Pros: Alinhamento com padrão canônico; compatível com middleware centralizado futuro
- Contras: Refatoração em 2 módulos (MOD-006 e MOD-007); error-handler precisa ser atualizado

**Opção B — Manter duck-typing (aceitar divergência):**
Documentar a divergência como aceitável. Error-handler funciona via duck-typing.

- Pros: Zero esforço; código funcional
- Contras: Divergência permanece; risco em middleware centralizado

### Recomendação

Opção A — refatorar para alinhar com padrão canônico. Escopo pequeno (6 errors + error-handler). Deve ser feito junto com MOD-006 para consistência.

### Resolução (preenchido quando DECIDIDA)

> **Decisão:** —
> **Decidido por:** — em —
> **Justificativa:** —
> **Artefato de saída:** —
> **Implementado em:** —
