# DOC-ARC-003 — Ponte de Rastreabilidade e Payloads (UI ↔ API ↔ Domain)

- **id:** DOC-ARC-003
- **version:** 1.2.0
- **status:** READY
- **data_ultima_revisao:** 2026-03-06
- **owner:** arquitetura
- **scope:** global (UI ↔ API ↔ Domain)

Este documento normatiza a consistência tática e operacional entre a Interface de Usuário (Frontend), as Operações (Backend/API) e o Estado do Sistema (Domain), usando a tabela `domain_events` (DATA-003) como espinha dorsal. Em vez de adicionar complexidade ou tabelas intermediárias de logs de UI, estabelecemos aqui as regras que transformam o ecossistema em um **Framework de Componentes MVPs** altamente rastreável e unificado.

---

## 1. O "Model" Framework-Friendly: As 6 Convenções Dogmáticas do Sistema

Para garantir que o produto escale de forma previsível e auditável, todos os geradores de código e Agentes devem obedecer rigidamente a estes seis dogmas:

1. **Estabilidade de Operações:** O `operationId` da API é sempre estável e serve como chave universal de tracking e mapeamento de permissões no frontend.
2. **Dupla Conexão de Tela:** Toda `action` mapeada no catálogo UX (ex: DOC-UX-010) presente em uma Tela (Screen Manifest) aponta necessariamente para 1+ `operationIds`.
3. **Imutabilidade e Rastreio Mútuo:** Toda mutação (`create`, `update`, `activate`, `archive`, `import`, etc.) deve propagar o cabeçalho `X-Correlation-ID` e declarar publicamente no catálogo os *Domain Events* que resultam do seu acionamento.
4. **Volume Assíncrono Restrito:** **Todo** fluxo de processamento de massa (data `import`, `export`, `print`) acontece via padrão **Job** assíncrono (`job_*`), independentemente de velocidade, blindando a observabilidade e unificando a experiência (UX) de carregamento.
5. **Governança Visual Direta:** O estado visual de botões de transição e formulários restritivos é governado **inexoravelmente** pelas colunas consolidadas da entidade (ex: `status`, `deleted_at`). A UI não inventa estados lógicos, ela reflete a persistência crua.
6. **Fonte Única da Verdade para Auditoria:** A funcionalidade de `view_history` (histórico/timeline/audit) consome, **sempre e unicamente**, a base nativa de evento da `DATA-003` (`domain_events`). É expressamente proibido criar tabelas satélites de "logs de uso" por funcionalidade.

---

## 2. O "Idioma Operacional" do Frontend (UI Action Envelope)

O rastreio intencional da UI para a API não depende de uma tabela de `ui_events`. A padronização ocorre no Envelope (payload) de Tracking/Observabilidade que as aplicações client-side emitem. Para padronizar a experiência do Dev Fronte-End, este contrato deve ser abstraído no pacote utilitário instanciável `ui-telemetry` (DOC-FND-000 §4).

A interface gráfica de todos os aplicativos deve padronizar o envio de telemetria de ação (ex: via log console customizado, sentry ou endpoints de métricas passivas) usando o contrato `UIActionEnvelope`:

```typescript
interface UIActionEnvelope {
  screen_id: string;        // Origem UI (ex: UX-USER-001)
  action: string;           // Key baseada no DOC-UX-010 (create, search, export_selected...)
  entity_type: string;      // ex: "user", "invoice"
  entity_id?: string;       // Quando já existe na mutação
  tenant_id: string;        // Quando sistema multi-tenant
  operation_id: string;     // A chamada explícita mapeada na OpenAPI
  correlation_id: string;   // Valor universal injetado no X-Correlation-ID header
  status: "requested" | "succeeded" | "failed";
  duration_ms?: number;
  http_status?: number;     // Em ocorrencias de erro (status !== 'succeeded')
  problem_type?: string;    // Derivado da RFC 9457 em resposta falha
  error_code?: string;      // Específico / Negócio
  meta?: Record<string, any>; // Contexto sem PII (ex: filters_used, page_size, sort_key)
}
```

---

## 3. Extensões no Catálogo de Eventos (Domain Events Bridge)

Toda modelagem funcional que define Catálogos de Feature (Domain Events) deverá ser declarada com **dois campos adicionais obrigatórios**, completando o trajeto do clique ao banco:

1. **`ui_actions`**: Lista estrita das ações do DOC-UX-010 que viabilizam/desencadeiam o evento na Interface (ex: `["create", "import", "bulk_update"]`).
2. **`operation_ids`**: Lista dos Endpoints (como declarados na OpenAPI) configurados para acionar tal evento de domínio dentro da API.

---

## 4. Auditoria e View History

A Timeline do Histórico de qualquer entidade na UI consome um único formato de endpoint unificado provido pelo Core da Aplicação. É expressamente **proibido criar tabelas satélites de "logs de uso"** por funcionalidade (ver Dogma 6, §1). Toda consulta de auditoria parte da tabela `domain_events` (DATA-003).

---

### 4.1 Endpoint Canônico

```
GET /entities/{entityType}/{entityId}/history
operationId: domain_events_list_by_entity
```

| Elemento | Detalhe |
|---|---|
| **Autenticação** | Bearer JWT obrigatório |
| **Headers obrigatórios** | `X-Tenant-ID`, `X-Correlation-ID` (propagar em toda resposta) |
| **Permissão mínima** | `audit:read` (RBAC — ver §4.4) |
| **Index obrigatório no banco** | `(tenant_id, entity_type, entity_id, created_at DESC)` |
| **Tenant isolation** | Query DEVE filtrar por `tenant_id` antes de qualquer outro filtro |

**Path params:**

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `entityType` | string enum | Tipo da entidade: `user`, `tenant`, `tenant_user`, `role`, etc. |
| `entityId` | UUID | Identificador da entidade |

---

### 4.2 Filtros Disponíveis (Query Params)

| Parâmetro | Tipo | Padrão | Validação |
|---|---|---|---|
| `from` | ISO 8601 datetime | — | DEVE ser ≤ `to` quando informado |
| `to` | ISO 8601 datetime | — | DEVE ser ≥ `from` quando informado |
| `event_type` | string (repeatable) | — | Ex: `?event_type=user.created&event_type=user.updated` |
| `actor_id` | UUID | — | Filtra eventos por ator específico |
| `sensitivity_max` | integer 0–3 | role-based (ver §4.4) | Limita nível máximo de sensibilidade retornado |

**Regras de validação:**

- `from` > `to` → `422` com `type="/problems/validation-error"` e detalhe do campo inválido.
- `event_type` com valor desconhecido → `422` listando os valores válidos no `detail`.
- `sensitivity_max` > nível autorizado da role → silenciosamente clamped ao nível máximo da role.

---

### 4.3 Paginação

> **Regra geral (DOC-ARC-001 §B.6):** Endpoints de timeline/histórico DEVEM usar **Cursor Pagination**; listagens CRUD simples PODEM usar Offset Pagination.

O endpoint de auditoria/histórico DEVE usar **Cursor Pagination**:

| Parâmetro | Padrão | Máximo | Notas |
|---|---|---|---|
| `limit` | `20` | `100` | Acima de 100 → `422` |
| `cursor` | — | — | Opaco, base64-encoded |
| `sort` | `created_at` | — | Único campo suportado |
| `order` | `desc` | `asc` / `desc` | |

A resposta DEVE incluir `meta.next_cursor` (ou `null` se última página).

---

### 4.4 RBAC e Masking de Payload

Toda consulta de auditoria verifica `canRead` + `tenantMatch` antes de retornar dados.

| Role / Permissão | `sensitivity_max` efetivo | Acesso |
|---|---|---|
| `audit:read` | `1` | Eventos públicos e de tenant (sem dados sensíveis) |
| `audit:read` + `audit:sensitive` | `2` | Inclui campos sensíveis mascarados |
| `superadmin` | `3` | Acesso total |
| Sem `audit:read` | — | `403 /problems/forbidden` |

**Tabela de masking por `sensitivity_level`:**

| Nível | Visibilidade | Exemplo de campo |
|---|---|---|
| `0` | Público — sempre visível | `status`, `event_type`, `created_at` |
| `1` | Restrito ao tenant — requer `audit:read` | `actor_id`, `entity_id`, campos de perfil |
| `2` | Sensível — requer `audit:sensitive` | e-mail, nome completo, IP de origem |
| `3` | Omitido da API — nunca exposto | `password_hash`, tokens, chaves secretas |

Campos com `sensitivity_level=3` são **removidos do payload antes da serialização**, independentemente da role do chamador.

---

### 4.5 Contrato de Resposta (`HistoryEntryDTO`)

```typescript
// Resposta: 200 OK
{
  data: HistoryEntry[];
  meta: PaginationMeta;
}

interface HistoryEntry {
  id: string;                  // UUID do evento
  event_type: string;          // Ex: "user.created", "tenant_user.blocked"
  entity_type: string;         // Ex: "user", "tenant_user"
  entity_id: string;           // UUID da entidade
  actor_id: string | null;     // UUID do usuário responsável (null = sistema)
  actor_name: string | null;   // Nome display (sensível: mascarado se nivel < 2)
  tenant_id: string;           // UUID do tenant
  correlation_id: string;      // Propagado de X-Correlation-ID
  causation_id: string | null; // ID do evento que causou este (cadeia causal)
  payload: Record<string, unknown>; // Mascarado conforme sensitivity_level
  sensitivity_level: 0 | 1 | 2 | 3;
  created_at: string;          // ISO 8601
}

interface PaginationMeta {
  total: number;       // Total de registros (sem paginação)
  page: number;
  page_size: number;
  total_pages: number;
}
```

---

### 4.6 Respostas de Erro (RFC 9457)

| HTTP | `type` | Quando |
|---|---|---|
| `400` | `/problems/bad-request` | Query param malformado |
| `401` | `/problems/unauthorized` | JWT inválido ou sessão revogada |
| `403` | `/problems/forbidden` | Sem `audit:read` ou tenant mismatch |
| `404` | `/problems/not-found` | `entityType` ou `entityId` inexistente no tenant |
| `422` | `/problems/validation-error` | Filtro inválido (`from > to`, `page_size > 100`, etc.) |
| `500` | `/problems/internal-error` | Falha inesperada |

Todos os erros DEVEM incluir `extensions.correlationId` propagado do `X-Correlation-ID` recebido.

---

### 4.7 Variantes de Path por Módulo

Quando um módulo expõe o histórico via rota própria (nested resource), DEVE usar o mesmo contrato desta seção e o mesmo `operationId` de sufixo:

```
# Variante por recurso (mais RESTful para módulos com entidades aninhadas):
GET /users/{userId}/history
GET /tenants/{tenantId}/history
GET /tenants/{tenantId}/users/{userId}/history

# Variante genérica (preferida para navegação cross-module no painel de auditoria):
GET /entities/{entityType}/{entityId}/history
```

Ambas as variantes DEVEM:

- Compartilhar os mesmos query params (§4.2), paginação (§4.3), RBAC (§4.4) e DTO (§4.5).
- Declarar `operationId` estável no OpenAPI (ex: `domain_events_list_by_entity` ou `users_history_list`).
- Realizar tenant isolation obrigatório antes de qualquer filtro adicional.

---

## 5. Padrões Governamentais Visuais

Certos campos presentes invariavelmente no checklist de dados (DATA) possuem tradução direta em comportamentos visuais obrigatórios (Componentes MVP):

- **Timestamps (`created_at`, `updated_at`)** → Assumem o controle sobre renderizações de textos como "Última Modificação" e ditam *sorts* defaults em Grids de Listagem.
- **Soft Delete (`deleted_at`)** → A action `archive` transita visivelmente a linha marcando como `deleted_at=now()` do banco. A action de `restore/unarchive` anula `deleted_at`. Registros com `deleted_at` provido ficam invisíveis da maioria das listagens ativas a não ser marcados explicitamente via query parameter "include_archived".
- **Status (Ex: ACTIVE / INACTIVE)** → Badges centralizados no design system assumem cor padrão atrelada ao literal do `status`. O Botão `Action Activate` passa a renderizar `disabled` transacionalmente se o registro já exibe `ACTIVE`.
- **Constraint Unicidade (`codigo`, `id`)** → O Frontend assume a ocorrência natural do Code `409 Conflict`. Havendo 409 após insert/update, o comportamento da UI é universal: "Item (Código) já Cadastrado".

---

## 6. Padronização de Assincronia (UX Jobs)

Toda vez que a Action representar importação, exportação de massa de dados, ou geração massiva (ex. envio em lote):

1. Payload do Evento (`import.job_*`) deve ser categoricamente **isento de PII**, restringindo-se a informar metadados (Tamanho do Lote, Qtd Sucesso, File Refs).
2. Na Tela, a action converte o botão em estado genérico: **"Processando..."** (LOCKED state UI).
3. A API devolve o resultado parcial confirmando um `job_id`, e emite `job_completed` ao final do processamento (que destrava o Front liberando o *Blob* Download/Relatório).
4. Havendo crash, o envio de `job_failed` destrava a tela ativando contextualmente um botão `Reprocess` (`UX-010`).

---

## 7. RBAC E Restrições Multiagente: As Camadas View e Emit

- O Frontend não gera presunção de Autorização. Um botão como (Exportar) renderiza visualmente travado (Tooltip `UX-001 "Sem permissão"`) sempre e quando a propriedade atinente no catálogo de permissões (`x-permissions` = `feature:export` / ACL local) faltar.
- A camada Endpoints/Backend deve processar tanto o `tenantMatch` (isolar banco) quanto a função de permissão `canRead` antes de retornar grids, forms de view e as tabelas do `domain_events`.

---

## 8. Gates de CI e Manifestos Declarativos

> **Documento migrado:** As seções §8 (Gates de Validação em CI) e §9 (Manifestos Declarativos e MVP) foram extraídas para [DOC-ARC-003B — Manifestos Declarativos e Gates de CI](DOC-ARC-003B__Manifestos_Declarativos_e_Gates_CI.md), reduzindo a densidade deste documento e separando responsabilidades.

---

## Metadados

> Bloco de metadados canônico movido para o topo do documento (padrão DOC-PADRAO-META v1.0.0).

**Changelog:**
- `1.2.0` (2026-03-14): §8 e §9 extraídos para DOC-ARC-003B. Metadados padronizados (SemVer + bloco canônico no topo).
- `1.1.0` (2026-03-06): §4 enriquecido com contrato normativo completo de `view_history` — endpoint canônico, filtros, paginação, RBAC/masking, `HistoryEntryDTO`, erros RFC 9457 e variantes de path.
- `1.0.0`: Versão inicial.
