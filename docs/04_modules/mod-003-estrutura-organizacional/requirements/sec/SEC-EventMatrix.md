> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - **Status DRAFT:** Enriqueça o conteúdo deste arquivo diretamente.
> - **Status READY:** NÃO EDITE DIRETAMENTE. Use a skill `create-amendment`.
>
> | Versão | Data       | Responsável | Status/Integração |
> |--------|------------|-------------|-------------------|
> | 0.1.0  | 2026-03-16 | arquitetura | Baseline Inicial (forge-module) |

# SEC-EventMatrix — Matriz de Autorização de Eventos da Estrutura Organizacional

> Modelo canônico conforme DOC-FND-000 §3.

## Princípios (MUST)

- **Não use "permissão no evento" como fonte de verdade.**
  - **Emit** é controlado pela permissão do **comando** que gera o evento.
  - **View** é controlado pela permissão de leitura da **entity originária** (ACL) + `tenant_id`.
- `sensitivity_level` **não substitui** ACL/RBAC: serve apenas como **guard-rail**.
- **Autorização de Linha (MUST):** toda leitura em `domain_events` e `notifications` MUST filtrar por `tenant_id`.

## Glossário

- **Emit**: quem pode disparar o evento (derivado do comando).
- **View**: quem pode ler/visualizar eventos (timeline/auditoria).
- **Notify**: quem recebe notificações (inbox/real-time), resolvido por regra.
- **Owner/Requester/Approver**: papéis típicos definidos por domínio; watchers podem complementar.

---

## Matriz de Autorização — Domain Events MOD-003

| action | event_type | emit_perm | view | notify | sensitivity |
|---|---|---|---|---|---|
| Criar unidade (N1–N4) | `org.unit_created` | `org:unit:write` | `canRead(org_unit)` + tenant | creator + admin | 0 |
| Atualizar unidade | `org.unit_updated` | `org:unit:write` | `canRead(org_unit)` + tenant | — | 0 |
| Desativar unidade (soft delete) | `org.unit_deleted` | `org:unit:delete` | `canRead(org_unit)` + tenant | admin | 0 |
| Restaurar unidade (undo soft delete) | `org.unit_restored` | `org:unit:write` | `canRead(org_unit)` + tenant | admin | 0 |
| Vincular tenant (N5) a N4 | `org.tenant_linked` | `org:unit:write` | `canRead(org_unit)` + tenant | admin | 0 |
| Desvincular tenant (N5) de N4 | `org.tenant_unlinked` | `org:unit:delete` | `canRead(org_unit)` + tenant | admin | 0 |

---

## Mascaramento (Masking Policy)

- `maskable_fields`: nenhum em todos os 6 eventos — dados organizacionais não contêm PII
- `sensitivity_level=0` em todos os eventos — guard-rail apenas, não substitui ACL/RBAC

## Regras de Filtragem (MUST)

- **MUST:** Toda consulta a `domain_events` do MOD-003 DEVE filtrar por `tenant_id` do contexto autenticado
- **MUST:** View sempre respeitando `canRead(org_unit)` — o usuário deve ter acesso ao nó organizacional para ver seus eventos
- **MUST:** Notificações (`notify`) DEVEM ser entregues apenas a destinatários no mesmo `tenant_id`
- Sensitivity level 0 em todos os eventos — dados organizacionais não contêm PII

---

- **estado_item:** DRAFT
- **owner:** arquitetura
- **data_ultima_revisao:** 2026-03-16
- **rastreia_para:** US-MOD-003, FR-001, FR-004, DATA-003, BR-001, SEC-001, DOC-ARC-003, DOC-FND-000
- **referencias_exemplos:** EX-CI-007
- **evidencias:** N/A
