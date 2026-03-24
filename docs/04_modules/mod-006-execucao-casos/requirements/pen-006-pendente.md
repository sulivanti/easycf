> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
>
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 2.1.0  | 2026-03-24 | manage-pendentes | PENDENTE-008 DECIDIDA — Opção A (refatorar 7 domain errors para estender DomainError) |
> | 2.0.0  | 2026-03-24 | manage-pendentes | PENDENTE-007 IMPLEMENTADA — pnpm format + lint clean, 0 errors em case-execution |
> | 1.9.0  | 2026-03-24 | manage-pendentes | PENDENTE-007 DECIDIDA — Opção A (correção incremental 3 fases: format, lint:fix, refactor React) |
> | 1.8.0  | 2026-03-24 | validate-all | Adição PENDENTE-008 — domain errors estendem Error ao invés de DomainError (7 arquivos) |
> | 1.7.0  | 2026-03-24 | validate-all | Adição PENDENTE-007 — erros lint codegen (7 ocorrências) |
> | 1.6.0  | 2026-03-24 | manage-pendentes | PENDENTE-006 IMPLEMENTADA — routes, operationIds, params, OpenAPI alinhados com spec §7 |
> | 1.5.0  | 2026-03-23 | manage-pendentes | PENDENTE-006 DECIDIDA — Opção A (ajustar código para alinhar com spec READY) |
> | 1.4.0  | 2026-03-23 | validate-all | PENDENTE-006 ABERTA — Endpoints API divergem da spec (paths, /controls, PATCH, operationIds, OpenAPI) |
> | 1.3.0  | 2026-03-19 | manage-pendentes | PENDENTE-005 IMPLEMENTADA — FR-007 target_stage_id, FR-002 gate reset, DATA-006 payload, BR-016 regra completa |
> | 1.2.0  | 2026-03-19 | manage-pendentes | PENDENTE-003 IMPLEMENTADA — FR-009 object_id param, INT-006 §2.7 contrato |
> | 1.1.0  | 2026-03-19 | manage-pendentes | PENDENTE-002 IMPLEMENTADA — ADR-005 (accepted + seção expiração), FR-014, INT-006 §3.2 contrato |
> | 1.0.0  | 2026-03-19 | manage-pendentes | PENDENTE-001 IMPLEMENTADA — scope reopen em SEC-006, SEC-002, BR-006 + DOC-FND-000-M02 |
> | 0.9.0  | 2026-03-19 | manage-pendentes | PENDENTE-004 IMPLEMENTADA — amendment DOC-FND-000-M01 fechado |
> | 0.8.0  | 2026-03-19 | manage-pendentes | PENDENTE-003 DECIDIDA — Opção A (query param dedicado object_id) |
> | 0.7.0  | 2026-03-19 | manage-pendentes | PENDENTE-005 DECIDIDA — Opção B (target_stage_id obrigatório no REOPENED) |
> | 0.6.0  | 2026-03-19 | manage-pendentes | PENDENTE-002 DECIDIDA — Opção B (DelegationCheckerPort pattern) |
> | 0.4.0  | 2026-03-19 | manage-pendentes | PENDENTE-001 DECIDIDA — Opção B (scope process:case:reopen dedicado) |
> | 0.3.0  | 2026-03-19 | manage-pendentes | PENDENTE-004 DECIDIDA — Opção A (amendment imediato) |
> | 0.2.0  | 2026-03-19 | AGN-DEV-10  | Enriquecimento PENDENTE — 5 questões abertas registradas (escopo REOPENED, expiração atribuições, índice object_id, amendment scopes, gates em reabertura) |
> | 0.1.0  | 2026-03-18 | arquitetura | Baseline Inicial (forge-module) |

# PEN-006 — Questões Abertas da Execução de Casos

---

## Painel de Controle

| # | Severidade | Status | Domínio | Tipo | Título |
|---|---|---|---|---|---|
| PENDENTE-001 | 🟠 ALTA | ✅ IMPLEMENTADA | SEC | LACUNA | ~~Escopo especial para reabertura de caso COMPLETED (REOPENED)~~ |
| PENDENTE-002 | 🟠 ALTA | ✅ IMPLEMENTADA | ARC | DEC-TEC | ~~Mecanismo de expiração automática de atribuições (BR-015/BR-017)~~ |
| PENDENTE-003 | 🟡 MÉDIA | ✅ IMPLEMENTADA | DATA | DEC-TEC | ~~Índice de busca por object_id na listagem de casos~~ |
| PENDENTE-004 | 🟠 ALTA | ✅ IMPLEMENTADA | SEC | DEP-EXT | ~~Amendment MOD-000-F12 para registro dos 6 scopes process:case:*~~ |
| PENDENTE-005 | 🟡 MÉDIA | ✅ IMPLEMENTADA | BIZ | LACUNA | ~~Comportamento de gates ao reabrir caso COMPLETED~~ |
| PENDENTE-006 | 🟠 ALTA | ✅ IMPLEMENTADA | ARC | CONTRADIÇÃO | ~~Endpoints API divergem da especificação MOD-006 §7~~ |
| PENDENTE-007 | 🟡 MÉDIA | ✅ IMPLEMENTADA | ARC | CONTRADIÇÃO | ~~Erros de lint do codegen (ESLint + Prettier)~~ |
| PENDENTE-008 | 🟡 MÉDIA | 🟢 DECIDIDA | ARC | CONTRADIÇÃO | Domain errors estendem Error ao invés de DomainError (faltam type + statusHint) |

Total: 8 | Abertas: 0 | Decididas: 1 | Implementadas: 7 | Bloqueantes: 0

---

## PENDENTE-001 — Escopo especial para reabertura de caso COMPLETED (REOPENED)

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **domínio:** SEC
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** B
- **justificativa_decisao:** Ação excepcional de alto impacto e auditada. Scope dedicado process:case:reopen permite rastreabilidade clara em logs. Custo de +1 scope é baixo vs benefício de clareza semântica.
- **modulo:** MOD-006
- **rastreia_para:** BR-016, FR-007, SEC-006, SEC-002, DOC-FND-000
- **tags:** reopened, scope, security, audit
- **sla_data:** ---
- **dependencias:** [PENDENTE-004]

### Questão

BR-016 define que reabrir caso COMPLETED requer "escopo especial (a definir)". SEC-006 §2.2 e SEC-002 repetem "escopo a definir (missing_info)". Qual scope controla a ação de reabertura? Deve ser um scope existente reutilizado ou um novo scope dedicado?

### Impacto

Sem definição do scope, a implementação de FR-007 (registro de evento REOPENED com side-effect status COMPLETED → OPEN) não pode ser protegida adequadamente. A ação é crítica (reverte conclusão do caso) e precisa de controle de acesso explícito para auditoria e compliance.

### Opções

**Opção A — Reutilizar `process:case:gate_waive`:**
REOPENED é uma ação excepcional semelhante a waive — ambas revertem decisões formais. O scope gate_waive já é concedido apenas a perfis de auditoria/gestão.

- Prós: Sem novo scope; menor custo de catálogo; mesma persona (auditor) executa ambas
- Contras: Semântica imprecisa (waive refere-se a gates, não a reabertura); pode confundir regras de concessão

**Opção B — Criar novo scope `process:case:reopen`:**
Scope dedicado exclusivamente para reabertura de casos COMPLETED.

- Prós: Semântica clara; granularidade máxima; facilita auditoria (scope aparece em logs)
- Contras: Mais um scope no catálogo (total: 7); requer amendment MOD-000-F12 adicional; perfis precisam ser atualizados

**Opção C — Reutilizar `process:case:cancel`:**
Cancel e reopen são ambas ações críticas de ciclo de vida do caso, restritas a gestores.

- Prós: Mesmo nível de criticidade; mesma persona; sem novo scope
- Contras: Semântica invertida (cancel encerra, reopen reverte encerramento); confuso para administradores de permissões

### Recomendação

Opção B — `process:case:reopen` como scope dedicado. A ação é excepcional, de alto impacto e auditada. Um scope específico permite rastreabilidade clara em logs de auditoria e concessão granular. O custo de um scope adicional é baixo frente ao benefício de clareza semântica.

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| `/manage-pendentes decide PEN-006 PENDENTE-001 opção=B` | Registrar decisão | Após validação do owner |
| `/create-amendment MOD-000` | Registrar scope `process:case:reopen` no catálogo canônico | Após decisão |

### Resolução

> **Decisão:** Opção B — Criar novo scope `process:case:reopen`
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Ação excepcional de alto impacto e auditada. Scope dedicado process:case:reopen permite rastreabilidade clara em logs. Custo de +1 scope é baixo vs benefício de clareza semântica.
> **Artefato de saída:** DOC-FND-000-M02 (amendments/sec/DOC-FND-000-M02.md)
> **Implementado em:** 2026-03-19

---

## PENDENTE-002 — Mecanismo de expiração automática de atribuições (BR-015/BR-017)

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **domínio:** ARC
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** B
- **justificativa_decisao:** Port/adapter DelegationCheckerPort já existe na arquitetura. Basta adicionar getExpiredDelegations. Desacoplamento via port garante que mudanças no MOD-004 não quebram o job. Evoluir para event-driven quando MOD-004 implementar delegation.expired.
- **modulo:** MOD-006
- **rastreia_para:** BR-015, BR-017, FR-006, ADR-005, NFR-006, INT-006, MOD-004
- **tags:** expiration, background-job, delegation, assignment
- **sla_data:** ---
- **dependencias:** []

### Questão

BR-015 (delegação expira) e BR-017 (valid_until expira) exigem desativação automática de atribuições. ADR-005 propõe background job a cada 5 minutos. Entretanto, não está definido: (1) como o job detecta que uma delegação MOD-004 expirou — consulta direta a `access_delegations.expires_at` ou evento de MOD-004? (2) qual a tolerância aceitável de latência entre expiração real e desativação? (3) o job deve emitir domain events ou apenas atualizar o banco?

### Impacto

Sem definição clara do mecanismo, a implementação pode ser inconsistente (ex: job que consulta tabela de outro módulo sem contrato formal) ou ter latência inaceitável (ex: atribuição expirada há 30 min ainda aparece como ativa). Afeta também o healthcheck do job (NFR-006 §3).

### Opções

**Opção A — Background job com consulta direta a access_delegations:**
Job a cada 5 min consulta `case_assignments` JOIN `access_delegations` WHERE `expires_at < now()`.

- Prós: Implementação simples; sem dependência de evento externo; funciona imediatamente
- Contras: Acoplamento direto ao schema do MOD-004; se MOD-004 mudar schema, job quebra; latência de até 5 min

**Opção B — Background job + port/adapter (BlueprintReaderPort pattern):**
Job a cada 5 min usa DelegationCheckerPort (já definido em mod.md §3) para verificar expiração — abstrai acesso ao MOD-004.

- Prós: Desacoplamento via port; testável com mock; padrão já estabelecido no módulo
- Contras: Latência de até 5 min; port precisa de método adicional (`getExpiredDelegations`)

**Opção C — Event-driven via MOD-004 (complementar ao job):**
MOD-004 emite `delegation.expired` → handler no MOD-006 desativa atribuições imediatamente. Job mantido como fallback.

- Prós: Latência mínima; reação imediata; desacoplamento via eventos
- Contras: MOD-004 não emite esse evento hoje; complexidade de implementação; precisa de outbox no MOD-004

### Recomendação

Opção B no curto prazo (job via DelegationCheckerPort), evoluindo para Opção C quando MOD-004 implementar domain events de expiração. O port já existe na arquitetura do módulo — basta adicionar o método de verificação.

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| `/manage-pendentes decide PEN-006 PENDENTE-002 opção=B` | Registrar decisão | Após validação técnica |

### Resolução

> **Decisão:** Opção B — Background job + port/adapter (DelegationCheckerPort pattern)
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Port/adapter DelegationCheckerPort já existe na arquitetura. Basta adicionar getExpiredDelegations. Desacoplamento via port garante que mudanças no MOD-004 não quebram o job. Evoluir para event-driven quando MOD-004 implementar delegation.expired.
> **Artefato de saída:** ADR-005 (seção expiração + status accepted), FR-014 (background job), INT-006 §3.2 (contrato getExpiredDelegations)
> **Implementado em:** 2026-03-19

---

## PENDENTE-003 — Índice de busca por object_id na listagem de casos

- **status:** IMPLEMENTADA
- **severidade:** MÉDIA
- **domínio:** DATA
- **tipo:** DEC-TEC
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Integrações programáticas (MOD-007, MOD-008) precisam de exact match confiável via B-tree. Search continua para busca textual por codigo na UI. Simplicidade e performance sobre flexibilidade.
- **modulo:** MOD-006
- **rastreia_para:** DATA-006, FR-009, NFR-006
- **tags:** index, search, object_id, performance
- **sla_data:** ---
- **dependencias:** []

### Questão

DATA-006 define `idx_case_instances_object` como index parcial `(object_type, object_id) WHERE object_id IS NOT NULL` para busca por objeto de negócio vinculado. FR-009 permite busca por `object_id` via parâmetro `search`. Porém: (1) o filtro `search` faz busca textual por `codigo` ou `object_id` — como funciona a busca por UUID em campo de texto livre? (2) o índice parcial é suficiente para o SLO < 300ms (NFR-006) ou é necessário GIN/trigram para busca parcial? (3) deve haver endpoint dedicado `GET /cases?object_id={uuid}` ao invés de usar `search`?

### Impacto

Se a busca por object_id não for otimizada, módulos dependentes (MOD-007, MOD-008) que precisam localizar casos por objeto de negócio terão latência degradada. O SLO < 300ms da listagem pode ser comprometido com busca textual em UUIDs.

### Opções

**Opção A — Query param dedicado `object_id` (exact match):**
Adicionar `object_id` como query param específico em GET /cases, com busca exata via índice `idx_case_instances_object`.

- Prós: Performance excelente (exact match em índice B-tree); semântica clara; SLO garantido
- Contras: Mais um query param; duplicação com `search` para quem não sabe o UUID exato

**Opção B — Manter busca via `search` com detecção de UUID:**
Se `search` contém formato UUID, buscar em `object_id` via exact match; caso contrário, buscar em `codigo` via LIKE.

- Prós: Interface simples (um campo serve para tudo); sem novo query param
- Contras: Lógica de detecção de UUID no backend; se o formato mudar no futuro, query quebra; ambiguidade

**Opção C — Ambos (dedicado + search):**
Query param `object_id` para integrações programáticas + `search` para UI com detecção de UUID.

- Prós: Melhor dos dois mundos; integrações usam param dedicado, UI usa search
- Contras: Mais complexidade; dois caminhos para o mesmo resultado

### Recomendação

Opção A — query param dedicado `object_id`. Integrações programáticas (MOD-007, MOD-008) precisam de exact match confiável. O `search` continua para busca textual por codigo na UI. Simplicidade e performance sobre flexibilidade.

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| `/manage-pendentes decide PEN-006 PENDENTE-003 opção=A` | Registrar decisão | Após validação |

### Resolução

> **Decisão:** Opção A — Query param dedicado `object_id` (exact match)
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Integrações programáticas (MOD-007, MOD-008) precisam de exact match confiável via B-tree. Search continua para busca textual por codigo na UI. Simplicidade e performance sobre flexibilidade.
> **Artefato de saída:** FR-009 (query param object_id), INT-006 §2.7 (contrato atualizado)
> **Implementado em:** 2026-03-19

---

## PENDENTE-004 — Amendment MOD-000-F12 para registro dos 6 scopes process:case:*

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **domínio:** SEC
- **tipo:** DEP-EXT
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Dependência bloqueante para deploy. Gate CI rejeita Screen Manifests sem scopes registrados. Desbloqueio antecipado do CI vale mais que otimização de PRs.
- **modulo:** MOD-006
- **rastreia_para:** SEC-006, DOC-FND-000, MOD-000, US-MOD-006
- **tags:** scopes, rbac, foundation, amendment
- **sla_data:** ---
- **dependencias:** []

### Questão

O MOD-006 define 6 novos scopes `process:case:*` (read, write, cancel, gate_resolve, gate_waive, assign). SEC-006 §2.1 afirma que "todos os 6 scopes DEVEM ser registrados no catálogo canônico de DOC-FND-000 §2.2 via Amendment MOD-000-F12". Atualmente, esses scopes NÃO estão no DOC-FND-000. Quando e como será executado o amendment? Se PENDENTE-001 resultar em novo scope (process:case:reopen), serão 7 scopes.

### Impacto

Sem registro no catálogo canônico, o Gate CI (DOC-ARC-003B) rejeitará Screen Manifests que referenciem esses scopes. A implementação do MOD-006 não pode ser deployada sem que os scopes existam no Foundation.

### Opções

**Opção A — Amendment imediato (antes do desenvolvimento):**
Executar `/create-amendment MOD-000` agora para registrar os 6 (ou 7) scopes.

- Prós: Desbloqueio imediato do Gate CI; scopes disponíveis para testes desde o início
- Contras: Se PENDENTE-001 ainda não está decidida, pode ser necessário segundo amendment

**Opção B — Amendment junto com a primeira PR do MOD-006:**
Incluir o amendment no mesmo PR que cria o scaffold do módulo.

- Prós: Uma única revisão; amendment e implementação juntos; evita retrabalho se PENDENTE-001 mudar
- Contras: PR maior; revisão do Foundation junto com módulo novo

### Recomendação

Opção A — amendment imediato. A dependência é bloqueante para o Gate CI. Mesmo que PENDENTE-001 adicione um scope, um segundo amendment é trivial. Desbloqueio antecipado vale mais que otimização de PRs.

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| `/create-amendment MOD-000` | Registrar 6 scopes process:case:* no DOC-FND-000 §2.2 | Imediatamente |

### Resolução

> **Decisão:** Opção A — Amendment imediato (antes do desenvolvimento)
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Dependência bloqueante para deploy. Gate CI rejeita Screen Manifests sem scopes registrados. Desbloqueio antecipado do CI vale mais que otimização de PRs.
> **Artefato de saída:** DOC-FND-000-M01 (amendments/sec/DOC-FND-000-M01.md)
> **Implementado em:** 2026-03-19

---

## PENDENTE-005 — Comportamento de gates ao reabrir caso COMPLETED

- **status:** IMPLEMENTADA
- **severidade:** MÉDIA
- **domínio:** BIZ
- **tipo:** LACUNA
- **origem:** ENRICH
- **criado_em:** 2026-03-19
- **criado_por:** AGN-DEV-10
- **decidido_em:** 2026-03-19
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** B
- **justificativa_decisao:** Motor não adivinha — operador decide para qual estágio retornar via target_stage_id obrigatório. Gates do estágio destino recriados como PENDING. Princípio de explicitness.
- **modulo:** MOD-006
- **rastreia_para:** BR-016, FR-002, FR-007, DATA-006
- **tags:** reopened, gates, state-machine, business-rules
- **sla_data:** ---
- **dependencias:** [PENDENTE-001]

### Questão

Quando um caso COMPLETED é reaberto (BR-016, REOPENED), o `current_stage_id` permanece no estágio terminal. Os gate_instances desse estágio já estão RESOLVED. As questões são: (1) O caso reaberto permanece no estágio terminal com gates já resolvidos? (2) Deve ser movido de volta ao estágio anterior (qual?)? (3) Os gates do estágio devem ser resetados para PENDING? (4) Quem define para qual estágio o caso retorna?

### Impacto

Sem definição, a reabertura coloca o caso em estado ambíguo: OPEN mas no estágio terminal (is_terminal=true). O motor de transição pode não ter transições de saída definidas para um estágio terminal no blueprint (já que estágios terminais são endpoints). O operador ficaria preso sem como avançar ou retroceder.

### Opções

**Opção A — Caso permanece no estágio terminal; operador faz transição reversa:**
O blueprint define transições reversas explícitas a partir de estágios terminais (ex: "Reabrir → Em Análise"). Quem configura o blueprint decide para onde o caso pode ir.

- Prós: Flexibilidade total via blueprint; sem lógica especial no motor; blueprints explícitos
- Contras: Requer que o blueprint preveja reabertura (pode não ter transição); se não tiver, caso fica preso

**Opção B — REOPENED inclui `target_stage_id` obrigatório no body:**
O operador que reabre informa para qual estágio o caso deve retornar. Gates do estágio destino são recriados como PENDING.

- Prós: Controle explícito; sem ambiguidade; gates resetados para o novo contexto
- Contras: Complexidade no endpoint POST /events (REOPENED vira quase uma transição); muda contrato de FR-007

**Opção C — Caso volta ao penúltimo estágio (último registro em stage_history):**
Lógica automática: ler último stage_history e reverter para from_stage_id. Gates recriados.

- Prós: Automático; sem input adicional do operador
- Contras: O penúltimo estágio pode não ser o correto; sem flexibilidade; lógica frágil se houver múltiplos caminhos

### Recomendação

Opção B — `target_stage_id` obrigatório no body de REOPENED. É a opção mais explícita e segura. Mantém o princípio de que o motor não adivinha — o operador decide. Gates do estágio destino são recriados como PENDING, garantindo que o fluxo recomeça corretamente naquele ponto.

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| `/manage-pendentes decide PEN-006 PENDENTE-005 opção=B` | Registrar decisão | Após validação do owner e produto |

### Resolução

> **Decisão:** Opção B — REOPENED inclui `target_stage_id` obrigatório no body
> **Decidido por:** Marcos Sulivan em 2026-03-19
> **Justificativa:** Motor não adivinha — operador decide para qual estágio retornar via target_stage_id obrigatório. Gates do estágio destino recriados como PENDING. Princípio de explicitness.
> **Artefato de saída:** FR-007 (target_stage_id + scope reopen), FR-002 (gate reset na reabertura), DATA-006 (payload REOPENED), BR-016 (regra completa)
> **Implementado em:** 2026-03-19

---

## PENDENTE-006 — Endpoints API divergem da especificação MOD-006 §7

- **status:** IMPLEMENTADA
- **severidade:** ALTA
- **domínio:** ARC
- **tipo:** CONTRADIÇÃO
- **origem:** VALIDATE
- **criado_em:** 2026-03-23
- **criado_por:** validate-all
- **decidido_em:** 2026-03-23
- **decidido_por:** Marcos Sulivan
- **opcao_escolhida:** A
- **justificativa_decisao:** Spec MOD-006 está selada (READY) e validada. Código deve alinhar com spec. Endpoints separados para cancel/hold/resume permitem controle granular de scopes. Contrato OpenAPI é obrigatório para Gate CI.
- **modulo:** MOD-006
- **rastreia_para:** FR-006, INT-006, DOC-ARC-001, EX-OAS-001
- **tags:** endpoints, operationId, route-structure, openapi
- **sla_data:** 2026-04-06
- **dependencias:** []

### Questão

O arquivo `cases.route.ts` gerado pelo AGN-COD-API diverge da especificação MOD-006 §7 em 5 pontos: (1) path `POST /transitions` vs spec `/transition` (singular), (2) cancel/hold/resume consolidados em `POST /controls` com action enum em vez de 3 endpoints separados conforme spec, (3) `PATCH /assignments/:aid` (cases_assignments_update) ausente, (4) 5 operationIds divergem da spec (`cases_gate_resolve` vs `cases_gates_resolve`, `cases_assign` vs `cases_assignments_create`, `cases_record_event` vs `cases_events_create`, etc.), (5) param `:gateInstanceId` vs spec `:gateId`. Adicionalmente, o contrato OpenAPI do MOD-006 não foi gerado (outros módulos como MOD-008/009 têm arquivo dedicado).

### Impacto

Sem alinhamento entre código e spec: (a) frontend consome endpoints com paths/operationIds diferentes dos documentados, gerando confusão; (b) OpenAPI ausente impede validação automática via Spectral e Gate CI (DOC-ARC-003B); (c) PATCH /assignments/:aid inexistente impede reatribuição parcial de responsáveis (FR-006 §atribuições).

### Opções

**Opção A — Ajustar código para alinhar com spec (recomendado):**
Refatorar `cases.route.ts` para: (1) renomear `/transitions` → `/transition`, (2) separar `/controls` em 3 endpoints dedicados (`/cancel`, `/hold`, `/resume`), (3) implementar `PATCH /assignments/:aid`, (4) corrigir operationIds e param names, (5) gerar contrato OpenAPI `mod-006-case-execution.yaml`.

- Prós: Código alinhado com spec selada (READY); operationIds consistentes para frontend; OpenAPI habilita Gate CI; sem ambiguidade na documentação
- Contras: Refatoração em arquivo já gerado; DTOs de /controls precisam ser redistribuídos; testes existentes podem quebrar

**Opção B — Ajustar spec para alinhar com código:**
Atualizar MOD-006 §7, FR-006 e INT-006 via `/create-amendment` para refletir a estrutura consolidada (/controls, /transitions plural, operationIds atuais).

- Prós: Código já funcional não precisa mudar; consolidação /controls pode ser vista como simplificação
- Contras: Spec READY requer amendment formal; 3 endpoints viram 1 (perde granularidade de scopes separados para cancel/hold/resume); param :gateInstanceId é menos intuitivo que :gateId

### Recomendação

Opção A — Ajustar código para alinhar com a spec. A especificação está selada (READY) e foi validada por múltiplos agentes. A granularidade de endpoints separados para cancel/hold/resume permite controle de scope mais fino (process:case:cancel vs process:case:write). O contrato OpenAPI é obrigatório para o Gate CI.

### Ação Sugerida (se aplicável)

| Skill | Propósito | Quando executar |
|---|---|---|
| `/manage-pendentes decide PEN-006 PENDENTE-006 opção=A` | Registrar decisão | Após validação do owner |
| `/codegen-agent docs/04_modules/mod-006-execucao-casos/ AGN-COD-API` | Re-gerar endpoints alinhados com spec | Após decisão |

### Resolução

> **Decisão:** Opção A — Ajustar código para alinhar com spec (refatorar routes, DTOs, operationIds, gerar OpenAPI)
> **Decidido por:** Marcos Sulivan em 2026-03-23
> **Justificativa:** Spec MOD-006 está selada (READY) e validada. Código deve alinhar com spec. Endpoints separados para cancel/hold/resume permitem controle granular de scopes. Contrato OpenAPI é obrigatório para Gate CI.
> **Artefato de saída:** cases.route.ts (16 endpoints alinhados com spec §7), mod-006-case-execution.yaml (OpenAPI)
> **Implementado em:** 2026-03-24

---

## PENDENTE-007 — Erros de lint do codegen (ESLint + Prettier)

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
- **justificativa_decisao:** Correção incremental em 3 fases é a abordagem mais segura e consistente com decisão já tomada em PEN-000 PENDENTE-018. Fases 1-2 são automatizáveis, fase 3 segue padrão mecânico.
- **modulo:** MOD-006
- **rastreia_para:** DOC-PADRAO-002, DOC-ARC-002, PEN-000/PENDENTE-018
- **tags:** lint, eslint, prettier, codegen
- **sla_data:** 2026-04-23
- **dependencias:** []

### Questão

Código gerado pelo codegen não passa em `pnpm lint`. 7 ocorrências de lint neste módulo (web/case-execution: 5, api/case-execution: 2). Parte do problema cross-module documentado em PEN-000 PENDENTE-018 (55 errors + 91 warnings em 19 módulos). Viola DOC-PADRAO-002 §4.3.

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

> **Decisão:** Opção A — Correção incremental em 3 fases (format → lint:fix → refactor React hooks)
> **Decidido por:** Marcos Sulivan em 2026-03-24
> **Justificativa:** Abordagem mais segura, cada fase independente e reversível. Consistente com PEN-000 PENDENTE-018.
> **Artefato de saída:** `pnpm format` + `pnpm lint` — 0 errors, 0 warnings em case-execution (api + web)
> **Implementado em:** 2026-03-24

---

## PENDENTE-008 — Domain errors estendem Error ao invés de DomainError

- **status:** ABERTA
- **severidade:** MÉDIA
- **domínio:** ARC
- **tipo:** CONTRADIÇÃO
- **origem:** VALIDATE
- **criado_em:** 2026-03-24
- **criado_por:** validate-all
- **modulo:** MOD-006
- **rastreia_para:** DOC-ESC-001, DOC-GNP-00, MOD-000
- **tags:** domain-error, architecture, error-hierarchy
- **sla_data:** 2026-04-23
- **dependencias:** []

### Questão

Os 7 arquivos de erro do domínio MOD-006 (`gate-pending.error.ts`, `role-not-authorized.error.ts`, `evidence-required.error.ts`, `role-required-unassigned.error.ts`, `case-not-open.error.ts`, `invalid-transition.error.ts`, `cycle-not-published.error.ts`) estendem `Error` nativo ao invés de `DomainError` do Foundation (`apps/api/src/modules/foundation/domain/errors/domain-errors.ts`). Usam `code: string` e `statusCode: number` ao invés dos campos obrigatórios `type: string` (RFC 9457 URI) e `statusHint: number` definidos na classe base `DomainError`.

### Impacto

Sem extensão de `DomainError`, o error handler da presentation layer não pode mapear automaticamente os erros para respostas RFC 9457 Problem Details. Cada erro precisa de tratamento especial no catch. Outros módulos (MOD-003, MOD-004, MOD-009, MOD-010) já seguem o padrão correto.

### Opções

**Opção A — Refatorar errors para estender DomainError:**
Alterar os 7 arquivos para importar e estender `DomainError`, substituindo `code`/`statusCode` por `type`/`statusHint` com URIs RFC 9457.

- Prós: Alinhamento arquitetural completo; error handler genérico funciona; consistência cross-module
- Contras: 7 arquivos alterados; imports nos consumers (domain services, use cases) podem precisar ajuste

**Opção B — Manter como está, tratar no error handler:**
Adicionar tratamento especial no error handler para erros que não estendem DomainError.

- Prós: Sem refatoração nos domain errors
- Contras: Dívida técnica permanente; tratamento ad-hoc no handler; inconsistência com outros módulos

### Recomendação

Opção A — Refatorar para estender DomainError. O esforço é baixo (7 arquivos com mudanças mecânicas) e garante consistência com o padrão estabelecido em 5+ módulos.

### Resolução (preenchido quando DECIDIDA)

> **Decisão:** —
> **Decidido por:** — em —
> **Justificativa:** —
> **Artefato de saída:** —
> **Implementado em:** —

---

- **estado_item:** READY
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-24
- **rastreia_para:** US-MOD-006, BR-006, FR-006, SEC-006, DATA-006, NFR-006, INT-006, ADR-005, MOD-004, MOD-000, DOC-PADRAO-002, DOC-ESC-001
- **evidencias:** PENDENTE-008 (7 domain errors estendem Error ao invés de DomainError)
