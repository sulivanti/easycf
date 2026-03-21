# DATA-003 — Catálogo de Domain Events de {{NOME_MODULO}}

> **Este é um artefato cross-cutting.** A estrutura canônica (Princípios, Campos mínimos e Índices) é herdada de DOC-ARC-003 e DOC-FND-000 §3. O agente enriquecedor (AGN-DEV-04) NÃO DEVE reinventar essas seções — deve copiá-las deste template e focar o enriquecimento exclusivamente no **Catálogo de Eventos** (conteúdo específico do módulo).

- **estado_item:** DRAFT
- **owner:** {{OWNER}}
- **data_ultima_revisao:** {{DATA}}
- **rastreia_para:** {{RASTREIA_PARA}}, DOC-ARC-003, DOC-FND-000
- **referencias_exemplos:** EX-SEC-001
- **evidencias:** N/A

> Habilita linha do tempo (Thread), auditoria, Outbox e automação de notificações.

---

## Princípios (MUST)

- **Não use "permissão no evento" como fonte de verdade.**
  - Emit = permissão do comando que origina o evento
  - View = ACL + tenant da entity originária
- `sensitivity_level` é **guard-rail** (mascarar/bloquear cedo), não a regra principal.
- **Fonte Única da Verdade:** Tabela `domain_events` é a única fonte para auditoria/timeline (DOC-ARC-003 §1 Dogma 6). Proibido criar tabelas satélites de logs.

## Campos mínimos recomendados

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `id` | uuid | SIM | PK |
| `tenant_id` | uuid | SIM | Isolamento multi-tenant |
| `entity_type` | text | SIM | Tipo da entidade originária |
| `entity_id` | text | SIM | ID da entidade |
| `event_type` | text | SIM | Tipo do evento (padrão `dominio.acao`) |
| `payload` | jsonb | SIM | Snapshot mínimo, sem PII desnecessária |
| `created_at` | timestamptz | SIM | Timestamp UTC |
| `created_by` | uuid/text | NÃO | actorId (NULL se anônimo) |
| `correlation_id` | text | SIM | X-Correlation-ID propagado |
| `causation_id` | text | NÃO | Evento que causou este |
| `sensitivity_level` | smallint | SIM | 0=público, 1=interno, 2=confidencial, 3=restrito |
| `dedupe_key` | text | NÃO | UNIQUE(tenant_id, dedupe_key) para idempotência |

## Índices padrão exigidos

- `(tenant_id, entity_type, entity_id, created_at DESC)` — timeline por entidade
- `(tenant_id, event_type, created_at DESC)` — filtro por tipo de evento

---

<!-- ====================================================================
     CONTEÚDO ESPECÍFICO DO MÓDULO ABAIXO
     O agente AGN-DEV-04 deve enriquecer APENAS esta seção.
     Tudo acima é boilerplate canônico e NÃO DEVE ser alterado.
     ==================================================================== -->

## Catálogo de Domain Events

<!-- Preencher com os eventos específicos do módulo.
     Formato tabular recomendado:

| event_type | description | origin_command | entity_type | emit_permission | view_rule | notify | sensitivity_level | maskable_fields | payload_policy |
|---|---|---|---|---|---|---|---|---|---|
| `dominio.acao` | Descrição do evento | POST /api/v1/... | `entity` | `dominio:entidade:acao` | tenant + `dominio:entidade:read` | — | 0 | — | snapshot: campos |

-->
