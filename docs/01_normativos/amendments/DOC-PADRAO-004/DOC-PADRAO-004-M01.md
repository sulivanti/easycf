> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento normativo em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-PADRAO-004-M01

- **Documento base:** [DOC-PADRAO-004](../../DOC-PADRAO-004_Variaveis_de_Ambiente.md)
- **estado_item:** MERGED
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-25
- **owner:** arquitetura
- **Motivação:** No primeiro deploy em Docker, a API não conectava ao Postgres porque `DATABASE_URL` usava `localhost` (funciona na máquina host) em vez de `postgres` (hostname do container). O mesmo ocorria com `REDIS_URL`. Necessário documentar explicitamente a diferença de hostnames entre ambientes local e Docker. Também necessário marcar `PUBLIC_REGISTRATION_ENABLED` como pendente de implementação — a variável existe mas o código não a consome.
- **rastreia_para:** DOC-PADRAO-004, DOC-PADRAO-001 §4.3

---

## Detalhamento

### Alteração 1: §3.3 e §3.4 — Hostnames Docker nas descrições

`DATABASE_URL` e `REDIS_URL` atualizados com nota explícita:

- `DATABASE_URL`: "**Em Docker:** usar hostname do container (`postgres`), não `localhost`."
- `REDIS_URL`: "**Em Docker:** usar `redis://redis:6379` (hostname do container)."

### Alteração 2: §3.12 — Hostnames em Ambientes Docker (nova seção)

Nova seção documentando a tabela de hostnames por ambiente:

| Ambiente | Host Postgres | Host Redis | Exemplo DATABASE_URL |
|----------|--------------|------------|---------------------|
| Local (sem Docker) | `localhost` | `localhost` | `postgresql://admin:pass@localhost:5432/ecf` |
| Docker Compose (dev) | `postgres` | `redis` | `postgresql://admin:pass@postgres:5432/ecf` |
| Docker Compose (prod) | `postgres` | `redis` | `postgresql://admin:pass@postgres:5432/ecf` |

**Regra:** O `docker-compose.prod.yml` DEVE sobrescrever `DATABASE_URL` e `REDIS_URL` na seção `environment` do serviço `api` para usar hostnames de container, independentemente do `.env`.

### Alteração 3: §3.10 — PUBLIC_REGISTRATION_ENABLED marcada como pendente

Descrição atualizada: "**Status: PENDENTE DE IMPLEMENTAÇÃO** — variável definida mas não consumida pelo código. O endpoint `POST /api/v1/users` é público independentemente deste valor."

---

## Impacto nos Pilares

- **Pilares afetados:** NFR (configuração), FR (env vars)
- **Módulos impactados:** MOD-000 (configuração central da API), todos os módulos em Docker
- **Ação requerida:**
  1. Verificar que `docker-compose.prod.yml` sobrescreve `DATABASE_URL` e `REDIS_URL` com hostnames de container
  2. Verificar que `.env.example` documenta ambos os formatos (local e Docker)
  3. Criar issue/pendente para implementar `PUBLIC_REGISTRATION_ENABLED` no endpoint de criação de usuários

---

## Resolução do Merge

> **Merged por:** merge-amendment (selo retroativo) em 2026-03-25
> **Versão base após merge:** DOC-PADRAO-004 v2.1.0
> **Alterações aplicadas:** §3.3/3.4 notas Docker, nova §3.12 hostnames, §3.10 PUBLIC_REGISTRATION_ENABLED pendente — conteúdo incorporado diretamente no base doc durante o primeiro deploy
