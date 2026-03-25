# DOC-PADRAO-005 — Armazenamento em Storage: Uploads, Anexos e Arquivos

- **id:** DOC-PADRAO-005
- **version:** 1.0.1
- **status:** READY
- **data_ultima_revisao:** 2026-03-25
- **owner:** infraestrutura
- **scope:** global (storage provider-agnóstico)

---

## Introdução

Este documento normatiza **todo e qualquer armazenamento de arquivos binários** no ecossistema EasyCodeFramework: avatares de usuário, anexos de entidades de negócio, arquivos de importação/exportação e qualquer outro upload gerado por rotinas do sistema.

A arquitetura é **provider-agnóstica** (MinIO, AWS S3, Cloudflare R2, Supabase Storage) e **universalmente reutilizável** — qualquer módulo do sistema pode vincular arquivos a suas entidades sem alterar seu próprio schema de banco de dados, apenas registrando o `entity_type` no catálogo desta normativa.

---

## 1. Princípios Fundamentais

1. **Provider-agnóstico:** O sistema não acopla lógica de negócio a nenhum provider específico. Toda interação com o bucket ocorre via interface `StorageProvider`.
2. **Binário nunca passa pela API:** Uploads e downloads de arquivos ocorrem via *Presigned URL* diretamente entre o cliente e o storage provider, protegendo a API de carga desnecessária.
3. **Rastreabilidade total:** Todo arquivo possui registro na tabela `storage_objects`, com `correlation_id`, `entity_type`, `entity_id`, `uploaded_by` e histórico de status.
4. **Tenant isolation obrigatório:** O `tenant_id` é o primeiro filtro em toda query de storage. Os paths no bucket incluem o `tenant_id` como prefixo.
5. **URLs temporárias:** Nenhum arquivo privado possui URL pública permanente. Todo acesso para leitura gera uma *Signed URL* com TTL configurável.
6. **Processamento pós-upload assíncrono:** Validações pesadas (scan de vírus, resize, re-encode de imagem) ocorrem via Job assíncrono — nunca bloqueando a resposta da API.
7. **Limpeza programada:** Arquivos `pending` não confirmados (orphans) e arquivos com `expires_at` vencido são removidos por um Job de purge periódico.

---

## 2. Definições

| Termo | Definição |
|---|---|
| **Bucket** | Contêiner lógico de armazenamento no storage provider |
| **Object Key** | Caminho único do arquivo dentro do bucket (ex: `{tenant_id}/avatars/{user_id}/...`) |
| **Presigned URL** | URL temporária e autenticada gerada pelo provider para upload (`PUT`) ou download (`GET`) direto, sem passar pela API |
| **Purpose** | Categoria semântica do upload: `avatar`, `attachment`, `import`, `export`, `temp` |
| **Entity Type** | String que identifica o recurso ao qual o arquivo está vinculado (ex: `user`, `contract`, `invoice`) |
| **Orphan** | Registro em `storage_objects` com `status = 'pending'` há mais de 24h sem confirmação |
| **Signed URL** | URL temporária para acesso de leitura a um objeto privado no bucket |
| **Re-encode** | Reprocessamento de imagem para remover metadados (EXIF) e forçar formato seguro |
| **TTL** | Time-To-Live — tempo de validade de uma URL ou de um objeto temporário |

---

## 3. Requisitos, Restrições e Diretrizes

### Segurança

- **SEC-001:** O `tenant_id` DEVE ser o primeiro elemento do path no bucket: `{tenant_id}/{purpose}/{...}`.
- **SEC-002:** Presigned URLs de upload DEVEM expirar em no máximo `STORAGE_PRESIGN_TTL_SECONDS` (padrão: 300s).
- **SEC-003:** Signed URLs de download DEVEM expirar em no máximo `STORAGE_DOWNLOAD_TTL_SECONDS` (padrão: 900s).
- **SEC-004:** O backend DEVE validar `mime_type` e `size_bytes` antes de gerar a Presigned URL. A validação do binário real ocorre no Passo 3 (confirmação).
- **SEC-005:** Avatares DEVEM passar por re-encode obrigatório pós-confirmação (remoção de EXIF, conversão para WebP). Nenhum avatar original é servido ao cliente.
- **SEC-006:** Uploads do tipo `import` e `attachment` DEVEM passar por scan de segurança antes de serem acessíveis (quando `STORAGE_SCAN_ENABLED=true`). Enquanto `scan_status != 'passed'`, o objeto retorna `403` em tentativas de download.
- **SEC-007:** MIME types proibidos em qualquer `purpose`: `text/html`, `application/x-php`, `application/javascript`, `application/x-sh`, `image/svg+xml` (SVG é bloqueado exceto se re-encodado para WebP).

### Rastreabilidade

- **TRC-001:** Todo upload DEVE propagar `X-Correlation-ID` no header e armazenar o valor em `storage_objects.correlation_id`.
- **TRC-002:** Toda operação de upload ou deleção DEVE emitir um `domain_event` na tabela `domain_events` (ver §8).
- **TRC-003:** O campo `uploaded_by` DEVE referenciar o `user_id` autenticado. Para uploads de sistema (jobs), usar `null`.

### Controle de Acesso

- **ACC-001:** A operação de presign EXIGE a permissão `{entity_type}:write` do RBAC.
- **ACC-002:** A geração de Signed URL para download EXIGE `{entity_type}:read`.
- **ACC-003:** Deleção de arquivo EXIGE `{entity_type}:write` ou `storage:admin`.
- **ACC-004:** Nenhum endpoint de storage pode retornar dados de `tenant_id` diferente do token JWT.

### Constraints

- **CON-001:** O payload POST `/uploads/presign` DEVE conter `entity_type`, `purpose`, `filename`, `mime_type` e `size_bytes`.
- **CON-002:** Somente um avatar `confirmed` pode existir por `user_id` por `tenant_id`. Ao confirmar novo avatar, o anterior recebe `deleted_at = NOW()`.
- **CON-003:** Registros com `purpose = 'temp'` e `expires_at` vencido DEVEM ser removidos do bucket e marcados com `deleted_at` pelo Job de purge.
- **CON-004:** O `entity_type` DEVE ser declarado no Catálogo de Entity Types desta normativa (§10) antes de uso em produção.
- **CON-005:** O backend DEVE rejeitar `POST /uploads/presign` com `HTTP 409 Conflict` quando o número de `storage_objects` com `upload_status IN ('pending', 'confirmed')` para o par `(entity_type, entity_id)` atingir o `max_attachments` definido no catálogo §10. Erro RFC 9457: `type: /problems/attachment-limit-exceeded`.

---

## 4. Estrutura de Paths no Bucket

```text
{tenant_id}/
  avatars/
    {user_id}/
      {timestamp}_{uuid}.webp         ← versão ativa (sempre WebP após re-encode)
  attachments/
    {entity_type}/
      {entity_id}/
        {upload_id}_{sanitized_name}.{ext}
  imports/
    {job_id}/
      {sanitized_filename}.csv
  exports/
    {job_id}/
      {sanitized_filename}.xlsx
  temp/
    {session_id}/
      {upload_id}.{ext}               ← TTL: expires_at (padrão 24h)
```

> **Regra:** `sanitized_name` é o nome original do arquivo normalizado: lowercase, sem espaços (substituídos por `_`), sem caracteres especiais exceto `-` e `.`. Máximo de 100 caracteres.

---

## 5. Modelo de Dados — `storage_objects`

```sql
CREATE TABLE storage_objects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id),
  entity_type     VARCHAR(64) NOT NULL,         -- ex: 'user', 'contract', 'invoice'
  entity_id       UUID,                         -- nullable até step de confirmação (temp)
  bucket          VARCHAR(128) NOT NULL,
  object_key      TEXT NOT NULL,                -- path completo no bucket
  filename        VARCHAR(255) NOT NULL,        -- nome original sanitizado
  mime_type       VARCHAR(127) NOT NULL,
  size_bytes      BIGINT NOT NULL,
  purpose         VARCHAR(32) NOT NULL,         -- avatar | attachment | import | export | temp
  upload_status   VARCHAR(20) NOT NULL          -- pending | confirmed | orphan | deleted
                  DEFAULT 'pending',
  scan_status     VARCHAR(20)                   -- pending | passed | failed | skipped
                  DEFAULT 'skipped',
  uploaded_by     UUID REFERENCES users(id),   -- null = sistema/job
  correlation_id  UUID NOT NULL,
  expires_at      TIMESTAMPTZ,                  -- para temp e export
  deleted_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices obrigatórios
CREATE INDEX idx_storage_objects_tenant_entity
  ON storage_objects (tenant_id, entity_type, entity_id)
  WHERE deleted_at IS NULL;

CREATE INDEX idx_storage_objects_orphan_purge
  ON storage_objects (upload_status, created_at)
  WHERE upload_status = 'pending';

CREATE INDEX idx_storage_objects_expires
  ON storage_objects (expires_at)
  WHERE expires_at IS NOT NULL AND deleted_at IS NULL;
```

> Este schema DEVE ser validado pela skill `validate-drizzle-schemas` antes de gerar a migration.

---

## 6. Fluxo de Upload — Two-Step com Presigned URL

O upload segue um fluxo de **3 passos** que garante que o binário nunca passe pela API:

```text
Cliente                   API (Backend)               Storage Provider
   │                           │                              │
   │── POST /uploads/presign ──▶│                              │
   │   { entity_type,          │── Valida RBAC + tenant ──▶   │
   │     entity_id,            │── Cria storage_objects ─▶    │
   │     purpose,              │   status='pending'            │
   │     filename,             │◀─ Gera Presigned PUT URL ─────│
   │     mime_type,            │                              │
   │     size_bytes }          │                              │
   │◀─ { upload_id,            │                              │
   │     presigned_url,        │                              │
   │     expires_in: 300 } ───│                              │
   │                           │                              │
   │──── PUT {presigned_url} ────────────────────────────────▶│
   │     [binário do arquivo]  │                              │
   │◀─── 200 OK ─────────────────────────────────────────────│
   │                           │                              │
   │── POST /uploads/{id}/confirm ▶│                          │
   │                           │── verifyObjectExists() ─────▶│
   │                           │◀─ exists: true ──────────────│
   │                           │── status='confirmed'         │
   │                           │── emite domain_event         │
   │                           │── dispara jobs assíncronos   │
   │◀─ 200 { storage_object } ─│                              │
```

### 6.1 POST `/uploads/presign`

**Headers obrigatórios:** `Authorization: Bearer {jwt}`, `X-Tenant-ID`, `X-Correlation-ID`

**Request Body:**

```typescript
interface PresignRequest {
  entity_type: string;    // ex: 'user', 'contract' — deve estar no catálogo §10
  entity_id?: string;     // UUID da entidade (opcional para 'temp')
  purpose: 'avatar' | 'attachment' | 'import' | 'export' | 'temp';
  filename: string;       // nome original do arquivo
  mime_type: string;      // MIME type declarado pelo cliente
  size_bytes: number;     // tamanho em bytes
}
```

**Response 201:**

```typescript
interface PresignResponse {
  upload_id: string;      // UUID do registro em storage_objects
  presigned_url: string;  // URL para PUT direto no bucket
  expires_in: number;     // segundos de validade (ex: 300)
  object_key: string;     // path no bucket (para referência)
}
```

**Validações executadas pelo backend antes de gerar a URL:**

| Validação | Regra |
|---|---|
| RBAC | `{entity_type}:write` obrigatório |
| Tenant | `tenant_id` do JWT obrigatório |
| MIME allowlist | Verificar contra allowlist por `purpose` (ver §7) |
| Tamanho | `size_bytes` ≤ limite do `purpose` (ver variáveis de ambiente §11) |
| Entity type | Registrado no catálogo §10 |
| Limite de anexos | `COUNT(storage_objects WHERE entity_type AND entity_id AND upload_status IN ('pending','confirmed') AND deleted_at IS NULL) < max_attachments` do catálogo §10. Se violado → `409` (CON-005) |

### 6.2 PUT `{presigned_url}`

Executado diretamente pelo cliente contra o Storage Provider. A API não participa desta etapa. O provider valida a assinatura da URL.

### 6.3 POST `/uploads/{uploadId}/confirm`

**Headers obrigatórios:** `Authorization: Bearer {jwt}`, `X-Correlation-ID`

**Ações executadas pelo backend:**

1. Verificar que `storage_objects.uploaded_by = jwt.user_id` ou role `storage:admin`
2. Verificar que o objeto existe no bucket via `StorageProvider.objectExists(key)`
3. Validar tamanho real do objeto no bucket vs `size_bytes` declarado (desvio >10% → rejeitar)
4. Atualizar `upload_status = 'confirmed'`
5. Se `purpose = 'avatar'`: marcar avatar anterior com `deleted_at = NOW()`
6. Emitir `domain_event: storage.object_confirmed`
7. Disparar jobs pós-upload assíncronos (§9)

**Response 200:**

```typescript
interface ConfirmResponse {
  id: string;
  entity_type: string;
  entity_id: string;
  purpose: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  upload_status: 'confirmed';
  created_at: string; // ISO 8601
}
```

---

## 7. Allowlist de MIME Types por Purpose

| Purpose | MIME Types permitidos |
|---|---|
| `avatar` | `image/jpeg`, `image/png`, `image/webp`, `image/gif` |
| `attachment` | `application/pdf`, `image/jpeg`, `image/png`, `image/webp`, `application/zip`, `application/vnd.openxmlformats-officedocument.*`, `text/plain`, `text/csv` |
| `import` | `text/csv`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| `export` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `text/csv`, `application/pdf` |
| `temp` | Qualquer MIME listado acima |

> **Regra:** `application/octet-stream` é **sempre rejeitado**. O cliente deve declarar o MIME correto.

---

## 8. Domain Events Emitidos

Todos os eventos DEVEM incluir `correlation_id` e são armazenados na tabela `domain_events` (DATA-003, conforme DOC-ARC-003).

| Evento | Quando | Payload mínimo (sem PII) |
|---|---|---|
| `storage.upload_initiated` | Presign gerado | `upload_id, entity_type, purpose, size_bytes, correlation_id` |
| `storage.object_confirmed` | Upload confirmado | `upload_id, entity_type, entity_id, mime_type, purpose, correlation_id` |
| `storage.object_deleted` | Soft delete | `upload_id, entity_type, deleted_by_system: bool, correlation_id` |
| `storage.avatar_replaced` | Avatar anterior arquivado | `upload_id_new, upload_id_previous, user_id, correlation_id` |
| `storage.scan_passed` | Scan de vírus OK | `upload_id, scanned_at, correlation_id` |
| `storage.scan_failed` | Vírus/malware detectado | `upload_id, quarantined_at, correlation_id` |
| `storage.orphan_purged` | Job de purge executado | `upload_id, purged_at` |
| `storage.temp_expired` | TTL de temp vencido | `upload_id, expired_at` |

---

## 9. Jobs Assíncronos Pós-Upload

Seguindo o Dogma 4 (DOC-ARC-003 §1), todo processamento pesado é assíncrono:

### 9.1 Job: `storage.avatar_process`

Disparado após confirmação de upload com `purpose = 'avatar'`.

**Passos:**

1. Baixar binário original do bucket
2. Re-encode: converter para WebP, remover EXIF, aplicar limites de dimensão (máx 512×512)
3. Gerar thumbs: 32px, 64px, 128px (salvar como `{key}_32.webp`, `_{64}.webp`, `_128.webp`)
4. Substituir objeto original no bucket pelo WebP re-encodado
5. Atualizar `storage_objects.mime_type = 'image/webp'`
6. Emitir `domain_event: storage.avatar_processed`

### 9.2 Job: `storage.security_scan`

Disparado após confirmação de `purpose = 'attachment'` ou `'import'` quando `STORAGE_SCAN_ENABLED=true`.

**Passos:**

1. Baixar binário e enviar para endpoint de scan (`STORAGE_SCAN_ENDPOINT`)
2. Se resultado `clean`: atualizar `scan_status = 'passed'`, liberar acesso
3. Se resultado `infected`: atualizar `scan_status = 'failed'`, mover objeto para quarentena, emitir `storage.scan_failed`, notificar `uploaded_by`

### 9.3 Job: `storage.purge_orphans` *(recorrente — executa 1x/dia)*

**Passos:**

1. Selecionar `storage_objects WHERE upload_status = 'pending' AND created_at < NOW() - INTERVAL '24h'`
2. Deletar objeto do bucket
3. Atualizar `upload_status = 'orphan'`, `deleted_at = NOW()`
4. Emitir `storage.orphan_purged` por objeto removido

### 9.4 Job: `storage.purge_expired` *(recorrente — executa 1x/hora)*

**Passos:**

1. Selecionar `storage_objects WHERE expires_at < NOW() AND deleted_at IS NULL`
2. Deletar objeto do bucket
3. Atualizar `deleted_at = NOW()`
4. Emitir `storage.temp_expired`

---

## 10. Catálogo de Entity Types

Todo `entity_type` utilizado em uploads DEVE ser registrado nesta tabela antes de uso em produção. Novos `entity_type`s são adicionados via PR que atualiza esta seção.

| entity_type | Módulo | Purposes permitidos | max_attachments | Observações |
|---|---|---|---|---|
| `user` | Foundation (DOC-FND-000 §6) | `avatar`, `attachment` | `1` (avatar), `10` (attachment) | Avatar: único ativo por usuário; attachments: documentos pessoais |
| `tenant` | Foundation (DOC-FND-000 §6) | `attachment` | `20` | Documentos do tenant (contratos, logos, etc.) |
| `import_job` | Core | `import` | `1` | Um arquivo por job de importação |
| `export_job` | Core | `export` | `1` | Um arquivo por job de exportação |

> Módulos futuros DEVEM declarar `max_attachments` ao registrar novos `entity_type`s. Valor `0` = ilimitado (requer justificativa em ADR).

---

## 11. Endpoint Canônico — Download com Signed URL

```http
GET /uploads/{uploadId}/signed-url
Authorization: Bearer {jwt}
X-Tenant-ID: {tenant_id}
X-Correlation-ID: {correlation_id}
```

**Validações:**

- `storage_objects.tenant_id = jwt.tenant_id`
- Permissão `{entity_type}:read`
- `upload_status = 'confirmed'`
- `scan_status IN ('passed', 'skipped')` — objetos em quarentena retornam `403`
- `deleted_at IS NULL`

**Response 200:**

```typescript
{
  signed_url: string;   // URL temporária para GET direto no bucket
  expires_in: number;   // TTL em segundos (STORAGE_DOWNLOAD_TTL_SECONDS)
  filename: string;     // nome original para Content-Disposition
  mime_type: string;
}
```

---

## 12. Endpoint Canônico — Listar Arquivos de uma Entidade

Qualquer módulo pode expor anexos de suas entidades usando este padrão:

```http
GET /{resource}/{resourceId}/attachments
Authorization: Bearer {jwt}
X-Tenant-ID: {tenant_id}
```

Exemplo: `GET /contracts/uuid-contrato/attachments`

**Response 200:**

```typescript
{
  data: StorageObjectSummary[];
  meta: PaginationMeta;
}

interface StorageObjectSummary {
  id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  purpose: string;
  scan_status: string;
  uploaded_by: string | null;
  created_at: string;
  // Nunca expor: object_key, bucket, tenant_id
}
```

---

## 13. Respostas de Erro (RFC 9457)

| HTTP | `type` | Quando |
|---|---|---|
| `400` | `/problems/bad-request` | Body malformado |
| `401` | `/problems/unauthorized` | JWT inválido ou expirado |
| `403` | `/problems/forbidden` | RBAC insuficiente, tenant mismatch, ou objeto em quarentena |
| `404` | `/problems/not-found` | `upload_id` não encontrado ou não pertence ao tenant |
| `409` | `/problems/conflict` | Avatar já existe e novo ainda não foi processado |
| `413` | `/problems/payload-too-large` | `size_bytes` excede limite do `purpose` |
| `415` | `/problems/unsupported-media-type` | `mime_type` fora da allowlist do `purpose` |
| `422` | `/problems/validation-error` | Campos inválidos no body |
| `500` | `/problems/internal-error` | Falha inesperada |

Todos os erros DEVEM incluir `extensions.correlationId` propagado do `X-Correlation-ID` recebido.

---

## 14. Variáveis de Ambiente

Ver também: `DOC-PADRAO-004 §3.11`.

```dotenv
# ─── Storage Provider ───────────────────────────────────────────
STORAGE_PROVIDER=minio             # minio | s3 | r2 | supabase
STORAGE_ENDPOINT=http://localhost:9000
STORAGE_REGION=us-east-1
STORAGE_ACCESS_KEY=<PREENCHER>
STORAGE_SECRET_KEY=<PREENCHER>
STORAGE_BUCKET_NAME=app-storage
STORAGE_PUBLIC_URL=http://localhost:9000/app-storage

# ─── Limites por purpose (em bytes) ─────────────────────────────
STORAGE_MAX_AVATAR_BYTES=2097152        # 2 MB
STORAGE_MAX_ATTACHMENT_BYTES=52428800   # 50 MB
STORAGE_MAX_IMPORT_BYTES=104857600      # 100 MB
STORAGE_MAX_EXPORT_BYTES=104857600      # 100 MB
STORAGE_MAX_TEMP_BYTES=52428800         # 50 MB

# ─── TTL de URLs (em segundos) ───────────────────────────────────
STORAGE_PRESIGN_TTL_SECONDS=300         # 5 min para upload
STORAGE_DOWNLOAD_TTL_SECONDS=900        # 15 min para download

# ─── Quota por tenant (0 = ilimitado) ───────────────────────────
STORAGE_TENANT_QUOTA_BYTES=0

# ─── Scan de segurança ──────────────────────────────────────────
STORAGE_SCAN_ENABLED=false
STORAGE_SCAN_ENDPOINT=                  # ex: http://clamav:3310
```

---

## 15. Gates de Validação em CI

| Gate | Regra |
|---|---|
| **Gate STR-1** | Todo `entity_type` usado em código DEVE existir no Catálogo §10 |
| **Gate STR-2** | Nenhum endpoint de download pode retornar URL sem TTL (signed permanente proibido) |
| **Gate STR-3** | Endpoints de presign DEVEM declarar permissão `{entity_type}:write` no OpenAPI (`x-permissions`) |
| **Gate STR-4** | Nenhuma coluna `avatar_url` de texto livre pode existir em tabelas de usuário — o vínculo é feito via `storage_objects` |
| **Gate STR-5** | O campo `object_key` e `bucket` NUNCA devem aparecer em DTOs de resposta ao cliente |
| **Gate STR-6** | Todo `entity_type` no catálogo §10 DEVE ter `max_attachments` definido (valor numérico > 0 ou `0` com ADR justificando) |

---

## 16. Especificações Relacionadas

- [DOC-ARC-003 — Ponte de Rastreabilidade](./DOC-ARC-003__Ponte_de_Rastreabilidade.md) — Domain Events, Correlation ID, tenant isolation
- [DOC-PADRAO-004 — Variáveis de Ambiente](./DOC-PADRAO-004_Variaveis_de_Ambiente.md) — Configuração centralizadas (§3.11 Storage)
- [DOC-ARC-001 — Padrões OpenAPI](./DOC-ARC-001__Padroes_OpenAPI.md) — Contratos HTTP e `operationId`
- [DOC-ARC-002 — Estratégia de Testes](./DOC-ARC-002__Estrategia_Testes.md) — Cobertura de testes de integração de storage

---

**Metadados:**

- **Versão:** 1.0.1
- **Criação:** 2026-03-06
- **Status:** READY
- **Changelog:**
  - `1.0.1` (2026-03-25): §10 expandida com coluna `max_attachments` por entity_type. Nova CON-005 (rejeitar upload acima do limite). Gate STR-6. Validação de limite no fluxo presign §6.1 (DOC-PADRAO-005-C01).
  - `1.0.0` (2026-03-06): Versão inicial — cobre fluxo two-step, modelo de dados, RBAC, domain events, jobs assíncronos, allowlist MIME, paths no bucket, variáveis de ambiente e gates de CI.
