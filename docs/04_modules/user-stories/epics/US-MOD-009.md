# US-MOD-009 — Controle de Movimentos Sob Aprovação (Épico)

**Status Ágil:** `APPROVED`
**Versão:** 1.2.0
**Data:** 2026-03-19
**Autor(es):** Produto + Arquitetura
**Módulo Destino:** **MOD-009** (Aprovações e Alçadas)
**Épico de Negócio:** EP08

## Metadados de Governança

- **status_agil:** APPROVED
- **owner:** Marcos Sulivan
- **data_ultima_revisao:** 2026-03-19
- **rastreia_para:** EP08, doc 04_Integracoes_Aprovacoes_e_Automacao_Governada §4–5, US-MOD-004, US-MOD-006, US-MOD-007, US-MOD-008, DOC-DEV-001, DOC-ARC-001, DOC-ARC-003
- **nivel_arquitetura:** 2 (domínio rico, alçadas hierárquicas, rastreabilidade integral)
- **evidencias:** N/A

---

## 1. Contexto e Problema

O sistema permite que operações críticas (criação de pedidos, integrações, exclusões) sejam executadas diretamente, sem controle formal de aprovação. Sem uma camada de **controle de movimentos**, não há como garantir que operações de alto valor, originadas de APIs, agentes MCP ou usuários sem alçada, passem por decisão formal antes de gerar efeito.

> **"A ação pode nascer automaticamente, mas só gera efeito após decisão formal quando a regra assim exigir."**
> **"Origem não é autorização — API, integração sistêmica e MCP podem iniciar solicitações, mas não contornam alçada."**

```
SEM MOD-009:  Usuário/API/MCP → grava diretamente no banco

COM MOD-009:  Usuário/API/MCP → tenta operar
                  │
                  ▼
              Motor de Controle avalia a Regra de Controle de Gravação
                  │
              ┌───┴────────────────────────────────────────────┐
              │ OPERAÇÃO LIVRE                                  │ OPERAÇÃO CONTROLADA
              │ (regra não se aplica)                           │ (regra incide)
              ▼                                                  ▼
          Grava diretamente                             INSERT controlled_movements
                                                         (status=PENDING_APPROVAL)
                                                              │
                                                        Notifica aprovadores
                                                              │
                                                     APROVADO → Executa operação
                                                     REPROVADO → Cancela
                                                     OVERRIDE → Executa com registro
```

---

## 2. MOD-009 vs MOD-006 Gates — Diferença Fundamental

| | MOD-006 Gates | MOD-009 Movimentos |
|---|---|---|
| **Contexto** | Dentro de um fluxo de processo | Qualquer operação crítica (com ou sem processo) |
| **Disparo** | Transição de estágio | Tentativa de escrita/execução de ação |
| **Objeto** | Estágio do processo | Qualquer objeto: pedido, integração, cadastro, caso |
| **Aprovador** | Papel com `can_approve=true` no estágio | Alçada definida por regra (valor, hierarquia, origem) |
| **Efeito da reprovação** | Caso não avança de estágio | A operação não é executada |
| **Resolução offline** | Sempre síncrona à interação do usuário | Pode ser assíncrona (aprovador notificado por email/inbox) |

---

## 3. Regra de Alçada — Os 4 Critérios

Uma `approval_rules` pode usar um ou mais desses critérios em combinação:

```
1. VALOR:      operation_value > threshold (ex: pedido > R$ 50.000 → alçada diretoria)
2. HIERARQUIA: user.org_level < required_level (ex: N3 exige aprovador N2 ou superior)
3. ORIGEM:     origin_type IN ['API', 'MCP', 'AGENT'] → sempre exige aprovação humana
4. OBJETO:     object_type + operation_type (ex: DELETE de cadastro_produto → sempre controlado)
```

### 3.1 Exceção de Auto-Aprovação por Suficiência de Escopo

> Decisão técnica 2026-03-15

A segregação padrão (solicitante ≠ aprovador) é mantida como regra geral. Porém, existe uma exceção de eficiência:

> **Se o solicitante possui o scope de aprovação exigido pela alçada do movimento (`required_scope` da `approval_rules`), o sistema cria e aprova automaticamente o movimento sem enviá-lo ao inbox.**

**Fluxo da auto-aprovação:**

1. Motor de controle identifica operação controlada
2. Cria `controlled_movement` (status=PENDING_APPROVAL)
3. Verifica se `requested_by` possui o `required_scope` da `approval_rules` aplicável
4. Se SIM: aprova automaticamente → status passa direto para AUTO_APPROVED → EXECUTED
5. Registra em `movement_history` com event_type=`AUTO_APPROVED_BY_SCOPE`
6. Movimento **não** aparece no inbox de ninguém
7. Se NÃO: fluxo normal de aprovação com inbox

**Condições:**

- O solicitante deve possuir exatamente o `required_scope` exigido pela `approval_rules` da alçada
- O registro em `movement_history` inclui o scope usado como justificativa
- Auditável: todo auto-approve aparece no histórico do movimento

---

## 4. Escopo

### Inclui

- API: Regras de Controle de Gravação (define quais operações são controladas)
- API: Regras de Alçada (define quem aprova e sob quais critérios)
- API: Motor de Controle (intercepta operações e gera movimentos controlados)
- API: Inbox de Aprovações (aprovadores veem e decidem sobre movimentos pendentes)
- API: Execução e Override de Movimentos
- Histórico integral: solicitação, decisão, execução, falha, reprocessamento, cancelamento
- UX: Inbox de Aprovações (UX-APROV-001)
- UX: Configurador de Regras de Controle e Alçada (UX-APROV-002)

### Não inclui

- Gates de processo (dentro de fluxo de estágio) — MOD-006
- Delegação de identidade — MOD-004
- Agentes MCP disparando movimentos — MOD-010 (MCP como origem)
- Revisão periódica de acessos — roadmap Wave 3+

---

## 5. Critérios de Aceite (Épico)

```gherkin
Funcionalidade: Épico Controle de Movimentos MOD-009

  Cenário: Origem não é autorização
    Dado que uma chamada de API tenta executar operação controlada
    E a regra diz "origem API → sempre controlada"
    Quando a chamada é recebida
    Então INSERT controlled_movements (status=PENDING_APPROVAL) — sem executar a operação
    E 202 retornado ao chamador: { movement_id, status: "PENDING_APPROVAL", message: "Aguardando aprovação" }

  Cenário: Valor acima da alçada gera movimento controlado
    Dado que regra define: pedido_venda.valor > 50000 → alçada=DIRETORIA
    E operação tem valor R$ 75.000
    Quando motor de controle avalia
    Então movimento controlado criado para aprovação da DIRETORIA

  Cenário: Override exige scope especial e justificativa
    Dado que movimento está PENDING_APPROVAL
    E usuário tem scope approval:override
    Quando POST /movements/:id/override com { justificativa }
    Então operação é executada imediatamente
    E override registrado no histórico com quem, quando e por quê
    E domain_event: movement.overridden emitido

  Cenário: Segregação padrão — aprovador não pode aprovar o próprio movimento
    Dado que solicitante = aprovador
    E solicitante NÃO possui o required_scope da alçada
    Quando solicitante tenta aprovar seu próprio movimento
    Então 422: "O solicitante não pode aprovar o próprio movimento (segregação de funções)."

  Cenário: Auto-aprovação por suficiência de escopo
    Dado que solicitante possui o required_scope exigido pela alçada do movimento
    Quando motor de controle cria o movimento
    Então movimento é criado E aprovado automaticamente sem passar pelo inbox
    E movement_history registra event_type=AUTO_APPROVED_BY_SCOPE
    E operação é executada imediatamente

  Cenário: Sub-histórias bloqueadas sem aprovação do épico
    Dado que US-MOD-009 está diferente de "APPROVED"
    Então forge-module para qualquer feature é bloqueado
```

---

## 6. Definition of Ready (DoR) ✅

- [x] Diferença MOD-009 vs MOD-006 gates documentada
- [x] 4 critérios de alçada definidos (valor, hierarquia, origem, objeto+operação)
- [x] Princípio "origem não é autorização" documentado
- [x] Segregação de funções: solicitante ≠ aprovador documentada
- [x] Modelo de dados completo (7 tabelas) definido
- [x] Features F01–F05 com Gherkin completo
- [x] Screen Manifests UX-APROV-001, UX-APROV-002 criados
- [x] Novos escopos mapeados para MOD-000-F12
- [x] Owner confirmar READY → APPROVED

## 7. Definition of Done (DoD)

- [ ] F01–F05 aprovadas e scaffoldadas
- [ ] Motor de controle intercepta operação via middleware/hook — testado
- [ ] Segregação solicitante ≠ aprovador — testado (regra geral + exceção auto-aprovação por scope §3.1)
- [ ] Override auditado com justificativa — testado
- [ ] Rastreabilidade integral do histórico (solicitação→decisão→execução) — validada
- [ ] Inbox notifica aprovadores via domain_event → notification queue

---

## 8. Sub-Histórias

```text
US-MOD-009
  ├── F01 ← API: Regras de Controle + Regras de Alçada (configuração)
  ├── F02 ← API: Motor de Controle (interceptação + criação de movimentos)
  ├── F03 ← API: Inbox de Aprovações + Execução + Override
  ├── F04 ← UX: Inbox de Aprovações (UX-APROV-001)
  └── F05 ← UX: Configurador de Regras (UX-APROV-002)
```

| Feature | Tema | Tipo | Status |
|---|---|---|---|
| [US-MOD-009-F01](../features/US-MOD-009-F01.md) | API Regras de controle + alçada | Backend | `APPROVED` |
| [US-MOD-009-F02](../features/US-MOD-009-F02.md) | API Motor de controle (interceptação) | Backend | `APPROVED` |
| [US-MOD-009-F03](../features/US-MOD-009-F03.md) | API Inbox + execução + override | Backend | `APPROVED` |
| [US-MOD-009-F04](../features/US-MOD-009-F04.md) | UX Inbox de aprovações | UX | `APPROVED` |
| [US-MOD-009-F05](../features/US-MOD-009-F05.md) | UX Configurador de regras | UX | `APPROVED` |

---

## 9. Modelo de Dados Completo

### `movement_control_rules` — Regras de Controle de Gravação

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `codigo` | varchar(50) | UNIQUE NOT NULL | Imutável |
| `nome` | varchar(200) | NOT NULL | |
| `object_type` | varchar | NOT NULL | ex: pedido_venda, caso, integration_call |
| `operation_type` | varchar | NOT NULL | CREATE\|UPDATE\|DELETE\|EXECUTE\|INTEGRATE |
| `origin_types` | jsonb | NOT NULL | `["HUMAN","API","MCP","AGENT"]` — origens que disparam controle |
| `value_field` | varchar | nullable | Campo a ser avaliado pelo critério de valor |
| `value_threshold` | numeric | nullable | Limite para critério de valor |
| `status` | varchar | ACTIVE\|INACTIVE | |
| `priority` | integer | default 50 | Menor = avaliado primeiro |
| `valid_from` | timestamp | NOT NULL | |
| `valid_until` | timestamp | nullable | |
| `created_by` | uuid | FK→users | |

### `approval_rules` — Regras de Alçada

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `control_rule_id` | uuid | FK→movement_control_rules NOT NULL | |
| `level` | integer | NOT NULL | 1 = primeiro aprovador, 2 = segundo (aprovação em cadeia) |
| `approver_type` | varchar | ROLE\|USER\|ORG_LEVEL\|SCOPE | Tipo do aprovador |
| `approver_ref` | varchar | NOT NULL | ID do role/user ou nível organizacional |
| `required_scope` | varchar | nullable | Scope RBAC exigido do aprovador |
| `timeout_hours` | integer | nullable | Horas para aprovação automática ou escalada |
| `escalation_rule_id` | uuid | FK→approval_rules, nullable | Para onde escala se timeout |
| `allow_self_approve` | boolean | default false | Controle de auto-aprovação por suficiência de escopo. Default false = segregação padrão. Quando true, habilita auto-aprovação se solicitante possui required_scope (ver §3.1). |

### `controlled_movements` — Movimentos Controlados

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `codigo` | varchar(50) | UNIQUE NOT NULL | ex: MOV-2026-00001 |
| `control_rule_id` | uuid | FK→movement_control_rules NOT NULL | |
| `object_type` | varchar | NOT NULL | Tipo do objeto alvo |
| `object_id` | uuid | nullable | ID do objeto |
| `operation_type` | varchar | NOT NULL | Operação solicitada |
| `origin_type` | varchar | NOT NULL | HUMAN\|API\|MCP\|AGENT |
| `requested_by` | uuid | FK→users NOT NULL | Solicitante |
| `requested_at` | timestamp | NOT NULL | |
| `operation_payload` | jsonb | NOT NULL | Payload original da operação |
| `operation_value` | numeric | nullable | Valor monetário se aplicável |
| `status` | varchar | PENDING_APPROVAL\|APPROVED\|AUTO_APPROVED\|REJECTED\|EXECUTED\|CANCELLED\|OVERRIDDEN\|FAILED | |
| `current_approval_level` | integer | default 1 | Nível atual na cadeia de aprovação |
| `case_id` | uuid | FK→case_instances, nullable | Caso relacionado |
| `correlation_id` | varchar | NOT NULL | Propagado ao executar |
| `cancelled_at` | timestamp | nullable | |
| `cancellation_reason` | text | nullable | |

### `approval_instances` — Instâncias de Aprovação

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `movement_id` | uuid | FK→controlled_movements NOT NULL | |
| `approval_rule_id` | uuid | FK→approval_rules NOT NULL | |
| `level` | integer | NOT NULL | |
| `assigned_to` | uuid | FK→users, nullable | Aprovador específico |
| `status` | varchar | PENDING\|APPROVED\|REJECTED\|TIMEOUT\|ESCALATED | |
| `decided_by` | uuid | FK→users, nullable | |
| `decided_at` | timestamp | nullable | |
| `parecer` | text | nullable | Nota do aprovador |
| `notified_at` | timestamp | nullable | |
| `timeout_at` | timestamp | nullable | Deadline calculado |
| — | | Segregação validada no service layer | Permite exceção de auto-aprovação por scope (§3.1). Log obrigatório em movement_history. |

### `movement_executions` — Execuções de Movimentos

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `movement_id` | uuid | FK→controlled_movements UNIQUE | Um por movimento |
| `executed_by` | uuid | FK→users NOT NULL | |
| `executed_at` | timestamp | NOT NULL | |
| `execution_payload` | jsonb | NOT NULL | Payload final executado |
| `result` | varchar | SUCCESS\|FAILED | |
| `error_message` | text | nullable | |
| `retry_of` | uuid | FK→movement_executions, nullable | Para reexecução |

### `movement_history` — Histórico Integral do Movimento

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `movement_id` | uuid | FK→controlled_movements NOT NULL | |
| `event_type` | varchar | CREATED\|APPROVAL_REQUESTED\|APPROVED\|AUTO_APPROVED_BY_SCOPE\|REJECTED\|EXECUTED\|FAILED\|CANCELLED\|OVERRIDDEN\|ESCALATED\|TIMEOUT | |
| `actor_id` | uuid | FK→users NOT NULL | |
| `event_at` | timestamp | NOT NULL | |
| `payload` | jsonb | nullable | Dados relevantes do evento |

### `movement_override_log` — Registro de Overrides

| Campo | Tipo | Constraint | Descrição |
|---|---|---|---|
| `id` | uuid | PK | |
| `movement_id` | uuid | FK→controlled_movements NOT NULL | |
| `overridden_by` | uuid | FK→users NOT NULL | |
| `overridden_at` | timestamp | NOT NULL | |
| `justificativa` | text | NOT NULL | Obrigatória (min 20 chars) |
| `scope_used` | varchar | NOT NULL | `approval:override` |

---

## 10. Endpoints do Módulo

| Método | Path | operationId | Scope |
|---|---|---|---|
| GET | /api/v1/admin/control-rules | `admin_control_rules_list` | `approval:rule:read` |
| POST | /api/v1/admin/control-rules | `admin_control_rules_create` | `approval:rule:write` |
| PATCH | /api/v1/admin/control-rules/:id | `admin_control_rules_update` | `approval:rule:write` |
| POST | /api/v1/admin/control-rules/:id/approval-rules | `admin_approval_rules_create` | `approval:rule:write` |
| PATCH | /api/v1/admin/approval-rules/:id | `admin_approval_rules_update` | `approval:rule:write` |
| — | — | — | — |
| POST | /api/v1/movement-engine/evaluate | `movement_engine_evaluate` | `approval:engine:evaluate` |
| — | — | — | — |
| GET | /api/v1/movements | `movements_list` | `approval:movement:read` |
| GET | /api/v1/movements/:id | `movements_get` | `approval:movement:read` |
| POST | /api/v1/movements/:id/cancel | `movements_cancel` | `approval:movement:write` |
| POST | /api/v1/movements/:id/override | `movements_override` | `approval:override` |
| — | — | — | — |
| GET | /api/v1/my/approvals | `my_approvals_list` | — (próprio usuário) |
| POST | /api/v1/my/approvals/:approvalId/approve | `my_approvals_approve` | `approval:decide` |
| POST | /api/v1/my/approvals/:approvalId/reject | `my_approvals_reject` | `approval:decide` |

---

## 11. Novos Escopos — Amendment MOD-000-F12

| Escopo | Descrição |
|---|---|
| `approval:rule:read` | Ver regras de controle e alçadas |
| `approval:rule:write` | Criar/editar regras |
| `approval:engine:evaluate` | Chamar motor de controle (usado por outros módulos) |
| `approval:movement:read` | Ver movimentos controlados |
| `approval:movement:write` | Cancelar movimentos (pelo solicitante) |
| `approval:decide` | Aprovar ou reprovar movimentos |
| `approval:override` | Override com justificativa obrigatória (poder especial auditado) |

---

## 12. OKRs

| # | Métrica | Alvo |
|---|---|---|
| OKR-1 | Segregação mantida: solicitante sem scope suficiente nunca aprova o próprio movimento; auto-aprovação por scope registrada em 100% dos casos | 100% |
| OKR-2 | Override auditado com justificativa em movement_override_log | 100% |
| OKR-3 | Rastreabilidade integral: todos os eventos em movement_history | 100% |
| OKR-4 | API/MCP como origem gera movimento controlado quando regra aplica | 100% |

---

## 13. CHANGELOG

| Versão | Data | Responsável | Descrição |
|---|---|---|---|
| 1.0.0 | 2026-03-15 | arquitetura | Criação do zero. 7 tabelas, motor de controle, 4 critérios de alçada, 5 features. |
| 1.1.0 | 2026-03-16 | Marcos Sulivan | Decisões técnicas 2026-03-15: auto-aprovação por suficiência de escopo (AUTO_APPROVED_BY_SCOPE), CHECK constraint removido do banco → validação no service, owner atualizado. |
| 1.2.0 | 2026-03-19 | Marcos Sulivan | Revisão final e aprovação do épico. DoR completo. Status READY → APPROVED com regra cascata para F01–F05. |

---

> ⚠️ **Atenção:** As automações de arquitetura (`forge-module` e `create-amendment`) **SÓ PODEM SER EXECUTADAS** se esta User Story estiver marcada com Status `APPROVED`.
