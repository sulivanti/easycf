# Trechos para colar no DOC-DEV-001

### UX-010 — Catálogo de Ações Padrão (UI Events) + Reutilizáveis

> **Objetivo:** padronizar as **ações/eventos de tela** (reutilizáveis) para que, no **enriquecimento** do sistema, cada UX-xxx apenas **selecione** as ações aplicáveis, sem redefinir comportamento toda vez.

---

#### Como usar no Enriquecimento (MUST)

Em cada **UX-XXX — <Jornada/Tela/Fluxo>**, incluir:

- **Ações disponíveis (selecionadas do catálogo):** `[view, filter, search, sort, paginate, create, update, delete, export]`
- **Ações em massa (se houver):** `[bulk_select, bulk_update, bulk_create, export_selected]`
- **Visões alternativas (se houver):** `[view_kanban, view_gantt]`
- **Ações opcionais por domínio:** `[...]` (ex.: approve, archive, attachments, etc.)

> **Regra:** se uma ação está selecionada na tela, ela DEVE apontar para: (1) endpoint(s) esperado(s), (2) eventos de domínio (se houver escrita), (3) auditoria/telemetria mínima.

---

#### Convenções (MUST)

- **action_key:** `snake_case` (ex.: `bulk_update`, `view_gantt`)
- **Tipos (kind):**
  - `command` (escrita/mudança de estado)
  - `query` (consulta/listagem)
  - `view` (troca de modo/visualização)
  - `output` (gera arquivo/relatório)
  - `workflow` (transições aprovadas por regra/processo)
  - `integration` (ações que disparam/reprocessam jobs/integrações)
- **Escopo (scope):** `single | collection | bulk | job`
- **Assíncrono:** para lotes/import/export/print pesado → **MUST** usar `job` (HTTP 202 + `jobId`).
- **Idempotência:** ações de escrita com risco de reenvio (create/import/bulk) → **MUST** suportar `Idempotency-Key`.

---

#### Telemetria (UI Action Events) — UI Action Envelope (Ponte de Rastreabilidade)

Toda ação selecionada deve emitir a sua telemetria utilizando o **UI Action Envelope** oficial, conforme definido normativamente no **DOC-ARC-003**. O preenchimento desse contrato garante rastreabilidade plena do Frontend até o Banco de Dados.

**Campos mínimos obrigatórios do Envelope:**

- `screen_id` (UX-XXX)
- `action` (action_key definida aqui)
- `entity_type` (se aplicável)
- `entity_id` (quando já existe)
- `tenant_id` (quando multi-tenant)
- `operation_id` (Idempotente e listado no OpenAPI)
- `correlation_id` (injetável num `X-Correlation-ID`)
- `status` (requested | succeeded | failed)
- `duration_ms`
- `http_status` / `problem_type` (derivação RFC 9457 em erros)
- `meta` (filters_used, page_size, sort_key, etc. - Sem dados sensíveis/PII)

> **Observação:** A Interface de log/telemetria transita referências limpas. Ela se conecta aos **Eventos de Domínio**, mas quem os persiste é o Backend preenchendo o mesmo `correlation_id` e `operation_id`. Para detalhes e regras (RBAC/Erros) baseadas nos "Dogmas do Framework", consulte o normativo interno `DOC-ARC-003`.

---

#### Eventos de Domínio (quando houver escrita)

Quando `kind=command|workflow|integration` e houver **mudança de estado**, registrar evento de domínio seguindo o padrão:

- `event_type`: `<entity_type>.<past_tense>` (ex.: `task.created`, `task.archived`, `task.approved`)
- `entity_type`, `entity_id`, `payload` (JSON), `correlation_id`, `actor_user_id`, `tenant_id`

> A lista exata de `event_type` por entidade fica no DATA-xxx ("Eventos do domínio") e/ou no Catálogo de Eventos da Feature.

---

## Catálogo Completo de Ações

> **Nota:** este catálogo é propositalmente amplo. No enriquecimento, cada tela **seleciona** apenas o que faz sentido.

---

### Ações Core (mais comuns)

#### 1) `view` — Visualizar (detalhe ou tela)

- **label_pt:** Visualizar
- **kind:** `query`
- **scope:** `single|collection`
- **Endpoint(s) padrão:**
  - `GET /<recurso>/{id}` (detalhe)
  - `GET /<recurso>` (lista)
- **Eventos de domínio:** (nenhum)
- **Auditoria/telemetria:** registrar `screen_id`, `entity_type/id` quando detalhe
- **Erros comuns:** `401, 403, 404, 5xx`

#### 2) `filter` — Filtrar

- **label_pt:** Filtrar
- **kind:** `query`
- **scope:** `collection`
- **Endpoint(s) padrão:** `GET /<recurso>?<filtros>`
- **Eventos de domínio:** (nenhum)
- **Telemetria:** registrar `filters` aplicados (sem dados sensíveis)
- **Erros comuns:** `400/422` (filtro inválido), `401/403`

#### 3) `search` — Pesquisar

- **label_pt:** Pesquisar
- **kind:** `query`
- **scope:** `collection`
- **Endpoint(s) padrão:**
  - `GET /<recurso>?q=<termo>` (simples) **ou**
  - `POST /<recurso>/search` (busca avançada)
- **Eventos de domínio:** (nenhum)
- **Telemetria:** registrar tamanho do termo, campos usados (não logar termo sensível)
- **Erros comuns:** `400/422`, `401/403`

#### 4) `sort` — Ordenar

- **label_pt:** Ordenar
- **kind:** `query`
- **scope:** `collection`
- **Endpoint(s) padrão:** `GET /<recurso>?sort=<campo>&order=asc|desc`
- **Eventos de domínio:** (nenhum)
- **Telemetria:** `sort.field`, `sort.order`
- **Erros comuns:** `400/422`, `401/403`

#### 5) `paginate` — Paginar / Carregar mais

- **label_pt:** Paginar / Carregar mais
- **kind:** `query`
- **scope:** `collection`
- **Endpoint(s) padrão:** `GET /<recurso>?cursor=<...>&limit=<...>`
- **Eventos de domínio:** (nenhum)
- **Telemetria:** `limit`, `hasMore`, `nextCursor`
- **Erros comuns:** `400`, `401/403`

---

### CRUD (comuns em quase todo sistema)

#### 6) `create` — Cadastrar / Incluir

- **label_pt:** Cadastrar / Incluir
- **kind:** `command`
- **scope:** `single`
- **Endpoint(s) padrão:** `POST /<recurso>`
- **Idempotência:** **recomendado/MUST** quando houver risco de retry (UI/integração)
- **Eventos de domínio (típicos):** `<entity>.created`
- **Auditoria:** `actor`, `tenant`, `entity_id`, payload resumido/whitelist, origem (UI/API)
- **Erros comuns:** `400/422`, `401/403`, `409`, `5xx`

#### 7) `update` — Alterar / Modificar

- **label_pt:** Alterar / Modificar
- **kind:** `command`
- **scope:** `single`
- **Endpoint(s) padrão:** `PATCH /<recurso>/{id}` (preferido) **ou** `PUT /<recurso>/{id}`
- **Idempotência:** recomendada (especialmente PUT)
- **Eventos de domínio (típicos):** `<entity>.updated` (e/ou `<entity>.status_changed`)
- **Auditoria:** diff (quando possível), campos alterados, motivo (quando aplicável)
- **Erros comuns:** `400/422`, `401/403`, `404`, `409`, `5xx`

#### 8) `delete` — Excluir (lógico por padrão)

- **label_pt:** Excluir
- **kind:** `command`
- **scope:** `single`
- **Endpoint(s) padrão:** `DELETE /<recurso>/{id}` (soft-delete)
- **Eventos de domínio (típicos):** `<entity>.deleted` (lógico)
- **Auditoria:** motivo (opcional), referência do recurso
- **Erros comuns:** `401/403`, `404`, `409` (FK/restrição), `5xx`

---

### Importação, Exportação e Saídas (Output)

#### 9) `import` — Importar

- **label_pt:** Importar
- **kind:** `command`
- **scope:** `job` (quase sempre)
- **Endpoint(s) padrão:**
  - `POST /<recurso>/import` (retorna `202 { jobId }`) **ou**
  - `POST /imports/<tipo>` (quando centralizado)
- **Assíncrono:** **MUST** se lote/validação pesada
- **Eventos de domínio (típicos):**
  - `import.job_created`, `import.job_completed`, `import.job_failed`
  - e por item: `<entity>.created|updated` (se aplicável)
- **Auditoria:** arquivo/origem, contagem total, contagem sucesso/erro
- **Erros comuns:** `400/422` (layout), `401/403`, `409`, `5xx`

#### 10) `download_template` — Baixar modelo (template) de importação

- **label_pt:** Baixar modelo
- **kind:** `output`
- **scope:** `collection`
- **Endpoint(s) padrão:** `GET /<recurso>/import/template` (csv/xlsx)
- **Eventos de domínio:** (nenhum)
- **Telemetria:** formato, versão do template
- **Erros comuns:** `401/403`, `5xx`

#### 11) `export` — Exportar (lista/relatório)

- **label_pt:** Exportar
- **kind:** `output`
- **scope:** `job|collection`
- **Endpoint(s) padrão:**
  - leve: `GET /<recurso>/export?<filtros>` (sincrono)
  - pesado: `POST /<recurso>/export` → `202 { jobId }`
- **Assíncrono:** recomendado/MUST quando volume alto
- **Eventos de domínio (opcionais):** `export.job_created|completed|failed`
- **Telemetria:** formato (`csv|xlsx|pdf`), filtros/sort usados
- **Erros comuns:** `401/403`, `422`, `5xx`

#### 12) `export_selected` — Exportar selecionados

- **label_pt:** Exportar selecionados
- **kind:** `output`
- **scope:** `job|bulk`
- **Endpoint(s) padrão:** `POST /<recurso>/export` com `body.entity_ids=[...]` → `202 { jobId }`
- **Eventos de domínio:** (opcional) `export.job_*`
- **Telemetria:** quantidade de IDs
- **Erros comuns:** `400/422`, `401/403`, `5xx`

#### 13) `print` — Imprimir

- **label_pt:** Imprimir
- **kind:** `output`
- **scope:** `job|single|bulk`
- **Endpoint(s) padrão:**
  - `GET /<recurso>/{id}/print` (leve) **ou**
  - `POST /<recurso>/print` (bulk) → `202 { jobId }`
- **Assíncrono:** **MUST** se PDF pesado
- **Eventos de domínio:** (opcional) `print.job_*`
- **Erros comuns:** `401/403`, `404`, `5xx`

---

### Visões e Modos de Visualização

#### 14) `view_kanban` — Ver em Kanban

- **label_pt:** Ver em Kanban
- **kind:** `view`
- **scope:** `collection`
- **Endpoint(s) padrão:**
  - `GET /<recurso>?view=kanban` **ou**
  - `GET /<recurso>/kanban` (quando dedicado)
- **Pré-requisitos de dados (típicos):** `board_order`, `status/coluna`
- **Eventos de domínio:** (nenhum)
- **Telemetria:** `view_mode=kanban`
- **Erros comuns:** `401/403`, `5xx`

#### 15) `view_gantt` — Ver em Gantt

- **label_pt:** Ver em Gantt
- **kind:** `view`
- **scope:** `collection`
- **Endpoint(s) padrão:**
  - `GET /<recurso>?view=gantt` **ou**
  - `GET /<recurso>/gantt`
- **Pré-requisitos de dados (típicos):** `start_date`, `due_date`, `progress_percent`, `parent_id`
- **Eventos de domínio:** (nenhum)
- **Telemetria:** `view_mode=gantt`
- **Erros comuns:** `401/403`, `5xx`

---

### Ações em Massa (Bulk)

#### 16) `bulk_select` — Selecionar / Deselecionar em massa

- **label_pt:** Seleção em massa
- **kind:** `view`
- **scope:** `bulk`
- **Endpoint(s) padrão:** (nenhum obrigatório; UI-only)
  - opcional: `POST /<recurso>/selection` (quando há seleção persistida)
- **Eventos de domínio:** (nenhum)
- **Telemetria:** quantidade selecionada, origem (filtro/seleção manual)

#### 17) `bulk_update` — Editar em massa

- **label_pt:** Editar em massa
- **kind:** `command`
- **scope:** `bulk|job`
- **Endpoint(s) padrão:**
  - `PATCH /<recurso>` com `body: { entity_ids: [...], patch: {...} }`
  - ou `POST /<recurso>/bulk-update` → `202 { jobId }` (se pesado)
- **Idempotência:** **MUST** quando async/job
- **Eventos de domínio:** Em lotes massivos (ex: > 1.000 itens), **MUST** disparar 1 evento consolidado único (`bulk.update_completed`) em vez de atolar a tabela relacional com `N` eventos `<entity>.updated` atômicos (o que causa bloqueios graves e estouro de memória no banco).
- **Auditoria:** campos alterados, contagem afetada, critérios (se por filtro)
- **Erros comuns:** `400/422`, `401/403`, `409`, `5xx`

#### 18) `bulk_create` — Incluir em massa

- **label_pt:** Incluir em massa
- **kind:** `command`
- **scope:** `bulk|job`
- **Endpoint(s) padrão:**
  - `POST /<recurso>/bulk` (sincrono pequeno)
  - ou `POST /<recurso>/bulk` → `202 { jobId }` (grande)
- **Idempotência:** **MUST** quando risco de retry
- **Eventos de domínio:** Em lotes massivos (ex: > 1.000 itens), **MUST** disparar 1 evento consolidado único (`bulk.create_completed`), em vez de iterar `N` eventos `<entity>.created` e travar as transações no banco.
- **Auditoria:** contagens, falhas por linha
- **Erros comuns:** `400/422`, `401/403`, `409`, `5xx`

---

### Ciclo de Vida / Governança do Registro

#### 19) `clone` — Duplicar / Clonar

- **label_pt:** Duplicar / Clonar
- **kind:** `command`
- **scope:** `single`
- **Endpoint(s) padrão:** `POST /<recurso>/{id}/clone`
- **Eventos de domínio (típicos):** `<entity>.cloned` + `<entity>.created`
- **Auditoria:** origem do clone (`source_id`)
- **Erros comuns:** `401/403`, `404`, `409`, `5xx`

#### 20) `archive` — Arquivar

- **label_pt:** Arquivar
- **kind:** `command`
- **scope:** `single|bulk`
- **Endpoint(s) padrão:** `POST /<recurso>/{id}/archive` (ou `PATCH status=ARCHIVED`)
- **Eventos de domínio (típicos):** `<entity>.archived`
- **Auditoria:** motivo (opcional)
- **Erros comuns:** `401/403`, `404`, `409`, `5xx`

#### 21) `unarchive` — Desarquivar

- **label_pt:** Desarquivar
- **kind:** `command`
- **scope:** `single|bulk`
- **Endpoint(s) padrão:** `POST /<recurso>/{id}/unarchive`
- **Eventos de domínio (típicos):** `<entity>.unarchived`
- **Erros comuns:** `401/403`, `404`, `409`, `5xx`

#### 22) `activate` — Ativar

- **label_pt:** Ativar
- **kind:** `command`
- **scope:** `single|bulk`
- **Endpoint(s) padrão:** `POST /<recurso>/{id}/activate` (ou `PATCH status=ACTIVE`)
- **Eventos de domínio (típicos):** `<entity>.activated`
- **Erros comuns:** `401/403`, `404`, `409`, `5xx`

#### 23) `deactivate` — Desativar

- **label_pt:** Desativar
- **kind:** `command`
- **scope:** `single|bulk`
- **Endpoint(s) padrão:** `POST /<recurso>/{id}/deactivate`
- **Eventos de domínio (típicos):** `<entity>.deactivated`
- **Erros comuns:** `401/403`, `404`, `409`, `5xx`

#### 24) `restore` — Restaurar (de lixeira/arquivado, se existir)

- **label_pt:** Restaurar
- **kind:** `command`
- **scope:** `single|bulk`
- **Endpoint(s) padrão:** `POST /<recurso>/{id}/restore`
- **Eventos de domínio (típicos):** `<entity>.restored`
- **Erros comuns:** `401/403`, `404`, `409`, `5xx`

---

### Colaboração e Conteúdo (muito comum em B2B)

#### 25) `comment` — Comentar / Anotar

- **label_pt:** Comentar / Anotar
- **kind:** `command`
- **scope:** `single`
- **Endpoint(s) padrão:** `POST /<recurso>/{id}/comments`
- **Eventos de domínio (típicos):** `<entity>.commented` (ou `comment.created`)
- **Auditoria:** `actor`, referência do item
- **Erros comuns:** `400/422`, `401/403`, `404`, `5xx`

#### 26) `attachment_add` — Anexar arquivo

- **label_pt:** Anexar
- **kind:** `command`
- **scope:** `single|job`
- **Endpoint(s) padrão:** `POST /<recurso>/{id}/attachments` (upload direto ou URL pré-assinada)
- **Eventos de domínio (típicos):** `<entity>.attachment_added`
- **Erros comuns:** `400/413/422`, `401/403`, `404`, `5xx`

#### 27) `attachment_remove` — Remover anexo

- **label_pt:** Remover anexo
- **kind:** `command`
- **scope:** `single`
- **Endpoint(s) padrão:** `DELETE /<recurso>/{id}/attachments/{attachmentId}`
- **Eventos de domínio (típicos):** `<entity>.attachment_removed`
- **Erros comuns:** `401/403`, `404`, `409`, `5xx`

#### 28) `attachment_download` — Baixar anexo

- **label_pt:** Baixar anexo
- **kind:** `output`
- **scope:** `single`
- **Endpoint(s) padrão:** `GET /<recurso>/{id}/attachments/{attachmentId}/download`
- **Eventos de domínio:** (nenhum)
- **Telemetria:** tamanho, tipo MIME (sem dados sensíveis)
- **Erros comuns:** `401/403`, `404`, `5xx`

#### 29) `attachment_list` — Listar anexos

- **label_pt:** Listar anexos
- **kind:** `query`
- **scope:** `single`
- **Endpoint(s) padrão:** `GET /<recurso>/{id}/attachments`
- **Eventos de domínio:** (nenhum)

---

### Compartilhamento / Permissões (quando o objeto é "compartilhável")

#### 30) `share_manage` — Compartilhar / Gerenciar permissões

- **label_pt:** Compartilhar / Permissões
- **kind:** `command`
- **scope:** `single`
- **Endpoint(s) padrão:** `POST /<recurso>/{id}/share` **ou** `PUT /<recurso>/{id}/permissions`
- **Eventos de domínio (típicos):** `<entity>.permission_changed` (ou `<entity>.shared`)
- **Auditoria:** quem concedeu, para quem, nível de permissão
- **Erros comuns:** `401/403`, `404`, `409`, `5xx`

---

### Auditoria e Histórico (UI action padrão em sistemas corporativos)

#### 31) `view_history` — Ver histórico / Auditoria

- **label_pt:** Ver histórico
- **kind:** `query`
- **scope:** `single`
- **Endpoint(s) padrão:**
  - `GET /<recurso>/{id}/history` **ou**
  - `GET /domain-events?entity_type=<...>&entity_id=<...>`
- **Eventos de domínio:** (nenhum)
- **Telemetria:** abertura do painel, paginação do histórico
- **Erros comuns:** `401/403`, `404`, `5xx`

---

### Workflow (opcional por domínio, mas muito comum)

#### 32) `approve` — Aprovar

- **label_pt:** Aprovar
- **kind:** `workflow`
- **scope:** `single|bulk`
- **Endpoint(s) padrão:** `POST /<recurso>/{id}/approve`
- **Eventos de domínio (típicos):** `<entity>.approved`
- **Auditoria:** motivo/observação (quando aplicável)
- **Erros comuns:** `401/403`, `404`, `409` (estado inválido), `5xx`

#### 33) `reject` — Reprovar

- **label_pt:** Reprovar
- **kind:** `workflow`
- **scope:** `single|bulk`
- **Endpoint(s) padrão:** `POST /<recurso>/{id}/reject`
- **Eventos de domínio (típicos):** `<entity>.rejected`
- **Auditoria:** motivo (frequentemente obrigatório)
- **Erros comuns:** `401/403`, `404`, `409`, `5xx`

#### 34) `submit` — Enviar / Submeter (ex.: rascunho → em análise)

- **label_pt:** Enviar / Submeter
- **kind:** `workflow`
- **scope:** `single|bulk`
- **Endpoint(s) padrão:** `POST /<recurso>/{id}/submit`
- **Eventos de domínio (típicos):** `<entity>.submitted`
- **Erros comuns:** `401/403`, `404`, `409`, `5xx`

#### 35) `publish` — Publicar

- **label_pt:** Publicar
- **kind:** `workflow`
- **scope:** `single|bulk`
- **Endpoint(s) padrão:** `POST /<recurso>/{id}/publish`
- **Eventos de domínio (típicos):** `<entity>.published`
- **Erros comuns:** `401/403`, `404`, `409`, `5xx`

#### 36) `cancel` — Cancelar (ou Estornar, quando aplicável)

- **label_pt:** Cancelar
- **kind:** `workflow`
- **scope:** `single|bulk`
- **Endpoint(s) padrão:** `POST /<recurso>/{id}/cancel`
- **Eventos de domínio (típicos):** `<entity>.cancelled` (e/ou `<entity>.reversed`)
- **Auditoria:** motivo (frequentemente obrigatório)
- **Erros comuns:** `401/403`, `404`, `409`, `5xx`

---

### Integrações / Operações (jobs, reprocessos)

#### 37) `reprocess` — Reprocessar / Reexecutar (job/integração)

- **label_pt:** Reprocessar / Reexecutar
- **kind:** `integration`
- **scope:** `job|single`
- **Endpoint(s) padrão:**
  - `POST /jobs/{jobId}/retry` **ou**
  - `POST /<recurso>/{id}/reprocess`
- **Eventos de domínio (típicos):** `job.retried` / `integration.reprocessed` (e correlatos `job_*`)
- **Auditoria:** quem reprocessou, motivo
- **Erros comuns:** `401/403`, `404`, `409`, `5xx`

---

- **estado_item:** READY
- **owner:** (definir)
- **data_ultima_revisao:** (definir)
- **rastreia_para:** (UX-xxx, FR-xxx, DATA-xxx, NFR-xxx conforme aplicável)
- **referencias_exemplos:** (EX-API-00x, EX-OBS-00x, EX-UX-00x)

---

### UX-XXX — <Jornada/Tela/Fluxo> (Bloco padrão de ações selecionadas)

> **Instrução:** selecione ações **apenas** do catálogo `UX-010`. Copie este bloco dentro de cada `UX-XXX`.

- **Screen ID:** UX-XXX
- **Entidade(s) principal(is):** `<entity_type>` (ex.: `task`, `project`, `customer`)
- **Contexto:** (lista, detalhe, wizard, modal, etc.)

#### Ações selecionadas (do UX-010)

- **Ações disponíveis:** `[...]`
  - Ex.: `[view, filter, search, sort, paginate, create, update, delete, export]`
- **Ações em massa:** `[...]`
  - Ex.: `[bulk_select, bulk_update, export_selected]`
- **Visões alternativas:** `[...]`
  - Ex.: `[view_kanban, view_gantt]`
- **Ações opcionais por domínio:** `[...]`
  - Ex.: `[archive, unarchive, clone, view_history, comment, attachment_add, approve]`

#### Mapeamento mínimo por ação (MUST)

> Para **cada** `action_key` selecionada, preencher:

- `action_key:` (ex.: `bulk_update`)
- `kind:` (command | query | view | output | workflow | integration)
- `scope:` (single | collection | bulk | job)
- `operation_ids:` (lista obrigatória dos `operationId` do OpenAPI consumidos por esta ação, conforme `DOC-ARC-003`)
- `endpoints:` (lista das rotas HTTP acionadas)
- `domain_events:` (os eventos de domínio rastreáveis na tela; ex.: `task.updated`, `bulk.update_completed`)
- `auditoria/log:` (dados para meta do `UIActionEnvelope` — campos whitelist, contagens)
- `erros UX:` (mapeamento estrito à RFC 9457 refletindo 400/409/422/5xx conforme o padrão do DOC)

#### Observações de performance (MUST)

- Se a ação puder passar de **1s** (import/export/print/bulk grande): **usar job** (HTTP 202 + `jobId`) + polling/websocket.
- Ações com risco de retry (create/import/bulk): **suportar `Idempotency-Key`**.

---

- **estado_item:** DRAFT | REFINING | READY
- **owner:** ...
- **data_ultima_revisao:** YYYY-MM-DD
- **rastreia_para:** (FR-..., BR-..., SEC-..., NFR-..., DATA-...)
- **referencias_exemplos:** (EX-UX-00x, EX-API-00x, EX-OBS-00x)

---

---

## Metadados

- id: UX-010
- title: Catálogo de Ações Padrão (UI Events) + Reutilizáveis
- version: 1.0.0
- status: READY
- owner: design
