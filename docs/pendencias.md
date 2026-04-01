# Pendencias e Decisoes — MOD-003 a MOD-011

> Atualizado em 2026-03-15 — sessao de resolucao de pendencias.
> Aprovacoes do owner (Marcos Sulivan) omitidas — gate de processo, nao decisao tecnica.

---

## MOD-003 — Estrutura Organizacional

- [x] **Dependencia em MOD-000-F07 e MOD-000-F12** — confirmada como dependencia de sequencia de entrega *(REGISTRADA — 2026-03-15)*
- [x] **SLA: tree query CTE** *(RESOLVIDA — 2026-03-15)*

### Decisao — SLA tree query CTE

**Pergunta:** 500 nos e um volume realista? 200ms e aceitavel como SLA?

**Resposta:**
- Volume maximo: ~100 nos (nao 500) — estrutura organizacional do contexto e menor
- Estrategia: **cache da arvore organizacional**, invalidado apenas quando ha alteracao
- Justificativa: a estrutura organizacional muda raramente (configuracao pontual) — cache e a abordagem correta
- SLA de 200ms mantido como referencia tecnica, sem pressao real dado o volume baixo

---

## MOD-004 — Identidade Avancada

- [x] **Dependencia em MOD-003-F01** — confirmada como dependencia de sequencia de entrega *(REGISTRADA — 2026-03-15)*
- [x] **Background job de expiracao de delegacoes** *(RESOLVIDA — 2026-03-15)*
- [x] **Segregacao de deveres (shares: authorized_by != grantor_id)** *(RESOLVIDA — 2026-03-15)*

### Decisao — Background job de expiracao

**Pergunta:** 5 minutos de tolerancia e aceitavel? Uma delegacao pode continuar ativa por ate 5 minutos apos a hora de expiracao configurada.

**Resposta:** Sim, 5 minutos e toleravel.

### Decisao — Segregacao authorized_by != grantor_id

**Pergunta:** A restricao de que quem autoriza um compartilhamento nao pode ser o proprio usuario que esta concedendo — e regra de negocio obrigatoria ou pode ser flexibilizada?

**Resposta:** A regra absoluta foi **removida**. A logica correta e baseada em permissao:

| Situacao | Comportamento |
|---|---|
| Usuario tem `identity:share:authorize` | Pode ser grantor e authorized_by ao mesmo tempo |
| Usuario nao tem o scope | Precisa indicar terceiro como authorized_by |

**Implementacao:**
- CHECK constraint `authorized_by != grantor_id` removida do banco
- Validacao vive no service layer
- Somente usuarios sem o scope precisam de terceiro autorizador
- Faz sentido: se Joao e gestor com permissao para liberar, nao precisa de aprovacao de outro

---

## MOD-005 — Modelagem de Processos

- [x] **Editor visual — suporte a 50 nos** *(RESOLVIDA — 2026-03-15)*
- [x] **Ciclos publicados sao imutaveis — fork para nova versao** *(RESOLVIDA — 2026-03-15)*

### Decisao — Editor visual 50 nos

**Pergunta:** 50 nos e um teto adequado para o seu contexto?

**Contexto discutido:** exemplo de ciclo de compras com 15 estagios em 3 macroetapas (Solicitacao, Aprovacao, Execucao). Ao incorporar outras macroetapas como Separacao, Consumo e Producao, um ciclo completo facilmente chega a 30-40 estagios.

**Resposta:** Confirmado — 50 nos e o teto adequado.

**Detalhes:**
- Ciclos tipicos: 30 a 40 estagios num ciclo completo de operacao
- Mini-mapa obrigatorio no editor a partir de 15 nos
- Performance do canvas validada ate 50 nos sem degradacao visual

### Decisao — Ciclos publicados imutaveis

**Pergunta:** Ciclos publicados nao podem ser alterados diretamente — qualquer mudanca exige fork. Confirma para o contexto de negocio?

**Motivo da regra:** casos em andamento (MOD-006) referenciam a versao exata do ciclo em que foram abertos. Se o ciclo pudesse ser editado, os casos em andamento estariam seguindo um processo diferente do que foi aprovado.

**Resposta:** Confirmado — processos publicados nao podem ser alterados diretamente. Fork obrigatorio para qualquer mudanca. Casos em andamento nunca migram automaticamente para nova versao.

---

## MOD-006 — Execucao de Casos

- [x] **Dependencia em MOD-005** — confirmada como dependencia de sequencia de entrega *(REGISTRADA — 2026-03-15)*
- [x] **Motor de transicao com 5 etapas de validacao** *(RESOLVIDA — 2026-03-15)*
- [x] **cycle_version_id congelado na criacao da instancia** *(RESOLVIDA — 2026-03-15)*

### Decisao — Motor de transicao 5 etapas

**Pergunta:** As 5 etapas de validacao antes de qualquer transicao de estagio refletem como voce espera que o controle de avanco funcione?

```
1. O caso esta aberto (nao cancelado, nao concluido)?
2. A transicao existe no blueprint?
3. O usuario tem o papel autorizado para essa transicao?
4. Todos os gates obrigatorios do estagio estao resolvidos?
5. A evidencia foi fornecida (se a transicao exige)?
```

**Resposta:** Confirmadas as 5 etapas. Qualquer falha bloqueia a transicao com 422 e mensagem especifica da etapa que falhou.

### Decisao — cycle_version_id congelado

**Pergunta:** Cada caso segue a versao do ciclo em que foi aberto, ou prefere que casos em andamento sigam sempre a versao mais recente?

**Resposta:** Confirmado — cada caso segue a versao do ciclo em que foi aberto. Nunca migra automaticamente para versao mais recente. Garante que o caso seja julgado pelo processo que estava vigente quando foi aberto.

---

## MOD-007 — Parametrizacao Contextual

- [x] **Motor de avaliacao — cache Redis** *(RESOLVIDA — decisao MOD-011 PEND-SGR-02 #4, 2026-03-15)*
- [x] **blocking_validations bloqueiam transicoes do MOD-006** *(RESOLVIDA — 2026-03-15)*
- [x] **Resolucao de conflito por prioridade** *(RESOLVIDA — 2026-03-15)*
- [ ] **PENDENTE-012 — BR-004: Precedência OBR/OPC/AUTO na resolução de conflitos** *(ABERTA — 2026-04-01, origem: REVIEW de DATA-007-M01 e FR-007-M01, severidade MÉDIA)*

### Decisao — Cache Redis removido do motor

Resolvido como parte da PEND-SGR-02 do MOD-011. Cache Redis removido do motor inteiro — todas as chamadas ao `/routine-engine/evaluate` executam ao vivo, sem excecao.

**Motivo:** operacoes criticas nao toleram dado desatualizado. Consistencia vale mais que performance aqui.

### Decisao — blocking_validations → MOD-006

**Pergunta:** Quando o motor retorna `blocking_validations` nao vazio, o motor de transicao do MOD-006 deve bloquear o avanco do caso?

**Resposta:** Confirmado. `blocking_validations` nao vazio bloqueia a transicao de estagio com 422 e a mensagem especifica da validacao.

### Decisao — Resolucao de conflito entre enquadradores

**Contexto discutido:** conflito real nao ocorre entre duas operacoes do mesmo tipo (um pedido e ou de servico ou de produto importado — nunca os dois). O conflito acontece quando tipos diferentes de enquadrador incidem simultaneamente:

```
Pedido de Compra de Aco Importado em Etapa de Aprovacao:
  Enquadrador TIPO_DOCUMENTO:    "Pedido de Compra"     → ncm opcional
  Enquadrador CLASSE_PRODUTO:    "Aco SAE Importado"    → ncm obrigatorio
  Enquadrador CONTEXTO_PROCESSO: "Etapa Aprovacao"      → ncm obrigatorio
```

**Opcoes discutidas:**
- **Opcao A:** bloquear o conflito na criacao (nao permite cadastrar regra conflitante)
- **Opcao B:** em runtime, sempre aplicar a regra mais restritiva como safety net

**Resposta:** Ambas — em camadas:

```
CAMADA 1 — Configuracao (Opcao A — hard block):
  Conflito detectado ao salvar regra → sistema BLOQUEIA
  Admin nao pode seguir — precisa resolver o conflito antes de cadastrar

CAMADA 2 — Runtime (Opcao B — safety net):
  Se por qualquer motivo (bug) um conflito existir em producao
  → motor sempre aplica a regra mais restritiva
  → campo priority removido do modelo de dados
```

---

## MOD-008 — Integracao Dinamica Protheus/TOTVS

- [x] **Herda behavior_routines do MOD-007** *(RESOLVIDA — 2026-03-15)*
- [x] **Outbox Pattern + BullMQ — concurrency e retry parametrizaveis** *(RESOLVIDA — 2026-03-15)*
- [x] **DLQ com reprocessamento exigindo justificativa** *(RESOLVIDA — 2026-03-15)*

### Decisao — Heranca MOD-007 e contrato com o WS Protheus

**Contexto discutido:** a rotina de integracao e cadastro dinamico, nao codigo fixo. Exemplo real:

```
Rotina: ROT-PV-INCLUSAO
  Servico: PROTHEUS-PROD
  Endpoint: POST /WSRESTPV001/PedidoVenda
  Disparada quando: case.stage_transitioned → estagio "PO Emitida"

  Mapeamentos:
    caso.numero_pedido → C5_NUM
    caso.filial        → C5_FILIAL  (derivado do tenant)
    caso.valor_total   → C5_VALOR
    "PV"               → C5_TIPO    (valor fixo)
```

**Resposta:** WS Protheus configurado para aceitar os campos encaminhados. Se um campo for encaminhado ele sera sempre processado. **Mapeamento da rotina e a fonte da verdade** — o que esta mapeado vai, o que nao esta nao vai. Validacao ocorre antes da chamada HTTP.

### Decisao — Outbox + BullMQ — concurrency e retry

**Contexto:** Protheus tem limitacao de conexoes simultaneas. Solucao: parametros configuraveis.

**Resposta:** Ambos os parametros configuraveis, em niveis diferentes:

| Parametro | Onde configura | Por que |
|---|---|---|
| `concurrency` global | Variavel de ambiente `INTEGRATION_CONCURRENCY` | Ajustado por ops/devops sem deploy. Conservador nos testes, aumenta conforme ambiente suporta. |
| `retry_max` | Por rotina na UX-INTEG-001 | Cada integracao pode ter tolerancia diferente |
| `retry_backoff_ms` | Por rotina na UX-INTEG-001 | Backoff configuravel junto com retry |

**DLQ:** apos `retry_max` esgotado (qualquer valor configurado).

### Decisao — DLQ com justificativa

**Resposta:** Confirmado. Justificativa minima de 10 chars obrigatoria para reprocessar qualquer chamada em DLQ.

---

## MOD-009 — Controle de Movimentos Sob Aprovacao

- [x] **Middleware interceptor para motor de controle** *(RESOLVIDA — 2026-03-15)*
- [x] **Resposta 202 quando movimento PENDING** *(RESOLVIDA — 2026-03-15)*
- [x] **Override com justificativa min. 20 chars + auditoria** *(RESOLVIDA — 2026-03-15)*
- [x] **Segregacao: solicitante != aprovador** *(RESOLVIDA — 2026-03-15)*

### Decisao — Middleware interceptor

**Pergunta:** Operacao bloqueada ate aprovacao quando regra incide?

**Resposta:** Confirmado.

```
Usuario/API/MCP tenta executar operacao
        |
        v
Middleware chama POST /movement-engine/evaluate
        |
   controlled=false → executa normalmente
   controlled=true  → retorna 202, operacao NAO executada
```

### Decisao — Resposta 202

**Resposta:** Confirmado. HTTP 202 + `{ movement_id, status: "PENDING_APPROVAL", message: "Operacao enviada para aprovacao." }` retornado ao chamador quando operacao e interceptada.

### Decisao — Override com justificativa

**Resposta:** Confirmado. Minimo 20 caracteres obrigatorio. Registrado permanentemente em `movement_override_log` com quem fez, quando e a justificativa.

### Decisao — Segregacao solicitante != aprovador

**Pergunta:** O solicitante nunca pode aprovar o proprio movimento?

**Resposta:** Segregacao padrao mantida, **com excecao de auto-aprovacao por suficiencia de scope:**

> "Se eu tenho permissao para aprovar e incluir, o sistema deve criar o registro e na sequencia aprovar. Exemplo: sou gestor e nao tenho superior para aprovar no sistema."

```
REGRA GERAL:
  solicitante != aprovador (segregacao padrao)

EXCECAO — Auto-aprovacao por suficiencia:
  SE o solicitante tem o scope de aprovacao exigido
  pela regra de alcada do proprio movimento
  ENTAO sistema cria o movimento e aprova automaticamente
  SEM passar pelo inbox de aprovacao
  Registrado em movement_history como AUTO_APPROVED_BY_SCOPE
```

---

## MOD-010 — MCP e Automacao Governada

- [x] **API key 256 bits, bcrypt >= 12 rounds, retornada uma unica vez** *(RESOLVIDA — 2026-03-15)*
- [x] **Blocklist de escopos — agentes nunca herdam do owner** *(RESOLVIDA — 2026-03-15)*
- [x] **3 politicas de execucao: DIRECT, CONTROLLED, EVENT_ONLY** *(RESOLVIDA — 2026-03-15)*
- [x] **Deteccao de privilege escalation + alerta** *(RESOLVIDA — 2026-03-15)*

### Decisao — API key modelo GitHub

**Pergunta:** API key de 256 bits, mostrada uma unica vez na criacao, armazenada apenas como hash bcrypt — confirma?

**Resposta:** Confirmado. Modelo de tokens de acesso pessoal do GitHub. Perda = revogar e gerar nova. Nunca recuperavel apos a criacao.

### Decisao — Blocklist de escopos em duas fases

**Pergunta:** Agentes nunca herdam permissoes decisorias do usuario vinculado?

**Resposta:** Confirmado com evolucao em duas fases:

**Fase 1 — agora (blocklist completa):**
```
Permanentemente bloqueados em TODAS as fases:
  *:delete       → exclusao nunca permitida a agentes
  *:approve      → aprovacao nunca permitida a agentes
  approval:decide
  approval:override
  *:sign
  *:execute
```

**Fase 2 — apos MCP testado e validado em producao:**
```
Pode ser liberado por agente especifico (nao global):
  *:create → inclusao liberavel apos validacao

Condicoes para liberacao:
  → MCP testado e validado em producao
  → Aprovacao explicita do owner (Marcos Sulivan)
  → Configuracao por agente especifico — nao liberacao global
  → Registro em auditoria com data e motivo
```

> "*:delete e *:approve permanecem bloqueados independente da fase."

### Decisao — 3 politicas de execucao

**Resposta:** Confirmadas.

| Politica | Comportamento | Exemplo |
|---|---|---|
| `DIRECT` | Executa imediatamente | Consultar status de um caso |
| `CONTROLLED` | Gera movimento MOD-009 — humano aprova | Criar pedido de compra |
| `EVENT_ONLY` | Registra evento sem executar nada | Notificar que algo foi detectado |

### Decisao — Privilege escalation

**Resposta:** Confirmado: `sensitivity_level=2` (alto) + alerta no monitor UX-MCP-002.

---

## MOD-011 — SmartGrid

- [x] **PEND-SGR-01** — Contrato de mapeamento: resultado do motor → estado visual da linha *(RESOLVIDA — 2026-03-15, decisoes 1-3)*
- [x] **PEND-SGR-02** — Suporte a `current_record_state` no motor MOD-007-F03 *(RESOLVIDA — 2026-03-15, decisoes 4-5)*
- [x] Dependencia em MOD-007-F03, F01, F02 — confirmadas como dependencias de sequencia *(REGISTRADAS — 2026-03-15)*
- [x] 3 Screen Manifests promovidos de DRAFT → **READY** (UX-SGR-001, UX-SGR-002, UX-SGR-003) — 2026-03-15

> Detalhamento completo das 5 decisoes em `MOD-011-Decisoes-PEND-SGR.md`.

---

## Resumo Geral

| Modulo | Pendencias tecnicas | Status |
|---|---|---|
| MOD-003 | 2 | ✅ Todas resolvidas |
| MOD-004 | 3 | ✅ Todas resolvidas |
| MOD-005 | 2 | ✅ Todas resolvidas |
| MOD-006 | 3 | ✅ Todas resolvidas |
| MOD-007 | 4 | ⚠️ 1 pendente (PENDENTE-012) |
| MOD-008 | 3 | ✅ Todas resolvidas |
| MOD-009 | 4 | ✅ Todas resolvidas |
| MOD-010 | 4 | ✅ Todas resolvidas |
| MOD-011 | 5 | ✅ Todas resolvidas (sessao anterior) |

**1 pendência técnica aberta:** MOD-007 PENDENTE-012 (BR-004 — precedência OBR/OPC/AUTO na resolução de conflitos, severidade MÉDIA, não bloqueia v1). Demais módulos com todas as pendências resolvidas. Aprovação formal do owner Marcos Sulivan permanece como gate de processo antes do scaffold.

---

*34 decisoes registradas · 9 modulos · Sessao 2026-03-15*

---

## Cadeia de Dependencias Critica

### Visao Geral

```
MOD-000 (Foundation)
  └─> MOD-001/002 (UX Shell + Usuarios)
       └─> MOD-003 (Org) ─> MOD-004 (Identidade)
            └─> MOD-005 (Processos) ─> MOD-006 (Casos)
                 └─> MOD-007 (Params) ─> MOD-008 (Integracao)
                 │    └─> MOD-011 (SmartGrid) [consome motor MOD-007]
                      └─> MOD-009 (Aprovacoes) ─> MOD-010 (MCP)
```

### Detalhamento de Cada Elo

#### MOD-000 (Foundation) ─> Todos os modulos

MOD-000 e a base de toda a cadeia. Fornece:

| Artefato           | Feature    | Consumido por                           |
|--------------------|------------|-----------------------------------------|
| `users` table      | F05        | Todos (created_by, owner, etc.)         |
| `tenants` table    | F07        | MOD-003 (org_unit_tenant_links)         |
| `roles` table      | F06        | MOD-004, MOD-009                        |
| `role_scopes`      | F06        | Todos (validacao de permissao)          |
| `tenant_users`     | F09        | MOD-004, MOD-006                        |
| Catalogo de scopes | F12        | Todos (cada modulo faz amendment)       |
| Domain events infra| F14        | Todos (emit/listen de eventos)          |
| Auth endpoints     | F01, F04   | MOD-001 (login, logout, forgot, reset)  |
| `auth_me` endpoint | F08        | MOD-001 (perfil + saudacao)             |

**Impacto se MOD-000 atrasar:** Bloqueio total. Nenhum modulo pode iniciar sem F05, F06, F07, F12.

---

#### MOD-001/002 (UX Shell + Usuarios) ─> MOD-003

MOD-001 fornece o Application Shell (layout, sidebar, router) que todos os modulos UX subsequentes utilizam como container.

- **MOD-001-F01:** Auth Shell + Layout (manifests UX-AUTH-001, UX-SHELL-001)
- **MOD-001-F03:** Dashboard (manifest UX-DASH-001)
- **MOD-002:** Gestao de usuarios (API backend em MOD-000-F05)

**Impacto se MOD-001 atrasar:** Todas as features UX de MOD-003 a MOD-010 ficam sem container. Backend pode avancar independente.

---

#### MOD-003 (Org) ─> MOD-004, MOD-005, MOD-006, MOD-007, MOD-009

MOD-003 cria a hierarquia organizacional (N1-N4) e vincula tenants (N5).

| Artefato consumido       | Tabela/API             | Quem consome                          |
|--------------------------|------------------------|---------------------------------------|
| Unidades organizacionais | `org_units`            | MOD-004 (user_org_scopes.org_unit_id) |
| Arvore hierarquica       | GET `/org-units/tree`  | MOD-004-F03 (UX breadcrumb)          |
| Contexto organizacional  | `org_units.id`         | MOD-006 (case.org_unit_id)           |
| Enquadramento contextual | `org_units`            | MOD-007 (framers de contexto)        |
| Alcada por nivel org     | `org_units`            | MOD-009 (approver_type=ORG_LEVEL)    |

**Eventos emitidos:** `org.unit_created`, `org.unit_updated`, `org.unit_deleted`, `org.tenant_linked`, `org.tenant_unlinked`

**Dependencias proprias:**
- MOD-000-F07 (`tenants` para N5)
- MOD-000-F12 (amendment: `org:unit:read`, `org:unit:write`, `org:unit:delete`)

**Impacto se MOD-003 atrasar:** MOD-004 nao pode vincular usuarios a unidades. MOD-009 nao pode usar alcada por nivel organizacional.

---

#### MOD-004 (Identidade) ─> MOD-006, MOD-009, MOD-010

MOD-004 gerencia escopos usuario-organizacao, compartilhamentos e delegacoes.

| Artefato consumido      | Tabela/API              | Quem consome                           |
|-------------------------|-------------------------|----------------------------------------|
| Escopos org do usuario  | `user_org_scopes`       | MOD-006 (validacao de papel no caso)   |
| Delegacoes temporarias  | `access_delegations`    | MOD-006-F02 (case_assignments.delegation_id) |
| Shares formais          | `access_shares`         | MOD-009 (aprovadores delegados)        |
| Bloqueio de scopes      | Regra de negocio        | MOD-010 (agents nao herdam approval scopes) |

**Eventos emitidos:** `identity.org_scope_granted/revoked/expired`, `identity.share_created/revoked/expired`, `identity.delegation_created/revoked/expired`

**Background job:** `expire_identity_grants` (BullMQ, ciclo 5min) — expira shares e delegacoes com `valid_until < now()`

**Dependencias proprias:**
- MOD-003-F01 (`org_units` para user_org_scopes)
- MOD-000-F06 (`roles` para heranca de scopes)
- MOD-000-F12 (amendment: 5 novos scopes de identidade)

**Impacto se MOD-004 atrasar:** MOD-006 nao pode atribuir responsaveis com delegacao. MOD-010 perde a regra de bloqueio de escopos.

---

#### MOD-005 (Processos Blueprint) ─> MOD-006

MOD-005 define a estrutura de processos (ciclos, macroetapas, estagios, gates, papeis, transicoes). MOD-006 executa instancias desses blueprints.

| Artefato consumido       | Tabela                   | Quem consome                    |
|--------------------------|--------------------------|---------------------------------|
| Ciclos publicados        | `process_cycles`         | MOD-006-F01 (cycle_version_id) |
| Macroetapas              | `process_macro_stages`   | MOD-006-F03 (barra progresso)  |
| Estagios                 | `process_stages`         | MOD-006-F01 (current_stage_id) |
| Gates                    | `process_gates`          | MOD-006-F02 (gate_instances)   |
| Papeis                   | `process_roles`          | MOD-006-F02 (case_assignments) |
| Vinculos estagio-papel   | `stage_role_links`       | MOD-006-F01 (validacao papel)  |
| Transicoes               | `stage_transitions`      | MOD-006-F01 (motor transicao)  |

**Eventos emitidos:** `process.cycle_created/published/forked/deprecated`, `process.macro_stage_created`, `process.stage_created`

**Regra critica:** Ciclos PUBLISHED sao imutaveis. Qualquer alteracao exige fork (nova versao).

**4 tipos de gate:** APPROVAL (exige can_approve), DOCUMENT, CHECKLIST, INFORMATIVE

**Dependencias proprias:**
- MOD-000-F12 (amendment: 4 novos scopes de processo)

**Impacto se MOD-005 atrasar:** MOD-006 nao pode abrir casos — sem blueprint nao ha instancia.

---

#### MOD-006 (Casos) ─> MOD-007, MOD-008, MOD-009, MOD-010

MOD-006 e o modulo central de execucao. Seus domain events disparam acoes em 4 modulos downstream.

| Artefato consumido         | Tabela/API/Evento              | Quem consome                           |
|----------------------------|--------------------------------|----------------------------------------|
| Eventos de transicao       | `case.stage_transitioned`      | MOD-008-F03 (trigger_events dispatch)  |
| Instancias de caso         | `case_instances`               | MOD-008-F03 (integration_call_logs.case_id) |
| Motor de transicao (hook)  | Step 5 do motor                | MOD-007-F03 (chama /routine-engine/evaluate) |
| Operacoes de caso          | API `/cases/:id/*`             | MOD-009-F02 (movement control intercept) |
| Acoes sobre casos          | API `/cases/:id/*`             | MOD-010-F02 (MCP gateway dispatch)     |

**Motor de transicao (5 etapas):**
1. Caso existe e nao esta terminal/cancelado
2. Transicao e valida (existe em stage_transitions)
3. Usuario tem papel exigido (stage_role_links)
4. Todos os gates estao resolvidos
5. Evidencias obrigatorias estao presentes

**Eventos emitidos:** `case.opened`, `case.stage_transitioned`, `case.completed`, `case.cancelled`, `case.on_hold`, `case.resumed`, `case.gate_resolved`, `case.gate_waived`, `case.assignment_created`, `case.assignment_replaced`, `case.event_recorded`

**Regra critica:** `cycle_version_id` congelado na abertura — o caso sempre usa o blueprint da versao em que foi criado.

**Dependencias proprias:**
- MOD-005-F01 e F02 (blueprint completo)
- MOD-004-F02 (`access_delegations` para assignments)
- MOD-003-F01 (`org_units` para case.org_unit_id)

**Impacto se MOD-006 atrasar:** MOD-007 perde o hook de avaliacao. MOD-008 perde o trigger de integracao. MOD-009 perde operacoes para interceptar.

---

#### MOD-007 (Params) ─> MOD-006 (runtime), MOD-008, MOD-011

MOD-007 define parametrizacao contextual e rotinas de comportamento. Tem integracao runtime bidirecional com MOD-006 e MOD-011.

| Artefato consumido         | Tabela/API                          | Quem consome                        |
|----------------------------|-------------------------------------|-------------------------------------|
| Motor de avaliacao         | POST `/routine-engine/evaluate`     | MOD-006-F01 (step 5 do motor)      |
| Motor de avaliacao         | POST `/routine-engine/evaluate`     | MOD-011 (1x por linha da grade)    |
| blocking_validations       | Resposta do motor                   | MOD-006-F01 (bloqueia com 422)     |
| blocking_validations       | Resposta do motor                   | MOD-011-F02/F03/F04 (estado visual)|
| behavior_routines (heranca)| `behavior_routines` table           | MOD-008-F01 (routine_type=INTEGRATION) |
| Versionamento de rotinas   | `routine_version_history`           | MOD-008-F02 (herda modelo)         |
| context_framers (OPERACAO) | `context_framers` table             | MOD-011 (configura colunas grade)  |
| routine_items (5 tipos)    | `routine_items` table               | MOD-011 (FIELD_VIS, REQ, DEF, DOM, VAL) |

**Motor de avaliacao (5 etapas — cache Redis removido em 2026-03-15, decisao MOD-011 #4):**
1. Encontra regras de incidencia aplicaveis ao contexto
2. Resolve rotinas vinculadas (PUBLISHED only)
3. Merge de conflitos (regra mais restritiva vence — campo `priority` removido)
4. Avalia itens da rotina (7 tipos: FIELD_VISIBILITY, REQUIRED, DEFAULT, DOMAIN, DERIVATION, VALIDATION, EVIDENCE)
5. Retorna resultado com blocking_validations

**7 tipos de item de rotina:**
- FIELD_VISIBILITY — visibilidade de campos
- REQUIRED — campos obrigatorios
- DEFAULT — valores padrao
- DOMAIN — dominio de valores
- DERIVATION — calculo derivado
- VALIDATION (is_blocking) — validacao que pode bloquear
- EVIDENCE — evidencias exigidas

**Eventos emitidos:** `param.framer_type_created`, `param.framer_created/expired`, `param.incidence_rule_created/updated`, `routine.applied`

**Dependencias proprias:**
- MOD-000-F12 (amendment: 7 novos scopes)

**Impacto se MOD-007 atrasar:** MOD-006 perde parametrizacao contextual nas transicoes. MOD-008 nao tem modelo de rotinas para herdar. MOD-011 fica totalmente bloqueado (depende do motor para todas as features).

---

#### MOD-008 (Integracao) ─> MOD-009, MOD-010

MOD-008 executa integracoes com Protheus/TOTVS via BullMQ e Outbox Pattern.

| Artefato consumido          | Tabela/API                          | Quem consome                        |
|-----------------------------|-------------------------------------|-------------------------------------|
| Rotinas de integracao       | `integration_routines`              | MOD-009 (movement control sobre execucao) |
| Logs de execucao            | `integration_call_logs`             | MOD-010 (MCP pode vincular acoes)  |
| Servicos cadastrados        | `integration_services`              | MOD-010 (MCP actions linkam servicos) |

**Arquitetura de execucao:**
- **Outbox Pattern:** INSERT log na mesma transacao de negocio (garante zero perda)
- **BullMQ:** concurrency via env var `INTEGRATION_CONCURRENCY` (default 10), sem retry interno (gerenciado pelo Outbox)
- **Retry:** exponential backoff `2^(attempt-1)` segundos
- **DLQ:** apos `retry_max` tentativas, move para Dead Letter Queue
- **Reprocessamento:** cria novo log com `parent_log_id`, exige justificativa (min 10 chars)

**trigger_events:** array configuravel — ex: `["case.stage_transitioned"]` dispara integracao automaticamente

**Eventos emitidos:** `integration.service_created/updated`, `integration.routine_configured`, `integration.call_queued/completed/failed/dlq/reprocessed`

**Dependencias proprias:**
- MOD-007-F01/F02 (`behavior_routines` com `routine_type=INTEGRATION`)
- MOD-006-F01 (domain events como trigger)
- MOD-000-F12 (amendment: 6 novos scopes)

**Impacto se MOD-008 atrasar:** Integracoes Protheus/TOTVS nao funcionam. MOD-010 perde acoes de integracao no catalogo MCP.

---

#### MOD-009 (Aprovacoes) ─> MOD-010

MOD-009 intercepta operacoes criticas e exige aprovacao por alcada.

| Artefato consumido          | Tabela/API                          | Quem consome                        |
|-----------------------------|-------------------------------------|-------------------------------------|
| Motor de controle           | POST `/movement-engine/evaluate`    | MOD-010-F02 (policy=CONTROLLED)    |
| Regras de controle          | `movement_control_rules`            | MOD-010-F02 (avaliacao de acoes MCP) |
| Inbox de aprovacoes         | GET `/my/approvals`                 | MOD-010-F05 (link UX-APROV-001)    |

**4 criterios de aprovacao:**
1. **Valor** — threshold monetario (value_threshold)
2. **Hierarquia** — nivel organizacional do aprovador (approver_type=ORG_LEVEL)
3. **Origem** — tipo de origem da operacao (origin_type: UI, API, MCP, BATCH)
4. **Objeto+Operacao** — tipo do objeto + tipo da operacao

**Fluxo do motor:**
1. Recebe operacao via middleware
2. Avalia regras aplicaveis (multiplas regras: apenas a de menor prioridade incide)
3. `controlled=false` → operacao executa livremente
4. `controlled=true` → cria `controlled_movement` + `approval_instances` nivel 1
5. Retorna 202 com `movement_id`
6. Aprovacao nivel 1 → auto-cria nivel 2 (se cadeia tem mais niveis)
7. Ultimo nivel aprovado → executa operacao original

**Regras de segregacao:**
- `solicitante != aprovador` (regra geral — validacao no service). Excecao: auto-aprovacao por suficiencia de escopo (`AUTO_APPROVED_BY_SCOPE`) — ver US-MOD-009 §3.1
- Override exige scope especial + justificativa min 20 chars + auditoria completa

**Eventos emitidos:** `movement.created/approved/rejected/executed/failed/cancelled/overridden/escalated/timeout`

**Dependencias proprias:**
- MOD-003-F01 (`org_units` para approver_type=ORG_LEVEL)
- MOD-000-F06 (`roles` para approver_type=ROLE)
- MOD-000-F12 (amendment: 7 novos scopes incl. `approval:decide`, `approval:override`)

**Impacto se MOD-009 atrasar:** MOD-010 perde governanca — agentes MCP com policy CONTROLLED executam sem controle.

---

#### MOD-010 (MCP) ─> Modulo Final (cadeia principal)

MOD-010 e o ultimo elo da cadeia principal. Nao possui dependentes.

**Dependencias diretas:**
- MOD-009-F02 (`/movement-engine/evaluate` para policy=CONTROLLED)
- MOD-000-F12 (amendment: 6 novos scopes)
- MOD-004 (regra: agentes NUNCA herdam escopos de aprovacao do owner)

**3 politicas de execucao (dispatch):**

| Politica      | Comportamento                              | Resposta |
|---------------|--------------------------------------------|----------|
| DIRECT        | Executa imediatamente sem aprovacao        | 200      |
| CONTROLLED    | Cria movimento via MOD-009 motor           | 202      |
| EVENT_ONLY    | Emite evento sem escrita no banco          | 200      |

**Gateway (8 etapas de autenticacao):**
1. Extrai API key do header
2. bcrypt compare (rounds >= 12)
3. Valida agente ativo (status=ACTIVE)
4. Valida acao no catalogo
5. Valida link agente-acao (mcp_agent_action_links)
6. Valida scopes do agente (exclui blocklist)
7. Detecta privilege escalation → alerta (sensitivity=2)
8. Dispatch conforme politica

**Blocklist de escopos (agentes NUNCA recebem):**
- `*:delete` ← adicionado (decisao 2026-03-15)
- `*:approve`
- `approval:decide`
- `approval:override`
- `*:sign`
- `*:execute`

**Seguranca da API key:**
- 256 bits, gerada uma unica vez (retornada apenas no POST de criacao)
- Armazenada como hash bcrypt (rounds >= 12)
- Nunca retornada em GET
- Rotacao invalida a key anterior imediatamente

---

#### MOD-011 (SmartGrid) ─> Componente UX Transversal

MOD-011 e um componente UX puro de grade editavel com operacoes em massa. Consome exclusivamente o motor do MOD-007 e nao possui backend proprio (apenas amendment no MOD-007-F03).

| Artefato consumido                | Tabela/API                          | Como consome                          |
|-----------------------------------|-------------------------------------|---------------------------------------|
| Motor de avaliacao                | POST `/routine-engine/evaluate`     | 1 chamada por linha da grade          |
| Enquadradores de operacao         | `context_framers` (OPERACAO)        | Configura colunas visiveis da grade   |
| Itens de rotina                   | `routine_items`                     | FIELD_VISIBILITY, REQUIRED, DEFAULT, DOMAIN, VALIDATION |
| **Amendment:** current_record_state| Body do `/routine-engine/evaluate` | F03 (alteracao) e F04 (exclusao)      |

**Tipo de modulo:** UX-only (nao cria tabelas proprias, nao emite domain events proprios)

**Natureza:** Componente reutilizavel — qualquer modulo futuro que precise de inclusao/alteracao/exclusao em massa utilizara o SmartGrid.

**Relacao com MOD-007 (bidirecional em design):**
- MOD-011 **consome** o motor do MOD-007 (read-only)
- MOD-011-F01 **amenda** o motor do MOD-007-F03 (adiciona `current_record_state`)
- A resposta do motor define: campos visiveis, obrigatorios, defaults, dominio, validacoes

**3 telas (Screen Manifests):**

| Manifest       | Tela                      | Rota                                   | Status |
|----------------|---------------------------|----------------------------------------|--------|
| UX-SGR-001     | Grade de Inclusao em Massa| `/{modulo}/{rotina}/inclusao-em-massa` | **READY** |
| UX-SGR-002     | Formulario de Alteracao   | `/{modulo}/{rotina}/{id}/alterar`      | **READY** |
| UX-SGR-003     | Grade de Exclusao em Massa| `/{modulo}/{rotina}/exclusao-em-massa` | **READY** |

**Regras criticas:**
- Motor chamado **1 linha por vez** (nunca batch)
- "Save" habilitado apenas com **100% linhas validas** (✅)
- Exclusao sempre **logica** (`deleted_at` + `status=INACTIVE`)
- Campos bloqueados por condicao ficam **readonly com icone** (nunca ocultos)
- Formulario de alteracao sempre em **rota separada** (nunca inline na grade)
- Sem persistencia de draft server-side (tudo client-side)

**Dependencias proprias:**
- MOD-007-F03 (`/routine-engine/evaluate`)
- MOD-007-F01 (`context_framers` com `framer_type=OPERACAO`)
- MOD-007-F02 (`routine_items` — 5 dos 7 tipos)
- MOD-000-F14 (`domain_events` para log de alteracoes)

**Impacto se MOD-011 atrasar:** Nenhum modulo depende diretamente do MOD-011, mas futuras telas de operacao em massa ficam sem componente padronizado.

---

### Matriz de Dependencias Cruzadas

```
            000  001  003  004  005  006  007  008  009  010  011
MOD-000      -    .    .    .    .    .    .    .    .    .    .
MOD-001     <<<   -    .    .    .    .    .    .    .    .    .
MOD-003     <<<   .    -    .    .    .    .    .    .    .    .
MOD-004     <<<   .   <<<   -    .    .    .    .    .    .    .
MOD-005     <<<   .    .    .    -    .    .    .    .    .    .
MOD-006     <<<   .   <<<  <<<  <<<   -    .    .    .    .    .
MOD-007     <<<   .    .    .    .   <->   -    .    .    .    .
MOD-008     <<<   .    .    .    .   <<<  <<<   -    .    .    .
MOD-009     <<<   .   <<<   .    .    .    .    .    -    .    .
MOD-010     <<<   .    .   <<<   .    .    .    .   <<<   -    .
MOD-011     <<<   .    .    .    .    .   <->   .    .    .    -

<<< = depende de          <-> = bidirecional (runtime/amendment)
```

### Chamadas de API entre Modulos (Runtime)

| Origem     | Destino    | Endpoint                       | Quando                              |
|------------|------------|--------------------------------|-------------------------------------|
| MOD-006-F01| MOD-007-F03| POST /routine-engine/evaluate  | Step 5 do motor de transicao        |
| MOD-010-F02| MOD-009-F02| POST /movement-engine/evaluate | Acao MCP com policy=CONTROLLED      |
| MOD-008-F03| MOD-006    | Listen case.stage_transitioned | Trigger de integracao automatica    |
| MOD-011-F02| MOD-007-F03| POST /routine-engine/evaluate  | 1x por linha na grade (sem current_record_state) |
| MOD-011-F03| MOD-007-F03| POST /routine-engine/evaluate  | Avaliacao com current_record_state (alteracao)   |
| MOD-011-F04| MOD-007-F03| POST /routine-engine/evaluate  | Validacao pre-exclusao com current_record_state  |

### Background Jobs Criticos

| Modulo  | Job                        | Engine  | Ciclo   | Funcao                              |
|---------|----------------------------|---------|---------|-------------------------------------|
| MOD-004 | expire_identity_grants     | BullMQ  | 5 min   | Expira shares/delegacoes vencidas   |
| MOD-007 | expire_framers             | BullMQ  | 5 min   | Expira enquadradores vencidos       |
| MOD-008 | integration-execution      | BullMQ  | on-demand| Executa integracoes (Outbox+retry)  |
| MOD-009 | escalate_approvals         | BullMQ  | config  | Escala aprovacoes com timeout       |

### Amendments ao Catalogo de Scopes (MOD-000-F12)

Cada modulo adiciona scopes ao catalogo central:

| Modulo  | Scopes adicionados                                                                 |
|---------|------------------------------------------------------------------------------------|
| MOD-003 | `org:unit:read`, `org:unit:write`, `org:unit:delete`                               |
| MOD-004 | `identity:org_scope:read/write`, `identity:share:read/write/revoke`                |
| MOD-005 | `process:cycle:read/write/publish/delete`                                          |
| MOD-006 | `process:case:read/write/cancel`, `process:case:gate_resolve/gate_waive/assign`    |
| MOD-007 | `param:framer:read/write/delete`, `param:routine:read/write/publish`, `param:engine:evaluate` |
| MOD-008 | `integration:service:read/write`, `integration:routine:write/execute`, `integration:log:read/reprocess` |
| MOD-009 | `approval:rule:read/write`, `approval:engine:evaluate`, `approval:movement:read/write`, `approval:decide`, `approval:override` |
| MOD-010 | `mcp:agent:read/write/revoke`, `mcp:action:read/write`, `mcp:log:read`            |

---

## Pendencias Transversais

### 1. MOD-001 — Rollback de READY para TODO (2026-03-15)

**MOD-001 teve rollback de READY para TODO em 2026-03-15.**

Impactos potenciais:
- [ ] Todas as features UX de MOD-003 a MOD-011 dependem do Application Shell (MOD-001-F01)
- [ ] Sem o shell, as telas dos modulos nao tem container (sidebar, router, layout)
- [ ] **Mitigacao possivel:** backend de MOD-003 a MOD-010 pode avancar independente do shell UX
- [ ] Necessario estabilizar MOD-001 antes de iniciar qualquer feature UX dos modulos subsequentes
- [ ] Investigar causa do rollback e definir prazo para re-promocao a READY

### 2. ~~PEND-SGR-01 — Contrato motor → estado visual (MOD-011)~~ ✅ RESOLVIDA (2026-03-15)

- [x] Definir mapeamento formal: `blocking_validations[]` → ❌, `validations[]` → ⚠️, vazio → ✅
- [x] Definir se warnings permitem ou bloqueiam save — **Decisao: ⚠️ nao bloqueia save, ❌ bloqueia**
- [x] Definir regras de tooltip/mensagem por tipo de validacao — **Decisao: celula vermelha + tooltip (erro com field), linha inteira (erro sem field)**
- [x] ~~**Bloqueia:** MOD-011-F02 (Grade Inclusao), manifest UX-SGR-001~~ Desbloqueados
- [x] **Responsavel:** Arquitetura — 3 decisoes registradas (esquema visual 4 estados confirmado)

### 3. ~~PEND-SGR-02 — Amendment current_record_state no motor MOD-007 (MOD-011)~~ ✅ RESOLVIDA (2026-03-15)

- [x] Aprovar amendment no POST `/routine-engine/evaluate`
- [x] Campo `current_record_state` nullable no body (backward compatible)
- [x] ~~Cache Redis bypass quando presente~~ — **Decisao 4: cache Redis removido do motor inteiro (operacoes criticas exigem consistencia)**
- [x] Campos ausentes no state → condition avalia como `false` — **Decisao 5: confirmada. Linhas novas nao afetadas por condition_expr**
- [x] ~~**Bloqueia:** MOD-011-F01, F03, F04, manifests UX-SGR-002 e UX-SGR-003~~ Desbloqueados, manifests promovidos a READY
- [x] **Responsavel:** Arquitetura — 2 decisoes registradas

---

## Decisoes Tecnicas Consolidadas — 2026-03-15

34 decisoes tecnicas + 1 transversal registradas em sessao de 2026-03-15. Owner universal: Marcos Sulivan.

Decisoes integradas aos US files em 2026-03-16 (v1.1.0):

| Modulo | Decisoes | Impacto principal |
|--------|----------|-------------------|
| MOD-003 | 3 | SLA ajustado 500→100 nos + cache strategy |
| MOD-004 | 4 | Segregacao authorized_by → validacao por scope (`identity:share:authorize`) |
| MOD-005 | 3 | Editor visual 50 nos confirmado, mini-mapa obrigatorio ≥15 nos |
| MOD-006 | 4 | Confirmados (motor 5 etapas, cycle_version frozen) |
| MOD-007 | 4 | Campo `priority` removido, conflito em 2 camadas, cache Redis removido |
| MOD-008 | 4 | Concurrency via env var `INTEGRATION_CONCURRENCY`, principio mapeamento WS |
| MOD-009 | 5 | Auto-aprovacao por suficiencia de escopo (`AUTO_APPROVED_BY_SCOPE`) |
| MOD-010 | 5 | Blocklist expandida (*:delete), 2 fases, sensitivity_level=2 |
| MOD-011 | 5 | Ja integradas em sessao anterior (PEND-SGR-01, PEND-SGR-02) |

**Referencia:** Documento "Registro de Decisoes — MOD-003 a MOD-011" (2026-03-15)
