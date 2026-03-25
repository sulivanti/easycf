> ⚠️ **ARQUIVO GERIDO POR AUTOMAÇÃO.**
> - Emenda sobre documento normativo em estado READY.
> - Para novas emendas, use a skill `create-amendment`.

# Emenda: DOC-PADRAO-001-M01

- **Documento base:** [DOC-PADRAO-001](../../DOC-PADRAO-001_Infraestrutura_e_Execucao.md)
- **estado_item:** MERGED
- **Natureza:** M (Melhoria)
- **Data:** 2026-03-25
- **owner:** arquitetura
- **Motivação:** O §4 original definia apenas um Dockerfile genérico de desenvolvimento. O primeiro deploy revelou necessidade de Dockerfiles de produção multi-stage, composição com redes isoladas, healthchecks e procedimento de seed. Sem isso, a API não conectava ao Postgres em Docker (hostname `localhost` vs `postgres`), Redis não tinha healthcheck, e o seed não era executado.
- **rastreia_para:** DOC-PADRAO-001, DOC-PADRAO-004 §3.12, DOC-GNP-00 §2.1

---

## Detalhamento

### Alteração 1: §4.1 — Desenvolvimento (renomeação)

O antigo §4 ("O Dockerfile") foi renomeado para §4.1 "Desenvolvimento" para acomodar as novas seções de produção.

### Alteração 2: §4.2 — Produção — Multi-Stage Build

Novos Dockerfiles obrigatórios com 3 estágios (`deps` → `build` → `runtime`):

| Estágio | Base | Função |
|---------|------|--------|
| `deps` | `node:20-alpine` + pnpm | Instala dependências com `--frozen-lockfile` |
| `build` | `node:20-alpine` + pnpm | Compila com `tsup` (API) ou `vite build` (Web) |
| `runtime` | `node:20-alpine` (API) ou `nginx:alpine` (Web) | Apenas artefatos de build |

**Arquivos obrigatórios:** `Dockerfile.api`, `Dockerfile.web`, `nginx/web.conf`, `.dockerignore`

### Alteração 3: §4.3 — Composição de Produção (`docker-compose.prod.yml`)

Separação de redes:

| Serviço | Rede | Portas no host |
|---------|------|---------------|
| `postgres` | `internal` apenas | Nenhuma |
| `redis` | `internal` apenas | Nenhuma |
| `api` | `internal` + `proxy-nw` | `3100:3000` |
| `web` | `proxy-nw` | `8080:80` |

Healthchecks obrigatórios para `postgres` (`pg_isready`) e `redis` (`redis-cli ping`). API depende de ambos com `condition: service_healthy`.

### Alteração 4: §4.4 — Seed Inicial (Primeiro Deploy)

Procedimento de seed pós-`drizzle-kit push`:

```bash
docker compose -f docker-compose.prod.yml exec api npx tsx db/seed-admin.ts
```

Cria: tenant padrão, role `super-admin` com todas as permissões, usuário admin inicial.

---

## Impacto nos Pilares

- **Pilares afetados:** NFR (infraestrutura), FR (deploy), SEC (redes isoladas)
- **Módulos impactados:** Todos os módulos (infraestrutura é transversal)
- **Ação requerida:**
  1. Verificar que `Dockerfile.api`, `Dockerfile.web`, `nginx/web.conf`, `.dockerignore` existem
  2. Verificar que `docker-compose.prod.yml` usa redes `internal` e `proxy-nw`
  3. Verificar que healthchecks estão configurados para postgres e redis
  4. Confirmar que seed script funciona via `docker compose exec`

---

## Resolução do Merge

> **Merged por:** merge-amendment (selo retroativo) em 2026-03-25
> **Versão base após merge:** DOC-PADRAO-001 v1.1.1
> **Alterações aplicadas:** §4.1-4.4 (Docker multi-stage, redes, healthchecks, seed) — conteúdo incorporado diretamente no base doc durante o primeiro deploy
