> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento normativo/requisito em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-PADRAO-002-M01

- **Documento base:** [DOC-PADRAO-002](../../DOC-PADRAO-002_Dependencias_NodeJS.md)
- **estado_item:** MERGED
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-25
- **owner:** arquitetura
- **Motivação:** Expandir §3.4 (Cache e Filas) com dependências explícitas, configuração padrão do ioredis, BullMQ como dependência core, e convenções de uso (key naming, TTL, databases). Incorpora regras da skill `redis-development` no normativo de dependências.
- **rastreia_para:** redis-development (skill), DOC-PADRAO-001 §docker (Redis 7), DOC-PADRAO-004 §3.4 (REDIS_URL)

---

## Detalhamento

### §3.4 Cache e Filas — Expansão

A seção §3.4 atual contém apenas uma linha. Esta emenda a substitui pelo seguinte bloco normativo:

---

#### 3.4.1 Cliente Redis

- **ioredis:** `ioredis@^5.x` — Cliente Redis padrão do projeto. Suporta Cluster, Sentinel, pipelining e Lua scripting.

**Configuração padrão obrigatória (singleton por processo):**

```typescript
import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    return Math.min(times * 200, 2000); // backoff até 2s
  },
  lazyConnect: true,
  connectTimeout: 5000,
  commandTimeout: 5000,
});
```

**Regras:**
- **MUST** usar `REDIS_URL` do ambiente (conforme DOC-PADRAO-004 §3.4).
- **MUST** usar instância singleton — nunca criar conexão por request.
- **MUST** configurar `retryStrategy` com backoff exponencial.
- **SHOULD** usar `lazyConnect: true` para controlar momento da conexão.
- **MUST NOT** usar `enableReadyCheck: false` em produção.

#### 3.4.2 Filas — BullMQ

- **bullmq:** `bullmq@^5.x` — Sistema de filas baseado em Redis. Dependência core para processamento assíncrono.

**Regras:**
- **MUST** reutilizar a conexão ioredis do §3.4.1 (opção `connection`).
- **MUST** nomear filas com prefixo do módulo: `{mod-NNN}:{domínio}` (ex: `mod-006:email`, `mod-008:ingest`).
- **SHOULD** configurar `defaultJobOptions.removeOnComplete` para evitar crescimento infinito.
- **MAY** adicionar `@bull-board/api` + `@bull-board/fastify` como devDependency para dashboard de debug.

#### 3.4.3 Key Naming Convention

Padrão obrigatório para todas as chaves Redis do projeto:

```
{módulo}:{entidade}:{id}[:{atributo}]
```

**Exemplos:**

| Chave | Uso |
|-------|-----|
| `mod-003:tenant:uuid` | Cache de tenant |
| `mod-000:rbac:user:uuid` | Cache RBAC por usuário |
| `mod-006:notify:job:uuid` | Job de notificação |
| `session:token-hash` | Sessão de usuário |
| `ratelimit:ip:addr` | Rate limiting por IP |

**Regras:**
- **MUST** usar `:` como separador (convenção Redis universal).
- **MUST** prefixar com módulo owner (`mod-NNN:`) exceto chaves transversais (session, ratelimit).
- **MUST NOT** usar espaços, underscores ou chaves longas (URLs inteiras, etc.).
- **SHOULD** manter chaves curtas — consomem memória.

#### 3.4.4 TTL e Políticas de Expiração

**TTL padrão por categoria:**

| Categoria | TTL | Justificativa |
|-----------|-----|---------------|
| Cache RBAC | 5 min (300s) | Balança freshness vs performance |
| Sessão | 24h (86400s) | Alinhado com JWT expiry |
| Cache geral (queries) | 1h (3600s) | Default seguro |
| Rate limiting | 1–60s | Conforme janela de rate limit |
| Jobs BullMQ (completed) | 24h | Cleanup automático |
| Locks distribuídos | 10–30s | Auto-release em caso de crash |

**Regras:**
- **MUST** definir TTL em toda chave de cache — sem exceção.
- **MUST NOT** usar `SET` sem `EX`/`PX` para chaves de cache.
- **SHOULD** usar `setex` ou equivalente atômico para garantir TTL.
- Para dados persistentes (ex: configuração), usar **MUST** com `noeviction` no database separado.

#### 3.4.5 Separação de Redis Databases

| Database | Uso | Eviction Policy |
|----------|-----|-----------------|
| db0 | Cache (RBAC, queries, geral) | `allkeys-lru` |
| db1 | Filas BullMQ | `noeviction` |
| db2 | Sessions | `volatile-ttl` |

**Regras:**
- **MUST** separar cache e filas em databases distintas para evitar eviction de jobs.
- **SHOULD** configurar `maxmemory` por instância (recomendado: 256MB para dev, sizing por ambiente em prod).
- Conexões ioredis para cada database devem ser instâncias separadas com `db` option.

#### 3.4.6 Health Check

```typescript
async function redisHealthCheck(redis: Redis): Promise<'ok' | 'degraded'> {
  try {
    const pong = await redis.ping();
    return pong === 'PONG' ? 'ok' : 'degraded';
  } catch {
    return 'degraded';
  }
}
```

- **MUST** expor health check Redis no endpoint `/health` (conforme DOC-PADRAO-001).
- **SHOULD** incluir latência do PING no payload de health.

---

## Impacto nos Pilares

- **Pilares afetados:** INT (integração), NFR (não-funcional), DATA (persistência)
- **Ação requerida:**
  - **INT:** Módulos que usam Redis (MOD-000 RBAC cache, MOD-003 tenant cache, MOD-006 email queue, MOD-008 ingestão) devem alinhar implementação com §3.4.1–3.4.5
  - **NFR:** NFR-000 §6 já define métricas Redis (`redis_cache_hits_total`, `redis_cache_misses_total`) — verificar alinhamento com §3.4.6
  - **DATA:** Nenhum schema Drizzle afetado, mas convenção de key naming (§3.4.3) deve ser documentada nos data models de módulos que usam cache

---

## Amendments Derivados

| ID | Pilar | Módulo | Natureza | Estado |
|---|---|---|---|---|
| [INT-000-M02](../../../04_modules/mod-000-foundation/amendments/int/INT-000-M02.md) | INT | mod-000 | M | DRAFT |
| [INT-006-M01](../../../04_modules/mod-006-execucao-casos/amendments/int/INT-006-M01.md) | INT | mod-006 | M | DRAFT |
| [INT-008-M01](../../../04_modules/mod-008-integracao-protheus/amendments/int/INT-008-M01.md) | INT | mod-008 | M | DRAFT |

---

## Resolução

- **Mergeado em:** 2026-03-25
- **Responsável:** merge-amendment (batch)
- **Versão base resultante:** DOC-PADRAO-002 v1.4.0
- **Ação:** §3.4 substituída integralmente por §3.4.1–3.4.6 (ioredis, BullMQ, key naming, TTL, databases, health check)
