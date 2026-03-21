# SEC-002 — Matriz de Autorização de Eventos de {{NOME_MODULO}}

> **Este é um artefato cross-cutting.** A estrutura canônica (Princípios e Glossário) é herdada de DOC-FND-000 §3. O agente enriquecedor (AGN-DEV-06) NÃO DEVE reinventar essas seções — deve copiá-las deste template e focar o enriquecimento exclusivamente na **Matriz de Autorização** (conteúdo específico do módulo).

- **estado_item:** DRAFT
- **owner:** {{OWNER}}
- **data_ultima_revisao:** {{DATA}}
- **rastreia_para:** {{RASTREIA_PARA}}, DOC-ARC-003, DOC-FND-000, DATA-003
- **referencias_exemplos:** EX-SEC-001, EX-SEC-002
- **evidencias:** N/A

> Modelo canônico conforme DOC-FND-000 §3.

---

## Princípios (MUST)

- **Não use "permissão no evento" como fonte de verdade.**
  - **Emit** é controlado pela permissão do **comando** que gera o evento.
  - **View** é controlado pela permissão de leitura da **entity originária** (ACL) + `tenant_id`.
- `sensitivity_level` **não substitui** ACL/RBAC: serve apenas como **guard-rail** (mascarar payload, bloquear early-return).
- **Autorização de Linha (MUST):** toda leitura em `domain_events` e `notifications` MUST filtrar por `tenant_id` e respeitar a ACL do registro originário.

## Glossário

- **Emit:** quem pode disparar o evento (derivado do comando/ação que o origina).
- **View:** quem pode ler/visualizar eventos (timeline/auditoria).
- **Notify:** quem recebe notificações (inbox/real-time), resolvido por regra.
- **Sensitivity:** 0 = administrativo, 1 = operacional, 2 = alto (escalada de privilégio).
- **Retenção:** tempo mínimo de retenção do evento antes de elegibilidade para purge.

---

<!-- ====================================================================
     CONTEÚDO ESPECÍFICO DO MÓDULO ABAIXO
     O agente AGN-DEV-06 deve enriquecer APENAS esta seção.
     Tudo acima é boilerplate canônico e NÃO DEVE ser alterado.
     ==================================================================== -->

## Matriz de Autorização — {{DOMINIO}}

<!-- Preencher com a matriz de eventos específica do módulo.
     Formato tabular recomendado:

| action | event_type | emit_perm | view | notify | sensitivity | maskable_fields | retenção |
|---|---|---|---|---|---|---|---|
| Criar X | `dominio.x_created` | `dominio:entidade:write` | tenant + `dominio:entidade:read` | — | 0 | — | padrão Foundation |

-->
