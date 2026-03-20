> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento base em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-PADRAO-005-C01

- **Documento base:** [DOC-PADRAO-005](../../../../01_normativos/DOC-PADRAO-005_Storage_e_Upload.md) §10 — Catálogo de Entity Types
- **estado_item:** DRAFT
- **Natureza:** C (Correção)
- **Data:** 2026-03-18
- **owner:** arquitetura
- **Motivação:** PENDENTE-004 (PEN-000): DOC-PADRAO-005 não define limite máximo de anexos por entity_type. Sem esse controle, entidades podem acumular arquivos indefinidamente, causando degradação de performance em queries e custos de storage descontrolados. A decisão (Opção C) estabelece limites configuráveis por entity_type no catálogo §10.
- **rastreia_para:** PENDENTE-004, DOC-PADRAO-005, US-MOD-000-F16, FR-000, DATA-000

---

## Detalhamento

### §10 — Catálogo de Entity Types: Adendo de Limites por Entity Type

**Contexto:** O catálogo §10 registra `entity_type`, módulo, purposes e observações, mas **não define limite máximo de anexos** por entidade. Isso permite acúmulo ilimitado de `storage_objects` por `entity_id`, impactando performance de queries e custos operacionais.

**Decisão:** Adicionar coluna `max_attachments` ao Catálogo de Entity Types (§10), com valor por entity_type. O backend DEVE rejeitar uploads que excedam o limite configurado.

#### Catálogo §10 — Coluna adicional: `max_attachments`

| entity_type | Módulo | Purposes permitidos | max_attachments | Observações |
|---|---|---|---|---|
| `user` | Foundation (DOC-FND-000 §6) | `avatar`, `attachment` | `1` (avatar), `10` (attachment) | Avatar: único ativo por usuário; attachments: documentos pessoais |
| `tenant` | Foundation (DOC-FND-000 §6) | `attachment` | `20` | Documentos do tenant (contratos, logos, etc.) |
| `import_job` | Core | `import` | `1` | Um arquivo por job de importação |
| `export_job` | Core | `export` | `1` | Um arquivo por job de exportação |

> Módulos futuros DEVEM declarar `max_attachments` ao registrar novos `entity_type`s. Valor `0` = ilimitado (requer justificativa em ADR).

#### Nova Constraint: CON-005

**CON-005:** O backend DEVE rejeitar `POST /uploads/presign` com `HTTP 409 Conflict` quando o número de `storage_objects` com `upload_status IN ('pending', 'confirmed')` para o par `(entity_type, entity_id)` atingir o `max_attachments` definido no catálogo §10.

**Response de erro (RFC 9457):**

```json
{
  "type": "/problems/attachment-limit-exceeded",
  "title": "Attachment limit exceeded",
  "status": 409,
  "detail": "Entity 'user' (id: {entity_id}) has reached the maximum of 10 attachments.",
  "extensions": {
    "entity_type": "user",
    "entity_id": "{entity_id}",
    "current_count": 10,
    "max_allowed": 10,
    "correlationId": "{correlation_id}"
  }
}
```

#### Validação no Fluxo de Presign (§6.1 — Adendo)

Adicionar à tabela de validações de `POST /uploads/presign`:

| Validação | Regra |
|---|---|
| Limite de anexos | `COUNT(storage_objects WHERE entity_type AND entity_id AND upload_status IN ('pending','confirmed') AND deleted_at IS NULL) < max_attachments` do catálogo §10. Se violado → `409`. |

> **Nota sobre `purpose = 'avatar'`:** CON-002 já garante unicidade de avatar (novo substitui anterior). O `max_attachments = 1` para avatar é redundante com CON-002 mas torna o catálogo auto-documentado.

#### Novo Gate de CI

| Gate | Regra |
|---|---|
| **Gate STR-6** | Todo `entity_type` no catálogo §10 DEVE ter `max_attachments` definido (valor numérico > 0 ou `0` com ADR justificando) |

---

## Impacto nos Pilares

- **FR-000:** Adicionar validação de limite no endpoint presign (FR-016 ou novo FR).
- **DATA-000:** Nenhuma mudança no schema — o limite é aplicacional, não DDL. Considerar índice de contagem se performance for crítica.
- **SEC-000:** Nenhum impacto direto — controle de acesso permanece inalterado.
- **BR-000:** Considerar regra de negócio explícita para limites de storage por entity_type.
- **Ação requerida:** Ao enriquecer FR-000 e BR-000 futuramente, incorporar a validação de `max_attachments` nos cenários Gherkin.
